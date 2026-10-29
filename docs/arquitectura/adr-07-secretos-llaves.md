# ADR-07 · Secretos y llaves (T-5)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5) · **Decide:** Gerente de TI (aprueba por escrito Seguridad, plan-aplicacion §3) · **Base:** D-048.4, D-035, D-047, RS-46, `plan-entornos-y-costos.md` §6; H-SEG-45, 47, 48

## Contexto
Hay cinco clases de secretos: semilla de la segunda verificación (por usuario, la cuenta es global), claves de licencia (por empresa), secreto de firma de webhooks (por empresa; hay que conocerlo para firmar, una huella no sirve), credenciales de integraciones como Microsoft (por empresa, ADR-21) y claves de API (solo se verifican). La llave no puede vivir junto a los datos que protege.

## Opciones
1. Cifrado de columnas con una llave en la base. Descartada: quien se lleva la base se lleva la llave.
2. Una llave aleatoria guardada por empresa y por usuario. Descartada: cientos de llaves que respaldar una a una.
3. **Una llave maestra externa y llaves derivadas** por propósito y alcance. Elegida.

## Decisión
- **Llave maestra** (`MASTER_ENCRYPTION_KEY` + `_VERSION`) en el almacén de secretos del alojamiento; **nunca** en la base, el código, los respaldos ni los registros. Cada entorno tiene la suya; la de desarrollo es de relleno y **producción se niega a arrancar con ella**. Solo la tienen los procesos que cifran o descifran (`web` y `trabajador`); **la consola de plataforma no la recibe** (ADR-01), de modo que quienes administran la plataforma no pueden abrir ningún valor cifrado.
- **Derivación** con HKDF-SHA-256: `llave = HKDF(maestra[versión], info = "plataformati/v1/<propósito>/<alcance>")`, una cadena fija con versión y campos de largo conocido (el alcance es un UUID en minúsculas con guiones, o la palabra `global`), para que dos combinaciones distintas nunca produzcan la misma cadena (H-SEG-48). Propósitos: `licencia` y `webhook` (alcance = empresa), `integracion_graph` (empresa, ADR-21), `segundo_factor` (usuario), `exportacion` (empresa), `auditoria_copia` (global, resumen de la copia externa, ADR-11), `huella_entorno` (global, ver guarda de arranque) y `pepper:<tipo>` para las huellas de nivel A (ADR-09). El valor de un correo de acceso **ya no** necesita un propósito propio: nace en el trabajador (ADR-08).
- **Cifrado** AES-256-GCM con nonce aleatorio de 96 bits. Formato guardado: `v<versión>.<nonce>.<cifrado>`, con **datos asociados** `tabla|columna|id_fila|empresa` para que un valor copiado a otra fila o empresa no se descifre. Para objetos grandes (exportaciones de hasta ~10 MB, ADR-19) se cifra **por bloques de 1 MiB**, cada uno con su nonce y con datos asociados que incluyen el número de bloque y una marca de "último": en GCM la etiqueta de autenticidad solo se comprueba al final del mensaje, así que descifrar un archivo de un solo golpe entregaría texto sin autenticar mientras se envía; por bloques, cada pedazo se comprueba antes de salir y un bloque quitado o reordenado se detecta.
- **Rotación** anual y ante sospecha: se agrega una versión nueva, se lee con la versión guardada, un trabajo recifra por lotes (idempotente) y se **retira** la vieja cuando no queda nada vivo con ella. Sin detener el servicio.
- **Versiones retiradas (H-SEG-47):** una versión retirada **no se destruye**: se archiva en la custodia (los mismos dos lugares y dos custodios) hasta que expire el último respaldo que contiene valores cifrados con ella (30 diarios y 12 mensuales, D-032). Sin eso, restaurar un respaldo anterior a la rotación deja sin abrir las claves de licencia y las semillas. Rotar **no protege** los respaldos antiguos si la rotación fue por una filtración: siguen cifrados con la llave filtrada hasta que expiren; se anota en el procedimiento de incidente. El ensayo de restauración abre un valor de cada tipo de un respaldo anterior a una rotación.
- **Dónde se guardan:** los secretos van en **columna aparte** (`*_cifrado`, `version_llave`, y la `mascara` calculada al escribir según D-035.3), nunca dentro del JSON de campos personalizados (ADR-17). El secreto de un webhook se muestra una sola vez y admite rotación con traslape. Las **claves de API** se guardan como huella de nivel B (SHA-256, alta entropía, al menos 128 bits) con un identificador público propio: **no dependen de la llave maestra** (ADR-09).
- **Tipo `Secreto` en código:** un envoltorio cuyo `toString`, `toJSON` y representación de depuración devuelven `[secreto]`. Los servicios reciben y devuelven `Secreto`, no `string`. Las llaves derivadas son `Buffer` que se **pone a cero** al terminar su uso y **no se guardan** en cachés ni en variables de módulo (H-SEG-48). Solo la biblioteca estándar de Node para las primitivas (`node:crypto`), con pruebas de vectores conocidos de HKDF (RFC 5869) y de AES-GCM.
- **`AUTH_SECRET`:** en la v1 **no existe**. Las sesiones son identificadores opacos con huella (ADR-08), no tokens firmados. Si H6b conserva Auth.js como capa de proveedores externos (INT-3), esa librería exige un secreto propio para firmar su cookie de estado; entonces se declara con ese único uso, separado de la maestra, y entra a la rotación anual con aviso (H-SEG-48). Nunca firma sesiones ni enlaces de este sistema.
- **Revelar** una clave exige `licencias.ver_clave` (sensible), verificación reciente **con el autenticador** (ADR-08), tope de 20 por usuario por hora y auditoría sin el valor (D-035.4).
- **Respaldo de las llaves** por separado, en dos lugares y con dos custodios (DevOps, §6.3); `BACKUP_ENCRYPTION_KEY` es distinta de la maestra.
- **Guarda de arranque:** además de rechazar la llave de relleno, la aplicación calcula una **huella corta** de la llave derivada con el propósito `huella_entorno` (nunca de la maestra misma) y se niega a arrancar en producción si coincide con la de otro entorno (plan 6.5 d).

### Qué pasa si se pierde o se filtra la maestra (H-SEG-45; corrige el supuesto del escenario A del plan 6.7)
| Caso | Se pierde / queda expuesto | Sigue funcionando | Qué se hace |
|---|---|---|---|
| **A. Pérdida** (sin copia de la custodia) | Claves de licencia, secretos de webhook, credenciales de integraciones, semillas de la segunda verificación, resultados de exportación pendientes, copia de los resúmenes de auditoría | **Códigos de recuperación y claves de API** (huella de nivel B, sin llave), llaves físicas, sesiones de plataforma | Cada persona vuelve a configurar su segunda verificación con su **código de recuperación**; las claves de licencia se reingresan; todos vuelven a pedir enlace (huellas de nivel A) |
| **B. Filtración** | Todo lo cifrado con esa versión, **incluidos los respaldos de esa época** | Claves de API y códigos de recuperación (no dependen de la maestra) | Versión nueva, recifrado, versión anterior archivada, rotación del pepper (invalida sesiones, enlaces e invitaciones vivos); los respaldos antiguos siguen expuestos hasta que expiren |

## Consecuencias
- Perder la llave maestra **y** su custodia hace irrecuperables las claves de licencia aunque exista el mejor respaldo; por eso se prueba en cada restauración de ensayo. Ya no deja a nadie sin poder reenrolarse (antes sí: ver H-SEG-45).
- Una sola maestra es un punto único de compromiso: se mitiga con almacenamiento externo, dos custodios, rotación y que la consola no la reciba.
- Dar de baja una empresa borra sus valores cifrados; no hay "destrucción de llave" por empresa (se deriva de la maestra). Los respaldos conservan esos valores cifrados hasta expirar (misma postura que todos los datos personales en respaldos; se anota en el aviso de privacidad).
- **Costo:** solo si el gestor de secretos elegido es de pago (muy bajo, ya incluido en el escalado D2). Archivar versiones retiradas no agrega gasto.

## Qué prueba lo valida
- **H9 (obligatoria desde esta revisión, sección 6 de la ronda 5 de Seguridad):** derivación con vectores conocidos; cifrar/descifrar con llaves derivadas; un valor movido a otra fila o a otra empresa **no** se descifra; un bloque de exportación quitado o reordenado se detecta; rotación v1 a v2 pequeña sin interrumpir lecturas (los 10.000 valores quedan como medida deseable).
- Prueba automática que busca secretos y semillas en el repositorio, en la base volcada, en la cola, en los registros técnicos y en las exportaciones (junto con RS-51, ADR-09).
- Guarda de arranque: producción con llave de relleno, o con huella igual a la de otro entorno, no arranca.
- Prueba de restauración de ensayo: la llave guardada aparte abre la copia, y un respaldo anterior a una rotación abre un valor de cada tipo con la versión archivada.
- Ensayo de pérdida (condición 5 de la ronda 4, corregida por Seguridad): sin la maestra, una persona vuelve a configurar su segunda verificación con su código de recuperación.
- Prueba de que el proceso de la consola no contiene la maestra.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-45 (alta) | Incorporado en ADR-09 (dos niveles de huella) y aquí: claves de API y códigos de recuperación no dependen de la maestra; tabla de pérdida y filtración. |
| H-SEG-47 | Incorporado: versiones retiradas archivadas hasta que expire el último respaldo; ensayo de restauración anterior a la rotación. |
| H-SEG-48 | (1) `info` fija y versionada, (2) `AUTH_SECRET` declarado, (3) `Buffer` puestos a cero y sin cachés, (4) vectores conocidos y solo `node:crypto`, (5) guarda por huella corta de entorno: **incorporados los cinco**. |
| H-SEG-46 | Ya no hace falta el propósito `correo_efimero` que Seguridad ofrecía como opción (a): se eligió que el valor nazca en el trabajador (ADR-08). |
| H-SEG-42 | La maestra no está en la consola (condición 3 de la ronda 4). |
| H-SEG-56 (2) | Cifrado por bloques para objetos grandes. |
| ADR-21 | Nuevo propósito `integracion_graph`. |

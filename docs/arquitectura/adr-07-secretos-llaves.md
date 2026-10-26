# ADR-07 · Secretos y llaves (T-5)

**Estado:** Propuesto · **Decide:** Gerente de TI (aprueba por escrito Seguridad, plan-aplicacion §3) · **Base:** D-048.4, D-035, D-047, RS-46, `plan-entornos-y-costos.md` §6

## Contexto
Hay cuatro clases de secretos: semilla de la segunda verificación (por usuario, la cuenta es global), claves de licencia (por empresa), secreto de firma de webhooks (por empresa; hay que conocerlo para firmar, una huella no sirve) y claves de API (solo se verifican). La llave no puede vivir junto a los datos que protege.

## Opciones
1. Cifrado de columnas con una llave en la base. Descartada: quien se lleva la base se lleva la llave.
2. Una llave aleatoria guardada por empresa y por usuario. Descartada: cientos de llaves que respaldar una a una.
3. **Una llave maestra externa y llaves derivadas** por propósito y alcance. Elegida.

## Decisión
- **Llave maestra** (`MASTER_ENCRYPTION_KEY` + `_VERSION`) en el almacén de secretos del alojamiento; **nunca** en la base, el código, los respaldos ni los registros. Cada entorno tiene la suya; la de desarrollo es de relleno y **producción se niega a arrancar con ella**.
- **Derivación** con HKDF-SHA-256: `llave = HKDF(maestra[versión], info = propósito | alcance_id)`. Propósitos: `licencia` y `webhook` (alcance = empresa), `segundo_factor` (alcance = usuario), `exportacion` (empresa), `pepper:<tipo>` para huellas (ADR-09).
- **Cifrado** AES-256-GCM con nonce aleatorio de 96 bits. Formato guardado: `v<versión>.<nonce>.<cifrado>`, con **datos asociados** `tabla|columna|id_fila` para que un valor copiado a otra fila no se descifre.
- **Rotación** anual y ante sospecha: se agrega una versión nueva, se lee con la versión guardada, un trabajo recifra por lotes (idempotente) y se retira la vieja cuando no queda nada con ella. Sin detener el servicio.
- **Dónde se guardan:** los secretos van en **columna aparte** (`*_cifrado`, `version_llave`, y la `mascara` calculada al escribir según D-035.3), nunca dentro del JSON de campos personalizados (ADR-17). El secreto de un webhook se muestra una sola vez y admite rotación con traslape. Las claves de API se guardan como huella (alta entropía, al menos 128 bits) con un identificador público propio.
- **Tipo `Secreto` en código:** un envoltorio cuyo `toString`, `toJSON` y representación de depuración devuelven `[secreto]`. Los servicios reciben y devuelven `Secreto`, no `string`; así un registro técnico o una respuesta de API no lo imprimen por descuido.
- **Revelar** una clave exige `licencias.ver_clave` (sensible), reautenticación reciente, tope de 20 por usuario por hora y auditoría sin el valor (D-035.4).
- **Respaldo de las llaves** por separado, en dos lugares y con dos custodios (DevOps, §6.3); `BACKUP_ENCRYPTION_KEY` es distinta de la maestra.

## Consecuencias
- Perder la llave maestra hace irrecuperables las claves de licencia aunque exista el mejor respaldo; por eso se prueba en cada restauración de ensayo.
- Una sola maestra es un punto único de compromiso: se mitiga con almacenamiento externo, dos custodios y rotación.
- Dar de baja una empresa borra sus valores cifrados; no hay "destrucción de llave" por empresa (se deriva de la maestra).
- **Costo:** solo si el gestor de secretos elegido es de pago (muy bajo, ya incluido en el escalado D2).

## Qué prueba lo valida
- H9: cifrar/descifrar con llaves derivadas; un valor movido a otra fila **no** se descifra; rotación v1 a v2 de 10.000 valores sin interrumpir lecturas.
- Prueba automática que busca secretos y semillas en el repositorio, en la base volcada, en la cola, en los registros técnicos y en las exportaciones (junto con RS-51, ADR-09).
- Guarda de arranque: producción con llave de relleno no arranca.
- Prueba de restauración de ensayo: la llave guardada aparte abre la copia (D-048.4).

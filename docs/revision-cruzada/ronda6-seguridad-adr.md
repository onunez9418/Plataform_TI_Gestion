# Ronda 6: Especialista en Seguridad. Verificación de los 30 hallazgos en los ADR y revisión de ADR-21, 22 y 23

**Fecha:** 2026-10-29 · **Alcance:** `docs/arquitectura/` (README, prototipo-tecnico y ADR 01 a 23) y `docs/equipo/decisiones.md` D-087 a D-101. No hay código: todo es revisión de diseño.
**Cómo leer:** "Hecho" = se comprueba en el archivo y la línea citados (`ADR-03:59` = ADR-03, línea 59). "Opinión" = mi juicio de riesgo. Estados: **cerrado** (el texto del ADR hace lo que pedí), **parcial** (hace una parte o deja un hueco concreto), **abierto**. Gravedades: crítica, alta, media, baja. Los hallazgos nuevos siguen la numeración y empiezan en **H-SEG-63**.
**Cómo verifiqué:** leí completos los ADR 01, 02, 03, 04, 07, 08, 09, 10, 11, 12, 13, 16, 19, 20, 21, 22, 23 y el prototipo; busqué con Grep los nombres de función entre ADR-04 y ADR-23; leí de ADR-14, 15 y 18 solo los pasajes de mis observaciones; no reabrí ADR-05, 06 ni 17 (no tenían hallazgos míos). Comprobé el registro de permisos (PS-247) y el plan de DevOps 6.7. **No** leí `asistente-ia.md` ni `microsoft-entra-intune.md` (el Analista los ajusta). **No pude consultar la documentación de Microsoft** (la red lo bloqueó): lo que digo de permisos de Graph es de mi conocimiento, sin verificar.

---

## 1. Resumen

- De los 30 hallazgos de la ronda 5: **27 cerrados, 2 parciales (H-SEG-38 y H-SEG-46) y 1 abierto por diseño (H-SEG-57, espera a Cumplimiento y no se construye).**
- De los 4 **altos**: H-SEG-33, 45 y 54 **cerrados**. **H-SEG-46 queda parcial**: el principio quedó resuelto (el valor del correo no pasa por la cola), pero faltan cuatro condiciones de texto que no estaban en mi lista original porque la variante es nueva. **Avalo la variante** (sección 3).
- **Hallazgos nuevos: 16 (H-SEG-63 a 78): 0 críticos, 0 altos, 11 medios, 5 bajos.** Ninguno obliga a rehacer una decisión; son texto de ADR y casos de prueba.
- **El prototipo técnico puede arrancar** con tres condiciones de papel (sección 8). Ninguna necesita al CEO ni cuesta dinero.

---

## 2. Verificación de los 30 hallazgos (con el pasaje)

| ID | Grav. | Estado | Pasaje donde queda corregido | Observación |
|---|---|---|---|---|
| H-SEG-33 | **Alta** | **Cerrado** | ADR-03:59 (`app_plataforma` y `app_soporte` solo `SELECT` en `autorizacion_soporte`; alta, uso y revocación por funciones), 60 (disparador: solo `revocada_en` y `primera_vez_usada_por`, de nulo a valor), 61 (el creador no puede ser la persona designada). ADR-04:14 ("escribir directamente en **ninguna** tabla"), 51 y 53 (`registro_plataforma` y `purga_acta` solo agregar). ADR-23:24-26 (disparador anti UPDATE/DELETE/TRUNCATE; aprobadores de purga identificados por la función desde la sesión). Pruebas: ADR-03:90, ADR-23:59 | Falta que la lista de funciones esté completa (H-SEG-38) |
| H-SEG-34 | Media | Cerrado | ADR-04:72 y ADR-03:52 (regla general: "ninguna función acepta un identificador como prueba de quién llama"); ADR-03:65 (`soporte_usar(huella_sesion_plataforma, ...)`); ADR-23:16 | Una excepción: `enlace_ingreso_emitir(id)` (ADR-08:26) se apoya solo en un identificador; se trata en H-SEG-46 |
| H-SEG-35 | Media | Cerrado | ADR-03:64-66: tres pasos (escritura atómica con `UPDATE ... RETURNING`, luego solo lectura, luego consultas). Prueba "dos personas a la vez, gana una": ADR-03:90 y prototipo H2 caso 10 | - |
| H-SEG-36 | Media | Cerrado (D-087) | ADR-03:15-18 (texto honesto de qué protege y qué no; regla de código), 55 y 73-74 (sexto rol `app_soporte`, riesgo residual declarado, plan B por escrito); ADR-04:15 y 20; ADR-14:33 (prueba de CI sin SQL crudo) | Mejora de defensa en capas: H-SEG-68 |
| H-SEG-37 | Media | Cerrado | (a) ADR-11:13 (cuarto autor `plataforma`, en el `CHECK`, motivo obligatorio). (b) `registro-permisos.md` v1.3: PS-247 `empresa.autorizar_soporte`, sensible n.º 55 (D-094). (c) ADR-03:71 y ADR-19:12 y 21 (soporte no exporta) | ADR-10:23 y :34 quedaron con texto viejo ("se pide al Analista", "51 sensibles"): H-SEG-78 |
| H-SEG-38 | Media | **Parcial** | Lista ampliada en ADR-04:76-83 y control de dos personas dentro de la base en ADR-23:16-21 | Siguen faltando en la lista cerrada (hecho, Grep en ADR-04): `rescate_vetar` (ADR-23:30, la ejecuta `app_empresa`); `purga_acta_marcar_intencion` (ADR-23:43, la llama `mantenimiento`); las funciones con que el trabajador emite el valor de **invitación, acceso de emergencia y aprobación del contacto** (solo existe `enlace_ingreso_emitir`); la validación de la sesión de plataforma en cada petición de la consola (`sesion_validar` es de `app_empresa` y `app_plataforma` no puede ejecutar funciones de la aplicación, ADR-04:30 (5)); quién ejecuta el "trabajo mensual" que crea particiones (ADR-11:18) si `crear_particion_auditoria` es de `app_plataforma` (ADR-04:81); quién escribe en el almacén externo la constancia de congelaciones (ADR-12:14) si la consola no tiene `ANON_REGISTRY_*` (ADR-01:21); `congelacion_activa(empresa_id)` en ADR-04:77 frente a `(empresa_id, persona_id)` en ADR-23:47; con qué privilegios una función de plataforma encola un correo dentro de su transacción (ADR-23:19) si `app_plataforma` no toca `cola`. La prueba de CI falla ante cada una (ADR-04:85): el atajo será relajar la lista. **Se cierra completando la tabla antes del día 1 del prototipo (H11 compara la matriz).** |
| H-SEG-39 | Media | Cerrado | ADR-03:32 y ADR-04:22-30: `REVOKE ... FROM PUBLIC`, `search_path = pg_catalog, pg_temp` con objetos calificados (más estricto que lo pedido), `REVOKE CREATE ON SCHEMA public`, sin `ALTER DEFAULT PRIVILEGES`, ningún rol superusuario ni BYPASSRLS (los seis), matriz rol por función con la fila `PUBLIC` | - |
| H-SEG-40 | Media | Cerrado | ADR-11:18 (función `crear_particion_auditoria(mes)` con `FORCE`, política, disparadores y sin permisos para la aplicación) y :21; ADR-03:37 y :85 (5) (`has_table_privilege` falso sobre cada partición) | Quién ejecuta el trabajo mensual: dentro de H-SEG-38 |
| H-SEG-41 | Media | Cerrado | ADR-03:85: los cinco casos (índices únicos con `empresa_id`, sin vistas materializadas ni copias, política exacta, `NULLIF` en `app_empresa_actual()` ADR-03:28, particiones) | - |
| H-SEG-42 | Media | Cerrado (D-089) | ADR-01:14-24: tres servicios, tabla de credenciales por proceso con guarda de arranque; la consola sin `DATABASE_URL` ni `MASTER_ENCRYPTION_KEY`; prueba ADR-01:44 | El costo del tercer servicio es del CEO por D-089; no es materia mía |
| H-SEG-43 | Media | Cerrado (D-092) | ADR-11:35-36 (copia sin `ip` ni `motivo`, resumen con llave, cadena sobre la fila completa), :62 (prueba con canario); ADR-04:96 (frase corregida) | Dos textos distintos del mismo mecanismo: H-SEG-77 |
| H-SEG-44 | Media | Cerrado en texto; lo valida H7 | ADR-02:16-18 (envoltorio que normaliza el error y descarta `detail`, `where` y parámetros; sin DML libre sobre `cola`), :41 (prueba con correo canario); ADR-04:60; ADR-20:13 y :31 | Riesgo de ejecución: graphile-worker usa funciones SQL que corren con los permisos de quien llama, y entonces `app_empresa` necesitaría permisos sobre sus tablas. El ADR ya dice "si necesita DML directo, se vuelve a mesa" (ADR-02:16); H7 lo decide |
| H-SEG-45 | **Alta** | **Cerrado** | ADR-09:21-22 y :24 (dos niveles; `NIVEL_DE_HUELLA[tipo]`; claves de API de 128 bits y códigos de recuperación de 100 bits con SHA-256 separado por tipo, sin la maestra), :46 (prueba de entropía y de "sin llamada a la maestra"), :50 y :57 (ensayo de pérdida); ADR-07:19 y :29-30 (tabla de pérdida y filtración) | **Acepto descartar `scrypt`**: a 100 bits aleatorios la fuerza bruta contra SHA-256 es inviable y se evita CPU en un punto sin autenticar (mi texto ofrecía las dos salidas). Fuera de los ADR: el plan 6.7 (DevOps, línea 662) ya dice que el código "es una huella y no depende de la llave", que ahora **es cierto**; DevOps debe rescribir "qué no se recupera" (las claves de API ya no se pierden) |
| H-SEG-46 | **Alta** | **Parcial** | ADR-08:21-30, ADR-09:27, ADR-02:16, ADR-16:25, ADR-23:21 | Ver sección 3 |
| H-SEG-47 | Media | Cerrado | ADR-07:18 (versión retirada archivada hasta que expire el último respaldo; ensayo con respaldo anterior) y :42 | Fuera de los ADR: el procedimiento de incidente v0.3 no lleva todavía la nota "una filtración de la maestra deja expuestos los respaldos hasta que expiren" (Grep sin coincidencias). Lo anota Cumplimiento con el Líder del incidente |
| H-SEG-48 | Baja | Cerrado | ADR-07:15 (`info` fija y versionada), :20 (`Buffer` a cero, sin cachés, vectores conocidos, solo `node:crypto`), :21 (`AUTH_SECRET` no existe en la v1), :24 (huella de entorno) | - |
| H-SEG-49 | Baja | Cerrado | ADR-09:41-45 (control positivo en texto, URL y JSON; salidas de envíos, cola con fallidos y errores; ruta redactada; sin recursos de terceros); ADR-20:14; ADR-08:30 (riesgo residual del alojamiento) | - |
| H-SEG-50 | Media | Cerrado | ADR-08:16 (`__Host-`, `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/`, sin `Domain`; prueba); ADR-01:28 (CSP con *nonce*, `frame-ancestors 'none'`, HSTS, `nosniff`; `no-referrer` y `no-store` en el botón "Entrar" y en descargas) | Ningún documento define CORS para la API pública: pregunta en H-SEG-78 |
| H-SEG-51 | Media | Cerrado (diseño) | ADR-08:38-45: sesión `plataforma` distinta, cookie `__Host-psid`, solo llave física, 15 min y 4 h, verificación con llave por acción (también ADR-23:17) | Pendiente declarado en ADR-08:43: alta de nuevas personas (Seguridad y DevOps antes de la Etapa 1) |
| H-SEG-52 | Media | Cerrado (D-088) | ADR-08:36 (solo el segundo factor actualiza `verificada_en`); ADR-10:24 (prueba: todo permiso con control `R` es sensible); ADR-07:22; ADR-19:12 | **Confirmo la precisión de D-088** (un código de recuperación re-registra el autenticador pero no renueva la verificación por sí solo) con la condición de H-SEG-76 |
| H-SEG-53 | Baja | Cerrado | ADR-08:30 (aviso de inicio de sesión con navegador y sistema, sin IP; regreso solo a rutas internas), :33 (semilla sin confirmar no vale), :49 (módulo propio compacto) | - |
| H-SEG-54 | **Alta** | **Cerrado** | ADR-19:21: `POST`; sesión, empresa de la dirección, `solicitante_membresia_id` igual a quien descarga, membresía activa, `datos.exportar` vigente, sin soporte; "el identificador no es una credencial"; `UPDATE ... WHERE descargado_en IS NULL AND vence_en > ahora` **antes** de enviar; borrado inmediato; `no-store`, `attachment`, `nosniff`, nombre sin datos personales. Pruebas: ADR-19:41, H12 | Dos detalles menores en H-SEG-78 |
| H-SEG-55 | Media | Cerrado | ADR-19:13 (`exportacion_solicitud`, la carga lleva solo el identificador) y :19 (el trabajador recomprueba con la membresía solicitante; falla con motivo, no recorta; excluye derechos de datos) | - |
| H-SEG-56 | Media | Cerrado | ADR-19:20 (tablas `sin_soporte`, sin permisos de plataforma, bloques de 1 MiB con datos asociados, sin archivos temporales, una exportación activa por usuario, tope de bytes por empresa, falla explícita, alarma a las 25 h); ADR-07:16 (por qué por bloques); ADR-19:33 (respaldos conservan el texto cifrado) | Pendiente de Cumplimiento: aviso de privacidad y la lectura de D-022. El tope de 100 MB lo mide H12 |
| H-SEG-57 | Media | **Abierto por diseño** | ADR-19:22 y :52: pregunta abierta con propuesta de partida; "este paso no se construye todavía" | Es el tratamiento que pedí. Espera a Cumplimiento y al Arquitecto; no bloquea nada |
| H-SEG-58 | Baja | Cerrado | ADR-19:17 (huella SHA-256 del archivo, Personas distintas, eventos de descarga y de vencimiento sin descarga) y :43 | - |
| H-SEG-59 | Media | Cerrado | ADR-13:22 (lista cerrada de campos que comprometen, incluye moneda, impuesto, descuentos, datos de pago del proveedor, condiciones y dirección de entrega; prueba de arquitectura de columna sin clasificar) y :43 | - |
| H-SEG-60 | Media | Cerrado | ADR-13:20 (solo agregar con el disparador de la auditoría; índice único `(empresa_id, cuenta_usuario_id)`; participación también para quien creó la clave de API) y :43 | - |
| H-SEG-61 | Baja | Cerrado | ADR-13:25 (disparador que rechaza pasar a "Aprobada") y :43 (prueba "también con SQL directo") | - |
| H-SEG-62 | Media | Cerrado | ADR-23:45-49 (congelación en la base; `anonimizar` y ambas purgas la consultan; pospone **toda** purga de particiones); ADR-11:47 (la purga rechaza con congelación vigente); ADR-12:22 (b); pruebas ADR-23:60 | Aprobada la decisión de posponer toda partición (es lo conservador). Dos mejoras en H-SEG-64 y 65 |

**Altos:** H-SEG-33, 45 y 54 cerrados. H-SEG-46 parcial (sección 3).

**Condiciones de D-093 (tablas globales):** firmo la lista de **18 tablas globales** (ADR-04:37-56). De las siete condiciones que puse: 33, 39, 40, 42, 43 y 44 quedaron escritas; la 38 está parcial. La firma queda **condicionada a cerrar H-SEG-38**.
**Condición de D-092:** confirmo la derivación `auditoria_copia` (ADR-07:15) y que la tarea de copia recibe solo lo que dice ADR-01:24. Con la reserva de H-SEG-77.

---

## 3. H-SEG-46: la variante del Arquitecto

### 3.1 ¿La avalo? Sí, con cuatro condiciones escritas

- **Hecho:** la variante cumple mis cuatro criterios originales: nada en claro en la cola ni en trabajos fallidos (ADR-08:24-27, ADR-02:16), sin reintentos después de vencer el enlace (ADR-08:27, ADR-16:25), RS-51 recorre la cola con fallidos, los envíos y los mensajes de error (ADR-09:41, ADR-08:60) y no queda trabajo muerto con carga útil.
- **Hecho:** las dos razones del Arquitecto para descartar mis opciones (a) y (b) son verdaderas en el texto de ADR-01: la opción (a) obliga a que quien encola tenga la llave maestra (ADR-01:21: la consola no la tiene y debe crear invitaciones y accesos de emergencia, ADR-23:21), y la (b) rompe la vía única de envío con reintentos y segundo proveedor (ADR-16:25-26).
- **Opinión:** la variante es mejor que mis dos opciones. Mi ronda 5 enumeró dos salidas y no vio la tercera; lo reconozco.

### 3.2 Las cinco comprobaciones del Gerente (D-091)

| # | Pregunta | Respuesta | Estado |
|---|---|---|---|
| 1 | ¿Qué impide que un proceso distinto del trabajador (la web) ejecute `enlace_ingreso_emitir(id)` y obtenga un valor válido para un correo ajeno? | **Hecho: nada en la base.** La función está en la lista de `app_empresa` (ADR-04:76), y la web y el trabajador entran con ese **mismo rol** aunque con direcciones de conexión distintas (ADR-01:19-20 y :27). Un identificador de fila (UUID v7, no secreto) basta como credencial. Quien controle la web (o un SQL inyectado con `app_empresa`) puede elegir un valor, fijar su huella y consumirlo desde su navegador. **Opinión:** no es peor que el diseño anterior, donde la web también conocía el valor; pero tampoco es lo que pide la regla de ADR-04:72. | **Abierta** |
| 2 | Al reintentar, ¿solo vale el último correo, sin ventana con dos enlaces válidos? | **Parcial.** El texto dice que el reintento "reemplaza la huella anterior" (ADR-08:26) y no que la comprobación y el reemplazo sean **una sola sentencia condicional** (existe, no vence, no consumido). Sin eso, un consumo que llegue entre la lectura y el reemplazo puede perderse o dejar dos vigentes. Tampoco hay tope de emisiones por fila ni se dice si los 15 minutos cuentan desde el pedido o desde la emisión. | **Parcial** |
| 3 | Si el envío falla después de emitir, ¿queda algún valor guardado? | **El valor, no: nace en memoria (ADR-08:26).** Sí queda su **huella**, que ante un fallo definitivo debe anularse (ADR-08:27 dice "marcando el envío como no enviado", no que se anule la huella). Sin eso, un correo que el proveedor sí entregó aunque reportó error sigue siendo válido 15 minutos: aceptable, pero debe ser decisión escrita. | **Parcial** |
| 4 | ¿La prueba RS-51 recorre la cola con trabajos fallidos, el registro de envíos y los mensajes de error? | **Sí en el texto:** ADR-09:41 (cola "con trabajos fallidos y reintentados", envíos y errores), ADR-09:42 (control positivo triple), ADR-08:60, prototipo H6 y H8 (líneas 27 y 30). Falta pedir que el falso proveedor de correo **falle después de emitir y devuelva un error que contenga el cuerpo del mensaje** (algunos clientes HTTP lo hacen); si no, la prueba no ejercita el camino peligroso. | **Cerrada**, con una adición de prueba (P5) |
| 5 | ¿La invitación del primer administrador y el acceso de emergencia, creados desde la consola sin la llave maestra, siguen el mismo camino? | **En principio sí:** ADR-23:21 (la consola solo crea la fila `por_emitir`) y ADR-08:28. **En concreto no está escrito:** ADR-04 solo lista `enlace_ingreso_emitir`; no hay función del trabajador para emitir la invitación (que vive en `invitacion`, tabla de empresa), el acceso de emergencia ni el valor de un solo uso del contacto autorizado (ADR-23:30). Tampoco se dice en qué tabla vive la fila `por_emitir` del acceso de emergencia. | **Parcial** (H-SEG-38) |

### 3.3 Las cuatro condiciones (texto de ADR; las decide el Gerente de TI)

1. **Quién puede emitir.** Dos cuentas de ingreso a la base para el mismo rol de grupo `app_empresa`: una para `web` y otra para `trabajador` (la dirección de conexión ya es distinta en ADR-01:19-20). `EXECUTE` de las funciones de emisión solo para la cuenta del trabajador. No cambia la cantidad de roles de D-087 (son cuentas miembros, sin permisos nuevos). **Alternativa si el Gerente no la quiere:** dejar escrito en ADR-04 y en el riesgo residual que "la web comprometida puede emitir valores", con prueba que lo registre, igual que ADR-03:73 hace con `set_config`.
2. **Emisión atómica y acotada.** Una sola sentencia `UPDATE ... SET huella = $2, emitido_n = emitido_n + 1 WHERE id = $1 AND consumido_en IS NULL AND vence_en > ahora AND emitido_n < 3 RETURNING ...`. Los 15 minutos cuentan desde el **pedido** (así una cola atrasada no alarga la ventana); se dice por escrito.
3. **Fallo definitivo anula la huella** y marca "no enviado". Una fila `por_emitir` (huella nula) no se puede consumir con ningún valor, incluida la cadena vacía.
4. **Completar la lista** de ADR-04 con las funciones de emisión de invitación, acceso de emergencia y aprobación del contacto (H-SEG-38 y H-SEG-63), todas con la misma regla.

**Si se escriben las cuatro, bajo H-SEG-46 de Alta a Media y la cierro cuando H6 pase las pruebas de abajo.**

### 3.4 Qué prueba del prototipo la valida (H6, con apoyo de H7 y H8)

H6 ya trae lo esencial (prototipo línea 27: el valor no aparece en `cola.*`, ni en tablas, ni en registros, sí en el correo; el reintento reemplaza la huella). **Casos que pido agregar a H6** (marcados con P):

- **P1.** La web, con su cuenta de base, intenta ejecutar `enlace_ingreso_emitir`, la emisión de invitación y la de acceso de emergencia: rechazo y evento de seguridad (condición 1).
- **P2.** Dos trabajadores toman el mismo trabajo (entrega duplicada): sale un correo por cada uno, entra solo el último valor, nunca hay dos huellas vigentes.
- **P3.** `kill -9` al trabajador entre emitir y enviar (se combina con H7): al reiniciar sale un correo nuevo con un valor nuevo; el anterior no entra.
- **P4.** Emitir sobre una fila consumida o vencida, o por cuarta vez: rechazo.
- **P5.** Proveedor de correo falso que falla después de emitir y lanza un error con el cuerpo del mensaje: tras el fallo final, el valor tiene 0 apariciones en `cola.*` (con fallidos), registro de envíos, mensajes de error, registro de la aplicación y monitor simulado; la huella queda anulada.
- **P6.** Una fila `por_emitir` no se consume con ningún valor.
- **P7.** Invitación del primer administrador y acceso de emergencia creados con las credenciales de la `consola`: el proceso `consola` nunca conoce el valor; aparece solo en el correo capturado.
- **P8.** Correo existente e inexistente: misma respuesta y tiempo dentro del margen (ADR-08:61); con inexistente no sale correo.
- **Criterio de fracaso de H6 (ya está):** el valor del enlace en la cola. **Añadir:** cualquiera de P1 a P7 en rojo.

---

## 4. ADR-23: acciones de plataforma con dos personas y congelación (hallazgos nuevos)

**Lo que está bien (hecho):** las funciones reciben la huella de la sesión de plataforma y deducen la persona (ADR-23:16); exigen llave física en los últimos 10 minutos (:17); el control de dos personas vive en la función y en un `CHECK` (:25); todo rechazo escribe evento de seguridad (:20); el registro es solo agregar (:24); la purga rechaza sin marca externa, sin dos aprobadores y con congelación (:43); el uso del acceso de emergencia se limita a uno por semana con bloqueo de fila (:33).

**H-SEG-63 · MEDIA · El "contacto autorizado" como segunda persona no tiene un camino definido.**
- **Hecho:** el rescate, el acceso de emergencia y la congelación admiten al contacto como segunda persona (ADR-23:30, :33, :46) "mediante un valor de un solo uso que nace en el trabajador". Pero la regla común exige una sesión de plataforma con llave física (:16-17), que el contacto no tiene, y ADR-04:81 da esas funciones solo a `app_plataforma`. No se dice qué función recibe el valor, con qué cuenta de base, qué nivel de huella tiene, a qué acción queda atado, ni qué antigüedad debe tener el contacto.
- **Riesgo (opinión):** es el eslabón más débil del control de dos personas: una persona de plataforma más un clic en un correo. Si se puede cambiar el contacto y usarlo enseguida, una cuenta de plataforma comprometida se fabrica su propia segunda persona.
- **Cambio:** función propia ejecutada por la cuenta del trabajador; valor de un solo uso, huella de nivel A, **atado al identificador de la acción** y al correo registrado, con 15 minutos de vida; el contacto debe estar confirmado desde hace al menos 24 horas **antes** de la solicitud; cambiar el contacto es una acción sensible con aviso a todos los administradores de la empresa y espera propia. Excluir esta ruta de la rebanada de H2 del día 2 o definirla antes.
- **Quién:** Arquitecto; Analista confirma RF-PLA-011.

**H-SEG-64 · MEDIA (opinión) · No se dice si una congelación declarada pero no confirmada ya protege.**
- **Hecho:** ADR-23:46 "se declara (persona A) y se confirma (persona B)"; la vigencia es `desde <= ahora AND hasta IS NULL` (:27), sin mencionar la confirmación.
- **Riesgo:** en un incidente la protección tarda lo que tarde la segunda persona; con una sola persona de plataforma, nunca (:53).
- **Cambio:** que **declarar** tenga efecto inmediato y provisional (por ejemplo 72 horas), porque pausar es la dirección segura y reversible, y que **confirmar** la haga firme; **levantarla** exige dos, como está. Se escribe y se prueba.
- **Quién:** Arquitecto; Cumplimiento revisa con el procedimiento (C.5.2).

**H-SEG-65 · BAJA · La congelación se hace cumplir por código en dos de los cuatro sitios.**
- **Hecho:** las purgas son funciones con dueño `migraciones` y rechazan dentro de la base. En cambio `anonimizar` es SECURITY INVOKER (ADR-04:79) y `app_empresa` tiene `UPDATE` sobre `persona_pii`; una ruta de código que escriba la fila directamente no pasa por la comprobación. Los borrados por plazo dependen de que cada trabajo esté en `BORRADO_POR_PLAZO` (ADR-23:47): la prueba verifica que los listados consultan, pero nada detecta un trabajo de borrado que no esté en la lista.
- **Cambio:** (1) disparador en `persona_pii` y en las demás tablas del mapa de ADR-12:17 que rechace la **transición a anonimizada** mientras `congelacion_activa`; (2) clasificación obligatoria de cada tipo de trabajo (`borrado_por_plazo`, `vida_tecnica`, `otro`), con CI que falla ante uno sin clasificar (el mismo patrón de H-SEG-59); (3) una sola firma de `congelacion_activa` en ADR-04 y ADR-23.
- **Quién:** Arquitecto, Ingeniero de Datos.

**H-SEG-66 · MEDIA · `registro_plataforma` y `purga_acta` solo se protegen con disparadores de la propia base.**
- **Hecho:** la copia externa encadenada cubre `auditoria` (ADR-11:34-36), no los registros de plataforma. El procedimiento de incidente manda mirar `registro_plataforma` cuando la causa es una cuenta de plataforma, y ADR-11:54 reconoce que con acceso total a la base la auditoría solo es "detectable" gracias a la copia.
- **Riesgo (opinión):** quien tenga la cuenta dueña de la base o el acceso del proveedor puede alterar sin rastro justo el registro de las acciones más sensibles (rescate, emergencia, congelación).
- **Cambio:** incluir `registro_plataforma`, `purga_acta` y `accion_plataforma` (estados terminales) en la copia externa con la misma cadena. No contienen datos personales de las empresas. Es una tabla más para la tarea de copia.
- **Quién:** Arquitecto, DevOps.

**H-SEG-67 · MEDIA · Acciones de una sola persona con efecto irreversible o de dinero.**
- **Hecho:** `asistente_texto_libre_levantar` y `asistente_interruptor_cambiar` las ejecuta **una persona** con llave física (ADR-23:38). La primera abre el envío de descripciones y comentarios de casos de una empresa a un proveedor externo; ADR-22:71 dice que "lo ya enviado no se puede retirar". La segunda escribe también el **tope global de gasto** (ADR-22:64), que el CEO fija.
- **Riesgo (opinión):** un solo acceso comprometido (o una sola persona de mala fe) activa un flujo de datos irreversible de una empresa que no lo consintió, o sube el gasto sin pasar por el CEO. D-086.4 decidió quién lo levanta; no pidió dos personas.
- **Cambio, para que el Gerente lo reconsidere:** (1) levantar el texto libre exige dos personas de plataforma **y** el consentimiento registrado de un administrador de la empresa (o, como mínimo, aviso previo a los administradores y espera de 24 horas); (2) el tope global no se puede subir por encima del valor aprobado por el CEO: ese techo vive en configuración fuera de la base y subirlo es un cambio de publicación, no una función; apagar el interruptor sigue siendo de una persona.
- **Quién:** Gerente de TI decide; Arquitecto escribe; si cambia lo que la empresa consiente, pasa por Cumplimiento.

---

## 5. Lectura de soporte: una mejora de defensa en capas

**H-SEG-68 · MEDIA (opinión) · Una consola comprometida con `app_soporte` lee cualquier empresa, tenga o no autorización.**
- **Hecho:** ADR-03:73 declara que una consola comprometida "podría, con SQL propio, cambiar `app.empresa_id` y leer otra empresa". `app_soporte` tiene `SELECT` en todas las tablas no `sin_soporte` (ADR-04:15) y la barrera por fila depende solo de esa variable, no de que exista una autorización viva.
- **Riesgo:** el consentimiento de la empresa (24 horas, revocable) protege contra el abuso de una persona, no contra el robo de la credencial `SOPORTE_DATABASE_URL`.
- **Cambio, barato:** a cada tabla de negocio, la macro le agrega una política **`AS RESTRICTIVE TO app_soporte`** con `USING (soporte_autorizada(empresa_id))`, donde la función `STABLE` mira `autorizacion_soporte` (vigente, no revocada, ya usada). Debe ser **restrictiva**: las permisivas se suman con O (ADR-03:85 (3)) y una permisiva no restringiría nada. Así una consola comprometida alcanza solo las empresas con autorización viva. H10 mide el costo. No bloquea el prototipo; H2 puede medirlo junto con la diferencia entre `app_soporte` y la variante de respaldo.
- **Quién:** Arquitecto, Ingeniero de Datos.

---

## 6. ADR-21: Microsoft Graph (hallazgos nuevos)

**Lo que está bien (hecho):** aplicación registrada **por empresa** en su propio Microsoft, no una de plataforma (ADR-21:11): el daño de una filtración se limita a una empresa y no hay secreto único de plataforma; credencial cifrada con `integracion_graph` (:21), `sin_soporte`, sin máscara; la consola no la puede ver (no tiene la maestra); solo permisos de **aplicación**, nunca delegados (:20); comprobación de permisos en **cada lectura**, con lista permitida y rechazo de cualquiera de más (:25), lo que protege a la empresa si la credencial se filtra; dos direcciones fijas, sin campo para escribir una dirección, sin seguir redirecciones (:30-31); nunca una transacción abierta mientras se espera a Microsoft (:38); barrera de "más de la mitad desaparecida" (:39); cuerpos de Graph no se registran (:33); contenido de terceros como datos, no instrucciones (:55); nada de escritura ni acción remota (:58). Confirmo que las tablas con nombres y correos sean `sin_soporte` (:51).

**H-SEG-69 · MEDIA · La reserva del directorio puede usarse para ocupar o para sondear.**
- **Hecho:** `directorio_microsoft_reservar(huella)` rechaza un directorio ya conectado a otra empresa (ADR-21:24). El identificador de un directorio (tenant) se puede deducir del dominio de una empresa, como el propio ADR reconoce. No se dice **en qué momento** se reserva: antes o después de demostrar que se controla ese directorio.
- **Riesgo:** si se reserva antes de probar la credencial, un administrador de cualquier empresa puede (a) ocupar el directorio de otra empresa cliente (negación de servicio a su conexión) y (b) saber qué directorios están conectados a la plataforma, es decir, quiénes son clientes (el rechazo no dice a qué empresa, pero sí que existe).
- **Cambio:** reservar solo **después** de obtener un token válido para ese directorio con las credenciales entregadas (prueba de control); reserva en estado pendiente con vencimiento de 1 hora; mensaje idéntico para "ocupado" y "credencial inválida"; liberar al desconectar, al fallar la conexión y al dar de baja o suspender la empresa de forma definitiva (`directorio_microsoft_liberar()` no recibe parámetros: se aplica a la empresa del contexto).
- **Quién:** Arquitecto.

**H-SEG-70 · MEDIA · Cliente propio: faltan los límites duros que lo hacen seguro.**
- **Decisión que me tocaba (D-100, condición 1): avalo el cliente propio** con `fetch` directo (ADR-21:32) frente a la librería oficial: evita una cadena de dependencias grande y el tráfico a dos direcciones fijas es fácil de auditar. La condición es lo que sigue.
- **Hecho:** el ADR prueba cuerpos enormes y enlaces hostiles en el simulador (:70) pero el diseño no fija los topes.
- **Cambio:** (1) tamaño máximo del cuerpo de cada respuesta y de cada corrida; (2) máximo de páginas y de filas por corrida (un directorio hostil o enorme no debe llenar la base: termina "Completada con avisos"); (3) tope a la espera que indique `Retry-After` (una cabecera de años no puede dormir un trabajo); (4) `@odata.nextLink` comparado **sobre la dirección ya analizada** (esquema `https`, nombre de servidor exacto, sin usuario ni puerto, ruta que empiece con la versión esperada), no por prefijo de texto; (5) el trabajador es el único proceso que sale a Microsoft: lista de salidas permitidas en el alojamiento (DevOps).
- **Quién:** Arquitecto, DevOps.

**H-SEG-71 · BAJA · Lectura del token sin verificar firma: lo avalo con condiciones; la lista de permisos no la firmo todavía.**
- **Hecho:** ADR-21:25 lee la lista de permisos concedidos (`roles`) del token que Microsoft entrega por conexión cifrada a una dirección fija, sin verificar su firma, solo para decidir si activa la conexión. Microsoft considera esos tokens opacos para el cliente (de mi conocimiento, sin verificar hoy): el formato puede cambiar.
- **Opinión:** es aceptable porque el canal es TLS a un destino fijo y falla hacia el lado seguro ("Pendiente de consentimiento"). Condiciones: (1) antes de construir, una prueba con un directorio de prueba real, sin datos de personas (si necesitara pagar licencias, es dinero y lo informa la Jefatura); D-085.4 ya manda volver a mesa si no se puede; (2) si el formato cambia, la conexión se detiene y avisa, no se activa sin comprobar.
- **Lista de partida que yo propondría (a verificar contra la documentación vigente, que no pude consultar):** lectura de usuarios, lectura de equipos administrados de Intune, lectura de datos de la organización y, opcional, lectura de miembros de grupos. **Rechazar** todo `ReadWrite`, `Directory.Read.All` (más amplio de lo necesario), operaciones privilegiadas sobre equipos y `Application.*`. **Hecho a declarar:** el permiso de lectura de usuarios no se puede acotar por campo; el `$select` limita lo que pedimos, pero quien robe el secreto de una empresa lee todos los campos de sus usuarios. Es el daño máximo de una filtración y debe figurar en el aviso de la pantalla de conexión.
- **Quién:** Seguridad firma la lista tras verificar; Arquitecto.

---

## 7. ADR-22: asistente de IA (hallazgos nuevos)

**Lo que está bien (hecho):** el modelo no recibe nada que no salga de tres fuentes y todo pasa por el servidor (ADR-22:32); proyección declarada por herramienta con **una sola lista de sensibilidad** compartida con la exportación y prueba de arquitectura (:34); personas solo como `PRS-0042` (:34); la empresa no es parámetro de ninguna herramienta, se ejecuta con la membresía de la persona y se recomprueba el permiso al ejecutar (:35); topes de filas y llamadas por turno (:36); texto libre de casos apagado por defecto y marcado `no_confiable` cuando viaja (:37); sin estado de conversación en el servidor (:29); nunca una transacción abierta esperando al modelo (:28); solo texto en la salida, sin imágenes, HTML ni enlaces libres (control 6, :50); doble control intacto (control 5, :49); proveedor simulado "malicioso por diseño" en CI (:92); la clave del modelo solo en `web` y la consola sin ella (ADR-01:19-21); el canario del control 10 se declara como alarma y no como defensa (:54), y la instrucción "no obedezcas los datos" no se cuenta como control (:57). Los controles 1, 2, 4 a 9 y 11 son estructurales y los avalo. Los dos puntos débiles están abajo.

**H-SEG-72 · MEDIA · La promesa "el modelo nunca recibe nombres" es más grande que lo que el diseño garantiza.**
- **Hecho:** D-101 la lee "nunca recibe nombres **que salgan de la base**". ADR-22:34 prohíbe los campos **marcados** como personales y la prueba de proyecciones falla ante un campo marcado (:93). Pero hay texto libre que puede llevar un nombre y no está marcado: nombre o alias del activo, descripciones, ubicaciones ("Oficina de ..."), y lo que trae Microsoft, cuyo nombre de equipo y usuario principal se guardan en claro (ADR-21:51; el nombre de un equipo suele ser `LAPTOP-JPEREZ`). ADR-11:24 ya trata los comentarios y descripciones libres como datos personales; el asistente no.
- **Riesgo (opinión):** una promesa a Cumplimiento y a un abogado que el diseño no sostiene. También viaja información comercial (precios, contratos, proveedores) cuando la persona tiene permiso; el contrato y el aviso deben decirlo, no solo hablar de datos personales.
- **Cambio:** (1) proyección por **lista permitida** de campos de tipo cerrado (códigos, estados, categorías, fechas, cantidades, importes con permiso); el texto libre no entra, o entra solo declarado y en el canal `no_confiable`; (2) la prueba siembra canarios en nombre, alias y descripción del activo y en el nombre de un equipo del simulador de Microsoft; (3) Cumplimiento reformula: "el asistente no recibe datos de la tabla de Personas; puede recibir texto que alguien escribió en otros campos" y menciona la información comercial.
- **Quién:** Arquitecto, Cumplimiento.

**H-SEG-73 · MEDIA · Dos puertas por donde una instrucción oculta puede ganar confianza.**
- **Hecho:** (a) El control 3 dice que una propuesta "solo nace si la persona la pidió" (ADR-22:47), pero el servidor no entiende el mensaje: quien llama a la herramienta de propuesta es el modelo, y una orden escondida en un dato que el modelo leyó en ese mismo turno puede hacerlo. (b) Sin estado en el servidor, el historial lo reenvía el navegador (:29): el texto de turnos anteriores del asistente, que puede repetir contenido no confiable, entra después como texto **del asistente**, ya sin la marca `no_confiable`.
- **Riesgo (opinión):** acotado, porque toda propuesta exige un clic en una tarjeta armada con datos reales (control 4) y el asistente nunca aprueba ni exporta. Pero la tarjeta es justo donde un empleado cansado confirma. La defensa de (a) hoy es una frase, no una estructura.
- **Cambio:** (a) **marca de contaminación por turno**: cuando entra cualquier resultado `no_confiable`, las herramientas de propuesta se retiran para el resto de ese turno; o la propuesta nace solo de un control de la interfaz (botón "preparar borrador"), no de texto libre. (b) El servidor envuelve el historial del asistente como contexto no verificado o elimina citas literales de datos. Casos nuevos en la suite: IO-15, un dato con una orden y un mensaje que no pide borrador (0 propuestas); IO-16, una instrucción plantada que sobrevive al turno siguiente por el historial.
- **Quién:** Arquitecto, QA. Antes de pasar ADR-22 a "Aceptado" (D-101), no antes del prototipo.

**H-SEG-74 · MEDIA · "El gasto máximo queda acotado por construcción" tiene cuatro huecos.**
- **Hecho:** la reserva antes de llamar y la liquidación después (ADR-22:61) es correcta como idea. No se dice: (a) qué pasa con una reserva si el proceso muere antes de liquidar (el monto queda sumado todo el mes); (b) a cuánto se liquida cuando el proveedor no informa consumo, por error o por cancelación a mitad del flujo (:27); (c) qué pasa si la tabla de tarifas queda desfasada (:62): el tope en dinero se incumple sin que nada lo vea; (d) una sola empresa puede agotar el tope global y apagar el asistente de todas (:64).
- **Riesgo (opinión):** la promesa al CEO es dinero. Con estos huecos es verdadera "salvo que algo falle", y el ADR dice "por construcción".
- **Cambio:** (a) reservas individuales con vencimiento y un barrido que las liquida al máximo; (b) ante duda, liquidar al máximo reservado, nunca a cero; (c) **un segundo muro independiente de nuestro código**: tope de gasto duro en la cuenta del proveedor, igual o menor al tope global aprobado por el CEO (lo configura quien tenga la cuenta, DevOps lo verifica); (d) el tope de cada empresa es una fracción del global, o el global se reparte. Mientras (c) no exista, ADR-22 y la hoja del CEO no deben decir "por construcción".
- **Quién:** Arquitecto, DevOps; el valor del tope sigue siendo del CEO.

**H-SEG-75 · BAJA · Tablas del asistente sin clasificar y texto viejo en ADR-03.**
- **Hecho:** ADR-22 crea `asistente_propuesta` (guarda parámetros validados, que pueden llevar texto escrito por la persona o redactado por el modelo) y `asistente_consumo`, sin decir si son `sin_soporte` ni si entran al mapa de datos personales (ADR-12:17). ADR-03:55 todavía lista como `sin_soporte` "conversaciones del asistente", que ya no existen (:29).
- **Cambio:** `asistente_propuesta` `sin_soporte`, con marca `pii:` y vencimiento de 10 minutos aplicado por la base (no solo por un trabajo); quitar "conversaciones" de ADR-03.
- **Quién:** Arquitecto.

---

## 8. Transversales

**H-SEG-76 · MEDIA · El flujo del código de recuperación no está descrito.**
- **Hecho:** ADR-08:33 solo dice que hay 10 códigos de un solo uso, de 100 bits. D-088 aclara que sirven para volver a registrar el autenticador. No hay un solo pasaje que diga qué se exige además del código, cuántos intentos, qué pasa con la semilla anterior y los demás códigos, ni a quién se avisa.
- **Riesgo (opinión):** el código de recuperación es, en todo sistema con segundo factor, la puerta lateral. Con D-088 la verificación reciente "no se renueva con el código", pero re-registrar el autenticador y verificar con el nuevo equivale a lo mismo en la práctica; la protección es la del código, no la del autenticador.
- **Cambio:** el ingreso exige además una sesión iniciada por enlace (o el enlace del momento); intentos limitados con el limitador (falla cerrada); usar un código **anula la semilla anterior** y marca el código; aviso por correo a la persona en el momento ("se usó un código de recuperación") y evento de seguridad; si quedan menos de 3 códigos, se pide generar nuevos. Para plataforma el respaldo es la segunda llave (ADR-08:40), sin códigos.
- **Quién:** Arquitecto; QA agrega la prueba.

**H-SEG-77 · BAJA · Dos textos del mismo mecanismo de la copia externa.**
- **Hecho:** D-092 dice "resumen con llave (HMAC) de la fila completa". ADR-11:35-36 dice un resumen con llave **de `ip` y de `motivo` por separado** más una cadena SHA-256 sin llave sobre la fila completa.
- **Opinión:** conviene la versión de D-092: cadena con llave, `HMAC(llave_copia, cadena_anterior || fila completa)`, y **sin** resúmenes separados de `ip` y `motivo`. Una IP tiene pocos valores posibles; su resumen guardado en un almacén que no se puede borrar sería reversible si se filtra la maestra. La cadena con llave sigue detectando cualquier alteración.
- **Quién:** Arquitecto; Cumplimiento lo confirma al revisar D-092.

**H-SEG-78 · BAJA · Detalles.**
1. `siguiente` es INVOKER y fija la empresa con `set_config` (ADR-15:13). Si alguien la llama dentro de una transacción de `conEmpresa` con otra empresa, el contexto del resto de la transacción cambia. Que falle si ya hay una empresa fijada y es distinta.
2. ADR-19:21: el borrado ocurre "al terminar la descarga"; si la conexión se corta, el texto cifrado queda hasta 24 horas. Borrar en `finally` y que el programador barra los resultados en estado `descargado`. Y añadir `solicitante_membresia_id` al `WHERE` de la actualización atómica.
3. ADR-10:23 sigue diciendo que se pide `empresa.autorizar_soporte` y ADR-10:34 habla de 51 sensibles; el registro ya tiene PS-247 y 55 sensibles.
4. ADR-08:26 no deja claro si emitir son una o dos llamadas (condición 2 de la sección 3.3 lo resuelve).
5. Ningún documento define CORS para la API pública con claves. Por defecto cerrado; que ADR-01 lo diga y lo pruebe.
6. Fuera de los ADR: para pasar los ADR de "Propuesto" a "Aceptado" Cumplimiento debe confirmar H-SEG-43 y 56 (y definir H-SEG-57), y DevOps debe rescribir el plan 6.7 (ver H-SEG-45).

---

## 9. ¿Puede arrancar el prototipo técnico?

**Sí.** Ningún ADR queda rechazado y las tres cosas que importan para el aislamiento (H-SEG-33, 35, 36) están cerradas. ADR-21 y ADR-22 no son del prototipo: son de la Fase 3 y nada se construye antes de la Etapa 7 (D-100 y D-101). ADR-23 entra en H2 y H3 en una "rebanada".

**Condiciones (todas de texto de ADR y de lista de pruebas; ninguna toca al CEO ni cuesta dinero):**

| Cuándo | Condición | Quién |
|---|---|---|
| **Antes del día 1** | Completar la lista cerrada de funciones (H-SEG-38: ocho omisiones), porque H11 compara la matriz rol × función con ADR-04 | Arquitecto, Ingeniero de Datos |
| **Antes del día 2** | Definir o excluir por escrito de la rebanada de H2 la ruta del contacto autorizado (H-SEG-63) y la vigencia de una congelación solo declarada (H-SEG-64) | Arquitecto |
| **Antes del día 3** | Escribir las cuatro condiciones de H-SEG-46 (sección 3.3), o que el Gerente decida por escrito aceptar el riesgo residual de la condición 1; agregar P1 a P8 a H6 | Arquitecto; Gerente de TI decide la condición 1 |

**Cambios que pido a la lista de pruebas del prototipo (además de P1 a P8):**
- **H2:** rebanada de ADR-23 con aprobación por contacto (si se incluye); caso de `app_soporte` con política restrictiva (H-SEG-68) como medición.
- **H3:** copia externa que incluya `registro_plataforma` (H-SEG-66) si se acepta.
- **H7:** `app_empresa` encolando desde una función DEFINER de plataforma (¿con qué privilegios?, H-SEG-38) y `last_error` / `output` con el error normalizado.
- **H8:** el mínimo del día 3 ya debe incluir P5 (falla después de emitir con el cuerpo en el error).
- **H11:** el caso "trabajo de borrado sin clasificar" (H-SEG-65) y "columna de proyección del asistente marcada personal" quedan para la Fase 3.

**Lo que no bloquea y sigue su camino:** H-SEG-57 (Cumplimiento); H-SEG-66 a 78 se resuelven durante el prototipo o antes de que cada ADR pase a "Aceptado". ADR-22 no puede pasar a "Aceptado" sin H-SEG-72 a 74 y sin que QA y yo revisemos la suite IO-01 a IO-14 (D-101); no vi esa suite, está en el módulo.

---

## 10. Estado de los ADR que me tocan firmar

| ADR | Mi postura |
|---|---|
| 01, 02, 07, 09, 10, 12, 13, 16, 19, 20 | Aprobado. Detalles menores en H-SEG-78 |
| 03, 04 | Aprobado con una condición: H-SEG-38 (lista completa). Mejora recomendada: H-SEG-68 |
| 08 | Aprobado cuando se escriban las cuatro condiciones de H-SEG-46 y el flujo de H-SEG-76 |
| 11 | Aprobado; reconciliar H-SEG-77 |
| 21 | Aprobado con condiciones: H-SEG-69, 70, 71 |
| 22 | **No aprobado todavía**: H-SEG-72, 73, 74 (y 75 como detalle). La arquitectura es buena; lo que falta son afirmaciones que hoy no se sostienen |
| 23 | Aprobado con condiciones: H-SEG-63, 64, 66, 67 (65 como mejora) |

---

## Nota para la Jefatura de Proyecto

1. **Verificación:** de mis 30 hallazgos, 27 cerrados, 2 parciales (H-SEG-38, 46) y 1 abierto por diseño (H-SEG-57, espera a Cumplimiento). Los altos 33, 45 y 54 cerrados.
2. **H-SEG-46 (variante del Arquitecto):** la avalo; es mejor que mis dos opciones. Le faltan cuatro condiciones de texto (quién puede emitir, emisión atómica y acotada, anular la huella al fallar, completar las funciones). La valida H6 con los casos P1 a P8.
3. **Nuevos (H-SEG-63 a 78):** 16 hallazgos, 0 altos, 11 medios, 5 bajos. Los más importantes: contacto autorizado sin camino definido (63), promesa del asistente sobre nombres (72) y "gasto acotado por construcción" (74).
4. **ADR-21 y ADR-23:** aprobados con condiciones. **ADR-22 aún no** (72, 73, 74). No pude consultar la documentación de Microsoft; la lista de permisos de Graph no está firmada.
5. **Prototipo:** **puede arrancar**. Antes del día 1 completar la lista de funciones (H-SEG-38); antes del día 3 escribir las condiciones de H-SEG-46.
6. **Decisiones para el Gerente de TI:** cuentas de base distintas para web y trabajador (46), dos personas para levantar el texto libre y techo del tope global fuera de la base (67), congelación provisional inmediata (64).
7. **Al CEO:** nada nuevo. Siguen siendo suyos el proveedor y los topes del asistente, el contrato y el costo del tercer servicio (ya escalados).
8. Informe: `/home/user/Plataform_TI_Gestion/docs/revision-cruzada/ronda6-seguridad-adr.md`.

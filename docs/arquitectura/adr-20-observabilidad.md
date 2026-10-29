# ADR-20 · Registros técnicos sin datos personales ni secretos (T-14)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5) · **Decide:** Gerente de TI (con DevOps y Seguridad) · **Base:** D-055 T-14, D-048.4, D-030.6, RF-DAT-008, H-ARQ-24(g); H-SEG-44, 49

## Contexto
Los registros técnicos y el monitor de errores salen de la base y a menudo del control de la empresa. Si contienen correos, nombres, claves o enlaces de ingreso, se convierten en la fuga que se evitó en la base.

## Decisión
- Un solo registrador (`nucleo/observabilidad`, estructurado, por ejemplo `pino`) con **redacción central** aplicada **antes de enviar** a ningún destino: la lista cerrada de campos personales (D-030.6), los campos secretos y los valores de entrada (cabeceras de autorización, cookies, enlaces, códigos).
- **Nunca** se registran cuerpos de petición ni respuesta; se registran método, ruta con `slug` de empresa, identificador de membresía y de petición, código y duración.
- El envío al monitor de errores usa el mismo depurador (`beforeSend`); no se envían variables locales ni parámetros de consultas.
- Tipo `Secreto` (ADR-07): su representación es `[secreto]` en cualquier registro.
- **Errores normalizados (H-SEG-44):** el mismo envoltorio de `nucleo/cola` (ADR-02) convierte todo error a tipo, código y mensaje fijo antes de registrarlo o enviarlo al monitor, y descarta `detail`, `where` y los parámetros de la consulta. El redactor por **campos** no basta: un error de clave duplicada de PostgreSQL trae el valor dentro del texto.
- **Rutas con valor de entrada (H-SEG-49):** la ruta de un enlace de ingreso o invitación se redacta (`/acceso/enlace/[redactado]`) antes de llegar al registro de la aplicación. Lo que escriba el alojamiento en sus propios registros de acceso queda como riesgo residual de vida corta (15 minutos, un solo uso, atado al navegador), que DevOps anota.
- Las respuestas del modelo y los mensajes del asistente (ADR-22) y los cuerpos de respuesta de Microsoft Graph (ADR-21) **no se registran**: solo identificadores, conteos de tokens, códigos y duraciones.
- Los errores devueltos al cliente son los **tres mensajes** del catálogo (no encontrado, sin permiso, regla); los detalles quedan solo en el registro con identificador de petición.
- Alertas a **una persona con nombre** y su suplente (DevOps): latido del trabajador, antigüedad de la cola, trabajos muertos, corrida diaria faltante, tiempo de entrega del correo de acceso, divergencia de la copia de auditoría.

## Opciones descartadas
- Registrar todo y filtrar al leer: el dato ya salió.
- Un registro de depuración con cuerpos "solo temporal": se olvida y es el mayor origen de fugas.

## Consecuencias
- Depurar exige reproducir con datos inventados; es consistente con "copias de producción a pruebas: prohibido".
- Una lista de redacción incompleta es un defecto: se revisa al abrir cada etapa junto con la lista de campos personales.

## Qué prueba lo valida
- Nombre canario, correo, secreto y enlace sembrados: ninguno aparece en la salida del registrador ni en el evento enviado al monitor (prueba de integración con el monitor simulado), incluso cuando ocurre un error con la entidad en pantalla.
- Servicios con error no pegan el cuerpo de la petición en el registro (prueba de humo).
- Prueba de RS-51 (ADR-09) incluye la salida de registros, de envíos de correo y de mensajes de error.
- Una violación de clave única con un correo canario dentro de una petición no deja el correo en el registro ni en el monitor simulado.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-44 | Incorporado: errores normalizados en el registrador y en el monitor. |
| H-SEG-49 | Incorporado: ruta redactada y salidas ampliadas de la prueba RS-51. |
| ADR-21, ADR-22 | Regla de no registrar cuerpos de Microsoft ni del modelo. |

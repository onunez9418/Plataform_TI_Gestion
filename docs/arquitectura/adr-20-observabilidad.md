# ADR-20 · Registros técnicos sin datos personales ni secretos (T-14)

**Estado:** Propuesto · **Decide:** Gerente de TI (con DevOps y Seguridad) · **Base:** D-055 T-14, D-048.4, D-030.6, RF-DAT-008, H-ARQ-24(g)

## Contexto
Los registros técnicos y el monitor de errores salen de la base y a menudo del control de la empresa. Si contienen correos, nombres, claves o enlaces de ingreso, se convierten en la fuga que se evitó en la base.

## Decisión
- Un solo registrador (`nucleo/observabilidad`, estructurado, por ejemplo `pino`) con **redacción central** aplicada **antes de enviar** a ningún destino: la lista cerrada de campos personales (D-030.6), los campos secretos y los valores de entrada (cabeceras de autorización, cookies, enlaces, códigos).
- **Nunca** se registran cuerpos de petición ni respuesta; se registran método, ruta con `slug` de empresa, identificador de membresía y de petición, código y duración.
- El envío al monitor de errores usa el mismo depurador (`beforeSend`); no se envían variables locales ni parámetros de consultas.
- Tipo `Secreto` (ADR-07): su representación es `[secreto]` en cualquier registro.
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
- Prueba de RS-51 (ADR-09) incluye la salida de registros.

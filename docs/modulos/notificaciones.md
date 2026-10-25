# Módulo: Notificaciones (slug `notificaciones`, sigla NOT)

**Versión:** 0.1 (borrador del Analista de Negocio, Oleada B). **Base:** decisiones D-001 a D-029 (`docs/equipo/decisiones.md`) y documento funcional v0.1.
**Convenciones:** [SUPUESTO] = lo propongo y sigo; lo confirma el Gerente de TI. [ESCALAR AL CEO] = dinero, tema legal o algo irreversible.

## 1. Propósito, alcance y fase

**Propósito.** Un solo lugar que decide cuándo, a quién, por dónde y con qué texto se avisa a las personas de lo que pasa en la plataforma. Los demás módulos solo dicen "ocurrió esto"; este módulo se encarga de avisar sin molestar de más, sin repetir y sin mostrar datos de otra empresa.

**Fase (dos tramos)** [SUPUESTO]:
- **NOT-base, desde la Etapa 1:** correo para enlaces de ingreso e invitaciones (D-002), avisos de aprobación de órdenes de compra (D-013 punto 10, D-023), registro de envíos y límites. Sin esto nadie entra.
- **NOT-completo, Fase 2 (junto a `mesa-de-ayuda`):** bandeja dentro de la plataforma, preferencias por usuario, resúmenes, plantillas editables y avisos por fecha.

**Entra:** eventos y su catálogo; dos canales (dentro de la plataforma y correo); preferencias por usuario y por empresa; plantillas; resúmenes diarios y semanales; límites de envío; registro de envíos; reintentos; manejo de correos que rebotan; avisos por fecha para vencimientos.

**No entra** (sección 13): mensajes de texto (SMS), WhatsApp, Teams, Slack, notificaciones del navegador o del celular, correo entrante, envío al proveedor externo (D-013 punto 8), envío de webhooks (es de `integraciones-api`).

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Evento** | Algo que ocurrió y puede avisarse. Ej.: "orden de compra pendiente de aprobación". Cada tipo tiene un código fijo. |
| **Notificación** | El aviso para una persona concreta, generado por un evento. |
| **Canal** | Por dónde llega: **En la plataforma** (campana y bandeja) o **Correo**. |
| **Bandeja** | Lista de notificaciones de un usuario dentro de la plataforma, con leídas y no leídas. |
| **Grupo de avisos** | Conjunto de eventos parecidos sobre el que el usuario decide (Compras y aprobaciones, Mis casos de ayuda, Vencimientos...). |
| **Mensaje obligatorio** | Aviso de seguridad o acceso que el usuario no puede apagar (enlace de ingreso, invitación, cambio de rol). |
| **Plantilla** | Texto base de un aviso, con espacios para datos (variables) como el número del caso. |
| **Resumen** | Un solo correo que junta varios avisos (diario o semanal). |
| **Registro de envíos** | Libro que guarda cada intento de envío: a quién, cuándo, resultado. |
| **Rebote** | El correo no pudo entregarse (buzón inexistente o lleno). |
| **Límite de envío** | Máximo de correos permitido por persona, por empresa o por plataforma. |
| **Aviso por fecha** | Aviso programado antes de una fecha de vencimiento (garantía, licencia, dominio, contrato). |
| **Proveedor de correo** | Servicio externo contratado que entrega los correos. Tiene costo (sección 12). |

## 3. Roles y permisos

Alcance: **P** = solo lo propio, **T** = todo en la empresa, **-** = no. El Administrador de plataforma no pertenece a ninguna empresa y **no ve el contenido ni los destinatarios** de los avisos de las empresas (D-003).

| Permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Admin. de plataforma |
|---|---|---|---|---|---|---|---|
| `notificaciones.bandeja.usar` | P | P | P | P | P | P | - |
| `notificaciones.preferencias.editar_propias` | P | P | P | P | P | P | - |
| `notificaciones.preferencias_empresa.editar` (valores iniciales, texto en correos) | sí | - | - | - | - | - | - |
| `notificaciones.plantilla.ver` | sí | sí | - | - | - | - | - |
| `notificaciones.plantilla.editar` | sí | - | - | - | - | - | - |
| `notificaciones.regla_aviso.configurar` (umbrales y destinatarios) | sí | - | - | - | - | - | - |
| `notificaciones.limites.configurar` (dentro del tope de plataforma) | sí | - | - | - | - | - | - |
| `notificaciones.registro.ver` (sensible: contiene correos) | sí | - | - | - | - | - | - |
| `notificaciones.registro.reenviar` | sí | - | - | - | - | - | - |
| `notificaciones.exportar` (usa el permiso aparte de exportar, D-004) | sí | - | - | - | - | - | - |
| `notificaciones.plataforma.administrar` (topes globales, estado del proveedor, métricas sin contenido) | - | - | - | - | - | - | sí |

Cada empresa puede asignar los permisos sensibles a otros roles. Los destinatarios de cada evento no dependen de estos permisos sino de lo que el módulo emisor declara (sección 8).

## 4. Requisitos

### 4.1 Requisitos funcionales (RF)

| ID | Requisito |
|---|---|
| RF-NOT-001 | Existe un catálogo de eventos mantenido por el equipo de desarrollo (no editable por empresas). Cada evento declara: código, módulo, grupo de avisos, si es obligatorio, si se puede resumir, destinatarios, variables permitidas. |
| RF-NOT-002 | Cualquier módulo emite un evento con un identificador único; si se emite dos veces el mismo identificador, se avisa una sola vez. |
| RF-NOT-003 | El sistema calcula los destinatarios al momento del evento según la regla del evento y comprueba que cada uno sea miembro activo de la empresa del evento y tenga permiso para ver el objeto. |
| RF-NOT-004 | Quien provoca el evento no recibe aviso de su propia acción. |
| RF-NOT-005 | Canal "En la plataforma": campana con contador de no leídas, lista paginada, marcar como leída (una o todas), archivar, y abrir el objeto con un clic. |
| RF-NOT-006 | La bandeja muestra solo las notificaciones de la empresa activa y un contador separado de no leídas de las otras empresas del usuario, sin su contenido. |
| RF-NOT-007 | Canal "Correo": se envía al correo verificado del usuario (D-002). El correo trae número, título genérico y enlace; por defecto no trae el texto de comentarios ni datos de negocio. |
| RF-NOT-008 | Cada usuario elige por grupo de avisos y por canal: activado o apagado; en correo además: inmediato, resumen diario o resumen semanal. |
| RF-NOT-009 | El administrador define los valores iniciales de preferencias de la empresa; el usuario los cambia a su gusto salvo en mensajes obligatorios. |
| RF-NOT-010 | Un usuario no puede activar avisos de eventos que no tendría permiso de ver. |
| RF-NOT-011 | Resumen diario: un correo por usuario a la hora fijada por la empresa (08:00 por defecto) con los avisos acumulados; no se envía si no hay avisos. Resumen semanal: lunes a la misma hora. |
| RF-NOT-012 | Un resumen lista hasta 50 avisos agrupados por grupo; el resto se indica como "y N más" con enlace a la bandeja. |
| RF-NOT-013 | Los eventos marcados "no se resume" (seguridad, caso P1, plazo vencido de un caso) se envían de inmediato si el correo del grupo está activado. |
| RF-NOT-014 | Varios avisos del mismo tipo sobre el mismo objeto en menos de 5 minutos se agrupan en uno ("3 respuestas nuevas"). |
| RF-NOT-015 | Hay una plantilla base por evento y canal, en español, mantenida por la plataforma. |
| RF-NOT-016 | El administrador puede personalizar el asunto y el párrafo inicial de las plantillas no obligatorias; el resto del texto no se edita. |
| RF-NOT-017 | Las plantillas solo aceptan las variables permitidas del evento; guardar una variable no permitida se rechaza con mensaje claro. |
| RF-NOT-018 | Cada plantilla tiene vista previa con datos de ejemplo ficticios y guarda versiones; el registro de envíos anota la versión usada. |
| RF-NOT-019 | Límites de envío por persona, por empresa y por plataforma (RN-NOT-008 a RN-NOT-011). |
| RF-NOT-020 | Cada intento de envío por correo queda en el registro de envíos con su estado. |
| RF-NOT-021 | Un envío fallido de forma temporal se reintenta 3 veces (a los 5 minutos, 30 minutos y 2 horas); luego queda "Fallido". |
| RF-NOT-022 | Un correo con 3 rebotes definitivos seguidos se marca "no entregable", no recibe más correos y se avisa a los administradores de la empresa. |
| RF-NOT-023 | El administrador con permiso puede reenviar un envío fallido y limpiar la marca de "no entregable" tras corregir el correo. |
| RF-NOT-024 | Avisos por fecha: cada módulo declara una regla (entidad, campo de fecha, umbrales de días, permiso que define a los destinatarios); NOT evalúa las reglas una vez al día y emite el aviso. |
| RF-NOT-025 | Los umbrales por defecto de avisos por fecha son 90, 60, 30, 15 y 7 días; la empresa los edita dentro de lo que el módulo permite. |
| RF-NOT-026 | Si la fecha de vencimiento se corrige, los avisos pendientes se cancelan y se recalculan. |
| RF-NOT-027 | Los eventos del servicio común de correo pueden provenir de reportes programados; ese correo lleva resumen mínimo y enlace que exige iniciar sesión (sin adjuntos, D-022). |
| RF-NOT-028 | El Administrador de plataforma ve el estado del proveedor de correo y totales por empresa (cantidad de envíos), nunca destinatarios ni textos. |
| RF-NOT-029 | La bandeja y las listas del módulo tienen buscador y filtros (grupo, leídas, fecha); el registro de envíos admite exportación con permiso (D-021). |
| RF-NOT-030 | Los avisos para una Persona sin usuario existen solo si el módulo emisor lo declara; van por correo, sin enlace y solo si la Persona tiene correo (D-006). |

### 4.2 Reglas de negocio (RN)

| ID | Regla |
|---|---|
| RN-NOT-001 | Toda notificación, plantilla personalizada, preferencia y registro lleva empresa. Un identificador de otra empresa responde "no encontrado". |
| RN-NOT-002 | Nunca se avisa a quien no es miembro activo de la empresa del evento. Si deja de serlo, sus avisos pendientes se descartan y la bandeja de esa empresa deja de mostrarse. |
| RN-NOT-003 | Un aviso nunca incluye: claves de licencia, importes, precios, comentarios internos, enlaces de acceso de otra persona ni datos personales de terceros. Los correos nunca contienen contraseñas ni credenciales. |
| RN-NOT-004 | Al abrir un aviso se vuelve a comprobar el permiso. Si ya no lo tiene, se muestra "ya no está disponible" sin detalles. |
| RN-NOT-005 | Los mensajes obligatorios (enlace de ingreso, invitación, cambio de rol, suspensión, cambio de segunda verificación) no se pueden apagar ni resumir ni se personalizan; se envían de inmediato. |
| RN-NOT-006 | Por defecto el correo no lleva el texto de comentarios; la empresa puede activarlo con `preferencias_empresa.editar` y se le advierte que el correo sale de la plataforma. Los comentarios internos nunca se incluyen. |
| RN-NOT-007 | El texto de todo aviso trata los datos como texto, nunca como código (RS-42), y se recorta a 200 caracteres en el asunto. |
| RN-NOT-008 | Enlace de ingreso: máximo 5 por correo cada hora y 10 por día. La respuesta es siempre la misma exista o no el correo (D-002). |
| RN-NOT-009 | Invitaciones: máximo 20 por administrador por hora y 100 por empresa por día [SUPUESTO]. |
| RN-NOT-010 | Avisos normales: máximo 20 correos por persona por hora y 60 por día [SUPUESTO]. Lo que exceda pasa a la bandeja y al siguiente resumen; no se pierde. |
| RN-NOT-011 | Tope diario de correos por empresa (1.000 por defecto [SUPUESTO]), fijado por el Administrador de plataforma. Al llegar, los avisos normales solo van a la bandeja y se avisa a los administradores; los mensajes obligatorios tienen un cupo propio que no se agota con los normales. |
| RN-NOT-012 | Al llegar al 80% del tope mensual del plan del proveedor se avisa al Administrador de plataforma. |
| RN-NOT-013 | Un aviso por fecha no se repite para la misma combinación empresa, regla, entidad, umbral y destinatario. |
| RN-NOT-014 | Un aviso por fecha no se envía sobre una entidad dada de baja o ya vencida más allá del último umbral. |
| RN-NOT-015 | Las notificaciones de la bandeja se archivan solas a los 90 días [SUPUESTO]; nunca se borran antes. Nada se borra con historial (D-019): lo archivado sigue en base. |
| RN-NOT-016 | El registro de envíos no guarda el cuerpo completo del mensaje, solo plantilla, versión, título y datos no sensibles. Se conserva 12 meses [SUPUESTO, pendiente de D-024]. |
| RN-NOT-017 | Una plantilla de plataforma modificada por el equipo de desarrollo no cambia la parte personalizada (asunto y párrafo) de la empresa. |
| RN-NOT-018 | Los destinatarios de un aviso por fecha son quien el módulo declare como responsable más los usuarios con el permiso de recibir avisos que ese módulo declare. Si no hay ninguno, se avisa a los administradores. |
| RN-NOT-019 | No se procesan respuestas a los correos; el correo dice "no responda, abra el enlace". |
| RN-NOT-020 | El enlace de un correo exige iniciar sesión y comprobar que se es miembro de la empresa del objeto; no contiene datos que den acceso por sí mismos. |

### 4.3 Requisitos de calidad (RNF)

| ID | Requisito medible |
|---|---|
| RNF-NOT-001 | Un mensaje obligatorio sale del servidor en menos de 30 segundos (percentil 95). |
| RNF-NOT-002 | Un aviso inmediato normal sale en menos de 2 minutos (percentil 95). |
| RNF-NOT-003 | La campana se actualiza en menos de 30 segundos sin recargar la página. |
| RNF-NOT-004 | El resumen diario sale dentro de los 10 minutos posteriores a la hora fijada. |
| RNF-NOT-005 | Ningún aviso se duplica: 100 eventos con el mismo identificador generan 1 aviso. |
| RNF-NOT-006 | Una caída del proveedor de correo no pierde avisos: se reintentan y, si fallan, quedan "Fallido" y en la bandeja. |
| RNF-NOT-007 | Cada tabla nueva tiene prueba de aislamiento entre empresas (D-025). |
| RNF-NOT-008 | La bandeja carga en menos de 1 segundo (percentil 95) con 1.000 notificaciones por usuario. |
| RNF-NOT-009 | Las pantallas funcionan por teclado y en celular; el estado leído/no leído se indica con texto, no solo con color (D-021). |
| RNF-NOT-010 | El texto de los correos es comprensible sin jerga; se prueba con 5 personas no técnicas. |

## 5. Estados y transiciones

**Notificación en la bandeja**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (creación) | No leída | Sistema | Destinatario válido |
| No leída | Leída | El destinatario, o al abrir el objeto | |
| Leída | No leída | El destinatario | Opcional |
| No leída o Leída | Archivada | El destinatario, o el sistema a los 90 días | |
| No leída | Descartada | Sistema | El destinatario dejó de ser miembro (RN-NOT-002) |

**Envío por correo**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (creación) | En cola | Sistema | Canal correo activado |
| (creación) | Retenido para resumen | Sistema | Preferencia de resumen |
| (creación) | Omitido | Sistema | Preferencia apagada, correo no entregable o tope; se anota el motivo |
| Retenido para resumen | En cola | Sistema | Llega la hora del resumen |
| En cola | Enviado | Sistema | El proveedor aceptó el mensaje |
| En cola | Reintentando | Sistema | Falla temporal (hasta 3 veces) |
| Reintentando | Enviado o Fallido | Sistema | Resultado del reintento |
| Enviado | Entregado | Proveedor | Si informa la entrega |
| Enviado | Rebotado | Proveedor | Ver RF-NOT-022 |
| Fallido | En cola | Administrador con `registro.reenviar` | Reenvío manual; registra quién |

No hay otras transiciones. Finales: Entregado, Rebotado, Omitido, Fallido (hasta reenvío).

**Aviso por fecha:** Programado → Enviado, Cancelado (la fecha se corrigió o la entidad se dio de baja) u Omitido.

## 6. Datos

| Entidad | Campos principales | Clave y unicidad |
|---|---|---|
| Tipo de evento (catálogo de plataforma) | código, módulo, grupo, obligatorio, se puede resumir, destinatarios, variables permitidas | código único; sin empresa |
| Evento emitido | empresa, tipo, objeto referenciado (tipo e identificador), quién lo causó, fecha, identificador único | identificador único por empresa |
| Notificación | empresa, evento, destinatario (usuario), título genérico, referencia al objeto, estado de lectura, fechas | una por evento y destinatario |
| Preferencia de usuario | usuario, empresa, grupo, canal, frecuencia | una por usuario, empresa, grupo y canal |
| Preferencias de empresa | empresa, valores iniciales por grupo y canal, hora de resumen, incluir texto en correos, tope diario | una por empresa |
| Plantilla | evento, canal, asunto, texto, versión, base de plataforma o personalizada por empresa | única por empresa, evento, canal y versión |
| Envío (registro) | empresa, notificación, canal, correo usado (al momento), plantilla y versión, estado, intentos, motivo de omisión, código de error resumido | solo se agrega; estados se anotan como nuevas filas |
| Resumen | empresa, usuario, periodo, avisos incluidos | uno por usuario, periodo y empresa |
| Regla de aviso por fecha | empresa, módulo, entidad, campo de fecha, umbrales, permiso destinatario, activa | una por empresa, módulo y entidad |
| Aviso programado | regla, entidad, umbral, destinatario, fecha de envío, estado | único por empresa, regla, entidad, umbral y destinatario |
| Estado del correo | correo, estado (válido o no entregable), rebotes seguidos | uno por correo |
| Límite | empresa o plataforma, tipo, valor | uno por ámbito y tipo |

**Se audita (D-018):** cambios a preferencias de empresa, plantillas, reglas de aviso y límites; reenvíos manuales; limpieza de "no entregable"; exportación del registro; cambios de topes globales por el Administrador de plataforma. **No se guarda:** enlaces de ingreso, claves, textos completos de comentarios. Los correos son dato personal sujeto a D-024.

## 7. Pantallas necesarias

| N.º | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| NOT-01 | Campana y bandeja | Ver, marcar y archivar avisos | Todos |
| NOT-02 | Mis preferencias | Elegir canal y frecuencia por grupo | Todos |
| NOT-03 | Preferencias de la empresa | Valores iniciales, hora de resumen, texto en correos | Administrador |
| NOT-04 | Plantillas | Ver, personalizar asunto y párrafo, vista previa, versiones | Administrador |
| NOT-05 | Reglas de aviso por fecha | Umbrales y destinatarios por módulo | Administrador |
| NOT-06 | Registro de envíos | Buscar por evento, estado, fecha; reenviar; exportar | Administrador |
| NOT-07 | Límites de la empresa | Ver consumo del día y topes | Administrador |
| NOT-08 | Consola de correo de la plataforma | Estado del proveedor, topes globales, totales por empresa | Administrador de plataforma |

## 8. Notificaciones y automatismos

**Catálogo inicial** (los eventos de `mesa-de-ayuda` están en su sección 8; los de otros módulos los declara cada uno):

| Código | Grupo | Cuándo | A quién | Obligatorio / se resume |
|---|---|---|---|---|
| `acceso.enlace_ingreso` | Seguridad | Se pide ingresar | Dueño del correo | Obligatorio, inmediato |
| `acceso.invitacion` | Seguridad | Se invita a alguien | Correo invitado | Obligatorio, inmediato |
| `acceso.rol_cambiado` | Seguridad | Cambia el rol de alguien | Esa persona; administradores | Obligatorio |
| `acceso.suspension` | Seguridad | Suspender o dar de baja | Esa persona | Obligatorio |
| `acceso.segunda_verificacion` | Seguridad | Se activa o desactiva | Esa persona | Obligatorio |
| `compras.orden_por_aprobar` | Compras y aprobaciones | Orden pasa a Pendiente de aprobación (D-013) | Usuarios con permiso de aprobar, excepto quien la creó | Se resume: no |
| `compras.orden_decidida` | Compras y aprobaciones | Aprobada o rechazada | Quien la creó | Sí |
| `ayuda.*` | Casos, SLA, aprobaciones, conocimiento | Ver `mesa-de-ayuda` | Ver `mesa-de-ayuda` | Ver `mesa-de-ayuda` |
| `vencimiento.proximo` | Vencimientos | Se cruza un umbral de días | Responsable más usuarios con el permiso de avisos del módulo | Sí |
| `tecnico.fallo_envio` | Administración | Un correo queda Fallido o "no entregable" | Administradores de la empresa | Sí |
| `tecnico.tope_correo` | Administración | Se llega al 80% o 100% del tope diario | Administradores de la empresa | No |

**Variables permitidas por evento (ejemplos):** número de caso o de orden, nombre del servicio, estado, fecha límite, nombre del elemento que vence, fecha de vencimiento, días restantes, nombre de la empresa. **Prohibidas siempre:** importes, claves, comentarios internos, nombres de terceros.

**Ejemplo de texto de correo.** Asunto: "[Empresa Norte] Respuesta nueva en su caso AYU-000123". Cuerpo: "Hay una respuesta nueva en su caso. Para leerla, ingrese a la plataforma: [enlace]. No responda este correo."

**Automatismos:** evaluación diaria de avisos por fecha; envío de resúmenes; reintentos; marca de "no entregable"; archivo de bandeja a los 90 días; alerta de topes.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se usa | Frontera |
|---|---|---|
| Acceso y usuarios (D-002) | Enlaces de ingreso e invitaciones | El acceso genera el enlace; NOT solo lo entrega y no lo guarda ni lo registra en claro |
| Compras (D-013) | Eventos de aprobación | Compras decide cuándo; NOT cómo y a quién se entrega |
| Auditoría (D-018) | Cambios de configuración | Las consultas al registro de envíos no se auditan; su exportación sí |
| `mesa-de-ayuda` | Eventos `ayuda.*` | AYU define cuándo y qué dice; NOT decide canal, resumen y límites |
| `licencias-software`, `lineas-moviles`, `dominios-certificados` | Reglas de aviso por fecha | Ellos declaran entidad, fecha, umbrales y permiso; NOT evalúa, envía, no repite y registra |
| `proveedores-contratos`, `garantias-mantenimiento` | Reglas de aviso por fecha y eventos | Mismo modelo; la clave de no repetición incluye contrato, tipo y umbral |
| `gestion-cambios`, `gestion-problemas` | Eventos propios | Ellos definen evento y texto; NOT entrega |
| `reportes-tableros` | Correo de reportes programados | Servicio común: plantilla, reintentos y registro; sin adjuntos |
| `integraciones-api` | Webhooks | Fuera de NOT: NOT no envía a sistemas externos |
| `portal-autoservicio` | Campana y preferencias | El portal reutiliza NOT-01 y NOT-02 |
| Personas (D-006) | Correo de la Persona | Solo avisos informativos declarados, sin enlace |

## 10. Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-NOT-01 | **Dado** una orden de compra creada por Ana que pasa a Pendiente de aprobación, **cuando** se emite el evento, **entonces** reciben aviso los usuarios con permiso de aprobar, Ana no lo recibe, y queda un registro de envío por cada correo. |
| CA-NOT-02 | **Dado** un usuario que pertenece a las empresas A y B con la A activa, **cuando** abre la campana, **entonces** ve solo avisos de A y un contador de no leídas de B sin contenido. |
| CA-NOT-03 | **Dado** un evento de la empresa A, **cuando** el cálculo de destinatarios encuentra a un usuario que solo es miembro de la empresa B, **entonces** no se le avisa, y pedir una notificación de A desde B responde "no encontrado". |
| CA-NOT-04 | **Dado** un usuario con rol Solicitante, **cuando** intenta abrir la pantalla Registro de envíos o editar una plantilla (por pantalla o directo al servidor), **entonces** se deniega y no se muestra ningún dato. |
| CA-NOT-05 | **Dado** el aviso obligatorio de invitación, **cuando** el usuario intenta apagarlo en sus preferencias, **entonces** la opción no está disponible y el correo se envía igual. |
| CA-NOT-06 | **Dado** un usuario con resumen diario y 8 avisos acumulados, **cuando** llega la hora fijada, **entonces** recibe un solo correo con 8 avisos agrupados y ninguno de ellos se envía antes por separado. |
| CA-NOT-07 | **Dado** un usuario que ya recibió 20 correos en la última hora, **cuando** llega otro aviso normal, **entonces** no se envía por correo, aparece en la bandeja y se incluye en su próximo resumen. |
| CA-NOT-08 | **Dado** un correo que rebota tres veces seguidas, **cuando** ocurre el tercer rebote, **entonces** el correo queda "no entregable", no recibe más avisos normales y los administradores reciben `tecnico.fallo_envio`. |
| CA-NOT-09 | **Dado** un comentario interno en un caso, **cuando** se notifica al solicitante, **entonces** el aviso no contiene ni referencia su texto. |
| CA-NOT-10 | **Dado** una licencia que vence en 30 días con regla 90/60/30, **cuando** el proceso diario corre dos veces el mismo día, **entonces** se envía un aviso por destinatario; **cuando** la fecha se corrige a 200 días, **entonces** los avisos pendientes se cancelan. |
| CA-NOT-11 | **Dado** una plantilla personalizada, **cuando** el administrador escribe una variable que no está permitida (por ejemplo, un importe), **entonces** no se guarda y se explica el motivo. |
| CA-NOT-12 | **Dado** el mismo evento emitido dos veces con igual identificador (por un reintento del sistema), **cuando** se procesa, **entonces** hay una sola notificación. |
| CA-NOT-13 | **Dado** una notificación para un usuario cuyo permiso se retiró después, **cuando** abre el aviso, **entonces** ve "ya no está disponible" sin título ni datos. |
| CA-NOT-14 | **Dado** 6 pedidos de enlace de ingreso para el mismo correo en una hora, **cuando** llega el sexto, **entonces** no se envía y la respuesta en pantalla es idéntica a la de un pedido normal. |

## 11. Casos límite

1. El proveedor de correo cae 3 horas: los avisos se reintentan; los fallidos quedan en la bandeja y en el registro; los administradores reciben el aviso técnico por la bandeja.
2. Un usuario cambia de zona horaria o la empresa cambia la suya: el resumen usa la zona de la empresa vigente al momento de enviar.
3. Una persona es invitada con correo en mayúsculas: se compara sin distinguirlas (D-002).
4. El único administrador es "no entregable": el Administrador de plataforma lo ve en la consola y aplica el rescate de D-002 punto 7.
5. Un aviso se genera para un objeto que se anula antes del envío: el aviso se envía igual si ya salió; si está retenido para resumen, se omite con motivo.
6. Un usuario apaga todos los grupos no obligatorios: solo recibe mensajes obligatorios.
7. Un módulo emite un evento que no está en el catálogo: se rechaza y se registra el error técnico (sin datos del evento).
8. Llegan 500 eventos juntos (importación masiva): se agrupan por usuario y objeto; el tope por empresa protege el costo.
9. Un correo es compartido por dos usuarios de empresas distintas: son usuarios con el mismo correo; la cuenta es una (D-002); las empresas se distinguen por el asunto.
10. Se restaura un respaldo: las notificaciones ya enviadas no se reenvían; el registro de envíos evita repetir.
11. La Persona sin usuario cambia de correo: el aviso usa el correo vigente al enviar.

## 12. Decisiones propuestas y supuestos

| N.º | Tipo | Propuesta y motivo |
|---|---|---|
| NOT-S01 | [SUPUESTO] | Solo dos canales: plataforma y correo. SMS y WhatsApp cuestan por mensaje y amplían el tratamiento de teléfonos personales (D-006 los excluye). |
| NOT-S02 | [SUPUESTO] | NOT-base desde la Etapa 1 y NOT-completo en Fase 2. Las bases salen porque el ingreso es por correo. |
| NOT-S03 | [SUPUESTO] | Por defecto el correo no lleva texto de comentarios ni datos de negocio: los correos salen de la plataforma y pueden reenviarse. |
| NOT-S04 | [SUPUESTO] | Cifras iniciales de límites (RN-NOT-008 a RN-NOT-011): 5 enlaces por hora por correo, 20 correos por hora por persona, 1.000 por día por empresa; DevOps las ajusta con el plan real del proveedor. |
| NOT-S05 | [SUPUESTO] | Sin correo entrante ni respuestas por correo: evita suplantación y filtración. |
| NOT-S06 | [SUPUESTO] | Plantillas editables solo en asunto y párrafo inicial: evita que se inyecten textos o variables que filtren datos. |
| NOT-S07 | [SUPUESTO] | Retención: bandeja 90 días archivada, registro de envíos 12 meses. Se alinea con D-024 cuando legal responda. |
| NOT-S08 | [SUPUESTO] | Un único motor de avisos por fecha para vencimientos de garantías, licencias, líneas, dominios, certificados y contratos; cada módulo solo declara su regla. Reemplaza la exclusión de avisos automáticos de D-023 solo para la Fase 2. |
| NOT-E01 | [ESCALAR AL CEO] (dinero) | **Servicio de envío de correo.** Ya figura en `decisiones.md` (Escalado, Dinero 1) como indispensable. Este módulo suma el volumen de avisos de mesa de ayuda, vencimientos y reportes; el costo mensual depende del plan y del número de correos por mes. Recomendación del Analista: aprobar el servicio ahora con un plan que cubra la Etapa 1 a 5, y revisar el plan al activar NOT-completo; DevOps presenta la cifra concreta con el volumen estimado de las dos fases. |
| NOT-E02 | [ESCALAR AL CEO] (legal) | Los correos de usuarios y personas son datos personales; los plazos de NOT-S07 y la relación con el proveedor de correo (contrato, país del servidor) dependen de la opinión legal ya pedida en `decisiones.md` (Escalado, Legal 1, 2 y 5). No se activa ninguna eliminación automática del registro de envíos antes de esa confirmación. |

## 13. Fuera de alcance

- Mensajes de texto (SMS), WhatsApp, Teams, Slack, aplicaciones móviles y notificaciones del navegador.
- Procesar respuestas a los correos o crear casos por correo.
- Envío automático de órdenes de compra al proveedor (D-013 punto 8) y correos a terceros externos.
- Webhooks y envío a sistemas externos (módulo `integraciones-api`).
- Adjuntos en correos (D-022).
- Editar el catálogo de eventos desde la plataforma; crear eventos por empresa.
- Horarios de silencio por usuario, delegación de avisos durante vacaciones.
- Encuestas por correo fuera de la encuesta del caso (módulo `mesa-de-ayuda`).
- Marketing o mensajes masivos a todos los usuarios.

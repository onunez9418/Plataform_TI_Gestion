# Módulo: Notificaciones (slug `notificaciones`, sigla NOT)

**Versión:** 0.2 (corregida tras la Mesa #002; ver sección 14). **Base:** decisiones D-001 a D-064 (`docs/equipo/decisiones.md`), `docs/equipo/plan-correcciones.md` y documento funcional del núcleo.
**Cuándo:** **NOT-base: v1, Etapa 1** (es la misma fuente que RF-ACC-021 del núcleo); **NOT-completo: Fase 2, ola A** (D-056). **Convenciones:** [SUPUESTO] = propuesta del módulo con resultado en la sección 12; [ESCALAR AL CEO] = dinero, tema legal o algo irreversible. Los permisos son los de `docs/registro-permisos.md` (PS-nn).

## 1. Propósito, alcance y fase

**Propósito.** Un solo lugar que decide cuándo, a quién, por dónde y con qué texto se avisa de lo que pasa en la plataforma. Los demás módulos solo dicen "ocurrió esto"; este módulo avisa sin molestar de más, sin repetir y sin mostrar datos de otra empresa.

**NOT-base (v1, Etapa 1; única fuente RF-ACC-021).** Solo correo: invitaciones, enlaces de acceso, aviso a quien debe aprobar una orden pendiente y aviso a quien la creó cuando se aprueba o rechaza (D-013.10, D-061.4). Incluye la capa única de envío, el registro de envíos, los límites y el estado global del correo. La campana queda reservada y oculta; el Inicio muestra "Por aprobar" y "Pendientes"; el asunto de cada correo lleva el nombre de la empresa (H-UX-23). Los avisos de entregas, altas y bajas **no entran a la v1**.

**NOT-completo (Fase 2, ola A).** Bandeja dentro de la plataforma, preferencias, resúmenes, plantillas editables, motor único de avisos por fecha y avisos a Personas sin usuario. Es la base de todo lo que vence (D-056).

**Necesita:** la cola de trabajos en PostgreSQL, el bus de eventos único y el calendario de empresa de la Etapa 1 (D-038).

**No entra** (sección 13): SMS, WhatsApp, Teams, Slack, notificaciones del navegador o del celular, correo entrante, envío de órdenes al proveedor (D-013.8), webhooks (módulo `integraciones-api`).

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Evento** | Algo que ocurrió y puede avisarse. Código `<módulo>.<entidad>_<hecho>`, p. ej. `compras.orden_por_aprobar`. |
| **Notificación** | El aviso para un destinatario concreto, generado por un evento. |
| **Destinatario** | Una membresía (usuario dentro de una empresa) **o** una Persona (solo si el evento lo declara); nunca las dos (D-041, H-DAT-24). |
| **Canal** | **En la plataforma** (campana y bandeja) o **Correo**. |
| **Grupo de avisos** | Conjunto de eventos parecidos sobre el que el usuario decide (Compras y aprobaciones, Mis casos, Vencimientos...). |
| **Mensaje obligatorio** | Aviso de seguridad o acceso que no se puede apagar. |
| **Contenido mínimo** | Solo tipo de aviso, código (`ACT-E-000123`, `PRS-0042`), fecha y nombre de la empresa. Sin serie, IMEI, nombres de terceros, importes ni enlaces de acción (D-061.4). |
| **Correo no verificado** | Dirección que nadie confirmó (la de una Persona sin usuario). Solo recibe contenido mínimo. |
| **Capa de envío** | Pieza única que entrega los correos a un proveedor externo mediante un adaptador intercambiable (T-12). |
| **Plantilla** | Texto base de un aviso, con espacios para datos (variables). |
| **Resumen** | Un correo que junta varios avisos (diario o semanal). |
| **Registro de envíos** | Libro de cada intento de envío: a quién, cuándo, resultado. |
| **Rebote** | El correo no pudo entregarse. |
| **Aviso por fecha** | Aviso programado antes de un vencimiento (garantía, licencia, línea, dominio, certificado, contrato). |
| **Estado del correo** | Dato **global** (por dirección): válido o no entregable. |

## 3. Roles y permisos

Alcance: **T** todo, **P** solo lo propio, **-** no. Los módulos agregan filas; no cambian celdas del núcleo. El Administrador de plataforma no pertenece a ninguna empresa y **no ve contenido ni destinatarios** de los avisos de las empresas (D-003, D-039). El correo de la v1 (NOT-base) lo emite el sistema y no necesita permisos de esta tabla.

| PS | Permiso | Adm. | Jef. TI | Téc. | Alm. | Sol. | S. lect. | Emp. (portal) | Plat. |
|---|---|---|---|---|---|---|---|---|---|
| PS-211 | `notificaciones.bandeja_usar` | P | P | P | P | P | P | P | - |
| PS-212 | `notificaciones.preferencias_propias` | P | P | P | P | P | P | P | - |
| PS-213 | `notificaciones.preferencias_empresa` (valores iniciales, hora de resumen, texto en correos) | T | - | - | - | - | - | - | - |
| PS-214 | `notificaciones.plantilla_ver` | T | T | - | - | - | - | - | - |
| PS-215 | `notificaciones.plantilla_editar` (sensible; segundo factor; auditado) | T | - | - | - | - | - | - | - |
| PS-216 | `notificaciones.regla_aviso_configurar` (umbrales, destinatarios, hora de envío) | T | - | - | - | - | - | - | - |
| PS-217 | `notificaciones.limites_configurar` (dentro del tope de plataforma) | T | - | - | - | - | - | - | - |
| PS-218 | `notificaciones.registro_ver` (sensible; contiene correos; cada consulta se audita) | T | - | - | - | - | - | - | - |
| PS-219 | `notificaciones.registro_reenviar` | T | - | - | - | - | - | - | - |
| PS-20 | `datos.exportar` (exportar el registro de envíos; permiso único del núcleo) | T | - | - | - | - | - | - | - |
| PS-04 | `plataforma.limites_ajustar` (subir por un periodo corto los topes de una empresa) | - | - | - | - | - | - | - | T |
| PS-06 | `plataforma.correo_administrar` (estado global del correo y del proveedor; solo totales, nunca contenido) | - | - | - | - | - | - | - | T |

Cada empresa puede dar los permisos sensibles a otros roles. Los destinatarios de cada evento no dependen de esta tabla sino de lo que declare el módulo que lo emite (sección 8). Una Persona sin usuario no tiene permisos; solo recibe avisos que su evento declare.

## 4. Requisitos

### 4.1 Requisitos funcionales (RF)

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-NOT-001 | Existe un **catálogo único de eventos** `<módulo>.<entidad>_<hecho>`, mantenido por desarrollo y acordado con `integraciones-api`. Cada evento declara: módulo, grupo, si es obligatorio, si se resume, destinatarios, variables permitidas y si puede avisar a Personas sin usuario. | v1, Etapa 1 | CA-NOT-12 |
| RF-NOT-002 | Todo evento se escribe en la tabla única de eventos con identificador único; el mismo identificador avisa una sola vez. | v1, Etapa 1 | CA-NOT-12 |
| RF-NOT-003 | Los destinatarios se calculan al emitir el evento: miembro activo de la empresa del evento, con permiso para ver el objeto. | v1, Etapa 1 | CA-NOT-03, CA-NOT-13 |
| RF-NOT-004 | Quien provoca el evento no recibe aviso de su propia acción, salvo los eventos que declaran lo contrario (p. ej. la confirmación del caso a quien lo pidió). | v1, Etapa 5 | CA-NOT-01, CA-NOT-20 |
| RF-NOT-005 | Canal "En la plataforma": campana con contador de no leídas, lista paginada, marcar leída (una o todas), archivar y abrir el objeto con un clic. | Fase 2 | CA-NOT-02 |
| RF-NOT-006 | La bandeja muestra la empresa activa; el contador de otras empresas del usuario sale de una tabla resumen por usuario, sin contenido, nunca de recorrer empresas. | Fase 2 | CA-NOT-02 |
| RF-NOT-007 | Canal "Correo": va al correo verificado del usuario con contenido mínimo y un enlace que exige iniciar sesión. Por defecto sin texto de comentarios. | v1, Etapa 1 | CA-NOT-20, CA-NOT-05 (Fase 2) |
| RF-NOT-008 | Cada usuario elige por grupo y canal: activado o apagado; en correo además inmediato, resumen diario o semanal. | Fase 2 | CA-NOT-06 |
| RF-NOT-009 | El administrador fija los valores iniciales de la empresa; el usuario los cambia salvo en mensajes obligatorios. | Fase 2 | CA-NOT-06 |
| RF-NOT-010 | Un usuario no puede activar avisos de eventos cuyo objeto no podría ver. | Fase 2 | CA-NOT-13 |
| RF-NOT-011 | Resumen diario a la hora única de la empresa (08:00 por defecto) y semanal los lunes; no se envía si no hay avisos. | Fase 2 | CA-NOT-07 |
| RF-NOT-012 | Un resumen lista hasta 50 avisos por grupo; el resto como "y N más" con enlace a la bandeja. | Fase 2 | CA-NOT-07 |
| RF-NOT-013 | Los eventos marcados "no se resume" (seguridad, caso P1, plazo vencido, aprobación pendiente) salen de inmediato si el correo del grupo está activado. | v1, Etapa 1 | CA-NOT-01, CA-NOT-20 (v1); CA-NOT-07 (Fase 2) |
| RF-NOT-014 | Varios avisos del mismo tipo sobre el mismo objeto en menos de 5 minutos se agrupan en uno. | Fase 2 | CA-NOT-07 |
| RF-NOT-015 | Hay una plantilla base por evento y canal, en español y tratando de "usted", mantenida por la plataforma. | v1, Etapa 1 | CA-NOT-11 |
| RF-NOT-016 | El administrador con PS-215 personaliza asunto y párrafo inicial de las plantillas no obligatorias. | Fase 2 | CA-NOT-11, CA-NOT-16 |
| RF-NOT-017 | Las plantillas solo aceptan variables permitidas del evento; una no permitida se rechaza. | v1, Etapa 1 | CA-NOT-11 |
| RF-NOT-018 | Cada plantilla tiene vista previa con datos ficticios y versiones; el registro anota la versión usada. | Fase 2 | CA-NOT-11 |
| RF-NOT-019 | Límites de envío por persona, por empresa y por plataforma, según el cuadro único de D-054 (RN-NOT-008 a 011). | v1, Etapa 1 | CA-NOT-08, CA-NOT-14 |
| RF-NOT-020 | Cada intento de envío por correo queda en el registro de envíos con su estado. | v1, Etapa 1 | CA-NOT-09 |
| RF-NOT-021 | Un fallo temporal se reintenta 3 veces (5 minutos, 30 minutos, 2 horas); luego queda "Fallido". | v1, Etapa 1 | CA-NOT-10 |
| RF-NOT-022 | Un correo con 3 rebotes definitivos seguidos se marca "no entregable", deja de recibir avisos normales y se avisa a los administradores de la empresa que lo envió. | v1, Etapa 1 | CA-NOT-10 |
| RF-NOT-023 | El administrador con PS-219 reenvía un envío fallido y limpia la marca de "no entregable" tras corregir el correo. | Fase 2 | CA-NOT-10 |
| RF-NOT-024 | **Motor único de avisos por fecha:** cada módulo declara su regla (entidad, campo de fecha, umbrales, permiso que define a los destinatarios); NOT evalúa una vez al día y emite los avisos. | Fase 2 | CA-NOT-04 |
| RF-NOT-025 | Umbrales por defecto 90, 60, 30, 15 y 7 días y **una sola hora de envío** por empresa (08:00); un módulo que se aparta lo justifica por escrito. | Fase 2 | CA-NOT-04 |
| RF-NOT-026 | Si una fecha de vencimiento se corrige, los avisos pendientes se cancelan y se recalculan. | Fase 2 | CA-NOT-04 |
| RF-NOT-027 | Servicio común de correo para reportes programados: plantilla, reintentos, registro, resumen mínimo y enlace que exige sesión (sin adjuntos, D-022). | Fase 2 | CA-NOT-05 |
| RF-NOT-028 | El Administrador de plataforma ve el estado del proveedor y totales por empresa, nunca destinatarios ni textos. | v1, Etapa 1 | CA-NOT-17 |
| RF-NOT-029 | La bandeja y el registro tienen buscador y filtros (grupo, leídas, fecha, estado); el registro se exporta por la puerta única con PS-20. | Fase 2 | CA-NOT-09 |
| RF-NOT-030 | A una Persona sin usuario se le avisa solo si el evento lo declara, por correo, con contenido mínimo y sin enlace de acción; sin correo, no se avisa. | Fase 2 | CA-NOT-05 |
| RF-NOT-031 | **Capa única de envío** con adaptador intercambiable y un segundo proveedor configurado; sin seguimiento de aperturas ni de clics y sin guardar el cuerpo. | v1, Etapa 1 | CA-NOT-10 |
| RF-NOT-032 | El estado del correo es **global** y solo lo tocan dos funciones: consultar si es entregable y registrar un rebote (D-039.4, D-039.5). | v1, Etapa 1 | CA-NOT-10 |
| RF-NOT-033 | Las invitaciones usan texto fijo sin campos libres, nunca dicen si el correo ya tiene cuenta, suman la empresa solo cuando la persona abre y acepta, y se avisa al usuario cuando se le suma una empresa. | v1, Etapa 1 | CA-NOT-18 |
| RF-NOT-034 | Los enlaces de los correos llevan la empresa en la dirección (D-046), exigen sesión y, si la persona no es miembro de esa empresa, responden "no encontrado". | v1, Etapa 1 | CA-NOT-13 |

### 4.2 Reglas de negocio (RN)

| ID | Regla |
|---|---|
| RN-NOT-001 | Toda notificación, plantilla personalizada, preferencia, evento y registro lleva empresa, con clave compuesta (empresa, id). Un identificador de otra empresa responde "no encontrado". Las únicas tablas globales son: tipos de evento, estado del correo y resumen de no leídas por usuario (D-039.4). |
| RN-NOT-002 | Nunca se avisa a ningún **usuario** que no sea miembro activo de la empresa del evento. Si deja de serlo (suspendido o dado de baja), sus avisos pendientes se descartan. Los avisos a Personas se rigen por RN-NOT-027. |
| RN-NOT-003 | Un aviso nunca incluye claves de licencia, importes, precios, comentarios internos, enlaces de acceso de otra persona ni datos personales de terceros. Los correos nunca llevan contraseñas ni credenciales. A una Persona sin usuario o a una dirección no verificada solo llega el **contenido mínimo** (D-061.4). |
| RN-NOT-004 | Al abrir un aviso se vuelve a comprobar el permiso. Si ya no lo tiene, se muestra "ya no está disponible" sin detalles. |
| RN-NOT-005 | Son obligatorios, inmediatos y no se pueden apagar, resumir ni personalizar: `acceso.enlace_solicitado`, `acceso.invitacion_enviada`, `acceso.rol_cambiado`, `acceso.membresia_suspendida`, `acceso.segunda_verificacion_cambiada`. |
| RN-NOT-006 | Por defecto el correo no lleva el texto de comentarios; la empresa puede activarlo con PS-213 solo para usuarios, con la advertencia de que el correo sale de la plataforma. Los comentarios internos nunca; nada de esto llega a Personas sin usuario. |
| RN-NOT-007 | Los datos de un aviso se tratan como texto, nunca como código (RS-42); el asunto se recorta a 200 caracteres. |
| RN-NOT-008 | Enlace de ingreso: 5 por correo por hora, 10 por día y 20 por IP por hora (D-054.2); el tope por correo no bloquea al dueño que ya tiene un enlace válido; el tiempo de respuesta es igual exista o no el correo; **no se envía nada a correos sin cuenta ni invitación**. |
| RN-NOT-009 | Invitaciones: 20 por administrador por hora y 100 por empresa por día; la plataforma puede subir el tope de una empresa por un periodo corto (PS-04). |
| RN-NOT-010 | Avisos normales: 20 correos por persona por hora y 60 por día (NOT-S04). Lo que exceda pasa a la bandeja y al siguiente resumen; no se pierde. |
| RN-NOT-011 | Tope diario de 1.000 correos por empresa, con **cupo propio** para los mensajes obligatorios y para `compras.orden_por_aprobar`, que no se agota con los demás. Al llegar al tope, los avisos normales van solo a la bandeja y se avisa a los administradores. |
| RN-NOT-012 | Al llegar al 80 % del tope mensual del plan del proveedor se avisa al Administrador de plataforma. |
| RN-NOT-013 | Un aviso por fecha no se repite para la misma combinación empresa, regla, entidad, umbral y destinatario (**una sola tabla de avisos**; desaparecen las "alertas enviadas" de otros módulos). |
| RN-NOT-014 | No se avisa sobre una entidad dada de baja ni más allá del último umbral. |
| RN-NOT-015 | La bandeja archiva sola a los 90 días. "Archivado" significa fuera de la vista con el mismo plazo de retención, no conservación indefinida (H-CUM-09). |
| RN-NOT-016 | El registro de envíos no guarda el cuerpo; guarda plantilla, versión y datos no sensibles. El correo completo se ve 90 días y después queda **enmascarado**; el registro se conserva 12 meses (NOT-S07). |
| RN-NOT-017 | Cambiar una plantilla de la plataforma no altera el asunto y el párrafo personalizados por una empresa. |
| RN-NOT-018 | Los destinatarios de un aviso por fecha son el responsable (Persona, luego membresía, luego correo) y los usuarios con el permiso de recibir avisos que declare el módulo (p. ej. PS-81, PS-106). Si no hay ninguno, se avisa a los administradores. |
| RN-NOT-019 | No se procesan respuestas a los correos; el correo dice "no responda, abra el enlace". |
| RN-NOT-020 | El enlace de un correo no da acceso por sí mismo: exige sesión y comprobar la membresía de la empresa de su dirección. |
| RN-NOT-021 | Todo proceso programado de NOT (resúmenes, avisos por fecha, reintentos, archivo de bandeja) es **idempotente**, **recuperable** (al arrancar procesa los días pendientes en orden y no pierde un aviso de vencimiento), corre empresa por empresa con la empresa fijada dentro de la transacción y el rol sin privilegios, salta empresas suspendidas, calcula "hoy" con la zona de cada empresa y registra la corrida: fecha lógica, resultado, cuántos avisos (D-038.4). |
| RN-NOT-022 | Los estados "Vencido" no los guarda ni los cambia NOT: se calculan al leer con la fecha y la zona de la empresa; el proceso solo emite avisos (D-062.2). |
| RN-NOT-023 | El destinatario es una membresía **o** una Persona (una sola columna llena). Una referencia a un objeto (tipo e identificador) usa una columna por tipo con clave compuesta (empresa, id) y una sola llena (D-039.7). El correo se resuelve al enviar. |
| RN-NOT-024 | El estado del correo no guarda de qué empresa vino el rebote; el aviso a los administradores sale de la empresa que envió. |
| RN-NOT-025 | Los registros técnicos de envío no contienen correos completos, textos ni enlaces (T-14). |
| RN-NOT-026 | SPF, DKIM y DMARC (por pasos) se configuran en un subdominio de envío (D-054.4); su responsable es DevOps. |
| RN-NOT-027 | Solo avisan a Personas sin usuario los eventos que lo declaren (D-061.4); hoy ninguno de la v1. La ficha de la Persona muestra "correo no verificado" y cambiar su correo queda auditado. El recordatorio de salida a un exempleado está apagado hasta la opinión legal (E-ONB-01). |
| RN-NOT-028 | Los intentos de ingreso fallidos y los rechazos por empresa ajena son eventos de seguridad (D-054.1), no avisos ni registros de envío. |

### 4.3 Requisitos de calidad (RNF)

| ID | Requisito medible | Cuándo |
|---|---|---|
| RNF-NOT-001 | Un mensaje obligatorio sale del servidor en menos de 30 segundos (percentil 95). | v1, Etapa 1 |
| RNF-NOT-002 | Un aviso inmediato normal sale en menos de 2 minutos (percentil 95). | v1, Etapa 1 |
| RNF-NOT-003 | La campana se actualiza en menos de 30 segundos sin recargar. | Fase 2 |
| RNF-NOT-004 | El resumen diario sale dentro de los 10 minutos posteriores a la hora fijada. | Fase 2 |
| RNF-NOT-005 | Ningún aviso se duplica: 100 eventos con el mismo identificador generan 1 aviso. | v1, Etapa 1 |
| RNF-NOT-006 | Una caída del proveedor no pierde avisos: se reintentan y, si fallan, quedan "Fallido" y en la bandeja (Fase 2). | v1, Etapa 1 |
| RNF-NOT-007 | Cada tabla nueva tiene su prueba de aislamiento por identificador interno, y el proceso programado se prueba con dos empresas (D-039.6, D-063.6). | v1, Etapa 1 |
| RNF-NOT-008 | La bandeja carga en menos de 1 segundo (percentil 95) con 1.000 notificaciones por usuario. | Fase 2 |
| RNF-NOT-009 | Pantallas por teclado, a 360 px, contraste AA, leído/no leído con texto (D-021, D-053). | Fase 2 |
| RNF-NOT-010 | Los correos se entienden sin jerga (prueba con 5 personas no técnicas) y las pruebas de entrega usan un buzón de captura, nunca direcciones reales (D-028). | v1, Etapa 1 |

## 5. Estados y transiciones

**Notificación en la bandeja (Fase 2)**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (creación) | No leída | Sistema | Destinatario válido |
| No leída | Leída | El destinatario, o al abrir el objeto | |
| Leída | No leída | El destinatario | Opcional |
| No leída o Leída | Archivada | El destinatario, o el sistema a los 90 días | RN-NOT-015 |
| No leída | Descartada | Sistema | El destinatario dejó de ser miembro (RN-NOT-002) |

**Envío por correo (NOT-base)**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (creación) | En cola | Sistema | Canal correo activado |
| (creación) | Retenido para resumen | Sistema | Preferencia de resumen (Fase 2) |
| (creación) | Omitido | Sistema | Preferencia apagada, correo no entregable, correo no permitido o tope; con el motivo |
| Retenido para resumen | En cola | Sistema | Llega la hora del resumen |
| En cola | Enviado | Sistema | El proveedor aceptó el mensaje |
| En cola | Reintentando | Sistema | Falla temporal (hasta 3 veces) |
| Reintentando | Enviado o Fallido | Sistema | Resultado del reintento |
| Enviado | Entregado | Proveedor | Si informa la entrega |
| Enviado | Rebotado | Proveedor | RF-NOT-022 |
| Fallido | En cola | PS-219 | Reenvío manual; registra quién |

No hay otras transiciones. Finales: Entregado, Rebotado, Omitido, Fallido (hasta reenvío). **Aviso por fecha:** Programado → Enviado, Cancelado (fecha corregida o entidad dada de baja) u Omitido.

## 6. Datos

| Entidad | Campos principales | Clave y unicidad |
|---|---|---|
| Tipo de evento (global) | código, módulo, grupo, obligatorio, se resume, destinatarios, variables, avisa a Personas | código único |
| Evento emitido | empresa, tipo, objeto (una columna por tipo), causado por (membresía, integración o sistema), fecha, identificador | identificador único por empresa |
| Notificación | empresa, evento, destinatario (membresía **o** Persona), título genérico (código), referencia al objeto, estado de lectura, fechas | una por evento y destinatario |
| Preferencia de usuario | membresía, grupo, canal, frecuencia | una por membresía, grupo y canal |
| Preferencias de empresa | valores iniciales, hora única de resumen y de avisos, texto en correos, tope diario | una por empresa |
| Plantilla | evento, canal, asunto, texto, versión, base o personalizada por empresa | única por empresa, evento, canal y versión |
| Envío (registro) | empresa, notificación, canal, correo (completo 90 días, luego enmascarado), plantilla y versión, estado, intentos, motivo de omisión, error resumido | solo se agrega |
| Resumen | empresa, membresía, periodo, avisos incluidos | uno por membresía, periodo y empresa |
| Regla de aviso por fecha | empresa, módulo, entidad, campo de fecha, umbrales, permiso destinatario, activa | una por empresa, módulo y entidad |
| Aviso programado (tabla única) | regla, entidad, umbral, destinatario, fecha, estado | único por empresa, regla, entidad, umbral y destinatario |
| Estado del correo (global) | correo normalizado (Unicode, sin quitar puntos ni `+`), válido o no entregable, rebotes seguidos | uno por correo |
| Resumen de no leídas (global) | membresía, empresa, cantidad | uno por membresía y empresa |
| Límite | empresa o plataforma, tipo, valor | uno por ámbito y tipo |

**Se audita (D-018, D-030):** cambios a preferencias de empresa, plantillas, reglas de aviso y límites; reenvíos manuales; limpieza de "no entregable"; **consultas al registro de envíos** y lecturas masivas (desde 5.000 filas); exportaciones; cambios de topes por la plataforma. Las acciones automáticas llevan autor "sistema" con el identificador de la regla. **No se guarda en la auditoría:** correos ni textos por valor, enlaces de ingreso. **Datos personales del módulo (D-061.3):** correo del destinatario (registro de envíos), bandeja, estado del correo; retención en la sección 12 (NOT-S07).

## 7. Pantallas necesarias

| N.º | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-NOT-01 | Campana y bandeja (en la v1 oculta) | Ver, marcar y archivar avisos | Todos |
| PAN-NOT-02 | Mis preferencias (dentro de "Mi cuenta") | Elegir canal y frecuencia por grupo | Todos |
| PAN-NOT-03 | Preferencias de la empresa | Valores iniciales, hora única, texto en correos | Administrador |
| PAN-NOT-04 | Plantillas | Ver, personalizar asunto y párrafo, vista previa, versiones | Administrador |
| PAN-NOT-05 | Reglas de aviso por fecha | Umbrales y destinatarios; es el único lugar de configuración de avisos (DS-07) | Administrador |
| PAN-NOT-06 | Registro de envíos | Buscar, reenviar, exportar; cada consulta se audita | Administrador |
| PAN-NOT-07 | Límites de la empresa | Consumo del día y topes | Administrador |
| PAN-NOT-08 | Consola de correo de la plataforma | Estado del proveedor, topes globales, totales por empresa | Administrador de plataforma |

## 8. Notificaciones y automatismos

**Catálogo inicial** (nombres `<módulo>.<entidad>_<hecho>`, D-038.5; los de otros módulos los declara cada uno y los acuerdan NOT e `integraciones-api`):

| Código | Grupo | Cuándo | A quién | Obligatorio / se resume |
|---|---|---|---|---|
| `acceso.enlace_solicitado` | Seguridad | Se pide ingresar | Dueño del correo, si tiene cuenta o invitación | Obligatorio, inmediato (v1) |
| `acceso.invitacion_enviada` | Seguridad | Se invita a alguien | Correo invitado | Obligatorio (v1) |
| `acceso.rol_cambiado` | Seguridad | Cambia el rol de alguien | Esa persona; administradores | Obligatorio |
| `acceso.membresia_suspendida` | Seguridad | Suspender o dar de baja | Esa persona | Obligatorio |
| `acceso.segunda_verificacion_cambiada` | Seguridad | Se activa o desactiva | Esa persona | Obligatorio |
| `acceso.empresa_sumada` | Seguridad | Se suma una empresa a su cuenta | Esa persona | Obligatorio |
| `compras.orden_por_aprobar` | Compras y aprobaciones | Orden pasa a Pendiente de aprobación | Usuarios con permiso de aprobar, excepto quien la creó | No se resume; cupo propio (v1) |
| `compras.orden_aprobada` / `compras.orden_rechazada` | Compras y aprobaciones | Decisión | Quien la creó | Inmediato (v1) |
| `ayuda.*` | Casos, plazos, aprobaciones, conocimiento | Ver `mesa-de-ayuda` | Ver `mesa-de-ayuda` | Ver `mesa-de-ayuda` |
| `vencimiento.umbral_alcanzado` | Vencimientos | Se cruza un umbral de días | Responsable más usuarios con el permiso de avisos del módulo | Se resume |
| `notificaciones.envio_fallido` | Administración | Un correo queda Fallido o "no entregable" | Administradores de la empresa que lo envió | Se resume |
| `notificaciones.tope_alcanzado` | Administración | 80 % o 100 % del tope diario | Administradores de la empresa | No se resume |

**Variables permitidas (ejemplos):** código del documento, nombre del servicio, estado, fecha límite, nombre del elemento que vence, fecha, días restantes, nombre de la empresa. **Prohibidas siempre:** importes, claves, comentarios internos, nombres de terceros, serie, IMEI.

**Ejemplo de correo a un usuario.** Asunto: "[Empresa Norte] Respuesta nueva en su caso AYU-000123". Cuerpo: "Hay una respuesta nueva en su caso. Para leerla, ingrese a la plataforma: [enlace]. No responda este correo." **Ejemplo a una Persona sin usuario:** "Empresa Norte: su caso AYU-000123 fue resuelto. Fecha: 25/10/2026."

**Automatismos** (todos con RN-NOT-021): evaluación diaria de avisos por fecha, resúmenes, reintentos, marca de "no entregable", archivo de bandeja, alertas de topes.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se usa | Frontera |
|---|---|---|
| Acceso y usuarios (D-002, D-054) | Enlaces e invitaciones | Acceso genera el enlace (atado al navegador, botón "Entrar"); NOT solo lo entrega y no lo guarda ni lo registra |
| Compras (D-013.10) | Eventos de aprobación | Compras decide cuándo; NOT cómo y a quién |
| Cola, bus y calendario (D-038, D-062) | Reintentos, procesos diarios, hora de la empresa | NOT no define calendario propio |
| Auditoría (D-018) | Cambios y consultas del registro | Sección 6 |
| `mesa-de-ayuda` | Eventos `ayuda.*` | AYU define cuándo y qué dice; NOT decide canal, resumen y límites. Los casos restringidos no emiten eventos |
| `licencias-software`, `lineas-moviles`, `dominios-certificados`, `proveedores-contratos`, `garantias-mantenimiento` | Reglas de aviso por fecha | Declaran entidad, fecha, umbrales y permiso; NOT evalúa, envía, no repite y registra; la clave incluye entidad, tipo, umbral y destinatario |
| `gestion-cambios`, `gestion-problemas` | Eventos propios | Definen evento y texto con contenido mínimo; NOT entrega |
| `reportes-tableros` | Correo de reportes programados | Servicio común; sin adjuntos; los reportes usan ventanas 30/60/90, los avisos los umbrales de NOT |
| `integraciones-api` | Catálogo único de eventos | NOT es dueño del catálogo; INT lo reutiliza para webhooks; NOT no envía a sistemas externos |
| `portal-autoservicio` | Campana y preferencias | Reutiliza PAN-NOT-01 y 02 |
| `entregas-devoluciones`, `onboarding-offboarding` | Avisos a Personas | Fase 2; solo con contenido mínimo y sin enlace (RN-NOT-027) |
| Personas (D-006) | Correo de la Persona | Se resuelve al enviar; no verificado |

## 10. Criterios de aceptación

| ID | Criterio | Cubre |
|---|---|---|
| CA-NOT-01 | **Dado** una orden de compra creada por Ana que pasa a Pendiente de aprobación, **cuando** se emite `compras.orden_por_aprobar`, **entonces** reciben correo los usuarios con permiso de aprobar, Ana no lo recibe, queda un registro de envío por correo y, aun con el tope diario de la empresa agotado, el aviso sale por su cupo propio. | RF-NOT-004, RF-NOT-013, RF-NOT-020; RN-NOT-011 |
| CA-NOT-02 | **Dado** un usuario de las empresas A y B con la A activa, **cuando** abre la campana, **entonces** ve solo avisos de A y un contador de B tomado de la tabla resumen, sin contenido. | RF-NOT-005, RF-NOT-006; RN-NOT-001 |
| CA-NOT-03 | **Dado** un evento de la empresa A, **cuando** el cálculo encuentra a un usuario que solo es miembro de B o que fue dado de baja en A, **entonces** no se le avisa y sus avisos pendientes se descartan. | RF-NOT-003; RN-NOT-002 |
| CA-NOT-04 | **Dado** dos empresas con zonas distintas (Lima y Madrid), una licencia que vence en 30 días con regla 90/60/30 y el reloj de la plataforma fijado, **cuando** el proceso diario corre dos veces el mismo día, **entonces** cada aviso sale una vez, a las 08:00 de su empresa y solo a destinatarios de ella; **cuando** la fecha se corrige a 200 días, **entonces** los avisos pendientes se cancelan; **cuando** el trabajador estuvo apagado 2 días, **entonces** al arrancar procesa los pendientes en orden. | RF-NOT-024, RF-NOT-025, RF-NOT-026; RN-NOT-013, RN-NOT-021, RN-NOT-022 |
| CA-NOT-05 | **Dado** una Persona sin usuario con correo no verificado, **cuando** un evento que lo declara la avisa, **entonces** el correo trae solo tipo, código, fecha y empresa, sin enlace, serie, importes ni nombres; sin correo, no se envía nada. | RF-NOT-007, RF-NOT-027, RF-NOT-030; RN-NOT-003, RN-NOT-027 |
| CA-NOT-06 | **Dado** un usuario, **cuando** apaga un grupo no obligatorio, **entonces** deja de recibirlo; **cuando** intenta apagar `acceso.invitacion_enviada`, **entonces** no puede y el correo sale igual. | RF-NOT-008, RF-NOT-009; RN-NOT-005 |
| CA-NOT-07 | **Dado** un usuario con resumen diario y 8 avisos acumulados, **cuando** llega la hora fijada, **entonces** recibe un solo correo con los 8 agrupados; un aviso "no se resume" salió antes por separado; 3 respuestas en 5 minutos al mismo caso llegan como un aviso. | RF-NOT-011, RF-NOT-012, RF-NOT-013, RF-NOT-014 |
| CA-NOT-08 | **Dado** un usuario que ya recibió 20 correos normales en la hora, **cuando** llega otro, **entonces** no se envía por correo, aparece en la bandeja y entra en su próximo resumen. | RF-NOT-019; RN-NOT-010 |
| CA-NOT-09 | **Dado** el registro de envíos, **cuando** el Administrador lo consulta o exporta, **entonces** la consulta queda en la auditoría, los correos de más de 90 días salen enmascarados y no aparece el cuerpo de ningún mensaje. | RF-NOT-020, RF-NOT-029; RN-NOT-016 |
| CA-NOT-10 | **Dado** un proveedor que falla, **cuando** un envío falla tres veces, **entonces** queda "Fallido" y en la bandeja; **cuando** un correo rebota tres veces seguidas, **entonces** queda "no entregable" (global, sin guardar la empresa de origen) y los administradores de la empresa que envió reciben `notificaciones.envio_fallido`; el adaptador alterno se usa sin cambiar el resto. | RF-NOT-021, RF-NOT-022, RF-NOT-023, RF-NOT-031, RF-NOT-032; RN-NOT-024 |
| CA-NOT-11 | **Dado** una plantilla personalizada, **cuando** el administrador escribe una variable no permitida (p. ej. un importe), **entonces** no se guarda y se explica el motivo; el registro anota la versión usada. | RF-NOT-015, RF-NOT-016, RF-NOT-017, RF-NOT-018 |
| CA-NOT-12 | **Dado** el mismo evento emitido dos veces con igual identificador, **cuando** se procesa, **entonces** hay una sola notificación. | RF-NOT-001, RF-NOT-002; RNF-NOT-005 |
| CA-NOT-13 | **Dado** una notificación para un usuario cuyo permiso se retiró, o un enlace de correo de otra empresa, **cuando** lo abre sin ser miembro, **entonces** ve "ya no está disponible" o "no encontrado", sin título ni datos; siendo miembro, la dirección lo lleva a esa empresa. | RF-NOT-003, RF-NOT-010, RF-NOT-034; RN-NOT-004, RN-NOT-020 |
| CA-NOT-14 | **Dado** 6 pedidos de enlace de ingreso para el mismo correo en una hora, **cuando** llega el sexto, **entonces** no se envía y la respuesta en pantalla es idéntica a la de un pedido normal; para un correo sin cuenta ni invitación no se envía nada. | RF-NOT-019; RN-NOT-008 |
| CA-NOT-15 | **Dado** un evento de la empresa A, **cuando** se intenta escribir (por pantalla, API o proceso) una notificación o un registro de envío que apunte a un objeto o a una membresía de la empresa B, **entonces** la escritura falla por la clave compuesta y no queda nada. | RN-NOT-001, RN-NOT-023; RNF-NOT-007 |
| CA-NOT-16 | **Dado** un usuario Solicitante o Solo lectura, **cuando** pide la pantalla Plantillas o Registro de envíos, o su API directa, **entonces** se deniega sin mostrar datos; un Jefatura TI ve las plantillas pero no las edita. | PS-214, PS-215, PS-218; RF-NOT-016 |
| CA-NOT-17 | **Dado** el Administrador de plataforma, **cuando** consulta la consola de correo, **entonces** ve estado y totales por empresa, nunca destinatarios ni textos; la base se lo impide con su rol (D-039). | RF-NOT-028 |
| CA-NOT-18 | **Dado** una invitación a un correo que ya tiene cuenta, **cuando** se envía, **entonces** el texto es el mismo fijo, no dice que la cuenta existe, la empresa se suma solo al aceptar y la persona recibe el aviso `acceso.empresa_sumada`. | RF-NOT-033 |
| CA-NOT-19 | **Dado** un comentario interno de un caso, **cuando** se notifica a la Persona atendida, **entonces** el aviso no contiene ni referencia su texto. | RN-NOT-003, RN-NOT-006 |
| CA-NOT-20 | **Dado** una orden de compra `OC-000042` creada por Ana y decidida por Luis, **cuando** Luis la aprueba (o la rechaza con motivo), **entonces** Ana recibe de inmediato `compras.orden_aprobada` (o `compras.orden_rechazada`) por correo, con asunto "[Empresa Norte] ...", solo código, tipo de aviso, fecha y empresa (sin importes ni proveedor; el motivo se lee dentro de la plataforma), Luis no recibe aviso y queda un registro de envío por correo. | RF-NOT-004, RF-NOT-007, RF-NOT-013, RF-NOT-033; RN-NOT-003, RN-NOT-005; RF-ACC-021 del núcleo |

**Cuándo corre cada criterio** (QA los ejecuta desde la etapa indicada): **v1, Etapa 1:** CA-NOT-03, 10, 12, 13, 14, 15, 17, 18, 19 y 08 y 09 en lo que toca al correo y a los límites. **v1, Etapa 5** (cuando existen las órdenes de compra): CA-NOT-01 y CA-NOT-20. **Fase 2, ola A:** CA-NOT-02, 04, 05, 06, 07, 11, 16 y la parte de bandeja, exportación y enmascarado de CA-NOT-08 y 09. CA-NOT-05 necesita un evento que avise a una Persona sin usuario; ninguno existe en la v1, por eso corre en Fase 2 con los eventos de entregas y altas.

## 11. Casos límite

1. El proveedor de correo cae 3 horas: los avisos se reintentan; los fallidos quedan en la bandeja y en el registro; los administradores reciben el aviso por la bandeja. En la v1 (sin bandeja) el Administrador de plataforma tiene el acceso de emergencia de D-048.6.
2. La empresa cambia de zona horaria: el resumen y los avisos pendientes usan la zona vigente al enviar.
3. Un correo invitado viene en mayúsculas: se compara con normalización Unicode, sin quitar puntos ni `+` (D-054.6).
4. El único administrador queda "no entregable": el Administrador de plataforma lo ve en la consola y aplica el rescate de D-048.5.
5. Un aviso retenido para resumen se refiere a un objeto anulado: se omite con motivo; si ya salió, se envía igual.
6. Un usuario apaga todos los grupos no obligatorios: solo recibe obligatorios.
7. Un módulo emite un evento fuera del catálogo: se rechaza y se registra un error técnico sin datos del evento.
8. Llegan 500 eventos juntos (importación): se agrupan por usuario y objeto; el tope por empresa protege el costo.
9. Un correo lo comparten dos cuentas de empresas distintas: la cuenta es una (D-002); las empresas se distinguen en el asunto.
10. Se restaura un respaldo: las notificaciones ya enviadas no se reenvían; sesiones y enlaces se revocan antes de abrir (D-052.4).
11. La Persona sin usuario cambia de correo: se usa el vigente al enviar y el cambio queda auditado.
12. Una empresa suspendida: los procesos programados la saltan.

## 12. Decisiones propuestas y supuestos

Resultado según D-057 y D-058: **Confirmado**, **Cambiado** o **Retirado**.

| N.º | Supuesto o decisión | Resultado |
|---|---|---|
| NOT-S01 | Solo dos canales: plataforma y correo (SMS y WhatsApp cuestan por mensaje y amplían el uso de teléfonos personales). | Confirmado. |
| NOT-S02 | NOT-base desde la Etapa 1 y NOT-completo en Fase 2. | **Confirmado** (D-056); NOT-base es RF-ACC-021. |
| NOT-S03 | Por defecto el correo no lleva texto de comentarios ni datos de negocio. | Confirmado (D-061.4). |
| NOT-S04 | Cifras de límites. | **Cambiado:** enlaces, invitaciones y tope por empresa son los del cuadro único de D-054. Solo "20 por hora y 60 por día por persona" sigue como supuesto del módulo. |
| NOT-S05 | Sin correo entrante. | Confirmado. |
| NOT-S06 | Plantillas editables solo en asunto y párrafo inicial. | Confirmado; editar plantillas es permiso sensible (PS-215). |
| NOT-S07 | Retención: bandeja 90 días archivada, registro de envíos 12 meses. | **Confirmado como provisional** (D-058, L-04), con el correo enmascarado pasado el plazo de 90 días (propuesta; el plazo definitivo lo fija Cumplimiento). |
| NOT-S08 | Motor único de avisos por fecha. | **Aceptado solo para la Fase 2** (D-058.3): un motor, una tabla, umbrales por defecto de NOT, una hora única (08:00). Reemplaza la exclusión de avisos automáticos de D-023 solo después de la Etapa 7. |
| E-NOT-01 | [ESCALAR AL CEO] (dinero) **Servicio de envío de correo.** Ya figura en `decisiones.md` (Escalado, Dinero 1). Este módulo suma el volumen de mesa de ayuda, vencimientos y reportes; la capa única necesita un segundo proveedor configurado de respaldo (T-12), que puede tener costo propio; SPF, DKIM y DMARC los configura DevOps. Recomendación: aprobar el servicio con un plan que cubra las Etapas 1 a 5 y revisarlo al activar NOT-completo; DevOps presenta la cifra concreta. | Escalado |
| E-NOT-02 | [ESCALAR AL CEO] (legal) Los correos son datos personales; los plazos de NOT-S07, el enmascarado y el contrato con el proveedor de correo (país del servidor) dependen de la opinión legal ya pedida (Escalado, Legal 1, 2 y 5; L-04). No se activa ninguna eliminación automática del registro antes de esa confirmación. | Escalado |

## 13. Fuera de alcance

- SMS, WhatsApp, Teams, Slack, aplicaciones móviles y notificaciones del navegador.
- Procesar respuestas a los correos o crear casos por correo.
- Envío automático de órdenes de compra al proveedor (D-013.8) y correos a terceros externos.
- Webhooks y envío a sistemas externos (`integraciones-api`).
- Seguimiento de aperturas o clics; adjuntos en correos (D-022).
- Editar el catálogo de eventos desde la plataforma; crear eventos por empresa.
- Horarios de silencio por usuario, delegación durante vacaciones.
- Mensajes masivos o de marketing.

## 14. Historial de cambios

| Cambio | Decisión o hallazgo |
|---|---|
| Versión 0.1 a 0.2; columnas "Cuándo" y "CA" por requisito; cada CA cita lo que cubre | Plan de correcciones (fila Notificaciones); H-AUD-21; D-056 |
| NOT-base es la misma fuente que RF-ACC-021 (invitación, acceso, aprobación; solo correo; campana oculta) | D-056.4; H-AUD-08; D-061.4; H-UX-23 |
| Capa única de envío con adaptador intercambiable y segundo proveedor; sin seguimiento ni cuerpo | T-12; plan de correcciones, Notificaciones (2) |
| Topes pasan al cuadro único (enlaces 5 por correo por hora, 10 por día, 20 por IP; invitaciones 20 y 100; 1.000 por día con cupo propio para obligatorios y `compras.orden_por_aprobar`); el enlace no bloquea al dueño; no se envía a correos sin cuenta | D-054.2 y D-054.3; H-SEG-14, H-SEG-15, H-SEG-24; H-QA-14 |
| La confirmación del caso a quien lo pidió se envía siempre (excepción a "no avisar a quien provoca") | H-QA-14b |
| RN-NOT-002 dice "usuario"; avisos a Personas sin usuario solo si el evento lo declara, con contenido mínimo y sin enlace; correo no verificado | D-061.4; H-CUM-06; H-AUD-18; H-SEG-16; H-CUM-19 |
| Destinatario = membresía o Persona (una sola); objeto referenciado con clave compuesta | D-041; D-039.7; H-DAT-24; H-DAT-01; H-SEG-17 |
| Estado del correo global con dos funciones y sin guardar la empresa de origen; contador de otras empresas desde tabla resumen por usuario | D-039.4 y D-039.5; D-046; H-DAT-01; H-SEG-17; H-QA-18; H-ARQ-02 |
| Motor único de avisos por fecha aceptado solo para Fase 2, con umbrales por defecto y una hora única (08:00); una sola tabla de avisos; vigencias calculadas al leer | D-058.3; D-062.2 y D-062.3; H-DAT-17; H-AUD-19 |
| Procesos programados idempotentes, recuperables, por empresa, "hoy" de cada empresa, con registro de corrida | D-038.4; H-SEG-02; H-QA-12; H-ARQ-01 |
| Catálogo único de eventos `<módulo>.<entidad>_<hecho>` acordado con INT; eventos de acceso y compras renombrados; nuevo `acceso.empresa_sumada` | D-038.5; H-ARQ-11; D-054.4 |
| Invitaciones con texto fijo que no revelan si el correo existe; la empresa se suma al aceptar | D-054.4; H-SEG-15 |
| Enlaces con la empresa en la dirección y "no encontrado" si no es miembro | D-046; H-QA-18 |
| Plantilla editable es permiso sensible (PS-215); registro de envíos con correo enmascarado a los 90 días; las consultas al registro se auditan (se corrige el 0.1 que decía que no) | Plan de correcciones, Notificaciones (10); D-061.6; H-CUM-13; H-CUM-09 |
| Sección 3 migrada a PS-211 a PS-219, PS-20, PS-04 y PS-06; se agrega la columna "Empleado (portal)" y la columna de plataforma | Registro de permisos; D-036; D-037 fila 11; H-AUD-17 |
| Archivar la bandeja significa fuera de la vista con el mismo plazo de retención | H-CUM-09 (D-061.3) |
| Registros técnicos sin correos completos; SPF, DKIM y DMARC por DevOps | T-14; D-054.4 |
| Supuestos con resultado (NOT-S04 cambiado, NOT-S07 provisional, NOT-S08 solo Fase 2); escalados `E-NOT-01` y `E-NOT-02` (antes NOT-E01 y NOT-E02); pantallas `PAN-NOT-nn` | D-057; D-058; D-049.4; H-AUD-22 |
| Nuevo CA-NOT-20 (aviso de aprobación o rechazo al creador, v1); se agrega la lista de qué CA corre desde la Etapa 1, la Etapa 5 y la Fase 2; RF-NOT-007, 013 y 004 citan CA de la v1 | Revisión del plan de pruebas; RF-ACC-021; D-013.10 |
| Nuevos CA: dos empresas en el proceso programado con reloj fijado, escritura con referencias cruzadas, permiso denegado, plataforma sin contenido | D-039.6; D-063.6; H-SEG-02; H-QA-12 |
| Se retiran de 0.1: el contador "de otras empresas" calculado por consulta conjunta, el motor de avisos sin hora única y "las consultas al registro no se auditan" | H-QA-18; H-AUD-19; H-CUM-13 |

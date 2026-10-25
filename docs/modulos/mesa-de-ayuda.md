# Módulo: Mesa de ayuda (slug `mesa-de-ayuda`, sigla AYU)

**Versión:** 0.2 (corregida tras la Mesa #002; ver sección 14). **Base:** decisiones D-001 a D-064 (`docs/equipo/decisiones.md`), `docs/equipo/plan-correcciones.md` y documento funcional del núcleo.
**Cuándo:** **Fase 2, ola C** (D-056). **Convenciones:** [SUPUESTO] = propuesta del módulo con su resultado en la sección 12. [ESCALAR AL CEO] = dinero, tema legal o algo irreversible. Los permisos son los del registro único `docs/registro-permisos.md` (PS-nn, D-036); este módulo no inventa permisos.

## 1. Propósito, alcance y fase

**Propósito.** Que cualquier persona de la empresa pida ayuda a TI (algo dejó de funcionar, o necesita algo) en un solo lugar; que el equipo de TI atienda cada pedido con plazos internos, deje constancia de lo que hizo y reutilice lo aprendido.

**Fase.** Fase 2, ola C, después de la Etapa 7. Necesita: Personas (Etapa 2), Inventario y acta de entrega ENT-A (Etapa 4), Órdenes de servicio (Etapa 6) y Notificaciones completo (Fase 2, ola A). Se activa por empresa (D-037 fila 12).

**Botón "Pedir ayuda" (D-053, DS-01).** En la v1 crea una orden de servicio en estado Creada. Al activar este módulo, el botón abre el catálogo de servicios (PAN-AYU-01) y la orden de servicio la crea el técnico desde el caso.

**Entra:** casos de dos tipos (incidente y pedido de servicio); catálogo de servicios con 4 servicios iniciales; categorías; formularios por servicio y aprobación opcional; prioridad por impacto y urgencia; plazos internos (SLA) de primera respuesta y de resolución; colas, asignación y escalamiento; comentarios públicos e internos; encuesta; casos restringidos para derechos de datos; redacción por seguridad; base de conocimiento con versiones y búsqueda; vínculo con activos, órdenes de servicio y órdenes de compra.

**No entra** (sección 13): adjuntos (D-022), correo entrante, chat, calendario propio (se usa el de la empresa), gestión de cambios y de problemas, reportes avanzados.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Caso** | Un pedido de ayuda. Número `AYU-000123`, único por empresa y nunca reutilizado (D-007, D-049). |
| **Incidente** | Algo que funcionaba y dejó de funcionar. Ej.: "mi laptop no enciende". |
| **Pedido de servicio** | Algo que se pide y no es una falla. Ej.: "instalar Office", "línea nueva". No es la "solicitud de trabajo" del núcleo (orden de servicio en Creada). |
| **Persona atendida** | La **Persona** a quien se ayuda (campo "Pedido por"). Puede no tener usuario (D-006). No es el rol "Solicitante". |
| **Agente** | Usuario que atiende casos (rol Técnico por defecto). |
| **Catálogo de servicios** | Lista de lo que TI ofrece, en palabras del usuario, con su formulario. |
| **Categoría de ayuda** | Agrupación de casos (Hardware, Software, Accesos). Distinta de la categoría de SKU. |
| **Impacto / Urgencia** | A cuántas personas afecta (una, un área, toda la empresa) / cuánto impide trabajar. |
| **Prioridad** | Impacto × urgencia: P1 Crítica, P2 Alta, P3 Media, P4 Baja. |
| **SLA** | Plazos **internos** de TI: primera respuesta y resolución. No es el "compromiso de servicio" de un proveedor (módulo de proveedores). |
| **Primera respuesta** | El primer comentario público de un agente. Asignar o cambiar estado no cuenta. |
| **Calendario de la empresa** | Zona horaria, horario de atención y feriados. Es del núcleo y lo comparten varios módulos (D-062.4). |
| **Cola** | Grupo de agentes que atiende cierto tipo de casos. |
| **Comentario público / interno** | Público lo ve la Persona atendida; interno solo los agentes. |
| **Retirar / Redactar** | Retirar: el autor oculta su propio comentario; el texto se conserva y lo ve quien tenga PS-140. Redactar (PS-153): reemplaza el texto por `[REDACTADO]` y no se puede deshacer (D-061.5). |
| **Caso restringido** | Caso de derechos de datos personales; invisible salvo para quien tenga PS-29. |
| **Escalamiento** | Pasar un caso a otro nivel o avisar a una jefatura porque no avanza o se va a vencer el plazo. |
| **Artículo** | Texto de la base de conocimiento. Código `KB-000001` (D-049). |

## 3. Roles y permisos

Alcance: **T** todo, **P** solo lo propio (casos donde la persona es la Persona atendida o la creó; resolvedor por Persona vinculada; sin Persona vinculada la lista sale vacía, nunca error, D-036.4), **C** solo en las colas de las que es miembro, **-** no. Todo rol nuevo parte sin permisos. Los módulos agregan filas; no cambian celdas del núcleo (D-037). **Empleado (portal)** es la plantilla de lista cerrada (D-037 fila 11).

| PS | Permiso | Adm. | Jef. TI | Téc. | Alm. | Sol. | S. lectura | Emp. (portal) |
|---|---|---|---|---|---|---|---|---|
| PS-138 | `ayuda.caso_crear` | T | T | T | T | T | - | P |
| PS-139 | `ayuda.caso_ver` | T | T | T | P | P | T | P |
| PS-22 | `datos_personales.ver` (sensible; fila del núcleo: sin él se ve `PRS-0042`) | T | T | T | - | - | - | - |
| PS-140 | `ayuda.caso_ver_interno` | T | T | T | - | - | - | - |
| PS-141 | `ayuda.caso_comentar_publico` | T | T | T | P | P | - | P |
| PS-142 | `ayuda.caso_comentar_interno` | T | T | T | - | - | - | - |
| PS-143 | `ayuda.caso_tomar` | T | - | T | - | - | - | - |
| PS-144 | `ayuda.caso_asignar` (asignar, reasignar, cambiar cola) | T | T | - | - | - | - | - |
| PS-145 | `ayuda.caso_cambiar_estado` (incluye resolver) | T | - | T | - | - | - | - |
| PS-146 | `ayuda.caso_cambiar_prioridad` | T | T | T | - | - | - | - |
| PS-147 | `ayuda.caso_escalar` | T | - | T | - | - | - | - |
| PS-148 | `ayuda.caso_cerrar` | T | - | T | - | - | - | - |
| PS-149 | `ayuda.caso_cancelar` | T | - | T | P | P | - | P |
| PS-150 | `ayuda.caso_reabrir` | T | - | T | - | P | - | P |
| PS-151 | `ayuda.caso_vincular` (activos, casos, órdenes, artículos) | T | - | T | - | - | - | - |
| PS-152 | `ayuda.caso_crear_orden_servicio` (exige además PS-70) | T | - | T | - | - | - | - |
| PS-153 | `ayuda.caso_redactar` (sensible: 2F, cada uso auditado, motivo) | T | - | - | - | - | - | - |
| PS-154 | `ayuda.solicitud_aprobar` (nunca sobre lo propio) | T | T | - | - | - | - | - |
| PS-29 | `personas.derechos_atender` (sensible; atiende los casos restringidos) | T | - | - | - | - | - | - |
| PS-155 | `ayuda.encuesta_responder` | P | P | P | P | P | - | P |
| PS-156 | `ayuda.encuesta_ver_resultados` (promedios) | T | T | - | - | - | - | - |
| PS-157 | `ayuda.encuesta_ver_detalle` (con nombre; cada uso auditado) | T | T | - | - | - | - | - |
| PS-158 | `ayuda.catalogo_ver` | T | T | T | T | T | T | T (servicios visibles) |
| PS-159 | `ayuda.catalogo_administrar` (servicios, categorías, formularios) | T | - | - | - | - | - | - |
| PS-160 | `ayuda.cola_administrar` | T | T | - | - | - | - | - |
| PS-161 | `ayuda.sla_configurar` (tiempos por prioridad, plazos de cierre y recordatorio) | T | - | - | - | - | - | - |
| PS-162 | `ayuda.conocimiento_ver` (publicados públicos) | T | T | T | T | T | T | T |
| PS-163 | `ayuda.conocimiento_ver_interno` | T | T | T | - | - | - | - |
| PS-164 | `ayuda.conocimiento_editar` (borradores y versiones) | T | - | T | - | - | - | - |
| PS-165 | `ayuda.conocimiento_publicar` (publicar y archivar; segunda persona solo al publicar) | T | T | - | - | - | - | - |
| PS-166 | `ayuda.tablero_ver` (SLA y escalados) | T | T | T | - | - | - | - |
| PS-20 | `datos.exportar` (sensible; solo lo que el usuario ya ve) | T | - | - | - | - | - | - |

Notas de lectura de la matriz:
- **"Propio" en AYU** es el resolvedor de D-036.4: el caso donde la Persona vinculada es la Persona atendida o quien lo pidió; para quien atiende, las colas de las que es miembro (RN-AYU-015). Sin Persona vinculada, la lista sale vacía.
- Registrar un caso a nombre de otra Persona exige además `personas.ver` con alcance todo (PS-24) y `datos_personales.ver` (PS-22): Almacén y Solicitante solo pueden pedir por sí mismos.
- Confirmar un extravío exige PS-46 (INV); crear una orden de compra exige PS-62; no se repiten aquí. No hay importación en este módulo (PS-21 no aplica).
- Los permisos S exigen segunda verificación a quien los tenga (D-048.1); PS-157 y PS-153 quedan en la auditoría con cada uso.

## 4. Requisitos

### 4.1 Requisitos funcionales (RF)

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-AYU-001 | La Persona atendida (o un agente por ella) crea un caso eligiendo un servicio del catálogo y llenando su formulario. | Fase 2 | CA-AYU-01 |
| RF-AYU-002 | Un agente registra un caso en nombre de otra Persona (exige PS-24 todo y PS-22) e indica el canal de origen (teléfono, presencial, mensaje reenviado, otro). | Fase 2 | CA-AYU-02 |
| RF-AYU-003 | Cada caso es incidente o pedido de servicio; el tipo viene del servicio y un agente puede reclasificarlo con motivo. | Fase 2 | CA-AYU-01 |
| RF-AYU-004 | Cada caso recibe un número correlativo por empresa con el contador de D-007 (reserva en transacción corta y propia, T-11). | Fase 2 | CA-AYU-01 |
| RF-AYU-005 | La prioridad se calcula con la matriz de RN-AYU-003; un agente la puede cambiar con motivo. | Fase 2 | CA-AYU-01, CA-AYU-03 |
| RF-AYU-006 | El administrador mantiene el catálogo: nombre, descripción simple, tipo, categoría, cola, impacto y urgencia sugeridos, formulario, si exige aprobación y si es visible para empleados. | Fase 2 | CA-AYU-13 |
| RF-AYU-007 | Las categorías de ayuda tienen un nivel de subcategoría (como D-008) y se desactivan, no se borran. | Fase 2 | CA-AYU-13 |
| RF-AYU-008 | El formulario de cada servicio usa el **motor único de campos** (ámbito `servicio_ayuda`, T-13) con las reglas de D-005: tipos texto, número, fecha, lista y sí/no (el tipo "secreto" no se ofrece aquí); un campo con datos se desactiva y no cambia de tipo. | Fase 2 | CA-AYU-13 |
| RF-AYU-009 | Un servicio puede exigir aprobación; el caso queda "Pendiente de aprobación" hasta que alguien con PS-154 apruebe o rechace con motivo (RN-AYU-011). | Fase 2 | CA-AYU-07, CA-AYU-08 |
| RF-AYU-010 | El administrador o la jefatura crean colas, definen miembros y un responsable de cola. | Fase 2 | CA-AYU-11 |
| RF-AYU-011 | La asignación es manual, por "tomar el caso" o por reparto en turnos (opcional por cola). | Fase 2 | CA-AYU-11 |
| RF-AYU-012 | Reasignar o cambiar de cola exige motivo y conserva el reloj del SLA. | Fase 2 | CA-AYU-11 |
| RF-AYU-013 | Los comentarios son públicos o internos; el interno se marca antes de enviar y no se convierte en público. | Fase 2 | CA-AYU-06 |
| RF-AYU-014 | Un comentario no se edita ni se borra; su autor puede **retirarlo** (lo oculta) y el Administrador puede **redactarlo** (RN-AYU-025). | Fase 2 | CA-AYU-18 |
| RF-AYU-015 | El caso sigue los estados y transiciones de la sección 5, comprobadas en el servidor. | Fase 2 | CA-AYU-05 |
| RF-AYU-016 | Los plazos se miden con el **calendario de la empresa** del núcleo (zona, horario, feriados); AYU no define uno propio. | Fase 2 | CA-AYU-04 |
| RF-AYU-017 | El administrador define por prioridad el tiempo de primera respuesta y el de resolución; un servicio puede traer tiempos propios. | Fase 2 | CA-AYU-04 |
| RF-AYU-018 | Cada caso muestra su estado de SLA con texto y color: En plazo, En riesgo (80 % consumido), Vencido, Cumplido. Se **calcula al leer** (D-062.2). | Fase 2 | CA-AYU-04 |
| RF-AYU-019 | Un agente escala un caso (a otra cola o nivel) con motivo; queda marcado "Escalado" y se avisa al responsable de la cola destino. | Fase 2 | CA-AYU-12 |
| RF-AYU-020 | El sistema solo avisa: al 80 % y al vencer cada tiempo se avisa al responsable de la cola y a Jefatura TI. | Fase 2 | CA-AYU-12 |
| RF-AYU-021 | Un caso se vincula con uno o varios activos de la empresa; la Persona atendida elige entre los que tiene asignados. | Fase 2 | CA-AYU-24 |
| RF-AYU-022 | La ficha de cada activo muestra los casos vinculados. | Fase 2 | CA-AYU-24 |
| RF-AYU-023 | El **técnico** crea desde el caso una orden de servicio (copia persona, activo y descripción); el caso muestra su estado. | Fase 2 | CA-AYU-09 |
| RF-AYU-024 | Un caso se relaciona con otros: "duplicado de", "relacionado con", "seguimiento de". | Fase 2 | CA-AYU-24 |
| RF-AYU-025 | Resolver exige texto de solución y código de resolución (Resuelto, No reproducible, Duplicado, Sin respuesta, Resuelto por un tercero, Extravío confirmado, Atendido con compra). | Fase 2 | CA-AYU-09 |
| RF-AYU-026 | Un caso Resuelto pasa a Cerrado solo tras el plazo configurado (o lo cierra un agente con PS-148). | Fase 2 | CA-AYU-19 |
| RF-AYU-027 | La Persona atendida o un agente reabren un caso Resuelto dentro del plazo de RN-AYU-008. | Fase 2 | CA-AYU-10 |
| RF-AYU-028 | Al resolver, la Persona atendida con usuario recibe una encuesta de 1 a 5 y un comentario opcional. | Fase 2 | CA-AYU-16 |
| RF-AYU-029 | La jefatura ve promedios por agente, cola, servicio y periodo; ver respuestas con nombre es un permiso aparte. | Fase 2 | CA-AYU-16 |
| RF-AYU-030 | La base de conocimiento permite crear, editar, publicar y archivar artículos: Borrador, Publicado y Archivado. | Fase 2 | CA-AYU-14 |
| RF-AYU-031 | Cada publicación crea una versión numerada e inalterable; se puede ver el historial y restaurar una versión como nuevo borrador. | Fase 2 | CA-AYU-14 |
| RF-AYU-032 | La búsqueda encuentra artículos por título, resumen, texto y etiquetas, sin distinguir mayúsculas ni tildes. | Fase 2 | CA-AYU-15 |
| RF-AYU-033 | Mientras se escribe el asunto de un caso se sugieren hasta 5 artículos públicos. | Fase 2 | CA-AYU-15 |
| RF-AYU-034 | Un agente asocia al caso el artículo usado y crea un borrador a partir de un caso resuelto (sin copiar datos personales). | Fase 2 | CA-AYU-15 |
| RF-AYU-035 | Cada artículo tiene "me sirvió / no me sirvió", una valoración por usuario. | Fase 2 | CA-AYU-14 |
| RF-AYU-036 | Cada artículo tiene fecha de próxima revisión; al vencer se avisa a su autor y a la jefatura. | Fase 2 | CA-AYU-14, CA-AYU-19 |
| RF-AYU-037 | Las listas tienen buscador, filtros (estado, cola, prioridad, tipo, SLA, agente, servicio, activo) y exportación por la **puerta única** del núcleo (D-061.1). | Fase 2 | CA-AYU-27 |
| RF-AYU-038 | Cada caso muestra una línea de tiempo con todo cambio: quién, cuándo, qué y motivo. | Fase 2 | CA-AYU-27 |
| RF-AYU-039 | Sin adjuntos (D-022): el formulario avisa "describa el problema con texto" y no ofrece subir archivos. | Fase 2 | CA-AYU-27 |
| RF-AYU-040 | Cuando una Persona se anonimiza (D-024, D-033), sus casos conservan el historial con la referencia en lugar del nombre. | Fase 2 | CA-AYU-22 |
| RF-AYU-041 | El catálogo trae 4 servicios iniciales que no se borran, solo se desactivan: reportar un problema, reportar un extravío, solicitar un equipo y pedir mis datos personales (este último es restringido). Los usan el portal y otros módulos. | Fase 2 | CA-AYU-13 |
| RF-AYU-042 | Un incidente puede indicar un elemento afectado de `cmdb-ligera` y muestra, en solo lectura, su problema o cambio vinculado, el error conocido con su solución temporal y la garantía vigente del activo. | Fase 2 | CA-AYU-24 |
| RF-AYU-043 | Al activar el módulo, el botón "Pedir ayuda" abre el catálogo (PAN-AYU-01). Las órdenes de servicio en Creada que ya existían siguen su curso. | Fase 2 | CA-AYU-21 |
| RF-AYU-044 | Un caso se vincula, solo como referencia, con una orden de compra en Borrador creada por TI; mostrar número y estado. | Fase 2 | CA-AYU-21, CA-AYU-24 |
| RF-AYU-045 | **Casos restringidos** (derechos de datos): solo los ve quien tenga PS-29; AYU guarda una referencia sin contenido al registro de solicitudes de derechos de Personas (D-061.2). | Fase 2 | CA-AYU-17 |
| RF-AYU-046 | **Redacción por seguridad** (PS-153): reemplaza un texto por `[REDACTADO]`; exige motivo; la auditoría guarda quién, cuándo y por qué, sin el texto. | Fase 2 | CA-AYU-18 |
| RF-AYU-047 | **Confirmar extravío:** desde un caso de extravío el agente abre el diálogo único "Cambiar estado" del activo, con motivo y activo precargados; INV aplica la transición con sus permisos y el caso queda vinculado. | Fase 2 | CA-AYU-20 |
| RF-AYU-048 | AYU declara en el registro de módulo los **pendientes de la persona**: casos abiertos donde la Persona cesada es la atendida (D-038.6, D-061.7). | Fase 2 | CA-AYU-22 |

### 4.2 Reglas de negocio (RN)

| ID | Regla |
|---|---|
| RN-AYU-001 | Todo dato lleva empresa, con clave compuesta (empresa, id); un identificador de otra empresa responde "no encontrado" (D-021, D-039). Las referencias a activos, órdenes, casos, artículos, colas y servicios deben ser de la misma empresa. |
| RN-AYU-002 | La Persona atendida es una Persona Activa. Una Persona Cesada no puede ser atendida en casos nuevos; sus casos abiertos no se cancelan solos y aparecen como pendientes de la persona (RF-AYU-048). El cese nunca se bloquea por casos; sí se bloquea anonimizar mientras haya casos abiertos (D-034, D-061.7). |
| RN-AYU-003 | Matriz fija: Alto+Alta=P1; Alto+Media=P2; Alto+Baja=P3; Medio+Alta=P2; Medio+Media=P3; Medio+Baja=P4; Bajo+Alta=P3; Bajo+Media=P4; Bajo+Baja=P4. |
| RN-AYU-004 | La Persona atendida responde dos preguntas simples (a quién afecta, cuánto le impide trabajar); el sistema calcula la prioridad. Un caso P1 avisa de inmediato a la cola. |
| RN-AYU-005 | Todo cambio de prioridad, tipo o cola por un agente lleva motivo y queda en la línea de tiempo. |
| RN-AYU-006 | El reloj del SLA corre solo dentro del calendario de la empresa y se detiene en "Pendiente de aprobación", "En espera del solicitante" y "En espera de tercero". |
| RN-AYU-007 | Los tiempos se fijan al crear el caso; cambiar la política no altera casos abiertos. Cambiar prioridad o tipo recalcula desde la fecha de creación. |
| RN-AYU-008 | Un caso Resuelto se reabre hasta 7 días hábiles después; el reloj de resolución continúa con lo ya consumido. Después se crea un caso "seguimiento de". |
| RN-AYU-009 | Los comentarios internos nunca se muestran ni se envían a quien no tenga PS-140, ni en notificaciones, ni en exportaciones, ni por la API. |
| RN-AYU-010 | Un caso no se resuelve si tiene órdenes de servicio abiertas vinculadas; primero se cierran o cancelan. Abrir o cerrar una orden no cambia sola el estado del caso ni del activo (D-027). |
| RN-AYU-011 | Para un pedido con aprobación rige la **regla única RN-017** del núcleo y el servicio único de doble control (D-043): aprueba quien no lo pidió ni lo creó ni editó su formulario desde la última aprobación. La única excepción es la casilla "mesa de ayuda" del interruptor único de la empresa (D-031, vence a los 90 días, aviso visible y auditoría de cada uso). AYU no tiene excepción propia. |
| RN-AYU-012 | Un caso Cerrado no se reabre: se crea otro vinculado. Un caso Cancelado o Rechazado tampoco. |
| RN-AYU-013 | Nada con historial se borra: casos se cancelan o cierran, servicios y colas se desactivan, artículos se archivan (D-019). |
| RN-AYU-014 | No se vinculan activos De baja a casos nuevos; los casos históricos los conservan. |
| RN-AYU-015 | Un agente solo toma casos de las colas de las que es miembro (PS-143); Jefatura TI y Administrador asignan a cualquier agente activo (PS-144). El Técnico que no puede resolver, escala (PS-147). |
| RN-AYU-016 | Si un agente se suspende o se da de baja, sus casos abiertos vuelven a su cola sin responsable y se avisa a la cola. |
| RN-AYU-017 | Tomar un caso es una actualización condicional con el estado esperado: si dos agentes lo toman a la vez, uno gana y el otro ve "ya fue tomado por otra persona". |
| RN-AYU-018 | Un servicio inactivo no se usa en casos nuevos; los existentes lo conservan. Una cola con casos abiertos no se desactiva hasta reasignarlos. Los 4 servicios iniciales no se borran. |
| RN-AYU-019 | En "En espera del solicitante" se recuerda a los 2 días hábiles y se resuelve solo a los 5 con código "Sin respuesta". Ambos plazos son configurables. |
| RN-AYU-020 | El escalamiento automático solo avisa; no reasigna ni cambia prioridad. |
| RN-AYU-021 | Un caso duplicado se resuelve con código "Duplicado" y vínculo al principal; su SLA cuenta como cumplido. |
| RN-AYU-022 | Encuesta: una por caso, solo de la Persona atendida con usuario, válida 7 días, no editable. Los promedios por agente se muestran con 5 respuestas o más. |
| RN-AYU-023 | Un artículo Publicado no se modifica: editarlo crea un borrador de la versión siguiente y la publicada sigue visible hasta publicar la nueva. |
| RN-AYU-024 | Artículos "solo para agentes" no aparecen a otros roles en lectura, sugerencias ni búsquedas. No hay base de conocimiento compartida entre empresas. |
| RN-AYU-025 | Todo texto se trata como texto, nunca como código (RS-42). Un **validador común** rechaza bloques de clave privada y patrones de claves conocidas en todo texto libre (D-063.2). Los artículos y soluciones aceptan texto simple o un formato limitado con etiquetas permitidas; los enlaces externos son solo `https`, con aviso de salida y sin vista previa. Asunto máximo 150 caracteres, comentario 5.000. Los formularios avisan "no escriba contraseñas ni datos personales innecesarios". Retirar (el autor oculta su comentario) y redactar (PS-153) son operaciones distintas (D-061.5). |
| RN-AYU-027 | Un caso restringido es invisible por lista, búsqueda global, exportación, reportes, tableros, API, webhooks, avisos y SLA, también para quien tenga PS-139 con alcance T. No se vincula a problemas ni cambios ni cuenta en la sugerencia "3 o más parecidos". Quien presenta el pedido no lo atiende; un Administrador no atiende un pedido sobre sí mismo. No genera eventos de AYU: el aviso a quien atiende sale del registro de derechos de Personas. |
| RN-AYU-028 | Todo proceso periódico de AYU (recordatorios, resolución por espera, cierre automático, avisos de SLA, revisión de artículos) es **idempotente** (correrlo dos veces no duplica), **recuperable** (al arrancar procesa los días pendientes en orden y no pierde avisos), corre empresa por empresa con la empresa fijada dentro de la transacción, salta empresas suspendidas, calcula "hoy" con la zona de la empresa y registra cada corrida (D-038.4). |
| RN-AYU-029 | Los correos de AYU llevan solo tipo de aviso, código (`AYU-000123`, `PRS-0042`), fecha y nombre de la empresa. Nunca asunto, texto de comentarios, nombres de terceros ni enlaces de acción a una Persona sin usuario o a una dirección no verificada (D-061.4). |
| RN-AYU-030 | Las acciones automáticas (cierre, resolución por espera, marcas de SLA) se registran con autor "sistema", el identificador de la regla y de quien la configuró (D-041.4). |
| RN-AYU-031 | La auditoría guarda "el campo X cambió" para texto libre (asunto, descripción, comentarios, motivos, valores del formulario) y datos personales, sin el valor anterior ni el nuevo (D-030.6). La línea de tiempo del caso sí guarda estados, prioridad, cola y responsable con valor anterior y nuevo. |
| RN-AYU-032 | "Solicitar un equipo" crea un caso, no una orden de compra. TI decide si sale de stock o se compra; en ese caso el agente con permiso de compras crea la orden en Borrador y la vincula como referencia (D-058). |
| RN-AYU-033 | "Reportar un extravío" es un caso (AYU es el dueño); ENT guarda solo la asignación cerrada. El cambio de estado del activo lo hace el diálogo único de INV cuando el agente confirma; resolver con código "Extravío confirmado" exige ese cambio ya registrado. Los textos con posible acusación se ven solo con PS-140, y no salen en portal, exportaciones ni reportes (D-061.5). |
| RN-AYU-034 | El estado de un caso no cambia el de una orden de servicio, de compra ni del activo; todo cambio entre módulos pasa por el servicio dueño con sus permisos. |
| RN-AYU-035 | Quien publica un artículo no puede ser quien redactó o editó esa versión (PS-165, servicio único de doble control); aplica solo a publicar, no a archivar. La excepción es la casilla "mesa de ayuda" (RN-AYU-011). |

Retirada: RN-AYU-026 (tiempo de primera respuesta en llamadas) no se reutiliza; la definición de primera respuesta está en el glosario.

### 4.3 Requisitos de calidad (RNF)

| ID | Requisito medible | Cuándo |
|---|---|---|
| RNF-AYU-001 | Crear un caso desde el catálogo toma como máximo 3 pasos y 90 segundos para un usuario sin entrenamiento (prueba con 5 personas). | Fase 2 |
| RNF-AYU-002 | Las listas responden en menos de 2 segundos (percentil 95) con el volumen de referencia de RNF-010 del núcleo y, cuando haya cifras (P-003), con 10 veces los casos mensuales informados. | Fase 2 |
| RNF-AYU-003 | La búsqueda de artículos responde en menos de 1 segundo (percentil 95) con 2.000 artículos publicados. | Fase 2 |
| RNF-AYU-004 | Los avisos de SLA en riesgo y vencido salen dentro de 5 minutos del umbral, aun tras una caída del trabajador (recuperación de RN-AYU-028). | Fase 2 |
| RNF-AYU-005 | El cálculo del SLA es exacto al minuto, incluidos cruces de horario, feriados y pausas; se prueba con el reloj de la plataforma fijado (D-038.8) y casos con resultado conocido. | Fase 2 |
| RNF-AYU-006 | 20 casos creados a la vez reciben 20 números distintos y crecientes (puede haber saltos). | Fase 2 |
| RNF-AYU-007 | El texto de un comentario interno no sale del servidor hacia quien no tiene permiso (no basta ocultarlo en pantalla). | Fase 2 |
| RNF-AYU-008 | Pantallas por teclado, a 360 px de ancho, contraste AA y estados con texto además de color (D-021, D-053). | Fase 2 |
| RNF-AYU-009 | Cada tabla nueva tiene prueba de aislamiento entre empresas por identificador interno (D-025, D-063.6) y las métricas de SLA se reconstruyen con el historial (fechas en hora universal). | Fase 2 |

## 5. Estados y transiciones

**Caso.** Estados: Pendiente de aprobación, Nuevo, En atención, En espera del solicitante, En espera de tercero, Resuelto, Cerrado, Cancelado, Rechazado. "Asignado" no es estado: es un dato (responsable).

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (creación) | Nuevo | Persona atendida o agente | Servicio sin aprobación |
| (creación) | Pendiente de aprobación | Persona atendida o agente | Servicio con aprobación |
| Pendiente de aprobación | Nuevo | PS-154, distinta persona (RN-AYU-011) | El reloj arranca aquí |
| Pendiente de aprobación | Rechazado | Igual | Motivo obligatorio; final |
| Nuevo | En atención | Agente al tomar o ser asignado | Automático |
| En atención | En espera del solicitante / de tercero | Agente con PS-145 | Motivo; pausa reloj |
| En espera (cualquiera) | En atención | Agente, o automático si la Persona atendida comenta | Reanuda reloj |
| En atención | Resuelto | Agente con PS-145 | Solución y código; RN-AYU-010 |
| En espera del solicitante | Resuelto | Sistema | RN-AYU-019 |
| Resuelto | En atención | Persona atendida (propio) o agente (PS-150) | RN-AYU-008; motivo |
| Resuelto | Cerrado | Agente (PS-148) o sistema | Plazo de cierre (3 días hábiles por defecto) |
| Nuevo, En atención, En espera | Cancelado | Administrador o Técnico (PS-149); la Persona atendida (propio) solo en Nuevo | Motivo obligatorio; final |

No hay otras transiciones. Finales: Cerrado, Cancelado, Rechazado. Cada una registra quién, cuándo y motivo.

**Artículo.** Borrador → Publicado (PS-165; otra persona que quien lo redactó); Publicado → Borrador de nueva versión (al editar; el publicado sigue visible); Publicado → Archivado (motivo); Archivado → Borrador. Una versión publicada nunca cambia.

**SLA del caso (calculado al leer, no guardado):** En plazo → En riesgo (80 %) → Vencido; o Cumplido al responder o resolver a tiempo. El proceso periódico solo emite los avisos (D-062.2).

## 6. Datos

| Entidad | Campos principales (lenguaje simple) | Clave y unicidad |
|---|---|---|
| Caso | empresa, número, tipo, servicio, categoría, asunto, descripción, Persona atendida ("Pedido por"), creado por (membresía), canal, impacto, urgencia, prioridad, estado, cola, responsable (membresía), fechas, código y texto de resolución, marca de escalado, elemento afectado (opcional), restringido (sí/no), referencia al registro de derechos (sin contenido), valores del formulario (JSON validado), versión | número único por empresa, nunca repetido |
| Comentario | caso, autor, público o interno, texto, fecha, retirado (quién, motivo), redactado (sí/no) | solo se agrega |
| Historial del caso | caso, cambio, valor anterior y nuevo (no texto libre), autor (membresía, integración o sistema), fecha, motivo | solo se agrega |
| Medición de SLA | metas fijadas, fechas reales de primera respuesta y de resolución, "cumplió" sí/no/no aplica de cada una (lo cuenta `reportes-tableros`), minutos consumidos, pausas | una por caso |
| Vínculos | caso-activo, caso-orden de servicio, caso-orden de compra (referencia), caso-caso (tipo), caso-artículo (versión usada); todos con clave compuesta (empresa, id) | sin repetir el par |
| Servicio del catálogo | nombre, descripción, tipo, categoría, cola, prioridad sugerida, tiempos propios, exige aprobación, visible para empleados, restringido, inicial (sí/no), activo | nombre único por empresa |
| Definición de campo (ámbito `servicio_ayuda`) | servicio, nombre, tipo, obligatorio, opciones, activo | identificador interno estable |
| Categoría de ayuda | nombre, padre, activa | nombre único por padre y empresa |
| Cola y miembros | nombre, responsable, reparto en turnos, activa; cola-usuario | nombre único por empresa |
| Política de SLA y configuración | prioridad, minutos de primera respuesta y de resolución; plazos de cierre, recordatorio y reapertura | una por prioridad y empresa |
| Encuesta | caso, puntuación 1 a 5, comentario, fecha | una por caso |
| Artículo y versión | código KB, título, resumen, etiquetas, categoría, audiencia, estado, autor, próxima revisión; versión: número, texto, fecha | código único por empresa; número único por artículo; inalterable |
| Valoración de artículo | artículo, usuario, sirvió sí/no | una por usuario y artículo |

**Se audita (D-018, D-030):** altas y cambios de servicios, colas, políticas y configuración; cambios de prioridad, tipo, cola, responsable y estado; escalamientos; comentarios retirados; redacciones (sin el texto); usos de la casilla "mesa de ayuda"; publicar y archivar artículos; consultas al detalle de encuestas y lecturas masivas (desde 5.000 filas); exportaciones. **No se guarda** en la auditoría el valor de nombres, correos ni texto libre. **Datos personales del módulo (D-061.3):** nombre de la Persona atendida (por referencia), texto libre de asunto, descripción y comentarios, encuestas con nombre. Retención y anonimización: sección 12, AYU-S07.

## 7. Pantallas necesarias

| N.º | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-AYU-01 | Nuevo caso ("Pedir ayuda") | Elegir servicio, ver artículos sugeridos, llenar formulario, elegir activo propio | Empleado / Solicitante |
| PAN-AYU-02 | Mis casos | Ver estado y responder | Empleado / Solicitante |
| PAN-AYU-03 | Detalle del caso | Línea de tiempo, comentarios, vínculos, SLA, acciones | Todos |
| PAN-AYU-04 | Cola de casos | Casos sin responsable, filtros, tomar caso | Técnico |
| PAN-AYU-05 | Mi trabajo (tarjetas en "Mi trabajo" del Técnico) | Mis casos abiertos por vencimiento | Técnico |
| PAN-AYU-06 | Registrar caso a nombre de | Alta rápida por teléfono o presencial | Técnico |
| PAN-AYU-07 | Tablero de SLA y escalados | En riesgo, vencidos, sin asignar | Jefatura TI |
| PAN-AYU-08 | Pedidos por aprobar (pestaña de "Por aprobar", DS-05) | Aprobar o rechazar con motivo | Jefatura TI |
| PAN-AYU-09 | Catálogo de servicios y categorías | Mantener servicios y formularios | Administrador |
| PAN-AYU-10 | Colas y miembros | Mantener colas, turnos | Jefatura TI |
| PAN-AYU-11 | Tiempos de SLA y plazos | Tiempos por prioridad, plazos de cierre | Administrador |
| PAN-AYU-12 | Responder encuesta | Calificar | Empleado / Solicitante |
| PAN-AYU-13 | Resultados de satisfacción | Promedios y, con permiso, respuestas con nombre | Jefatura TI |
| PAN-AYU-14 | Base de conocimiento: buscar y leer | Encontrar y valorar | Todos |
| PAN-AYU-15 | Editor de artículo y versiones | Redactar, comparar, publicar | Técnico |
| PAN-AYU-16 | Revisión de artículos | Vencidos y borradores por publicar | Jefatura TI |
| PAN-AYU-17 | Pestaña "Casos" en la ficha del activo | Historial de fallas | Técnico |
| PAN-AYU-18 | Casos de derechos (restringida) | Atender sin exponerlos | Administrador |

## 8. Notificaciones y automatismos

Las envía `notificaciones`; los nombres siguen `<módulo>.<entidad>_<hecho>` (D-038.5). Quien hace la acción no se notifica, **salvo** que la Persona atendida siempre recibe la confirmación de su caso aunque lo haya creado ella. Los correos cumplen RN-AYU-029; el detalle se lee dentro de la plataforma. Los casos restringidos no emiten estos eventos.

| Evento | Cuándo | A quién | Texto resumido (en "usted") |
|---|---|---|---|
| `ayuda.caso_creado` | Se crea un caso | Persona atendida; responsable de la cola | "Recibimos su caso AYU-000123." |
| `ayuda.caso_critico_creado` | Caso P1 | Cola y su responsable; Jefatura TI | "Caso crítico AYU-000123 sin atender." Inmediato, no se agrupa |
| `ayuda.caso_asignado` | Cambia el responsable | Nuevo responsable; Persona atendida | "Su caso fue asignado a un agente." Sin nombre del agente |
| `ayuda.comentario_publicado` | Comentario público | La otra parte | "Hay una respuesta nueva en AYU-000123." |
| `ayuda.caso_espera_solicitante` | Pasa a espera del solicitante | Persona atendida | "Necesitamos más información." |
| `ayuda.caso_recordatorio_enviado` | RN-AYU-019 | Persona atendida | "Sigue pendiente su respuesta." |
| `ayuda.caso_resuelto` | Pasa a Resuelto | Persona atendida | "Su caso fue resuelto. Puede calificar y reabrirlo hasta el [dd/mm/aaaa]." |
| `ayuda.caso_cerrado` | Pasa a Cerrado | Persona atendida | "Su caso fue cerrado." (también lo consume `integraciones-api`) |
| `ayuda.caso_reabierto` | Se reabre | Responsable o cola | "El caso fue reabierto." |
| `ayuda.sla_en_riesgo` | 80 % del tiempo | Responsable; responsable de la cola | "Faltan N minutos hábiles." |
| `ayuda.sla_vencido` | Se vence un tiempo | Responsable; responsable de la cola; Jefatura TI | "Venció un plazo del caso AYU-000123." |
| `ayuda.caso_escalado` | Escalamiento manual | Responsable de la cola destino | "Caso escalado." |
| `ayuda.caso_pendiente_aprobacion` | Entra a Pendiente de aprobación | Usuarios con PS-154, excepto quien lo pidió o creó | "Hay un pedido por aprobar." |
| `ayuda.caso_aprobado` / `ayuda.caso_rechazado` | Decisión | Persona atendida | Resultado; el motivo solo dentro de la plataforma |
| `ayuda.caso_orden_vinculada_cerrada` | Se cierra una orden vinculada | Responsable del caso | "Se cerró la orden de servicio vinculada." |
| `ayuda.encuesta_baja_calificacion` | Calificación 1 o 2 | Responsable de la cola | "Hay una calificación baja." Sin nombre |
| `ayuda.articulo_revision_vencida` | Vence la revisión | Autor; Jefatura TI | "El artículo KB-000007 requiere revisión." |

**Automatismos** (todos con RN-AYU-028 y autor "sistema"): cierre de Resuelto; resolución por falta de respuesta; reparto en turnos; emisión de avisos de SLA; devolución a la cola de los casos de un agente dado de baja.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se usa | Frontera |
|---|---|---|
| Personas y Usuarios (D-006, D-041) | Persona atendida; agente y aprobador son membresías | Sin usuario, la Persona no entra; un agente registra por ella. Pendientes de la persona (RF-AYU-048) |
| Calendario de la empresa (núcleo, D-062.4) | Zona, horario, feriados | Lo define el núcleo; AYU solo lo usa |
| Inventario y ENT | Activos asignados; ficha del activo | AYU no cambia el estado del activo salvo por el diálogo único de INV (RF-AYU-047) |
| Órdenes de servicio (D-027, D-044.10) | El técnico crea la OS desde el caso | La OS tiene su flujo, costo y aprobación; AYU solo la referencia |
| Compras | Referencia a una OC en Borrador | La crea TI con permisos de compras; reglas de RN-017 |
| Doble control y interruptor (D-043) | Aprobación de pedidos | Servicio y casilla únicos; AYU no tiene excepción propia |
| Auditoría y contadores | Sección 6; `AYU-` y `KB-` | Autor de tres tipos (D-041) |
| `notificaciones` | Eventos de la sección 8 | AYU emite; NOT decide canal, plantilla y límites |
| `personas-ubicaciones` | Registro de solicitudes de derechos (PS-29) | Guarda el contenido del pedido; AYU solo la referencia y el caso restringido |
| `portal-autoservicio` (D, acordado) | Entrada del empleado | Sin casos propios: muestra "mis casos" y abre PAN-AYU-01, 02 y 14. Sus trámites son los 4 servicios iniciales |
| `onboarding-offboarding` (D, acordado) | Tareas de alta y baja | Sus tareas son propias; pueden enlazar a un servicio de AYU con la Persona como atendida |
| `gestion-problemas`, `gestion-cambios` (E, acordado) | Incidente, problema, cambio | El incidente es de AYU; los vínculos PRB y CAM viven en E y AYU los muestra. Un incidente pertenece a un solo problema; un problema Resuelto no cierra incidentes |
| `cmdb-ligera` (E) | Elemento afectado | Campo opcional; la solución temporal es dato de E |
| `garantias-mantenimiento` (A, acordado) | Garantía y reclamo | AYU muestra "garantía vigente hasta [fecha]"; el reclamo es registro de GAR |
| `reportes-tableros` (F, acordado) | Resultados de SLA | AYU guarda y calcula; REP solo cuenta y excluye los casos restringidos |
| `integraciones-api` (F) | Eventos y API | Mismos nombres de evento y mismos permisos y validadores que las pantallas |

## 10. Criterios de aceptación

| ID | Criterio | Cubre |
|---|---|---|
| CA-AYU-01 | **Dado** una Persona con usuario y una laptop asignada, **cuando** crea un caso con "Falla de equipo", impacto "solo a mí" y urgencia "no puedo trabajar", **entonces** nace `AYU-000001`, prioridad P3, estado Nuevo, y recibe confirmación con su fecha límite de primera respuesta. | RF-AYU-001, RF-AYU-003, RF-AYU-004, RF-AYU-005; RN-AYU-003 |
| CA-AYU-02 | **Dado** una Persona sin usuario pero con correo, **cuando** un agente con PS-22 registra su caso por teléfono (un Almacén o Solicitante no puede elegir a otra Persona), **entonces** el caso queda a nombre de ella con canal "teléfono" y el correo que recibe lleva solo tipo de aviso, `AYU-000002`, fecha y empresa, sin asunto ni enlace; sin correo, no se envía nada. | RF-AYU-002; RN-AYU-002, RN-AYU-029 |
| CA-AYU-03 | **Dado** impacto "toda la empresa" y urgencia "no puedo trabajar", **cuando** se crea el caso, **entonces** es P1 y la cola recibe el aviso inmediato. | RF-AYU-005; RN-AYU-004 |
| CA-AYU-04 | **Dado** un caso P2 con primera respuesta de 60 minutos hábiles, creado a las 16:30 con horario de 09:00 a 17:00, y el reloj de la plataforma fijado, **cuando** el agente responde a las 09:20 del día hábil siguiente, **entonces** figura "Cumplida" (30 + 20 minutos); con un feriado en medio, el cálculo lo salta. | RF-AYU-016, RF-AYU-017, RF-AYU-018; RN-AYU-006, RN-AYU-007; RNF-AYU-005 |
| CA-AYU-05 | **Dado** un caso En atención, **cuando** pasa a "En espera del solicitante" y la Persona comenta, **entonces** el reloj se detuvo en la espera, el caso vuelve a En atención y una transición no permitida por la tabla se rechaza en el servidor. | RF-AYU-015; RN-AYU-006 |
| CA-AYU-06 | **Dado** un comentario interno, **cuando** la Persona atendida abre el caso, lo pide por la API o recibe una notificación, **entonces** no ve ese texto y el servidor no se lo envía. | RF-AYU-013; RN-AYU-009; RNF-AYU-007 |
| CA-AYU-07 | **Dado** un pedido con aprobación y la casilla "mesa de ayuda" apagada, **cuando** quien lo pidió, lo creó o editó su formulario intenta aprobarlo (también llamando directo al servidor y aunque sea Administrador), **entonces** se rechaza; **cuando** otra persona con permiso aprueba, **entonces** pasa a Nuevo y el reloj arranca. | RF-AYU-009; RN-AYU-011 |
| CA-AYU-08 | **Dado** una empresa de una sola persona de TI, **cuando** un Administrador activa la casilla "mesa de ayuda" con motivo, **entonces** puede aprobar lo suyo con aviso visible en el caso y entrada de auditoría; **cuando** pasan 90 días sin renovarla, **entonces** la excepción deja de funcionar. | RF-AYU-009; RN-AYU-011 |
| CA-AYU-09 | **Dado** un caso con una orden de servicio abierta creada por el técnico desde el caso, **cuando** se intenta resolver, **entonces** se rechaza indicando la orden; tras cerrarla, resolver exige solución y código. | RF-AYU-023, RF-AYU-025; RN-AYU-010 |
| CA-AYU-10 | **Dado** un caso Resuelto hace 8 días hábiles, **cuando** la Persona intenta reabrirlo, **entonces** no puede y se le ofrece un caso de seguimiento vinculado; un caso Cerrado tampoco se reabre. | RF-AYU-027; RN-AYU-008, RN-AYU-012 |
| CA-AYU-11 | **Dado** dos agentes que toman el mismo caso a la vez, **cuando** ambos confirman, **entonces** uno es el responsable y el otro ve un mensaje claro; reasignar sin motivo se rechaza y con motivo conserva el reloj; una cola con casos abiertos no se desactiva. | RF-AYU-010, RF-AYU-011, RF-AYU-012; RN-AYU-015, RN-AYU-017, RN-AYU-018 |
| CA-AYU-12 | **Dado** un caso que llega al 80 % del plazo, **cuando** corre el proceso periódico, **entonces** se avisa al responsable y a la cola sin reasignar ni cambiar prioridad; un escalamiento manual exige motivo y marca el caso. | RF-AYU-019, RF-AYU-020; RN-AYU-020 |
| CA-AYU-13 | **Dado** un servicio con un campo obligatorio, **cuando** la Persona lo crea sin llenarlo, **entonces** el sistema lo exige; un campo con datos no cambia de tipo; los 4 servicios iniciales no se borran, solo se desactivan, y uno inactivo no admite casos nuevos. | RF-AYU-006, RF-AYU-007, RF-AYU-008, RF-AYU-041; RN-AYU-018 |
| CA-AYU-14 | **Dado** un artículo Publicado versión 2, **cuando** un técnico lo edita, **entonces** nace un borrador versión 3, el lector sigue viendo la 2 hasta que alguien con PS-165 publique, y las versiones 1 y 2 siguen intactas; quien editó la versión 3 no puede publicarla (con la casilla apagada); una segunda valoración del mismo usuario no suma. | RF-AYU-030, RF-AYU-031, RF-AYU-035, RF-AYU-036; RN-AYU-023, RN-AYU-035 |
| CA-AYU-15 | **Dado** un artículo "solo para agentes" y uno público, **cuando** una Persona busca "contrasena" (sin tilde), **entonces** ve solo el público; un enlace `http://` o un bloque de clave privada en el texto se rechaza. | RF-AYU-032, RF-AYU-033, RF-AYU-034; RN-AYU-024, RN-AYU-025 |
| CA-AYU-16 | **Dado** una encuesta respondida, **cuando** un Técnico pide la respuesta con nombre, **entonces** se deniega; cuando la Jefatura TI la consulta, **entonces** queda en la auditoría; con menos de 5 respuestas no se muestra el promedio por agente. | RF-028, 029; RN-022 |
| CA-AYU-17 | **Dado** un caso restringido de derechos, **cuando** un Técnico, la Jefatura TI o un usuario Solo lectura (sin PS-29) lo buscan por lista, buscador global, exportación, tablero, reporte de SLA, API o aviso, **entonces** no lo encuentran por ninguna vía; quien presentó el pedido no puede atenderlo. | RF-045; RN-027 |
| CA-AYU-18 | **Dado** una contraseña pegada por error en un comentario, **cuando** el Administrador (PS-153, con segundo factor) la redacta con motivo, **entonces** el texto queda `[REDACTADO]` en todas las vistas y la auditoría dice quién, cuándo y por qué sin el texto; retirar (por su autor), en cambio, conserva el texto; Jefatura TI no puede redactar. | RF-014, 046; RN-025 |
| CA-AYU-19 | **Dado** dos empresas A (zona de Lima) y B (zona de Madrid) con casos Resueltos y en espera, **cuando** se ejecuta el proceso periódico con el reloj fijado, **entonces** cada cierre, resolución y aviso queda en su empresa con "hoy" de su zona; correrlo dos veces no duplica nada; tras apagar el trabajador dos días y reiniciarlo, procesa los días pendientes en orden. | RF-026, 036; RN-019, 028, 030; RNF-004 |
| CA-AYU-20 | **Dado** un caso de extravío con un activo vinculado, **cuando** el agente confirma, **entonces** se abre el diálogo "Cambiar estado" con el activo y el motivo precargados, INV aplica la transición solo si el agente tiene el permiso de INV, y resolver con "Extravío confirmado" sin ese cambio se rechaza. | RF-047; RN-033 |
| CA-AYU-21 | **Dado** una empresa que activa el módulo, **cuando** un empleado pulsa "Pedir ayuda", **entonces** ve el catálogo; "Solicitar un equipo" crea un caso y no una orden de compra, y una orden de compra en Borrador creada por TI se vincula solo como referencia. | RF-043, 044; RN-032 |
| CA-AYU-22 | **Dado** una Persona Cesada con un caso abierto, **cuando** se consulta su ficha, **entonces** el caso aparece como pendiente; anonimizarla se bloquea hasta cerrarlo; tras anonimizar, el caso muestra la referencia y no el nombre. | RF-040, 048; RN-002 |
| CA-AYU-23 | **Dado** el caso `AYU-000045` de la empresa A, **cuando** un usuario de la empresa B pide su identificador interno (no solo el número, que puede existir en B), **entonces** recibe "no encontrado", y la búsqueda de artículos de B no devuelve nada de A. | RN-001; RNF-009 |
| CA-AYU-24 | **Dado** un caso de la empresa A, **cuando** se intenta vincularlo (escribiendo por pantalla o por API) con un activo, orden, caso, artículo, cola o servicio de la empresa B, **entonces** la escritura falla con "no encontrado"; un activo De baja no se vincula a un caso nuevo; los vínculos de problema y cambio de E son de solo lectura. | RF-021, 022, 024, 042, 044; RN-001, 014 |
| CA-AYU-25 | **Dado** dos Personas de la misma empresa con rol Empleado (portal), **cuando** la Persona B pide el caso de la Persona A por lista, búsqueda o identificador, **entonces** recibe "no encontrado"; un usuario sin Persona vinculada ve su lista vacía, sin error. | RN-001; RF-001 |
| CA-AYU-26 | **Dado** un usuario Solo lectura, **cuando** intenta comentar, cambiar el estado o exportar un caso (desde la pantalla y directo al servidor), **entonces** se deniega y no cambia nada; la columna de nombre muestra `PRS-0042`. | Todo el módulo; D-036 |
| CA-AYU-27 | **Dado** el administrador con `datos.exportar`, **cuando** exporta casos, **entonces** pide motivo, omite comentarios internos y casos restringidos, trae la hoja "Aviso" y no ofrece subir archivos en ningún formulario. | RF-037, 038, 039; RN-009, 027 |

## 11. Casos límite

1. Un agente crea un caso por teléfono para una Persona sin usuario: se notifica solo por correo si tiene correo, con contenido mínimo y sin enlace.
2. Se desactiva un servicio o cambian los tiempos de SLA con casos abiertos: siguen su curso sin cambios (RN-AYU-007, 018).
3. Un plazo vence en feriado o fuera de horario: se cuenta desde el siguiente horario hábil; el calendario es el de la empresa.
4. La Persona intenta vincular una laptop que ya no tiene asignada: no aparece; un agente sí puede vincularla.
5. Dos casos del mismo problema: uno se resuelve como "Duplicado" con vínculo al otro.
6. Una contraseña en un comentario: no siempre se detecta; el Administrador la redacta.
7. La Persona atendida se cesa con casos abiertos: son pendientes de la persona, no se cancelan solos y no bloquean el cese.
8. Se reabre un caso y su agente ya no existe: vuelve a la cola sin responsable.
9. Una orden de servicio vinculada se cancela: el caso no cambia solo; se avisa al responsable.
10. Un usuario con dos empresas abre un enlace de un caso de la empresa no activa: la dirección lleva la empresa; si es miembro se navega a ella, si no, "no encontrado" (D-046).
11. Un pedido con aprobación cuyo único aprobador es quien lo pide: aplica la casilla "mesa de ayuda" si está activa y vigente; si no, queda bloqueado y se avisa al administrador.
12. Una empresa suspendida: el proceso periódico la salta y no hay avisos.
13. El pedido de derechos lo presenta un Administrador: lo atiende otro administrador o la plataforma.
14. Un cambio de zona horaria de la empresa: los avisos de SLA pendientes se recalculan.

## 12. Decisiones propuestas y supuestos

Resultado según D-057 y D-058: **Confirmado**, **Cambiado** o **Retirado**.

| N.º | Supuesto o decisión | Resultado |
|---|---|---|
| AYU-S01 | El módulo es de la Fase 2. | **Confirmado** (D-058, D-056: ola C). |
| AYU-S02 | Matriz de prioridad fija y tiempos configurables por prioridad. | Confirmado como diseño del módulo. |
| AYU-S03 | Reloj solo en horario de atención y con pausas por espera; plazos por defecto: reapertura 7 días hábiles, cierre 3, recordatorio 2, resolución por falta de respuesta 5. | **Cambiado:** el horario y los feriados son del calendario de empresa compartido (D-062.4). |
| AYU-S04 | La aprobación de pedidos la hace quien tenga el permiso; no hay jefe directo. | Confirmado; la regla es RN-017 y la excepción es la casilla del interruptor único. |
| AYU-S05 | Sin correo entrante ni creación de casos por correo. | Confirmado. |
| AYU-S06 | El escalamiento automático solo avisa. | Confirmado. |
| AYU-S07 | Los casos se conservan 5 años; el nombre de la Persona atendida se anonimiza según D-024 y D-033. **Aviso:** el texto libre de asuntos y comentarios no se puede anonimizar de forma garantizada; por eso se advierte en pantalla y existe la redacción por seguridad. | **Confirmado como provisional** (D-058) hasta la opinión legal (L-04). |
| AYU-S08 | El tipo de campo "secreto" no se ofrece en formularios de servicios. | Nuevo, confirmado como diseño del módulo (no hay claves en casos). |
| AYU-S09 | Redactar por seguridad lo puede quien tenga PS-153. | **Cambiado:** el registro lo deja solo al Administrador (sensible, segundo factor). |
| E-AYU-01 | [ESCALAR AL CEO] (dinero) **Adjuntos en casos y artículos.** Hoy no (D-022). Al habilitarlos: capturas (png, jpg), documentos (pdf) y texto (txt, log), máximo 5 archivos por comentario y 5 MB cada uno, separados por empresa, entregados solo tras comprobar el permiso, con revisión de virus y con los internos solo para agentes. Cambian RF-AYU-013, RF-AYU-039, la retención y la privacidad (una captura puede mostrar datos personales). Implican almacenamiento con costo mensual y posible costo del análisis de virus; DevOps estima el costo cuando llegue el momento. Recomendación: no habilitar hasta cerrar la Etapa 4 y ver el uso real. | Escalado |
| E-AYU-02 | [ESCALAR AL CEO] (dinero) Los avisos de este módulo suman volumen al servicio de correo ya escalado (`decisiones.md`, Escalado, Dinero 1). Si el plan queda corto, el costo sube. Se mitiga con resúmenes y con los límites del módulo `notificaciones`. | Escalado |

## 13. Fuera de alcance

- Archivos adjuntos (D-022; ver E-AYU-01).
- Crear o responder casos por correo, teléfono, chat o mensajería.
- Calendario propio, gestión de cambios y de problemas, base de datos de configuración (otros módulos).
- Importación de datos propia (si se necesita, usa el marco único de D-050).
- Encuestas distintas de la del caso; encuestas a Personas sin usuario.
- Sugerencias con inteligencia artificial; chatbots; costos por caso; aprobación con montos (viven en compras y órdenes de servicio).
- Matriz de prioridad editable, varios niveles de aprobación, organigrama.
- Base de conocimiento compartida entre empresas; portal público sin acceso.
- Reportes avanzados y tableros de dirección (`reportes-tableros`); webhooks (`integraciones-api`).

## 14. Historial de cambios

| Cambio | Decisión o hallazgo |
|---|---|
| Versión 0.1 a 0.2; fase "Fase 2, ola C"; columnas "Cuándo" y "CA" por requisito; cada CA cita lo que cubre | Plan de correcciones (fila Mesa de ayuda, punto 12); H-AUD-21; D-056 |
| "Solicitud de servicio" pasa a "Pedido de servicio"; "solicitante del caso" a "Persona atendida" ("Pedido por"); SLA queda para plazos internos | D-049.6 y D-049.7; H-AUD-11; H-QA-22 |
| Nueva columna "Empleado (portal)" con alcance propio y resultado vacío sin Persona vinculada | D-037 fila 11; H-AUD-17; D-036.4 |
| Nombres de permiso del registro (antes `ayuda.caso.ver_datos_solicitante` pasa a `datos_personales.ver` PS-22; `ayuda.exportar` a `datos.exportar` PS-20); se quita la importación | D-036; H-SEG-07; H-QA-07; H-AUD-05 |
| Casos restringidos con PS-29 `personas.derechos_atender` (antes `ayuda.derechos.atender`), invisibles por todas las vías y sin SLA; AYU solo guarda referencia; quien presenta no atiende | D-061.2; H-CUM-11; H-QA-13; H-SEG-10; RF-045, RN-027, PAN-AYU-18 |
| Redacción por seguridad distinta de retirar; validador común de claves; artículos con texto simple y enlaces https | D-061.5; D-063.2; H-CUM-10; H-SEG-23; RF-046, RN-025 |
| Se retira el calendario propio; se usa el calendario de empresa compartido | D-062.4; H-ARQ-16 |
| Regla de pedido con aprobación: RN-017, servicio único de doble control y casilla "mesa de ayuda"; se retira cualquier excepción propia | D-031.6; D-043; H-CUM-02; H-AUD-07; H-QA-09; RN-011, CA-007 y CA-008 |
| Formularios con el motor único de campos (ámbito `servicio_ayuda`), valores en JSON validado en lugar de una fila por campo | T-13; H-DAT-21; H-ARQ-18 |
| La orden de servicio la crea el técnico desde el caso; el extravío es un caso que se confirma con el diálogo único "Cambiar estado" | D-053 (DS-01); H-AUD-19; D-012; RF-023, RF-047, RN-033 |
| "Solicitar un equipo" crea un caso; TI crea la OC en Borrador; vínculo solo como referencia | D-058 (S-POR-02); H-AUD-11; RN-032, RF-044 |
| Botón único "Pedir ayuda": al activar el módulo abre el catálogo | D-053 DS-01; S-31; RF-043 |
| 4 servicios iniciales que no se borran | D-058 (S-POR-02, 03); acuerdo con `portal-autoservicio` |
| Procesos periódicos: idempotentes, recuperables, por empresa, "hoy" de la empresa, registro de corrida; vigencia del SLA calculada al leer | D-038.4; D-062.2; H-SEG-02; H-QA-12 |
| Correos de contenido mínimo; sin asunto, nombres de terceros ni enlaces a Persona sin usuario; confirmación del caso siempre se envía | D-061.4; H-CUM-06; H-SEG-16; H-QA-14b |
| Nombres de eventos al catálogo único `<módulo>.<entidad>_<hecho>` | D-038.5; H-ARQ-11 |
| Auditoría sin valores de texto libre ni datos personales; acciones automáticas con autor "sistema" | D-030.6; D-041.4; H-CUM-01; H-CUM-13 |
| Casos abiertos de una Persona Cesada son pendientes de la persona; el cese no se bloquea y sí la anonimización | D-034; D-061.7; D-057 (S-03); H-AUD-10; RF-048, RN-002 |
| Códigos `KB-` con 6 dígitos; pantallas `PAN-AYU-nn`; escalados `E-AYU-nn` (antes AYU-E01 y AYU-E02) | D-049.2 y D-049.4; H-AUD-22 |
| AYU-S01 confirmado, AYU-S03 cambiado, AYU-S07 provisional con aviso; resultado por supuesto | D-057; D-058 |
| Volumen de RNF-002 cita RNF-010 del núcleo; RNF-005 con reloj fijable | H-AUD-24; D-038.8; H-QA-12 |
| Nuevos CA: aislamiento por identificador interno, escritura con referencias cruzadas, dos empresas en procesos periódicos, dos Personas de la misma empresa, permiso denegado directo al servidor, reloj fijado | D-039.6, D-039.8; D-063.6; H-SEG-02; H-SEG-09; H-SEG-25f |
| Se retira RN-AYU-026 (no se reutiliza el número) | Simplificación de la definición de primera respuesta |
| Sección 3 migrada a los PS-nn del registro (PS-138 a PS-166, PS-22, PS-29, PS-20); con ello cambian celdas propuestas en 0.1: Jefatura TI ya no toma ni cambia estado; el Técnico ya no asigna, solo escala; ver resultados de encuesta solo Administrador y Jefatura; editar artículos sin Jefatura; la Persona ya no cierra su caso, solo lo reabre o cancela en Nuevo; "propio" de cola es el resolvedor de D-036.4 | Registro de permisos; D-036.4; D-037 (los módulos agregan filas) |
| "Retirar" lo hace el autor sobre su propio comentario; ya no es un permiso de la jefatura. Redactar solo el Administrador | Registro de permisos (sección 15); H-CUM-10 |
| Publicar un artículo exige otra persona que quien lo redactó (casilla "mesa de ayuda" como única excepción) | PS-165; D-043 |
| Registrar un caso a nombre de otra Persona exige además PS-24 todo y PS-22 | D-037 filas 7 y 8; H-SEG-08 |
| Nuevo evento `ayuda.caso_cerrado`; un caso restringido no se vincula a problema ni cambio ni cuenta en "3 o más parecidos"; la referencia al elemento afectado usa tipo e identificador interno del origen | Acuerdos con `integraciones-api` y con gestión de problemas y cambios |

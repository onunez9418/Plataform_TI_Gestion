# Módulo: Mesa de ayuda (slug `mesa-de-ayuda`, sigla AYU)

**Versión:** 0.1 (borrador del Analista de Negocio, Oleada B). **Base:** decisiones D-001 a D-029 (`docs/equipo/decisiones.md`) y documento funcional v0.1.
**Convenciones:** [SUPUESTO] = lo propongo y sigo; lo confirma el Gerente de TI. [ESCALAR AL CEO] = implica dinero, tema legal o algo irreversible.

## 1. Propósito, alcance y fase

**Propósito.** Que cualquier persona de la empresa pida ayuda a TI (algo dejó de funcionar, o necesita algo) en un solo lugar; que el equipo de TI atienda cada pedido con tiempos comprometidos, deje constancia de lo que hizo y reutilice lo aprendido.

**Fase.** El documento v0.1 deja los "tickets de soporte" fuera de la versión 1. Por eso este módulo es **Fase 2: después de la Etapa 7** [SUPUESTO]. Necesita antes: Personas (Etapa 2), Inventario (Etapa 4), Órdenes de servicio (Etapa 6) y la base de Notificaciones (módulo `notificaciones`).

**Entra:**
- Casos de dos tipos: **incidente** y **solicitud de servicio**, con número propio.
- Catálogo de servicios, categorías de ayuda, formularios por servicio y aprobación opcional.
- Prioridad por impacto y urgencia; SLA con tiempo de primera respuesta y de resolución; calendario de atención.
- Colas, asignación, escalamiento, comentarios públicos e internos.
- Encuesta de satisfacción; base de conocimiento con versiones y búsqueda.
- Vínculo con activos y con órdenes de servicio del núcleo.

**No entra** (ver sección 13): adjuntos (D-022), correo entrante, chat, teléfono, gestión de cambios y de problemas (otros módulos), reportes avanzados.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Caso** | Un pedido de ayuda registrado. Puede ser incidente o solicitud de servicio. Número `AYU-000123`, único por empresa y nunca reutilizado (D-007). |
| **Incidente** | Algo que funcionaba y dejó de funcionar. Ej.: "mi laptop no enciende". |
| **Solicitud de servicio** | Algo que se pide y no es una falla. Ej.: "instalar Office en mi equipo", "línea nueva para un celular". |
| **Solicitante del caso** | La **Persona** a quien se ayuda. No tiene por qué tener usuario (D-006). Distinto del rol "Solicitante". |
| **Agente** | Usuario que atiende casos (rol Técnico por defecto). |
| **Catálogo de servicios** | Lista de lo que TI ofrece, en palabras del usuario, con su formulario. |
| **Categoría de ayuda** | Agrupación de casos (Hardware, Software, Accesos...). Es distinta de la categoría de SKU. |
| **Impacto** | A cuántas personas afecta: una, un área o toda la empresa. |
| **Urgencia** | Qué tan rápido se necesita: puedo seguir trabajando, trabajo con dificultad, no puedo trabajar. |
| **Prioridad** | Resultado de impacto × urgencia: P1 Crítica, P2 Alta, P3 Media, P4 Baja. |
| **SLA** | Acuerdo de nivel de servicio: tiempos que TI se compromete a cumplir. Dos tiempos: **primera respuesta** y **resolución**. |
| **Primera respuesta** | El primer comentario público de un agente al solicitante. Asignar o cambiar estado no cuenta. |
| **Calendario de atención** | Días y horas en que corre el reloj del SLA, más feriados. |
| **Cola** | Grupo de agentes que atiende cierto tipo de casos (Soporte general, Celulares, Accesos). |
| **Comentario público / interno** | Público lo ve el solicitante; interno solo los agentes. |
| **Escalamiento** | Pasar un caso a un nivel superior o avisar a una jefatura porque no avanza o se va a vencer el plazo. |
| **Artículo** | Texto de la base de conocimiento con la solución a un problema frecuente. Código `KB-0001`. |

## 3. Roles y permisos

Alcance: **T** = todo, **P** = solo lo propio (casos donde la persona es solicitante o creadora), **C** = solo en las colas de las que es miembro, **-** = no tiene. Los nombres de permiso son los de `ayuda.<objeto>.<acción>`. Todo rol nuevo parte sin permisos (D-004). Los valores son los iniciales; cada empresa los edita.

| Permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|
| `ayuda.caso.crear` (en nombre de otros: T) | T | T | T | P | P | - |
| `ayuda.caso.ver` | T | T | T | P | P | T |
| `ayuda.caso.ver_datos_solicitante` (sensible) | sí | sí | sí | - | - | - |
| `ayuda.caso.ver_interno` (comentarios internos) | sí | sí | sí | - | - | - |
| `ayuda.caso.comentar_publico` | T | T | T | P | P | - |
| `ayuda.caso.comentar_interno` | T | T | T | - | - | - |
| `ayuda.caso.tomar` | T | T | C | - | - | - |
| `ayuda.caso.asignar` (asignar, reasignar, cambiar cola) | T | T | C | - | - | - |
| `ayuda.caso.cambiar_estado` (incluye resolver) | T | T | C | - | - | - |
| `ayuda.caso.cambiar_prioridad` | T | T | C | - | - | - |
| `ayuda.caso.escalar` | T | T | C | - | - | - |
| `ayuda.caso.cerrar` | T | T | C | - | P | - |
| `ayuda.caso.cancelar` | T | T | - | - | P (solo en Nuevo) | - |
| `ayuda.caso.reabrir` | T | T | C | - | P | - |
| `ayuda.caso.vincular` (activos, casos, artículos) | T | T | C | - | - | - |
| `ayuda.caso.crear_orden_servicio` (exige además el permiso de crear órdenes de servicio del núcleo) | T | T | C | - | - | - |
| `ayuda.caso.retirar_comentario` | T | T | - | - | - | - |
| `ayuda.solicitud.aprobar` | T | T | - | - | - | - |
| `ayuda.encuesta.responder` | P | P | P | P | P | - |
| `ayuda.encuesta.ver_resultados` (promedios) | T | T | P (los suyos) | - | - | - |
| `ayuda.encuesta.ver_detalle` (respuestas con nombre; sensible) | sí | sí | - | - | - | - |
| `ayuda.catalogo.ver` | T | T | T | T | T | T |
| `ayuda.catalogo.administrar` (servicios, categorías) | sí | - | - | - | - | - |
| `ayuda.cola.administrar` (colas y miembros) | sí | sí | - | - | - | - |
| `ayuda.sla.configurar` (calendario, tiempos, plazos de cierre y recordatorio) | sí | - | - | - | - | - |
| `ayuda.conocimiento.ver` (artículos publicados públicos) | T | T | T | T | T | T |
| `ayuda.conocimiento.ver_interno` (artículos solo para agentes) | sí | sí | sí | - | - | - |
| `ayuda.conocimiento.editar` (borradores y versiones) | sí | sí | sí | - | - | - |
| `ayuda.conocimiento.publicar` / `.archivar` | sí | sí | - | - | - | - |
| `ayuda.tablero.ver` (SLA y escalados) | T | T | P | - | - | - |
| `ayuda.exportar` (permiso aparte, D-004) | sí | - | - | - | - | - |

## 4. Requisitos

### 4.1 Requisitos funcionales (RF)

| ID | Requisito |
|---|---|
| RF-AYU-001 | El solicitante crea un caso eligiendo un servicio del catálogo y llenando su formulario. |
| RF-AYU-002 | Un agente registra un caso en nombre de otra Persona e indica el canal de origen (teléfono, presencial, mensaje reenviado, otro). |
| RF-AYU-003 | Cada caso es incidente o solicitud de servicio; el tipo viene del servicio elegido y un agente puede reclasificarlo con motivo. |
| RF-AYU-004 | Cada caso recibe un número correlativo por empresa con el mecanismo de D-007. |
| RF-AYU-005 | La prioridad se calcula con impacto y urgencia según la matriz de RN-AYU-003; un agente la puede cambiar con motivo. |
| RF-AYU-006 | El administrador mantiene el catálogo de servicios: nombre, descripción simple, tipo, categoría, cola predeterminada, impacto y urgencia sugeridos, formulario y si exige aprobación. |
| RF-AYU-007 | Las categorías de ayuda tienen un solo nivel de subcategoría (como D-008) y se desactivan, no se borran. |
| RF-AYU-008 | El formulario de cada servicio admite campos "del caso" de tipo texto, número, fecha, lista y sí/no, obligatorios u opcionales (misma regla de D-005 para desactivar y no cambiar tipo). |
| RF-AYU-009 | Un servicio puede exigir aprobación; el caso queda "Pendiente de aprobación" hasta que alguien con permiso apruebe o rechace con motivo. |
| RF-AYU-010 | El administrador o la jefatura crean colas, definen sus miembros y un responsable de cola. |
| RF-AYU-011 | La asignación puede ser manual, por "tomar el caso" o por reparto en turnos entre los miembros de la cola (opcional por cola). |
| RF-AYU-012 | Reasignar o cambiar de cola exige motivo y conserva el reloj del SLA. |
| RF-AYU-013 | Cada caso tiene comentarios públicos e internos; el interno se marca antes de enviar y no se puede convertir en público. |
| RF-AYU-014 | Un comentario no se edita ni se borra; la jefatura puede "retirarlo" con motivo y queda visible para auditoría. |
| RF-AYU-015 | El caso sigue los estados y transiciones de la sección 5. |
| RF-AYU-016 | El administrador define el calendario de atención de la empresa (días, horas, zona horaria, feriados). |
| RF-AYU-017 | El administrador define, por prioridad, el tiempo de primera respuesta y el de resolución. Un servicio puede traer tiempos propios. |
| RF-AYU-018 | Cada caso muestra el estado de su SLA con texto y color: En plazo, En riesgo (80% consumido), Vencido, Cumplido. |
| RF-AYU-019 | Un agente puede escalar un caso (a otra cola o nivel) con motivo; el caso queda marcado "Escalado" y se avisa al responsable de la cola destino. |
| RF-AYU-020 | El sistema escala solo con avisos: al llegar al 80% y al vencer cada tiempo se avisa al responsable de la cola y a la Jefatura TI. |
| RF-AYU-021 | Un caso se puede vincular con uno o varios activos de la empresa; el solicitante elige entre los activos que tiene asignados. |
| RF-AYU-022 | La ficha de cada activo muestra los casos vinculados (historial de fallas). |
| RF-AYU-023 | Desde un caso se crea una orden de servicio del núcleo que copia solicitante, activo y descripción; el caso muestra el estado de esas órdenes. |
| RF-AYU-024 | Un caso se puede relacionar con otros: "duplicado de", "relacionado con", "seguimiento de". |
| RF-AYU-025 | Resolver exige un texto de solución y un código de resolución (Resuelto, No reproducible, Duplicado, Sin respuesta del solicitante, Resuelto por un tercero). |
| RF-AYU-026 | Un caso Resuelto pasa a Cerrado solo, tras el plazo de la configuración; el solicitante puede cerrarlo antes. |
| RF-AYU-027 | El solicitante o un agente reabren un caso Resuelto dentro del plazo de RN-AYU-008. |
| RF-AYU-028 | Al resolver, el solicitante con usuario recibe una encuesta de 1 a 5 y un comentario opcional. |
| RF-AYU-029 | La jefatura ve promedios por agente, cola, servicio y periodo; ver respuestas con nombre es un permiso aparte. |
| RF-AYU-030 | La base de conocimiento permite crear, editar, revisar, publicar y archivar artículos con estados Borrador, Publicado y Archivado. |
| RF-AYU-031 | Cada publicación crea una versión numerada e inalterable; se puede ver el historial y restaurar una versión como nueva versión borrador. |
| RF-AYU-032 | La búsqueda encuentra artículos por título, resumen, texto y etiquetas, sin distinguir mayúsculas ni tildes. |
| RF-AYU-033 | Mientras el solicitante escribe el asunto de un caso, se sugieren hasta 5 artículos públicos relacionados. |
| RF-AYU-034 | Un agente asocia al caso el artículo usado y puede crear un borrador de artículo a partir de un caso resuelto. |
| RF-AYU-035 | Cada artículo tiene "me sirvió / no me sirvió"; se cuenta una valoración por usuario. |
| RF-AYU-036 | Cada artículo tiene fecha de próxima revisión; al vencer se avisa a su autor y a la jefatura. |
| RF-AYU-037 | Las listas de casos tienen buscador, filtros (estado, cola, prioridad, tipo, SLA, agente, servicio, activo) y exportación (D-021). |
| RF-AYU-038 | Cada caso muestra una línea de tiempo con todo cambio: quién, cuándo, qué y motivo. |
| RF-AYU-039 | Sin adjuntos en esta versión (D-022): el formulario avisa "describa el problema con texto" y no ofrece subir archivos. |
| RF-AYU-040 | Cuando una Persona se anonimiza (D-024), sus casos conservan el historial con el nombre reemplazado. |
| RF-AYU-041 | El catálogo trae 4 servicios iniciales que la empresa no puede borrar, solo desactivar: reportar un problema, reportar un extravío, solicitar un equipo (crea un caso, no una orden de compra) y pedir mis datos personales (cola restringida al Administrador, trámite de D-024 punto 6). Los usan el portal y otros módulos. |
| RF-AYU-042 | Un incidente puede indicar un elemento afectado de la base de configuración (si existe `cmdb-ligera`) y muestra en solo lectura su problema o cambio vinculado, el error conocido con su solución temporal y la garantía vigente del activo. |

### 4.2 Reglas de negocio (RN)

| ID | Regla |
|---|---|
| RN-AYU-001 | Todo dato del módulo lleva empresa; un identificador de otra empresa responde "no encontrado" (D-021, D-025). |
| RN-AYU-002 | El solicitante del caso es una Persona activa; una Persona dada de baja no puede ser solicitante de casos nuevos. |
| RN-AYU-003 | Matriz: Alto+Alta=P1; Alto+Media=P2; Alto+Baja=P3; Medio+Alta=P2; Medio+Media=P3; Medio+Baja=P4; Bajo+Alta=P3; Bajo+Media=P4; Bajo+Baja=P4. La matriz es fija. |
| RN-AYU-004 | El solicitante responde dos preguntas en palabras simples (a quién afecta, cuánto le impide trabajar); el sistema calcula la prioridad. Un caso P1 avisa de inmediato a la cola. |
| RN-AYU-005 | Toda decisión de un agente que cambie prioridad, tipo o cola lleva motivo y queda en la línea de tiempo. |
| RN-AYU-006 | El reloj del SLA corre solo dentro del calendario de atención y se detiene en "Pendiente de aprobación", "En espera del solicitante" y "En espera de tercero". |
| RN-AYU-007 | Los tiempos del SLA se fijan al crear el caso; cambiar la política después no altera casos abiertos. Cambiar prioridad o tipo recalcula desde la fecha de creación. |
| RN-AYU-008 | Un caso Resuelto se puede reabrir hasta 7 días hábiles después de resolverlo; el reloj de resolución continúa con lo ya consumido. Después se crea un caso nuevo "seguimiento de". |
| RN-AYU-009 | Los comentarios internos nunca se muestran ni se envían al solicitante ni a roles sin `ayuda.caso.ver_interno`, ni en notificaciones ni en exportaciones. |
| RN-AYU-010 | Un caso no se resuelve si tiene órdenes de servicio abiertas vinculadas; se cierran o cancelan primero [SUPUESTO]. |
| RN-AYU-011 | Nadie aprueba su propia solicitud (D-015, punto 3c), tampoco el Administrador. Rige la misma excepción por empresa de D-015 punto 4, con aviso visible y auditoría. |
| RN-AYU-012 | Un caso Cerrado no se reabre: se crea otro vinculado. Un caso Cancelado o Rechazado tampoco. |
| RN-AYU-013 | Nada se borra: los casos se cancelan o cierran, los servicios y colas se desactivan, los artículos se archivan (D-019). |
| RN-AYU-014 | No se pueden vincular activos De baja a casos nuevos; los casos históricos los conservan. El activo debe ser de la misma empresa. |
| RN-AYU-015 | Un agente solo toma casos de las colas de las que es miembro; Jefatura TI y Administrador asignan a cualquier agente activo. |
| RN-AYU-016 | Si un agente se suspende o se da de baja, sus casos abiertos vuelven a su cola sin responsable y se avisa a la cola. |
| RN-AYU-017 | Si dos agentes toman el mismo caso a la vez, solo uno lo consigue; el otro ve "ya fue tomado por otra persona". |
| RN-AYU-018 | Un servicio inactivo no se usa en casos nuevos; los existentes lo conservan. Una cola con casos abiertos no se desactiva hasta reasignarlos. |
| RN-AYU-019 | Si un caso está en "En espera del solicitante", se recuerda a los 2 días hábiles y se resuelve solo a los 5 con código "Sin respuesta del solicitante". Ambos plazos son configurables [SUPUESTO]. |
| RN-AYU-020 | El escalamiento automático solo avisa; no reasigna ni cambia prioridad. |
| RN-AYU-021 | Un caso duplicado se resuelve con código "Duplicado" y vínculo al caso principal; su SLA cuenta como cumplido. |
| RN-AYU-022 | Encuesta: una por caso, solo del solicitante con usuario, válida 7 días, no editable. Los promedios por agente se muestran con 5 respuestas o más para no identificar a quien opina [SUPUESTO]. |
| RN-AYU-023 | Un artículo Publicado no se modifica: editarlo crea un borrador de la versión siguiente y la versión publicada sigue visible hasta publicar la nueva. |
| RN-AYU-024 | Artículos "solo para agentes" no aparecen a otros roles ni en sugerencias ni en búsquedas. No existe base de conocimiento compartida entre empresas. |
| RN-AYU-025 | Todo texto escrito se trata como texto, nunca como código (RS-42). Asunto máximo 150 caracteres, comentario 5.000. Los formularios avisan "no escriba contraseñas". |

### 4.3 Requisitos de calidad (RNF)

| ID | Requisito medible |
|---|---|
| RNF-AYU-001 | Crear un caso desde el catálogo toma como máximo 3 pasos y 90 segundos para un usuario sin entrenamiento (prueba con 5 personas). |
| RNF-AYU-002 | Las listas de casos responden en menos de 2 segundos (percentil 95) con hasta 20.000 casos por empresa (volumen supuesto, pendiente #4). |
| RNF-AYU-003 | La búsqueda de artículos responde en menos de 1 segundo (percentil 95) con 2.000 artículos publicados. |
| RNF-AYU-004 | Los avisos de SLA en riesgo y vencido salen dentro de 5 minutos del umbral. |
| RNF-AYU-005 | El cálculo del SLA es exacto al minuto, incluidos cruces de horario, feriados y pausas (prueba con casos de ejemplo con resultado conocido). |
| RNF-AYU-006 | 20 casos creados a la vez reciben 20 números distintos y crecientes. |
| RNF-AYU-007 | El texto de un comentario interno no sale del servidor hacia un navegador sin permiso (no basta ocultarlo en pantalla). |
| RNF-AYU-008 | Todas las pantallas funcionan por teclado, en celular y tableta, con estados escritos con texto además de color (D-021). |
| RNF-AYU-009 | Cada tabla nueva tiene su prueba de aislamiento entre empresas (D-025). Las métricas de SLA se reconstruyen con el historial (fecha y hora exactas en hora universal). |

## 5. Estados y transiciones

**Caso.** Estados: Pendiente de aprobación, Nuevo, En atención, En espera del solicitante, En espera de tercero, Resuelto, Cerrado, Cancelado, Rechazado. "Asignado" no es estado: es un dato (responsable).

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (creación) | Nuevo | Solicitante o agente | Servicio sin aprobación |
| (creación) | Pendiente de aprobación | Solicitante o agente | Servicio con aprobación |
| Pendiente de aprobación | Nuevo | `ayuda.solicitud.aprobar`, distinta persona que el solicitante o creador | RN-AYU-011; el reloj arranca aquí |
| Pendiente de aprobación | Rechazado | Igual que arriba | Motivo obligatorio; estado final |
| Nuevo | En atención | Agente al tomar o ser asignado | Automático |
| En atención | En espera del solicitante | Agente asignado, Técnico, Jefatura, Admin | Motivo (qué se necesita); pausa reloj |
| En atención | En espera de tercero | Igual | Indicar a quién se espera; pausa reloj |
| En espera (cualquiera) | En atención | Agente, o automático si el solicitante comenta | Reanuda reloj |
| En atención | Resuelto | Agente con `cambiar_estado` | Solución y código (RF-AYU-025); RN-AYU-010 |
| En espera del solicitante | Resuelto | Automático | RN-AYU-019 |
| Resuelto | En atención | Solicitante o agente (`reabrir`) | Dentro de RN-AYU-008; motivo |
| Resuelto | Cerrado | Solicitante, agente o automático | Plazo de cierre (3 días hábiles por defecto) |
| Nuevo, En atención, En espera (cualquiera) | Cancelado | Jefatura, Admin; el solicitante solo en Nuevo | Motivo obligatorio; estado final |

No hay otras transiciones. Finales: Cerrado, Cancelado, Rechazado. Cada transición registra quién, cuándo y motivo.

**Artículo.** Borrador → Publicado (`conocimiento.publicar`); Publicado → Borrador de nueva versión (al editar; el publicado sigue visible); Publicado → Archivado (`.archivar`, motivo); Archivado → Borrador (`.archivar`). Una versión publicada nunca cambia.

**SLA del caso (calculado):** En plazo → En riesgo (80%) → Vencido; o → Cumplido al responder o resolver a tiempo. Vencido no vuelve a En plazo.

## 6. Datos

| Entidad | Campos principales (lenguaje simple) | Clave y unicidad |
|---|---|---|
| Caso | empresa, número, tipo, servicio, categoría, asunto, descripción, solicitante (Persona), creado por (Usuario), canal de origen, impacto, urgencia, prioridad, estado, cola, responsable, fechas (creación, primera respuesta, resolución, cierre), código y texto de resolución, marca de escalado, elemento afectado (opcional) | número único por empresa, nunca repetido |
| Valor de formulario | caso, campo del servicio, valor | uno por caso y campo |
| Comentario | caso, autor, público o interno, texto, fecha, retirado (sí/no, quién, motivo) | solo se agrega |
| Historial del caso | caso, cambio, valor anterior y nuevo, quién, cuándo, motivo | solo se agrega |
| Medición de SLA | caso, metas fijadas y fechas reales de primera respuesta y de resolución, "cumplió" sí/no/no aplica de cada una, minutos consumidos, pausas (desde, hasta, causa), estado | uno por caso |
| Vínculo caso-activo | caso, activo | sin repetir el par |
| Vínculo caso-orden de servicio | caso, orden | sin repetir el par |
| Vínculo caso-caso | caso, caso, tipo de relación | sin repetir |
| Servicio del catálogo | nombre, descripción, tipo, categoría, cola, prioridad sugerida, tiempos propios opcionales, exige aprobación, activo | nombre único por empresa |
| Campo del servicio | servicio, nombre, tipo, obligatorio, opciones, activo | identificador interno estable |
| Categoría de ayuda | nombre, categoría padre, activa | nombre único por padre y empresa |
| Cola | nombre, responsable, reparto en turnos, activa | nombre único por empresa |
| Miembro de cola | cola, usuario | sin repetir |
| Calendario de atención | días y horas, zona horaria, feriados | uno por empresa |
| Política de SLA | prioridad, minutos de primera respuesta, minutos de resolución | uno por prioridad y empresa |
| Configuración del módulo | plazos de cierre, recordatorio, reapertura | una por empresa |
| Encuesta | caso, puntuación 1 a 5, comentario, fecha | una por caso |
| Artículo | código KB, título, resumen, etiquetas, categoría, audiencia (público o solo agentes), estado, autor, próxima revisión | código único por empresa, nunca repetido |
| Versión del artículo | artículo, número, texto, autor, fecha de publicación | número único por artículo; inalterable |
| Valoración de artículo | artículo, usuario, sirvió sí/no | una por usuario y artículo |
| Vínculo caso-artículo | caso, artículo, versión usada | sin repetir |

**Se audita (D-018):** altas y cambios de servicios, colas, calendario, políticas de SLA y configuración; cambios de prioridad, tipo, cola, responsable y estado; escalamientos; comentarios retirados; usos de la excepción de RN-AYU-011; publicar y archivar artículos; consultas al detalle de encuestas; exportaciones. **No se guarda** contraseñas ni claves (se avisa en pantalla). Datos personales: el solicitante es una Persona sujeta a D-024.

## 7. Pantallas necesarias

| N.º | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| AYU-01 | Nuevo caso | Elegir servicio, ver artículos sugeridos, llenar formulario, elegir activo propio | Solicitante |
| AYU-02 | Mis casos | Ver estado y responder | Solicitante |
| AYU-03 | Detalle del caso | Línea de tiempo, comentarios, vínculos, SLA, acciones | Todos |
| AYU-04 | Cola de casos | Casos sin responsable, filtros, tomar caso | Técnico |
| AYU-05 | Mi trabajo | Mis casos abiertos ordenados por vencimiento | Técnico |
| AYU-06 | Registrar caso a nombre de | Alta rápida por teléfono o presencial | Técnico |
| AYU-07 | Tablero de SLA y escalados | En riesgo, vencidos, sin asignar | Jefatura TI |
| AYU-08 | Aprobaciones de solicitudes | Aprobar o rechazar con motivo | Jefatura TI |
| AYU-09 | Catálogo de servicios y categorías | Mantener servicios y formularios | Administrador |
| AYU-10 | Colas y miembros | Mantener colas, turnos | Jefatura TI |
| AYU-11 | Calendario, tiempos de SLA y plazos | Horario, feriados, tiempos, plazos de cierre | Administrador |
| AYU-12 | Responder encuesta | Calificar | Solicitante |
| AYU-13 | Resultados de satisfacción | Promedios y, con permiso, respuestas con nombre | Jefatura TI |
| AYU-14 | Base de conocimiento: buscar y leer | Encontrar y valorar | Todos |
| AYU-15 | Editor de artículo y versiones | Redactar, comparar, publicar | Técnico |
| AYU-16 | Revisión de artículos | Vencidos y borradores pendientes | Jefatura TI |
| AYU-17 | Pestaña "Casos" en la ficha del activo | Historial de fallas | Técnico |

## 8. Notificaciones y automatismos

Las envía el módulo `notificaciones`; el solicitante nunca recibe contenido de comentarios internos. Quien hace la acción no se notifica a sí mismo.

| Código de evento | Cuándo | A quién | Qué dice (resumen) |
|---|---|---|---|
| `ayuda.caso_creado` | Se crea un caso | Solicitante (confirmación); responsable de la cola | "Recibimos su caso AYU-000123: asunto. Le responderemos antes de [fecha límite]." |
| `ayuda.caso_p1` | Caso P1 creado | Miembros y responsable de la cola; Jefatura TI | "Caso crítico AYU-000123 sin atender." Inmediato, no se agrupa |
| `ayuda.caso_asignado` | Cambia el responsable | Nuevo responsable; solicitante (nombre del agente) | "Se le asignó el caso..." |
| `ayuda.comentario_publico` | Comentario público | Solicitante o responsable (el otro) | "Hay una respuesta nueva en AYU-000123." Sin texto por defecto |
| `ayuda.pide_informacion` | Pasa a En espera del solicitante | Solicitante | "Necesitamos más información para continuar" |
| `ayuda.recordatorio_espera` | RN-AYU-019 | Solicitante | "Sigue pendiente su respuesta; si no responde se resolverá" |
| `ayuda.caso_resuelto` | Pasa a Resuelto | Solicitante | Solución y enlace a encuesta; cómo reabrir y hasta cuándo |
| `ayuda.caso_reabierto` | Se reabre | Responsable (o cola) | "El caso fue reabierto" |
| `ayuda.sla_en_riesgo` | 80% del tiempo | Responsable; responsable de la cola | "Faltan N minutos hábiles" |
| `ayuda.sla_vencido` | Se vence un tiempo | Responsable; responsable de la cola; Jefatura TI | "Venció el plazo de [primera respuesta/resolución]" |
| `ayuda.caso_escalado` | Escalamiento manual | Responsable de la cola destino | "Caso escalado por [motivo]" |
| `ayuda.solicitud_por_aprobar` | Caso Pendiente de aprobación | Usuarios con `ayuda.solicitud.aprobar` | "Hay una solicitud por aprobar" |
| `ayuda.solicitud_decidida` | Aprobada o rechazada | Solicitante | Resultado y motivo si se rechazó |
| `ayuda.orden_servicio_cerrada` | Se cierra una orden vinculada | Responsable del caso | "La orden de servicio vinculada se cerró" |
| `ayuda.encuesta_baja` | Encuesta con 1 o 2 | Responsable de la cola | "Una encuesta con baja calificación" (sin nombre; el detalle exige permiso) |
| `ayuda.articulo_por_revisar` | Vence la revisión | Autor; Jefatura TI | "El artículo KB-0007 requiere revisión" |

**Automatismos:** cierre automático de Resuelto; resolución automática por falta de respuesta; reparto en turnos; recálculo del SLA al cambiar prioridad; marca de SLA En riesgo y Vencido; cola sin responsable al dar de baja a un agente.

## 9. Integración con el núcleo y con otros módulos

| Con | Qué se usa | Frontera |
|---|---|---|
| Personas y Usuarios (núcleo, D-006) | Solicitante = Persona; agente y aprobador = Usuario | Si la Persona no tiene usuario, no entra a la plataforma; un agente registra por ella |
| Inventario (Etapa 4) | Activos asignados a la Persona; ficha del activo con casos | AYU no cambia el estado del activo |
| Órdenes de servicio (D-027) | Crear OS desde el caso; ver su estado | La OS tiene su propio flujo, costo y aprobación; AYU solo la referencia. Crear o cerrar una no cambia sola el estado del otro |
| Compras | Referencia por texto | No hay vínculo a órdenes de compra en esta versión |
| Auditoría (D-018) | Todo lo de la sección 6 | |
| Contadores (D-007) | Números `AYU-` y `KB-` | |
| `notificaciones` | Eventos de la sección 8 | AYU emite el evento; NOT decide canal, plantilla y límites |
| `portal-autoservicio` (escuadrón D) | Entrada del Solicitante | **Propuesta:** el portal es la puerta (inicio, "mis casos", buscar artículos) y llama a las pantallas AYU-01, 02 y 14; los casos y sus reglas viven en AYU |
| `onboarding-offboarding` (D) | Servicios como "Alta de empleado" | Puede crear solicitudes de servicio en AYU; AYU no define el proceso |
| `gestion-problemas` y `gestion-cambios` (E) | Relación | **Propuesta:** AYU guarda el vínculo "caso relacionado con problema/cambio"; el registro de problema o cambio y su flujo viven en esos módulos |
| `cmdb-ligera` (E) | Elementos de configuración | Si existe, un caso se puede vincular también a un elemento (servicio, aplicación) además de activos |
| `reportes-tableros` (F) | Datos de casos y SLA | AYU ofrece el tablero operativo (AYU-07); los reportes avanzados son de F |

## 10. Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-AYU-01 | **Dado** una Persona con usuario y una laptop asignada, **cuando** crea un caso eligiendo "Falla de equipo", impacto "solo a mí" y urgencia "no puedo trabajar", **entonces** nace como `AYU-000001`, prioridad P3, estado Nuevo, y recibe confirmación con su fecha límite de primera respuesta. |
| CA-AYU-02 | **Dado** impacto "toda la empresa" y urgencia "no puedo trabajar", **cuando** se crea el caso, **entonces** la prioridad es P1 y la cola recibe el aviso inmediato. |
| CA-AYU-03 | **Dado** un caso P2 con primera respuesta de 60 minutos hábiles, creado a las 16:30 con el horario hasta las 17:00, **cuando** el agente responde a las 09:20 del día hábil siguiente, **entonces** la primera respuesta figura "Cumplida" (30 + 20 minutos) y no "Vencida". |
| CA-AYU-04 | **Dado** un caso En atención, **cuando** el agente lo pasa a "En espera del solicitante" y el solicitante comenta, **entonces** el reloj se detuvo durante la espera y el caso vuelve a En atención automáticamente. |
| CA-AYU-05 | **Dado** un comentario interno, **cuando** el solicitante abre el caso o recibe la notificación, **entonces** no ve ese texto y el servidor tampoco se lo envía. |
| CA-AYU-06 | **Dado** una solicitud de servicio que exige aprobación, **cuando** su propio creador intenta aprobarla, **entonces** el sistema lo impide aunque sea Administrador; **cuando** otra persona con permiso aprueba, **entonces** pasa a Nuevo y el reloj arranca. |
| CA-AYU-07 | **Dado** un caso con una orden de servicio vinculada abierta, **cuando** el agente intenta resolverlo, **entonces** el sistema lo rechaza indicando la orden; tras cerrarla, **entonces** puede resolver. |
| CA-AYU-08 | **Dado** un caso Resuelto hace 8 días hábiles, **cuando** el solicitante intenta reabrirlo, **entonces** no puede y se le ofrece crear un caso de seguimiento vinculado. |
| CA-AYU-09 | **Dado** dos agentes que pulsan "tomar" el mismo caso a la vez, **cuando** ambos confirman, **entonces** uno queda como responsable y el otro ve un mensaje claro; el caso no queda con dos responsables. |
| CA-AYU-10 | **Dado** un artículo Publicado versión 2, **cuando** un técnico lo edita, **entonces** se crea un borrador versión 3, el lector sigue viendo la versión 2 hasta que alguien con `conocimiento.publicar` publique, y las versiones 1 y 2 siguen consultables sin cambios. |
| CA-AYU-11 | **Dado** un solicitante con rol Solicitante, **cuando** intenta abrir el caso de otra persona de su misma empresa, **entonces** recibe "no encontrado". |
| CA-AYU-12 | **Dado** el caso `AYU-000045` de la empresa A, **cuando** un usuario de la empresa B pide ese número o el identificador interno, **entonces** recibe "no encontrado", y la búsqueda de artículos de B no devuelve nada de A. |
| CA-AYU-13 | **Dado** un usuario con rol Solo lectura, **cuando** intenta comentar o cambiar el estado de un caso (desde la pantalla o directo al servidor), **entonces** se deniega y no se cambia nada. |
| CA-AYU-14 | **Dado** un caso con encuesta respondida, **cuando** un Técnico (sin `encuesta.ver_detalle`) pide la respuesta con nombre, **entonces** se deniega; cuando la Jefatura TI la consulta, **entonces** queda registrada en la auditoría. |

## 11. Casos límite

1. Un agente crea un caso por teléfono para una Persona sin usuario: se notifica solo por correo si la Persona tiene correo, sin enlace; si no tiene, solo queda en el caso.
2. Se desactiva un servicio, o cambian los tiempos de SLA, con casos abiertos: siguen su curso sin cambios; no se crean casos nuevos del servicio (RN-AYU-007).
4. Un caso vence en un feriado o fuera de horario: el vencimiento se cuenta en el siguiente horario hábil.
5. El solicitante intenta vincular una laptop que ya no tiene asignada: no aparece en su lista; un agente sí puede vincularla.
6. Dos casos del mismo problema: se resuelve uno como "Duplicado" con vínculo al otro.
7. Un solicitante usa la descripción para pegar una contraseña: no se puede detectar siempre; se avisa en pantalla y la jefatura puede retirar el comentario.
8. La Persona solicitante se da de baja con casos abiertos: se reasignan o cancelan con motivo (D-006); los cerrados se anonimizan al plazo de D-024.
9. Se reabre un caso y su agente ya no existe: vuelve a la cola sin responsable.
10. Una orden de servicio vinculada se cancela: el caso no cambia solo; se avisa al responsable. Las colas no se borran: se desactivan sin casos abiertos.
12. Un usuario con dos empresas abre un enlace de un caso de la empresa que no tiene activa: se le pide cambiar de empresa si es miembro; si no, "no encontrado".
13. Servicio con aprobación y el único aprobador de la empresa es quien lo pide: aplica la excepción de D-015 punto 4 si está activada; si no, queda bloqueado y se avisa al administrador.

## 12. Decisiones propuestas y supuestos

| N.º | Tipo | Propuesta y motivo |
|---|---|---|
| AYU-S01 | [SUPUESTO] | Módulo en Fase 2 (después de la Etapa 7), porque el documento v0.1 excluye tickets y los cimientos primero. |
| AYU-S02 | [SUPUESTO] | Matriz de prioridad fija y tiempos de SLA configurables por prioridad: simple de explicar; la matriz editable se puede abrir después. |
| AYU-S03 | [SUPUESTO] | Reloj solo en horario de atención y con pausas por espera (lo habitual; evita vencimientos injustos). Plazos por defecto: reapertura 7 días hábiles, cierre automático 3, recordatorio 2, resolución por falta de respuesta 5. |
| AYU-S04 | [SUPUESTO] | La aprobación de servicios la hace quien tenga el permiso; no hay jefe directo porque la v1 no tiene organigrama. |
| AYU-S05 | [SUPUESTO] | Sin correo entrante: no se responde ni se crea un caso escribiendo a un buzón. Evita suplantación y cuesta menos; se puede ver después. |
| AYU-S06 | [SUPUESTO] | Escalamiento automático solo avisa; reasignar solo lo decide una persona. |
| AYU-S08 | [SUPUESTO] | Datos de casos se conservan 5 años como la auditoría; el nombre del solicitante se anonimiza según D-024. Pendiente de la confirmación legal ya escalada en D-024. |
| AYU-E01 | [ESCALAR AL CEO] (dinero) | **Adjuntos en casos y artículos.** Hoy no (D-022). Al habilitarlos: capturas de pantalla (png, jpg), documentos (pdf) y texto (txt, log), máximo 5 archivos por comentario y 5 MB cada uno [SUPUESTO], separados por empresa, entregados solo tras comprobar el permiso, con revisión de virus, y los internos solo para agentes. Cambian RF-AYU-013, RF-AYU-039, la retención y la privacidad (una captura puede mostrar datos personales). Implican almacenamiento con costo mensual y posible costo del análisis de virus; DevOps estima el costo por GB cuando llegue el momento. Recomendación: no habilitar hasta cerrar la Etapa 4 y ver el uso real. |
| AYU-E02 | [ESCALAR AL CEO] (dinero) | Los avisos por correo de este módulo aumentan el volumen del servicio de correo ya escalado en `decisiones.md` (Escalado, Dinero 1). Si el plan contratado queda corto, el costo sube. Se mitiga con resúmenes y límites del módulo `notificaciones`. |

## 13. Fuera de alcance

- Archivos adjuntos (D-022; ver AYU-E01).
- Crear o responder casos por correo, teléfono, chat o mensajería.
- Gestión de cambios, gestión de problemas y base de datos de configuración (módulos de otro escuadrón).
- Encuestas distintas de la de satisfacción del caso; encuestas a personas sin usuario.
- Sugerencias con inteligencia artificial; chatbots; costos por caso; aprobación con montos (vive en compras y órdenes de servicio).
- Matriz de prioridad editable, varios niveles de aprobación, organigrama.
- Base de conocimiento compartida entre empresas; portal público sin acceso.
- Reportes avanzados y paneles de dirección (módulo `reportes-tableros`); webhooks (módulo `integraciones-api`).

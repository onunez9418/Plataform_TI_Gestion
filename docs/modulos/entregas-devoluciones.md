# Módulo: Entregas y devoluciones de activos (ENT)

**Versión:** 0.1 (borrador del Analista de Negocio, Oleada B, Escuadrón D)
**Sigla de requisitos:** ENT
**Fuente de verdad:** `docs/documento-funcional.md` y `docs/equipo/decisiones.md`. Aplican D-006 (Persona), D-012 (estados y constancia), D-009 (reingreso), D-010 (stock), D-022 (sin adjuntos), D-024.5 (retención de constancias).
**Marcas:** **[SUPUESTO]** = propuesta mía que confirma el Gerente de TI. **[ESCALAR AL CEO]** = solo dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Dejar constancia ordenada de cada vez que un equipo sale de TI hacia una Persona y cada vez que vuelve: en qué condición, con qué accesorios, quién entregó, quién recibió y si la Persona dio su conformidad. Responde en segundos a "¿quién tiene esta laptop?" y "¿qué equipos ha tenido Ana?".

**Fase.** **Etapa 4** (junto con el inventario): registro de entrega y devolución, acta imprimible en PDF, conformidad en papel, extravío y robo, historiales. **Después de la versión 1:** aceptación en pantalla por la Persona y subida del acta firmada (D-022, D-023.2); se especifican en 4.4 y 12 para que el diseño de datos no obligue a rehacerlo.

**Entra**
1. Acta de entrega y acta de devolución de uno o varios activos, con condición y accesorios.
2. Préstamo temporal (entrega con fecha de devolución prevista, D-012.2).
3. Traspaso de una Persona a otra en un solo acto.
4. Conformidad de la Persona **sin firma manuscrita adjunta**: acta imprimible, firma en papel y marca en el sistema.
5. Extravío y robo de activos, y recuperación posterior.
6. Historial por Persona y por activo.

**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Acta** | Documento (registro en el sistema y PDF imprimible) que prueba una entrega o una devolución. Lleva número propio. |
| **Entrega** | Un activo pasa de TI a una Persona. El activo queda "Asignado". |
| **Devolución** | El activo vuelve de la Persona a TI. Queda "En stock", "En reparación" o "De baja". |
| **Traspaso** | Un equipo pasa directo de una Persona a otra. Genera una devolución y una entrega en un solo acto. |
| **Préstamo** | Entrega con fecha de devolución prevista. No es un estado del activo (D-012.2). |
| **Condición** | Estado físico del equipo al entregar o devolver: Nuevo, Bueno, Con detalles, Dañado. |
| **Accesorio** | Lo que acompaña al equipo: cargador, funda, mouse. Puede ser un artículo del inventario (por cantidad) o un texto libre. |
| **Conformidad** | Constancia de que la Persona recibió el equipo y está de acuerdo con lo escrito en el acta. |
| **Asignación** | Fila de historial de un activo con una Persona: desde, hasta y estado al devolver (D-012.7). |
| **Custodio** | Persona responsable de un equipo compartido (ver módulo PER). |

## 3. Roles y permisos

| Acción | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Empleado (portal) |
|---|---|---|---|---|---|---|---|---|
| Ver actas e historiales | `entregas.ver` | Todo | Todo | Todo | Todo | Propio | Todo | Propio |
| Registrar entrega o préstamo | `entregas.crear` | Sí | No | Sí | Sí | No | No | No |
| Registrar devolución | `devoluciones.crear` | Sí | No | Sí | Sí | No | No | No |
| Traspaso entre Personas | `entregas.traspasar` | Sí | No | Sí | No | No | No | No |
| Marcar conformidad en papel | `entregas.marcar_conformidad` | Sí | No | Sí | Sí | No | No | No |
| Imprimir o reimprimir acta | `actas.imprimir` | Sí | Sí | Sí | Sí | Propio | Todo | Propio |
| Anular un acta por error | `entregas.anular` | Sí | Sí | No | No | No | No | No |
| Registrar extravío o robo | `extravios.registrar` | Sí | Sí | Sí | No | No | No | No |
| Registrar hallazgo de un equipo extraviado | `extravios.recuperar`* | Sí | Sí | No | No | No | No | No |
| Ver nombre de la Persona en actas | `datos_personales.ver`* | Sí | Sí | Sí | Sí | Propio | No | Propio |
| Exportar actas | `exportar.entregas`* | Sí | No | No | No | No | No | No |

Notas:
- * = sensible, se asigna por separado (D-004.4). `extravios.recuperar` es el "reingreso" de D-009.3 y D-012.3: permiso especial con motivo.
- Sin `datos_personales.ver`, las listas muestran la referencia de la Persona (P-0042) y no el nombre.
- Solicitante y Empleado (portal) solo ven y reimprimen actas **de su propia Persona**.
- Reportar un extravío desde el portal abre un caso en la mesa de ayuda; no cambia el estado del equipo (RN-ENT-015).
- Todo se comprueba en el servidor, no solo en la pantalla.

## 4. Requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Etapa |
|---|---|---|
| RF-ENT-001 | Registrar una entrega: elegir una Persona Activa, uno o más activos En stock, condición de cada uno, accesorios, observaciones y tipo (Definitiva o Préstamo con fecha de devolución prevista). Al confirmar, los activos pasan a Asignado y se genera el acta. | 4 |
| RF-ENT-002 | Guardar una entrega como borrador y retomarla. El borrador no reserva los equipos. Un borrador sin efecto se puede borrar (D-019). | 4 |
| RF-ENT-003 | Generar el acta de entrega en PDF: empresa, número, fecha y hora, Persona y área, quién entrega, tabla de equipos (artículo, marca, modelo, serie, condición), accesorios, observaciones, fecha de devolución prevista (si es préstamo), texto de conformidad, espacio de firma de la Persona y de quien entrega, aviso de privacidad. | 4 |
| RF-ENT-004 | Registrar una devolución: elegir la Persona, los activos que devuelve (todos o algunos), condición, accesorios devueltos o faltantes, si el equipo fue borrado, si se liberó el bloqueo de cuenta, ubicación de retorno y estado de destino. | 4 |
| RF-ENT-005 | Generar el acta de devolución en PDF con el mismo formato. | 4 |
| RF-ENT-006 | Traspaso: pasar uno o más equipos de la Persona A a la Persona B en un solo acto atómico, con dos actas enlazadas. | 4 |
| RF-ENT-007 | Marcar la conformidad: "Firmada en papel" (con fecha y quién recibió el papel, y un texto opcional de dónde se archiva) o "Firma rechazada por la Persona" (con motivo). | 4 |
| RF-ENT-008 | Reimprimir un acta cuantas veces se necesite. La copia lleva la marca "Reimpresión" con fecha; el número no cambia. | 4 |
| RF-ENT-009 | Anular un acta registrada por error, con motivo, si el activo no tuvo movimientos posteriores. | 4 |
| RF-ENT-010 | Registrar extravío o robo de un activo asignado: tipo (Extravío, Robo, No devuelto tras el cese), fecha del hecho, circunstancias, número de denuncia (texto, opcional). El activo pasa a "Extraviado o robado" y la asignación se cierra. | 4 |
| RF-ENT-011 | Registrar el hallazgo de un equipo extraviado: reingreso con motivo y permiso especial; luego se puede volver a entregar. | 4 |
| RF-ENT-012 | Historial por Persona: todas sus asignaciones (vigentes y cerradas) con actas, condición y fechas. | 4 |
| RF-ENT-013 | Historial por activo: todas sus asignaciones (Persona, desde, hasta, condición al entregar y al devolver, estado al devolver). | 4 |
| RF-ENT-014 | Lista de actas con buscador y filtros (tipo, Persona, activo, fecha, conformidad, estado) y exportación a Excel con permiso aparte (D-021.3). | 4 |
| RF-ENT-015 | Bandeja de pendientes: actas sin firma pasados N días, préstamos por vencer y vencidos, equipos reportados como extraviados. | 4 |
| RF-ENT-016 | Renovar un préstamo: nueva fecha prevista con motivo y auditoría. | 4 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-ENT-001 | Solo una Persona **Activa** de la misma empresa puede recibir equipos. |
| RN-ENT-002 | Solo se entregan activos **En stock**. Un activo Asignado, En reparación, Extraviado o robado o De baja se rechaza con su motivo (D-012.3). |
| RN-ENT-003 | Un activo no puede tener dos asignaciones vigentes a la vez. La base de datos lo impide aunque dos técnicos entreguen el mismo equipo al mismo tiempo (D-012.3). |
| RN-ENT-004 | La condición de cada equipo es obligatoria. "Con detalles" y "Dañado" exigen observación escrita. **No se entrega un equipo "Dañado"**. |
| RN-ENT-005 | El acta lleva número correlativo por empresa: E-000001 para entregas y D-000001 para devoluciones. Un número no se reutiliza; puede haber saltos (D-007). |
| RN-ENT-006 | El acta guarda una copia de lo que se firmó: nombre y área de la Persona, artículo, marca, modelo, serie, quién entregó, fecha y hora. Los cambios posteriores no la modifican (S-PER-06). |
| RN-ENT-007 | Quien registra una entrega o devolución no puede ser la Persona que recibe o devuelve (el Usuario vinculado a esa Persona). Nadie se entrega equipos a sí mismo. Aplica a todos los roles, incluido el Administrador. |
| RN-ENT-008 | Una entrega queda registrada y el activo Asignado desde que se confirma, haya o no firma. La conformidad es un dato aparte y no bloquea el uso del equipo. |
| RN-ENT-009 | En la versión 1 la conformidad es **papel firmado**. Quien marca "Firmada en papel" es responsable de que el papel exista; la empresa conserva el papel. La plataforma no lo guarda (D-022). |
| RN-ENT-010 | Un acta sin conformidad pasados 7 días (configurable por empresa) aparece en la bandeja de pendientes y genera aviso. |
| RN-ENT-011 | Devolución: la ubicación de retorno es obligatoria (se sugiere el almacén de TI). Destinos permitidos: En stock, En reparación, De baja (este último con motivo y permiso de baja). |
| RN-ENT-012 | Un equipo devuelto "Dañado" solo puede ir a En reparación o De baja. No vuelve al stock con esa condición. |
| RN-ENT-013 | Solo se devuelven equipos que figuran asignados a esa Persona. Cualquier otro se rechaza. |
| RN-ENT-014 | Accesorios que son artículos por cantidad (mouse, teclado) generan una salida de stock al entregar y un ingreso al devolver. Si no hay stock suficiente, la entrega se rechaza (D-010.1). Accesorios de texto libre (cargador original, funda) no mueven stock. |
| RN-ENT-015 | Un accesorio no devuelto se registra como "Faltante" en el acta. No genera cobro ni descuento en la plataforma. |
| RN-ENT-016 | Reportar un extravío o robo exige motivo y tipo. El activo pasa a "Extraviado o robado" y la asignación se cierra con ese resultado. Un reporte hecho por la Persona desde el portal no cambia el estado hasta que TI lo confirme. |
| RN-ENT-017 | Un préstamo exige fecha de devolución prevista: hoy o futura, máximo 365 días (S-ENT-05). Pasada esa fecha, el préstamo figura como "Vencido" y genera avisos. |
| RN-ENT-018 | El traspaso es atómico: o se registran la devolución y la entrega, o ninguna. La condición se registra una vez. La Persona destino debe estar Activa y ser distinta de la de origen. |
| RN-ENT-019 | Anular un acta solo se permite si el activo no tuvo asignación posterior, reparación, traslado o baja. Con motivo. Genera el movimiento contrario y el acta queda "Anulada"; nunca se borra (D-017, D-019). |
| RN-ENT-020 | Confirmar una entrega o devolución es todo o nada y no se repite con doble clic: si un equipo falla, no se registra ninguno (mismo criterio de D-016.4). |
| RN-ENT-021 | Las actas se conservan mientras exista el activo más 5 años (D-024.5). Esa propuesta espera confirmación de legal. |
| RN-ENT-022 | Un acta tiene una sola Persona y activos de una sola empresa. |
| RN-ENT-023 | Todo registro lleva la empresa. Un identificador de otra empresa responde "no encontrado" (D-021.5). |
| RN-ENT-024 | Nada con historial se borra: ni actas, ni asignaciones, ni reportes de extravío. |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-ENT-001 | Registrar una entrega de un equipo toma 5 pasos o menos desde la ficha del activo y menos de 1 minuto con datos a mano. |
| RNF-ENT-002 | El PDF del acta se genera en menos de 5 segundos (p95) y se imprime en una hoja A4 con hasta 10 equipos. |
| RNF-ENT-003 | Dos entregas simultáneas del mismo equipo: exactamente una tiene éxito; la otra recibe un mensaje claro. Probado con 20 intentos en paralelo. |
| RNF-ENT-004 | El historial de una Persona con 200 asignaciones carga en menos de 2 segundos (p95). |
| RNF-ENT-005 | 100 % de entregas, devoluciones, anulaciones y extravíos quedan en la auditoría con quién, cuándo, antes y después, en la misma operación (D-018.2). |
| RNF-ENT-006 | El registro de entrega y devolución se usa completo en pantalla de 360 px y con lector de código de barras como teclado (D-021). |
| RNF-ENT-007 | Cada tabla del módulo tiene prueba de aislamiento entre empresas (D-025). |
| RNF-ENT-008 | El PDF del acta no incluye datos personales distintos de los de la tabla de la sección 6 (nombre, área, referencia). |

### 4.4 Alternativa a la firma adjunta y qué cambia si se habilita (D-022)

**Hoy (versión 1).** 1) El técnico confirma la entrega y se imprime el acta. 2) La Persona firma en papel. 3) El técnico marca "Firmada en papel" con la fecha. 4) La empresa archiva el papel. La bandeja de pendientes avisa de las actas sin firma. El sistema prueba **que la entrega se registró y quién la registró**, pero no guarda la firma.

**Si se habilita el adjunto (decide el CEO por costo de almacenamiento, D-022):**
- Marcar "Firmada en papel" pasaría a pedir la foto o el escaneo (obligatorio u opcional, según configuración por empresa).
- Se guarda por empresa, con tipos y tamaños limitados, y se entrega solo tras comprobar el acceso.
- Se agrega el plazo de conservación del archivo (mismo plazo que el acta, D-024.5) y su anonimización o borrado al vencer.
- El acta firmada se vería desde el activo y desde la Persona.

**Si se habilita la aceptación en pantalla (después de la versión 1):** la Persona acepta desde el portal (POR) o por un enlace único enviado a su correo (válido una vez, vence a los 7 días). Se registra fecha, hora, Usuario o correo y la versión del texto. Seguridad debe revisar el enlace antes de construirlo. Convive con el papel; la empresa elige cuál exige.

## 5. Estados y transiciones

**Acta**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Borrador | `entregas.crear` o `devoluciones.crear` | Persona elegida |
| Borrador | Registrada | Quien lo creó | Cumple RN-ENT-001 a 004; todo o nada |
| Borrador | (borrado) | Quien lo creó | Nunca tuvo efecto (D-019) |
| Registrada | Anulada | `entregas.anular` | Motivo; RN-ENT-019 |

**Conformidad del acta de entrega**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| Pendiente de firma | Firmada en papel | `entregas.marcar_conformidad` | Fecha de firma |
| Pendiente de firma | Firma rechazada | `entregas.marcar_conformidad` | Motivo de la Persona |
| Firma rechazada | Firmada en papel | `entregas.marcar_conformidad` | Si luego firma |

**Asignación (fila de historial)**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) Vigente | Cerrada por devolución | Devolución registrada | Estado de destino elegido |
| Vigente | Cerrada por traspaso | Traspaso | Ver RN-ENT-018 |
| Vigente | Cerrada por extravío | `extravios.registrar` | Motivo |
| Vigente | Anulada | `entregas.anular` | RN-ENT-019 |

**Préstamo:** Vigente, Por vencer (3 días antes), Vencido; se calcula por fecha, sin acción del usuario. Se cierra con la devolución.

## 6. Datos

**Acta.** Empresa; identificador interno; número (E- o D-, único por empresa); tipo (Entrega, Devolución); estado (Borrador, Registrada, Anulada); Persona; copia del nombre y área; quién entrega o recibe (Usuario); fecha y hora (en hora universal, mostrada en la zona de la empresa); tipo de entrega (Definitiva, Préstamo); fecha prevista; observaciones; conformidad (Pendiente de firma, Firmada en papel, Firma rechazada); fecha de conformidad; quién la marcó; nota de dónde se archiva; acta de origen (para traspasos y anulaciones); motivo de anulación; veces impresa.

**Línea de acta.** Acta; activo; copia de artículo, marca, modelo y serie; condición; observación; si es devolución: estado de destino, ubicación de retorno, "equipo borrado" (Sí, No, No aplica), "bloqueo de cuenta liberado" (Sí, No, No aplica).

**Accesorio de acta.** Acta; tipo (Del inventario o Texto libre); artículo y cantidad, o texto; en devolución: Devuelto, Faltante o Dañado.

**Asignación.** Empresa; activo; Persona; acta de entrega; acta de devolución; desde; hasta; resultado (Devuelto, Traspasado, Extraviado o robado, Anulada); condición al entregar y al devolver. Restricción: una sola vigente por activo.

**Reporte de extravío.** Empresa; activo; asignación; tipo; fecha del hecho; circunstancias; número de denuncia (texto); reportado por; confirmado por; estado (Reportado, Confirmado, Recuperado); fecha de recuperación.

**Qué se audita:** creación, registro, anulación y reimpresión de actas; marcas de conformidad; extravíos y recuperaciones; renovaciones de préstamo; exportaciones. No se audita el contenido de las circunstancias más allá de que fueron registradas.

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Nueva entrega (asistente) | Elegir Persona, equipos, condición y accesorios; confirmar | Técnico, Almacén |
| Nueva devolución | Elegir los equipos de la Persona y registrar su condición y destino | Técnico, Almacén |
| Traspaso | Pasar equipos de una Persona a otra | Técnico |
| Acta (detalle e imprimible) | Ver, imprimir, marcar conformidad o anular | Técnico |
| Lista de actas | Buscar y filtrar | Técnico, Jefatura TI |
| Bandeja de pendientes | Actas sin firma, préstamos vencidos, extravíos por confirmar | Técnico, Jefatura TI |
| Reportar extravío o robo | Registrar el hecho | Técnico |
| Registrar hallazgo | Recuperar un equipo extraviado | Jefatura TI |
| Pestaña Historial (ficha de la Persona) | Ver todo lo que ha tenido | Técnico |
| Pestaña Historial (ficha del activo) | Ver todas sus asignaciones | Técnico |

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice |
|---|---|---|
| Entrega registrada | Correo de la Persona (si tiene) | "Se registró la entrega de [artículo, serie] a tu nombre el [fecha]. Acta E-000123. Si no la reconoces, avisa a TI." |
| Acta sin conformidad a los 7 días | Quien entregó y Jefatura TI | "El acta E-000123 sigue sin firma. Persona: P-0042." |
| Préstamo a 3 días de vencer | Persona (si tiene correo) y quien entregó | "El préstamo de [artículo] vence el [fecha]." |
| Préstamo vencido | Persona, quien entregó y Jefatura TI | "El préstamo venció el [fecha]." Se repite cada 7 días. |
| Extravío o robo registrado | Jefatura TI y Administrador | "Se registró [tipo] de [artículo, serie] asignado a P-0042." |
| Acta anulada | Jefatura TI | "Se anuló el acta [número]. Motivo: [motivo]." |
| Reporte de extravío desde el portal | Técnicos y Jefatura TI | "[P-0042] reportó extravío de [artículo]. Falta confirmarlo." |
| Diario (automático) | (sistema) | Recalcula "por vencer" y "vencido"; no cambia estados de activos. |

Eventos que se envían a una Persona **sin Usuario** (acordado con Notificaciones): entrega registrada, préstamo por vencer y préstamo vencido. Van al correo de la Persona, solo si lo tiene, sin enlaces de acción y sin más datos que artículo, serie, fecha y número de acta. Ningún otro evento de este módulo se envía a Personas sin Usuario.

## 9. Integración con el núcleo y con otros módulos

- **Núcleo / inventario.** Una entrega cambia el estado del activo a Asignado y una devolución lo cambia al destino elegido, respetando la tabla de D-012.3. Los accesorios por cantidad usan los movimientos de stock de D-010. Al cerrarse por extravío se aplica la regla de reingreso de D-009.3.
- **PER.** Persona, área y ubicaciones. El bloqueo de cese consulta las asignaciones vigentes (RN-PER-008). Un traspaso o un extravío "No devuelto tras el cese" destraban ese bloqueo.
- **ONB.** La tarea "Entregar equipo" abre la entrega con la Persona prellenada. La tarea "Devolver equipo" se marca Hecha cuando se registra la devolución de todos los equipos.
- **POR.** La Persona ve sus equipos y sus actas, reimprime sus actas y puede reportar problema o extravío. En una fase posterior confirma recepción.
- **Mesa de ayuda.** Un equipo devuelto "Dañado" puede originar un caso. Un reporte de extravío desde el portal abre un caso.
- **Garantías y mantenimiento / órdenes de servicio (Etapa 6).** Desde una devolución a "En reparación" se podrá crear una orden de servicio; no se crea sola (D-027).
- **Licencias y líneas móviles.** Si se asigna una línea o licencia a la misma Persona en el mismo acto, el acta puede listarla como dato informativo; la asignación la gestiona cada módulo. Se confirma con el Escuadrón B.
- **Reportes.** Equipos por Persona y por área, actas pendientes de firma, préstamos vencidos, tasa de extravío.

## 10. Criterios de aceptación

- **CA-ENT-01.** Dado un técnico con `entregas.crear`, una Persona Activa y una laptop En stock, cuando confirma la entrega con condición "Nuevo", entonces la laptop queda Asignada, se genera el acta E-000001 en PDF y el historial de la laptop y de la Persona muestra la nueva asignación.
- **CA-ENT-02.** Dada una laptop ya Asignada a Ana, cuando otro técnico intenta entregarla a Luis, entonces se rechaza con "este equipo ya está asignado" y no cambia nada.
- **CA-ENT-03.** Dados dos técnicos que confirman a la vez la entrega de la misma laptop a Personas distintas, cuando ambas operaciones llegan al servidor, entonces solo una queda registrada y el equipo tiene una sola asignación vigente.
- **CA-ENT-04.** Dada una devolución con condición "Dañado", cuando el técnico elige destino "En stock", entonces el sistema lo impide y ofrece "En reparación" o "De baja".
- **CA-ENT-05.** Dada una entrega con un mouse del inventario (por cantidad) y solo 0 mouses en stock, cuando se confirma, entonces se rechaza completa, ningún equipo cambia de estado y el stock sigue sin quedar negativo.
- **CA-ENT-06.** Dado un acta con 7 días sin conformidad, cuando corre el aviso diario, entonces el técnico que entregó y Jefatura TI reciben el aviso y el acta aparece en la bandeja de pendientes.
- **CA-ENT-07 (permiso denegado).** Dado un usuario "Solo lectura", cuando intenta registrar una entrega o anular un acta, directamente en pantalla o llamando al servidor, entonces se rechaza y no queda ningún cambio.
- **CA-ENT-08 (aislamiento).** Dados un acta de la empresa A y un usuario de la empresa B, cuando B pide el acta de A por su identificador o por su número, entonces responde "no encontrado"; y las listas de B nunca incluyen actas, Personas ni activos de A.
- **CA-ENT-09.** Dada una Persona con 2 equipos, cuando se registra un traspaso a otra Persona y falla la entrega de uno, entonces no se registra ninguna devolución ni entrega y ambos equipos siguen con la Persona original.
- **CA-ENT-10.** Dado un técnico cuyo Usuario está vinculado a la Persona "Luis", cuando intenta entregar una laptop a Luis, entonces se rechaza por autoentrega.
- **CA-ENT-11.** Dado un activo asignado, cuando se registra un extravío con tipo "Robo" y motivo, entonces el activo pasa a "Extraviado o robado", la asignación se cierra, la Persona deja de tener ese equipo a cargo y se avisa a Jefatura TI.
- **CA-ENT-12.** Dada un acta con la laptop ya reasignada después, cuando se intenta anular, entonces se rechaza porque el equipo tuvo movimientos posteriores.
- **CA-ENT-13.** Dada una Persona anonimizada, cuando se reimprime un acta antigua, entonces muestra "Persona dada de baja 0042" y conserva número, equipos, condición y fechas.

## 11. Casos límite

1. **Entrega sin firma de la Persona.** Válida: el equipo queda Asignado; el acta queda pendiente y aparece en la bandeja.
2. **La Persona se niega a firmar.** Se marca "Firma rechazada" con el motivo; el equipo sigue asignado. Qué consecuencias tiene es un tema laboral (ver E-ENT-01).
3. **Devolución parcial.** Entregó laptop y celular, devuelve solo el celular: acta de devolución solo del celular; la laptop sigue asignada.
4. **Devuelve alguien distinto de la Persona** (un compañero lo trae). Se registra a nombre de la Persona dueña; la observación puede indicar quién lo trajo.
5. **Persona cesada con equipos en casa.** El cese está bloqueado (RN-PER-008). Se resuelve con devolución o con "Extraviado o robado, No devuelto tras el cese".
6. **Equipo extraviado que aparece.** Reingreso con permiso y motivo; si estaba en poder de la Persona, se entrega de nuevo con acta nueva.
7. **Accesorio de inventario que no se devuelve.** Queda "Faltante"; el stock no vuelve a subir.
8. **Persona sin correo.** La entrega es válida; no recibe el aviso por correo.
9. **Equipo compartido de una sala.** Se entrega a un Custodio; la ubicación del activo es la sala (S-ENT-03).
10. **Reloj y zona horaria.** La fecha del acta es la de la zona de la empresa; la hora exacta se guarda en hora universal.
11. **Serie corregida después de la entrega** (D-017.1). El acta conserva la serie con que se firmó; el historial del activo muestra la corrección.
12. **Doble clic en "Confirmar".** Se registra una sola vez.
13. **Equipo con bloqueo de cuenta del fabricante (celular).** La devolución puede registrarse con "bloqueo liberado: No"; queda destacado en la bandeja.

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-ENT-01 | [SUPUESTO] | Conformidad de la versión 1 = papel firmado y marca en el sistema (RN-ENT-009). Es lo que ya dice D-012.6. |
| S-ENT-02 | [SUPUESTO] | Almacén puede entregar y recibir devoluciones; no puede registrar extravíos. Motivo: mueve stock a diario, pero extravío es una decisión de control. |
| S-ENT-03 | [SUPUESTO] | "Asignado" siempre tiene una Persona responsable. Un equipo fijo en una sala se asigna a un Custodio y su ubicación es la sala. Cambiar solo la ubicación no genera acta. Motivo: D-006 habla de "asignar a Persona o ubicación" y esto evita equipos asignados a nadie. El Gerente de TI lo confirma con quien escriba el inventario. |
| S-ENT-04 | [SUPUESTO] | Se agrega el traspaso como acto único. Motivo: sin él, reasignar la laptop de quien se va a quien entra exigiría dos actas separadas y un paso intermedio por stock. |
| S-ENT-05 | [SUPUESTO] | Préstamo máximo de 365 días, aviso 3 días antes y repetido cada 7 días tras el vencimiento. Configurable. |
| S-ENT-06 | [SUPUESTO] | Aviso de acta sin firma a los 7 días, configurable por empresa. |
| S-ENT-07 | [SUPUESTO] | Condiciones: Nuevo, Bueno, Con detalles, Dañado; lista fija en la versión 1. Motivo: reportes comparables. |
| S-ENT-08 | [SUPUESTO] | Accesorios como lista de dos tipos: artículo del inventario o texto libre. |
| S-ENT-09 | [SUPUESTO] | Prohibida la autoentrega (RN-ENT-007). Motivo: es el control más barato contra el uso indebido de equipos. |
| S-ENT-10 | [SUPUESTO] | Numeración E- y D- con 6 dígitos mínimos. |
| E-ENT-01 | [ESCALAR AL CEO] | **Legal.** ¿Tiene validez el acta con firma en papel archivada por TI, sin copia en la plataforma? ¿Y la aceptación en pantalla? ¿Puede usarse el acta para descontar o cobrar al empleado un equipo perdido? El equipo no da opinión legal: se pide una a un abogado (decisiones.md, "Legal", puntos 2 y 3). Mientras tanto, el acta dice "constancia de entrega" y no menciona cobros. |
| E-ENT-02 | [ESCALAR AL CEO] | **Dinero.** Habilitar el adjunto del acta firmada implica pagar almacenamiento mensual (D-022). Se consulta al cierre de la Etapa 4, con las actas reales a la vista. |
| E-ENT-03 | [ESCALAR AL CEO] | **Legal.** El texto del aviso de privacidad que va al pie del acta lo redacta o revisa legal (D-024.7, R8). Hasta entonces se imprime un texto provisional marcado "borrador". |

## 13. Fuera de alcance

- Firma manuscrita escaneada o fotografiada (D-022).
- Aceptación en pantalla de la Persona y firma electrónica (fase posterior).
- Devolución al proveedor y mercadería dañada de una compra (D-016.1).
- Cobros, descuentos o sanciones al empleado.
- Impresión de etiquetas y códigos QR, y escaneo con cámara (D-021.2).
- Estado "En tránsito" (D-010).
- Entregas masivas a muchas Personas en un solo acto.
- Cálculo de depreciación del equipo entregado.

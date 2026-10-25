# Módulo: Garantías y mantenimiento (GAR)

**Slug:** `garantias-mantenimiento` · **Sigla:** GAR · **Versión:** 0.3 (aplica D-065 a D-076)
**Base:** `docs/equipo/decisiones.md` (D-001 a D-064, vinculantes), `docs/documento-funcional.md` y `docs/equipo/plan-correcciones.md`.
**Marcas:** **[SUPUESTO]** = propuesta del analista que el Gerente de TI confirma. **[ESCALAR AL CEO]** = implica dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Que el área de TI sepa qué equipos siguen en garantía, cuáles están por vencer, qué mantenimiento se les debe hacer y cuándo, qué se les hizo antes y cuánto costó, y que no se pague una reparación que la garantía cubría.

| Parte | Qué contiene | Cuándo (D-056) |
|---|---|---|
| **GAR-A** | Tabla `garantia` desde la Etapa 4: fecha de compra y meses, o fin directo; garantía del fabricante creada al recibir o importar; chip en la ficha y filtro "por vencer". | `v1, Etapas 4 y 5` |
| **GAR-B** | Varias garantías por activo, reclamos, planes y mantenimiento preventivo y correctivo, hoja de vida, avisos. | `Fase 2`, ola B (después de PRV-B) |

No hay migración de A a B: la Etapa 4 ya modela la forma final (D-060.8, H-DAT-20). GAR aplica solo a categorías con **naturaleza "equipo físico"** (D-045); las licencias, los servicios y el stock por cantidad quedan fuera. GAR-B se activa por empresa (`empresa.configurar_modulos`); apagarlo oculta, no borra.

**Entra:** garantías por activo con serie; reclamos y reemplazo de una unidad; planes de mantenimiento; mantenimiento preventivo y correctivo con historial; proveedor de servicio o técnico interno; relación con la orden de servicio (OS) y con el estado "En reparación"; reglas de aviso e indicadores. **No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Garantía** | Cobertura de un fabricante o proveedor sobre un activo por un periodo. Tipos: Fabricante, Extendida, Proveedor. |
| **Garantía efectiva** | De las garantías vigentes de un activo, la que termina más tarde. |
| **Reclamo** | Pedido formal al garante para que repare o reemplace un activo. Número `RCL-000007`. |
| **Mantenimiento** | Trabajo sobre un activo: preventivo (planificado) o correctivo (por una falla). Número `MNT-000045`. |
| **Plan de mantenimiento** | Regla "a este SKU o categoría se le hace esta tarea cada tanto tiempo". |
| **Atrasado, Vigente, Vencida** | Etiquetas y estados calculados al leer con la fecha y zona de la empresa; no se guardan (D-062.2). |
| **Hoja de vida** | Historial de garantías, reclamos y mantenimientos de un activo, dentro de la ficha. |
| **Proveedor de servicio** | Proveedor de PRV con "presta servicios" activado. |
| **Orden de servicio (OS)** | Documento de trabajo del núcleo (Etapa 6), con técnico, costo y proveedor. El mantenimiento es el registro del activo; la OS es la orden de trabajo. |
| **En reparación** | Estado del activo definido por D-012. |

## 3. Roles y permisos

Los permisos son los del registro único `docs/registro-permisos.md` (PS-nn, D-036); el número manda y el nombre técnico se repite en el texto por legibilidad. Valores iguales a los del registro. Este módulo agrega filas y no cambia celdas del núcleo (D-037). **Empleado (portal): no aplica.** "Propio" = lo que corresponde a la Persona vinculada del usuario como ejecutor (sin Persona vinculada, lista vacía, nunca error).

| Acción | PS y permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver garantías y reclamos | PS-102 `garantias.ver` | Todo | Todo | Todo | No | No | Todo |
| Registrar y corregir garantías | PS-103 `garantias.registrar` | Sí | No | Sí | No | No | No |
| Anular garantía | PS-104 `garantias.anular` | Sí | No | No | No | No | No |
| Abrir y gestionar reclamos | PS-105 `garantias.gestionar_reclamos` | Sí | No | Sí | No | No | No |
| Recibir avisos de garantías | PS-106 `garantias.recibir_avisos` | Todo | Todo | Propio | No | No | No |
| Ver mantenimientos | PS-107 `mantenimiento.ver` | Todo | Todo | Todo | No | No | Todo |
| Programar mantenimiento | PS-108 `mantenimiento.programar` | Sí | No | Sí | No | No | No |
| Ejecutar y cerrar | PS-109 `mantenimiento.ejecutar` | Sí | No | Sí | No | No | No |
| Reprogramar o cancelar | PS-110 `mantenimiento.reprogramar` | Sí | No | Sí | No | No | No |
| Gestionar planes | PS-111 `mantenimiento.planes` | Sí | No | No | No | No | No |
| Ver costos (sensible) | PS-23 `precios.ver` | Sí | Sí | No | No | No | No |
| Confirmar un costo que supera el límite (sensible: 2F, A, No) | PS-231 `garantias.confirmar_costo` | Sí | Sí | No | No | No | No |
| Cambiar el estado del activo | PS-45 `activos.cambiar_estado` | Sí | No | Sí | No | No | No |
| Dar de baja el activo original | PS-47 `activos.dar_baja` | Sí | No | Sí | No | No | No |
| Ingreso manual del activo de reemplazo | PS-44 `activos.ingreso_manual` | Sí | No | Sí | No | No | No |
| Exportar listas | PS-20 `datos.exportar` | Sí | No | No | No | No | No |
| Activar o apagar el módulo | PS-09 `empresa.configurar_modulos` | Sí | No | No | No | No | No |

Reglas: todo permiso se comprueba en el servidor; GAR no salta los permisos del núcleo (RN-GAR-016); Jefatura TI ve y recibe avisos pero no opera, y el aviso de reparación prolongada le llega para que decida.

## 4. Requisitos

Columnas: **Cuándo** = `v1, Etapa 4` / `v1, Etapa 5` (GAR-A) o `Fase 2` (GAR-B). **CA** = criterio que lo cubre (sección 10).

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-GAR-001 | Al recibir mercadería con serie o importar, capturar la garantía del fabricante una sola vez para todo el lote: fecha de compra y meses, o fin directo (D-016.5, D-060.8). | v1, Etapa 5 | 01 |
| RF-GAR-002 | Mostrar en la ficha del activo si está en garantía, con texto y fecha ("En garantía hasta 15/03/2027"). | v1, Etapa 4 | 01 |
| RF-GAR-003 | Filtro de activos "garantía vence en los próximos N días" y "sin garantía vigente". | v1, Etapa 4 | 04 |
| RF-GAR-004 | Varias garantías por activo: tipo, garante (proveedor de PRV o marca), inicio, fin, cobertura, condiciones, número de garantía, contrato de PRV (opcional), patrón de costo (opcional). | Fase 2 | 04 |
| RF-GAR-005 | Calcular el fin desde inicio y meses cuando no se escribe (regla del núcleo, RN-GAR-003). | v1, Etapa 4 | 01, 15 |
| RF-GAR-006 | Corregir fechas de una garantía con motivo; una ampliación es una garantía nueva. | v1, Etapa 4 | 04 |
| RF-GAR-007 | Anular una garantía registrada por error, con motivo. | Fase 2 | 13 |
| RF-GAR-008 | Estado calculado de cada garantía (Vigente, Vencida) y garantía efectiva. | v1, Etapa 4 | 04, 15 |
| RF-GAR-009 | Abrir un reclamo desde la ficha del activo: garantía, falla, contacto del garante. | Fase 2 | 13 |
| RF-GAR-010 | Gestionar el reclamo: enviado al garante, número de caso, resultado (Reparado, Reemplazado, Rechazado). | Fase 2 | 09 |
| RF-GAR-011 | Reemplazo por garantía: baja del original e ingreso manual del nuevo, vinculados. | Fase 2 | 09, 10 |
| RF-GAR-012 | Planes de mantenimiento por SKU o categoría: tarea, frecuencia, días de aviso, ejecutor por defecto. | Fase 2 | 05 |
| RF-GAR-013 | Generar la programación de cada activo al activar el plan y al ingresar activos nuevos. | Fase 2 | 05 |
| RF-GAR-014 | Programar a mano un preventivo o registrar un correctivo (falla, prioridad, fecha). | Fase 2 | 03, 06 |
| RF-GAR-015 | Pasar un mantenimiento a "En ejecución" y cerrarlo como "Realizado" con fecha real y resultado. | Fase 2 | 05, 17 |
| RF-GAR-016 | Al realizar un preventivo, programar el siguiente. | Fase 2 | 05 |
| RF-GAR-017 | Reprogramar con motivo conservando las fechas anteriores. | Fase 2 | 05 |
| RF-GAR-018 | Cancelar con motivo. | Fase 2 | 11 |
| RF-GAR-019 | Elegir ejecutor: proveedor de servicio (PRV) o técnico interno (Persona); mostrar contratos vigentes y compromisos del proveedor. | Fase 2 | 02 |
| RF-GAR-020 | Crear una OS desde un mantenimiento o reclamo (precarga activo, proveedor y descripción) o vincular una existente. | Fase 2 | 08 |
| RF-GAR-021 | Indicar "cubierta por garantía" (Sí, No, Parcial) y qué garantía; GAR llena el campo de la OS. | Fase 2 | 08 |
| RF-GAR-022 | Al iniciar la ejecución, ofrecer pasar el activo a "En reparación" con el diálogo único "Cambiar estado". | Fase 2 | 06 |
| RF-GAR-023 | Al cerrar, ofrecer devolver el activo a "En stock" o "Asignado" con el mismo diálogo. | Fase 2 | 07 |
| RF-GAR-024 | Aportar a la pantalla única "Vencimientos" (lista y calendario, filtro por tipo) las fechas de garantía, de mantenimiento programado y de contratos de servicio; GAR no tiene calendario propio. | Fase 2 | 16 |
| RF-GAR-025 | Hoja de vida del activo en las pestañas "Servicio", "Garantía y contratos" y "Costos" de la ficha, con costo acumulado (con `precios.ver`). | Fase 2 | 12 |
| RF-GAR-026 | Tarjetas de Inicio: garantías por vencer, mantenimientos atrasados, activos en reparación y preventivos realizados a tiempo (%). Los reportes avanzados son de `reportes-tableros`. | Fase 2 | 16 |
| RF-GAR-027 | Botón opcional "Crear cambio estándar" desde un mantenimiento (precarga activo y fecha); GAR guarda solo el vínculo. | Fase 2 | 16 |
| RF-GAR-028 | Mostrar en un correctivo el contrato de PRV que cubre el activo, si existe. | Fase 2 | 02 |
| RF-GAR-029 | Parámetros por empresa: días de "reparación prolongada" y de reclamo sin novedad. Los umbrales de aviso se configuran en PAN-NOT-05. | Fase 2 | 16 |
| RF-GAR-031 | Confirmar el costo de una garantía extendida o de un mantenimiento sin OS cuando supera el límite (RN-GAR-041). | Fase 2 | 20 |
| RF-GAR-030 | Declarar en el registro de módulo: cancelar mantenimientos al dar de baja el activo (síncrono) y los mantenimientos de una Persona como pendientes (D-038.5, D-061.7). | Fase 2 | 11, 19 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-GAR-001 | Garantía, reclamo y mantenimiento aplican solo a activos con serie de naturaleza "equipo físico" (D-045). |
| RN-GAR-002 | El fin no es anterior al inicio. |
| RN-GAR-003 | Fin = (fecha de inicio menos 1 día) más los meses, ajustando al último día del mes (S-35, D-065). Ejemplos: 15/01/2026 + 24 meses = 14/01/2028; 15/03/2024 + 36 meses = 14/03/2027; 31/01 + 1 mes = 28/02 (29/02 si es bisiesto). Es la misma fórmula de RF-INV-008; el cálculo vive en el núcleo (D-060.8). |
| RN-GAR-004 | La garantía vale hasta el final del día de su fin, en la zona de la empresa; "hoy" sale de `hoyEnEmpresa()`. |
| RN-GAR-005 | El inicio de la garantía del fabricante es la fecha de compra del activo, salvo otra indicada con motivo. |
| RN-GAR-006 | Varias garantías pueden superponerse; la efectiva es la vigente con fin más lejano. |
| RN-GAR-007 | Las fechas se corrigen solo con motivo y queda el valor anterior; ampliar cobertura es crear otra garantía (D-019). |
| RN-GAR-008 | Una garantía no se borra: se anula con motivo; no se anula con un reclamo abierto. |
| RN-GAR-009 | No se registran garantías nuevas en activos De baja o Extraviado o robado; las existentes se conservan. |
| RN-GAR-010 | Un reclamo con garantía vencida exige nota y muestra advertencia. |
| RN-GAR-011 | Un reclamo cerrado no se reabre: se abre otro que referencia al anterior. |
| RN-GAR-012 | El resultado "Rechazado" exige el motivo del garante. |
| RN-GAR-013 | Con resultado Reparado, el activo vuelve a su estado previo por acción del usuario; GAR no lo cambia solo. |
| RN-GAR-014 | Con resultado Reemplazado, el original se da de baja con motivo "Reemplazo por garantía" y el nuevo entra por el ingreso manual del núcleo (D-060.7: permiso propio, serie única, motivo, costo opcional); una unidad física es un solo registro (D-009.3). |
| RN-GAR-015 | La garantía del reemplazo no se hereda sola: se sugiere el fin original y el usuario la confirma. |
| RN-GAR-016 | Quien no tenga PS-47 (`activos.dar_baja`) y PS-44 (`activos.ingreso_manual`) deja el reclamo en "Reemplazo pendiente de registrar". |
| RN-GAR-017 | Un plan es de un SKU o de una categoría, con frecuencia en días, semanas, meses o años. |
| RN-GAR-018 | Próximo preventivo = fecha real del último realizado del plan más la frecuencia; sin ninguno, fecha de ingreso del activo más la frecuencia. |
| RN-GAR-019 | Máximo un preventivo pendiente (Pendiente o En ejecución) por plan y activo; si se atrasa no se acumulan más. |
| RN-GAR-020 | Cambiar un plan afecta solo programaciones futuras; las pendientes no se recalculan. |
| RN-GAR-021 | Desactivar un plan cancela sus programaciones Pendientes generadas por el sistema, con motivo "Plan desactivado". |
| RN-GAR-022 | Al pasar el activo a De baja o Extraviado o robado, sus mantenimientos Pendientes y En ejecución se cancelan en la misma transacción (D-038.5); el aviso al ejecutor es asíncrono. |
| RN-GAR-023 | Un mantenimiento Realizado no se reabre; notas, costo y fecha real se corrigen con motivo; si falta trabajo, se programa otro. |
| RN-GAR-024 | La fecha real no es futura. |
| RN-GAR-025 | El ejecutor es un proveedor de servicio activo de la misma empresa o una Persona activa con vínculo a una membresía; no ambos. |
| RN-GAR-026 | Un mantenimiento se vincula a una sola OS; una OS cerrada no se reabre (D-027), se crea otra. |
| RN-GAR-027 | Con OS vinculada el costo vive en la OS (`fuente_costo`) y el mantenimiento solo lo muestra; sin OS, el costo usa el patrón común (importe sin impuesto, % impuesto, moneda, centro de costo, `fuente_costo` propia). Nunca en ambos (D-044). |
| RN-GAR-028 | Abrir o cerrar un mantenimiento o una OS no cambia el estado del activo (D-027); la confirmación de RF-GAR-022 y 023 es una acción del usuario, validada por D-012 y auditada. |
| RN-GAR-029 | La confirmación a "En reparación" solo se ofrece si el activo está En stock o Asignado. |
| RN-GAR-030 | Un activo Asignado en reparación conserva su asignación (D-060.4, S-29). |
| RN-GAR-031 | Cada importe lleva su moneda, una por registro, sin conversión; sin `precios.ver` las columnas se omiten en pantallas, exportaciones y correos. |
| RN-GAR-032 | Un costo cubierto por garantía (Sí) es 0 para la empresa; en Parcial solo lo que paga la empresa. |
| RN-GAR-033 | Un identificador de otra empresa (activo, garantía, mantenimiento, proveedor, Persona, OS) responde "no encontrado", también al escribir una referencia cruzada (D-021.5, D-039.7). |
| RN-GAR-034 | Los avisos van solo a membresías (Persona, membresía, correo, grupo); nunca a Personas sin Usuario ni a contactos de proveedor ni a la Persona asignada. |
| RN-GAR-035 | Las ventanas de cambio se consultan solo para sugerir fecha; no impiden programar. |
| RN-GAR-036 | "Vencida" y "Atrasado" se calculan al leer; el proceso diario solo emite avisos y genera programaciones (D-062.2). |
| RN-GAR-037 | Los procesos diarios (avisos, programaciones) son idempotentes y recuperables, corren empresa por empresa con la empresa fijada en la transacción, saltan empresas suspendidas y registran cada corrida (D-038.4). |
| RN-GAR-038 | Una decisión simultánea (cerrar, cancelar, resolver un reclamo) usa actualización condicional y `version`: gana una y la otra recibe "ya fue decidido". |
| RN-GAR-039 | Falla, notas y descripciones son texto libre: pasan por el validador común, la auditoría guarda "el campo cambió" sin el texto, y la pantalla avisa que no se escriban datos personales ni claves. Los motivos sí se guardan (D-030.6). |
| RN-GAR-041 | Acto de dinero de RN-017 (S-33): registrar una garantía extendida con costo, o un mantenimiento con costo sin OS, no pide aprobación; si el costo con impuesto, en moneda base, supera estrictamente el límite (o está en otra moneda), lo confirma otra persona con `garantias.confirmar_costo`, según la función única `requiereSegundaPersona`; sin orden de compra queda la marca "sin respaldo de compra". La excepción es la casilla «contratos y servicios recurrentes» del interruptor único (D-066: apagada, vence a los 90 días, uso auditado); GAR no tiene regla propia. PS-231 es sensible (2F, A, No, D-068). |
| RN-GAR-040 | La depreciación, el costo del activo y el libro de costos no son de este módulo; PRE toma el costo con `fuente_costo` (OS, orden de compra, propia). |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-GAR-001 | Con el volumen de referencia de RNF-010 del núcleo, la lista de mantenimientos y la pantalla "Vencimientos" de un mes responden en menos de 3 segundos en el 95 % de las consultas. |
| RNF-GAR-002 | Dos corridas del proceso diario del mismo día no duplican programaciones ni avisos. |
| RNF-GAR-003 | Los avisos salen a la hora única de la empresa (08:00 por defecto) con tolerancia de 1 hora. |
| RNF-GAR-004 | El 100 % de los cambios (garantías, reclamos, mantenimientos, planes, cambios de estado) queda en la auditoría en la misma operación (D-018). |
| RNF-GAR-005 | Cada tabla lleva empresa, clave foránea compuesta y prueba de aislamiento por identificador interno (D-039, D-063.6). |
| RNF-GAR-006 | Registrar un mantenimiento en celular de 360 px toma menos de 6 pasos desde la búsqueda del activo (D-021.1). |
| RNF-GAR-007 | Generar la programación inicial de un plan para 5 000 activos corre en el trabajador, con avance, y termina en menos de 60 segundos. |
| RNF-GAR-008 | Estados y etiquetas se muestran con texto, no solo con color. |

## 5. Estados y transiciones

**Garantía.** Se guarda solo "Anulada"; Vigente y Vencida se calculan (RN-GAR-036).

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Vigente | `garantias.registrar` o la recepción | Inicio y fin válidos. |
| Vigente | Vencida | Calculado | Pasó el día de fin. |
| Vigente o Vencida | Anulada | `garantias.anular` | Motivo; sin reclamo abierto. |

**Reclamo.**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Abierto | `garantias.gestionar_reclamos` | Activo con serie; nota si la garantía venció. |
| Abierto | En el garante | `garantias.gestionar_reclamos` | Fecha de envío. |
| En el garante | Resuelto (Reparado o Reemplazado) | `garantias.gestionar_reclamos` | RN-GAR-014 a 016. |
| En el garante | Rechazado | `garantias.gestionar_reclamos` | Motivo del garante. |
| Abierto o En el garante | Cancelado | `garantias.gestionar_reclamos` | Motivo. |

Resuelto, Rechazado y Cancelado son finales.

**Mantenimiento.**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Pendiente | `mantenimiento.programar` o sistema (plan) | Activo que no está De baja ni Extraviado. |
| Pendiente | En ejecución | `mantenimiento.ejecutar` | Con ejecutor. |
| En ejecución | Realizado | `mantenimiento.ejecutar` | Fecha real y resultado (Sin novedad, Con hallazgos, No se pudo realizar). |
| Pendiente | Pendiente (nueva fecha) | `mantenimiento.reprogramar` | Motivo. |
| Pendiente o En ejecución | Cancelado | `mantenimiento.reprogramar` o sistema | Motivo. |
| En ejecución | Pendiente | `mantenimiento.ejecutar` | Motivo (se suspendió). |

**Atrasado** es etiqueta calculada. Realizado y Cancelado son finales. **Plan:** Activo e Inactivo, por `mantenimiento.planes` (RN-GAR-021).

**Relación con el estado del activo (D-012).** Mantenimiento En ejecución con activo En stock o Asignado: se ofrece "Pasar a En reparación". Mantenimiento Realizado con activo En reparación: se ofrece "Devolver a En stock" o "a Asignado". Ambos con el diálogo único "Cambiar estado" y `activos.cambiar_estado`; nunca obligatorios; sin el permiso se ve el aviso sin el botón.

## 6. Datos

Todo registro lleva empresa; claves internas no consecutivas (D-019); autor = membresía, integración o sistema (D-041). Importes con moneda, sin impuesto.

| Entidad | Campos principales | Unicidad | Qué se audita |
|---|---|---|---|
| **Garantía** (`garantia`, desde la Etapa 4) | Activo, tipo, garante, inicio, meses, fin, cobertura, condiciones, número de garantía, contrato de PRV (opcional), patrón de costo y `fuente_costo` (opcional), motivo de anulación | Aviso si hay dos del mismo tipo y fechas | Altas, correcciones con antes y después, anulación. |
| **Reclamo** | Número `RCL-`, activo, garantía, apertura, falla, número de caso, envío, estado, resultado, motivo de rechazo, activo de reemplazo, reclamo anterior, OS, `version` | Número por empresa | Todo cambio; la falla sin texto. |
| **Plan** | Nombre, SKU o categoría, tarea, frecuencia (número y unidad), días de aviso, ejecutor por defecto, estado | Nombre por empresa | Todo cambio. |
| **Mantenimiento** | Número `MNT-`, activo, tipo, plan, prioridad (Crítica, Alta, Media, Baja), descripción, fecha prevista, fechas anteriores, fecha real, ejecutor (proveedor o Persona), OS, cubierta por garantía (Sí, No, Parcial), costo (sin OS), resultado, notas, estado, vínculo a cambio, `version` | Número por empresa; un preventivo pendiente por plan y activo | Todo cambio; texto libre sin valor. |
| **Parámetros** | Días de reparación prolongada (30), días de reclamo sin novedad (15) | Uno por empresa | Cambios. |

Los avisos usan la tabla única de Notificaciones; GAR no tiene tabla de avisos (D-062.3). **Campos personales propios: ninguno.** El texto libre (falla, notas) puede contenerlos y se trata según RN-GAR-039; la Persona asignada se lee del inventario con `datos_personales.ver`.

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-GAR-01 | Pestañas de la ficha del activo (Servicio, Garantía y contratos, Costos) | Garantías, reclamos y mantenimientos del activo. | Técnico |
| PAN-GAR-02 | Lista de garantías | Filtrar por vencer, vencidas, garante; exportar. | Jefatura TI |
| PAN-GAR-03 | Reclamo | Seguir el reclamo hasta su resultado. | Técnico |
| PAN-GAR-04 | Planes de mantenimiento | Crear y mantener planes. | Jefatura TI |
| PAN-GAR-05 | Lista de mantenimientos | Filtros por estado, tipo, atrasado, ejecutor. | Técnico |
| PAN-GAR-06 | Registro y ejecución de mantenimiento | Programar, ejecutar, cerrar; versión celular. | Técnico |
| PAN-GAR-07 | Parámetros del módulo | Umbrales propios de GAR. | Administrador |

Los mantenimientos del Técnico aparecen en su bandeja única "Mi trabajo" (pestaña Mantenimientos); los vencimientos, en la pantalla única "Vencimientos"; los avisos se configuran en PAN-NOT-05.

## 8. Notificaciones y automatismos

Reglas declaradas al motor único de Notificaciones (RF-NOT-024); NOT envía, agrupa en el resumen diario y no repite. Destinatarios: solo membresías (RN-GAR-034). Contenido mínimo, sin importes (D-061.4).

| Evento | Cuándo | A quién | Qué dice |
|---|---|---|---|
| `garantias.costo_pendiente_confirmacion` | Al registrar un costo sobre el límite | Quienes tienen `garantias.confirmar_costo`, excepto quien lo registró | "Hay un costo de garantía o mantenimiento pendiente de confirmación." |
| `vencimiento.umbral_alcanzado` (garantía) | A los umbrales por defecto de NOT: 90, 60, 30, 15 y 7 días antes del fin | Quienes tienen `garantias.recibir_avisos` | "La garantía del activo [código del activo] vence el 15/03/2027 (faltan 30 días). Revise si necesita un reclamo o una extensión." |
| `garantias.garantia_vencida` | Un día después del fin | Igual | "La garantía del activo [código del activo] venció el 15/03/2027." |
| `vencimiento.umbral_alcanzado` (mantenimiento) | Los días de aviso del plan y el mismo día (se aparta del umbral general porque es una tarea y no un vencimiento) | Ejecutor y quienes tienen `garantias.recibir_avisos` | "MNT-000045 está programado para el 20/11/2026." |
| `mantenimiento.mantenimiento_atrasado` | Un día después de la fecha y luego cada lunes | Ejecutor y Jefatura TI | "MNT-000045 está atrasado 9 días." |
| `mantenimiento.activo_reparacion_prolongada` | Con más de 30 días En reparación y cada 30 días | Jefatura TI | "El activo [código del activo] lleva 34 días En reparación." |
| `garantias.reclamo_sin_novedad` | 15 días sin cambios en un reclamo En el garante | Quien lo abrió | "El reclamo RCL-000007 no tiene novedades hace 15 días." |
| `mantenimiento.mantenimiento_asignado` | Al asignar | Ejecutor | "Se le asignó MNT-000045." |
| `mantenimiento.mantenimiento_cancelado` | Al cancelar el sistema | Ejecutor | "MNT-000045 se canceló: activo dado de baja." |

Los correos nunca llevan la serie: usan el código del activo, el código del documento (MNT-, RCL-), la fecha y el nombre de la empresa (D-075, H-SEG-32 g); la serie se ve dentro de la plataforma. Los avisos de GAR-B no entran a la v1 (D-023, D-061.4). Un proveedor de servicio no recibe correo de la plataforma.

## 9. Integración con el núcleo y con otros módulos

| Con | Cómo |
|---|---|
| Recepción, importación y activos (Etapas 4 y 5) | La recepción y la plantilla de importación capturan fecha de compra y meses o fin (D-016.5, D-044.9); se crea la fila `garantia`. La baja del activo cancela los mantenimientos en la misma transacción. |
| Estados del activo (D-012, D-060.4) | Solo con el diálogo único y confirmación del usuario. El responsable se conserva en reparación. |
| Órdenes de servicio (Etapa 6, D-027, D-044.10) | Acordado con escuadrón C: GAR es dueño de garantía, reclamo y mantenimiento; la OS es la orden de trabajo con costo real, moneda, proveedor, centro de costo, "cubierta por garantía" y vínculo 1 a 1 con mantenimiento. La mesa de ayuda crea la OS "Creada", muestra la garantía en solo lectura y no la edita. |
| `proveedores-contratos` (PRV) | Garante y ejecutor externo son proveedores de PRV; garantía y mantenimiento pueden referir un contrato. PRV-B va antes que GAR-B. |
| `gestion-cambios` (E) | Acordado: botón opcional "Crear cambio estándar"; las ventanas se consultan solo para sugerir. |
| `presupuesto-costos` (F) | PRE toma el costo por `fuente_costo` (OS, orden de compra, propia) solo de equipo físico; GAR no necesita más campos. Acordado con F: las fechas se aportan a "Vencimientos". |
| `reportes-tableros` (F) | Las tarjetas de GAR son indicadores definidos una vez como filtro reutilizable (D-062.5). |
| `cmdb-ligera` (E) | La CMDB lee garantía y mantenimiento de su origen. |
| `notificaciones` (C) | Envío, agrupación y no repetición. |
| `licencias-software`, `lineas-moviles`, `dominios-certificados` (B) | Fuera: el soporte contratado se registra en PRV. |
| Registro de módulo (D-038.6) | GAR declara permisos, eventos, reglas de aviso y pendientes de la persona. |

## 10. Criterios de aceptación

| ID | Requisito | Criterio |
|---|---|---|
| CA-GAR-01 | RF-GAR-001, 002, 005 | **Dado** una recepción de 10 laptops con serie y garantía de 36 meses desde la compra el 15/03/2024, **cuando** se confirma, **entonces** cada activo muestra "En garantía hasta 14/03/2027". |
| CA-GAR-02 | RF-GAR-019, 028, RN-GAR-033 | **Dado** un activo de la empresa A, **cuando** un usuario de la empresa B consulta su garantía o hoja de vida por identificador interno, o crea un mantenimiento con ese activo, **entonces** recibe "no encontrado" y no se escribe nada. |
| CA-GAR-03 | RF-GAR-014 | **Dado** un usuario Solo lectura sin `mantenimiento.programar`, **cuando** intenta programar (por pantalla o directo al servidor), **entonces** se rechaza y queda en los eventos de seguridad. |
| CA-GAR-04 | RF-GAR-003, 004, 006, 008 | **Dado** una garantía del fabricante hasta 15/03/2027 y una extendida hasta 15/03/2028, **cuando** se consulta el 01/02/2027, **entonces** ambas están Vigentes y la efectiva es la extendida; con el reloj al 16/03/2027 la del fabricante figura Vencida sin proceso alguno. |
| CA-GAR-05 | RF-GAR-012, 013, 015, 016, 017, RN-GAR-019 | **Dado** un plan "limpieza cada 6 meses" para el SKU LAP-0001, **cuando** el técnico cierra el preventivo el 10/05/2027, **entonces** el siguiente se programa para el 10/11/2027 y solo hay un pendiente por activo. |
| CA-GAR-06 | RF-GAR-014, 022, RN-GAR-028 | **Dado** un correctivo de un activo Asignado, **cuando** el técnico lo pasa a En ejecución, **entonces** se ofrece pasar el activo a En reparación; si no confirma, el activo no cambia. |
| CA-GAR-07 | RF-GAR-023, RN-GAR-030 | **Dado** un activo En reparación con mantenimiento Realizado, **cuando** el técnico confirma "Devolver a Asignado", **entonces** vuelve a Asignado a la misma Persona y la acción queda en la auditoría. |
| CA-GAR-08 | RF-GAR-020, 021, RN-GAR-027 | **Dado** un mantenimiento vinculado a una OS con costo USD 120, **cuando** se intenta registrar costo también en el mantenimiento, **entonces** se rechaza con "El costo está en la OS". |
| CA-GAR-09 | RF-GAR-010, 011, RN-GAR-014 | **Dado** un reclamo En el garante, **cuando** se marca Reemplazado con una serie nueva, **entonces** el original pasa a De baja con motivo "Reemplazo por garantía", el nuevo ingresa por el ingreso manual y ambos quedan vinculados. |
| CA-GAR-10 | RF-GAR-011, RN-GAR-016 | **Dado** un técnico sin permiso de baja, **cuando** intenta completar un reemplazo, **entonces** el reclamo queda en "Reemplazo pendiente de registrar" y el activo no cambia. |
| CA-GAR-11 | RF-GAR-018, 030, RN-GAR-022 | **Dado** un activo con mantenimientos Pendientes, **cuando** se da de baja, **entonces** se cancelan en la misma transacción con motivo "Activo dado de baja"; si la baja falla, ninguno se cancela. |
| CA-GAR-12 | RF-GAR-025, RN-GAR-031 | **Dado** un usuario sin `precios.ver`, **cuando** abre la hoja de vida o exporta, **entonces** las columnas de costo no existen. |
| CA-GAR-13 | RF-GAR-007, 009, RN-GAR-010 | **Dado** un reclamo sobre una garantía vencida, **cuando** se abre sin nota, **entonces** se rechaza; con nota, se acepta con la advertencia; y anular esa garantía con el reclamo abierto se rechaza. |
| CA-GAR-14 | RN-GAR-037, 034 | **Dado** dos empresas con una garantía que vence en 30 días cada una, **cuando** corre el proceso diario con el reloj fijado y un disparador manual, **entonces** cada aviso y destinatario queda en su empresa, sin envío a Personas sin Usuario, y una segunda corrida no duplica nada. |
| CA-GAR-15 | RF-GAR-005, 008, RN-GAR-003 | **Dado** una garantía de 1 mes desde el 31/01 y otra de 12 meses desde el 29/02/2028, **cuando** se calcula, **entonces** vencen el 28/02 (o 29/02 si es bisiesto) y el 28/02/2029. |
| CA-GAR-16 | RF-GAR-024, 026, 027, 029 | **Dado** un mantenimiento programado y una garantía por vencer, **cuando** se abre "Vencimientos" con filtro por tipo, **entonces** aparecen ambos y, desde el mantenimiento, se ofrece "Crear cambio estándar". |
| CA-GAR-17 | RF-GAR-015, RN-GAR-038 | **Dado** un mantenimiento En ejecución, **cuando** dos técnicos lo cierran a la vez, **entonces** una operación gana y la otra recibe "ya fue decidido". |
| CA-GAR-18 | RN-GAR-039 | **Dado** una falla con un nombre canario, **cuando** se edita, **entonces** la auditoría dice "el campo cambió" sin el texto; y un texto con bloque de clave privada se rechaza. |
| CA-GAR-20 | RF-GAR-031, RN-GAR-041 | **Dado** el límite 50 000 USD y una garantía extendida registrada por Ana, **cuando** el costo con impuesto es 50 000,00, **entonces** no exige confirmación; **cuando** es 50 000,01 (o está en otra moneda), **entonces** Ana no puede confirmarlo, otra persona con `garantias.confirmar_costo` sí, y sin orden de compra queda "sin respaldo de compra". |
| CA-GAR-19 | RF-GAR-030, RN-GAR-025 | **Dado** el cese de la Persona ejecutora, **cuando** se cesa, **entonces** el cese no se bloquea y sus mantenimientos aparecen como pendientes de la persona. |

## 11. Casos límite

1. Activo sin fecha de compra (importado): la garantía necesita inicio escrito; sin él se muestra "Sin fecha de garantía".
2. Dos recepciones simultáneas del mismo activo: no hay duplicados porque la recepción es todo o nada (D-016.4).
3. Reingreso de un activo dado de baja (D-009.3): sus garantías anteriores se muestran, las vencidas siguen así y no se crean mantenimientos viejos.
4. Un preventivo atrasado 18 meses: sigue un solo pendiente con etiqueta "Atrasado".
5. Cambio de frecuencia del plan con programaciones pendientes: conservan su fecha.
6. El técnico ejecutor cesa: el mantenimiento queda "Sin ejecutor" y se avisa a Jefatura TI.
7. Proveedor de servicio desactivado con mantenimientos Pendientes: se avisa y se elige otro ejecutor antes de ejecutar.
8. Reemplazo con una serie que existe en otro SKU: se acepta con aviso (D-009.2).
9. OS cancelada que estaba vinculada: el mantenimiento queda sin OS y Pendiente.
10. Activo En reparación al que llega la baja: permitido por D-012; los mantenimientos se cancelan.
11. Garantía con costo vacío: válido.
12. Cambio de zona horaria de la empresa: los avisos pendientes se recalculan (D-060.9).
13. El proceso diario no corrió un día: al arrancar procesa los pendientes en orden (D-038.4).

## 12. Decisiones propuestas y supuestos

| ID | Resultado | Propuesta y motivo |
|---|---|---|
| S-GAR-01 | Confirmado (D-056) | Dos partes: GAR-A (v1, Etapas 4 y 5) y GAR-B (Fase 2, ola B). |
| S-GAR-02 | **Retirado** | Ya no hay migración de A a B: la tabla `garantia` existe desde la Etapa 4 (D-060.8, H-DAT-20). |
| S-GAR-03 | Confirmado (D-045) | Solo activos con serie de naturaleza "equipo físico"; stock por cantidad fuera. |
| S-GAR-04 | Confirmado (D-044.10) | Mantenimiento = registro del activo; OS = orden de trabajo 1 a 1; el costo vive en la OS. |
| S-GAR-05 | Convertido en decisión (D-060.4, S-29) | El activo Asignado en reparación conserva su asignación. |
| S-GAR-06 | Confirmado | La confirmación a "En reparación" es una ayuda en pantalla con el diálogo único; no un cambio automático (D-027). |
| S-GAR-07 | Aceptado | El próximo preventivo se cuenta desde la realización real. |
| S-GAR-08 | Aceptado | Un solo preventivo pendiente por plan y activo. |
| S-GAR-09 | Aceptado | Los proveedores de servicio no reciben correos. |
| S-GAR-10 | Confirmado (D-053, S-31) | Los reportes de falla entran por "Pedir ayuda" (OS "Creada" en la v1, caso en Fase 2); GAR no tiene pantalla para Solicitante. |
| S-GAR-12 | **[SUPUESTO]** | "Código del activo" en los correos es el identificador visible del activo en la plataforma (no la serie); el Analista del núcleo define su formato y, si no existe, se usa el código del SKU más la referencia interna del activo. |
| S-GAR-11 | Aceptado | El tiempo real frente al compromiso del proveedor se muestra en horas corridas y solo como dato. |
| E-GAR | Ninguno por ahora | Seguros, pólizas o archivos de garantía activarían D-022 (costo de almacenamiento) y una opinión legal. |

## 13. Fuera de alcance

1. Garantía y mantenimiento de stock por cantidad, licencias, líneas y dominios. 2. Archivos adjuntos: facturas, fotos, informes (D-022). 3. Mantenimiento por uso o sensores. 4. Inventario de repuestos. 5. Seguros y siniestros. 6. Depreciación y libro de costos (de `presupuesto-costos`). 7. Gestión de cambios y ventanas (de `gestion-cambios`). 8. Reportes avanzados (de `reportes-tableros`). 9. Avisos a la Persona asignada y portal para pedir mantenimiento (de `portal-autoservicio`). 10. Devolución al proveedor de mercadería dañada (D-016.1). 11. Calendario propio y exportación a aplicaciones externas.

## 14. Historial de cambios (v0.1 a v0.2)

| Cambio | Decisión o hallazgo |
|---|---|
| Partido en GAR-A (Etapas 4 y 5) y GAR-B (Fase 2, ola B); columna "Cuándo" y CA por requisito | D-056, H-AUD-08, H-AUD-21, plan fila GAR |
| Tabla `garantia` desde la Etapa 4 con compra más meses o fin directo; retirada la migración (S-GAR-02) | D-060.8, H-DAT-20, H-AUD-A27, H-QA-11 |
| Solo naturaleza "equipo físico" | D-045, H-ARQ-06 |
| Costo en la OS con `fuente_costo` y patrón común; OS con campos de D-044.10 | D-044, H-ARQ-08, H-DAT-07 |
| "Vencida" y "Atrasado" calculados; retirada la tabla "Alerta enviada"; avisos por NOT con umbrales 90/60/30/15/7 | D-062.2, D-062.3, H-DAT-17, H-QA-12 |
| Calendario propio sustituido por la pantalla única "Vencimientos"; hoja de vida en pestañas de la ficha | D-053, H-UX-11, H-UX-13, H-AUD-19 |
| Reclamos con prefijo `RCL-`; mantenimiento `MNT-`; números de 6 dígitos | D-049.2, H-UX-16, H-DAT-10 |
| Asignación conservada en reparación convertida en decisión | D-060.4, S-29 (D-057), H-QA-03, H-DAT-04 |
| Confirmación de estado con el diálogo único "Cambiar estado" | D-053, H-UX-14 |
| Reemplazo por garantía usa el ingreso manual del núcleo | D-060.7, H-AUD-15 |
| Cancelación de mantenimientos al dar de baja en la misma transacción | D-038.5, H-ARQ-11, H-DAT-09 |
| Ejecutor y pendientes como Persona con vínculo opcional | D-044.5, D-041, D-061.7 |
| v0.3: RN-GAR-003 con la fórmula exacta de S-35; RN-GAR-041 con la casilla «contratos y servicios recurrentes» y PS-231 sensible; PS-231 citado como definitivo; PS-106 confirmado; correos con el código del activo en lugar de la serie (S-GAR-12) | D-065, D-066, D-068, D-074, D-075 (H-SEG-32 g), plan-aplicacion |
| Acto de dinero S-33 (garantía extendida y mantenimiento sin OS sobre el límite): RF-GAR-031, RN-GAR-041, permiso `garantias.confirmar_costo` solicitado, evento y CA-GAR-20 | S-33 del núcleo, RN-017, D-043.4, H-CUM-03 |
| Dos citas viejas de pantalla `NOT-05` pasan a `PAN-NOT-05`; las pantallas propias ya eran `PAN-GAR-nn` | D-049.4, N-AUD-01 (ronda 3) |
| Eventos renombrados al catálogo de NOT (`vencimiento.umbral_alcanzado`, `mantenimiento.activo_reparacion_prolongada`) | D-038.5, D-049, notificaciones.md |
| Permisos migrados a los PS-nn del registro (PS-102 a PS-111, PS-23, PS-44, PS-45, PS-47, PS-20, PS-09); `mantenimiento.planes` y `garantias.recibir_avisos` con el nombre del registro; Almacén y Jefatura TI según sus valores por defecto; `datos.exportar` único; columna "Empleado (portal): no aplica" | D-036, D-037, H-AUD-05, H-SEG-07, registro de permisos |
| Volumen de referencia citado de RNF-010; RNF-GAR-007 definido | S-19 (D-057), H-AUD-24, H-QA-22 |
| Texto libre sin valor en la auditoría y con validador común | D-030.6, D-063.2, H-CUM-01, H-SEG-23 |
| Reglas de proceso diario y concurrencia; CA-GAR-14 a 19 (dos empresas, reloj fijable, referencia cruzada, bisiesto, concurrencia) | D-038.4, D-039.6, D-063.6, H-SEG-02, H-QA-12, H-ARQ-17, QA fila GAR |
| Correos con contenido mínimo; avisos solo a membresías | D-061.4, H-CUM-06 |
| Supuestos resueltos | D-057, D-058 |
| Pantallas `PAN-GAR-nn`; tarjetas de Inicio en lugar de panel propio | D-049.4, H-UX-05 |

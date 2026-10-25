# Módulo: Garantías y mantenimiento (GAR)

**Slug:** `garantias-mantenimiento` · **Sigla:** GAR · **Versión:** 0.1 (borrador del analista funcional, Oleada B)
**Base:** `docs/equipo/decisiones.md` (D-001 a D-029, vinculantes) y `docs/documento-funcional.md` v0.1.
**Marcas:** **[SUPUESTO]** = propuesta del analista que el Gerente de TI confirma. **[ESCALAR AL CEO]** = implica dinero, tema legal o algo irreversible.

---

## 1. Propósito, alcance y fase

**Propósito.** Que el área de TI sepa qué equipos siguen en garantía, cuáles están por vencer, qué mantenimiento se les debe hacer y cuándo, qué se les hizo antes y cuánto costó, y que no se pague una reparación que la garantía cubría.

**Fases (propuesta).** Los avisos automáticos de vencimiento de garantía y el mantenimiento preventivo están fuera de la v1 (D-023 y documento v0.1, sección 2). Se parte en dos:

| Parte | Qué contiene | Cuándo |
|---|---|---|
| **Fase A** | Garantía del fabricante como dato del activo: se captura en la recepción (D-016.5) o a mano, se ve en la ficha y se filtra "por vencer" en pantalla. | Etapas 4 y 5 |
| **Fase B** | Varias garantías por activo, reclamos, planes de mantenimiento preventivo, mantenimiento correctivo, calendario, alertas, indicadores. | Después de la v1 (propuesta: tras la Etapa 7 y con la Etapa 6 ya entregada) |

Al activar la Fase B, la fecha de fin de garantía de la Fase A se convierte en una garantía "del fabricante" por activo (migración de datos, ver sección 12).

**Entra en este módulo**
1. Garantías por activo con serie (fabricante, extendida o de proveedor).
2. Reclamos de garantía, incluido el reemplazo de una unidad.
3. Planes de mantenimiento preventivo por SKU o categoría.
4. Mantenimiento preventivo y correctivo por activo, con historial ("hoja de vida").
5. Calendario de mantenimientos y vencimientos de garantía.
6. Proveedor de servicio (de PRV) o técnico interno.
7. Relación con las órdenes de servicio y con el estado "En reparación".
8. Alertas e indicadores simples.

**No entra:** ver sección 13.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Garantía** | Cobertura que da un fabricante o proveedor sobre un activo por un periodo (reparación o reemplazo sin costo). |
| **Garantía del fabricante** | La que viene con el equipo; empieza en la fecha de compra. |
| **Garantía extendida** | Cobertura adicional comprada aparte. |
| **Garantía efectiva** | De las garantías vigentes de un activo, la que termina más tarde. |
| **Reclamo** | Pedido formal al garante para que repare o reemplace un activo. |
| **Mantenimiento preventivo** | Trabajo planificado para evitar fallas (limpieza, actualización, revisión de batería). |
| **Mantenimiento correctivo** | Trabajo para reparar una falla que ya ocurrió. |
| **Plan de mantenimiento** | Regla que dice "a este tipo de equipo se le hace esta tarea cada tanto tiempo". |
| **Programación** | Mantenimiento concreto de un activo con fecha prevista. |
| **Atrasado** | Etiqueta calculada: la fecha prevista pasó y el mantenimiento no se realizó. |
| **Hoja de vida** | Historial de garantías, reclamos y mantenimientos de un activo. |
| **Proveedor de servicio** | Proveedor de PRV con "presta servicios" activado. |
| **Orden de servicio (OS)** | Documento de trabajo del núcleo (Etapa 6). El mantenimiento es el registro del activo; la OS es la orden de trabajo. |
| **En reparación** | Estado del activo definido por D-012. |

## 3. Roles y permisos

Roles = plantillas de D-004. "Todo" es el alcance completo; "Propio" son los mantenimientos asignados al usuario como técnico. Los costos se ven solo con `precios.ver` (núcleo, sensible).

| Acción | Permiso | Admin. | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver garantías y reclamos | `garantias.ver` | Todo | Todo | Todo | Todo | No | Todo |
| Registrar y corregir garantías | `garantias.registrar` | Sí | Sí | Sí | No | No | No |
| Anular garantía registrada por error | `garantias.anular` | Sí | Sí | No | No | No | No |
| Abrir y gestionar reclamos | `reclamos.gestionar` | Sí | Sí | Sí | No | No | No |
| Ver mantenimientos y calendario | `mantenimiento.ver` | Todo | Todo | Todo | No | No | Todo |
| Programar mantenimiento (preventivo o correctivo) | `mantenimiento.programar` | Sí | Sí | Sí | No | No | No |
| Ejecutar y cerrar mantenimiento | `mantenimiento.ejecutar` | Sí | No | Propio | No | No | No |
| Reprogramar o cancelar | `mantenimiento.reprogramar` | Sí | Sí | Sí | No | No | No |
| Gestionar planes de mantenimiento | `mantenimiento.planes` | Sí | Sí | No | No | No | No |
| Ver costos y valores | `precios.ver` | Sí | Sí | No | No | No | No |
| Recibir alertas | `gar.recibir_alertas` | Todo | Todo | Propio | No | No | No |
| Cambiar el estado del activo a "En reparación" | `activos.cambiar_estado` (núcleo) | Sí | No | Sí | No | No | No |
| Dar de baja y crear el activo de reemplazo | permisos de baja e ingreso del núcleo | Sí | No | Según rol | No | No | No |
| Exportar listas | `exportar` (núcleo) | Sí | No | No | No | No | No |

Notas
- El alcance de Técnico para ejecutar es "Propio" por defecto; el Administrador puede ampliarlo a "Todo".
- GAR no salta los permisos del núcleo: un reemplazo por garantía exige además los permisos de baja e ingreso (RN-GAR-016).
- Todo permiso se comprueba en el servidor (CLAUDE.md, regla 6).

## 4. Requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Fase |
|---|---|---|
| RF-GAR-001 | Capturar al recibir mercadería con serie la garantía del fabricante: meses de garantía, o fecha de fin, una sola vez para toda la recepción (D-016.5). | A |
| RF-GAR-002 | Mostrar en la ficha del activo si está en garantía, con texto y fecha ("En garantía hasta 15/03/2027"). | A |
| RF-GAR-003 | Filtro en la lista de activos "garantía vence en los próximos N días" y "sin garantía vigente". | A |
| RF-GAR-004 | Registrar varias garantías por activo: tipo (Fabricante, Extendida, Proveedor), garante, inicio, fin, cobertura, condiciones, número de garantía o póliza, contrato de PRV relacionado (opcional), costo y moneda (opcionales). | B |
| RF-GAR-005 | Calcular la fecha de fin a partir del inicio y los meses cuando no se escribe. | B |
| RF-GAR-006 | Corregir fechas de una garantía con motivo; una ampliación se registra como garantía nueva. | B |
| RF-GAR-007 | Anular una garantía registrada por error, con motivo. | B |
| RF-GAR-008 | Mostrar el estado calculado de cada garantía (Vigente, Vencida, Anulada) y la garantía efectiva del activo. | B |
| RF-GAR-009 | Abrir un reclamo de garantía desde la ficha del activo: garantía, fecha, descripción de la falla, contacto del garante. | B |
| RF-GAR-010 | Gestionar el reclamo: enviado al proveedor, respuesta, resultado (Reparado, Reemplazado, Rechazado), número de caso del garante. | B |
| RF-GAR-011 | Reemplazo por garantía: vincular el activo original con el nuevo (dado de baja y ingresado por el núcleo). | B |
| RF-GAR-012 | Crear planes de mantenimiento preventivo por SKU o por categoría: nombre, tarea, frecuencia, anticipación de aviso, ejecutor por defecto. | B |
| RF-GAR-013 | Generar la programación de cada activo según el plan, al activar el plan y al ingresar activos nuevos. | B |
| RF-GAR-014 | Programar a mano un mantenimiento preventivo o registrar uno correctivo (falla, prioridad, fecha). | B |
| RF-GAR-015 | Pasar un mantenimiento a "En ejecución" y cerrarlo como "Realizado" con fecha real, resultado y notas. | B |
| RF-GAR-016 | Al realizar un preventivo, programar el siguiente automáticamente. | B |
| RF-GAR-017 | Reprogramar un mantenimiento con motivo, conservando las fechas anteriores. | B |
| RF-GAR-018 | Cancelar un mantenimiento con motivo. | B |
| RF-GAR-019 | Elegir ejecutor: proveedor de servicio (PRV) o técnico interno (Usuario). Al elegir proveedor, mostrar sus contratos vigentes y SLA (informativo). | B |
| RF-GAR-020 | Crear una OS desde un mantenimiento (precarga activo, proveedor y descripción) o vincular una OS existente. | B |
| RF-GAR-021 | Indicar en la OS o mantenimiento si lo cubre la garantía (Sí, No, Parcial) y qué garantía. | B |
| RF-GAR-022 | Ofrecer, al iniciar la ejecución, una confirmación para cambiar el activo a "En reparación". | B |
| RF-GAR-023 | Ofrecer, al cerrar, una confirmación para devolver el activo a "En stock" o "Asignado" si sigue En reparación. | B |
| RF-GAR-024 | Calendario mensual, semanal y en lista con mantenimientos, garantías que vencen y contratos de servicio que vencen (leídos de PRV). Filtros: tipo, ubicación, categoría, proveedor, ejecutor. | B |
| RF-GAR-025 | Hoja de vida del activo con todo su historial y el costo acumulado (con `precios.ver`). | B |
| RF-GAR-026 | Panel de indicadores: garantías por vencer, mantenimientos atrasados, activos en reparación, preventivos realizados a tiempo en porcentaje. | B |
| RF-GAR-027 | Botón opcional "Crear cambio estándar" desde un mantenimiento (precarga activo y fecha); GAR guarda solo el vínculo. Consulta de ventanas de cambio para sugerir fecha. | B |
| RF-GAR-028 | Mostrar en un mantenimiento correctivo el contrato de PRV que cubre el activo, si existe. | B |
| RF-GAR-029 | Configurar por empresa los días de alerta, el umbral de "reparación prolongada" y la hora de envío. | B |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-GAR-001 | Garantía, reclamo y mantenimiento aplican solo a activos con serie. |
| RN-GAR-002 | La fecha de fin no puede ser anterior a la de inicio. |
| RN-GAR-003 | Si se calcula el fin con meses, se suma al inicio ese número de meses y se resta un día; si el día no existe en el mes final, se usa el último día de ese mes. |
| RN-GAR-004 | La garantía vale hasta el final del día de su fecha de fin, en la zona horaria de la empresa (D-021.4). |
| RN-GAR-005 | El inicio de la garantía del fabricante es la fecha de compra del activo (D-016.5), salvo que se indique otra con motivo. |
| RN-GAR-006 | Un activo puede tener varias garantías que se superponen; la garantía efectiva es la vigente con fin más lejano. |
| RN-GAR-007 | Las fechas de una garantía solo se corrigen con motivo y queda el valor anterior; para ampliar cobertura se crea otra garantía (D-019). |
| RN-GAR-008 | Una garantía no se borra: se anula con motivo. |
| RN-GAR-009 | No se registran garantías nuevas en activos De baja o Extraviado o robado; las existentes se conservan para consulta. |
| RN-GAR-010 | Un reclamo se puede abrir con la garantía vencida, con una advertencia visible y nota obligatoria (a veces el garante acepta por buena voluntad). |
| RN-GAR-011 | Un reclamo cerrado (Resuelto, Rechazado o Cancelado) no se reabre; se abre uno nuevo que referencia al anterior. |
| RN-GAR-012 | El resultado "Rechazado" exige registrar el motivo que dio el garante. |
| RN-GAR-013 | Si el resultado es Reparado, el activo vuelve al estado previo por acción del usuario (RF-GAR-023); GAR no lo cambia solo. |
| RN-GAR-014 | Si el resultado es Reemplazado, el activo original se da de baja con motivo "Reemplazo por garantía" y el nuevo ingresa con su propia serie, vinculado al original (una unidad física es un solo registro, D-009.3). |
| RN-GAR-015 | La garantía de la unidad de reemplazo no se hereda sola: se sugiere el fin de la garantía original y el usuario la confirma. |
| RN-GAR-016 | El reemplazo exige los permisos de baja e ingreso del núcleo; quien no los tiene solo puede dejar el reclamo en "Reemplazo pendiente de registrar". |
| RN-GAR-017 | Un plan se define para un SKU o una categoría (no ambos) y tiene frecuencia en días, semanas, meses o años (una sola unidad). |
| RN-GAR-018 | La próxima fecha del preventivo = fecha real del último preventivo del plan realizado + frecuencia; si no hay ninguno, = fecha de ingreso del activo + frecuencia. |
| RN-GAR-019 | Hay como máximo un preventivo pendiente (Pendiente o En ejecución) por plan y activo; si se atrasa, no se acumulan más. |
| RN-GAR-020 | Cambiar un plan afecta solo a las programaciones que se generen después; las pendientes no se recalculan. |
| RN-GAR-021 | Desactivar un plan cancela sus programaciones Pendientes generadas por el sistema, con motivo "Plan desactivado". |
| RN-GAR-022 | No se programan mantenimientos en activos De baja o Extraviado o robado. Si el activo pasa a esos estados, sus mantenimientos Pendientes se cancelan con motivo "Activo dado de baja" o "Activo extraviado" y los En ejecución se cancelan igual, avisando al ejecutor. |
| RN-GAR-023 | Un mantenimiento Realizado no se reabre. Notas, costo y fecha real se corrigen con motivo; si falta trabajo, se programa otro. |
| RN-GAR-024 | La fecha real de realización no puede ser futura. |
| RN-GAR-025 | El ejecutor es un proveedor de servicio activo de la misma empresa o un Usuario activo con rol de Técnico; no ambos. |
| RN-GAR-026 | Un mantenimiento se vincula a una sola OS a la vez; una OS cerrada no se reabre (D-027), se crea otra. |
| RN-GAR-027 | Con OS vinculada, el costo vive en la OS y el mantenimiento solo lo muestra. Sin OS, el costo (importe sin impuesto y moneda) se registra en el mantenimiento. Nunca en ambos. |
| RN-GAR-028 | Abrir o cerrar un mantenimiento o una OS no cambia el estado del activo por sí solo (D-027); la confirmación de RF-GAR-022 y RF-GAR-023 es una acción del usuario, validada por las transiciones de D-012, y queda en la auditoría. |
| RN-GAR-029 | La confirmación a "En reparación" solo se ofrece si el activo está En stock o Asignado. |
| RN-GAR-030 | Un activo Asignado que pasa a En reparación conserva su asignación y su historial. **[SUPUESTO]** El núcleo lo confirma (S-GAR-05). |
| RN-GAR-031 | Cada importe lleva su moneda; una moneda por registro, sin conversión (D-014). Los importes no aparecen sin `precios.ver`. |
| RN-GAR-032 | Un costo cubierto por garantía (Sí) se registra como 0 para la empresa; en Parcial se registra solo lo que paga la empresa. |
| RN-GAR-033 | Un identificador de otra empresa (activo, garantía, mantenimiento, proveedor) responde "no encontrado" (D-021.5). |
| RN-GAR-034 | La persona asignada al activo no recibe avisos en esta fase; el técnico coordina con ella. |
| RN-GAR-035 | Las ventanas de cambio se consultan solo para sugerir; no impiden programar. |

### 4.3 Requisitos de calidad

| ID | Requisito medible |
|---|---|
| RNF-GAR-001 | Con 200 000 activos y 50 000 mantenimientos por empresa, el calendario de un mes se muestra en menos de 3 segundos en el 95 % de las consultas. |
| RNF-GAR-002 | El proceso diario (estados calculados, generación de programaciones y alertas) es repetible: correrlo dos veces el mismo día no duplica programaciones ni avisos. |
| RNF-GAR-003 | Las alertas salen dentro de 1 hora de la hora configurada (por defecto 08:00 local). |
| RNF-GAR-004 | El 100 % de los cambios (garantías, reclamos, mantenimientos, planes, cambios de estado) quedan en la auditoría en la misma operación (D-018). |
| RNF-GAR-005 | Toda tabla del módulo lleva empresa y su prueba de aislamiento (D-025). |
| RNF-GAR-006 | Registrar un mantenimiento en tablet o celular toma menos de 6 pasos desde la búsqueda del activo (D-021.1). |
| RNF-GAR-008 | Los estados y etiquetas se muestran con texto, no solo con color (D-021.1). |

## 5. Estados y transiciones

### 5.1 Garantía

El estado Vigente/Vencida se calcula con las fechas; solo "Anulada" se guarda.

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Vigente | `garantias.registrar` o la recepción | Inicio y fin válidos. |
| Vigente | Vencida | Sistema | Pasó el día de fin. |
| Vigente o Vencida | Anulada | `garantias.anular` | Motivo. Estado final. |

### 5.2 Reclamo

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Abierto | `reclamos.gestionar` | Activo con serie; si la garantía venció, nota obligatoria. |
| Abierto | En el garante | `reclamos.gestionar` | Fecha de envío y número de caso si existe. |
| En el garante | Resuelto (Reparado o Reemplazado) | `reclamos.gestionar` | Reemplazado según RN-GAR-014 a 016. |
| En el garante | Rechazado | `reclamos.gestionar` | Motivo del garante. |
| Abierto o En el garante | Cancelado | `reclamos.gestionar` | Motivo. |

Resuelto, Rechazado y Cancelado son finales.

### 5.3 Mantenimiento

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Pendiente | `mantenimiento.programar` o Sistema (plan) | Activo que no está De baja ni Extraviado. |
| Pendiente | En ejecución | `mantenimiento.ejecutar` | Con ejecutor definido. |
| En ejecución | Realizado | `mantenimiento.ejecutar` | Fecha real y resultado (Sin novedad, Con hallazgos, No se pudo realizar). |
| Pendiente | Pendiente (nueva fecha) | `mantenimiento.reprogramar` | Motivo; se conserva la fecha anterior. |
| Pendiente o En ejecución | Cancelado | `mantenimiento.reprogramar` o Sistema | Motivo. |
| En ejecución | Pendiente | `mantenimiento.ejecutar` | Motivo (se suspendió). |

**Atrasado** es una etiqueta de los Pendientes con fecha pasada. Realizado y Cancelado son finales.

### 5.4 Plan

| Desde | Hacia | Quién |
|---|---|---|
| (nuevo) | Activo | `mantenimiento.planes` |
| Activo | Inactivo | `mantenimiento.planes` (RN-GAR-021) |
| Inactivo | Activo | `mantenimiento.planes` |

### 5.5 Relación con el estado del activo (D-012)

| Situación | Acción ofrecida | Quién |
|---|---|---|
| Mantenimiento pasa a En ejecución y el activo está En stock o Asignado | Confirmar "Pasar el activo a En reparación" | `activos.cambiar_estado` |
| Mantenimiento Realizado y el activo sigue En reparación | Confirmar "Devolver a En stock" o "Devolver a Asignado" | `activos.cambiar_estado` |
| Activo pasa a De baja o Extraviado | Cancelación de mantenimientos pendientes | Sistema |

La confirmación nunca es obligatoria. Quien no tiene el permiso ve el aviso "El activo sigue En reparación" sin el botón.

## 6. Datos

Todo registro lleva empresa. Claves internas no consecutivas (D-019). Importes con moneda, sin impuesto.

| Entidad | Campos principales | Unicidad | Qué se audita |
|---|---|---|---|
| **Garantía** | Activo, tipo, garante (proveedor de PRV o marca), inicio, meses, fin, cobertura, condiciones, número de garantía o póliza, contrato de PRV (opcional), costo y moneda (opcionales), estado, motivo de anulación | Sin unicidad estricta; aviso si hay dos del mismo tipo con las mismas fechas | Altas, correcciones con antes y después, anulación. |
| **Reclamo** | Activo, garantía, fecha de apertura, falla, número de caso del garante, fecha de envío, estado, resultado, motivo de rechazo, activo de reemplazo (opcional), reclamo anterior (opcional), OS (opcional) | Número interno por empresa (`REC-0001`, D-007.8) | Todo cambio de estado y de campo. |
| **Plan de mantenimiento** | Nombre, SKU o categoría, tarea, frecuencia (número y unidad), días de aviso previo, ejecutor por defecto, estado | Nombre por empresa | Altas, cambios, activación y desactivación. |
| **Mantenimiento** | Número interno, activo, tipo (Preventivo, Correctivo), plan (opcional), prioridad (Crítica, Alta, Media, Baja) para correctivos, descripción de la falla o tarea, fecha prevista, fechas anteriores (reprogramaciones), fecha real, ejecutor (proveedor o Usuario), OS (opcional), cubierto por garantía (Sí, No, Parcial) y garantía, costo y moneda (solo sin OS), resultado, notas, estado, vínculo a cambio (opcional) | Número interno por empresa (`MNT-0001`); un preventivo pendiente por plan y activo (RN-GAR-019) | Todo cambio de estado, reprogramación, costo y confirmaciones de estado del activo. |
| **Configuración** (por empresa) | Días de alerta de garantía, días de aviso de mantenimiento, días de "reparación prolongada" (por defecto 30), hora de envío | Una por empresa | Cambios. |
| **Alerta enviada** | Entidad, tipo, umbral, fecha, destinatarios | Entidad + tipo + umbral | No es auditoría: evita duplicados. |

Datos personales: GAR no guarda datos personales propios. Se ve la persona asignada al activo solo con el permiso del núcleo para datos personales (D-004.4).

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| P-GAR-01 | Garantías del activo (pestaña en la ficha) | Ver y registrar garantías y reclamos, con estado en texto. | Técnico |
| P-GAR-02 | Lista de garantías | Filtrar por vencer, vencidas, garante; exportar. | Jefatura TI |
| P-GAR-03 | Ficha y gestión del reclamo | Seguir el reclamo hasta su resultado y el reemplazo. | Técnico |
| P-GAR-04 | Planes de mantenimiento | Crear y mantener planes. | Jefatura TI |
| P-GAR-05 | Lista de mantenimientos | Filtros por estado, tipo, atrasado, ejecutor. | Técnico |
| P-GAR-06 | Registro y ejecución de mantenimiento | Programar, ejecutar, cerrar, vincular OS; versión simple para celular. | Técnico |
| P-GAR-07 | Calendario | Ver y reprogramar por fecha. | Técnico |
| P-GAR-08 | Hoja de vida del activo | Historial completo y costo acumulado. | Jefatura TI |
| P-GAR-09 | Panel de indicadores | Resumen y recuadro de inicio de Jefatura y Técnico (D-021.6). | Jefatura TI |
| P-GAR-10 | Configuración del módulo | Alertas y umbrales. | Administrador |

## 8. Notificaciones y automatismos

El envío lo hace el módulo de notificaciones (escuadrón C); GAR fija las reglas. El proceso diario corre a la hora local de la empresa. Los avisos del mismo día se agrupan en un solo correo por persona. Ningún aviso incluye importes.

| Evento | Cuándo | A quién | Qué dice |
|---|---|---|---|
| Garantía por vencer | A los 60, 30 y 7 días del fin (configurable) | Quienes tienen `gar.recibir_alertas` | "La garantía de la laptop LAP-0001 serie 8H2K9 vence el 15/03/2027 (faltan 30 días). Revise si necesita un reclamo o una extensión." |
| Garantía venció | Un día después del fin | Igual | "La garantía de la laptop serie 8H2K9 venció el 15/03/2027." |
| Mantenimiento próximo | Los días de aviso del plan antes de la fecha prevista y el mismo día | Ejecutor y quienes tienen `gar.recibir_alertas` | "Mantenimiento preventivo de la laptop serie 8H2K9 programado para el 20/11/2026: limpieza y revisión de batería." |
| Mantenimiento atrasado | Un día después de la fecha prevista y luego cada lunes | Ejecutor y Jefatura | "El mantenimiento MNT-0045 está atrasado 9 días." |
| Reparación prolongada | Cuando un activo lleva más de 30 días En reparación (configurable), y cada 30 días | Jefatura TI | "La laptop serie 8H2K9 lleva 34 días En reparación." |
| Reclamo sin movimiento | 15 días sin cambios en un reclamo En el garante | Quien lo abrió | "El reclamo REC-0007 no tiene novedades hace 15 días." |
| Ejecutor asignado | Al asignar un mantenimiento | Ejecutor interno | "Se le asignó el mantenimiento MNT-0045." |
| Mantenimiento cancelado por el sistema | Al darse de baja el activo o desactivar un plan | Ejecutor | "MNT-0045 se canceló: activo dado de baja." |

Reglas
- Cada aviso se envía una vez por entidad, tipo y umbral (RNF-GAR-002).
- Si un proveedor de servicio es el ejecutor, no recibe correo de la plataforma (no es Usuario).
- Las alertas por correo quedan fuera de la v1 (D-023); en la v1 solo hay filtros y etiquetas.

## 9. Integración con el núcleo y con otros módulos

| Con | Cómo |
|---|---|
| Recepción y activos (Etapas 4 y 5) | La recepción captura el dato de garantía (D-016.5); se crea una garantía del fabricante por activo. Importación de Excel (D-020): columna opcional de fin de garantía. El inicio es la fecha de compra del activo. |
| Estados del activo (D-012) | Solo con confirmación del usuario (sección 5.5); GAR no modifica el estado en forma silenciosa. Si el activo se da de baja, el núcleo avisa a GAR para cancelar pendientes. |
| Órdenes de servicio (Etapa 6, D-027) | Acordado por mensaje con escuadrón C: GAR es dueño de garantía, reclamo y calendario; la OS es la orden de trabajo con técnico y costo. Vínculo 1 a 1 opcional. La OS tiene el campo "cubierta por garantía" que GAR llena. El reclamo puede vincular una OS "Servicio externo" creada desde el reclamo o desde el caso. La mesa de ayuda crea la OS en estado "Creada", muestra en solo lectura la garantía vigente del activo y no la edita; el mantenimiento programado crea OS, no casos. |
| `proveedores-contratos` (PRV) | El garante y el ejecutor externo son proveedores de PRV; una garantía o un mantenimiento puede referir a un contrato de PRV; el calendario lee vencimientos de contratos de servicio. GAR no duplica proveedores ni contratos. |
| `gestion-cambios` (E) | Acordado por mensaje: el mantenimiento se queda en GAR; el botón "Crear cambio estándar" precarga activo y fecha y GAR guarda solo el vínculo. Ventanas y congelamientos son de gestion-cambios y se consultan solo para sugerir fecha. |
| `presupuesto-costos` (F) | Presupuesto lee costo y moneda de garantía extendida y de mantenimiento sin OS; con OS, lee el costo de la OS (RN-GAR-027). GAR no captura presupuesto. |
| `cmdb-ligera` (E) | Garantía y estado de mantenimiento son atributos que la CMDB puede mostrar. |
| `notificaciones` (C) | Envío, agrupación y preferencias; clave de no repetición entidad/tipo/umbral. |
| `licencias-software`, `lineas-moviles`, `dominios-certificados` (B) | Fuera: GAR no cubre software ni líneas; el soporte contratado se registra en PRV. |
| `reportes-tableros` (F) | Reportes avanzados de mantenimiento son de F; GAR ofrece solo los indicadores de RF-GAR-026. |

## 10. Criterios de aceptación

| ID | Criterio |
|---|---|
| CA-GAR-01 | **Dado** una recepción de 10 laptops con serie y garantía de 36 meses desde la compra el 15/03/2024, **cuando** se confirma, **entonces** cada activo muestra "En garantía hasta 14/03/2027". |
| CA-GAR-02 | **Dado** un activo de la empresa A, **cuando** un usuario de la empresa B pide su garantía o hoja de vida, **entonces** recibe "no encontrado", igual que con un identificador inexistente. |
| CA-GAR-03 | **Dado** un usuario Solo lectura sin `mantenimiento.programar`, **cuando** intenta programar un mantenimiento (por pantalla o directo al servidor), **entonces** se rechaza y el intento queda en la auditoría. |
| CA-GAR-04 | **Dado** una laptop con garantía del fabricante hasta 15/03/2027 y una extendida hasta 15/03/2028, **cuando** se consulta el 01/02/2027, **entonces** ambas están Vigentes y la efectiva es la extendida. |
| CA-GAR-05 | **Dado** un plan "limpieza cada 6 meses" para el SKU LAP-0001, **cuando** el técnico cierra el preventivo el 10/05/2027, **entonces** el siguiente se programa para el 10/11/2027 y solo hay uno pendiente. |
| CA-GAR-06 | **Dado** un mantenimiento correctivo Pendiente de un activo Asignado, **cuando** el técnico lo pasa a En ejecución, **entonces** el sistema ofrece pasar el activo a En reparación; si el técnico no confirma, el activo no cambia de estado. |
| CA-GAR-07 | **Dado** un activo En reparación con mantenimiento Realizado, **cuando** el técnico confirma "Devolver a En stock", **entonces** el activo pasa a En stock, la acción queda en la auditoría y la asignación previa se conserva en el historial. |
| CA-GAR-08 | **Dado** un mantenimiento vinculado a una OS con costo USD 120, **cuando** se intenta registrar costo también en el mantenimiento, **entonces** se rechaza con "El costo está en la OS". |
| CA-GAR-09 | **Dado** un reclamo En el garante, **cuando** se marca Reemplazado con serie nueva, **entonces** el activo original pasa a De baja con motivo "Reemplazo por garantía", el nuevo existe con su propia serie y ambos quedan vinculados. |
| CA-GAR-10 | **Dado** un técnico sin permiso de baja, **cuando** intenta completar un reemplazo, **entonces** el reclamo queda en "Reemplazo pendiente de registrar" y el activo no cambia. |
| CA-GAR-11 | **Dado** un activo con mantenimientos Pendientes, **cuando** se da de baja, **entonces** se cancelan con motivo "Activo dado de baja" y se avisa a los ejecutores. |
| CA-GAR-12 | **Dado** una garantía que vence en 30 días y el umbral 30, **cuando** el proceso diario corre dos veces, **entonces** se envía un solo aviso. |
| CA-GAR-13 | **Dado** un usuario sin `precios.ver`, **cuando** abre la hoja de vida, **entonces** no ve costos ni en pantalla ni en exportaciones. |

## 11. Casos límite

1. Garantía de 12 meses desde el 31/01: vence el 31/01 del año siguiente menos un día, es decir el 30/01 (RN-GAR-003); con 1 mes desde el 31/01, vence el 27 o 28/02 según el año.
2. Activo sin fecha de compra (importado del Excel): la garantía necesita inicio escrito; sin él no se calcula y se muestra "Sin fecha de garantía".
3. Dos recepciones simultáneas del mismo activo: no hay duplicados porque la recepción es todo o nada (D-016.4).
4. Reingreso de un activo dado de baja (D-009.3): sus garantías anteriores se muestran; las Vencidas siguen así; no se crean mantenimientos viejos.
5. Un preventivo atrasado 18 meses: sigue un solo pendiente con etiqueta "Atrasado"; no se generan los intermedios.
6. Cambio de frecuencia del plan con programaciones pendientes: las pendientes conservan su fecha (RN-GAR-020).
7. El Usuario técnico ejecutor es dado de baja: el mantenimiento queda "Sin ejecutor" y se avisa a Jefatura TI.
8. Proveedor de servicio desactivado con mantenimientos Pendientes: se avisa; el usuario elige otro ejecutor antes de ejecutar.
9. Reemplazo con una serie que ya existe en otro SKU de la empresa: se acepta con aviso, según D-009.2.
10. OS cancelada que estaba vinculada: el mantenimiento queda sin OS y sigue Pendiente.
11. Activo En reparación al que le llega la baja: permitido por D-012; los mantenimientos se cancelan (RN-GAR-022).
12. Dos usuarios cierran el mismo mantenimiento a la vez: solo uno se aplica; el otro recibe "ya fue cerrado".
13. Garantía anulada con reclamo abierto: se rechaza la anulación hasta cerrar o cancelar el reclamo.

## 12. Decisiones propuestas y supuestos

| ID | Propuesta | Motivo |
|---|---|---|
| S-GAR-01 | **[SUPUESTO]** Dos fases: A (dato de garantía en la recepción, Etapas 4 y 5) y B (reclamos, planes, calendario, alertas, después de la v1). | D-023 deja avisos de garantía fuera de la v1; el dato de garantía sí se necesita desde la recepción. |
| S-GAR-02 | **[SUPUESTO]** Al activar la Fase B se migra el fin de garantía de la Fase A a garantías del fabricante. El Ingeniero de Datos define la migración. | Evita perder datos ya cargados. |
| S-GAR-03 | **[SUPUESTO]** Solo activos con serie; no hay garantía ni mantenimiento para stock por cantidad. | Un lote no se reclama unidad por unidad; se evalúa si el CEO lo pide. |
| S-GAR-04 | **[SUPUESTO]** El mantenimiento es el registro del activo y la OS es la orden de trabajo; vínculo 1 a 1 opcional; el costo vive en la OS si hay una. | Evita duplicar costos y respeta D-027. |
| S-GAR-05 | **[SUPUESTO]** Un activo Asignado que pasa a En reparación conserva su asignación. Hay que confirmarlo con el analista del núcleo. | D-012 permite volver a Asignado. |
| S-GAR-06 | **[SUPUESTO]** La confirmación "pasar a En reparación" es una ayuda en pantalla, no un cambio automático. Si el Gerente de TI prefiere cero ayudas, se quita RF-GAR-022 y RF-GAR-023. | Respeta D-027 y reduce olvidos. |
| S-GAR-07 | **[SUPUESTO]** La próxima fecha del preventivo se cuenta desde la realización real, no desde la fecha prevista. | Evita acumular atrasos. |
| S-GAR-08 | **[SUPUESTO]** Solo un preventivo pendiente por plan y activo. | Evita avalanchas de tareas atrasadas. |
| S-GAR-09 | **[SUPUESTO]** Los proveedores de servicio no reciben correos; el contacto es del técnico. | No son Usuarios. |
| S-GAR-10 | **[SUPUESTO]** Reportar fallas es función de la mesa de ayuda y las OS "Creada"; GAR no tiene pantalla para Solicitante. | Una sola puerta de entrada. |
| S-GAR-11 | **[SUPUESTO]** El tiempo real contra el SLA del proveedor (de PRV) se calcula en horas corridas y solo se muestra. | Medición completa excede esta fase. |
| E-GAR | **[ESCALAR AL CEO]** Ninguno por ahora. Si en el futuro se registran seguros o pólizas, o archivos de garantía, aplican D-022 (costo de almacenamiento) y una opinión legal sobre el valor probatorio. | Se deja anotado. |

## 13. Fuera de alcance

1. Garantía y mantenimiento de stock por cantidad.
2. Garantía de licencias, líneas móviles o dominios (los cubren sus módulos o PRV).
3. Archivos adjuntos: facturas, fotos, informes de servicio (D-022).
4. Mantenimiento por uso (horas, ciclos de batería) o por lectura de sensores.
5. Inventario de repuestos y su consumo.
6. Seguros y siniestros.
7. Depreciación y valorización del activo.
8. Gestión de cambios y ventanas de mantenimiento (de `gestion-cambios`).
9. Reportes avanzados (de `reportes-tableros`).
10. Avisos a la persona asignada al equipo y portal para pedir mantenimiento (de `portal-autoservicio`).
11. Devolución al proveedor de mercadería dañada (D-016.1, D-023) y exportar calendario a aplicaciones externas.

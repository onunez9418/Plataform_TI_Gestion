# Módulo: Líneas móviles y planes (LIN)

**Versión:** 0.2 · **Autor:** Analista de Negocio, escuadrón B · **Estado:** corregido tras la revisión cruzada (plan de correcciones, Mesa #002); pendiente de verificación del Auditor Técnico, QA, Seguridad y Cumplimiento
**Base:** decisiones D-001 a D-064 (`docs/equipo/decisiones.md`), en especial D-030, D-036, D-037, D-038, D-042, D-043, D-044, D-049, D-050, D-056, D-058, D-061 y D-062.
**Fase:** Fase 2, ola B (D-056). Cada fila de requisito indica "Cuándo" y el criterio que lo cubre.

---

## 1. Propósito, alcance y fase

**Propósito.** Saber qué líneas móviles paga la empresa, con qué plan y operador, quién las usa, en qué equipo están, cuánto cuestan al mes y cuándo se suspenden o se dan de baja. Evitar pagar líneas de personas que ya se fueron o de equipos robados.

**Entra**
- Planes del operador (catálogo por empresa) y sus cargos mensuales.
- Líneas: número, plan, estado, Persona que la usa, equipo asociado, centro de costo.
- Suspensión (con motivo) y baja (con motivo), con historial.
- Costo mensual por línea, por plan, por centro de costo y por Persona, siempre por moneda.
- Avisos de fin de permanencia y de equipo robado con línea activa.
- Asistente de migración del "número de línea" que la v1 guarda en el celular.
- Importación inicial (marco común) y exportación (puerta común).

**No entra**
- Conexión con el operador: suspender o dar de baja **registra** lo hecho; la acción real la hace TI con el operador.
- Facturas, consumo real, roaming y conciliación contra la factura.
- Líneas personales de empleados: no se guarda teléfono personal (D-006).
- Guardar PIN o PUK de la SIM (D-042.4).
- Gestión del equipo celular: es un activo del inventario (el IMEI es dato de la unidad, D-005).

**Fase.** Fase 2, ola B (D-056.3), después de la Etapa 7. Requiere Etapa 2 (Personas, campo "identificador"), Etapa 4 (inventario con celulares) y NOT-completo. **En la v1** el número de línea es un campo opcional de la unidad del Celular, con marca "identificador" y tratado como dato personal mientras legal no diga lo contrario (D-042.1). Cada empresa activa el módulo en Configuración (`empresa.configurar_modulos`); apagarlo oculta, no borra.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Línea** | Servicio móvil con número telefónico contratado por la empresa. |
| **Operador** | La empresa de telefonía. Es un proveedor de la tabla única de proveedores del núcleo (D-040.3). |
| **Plan** | Condiciones comerciales: nombre, cargo fijo mensual, datos incluidos. |
| **Cargo especial** | Monto mensual distinto al del plan (descuento o promoción) para una línea. |
| **Equipo asociado** | Celular, tablet o módem (activo) donde está la SIM. Su **IMEI** es dato de la unidad, no de la línea. |
| **Responsable de la línea** | La Persona que la usa (D-006). No necesita ser Usuario. Una Persona está Activa, Cesada o Anonimizada. |
| **Responsable inactivo** | La Persona responsable fue Cesada. Se calcula; no es un estado guardado. |
| **Pendiente de la persona** | Cosa que una Persona aún tiene a su nombre. Aquí: líneas Activas o Suspendidas. |
| **Permanencia** | Plazo mínimo comprometido con el operador; darla de baja antes suele tener penalidad. |
| **Costo comprometido** | Cargo mensual vigente con impuesto × meses de permanencia restantes (12 si no hay permanencia). Es la medida que se compara con el límite de la empresa. |
| **Suspensión / Baja / Reingreso** | Suspensión: sin uso temporal. Baja: ya no se paga ni se usa; el registro se conserva (D-019). Reingreso: reactivar una línea de baja (D-009.3). |
| **Migración** | Paso único que convierte el "número de línea" guardado en los celulares en líneas del módulo (D-042.2). |

## 3. Roles y permisos

Nombres con el formato `<módulo>.<acción>` (D-036); los módulos agregan filas, no cambian celdas del núcleo (D-037). Alcance **Todo** o **Propio** (quien tiene alcance "propio" y no tiene Persona vinculada ve una lista vacía, nunca un error). Los PS-nn son los de `docs/registro-permisos.md`. T = todo, P = lo propio, - = no puede.

| Acción | Permiso (PS) | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|
| Ver líneas y planes | `lineas.ver` (PS-90) | T | T | T | - | - | T | - |
| Ver costos | `precios.ver` (PS-23) | T | T | P | - | P | - | - |
| Ver el número completo y la Persona responsable | `datos_personales.ver` (PS-22) | T | T | T | - | - | - | - |
| Crear y editar líneas (sin cargo especial) | `lineas.crear_editar` (PS-91) | T | - | T | - | - | - | - |
| Asignar Persona y asociar equipo | `lineas.asignar` (PS-92) | T | - | T | - | - | - | - |
| Suspender y reactivar | `lineas.suspender` (PS-93) | T | - | T | - | - | - | - |
| Dar de baja | `lineas.baja` (PS-94) | T | - | T | - | - | - | - |
| **Reingreso** (sensible) | `lineas.reingreso` (PS-95) | T | T | - | - | - | - | - |
| Planes, cambios de cargo, **cargo especial** y configuración del módulo | `lineas.administrar_planes` (PS-96) | T | - | - | - | - | - | - |
| Confirmar el costo cuando supera el límite | `lineas.confirmar_costo` (nuevo) | T | T | - | - | - | - | - |
| Migrar números desde los celulares (sensible) | `lineas.migrar` (nuevo) | T | - | - | - | - | - | - |
| Importar (permiso único; módulo "lineas") | `datos.importar` (PS-21) | T | - | - | - | - | - | - |
| Exportar (permiso único; módulo "lineas") | `datos.exportar` (PS-20) | T | - | - | - | - | - | - |
| Recibir avisos del módulo | `lineas.recibir_avisos` (nuevo) | T | T | T | - | - | - | - |
| Ver auditoría | `auditoria.ver` (PS-18) | T | T | - | - | - | - | - |

"Mis líneas" lo cubre el portal con `portal.ver_propio` (PS-205, Fase 3; Empleado: P); el Solicitante no tiene acceso a este módulo por defecto. Los permisos marcados "nuevo" están pedidos al Analista (sección 14 del registro).

Controles (D-036.5, D-048): `lineas.reingreso` y `lineas.migrar` llevan reautenticación reciente (R), segundo factor (2F) y auditoría de cada uso (A); `datos.exportar` y `datos.importar`, R, 2F, A y los topes del núcleo. Jefatura TI no exporta ni importa salvo que el administrador se lo active. Quien fija precios (`lineas.administrar_planes`) no es quien opera por defecto. Todo se comprueba en el servidor. Un rol nuevo parte sin permisos. Sin `datos_personales.ver` el número se ve enmascarado (`+51 ••• ••• 321`) y la Persona como `PRS-0042` (D-037 fila 7).

## 4. Requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-LIN-001 | Mantener el catálogo de planes: operador, nombre, tipo (pospago, control, prepago), cargo mensual sin impuesto, % de impuesto, moneda, datos incluidos (texto), permanencia en meses y estado (Activo/Inactivo). | Fase 2, ola B | CA-LIN-10 |
| RF-LIN-002 | Registrar una línea: número, plan, ICCID (opcional), fecha de alta, fin de permanencia, centro de costo, cargo especial (opcional) y notas. | Fase 2, ola B | CA-LIN-01 |
| RF-LIN-003 | Asignar la línea a una Persona (responsable) y cambiarla; cada cambio queda en el historial con fechas. | Fase 2, ola B | CA-LIN-01 |
| RF-LIN-004 | Asociar la línea a un equipo y desasociarla; el IMEI se **lee** del equipo, no se escribe en la línea. | Fase 2, ola B | CA-LIN-03 |
| RF-LIN-005 | Suspender una línea con motivo y reactivarla. | Fase 2, ola B | CA-LIN-04 |
| RF-LIN-006 | Dar de baja una línea con motivo; se desasocia del equipo y de la Persona y el historial se conserva. | Fase 2, ola B | CA-LIN-06 |
| RF-LIN-007 | Reingreso de una línea de baja, con motivo y permiso sensible. | Fase 2, ola B | CA-LIN-12 |
| RF-LIN-008 | Mostrar el costo mensual vigente por línea y los totales por plan, centro de costo, operador y Persona, **siempre separados por moneda**. | Fase 2, ola B | CA-LIN-10 |
| RF-LIN-009 | Avisar al dar de baja antes del fin de permanencia; la plataforma no calcula la penalidad. | Fase 2, ola B | CA-LIN-06 |
| RF-LIN-010 | Avisar cuando un equipo asociado pasa a Extraviado o robado, o De baja, y la línea sigue Activa. | Fase 2, ola B | CA-LIN-05 |
| RF-LIN-011 | Avisar cuando la Persona que tiene el equipo es distinta de la responsable de la línea. | Fase 2, ola B | CA-LIN-03 |
| RF-LIN-012 | Declarar a Notificaciones las reglas de aviso del módulo (sección 8). | Fase 2, ola B | CA-LIN-13 |
| RF-LIN-013 | Importar líneas con el marco único de importación (tipo "líneas"). | Fase 2, ola B | CA-LIN-11 |
| RF-LIN-014 | Buscar por número, ICCID, IMEI del equipo, Persona o plan (según permisos); filtrar por estado, operador, plan y centro de costo; exportar solo por la puerta única. | Fase 2, ola B | CA-LIN-09 |
| RF-LIN-015 | Historial completo de la línea: estados, responsables, equipos, planes y cargos. | Fase 2, ola B | CA-LIN-10 |
| RF-LIN-016 | Cambiar el plan de una línea con fecha de efecto. | Fase 2, ola B | CA-LIN-10 |
| RF-LIN-017 | Declarar en el registro de módulo el pendiente "línea a nombre de la Persona" para su ficha y para `onboarding-offboarding`. | Fase 2, ola B | CA-LIN-07 |
| RF-LIN-018 | Ofrecer al portal el servicio "mis líneas" (líneas de la Persona vinculada); la pantalla y su permiso (`portal.ver_propio`) son del portal. | Fase 3, con el portal | CA-LIN-09 |
| RF-LIN-019 | Declarar el costo de la línea con el patrón común y su `fuente_costo`, y marcar "Sin respaldo de compra". | Fase 2, ola B | CA-LIN-08 |
| RF-LIN-020 | Informe de líneas "sin movimiento": activas sin responsable, con responsable inactivo o sin equipo. | Fase 2, ola B | CA-LIN-07 |
| RF-LIN-021 | **Asistente de migración:** leer los números de línea de los celulares, normalizarlos, crear las líneas ligadas al equipo y a la Persona, reportar duplicados y formatos dudosos, todo o nada por lote, con simulacro previo, lote deshacible y plan de vuelta atrás. | Fase 2, ola B | CA-LIN-14 |
| RF-LIN-022 | Confirmar el costo de una línea cuando supera el límite de la empresa, por una segunda persona. | Fase 2, ola B | CA-LIN-08 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-LIN-001 | Todo dato lleva empresa. Plan, Persona, equipo, centro de costo y operador deben ser de la misma empresa: la base lo impide y un identificador de otra empresa responde "no encontrado" (D-025, D-039, D-021.5). |
| RN-LIN-002 | El número se guarda normalizado (solo dígitos con código de país). Es **único por empresa entre las líneas no dadas de baja**; uno repetido se rechaza indicando dónde está. El ICCID, si se escribe, es único por empresa. |
| RN-LIN-003 | Una línea de baja conserva su registro. Un número de baja puede usarlo una línea nueva; entonces la línea de baja ya no admite reingreso. |
| RN-LIN-004 | Un plan Inactivo no se usa en líneas nuevas; sigue visible en las existentes. Un plan no se borra (D-008.6, D-019). |
| RN-LIN-005 | Cada línea tiene un solo plan vigente y una sola Persona responsable a la vez. Un equipo puede tener varias líneas (doble SIM); una línea tiene un solo equipo a la vez. |
| RN-LIN-006 | El equipo asociado está En stock, Asignado o En reparación; no se asocia uno De baja o Extraviado o robado (D-012). |
| RN-LIN-007 | El responsable es una Persona Activa. Una línea Activa debe tener responsable; si no lo tiene o está Cesado, aparece en el informe RF-LIN-020. |
| RN-LIN-008 | Que el responsable de la línea y la Persona que tiene el equipo difieran es solo un aviso. |
| RN-LIN-009 | **El cese de una Persona nunca se bloquea por líneas** (D-061.7). Sus líneas Activas o Suspendidas son pendientes de la persona, visibles en su ficha; generan una tarea de salida y un aviso a Jefatura TI, y la línea queda con "responsable inactivo". Lo que sí se bloquea es **anonimizar** a la Persona mientras tenga líneas a su nombre sin cerrar o reasignar (D-033.3). |
| RN-LIN-010 | Un equipo que pasa a Extraviado o robado **no** suspende la línea solo: se avisa y TI decide. |
| RN-LIN-011 | Motivos de suspensión (lista cerrada): Robo o extravío del equipo; Cese temporal del uso; Falta de pago; Otro (con texto). Motivos de baja: Persona dejó la empresa; Equipo dado de baja; Ya no se necesita; Cambio de operador o plan; Otro (con texto). |
| RN-LIN-012 | Baja, suspensión, reactivación y reingreso exigen motivo (D-012.4). |
| RN-LIN-013 | Una línea Suspendida cuesta el cargo vigente salvo que se informe un cargo en suspensión distinto. |
| RN-LIN-014 | **Costo:** patrón compartido (D-044.1): importe sin impuesto (4 decimales exactos), % de impuesto, moneda de 3 letras, periodicidad, inicio, fin, centro de costo y `fuente_costo` ∈ {propia, orden de compra, contrato}. El costo mensual vigente es el cargo especial si existe, si no el del plan. Una moneda por línea, sin conversión; **nunca un total general entre monedas**. |
| RN-LIN-015 | **Cargo especial:** solo lo escribe o cambia quien tiene `lineas.administrar_planes` (D-043.5). Cambiar el cargo de un plan no cambia el pasado: se guarda con fecha de efecto; las líneas con cargo especial no se afectan. |
| RN-LIN-016 | **Segunda persona (RN-017 del núcleo):** si el costo comprometido de un alta, un cambio de plan o un cargo especial supera **estrictamente** el límite de la empresa (total con impuesto en la moneda base; otra moneda siempre), el costo debe confirmarlo otra persona con `lineas.confirmar_costo`: no confirma quien creó o editó el registro desde la última confirmación. Aplica al Administrador. La línea opera mientras tanto, pero su costo queda "pendiente de confirmación" y no entra al libro de costos hasta confirmarse. La excepción es solo la casilla «contratos» del interruptor único (D-031, D-043); no hay excepción propia. [SUPUESTO] SUP-LIN-14 |
| RN-LIN-017 | **Fuente única:** orden de compra, luego contrato de proveedor (si la línea lo enlaza y el contrato cubre su costo), luego registro propio (D-044.3). Con costo y sin orden ni contrato enlazados, la línea queda **"Sin respaldo de compra"** (marca visible; informe mensual a quien aprueba); no se bloquea. |
| RN-LIN-018 | **El número de línea asignado a una Persona se trata como dato personal** hasta que legal diga lo contrario (D-030.6, L-09): la auditoría registra que el campo número cambió, no su valor; sin `datos_personales.ver` se ve enmascarado; los correos solo muestran el número enmascarado; por la API, ni el IMEI ni el número salen sin el alcance de personas (D-063.4). |
| RN-LIN-019 | Solo se registran líneas contratadas por la empresa. No se guarda el teléfono personal de nadie, ni documento de identidad ni dirección (D-006). No se guardan PIN ni PUK. |
| RN-LIN-020 | Nada con historial se borra: líneas y planes se dan de baja o se desactivan. Solo se anula con motivo un registro creado por error y sin cambios posteriores. |
| RN-LIN-021 | Reingreso exige `lineas.reingreso`, motivo y que el número no esté en otra línea; es el mismo registro, nunca un duplicado (D-009.3). |
| RN-LIN-022 | Dar de baja una línea antes del fin de permanencia exige confirmar el aviso de penalidad. La permanencia se **calcula al leer** con la fecha y la zona de la empresa; ningún proceso cambia estados por fecha (D-062.2). |
| RN-LIN-023 | Al anonimizar una Persona (D-030.3), el historial de la línea sigue apuntando a su identificador, que ahora muestra "Persona anonimizada 0042". El número de la línea sigue visible a quien corresponda porque es de la empresa. |
| RN-LIN-024 | **Migración (D-042.2, D-042.3):** normaliza el número, crea las líneas con el equipo y la Persona que lo tiene asignado, reporta duplicados y formatos dudosos, y funciona todo o nada por lote, con simulacro previo sobre copia anonimizada, lote deshacible (anula, no borra, D-050.5) y plan de vuelta atrás (D-029). Tras migrar, el campo del celular queda de solo lectura con la etiqueta "Lo gestiona el módulo Líneas móviles" y se oculta de los formularios; los valores originales se conservan 90 días. |
| RN-LIN-025 | Una línea migrada no tiene plan: queda **"pendiente de completar"** y no bloquea lo que ya existe (D-005); el plan es obligatorio para las líneas nuevas. |
| RN-LIN-026 | Una línea importada con un equipo cuyo IMEI no existe falla en esa fila; no se crea el equipo. |
| RN-LIN-027 | Textos libres (notas, motivo "Otro"): la auditoría solo dice que el campo cambió; un validador común rechaza patrones de claves (D-063.2); el formulario avisa de no escribir datos personales. |
| RN-LIN-028 | Los correos de aviso solo contienen nombre del elemento (número enmascarado), fecha y días restantes; nunca importes ni nombres de personas (D-061.4). |

### 4.3 Requisitos de calidad

| ID | Requisito medible | Cuándo | CA |
|---|---|---|---|
| RNF-LIN-001 | Una lista de 5.000 líneas muestra su primera página en 2 segundos o menos (95 %), con 50 filas por página. Volumen de referencia: el único de RNF-010 del núcleo. | Fase 2, ola B | CA-LIN-09 |
| RNF-LIN-002 | Dos personas que registran el mismo número a la vez: exactamente una lo logra. | Fase 2, ola B | CA-LIN-02 |
| RNF-LIN-003 | El 100 % de los cambios de estado, responsable, equipo, plan y cargo deja una entrada de auditoría (los campos personales, sin valor). | Fase 2, ola B | CA-LIN-10 |
| RNF-LIN-004 | Importar 2.000 líneas con vista previa termina en 30 segundos o menos, en el trabajador y con barra de avance. | Fase 2, ola B | CA-LIN-11 |
| RNF-LIN-005 | Los avisos del día los emite Notificaciones a la hora única de la empresa (08:00 por defecto) sin repetir; el proceso es idempotente y recuperable (D-038.4). | Fase 2, ola B | CA-LIN-13 |
| RNF-LIN-006 | Lista y ficha usables en 360 px y con teclado; contraste AA; estado con texto (D-021.1). | Fase 2, ola B | CA-LIN-09 |
| RNF-LIN-007 | Una búsqueda por IMEI o número responde en 2 segundos o menos. | Fase 2, ola B | CA-LIN-03 |
| RNF-LIN-008 | La permanencia y la vigencia se calculan con el reloj de la plataforma, que las pruebas pueden fijar y adelantar en entornos de prueba. | Fase 2, ola B | CA-LIN-13 |

## 5. Estados y transiciones

### 5.1 Línea

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Por activar | `lineas.crear_editar` | Alta pedida al operador, sin SIM activa |
| (nueva) | Activa | `lineas.crear_editar` | Línea ya en uso (importación o migración) |
| Por activar | Activa | `lineas.crear_editar` | Responsable asignado |
| Por activar | Dada de baja | `lineas.baja` | Pedido cancelado; motivo |
| Activa | Suspendida | `lineas.suspender` | Motivo (RN-LIN-011) |
| Suspendida | Activa | `lineas.suspender` | Motivo |
| Activa, Suspendida | Dada de baja | `lineas.baja` | Motivo; aviso de permanencia (RN-LIN-022) |
| Dada de baja | Activa | `lineas.reingreso` | Motivo; el número no lo usa otra línea (RN-LIN-021) |

No hay otras transiciones. Al pasar a Dada de baja se cierran responsable y equipo, con fecha. "Responsable inactivo" y "Permanencia vencida" se calculan al leer; no son estados.

### 5.2 Plan

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Activo | `lineas.administrar_planes` | Operador, nombre y cargo |
| Activo | Inactivo | `lineas.administrar_planes` | Las líneas existentes siguen usándolo |
| Inactivo | Activo | `lineas.administrar_planes` | — |

## 6. Datos

**Plan.** Empresa; operador (proveedor); nombre; tipo; cargo mensual sin impuesto; % de impuesto; moneda; datos incluidos; permanencia en meses; estado. Único: operador + nombre por empresa (sin distinguir mayúsculas).

**Cargo del plan (historial).** Plan; importe; desde qué fecha; quién lo cambió.

**Línea.** Empresa; identificador interno estable (lo usa la CMDB); número normalizado (único entre las no dadas de baja; campo con marca "identificador"); ICCID (opcional, único); plan vigente (o "pendiente de completar"); estado; fecha de alta; fin de permanencia; centro de costo; cargo especial; cargo en suspensión; costo "pendiente de confirmación" (sí/no) y quién lo confirmó; `fuente_costo`; orden de compra o contrato de proveedor enlazados (opcionales); marca "Sin respaldo de compra"; notas.

**Asignación de la línea.** Línea; Persona (por identificador `PRS-`); desde; hasta; quién asignó. Solo una abierta por línea.

**Asociación línea-equipo.** Línea; activo; desde; hasta; quién la hizo. Solo una abierta por línea.

**Cambio de estado y cambio de plan.** Línea; valor anterior y nuevo (estado o plan); motivo (lista y texto); fecha; quién.

**Lote de migración.** Lote del marco único de importación, con el valor original conservado 90 días por celular.

**Configuración de la empresa.** Destinatarios y umbrales de aviso (los de Notificaciones).

**Datos personales de este módulo (lista declarada, D-061.3).** Número de línea asignado a una Persona y la asignación línea-Persona (dato personal hasta que legal responda, L-09); notas y motivos de texto libre. Plazo: el de la auditoría (5 años); al anonimizar a la Persona el vínculo queda en su identificador anonimizado. La tabla única de retención del núcleo incluye este módulo.

**Se audita** (D-018, D-030): altas y cambios con antes y después (el número y las notas, solo "el campo cambió"), cambios de cargo, asignaciones, asociaciones de equipo, suspensiones, bajas, reingresos, confirmaciones de costo, migraciones, importaciones y exportaciones (por el marco y la puerta únicos), cambios de configuración y consultas a la auditoría del módulo. No se guardan teléfonos personales, PIN ni PUK.

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-LIN-01 | Lista de líneas | Buscar, filtrar; "Exportar" visible y desactivado con la razón si falta el permiso | Técnico |
| PAN-LIN-02 | Ficha de la línea | Datos, responsable, equipo, costo e historial | Técnico |
| PAN-LIN-03 | Alta / edición de línea | Formulario | Técnico |
| PAN-LIN-04 | Asignar responsable y equipo | Buscar Persona y equipo; ver avisos de diferencia | Técnico |
| PAN-LIN-05 | Suspender / dar de baja | Diálogo con motivo y aviso de permanencia | Técnico |
| PAN-LIN-06 | Catálogo de planes | Alta y cambio de cargos con fecha | Administrador |
| PAN-LIN-07 | Costos de líneas | Totales por plan, centro de costo, operador y Persona, por moneda | Jefatura TI |
| PAN-LIN-08 | Líneas sin movimiento | Sin responsable, responsable inactivo, sin equipo | Técnico |
| PAN-LIN-09 | Asistente de migración | Simulacro, informe de duplicados y formatos dudosos, confirmar, deshacer | Administrador |
| PAN-LIN-10 | Confirmar costos | Costos pendientes de confirmación | Jefatura TI |
| PAN-LIN-11 | Mis líneas (pantalla del portal, Fase 3) | Líneas que tengo asignadas | Empleado (portal) |
| PAN-LIN-12 | Configuración del módulo | Destinatarios y umbrales | Administrador |

La importación usa el asistente único "Importar datos" y la exportación la puerta única.

## 8. Notificaciones y automatismos

Este módulo **no tiene procesos propios**. Declara reglas al motor único de avisos de `notificaciones` (RF-NOT-024, D-062.3): entidad, campo de fecha, umbrales y permiso de destinatarios. Notificaciones evalúa una vez al día a la hora única de la empresa (08:00 por defecto), no repite el mismo aviso (elemento, umbral, destinatario), usa su tabla única y es idempotente y recuperable (D-038.4). Si la fecha se corrige a una futura, se cancelan y recalculan los avisos. Texto con variables cerradas: nombre del elemento (número enmascarado), fecha, días.

| Regla / evento | Fecha o hecho | Umbrales | Destinatarios | Texto |
|---|---|---|---|---|
| `lineas.permanencia_por_vencer` | Fin de permanencia | Los de Notificaciones (90, 60, 30, 15, 7) | Responsable de la línea y quienes tengan `lineas.recibir_avisos` | "La línea +51 ••• ••• 321 termina su permanencia el 15/01/2027 (faltan 30 días)." |
| `lineas.equipo_perdido_con_linea_activa` | Evento: el equipo pasa a Extraviado o robado, o De baja, con línea Activa | El mismo día | Quienes tengan `lineas.recibir_avisos` | "El equipo asociado a la línea +51 ••• ••• 321 cambió de estado. Revise si debe suspenderla." |
| `lineas.responsable_cesado` | Evento: se cesa la Persona responsable | Una vez | Mismos y Jefatura TI | "La línea +51 ••• ••• 321 quedó sin responsable activo." |
| `lineas.baja_antes_de_permanencia` | Evento: baja antes del fin de permanencia | Una vez | Jefatura TI | "Se dio de baja la línea +51 ••• ••• 321 antes de su fin de permanencia (15/01/2027)." |
| `lineas.costo_pendiente_confirmacion` | Evento: costo sobre el límite | Una vez | Quienes tengan `lineas.confirmar_costo` | "Hay un costo de línea pendiente de confirmación." |

Se usan los umbrales por defecto de Notificaciones sin apartarse. Los avisos de Fase 2 no entran a la v1. Depende del servicio de correo ya escalado al Cliente (CEO); no agrega gasto.

## 9. Integración con el núcleo y otros módulos

- **Personas (D).** El responsable es una Persona. El cese **no se bloquea** por líneas: las líneas son pendientes de la persona (RN-LIN-009); `onboarding-offboarding` las muestra en su checklist y crea la tarea; se bloquea anonimizar (D-061.7).
- **Inventario.** El equipo asociado es un activo; el IMEI se lee de su campo de unidad (identificador). El evento de cambio de estado del equipo llega por el bus (aviso, asíncrono). `entregas-devoluciones` no mueve la línea: si cambia la Persona del equipo, solo sale el aviso de RF-LIN-011.
- **Categoría Celulares (núcleo).** En la v1 tiene el campo de unidad opcional "número de línea". Al activar LIN y migrar (RN-LIN-024) pasa a solo lectura.
- **Proveedores (PRV, escuadrón A).** El operador sale de la tabla única de proveedores. Un contrato de PRV (telecomunicaciones) puede enlazarse y entonces es la fuente del costo.
- **Presupuesto y reportes (F).** `presupuesto-costos` posee el libro único de costos y toma el costo de la línea solo si no hay orden de compra ni contrato; solo costos confirmados. `reportes-tableros` llama a los servicios del módulo. No escriben.
- **Notificaciones (C).** Sección 8. `mesa-de-ayuda` puede originar un pedido de línea, pero crear la línea es acción de este módulo.
- **CMDB (E).** La CMDB lee de LIN (referencia, nombre y estado) y no copia; este módulo da un identificador estable y emite el evento cuando la línea pasa a Dada de baja.
- **Importación y exportación.** Marco único (D-050) y puerta única (D-061.1).
- **Portal (D).** "Mis líneas" con alcance propio (`portal.ver_propio`); el número mostrado depende del módulo activo.
- **Auditoría (núcleo).** D-018 y D-030; referencias con clave compuesta con empresa (D-039.7).

## 10. Criterios de aceptación

Cada criterio cita el requisito que cubre. Las pruebas de aislamiento usan identificador interno y dos empresas (D-063.6).

- **CA-LIN-01 (alta; RF-LIN-002, 003).** Dado un plan Activo y una Persona Activa, cuando un técnico crea la línea 987654321 con ese plan y esa Persona, entonces queda Activa con el cargo del plan y aparece en el historial.
- **CA-LIN-02 (número repetido; RF-LIN-002, RN-LIN-002, RNF-LIN-002).** Dado que existe la línea +51 987654321 Activa, cuando se intenta crear otra con el mismo número (con espacios o guiones distintos), entonces se rechaza indicando dónde está; con dos intentos simultáneos solo uno se guarda.
- **CA-LIN-03 (IMEI desde el equipo; RF-LIN-004, 011, RNF-LIN-007).** Dado un celular con IMEI 356938035643809 asociado a una línea, cuando un usuario con `datos_personales.ver` busca ese IMEI, entonces encuentra la línea y la ficha muestra el IMEI sin permitir editarlo allí; si la Persona del equipo es otra, muestra el aviso.
- **CA-LIN-04 (suspender; RF-LIN-005, RN-LIN-012).** Dado una línea Activa, cuando un técnico la suspende sin motivo, entonces se rechaza; con motivo queda Suspendida y sigue contando su costo.
- **CA-LIN-05 (equipo robado; RF-LIN-010, RN-LIN-010).** Dado una línea Activa con equipo asociado, cuando el equipo pasa a Extraviado o robado, entonces el grupo de avisos recibe el correo del mismo día con el número enmascarado y la línea **sigue Activa** hasta que alguien la suspenda con motivo.
- **CA-LIN-06 (baja antes de permanencia; RF-LIN-006, 009, RN-LIN-022).** Dado una línea con permanencia hasta el 15/01/2027, cuando un técnico la da de baja el 10/12/2026, entonces el sistema pide confirmar el aviso de penalidad y, al confirmar, registra motivo y fecha y desasocia equipo y Persona.
- **CA-LIN-07 (cese sin bloqueo; RF-LIN-017, 020, RN-LIN-009).** Dado una Persona con una línea Activa, cuando se la cesa, entonces el cese se completa, la línea queda con "responsable inactivo", aparece en la ficha de la Persona como pendiente y en el informe de líneas sin movimiento, Jefatura TI recibe el aviso, y **anonimizar a la Persona se rechaza** mientras la línea no se reasigne o se dé de baja.
- **CA-LIN-08 (segunda persona y respaldo; RF-LIN-019, 022, RN-LIN-016, 017).** Dado un límite de aprobación de 1.000 en moneda base, cuando un técnico crea una línea con costo comprometido de 1.000 exactos, entonces no se exige otra persona; con 1.000,01 el costo queda pendiente de confirmación, el mismo técnico no puede confirmarlo, Jefatura TI sí, y solo entonces entra al libro de costos; sin orden de compra ni contrato enlazados queda "Sin respaldo de compra"; con la casilla «contratos» apagada ninguna llamada directa a la API permite la excepción.
- **CA-LIN-09 (permisos y alcance propio; RF-LIN-014, 018, RNF-LIN-001, 006).** Dado un usuario Solo lectura, cuando abre la lista de líneas, entonces no ve importes, ve los números enmascarados y las Personas como `PRS-`; un usuario sin `datos.exportar` ve "Exportar" desactivado con la razón; un Empleado (portal) con Persona vinculada ve solo sus líneas y nunca las de otra Persona de la misma empresa (prueba con dos Personas, cuando exista el portal), y sin Persona vinculada una lista vacía.
- **CA-LIN-10 (planes y cargos; RF-LIN-001, 008, 015, 016, RN-LIN-014, 015).** Dado un plan de 59,90 vigente, cuando el Administrador lo cambia a 69,90 desde el 01/02/2027, entonces el pasado conserva 59,90, las líneas con cargo especial no cambian, los totales se muestran separados por moneda sin un total general, y un Técnico que intenta escribir un cargo especial por pantalla o por llamada directa recibe "Sin permiso".
- **CA-LIN-11 (importación; RF-LIN-013, RNF-LIN-004).** Dado una plantilla de 100 líneas con una fila de número repetido, cuando se confirma, entonces no se carga ninguna y se descarga el reporte con fila, columna y motivo; subir otra vez un archivo ya confirmado se rechaza entero; el archivo corregido entra completo.
- **CA-LIN-12 (reingreso; RF-LIN-007, RN-LIN-021).** Dado una línea de baja cuyo número no usa otra línea, cuando el Administrador hace el reingreso con motivo y reautenticación reciente, entonces vuelve a Activa en el mismo registro; si otra línea ya usa ese número, se rechaza; un Técnico recibe "Sin permiso".
- **CA-LIN-13 (avisos con dos empresas y reloj fijable; RF-LIN-012, RNF-LIN-005, 008).** Dado una línea de la empresa A con permanencia que termina en 30 días y otra de la B que termina en 7, cuando se dispara manualmente el proceso diario con el reloj fijado, dos veces, entonces cada aviso queda en su empresa, con sus destinatarios, una sola vez por elemento, umbral y destinatario, y con el número enmascarado; un corte a la mitad se recupera al reiniciar.
- **CA-LIN-14 (migración; RF-LIN-021, RN-LIN-024, 025).** Dado 120 celulares con "número de línea", 2 de ellos con el mismo número, cuando el Administrador ejecuta el simulacro, entonces el informe muestra los duplicados y no se crea ninguna línea; con los duplicados corregidos se crean las líneas ligadas a equipo y Persona con plan "pendiente de completar", el campo del celular queda de solo lectura con la etiqueta "Lo gestiona el módulo Líneas móviles", y deshacer el lote las anula sin borrar.
- **CA-LIN-15 (aislamiento; RN-LIN-001).** Dado la línea L de la empresa A, cuando un usuario de B pide su identificador interno o busca su número, entonces recibe "No encontrado" y no aparece en listas, totales, exportaciones ni avisos de B; el rol de la aplicación no ve filas de A aunque la consulta omita el filtro.
- **CA-LIN-16 (escritura con referencias cruzadas; RN-LIN-001).** Dado un usuario de B con permiso de asignar, cuando envía por llamada directa una línea de B que apunta a un equipo, un plan o una Persona de A (por identificador interno), entonces recibe "No encontrado" y no se escribe nada.

## 11. Casos límite

- Doble SIM: un equipo con dos líneas Activas; ambas se ven en su ficha.
- Línea sin equipo (SIM en un módem sin registrar): permitida; sale en "sin movimiento" solo si también carece de responsable.
- Un equipo con línea pasa a De baja: la línea se desasocia con aviso; no se borra el equipo (D-019).
- Portabilidad entre operadores: se cambia el plan de la misma línea; el operador cambia con el plan.
- El operador reasigna un número a otra empresa: no se detecta; el registro de baja conserva el historial.
- Persona Anonimizada: no ocurre con líneas a su nombre; las asignaciones cerradas muestran la referencia.
- Plan Inactivo con líneas Activas: siguen; se avisa en el catálogo.
- Monedas distintas entre líneas: los totales se muestran por moneda; nunca un total general.
- Fin de permanencia ya vencido al importar: no genera aviso.
- Reasignar la línea a la Persona que ya la tiene: se ignora sin error.
- Línea con costo sobre el límite en otra moneda: siempre requiere segunda persona.
- Persona vinculada a un Usuario suspendido: sigue siendo responsable (Persona y Usuario son distintos).
- Migración con un número en formato dudoso (sin código de país): se reporta; el Administrador lo corrige antes de confirmar.
- Contrato de proveedor enlazado que ya incluye el valor de varias líneas: `fuente_costo` = contrato y la línea no aporta costo propio.
- Corte de conexión durante la migración o la importación: queda todo o nada.

## 12. Decisiones propuestas y supuestos

Resultado de cada supuesto según D-042, D-057 y D-058.

| ID | Supuesto | Resultado |
|---|---|---|
| SUP-LIN-01 | Fase 2, activable por empresa. | **Confirmado** (D-056, ola B). |
| SUP-LIN-02 | La línea es entidad propia y retira el campo del celular. | **Aceptado con condiciones** (D-042): el número es campo de unidad del Celular en la v1 y el módulo trae el asistente de migración; el campo pasa a solo lectura tras migrar. |
| SUP-LIN-03 | No se guardan PIN ni PUK. | **Aceptado** (D-042.4). |
| SUP-LIN-04 | Solo líneas corporativas. | **Confirmado** (D-006). |
| SUP-LIN-05 | Suspender y dar de baja registran lo hecho, no hablan con el operador. | **Confirmado.** |
| SUP-LIN-06 | Un equipo robado avisa pero no suspende solo. | **Confirmado.** |
| SUP-LIN-07 | La baja de Persona se bloquea con líneas Activas o Suspendidas. | **Cambiado** (D-058, D-061.7): el cese nunca se bloquea; las líneas son pendientes de la persona y se bloquea anonimizar. |
| SUP-LIN-08 | Motivos de suspensión y baja: listas cerradas. | **Confirmado.** |
| SUP-LIN-09 | Avisos de permanencia a 60, 30 y 15 días. | **Cambiado:** se usan los umbrales por defecto de Notificaciones (D-058 fila 3). |
| SUP-LIN-10 | Sin aprobación de altas de líneas. | **Cambiado** (D-043): si el costo comprometido supera el límite, otra persona confirma el costo; el cargo especial exige `lineas.administrar_planes`; no hay aprobación por debajo del límite. |
| SUP-LIN-11 | El número es dato personal en el vínculo con la Persona. | **Confirmado** como dato personal hasta que legal responda (L-09; D-030.6). |
| SUP-LIN-12 | Totales por moneda, sin conversión. | **Confirmado** (D-014, D-049.8). |
| SUP-LIN-13 | Una línea sin responsable no se bloquea al importar. | **Confirmado**; se marca en "sin movimiento". |
| SUP-LIN-14 | Costo comprometido de una línea = cargo mensual vigente con impuesto × meses de permanencia restantes (12 si no hay permanencia); usa la casilla «contratos» del interruptor único y el costo queda "pendiente de confirmación" hasta que otra persona lo confirma. | **Propuesto**, a confirmar por el Gerente de TI (D-043 no define esta medida para líneas). |
| SUP-LIN-15 | Una línea migrada queda con plan "pendiente de completar". | **Propuesto** como diseño del módulo (D-005). |

## 13. Fuera de alcance

- Conexión con el operador (altas, suspensiones, consumo).
- Facturación y conciliación del operador; roaming y excesos.
- Control de uso de datos y minutos.
- Guardar PIN, PUK o contraseñas del portal del operador.
- Líneas personales (BYOD) y teléfonos personales.
- Gestión de equipos celulares (es inventario).
- Varios niveles de aprobación de altas de líneas (D-023).
- Conversión de monedas.
- Acta de entrega de SIM (la hace `entregas-devoluciones`).

## 14. Historial de cambios

| Cambio | Decisión o hallazgo que lo motiva |
|---|---|
| Versión 0.2. Requisitos con columnas ID · Requisito · Cuándo · CA; cada criterio cita su requisito; supuestos resueltos en tabla. | Plan de correcciones, regla 0.2; H-AUD-21; D-057, D-058 |
| SUP-LIN-02 aceptado con condiciones: el número es campo de unidad del Celular en la v1; nuevo asistente de migración (RF-LIN-021, RN-LIN-024, 025, CA-LIN-14): todo o nada, simulacro, deshacible, solo lectura después, valores originales 90 días. Se retiró RN-LIN-023 anterior. | D-042; H-DAT-05, H-AUD-13 |
| El cese de la Persona no se bloquea por líneas: pendientes de la persona, "responsable inactivo", tarea y aviso; se bloquea anonimizar. Se retiró el bloqueo de RN-LIN-009 y se cambió SUP-LIN-07 y CA-LIN-05. | D-061.7, D-034, D-058; H-CUM-15 |
| El cargo especial exige `lineas.administrar_planes`. | D-043.5; H-CUM-03 |
| Segunda persona: costo comprometido sobre el límite lo confirma otra persona (RN-017, "supera" estricto); casilla «contratos» del interruptor único; marca "Sin respaldo de compra"; se retiró SUP-LIN-10 anterior. Costo comprometido definido como supuesto SUP-LIN-14. | D-043, D-031; H-CUM-02, H-QA-09 |
| Permisos migrados a los PS-nn del registro (`docs/registro-permisos.md`); `datos.exportar` (PS-20) y `datos.importar` (PS-21) únicos (se retiraron `lineas.exportar` y `lineas.importar`); Jefatura TI sin exportar; `datos_personales.ver`; `lineas.reingreso` sensible (Administrador y Jefatura TI según el registro); baja y planes según el registro (Jefatura TI ya no da de baja ni fija planes); "Mis líneas" pasa al portal; columna "Empleado (portal)". Pedidos al Analista: `lineas.confirmar_costo`, `lineas.migrar`, `lineas.recibir_avisos`. | D-036, D-037 filas 1, 7, 11; H-SEG-07, H-SEG-08; registro de permisos |
| El número de línea es dato personal hasta que legal diga (L-09): la auditoría no guarda su valor, se ve enmascarado, la API lo limita. | D-030.6, D-063.4; H-CUM-01 |
| Patrón de costo común con `fuente_costo`; totales por moneda, nunca un total general; libro único en `presupuesto-costos`. | D-044.1 a 3, D-049.8 |
| Permanencia calculada al leer; avisos por el motor único de Notificaciones con umbrales por defecto (se retiraron 60/30/15 propios y los recordatorios semanales); el módulo no tiene procesos propios; se retiró la desasociación nocturna. | D-062.2, D-062.3, D-058 fila 3, D-038.4 |
| Normalización del número y unicidad entre no dadas de baja (se mantiene); reingreso con permiso sensible y reautenticación. | Plan de correcciones, fila LIN (9, 10); D-048.2 |
| Importación con el marco único y exportación con la puerta única; se retiró la pantalla de importación propia. | D-050, D-061.1 |
| Textos libres: solo "el campo cambió" en la auditoría y validador común; datos personales declarados en la sección 6; "Persona anonimizada 0042"; Persona Cesada. | D-030, D-061.3, D-063.2, D-049.5 |
| Pruebas nuevas: procesos con dos empresas y reloj fijable (CA-LIN-13), borde exacto del límite (CA-LIN-08), escritura con referencias cruzadas (CA-LIN-16), aislamiento por identificador interno y rol de la aplicación (CA-LIN-15), permiso denegado de cargo especial y reingreso. | D-039.6, D-063.6, D-038.8; QA y Seguridad |
| Prefijos `PAN-LIN-nn`; vocabulario "Cliente (CEO)", "usted". | D-049 |

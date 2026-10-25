# Módulo: Líneas móviles y planes (LIN)

**Versión:** 0.1 · **Autor:** Analista de Negocio, escuadrón B · **Estado:** borrador para revisión del Gerente de TI
**Base:** decisiones D-001 a D-029 (`docs/equipo/decisiones.md`), en especial D-004, D-005, D-006, D-009, D-012, D-014, D-018, D-019, D-021 y D-024.

---

## 1. Propósito, alcance y fase

**Propósito.** Saber qué líneas móviles paga la empresa, con qué plan y operador, quién las usa, en qué equipo están, cuánto cuestan al mes y cuándo se suspenden o se dan de baja. Evitar pagar líneas de personas que ya se fueron o de equipos robados.

**Entra**
- Planes del operador (catálogo por empresa) y sus cargos mensuales.
- Líneas: número, plan, estado, Persona que la usa, equipo asociado, centro de costo.
- Suspensión (con motivo) y baja (con motivo), con historial de cada cambio.
- Costo mensual por línea, por plan, por centro de costo y por Persona.
- Avisos de fin de permanencia y de equipo robado con línea activa.
- Importación inicial de las líneas actuales y exportación.

**No entra**
- Conexión con el operador: suspender o dar de baja en la plataforma **registra** lo hecho; la acción real la hace TI con el operador.
- Facturas, consumo real, roaming y conciliación contra la factura del operador.
- Líneas personales de empleados: la plataforma no guarda teléfonos personales (D-006).
- Guardar PIN o PUK de la SIM.
- Gestión del equipo celular: es un activo del inventario (el IMEI es dato de la unidad, D-005).

**Fase.** [SUPUESTO] SUP-LIN-01: **Fase 2, después de la v1.** Requiere Etapa 2 (Personas), Etapa 4 (inventario con celulares) y el módulo `notificaciones`. Cada empresa puede activarlo o no.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Línea** | Un servicio móvil con número telefónico contratado por la empresa (ej. +51 987 654 321). |
| **Operador** | La empresa de telefonía (ej. Claro, Movistar, Entel). Es un proveedor del catálogo. |
| **Plan** | Condiciones comerciales de una línea: nombre, cargo fijo mensual, datos incluidos. |
| **Cargo especial** | Monto mensual distinto al del plan (descuento o promoción) para una línea concreta. |
| **Equipo asociado** | El celular, tablet o módem (activo del inventario) donde está la SIM. Su **IMEI** es dato de la unidad, no de la línea. |
| **Responsable de la línea** | La Persona que la usa (D-006). No necesita ser Usuario de la plataforma. |
| **SIM / ICCID** | Tarjeta de la línea y su número impreso. |
| **Permanencia** | Plazo mínimo que la empresa se comprometió con el operador; darla de baja antes suele tener penalidad. |
| **Suspensión** | Línea temporalmente sin uso (robo, cese temporal, falta de pago). Puede seguir costando. |
| **Baja** | La línea ya no se paga ni se usa. El registro se conserva (D-019). |
| **Reingreso** | Reactivar una línea dada de baja (misma idea que D-009.3). |
| **Costo mensual vigente** | Cargo especial si existe; si no, el cargo del plan. |

## 3. Roles y permisos

Alcance: **Todo** o **Propio** (las líneas de la Persona vinculada al usuario). Valores predeterminados, editables por empresa.

| Acción | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver líneas y planes (sin costos ni personas) | `lineas.ver` | Todo | Todo | Todo | — | Propio | Todo |
| Ver costos | `precios.ver` | Sí | Sí | — | — | — | — |
| Ver quién usa cada línea | `datos-personales.ver` | Sí | Sí | Sí | — | Propio | — |
| Crear y editar líneas | `lineas.crear` / `lineas.editar` | Sí | — | Sí | — | — | — |
| Asignar a Persona y asociar equipo | `lineas.asignar` | Sí | — | Sí | — | — | — |
| Suspender y reactivar | `lineas.suspender` | Sí | Sí | Sí | — | — | — |
| Dar de baja | `lineas.baja` | Sí | Sí | — | — | — | — |
| Reingreso de una línea de baja | `lineas.reingreso` | Sí | — | — | — | — | — |
| Crear y cambiar planes y cargos | `lineas.administrar-planes` | Sí | Sí | — | — | — | — |
| Importar | `lineas.importar` | Sí | — | — | — | — | — |
| Exportar | `lineas.exportar` | Sí | Sí | — | — | — | — |
| Configurar avisos | `lineas.configurar` | Sí | — | — | — | — | — |
| Recibir avisos | `lineas.recibir-avisos` | Sí | Sí | Sí | — | — | — |
| Ver auditoría del módulo | `auditoria.ver` | Sí | Sí | — | — | — | — |

Separación de funciones: quien **fija los precios** (`lineas.administrar-planes`) no es quien **opera** las líneas por defecto (Técnico); Jefatura TI da de baja pero no crea. Todo se comprueba en el servidor. Un rol nuevo parte sin permisos.

## 4. Requisitos

### 4.1 Requisitos funcionales

- **RF-LIN-001** Mantener el catálogo de planes: operador, nombre, tipo (pospago, control, prepago), cargo mensual sin impuesto, % de impuesto, moneda, datos incluidos (texto), permanencia en meses y estado (Activo/Inactivo).
- **RF-LIN-002** Registrar una línea con: número, plan, ICCID (opcional), fecha de alta, fin de permanencia, centro de costo, cargo especial (opcional) y notas.
- **RF-LIN-003** Asignar la línea a una Persona (responsable) y cambiarla; cada cambio queda en el historial con fechas.
- **RF-LIN-004** Asociar la línea a un equipo del inventario (celular, tablet, módem) y desasociarla; el IMEI se **lee** del equipo, no se escribe en la línea.
- **RF-LIN-005** Suspender una línea con motivo (de una lista) y reactivarla.
- **RF-LIN-006** Dar de baja una línea con motivo; la línea se desasocia del equipo y de la Persona, y el historial se conserva.
- **RF-LIN-007** Reingreso de una línea de baja, con motivo y permiso especial.
- **RF-LIN-008** Mostrar el costo mensual vigente de cada línea y los totales por plan, centro de costo, operador y Persona.
- **RF-LIN-009** Avisar al dar de baja antes del fin de permanencia ("puede haber penalidad del operador"); la plataforma no calcula la penalidad.
- **RF-LIN-010** Avisar cuando un equipo asociado pasa a Extraviado o robado, o De baja, y la línea sigue Activa (sugerir suspender o dar de baja).
- **RF-LIN-011** Avisar cuando la Persona que tiene el equipo es distinta de la responsable de la línea.
- **RF-LIN-012** Avisos por correo de fin de permanencia y de líneas sin responsable o sin equipo.
- **RF-LIN-013** Importar líneas desde la plantilla (vista previa, todo o nada, D-020).
- **RF-LIN-014** Buscar por número, ICCID, IMEI del equipo asociado, Persona o plan; filtrar por estado, operador, plan, centro de costo; exportar (D-021).
- **RF-LIN-015** Mostrar el historial completo de una línea: estados, responsables, equipos, planes y cargos.
- **RF-LIN-016** Cambiar el plan de una línea con fecha de efecto; el cambio queda en el historial.
- **RF-LIN-017** Listar "pendientes de la Persona" (líneas activas) para que `onboarding-offboarding` los muestre.
- **RF-LIN-018** "Mis líneas": cada usuario con Persona vinculada ve sus líneas.
- **RF-LIN-019** Exponer a `presupuesto-costos` el costo mensual vigente por línea, con moneda y centro de costo.
- **RF-LIN-020** Informe de líneas "sin movimiento": activas sin responsable, o con responsable inactivo, o sin equipo.

### 4.2 Reglas de negocio

- **RN-LIN-001** Todo dato lleva empresa. Plan, Persona, equipo, centro de costo y operador deben ser de la misma empresa; un identificador de otra empresa responde "no encontrado" (D-025, D-021.5).
- **RN-LIN-002** El número se guarda normalizado (solo dígitos, con código de país). Es **único por empresa entre las líneas que no están de baja**; un número repetido se rechaza con aviso de dónde está. El ICCID, si se escribe, es único por empresa.
- **RN-LIN-003** Una línea de baja conserva su registro. Un número de baja puede usarlo una línea nueva; en ese caso la línea de baja ya no puede tener reingreso.
- **RN-LIN-004** Un plan Inactivo no se puede usar en líneas nuevas; sigue visible en las existentes. Un plan no se borra (D-008.6, D-019).
- **RN-LIN-005** Cada línea tiene **un solo plan vigente** y **una sola Persona responsable** a la vez. Un equipo puede tener varias líneas (doble SIM); una línea tiene un solo equipo a la vez.
- **RN-LIN-006** El equipo asociado debe ser un activo en estado En stock, Asignado o En reparación; no se asocia a uno De baja o Extraviado o robado (D-012).
- **RN-LIN-007** El responsable debe ser una Persona activa. Una línea Activa **debe** tener responsable; si no lo tiene, aparece en el informe de la RF-LIN-020.
- **RN-LIN-008** Si el responsable de la línea y la Persona que tiene el equipo difieren, es solo un aviso; no se bloquea.
- **RN-LIN-009** No se puede dar de baja a una Persona con líneas Activas o Suspendidas a su nombre: hay que reasignarlas o darlas de baja primero (misma lógica de D-006 con activos; regla RN-PER-012 del escuadrón D).
- **RN-LIN-010** Un equipo que pasa a Extraviado o robado **no** suspende la línea solo: se avisa y TI decide (la acción real es con el operador).
- **RN-LIN-011** Los motivos de suspensión son una lista cerrada: Robo o extravío del equipo; Cese temporal del uso; Falta de pago; Otro (con texto obligatorio). Los motivos de baja: Persona dejó la empresa; Equipo dado de baja; Ya no se necesita; Cambio de operador o plan; Otro (con texto).
- **RN-LIN-012** Baja, suspensión, reactivación y reingreso exigen motivo (D-012.4).
- **RN-LIN-013** Una línea Suspendida cuesta el cargo vigente salvo que se informe un "cargo en suspensión" distinto.
- **RN-LIN-014** Costo mensual vigente = cargo especial si existe, si no el cargo del plan. Importe sin impuesto con 4 decimales exactos, % de impuesto y moneda de 3 letras; una moneda por línea y sin conversión (D-014). Los totales se calculan por moneda, nunca se suman monedas distintas.
- **RN-LIN-015** Los costos se ven solo con `precios.ver`. Quién usa cada línea se ve solo con `datos-personales.ver` (D-004.4).
- **RN-LIN-016** Cambiar el cargo de un plan **no cambia** el pasado: se guarda con fecha de efecto, y las líneas con cargo especial no se afectan.
- **RN-LIN-017** Solo se registran líneas contratadas por la empresa. No se guarda el teléfono personal de nadie, ni documento de identidad, ni dirección (D-006).
- **RN-LIN-018** Los correos de aviso no incluyen importes ni nombres de personas. El número aparece completo solo dentro de la plataforma; en el correo se enmascara (`+51 ••• ••• 321`).
- **RN-LIN-019** Nada con historial se borra: líneas y planes se dan de baja o se desactivan. Solo un registro creado por error, sin ningún cambio posterior, se anula con motivo.
- **RN-LIN-020** El reingreso exige `lineas.reingreso` y motivo; es el mismo registro, nunca un duplicado (D-009.3).
- **RN-LIN-021** Al anonimizar una Persona (D-024), el historial de la línea conserva "Persona dada de baja 0042"; el número de la línea sigue visible porque es de la empresa.
- **RN-LIN-022** Dar de baja una línea antes del fin de permanencia exige confirmar el aviso de penalidad.
- **RN-LIN-023** Si la línea se importa con un equipo cuyo IMEI no existe en el inventario, la fila falla; no se crea el equipo.

### 4.3 Requisitos de calidad

- **RNF-LIN-001** Una lista de 5.000 líneas muestra su primera página en 2 segundos o menos (95 %). Volumen supuesto hasta tener la cifra real (pendiente #4).
- **RNF-LIN-002** Dos personas que intentan registrar el mismo número a la vez: exactamente una lo logra.
- **RNF-LIN-003** El 100 % de los cambios de estado, responsable, equipo, plan y cargo deja una entrada de auditoría con valor anterior y nuevo.
- **RNF-LIN-004** Importar 2.000 líneas con vista previa termina en 30 segundos o menos.
- **RNF-LIN-005** Los avisos se generan antes de las 08:00 hora de la empresa y sin repetir el mismo aviso el mismo día.
- **RNF-LIN-006** La lista y la ficha son usables en celular y teclado; el estado se muestra con texto, no solo color (D-021.1).
- **RNF-LIN-007** Una búsqueda por IMEI o número responde en 2 segundos o menos.

## 5. Estados y transiciones

### 5.1 Línea

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Por activar | `lineas.crear` | Alta pedida al operador, aún sin SIM activa |
| (nueva) | Activa | `lineas.crear` | Línea ya en uso (típico en importación) |
| Por activar | Activa | `lineas.editar` | Responsable asignado |
| Por activar | Dada de baja | `lineas.baja` | Pedido cancelado; motivo |
| Activa | Suspendida | `lineas.suspender` | Motivo (RN-LIN-011) |
| Suspendida | Activa | `lineas.suspender` | Motivo |
| Activa, Suspendida | Dada de baja | `lineas.baja` | Motivo; aviso de permanencia (RN-LIN-022) |
| Dada de baja | Activa | `lineas.reingreso` | Motivo; el número no lo usa otra línea (RN-LIN-003) |

No hay otras transiciones. Al pasar a Dada de baja se cierran el responsable y el equipo asociado, con fecha, en el historial.

### 5.2 Plan

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Activo | `lineas.administrar-planes` | Operador, nombre y cargo |
| Activo | Inactivo | `lineas.administrar-planes` | Líneas existentes siguen usándolo |
| Inactivo | Activo | `lineas.administrar-planes` | — |

## 6. Datos

**Plan.** Empresa; operador (proveedor del catálogo); nombre; tipo; cargo mensual sin impuesto; % de impuesto; moneda; datos incluidos (texto); permanencia en meses; estado. Único: operador + nombre por empresa (sin distinguir mayúsculas).

**Cargo del plan (historial).** Plan; importe; desde qué fecha; quién lo cambió.

**Línea.** Empresa; identificador interno estable; número normalizado (único entre las no dadas de baja); ICCID (opcional, único); plan vigente; estado; fecha de alta; fin de permanencia; centro de costo; cargo especial (importe, moneda); cargo en suspensión (opcional); notas.

**Asignación de la línea.** Línea; Persona; desde; hasta; quién asignó. Solo una abierta por línea.

**Asociación línea-equipo.** Línea; activo; desde; hasta; quién la hizo. Solo una abierta por línea.

**Cambio de estado.** Línea; estado anterior y nuevo; motivo (lista y texto); fecha; quién.

**Cambio de plan.** Línea; plan anterior y nuevo; fecha de efecto; quién.

**Configuración de la empresa.** Días de aviso de fin de permanencia (por defecto 60, 30 y 15); destinatarios.

**Se audita** (D-018): alta y cambios de líneas y planes con antes y después; cambios de cargo; asignaciones; asociaciones de equipo; suspensiones, bajas y reingresos; importaciones; exportaciones; cambios de configuración; consultas a la auditoría del módulo. No se guardan teléfonos personales ni PIN o PUK.

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Lista de líneas | Buscar, filtrar y exportar | Técnico |
| Ficha de la línea | Datos, responsable, equipo, costo e historial | Técnico |
| Alta / edición de línea | Formulario | Técnico |
| Asignar responsable y equipo | Buscar Persona y equipo; ver avisos de diferencia | Técnico |
| Suspender / dar de baja | Diálogo con motivo y aviso de permanencia | Técnico / Jefatura TI |
| Catálogo de planes | Alta y cambio de cargos con fecha | Jefatura TI |
| Costos de líneas | Totales por plan, centro de costo, operador y Persona | Jefatura TI |
| Líneas sin movimiento | Sin responsable, responsable inactivo, sin equipo | Técnico |
| Importación de líneas | Plantilla, simulacro y confirmación | Administrador |
| Mis líneas | Líneas que tengo asignadas | Solicitante |
| Configuración de avisos | Días y destinatarios | Administrador |

## 8. Notificaciones y automatismos

Declaramos las reglas; `notificaciones` envía, evalúa una vez al día y no repite (acuerdo con el escuadrón C). Los textos usan solo nombre del elemento, fecha y días.

| Cuándo | A quién | Qué dice |
|---|---|---|
| 60, 30 y 15 días antes del fin de permanencia | Grupo con `lineas.recibir-avisos` | "La línea +51 ••• ••• 321 termina su permanencia el 15/01/2027." |
| Un equipo pasa a Extraviado o robado y su línea sigue Activa | Mismo grupo, el mismo día | "El equipo asociado a la línea +51 ••• ••• 321 fue reportado como extraviado o robado. Revise si debe suspenderla." |
| Una línea Activa queda sin responsable (porque la Persona fue desactivada o por importación) | Mismo grupo | "La línea +51 ••• ••• 321 no tiene responsable." Se repite cada 7 días hasta resolverla (máximo 4). |
| Se da de baja una línea antes de su permanencia | Jefatura TI | "Se dio de baja la línea +51 ••• ••• 321 antes de su fin de permanencia (15/01/2027)." |
| Todas las noches | Automático | Marcar líneas sin responsable; recalcular totales; desasociar equipos de baja. |

Depende del servicio de correo ya escalado al CEO; no agrega gasto.

## 9. Integración con el núcleo y otros módulos

- **Personas (D).** El responsable es una Persona. La baja de Persona se bloquea con líneas Activas o Suspendidas (RN-LIN-009, RN-PER-012). LIN expone "pendientes de la Persona" a `onboarding-offboarding`, que los muestra con enlace.
- **Inventario.** El equipo asociado es un activo; el IMEI se lee de su campo de unidad. Cuando el estado del equipo cambia, LIN avisa (RF-LIN-010). `entregas-devoluciones` no mueve la línea: si cambia la Persona del equipo, solo se muestra el aviso de RF-LIN-011.
- **Proveedores (PRV, escuadrón A).** El operador sale del catálogo de proveedores. Un contrato de PRV puede enlazarse (opcional); PRV es dueño del contrato y su valor.
- **Presupuesto y reportes (F).** Leen costo mensual vigente por línea, plan y centro de costo, con moneda; no escriben. Si hay orden de compra enlazada, cuenta la orden.
- **Notificaciones (C).** Ejecutan el envío. `mesa-de-ayuda` puede originar un pedido de línea, pero crear la línea es acción de este módulo.
- **CMDB (E).** Crea un elemento de configuración por línea, solo con referencia, nombre y estado. LIN da un identificador estable y avisa cuando una línea pasa a Dada de baja.
- **Auditoría (núcleo).** D-018.
- **Datos personales.** El vínculo línea-Persona es dato personal (D-024): se anonimiza con la Persona.

## 10. Criterios de aceptación

- **CA-LIN-01 (alta).** Dado un plan Activo y una Persona activa, cuando un técnico crea la línea 987654321 con ese plan y esa Persona, entonces la línea queda Activa con el cargo del plan y aparece en el historial.
- **CA-LIN-02 (número repetido).** Dado que existe la línea +51 987654321 Activa, cuando se intenta crear otra con el mismo número (con espacios o guiones distintos), entonces se rechaza indicando dónde está; con dos intentos simultáneos solo uno se guarda.
- **CA-LIN-03 (IMEI desde el equipo).** Dado un celular con IMEI 356938035643809 asociado a una línea, cuando se busca ese IMEI, entonces se encuentra la línea y la ficha muestra el IMEI sin permitir editarlo allí.
- **CA-LIN-04 (equipo robado).** Dado una línea Activa con equipo asociado, cuando el equipo pasa a Extraviado o robado, entonces el grupo de avisos recibe el correo del mismo día y la línea **sigue Activa** hasta que alguien la suspenda con motivo.
- **CA-LIN-05 (baja de Persona bloqueada).** Dado una Persona con una línea Activa, cuando se intenta darla de baja, entonces se rechaza con la lista de sus líneas; al dar de baja la línea (con motivo) se permite continuar.
- **CA-LIN-06 (baja antes de permanencia).** Dado una línea con permanencia hasta el 15/01/2027, cuando Jefatura TI la da de baja el 10/12/2026, entonces el sistema pide confirmar el aviso de penalidad y, al confirmar, registra motivo, fecha y desasocia equipo y Persona.
- **CA-LIN-07 (permiso denegado).** Dado un usuario Técnico sin `lineas.baja`, cuando intenta dar de baja una línea por pantalla o por llamada directa al servidor, entonces recibe "Sin permiso" y la línea no cambia.
- **CA-LIN-08 (aislamiento).** Dado la línea L de la empresa A, cuando un usuario de B pide su identificador o busca su número, entonces recibe "No encontrado" y la línea no aparece en listas, totales, exportaciones ni avisos de B.
- **CA-LIN-09 (costos y personas ocultos).** Dado un usuario Solo lectura, cuando abre la lista de líneas, entonces no ve importes ni la columna de responsable; con `precios.ver` y `datos-personales.ver` activados sí.
- **CA-LIN-10 (cambio de cargo).** Dado un plan de 59,90 vigente, cuando Jefatura TI lo cambia a 69,90 desde el 01/02/2027, entonces las líneas ya cobradas conservan el costo anterior en su historial y las líneas con cargo especial no cambian.
- **CA-LIN-11 (importación).** Dado una plantilla de 100 líneas con una fila de número repetido, cuando se confirma, entonces no se carga ninguna y se descarga el reporte con fila, columna y motivo; subir la corregida dos veces no duplica.
- **CA-LIN-12 (reingreso).** Dado una línea dada de baja cuyo número no usa otra línea, cuando el Administrador hace el reingreso con motivo, entonces vuelve a Activa en el mismo registro; si otra línea ya usa ese número, el reingreso se rechaza.

## 11. Casos límite

- Doble SIM: un equipo con dos líneas Activas; ambas se muestran en su ficha.
- Línea sin equipo (SIM en un módem sin registrar): permitido; sale en "sin movimiento" solo si también carece de responsable.
- Eliminar un equipo con línea: el equipo no se borra (D-019); si pasa a De baja, la línea se desasocia con aviso.
- Cambio de operador conservando el número (portabilidad): se cambia el plan de la misma línea; el operador cambia con el plan.
- Número que el operador reasigna a otra empresa: no se detecta; el registro de baja conserva el historial.
- Persona anonimizada: el historial muestra la referencia anónima (RN-LIN-021).
- Plan Inactivo con líneas Activas: siguen funcionando; se avisa en el catálogo.
- Moneda distinta entre líneas: los totales se muestran por moneda.
- Fin de permanencia ya vencido al importar: no genera aviso.
- Reasignar una línea a la Persona que ya la tiene: se ignora sin error.
- Importación con IMEI inexistente: la fila falla (RN-LIN-023).
- Persona vinculada a un Usuario suspendido: sigue siendo responsable de la línea (Persona y Usuario son distintos).

## 12. Decisiones propuestas y supuestos

- **SUP-LIN-01** [SUPUESTO] Fase 2, activable por empresa.
- **SUP-LIN-02** [SUPUESTO] La línea es una entidad propia, no un campo del celular. Motivo: una línea cambia de equipo y de Persona, tiene costo y estados propios. Si el módulo está activo, la categoría Celulares **no** usa el campo de unidad "número de línea" de D-005; el número se muestra desde la línea asociada. Revisar con el Arquitecto y el Ingeniero de Datos.
- **SUP-LIN-03** [SUPUESTO] No se guardan PIN ni PUK. Motivo: son secretos; evitar guardarlos reduce riesgo y trabajo. Se reevalúa si el equipo lo pide, con el mismo tratamiento que las claves de licencia.
- **SUP-LIN-04** [SUPUESTO] Solo líneas corporativas (D-006: sin teléfonos personales).
- **SUP-LIN-05** [SUPUESTO] Suspender y dar de baja registran lo hecho, no hablan con el operador. Una integración con operadores sería un proyecto aparte (`integraciones-api`).
- **SUP-LIN-06** [SUPUESTO] Un equipo robado avisa pero no suspende solo. Motivo: la suspensión real es con el operador y un error la interrumpiría.
- **SUP-LIN-07** [SUPUESTO] La baja de Persona se bloquea con líneas Activas o Suspendidas (acuerdo con escuadrón D, RN-PER-012). Motivo: una línea sin responsable sigue costando cada mes.
- **SUP-LIN-08** [SUPUESTO] Motivos de suspensión y baja: listas cerradas fijas.
- **SUP-LIN-09** [SUPUESTO] Avisos de permanencia a 60, 30 y 15 días; editables.
- **SUP-LIN-10** [SUPUESTO] Sin aprobación de altas de líneas; la separación de funciones es entre quien fija precios (planes) y quien opera. Motivo: costo bajo por línea; se audita todo cambio. Revisar con Auditor de Cumplimiento.
- **SUP-LIN-11** [SUPUESTO] El número de línea asignado a una Persona es dato personal en el vínculo, no el número en sí (L11 de Cumplimiento). **Pregunta legal pendiente:** si el país considera el número corporativo asignado como dato personal. Ver "Legal" en decisiones.md.
- **SUP-LIN-12** [SUPUESTO] Los totales se calculan por moneda, sin conversión (D-014).
- **SUP-LIN-13** [SUPUESTO] Una línea sin responsable no se bloquea al importar; entra y se marca.

## 13. Fuera de alcance

- Conexión con el operador (altas, suspensiones, consumo).
- Facturación y conciliación del operador; roaming y excesos.
- Control de uso de datos y minutos.
- Guardar PIN, PUK o contraseñas del portal del operador.
- Líneas personales (BYOD) y teléfonos personales.
- Gestión de equipos celulares (es inventario).
- Flujo de aprobación de altas de líneas.
- Conversión de monedas.
- Impresión de actas de entrega de SIM (el acta de entrega es de `entregas-devoluciones`).

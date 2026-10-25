# Módulo: Presupuesto y costos de TI (PRE)

**Versión:** 0.3 (aplicación de D-065 a D-076, escuadrón F) · **Fecha:** 25/10/2026 · **Autor:** analista-funcional
**Base:** `CLAUDE.md`, `docs/equipo/decisiones.md` (D-001 a D-064), `docs/equipo/plan-correcciones.md`, documento funcional v0.2.
**Estado:** propuesta. **[SUPUESTO]** = lo confirma el Gerente de TI. **[ESCALAR AL CEO]** = dinero, legal o irreversible.
**Leyenda de "Cuándo":** la columna usa las tres palabras del núcleo (`v1, Etapa N`, `Fase 2`, `Fase 3`). Todo PRE es **Fase 3**; la letra entre paréntesis dice la parte: **(A)** = PRE-A (ola F; puede adelantarse si el Gerente de TI lo decide), **(B)** = PRE-B (después de PRV-B, LIC, LIN, DOM y GAR-B). Las preparaciones del núcleo (`v1, Etapa N`) están en la sección 1.

---

## 1. Propósito, alcance y fase

**Propósito.** Saber cuánto se planificó gastar, cuánto se gastó o está comprometido, qué renovaciones vienen y cuánto valen, de forma referencial, los equipos con el paso del tiempo.

**Entra**
1. Presupuesto anual por centro de costo y rubro, en una moneda por presupuesto, con modificaciones aprobadas.
2. **El libro único de costos** (D-044): PRE es el dueño. Recibe el costo de órdenes de compra (OC), recepciones, contratos, licencias, líneas, dominios y certificados, garantías y mantenimiento, órdenes de servicio (OS) y gasto manual.
3. Alertas de sobre-ejecución, aviso en la aprobación de OC y cierre mensual.
4. Proyección de renovaciones y plan de reposición de equipos.
5. Depreciación de gestión (línea recta, por categoría de naturaleza "equipo físico").

**No entra:** contabilidad oficial, impuestos, conversión de monedas, pagos (sección 13).

**Fase (D-056).** PRE-A es de la Fase 3, ola F. PRE-B llega después de los módulos de los que lee costos. Nada de PRE se construye antes de que el Cliente (CEO) apruebe la Etapa 7, salvo decisión del Gerente de TI.
**Preparaciones del núcleo en la v1** (el diseño se hace desde la Etapa 1): tipo de autor "sistema" (Etapa 1); centro de costo con Persona responsable y código externo, y moneda base de la empresa (Etapas 1 y 2); costo y moneda del activo corregibles (Etapa 4); centro de costo en la OC (Etapa 5) y el espacio reservado en la pantalla de aprobación de la OC (RF-OC-051 del núcleo, Etapa 5); campo `fuente_costo` en toda obligación de pago.

---

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Presupuesto** | Plan de gasto de un año fiscal, en una sola moneda. Tiene líneas. Prefijo `PPT-`. |
| **Línea** | Monto anual de un centro de costo y un rubro. |
| **Rubro** | Tipo de gasto: cada categoría de SKU, más rubros fijos del sistema (Contratos, Licencias, Líneas móviles, Dominios y certificados, Garantías y mantenimiento, Servicios). |
| **Centro de costo** | Catálogo único del núcleo (D-040), con Persona responsable opcional. |
| **Libro de costos** | Lista única de hechos de costo. No se edita ni se borra; se corrige con un registro contrario. |
| **Fuente de costo** (`fuente_costo`) | De dónde viene un costo: orden de compra, contrato o propia. |
| **Presupuesto vigente** | Original más modificaciones aprobadas. |
| **Ejecutado** | Suma del libro del periodo, sin impuesto, en la moneda del presupuesto. |
| **Comprometido** | Cantidad pendiente de recibir de OC aprobadas, emitidas o recibidas parcialmente, por su precio sin impuesto. |
| **Disponible** | Vigente menos ejecutado menos comprometido. Puede ser negativo. |
| **Ejecución (%)** | (Ejecutado + comprometido) entre el vigente. |
| **Proyección de cierre** | Ejecutado + comprometido + renovaciones y cuotas previstas hasta fin del año fiscal. |
| **Límite de aprobación** | Monto de la empresa (RN-017 del núcleo) medido **con impuesto, en moneda base**. Es una medida distinta del costo presupuestario, que es **sin impuesto**. |
| **Vida útil / valor residual** | Meses en que se reparte el valor de un equipo; porcentaje del costo que queda al final. |
| **Depreciación de gestión** | Reparto mensual del costo. **Referencial, no contable ni tributaria.** |
| **Cierre de periodo** | Congelar un mes. |

---

## 3. Roles y permisos

Solo se usan nombres y PS-nn de `docs/registro-permisos.md` (D-036); "propio" lo define el resolvedor del registro. Para ver cifras hacen falta `presupuesto.ver` y `precios.ver`. Alcance: **todo** o **propio** (centros de costo de los que la Persona vinculada al usuario es responsable; sin Persona vinculada, lista vacía).

| Acción | Permiso (PS) | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver presupuestos, ejecución, proyección, depreciación | `presupuesto.ver` (PS-112, todo / propio) + `precios.ver` (PS-23) | Sí | Sí | No | No | No | No |
| Crear y editar borradores | `presupuesto.crear_editar` (PS-113) | Sí | No | No | No | No | No |
| Aprobar o rechazar presupuesto, modificación, gasto o reclasificación | `presupuesto.aprobar` (PS-114; A, No) | Sí | Sí | No | No | No | No |
| Anular borrador, pendiente o rechazado | `presupuesto.anular` (PS-115) | Sí | Sí | No | No | No | No |
| Registrar gasto manual | `presupuesto.gasto_registrar` (PS-116; A, No) | Sí | No | No | No | No | No |
| Anular gasto manual | `presupuesto.gasto_anular` (PS-117; A, No) | Sí | Sí | No | No | No | No |
| Reclasificar un costo | `presupuesto.reclasificar` (PS-118; A, No) | Sí | No | No | No | No | No |
| Cerrar un periodo | `presupuesto.cerrar_periodo` (PS-119) | Sí | Sí | No | No | No | No |
| Configurar umbrales, año fiscal, parámetros de depreciación | `presupuesto.configurar` (PS-120) | Sí | No | No | No | No | No |
| Corregir el costo de un activo (fila del núcleo) | `activos.corregir_costo` (PS-51; sensible) | Sí | No | No | No | No | No |
| Exportar cifras (puerta única del núcleo) | `datos.exportar` (PS-20; sensible) | Sí | No | No | No | No | No |

Notas
- **Empleado (portal): no aplica.** PRE no tiene ninguna pantalla ni dato para la plantilla "Empleado (portal)".
- Los valores por rol y los controles (A = auditoría de cada uso, No = nunca sobre lo propio) son los del registro de permisos. **Son sensibles** (segunda verificación obligatoria, D-068) `presupuesto.aprobar` (PS-114), `presupuesto.gasto_registrar` (PS-116), `presupuesto.gasto_anular` (PS-117) y `presupuesto.reclasificar` (PS-118), además de `activos.corregir_costo` y `datos.exportar` del núcleo. Por eso Jefatura TI, que aprueba presupuestos, necesita segunda verificación. En el registro, Jefatura TI no crea presupuestos ni registra gastos ni reclasifica; solo aprueba, anula, anula gastos y cierra periodos.
- El **responsable de un centro de costo** es una Persona, no un rol. Si tiene Usuario vinculado, recibe las alertas de su centro (sin importes si no tiene `presupuesto.ver`). Si no, van a Jefatura TI.
- Las reglas de separación de funciones aplican también al Administrador (D-004.8). Todo se comprueba en el servidor.

---

## 4. Requisitos

### 4.1 Funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-PRE-001 | Crear un presupuesto de un año fiscal con nombre, moneda y líneas (centro de costo × rubro × monto anual). | Fase 3 (A) | CA-PRE-01 |
| RF-PRE-002 | Copiar un presupuesto anterior como base, con un porcentaje general de ajuste opcional. | Fase 3 (A) | CA-PRE-21 |
| RF-PRE-003 | Enviar el presupuesto a aprobación; lo aprueba o rechaza (con motivo) una persona distinta de quien lo creó o editó. | Fase 3 (A) | CA-PRE-02 |
| RF-PRE-004 | Modificar un presupuesto aprobado solo con una modificación (aumento, disminución o traspaso entre líneas) con motivo y aprobación. | Fase 3 (A) | CA-PRE-02 |
| RF-PRE-005 | Mostrar por centro de costo y rubro: original, vigente, ejecutado, comprometido, disponible y ejecución %. | Fase 3 (A) | CA-PRE-03 |
| RF-PRE-006 | Mostrar cada cifra hasta su documento de origen, si el usuario puede ver ese documento. | Fase 3 (A) | CA-PRE-03 |
| RF-PRE-007 | Al confirmarse una recepción de OC, escribir su costo en el libro **en la misma operación**. | Fase 3 (A) | CA-PRE-03 |
| RF-PRE-008 | Calcular el comprometido de las OC aprobadas, emitidas o recibidas parcialmente. | Fase 3 (A) | CA-PRE-03 |
| RF-PRE-009 | Revertir el costo cuando se revierte una recepción (D-017) y liberar el comprometido al cerrar una OC con faltante. | Fase 3 (A) | CA-PRE-04 |
| RF-PRE-010 | Recibir el costo de las OS cerradas con costo (el costo vive en la OS). | Fase 3 (A) | CA-PRE-14 |
| RF-PRE-011 | Un trabajo diario convierte las obligaciones recurrentes (contratos, licencias, líneas, dominios y certificados, garantías y mantenimiento) en filas del libro, con la regla de fuente única. | Fase 3 (B) | CA-PRE-14, CA-PRE-17 |
| RF-PRE-012 | Registrar gasto manual (rubro, centro, fecha, importe sin impuesto, % de impuesto, moneda, descripción, motivo) y anularlo con otro registro. | Fase 3 (A) | CA-PRE-15 |
| RF-PRE-013 | Reclasificar un costo a otro centro o rubro, con motivo; genera un registro contrario y uno nuevo. | Fase 3 (A) | CA-PRE-15 |
| RF-PRE-014 | Alertar cuando la ejecución llegue a los umbrales de atención y excedido, por línea, centro y presupuesto. | Fase 3 (A) | CA-PRE-06 |
| RF-PRE-015 | En la pantalla de aprobación de la OC (espacio reservado por RF-OC-051 del núcleo) mostrar el efecto en el presupuesto y exigir una justificación escrita si lo excede, sin segundo nivel. | Fase 3 (A) | CA-PRE-07 |
| RF-PRE-016 | Cerrar un periodo mensual: congela ejecutado, comprometido y cuotas de depreciación de ese mes. | Fase 3 (A) | CA-PRE-09 |
| RF-PRE-017 | Proyección de renovaciones de los próximos 12 meses por mes, rubro y moneda, desde los vencimientos y el último importe conocido. | Fase 3 (B) | CA-PRE-22 |
| RF-PRE-018 | Porcentaje de incremento esperado por rubro para la proyección (por defecto 0 %). | Fase 3 (B) | CA-PRE-22 |
| RF-PRE-019 | Plan de reposición: activos de equipo físico que cumplen su vida útil en 12 y 24 meses, con costo estimado igual al último precio de compra del mismo SKU o el costo original. | Fase 3 (B) | CA-PRE-22 |
| RF-PRE-020 | Configurar por categoría de equipo físico: método (línea recta o sin depreciación), vida útil en meses y valor residual en %. Las subcategorías heredan. | Fase 3 (B) | CA-PRE-08 |
| RF-PRE-021 | Calcular la depreciación mensual y el valor en libros referencial de cada activo con costo. | Fase 3 (B) | CA-PRE-08 |
| RF-PRE-022 | Listar activos "sin costo" y categorías "sin parámetros". | Fase 3 (B) | CA-PRE-18 |
| RF-PRE-023 | Mostrar totales por moneda; nunca sumar monedas distintas. | Fase 3 (A) | CA-PRE-05 |
| RF-PRE-024 | Comparar el año fiscal con el anterior por rubro y centro, por moneda. | Fase 3 (B) | CA-PRE-05 |
| RF-PRE-025 | Informe mensual "gastos sin respaldo de compra" (fuente propia) a quien aprueba (D-043.5). | Fase 3 (B) | CA-PRE-14 |
| RF-PRE-026 | Exponer a REP los servicios de costos (ejecutado, comprometido, disponible, depreciación); REP no lee las tablas de PRE. | Fase 3 (A) | CA-PRE-19 |

### 4.2 Reglas de negocio

| ID | Regla | Cuándo | CA |
|---|---|---|---|
| RN-PRE-001 | Un presupuesto tiene una sola moneda (código de 3 letras, D-014) y todas sus líneas la usan. | Fase 3 (A) | CA-PRE-01 |
| RN-PRE-002 | Solo hay un presupuesto aprobado por empresa, año fiscal y moneda. | Fase 3 (A) | CA-PRE-01 |
| RN-PRE-003 | Un costo se compara solo con el presupuesto de su moneda; sin él aparece como "Gasto sin presupuesto en <moneda>". | Fase 3 (A) | CA-PRE-05 |
| RN-PRE-004 | No hay conversión de monedas. Con varias monedas se muestra un bloque por moneda y **no existe total general**. | Fase 3 (A) | CA-PRE-05 |
| RN-PRE-005 | **Definición única (D-043.1):** no aprueba quien creó o editó el documento desde la última aprobación. Aplica a todos los roles, incluido el Administrador. | Fase 3 (A) | CA-PRE-02 |
| RN-PRE-006 | La única excepción es la casilla "presupuestos" del interruptor central de la empresa (D-031, D-043.2): apagada por defecto, vence a los 90 días, la consulta una sola función. Con ella se muestra aviso visible y cada uso queda en la auditoría. PRE no tiene excepción propia. | Fase 3 (A) | CA-PRE-16 |
| RN-PRE-007 | Aprobar un presupuesto o modificación: **siempre** otra persona. Gasto manual y reclasificación: otra persona solo si el importe total, con impuesto, en moneda base **supera estrictamente** el límite (RN-017); en moneda distinta de la base, siempre. Anular un gasto: siempre otra persona que quien lo registró. Todo mediante `requiereSegundaPersona(acto, monto, moneda)`. | Fase 3 (A) | CA-PRE-15 |
| RN-PRE-008 | Un presupuesto aprobado no se edita; se modifica con una modificación aprobada y el original se conserva. | Fase 3 (A) | CA-PRE-02 |
| RN-PRE-009 | El libro no se edita ni se borra (D-019). Las correcciones son registros contrarios con motivo. | Fase 3 (A) | CA-PRE-04 |
| RN-PRE-010 | El costo presupuestario se mide **sin impuesto**. Si el impuesto es costo lo decide contabilidad (**[ESCALAR AL CEO]**, S-PRE-02). | Fase 3 (A) | CA-PRE-03 |
| RN-PRE-011 | Ejecutado de una OC = cantidad recibida confirmada × precio unitario sin impuesto, en la fecha de la recepción. | Fase 3 (A) | CA-PRE-03 |
| RN-PRE-012 | Una OC en Borrador, Pendiente de aprobación, Rechazada o Anulada no es comprometido. | Fase 3 (A) | CA-PRE-03 |
| RN-PRE-013 | **Libro único con fuente única (D-044.3).** Precedencia: orden de compra > contrato de proveedor > registro propio del módulo. El libro toma el costo propio solo si no hay OC ni contrato. La clave de origen única (origen, identificador, tipo de hecho) impide duplicar. Si después se vincula una OC o contrato a un costo propio, se reclasifica la fuente con un registro contrario y uno nuevo. | Fase 3 (A y B) | CA-PRE-14 |
| RN-PRE-014 | Un costo sin centro de costo va a "Sin centro de costo" y avisa a Jefatura TI. | Fase 3 (A) | CA-PRE-15 |
| RN-PRE-015 | El costo se imputa al mes de su fecha. Si ese mes está cerrado, va al primer mes abierto con la marca "imputado por cierre". | Fase 3 (A) | CA-PRE-09 |
| RN-PRE-016 | Un periodo cerrado no se reabre; las correcciones entran al mes abierto con motivo. | Fase 3 (A) | CA-PRE-09 |
| RN-PRE-017 | Los umbrales los fija la empresa (por defecto 80 % atención y 100 % excedido; excedido no menor que atención). | Fase 3 (A) | CA-PRE-06 |
| RN-PRE-018 | Cada umbral avisa una sola vez por línea mientras se mantenga superado; se rearma si baja. | Fase 3 (A) | CA-PRE-06 |
| RN-PRE-019 | La alerta es informativa y no bloquea compras ni recepciones. | Fase 3 (A) | CA-PRE-07 |
| RN-PRE-020 | Cuota mensual = (costo − valor residual) ÷ vida útil en meses, redondeada a los decimales de la moneda (mitad hacia arriba); la última cuota absorbe la diferencia. | Fase 3 (B) | CA-PRE-08 |
| RN-PRE-021 | Valor residual = costo × % residual de la categoría (0 % a 90 %). | Fase 3 (B) | CA-PRE-08 |
| RN-PRE-022 | La depreciación empieza el mes siguiente a la recepción y termina al cumplir la vida útil o en el mes de baja o extravío. | Fase 3 (B) | CA-PRE-13 |
| RN-PRE-023 | "Extraviado o robado" y "De baja" detienen la depreciación; el reingreso (D-009) la reanuda con los meses pendientes. "Pendiente de devolución" (D-034) no la detiene. | Fase 3 (B) | CA-PRE-13 |
| RN-PRE-024 | Cada activo guarda al ingresar una **copia de sus parámetros** (vida útil, residual, método). Cambiar la categoría solo afecta a activos nuevos. REP lee esa copia. | Fase 3 (B) | CA-PRE-08 |
| RN-PRE-025 | Reevaluar la vida útil de activos existentes es una acción aparte, con motivo y `presupuesto.configurar`; vale desde el siguiente mes abierto. | Fase 3 (B) | CA-PRE-09 |
| RN-PRE-026 | Solo se deprecia la naturaleza **"equipo físico"** con serie (D-045). Licencias, servicios y SKU por cantidad no se deprecian; su compra es gasto del periodo. | Fase 3 (B) | CA-PRE-18 |
| RN-PRE-027 | Un activo sin costo no se deprecia y aparece en "sin costo". Un costo cero se marca "costo cero" y sí se deprecia. | Fase 3 (B) | CA-PRE-18 |
| RN-PRE-028 | Toda cifra de depreciación o proyección lleva la leyenda "Referencial de gestión; no sustituye la contabilidad". | Fase 3 (B) | CA-PRE-08 |
| RN-PRE-029 | Un centro de costo desactivado conserva líneas e historial; los costos nuevos van a "Sin centro de costo". | Fase 3 (A) | CA-PRE-15 |
| RN-PRE-030 | Un identificador de otra empresa responde "no encontrado". Ningún cálculo mezcla empresas. | Fase 3 (A) | CA-PRE-10 |
| RN-PRE-031 | La depreciación se **calcula al leer** con la copia de parámetros y se **guarda solo al cerrar el mes** (D-044.9). | Fase 3 (B) | CA-PRE-09 |
| RN-PRE-032 | Costo del activo = subtotal de la línea sin impuesto ÷ cantidad, con 4 decimales (D-044.7). Corregirlo exige `activos.corregir_costo`, con motivo; los meses cerrados no cambian. | Fase 3 (B) | CA-PRE-23 |
| RN-PRE-033 | No se cambia la moneda base de la empresa con presupuestos aprobados (D-044.8). | Fase 3 (A) | CA-PRE-20 |
| RN-PRE-034 | Todo trabajo de PRE es idempotente, recuperable (procesa los días pendientes en orden), corre empresa por empresa con la empresa fijada, salta empresas suspendidas, calcula "hoy" con la zona de la empresa y deja registro de cada corrida (D-038.4). Sus escrituras llevan autor "sistema" con la regla que lo ordenó. | Fase 3 (A y B) | CA-PRE-17 |
| RN-PRE-035 | Lo que protege la integridad (escribir el costo de una recepción) corre síncrono en la misma transacción; avisos y alertas corren asíncronos por la cola (D-038.5). | Fase 3 (A) | CA-PRE-03 |
| RN-PRE-036 | Si el módulo se apaga en una empresa, se oculta sin borrar datos y la API responde "no encontrado" (D-037 fila 12). | Fase 3 (A) | CA-PRE-11 |
| RN-PRE-037 | Descripciones y motivos son texto libre: el validador común rechaza claves y patrones peligrosos y avisa al escribir que no se pongan datos personales. La auditoría no guarda su valor (D-030.6). | Fase 3 (A) | CA-PRE-24 |
| RN-PRE-038 | Las cifras se exportan solo por la puerta única del núcleo (`datos.exportar`). Los importes negativos de los registros contrarios siguen siendo números en el archivo. | Fase 3 (A) | CA-PRE-25 |
| RN-PRE-039 | Prefijos: `PPT-` (presupuesto), `MPR-` (modificación) y `GMA-` (gasto manual), con mínimo 6 dígitos, correlativo por empresa, sin reutilizarse (D-007.8, D-049). **[SUPUESTO]** pedido al registro de prefijos. | Fase 3 (A) | CA-PRE-01 |
| RN-PRE-040 | Si la Persona responsable de un centro de costo cesa, se crea un pendiente informativo en su ficha; el cese no se bloquea (D-061.7). | Fase 3 (A) | CA-PRE-26 |

### 4.3 Calidad medible

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RNF-PRE-001 | Con el volumen de referencia de RNF-010, la pantalla de ejecución carga en 3 s o menos (percentil 95). La prueba de carga corre en integración nocturna. | Fase 3 (A) | CA-PRE-19 |
| RNF-PRE-002 | Una recepción confirmada se refleja en la ejecución al terminar la operación (misma transacción). | Fase 3 (A) | CA-PRE-03 |
| RNF-PRE-003 | La alerta de umbral sale en 5 minutos o menos. | Fase 3 (A) | CA-PRE-06 |
| RNF-PRE-004 | El cierre mensual corre en el trabajador con barra de avance, nunca dentro de la petición, y con el volumen de RNF-010 termina en 60 s o menos. | Fase 3 (A) | CA-PRE-09 |
| RNF-PRE-005 | Importes decimales exactos de 4 decimales; se muestran con los decimales de la moneda. Formato de número y fecha (dd/mm/aaaa) según D-049.8. | Fase 3 (A) | CA-PRE-08 |
| RNF-PRE-006 | La suma de las cuotas de un activo es exactamente costo menos residual (prueba con 1.000 casos). | Fase 3 (B) | CA-PRE-08 |
| RNF-PRE-007 | Cada cifra se reconstruye sumando sus registros del libro (diferencia cero). | Fase 3 (A) | CA-PRE-03 |
| RNF-PRE-008 | Aislamiento por módulo con identificador interno; el trabajo diario se prueba con dos empresas. | Fase 3 (A) | CA-PRE-10, CA-PRE-17 |

---

## 5. Estados y transiciones

**Presupuesto y modificación (misma tabla)**

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Borrador | `presupuesto.crear_editar` | Moneda y año definidos |
| Borrador | Pendiente de aprobación | Quien lo creó | Al menos una línea; montos mayores o iguales a 0 |
| Pendiente de aprobación | Aprobado | `presupuesto.aprobar`, otra persona | RN-PRE-002, 005, 007 |
| Pendiente de aprobación | Rechazado | `presupuesto.aprobar`, otra persona | Motivo obligatorio |
| Rechazado / Pendiente | Borrador | Quien lo creó | Queda en auditoría |
| Borrador / Pendiente / Rechazado | Anulado | `presupuesto.anular` | Motivo; final |
| Aprobado | Cerrado | Sistema al cerrar el último mes, o `presupuesto.cerrar_periodo` | Todos los meses cerrados; final |

Una modificación Aprobada ya no cambia.
**Periodo:** Abierto → Cerrado (`presupuesto.cerrar_periodo`; solo el mes abierto más antiguo, y solo si ya terminó). No hay reapertura.
**Gasto manual y reclasificación:** Pendiente de aprobación (solo si supera el límite, RN-PRE-007) → Vigente o Rechazado; si no supera, nace Vigente. Vigente → Anulado (`presupuesto.gasto_anular`, otra persona, motivo; final).
**Depreciación del activo (estado calculado, nadie lo edita):** Sin parámetros · Sin costo · En depreciación · Totalmente depreciado · Detenida (baja o extravío).

---

## 6. Datos

| Entidad | Campos principales | Clave y unicidad | Se audita |
|---|---|---|---|
| Presupuesto (`PPT-`) | empresa, nombre, año fiscal, moneda, estado, creado por, aprobado por (membresías) | Único aprobado por empresa + año + moneda | Altas, cambios con antes/después, aprobación, rechazo, anulación |
| Línea | presupuesto, centro, rubro, monto anual | Única por presupuesto + centro + rubro | Cambios con antes/después |
| Modificación (`MPR-`) | presupuesto, tipo, estado, motivo; líneas con monto (+/−) | Correlativo por empresa | Cada cambio de estado |
| **Libro de costos** | empresa, origen, id de origen, tipo de hecho, fecha, periodo, centro, rubro, importe sin impuesto, impuesto informativo, moneda, `fuente_costo`, motivo, autor (membresía o sistema) | Única por empresa + origen + id + tipo de hecho | Cada alta; nunca se edita |
| Gasto manual (`GMA-`) | fecha, descripción, importe, % impuesto, moneda, centro, rubro, motivo, estado | Correlativo por empresa | Alta, aprobación, anulación |
| Parámetros de depreciación | categoría, método, vida útil, residual %, vigente desde | Una vigente por empresa + categoría | Cambios con antes/después |
| Depreciación del activo | activo, costo, moneda, inicio, **copia de parámetros**, estado | Una por activo | Reevaluaciones |
| Cuota de depreciación | activo, mes, importe, moneda | Única por activo + mes; solo meses cerrados | Se congela al cerrar |
| Periodo | año, mes, estado, cerrado por y el | Único por empresa + año + mes | Cierre |
| Configuración | mes de inicio del año fiscal, umbrales, incrementos por rubro | Una por empresa | Cambios con antes/después |
| Corrida de trabajo | fecha lógica, resultado, cantidad de hechos | Única por empresa + trabajo + fecha lógica | No (registro técnico) |

- La alerta no tiene tabla propia: usa la única tabla de avisos de Notificaciones (D-062.3).
- **Datos personales declarados:** ninguno por valor. Se guardan solo referencias (membresía, Persona responsable por identificador). Descripciones y motivos son texto libre, sin valor en la auditoría.
- Todo dato lleva empresa; tablas calientes (libro, cuotas) con índices que empiezan por empresa (para Datos).

---

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-PRE-01 | Lista de presupuestos | Ver por año y moneda, con estado | Jefatura TI |
| PAN-PRE-02 | Editor de presupuesto | Matriz centro × rubro; copiar año anterior | Jefatura TI |
| PAN-PRE-03 | Ejecución | Original, vigente, ejecutado, comprometido, disponible; estado con texto además del color | Jefatura TI, responsable de centro |
| PAN-PRE-04 | Detalle de costos | Libro con filtros y enlace al origen | Jefatura TI |
| PAN-PRE-05 | Modificaciones | Crear, enviar y aprobar (dentro de la bandeja única "Por aprobar") | Jefatura TI |
| PAN-PRE-06 | Gasto manual y reclasificación | Registrar, anular, reclasificar | Jefatura TI |
| PAN-PRE-07 | Proyección de renovaciones | 12 meses por mes, rubro y moneda | Jefatura TI |
| PAN-PRE-08 | Plan de reposición | Equipos al fin de vida útil y costo estimado | Jefatura TI |
| PAN-PRE-09 | Depreciación | Por categoría y activo; listas "sin costo" y "sin parámetros" | Jefatura TI |
| PAN-PRE-10 | Cierre de periodo | Meses, vista previa, botón con avance | Jefatura TI |
| PAN-PRE-11 | Configuración | Año fiscal, umbrales, parámetros, incrementos | Administrador |
| PAN-PRE-12 | Panel en la aprobación de OC | Efecto en el presupuesto y justificación (extensión del núcleo) | Aprobador de OC |

Reglas de pantalla: "Exportar" visible y desactivado con la razón si falta permiso; un botón o dato sin permiso se muestra con los tres mensajes del catálogo (No encontrado, No tiene permiso, No se puede por una regla); tarjeta de ejecución en el Inicio; formularios usables a 360 px, aunque la edición se hace en pantalla grande (DS-11).

---

## 8. Notificaciones y automatismos

Los avisos salen por el motor único de Notificaciones (hora de envío configurable, por defecto 08:00). Contenido mínimo (D-061.4): tipo, código y empresa; los importes se ven dentro de la plataforma.

| Cuándo | A quién | Qué dice |
|---|---|---|
| Presupuesto o modificación pasa a Pendiente | Usuarios con `presupuesto.aprobar` | "El presupuesto PPT-000007 (USD) espera su aprobación." |
| Se aprueba o rechaza | Quien lo creó | Resultado y motivo |
| Ejecución llega a 80 % o 100 % | Responsable del centro y Jefatura TI | "Un rubro del centro Soporte llegó a su umbral. Revise el detalle." |
| Proyección de cierre supera 100 % | Jefatura TI (una vez al mes) | "Al ritmo actual, un rubro cerraría por encima del presupuesto." |
| OC aprobada que excede | Responsable del centro | "OC-000042 dejó un rubro por encima del presupuesto." |
| Costos sin centro de costo | Jefatura TI (resumen semanal) | "Hay 5 costos sin centro de costo." |
| Faltan 5 días para fin de mes | Con `presupuesto.cerrar_periodo` | "Recuerde cerrar el mes anterior." |
| Informe mensual sin respaldo de compra | Quien aprueba (D-043.5) | "Hay gastos sin respaldo de compra este mes." |
| Resumen de activos sin costo y categorías sin parámetros | Administrador (mensual) | "Hay activos sin costo y categorías sin vida útil." |

**Trabajos en segundo plano** (programador único, D-038): (1) convertir obligaciones en filas del libro; (2) evaluar umbrales como respaldo del aviso por evento; (3) cierre mensual a pedido. Cada uno declara RN-PRE-034.

---

## 9. Integración con el núcleo y con otros módulos

- **Núcleo:** empresa, zona horaria, moneda base y monedas; membresías y Personas; roles y permisos; auditoría con autor "sistema" (D-041); catálogo de centros de costo y categorías (con naturaleza); costo, moneda y centro de costo del activo; líneas de OC con impuesto, recepción y su reversión; interruptor central de excepciones; puerta de exportación; calendario de empresa.
- **Pedidos al núcleo:** (a) espacio en la pantalla de aprobación de la OC, **incorporado al núcleo como RF-OC-051** (Etapa 5): un módulo activo (PRE) muestra su efecto y pide justificación si se excede, sin segundo nivel ni cambio de quién aprueba; (b) centro de costo en la OC, opcional (RF-OC-007), confirmado; (c) `activos.corregir_costo` (PS-51), decidido en D-044.9.
- **Registro de módulo (D-038.6):** permisos `presupuesto.*`; escucha `compras.recepcion_confirmada`, `compras.recepcion_revertida`, `compras.orden_aprobada`, `inventario.activo_estado_cambiado`, `personas.persona_cesada`; emite `presupuesto.umbral_superado`, `presupuesto.presupuesto_aprobado` y `presupuesto.periodo_cerrado`; declara como pendiente de la persona "centros de costo de los que es responsable"; proveedor de fuentes de costo e indicadores para REP.
- **proveedores-contratos y garantias-mantenimiento (A):** contrato con proveedor, moneda, valor del periodo sin impuesto, frecuencia, inicio, fin, centro, y "OC relacionada"; las fechas de cobro se derivan de inicio más frecuencia; garantía extendida y mantenimiento sin OS guardan costo y moneda; con OS, el costo vive en la OS.
- **licencias-software, lineas-moviles, dominios-certificados (B):** patrón de costo común (importe sin impuesto, % de impuesto, moneda, periodicidad, inicio, fin, centro, `fuente_costo`), "costo mensual equivalente" calculado por la función única y "orden de compra vinculada" opcional.
- **Órdenes de servicio (Etapa 6):** costo real, moneda, proveedor, centro de costo y "cubierta por garantía" (D-044.10).
- **reportes-tableros (REP):** consume los servicios de PRE (RF-PRE-026).
- **integraciones-api (INT):** el código externo del centro de costo; los presupuestos se leen por API solo con `precios.ver` y el permiso de lectura del módulo.
- **notificaciones (C):** avisos por el motor y la tabla única.

---

## 10. Criterios de aceptación

Cada criterio cita el requisito que cubre.
- **CA-PRE-01 Una moneda y numeración.** *Cubre RF-PRE-001, RN-PRE-001, 002, 039.* Dado un presupuesto PPT-000001 en USD, cuando se agrega una línea en PEN, entonces se rechaza con "El presupuesto es en USD"; cuando se aprueba un segundo presupuesto USD del mismo año, entonces se rechaza.
- **CA-PRE-02 Aprobación con otra persona.** *Cubre RF-PRE-003, RF-PRE-004, RN-PRE-005, 007, 008.* Dado que Ana creó o editó el presupuesto, cuando Ana intenta aprobarlo, entonces se impide aunque sea Administradora; cuando lo aprueba Luis, entonces queda Aprobado y la auditoría guarda quién y cuándo; si Ana edita después, Luis debe volver a aprobar y Ana no puede.
- **CA-PRE-03 Costo desde la recepción.** *Cubre RF-PRE-005 a 008, RN-PRE-010 a 012, 035.* Dado una OC de 10 laptops a USD 1.200,00 sin impuesto en el centro Soporte, cuando se confirma la recepción de 4, entonces en la misma operación el ejecutado sube USD 4.800,00 y el comprometido es USD 7.200,00.
- **CA-PRE-04 Reversión.** *Cubre RF-PRE-009, RN-PRE-009.* Dado esa recepción, cuando se revierte (D-017), entonces el ejecutado baja USD 4.800,00 con un registro contrario y el original sigue visible.
- **CA-PRE-05 Varias monedas.** *Cubre RF-PRE-023, 024, RN-PRE-003, 004.* Dado costos en USD y PEN, cuando se abre el reporte, entonces hay dos bloques, no hay total general y el archivo exportado trae la columna "Moneda".
- **CA-PRE-06 Alerta única.** *Cubre RF-PRE-014, RN-PRE-017, 018, RNF-PRE-003.* Dado una línea de USD 10.000,00 con ejecución USD 7.900,00, cuando entra un costo de USD 200,00, entonces sale una alerta de atención; cuando entra otro de USD 100,00, entonces no sale otra.
- **CA-PRE-07 Aviso en la aprobación de OC.** *Cubre RF-PRE-015, RN-PRE-019.* Dado que OC-000042 dejaría Periféricos en 112 %, cuando el aprobador la abre, entonces ve el aviso y debe escribir una justificación; no se bloquea.
- **CA-PRE-08 Depreciación exacta.** *Cubre RF-PRE-020, 021, RN-PRE-020, 021, 024, 028, RNF-PRE-006.* Dado una laptop de USD 1.200,00, vida útil 36 meses, residual 10 %, recibida el 15/03/2027, entonces la cuota es USD 30,00 desde abril, las 36 cuotas suman USD 1.080,00 y el valor en libros final es USD 120,00.
- **CA-PRE-09 Cierre de periodo.** *Cubre RF-PRE-016, RN-PRE-015, 016, 025, 031, RNF-PRE-004.* Dado enero cerrado, cuando se confirma una recepción con fecha de enero, entonces el costo va a febrero con la marca "imputado por cierre" y las cifras de enero no cambian; el cierre corre en segundo plano con avance.
- **CA-PRE-10 Aislamiento entre empresas.** *Cubre RN-PRE-030, RNF-PRE-008.* Dado el identificador interno de un presupuesto de la empresa B, cuando un usuario de A lo pide, entonces recibe "no encontrado"; sus totales nunca incluyen datos de B.
- **CA-PRE-11 Permiso denegado.** *Cubre la sección 3, RN-PRE-036.* Dado un Técnico sin `presupuesto.ver`, cuando abre la ejecución o llama directo al servidor, entonces recibe "No tiene permiso" y el intento queda en el registro de seguridad; con el módulo apagado recibe "no encontrado".
- **CA-PRE-12 Precios ocultos.** *Cubre la sección 3.* Dado un usuario con un rol personalizado que tiene `presupuesto.ver` y no `precios.ver`, cuando abre el módulo, entonces no ve importes y se le indica por qué.
- **CA-PRE-13 Baja y reingreso.** *Cubre RN-PRE-022, 023.* Dado un activo en depreciación, cuando se da de baja en junio, entonces la última cuota es la de junio; si se reingresa en octubre, continúa con los meses pendientes; con "Pendiente de devolución" no se detiene.
- **CA-PRE-14 Fuente única.** *Cubre RF-PRE-010, 011, 025, RN-PRE-013.* Dado un contrato de USD 500,00 mensuales con una OC vinculada, cuando corre el trabajo diario, entonces el libro tiene una sola fila de costo (la de la OC) y ninguna del contrato; sin OC ni contrato, la fila es de fuente propia y sale en el informe "sin respaldo de compra".
- **CA-PRE-15 Segunda persona en gasto manual.** *Cubre RF-PRE-012, 013, RN-PRE-007, 014, 029.* Dado un límite de USD 5.000,00, cuando se registra un gasto de USD 5.000,00 (con impuesto), entonces nace Vigente; con USD 5.000,01 queda Pendiente de aprobación y lo aprueba otra persona; un gasto en otra moneda siempre queda pendiente; anularlo exige otra persona.
- **CA-PRE-16 Interruptor.** *Cubre RN-PRE-006.* Dado la casilla "presupuestos" apagada, cuando el creador intenta aprobar su presupuesto por la pantalla o por una llamada directa, entonces se rechaza; con la casilla activa se permite con aviso y auditoría; vencida a los 90 días, vuelve a rechazar.
- **CA-PRE-17 Procesos con dos empresas.** *Cubre RN-PRE-034, RF-PRE-011, RNF-PRE-008.* Dado dos empresas con zonas distintas y una suspendida, cuando el trabajo diario corre dos veces y tras una caída de dos días, entonces no hay filas duplicadas, se recuperan los días pendientes en orden, cada fila y aviso queda en su empresa y la suspendida se salta.
- **CA-PRE-18 Naturaleza.** *Cubre RF-PRE-022, RN-PRE-026, 027.* Dado una licencia por serie y un cable por cantidad, cuando se calcula la depreciación, entonces no se deprecian; un equipo sin costo aparece en "sin costo".
- **CA-PRE-19 Rendimiento.** *Cubre RF-PRE-026, RNF-PRE-001.* Dado el volumen de RNF-010, cuando corre la prueba de carga nocturna, entonces la ejecución carga en 3 s o menos (percentil 95) y REP obtiene las cifras por los servicios de PRE.
- **CA-PRE-20 Moneda base.** *Cubre RN-PRE-033.* Dado un presupuesto aprobado, cuando el Administrador intenta cambiar la moneda base, entonces se rechaza con la razón escrita.
- **CA-PRE-21 Copia.** *Cubre RF-PRE-002.* Dado un presupuesto 2026, cuando se copia con +5 %, entonces el borrador 2027 trae los montos ajustados y ninguna aprobación del original.
- **CA-PRE-22 Proyección.** *Cubre RF-PRE-017 a 019.* Dado un contrato que vence en 3 meses y un incremento esperado de 10 %, entonces la proyección muestra el importe con el incremento, por moneda; los activos de licencias o servicios no aparecen en el plan de reposición.
- **CA-PRE-23 Corrección de costo.** *Cubre RN-PRE-032.* Dado un activo del Excel sin costo, cuando alguien con `activos.corregir_costo` lo completa con motivo, entonces se deprecia desde el siguiente mes abierto y los meses cerrados no cambian.
- **CA-PRE-24 Texto libre.** *Cubre RN-PRE-037.* Dado un motivo con un bloque de clave privada, cuando se guarda, entonces se rechaza; el valor de un motivo válido no aparece en la auditoría.
- **CA-PRE-25 Exportación.** *Cubre RN-PRE-038.* Dado un Administrador que exporta el libro con registros contrarios, entonces los importes negativos siguen siendo números, una descripción que empieza con `=` se escribe como texto y la auditoría registra filas y columnas sensibles sin el contenido.
- **CA-PRE-26 Cese del responsable.** *Cubre RN-PRE-040.* Dado una Persona responsable de un centro, cuando se la cesa, entonces el cese se completa, aparece el pendiente y las alertas van a Jefatura TI.

---

## 11. Casos límite

1. Activo recibido el último día del mes: se deprecia desde el mes siguiente, igual que uno recibido el día 1.
2. OC cerrada con faltante: el comprometido de lo no recibido se libera en el acto.
3. OC editada tras aprobarse (vuelve a Pendiente, D-013.5): deja de contar como comprometida hasta reaprobarse.
4. OC en moneda sin presupuesto: aparece como "Gasto sin presupuesto en <moneda>".
5. Presupuesto aprobado a mitad de año: los costos anteriores cuentan; la ejecución es del año completo.
6. Año fiscal distinto del calendario: periodos y depreciación siguen esos meses.
7. Vida útil de 1 mes: la única cuota es costo menos residual.
8. Costo cero (donación): se deprecia como cero y se marca "costo cero".
9. Costo del activo corregido con meses cerrados: aplica desde el mes abierto.
10. Persona responsable cesada o sin Usuario: alertas a Jefatura TI y pendiente en su ficha.
11. Contrato en moneda sin presupuesto: sin presupuesto en esa moneda.
12. Gasto compartido entre tres centros: tres gastos manuales; PRE no prorratea.
13. Dos personas cierran el mismo mes: solo se registra un cierre; la segunda recibe "ya cerrado".
14. Contrato vinculado a una OC después de haber costado: se reclasifica la fuente (RN-PRE-013).

---

## 12. Decisiones propuestas y supuestos

| ID | Tipo | Propuesta y motivo |
|---|---|---|
| S-PRE-01 | Resuelto (D-056) | PRE-A y PRE-B son Fase 3, ola F; PRE-A puede adelantarse por decisión del Gerente de TI. |
| S-PRE-02 | **[ESCALAR AL CEO]** | **Impuestos como costo.** El costo se mide sin impuesto. Si el impuesto se recupera o se capitaliza depende del país y de contabilidad. Hasta confirmarlo, "sin impuesto". |
| S-PRE-03 | **[ESCALAR AL CEO]** | **Tratamiento contable y tributario de la depreciación:** vidas útiles y tasas legales, umbral de capitalización, fletes e instalación, revaluación. La plataforma entrega depreciación referencial de gestión y no prellena vidas útiles. Consulta a contabilidad antes de PRE-B. |
| S-PRE-04 | **[ESCALAR AL CEO]** | **Totales en una sola moneda** exigirían tipo de cambio oficial y política de contabilidad, y quizá una fuente de pago. Queda fuera. |
| S-PRE-05 | [SUPUESTO] | Año fiscal enero a diciembre, con mes de inicio configurable. |
| S-PRE-06 | [SUPUESTO] | Presupuesto anual, sin reparto mensual. |
| S-PRE-07 | [SUPUESTO] | Las alertas no bloquean; el aprobador de OC justifica si excede, sin segundo nivel (D-015, D-023). |
| S-PRE-08 | [SUPUESTO] | Umbrales por defecto 80 % y 100 %. |
| S-PRE-09 | [SUPUESTO] | Línea recta, inicio el mes siguiente a la recepción. |
| S-PRE-10 | [SUPUESTO] | Copia de parámetros por activo al ingresar (RN-PRE-024); REP la usa. |
| S-PRE-11 | [SUPUESTO] | Stock por cantidad no se deprecia. |
| S-PRE-12 | Resuelto (D-058) | La excepción es la casilla "presupuestos" del interruptor único (D-043). |
| S-PRE-13 | [SUPUESTO] | Los rubros fijos son del sistema; la empresa no crea rubros. |
| S-PRE-14 | [SUPUESTO] | Prefijos `PPT-`, `MPR-`, `GMA-` y registro en la tabla de prefijos reservados. |
| S-PRE-15 | [SUPUESTO] | Gasto manual o reclasificación en moneda distinta de la base exige siempre otra persona (por analogía con D-043.3). |

---

## 13. Fuera de alcance

- Contabilidad oficial, asientos, libros, declaración de impuestos.
- Conversión de monedas y consolidado en una moneda (S-PRE-04).
- Métodos de depreciación acelerada o por unidades de uso.
- Reparto mensual o trimestral del presupuesto.
- Prorrateo automático entre centros de costo.
- Aprobación de presupuesto en varios niveles (D-023).
- Pagos, facturas de proveedores, conciliación bancaria.
- Bloqueo automático de compras por falta de presupuesto.
- Presupuesto de personal o de proyectos que no sean compras y servicios de TI.
- Adjuntos de sustento (D-022).

---

## 14. Historial de cambios (v0.1 a v0.2)

| Cambio | Decisión o hallazgo que lo motiva |
|---|---|
| Se agrega el libro único de costos con clave de origen única, `fuente_costo` y precedencia OC > contrato > propio (RN-PRE-013, RF-PRE-011) | D-044.2 y D-044.3; H-ARQ-08, H-DAT-07 |
| La excepción de una sola persona pasa a la casilla "presupuestos" del interruptor central; se retira S-PRE-12 propio (RN-PRE-006) | D-031, D-043.2, D-058; H-AUD-07, H-CUM-02 |
| Definición única de creador y editor desde la última aprobación (RN-PRE-005) | D-043.1; H-ARQ-10 |
| Regla de segunda persona por tabla única: aprobar presupuesto siempre; gasto o reclasificación si supera estrictamente el límite con impuesto en moneda base; anular gasto otra persona (RN-PRE-007) | D-043.3 y D-043.4; H-CUM-03 |
| Se distingue límite de aprobación (con impuesto) de costo presupuestario (sin impuesto) en glosario y RN-PRE-010 | D-043 (discrepancia resuelta) |
| Depreciación se calcula al leer y se guarda al cerrar el mes; REP lee la copia de parámetros (RN-PRE-024, RN-PRE-031) | D-044.9; H-DAT-19, H-QA-22 (4) |
| Solo se deprecia la naturaleza "equipo físico" (RN-PRE-026) | D-045; H-ARQ-06 |
| Redondeo a decimales de la moneda y costo del activo con 4 decimales (RN-PRE-020, RN-PRE-032) | D-044.7; H-DAT-13, H-QA-16 |
| Costo del activo corregible con `activos.corregir_costo`; se quita el "pedido pendiente" al núcleo (RN-PRE-032) | D-044.9; H-AUD-16 |
| Formato de orden `OC-000042` y prefijos `PPT-`, `MPR-`, `GMA-` | D-049.2; plan de correcciones |
| Punto de extensión en la aprobación de OC como pedido a la Etapa 5 (RF-PRE-015, sección 9) | H-AUD-28 (tabla de conflictos); plan de correcciones |
| **v0.3:** "Cuándo" con las tres palabras (`Fase 3 (A)`, `(B)`); PS-114, 116, 117 y 118 declarados sensibles; evento `presupuesto.presupuesto_aprobado` (antes `presupuesto.aprobado`); RF-OC-051 citado | D-068, D-075 (N-AUD-06); `docs/equipo/plan-aplicacion.md` |
| Se retira la marca [SUPUESTO] del punto de extensión: el Analista lo incorporó al núcleo como RF-OC-051 | Ronda 3 del Auditor Técnico; plan de correcciones (PRE punto 5) |
| REP consume servicios de PRE, no sus tablas (RF-PRE-026) | D-062.5 |
| Permisos reemplazados por los PS-nn del registro (`presupuesto.crear` pasa a `presupuesto.crear_editar` PS-113; Jefatura TI sin crear, registrar gasto ni reclasificar; `reportes.exportar` pasa a `datos.exportar` PS-20; `activos.corregir_costo` PS-51 solo Administrador); se declara "Empleado (portal): no aplica" | D-036, D-037; `docs/registro-permisos.md` |
| Procesos en segundo plano con idempotencia, recuperación, "hoy" por empresa y autor "sistema"; recepción síncrona y alertas asíncronas (RN-PRE-034, 035) | D-038.4, D-038.5, D-041.4; H-ARQ-01, H-SEG-02, H-QA |
| Cierre mensual en segundo plano con avance (RNF-PRE-004); prueba de carga nocturna con el volumen de RNF-010 | D-038.7, S-19, D-057 |
| Módulo apagado responde "no encontrado" (RN-PRE-036) | D-037 fila 12 |
| Texto libre con validador común y sin valor en la auditoría (RN-PRE-037); datos personales declarados | D-030.6, D-063.2, D-061.3 |
| Exportación solo por la puerta única; importes negativos siguen numéricos (RN-PRE-038) | D-061.1; H-SEG-13 |
| Pendiente de la persona al cesar un responsable de centro (RN-PRE-040) | D-061.7, D-038.6 |
| No se cambia la moneda base con presupuestos aprobados (RN-PRE-033) | D-044.8 |
| Informe mensual "sin respaldo de compra" (RF-PRE-025) | D-043.5 |
| Alertas con contenido mínimo y motor único de avisos; se quita tabla propia de alertas | D-061.4, D-062.3 |
| Columnas "Cuándo" y "CA" por requisito; cada CA cita lo que cubre; 26 criterios (nuevos: fuente única, segunda persona, interruptor, dos empresas, naturaleza, rendimiento, texto libre, exportación, cese) | Plan de correcciones regla 2; H-AUD-21; QA y Seguridad |
| Fechas dd/mm/aaaa, montos con código de moneda, "usted", "Cliente (CEO)", pantallas con ID `PAN-PRE-nn` | D-049, D-053 |
| S-PRE-02, 03 y 04 siguen escalados a contabilidad | D-058; revisión de Cumplimiento (C6) |

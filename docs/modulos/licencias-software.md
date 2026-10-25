# Módulo: Licencias de software (LIC)

**Versión:** 0.2 · **Autor:** Analista de Negocio, escuadrón B · **Estado:** corregido tras la revisión cruzada (plan de correcciones, Mesa #002); pendiente de verificación del Auditor Técnico, QA, Seguridad y Cumplimiento
**Base:** decisiones D-001 a D-064 (`docs/equipo/decisiones.md`), en especial D-030, D-031, D-035, D-036, D-037, D-038, D-043, D-044, D-045, D-049, D-050, D-056, D-058, D-061, D-062 y D-063.
**Fase:** Fase 2, ola B (D-056). Cada fila de requisito indica "Cuándo" y el criterio que lo cubre.

---

## 1. Propósito, alcance y fase

**Propósito.** Que el área de TI sepa, para cada programa de software, cuántos puestos compró, a quién se los dio, cuántos se usan de verdad, cuándo vencen y si la empresa tiene licencias de más (dinero perdido) o de menos (riesgo legal). Además, guardar las claves de licencia de forma segura.

**Entra**
- Contrato de licencia: puestos comprados, tipo de licencia, vigencia, costo y responsable.
- Claves de licencia como campo secreto, con auditoría de cada lectura.
- Asignación de puestos a Personas o a equipos, con historial.
- Puestos "en uso" informados por el responsable.
- Panel de cuadre de puestos: licencias de más o de menos.
- Vencimientos, avisos y renovación.
- Importación inicial (con el marco común) y exportación (con la puerta común).

**No entra**
- Instalar, medir o desinstalar software (no hay agente ni conexión con el fabricante).
- Pagos y facturas: la plataforma registra, no paga.
- Garantía, mantenimiento o depreciación de licencias (la categoría tiene naturaleza "licencia", D-045).
- Soporte del software: si hay un contrato de soporte, va en `proveedores-contratos`.
- Adjuntos (contrato firmado, factura) hasta que el Cliente (CEO) decida D-022.
- Conciliación con la consola del fabricante: queda para `integraciones-api`.

**Fase.** Fase 2, ola B (D-056.3), después de la Etapa 7. Requiere Etapa 2 (Personas, motor de campos con tipo secreto), Etapa 4 (inventario), `proveedores-contratos` parte B (PRV-B) y `notificaciones` completo (NOT-completo, ola A). En la v1 rige D-011 reformulada por D-035: una licencia es un SKU por serie o por cantidad, sin asignación de puestos ni avisos. Cada empresa activa el módulo en Configuración (`empresa.configurar_modulos`); apagarlo oculta, no borra, y la API responde "no encontrado".

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Producto** | Un SKU de una categoría con naturaleza "licencia" (ej. `LIC-0007` Microsoft 365 Business Standard). |
| **Contrato de licencia** | **Extensión 1 a 1 de un contrato de proveedor** (`CTR-000123`, D-044.4). Del contrato de proveedor toma proveedor, fechas, costo, renovación y avisos; este módulo agrega el producto, el tipo y los puestos. |
| **Puesto** | El derecho de uso de una persona o un equipo. Un contrato de 50 puestos permite 50 usos. |
| **Comprados** | Puestos de los contratos Vigentes de un producto. |
| **Asignados** | Puestos que TI entregó a una Persona o a un equipo en la plataforma. |
| **En uso** | Puestos que el responsable informa como realmente usados (ej. el número de la consola del fabricante), con fecha. |
| **Disponibles** | Comprados menos Asignados. |
| **Excedente (licencia de más)** | Se pagan puestos que nadie asignó ni usa. |
| **Déficit (licencia de menos)** | Se usan o asignan más puestos de los comprados. |
| **Tipo de licencia** | Por persona, Por equipo, Concurrente (varios usuarios a la vez, hasta un tope) o Sin límite (de sitio). |
| **Clave de licencia** | Código secreto que activa el software. Es un campo de tipo **secreto** de la unidad (D-035): se guarda **cifrado**, ilegible para quien mire la base de datos, y se muestra **enmascarada**. Nunca es la serie. |
| **Serie de la unidad** | Identificador **visible** de la licencia (ej. `M365-2026-A`). No es secreto. |
| **Persona / Usuario** | La Persona recibe puestos; el Usuario entra a la plataforma (D-006). Una Persona puede estar Activa, Cesada o Anonimizada. |
| **Pendiente de la persona** | Cosa que una Persona aún tiene a su nombre. Aquí: puestos de licencia asignados. |
| **Sin respaldo de compra** | Contrato con costo que no tiene orden de compra ni otro contrato de proveedor como fuente de su costo. |
| **Cuadre de puestos** | Nombre del panel de cumplimiento: comparación interna; no sustituye una auditoría del fabricante. |

## 3. Roles y permisos

Nombres técnicos con el formato `<módulo>.<acción>` (D-036). Cada módulo agrega filas al registro, no cambia celdas del núcleo (D-037). Alcance: **Todo** o **Propio** (puestos de la Persona vinculada al usuario; sin Persona vinculada, lista vacía). Valores predeterminados, editables por empresa. Los nombres de esta tabla se reemplazan por los PS-nn del registro (`docs/registro-permisos.md`) cuando exista.

| Acción | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura | Empleado (portal) |
|---|---|---|---|---|---|---|---|---|
| Ver contratos, puestos y cuadre | `licencias.ver` | Todo | Todo | Todo | — | Propio | Todo | Propio |
| Ver costos | `precios.ver` | Sí | Sí | — | — | — | — | — |
| Ver a qué Persona está asignado cada puesto | `datos_personales.ver` | Sí | Sí | Sí | — | Propio | — | Propio |
| Crear y editar contratos (borrador y datos) | `licencias.crear` / `licencias.editar` | Sí | — | Sí | — | — | — | — |
| Confirmar contrato o renovación | `licencias.confirmar` | Sí | Sí | — | — | — | — | — |
| Terminar contrato | `licencias.terminar` | Sí | Sí | — | — | — | — | — |
| Asignar y liberar puestos | `licencias.asignar` | Sí | — | Sí | — | — | — | — |
| Informar puestos en uso | `licencias.registrar_uso` | Sí | — | Sí | — | — | — | — |
| **Ver clave completa** (sensible) | `licencias.ver_clave` | Sí | — | Opción* | — | — | — | — |
| **Escribir o cambiar una clave** (sensible) | `licencias.editar_clave` | Sí | — | Opción* | — | — | — | — |
| Importar (permiso único, módulo "licencias") | `datos.importar` | Sí | — | — | — | — | — | — |
| Exportar (permiso único, módulo "licencias") | `datos.exportar` | Sí | — | — | — | — | — | — |
| Configurar umbrales de este módulo | `licencias.configurar` | Sí | — | — | — | — | — | — |
| Recibir avisos de este módulo | `licencias.recibir_avisos` | Sí | Sí | — | — | — | — | — |
| Ver auditoría | `auditoria.ver` | Sí | Sí | — | — | — | — | — |

\* "Opción": la empresa puede dárselo al Técnico; **no** viene activado (D-035.4).
Controles de los permisos sensibles (D-036.5, D-048): `licencias.ver_clave` lleva reautenticación reciente (R), segundo factor (2F), auditoría de cada uso (A) y tope de 20 por usuario por hora (T). `licencias.editar_clave` lleva R, 2F y A. `datos.exportar` y `datos.importar` llevan R, 2F, A y los topes del núcleo. Todo se comprueba en el servidor (CLAUDE.md regla 6). Un rol nuevo parte sin permisos. Jefatura TI no exporta ni importa salvo que el administrador se lo active.

## 4. Requisitos

### 4.1 Requisitos funcionales

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-LIC-001 | Registrar un contrato de licencia como extensión del contrato de proveedor `CTR-`: producto, tipo, puestos, proveedor, fechas, renovación, costo, centro de costo y responsable (Persona). | Fase 2, ola B | CA-LIC-01 |
| RF-LIC-002 | Un contrato nace en Borrador; se borra solo si nunca se confirmó (D-019). | Fase 2, ola B | CA-LIC-01 |
| RF-LIC-003 | En un producto **por serie**, vincular al contrato una o más unidades (claves) del mismo SKU; al confirmar se guardan los puestos como la suma del campo de unidad "puestos". En un producto **por cantidad**, los puestos se escriben en el contrato y el stock no se mueve. | Fase 2, ola B | CA-LIC-02 |
| RF-LIC-004 | Guardar la clave como campo secreto; mostrarla enmascarada; revelarla solo con `licencias.ver_clave`; ocultarla sola. | Fase 2, ola B | CA-LIC-05, CA-LIC-06 |
| RF-LIC-005 | Asignar un puesto a una Persona (tipo "Por persona") o a un activo (tipo "Por equipo"), con fecha de inicio y quién asignó. | Fase 2, ola B | CA-LIC-03, CA-LIC-04 |
| RF-LIC-006 | Asignar puestos a varias Personas en una sola operación, todo o nada. | Fase 2, ola B | CA-LIC-10 |
| RF-LIC-007 | Liberar un puesto con motivo; la asignación queda en el historial con fecha de inicio y de fin. | Fase 2, ola B | CA-LIC-09 |
| RF-LIC-008 | Informar los puestos "en uso" de un contrato con fecha; cada informe se conserva. | Fase 2, ola B | CA-LIC-07 |
| RF-LIC-009 | Panel de cuadre de puestos por producto: comprados, asignados, en uso, disponibles y estado (En regla, Déficit, Excedente, Sin verificar), con el descargo de que es un cuadre interno. | Fase 2, ola B | CA-LIC-07 |
| RF-LIC-010 | Mostrar la vigencia **calculada al leer** y la lista "Por vencer" con filtro de días. | Fase 2, ola B | CA-LIC-08 |
| RF-LIC-011 | Preparar una renovación (contrato nuevo enlazado al anterior), confirmarla y trasladar las asignaciones tras una vista previa. | Fase 2, ola B | CA-LIC-11 |
| RF-LIC-012 | Terminar un contrato antes de su fecha de fin, con motivo. | Fase 2, ola B | CA-LIC-12 |
| RF-LIC-013 | Declarar a Notificaciones las reglas de aviso del módulo (sección 8); no enviar correos por cuenta propia. | Fase 2, ola B | CA-LIC-13 |
| RF-LIC-014 | Configurar por empresa el porcentaje de excedente, los días para "Sin verificar" y los umbrales de aviso dentro de lo que Notificaciones permite. | Fase 2, ola B | CA-LIC-13 |
| RF-LIC-015 | Importar contratos con el marco único de importación (tipo "contratos de licencia"). Sin claves. | Fase 2, ola B | CA-LIC-14 |
| RF-LIC-016 | Buscar y filtrar (producto, proveedor, estado, tipo, vencimiento, responsable); exportar solo por la puerta única de exportación. | Fase 2, ola B | CA-LIC-15 |
| RF-LIC-017 | Historial de cada contrato: cambios, asignaciones, informes de uso y renovaciones. | Fase 2, ola B | CA-LIC-03 |
| RF-LIC-018 | "Mis licencias": cada usuario con Persona vinculada ve los puestos que tiene asignados. | Fase 2, ola B | CA-LIC-16 |
| RF-LIC-019 | Declarar como fuente de costo el contrato de proveedor (o la orden de compra enlazada) y marcar "Sin respaldo de compra" cuando corresponda. | Fase 2, ola B | CA-LIC-17 |
| RF-LIC-020 | Declarar en el registro de módulo el pendiente "puesto de licencia asignado" y liberar los puestos al cesar la Persona o dar de baja el equipo. | Fase 2, ola B | CA-LIC-09 |
| RF-LIC-021 | Avisar cuando una misma Persona tenga el mismo producto en dos contratos. | Fase 2, ola B | CA-LIC-04 |

### 4.2 Reglas de negocio

| ID | Regla |
|---|---|
| RN-LIC-001 | Todo contrato, asignación e informe lleva empresa. Producto, proveedor, Persona, activo y orden de compra deben ser de la misma empresa: la base lo impide y un identificador de otra empresa responde "no encontrado" (D-025, D-039, D-021.5). |
| RN-LIC-002 | El producto es un SKU activo de una categoría de naturaleza "licencia". Un SKU inactivo no admite contratos nuevos (D-008.3). El modo de control del SKU no cambia mientras tenga contratos (D-008.2). |
| RN-LIC-003 | "Por persona" y "Por equipo": puestos entero mayor que 0. "Concurrente": puestos = tope simultáneo; no se asigna, solo se informa su uso. "Sin límite": no lleva puestos ni cuadre. |
| RN-LIC-004 | La fecha de fin no puede ser anterior a la de inicio. Una licencia perpetua no tiene fecha de fin y nunca vence. |
| RN-LIC-005 | El contrato es válido hasta el final del día de su fecha de fin, en la zona horaria de la empresa. La vigencia se **calcula al leer** (`hoyEnEmpresa()`); no se guarda un estado "Vencido" que un proceso cambie (D-062.2). |
| RN-LIC-006 | Los **puestos** son un número guardado al confirmar el contrato (no una suma calculada sobre campos). `puestos_asignados` nunca supera `puestos` (restricción en la base) y se actualiza en la misma transacción bloqueando la fila del contrato (D-044.6). |
| RN-LIC-007 | El campo de unidad "puestos" de una clave no se edita mientras el contrato esté Vigente o Programado. |
| RN-LIC-008 | Solo se asignan puestos de contratos Vigentes. Un puesto = una asignación abierta. Hay una sola asignación abierta por (contrato, Persona) y por (contrato, activo). |
| RN-LIC-009 | "Por persona" solo se asigna a una Persona Activa. "Por equipo" solo a un activo que no esté De baja ni Extraviado o robado (D-012). |
| RN-LIC-010 | Liberar exige motivo. Las asignaciones no se editan ni se borran: se cierran con fecha de fin (D-019). |
| RN-LIC-011 | Al cesar una Persona, o poner un activo De baja o Extraviado o robado, sus puestos se liberan **en la misma transacción** (evento síncrono, D-038.5) con el motivo "Cese de la Persona" o "Baja del equipo" y quedan en la auditoría. El cese **nunca se bloquea** por puestos (D-061.7). |
| RN-LIC-012 | Un informe de "en uso" no se edita: se agrega otro. Vale el más reciente. Entero de 0 o más. |
| RN-LIC-013 | **Fórmulas del producto:** Comprados = suma de puestos de contratos Vigentes. Asignados = asignaciones abiertas en contratos del producto. En uso = suma del último informe de cada contrato Vigente. Disponibles = Comprados − Asignados. |
| RN-LIC-014 | **Estado del cuadre:** Déficit si Asignados > Comprados o En uso > Comprados. Excedente si Comprados − mayor(Asignados, En uso) es al menos 1 y supera el porcentaje configurado (10 % por defecto). Sin verificar si ningún contrato del producto tiene informe en los últimos 90 días (configurable) y no hay Déficit. En regla en los demás casos. Si coinciden Déficit y Sin verificar, se muestra Déficit. |
| RN-LIC-015 | **Clave:** campo de tipo secreto, cifrado en columna aparte (nunca dentro del JSON de campos), no se busca. Se muestra enmascarada solo con los últimos 4 caracteres cuando tiene 16 o más; si es más corta, menos. Nunca aparece en el historial (dice "clave cambiada"), auditoría, exportaciones (**ni siquiera enmascarada**), importaciones, reportes, tableros, API, webhooks, correos, portal ni registros técnicos (D-035.2). |
| RN-LIC-016 | **Revelar la clave** exige `licencias.ver_clave` y reautenticación reciente (10 minutos). Cada revelación o copia queda en la auditoría sin el valor, con tope de 20 por usuario por hora (al superarlo se avisa a los administradores). La clave se oculta sola a los 30 segundos, con aviso previo y posibilidad de extender. |
| RN-LIC-017 | La serie de una unidad de licencia es un identificador visible. Los campos de unidad "puestos" y "clave" se definen en la categoría (D-005). La unidad de licencia **no** es un activo asignable ni recibe garantía, mantenimiento ni depreciación (D-045). |
| RN-LIC-018 | **Segunda persona (RN-017 del núcleo):** confirmar un contrato exige a otra persona **si el importe total comprometido, con impuesto, en la moneda base supera estrictamente el límite** de la empresa; en otra moneda siempre. No confirma quien creó o editó el contrato desde la última confirmación. Aplica al Administrador. La excepción es solo la casilla «licencias» del interruptor único de la empresa (D-031, D-043): este módulo no tiene excepción propia. Se consulta la función única `requiereSegundaPersona(acto, monto, moneda)`. |
| RN-LIC-019 | Un contrato Vigente solo admite editar: responsable, centro de costo y notas. Puestos, fechas y costo no se editan: para más puestos se crea **otro contrato** ("Ampliación"). Un error de digitación se corrige con motivo, auditado. |
| RN-LIC-020 | Al renovar con menos puestos que los asignados, primero hay que liberar la diferencia; no se descartan asignaciones en silencio. |
| RN-LIC-021 | **Costo:** patrón compartido (D-044.1): importe sin impuesto (4 decimales exactos), % de impuesto, moneda de 3 letras, periodicidad, inicio, fin, centro de costo y `fuente_costo` ∈ {propia, orden de compra, contrato}. Una moneda por contrato, sin conversión. El costo mensual equivalente lo calcula la función única de costos. |
| RN-LIC-022 | **Fuente única:** orden de compra, luego contrato de proveedor, luego registro propio (D-044.3). Como el contrato de licencia es el contrato de proveedor, el libro de costos de `presupuesto-costos` toma el costo una sola vez. Si hay costo y no hay orden de compra enlazada, el contrato queda **"Sin respaldo de compra"** (marca visible y parte del informe mensual); no se bloquea. |
| RN-LIC-023 | Los costos se ven solo con `precios.ver`. Quién tiene cada puesto se ve solo con `datos_personales.ver`; sin él, se ve la referencia `PRS-0042` o un conteo (D-037 fila 7). |
| RN-LIC-024 | **Auditoría y datos personales (D-030):** la auditoría guarda el identificador interno de la Persona, nunca su nombre ni correo. Los textos libres (notas, motivo "Otro") viven en el registro de negocio; la auditoría solo dice que el campo cambió. Los formularios avisan: "No escriba datos personales ni claves". Un validador común rechaza bloques de clave privada y patrones de claves conocidos en todo texto libre (D-063.2). |
| RN-LIC-025 | Los correos de aviso solo contienen nombre del elemento, fecha y días restantes; nunca claves, importes ni nombres de personas (D-061.4, RN-NOT-003). |
| RN-LIC-026 | Nada con historial se borra: los contratos se terminan o se anulan; solo se borra un Borrador que nunca se confirmó. Las asignaciones se liberan. |
| RN-LIC-027 | Al anonimizar una Persona (D-030), sus asignaciones pasadas siguen apuntando a su identificador, que ahora muestra la referencia "Persona anonimizada 0042". No se anonimiza a una Persona con puestos abiertos (D-033.3, D-061.7). |
| RN-LIC-028 | Una unidad (clave) pertenece a un solo contrato. Las claves no entran por Excel: se escriben una a una. |
| RN-LIC-029 | La renovación crea un contrato nuevo enlazado ("renueva a / renovado por"). El contrato anterior no cambia de estado por renovarse: termina por su fecha. La renovación automática de un contrato la ejecuta el "sistema" con la regla y la persona que aprobó el contrato (D-043.5). |

### 4.3 Requisitos de calidad

| ID | Requisito medible | Cuándo | CA |
|---|---|---|---|
| RNF-LIC-001 | Una lista de 5.000 contratos o 50.000 asignaciones muestra su primera página en 2 segundos o menos (95 % de las veces), con 50 filas por página. Volumen de referencia: el único de RNF-010 del núcleo. | Fase 2, ola B | CA-LIC-15 |
| RNF-LIC-002 | Asignar 100 Personas a la vez termina en 10 segundos o menos y es todo o nada. | Fase 2, ola B | CA-LIC-10 |
| RNF-LIC-003 | Con un solo puesto disponible y 20 intentos simultáneos, exactamente 1 tiene éxito y 19 reciben "no hay puestos disponibles". | Fase 2, ola B | CA-LIC-03 |
| RNF-LIC-004 | El 100 % de las revelaciones de clave deja una entrada de auditoría; una búsqueda automática de claves de prueba (secretos de prueba propios, no los de producción) en base, auditoría, registros técnicos, exportaciones y correos no encuentra ninguna. | Fase 2, ola B | CA-LIC-05 |
| RNF-LIC-005 | Los avisos del día los emite Notificaciones a la hora única de la empresa (08:00 por defecto) sin repetir (elemento, umbral, destinatario) y el proceso es idempotente y recuperable (D-038.4). | Fase 2, ola B | CA-LIC-13 |
| RNF-LIC-006 | La vigencia se calcula con el reloj de la plataforma, que las pruebas pueden fijar y adelantar en entornos de prueba; el contrato cambia de estado a la medianoche de la empresa sin ejecutar ningún proceso. | Fase 2, ola B | CA-LIC-08 |
| RNF-LIC-007 | Lista y ficha usables en pantalla de 360 px y con teclado; contraste AA; el estado se muestra con texto, no solo color (D-021.1). | Fase 2, ola B | CA-LIC-15 |

## 5. Estados y transiciones

### 5.1 Contrato de licencia

Estados visibles (los mismos de todo contrato, D-049.5): **Borrador, Programado, Vigente, Vencido, Terminado, Anulado.** Se guardan solo las decisiones (Borrador, Confirmado, Terminado, Anulado); Programado, Vigente y Vencido se calculan al leer con la fecha y la zona de la empresa. "Por vencer" no es estado: es un indicador de un Vigente con menos de N días.

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Borrador | `licencias.crear` | Datos mínimos |
| Borrador | Programado o Vigente | `licencias.confirmar`; si supera el límite, otra persona (RN-LIC-018) | Según la fecha de inicio |
| Borrador | (borrado) | quien lo creó | Nunca confirmado |
| Programado | Vigente | Calculado | Llega la fecha de inicio |
| Vigente | Vencido | Calculado | Pasa la fecha de fin |
| Programado, Vigente, Vencido | Terminado | `licencias.terminar` | Motivo obligatorio |
| Borrador, Programado | Anulado | `licencias.terminar` | Motivo obligatorio; documento emitido por error |

Terminado y Anulado son finales. No hay otras transiciones.

### 5.2 Asignación de puesto

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Abierta | `licencias.asignar` | RN-LIC-008, 009 |
| Abierta | Cerrada | `licencias.asignar`, o automático por RN-LIC-011 | Motivo obligatorio |
| Abierta | Trasladada | Automático al confirmar una renovación | Queda enlazada a la asignación nueva |

## 6. Datos

**Contrato de licencia (extensión de `contrato_proveedor`).** Empresa; identificador interno; contrato de proveedor `CTR-` (1 a 1, único); producto (SKU); tipo; puestos (guardado al confirmar); puestos asignados (con restricción); contrato al que renueva; marca "Sin respaldo de compra". Los datos de proveedor, fechas, costo (patrón D-044.1), renovación y responsable son los del contrato `CTR-`. Estado guardado: Borrador, Confirmado, Terminado, Anulado.

**Unidades vinculadas.** Contrato ↔ unidades (claves) del SKU por serie. Una unidad pertenece a un solo contrato. La unidad lleva: serie (identificador visible), "puestos" (campo de unidad) y la clave (campo secreto, cifrado, columna aparte).

**Clave.** Texto cifrado con versión de llave (llaves derivadas por empresa, D-048.4); últimos 4 caracteres para la máscara cuando corresponde; fecha del último cambio.

**Asignación de puesto.** Contrato; destino (Persona o activo); desde; hasta; quién asignó; quién liberó; motivo (lista o texto); asignación de origen si fue trasladada.

**Informe de uso.** Contrato; puestos en uso; fecha; quién informó; nota (texto libre).

**Configuración de la empresa.** Porcentaje de excedente (10); días para "Sin verificar" (90); umbrales de aviso (los de Notificaciones).

**Datos personales de este módulo (lista declarada, D-061.3).** La Persona asignada a un puesto y el responsable del contrato (por identificador `PRS-`; el nombre vive en la tabla de Personas); las notas e informes de texto libre (pueden contener nombres; no se anonimizan de forma garantizada). Plazo: el de la auditoría (5 años, D-024.1); la anonimización de la Persona (D-030.3) deja la referencia. La tabla única de retención del núcleo incluye este módulo.

**Se audita** (D-018, D-030): alta, cambios con antes y después (salvo campos personales y texto libre), confirmación, renovación, terminación, anulación, asignaciones y liberaciones, informes de uso, **cada revelación de clave** (sin valor), cambio de clave (sin valores), uso de una excepción de la casilla «licencias», importaciones y exportaciones (por el marco y la puerta únicos), cambios de configuración y consultas a la auditoría del módulo.

## 7. Pantallas necesarias

| ID | Pantalla | Propósito | Rol principal |
|---|---|---|---|
| PAN-LIC-01 | Panel de licencias | Cuadre de puestos por producto y lista "Por vencer" | Jefatura TI |
| PAN-LIC-02 | Lista de contratos | Buscar, filtrar; "Exportar" visible y desactivado con la razón si no tiene permiso | Técnico |
| PAN-LIC-03 | Ficha del contrato | Datos, claves enmascaradas, puestos, historial | Técnico |
| PAN-LIC-04 | Alta / edición de contrato | Formulario con producto, tipo, puestos y costo | Técnico |
| PAN-LIC-05 | Asignar y liberar puestos | Individual y masivo, con disponibles a la vista | Técnico |
| PAN-LIC-06 | Informar uso | Registrar puestos en uso con fecha | Técnico |
| PAN-LIC-07 | Renovación | Asistente con vista previa de lo que se traslada | Técnico prepara; Jefatura TI confirma |
| PAN-LIC-08 | Cuadre por producto | Detalle de déficit o excedente, con el descargo | Jefatura TI |
| PAN-LIC-09 | Configuración del módulo | Excedente, días sin verificar, umbrales | Administrador |
| PAN-LIC-10 | Mis licencias | Puestos que tengo asignados | Solicitante y Empleado (portal) |

La importación usa el asistente único "Importar datos" y la exportación la puerta única; este módulo no tiene pantallas propias para ellas.

## 8. Notificaciones y automatismos

Este módulo **no tiene procesos propios**. Declara reglas al motor único de avisos de `notificaciones` (RF-NOT-024, D-062.3): entidad, campo de fecha, umbrales de días y permiso que define a los destinatarios. Notificaciones evalúa una vez al día a la hora única de la empresa (08:00 por defecto), no repite el mismo aviso (elemento, umbral, destinatario), guarda en su tabla única y es idempotente y recuperable (D-038.4). Si el vencimiento se corrige a una fecha futura, se cancelan y recalculan los avisos pendientes.

| Regla / evento | Fecha o hecho | Umbrales | Destinatarios | Texto (variables: nombre, fecha, días) |
|---|---|---|---|---|
| `licencias.contrato_por_vencer` | Fecha de fin del contrato Vigente | Los de Notificaciones (90, 60, 30, 15, 7) y 0 (el día) | Responsable (Persona; si no hay Usuario, su correo verificado; si no, el grupo) y quienes tengan `licencias.recibir_avisos` | "El contrato CTR-000123 vence el 30/11/2026 (faltan 30 días)." |
| `licencias.preaviso_no_renovacion` | Fecha límite de preaviso del contrato con renovación automática | 30 y 7 días antes | Mismos | "Último día para avisar que no se renueva CTR-000123: 15/11/2026." |
| `licencias.producto_en_deficit` | Evento al pasar un producto a Déficit | Al aparecer; resumen semanal mientras persista | Jefatura TI y responsables | "El producto LIC-0007 tiene más puestos asignados o en uso que comprados." |
| `licencias.contrato_sin_respaldo` | Evento al confirmar un contrato sin respaldo de compra | Una vez | Jefatura TI | "El contrato CTR-000130 se confirmó sin orden de compra." |

Apartarse de los umbrales por defecto de Notificaciones solo con el umbral 0 y el preaviso, porque son propios de un contrato con renovación automática (D-058 fila 3). Los avisos de Fase 2 no entran a la v1. Depende del servicio de correo ya escalado al Cliente (CEO) (decisiones.md, "Escalado", dinero 1): este módulo no agrega ningún gasto nuevo.

## 9. Integración con el núcleo y otros módulos

- **SKU y categorías (núcleo).** Los productos son SKU de categorías de naturaleza "licencia" (D-045). Los campos de unidad "puestos" (número) y "clave" (secreto) se definen en la categoría con el motor de campos (D-005, D-035).
- **Inventario.** Si el producto es por serie, las unidades se crean en la recepción de la orden de compra; el contrato se completa después. Un activo que pasa a De baja o Extraviado libera sus puestos de forma síncrona.
- **Órdenes de compra.** Vínculo opcional; con orden, `fuente_costo` = orden de compra y no se duplica el gasto.
- **Proveedores (PRV-B, escuadrón A).** El contrato de licencia **es una extensión** del contrato `CTR-`: reutiliza fechas, costo, renovación y avisos; PRV es dueño del proveedor, el contrato y su estado. El módulo no define estados propios distintos de los seis comunes.
- **Personas (D).** Asignación a Persona; pendiente "puesto asignado" en el registro de módulo; `onboarding-offboarding` lo muestra como tarea y `portal-autoservicio` muestra "Mis licencias". La anonimización de la Persona queda bloqueada mientras haya puestos abiertos.
- **Notificaciones (C).** Sección 8. `mesa-de-ayuda` puede originar una asignación, pero la acción es de este módulo.
- **Presupuesto y reportes (F).** `presupuesto-costos` posee el libro de costos y lee del contrato; `reportes-tableros` llama a los servicios del módulo y lee Comprados, En uso y estado del cuadre (En regla, Déficit, Excedente, Sin verificar). No escriben.
- **CMDB (E).** El elemento de configuración es el **contrato**; la unidad de licencia no genera elemento (D-062.1). La CMDB lee del origen y da un identificador estable; este módulo emite el evento cuando el contrato pasa a Terminado o Anulado.
- **Importación y exportación.** Marco único (D-050) y puerta única de exportación (D-061.1).
- **Auditoría (núcleo).** D-018 y D-030; las referencias a objetos usan claves compuestas con empresa (D-039.7).

## 10. Criterios de aceptación

Cada criterio cita el requisito que cubre. Las pruebas de aislamiento usan identificador interno y dos empresas (D-063.6).

- **CA-LIC-01 (alta y contrato único; RF-LIC-001, 002).** Dado un producto de licencia activo y un proveedor, cuando un técnico crea un contrato, entonces nace en Borrador con un código `CTR-` de 6 dígitos y una sola ficha de contrato de proveedor; borrarlo en Borrador es posible, y uno confirmado solo se termina o anula.
- **CA-LIC-02 (puestos por serie; RF-LIC-003, RN-LIC-006, 007).** Dado un producto por serie con dos claves de 25 puestos, cuando se confirma el contrato, entonces guarda 50 puestos; intentar editar el campo "puestos" de una clave con el contrato Vigente se rechaza.
- **CA-LIC-03 (último puesto; RF-LIC-005, RNF-LIC-003).** Dado un contrato Vigente de 10 puestos con 9 asignados, cuando 20 técnicos asignan el último a la vez a personas distintas, entonces exactamente una asignación tiene éxito, 19 reciben "No hay puestos disponibles" y el contrato queda en 10 de 10 aun si se forzara la escritura (restricción en la base).
- **CA-LIC-04 (sobreasignación y duplicado; RF-LIC-005, 021, RN-LIC-008).** Dado un contrato con 10 de 10 asignados, cuando se intenta asignar otro, entonces se rechaza; y asignar a una Persona que ya tiene puesto del mismo contrato se rechaza, mientras que el mismo producto en otro contrato solo da un aviso.
- **CA-LIC-05 (clave segura; RF-LIC-004, RN-LIC-015, 016).** Dado un contrato con clave de 20 caracteres y un administrador con `licencias.ver_clave`, cuando la revela con reautenticación reciente, entonces la ve completa y se oculta sola a los 30 segundos con aviso previo; la auditoría registra quién, cuándo y contrato **sin la clave**; la lista, la exportación, el correo y la API no la muestran, ni siquiera enmascarada en la exportación.
- **CA-LIC-06 (permiso denegado; RF-LIC-004).** Dado un usuario Solo lectura o un Técnico sin `licencias.ver_clave`, cuando intenta revelar una clave por pantalla o por llamada directa al servidor, entonces recibe "Sin permiso" y queda un intento en la auditoría; con la reautenticación vencida se pide de nuevo; la revelación 21 de la hora se rechaza y avisa a los administradores.
- **CA-LIC-07 (cuadre; RF-LIC-008, 009, RN-LIC-013, 014).** Dado un producto con 50 comprados, 38 asignados y 41 en uso informado, cuando se abre el panel, entonces muestra Excedente (sobran 9, más del 10 %) y Disponibles 12; con 45 asignados y 52 en uso muestra Déficit.
- **CA-LIC-08 (vigencia con reloj fijado; RF-LIC-010, RN-LIC-005, RNF-LIC-006).** Dado un contrato con fecha de fin 30/11/2026 y el reloj de la plataforma fijado en 30/11/2026 23:59 de la zona de la empresa, entonces sigue Vigente; con el reloj en 01/12/2026 00:00 aparece Vencido sin que corra ningún proceso, sus puestos dejan de contar como Comprados y el producto muestra Déficit si hay asignados.
- **CA-LIC-09 (cese de la Persona; RF-LIC-007, 020, RN-LIC-011).** Dado una Persona con 3 puestos, cuando se la cesa, entonces el cese se completa (no se bloquea), los 3 puestos quedan liberados en la misma operación con motivo "Cese de la Persona", Disponibles sube en 3 y la auditoría guarda el identificador de la Persona sin su nombre.
- **CA-LIC-10 (asignación masiva; RF-LIC-006, RNF-LIC-002).** Dado un contrato con 40 disponibles, cuando se asignan 41 Personas de una vez, entonces no se asigna ninguna y se indica cuántos faltan; con 40 se asignan las 40.
- **CA-LIC-11 (renovación y segunda persona; RF-LIC-011, RN-LIC-018, 020).** Dado un contrato con costo total que supera estrictamente el límite de la empresa, preparado por un técnico, cuando el mismo técnico intenta confirmarlo, entonces se rechaza; cuando lo confirma Jefatura TI, entonces el contrato nuevo queda Vigente, las asignaciones se trasladan y el anterior queda enlazado. Con el costo **exactamente igual** al límite no se exige otra persona. Con la casilla «licencias» apagada, ninguna llamada directa a la API permite la excepción.
- **CA-LIC-12 (terminar; RF-LIC-012).** Dado un contrato Vigente, cuando Jefatura TI lo termina sin motivo, entonces se rechaza; con motivo queda Terminado y sus asignaciones aparecen "sin cobertura" en el cuadre.
- **CA-LIC-13 (avisos con dos empresas y reloj fijable; RF-LIC-013, 014, RNF-LIC-005).** Dado un contrato de la empresa A que vence en 30 días y otro de la empresa B que vence en 7, cuando se dispara manualmente el proceso diario con el reloj fijado, dos veces, entonces cada aviso queda en su empresa, con sus destinatarios, una sola vez por elemento, umbral y destinatario, sin claves, importes ni nombres; y un corte a la mitad se recupera al reiniciar sin perder avisos.
- **CA-LIC-14 (importación; RF-LIC-015, RN-LIC-028).** Dado una plantilla de 200 contratos con 1 fila con error, cuando se confirma, entonces no se carga ninguno y se descarga el reporte con fila, columna y motivo; subir otra vez el mismo archivo ya confirmado se rechaza entero; una columna de claves se rechaza.
- **CA-LIC-15 (listas y exportación; RF-LIC-016, RNF-LIC-001, 007).** Dado un usuario sin `datos.exportar`, cuando abre la lista, entonces "Exportar" está visible y desactivado con la razón; con el permiso, la exportación pide motivo y el archivo omite costos y Personas según sus permisos y no trae claves.
- **CA-LIC-16 (mis licencias y alcance propio; RF-LIC-018).** Dado un Solicitante vinculado a una Persona con 2 puestos, cuando abre "Mis licencias", entonces ve solo esos 2; sin Persona vinculada ve la lista vacía, no un error.
- **CA-LIC-17 (costo y respaldo; RF-LIC-019, RN-LIC-022).** Dado un contrato con costo sin orden de compra, cuando se confirma, entonces queda "Sin respaldo de compra" y Jefatura TI recibe un aviso; con una orden enlazada el costo cuenta una sola vez (`fuente_costo` = orden de compra).
- **CA-LIC-18 (aislamiento; RN-LIC-001).** Dado un contrato de la empresa A, cuando un usuario de la empresa B pide su identificador interno, entonces recibe "No encontrado", igual que uno inexistente; no aparece en listas, búsquedas, exportaciones ni avisos de B, y el rol de la aplicación no ve filas de A aunque la consulta omita el filtro.
- **CA-LIC-19 (escritura con referencias cruzadas; RN-LIC-001).** Dado un usuario de B con permiso de asignar, cuando envía por llamada directa una asignación que apunta al contrato de A o a una Persona de A (por identificador interno), entonces recibe "No encontrado", no se escribe nada y no se consume ningún puesto.

## 11. Casos límite

- Contrato que vence hoy: sigue Vigente hasta el final de hoy (RN-LIC-005).
- Renovar con menos puestos que los asignados: se exige liberar antes (RN-LIC-020).
- Producto desactivado con contratos Vigentes: siguen hasta su fin; no admite nuevos.
- Renovación tardía (después de Vencido): permitida; las asignaciones del hueco quedan como "sin cobertura" en el historial.
- Cambio de zona horaria: las fechas de calendario no cambian; la vigencia se recalcula al leer y los avisos pendientes se recalculan.
- Fecha de fin corregida a una fecha futura: se cancelan y recalculan los avisos (D-062).
- Clave perdida o filtrada: se cambia la clave; las lecturas anteriores quedan en la auditoría (sin valor).
- Clave de menos de 16 caracteres: se muestran menos de 4 caracteres de máscara.
- Licencia concurrente: sin asignaciones; solo informe de uso contra el tope.
- Contrato en moneda distinta de la base: siempre cuenta como superior al límite.
- Persona anonimizada: no ocurre con puestos abiertos; sus asignaciones cerradas muestran la referencia.
- Persona Cesada que queda con un informe o nota con su nombre en texto libre: no se garantiza anonimizarlo (D-061.5).
- Empresa sin el módulo activado: el SKU de licencia funciona como en la v1.
- Producto por cantidad de naturaleza "licencia": el contrato es la fuente; el stock del SKU no se mueve.
- Dos contratos del mismo producto con distinta fecha de fin: el cuadre suma solo los Vigentes.
- Fecha cercana a un cambio de día (23:59 y 00:00): la prueba usa el reloj fijable.

## 12. Decisiones propuestas y supuestos

Resultado de cada supuesto según D-057 y D-058 (confirmado, cambiado o retirado).

| ID | Supuesto | Resultado |
|---|---|---|
| SUP-LIC-01 | Fase 2; extiende D-011 y D-023 sin cambiar la v1. | **Confirmado** (D-056: Fase 2, ola B). |
| SUP-LIC-02 | El contrato agrupa una o más claves del SKU por serie; en SKU por cantidad los puestos van en el contrato. | **Confirmado y ajustado** por D-044.6: puestos guardados al confirmar, en SKU por cantidad el contrato es la fuente y el stock no se mueve. |
| SUP-LIC-03 | La clave es un campo secreto, no la serie. | **Aceptado** (D-035, D-058 fila 1). Reemplaza D-011.2. |
| SUP-LIC-04 | "En uso" lo informa una persona. | **Confirmado** como diseño del módulo; `integraciones-api` podría reemplazarlo. |
| SUP-LIC-05 | Cuatro tipos de licencia, lista cerrada. | **Confirmado.** |
| SUP-LIC-06 | Asignar más de lo comprado se rechaza. | **Confirmado**; ahora con restricción en la base (D-044.6). |
| SUP-LIC-07 | Excedente 10 %, "Sin verificar" 90 días, avisos 90/60/30/15/7. | **Confirmado**; los avisos usan los umbrales por defecto de Notificaciones. |
| SUP-LIC-08 | La baja de la Persona libera sus puestos solos. | **Confirmado** (D-058): el cese nunca se bloquea, el pendiente se cierra al liberar de forma síncrona. |
| SUP-LIC-09 | Quien prepara un contrato con costo no lo confirma. | **Cambiado:** ya no es regla propia; aplica la regla única RN-017 (supera estrictamente el límite) y el servicio único de doble control (D-043). Se retiró "cualquier costo mayor que 0". |
| SUP-LIC-10 | Ver clave: Administrador y Técnico por defecto. | **Cambiado** (D-035.4, D-058): Administrador por defecto; Técnico solo si la empresa se lo da. |
| SUP-LIC-11 | "Sin respaldo de compra" no bloquea. | **Confirmado** (D-043.5). |
| SUP-LIC-12 | Las claves no entran por Excel. | **Confirmado** (D-035.2). |
| SUP-LIC-13 | Módulo activable por empresa. | **Confirmado** (D-037 fila 12). |
| SUP-LIC-14 | Los avisos pasan por Notificaciones. | **Confirmado** (D-062.3); sin tabla ni proceso propios. |
| SUP-LIC-15 | El contrato de licencia es extensión del contrato de proveedor (nuevo). | **Decidido** (D-044.4); desaparece `CLI-`. |
| SUP-LIC-16 | La importación usa claves naturales: proveedor + producto + inicio + fin (propuesta para Datos). | **Pendiente de confirmar** por el Ingeniero de Datos; importar solo crea (D-050.2). |

**[ESCALAR AL CEO] E-LIC-01 (tema legal, no urgente).** El panel se llama "cuadre de puestos" y no "cumplimiento legal": es una comparación interna que no sustituye la auditoría de un fabricante. Si la empresa piensa usarlo como evidencia ante un fabricante, conviene un texto de descargo revisado por un abogado (L-12 de Cumplimiento). Mientras tanto se muestra: "Cuadre interno de puestos, no sustituye una auditoría del fabricante".

## 13. Fuera de alcance

- Medición automática de uso (agentes, conexión a Microsoft, Adobe u otros).
- Conciliación de facturas del fabricante.
- Varios niveles de aprobación de renovaciones (D-023).
- Adjuntos (contrato, factura) hasta decisión del Cliente (CEO) (D-022).
- Licencias de uso personal de empleados.
- Reasignación sugerida de puestos sobrantes.
- Conversión de monedas.
- Garantía, mantenimiento y depreciación de licencias.

## 14. Historial de cambios

| Cambio | Decisión o hallazgo que lo motiva |
|---|---|
| Versión 0.2. Estructura de requisitos con columnas ID · Requisito · Cuándo · CA y cada criterio cita su requisito. | Plan de correcciones, regla 0.2; H-AUD-21 |
| La clave es un campo secreto; la serie es el identificador visible; se retiró "la unidad de licencia como activo asignable"; máscara, tope de 20 por hora, reautenticación, 30 s, nunca en exportaciones ni enmascarada. | D-035; H-AUD-01, H-SEG-04 |
| El contrato de licencia es extensión 1 a 1 del contrato `CTR-`; desaparece `CLI-`; estados comunes Borrador, Programado, Vigente, Vencido, Terminado, Anulado; "Cancelado" pasa a "Terminado". | D-044.4, D-049.2, D-049.5; H-DAT-08 |
| Segunda persona con la regla única RN-017 (supera estrictamente el límite); se retiró RN-LIC-016, RN-LIC-017 y RN-LIC-018 anteriores (preparar/confirmar propio, OC y aprobador); casilla «licencias» del interruptor único; sin excepción propia. | D-043, D-031; H-QA-09, H-ARQ-10, H-AUD |
| Puestos guardados al confirmar, restricción `puestos_asignados <= puestos`, bloqueo de fila, único (contrato, Persona) y (contrato, activo), campo "puestos" no editable con contrato vigente; en SKU por cantidad el contrato es la fuente. | D-044.6; H-DAT-06 |
| Naturaleza "licencia": sin garantía, mantenimiento ni depreciación; el elemento de CMDB es el contrato. | D-045, D-062.1; H-ARQ-06, H-AUD-12 |
| Permisos con formato `<módulo>.<acción>`; `licencias.ver_clave` solo Administrador (Técnico opcional); `datos.exportar` y `datos.importar` únicos; se retiraron `licencias.exportar` y `licencias.importar`; Jefatura TI sin exportar; `datos_personales.ver`; columna "Empleado (portal)". | D-036, D-037 filas 1, 2, 7, 11; H-SEG-07, H-SEG-08 |
| Vigencia calculada al leer; se retiraron el proceso nocturno de cambio de estado y el RNF de "1 hora"; avisos por el motor único de Notificaciones, sin tabla propia, hora única. | D-062.2, D-062.3, D-058 fila 3 |
| La sección 8 declara que no hay procesos propios; idempotencia, recuperación y "hoy" por empresa son los de Notificaciones. Se retiró la liberación nocturna: es un evento síncrono. | D-038.4, D-038.5 |
| Liberar puestos al cesar o dar de baja el equipo como pendiente de la persona; el cese no se bloquea; la anonimización se bloquea con puestos abiertos. | D-061.7, D-034, D-033.3 |
| Importación con el marco único (solo crea, huella de archivo, sin claves) y exportación con la puerta única; se retiró la pantalla propia de importación. | D-050, D-061.1 |
| Auditoría sin nombres ni valores personales; textos libres solo "el campo cambió"; validador común de texto libre; datos personales declarados en la sección 6; "Persona anonimizada 0042" en lugar de "dada de baja". | D-030, D-061.3, D-063.2, D-049.5; H-CUM-01 |
| Patrón de costo común con `fuente_costo`; orden de compra > contrato > propio; el libro único lo posee `presupuesto-costos`; se retiró la fórmula propia de costo mensual. | D-044.1 a 3 |
| Descargo legal del cuadre de puestos como E-LIC-01; el panel se llama "cuadre de puestos". | H-CUM, L-12 |
| Pruebas nuevas: procesos con dos empresas y reloj fijable (CA-LIC-13), borde exacto del límite (CA-LIC-11), escritura con referencias cruzadas (CA-LIC-19), aislamiento por identificador interno y con el rol de la aplicación (CA-LIC-18), secretos de prueba propios (RNF-LIC-004). | D-039.6, D-063.6, D-038.8; QA y Seguridad |
| Supuestos resueltos uno a uno (tabla de la sección 12); prefijos `PAN-LIC-nn`; vocabulario "Cliente (CEO)", Persona Cesada, "usted". | D-057, D-058, D-049 |

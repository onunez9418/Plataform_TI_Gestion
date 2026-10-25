# Módulo: Licencias de software (LIC)

**Versión:** 0.1 · **Autor:** Analista de Negocio, escuadrón B · **Estado:** borrador para revisión del Gerente de TI
**Base:** decisiones D-001 a D-029 (`docs/equipo/decisiones.md`), en especial D-005, D-006, D-008, D-011, D-014, D-015, D-018, D-019, D-021 y D-024.

---

## 1. Propósito, alcance y fase

**Propósito.** Que el área de TI sepa, para cada programa de software, cuántos puestos compró, a quién se los dio, cuántos se usan de verdad, cuándo vencen y si la empresa tiene licencias de más (dinero perdido) o de menos (riesgo legal). Además, guardar las claves de licencia de forma segura.

**Entra**
- Contratos de licencia: puestos comprados, tipo, vigencia, costo, responsable.
- Claves de licencia cifradas, con auditoría de cada lectura.
- Asignación de puestos a Personas o a equipos, con historial.
- Puestos "en uso" informados por el responsable.
- Panel de cumplimiento: licencias de más o de menos.
- Vencimientos, avisos y renovación.
- Importación inicial de contratos y exportación.

**No entra**
- Instalar, medir o desinstalar software en los equipos (no hay agente ni conexión con el fabricante).
- Pagos ni facturas: la plataforma registra, no paga.
- Garantía o soporte técnico del software.
- Archivos adjuntos (contrato firmado, factura) hasta que el CEO decida D-022.
- Conciliación contra la consola del fabricante: queda para integraciones (escuadrón F).

**Fase.** [SUPUESTO] SUP-LIC-01: **Fase 2, después de la v1.** En la v1 rigen D-011 y D-023: una licencia es un SKU por serie o por cantidad, sin asignación de puestos ni avisos. Este módulo extiende eso sin cambiarlo. Requiere Etapa 2 (Personas), Etapa 4 (inventario) y el servicio de avisos (módulo `notificaciones`). Cada empresa puede activar o no el módulo.

## 2. Glosario del módulo

| Término | Significado |
|---|---|
| **Producto** | Un SKU de la categoría Licencias (ej. `LIC-0007` Microsoft 365 Business Standard). |
| **Contrato de licencia** | Documento de la empresa con un proveedor: producto, puestos, vigencia y costo. Es un registro con fechas; cuando se renueva se crea otro, enlazado al anterior. |
| **Puesto** | El derecho de uso de una persona o un equipo. Un contrato de 50 puestos permite 50 usos. |
| **Comprados** | Puestos de los contratos Vigentes de un producto. |
| **Asignados** | Puestos que TI entregó a una Persona o a un equipo en la plataforma. |
| **En uso** | Puestos que el responsable informa como realmente usados (ej. el número que muestra la consola del fabricante), con fecha. |
| **Disponibles** | Comprados menos Asignados. |
| **Licencia de más (Excedente)** | Se pagan puestos que nadie asignó ni usa. |
| **Licencia de menos (Déficit)** | Se usan o asignan más puestos de los comprados. |
| **Tipo de licencia** | Por persona, Por equipo, Concurrente (varios usuarios a la vez, hasta un tope) o Sin límite (de sitio). |
| **Clave de licencia** | Código secreto que activa el software. Se guarda **cifrada**: ilegible para quien mire la base de datos. Se muestra **enmascarada**: `••••••••-AB12`. |
| **Persona / Usuario** | Persona recibe puestos; Usuario entra a la plataforma (D-006). |
| **Sin respaldo de compra** | Contrato con costo que no tiene una orden de compra enlazada. |

## 3. Roles y permisos

Alcance de cada permiso: **Todo** o **Propio** (solo lo asignado a la Persona vinculada al usuario). Los permisos sensibles están separados (D-004). Los valores son los **predeterminados**; cada empresa los edita.

| Acción | Permiso | Admin | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Ver contratos, puestos y cumplimiento | `licencias.ver` | Todo | Todo | Todo | — | Propio | Todo |
| Ver costos del contrato | `precios.ver` | Sí | Sí | — | — | — | — |
| Ver a qué personas están asignados los puestos | `datos-personales.ver` | Sí | Sí | Sí | — | Propio | — |
| Crear y editar contratos (borrador y datos) | `licencias.crear` / `licencias.editar` | Sí | — | Sí | — | — | — |
| Confirmar contrato o renovación | `licencias.confirmar` | Sí | Sí | — | — | — | — |
| Cancelar contrato | `licencias.cancelar` | Sí | Sí | — | — | — | — |
| Asignar y liberar puestos | `licencias.asignar` | Sí | — | Sí | — | — | — |
| Informar puestos en uso | `licencias.registrar-uso` | Sí | — | Sí | — | — | — |
| **Ver clave completa** | `licencias.ver-clave` | Sí | — | Sí | — | — | — |
| Escribir o cambiar una clave | `licencias.editar-clave` | Sí | — | Sí | — | — | — |
| Importar contratos | `licencias.importar` | Sí | — | — | — | — | — |
| Exportar | `licencias.exportar` | Sí | Sí | — | — | — | — |
| Configurar avisos y umbrales | `licencias.configurar` | Sí | — | — | — | — | — |
| Recibir avisos | `licencias.recibir-avisos` | Sí | Sí | — | — | — | — |
| Ver auditoría del módulo | `auditoria.ver` | Sí | Sí | — | — | — | — |

Reglas de permisos: todo se comprueba en el servidor (CLAUDE.md regla 6). Nadie se da permisos a sí mismo (D-004). `licencias.ver-clave` nunca viene incluido en otro permiso, ni siquiera el de editar. Un rol nuevo no tiene ninguno.

## 4. Requisitos

### 4.1 Requisitos funcionales

- **RF-LIC-001** Registrar un contrato de licencia con: producto, proveedor, tipo, puestos, fecha de inicio, fecha de fin (o "perpetua"), renovación automática (sí/no), días de preaviso para no renovar, costo, responsable, centro de costo y notas.
- **RF-LIC-002** Un contrato nace en **Borrador**; se borra solo si nunca se confirmó (D-019).
- **RF-LIC-003** Si el producto es **por serie**, el contrato se vincula a una o más unidades (claves) del mismo SKU; los puestos del contrato son la suma del campo de unidad "número de puestos" (D-011.2). Si es **por cantidad**, los puestos se escriben en el contrato.
- **RF-LIC-004** Guardar la clave de licencia cifrada, mostrarla enmascarada y revelarla solo con `licencias.ver-clave`, ocultándola de nuevo sola.
- **RF-LIC-005** Asignar un puesto a una Persona (tipo "Por persona") o a un activo (tipo "Por equipo"), con fecha de inicio y quién lo asignó.
- **RF-LIC-006** Asignar puestos a varias personas en una sola operación (todo o nada), eligiéndolas de una lista.
- **RF-LIC-007** Liberar un puesto con motivo; la asignación queda en el historial con fecha de inicio y fin.
- **RF-LIC-008** Informar los puestos "en uso" de un contrato con fecha; cada informe se conserva.
- **RF-LIC-009** Panel de cumplimiento por producto: comprados, asignados, en uso, disponibles y estado (En regla, Déficit, Excedente, Sin verificar).
- **RF-LIC-010** Calcular automáticamente los estados por vencimiento y mostrar la lista "Por vencer" con filtro de días.
- **RF-LIC-011** Preparar una renovación (nuevo contrato enlazado al anterior) y confirmarla; trasladar las asignaciones al contrato nuevo tras una vista previa.
- **RF-LIC-012** Cancelar un contrato con motivo.
- **RF-LIC-013** Avisos por correo: por vencer, vencido, preaviso de no renovación y déficit detectado.
- **RF-LIC-014** Configurar por empresa los umbrales de aviso, el porcentaje de excedente y los días para considerar "Sin verificar".
- **RF-LIC-015** Importar contratos desde la plantilla (vista previa, todo o nada, sin claves; D-020).
- **RF-LIC-016** Buscar, filtrar (producto, proveedor, estado, tipo, vencimiento, responsable) y exportar (D-021).
- **RF-LIC-017** Mostrar el historial completo de un contrato: cambios, asignaciones, informes de uso y renovaciones.
- **RF-LIC-018** "Mis licencias": cada usuario con Persona vinculada ve los puestos que tiene asignados.
- **RF-LIC-019** Enlazar de forma opcional una orden de compra al contrato; si hay costo y no hay orden, marcar "Sin respaldo de compra".
- **RF-LIC-020** Calcular y exponer el **costo mensual equivalente** por contrato y por centro de costo (para `presupuesto-costos`).
- **RF-LIC-021** Avisar cuando una misma Persona tenga el mismo producto en dos contratos.

### 4.2 Reglas de negocio

- **RN-LIC-001** Todo contrato, asignación e informe lleva empresa. Producto, proveedor, Persona, activo y orden de compra deben ser de la misma empresa; un identificador de otra empresa responde "no encontrado" (D-025, D-021.5).
- **RN-LIC-002** El producto debe ser un SKU activo de categoría Licencias; un SKU inactivo no admite contratos nuevos (D-008.3). El modo de control del SKU no cambia mientras tenga contratos (D-008.2).
- **RN-LIC-003** Tipos "Por persona" y "Por equipo": puestos entero mayor que 0. "Concurrente": puestos = tope simultáneo, no se asignan, solo se informa su uso. "Sin límite": no lleva puestos ni cumplimiento.
- **RN-LIC-004** La fecha de fin no puede ser anterior a la de inicio. Una licencia perpetua no tiene fecha de fin y nunca vence.
- **RN-LIC-005** Un contrato está vigente **hasta el final del día de su fecha de fin**, en la zona horaria de la empresa (D-021.4). Pasa a Vencido al empezar el día siguiente.
- **RN-LIC-006** Solo se asignan puestos de contratos **Vigentes**. Un puesto = una asignación activa. No se puede asignar más allá de los puestos del contrato, aunque dos personas lo intenten a la vez.
- **RN-LIC-007** Una Persona no puede tener dos puestos activos del mismo contrato. El mismo producto en dos contratos solo da un aviso.
- **RN-LIC-008** "Por persona" solo se asigna a una Persona activa. "Por equipo" solo a un activo que no esté De baja ni Extraviado o robado (D-012).
- **RN-LIC-009** Liberar exige motivo. Las asignaciones no se editan ni se borran: se cierran con fecha de fin (D-019).
- **RN-LIC-010** Al dar de baja una Persona, o poner un activo De baja o Extraviado o robado, sus puestos se liberan solos con el motivo "Baja de la persona" o "Baja del equipo", y queda en auditoría. [SUPUESTO] SUP-LIC-08
- **RN-LIC-011** Un informe de "en uso" no se edita: se agrega uno nuevo. Vale el más reciente. Debe ser entero de 0 o más.
- **RN-LIC-012** **Fórmulas del producto:** Comprados = suma de puestos de contratos Vigentes. Asignados = asignaciones activas en esos contratos y en contratos Vencidos con asignaciones aún activas. En uso = suma del último informe de cada contrato Vigente. Disponibles = Comprados − Asignados.
- **RN-LIC-013** **Estado de cumplimiento:** Déficit si Asignados > Comprados o En uso > Comprados. Excedente si Comprados − mayor(Asignados, En uso) supera el porcentaje configurado (por defecto 10 %) y es al menos 1. Sin verificar si ningún contrato del producto tiene informe de uso en los últimos 90 días (configurable) y no hay Déficit. En regla en los demás casos. Si coinciden Déficit y Sin verificar, se muestra Déficit.
- **RN-LIC-014** **Clave:** se guarda cifrada. Se muestra enmascarada (solo los últimos 4 caracteres). Revelarla exige `licencias.ver-clave`. **Cada revelación o copia queda en la auditoría** (quién, cuándo, contrato, desde dónde). La clave nunca aparece en claro en la auditoría, registros técnicos, exportaciones, correos, importaciones ni mensajes de error (D-011.3, D-018.5).
- **RN-LIC-015** Cambiar una clave se audita como "clave cambiada" **sin** valor anterior ni nuevo.
- **RN-LIC-016** Un contrato con costo mayor que 0 lo **confirma una persona distinta** de quien lo preparó (igual que D-015.3). Aplica también al Administrador, salvo la excepción por empresa de D-015.4, que se avisa en pantalla y se audita.
- **RN-LIC-017** Si el costo supera el monto límite de aprobación de la empresa (D-015.1; solo se compara en moneda base, otra moneda siempre cuenta como superior) y no hay orden de compra Aprobada, Emitida o Recibida, el contrato se confirma igual pero queda **Sin respaldo de compra**, visible y avisado a Jefatura TI. No se bloquea para no perder una renovación.
- **RN-LIC-018** Quien registró una orden de compra enlazada no es quien la aprobó para efectos de este contrato; si el confirmador aprobó esa orden, se rechaza (mismo patrón de D-015.3b), salvo la excepción de D-015.4.
- **RN-LIC-019** Un contrato Vigente solo admite editar: responsable, centro de costo, notas, preaviso y renovación automática. Puestos, fechas y costo no se editan: para más puestos se crea **otro contrato** ("Ampliación"). Los errores de digitación se corrigen con una corrección con motivo, auditada.
- **RN-LIC-020** Al renovar con menos puestos que los asignados, primero hay que liberar la diferencia. No se descartan asignaciones en silencio.
- **RN-LIC-021** Costos: importe **sin impuesto** con 4 decimales exactos, porcentaje de impuesto, moneda de 3 letras, periodicidad (mensual, anual, única). Una moneda por contrato y sin conversión (D-014). Se ven solo con `precios.ver`.
- **RN-LIC-022** Costo mensual equivalente = importe del período ÷ meses del período (mensual: ÷1; anual: ÷12; única con fecha de fin: ÷ meses entre inicio y fin; única perpetua: no se prorratea y se informa como "compra única").
- **RN-LIC-023** Nada con historial se borra: los contratos se cancelan o vencen; solo se borra un Borrador que nunca se confirmó.
- **RN-LIC-024** "Solo lectura" no ve costos ni a quién está asignado cada puesto salvo que se le active (D-004.4). Los correos de aviso **no** incluyen claves, importes ni nombres de personas.
- **RN-LIC-025** Al anonimizar una Persona (D-024), sus asignaciones pasadas conservan la referencia "Persona dada de baja 0042".
- **RN-LIC-026** Una clave no se comparte entre contratos de empresas distintas; dentro de la empresa, una unidad (clave) pertenece a un solo contrato.

### 4.3 Requisitos de calidad

- **RNF-LIC-001** Una lista de 5.000 contratos o 50.000 asignaciones muestra su primera página en 2 segundos o menos (95 % de las veces). Volumen supuesto hasta tener la cifra real (pendiente #4).
- **RNF-LIC-002** Asignar 100 personas a la vez termina en 10 segundos o menos y es todo o nada.
- **RNF-LIC-003** Con un solo puesto disponible y 20 intentos simultáneos, exactamente 1 tiene éxito y 19 reciben "no hay puestos disponibles".
- **RNF-LIC-004** El 100 % de las revelaciones de clave genera una entrada de auditoría; una búsqueda automática de claves de prueba en auditoría, registros, exportaciones y correos no encuentra ninguna.
- **RNF-LIC-005** Los avisos del día se generan antes de las 08:00 hora de la empresa y no se repite el mismo aviso (mismo contrato y umbral) en el mismo día.
- **RNF-LIC-006** Un contrato pasa a Vencido a más tardar 1 hora después de medianoche de la empresa.
- **RNF-LIC-007** Una clave revelada se oculta sola a los 30 segundos y al cambiar de pantalla.
- **RNF-LIC-008** Lista y ficha usables en celular y con teclado; los estados se muestran con texto, no solo color (D-021.1).

## 5. Estados y transiciones

### 5.1 Contrato de licencia

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nuevo) | Borrador | `licencias.crear` | Datos mínimos |
| Borrador | Por iniciar | `licencias.confirmar`, distinto de quien preparó si hay costo (RN-LIC-016) | Fecha de inicio futura |
| Borrador | Vigente | igual que arriba | Fecha de inicio hoy o pasada |
| Borrador | (borrado) | quien lo creó | Nunca confirmado |
| Por iniciar | Vigente | Automático | Llega la fecha de inicio |
| Vigente | Vencido | Automático | Pasa la fecha de fin (RN-LIC-005) |
| Vigente | Renovado | `licencias.confirmar` al confirmar la renovación | Contrato nuevo creado y enlazado |
| Vencido | Renovado | `licencias.confirmar` | Renovación tardía permitida |
| Por iniciar, Vigente, Vencido | Cancelado | `licencias.cancelar` | Motivo obligatorio |

Estados finales: Renovado y Cancelado. "Por vencer" **no es un estado**: es un indicador de un Vigente con menos de N días. No hay otras transiciones.

### 5.2 Asignación de puesto

| Desde | Hacia | Quién | Condición |
|---|---|---|---|
| (nueva) | Activa | `licencias.asignar` | RN-LIC-006, 007, 008 |
| Activa | Liberada | `licencias.asignar` o automático (RN-LIC-010) | Motivo obligatorio |
| Activa | Trasladada | Automático al confirmar una renovación | Queda enlazada a la asignación nueva |

## 6. Datos

**Contrato de licencia.** Empresa; código correlativo propio (`CLI-000123`, único por empresa, nunca reutilizado, D-007.8); producto (SKU); proveedor; tipo; puestos; inicio; fin; perpetua (sí/no); renovación automática; días de preaviso; importe sin impuesto; % de impuesto; moneda; periodicidad; centro de costo; responsable (Persona); orden de compra vinculada (opcional); contrato anterior (si es renovación); estado; notas; quién lo preparó y quién lo confirmó. Único: código por empresa.

**Unidades vinculadas.** Contrato ↔ unidades (claves) del SKU por serie. Una unidad pertenece a un solo contrato. [SUPUESTO] SUP-LIC-03: la unidad lleva un **identificador visible** como serie (ej. `M365-2026-A`) y la clave va en un **campo de unidad de tipo "secreto"**, no como serie, para que la serie pueda corregirse y buscarse sin exponer la clave (D-017.1 guarda valores anterior y nuevo).

**Clave.** Texto cifrado; últimos 4 caracteres para la máscara; fecha del último cambio. Nada más.

**Asignación de puesto.** Contrato; destino (Persona o activo); desde; hasta; quién asignó; quién liberó; motivo de liberación; asignación de origen si fue trasladada.

**Informe de uso.** Contrato; puestos en uso; fecha del informe; quién informó; nota.

**Configuración de la empresa.** Umbrales de aviso (por defecto 90, 60, 30, 15 y 7 días); % de excedente (10); días para "Sin verificar" (90); grupo destinatario.

**Se audita** (D-018): alta, cambios con antes y después, confirmación, renovación, cancelación, asignaciones y liberaciones, informes de uso, **cada lectura de clave**, cambio de clave (sin valores), uso de la excepción de D-015.4, importaciones, exportaciones, cambios de configuración y consultas a la auditoría del módulo. No se audita ni se guarda: la clave en claro.

## 7. Pantallas necesarias

| Pantalla | Propósito | Rol principal |
|---|---|---|
| Panel de licencias | Cumplimiento por producto y lista "Por vencer" | Jefatura TI |
| Lista de contratos | Buscar, filtrar, exportar | Técnico |
| Ficha del contrato | Datos, claves enmascaradas, puestos, historial | Técnico |
| Alta / edición de contrato | Formulario con producto, tipo, puestos, costo | Técnico |
| Asignar y liberar puestos | Individual y masivo, con puestos disponibles a la vista | Técnico |
| Informar uso | Registrar puestos en uso con fecha | Técnico |
| Renovación | Asistente con vista previa de lo que se traslada | Técnico prepara; Jefatura confirma |
| Cumplimiento por producto | Detalle de déficit o excedente | Jefatura TI |
| Importación de contratos | Plantilla, simulacro y confirmación | Administrador |
| Configuración de avisos | Umbrales y destinatarios | Administrador |
| Mis licencias | Puestos que tengo asignados | Solicitante |

## 8. Notificaciones y automatismos

| Cuándo | A quién | Qué dice (sin claves, importes ni nombres) |
|---|---|---|
| 90, 60, 30, 15 y 7 días antes de la fecha de fin | Responsable del contrato y grupo con `licencias.recibir-avisos` | "El contrato CLI-000123 (Microsoft 365) vence el 30/11/2026. Renovación automática: sí." |
| Día del vencimiento y cada 7 días hasta atenderlo (máximo 4) | Mismos | "El contrato CLI-000123 venció. Hay puestos asignados sin cobertura." |
| Fecha límite de preaviso (si renovación automática) | Mismos | "Último día para avisar que no se renueva CLI-000123: 15/11/2026." |
| Un producto pasa a Déficit | Jefatura TI y responsables | "El producto LIC-0007 tiene más puestos asignados o en uso que comprados." Un aviso al aparecer y un resumen semanal mientras persista. |
| Contrato confirmado "Sin respaldo de compra" | Jefatura TI | "El contrato CLI-000130 se confirmó sin orden de compra." |
| Todas las noches | Automático | Pasar Por iniciar a Vigente y Vigente a Vencido; recalcular cumplimiento; liberar puestos por bajas. |

El envío lo hace el módulo `notificaciones` (SUP-LIC-14). Si un responsable no tiene correo, el aviso va al grupo. Depende del servicio de correo que el CEO ya tiene escalado (decisiones.md, "Escalado", dinero 1); este módulo no agrega ningún gasto nuevo.

## 9. Integración con el núcleo y otros módulos

- **SKU y categorías (núcleo).** Los productos son SKU de categoría Licencias. Los campos de unidad "número de puestos" y "clave" se definen en la categoría (D-005).
- **Inventario.** Si el producto es por serie, las unidades se crean en la recepción de la orden de compra; el contrato se completa después. Un activo que pasa a De baja o Extraviado libera sus puestos.
- **Órdenes de compra.** Vínculo opcional; la renovación puede nacer de una orden. Si hay orden, **cuenta la orden y `presupuesto-costos` no duplica** el gasto.
- **Personas (D).** Asignación a Persona; la baja de una Persona libera sus puestos; `onboarding-offboarding` muestra "licencias a recuperar"; `portal-autoservicio` muestra "Mis licencias".
- **Proveedores (PRV, escuadrón A).** El proveedor sale de su catálogo; un contrato de PRV (dueño de proveedor, contrato, SLA y valor del período) puede enlazarse de forma opcional. Este módulo guarda solo el derecho de uso, su vencimiento y su costo de licencia; si hay contrato de PRV enlazado, `presupuesto-costos` no suma ambos valores. La garantía y el soporte de software no son de este módulo ni de `garantias-mantenimiento`: si hay soporte, va como contrato en PRV.
- **Notificaciones (C).** Ejecutan el envío de las reglas de la sección 8. `mesa-de-ayuda` puede originar una asignación, pero la acción es de este módulo.
- **Presupuesto y reportes (F).** Leen costo mensual equivalente, Comprados, En uso y estado (En regla, Déficit, Excedente, Sin verificar). No escriben.
- **CMDB (E).** Crea un elemento de configuración por contrato, solo con referencia, nombre y estado; el vencimiento se consulta, no se copia. Este módulo da un identificador estable por contrato y avisa a la CMDB cuando pasa a Vencido, Renovado o Cancelado.
- **Auditoría (núcleo).** Todo el registro de la sección 6 usa el mecanismo general de D-018.

## 10. Criterios de aceptación

- **CA-LIC-01 (último puesto).** Dado un contrato Vigente de 10 puestos con 9 asignados, cuando dos técnicos asignan el último puesto a la vez a personas distintas, entonces uno tiene éxito y el otro recibe "No hay puestos disponibles"; el contrato queda con 10 asignados.
- **CA-LIC-02 (sin sobreasignar).** Dado un contrato con 10 de 10 puestos asignados, cuando un técnico intenta asignar otro, entonces se rechaza con mensaje claro y no se crea la asignación.
- **CA-LIC-03 (vencimiento).** Dado un contrato con fecha de fin 30/11/2026, cuando llega el 01/12/2026 en la zona horaria de la empresa, entonces pasa a Vencido, sus puestos dejan de contar como Comprados y el producto muestra Déficit si hay asignados.
- **CA-LIC-04 (cumplimiento).** Dado un producto con 50 comprados, 38 asignados y 41 en uso informado, cuando se abre el panel, entonces muestra Excedente (sobran 9, más del 10 %) y Disponibles 12.
- **CA-LIC-05 (clave segura).** Dado un contrato con clave, cuando un técnico con `licencias.ver-clave` la revela, entonces la ve completa 30 segundos, y la auditoría registra quién, cuándo y contrato **sin** la clave; en la lista y en la exportación solo aparece enmascarada.
- **CA-LIC-06 (permiso denegado).** Dado un usuario Solo lectura, cuando intenta revelar una clave por pantalla o por llamada directa al servidor, entonces recibe "Sin permiso" y queda un intento en la auditoría; no se muestra ningún dato de la clave.
- **CA-LIC-07 (aislamiento).** Dado un contrato de la empresa A, cuando un usuario de la empresa B pide su identificador, entonces recibe "No encontrado", igual que si no existiera; tampoco aparece en búsquedas, exportaciones ni avisos de B.
- **CA-LIC-08 (separación de funciones).** Dado un técnico que preparó una renovación con costo, cuando intenta confirmarla, entonces se rechaza; cuando la confirma Jefatura TI, entonces el contrato anterior pasa a Renovado, el nuevo a Vigente y se muestra a quién se trasladaron las asignaciones.
- **CA-LIC-09 (baja de persona).** Dado una Persona con 3 puestos, cuando se la da de baja, entonces los 3 puestos quedan liberados con motivo "Baja de la persona", los puestos disponibles suben en 3 y queda en la auditoría.
- **CA-LIC-10 (importación).** Dado una plantilla de 200 contratos con 1 fila con error, cuando se confirma, entonces no se carga ninguno y se descarga el reporte con fila, columna y motivo; subir la plantilla corregida dos veces no duplica contratos.
- **CA-LIC-11 (aviso sin duplicados).** Dado un contrato que vence en 30 días, cuando el proceso diario corre dos veces el mismo día, entonces se envía un solo aviso de 30 días, sin claves ni importes.
- **CA-LIC-12 (mis licencias).** Dado un Solicitante vinculado a una Persona con 2 puestos, cuando abre "Mis licencias", entonces ve solo esos 2 y no el resto del módulo.

## 11. Casos límite

- Contrato que vence hoy: sigue Vigente hasta el final de hoy (RN-LIC-005).
- Renovar con menos puestos que los asignados: se exige liberar la diferencia antes (RN-LIC-020).
- Producto desactivado con contratos Vigentes: los contratos siguen hasta su fin; no admite nuevos.
- Renovación hecha después del vencimiento: permitida; las asignaciones no cubiertas durante el hueco quedan en el historial como "sin cobertura".
- Cambio de zona horaria de la empresa: las fechas de calendario no cambian; el vencimiento se recalcula con la zona nueva.
- Corrección de la fecha de fin: se recalculan los avisos pendientes y se audita con motivo.
- Clave perdida o filtrada: se cambia la clave (RN-LIC-015); no hay forma de "borrar" la lectura anterior de la auditoría.
- Licencia concurrente: sin asignaciones; solo informe de uso contra el tope.
- Contrato en moneda distinta de la base: siempre cuenta como superior al límite de aprobación (RN-LIC-017).
- Persona anonimizada con asignaciones históricas: conserva la referencia anónima (RN-LIC-025).
- Empresa sin el módulo activado: el SKU de licencia funciona como en la v1 (D-011).
- Importación con claves en el archivo: la columna se rechaza (SUP-LIC-12).
- Un puesto "Por equipo" cuyo activo se reasigna a otra persona: el puesto sigue con el equipo.

## 12. Decisiones propuestas y supuestos

- **SUP-LIC-01** [SUPUESTO] El módulo es Fase 2 y extiende D-011/D-023 sin cambiar la v1. Motivo: D-011.1 y D-023.2 dejan fuera asignación de puestos y avisos de la v1.
- **SUP-LIC-02** [SUPUESTO] El contrato agrupa una o más claves (unidades) del SKU por serie; en SKU por cantidad los puestos se escriben en el contrato. Motivo: evita doble registro y cubre 50 puestos en una clave o 10 claves de 1 puesto.
- **SUP-LIC-03** [SUPUESTO] La clave es un campo de unidad de tipo "secreto", distinto de la serie. **Ajusta el texto de D-011.2** ("cada clave es una serie"). Motivo: la serie se corrige con valor anterior y nuevo en el historial (D-017.1) y se busca por pantalla; si fuera la clave, se filtraría. Revisar con Arquitecto y Seguridad.
- **SUP-LIC-04** [SUPUESTO] "En uso" es un número que informa una persona, con fecha. Motivo: no hay conexión con los fabricantes; luego `integraciones-api` puede reemplazarlo.
- **SUP-LIC-05** [SUPUESTO] Tipos de licencia: lista cerrada de cuatro (Por persona, Por equipo, Concurrente, Sin límite).
- **SUP-LIC-06** [SUPUESTO] Asignar más allá de lo comprado se rechaza. El Déficit solo aparece por vencimiento, baja de contrato o dato de uso. Motivo: protege el dinero.
- **SUP-LIC-07** [SUPUESTO] Valores por defecto: avisos a 90, 60, 30, 15 y 7 días; excedente 10 %; "Sin verificar" a 90 días. Editables por empresa.
- **SUP-LIC-08** [SUPUESTO] La baja de una Persona libera sus puestos solos (no bloquea). Motivo: no hay costo inmediato y con 8 licencias por persona bloquear estorba. Coordinado con escuadrón D.
- **SUP-LIC-09** [SUPUESTO] Quien prepara un contrato con costo no lo confirma (D-015 aplicado). Motivo: mueve dinero.
- **SUP-LIC-10** [SUPUESTO] Ver clave: predeterminado a Administrador y Técnico. Motivo: el técnico la necesita para instalar; cada lectura se audita.
- **SUP-LIC-11** [SUPUESTO] "Sin respaldo de compra" no bloquea, solo marca y avisa.
- **SUP-LIC-12** [SUPUESTO] Las claves no entran por Excel; se escriben una a una. Motivo: los archivos importados se guardan hasta 30 días (D-020.8).
- **SUP-LIC-13** [SUPUESTO] El módulo se activa por empresa.
- **SUP-LIC-14** [SUPUESTO] Los avisos pasan por el módulo `notificaciones`; este módulo solo declara la regla (entidad, fecha, umbrales, destinatarios por permiso). Acordado con el escuadrón C: los textos usan solo variables de lista cerrada (nombre del elemento, fecha, días restantes); evalúa una vez al día; si el vencimiento se corrige a una fecha futura, se cancelan y recalculan los avisos pendientes.
- **[ESCALAR AL CEO]** (tema legal, no urgente): el panel dice "cumplimiento" pero es un cuadre interno; no reemplaza la auditoría de un fabricante. Si la empresa piensa usarlo como evidencia ante un fabricante, conviene un texto de descargo revisado por un abogado. Hasta entonces se muestra el aviso "Cuadre interno de puestos, no sustituye una auditoría del fabricante".

## 13. Fuera de alcance

- Medición automática de uso (agentes, conexión a Microsoft, Adobe u otros).
- Conciliación de facturas del fabricante.
- Varios niveles de aprobación de renovaciones (D-023).
- Adjuntos (contrato, factura) hasta decisión del CEO (D-022).
- Licencias de uso personal de empleados (no se guardan datos personales extra, D-006).
- Reasignación sugerida de puestos sobrantes entre departamentos.
- Conversión de monedas.

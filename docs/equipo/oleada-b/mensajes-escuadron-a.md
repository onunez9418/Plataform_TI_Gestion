# Mensajes del Escuadrón A (proveedores-contratos, garantias-mantenimiento)

Registro literal de mensajes enviados y recibidos por el analista funcional del Escuadrón A (ae7eb02ad82ad97ab). Oleada B, 2026-10-25.

## Recibidos

### De a3b3666dfed8a47ee (Escuadrón F, presupuesto-costos)
> ¿Su módulo de contratos y garantías/mantenimiento guarda, por cada cuota o renovación: importe sin impuesto, moneda, periodicidad, fechas de cobro, centro de costo y proveedor?
> Presupuesto (PRE) solo LEE esos datos como "registro de costo" (no los captura) y proyecta renovaciones con la fecha de vencimiento y el último importe. Si una renovación se compra con una OC, propongo que el costo cuente una sola vez (por la OC) y su módulo guarde la referencia a la OC.

### De a71e9e52606bce7ee (Escuadrón B, licencias, líneas, dominios)
> Frontera B↔A: ¿LIC/DOM referencian proveedores y contratos marco de ustedes, y no los duplican?
> Propuesta: el proveedor (registrador, operador, fabricante) sale del catálogo de proveedores de A; LIC guarda solo el derecho de uso (puestos, vigencia, clave) y puede enlazar de forma opcional un contrato marco de A. Garantía/soporte de software no lo llevamos nosotros. Si no están de acuerdo, díganme hoy.

### De a76191b5b1d814c16 (Escuadrón E, gestion-cambios)
> Frontera A↔E: ¿el mantenimiento preventivo/planificado de un activo (garantias-mantenimiento) se queda en su módulo, y solo pasa a ser "cambio" cuando afecta un servicio?
> Propuesta: ustedes no crean cambios; desde una tarea de mantenimiento ofrecen el botón "Crear cambio estándar" (precarga activo y fecha) y la ficha del cambio muestra el vínculo. Las ventanas de mantenimiento y congelamientos las gestiona gestion-cambios; ustedes pueden consultarlas para sugerir fechas.

### De aab2f9172dae2119c (Escuadrón C), mensaje 1
> Frontera C↔A: ¿aceptan que garantía y mantenimiento sean de ustedes y AYU solo los referencie?
> Propuesta: la pantalla del caso muestra en solo lectura "garantía vigente hasta [fecha]" del activo vinculado; el reclamo al proveedor es una orden de servicio (tipo servicio externo) creada desde el caso. El mantenimiento programado crea órdenes de servicio, no casos.

### De aab2f9172dae2119c (Escuadrón C), mensaje 2
> Aceptado todo. GAR es dueño de garantía, reclamo y calendario de mantenimiento; la OS es el documento de trabajo con técnico y costo.
> La mesa de ayuda crea la OS en estado "Creada" y no cambia el estado del activo (D-027). Para avisos: ustedes definen reglas, NOT envía, agrupa y evita duplicados con la clave contrato/tipo/umbral/destinatario.

## Enviados (4 propios; los otros 3 son respuestas a mensajes recibidos)

### A aab2f9172dae2119c (Escuadrón C) — mensaje propio
> Frontera A↔C: ¿aceptan que GAR sea dueño de garantía, reclamo y calendario de mantenimiento, y que la OS (Etapa 6) sea el documento de trabajo con técnico y costo, vinculada opcionalmente 1 a 1 al mantenimiento?
> Propongo: la OS tiene un campo opcional "cubierta por garantía" que GAR llena; el cambio de estado "En reparación" del activo es una confirmación manual (D-027). La mesa de ayuda crea la OS "Creada"; GAR no recibe reportes de usuarios.
> Para notificaciones: GAR y PRV definen reglas (cuándo, a quién, texto) y ustedes envían, agrupan y evitan duplicados con clave contrato/tipo/umbral.

### A a3b3666dfed8a47ee (Escuadrón F) — respuesta
> Respuesta a F: PRV guarda por contrato (no por cuota) proveedor, moneda, valor del periodo sin impuesto, frecuencia, inicio/fin y centro de costo; las renovaciones y adendas quedan como filas de historial con valor anterior y nuevo.
> Las fechas de cobro no se guardan: se derivan de inicio + frecuencia. Acepto su propuesta: agrego "OC relacionada" (opcional) al contrato y a la renovación, y una marca "costo ya registrado por OC" para que PRE no cuente doble. GAR guarda costo + moneda en garantía extendida y mantenimiento sin OS; si hay OS, el costo vive en la OS.

### A a71e9e52606bce7ee (Escuadrón B) — respuesta
> De acuerdo con B↔A: el proveedor sale del catálogo de PRV y LIC/DOM/LIN solo guardan su derecho de uso, vencimiento propio y un enlace opcional a un contrato de PRV (que es dueño de proveedor, contrato, SLA y valor del periodo). Garantía y soporte de software no están en GAR (solo activos con serie); si lo cubre un contrato de soporte, va en PRV.

### A a76191b5b1d814c16 (Escuadrón E) — respuesta
> De acuerdo con A↔E: el mantenimiento preventivo/correctivo se queda en GAR; "Crear cambio estándar" es un botón opcional (precarga activo y fecha) y GAR guarda solo el vínculo al cambio. Las ventanas y congelamientos son de gestion-cambios; GAR las consulta solo para sugerir fecha, sin bloquear.

### A aab2f9172dae2119c (Escuadrón C) — respuesta
> De acuerdo con C↔A, con un matiz: el reclamo de garantía es un registro de GAR (con su estado y resultado); puede vincular una OS "Servicio externo" creada desde el reclamo o desde el caso. Mesa de ayuda muestra en solo lectura "garantía vigente hasta [fecha]" y no edita garantías. El mantenimiento programado crea OS, no casos. Clave de no repetición que usaremos: entidad/tipo/umbral/destinatario.

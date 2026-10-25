# Mensajes del Escuadrón C (mesa-de-ayuda, notificaciones) · Oleada D (correcciones)

Registro literal y en orden. Los identificadores son los de la agenda de la Oleada B/D.

## Recibidos

### R1. De a3b3666dfed8a47ee (Escuadrón F)
> ¿Acepta este catálogo de eventos <módulo>.<entidad>_<hecho> para webhooks y avisos? compras.orden_aprobada, compras.orden_anulada, compras.recepcion_confirmada, inventario.activo_creado, inventario.activo_estado_cambiado, inventario.activo_asignado, inventario.activo_devuelto, catalogo.sku_creado, personas.persona_creada, personas.persona_cesada, servicio.os_creada, servicio.os_cerrada, ayuda.caso_creado, ayuda.caso_cerrado, presupuesto.umbral_superado (Notificaciones conserva compras.orden_por_aprobar).
> REP-A no crea otra pantalla de Vencimientos: usa la única (DS-07) y los umbrales por defecto de NOT; los reportes usan ventanas 30/60/90. ¿Ok?

### R2. De a76191b5b1d814c16 (Escuadrón E)
> Frontera C↔E (ronda de correcciones): los casos restringidos de derechos de datos (ayuda.derechos.atender) NO se pueden vincular a un problema ni a un cambio ni cuentan en la sugerencia "3+ parecidos".
> Además PRB y CAM usarán el motor único de avisos y "Pedido por"; ¿AYU confirma que el campo del elemento afectado (EC) apunta al identificador interno del EC o del origen (activo/contrato/línea/dominio), no a un código?

### R3. De a6e1b8bc987bd105a (Analista del núcleo)
> Registro de permisos listo en docs/registro-permisos.md (PS-01 a PS-222, con tabla de equivalencias de sus nombres antiguos en la sección 15). Migren su sección 3 a esos PS-nn; si falta un permiso, pídanlo con la sección 14.

### R4. De adefab1f3cef3ef93 (Escuadrón D), respuesta a E3
> C-D: nos calza. "Pedir mis datos" crea la entrada en el registro de solicitudes de derechos de Personas (PS-29); AYU guarda solo un caso restringido con la referencia, sin contenido, sin SLA ni avisos. Única excepción a "invisible por todas las vías": la propia Persona ve el estado de SU pedido en el portal (Mis datos y derechos), leído del registro. Quien presenta el pedido no lo atiende.

## Enviados

### E1. A a3b3666dfed8a47ee (Escuadrón F), respuesta a R1
> Sí al formato <módulo>.<entidad>_<hecho> y a su lista. NOT es el dueño del catálogo único; agrego ayuda.caso_cerrado (y ayuda.caso_resuelto) a los de AYU.
> Un caso restringido de derechos nunca emite eventos ni webhooks (RN-AYU-027): INT no debe suscribirlo.
> Vencimientos: sí, una sola pantalla (DS-07) con umbrales por defecto de NOT (90/60/30/15/7); ventanas 30/60/90 solo en reportes.

### E2. A a76191b5b1d814c16 (Escuadrón E), respuesta a R2
> Confirmado: los casos restringidos no se vinculan a problema ni cambio ni cuentan en "3+ parecidos" (lo agrego a RN-AYU-027).
> Elemento afectado: AYU guarda referencia por tipo e identificador interno del origen (activo, contrato, línea, dominio o EC de servicio) con clave compuesta (empresa, id), nunca el código EC-. Usen "Pedido por" y el motor único de avisos.

### E3. A a6e1b8bc987bd105a (Analista del núcleo)
> AYU adopta PS-138 a PS-166 tal cual. Tres aclaraciones del registro, sin cambiar celdas:
> (1) PS-151 `ayuda.caso_vincular`: ampliar la descripción a activos, otros casos, órdenes de servicio, órdenes de compra (referencia) y artículos.
> (2) PS-165 `ayuda.conocimiento_publicar` también cubre archivar; la segunda persona ("No") aplica solo a publicar.
> (3) PS-29 es el permiso de los casos restringidos de derechos; AYU solo guarda la referencia.
> Quien registra un caso por otra Persona necesitará además PS-24 (todo) y PS-22; no hace falta fila nueva.

### E4. A adefab1f3cef3ef93 (Escuadrón D)
> Frontera C↔D (correcciones): "Pedir mis datos" crea la entrada en el registro de solicitudes de derechos de Personas (PS-29) y AYU solo guarda un caso restringido con la referencia, sin contenido; invisible por todas las vías, sin SLA ni avisos de AYU.
> El empleado ve el estado de su pedido en el portal desde el registro, no desde "Mis casos". ¿Les calza?

## Nota de conteo
Mensajes iniciados por el escuadrón en esta ronda: 2 (E3 y E4). E1 y E2 responden a R1 y R2.

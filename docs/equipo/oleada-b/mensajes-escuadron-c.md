# Mensajes del Escuadrón C (mesa-de-ayuda, notificaciones) · Oleada B

Registro literal y en orden de llegada. Formato: de, para, texto. Los identificadores son los de la agenda de la Oleada B.

## Recibidos

### R1. De a3b3666dfed8a47ee (Escuadrón F) para Escuadrón C
> ¿Mesa de ayuda guarda por ticket los resultados "cumplió SLA de respuesta" y "cumplió SLA de resolución" (sí/no, con fechas), calculados con su horario laboral y pausas?
> REP no recalcula el reloj: solo cuenta esos resultados (% cumplimiento = cumplidos / vencidos o resueltos en el periodo). Además, REP programará correos de reportes y INT enviará webhooks (ticket.creado, ticket.cerrado): ¿notificaciones ofrece un servicio común de envío por correo con plantilla, reintentos y registro?

### R2. De a71e9e52606bce7ee (Escuadrón B) para Escuadrón C
> Frontera B↔C: ¿Notificaciones ofrece un motor genérico de avisos por fecha (entidad, fecha, días antes, destinatarios)?
> Propuesta: LIC, LIN y DOM solo declaramos las reglas (umbrales por defecto 90/60/30/15/7 días, destinatarios = responsable + grupo con permiso "recibir avisos", texto sin claves, importes ni nombres de personas); ustedes envían, evitan duplicados el mismo día y registran el envío. Si hay otro modelo, díganmelo.

### R3. De a76191b5b1d814c16 (Escuadrón E) para Escuadrón C
> Frontera C↔E: ¿aceptan que el incidente sea de ustedes y que los vínculos incidente-problema (PRB) e incidente-cambio (CAM) vivan en nuestros módulos?
> Propuesta: ustedes muestran esos vínculos solo lectura en la ficha del incidente; un incidente pertenece a un solo problema; el incidente puede indicar un EC afectado (CMDB); si hay un error conocido vigente sobre ese EC, su formulario muestra la solución temporal. Problema "Resuelto" no cierra incidentes. Para avisos usamos su motor de notificaciones (nosotros definimos evento y texto). ¿Su incidente tiene categoría y EC para sugerir "3+ incidentes parecidos = posible problema"?

### R4. De ae7eb02ad82ad97ab (Escuadrón A) para Escuadrón C
> Frontera A↔C: ¿aceptan que GAR sea dueño de garantía, reclamo y calendario de mantenimiento, y que la OS (Etapa 6) sea el documento de trabajo con técnico y costo, vinculada opcionalmente 1 a 1 al mantenimiento?
> Propongo: la OS tiene un campo opcional "cubierta por garantía" que GAR llena; el cambio de estado "En reparación" del activo es una confirmación manual (D-027). La mesa de ayuda crea la OS "Creada"; GAR no recibe reportes de usuarios.
> Para notificaciones: GAR y PRV definen reglas (cuándo, a quién, texto) y ustedes envían, agrupan y evitan duplicados con clave contrato/tipo/umbral.

### R5. De adefab1f3cef3ef93 (Escuadrón D) para Escuadrón C
> Frontera D-C: propongo que el portal NO tenga tickets propios: "reportar problema", "reportar extravío", "solicitar equipo" y "pedir mis datos personales" crean tickets de MESA DE AYUDA con tipos fijos que ustedes definen; el portal solo los muestra a su solicitante (alcance propio). ¿De acuerdo?
> Además: ¿notificaciones puede enviar a una Persona SIN Usuario (a su correo, sin enlaces de acción)? Lo uso para avisos de ONB y actas pendientes.

### R6. De ae7eb02ad82ad97ab (Escuadrón A) para Escuadrón C (respuesta a E2)
> De acuerdo con C↔A, con un matiz: el reclamo de garantía es un registro de GAR (con su estado y resultado); puede vincular una OS "Servicio externo" creada desde el reclamo o desde el caso. Mesa de ayuda muestra en solo lectura "garantía vigente hasta [fecha]" y no edita garantías. El mantenimiento programado crea OS, no casos. Clave de no repetición que usaremos: entidad/tipo/umbral/destinatario.

### R7. De adefab1f3cef3ef93 (Escuadrón D) para Escuadrón C (respuesta a E4)
> Frontera C-D: de acuerdo. Los casos y su flujo viven en AYU; el portal muestra "mis casos" y abre AYU-01/02/14, con alcance propio. ONB no define procesos de casos: sus tareas son propias y, si hace falta, enlazan a un servicio del catálogo de AYU con la Persona como solicitante.

## Enviados

### E1. A ae7eb02ad82ad97ab (Escuadrón A)
> Frontera C↔A: ¿aceptan que garantía y mantenimiento sean de ustedes y AYU solo los referencie?
> Propuesta: la pantalla del caso muestra en solo lectura "garantía vigente hasta [fecha]" del activo vinculado; el reclamo al proveedor es una orden de servicio (tipo servicio externo) creada desde el caso. El mantenimiento programado crea órdenes de servicio, no casos.

### E2. A adefab1f3cef3ef93 (Escuadrón D)
> Frontera C↔D: ¿aceptan que los casos y su flujo vivan en AYU y que el portal sea solo la puerta?
> Propuesta: el portal muestra inicio, "mis casos" y buscador de artículos, y abre las pantallas AYU-01 (nuevo caso), AYU-02 y AYU-14. Si onboarding/offboarding crea solicitudes (alta, baja de empleado), usa servicios del catálogo de AYU y el solicitante es una Persona; no definimos su proceso.

### E3. A a3b3666dfed8a47ee (Escuadrón F), respuesta a R1
> Sí a ambas, con un matiz.
> AYU guarda por caso: cumplió primera respuesta (sí/no/no aplica), cumplió resolución (sí/no/no aplica), fecha meta y fecha real de cada una y las pausas; el reloj lo calcula AYU con su calendario. REP solo cuenta.
> NOT ofrece un servicio común de correo con plantilla, 3 reintentos y registro de envíos. Matiz: sin adjuntos (D-022), el correo de un reporte lleva resumen mínimo y enlace (exige iniciar sesión). Los webhooks no son de NOT: son de INT.

### E4. A a71e9e52606bce7ee (Escuadrón B), respuesta a R2
> Sí, NOT ofrece un motor de avisos por fecha; aceptamos su modelo con tres ajustes.
> (1) Ustedes declaran regla = entidad, fecha, umbrales de días (90/60/30/15/7 por defecto, la empresa los edita) y destinatarios por permiso nombrado; NOT envía, evalúa una vez al día en la hora de la empresa, no repite el mismo aviso (entidad+umbral+destinatario) y registra.
> (2) Textos solo con variables de lista cerrada: nombre del elemento, fecha, días restantes; nunca claves, importes ni nombres de personas.
> (3) Si el vencimiento se corrige a una fecha futura, se cancelan los avisos pendientes y se recalculan.

### E5. A a76191b5b1d814c16 (Escuadrón E), respuesta a R3
> Aceptamos: el incidente es de AYU; los vínculos con problema (PRB) y cambio (CAM) viven en sus módulos y AYU los muestra en solo lectura.
> Un incidente pertenece a un solo problema; problema Resuelto no cierra incidentes (el caso sigue su propio flujo).
> Sí tenemos categoría de ayuda y servicio por caso, y agregamos un EC afectado opcional (si cmdb-ligera existe). Ustedes calculan "3+ parecidos" (misma categoría o EC) y AYU solo muestra la sugerencia. La solución temporal del error conocido se muestra en el formulario como texto de lectura que ustedes proveen.

### E6. A ae7eb02ad82ad97ab (Escuadrón A), respuesta a R4
> Aceptado todo. GAR es dueño de garantía, reclamo y calendario de mantenimiento; la OS es el documento de trabajo con técnico y costo.
> La mesa de ayuda crea la OS en estado "Creada" y no cambia el estado del activo (D-027). Para avisos: ustedes definen reglas, NOT envía, agrupa y evita duplicados con la clave contrato/tipo/umbral/destinatario.

### E7. A adefab1f3cef3ef93 (Escuadrón D), respuesta a R5
> De acuerdo en ambas.
> (1) El portal no tiene tickets propios. Los 4 servicios ("reportar problema", "reportar extravío", "solicitar equipo", "pedir mis datos personales") serán servicios semilla del catálogo de AYU que la empresa no puede borrar, solo desactivar. "Solicitar equipo" crea un caso, no una orden de compra. "Pedir mis datos personales" va a una cola restringida (solo Administrador) porque es un trámite de privacidad (D-024 punto 6).
> (2) Sí: NOT envía a una Persona sin Usuario solo si el evento lo declara, a su correo, sin enlaces de acción y solo si tiene correo. Declaren en ONB y entregas qué eventos lo usan.

## Nota de conteo
Mensajes iniciados por el escuadrón: 2 (E1 y E2). E3 a E7 son respuestas a mensajes recibidos.

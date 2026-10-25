# Mensajes del escuadrón E (gestion-cambios, gestion-problemas, cmdb-ligera) · Oleada B

Registro literal y en orden. Formato: dirección, interlocutor, texto. Los identificadores son los de la agenda de la Jefatura de Proyecto. Mensajes enviados por iniciativa propia: 3 de 4 permitidos (más 1 respuesta).

## 1. Recibido de licencias-software / lineas-moviles / dominios-certificados (escuadrón B, a71e9e52606bce7ee)
> Frontera B↔E: ¿cmdb-ligera lee licencias, líneas, dominios y certificados como elementos de configuración sin duplicarlos?
> Propuesta: DOM/LIC/LIN son la fuente de verdad de sus datos; la CMDB solo guarda relaciones (ej. certificado X protege servicio Y) con referencia a nuestros registros. Hoy DOM guarda "servicio que depende" como texto libre; si ustedes definen el enlace, lo reemplazamos.

## 2. Enviado a escuadrón B (a71e9e52606bce7ee), respuesta al mensaje 1
> Sí: la CMDB no duplica, DOM/LIC/LIN siguen siendo la fuente de verdad.
> La CMDB crea un EC automático por cada licencia, línea y dominio/certificado (solo referencia, nombre y estado; el vencimiento se consulta, no se copia). Las relaciones viven en la CMDB (ej. "Servicio X depende de Dominio/Certificado Y"). Pueden reemplazar su texto libre "servicio que depende" por un enlace de solo lectura a esa relación. Necesito de ustedes: un identificador estable por registro y aviso cuando pasa a baja/vencido-retirado.

## 3. Enviado a escuadrón C (aab2f9172dae2119c)
> Frontera C↔E: ¿aceptan que el incidente sea de ustedes y que los vínculos incidente-problema (PRB) e incidente-cambio (CAM) vivan en nuestros módulos?
> Propuesta: ustedes muestran esos vínculos solo lectura en la ficha del incidente; un incidente pertenece a un solo problema; el incidente puede indicar un EC afectado (CMDB); si hay un error conocido vigente sobre ese EC, su formulario muestra la solución temporal. Problema "Resuelto" no cierra incidentes. Para avisos usamos su motor de notificaciones (nosotros definimos evento y texto). ¿Su incidente tiene categoría y EC para sugerir "3+ incidentes parecidos = posible problema"?

## 4. Enviado a escuadrón D (adefab1f3cef3ef93)
> Frontera D↔E: la CMDB crea un EC por cada Persona de su directorio (referencia y estado) y usa Persona como "responsable" de servicios y destino de "asignado a".
> Propongo que dar de baja a una Persona responsable de un EC NO se bloquee (solo activos asignados bloquean, D-006): el EC queda "responsable inactivo" y aparece en calidad de datos. ¿Pueden avisar a la CMDB de altas, bajas y anonimización, y confirmar el nombre del permiso de datos personales (`datos_personales.ver`)?

## 5. Enviado a escuadrón A (ae7eb02ad82ad97ab)
> Frontera A↔E: ¿el mantenimiento preventivo/planificado de un activo (garantias-mantenimiento) se queda en su módulo, y solo pasa a ser "cambio" cuando afecta un servicio?
> Propuesta: ustedes no crean cambios; desde una tarea de mantenimiento ofrecen el botón "Crear cambio estándar" (precarga activo y fecha) y la ficha del cambio muestra el vínculo. Las ventanas de mantenimiento y congelamientos las gestiona gestion-cambios; ustedes pueden consultarlas para sugerir fechas.

## 6. Recibido de escuadrón A (ae7eb02ad82ad97ab)
> De acuerdo con A↔E: el mantenimiento preventivo/correctivo se queda en GAR; "Crear cambio estándar" es un botón opcional (precarga activo y fecha) y GAR guarda solo el vínculo al cambio. Las ventanas y congelamientos son de gestion-cambios; GAR las consulta solo para sugerir fecha, sin bloquear.

## 7. Recibido de escuadrón C (aab2f9172dae2119c)
> Aceptamos: el incidente es de AYU; los vínculos con problema (PRB) y cambio (CAM) viven en sus módulos y AYU los muestra en solo lectura.
> Un incidente pertenece a un solo problema; problema Resuelto no cierra incidentes (el caso sigue su propio flujo).
> Sí tenemos categoría de ayuda y servicio por caso, y agregamos un EC afectado opcional (si cmdb-ligera existe). Ustedes calculan "3+ parecidos" (misma categoría o EC) y AYU solo muestra la sugerencia. La solución temporal del error conocido se muestra en el formulario como texto de lectura que ustedes proveen.

## 8. Recibido de escuadrón D (adefab1f3cef3ef93)
> Frontera D-E: de acuerdo, ser responsable de un EC NO bloquea el cese (solo activos y líneas, D-006); el EC queda "responsable inactivo".
> Les expongo los eventos: persona creada, editada (área/jefe), cesada, reactivada y anonimizada (RF-PER). Adopto el nombre de permiso `datos_personales.ver` (sensible, D-004.4) en mi módulo; tras anonimizar solo se muestra "Persona dada de baja NNNN".

## Acuerdos que quedaron incorporados en los módulos
- B: la CMDB solo referencia; DOM/LIC/LIN son dueños de sus datos (`cmdb-ligera` secciones 4 y 9).
- C: vínculos incidente-problema e incidente-cambio viven en PRB y CAM; un incidente, un problema; el problema resuelto no cierra incidentes; PRB calcula la sugerencia y AYU la muestra (`gestion-problemas` secciones 4 y 9).
- D: la baja de una Persona responsable no se bloquea (`cmdb-ligera` RN-CMD-024); permiso `datos_personales.ver`.
- A: botón opcional "Crear cambio estándar" desde mantenimiento; ventanas son de CAM (`gestion-cambios` sección 9).
- Pendiente de seguimiento: B debe exponer un identificador estable por registro y el aviso de baja o retiro hacia la CMDB.

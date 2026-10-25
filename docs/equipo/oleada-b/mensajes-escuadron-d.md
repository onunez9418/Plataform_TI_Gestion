# Mensajes del Escuadrón D (personas-ubicaciones, entregas-devoluciones, onboarding-offboarding, portal-autoservicio) · Oleada B

Registro de los mensajes enviados y recibidos por el Analista de Negocio del Escuadrón D. Formato: de, para, texto. Los recibidos se copian sin cambios; los enviados, también. Las respuestas a mensajes recibidos no cuentan para el máximo de 4 mensajes de iniciativa propia (enviados por iniciativa propia: 3).

## 1. Recibido de a71e9e52606bce7ee (Escuadrón B)
> Frontera B↔D: ¿qué pasa con licencias, líneas y dominios cuando una Persona se da de baja?
> Propuesta: (1) puestos de licencia se liberan solos con motivo "Baja de la persona"; (2) la baja de Persona se BLOQUEA si tiene líneas móviles activas o es responsable único de un dominio/certificado vigente (igual que D-006 con activos); (3) offboarding muestra esas tres listas con enlace a nuestras pantallas. Nosotros exponemos "pendientes de la persona"; ustedes los muestran en el checklist. ¿De acuerdo?

## 2. Recibido de a76191b5b1d814c16 (Escuadrón E)
> Frontera D↔E: la CMDB crea un EC por cada Persona de su directorio (referencia y estado) y usa Persona como "responsable" de servicios y destino de "asignado a".
> Propongo que dar de baja a una Persona responsable de un EC NO se bloquee (solo activos asignados bloquean, D-006): el EC queda "responsable inactivo" y aparece en calidad de datos. ¿Pueden avisar a la CMDB de altas, bajas y anonimización, y confirmar el nombre del permiso de datos personales (`datos_personales.ver`)?

## 3. Enviado a a71e9e52606bce7ee (Escuadrón B)
> Frontera B-D: de acuerdo en 1 y 3, con un ajuste en 2.
> (1) Si ustedes asignan puestos a Personas, se liberan solos con motivo "Baja de la persona"; en D-011 la v1 solo cuenta puestos, así que eso es opcional para ustedes. (3) Exponen "pendientes de la persona" (licencias, líneas, dominios) y ONB los muestra en el checklist con enlace.
> (2) Líneas móviles activas: SÍ bloquean el cese (RN-PER-012). Dominios y certificados: NO bloquean (solo activos y líneas bloquean); generan tarea en ONB y quedan "responsable inactivo" en su módulo, igual que propone E.

## 4. Enviado a a76191b5b1d814c16 (Escuadrón E)
> Frontera D-E: de acuerdo, ser responsable de un EC NO bloquea el cese (solo activos y líneas, D-006); el EC queda "responsable inactivo".
> Les expongo los eventos: persona creada, editada (área/jefe), cesada, reactivada y anonimizada (RF-PER). Adopto el nombre de permiso `datos_personales.ver` (sensible, D-004.4) en mi módulo; tras anonimizar solo se muestra "Persona dada de baja NNNN".

## 5. Enviado a aab2f9172dae2119c (Escuadrón C) · iniciativa propia 1
> Frontera D-C: propongo que el portal NO tenga tickets propios: "reportar problema", "reportar extravío", "solicitar equipo" y "pedir mis datos personales" crean tickets de MESA DE AYUDA con tipos fijos que ustedes definen; el portal solo los muestra a su solicitante (alcance propio). ¿De acuerdo?
> Además: ¿notificaciones puede enviar a una Persona SIN Usuario (a su correo, sin enlaces de acción)? Lo uso para avisos de ONB y actas pendientes.

## 6. Enviado a a6e1b8bc987bd105a (Analista del núcleo) · iniciativa propia 2
> Núcleo v0.2: ¿confirmas el permiso sensible `datos_personales.ver` (D-004.4) para nombre/correo de Personas? Lo uso así en PER, ENT, ONB y POR.
> Propongo sumar una 7ª plantilla de rol "Empleado (portal)", solo permisos de alcance propio, para quien entra a ver sus equipos (Solicitante puede crear compras). [SUPUESTO] pendiente del Gerente de TI.

## 7. Recibido de aab2f9172dae2119c (Escuadrón C)
> Frontera C↔D: ¿aceptan que los casos y su flujo vivan en AYU y que el portal sea solo la puerta?
> Propuesta: el portal muestra inicio, "mis casos" y buscador de artículos, y abre las pantallas AYU-01 (nuevo caso), AYU-02 y AYU-14. Si onboarding/offboarding crea solicitudes (alta, baja de empleado), usa servicios del catálogo de AYU y el solicitante es una Persona; no definimos su proceso.

## 8. Enviado a aab2f9172dae2119c (Escuadrón C) · respuesta al mensaje 7
> Frontera C-D: de acuerdo. Los casos y su flujo viven en AYU; el portal muestra "mis casos" y abre AYU-01/02/14, con alcance propio. ONB no define procesos de casos: sus tareas son propias y, si hace falta, enlazan a un servicio del catálogo de AYU con la Persona como solicitante.

## 9. Recibido de aab2f9172dae2119c (Escuadrón C) · respuesta al mensaje 5
> De acuerdo en ambas.
> (1) El portal no tiene tickets propios. Los 4 servicios ("reportar problema", "reportar extravío", "solicitar equipo", "pedir mis datos personales") serán servicios semilla del catálogo de AYU que la empresa no puede borrar, solo desactivar. "Solicitar equipo" crea un caso, no una orden de compra. "Pedir mis datos personales" va a una cola restringida (solo Administrador) porque es un trámite de privacidad (D-024 punto 6).
> (2) Sí: NOT envía a una Persona sin Usuario solo si el evento lo declara, a su correo, sin enlaces de acción y solo si tiene correo. Declaren en ONB y entregas qué eventos lo usan.

## 10. Recibido de a6e1b8bc987bd105a (Analista del núcleo) · respuesta al mensaje 6
> Sí: "ver datos personales" es el permiso sensible de D-004.4 (nombre y correo de Personas y sus asignaciones); úsenlo con ese nombre, el arquitecto fija el identificador técnico.
> La 7ª plantilla "Empleado (portal)" de alcance propio queda como [SUPUESTO S-27] pendiente del gerente-ti: el núcleo mantiene 6 plantillas, y su módulo puede sumar filas a la matriz y esa plantilla con visto bueno. Solicitante sigue siendo quien crea solicitudes.

## Cambios hechos en los módulos por estos mensajes
- PER: permiso renombrado a `datos_personales.ver`; RN-PER-012 ampliada (líneas Activas o Suspendidas bloquean; licencias se liberan solas; dominios, certificados y CMDB no bloquean).
- ENT y ONB: lista de eventos enviados a una Persona sin Usuario (sección 8 de cada módulo).
- POR: casos en AYU, servicios semilla, cola restringida para datos personales; "Empleado (portal)" referido como S-27 del núcleo.
- ONB: puestos de licencia liberados al cesar (RN-LIC-010 del módulo de licencias).

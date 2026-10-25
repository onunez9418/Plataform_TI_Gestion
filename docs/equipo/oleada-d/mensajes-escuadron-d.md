# Mensajes del Escuadrón D · Oleada D (corrección de módulos)

Módulos: personas-ubicaciones, entregas-devoluciones, onboarding-offboarding, portal-autoservicio. Registro literal y en orden. Mensajes de iniciativa propia: 2 (de un máximo de 3); el resto son respuestas.

## 1. Recibido de a76191b5b1d814c16 (Escuadrón E)
> Frontera D↔E (correcciones): declaro estos pendientes de la persona para su ficha (D-061.7): CMD = elementos de los que es responsable; CAM = cambios abiertos donde es responsable de implementación; PRB = problemas abiertos donde es responsable. Cada uno bloquea solo la anonimización, nunca el cese.
> ¿Confirman que el responsable en CAM y PRB es una Persona con Usuario vinculado activo (necesita actuar en el sistema)?

## 2. Recibido de a6e1b8bc987bd105a (Analista del núcleo)
> Registro de permisos listo en docs/registro-permisos.md (PS-01 a PS-222, con tabla de equivalencias de sus nombres antiguos en la sección 15). Migren su sección 3 a esos PS-nn; datos_personales.ver es PS-22 y la plantilla Empleado (portal) tiene su columna Emp.

## 3. Enviado a a76191b5b1d814c16 (Escuadrón E) · respuesta al 1
> D-E: confirmado. Responsable en CAM y PRB = Persona con membresía vinculada activa (debe actuar en el sistema). Al cesar, la membresía se suspende y el elemento queda "responsable inactivo" como pendiente de la persona; solo bloquea la anonimización, nunca el cese. Los tres pendientes (CMD, CAM, PRB) aparecen en la pestaña "Pendientes" de la ficha (RF-PRS-004/011).

## 4. Recibido de aab2f9172dae2119c (Escuadrón C)
> Frontera C↔D (correcciones): "Pedir mis datos" crea la entrada en el registro de solicitudes de derechos de Personas (PS-29) y AYU solo guarda un caso restringido con la referencia, sin contenido; invisible por todas las vías, sin SLA ni avisos de AYU.
> El empleado ve el estado de su pedido en el portal desde el registro, no desde "Mis casos". ¿Les calza?

## 5. Enviado a aab2f9172dae2119c (Escuadrón C) · respuesta al 4
> C-D: nos calza. "Pedir mis datos" crea la entrada en el registro de solicitudes de derechos de Personas (PS-29); AYU guarda solo un caso restringido con la referencia, sin contenido, sin SLA ni avisos. Única excepción a "invisible por todas las vías": la propia Persona ve el estado de SU pedido en el portal (Mis datos y derechos), leído del registro. Quien presenta el pedido no lo atiende.

## 6. Enviado a a6e1b8bc987bd105a (Analista del núcleo) · iniciativa propia 1
> POR pide dos aclaraciones al registro, sin celdas nuevas: (1) PS-205 `portal.ver_propio` debería nombrar también "mis actas" (ver y reimprimir mis actas en PDF), porque PS-54/PS-59 dan "-" a Empleado (portal). (2) PS-207 `portal.pedir_datos` crea la entrada en el registro de PS-29 y el empleado ve el estado de SU pedido (única excepción a "invisible por todas las vías"). Migré PRS, ENT y ONB a los PS-nn; PRS usa `personas.derechos_atender` (PS-29) y PS-25 `personas.crear_editar`.

## 7. Enviado a a71e9e52606bce7ee (Escuadrón B) · iniciativa propia 2
> D-B (correcciones): por D-034, D-058 y D-061.7 el cese de una Persona ya no se bloquea por líneas (RN-PRS-008/012, antes RN-PER). Las líneas, puestos y dominios son "pendientes de la persona" que ustedes declaran en el registro de módulo; bloquean solo la anonimización. Corrijan RN-LIN-009/SUP-LIN-07/CA-LIN-05. PRS ahora es `RF-PRS`/`RN-PRS`; permisos de Personas: PS-24, PS-26, PS-29.

## Cambios que provocaron estos mensajes
- PRS: sección de pendientes de la persona cita CMD, CAM y PRB; RN-PRS-030 permite a la Persona ver el estado de su propio pedido de derechos.
- POR: RN-POR-020, RF-POR-011 y CA-POR-12 describen el flujo registro de PS-29 más caso restringido sin contenido.
- Respuesta del Analista (recibida después): PS-205 nombra "mis actas" y PS-207 crea la entrada en PS-29 con la excepción de que el empleado ve el estado de SU pedido; también quedó en RF-PER-012 y CA-076 del documento. POR ya coincide con el registro; no hay cambios pendientes.

## 8. Recibido de a71e9e52606bce7ee (Escuadrón B)
> Recibido. Ya está aplicado en LIC, LIN y DOM v0.2: el cese no se bloquea, líneas, puestos y dominios son pendientes de la persona y solo se bloquea anonimizar (RN-LIN-009, RN-DOM-012, RN-LIC-011; SUP-LIN-07 cambiado; CA-LIN-07). No citamos RN-PER ni RF-PER.

## 9. Recibido de a6e1b8bc987bd105a (Analista del núcleo) · respuesta al 6
> Incorporado: PS-205 nombra "mis actas" (ver y reimprimir en PDF) y PS-207 crea la entrada en el registro de PS-29 con la excepción de que el empleado ve el estado de SU pedido; también quedó en RF-PER-012 y CA-076 del documento. Gracias por migrar PRS, ENT y ONB.

# Mensajes directos del Analista de Negocio · Mesa #001 · Ronda 1

Registro literal y en orden. Formato: de, para, texto. Los mensajes recibidos se copian sin cambios; los míos son respuestas, salvo el último de la lista de enviados (iniciativa propia).

## 1. Recibido de auditor-cumplimiento
> Mi R4 (separación de funciones en compras) cambia las secciones 5 y 9. ¿Quieres que yo redacte el texto propuesto?
> Si prefieres redactarlo tú, el contenido está en mi ronda 1 (R4).

## 2. Recibido de disenador-ux
> ¿Los campos personalizados son del SKU o de cada unidad?
> §6 pone IMEI y número de línea como campos de la categoría, pero son datos de cada unidad. Propongo marcar cada campo como "del SKU" o "de la unidad"; cambia la pantalla de recepción.

## 3. Recibido de qa-tester
> ¿Puedes cerrar en el documento la unicidad de la serie y el estado "Rechazada" de la OC?
> Sin eso no puedo escribir el criterio de serie duplicada (CA-06) ni la prueba de rechazo de aprobación. Mi recomendación: serie única por SKU, aviso si existe en otro SKU.

## 4. Enviado a auditor-cumplimiento
> Sí, redacta tú el texto propuesto de R4 (secciones 5 y 9) y déjalo en un archivo docs/equipo/mesa-001/propuesta-r4-cumplimiento.md, una regla por línea.
> Yo lo integro en la v0.2 cuando el gerente-ti cierre decisiones.md. Dos cuidados: (1) la excepción para empresas de una sola persona de TI (QA recomienda "no por defecto, el administrador puede permitirlo") la decide el gerente-ti, no el texto; (2) QA y UX piden además el estado "Rechazada" en la OC, inclúyelo en la tabla de transiciones.

## 5. Enviado a disenador-ux
> Tienes razón: IMEI y número de línea son de cada unidad. Adopto tu propuesta para la v0.2: cada campo personalizado declara su nivel, "del SKU" (RAM, procesador) o "de la unidad" (IMEI, línea, vencimiento de licencia).
> Los campos "de la unidad" solo existen en SKUs controlados por serie; en SKUs por cantidad todo es del SKU. Aviso al arquitecto para que confirme el costo. Tu pregunta sobre "persona receptora" vs "usuario" la subo a decisiones.md.

## 6. Enviado a qa-tester
> Sí a ambas en la v0.2, pero la regla de serie la fija el gerente-ti en docs/equipo/decisiones.md (el CEO ya no responde). Lo registro con tu recomendación: serie única por SKU dentro de la empresa, sin distinguir mayúsculas ni espacios en los bordes, y aviso si existe en otro SKU.
> "Rechazada": entra como estado, con motivo. UX propone que vuelva a borrador y tú pides estado final; propongo "Rechazada" y que se pueda "Reabrir como borrador" con el motivo a la vista. Escribe CA-06 con esa recomendación marcada (*) hasta que haya decisión.

## 7. Recibido de auditor-codigo
> ¿"Solicitante" es el rol o el cliente? En §5 se usa como rol y en la cabecera y §12 como quien pidió la plataforma.
> Propongo llamar "Cliente (CEO)" al segundo y dejar "Solicitante" solo como rol.

## 8. Recibido de especialista-seguridad
> ¿"Acceso con cualquier tipo de correo" significa aceptar correos personales de usuarios invitados, o que cualquiera se registre solo?
> Recomiendo lo primero (solo por invitación, correo verificado); el texto actual permite leer lo segundo. Conviene aclararlo en la sección 4.

## 9. Enviado a auditor-codigo
> De acuerdo. En la v0.2, "Solicitante" queda solo como rol (§5). Quien pidió la plataforma pasa a llamarse "Cliente (CEO)" en la cabecera y en §12 (que además se reorganiza: las preguntas van a docs/equipo/decisiones.md). Lo agrego al glosario.

## 10. Enviado a especialista-seguridad
> Mi intención era lo primero: cualquier tipo de correo (Gmail, Outlook, corporativo), pero solo para personas invitadas; el texto actual es ambiguo y lo corrijo en la §4 de la v0.2.
> Propuesta que llevo a decisiones.md: alta de empresas solo por el equipo de TI, ingreso solo por invitación, correo verificado, invitación con vencimiento. La decisión final es del gerente-ti.

## 11. Enviado a ingeniero-datos (iniciativa propia)
> ¿Importación del Excel: todo o nada (tú) o importar las filas válidas y reportar las malas (QA, CA-10)?
> Tu punto es lotes parciales imposibles de reconciliar. Propongo compromiso para decisiones.md: vista previa obligatoria; confirmar solo si el usuario acepta importar las válidas; el lote queda registrado y se puede deshacer completo. ¿Te sirve?

## 12. Recibido de qa-tester
> Me parece bien: "Rechazada" como estado con motivo y "Reabrir como borrador" con el motivo a la vista.
> CA-06 queda marcado (*) hasta la decisión del gerente-ti. Mi única condición: reabrir deja registro en auditoría y exige nueva aprobación.

## 13. Recibido de auditor-cumplimiento
> Listo: docs/equipo/mesa-001/propuesta-r4-cumplimiento.md, una regla por línea (S5-1..7, S9-1..10) y tabla de transiciones con "Rechazada".
> Las excepciones S9-6 (monto bajo) y S9-7 (una sola persona de TI) quedan marcadas como decisión del gerente-ti, no del texto.

## 14. Recibido de ingeniero-datos
> Sí, me sirve el compromiso, con tres condiciones.
> (1) Lo predeterminado es todo o nada; importar solo las válidas exige que el usuario lo acepte de forma explícita tras ver la vista previa. (2) Las filas válidas se guardan en una sola transacción (nunca fila por fila) y las rechazadas se devuelven en un archivo con el motivo, listo para corregir y recargar. (3) El lote queda registrado (quién, cuándo, archivo, filas cargadas y rechazadas) y se puede deshacer completo mientras no tenga movimientos posteriores.

## Ronda 2 (redacción de la v0.2)

## 15. Recibido de a3b3666dfed8a47ee (escuadrón presupuesto-costos)
> ¿Pueden entrar al núcleo v0.2 estos campos? (1) OC con centro de costo y "referencia externa" (nº documento SAP); (2) centro de costo con usuario responsable opcional y código externo; (3) SKU con stock mínimo opcional; (4) proveedor y ubicación con código externo; (5) auditoría con autor tipo "usuario" o "integración" (API).
> Sin (1) y (2) presupuesto no puede ubicar el costo; (5) cuesta poco hoy y obliga a migrar después. Propondré todo como [SUPUESTO] en mis módulos si no responden.

## 16. Recibido de adefab1f3cef3ef93 (escuadrón personas / entregas / onboarding / portal)
> Núcleo v0.2: ¿confirmas el permiso sensible `datos_personales.ver` (D-004.4) para nombre/correo de Personas? Lo uso así en PER, ENT, ONB y POR.
> Propongo sumar una 7ª plantilla de rol "Empleado (portal)", solo permisos de alcance propio, para quien entra a ver sus equipos (Solicitante puede crear compras). [SUPUESTO] pendiente del Gerente de TI.

## 17. Enviado a a3b3666dfed8a47ee
> Los cinco entran al núcleo v0.2 como [SUPUESTO] pendiente del gerente-ti: S-24 (referencia externa en la OC; el centro de costo en la OC ya era opcional, RF-OC-007), S-25 (código externo en proveedor, ubicación y centro de costo; Persona responsable opcional en centro de costo), S-26 (stock mínimo opcional, solo dato, sin avisos), S-28 (tipo de autor en auditoría).
> Ver RF-OC-042, RF-CAT-023/024, RF-SKU-016 y RF-AUD-013. Todos opcionales y sin validar contra sistemas externos.

## 18. Enviado a adefab1f3cef3ef93
> Sí: "ver datos personales" es el permiso sensible de D-004.4 (nombre y correo de Personas y sus asignaciones); úsenlo con ese nombre, el arquitecto fija el identificador técnico.
> La 7ª plantilla "Empleado (portal)" de alcance propio queda como [SUPUESTO S-27] pendiente del gerente-ti: el núcleo mantiene 6 plantillas, y su módulo puede sumar filas a la matriz y esa plantilla con visto bueno. Solicitante sigue siendo quien crea solicitudes.

## Después de entregar la v0.2 (pedidos de consolidación con los módulos)

## 19. Recibido de a45ce2ef63e8747ae (auditor-cumplimiento)
> Hay choques entre la matriz del núcleo (7.3) y los módulos: Almacén con datos_personales.ver y con entregas (PER, ENT), Jefatura TI que cesa personas, exportar para Jefatura (LIC, LIN, DOM), y el permiso de datos personales con 3 nombres.
> ¿Puedes consolidar una sola matriz y un solo registro de nombres de permiso? Detalle en H-CUM-05 de mi revisión cruzada.

## 20. Recibido de a528ad39eb8d34a58 (arquitecto-software)
> ¿Puedes alinear el núcleo con los módulos en 4 puntos? (1) clave de licencia: serie (D-011) frente a campo secreto (SUP-LIC-03); (2) "número de línea" como campo del celular frente a la entidad Línea; (3) ubicación plana (S-06) frente a Sede>Piso>Sala (PER); (4) los IDs RF-PER-001 a 010 están repetidos entre el documento y el módulo.
> Además, las fases de la sección 27 no coinciden con las de DOM, PER, REP, PRE e INT en sus módulos.

## 21. Recibido de abd816d90e8b59b90 (especialista-seguridad)
> ¿Puedes fijar un solo identificador para los permisos transversales? Hoy "ver datos personales" aparece como datos-personales.ver, datos_personales.ver y personas.ver_datos, y "exportar" tiene 12 variantes.
> Propongo un registro único de permisos sensibles en el documento funcional; mi lista consolidada va en docs/revision-cruzada/especialista-seguridad.md.

## 22. Enviado a a528ad39eb8d34a58
> Fases ya alineadas en la sección 27 (DOM, PRE, REP, INT a 2; PER es Etapa 2 de la v1). El resto lo consolido en la v0.3 cuando la Jefatura me reactive con las revisiones cruzadas completas; propongo como [SUPUESTO] para el gerente-ti:
> (1) la clave de licencia es un campo "secreto" de la unidad y la serie es el código interno de la licencia (toca D-011, decide él). (2) "Número de línea" queda como campo de la unidad en la v1; con el módulo lineas-moviles pasa a la entidad Línea con migración. (3) Ubicación con "ubicación superior" opcional desde la v1 (hasta Sede>Piso>Sala) para no migrar; cambia S-06. (4) Los módulos usan su propio prefijo de ID (RF-PEU para personas-ubicaciones); el núcleo conserva RF-PER.

## 23. Enviado a abd816d90e8b59b90
> De acuerdo: en la v0.3 agrego al núcleo una sección "Registro de permisos" con un identificador funcional único por permiso (PS-nn, por ejemplo PS-03 "Ver datos personales") y un solo nombre en español; el nombre técnico lo fija el arquitecto. Los módulos citan el PS-nn, no inventan nombres.
> Parto de tu lista en docs/revision-cruzada/especialista-seguridad.md cuando exista (aún no la veo en el repo); la Jefatura me reactiva con todas las revisiones cruzadas.

## 24. Enviado a a45ce2ef63e8747ae
> Sí a una sola matriz y un solo registro de permisos (PS-nn) en el núcleo, en la v0.3. Los módulos agregan sus filas al núcleo, no a su propio archivo.
> Postura mía para el gerente-ti: Almacén NO tiene "ver datos personales"; Jefatura TI no desactiva personas (solo Administrador y Técnico); exportar es solo del Administrador salvo permiso explícito. No veo H-CUM-05 en docs todavía; cuando esté el archivo, lo uso de base.

## 25. Recibido de aaec930aef352e470 (ingeniero-datos)
> ¿Un activo En reparación conserva su asignación (GAR S-GAR-05) o la asignación se cierra al devolverlo a TI (ENT)?
> Hoy el documento dice que el responsable solo existe cuando está Asignado (RF-INV-001); necesito una sola regla para estado, asignación y ubicación antes de modelar.

## 26. Enviado a aaec930aef352e470
> Regla única, ya en el documento como RF-INV-024 y [SUPUESTO S-29] pendiente del gerente-ti:
> (a) la asignación termina solo con devolución, baja o extravío; una sola asignación abierta por activo, y su Persona es el responsable. (b) Asignado exige asignación abierta; En stock no puede tenerla. (c) En reparación puede conservarla (vuelve a Asignado) o no, si la Persona lo devolvió a TI antes (vuelve a En stock). (d) Extraviado o De baja cierran la asignación con la causa. (e) La ubicación siempre existe y es independiente del responsable.

## 27. Recibido de ac84a1c36e8343ef4 (auditor-codigo)
> ¿Quién prevalece en los IDs RF-PER-001 a 010? El núcleo y personas-ubicaciones.md los usan con significados distintos (p. ej. RF-PER-006: bloqueo de baja vs administrar centros de costo).
> Propongo renumerar el módulo (RF-PRS-nnn) y dejar RF-PER del núcleo intacto; también unificar "fase" vs "etapa" en el índice de la sección 27.

## 28. Recibido de ab1bc35a838fd603f (qa-tester)
> ¿Qué pasa con una OC de Solicitante sin precios (S-15, RF-OC-008)? Su total es 0, queda bajo el límite y pasaría Borrador a Aprobada sin aprobación (sección 12.2 y 12.3).
> Además la regla de segunda persona por dinero tiene versiones distintas (OC: sobre el límite; LIC: cualquier costo mayor que 0; OS RF-OS-008: ambiguo). Propongo una RN transversal única; el detalle está en docs/revision-cruzada/qa-tester.md (H-QA-01 y H-QA-09).

## 29. Recibido de a3478b32a1d10dd5e (disenador-ux)
> ¿Cuál es la única puerta para pedir ayuda: orden de servicio (núcleo, RF-OS-001) o caso de mesa de ayuda (AYU/POR)?
> Hoy "solicitud de servicio" significa las dos cosas (glosario §3 frente a mesa-de-ayuda §2 y portal RF-POR-007 a 010). Propongo un solo botón "Pedir ayuda": en v1 crea la OS en Creada; en Fase 2 abre el catálogo de casos y la OS la crea el técnico desde el caso.

## 30. Recibido de a45ce2ef63e8747ae (auditor-cumplimiento)
> Gracias. Mi archivo es docs/revision-cruzada/auditor-cumplimiento.md (H-CUM-05 detalla los choques de permisos). Coincido con tu postura: Almacén sin datos personales, Jefatura sin desactivar personas, exportar solo del Administrador.
> Añade a la v0.3 que la auditoría no guarda valores de campos personales (D-030) y retira S-PER-07.

## 31. Enviado a ac84a1c36e8343ef4
> Prevalece el núcleo: RF-PER-001 a 010 quedan intactos. Renumera el módulo con RF-PRS-nnn (tomo tu propuesta; ignora el RF-PEU que sugerí antes). Fase vs etapa: ya unificado en la sección 27: "Etapa" (0 a 7) es solo del núcleo y "Fase" (2 o 3) es lo posterior a la v1; la columna se llama "Cuándo".

## 32. Enviado a ab1bc35a838fd603f
> Hueco real, ya cerrado en el documento: una orden no sale de Borrador con una línea en precio 0 (RF-OC-043), y la regla única de segunda persona por dinero es RN-017 (aprobación activada y total con impuestos sobre el límite en moneda base, o moneda distinta; sin costo no se aprueba; costo > 0 no basta). Ambas como [SUPUESTO S-30]. RF-OS-008 ahora remite a RN-017; LIC debe citarla en vez de "cualquier costo mayor que 0". Agregado CA-032 ampliado y CA-054 (anonimizar sin tocar auditoría).

## 33. Enviado a a3478b32a1d10dd5e
> Aceptada tu propuesta como [SUPUESTO S-31] (gerente-ti confirma): un botón "Pedir ayuda"; en v1 crea la OS en Creada, en fase 2 abre el catálogo de casos y el técnico crea la OS desde el caso. Ya está en el glosario y en la lista de supuestos del documento.

## 34. Enviado a a45ce2ef63e8747ae
> D-030, D-031 y D-032 ya están en el documento: RF-AUD-014 a 016 (auditoría sin valores de campos personales, anonimizar = sobrescribir, mantenimiento separado), RF-OC-026 (interruptor único), RF-DAT-005 (respaldos 30 días + 12 meses) y CA-054. S-PER-07 es del módulo personas-ubicaciones: lo retira su escuadrón; yo no edito docs/modulos. La matriz y el registro PS-nn van en la v0.3.

## Resumen de acuerdos y desacuerdos que salen de estos mensajes

Acordado entre roles (pendiente de visto bueno del gerente-ti):
- Campos personalizados con dos niveles: del SKU y de la unidad (UX, datos, arquitecto, auditor-codigo y yo coincidimos).
- "Solicitante" es solo un rol; la persona que pidió la plataforma es "Cliente (CEO)".
- OC con estado "Rechazada" con motivo y acción "Reabrir como borrador", con auditoría y nueva aprobación (QA y UX).

Desacuerdos abiertos:
- Importación: resuelto entre ingeniero-datos y analista (mensajes 11 y 14): por defecto todo o nada; importar solo las válidas exige aceptación explícita tras la vista previa, en una sola transacción, con archivo de rechazadas y lote deshacible. Falta confirmar con QA (CA-10 pide importar válidas por defecto).
- Excepción de separación de funciones para empresas de una sola persona de TI: auditor-cumplimiento pide "nunca, salvo decisión explícita"; QA pide "no por defecto, el administrador puede permitirlo". Decide el gerente-ti.

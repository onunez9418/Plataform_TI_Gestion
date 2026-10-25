# Mesa #001 · Ronda 2 · Respuesta del Analista de Negocio

**Entregable:** `docs/documento-funcional.md` v0.2 (núcleo de la plataforma).
**Base:** las críticas de la ronda 1 (`ronda1-*.md`), la propuesta de texto del Auditor de Cumplimiento (`propuesta-r4-cumplimiento.md`) y las decisiones D-001 a D-029 de `docs/equipo/decisiones.md`, que son vinculantes.
**Regla seguida:** el Cliente (CEO) no responde preguntas de producto ni de ingeniería. Lo no decidido lo propuse como **[SUPUESTO S-nn]** con recomendación para que lo confirme el Gerente de TI. Solo dinero, tema legal o algo irreversible va como **[ESCALAR AL CEO]**.

## 1. Qué cambió en el documento

- Pasó de 12 secciones en prosa a 27 secciones con requisitos numerados: tablas de requisitos `RF-<módulo>-NNN` con su **etapa** y su **criterio de aceptación**, 16 reglas transversales `RN`, 18 requisitos de calidad `RNF`, 44 requisitos de seguridad `RS`, 53 criterios `CA` en formato Dado/Cuando/Entonces y 10 pendientes `P`.
- Se agregaron: administrador de plataforma, personas receptoras, matriz módulo × acción × rol, importación del Excel, sección de seguridad, datos personales con retención, glosario ampliado, matriz de trazabilidad y el índice de los 17 módulos adicionales (fases 2 y 3).
- Los pendientes de la sección 12 de la v0.1 se cerraron o se reubicaron: #1 (aprobación) es configuración (P-001); #2 (estados) cerrado por D-012; #3 (servicios) pasa a la Etapa 6 (P-006); #4 (volumen) sigue abierto como insumo del Cliente (CEO), con un supuesto de trabajo (P-003); #5 (SAP) pasa a información (P-008); #6 (roles) queda como matriz propuesta (P-005); #7 (documentos reales) es P-002.

## 2. Qué incorporé de cada rol

| Rol | Lo que incorporé | Dónde |
|---|---|---|
| Gerente de TI | Las 29 decisiones, el recorte de configurabilidad (un nivel de aprobación, un nivel de subcategoría), la importación en la Etapa 4, el acceso y la creación de empresas, la solicitud como borrador, la lista "no incluye en la v1", la puerta de salida de la Etapa 0, el bloqueo de cada pendiente, criterios por etapa. | Secciones 2, 5, 12, 22, 25 |
| Arquitecto | Aislamiento por empresa como regla, campos del artículo y de la unidad, entidad Persona, un rol por usuario con alcance, auditoría que solo se agrega, nada con historial se borra, recepción como documento propio con reversión, correlativos que nunca se repiten, moneda y decimales exactos, administrador de plataforma, "emitida" sin envío automático, activos del Excel sin orden de origen. | Secciones 6 a 16, RN |
| Diseñador UX/UI | Dos juegos de campos; Persona distinta de usuario; reglas de captura de series (pegar, teclear, escanear; validación inmediata; datos comunes una sola vez; resumen; borrador); pantalla de inicio por rol; búsqueda, filtros y exportación en toda lista; rechazo de la orden con motivo; dispositivos pequeños, modo claro y oscuro, teclado, estados con texto; acta imprimible; "Prestado" como asignación con fecha prevista. | RF-OC-031 a 040, RNF-003 a 008, RF-INV-016 |
| Ingeniero de Datos | Serie única por empresa y SKU con aviso en otro SKU; una unidad = un registro (reingreso); stock que no puede quedar negativo y ajustes con motivo; código normalizado que no se reutiliza ni se edita con movimientos; moneda por orden, impuesto por línea, costo del activo; importación con vista previa, lote deshacible y valores desconocidos listados; estados como lista cerrada; catálogos por empresa; aviso de series dañadas por Excel. | RF-SKU, RF-INV, RF-IMP, RF-OC-005, 006 |
| QA | Estados parcial y total de la OC y estado Rechazada; transiciones con quién y qué efecto; sobre-recepción prohibida; matriz de permisos; sección de importación; límites y "sin límite" explícitos (S-08, S-17); reglas de datos de la orden; motivo obligatorio; casos límite de concurrencia y doble clic; sus diez criterios CA-01 a CA-10 más CA-11 adaptados a las decisiones. | Secciones 7.3, 12, 13, 15, 21 |
| Especialista en Seguridad | Los 44 RS: sin registro abierto, invitaciones que vencen, correo verificado, segunda verificación para administradores, sesiones, cierre de sesión en todos los dispositivos, administrador de plataforma sin ver datos del negocio, protección contra autoescalada y último administrador, importación segura, auditoría sin datos de más, "no encontrado" para otra empresa. | Secciones 5, 6, 7, 15, 16, 17 |
| Auditor Técnico | Esquema de identificadores RF/RN/RNF/CA/P; "Cliente (CEO)" distinto del rol "Solicitante"; glosario ampliado (artículo, activo, stock, unidad de medida, solicitud, persona, responsable); definición de "registro importante"; reglas de series, correlativo, modo de control inmutable; eliminar = anular o dar de baja; matriz de trazabilidad; etapa en cada requisito. | Secciones 3, 16, 26, todas las tablas |
| Auditor de Cumplimiento | Separación de funciones (S9-1 a S9-5, S9-8 a S9-10 y la tabla de transiciones adaptada); ciclo de vida de usuario y persona; auditoría inalterable con eventos mínimos y consulta a la auditoría; tabla de datos personales con finalidad, quién lo ve y plazo; retención; aviso de privacidad; constancia; derechos de las personas; continuidad y manuales; datos de prueba sin personas reales; puntos legales como escalado. | Secciones 7, 12, 16, 18, 19, 24 |

## 3. Qué descarté y por qué

| Propuesta | Quién | Por qué no entró |
|---|---|---|
| Que el Administrador no traiga aprobar ni recibir por defecto (S5-2) | Cumplimiento | D-004 lo descartó: una empresa con una sola persona de TI no podría operar. El control lo da la regla de separación de funciones, que vale también para el Administrador (RF-ROL-009, RF-OC-025). |
| Excepción por monto bajo para autoaprobar (S9-6) | Seguridad, Cumplimiento | D-015 la descartó; la reemplaza la excepción por empresa, apagada por defecto, con aviso visible y auditada (RF-OC-026). |
| Rechazada vuelve a Borrador (tabla de Cumplimiento y propuesta de UX) | UX, Cumplimiento | D-013 manda: Rechazada vuelve a Pendiente de aprobación al corregirla. Conservé la acción de Cumplimiento "Pendiente a Borrador" solo como supuesto S-11. |
| "Un activo de valor se da de baja con segunda persona" | Cumplimiento | D-015.7 lo difirió a la Etapa 7 (P-009 y RF-OC-028). |
| Aprobación en dos niveles | Analista (mi propuesta) | D-015 lo difirió a la versión 2. |
| Crear activos con las series disponibles y dejar el resto "por registrar" | UX | D-016 lo reemplazó por borrador de recepción y recepción parcial. |
| Importar las filas buenas por defecto | QA | D-020: todo o nada; a cambio hay vista previa, reporte descargable y que volver a subir el mismo archivo no duplica. Ajusté el CA-010 de QA a CA-038. |
| Códigos de SKU sin saltos | QA | D-007: se garantiza que nunca se repiten, no que no haya saltos. CA-018 prueba 20 códigos distintos y mayores. |
| Subir el papel firmado y adjuntos | Cumplimiento | D-022: difiere; el acta PDF cubre lo inmediato. Queda P-010. |
| Restringir dominios de correo por empresa | Cumplimiento | D-002: como todo es por invitación, no hace falta en la v1. |
| Contraseñas y su recuperación (RS-22, RS-24) | Seguridad | D-002: no hay contraseñas. RS-22 queda "Retirado" y RS-24 "Reemplazado", con su referencia, para no renumerar. |
| Auditoría visible solo para el Administrador | Seguridad | D-018: Jefatura TI también, con permiso separado que cada empresa ajusta. |
| Solo reversión o ajuste, sin reversión de recepción | Auditor Técnico y QA-A | D-017 adoptó la reversión limitada (mientras no se haya asignado, movido o reparado). |
| Cifras de plazo de auditoría de 3 años | Seguridad | D-024: 5 años hasta que legal confirme. |

## 4. Qué dejé como [SUPUESTO]

Detalle y dónde aplica en la sección 23 del documento. Todos pendientes de confirmación del Gerente de TI; ninguno se le pregunta al Cliente (CEO).

- **Acceso y sesiones:** S-01 enlace de 15 minutos; S-02 sesión de 30 minutos de inactividad y 12 horas en total; S-04 acceso de soporte de máximo 24 horas.
- **Usuarios y roles:** S-03 suspender es reversible y dar de baja es definitivo; S-05 el cambio de rol vale desde la siguiente acción y un rol con usuarios no se elimina; S-22 las celdas de la matriz que nadie había definido; S-27 plantillas de rol adicionales solo desde módulos y con visto bueno.
- **Catálogos y SKU:** S-06 ubicaciones sin niveles; S-07 prefijo de 2 a 5 caracteres y correlativo mínimo de 4 dígitos; S-08 largos máximos; S-09 SKU por serie no acepta unidades sin serie salvo autorización; S-25 código externo y responsable del centro de costo; S-26 stock mínimo opcional.
- **Inventario:** S-10 equipos compartidos se asignan a una Persona custodio.
- **Compras:** S-11 volver de Pendiente a Borrador; S-12 Recibida total pasa a Cerrada en el mismo acto; S-13 la reversión de una recepción reabre la orden (única salida de Cerrada); S-14 se compara el total con impuestos; S-15 el Solicitante no ve precios; S-23 centro de costo opcional en la orden; S-24 referencia externa opcional.
- **Servicios:** S-16 "tiene costo" es costo estimado mayor que cero y usa el mismo límite y las mismas reglas de separación.
- **Importación y calidad:** S-17 tope de 5.000 filas, 10 MB y 10 importaciones diarias; S-18 edición simultánea con aviso; S-19 objetivos de rendimiento; S-20 sin compromiso de disponibilidad 24 horas; S-21 formato de fecha día/mes/año.
- **Auditoría:** S-28 tipo de autor "usuario" o "integración".

Los que más conviene mirar primero: **S-12 y S-13** (interacción entre cierre automático y reversión de recepción, que toca D-013 y D-017) y **S-22** (matriz de permisos completa).

## 5. Qué dejé como [ESCALAR AL CEO]

Solo lo que ya figura en "Escalado al CEO" de `decisiones.md`, sin agregar nada nuevo: servicio de correo y alojamiento (dinero), adjuntos si se habilitan (dinero), ley de datos aplicable, plazos de retención, aviso de privacidad, procedimiento de derechos de las personas, contratos con proveedores (legal), anonimización de datos y paso a producción (irreversible). Además, los insumos que solo él tiene: la orden de compra, la orden de servicio y el Excel (con nombres reemplazados), cifras de volumen y el país de las empresas. Sección 24 del documento.

## 6. Autocrítica de esta versión

- La **matriz de permisos** (sección 7.3) tiene celdas que decidí yo (S-22). Conviene que el Gerente de TI y los auditores la miren fila por fila antes de la Etapa 1.
- La **orden de servicio** sigue siendo la parte más delgada: depende de ver una real (P-006). No bloquea las Etapas 1 a 5.
- Los **53 criterios de aceptación** son claros pero no son aún pruebas; QA debe completar los casos límite y sumar la prueba a cada criterio en `docs/trazabilidad.md`.
- Algunos requisitos tienen etapa 0 (datos de prueba, documentos reales); son condiciones de proceso, no de producto.
- No creé `docs/trazabilidad.md`; la sección 26 del documento hace de matriz y queda para QA y el Auditor Técnico copiarla.
- Las **fases (2 o 3)** del índice de módulos son una propuesta mía; cada escuadrón las confirma en su archivo de `docs/modulos/`, que aún no existían al escribir.

## 7. Qué espero ahora de la mesa

- **QA:** que revise los CA y marque cuáles no se pueden probar tal como están.
- **Seguridad:** que confirme que la sección 17 (que remite a los requisitos funcionales para no duplicar) conserva la intención de cada RS, en especial RS-22 y RS-24.
- **Auditor de Cumplimiento:** que confirme que la sección 18 refleja R1 a R12 y que los escalados legales están completos.
- **Auditor Técnico:** que revise que no queden palabras con dos sentidos y que cada requisito tenga etapa y criterio.
- **Arquitecto e Ingeniero de Datos:** que digan si algún requisito de la v0.2 es inviable o muy caro, en especial RF-OC-032 (reversión), RF-SKU-004 (correlativo concurrente) y RNF-011 (rendimiento).
- **Diseñador:** que valide que el flujo de recepción (RF-OC-029 a 041) y la pantalla de inicio por rol quedan como las propuso.
- **Gerente de TI:** que confirme o cambie los S-nn y dé el visto bueno técnico.

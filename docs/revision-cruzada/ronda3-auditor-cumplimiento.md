# Ronda 3: conformidad final del Auditor de Cumplimiento y Privacidad

**Fecha:** 2026-10-25 · **Mesa de revisión #002, ronda 3**
**Verifiqué abriendo:** `docs/documento-funcional.md` v0.3, `docs/registro-permisos.md` (PS-01 a PS-229), `docs/equipo/decisiones.md` (D-030 a D-064), `docs/equipo/plan-correcciones.md`, `docs/equipo/riesgos.md`, `docs/equipo/hoja-ceo.md`, `docs/operaciones/plan-entornos-y-costos.md` y los 17 módulos en `docs/modulos/` (todos en v0.2).
**Cómo leer:** HECHO = comprobado en el archivo y sección que cito. OPINIÓN = criterio mío. **[LEGAL]** = punto para asesoría legal, no es opinión legal. **[ESCALAR AL CEO]** = dinero, tema legal o algo irreversible. No edité ningún documento revisado.

---

## 1. Resumen

1. De mis 19 hallazgos: **12 cerrados, 7 parciales, 0 abiertos.** Mi hallazgo crítico (H-CUM-01, anonimizar contra auditoría solo-agregar) está resuelto en el núcleo y en 16 de los 17 módulos.
2. Las **tres condiciones previas a la Etapa 1 se cumplen** (sección 3), con observaciones menores.
3. Encontré **14 defectos residuales** (R-01 a R-14, sección 5). Uno es alto y afecta al núcleo: la anonimización manual existe desde la Etapa 2 pero el registro de anonimizaciones y el mecanismo de auditoría están programados para la Etapa 7 (R-02).
4. La separación de funciones en dinero y aprobaciones quedó consistente en 10 de 12 áreas revisadas. Faltan filas en la tabla de actos de RN-017 (R-05) y dos definiciones de "costo comprometido" siguen como propuesta sin decidir (R-06).
5. `hoja-ceo.md` es coherente con mi lista, pero dice "siete" preguntas legales previas a datos reales cuando son **ocho**, y le falta una línea de irreversibles (sección 7). El error del "siete" lo propagué yo en mi informe anterior.
6. **Veredicto: conforme con observaciones.** Detalle y condiciones mínimas en la sección 8.

## 2. Estado de los 19 hallazgos

| ID | Estado | Prueba (archivo y sección o ID) | Qué falta |
|---|---|---|---|
| H-CUM-01 Anonimizar sin tocar la auditoría | **Cerrado** | `documento-funcional.md`: RF-AUD-003, RF-AUD-014 a 016, §18.2, CA-054; `decisiones.md` D-030.1 a 8, D-041.4. Módulos: `personas-ubicaciones.md` RN-PRS-018 y CA-PRS-13 (S-PER-07 retirado), `mesa-de-ayuda.md` RN-AYU-031, `proveedores-contratos.md` RF-PRV-002, `dominios-certificados.md` RN-DOM-014, `lineas-moviles.md` §"Se audita", `licencias-software.md` §"Se audita", `gestion-cambios.md` §"Qué se audita", `integraciones-api.md` RN-INT-012, `entregas-devoluciones.md` RNF-ENT-005 | R-02 (etapa) y R-07 (filtros por valor; REP no cita D-030) |
| H-CUM-02 Excepciones dispersas | **Cerrado** | RF-OC-026 (ocho casillas, 90 días, segundo administrador, resumen mensual), PS-10 `empresa.excepciones_funciones`, D-031.6 a 8, D-043.2. Sin excepción propia: PRV RN-PRV-017, AYU RN-AYU-011, PRE RN-PRE-006, CAM RN-CAM-004 (retirada), PRB RN-PRB-009, DOM y LIC (casillas del interruptor único) | R-14 (líneas y dominios usan la casilla «contratos» sin nombrarse en RF-OC-026) |
| H-CUM-03 Gasto fuera de la OC y puertas laterales | **Parcial** | Cargo especial solo con `lineas.administrar_planes` (PS-96, RN-LIN-015); segunda persona en dominios y líneas (PS-224, PS-228, D-043 tabla); medida única "total con impuesto en moneda base" (RN-017, D-043.3); informe "sin respaldo de compra" y "posible compra fraccionada" (RF-OC-048, RF-PRE-025); gasto manual y reclasificar con RN-PRE-007; renovación automática como autor "sistema" (RN-PRV-022) | R-05 (actos sin fila) y R-06 (SUP-LIN-14 y SUP-DOM-13 siguen "Propuesto") |
| H-CUM-04 Respaldos y registro de anonimizaciones | **Parcial** | D-032, D-052.3 y 4; RF-DAT-005; `plan-entornos-y-costos.md` (30 diarios y 12 mensuales); registro fuera de la base restaurada | R-02: RF-DAT-005, RF-AUD-015 y RF-AUD-016 están en Etapa 7; el registro debe existir cuando se pueda anonimizar (Etapa 2) |
| H-CUM-05 Choques de permisos | **Cerrado** | `registro-permisos.md` PS-01 a PS-229 (PS-22 Almacén "-", PS-26 cesar Administrador y Jefatura, PS-55 entregar Administrador y Técnico, PS-20 y PS-21 solo Administrador, PS-88 clave solo Administrador); RF-ROL-004, 005, 014; D-036, D-037. Grep en los 17 módulos: cero apariciones de `datos-personales.ver`, `personas.ver_datos`, `exportar.personas` o variantes (solo en notas de "retirado") | R-01 (redacción de RF-PER-005) |
| H-CUM-06 Correos con datos personales | **Cerrado** | RF-ACC-021 (solo invitación, acceso y aprobación en la v1), RF-DAT-012, D-061.4; `notificaciones.md` RF-NOT-007, RF-NOT-030, RN-NOT-003, RN-NOT-027, CA-NOT-05; `entregas-devoluciones.md` §8 ("En la v1 este módulo no envía correos"); `onboarding-offboarding.md` RN-ONB-020 y CA-ONB-14 | Nada |
| H-CUM-07 Exportación sin controles | **Cerrado** | RF-EXP-001 a 007 (Etapa 2), RF-IMP-013, D-061.1, D-036.3; todos los módulos usan PS-20 y PS-21; `reportes-tableros.md` RN-REP-005 a 010 | Nada |
| H-CUM-08 Anonimizar destruye la constancia | **Cerrado** (provisional hasta legal) | D-033.1 a 3 y 6, D-051; RF-DAT-011, §18.1 fila "Copia del nombre y área en el acta"; `personas-ubicaciones.md` RN-PRS-021; `entregas-devoluciones.md` RN-ENT-006 | **[LEGAL]** L-05 y L-12 contestados |
| H-CUM-09 Inventario de datos y retención por módulo | **Parcial** | §18.1 con 18 filas, RF-DAT-010 (prueba "canario"), "archivado" definido (RN-NOT-015), contactos de proveedor a 2 años; 16 de 17 módulos tienen sección "Datos personales" | R-04 (la tabla del núcleo omite varios datos que los módulos declaran) |
| H-CUM-10 Texto libre con secretos o datos | **Parcial** | Validador común (D-063.2); redacción por seguridad PS-153, PS-221, PS-222 y RF-DAT-013; avisos en pantalla (D-030.6) | R-09 (la redacción llega en Fase 2 pero hay texto libre desde la Etapa 1, y los motivos se guardan por valor en la auditoría) |
| H-CUM-11 Derechos de las personas | **Cerrado** | RF-PER-012 y PS-29 (Etapa 2), RF-PER-013, D-061.2; `mesa-de-ayuda.md` RN-AYU-027 y RF-AYU-041; `portal-autoservicio.md` RN-POR-020; copia por descarga única, nunca por correo | R-08 (quién atiende si el solicitante es el único Administrador) |
| H-CUM-12 Aviso a Personas sin cuenta | **Cerrado** | RF-ACC-023 (reaceptación al cambiar versión), RF-DAT-014 (texto por empresa, impreso en el acta) | Nada |
| H-CUM-13 Gaps de auditoría | **Cerrado** | RF-AUD-005 (lecturas masivas desde 5.000 filas, registro de envíos, solicitudes de derechos), RF-AUD-013 (autor "sistema" con regla y quien la configuró), RF-AUD-016 (purga por partición, dos personas), RF-AUD-017 y RF-PLA-007 (dos registros), RF-PLA-005 (soporte visible en la auditoría de la empresa) | Nada |
| H-CUM-14 Integraciones | **Cerrado** | D-047; `integraciones-api.md` RN-INT-010 ("nunca proveedores ni cesar Personas"), RN-INT-022 ("en revisión" y suspensión a los 7 días), RN-INT-043 (código interno en SAP) | R-12 (RN-INT-011 solo nombra a quien creó o rotó la clave) |
| H-CUM-15 Cese bloqueado por equipos | **Parcial** | D-034, D-061.7; RF-PER-006 y RF-PER-011 (motivo de cese en lista cerrada); `personas-ubicaciones.md` RN-PRS-008 y 012; `entregas-devoluciones.md` RN-ENT-016 (tipo "No devuelto tras el cese" eliminado); `onboarding-offboarding.md` RN-ONB-006 | R-01: RF-PER-005 contradice a RN-PRS-011, CA-PRS-05 y RF-ONB-011 sobre qué pasa si quien cesa no puede suspender la cuenta |
| H-CUM-16 Rescate de empresa | **Cerrado** | RF-ACC-002 (contacto autorizado), RF-PLA-003 (dos personas, espera de 24 horas, evidencia, aviso), RF-PLA-009, D-048.5 | Nada |
| H-CUM-17 Anonimización irreversible sin doble control | **Cerrado** | RF-PER-013, PS-28 (control "No": propone uno y ejecuta otro), `personas-ubicaciones.md` RN-PRS-020 y RF-PRS-015, D-033.4 y 5 | R-02 (etapa de los mecanismos de apoyo) |
| H-CUM-18 Documentación operativa | **Parcial** | D-059; RF-DAT-015; RF-EMP-005 (activar módulos, auditado); RNF-015, RNF-016; `riesgos.md` 20 a 26 y 27 a 29 | R-10: `docs/operaciones/procedimiento-incidente-datos.md`, `docs/trazabilidad.md` y `docs/calidad/` no existen todavía |
| H-CUM-19 Menores | **Parcial** | SUP-LIC-03 decidido en D-035; RN-NOT-002 dice "usuario"; AYU-S07 en la tabla; contactos de proveedor con plazo (§18.1); módulo de Personas renumerado a `RF-PRS` (D-049.1) | R-03 (numeración de L-xx), R-11 y R-13 |

## 3. Las tres condiciones previas a la Etapa 1

| # | Condición | Veredicto | Prueba y observaciones |
|---|---|---|---|
| 1 | D-030 bajada a los documentos (núcleo y cada módulo) | **Cumplida con observaciones** | Núcleo: RF-AUD-003, 014, 015, 016, §18.2, CA-054. Grep de `D-030`: 16 de 17 módulos lo citan; falta `reportes-tableros.md`. Observaciones: R-02 (RF-AUD-015 y 016 en Etapa 7), R-07 (filtros de exportación y de lectura de Personas se guardan por valor en la auditoría), R-09 (los motivos son texto libre y se guardan por valor; solo hay advertencia en pantalla) |
| 2 | D-031 ampliada: casilla única por área, sin reglas propias | **Cumplida** | RF-OC-026 y PS-10: ocho casillas, apagadas, 90 días, segundo administrador, resumen mensual. Ningún módulo conserva excepción propia (PRV RN-PRV-017, AYU RN-AYU-011, PRE RN-PRE-006, CAM RN-CAM-004 retirada y RN-CAM-024, PRB RN-PRB-009, DOM y LIC). La autoentrega no tiene excepción (RN-010, PS-55). Observación: R-14 |
| 3 | Matriz única de permisos | **Cumplida** | `registro-permisos.md` con PS-01 a PS-229; RF-ROL-004 y 014 (una prueba falla si el código usa un permiso fuera del registro). Los 13 choques de D-037 están aplicados en el registro y en los módulos. Observación: R-01 |

## 4. Separación de funciones en todo lo que mueve dinero o aprueba (y RN-017)

Regla única RN-017 (§21 del núcleo): el acto exige otra persona cuando el total comprometido, con impuesto y en moneda base, supera estrictamente el límite; con límite 0, toda orden con al menos una línea; otra moneda, siempre. Una función única `requiereSegundaPersona(acto, monto, moneda)`. La citan 8 módulos (PRV, LIC, PRE, DOM, LIN, PRB, CAM, AYU) y el núcleo.

| Área | Qué exige el sistema | Dónde lo comprobé | ¿Cumple? |
|---|---|---|---|
| Órdenes de compra | Quien crea o edita no aprueba; quien aprueba no recibe; quien recibe no creó ni aprobó; proveedores en permiso aparte (solo Administrador); autoentrega sin excepción | RF-OC-021 a 027, PS-37, PS-63 y PS-67 con control "No" | Sí. Observación menor: `recepciones.revertir` (PS-68) no lleva control "No"; el Administrador que recibió puede revertir su propia recepción (R-05) |
| Contratos de proveedor | Crear solo Administrador; activar Administrador o Jefatura con "No"; sobre el límite, otra persona; renovación automática como autor "sistema" con la regla y quien aprobó | PS-75, PS-76, RN-PRV-015 a 022 | Sí. Terminar o anular (PS-78) lo hace una sola persona con motivo; lo acepto porque no compromete gasto |
| Licencias | El contrato de licencia es un contrato `CTR-` y se confirma con PS-76 (segunda persona sobre el límite); la clave solo la ve el Administrador, con reautenticación, tope de 20 por hora y auditoría | D-044.4, D-035.4, PS-88 y PS-89 | Sí |
| Presupuesto | Aprobar presupuesto o modificación: siempre otra persona; gasto manual y reclasificación: otra persona sobre el límite; anular gasto: siempre otra persona | PS-114, PS-116 a 118, RN-PRE-007, CA-PRE-15 | Sí |
| Cambios | Aprobar: siempre otra persona; riesgo Alto: permiso aparte y aprobador distinto del implementador; cerrar: no lo cierra quien lo implementó; reaprobar plantilla: otra persona | PS-172, 173, 175, 177 | Sí |
| Problemas | Publicar un error conocido: quien no lo redactó (o la casilla "problemas") | PS-185, RN-PRB-009 | Sí |
| Mesa de ayuda | Aprobar una solicitud con aprobación: quien no la pidió | PS-154, RN-AYU-011 | Sí |
| Claves de API | Ninguna clave aprueba, recibe, da de baja ni crea proveedores; quien creó o rotó la clave no aprueba la OC que esa integración crea; crear claves pide reautenticación; clave de creador inactivo pasa a "en revisión" | RN-INT-010, 011, 022, D-047, D-048.2 | Sí con observación R-12: falta quien asume o revoca la clave |
| Líneas | Cargo especial solo con `lineas.administrar_planes` (Administrador); confirmar costo: otra persona sobre el límite | PS-96, PS-224, RN-LIN-015 | Sí, salvo R-06 |
| Dominios y certificados | Confirmar costo: otra persona sobre el límite; cambiar titular: permiso sensible aparte con reautenticación | PS-228, PS-100, RN-DOM-014 | Sí, salvo R-06 |
| Órdenes de servicio | Aprobar una orden con costo sobre el límite: otra persona | RF-OS-008, PS-73, CA-055 | Sí |
| Garantías y mantenimiento | No hay segunda persona para el costo de una garantía extendida ni de un mantenimiento sin orden de servicio | `garantias-mantenimiento.md` RN-GAR-027, §6 | **No**: R-05 |
| Corregir el costo de un activo | Permiso sensible solo Administrador, con motivo | PS-51 | Parcial: sin segunda persona aunque el monto sea grande (R-05) |

**Sobre RN-017:** la tabla de actos (§21) cubre 12 actos. Le faltan tres filas: garantía extendida y mantenimiento sin orden de servicio con costo propio; corregir el costo de un activo; revertir una recepción por quien la confirmó. Además "costo comprometido" de líneas y dominios es un supuesto propuesto por sus módulos (SUP-LIN-14, SUP-DOM-13) y D-043 no lo decidió.
Sobre la medida con impuesto: acepto la razón de D-043 ("es lo que se paga"). Mi propuesta de medir sin impuesto queda descartada con motivo y no la reabro.

## 5. Defectos residuales

Gravedad: A = alta, M = media, B = baja. Ninguno es crítico.

| ID | Grav. | Dónde | Hecho | Qué cambiar | Quién |
|---|---|---|---|---|---|
| R-01 | M | `documento-funcional.md` RF-PER-005 frente a `personas-ubicaciones.md` RN-PRS-011, CA-PRS-05; `onboarding-offboarding.md` RF-ONB-011; PS-26; D-034.4 | El núcleo dice que cesar "suspende al Usuario vinculado solo si quien cesa tiene además `usuarios.suspender`", lo que sugiere que el cese pasa sin suspender la cuenta. Los módulos, el registro y D-034.4 dicen que el cese se rechaza sin ese permiso. Si prevaleciera la lectura del núcleo, una persona cesada conservaría el acceso | Reescribir RF-PER-005: "si la Persona tiene Usuario vinculado, el cese exige además `usuarios.suspender`; sin él, se rechaza y no cambia nada" | Analista |
| R-02 | A | RF-AUD-015, RF-AUD-016, RF-DAT-005 (v1, Etapa 7) frente a RF-PER-013, RF-PER-014 (v1, Etapa 2) | La anonimización manual se puede ejecutar desde la Etapa 2, pero el mecanismo "anonimizar = sobrescribir con evento", el registro de anonimizaciones fuera de la base y la reaplicación al restaurar están marcados para la Etapa 7. Se podría anonimizar a alguien, restaurar un respaldo y revivirlo | Subir a Etapa 2 el registro de anonimizaciones (D-052.3), RF-AUD-015 y la reaplicación al restaurar; la purga a 5 años (RF-AUD-016) puede quedar en Etapa 7 | Analista, Ingeniero de Datos |
| R-03 | M | Núcleo §18.1 (fila de IMEI), RF-DAT-007, §25; `hoja-ceo.md` | El núcleo usa la numeración vieja de las preguntas legales (L-11 = IMEI, L-06 y L-09 = derechos); los módulos y D-034.6 usan la consolidada (L-09 = qué es dato personal, L-11 = efectos laborales). En §25 faltan L-10, L-13 y L-15 | Adoptar una sola lista (la de la sección 6 de este informe) y corregir las tres citas del núcleo; completar §25 con las 16 preguntas | Analista |
| R-04 | M | Núcleo §18.1 | La tabla omite datos que los módulos declaran: puestos de licencia ligados a Persona, encuestas con nombre, acuse de recepción (con IP, 12 meses), textos de extravío, comentarios de cambios y problemas, registro de envíos con plazo definido (la fila dice "plazo que fije Notificaciones" aunque NOT-S07 ya dice 12 meses con correo enmascarado a los 90 días) | Completar §18.1 con una fila por dato declarado en los módulos y copiar los plazos | Analista |
| R-05 | M | Núcleo §21 (tabla de actos), PS-68, PS-51, `garantias-mantenimiento.md` RN-GAR-027 | Sin fila en la tabla: costo de garantía extendida y de mantenimiento sin orden de servicio; corregir costo de activo; reversión de recepción por quien la confirmó | Agregar las filas: segunda persona si supera el límite; PS-68 con control "No" sobre quien confirmó | Analista, Escuadrón A |
| R-06 | M | `lineas-moviles.md` SUP-LIN-14, `dominios-certificados.md` SUP-DOM-13 | La definición de "costo comprometido" está como "Propuesto" y D-043 la dejó sin decidir; sin ella RN-017 no es probable para líneas y dominios | El Gerente de TI decide ambas en `decisiones.md` | Gerente de TI |
| R-07 | B | `reportes-tableros.md` RF-REP-015, §6 (registro de exportación); `integraciones-api.md` §6 (acceso a Personas por API) | La auditoría guarda "filtros" por valor; un filtro por nombre o correo metería un dato personal en la auditoría. REP no cita D-030 | Registrar el campo filtrado y el tipo, no el texto buscado, cuando el campo es de la lista cerrada de D-030.6 | Escuadrón F |
| R-08 | M | D-061.2; `personas-ubicaciones.md` RN-PRS-020; `mesa-de-ayuda.md` RN-AYU-027 | Quien presenta el pedido no lo atiende y "un Administrador no atiende un pedido sobre sí mismo", pero si es el único Administrador, D-061.2 dice "la plataforma", que no ve datos del negocio (RF-PLA-004). No hay quien lo atienda | Definir el reemplazo: otro usuario designado por la empresa con PS-29, o el procedimiento de rescate (D-048.5) con evidencia | Gerente de TI, Escuadrón D |
| R-09 | M | RF-DAT-013 (Fase 2); RF-AUD-003 ("motivo cuando aplique"); D-030.6 | La redacción por seguridad llega en Fase 2, pero desde la Etapa 1 hay motivos, observaciones y notas de texto libre. El motivo se guarda por valor en la auditoría con solo una advertencia en pantalla | Declarar en §18.1 y en el aviso de privacidad que el motivo es texto libre no anonimizable; adelantar la redacción por seguridad de los registros del núcleo a la Etapa 4 | Analista, Seguridad |
| R-10 | M | D-064.13; D-059; D-052 | Todavía no existen `docs/operaciones/procedimiento-incidente-datos.md`, `docs/trazabilidad.md` ni `docs/calidad/`. La condición 13 de la puerta de la Etapa 0 pide el procedimiento en borrador | Redactar el procedimiento (Seguridad y yo), crear `trazabilidad.md` y `calidad/` | Seguridad, Cumplimiento, QA, Auditor Técnico |
| R-11 | B | `riesgos.md` #10 | Dice "Opinión legal antes de la Etapa 1", pero D-064 aclara que la opinión legal no bloquea codificar, sino cargar datos reales | Cambiar el plan del riesgo #10 a "antes de cargar datos reales (prioridad A)" | Gerente de TI |
| R-12 | B | `integraciones-api.md` RN-INT-011 | Solo impide aprobar a quien creó o rotó la clave; con "en revisión" otra persona puede asumirla, y también quien la revoca | Incluir a quien asume o revoca la clave | Escuadrón F |
| R-13 | B | `onboarding-offboarding.md` E-ONB-01 | Apunta a "decisiones.md, Legal punto 3" (aviso de privacidad); la pregunta laboral es L-11 | Citar L-11 | Escuadrón D |
| R-14 | B | RF-OC-026; `lineas-moviles.md`, `dominios-certificados.md` | Líneas y dominios usan la casilla «contratos», que no los nombra | Escribir en RF-OC-026 que «contratos» cubre contratos, licencias... y costos de líneas y dominios, o agregar una casilla propia | Analista |

## 6. Lista consolidada actualizada: puntos para asesoría legal

Misma numeración que mi informe anterior (sección 6), que es la que citan `decisiones.md`, `hoja-ceo.md` y los módulos. Prioridad A = antes de cargar datos reales: **son ocho** (L-01, L-02, L-03, L-04, L-07, L-08, L-14 y L-16). Cambios desde el informe anterior: L-04 ya no incluye "archivos de importación 30 días" (D-050.6: el archivo no se guarda) y suma las filas en preparación (7 días); L-09 incluye el código interno de usuario en archivos de SAP.

| ID | Prior. | Qué hay que confirmar | Estado |
|---|---|---|---|
| L-01 | A | Ley aplicable por país y papel de cada parte (empresa, plataforma, alojamiento) | Pendiente |
| L-02 | A | Registro o declaración de los bancos de datos ante la autoridad | Pendiente |
| L-03 | A | Texto del aviso de privacidad y términos; cómo informar a Personas sin cuenta y a contactos de proveedor; reaceptación | Pendiente |
| L-04 | A | Plazos: auditoría 5 años; anonimización 2 años; respaldos 30 días y 12 meses; eventos de seguridad 12 meses; registro de envíos 12 meses y bandeja 90 días; casos de ayuda 5 años; filas de importación 7 días; IP en la auditoría | Pendiente |
| L-05 | B | Conservar el nombre en la constancia de entrega hasta el fin de su plazo y qué hacer con equipos no devueltos de una Persona anonimizada | Pendiente; regla provisional D-033 |
| L-06 | B | Derechos de acceso, corrección y eliminación: plazos, verificación de identidad, entrega de la copia, eliminación condicionada a devolver equipos, respaldos y auditoría | Pendiente |
| L-07 | A | Varias empresas en un mismo servidor, servidor en otro país, proveedores externos (correo, ingreso con Microsoft o Google, SAP) | Pendiente |
| L-08 | A | Contratos con proveedores técnicos y con cada empresa | Pendiente |
| L-09 | B | Qué es dato personal: IP, correo de intentos fallidos, IMEI, número de línea, código de empleado, titular persona natural, contactos de proveedor, código de usuario enviado a SAP | Pendiente; tratados como personales mientras tanto (D-030.6) |
| L-10 | B | Aviso o consentimiento por registrar accesos y acciones de cada empleado | Pendiente |
| L-11 | C | Efectos laborales: recordatorio al correo personal de un exempleado, reclamar equipos, "firma rechazada", equipos pendientes de devolución, cobro o descuento | Pendiente; recordatorio apagado |
| L-12 | B | Valor probatorio de acta en papel archivada por TI, aceptación en pantalla, acuse y registros; textos de descargo | Pendiente |
| L-13 | C | Responsabilidad sobre datos de personas externas (contratistas, practicantes de otra empresa) | Pendiente |
| L-14 | A | Conservación obligatoria de documentos de compra y costos frente a la anonimización | Pendiente |
| L-15 | C | Impuestos como costo, depreciación referencial, capitalización y consolidado de monedas (contabilidad además de legal) | Pendiente |
| L-16 | A | Obligación y plazos de avisar una fuga de datos a la autoridad y a los afectados | Pendiente; plazos internos en D-059 |

## 7. Lista para el CEO y consistencia con `hoja-ceo.md`

**Lista consolidada actualizada (resumen).**

| Clase | Qué se le pide | Recomendación | Por qué |
|---|---|---|---|
| Dinero | Servicio de correo | Aprobar, con tope por empresa y alerta al 80 % | Sin correo nadie entra |
| Dinero | Alojamiento, base de datos, respaldos (30 diarios, 12 mensuales) y copia externa inmutable | Aprobar el arranque; el plan de uso real cuando haya precios verificados | La retención de D-032 baja el costo |
| Dinero | Gestor de secretos y llaves físicas; dominio (subdominio de uno existente) | Aprobar | Costo bajo y protege las cuentas más valiosas |
| Dinero | Abogado de protección de datos | Contratar antes de cargar datos reales | Ocho preguntas previas |
| Dinero | Adjuntos, SAP con conexión directa, consulta a contabilidad | No ahora; consultar al llegar | Costo recurrente sin necesidad inmediata |
| Legal | Las 16 preguntas (sección 6) | Contestar primero las ocho de prioridad A | Condicionan datos reales y producción |
| Legal | Si ofrecerá la plataforma a empresas que no son suyas | Avisar si existe el plan | Cambia contratos y costos |
| Irreversible | Anonimizar o borrar datos personales | Apagado hasta opinión escrita; manual solo para derechos y con dos personas | No se deshace y puede destruir una prueba |
| Irreversible | Purgar la auditoría a 5 años y rotar respaldos | No activar antes de L-04 | Lo purgado no se recupera |
| Irreversible | Pasar a datos reales (Etapa 7) | Autorizar con: respaldo restaurado y anonimizaciones reaplicadas, aviso de privacidad aceptable, contratos firmados, preguntas de prioridad A contestadas, procedimiento de incidente escrito | Desde ahí los errores afectan a personas reales |
| Irreversible (informar) | Archivos exportados fuera de la plataforma | Solo informar | Ya no se controlan |
| Informar (no decidir) | Empresas de una persona que activen la excepción de separación de funciones | Resumen mensual de usos; la casilla vence a los 90 días | Es un riesgo de fraude aceptado por la empresa |

**Comparación con `docs/equipo/hoja-ceo.md`.**

| Punto | Estado | Acción |
|---|---|---|
| Dinero: correo, servidores y copias, gastos de seguridad, dominio, abogado | Consistente | Ninguna |
| Cifras de DevOps marcadas "no verificadas" | Consistente con `decisiones.md` | Ninguna |
| Legal: "16 preguntas" | Consistente | Ninguna |
| Legal: "**Siete** deben estar resueltas antes de cargar datos reales" | **Error** | Decir **ocho** (L-01, 02, 03, 04, 07, 08, 14, 16). El "siete" salió de mi informe anterior; D-064 ya enumera ocho |
| Las cinco preguntas más importantes | Consistente | Ninguna |
| Irreversible: anonimizar, pasar a datos reales, archivos exportados | Consistente | Ninguna |
| Irreversible: purga de la auditoría y rotación de respaldos (I-02) | **Falta** | Agregar una línea: "Borrar la auditoría vieja y las copias de seguridad antiguas tampoco se deshace; no se activa hasta que el abogado confirme los plazos" |
| Pasar a datos reales: condiciones | **Incompleta** | Sumar "aviso de privacidad aceptable" y "procedimiento escrito si hubiera una fuga" (I-03) |
| Adjuntos, conexión directa con SAP y consulta a contabilidad (D7 del núcleo) | **Falta** | Una línea: "Más adelante se le consultará por archivos adjuntos, conexión con SAP y criterios contables; hoy no hay que decidir nada" |
| Insumo "si la empresa usa SAP" | **Falta** (menor) | Agregarlo en la sección D |
| Sección E ("lo que no tiene que decidir") | No sobra | Es coherente con las decisiones |

No encontré nada que sobre en la hoja ni algo que contradiga a `decisiones.md`.

## 8. Veredicto y condiciones mínimas

**Veredicto: CONFORME CON OBSERVACIONES.**

Lo que pesa a favor: 12 de 19 hallazgos cerrados con prueba; las tres condiciones previas a la Etapa 1 cumplidas; el registro de permisos único y probable; la auditoría sin datos personales por valor; la excepción de separación de funciones centralizada; correos con contenido mínimo; puerta única de exportación desde la Etapa 2; registro de solicitudes de derechos; riesgos 20 a 26 registrados.
Por qué no es "conforme" todavía: queda 1 defecto alto del núcleo (R-02) y 7 hallazgos parciales; D-064.3 exige que no haya hallazgos altos abiertos en el núcleo.

**Condiciones mínimas para pasar a "conforme" (en este orden):**

1. **Antes de cerrar el documento v1.0 (puerta de la Etapa 0):** corregir R-01, R-02, R-03, R-04 y R-05 en el núcleo; que el Gerente de TI decida R-06; crear el borrador del procedimiento de incidente, `trazabilidad.md` y `calidad/` (R-10); corregir `hoja-ceo.md` (sección 7) y el riesgo #10 (R-11).
2. **Antes de iniciar la Etapa 2:** R-08 (quién atiende un pedido sobre el único Administrador), R-07 y R-14.
3. **Antes de activar el módulo que corresponda:** R-09 (redacción de texto libre en el núcleo, Etapa 4), R-12 y R-13.
4. **Antes de cargar datos reales:** respuestas legales de prioridad A (L-01, 02, 03, 04, 07, 08, 14, 16), contratos con proveedores técnicos firmados, restauración probada con reaplicación de anonimizaciones y procedimiento de incidente vigente.
5. **Nunca antes de la opinión legal por escrito:** anonimización automática, purga de la auditoría, rotación de respaldos y recordatorio de salida al correo personal de un exempleado.

Si se cumple la condición 1, firmo el visto bueno de cumplimiento del núcleo para la puerta de la Etapa 0 (D-064.3).

## 9. Mensajes enviados

Tres mensajes cortos a escuadrones; registro literal en `docs/revision-cruzada/mensajes-ronda3-auditor-cumplimiento.md`.

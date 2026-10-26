# Ronda 4: Auditor de Cumplimiento y Privacidad

**Fecha:** 2026-10-26 · **Mesa de revisión #002, ronda 4**
**Abrí:** `docs/documento-funcional.md` v0.3 (§18, §21, §25, RF-AUD, RF-DAT, RF-OC-026, RF-PER-005), `docs/registro-permisos.md`, `docs/equipo/decisiones.md` (D-030, D-059, D-064 a D-076), `docs/equipo/riesgos.md`, `docs/equipo/hoja-ceo.md`, `docs/equipo/puerta-etapa-0.md`, `docs/operaciones/procedimiento-incidente-datos.md` y los 17 módulos de `docs/modulos/`.
**Cómo leer:** HECHO = comprobado con Grep o lectura. OPINIÓN = criterio mío. **[LEGAL]** = punto para asesoría legal, no es opinión legal. Solo edité el procedimiento de incidente (sección 6, anexo C y las líneas de apoyo en otras secciones) y este informe.

## 1. Resumen

1. De mis 19 hallazgos: **18 cerrados y 1 parcial** (H-CUM-18, la parte operativa). De mis 14 residuales: **14 cerrados**, dos con observación menor (R-04, R-09).
2. Las **tres condiciones previas a la Etapa 1 se cumplen** (sección 2).
3. No tengo hallazgos Críticos ni Altos abiertos del núcleo.
4. Encontré **6 observaciones nuevas, todas menores** (sección 5).
5. `hoja-ceo.md` es coherente (dice "ocho" y trae las líneas que pedí); le faltan 4 líneas por el procedimiento de incidente (sección 6).
6. **Veredicto: CONFORME CON OBSERVACIONES.** Firmo la condición 3 de D-064 en cuanto se cumplan las dos condiciones de la sección 8.

## 2. Las tres condiciones previas a la Etapa 1

| # | Condición | Veredicto | Prueba |
|---|---|---|---|
| (a) | D-030 bajada: la auditoría no guarda valores personales (núcleo y 17 módulos) | **Cumplida** | Núcleo: RF-AUD-003, RF-AUD-014 (solo el identificador y "qué campo cambió"), RF-AUD-015 y RF-DAT-016 en Etapa 2, RF-AUD-016, §18.2 (lista cerrada), CA-054a. Grep de `D-030` en `docs/modulos`: **17 de 17** archivos (antes 16); `reportes-tableros.md` RF-REP-015 y §6 guardan solo "nombres de los campos filtrados sin sus valores". Observación O-2 |
| (b) | D-031 ampliada: casilla única por área, sin reglas propias de excepción | **Cumplida** | RF-OC-026: ocho casillas, apagadas, 90 días, segundo administrador, resumen mensual, mapa acto a casilla (D-066), y lista de lo que nunca se exceptúa. Grep en módulos: cero excepciones propias; PRV RN-PRV-017, AYU RN-AYU-011, PRE RN-PRE-006, CAM RN-CAM-004 (retirada), PRB RN-PRB-009, DOM y LIC usan la casilla del interruptor único |
| (c) | Registro único de permisos sin nombres viejos | **Cumplida** | Grep de `datos-personales.ver`, `personas.ver_datos`, `exportar.personas`, `gar.recibir_alertas`, `PS-84` y `PS-85` fuera de los informes de revisión: aparecen **solo** en `registro-permisos.md` (regla de nombres, §15 "Equivalencias" y filas PS-84 y PS-85 marcadas "Retirado"), en `decisiones.md` (historia) y en notas de "retirado" de `licencias-software.md` y `proveedores-contratos.md` (RN-PRV-044). Ningún módulo ni el núcleo los usan como permiso vigente. El registro marca 52 sensibles (PS-232 a PS-234 creados) |

## 3. Defectos residuales R-01 a R-14

| ID | Estado | Prueba |
|---|---|---|
| R-01 Cese y suspensión | **Cerrado** | RF-PER-005: "exige además `usuarios.suspender`... sin él, el cese se rechaza y nada cambia"; CA-052a1 |
| R-02 Etapa de la anonimización | **Cerrado** | RF-AUD-015 y RF-DAT-016 en Etapa 2; RF-DAT-005 reaplica el registro al restaurar |
| R-03 Numeración de L-xx | **Cerrado** | §25 lista L-01 a L-16 con la numeración consolidada; §18.1 cita L-09; RF-DAT-006 y RF-DAT-007 citan L-05, L-12 y L-06 |
| R-04 §18.1 completa | **Cerrado con observación** | §18.1 tiene **22 filas**. Están todas las que pedí: puestos de licencia, encuestas con nombre, acuse con IP a 12 meses, textos de extravío, comentarios de cambios y problemas, y registro de envíos (12 meses; correo enmascarado a los 90 días). Observación O-1 |
| R-05 Actos de dinero sin fila | **Cerrado** | Tabla de actos de RN-017 con garantía extendida, mantenimiento sin orden de servicio, corregir costo (PS-51, control "No") y revertir recepción; PS-68 `2F A No`; PS-231; D-065 S-33 |
| R-06 Costo comprometido | **Cerrado** | D-070.1 a 5; RN-017 (1); SUP-LIN-14, SUP-DOM-13 y SUP-DOM-14 "Aceptado (D-070)" |
| R-07 Filtros por valor | **Cerrado** | RF-REP-015 y CA-REP-06; `integraciones-api.md` RN-INT-013 |
| R-08 Derechos del único Administrador | **Cerrado** | D-071.1; RN-PRS-033; RN-AYU-027 cita RN-PRS-033 (`mesa-de-ayuda.md` línea 170); CA-093 (suplente de derechos, recordatorios cada 3 días, aviso al contacto autorizado a los 5 días) |
| R-09 Texto libre no anonimizable | **Cerrado con observación** | §18.1: fila "Motivos y notas" y declaración propia ("la plataforma no puede garantizar su anonimización"); RF-DAT-013 y PS-234 `texto.redactar` en Etapa 4. Observaciones O-2 y O-3 |
| R-10 Documentos operativos | **Cerrado como borrador** | `procedimiento-incidente-datos.md` existe (v0.3 con mi sección 6 y anexo C); `docs/trazabilidad.md` y `docs/calidad/` existen. Aprobación, simulacro y validación del abogado quedan para antes de datos reales |
| R-11 Riesgo #10 | **Cerrado** | `riesgos.md` #10: "antes de cargar datos reales (D-064)" |
| R-12 RN-INT-011 | **Cerrado** | "Quien creó, rotó, asumió o revocó una clave no puede aprobar una OC creada por esa integración" |
| R-13 E-ONB-01 | **Cerrado** | Cita L-11 y D-034.6 |
| R-14 Casilla «contratos» | **Cerrado** | RF-OC-026 renombra a «contratos y servicios recurrentes» y trae el mapa (D-066) |

## 4. Estado de los 19 hallazgos

| ID | Estado | Prueba |
|---|---|---|
| H-CUM-01 Anonimizar sin tocar la auditoría | Cerrado | Sección 2 (a); R-02 y R-07 cerrados |
| H-CUM-02 Excepciones dispersas | Cerrado | Sección 2 (b); R-14 |
| H-CUM-03 Gasto fuera de la OC | Cerrado | R-05 y R-06 |
| H-CUM-04 Respaldos y registro de anonimizaciones | Cerrado | R-02; RF-DAT-005 y RF-DAT-016 |
| H-CUM-05 Choques de permisos | Cerrado | Sección 2 (c); R-01 |
| H-CUM-06 Correos con datos personales | Cerrado | RF-DAT-012 (contenido mínimo) |
| H-CUM-07 Exportación sin controles | Cerrado | RF-EXP-001 a 007; RF-REP-015 |
| H-CUM-08 Anonimizar destruye la constancia | Cerrado (provisional hasta legal) | RF-DAT-006 y RF-DAT-011; **[LEGAL]** L-05 y L-12 |
| H-CUM-09 Inventario y retención | Cerrado con observación | R-04; O-1 |
| H-CUM-10 Texto libre | Cerrado con observación | R-09; O-2 y O-3 |
| H-CUM-11 Derechos de las personas | Cerrado | R-08; PS-29 |
| H-CUM-12 Aviso a Personas sin cuenta | Cerrado | RF-ACC-023, RF-DAT-014 |
| H-CUM-13 Gaps de auditoría | Cerrado | RF-AUD-005, 013, 016, 017 |
| H-CUM-14 Integraciones | Cerrado | R-12; RN-INT-010 y RN-INT-022 |
| H-CUM-15 Cese bloqueado por equipos | Cerrado | R-01 |
| H-CUM-16 Rescate de empresa | Cerrado | RF-PLA-003, 011, 012 |
| H-CUM-17 Anonimización sin doble control | Cerrado | PS-28 con control "No" |
| H-CUM-18 Documentación operativa | **Parcial** | El borrador v0.3 existe. Faltan, y son condiciones de producción y no de la Etapa 0: aprobación del Gerente de TI, simulacro con cronómetro, persona de guardia nombrada, abogado validando la sección 6 y el anexo C |
| H-CUM-19 Menores | Cerrado | R-03, R-11, R-13 |

## 5. Observaciones nuevas (menores, no bloquean)

| ID | Gravedad | Dónde | Hecho | Quién |
|---|---|---|---|---|
| O-1 | Baja | §18.1 | No hay fila para el **contacto autorizado** de cada empresa (RF-ACC-002, RF-PLA-011: nombre, correo y medio de contacto), ni para las **personas administradoras de la plataforma**, ni para el **código de usuario enviado a SAP** (L-09), ni para el **representante de la empresa fuera de la plataforma** (anexo C.8 del procedimiento). Son datos personales guardados | Analista |
| O-2 | Baja | `presupuesto-costos.md` RN-PRE-037 | Dice que "la auditoría no guarda su valor" para "descripciones y motivos". El núcleo (RF-AUD-003, "motivo cuando aplique") y `garantias-mantenimiento.md` dicen que **los motivos sí se guardan** (D-030.6). Hay que unificar: los motivos se guardan por valor y se declaran como texto libre no anonimizable | Escuadrón C |
| O-3 | Baja | RF-DAT-014 | El texto del aviso de privacidad no exige mencionar la declaración de texto libre (D-075 R-09 dice que se declara allí). Agregarlo al contenido mínimo del aviso | Analista |
| O-4 | Baja | `puerta-etapa-0.md` condición 13 y sección 6 | Dice que el procedimiento "no existe" y que PS-232 a PS-234 "aún no están en el registro"; ambos ya existen | Gerente de TI |
| O-5 | Baja | Procedimiento v0.2, sección 6 y anexo C | No tenía evaluación paso a paso de datos personales, criterios para decidir, quién valida con el abogado, ni plantillas al CEO, a la autoridad y al proveedor. **Resuelto en la v0.3** | Cumplimiento |
| O-6 | Baja | Procedimiento, sección 6.2 | Las 72 horas a la empresa pueden ser tarde si los plazos de la empresa corren desde que le avisamos. La v0.3 recomienda avisar en cuanto se tenga lo mínimo y lo agrega como subpregunta (d) de L-16 | Cumplimiento, abogado |

## 6. Revisión de `hoja-ceo.md`

**Es coherente con mi lista de 16 preguntas** y con lo que se escala (dinero, legal, irreversible).

| Punto | Estado |
|---|---|
| "16 preguntas legales" y "Ocho" previas a datos reales | **Coherente** (L-01, 02, 03, 04, 07, 08, 14, 16) |
| Dinero: correo, servidores y copias, gastos de seguridad, dominio, abogado, cifras no verificadas | Coherente |
| Irreversible: anonimizar, purga y copias antiguas, pasar a datos reales con todas las condiciones, archivos exportados | Coherente (sección C) |
| Adjuntos, SAP y contabilidad; insumo SAP | Presentes |
| Insumos: persona con suplente para alertas, dos personas administradoras | Presentes (sección D) |

**Faltan, por el procedimiento de incidente (las aplica el Gerente de TI; yo no edito esa hoja):**
1. En B (lo legal): "Si hubiera una fuga, usted decide con el abogado si se avisa a la autoridad y si se denuncia un delito; el equipo prepara los textos."
2. En A (dinero): "El abogado debe poder atender una consulta urgente el mismo día."
3. En D (lo que solo usted entrega): "Por cada empresa, el nombre y el medio de contacto de un representante fuera de la plataforma, para avisarle si falla el correo."
4. En B: nombrar cuáles son las ocho previas, en una línea y sin siglas: ley aplicable, registro ante la autoridad, aviso de privacidad, plazos de conservación, servidor compartido u otro país, contratos con proveedores, documentos de compra y aviso de fuga.

## 7. Los 16 puntos legales (estado)

Los 16 siguen **pendientes**. Ocho son previas a datos reales (prioridad A): L-01, L-02, L-03, L-04, L-07, L-08, L-14 y L-16. Las ocho restantes (L-05, L-06, L-09, L-10, L-11, L-12, L-13, L-15) son de prioridad B o C. **[ESCALAR AL CEO: confirmar con abogado]** todas, y **[ESCALAR AL CEO]** la contratación del abogado (dinero), con canal de urgencia. No hay nada nuevo de producto o ingeniería para el CEO.

## 8. Qué falta exactamente para que yo firme la puerta de la Etapa 0 (condición 3 de D-064)

No hay Críticos ni Altos abiertos del núcleo. Falta solo esto:
1. **Seguridad confirma por escrito** que leyó la sección 6, el anexo C y la línea nueva del anexo B de la v0.3 del procedimiento (ya aplicada en el archivo). Nadie aprueba lo que no revisó.
2. **El Gerente de TI da su visto bueno** al borrador v0.3 (el procedimiento lo aprueba él).

**No bloquean mi firma**, pero compruebo con Grep en la v1.0: O-1 y O-3 (Analista), O-2 (Escuadrón C), O-4 y las 4 líneas de la hoja (Gerente de TI).

**Siguen siendo condiciones de la Etapa 7 (datos reales), sin cambio:** respuestas legales de prioridad A, contratos con proveedores técnicos, restauración probada con reaplicación de anonimizaciones, procedimiento aprobado, ensayado y validado por el abogado, persona de guardia y representante por empresa. **Nunca sin opinión legal escrita:** anonimización automática, purga de la auditoría, rotación de respaldos y recordatorio al correo personal de un exempleado.

## 9. Veredicto

**CONFORME CON OBSERVACIONES.**

## 10. Nota para la Jefatura de Proyecto

- Hallazgos por gravedad: **0 críticos, 0 altos, 0 medios abiertos**; 7 bajos (O-1 a O-6 y la parte operativa de H-CUM-18).
- Puntos legales: los 16, ocho previas a datos reales; hoy ninguno tiene respuesta.
- Para el CEO (solo dinero, legal o irreversible): contratar al abogado con canal de urgencia, nombrar guardia y suplente, y un representante por empresa.
- Mensajes a enviar: Seguridad (revisar la v0.3), Analista (O-1, O-3), Escuadrón C (O-2), Gerente de TI (O-4 y la hoja).

# Criterios de aceptación por etapa

**Autor:** QA (qa-tester) · **Fecha:** 2026-10-29 · **Checkpoint:** commit `c787dd6` (árbol de documentos fuente limpio al generar) · **Fuente:** `docs/documento-funcional.md` v0.3 (secciones 21, 22 y 22.1; AN-01 a AN-15; D-065 a D-080), `docs/registro-permisos.md` v1.1 y los 19 módulos de `docs/modulos/` que ya están completos. Generado con `docs/calidad/herramientas/generar.py` (lectura de solo lectura; no se editó ningún documento fuente). Todas las cifras de este archivo valen para ese commit; si el documento cambia, se vuelve a generar.

**Para qué sirve.** Lista única de todos los criterios CA, con el módulo, los requisitos que cubre, la etapa en que se ejecutan, el tipo de prueba y si bloquean. Reemplaza a la versión del 2026-10-26 (451 criterios, commit `5ed0dcb`). Para el núcleo, la etapa sale **de la tabla 22.1 del documento funcional** (la fijó el Analista, D-075); para los módulos, de los requisitos que cada criterio cubre, salvo donde el módulo trae su propia tabla (notificaciones) o donde QA leyó el texto (anotado en la columna Nota).

## Cómo leer las columnas

- **Cubre:** la cabecera del criterio, tal como la escribió el Analista o el escuadrón.
- **Etapa del requisito:** la más temprana entre los requisitos que cubre. **Se ejecuta en:** la etapa en que el criterio **empieza** a correr. **Se completa en:** la etapa posterior en que ya existe todo lo que necesita (solo cuando 22.1 o el módulo lo dicen).
- **Tipo:** unitaria (reglas y cálculos sin base de datos); integración (base real, servidor, permisos, concurrencia, reloj, correo); navegador (Playwright: pantallas, PDF); manual (personas o ensayo, con apoyo automático donde se pueda). Es una clasificación hecha con palabras del texto del criterio, corregida por QA donde se equivoca (anotado en la columna Nota); QA la afina al escribir cada prueba.
- **Bloqueante:** sí = si falla, la etapa no se aprueba. "No (bloquea su módulo)" = es de Fase 2 o 3 y bloquea la entrega de ese módulo, no la v1 (D-056).
- **Etapa heredada:** el criterio solo cita reglas RN y no hay fila RF que lo cite; tomó la etapa más frecuente de su módulo. Debe confirmarlo el escuadrón.

## Resumen (checkpoint c787dd6, 2026-10-29)

**612 criterios:** 149 del núcleo (identificadores con letra, que son 109 números, CA-001 a CA-109) y 463 de los 19 módulos completos. El 2026-10-26 eran 451 (116 y 335): +161. Qué cambió: **11 criterios dejaron de existir como uno solo** porque se partieron (CA-038, CA-094, CA-GAR-01, CA-GAR-04, CA-PRS-01, CA-PRS-03, CA-PRS-08, CA-PRS-12, CA-PRS-14, CA-PRV-02, CA-PRV-04) y **74 criterios nuevos** los reemplazan o se suman: en el núcleo 35 (CA-015g, h e i de lectura de soporte; CA-038a a d; CA-094a a c; CA-095a a j de congelación por incidente, D-080; CA-096 a CA-105, con CA-104 en a y b) y en los módulos PRS 21, GAR 9 y PRV 6.

| Se ejecuta en | Criterios que empiezan aquí | Criterios que se completan aquí (empezaron antes) |
|---|---|---|
| Etapa 0 | 1 | 0 |
| Etapa 1 | 55 | 0 |
| Etapa 2 | 60 | 2 |
| Etapa 3 | 4 | 1 |
| Etapa 4 | 63 | 6 |
| Etapa 5 | 33 | 5 |
| Etapa 6 | 2 | 2 |
| Etapa 7 | 5 | 0 |
| Fase 2 | 138 | 5 |
| Fase 3 | 251 | 0 |
| **Total** | 612 | 21 |

**Criterios de la v1 (Etapas 0 a 7): 223.** De fases posteriores: 389. Antes (2026-10-26): 166 y 285.

Comparación con la versión anterior (2026-10-26). Las dos medidas son las mismas que entonces: dónde **empieza** cada criterio y dónde **termina**.

| Etapa | Antes (empiezan) | Ahora (empiezan) | Antes (terminan) | Ahora (terminan) |
|---|---|---|---|---|
| Etapa 0 | 0 | 1 | 0 | 1 |
| Etapa 1 | 52 | 55 | 38 | 41 |
| Etapa 2 | 37 | 60 | 32 | 59 |
| Etapa 3 | 4 | 4 | 3 | 3 |
| Etapa 4 | 44 | 63 | 54 | 69 |
| Etapa 5 | 24 | 33 | 28 | 37 |
| Etapa 6 | 2 | 2 | 3 | 3 |
| Etapa 7 | 3 | 5 | 3 | 5 |
| Fase 2 | 134 | 138 | 139 | 143 |
| Fase 3 | 151 | 251 | 151 | 251 |

Qué explica la diferencia: la mayor parte son criterios partidos y nuevos de la Etapa 2 (congelación por incidente CA-095a a g, PRS y PRV), de la Etapa 4 (importación en cuatro, código del activo, tope y lote de importación, estados, garantía, PRS) y de la Etapa 5 (CA-096 a CA-104b, recepción de garantía). La Etapa 0 gana CA-105 (verificación documental). Ningún criterio que ya existía cambió de etapa.

Por la etapa más temprana de su requisito:

| Etapa más temprana del requisito | Criterios |
|---|---|
| Etapa 0 | 3 |
| Etapa 1 | 64 |
| Etapa 2 | 65 |
| Etapa 3 | 4 |
| Etapa 4 | 48 |
| Etapa 5 | 26 |
| Etapa 6 | 3 |
| Etapa 7 | 4 |
| Fase 2 | 118 |
| Fase 3 | 166 |
| sin requisito RF (heredada) | 111 |

| Tipo de prueba | Criterios |
|---|---|
| integración | 323 |
| integración + navegador | 125 |
| unitaria | 85 |
| navegador | 66 |
| manual (con apoyo de integración) | 12 |
| manual (verificación documental) | 1 |

| Módulo | Criterios |
|---|---|
| Asistente de IA (ASI) | 55 |
| Mesa de ayuda (AYU) | 27 |
| Gestión de cambios (CAM) | 20 |
| CMDB ligera (CMD) | 21 |
| Dominios y certificados (DOM) | 14 |
| Entregas y devoluciones (ENT) | 17 |
| Garantías y mantenimiento (GAR) | 27 |
| Integraciones y API (INT) | 26 |
| Licencias de software (LIC) | 20 |
| Líneas móviles (LIN) | 16 |
| Microsoft Entra ID e Intune (MSF) | 44 |
| Notificaciones (NOT) | 22 |
| Onboarding y offboarding (ONB) | 15 |
| Portal de autoservicio (POR) | 16 |
| Gestión de problemas (PRB) | 17 |
| Presupuesto y costos (PRE) | 26 |
| Personas y ubicaciones (PRS) | 32 |
| Proveedores y contratos (PRV) | 26 |
| Reportes y tableros (REP) | 22 |
| Núcleo | 149 |

### Lo que cada etapa exige (D-076)

Bloqueantes de una etapa = los criterios que **empiezan** en ella más los que **se completan** en ella. Un criterio bloqueante que no se pueda ejecutar deja la etapa sin aprobar. "Antes de abrir" = criterios que D-076 exige tener redactados antes de que la etapa empiece; el detalle por requisito está en `docs/trazabilidad.md`.

| Etapa | Empiezan | Se completan | Bloqueantes en total | Puntos de D-076 aún pendientes antes de abrirla |
|---|---|---|---|---|
| Etapa 1 | 55 | 0 | 55 | 2 |
| Etapa 2 | 60 | 2 | 62 | 3 |
| Etapa 3 | 4 | 1 | 5 | 0 |
| Etapa 4 | 63 | 6 | 69 | 3 |
| Etapa 5 | 33 | 5 | 38 | 1 |
| Etapa 6 | 2 | 2 | 4 | 0 |
| Etapa 7 | 5 | 0 | 5 | 2 |

### Criterios que NO corren en la etapa de su requisito (37)

Dos casos distintos. **(A) Corren antes de lo que necesitan: 3.** Es un defecto del criterio: no se puede ejecutar. **(B) Arrancan después de la etapa más temprana de su requisito: 34.** El requisito se entrega antes de que su criterio corra; la etapa de ese requisito se cierra sin esa prueba. Muchos son consecuencia legítima de que el criterio necesita un módulo posterior (órdenes, activos, actas); aun así, el Gerente de TI debe saberlo al cerrar la etapa.

**(A) Corren antes:**

| Criterio | Corre en | Sus requisitos llegan hasta | Qué hay que corregir |
|---|---|---|---|
| CA-024 | Etapa 4 | Etapa 7 | La cabecera cubre RF-OC-028 (Etapa 7, P-009) y el criterio corre en Etapa 4: no se puede ejecutar entero. Propuesta de QA: Quitar RF-OC-028 de la cabecera de CA-024 y de su fila (la baja con motivo ya la prueba CA-024 en Etapa 4); la decisión P-009 de la Etapa 7 se verifica con un criterio documental nuevo. |
| CA-NOT-10 | Etapa 1 | Fase 2 | La tabla del módulo lo pone en Etapa 1 pero cubre requisitos de Fase 2 (rebotes y bandeja). El escuadrón C debe decir qué parte corre en Etapa 1. |
| CA-NOT-13 | Etapa 1 | Fase 2 | Igual que CA-NOT-10: cubre requisitos de Fase 2 (campana de no leídas). |

**(B) Arrancan después:**

| Criterio | Módulo | Etapa del requisito | Arranca en | Por qué |
|---|---|---|---|---|
| CA-012 | Núcleo | Etapa 1 | Etapa 5 | RF-ROL-009: Etapa 1; el criterio arranca en Etapa 5. Necesita órdenes de compra (Etapa 5). Hasta entonces "quien crea no aprueba" solo se prueba por la matriz (CA-011a) y CA-010. |
| CA-015h | Núcleo | Etapa 1 | Etapa 2 | RF-PLA-013: Etapa 1; el criterio arranca en Etapa 2. RF-PLA-013 es de Etapa 1, pero la mitad «sin secretos ni derechos» necesita campos secretos (Etapa 2) y la cola de derechos (Etapa 2). La Etapa 1 se cierra con CA-015g y CA-015i. |
| CA-016b | Núcleo | Etapa 2 | Etapa 4 | RF-PER-001: Etapa 2; el criterio arranca en Etapa 4. Necesita registrar una entrega de equipo (Etapa 4). |
| CA-019 | Núcleo | Etapa 2 | Etapa 3 | RF-CAT-011: Etapa 2; el criterio arranca en Etapa 3 |
| CA-020 | Núcleo | Etapa 2 | Etapa 3 (se completa en Etapa 5) | RF-CAT-002, RF-CAT-010, RF-CAT-012: Etapa 2; el criterio arranca en Etapa 3 |
| CA-023 | Núcleo | Etapa 3 | Etapa 4 | RF-SKU-009: Etapa 3; el criterio arranca en Etapa 4 |
| CA-032 | Núcleo | Etapa 2 | Etapa 5 | RF-CAT-005: Etapa 2; el criterio arranca en Etapa 5 |
| CA-036 | Núcleo | Etapa 4 | Etapa 5 | RF-INV-007: Etapa 4; el criterio arranca en Etapa 5 |
| CA-042 | Núcleo | Etapa 1 | Etapa 2 (se completa en Etapa 4) | RF-AUD-006, RF-UX-008: Etapa 1; el criterio arranca en Etapa 2 |
| CA-046 | Núcleo | Etapa 1 | Etapa 4 | RNF-002: Etapa 1; el criterio arranca en Etapa 4 |
| CA-052a2 | Núcleo | Etapa 2 | Etapa 4 | RF-PER-006: Etapa 2; el criterio arranca en Etapa 4 |
| CA-052b2 | Núcleo | Etapa 2 | Etapa 4 | RF-PER-006, RF-PER-013: Etapa 2; el criterio arranca en Etapa 4 |
| CA-052c | Núcleo | Etapa 1 | Etapa 2 | RF-USR-001, RF-USR-003: Etapa 1; el criterio arranca en Etapa 2 |
| CA-053 | Núcleo | Etapa 0 | Etapa 7 | RNF-017: Etapa 0; el criterio arranca en Etapa 7. Existe como plan desde la Etapa 0 y se ejecuta en la Etapa 7. El ensayo de restauración previo a la Etapa 1 (CI-17) cubre una parte. |
| CA-054a | Núcleo | Etapa 1 | Etapa 2 | RF-AUD-014, RF-USR-006: Etapa 1; el criterio arranca en Etapa 2 |
| CA-054b | Núcleo | Etapa 2 | Etapa 4 | RF-PER-014: Etapa 2; el criterio arranca en Etapa 4 |
| CA-057 | Núcleo | Etapa 1 | Fase 3 | RF-ROL-002: Etapa 1; el criterio arranca en Fase 3. Portal de autoservicio (Fase 3). |
| CA-061 | Núcleo | Etapa 3 | Etapa 5 | RF-SKU-010: Etapa 3; el criterio arranca en Etapa 5 |
| CA-064b | Núcleo | Etapa 2 | Etapa 4 | RF-CAT-027: Etapa 2; el criterio arranca en Etapa 4 |
| CA-065b | Núcleo | Etapa 2 | Etapa 4 | RF-CAT-012, RF-CAT-029: Etapa 2; el criterio arranca en Etapa 4 |
| CA-067 | Núcleo | Etapa 1 | Etapa 2 | RF-PLA-010: Etapa 1; el criterio arranca en Etapa 2 |
| CA-073 | Núcleo | Etapa 0 | Etapa 1 | RF-DAT-010: Etapa 0; el criterio arranca en Etapa 1. La infraestructura del nombre canario es de la Etapa 0; el criterio corre cuando hay Personas de prueba (Etapa 1). |
| CA-081b | Núcleo | Etapa 2 | Etapa 4 | RF-PER-006: Etapa 2; el criterio arranca en Etapa 4 |
| CA-093 | Núcleo | Etapa 1 | Etapa 2 | RF-ACC-025: Etapa 1; el criterio arranca en Etapa 2. La tarea "Designar suplente" aparece en Primeros pasos (Etapa 1), pero depende del registro de derechos de datos (RF-PER-012, Etapa 2). |
| CA-094a | Núcleo | Etapa 2 | Etapa 4 | RF-CAT-008: Etapa 2; el criterio arranca en Etapa 4. RF-CAT-008 (prefijo reservado, Etapa 2) se podría probar antes con CA-017; el resto de CA-094a necesita ingreso manual e importación (Etapa 4). |
| CA-099 | Núcleo | Etapa 1 | Etapa 4 | RF-PLA-010: Etapa 1; el criterio arranca en Etapa 4. RF-PLA-010 (subir el tope, Etapa 1) ya lo prueba CA-084 para invitaciones; el tope de importaciones necesita importar (Etapa 4). |
| CA-ASI-53 | Asistente de IA | Etapa 6 | Fase 3 | RF-UX-004: Etapa 6; el criterio arranca en Fase 3 |
| CA-LIN-09 | Líneas móviles | Fase 2 | Fase 3 | RF-LIN-014, RNF-LIN-001, RNF-LIN-006: Fase 2; el criterio arranca en Fase 3 |
| CA-NOT-01 | Notificaciones | Etapa 1 | Etapa 5 | RF-ACC-021, RF-NOT-013, RF-NOT-020: Etapa 1; el criterio arranca en Etapa 5. El módulo lo fija en Etapa 5 porque necesita órdenes de compra; el envío base (RF-NOT-013) es de Etapa 1 y se prueba con CA-NOT-12 y CA-NOT-14. |
| CA-NOT-07a | Notificaciones | Etapa 1 | Etapa 5 | RF-NOT-013: Etapa 1; el criterio arranca en Etapa 5. Igual que CA-NOT-01: necesita órdenes de compra. |
| CA-NOT-11 | Notificaciones | Etapa 1 | Fase 2 | RF-NOT-015, RF-NOT-017: Etapa 1; el criterio arranca en Fase 2 |
| CA-NOT-20 | Notificaciones | Etapa 1 | Etapa 5 | RF-ACC-021, RF-NOT-007, RF-NOT-013: Etapa 1; el criterio arranca en Etapa 5. Igual que CA-NOT-01: necesita órdenes de compra. |
| CA-PRS-04 | Personas y ubicaciones | Etapa 2 | Etapa 4 | RF-PRS-011: Etapa 2; el criterio arranca en Etapa 4. Necesita un equipo pendiente (Etapa 4); sin equipos lo cubre CA-052b1 en Etapa 2. |
| CA-PRS-11 | Personas y ubicaciones | Etapa 2 | Etapa 4 | RF-PER-010: Etapa 2; el criterio arranca en Etapa 4. Importar Personas necesita el asistente de importación (Etapa 4); el alta manual con homónimo es CA-PRS-01d (Etapa 2). |

### Criterios de módulos que cruzan etapas y esperan que su escuadrón los parta (9)

Cubren requisitos de etapas distintas y el módulo no trae partición. Corren en la etapa más tardía (la única donde existe todo lo que piden). Solo los de módulos con parte en la v1 (PRS, ENT, PRV, GAR, NOT) afectan a una etapa de la v1; el resto cruza Fase 2 y Fase 3 (D-076.4: se cierra al activar el módulo).

| Criterio | Requisitos de | Corre en | Propuesta de QA |
|---|---|---|---|
| CA-ASI-53 | Etapa 6 a Fase 3 | Fase 3 |  |
| CA-LIN-09 | Fase 2 a Fase 3 | Fase 3 | Fase 2 a Fase 3: se cierra al activar el módulo |
| CA-NOT-01 | Etapa 1 a Etapa 5 | Etapa 5 |  |
| CA-NOT-10 | Etapa 1 a Fase 2 | Etapa 1 |  |
| CA-NOT-11 | Etapa 1 a Fase 2 | Fase 2 |  |
| CA-NOT-13 | Etapa 1 a Fase 2 | Etapa 1 |  |
| CA-NOT-20 | Etapa 1 a Etapa 5 | Etapa 5 |  |
| CA-PRS-04 | Etapa 2 a Etapa 4 | Etapa 4 | Corre en Etapa 4; el rechazo de anonimizar con pendientes de la Etapa 2 (sin equipos) lo cubre CA-052b1. |
| CA-PRS-11 | Etapa 2 a Etapa 4 | Etapa 4 | Importar Personas es de la Etapa 4 (RF-PER-010 con importación). El alta manual con homónimo ya es CA-PRS-01d (Etapa 2). |

### Criterios que arrancan en una etapa y se completan en otra (21)

| Criterio | Arranca en | Se completa en | Fuente |
|---|---|---|---|
| CA-001 | Etapa 1 | Etapa 2 | tabla 22.1 del documento funcional |
| CA-011a | Etapa 1 | Etapa 2 | tabla 22.1 del documento funcional |
| CA-011b | Etapa 1 | Etapa 4 | tabla 22.1 del documento funcional |
| CA-017 | Etapa 2 | Etapa 3 | tabla 22.1 del documento funcional |
| CA-018 | Etapa 3 | Etapa 6 | tabla 22.1 del documento funcional |
| CA-020 | Etapa 3 | Etapa 5 | tabla 22.1 del documento funcional |
| CA-041 | Etapa 1 | Etapa 4 | tabla 22.1 del documento funcional |
| CA-042 | Etapa 2 | Etapa 4 | tabla 22.1 del documento funcional |
| CA-044 | Etapa 6 | Fase 2 | tabla 22.1 del documento funcional |
| CA-045 | Etapa 1 | Etapa 5 | tabla 22.1 del documento funcional |
| CA-048 | Etapa 1 | Etapa 4 | tabla 22.1 del documento funcional |
| CA-050a | Etapa 1 | Etapa 4 | tabla 22.1 del documento funcional |
| CA-050b | Etapa 1 | Etapa 5 | tabla 22.1 del documento funcional |
| CA-055 | Etapa 5 | Etapa 6 | tabla 22.1 del documento funcional |
| CA-069 | Etapa 1 | Etapa 4 | tabla 22.1 del documento funcional |
| CA-071 | Etapa 1 | Etapa 5 | tabla 22.1 del documento funcional |
| CA-074 | Etapa 1 | Etapa 5 | tabla 22.1 del documento funcional |
| CA-076 | Etapa 2 | Fase 2 | tabla 22.1 del documento funcional |
| CA-077 | Etapa 1 | Fase 2 | tabla 22.1 del documento funcional |
| CA-NOT-08 | Etapa 1 | Fase 2 | tabla del módulo o lectura de QA |
| CA-NOT-09 | Etapa 1 | Fase 2 | tabla del módulo o lectura de QA |

### Criterios sin requisito RF que los cite (111)

Citan solo reglas RN, seguridad (RS) o secciones. Los del núcleo (CA-003, CA-051, CA-083, CA-085, CA-086, CA-088, CA-094c, CA-095j, CA-109) los cita una regla RN o RS y son válidos. Los de módulos heredan la etapa del módulo; confirmar con cada escuadrón.

CA-003, CA-051, CA-083, CA-085, CA-086, CA-088, CA-094c, CA-095j, CA-109, CA-ASI-03, CA-ASI-04, CA-ASI-05, CA-ASI-06, CA-ASI-07, CA-ASI-08, CA-ASI-09, CA-ASI-10, CA-ASI-11, CA-ASI-12, CA-ASI-13, CA-ASI-14, CA-ASI-15, CA-ASI-16, CA-ASI-17, CA-ASI-18, CA-ASI-19, CA-ASI-20, CA-ASI-21, CA-ASI-22, CA-ASI-23, CA-ASI-24, CA-ASI-25, CA-ASI-26, CA-ASI-27, CA-ASI-28, CA-ASI-29, CA-ASI-30, CA-ASI-31, CA-ASI-32, CA-ASI-33, CA-ASI-37, CA-ASI-38, CA-ASI-39, CA-ASI-40, CA-ASI-41, CA-ASI-42, CA-ASI-43, CA-ASI-44, CA-ASI-45, CA-ASI-47, CA-ASI-49, CA-ASI-50, CA-ASI-51, CA-ASI-52, CA-ASI-54, CA-ASI-55, CA-AYU-26, CA-CAM-07, CA-CMD-15, CA-CMD-16, CA-CMD-17, CA-CMD-19, CA-CMD-20, CA-DOM-08, CA-DOM-14, CA-ENT-05, CA-ENT-09, CA-ENT-14, CA-GAR-14, CA-GAR-18, CA-INT-04, CA-INT-10, CA-INT-21, CA-INT-22, CA-INT-23, CA-LIC-18, CA-LIC-19, CA-LIC-20, CA-LIN-15, CA-LIN-16, CA-MSF-38, CA-MSF-40, CA-MSF-41, CA-NOT-19, CA-ONB-06, CA-ONB-08, CA-ONB-09, CA-ONB-11, CA-ONB-14, CA-POR-02, CA-POR-03, CA-POR-09, CA-POR-13, CA-PRB-13, CA-PRB-15, CA-PRE-11, CA-PRE-12, CA-PRE-13, CA-PRE-16, CA-PRE-20, CA-PRE-23, CA-PRE-24, CA-PRE-25, CA-PRE-26, CA-PRV-04b, CA-PRV-14, CA-REP-07, CA-REP-18, CA-REP-19, CA-REP-20, CA-REP-21

### Criterios ambiguos o por partir (H-QA-31, D-076.3)

| Criterio | Corre en | Problema y propuesta de QA |
|---|---|---|
| CA-PRS-16 | Etapa 2 | Cita RN-PRS-004 (referencia correlativa) cuando prueba el alcance «propio» sin Persona vinculada (regla del registro de permisos). Cambiar la cita. |
| CA-095f | Etapa 2 | Dice «el permiso lo fija el registro de permisos, P-017», pero ese permiso no existe todavía. Se puede probar que un Administrador de empresa no declara ni levanta (rechazo); no se puede probar el caso positivo de la plataforma hasta que P-017 lo cree. Mientras tanto QA lo ejecuta solo por la mitad del rechazo y lo declara parcial. |
| CA-095g | Etapa 2 | Igual que CA-095f: el acto de declarar y de levantar necesita el permiso de P-017. Además P-017 pregunta si levantar exige una segunda persona de plataforma; el criterio no lo dice. |
| CA-095j | Fase 2 | Está en Fase 2 «al activar cada módulo», pero la v1 ya tiene rutinas de purga o anonimización: contactos de proveedor (Etapa 2), anonimización automática de Personas con la bandera de pruebas (Etapa 2), filas de importación en preparación a los 7 días (Etapa 4) y eventos de seguridad a los 12 meses (Etapa 7). Propuesta de QA: partir en 095j1 (Etapa 2: contactos de proveedor y Personas), 095j2 (Etapa 4: filas de importación), 095j3 (Etapa 7: eventos de seguridad) y dejar 095j para los módulos de Fase 2 (registro de envíos, IP del acuse). |
| CA-102 | Etapa 5 | No dice qué pasa cuando la suma es exactamente el límite (5.000,00) ni cuando la compra anterior es de hace exactamente 30 días. Propuesta de QA: avisa solo si la suma supera el límite y cuenta 30 días corridos con el día 30 incluido; agregar los casos 5.000,00 (sin aviso) y día 30 (con aviso) y día 31 (sin aviso). |
| CA-103 | Etapa 5 | Prueba el borrador sin cambios. El caso con cambios espera a P-019 (¿7 días desde que se creó o desde el último cambio?). No se puede probar más hasta que el Gerente de TI responda. |
| CA-094a | Etapa 4 | Incluye «crear una categoría con el prefijo `ACTV` se rechaza», que se puede probar desde la Etapa 2 (RF-CAT-008). Propuesta: que CA-017 nombre `ACTV`; CA-094a lo repite. |
| CA-GAR-04a | Etapa 4 | Dice «el 15/03/2027 a las 23:59 todavía» sin decir en qué zona horaria. Propuesta de QA: la de la empresa, como CA-046 y CA-082b; agregar una empresa de otra zona para el mismo instante. |
| CA-038d | Etapa 4 | Usa los textos `EN STOCK`, ` en reparación ` y `Chatarra`; el Excel real puede traer otros (P-007). La prueba usa esos tres hasta que llegue el Excel. |
| CA-105 | Etapa 0 | Es una verificación de documentos que depende de que el Cliente (CEO) entregue el Excel, la orden de compra y la orden de servicio reales (P-002). Mientras no lleguen, no se puede ejecutar y la Etapa 0 no cierra en ese punto. |
| CA-024 | Etapa 4 | «Sin hacer» del Analista. La cabecera cubre RF-OC-028 (Etapa 7, P-009) y el criterio corre en Etapa 4: no se puede ejecutar entero. Propuesta de QA: Quitar RF-OC-028 de la cabecera de CA-024 y de su fila (la baja con motivo ya la prueba CA-024 en Etapa 4); la decisión P-009 de la Etapa 7 se verifica con un criterio documental nuevo. |
| CA-053 | Etapa 7 | «Sin hacer» del Analista. Sigue entero: junta respaldo, restauración con cronómetro, vuelta atrás, manuales, rendimiento y procedimiento de incidente (D-076.3 pide partirlo). Propuesta de QA: 053a respaldo y restauración (RNF-014, RF-DAT-005); 053b vuelta atrás (RNF-015); 053c rendimiento (RNF-010 a 012; RNF-011 corre en la carga nocturna desde la Etapa 4, se completa en la 7); 053d manuales, costo y procedimiento de incidente (RNF-016 a 018, RF-DAT-015). |

### Etapa de los 74 criterios nuevos: lectura de QA (2026-10-29)

QA leyó cada criterio nuevo o partido desde la versión del 2026-10-26 y decidió en qué etapa corre y por qué. La columna «Documento» es la etapa que fija el documento funcional (tabla 22.1) o el módulo. **Coinciden en los 74 casos salvo los marcados.** Donde QA no está de acuerdo con el documento, la columna lo dice y el motivo queda en ambiguos.

| Criterio | Etapa según QA | Documento | Por qué |
|---|---|---|---|
| CA-015g | Etapa 1 | Etapa 1 | Usa solo lo de la Etapa 1: autorizaciones de soporte (RF-PLA-005), reloj y tres personas de plataforma. Sin campos secretos ni solicitudes de derechos, por eso esa mitad es CA-015h. |
| CA-015h | Etapa 2 | Etapa 2 | Necesita un campo secreto (CA-042, Etapa 2) y la cola de solicitudes de derechos (RF-PER-012, Etapa 2); antes no hay qué proteger. RF-PLA-013 es de Etapa 1: queda anotado como «arranca después». |
| CA-015i | Etapa 1 | Etapa 1 | Lectura válida: solo esa empresa y solo lectura. Usa la autorización de CA-015g y el rol de plataforma de CA-015a. |
| CA-038a | Etapa 4 | Etapa 4 | La importación nace en la Etapa 4 (RF-IMP-001). Pide el trabajador reiniciable (CI-16) y un SKU que exige serie. |
| CA-038b | Etapa 4 | Etapa 4 | Deshacer el lote necesita el lote ya confirmado y una asignación posterior (entregas, Etapa 4). |
| CA-038c | Etapa 4 | Etapa 4 | Necesita un SKU con 10 activos y un campo identificador (CA-065a, Etapa 2; unidades CA-065b, Etapa 4). |
| CA-038d | Etapa 4 | Etapa 4 | El stock inicial por ubicación y los 5 estados del activo existen desde la Etapa 4 (RF-INV-001). Los sinónimos de estado dependen de P-007. |
| CA-094a | Etapa 4 | Etapa 4 | Se prueba con ingreso manual (RF-INV-025) y con importación, ambos de la Etapa 4. La parte del prefijo `ACTV` se podría probar antes (ver ambiguos). |
| CA-094b | Etapa 5 | Etapa 5 | Necesita la recepción de una orden de compra (RF-OC-035), que existe desde la Etapa 5. |
| CA-094c | Fase 2 | Fase 2 | Necesita los avisos de garantía por correo (GAR-B con NOT-completo), de Fase 2. |
| CA-095a | Etapa 2 | Etapa 2 | La anonimización manual con dos personas es de la Etapa 2 (RF-PER-013); el registro de anonimizaciones existe desde la Etapa 2 (RF-DAT-016). |
| CA-095b | Etapa 2 | Etapa 2 | Igual que CA-095a: dos Personas cesadas de la Etapa 2; congelación solo sobre una. |
| CA-095c | Etapa 2 | Etapa 2 | El registro de solicitudes de derechos es de la Etapa 2 (RF-PER-012). |
| CA-095d | Etapa 2 | Etapa 2 | Retomar la propuesta rechazada de CA-095a; no necesita nada posterior. |
| CA-095e | Etapa 2 | Etapa 2 | Levantamiento parcial con dos Personas y dos personas para anonimizar; todo de la Etapa 2. Espera a P-017 en lo del permiso. |
| CA-095f | Etapa 2 | Etapa 2 | Quién declara y levanta se decide por el registro de permisos; el rechazo se prueba en la Etapa 2. El caso positivo espera a P-017. |
| CA-095g | Etapa 2 | Etapa 2 | El registro de plataforma y la auditoría de la empresa existen desde la Etapa 1; el rastro se prueba junto con la primera anonimización (Etapa 2). |
| CA-095h | Etapa 7 | Etapa 7 | El proceso de mantenimiento separado de la aplicación, con dos personas, es de la Etapa 7 (RF-AUD-016). |
| CA-095i | Etapa 7 | Etapa 7 | Restaurar un respaldo y reaplicar registros (RS-49) es el ensayo de la Etapa 7 (CI-17); manual con apoyo de integración. |
| CA-095j | Fase 2 | Fase 2 | El documento la deja en Fase 2. QA no está de acuerdo en que toda ella lo sea: la v1 ya tiene cuatro rutinas (ver ambiguos). |
| CA-096 | Etapa 5 | Etapa 5 | Necesita órdenes de compra en dos monedas, la lista, la bandeja «Por aprobar» y la exportación (RF-OC-005, Etapa 5). |
| CA-097 | Etapa 5 | Etapa 5 | El interruptor único con ocho casillas es de la Etapa 5 (RF-OC-026). |
| CA-098 | Etapa 5 | Etapa 5 | Activar una casilla pide motivo; la segunda verificación viene de la Etapa 1, la casilla de la Etapa 5. |
| CA-099 | Etapa 4 | Etapa 4 | El tope de 10 importaciones por día necesita los tres tipos de importación (activos, Personas y SKU), de la Etapa 4. Subir el tope por la plataforma (RF-PLA-010) ya existe desde la Etapa 1. |
| CA-100 | Etapa 4 | Etapa 4 | Una entrada de lote en la auditoría necesita la importación (Etapa 4). |
| CA-101 | Etapa 4 | Etapa 4 | Asignar, reparar, dar de baja y reingresar son de la Etapa 4 (RF-INV-018, RF-ENT-001). |
| CA-102 | Etapa 5 | Etapa 5 | Necesita órdenes con proveedor, límite de aprobación y reloj; es de la Etapa 5. |
| CA-103 | Etapa 5 | Etapa 5 | El borrador de recepción es de la Etapa 5 (RF-OC-049). |
| CA-104a | Etapa 5 | Etapa 5 | La pantalla de aprobación es de la Etapa 5 (RF-OC-051). |
| CA-104b | Etapa 5 | Etapa 5 | Necesita un módulo de prueba que use el espacio de la pantalla de aprobación; no existe un módulo real hasta Fase 3 (PRE). |
| CA-105 | Etapa 0 | Etapa 0 | Verificación documental de los archivos reales que entrega el Cliente (CEO); es condición de cierre de la Etapa 0 (D-064 condición 8). No se puede ejecutar hasta que lleguen (P-002). |
| CA-106 | Etapa 1 | Etapa 1 | La marca de origen «vía asistente» (RF-AUD-020) es una columna de la auditoría de la Etapa 1; se prueba con una prueba del mecanismo que escribe el origen, sin que el módulo del asistente exista. La búsqueda de la pregunta o del nombre «canario» en la marca no da resultados. |
| CA-107 | Etapa 2 | Etapa 2 | La marca «se gestiona en MDM» (RF-CAT-030) cuelga de la categoría y de su naturaleza (Laptop frente a Licencia), de la Etapa 2; usa PS-34 y la auditoría de la Etapa 1. |
| CA-108 | Etapa 2 | Etapa 2 | El gancho de limpieza al anonimizar (RF-DAT-018) necesita la anonimización manual de la Etapa 2 (RF-PER-013) y un módulo de prueba que registre su rutina; la congelación la trae CA-095a (Etapa 2). |
| CA-109 | Fase 3 | Fase 3 | La lista única de lo que nunca hace un programa (RN-025) necesita claves de API (Fase 3) y, cuando exista, el asistente. QA propone un adelanto: la lista del registro 12C y la respuesta «No se puede por una regla» se pueden probar en la Etapa 1 con un llamador de prueba que no tenga persona detrás; hoy el documento la deja en Fase 3. |
| CA-ASI-53 | Fase 3 | Fase 3 | Dos botones de ayuda (RF-ASI-050): pantalla y celular; necesita el módulo ASI-A (Fase 3). |
| CA-ASI-54 | Fase 3 | Fase 3 | El Empleado del portal con el asistente apagado por defecto (RN-ASI-041, PS-235 y PS-236) necesita el portal y ASI-A (Fase 3). |
| CA-ASI-55 | Fase 3 | Fase 3 | Levantar el bloqueo del texto libre por empresa con PS-240 (RN-ASI-011) necesita la consola de plataforma y ASI-A (Fase 3). |
| CA-GAR-01a | Etapa 4 | Etapa 4 | Garantía de un activo ingresado a mano (RF-INV-025): ficha y fecha, sin recepción. |
| CA-GAR-01b | Etapa 5 | Etapa 5 | Captura de la garantía en la recepción de un lote (RF-GAR-001). |
| CA-GAR-01c | Etapa 5 | Etapa 5 | Los activos creados por la recepción muestran la garantía. |
| CA-GAR-04a | Etapa 4 | Etapa 4 | Vigente y Vencida al mover el reloj, sin proceso diario (RN-018); necesita una sola garantía por activo. |
| CA-GAR-04b | Fase 2 | Fase 2 | La garantía extendida y la efectiva necesitan varias garantías por activo (RF-GAR-004, Fase 2). |
| CA-GAR-04c | Etapa 4 | Etapa 4 | Filtro «vence en los próximos 30 días» (RF-GAR-003). |
| CA-GAR-04d | Etapa 4 | Etapa 4 | Filtro «sin garantía vigente» (RF-GAR-003). |
| CA-GAR-04e | Etapa 4 | Etapa 4 | Corregir fechas con motivo (RF-GAR-006). |
| CA-GAR-04f | Fase 2 | Fase 2 | Una ampliación es una garantía nueva: necesita varias garantías por activo (RF-GAR-004). |
| CA-PRS-01a | Etapa 2 | Etapa 2 | Alta de Persona (RF-PRS-001) sin cuenta. |
| CA-PRS-01b | Etapa 2 | Etapa 2 | Persona sin cuenta no aparece en usuarios. |
| CA-PRS-01c | Etapa 2 | Etapa 2 | Centro de costo efectivo (RF-PRS-006). |
| CA-PRS-01d | Etapa 2 | Etapa 2 | Homónimo con aviso en el alta manual. El script lo ponía en Etapa 4 por RF-PER-010; se corrigió. |
| CA-PRS-03a | Etapa 2 | Etapa 2 | Cese de una Persona sin equipos, líneas ni procesos (RF-PRS-004, 011). |
| CA-PRS-03b | Etapa 4 | Etapa 4 | Pide una laptop asignada (RF-INV-029, Etapa 4). |
| CA-PRS-03c | Etapa 4 | Etapa 4 | La marca «Pendiente de devolución» y los reportes de pérdidas son de la Etapa 4. |
| CA-PRS-08a | Etapa 2 | Etapa 2 | Árbol de ubicaciones y ciclos (RF-PRS-007). |
| CA-PRS-08b | Etapa 2 | Etapa 2 | Mover un Piso con sus Salas (RF-PRS-007). |
| CA-PRS-08c | Etapa 4 | Etapa 4 | Mover un Piso con 40 equipos sin movimiento por activo necesita activos (RF-INV-027). |
| CA-PRS-08d | Etapa 2 | Etapa 2 | Marcar un almacén de TI (RF-PRS-008). |
| CA-PRS-12a | Etapa 4 | Etapa 4 | Asignar un equipo a una Persona Cesada necesita activos y asignaciones. |
| CA-PRS-12b | Etapa 2 | Etapa 2 | Reactivar con motivo (RF-PRS-012). |
| CA-PRS-12c | Etapa 4 | Etapa 4 | Asignar un equipo a una Persona reactivada necesita asignaciones. |
| CA-PRS-12d | Etapa 2 | Etapa 2 | Una Persona anonimizada no se reactiva (RF-PRS-012). |
| CA-PRS-14a | Etapa 2 | Etapa 2 | Anonimización manual con dos personas (RF-PRS-015). |
| CA-PRS-14b | Etapa 2 | Etapa 2 | Nombre y correo canarios no aparecen en ninguna parte (RNF-PRS-009). |
| CA-PRS-14c | Etapa 2 | Etapa 2 | La auditoría no se toca. |
| CA-PRS-14d | Etapa 4 | Etapa 4 | Historial de asignaciones necesita asignaciones cerradas (RF-INV-015). |
| CA-PRS-14e | Etapa 4 | Etapa 4 | Copia del nombre en el acta hasta `retener_hasta` necesita actas (RF-DAT-006, 011). |
| CA-PRS-14f | Etapa 2 | Etapa 2 | La anonimización automática está apagada; se prueba con el reloj de pruebas (RN-PRS-019). |
| CA-PRV-02a | Etapa 2 | Etapa 2 | Proveedor de otra empresa por identificador interno (RF-PRV-007). |
| CA-PRV-02b | Fase 2 | Fase 2 | Necesita contratos (PRV-B, Fase 2). |
| CA-PRV-02c | Fase 2 | Fase 2 | Necesita contratos y vínculos con activos (PRV-B, Fase 2). |
| CA-PRV-04a | Etapa 2 | Etapa 2 | Desactivar un proveedor con motivo (RF-PRV-003). |
| CA-PRV-04b | Fase 2 | Fase 2 | Necesita un contrato Vigente (PRV-B, Fase 2). |
| CA-PRV-04c | Etapa 2 | Etapa 2 | Reactivar un proveedor con motivo (RF-PRV-003). |

### Módulos nuevos (microsoft-entra-intune y asistente-ia)

Regla de QA: un módulo nuevo entra a las cifras cuando su archivo existe, está guardado en un commit sin cambios pendientes y tiene sigla, requisitos, reglas RN, sección de criterios y al menos un criterio con su sigla. Si no, queda listado como pendiente.

| Archivo | Sigla | Estado al 2026-10-29 | Qué hace QA |
|---|---|---|---|
| `docs/modulos/microsoft-entra-intune.md` | MSF | completo (v0.1, primera redacción) | 44 criterios, 52 RF y RNF, 65 RN; todos en Fase 3 (no bloquean la v1; se cierran al activar el módulo, D-076.4); 3 con etapa heredada del módulo |
| `docs/modulos/asistente-ia.md` | ASI | completo (v0.1, primera redacción) | 55 criterios, 61 RF y RNF, 41 RN; todos en Fase 3 (no bloquean la v1; se cierran al activar el módulo, D-076.4); 47 con etapa heredada del módulo |

Ninguno de los dos aparece todavía en el registro de prefijos del documento funcional (sección 26.2) ni en el registro de permisos: QA los lee como propuestas del Analista pendientes de verificación del Auditor Técnico, QA, Seguridad y Cumplimiento. Pruebas que pide QA al activarlos: aislamiento por empresa de cada tabla nueva, permiso denegado por petición directa de cada acción, y las pruebas propias de cada uno (asistente: aislamiento con 100 intentos por herramienta de lectura, instrucciones ocultas y datos enviados al proveedor; Microsoft: simulador de Microsoft, credencial como secreto y solo lectura).

---

## Detalle por módulo

### Núcleo (documento funcional, sección 22) (149)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-001 | RN-001, RS-10, RS-13, RF-AUD-012, RF-PER-008, RF-CAT-003 | Etapa 1 | Etapa 1 | Etapa 2 | integración | sí |  | documento-funcional.md:949 |
| CA-002 | RN-001, RF-AUD-010 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:950 |
| CA-003 | RS-11 | - | Etapa 1 | - | integración | sí |  | documento-funcional.md:951 |
| CA-004 | RF-ACC-011, RF-ACC-012, RF-DAT-009 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:952 |
| CA-005 | RF-ACC-003, 007, 009, 010 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:953 |
| CA-006 | RF-ACC-001, 004, 005, 017 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:954 |
| CA-007 | RF-ACC-013, 024, RF-PLA-001 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:955 |
| CA-008 | RF-ACC-015, 016, RF-USR-003, RF-ROL-011 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:956 |
| CA-009 | RF-ROL-008, RF-ACC-020 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:957 |
| CA-010 | RF-ROL-007, RF-ACC-008 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:958 |
| CA-011a | RF-ROL-004, 010, 014 | Etapa 1 | Etapa 1 | Etapa 2 | integración + navegador | sí |  | documento-funcional.md:959 |
| CA-011b | RF-ROL-003, 005, PER-009, IMP-013, AUD-007, INV-032 | Etapa 1 | Etapa 1 | Etapa 4 | integración + navegador | sí |  | documento-funcional.md:960 |
| CA-012 | RF-OC-021, 022, 025, RF-ROL-009 | Etapa 1 | Etapa 5 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:961 |
| CA-013 | RF-OC-023, 024 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:962 |
| CA-014 | RF-OC-026 | Etapa 5 | Etapa 5 | - | integración + navegador | sí |  | documento-funcional.md:963 |
| CA-015a | RF-PLA-004, 006 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:964 |
| CA-015b | RF-PLA-005, RF-AUD-017 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:965 |
| CA-015c | RF-PLA-003, RF-ACC-019 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:966 |
| CA-015d | RF-ACC-002, 022, RF-PLA-002 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:969 |
| CA-015e | RF-PLA-011, 012 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:967 |
| CA-015f | RF-PLA-001, 009 | Etapa 1 | Etapa 1 | - | integración | sí | Incluye un paso manual: verificar la identidad por otro medio | documento-funcional.md:968 |
| CA-015g | RF-PLA-013, RF-PLA-005; Etapa 1 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:970 |
| CA-015h | RF-PLA-013; Etapa 2, porque necesita campos secretos y solicitudes de derechos | Etapa 1 | Etapa 2 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:971 |
| CA-015i | RF-PLA-013, RF-PLA-004, RF-PLA-005; Etapa 1 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:972 |
| CA-016a | RF-PER-001 a 003, RF-DAT-001, RF-CAT-024 | Etapa 2 | Etapa 2 | - | integración | sí | Etapa del requisito leída por QA: RF-PER-010 es de Etapa 2 con importación en Etapa 4; CA-016a prueba el alta manual (Etapa 2). | documento-funcional.md:983 |
| CA-016b | RF-PER-001, RF-INV-013 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:984 |
| CA-017 | RF-SKU-001, 002, RF-CAT-007 a 009, 023, 025 | Etapa 2 | Etapa 2 | Etapa 3 | unitaria | sí |  | documento-funcional.md:985 |
| CA-018 | RN-004, RF-SKU-003, 004, RF-OC-003, 046, RF-OS-005 | Etapa 3 | Etapa 3 | Etapa 6 | integración | sí |  | documento-funcional.md:986 |
| CA-019 | RF-SKU-005, 006, RF-CAT-011 | Etapa 2 | Etapa 3 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:987 |
| CA-020 | RF-CAT-002, 010, 012 a 016, 022, RF-SKU-013, 015, 016, RF-OC-039 | Etapa 2 | Etapa 3 | Etapa 5 | unitaria | sí | Arranca después de su requisito | documento-funcional.md:988 |
| CA-021 | RF-CAT-017 a 021 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:989 |
| CA-022 | RF-SKU-007, 008 | Etapa 3 | Etapa 3 | - | integración | sí |  | documento-funcional.md:990 |
| CA-023 | RF-INV-002, 003, 006, RF-SKU-009 | Etapa 3 | Etapa 4 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:999 |
| CA-024 | RF-INV-001, 011, 018, 031, RF-UX-009, RF-OC-028 | Etapa 4 | Etapa 4 | - | integración | sí | Corre antes de lo que necesita | documento-funcional.md:1000 |
| CA-025 | RF-INV-013 a 015, 024 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1002 |
| CA-026 | RF-INV-019 a 021 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1003 |
| CA-027 | RF-INV-022 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | documento-funcional.md:1004 |
| CA-028 | RF-INV-004 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1005 |
| CA-029 | RF-OC-001, 011 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:1017 |
| CA-030 | RF-OC-010, 014, 044 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1018 |
| CA-031 | RF-OC-005, 015, 018 a 020 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1019 |
| CA-032 | RF-OC-002, 004 a 008, 042, 043, RF-SKU-010, 011, RF-CAT-005, RF-INV-023 | Etapa 2 | Etapa 5 | - | unitaria | sí | Arranca después de su requisito | documento-funcional.md:1021 |
| CA-033 | RF-OC-029, 035, 036, 040 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:1023 |
| CA-034 | RF-OC-030, 031, 033, 037, 038, RNF-005 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:1024 |
| CA-035 | RF-OC-033, 034 | Etapa 5 | Etapa 5 | - | integración + navegador | sí |  | documento-funcional.md:1025 |
| CA-036 | RF-OC-032, RF-INV-007 | Etapa 4 | Etapa 5 | - | unitaria | sí | Arranca después de su requisito | documento-funcional.md:1027 |
| CA-037 | RF-OC-012, 013 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1029 |
| CA-038a | RF-IMP-001 a 003, 007, RN-003; Etapa 4 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | documento-funcional.md:1035 |
| CA-038b | RF-IMP-006; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1036 |
| CA-038c | RF-IMP-010, RF-INV-005; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1037 |
| CA-038d | RF-IMP-008, 009; Etapa 4 | Etapa 4 | Etapa 4 | - | integración + navegador | sí | Tipo ajustado por QA: Vista previa por fila en pantalla y movimientos «saldo inicial» en la base. | documento-funcional.md:1038 |
| CA-039 | RF-IMP-011, 014, 015, RS-42 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | documento-funcional.md:1040 |
| CA-040a | RF-AUD-001, 002, RN-006; Etapa 1 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:1044 |
| CA-040b | RF-AUD-018, RF-DAT-002; Etapa 7 | Etapa 7 | Etapa 7 | - | manual (con apoyo de integración) | sí |  | documento-funcional.md:1045 |
| CA-041 | RF-AUD-003 a 005, 008, 009, 013, 019, RF-USR-007, RF-ROL-013, RF-PLA-007 | Etapa 1 | Etapa 1 | Etapa 4 | integración | sí |  | documento-funcional.md:1046 |
| CA-042 | RF-CAT-028, RF-SKU-013, 014, RF-AUD-006 | Etapa 1 | Etapa 2 | Etapa 4 | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:995 |
| CA-043 | RF-EXP-005, 006, 007, RNF-006 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | documento-funcional.md:1041 |
| CA-044 | RF-OS-001 a 011, RF-INV-012 | Etapa 6 | Etapa 6 | Fase 2 | unitaria | sí |  | documento-funcional.md:1068 |
| CA-045 | RF-AUD-011, RN-007, RF-USR-002, RF-CAT-004 | Etapa 1 | Etapa 1 | Etapa 5 | integración | sí |  | documento-funcional.md:1048 |
| CA-046 | RF-INV-016, 017, RF-DAT-006, RNF-002 | Etapa 1 | Etapa 4 | - | navegador | sí | Arranca después de su requisito | documento-funcional.md:1010 |
| CA-047 | RF-ROL-001, 002, 006, 012, RF-USR-001 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:973 |
| CA-048 | RNF-007, RF-CAT-001, RF-SKU-012, RF-UX-007 | Etapa 1 | Etapa 1 | Etapa 4 | integración | sí |  | documento-funcional.md:1070 |
| CA-049 | RF-ACC-023, RF-DAT-014 | Etapa 1 | Etapa 1 | - | navegador | sí |  | documento-funcional.md:974 |
| CA-050a | RNF-003, 004, RF-UX-010, 012 | Etapa 1 | Etapa 1 | Etapa 4 | navegador | sí | Seguimiento (no bloquea) hasta la etapa en que se completa; bloquea desde allí | documento-funcional.md:1071 |
| CA-050b | RNF-001, 008, RF-UX-001 a 003, 005, 006, 011, RF-ACC-025 | Etapa 1 | Etapa 1 | Etapa 5 | integración + navegador | sí | Seguimiento (no bloquea) hasta la etapa en que se completa; bloquea desde allí | documento-funcional.md:1072 |
| CA-051 | RN-014 | - | Etapa 1 | - | integración | sí |  | documento-funcional.md:1073 |
| CA-052a1 | RF-PER-005, 011 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:1049 |
| CA-052a2 | RF-PER-006 | Etapa 2 | Etapa 4 | - | navegador | sí | Arranca después de su requisito | documento-funcional.md:1050 |
| CA-052b1 | RF-PER-013 | Etapa 2 | Etapa 2 | - | navegador | sí |  | documento-funcional.md:1051 |
| CA-052b2 | RF-PER-006, 013 | Etapa 2 | Etapa 4 | - | unitaria | sí | Arranca después de su requisito | documento-funcional.md:1052 |
| CA-052c | RF-USR-001, 003, 008 | Etapa 1 | Etapa 2 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:1053 |
| CA-052d | RF-USR-005, RF-PER-007 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1054 |
| CA-053 | RNF-010 a 018, RF-DAT-015 | Etapa 0 | Etapa 7 | - | manual (con apoyo de integración) | sí | Arranca después de su requisito | documento-funcional.md:1075 |
| CA-054a | RF-AUD-014, 015, RF-PER-004, 013, 014, RF-DAT-016 | Etapa 1 | Etapa 2 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:1055 |
| CA-054b | RF-DAT-006, 011 | Etapa 2 | Etapa 4 | - | unitaria | sí | Arranca después de su requisito | documento-funcional.md:1056 |
| CA-054c | RF-DAT-003, 005, RF-AUD-016 | Etapa 7 | Etapa 7 | - | manual (con apoyo de integración) | sí |  | documento-funcional.md:1057 |
| CA-055 | RF-OC-015, 016, 017, 047, 048, RF-OS-008 | Etapa 5 | Etapa 5 | Etapa 6 | unitaria | sí |  | documento-funcional.md:1020 |
| CA-056 | RF-IMP-004, 005, RF-DAT-004 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1039 |
| CA-057 | RF-IMP-018, RF-ROL-002; Fase 3 | Etapa 1 | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Arranca después de su requisito | documento-funcional.md:1074 |
| CA-058 | RF-INV-009, 010, 024, 028 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | documento-funcional.md:1001 |
| CA-059 | RF-INV-025 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1006 |
| CA-060a | RF-CAT-006 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | documento-funcional.md:1007 |
| CA-060b | RF-INV-027 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | documento-funcional.md:1008 |
| CA-061 | RF-OC-010, 049, 050, RF-SKU-010 | Etapa 3 | Etapa 5 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:1026 |
| CA-062 | RF-OC-032 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:1028 |
| CA-063 | RF-INV-026 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1009 |
| CA-064a | RF-CAT-027 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | documento-funcional.md:991 |
| CA-064b | RF-CAT-027, RF-SKU-013 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:992 |
| CA-065a | RF-CAT-012 | Etapa 2 | Etapa 2 | - | unitaria | sí | Etapa del requisito leída por QA: RF-INV-005 es de Etapa 4, pero CA-065a prueba solo la definición del campo identificador (Etapa 2); las unidades las prueba CA-065b. | documento-funcional.md:993 |
| CA-065b | RF-CAT-012, 029 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:994 |
| CA-066 | RF-AUD-010 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:1047 |
| CA-067 | RF-EXP-001 a 004, RF-PLA-010 | Etapa 1 | Etapa 2 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:1042 |
| CA-068 | RF-ACC-006, 026 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:975 |
| CA-069 | RF-ACC-014, RNF-013 | Etapa 1 | Etapa 1 | Etapa 4 | integración | sí |  | documento-funcional.md:976 |
| CA-070 | RF-OC-026, RF-PLA-008 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1030 |
| CA-071 | RF-EMP-001 a 004 | Etapa 1 | Etapa 1 | Etapa 5 | integración + navegador | sí |  | documento-funcional.md:1062 |
| CA-072 | RF-OC-006, 045 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:1022 |
| CA-073 | RF-DAT-008, 010, RNF-009 | Etapa 0 | Etapa 1 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:1058 |
| CA-074 | RF-ACC-021, RF-DAT-012, RF-CAT-026 | Etapa 1 | Etapa 1 | Etapa 5 | integración | sí |  | documento-funcional.md:1059 |
| CA-075 | RF-EMP-005 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:1061 |
| CA-076 | RF-PER-012, RF-DAT-007, 013 | Etapa 2 | Etapa 2 | Fase 2 | integración + navegador | sí |  | documento-funcional.md:1060 |
| CA-077 | RNF-019 a 022, RF-ROL-015 | Etapa 1 | Etapa 1 | Fase 2 | integración | sí |  | documento-funcional.md:1063 |
| CA-078 | RF-OC-009, RS-47, RS-42 | Etapa 5 | Etapa 5 | - | navegador | sí |  | documento-funcional.md:1064 |
| CA-079 | RF-ACC-012 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:977 |
| CA-079b | RF-INV-030 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | documento-funcional.md:1011 |
| CA-080 | RF-UX-004 | Etapa 6 | Etapa 6 | - | unitaria | sí |  | documento-funcional.md:1069 |
| CA-081 | RF-ACC-013 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:978 |
| CA-081b | RF-PER-006, RF-INV-029 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:1012 |
| CA-082 | RF-ACC-018 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:979 |
| CA-082b | RF-INV-008 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | documento-funcional.md:1013 |
| CA-083 | RS-51 | - | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:1079 |
| CA-084 | RF-PLA-010 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:1080 |
| CA-085 | RN-008 | - | Etapa 1 | - | integración | sí |  | documento-funcional.md:1081 |
| CA-086 | RN-015 | - | Etapa 2 | - | integración | sí |  | documento-funcional.md:1082 |
| CA-087 | RN-016, RF-CAT-003 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:1083 |
| CA-088 | RN-020 | - | Etapa 2 | - | integración | sí |  | documento-funcional.md:1084 |
| CA-089 | RF-OC-019, PS-232 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1085 |
| CA-090 | RNF-013 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | documento-funcional.md:1086 |
| CA-091 | RF-DAT-013, PS-234 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1087 |
| CA-092 | RF-CAT-026 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:1088 |
| CA-093 | RF-PER-012, RF-ACC-025 | Etapa 1 | Etapa 2 | - | navegador | sí | Arranca después de su requisito | documento-funcional.md:1089 |
| CA-094a | RF-INV-034, RN-004, RN-012, RF-CAT-008; Etapa 4 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:1091 |
| CA-094b | RF-OC-035, RN-004, RN-023; Etapa 5 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1092 |
| CA-094c | RN-023; Fase 2 | - | Fase 2 | - | integración | no (bloquea su módulo) |  | documento-funcional.md:1093 |
| CA-095a | RF-DAT-017, RN-024, RF-PER-013; Etapa 2 | Etapa 2 | Etapa 2 | - | integración + navegador | sí | Etapa del requisito leída por QA: RF-DAT-017 es de Etapas 2 y 7; esta parte es la anonimización manual (Etapa 2). | documento-funcional.md:1094 |
| CA-095b | RF-DAT-017, RN-024; Etapa 2 | Etapa 2 | Etapa 2 | - | integración + navegador | sí | Etapa del requisito leída por QA: RF-DAT-017 es de Etapas 2 y 7; esta parte es la anonimización manual (Etapa 2). | documento-funcional.md:1095 |
| CA-095c | RF-DAT-017, RN-024, RF-PER-012; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí | Etapa del requisito leída por QA: RF-DAT-017 es de Etapas 2 y 7; esta parte es la anonimización manual y el registro de pedidos (Etapa 2). | documento-funcional.md:1096 |
| CA-095d | RF-DAT-017, RN-024; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí | Etapa del requisito leída por QA: RF-DAT-017 es de Etapas 2 y 7; esta parte es retomar lo propuesto (Etapa 2). · Tipo ajustado por QA: Retomar una propuesta guardada en la base; no es un cálculo. | documento-funcional.md:1097 |
| CA-095e | RF-DAT-017, RN-024; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí | Etapa del requisito leída por QA: RF-DAT-017 es de Etapas 2 y 7; esta parte es el levantamiento parcial (Etapa 2). | documento-funcional.md:1098 |
| CA-095f | RF-DAT-017, RN-024, RN-002; Etapa 2 | Etapa 2 | Etapa 2 | - | integración + navegador | sí | Etapa del requisito leída por QA: RF-DAT-017 es de Etapas 2 y 7; esta parte es quién declara y levanta (Etapa 2). | documento-funcional.md:1099 |
| CA-095g | RF-DAT-017; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí | Etapa del requisito leída por QA: RF-DAT-017 es de Etapas 2 y 7; esta parte es el rastro de declarar y levantar (Etapa 2). | documento-funcional.md:1100 |
| CA-095h | RF-AUD-016, RF-DAT-017, RN-024; Etapa 7 | Etapa 7 | Etapa 7 | - | integración | sí | Etapa del requisito leída por QA: Prueba la parte de la auditoría vencida de RF-DAT-017, que es del proceso de mantenimiento (Etapa 7). | documento-funcional.md:1101 |
| CA-095i | RF-DAT-017, RS-49; Etapa 7 | Etapa 7 | Etapa 7 | - | manual (con apoyo de integración) | sí | Etapa del requisito leída por QA: Prueba la parte de la restauración de RF-DAT-017 (RS-49), que es de la Etapa 7. | documento-funcional.md:1102 |
| CA-095j | RN-024; Fase 2, al activar cada módulo con una rutina así | - | Fase 2 | - | integración | no (bloquea su módulo) |  | documento-funcional.md:1103 |
| CA-096 | RN-009, RF-OC-005; Etapa 5 | Etapa 5 | Etapa 5 | - | integración + navegador | sí |  | documento-funcional.md:1104 |
| CA-097 | RF-OC-026, tabla de la sección 12.4; Etapa 5 | Etapa 5 | Etapa 5 | - | integración + navegador | sí |  | documento-funcional.md:1105 |
| CA-098 | RF-OC-026; Etapa 5 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1106 |
| CA-099 | RF-IMP-015, RS-45, RF-PLA-010; Etapa 4 | Etapa 1 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:1107 |
| CA-100 | RF-IMP-016, RF-AUD-019; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1108 |
| CA-101 | RF-INV-033, RF-INV-018; Etapa 4 | Etapa 4 | Etapa 4 | - | integración + navegador | sí | Tipo ajustado por QA: Cuenta eventos emitidos por el servidor (integración) y un doble clic en la asignación (navegador). | documento-funcional.md:1109 |
| CA-102 | RF-OC-048; Etapa 5 | Etapa 5 | Etapa 5 | - | integración + navegador | sí | Tipo ajustado por QA: Reloj y suma por proveedor en el servidor; el aviso se ve en la pantalla de la orden. | documento-funcional.md:1110 |
| CA-103 | RF-OC-049; Etapa 5 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1111 |
| CA-104a | RF-OC-051; Etapa 5 | Etapa 5 | Etapa 5 | - | integración + navegador | sí | Tipo ajustado por QA: Comprueba qué muestra la pantalla de aprobación y que aprobar no cambia. | documento-funcional.md:1112 |
| CA-104b | RF-OC-051; Etapa 5 | Etapa 5 | Etapa 5 | - | integración + navegador | sí | Tipo ajustado por QA: Necesita un módulo de prueba que declare información y justificación; se ve en la pantalla. | documento-funcional.md:1113 |
| CA-105 | RF-IMP-017, RF-DAT-010; Etapa 0 | Etapa 0 | Etapa 0 | - | manual (verificación documental) | sí | Tipo ajustado por QA: El propio criterio dice que es una verificación de documentos y no una prueba automática. | documento-funcional.md:1114 |
| CA-106 | RF-AUD-013, RF-AUD-020; Etapa 1 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:1115 |
| CA-107 | RF-CAT-027, RF-CAT-030; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:1116 |
| CA-108 | RF-DAT-018, RF-AUD-015, RN-024; Etapa 2 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | documento-funcional.md:1117 |
| CA-109 | RN-025; Fase 3 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | documento-funcional.md:1118 |

### ASI · Asistente de IA (55)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-ASI-01 | RF-ASI-001, RF-ASI-002 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/asistente-ia.md:478 |
| CA-ASI-02 | RF-ASI-001, RF-ASI-002, RF-ASI-029; RN-ASI-007 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/asistente-ia.md:479 |
| CA-ASI-03 | RF-ASI-003, RF-ASI-004; RNF-ASI-001 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:480 |
| CA-ASI-04 | RF-ASI-005; RN-ASI-032 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:481 |
| CA-ASI-05 | RF-ASI-006, RF-ASI-007, RF-ASI-008 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:482 |
| CA-ASI-06 | RF-ASI-008; RN-AYU-024 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:483 |
| CA-ASI-07 | RF-ASI-009, RF-ASI-011, RF-ASI-040 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:484 |
| CA-ASI-08 | RF-ASI-009; RN-ASI-001, RN-ASI-004, RN-ASI-006 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:485 |
| CA-ASI-09 | RF-ASI-009; RN-ASI-005 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:486 |
| CA-ASI-10 | RF-ASI-012, RF-ASI-049; RN-ASI-003, RN-ASI-027 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:487 |
| CA-ASI-11 | RN-ASI-003; RNF-ASI-002 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:488 |
| CA-ASI-12 | RF-ASI-013, RF-ASI-036; RN-ASI-009, RN-ASI-010, RN-ASI-036; RNF-ASI-004 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:489 |
| CA-ASI-13 | RF-ASI-011, RF-ASI-042; RN-ASI-026 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:490 |
| CA-ASI-14 | RF-ASI-013, RF-ASI-036; RN-ASI-008 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:491 |
| CA-ASI-15 | RF-ASI-037, RF-ASI-046; RN-ASI-025 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:492 |
| CA-ASI-16 | RF-ASI-040, RF-ASI-043; RN-ASI-014, RN-ASI-039 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:493 |
| CA-ASI-17 | RF-ASI-039; RN-ASI-013 | - | Fase 3 | - | manual (con apoyo de integración) | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:494 |
| CA-ASI-18 | RF-ASI-041 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:495 |
| CA-ASI-19 | RF-ASI-032; RN-ASI-029 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:496 |
| CA-ASI-20 | RF-ASI-032, RF-ASI-033; RN-ASI-029, RN-ASI-034 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:497 |
| CA-ASI-21 | RF-ASI-034; RN-ASI-030; RNF-ASI-006 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:498 |
| CA-ASI-22 | RF-ASI-029, RF-ASI-049; RN-ASI-028 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:499 |
| CA-ASI-23 | RF-ASI-031; RN-ASI-028, RN-ASI-035 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:500 |
| CA-ASI-24 | RF-ASI-049; RN-ASI-002 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:501 |
| CA-ASI-25 | RF-ASI-038; RN-ASI-012 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:502 |
| CA-ASI-26 | RF-ASI-035, RF-ASI-048; RN-ASI-031 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:503 |
| CA-ASI-27 | RF-ASI-006, RF-ASI-010, RF-ASI-014; RN-ASI-024; RNF-ASI-009 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:504 |
| CA-ASI-28 | RF-ASI-045 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:505 |
| CA-ASI-29 | RF-ASI-044; RN-ASI-021, RN-ASI-023 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:506 |
| CA-ASI-30 | RF-ASI-028; RN-ASI-022 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:507 |
| CA-ASI-31 | RF-ASI-045, RF-ASI-047 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:508 |
| CA-ASI-32 | RF-ASI-044; RN-ASI-001 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:509 |
| CA-ASI-33 | RF-ASI-044; RN-ASI-023, RN-ASI-036, RN-ASI-040; RNF-ASI-005 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:510 |
| CA-ASI-34 | RF-ASI-015, RF-ASI-017, RF-ASI-018; RN-ASI-015, RN-ASI-038; CA-AYU-01 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/asistente-ia.md:511 |
| CA-ASI-35 | RF-ASI-015; RN-ASI-005 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/asistente-ia.md:512 |
| CA-ASI-36 | RF-ASI-015; RN-ASI-007 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/asistente-ia.md:513 |
| CA-ASI-37 | RF-ASI-019; RN-POR-020 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:514 |
| CA-ASI-38 | RF-ASI-016; RN-AYU-032 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:515 |
| CA-ASI-39 | RF-ASI-020 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:516 |
| CA-ASI-40 | RF-ASI-022, RF-ASI-023, RF-ASI-025; RN-ASI-015, RN-ASI-038 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:517 |
| CA-ASI-41 | RF-ASI-023, RF-ASI-024; RN-ASI-017 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:518 |
| CA-ASI-42 | RF-ASI-022; RN-ASI-016 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:519 |
| CA-ASI-43 | RF-ASI-026; RN-ASI-018, RN-ASI-019 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:520 |
| CA-ASI-44 | RF-ASI-026; RN-ASI-020 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:521 |
| CA-ASI-45 | RF-ASI-025; RN-ASI-037 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:522 |
| CA-ASI-46 | RF-ASI-019, RF-ASI-021, RF-ASI-027; RN-ASI-018 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/asistente-ia.md:523 |
| CA-ASI-47 | RF-ASI-025; RN-ASI-002, RN-ASI-007 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:524 |
| CA-ASI-48 | RF-ASI-021, RF-ASI-030; RN-ASI-011 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/asistente-ia.md:525 |
| CA-ASI-49 | RF-ASI-002; RN-ASI-035 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:526 |
| CA-ASI-50 | RF-ASI-033 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:527 |
| CA-ASI-51 | RN-ASI-033 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:528 |
| CA-ASI-52 | RNF-ASI-010 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:529 |
| CA-ASI-53 | RF-ASI-001, RF-ASI-004, RF-ASI-050; RF-UX-004 | Etapa 6 | Fase 3 | - | navegador | no (bloquea su módulo) | Arranca después de su requisito | modulos/asistente-ia.md:530 |
| CA-ASI-54 | RF-ASI-005; RN-ASI-041; RN-ASI-005; RNF-POR-008 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:531 |
| CA-ASI-55 | RF-ASI-030; RN-ASI-011 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/asistente-ia.md:532 |

### AYU · Mesa de ayuda (27)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-AYU-01 | RF-AYU-001, RF-AYU-003, RF-AYU-004, RF-AYU-005; RN-AYU-003 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:316 |
| CA-AYU-02 | RF-AYU-002; RN-AYU-002, RN-AYU-029 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:317 |
| CA-AYU-03 | RF-AYU-005; RN-AYU-004 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:318 |
| CA-AYU-04 | RF-AYU-016, RF-AYU-017, RF-AYU-018; RN-AYU-006, RN-AYU-007; RNF-AYU-005 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:319 |
| CA-AYU-05 | RF-AYU-015; RN-AYU-006 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:320 |
| CA-AYU-06 | RF-AYU-013; RN-AYU-009; RNF-AYU-007 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:321 |
| CA-AYU-07 | RF-AYU-009; RN-AYU-011 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:322 |
| CA-AYU-08 | RF-AYU-009; RN-AYU-011 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:323 |
| CA-AYU-09 | RF-AYU-023, RF-AYU-025; RN-AYU-010 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:324 |
| CA-AYU-10 | RF-AYU-027; RN-AYU-008, RN-AYU-012 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:325 |
| CA-AYU-11 | RF-AYU-010, RF-AYU-011, RF-AYU-012; RN-AYU-015, RN-AYU-017, RN-AYU-018 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:326 |
| CA-AYU-12 | RF-AYU-019, RF-AYU-020; RN-AYU-020 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:327 |
| CA-AYU-13 | RF-AYU-006, RF-AYU-007, RF-AYU-008, RF-AYU-041; RN-AYU-018 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:328 |
| CA-AYU-14 | RF-AYU-030, RF-AYU-031, RF-AYU-035, RF-AYU-036; RN-AYU-023, RN-AYU-035 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:329 |
| CA-AYU-15 | RF-AYU-032, RF-AYU-033, RF-AYU-034; RN-AYU-024, RN-AYU-025 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:330 |
| CA-AYU-16 | RF-AYU-028, RF-AYU-029; RN-AYU-022 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:331 |
| CA-AYU-17 | RF-AYU-045; RN-AYU-027 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:332 |
| CA-AYU-18 | RF-AYU-014, RF-AYU-046; RN-AYU-025 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:333 |
| CA-AYU-19 | RF-AYU-026, RF-AYU-036; RN-AYU-019, RN-AYU-028, RN-AYU-030; RNF-AYU-004 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:334 |
| CA-AYU-20 | RF-AYU-047; RN-AYU-033 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:335 |
| CA-AYU-21 | RF-AYU-043, RF-AYU-044; RN-AYU-032 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:336 |
| CA-AYU-22 | RF-AYU-040, RF-AYU-048; RN-AYU-002 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:337 |
| CA-AYU-23 | RN-AYU-001; RNF-AYU-009 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:338 |
| CA-AYU-24 | RF-AYU-021, RF-AYU-022, RF-AYU-024, RF-AYU-042, RF-AYU-044; RN-AYU-001, RN-AYU-014 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:339 |
| CA-AYU-25 | RN-AYU-001; RF-AYU-001 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:340 |
| CA-AYU-26 |  | - | Fase 2 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/mesa-de-ayuda.md:341 |
| CA-AYU-27 | RF-AYU-037, RF-AYU-038, RF-AYU-039; RN-AYU-009, RN-AYU-027 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:342 |

### CAM · Gestión de cambios (20)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-CAM-01 | RF-CAM-001, RF-CAM-002, RF-CAM-006, RF-CAM-012, RF-CAM-019, RN-CAM-006, RN-CAM-010, RN-CAM-021, RNF-CAM-006... | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:250 |
| CA-CAM-02 | RN-CAM-001, RNF-CAM-004 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/gestion-cambios.md:252 |
| CA-CAM-03 | RN-CAM-002, RN-CAM-007, RF-CAM-018, RNF-CAM-001; permiso denegado | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:254 |
| CA-CAM-04 | RF-CAM-015, RN-CAM-022, RN-CAM-025, RNF-CAM-005; aislamiento entre empresas | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:256 |
| CA-CAM-05 | RF-CAM-004, RN-CAM-005, RN-CAM-009 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:258 |
| CA-CAM-06 | RF-CAM-011, RN-CAM-013, RN-CAM-014 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/gestion-cambios.md:260 |
| CA-CAM-07 | RN-CAM-011 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/gestion-cambios.md:262 |
| CA-CAM-08 | RF-CAM-003, RF-CAM-016, RN-CAM-008, RNF-CAM-003 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:264 |
| CA-CAM-09 | RF-CAM-014, RN-CAM-016, RN-CAM-017 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:266 |
| CA-CAM-10 | RF-CAM-013, RN-CAM-015 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:268 |
| CA-CAM-11 | RF-CAM-005, RN-CAM-003, RN-CAM-018 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:270 |
| CA-CAM-12 | RN-CAM-024, RNF-CAM-007 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/gestion-cambios.md:272 |
| CA-CAM-13 | RF-CAM-007, RF-CAM-008, RN-CAM-019, RN-CAM-020, RN-CAM-021 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/gestion-cambios.md:274 |
| CA-CAM-14 | RF-CAM-009, RF-CAM-010, RN-CAM-026, RNF-CAM-002 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/gestion-cambios.md:276 |
| CA-CAM-15 | RF-CAM-020, RN-CAM-023, RNF-CAM-009 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:278 |
| CA-CAM-16 | RNF-CAM-010 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:280 |
| CA-CAM-17 | RN-CAM-024, RNF-CAM-004 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/gestion-cambios.md:282 |
| CA-CAM-18 | RF-CAM-012, RN-CAM-012 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/gestion-cambios.md:284 |
| CA-CAM-19 | RF-CAM-017, RN-CAM-027, RN-CAM-028, RN-CAM-029 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-cambios.md:286 |
| CA-CAM-20 | RN-CAM-030, RN-CAM-024, RNF-CAM-004; permiso denegado | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/gestion-cambios.md:288 |

### CMD · CMDB ligera (21)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-CMD-01 | RF-CMD-001, RF-CMD-002, RF-CMD-003, RF-CMD-013, RN-CMD-002, RN-CMD-023, RN-CMD-025 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:219 |
| CA-CMD-02 | RF-CMD-010, RN-CMD-006 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:221 |
| CA-CMD-03 | RF-CMD-011, RF-CMD-020, RN-CMD-014, RN-CMD-015, RNF-CMD-001, RNF-CMD-006 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:223 |
| CA-CMD-04 | RF-CMD-006, RF-CMD-008, RN-CMD-005, RN-CMD-007, RN-CMD-008, RN-CMD-012 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:225 |
| CA-CMD-05 | RN-CMD-001, RN-CMD-027, RNF-CMD-005; aislamiento entre empresas | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:227 |
| CA-CMD-06 | RF-CMD-014, RNF-CMD-004; permiso denegado | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:229 |
| CA-CMD-07 | RF-CMD-009, RF-CMD-017, RN-CMD-004, RN-CMD-009, RN-CMD-011 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:231 |
| CA-CMD-08 | RF-CMD-015, RN-CMD-017, RN-CMD-019 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:233 |
| CA-CMD-09 | RF-CMD-004, RF-CMD-011, RN-CMD-016 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:235 |
| CA-CMD-10 | RF-CMD-012, RN-CMD-014, RN-CMD-021 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:237 |
| CA-CMD-11 | RF-CMD-005, RN-CMD-026 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:239 |
| CA-CMD-12 | RF-CMD-007, RN-CMD-003 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:241 |
| CA-CMD-13 | RF-CMD-016, RN-CMD-020, RNF-CMD-009 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:243 |
| CA-CMD-14 | RF-CMD-019 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:245 |
| CA-CMD-15 | RN-CMD-010, RN-CMD-021 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/cmdb-ligera.md:247 |
| CA-CMD-16 | RN-CMD-013 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/cmdb-ligera.md:249 |
| CA-CMD-17 | RN-CMD-018, RN-CMD-024 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/cmdb-ligera.md:251 |
| CA-CMD-18 | RN-CMD-028, RNF-CMD-007 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:253 |
| CA-CMD-19 | RN-CMD-029 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/cmdb-ligera.md:255 |
| CA-CMD-20 | RN-CMD-030 | - | Fase 3 | - | unitaria | no (bloquea su módulo) | Etapa heredada del módulo | modulos/cmdb-ligera.md:257 |
| CA-CMD-21 | RNF-CMD-008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/cmdb-ligera.md:259 |

### DOM · Dominios y certificados (14)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-DOM-01 | alta y unicidad; RF-DOM-001, RN-DOM-002, RNF-DOM-006 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/dominios-certificados.md:234 |
| CA-DOM-02 | vigencia con reloj fijado; RF-DOM-004, 005, RN-DOM-006, RNF-DOM-003 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/dominios-certificados.md:235 |
| CA-DOM-03 | avisos con dos empresas; RF-DOM-006, 019, RNF-DOM-002 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/dominios-certificados.md:236 |
| CA-DOM-04 | renovación de dominio; RF-DOM-007, 015 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/dominios-certificados.md:237 |
| CA-DOM-05 | reemplazo de certificado; RF-DOM-002, 003, 008 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/dominios-certificados.md:238 |
| CA-DOM-06 | sin secretos; RN-DOM-010, RNF-DOM-005 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/dominios-certificados.md:239 |
| CA-DOM-07 | permiso denegado; RF-DOM-010, RN-DOM-014, RNF-DOM-004 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/dominios-certificados.md:240 |
| CA-DOM-08 | aislamiento; RN-DOM-001 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/dominios-certificados.md:241 |
| CA-DOM-09 | cese sin bloqueo; RF-DOM-011, 018, RN-DOM-012 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/dominios-certificados.md:242 |
| CA-DOM-10 | riesgo de titular y baja; RF-DOM-009, 012 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/dominios-certificados.md:243 |
| CA-DOM-11 | segunda persona y respaldo; RF-DOM-016, 017, RN-DOM-016, 017 | Fase 2 | Fase 2 | - | manual (con apoyo de integración) | no (bloquea su módulo) |  | modulos/dominios-certificados.md:244 |
| CA-DOM-12 | importación; RF-DOM-013 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/dominios-certificados.md:245 |
| CA-DOM-13 | exportación y alcance; RF-DOM-014, RNF-DOM-007 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/dominios-certificados.md:246 |
| CA-DOM-14 | escritura con referencias cruzadas; RN-DOM-001 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/dominios-certificados.md:247 |

### ENT · Entregas y devoluciones (17)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-ENT-01 | RF-ENT-001, 003, 012, 013; RN-ENT-005 | Etapa 4 | Etapa 4 | - | navegador | sí |  | modulos/entregas-devoluciones.md:231 |
| CA-ENT-02 | RN-ENT-002, 003 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | modulos/entregas-devoluciones.md:232 |
| CA-ENT-03 | RN-ENT-003; RNF-ENT-003 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/entregas-devoluciones.md:233 |
| CA-ENT-04 | RF-ENT-004; RN-ENT-011, 012 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/entregas-devoluciones.md:234 |
| CA-ENT-05 | RN-ENT-014 | - | Etapa 4 | - | unitaria | sí | Etapa heredada del módulo | modulos/entregas-devoluciones.md:235 |
| CA-ENT-06 | permiso denegado)** (RF-ENT-001, 009; RN-ENT-007 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | modulos/entregas-devoluciones.md:236 |
| CA-ENT-07 | aislamiento)** (RF-ENT-014; RN-ENT-023 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | modulos/entregas-devoluciones.md:237 |
| CA-ENT-08 | · Traspaso de todo o nada** (RF-ENT-004, 006; RN-ENT-001, 018, 020 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/entregas-devoluciones.md:238 |
| CA-ENT-09 | RN-ENT-007 | - | Etapa 4 | - | integración | sí | Etapa heredada del módulo | modulos/entregas-devoluciones.md:243 |
| CA-ENT-10 | · Pendiente de devolución no es pérdida** (RF-ENT-010, 011, 014; RN-ENT-016; S-ENT-11 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/entregas-devoluciones.md:244 |
| CA-ENT-11 | RF-ENT-009; RN-ENT-019 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | modulos/entregas-devoluciones.md:248 |
| CA-ENT-12 | RF-ENT-003, 005, 008; RN-ENT-026 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | modulos/entregas-devoluciones.md:249 |
| CA-ENT-13 | RF-ENT-003; RN-ENT-025; RNF-ENT-008 | Etapa 4 | Etapa 4 | - | navegador | sí |  | modulos/entregas-devoluciones.md:250 |
| CA-ENT-14 | RN-ENT-006 | - | Etapa 4 | - | integración | sí | Etapa heredada del módulo | modulos/entregas-devoluciones.md:251 |
| CA-ENT-15 | RF-ENT-007, 015, 017; RN-ENT-010 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/entregas-devoluciones.md:252 |
| CA-ENT-16 | · Borrador de la entrega** (RF-ENT-002; RN-ENT-020, 024 | Etapa 4 | Etapa 4 | - | navegador | sí |  | modulos/entregas-devoluciones.md:253 |
| CA-ENT-17 | · Renovar un préstamo** (RF-ENT-016; RN-ENT-017; S-ENT-12 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/entregas-devoluciones.md:259 |

### GAR · Garantías y mantenimiento (27)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-GAR-01a | RF-GAR-002, 005 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | modulos/garantias-mantenimiento.md:265 |
| CA-GAR-01b | RF-GAR-001 | Etapa 5 | Etapa 5 | - | navegador | sí | Tipo ajustado por QA: Se prueba que la pantalla de recepción pide la garantía una sola vez para el lote. | modulos/garantias-mantenimiento.md:266 |
| CA-GAR-01c | RF-GAR-001 | Etapa 5 | Etapa 5 | - | integración + navegador | sí |  | modulos/garantias-mantenimiento.md:267 |
| CA-GAR-02 | RF-GAR-019, 028, RN-GAR-033 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:268 |
| CA-GAR-03 | RF-GAR-014 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:269 |
| CA-GAR-04a | RF-GAR-008, RN-GAR-004, RN-GAR-036, RN-018 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/garantias-mantenimiento.md:270 |
| CA-GAR-04b | RF-GAR-004, RN-GAR-006 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:271 |
| CA-GAR-04c | RF-GAR-003 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/garantias-mantenimiento.md:272 |
| CA-GAR-04d | RF-GAR-003 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/garantias-mantenimiento.md:273 |
| CA-GAR-04e | RF-GAR-006, RN-GAR-007 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/garantias-mantenimiento.md:274 |
| CA-GAR-04f | RF-GAR-004, RN-GAR-007 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:275 |
| CA-GAR-05 | RF-GAR-012, 013, 015, 016, 017, RN-GAR-019 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:276 |
| CA-GAR-06 | RF-GAR-014, 022, RN-GAR-028 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:277 |
| CA-GAR-07 | RF-GAR-023, RN-GAR-030 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:278 |
| CA-GAR-08 | RF-GAR-020, 021, RN-GAR-027 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:279 |
| CA-GAR-09 | RF-GAR-010, 011, RN-GAR-014 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:280 |
| CA-GAR-10 | RF-GAR-011, RN-GAR-016 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:281 |
| CA-GAR-11 | RF-GAR-018, 030, RN-GAR-022 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:282 |
| CA-GAR-12 | RF-GAR-025, RN-GAR-031 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:283 |
| CA-GAR-13 | RF-GAR-007, 009, RN-GAR-010 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:284 |
| CA-GAR-14 | RN-GAR-037, 034 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/garantias-mantenimiento.md:285 |
| CA-GAR-15 | RF-GAR-005, 008, RN-GAR-003 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | modulos/garantias-mantenimiento.md:286 |
| CA-GAR-16 | RF-GAR-024, 026, 027, 029 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:287 |
| CA-GAR-17 | RF-GAR-015, RN-GAR-038 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:288 |
| CA-GAR-18 | RN-GAR-039 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/garantias-mantenimiento.md:289 |
| CA-GAR-19 | RF-GAR-030, RN-GAR-025 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:291 |
| CA-GAR-20 | RF-GAR-031, RN-GAR-041 | Fase 2 | Fase 2 | - | manual (con apoyo de integración) | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:290 |

### INT · Integraciones y API (26)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-INT-01 | Clave visible una vez.** *Cubre RF-INT-001, 002, RN-INT-002 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/integraciones-api.md:297 |
| CA-INT-02 | Permisos respetados.** *Cubre RF-INT-006, 007, RN-INT-007 a 009 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:298 |
| CA-INT-03 | Aislamiento entre empresas.** *Cubre RN-INT-001, RF-INT-006, RNF-INT-006 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:299 |
| CA-INT-04 | Permiso denegado.** *Cubre RN-INT-021, sección 3 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/integraciones-api.md:300 |
| CA-INT-05 | Nadie da más de lo que tiene.** *Cubre RF-INT-026, sección 3 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:301 |
| CA-INT-06 | Límite de uso.** *Cubre RF-INT-005, 011, RN-INT-015, 016 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:302 |
| CA-INT-07 | Revocación inmediata.** *Cubre RF-INT-003, 004, 025, RN-INT-004, RNF-INT-002 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:303 |
| CA-INT-08 | Escritura sin duplicar.** *Cubre RF-INT-009, 010, RN-INT-047 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:304 |
| CA-INT-09 | La API no aprueba.** *Cubre RF-INT-008, RN-INT-010, 011; RN-025 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:305 |
| CA-INT-10 | Clave desconocida y bloqueos.** *Cubre RN-INT-003, 006, 017, 018 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/integraciones-api.md:306 |
| CA-INT-11 | Webhook firmado con reintentos.** *Cubre RF-INT-014, 015, RN-INT-014, 024 a 028, 030, RNF-INT-003 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/integraciones-api.md:307 |
| CA-INT-12 | Anti-SSRF.** *Cubre RF-INT-013, RN-INT-023 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/integraciones-api.md:308 |
| CA-INT-13 | Exportación SAP completa.** *Cubre RF-INT-018, 019, RN-INT-034, 035, 038, 041 a 044, 049, RNF-INT-004 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/integraciones-api.md:309 |
| CA-INT-14 | Equivalencia faltante.** *Cubre RF-INT-016, 018, RN-INT-036 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:310 |
| CA-INT-15 | Cambios tras exportar.** *Cubre RF-INT-020, 021, RN-INT-037 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:311 |
| CA-INT-16 | Ingreso externo (INT-3).** *Cubre RF-INT-022, 023, RN-INT-031 a 033 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:312 |
| CA-INT-17 | Texto libre y lo prohibido.** *Cubre RF-INT-008, RN-INT-046 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/integraciones-api.md:313 |
| CA-INT-18 | Versionado.** *Cubre RF-INT-012, RN-INT-005, 019, 020, RNF-INT-007, 008 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/integraciones-api.md:314 |
| CA-INT-19 | Carga de maestros.** *Cubre RF-INT-017, RN-INT-039, 040 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:315 |
| CA-INT-20 | Creador inactivo.** *Cubre RF-INT-024, RN-INT-022 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:316 |
| CA-INT-21 | Autor integración.** *Cubre RN-INT-012 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/integraciones-api.md:317 |
| CA-INT-22 | Lectura masiva.** *Cubre RN-INT-013, 041 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/integraciones-api.md:318 |
| CA-INT-23 | Módulo apagado.** *Cubre RN-INT-029, 045 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/integraciones-api.md:319 |
| CA-INT-24 | Procesos con dos empresas.** *Cubre RN-INT-048, RNF-INT-006 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/integraciones-api.md:320 |
| CA-INT-25 | Rendimiento.** *Cubre RNF-INT-001 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:321 |
| CA-INT-26 | Secretos.** *Cubre RNF-INT-005 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:322 |

### LIC · Licencias de software (20)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-LIC-01 | alta y contrato único; RF-LIC-001, 002 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/licencias-software.md:245 |
| CA-LIC-02 | puestos por serie; RF-LIC-003, RN-LIC-006, 007 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/licencias-software.md:246 |
| CA-LIC-03 | último puesto; RF-LIC-005, RNF-LIC-003 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/licencias-software.md:247 |
| CA-LIC-04 | sobreasignación y duplicado; RF-LIC-005, 021, RN-LIC-008 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/licencias-software.md:248 |
| CA-LIC-05 | clave segura; RF-LIC-004, RN-LIC-015, 016 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/licencias-software.md:249 |
| CA-LIC-06 | permiso denegado; RF-LIC-004 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/licencias-software.md:250 |
| CA-LIC-07 | cuadre; RF-LIC-008, 009, RN-LIC-013, 014 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/licencias-software.md:251 |
| CA-LIC-08 | vigencia con reloj fijado; RF-LIC-010, RN-LIC-005, RNF-LIC-006 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/licencias-software.md:252 |
| CA-LIC-09 | cese de la Persona; RF-LIC-007, 020, RN-LIC-011 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/licencias-software.md:253 |
| CA-LIC-10 | asignación masiva; RF-LIC-006, RNF-LIC-002 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/licencias-software.md:254 |
| CA-LIC-11 | renovación y segunda persona; RF-LIC-011, RN-LIC-018, 020 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/licencias-software.md:255 |
| CA-LIC-12 | terminar; RF-LIC-012 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/licencias-software.md:256 |
| CA-LIC-13 | avisos con dos empresas y reloj fijable; RF-LIC-013, 014, RNF-LIC-005 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/licencias-software.md:257 |
| CA-LIC-14 | importación; RF-LIC-015, RN-LIC-028 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/licencias-software.md:258 |
| CA-LIC-15 | listas y exportación; RF-LIC-016, RNF-LIC-001, 007 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/licencias-software.md:259 |
| CA-LIC-16 | mis licencias y alcance propio; RF-LIC-018 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/licencias-software.md:260 |
| CA-LIC-17 | costo y respaldo; RF-LIC-019, RN-LIC-022 | Fase 2 | Fase 2 | - | manual (con apoyo de integración) | no (bloquea su módulo) |  | modulos/licencias-software.md:261 |
| CA-LIC-18 | aislamiento; RN-LIC-001 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/licencias-software.md:262 |
| CA-LIC-19 | escritura con referencias cruzadas; RN-LIC-001 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/licencias-software.md:263 |
| CA-LIC-20 | serie sin clave; RN-LIC-017, RN-LIC-016 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/licencias-software.md:265 |

### LIN · Líneas móviles (16)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-LIN-01 | alta; RF-LIN-002, 003 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/lineas-moviles.md:246 |
| CA-LIN-02 | número repetido; RF-LIN-002, RN-LIN-002, RNF-LIN-002 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/lineas-moviles.md:247 |
| CA-LIN-03 | IMEI desde el equipo; RF-LIN-004, 011, RNF-LIN-007 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/lineas-moviles.md:248 |
| CA-LIN-04 | suspender; RF-LIN-005, RN-LIN-012 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/lineas-moviles.md:249 |
| CA-LIN-05 | equipo robado; RF-LIN-010, RN-LIN-010 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/lineas-moviles.md:250 |
| CA-LIN-06 | baja antes de permanencia; RF-LIN-006, 009, RN-LIN-022 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/lineas-moviles.md:251 |
| CA-LIN-07 | cese sin bloqueo; RF-LIN-017, 020, RN-LIN-009 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/lineas-moviles.md:252 |
| CA-LIN-08 | segunda persona y respaldo; RF-LIN-019, 022, RN-LIN-016, 017 | Fase 2 | Fase 2 | - | manual (con apoyo de integración) | no (bloquea su módulo) |  | modulos/lineas-moviles.md:253 |
| CA-LIN-09 | permisos y alcance propio; RF-LIN-014, 018, RNF-LIN-001, 006 | Fase 2 | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Arranca después de su requisito | modulos/lineas-moviles.md:254 |
| CA-LIN-10 | planes y cargos; RF-LIN-001, 008, 015, 016, RN-LIN-014, 015 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/lineas-moviles.md:255 |
| CA-LIN-11 | importación; RF-LIN-013, RNF-LIN-004 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/lineas-moviles.md:256 |
| CA-LIN-12 | reingreso; RF-LIN-007, RN-LIN-021 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/lineas-moviles.md:257 |
| CA-LIN-13 | avisos con dos empresas y reloj fijable; RF-LIN-012, RNF-LIN-005, 008 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/lineas-moviles.md:258 |
| CA-LIN-14 | migración; RF-LIN-021, RN-LIN-024, 025 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/lineas-moviles.md:259 |
| CA-LIN-15 | aislamiento; RN-LIN-001 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/lineas-moviles.md:260 |
| CA-LIN-16 | escritura con referencias cruzadas; RN-LIN-001 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/lineas-moviles.md:261 |

### MSF · Microsoft Entra ID e Intune (44)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-MSF-01 | Conectar y confirmar el directorio.** *Cubre RF-MSF-001, RN-MSF-004, 005, 006 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:509 |
| CA-MSF-02 | Solo lectura, comprobada en cada lectura, y conexión por partes.** *Cubre RF-MSF-001, 003, RN-MSF-007, 065,... | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:510 |
| CA-MSF-03 | La credencial es un secreto.** *Cubre RF-MSF-002, RN-MSF-002, 003, RNF-MSF-004 | Fase 3 | Fase 3 | - | manual (con apoyo de integración) | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:511 |
| CA-MSF-04 | Estado, vencimiento y pérdida de acceso.** *Cubre RF-MSF-004, RN-MSF-056, RNF-MSF-009 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:512 |
| CA-MSF-05 | Reemplazar la credencial.** *Cubre RF-MSF-005 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:513 |
| CA-MSF-06 | Pausar y reanudar.** *Cubre RF-MSF-006 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:514 |
| CA-MSF-07 | Desconectar.** *Cubre RF-MSF-007, RN-MSF-013, 060 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:515 |
| CA-MSF-08 | Sincronizar ahora y límites de Microsoft.** *Cubre RF-MSF-008, RN-MSF-051 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:516 |
| CA-MSF-09 | Historial de lecturas y procesos con dos empresas.** *Cubre RF-MSF-009, RN-MSF-050, RNF-MSF-003, 005 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:517 |
| CA-MSF-10 | Vista previa y filtros.** *Cubre RF-MSF-010, 011 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:518 |
| CA-MSF-11 | Coincidencia y vínculo.** *Cubre RF-MSF-012, RN-MSF-014, 015, 016 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:519 |
| CA-MSF-12 | Propuestas de alta y cambio.** *Cubre RF-MSF-013, RN-MSF-017, 018, 023, 025 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:520 |
| CA-MSF-13 | Revisar y aplicar con permisos de Personas.** *Cubre RF-MSF-014, RN-MSF-019, 020 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:521 |
| CA-MSF-14 | Aplicar en bloque (excepción a D-050).** *Cubre RF-MSF-015, RN-MSF-026 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:522 |
| CA-MSF-15 | Una baja en Microsoft no es un cese.** *Cubre RF-MSF-016, RN-MSF-012, 021 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:523 |
| CA-MSF-16 | Áreas desconocidas.** *Cubre RF-MSF-017, RN-MSF-024 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:524 |
| CA-MSF-17 | Desvincular una cuenta.** *Cubre RF-MSF-018 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:525 |
| CA-MSF-18 | Anonimización.** *Cubre RF-MSF-019, RN-MSF-022, 059 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:526 |
| CA-MSF-19 | Marca de categoría y «Pendiente de enrolar».** *Cubre RF-MSF-020, 021, RN-MSF-027, 028, 029 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:527 |
| CA-MSF-20 | De la orden de compra a Intune, de punta a punta.** *Cubre RF-MSF-022, 025, 032 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:528 |
| CA-MSF-21 | Solo equipos corporativos y datos mínimos.** *Cubre RF-MSF-023, RN-MSF-008, 009, 010 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:529 |
| CA-MSF-22 | Vínculo automático por serie o IMEI.** *Cubre RF-MSF-024, RN-MSF-030, 031, 032, 033, 036 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:530 |
| CA-MSF-23 | Coincidencia dudosa y desvinculación.** *Cubre RF-MSF-029, RN-MSF-033, 034, 035 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:531 |
| CA-MSF-24 | Bloque «Intune» y datos personales.** *Cubre RF-MSF-026, RN-MSF-037, 038, 039, 040, 054, RNF-MSF-007 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:532 |
| CA-MSF-25 | Historial de cumplimiento.** *Cubre RF-MSF-027 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:533 |
| CA-MSF-26 | Lista, filtros y exportación.** *Cubre RF-MSF-028, RN-MSF-053, 054 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:534 |
| CA-MSF-27 | Panel de conciliación calculado.** *Cubre RF-MSF-030, 032, RN-MSF-042, 043 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:535 |
| CA-MSF-28 | En Intune y no en el inventario.** *Cubre RF-MSF-031, 036, RN-MSF-011, 048, 049 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:536 |
| CA-MSF-29 | Diferencia de asignado a.** *Cubre RF-MSF-033, RN-MSF-046, 047 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:537 |
| CA-MSF-30 | Extraviado que se comunica y baja que sigue.** *Cubre RF-MSF-034, RN-MSF-044, 045 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:538 |
| CA-MSF-31 | Duplicados en Intune.** *Cubre RF-MSF-035, RN-MSF-032 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:539 |
| CA-MSF-32 | Línea informativa en el cese.** *Cubre RF-MSF-037 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:540 |
| CA-MSF-33 | Sin acciones remotas.** *Cubre RF-MSF-038, RN-MSF-061 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:541 |
| CA-MSF-34 | Avisos con contenido mínimo.** *Cubre RF-MSF-039, RN-MSF-055 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:542 |
| CA-MSF-35 | Dato con fecha y lectura fallida.** *Cubre RF-MSF-040, RN-MSF-041, 042 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:543 |
| CA-MSF-36 | Suspensión, módulo apagado y restauración.** *Cubre RF-MSF-041, RN-MSF-058, 064 | Fase 3 | Fase 3 | - | manual (con apoyo de integración) | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:544 |
| CA-MSF-37 | Aislamiento entre empresas.** *Cubre RN-MSF-001, 002, RNF-MSF-005, 010 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:545 |
| CA-MSF-38 | Permiso denegado.** *Cubre la sección 3 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/microsoft-entra-intune.md:546 |
| CA-MSF-39 | Auditoría sin valores personales.** *Cubre RN-MSF-052, 053, RNF-MSF-008 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:547 |
| CA-MSF-40 | Texto libre.** *Cubre RN-MSF-057 | - | Fase 3 | - | unitaria | no (bloquea su módulo) | Etapa heredada del módulo | modulos/microsoft-entra-intune.md:548 |
| CA-MSF-41 | Independencia y sin API.** *Cubre RN-MSF-062, 063 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/microsoft-entra-intune.md:549 |
| CA-MSF-42 | Rendimiento y segundo plano.** *Cubre RNF-MSF-001, 002 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:550 |
| CA-MSF-43 | Indicadores para reportes.** *Cubre RF-MSF-042 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:551 |
| CA-MSF-44 | Sin datos reales en las pruebas.** *Cubre RNF-MSF-006 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/microsoft-entra-intune.md:552 |

### NOT · Notificaciones (22)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-NOT-01 | RF-NOT-004, RF-NOT-013, RF-NOT-020; RN-NOT-011 | Etapa 1 | Etapa 5 | - | integración | sí | Arranca después de su requisito | modulos/notificaciones.md:258 |
| CA-NOT-02 | RF-NOT-005, RF-NOT-006; RN-NOT-001 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/notificaciones.md:259 |
| CA-NOT-03 | RF-NOT-003; RN-NOT-002 | Etapa 1 | Etapa 1 | - | integración | sí |  | modulos/notificaciones.md:260 |
| CA-NOT-04 | RF-NOT-024, RF-NOT-025, RF-NOT-026; RN-NOT-013, RN-NOT-021, RN-NOT-022 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/notificaciones.md:261 |
| CA-NOT-05a | RF-NOT-007, RF-NOT-033; RN-NOT-003 | Etapa 1 | Etapa 1 | - | integración | sí |  | modulos/notificaciones.md:262 |
| CA-NOT-05b | RF-NOT-027, RF-NOT-030; RN-NOT-003, RN-NOT-027 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/notificaciones.md:263 |
| CA-NOT-06 | RF-NOT-008, RF-NOT-009; RN-NOT-005 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/notificaciones.md:264 |
| CA-NOT-07a | RF-NOT-013 | Etapa 1 | Etapa 5 | - | integración | sí | Arranca después de su requisito | modulos/notificaciones.md:265 |
| CA-NOT-07b | RF-NOT-011, RF-NOT-012, RF-NOT-014 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/notificaciones.md:266 |
| CA-NOT-08 | RF-NOT-019; RN-NOT-010 | Etapa 1 | Etapa 1 | Fase 2 | integración | sí |  | modulos/notificaciones.md:267 |
| CA-NOT-09 | RF-NOT-020, RF-NOT-029; RN-NOT-016 | Etapa 1 | Etapa 1 | Fase 2 | integración | sí |  | modulos/notificaciones.md:268 |
| CA-NOT-10 | RF-NOT-021, RF-NOT-022, RF-NOT-023, RF-NOT-031, RF-NOT-032; RN-NOT-024 | Etapa 1 | Etapa 1 | - | integración | sí | Corre antes de lo que necesita | modulos/notificaciones.md:269 |
| CA-NOT-11 | RF-NOT-015, RF-NOT-016, RF-NOT-017, RF-NOT-018 | Etapa 1 | Fase 2 | - | integración | no (bloquea su módulo) | Arranca después de su requisito | modulos/notificaciones.md:270 |
| CA-NOT-12 | RF-NOT-001, RF-NOT-002; RNF-NOT-005 | Etapa 1 | Etapa 1 | - | integración | sí |  | modulos/notificaciones.md:271 |
| CA-NOT-13 | RF-NOT-003, RF-NOT-010, RF-NOT-034; RN-NOT-004, RN-NOT-020 | Etapa 1 | Etapa 1 | - | integración | sí | Corre antes de lo que necesita | modulos/notificaciones.md:272 |
| CA-NOT-14 | RF-NOT-019; RN-NOT-008 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | modulos/notificaciones.md:273 |
| CA-NOT-15 | RN-NOT-001, RN-NOT-023; RNF-NOT-007 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | modulos/notificaciones.md:274 |
| CA-NOT-16 | PS-214, PS-215, PS-218; RF-NOT-016 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/notificaciones.md:275 |
| CA-NOT-17 | RF-NOT-028 | Etapa 1 | Etapa 1 | - | integración | sí |  | modulos/notificaciones.md:276 |
| CA-NOT-18 | RF-NOT-033 | Etapa 1 | Etapa 1 | - | integración | sí |  | modulos/notificaciones.md:277 |
| CA-NOT-19 | RN-NOT-003, RN-NOT-006 | - | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/notificaciones.md:278 |
| CA-NOT-20 | RF-NOT-004, RF-NOT-007, RF-NOT-013, RF-NOT-033; RN-NOT-003, RN-NOT-005; RF-ACC-021 del núcleo | Etapa 1 | Etapa 5 | - | integración | sí | Arranca después de su requisito | modulos/notificaciones.md:279 |

### ONB · Onboarding y offboarding (15)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-ONB-01 | RF-ONB-001, 002, 004, 015, 016 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:202 |
| CA-ONB-02 | RF-ONB-003, 006; RN-ONB-002 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:203 |
| CA-ONB-03 | RF-ONB-005, 010, 011; RN-ONB-006 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:204 |
| CA-ONB-04 | RF-ONB-009; RN-ONB-008 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:205 |
| CA-ONB-05 | RF-ONB-014; RN-ONB-009 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:206 |
| CA-ONB-06 | RN-ONB-010; RNF-ONB-005 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/onboarding-offboarding.md:207 |
| CA-ONB-07 | permiso denegado)** (RF-ONB-013; PS-203 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:208 |
| CA-ONB-08 | aislamiento)** (RN-ONB-017; RNF-ONB-006 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/onboarding-offboarding.md:209 |
| CA-ONB-09 | RN-ONB-001). Con un ingreso abierto, cuando se intenta otro ingreso para la misma Persona, entonces se rechaza | - | Fase 2 | - | unitaria | no (bloquea su módulo) | Etapa heredada del módulo | modulos/onboarding-offboarding.md:210 |
| CA-ONB-10 | RF-ONB-007). Cuando alguien marca "No aplica" sin motivo, entonces se rechaza; con motivo se acepta y queda... | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:211 |
| CA-ONB-11 | RN-ONB-007, 008). Con activos aún asignados (incluso pendientes de devolución), cuando se intenta marcar "D... | - | Fase 2 | - | unitaria | no (bloquea su módulo) | Etapa heredada del módulo | modulos/onboarding-offboarding.md:212 |
| CA-ONB-12 | RF-ONB-008; RN-ONB-018). Cuando un usuario intenta completar tareas de su propia salida, entonces se rechaza | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:213 |
| CA-ONB-13 | RF-ONB-011; RN-ONB-023 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:214 |
| CA-ONB-14 | RN-ONB-020 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/onboarding-offboarding.md:215 |
| CA-ONB-15 | RF-ONB-012 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/onboarding-offboarding.md:216 |

### POR · Portal de autoservicio (16)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-POR-01 | RF-POR-001, 002, 003, 005; RN-POR-001 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:216 |
| CA-POR-02 | aislamiento entre empresas)** (RN-POR-002; RNF-POR-007 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/portal-autoservicio.md:217 |
| CA-POR-03 | aislamiento entre Personas)** (RN-POR-001, 002; RNF-POR-003 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/portal-autoservicio.md:218 |
| CA-POR-04 | permiso denegado)** (RF-POR-006, 007, 016; RN-POR-018 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:219 |
| CA-POR-05 | RF-POR-002; RN-POR-011, 022; RNF-POR-008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:220 |
| CA-POR-06 | RF-POR-004; RN-POR-011 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:221 |
| CA-POR-07 | RF-POR-013, 014, 017; RN-POR-005, 007 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:222 |
| CA-POR-08 | RF-POR-014; RN-POR-007 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:223 |
| CA-POR-09 | RN-POR-004 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/portal-autoservicio.md:224 |
| CA-POR-10 | RF-POR-009, 010, 015; RN-POR-009 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:225 |
| CA-POR-11 | RF-POR-008; RN-POR-008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:226 |
| CA-POR-12 | RF-POR-011; RN-POR-020 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:227 |
| CA-POR-13 | RN-POR-003 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/portal-autoservicio.md:228 |
| CA-POR-14 | Fase 3)** (RF-POR-012; RN-POR-014, 015 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:229 |
| CA-POR-15 | RF-POR-011; RN-POR-011 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:230 |
| CA-POR-16 | RF-POR-013; RN-POR-016 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:231 |

### PRB · Gestión de problemas (17)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-PRB-01 | RF-PRB-001, RF-PRB-002, RF-PRB-003, RN-PRB-003, RNF-PRB-006 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/gestion-problemas.md:219 |
| CA-PRB-02 | RF-PRB-003, RN-PRB-002 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:221 |
| CA-PRB-03 | RF-PRB-016, RN-PRB-001, RN-PRB-018, RNF-PRB-004, RNF-PRB-007; aislamiento entre empresas | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:223 |
| CA-PRB-04 | RF-PRB-015, RNF-PRB-001; permiso denegado | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/gestion-problemas.md:225 |
| CA-PRB-05 | RF-PRB-006, RF-PRB-007, RF-PRB-008, RN-PRB-004 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:227 |
| CA-PRB-06 | RF-PRB-009, RN-PRB-005, RN-PRB-009, RNF-PRB-002 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:229 |
| CA-PRB-07 | RF-PRB-010, RF-PRB-011, RN-PRB-006, RN-PRB-007 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/gestion-problemas.md:231 |
| CA-PRB-08 | RF-PRB-011, RN-PRB-006 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:233 |
| CA-PRB-09 | RF-PRB-012, RF-PRB-018, RN-PRB-008, RN-PRB-011 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:235 |
| CA-PRB-10 | RF-PRB-004, RF-PRB-005, RN-PRB-017, RNF-PRB-003 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/gestion-problemas.md:237 |
| CA-PRB-11 | RF-PRB-014, RN-PRB-010 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:239 |
| CA-PRB-12 | RF-PRB-013, RN-PRB-012, RN-PRB-013, RN-PRB-014 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:241 |
| CA-PRB-13 | RN-PRB-009 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/gestion-problemas.md:243 |
| CA-PRB-14 | RF-PRB-017, RN-PRB-016, RN-PRB-019, RN-PRB-020, RNF-PRB-005 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:245 |
| CA-PRB-15 | RN-PRB-015 | - | Fase 3 | - | unitaria | no (bloquea su módulo) | Etapa heredada del módulo | modulos/gestion-problemas.md:247 |
| CA-PRB-16 | RNF-PRB-008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:249 |
| CA-PRB-17 | RN-PRB-021, RF-PRB-009; permiso denegado | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/gestion-problemas.md:251 |

### PRE · Presupuesto y costos (26)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-PRE-01 | Una moneda y numeración.** *Cubre RF-PRE-001, RN-PRE-001, 002, 039 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:271 |
| CA-PRE-02 | Aprobación con otra persona.** *Cubre RF-PRE-003, RF-PRE-004, RN-PRE-005, 007, 008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:272 |
| CA-PRE-03 | Costo desde la recepción.** *Cubre RF-PRE-005 a 008, RN-PRE-010 a 012, 035 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:273 |
| CA-PRE-04 | Reversión.** *Cubre RF-PRE-009, RN-PRE-009 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:274 |
| CA-PRE-05 | Varias monedas.** *Cubre RF-PRE-023, 024, RN-PRE-003, 004 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:275 |
| CA-PRE-06 | Alerta única.** *Cubre RF-PRE-014, RN-PRE-017, 018, RNF-PRE-003 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:276 |
| CA-PRE-07 | Aviso en la aprobación de OC.** *Cubre RF-PRE-015, RN-PRE-019 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:277 |
| CA-PRE-08 | Depreciación exacta.** *Cubre RF-PRE-020, 021, RN-PRE-020, 021, 024, 028, RNF-PRE-006 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:278 |
| CA-PRE-09 | Cierre de periodo.** *Cubre RF-PRE-016, RN-PRE-015, 016, 025, 031, RNF-PRE-004 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:279 |
| CA-PRE-10 | Aislamiento entre empresas.** *Cubre RN-PRE-030, RNF-PRE-008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:280 |
| CA-PRE-11 | Permiso denegado.** *Cubre la sección 3, RN-PRE-036 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:281 |
| CA-PRE-12 | Precios ocultos.** *Cubre la sección 3 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:282 |
| CA-PRE-13 | Baja y reingreso.** *Cubre RN-PRE-022, 023 | - | Fase 3 | - | unitaria | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:283 |
| CA-PRE-14 | Fuente única.** *Cubre RF-PRE-010, 011, 025, RN-PRE-013 | Fase 3 | Fase 3 | - | manual (con apoyo de integración) | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:284 |
| CA-PRE-15 | Segunda persona en gasto manual.** *Cubre RF-PRE-012, 013, RN-PRE-007, 014, 029 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:285 |
| CA-PRE-16 | Interruptor.** *Cubre RN-PRE-006 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:286 |
| CA-PRE-17 | Procesos con dos empresas.** *Cubre RN-PRE-034, RF-PRE-011, RNF-PRE-008 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:287 |
| CA-PRE-18 | Naturaleza.** *Cubre RF-PRE-022, RN-PRE-026, 027 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:288 |
| CA-PRE-19 | Rendimiento.** *Cubre RF-PRE-026, RNF-PRE-001 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:289 |
| CA-PRE-20 | Moneda base.** *Cubre RN-PRE-033 | - | Fase 3 | - | unitaria | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:290 |
| CA-PRE-21 | Copia.** *Cubre RF-PRE-002 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:291 |
| CA-PRE-22 | Proyección.** *Cubre RF-PRE-017 a 019 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/presupuesto-costos.md:292 |
| CA-PRE-23 | Corrección de costo.** *Cubre RN-PRE-032 | - | Fase 3 | - | unitaria | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:293 |
| CA-PRE-24 | Texto libre.** *Cubre RN-PRE-037 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:294 |
| CA-PRE-25 | Exportación.** *Cubre RN-PRE-038 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:295 |
| CA-PRE-26 | Cese del responsable.** *Cubre RN-PRE-040 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/presupuesto-costos.md:296 |

### PRS · Personas y ubicaciones (32)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-PRS-01a | RF-PRS-001, 005, 010; RN-PRS-001, 004; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:227 |
| CA-PRS-01b | RF-PRS-001; RN-PRS-001; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:228 |
| CA-PRS-01c | RF-PRS-006; Etapa 2 | Etapa 2 | Etapa 2 | - | navegador | sí |  | modulos/personas-ubicaciones.md:229 |
| CA-PRS-01d | RF-PRS-001; RN-PRS-006; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí | La tabla del criterio dice Etapa 2 y la prueba es el alta manual con homónimo; el requisito RF-PER-010 dice «importación en Etapa 4», que prueba CA-PRS-11. · Etapa del requisito leída por QA: Prueba el alta manual con homónimo; la importación la prueba CA-PRS-11. | modulos/personas-ubicaciones.md:230 |
| CA-PRS-02 | RF-PRS-001; RN-PRS-005 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:231 |
| CA-PRS-03a | RF-PRS-004, 011; RN-PRS-008; Etapa 2 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | modulos/personas-ubicaciones.md:232 |
| CA-PRS-03b | RF-PRS-017, RF-INV-029; RN-PRS-008; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/personas-ubicaciones.md:233 |
| CA-PRS-03c | RF-INV-029; RN-PRS-008; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí | Tipo ajustado por QA: Consulta de pérdidas contra la base. | modulos/personas-ubicaciones.md:234 |
| CA-PRS-04 | RF-PRS-011, 017; RN-PRS-011, 012 | Etapa 2 | Etapa 4 | - | unitaria | sí | Arranca después de su requisito · Corre en Etapa 4; el rechazo de anonimizar con pendientes de la Etapa 2 (sin equipos) lo cubre CA-052b1. | modulos/personas-ubicaciones.md:235 |
| CA-PRS-05 | RF-PRS-011; RN-PRS-011 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:236 |
| CA-PRS-06 | permiso denegado)** (RF-PRS-015; RN-PRS-020 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | modulos/personas-ubicaciones.md:237 |
| CA-PRS-07 | RF-PRS-003; RN-PRS-032 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | modulos/personas-ubicaciones.md:238 |
| CA-PRS-08a | RF-PRS-007; RN-PRS-024; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí | Tipo ajustado por QA: El ciclo en el árbol de ubicaciones se detecta con la consulta recursiva de PostgreSQL. | modulos/personas-ubicaciones.md:239 |
| CA-PRS-08b | RF-PRS-007; RN-PRS-024; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:240 |
| CA-PRS-08c | RF-INV-027; RN-PRS-024; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/personas-ubicaciones.md:241 |
| CA-PRS-08d | RF-PRS-008; Etapa 2 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | modulos/personas-ubicaciones.md:242 |
| CA-PRS-09 | RF-PRS-009; RN-PRS-014 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | modulos/personas-ubicaciones.md:243 |
| CA-PRS-10 | RF-PRS-013; RN-PRS-017 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | modulos/personas-ubicaciones.md:244 |
| CA-PRS-11 | RF-PRS-014 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito · Importar Personas es de la Etapa 4 (RF-PER-010 con importación). El alta manual con homónimo ya es CA-PRS-01d (Etapa 2). | modulos/personas-ubicaciones.md:245 |
| CA-PRS-12a | RF-INV-013; RN-PRS-013; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí | Tipo ajustado por QA: La asignación rechazada pasa por la base y la regla de estado de la Persona. | modulos/personas-ubicaciones.md:246 |
| CA-PRS-12b | RF-PRS-012; RN-PRS-016; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí | Tipo ajustado por QA: Reactivar conserva la referencia y el historial en la base. | modulos/personas-ubicaciones.md:247 |
| CA-PRS-12c | RF-INV-013; RN-PRS-013; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/personas-ubicaciones.md:248 |
| CA-PRS-12d | RF-PRS-012; RN-PRS-016; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí | Tipo ajustado por QA: Rechazo guardado y verificado en la base. | modulos/personas-ubicaciones.md:249 |
| CA-PRS-13 | RF-PRS-002; RN-PRS-018 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:250 |
| CA-PRS-14a | RF-PRS-015; RN-PRS-018, 020; Etapa 2 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | modulos/personas-ubicaciones.md:251 |
| CA-PRS-14b | RF-PRS-015; RNF-PRS-009; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:252 |
| CA-PRS-14c | RF-PRS-015; RN-PRS-018; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:253 |
| CA-PRS-14d | RF-INV-015; RN-PRS-018; Etapa 4 | Etapa 4 | Etapa 4 | - | integración | sí | Tipo ajustado por QA: Historial de asignaciones tras anonimizar, contra la base. | modulos/personas-ubicaciones.md:254 |
| CA-PRS-14e | RF-DAT-006, 011; RN-PRS-021; Etapa 4 | Etapa 4 | Etapa 4 | - | integración + navegador | sí | Tipo ajustado por QA: Se imprime el acta (PDF) con el reloj en `retener_hasta`. | modulos/personas-ubicaciones.md:255 |
| CA-PRS-14f | RF-PRS-015; RN-PRS-019; Etapa 2 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:256 |
| CA-PRS-15 | aislamiento)** (RF-PRS-016; RN-PRS-028, 030 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:257 |
| CA-PRS-16 | RN-PRS-004; RF-PRS-001 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:258 |

### PRV · Proveedores y contratos (26)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-PRV-01 | RF-PRV-001 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:254 |
| CA-PRV-02a | RF-PRV-007, RN-PRV-032 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | modulos/proveedores-contratos.md:255 |
| CA-PRV-02b | RF-PRV-019, RN-PRV-032 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:256 |
| CA-PRV-02c | RF-PRV-019, RN-PRV-032 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:257 |
| CA-PRV-03 | RF-PRV-001, 002, 005 | Etapa 2 | Etapa 2 | - | navegador | sí |  | modulos/proveedores-contratos.md:258 |
| CA-PRV-04a | RF-PRV-003, RN-PRV-005 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:259 |
| CA-PRV-04b | RN-PRV-004 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo · Tipo ajustado por QA: Necesita un contrato Vigente en la base (Fase 2). | modulos/proveedores-contratos.md:260 |
| CA-PRV-04c | RF-PRV-003 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:261 |
| CA-PRV-05 | RF-PRV-008, 010, 023 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:262 |
| CA-PRV-06 | RF-PRV-010, RN-PRV-015 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:263 |
| CA-PRV-07 | RF-PRV-011, 015, 027 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:264 |
| CA-PRV-08 | RF-PRV-012 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:265 |
| CA-PRV-09 | RF-PRV-016, 017, 018 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:266 |
| CA-PRV-10 | RF-PRV-022, 024 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:267 |
| CA-PRV-11 | RF-PRV-021 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:268 |
| CA-PRV-12 | RF-PRV-020, 025, 026 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:269 |
| CA-PRV-13 | RF-PRV-014, RN-PRV-019 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:270 |
| CA-PRV-14 | RN-PRV-041, 036 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/proveedores-contratos.md:271 |
| CA-PRV-15 | RF-PRV-004, RN-PRV-037 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:272 |
| CA-PRV-16 | RF-PRV-006, RN-PRV-034 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:273 |
| CA-PRV-17 | RN-PRV-042 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:274 |
| CA-PRV-18 | RF-PRV-013, RN-PRV-040 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:275 |
| CA-PRV-19 | RN-PRV-015 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:276 |
| CA-PRV-20 | RF-PRV-002, RN-PRV-039 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:277 |
| CA-PRV-21 | RF-PRV-028 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:278 |
| CA-PRV-22 | RF-PRV-029, RN-PRV-043 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:279 |

### REP · Reportes y tableros (22)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-REP-01 | Cifra coherente.** *Cubre RF-REP-003, 004, 020, 023, RN-REP-026, 030, 031, RNF-REP-004 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/reportes-tableros.md:285 |
| CA-REP-02 | Garantías por vencer.** *Cubre RF-REP-007, RN-REP-020, 043 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/reportes-tableros.md:286 |
| CA-REP-03 | Tasa de asignación.** *Cubre RN-REP-034 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/reportes-tableros.md:287 |
| CA-REP-04 | Aislamiento entre empresas.** *Cubre RN-REP-001, RF-REP-002, 011, 024 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/reportes-tableros.md:288 |
| CA-REP-05 | Exportar sin permiso.** *Cubre RF-REP-013, RN-REP-005, 008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/reportes-tableros.md:289 |
| CA-REP-06 | Auditoría de exportación.** *Cubre RF-REP-014, 015, RN-REP-007, 061 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/reportes-tableros.md:290 |
| CA-REP-07 | Columnas omitidas.** *Cubre RN-REP-003, 004, 024 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/reportes-tableros.md:291 |
| CA-REP-08 | Fórmulas.** *Cubre RF-REP-013, RN-REP-006 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/reportes-tableros.md:292 |
| CA-REP-09 | Límites.** *Cubre RF-REP-022, RN-REP-009, 011, RNF-REP-003 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/reportes-tableros.md:293 |
| CA-REP-10 | SLA sin recalcular.** *Cubre RF-REP-009, RN-REP-022, 053, 054 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/reportes-tableros.md:294 |
| CA-REP-11 | Programación.** *Cubre RF-REP-016 a 018, RN-REP-012 a 017, 062, RNF-REP-005 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/reportes-tableros.md:295 |
| CA-REP-12 | Costos por moneda.** *Cubre RF-REP-001, 008, 021, RN-REP-021, 047, 050 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/reportes-tableros.md:296 |
| CA-REP-13 | Licencias.** *Cubre RF-REP-010, RN-REP-057, 058 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/reportes-tableros.md:297 |
| CA-REP-14 | Ciclo de vida con copia de parámetros.** *Cubre RF-REP-006, RN-REP-023, 029, 037, 039, 040 | Fase 3 | Fase 3 | - | unitaria | no (bloquea su módulo) |  | modulos/reportes-tableros.md:298 |
| CA-REP-15 | Vistas guardadas.** *Cubre RF-REP-012, RN-REP-025 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/reportes-tableros.md:299 |
| CA-REP-16 | Foto mensual.** *Cubre RF-REP-019, RN-REP-018, 019 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/reportes-tableros.md:300 |
| CA-REP-17 | Procesos y rendimiento con dos empresas.** *Cubre RF-REP-023, RN-REP-027, 059, RNF-REP-001, 002, 007 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/reportes-tableros.md:301 |
| CA-REP-18 | Cruce de módulos sin permiso.** *Cubre RN-REP-002 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/reportes-tableros.md:302 |
| CA-REP-19 | Topes.** *Cubre RN-REP-010 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/reportes-tableros.md:303 |
| CA-REP-20 | Casos restringidos.** *Cubre RN-REP-028, 052 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/reportes-tableros.md:304 |
| CA-REP-21 | Módulo apagado.** *Cubre RN-REP-060 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/reportes-tableros.md:305 |
| CA-REP-22 | Accesibilidad.** *Cubre RNF-REP-006 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/reportes-tableros.md:306 |

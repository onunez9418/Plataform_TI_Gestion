# Criterios de aceptación por etapa

**Autor:** QA (qa-tester) · **Fecha:** 2026-10-26 · **Checkpoint:** commit `f25fddc` (con cambios sin guardar en los documentos fuente) · **Fuente:** `docs/documento-funcional.md` v0.3 (secciones 21, 22 y 22.1; AN-01 a AN-15; D-065 a D-076), `docs/registro-permisos.md` v1.1 y los 17 módulos de `docs/modulos/` en v0.3. Generado con `docs/calidad/herramientas/generar.py` (lectura de solo lectura; no se editó ningún documento fuente). Todas las cifras de este archivo valen para ese commit; si el documento cambia, se vuelve a generar.

**Para qué sirve.** Lista única de todos los criterios CA, con el módulo, los requisitos que cubre, la etapa en que se ejecutan, el tipo de prueba y si bloquean. Reemplaza a la versión del 2026-10-25 (424 criterios sobre el documento v0.3 sin partir). Para el núcleo, la etapa sale **de la tabla 22.1 del documento funcional** (la fijó el Analista, D-075); para los módulos, de los requisitos que cada criterio cubre, salvo donde el módulo trae su propia tabla (notificaciones) o donde QA leyó el texto (anotado en la columna Nota).

## Cómo leer las columnas

- **Cubre:** la cabecera del criterio, tal como la escribió el Analista o el escuadrón.
- **Etapa del requisito:** la más temprana entre los requisitos que cubre. **Se ejecuta en:** la etapa en que el criterio **empieza** a correr. **Se completa en:** la etapa posterior en que ya existe todo lo que necesita (solo cuando 22.1 o el módulo lo dicen).
- **Tipo:** unitaria (reglas y cálculos sin base de datos); integración (base real, servidor, permisos, concurrencia, reloj, correo); navegador (Playwright: pantallas, PDF); manual (personas o ensayo, con apoyo automático donde se pueda). Es una clasificación hecha con palabras del texto del criterio; QA la afina al escribir cada prueba.
- **Bloqueante:** sí = si falla, la etapa no se aprueba. "No (bloquea su módulo)" = es de Fase 2 o 3 y bloquea la entrega de ese módulo, no la v1 (D-056).
- **Etapa heredada:** el criterio solo cita reglas RN y no hay fila RF que lo cite; tomó la etapa más frecuente de su módulo. Debe confirmarlo el escuadrón.

## Resumen (checkpoint f25fddc, 2026-10-26)

**450 criterios:** 115 del núcleo (identificadores con letra, que son 93 números, CA-001 a CA-093) y 335 de los 17 módulos. El 2026-10-25 eran 424 (93 y 331). Qué cambió: el Analista agregó CA-083 a CA-093 y partió CA-016, CA-040, CA-052a y b, CA-054, CA-060, CA-064 y CA-065 (CA-040 en CA-040a y CA-040b; ya no existe CA-040 sin letra); los escuadrones partieron CA-NOT-05 y CA-NOT-07 y agregaron un criterio a gestión de cambios y otro a gestión de problemas.

| Se ejecuta en | Criterios que empiezan aquí | Criterios que se completan aquí (empezaron antes) |
|---|---|---|
| Etapa 0 | 0 | 0 |
| Etapa 1 | 52 | 0 |
| Etapa 2 | 37 | 2 |
| Etapa 3 | 4 | 1 |
| Etapa 4 | 43 | 10 |
| Etapa 5 | 24 | 5 |
| Etapa 6 | 2 | 2 |
| Etapa 7 | 3 | 0 |
| Fase 2 | 134 | 5 |
| Fase 3 | 151 | 0 |
| **Total** | 450 | 25 |

**Criterios de la v1 (Etapas 0 a 7): 165.** De fases posteriores: 285. Antes (2026-10-25): 139 y 285.

Comparación con la versión anterior (2026-10-25). **Ojo, no es la misma medida:** la versión anterior contaba cada criterio en la etapa donde "se ejecuta completo" (la más tardía); esta cuenta dónde **empieza** y, aparte, dónde **termina**. La comparable con la anterior es la última columna.

| Etapa | Antes (completo) | Ahora (empiezan) | Ahora (terminan) |
|---|---|---|---|
| Etapa 1 | 30 | 52 | 38 |
| Etapa 2 | 26 | 37 | 32 |
| Etapa 3 | 3 | 4 | 3 |
| Etapa 4 | 47 | 43 | 53 |
| Etapa 5 | 26 | 24 | 28 |
| Etapa 6 | 3 | 2 | 3 |
| Etapa 7 | 4 | 3 | 3 |
| Fase 2 | 136 | 134 | 139 |
| Fase 3 | 149 | 151 | 151 |

Qué explica la diferencia: el Analista y los escuadrones agregaron 26 criterios (CA-083 a CA-093 y las particiones), y la tabla 22.1 hace empezar en la Etapa 1 varios criterios que antes se contaban completos más tarde (por ejemplo CA-001, CA-011a y b, CA-041, CA-045, CA-048, CA-069, CA-071 y CA-074). Por eso la columna "empiezan" de las Etapas 4 y 5 baja: parte de lo que allí se completa ya empezó antes.

Por la etapa más temprana de su requisito:

| Etapa más temprana del requisito | Criterios |
|---|---|
| Etapa 0 | 3 |
| Etapa 1 | 60 |
| Etapa 2 | 44 |
| Etapa 3 | 4 |
| Etapa 4 | 31 |
| Etapa 5 | 16 |
| Etapa 6 | 2 |
| Etapa 7 | 1 |
| Fase 2 | 114 |
| Fase 3 | 118 |
| sin requisito RF (heredada) | 57 |

| Tipo de prueba | Criterios |
|---|---|
| integración | 251 |
| unitaria | 82 |
| integración + navegador | 70 |
| navegador | 39 |
| manual (con apoyo de integración) | 8 |

| Módulo | Criterios |
|---|---|
| Mesa de ayuda (AYU) | 27 |
| Gestión de cambios (CAM) | 20 |
| CMDB ligera (CMD) | 21 |
| Dominios y certificados (DOM) | 14 |
| Entregas y devoluciones (ENT) | 15 |
| Garantías y mantenimiento (GAR) | 20 |
| Integraciones y API (INT) | 26 |
| Licencias de software (LIC) | 20 |
| Líneas móviles (LIN) | 16 |
| Notificaciones (NOT) | 22 |
| Onboarding y offboarding (ONB) | 15 |
| Portal de autoservicio (POR) | 16 |
| Gestión de problemas (PRB) | 17 |
| Presupuesto y costos (PRE) | 26 |
| Personas y ubicaciones (PRS) | 16 |
| Proveedores y contratos (PRV) | 22 |
| Reportes y tableros (REP) | 22 |
| Núcleo | 115 |

### Lo que cada etapa exige (D-076)

Bloqueantes de una etapa = los criterios que **empiezan** en ella más los que **se completan** en ella. Un criterio bloqueante que no se pueda ejecutar deja la etapa sin aprobar. "Antes de abrir" = criterios que D-076 exige tener redactados antes de que la etapa empiece; el detalle por requisito está en `docs/trazabilidad.md`.

| Etapa | Empiezan | Se completan | Bloqueantes en total | Puntos de D-076 aún pendientes antes de abrirla |
|---|---|---|---|---|
| Etapa 1 | 52 | 0 | 52 | 3 |
| Etapa 2 | 37 | 2 | 39 | 1 |
| Etapa 3 | 4 | 1 | 5 | 0 |
| Etapa 4 | 43 | 10 | 53 | 4 |
| Etapa 5 | 24 | 5 | 29 | 2 |
| Etapa 6 | 2 | 2 | 4 | 0 |
| Etapa 7 | 3 | 0 | 3 | 1 |

### Criterios que NO corren en la etapa de su requisito (40)

Dos casos distintos. **(A) Corren antes de lo que necesitan: 4.** Es un defecto del criterio: no se puede ejecutar. **(B) Arrancan después de la etapa más temprana de su requisito: 36.** El requisito se entrega antes de que su criterio corra; la etapa de ese requisito se cierra sin esa prueba. Muchos son consecuencia legítima de que el criterio necesita un módulo posterior (órdenes, activos, actas); aun así, el Gerente de TI debe saberlo al cerrar la etapa.

**(A) Corren antes:**

| Criterio | Corre en | Sus requisitos llegan hasta | Qué hay que corregir |
|---|---|---|---|
| CA-024 | Etapa 4 | Etapa 7 | Cubre RF-OC-028 (Etapa 7) y corre en Etapa 4: o se saca RF-OC-028 de su cabecera o se parte. |
| CA-082 | Etapa 1 | Etapa 4 | La cabecera dice "(RF-ACC-018, RF-INV-008 en CA-082b)": parece cubrir RF-INV-008 (Etapa 4) en una etapa 1. Dejar solo RF-ACC-018. |
| CA-NOT-10 | Etapa 1 | Fase 2 | La tabla del módulo lo pone en Etapa 1 pero cubre requisitos de Fase 2 (rebotes y bandeja). El escuadrón C debe decir qué parte corre en Etapa 1. |
| CA-NOT-13 | Etapa 1 | Fase 2 | Igual que CA-NOT-10: cubre requisitos de Fase 2 (campana de no leídas). |

**(B) Arrancan después:**

| Criterio | Módulo | Etapa del requisito | Arranca en | Por qué |
|---|---|---|---|---|
| CA-012 | Núcleo | Etapa 1 | Etapa 5 | RF-ROL-009: Etapa 1; el criterio arranca en Etapa 5. Necesita órdenes de compra (Etapa 5). Hasta entonces "quien crea no aprueba" solo se prueba por la matriz (CA-011a) y CA-010. |
| CA-016b | Núcleo | Etapa 2 | Etapa 4 | RF-PER-001: Etapa 2; el criterio arranca en Etapa 4. Necesita registrar una entrega de equipo (Etapa 4). |
| CA-019 | Núcleo | Etapa 2 | Etapa 3 | RF-CAT-011: Etapa 2; el criterio arranca en Etapa 3 |
| CA-020 | Núcleo | Etapa 2 | Etapa 3 (se completa en Etapa 5) | RF-CAT-002, RF-CAT-010, RF-CAT-012: Etapa 2; el criterio arranca en Etapa 3 |
| CA-023 | Núcleo | Etapa 3 | Etapa 4 | RF-SKU-009: Etapa 3; el criterio arranca en Etapa 4 |
| CA-032 | Núcleo | Etapa 2 | Etapa 5 | RF-CAT-005: Etapa 2; el criterio arranca en Etapa 5 |
| CA-036 | Núcleo | Etapa 4 | Etapa 5 | RF-INV-007: Etapa 4; el criterio arranca en Etapa 5 |
| CA-038 | Núcleo | Etapa 0 | Etapa 4 | RF-IMP-017: Etapa 0; el criterio arranca en Etapa 4. RF-IMP-017 es una condición documental de la Etapa 0; la importación se prueba cuando existe (Etapa 4). |
| CA-042 | Núcleo | Etapa 1 | Etapa 2 (se completa en Etapa 4) | RF-AUD-006: Etapa 1; el criterio arranca en Etapa 2 |
| CA-046 | Núcleo | Etapa 1 | Etapa 4 | RNF-002: Etapa 1; el criterio arranca en Etapa 4 |
| CA-052a2 | Núcleo | Etapa 2 | Etapa 4 | RF-PER-006: Etapa 2; el criterio arranca en Etapa 4 |
| CA-052b2 | Núcleo | Etapa 2 | Etapa 4 | RF-PER-006, RF-PER-013: Etapa 2; el criterio arranca en Etapa 4 |
| CA-052c | Núcleo | Etapa 1 | Etapa 2 | RF-USR-001, RF-USR-003: Etapa 1; el criterio arranca en Etapa 2 |
| CA-053 | Núcleo | Etapa 0 | Etapa 7 | RNF-017: Etapa 0; el criterio arranca en Etapa 7. Existe como plan desde la Etapa 0 y se ejecuta en la Etapa 7. El ensayo de restauración previo a la Etapa 1 (CI-17) cubre una parte. |
| CA-054a | Núcleo | Etapa 1 | Etapa 2 | RF-AUD-014: Etapa 1; el criterio arranca en Etapa 2 |
| CA-054b | Núcleo | Etapa 2 | Etapa 4 | RF-PER-014: Etapa 2; el criterio arranca en Etapa 4 |
| CA-054c | Núcleo | Etapa 1 | Etapa 7 | RF-USR-006: Etapa 1; el criterio arranca en Etapa 7. RF-USR-006 está mal citado (ver trazabilidad); la restauración de un respaldo es de la Etapa 7. |
| CA-057 | Núcleo | Etapa 1 | Fase 3 | RF-ROL-002: Etapa 1; el criterio arranca en Fase 3. Portal de autoservicio (Fase 3). |
| CA-061 | Núcleo | Etapa 3 | Etapa 5 | RF-SKU-010: Etapa 3; el criterio arranca en Etapa 5 |
| CA-064b | Núcleo | Etapa 2 | Etapa 4 | RF-CAT-027: Etapa 2; el criterio arranca en Etapa 4 |
| CA-065b | Núcleo | Etapa 2 | Etapa 4 | RF-CAT-012, RF-CAT-029: Etapa 2; el criterio arranca en Etapa 4 |
| CA-067 | Núcleo | Etapa 1 | Etapa 2 | RF-PLA-010: Etapa 1; el criterio arranca en Etapa 2 |
| CA-073 | Núcleo | Etapa 0 | Etapa 1 | RF-DAT-010: Etapa 0; el criterio arranca en Etapa 1. La infraestructura del nombre canario es de la Etapa 0; el criterio corre cuando hay Personas de prueba (Etapa 1). |
| CA-081b | Núcleo | Etapa 2 | Etapa 4 | RF-PER-006: Etapa 2; el criterio arranca en Etapa 4 |
| CA-093 | Núcleo | Etapa 1 | Etapa 2 | RF-ACC-025: Etapa 1; el criterio arranca en Etapa 2. La tarea "Designar suplente" aparece en Primeros pasos (Etapa 1), pero depende del registro de derechos de datos (RF-PER-012, Etapa 2). |
| CA-GAR-01 | Garantías y mantenimiento | Etapa 4 | Etapa 5 | RF-GAR-002, RF-GAR-005: Etapa 4; el criterio arranca en Etapa 5 |
| CA-GAR-04 | Garantías y mantenimiento | Etapa 4 | Fase 2 | RF-GAR-003, RF-GAR-006, RF-GAR-008: Etapa 4; el criterio arranca en Fase 2 |
| CA-LIN-09 | Líneas móviles | Fase 2 | Fase 3 | RF-LIN-014, RNF-LIN-001, RNF-LIN-006: Fase 2; el criterio arranca en Fase 3 |
| CA-NOT-01 | Notificaciones | Etapa 1 | Etapa 5 | RF-NOT-013, RF-NOT-020: Etapa 1; el criterio arranca en Etapa 5. El módulo lo fija en Etapa 5 porque necesita órdenes de compra; el envío base (RF-NOT-013) es de Etapa 1 y se prueba con CA-NOT-12 y CA-NOT-14. |
| CA-NOT-07a | Notificaciones | Etapa 1 | Etapa 5 | RF-NOT-013: Etapa 1; el criterio arranca en Etapa 5. Igual que CA-NOT-01: necesita órdenes de compra. |
| CA-NOT-11 | Notificaciones | Etapa 1 | Fase 2 | RF-NOT-015, RF-NOT-017: Etapa 1; el criterio arranca en Fase 2 |
| CA-NOT-20 | Notificaciones | Etapa 1 | Etapa 5 | RF-ACC-021, RF-NOT-007, RF-NOT-013: Etapa 1; el criterio arranca en Etapa 5. Igual que CA-NOT-01: necesita órdenes de compra. |
| CA-PRS-03 | Personas y ubicaciones | Etapa 2 | Etapa 4 | RF-PRS-004, RF-PRS-011: Etapa 2; el criterio arranca en Etapa 4. Pide una laptop asignada (Etapa 4); RF-PRS-011 es de Etapa 2. Propuesta al escuadrón D: partir en 03a (cese sin recursos, Etapa 2; lo cubre hoy CA-052a1 del núcleo) y 03b (con laptop, Etapa 4). |
| CA-PRS-04 | Personas y ubicaciones | Etapa 2 | Etapa 4 | RF-PRS-011: Etapa 2; el criterio arranca en Etapa 4 |
| CA-PRV-02 | Proveedores y contratos | Etapa 2 | Fase 2 | RF-PRV-007: Etapa 2; el criterio arranca en Fase 2 |
| CA-PRV-04 | Proveedores y contratos | Etapa 2 | Fase 2 | RF-PRV-003: Etapa 2; el criterio arranca en Fase 2. Necesita un contrato Vigente (PRV-B, Fase 2); RF-PRV-003 es de Etapa 2. Propuesta al escuadrón A: 04a (Etapa 2) desactivar y reactivar un proveedor con motivo y auditoría; 04b (Fase 2) rechazo por contrato Vigente. |

### Criterios de módulos que cruzan etapas y esperan que su escuadrón los parta (10)

Cubren requisitos de etapas distintas y el módulo no trae partición. Corren en la etapa más tardía (la única donde existe todo lo que piden). Solo los de módulos con parte en la v1 (PRS, ENT, PRV, GAR, NOT) afectan a una etapa de la v1; el resto cruza Fase 2 y Fase 3 (D-076.4: se cierra al activar el módulo).

| Criterio | Requisitos de | Corre en | Propuesta de QA |
|---|---|---|---|
| CA-GAR-01 | Etapa 4 a Etapa 5 | Etapa 5 | Corre en Etapa 5 (recepción). La ficha de garantía de un activo importado (RF-GAR-002, Etapa 4) se prueba con CA-GAR-15 y CA-082b mientras tanto. |
| CA-GAR-04 | Etapa 4 a Fase 2 | Fase 2 | Partir: 04a (Etapa 4) garantía del fabricante Vigente y Vencida al mover el reloj, sin proceso (prueba también RN-018); 04b (Fase 2) garantía extendida y efectiva. |
| CA-LIN-09 | Fase 2 a Fase 3 | Fase 3 | Fase 2 a Fase 3: se cierra al activar el módulo |
| CA-NOT-01 | Etapa 1 a Etapa 5 | Etapa 5 |  |
| CA-NOT-10 | Etapa 1 a Fase 2 | Etapa 1 |  |
| CA-NOT-11 | Etapa 1 a Fase 2 | Fase 2 |  |
| CA-NOT-13 | Etapa 1 a Fase 2 | Etapa 1 |  |
| CA-NOT-20 | Etapa 1 a Etapa 5 | Etapa 5 |  |
| CA-PRS-04 | Etapa 2 a Etapa 4 | Etapa 4 | Corre en Etapa 4; el rechazo de anonimizar con pendientes de la Etapa 2 (sin equipos) lo cubre CA-052b1. |
| CA-PRV-02 | Etapa 2 a Fase 2 | Fase 2 | Partir: 02a (Etapa 2) un proveedor de B pedido por identificador interno responde "no encontrado"; 02b (Fase 2) lo mismo con el contrato. |

### Criterios que arrancan en una etapa y se completan en otra (25)

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
| CA-PRS-01 | Etapa 2 | Etapa 4 | tabla del módulo o lectura de QA |
| CA-PRS-08 | Etapa 2 | Etapa 4 | tabla del módulo o lectura de QA |
| CA-PRS-12 | Etapa 2 | Etapa 4 | tabla del módulo o lectura de QA |
| CA-PRS-14 | Etapa 2 | Etapa 4 | tabla del módulo o lectura de QA |

### Criterios sin requisito RF que los cite (57)

Citan solo reglas RN, seguridad (RS) o secciones. Los del núcleo (CA-003, CA-051, CA-083, CA-085, CA-086, CA-088) los cita una regla RN o RS y son válidos. Los de módulos heredan la etapa del módulo; confirmar con cada escuadrón.

CA-003, CA-051, CA-083, CA-085, CA-086, CA-088, CA-AYU-26, CA-CAM-07, CA-CMD-15, CA-CMD-16, CA-CMD-17, CA-CMD-19, CA-CMD-20, CA-DOM-08, CA-DOM-14, CA-ENT-05, CA-ENT-09, CA-ENT-14, CA-GAR-14, CA-GAR-18, CA-INT-04, CA-INT-10, CA-INT-21, CA-INT-22, CA-INT-23, CA-LIC-18, CA-LIC-19, CA-LIC-20, CA-LIN-15, CA-LIN-16, CA-NOT-19, CA-ONB-06, CA-ONB-08, CA-ONB-09, CA-ONB-11, CA-ONB-14, CA-POR-02, CA-POR-03, CA-POR-09, CA-POR-13, CA-PRB-13, CA-PRB-15, CA-PRE-11, CA-PRE-12, CA-PRE-13, CA-PRE-16, CA-PRE-20, CA-PRE-23, CA-PRE-24, CA-PRE-25, CA-PRE-26, CA-PRV-14, CA-REP-07, CA-REP-18, CA-REP-19, CA-REP-20, CA-REP-21

### Criterios ambiguos o por partir (H-QA-31, D-076.3)

| Criterio | Corre en | Problema y propuesta de QA |
|---|---|---|
| CA-006 | Etapa 1 | Pide "el mismo tiempo de respuesta" sin tolerancia. Propuesta de QA: diferencia menor a 100 ms en el percentil 95 sobre 200 intentos con correo existente y 200 con correo inexistente. |
| CA-077 | Etapa 1 | Dice "reloj fijado" sin fechas ni datos. Propuesta de QA: reloj R0 2026-11-02 08:00; empresas A (Lima) y B (Ciudad de México) con un vencimiento a 7 días cada una; correr dos veces el mismo día (un solo aviso por empresa); adelantar 3 días sin correr (la corrida siguiente procesa los 3 días en orden); empresa D suspendida se salta. |
| CA-038 | Etapa 4 | Junta ocho aserciones (vista previa, nada se guarda, no confirmar con errores, corregir, deshacer, serie dañada, y las de RF-IMP-008 y 009 que no menciona). D-076.3 pide partirlo. Propuesta de QA: 038a vista previa y todo o nada; 038b deshacer el lote; 038c series dañadas y formatos de fecha; 038d stock inicial y estados. |
| CA-053 | Etapa 7 | Junta diez aserciones (respaldo, restauración con cronómetro, plan de vuelta atrás, manuales, rendimiento, procedimiento de incidente). Propuesta de QA: 053a respaldo y restauración; 053b vuelta atrás; 053c rendimiento (RNF-011); 053d manuales y procedimiento de incidente. |
| CA-ENT-08 | Etapa 4 | "falla la entrega de uno" no dice cómo provocar la falla. Propuesta: el segundo equipo ya está Asignado a otra Persona. |
| CA-ENT-10 | Etapa 4 | "cuando pasa el tiempo" no dice cuánto ni con qué reloj. Propuesta: reloj +30 días y +365 días desde el cese (reloj R5). |
| CA-PRS-14 | Etapa 2 | Dice "cesada hace más de 2 años", pero la anonimización manual por derechos no exige plazo (RN-PRS-020); solo la automática lo exige. Separar el caso manual del automático. |
| CA-PRS-16 | Etapa 2 | Cita RN-PRS-004 (referencia correlativa) cuando prueba el alcance "propio" sin Persona vinculada (regla del registro de permisos). |
| CA-082 | Etapa 1 | La cabecera dice "(RF-ACC-018, RF-INV-008 en CA-082b)": parece cubrir RF-INV-008 (Etapa 4) en una etapa 1. Dejar solo RF-ACC-018. |
| CA-024 | Etapa 4 | Cubre RF-OC-028 (Etapa 7) y corre en Etapa 4: o se saca RF-OC-028 de su cabecera o se parte. |

---

## Detalle por módulo

### Núcleo (documento funcional, sección 22) (115)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-001 | RN-001, RS-10, RS-13, RF-AUD-012, RF-PER-008, RF-CAT-003 | Etapa 1 | Etapa 1 | Etapa 2 | integración | sí |  | documento-funcional.md:928 |
| CA-002 | RN-001, RF-AUD-010 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:929 |
| CA-003 | RS-11 | - | Etapa 1 | - | integración | sí |  | documento-funcional.md:930 |
| CA-004 | RF-ACC-011, RF-ACC-012, RF-DAT-009 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:931 |
| CA-005 | RF-ACC-003, 007, 009, 010 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:932 |
| CA-006 | RF-ACC-001, 004, 005, 017 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:933 |
| CA-007 | RF-ACC-013, 024, RF-PLA-001 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:934 |
| CA-008 | RF-ACC-015, 016, RF-USR-003, RF-ROL-011 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:935 |
| CA-009 | RF-ROL-008, RF-ACC-020 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:936 |
| CA-010 | RF-ROL-007, RF-ACC-008 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:937 |
| CA-011a | RF-ROL-004, 010, 014 | Etapa 1 | Etapa 1 | Etapa 2 | integración + navegador | sí |  | documento-funcional.md:938 |
| CA-011b | RF-ROL-003, 005, PER-009, IMP-013, AUD-007, INV-032 | Etapa 1 | Etapa 1 | Etapa 4 | integración + navegador | sí |  | documento-funcional.md:939 |
| CA-012 | RF-OC-021, 022, 025, RF-ROL-009 | Etapa 1 | Etapa 5 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:940 |
| CA-013 | RF-OC-023, 024 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:941 |
| CA-014 | RF-OC-026 | Etapa 5 | Etapa 5 | - | integración + navegador | sí |  | documento-funcional.md:942 |
| CA-015a | RF-PLA-004, 006 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:943 |
| CA-015b | RF-PLA-005, RF-AUD-017 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:944 |
| CA-015c | RF-PLA-003, RF-ACC-019 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:945 |
| CA-015d | RF-ACC-002, 022, RF-PLA-002 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:948 |
| CA-015e | RF-PLA-011, 012 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:946 |
| CA-015f | RF-PLA-001, 009 | Etapa 1 | Etapa 1 | - | integración | sí | Incluye un paso manual: verificar la identidad por otro medio | documento-funcional.md:947 |
| CA-016a | RF-PER-001 a 003, RF-DAT-001, RF-CAT-024 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:959 |
| CA-016b | RF-PER-001, RF-INV-013 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:960 |
| CA-017 | RF-SKU-001, 002, RF-CAT-007 a 009, 023, 025 | Etapa 2 | Etapa 2 | Etapa 3 | unitaria | sí |  | documento-funcional.md:961 |
| CA-018 | RN-004, RF-SKU-003, 004, RF-OC-003, 046, RF-OS-005 | Etapa 3 | Etapa 3 | Etapa 6 | integración | sí |  | documento-funcional.md:962 |
| CA-019 | RF-SKU-005, 006, RF-CAT-011 | Etapa 2 | Etapa 3 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:963 |
| CA-020 | RF-CAT-002, 010, 012 a 016, 022, RF-SKU-013, 015, 016, RF-OC-039 | Etapa 2 | Etapa 3 | Etapa 5 | unitaria | sí | Arranca después de su requisito | documento-funcional.md:964 |
| CA-021 | RF-CAT-017 a 021 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:965 |
| CA-022 | RF-SKU-007, 008 | Etapa 3 | Etapa 3 | - | integración | sí |  | documento-funcional.md:966 |
| CA-023 | RF-INV-002, 003, 006, RF-SKU-009 | Etapa 3 | Etapa 4 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:975 |
| CA-024 | RF-INV-001, 011, 018, 031, RF-UX-009, RF-OC-028 | Etapa 4 | Etapa 4 | - | integración | sí | Corre antes de lo que necesita | documento-funcional.md:976 |
| CA-025 | RF-INV-013 a 015, 024 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:978 |
| CA-026 | RF-INV-019 a 021 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:979 |
| CA-027 | RF-INV-022 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | documento-funcional.md:980 |
| CA-028 | RF-INV-004 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:981 |
| CA-029 | RF-OC-001, 011 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:993 |
| CA-030 | RF-OC-010, 014, 044 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:994 |
| CA-031 | RF-OC-005, 015, 018 a 020 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:995 |
| CA-032 | RF-OC-002, 004 a 008, 042, 043, RF-SKU-010, 011, RF-CAT-005, RF-INV-023 | Etapa 2 | Etapa 5 | - | unitaria | sí | Arranca después de su requisito | documento-funcional.md:997 |
| CA-033 | RF-OC-029, 035, 036, 040 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:999 |
| CA-034 | RF-OC-030, 031, 033, 037, 038, RNF-005 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:1000 |
| CA-035 | RF-OC-033, 034 | Etapa 5 | Etapa 5 | - | integración + navegador | sí |  | documento-funcional.md:1001 |
| CA-036 | RF-OC-032, RF-INV-007 | Etapa 4 | Etapa 5 | - | unitaria | sí | Arranca después de su requisito | documento-funcional.md:1003 |
| CA-037 | RF-OC-012, 013 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1005 |
| CA-038 | RF-IMP-001 a 010, RF-INV-005 | Etapa 0 | Etapa 4 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:1010 |
| CA-039 | RF-IMP-011, 014, 015, RS-42 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | documento-funcional.md:1012 |
| CA-040a | RF-AUD-001, 002, RN-006; Etapa 1 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:1016 |
| CA-040b | RF-AUD-018, RF-DAT-002; Etapa 7 | Etapa 7 | Etapa 7 | - | manual (con apoyo de integración) | sí |  | documento-funcional.md:1017 |
| CA-041 | RF-AUD-003 a 005, 008, 009, 013, 019, RF-USR-007, RF-ROL-013, RF-PLA-007 | Etapa 1 | Etapa 1 | Etapa 4 | integración | sí |  | documento-funcional.md:1018 |
| CA-042 | RF-CAT-028, RF-SKU-013, 014, RF-AUD-006 | Etapa 1 | Etapa 2 | Etapa 4 | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:971 |
| CA-043 | RF-EXP-005, 006, 007, RNF-006 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | documento-funcional.md:1013 |
| CA-044 | RF-OS-001 a 011, RF-INV-012 | Etapa 6 | Etapa 6 | Fase 2 | unitaria | sí |  | documento-funcional.md:1040 |
| CA-045 | RF-AUD-011, RN-007, RF-USR-002, RF-CAT-004 | Etapa 1 | Etapa 1 | Etapa 5 | integración | sí |  | documento-funcional.md:1020 |
| CA-046 | RF-INV-016, 017, RF-DAT-006, RNF-002 | Etapa 1 | Etapa 4 | - | navegador | sí | Arranca después de su requisito | documento-funcional.md:986 |
| CA-047 | RF-ROL-001, 002, 006, 012, RF-USR-001 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:949 |
| CA-048 | RNF-007, RF-CAT-001, RF-SKU-012, RF-UX-007 | Etapa 1 | Etapa 1 | Etapa 4 | integración | sí |  | documento-funcional.md:1042 |
| CA-049 | RF-ACC-023, RF-DAT-014 | Etapa 1 | Etapa 1 | - | navegador | sí |  | documento-funcional.md:950 |
| CA-050a | RNF-003, 004, RF-UX-010, 012 | Etapa 1 | Etapa 1 | Etapa 4 | navegador | sí | Seguimiento (no bloquea) hasta la etapa en que se completa; bloquea desde allí | documento-funcional.md:1043 |
| CA-050b | RNF-001, 008, RF-UX-001 a 003, 005, 006, 011, RF-ACC-025 | Etapa 1 | Etapa 1 | Etapa 5 | integración + navegador | sí | Seguimiento (no bloquea) hasta la etapa en que se completa; bloquea desde allí | documento-funcional.md:1044 |
| CA-051 | RN-014 | - | Etapa 1 | - | integración | sí |  | documento-funcional.md:1045 |
| CA-052a1 | RF-PER-005, 011 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:1021 |
| CA-052a2 | RF-PER-006 | Etapa 2 | Etapa 4 | - | navegador | sí | Arranca después de su requisito | documento-funcional.md:1022 |
| CA-052b1 | RF-PER-013 | Etapa 2 | Etapa 2 | - | navegador | sí |  | documento-funcional.md:1023 |
| CA-052b2 | RF-PER-006, 013 | Etapa 2 | Etapa 4 | - | unitaria | sí | Arranca después de su requisito | documento-funcional.md:1024 |
| CA-052c | RF-USR-001, 003, 008 | Etapa 1 | Etapa 2 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:1025 |
| CA-052d | RF-USR-005, RF-PER-007 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1026 |
| CA-053 | RNF-010 a 018, RF-DAT-015 | Etapa 0 | Etapa 7 | - | manual (con apoyo de integración) | sí | Arranca después de su requisito | documento-funcional.md:1047 |
| CA-054a | RF-AUD-014, 015, RF-PER-004, 013, 014, RF-DAT-016 | Etapa 1 | Etapa 2 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:1027 |
| CA-054b | RF-DAT-006, 011 | Etapa 2 | Etapa 4 | - | unitaria | sí | Arranca después de su requisito | documento-funcional.md:1028 |
| CA-054c | RF-DAT-003, 005, RF-AUD-016 | Etapa 1 | Etapa 7 | - | manual (con apoyo de integración) | sí | Arranca después de su requisito | documento-funcional.md:1029 |
| CA-055 | RF-OC-015, 016, 017, 047, 048, RF-OS-008 | Etapa 5 | Etapa 5 | Etapa 6 | unitaria | sí |  | documento-funcional.md:996 |
| CA-056 | RF-IMP-004, 005, RF-DAT-004 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1011 |
| CA-057 | RF-IMP-018, RF-ROL-002; Fase 3 | Etapa 1 | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Arranca después de su requisito | documento-funcional.md:1046 |
| CA-058 | RF-INV-009, 010, 024, 028 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | documento-funcional.md:977 |
| CA-059 | RF-INV-025 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:982 |
| CA-060a | RF-CAT-006 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | documento-funcional.md:983 |
| CA-060b | RF-INV-027 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | documento-funcional.md:984 |
| CA-061 | RF-OC-010, 049, 050, RF-SKU-010 | Etapa 3 | Etapa 5 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:1002 |
| CA-062 | RF-OC-032 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:1004 |
| CA-063 | RF-INV-026 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:985 |
| CA-064a | RF-CAT-027 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | documento-funcional.md:967 |
| CA-064b | RF-CAT-027, RF-SKU-013 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:968 |
| CA-065a | RF-CAT-012 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | documento-funcional.md:969 |
| CA-065b | RF-CAT-012, 029 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:970 |
| CA-066 | RF-AUD-010 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:1019 |
| CA-067 | RF-EXP-001 a 004, RF-PLA-010 | Etapa 1 | Etapa 2 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:1014 |
| CA-068 | RF-ACC-006, 026 | Etapa 1 | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:951 |
| CA-069 | RF-ACC-014, RNF-013 | Etapa 1 | Etapa 1 | Etapa 4 | integración | sí |  | documento-funcional.md:952 |
| CA-070 | RF-OC-026, RF-PLA-008 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1006 |
| CA-071 | RF-EMP-001 a 004 | Etapa 1 | Etapa 1 | Etapa 5 | navegador | sí |  | documento-funcional.md:1034 |
| CA-072 | RF-OC-006, 045 | Etapa 5 | Etapa 5 | - | unitaria | sí |  | documento-funcional.md:998 |
| CA-073 | RF-DAT-008, 010, RNF-009 | Etapa 0 | Etapa 1 | - | integración + navegador | sí | Arranca después de su requisito | documento-funcional.md:1030 |
| CA-074 | RF-ACC-021, RF-DAT-012, RF-CAT-026 | Etapa 1 | Etapa 1 | Etapa 5 | integración | sí |  | documento-funcional.md:1031 |
| CA-075 | RF-EMP-005 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:1033 |
| CA-076 | RF-PER-012, RF-DAT-007, 013 | Etapa 2 | Etapa 2 | Fase 2 | integración + navegador | sí |  | documento-funcional.md:1032 |
| CA-077 | RNF-019 a 022, RF-ROL-015 | Etapa 1 | Etapa 1 | Fase 2 | integración | sí |  | documento-funcional.md:1035 |
| CA-078 | RF-OC-009, RS-47, RS-42 | Etapa 5 | Etapa 5 | - | navegador | sí |  | documento-funcional.md:1036 |
| CA-079 | RF-ACC-012 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:953 |
| CA-079b | RF-INV-030 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | documento-funcional.md:987 |
| CA-080 | RF-UX-004 | Etapa 6 | Etapa 6 | - | unitaria | sí |  | documento-funcional.md:1041 |
| CA-081 | RF-ACC-013 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:954 |
| CA-081b | RF-PER-006, RF-INV-029 | Etapa 2 | Etapa 4 | - | integración | sí | Arranca después de su requisito | documento-funcional.md:988 |
| CA-082 | RF-ACC-018, RF-INV-008 en CA-082b | Etapa 1 | Etapa 1 | - | integración | sí | Corre antes de lo que necesita | documento-funcional.md:955 |
| CA-082b | RF-INV-008 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | documento-funcional.md:989 |
| CA-083 | RS-51 | - | Etapa 1 | - | integración + navegador | sí |  | documento-funcional.md:1051 |
| CA-084 | RF-PLA-010 | Etapa 1 | Etapa 1 | - | integración | sí |  | documento-funcional.md:1052 |
| CA-085 | RN-008 | - | Etapa 1 | - | integración | sí |  | documento-funcional.md:1053 |
| CA-086 | RN-015 | - | Etapa 2 | - | integración | sí |  | documento-funcional.md:1054 |
| CA-087 | RN-016, RF-CAT-003 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:1055 |
| CA-088 | RN-020 | - | Etapa 2 | - | integración | sí |  | documento-funcional.md:1056 |
| CA-089 | RF-OC-019, PS-232 | Etapa 5 | Etapa 5 | - | integración | sí |  | documento-funcional.md:1057 |
| CA-090 | RNF-013 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | documento-funcional.md:1058 |
| CA-091 | RF-DAT-013, PS-234 | Etapa 4 | Etapa 4 | - | integración | sí |  | documento-funcional.md:1059 |
| CA-092 | RF-CAT-026 | Etapa 2 | Etapa 2 | - | integración | sí |  | documento-funcional.md:1060 |
| CA-093 | RF-PER-012, RF-ACC-025 | Etapa 1 | Etapa 2 | - | navegador | sí | Arranca después de su requisito | documento-funcional.md:1061 |

### AYU · Mesa de ayuda (27)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-AYU-01 | RF-AYU-001, RF-AYU-003, RF-AYU-004, RF-AYU-005; RN-AYU-003 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:315 |
| CA-AYU-02 | RF-AYU-002; RN-AYU-002, RN-AYU-029 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:316 |
| CA-AYU-03 | RF-AYU-005; RN-AYU-004 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:317 |
| CA-AYU-04 | RF-AYU-016, RF-AYU-017, RF-AYU-018; RN-AYU-006, RN-AYU-007; RNF-AYU-005 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:318 |
| CA-AYU-05 | RF-AYU-015; RN-AYU-006 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:319 |
| CA-AYU-06 | RF-AYU-013; RN-AYU-009; RNF-AYU-007 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:320 |
| CA-AYU-07 | RF-AYU-009; RN-AYU-011 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:321 |
| CA-AYU-08 | RF-AYU-009; RN-AYU-011 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:322 |
| CA-AYU-09 | RF-AYU-023, RF-AYU-025; RN-AYU-010 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:323 |
| CA-AYU-10 | RF-AYU-027; RN-AYU-008, RN-AYU-012 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:324 |
| CA-AYU-11 | RF-AYU-010, RF-AYU-011, RF-AYU-012; RN-AYU-015, RN-AYU-017, RN-AYU-018 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:325 |
| CA-AYU-12 | RF-AYU-019, RF-AYU-020; RN-AYU-020 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:326 |
| CA-AYU-13 | RF-AYU-006, RF-AYU-007, RF-AYU-008, RF-AYU-041; RN-AYU-018 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:327 |
| CA-AYU-14 | RF-AYU-030, RF-AYU-031, RF-AYU-035, RF-AYU-036; RN-AYU-023, RN-AYU-035 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:328 |
| CA-AYU-15 | RF-AYU-032, RF-AYU-033, RF-AYU-034; RN-AYU-024, RN-AYU-025 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:329 |
| CA-AYU-16 | RF-AYU-028, RF-AYU-029; RN-AYU-022 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:330 |
| CA-AYU-17 | RF-AYU-045; RN-AYU-027 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:331 |
| CA-AYU-18 | RF-AYU-014, RF-AYU-046; RN-AYU-025 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:332 |
| CA-AYU-19 | RF-AYU-026, RF-AYU-036; RN-AYU-019, RN-AYU-028, RN-AYU-030; RNF-AYU-004 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:333 |
| CA-AYU-20 | RF-AYU-047; RN-AYU-033 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:334 |
| CA-AYU-21 | RF-AYU-043, RF-AYU-044; RN-AYU-032 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:335 |
| CA-AYU-22 | RF-AYU-040, RF-AYU-048; RN-AYU-002 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:336 |
| CA-AYU-23 | RN-AYU-001; RNF-AYU-009 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:337 |
| CA-AYU-24 | RF-AYU-021, RF-AYU-022, RF-AYU-024, RF-AYU-042, RF-AYU-044; RN-AYU-001, RN-AYU-014 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:338 |
| CA-AYU-25 | RN-AYU-001; RF-AYU-001 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:339 |
| CA-AYU-26 |  | - | Fase 2 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/mesa-de-ayuda.md:340 |
| CA-AYU-27 | RF-AYU-037, RF-AYU-038, RF-AYU-039; RN-AYU-009, RN-AYU-027 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/mesa-de-ayuda.md:341 |

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

### ENT · Entregas y devoluciones (15)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-ENT-01 | RF-ENT-001, 002, 003, 012, 013, 016; RN-ENT-005 | Etapa 4 | Etapa 4 | - | navegador | sí |  | modulos/entregas-devoluciones.md:231 |
| CA-ENT-02 | RN-ENT-002, 003 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | modulos/entregas-devoluciones.md:232 |
| CA-ENT-03 | RN-ENT-003; RNF-ENT-003 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/entregas-devoluciones.md:233 |
| CA-ENT-04 | RF-ENT-004; RN-ENT-011, 012 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/entregas-devoluciones.md:234 |
| CA-ENT-05 | RN-ENT-014 | - | Etapa 4 | - | unitaria | sí | Etapa heredada del módulo | modulos/entregas-devoluciones.md:235 |
| CA-ENT-06 | permiso denegado)** (RF-ENT-001, 009; RN-ENT-007 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | modulos/entregas-devoluciones.md:236 |
| CA-ENT-07 | aislamiento)** (RF-ENT-014; RN-ENT-023 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | modulos/entregas-devoluciones.md:237 |
| CA-ENT-08 | RF-ENT-004, 006; RN-ENT-001, 018 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/entregas-devoluciones.md:238 |
| CA-ENT-09 | RN-ENT-007 | - | Etapa 4 | - | integración | sí | Etapa heredada del módulo | modulos/entregas-devoluciones.md:239 |
| CA-ENT-10 | RF-ENT-010, 011; RN-ENT-016 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | modulos/entregas-devoluciones.md:240 |
| CA-ENT-11 | RF-ENT-009; RN-ENT-019 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | modulos/entregas-devoluciones.md:241 |
| CA-ENT-12 | RF-ENT-003, 005, 008; RN-ENT-026 | Etapa 4 | Etapa 4 | - | integración + navegador | sí |  | modulos/entregas-devoluciones.md:242 |
| CA-ENT-13 | RF-ENT-003; RN-ENT-025; RNF-ENT-008 | Etapa 4 | Etapa 4 | - | navegador | sí |  | modulos/entregas-devoluciones.md:243 |
| CA-ENT-14 | RN-ENT-006 | - | Etapa 4 | - | integración | sí | Etapa heredada del módulo | modulos/entregas-devoluciones.md:244 |
| CA-ENT-15 | RF-ENT-007, 015, 017; RN-ENT-010 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/entregas-devoluciones.md:245 |

### GAR · Garantías y mantenimiento (20)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-GAR-01 | RF-GAR-001, 002, 005 | Etapa 4 | Etapa 5 | - | navegador | sí | Arranca después de su requisito · Corre en Etapa 5 (recepción). La ficha de garantía de un activo importado (RF-GAR-002, Etapa 4) se prueba con CA-GAR-15 y CA-082b mientras tanto. | modulos/garantias-mantenimiento.md:265 |
| CA-GAR-02 | RF-GAR-019, 028, RN-GAR-033 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:266 |
| CA-GAR-03 | RF-GAR-014 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:267 |
| CA-GAR-04 | RF-GAR-003, 004, 006, 008 | Etapa 4 | Fase 2 | - | integración | no (bloquea su módulo) | Arranca después de su requisito · Partir: 04a (Etapa 4) garantía del fabricante Vigente y Vencida al mover el reloj, sin proceso (prueba también RN-018); 04b (Fase 2) garantía extendida y efectiva. | modulos/garantias-mantenimiento.md:268 |
| CA-GAR-05 | RF-GAR-012, 013, 015, 016, 017, RN-GAR-019 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:269 |
| CA-GAR-06 | RF-GAR-014, 022, RN-GAR-028 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:270 |
| CA-GAR-07 | RF-GAR-023, RN-GAR-030 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:271 |
| CA-GAR-08 | RF-GAR-020, 021, RN-GAR-027 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:272 |
| CA-GAR-09 | RF-GAR-010, 011, RN-GAR-014 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:273 |
| CA-GAR-10 | RF-GAR-011, RN-GAR-016 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:274 |
| CA-GAR-11 | RF-GAR-018, 030, RN-GAR-022 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:275 |
| CA-GAR-12 | RF-GAR-025, RN-GAR-031 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:276 |
| CA-GAR-13 | RF-GAR-007, 009, RN-GAR-010 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:277 |
| CA-GAR-14 | RN-GAR-037, 034 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/garantias-mantenimiento.md:278 |
| CA-GAR-15 | RF-GAR-005, 008, RN-GAR-003 | Etapa 4 | Etapa 4 | - | unitaria | sí |  | modulos/garantias-mantenimiento.md:279 |
| CA-GAR-16 | RF-GAR-024, 026, 027, 029 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:280 |
| CA-GAR-17 | RF-GAR-015, RN-GAR-038 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:281 |
| CA-GAR-18 | RN-GAR-039 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/garantias-mantenimiento.md:282 |
| CA-GAR-19 | RF-GAR-030, RN-GAR-025 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:284 |
| CA-GAR-20 | RF-GAR-031, RN-GAR-041 | Fase 2 | Fase 2 | - | manual (con apoyo de integración) | no (bloquea su módulo) |  | modulos/garantias-mantenimiento.md:283 |

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
| CA-INT-09 | La API no aprueba.** *Cubre RF-INT-008, RN-INT-010, 011 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/integraciones-api.md:305 |
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
| CA-POR-01 | RF-POR-001, 002, 003, 005; RN-POR-001 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:213 |
| CA-POR-02 | aislamiento entre empresas)** (RN-POR-002; RNF-POR-007 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/portal-autoservicio.md:214 |
| CA-POR-03 | aislamiento entre Personas)** (RN-POR-001, 002; RNF-POR-003 | - | Fase 3 | - | integración + navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/portal-autoservicio.md:215 |
| CA-POR-04 | permiso denegado)** (RF-POR-006, 007, 016; RN-POR-018 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:216 |
| CA-POR-05 | RF-POR-002; RN-POR-011, 022; RNF-POR-008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:217 |
| CA-POR-06 | RF-POR-004; RN-POR-011 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:218 |
| CA-POR-07 | RF-POR-013, 014, 017; RN-POR-005, 007 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:219 |
| CA-POR-08 | RF-POR-014; RN-POR-007 | Fase 3 | Fase 3 | - | integración + navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:220 |
| CA-POR-09 | RN-POR-004 | - | Fase 3 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/portal-autoservicio.md:221 |
| CA-POR-10 | RF-POR-009, 010, 015; RN-POR-009 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:222 |
| CA-POR-11 | RF-POR-008; RN-POR-008 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:223 |
| CA-POR-12 | RF-POR-011; RN-POR-020 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:224 |
| CA-POR-13 | RN-POR-003 | - | Fase 3 | - | navegador | no (bloquea su módulo) | Etapa heredada del módulo | modulos/portal-autoservicio.md:225 |
| CA-POR-14 | Fase 3)** (RF-POR-012; RN-POR-014, 015 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:226 |
| CA-POR-15 | RF-POR-011; RN-POR-011 | Fase 3 | Fase 3 | - | navegador | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:227 |
| CA-POR-16 | RF-POR-013; RN-POR-016 | Fase 3 | Fase 3 | - | integración | no (bloquea su módulo) |  | modulos/portal-autoservicio.md:228 |

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

### PRS · Personas y ubicaciones (16)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-PRS-01 | RF-PRS-001, 005, 006, 010; RN-PRS-001 | Etapa 2 | Etapa 2 | Etapa 4 | integración | sí | Empieza en Etapa 2; "puede recibir un equipo" necesita activos y se completa en Etapa 4. | modulos/personas-ubicaciones.md:226 |
| CA-PRS-02 | RF-PRS-001; RN-PRS-005 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:227 |
| CA-PRS-03 | RF-PRS-004, 011; RN-PRS-008 | Etapa 2 | Etapa 4 | - | integración | sí | Pide una laptop asignada (Etapa 4); RF-PRS-011 es de Etapa 2. Propuesta al escuadrón D: partir en 03a (cese sin recursos, Etapa 2; lo cubre hoy CA-052a1 del núcleo) y 03b (con laptop, Etapa 4). | modulos/personas-ubicaciones.md:228 |
| CA-PRS-04 | RF-PRS-011, 017; RN-PRS-011, 012 | Etapa 2 | Etapa 4 | - | unitaria | sí | Arranca después de su requisito · Corre en Etapa 4; el rechazo de anonimizar con pendientes de la Etapa 2 (sin equipos) lo cubre CA-052b1. | modulos/personas-ubicaciones.md:229 |
| CA-PRS-05 | RF-PRS-011; RN-PRS-011 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:230 |
| CA-PRS-06 | permiso denegado)** (RF-PRS-015; RN-PRS-020 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | modulos/personas-ubicaciones.md:231 |
| CA-PRS-07 | RF-PRS-003; RN-PRS-032 | Etapa 2 | Etapa 2 | - | integración + navegador | sí |  | modulos/personas-ubicaciones.md:232 |
| CA-PRS-08 | RF-PRS-007, 008; RN-PRS-024 | Etapa 2 | Etapa 2 | Etapa 4 | unitaria | sí | El movimiento por activo se prueba con 40 equipos (Etapa 4); el ciclo y la jerarquía, en Etapa 2. | modulos/personas-ubicaciones.md:233 |
| CA-PRS-09 | RF-PRS-009; RN-PRS-014 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | modulos/personas-ubicaciones.md:234 |
| CA-PRS-10 | RF-PRS-013; RN-PRS-017 | Etapa 2 | Etapa 2 | - | unitaria | sí |  | modulos/personas-ubicaciones.md:235 |
| CA-PRS-11 | RF-PRS-014 | Etapa 4 | Etapa 4 | - | integración | sí |  | modulos/personas-ubicaciones.md:236 |
| CA-PRS-12 | RF-PRS-012; RN-PRS-013, 016 | Etapa 2 | Etapa 2 | Etapa 4 | unitaria | sí | La reactivación corre en Etapa 2; "asignarle un equipo se rechaza" necesita activos (Etapa 4). | modulos/personas-ubicaciones.md:237 |
| CA-PRS-13 | RF-PRS-002; RN-PRS-018 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:238 |
| CA-PRS-14 | RF-PRS-015; RN-PRS-018, 021; RNF-PRS-009 | Etapa 2 | Etapa 2 | Etapa 4 | integración | sí | La copia del nombre en las actas necesita actas (Etapa 4). Además mezcla anonimización manual y automática (ver ambiguos). | modulos/personas-ubicaciones.md:239 |
| CA-PRS-15 | aislamiento)** (RF-PRS-016; RN-PRS-028, 030 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:240 |
| CA-PRS-16 | RN-PRS-004; RF-PRS-001 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/personas-ubicaciones.md:241 |

### PRV · Proveedores y contratos (22)

| CA | Cubre | Etapa del requisito | Se ejecuta en | Se completa en | Tipo | Bloqueante | Nota | Fuente |
|---|---|---|---|---|---|---|---|---|
| CA-PRV-01 | RF-PRV-001 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:254 |
| CA-PRV-02 | RF-PRV-007, 019, RN-PRV-032 | Etapa 2 | Fase 2 | - | integración | no (bloquea su módulo) | Arranca después de su requisito · Partir: 02a (Etapa 2) un proveedor de B pedido por identificador interno responde "no encontrado"; 02b (Fase 2) lo mismo con el contrato. | modulos/proveedores-contratos.md:255 |
| CA-PRV-03 | RF-PRV-001, 002, 005 | Etapa 2 | Etapa 2 | - | navegador | sí |  | modulos/proveedores-contratos.md:256 |
| CA-PRV-04 | RF-PRV-003 | Etapa 2 | Fase 2 | - | unitaria | no (bloquea su módulo) | Necesita un contrato Vigente (PRV-B, Fase 2); RF-PRV-003 es de Etapa 2. Propuesta al escuadrón A: 04a (Etapa 2) desactivar y reactivar un proveedor con motivo y auditoría; 04b (Fase 2) rechazo por contrato Vigente. | modulos/proveedores-contratos.md:257 |
| CA-PRV-05 | RF-PRV-008, 010, 023 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:258 |
| CA-PRV-06 | RF-PRV-010, RN-PRV-015 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:259 |
| CA-PRV-07 | RF-PRV-011, 015, 027 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:260 |
| CA-PRV-08 | RF-PRV-012 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:261 |
| CA-PRV-09 | RF-PRV-016, 017, 018 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:262 |
| CA-PRV-10 | RF-PRV-022, 024 | Fase 2 | Fase 2 | - | integración + navegador | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:263 |
| CA-PRV-11 | RF-PRV-021 | Fase 2 | Fase 2 | - | navegador | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:264 |
| CA-PRV-12 | RF-PRV-020, 025, 026 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:265 |
| CA-PRV-13 | RF-PRV-014, RN-PRV-019 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:266 |
| CA-PRV-14 | RN-PRV-041, 036 | - | Fase 2 | - | integración | no (bloquea su módulo) | Etapa heredada del módulo | modulos/proveedores-contratos.md:267 |
| CA-PRV-15 | RF-PRV-004, RN-PRV-037 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:268 |
| CA-PRV-16 | RF-PRV-006, RN-PRV-034 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:269 |
| CA-PRV-17 | RN-PRV-042 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:270 |
| CA-PRV-18 | RF-PRV-013, RN-PRV-040 | Fase 2 | Fase 2 | - | unitaria | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:271 |
| CA-PRV-19 | RN-PRV-015 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:272 |
| CA-PRV-20 | RF-PRV-002, RN-PRV-039 | Etapa 2 | Etapa 2 | - | integración | sí |  | modulos/proveedores-contratos.md:273 |
| CA-PRV-21 | RF-PRV-028 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:274 |
| CA-PRV-22 | RF-PRV-029, RN-PRV-043 | Fase 2 | Fase 2 | - | integración | no (bloquea su módulo) |  | modulos/proveedores-contratos.md:275 |

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

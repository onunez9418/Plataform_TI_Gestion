# Criterios de aceptación por etapa

**Autor:** QA (qa-tester) · **Fecha:** 2026-10-25 · **Fuente:** `docs/documento-funcional.md` v0.3 (sección 22) y los 17 módulos en `docs/modulos/` (v0.2). Generado leyendo los documentos con scripts de solo lectura; no se editó ningún módulo.

**Para qué sirve.** Es la lista única de todos los criterios CA, con la etapa en que se ejecutan, el tipo de prueba y si bloquean. Responde a H-QA-28. Si un criterio cambia de etapa, se corrige aquí y no en los módulos hasta que el Analista lo incorpore.

## Cómo leer las columnas

- **Cubre:** lo que el propio criterio dice cubrir (copiado del documento, abreviado). Si el criterio no cita requisitos, la etapa se deduce de los requisitos que lo citan.
- **Etapa del requisito:** la más temprana entre los requisitos que cubre. **Se ejecuta completo en:** la etapa en que ya existe todo lo que el criterio necesita (es la más tardía entre los requisitos que cubre, salvo los casos de la tabla "No corren en la etapa de su requisito", donde la fijé leyendo el texto). Un criterio con dos etapas **empieza a correr en la primera con lo que ya existe y se completa en la segunda**; la columna "Cruza" marca esos casos para partirlos en a, b, c.
- **Tipo:** unitaria (reglas y cálculos sin base de datos); integración (base real, servidor, permisos, concurrencia, reloj, correo); navegador (Playwright, pantallas, PDF); manual (personas o ensayo; siempre con apoyo automático donde se pueda). Es una clasificación por el texto del criterio, que QA afina al escribir cada prueba.
- **Bloqueante:** sí = si falla, la etapa no se aprueba. "No para la v1" = pertenece a un módulo posterior (Fase 2 o 3) y bloquea la entrega de ese módulo.
- Etapas 0 a 7 son las de la v1. **Fase 2** y **Fase 3** son lo posterior (D-056).

## Resumen

**424 criterios:** 93 del núcleo y 331 de los 17 módulos.

| Se ejecuta completo en | Criterios |
|---|---|
| Etapa 1 | 30 |
| Etapa 2 | 26 |
| Etapa 3 | 3 |
| Etapa 4 | 47 |
| Etapa 5 | 26 |
| Etapa 6 | 3 |
| Etapa 7 | 4 |
| Fase 2 | 136 |
| Fase 3 | 149 |
| **Total** | **424** |

**Criterios de la v1 (Etapas 0 a 7):** 139. **De fases posteriores:** 285.

| Etapa más temprana del requisito | Criterios |
|---|---|
| Etapa 0 | 3 |
| Etapa 1 | 59 |
| Etapa 2 | 37 |
| Etapa 3 | 4 |
| Etapa 4 | 33 |
| Etapa 5 | 15 |
| Etapa 6 | 2 |
| Fase 2 | 124 |
| Fase 3 | 147 |

| Tipo de prueba | Criterios |
|---|---|
| integración | 248 |
| unitaria | 84 |
| integración + navegador | 73 |
| navegador | 11 |
| manual (con apoyo de integración) | 8 |

| Módulo | Criterios |
|---|---|
| cmdb-ligera | 21 |
| dominios-certificados | 14 |
| entregas-devoluciones | 15 |
| garantias-mantenimiento | 20 |
| gestion-cambios | 19 |
| gestion-problemas | 16 |
| integraciones-api | 26 |
| licencias-software | 20 |
| lineas-moviles | 16 |
| mesa-de-ayuda | 27 |
| notificaciones | 20 |
| núcleo | 93 |
| onboarding-offboarding | 15 |
| personas-ubicaciones | 16 |
| portal-autoservicio | 16 |
| presupuesto-costos | 26 |
| proveedores-contratos | 22 |
| reportes-tableros | 22 |

### Criterios que cruzan etapas (58)

Cubren requisitos de etapas distintas. Corren desde la más temprana con lo que ya existe y se completan en la más tardía. Hay que partirlos (a, b, c) para poder cerrar cada etapa con su parte:

CA-001 (Etapa 1 a Etapa 2), CA-011a (Etapa 1 a Etapa 2), CA-011b (Etapa 1 a Etapa 4), CA-012 (Etapa 1 a Etapa 5), CA-069 (Etapa 1 a Etapa 4), CA-082 (Etapa 1 a Etapa 4), CA-016 (Etapa 2 a Etapa 4), CA-017 (Etapa 2 a Etapa 3), CA-018 (Etapa 3 a Etapa 6), CA-019 (Etapa 2 a Etapa 3), CA-020 (Etapa 2 a Etapa 5), CA-064 (Etapa 2 a Etapa 4), CA-065 (Etapa 2 a Etapa 4), CA-042 (Etapa 1 a Etapa 4), CA-023 (Etapa 3 a Etapa 4), CA-024 (Etapa 4 a Etapa 7), CA-060 (Etapa 2 a Etapa 4), CA-046 (Etapa 1 a Etapa 4), CA-081b (Etapa 2 a Etapa 4), CA-055 (Etapa 5 a Etapa 6), CA-032 (Etapa 2 a Etapa 5), CA-061 (Etapa 3 a Etapa 5), CA-036 (Etapa 4 a Etapa 5), CA-038 (Etapa 0 a Etapa 4), CA-067 (Etapa 1 a Etapa 2), CA-040 (Etapa 1 a Etapa 7), CA-041 (Etapa 1 a Etapa 4), CA-045 (Etapa 1 a Etapa 5), CA-052a (Etapa 2 a Etapa 4), CA-052b (Etapa 2 a Etapa 4), CA-052c (Etapa 1 a Etapa 2), CA-054 (Etapa 1 a Etapa 7), CA-073 (Etapa 0 a Etapa 1), CA-074 (Etapa 1 a Etapa 5), CA-076 (Etapa 2 a Fase 2), CA-071 (Etapa 1 a Etapa 5), CA-077 (Etapa 1 a Fase 2), CA-044 (Etapa 6 a Fase 2), CA-048 (Etapa 1 a Etapa 4), CA-050a (Etapa 1 a Etapa 4), CA-050b (Etapa 1 a Etapa 5), CA-057 (Etapa 1 a Fase 3), CA-053 (Etapa 0 a Etapa 7), CA-GAR-01 (Etapa 4 a Etapa 5), CA-GAR-04 (Etapa 4 a Fase 2), CA-LIN-09 (Fase 2 a Fase 3), CA-NOT-01 (Etapa 1 a Etapa 5), CA-NOT-02 (Etapa 1 a Fase 2), CA-NOT-05 (Etapa 1 a Fase 2), CA-NOT-07 (Etapa 1 a Fase 2), CA-NOT-09 (Etapa 1 a Fase 2), CA-NOT-10 (Etapa 1 a Fase 2), CA-NOT-11 (Etapa 1 a Fase 2), CA-NOT-13 (Etapa 1 a Fase 2), CA-NOT-20 (Etapa 1 a Etapa 5), CA-PRS-04 (Etapa 2 a Etapa 4), CA-PRV-02 (Etapa 2 a Fase 2), CA-PRV-04 (Etapa 2 a Fase 2).

### No corren en la etapa de su requisito (22)

Necesitan algo que todavía no existe en la etapa de su requisito. Es el defecto que más daño hace al cerrar una etapa: el criterio no se puede ejecutar y nadie lo nota hasta que llega la etapa posterior.

| Criterio | Etapa del requisito | Se ejecuta en | Por qué |
|---|---|---|---|
| CA-016 | Etapa 2 | Etapa 4 | La prueba pide entregar una laptop (Etapa 4); el requisito de Personas es de la Etapa 2. |
| CA-064 | Etapa 2 | Etapa 4 | Necesita unidades y garantía (Etapa 4); la naturaleza de la categoría es de la Etapa 2. |
| CA-065 | Etapa 2 | Etapa 4 | Necesita registrar dos unidades con el mismo IMEI (Etapa 4); el campo identificador es de la Etapa 2. |
| CA-060 | Etapa 2 | Etapa 4 | Necesita un activo En stock (Etapa 4); la jerarquía de ubicaciones es de la Etapa 2. |
| CA-040 | Etapa 1 | Etapa 7 | La inalterabilidad es de la Etapa 1; la copia externa que detecta alteración es de la Etapa 7. Partir en a y b. |
| CA-052a | Etapa 2 | Etapa 4 | Pide un activo asignado (Etapa 4) y además una línea y un dominio (módulos de Fase 2). |
| CA-052b | Etapa 2 | Etapa 4 | Necesita pendientes (equipos asignados), que existen desde la Etapa 4. |
| CA-054 | Etapa 1 | Etapa 7 | Mezcla Etapa 2 (nombre), Etapa 4 (acta) y Etapa 7 (restaurar respaldo). Partir en a, b, c. |
| CA-076 | Etapa 2 | Fase 2 | Cubre requisitos de Etapa 2 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-077 | Etapa 1 | Fase 2 | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-044 | Etapa 6 | Fase 2 | Cubre requisitos de Etapa 6 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-057 | Etapa 1 | Fase 3 | Cubre requisitos de Etapa 1 a Fase 3: se ejecuta completo en Fase 3. Partir por etapa. |
| CA-GAR-04 | Etapa 4 | Fase 2 | Cubre requisitos de Etapa 4 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-NOT-02 | Etapa 1 | Fase 2 | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-NOT-05 | Etapa 1 | Fase 2 | Necesita un evento que avise a una Persona sin Usuario; no existe en la v1. |
| CA-NOT-07 | Etapa 1 | Fase 2 | Resumen diario: NOT-completo (Fase 2). |
| CA-NOT-09 | Etapa 1 | Fase 2 | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-NOT-10 | Etapa 1 | Fase 2 | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-NOT-11 | Etapa 1 | Fase 2 | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-NOT-13 | Etapa 1 | Fase 2 | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-PRV-02 | Etapa 2 | Fase 2 | Cubre requisitos de Etapa 2 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. |
| CA-PRV-04 | Etapa 2 | Fase 2 | Necesita un contrato Vigente (PRV-B, Fase 2); el requisito de desactivar proveedor es de la v1. |

### Criterios sin requisito que los cite

51 criterios citan solo reglas RN o seguridad y ninguna fila RF los cita; su etapa es la del módulo (revisar con cada escuadrón): CA-CMD-15, CA-CMD-16, CA-CMD-17, CA-CMD-19, CA-CMD-20, CA-DOM-08, CA-DOM-14, CA-ENT-05, CA-ENT-09, CA-ENT-14, CA-GAR-14, CA-GAR-18, CA-CAM-07, CA-PRB-13, CA-PRB-15, CA-INT-04, CA-INT-10, CA-INT-21, CA-INT-22, CA-INT-23, CA-LIC-18, CA-LIC-19, CA-LIC-20, CA-LIN-15, CA-LIN-16, CA-AYU-26, CA-NOT-19, CA-ONB-06, CA-ONB-08, CA-ONB-09, CA-ONB-11, CA-ONB-14, CA-POR-02, CA-POR-03, CA-POR-09, CA-POR-13, CA-PRE-11, CA-PRE-12, CA-PRE-13, CA-PRE-16, CA-PRE-20, CA-PRE-23, CA-PRE-24, CA-PRE-25, CA-PRE-26, CA-PRV-14, CA-REP-07, CA-REP-18, CA-REP-19, CA-REP-20, CA-REP-21.

---

## Núcleo (documento funcional, sección 22)

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-001 | RN-001, RS-10, RS-13, RF-AUD-012, RF-PER-008, RF-CAT-003 | Etapa 1 | Etapa 2 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 2: se ejecuta completo en Etapa 2. Partir por etapa. | documento-funcional.md:879 |
| CA-002 | RN-001, RF-AUD-010 | Etapa 1 | Etapa 1 | no | integración + navegador | sí |  | documento-funcional.md:880 |
| CA-003 | No se mezclan referencias (RS-11) | Etapa 1 | Etapa 1 | no | integración | sí | Cita solo reglas o seguridad (RN, RS); se ejecuta desde la Etapa 1 y crece con cada módulo. | documento-funcional.md:881 |
| CA-004 | RF-ACC-011, RF-ACC-012, RF-DAT-009 | Etapa 1 | Etapa 1 | no | integración + navegador | sí |  | documento-funcional.md:882 |
| CA-005 | RF-ACC-003, 007, 009, 010 | Etapa 1 | Etapa 1 | no | integración + navegador | sí |  | documento-funcional.md:883 |
| CA-006 | RF-ACC-001, 004, 005, 017 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:884 |
| CA-007 | RF-ACC-013, 024, RF-PLA-001 | Etapa 1 | Etapa 1 | no | integración + navegador | sí |  | documento-funcional.md:885 |
| CA-008 | RF-ACC-015, 016, RF-USR-003, RF-ROL-011 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:886 |
| CA-009 | RF-ROL-008, RF-ACC-020 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:887 |
| CA-010 | RF-ROL-007, RF-ACC-008 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:888 |
| CA-011a | RF-ROL-004, 010, 014 | Etapa 1 | Etapa 2 | sí | integración + navegador | sí | Cubre requisitos de Etapa 1 a Etapa 2: se ejecuta completo en Etapa 2. Partir por etapa. | documento-funcional.md:889 |
| CA-011b | RF-ROL-003, 005, PER-009, IMP-013, AUD-007, INV-032 | Etapa 1 | Etapa 4 | sí | integración + navegador | sí | Cubre requisitos de Etapa 1 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:890 |
| CA-012 | RF-OC-021, 022, 025, RF-ROL-009 | Etapa 1 | Etapa 5 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:891 |
| CA-013 | RF-OC-023, 024 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:892 |
| CA-014 | RF-OC-026 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:893 |
| CA-015a | RF-PLA-004, 006 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:894 |
| CA-015b | RF-PLA-005, RF-AUD-017 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:895 |
| CA-015c | RF-PLA-003, 009, RF-ACC-019 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:896 |
| CA-015d | RF-ACC-002, 022, RF-PLA-002 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:897 |
| CA-016 | RF-PER-001 a 003, RF-DAT-001, RF-CAT-024 | Etapa 2 | Etapa 4 | sí | integración | sí | La prueba pide entregar una laptop (Etapa 4); el requisito de Personas es de la Etapa 2. | documento-funcional.md:908 |
| CA-017 | RF-SKU-001, 002, RF-CAT-007 a 009, 023, 025 | Etapa 2 | Etapa 3 | sí | integración | sí | Cubre requisitos de Etapa 2 a Etapa 3: se ejecuta completo en Etapa 3. Partir por etapa. | documento-funcional.md:909 |
| CA-018 | RN-004, RF-SKU-003, 004, RF-OC-003, 046, RF-OS-005 | Etapa 3 | Etapa 6 | sí | integración | sí | Cubre requisitos de Etapa 3 a Etapa 6: se ejecuta completo en Etapa 6. Partir por etapa. | documento-funcional.md:910 |
| CA-019 | RF-SKU-005, 006, RF-CAT-011 | Etapa 2 | Etapa 3 | sí | integración | sí | Cubre requisitos de Etapa 2 a Etapa 3: se ejecuta completo en Etapa 3. Partir por etapa. | documento-funcional.md:911 |
| CA-020 | RF-CAT-002, 010, 012 a 016, 022, RF-SKU-013, 015, 016, RF-OC-039 | Etapa 2 | Etapa 5 | sí | unitaria | sí | Cubre requisitos de Etapa 2 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:912 |
| CA-021 | RF-CAT-017 a 021 | Etapa 2 | Etapa 2 | no | unitaria | sí |  | documento-funcional.md:913 |
| CA-022 | RF-SKU-007, 008 | Etapa 3 | Etapa 3 | no | integración | sí |  | documento-funcional.md:914 |
| CA-023 | RF-INV-002, 003, 006, RF-SKU-009 | Etapa 3 | Etapa 4 | sí | unitaria | sí | Cubre requisitos de Etapa 3 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:921 |
| CA-024 | RF-INV-001, 011, 018, 031, RF-UX-009, RF-OC-028 | Etapa 4 | Etapa 7 | sí | integración | sí | Cubre requisitos de Etapa 4 a Etapa 7: se ejecuta completo en Etapa 7. Partir por etapa. | documento-funcional.md:922 |
| CA-025 | RF-INV-013 a 015, 024 | Etapa 4 | Etapa 4 | no | integración | sí |  | documento-funcional.md:924 |
| CA-026 | RF-INV-019 a 021 | Etapa 4 | Etapa 4 | no | integración | sí |  | documento-funcional.md:925 |
| CA-027 | RF-INV-022 | Etapa 4 | Etapa 4 | no | unitaria | sí |  | documento-funcional.md:926 |
| CA-028 | RF-INV-004 | Etapa 4 | Etapa 4 | no | unitaria | sí |  | documento-funcional.md:927 |
| CA-029 | RF-OC-001, 011 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:938 |
| CA-030 | RF-OC-010, 014, 044 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:939 |
| CA-031 | RF-OC-005, 015, 018 a 020 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:940 |
| CA-032 | RF-OC-002, 004 a 008, 042, 043, RF-SKU-010, 011, RF-CAT-005, RF-INV-023 | Etapa 2 | Etapa 5 | sí | integración | sí | Cubre requisitos de Etapa 2 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:942 |
| CA-033 | RF-OC-029, 035, 036, 040 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:944 |
| CA-034 | RF-OC-030, 031, 033, 037, 038, RNF-005 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:945 |
| CA-035 | RF-OC-033, 034 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:946 |
| CA-036 | RF-OC-032, RF-INV-007 | Etapa 4 | Etapa 5 | sí | integración | sí | Cubre requisitos de Etapa 4 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:948 |
| CA-037 | RF-OC-012, 013 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:950 |
| CA-038 | RF-IMP-001 a 010, RF-INV-005 | Etapa 0 | Etapa 4 | sí | integración + navegador | sí | Cubre requisitos de Etapa 0 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:955 |
| CA-039 | RF-IMP-011, 014, 015, RS-42 | Etapa 4 | Etapa 4 | no | integración | sí |  | documento-funcional.md:957 |
| CA-040 | RF-AUD-001, 002, 018, RF-DAT-002 | Etapa 1 | Etapa 7 | sí | manual (con apoyo de integración) | sí | La inalterabilidad es de la Etapa 1; la copia externa que detecta alteración es de la Etapa 7. Partir en a y b. | documento-funcional.md:960 |
| CA-041 | RF-AUD-003 a 005, 008, 009, 013, 019, RF-USR-007, RF-ROL-013, RF-PLA-007 | Etapa 1 | Etapa 4 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:961 |
| CA-042 | RF-CAT-028, RF-SKU-013, 014, RF-AUD-006 | Etapa 1 | Etapa 4 | sí | integración + navegador | sí | Cubre requisitos de Etapa 1 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:917 |
| CA-043 | RF-EXP-005, 006, 007, RNF-006 | Etapa 2 | Etapa 2 | no | integración + navegador | sí |  | documento-funcional.md:958 |
| CA-044 | RF-OS-001 a 011, RF-INV-012 | Etapa 6 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 6 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | documento-funcional.md:979 |
| CA-045 | RF-AUD-011, RN-007, RF-USR-002, RF-CAT-004 | Etapa 1 | Etapa 5 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:963 |
| CA-046 | RF-INV-016, 017, RF-DAT-006, RNF-002 | Etapa 1 | Etapa 4 | sí | integración + navegador | sí | Cubre requisitos de Etapa 1 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:931 |
| CA-047 | RF-ROL-001, 002, 006, 012, RF-USR-001 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:898 |
| CA-048 | RNF-007, RF-CAT-001, RF-SKU-012, RF-UX-007 | Etapa 1 | Etapa 4 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:981 |
| CA-049 | RF-ACC-023, RF-DAT-014 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:899 |
| CA-050a | RNF-003, 004, RF-UX-010, 012 | Etapa 1 | Etapa 4 | sí | integración + navegador | sí, a lo construido (completo en Etapa 7) | Cubre requisitos de Etapa 1 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:982 |
| CA-050b | RNF-001, 008, RF-UX-001 a 003, 005, 006, 011, RF-ACC-025 | Etapa 1 | Etapa 5 | sí | integración + navegador | sí, a lo construido (completo en Etapa 7) | Cubre requisitos de Etapa 1 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:983 |
| CA-051 | RN-014 | Etapa 1 | Etapa 1 | no | integración | sí | Cita solo reglas o seguridad (RN, RS); se ejecuta desde la Etapa 1 y crece con cada módulo. | documento-funcional.md:984 |
| CA-052a | RF-PER-005, 006, 011 | Etapa 2 | Etapa 4 | sí | integración | sí | Pide un activo asignado (Etapa 4) y además una línea y un dominio (módulos de Fase 2). | documento-funcional.md:964 |
| CA-052b | RF-PER-006, 013 | Etapa 2 | Etapa 4 | sí | navegador | sí | Necesita pendientes (equipos asignados), que existen desde la Etapa 4. | documento-funcional.md:965 |
| CA-052c | RF-USR-001, 003, 008 | Etapa 1 | Etapa 2 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 2: se ejecuta completo en Etapa 2. Partir por etapa. | documento-funcional.md:966 |
| CA-052d | RF-USR-005, RF-PER-007 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:967 |
| CA-053 | RNF-010 a 018, RF-DAT-015 | Etapa 0 | Etapa 7 | sí | manual (con apoyo de integración) | sí | Cubre requisitos de Etapa 0 a Etapa 7: se ejecuta completo en Etapa 7. Partir por etapa. | documento-funcional.md:986 |
| CA-054 | RF-AUD-014 a 016, RF-PER-004, 013, 014, RF-DAT-003, 005, 011 | Etapa 1 | Etapa 7 | sí | manual (con apoyo de integración) | sí | Mezcla Etapa 2 (nombre), Etapa 4 (acta) y Etapa 7 (restaurar respaldo). Partir en a, b, c. | documento-funcional.md:968 |
| CA-055 | RF-OC-015, 016, 017, 047, 048, RF-OS-008 | Etapa 5 | Etapa 6 | sí | integración | sí | Cubre requisitos de Etapa 5 a Etapa 6: se ejecuta completo en Etapa 6. Partir por etapa. | documento-funcional.md:941 |
| CA-056 | RF-IMP-004, 005, RF-DAT-004 | Etapa 4 | Etapa 4 | no | integración | sí |  | documento-funcional.md:956 |
| CA-057 | RF-IMP-018, RF-ROL-002; Fase 3 | Etapa 1 | Fase 3 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 1 a Fase 3: se ejecuta completo en Fase 3. Partir por etapa. | documento-funcional.md:985 |
| CA-058 | RF-INV-009, 010, 024, 028 | Etapa 4 | Etapa 4 | no | integración + navegador | sí |  | documento-funcional.md:923 |
| CA-059 | RF-INV-025 | Etapa 4 | Etapa 4 | no | integración | sí |  | documento-funcional.md:928 |
| CA-060 | RF-INV-027, RF-CAT-006 | Etapa 2 | Etapa 4 | sí | integración | sí | Necesita un activo En stock (Etapa 4); la jerarquía de ubicaciones es de la Etapa 2. | documento-funcional.md:929 |
| CA-061 | RF-OC-010, 049, 050, RF-SKU-010 | Etapa 3 | Etapa 5 | sí | integración | sí | Cubre requisitos de Etapa 3 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:947 |
| CA-062 | RF-OC-032 | Etapa 5 | Etapa 5 | no | integración + navegador | sí |  | documento-funcional.md:949 |
| CA-063 | RF-INV-026 | Etapa 4 | Etapa 4 | no | integración | sí |  | documento-funcional.md:930 |
| CA-064 | RF-CAT-027, RF-SKU-013 | Etapa 2 | Etapa 4 | sí | integración | sí | Necesita unidades y garantía (Etapa 4); la naturaleza de la categoría es de la Etapa 2. | documento-funcional.md:915 |
| CA-065 | RF-CAT-012, 029 | Etapa 2 | Etapa 4 | sí | integración | sí | Necesita registrar dos unidades con el mismo IMEI (Etapa 4); el campo identificador es de la Etapa 2. | documento-funcional.md:916 |
| CA-066 | RF-AUD-010 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:962 |
| CA-067 | RF-EXP-001 a 004, RF-PLA-010 | Etapa 1 | Etapa 2 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 2: se ejecuta completo en Etapa 2. Partir por etapa. | documento-funcional.md:959 |
| CA-068 | RF-ACC-006, 026 | Etapa 1 | Etapa 1 | no | integración + navegador | sí |  | documento-funcional.md:900 |
| CA-069 | RF-ACC-014, RNF-013 | Etapa 1 | Etapa 4 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:901 |
| CA-070 | RF-OC-026, RF-PLA-008 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:951 |
| CA-071 | RF-EMP-001 a 004 | Etapa 1 | Etapa 5 | sí | unitaria | sí | Cubre requisitos de Etapa 1 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:973 |
| CA-072 | RF-OC-006, 045 | Etapa 5 | Etapa 5 | no | integración | sí |  | documento-funcional.md:943 |
| CA-073 | RF-DAT-008, 010, RNF-009 | Etapa 0 | Etapa 1 | sí | integración | sí | Cubre requisitos de Etapa 0 a Etapa 1: se ejecuta completo en Etapa 1. Partir por etapa. | documento-funcional.md:969 |
| CA-074 | RF-ACC-021, RF-DAT-012, RF-CAT-026 | Etapa 1 | Etapa 5 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | documento-funcional.md:970 |
| CA-075 | RF-EMP-005 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:972 |
| CA-076 | RF-PER-012, RF-DAT-007, 013 | Etapa 2 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 2 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | documento-funcional.md:971 |
| CA-077 | RNF-019 a 022, RF-ROL-015 | Etapa 1 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | documento-funcional.md:974 |
| CA-078 | RF-OC-009, RS-47, RS-42 | Etapa 5 | Etapa 5 | no | integración + navegador | sí |  | documento-funcional.md:975 |
| CA-079 | RF-ACC-012 | Etapa 1 | Etapa 1 | no | integración + navegador | sí |  | documento-funcional.md:902 |
| CA-079b | RF-INV-030 | Etapa 4 | Etapa 4 | no | integración | sí |  | documento-funcional.md:932 |
| CA-080 | RF-UX-004 | Etapa 6 | Etapa 6 | no | integración + navegador | sí |  | documento-funcional.md:980 |
| CA-081 | RF-ACC-013 | Etapa 1 | Etapa 1 | no | integración | sí |  | documento-funcional.md:903 |
| CA-081b | RF-PER-006, RF-INV-029 | Etapa 2 | Etapa 4 | sí | integración | sí | Cubre requisitos de Etapa 2 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:933 |
| CA-082 | RF-ACC-018, RF-INV-008 en CA-082b | Etapa 1 | Etapa 4 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | documento-funcional.md:904 |
| CA-082b | RF-INV-008 | Etapa 4 | Etapa 4 | no | unitaria | sí |  | documento-funcional.md:934 |

## PRS · Personas y ubicaciones

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-PRS-01 | RF-PRS-001, 005, 006, 010; RN-PRS-001 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/personas-ubicaciones.md:226 |
| CA-PRS-02 | RF-PRS-001; RN-PRS-005 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/personas-ubicaciones.md:227 |
| CA-PRS-03 | RF-PRS-004, 011; RN-PRS-008 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/personas-ubicaciones.md:228 |
| CA-PRS-04 | RF-PRS-011, 017; RN-PRS-011, 012 | Etapa 2 | Etapa 4 | sí | unitaria | sí | Cubre requisitos de Etapa 2 a Etapa 4: se ejecuta completo en Etapa 4. Partir por etapa. | modulos/personas-ubicaciones.md:229 |
| CA-PRS-05 | RF-PRS-011; RN-PRS-011 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/personas-ubicaciones.md:230 |
| CA-PRS-06 | RF-PRS-015; RN-PRS-020 | Etapa 2 | Etapa 2 | no | integración + navegador | sí |  | modulos/personas-ubicaciones.md:231 |
| CA-PRS-07 | RF-PRS-003; RN-PRS-032 | Etapa 2 | Etapa 2 | no | integración + navegador | sí |  | modulos/personas-ubicaciones.md:232 |
| CA-PRS-08 | RF-PRS-007, 008; RN-PRS-024 | Etapa 2 | Etapa 2 | no | unitaria | sí |  | modulos/personas-ubicaciones.md:233 |
| CA-PRS-09 | RF-PRS-009; RN-PRS-014 | Etapa 2 | Etapa 2 | no | unitaria | sí |  | modulos/personas-ubicaciones.md:234 |
| CA-PRS-10 | RF-PRS-013; RN-PRS-017 | Etapa 2 | Etapa 2 | no | unitaria | sí |  | modulos/personas-ubicaciones.md:235 |
| CA-PRS-11 | RF-PRS-014 | Etapa 4 | Etapa 4 | no | integración | sí |  | modulos/personas-ubicaciones.md:236 |
| CA-PRS-12 | RF-PRS-012; RN-PRS-013, 016 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/personas-ubicaciones.md:237 |
| CA-PRS-13 | RF-PRS-002; RN-PRS-018 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/personas-ubicaciones.md:238 |
| CA-PRS-14 | RF-PRS-015; RN-PRS-018, 021; RNF-PRS-009 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/personas-ubicaciones.md:239 |
| CA-PRS-15 | RF-PRS-016; RN-PRS-028, 030 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/personas-ubicaciones.md:240 |
| CA-PRS-16 | RN-PRS-004; RF-PRS-001 | Etapa 2 | Etapa 2 | no | integración + navegador | sí |  | modulos/personas-ubicaciones.md:241 |

## ENT · Entregas y devoluciones

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-ENT-01 | RF-ENT-001, 002, 003, 012, 013, 016; RN-ENT-005 | Etapa 4 | Etapa 4 | no | integración + navegador | sí |  | modulos/entregas-devoluciones.md:231 |
| CA-ENT-02 | RN-ENT-002, 003 | Etapa 4 | Etapa 4 | no | integración | sí |  | modulos/entregas-devoluciones.md:232 |
| CA-ENT-03 | RN-ENT-003; RNF-ENT-003 | Etapa 4 | Etapa 4 | no | integración | sí |  | modulos/entregas-devoluciones.md:233 |
| CA-ENT-04 | RF-ENT-004; RN-ENT-011, 012 | Etapa 4 | Etapa 4 | no | unitaria | sí |  | modulos/entregas-devoluciones.md:234 |
| CA-ENT-05 | RN-ENT-014 | Etapa 4 | Etapa 4 | no | unitaria | sí | etapa heredada del módulo (sin requisito con etapa) | modulos/entregas-devoluciones.md:235 |
| CA-ENT-06 | RF-ENT-001, 009; RN-ENT-007 | Etapa 4 | Etapa 4 | no | integración + navegador | sí |  | modulos/entregas-devoluciones.md:236 |
| CA-ENT-07 | RF-ENT-014; RN-ENT-023 | Etapa 4 | Etapa 4 | no | integración | sí |  | modulos/entregas-devoluciones.md:237 |
| CA-ENT-08 | RF-ENT-004, 006; RN-ENT-001, 018 | Etapa 4 | Etapa 4 | no | unitaria | sí |  | modulos/entregas-devoluciones.md:238 |
| CA-ENT-09 | RN-ENT-007 | Etapa 4 | Etapa 4 | no | integración | sí | etapa heredada del módulo (sin requisito con etapa) | modulos/entregas-devoluciones.md:239 |
| CA-ENT-10 | RF-ENT-010, 011; RN-ENT-016 | Etapa 4 | Etapa 4 | no | integración | sí |  | modulos/entregas-devoluciones.md:240 |
| CA-ENT-11 | RF-ENT-009; RN-ENT-019 | Etapa 4 | Etapa 4 | no | integración | sí |  | modulos/entregas-devoluciones.md:241 |
| CA-ENT-12 | RF-ENT-003, 005, 008; RN-ENT-026 | Etapa 4 | Etapa 4 | no | integración + navegador | sí |  | modulos/entregas-devoluciones.md:242 |
| CA-ENT-13 | RF-ENT-003; RN-ENT-025; RNF-ENT-008 | Etapa 4 | Etapa 4 | no | navegador | sí |  | modulos/entregas-devoluciones.md:243 |
| CA-ENT-14 | RN-ENT-006 | Etapa 4 | Etapa 4 | no | integración | sí | etapa heredada del módulo (sin requisito con etapa) | modulos/entregas-devoluciones.md:244 |
| CA-ENT-15 | RF-ENT-007, 015, 017; RN-ENT-010 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/entregas-devoluciones.md:245 |

## PRV · Proveedores y contratos

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-PRV-01 | RF-PRV-001 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/proveedores-contratos.md:253 |
| CA-PRV-02 | RF-PRV-007, 019, RN-PRV-032 | Etapa 2 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 2 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | modulos/proveedores-contratos.md:254 |
| CA-PRV-03 | RF-PRV-001, 002, 005 | Etapa 2 | Etapa 2 | no | integración + navegador | sí |  | modulos/proveedores-contratos.md:255 |
| CA-PRV-04 | RF-PRV-003 | Etapa 2 | Fase 2 | sí | unitaria | la parte v1 sí; el resto es de su módulo | Necesita un contrato Vigente (PRV-B, Fase 2); el requisito de desactivar proveedor es de la v1. | modulos/proveedores-contratos.md:256 |
| CA-PRV-05 | RF-PRV-008, 010, 023 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:257 |
| CA-PRV-06 | RF-PRV-010, RN-PRV-015 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:258 |
| CA-PRV-07 | RF-PRV-011, 015, 027 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:259 |
| CA-PRV-08 | RF-PRV-012 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:260 |
| CA-PRV-09 | RF-PRV-016, 017, 018 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:261 |
| CA-PRV-10 | RF-PRV-022, 024 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:262 |
| CA-PRV-11 | RF-PRV-021 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:263 |
| CA-PRV-12 | RF-PRV-020, 025, 026 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:264 |
| CA-PRV-13 | RF-PRV-014, RN-PRV-019 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:265 |
| CA-PRV-14 | RN-PRV-041, 036 | Etapa 2 | Etapa 2 | no | integración | sí | etapa heredada del módulo (sin requisito con etapa) | modulos/proveedores-contratos.md:266 |
| CA-PRV-15 | RF-PRV-004, RN-PRV-037 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/proveedores-contratos.md:267 |
| CA-PRV-16 | RF-PRV-006, RN-PRV-034 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/proveedores-contratos.md:268 |
| CA-PRV-17 | RN-PRV-042 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:269 |
| CA-PRV-18 | RF-PRV-013, RN-PRV-040 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:270 |
| CA-PRV-19 | RN-PRV-015 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:271 |
| CA-PRV-20 | RF-PRV-002, RN-PRV-039 | Etapa 2 | Etapa 2 | no | integración | sí |  | modulos/proveedores-contratos.md:272 |
| CA-PRV-21 | RF-PRV-028 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:273 |
| CA-PRV-22 | RF-PRV-029, RN-PRV-043 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/proveedores-contratos.md:274 |

## GAR · Garantías y mantenimiento

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-GAR-01 | RF-GAR-001, 002, 005 | Etapa 4 | Etapa 5 | sí | unitaria | sí | Cubre requisitos de Etapa 4 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | modulos/garantias-mantenimiento.md:265 |
| CA-GAR-02 | RF-GAR-019, 028, RN-GAR-033 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:266 |
| CA-GAR-03 | RF-GAR-014 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:267 |
| CA-GAR-04 | RF-GAR-003, 004, 006, 008 | Etapa 4 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 4 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | modulos/garantias-mantenimiento.md:268 |
| CA-GAR-05 | RF-GAR-012, 013, 015, 016, 017, RN-GAR-019 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:269 |
| CA-GAR-06 | RF-GAR-014, 022, RN-GAR-028 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:270 |
| CA-GAR-07 | RF-GAR-023, RN-GAR-030 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:271 |
| CA-GAR-08 | RF-GAR-020, 021, RN-GAR-027 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:272 |
| CA-GAR-09 | RF-GAR-010, 011, RN-GAR-014 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:273 |
| CA-GAR-10 | RF-GAR-011, RN-GAR-016 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:274 |
| CA-GAR-11 | RF-GAR-018, 030, RN-GAR-022 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:275 |
| CA-GAR-12 | RF-GAR-025, RN-GAR-031 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:276 |
| CA-GAR-13 | RF-GAR-007, 009, RN-GAR-010 | Fase 2 | Fase 2 | no | navegador | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:277 |
| CA-GAR-14 | RN-GAR-037, 034 | Etapa 4 | Etapa 4 | no | integración | sí | etapa heredada del módulo (sin requisito con etapa) | modulos/garantias-mantenimiento.md:278 |
| CA-GAR-15 | RF-GAR-005, 008, RN-GAR-003 | Etapa 4 | Etapa 4 | no | unitaria | sí |  | modulos/garantias-mantenimiento.md:279 |
| CA-GAR-16 | RF-GAR-024, 026, 027, 029 | Fase 2 | Fase 2 | no | navegador | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:280 |
| CA-GAR-17 | RF-GAR-015, RN-GAR-038 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:281 |
| CA-GAR-18 | RN-GAR-039 | Etapa 4 | Etapa 4 | no | integración | sí | etapa heredada del módulo (sin requisito con etapa) | modulos/garantias-mantenimiento.md:282 |
| CA-GAR-19 | RF-GAR-030, RN-GAR-025 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:284 |
| CA-GAR-20 | RF-GAR-031, RN-GAR-041 | Fase 2 | Fase 2 | no | manual (con apoyo de integración) | no para la v1; sí para su módulo |  | modulos/garantias-mantenimiento.md:283 |

## NOT · Notificaciones

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-NOT-01 | RF-NOT-004, RF-NOT-013, RF-NOT-020; RN-NOT-011 | Etapa 1 | Etapa 5 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | modulos/notificaciones.md:256 |
| CA-NOT-02 | RF-NOT-005, RF-NOT-006; RN-NOT-001 | Etapa 1 | Fase 2 | sí | integración + navegador | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | modulos/notificaciones.md:257 |
| CA-NOT-03 | RF-NOT-003; RN-NOT-002 | Etapa 1 | Etapa 1 | no | integración | sí |  | modulos/notificaciones.md:258 |
| CA-NOT-04 | RF-NOT-024, RF-NOT-025, RF-NOT-026; RN-NOT-013, RN-NOT-021, RN-NOT-022 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/notificaciones.md:259 |
| CA-NOT-05 | RF-NOT-007, RF-NOT-027, RF-NOT-030; RN-NOT-003, RN-NOT-027 | Etapa 1 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Necesita un evento que avise a una Persona sin Usuario; no existe en la v1. | modulos/notificaciones.md:260 |
| CA-NOT-06 | RF-NOT-008, RF-NOT-009; RN-NOT-005 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/notificaciones.md:261 |
| CA-NOT-07 | RF-NOT-011, RF-NOT-012, RF-NOT-013, RF-NOT-014 | Etapa 1 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Resumen diario: NOT-completo (Fase 2). | modulos/notificaciones.md:262 |
| CA-NOT-08 | RF-NOT-019; RN-NOT-010 | Etapa 1 | Etapa 1 | no | integración | sí |  | modulos/notificaciones.md:263 |
| CA-NOT-09 | RF-NOT-020, RF-NOT-029; RN-NOT-016 | Etapa 1 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | modulos/notificaciones.md:264 |
| CA-NOT-10 | RF-NOT-021, RF-NOT-022, RF-NOT-023, RF-NOT-031, RF-NOT-032; RN-NOT-024 | Etapa 1 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | modulos/notificaciones.md:265 |
| CA-NOT-11 | RF-NOT-015, RF-NOT-016, RF-NOT-017, RF-NOT-018 | Etapa 1 | Fase 2 | sí | integración | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | modulos/notificaciones.md:266 |
| CA-NOT-12 | RF-NOT-001, RF-NOT-002; RNF-NOT-005 | Etapa 1 | Etapa 1 | no | unitaria | sí |  | modulos/notificaciones.md:267 |
| CA-NOT-13 | RF-NOT-003, RF-NOT-010, RF-NOT-034; RN-NOT-004, RN-NOT-020 | Etapa 1 | Fase 2 | sí | integración + navegador | la parte v1 sí; el resto es de su módulo | Cubre requisitos de Etapa 1 a Fase 2: se ejecuta completo en Fase 2. Partir por etapa. | modulos/notificaciones.md:268 |
| CA-NOT-14 | RF-NOT-019; RN-NOT-008 | Etapa 1 | Etapa 1 | no | integración + navegador | sí |  | modulos/notificaciones.md:269 |
| CA-NOT-15 | RN-NOT-001, RN-NOT-023; RNF-NOT-007 | Etapa 1 | Etapa 1 | no | integración + navegador | sí |  | modulos/notificaciones.md:270 |
| CA-NOT-16 | PS-214, PS-215, PS-218; RF-NOT-016 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/notificaciones.md:271 |
| CA-NOT-17 | RF-NOT-028 | Etapa 1 | Etapa 1 | no | integración | sí |  | modulos/notificaciones.md:272 |
| CA-NOT-18 | RF-NOT-033 | Etapa 1 | Etapa 1 | no | integración | sí |  | modulos/notificaciones.md:273 |
| CA-NOT-19 | RN-NOT-003, RN-NOT-006 | Etapa 1 | Etapa 1 | no | unitaria | sí | etapa heredada del módulo (sin requisito con etapa) | modulos/notificaciones.md:274 |
| CA-NOT-20 | RF-NOT-004, RF-NOT-007, RF-NOT-013, RF-NOT-033; RN-NOT-003, RN-NOT-005; RF-ACC-021 del núcleo | Etapa 1 | Etapa 5 | sí | integración | sí | Cubre requisitos de Etapa 1 a Etapa 5: se ejecuta completo en Etapa 5. Partir por etapa. | modulos/notificaciones.md:275 |

## LIC · Licencias

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-LIC-01 | alta y contrato único; RF-LIC-001, 002 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:245 |
| CA-LIC-02 | puestos por serie; RF-LIC-003, RN-LIC-006, 007 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/licencias-software.md:246 |
| CA-LIC-03 | último puesto; RF-LIC-005, RNF-LIC-003 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:247 |
| CA-LIC-04 | sobreasignación y duplicado; RF-LIC-005, 021, RN-LIC-008 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:248 |
| CA-LIC-05 | clave segura; RF-LIC-004, RN-LIC-015, 016 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:249 |
| CA-LIC-06 | permiso denegado; RF-LIC-004 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/licencias-software.md:250 |
| CA-LIC-07 | cuadre; RF-LIC-008, 009, RN-LIC-013, 014 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/licencias-software.md:251 |
| CA-LIC-08 | vigencia con reloj fijado; RF-LIC-010, RN-LIC-005, RNF-LIC-006 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:252 |
| CA-LIC-09 | cese de la Persona; RF-LIC-007, 020, RN-LIC-011 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:253 |
| CA-LIC-10 | asignación masiva; RF-LIC-006, RNF-LIC-002 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:254 |
| CA-LIC-11 | renovación y segunda persona; RF-LIC-011, RN-LIC-018, 020 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:255 |
| CA-LIC-12 | terminar; RF-LIC-012 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:256 |
| CA-LIC-13 | avisos con dos empresas y reloj fijable; RF-LIC-013, 014, RNF-LIC-005 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:257 |
| CA-LIC-14 | importación; RF-LIC-015, RN-LIC-028 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/licencias-software.md:258 |
| CA-LIC-15 | listas y exportación; RF-LIC-016, RNF-LIC-001, 007 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/licencias-software.md:259 |
| CA-LIC-16 | mis licencias y alcance propio; RF-LIC-018 | Fase 3 | Fase 3 | no | navegador | no para la v1; sí para su módulo |  | modulos/licencias-software.md:260 |
| CA-LIC-17 | costo y respaldo; RF-LIC-019, RN-LIC-022 | Fase 2 | Fase 2 | no | manual (con apoyo de integración) | no para la v1; sí para su módulo |  | modulos/licencias-software.md:261 |
| CA-LIC-18 | aislamiento; RN-LIC-001 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/licencias-software.md:262 |
| CA-LIC-19 | escritura con referencias cruzadas; RN-LIC-001 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/licencias-software.md:263 |
| CA-LIC-20 | serie sin clave; RN-LIC-017, RN-LIC-016 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/licencias-software.md:265 |

## LIN · Líneas móviles

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-LIN-01 | alta; RF-LIN-002, 003 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:246 |
| CA-LIN-02 | número repetido; RF-LIN-002, RN-LIN-002, RNF-LIN-002 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:247 |
| CA-LIN-03 | IMEI desde el equipo; RF-LIN-004, 011, RNF-LIN-007 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:248 |
| CA-LIN-04 | suspender; RF-LIN-005, RN-LIN-012 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:249 |
| CA-LIN-05 | equipo robado; RF-LIN-010, RN-LIN-010 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:250 |
| CA-LIN-06 | baja antes de permanencia; RF-LIN-006, 009, RN-LIN-022 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:251 |
| CA-LIN-07 | cese sin bloqueo; RF-LIN-017, 020, RN-LIN-009 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:252 |
| CA-LIN-08 | segunda persona y respaldo; RF-LIN-019, 022, RN-LIN-016, 017 | Fase 2 | Fase 2 | no | manual (con apoyo de integración) | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:253 |
| CA-LIN-09 | permisos y alcance propio; RF-LIN-014, 018, RNF-LIN-001, 006 | Fase 2 | Fase 3 | sí | integración + navegador | no para la v1; sí para su módulo | Cubre requisitos de Fase 2 a Fase 3: se ejecuta completo en Fase 3. Partir por etapa. | modulos/lineas-moviles.md:254 |
| CA-LIN-10 | planes y cargos; RF-LIN-001, 008, 015, 016, RN-LIN-014, 015 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:255 |
| CA-LIN-11 | importación; RF-LIN-013, RNF-LIN-004 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:256 |
| CA-LIN-12 | reingreso; RF-LIN-007, RN-LIN-021 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:257 |
| CA-LIN-13 | avisos con dos empresas y reloj fijable; RF-LIN-012, RNF-LIN-005, 008 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:258 |
| CA-LIN-14 | migración; RF-LIN-021, RN-LIN-024, 025 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/lineas-moviles.md:259 |
| CA-LIN-15 | aislamiento; RN-LIN-001 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/lineas-moviles.md:260 |
| CA-LIN-16 | escritura con referencias cruzadas; RN-LIN-001 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/lineas-moviles.md:261 |

## DOM · Dominios y certificados

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-DOM-01 | alta y unicidad; RF-DOM-001, RN-DOM-002, RNF-DOM-006 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:234 |
| CA-DOM-02 | vigencia con reloj fijado; RF-DOM-004, 005, RN-DOM-006, RNF-DOM-003 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:235 |
| CA-DOM-03 | avisos con dos empresas; RF-DOM-006, 019, RNF-DOM-002 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:236 |
| CA-DOM-04 | renovación de dominio; RF-DOM-007, 015 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:237 |
| CA-DOM-05 | reemplazo de certificado; RF-DOM-002, 003, 008 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:238 |
| CA-DOM-06 | sin secretos; RN-DOM-010, RNF-DOM-005 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:239 |
| CA-DOM-07 | permiso denegado; RF-DOM-010, RN-DOM-014, RNF-DOM-004 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:240 |
| CA-DOM-08 | aislamiento; RN-DOM-001 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/dominios-certificados.md:241 |
| CA-DOM-09 | cese sin bloqueo; RF-DOM-011, 018, RN-DOM-012 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:242 |
| CA-DOM-10 | riesgo de titular y baja; RF-DOM-009, 012 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:243 |
| CA-DOM-11 | segunda persona y respaldo; RF-DOM-016, 017, RN-DOM-016, 017 | Fase 2 | Fase 2 | no | manual (con apoyo de integración) | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:244 |
| CA-DOM-12 | importación; RF-DOM-013 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:245 |
| CA-DOM-13 | exportación y alcance; RF-DOM-014, RNF-DOM-007 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/dominios-certificados.md:246 |
| CA-DOM-14 | escritura con referencias cruzadas; RN-DOM-001 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/dominios-certificados.md:247 |

## AYU · Mesa de ayuda

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-AYU-01 | RF-AYU-001, RF-AYU-003, RF-AYU-004, RF-AYU-005; RN-AYU-003 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:315 |
| CA-AYU-02 | RF-AYU-002; RN-AYU-002, RN-AYU-029 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:316 |
| CA-AYU-03 | RF-AYU-005; RN-AYU-004 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:317 |
| CA-AYU-04 | RF-AYU-016, RF-AYU-017, RF-AYU-018; RN-AYU-006, RN-AYU-007; RNF-AYU-005 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:318 |
| CA-AYU-05 | RF-AYU-015; RN-AYU-006 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:319 |
| CA-AYU-06 | RF-AYU-013; RN-AYU-009; RNF-AYU-007 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:320 |
| CA-AYU-07 | RF-AYU-009; RN-AYU-011 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:321 |
| CA-AYU-08 | RF-AYU-009; RN-AYU-011 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:322 |
| CA-AYU-09 | RF-AYU-023, RF-AYU-025; RN-AYU-010 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:323 |
| CA-AYU-10 | RF-AYU-027; RN-AYU-008, RN-AYU-012 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:324 |
| CA-AYU-11 | RF-AYU-010, RF-AYU-011, RF-AYU-012; RN-AYU-015, RN-AYU-017, RN-AYU-018 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:325 |
| CA-AYU-12 | RF-AYU-019, RF-AYU-020; RN-AYU-020 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:326 |
| CA-AYU-13 | RF-AYU-006, RF-AYU-007, RF-AYU-008, RF-AYU-041; RN-AYU-018 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:327 |
| CA-AYU-14 | RF-AYU-030, RF-AYU-031, RF-AYU-035, RF-AYU-036; RN-AYU-023, RN-AYU-035 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:328 |
| CA-AYU-15 | RF-AYU-032, RF-AYU-033, RF-AYU-034; RN-AYU-024, RN-AYU-025 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:329 |
| CA-AYU-16 | RF-AYU-028, RF-AYU-029; RN-AYU-022 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:330 |
| CA-AYU-17 | RF-AYU-045; RN-AYU-027 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:331 |
| CA-AYU-18 | RF-AYU-014, RF-AYU-046; RN-AYU-025 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:332 |
| CA-AYU-19 | RF-AYU-026, RF-AYU-036; RN-AYU-019, RN-AYU-028, RN-AYU-030; RNF-AYU-004 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:333 |
| CA-AYU-20 | RF-AYU-047; RN-AYU-033 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:334 |
| CA-AYU-21 | RF-AYU-043, RF-AYU-044; RN-AYU-032 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:335 |
| CA-AYU-22 | RF-AYU-040, RF-AYU-048; RN-AYU-002 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:336 |
| CA-AYU-23 | RN-AYU-001; RNF-AYU-009 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:337 |
| CA-AYU-24 | RF-AYU-021, RF-AYU-022, RF-AYU-024, RF-AYU-042, RF-AYU-044; RN-AYU-001, RN-AYU-014 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:338 |
| CA-AYU-25 | RN-AYU-001; RF-AYU-001 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:339 |
| CA-AYU-26 |  | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/mesa-de-ayuda.md:340 |
| CA-AYU-27 | RF-AYU-037, RF-AYU-038, RF-AYU-039; RN-AYU-009, RN-AYU-027 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/mesa-de-ayuda.md:341 |

## ONB · Altas y bajas

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-ONB-01 | RF-ONB-001, 002, 004, 015, 016 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:202 |
| CA-ONB-02 | RF-ONB-003, 006; RN-ONB-002 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:203 |
| CA-ONB-03 | RF-ONB-005, 010, 011; RN-ONB-006 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:204 |
| CA-ONB-04 | RF-ONB-009; RN-ONB-008 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:205 |
| CA-ONB-05 | RF-ONB-014; RN-ONB-009 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:206 |
| CA-ONB-06 | RN-ONB-010; RNF-ONB-005 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/onboarding-offboarding.md:207 |
| CA-ONB-07 | RF-ONB-013; PS-203 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:208 |
| CA-ONB-08 | RN-ONB-017; RNF-ONB-006 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/onboarding-offboarding.md:209 |
| CA-ONB-09 | RN-ONB-001 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/onboarding-offboarding.md:210 |
| CA-ONB-10 | RF-ONB-007 | Fase 2 | Fase 2 | no | unitaria | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:211 |
| CA-ONB-11 | RN-ONB-007, 008 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/onboarding-offboarding.md:212 |
| CA-ONB-12 | RF-ONB-008; RN-ONB-018 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:213 |
| CA-ONB-13 | RF-ONB-011; RN-ONB-023 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:214 |
| CA-ONB-14 | RN-ONB-020 | Fase 2 | Fase 2 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/onboarding-offboarding.md:215 |
| CA-ONB-15 | RF-ONB-012 | Fase 2 | Fase 2 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/onboarding-offboarding.md:216 |

## POR · Portal

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-POR-01 | RF-POR-001, 002, 003, 005; RN-POR-001 | Fase 3 | Fase 3 | no | navegador | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:213 |
| CA-POR-02 | RN-POR-002; RNF-POR-007 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/portal-autoservicio.md:214 |
| CA-POR-03 | RN-POR-001, 002; RNF-POR-003 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/portal-autoservicio.md:215 |
| CA-POR-04 | RF-POR-006, 007, 016; RN-POR-018 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:216 |
| CA-POR-05 | RF-POR-002; RN-POR-011, 022; RNF-POR-008 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:217 |
| CA-POR-06 | RF-POR-004; RN-POR-011 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:218 |
| CA-POR-07 | RF-POR-013, 014, 017; RN-POR-005, 007 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:219 |
| CA-POR-08 | RF-POR-014; RN-POR-007 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:220 |
| CA-POR-09 | RN-POR-004 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/portal-autoservicio.md:221 |
| CA-POR-10 | RF-POR-009, 010, 015; RN-POR-009 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:222 |
| CA-POR-11 | RF-POR-008; RN-POR-008 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:223 |
| CA-POR-12 | RF-POR-011; RN-POR-020 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:224 |
| CA-POR-13 | RN-POR-003 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/portal-autoservicio.md:225 |
| CA-POR-14 | RF-POR-012; RN-POR-014, 015 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:226 |
| CA-POR-15 | RF-POR-011; RN-POR-011 | Fase 3 | Fase 3 | no | navegador | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:227 |
| CA-POR-16 | RF-POR-013; RN-POR-016 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/portal-autoservicio.md:228 |

## CMD · CMDB

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-CMD-01 | RF-CMD-001, RF-CMD-002, RF-CMD-003, RF-CMD-013, RN-CMD-002, RN-CMD-023, RN-CMD-025 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:219 |
| CA-CMD-02 | RF-CMD-010, RN-CMD-006 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:221 |
| CA-CMD-03 | RF-CMD-011, RF-CMD-020, RN-CMD-014, RN-CMD-015, RNF-CMD-001, RNF-CMD-006 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:223 |
| CA-CMD-04 | RF-CMD-006, RF-CMD-008, RN-CMD-005, RN-CMD-007, RN-CMD-008, RN-CMD-012 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:225 |
| CA-CMD-05 | RN-CMD-001, RN-CMD-027, RNF-CMD-005; aislamiento entre empresas | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:227 |
| CA-CMD-06 | RF-CMD-014, RNF-CMD-004; permiso denegado | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:229 |
| CA-CMD-07 | RF-CMD-009, RF-CMD-017, RN-CMD-004, RN-CMD-009, RN-CMD-011 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:231 |
| CA-CMD-08 | RF-CMD-015, RN-CMD-017, RN-CMD-019 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:233 |
| CA-CMD-09 | RF-CMD-004, RF-CMD-011, RN-CMD-016 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:235 |
| CA-CMD-10 | RF-CMD-012, RN-CMD-014, RN-CMD-021 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:237 |
| CA-CMD-11 | RF-CMD-005, RN-CMD-026 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:239 |
| CA-CMD-12 | RF-CMD-007, RN-CMD-003 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:241 |
| CA-CMD-13 | RF-CMD-016, RN-CMD-020, RNF-CMD-009 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:243 |
| CA-CMD-14 | RF-CMD-019 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:245 |
| CA-CMD-15 | RN-CMD-010, RN-CMD-021 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/cmdb-ligera.md:247 |
| CA-CMD-16 | RN-CMD-013 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/cmdb-ligera.md:249 |
| CA-CMD-17 | RN-CMD-018, RN-CMD-024 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/cmdb-ligera.md:251 |
| CA-CMD-18 | RN-CMD-028, RNF-CMD-007 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:253 |
| CA-CMD-19 | RN-CMD-029 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/cmdb-ligera.md:255 |
| CA-CMD-20 | RN-CMD-030 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/cmdb-ligera.md:257 |
| CA-CMD-21 | RNF-CMD-008 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/cmdb-ligera.md:259 |

## CAM · Cambios

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-CAM-01 | RF-CAM-001, 002, 006, 012, 019, RN-CAM-006, 010, 021, RNF-CAM-006, 008 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:249 |
| CA-CAM-02 | RN-CAM-001, RNF-CAM-004 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:251 |
| CA-CAM-03 | RN-CAM-002, 007, RF-CAM-018; permiso denegado | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:253 |
| CA-CAM-04 | RN-CAM-025, RF-CAM-015, RNF-CAM-005; aislamiento | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:255 |
| CA-CAM-05 | RF-CAM-004, RN-CAM-005, 009 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:257 |
| CA-CAM-06 | RF-CAM-011, RN-CAM-013, 014 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:259 |
| CA-CAM-07 | RN-CAM-011 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/gestion-cambios.md:261 |
| CA-CAM-08 | RF-CAM-003, 016, RN-CAM-008, RNF-CAM-003 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:263 |
| CA-CAM-09 | RF-CAM-014, RN-CAM-016, 017 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:265 |
| CA-CAM-10 | RF-CAM-013, RN-CAM-015 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:267 |
| CA-CAM-11 | RF-CAM-005, RN-CAM-003, 018 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:269 |
| CA-CAM-12 | RN-CAM-024, RNF-CAM-007 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:271 |
| CA-CAM-13 | RF-CAM-007, 008, RN-CAM-019, 020, 021 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:273 |
| CA-CAM-14 | RF-CAM-009, 010, RN-CAM-026, RNF-CAM-002 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:275 |
| CA-CAM-15 | RF-CAM-020, RN-CAM-023, RNF-CAM-009 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:277 |
| CA-CAM-16 | RNF-CAM-010 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:279 |
| CA-CAM-17 | RN-CAM-024, RNF-CAM-004 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:281 |
| CA-CAM-18 | RN-CAM-012, RF-CAM-012 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:283 |
| CA-CAM-19 | RN-CAM-027, 028, 029, RF-CAM-017 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-cambios.md:285 |

## PRB · Problemas

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-PRB-01 | RF-PRB-001, 002, 003, RN-PRB-003, RNF-PRB-006 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:218 |
| CA-PRB-02 | RF-PRB-003, RN-PRB-002 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:220 |
| CA-PRB-03 | RN-PRB-001, 018, RNF-PRB-004, 007, RF-PRB-016; aislamiento | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:222 |
| CA-PRB-04 | RF-PRB-015, RNF-PRB-001; permiso denegado | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:224 |
| CA-PRB-05 | RF-PRB-006, 007, 008, RN-PRB-004 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:226 |
| CA-PRB-06 | RF-PRB-009, RN-PRB-005, 009, RNF-PRB-002 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:228 |
| CA-PRB-07 | RF-PRB-010, 011, RN-PRB-006, 007 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:230 |
| CA-PRB-08 | RF-PRB-011, RN-PRB-006 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:232 |
| CA-PRB-09 | RF-PRB-012, 018, RN-PRB-008, 011 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:234 |
| CA-PRB-10 | RF-PRB-004, 005, RN-PRB-017, RNF-PRB-003 | Fase 3 | Fase 3 | no | navegador | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:236 |
| CA-PRB-11 | RF-PRB-014, RN-PRB-010 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:238 |
| CA-PRB-12 | RF-PRB-013, RN-PRB-012, 013, 014 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:240 |
| CA-PRB-13 | RN-PRB-009 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/gestion-problemas.md:242 |
| CA-PRB-14 | RF-PRB-017, RN-PRB-016, 019, 020, RNF-PRB-005 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:244 |
| CA-PRB-15 | RN-PRB-015 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/gestion-problemas.md:246 |
| CA-PRB-16 | RNF-PRB-008 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/gestion-problemas.md:248 |

## PRE · Presupuesto

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-PRE-01 | RF-PRE-001, RN-PRE-001, 002, 039 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:271 |
| CA-PRE-02 | RF-PRE-003, RF-PRE-004, RN-PRE-005, 007, 008 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:272 |
| CA-PRE-03 | RF-PRE-005 a 008, RN-PRE-010 a 012, 035 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:273 |
| CA-PRE-04 | RF-PRE-009, RN-PRE-009 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:274 |
| CA-PRE-05 | RF-PRE-023, 024, RN-PRE-003, 004 | Fase 3 | Fase 3 | no | navegador | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:275 |
| CA-PRE-06 | RF-PRE-014, RN-PRE-017, 018, RNF-PRE-003 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:276 |
| CA-PRE-07 | RF-PRE-015, RN-PRE-019 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:277 |
| CA-PRE-08 | RF-PRE-020, 021, RN-PRE-020, 021, 024, 028, RNF-PRE-006 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:278 |
| CA-PRE-09 | RF-PRE-016, RN-PRE-015, 016, 025, 031, RNF-PRE-004 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:279 |
| CA-PRE-10 | RN-PRE-030, RNF-PRE-008 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:280 |
| CA-PRE-11 | la sección 3, RN-PRE-036 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:281 |
| CA-PRE-12 | la sección 3 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:282 |
| CA-PRE-13 | RN-PRE-022, 023 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:283 |
| CA-PRE-14 | RF-PRE-010, 011, 025, RN-PRE-013 | Fase 3 | Fase 3 | no | manual (con apoyo de integración) | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:284 |
| CA-PRE-15 | RF-PRE-012, 013, RN-PRE-007, 014, 029 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:285 |
| CA-PRE-16 | RN-PRE-006 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:286 |
| CA-PRE-17 | RN-PRE-034, RF-PRE-011, RNF-PRE-008 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:287 |
| CA-PRE-18 | RF-PRE-022, RN-PRE-026, 027 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:288 |
| CA-PRE-19 | RF-PRE-026, RNF-PRE-001 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:289 |
| CA-PRE-20 | RN-PRE-033 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:290 |
| CA-PRE-21 | RF-PRE-002 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:291 |
| CA-PRE-22 | RF-PRE-017 a 019 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/presupuesto-costos.md:292 |
| CA-PRE-23 | RN-PRE-032 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:293 |
| CA-PRE-24 | RN-PRE-037 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:294 |
| CA-PRE-25 | RN-PRE-038 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:295 |
| CA-PRE-26 | RN-PRE-040 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/presupuesto-costos.md:296 |

## REP · Reportes

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-REP-01 | RF-REP-003, 004, 020, 023, RN-REP-026, 030, 031, RNF-REP-004 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:285 |
| CA-REP-02 | RF-REP-007, RN-REP-020, 043 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:286 |
| CA-REP-03 | RN-REP-034 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:287 |
| CA-REP-04 | RN-REP-001, RF-REP-002, 011, 024 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:288 |
| CA-REP-05 | RF-REP-013, RN-REP-005, 008 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:289 |
| CA-REP-06 | RF-REP-014, 015, RN-REP-007, 061 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:290 |
| CA-REP-07 | RN-REP-003, 004, 024 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/reportes-tableros.md:291 |
| CA-REP-08 | RF-REP-013, RN-REP-006 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:292 |
| CA-REP-09 | RF-REP-022, RN-REP-009, 011, RNF-REP-003 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:293 |
| CA-REP-10 | RF-REP-009, RN-REP-022, 053, 054 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:294 |
| CA-REP-11 | RF-REP-016 a 018, RN-REP-012 a 017, 062, RNF-REP-005 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:295 |
| CA-REP-12 | RF-REP-001, 008, 021, RN-REP-021, 047, 050 | Fase 3 | Fase 3 | no | navegador | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:296 |
| CA-REP-13 | RF-REP-010, RN-REP-057, 058 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:297 |
| CA-REP-14 | RF-REP-006, RN-REP-023, 029, 037, 039, 040 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:298 |
| CA-REP-15 | RF-REP-012, RN-REP-025 | Fase 3 | Fase 3 | no | navegador | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:299 |
| CA-REP-16 | RF-REP-019, RN-REP-018, 019 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:300 |
| CA-REP-17 | RF-REP-023, RN-REP-027, 059, RNF-REP-001, 002, 007 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:301 |
| CA-REP-18 | RN-REP-002 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/reportes-tableros.md:302 |
| CA-REP-19 | RN-REP-010 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/reportes-tableros.md:303 |
| CA-REP-20 | RN-REP-028, 052 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/reportes-tableros.md:304 |
| CA-REP-21 | RN-REP-060 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/reportes-tableros.md:305 |
| CA-REP-22 | RNF-REP-006 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/reportes-tableros.md:306 |

## INT · Integraciones y API

| CA | Cubre | Etapa del requisito | Se ejecuta completo en | Cruza | Tipo | Bloqueante | Nota | Archivo y línea |
|---|---|---|---|---|---|---|---|---|
| CA-INT-01 | RF-INT-001, 002, RN-INT-002 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:297 |
| CA-INT-02 | RF-INT-006, 007, RN-INT-007 a 009 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:298 |
| CA-INT-03 | RN-INT-001, RF-INT-006, RNF-INT-006 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:299 |
| CA-INT-04 | RN-INT-021, sección 3 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/integraciones-api.md:300 |
| CA-INT-05 | RF-INT-026, sección 3 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:301 |
| CA-INT-06 | RF-INT-005, 011, RN-INT-015, 016 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:302 |
| CA-INT-07 | RF-INT-003, 004, 025, RN-INT-004, RNF-INT-002 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:303 |
| CA-INT-08 | RF-INT-009, 010, RN-INT-047 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:304 |
| CA-INT-09 | RF-INT-008, RN-INT-010, 011 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:305 |
| CA-INT-10 | RN-INT-003, 006, 017, 018 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/integraciones-api.md:306 |
| CA-INT-11 | RF-INT-014, 015, RN-INT-014, 024 a 028, 030, RNF-INT-003 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:307 |
| CA-INT-12 | RF-INT-013, RN-INT-023 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:308 |
| CA-INT-13 | RF-INT-018, 019, RN-INT-034, 035, 038, 041 a 044, 049, RNF-INT-004 | Fase 3 | Fase 3 | no | integración + navegador | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:309 |
| CA-INT-14 | RF-INT-016, 018, RN-INT-036 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:310 |
| CA-INT-15 | RF-INT-020, 021, RN-INT-037 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:311 |
| CA-INT-16 | RF-INT-022, 023, RN-INT-031 a 033 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:312 |
| CA-INT-17 | RF-INT-008, RN-INT-046 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:313 |
| CA-INT-18 | RF-INT-012, RN-INT-005, 019, 020, RNF-INT-007, 008 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:314 |
| CA-INT-19 | RF-INT-017, RN-INT-039, 040 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:315 |
| CA-INT-20 | RF-INT-024, RN-INT-022 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:316 |
| CA-INT-21 | RN-INT-012 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/integraciones-api.md:317 |
| CA-INT-22 | RN-INT-013, 041 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/integraciones-api.md:318 |
| CA-INT-23 | RN-INT-029, 045 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo | Etapa heredada del módulo: el criterio solo cita reglas RN; confirmar con el escuadrón. | modulos/integraciones-api.md:319 |
| CA-INT-24 | RN-INT-048, RNF-INT-006 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:320 |
| CA-INT-25 | RNF-INT-001 | Fase 3 | Fase 3 | no | unitaria | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:321 |
| CA-INT-26 | RNF-INT-005 | Fase 3 | Fase 3 | no | integración | no para la v1; sí para su módulo |  | modulos/integraciones-api.md:322 |

---

*Fin. Si cambia un documento, se vuelve a generar con el mismo método (lectura de las tablas de requisitos y de los criterios) y se compara con esta versión.*

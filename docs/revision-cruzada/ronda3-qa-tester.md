# Ronda 3 · Conformidad final de QA (qa-tester)

**Qué revisé (abriendo los archivos):** `docs/documento-funcional.md` v0.3 completo (1.167 líneas, 309 requisitos RF/RNF, 22 reglas RN, 93 criterios CA), `docs/registro-permisos.md` (229 PS), `docs/equipo/decisiones.md` D-030 a D-064, `docs/operaciones/plan-entornos-y-costos.md` y los 17 módulos en v0.2 (los cinco con parte de la v1 los leí a fondo: personas-ubicaciones, entregas-devoluciones, proveedores-contratos parte A, garantias-mantenimiento parte A y notificaciones parte base; los otros doce, con comprobaciones automáticas y lectura de sus partes cruzadas).
**Cómo comprobé:** además de leer, corrí tres revisiones automáticas con scripts de lectura (no modifican nada): (1) cada fila RF/RNF del núcleo contra los CA que existen; (2) los nombres de permiso de todos los archivos contra el registro; (3) los identificadores duplicados entre archivos. Los resultados se citan abajo.
**Qué no hice:** no ejecuté pruebas, porque no hay código. No edité ningún documento revisado.

---

## 0. Resumen y veredicto en cinco líneas

1. De mis 22 hallazgos: **19 cerrados, 3 parciales, 0 abiertos** (sección 1).
2. Encontré **11 hallazgos nuevos** (2 altos, 8 medios, 1 bajo; sección 2). El más serio: el núcleo y el módulo de Personas se contradicen en qué pasa al cesar a alguien con cuenta (H-QA-23).
3. Cobertura requisito a criterio: **309 de 309 filas del núcleo citan un CA que existe** (0 citas rotas), pero hay 3 mal apuntadas, 18 de 22 reglas RN sin criterio que las cite y 12 requisitos cuyo criterio no los prueba de verdad (sección 3).
4. El plan de pruebas por etapa está actualizado con las decisiones D-035 a D-064 (sección 4). Los 15 criterios de integración siguen valiendo con cambios y agrego 2 (sección 5).
5. **Veredicto: conforme con observaciones.** Los mensajes enviados durante la revisión cerraron H-QA-23, 25, 26 y 29 en los archivos (verificado, sección 9). Mi visto bueno escrito para la condición 3 de D-064 queda sujeto a las condiciones restantes de la sección 7.

---

## 1. Estado de H-QA-01 a H-QA-22

Leyenda: **Cerrado** = lo corregido existe en el archivo citado y es probable; **Parcial** = se corrigió una parte; **Abierto** = no se tocó.

| ID | Estado | Prueba (archivo y sección o ID) | Observación de probabilidad |
|---|---|---|---|
| H-QA-01 Orden sin precios y borde del límite | **Cerrado** | `documento-funcional.md`: RF-OC-043 (línea 474), RN-017 (841), §12.2 filas Borrador a Pendiente y a Aprobada (492 y 493), CA-032 y CA-055 (933). | CA-055 da los tres casos del borde (5.000,00; 5.000,01; límite 0). Detalle menor en H-QA-32. |
| H-QA-02 Huecos de recepción | **Cerrado** | RF-OC-010, 032, 037, 049, 050 (472, 558, 563, 568, 569); §12.2 "Recibida total dura un instante" (508); CA-061 y CA-062 (939 y 941). | Falta decir qué pasa con un borrador de recepción a los 7 días (RF-OC-049) y probarlo con el reloj (en H-QA-30). |
| H-QA-03 Transiciones del activo | **Cerrado** | §11.2 tabla 5 por 5 (413 a 419); RF-INV-010, 024, 027, 028; CA-058 (915), CA-060 (921). | Las 25 combinaciones se generan solas. Falta una combinación-contexto: devolver mientras está En reparación (RF-INV-024 d) no está en CA-058. |
| H-QA-04 Importación | **Cerrado** | RF-IMP-004 a 010 (605 a 611); CA-056 (948); D-050; PRS: CA-PRS-11. | CA-038 junta 8 aserciones (ver H-QA-31); RF-IMP-008 y 009 (textos de estado) no tienen CA (H-QA-30). |
| H-QA-05 Auditoría vs anonimización | **Cerrado** | RF-AUD-014 a 016 (654 a 656); RF-DAT-011 (739); CA-054 (960); PRS: S-PER-07 "Rechazado y retirado" (línea 269). | CA-054 mezcla Etapas 2, 4 y 7 (ver H-QA-28). |
| H-QA-06 Intentos entre empresas | **Cerrado** | RF-AUD-010 (650); CA-066 (954); CA-002 (872); `auditoria.ver_seguridad` PS-19. | Transacción independiente y empresa del actor: ambos escritos y probables. |
| H-QA-07 Un catálogo de permisos | **Cerrado** | `registro-permisos.md`: 229 PS, 226 nombres técnicos únicos, 3 filas retiradas con motivo (PS-84, 85, 196), 0 duplicados. RF-ROL-004, 005, 014. Comprobación automática: ningún módulo usa un nombre fuera del registro (lo que aparece de `licencias.exportar`, `cmdb.importar`, etc. está solo en los cuadros de "qué cambió"). | El registro es Markdown con columnas distintas por sección (86 filas sin columna "Cuándo"). Se lee con un script; basta fijar el formato (H-QA-33). |
| H-QA-08 Una sola matriz | **Cerrado** | PS-24 (Almacén ve Personas con referencia), PS-26 (cesar: Administrador y Jefatura TI), PS-37 (proveedores solo Administrador), PS-55 a 57 (entregar: Administrador y Técnico), 7 plantillas en RF-ROL-002. Comparé las celdas de ENT, PRS y PRV con el registro: coinciden. | Verificado solo en los módulos de la v1; los de Fase 2 y 3 los revisa su escuadrón. |
| H-QA-09 Regla única de dinero | **Cerrado** | RN-017 y tabla de 12 actos (841 a 863); RF-OC-047 (531); RF-OS-008 (589); `RN-017` citada en DOM, CAM, PRB, LIC, LIN, AYU, PRE, PRV; LIC retiró RN-LIC-016/017. | Redacción dudosa en H-QA-32. |
| H-QA-10 Alcance por etapa | **Cerrado** | §2.2 tabla maestra (78 a 102); columna "Cuándo" en las tablas RF de los 17 módulos (comprobado: 17 de 17); §27. | Palabras "Etapa" y "Fase" separadas (§27, línea 1136). |
| H-QA-11 Módulos que cambiaban el núcleo | **Cerrado** | RF-SKU-013 y RF-CAT-028 (clave = campo secreto, 374 y 351); RF-CAT-029 y D-042 (número de línea); RF-CAT-006 (ubicaciones); RF-INV-008 (garantía como registro propio desde la Etapa 4); RF-CAT-027 (naturaleza); §2.2. | Coincide en núcleo, LIC, LIN, PRS, GAR y CMD. |
| H-QA-12 Procesos diarios y reloj | **Cerrado** | RNF-019 a 022 (769 a 772); CA-077 (966); D-038.4 y .8; CA-PRV-09, CA-GAR-14, CA-NOT-04 con reloj fijado y dos empresas. | CA-077 no da fechas (H-QA-31). Las vigencias ya no son un estado guardado (RN-018). |
| H-QA-13 Casos de derechos invisibles | **Cerrado** | RF-PER-012 (302); CA-076 (963); PS-29; AYU: RF-AYU-045 y CA-AYU-17 (lista, buscador global, exportación, tablero, SLA, API, aviso). | Probable: una prueba por cada vía listada. |
| H-QA-14 Límites de correo | **Cerrado** | RS-45 cuadro único (687); RN-NOT-009 y RN-POR-016 ambos "100 por empresa por día y 20 por administrador por hora"; RF-NOT-004 con excepciones por evento (línea 68); RF-ACC-017 con "5 intentos, 1, 2, 5 y 15 minutos" (193). | Tope por empresa con cupo propio para `compras.orden_por_aprobar` (CA-NOT-01). |
| H-QA-15 Cifras ausentes del núcleo | **Parcial** | Cerrado: RNF-004 medible (WCAG AA, 360 px, 44 px), volumen único 100.000 (RNF-010), §19.2 con 20 límites, RN-014 con columna de versión. | **Abierto:** (a) RNF-013 sigue siendo "donde se pueda, se puede corregir o deshacer": no verificable; (b) RF-INV-005 y RF-IMP-010 no dicen cómo detectar "ceros a la izquierda perdidos"; (c) P-013: los límites siguen siendo "propuesta del Analista" hasta que el Gerente de TI los fije. |
| H-QA-16 Redondeo e impuesto | **Cerrado** | RF-OC-045 con 3 ejemplos (476); CA-072 (935); RF-INV-026 (costo sin impuesto, 4 decimales). Recalculé los tres ejemplos: 36,58; 10,20 y 1.098 son correctos. | Los tres ejemplos no distinguen si el impuesto se calcula sobre el subtotal ya redondeado o sin redondear (dan igual). Propongo un cuarto ejemplo: 1 × 10,0050 con 50 %: subtotal 10,01; impuesto 5,01 si se calcula sobre el redondeado y 5,00 si no. |
| H-QA-17 Módulos activables | **Cerrado** | RF-EMP-005 (229); PS-09; CA-075 (964); registro §2 regla 4. | Probable (apagado: menú, permisos, API "no encontrado"). |
| H-QA-18 Lectura entre empresas del usuario | **Cerrado** | RF-ACC-012 (empresa en la dirección, 188); D-046 y D-039.4 (tabla resumen de no leídas por usuario); RF-NOT-034 y CA-NOT-13; CA-004 y CA-079. | Dos pestañas, dos empresas: CA-079 es ejecutable. |
| H-QA-19 Vocabulario de la Persona | **Cerrado** | Glosario "Baja / Cesar / Anular / Cancelar" (143); §26.3; RF-USR-003 y RF-USR-004 retirado; estados Activa, Cesada, Anonimizada (117). Búsqueda de "Persona dada de baja" en todos los archivos: 0 resultados. | Queda la contradicción de H-QA-23 (qué pasa con el acceso al cesar). |
| H-QA-20 Qué es "propio" | **Cerrado** | `registro-permisos.md` §2 (tabla de 9 resolvedores); RF-ROL-003 (254); CA-011b (882); CA-PRS-16. | CA-PRS-16 cita una regla equivocada (H-QA-31). |
| H-QA-21 CA que cruzan etapas | **Parcial** | CA-052 en a, b, c, d; CA-011 en a y b; CA-015 en a a d; CA-050 en a y b (D-060.10). | **Siguen cruzando etapas** CA-016, CA-052a/b, CA-054, CA-060, CA-064, CA-065 (detalle en H-QA-28). |
| H-QA-22 Menores | **Parcial** | IDs: 1.804 identificadores revisados, 0 duplicados (RF-PRS separó la colisión de RF-PER). RF-OC-044 versión de la orden. Vida útil de REP sale de la copia del activo (RN-REP-039). §27 actualizado. | **Abierto:** `docs/trazabilidad.md` y `docs/calidad/` no existen todavía (D-061.9 y D-064 condición 12). |

**Totales:** 19 cerrados, 3 parciales (H-QA-15, 21 y 22), 0 abiertos.

---

## 2. Hallazgos nuevos de esta ronda

Todos con hecho verificable. Gravedad: Alta = hay dos lecturas de una regla importante o bloquea una condición de D-064; Media = se puede probar pero con una suposición mía; Baja = orden y limpieza. **Ninguno lleva [ESCALAR AL CEO].**

| ID | Gravedad | Dónde | Hecho | Qué cambiar | Quién |
|---|---|---|---|---|---|
| H-QA-23 | **Alta** | Núcleo RF-PER-005 (línea 295) y CA-052a (956) frente a registro PS-26, PRS RN-PRS-011 y CA-PRS-05 (líneas 110 y 229) | El núcleo dice que cesar a una Persona "suspende al Usuario vinculado **solo si** quien cesa tiene además `usuarios.suspender`": el cese **se acepta** y, sin ese permiso, **la cuenta sigue activa**. PRS y PS-26 dicen que sin ese permiso el cese **se rechaza**. Son dos resultados opuestos para el mismo caso, y el primero deja a una persona que salió de la empresa con acceso. D-061.7 dice "el cese suspende al Usuario vinculado". | Dejar una sola regla. Recomiendo la de PRS (si hay membresía vinculada y quien cesa no puede suspender, se rechaza con "pida a un administrador"): nadie queda cesado con acceso. Reescribir RF-PER-005 y CA-052a así, y agregar un caso: Administrador cesa y la sesión del cesado muere en su siguiente acción. | analista-funcional (decide gerente-ti) |
| H-QA-24 | **Alta** | `docs/operaciones/plan-entornos-y-costos.md` (escrito contra la v0.2 y D-001 a D-029; ver líneas 4, 148, 77, 76) | Está desactualizado frente a D-038, D-039, D-055 y D-064: supone **Vercel** (D-038 exige ejecución continua con un trabajador); define **3** roles de base (D-039 son 5); pide "unas 20" conexiones (D-055 prueba con 20 y con 50); no menciona el reloj fijable ni el disparador de procesos (RNF-020), la cola, ni el correo de captura legible en pruebas; la prueba de rendimiento queda en la Etapa 7 (RNF-011 la quiere nocturna desde la Etapa 4). Bloquea las condiciones 4, 5, 11 y 12 de D-064. Detalle en la sección 6. | Reeditar el plan a la v0.3 con D-035 a D-064 y los puntos de la sección 6. | devops |
| H-QA-25 | Media | CA-082b (línea 926) frente a RN-GAR-003 y CA-GAR-01 y 15 (`garantias-mantenimiento.md` líneas 107, 261, 273) | CA-082b: "comprado el 15/01/2026 con 24 meses: el fin es 15/01/2028". La regla de GAR: "inicio más meses **menos un día**", y su propio ejemplo da 15/03/2024 + 36 meses = 14/03/2027. Con la misma regla el criterio del núcleo debería dar **14/01/2028**. Además el orden de la regla es ambiguo: "sumar y luego restar" da 27/02 para 31/01 + 1 mes, y CA-GAR-15 espera 28/02; solo sale 28/02 si se **resta el día primero** y luego se suman los meses ajustando al último día del mes. | Escribir la fórmula exacta en el núcleo (RF-INV-008) y en RN-GAR-003: **(inicio menos 1 día) más los meses, ajustando al último día del mes**. Cambiar CA-082b a 14/01/2028. Con esa fórmula, CA-GAR-01 (14/03/2027), CA-GAR-15 (28/02 y 28/02/2029) y CA-GAR-04 quedan correctos. | analista-funcional, escuadrón A |
| H-QA-26 | Media | RF-INV-008, RF-INV-029, RF-INV-030 (líneas 394, 428, 441) | Citan **CA-082, CA-081 y CA-079**, que son otros criterios (códigos de recuperación, segunda verificación por permiso, dos pestañas). Los correctos son CA-082b, CA-081b y CA-079b. Una herramienta de trazabilidad daría "cubierto" a requisitos que apuntan a la prueba equivocada. | Corregir las tres citas. | analista-funcional |
| H-QA-27 | Media | Núcleo §21 (tabla RN) y RNF de los módulos | La tabla de reglas RN **no tiene columna CA**: 18 de las 22 reglas (RN-002, 003, 005, 006, 008, 009, 010, 011, 012, 013, 015, 016, 017, 018, 019, 020, 021, 022) no aparecen citadas en ningún criterio de la sección 22. En los módulos con parte v1, los requisitos de calidad RNF no tienen CA: ENT 7 de 9, GAR 8 de 8, NOT 10 de 10, PRS 8 de 9, PRV 8 de 8. (Método: busqué el identificador dentro de los textos de los CA.) | Agregar la columna CA a la tabla RN (varias se cubren con criterios que ya existen: RN-005 con CA-023, RN-006 con CA-040, RN-010 con CA-012 y 013, RN-017 con CA-055, RN-012 con CA-017). Para RN-008 (motivo en 9 acciones), RN-015 y RN-016 hace falta un CA nuevo. Para los RNF de módulos, citar el CA del núcleo que los cubre (CA-050a, CA-053, CA-077, CA-001) o crear uno. | analista-funcional; QA lo vuelca a `docs/trazabilidad.md` |
| H-QA-28 | Media | CA-016, CA-052a, CA-052b, CA-054, CA-060, CA-064, CA-065; CA-NOT-05, CA-NOT-07; CA-PRV-04 | Siguen mezclando etapas o necesitando módulos que no existen en la v1: CA-016 (RF-PER de la Etapa 2) se prueba "entregando una laptop" (Etapa 4); CA-052a pide "una línea y un dominio a su cargo" (módulos de Fase 2) y un activo (Etapa 4); CA-052b exige pendientes que no existen sin inventario; CA-054 pasa por la Etapa 2 (nombre), la 4 (acta) y la 7 (restaurar respaldo); CA-060 y CA-065 necesitan activos o unidades (Etapa 4); CA-064 necesita unidades y garantía; CA-NOT-05 necesita un evento que avise a una Persona sin Usuario (no existe en la v1); CA-NOT-07 (resumen diario) es Fase 2 y lo cita RF-NOT-013 de la v1; CA-PRV-04 usa un contrato Vigente (PRV-B, Fase 2) y lo cita RF-PRV-003 de la v1. | Agregar a cada CA el campo "Se ejecuta en: Etapa N" y partir los que cruzan: CA-052a (con activos, Etapa 4; con líneas y dominios, Fase 2), CA-054 en a (Etapa 2), b (Etapa 4) y c (Etapa 7). Para PRV-A agregar un CA de v1: desactivar un proveedor con una orden abierta se rechaza. | analista-funcional (QA propone la partición) |
| H-QA-29 | Media | RF-ACC-021 (197), `notificaciones.md` §8 | La segunda mitad del requisito de correo de la v1 ("aviso a quien creó cuando se aprueba o rechaza") **no tiene ningún criterio**: CA-074 prueba solo el contenido mínimo y CA-NOT-01 solo el aviso a quien aprueba. Los eventos `compras.orden_aprobada` y `compras.orden_rechazada` no aparecen en ningún CA. | Agregar CA-NOT-20 (v1, Etapa 5): "Dado una orden Pendiente de Ana, cuando otra persona la aprueba o rechaza con motivo, entonces Ana recibe un correo inmediato con código, estado y motivo, sin importes". | escuadrón C (notificaciones) |
| H-QA-30 | Media | Núcleo y módulos de la v1 | Requisitos cuyo criterio citado **no los prueba** (lectura del texto del CA): RF-ACC-006 (el enlace dura 15 minutos y sirve una vez: CA-068 solo prueba el filtro de correo), RF-ACC-014 (30 minutos y 12 horas: CA-069 prueba el aviso a los 25), RF-ACC-020 (aviso de dos administradores), RF-PLA-009 (acceso de emergencia: CA-015c solo prueba el rescate), RF-PLA-010 (subir topes), RF-EMP-004 (calendario), RF-IMP-008 y 009 (textos de estado), RF-IMP-015 (10 importaciones por día), RF-CAT-026 (contactos: anonimizar y no exportar), RF-OC-048 (informe de sin respaldo y compra fraccionada), RF-ROL-015 (prueba de dependencias circulares), RF-ENT-002 y 016 (borrador y renovar préstamo: ambos citan CA-ENT-01, que no los prueba), RF-OC-049 (borrador de 7 días), y CA-070 no prueba la confirmación del segundo administrador ni el resumen mensual de RF-OC-026. | Un CA breve por cada uno, o ampliar el CA citado. QA los redacta en `docs/calidad/` si el Analista lo prefiere. | analista-funcional, QA |
| H-QA-31 | Media | CA-ENT-08, CA-ENT-10, CA-077, CA-006, CA-PRS-14, CA-PRS-16, CA-038, CA-053, CA-054 | Criterios con ambigüedad que impide ejecutarlos: CA-ENT-10 dice "cuando pasa el tiempo" (sin cuánto ni reloj); CA-ENT-08 no dice cómo provocar "falla la entrega de uno"; CA-077 dice "reloj fijado" sin fechas ni datos; CA-006 pide "el mismo tiempo de respuesta" sin tolerancia (propongo diferencia menor a 100 ms en el percentil 95 sobre 200 intentos); CA-PRS-14 dice "cesada hace más de 2 años" pero la anonimización manual por derechos no exige plazo (RN-PRS-020); CA-PRS-16 cita RN-PRS-004 (referencia) cuando prueba el alcance propio. Además tres CA juntan demasiadas aserciones (CA-038: 8; CA-053: 10; CA-054: 8), lo que impide saber cuál falló. | Dar fechas y números a cada uno; partir CA-038, 053 y 054 en a, b, c. | analista-funcional |
| H-QA-32 | Media | RN-017 (841), RF-OC-016 (526), tabla de actos (848 a 863) | La regla dice "un documento sin costo no se aprueba", pero la misma tabla manda aprobar "siempre" un cambio y un presupuesto. Y RF-OC-016/CA-055 dicen "con límite 0, toda orden con al menos una línea pasa por aprobación", mientras RF-OC-043 permite una orden con todas las líneas "sin costo" (total 0): la regla no dice cuál gana. | Cambiar a "un documento sin costo no pasa por la regla de dinero (los actos 'siempre' de la tabla son otra regla)". Para la orden con todas las líneas "sin costo": decidir si pasa por aprobación; recomiendo que sí cuando el límite es 0. | analista-funcional, gerente-ti |
| H-QA-33 | Baja | `registro-permisos.md` §8 a §12; D-061.9 | (a) 86 de las 229 filas no tienen columna "Cuándo" (el valor está en el título de la sección). (b) `docs/calidad/` y `docs/trazabilidad.md` no existen. | (a) Poner la columna "Cuándo" en todas las filas (o declarar que se lee del título). (b) QA los crea al empezar la Etapa 0 (ver sección 4). | analista-funcional, QA |

---

## 3. Cobertura de requisitos por criterios de aceptación

### 3.1 Qué comprobé y qué salió

| Comprobación (automática) | Resultado |
|---|---|
| Filas RF y RNF del núcleo | 309 (más 3 retiradas) |
| Filas con un CA citado en la columna "CA" | **309 de 309** |
| CA citados que no existen | **0** |
| CA definidos (con sufijos) y números distintos | 93 y 82 (coincide con los "82 criterios") |
| CA que ninguna fila cita | 4: CA-003, CA-051 (los cubre un RS y RN-014), CA-079b y CA-082b (consecuencia de H-QA-26) |
| Filas que apuntan al CA equivocado (el que pide el sufijo) | 3 (H-QA-26) |
| Reglas RN con un CA que las cite | 4 de 22 (RN-001, 004, 007, 014) (H-QA-27) |
| Módulos: filas RF con CA citado y existente (17 módulos) | RF: 0 sin CA, 0 citas rotas. Las RNF de módulos no tienen columna CA (H-QA-27) |
| Identificadores duplicados entre los 18 archivos | 0 de 1.804 |
| Permisos fuera del registro | 0 (los 3 PS "faltantes" son filas retiradas) |

Esto prueba la cobertura **nominal** (cada requisito dice qué criterio lo prueba). La cobertura **sustancial** (el criterio de verdad lo prueba) la revisé leyendo los textos: el resultado está en H-QA-30 (14 casos) y H-QA-28 (criterios que no corren en su etapa).

### 3.2 Módulos de la v1 (Etapas 2 a 5): ¿cada RF/RN tiene un CA?

| Módulo (parte v1) | RF | Con CA que existe | RN sin CA que las cite | Observaciones concretas |
|---|---|---|---|---|
| Núcleo | 309 | 309 | 18 de 22 | H-QA-26, 27, 28, 30 |
| PRS (Personas, Etapa 2) | 17 | 17 | 15 de 32: RN-PRS-002, 003, 006, 007, 009, 010, 015, 019, 022, 023, 025, 026, 027, 029, 031 | Importante sin CA: RN-PRS-009 (nadie cesa a su propia Persona), RN-PRS-025 (ubicación con activos no se inactiva), RN-PRS-006 (homónimo con aviso en la alta manual) |
| ENT-A (Etapa 4) | 11 de 16 son v1; todos con CA | sí | 13 de 29: RN-ENT-004, 008, 009, 013, 015, 017, 020, 021, 022, 024, 027, 028, 029 | Importante sin CA: RN-ENT-004 (no se entrega "Dañado"), RN-ENT-013, RN-ENT-017 (préstamo máximo 365 días, requiere reloj) |
| PRV-A (Etapa 2 y 5) | 7 de 29 son v1 | sí | RN de la parte v1 sin CA propio: RN-PRV-001 a 009 (proveedor y contactos) | Solo CA-PRV-01, 03, 15, 16, 20 corren en la v1; CA-PRV-04 no (H-QA-28) |
| GAR-A (Etapas 4 y 5) | 6 de 30 son v1 | sí | RN-GAR-001, 002, 004, 005, 006, 007 y otras de la parte v1 sin CA | CA-GAR-01, 15 y 04 cubren el cálculo; contradicción de fecha en H-QA-25 |
| NOT-base (Etapa 1) | 15 de 34 son v1 | sí | RN-NOT-001 a 007 sin CA propio | Falta CA del aviso de decisión (H-QA-29) |

(La cifra de RN sin CA sale de buscar el identificador en los textos de los criterios; puede haber reglas cubiertas sin citarse. Por eso la acción que propongo es agregar la cita, no necesariamente un criterio nuevo.)

### 3.3 ¿Cada CA es ejecutable sin ambigüedad?

Revisé los 82 criterios del núcleo y los de los cinco módulos de la v1 con tres preguntas: ¿tiene datos?, ¿tiene resultado esperado exacto?, ¿necesita reloj y lo dice?

| Respuesta | Cantidad aproximada | Ejemplos |
|---|---|---|
| Ejecutable tal cual | La mayoría: CA-001 a 005, 007 a 014, 017 a 028, 029 a 037, 043, 045, 047, 056, 058, 059, 063, 066, 067, 070, 071, 072, 075, 079, 081, 082 y los CA-PRS/ENT/PRV/GAR con datos | CA-055 (5.000,00 / 5.000,01 / límite 0), CA-072 (tres valores), CA-058 (25 combinaciones), CA-018 (20 usuarios) |
| Ejecutable con una aclaración | 12 | CA-006, CA-077, CA-ENT-08, CA-ENT-10, CA-PRS-14 (H-QA-31) |
| No ejecutable en la etapa de su requisito | 10 | CA-016, 052a, 052b, 054, 060, 064, 065, NOT-05, NOT-07, PRV-04 (H-QA-28) |
| Resultado esperado contradictorio | 1 | CA-082b (H-QA-25) |
| Depende de un entorno que aún no existe (no es defecto del criterio) | 4 | CA-040 (copia externa), CA-053, CA-054 (restaurar), CA-077 (disparador) → condiciones de DevOps (sección 6) |

---

## 4. Plan de pruebas por etapa, actualizado

Lo que cambia respecto de mi plan de la ronda 2: la cola de trabajos en PostgreSQL y el trabajador (D-038); los cinco roles de base de datos (D-039); la empresa en la dirección (D-046); la importación todo o nada con huella (D-050); el acta con copia del nombre (D-051); la recepción con borrador y tope de 1.000 series (D-060); el interruptor único con ocho casillas (D-043); los procesos con dos empresas (D-039.6) y vigencias al leer (D-062); la cuenta global y la membresía (D-041); la naturaleza de la categoría (D-045).
Convención: **B** = bloqueante, **S** = seguimiento. Todas las etapas incluyen: aislamiento de **cada módulo y cada tabla nueva** con `app_empresa` y por **identificador interno**; permiso denegado por petición directa de cada acción nueva; regresión de las etapas anteriores; y el proceso diario del módulo (si lo hay) corrido con dos empresas.

### 4.1 Pruebas transversales que se repiten (se escriben una vez, corren siempre)

| Prueba | Qué hace | Dónde corre |
|---|---|---|
| **Matriz de permisos** | Lee `registro-permisos.md` y lanza una petición directa por celda: **482 celdas en la v1** (68 filas por 7 plantillas, más 6 filas de plataforma). Verifica sensibles (segunda verificación), alcance "propio" con y sin Persona, módulos apagados ("no encontrado") y que el código no use un permiso fuera del registro | Cada cambio |
| **Roles de base** | Verifica que `app_empresa` no es dueño, no tiene BYPASSRLS y no es superusuario; que `app_plataforma` solo ve tablas globales; que `mantenimiento` solo archiva por partición; que `lector_auditoria` solo lee; que nadie edita ni borra la auditoría | Cada cambio |
| **Aislamiento por módulo** | Dos empresas con los mismos códigos, series, correos e identificaciones fiscales; un usuario de A pide listado, búsqueda, identificador interno y número visible de B; consulta sin filtro devuelve vacío | Cada cambio |
| **Patrones de concurrencia (T-11)**, una prueba por patrón, contra PostgreSQL real | (1) índice único parcial "una vigente": asignación y puesto; (2) actualización condicional con estado esperado: aprobar y recibir; (3) capacidad con CHECK: stock y puestos; (4) clave de idempotencia: confirmar recepción y entrega con doble clic; (5) columna de versión: edición simultánea (CA-051). Con 20 y con 50 conexiones simultáneas | Cada cambio (20); nocturna (50) |
| **Procesos con dos empresas** | Reloj fijado; el proceso corre dos veces: cada aviso y registro de corrida queda en su empresa; un día perdido se recupera en orden; una empresa suspendida se salta | Cada cambio (con reloj) |
| **Cola y trabajador** | Trabajo idempotente; reintento; dos trabajadores con `SKIP LOCKED` no repiten; reiniciar el trabajador a mitad de una importación no duplica ni pierde; el trabajo corre con la empresa fijada | Cada cambio |
| **Nombre canario** | Registrar una Persona "canario" y buscarla en base, exportaciones, correos capturados y registros técnicos (CA-073) | Cada cambio |
| **Interruptor único** | Para cada una de las **8 casillas** (compras, recepción, presupuestos, contratos, licencias, mesa de ayuda, cambios, problemas) y su acto: apagada rechaza; activa acepta con aviso y auditoría; vencida (reloj +90 días) rechaza; con dos o más administradores exige confirmación de un segundo; el Administrador de plataforma no puede activarla; la autoentrega se rechaza **aunque estén las 8 activas** | Etapa 5 |

### 4.2 Etapa por etapa

| Etapa | Qué se prueba | Con qué datos | Bloqueante (B) / seguimiento (S) |
|---|---|---|---|
| **0 · Validación** | **Prototipo técnico de 3 a 4 días (D-055)**, que QA mide con criterios de éxito: (1) los 7 de aislamiento (consulta sin filtro = 0 filas ajenas; insertar con empresa ajena falla; clave foránea cruzada falla; UPDATE y DELETE ajenos afectan 0; 50 peticiones intercaladas sobre un grupo compartido sin empresa pegada; conexión limpia tras error; el rol no modifica la auditoría); (2) tabla particionada, índice parcial, consulta recursiva, actualización condicional, SECURITY DEFINER y los 5 roles; (3) sesiones en base, enlace con botón atado al navegador, segunda verificación y espera 1, 2, 5, 15; (4) cola y trabajador (reintento, `SKIP LOCKED`, idempotencia, reinicio); (5) 20 y 50 conexiones simultáneas sobre contadores. **Todo con el proveedor candidato y su agrupador de conexiones**, con `app_empresa`. Además: prueba de tareas de las 26 pantallas A con 5 personas no técnicas (recepción de 38 series, buscar un equipo, entregar, aprobar); este plan copiado a `docs/calidad/`; `docs/trazabilidad.md` creado | Dos empresas mínimas; una tabla de ejemplo; generador de datos | **B:** los 5 grupos del prototipo, con el rol sin privilegios (condición 4 de D-064); plan y entorno (condición 12). **S:** tiempos de las tareas |
| **1 · Cimientos** | Invitación (2.ª vez, 8 días, otro correo, mayúsculas; el texto no revela si el correo tenía cuenta: CA-005); sin registro abierto ni filtración, 5 intentos con esperas 1, 2, 5, 15 y tiempos iguales (CA-006); segunda verificación por permiso, no por nombre de rol, con un rol personalizado "Contador" (CA-007, 081); códigos de recuperación (CA-082); enlace atado al navegador, 15 minutos, un solo uso (CA-068 y los casos de H-QA-30); sesiones 30 minutos / 12 horas / aviso a 25 (CA-008, 069); último administrador, sin autoescalada (CA-009, 010); matriz de 482 celdas (CA-011a, b); doble control del Administrador (CA-012); Administrador de plataforma: no ve negocio por el rol de base, soporte de solo lectura 24 horas, rescate con control dual, empresas, acceso de emergencia (CA-015a a d, RF-PLA-009 y 010); roles plantilla (CA-047); aviso de privacidad (CA-049); cambio de empresa por dirección y dos pestañas (CA-004, 079); auditoría solo-agregar, qué se audita, eventos de seguridad aparte (CA-040, 041, 066, 002); cuenta global y membresía; moneda, zona y calendario (CA-071); módulos activables (CA-075); procesos y reloj (CA-077); NOT-base: invitación, enlace, aviso a quien aprueba (CA-NOT-01, 12, 13, 14, 18) con límites del cuadro RS-45 | Empresas A, B y C; 7 plantillas por empresa; usuario en A y B; administrador con y sin 2F; correos con mayúsculas y `+etiqueta`; rol "Contador" | **B:** CA-001 a 011b, 015a a d, 040 a 042, 047, 049, 066, 068, 069, 071, 075, 077, 079, 081, 082; matriz sin celdas sin probar; reloj y disparador operativos. **S:** CA-050a/b a lo ya construido |
| **2 · Catálogos y Personas** | Catálogos por empresa y desactivar, no borrar (CA-045); prefijo 2 a 5 y reservados (`OC`, `OS`, `ACT`…) (CA-017); ubicaciones en árbol de 3 niveles, ciclos, mover sin escribir movimientos por activo (CA-060, CA-PRS-08); campos de 6 tipos: obligatorio vacío, texto en número, opción inexistente (CA-020); no borrar ni cambiar tipo con datos (CA-021); campo secreto e identificador (CA-065, CA-042 parte secreta); naturaleza (CA-064 parte categoría); Personas: alta, homónimo con aviso, correo único Unicode (CA-016, PRS-01, 02); `datos_personales.ver` y referencia `PRS-0042` (CA-011b, PRS-07); vínculo 1 a 1 (PRS-10); cese **sin bloqueo** y regla de la suspensión (CA-052a parte Etapa 2, H-QA-23); anonimizar a dos personas (PRS-06, 14 parte Etapa 2); solicitudes de derechos invisibles por todas las vías (CA-076, PRS-15); proveedor: identificación fiscal normalizada (CA-PRV-01), contactos, exportación sin contactos (PRV-15), anonimizar contacto (PRV-16); puerta única de exportación: motivo, 10 por hora, 50.001 filas, hoja "Aviso", columnas omitidas, fórmulas como texto (CA-043, 067) | 4 categorías (LAP, CEL, PER, LIC), 8 campos de los 6 tipos, 30 Personas con 2 homónimos y 1 canario, catálogos de 200 valores, ubicaciones de 3 niveles con 40 hijos | **B:** CA-016 (parte Etapa 2), 017, 020, 021, 043, 045, 060, 065, 067, 076; CA-PRS-01 a 10, 15; aislamiento de catálogos y Personas; validación en el servidor. **S:** rendimiento de listas |
| **3 · SKU** | **Correlativo con 20 y con 50 usuarios simultáneos** (CA-018); código propio y salto del contador (CA-019); sin permiso `skus.codigo_propio` ni por petición directa; no se reutiliza un código; `lap-0001` igual a `LAP-0001 `; mismo código en A y B (CA-017); modo de control y categoría inmutables con existencias (CA-022); SKU por serie sin serie (CA-023 inicio); decimales por unidad de medida; más de 9.999 códigos; stock mínimo opcional; SKU inactivo no entra a órdenes nuevas (CA-061 parte) | Contador de `LAP` en `LAP-0010`; 50 conexiones; SKU por serie y por cantidad | **B:** CA-017, 018 (con PostgreSQL real, 1.000 corridas sin repetidos), 019, 022 |
| **4 · Inventario e importación** | Serie duplicada y normalización (CA-023); **las 25 combinaciones de estado** más la combinación-contexto de devolver en reparación (CA-058); responsable por estado forzado desde la base; asignación única con 2 y con 20 técnicos (CA-025, CA-ENT-03); stock nunca negativo (CA-026); traslado (CA-027); reingreso del mismo registro (CA-028); ingreso manual (CA-059); cambio de ubicación (CA-060); corregir costo (CA-063); **acta**: PDF, sin `datos_personales.ver` omite nombre y área, copia del nombre hasta `retener_hasta`, texto malicioso (CA-046, CA-ENT-12, 13, 14, CA-078); autoentrega sin excepción (CA-079b, CA-ENT-09); pendiente de devolución (CA-081b); garantía: fórmula con fin = (inicio menos 1 día) más meses (CA-082b corregido, CA-GAR-01, 15); clave de licencia: cifrada, enmascarada (16 o más), revelación con reautenticación, 20 por hora, 30 segundos (CA-042); **importación todo o nada con huella**: 100 filas con 3 inválidas; el mismo archivo ya confirmado se rechaza con fecha y lote; el corregido carga; fila que ya existe = error de fila; deshacer = anular y solo sin movimientos posteriores (secuencia, no hora); `3,5E+14`; fórmulas; columna de empresa; 5.001 filas; 10 MB; UTF-8 con tildes; encabezados cambiados; una importación a la vez; SKU y marcas desconocidos listados para aprobar (CA-038, 039, 056, CA-PRS-11); edición simultánea (CA-051); **carga nocturna 100.000 activos desde esta etapa** (RNF-011) | Archivo válido de 5.000 filas; 12 archivos sucios (uno por caso); 100.000 activos y 500.000 movimientos de volumen; Personas anonimizadas para actas | **B:** CA-023 a 028, 038, 039, 042, 046, 056, 058, 059, 060, 063, 079b, 081b, 082b; CA-ENT-01 a 14; ninguna clave en claro (base, auditoría, registros, exportaciones); dos asignaciones simultáneas = una; importación todo o nada con la huella. **S:** rendimiento con 100.000 |
| **5 · Compras y recepción** | Las 18 transiciones válidas de la OC y todas las demás rechazadas (CA-029); edición de aprobada: vuelve a Pendiente, sube la versión, el editor no reaprueba (CA-030); aprobación por monto: 3.000, 8.000, otra moneda, aprobación apagada (CA-031); **borde exacto 5.000,00 / 5.000,01 / límite 0 y orden sin precios** (CA-055, 032); redondeo con 4 ejemplos (CA-072); doble control: quien crea o edita no aprueba, aprueba no recibe, también el Administrador (CA-012, 013); **ocho casillas** (4.1); recepción parcial y total con series (CA-033); recepción inválida: 7 de 6, 3 series de 4, serie repetida, nada a medias (CA-034); doble clic y dos personas a la vez (CA-035); borrador de 7 días, tope de 1.000 series, recibir con SKU o proveedor desactivado (CA-061); reversión por cantidad con saldo negativo, y de orden cerrada (CA-062, 036); anulación y cierre manual (CA-037); PDF de la orden con texto malicioso (CA-078); avisos por correo a quien aprueba **y a quien creó** (CA-NOT-01 y CA-NOT-20 propuesto); órdenes de usuarios dados de baja (CA-052d); cambio de moneda base con órdenes abiertas (CA-071) | OC de 10 con 4 recibidas; límite 5.000; 2 monedas; Solicitante sin precios; Almacén; 8 casillas | **B:** CA-011a, 012 a 014, 029 a 037, 055, 061, 062, 070, 072, 078; ninguna recepción deja activos a medias en 200 corridas con corte de conexión inyectado. **S:** textos de error comprensibles con 5 personas |
| **6 · Órdenes de servicio** | Flujo Creada, Asignada, En ejecución, Cerrada, Cancelada (CA-044); una cerrada no se reabre; abrir o cerrar no cambia el estado del activo; "Pedir ayuda" crea una OS en Creada (CA-080); costo real, moneda, centro de costo y "cubierta por garantía"; aprobación solo si supera el límite (CA-055); activo dado de baja con OS abierta (aviso); correlativo con 20 a la vez | OS reales anonimizadas (P-002); activos de las Etapas 4 y 5 | **B:** CA-044, 055 (OS), 080 (tras P-006) |
| **7 · Pulido** | **Rendimiento** (RNF-011) con 100.000 activos y 500.000 movimientos en máquina comparable a producción; **respaldo y restauración con cronómetro**: aislamiento sobre la base restaurada, reaplicar anonimizaciones desde el registro externo, **revocar sesiones y enlaces, rotar claves de API y reaplicar suspensiones, bajas y cambios de rol posteriores** (RS-49, CA-053, CA-054c); copia externa de auditoría: alterar una entrada y verificar que se detecta (CA-040); vuelta atrás ensayada; accesibilidad completa AA (CA-050a); carga de 50 usuarios en recepción; revisión de dependencias (RS-43); procedimiento de incidente (RF-DAT-015); regresión completa | Copia sintética de 100.000 activos; respaldo con Personas anonimizadas después de la copia | **B:** CA-053 completo; 0 hallazgos Críticos o Altos abiertos; restauración probada. **S:** cifras reales de P-003 |

### 4.3 Después de la v1 (resumen de lo que cambia por D-062)

| Módulo | Pruebas críticas actualizadas |
|---|---|
| CMD | Es delgada: los activos no se copian; "asignado a" se deriva de las asignaciones. Probar que un activo recibido **no** crea fila de CMDB, que un Servicio sí, que el impacto recorre hasta 5 niveles sin ciclos, y que el elemento relacionado se materializa en la misma transacción |
| LIC / PRV-B | Contrato único `CTR-` (la licencia es extensión 1 a 1); puestos con CHECK y último puesto con 20 intentos; vigencia **calculada al leer** (sin proceso: reloj a 23:59 y a 00:00:01) |
| DOM / LIN / GAR-B | Aviso por umbral una vez por empresa y entidad con dos empresas y reloj; el cese de la responsable no bloquea y genera pendiente; mantenimiento con costo en la OS o en el mantenimiento, nunca en ambos |
| AYU / ONB | SLA con calendario de empresa, feriados y pausas, contra una tabla de casos con resultado conocido; caso restringido invisible por todas las vías (CA-AYU-17); tareas de salida desde pendientes de la persona |
| PRE / REP | Libro único de costos: una sola fuente (`fuente_costo`: orden de compra, luego contrato, luego propio); cifra del tablero = lista de su tarjeta, por construcción |
| INT | Clave visible una vez; revocación en 10 segundos; la API no aprueba ni recibe; versión de la OC en la exportación |
| NOT-completo | Un evento dos veces = un aviso; resumen diario; rebotes; tope por empresa con cupo propio |

---

## 5. Criterios de integración entre módulos: ¿siguen valiendo?

Los 15 siguen valiendo en intención. Cambian los detalles porque las decisiones reemplazaron mecanismos. "Etapa" = cuándo se pueden ejecutar de verdad.

| # | Criterio (resumen) | ¿Vale? | Qué cambia | Etapa en que corre |
|---|---|---|---|---|
| CI-01 | Cambio de empresa sin arrastre | Sí, con cambio | La empresa va **en la dirección** (`/e/{empresa}/`): cambiar es navegar; se prueba con dos pestañas (CA-079); el contador de no leídas sale de la tabla resumen del usuario (campana, Fase 2); un enlace de correo de otra empresa responde "no encontrado" a quien no es miembro | 1 (campana en Fase 2) |
| CI-02 | Una recepción se propaga | Sí, con cambio | El **registro de costo y el movimiento son eventos de integridad: corren en la misma transacción**; si fallan, la recepción no se confirma (cambia mi expectativa anterior). Los espejos y avisos corren en la cola. CMDB no copia el activo; el libro de PRE es posterior | 5 (con PRE en Fase 3) |
| CI-03 | Revertir una recepción deshace todo | Sí | Solo si ningún saldo queda negativo por ubicación (RF-OC-032); reabre la orden y anula el cierre manual; el costo se revierte con registro contrario | 5 |
| CI-04 | Asignación única y sus efectos | Sí, con cambio | Acta con **copia del nombre en columnas propias** (`retener_hasta`); "asignado a" de la CMDB es derivado; autoentrega sin excepción; portal es Fase 3 | 4 |
| CI-05 | Cese de una Persona | **Cambia** | **El cese nunca se bloquea**: se prueba que se acepta, que la lista de pendientes sale, que lo que sí se bloquea es anonimizar, y la regla de la suspensión de H-QA-23 (decisión pendiente). Los pendientes de líneas, licencias y dominios son de Fase 2 | 2 y 4; resto Fase 2 |
| CI-06 | Anonimización sin romper nada | Sí, con cambio | Anonimizar = **sobrescribir el registro**; la auditoría no se toca; el acta conserva el nombre hasta `retener_hasta`; registro de anonimizaciones fuera de la base; dos personas; prueba del nombre canario; texto "Persona anonimizada 0042" | 2, 4 y 7 |
| CI-07 | Segunda persona en todos los actos de dinero | Sí, con cambio | Una sola regla RN-017 y la tabla de 12 actos; **interruptor único con 8 casillas** (vencen a 90 días, segundo administrador); la excepción de cambios retirada; la autoentrega sin casilla | 5 (resto Fase 2 y 3) |
| CI-08 | Los precios no se escapan | Sí | Precios solo con `precios.ver` (PS-23); Técnico y Solicitante, solo en las órdenes que crean; el visor de auditoría oculta lo que el lector no ve; las columnas se omiten, no se muestran vacías | 5 y siguientes |
| CI-09 | Los datos personales no se escapan | Sí | **Tres formas de dato oculto** (referencia, secreto enmascarado, columna omitida); prueba del nombre canario en todas las vías | 2 en adelante |
| CI-10 | Exportar es una sola acción vigilada | Sí | Puerta única (RF-EXP-001 a 007): motivo, hoja "Aviso", límites 10 por hora y 50.000 filas, secretos nunca, contactos de proveedor fuera de exportaciones generales | 2 |
| CI-11 | Un activo que sale de servicio | Sí, con cambio | La CMDB se deriva; PRE es posterior. En la v1 se prueba: asignación cerrada con la causa, garantía intacta, mantenimientos (Fase 2) cancelados en la misma transacción; el reingreso reactiva el mismo registro | 4 (resto Fase 2 y 3) |
| CI-12 | Caso, orden de servicio y activo | Sí, con cambio | En la v1 solo "Pedir ayuda" crea una OS en Creada (CA-080); el caso es Fase 2; cerrar la OS no cambia el estado del activo | 6 (caso en Fase 2) |
| CI-13 | Procesos diarios con reloj fijado | Sí, con cambio | **Vigencias calculadas al leer** (sin proceso nocturno para "Vencido"); el proceso solo dispara avisos y renovaciones; se ejecuta empresa por empresa; día perdido se recupera en orden | 1 (infraestructura), Fase 2 (módulos) |
| CI-14 | Importar y deshacer | Sí, con cambio | Huella del archivo; "deshacer" = anular (estado final, fuera de la unicidad por índice parcial); movimiento posterior medido por secuencia; CMDB derivada, PRE posterior | 4 |
| CI-15 | Editar una orden aprobada y exportarla | Sí, con cambio | En la v1: sube el número de versión, se anula la aprobación y el editor no reaprueba; la exportación a SAP y el comprometido de PRE son Fase 3 | 5 (SAP en Fase 3) |
| **CI-16 (nuevo)** | **Trabajo en segundo plano que se interrumpe.** Dado una importación de 5.000 filas en curso, cuando el trabajador se reinicia a mitad, entonces no hay filas duplicadas ni perdidas, el lote termina o queda en estado claro, la barra de avance se retoma y todo corre con la empresa fijada. Igual para exportación de 50.000 filas y PDF masivo | Nuevo | D-038: cola en PostgreSQL | 4 |
| **CI-17 (nuevo)** | **Restauración que no resucita.** Dado un respaldo de ayer y un usuario suspendido, una Persona anonimizada y un cambio de rol después de la copia, cuando se restaura, entonces antes de abrir el sistema se reaplican las anonimizaciones, se revocan todas las sesiones y enlaces, se rotan las claves de API y se reaplican la suspensión y el cambio de rol; la prueba de aislamiento pasa sobre la base restaurada | Nuevo | D-052.4, RS-49 | 7 (ensayo previo a la Etapa 1) |

---

## 6. DevOps y QA: qué necesita cada uno

### 6.1 Lo que QA necesita de DevOps, contra `docs/operaciones/plan-entornos-y-costos.md`

El plan es de la v0.2 (cita "documento funcional v0.2" y "D-001 a D-029") y está desactualizado en varios puntos (H-QA-24).

| # | Necesidad de QA | ¿Está en el plan? | Dónde / qué falta |
|---|---|---|---|
| 1 | PostgreSQL real y desechable por cada revisión | **Sí** | §1.2 y §2.1 pasos 5 a 7 |
| 2 | Base permanente separada de producción, misma versión | **Sí** | §1.2 |
| 3 | **Cinco** roles de base (`app_empresa`, `app_plataforma`, `migraciones`, `mantenimiento`, `lector_auditoria`) y una prueba de que `app_empresa` no es dueño, no tiene BYPASSRLS ni es superusuario | **Parcial** | §1.2 y §5.2 nombran tres usuarios; faltan dos roles y la prueba explícita (D-039.3) |
| 4 | **Conexiones:** al menos 60 en la base permanente (50 simultáneas más margen) | **No** | §1.2 pide "unas 20"; D-055 prueba con 20 y 50 |
| 5 | Agrupador de conexiones en modo transacción en pruebas, prototipo sobre el proveedor candidato | **Sí** | §1.2 último punto y §9.2 |
| 6 | **Trabajador y cola** en PostgreSQL en el entorno de pruebas y en la revisión automática | **No** | El plan supone Vercel (§3.1, línea 148); D-038 exige ejecución continua |
| 7 | **Reloj de la plataforma fijable** en pruebas y **disparador manual** de procesos diarios (RNF-020) | **No** | No aparece la palabra "reloj" en el plan |
| 8 | **Correo de captura legible por las pruebas en el entorno de pruebas** (contar, leer, buscar importes, nombres y claves) | **Parcial** | §1.1 lo da solo en desarrollo; en pruebas el correo sale a "direcciones permitidas" y QA no puede leerlo |
| 9 | Generador de datos con el contenido de la sección 6.3 (dos empresas más una vacía, 7 plantillas, rol "Contador", canario) | **Parcial** | §9.2 pide el generador a Datos pero sin contenido ni dos empresas con datos idénticos |
| 10 | Volumen: 100.000 activos y 500.000 movimientos | **Parcial** | §9.2 menciona 100.000 activos, no los movimientos |
| 11 | **Prueba de carga nocturna desde la Etapa 4** (RNF-011) | **No** | §7 la deja para la Etapa 7 |
| 12 | Entorno efímero por cambio con aplicación, base, trabajador y correo de captura; que las vistas previas **no compartan una sola base de pruebas** | **No (conflicto)** | §1.1 regla 2: las vistas previas "apuntan siempre a la base de pruebas": varias revisiones a la vez se pisarían los datos |
| 13 | Navegadores (Chromium, Firefox y WebKit) y ventana de 360 px; medidor de contraste automático | **Parcial** | §2.1 paso 10 dice Playwright sin detalle |
| 14 | **Inyección de fallos:** cortar la conexión a mitad de una recepción o importación; matar al trabajador | **No** | Necesito una herramienta de corte de red o `pg_terminate_backend` autorizado en pruebas |
| 15 | Restauración de ensayo con **RS-49** (revocar sesiones y enlaces, rotar claves de API, reaplicar bajas y cambios de rol) y registro de anonimizaciones | **Parcial** | §4.2 trae el aislamiento y la anonimización, no RS-49 |
| 16 | Copia externa de la auditoría con un verificador que se pueda **probar alterando una entrada** | **Parcial** | §4.4 describe el diseño; falta el entorno de ensayo del verificador (CA-040) |
| 17 | Búsqueda automática de secretos y del nombre canario | **Parcial** | §2.1 paso 3 busca secretos y patrones; falta el canario en base, exportaciones y correos |
| 18 | Informe de pruebas, artefactos de fallos (capturas y vídeos) y política de pruebas intermitentes | **Sí** | §2.3 |
| 19 | Matriz de entrega del correo (20 envíos por tipo de buzón, SPF, DKIM, DMARC) | **Sí** | §6.3 |
| 20 | Ficha de versión con vuelta atrás ensayada con cronómetro | **Sí** | §3.3 |

### 6.2 Lo que DevOps necesita de QA (§9.2 del plan) y mis respuestas

**Pregunta 1. ¿Qué pruebas de concurrencia y aislamiento corren en la revisión automática y cuáles solo en la base permanente?**

| Suite | Cada cambio (menos de 10 minutos) | Nocturna o base permanente | Antes de cada etapa con uso real |
|---|---|---|---|
| Unitarias (Vitest) | Todas | | |
| Migraciones desde cero y encima de datos | Todas | Con volumen | |
| Aislamiento por tabla y por módulo, roles de base | Todas | | |
| Matriz de permisos (482 celdas) | Todas | | |
| Auditoría solo-agregar | Todas | | |
| Concurrencia con 20 conexiones (los 5 patrones de T-11) | Todas | | |
| Concurrencia con 50 conexiones | | Todas | |
| Procesos diarios con dos empresas y reloj | Todas | | |
| Cola y trabajador (reintento, reinicio) | Todas | | |
| E2E esenciales (login por enlace, cambio de empresa, recibir, entregar, aprobar) | Los 5 esenciales | Todos, en 3 navegadores y a 360 px | |
| Importación (archivo válido y 12 sucios) | El válido y 3 sucios | Todos | |
| PDF y texto malicioso | | Todos | |
| Carga de 100.000 activos y recepción de 100 series | | Todas | Medición final |
| Accesibilidad automática (contraste, teclado) | | Todas | Revisión manual |
| Restauración, vuelta atrás, copia externa alterada | | | Todas, con cronómetro |

**Pregunta 2. Revisión del control de cobertura de tablas (§2.2) y de la ficha de versión (§3.3).**
- *Control de cobertura:* bien pensado. Agregar: (a) que verifique **FORCE** de las reglas por fila, no solo que estén activadas; (b) que verifique la clave foránea **compuesta** `(empresa, id)`; (c) que haya **una prueba por módulo**, no solo por tabla (D-039.8); (d) que corra **como `app_empresa`** y falle si el rol tiene un atributo de privilegio; (e) que la lista de tablas globales sea la cerrada de D-039.4 y falle si crece sin firma de Seguridad.
- *Ficha de versión:* agregar tres filas: "¿cambia el trabajador o la cola?", "¿incluye migración probada con volumen sobre datos existentes?" y "¿se corrieron los procesos diarios con dos empresas?".

### 6.3 Juego de datos que pido (para el generador)

- **Empresas:** A "Norte" (moneda base USD, zona de Lima), B "Sur" (PEN, zona de Ciudad de México), C sin datos. Códigos, series, correos, proveedores e identificaciones fiscales **idénticos en A y B a propósito** (`LAP-0001`, `SN-100`, `ana@ejemplo.test`).
- **Usuarios:** por empresa uno de cada una de las **7 plantillas**; un usuario en A y B con roles distintos; un administrador con y sin segunda verificación; un rol personalizado "Contador" con `datos.exportar`; una Persona canario; Personas homónimas; Personas sin correo.
- **Datos:** 4 categorías (LAP, CEL, PER, LIC) con campos de los 6 tipos; SKU por serie y por cantidad; órdenes en cada estado; actas; límite de aprobación 5.000; dos monedas.
- **Volumen:** 100.000 activos y 500.000 movimientos; archivo Excel válido de 5.000 filas y 12 sucios.
- **Todo ficticio** (dominio `.test`), sin datos reales (D-028).

---

## 7. Veredicto

**Conforme con observaciones.**

**Por qué.** El núcleo v0.3 cierra 19 de mis 22 hallazgos con evidencia en el archivo; todo requisito del núcleo cita un criterio que existe; no hay citas rotas ni identificadores duplicados; el registro de permisos es consistente en todos los archivos; y las reglas que no se podían probar en la ronda 2 (orden sin precios, estados del activo, importación, auditoría y anonimización, huecos de recepción) ahora tienen resultado esperado. Mantengo "con observaciones" y no "conforme" porque, al escribir esto, había un hallazgo **Alto** del núcleo abierto (H-QA-23); se cerró durante la revisión (sección 9), y queda abierto el Alto H-QA-24 (plan de operaciones, que no es del núcleo pero bloquea las condiciones 4, 5, 11 y 12 de D-064) y los Medios de la sección 2.

**Condiciones mínimas** (en orden de urgencia):

1. **H-QA-23 (CERRADA durante la revisión, ver sección 9).** Una sola regla para cesar a una Persona con cuenta vinculada (aceptar o rechazar sin `usuarios.suspender`), reflejada en RF-PER-005, CA-052a, PS-26 y CA-PRS-05. Era la que mantenía suspendido mi visto bueno de D-064 condición 3.
2. **H-QA-24.** Actualizar el plan de operaciones a la v0.3: ejecución continua con trabajador, cinco roles de base, 60 conexiones, reloj y disparador, correo de captura legible, volumen y carga nocturna desde la Etapa 4, y entornos efímeros sin base compartida. Sin eso no se pueden cumplir las condiciones 4, 5, 11 y 12 de D-064.
3. **H-QA-25 y H-QA-26 (CERRADAS, sección 9).** Corregir CA-082b y la fórmula de RN-GAR-003 (fin = inicio menos un día, más los meses), y las tres citas mal apuntadas (RF-INV-008, 029, 030). Son cambios mecánicos.
4. **H-QA-29 (CERRADA) y H-QA-28 (parte mínima, abierta).** Un CA para el aviso de aprobación y rechazo a quien creó (RF-ACC-021) y la columna "Se ejecuta en: Etapa N" en cada CA; sin ella no puedo cerrar etapas con criterios que dependen de módulos posteriores.
5. **H-QA-15 (P-013).** El Gerente de TI fija los límites y formatos de la sección 19.2 y se define cómo se detecta una serie con ceros perdidos y qué significa "deshacer" en RNF-013.

Todo lo demás (H-QA-27, 30, 31, 32 y 33, y los parciales H-QA-21 y 22) no bloquea el cierre de la Etapa 0, pero debe quedar resuelto antes de las etapas que toca; los volcaré en `docs/trazabilidad.md` y `docs/calidad/` al empezar la Etapa 0 (hoy no existen).

Este veredicto es sobre documentos y arquitectura escrita, no sobre software: nada de lo ejecutable está ejecutado todavía.

---

## 8. Mensajes enviados (3 de 3)

Registrados literalmente en `docs/revision-cruzada/mensajes-ronda3-qa-tester.md`: al Analista (H-QA-23, 25 y 26), al escuadrón A (orden de la fórmula de garantía) y al escuadrón C (criterios de NOT-base).

---

## 9. Actualización posterior a los mensajes (verificada abriendo los archivos)

Mientras escribía este informe respondieron los tres destinatarios. Comprobé cada cambio en el archivo:

| Hallazgo | Respuesta | Prueba en el archivo | Estado ahora |
|---|---|---|---|
| H-QA-23 Cese con cuenta vinculada | Analista: se rechaza sin `usuarios.suspender` | `documento-funcional.md` RF-PER-005 (línea 298) y CA-052a (964): "exige además el permiso `usuarios.suspender`; sin él, el cese se rechaza y nada cambia"; coincide con PS-26, RN-PRS-011 y CA-PRS-05 | **Cerrado** |
| H-QA-25 Fórmula de la garantía | Analista y escuadrón A: se resta el día primero | RF-INV-008 (397) y CA-082b (934): fin 14/01/2028; RN-GAR-003 (garantias-mantenimiento línea 109): "(inicio menos 1 día) más esos meses… 31/01 más 1 mes da 28/02" (supuesto S-35, pendiente del gerente-ti) | **Cerrado** (queda la confirmación de S-35) |
| H-QA-26 Citas mal apuntadas | Analista: corregidas | RF-INV-008 (CA-082b), RF-INV-029 (CA-081b), RF-INV-030 (CA-079b) | **Cerrado** |
| H-QA-29 Aviso de decisión de la orden | Escuadrón C: agregó CA-NOT-20 (v1, Etapa 5) y marcó qué CA-NOT corren en cada etapa | `notificaciones.md`: RF-NOT-004, 007 y 013 citan CA-NOT-20; CA-NOT-05 y CA-NOT-07 quedan en Fase 2 | **Cerrado** en NOT. Falta que RF-ACC-021 del núcleo cite CA-NOT-20 |
| H-QA-28 CA que cruzan etapas | Sin respuesta aún | CA-052a (964) sigue pidiendo "una línea y un dominio a su cargo" (módulos de Fase 2) | **Abierto** |

**Estado final de mis hallazgos nuevos:** de los 11, quedan cerrados 4 (H-QA-23, 25, 26, 29); abiertos 1 Alto (H-QA-24, de DevOps), 5 Medios (H-QA-27, 28, 30, 31, 32) y 1 Bajo (H-QA-33).

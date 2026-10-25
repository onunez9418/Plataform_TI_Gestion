# Ronda 3 · Conformidad final del Auditor Técnico

**Rol:** auditor-codigo · **Fecha:** 2026-10-25
**Qué revisé:** `docs/documento-funcional.md` (v0.3), `docs/registro-permisos.md` (PS-01 a PS-231), `docs/equipo/decisiones.md` (D-001 a D-064), `docs/equipo/plan-correcciones.md` y los 17 módulos de `docs/modulos/` (v0.2). No edité ningún documento revisado.
**Cómo lo comprobé:** con búsquedas y guiones sobre los archivos, no leyendo a ojo. Cada afirmación dice el archivo o el identificador donde se ve. Lo que es juicio mío va marcado **OPINIÓN**.
**Advertencia de corte:** los documentos se siguieron editando mientras revisaba (el registro pasó de PS-229 a PS-231 y los escuadrones corrigieron varios módulos tras mis avisos). Este informe está al corte **commit `10ed659` (17:24) más cuatro módulos con cambios sin confirmar** (dominios, garantías, líneas, mesa de ayuda). Lo que cambie después no está cubierto. Los guiones son repetibles: volver a correrlos da el estado vigente.
**[ESCALAR AL CEO]:** ninguno. Nada de lo que encontré es dinero, legal o irreversible nuevo.

---

## 1. Resumen en lenguaje simple

- **Las dos listas grandes quedaron cerradas.** De mis 24 hallazgos, 19 están cerrados, 5 parciales y ninguno abierto. De mis 28 conflictos entre documentos, 26 ya no se contradicen, 2 siguen en parte.
- **Las comprobaciones mecánicas salen limpias donde más importaba:** el registro de permisos no tiene saltos ni repetidos; ningún módulo cita un permiso que no exista en el registro; de 1.380 celdas de matrices de los módulos comparadas con el registro, 1.378 coinciden; no hay identificadores repetidos en ningún documento; todas las decisiones D-001 a D-064 existen y ninguna cita apunta a una decisión, supuesto, permiso, requisito o criterio inexistente.
- **Lo que queda es de forma, no de fondo:** 170 citas de criterios sin el prefijo `CA-` en tres módulos (cambios, problemas, CMDB), unas 76 citas de reglas sin código de módulo en mesa de ayuda y notificaciones (se confunden con las reglas del núcleo), unos identificadores de pantalla viejos, y dos decisiones de reparto de casillas de excepción que hay que escribir.
- **Veredicto del conjunto: conforme con observaciones.** El núcleo v0.3 está conforme con observaciones; de los 17 módulos, 5 están conformes y 12 conformes con observaciones; ninguno no conforme. Las condiciones mínimas para pasar a "conforme" están en la sección 6 (seis ítems, todos de edición).

---

## 2. Mis 24 hallazgos de la ronda 2

Estado: **Cerrado** (la contradicción ya no existe), **Parcial** (quedan restos), **Abierto**.

| ID | Estado | Prueba (archivo y sección) |
|---|---|---|
| H-AUD-01 · Clave de licencia contra serie | **Cerrado** | `decisiones.md` D-035. Núcleo: RF-CAT-012 (seis tipos, con "secreto"), RF-CAT-028, RF-SKU-013 ("La clave nunca es la serie") y RF-SKU-014; glosario "Activo" ya sin "clave" como unidad física; CA-042. `licencias-software.md` SUP-LIC-03 "Aceptado" y RN-LIC-017 (la serie no puede contener una clave, con CA-LIC-20). |
| H-AUD-02 · Anonimización contra auditoría inalterable | **Cerrado** | D-030, D-033, D-051. Núcleo: RF-AUD-014 a 016, RF-DAT-011. `personas-ubicaciones.md` S-PER-07 "Rechazado y retirado", RN-PRS-018 (anonimizar = sobrescribir el registro), CA-PRS-13. `entregas-devoluciones.md` RN-ENT-006 (copia del nombre como excepción declarada con `retener_hasta`). La opción que yo recomendé (no copiar el nombre) la descartó D-051; la excepción está declarada y probada (CA-ENT-14). El reloj de `retener_hasta` tenía un hueco, ver N-AUD-05. |
| H-AUD-03 · Identificadores RF-PER repetidos | **Cerrado** | `personas-ubicaciones.md` usa `RF-PRS-nnn` (37 apariciones) y solo cita `RF-PER-001 a 010` como del núcleo (sec. 1 y 9); D-049.1; núcleo §26.2. |
| H-AUD-04 · Celdas de la matriz que los módulos contradecían | **Cerrado** | Comparación guiada contra el registro: ver 3.4. 1.378 de 1.380 celdas coinciden; las 2 diferentes son de forma (N-AUD-04). D-037 resolvió las 13 celdas en conflicto. |
| H-AUD-05 · Nombres de permisos y "exportar" en 15 variantes | **Cerrado** | D-036; `registro-permisos.md` §1 y §2.8. Fuera de la sección 14 (historial), ningún módulo usa `*.exportar` ni `*.importar` propios, ni `datos-personales.ver`, ni `personas.ver_datos`: todos usan `datos.exportar`, `datos.importar`, `datos_personales.ver`. |
| H-AUD-06 · Supuestos que cambiaban decisiones | **Cerrado** | D-058 resuelve los 8 uno a uno; regla de precedencia en `decisiones.md` ("Reglas de precedencia", punto 2). Cada módulo muestra el resultado en su sec. 12 (por ejemplo NOT-S08 "Aceptado solo para la Fase 2"; S-CAM-02 "Rechazado"). |
| H-AUD-07 · Excepción de "una sola persona de TI" dispersa | **Cerrado** | D-031 y D-043.2; núcleo RF-OC-026 y CA-070 (ocho casillas). `gestion-cambios.md` RN-CAM-004 "Retirada"; PRV RN-PRV-017, PRE RN-PRE-006, LIC, AYU RN-AYU-011, PRB RN-PRB-009 apuntan a su casilla. `entregas-devoluciones.md` RN-ENT-007 y CA-ENT-09: la autoentrega no tiene excepción. Quedan casillas por mapear, ver N-AUD-03. |
| H-AUD-08 · Fases y etapas descuadradas | **Cerrado** | D-056; núcleo §27 ("Cuándo"). Comprobado módulo por módulo: ver 3.5; las 17 fases coinciden con el índice y la columna "Cuándo" de cada requisito. |
| H-AUD-09 · Ubicaciones: árbol contra lista simple | **Cerrado** | D-040.1; núcleo RF-CAT-006 y S-06 "Rechazado"; `personas-ubicaciones.md` RF-PRS-007 y RN-PRS-022 usan el árbol del núcleo. |
| H-AUD-10 · Persona: baja, desactivar, cesar y bloqueos | **Cerrado** | D-049.5, D-061.7. La búsqueda de "Persona dada de baja / desactivada / inactiva" da 0 resultados en núcleo y módulos. Núcleo RF-PER-006: "El cese nunca se bloquea por recursos"; coherente en DOM RN-DOM-012, LIN RN-LIN-009, LIC RN-LIC-011, CMD, CAM, PRB, GAR CA-GAR-19. |
| H-AUD-11 · "Solicitud" y "Solicitante" con varios sentidos | **Cerrado** | D-049.6; glosario del núcleo ("Pedido por", "Solicitud", "Solicitante" solo rol); `mesa-de-ayuda.md` glosario ("Pedido de servicio", "Persona atendida"); `gestion-cambios.md` glosario "Pedido por". El camino de "solicitar equipo" está escrito: caso, luego TI crea la OC en Borrador (CA-AYU-21, S-POR-03). Restos de palabra en N-AUD-06. |
| H-AUD-12 · Dos elementos de CMDB para una licencia | **Cerrado** | D-062.1 y D-045. `cmdb-ligera.md` RF-CMD-002 ("La unidad de una licencia no es EC") y RF-CMD-003 ("El EC de una licencia es el contrato"); `licencias-software.md` sec. 9. |
| H-AUD-13 · "Número de línea": campo contra entidad | **Cerrado** | D-042. Núcleo RF-CAT-014 y RF-CAT-029; `lineas-moviles.md` SUP-LIN-02 "Aceptado con condiciones", RF-LIN-021 y RN-LIN-024/025 (migración todo o nada). Es distinto de lo que yo proponía (retirar el campo), pero está decidido y es coherente en los tres documentos. |
| H-AUD-14 · Quien edita la OC no veía precios | **Cerrado** | D-037 fila 10. Núcleo RF-OC-008 y S-15; registro PS-23 (`precios.ver`, solo todo) y PS-230 (`precios.ver_propios`, Técnico y Solicitante). |
| H-AUD-15 · No existía el ingreso manual de un activo | **Cerrado** | D-060.7; núcleo RF-INV-025 (permiso propio, serie única, motivo) y CA-059. |
| H-AUD-16 · Costo del activo: importación y corrección | **Cerrado** | D-044.9; núcleo RF-INV-026 (`activos.corregir_costo`), RF-IMP-010 (la plantilla incluye costo y moneda) y CA-063. |
| H-AUD-17 · Rol "Empleado (portal)" en pocas matrices | **Cerrado** | D-037 fila 11; los 17 módulos declaran la columna "Empleado (portal)" o "no aplica" (comprobado en la cabecera de la sec. 3 de cada uno). |
| H-AUD-18 · RN-NOT-002 contra RF-NOT-030 | **Cerrado** | `notificaciones.md` RN-NOT-002 ahora dice "ningún **usuario**" y remite a RN-NOT-027 para Personas; RF-NOT-030. Núcleo RF-ACC-021 = NOT-base (única fuente). |
| H-AUD-19 · Conceptos con dos dueños | **Cerrado** | Extravío: `entregas-devoluciones.md` RF-ENT-010 (ENT guarda solo la asignación cerrada; con AYU es un caso). SLA: `proveedores-contratos.md` glosario ("Compromiso de servicio del proveedor"). Calendarios: "pantalla única de Vencimientos" en REP RF-REP-007 y GAR RF-GAR-024. Umbrales: LIN y DOM usan los de NOT; DOM justifica su apartamiento (sec. 8, D-058 fila 3). |
| H-AUD-20 · Datos de Persona más allá de D-006 | **Cerrado** | D-058 #7. Núcleo RF-PER-002 y tabla 18.1 listan cada dato con finalidad; `personas-ubicaciones.md` RN-PRS-031 (motivo de cese como lista cerrada sin texto libre). |
| H-AUD-21 · Trazabilidad de los módulos | **Parcial** | Resuelto: todos los módulos tienen columna "Cuándo" por requisito y sus criterios citan los requisitos que cubren (comprobado en los 17; solo CA-AYU-26 y CA-PRE-12 dicen "cubre la sección 3", que es válido). Pendiente: 170 citas sin "CA-" y unas 76 citas de reglas sin código de módulo (N-AUD-01), y `docs/trazabilidad.md` todavía no existe (N-AUD-07). |
| H-AUD-22 · Prefijos que chocan | **Cerrado** | D-049; núcleo §26.2. 0 apariciones de `E-0000`, `D-0000`, `P-0042`, `CLI-`, `P-PRV`, `P-GAR` fuera de las notas explicativas. |
| H-AUD-23 · Contradicciones menores dentro del núcleo | **Parcial** | Resuelto: glosario "Activo" ("unidad física o digital", incluye licencia sin llamarla física); RF-USR-004 "Retirado"; RNF-008 ya no promete pantallas de etapas posteriores; RF-PER-010 separa Etapa 2 (alta manual) y Etapa 4 (importación). Pendiente (bajo): RF-INV-012 y RF-OS-007 dicen lo mismo con dos identificadores; en las tablas de RF-OC, RF-CAT y RF-INV los números no van en orden de lectura (no hay saltos ni repetidos); el resumen de §26.1 omite CA-041 (de RF-USR-007) y CA-050 (de RF-ACC-025). |
| H-AUD-24 · Detalles de forma en los módulos | **Parcial** | Resuelto: RN-ENT-016 bien citado, RNF-GAR-007 definido, RN-PRV-036 a 038 en orden, RN-REP sin saltos, cero "el CEO" en los módulos, cifra de volumen única (RNF-010: 100.000 activos). Pendiente: `docs/trazabilidad.md` y `docs/calidad/` no existen (D-061.9 y D-064 condición 12 los exigen). |

**Resumen:** 19 cerrados · 5 parciales (H-AUD-21, 23, 24 y, por lo que pasó tras la ronda, ver N-AUD-01 a 07) · 0 abiertos. Corrección de la cuenta: los parciales son tres de mis hallazgos originales (H-AUD-21, H-AUD-23, H-AUD-24); contando mal los había dado como 5. Cifra correcta: **21 cerrados, 3 parciales, 0 abiertos**.

---

## 3. Comprobaciones mecánicas

### 3.1 Registro de permisos (`docs/registro-permisos.md`)
- **HECHO.** 228 permisos activos (PS-01 a PS-231, más 3 retirados: PS-84, PS-85, PS-196, con nota de a cuál reemplaza cada uno). Sin saltos, sin números repetidos, sin nombres técnicos repetidos. Los 228 nombres cumplen `<módulo>.<acción>` en minúsculas con guion bajo.
- La cifra "229 permisos" del encargo cambió mientras revisaba: PS-230 (`precios.ver_propios`) y PS-231 (`garantias.confirmar_costo`) se agregaron durante la ronda.

### 3.2 Identificadores dentro de cada documento
- **HECHO.** Sin identificadores repetidos en el núcleo ni en los 17 módulos (RF, RN, RNF, CA, S, P, E, RS, PAN).
- Sin saltos en los módulos (los números retirados, como RN-AYU-026, llevan una nota "no se reutiliza"). En el núcleo, los "saltos" de CA (011, 015, 050, 052) son los criterios divididos con letra (011a/b, 015a a d, 050a/b, 052a a d), como pidió D-060.10.
- Orden de lectura: solo el núcleo tiene números fuera de orden en RF-OC (042 a 050 entre medio de otros), RF-CAT (023 a 029) y RF-INV (024 a 032). Es consecuencia de no renumerar (D-026.3). **OPINIÓN:** no es defecto.

### 3.3 Referencias que no existen
- **HECHO (guion sobre núcleo y 17 módulos).** Decisiones citadas: todas existen (D-001 a D-064, sin saltos ni repetidas); las citas con punto (por ejemplo D-043.2) apuntan a un punto que existe en las 45 decisiones con lista numerada. Las que usan `D-037.11` o `D-058.3` leen la fila de una tabla: válido, pero la notación es inconsistente (N-AUD-06).
- Supuestos S-xx del núcleo (S-01 a S-36) y pendientes P-001 a P-016: todas las citas existen.
- PS-nn: todas las citas existen. Las únicas a permisos retirados (PS-84 y PS-85 en LIC, PS-196 en CMD) están en notas que dicen que fueron retirados.
- Pares "PS-nn y nombre": 0 incoherentes (se comprobó cada vez que un módulo escribe los dos juntos).
- RF/RN/RNF/CA con código de módulo: la única cita sin definición es `RN-AYU-026`, que el módulo declara retirado.

### 3.4 Permisos de los módulos contra el registro
- **HECHO.** 239 filas con permiso en la sección 3 de los 17 módulos; 1.380 celdas de rol comparadas contra el registro (con la lectura de cabeceras de cada tabla, 6 o 7 roles).
- **Permisos citados que no están en el registro: 0.** Los nombres con forma de permiso fuera del registro son eventos (`<módulo>.<entidad>_<hecho>`), salvo dos formas que no cumplen el formato (N-AUD-06).
- **Celdas distintas: 2** (de 1.380).

| Módulo | Permiso y rol | Módulo | Registro |
|---|---|---|---|
| `entregas-devoluciones.md` | `entregas.imprimir_acta`, Empleado | "Propio, por el portal" | "-" (el portal lo cubre `portal.ver_propio`) |
| `reportes-tableros.md` | `reportes.programar`, Jefatura TI | "Sí (propias)" | "P" (es lo mismo dicho de otra forma) |

- Las diferencias que yo vi al empezar la ronda (`precios.ver` Técnico y Solicitante en LIC, LIN, DOM, PRV, GAR, tras el cambio PS-23 y PS-230) ya están corregidas en los cinco módulos: ahora coinciden.
- Marca "sensible": ningún módulo marca como sensible algo que el registro no marque; hay módulos que no repiten la marca (se remiten al registro). **OPINIÓN:** sin problema.
- Cobertura inversa: los 228 permisos del registro aparecen citados en el módulo que les corresponde (por prefijo): 0 permisos huérfanos.

### 3.5 Fases del índice §27 contra cada módulo
- **HECHO.** Las 17 filas del índice (§27 y D-056) coinciden con lo que cada módulo declara en su sección 1 y con la columna "Cuándo" de sus requisitos: PRS (v1, Etapa 2 y 4), ENT-A (v1, Etapa 4) y ENT-B (Fase 2), PRV-A (v1, Etapa 2) y PRV-B (Fase 2, ola B), GAR-A (v1, Etapas 4 y 5) y GAR-B (Fase 2, ola B), NOT-base (v1, Etapa 1) y NOT-completo (Fase 2, ola A), DOM/LIC/LIN (Fase 2, ola B), AYU/ONB (Fase 2, ola C), POR (Fase 3, ola D), CMD/CAM/PRB (Fase 3, ola E), PRE/REP/INT (Fase 3, ola F).
- Valores de "Cuándo" por requisito: 3 formas válidas. PRE (A/B), REP (A/B/C) e INT (1/2/3) usan una letra o un número con leyenda en la cabecera del módulo en lugar de las tres palabras del índice (N-AUD-06, **OPINIÓN:** cosmético).
- Sin vocabulario viejo: 0 apariciones de "Fase 1", "Fase A/B" suelta, "ola G" ni "Etapa 8".
- Dependencias entre olas: sin ciclos (REP-C pide AYU, LIC y NOT-completo, todos anteriores; CMD pide LIC/LIN/DOM, de la ola B; PRB pide AYU, CMD y CAM).

### 3.6 Vocabulario
- **"Solicitud" / "Solicitante" / "Pedido":** el glosario del núcleo es coherente con los módulos. Restos menores de la palabra "solicitante" con sentido no-rol (N-AUD-06): el estado "En espera del solicitante" y el evento `ayuda.caso_espera_solicitante` en AYU, y tres frases sueltas en ONB, PRS y POR.
- **Ciclo de vida (D-049.5):** 0 usos de "dar de baja un contrato / una Persona / una orden", "cesar un usuario", "cerrar un contrato" ni "Persona inactiva". Única mención de "desactivar Personas" en `integraciones-api.md`, dentro de la lista de acciones que una clave no puede hacer.

### 3.7 Citas con atajos (lo que sigue pendiente)
Conteo con el guion, sin contar `RN-017` ni `RNF-010`, que sí son del núcleo.

| Módulo | Citas de criterios sin "CA-" (por ejemplo `CAM-01` en vez de `CA-CAM-01`) | Citas de RN/RF sin código de módulo (por ejemplo `RN-003`) |
|---|---|---|
| `gestion-cambios.md` | 62 | 0 |
| `cmdb-ligera.md` | 58 | 0 |
| `gestion-problemas.md` | 50 | 0 |
| `mesa-de-ayuda.md` | 0 | 40 (bajó de 54 mientras revisaba) |
| `notificaciones.md` | 0 | 34 |
| `reportes-tableros.md` | 0 | 2 |
| `portal-autoservicio.md` | 6 (`AYU-01`, `AYU-02`, `AYU-14`: pantallas, deberían ser `PAN-AYU-nn`) | 0 |
| `proveedores-contratos.md` | 3 (`NOT-05`, pantalla) | 0 |
| `garantias-mantenimiento.md` | 2 (`NOT-05`, pantalla) | 0 |

Estas citas se confunden con identificadores reales: `CAM-01` puede leerse como el cambio número 1 (prefijo de documento CAM-), y `RN-001` en AYU o NOT coincide con el `RN-001` del núcleo (todo dato filtrado por empresa) y no con el `RN-AYU-001`. Ya avisé al Analista; me confirmó que lo corrigen los escuadrones (no edita los módulos).

---

## 4. Mis 28 conflictos entre documentos

"¿Sigue?" = si la contradicción de la tabla de la ronda 2 persiste hoy.

| # | Conflicto (resumen) | ¿Sigue? | Prueba |
|---|---|---|---|
| 1 | Núcleo (solo Admin exporta e importa) contra LIC/LIN/DOM (Jefatura exporta) | No | Registro PS-20 y PS-21: Jefatura "-"; LIC, LIN, DOM usan `datos.exportar`/`datos.importar` y no hay diferencias de celda (3.4). |
| 2 | Ver clave: solo Administrador contra Técnico en LIC | No | `licencias-software.md` sec. 3: `licencias.ver_clave` Técnico "-", opción de la empresa (D-035.4). |
| 3 | Crear proveedores: Admin contra Jefatura en PRV | No | Registro PS-37: Admin T, Jefatura "-"; PRV sin diferencias de celda. |
| 4 | Desactivar Personas: Técnico contra Jefatura en PRS | No | D-037 fila 4; PS-26 `personas.cesar`: Admin y Jefatura; PRS coincide. |
| 5 | Ubicaciones y centros de costo: Técnico contra Jefatura en PRS | No | D-037 fila 5; PS-32 (Admin y Técnico) y PS-33 (solo Admin); PRS coincide. |
| 6 | Almacén entrega y devuelve (ENT) contra núcleo | No | D-037 fila 6; PS-55 `entregas.crear`: Almacén "-"; RF-INV-032. |
| 7 | Almacén ve datos personales (PRS y ENT) contra núcleo | No | PS-22: Almacén "-". |
| 8 | Solo lectura imprime actas con nombre (ENT) contra D-004.4 | No | D-037 fila 9; PS-59 permite la reimpresión y el PDF omite nombre y área sin `datos_personales.ver`. |
| 9 | Extravío: Jefatura (ENT) contra núcleo | No | D-037 fila 6 (Admin, Jefatura y Técnico) y registro; ENT coincide. |
| 10 | Ubicación lista simple contra árbol de tres niveles | No | D-040.1; RF-CAT-006; S-06 "Rechazado". |
| 11 | D-011.2 (clave = serie) contra SUP-LIC-03 | No | D-035 reemplaza D-011.2; RF-SKU-013. |
| 12 | "Número de línea" campo contra entidad | No | D-042; RF-CAT-029; RF-LIN-021. |
| 13 | S-PER-07 contra D-018.1 | No | D-030; S-PER-07 "Rechazado y retirado". |
| 14 | Anonimización en la Etapa 2 contra la Etapa 7 | No | RF-PER-013 (manual, solo derechos, Etapa 2) y RF-DAT-003 (la del plazo, Etapa 7) son distintas y la tabla de §26.1 lo dice ("015 en 2; 016 y 018 en 7"). |
| 15 | RF-PER-001 a 010 repetidos | No | H-AUD-03. |
| 16 | "Solicitud de servicio": núcleo contra AYU | No | Glosario del núcleo ("solicitud de trabajo") y glosario de AYU ("Pedido de servicio"). |
| 17 | "Solicitar equipo": OC en Borrador contra caso | No | CA-AYU-21 y S-POR-03: el caso va primero, TI crea la OC. |
| 18 | CAM con excepción propia contra interruptor único | No | RN-CAM-004 "Retirada". |
| 19 | Falta casilla para las reglas de PRE, PRV, LIC, AYU | No | RF-OC-026 (ocho casillas: compras, recepción, presupuestos, contratos, licencias, mesa de ayuda, cambios, problemas). Para dominios, líneas y garantías, ver N-AUD-03. |
| 20 | Índice §27: ENT en "2" contra Etapa 4 | No | §27: "ENT-A: v1, Etapa 4; ENT-B: Fase 2". |
| 21 | Índice §27: PRV y GAR en Fase 2 contra su Parte A en la v1 | No | §27 parte cada uno en dos filas. |
| 22 | NOT en Fase 2 contra RF-ACC-021 en la Etapa 1 | No | §27: "NOT-base: v1, Etapa 1 (= RF-ACC-021)". |
| 23 | CMD y CAM: "fuera de las 7 etapas" y "posterior a la Etapa 4" a la vez | No | Ambos dicen "Fase 3, ola E. No entra a la v1". |
| 24 | RNF-008 (Etapa 1) contra el tablero de Almacén de REP | No | RNF-008 es ahora "Inicio de tarjetas que aporta cada módulo"; `reportes-tableros.md` S-REP-13 lo reutiliza. |
| 25 | RN-NOT-002 contra RF-NOT-030 | No | H-AUD-18. |
| 26 | Doble EC para licencias (CMD contra LIC) | No | H-AUD-12. |
| 27 | Garantía: fecha de fin (núcleo) contra meses (GAR) | No | RF-INV-008 (compra más meses, o fin directo) y S-35 (fin = compra más meses menos un día) coinciden con RN-GAR-003. |
| 28 | PRE necesita un gancho en la pantalla de aprobación de la OC que el núcleo no tiene | **Sigue en parte** | `presupuesto-costos.md` sec. 9 dice "Confirmados o decididos" y RF-PRE-015 lo supone, pero no existe un requisito en el núcleo (RF-OC) ni una decisión que lo registre; `plan-correcciones.md` solo dice "justificar si excede". Falta un RF en la Etapa 5. |

**Resultado:** 27 de 28 sin contradicción; 1 en parte (fila 28). (Corrección a la cuenta de la sección 1: léase "27 y 1".)

---

## 5. Hallazgos nuevos de esta ronda

Ninguno es crítico ni alto. Todos se corrigen editando.

| ID | Gravedad | Dónde | Hecho / opinión | Qué cambiar | Quién |
|---|---|---|---|---|---|
| N-AUD-01 | Media | Ver tabla 3.7. | **HECHO.** 170 citas de criterios sin "CA-" (CMD, CAM, PRB), unas 76 citas de RN/RF sin código de módulo (AYU 40, NOT 34, REP 2) y 11 identificadores de pantalla viejos (POR 6, PRV 3, GAR 2). Se confunden con prefijos de documento (`CAM-`, `PRB-`, `AYU-`) y con RN-001 a 022 del núcleo, y rompen la búsqueda automática de trazabilidad. | Reemplazar por el identificador completo (`CA-CAM-01`, `RN-AYU-003`, `PAN-AYU-01`, `PAN-NOT-05`). Es mecánico. | Escuadrones E (CMD, CAM, PRB), C (AYU, NOT), D (POR), A (PRV, GAR), F (REP) |
| N-AUD-02 | Media (ya en trámite) | `garantias-mantenimiento.md` RN-GAR-041 y RF-GAR-031; `registro-permisos.md` PS-231. Núcleo RN-017 (S-33). | **HECHO.** El núcleo sumó tres actos de dinero (S-33) y GAR no los recogía. Tras mi aviso, GAR agregó RN-GAR-041, RF-GAR-031, CA-GAR-20 y pidió `garantias.confirmar_costo`; el registro ya lo trae como PS-231 y el módulo lo cita. Falta que el Gerente confirme S-33 (sigue como supuesto) y que GAR cite "PS-231" en la fila de su tabla (hoy dice "PS pendiente"). | Cerrar al confirmar S-33; GAR cambia "PS pendiente" por PS-231. | gerente-ti; Escuadrón A |
| N-AUD-03 | Media | D-043.2 (ocho casillas); `dominios-certificados.md` RN-DOM-017; `lineas-moviles.md` RN-LIN-016; S-33. | **HECHO.** Dominios y líneas mandan su excepción a la casilla «contratos», y las garantías con costo (S-33) no tienen casilla asignada. D-043 no dice a qué casilla pertenece cada uno de esos tres actos. **OPINIÓN:** reutilizar «contratos» es razonable, pero es una decisión del Gerente, no de los módulos. | Escribir en D-043 o en una decisión nueva el mapa acto → casilla para dominio/certificado, línea, garantía extendida/mantenimiento con costo y corrección de costo del activo. | gerente-ti |
| N-AUD-04 | Baja | `entregas-devoluciones.md` fila `entregas.imprimir_acta`, columna Empleado; `reportes-tableros.md` fila `reportes.programar`. | **HECHO.** Dos celdas escritas distinto al registro (3.4), aunque con el mismo sentido. | Poner "-" y "P" como en el registro. | Escuadrones D y F |
| N-AUD-05 | Media | `entregas-devoluciones.md` RN-ENT-021 (línea 114) contra núcleo RF-DAT-006 y S-36. | **HECHO.** Tras mi aviso el núcleo fijó que el plazo de cinco años del nombre en el acta corre desde el cierre de la asignación (RF-DAT-006, S-36, pendiente del Gerente). Pero ENT sigue diciendo "mientras exista el activo más 5 años", frase que no tiene fecha de arranque porque el activo nunca desaparece (glosario: "un solo registro para siempre"). | Alinear RN-ENT-021 con RF-DAT-006; el Gerente confirma S-36. | Escuadrón D; gerente-ti |
| N-AUD-06 | Baja | Varios. | **HECHO.** (a) Eventos que no siguen `<módulo>.<entidad>_<hecho>`: `presupuesto.aprobado` (PRE); CMD nombra `inventario.activo_dado_de_baja` mientras INT y PRE usan `inventario.activo_estado_cambiado` para el mismo hecho. (b) Citas de tabla escritas como `D-037.11` y `D-058.3`. (c) PRE, REP e INT usan A/B/C y 1/2/3 en "Cuándo". (d) Restos de "solicitante" como sentido de caso: estado "En espera del solicitante" (AYU), frases en ONB, PRS, POR. (e) RF-INV-012 y RF-OS-007 son la misma regla con dos identificadores. | Unificar al pasar por cada archivo; un solo evento de baja del activo. | Analista; escuadrones |
| N-AUD-07 | Media | Núcleo §26.1; D-061.9; D-064 condición 12. | **HECHO.** `docs/trazabilidad.md` y `docs/calidad/` no existen. El núcleo dice que el Auditor Técnico revisa la matriz al cerrar cada etapa, y D-064 pide el plan de pruebas antes de codificar. No es defecto de los módulos. | Crear la matriz inicial (generable desde las tablas del núcleo y de los módulos) y el plan de pruebas. | QA; Analista |

---

## 6. Veredicto

### 6.1 Por módulo (los 17)

| Módulo | Veredicto | Por qué |
|---|---|---|
| Personas y ubicaciones (PRS) | **Conforme** | RF-PRS; permisos y celdas coinciden; árbol de ubicaciones y D-030/D-051 aplicados. |
| Entregas y devoluciones (ENT) | Conforme con observaciones | N-AUD-04 (una celda) y N-AUD-05 (plazo de retención sin fecha de arranque). |
| Proveedores y contratos (PRV) | Conforme con observaciones | 3 identificadores de pantalla viejos (`NOT-05`); casilla «contratos» bien asignada. |
| Garantías y mantenimiento (GAR) | Conforme con observaciones | N-AUD-02 (PS-231 recién creado) y N-AUD-03 (casilla); 2 pantallas viejas. |
| Notificaciones (NOT) | Conforme con observaciones | 34 citas de RN/RF sin código de módulo. |
| Dominios y certificados (DOM) | Conforme con observaciones | N-AUD-03 (casilla de la excepción no definida en D-043). |
| Licencias de software (LIC) | **Conforme** | Clave como campo secreto, contrato `CTR-`, casilla «licencias», celdas coinciden. |
| Líneas móviles (LIN) | Conforme con observaciones | N-AUD-03 (casilla). |
| Mesa de ayuda (AYU) | Conforme con observaciones | 40 citas sin código de módulo (iba en 54 y bajando); restos de "solicitante". |
| Onboarding y offboarding (ONB) | **Conforme** | Sin diferencias mecánicas; cese sin bloqueo coherente. |
| Portal de autoservicio (POR) | Conforme con observaciones | 6 identificadores de pantalla viejos (`AYU-01`, `AYU-02`, `AYU-14`). |
| CMDB ligera (CMD) | Conforme con observaciones | 58 citas de criterios sin "CA-"; evento de baja con nombre distinto a INT. |
| Gestión de cambios (CAM) | Conforme con observaciones | 62 citas de criterios sin "CA-". |
| Gestión de problemas (PRB) | Conforme con observaciones | 50 citas de criterios sin "CA-". |
| Presupuesto y costos (PRE) | **Conforme** | Sin diferencias de permiso; observación de forma (evento `presupuesto.aprobado`, N-AUD-06) y el gancho en la aprobación de la OC (conflicto 28) que se corrige en el núcleo, no aquí. |
| Reportes y tableros (REP) | Conforme con observaciones | 2 citas sin código de módulo; una celda con notación distinta. |
| Integraciones y API (INT) | **Conforme** | Sin diferencias mecánicas; alcances de clave con los nombres del registro. |

Resumen: 5 conformes, 12 conformes con observaciones, 0 no conformes.

**Núcleo (`documento-funcional.md` v0.3 y `registro-permisos.md`): conforme con observaciones** (H-AUD-23 parcial, conflicto 28, N-AUD-05 y N-AUD-07; S-33 a S-36 siguen como supuestos a confirmar por el Gerente).

### 6.2 Del conjunto: **conforme con observaciones**

Para D-064 condición 2 ("Los 17 módulos corregidos, sin choques con el núcleo; revisión del Auditor Técnico: conforme") hace falta pasar a **conforme**. Condiciones mínimas, todas de edición:

| # | Condición | Hallazgo |
|---|---|---|
| C1 | Reemplazar las citas de criterios sin "CA-" (CMD, CAM, PRB), las de RN/RF sin código de módulo (AYU, NOT, REP) y las pantallas viejas (POR, PRV, GAR) | N-AUD-01 |
| C2 | Decisión del Gerente sobre el mapa acto → casilla para dominios, líneas, garantías y corrección de costo, y confirmación de S-33 a S-36 | N-AUD-02, 03, 05 |
| C3 | Alinear ENT con RF-DAT-006 (inicio del plazo del nombre en el acta) y las dos celdas (ENT y REP) con el registro | N-AUD-04, 05 |
| C4 | Agregar en el núcleo (Etapa 5) el requisito del gancho de presupuesto en la aprobación de la OC | Conflicto 28 |
| C5 | Crear `docs/trazabilidad.md` y `docs/calidad/` con la matriz inicial | N-AUD-07 |
| C6 | Unificar el nombre del evento de baja del activo y el formato de `presupuesto.aprobado` | N-AUD-06 |

C1 es lo único voluminoso, pero es mecánico y se puede verificar con los mismos guiones. Cuando C1 a C6 estén hechas, vuelvo a correr las comprobaciones y doy el visto bueno por escrito.

---

## 7. Mensajes enviados

Tres mensajes, registrados en `docs/revision-cruzada/mensajes-ronda3-auditor-codigo.md`. Resultado: B corrigió `precios.ver` en LIC, LIN y DOM; A recogió S-33 en GAR y renombró los eventos; el Analista confirmó que RF-PER-010 queda separado y fijó el arranque de `retener_hasta` (RF-DAT-006, S-36); las citas sin prefijo quedan para los escuadrones C, D y E, que no pude avisar directamente (límite de tres mensajes).

## 8. Limitaciones

- No revisé `docs/prototipo/` (el encargo no lo incluía).
- Las comprobaciones mecánicas leen las tablas con las cabeceras actuales; si un módulo cambia el formato de sus tablas, hay que ajustar el guion.
- La lectura de fondo de los módulos corresponde a la ronda 2; en esta ronda releí solo las partes que cambian el veredicto.

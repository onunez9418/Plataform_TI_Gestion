# Respuesta del Analista de Negocio · plan de aplicación (AN-01 a AN-15)

**Fecha:** 2026-10-25
**Base:** `docs/equipo/plan-aplicacion.md`, sección 1, y decisiones D-065 a D-076.
**Archivos tocados:** `docs/documento-funcional.md` y `docs/registro-permisos.md` (no `docs/modulos/`, ni `decisiones.md`, ni `plan-aplicacion.md`).
**AN-16 (pasar a v1.0): NO hecho**, a la espera de la verificación del Auditor Técnico y de QA.

## 1. Registro por fila

| Fila | Estado | Dónde quedó |
|---|---|---|
| AN-01 | Hecho | Sección 24: S-32 a S-37 como "Confirmado" con las precisiones de D-065 (S-35 con la fórmula exacta; S-36 provisional hasta legal; S-37 remite a D-066). Quitadas las marcas `[SUPUESTO S-3x]` de RF-PLA-011 a 013, RF-INV-008, RF-OC-044, RF-DAT-006, RS-51 y la tabla de RN-017. Leyenda de la cabecera: "no queda ningún supuesto abierto" |
| AN-02 | Hecho | RN-017 (sección 21): principio de "costo comprometido" (D-070.1), "un documento sin costo no pasa por la regla de dinero", límite 0 con todas las líneas "sin costo" sí pasa; tabla de actos sin marcas de supuesto y con las precisiones de D-065 y D-070 (garantía extendida, mantenimiento sin OS, corregir costo con PS-51, revertir recepción); RF-OC-016 y CA-055 |
| AN-03 | Hecho | RF-OC-026 con la casilla «contratos y servicios recurrentes», el mapa acto a casilla (D-066) y los tres actos sin casilla (autoentrega, anonimización, rescate) |
| AN-04 | Hecho | Registro: PS-68 sensible con control "No"; PS-51 con confirmación por otra persona sobre el límite; RF-INV-026 y RF-OC-032 |
| AN-05 | Hecho | RF-PLA-001 ("2 a 3 personas; al menos dos antes de datos reales"), RF-PLA-009 (segunda persona o contacto confirmado, un uso por empresa y semana, aviso a todos), RF-PLA-011 a 013 y PS-05 sin marca de supuesto; RS-51 con prueba en integración continua (CA-083); CA-015e y CA-015f |
| AN-06 | Hecho | RF-INV-008 con la fórmula (inicio menos 1 día más los meses, ajustando al último día) y tres ejemplos; RF-OC-045 con el cuarto ejemplo (15,02); CA-072 y CA-082b |
| AN-07 | Hecho | Sección 19.2 en firme (campo secreto 512 y aviso de privacidad 5.000 agregados); P-013 cerrado; RNF-013 con la lista de reversibles y no reversibles (CA-090); RF-INV-005 y RF-IMP-010 con las tres condiciones de serie dañada; RF-CAT-012 con el largo exacto del campo identificador |
| AN-08 | Hecho | Registro v1.1: 16 permisos de D-068 marcados sensibles (35 a 51; con PS-234 son 52); PS-232 `empresa.configurar_aprobacion` (PS-08 queda sin monto límite), PS-233 `plataforma.ver_conteos_seguridad`, PS-234 `texto.redactar`; PS-106 y los otros `recibir_avisos` confirmados; sección 16 sin pendientes. Documento: RF-ACC-013, RF-ROL-005, CA-007, CA-011b |
| AN-09 | Hecho | Sección 18.1: filas nuevas (puestos de licencia, encuestas con nombre, acuse con IP, textos de extravío, comentarios de cambios y problemas, registro de envíos con su plazo, motivos y notas) y declaración de que el texto libre no es anonimizable de forma garantizada; RF-DAT-013 (PS-234) pasa a la Etapa 4 (CA-091) |
| AN-10 | Hecho | RF-PER-012 (suplente con PS-29, recordatorios cada 3 días, aviso al contacto a los 5 días, salida por rescate); RF-ACC-025 ("Primeros pasos"); CA-093 |
| AN-11 | Hecho | RF-ACC-006 y CA-068: código corto de 8 caracteres para abrir el enlace en otro dispositivo |
| AN-12 | Hecho (ver 2) | Columna CA en la tabla de reglas RN (los 22 con cita); sección 22.1 "Se ejecuta en: Etapa N"; CA partidos (016a/b, 052a1/a2, 052b1/b2, 054a/b/c, 060a/b, 064a/b, 065a/b); criterios de la Etapa 1 (CA-009, 015e, 015f, 068, 069, 071, 077, 083, 084, 085) y CA-070 ampliado; nuevos CA-086, 087, 088, 092 antes de la Etapa 2 |
| AN-13 | Hecho en parte | RF-OS-007 retirado y fusionado en RF-INV-012; §26.1 con CA nuevos citados. No reordené las tablas RF-OC, RF-CAT y RF-INV (se evitó para no mover IDs); CA-041 y CA-050 ya figuran en §26.1 |
| AN-14 | Hecho | RF-INV-033: evento único `inventario.activo_estado_cambiado` y `presupuesto.presupuesto_aprobado`; las citas de tabla ya usan "D-037 fila 11" |
| AN-15 | Hecho | Secciones 23 y 24: P-013 cerrado; P-015 y los insumos del Cliente (CEO) agregan "dos personas del equipo para administrar la plataforma"; sin cambios de dinero ni de legal |
| AN-16 | **No hecho (a propósito)** | Se hace cuando el Auditor Técnico y QA verifiquen las filas anteriores |

## 2. Detalles de AN-12 para QA

- Los criterios que cruzan etapas pero que D-075 y D-076 no pidieron partir quedan marcados "se completa en Etapa N" en 22.1 (por ejemplo CA-001, CA-011a y b, CA-041, CA-050a y b).
- No partí CA-040 en a y b; la tabla 22.1 indica que corre en Etapa 1 y se completa en Etapa 7. Si QA prefiere dos criterios, es un cambio de nombre.
- Los criterios de los módulos (CA-NOT-05, CA-NOT-07, CA-PRV-04) los ajusta su escuadrón; no los toqué.
- Los criterios de las Etapas 4 a 6 que D-076.3 difiere (RF-IMP-008, 009 y 015; RF-ENT-002; RF-OC-048, 049 y 050; los ambiguos H-QA-31) quedan para antes de abrir cada etapa; no los redacté ahora.
- Cobertura conocida sin criterio propio todavía: RF-IMP-008, 009 y 015, RF-OC-048 (CA-055 la nombra pero no la prueba) y RF-OC-049/050 (CA-061 las cubre en parte).

## 3. Cosas que no pude comprobar

- `docs/trazabilidad.md` es de QA; no lo edité ni lo comparé fila por fila.
- No ejecuté el guion de citas del Auditor Técnico. Hay un riesgo de referencias a `CA-016`, `CA-052a`, `CA-054` etc. sin letra en otros documentos; en el núcleo busqué y corregí las del cuerpo y de §26.1.

## 4. Supuestos y escalados

- No quedan [SUPUESTO] abiertos en el núcleo. Nada nuevo de dinero ni de legal. Un insumo más para el Cliente (CEO): designar dos personas para administrar la plataforma antes de cargar datos reales (P-015).

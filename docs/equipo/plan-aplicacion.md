# Plan de aplicación de las decisiones D-065 a D-076

**Autor:** Gerente de TI · **Fecha:** 2026-10-25
**Para quién:** la Jefatura de Proyecto, que lo despacha. Cada fila dice qué rol edita qué, en qué archivo y por qué decisión.
**Regla:** nadie cierra su propio trabajo. Después de editar, verifica el rol de la columna "Verifica". Los escuadrones son: **A** proveedores-contratos y garantías-mantenimiento; **B** licencias-software, lineas-moviles y dominios-certificados; **C** mesa-de-ayuda y notificaciones; **D** personas-ubicaciones, entregas-devoluciones, onboarding-offboarding y portal-autoservicio; **E** gestion-cambios, gestion-problemas y cmdb-ligera; **F** presupuesto-costos, reportes-tableros e integraciones-api.
**Prioridad:** **P1** = antes de cerrar el documento v1.0 (puerta de la Etapa 0); **P2** = antes de abrir la Etapa 2; **P3** = antes de la etapa que lo toca.

## 1. Analista Funcional: núcleo (`documento-funcional.md` y `registro-permisos.md`) → v1.0

| # | Qué editar | Decisión | Prio. | Verifica |
|---|---|---|---|---|
| AN-01 | §23: S-32 a S-37 pasan a "Confirmado" con las precisiones de D-065 (S-35 con la fórmula exacta; S-36 provisional hasta legal; S-37 remite a D-066). Quitar las marcas `[SUPUESTO S-3x]` del texto | D-065 | P1 | Auditor Técnico |
| AN-02 | RN-017: quitar `[SUPUESTO S-33]` de la tabla; agregar el principio de "costo comprometido" (D-070.1); redactar "un documento sin costo no pasa por la regla de dinero" y que una orden con todas las líneas "sin costo" y límite 0 sí pasa por aprobación (RF-OC-016, CA-055) | D-065, D-070, D-075 | P1 | QA |
| AN-03 | RF-OC-026: renombrar la casilla a «contratos y servicios recurrentes» y escribir el mapa acto → casilla (D-066); la anonimización y el rescate sin casilla | D-066 | P1 | Cumplimiento |
| AN-04 | PS-68 con control "No"; PS-51: confirmación por otra persona sobre el límite (RF-INV-026) | D-065 | P1 | Seguridad |
| AN-05 | RF-PLA-001 ("2 a 3 personas; al menos dos antes de datos reales"), RF-PLA-009 (segunda persona o contacto confirmado, un uso por empresa y semana, aviso a todos), RF-PLA-011 a 013 y PS-05 sin marca de supuesto; RS-51 con prueba en integración continua | D-065, D-073 | P1 | Seguridad |
| AN-06 | RF-INV-008 y RF-OC-045: fórmula del fin de garantía (inicio menos un día más los meses, ajustando al último día) y cuarto ejemplo de redondeo (impuesto sobre el subtotal redondeado; CA-072, CA-082b) | D-065, D-072 | P1 | QA |
| AN-07 | §19.2 "Límites y formatos" en firme (quitar "propuesta"; agregar campo secreto 512 y aviso de privacidad 5.000); cerrar P-013; reemplazar RNF-013 por la lista de reversibles y no reversibles; series dañadas (RF-INV-005, RF-IMP-010); largo exacto del campo "identificador" (RF-CAT) | D-072 | P1 | QA |
| AN-08 | Registro: marcar sensibles los 16 permisos de D-068 (el registro pasa de 35 a 51); crear PS-232 `empresa.configurar_aprobacion` (y sacarlo de PS-08), PS-233 `plataforma.ver_conteos_seguridad`, PS-234 `texto.redactar`; confirmar PS-106 `garantias.recibir_avisos` y los otros `recibir_avisos`; vaciar la sección 16 de pendientes; actualizar CA-007 y CA-011b, RF-ACC-013 y RF-ROL-005 | D-068, D-074 | P1 | Seguridad, QA |
| AN-09 | §18.1: una fila por dato que declaran los módulos (puestos de licencia, encuestas con nombre, acuse con IP, textos de extravío, comentarios de cambios y problemas, registro de envíos con su plazo); declarar que motivos y notas son texto libre no anonimizable; RF-DAT-013 (redacción del núcleo) a la Etapa 4 | D-075 (R-04, R-09), D-074.3 | P1 | Cumplimiento |
| AN-10 | RF-PER-012 y "Primeros pasos": tarea "Designar suplente de derechos de datos" con recordatorios cada 3 días y salida por rescate | D-071.1 | P2 | Cumplimiento |
| AN-11 | RF-ACC-006/026 y CA-068: código corto para abrir el enlace en otro dispositivo | D-073.4 | P2 | Seguridad |
| AN-12 | Criterios: columna **CA** en la tabla de reglas RN (citar los 18 sin cita); columna "Se ejecuta en: Etapa N" en cada CA; partir CA-016, 052a/b, 054, 060, 064, 065; criterios de la Etapa 1 (RF-ACC-006, 014, 020, RF-PLA-009 a 012, RF-EMP-004, RF-ROL-015, CA-070 ampliado, RN-008); criterios nuevos de RN-015, RN-016 y RF-CAT-026 antes de la Etapa 2 | D-076, D-075 | P1 (Etapa 1) / P2 | QA, Auditor Técnico |
| AN-13 | §26.1: completar CA-041 y CA-050; fusionar RF-INV-012 con RF-OS-007; ordenar RF-OC, RF-CAT y RF-INV donde convenga sin renumerar | D-075 (H-AUD-23) | P3 | Auditor Técnico |
| AN-14 | Catálogo de eventos: un solo evento `inventario.activo_estado_cambiado`; `presupuesto.presupuesto_aprobado`; citas de tabla "D-037 fila 11" | D-075 (N-AUD-06) | P3 | Auditor Técnico |
| AN-15 | §22 y §24: P-013 cerrado; agregar "dos personas de plataforma" a los insumos del CEO; sin cambios de dinero ni de legal | D-072, D-073 | P2 | Gerente de TI |
| AN-16 | Pasar la versión a **v1.0** con registro de cambios, una vez verificadas las filas anteriores | D-064.1 | P1 | Gerente de TI |

## 2. Escuadrones: módulos (`docs/modulos/`)

| Escuadrón | Módulo | Qué editar | Decisión | Prio. | Verifica |
|---|---|---|---|---|---|
| **A** | garantias-mantenimiento | RN-GAR-003 con la fórmula de S-35 (CA-GAR-01, 15 y 04 ya concuerdan); RN-GAR-041: casilla «contratos y servicios recurrentes»; PS-231 sensible; usar PS-106 `garantias.recibir_avisos`; correos con el código del activo en lugar de la serie | D-065, D-066, D-068, D-074, D-075 | P1 | Auditor Técnico |
| **A** | proveedores-contratos | PS-76 sensible y su casilla según el tipo de contrato (D-066, D-069); confirmar que remite a PS-76 y PS-78 para licencias | D-066, D-068, D-069 | P1 | Auditor Técnico |
| **B** | lineas-moviles | SUP-LIN-14 "Aceptado (D-070)"; RN-LIN-016: casilla «contratos y servicios recurrentes»; PS-224 sensible | D-066, D-068, D-070 | P1 | Auditor Técnico |
| **B** | dominios-certificados | SUP-DOM-13 y SUP-DOM-14 "Aceptado (D-070)"; RN-DOM-017: casilla de D-066; PS-228 sensible | D-066, D-068, D-070 | P1 | Auditor Técnico |
| **B** | licencias-software | SUP-LIC-16 "Aceptado (D-070)"; confirmar el contrato con PS-76 y la casilla «licencias»; el validador de texto libre alcanza también a la serie | D-066, D-069, D-070, D-075 | P1 | Seguridad |
| **C** | notificaciones | CA-NOT-20 (aviso a quien creó la orden cuando se aprueba o rechaza, sin importes); CA-NOT-05 y CA-NOT-07 con "Se ejecuta en"; catálogo de eventos acordado; el tope de invitaciones del cuadro único | D-075, D-076 | P2 | QA |
| **C** | mesa-de-ayuda | RN-AYU-027 cita RN-PRS-033 (suplente de derechos); estado "En espera de la persona atendida" y su evento; casilla «mesa de ayuda» | D-071, D-075, D-066 | P2 | Cumplimiento |
| **D** | personas-ubicaciones | S-PRS-14 "Aceptado (D-071)": suplente con PS-29, recordatorios y salida por rescate (RN-PRS-033, caso límite 14) | D-071 | P2 | Cumplimiento |
| **D** | entregas-devoluciones | `entregas.imprimir_acta`, columna Empleado: "-"; RN-ENT-021 alineada a S-36 (cierre de la asignación + 5 años, provisional) | D-065, D-075 | P1 | Auditor Técnico |
| **D** | portal-autoservicio | Caso 13 con el suplente de derechos; frases de "solicitante" sin sentido de rol | D-071, D-075 | P2 | Cumplimiento |
| **D** | onboarding-offboarding | Frases de "solicitante" sin sentido de rol | D-075 | P3 | Auditor Técnico |
| **E** | gestion-cambios | PS-175 cita D-067 y la casilla «cambios»; PS-172 y PS-173 sensibles; "En espera de la persona atendida" donde aplique | D-066, D-067, D-068 | P1 | Auditor Técnico |
| **E** | gestion-problemas | S-PRB-12 "Aceptado con condición": dos textos (resumen para usuarios y detalle técnico); casilla «problemas» | D-066, D-071.2 | P3 | Seguridad |
| **E** | cmdb-ligera | S-CMD-11 y S-CMD-12 "Aceptado (D-071)": umbral de 100 nombres de Personas; evento de baja `inventario.activo_estado_cambiado` | D-071, D-075 | P3 | Auditor Técnico |
| **F** | presupuesto-costos | `presupuesto.presupuesto_aprobado`; PS-114, PS-116, PS-117, PS-118 sensibles; "Cuándo" con las tres palabras; cita RF-OC-051 | D-068, D-075 | P3 | Auditor Técnico |
| **F** | reportes-tableros | "Cuándo" con las tres palabras; filtros sin valores personales (ya hecho) | D-075 | P3 | Auditor Técnico |
| **F** | integraciones-api | PS-135 sensible con reautenticación; "Cuándo" con las tres palabras; evento de estado del activo | D-068, D-075 | P3 | Seguridad |

## 3. Otros roles

| Rol | Qué hace | Decisión | Prio. | Verifica |
|---|---|---|---|---|
| **Arquitecto** | Redacta los ADR de las decisiones técnicas T-1 a T-14 en `docs/arquitectura/`. El ADR de aislamiento incluye ya la **lectura de soporte** (D-039.10): tabla global `autorizacion_soporte`, transacción de solo lectura con `app_empresa`, función `SECURITY DEFINER`, prueba con la autorización vencida o ajena. Convierte el registro de permisos en catálogo del código. Prueba en CI de que la base no guarda valores que sirvan para entrar (RS-51). Diseña con Seguridad el código corto de ingreso | D-039, D-065, D-073 | P1 | Seguridad |
| **Ingeniero de Datos** | Índices únicos parciales de las claves naturales (D-070.6) que excluyen lo anulado; tabla de filas de importación en preparación con empresa, reglas por fila y limpieza a los 7 días; ADR de importación; tabla de eventos; confirmar con el Arquitecto las funciones de acceso previas a la empresa | D-070, D-075 | P2 | Arquitecto |
| **DevOps** | Reeditar `plan-entornos-y-costos.md` a la v0.3: ejecución continua con trabajador y cola (no Vercel como supuesto), **cinco roles de base**, 60 conexiones, reloj fijable y disparador manual, correo de captura **legible en pruebas**, generador de datos de dos empresas con volumen de 100.000 activos y 500.000 movimientos, carga nocturna desde la Etapa 4, entornos efímeros **con base propia** (sin base de pruebas compartida), inyección de fallos, RS-49 en la restauración, ensayo de la copia externa de auditoría. Elegir proveedor candidato **con precios verificados** y presentar la comparación; ramas protegidas y revisión automática en `.github/`; matriz de entrega de correo; llaves físicas | D-038, D-039, D-052, D-064, H-QA-24 | P1 | QA, Gerente de TI |
| **Seguridad** | Redacta con Cumplimiento el borrador de `docs/operaciones/procedimiento-incidente-datos.md` sobre D-059; revisa RF-PLA-001/009/011 a 013 y PS-05 tras la edición; aprueba por escrito la estrategia de llaves de D-048.4; revisa el prototipo; revisa el diseño anti-SSRF antes de INT-2 | D-059, D-073 | P1 | Gerente de TI |
| **Auditor de Cumplimiento** | Co-redacta el procedimiento de incidente; revisa AN-09 (§18.1) y AN-10; firma el visto bueno del núcleo cuando se cumpla su condición 1 | D-075 | P1 | Gerente de TI |
| **QA** | Actualiza el plan de pruebas y la matriz con D-065 a D-076 (recalcula las celdas de permisos con 51 sensibles y PS-232 a PS-234; casos de 2F para aprobadores; CI-16 y CI-17); mantiene `docs/trazabilidad.md`; vuelca los criterios nuevos; mide el prototipo con los 7 criterios; corre el guion de citas en integración continua | D-068, D-076 | P1 | Auditor Técnico |
| **Diseñador UX/UI** | Pantalla del código corto de ingreso, pantalla "Primeros pasos" con el suplente de derechos, aviso de segunda verificación para quien aprueba dinero, nombres de grupos, pestañas y colores (P-014); termina el prototipo A | D-053, D-071, D-073 | P1 | Gerente de TI |
| **Auditor Técnico** | Vuelve a correr sus guiones tras las ediciones (citas, permisos, celdas, fases) y firma "conforme" cuando C1 a C5 estén hechas | D-075 | P1 | Gerente de TI |
| **Jefatura de Proyecto** | Despacha este plan; transmite al CEO `hoja-ceo.md` y la sección 5 de `puerta-etapa-0.md`; coordina la demo del prototipo | D-064 | P1 | - |

## 4. Orden de despacho sugerido

1. **Hoy, en paralelo:** AN-01 a AN-09 (Analista); los P1 de los escuadrones A, B, D y E; DevOps (plan, proveedor candidato, repositorio); Seguridad y Cumplimiento (procedimiento de incidente); Diseñador (prototipo).
2. **Después de AN-08:** QA recalcula la matriz; Auditor Técnico re-corre guiones.
3. **Cuando DevOps nombre candidato:** Arquitecto y Datos inician el prototipo técnico (planes gratuitos, datos inventados).
4. **Cierre:** AN-16 (v1.0), cuatro vistos buenos escritos, demo del prototipo de pantallas al CEO y actualización de `puerta-etapa-0.md`.

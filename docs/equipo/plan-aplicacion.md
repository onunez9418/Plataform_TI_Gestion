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

---

# Plan de aplicación 2: decisiones D-087 a D-101 (revisión de los ADR)

**Autor:** Gerente de TI · **Fecha:** 2026-10-29
**Origen:** las 15 decisiones técnicas de `decisiones.md` (D-087 a D-101) y la sección «Decisiones D-0xx por registrar» de `docs/arquitectura/README.md`. **No se edita el núcleo ni los módulos desde aquí**: cada fila la hace su responsable y la verifica otro rol (regla: nadie cierra su propio trabajo).
**Prioridad:** **P1** = antes de abrir la Etapa 1 o de que el prototipo técnico dé resultados válidos; **P2** = antes de la etapa que lo usa; **P3** = antes de la ola G.
**Orden:** las olas se despachan en el orden numerado; lo de una misma ola va en paralelo (máximo cuatro agentes a la vez).

## Ola 1: confirmaciones que desbloquean (P1, hoy)

| # | Responsable | Qué hace | Decisión | Verifica |
|---|---|---|---|---|
| A2-01 | **Seguridad** | Confirma por escrito los cinco puntos de D-091 (quién puede ejecutar `enlace_ingreso_emitir`; reintento con solo el último correo; falla tras emitir; prueba RS-51 con cola y registro de envíos; invitación y acceso de emergencia desde la consola) | D-091 | Gerente de TI |
| A2-02 | **Seguridad** | Confirma que sus condiciones de la ronda 5 quedaron incorporadas en los ADR 01 a 20 y 23 (segunda lectura corta; en especial H-SEG-33, 38 a 44, 54 a 62), la lista cerrada de 18 tablas globales (D-093) y la precisión sobre códigos de recuperación (D-088) | D-087 a D-090, D-093, D-095 | Gerente de TI |
| A2-03 | **Datos** | Confirma que sus condiciones (D03-1 a D18-10) quedaron incorporadas, en especial las ocho bloqueantes; prepara macros y migraciones de ejemplo para el prototipo (clave `(empresa_id, id)`, funciones de normalización) | D-093, D-097 | Arquitecto |
| A2-04 | **Seguridad y DevOps** | Cierran el procedimiento de alta de nuevas personas de plataforma y sus llaves físicas (dos custodios; H-SEG-51) y eligen las librerías de segundo factor y de llave física (Etapa 1) | D-088, D-089 | Gerente de TI |
| A2-05 | **DevOps** | Nombra el **proveedor candidato** (con precios con fecha y enlace): debe ofrecer PostgreSQL 15 o superior, tres servicios de ejecución continua más dos tareas programadas (o procesos de corta vida), agrupador de conexiones en modo transacción y conexión directa. Informa el **costo del tercer servicio** de la consola (D-089) para la hoja del CEO | D-089, D-097, D-099 | Gerente de TI |

## Ola 2: documentos que dependen de las decisiones (P1 a P2)

| # | Responsable | Qué edita | Decisión | Prio. | Verifica |
|---|---|---|---|---|---|
| A2-06 | **Analista** | `documento-funcional.md` RF-AUD-013: cuatro tipos de autor (los que fija ADR-11, el cuarto es `plataforma`) y marca de origen `asistente` que no es autor | D-094, D-101 | P1 | Auditor Técnico |
| A2-07 | **Analista** | RF-AUD-016: «omite a las empresas» pasa a «pospone la purga de la partición mientras haya una congelación vigente» | D-095 | P1 | Cumplimiento |
| A2-08 | **Analista** | RF-ACC (verificación reciente solo con segundo factor, 10 minutos; el enlace no la renueva) y texto de D-048.2 | D-088 | P1 | Seguridad |
| A2-09 | **Analista** | RF-PLA-001: ingreso de la consola solo con llave física, segunda llave de respaldo, vencimientos de 15 minutos y 4 horas; RF-PLA-005 y los RS nuevos (cabeceras, cookies `__Host-`, asistente) | D-089, D-094 | P1 | Seguridad |
| A2-10 | **Analista** | `registro-permisos.md`: fila **PS-247 `empresa.autorizar_soporte`** (sensible n.º 55; 2F, verificación reciente y registrar al revocar; Adm = T; Plat = «-»; Cuándo = Etapa 1; siguiente libre PS-248). Cita en RF-EMP/RF-PLA de la lectura de soporte | D-094 | P1 | Seguridad, QA |
| A2-11 | **Analista** | §18.1 y aviso de privacidad (con Cumplimiento): respaldos que conservan la exportación cifrada, motivo por valor, datos de Microsoft, envío al proveedor de IA y «lo que la persona teclee puede llevar nombres» (D-101) | D-098, D-100, D-101 | P2 | Cumplimiento |
| A2-12 | **Analista (MSF)** | `microsoft-entra-intune.md`: PS-236/PS-239 sueltos pasan a PS-242/PS-245; RF-MSF-004 (el vencimiento del secreto lo escribe quien conecta); sección 6 (tabla global `directorio_microsoft` con huella nivel A); RN-MSF-022 (el Arquitecto señala nivel B: **verificar contra ADR-09**, que usa nivel A para el directorio, y que Seguridad confirme si un identificador de cuenta tiene entropía suficiente); RN-MSF-042 (barrera de la mitad); periodicidades iniciales (equipos 6 h, cuentas 24 h) | D-100 | P3 | Auditor Técnico, Seguridad |
| A2-13 | **Analista (ASI)** | `asistente-ia.md`: RN-ASI-013 (el estado de la conversación lo guarda el navegador), 9.1 punto 13 (sin tabla global nueva, se usa `limite_plataforma`), RF-AUD-013 (columna `origen`), D-086.3 con la precisión de D-101, D-086.4 (la casilla de texto libre la levanta el Administrador de plataforma con PS-240) | D-101 | P3 | Auditor Técnico, Cumplimiento |
| A2-14 | **Analista** | Preguntas abiertas de Datos: decimales de cantidades (D06-7) y unicidad del IMEI entre categorías (D17); `personas-ubicaciones.md` e `indices-claves-naturales.md`: gancho «al anonimizar» y mapa de columnas personales | D-097 | P2 | Ingeniero de Datos |
| A2-15 | **Escuadrón F** | `integraciones-api.md` y `presupuesto-costos.md`: texto de D-077 (pendiente desde el 2026-10-26; es condición 2 de la puerta) | D-077 | P1 | Auditor Técnico |
| A2-16 | **Diseñador** | Aviso de «código del autenticador cada 10 minutos» en acciones delicadas; pantalla de ingreso a la consola con llave física; caso de lectura de soporte en el prototipo | D-088, D-089, D-094 | P2 | Gerente de TI |

## Ola 3: DevOps, Cumplimiento, QA y Arquitecto

| # | Responsable | Qué hace | Decisión | Prio. | Verifica |
|---|---|---|---|---|---|
| A2-17 | **DevOps** | `plan-entornos-y-costos.md`: escenario A de 6.7 reescrito (códigos de recuperación y claves de API no dependen de la maestra); variables por proceso (tabla de ADR-01) y su prueba de arranque; tareas programadas de purga y de copia externa; versión de PostgreSQL; permiso `pg_read_all_stats` (lo pide el Arquitecto; DevOps confirma si hace falta); cabeceras de seguridad en el despliegue y su prueba en integración continua; límites de conexión por rol (seis roles); archivo de versiones de llave retiradas hasta que expire el último respaldo (H-SEG-47); anotar el riesgo residual de los registros de acceso del alojamiento (H-SEG-49) | D-087, D-089, D-090, D-097 | P1 | QA, Seguridad |
| A2-18 | **Cumplimiento** | Aviso de privacidad y §18.1 (con A2-11); copia externa sin IP ni motivo (confirma D-092); canal de entrega de derechos de datos (H-SEG-57: propuesta de partida del Arquitecto, el paso no se construye); quién ejerce los papeles de la congelación; procedimiento de incidente: una filtración de la maestra deja expuestos los respaldos cifrados con ella hasta que expiren; confirma que la exportación en la base no es «almacén de archivos» de D-022 | D-092, D-095, D-098 | P1 | Gerente de TI |
| A2-19 | **QA** | Actualiza `criterios-por-etapa.md` (hoy 603; subirá) y el plan con: los cinco casos de H-SEG-41; los 13 de H2; H12; RS-51 ampliada (cola con fallidos, varias representaciones, registro de envíos); cookies y cabeceras por ruta; el enlace no renueva la verificación; descarga única; congelación; correo fallido solo como huella; prueba del catálogo (todo permiso con control `R` es sensible); recalcula la matriz con **55 sensibles**; casos de D-100 (permiso de escritura detectado, barrera de la mitad) y de D-101 (proveedor malicioso IO-01 a IO-14, diez conversaciones contra el tope) | D-087 a D-101 | P1 (núcleo) / P3 (ola G) | Auditor Técnico |
| A2-20 | **Arquitecto** | Con las confirmaciones A2-01 a A2-03, pasa cada ADR a «Aceptado» (registro de «Cambios» con fecha y decisión, no en silencio); ajusta «cinco roles» a «seis» donde quede; escribe el **informe del prototipo** (`prototipo-resultados.md`) y marca como «futuro» las citas que aún no existen | D-087 a D-101 | P1 | Gerente de TI |
| A2-21 | **Auditor Técnico** | Corre sus guiones tras A2-06 a A2-15 (citas, permisos, 55 sensibles, PS-247 sin choques) y comprueba que ningún ADR contradiga una decisión vigente | D-094 | P1 | Gerente de TI |

## Orden de despacho

1. **Hoy, en paralelo (máximo cuatro):** Seguridad (A2-01, A2-02), DevOps (A2-05, luego A2-17), Analista (A2-06 a A2-10), Datos (A2-03).
2. **Después de A2-10:** QA recalcula la matriz (A2-19); Auditor Técnico corre guiones (A2-21).
3. **Cuando DevOps nombre candidato (A2-05) y Seguridad confirme A2-01:** el Arquitecto y Datos inician el prototipo de 4 días y 1 de reserva (D-099).
4. **En paralelo con lo anterior:** Cumplimiento (A2-18) y Escuadrón F (A2-15).
5. **Después, sin urgencia:** A2-11 a A2-14 y A2-16; A2-12 y A2-13 (módulos de la ola G) solo antes de las revisiones de esos módulos.

## Estado del Plan de aplicación 2 al 2026-10-29 (cierre de la ronda 6)

Solo se marca como **hecho** lo que se comprobó en un archivo o en un commit; lo demás queda como «por verificar» o «pendiente». Regla de siempre: quien lo hizo no lo cierra.

| # | Estado | Evidencia o lo que falta |
|---|---|---|
| A2-01 | **Hecho** (lo de Seguridad) | Ronda 6: H-SEG-46 avalada con cuatro condiciones de texto (`ronda6-seguridad-adr.md`). Las cierra la prueba P1 a P8 del prototipo (D-111.1) |
| A2-02 | **Hecho** | Ronda 6: 27 de 30 hallazgos cerrados, 2 parciales (38, 46) y 1 abierto por diseño (57, de Cumplimiento) |
| A2-03 | Por verificar | Datos aún no confirmó por escrito sus ocho bloqueantes |
| A2-04, A2-05 | Pendiente | Seguridad y DevOps: alta de personas de plataforma y llaves físicas; proveedor candidato con precios con fecha y enlace |
| A2-06 | **Hecho** | RF-AUD-013 con cuatro autores y marca `asistente`; verifica el Auditor Técnico |
| A2-07 | **Hecho** | RF-AUD-016 pospone la purga con congelación; lo verifica Cumplimiento; falta mencionar los eventos de seguridad (D-113.2) |
| A2-08, A2-09 | Por verificar | Los pasajes existen en parte (RF-ACC-013 con 55 sensibles, RF-PLA-001 con llave física); lo confirma el Auditor Técnico en A2-21 |
| A2-10 | **Hecho, con cabos** | Fila PS-247 y 55 sensibles en el registro v1.3; faltan las seis celdas y la columna de plataforma (D-113.4) |
| A2-11 a A2-16 | Pendiente | Sin cambios; A2-12 y A2-13 solo antes de las revisiones de la ola G |
| A2-17, A2-18 | Pendiente | DevOps (plan 6.7 y demás) y Cumplimiento (H-SEG-43, 56, 57) |
| A2-19 | **Parcial** | QA: 612 criterios y plan de pruebas v2.2 (commit 9404e3c); faltan los casos de la ronda 6 (abajo) |
| A2-20 | **Parcial** | El Arquitecto incorporó la ronda 6 y escribió ADR-24; ningún ADR pasa a «Aceptado» todavía (faltan A2-03, A2-18 y las ratificaciones de D-111) |
| A2-21 | Pendiente | Corre después de A2-06 a A2-15 y de la Ola 4 |

## Ola 4: lo que queda de la ronda 6 (D-111 a D-114), por rol

Se despacha en el orden numerado; lo de una misma fila va en paralelo (máximo cuatro agentes a la vez). Prioridad: **P1** = antes del día 3 del prototipo o de pasar el ADR a «Aceptado»; **P2** = antes de la etapa que lo usa; **P3** = antes de la ola G.

| # | Responsable | Qué hace | Decisión | Prio. | Verifica |
|---|---|---|---|---|---|
| A2-22 | **Arquitecto** | Quita «propuesta, a ratificar» de ADR-04, 08, 01, 22 y 23 y de la tabla del README, con las correcciones de D-111; ADR-23: sin dos personas de plataforma no hay levantamiento y la provisional no se vuelve a declarar sin confirmar; ADR-24 §5: «no viajan» (D-112) con la ficha «elegido / ninguno / pendiente»; completa con el punto 6 de H-SEG-78 lo que quede; pasa a «Aceptado» solo los que ya tengan sus confirmaciones, con registro de cambios | D-111, D-112 | P1 | Seguridad |
| A2-23 | **Analista** | Aplica los valores de D-113: S-ENT-12 «Aceptado (D-113)» y RN-ENT-017; RF-AUD-016 con los eventos de seguridad; **PS-247** (seis celdas «-», columna de plataforma, sin [PENDIENTE], aviso al crear; versión 1.4) y la matriz; PS-240 y RF-PLA-011 con «dos personas»; D-086.4; `asistente-ia.md` donde el modelo vea el modelo o la categoría del equipo (D-112) | D-111, D-112, D-113 | P1 | Auditor Técnico, Seguridad |
| A2-24 | **QA** | Plan de pruebas: matriz de 511 celdas sin pendientes (PS-247 en «rechazado» para 6 plantillas); P1 como puerta; levantamiento del texto libre con una sola persona de plataforma, sin L-19 registrada, con veto y sin él; nueva declaración de congelación tras vencer; criterio de la purga de eventos de seguridad con congelación; canario en el nombre del equipo (0 apariciones hacia el proveedor); renovación de préstamo al pasar los 365 días | D-111, D-112, D-113 | P1 | Auditor Técnico |
| A2-25 | **DevOps** | Verifica y registra por escrito el **tope duro en la cuenta del proveedor de IA** (cuenta de pruebas con tope bajo, a nombre del CEO) antes de cualquier uso del chat; dos cuentas de base con claves separadas y la tabla de variables por proceso; lista de salidas de red del trabajador | D-111, D-114 | P1 (cuentas) / P3 (tope) | Seguridad |
| A2-26 | **Cumplimiento** | Decide el consentimiento expreso de la empresa para el texto libre (L-19) y confirma o ajusta las 72 horas de la congelación provisional; confirma H-SEG-77 (copia con llave de la fila completa, sin resúmenes de IP y motivo); frase de H-SEG-72 («el asistente no recibe datos de la tabla de Personas; puede recibir texto que alguien escribió en otros campos») e información comercial en el aviso | D-111, D-112 | P1 | Gerente de TI |
| A2-27 | **Seguridad** | Firma la lista de permisos de Graph cuando pueda verificarla; confirma las correcciones de D-111; revisa la suite IO-15 en adelante y la lista fija de expresiones de emergencia | D-111 | P2 / P3 | Gerente de TI |
| A2-28 | **Diseñador** | Tarjetas de equipo sin enviar nada al modelo (el chat «pide la tarjeta»); aviso de la pantalla de conexión con Microsoft sobre el daño máximo de una filtración (H-SEG-71) | D-112 | P2 | Gerente de TI |
| A2-29 | **Jefatura de Proyecto** | Registra por escrito cuando L-19 sea contestada (condición para levantar el texto libre); transmite al CEO la hoja corregida (D-114); no hay preguntas nuevas para el CEO | D-111, D-114 | P3 | - |

## Ola 5: piloto gratuito para probar con clientes (D-115)

**Fecha:** 2026-10-29 · **Origen:** pedido del CEO y `docs/operaciones/piloto-gratuito.md` (ratificado con correcciones en D-115). Máximo cuatro agentes a la vez. **Regla que manda sobre todo lo de abajo:** solo datos de ejemplo; D-064 no se debilita.
**Hoy no hay código.** Lo que se puede hacer ahora es A2-30 a A2-33 y los documentos. Render, Resend y las pruebas con clientes esperan a que exista una aplicación mínima con ingreso (Etapa 1) y a la demo aprobada por el CEO.

### Estado de la Ola 5 tras D-117 (2026-10-29): sin oferta, demo ni acceso de clientes hasta el hito «100 %»

**Por decisión del CEO** («aún no vamos a ofrecer nada hasta tener todo al 100 %») el piloto pasa a **entorno interno** (equipo y CEO, datos de ejemplo). Lo que solo servía para ofrecer queda **en pausa** y se retoma en «antes de ofrecer» (D-117.7); nada se borra. Orden de construcción en `hoja-de-ruta.md`.

| # | Estado | Qué queda y qué se pausa |
|---|---|---|
| A2-30 DevOps (verificar cifras y términos) | **Continúa**, alcance reducido | Cifras, planes y límites para uso interno. La cláusula de «uso comercial con clientes» se anota pero **ya no bloquea** (antes de ofrecer) |
| A2-31 Jefatura (correo de la empresa, suplente y dominio) | **Continúa** | Correo con suplente: ahora (condición 9). **Dominio: pausa**, salvo lo que pida la condición 6 de la puerta (prueba de entrega de correo) |
| A2-32 Primera prueba en Neon | **Continúa** | Es parte del prototipo técnico (condición 4) |
| A2-33 Seguridad (variables y guardas del modo piloto) | **Continúa** | El entorno interno usa el modo piloto |
| A2-34 Render y A2-35 GitHub Actions | **Continúan** (en la Etapa 1) | Entorno interno; consola aparte si las horas lo permiten, si no se avisa al CEO (dinero) |
| A2-36 Resend | **Parcial** | Modo captura y la matriz de entrega de la condición 6: siguen. **Envío a clientes con dominio: pausa** |
| A2-37 Reconstrucción y medición | **Parcial** | Reconstrucción cronometrada con el generador: sigue (vuelve la regla de D-115.6iii). **Medición de una semana para varias demos: pausa** |
| A2-38 Arquitecto (sección «Modo piloto» en ADR-01 y ADR-02) | **Continúa** | Sin cambio |
| A2-39 Analista (RF «Modo piloto») | **Continúa** | Franja y aceptación se reutilizan en la demostración. Sin cambio de reglas de negocio |
| A2-40 Diseñador | **Parcial** | Franja y aviso «solo datos de ejemplo»: siguen. **Pantalla «despertando»: pausa** (nadie de fuera espera) |
| A2-41 QA (criterios del modo piloto) | **Continúa** | Sin cambio |
| A2-42 Cumplimiento (acuerdo de prueba para el abogado) | **Pausa** | Se retoma en «antes de ofrecer», junto con las preguntas del abogado sobre el plazo de guarda. El borrador puede quedar escrito, sin gastar honorarios |
| Pedidos de D-116: Analista (RF/RN/CA de demostración) | **Parcial** | Lo mínimo de la Etapa 1 (tipo de empresa, límites, vigencia, bloqueo, franja) entra ya en el documento; el paquete queda como «Fase 3, tramo de cierre» |
| Pedidos de D-116: Arquitecto (enmienda de ADR-01) y Diseñador (franja y pantalla de vencimiento) | **Continúan** | Son de la Etapa 1 |
| Pedidos de D-116: Seguridad, QA, Cumplimiento, DevOps y Backend (límites contra abuso, topes de filas, aviso a invitados, consumo gratuito con varias demos) | **Pausa** | Tramo de cierre; el máximo de demostraciones a la vez se mide antes de ofrecer |
| ADR-25 (instalaciones dedicadas y SQL Server) | **Pausa comercial; revisión en P3** | Sigue «Propuesto». Su revisión por Seguridad, DevOps, Datos y Cumplimiento va antes del tramo de cierre. Que entre o no al 100 % lo decide el CEO |

Pendiente fuera de `docs/equipo/`: DevOps añade a `docs/operaciones/piloto-gratuito.md` la nota «uso interno hasta el 100 %, ver D-117»; el Arquitecto marca ADR-25 como «en pausa comercial (D-117)».

### Qué debe hacer DevOps: condiciones, orden y criterio de éxito

**Condiciones (todas, antes de crear nada):** (1) cada cifra y cada cláusula de uso comercial verificadas en la página oficial (lista en la sección 6 de `piloto-gratuito.md`), con fecha y enlace; si un servicio prohíbe probar con clientes de otra empresa, ese servicio se reemplaza por el plan B o C antes de usarlo con clientes (puede seguir en uso interno); (2) cuentas con el correo de la empresa, suplente y segundo factor, nunca personales (D-064.9); (3) **si un servicio pide tarjeta o cobra por exceso en vez de detenerse, se para y se avisa a la Jefatura de Proyecto** (dinero del CEO); (4) secretos solo en las variables secretas de Render y de GitHub, nunca en el repositorio, con la lista de variables del modo piloto aprobada por Seguridad (D-064.10); (5) el piloto es un entorno aparte que no se reutiliza como producción; (6) se registra la región elegida de cada servicio.

**Orden:**
1. **Verificar cifras y términos** sin crear cuentas; resultado en `docs/operaciones/piloto-verificacion.md` (A2-30).
2. **Crear las cuentas** cuando el CEO entregue el correo de la empresa y el suplente (A2-31).
3. **La primera prueba, solo en Neon** (A2-32; es también el día 0 de `plan-entornos-y-costos.md` §10, y cuenta como evidencia para el prototipo técnico). **Criterio de éxito** (todo con evidencia escrita; QA valida, Seguridad revisa): los roles y cuentas de ADR-01 creados **por SQL y no desde el panel de Neon**, con `app_empresa_*` sin ser dueño, sin ser superusuario y con `rolbypassrls = false`; políticas por fila **forzadas** en una tabla de ejemplo con `empresa_id`; la empresa A no ve nada de la B, y sin fijar empresa se ven **cero filas**; por el agrupador en modo transacción, con empresas alternadas, la empresa no se queda pegada entre peticiones; `app_plataforma` no lee tablas de negocio; función `SECURITY DEFINER`, clave foránea compuesta, partición y las cinco extensiones; conexión directa para el trabajador. Se **registran** (sin bloquear el piloto) el límite de conexiones y la retención de respaldos. **Si fallan roles, políticas, aislamiento por el agrupador o `app_plataforma`: se detiene todo, sin arreglos con un rol dueño o más permisos, y se vuelve a mesa con el plan C.**
4. **Render:** servicio de la web con variables, `/salud`, cabeceras de ADR-01, `MODO_PILOTO` y su guarda; consola como segundo servicio si las horas lo permiten (A2-34).
5. **GitHub Actions:** paso de migraciones con el secreto allí y latido cada cierto tiempo hacia `/api/piloto/latido`; la frecuencia la decide DevOps con las cifras oficiales (que alcancen las horas del mes y que la demo no encuentre la aplicación dormida) (A2-35).
6. **Resend:** primero en modo captura (interno); después, con dominio, SPF, DKIM y DMARC en «pass» y la matriz de entrega de D-064.6; sin dominio no hay prueba con clientes (A2-36).
7. **Reconstrucción cronometrada** del piloto con el generador de datos de dos empresas (meta: minutos) y **medición de una semana** de horas de cálculo de Neon y de horas de Render (A2-37).

### Pedidos por rol

| # | Responsable | Qué hace | Decisión | Prio. | Verifica |
|---|---|---|---|---|---|
| A2-30 | **DevOps** | Verifica cifras y cláusulas de uso comercial en páginas oficiales; escribe `piloto-verificacion.md` con fecha y enlace; confirma en la documentación de Neon si los roles creados desde el panel saltan las políticas por fila | D-115 | P1 | Gerente de TI |
| A2-31 | **Jefatura de Proyecto** | Pide al CEO el correo de la empresa y el suplente (hoja del CEO, sección D) y, si existe, el dominio o subdominio | D-115 | P1 | - |
| A2-32 | **DevOps** con **Ingeniero de Datos** | La primera prueba en Neon (criterio arriba), con los guiones de H1 de `prototipo-tecnico.md` | D-115.5 | P1 | QA, Seguridad |
| A2-33 | **Seguridad** | Lista de variables y guardas del modo piloto (qué proceso tiene qué, prohibición en producción, ruta de latido, secretos); revisa la evidencia de A2-32 con modelo potente (toca aislamiento) | D-115 | P1 | Gerente de TI |
| A2-34 | **DevOps** | Render: web, salud, cabeceras, `MODO_PILOTO`; consola aparte si se puede | D-115 | P2 (Etapa 1) | Seguridad |
| A2-35 | **DevOps** | GitHub Actions: migraciones y latido | D-115 | P2 (Etapa 1) | Seguridad |
| A2-36 | **DevOps** | Resend en captura y luego con dominio y matriz de entrega | D-115, D-064.6 | P2 (con dominio) | QA |
| A2-37 | **DevOps** | Reconstrucción cronometrada y medición de una semana; informe corto | D-115 | P2 | QA |
| A2-38 | **Arquitecto** | Sección «Modo piloto (D-115)» en ADR-01 (un proceso con las dos cuentas, solo con datos de ejemplo, prohibido en producción) y ADR-02 (ciclo único sin conexión permanente, ruta de latido propia, sin reloj fijable); el texto de producción no cambia | D-115 | P1 | Seguridad |
| A2-39 | **Analista** | **Sí hace falta** un RF de «Modo piloto» (sección corta de plataforma en `documento-funcional.md`): franja permanente, aceptación al primer ingreso registrada en la auditoría, correos con «[PRUEBA]», chat apagado, reconstrucción periódica; sin permisos nuevos ni cambios de reglas de negocio; actualiza el documento en el mismo cambio | D-115 | P2 (antes de la Etapa 1) | Auditor Técnico |
| A2-40 | **Diseñador** | (1) Aviso «solo datos de ejemplo»: franja fija no cerrable, con buen contraste y texto claro; pantalla de aceptación al primer ingreso; repetido en importación y en «Pedir ayuda»; texto de los correos con «[PRUEBA]». (2) Pantalla **«despertando»**: página estática y aparte (la aplicación dormida no puede mostrarla), con «El sistema está despertando, tarda hasta un minuto», botón «Entrar» y recarga automática; sin datos y sin abrir CORS | D-115 | P2 | Gerente de TI |
| A2-41 | **QA** | Criterios del modo piloto (guarda en producción, franja y aceptación, chat apagado, ruta de latido sin reloj, reconstrucción) y el criterio de la primera prueba | D-115 | P2 | Auditor Técnico |
| A2-42 | **Cumplimiento** | Borrador de una página del acuerdo de prueba para el abogado (prototipo, datos de ejemplo, sin garantía, nombre y correo del que prueba con su permiso, reconstrucción y borrado, proveedores en otros países); revisa la franja | D-115 | P1 | Gerente de TI |

**Qué pasa si el CEO no entrega algo (actualizado por D-117):** sin correo de la empresa no se crean cuentas (A2-31 bloquea A2-32 y siguientes salvo la verificación); el entorno es **siempre interno** hasta el 100 %, con o sin dominio; el acuerdo de prueba y el crédito del chat ya no frenan nada hasta «antes de ofrecer» (el chat sigue apagado y «Pedir ayuda» funciona normal).

## Ola 6: construir la plataforma sin abogado y Versión local 0.1 (D-118 y D-119)

**Estado (2026-10-29):** decisiones registradas; plan escrito en `plan-etapa-1.md`. Lo legal (L-01 a L-19, L-MSF) **queda diferido** («antes de datos reales / antes de ofrecer»); no se pierde.

| # | Responsable | Qué hace | Decisión | Prio. | Verifica | Estado |
|---|---|---|---|---|---|---|
| A3-01 | **Ingeniero de Datos** | Paquete DAT-1: migraciones, seguridad por fila forzada, `conEmpresa`, `siguiente`, semilla de dos empresas | D-119 | P0 (hoy) | QA, Seguridad | Por lanzar |
| A3-02 | **Backend A y B** | Paquetes BAK-1 a BAK-3: acceso, permisos, auditoría, catálogos, categorías, SKU, inventario, (compras si alcanza) | D-119 | P0 (hoy) | QA, Auditor Técnico | Por lanzar |
| A3-03 | **Frontend** | Paquetes FRO-1 y FRO-2: pantallas del guion de la demo | D-119 | P0 (hoy) | QA | Por lanzar |
| A3-04 | **DevOps** | Paquete DEV-1: `docker-compose`, `iniciar.bat`, guía `LEEME-PROBAR.md`, arranque desde cero | D-119 | P0 (hoy) | QA | Por lanzar |
| A3-05 | **QA** | Pruebas de aislamiento, de permisos, de interruptores `legal.*` apagados, de la guarda del modo local y el guion de la demo | D-118, D-119 | P0 (hoy) | Gerente de TI | Por lanzar |
| A3-06 | **Seguridad** (modelo potente) | Revisión de aislamiento, modo local, sesión y secretos | D-119 | P0 (hoy) | Gerente de TI | Por lanzar |
| A3-07 | **Auditor Técnico y de Cumplimiento** | Revisión corta: trazabilidad; interruptores legales apagados y sin datos reales | D-118, D-119 | P0 (hoy) | Gerente de TI | Por lanzar |
| A3-08 | **Arquitecto** | Marcar los ADR usados como «Aceptado para el corte local»; nota de `prisma/` en ADR-14 | D-119 | P1 | Gerente de TI | Por pedir |
| A3-09 | **Analista** | Interruptores `legal.*` y los dos hitos en el documento funcional | D-118 | P2 | Auditor Técnico | Por pedir |
| A3-10 | **Arquitecto e Ingeniero de Datos, mide QA** | Prototipo técnico de ADR completo (H1 a H12, local con agrupador de conexiones), justo después de la demo | D-119.4 | P0 (mañana) | Seguridad | Pendiente |

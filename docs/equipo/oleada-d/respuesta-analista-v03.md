# Respuesta del Analista de Negocio · v0.3 del núcleo (Oleada D)

**Fecha:** 2026-10-25
**Entregables:** `docs/documento-funcional.md` v0.3 y `docs/registro-permisos.md` (PS-01 a PS-229).
**Base:** `docs/equipo/plan-correcciones.md` (N-01 a N-23), decisiones D-030 a D-064 y los resultados de D-057.
**Regla del Cliente (CEO) aplicada:** no se le preguntó nada de producto ni de ingeniería. Solo dinero, tema legal o irreversible va como [ESCALAR AL CEO].

## 1. Qué cambió respecto de la v0.2 (N-xx a dónde quedó)

| N | Cambio pedido | Dónde quedó en la v0.3 |
|---|---|---|
| N-01 | Registro único de permisos; matriz reescrita; un solo exportar y un solo importar; resolvedores de "propio" | `docs/registro-permisos.md` (completo); sección 7 (RF-ROL-004, 005, 014 reescritos, 7.3 como resumen por rol y las 13 celdas de D-037) |
| N-02 | Seis tipos de campo con "secreto" y marca "identificador"; naturaleza de la categoría; glosario "Activo"; la clave no es una serie | RF-CAT-012, 027, 028; RF-SKU-013, 014; glosario; CA-020, CA-042, CA-064, CA-065 |
| N-03 | Auditoría: tres tipos de autor; lista cerrada de campos personales; eventos de seguridad aparte; lecturas masivas; dos registros; archivado por partición con dos personas | Sección 16 (RF-AUD-003, 005, 010, 013 a 019); sección 18.2; CA-002, CA-041, CA-054, CA-066 |
| N-04 | Acceso: empresa en la dirección; enlace con botón atado al navegador; 5 intentos y esperas 1, 2, 5 y 15; invitaciones de texto fijo; segunda verificación por permiso sensible; reautenticación; códigos de recuperación; aviso de privacidad con reaceptación; aviso a los 25 minutos | Sección 5 (RF-ACC-006, 007, 009, 012, 013, 014, 017, 018, 023, 024, 026); CA-004 a 007, CA-049, CA-068, CA-069, CA-079, CA-081, CA-082 |
| N-05 | Plataforma: rescate con control dual y espera de 24 h, contacto autorizado, soporte con banner, llave física, acceso de emergencia, dos registros | Sección 6 (RF-PLA-001 a 010); CA-015a a d |
| N-06 | `pais`, `zona_horaria` y moneda base desde la Etapa 1; tabla de monedas; no cambiar moneda con órdenes abiertas; módulos activables | Sección 6.1 (RF-EMP-001 a 005); CA-071, CA-075 |
| N-07 | Cuenta global, membresía, Persona 1 a 1, datos personales en tabla aparte, `PRS-NNNN` | RF-ACC-011; RF-PER-001, 004; glosario; sección 18.1 |
| N-08 | Ubicación jerárquica (S-06 rechazado); área y tipo de puesto; centro de costo con responsable y código externo; proveedor ampliado; número de línea | RF-CAT-001, 006, 023 a 026, 029; RF-INV-001 |
| N-09 | Cese de Personas nunca se bloquea; pendientes; bloqueo de anonimizar; baja de usuario siempre permitida; quitar duplicado | RF-PER-005, 006, 011; RF-USR-003; RF-USR-004 **Retirado**; CA-052a a d, CA-081b |
| N-10 | RN-017 como tabla única de actos; "supera" estricto; límite 0; moneda distinta; precio faltante; edición tras aprobación; redondeo con tres ejemplos; numeración; recepción: borrador 7 días, tope 1.000, reversión | Sección 12 (RF-OC-006, 010, 014, 015 a 018, 043 a 048); sección 13 (RF-OC-031, 032, 037, 049, 050); RN-017 y su tabla; CA-030, CA-031, CA-055, CA-061, CA-062, CA-072 |
| N-11 | Tabla de 5 por 5 estados; traspaso; responsable en reparación; CHECK; cambio de ubicación; ingreso manual; corregir costo; garantía | Sección 11 (RF-INV-008, 010, 024 a 029); CA-058, CA-059, CA-060, CA-063, CA-082b |
| N-12 | Importación con D-050: marco único, huella de archivo, claves naturales, deshacer = anular, archivo no guardado, orden de dependencias, topes | Sección 15.1 (RF-IMP-001 a 018); RF-IMP-012 **Retirado**; CA-038, CA-039, CA-056 |
| N-13 | Puerta de exportación | Sección 15.2 (RF-EXP-001 a 007); CA-043, CA-067 |
| N-14 | Tabla única de retención con todos los módulos; copia del nombre en el acta como excepción declarada; anonimización manual con dos personas; solicitudes de derechos desde la Etapa 2; correos mínimos; redacción por seguridad; respaldos 30 y 12 | Sección 18 (18.1 a 18.3, RF-DAT-001 a 015); RF-PER-012 a 014; CA-054, CA-073, CA-074, CA-076 |
| N-15 | Límites y formatos; volumen único; reloj y procesos recuperables; prueba de carga desde la Etapa 4; RNF-004 medible; buscador agrupado; inicio por tarjetas; operaciones largas | Sección 19 (19.1 RNF-001 a 022; 19.2 Límites y formatos); CA-050a, CA-077 |
| N-16 | Tabla maestra con "Cuándo" por parte de módulo; olas; regla "nada fuera de la v1 antes de la Etapa 7"; preparaciones del núcleo; NOT-base = RF-ACC-021 | Sección 2.2 y sección 27 |
| N-17 | Sección de pantallas: mapa, inicio por tarjetas, "Pedir ayuda", pantallas sin dueño, ficha de 7 pestañas, 3 mensajes y 3 bloqueos, familias de color | Sección 20 (RF-UX-001 a 012); CA-050a, CA-050b, CA-080 |
| N-18 | Glosario y trazabilidad: artículo = SKU, activo, stock, Persona, Baja/Cesar/Anular/Cancelar, tabla de prefijos, `RF-PRS` para el módulo de Personas | Sección 3 y sección 26 (26.1 a 26.3) |
| N-19 | Dividir CA-052, CA-011, CA-015, CA-050; agregar borde exacto, archivo ya importado, portal con dos Personas, reglas de D-060; completar el resumen de trazabilidad | Sección 22: CA-011a/b, CA-015a a d, CA-050a/b, CA-052a a d; nuevos CA-055 a CA-082b |
| N-20 | Supuestos según D-057; pendientes con etapa que bloquea; abogado y contabilidad | Sección 24 (S-01 a S-31 resueltos); sección 23 (P-001 a P-016) |
| N-21 | Escalado al Cliente (CEO) como en `decisiones.md` | Sección 25 |
| N-22 | Orden de servicio con costo real, moneda, proveedor, centro de costo, "cubierta por garantía"; "solicitud de trabajo" | Sección 14 (RF-OS-001, 008, 010, 011) |
| N-23 | Correos de la v1: invitación, acceso y aprobación | RF-ACC-021; RF-DAT-012; CA-074 |

## 2. Qué más se tocó

- **Registro de permisos creado primero y comunicado a los seis escuadrones.** Hay 229 filas (PS-84, PS-85 y PS-196 retirados). Los escuadrones piden filas por el mecanismo de la sección 14 del registro; durante este trabajo se agregaron PS-220 a PS-229 y se aclararon PS-151, PS-165, PS-205 y PS-207.
- **Pedidos de módulos al núcleo atendidos:** prefijos `PPT-`, `MPR-`, `GMA-`, `LSAP-`, `PRG-` reservados; número de versión de la orden de compra (RF-OC-044, **S-32 abierto**); la unificación del contrato de licencia en el contrato de proveedor (PS-76 y PS-78); la Persona ve el estado de su propio pedido de datos por el portal.
- **Nombres de permisos:** formato único `modulo.accion`; donde un escuadrón ya había usado un nombre distinto del mío y el cambio era solo de forma, adopté el suyo para no obligarlos a rehacer (`presupuesto.gasto_registrar`, `tableros.ver_jefatura`, `cambios.pedir`, `cmdb.dar_de_baja`).
- **Retirados con fecha:** RF-USR-004, RF-IMP-012, RS-22 y RS-24 (reemplazado), PS-84, PS-85 y PS-196.

## 3. Lo que queda sin resolver

| Qué | Por qué queda abierto | Quién lo cierra |
|---|---|---|
| **S-32** número de versión de la orden de compra | Lo piden presupuesto e integraciones; no lo cubre ninguna decisión | Gerente de TI |
| **PS-175** `cambios.cerrar` con Jefatura TI y condición "No" (quien implementó no lo cierra) | Cambia una celda que propuse yo; lo pide el escuadrón E | Gerente de TI |
| **Unificación PS-84/PS-85 en PS-76/PS-78** (un contrato de licencia es un contrato de proveedor) | Lo decidí aplicando D-044.4; el escuadrón B debe migrar | Gerente de TI (confirmar) y escuadrón B |
| **Valores de "Límites y formatos"** (sección 19.2) | D-057 S-08 dice que los fija el Gerente de TI al revisar | Gerente de TI (P-013) |
| **Celdas de la matriz** de los módulos de Fase 2 y 3 | Son una propuesta mía; cada escuadrón confirma las suyas; la revisión del Auditor Técnico detecta las contradichas | Escuadrones y Auditor Técnico (P-005) |
| **Nombres exactos** de los 8 grupos de menú, las 7 pestañas de la ficha del activo y las 7 familias de color | Los define el Diseñador en el prototipo | Diseñador (P-014) |
| **Plazo del registro de envíos** de Notificaciones y de los eventos de seguridad (12 meses propuesto) | Dependen de la confirmación de legal | Legal, a través del Cliente (CEO) (P-011) |
| **Opinión legal** (L-01 a L-16, prioridad A) | No es parte de la puerta de la Etapa 0; es condición para datos reales y producción | Cliente (CEO) consigue al abogado |
| **Insumos del Cliente (CEO):** orden de compra, orden de servicio y Excel reales anonimizados; volumen; país y formato de número; cuentas y suplente de alertas; SAP | Solo él los tiene | Cliente (CEO) (P-002, P-003, P-004, P-015, P-016) |
| **Compatibilidad de los 17 módulos con el núcleo** | Los corrigen sus escuadrones según el plan; lo verifica el Auditor Técnico | Escuadrones, Auditor Técnico, QA, Seguridad, Cumplimiento |

## 4. Autocrítica de esta versión

- El documento creció mucho (27 secciones, 82 criterios de aceptación). Si el Cliente (CEO) lo va a leer, hace falta un resumen de una página; sugiero que lo redacte la Jefatura de Proyecto con la hoja `docs/equipo/hoja-ceo.md`.
- No creé `docs/trazabilidad.md` ni `docs/calidad/`: la sección 26 hace de matriz y queda para QA y el Auditor Técnico.
- Mantuve un nombre de permiso distinto de otro en dos casos de módulos de Fase 2 y 3 solo cuando el escuadrón lo pidió; el catálogo del código lo fija el Arquitecto.
- Varios CA son largos; QA decidirá cuáles se parten en pruebas.
- Cada tabla de requisitos del documento trae etapa y criterio de aceptación, pero el resumen por módulo de la sección 26.1 es de rangos: un requisito concreto sin criterio sería un hallazgo del Auditor Técnico, no de esta nota.

## 5. Qué espero ahora de la mesa

- **Gerente de TI:** confirmar S-32, PS-175, la unificación de contratos, y los valores de la sección 19.2.
- **QA:** revisar los 82 criterios y marcar cuáles no se pueden probar tal como están; generar la matriz de pruebas desde el registro.
- **Seguridad:** revisar las secciones 5, 6, 16, 17 y el control de cada permiso sensible (columna Controles del registro).
- **Auditor de Cumplimiento:** revisar la sección 18 (tabla única de retención) y los escalados legales de la sección 25.
- **Auditor Técnico:** revisar IDs, prefijos, que cada requisito tenga "Cuándo" y criterio, y los 17 módulos contra el registro.

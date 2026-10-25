# Revisión cruzada · Diseñador UX/UI

**Mesa de revisión #001 · Oleada C (ronda 2)**
**Fecha:** 2026-10-25
**Qué revisé:** el documento funcional v0.2, las decisiones D-001 a D-029 y los 17 módulos de `docs/modulos/`. Leí todo, completo.
**Enfoque:** que la plataforma se sienta como un solo producto, y no como 17 programas pegados.

**Cómo leer esta revisión**
- **HECHO** = se puede comprobar en un archivo. **OPINIÓN** = juicio de diseño.
- Gravedad: **crítica** (hay que resolverlo antes de dibujar o construir), **alta**, **media**, **baja**.
- Ningún hallazgo necesita al CEO. Lo que dice la sección 24 del documento funcional (dinero, legal, irreversible) sigue igual. Todo lo de abajo lo decide el Gerente de TI.

---

## 0. Resumen

1. Cada módulo está bien escrito por separado. Juntos hay **demasiadas pantallas** (179 pantallas "necesarias" en los módulos, más unas 40 del núcleo) y **demasiadas formas de hacer lo mismo**: 7 asistentes de importación, 5 pantallas de "por vencer", 7 flujos de "una segunda persona debe aprobar" con 5 verbos distintos, 9 pantallas "Mis...".
2. **Los permisos se contradicen** entre el núcleo y los módulos (hallazgo H-UX-03). Sin resolverlo no se puede dibujar la pantalla de Roles.
3. **Hay dos puertas para pedir ayuda** (orden de servicio o caso). El Analista ya lo cerró durante esta ronda con el supuesto S-31 (un botón "Pedir ayuda"). Falta que el Gerente de TI lo confirme.
4. No existe aún un sistema de colores de estado, un vocabulario único de "baja / anular / cancelar", ni reglas de mensajes. Propongo todo en la sección 4.
5. Entrego: el mapa de navegación (sección 2), la lista final de pantallas del prototipo (sección 3: 26 de prioridad A y 18 de prioridad B) y las decisiones del sistema de diseño (sección 4).

**Veredicto:** ver sección 5. Resumen: documento funcional v0.2 (núcleo) **conforme con observaciones**; los 17 módulos como conjunto **no conformes todavía**, con salida corta (5 condiciones).

---

## 1. Hallazgos

| ID | Gravedad | Dónde | Hecho u opinión | Qué cambiar | Quién |
|---|---|---|---|---|---|
| H-UX-01 | crítica (cerrado en principio) | `documento-funcional.md` §3 "Solicitud", RF-OS-001; `mesa-de-ayuda.md` §2 y RF-AYU-023/041; `portal-autoservicio.md` RF-POR-007 a 010, S-POR-03; `garantias-mantenimiento.md` S-GAR-10 | **Hecho:** el Solicitante tenía dos caminos para pedir lo mismo: crear una orden de servicio (núcleo) o abrir un caso (mesa de ayuda y portal). "Solicitud de servicio" significaba dos cosas. | Un solo botón **"Pedir ayuda"** en la barra superior. En la v1 crea la orden de servicio en estado Creada; en la fase 2 abre el catálogo de casos. **Ya adoptado como S-31 en el documento v0.2 durante esta ronda.** Falta: que el Gerente de TI lo confirme, y que `mesa-de-ayuda` y `portal` usen la misma frase en su glosario. | analista-funcional (alinear módulos); gerente-ti (confirmar) |
| H-UX-02 | crítica | Núcleo §5 a 7 y S-27; los 17 módulos; `portal-autoservicio.md` S-POR-02; `RF-PLA-006` | **Hecho:** hay 4 tipos de entrada (consola de plataforma, aplicación del operador, Solicitante, portal del empleado), unas 27 áreas de menú y ningún documento define el menú. **Opinión:** sin un mapa, cada módulo se pegará donde pueda y nadie encontrará nada. | Aplicar el mapa de la **sección 2**: 8 grupos de menú, 8 perfiles, un módulo apagado o sin permiso **no aparece**. El portal del empleado tiene una estructura propia y muy simple (misma plataforma, otra pantalla). La consola de plataforma tiene otro color de encabezado para que nadie la confunda. | disenador-ux propone; gerente-ti aprueba; arquitecto-software confirma S-POR-02 |
| H-UX-03 | crítica | Núcleo §7.3 frente a: `proveedores-contratos.md` §3; `licencias-software.md` §3 y SUP-LIC-10; `entregas-devoluciones.md` §3; `personas-ubicaciones.md` §3; `lineas-moviles.md`, `dominios-certificados.md` §3 | **Hecho:** siete contradicciones entre la matriz del núcleo y los módulos. (a) **Proveedores:** núcleo = solo Administrador (S-22); PRV = también Jefatura TI crea, edita y desactiva. (b) **Clave de licencia completa:** núcleo = solo Administrador; LIC = Administrador y Técnico. (c) **Entregar y devolver:** núcleo = Administrador y Técnico; ENT = también Almacén. Registrar extravío o baja: núcleo = sin Jefatura TI; ENT = con Jefatura TI. (d) **Datos personales:** núcleo = Almacén no; PER y ENT = Almacén sí. Solicitante: núcleo no; módulos "Propio". (e) **Desactivar o cesar personas:** núcleo = Administrador y Técnico; PER = Administrador y Jefatura TI (el Técnico no). (f) **Exportar:** núcleo = solo Administrador; LIC, LIN y DOM = también Jefatura TI. (g) **Centros de costo:** núcleo = Administrador y Técnico crean; PER = solo Administrador. | Decidir una regla: **manda la matriz del núcleo (§7.3)** y cada módulo la amplía con filas "pedidas" que el Gerente de TI aprueba una por una (P-005). Cada módulo reescribe su tabla con el resultado. Mientras tanto, el prototipo usa la matriz del núcleo y marca con "†" lo discutido. | analista-funcional; gerente-ti decide |
| H-UX-04 | alta | Todas las tablas de permisos; `RF-ROL-014` | **Hecho:** el núcleo tiene 42 filas de permiso y los módulos suman unas 225 más (cuenta mía sobre sus tablas; algunas filas juntan dos permisos). El mismo permiso sensible se escribe de **tres formas**: `datos_personales.ver` (PER, ENT, CMD), `datos-personales.ver` (LIC, LIN, DOM) y `personas.ver_datos` (REP, INT). Hay estilos mezclados: `licencias.ver-clave`, `entregas.marcar_conformidad`. **Opinión:** una matriz plana de 270 filas por 8 roles es inusable. | La pantalla de Roles agrupa por módulo en secciones plegables; filtros "solo sensibles" y "solo lo que cambió frente a la plantilla"; vista previa "qué puede hacer esta persona"; cada permiso con su nombre en español ("Ver datos personales") y el identificador técnico escondido. El arquitecto **ya confirmó** (mensaje de hoy) un solo identificador `datos_personales.ver` y que cada permiso llevará módulo, acción, marca sensible y alcance. Falta que los módulos adopten el nombre. | arquitecto-software (catálogo único); analista-funcional (renombrar en módulos); disenador-ux (pantalla) |
| H-UX-05 | alta | `RNF-008` y D-021.6; `gestion-cambios.md` pantalla 4; `proveedores-contratos.md` P-PRV-10; `garantias-mantenimiento.md` P-GAR-09; `reportes-tableros.md` RF-REP-001/002; `gestion-problemas.md` §8; `mesa-de-ayuda.md` AYU-05 y AYU-07 | **Hecho:** seis documentos reclaman "la pantalla de inicio de Jefatura". Para el Técnico, "Mi trabajo" aparece como AYU-05, "Mi trabajo de cambios" (CAM pantalla 7), "Mis tareas" (ONB) y el tablero de Técnico (REP). **Opinión:** se pelearán por el mismo espacio y el Técnico tendrá cuatro bandejas. | El **Inicio** es una página de tarjetas que cada módulo aporta (cifra + lista corta + "Ver todo"). Cada rol tiene **una tarjeta principal** y máximo 6 visibles. El Técnico tiene una sola bandeja **"Mi trabajo"** con pestañas por tipo (órdenes, casos, cambios, tareas, mantenimientos). Los "tableros" de REP son el mismo Inicio ampliado; no son otra pantalla. | analista-funcional (RNF-008); disenador-ux |
| H-UX-06 | alta | Núcleo §12.2; `licencias-software.md` RN-LIC-016; `proveedores-contratos.md` RN-PRV-015/016 y P-PRV-08; `gestion-cambios.md` pantalla 4/5; `presupuesto-costos.md` §5; `mesa-de-ayuda.md` AYU-08; `gestion-problemas.md` RN-PRB-009 | **Hecho:** siete flujos con la misma idea ("lo que preparó una persona lo aprueba otra") y cinco verbos distintos: **Aprobar** (OC, cambios, presupuesto, solicitudes de ayuda), **Confirmar** (contrato de licencia), **Activar** (contrato de proveedor), **Publicar** (error conocido), **Reaprobar** (plantilla). Cuatro bandejas distintas. **Opinión:** el Jefe tendrá que aprender siete pantallas para hacer una sola cosa. | Una bandeja **"Por aprobar"** con pestañas y contador por tipo; un mismo bloque de decisión (resumen, riesgo o monto, motivo si rechaza, botones Aprobar y Rechazar); un mismo aviso cuando la persona no puede decidir ("Usted lo preparó: debe decidirlo otra persona", botón desactivado con la razón escrita); la excepción de empresa de una sola persona con un aviso permanente. **Verbo único: Aprobar.** "Publicar" queda solo para textos (artículo, error conocido). | analista-funcional (nombres); disenador-ux |
| H-UX-07 | alta | Glosario §3 "Baja"; RF-PER-005/006; D-006; `personas-ubicaciones.md` §5; `licencias-software.md` §5; `proveedores-contratos.md` §5; todos los módulos | **Hecho:** "baja" se usa para Usuario (Dado de baja), Persona (D-006 "dar de baja"; el núcleo "desactivar"; PER "Cesada"), Activo (De baja), Línea y Dominio (Dada de baja). "Anulada" (OC, acta, garantía, presupuesto, contrato PRV) frente a "Cancelada" (OS, caso, cambio, mantenimiento, proceso ONB, contrato LIC) frente a "Terminado" (PRV) y "Retirado" (CMDB). El contrato de licencia dice **"Por iniciar"** y el de proveedor **"Programado"** para lo mismo; LIC tiene el estado "Renovado", PRV renueva dentro del mismo registro. | Vocabulario único de la **sección 4.4**. Alinear LIC y PRV: los dos contratos usan Borrador, Programado, Vigente, Vencido, Terminado, Anulado. | analista-funcional; gerente-ti aprueba |
| H-UX-08 | alta | `RNF-004`, D-021; los 17 módulos | **Hecho:** sumando las tablas de estados hay unos 200 estados (aproximado), muchos con la misma palabra repetida. Los documentos piden "texto, no solo color" pero **ninguno define colores**. Además se mezclan dos cosas: estados guardados (Aprobada) y etiquetas calculadas (Por vencer, Atrasado, En riesgo). | **7 familias de color** con icono y texto, y una regla visual distinta para las etiquetas calculadas (sección 4.1). Contraste verificado: texto sobre fondo de la etiqueta entre 6,1 y 9,3 en claro y oscuro (mínimo exigido 4,5). Cada analista, al definir un estado, anota su familia. | disenador-ux (tabla); analistas (asignar familia) |
| H-UX-09 | alta | `licencias-software.md` CA-LIC-06; `lineas-moviles.md` CA-LIN-07; `dominios-certificados.md` CA-DOM-07; `gestion-cambios.md` CA-CAM-03; `portal-autoservicio.md` RN-POR-002; `mesa-de-ayuda.md` CA-AYU-11; `presupuesto-costos.md` CA-PRE-11; `reportes-tableros.md` RN-REP-003; `personas-ubicaciones.md` §3; `cmdb-ligera.md` CA-CMD-09 | **Hecho:** mensajes de bloqueo distintos: "Sin permiso", "No tiene permiso...", "acceso denegado", "se deniega" y "no encontrado". El portal prohíbe decir "no tienes permiso"; LIC y LIN lo dicen. Para datos ocultos hay cuatro formas: columna omitida (REP), "P-0042" (PER, ENT), máscara (LIC), "12 personas" (CMD). | **Catálogo de 3 mensajes y 3 bloqueos** (sección 4.5). Regla confirmada por el Especialista en Seguridad hoy: "No encontrado" para otra empresa, inexistente y objetos de la misma empresa fuera del alcance "propio"; "No tiene permiso" solo si la persona ya ve el objeto o la pantalla y le falta el permiso de la acción. Tres formas únicas de dato oculto (sección 4.5). | disenador-ux; especialista-seguridad; analistas |
| H-UX-10 | alta | Núcleo §13 y §15; `personas-ubicaciones.md` RF-PER-014; `licencias-software.md` RF-LIC-006/015; `lineas-moviles.md` RF-LIN-013; `dominios-certificados.md` RF-DOM-013; `cmdb-ligera.md` RF-CMD-019; `integraciones-api.md` RF-INT-017; `portal-autoservicio.md` RF-POR-013 y RNF-POR-004; `entregas-devoluciones.md` RF-ENT-001 | **Hecho:** la misma mecánica (tabla con error por fila, todo o nada, descargar errores, deshacer lote) se repite en recepción, **7 importaciones**, asignar puestos masivos, invitaciones masivas y entrega de varios equipos. Contradicción: el portal dice que de 200 invitaciones "cada fallo de envío se informa" (parcial), mientras el resto es "todo o nada". LIC introduce un campo "secreto" que habría que teclear en esa misma tabla. | **Un solo componente** "Tabla de captura con validación por fila" y **un solo asistente "Importar datos"** con selector de tipo (Activos, Stock, Personas, Contratos de licencia, Líneas, Dominios, Servicios y relaciones, Maestros de SAP) y un historial de lotes con "Deshacer". Decidir: las invitaciones masivas, ¿todo o nada o por persona? Recomiendo por persona, porque un correo mal escrito no debe frenar a 199, y decirlo en pantalla. | analista-funcional; gerente-ti (invitaciones) |
| H-UX-11 | alta | LIC "Panel de licencias"; DOM "Panel Por vencer"; `proveedores-contratos.md` P-PRV-10; `garantias-mantenimiento.md` P-GAR-02/07; `reportes-tableros.md` "Calendario de vencimientos"; configuraciones de avisos de LIC, LIN, DOM, PRV (P-PRV-09), GAR (P-GAR-10) frente a `notificaciones.md` NOT-05; pantallas "Mis..." de LIC, LIN, DOM, POR, AYU-02, ONB | **Hecho:** pantallas repetidas. (a) "Por vencer": 5. (b) Configuración de avisos: 5 módulos más NOT-05, que ya existe para esto. (c) "Mis...": al menos 9. (d) Importación: 7 (H-UX-10). (e) Aprobaciones: 7 (H-UX-06). | Una sola pantalla **"Vencimientos"** (lista y calendario, filtro por tipo). La configuración de avisos vive solo en Notificaciones (NOT-05) y cada módulo enlaza. **"Mi espacio"** con pestañas (equipos, líneas, licencias, actas, casos, tareas, dominios a mi cargo): es la página principal del portal del empleado y un acceso del menú de usuario para los demás. Ahorro estimado: unas 25 de las 179 pantallas (**opinión**). | analista-funcional (sacar duplicados); disenador-ux |
| H-UX-12 | alta | 17 módulos §7 "Pantallas necesarias" | **Hecho:** 179 pantallas en módulos: AYU 17, POR 12, DOM 12, INT 12, PRE 12, CAM 11, LIC 11, LIN 11, ENT 10, GAR 10, PER 10, PRV 10, REP 10, CMD 9, NOT 8, PRB 8, ONB 6. El núcleo suma unas 40 más. **Opinión:** no se puede prototipar todo ni el CEO puede revisar más de 200 pantallas. | Prototipo de la Etapa 0 en dos niveles (sección 3): **26 pantallas A** del núcleo, que el CEO debe ver para aprobar, y **18 B**, entre ellas 8 muestras de módulos futuros. El resto se garantiza con los 8 patrones del sistema de diseño (lista, ficha, formulario, asistente, bandeja, tarjeta de cifra, configuración, línea de tiempo). Decisión del Gerente de TI: que las fases 2 y 3 se presenten al CEO como muestras. | gerente-ti; Jefatura de Proyecto |
| H-UX-13 | alta | `entregas-devoluciones.md` (historial); `mesa-de-ayuda.md` AYU-17; `garantias-mantenimiento.md` P-GAR-01/08; `proveedores-contratos.md` RF-PRV-019; `cmdb-ligera.md` RF-CMD-013; `lineas-moviles.md`; `licencias-software.md`; `presupuesto-costos.md`; núcleo §11 | **Hecho:** 8 módulos piden su propia pestaña en la ficha del activo (entregas, casos, garantías, mantenimiento, contratos cubiertos, relaciones, línea, licencias por equipo, costos, órdenes de servicio) además de las del núcleo. **Opinión:** 11 o 12 pestañas no caben en un celular y nadie las encuentra. | Cabecera fija (serie, estado, responsable, ubicación, chip de garantía, avisos) y **7 pestañas**: Resumen · Entregas y actas · Servicio (órdenes, casos, mantenimiento, reclamos) · Garantía y contratos · Relaciones (mapa de servicios, cambios, línea, licencias) · Costos (solo con permiso de precios) · Historial. Una pestaña solo aparece si el módulo está activo y la persona tiene permiso, y trae un contador. En celular se vuelven secciones plegables. La ficha de la Persona sigue el mismo criterio. | disenador-ux; analistas aceptan |
| H-UX-14 | media | Núcleo RF-INV-013 a 016 frente a `entregas-devoluciones.md` RF-ENT-001; RN-ENT-011; `garantias-mantenimiento.md` RF-GAR-022/023, RN-GAR-014; `personas-ubicaciones.md` §3 | **Hecho:** dos caminos para entregar (el "asignar" del núcleo y el asistente de ENT con condición, accesorios, préstamo y varios equipos). El estado del activo se cambia desde la ficha, la devolución, el mantenimiento, el reclamo y el extravío. Almacén puede entregar (ENT) pero **no puede crear una Persona** (PER: solo Administrador y Técnico): se queda trabado si el receptor no está en el directorio. | Un **solo asistente "Entregar"** (el botón de la ficha lo abre con el equipo ya cargado) y un **solo diálogo "Cambiar estado"** que ofrece solo las transiciones permitidas por D-012 y pide motivo cuando toca; ENT, GAR y OS lo reutilizan. **Alta rápida de Persona** (nombre y área) dentro del asistente; decidir si Almacén puede hacerla. | analista-funcional; gerente-ti (permiso de Almacén) |
| H-UX-15 | media | RN-008 (núcleo); motivos en LIN RN-LIN-011, DOM SUP-DOM-09, LIC, AYU RF-AYU-014, CAM, GAR, PRV | **Hecho:** más de 25 acciones piden motivo en 12 módulos. Unas usan lista cerrada más "Otro", otras texto libre. **Opinión:** sin un diálogo único, cada pantalla lo hará distinto. | **Diálogo de motivo único** (sección 4.2): título con el verbo ("Dar de baja la línea"), 1 a 3 líneas con las consecuencias, lista de motivos del módulo (opcional) y texto (obligatorio si elige "Otro"; contador hasta 500), botón con el mismo verbo, estilo de advertencia si es irreversible. Escribir el código para confirmar solo en lo irreversible de alto impacto (anonimizar, deshacer un lote). | disenador-ux |
| H-UX-16 | media | Todos los módulos (códigos); núcleo RF-OC-003, RF-OS-005; `presupuesto-costos.md` y `integraciones-api.md` ("OC-0042") | **Hecho:** códigos con 4 dígitos (LAP-0001, CTR-0001, CAM-0001, PRB-0001, MNT-0001, REC-0001, KB-0001), 5 (EC-00001) y 6 (AYU-000123, E-000001, D-000001, CLI-000123). El núcleo no define el formato de la OC ni de la OS, pero PRE e INT ya escriben "OC-0042". **Prefijos que confunden:** REC = reclamo (y la recepción no tiene código); EC- de la CMDB frente a E- de actas; "CLI" parece "cliente". | **Tabla única de prefijos** en el sistema de diseño, ancho mínimo uniforme (es un mínimo, RF-SKU-003), botón "copiar" junto a cada código y búsqueda por código exacto en el buscador global. Cambios sugeridos: REC (reclamo) pasa a RCL; la recepción de mercadería recibe RCP; CLI pasa a LICC. | analista-funcional (tabla); arquitecto-software (contadores); gerente-ti |
| H-UX-17 | media | Ejemplos de PRE (CA-PRE-03: "1 200,00"), LIN (59,90), núcleo S-17 ("5.000"), REP (CA-REP-02: "2026-11-24") frente a RNF-002 y LIC ("30/11/2026"); P-004 | **Hecho:** tres convenciones de número y dos de fecha en los ejemplos. P-004 (país) no está respondido. | Formato de número, moneda y fecha **por empresa** (según país). Mientras no se sepa: fecha día/mes/año, miles con punto, decimales con coma. Siempre el código de moneda junto al importe y nunca un "total general" entre monedas. Corregir los ejemplos de los documentos. No requiere al CEO: P-004 ya es un insumo pedido. | analista-funcional; gerente-ti |
| H-UX-18 | media | `RNF-003`; `RNF-ENT-006`, `RNF-GAR-006`, `RNF-CAM-008`, `RNF-POR-002` y otros | **Hecho:** el núcleo exige celular solo en 2 pantallas (recepción y búsqueda de activos), pero casi todos los módulos piden 360 px. Algunas pantallas son anchas por naturaleza: matriz de permisos, editor de presupuesto (centro × rubro), vista previa de importación, calendarios, árboles. | Lista **"campo / oficina"**: en celular se hace buscar, ver ficha, entregar y devolver, recibir y capturar series, aprobar, mantenimiento y casos propios. Roles, presupuesto, importación y configuración **se pueden ver en celular pero se editan en pantalla grande** (aviso claro). En celular las tablas pasan a tarjetas de 3 datos más el estado. | gerente-ti aprueba; qa-tester prueba a 360 px |
| H-UX-19 | media | `RF-ACC-014`; `RNF-LIC-007`; calendarios de CAM, GAR, REP; REP RF-REP-019; PER (organigrama); CMD (árbol) | **Hecho:** la sesión vence a los 30 minutos sin aviso previo, y una recepción de 100 series o una OC larga puede tardar más. La clave se oculta sola a los 30 s. Calendarios (CAM sin vista de lista), gráfico de evolución, organigrama y árbol no dicen cómo se usan sin ratón ni sin ver. | Aviso a los 25 minutos ("Su sesión termina en 5 minutos. Seguir conectado") y **borradores automáticos** en recepción, OC, entrega e importación. La clave avisa antes de ocultarse y deja extender. Toda vista gráfica o de árbol trae su lista equivalente. Diálogos que atrapan y devuelven el foco. Objetivos táctiles de 44 px. Errores con resumen arriba y enlace a cada campo. Anuncios para lector de pantalla en validaciones ("repetida en la fila 12"). | disenador-ux; desarrollador-frontend; qa-tester |
| H-UX-20 | media | RF-ACC-012/013/015/023; RF-PLA-002 a 005; LIC SUP-LIC-13, LIN SUP-LIN-01, DOM SUP-DOM-12 | **Hecho:** nadie listó estas pantallas. (1) **Primeros pasos** de una empresa nueva. (2) **Módulos activos** de la empresa (tres módulos dicen "activable por empresa" y no hay dónde). (3) **Mi cuenta y seguridad** ("cerrar sesión en todos", segunda verificación). (4) **Autorizar soporte por 24 h**, con aviso permanente para quien lo usa. (5) **Cambio de empresa** y aviso de contexto. (6) **Primer ingreso:** aviso de privacidad y segunda verificación. (7) **Consola de plataforma.** (8) **Mis permisos** (qué puedo hacer y a quién pedirlo). | Agregarlas al documento (sección de pantallas) y al prototipo (sección 3). La empresa activa se ve siempre en la barra superior; al cambiar se avisa "Ahora trabaja en: [Empresa]" y se recarga todo. | analista-funcional |
| H-UX-21 | media | `RNF-007`; `lineas-moviles.md` RF-LIN-014; `mesa-de-ayuda.md`; `cmdb-ligera.md` | **Hecho:** el buscador global cubre 4 tipos (SKU, serie, activo, orden); los módulos esperan buscar también personas, casos, artículos de ayuda, contratos, líneas (número e IMEI), dominios, cambios, problemas y elementos del mapa de servicios. | Resultados **agrupados por tipo** con contador y filtro por tipo; solo tipos permitidos; un código exacto ("OC-0042") va directo a la ficha; cada módulo registra sus tipos al activarse; sin permiso de datos personales el resultado muestra "P-0042". | analista-funcional (ampliar RNF-007); arquitecto-software |
| H-UX-22 | media | `RF-CAT-012`; `licencias-software.md` SUP-LIC-03; `lineas-moviles.md` SUP-LIN-02 | **Hecho:** el núcleo admite 5 tipos de campo; LIC necesita un 6.º ("secreto") y LIN dice que, si el módulo está activo, la categoría Celulares ya no usa el campo "número de línea". **Opinión:** la pantalla de categorías cambiaría según lo que esté activado. | Agregar el tipo **Secreto** (entrada enmascarada, revelado controlado). El arquitecto lo propuso hoy para la Etapa 2, enmascarado por defecto. Los campos que gestiona un módulo se muestran de solo lectura con la etiqueta "Lo gestiona el módulo Líneas móviles". | analista-funcional (RF-CAT-012); arquitecto-software; especialista-seguridad |
| H-UX-23 | media | `notificaciones.md` NOT-S02 y NOT-01 | **Hecho:** en la v1 solo hay correo; la campana y la bandeja son de la fase 2. El aprobador de la v1 se entera solo por correo. | En la v1: reservar el lugar de la campana (oculta), mostrar "Por aprobar" y "Pendientes" en el Inicio, y mantener el nombre de la empresa en el asunto de cada correo (NOT ya lo prevé). | analista-funcional; desarrollador-frontend |
| H-UX-24 | media | Glosarios de AYU, CAM, POR, ONB; tono en POR, ONB, ENT frente a AYU, CAM, LIN | **Hecho:** "Solicitante" tiene 5 sentidos (rol; Persona del caso; usuario del cambio; empleado del portal; quien pide en ONB). El tono mezcla "tú" ("Tu cuenta...", "Tienes la tarea...") y "usted" ("Recibimos su caso", "Su cambio"). "Activo" es la unidad física y también un estado (Usuario, SKU, línea, dominio). | Campo **"Pedido por"** para quien pide en OC, OS, caso y cambio; "Solicitante" queda solo como nombre de rol. Tono **"usted"** en toda la plataforma, portal y correos incluidos, salvo que el Gerente de TI decida otro. Las columnas de estado de registro se llaman "Estado del registro" (Activo / Inactivo) y la lista de activos usa "Estado del activo". | gerente-ti (tono); analistas |
| H-UX-25 | baja | Varios (agrupados) | **Hecho (a)** IDs repetidos: RF-PER-001 a 010 del núcleo y RF-PER-001 a 017 del módulo significan cosas distintas; "P-" sirve para pendientes (P-001), pantallas (P-PRV-01) y referencia de Persona (P-0042). **(b)** Páginas de 50 filas (CMD) frente a 100 (REP). **(c)** Exportar: "no se muestra" (CA-REP-05) frente a "visible" (RNF-006). **(d)** Persona anonimizada: estado "Anonimizada" pero etiqueta "Persona dada de baja 0042". **(e)** Fechas ISO en REP. **(f)** Pantallas de CAM, PRB y CMD sin ID ("#1, #2"). **(g)** El género de los estados cambia con el sustantivo (Aprobada/Aprobado): debe resolverse en la tabla de textos. | (a) Renumerar, ya avisado al auditor técnico. (b) 50 por defecto con selector 25/50/100. (c) **Exportar se muestra desactivado con la razón** ("Requiere el permiso Exportar; pídalo a un administrador"), porque RNF-006 lo quiere visible. (d) Etiqueta única "Persona anonimizada 0042". (e) Siempre d/m/a. (f) ID de pantalla "SIGLA-nn" para todos. (g) Tabla de textos por entidad. | analistas; auditor-codigo |

---

## 2. Mapa de navegación por rol

### 2.1 La pantalla, igual para todos
- **Barra superior (siempre visible):** nombre de la **empresa activa** (con selector si la persona tiene más de una) · buscador global · botón **"+ Nuevo"** (acciones rápidas según el rol) · botón **"Pedir ayuda"** · campana (reservada para la fase 2) · menú de la persona (Mi espacio, Mi cuenta y seguridad, Cambiar de empresa, Cerrar sesión).
- **Menú lateral** con 8 grupos, plegable. En celular: barra inferior con **Inicio · Buscar · + Nuevo · Menú**.
- **Regla de aparición:** un módulo apagado en la empresa no aparece. Un módulo sin permiso no aparece. Una pantalla que solo se consulta se marca "solo consulta".
- **Tres tipos de entrada:** (1) aplicación del operador (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, Solo lectura); (2) **portal del empleado** (rol "Empleado (portal)", pantalla mucho más simple, sin menú lateral: 6 botones grandes); (3) **consola de la plataforma** (Administrador de plataforma, otro color de encabezado y la leyenda "Consola de plataforma"; no ve datos del negocio).

### 2.2 Qué ve cada perfil

Leyenda: **●** entrada principal · **○** acceso completo según sus permisos · **◐** solo lo propio · **▫** solo consulta o resumen · **–** no aparece · **†** el núcleo y el módulo no coinciden (H-UX-03; aquí se aplica el núcleo).
Perfiles: **PL** Administrador de plataforma · **AD** Administrador · **JT** Jefatura TI · **TE** Técnico · **AL** Almacén · **SO** Solicitante · **SL** Solo lectura · **EM** Empleado (portal).
"Cuándo": etapa del núcleo (E1 a E7) o fase 2 (F2) / fase 3 (F3).

| Grupo y pantalla | Cuándo | PL | AD | JT | TE | AL | SO | SL | EM |
|---|---|---|---|---|---|---|---|---|---|
| **Inicio** (distinto por rol) | E1 | ● Consola | ● Resumen | ● Por aprobar | ● Mi trabajo | ● Por recibir | ● Mis solicitudes | ● Buscador | ● Portal |
| **Inventario** · Activos (lista y ficha) | E4 | – | ○ | ○ | ○ | ○ | ◐ | ○ | ◐ |
| Inventario · Stock por cantidad | E4 | – | ○ | ○ | ○ | ○ | – | ▫ | – |
| Inventario · Artículos (SKU) | E3 | – | ○ | ○ | ○ | ▫ | ▫ | ▫ | – |
| Inventario · Entregas y devoluciones (actas) | E4 | – | ○ | ▫ | ● | ○ † | ◐ | ▫ | ◐ |
| Inventario · Importar datos | E4 | – | ○ | – | – | – | – | – | – |
| **Compras** · Órdenes de compra | E5 | – | ○ | ○ | ○ | ▫ sin precios | ◐ | ▫ | – |
| Compras · Recepciones | E5 | – | ○ | ▫ revertir | – | ● | – | – | – |
| Compras · Proveedores | E2 | – | ○ | ○ † | ▫ | ▫ | ▫ | ▫ | – |
| Compras · Presupuesto | F3 | – | ○ | ○ | – | – | – | – | – |
| **Servicios** · Pedir ayuda y mis solicitudes | E6 | – | ○ | ○ | ○ | – | ● | – | ● |
| Servicios · Órdenes de servicio | E6 | – | ○ | ○ | ● | – | ◐ | ▫ | – |
| Servicios · Mesa de ayuda (casos y colas) | F2 | – | ○ | ○ | ○ | ◐ | ◐ | ▫ | ◐ |
| Servicios · Base de conocimiento | F2 | – | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| Servicios · Mantenimiento y garantías | F2 | – | ○ | ○ | ○ | ▫ | – | ▫ | – |
| Servicios · Cambios | F3 | – | ○ | ○ | ○ | ▫ calendario | ▫ calendario | ▫ | – |
| Servicios · Problemas | F3 | – | ○ | ○ | ○ | – | – | ▫ | – |
| **Vencimientos y contratos** · Vencimientos (calendario único) | F2 | – | ○ | ● | ○ | – | – | ▫ | – |
| Contratos y SLA de proveedores | F2 | – | ○ | ○ | ▫ | – | – | ▫ | – |
| Licencias de software | F2 | – | ○ | ○ | ○ | – | ◐ | ▫ | ◐ |
| Líneas móviles | F2 | – | ○ | ○ | ○ | – | ◐ | ▫ | ◐ |
| Dominios y certificados | F3 | – | ○ | ○ | ○ | – | ◐ | ▫ | – |
| **Personas y lugares** · Personas | E2 | – | ○ | ○ | ○ | ▫ † | ◐ | ▫ | ◐ Mis datos |
| Áreas, centros de costo y ubicaciones | E2 | – | ○ | ○ | ▫ | ▫ | ▫ | ▫ | – |
| Altas y bajas de personal | F2 | – | ○ | ○ | ○ | ◐ | ◐ | ▫ | – |
| Mapa de servicios (CMDB) | F3 | – | ○ | ○ | ○ | ▫ | – | ▫ | – |
| **Análisis** · Reportes y tableros | listas en E2 a E5; tableros F3 | – | ○ | ● | ○ | ○ | – | ▫ | – |
| **Administración** · Usuarios | E1 | – | ○ | ▫ | – | – | – | – | – |
| Roles y permisos | E1 | – | ○ | ▫ | – | – | – | – | – |
| Catálogos y categorías | E2 | – | ○ | ▫ | ○ catálogos | ▫ | ▫ | ▫ | – |
| Auditoría | E1 | – | ○ | ○ | – | – | – | – | – |
| Notificaciones (reglas, plantillas, registro) | F2 | – | ○ | – | – | – | – | – | – |
| Integraciones y API | F3 | – | ○ | ▫ | – | – | – | – | – |
| Configuración de la empresa y módulos activos | E1 | – | ○ | ▫ | – | – | – | – | – |
| **Mi espacio** (equipos, líneas, licencias, actas, casos, tareas) | E4 en adelante | – | ○ | ○ | ○ | ○ | ○ | ○ | ● |
| Mi cuenta y seguridad | E1 | ○ | ○ | ○ | ○ | ○ | ○ | ○ | ○ |
| **Consola de plataforma** (empresas, soporte autorizado, estado del correo) | E1 | ● | – | – | – | – | – | – | – |

**Primer clic de cada rol (la tarea más común):**
- Almacén: **Recibir mercadería** (desde "Por recibir").
- Técnico: **Entregar equipo** o **Buscar activo**.
- Jefatura TI: **Por aprobar** (con monto, proveedor y quién lo pidió a la vista).
- Solicitante: **Pedir ayuda** o **Nueva solicitud de compra**.
- Administrador: **Primeros pasos** si la empresa es nueva; si no, resumen.
- Solo lectura: el **buscador** grande.
- Empleado del portal: **Mis equipos** y **Pedir ayuda**.

---

## 3. Lista final de pantallas del prototipo de la Etapa 0

**Cómo está pensada.** El CEO aprueba el diseño con las **26 pantallas A**. Las **18 B** completan el recorrido y muestran cómo se verán los módulos de las fases 2 y 3, pero no hace falta verlas para aprobar. Cada pantalla A importante se dibuja en tres situaciones: normal, con errores y vacía. Las marcadas "Celular: sí" tendrán versión de 360 px de ancho. Todas funcionan en modo claro y oscuro.

### Prioridad A (el CEO debe verlas)

| ID | Pantalla | Qué debe poder comprobar el CEO | Origen | Celular |
|---|---|---|---|---|
| PR-00 | Guía visual y componentes | Colores de estado (7 familias), botones, tablas, formularios, diálogo de motivo, estados vacíos, claro y oscuro | Sección 4 | Sí |
| PR-01 | Ingreso por enlace al correo | "Revise su correo"; el mismo mensaje exista o no el correo | RF-ACC-005/017 | Sí |
| PR-02 | Elegir empresa y barra con empresa activa | Siempre se ve en qué empresa trabaja | RF-ACC-012 | Sí |
| PR-03 | Inicio Almacén "Por recibir" | Órdenes esperando mercadería y botón "Recibir" | RNF-008 | Sí |
| PR-04 | Inicio Técnico "Mi trabajo" | Una sola bandeja, buscador de activos, "Entregar equipo" | RNF-008, H-UX-05 | Sí |
| PR-05 | Inicio Jefatura "Por aprobar" | Bandeja única con monto, proveedor y quién pidió; tarjetas de vencimientos | RNF-008, H-UX-06 | Sí |
| PR-06 | Búsqueda global | Resultados agrupados por tipo; código exacto va a la ficha | RNF-007 | Sí |
| PR-07 | Lista de artículos (SKU) | Buscador, filtros, exportar visible (desactivado sin permiso) | RF-SKU, RNF-006 | No |
| PR-08 | Ficha del SKU | Pestañas: resumen, series o activos, stock por ubicación, órdenes de compra, historial | RF-SKU-012 | Sí |
| PR-09 | Crear o editar SKU | Código automático o propio, campos del artículo, validación en el momento | RF-SKU-003/005 | No |
| PR-10 | Categorías y campos personalizados | Campos "del artículo" y "de cada unidad"; tipo Secreto | RF-CAT-014 | No |
| PR-11 | Lista de activos | Filtros por estado, ubicación y responsable; etiquetas de estado con texto | RF-INV | Sí |
| PR-12 | Ficha del activo | Cabecera fija y 7 pestañas (H-UX-13); datos ocultos sin permiso | RF-INV, H-UX-13 | Sí |
| PR-13 | Entregar equipo y acta imprimible | Asistente de pasos: persona (con alta rápida), equipos, condición, accesorios, préstamo; vista del acta | RF-INV-016, RF-ENT-001 | Sí |
| PR-14 | Cambiar estado (diálogo con motivo) | Solo las transiciones permitidas; motivo obligatorio; reingreso | D-012 | Sí |
| PR-15 | Directorio de personas | Nombres ocultos como "P-0042" sin permiso; estado de la Persona | RF-PER, D-006 | No |
| PR-16 | Importar Excel | Plantilla, vista previa con error por fila (fila, columna, motivo), todo o nada, deshacer lote | RF-IMP | No |
| PR-17 | Lista de órdenes de compra | Estados con texto; filtros | §12 | Sí |
| PR-18 | Crear orden de compra | Líneas, impuesto, moneda; totales por moneda | RF-OC-004 a 007 | No |
| PR-19 | Detalle de OC y decisión de aprobación | Aprobar o rechazar con motivo; el aviso "usted la preparó"; efecto en presupuesto (muestra) | §12.2, 12.4 | Sí |
| PR-20 | Recepción de mercadería con series en bloque | Pegar 40 series; error por fila con texto; contador "38 de 40"; borrador; resumen; doble clic protegido | RF-OC-029 a 041 | Sí |
| PR-21 | Usuarios (invitar, suspender, dar de baja) | Estados del usuario; último administrador protegido | §7.1 | No |
| PR-22 | Roles y matriz de permisos | Acordeón por módulo, sensibles marcados, vista previa "qué puede hacer" | §7.2, H-UX-04 | No |
| PR-23 | Auditoría | Filtros; detalle antes y después; "quién tocó qué" | §16 | No |
| PR-24 | Consola de plataforma | Crear, suspender y rescatar empresas; soporte autorizado por 24 h | §6 | No |
| PR-25 | Mensajes de error, permiso y bloqueo | Los 3 mensajes y 3 bloqueos; "el registro cambió"; "su sesión termina en 5 minutos" | H-UX-09, H-UX-19 | Sí |

### Prioridad B (completan el recorrido o son muestras)

| ID | Pantalla | Por qué | Celular |
|---|---|---|---|
| PR-26 | Primer ingreso: aviso de privacidad y segunda verificación | RF-ACC-013/023 | Sí |
| PR-27 | Inicio Administrador y "Primeros pasos" | Empresa nueva vacía | No |
| PR-28 | Inicio Solicitante y Solo lectura | Completa los 6 inicios | Sí |
| PR-29 | Catálogos (pantalla genérica) | Marcas, proveedores, ubicaciones | No |
| PR-30 | Devolver equipo y traspasar | Cierra el ciclo de la entrega | Sí |
| PR-31 | Stock por cantidad: ingreso, salida y traslado | Mouses, teclados, cables | Sí |
| PR-32 | Ficha de la persona y asistente de cese | Muestra el bloqueo con equipos asignados | No |
| PR-33 | Órdenes de servicio: lista, crear, detalle | Etapa 6 | Sí |
| PR-34 | Configuración de la empresa y módulos activos | Límite de aprobación, excepción, zona horaria | No |
| PR-35 | Mi cuenta y seguridad | Cerrar sesión en todos, segunda verificación | Sí |
| PR-36 | Muestra: portal del empleado | Inicio, mis equipos, pedir ayuda (nivel 3 de usuario) | Sí |
| PR-37 | Muestra: mesa de ayuda, caso con SLA | Estados de SLA con texto | Sí |
| PR-38 | Muestra: Vencimientos (lista y calendario) | La pantalla única que reemplaza 5 | No |
| PR-39 | Muestra: campana y preferencias de avisos | Fase 2 | Sí |
| PR-40 | Muestra: licencias, cumplimiento y revelar clave | Dato secreto con ocultado a los 30 s | No |
| PR-41 | Muestra: presupuesto, ejecución con semáforo de texto | Totales por moneda sin "total general" | No |
| PR-42 | Muestra: mapa de servicios, vista de impacto | Árbol con lista equivalente | No |
| PR-43 | Muestra: cambios, decisión de aprobación | Mismo bloque de decisión que PR-19 | Sí |

**Lo que no se prototipa:** el resto de las 179 pantallas de módulos. Se arman con los mismos 8 patrones. Cuando el CEO apruebe fases 2 y 3, cada módulo se diseña en su momento.

---

## 4. Decisiones del sistema de diseño que conviene fijar antes de construir

### 4.1 Colores de estado (7 familias)
Regla: **toda etiqueta lleva texto y un icono**; el color solo refuerza. Un **estado guardado** (Aprobada) es una etiqueta rellena. Una **etiqueta calculada** (Por vencer, Atrasado, En riesgo) es una etiqueta con borde y un reloj, para que nadie crea que se puede cambiar a mano.

| Familia | Cuándo se usa | Estados de ejemplo (de los módulos) | Fondo / texto, claro | Fondo / texto, oscuro | Contraste texto, claro / oscuro |
|---|---|---|---|---|---|
| Neutro | Aún no tiene efecto | Borrador, Creada, Nuevo, Registrado, Programado, Por iniciar, Por activar, Invitado | `#EEF1F4` / `#3B4652` | `#2A323B` / `#D5DBE2` | 8,5 / 9,3 |
| En curso | Alguien está trabajando en ello | Asignado, Emitida, En ejecución, En atención, En implementación, Recibida parcial, Abierto, En el garante | `#E3F0FF` / `#0B4A8F` | `#12304F` / `#A9D0FF` | 7,6 / 8,4 |
| Atención | Esperando algo o con aviso | Pendiente de aprobación, En espera, En reparación, Suspendida, Por vencer, En riesgo, Excedente, Sin verificar, Pendiente de firma | `#FFF1D6` / `#7A4A00` | `#4A3510` / `#FFD58A` | 6,7 / 8,4 |
| Éxito | Bien y vigente | Aprobada, Vigente, En stock, Resuelto, Realizado, En regla, Cumplido, Firmada en papel, Recibida total | `#E1F5E8` / `#14602F` | `#12391F` / `#9BE0B3` | 6,7 / 8,4 |
| Alerta | Requiere acción ya | Rechazada, Vencido, Atrasado, Déficit, Fallido, Extraviado o robado, Revocada, Firma rechazada | `#FDE7E7` / `#8F1D1D` | `#4A1717` / `#FFB4B4` | 7,5 / 8,7 |
| Final | Terminó o ya no se usa | Cerrada, Anulada, Cancelada, De baja, Terminado, Inactivo, Archivado, Reemplazado, Anonimizada | `#E5E7EB` / `#4B5563` | `#30343A` / `#B8BEC7` | 6,1 / 6,7 |
| Sensible | No es un estado: marca de permiso o excepción | Dato sensible, Excepción activa, Modo soporte | `#EFE7FB` / `#5B2A9D` | `#33224F` / `#D6BFFF` | 7,7 / 8,6 |

Las etiquetas llevan además un **borde de 1 px del color del texto**, porque el fondo solo se distingue de la página con un contraste de 1,1 a 1,6. Contrastes calculados por mí con la fórmula WCAG; el mínimo exigido es 4,5.

### 4.2 Componentes base (los 8 patrones y su apoyo)
1. **Estructura de la pantalla** (barra superior, menú lateral, barra inferior en celular).
2. **Etiqueta de estado** y **etiqueta calculada** (4.1).
3. **Lista estándar:** buscador, 3 filtros rápidos visibles y "Más filtros", filtros activos como fichas, orden, 50 filas por página (selector 25/50/100), Exportar visible (desactivado con razón si falta permiso), en celular tarjetas de 3 datos más estado.
4. **Ficha:** cabecera fija, pestañas condicionales con contador, panel de acciones.
5. **Formulario:** etiqueta arriba, ayuda breve, validación en el momento, resumen de errores arriba con enlace a cada campo, obligatorio escrito ("obligatorio"), no solo asterisco.
6. **Tabla de captura en bloque con validación por fila** (series, importación, puestos, invitaciones).
7. **Asistente por pasos** con resumen final y botón con el verbo de la acción.
8. **Diálogo de motivo y confirmación** (H-UX-15).
9. **Bandeja** (fila con acción en la misma línea: Por aprobar, Mi trabajo, Pendientes).
10. **Tarjeta de cifra** con fecha de corte y definición al pasar el cursor o tocar.
11. **Línea de tiempo** (Historial de la ficha). En la ficha se llama "Historial"; "Auditoría" solo existe en Administración.
12. **Aviso** (información, regla, excepción activa, modo soporte), siempre con texto, nunca solo color.
13. **Dato oculto** (tres formas, 4.5) y **dato secreto** (enmascarado, revelar, se oculta solo con aviso previo).
14. **Código visible** con botón copiar.
15. **Importe con moneda**; totales por moneda, nunca "total general".
16. **Fecha** día/mes/año en la zona de la empresa.
17. **Selector con búsqueda** (persona, activo, SKU) con alta rápida donde corresponda.
18. **Estado vacío** de tres tipos: primera vez (qué hacer), sin resultados (cambie los filtros), sin permiso (a quién pedirlo).
19. **Mensaje de éxito** (breve, no desaparece antes de 6 segundos y se anuncia por lector de pantalla).
20. **Calendario con lista equivalente; árbol con lista equivalente.**

### 4.3 Tipografía, espacio y tono
- Tipografía del sistema, 16 px de base, interlineado 1,5. Espacios en múltiplos de 4 px. Objetivos táctiles de 44 px.
- Un solo conjunto de iconos, todos con texto alternativo.
- **Tono "usted"** en toda la plataforma (H-UX-24). Frases cortas. Sin jerga: "orden de compra", "serie", "activo".
- Los números largos se leen mejor con separador de miles; formato por empresa (H-UX-17).

### 4.4 Vocabulario del ciclo de vida

| Palabra | Significa | Se usa para | Reversible |
|---|---|---|---|
| **Activar / Desactivar** | Prender o apagar un registro de una lista | SKU, marca, proveedor, plan, plantilla, campo, valor de catálogo | Sí |
| **Suspender / Reactivar** | Cortar un acceso o servicio por un tiempo | Usuario, línea, empresa, integración, webhook | Sí |
| **Dar de baja** | El elemento ya no existe para la empresa. Pide motivo | Activo, línea, dominio, certificado, usuario de la empresa | Solo con reingreso, si el módulo lo permite |
| **Cesar** | La persona ya no trabaja en la empresa | Persona | Reactivar (recontratación) |
| **Anular** | Dejar sin efecto un documento ya registrado o emitido | Orden de compra, acta, garantía, gasto, presupuesto, modificación, contrato por error | No |
| **Cancelar** | Detener un trabajo que estaba en curso | Orden de servicio, caso, cambio, mantenimiento, reclamo, proceso de altas y bajas | No |
| **Terminar** | Un contrato acaba antes de su fecha de fin | Contrato (PRV y LIC) | No |
| **Cerrar** | El trabajo concluyó | Orden, caso, cambio, problema | No (se crea otro) |
| **Aprobar / Rechazar** | Decisión de otra persona | Orden de compra, cambio, presupuesto, contrato, solicitud | No (el rechazo se corrige y se reenvía) |

### 4.5 Mensajes, bloqueos y datos ocultos
**Tres mensajes** (cada uno dice qué pasó, por qué y qué hacer; sin detalles internos ni datos personales):
1. **"No encontrado":** otra empresa, inexistente, o un objeto de la misma empresa fuera del alcance "propio" de la persona. "No encontramos lo que busca. Puede que ya no exista o que no esté disponible para usted."
2. **"No tiene permiso":** solo si la persona ya ve el objeto o la pantalla y le falta el permiso de la acción. "Su rol no permite aprobar órdenes. Si lo necesita, pídaselo a un administrador de [Empresa]." (Regla confirmada por el Especialista en Seguridad.)
3. **"No se puede por una regla":** una regla del negocio lo impide. "No puede aprobar esta orden porque usted la preparó. Debe aprobarla otra persona."

**Tres bloqueos:** (1) el botón **no aparece** si el rol nunca tendrá esa acción; (2) el botón aparece **desactivado con la razón escrita** al lado (no solo al pasar el cursor) si depende de una regla o del estado; (3) si se llega por dirección directa, se muestra el mensaje 1 o 2.

**Tres formas de dato oculto:** (1) **referencia en lugar del nombre**: "P-0042" con un candado y el texto "Datos personales ocultos"; (2) **secreto enmascarado**: "••••AB12" con "Revelar (se oculta en 30 s)", solo con permiso, y queda en la auditoría; (3) **columna omitida** en reportes y exportaciones, con un aviso arriba: "Se omitieron columnas: precios (requiere permiso)".

**Otros mensajes del sistema:** "El registro cambió" (con lo que cambió y la opción de revisar), "Su sesión termina en 5 minutos", "No pudimos guardar; lo que escribió no se perdió" con un código para avisar a TI.

### 4.6 Decisiones pendientes para el Gerente de TI (mis recomendaciones)

| ID | Decisión | Recomendación |
|---|---|---|
| DS-01 | Confirmar S-31, un botón "Pedir ayuda" (H-UX-01) | Confirmar |
| DS-02 | Qué tabla de permisos manda cuando núcleo y módulo no coinciden (H-UX-03) | Manda la del núcleo |
| DS-03 | Vocabulario de la sección 4.4 (H-UX-07) | Aprobar |
| DS-04 | Siete familias de color de la sección 4.1 (H-UX-08) | Aprobar |
| DS-05 | Verbo único "Aprobar" y una sola bandeja "Por aprobar" (H-UX-06) | Aprobar |
| DS-06 | Prototipo en dos niveles: 26 A y 18 B (H-UX-12) | Aprobar |
| DS-07 | Una sola pantalla de Vencimientos, una sola de Importar datos, un solo "Mi espacio" y avisos solo en Notificaciones (H-UX-10, 11) | Aprobar |
| DS-08 | Invitaciones masivas: por persona, no todo o nada (H-UX-10) | Por persona |
| DS-09 | Tono "usted" en todo (H-UX-24) | "Usted" |
| DS-10 | Almacén puede dar de alta una Persona nueva al entregar (H-UX-14) | Sí, solo nombre y área |
| DS-11 | Lista "campo / oficina" para celular (H-UX-18) | Aprobar |
| DS-12 | Tabla única de prefijos de códigos (H-UX-16) | Aprobar |

Ninguna de estas decisiones toca dinero, un tema legal ni algo irreversible. **No se escala nada al CEO.**

---

## 5. Veredicto y condiciones

**Veredicto del núcleo (documento funcional v0.2): conforme con observaciones.** Describe las tareas reales, tiene los estados y reglas necesarios para dibujar las 26 pantallas A, y ya incorporó durante esta ronda el botón "Pedir ayuda" (S-31).

**Veredicto de los 17 módulos como conjunto: no conforme todavía.** Cada uno es sólido por separado, pero juntos contradicen la matriz de permisos (H-UX-03), repiten pantallas y flujos (H-UX-06, 10, 11) y usan palabras distintas para lo mismo (H-UX-07).

**Condiciones para pasar a conforme (salida corta):**
1. El Gerente de TI decide DS-01 y DS-02 (puerta única y qué matriz de permisos manda).
2. El Analista reescribe las tablas de permisos de los módulos con el resultado, adopta `datos_personales.ver` y el catálogo de permisos del arquitecto.
3. El Gerente de TI aprueba el vocabulario (4.4) y las siete familias de color (4.1).
4. El Gerente de TI aprueba el alcance del prototipo (sección 3) y las consolidaciones (DS-05 y DS-07).
5. El Analista agrega al documento las pantallas sin dueño (H-UX-20).

Con 1 y 2 resueltas puedo empezar a construir el prototipo de prioridad A; 3, 4 y 5 las resuelvo con los valores propuestos si el Gerente de TI no objeta.

## 6. Mensajes de esta revisión
Cuatro mensajes enviados y cuatro respuestas recibidas. Registro literal en `docs/revision-cruzada/mensajes-disenador-ux.md`.

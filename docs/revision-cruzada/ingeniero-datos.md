# Revisión cruzada (ronda 2) · Ingeniero de Datos

**Fecha:** 2026-10-25 · **Revisor:** ingeniero-datos · **Enfoque:** el modelo de datos del conjunto.
**Qué revisé:** `docs/documento-funcional.md` v0.2, los 17 módulos de `docs/modulos/*.md` y `docs/equipo/decisiones.md` (D-001 a D-032, incluidas D-030 a D-032, que se tomaron mientras revisaba).
**Marcas:** HECHO = se comprueba en un archivo. OPINIÓN = criterio profesional mío. [ESCALAR AL CEO] = solo dinero, tema legal o algo irreversible.
**No edité** ninguno de los documentos revisados. Solo escribí en `docs/revision-cruzada/`.

---

## 1. En una página

Lo que está bien: casi todos los módulos respetan lo esencial (empresa en todo, nada se borra, importes con moneda, motivo obligatorio, "no encontrado" entre empresas). Se nota que los escuadrones leyeron las decisiones.

Lo que me preocupa, en lenguaje simple:

1. **Hay operaciones que ocurren antes de saber de qué empresa se trata** (entrar con el correo, validar una clave de API, aceptar una invitación, las tareas nocturnas, el contador de avisos de "mis otras empresas"). Nadie ha dicho cómo acceden a la base. Si no se diseñan ahora, alguien usará una conexión sin restricciones y se pierde el aislamiento (riesgo #2).
2. **La misma información está repetida en varios módulos** y no hay un dueño claro: el costo (siete lugares), el contrato (dos fichas), la asignación (cuatro tablas), el elemento de la CMDB (copia de todo el inventario), el número de línea (campo del celular y entidad propia), la clave de licencia (¿serie o secreto?).
3. **Faltan reglas que la base debe hacer cumplir y hoy solo viven en el texto**: estado del activo contra su asignación, puestos de licencia contra lo comprado, correlativos con 20 formatos, unicidad de identificadores como el IMEI.
4. **Anonimizar** quedó bien encaminado con D-030, pero todavía hay copias de datos personales que ninguna regla cubre (actas, registro de envíos, textos libres, contactos de proveedores).
5. **Hay muchos procesos automáticos** (tareas nocturnas, reacciones a eventos) y la decisión de "sin colas" (D-025) no dice cómo se hacen sin perder ni duplicar nada.

Veredicto: **conforme con observaciones** (sección 5). Nada obliga a rehacer el documento, pero 6 puntos deben quedar decididos antes de escribir la primera tabla de la Etapa 1.

---

## 2. Hallazgos

Ordenados por importancia. "Quién cambia" es quien debe corregir el documento o el diseño; la decisión final es del gerente-ti.

| ID | Gravedad | Dónde | Hecho u opinión | Qué cambiar (propuesta concreta) | Quién cambia |
|---|---|---|---|---|---|
| **H-DAT-01** | **crítica** | D-025; RS-10 y RS-11 (doc. funcional §17); `integraciones-api` RN-INT-001, RN-INT-002, RN-INT-017; `notificaciones` §6 (tipo de evento, estado del correo) y RF-NOT-006; RF-ACC (login, invitación); todos los "procesos diarios" | **HECHO:** al menos siete operaciones se ejecutan sin empresa conocida: login por correo, aceptar invitación por enlace, validar la huella de una clave de API, tareas nocturnas de ~14 módulos, contador de no leídas de las otras empresas del usuario, estado de un correo que rebotó, tablas globales (tipos de evento, monedas, países). **HECHO:** las referencias "objeto (tipo e identificador)" de NOT, auditoría, CMDB y PRE no admiten clave foránea compuesta con empresa. **OPINIÓN:** si esto no se diseña, el desarrollador usará una conexión privilegiada y el aislamiento (riesgo #2) se rompe justo donde nadie mira. | (1) Cuatro roles de base separados (acordado con el arquitecto): `app_empresa`, `app_plataforma` (sin acceso a tablas de negocio), migraciones y mantenimiento. (2) Lista cerrada y corta de **funciones de acceso sin empresa** (SECURITY DEFINER, dueño sin login, devuelven lo mínimo, auditadas, con prueba): login por correo, huella de clave de API, invitación por token, lista de empresas para el programador, contador de otras empresas. (3) Tareas nocturnas: recorren empresa por empresa, fijando la empresa en cada transacción, con el mismo rol `app_empresa`. (4) Tablas globales (eventos, monedas, países) de solo lectura para la aplicación; estado del correo global solo por dos funciones (acordado con Seguridad). (5) Referencias a objetos: columnas por tipo con clave foránea compuesta (empresa, id) y CHECK de que solo una está llena; para auditoría, un disparador que valida la misma empresa al insertar más una verificación nocturna de cruces. (6) Todas las pruebas de aislamiento corren con `app_empresa` (no dueño, sin BYPASSRLS, no superusuario) y una prueba verifica esas tres cosas; todo índice empieza por `empresa_id`. (7) Todo eso entra al prototipo de 1 a 2 días de D-025. | arquitecto (ADR-001), especialista-seguridad, ingeniero-datos, qa-tester |
| **H-DAT-02** | alta | D-018, D-030, D-032; RF-AUD-003; `personas-ubicaciones` S-PER-07, RN-ENT-006 (`entregas-devoluciones`); `notificaciones` RN-NOT-016; `proveedores-contratos` RN-PRV-034 | **HECHO:** D-030 resuelve la contradicción principal (la auditoría guarda solo el identificador y no el valor de nombre, correo ni área; S-PER-07 queda sin efecto). **HECHO:** aún quedan cierres: (a) RN-ENT-006 copia nombre y área en el acta, lo que contradice D-030.1 ("viven solo en Persona y Usuario"); (b) no se dice qué otros campos quedan fuera de la auditoría: código de empleado, nombre/correo/teléfono de contactos de proveedor, titular persona natural de un dominio, textos libres (notas, descripciones, motivos) que pueden traer nombres; (c) D-032.3 dice que el registro de anonimizaciones "se conserva en el sistema vivo", pero si el sistema vivo se pierde o se restaura, ese registro se pierde con él; (d) el borrado a los 5 años (D-030.5) necesita un rol propio. **OPINIÓN:** el diseño de D-030 es el correcto y más simple que mi tabla lateral; retiro esa propuesta. | (1) En el registro de campos auditables, cada campo lleva una clase: **personal**, **texto libre**, **secreto** u **ordinario**; para las tres primeras la auditoría guarda "el campo cambió" sin valores. (2) Decidir sobre el acta: o guarda solo el identificador y muestra los datos vigentes, o guarda copia y esa copia entra en `anonimizar_persona()` (H-DAT-12); recomiendo la segunda por ser evidencia de lo firmado, con visto bueno de Cumplimiento. (3) Registro de anonimizaciones (identificador y fecha, sin datos personales) en un **almacén aparte de la base que se restaura**, que sobreviva a la pérdida total del sistema y sin rotación (pedido de Cumplimiento, de acuerdo). (4) Rol `mantenimiento` que archiva por partición mensual las entradas de más de 5 años y deja constancia; es la única excepción a "solo se agrega" y debe estar documentada así. (5) Prueba de QA de D-030: anonimizar y comprobar que la auditoría sigue completa y sin nombres. | auditor-cumplimiento, arquitecto (ADR-005), ingeniero-datos, analista-funcional |
| **H-DAT-03** | alta | RF-ACC-009, RF-ACC-011; RF-ROL-001; `personas-ubicaciones` RN-PER-017; `notificaciones` RN-NOT-002, RF-NOT-006; D-024 (usuario dado de baja); RF-AUD-003 ("quién") | **HECHO:** la cuenta es global por correo y una persona puede estar en varias empresas, pero los documentos dicen "Usuario" para el autor de una acción, el destinatario de un aviso y el responsable de un registro, sin aclarar si es la cuenta global o la membresía en esa empresa. **OPINIÓN:** si el autor es la cuenta global, (a) los registros de la empresa A apuntan a una fila que no tiene empresa y queda fuera de las reglas por fila; (b) dar de baja a alguien en A no se puede anonimizar sin afectar a B; (c) un administrador podría deducir en qué otras empresas está esa persona. | `usuario` global mínimo (correo normalizado, segunda verificación); `membresia(empresa, usuario, rol, estado)` con el nombre visible en esa empresa; **todas las tablas de negocio apuntan a la membresía** (clave compuesta con empresa) para creado por, aprobado por, responsable, destinatario; la Persona se vincula a la membresía (1 a 1, único por empresa); anonimizar una membresía no toca la cuenta global. El contador de avisos de otras empresas (RF-NOT-006) sale de una función propia. Escribirlo en §5 y §8 del documento. | arquitecto, ingeniero-datos, analista-funcional |
| **H-DAT-04** | alta | RF-INV-001 ("responsable solo cuando está Asignado"), RF-INV-013; `garantias-mantenimiento` RN-GAR-030, S-GAR-05; `entregas-devoluciones` RN-ENT-011, S-ENT-03; D-012 | **HECHO:** GAR dice que un activo Asignado que pasa a En reparación conserva su asignación; ENT permite devolver a TI con destino En reparación (cierra la asignación); el núcleo decía que el responsable solo existe si está Asignado. **HECHO:** el analista ya respondió con la regla única RF-INV-024 / S-29 (asignación se cierra solo con devolución, baja o extravío; Asignado exige asignación abierta; En stock no la tiene; En reparación puede o no tenerla; la ubicación siempre existe). **OPINIÓN:** la regla es correcta, pero hoy solo es texto. | Hacerla cumplir en la base, sin disparadores complicados: columna `responsable_persona_id` en el activo (copia de la asignación abierta) con CHECK por estado (Asignado: obligatorio; En stock, Extraviado, De baja: vacío; En reparación: libre); índice único parcial en la tabla de asignaciones (un activo, una abierta, `hasta` vacío); clave foránea compuesta; `ubicacion_id` NOT NULL; todas las transiciones por una sola función. Para "movimientos posteriores" (RN-ENT-019, RF-OC-032, deshacer lote) usar una **secuencia creciente** por empresa, no la hora. El gerente-ti debe confirmar S-29 y el analista añadir una tabla de combinaciones estado × asignación × ubicación. | analista-funcional, ingeniero-datos, gerente-ti (confirma S-29) |
| **H-DAT-05** | alta | D-005; D-011.2; RF-CAT-012, RF-CAT-014; RF-SKU-013, RF-SKU-014; `licencias-software` SUP-LIC-03, §6; `lineas-moviles` SUP-LIN-02, RF-LIN-014, RN-LIN-023; doc. funcional §9.3 y §18.1 | **HECHO:** D-005 solo tiene cinco tipos de campo con valores en JSON validado: no hay unicidad ni índice para el IMEI, ni tipo "secreto". LIC (SUP-LIC-03) dice que la clave no es la serie sino un campo de unidad secreto, lo que corrige D-011.2; LIN busca y valida por IMEI y retira "número de línea" del celular, lo que contradice el ejemplo de §9.3 y la tabla de §18.1. **OPINIÓN:** LIC y LIN tienen razón; si la clave fuera la serie se romperían el historial de correcciones (D-017.1) y la búsqueda. | (1) Dos marcas nuevas en la definición de campo: **identificador** (único por empresa, normalizado, con una tabla `identificador_unidad(empresa, definición, valor_normalizado, activo)` y UNIQUE; el IMEI lo usa) y **secreto** (cifrado, sin búsqueda, fuera de exportaciones, auditoría y reportes). (2) Aceptar SUP-LIC-03 y corregir D-011.2 y RF-SKU-013: la serie es un identificador visible de la unidad; la clave es un campo secreto; el historial de la clave dice solo "clave cambiada". (3) Retirar "número de línea" del Celular en §9.3 y §18.1: la dueña es la entidad Línea. (4) Cifrado (de acuerdo con Seguridad): llave maestra fuera de la base en un gestor de secretos, llave derivada por empresa, guardadas por DevOps, rotación anual y ante sospecha con recifrado por lotes; la máscara va en otra columna y solo con claves de 16 caracteres o más (en claves cortas se muestra menos). (5) Incluir el gestor de secretos en la estimación D2 de DevOps. | arquitecto (ADR-007), analista-funcional, especialista-seguridad, devops |
| **H-DAT-06** | alta | `licencias-software` RN-LIC-006, RN-LIC-019, RF-LIC-003, RNF-LIC-003, SUP-LIC-02; D-010; D-011 | **HECHO:** el contrato por serie obtiene sus puestos sumando el campo de unidad "número de puestos" (JSON), y RN-LIC-006 / RNF-LIC-003 exigen que de 20 intentos simultáneos con un puesto libre gane exactamente uno; una suma sobre JSON no se puede proteger con una restricción de la base. **HECHO:** RN-LIC-019 congela los puestos del contrato, pero el campo de la unidad sigue siendo editable. **HECHO:** en un SKU por cantidad los puestos se escriben en el contrato mientras D-010 lleva el stock por movimientos: dos fuentes de verdad para lo "comprado". | Los puestos del contrato son un **número guardado al confirmar** (copia, no suma viva); `puestos_asignados` en el contrato con CHECK (`<= puestos`) actualizado en la misma transacción que la asignación, bloqueando la fila del contrato; único parcial (contrato, persona) con `hasta` vacío; el campo de unidad "puestos" no se edita cuando la unidad está en un contrato Vigente; decidir por escrito que en los SKU por cantidad de la categoría Licencias el contrato es la fuente y el stock no se mueve. Prueba con 20 conexiones simultáneas contra la base real. | analista-funcional (escuadrón B), ingeniero-datos, qa-tester |
| **H-DAT-07** | alta | `presupuesto-costos` RN-PRE-013, §6, §9; `proveedores-contratos` RN-PRV-037, RN-PRV-038; `licencias-software` §6, RF-LIC-019; `lineas-moviles` §6 y §9; `dominios-certificados` §6, RF-DOM-007; `garantias-mantenimiento` RN-GAR-027; doc. funcional §14 (RF-OS) | **HECHO:** el costo vive en siete lugares (líneas de OC y costo del activo, contrato PRV, contrato de licencia, plan y cargo de línea, dominio y certificado, garantía y mantenimiento, orden de servicio). PRE promete "una sola fuente" (RN-PRE-013), pero el campo que lo permite no es igual en todos: LIN dice en §9 que cuenta la OC si está enlazada, pero su §6 no tiene campo de orden de compra; DOM la guarda solo en el evento de renovación; PRV usa una marca distinta. Un contrato de licencia podría contarse también como contrato PRV. **HECHO:** GAR, PRE y AYU leen de la OS el "costo", "cubierta por garantía" y "proveedor", pero RF-OS y D-027 solo tienen costo estimado. **OPINIÓN:** sin un patrón común, el doble conteo se descubrirá con datos reales. | Columnas estándar en todo registro con costo: `importe_sin_impuesto numeric(19,4)`, `pct_impuesto numeric(7,4)`, `moneda`, `periodicidad`, `centro_costo_id`, y `fuente_costo` ∈ {propia, orden_compra, contrato} con `orden_compra_id` y `contrato_id` (claves compuestas, CHECK de coherencia). Precedencia fija: orden de compra, luego contrato PRV, luego propia; PRE solo toma costo propio cuando no hay otra fuente. Añadir a RF-OS/D-027, antes de la Etapa 6: costo real, moneda, proveedor, centro de costo, "cubierta por garantía" y vínculo 1 a 1 con mantenimiento. | analista-funcional (PRE, PRV, LIC, LIN, DOM, GAR, OS), ingeniero-datos |
| **H-DAT-08** | alta | `proveedores-contratos` RF-PRV-008, RN-PRV-015, RN-PRV-018, §5.2; `licencias-software` RF-LIC-001, RN-LIC-016, RN-LIC-017; `garantias-mantenimiento` RN-GAR-025; `lineas-moviles`, `dominios-certificados` (responsable) | **HECHO:** PRV tiene el tipo de contrato "Licenciamiento o suscripción" (`CTR-`) y LIC tiene su propio "contrato de licencia" (`CLI-`): ambos con vigencia, renovación, preaviso, costo, estados y avisos. Las reglas de dinero difieren: PRV pide segunda persona solo sobre el monto límite; LIC la pide con cualquier costo mayor que 0 y marca "sin respaldo" solo sobre el límite. **HECHO:** el responsable es Usuario en PRV y en el ejecutor de GAR, y Persona en LIC, LIN, DOM y CMDB; una Persona sin Usuario no recibe avisos. **OPINIÓN:** son dos fichas para un mismo hecho económico. | Elegir una sola: el contrato de licencia es una **extensión 1 a 1** del contrato de PRV (tabla con tipo y puestos, que reutiliza fechas, costo, renovación y avisos), o PRV no gestiona licencias. Una sola regla de dinero (la de D-015). Una sola regla de responsable: **Persona** con vínculo opcional a membresía; los avisos se resuelven persona, luego membresía, luego correo, y si no hay, al grupo. | analista-funcional (escuadrones A y B), gerente-ti decide |
| **H-DAT-09** | alta | D-025 ("sin colas"); RF-AUD-013; `proveedores-contratos` RN-PRV-022, §8; `garantias-mantenimiento` RN-GAR-022; `licencias-software` RN-LIC-010; `cmdb-ligera` RNF-CMD-002, RNF-CMD-007, RN-CMD-022; `lineas-moviles` RF-LIN-010; `presupuesto-costos` RF-PRE-009; `reportes-tableros` RN-REP-019 | **HECHO:** hay al menos 12 reacciones automáticas a hechos del núcleo (baja de activo: cancela mantenimientos, libera puestos, avisa a LIN, retira el EC; cese: libera puestos, suspende usuario, marca dominios; recepción: crea EC, garantía y registro de costo) y unas 14 tareas nocturnas. RF-AUD-013 solo admite autor "usuario" o "integración", pero PRV, CMDB, GAR y LIC usan el autor "Sistema". **OPINIÓN:** sin regla, unas reacciones serán síncronas, otras se perderán o se duplicarán. | (1) Regla escrita: los efectos que protegen la integridad (registro de costo, EC, liberar puestos, cancelar mantenimientos) van **en la misma transacción**; los avisos y datos derivados van por una tabla de eventos pendientes `evento_saliente` en la misma base, con identificador único, procesada por un trabajador simple (no es un servicio de colas, por lo que no contradice D-025). (2) Añadir a RF-AUD-013 el autor "sistema". (3) Toda tarea nocturna es idempotente, por empresa, con su transacción y su registro de ejecución. (4) El arquitecto decide el planificador. | arquitecto, devops, analista-funcional (RF-AUD-013) |
| **H-DAT-10** | alta | D-007; RF-CAT-008; RF-OC-003, RF-OC-029; RF-OS-005; todos los módulos (ver Anexo B) | **HECHO:** hay más de 20 correlativos con anchos distintos (4, 5 y 6 dígitos). **HECHO:** la recepción es un documento propio (RF-OC-029) y no tiene número definido; el prefijo `REC-` ya es de reclamo (GAR). **HECHO:** el prefijo de una categoría puede ser de 2 a 5 letras (RF-CAT-008) y puede coincidir con `CTR`, `CAM`, `PRB`, `AYU`, `KB`, `EC`, `OC`, `OS`. **OPINIÓN:** D-007 serializa a quienes crean en la misma empresa y clave; la carga inicial de la CMDB (100.000 EC) y las importaciones necesitan reservar bloques. | Tabla `contador(empresa, clave, ultimo)` con clave con espacio de nombres (`sku:LAP`, `doc:OC`, `doc:CAM`...) y una función `siguiente(empresa, clave, n)` que reserva `n` números con una sola instrucción; lista de prefijos reservados que una categoría no puede usar; asignar número a la recepción (propongo `RCP-`); una sola tabla de formatos en el documento (Anexo B); prueba de 20 conexiones contra la base real (CA-018 ya existe) y una prueba de reserva de bloque. | analista-funcional, ingeniero-datos, qa-tester |
| **H-DAT-11** | alta | D-020; RF-IMP-001 a RF-IMP-014; CA-038; `personas-ubicaciones` RF-PER-014; LIC, LIN, DOM, CMDB e INT (cada uno define su "lote"); S-17 | **HECHO:** D-020.3 (todo o nada) y D-020.4 (volver a subir no duplica) no dicen qué pasa al subir un archivo ya confirmado: sus filas dirían "ya existe" y todo el lote fallaría. QA y yo nos preguntamos si "deshacer" anula o borra, y cuál es la clave para stock y personas, que no tienen serie. **HECHO:** seis módulos definen su propia importación y su propio lote sin tabla común. **HECHO:** RF-IMP no incluye costo, moneda, fecha de compra, fin de garantía ni centro de costo, que necesitan PRE, GAR y REP. **HECHO:** tope de 5.000 filas por archivo y 10 por día (S-17) frente a 100.000 activos supuestos y a la carga inicial de CMDB de 100.000. | Marco común: `importacion_lote`, `importacion_fila` (con el error por fila) y `lote_registro` (tabla e id de cada fila creada) con columna `lote_id` en las tablas importables. Un **archivo ya confirmado** (huella por empresa) se rechaza entero con "ya se cargó en el lote N". **Claves naturales**: activo = SKU + serie; persona = código de empleado o correo (sin ninguno se rechaza la fila); línea = número; dominio = nombre; stock = un solo "saldo inicial" por SKU + ubicación. **Deshacer = anular** ("anulado por lote"), nunca borrar, y esas filas salen de las reglas de unicidad con índice parcial; solo si nada del lote tiene movimientos posteriores. La plantilla incluye costo, moneda, fecha de compra, fin de garantía y centro de costo. Orden de dependencias del lote: catálogos, personas, SKU, activos, saldos. Auditoría del lote: una entrada de lote más detalle en su tabla, no 100.000 entradas sueltas (a confirmar con Cumplimiento). Calibrar el tope con el volumen real (P-003) y con el Excel real (P-007). | ingeniero-datos (diseño), analista-funcional (columnas, P-007), qa-tester |
| **H-DAT-12** | alta | D-024; D-030; D-032; RF-DAT-001 a RF-DAT-007; `entregas-devoluciones` RN-ENT-006; `notificaciones` RN-NOT-016; `mesa-de-ayuda` RF-AYU-040; `onboarding-offboarding` §6; `cmdb-ligera` §6; `dominios-certificados` RN-DOM-021; `proveedores-contratos` RN-PRV-034 | **HECHO:** datos personales están copiados en: Persona, membresía/usuario, acta (nombre y área), registro de envíos (correo, 12 meses), casos y comentarios de la mesa de ayuda (texto libre), notas de ONB, descripción de CMDB, contactos de proveedor (terceros, sin plazo propio), titular de dominio persona natural, IP en auditoría y en uso de API. Ninguna regla dice quién anonimiza cada una ni qué pasa con el texto libre. **OPINIÓN:** si cada módulo anonimiza a su manera, quedará algún rastro. | (1) Documento "registro de datos personales" (tabla, columna, clase, regla, plazo). (2) Una sola función `anonimizar_persona(persona)` que cubre todas las copias de una Persona y otra para contactos de proveedor. (3) Prueba con valores "canario" (un nombre y un correo de prueba) que busca en todas las tablas y en las exportaciones tras anonimizar. (4) Textos libres: no se editan solos; Cumplimiento decide el plazo y la advertencia en pantalla. (5) Contactos de proveedor: definir plazo propio (terceros). (6) El registro de anonimizaciones fuera de la base (H-DAT-02). **Ya escalado:** L1, L2, L5 e I1; no se agrega nada al CEO. | auditor-cumplimiento, ingeniero-datos, devops |
| **H-DAT-13** | alta | D-014; RF-OC-005, RF-OC-006, RF-OC-017; `integraciones-api` RN-INT-042, contrato SAP (precio con 4 decimales); RN-PRE-020; ~12 tablas con "moneda de 3 letras" | **HECHO:** D-014 define decimal exacto con 4 decimales, pero no dice cómo se redondea el impuesto de cada línea ni el total; PRE redondea a 2 decimales y la última cuota absorbe la diferencia; SAP recibe 4 decimales. La moneda es un texto de 3 letras en muchas tablas, sin lista de referencia (no todas las monedas tienen 2 decimales). **HECHO:** P-004 (país) sigue sin respuesta y afecta impuestos y formato de teléfonos. | Tabla global de monedas (ISO 4217, con sus decimales); la moneda es clave foránea. Importes `numeric(19,4)` y porcentajes `numeric(7,4)`; nunca coma flotante. Una regla única de redondeo escrita en el documento (propongo: impuesto por línea redondeado a los decimales de la moneda, mitad hacia arriba; total = suma de las líneas redondeadas) y el total de la OC guardado, no recalculado. `pais` y `zona_horaria` (zona IANA) en la empresa desde la Etapa 1. **Escalar:** ya está P-004 (país e impuestos); no se agrega nada nuevo. | analista-funcional (regla), ingeniero-datos |
| **H-DAT-14** | media | RN-012; RF-SKU-002; RF-INV-002; `dominios-certificados` RN-DOM-002; `lineas-moviles` RN-LIN-002; `proveedores-contratos` RN-PRV-001; `personas-ubicaciones` RN-PER-005 | **HECHO:** RN-012 dice "sin mayúsculas ni espacios", pero cada módulo necesita otra normalización (dominio en minúsculas y sin "www." ni punto final; número de línea solo dígitos con código de país; identificación fiscal sin guiones; serie; correo; ICCID) y varias unicidades valen solo "entre los no dados de baja" (dominio, línea, correo de Persona no anonimizada). | Una función de normalización inmutable por tipo; columnas generadas `*_norm` con índice único parcial donde diga "no dados de baja"; extensiones aprobadas por el arquitecto (`citext`, `unaccent`, `pg_trgm`, `btree_gist`, `pgcrypto`); casos de prueba de la tabla del Anexo C. | ingeniero-datos, arquitecto |
| **H-DAT-15** | media | `cmdb-ligera` RF-CMD-002 a RF-CMD-005, RF-CMD-010, RN-CMD-006, RNF-CMD-002, RN-CMD-022, CA-CMD-01, CA-CMD-11 | **HECHO:** la CMDB crea una copia (EC) de cada activo, licencia, línea, dominio y Persona (más de 100.000 filas) y las sincroniza con retraso aceptado; "asignado a" se guarda como relación aparte aunque ya existe en ENT, LIC y LIN (3 o 4 copias del mismo hecho). CA-CMD-01 pide que el EC exista al terminar la recepción (síncrono) mientras RN-CMD-022 dice que se reintenta (asíncrono). La unidad de una licencia generaría un EC Activo y el contrato otro EC Licencia. | EC = tabla **registro delgada** (empresa, código EC, tipo, id de origen con clave compuesta) creada en la misma transacción que el origen; nombre, estado y criticidad se leen del origen mediante una vista, no se copian. "Asignado a" **derivada** (vista) de las asignaciones, no almacenada. La unidad de una licencia no genera EC Activo. Relaciones manuales con clave compuesta. Impacto con consulta recursiva limitada a 5 niveles. Reservar los códigos EC por bloque en la carga inicial. | analista-funcional (escuadrón E), arquitecto, ingeniero-datos |
| **H-DAT-16** | media | RF-CAT-001, RF-CAT-006 (S-06), D-008.7; `personas-ubicaciones` RF-PER-005, RF-PER-007, RF-PER-010, §11 caso 11; RF-CAT-024 | **HECHO:** el núcleo dice que la ubicación es una lista simple (S-06) y PER define tres niveles (Sede, Piso, Sala), ambos para la Etapa 2. **HECHO:** Área y Tipo de puesto son entidades nuevas que no están en la lista de catálogos del núcleo. **HECHO:** "Persona responsable" está en el área (PER) y en el centro de costo (RF-CAT-024). **HECHO:** el caso límite 11 de PER dice que al mover un Piso "cada equipo registra el movimiento", pero los equipos apuntan al nodo y no cambian al mover el nodo. **HECHO:** nadie dice de qué centro de costo es un activo (necesario para repartir depreciación). | Adoptar la jerarquía de PER ya en la Etapa 2 (`parent_id`, nivel de 1 a 3 con CHECK, nombre único por padre); mover un nodo **no** escribe movimientos por activo (el historial guarda la ruta en texto en el momento); subir Área y Tipo de puesto al núcleo (CAT); un solo lugar para el responsable del centro de costo; decidir el centro de costo del activo (¿hereda de la Persona o de la OC?) o declarar que la depreciación no se reparte por centro. | analista-funcional, ingeniero-datos |
| **H-DAT-17** | media | `proveedores-contratos` §6 ("Alerta enviada"), §5.2; `garantias-mantenimiento` §6 ("Alerta enviada"), RNF-GAR-002; `notificaciones` RF-NOT-024, RN-NOT-013; `licencias-software` RNF-LIC-006; `dominios-certificados` RNF-DOM-003 | **HECHO:** PRV y GAR definen cada uno su tabla "Alerta enviada" y NOT define "Aviso programado" con otra clave de no repetición. **HECHO:** los estados "Vencido" de contratos, licencias, dominios, certificados y garantías los cambia un proceso nocturno ("a más tardar 1 hora después de medianoche"); si el proceso falla, el estado miente. | Una sola tabla de avisos (la de NOT, clave empresa + regla + entidad + umbral + destinatario) y eliminar las dos "Alerta enviada". **Estado Vigente/Vencido calculado al leer** (con "hoy" en la zona de la empresa) en vez de guardado y cambiado por un proceso; se guardan solo las decisiones (renovado, cancelado, dado de baja). El proceso nocturno queda solo para emitir avisos y para la renovación automática de PRV. | analista-funcional (escuadrones A y B), arquitecto |
| **H-DAT-18** | media | D-018; RF-AUD-003, RF-AUD-005, RF-AUD-013; `cmdb-ligera` RNF-CMD-007; `licencias-software` RN-LIC-014; RN-INT-013 | **HECHO:** la auditoría recibirá cambios de todos los módulos, sincronizaciones de la CMDB, fallos de acceso, cada lectura de clave de licencia (una lectura que escribe), consultas a la propia auditoría, exportaciones e importaciones de hasta 5.000 filas, durante 5 años. | Tabla particionada por mes (la clave primaria incluye la fecha); índices (empresa, entidad, id, fecha) y (empresa, fecha); autor = membresía, integración o sistema; una entrada por lote con detalle en la tabla del lote; las lecturas auditadas pasan por una ruta de escritura aparte (el "GET" no corre en una transacción de solo lectura); archivado por partición con el rol `mantenimiento` (H-DAT-02). Prisma no gestiona particiones: se crean con SQL en la migración y se revoca el acceso directo a las particiones. | ingeniero-datos, arquitecto |
| **H-DAT-19** | media | RNF-010, RNF-011; `presupuesto-costos` §6 (cuota de depreciación, registro de costo), RNF-PRE-001, RNF-PRE-004; `reportes-tableros` RNF-REP-001; `mesa-de-ayuda` RNF-AYU-002 | **HECHO:** tablas calientes previsibles: movimientos, auditoría, registro de costo, cuotas de depreciación (100.000 activos × 36 meses), registro de envíos, notificaciones, uso de API, entregas de webhook, historial de casos. **OPINIÓN:** no necesitamos infraestructura especial (RNF-010), pero sí disciplina de índices. | Depreciación **calculada al leer** y guardada solo al cerrar el mes; `registro_de_costo` con clave de origen única y no editable (disparador); `saldo_stock` (empresa, SKU, ubicación) actualizado en la misma transacción con CHECK `>= 0`; índices GIN sobre los campos JSON solo para los marcados "filtrable"; buscador global con `pg_trgm` y `unaccent`; **todo índice empieza por `empresa_id`**; medir con 100.000 activos y 500.000 movimientos (RNF-REP-001) antes de agregar más índices; particionar solo auditoría, envíos y uso. | ingeniero-datos, qa-tester |
| **H-DAT-20** | media | `garantias-mantenimiento` S-GAR-02, RF-INV-001; `lineas-moviles` SUP-LIN-02; `licencias-software` SUP-LIC-03, SUP-LIC-13; `reportes-tableros` S-REP-05; `cmdb-ligera` RF-CMD-018 | **HECHO:** al activar un módulo con datos ya cargados hay cuatro migraciones previstas (fin de garantía a garantías del fabricante; número de línea del celular a la entidad Línea; clave en la serie a campo secreto; carga inicial de la CMDB). **OPINIÓN:** lo más barato es modelar hoy la forma final. | Desde la Etapa 4, crear la tabla `garantia` (una fila por activo) y dejar `garantia_fin` del activo como dato derivado; quitar "número de línea" del Celular desde el principio; `empresa_modulo(empresa, módulo, activo_desde)`; si aun así hay migración, simulacro sobre copia anonimizada y plan de vuelta atrás escrito (D-029). | ingeniero-datos, analista-funcional |
| **H-DAT-21** | media | D-005; RF-CAT-012; `mesa-de-ayuda` RF-AYU-008, §6 ("Valor de formulario") | **HECHO:** el núcleo guarda los campos personalizados como JSON validado; la mesa de ayuda propone otro mecanismo (una fila por caso y campo) para los formularios de sus servicios. | Un solo motor `definicion_campo` con ámbito (`sku`, `unidad`, `servicio_ayuda`) y las mismas reglas de D-005 (desactivar, no cambiar tipo, identificador estable); valores en JSON validado, no una fila por campo. | arquitecto, analista-funcional (escuadrón C) |
| **H-DAT-22** | media | RN-014 / S-18; muchas filas de "casos límite" ("ya fue tomado", "ya fue decidido", "ya fue cerrado"); RN-007; RN-013; `cmdb-ligera` RN-CMD-007; `lineas-moviles` §6 | **HECHO:** varios módulos repiten patrones sin una convención: edición simultánea, "una vigente a la vez", borrado solo de borradores, estados con transiciones, fechas. **OPINIÓN:** si cada desarrollador lo resuelve a su manera habrá 17 variantes. | Anexo con "convenciones de datos", aprobado por el arquitecto: (1) columna `version` para el aviso de edición simultánea; (2) relaciones "una abierta a la vez" = `desde`/`hasta` con índice único parcial (y exclusión de solapes cuando se permitan fechas pasadas); (3) borrado físico solo en estado Borrador y sin hijos, impuesto por política de la base; (4) estados con CHECK y una tabla de transiciones comprobada por una función; (5) `date` para fechas de calendario y `timestamptz` en hora universal; (6) `empresa_id` primera columna; (7) autor = membresía. | ingeniero-datos, arquitecto |
| **H-DAT-23** | media | D-010.5; RF-INV-019; `entregas-devoluciones` RN-ENT-014; RF-OC-035; RF-IMP-007; `presupuesto-costos` RF-PRE-009 | **HECHO:** D-010.5 decidió una sola tabla de movimientos para los dos modos de control, pero faltan detalles: de qué documento viene cada movimiento (recepción, acta, ajuste, lote), cómo se vincula, y qué movimientos mueven cantidad y cuáles solo cambian un estado. | `movimiento(empresa, secuencia, tipo, sku, activo opcional, ubicación origen y destino, cantidad, motivo, membresía)` con una columna de origen por tipo (recepción, acta, lote) con clave compuesta y CHECK de "solo una"; `saldo_stock` protegido con CHECK `>= 0`; los activos con serie llevan cantidad 1 y no tocan saldo. Si el modelo único complica las consultas, separar en dos tablas con la misma secuencia. | arquitecto, ingeniero-datos |
| **H-DAT-24** | media | `notificaciones` §6 (Notificación, Estado del correo), RF-NOT-030, RN-NOT-016; `entregas-devoluciones` §8; `onboarding-offboarding` §8 | **HECHO:** la notificación solo admite como destinatario a un Usuario, pero ENT, ONB y PER mandan avisos a Personas sin Usuario (RF-NOT-030). **HECHO:** el "estado del correo" (rebotes) no tiene empresa, y un rebote en A afectaría a B. **HECHO:** el registro de envíos guarda el correo 12 meses (dato personal). | Destinatario = membresía **o** Persona (CHECK de uno solo); el correo se resuelve al enviar. Estado del correo **global** accesible solo por dos funciones (consultar si es entregable y registrar un rebote), sin guardar de qué empresa vino (acordado con Seguridad). Registro de envíos: enmascarar el correo pasado un plazo que decida Cumplimiento. | analista-funcional (escuadrón C), ingeniero-datos, especialista-seguridad |
| **H-DAT-25** | baja | varios (agrupados) | **HECHO** (menores): (a) nombres que chocan: "Servicio" (catálogo AYU, EC Servicio, tipo de servicio de OS), "Categoría" (SKU y ayuda), "Asignación" (activo, puesto, línea, línea-equipo), "Contrato" (PRV y LIC), "Cola"; códigos `P-NNN` (pendiente), `P-NNNN` (Persona) y `P-PRV-01` (pantalla); `E-` y `D-` son prefijos de actas y también de escalados y decisiones; (b) Persona "Cesada" frente a "desactivar" en el núcleo (RF-PER-005) y los estados del Usuario (Invitado, Activo...); (c) un activo importado sin fecha de compra no tiene inicio de garantía (caso 2 de GAR): la plantilla debe aceptar el fin de garantía directo; (d) RF-PER-017 "por regularizar" necesita una marca en la tabla; (e) largos máximos (S-08) deben coincidir con las columnas (serie 64, motivo 500); (f) PER dice "referencia P-NNNN" y la anonimización dice "Persona dada de baja 0042": el número sale del mismo contador. | Glosario único de nombres de tablas (`servicio_catalogo`, `ec_servicio`, `tipo_servicio_os`, `asignacion_activo`, `asignacion_puesto`, `asignacion_linea`...); unificar "Cesada/desactivada/dada de baja" en una tabla de equivalencias; reservar prefijos; el resto, como arriba. | analista-funcional, ingeniero-datos |

### Escalado al CEO

**Ningún hallazgo nuevo requiere escalar.** Lo que se toca ya está escalado: legal e irreversible (H-DAT-02 y H-DAT-12: L1, L2, L5, I1 y D-032); dinero (H-DAT-05: el gestor de secretos debe entrar en la estimación D2 de DevOps); país e impuestos (H-DAT-13: P-004). Todo lo demás lo decide el gerente-ti.

---

## 3. Mapa de entidades (alto nivel, en lenguaje simple)

Cada fila dice qué es la cosa y con qué se relaciona principalmente. Todas las entidades de negocio llevan **empresa** (por eso no se repite). "Global" quiere decir que no pertenece a ninguna empresa (H-DAT-01). Entre paréntesis, el módulo dueño.

### 3.1 Plataforma y acceso

| Entidad | Qué es | Relación principal |
|---|---|---|
| Empresa | Una organización cliente | Tiene todo lo demás; guarda moneda base, país, zona horaria, módulos activos y excepciones |
| Usuario (global) | La cuenta de una persona, identificada por su correo | Tiene una o varias membresías |
| Membresía | El usuario dentro de una empresa, con rol y estado | Pertenece a un usuario y a una empresa; es el "autor" de todo lo que se hace (H-DAT-03) |
| Rol y permisos | Lo que puede hacer una membresía | Pertenece a la empresa; se copia de una plantilla |
| Invitación | Permiso para entrar a una empresa | Ligada a un correo y, si es del portal, a una Persona |
| Administrador de plataforma | Quien crea y suspende empresas | Vive fuera de las empresas; sin acceso a datos del negocio |
| Aceptación del aviso de privacidad | Constancia de consentimiento | Pertenece a la membresía |
| Contador | Siguiente número de cada serie de códigos | Una fila por empresa y clave (H-DAT-10) |

### 3.2 Personas, estructura y referencias

| Entidad | Qué es | Relación principal |
|---|---|---|
| Persona | Quien recibe equipos (empleado, externo, custodio) | Puede estar ligada a una membresía; tiene área, jefe, centro de costo y ubicación habitual (PER) |
| Área / Tipo de puesto | Departamentos y clases de cargo | La Persona pertenece a un área (PER) |
| Centro de costo | A quién se le carga un gasto | Lo usan Persona, área, OC, contratos, licencias, líneas, dominios y presupuesto |
| Ubicación | Sede, piso o sala | Árbol de tres niveles; la usan activos, stock y personas (PER) |
| Proveedor y contactos | A quien se compra o contrata | Lo usan OC, OS, contratos, líneas (operador), dominios (registrador), garantías (PRV) |
| Monedas, países, unidades de medida | Tablas de referencia | Las monedas y países son globales; las unidades de medida son de la empresa |

### 3.3 Artículos y campos

| Entidad | Qué es | Relación principal |
|---|---|---|
| Categoría y subcategoría | Agrupación con prefijo del código | Define los campos que heredan sus SKU |
| Definición de campo | Un campo personalizado | Pertenece a una categoría; dice si es del SKU o de la unidad, y si es identificador o secreto (H-DAT-05) |
| Marca y modelo | Catálogos | El modelo depende de una marca |
| SKU | Tipo de artículo con código y modo de control | Tiene categoría, marca, modelo, unidad de medida; valores de sus campos |

### 3.4 Inventario

| Entidad | Qué es | Relación principal |
|---|---|---|
| Activo | Una unidad física con serie | Pertenece a un SKU; tiene estado, ubicación, costo y moneda, y opcionalmente la OC de origen |
| Identificador de unidad | IMEI y otros datos únicos de la unidad | Pertenece a un activo (H-DAT-05) |
| Asignación | Quién tiene el activo y desde cuándo | Une activo con Persona; solo una abierta por activo (ENT) |
| Acta de entrega / devolución | Constancia con número | Tiene líneas (activos) y accesorios; apunta a una Persona (ENT) |
| Reporte de extravío | Hecho de pérdida o robo | Pertenece a un activo y a una asignación (ENT) |
| Movimiento | Historial de ingresos, salidas, traslados, ajustes, cambios de estado | Pertenece a un SKU y, si hay serie, a un activo |
| Saldo de stock | Cuánto hay de un SKU por cantidad en una ubicación | Una fila por SKU y ubicación; nunca negativa |

### 3.5 Compras, servicios e importación

| Entidad | Qué es | Relación principal |
|---|---|---|
| Orden de compra y sus líneas | Pedido a un proveedor | Líneas de SKU con precio, impuesto y moneda; centro de costo opcional |
| Aprobación de OC | Decisión de quien aprueba | Pertenece a la OC; guarda quién y por qué monto |
| Recepción y sus líneas | Llegada de mercadería | Pertenece a una OC; sus líneas crean activos o stock; necesita número (H-DAT-10) |
| Orden de servicio | Trabajo de reparación, instalación o externo | Apunta a activo, solicitante y ejecutor (persona o proveedor); falta definir costo real (H-DAT-07) |
| Lote de importación y sus filas | Carga masiva de un archivo | Cada fila creada queda ligada al lote para poder deshacerlo (H-DAT-11) |

### 3.6 Auditoría

| Entidad | Qué es | Relación principal |
|---|---|---|
| Entrada de auditoría | Quién hizo qué y cuándo | Apunta a la entidad por identificador; nunca guarda nombre, correo ni área (D-030) |
| Registro de anonimizaciones | Lista de personas ya anonimizadas | Fuera de la base que se restaura (H-DAT-02) |

### 3.7 Contratos y vencimientos (fase 2)

| Entidad | Qué es | Relación principal |
|---|---|---|
| Contrato (PRV) | Acuerdo con un proveedor con vigencia y valor | Proveedor, centro de costo, responsable; tiene cambios de condiciones, SLA y activos cubiertos |
| Contrato de licencia (LIC) | Compra de puestos de un software | Debería extender al contrato PRV (H-DAT-08); producto = SKU; tiene asignaciones de puesto e informes de uso |
| Línea móvil, plan y cargo del plan | Servicio telefónico | La línea tiene un plan, una Persona responsable y un equipo asociado, todo con fechas |
| Dominio y certificado | Nombre de internet y certificado digital | Registrador/emisor = proveedor; responsable y suplente = Persona; el certificado cubre dominios |
| Garantía, reclamo, plan de mantenimiento y mantenimiento | Cobertura y trabajos sobre un activo | Cuelgan del activo; el garante y el ejecutor externo son proveedores |

### 3.8 Mesa de ayuda y procesos

| Entidad | Qué es | Relación principal |
|---|---|---|
| Caso, comentarios, medición de SLA, encuesta | Pedido de ayuda | El solicitante es una Persona; se vincula a activos, órdenes de servicio y otros casos |
| Servicio del catálogo, cola, calendario, política de SLA | Configuración de la mesa | Pertenecen a la empresa |
| Artículo de conocimiento y versiones | Base de conocimiento | Las versiones publicadas no cambian |
| Cambio, plantilla estándar, ventana, aprobación de cambio | Gestión de cambios | El cambio afecta a elementos de la CMDB |
| Problema, error conocido y vínculos | Causa común de incidentes | Vincula incidentes, cambios y elementos |
| Proceso y tareas de ingreso/salida, plantillas | Onboarding y offboarding | El proceso pertenece a una Persona |

### 3.9 CMDB

| Entidad | Qué es | Relación principal |
|---|---|---|
| Elemento de configuración | Ficha delgada que apunta a un activo, licencia, línea, dominio, Persona o servicio | Debe crearse junto al origen y no copiar sus datos (H-DAT-15) |
| Relación | "A depende de B", "instalado en", "usa" | Une dos elementos de la misma empresa, con fechas |

### 3.10 Costos, reportes e integraciones

| Entidad | Qué es | Relación principal |
|---|---|---|
| Presupuesto, líneas y modificaciones | Plan de gasto anual | Una moneda por presupuesto; líneas por centro de costo y rubro |
| Registro de costo | Hecho de gasto que no se edita | Apunta a su origen (OC, contrato, licencia, línea...); una sola vez (H-DAT-07) |
| Gasto manual, periodo, parámetros y cuota de depreciación | Complementos de costos | Cuotas por activo y mes (conviene calcular al leer, H-DAT-19) |
| Vista guardada, programación, foto mensual | Reportes | Pertenecen a la membresía o a la empresa |
| Integración, clave de API, webhook, entrega, equivalencia externa, lote SAP | Conexiones con otros sistemas | La clave pertenece a una empresa y se busca por huella (H-DAT-01) |

### 3.11 Notificaciones

| Entidad | Qué es | Relación principal |
|---|---|---|
| Tipo de evento y estado del correo | Catálogo y estado de entrega | **Globales** (solo por funciones) |
| Evento, notificación, preferencias, plantilla, envío, aviso programado | Avisos | Destinatario = membresía o Persona (H-DAT-24) |

### 3.12 Dónde chocan o se repiten (resumen)

| Tema | Dónde choca | Resolución propuesta |
|---|---|---|
| Proveedor | Catálogo del núcleo, ficha PRV, operador (LIN), registrador/emisor (DOM), garante (GAR) | Una sola tabla; los demás la referencian (de acuerdo entre escuadrones) |
| Persona y usuario | Responsable es Usuario en PRV/GAR y Persona en LIC/LIN/DOM/CMDB | H-DAT-03 y H-DAT-08: Persona con vínculo opcional a membresía |
| Centro de costo | Núcleo, PER, PRE y cada módulo con costo; responsable en dos lugares | H-DAT-16 |
| Costo | Siete lugares | H-DAT-07 |
| Vencimientos | PRV, LIC, LIN (permanencia), DOM, GAR; dos tablas de alertas más NOT | H-DAT-17 |
| Ubicación | Lista simple (núcleo) frente a árbol (PER) | H-DAT-16 |
| Clave de licencia frente a serie | D-011.2 frente a SUP-LIC-03 | H-DAT-05 |
| Número de línea frente a campo de unidad | D-005/§9.3 frente a SUP-LIN-02 | H-DAT-05 |
| Asignación | Cuatro tablas más la relación "asignado a" de la CMDB | Patrón común (H-DAT-22) y CMDB derivada (H-DAT-15) |
| Contrato | CTR (PRV) y CLI (LIC) | H-DAT-08 |

---

## 4. Anexos

### Anexo A. Reglas de unicidad (resumen para el diseño)

| Qué | Clave única | Condición o normalización |
|---|---|---|
| Cuenta de usuario | correo normalizado | Global |
| Membresía | empresa + usuario | |
| Código de SKU | empresa + código normalizado | Sin mayúsculas ni espacios |
| Prefijo de categoría | empresa + prefijo | 2 a 5 caracteres; lista de reservados |
| Serie | empresa + SKU + serie normalizada | Excluye registros "anulado por lote" |
| Identificador de unidad (IMEI...) | empresa + definición + valor normalizado | Solo campos marcados "identificador" |
| Asignación abierta | activo | Parcial: `hasta` vacío |
| Saldo de stock | empresa + SKU + ubicación | CHECK `>= 0` |
| Saldo inicial | empresa + SKU + ubicación | Solo movimientos de tipo saldo inicial no anulados |
| Proveedor | empresa + identificación fiscal normalizada | Solo cuando no está vacía |
| Persona | empresa + correo normalizado; empresa + código de empleado | Parcial: no anonimizadas |
| Persona con membresía | membresía | 1 a 1 por empresa |
| Dominio | empresa + nombre normalizado | Parcial: no dados de baja |
| Línea móvil | empresa + número normalizado; empresa + ICCID | Número parcial: no dadas de baja |
| Certificado | empresa + emisor + número de serie | Cuando se escribe |
| Puesto de licencia | contrato + Persona | Parcial: `hasta` vacío; capacidad con contador |
| SLA de contrato | contrato + métrica + prioridad | |
| Relación CMDB | empresa + origen + destino + tipo | Parcial: vigentes |
| Incidente en problema | incidente | Un vínculo vigente |
| Presupuesto | empresa + año + moneda | Parcial: Aprobado |
| Registro de costo | empresa + origen + clave de origen + tipo de hecho | No se edita |
| Cuota de depreciación | activo + mes | |
| Aviso | empresa + regla + entidad + umbral + destinatario | |
| Evento | empresa + identificador de evento | Idempotencia |
| Equivalencia externa | empresa + sistema + tipo + código externo | |
| Archivo importado | empresa + huella | Parcial: confirmado |
| Correlativos | empresa + clave | Con espacio de nombres |

### Anexo B. Catálogo de correlativos

| Clave | Ejemplo | Dónde se define | Observación |
|---|---|---|---|
| SKU por categoría | `LAP-0001` | D-007, RF-SKU-003 | Mínimo 4 dígitos |
| Orden de compra | `OC-0042` (usado en PRE; el documento no fija el formato) | RF-OC-003 | Definir formato |
| Orden de servicio | sin formato | RF-OS-005 | Definir formato |
| Recepción | **sin número** | RF-OC-029 | Falta; propongo `RCP-` |
| Acta de entrega / devolución | `E-000001` / `D-000001` | RN-ENT-005 | 6 dígitos |
| Persona | `P-0042` | RN-PER-004 | La anonimización usa el mismo número |
| Contrato (PRV) | `CTR-0001` | RF-PRV-009 | |
| Contrato de licencia | `CLI-000123` | LIC §6 | Ver H-DAT-08 |
| Reclamo de garantía | `REC-0001` | GAR §6 | `REC` se confunde con recepción |
| Mantenimiento | `MNT-0001` | GAR §6 | |
| Cambio | `CAM-0001` | CAM §2 | Puede coincidir con una categoría "Cámaras" |
| Problema | `PRB-0001` | PRB §2 | |
| Caso de ayuda | `AYU-000123` | AYU §2 | |
| Artículo de conocimiento | `KB-0001` | AYU §2 | |
| Elemento de configuración | `EC-00001` | CMD §2 | 100.000 en la carga inicial: reservar bloque |
| Modificación presupuestaria, gasto manual | correlativo, sin formato | PRE §6 | Definir formato |
| Programación de reportes | correlativo, sin formato | REP §6 | Definir formato |
| Lote de importación / lote SAP | `0007` | D-020.5, INT §9 | Definir formato |

---

## 5. Veredicto y condiciones

**Veredicto: CONFORME CON OBSERVACIONES.**

El conjunto es coherente en lo esencial y no obliga a rehacer los módulos. Pero el modelo de datos tiene seis decisiones que, si se dejan para después, se vuelven migraciones con datos reales (criterio de decisiones.md: "lo que obligaría a rehacer datos si se decide tarde, se decide hoy").

**Condiciones, por etapa:**

| Antes de | Condición | Hallazgos |
|---|---|---|
| **Primera tabla de la Etapa 1** | Rutas de acceso sin empresa conocida, roles de base y prototipo de aislamiento ampliado (con tabla particionada, índice parcial y consulta recursiva) | H-DAT-01 |
| | Cuenta global frente a membresía como autor de todo | H-DAT-03 |
| | Auditoría: clases de campo, autor "sistema", partición, rol de mantenimiento y registro de anonimizaciones fuera de la base | H-DAT-02, H-DAT-18, H-DAT-09 (solo el autor) |
| | Contadores con espacio de nombres y reserva de bloques; recepción con número | H-DAT-10 |
| | Convenciones de datos (versión, vigencia, borradores, fechas) y normalización de claves | H-DAT-22, H-DAT-14 |
| | `pais`, `zona_horaria` y monedas de referencia en la empresa | H-DAT-13 |
| **Etapa 2** | Campos de unidad "identificador" y "secreto"; retirar "número de línea" del celular | H-DAT-05 |
| | Ubicación en árbol; Área y Tipo de puesto en el núcleo | H-DAT-16 |
| | Motor único de campos personalizados | H-DAT-21 |
| **Etapa 4** | Regla S-29 hecha cumplir en la base; secuencia de movimientos; movimientos y saldo | H-DAT-04, H-DAT-23 |
| | Marco común de importación y columnas de costo, fecha de compra y garantía | H-DAT-11 |
| | Tabla `garantia` desde el principio | H-DAT-20 |
| | Función `anonimizar_persona()` y registro de datos personales | H-DAT-12 |
| **Antes de activar cualquier módulo de fase 2** | Un solo contrato (PRV con extensión de licencia), un solo patrón de costo, un solo motor de avisos y estados calculados | H-DAT-07, H-DAT-08, H-DAT-17 |
| | Reglas de puestos de licencia, CMDB delgada y eventos entre módulos | H-DAT-06, H-DAT-15, H-DAT-09 |
| **Etapa 6** | Campos de costo y garantía en la orden de servicio | H-DAT-07 |

**Lo que no depende de mí y queda abierto:** el Excel real (P-007) y las cifras de volumen (P-003) siguen siendo lo que más puede mover el modelo; la regla de redondeo y el país (P-004) afectan a impuestos y a SAP.

---

## 6. Mensajes

Los mensajes que envié y recibí están, literales y en orden, en `docs/revision-cruzada/mensajes-ingeniero-datos.md`.

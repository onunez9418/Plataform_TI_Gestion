# Índices únicos y claves naturales: qué es único, dónde y hasta cuándo

**Autor:** Ingeniero de Datos / DBA · **Fecha:** 2026-10-26 · **Estado:** Entregado (P2 de `docs/equipo/plan-aplicacion.md`; D-070.6 pidió esta revisión)
**Base:** `docs/documento-funcional.md` (RN-004, RN-005, RN-012, RF-SKU, RF-INV, RF-IMP, RF-CAT y los demás requisitos citados), los 17 módulos de `docs/modulos/`, D-050, D-070, D-079 y los ADR 06, 15, 17 y 18.
**No es esquema real:** es la especificación que usará la primera migración. Los nombres de tabla y columna son los propuestos por Datos (singular, español, `snake_case`, ADR-06) y el Arquitecto puede ajustarlos sin cambiar la regla.

## Para la Jefatura, sin jerga

Aquí está la lista completa de "esto no puede repetirse" de toda la plataforma: el código de un artículo, la serie de un equipo, el número de una línea, el nombre de un dominio, el correo de una persona, el número de una orden. Para cada una dice **dentro de qué** no puede repetirse (siempre dentro de una empresa; otra empresa puede repetir el mismo valor), **en qué momento deja de contar** (por ejemplo, un equipo dado de baja sigue ocupando su serie para siempre, pero un dominio dado de baja libera su nombre) y **qué requisito del documento funcional lo exige**. Con esto la base de datos impide el duplicado aunque dos personas lo intenten al mismo tiempo, y el programa solo se ocupa de mostrar un mensaje claro. No hay nada que decidir por parte del CEO.

## Cómo leer las tablas

**Clase** (cuándo se libera la clave):
- **P, permanente:** nunca se libera. Se desactive, se dé de baja o se anule lo que sea, el valor sigue ocupado. Es el caso del código de SKU (RF-SKU-004), de la serie de un activo (RF-INV-004) y de todos los números correlativos (RN-004). Índice sin condición, o con `IS NOT NULL` solo para ignorar los opcionales vacíos.
- **L, se libera al anular:** `anulado_en IS NULL`. Lo anulado es lo creado por un lote de importación que se deshizo (D-050.5) o un documento anulado; sale de los conteos y de la unicidad y conserva su historial.
- **B, se libera al dar de baja o desactivar:** `baja_en IS NULL` (y, si el registro puede anularse, también `anulado_en IS NULL`). Es el caso del número de línea y del dominio (RN-LIN-002, RN-DOM-002).
- **V, vigente / abierta:** `hasta IS NULL` o `cerrado_en IS NULL`: solo una fila abierta a la vez; el historial cerrado no choca (patrón 1 de ADR-15).
- **A, se libera al anonimizar:** el valor pasa a NULL y el índice ignora los nulos (correo y código de empleado, RN-PRS-005).
- **—:** índice de apoyo que **no** es único (sirve para avisar o para buscar).

**Fuente** (de dónde sale): **E** explícita (un requisito lo dice con esas palabras), **D** derivada (se sigue de una regla o de una decisión), **I** inferida (Datos la propone porque falta la regla escrita; el Analista la confirma o la corrige, ver las preguntas al final).

**Convenciones de índice (ADR-06):**
1. Toda tabla de negocio tiene `empresa_id` y su clave **empieza por `empresa_id`**: la unicidad es siempre "dentro de la empresa". Las pocas claves globales llevan "(global)".
2. `*_norm` es la columna normalizada: minúsculas y espacios de los bordes fuera, con la regla propia de cada clave (correo: Unicode sin quitar puntos ni `+`; fiscal: sin espacios ni guiones; número de línea: solo dígitos con código de país; dominio: forma técnica sin `www.`). Se calcula con una función `IMMUTABLE` y versionada o, si necesita una biblioteca, la calcula el servicio y la base exige el formato (D06-1).
3. Los predicados **solo usan `IS NULL` / `IS NOT NULL` y comparaciones con constantes fijas**: nunca listas de estados que cambian, ni `now()`. `baja_en` marca tanto "dado de baja" como "desactivado" donde la regla libera la clave.
4. Un `CHECK` mantiene coherente la marca con el estado (`estado = 'baja' <=> baja_en IS NOT NULL`), de modo que el índice no depende de que el programa se acuerde de ambas cosas.
5. Cuando un campo de la clave puede ser nulo y aun así debe contarse (nivel raíz de las ubicaciones), `UNIQUE ... NULLS NOT DISTINCT` (PostgreSQL 15 o superior).
6. Los hechos que crean registros por duplicado en una carrera (dos personas, doble clic) se resuelven con el índice: el programa captura el error `23505`, identifica el índice por su nombre y devuelve el mensaje de la regla.

## Cómo se obtuvo (scripts, no a mano)

1. `grep`/`python3` sobre `docs/documento-funcional.md` y `docs/modulos/*.md` con las palabras "único", "única", "duplic", "repet", "ya existe", "normaliz", "a la vez", "una abierta", "vigente", "1 a 1", "solo una", "sin repetir" y similares, quedándose con las filas que traen un identificador RN, RF, SUP o CA (354 líneas en una primera pasada, 216 en las filas de reglas de los módulos).
2. Un segundo script (`python3`) extrae de cada módulo la tabla de datos (§6) cuya cabecera dice "Unicidad" o "Clave y unicidad" y la línea "Unicidad:" de cambios y problemas: **73 entidades con unicidad declarada** en las tablas de 7 módulos (garantías, integraciones, mesa de ayuda, notificaciones, presupuesto, proveedores, reportes) más las líneas "Unicidad:" de cambios y problemas.
3. Los módulos que no usan esa tabla (CMDB, dominios, licencias, líneas, entregas, altas y bajas, personas, portal) se leyeron en su sección "6. Datos" y en sus reglas RN con el mismo vocabulario.
4. Un tercer script comprobó el resultado: **todo identificador citado en este documento existe** en el documento funcional, los módulos o las decisiones, y **toda entidad con unicidad declarada** en los módulos tiene su fila aquí (resultado al final).


## Resumen

**138 claves** en 17 áreas: P permanentes 102, L al anular 9, B al dar de baja 4, V vigentes 17, A al anonimizar 4, apoyo (no únicas) 2. Por fuente: explícitas 115, derivadas 7, inferidas 16.

Las tres que más se prestan a error y por eso tienen su propia advertencia:

1. **Código de SKU y serie de activo no son parciales por estado.** Un SKU desactivado conserva su código y un activo "De baja" o "Extraviado" conserva su serie (RF-SKU-004, RF-INV-004). Lo único que libera una serie es que el lote que la creó se deshaga. Un índice con `WHERE estado <> 'baja'` sería un defecto.
2. **Número de línea y nombre de dominio sí se liberan al dar de baja** (RN-LIN-002, RN-DOM-002), pero el **reingreso** de una línea (RN-LIN-021) usa el mismo registro: al quitar `baja_en`, el mismo índice vuelve a comprobar y rechaza el reingreso si otro registro ya ocupa ese número.
3. **Persona: homónimos permitidos, correo y código de empleado no.** No hay índice sobre el nombre (RF-PER-010); el correo y el código de empleado son únicos entre las personas no anonimizadas (RN-PRS-005).

## A. Plataforma, acceso y mecanismos del núcleo (Etapa 1)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| A1 | `empresa` | `(slug)` | — | P | ADR-05; RF-ACC-002 | E | Único en toda la plataforma e inmutable. La unicidad la verifica el índice aunque la seguridad por fila oculte filas ajenas; la crea solo `empresa_crear` (DEFINER). |
| A2 | `cuenta_usuario` (global) | `(correo_norm)` | `WHERE correo_norm IS NOT NULL` | A | RF-ACC-010; RS-05; CA-005 | E | Comparación Unicode en minúsculas, sin quitar puntos ni etiquetas `+`. Anonimizar la cuenta (D-041.2) pone NULL y libera el correo. |
| A3 | `membresia` | `(empresa_id, cuenta_usuario_id)` | — | P | RF-ROL-001; RF-USR-002; RF-ACC-009 | D | Una cuenta tiene una sola membresía por empresa; reactivar reutiliza la fila (un usuario nunca se borra). |
| A4 | `rol` | `(empresa_id, nombre_norm)` | — | P | RF-ROL-002 | I | Los siete roles plantilla se copian a cada empresa con su nombre; dos roles con el mismo nombre en una empresa confundirían a quien asigna. |
| A5 | `invitacion` | `(huella)` | — | P | RF-ACC-007; RS-51 | E | Solo la huella (ADR-09). Global o de empresa según D04-2 de `revision-datos.md`. |
| A6 | `invitacion` | `(empresa_id, correo_norm)` | `WHERE cerrada_en IS NULL` | V | RF-ACC-007 | I | Una invitación pendiente por correo y empresa; invitar de nuevo cancela la anterior en la misma transacción. `cerrada_en` se llena al usarla, cancelarla o vencer (el vencimiento por reloj no puede estar en un índice). |
| A7 | `enlace_ingreso` (global) | `(huella)` | — | P | RF-ACC-006; RS-51 | E | También únicas las huellas del navegador y del código corto por enlace. |
| A8 | `sesion` (global) | `(huella)` | — | P | RS-51; RF-ACC-013 | E |  |
| A9 | `clave_api` | `(huella)` y `(identificador_publico)` | — | P | integraciones-api §6 (Clave de API); RS-51 | E | "Identificador público único y global; huella única". |
| A10 | `administrador_plataforma` (global) | `(cuenta_usuario_id)` | — | P | RF-PLA-001 | D | Una persona de plataforma por cuenta. |
| A11 | `moneda`, `pais`, `tipo_evento` (globales) | `(codigo)` | — | P | RF-EMP-001; notificaciones §6 (Tipo de evento) | E | Clave primaria natural: ISO 4217, ISO 3166 y código `<modulo>.<entidad>_<hecho>`. |
| A12 | `estado_correo` (global) | `(proveedor_correo_id)` o la huella del mensaje | — | P | notificaciones §6 (Estado del correo) | E | Uno por correo enviado. |
| A13 | `resumen_no_leidas` (global) | `(membresia_id, empresa_id)` | — | P | notificaciones §6 (Resumen de no leídas) | E |  |
| A14 | `limite_uso` (global) | `(clave_huella, tipo, ventana_inicio)` | — | P | notificaciones §6 (Límite); RF-NOT-019 | E | "Uno por ámbito y tipo" más la ventana. Ver D04-4 (posible `UNLOGGED`). |
| A15 | `purga_acta` (global) | `(tabla_origen, mes)` | — | P | RF-AUD-016 | I | Un mes de una tabla particionada se purga una vez. |
| A16 | `contador` | `(empresa_id, clave)` | — | P | RN-004; RF-SKU-004 | E | Clave primaria. ADR-15. |
| A17 | `idempotencia` | `(empresa_id, clave)` | — | P | RF-OC-033; RN-ENT-020; CA-035 | E | Patrón 4 de ADR-15; expira a las 24 horas. |
| A18 | `corrida_diaria` | `(empresa_id, tarea, fecha_logica)` | — | P | RNF-021; CA-077; presupuesto-costos §6 (Corrida de trabajo); reportes-tableros §6 (Corrida de trabajo) | E | Una corrida por empresa, tarea y día lógico: hace idempotente el programador. |
| A19 | `evento_dominio` | `(empresa_id, id)` | — | P | RF-NOT-002; notificaciones §6 (Evento emitido) | E | "El mismo identificador avisa una sola vez". |
| A20 | Tablas de configuración de la empresa (`parametros_garantia`, `configuracion_cmdb`, `configuracion_portal`, `configuracion_licencias`, `configuracion_dominios`, `configuracion_presupuesto`, `parametros_reportes`, `preferencias_empresa_notificaciones`, `metodo_ingreso`, `valores_fijos_exportacion`) | `(empresa_id)` | — | P | garantias-mantenimiento §6 (Parámetros); notificaciones §6; presupuesto-costos §6 (Configuración); reportes-tableros §6; integraciones-api §6 (Método de ingreso) | E | Una fila por empresa; clave primaria `(empresa_id)`. |

## B. Catálogos, categorías y campos (Etapa 2)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| B1 | `marca` | `(empresa_id, nombre_norm)` | — | P | RF-CAT-001; RF-CAT-004 | I | Un valor de catálogo no se borra: se desactiva y sigue ocupando su nombre; se reactiva en vez de duplicar. |
| B2 | `modelo` | `(empresa_id, marca_id, nombre_norm)` | — | P | RF-CAT-001 | I | "Modelo depende de una marca". |
| B3 | `unidad_medida` | `(empresa_id, nombre_norm)` | — | P | RF-CAT-005 | I |  |
| B4 | `ubicacion` | `(empresa_id, ubicacion_superior_id, nombre_norm)` con `NULLS NOT DISTINCT` | — | P | RF-CAT-006; RN-PRS-023; CA-060a | E | Nombre único por superior; el nivel raíz tiene superior nulo y debe contarse. Requiere PostgreSQL 15 o superior. |
| B5 | `ubicacion` | `(empresa_id, codigo_externo_norm)` | `WHERE codigo_externo_norm IS NOT NULL` | P | RN-PRS-023; RF-CAT-023 | E | El código externo de proveedor y centro de costo es "solo un dato" (RF-CAT-023): no se hace único. |
| B6 | `area` | `(empresa_id, nombre_norm)` | — | P | personas-ubicaciones §6 (Área) | E | "Nombre único por empresa". |
| B7 | `area` | `(empresa_id, codigo_norm)` | `WHERE codigo_norm IS NOT NULL` | P | personas-ubicaciones §6 (Área) | I | Código opcional. |
| B8 | `centro_costo` | `(empresa_id, nombre_norm)` | — | P | RF-CAT-024 | I |  |
| B9 | `tipo_puesto` | `(empresa_id, nombre_norm)` | — | P | RF-CAT-024 | I |  |
| B10 | `proveedor` | `(empresa_id, id_fiscal_norm)` | `WHERE id_fiscal_norm IS NOT NULL` | P | RN-PRV-001; RF-CAT-025; RF-IMP-005; CA-PRV-01 | E | Sin espacios, guiones ni minúsculas; puede quedar vacía con aviso. Un proveedor desactivado sigue ocupando su identificación. |
| B11 | `contacto_proveedor` | `(empresa_id, proveedor_id, correo_norm)` | `WHERE correo_norm IS NOT NULL` | A | RN-PRV-008; RF-CAT-026 | E | Se anonimiza a los 2 años inactivo: el correo pasa a NULL y se libera. |
| B12 | `contacto_proveedor` | `(empresa_id, proveedor_id)` | `WHERE principal AND baja_en IS NULL` | B | RN-PRV-009 | E | Como máximo un contacto principal activo por proveedor. |
| B13 | `categoria` | `(empresa_id, prefijo)` | `WHERE categoria_padre_id IS NULL` | P | RF-CAT-008; RF-CAT-009; CA-017 | E | La subcategoría usa el prefijo de su categoría principal, por eso solo las raíces compiten. `CHECK (prefijo NOT IN (<19 reservados + ACTV>))` generado desde la misma constante del código (D-079). |
| B14 | `categoria` | `(empresa_id, categoria_padre_id, nombre_norm)` con `NULLS NOT DISTINCT` | — | P | RF-CAT-007; RF-CAT-009 | I |  |
| B15 | `campo_definicion` | `(empresa_id, ambito, categoria_id, clave)` | — | P | RF-CAT-021; RF-CAT-017 | D | Identificador interno estable; cambiar el nombre no rompe los datos. Para `servicio_ayuda` la columna es `servicio_id`. |
| B16 | `campo_definicion` | `(empresa_id, ambito, categoria_id, nombre_norm)` | `WHERE baja_en IS NULL` | B | RF-CAT-012; RF-CAT-017 | I | Un campo con datos se desactiva (libera el nombre para un campo nuevo). La herencia de nombres con la categoría principal la comprueba un disparador (RF-CAT-010). |
| B17 | `campo_opcion` | `(empresa_id, definicion_id, valor_norm)` | — | P | RF-CAT-020 | I | Las opciones en uso se desactivan, no se borran. |
| B18 | `identificador_unico` | `(empresa_id, definicion_id, valor_norm)` | `WHERE anulado_en IS NULL` | L | RF-CAT-012; RF-CAT-029; CA-065a; CA-065b; D-050.4 | E | IMEI y número de línea mientras no exista Líneas. Dos empresas con el mismo IMEI: permitido. Anular la unidad (lote deshecho) propaga la marca. Ver D17-1. |
| B19 | `valor_secreto` | `(empresa_id, activo_id | sku_id, definicion_id)` | — | P | RF-CAT-028 | D | Un valor por campo y entidad; dos columnas por tipo con `CHECK` de una sola llena (D-039.7). |

## C. Maestro de SKU e inventario (Etapas 3 y 4)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| C1 | `sku` | `(empresa_id, codigo_norm)` | — (sin condición) | P | RF-SKU-002; RF-SKU-004; RN-012; CA-017; CA-018 | E | **No es parcial a propósito:** un código no se reutiliza nunca, aunque el SKU esté desactivado. Otra empresa puede repetirlo. |
| C2 | `activo` | `(empresa_id, sku_id, serie_norm)` | `WHERE serie_norm IS NOT NULL AND anulado_en IS NULL` | L | RF-INV-002; RF-INV-004; RF-INV-006; RN-005; CA-023; CA-028; RF-IMP-005 | E | Un activo "De baja" o "Extraviado" **sigue ocupando su serie** (una unidad física es un solo registro para siempre; reingreso = mismo registro). Solo un lote deshecho la libera. Corregir una serie (RF-INV-007) actualiza `serie_norm` y se re-comprueba. |
| C3 | `activo` (apoyo, no único) | `(empresa_id, serie_norm)` | `WHERE serie_norm IS NOT NULL` | — | RF-INV-003 | E | La misma serie en otro SKU de la misma empresa se acepta con aviso: el índice solo sirve para encontrarla. |
| C4 | `activo` | `(empresa_id, codigo_visible)` | — | P | RF-INV-034; D-079 | E | `ACTV-NNNNNN`, correlativo por empresa, no se reutiliza, ni siquiera si el activo se anula. |
| C5 | `asignacion` | `(empresa_id, activo_id)` | `WHERE hasta IS NULL` | V | RF-INV-013; RF-INV-024; RN-ENT-003; CA-025 | E | Una asignación abierta por activo, aunque dos técnicos entreguen a la vez. Además `EXCLUDE` contra solape del historial (ver abajo). |
| C6 | `stock_saldo` | `(empresa_id, sku_id, ubicacion_id)` | — | P | RF-INV-019; RF-INV-020; CA-026 | E | Clave primaria; `CHECK (cantidad >= 0)` (patrón 3 de ADR-15). |
| C7 | `movimiento_stock` | `(empresa_id, sku_id, ubicacion_id)` | `WHERE tipo = 'saldo_inicial' AND anulado_en IS NULL` | L | RF-IMP-005; D-050.4 | E | Un solo saldo inicial por SKU y ubicación. Deshacer el lote lo anula con un movimiento contrario y libera la clave. |
| C8 | `acta` | `(empresa_id, numero)` | — | P | RF-INV-016; RN-004; entregas-devoluciones §6 (Acta) | E | `ACT-E-` y `ACT-D-` con contadores propios; una acta anulada conserva su número. |
| C9 | `acta_linea` | `(empresa_id, acta_id, activo_id)` | — | P | RN-ENT-022 | I | Un acta tiene una sola Persona; un mismo activo no entra dos veces al mismo acta. |

## D. Órdenes de compra, recepción y servicio (Etapas 5 y 6)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| D1 | `orden_compra` | `(empresa_id, numero)` | — | P | RF-OC-003; RF-OC-046; RN-004; CA-018 | E | `OC-NNNNNN`; una orden anulada o rechazada conserva su número. |
| D2 | `orden_compra_linea` | `(empresa_id, orden_id, sku_id)` | — | P | RF-OC-004; CA-032 | E | El mismo SKU no se repite en dos líneas. Las líneas de una orden en Borrador se pueden borrar físicamente (RN-007). |
| D3 | `recepcion` | `(empresa_id, numero)` | — | P | RF-OC-029; RF-OC-046; CA-018 | E | `RCP-NNNNNN`. |
| D4 | `recepcion_serie` (borrador) | `(empresa_id, recepcion_id, sku_id, serie_norm)` | — | P | RF-OC-038; RF-OC-031 | I | "Repetida en la fila 12": la repetición dentro de la lista se detecta al capturar; el índice del activo la detecta contra lo ya existente. |
| D5 | `orden_servicio` | `(empresa_id, numero)` | — | P | RF-OS-005; CA-018 | E | `OS-NNNNNN`. |

## E. Personas (Etapas 2 y 4)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| E1 | `persona` | `(empresa_id, referencia_numero)` | — | P | personas-ubicaciones §6 (Persona); RN-004 | E | `PRS-NNNN`, contador `prs`. Persona anonimizada conserva su referencia. |
| E2 | `persona_pii` | `(empresa_id, correo_norm)` | `WHERE correo_norm IS NOT NULL` | A | RN-PRS-005; RF-PER-010; RF-IMP-005 | E | Único entre Personas **no anonimizadas** (las cesadas siguen ocupándolo). Anonimizar pone NULL, que el índice ignora. |
| E3 | `persona_pii` | `(empresa_id, codigo_empleado_norm)` | `WHERE codigo_empleado_norm IS NOT NULL` | A | RN-PRS-005; S-PER-03; RF-IMP-005 | E | Único cuando se llena. La importación exige uno de los dos (correo o código). |
| E4 | `persona` | `(empresa_id, membresia_id)` | `WHERE membresia_id IS NOT NULL` | P | RN-PRS-017; RF-PER-004; RF-USR-008 | E | Vínculo 1 a 1. Desvincular pone NULL. |

## F. Proveedores y contratos (Etapa 2 parte A; Fase 2 parte B)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| F1 | `tipo_contrato` | `(empresa_id, nombre_norm)` | — | P | proveedores-contratos §6 (Tipo de contrato) | E |  |
| F2 | `contrato_proveedor` | `(empresa_id, numero)` | — | P | RF-PRV-009; proveedores-contratos §6 (Contrato) | E | `CTR-NNNNNN`. |
| F3 | `contrato_proveedor` | `(empresa_id, proveedor_id, numero_externo_norm)` | `WHERE numero_externo_norm IS NOT NULL AND anulado_en IS NULL` | L | SUP-LIC-16; D-070.6 | D | Clave natural de importación del contrato de licencia: "número de contrato si existe". La interpretación (único por proveedor) es de Datos. |
| F4 | `contrato_licencia` | `(empresa_id, proveedor_id, producto_id, inicio, fin)` | `WHERE numero_externo_norm IS NULL AND anulado_en IS NULL` | L | SUP-LIC-16; D-070.6 | D | "Si no, proveedor + producto + inicio + fin". **Las cinco columnas deben estar en la misma tabla** (un índice no cruza tablas): `proveedor_id`, `inicio`, `fin` y `numero_externo_norm` se copian del contrato por un disparador que las mantiene iguales. Ver nota 1 de implementación. |
| F5 | `contrato_licencia` | `(empresa_id, contrato_proveedor_id)` | — | P | licencias-software §6 (Contrato de licencia); CA-LIC-01 | E | Relación 1 a 1 con el contrato `CTR-`. |
| F6 | `contrato_activo_cubierto` | `(empresa_id, contrato_id, activo_id)` | `WHERE hasta IS NULL` | V | proveedores-contratos §6 (Activo cubierto) | E | "Activo una vez por contrato"; con desde y hasta puede volver a cubrirse. |
| F7 | `compromiso_servicio` | `(empresa_id, contrato_id, metrica, prioridad)` | — | P | CA-PRV-12; proveedores-contratos §6 (Compromiso de servicio) | E |  |

## G. Licencias de software (Fase 2, ola B)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| G1 | `licencia_asignacion` | `(empresa_id, contrato_id, persona_id)` | `WHERE hasta IS NULL AND persona_id IS NOT NULL` | V | RN-LIC-008; CA-LIC-04 | E | Una asignación abierta por contrato y Persona. |
| G2 | `licencia_asignacion` | `(empresa_id, contrato_id, activo_id)` | `WHERE hasta IS NULL AND activo_id IS NOT NULL` | V | RN-LIC-008 | E | Por contrato y activo. Un puesto = una asignación abierta. |
| G3 | `contrato_licencia_unidad` | `(empresa_id, unidad_id)` | `WHERE hasta IS NULL` | V | RN-LIC-028 | E | Una unidad (clave) pertenece a un solo contrato a la vez. |

## H. Líneas móviles (Fase 2, ola B)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| H1 | `plan_linea` | `(empresa_id, operador_id, nombre_norm)` | — | P | lineas-moviles §6 (Plan) | E | "Único: operador + nombre por empresa (sin distinguir mayúsculas)". |
| H2 | `linea` | `(empresa_id, numero_norm)` | `WHERE baja_en IS NULL AND anulado_en IS NULL` | B | RN-LIN-002; SUP-LIN-14; D-070.6; CA-LIN-02; RNF-LIN-002 | E | Solo dígitos con código de país (lo calcula el servicio; la base exige el formato). El reingreso (RN-LIN-021) pone `baja_en` en NULL y **este mismo índice** rechaza el reingreso si el número ya está en otra línea. |
| H3 | `linea` | `(empresa_id, iccid_norm)` | `WHERE iccid_norm IS NOT NULL AND anulado_en IS NULL` | L | RN-LIN-002 | E | "El ICCID, si se escribe, es único por empresa": lectura literal (la baja no lo libera). Pregunta 2. |
| H4 | `linea_asignacion` | `(empresa_id, linea_id)` | `WHERE hasta IS NULL` | V | RN-LIN-005; lineas-moviles §6 (Asignación de la línea) | E | Una Persona responsable a la vez. |
| H5 | `linea_equipo` | `(empresa_id, linea_id)` | `WHERE hasta IS NULL` | V | RN-LIN-005; lineas-moviles §6 (Asociación línea-equipo) | E | Un equipo puede tener varias líneas (doble SIM): **no** hay índice único por equipo. |

## I. Dominios y certificados (Fase 2, ola B)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| I1 | `dominio` | `(empresa_id, nombre_norm)` | `WHERE baja_en IS NULL AND anulado_en IS NULL` | B | RN-DOM-002; SUP-DOM-14; D-070.6; CA-DOM-01; RNF-DOM-006; CA-DOM-08 | E | Minúsculas, sin espacios, sin punto final ni `www.`, forma técnica (punycode) calculada por el servicio. Otra empresa puede registrar el mismo dominio. |
| I2 | `certificado` | `(empresa_id, emisor_id, serie_norm)` | `WHERE serie_norm IS NOT NULL AND anulado_en IS NULL` | L | RN-DOM-005; SUP-DOM-14 | E | Reemplazado, revocado o dado de baja no libera la serie (los emisores no repiten números). |
| I3 | `certificado` | `(empresa_id, nombre_comun_norm, emisor_id, vencimiento)` | `WHERE serie_norm IS NULL AND anulado_en IS NULL` | L | SUP-DOM-14; D-070.6 | E | Clave alternativa cuando no hay número de serie. |
| I4 | `vinculo_certificado_dominio` | `(empresa_id, certificado_id, dominio_id)` | `WHERE hasta IS NULL` | V | dominios-certificados §6 (Vínculo certificado-dominio) | I | No se vincula dos veces el mismo par a la vez. |

## J. Garantías y mantenimiento (Etapa 4 garantía; Fase 2 resto)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| J1 | `reclamo` | `(empresa_id, numero)` | — | P | garantias-mantenimiento §6 (Reclamo) | E | `RCL-NNNNNN`. |
| J2 | `plan_mantenimiento` | `(empresa_id, nombre_norm)` | — | P | garantias-mantenimiento §6 (Plan) | E |  |
| J3 | `mantenimiento` | `(empresa_id, numero)` | — | P | garantias-mantenimiento §6 (Mantenimiento) | E | `MNT-NNNNNN`. |
| J4 | `mantenimiento` | `(empresa_id, plan_id, activo_id)` | `WHERE tipo = 'preventivo' AND cerrado_en IS NULL` | V | RN-GAR-019 | E | Máximo un preventivo pendiente (Pendiente o En ejecución) por plan y activo. `cerrado_en` se llena al realizarlo o cancelarlo. |
| J5 | `garantia` (apoyo, no único) | `(empresa_id, activo_id, tipo, inicio, fin)` | — | — | garantias-mantenimiento §6 (Garantía) | E | "Aviso si hay dos del mismo tipo y fechas": no se rechaza, se avisa; el índice sirve para encontrarlas. |

## K. Entregas, altas y bajas, portal (Etapa 4 y posteriores)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| K1 | `onboarding_plantilla` | `(empresa_id, tipo, nombre_norm)` | — | P | onboarding-offboarding §6 (Plantilla) | E | "Nombre único por empresa y tipo". |
| K2 | `onboarding_proceso` | `(empresa_id, persona_id, tipo)` | `WHERE cerrado_en IS NULL` | V | RN-ONB-001 | E | Como máximo un proceso abierto de cada tipo por Persona. `cerrado_en` se llena al completar o cancelar. |

## L. Mesa de ayuda (Fase 2, ola C)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| L1 | `caso` | `(empresa_id, numero)` | — | P | mesa-de-ayuda §6 (Caso); RN-AYU-029 | E | `AYU-NNNNNN`, "nunca repetido". |
| L2 | `medicion_sla` | `(empresa_id, caso_id)` | — | P | mesa-de-ayuda §6 (Medición de SLA) | E | Una por caso. |
| L3 | `vinculo_caso_*` (activo, orden de servicio, orden de compra, artículo, caso) | `(empresa_id, caso_id, <destino>_id [, tipo])`, un índice por tipo de destino | — | P | mesa-de-ayuda §6 (Vínculos); RF-AYU-024 | E | "Sin repetir el par"; una tabla por destino con clave compuesta (D-039.7). |
| L4 | `servicio_ayuda` | `(empresa_id, nombre_norm)` | — | P | mesa-de-ayuda §6 (Servicio del catálogo) | E |  |
| L5 | `categoria_ayuda` | `(empresa_id, padre_id, nombre_norm)` con `NULLS NOT DISTINCT` | — | P | mesa-de-ayuda §6 (Categoría de ayuda) | E | "Nombre único por padre y empresa". |
| L6 | `cola` | `(empresa_id, nombre_norm)` | — | P | mesa-de-ayuda §6 (Cola y miembros) | E |  |
| L7 | `cola_miembro` | `(empresa_id, cola_id, membresia_id)` | — | P | mesa-de-ayuda §6 (Cola y miembros) | I |  |
| L8 | `politica_sla` | `(empresa_id, prioridad)` | — | P | mesa-de-ayuda §6 (Política de SLA) | E | "Una por prioridad y empresa". |
| L9 | `encuesta` | `(empresa_id, caso_id)` | — | P | mesa-de-ayuda §6 (Encuesta) | E | Una por caso. |
| L10 | `articulo` | `(empresa_id, codigo)` | — | P | mesa-de-ayuda §6 (Artículo y versión) | E | `KB-NNNNNN`. |
| L11 | `articulo_version` | `(empresa_id, articulo_id, numero)` | — | P | mesa-de-ayuda §6 (Artículo y versión) | E | Número único por artículo; inalterable. |
| L12 | `valoracion_articulo` | `(empresa_id, articulo_id, membresia_id)` | — | P | mesa-de-ayuda §6 (Valoración de artículo) | E | Una por usuario y artículo. |

## M. Notificaciones (Etapa 1 base; Fase 2 completo)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| M1 | `notificacion` | `(empresa_id, evento_id, destinatario)` | — | P | RF-NOT-002; notificaciones §6 (Notificación) | E | Una por evento y destinatario (el destinatario es membresía o Persona: una columna por tipo y `CHECK` de una sola). |
| M2 | `preferencia_usuario` | `(empresa_id, membresia_id, grupo, canal)` | — | P | notificaciones §6 (Preferencia de usuario) | E |  |
| M3 | `plantilla_notificacion` | `(empresa_id, evento, canal, version)` | — | P | notificaciones §6 (Plantilla) | E |  |
| M4 | `resumen_notificaciones` | `(empresa_id, membresia_id, periodo)` | — | P | notificaciones §6 (Resumen) | E |  |
| M5 | `regla_aviso` | `(empresa_id, modulo, entidad)` | — | P | notificaciones §6 (Regla de aviso por fecha) | E |  |
| M6 | `aviso_programado` | `(empresa_id, regla_id, entidad_tipo, entidad_id, umbral, destinatario)` | — | P | RN-NOT-013; notificaciones §6 (Aviso programado) | E | "Una sola tabla de avisos": el aviso por fecha no se repite. `entidad_*` es una columna por tipo con `CHECK` de una sola (D-039.7). |

## N. CMDB, cambios y problemas (Fase 3)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| N1 | `elemento_configuracion` | `(empresa_id, codigo)` | — | P | RN-CMD-025; cmdb-ligera §6 | E | `EC-NNNNNN`, reservado por bloque; puede haber saltos. |
| N2 | `elemento_configuracion` | `(empresa_id, <origen>_id)`, un índice por tipo de origen | `WHERE <origen>_id IS NOT NULL` | P | cmdb-ligera §6 (Elemento de configuración) | E | "(empresa, tipo y referencia de origen)": un EC por activo, licencia, línea, dominio o Persona. |
| N3 | `elemento_configuracion` | `(empresa_id, nombre_norm)` | `WHERE tipo = 'servicio'` | P | RN-CMD-013; CA-CMD-16 | E | Nombre de un Servicio único por empresa; dos personas creando "VPN" a la vez: la base rechaza la segunda. |
| N4 | `relacion_ec` | `(empresa_id, origen_id, destino_id, tipo)` | `WHERE hasta IS NULL` | V | cmdb-ligera §6 (Relación) | E | Una vigente por origen, destino y tipo. |
| N5 | `cambio` | `(empresa_id, numero)` | — | P | gestion-cambios §6 (Unicidad) | E | `CAM-NNNNNN`. |
| N6 | `plantilla_cambio` | `(empresa_id, nombre_norm)` | — | P | gestion-cambios §6 (Unicidad) | E |  |
| N7 | `cambio_elemento` | `(empresa_id, cambio_id, ec_id)` | — | P | gestion-cambios §6 (Unicidad) | E | No se repite un elemento en un cambio. |
| N8 | `problema` | `(empresa_id, numero)` | — | P | gestion-problemas §6 (Unicidad) | E | `PRB-NNNNNN`. |
| N9 | `problema_incidente` | `(empresa_id, caso_id)` | `WHERE hasta IS NULL` | V | RN-PRB-002; gestion-problemas §6 (Unicidad) | E | Un incidente pertenece a un solo problema a la vez. |
| N10 | `problema_cambio`, `problema_elemento` | `(empresa_id, problema_id, cambio_id)`, `(empresa_id, problema_id, ec_id)` | — | P | gestion-problemas §6 (Unicidad) | E | No se repite un cambio ni un elemento en un problema. |

## O. Presupuesto, costos y reportes (Fase 3)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| O1 | `presupuesto` | `(empresa_id, numero)` | — | P | RN-PRE-039; presupuesto-costos §6 | E | `PPT-NNNNNN`. |
| O2 | `presupuesto` | `(empresa_id, anio_fiscal, moneda)` | `WHERE aprobado_en IS NOT NULL AND anulado_en IS NULL` | V | RN-PRE-002; CA-PRE-01 | E | Un solo presupuesto aprobado por empresa, año y moneda. Un presupuesto Cerrado conserva `aprobado_en` y sigue ocupando su año (Pregunta 3). |
| O3 | `presupuesto_linea` | `(empresa_id, presupuesto_id, centro_costo_id, rubro_id)` | — | P | presupuesto-costos §6 (Línea) | E |  |
| O4 | `modificacion_presupuesto`, `gasto_manual` | `(empresa_id, numero)` | — | P | RN-PRE-039 | E | `MPR-` y `GMA-`. |
| O5 | `libro_costos` | `(empresa_id, origen_tipo, origen_id, tipo_hecho)` | — | P | RN-PRE-013; CA-PRE-14 | E | Clave de origen única: impide duplicar un costo; una columna por tipo de origen con `CHECK` de una sola. |
| O6 | `parametros_depreciacion` | `(empresa_id, categoria_id)` | `WHERE hasta IS NULL` | V | presupuesto-costos §6 (Parámetros de depreciación) | E | "Una vigente por empresa + categoría". |
| O7 | `depreciacion_activo` | `(empresa_id, activo_id)` | — | P | presupuesto-costos §6 (Depreciación del activo) | E | Una por activo. |
| O8 | `cuota_depreciacion` | `(empresa_id, activo_id, mes)` | — | P | presupuesto-costos §6 (Cuota de depreciación) | E | Solo meses cerrados. |
| O9 | `periodo` | `(empresa_id, anio, mes)` | — | P | presupuesto-costos §6 (Periodo) | E |  |
| O10 | `vista_guardada` | `(empresa_id, membresia_id, nombre_norm)` | — | P | reportes-tableros §6 (Vista guardada) | E |  |
| O11 | `programacion_reporte` | `(empresa_id, numero)` | — | P | reportes-tableros §6 (Programación) | E | `PRG-NNNNNN`. |
| O12 | `envio_programado` | `(empresa_id, programacion_id, fecha_prevista)` | — | P | reportes-tableros §6 (Envío programado) | E | Idempotente: un envío por programación y fecha. |
| O13 | `agregado_precalculado` | `(empresa_id, indicador, dimension, moneda)` | — | P | reportes-tableros §6 (Agregado precalculado) | E |  |
| O14 | `foto_mensual` | `(empresa_id, mes, indicador, dimension, moneda)` | — | P | reportes-tableros §6 (Foto mensual); CA-REP-16 | E | Una segunda corrida no la duplica. |

## P. Integraciones y API (Fase 3)

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| P1 | `integracion` | `(empresa_id, nombre_norm)` | — | P | integraciones-api §6 (Integración) | E |  |
| P2 | `registro_uso_api` | `(empresa_id, clave_id, dia, modulo)` | — | P | integraciones-api §6 (Registro de uso) | E |  |
| P3 | `acceso_personas_api` | `(empresa_id, pedido_id)` | — | P | integraciones-api §6 (Acceso a Personas por API) | E | Una por pedido. |
| P4 | `idempotencia_api` | `(empresa_id, integracion_id, clave)` | — | P | integraciones-api §6 (Idempotencia); CA-INT-08 | E | Escritura sin duplicar. |
| P5 | `webhook` | `(empresa_id, direccion_norm, integracion_id)` | — | P | integraciones-api §6 (Webhook) | E |  |
| P6 | `entrega_aviso` | `(empresa_id, webhook_id, numero_evento)` | — | P | integraciones-api §6 (Entrega de aviso); RN-INT-026 | E | Entrega al menos una vez; el receptor usa el número de evento. |
| P7 | `cuenta_externa_vinculada` (global) | `(proveedor, identificador_externo)` | — | P | integraciones-api §6 (Cuenta externa vinculada) | E | Única en toda la plataforma. |
| P8 | `equivalencia_externa` | `(empresa_id, sistema, tipo, codigo_externo_norm)` | — | P | integraciones-api §6 (Equivalencia externa) | E |  |
| P9 | `lote_importacion_maestros`, `lote_exportacion_sap` | `(empresa_id, numero)` | — | P | integraciones-api §6; RF-INT-018 | E | Correlativos; `LSAP-` para SAP. |
| P10 | `referencia_externa_oc` | `(empresa_id, orden_id)` | — | P | integraciones-api §6 (Referencia externa en la OC); RF-OC-042 | E | Una por orden; la referencia misma no se hace única. |

## Q. Importación (marco único, Etapa 4)

Texto de reemplazo en `adr-18-importacion-revision-datos.md`.

| # | Tabla | Clave (columnas) | Condición parcial | Clase | Requisito que lo exige | Fuente | Nota |
|---|---|---|---|---|---|---|---|
| Q1 | `importacion_lote` | `(empresa_id, huella_archivo)` | `WHERE estado IN ('confirmado','en_ejecucion','completado')` | L | RF-IMP-004; CA-056; D-050.3 | E | Un archivo ya confirmado y no deshecho se rechaza entero. Un lote fallado, cancelado, expirado o deshecho no ocupa la huella. HMAC (ADR-09). |
| Q2 | `importacion_lote` | `(empresa_id)` | `WHERE estado IN ('confirmado','en_ejecucion')` | V | RF-IMP-011 | E | Una importación en curso por empresa. |
| Q3 | `importacion_fila` | `(empresa_id, lote_id, clave_natural_norm)` | `WHERE clave_natural_norm IS NOT NULL` | V | RF-IMP-005; RF-OC-038 | D | Detecta filas repetidas dentro del mismo archivo al prepararlas. |

## Lo que NO debe ser único (para que nadie lo agregue por costumbre)

| Dato | Por qué se permite repetir | Requisito |
|---|---|---|
| Nombre de una Persona | El alta manual puede crear homónimos, con aviso | RF-PER-010 |
| Serie igual en **otro SKU** de la misma empresa | Se acepta con aviso visible que dice dónde está | RF-INV-003 |
| Nombre de un SKU | El código es la clave; el nombre no se pide único | RF-SKU-001 |
| Nombre o razón social de un proveedor | La clave es la identificación fiscal (y esta puede estar vacía) | RN-PRV-001 |
| Código externo de proveedor y de centro de costo | "Es solo un dato"; no se valida contra ningún sistema | RF-CAT-023 |
| Línea por equipo | Un equipo puede tener varias líneas (doble SIM) | RN-LIN-005 |
| Garantía del mismo activo, tipo y fechas | Solo se avisa | garantias-mantenimiento §6 |
| Referencia externa de la orden de compra entre órdenes | Texto libre, no se valida | RF-OC-042 |
| Dominio o IMEI entre **empresas** distintas | Cada empresa es independiente; sin aviso de duplicado | CA-DOM-08; CA-065a |
| Título y objeto de un contrato; descripción de un caso | Textos libres | proveedores-contratos §6 |

## Restricciones que acompañan a los índices (no son índices únicos)

| Qué asegura | Mecanismo | Requisito |
|---|---|---|
| Sin solape en el historial de una asignación, de una línea o de un vínculo | `EXCLUDE USING gist (empresa_id WITH =, <entidad>_id WITH =, tstzrange(desde, hasta) WITH &&)` además del parcial `WHERE hasta IS NULL` (D06-4) | RF-INV-024; RN-LIN-005 |
| Stock no negativo | `CHECK (cantidad >= 0)` y `UPDATE ... WHERE cantidad >= $n` | RF-INV-020; CA-026 |
| Puestos de licencia no sobrepasados | `CHECK (puestos_asignados <= puestos)` y `UPDATE ... WHERE usados < total` | RN-LIC-008; CA-LIC-03 |
| Estado, responsable y asignación coherentes (25 transiciones) | `CHECK` con `transicion_valida(desde, hacia)` y columna de responsable copiada de la asignación abierta | RF-INV-010; RF-INV-028 |
| Ubicación: máximo 3 niveles y mismo `empresa_id` que el superior | Columna `nivel` (1 a 3) y disparador que la calcula; clave foránea compuesta | RF-CAT-006 |
| Prefijo de categoría no reservado | `CHECK` generado desde la misma constante del código que los 19 reservados más `ACTV` | RF-CAT-008; D-079 |
| Una sola marca entre columnas alternativas (referencias por tipo) | `CHECK (num_nonnulls(a_id, b_id, c_id) = 1)` | D-039.7 |
| Cambio de nombre de campo que choca con la categoría principal | Disparador `BEFORE INSERT/UPDATE` | RF-CAT-010 |
| Coherencia marca/estado (`anulado_en`, `baja_en`) | `CHECK` por tabla | ADR-06 |
| Referencias a una entidad anulada | Disparador que toma `FOR KEY SHARE` y rechaza si `anulado_en IS NOT NULL` (ADR-18) | D-050.5 |

## Notas de implementación

1. **Contrato de licencia (SUP-LIC-16, D-070.6).** La clave alternativa "proveedor + producto + inicio + fin" cruza dos tablas si el contrato de licencia es una extensión 1 a 1 del contrato de proveedor (LIC §6): un índice único no puede atravesar tablas. Propuesta: `contrato_licencia` guarda copia de `proveedor_id`, `inicio`, `fin` y `numero_externo_norm`, mantenida por un disparador `AFTER UPDATE` en `contrato_proveedor` y comprobada por una prueba que compara ambas tablas. La alternativa (llevar `producto_id` al contrato de proveedor, nulo salvo en licencias) contamina el contrato general. Si el Arquitecto prefiere otra, la clave y su condición no cambian.
2. **Normalización fuera de SQL.** `linea.numero_norm` (código de país de la empresa) y `dominio.nombre_norm` (punycode) los calcula el servicio; la base exige `CHECK (numero_norm ~ '^[0-9]{6,15}$')` y un formato equivalente para el dominio. Una prueba compara el normalizador del código con las funciones SQL sobre la tabla de casos del anexo C de la ronda 2.
3. **Anulación en cascada.** Al anular una entidad, un disparador copia `anulado_en` a las filas que replican su clave (`identificador_unico`, `contrato_proveedor.numero_externo_norm` si aplica). Sin eso la clave quedaría ocupada (ADR-17, D17-1).
4. **Nombre de los índices.** Cada índice se llama `uq_<tabla>__<clave>`; el nombre es parte del contrato porque la ejecución de una importación lo usa para traducir un error `23505` a un mensaje por fila (ADR-18). Una prueba de CI compara la lista de índices únicos del catálogo con esta tabla, en los dos sentidos.
5. **Los correlativos no se apoyan solo en el contador.** Todo número de documento (`OC-`, `RCP-`, `OS-`, `ACT-`, `RCL-`, `MNT-`, `CTR-`, `AYU-`, `CAM-`, `PRB-`, `KB-`, `EC-`, `PPT-`, `MPR-`, `GMA-`, `LSAP-`, `PRG-`, `PRS-`, `ACTV-`) tiene además su índice único: si el contador retrocede tras una restauración (ADR-15, D15-3), el segundo insert falla en lugar de duplicar.
6. **Ámbito del índice.** Con seguridad por fila, la comprobación de unicidad la hace el índice completo (no está limitada por la política): un valor ocupado en otra empresa **no** choca porque todas las claves empiezan por `empresa_id`; una clave global (empresa, cuenta, país...) sí lo hace en toda la plataforma.

## Preguntas para el Analista (no para el CEO; no hay dinero, plazo legal ni nada irreversible)

1. **IMEI.** La unicidad del campo "identificador" es hoy **por definición de campo** (cada categoría con su IMEI es una definición). ¿Debe ser única entre categorías (un Celular y una Tablet no pueden compartir un IMEI)? Si sí, se agrega `clase_identificador` y el índice pasa a esa columna (D17-1). Propuesta: sí.
2. **ICCID.** RN-LIN-002 dice "único por empresa" sin decir si una línea dada de baja lo libera. Lectura literal aplicada: no lo libera (clase L). Propuesta: confirmar.
3. **Presupuesto cerrado.** RN-PRE-002 ("solo un presupuesto aprobado por empresa, año y moneda"): ¿un presupuesto Cerrado sigue contando como aprobado? Aplicado: sí (el año no admite otro).
4. **Roles, categorías, campos, catálogos y colas** (filas marcadas **I**): ¿se acepta que el nombre sea único por empresa sin distinguir mayúsculas? Es lo habitual y lo que RN-012 sugiere.
5. **Referencias de la Persona y de las plantillas:** ¿se confirma que `PRS-NNNN` es único por empresa aun para Personas anonimizadas (se aplicó así) y que las plantillas de altas y bajas son únicas por empresa y tipo (explícito en el módulo)? No cambia nada de lo descrito por el CEO.

## Resultado de la verificación automática

- **Identificadores citados:** 142 (RN, RF, RNF, SUP, CA, RS, S y decisiones D-0xx) y **los 142 existen** en `documento-funcional.md`, `registro-permisos.md`, `equipo/decisiones.md` o los módulos (0 no encontrados).
- **Cobertura de unicidad declarada:** de las 73 entidades de las tablas de datos, **67 tienen su fila aquí**; las otras 6 declaran "solo se agrega", "entrada de auditoría" o ninguna unicidad (comentario, historial del caso, envío de notificación, registro de exportación, cambio de condiciones, documento de referencia). Las entidades de los módulos sin esa tabla (CMDB, dominios, licencias, líneas, entregas, altas y bajas, personas) se cubrieron desde su sección 6 y sus reglas RN; el portal no declara claves propias.
- **Qué no cubre este recorrido:** una regla de unicidad escrita solo en prosa, sin los identificadores buscados, podría haberse escapado; por eso la prueba de CI del paso 4 de las notas compara los índices del catálogo con esta tabla y cualquier índice único nuevo sin fila falla.

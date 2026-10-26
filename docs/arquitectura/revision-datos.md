# Revisión de Datos de los ADR 03, 04, 06, 11, 12, 15, 17 y 18

**Autor:** Ingeniero de Datos / DBA · **Fecha:** 2026-10-26 · **Estado:** Entregado a la Jefatura de Proyecto y al Gerente de TI
**Base:** `docs/arquitectura/README.md` y los ocho ADR; `docs/equipo/plan-aplicacion.md` (fila "Ingeniero de Datos", P2); decisiones D-039, D-050, D-070, D-072, D-077, D-079 y D-080; `docs/documento-funcional.md` y los 17 módulos.
**Alcance:** solo revisión. No se editó ningún ADR del Arquitecto ni se creó esquema real. Entregables hermanos: [`indices-claves-naturales.md`](indices-claves-naturales.md) y [`adr-18-importacion-revision-datos.md`](adr-18-importacion-revision-datos.md) (texto de reemplazo propuesto para el ADR-18).

## Para la Jefatura, sin jerga

El diseño del Arquitecto es sólido en lo importante: cada empresa queda separada por la propia base de datos y no solo por el programa, la auditoría no se puede alterar y los números no se repiten. Encontré **ocho puntos bloqueantes que conviene corregir en el papel antes de escribir la primera tabla** (los cuatro más serios, explicados abajo, son D03-2, D03-3, D11-2 y D11-3) y varias mejoras menores. **Ninguna cuesta dinero, toca asuntos legales ni es irreversible**, así que no hay nada que preguntarle al CEO. Todas las correcciones son de diseño y caben en el prototipo técnico de 3 a 4 días.

## Veredictos

| ADR | Tema | Veredicto | Bloqueantes | Importantes | Menores |
|---|---|---|---|---|---|
| 03 | Aislamiento y macro de seguridad por fila | **Aprobado con condiciones** | 2 | 5 | 3 |
| 04 | Roles y tablas globales (18) | **Aprobado con condiciones** | 0 | 5 | 2 |
| 06 | Convenciones del esquema | **Aprobado con condiciones** | 1 | 4 | 3 |
| 11 | Auditoría, partición mensual, purga | **Aprobado con condiciones** | 3 | 3 | 4 |
| 12 | Registro de anonimizaciones | **Aprobado con condiciones** | 0 | 3 | 2 |
| 15 | Contadores y concurrencia | **Aprobado con condiciones** | 0 | 6 | 2 |
| 17 | Campos personalizados | **Aprobado con condiciones** | 0 | 4 | 3 |
| 18 | Importación | **Aprobado con condiciones sustanciales** (se entrega texto de reemplazo; el punto `lote_registro` queda **rechazado** tal como está escrito) | 2 | 6 | 2 |

Ninguno queda rechazado en conjunto. "Bloqueante" = hay que resolverlo antes de que el prototipo (H3, H5, H10) dé un resultado válido. "Importante" = antes de la Etapa 1 (o de la etapa que lo usa). "Menor" = se puede cerrar al escribir la migración.

Convención: cada condición lleva un código (`D03-1`...) para citarla en la mesa de revisión. "Pido" dice el cambio exacto; "Motivo" dice por qué.

---

## ADR-03 · Aislamiento por empresa con seguridad por fila

**Qué está bien:** dos capas (filtro en el código y seguridad por fila forzada); `FORCE ROW LEVEL SECURITY`; falla cerrada sin contexto; `set_config(..., true)` local a la transacción (correcto con el agrupador en modo transacción); claves foráneas compuestas; la lectura de soporte como transacción de solo lectura de una empresa y no como un rol con más poder; las siete pruebas de QA y los ocho casos de soporte.

### D03-1 [Menor, pero se escribe bien desde el principio] La función que lee la empresa debe tolerar el valor vacío
- **Pido:** en el punto 3 de la macro, reemplazar "`app_empresa_actual()` lee `current_setting('app.empresa_id', true)` y devuelve NULL si no hay valor" por:
  ```sql
  CREATE FUNCTION app_empresa_actual() RETURNS uuid
  LANGUAGE sql STABLE PARALLEL SAFE
  AS $$ SELECT NULLIF(current_setting('app.empresa_id', true), '')::uuid $$;
  ```
  y declarar en el ADR que las políticas la llaman como `empresa_id = app_empresa_actual()` (función `STABLE`, para que el planificador la evalúe una vez por consulta y use el índice que empieza por `empresa_id`).
- **Motivo:** en PostgreSQL, un parámetro personalizado que ya se fijó una vez en la conexión **vuelve a `''` (vacío), no a NULL**, al terminar la transacción. Con el agrupador las conexiones se reutilizan: sin `NULLIF`, la segunda petición de una conexión reciclada que olvide fijar la empresa daría un error de conversión en lugar de "cero filas". Sigue siendo falla cerrada, pero con un mensaje confuso y una prueba (el caso "conexión limpia tras error") que fallaría por la razón equivocada.

### D03-2 [Bloqueante] Las funciones SECURITY DEFINER no pueden leer `empresa` ni `membresia` bajo `FORCE ROW LEVEL SECURITY`
- **Qué pasa hoy en el ADR:** ADR-03 y ADR-04 dicen que (a) el dueño de las funciones es `migraciones`, (b) las tablas de negocio tienen `FORCE` y "ni siquiera el dueño las lee sin contexto" y (c) `resolver_empresa`, `mis_empresas`, `empresas_activas` y `abrir_contexto` tienen que leer las tablas `empresa` y `membresia`, que **no** son globales. (a)+(b)+(c) se contradicen: `resolver_empresa(slug)` se ejecuta *antes* de conocer la empresa, y con `FORCE` devolvería cero filas siempre. `mis_empresas` y `empresas_activas` necesitan leer **varias** empresas a la vez, cosa que ninguna política por empresa permite.
- **Pido:** agregar al ADR-03 una sección "Puerta de las funciones" con este mecanismo explícito (no un `BYPASSRLS`):
  1. Para las tablas que las funciones de la lista cerrada deben leer sin contexto, una política **explícita, de solo lectura y para un rol**: `CREATE POLICY lectura_funciones ON empresa FOR SELECT TO migraciones USING (true);` y lo mismo en `membresia`. Nada más.
  2. Las funciones que **escriben** (`empresa_crear`, suspender, rescatar) no necesitan política especial: fijan `set_config('app.empresa_id', <la empresa>, true)` dentro de la función y escriben bajo la política normal.
  3. `app_empresa` **no** recibe esa política: sigue sin poder leer otra empresa.
  4. La prueba de CI compara el catálogo (`pg_policies`) con una **lista cerrada de políticas `TO migraciones`** (tabla, comando). Una política nueva sin ADR falla, igual que una función DEFINER nueva.
- **Motivo:** sin esto, el primer desarrollador que implemente `mis_empresas` descubrirá que no devuelve nada y buscará un atajo (una conexión privilegiada), que es justo lo que el riesgo #2 quiere evitar (mi hallazgo H-DAT-01 de la ronda 2 ya lo advertía). Una política con nombre y lista cerrada es auditable; un atajo no.

### D03-3 [Bloqueante] La macro no puede crear `UNIQUE (empresa_id, id)` en tablas particionadas
- **Pido:** en el punto 1 de la macro agregar la opción `particionada` (`aplicar_aislamiento('auditoria', particionada => 'creado_en')`) con este comportamiento: **no** crea `UNIQUE (empresa_id, id)` (PostgreSQL exige que toda restricción única de una tabla particionada incluya la columna de partición; para la auditoría la clave es `(creado_en, id)`); por lo tanto **nadie puede apuntar con clave foránea compuesta a una tabla particionada** (se declara: las tablas particionadas son hojas del modelo; solo ellas apuntan hacia afuera). La macro además, **en cada partición nueva** (la crea el trabajo mensual, no la macro):
  - activa `ENABLE` y `FORCE ROW LEVEL SECURITY` y copia la política;
  - **no concede ningún permiso sobre la partición a `app_empresa`** (los permisos se dan solo sobre la tabla padre).
- **Motivo:** las particiones no heredan la seguridad por fila del padre: si alguien con permiso consulta la partición directamente (`SELECT * FROM auditoria_2026_10`) las políticas del padre no se aplican. La barrera real es **no dar el permiso**. Se suma una prueba: `has_table_privilege('app_empresa', <cada partición>, 'SELECT')` debe ser falso, para `auditoria`, `auditoria_lote_detalle`, `evento_seguridad` y `evento_seguridad_ingreso`.

### D03-4 [Importante] Clave primaria `(empresa_id, id)` en lugar de clave primaria `id` más un índice único adicional
- **Pido:** en el punto 1 de la macro, cambiar "columna `empresa_id` y `UNIQUE (empresa_id, id)`" por **`PRIMARY KEY (empresa_id, id)`** como opción por defecto (con `pk_simple => true` solo como excepción documentada). Las claves foráneas compuestas apuntan a esa clave primaria. El prototipo (H10) mide las dos variantes con la tabla de movimientos (500.000 filas) y confirma.
- **Motivo:** con la forma actual cada tabla de negocio (150 a 200) tiene **dos** índices equivalentes sobre el mismo dato (el de `id` y el de `(empresa_id, id)`); en las tablas calientes (movimientos, historial, auditoría de lotes) cada escritura actualiza ambos. Con la clave compuesta hay uno solo, las filas de una empresa quedan juntas en el índice (los UUID v7 ya van ordenados en el tiempo) y se cumple "todo índice empieza por `empresa_id`" sin esfuerzo. No cuesta funcionalidad: ninguna consulta legítima busca por `id` sin conocer la empresa. Prisma lo soporta (`@@id([empresaId, id])`).

### D03-5 [Importante] Permisos mínimos concretos y "nada se borra"
- **Pido:** definir en el ADR las opciones de permisos de la macro y su valor por defecto: por defecto `app_empresa` recibe `SELECT, INSERT, UPDATE` (sin `DELETE` ni `TRUNCATE`); `borrable => true` agrega `DELETE` y solo se usa en borradores y en tablas de preparación (`importacion_fila`, borrador de recepción); `solo_agregar => true` deja `SELECT, INSERT` (auditoría, historiales, `movimiento`, `evento_dominio`). Además: `REVOKE ALL ON ALL TABLES/FUNCTIONS ... FROM PUBLIC`, `ALTER DEFAULT PRIVILEGES` para que lo nuevo nazca sin permisos, `REVOKE EXECUTE ... FROM PUBLIC` en cada función DEFINER antes de conceder a `app_empresa`, y `REVOKE CREATE ON SCHEMA public FROM PUBLIC`.
- **Motivo:** RN-007 ("nada con historial se borra") se vuelve una propiedad de la base y no de la disciplina: aunque un desarrollador escriba `delete`, la base lo rechaza. Y en PostgreSQL toda función nueva es ejecutable por todos por defecto: sin el `REVOKE` explícito, una función DEFINER sería llamable por cualquiera.
- La prueba de CI compara los permisos reales de `app_empresa` contra la declaración de la macro (catálogo `information_schema.role_table_grants`).

### D03-6 [Importante] Claves foráneas compuestas: reglas que faltan
- **Pido:** agregar tres líneas: (1) toda clave foránea compuesta es `ON DELETE RESTRICT` / `ON UPDATE RESTRICT` (nada se borra, y `SET NULL` sobre una clave compuesta pondría `empresa_id` en nulo); (2) las referencias **opcionales** usan `MATCH SIMPLE` (el comportamiento por defecto: con la columna `x_id` nula, no se comprueba nada) y siguen llevando `empresa_id NOT NULL`; (3) la macro crea **automáticamente** el índice `(empresa_id, x_id)` en la tabla que referencia (PostgreSQL no lo crea solo, y sin él cada comprobación y cada unión recorre la tabla entera).
- **Y la regla de referencias a "objeto (tipo e identificador)"** de D-039.7 se mantiene: una columna por tipo con clave compuesta y un `CHECK` de que solo una está llena. La única excepción es la auditoría (disparador más verificación nocturna). **No** se aceptan nuevas referencias polimórficas sin clave foránea (ver D18-2: `lote_registro` incumple esto).

### D03-7 [Importante] Lectura de soporte: tres endurecimientos
- **Pido:** (1) `iniciar_lectura_soporte` marca el primer uso con la actualización condicional del ADR-15 (`UPDATE autorizacion_soporte SET primera_vez_usada_por = $p WHERE id = $a AND (primera_vez_usada_por IS NULL OR primera_vez_usada_por = $p)`; 0 filas = rechazo): así dos personas de plataforma no pueden "primer usar" a la vez. (2) Un `CHECK` o disparador impide que la cuenta que crea la autorización sea la de la persona de plataforma designada (hoy es una regla escrita pero sin mecanismo). (3) `app_plataforma` recibe **solo `SELECT`** sobre `autorizacion_soporte`; crear, revocar y marcar el primer uso se hacen únicamente con las funciones. La tabla trae `CHECK (vence_en > creada_en AND vence_en <= creada_en + interval '24 hours')`.
- **Motivo:** hoy ADR-04 dice que `app_plataforma` "entra" a `autorizacion_soporte`; con escritura directa, una persona de plataforma podría fabricarse una autorización, que es exactamente lo que el ADR prohíbe.

### D03-8 [Importante] Agrupador de conexiones: lo que queda prohibido
- **Pido:** agregar al ADR: con el agrupador en modo transacción **no** se usan `SET` de sesión (solo `SET LOCAL`/`set_config(...,true)`), bloqueos de aviso de sesión (`pg_advisory_lock`; se usan los de transacción `pg_advisory_xact_lock`), tablas temporales de sesión, `LISTEN/NOTIFY` ni sentencias preparadas nombradas por el usuario. Una regla de lint prohíbe las cuatro primeras palabras en SQL escrito a mano. Y `ALTER ROLE app_empresa SET statement_timeout = '30s', lock_timeout = '5s', idle_in_transaction_session_timeout = '30s'` (la importación y el trabajador suben el valor con `SET LOCAL` en su propia transacción, con tope de 4 minutos; ver D11-3).
- **Motivo:** un valor de sesión que "se queda pegado" en una conexión reciclada es exactamente el tipo de fuga entre empresas que H10 quiere descartar, y una transacción olvidada abierta bloquea la numeración y las purgas.

### D03-9 [Menor] El identificador no cambia, además de la empresa
- **Pido:** en el punto 4 el disparador impide cambiar `empresa_id` **e `id`**.
- **Motivo:** cambiar `id` rompería referencias y la copia externa de la auditoría.

### D03-10 [Menor, riesgo residual que se acepta por escrito] El parámetro de empresa no es una frontera de seguridad frente a SQL inyectado
- `app_empresa` puede ejecutar `set_config('app.empresa_id', ...)` o `set_config('app.modo_soporte', '0', true)` dentro de su propia transacción. Frente a código malicioso o SQL inyectado, la defensa es la capa de aplicación (`conEmpresa` como única puerta, Prisma parametrizado, lint de SQL crudo), no la base. **Pido** que el ADR lo diga con esas palabras (hoy sugiere una garantía mayor) y que Seguridad lo acepte por escrito; el refuerzo posible (firmar el contexto con un valor que la aplicación calcula y que una función de la base verifica) queda como mejora para después de la Etapa 7 si Seguridad lo pide. No cambia el diseño.

### Pruebas que agrego al prototipo (ADR-03)
1. `app_empresa` recién reciclado (valor `''`) = cero filas, sin error.
2. `mis_empresas`, `resolver_empresa`, `empresas_activas` devuelven lo esperado con `FORCE` activo (D03-2); lista cerrada de políticas `TO migraciones` coincide con el catálogo.
3. Acceso directo a cada partición con `app_empresa` falla; permisos reales = declaración de la macro (D03-3, D03-5).
4. Dos personas de plataforma intentan el primer uso a la vez: gana una (D03-7).

---

## ADR-04 · Cinco roles de base y tablas globales

**Qué está bien:** los cinco roles con sus "no puede"; la lectura de auditoría por política explícita; las pruebas (1) a (4); la decisión de que la cola y el registro de plataforma son globales; la lista de funciones con `search_path` fijo y comparación con `prosecdef`; negarse a un sexto rol.

### D04-1 [Importante] El conteo de "18" mezcla tablas, un esquema y objetos de sistema; hay dos más que declarar
- La fila 18 (`cola.*`) es un **esquema** (varias tablas de la librería, con su propio dueño). Faltan, además, dos objetos sin `empresa_id` que la prueba de CI marcaría como error: `catalogo_aislamiento` (el registro de la macro) y `_prisma_migrations` (de Prisma); y las **particiones** (`auditoria_2026_10`...) que no son tablas nuevas sino hijas.
- **Pido:** reemplazar el párrafo "Las únicas tablas que pueden existir sin `empresa_id`" por una tabla de **tres categorías** que la prueba de CI conoce: (A) 17 tablas globales de negocio de plataforma (las filas 1 a 17); (B) esquemas de infraestructura (`cola`, y `catalogo_aislamiento` más `_prisma_migrations` en el esquema `public` o en uno aparte `sistema`); (C) particiones (se resuelven por `pg_inherits` hacia su padre, que debe estar en la lista A o tener la macro). El README dice "13 a 18"; debe decir "13 a 17 tablas más infraestructura".
- Además, ninguna de las tablas de infraestructura es legible por `app_empresa` salvo `cola` y el catálogo de la macro (solo `SELECT`).

### D04-2 [Importante, recomendación fuerte] `invitacion` y `clave_api` no deberían ser globales; si se quedan, la lista de funciones está incompleta
- **Observación:** ambas tablas **pertenecen a una empresa** (la invitación es a una empresa; la clave de API es de una integración de una empresa). Para administrarlas, la pantalla de la empresa necesita *listar, crear, cancelar, reenviar, rotar y revocar*. La lista de funciones del ADR-04 solo trae `invitacion_leer/aceptar` y `clave_api_validar`: **faltan** `invitacion_crear/listar/cancelar/reenviar`, `clave_api_crear/listar/rotar/revocar`, y también `empresa_crear/suspender/rescatar` (para `app_plataforma`, que no puede escribir en tablas de negocio, RF-ACC-002), `miembros_listar` (el correo de cada miembro vive en `cuenta_usuario`, que es global) y `autorizacion_soporte_revocar`. Con "una función nueva sin ADR falla", la primera pantalla de usuarios haría fallar el CI.
- **Pido (alternativa preferida):** mover `invitacion` y `clave_api` a tablas **de empresa** con la macro (`empresa_id`, seguridad por fila, `sin_soporte` para ambas), y dejar solo dos funciones DEFINER de búsqueda por huella (`invitacion_leer(huella)`, `clave_api_validar(huella)`) apoyadas en la política `TO migraciones` de D03-2. La lista global baja a 15 tablas, la empresa lista y administra lo suyo con la seguridad por fila normal y se eliminan 8 funciones.
- **Pido (si el Arquitecto prefiere dejarlas globales):** agregar a la lista cerrada las funciones que faltan, nombradas arriba, con la empresa tomada del contexto (nunca de un parámetro) y con una prueba cada una.

### D04-3 [Importante] `purga_acta` también se pierde al restaurar un respaldo
- **Observación:** el propio ADR-12 explica que un registro que vive en la base retrocede con ella. `purga_acta` es la constancia de que una partición se purgó con dos aprobadores: al restaurar un respaldo anterior, **las particiones purgadas reaparecen y la constancia desaparece**, y nadie sabría que debían volver a purgarse.
- **Pido:** cada purga escribe su constancia **también** en el almacén externo de solo agregar del ADR-12 (misma credencial de "solo agregar") y el procedimiento de restauración reaplica las purgas con constancia (igual que las anonimizaciones). `purga_acta` en la base sigue siendo la fuente para la pantalla. Y la función de purga rechaza también cuando el **interruptor de congelación por incidente** (D-080 b) esté encendido, además del interruptor legal.

### D04-4 [Importante] `limite_uso`: tabla de escritura muy frecuente
- Cada petición limitada (correo, ingresos, API) actualiza una fila de `limite_uso` (ADR-16). Es la tabla global con más escrituras por segundo y su contenido es descartable.
- **Pido:** el prototipo (H5/ADR-16) mide dos variantes: tabla normal con `fillfactor = 50` y limpieza por trabajo cada hora, y tabla **`UNLOGGED`** (sin registro de escritura previa: más rápida, se vacía sola tras una caída del servidor, que como máximo "perdona" los contadores del último minuto). Si la diferencia es menor al 30 % en p95, se queda la normal. Hasta medirlo no se decide.

### D04-5 [Importante] `evento_seguridad_ingreso` guarda "el correo escrito en un intento fallido"
- Ese correo puede ser de una persona real (un error de tipeo, o alguien que intenta entrar a la cuenta de otro). Es un dato personal en una tabla global de 12 meses.
- **Pido:** guardar el correo como **huella** (ADR-09, tipo `correo_intento`) y no en claro; basta para contar intentos por correo y detectar ataques. Si Seguridad necesita el valor en claro para investigar, que lo diga con un motivo; Cumplimiento lo declara en §18.1. (Es la única de mis condiciones que toca la política de datos personales; el cambio es hacia guardar menos.)

### D04-6 [Menor] Endurecimiento de los roles
- **Pido:** `ALTER ROLE ... SET search_path = pg_catalog, public` para los cinco; `app_empresa`, `app_plataforma`, `mantenimiento` y `lector_auditoria` con `CONNECTION LIMIT` coherente con las 60 conexiones de DevOps; `migraciones` sin contraseña guardada en el entorno de ejecución (su credencial existe solo en el paso de publicación, como ya dice el ADR; se agrega la prueba "el entorno de ejecución no contiene la credencial de `migraciones`"). `lector_auditoria` también lee `auditoria_lote_detalle` (hoy el ADR solo nombra `auditoria`); la copia externa quedaría incompleta.

### D04-7 [Menor] Dónde dice "sin contexto, cero filas" también aplica a las globales de plataforma
- `app_plataforma` solo puede leer sus tablas; confirmar con una prueba que `app_plataforma` no puede ejecutar ninguna función DEFINER de la lista salvo las de plataforma (`empresa_crear`, `autorizacion_soporte_*`).

### Pruebas que agrego (ADR-04)
La prueba (4) del ADR se amplía: compara **permisos, funciones y políticas `TO migraciones`** contra las tres listas cerradas. Prueba de cada categoría de tabla (A, B, C) de D04-1.

---

## ADR-06 · Convenciones del esquema

**Qué está bien:** UUID v7; `numeric(19,4)` para dinero y `numeric(7,4)` para porcentajes; `date` para fechas de calendario y `timestamptz` para momentos; `version` en toda entidad editable; `CHECK` para estados; la regla "una abierta a la vez" con índice único parcial; borrado físico solo de borradores; SQL escrito a mano dentro de las migraciones; prueba de convenciones.

### D06-1 [Bloqueante] La normalización no puede apoyarse en `citext` ni en `unaccent`
- **Pido:** reemplazar la fila "Normalización (RN-012)" por: "Las claves naturales usan columnas `*_norm` calculadas por **funciones propias `IMMUTABLE` y versionadas** (`norm_codigo_v1`, `norm_correo_v1`, `norm_id_fiscal_v1`, `norm_serie_v1`...), escritas con `lower`, `btrim`, `regexp_replace` y `translate` explícitos. Se usa columna generada (`GENERATED ALWAYS AS (...) STORED`) cuando la normalización es SQL puro. Cuando necesita una biblioteca (número de línea con código de país de la empresa; dominio en forma técnica `punycode`), la calcula **el servicio** y la base solo exige el formato con un `CHECK` (`numero_norm ~ '^[0-9]{6,15}$'`). Una prueba compara las funciones SQL con el normalizador del código sobre la tabla de casos del documento (anexo C de la ronda 2). No se usa `citext` ni `unaccent` para claves únicas."
- **Motivo:** `unaccent()` es `STABLE`, no `IMMUTABLE`: no sirve en una columna generada ni en un índice, y su diccionario puede cambiar al actualizar PostgreSQL y alterar en silencio qué filas se consideran iguales. `citext` compara con las reglas de idioma de la base: cambiarlas (o restaurar en otro servidor) puede dejar un índice único inconsistente. Un cambio de la función de normalización exige una migración que recalcula y reindexa, y por eso lleva `_v1`.
- **Prisma:** las columnas generadas se declaran con `@default(dbgenerated())` para que el cliente no intente escribirlas; una prueba lo confirma.

### D06-2 [Importante] "Todo índice único de clave natural excluye lo anulado" es incorrecto para varias claves
- **Observación:** la regla de ADR-06 (y D-070.6) no vale igual para todas: el código de SKU, la serie de un activo, los números correlativos y el código visible del activo **no se reutilizan nunca** (RF-SKU-004, RF-INV-004, RN-004, RF-INV-034) aunque estén desactivados, dados de baja o extraviados; el dominio y el número de línea sí se liberan al dar de baja (RN-DOM-002, RN-LIN-002); el correo de una Persona se libera al anonimizar (RN-PRS-005); lo creado por un lote deshecho se libera siempre (D-050.5).
- **Pido:** reemplazar la fila "Claves naturales" por una convención de **tres columnas de marca**, todas `timestamptz NULL`, y **predicados que solo usan `IS NULL`** (nunca listas de estados, que cambian y obligan a recrear el índice): `anulado_en` (lote deshecho o documento anulado), `baja_en` (dado de baja donde la regla lo libera: dominio, línea, certificado) y, para Personas, el propio valor pasa a NULL al anonimizar (el índice ignora nulos). Cada clave se clasifica en una de cuatro clases (**P** permanente, **L** libera al anular, **B** libera al dar de baja, **V** vigente `hasta IS NULL`) y la clasificación vive en [`indices-claves-naturales.md`](indices-claves-naturales.md). Un `CHECK` mantiene coherente la marca con el estado (`estado = 'baja' <=> baja_en IS NOT NULL`).
- **Motivo:** así "De baja" de un activo (que sigue ocupando su serie) y "anulado por lote" (que la libera) no se confunden, y el índice parcial es simple y rápido.

### D06-3 [Importante] Versión mínima de PostgreSQL y claves con campos opcionales
- **Pido:** declarar **PostgreSQL 15 o superior** (recomendado 16 o 17) y usar `UNIQUE NULLS NOT DISTINCT` donde una columna de la clave puede ser nula y aun así debe contarse: el nombre de ubicación bajo el mismo superior cuando el superior es nulo (nivel raíz, RF-CAT-006): sin esa opción, dos "Sede Central" raíz coexisten porque en SQL los nulos son siempre distintos. DevOps confirma la versión del proveedor.

### D06-4 [Importante] "Una abierta a la vez" necesita además que el historial no se solape
- **Pido:** además del índice único parcial `WHERE hasta IS NULL`, en las tablas de historial con rango (asignación de activo, asignación de línea, asociación línea-equipo, vínculo certificado-dominio, relación de CMDB, ubicación habitual si se historiza) agregar una restricción `EXCLUDE USING gist (empresa_id WITH =, <entidad>_id WITH =, tstzrange(desde, hasta) WITH &&)` (ya está `btree_gist` en la lista de extensiones). Para tablas con fecha de calendario se usa `daterange`.
- **Motivo:** el índice parcial solo protege la fila abierta; una corrección manual de fechas o una importación pueden dejar dos tramos que se cruzan en el pasado, y la devolución y entrega "Asignado a Asignado" depende de que el historial sea una línea sin cruces.

### D06-5 [Importante] El control de divergencia con Prisma dará falsos positivos
- **Observación:** `prisma migrate diff` (ADR-06, "Prisma y SQL") compara el modelo con las migraciones; Prisma no modela los índices parciales, las columnas generadas, las políticas, los disparadores ni las particiones, y puede proponer **borrarlos**. Si CI falla con cada uno, el equipo aprenderá a ignorarlo; si alguien ejecuta `migrate dev` contra el esquema real, podría generar una migración que los elimine.
- **Pido:** (1) solo se usa `prisma migrate deploy` (nunca `migrate dev`) y las migraciones se escriben a mano; (2) la divergencia se controla con una **fotografía normalizada del esquema** (`pg_dump --schema-only` de una base creada solo con las migraciones, sin comentarios ni orden) guardada en el repositorio y comparada en CI, y `migrate diff` se usa solo para las tablas y columnas que Prisma sí modela; (3) `src/db/objetos-solo-sql.md` se genera desde el catálogo en lugar de mantenerse a mano. El prototipo (H10) confirma el comportamiento con las versiones elegidas. Si Prisma ya soporta algunos de estos objetos en la versión elegida, mejor, y se documenta cuáles.

### D06-6 [Menor] Identificadores
- Si el proveedor de base ofrece PostgreSQL 18 o superior, definir `DEFAULT uuidv7()` en las tablas además del valor que genera el servicio: así los guiones de datos de ejemplo y las migraciones escritas en SQL también producen identificadores ordenados. Si no, una función SQL `uuid_v7()` propia (documentada) para esos usos.

### D06-7 [Menor] Cantidades de stock y sus decimales
- RF-INV-023 permite decimales en algunas unidades pero no dice cuántos. **Propuesta de Datos** (a confirmar por el Analista, no es decisión de dinero): `numeric(14,3)` para cantidades, con `CHECK (cantidad >= 0)` en el saldo y la validación de enteros por unidad en el servicio. Tope de 10.000.000 (D-072.1) por `CHECK`.

### D06-8 [Menor] Estados
- Los estados son `CHECK` sobre `text`, **no** tipos `enum` de PostgreSQL ni `enum` de Prisma: agregar un valor a un `enum` obliga a una migración especial y la lista de 17 módulos cambiará. La tabla de las 25 transiciones del activo (RF-INV-010) es una función SQL `transicion_valida(desde, hacia)` usada por un `CHECK` de la tabla de cambios de estado, con la lista en una tabla de verdad probada por QA.

### Pruebas que agrego (ADR-06)
Casos de normalización de las funciones SQL contra el normalizador del código (D06-1); recorrido del catálogo: todo índice único de clave natural está en `indices-claves-naturales.md` (y al revés); `NULLS NOT DISTINCT` en ubicación raíz; solape de historial rechazado (D06-4).

---

## ADR-11 · Auditoría: tres autores, partición mensual, purga

**Qué está bien:** partición mensual (el argumento de la retención exacta de 60 meses es correcto); clave `(creado_en, id)`; partición por defecto con alarma; solo agregar con permisos primero y disparador después; escritura aparte para lecturas auditadas; purga por una función DEFINER con dos aprobadores y apagada por defecto; la copia externa con verificación semanal; la prueba del nombre canario.

### D11-1 [Bloqueante] La macro y las particiones (ver D03-3)
- **Pido:** en "Estructura" decir que `auditoria`, `auditoria_lote_detalle`, `evento_seguridad` y `evento_seguridad_ingreso` se crean con la variante `particionada` de la macro, sin `UNIQUE (empresa_id, id)` y **sin que ninguna otra tabla las referencie con clave foránea**: `auditoria_lote_detalle` guarda `importacion_lote_id` (de `importacion_lote`, que sí es una tabla normal) y su propio `creado_en`, no una clave hacia `auditoria`. Los índices se crean en la tabla padre (PostgreSQL los replica a cada partición).

### D11-2 [Bloqueante] Falta el cuarto tipo de autor: la plataforma (lectura de soporte)
- **Observación:** ADR-11 dice "Soporte actúa como autor de plataforma con persona y motivo", pero `autor_tipo` solo admite `membresia | integracion | sistema` y el `CHECK` exige "exactamente una" de tres columnas. Con eso, la auditoría de cada lectura de soporte (RF-PLA-005, RF-AUD-017, ADR-03) **no se puede escribir** sin romper el `CHECK`.
- **Pido:** `autor_tipo IN ('membresia','integracion','sistema','plataforma')`, columna `autor_plataforma_id uuid` (apunta a `administrador_plataforma`, global) y el `CHECK` "exactamente una de cuatro, coherente con `autor_tipo`" más `motivo NOT NULL` cuando el autor es `plataforma`. Se avisa al Analista: RF-AUD-013 dice "tres valores" y pasa a "tres tipos de autor de empresa más la plataforma en lecturas de soporte" (ese cambio de texto lo hace él, no yo).

### D11-3 [Bloqueante] La copia externa se saltaría filas de transacciones largas
- **Observación:** `creado_en` toma por defecto `now()`, que en PostgreSQL es la hora de **inicio de la transacción**, no la del `COMMIT`. El trabajo de copia lee "filas anteriores a *ahora − 5 minutos*" y avanza su marca. Una transacción que empezó hace 6 minutos y confirma ahora (una importación de 5.000 filas, una recepción de 1.000 series, una consulta de soporte lenta) inserta filas con `creado_en` *anterior* a la marca ya copiada: **nunca se copian**. Lo detectaría la verificación semanal, pero por eso mismo sería un defecto de diseño, no de operación.
- **Pido:** (1) `statement_timeout` y un tope de duración de transacción para `app_empresa` (D03-8) **estrictamente menores** que el margen de copia (por ejemplo tope de 4 minutos y margen de **15 minutos**, no 5); (2) la copia lee con margen y además **relee** el último día completo cada noche (barato: es idempotente por `(creado_en, id)`); (3) la verificación semanal compara conteos por partición y empresa, no solo "no hay saltos". Alternativa más exacta, a medir en H3: la copia solo toma filas cuyo `xmin` ya es anterior al más viejo de las transacciones activas (`pg_snapshot_xmin(pg_current_snapshot())`), que no depende de tiempos.

### D11-4 [Importante] El disparador de "misma empresa de la entidad" cuesta una consulta por fila
- Para cada entrada, el disparador busca la entidad (`entidad_tipo` + `entidad_id`) en su tabla. En una importación de 5.000 filas con auditoría de lote, o en `auditoria_lote_detalle`, son 5.000 búsquedas extra dentro de la misma transacción.
- **Pido:** el disparador solo corre en `auditoria` (no en `auditoria_lote_detalle`, cuyo vínculo es el lote), `entidad_tipo` es una **lista cerrada** en un `CHECK` ligada a una tabla de correspondencia en la migración, y el servicio `registrarAuditoria` escribe la entrada **después** de escribir la entidad en la misma transacción, de modo que la propia entidad (ya sometida a la seguridad por fila y a las claves compuestas) garantiza la empresa. H3 mide el costo con y sin disparador: si es mayor al 10 %, queda solo la verificación nocturna (que ya existe). Una entidad que fue borrador y se borró físicamente deja una entrada huérfana a propósito: la verificación nocturna lo tolera para `entidad_tipo` marcados "con borradores".

### D11-5 [Importante] Purga: precisar qué significa "60 meses" y qué más se comprueba
- **Pido:** en "Retención y purga" escribir: la función compara el **límite superior** de la partición (primer día del mes siguiente) con `now() − interval '60 months'`, no la fecha de creación de la tabla. Rechaza además cuando: (a) la verificación de la copia externa de ese mes no está en estado "completa" (no se purga lo que no se copió), (b) el **interruptor de congelación por incidente** (D-080) está encendido, (c) la constancia no se pudo escribir en el almacén externo (D04-3).
- **Mecánica:** la purga usa `ALTER TABLE ... DETACH PARTITION` normal con `SET LOCAL lock_timeout = '2s'` y reintentos desde el trabajo (nunca en hora pico), y luego descarta o archiva la tabla separada. `DETACH ... CONCURRENTLY` no se puede ejecutar dentro de una función, que es lo que es `purgar_particion_auditoria`; H3 lo comprueba con la versión elegida. Se separa en dos pasos con constancia: separar (reversible, la tabla separada sigue existiendo), y descartar tras un plazo fijo (por ejemplo 7 días) con una segunda llamada: así hay una última oportunidad de deshacer.

### D11-6 [Importante] Partición por defecto y creación adelantada
- **Pido:** el trabajo mensual crea las particiones de los 3 meses siguientes **y** de los 3 anteriores si faltan (por si el sistema estuvo apagado); si la partición por defecto no está vacía, el procedimiento de rescate (documentado) mueve primero esas filas a su partición correcta y recién entonces crea la del mes: PostgreSQL rechaza crear una partición cuyo rango contiene filas de la partición por defecto, y ese rechazo es lo que ocurriría el primer día de un mes sin partición. La alarma de "partición por defecto no vacía" es de gravedad alta.

### D11-7 [Menor] Dos barreras, no una
- **Pido:** aclarar que la barrera principal de "solo agregar" son los **permisos** (sin `UPDATE`, `DELETE` ni `TRUNCATE` para `app_empresa`, sobre el padre y sin permiso sobre las particiones); el disparador de fila (heredado por cada partición, PostgreSQL 13 o superior) es la segunda; el disparador de `TRUNCATE` es de sentencia y **no se hereda** a las particiones, por eso no cuenta como barrera y la prueba de H3 incluye `TRUNCATE` sobre cada partición.

### D11-8 [Menor] Tipos
- `ip inet`; `cambios jsonb` con `CHECK (pg_column_size(cambios) <= 65536)` y `jsonb_typeof(cambios) = 'object'`; `motivo` hasta 500 caracteres (D-072.1; D-077 lo guarda por valor, el ADR-11 debe decirlo); `accion` y `entidad_tipo` con `CHECK` de lista cerrada que viene del catálogo del código.

### D11-9 [Menor] Índices
- Los dos propuestos están bien. Si el filtro "por autor" de la pantalla de auditoría (`auditoria.ver`) existe en el diseño de pantallas, agregar `(empresa_id, autor_membresia_id, creado_en)` **solo si H3 muestra que lo necesita** (parcial `WHERE autor_tipo = 'membresia'`). No agregar índices que nadie midió.

### D11-10 [Menor] Los eventos de seguridad también se purgan por partición con dos personas
- El ADR dice "igual con 12 meses"; confirmo que la función es la misma con otro mínimo (12 meses) y que ambas pasan por D11-5.

### Pruebas que agrego (ADR-11)
Fila de soporte con autor `plataforma` se acepta y con dos autores se rechaza (D11-2); transacción de 6 minutos que confirma después de la copia: la fila llega (D11-3); purga rechaza sin copia completa, con congelación y sin dos aprobadores; `TRUNCATE` de una partición con `app_empresa` falla; mes sin partición: la alarma salta y el rescate funciona.

---

## ADR-12 · Registro de anonimizaciones fuera de la base

**Qué está bien:** es la única opción que sobrevive a una restauración; la intención antes de la transacción y la confirmación después, con falla cerrada y reaplicación idempotente; la reconciliación nocturna; el contenido sin datos personales.

### D12-1 [Importante] La función `anonimizar` necesita un mapa de columnas, no una lista en la cabeza
- **Pido:** cada columna que guarda un dato personal lleva una marca en el catálogo de la base (`COMMENT ON COLUMN tabla.columna IS 'pii:persona|accion=null'` u otra forma que el Arquitecto prefiera mientras sea consultable) y una prueba de CI recorre `pg_description`: toda columna marcada está cubierta por `anonimizar`, y toda columna que `anonimizar` toca está marcada. Cubre al menos: `persona_pii`, la copia de nombre y área del acta (`retener_hasta`), `contacto_proveedor` (correo y teléfono), `importacion_fila.datos_validados` y el valor original conservado 90 días por la migración de líneas, y los valores de campos con `dato_personal`.
- **Y la unicidad:** al anonimizar, `correo_norm` y `codigo_empleado_norm` pasan a **NULL** (no a una cadena), para que la clave única de Persona (RN-PRS-005) se libere sola.

### D12-2 [Importante] Dos candados antes de anonimizar
- **Pido:** la transacción del paso 2 (a) bloquea la fila de la Persona con `SELECT ... FOR UPDATE` y vuelve a comprobar los pendientes dentro de la misma transacción (patrón 2 del ADR-15), para que una entrega concurrente no deje a la Persona anonimizada con un equipo asignado; (b) rechaza si la **congelación por incidente** (D-080 b) está encendida. La intención ya escrita en el almacén externo queda "pendiente" y se reaplica al levantar la congelación (es inofensivo, es idempotente).

### D12-3 [Importante] Orden de la rutina de restauración
- **Pido:** agregar la secuencia obligatoria antes de abrir el sistema tras restaurar: (1) reparar contadores (D15-3), (2) reaplicar anonimizaciones, (3) reaplicar purgas con constancia (D04-3), (4) reconstruir la partición por defecto y las particiones faltantes (D11-6), (5) abrir. Un guion de ensayo en base de pruebas (el CA-053 ya lo pide para las anonimizaciones) pasa a cubrir los cinco.

### D12-4 [Menor] El nombre de la persona anonimizada
- "Persona anonimizada 0042" debe construirse con el **número de su propia referencia `PRS-0042`**, no con un contador nuevo: así reaplicar la anonimización dos veces da el mismo nombre (la prueba de idempotencia) y no se agrega una clave más al ADR-15.

### D12-5 [Menor] La cuenta global
- La anonimización de `cuenta_usuario` (D-041.2) escribe el mismo tipo de entrada con `usuario_id`; el correo de la cuenta pasa a NULL (libera `cuenta_usuario.correo_norm`) y las sesiones, enlaces e invitaciones de esa cuenta se invalidan en la misma transacción.

---

## ADR-15 · Correlativos y patrones de concurrencia

**Qué está bien:** un `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` en una sola sentencia (el bloqueo dura lo que la sentencia); reservar antes de la transacción principal; aceptar saltos; la clave con espacio de nombres; los cinco patrones y sus pruebas H4 y H5; la clave del SKU por prefijo y no por categoría.

### D15-1 [Importante] `siguiente` como una sola llamada
- **Observación:** `contador` tiene seguridad por fila, así que reservar "antes de abrir la transacción principal" exige igualmente fijar la empresa: tres viajes (`BEGIN`, `set_config`, el `INSERT`) por reserva, y se pide p95 ≤ 50 ms.
- **Pido:** `siguiente(empresa_id, clave, n)` es una **función SQL de la base** (SECURITY INVOKER, no DEFINER) que hace en una llamada el `set_config` local de la empresa y el `INSERT ... ON CONFLICT`; el cliente la ejecuta en autocommit, de modo que es un viaje y una transacción de una sentencia. El código `nucleo/contadores` es la única que la llama.

### D15-2 [Importante] Forma exacta de la reserva
- **Pido:** documentar: primer registro `INSERT ... VALUES (empresa, clave, n)` (la reserva inicial es `1..n`), conflicto `SET ultimo = contador.ultimo + n`, el resultado devuelto es el **último** número de la reserva (el rango es `ultimo − n + 1 .. ultimo`); `ultimo bigint`; `CHECK (n BETWEEN 1 AND 10000)` en la función; `CHECK (clave ~ '^(sku:[A-Z0-9]{2,5}|doc:[A-Z]{2,5}(-[A-Z])?|prs|activo)$')` en la tabla; `fillfactor = 50` y parámetros de limpieza automática más agresivos (la tabla recibe una actualización por reserva y todas son sobre las mismas pocas filas).

### D15-3 [Importante] Reparar los contadores después de una restauración
- **Observación:** al restaurar un respaldo anterior, `contador` retrocede, pero los números ya enviados (en correos, PDF, actas firmadas, el sistema SAP) no. El próximo `OC-000042` podría repetir uno que ya salió.
- **Pido:** `contador_reparar()` (DEFINER, `mantenimiento`/`migraciones`): para cada clave, `ultimo = GREATEST(ultimo, MAX(parte numérica del código existente)) + 1000`. Es el paso (1) de D12-3. La red de seguridad contra repeticiones son los **índices únicos de numeración** de [`indices-claves-naturales.md`](indices-claves-naturales.md): el contador evita colisiones en el uso normal; el índice garantiza que, si algo falla, el segundo insert **falle** en lugar de duplicar.

### D15-4 [Importante] El código de SKU escrito a mano ocupa números del contador
- **Observación:** RF-SKU-005: el código escrito a mano no mueve el contador y el automático "salta los códigos ya ocupados". Con el índice único de `sku`, si `LAP-0011` fue escrito a mano, la siguiente reserva (11) colisiona.
- **Pido:** el servicio de SKU reserva un **bloque pequeño** (por ejemplo 5), toma el primer código libre (consulta previa) y, si aun así el `INSERT` choca con el índice, reserva otro bloque y reintenta hasta 10 veces antes de fallar con un error claro. La importación de SKU reserva `filas + 20 %` y descarta los ocupados. Las claves del contador se normalizan en mayúsculas.

### D15-5 [Importante] Claves de contador que faltan
- D-079 agregó el código visible del activo (`ACTV-NNNNNN`, 6 dígitos mínimo, "con contador propio, ADR-15"); el ADR-15 no lo lista. **Pido:** agregar la clave `activo` (o `doc:ACTV`; el Arquitecto elige y lo fija en el `CHECK` de D15-2) y todas las que ya aparecen en los módulos: `doc:OC`, `doc:RCP`, `doc:OS`, `doc:ACT-E`, `doc:ACT-D`, `doc:RCL`, `doc:MNT`, `doc:CTR`, `doc:AYU`, `doc:CAM`, `doc:PRB`, `doc:KB`, `doc:EC`, `doc:PPT`, `doc:MPR`, `doc:GMA`, `doc:LSAP`, `doc:PRG`, `prs`. La lista vive en **una constante del código** y una prueba la compara con los prefijos reservados de RF-CAT-008 (que debe incluir `ACTV` por D-079).

### D15-6 [Importante] Orden de bloqueo para evitar interbloqueos
- **Pido:** agregar a los patrones una regla: toda operación que toca varias filas de la misma clase las bloquea **en orden ascendente de clave** (`ORDER BY id FOR UPDATE`): activos de un traspaso, saldos de un traslado (se ordenan por `(sku_id, ubicacion_id)`), series de una recepción. Y un orden entre clases: documento (orden, lote) → activo → saldo → asignación. Con eso el interbloqueo entre dos traslados cruzados no puede ocurrir; si ocurre, PostgreSQL aborta una de las dos con error `40P01` y el servicio la reintenta una vez.

### D15-7 [Menor] La tabla de idempotencia
- El patrón 4 no define la tabla. **Pido:** `idempotencia(empresa_id, clave, huella_peticion, estado, resultado, expira_en)` con `PRIMARY KEY (empresa_id, clave)`; `estado IN ('en_curso','completada')`; la huella de la petición (ADR-09, tipo `peticion`) detecta la misma clave con una petición distinta (error 422, no se devuelve el resultado ajeno); limpieza por trabajo a las 24 horas; `INSERT ... ON CONFLICT DO NOTHING` para ganar la clave.

### D15-8 [Menor] Capacidad y stock
- Patrón 3 para el stock: `stock_saldo` con `PRIMARY KEY (empresa_id, sku_id, ubicacion_id)` y `CHECK (cantidad >= 0)`; ingreso por `INSERT ... ON CONFLICT DO UPDATE SET cantidad = cantidad + $n`; salida por `UPDATE ... SET cantidad = cantidad - $n WHERE ... AND cantidad >= $n` (0 filas = saldo insuficiente); el movimiento y el saldo se escriben en la misma transacción. Así RF-INV-020 no depende de la hora ni del orden.

### Pruebas que agrego (ADR-15)
H5 incluye: reservar tras restaurar un respaldo antiguo (D15-3); SKU con código a mano que ocupa el siguiente (D15-4); dos traslados cruzados en sentido contrario, 200 veces, sin interbloqueo no reintentado (D15-6); misma clave de idempotencia con petición distinta (D15-7).

---

## ADR-17 · Marco único de campos personalizados

**Qué está bien:** JSON validado más definiciones; un solo validador en el servidor; `valores_filtrables` con un índice GIN y sin DDL en tiempo de ejecución; el campo secreto en una tabla aparte con `sin_soporte`; `completo` guardado al escribir; el tipo no cambia con datos.

### D17-1 [Importante] `identificador_unico`: marca de anulado y referencia
- **Pido:** la tabla lleva `anulado_en timestamptz` y el índice único parcial exacto es `UNIQUE (empresa_id, definicion_id, valor_norm) WHERE anulado_en IS NULL`. `anulado_en` lo copia la **misma función** que anula la unidad (lote deshecho, D-050.5), en la misma transacción (un disparador en la tabla de activos que propaga la marca). La entidad no es una referencia genérica: dos columnas (`activo_id`, `sku_id`) con clave compuesta y `CHECK` de una sola llena (D-039.7). Se declara que la unicidad es **por definición de campo** (cada categoría con su "IMEI" es una definición distinta); si el Analista decide que un IMEI no puede repetirse entre un Celular y una Tablet, se agrega una columna `clase_identificador` (por ejemplo `'imei'`) y el índice pasa a ser por clase. Es una pregunta para el Analista, no para el CEO.
- **Motivo:** sin la propagación, anular un lote deja el IMEI ocupado para siempre y el reintento del archivo corregido falla con "ya existe".

### D17-2 [Importante] Índice GIN y completo: medir antes de fijar
- **Pido:** H10 compara con 100.000 activos y dos empresas: (A) `GIN (valores_filtrables jsonb_path_ops)` más el índice `(empresa_id, sku_id)`; (B) `GIN (empresa_id, valores_filtrables jsonb_path_ops)` con `btree_gin` (si la versión elegida soporta `uuid`). Se queda con la más simple que cumpla RNF-011. Además un índice parcial `(empresa_id, sku_id) WHERE NOT completo` para "pendiente de completar", que es una cifra de tablero.
- Las claves del JSON son el **identificador estable** del campo (`campo_definicion.clave`, RF-CAT-021), nunca el nombre. `valores` tiene `CHECK (jsonb_typeof(valores) = 'object')`.

### D17-3 [Importante] Recalcular `completo` sin una transacción de 100.000 filas
- **Pido:** el trabajo de recálculo (ADR-02) procesa en lotes de 1.000 por empresa con paginación por clave (`WHERE id > $ultimo ORDER BY id LIMIT 1000`), una transacción por lote, con una columna `definiciones_version` en la entidad para saber qué filas ya se recalcularon (reanudable e idempotente). Un cambio de definición no bloquea las ediciones del resto.

### D17-4 [Importante] Unicidad de las definiciones y herencia
- **Pido:** `UNIQUE (empresa_id, ambito, categoria_id, clave)` permanente y `UNIQUE (empresa_id, ambito, categoria_id, nombre_norm) WHERE activo` (el servicio de mesa de ayuda usa `servicio_id` en lugar de `categoria_id`; la macro permite una columna alternativa). Que una subcategoría no repita el nombre de un campo de su categoría principal (RF-CAT-010) no lo puede expresar un índice: lo comprueba un disparador `BEFORE INSERT/UPDATE` con prueba propia.

### D17-5 [Menor] `valor_secreto`
- Clave primaria `(empresa_id, entidad_tipo... )` con dos columnas por tipo y `CHECK` de una sola (D-039.7) y `(definicion_id)`; índice `(empresa_id, version_llave)` para la rotación de llaves (ADR-07); `sin_soporte`; no la lee `lector_auditoria`. La máscara se calcula al escribir (ya está).

### D17-6 [Menor] Dato personal
- La marca `dato_personal` de la definición alimenta D12-1 (mapa de anonimización) además de la auditoría. Cuando un campo con esa marca está en una unidad, `anonimizar` sabe qué hacer según la regla del módulo.

### D17-7 [Menor] Migración de Celulares a Líneas
- Cuando el módulo de Líneas se active (RF-CAT-029), el asistente de migración **anula** las filas de `identificador_unico` del campo "número de línea" de la unidad (misma transacción) y crea las líneas; si no, el mismo número quedaría ocupado en dos tablas. Se anota para el escuadrón B.

### Pruebas que agrego (ADR-17)
Anular un lote libera el IMEI (D17-1); el plan de ejecución de la consulta de 100.000 usa el GIN; subcategoría con nombre repetido se rechaza; recalcular `completo` con corte de conexión a mitad continúa donde quedó.

---

## ADR-18 · Importación: huella de archivo y filas en preparación

El texto de reemplazo propuesto está en [`adr-18-importacion-revision-datos.md`](adr-18-importacion-revision-datos.md). Aquí el resumen de lo que cambia y por qué.

**Qué está bien (se conserva):** un solo marco con plantilla declarativa; todo o nada; solo crea; el archivo no se guarda; deshacer = anular; secuencia creciente en lugar de la hora; huella única parcial; fallo a mitad de ejecución cubierto con inyección de fallos.

| # | Gravedad | Cambio | Motivo corto |
|---|---|---|---|
| D18-1 | Importante | La huella del archivo es **HMAC** (ADR-09, tipo `archivo_importacion`), no SHA-256 simple | Con SHA-256, quien lea la base puede comprobar si un archivo conocido (una lista filtrada de empleados) se importó; el HMAC con llave fuera de la base no. Consistente con la regla única `huella(tipo, valor)` |
| D18-2 | **Bloqueante** | `lote_registro(lote_id, entidad_tipo, entidad_id)` **se rechaza**; cada entidad importable lleva `importacion_lote_id` (clave foránea compuesta) | Es una referencia polimórfica sin clave foránea: contradice D-039.7 y permitiría un lote que "registre" una entidad de otra empresa |
| D18-3 | **Bloqueante** | Máquina de estados completa y dos índices únicos parciales: un lote **en ejecución** por empresa y la huella | Hoy "una importación a la vez por empresa" (RF-IMP-011) solo se impide en el código; y faltan los estados `cancelado` y `expirado` |
| D18-4 | Importante | `importacion_fila`: clave `(empresa_id, lote_id, n_fila)`; se limpia **al terminar o a los 7 días**, no "al confirmar" | La ejecución en el trabajador *lee* esas filas después de confirmar; borrarlas al confirmar impediría la ejecución |
| D18-5 | Importante | Errores en `importacion_error` **sin el valor de la celda** | El reporte de errores no debe ser un segundo almacén de datos personales sin plazo |
| D18-6 | Importante | `SEQUENCE ... CACHE 1` obligatorio; marca `secuencia_alta` en cada entidad importable; protocolo de bloqueo de deshacer (primero bloquear, después leer, `READ COMMITTED`); función `esta_en_uso` por tipo y prueba de catálogo | Con `CACHE` mayor que 1 los valores de dos sesiones se entregan fuera de orden y la comprobación "no hay movimiento posterior" se rompe; el resto cierra la carrera que el ADR menciona sin definir el mecanismo |
| D18-7 | Importante | Anular = `anulado_en`, `anulado_por_lote_id`, `anulado_motivo`; la anulación libera las claves (los predicados `anulado_en IS NULL` de [`indices-claves-naturales.md`](indices-claves-naturales.md)); el saldo inicial de stock se anula con un movimiento contrario | Ver D06-2 |
| D18-8 | Importante | La ejecución traduce una violación de índice único a un mensaje por fila y marca el lote `fallado` sin dejar nada | Entre validar y ejecutar otra persona pudo crear la misma clave; sigue siendo "todo o nada" |
| D18-9 | Menor | Inserción por bloques (`INSERT ... SELECT FROM unnest`), una sola transacción, tope de 4 minutos | 5.000 filas con auditoría de lote caben holgadas; el tope protege la copia externa (D11-3) |
| D18-10 | Menor | Aclarar que la huella se guarda al subir y el índice único solo cuenta lotes confirmados | La consecuencia del ADR ("la huella no se registra hasta confirmar") contradice la tabla (columna `huella_archivo` ya existe en `preparando`) |

**Sobre la secuencia global (cambio de D-050.5):** acepto el cambio de "secuencia por empresa" a una secuencia de PostgreSQL global. Es válido porque la propiedad que importa es "creciente" y no hay punto caliente; la condición es que la marca **nunca se exponga** por pantalla, API ni exportación (revelaría el volumen de actividad de las otras empresas). Se agrega una prueba de contrato en la API.

---

## Resumen de cambios exactos pedidos, por archivo

| Archivo del Arquitecto | Cambios |
|---|---|
| `adr-03-aislamiento-empresa-rls.md` | D03-1 función con `NULLIF` y `STABLE`; D03-2 sección "Puerta de las funciones" con políticas `TO migraciones` y su lista cerrada; D03-3 opción `particionada` y permisos sobre particiones; D03-4 clave primaria `(empresa_id, id)`; D03-5 opciones `borrable`/`solo_agregar` y revocaciones; D03-6 reglas de claves foráneas e índice automático; D03-7 tres endurecimientos de soporte; D03-8 prohibiciones del agrupador y tiempos; D03-9 `id` inmutable; D03-10 aceptar por escrito el riesgo residual |
| `adr-04-roles-base-tablas-globales.md` | D04-1 tres categorías de objetos sin empresa; D04-2 mover `invitacion` y `clave_api` a tablas de empresa (o completar 8 funciones y 3 de plataforma); D04-3 constancia de purga también fuera de la base y congelación; D04-4 medir `limite_uso`; D04-5 correo de intento fallido como huella; D04-6 endurecimiento de roles y `lector_auditoria` también lee el detalle de lotes |
| `adr-06-convenciones-esquema.md` | D06-1 normalización con funciones propias; D06-2 marcas `anulado_en`/`baja_en`/clases P-L-B-V; D06-3 PostgreSQL 15 y `NULLS NOT DISTINCT`; D06-4 `EXCLUDE` para no solapar; D06-5 control de divergencia por fotografía del esquema y solo `migrate deploy`; D06-6 a D06-8 menores |
| `adr-11-auditoria.md` | D11-1 variante particionada sin FK hacia ella; D11-2 autor `plataforma`; D11-3 margen y tope de transacción de la copia; D11-4 disparador medido; D11-5 reglas de la purga; D11-6 partición por defecto; D11-7 a D11-10 menores |
| `adr-12-registro-anonimizaciones.md` | D12-1 mapa de columnas y NULL en claves; D12-2 candado y congelación; D12-3 orden de restauración; D12-4 nombre desde `PRS`; D12-5 cuenta global |
| `adr-15-contadores-concurrencia.md` | D15-1 `siguiente` como función de un viaje; D15-2 forma de la reserva y `CHECK`; D15-3 `contador_reparar`; D15-4 SKU manual vs automático; D15-5 claves faltantes (`ACTV`...); D15-6 orden de bloqueo; D15-7 tabla de idempotencia; D15-8 stock |
| `adr-17-campos-personalizados.md` | D17-1 `identificador_unico` con `anulado_en` y referencias; D17-2 GIN medido y parcial de incompletos; D17-3 recálculo por lotes; D17-4 unicidad de definiciones; D17-5 a D17-7 menores |
| `adr-18-importacion.md` | Reemplazar su "Decisión" por [`adr-18-importacion-revision-datos.md`](adr-18-importacion-revision-datos.md) (D18-1 a D18-10) |

## Observaciones fuera de mis ocho ADR (para quien corresponda; no las edito)

1. **Analista:** RF-CAT-008 (prefijos reservados) y §26.2 deben incluir `ACTV` (D-079); RF-AUD-013 habla de "tres" tipos de autor y el soporte necesita un cuarto (D11-2); RN-LIN-002 dice que el ICCID es "único por empresa" sin aclarar si la baja de la línea lo libera (aplico la lectura literal: no lo libera; confírmese); si un IMEI es único por campo o por clase de identificador (D17-1); decimales de cantidades (D06-7).
2. **Arquitecto, ADR-16:** `limite_uso` y su limpieza (D04-4). **ADR-09:** tipos de huella nuevos (`archivo_importacion`, `correo_intento`, `peticion`).
3. **Escuadrones:** el contrato de licencia necesita en una misma tabla las columnas de su clave natural (proveedor, producto, inicio, fin): detallado en `indices-claves-naturales.md`, fila de `contrato_proveedor`/`contrato_licencia`.
4. **DevOps:** versión mínima de PostgreSQL 15; extensiones `btree_gist`, `pg_trgm`, `pgcrypto` (y `btree_gin` si H10 elige la variante B); ya no `citext` ni `unaccent`.

## Riesgos que quedan (para `docs/equipo/riesgos.md`; no los escribo allí porque es de la Jefatura)

| Riesgo | Probabilidad | Impacto | Respuesta |
|---|---|---|---|
| El control de divergencia con Prisma resulta más frágil de lo previsto con índices parciales y particiones | Media | Medio | D06-5; H10 lo mide; plan B: Kysely/SQL puro para migraciones |
| `DETACH PARTITION` bloquea escrituras de auditoría en hora pico | Baja | Medio | `lock_timeout` y reintentos fuera de hora pico; H3 lo mide |
| Un desarrollador usa el parámetro de empresa para saltarse el aislamiento con SQL crudo | Baja | Alto | Lint, única puerta `conEmpresa`, revisión de Seguridad (D03-10) |
| Mapa de anonimización incompleto cuando entren módulos nuevos | Media | Alto | D12-1: prueba de CI que cruza columnas marcadas con `anonimizar` |
| La copia externa pierde filas de transacciones largas | Media si no se corrige | Alto | D11-3 |

## Decisión que NO requiere al CEO

Ningún punto cambia dinero, plazos legales ni algo irreversible: los plazos de 5 años, 12 meses y 7 días ya están decididos y solo cambia **cómo** se hacen cumplir. El único punto que roza datos personales (D04-5) reduce lo que se guarda.

# ADR-03 · Aislamiento por empresa con seguridad por fila, incluida la lectura de soporte (T-3)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5 y Datos) · **Decide:** Gerente de TI (revisa Seguridad) · **Base:** D-025 (reemplazada), D-039, D-046, D-073, D-080, RS-10, H-SEG-33 a 37, 39, 41; D03-1 a D03-10

## Contexto
Una sola base compartida por todas las empresas. "Una consulta que olvide el filtro es un defecto grave" (riesgo #2). Con 17 módulos habrá del orden de 150 a 200 tablas: hacerlo a mano en cada una garantiza un olvido.

## Opciones
1. Una base o esquema por empresa. Descartada: migraciones y respaldos multiplicados, cuesta más y no es necesario al volumen supuesto.
2. Solo filtro en el código. Descartada: un olvido se convierte en fuga.
3. **Filtro en el código + seguridad por fila en la base** + claves foráneas compuestas. Elegida (dos capas, D-025).

## Decisión

### Qué protege y qué no (se escribe sin exagerar)
- La seguridad por fila **sí** protege contra el olvido de un filtro, contra una consulta mal escrita y contra una clave foránea cruzada: es lo que el riesgo #2 pide.
- **No** protege contra SQL inyectado ni contra código que ejecute `set_config('app.empresa_id', otra)` con el rol `app_empresa`: ese rol puede fijar esa variable, porque es la forma en que la aplicación le dice a la base quién es. Frente a ese caso la defensa es de la capa de aplicación: `conEmpresa` como única puerta, Prisma con parámetros, la regla de código de abajo y la revisión de Seguridad. Es un riesgo residual **aceptado por escrito** (D03-10, H-SEG-36); el refuerzo posible (firmar el contexto con un valor que la base verifica) queda como mejora si Seguridad lo pide después de la Etapa 7.
- **Regla de código con prueba en integración continua** (H-SEG-36): ninguna llamada a `$queryRawUnsafe` ni `$executeRawUnsafe`; SQL crudo solo con parámetros y solo en `nucleo/aislamiento` y en `repos/` marcados; `set_config` y `SET` solo dentro de `nucleo/aislamiento` y de las funciones de la lista cerrada (ADR-04). Con el agrupador en modo transacción también quedan prohibidos (D03-8) `SET` de sesión (se usa `SET LOCAL` o `set_config(..., true)`), `pg_advisory_lock` de sesión (se usa `pg_advisory_xact_lock`), tablas temporales de sesión, `LISTEN/NOTIFY` y sentencias preparadas con nombre en las conexiones que pasan por el agrupador. El trabajador usa conexión directa (ADR-01) y puede escuchar avisos que le pida la librería de cola, pero fija la empresa igual: dentro de la transacción.

### Capa de base de datos (la macro)
`aplicar_aislamiento(tabla, opciones)` es la única forma de crear una tabla de negocio. Hace, de una vez:
1. columna `empresa_id uuid NOT NULL` y **`PRIMARY KEY (empresa_id, id)`** por defecto (D03-4). Las claves foráneas compuestas apuntan a ella. `pk_simple => true` solo como excepción documentada. Un solo índice por tabla en lugar de dos, filas de una empresa juntas y "todo índice empieza por `empresa_id`" sin esfuerzo; H10 mide las dos variantes con 500.000 movimientos. Prisma lo soporta (`@@id([empresaId, id])`);
2. `ENABLE` y **`FORCE ROW LEVEL SECURITY`** (el dueño tampoco se salta las reglas);
3. política `USING / WITH CHECK (empresa_id = app_empresa_actual())`, sin cláusula `TO` (aplica a todo rol que tenga permiso sobre la tabla). La función:
   ```sql
   CREATE FUNCTION app_empresa_actual() RETURNS uuid
   LANGUAGE sql STABLE PARALLEL SAFE
   AS $$ SELECT NULLIF(current_setting('app.empresa_id', true), '')::uuid $$;
   ```
   `NULLIF` porque, tras la primera transacción de una conexión reciclada, la variable queda **vacía y no nula** (D03-1, H-SEG-41). `STABLE` para que el planificador la evalúe una vez por consulta y use el índice que empieza por `empresa_id`. **Sin contexto, cero filas** (falla cerrado);
4. disparador que impide cambiar `empresa_id` **e `id`** (D03-9);
5. **permisos mínimos** (D03-5): por defecto `app_empresa` recibe `SELECT, INSERT, UPDATE`, sin `DELETE` ni `TRUNCATE`; `borrable => true` agrega `DELETE` (solo borradores y tablas de preparación como `importacion_fila`); `solo_agregar => true` deja `SELECT, INSERT` (auditoría, historiales, `movimiento`, `evento_dominio`, `participacion_documento`). RN-007 ("nada con historial se borra") pasa a ser propiedad de la base. Además, a nivel de esquema: `REVOKE ALL ON ALL TABLES/FUNCTIONS ... FROM PUBLIC`, nada nuevo nace con permisos (sin `ALTER DEFAULT PRIVILEGES` que los dé), `REVOKE CREATE ON SCHEMA public FROM PUBLIC`, `REVOKE EXECUTE ... FROM PUBLIC` en cada función antes de conceder (H-SEG-39). Una prueba de CI compara los permisos reales (`information_schema.role_table_grants`) con la declaración de la macro;
6. `SELECT` para `app_soporte` salvo en tablas `sin_soporte` (ver lectura de soporte);
7. **claves foráneas compuestas** `(empresa_id, x_id)` con reglas fijas (D03-6): `ON DELETE RESTRICT` y `ON UPDATE RESTRICT` (nada se borra; `SET NULL` pondría `empresa_id` en nulo); las referencias **opcionales** usan `MATCH SIMPLE` y siguen llevando `empresa_id NOT NULL`; la macro crea **automáticamente** el índice `(empresa_id, x_id)` en la tabla que referencia. La regla de D-039.7 se mantiene: una referencia a "objeto de varios tipos" son varias columnas con clave compuesta y un `CHECK (num_nonnulls(...) = 1)`; la única excepción es la auditoría (disparador más verificación nocturna);
8. alta de la tabla en `catalogo_aislamiento`.

**Opciones de la macro:** `sin_soporte`, `borrable`, `solo_agregar`, `pk_simple`, `importable` (ADR-18) y `particionada => '<columna>'` (D03-3): en una tabla particionada **no** se crea la clave única `(empresa_id, id)` (PostgreSQL exige que toda restricción única incluya la columna de partición; la auditoría usa `(creado_en, id)`), por lo tanto **nadie apunta con clave foránea a una tabla particionada**: son hojas del modelo. Los permisos se dan **solo sobre la tabla padre**; cada partición nueva (la crea la función `crear_particion_auditoria`, ADR-11) lleva `ENABLE` y `FORCE`, la misma política y sus disparadores, y **ningún permiso para ningún rol de aplicación**. Hecho comprobable: PostgreSQL no hereda permisos ni aplica las políticas del padre a quien consulta una partición directamente; la barrera real es no dar el permiso.

### Puerta de las funciones (D03-2, bloqueante resuelto)
Las funciones SECURITY DEFINER de la lista cerrada (ADR-04) son propiedad de `migraciones`, y con `FORCE` ni el dueño lee una tabla sin contexto. Pero `resolver_empresa(slug)` corre *antes* de conocer la empresa, y `mis_empresas` y `empresas_activas` leen *varias* empresas a la vez: ninguna política por empresa lo permite. Mecanismo explícito (no `BYPASSRLS`):
1. Una política de **solo lectura y para un rol**: `CREATE POLICY lectura_funciones ON <tabla> FOR SELECT TO migraciones USING (true)`. Lista cerrada de tablas: `empresa`, `membresia`, `rol`, `rol_permiso`, `invitacion`, `clave_api`. Nada más.
2. Las funciones que **escriben** (`empresa_crear`, suspender, rescatar, ADR-23) no necesitan política especial: fijan `set_config('app.empresa_id', <la empresa>, true)` dentro de la función y escriben bajo la política normal.
3. `app_empresa`, `app_plataforma` y `app_soporte` **no** reciben esas políticas: ninguno puede leer otra empresa.
4. Una prueba de CI compara `pg_policies` con una **lista cerrada de políticas `TO migraciones`** (tabla, comando) y con la política esperada de cada tabla (ver pruebas). Una política nueva sin ADR falla, igual que una función DEFINER nueva.
5. Consecuencia para las migraciones de datos: como `migraciones` también está sujeta a `FORCE`, una migración que toque datos de negocio recorre las empresas (la macro ofrece `para_cada_empresa`) y fija el contexto en cada una; nunca se desactiva la seguridad por fila para migrar.

### Capa de aplicación
- `conEmpresa(empresaId, fn)`: transacción interactiva cuyo **primer paso** es `SELECT set_config('app.empresa_id', $1, true)` (local a la transacción: segura con el agrupador en modo transacción). Es la **única** puerta a la base: el cliente de Prisma no se importa fuera de `nucleo/aislamiento` (regla de lint `no-restricted-imports`).
- **Tiempos** (D03-8): `ALTER ROLE app_empresa SET statement_timeout = '30s', lock_timeout = '5s', idle_in_transaction_session_timeout = '30s'`. La importación y el trabajador suben el valor con `SET LOCAL` solo mediante `conTiempoExtendido(minutos ≤ 4)` de `nucleo/aislamiento`. **Tope de duración de la transacción: 4 minutos.** Hecho a tener presente: `statement_timeout` limita cada sentencia, no la transacción completa; el tope se aplica con `transaction_timeout` si el proveedor ofrece PostgreSQL 17 o superior y, si no, con un plazo en `conEmpresa` que cancela y revierte. La copia externa de la auditoría depende de este tope (ADR-11).
- La empresa sale de la dirección (ADR-05) y se compara con la membresía en cada petición; el cliente nunca impone una empresa.
- Procesos automáticos: empresa por empresa con `app_empresa` y la empresa fijada dentro de la transacción (ADR-02).
- Lo que no pertenece a una empresa (usuario, sesión, enlace…) está en la lista cerrada de tablas globales y solo se toca con funciones SECURITY DEFINER (ADR-04). **Regla general (H-SEG-34): ninguna función acepta un identificador de usuario, empresa o persona como prueba de quién llama; recibe la credencial** (la huella de la sesión) y deduce el resto dentro de la base.

### Lectura de soporte (D-039.10, D-073, RF-PLA-013) — propuesta, a ratificar por el Gerente
La sesión de soporte **no usa `app_plataforma`** y tampoco `app_empresa`. Usa un sexto rol, **`app_soporte`** (H-SEG-36, ADR-04): solo `SELECT`, con permiso únicamente sobre las tablas que la macro no marcó `sin_soporte` (claves y semillas cifradas, cola de derechos de datos, filas de importación en preparación, resultados de exportación, credenciales de integraciones, conversaciones del asistente). Así esas tablas se protegen **por permisos** y no por una variable que cualquiera con SQL puede cambiar; y como solo la consola (ADR-01) recibe `SOPORTE_DATABASE_URL`, los usuarios de las empresas ni siquiera pueden abrir una sesión de soporte.

Tabla global `autorizacion_soporte(id, empresa_id, motivo, persona_plataforma_id, creada_por_membresia_id, creada_en, vence_en, primera_vez_usada_por, revocada_en)`:
- `CHECK (vence_en > creada_en AND vence_en <= creada_en + interval '24 hours')`.
- `app_plataforma` y `app_soporte` tienen **solo `SELECT`**. Alta, uso y revocación pasan únicamente por funciones (D03-7, H-SEG-33).
- Disparador: de una autorización solo pueden cambiar `revocada_en` (de nulo a valor) y `primera_vez_usada_por` (de nulo a valor); nada más, así nadie alarga `vence_en`.
- Disparador: la cuenta que crea la autorización no puede ser la de la persona de plataforma designada (hoy era una regla sin mecanismo).
- Crea y revoca un administrador de la empresa con el permiso nuevo `empresa.autorizar_soporte` (sensible, 2F, verificación reciente con autenticador; ADR-10): `autorizacion_soporte_crear(huella_sesion, motivo, persona_plataforma_id)` y `autorizacion_soporte_revocar(huella_sesion, autorizacion_id)`, con la empresa tomada del contexto. Avisan por correo a los administradores al crearse, al usarse por primera vez y al revocarse.

Flujo de una lectura, en **tres pasos** (el orden del texto anterior era imposible: PostgreSQL rechaza cualquier escritura en una transacción de solo lectura, también dentro de una función DEFINER; H-SEG-35):
1. **Transacción corta de escritura** (rol `app_soporte` ejecutando una función DEFINER): `soporte_usar(huella_sesion_plataforma, autorizacion_id)`. La función deduce la persona de la sesión de plataforma (ADR-08: llave física, verificación reciente), y en una sola sentencia hace `UPDATE autorizacion_soporte SET primera_vez_usada_por = persona WHERE id = $1 AND vence_en > ahora AND revocada_en IS NULL AND (primera_vez_usada_por IS NULL OR primera_vez_usada_por = persona) RETURNING empresa_id` (0 filas = rechazo; si dos personas empiezan a la vez, gana una) y escribe la entrada de auditoría previa de la empresa. **Todo rechazo** (vencida, ajena, usada por otra persona, revocada) escribe un evento de seguridad y alimenta la alerta de "sesión de soporte fuera de lo autorizado" del procedimiento de incidentes.
2. `BEGIN; SET TRANSACTION READ ONLY; SELECT soporte_abrir_lectura(huella_sesion_plataforma, autorizacion_id)`: la función solo comprueba otra vez (vigente, misma persona) y fija `app.empresa_id` local. **La empresa se toma de la autorización**, nunca de un parámetro.
3. Las consultas siguientes pasan por la seguridad por fila de siempre; cualquier escritura falla por transacción de solo lectura **y** por falta de permiso.

Reglas adicionales:
- **Auditoría de cada lectura (cada petición de la consola de soporte) antes de ejecutarla, en una transacción aparte** (`soporte_auditar`, ruta de escritura aparte de ADR-11). Si el registro falla, no hay lectura. Queda en la auditoría de la propia empresa (RF-PLA-005) con el cuarto tipo de autor `plataforma` (ADR-11), con persona y motivo y sin el contenido leído.
- La sesión **no ve** las tablas `sin_soporte` (por permisos) y **no puede exportar ni leer en masa**: `app_soporte` no ejecuta ninguna función de exportación ni de API, y `puertaExportacion` rechaza además a todo principal de soporte (H-SEG-37 c).
- Prohibidos `BYPASSRLS` y superusuario en todos los roles. Banner "sesión de soporte" en la pantalla. Una persona de plataforma no puede crear su propia autorización.
- **Riesgo residual declarado:** una consola comprometida con una sesión de soporte válida podría, con SQL propio, cambiar `app.empresa_id` y leer otra empresa. Por eso la consola es un despliegue aparte, con red restringida y llave física (ADR-01, ADR-08), y la auditoría previa sale antes de cada lectura.
- Si el Gerente **no** ratifica el sexto rol, se vuelve al diseño anterior: `app_empresa` en solo lectura, variable `app.modo_soporte` y política `RESTRICTIVE` en las tablas `sin_soporte`. Queda por escrito que esa variante es más débil (se protege por una variable, no por permisos). H2 mide ambas.

## Consecuencias
- Aislamiento sin depender de la disciplina de cada desarrollador; costo: trabajo extra de la macro y de la prueba genérica.
- Cada petición abre una transacción (un viaje extra a la base); se mide en el prototipo (H10).
- Las pruebas de aislamiento corren **siempre con `app_empresa`**; si corrieran con el dueño no probarían nada.
- Las tablas particionadas son hojas del modelo: ninguna puede ser destino de una clave foránea (afecta a ADR-11).
- Si Prisma no alcanza (agrupador, transacciones interactivas), plan B: Kysely o SQL puro solo en `nucleo/aislamiento`.
- La lista de políticas `TO migraciones` y la de funciones DEFINER son parte del contrato: ampliarlas exige ADR y visto bueno de Seguridad.

## Qué prueba lo valida
- **Prueba genérica en CI** que recorre el catálogo: falla si hay tabla sin las protecciones que no esté en la lista global; además un caso de aislamiento **por módulo** (por identificador interno, no por "número"). **Casos que rompen el aislamiento sin tocar ninguna política (H-SEG-41):** (1) todo índice **único** de una tabla de negocio empieza por `empresa_id` (excepciones declaradas: `empresa(slug)`, y las búsquedas por huella de `invitacion` y `clave_api`, que son índices no únicos); (2) no hay vistas materializadas ni tablas "copia" de datos de negocio; (3) la política de cada tabla es exactamente la esperada y no hay otra permisiva añadida (las permisivas se suman con O); (4) `app_empresa_actual()` trata la cadena vacía como nula; (5) las particiones: `has_table_privilege(<rol de aplicación>, <cada partición>, 'SELECT')` es falso para `auditoria`, `auditoria_lote_detalle`, `evento_seguridad` y `evento_seguridad_ingreso`.
- Siete criterios de QA (D-055): consulta sin filtro devuelve 0 filas ajenas; insertar con empresa ajena falla; clave foránea cruzada falla; UPDATE y DELETE ajenos afectan 0 filas; 50 peticiones intercaladas sobre un grupo compartido sin que la empresa quede pegada; conexión limpia tras error (**conexión reciclada con valor `''` = cero filas, sin error**); `app_empresa` no puede modificar la auditoría.
- Permisos reales = declaración de la macro; `PUBLIC` sin EXECUTE ni CREATE; `mis_empresas`, `resolver_empresa` y `empresas_activas` devuelven lo esperado con `FORCE` activo; la lista de políticas `TO migraciones` coincide con el catálogo.
- `app_empresa` no es dueño, no tiene BYPASSRLS y no es superusuario; lo mismo para los otros cinco roles.
- Lint: sin SQL crudo no parametrizado, sin `set_config` ni `SET` fuera de lo permitido.
- **Soporte:** los 8 casos de antes (válida lee solo esa empresa y no puede escribir; vencida = 0 filas; de otra empresa = 0 filas de la otra; usada por otra persona = rechazo; revocada = rechazo; `sin_soporte` = 0 filas; auditoría escrita aunque la lectura falle; la conexión vuelve limpia) **más**: `app_plataforma` y `app_soporte` no pueden INSERT/UPDATE/DELETE en `autorizacion_soporte`, `registro_plataforma` ni `purga_acta`; **dos personas empiezan a la vez y gana una**; intento de `set_config('app.empresa_id', ...)` dentro de la sesión de soporte (se espera que funcione: se registra el resultado como riesgo residual); todo rechazo escribe un evento de seguridad; la sesión de soporte no puede exportar; el creador de la autorización no puede ser la persona designada; intentar cambiar `vence_en` con UPDATE falla.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| D03-1 | Incorporado: `app_empresa_actual()` con `NULLIF` y `STABLE` (también H-SEG-41 caso 4). |
| D03-2 (bloqueante) | Incorporado: sección "Puerta de las funciones", políticas `TO migraciones` con lista cerrada y prueba de catálogo. Añado `rol`, `rol_permiso`, `invitacion` y `clave_api` a la lista porque las funciones de ADR-04 las leen, y la nota sobre migraciones de datos. |
| D03-3 (bloqueante) | Incorporado: opción `particionada`, sin clave única de empresa, nadie apunta a ellas, permisos solo en el padre. |
| D03-4 | Incorporado: clave primaria `(empresa_id, id)`; H10 mide ambas. |
| D03-5, D03-6 | Incorporados tal cual (permisos, revocaciones, reglas de claves foráneas e índice automático). |
| D03-7 | Incorporado y completado con H-SEG-33 a 35: tres pasos, disparadores de la tabla, `CHECK` de 24 horas. |
| D03-8 | Incorporado con una aclaración: las prohibiciones valen para las conexiones que pasan por el agrupador; el trabajador usa conexión directa. Añado el hecho de que `statement_timeout` no limita la transacción y cómo se aplica el tope de 4 minutos. |
| D03-9, D03-10 | Incorporados; D03-10 se escribe como riesgo residual aceptado. |
| H-SEG-33 (alta) | Incorporado: `SELECT` solamente, disparador de campos mutables, funciones para todo lo demás; `registro_plataforma` y `purga_acta` en ADR-04 y ADR-23. |
| H-SEG-34 | Incorporado: las funciones reciben la huella de la sesión de plataforma; regla general "credencial, no identificador". |
| H-SEG-35 | Incorporado: flujo en tres pasos y prueba de salida simultánea. |
| H-SEG-36 | Incorporado con la alternativa recomendada (`app_soporte`), **propuesta, a ratificar por el Gerente**; el texto de lo que protege y no protege; la regla de código. Cuesta una cuenta más en la misma base, sin gasto. Si no se ratifica, queda descrita la variante anterior. |
| H-SEG-37 | (a) cuarto autor en ADR-11, (b) permiso `empresa.autorizar_soporte` pedido al Analista (ADR-10), (c) exportación y lectura masiva rechazan soporte. |
| H-SEG-39, H-SEG-41 | Incorporados (revocaciones, `PUBLIC`, cinco casos de la prueba genérica). |
| H-SEG-40 | Parte de la macro `particionada`; la función de creación está en ADR-11. |

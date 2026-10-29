-- =============================================================================
-- Verificación manual del aislamiento por empresa (plan-etapa-1.md A.8.2, ADR-03).
-- Dueño: Ingeniero de Datos. Punto de partida para pruebas/aislamiento/ de QA.
--
-- CÓMO CORRERLO (con la base migrada y sembrada, ENTRANDO COMO app_empresa):
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/verificar-aislamiento.sql
-- (DATABASE_URL es la dirección del rol app_empresa; si entras con el dueño o un superusuario
--  la prueba no prueba nada: el script lo detecta y se detiene.)
--
-- QUÉ ESPERAR: cada comprobación imprime una línea "PASA ...". Si algo falla, el script se
-- detiene con "FALLA ..." y termina con error. No deja datos: los casos que escriben se deshacen.
-- Casos cubiertos aquí: 1 a 4, 6 y 7 de A.8.2 y las comprobaciones de roles, políticas y permisos.
-- El caso 5 (2.000 peticiones intercaladas, tras un error y tras una conexión cortada) vive en
-- src/nucleo/aislamiento/aislamiento.integracion.test.ts, porque necesita muchas conexiones.
-- =============================================================================
\set ON_ERROR_STOP on
\pset tuples_only on
\set VERBOSITY terse
\echo === Aislamiento por empresa: verificación con app_empresa ===

-- 0. Quién soy: el script solo vale con app_empresa -------------------------------
DO $$
DECLARE r pg_roles%ROWTYPE;
BEGIN
  IF current_user <> 'app_empresa' THEN
    RAISE EXCEPTION 'FALLA 0: este script debe correr como app_empresa (corre como %).', current_user;
  END IF;
  SELECT * INTO r FROM pg_roles WHERE rolname = current_user;
  IF r.rolsuper OR r.rolbypassrls THEN
    RAISE EXCEPTION 'FALLA 0: app_empresa es superusuario o BYPASSRLS.';
  END IF;
  IF (SELECT count(*) FROM empresa WHERE slug IN ('alfa', 'beta')) <> 2 THEN
    RAISE EXCEPTION 'FALLA 0: faltan las empresas de la semilla (alfa y beta). Corre npm run db:semilla.';
  END IF;
  RAISE NOTICE 'PASA 0: se entra como app_empresa (sin superusuario ni BYPASSRLS) y existen alfa y beta.';
END $$;

-- 1. Consulta sin filtro = cero filas ajenas ----------------------------------------
-- Para CADA tabla de negocio, con la empresa A fijada, "SELECT *" sin WHERE no trae filas de B (y al revés),
-- y trae algo propio (si no, la prueba no probaría nada).
DO $$
DECLARE
  v_empresas uuid[] := ARRAY(SELECT id FROM empresa WHERE slug IN ('alfa', 'beta') ORDER BY slug);
  v_actual uuid;
  v_ajena uuid;
  t text;
  propias bigint;
  ajenas bigint;
  vacias text[] := '{}';
  revisadas int := 0;
BEGIN
  FOR i IN 1..2 LOOP
    v_actual := v_empresas[i];
    v_ajena := v_empresas[3 - i];
    PERFORM set_config('app.empresa_id', v_actual::text, true);
    FOR t IN SELECT tabla FROM catalogo_aislamiento ORDER BY tabla LOOP
      EXECUTE format('SELECT count(*) FILTER (WHERE empresa_id = $1), count(*) FILTER (WHERE empresa_id <> $1) FROM %I', t)
        INTO propias, ajenas USING v_actual;
      IF ajenas <> 0 THEN
        RAISE EXCEPTION 'FALLA 1: la tabla % devuelve % filas de otra empresa sin filtro.', t, ajenas;
      END IF;
      -- (una consulta con el filtro de la otra empresa tampoco debe traer nada)
      EXECUTE format('SELECT count(*) FROM %I WHERE empresa_id = $1', t) INTO ajenas USING v_ajena;
      IF ajenas <> 0 THEN
        RAISE EXCEPTION 'FALLA 1: la tabla % entrega filas al pedir la empresa ajena a propósito.', t;
      END IF;
      IF propias = 0 AND i = 1 THEN vacias := vacias || t; END IF;
      revisadas := revisadas + 1;
    END LOOP;
  END LOOP;
  RAISE NOTICE 'PASA 1: % revisiones tabla-empresa, cero filas ajenas (tablas sin datos de ejemplo, sin prueba de contenido: %).',
    revisadas, COALESCE(NULLIF(array_to_string(vacias, ', '), ''), 'ninguna');
END $$;

-- 2. Insertar con la empresa ajena falla ------------------------------------------------
DO $$
DECLARE
  v_alfa uuid := (SELECT id FROM empresa WHERE slug = 'alfa');
  v_beta uuid := (SELECT id FROM empresa WHERE slug = 'beta');
  rechazado boolean;
BEGIN
  PERFORM set_config('app.empresa_id', v_alfa::text, true);

  rechazado := false;
  BEGIN
    INSERT INTO ubicacion (empresa_id, nombre) VALUES (v_beta, 'Intrusa desde Alfa');
  EXCEPTION WHEN insufficient_privilege THEN rechazado := true;
  END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 2: se insertó una ubicación de Beta estando en Alfa.'; END IF;

  rechazado := false;
  BEGIN
    INSERT INTO auditoria (empresa_id, accion, entidad_tipo) VALUES (v_beta, 'intrusa', 'prueba');
  EXCEPTION WHEN insufficient_privilege THEN rechazado := true;
  END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 2: se escribió auditoría de Beta estando en Alfa.'; END IF;

  -- Sin ninguna empresa fijada tampoco se puede insertar.
  PERFORM set_config('app.empresa_id', '', true);
  rechazado := false;
  BEGIN
    INSERT INTO ubicacion (empresa_id, nombre) VALUES (v_alfa, 'Sin contexto');
  EXCEPTION WHEN insufficient_privilege THEN rechazado := true;
  END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 2: se insertó sin empresa fijada.'; END IF;
  RAISE NOTICE 'PASA 2: insertar con una empresa ajena (o sin empresa) es rechazado por la seguridad por fila.';
END $$;

-- 3. Clave foránea cruzada falla -----------------------------------------------------------
-- Estando en Alfa, un activo de Alfa no puede apuntar a una ubicación de Beta, ni una asignación
-- de Alfa a una persona de Beta (clave foránea compuesta (empresa_id, id)).
DO $$
DECLARE
  v_alfa uuid := (SELECT id FROM empresa WHERE slug = 'alfa');
  v_beta uuid := (SELECT id FROM empresa WHERE slug = 'beta');
  v_ubicacion_beta uuid;
  v_persona_beta uuid;
  v_sku_alfa uuid;
  v_activo_alfa uuid;
  rechazado boolean;
BEGIN
  PERFORM set_config('app.empresa_id', v_beta::text, true);
  SELECT id INTO v_ubicacion_beta FROM ubicacion ORDER BY nombre LIMIT 1;
  SELECT id INTO v_persona_beta FROM persona ORDER BY nombre LIMIT 1;

  PERFORM set_config('app.empresa_id', v_alfa::text, true);
  SELECT id INTO v_sku_alfa FROM sku WHERE control = 'serie' LIMIT 1;
  SELECT id INTO v_activo_alfa FROM activo WHERE estado = 'en_stock' LIMIT 1;
  IF v_ubicacion_beta IS NULL OR v_persona_beta IS NULL OR v_sku_alfa IS NULL OR v_activo_alfa IS NULL THEN
    RAISE EXCEPTION 'FALLA 3: faltan datos de ejemplo para esta prueba.';
  END IF;

  rechazado := false;
  BEGIN
    INSERT INTO activo (empresa_id, sku_id, serie, ubicacion_id) VALUES (v_alfa, v_sku_alfa, 'FK-CRUZADA-1', v_ubicacion_beta);
  EXCEPTION WHEN foreign_key_violation THEN rechazado := true;
  END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 3: un activo de Alfa quedó apuntando a una ubicación de Beta.'; END IF;

  rechazado := false;
  BEGIN
    INSERT INTO asignacion (empresa_id, activo_id, persona_id) VALUES (v_alfa, v_activo_alfa, v_persona_beta);
  EXCEPTION WHEN foreign_key_violation THEN rechazado := true;
  END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 3: una asignación de Alfa quedó apuntando a una persona de Beta.'; END IF;
  RAISE NOTICE 'PASA 3: las claves foráneas cruzadas entre empresas fallan (activo->ubicación, asignación->persona).';
END $$;

-- 4. UPDATE y DELETE ajenos afectan cero filas -----------------------------------------------
DO $$
DECLARE
  v_alfa uuid := (SELECT id FROM empresa WHERE slug = 'alfa');
  v_beta uuid := (SELECT id FROM empresa WHERE slug = 'beta');
  filas bigint;
  antes bigint;
BEGIN
  PERFORM set_config('app.empresa_id', v_beta::text, true);
  SELECT count(*) INTO antes FROM rol_permiso;

  PERFORM set_config('app.empresa_id', v_alfa::text, true);
  UPDATE ubicacion SET nombre = 'Cambiada desde Alfa' WHERE empresa_id = v_beta;
  GET DIAGNOSTICS filas = ROW_COUNT;
  IF filas <> 0 THEN RAISE EXCEPTION 'FALLA 4: UPDATE de filas de Beta desde Alfa afectó % filas.', filas; END IF;

  UPDATE sku SET activo = false WHERE empresa_id <> v_alfa;
  GET DIAGNOSTICS filas = ROW_COUNT;
  IF filas <> 0 THEN RAISE EXCEPTION 'FALLA 4: UPDATE sin filtro de empresa tocó % filas ajenas.', filas; END IF;

  -- rol_permiso es la única tabla de negocio con DELETE (editar un rol reemplaza sus permisos).
  DELETE FROM rol_permiso WHERE empresa_id = v_beta;
  GET DIAGNOSTICS filas = ROW_COUNT;
  IF filas <> 0 THEN RAISE EXCEPTION 'FALLA 4: DELETE de filas de Beta desde Alfa afectó % filas.', filas; END IF;

  PERFORM set_config('app.empresa_id', v_beta::text, true);
  IF (SELECT count(*) FROM rol_permiso) <> antes THEN
    RAISE EXCEPTION 'FALLA 4: cambió la cantidad de permisos de roles de Beta.';
  END IF;
  RAISE NOTICE 'PASA 4: UPDATE y DELETE sobre filas de otra empresa afectan 0 filas.';
END $$;

-- 6. Conexión reutilizada sin empresa = cero filas, sin error ---------------------------------
-- (se numera 6 como en A.8.2; el 5 es la prueba de carga en TypeScript)
BEGIN;
SELECT set_config('app.empresa_id', (SELECT id::text FROM empresa WHERE slug = 'alfa'), true);
SELECT 'transacción previa con empresa Alfa' AS paso;
COMMIT;
DO $$
DECLARE
  valor text := current_setting('app.empresa_id', true);
  total bigint;
  t text;
BEGIN
  -- Tras la transacción previa la variable queda VACÍA (no nula): es el caso que rompe políticas ingenuas.
  IF valor IS NOT NULL AND valor <> '' THEN
    RAISE EXCEPTION 'FALLA 6: la empresa quedó pegada a la conexión (%).', valor;
  END IF;
  FOR t IN SELECT tabla FROM catalogo_aislamiento LOOP
    EXECUTE format('SELECT count(*) FROM %I', t) INTO total;
    IF total <> 0 THEN RAISE EXCEPTION 'FALLA 6: % devuelve % filas sin empresa fijada.', t, total; END IF;
  END LOOP;
  -- Con la variable fijada explícitamente en vacío (a nivel de sesión) pasa igual.
  PERFORM set_config('app.empresa_id', '', false);
  EXECUTE 'SELECT count(*) FROM sku' INTO total;
  IF total <> 0 THEN RAISE EXCEPTION 'FALLA 6: con la variable vacía hay % filas.', total; END IF;
  PERFORM set_config('app.empresa_id', 'no-es-un-uuid', false);
  RAISE NOTICE 'PASA 6a: una conexión reutilizada (variable vacía) devuelve cero filas en todas las tablas, sin error.';
END $$;
-- Un valor corrupto en la variable no debe filtrar datos: la comparación falla cerrada (error), nunca abre filas.
DO $$
DECLARE total bigint; hubo_error boolean := false;
BEGIN
  PERFORM set_config('app.empresa_id', 'no-es-un-uuid', true);
  BEGIN
    SELECT count(*) INTO total FROM sku;
    IF total <> 0 THEN RAISE EXCEPTION 'FALLA 6: un valor corrupto abrió % filas.', total; END IF;
  EXCEPTION WHEN invalid_text_representation THEN hubo_error := true;
  END;
  RAISE NOTICE 'PASA 6b: un valor corrupto en app.empresa_id no abre filas (%).', CASE WHEN hubo_error THEN 'falla cerrado con error' ELSE 'cero filas' END;
END $$;
SELECT set_config('app.empresa_id', '', false);

-- 7. app_empresa no puede modificar ni borrar la auditoría -----------------------------------------
DO $$
DECLARE
  v_alfa uuid := (SELECT id FROM empresa WHERE slug = 'alfa');
  rechazado boolean;
  total bigint;
BEGIN
  PERFORM set_config('app.empresa_id', v_alfa::text, true);
  SELECT count(*) INTO total FROM auditoria;
  IF total = 0 THEN RAISE EXCEPTION 'FALLA 7: no hay auditoría de ejemplo.'; END IF;

  rechazado := false;
  BEGIN UPDATE auditoria SET accion = 'adulterada';
  EXCEPTION WHEN insufficient_privilege THEN rechazado := true; END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 7: se pudo modificar la auditoría.'; END IF;

  rechazado := false;
  BEGIN DELETE FROM auditoria;
  EXCEPTION WHEN insufficient_privilege THEN rechazado := true; END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 7: se pudo borrar la auditoría.'; END IF;

  rechazado := false;
  BEGIN TRUNCATE auditoria;
  EXCEPTION WHEN insufficient_privilege THEN rechazado := true; END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 7: se pudo vaciar la auditoría.'; END IF;

  IF (SELECT count(*) FROM auditoria) <> total THEN RAISE EXCEPTION 'FALLA 7: cambió la cantidad de filas de auditoría.'; END IF;

  -- Agregar sí se puede (y se deshace aquí mismo).
  BEGIN
    INSERT INTO auditoria (empresa_id, accion, entidad_tipo) VALUES (v_alfa, 'prueba.verificacion', 'prueba');
    RAISE EXCEPTION 'deshacer' USING ERRCODE = 'P0001';
  EXCEPTION WHEN raise_exception THEN NULL;
  END;
  RAISE NOTICE 'PASA 7: la auditoría solo admite agregar (UPDATE, DELETE y TRUNCATE rechazados).';
END $$;

-- 8. Roles: sin dueño, sin BYPASSRLS, sin superusuario ---------------------------------------------
DO $$
DECLARE r record; n bigint;
BEGIN
  FOR r IN SELECT * FROM pg_roles WHERE rolname IN ('migraciones', 'app_empresa', 'app_plataforma', 'lector_auditoria') LOOP
    IF r.rolsuper OR r.rolbypassrls OR r.rolcreaterole OR r.rolcreatedb THEN
      RAISE EXCEPTION 'FALLA 8: el rol % tiene superusuario, BYPASSRLS, CREATEROLE o CREATEDB.', r.rolname;
    END IF;
  END LOOP;
  IF (SELECT count(*) FROM pg_roles WHERE rolname IN ('migraciones', 'app_empresa', 'app_plataforma', 'lector_auditoria')) <> 4 THEN
    RAISE EXCEPTION 'FALLA 8: falta alguno de los cuatro roles.';
  END IF;
  SELECT count(*) INTO n FROM pg_class c JOIN pg_roles o ON o.oid = c.relowner
   WHERE c.relnamespace = 'public'::regnamespace AND o.rolname IN ('app_empresa', 'app_plataforma', 'lector_auditoria');
  IF n <> 0 THEN RAISE EXCEPTION 'FALLA 8: un rol de aplicación es dueño de % objetos.', n; END IF;
  SELECT count(*) INTO n FROM pg_proc p JOIN pg_roles o ON o.oid = p.proowner
   WHERE p.pronamespace = 'public'::regnamespace AND o.rolname IN ('app_empresa', 'app_plataforma', 'lector_auditoria');
  IF n <> 0 THEN RAISE EXCEPTION 'FALLA 8: un rol de aplicación es dueño de % funciones.', n; END IF;
  RAISE NOTICE 'PASA 8: los cuatro roles existen, sin superusuario/BYPASSRLS/CREATEROLE/CREATEDB, y los de aplicación no son dueños de nada.';
END $$;

-- 9. Cada tabla de negocio tiene FORCE RLS, su política y los permisos mínimos --------------------------
DO $$
DECLARE t record; n bigint; lista text;
BEGIN
  -- Toda tabla de public está en el registro de la macro o en la lista cerrada de globales.
  SELECT string_agg(c.relname, ', ') INTO lista
    FROM pg_class c
   WHERE c.relnamespace = 'public'::regnamespace AND c.relkind IN ('r', 'p')
     AND c.relname NOT IN (SELECT tabla FROM catalogo_aislamiento)
     AND c.relname NOT IN ('empresa', 'usuario', 'sesion', 'enlace_ingreso', 'catalogo_aislamiento', '_prisma_migrations');
  IF lista IS NOT NULL THEN RAISE EXCEPTION 'FALLA 9: tablas fuera del registro de aislamiento: %.', lista; END IF;

  -- Ninguna tabla de negocio tiene columna empresa_id nula, ni falta empresa_id.
  SELECT string_agg(r.tabla, ', ') INTO lista FROM catalogo_aislamiento r
   WHERE NOT EXISTS (SELECT 1 FROM information_schema.columns k WHERE k.table_schema = 'public' AND k.table_name = r.tabla
                        AND k.column_name = 'empresa_id' AND k.is_nullable = 'NO');
  IF lista IS NOT NULL THEN RAISE EXCEPTION 'FALLA 9: tablas sin empresa_id NOT NULL: %.', lista; END IF;

  FOR t IN SELECT r.tabla, r.solo_agregar, r.borrable, c.relrowsecurity, c.relforcerowsecurity
             FROM catalogo_aislamiento r JOIN pg_class c ON c.relname = r.tabla AND c.relnamespace = 'public'::regnamespace LOOP
    IF NOT (t.relrowsecurity AND t.relforcerowsecurity) THEN
      RAISE EXCEPTION 'FALLA 9: % no tiene ENABLE y FORCE ROW LEVEL SECURITY.', t.tabla;
    END IF;
    -- Política de aislamiento exacta
    SELECT count(*) INTO n FROM pg_policies p
     WHERE p.schemaname = 'public' AND p.tablename = t.tabla AND p.policyname = 'aislamiento_empresa'
       AND p.permissive = 'PERMISSIVE' AND p.cmd = 'ALL' AND p.roles = '{public}'
       AND p.qual LIKE '%app_empresa_actual()%' AND p.with_check LIKE '%app_empresa_actual()%';
    IF n <> 1 THEN RAISE EXCEPTION 'FALLA 9: % no tiene su política de aislamiento exacta.', t.tabla; END IF;
    -- Cualquier otra política debe estar en la lista cerrada (ADR-03: solo membresía, para el dueño de las funciones)
    SELECT count(*) INTO n FROM pg_policies p
     WHERE p.schemaname = 'public' AND p.tablename = t.tabla AND p.policyname <> 'aislamiento_empresa'
       AND NOT (t.tabla = 'membresia' AND p.policyname = 'lectura_funciones' AND p.cmd = 'SELECT' AND p.roles = '{migraciones}');
    IF n <> 0 THEN RAISE EXCEPTION 'FALLA 9: % tiene políticas fuera de la lista cerrada.', t.tabla; END IF;
    -- Permisos mínimos de app_empresa
    IF NOT (has_table_privilege('app_empresa', t.tabla, 'SELECT') AND has_table_privilege('app_empresa', t.tabla, 'INSERT')) THEN
      RAISE EXCEPTION 'FALLA 9: app_empresa no puede leer o insertar en %.', t.tabla;
    END IF;
    IF has_table_privilege('app_empresa', t.tabla, 'TRUNCATE') OR has_table_privilege('app_empresa', t.tabla, 'REFERENCES')
       OR has_table_privilege('app_empresa', t.tabla, 'TRIGGER') THEN
      RAISE EXCEPTION 'FALLA 9: app_empresa tiene TRUNCATE, REFERENCES o TRIGGER sobre %.', t.tabla;
    END IF;
    IF has_table_privilege('app_empresa', t.tabla, 'UPDATE') = t.solo_agregar THEN
      RAISE EXCEPTION 'FALLA 9: el permiso UPDATE de % no coincide con su declaración (solo_agregar=%).', t.tabla, t.solo_agregar;
    END IF;
    IF has_table_privilege('app_empresa', t.tabla, 'DELETE') <> t.borrable THEN
      RAISE EXCEPTION 'FALLA 9: el permiso DELETE de % no coincide con su declaración (borrable=%).', t.tabla, t.borrable;
    END IF;
    -- Los otros roles no tocan tablas de negocio
    IF has_table_privilege('app_plataforma', t.tabla, 'SELECT') OR has_table_privilege('app_plataforma', t.tabla, 'INSERT')
       OR has_table_privilege('lector_auditoria', t.tabla, 'SELECT') THEN
      RAISE EXCEPTION 'FALLA 9: app_plataforma o lector_auditoria tienen permisos sobre %.', t.tabla;
    END IF;
  END LOOP;
  IF to_regclass('public._prisma_migrations') IS NOT NULL
     AND (has_table_privilege('app_empresa', '_prisma_migrations', 'SELECT') OR has_table_privilege('app_plataforma', '_prisma_migrations', 'SELECT')) THEN
    RAISE EXCEPTION 'FALLA 9: la aplicación puede leer _prisma_migrations.';
  END IF;
  RAISE NOTICE 'PASA 9: todas las tablas de negocio (%) tienen FORCE RLS, política exacta y permisos mínimos; app_plataforma y lector_auditoria no las tocan.',
    (SELECT count(*) FROM catalogo_aislamiento);
END $$;

-- 10. Índices únicos de negocio empiezan por empresa_id (H-SEG-41 caso 1) -----------------------------------
DO $$
DECLARE lista text;
BEGIN
  SELECT string_agg(i.indexrelid::regclass::text, ', ') INTO lista
    FROM pg_index i JOIN pg_class c ON c.oid = i.indrelid
   WHERE c.relnamespace = 'public'::regnamespace AND (i.indisunique OR i.indisprimary)
     AND c.relname IN (SELECT tabla FROM catalogo_aislamiento)
     AND (SELECT a.attname FROM pg_attribute a WHERE a.attrelid = c.oid AND a.attnum = i.indkey[0]) <> 'empresa_id';
  IF lista IS NOT NULL THEN RAISE EXCEPTION 'FALLA 10: índices únicos que no empiezan por empresa_id: %.', lista; END IF;
  RAISE NOTICE 'PASA 10: todo índice único o clave primaria de una tabla de negocio empieza por empresa_id.';
END $$;

-- 11. Funciones: nada ejecutable por PUBLIC; DEFINER solo en la lista cerrada -----------------------------------
DO $$
DECLARE lista text;
BEGIN
  SELECT string_agg(p.oid::regprocedure::text, ', ') INTO lista
    FROM pg_proc p
   WHERE p.pronamespace = 'public'::regnamespace AND p.prokind = 'f'
     AND NOT EXISTS (SELECT 1 FROM pg_depend d WHERE d.objid = p.oid AND d.deptype = 'e')   -- las de extensiones quedan fuera
     AND (p.proacl IS NULL OR EXISTS (SELECT 1 FROM aclexplode(p.proacl) a WHERE a.grantee = 0));
  IF lista IS NOT NULL THEN RAISE EXCEPTION 'FALLA 11: funciones ejecutables por PUBLIC: %.', lista; END IF;

  SELECT string_agg(p.oid::regprocedure::text, ', ') INTO lista
    FROM pg_proc p
   WHERE p.pronamespace = 'public'::regnamespace AND p.prosecdef
     AND p.proname NOT IN ('mis_empresas');
  IF lista IS NOT NULL THEN RAISE EXCEPTION 'FALLA 11: funciones SECURITY DEFINER fuera de la lista cerrada: %.', lista; END IF;

  -- Solo siguiente() puede fijar la empresa por dentro, además de las DEFINER de la lista.
  SELECT string_agg(p.proname, ', ') INTO lista
    FROM pg_proc p
   WHERE p.pronamespace = 'public'::regnamespace AND p.prosrc ILIKE '%set_config%' AND p.proname NOT IN ('siguiente');
  IF lista IS NOT NULL THEN RAISE EXCEPTION 'FALLA 11: funciones que llaman a set_config fuera de la lista: %.', lista; END IF;
  RAISE NOTICE 'PASA 11: ninguna función es ejecutable por PUBLIC; la única SECURITY DEFINER es mis_empresas; solo siguiente() fija la empresa.';
END $$;

-- 12. mis_empresas con seguridad por fila forzada ---------------------------------------------------------------
DO $$
DECLARE n bigint;
BEGIN
  SELECT count(*) INTO n FROM mis_empresas((SELECT id FROM usuario WHERE correo_norm = 'ceo@demo.local'));
  IF n <> 2 THEN RAISE EXCEPTION 'FALLA 12: ceo@demo.local debería ver 2 empresas y ve %.', n; END IF;
  SELECT count(*) INTO n FROM mis_empresas((SELECT id FROM usuario WHERE correo_norm = 'jefa@alfa.local'));
  IF n <> 1 THEN RAISE EXCEPTION 'FALLA 12: jefa@alfa.local debería ver 1 empresa y ve %.', n; END IF;
  SELECT count(*) INTO n FROM mis_empresas(gen_random_uuid());
  IF n <> 0 THEN RAISE EXCEPTION 'FALLA 12: un usuario inexistente ve % empresas.', n; END IF;
  -- Sin empresa fijada la función igual funciona (lee por la política TO migraciones), y la tabla directa sigue vacía.
  IF (SELECT count(*) FROM membresia) <> 0 THEN RAISE EXCEPTION 'FALLA 12: membresia es legible sin empresa fijada.'; END IF;
  RAISE NOTICE 'PASA 12: mis_empresas(usuario) funciona con FORCE RLS activo y membresia sigue cerrada sin empresa.';
END $$;

-- 13. siguiente() no cambia de empresa dentro de una transacción -----------------------------------------------------
DO $$
DECLARE
  v_alfa uuid := (SELECT id FROM empresa WHERE slug = 'alfa');
  v_beta uuid := (SELECT id FROM empresa WHERE slug = 'beta');
  rechazado boolean := false;
BEGIN
  PERFORM set_config('app.empresa_id', v_alfa::text, true);
  BEGIN
    PERFORM siguiente(v_beta, 'sku:ZZZ', 1);
  EXCEPTION WHEN insufficient_privilege THEN rechazado := true;
  END;
  IF NOT rechazado THEN RAISE EXCEPTION 'FALLA 13: siguiente() aceptó otra empresa dentro de una transacción de Alfa.'; END IF;
  IF current_setting('app.empresa_id') <> v_alfa::text THEN RAISE EXCEPTION 'FALLA 13: el contexto cambió.'; END IF;
  RAISE NOTICE 'PASA 13: siguiente() con otra empresa falla y el contexto sigue siendo el original.';
END $$;

\echo === Fin: si no apareció ninguna línea FALLA, el aislamiento verificado está en orden ===

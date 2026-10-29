-- =============================================================================
-- 0001 · Base de acceso y aislamiento por empresa (Versión local 0.1, DAT-1)
-- Dueño: Ingeniero de Datos. Base: ADR-03, ADR-04 (versión reducida), ADR-05, ADR-06,
-- plan-etapa-1.md A.6.1.
--
-- Qué hace:
--   * Verifica que los roles de base existan y no tengan privilegios de más.
--     Los roles los crea scripts/db-init/01-roles.sh (DevOps) ANTES, con contraseñas
--     que vienen del entorno: ninguna contraseña vive en este archivo.
--   * Funciones de apoyo: uuid_v7, app_empresa_actual, normalizadores.
--   * Macro aplicar_aislamiento(): única forma de crear una tabla de negocio.
--   * Tablas globales (lista cerrada, sin seguridad por fila): empresa, usuario,
--     sesion, enlace_ingreso.
--   * Tablas de empresa: membresia, rol, rol_permiso, auditoria (solo agregar).
--   * mis_empresas(usuario_id): única forma de saber a qué empresas pertenece alguien
--     antes de elegir una (SECURITY DEFINER, lista cerrada de ADR-04).
--
-- Cómo deshacer: en la versión local, `npm run db:reiniciar` (prisma/reiniciar.sql)
-- borra el esquema y vuelve a migrar. No hay deshacer parcial: la 0.1 no guarda datos reales.
-- Solo SQL puro: Prisma aplica este archivo con `prisma migrate deploy`.
-- =============================================================================

-- 1. Comprobaciones previas -----------------------------------------------------
DO $$
DECLARE
  r text;
  fila pg_roles%ROWTYPE;
BEGIN
  IF current_user <> 'migraciones' THEN
    RAISE EXCEPTION 'Esta migración debe aplicarse con el rol "migraciones" (se aplicó con "%").', current_user;
  END IF;

  -- Los normalizadores (tildes, mayúsculas) suponen UTF-8: con otra codificación dos nombres iguales no chocarían.
  IF current_setting('server_encoding') <> 'UTF8' THEN
    RAISE EXCEPTION 'La base debe estar en UTF-8 (está en %). Créela con ENCODING UTF8.', current_setting('server_encoding');
  END IF;

  FOREACH r IN ARRAY ARRAY['migraciones', 'app_empresa', 'app_plataforma', 'lector_auditoria'] LOOP
    SELECT * INTO fila FROM pg_roles WHERE rolname = r;
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Falta el rol de base "%". Debe crearlo scripts/db-init/01-roles.sh antes de migrar.', r;
    END IF;
    IF fila.rolsuper OR fila.rolbypassrls OR fila.rolcreaterole OR fila.rolcreatedb THEN
      RAISE EXCEPTION 'El rol "%" tiene privilegios de más (superusuario, BYPASSRLS, CREATEROLE o CREATEDB). No se migra.', r;
    END IF;
  END LOOP;

  IF NOT EXISTS (SELECT 1 FROM pg_database d JOIN pg_roles o ON o.oid = d.datdba
                 WHERE d.datname = current_database() AND o.rolname = 'migraciones') THEN
    RAISE EXCEPTION 'El dueño de la base debe ser el rol "migraciones".';
  END IF;
END $$;

-- 2. Permisos a nivel de base y esquema ------------------------------------------
-- Nada nuevo nace con permisos para PUBLIC (H-SEG-39).
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO app_empresa, app_plataforma, lector_auditoria;

DO $$
BEGIN
  EXECUTE format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database());
  EXECUTE format('GRANT CONNECT ON DATABASE %I TO app_empresa, app_plataforma, lector_auditoria, migraciones',
                 current_database());
END $$;

-- Extensión necesaria para impedir solapes de historial (EXCLUDE). Es "de confianza":
-- la puede crear el dueño de la base. Se crea antes de quitar EXECUTE por defecto.
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Toda función nueva nace sin EXECUTE para PUBLIC; se concede de forma explícita.
ALTER DEFAULT PRIVILEGES FOR ROLE migraciones REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- 3. Funciones de apoyo --------------------------------------------------------------

-- UUID versión 7 (ordenado en el tiempo). ADR-06: la función SQL propia mientras no haya PostgreSQL 18.
CREATE FUNCTION uuid_v7() RETURNS uuid
LANGUAGE sql VOLATILE PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT encode(
    set_bit(
      set_bit(
        overlay(uuid_send(gen_random_uuid())
                PLACING substring(int8send((floor(extract(epoch FROM clock_timestamp()) * 1000))::bigint) FROM 3)
                FROM 1 FOR 6),
        52, 1),
      53, 1),
    'hex')::uuid
$$;

-- Empresa activa de la transacción. NULLIF porque tras la primera transacción de una
-- conexión reciclada la variable queda vacía y no nula (D03-1). Sin contexto: cero filas.
CREATE FUNCTION app_empresa_actual() RETURNS uuid
LANGUAGE sql STABLE PARALLEL SAFE
SET search_path = pg_catalog
AS $$ SELECT NULLIF(current_setting('app.empresa_id', true), '')::uuid $$;

-- Normalizadores versionados (ADR-06): IMMUTABLE, sin citext ni unaccent.
-- Un cambio de regla exige otra versión (_v2) y una migración que recalcule.
CREATE FUNCTION norm_texto_v1(t text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT lower(regexp_replace(btrim(translate(t, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')), '\s+', ' ', 'g'))
$$;

-- Códigos y series: sin distinguir mayúsculas ni espacios (RF-SKU-002: `lap-0001` = `LAP-0001`).
CREATE FUNCTION norm_codigo_v1(t text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = pg_catalog
AS $$ SELECT lower(regexp_replace(t, '\s+', '', 'g')) $$;

CREATE FUNCTION norm_correo_v1(t text) RETURNS text
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = pg_catalog
AS $$ SELECT lower(btrim(t)) $$;

-- Disparador común: nadie cambia empresa_id ni id de una fila (D03-9).
CREATE FUNCTION impedir_cambio_identidad() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  IF NEW.empresa_id IS DISTINCT FROM OLD.empresa_id
     OR (to_jsonb(NEW) -> 'id') IS DISTINCT FROM (to_jsonb(OLD) -> 'id') THEN
    RAISE EXCEPTION 'No se puede cambiar la empresa ni el identificador de una fila (%).', TG_TABLE_NAME
      USING ERRCODE = 'integrity_constraint_violation';
  END IF;
  RETURN NEW;
END $$;

-- Disparador de tablas "solo agregar" (auditoría, historiales): ni el dueño modifica ni borra.
CREATE FUNCTION bloquear_modificacion() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog
AS $$
BEGIN
  RAISE EXCEPTION 'La tabla % solo admite agregar filas: no se modifica ni se borra.', TG_TABLE_NAME
    USING ERRCODE = 'insufficient_privilege';
END $$;

-- 4. Registro de la macro y la macro misma --------------------------------------------
CREATE TABLE catalogo_aislamiento (
  tabla         text PRIMARY KEY,
  solo_agregar  boolean NOT NULL,
  borrable      boolean NOT NULL,
  creado_en     timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON catalogo_aislamiento TO app_empresa;

-- aplicar_aislamiento: única forma de crear una tabla de negocio (ADR-03). La tabla debe
-- tener ya la columna empresa_id uuid NOT NULL. Hace:
--   1. ENABLE y FORCE ROW LEVEL SECURITY (el dueño tampoco se salta las reglas).
--   2. Política única: empresa_id = app_empresa_actual() (USING y WITH CHECK), sin TO.
--   3. Disparador que impide cambiar empresa_id e id.
--   4. Permisos mínimos para app_empresa: SELECT, INSERT, UPDATE (más DELETE si borrable;
--      solo SELECT e INSERT si solo_agregar, con disparador que bloquea UPDATE/DELETE/TRUNCATE).
--   5. Alta en catalogo_aislamiento.
CREATE FUNCTION aplicar_aislamiento(p_tabla text, p_solo_agregar boolean DEFAULT false, p_borrable boolean DEFAULT false)
RETURNS void
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF p_solo_agregar AND p_borrable THEN
    RAISE EXCEPTION 'Una tabla no puede ser a la vez solo_agregar y borrable (%).', p_tabla;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = p_tabla
                   AND column_name = 'empresa_id' AND is_nullable = 'NO' AND data_type = 'uuid') THEN
    RAISE EXCEPTION 'La tabla % necesita la columna empresa_id uuid NOT NULL.', p_tabla;
  END IF;

  EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', p_tabla);
  EXECUTE format('ALTER TABLE public.%I FORCE ROW LEVEL SECURITY', p_tabla);
  EXECUTE format('CREATE POLICY aislamiento_empresa ON public.%I USING (empresa_id = public.app_empresa_actual()) WITH CHECK (empresa_id = public.app_empresa_actual())', p_tabla);

  EXECUTE format('CREATE TRIGGER trg_%s_identidad BEFORE UPDATE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.impedir_cambio_identidad()', p_tabla, p_tabla);

  EXECUTE format('REVOKE ALL ON TABLE public.%I FROM PUBLIC', p_tabla);
  IF p_solo_agregar THEN
    EXECUTE format('GRANT SELECT, INSERT ON TABLE public.%I TO app_empresa', p_tabla);
    EXECUTE format('CREATE TRIGGER trg_%s_solo_agregar BEFORE UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.bloquear_modificacion()', p_tabla, p_tabla);
    EXECUTE format('CREATE TRIGGER trg_%s_sin_truncar BEFORE TRUNCATE ON public.%I FOR EACH STATEMENT EXECUTE FUNCTION public.bloquear_modificacion()', p_tabla, p_tabla);
  ELSIF p_borrable THEN
    EXECUTE format('GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.%I TO app_empresa', p_tabla);
  ELSE
    EXECUTE format('GRANT SELECT, INSERT, UPDATE ON TABLE public.%I TO app_empresa', p_tabla);
  END IF;

  INSERT INTO public.catalogo_aislamiento (tabla, solo_agregar, borrable) VALUES (p_tabla, p_solo_agregar, p_borrable);
END $$;

-- 5. Tablas globales (lista cerrada, sin empresa_id ni seguridad por fila) -----------------

CREATE TABLE empresa (
  id         uuid PRIMARY KEY DEFAULT uuid_v7(),
  slug       text NOT NULL,
  nombre     text NOT NULL,
  estado     text NOT NULL DEFAULT 'activa',
  creado_en  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_empresa__slug UNIQUE (slug),
  CONSTRAINT ck_empresa__slug CHECK (slug ~ '^[a-z0-9]([a-z0-9-]{0,38}[a-z0-9])?$'),
  CONSTRAINT ck_empresa__nombre CHECK (btrim(nombre) <> ''),
  CONSTRAINT ck_empresa__estado CHECK (estado IN ('activa', 'suspendida'))
);

CREATE TABLE usuario (
  id           uuid PRIMARY KEY DEFAULT uuid_v7(),
  correo       text NOT NULL,
  correo_norm  text GENERATED ALWAYS AS (norm_correo_v1(correo)) STORED,
  nombre       text NOT NULL,
  estado       text NOT NULL DEFAULT 'activo',
  creado_en    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_usuario__correo UNIQUE (correo_norm),
  CONSTRAINT ck_usuario__correo CHECK (correo ~ '^[^@\s]+@[^@\s]+$'),
  CONSTRAINT ck_usuario__nombre CHECK (btrim(nombre) <> ''),
  CONSTRAINT ck_usuario__estado CHECK (estado IN ('activo', 'suspendido'))
);

-- Solo la huella del token (nunca el token): ADR-08.
CREATE TABLE sesion (
  id                    uuid PRIMARY KEY DEFAULT uuid_v7(),
  usuario_id            uuid NOT NULL REFERENCES usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  empresa_id            uuid REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT, -- última empresa usada
  huella                text NOT NULL,
  expira_en             timestamptz NOT NULL,
  ultima_actividad_en   timestamptz NOT NULL DEFAULT now(),
  creada_en             timestamptz NOT NULL DEFAULT now(),
  revocada_en           timestamptz,
  CONSTRAINT uq_sesion__huella UNIQUE (huella)
);
CREATE INDEX ix_sesion__usuario ON sesion (usuario_id);

CREATE TABLE enlace_ingreso (
  id                uuid PRIMARY KEY DEFAULT uuid_v7(),
  usuario_id        uuid NOT NULL REFERENCES usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  huella            text NOT NULL,
  navegador_huella  text,
  vence_en          timestamptz NOT NULL,
  consumido_en      timestamptz,
  creado_en         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uq_enlace_ingreso__huella UNIQUE (huella)
);
CREATE INDEX ix_enlace_ingreso__usuario ON enlace_ingreso (usuario_id);

-- La aplicación lee y escribe usuario, sesión y enlace (solo mediante conGlobal).
-- Nada se borra: una sesión se revoca, un usuario se suspende (principio de historial).
GRANT SELECT, INSERT, UPDATE ON usuario, sesion, enlace_ingreso TO app_empresa;
-- La aplicación solo lee las empresas; crear una empresa es de plataforma (semilla en la 0.1).
GRANT SELECT ON empresa TO app_empresa;
GRANT SELECT, INSERT ON empresa TO app_plataforma;

-- 6. Tablas de empresa de acceso -------------------------------------------------------

CREATE TABLE rol (
  id           uuid DEFAULT uuid_v7(),
  empresa_id   uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  nombre       text NOT NULL,
  nombre_norm  text GENERATED ALWAYS AS (norm_texto_v1(nombre)) STORED,
  es_base      boolean NOT NULL DEFAULT false,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_rol__nombre UNIQUE (empresa_id, nombre_norm),
  CONSTRAINT ck_rol__nombre CHECK (btrim(nombre) <> '')
);
SELECT aplicar_aislamiento('rol');

CREATE TABLE rol_permiso (
  id          uuid DEFAULT uuid_v7(),
  empresa_id  uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  rol_id      uuid NOT NULL,
  permiso     text NOT NULL,
  creado_en   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_rol_permiso__rol_permiso UNIQUE (empresa_id, rol_id, permiso),
  CONSTRAINT fk_rol_permiso__rol FOREIGN KEY (empresa_id, rol_id) REFERENCES rol (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_rol_permiso__permiso CHECK (permiso ~ '^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$')
);
-- Borrable: editar un rol reemplaza su lista de permisos (el cambio queda en la auditoría).
SELECT aplicar_aislamiento('rol_permiso', p_borrable => true);

CREATE TABLE membresia (
  id          uuid DEFAULT uuid_v7(),
  empresa_id  uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  usuario_id  uuid NOT NULL REFERENCES usuario (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  rol_id      uuid NOT NULL,
  estado      text NOT NULL DEFAULT 'activa',
  creado_en   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_membresia__usuario UNIQUE (empresa_id, usuario_id),
  CONSTRAINT fk_membresia__rol FOREIGN KEY (empresa_id, rol_id) REFERENCES rol (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_membresia__estado CHECK (estado IN ('activa', 'suspendida'))
);
CREATE INDEX ix_membresia__rol ON membresia (empresa_id, rol_id);
CREATE INDEX ix_membresia__usuario ON membresia (usuario_id);
SELECT aplicar_aislamiento('membresia');

-- Puerta de las funciones (ADR-03): una política de SOLO LECTURA para el rol dueño, sin BYPASSRLS.
-- Sin ella mis_empresas() no podría leer membresías de varias empresas. Lista cerrada: membresia.
CREATE POLICY lectura_funciones ON membresia FOR SELECT TO migraciones USING (true);

-- Auditoría: solo agregar (RN-007). app_empresa tiene SELECT e INSERT; nada más.
CREATE TABLE auditoria (
  id                  uuid DEFAULT uuid_v7(),
  empresa_id          uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  autor_membresia_id  uuid,           -- nulo = acción del sistema
  accion              text NOT NULL,
  entidad_tipo        text NOT NULL,
  entidad_id          uuid,
  cambios             jsonb,
  motivo              text,
  creado_en           timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT fk_auditoria__autor FOREIGN KEY (empresa_id, autor_membresia_id) REFERENCES membresia (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_auditoria__accion CHECK (btrim(accion) <> '')
);
CREATE INDEX ix_auditoria__fecha ON auditoria (empresa_id, creado_en DESC, id DESC);
CREATE INDEX ix_auditoria__entidad ON auditoria (empresa_id, entidad_tipo, entidad_id);
CREATE INDEX ix_auditoria__autor ON auditoria (empresa_id, autor_membresia_id);
SELECT aplicar_aislamiento('auditoria', p_solo_agregar => true);

-- 7. Funciones DEFINER de la lista cerrada (ADR-04) -----------------------------------------

-- mis_empresas: a qué empresas pertenece un usuario, antes de elegir una. Devuelve lo mínimo.
-- La plan A.6.1 la define con el identificador del usuario. Riesgo conocido (H-SEG-34): quien
-- ejecute SQL como app_empresa puede preguntar por cualquier usuario; el endurecimiento
-- (recibir la huella de la sesión) llega con ADR-04 completo en la Etapa 1 formal.
CREATE FUNCTION mis_empresas(p_usuario_id uuid)
RETURNS TABLE (empresa_id uuid, slug text, nombre text)
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = pg_catalog, pg_temp
AS $$
  SELECT e.id, e.slug, e.nombre
    FROM public.membresia m
    JOIN public.empresa e ON e.id = m.empresa_id
    JOIN public.usuario u ON u.id = m.usuario_id
   WHERE m.usuario_id = p_usuario_id
     AND m.estado = 'activa'
     AND e.estado = 'activa'
     AND u.estado = 'activo'
   ORDER BY e.nombre
$$;

-- 8. EXECUTE explícito (nada para PUBLIC) -------------------------------------------------------
REVOKE ALL ON FUNCTION uuid_v7(), app_empresa_actual(), norm_texto_v1(text), norm_codigo_v1(text),
  norm_correo_v1(text), impedir_cambio_identidad(), bloquear_modificacion(),
  aplicar_aislamiento(text, boolean, boolean), mis_empresas(uuid) FROM PUBLIC;

-- Las usan los valores por defecto, las columnas generadas y las políticas: se evalúan con el rol que escribe.
GRANT EXECUTE ON FUNCTION uuid_v7(), app_empresa_actual(), norm_texto_v1(text), norm_codigo_v1(text),
  norm_correo_v1(text) TO app_empresa, app_plataforma;
GRANT EXECUTE ON FUNCTION mis_empresas(uuid) TO app_empresa;

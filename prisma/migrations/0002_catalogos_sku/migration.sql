-- =============================================================================
-- 0002 · Catálogos, categorías con campos, contadores y maestro de SKU (DAT-1)
-- Base: ADR-03, ADR-06, ADR-15, ADR-17 (campos), indices-claves-naturales.md (B4, B10, B13-B16, C1, A16).
-- Todas las tablas nacen con aplicar_aislamiento() (migración 0001).
-- Cómo deshacer: `npm run db:reiniciar` (versión local); no hay datos reales.
-- =============================================================================

-- 1. Catálogos -------------------------------------------------------------------

CREATE TABLE ubicacion (
  id           uuid DEFAULT uuid_v7(),
  empresa_id   uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  nombre       text NOT NULL,
  nombre_norm  text GENERATED ALWAYS AS (norm_texto_v1(nombre)) STORED,
  descripcion  text,
  activo       boolean NOT NULL DEFAULT true,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_ubicacion__nombre UNIQUE (empresa_id, nombre_norm),
  CONSTRAINT ck_ubicacion__nombre CHECK (btrim(nombre) <> '')
);
SELECT aplicar_aislamiento('ubicacion');

CREATE TABLE proveedor (
  id               uuid DEFAULT uuid_v7(),
  empresa_id       uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  nombre           text NOT NULL,
  nombre_norm      text GENERATED ALWAYS AS (norm_texto_v1(nombre)) STORED,
  documento        text,                      -- identificación fiscal (opcional)
  documento_norm   text GENERATED ALWAYS AS (norm_codigo_v1(documento)) STORED,
  contacto         text,
  activo           boolean NOT NULL DEFAULT true,
  creado_en        timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT ck_proveedor__nombre CHECK (btrim(nombre) <> '')
);
-- B10: un proveedor desactivado sigue ocupando su identificación fiscal.
CREATE UNIQUE INDEX uq_proveedor__documento ON proveedor (empresa_id, documento_norm) WHERE documento_norm IS NOT NULL AND documento_norm <> '';
SELECT aplicar_aislamiento('proveedor');

-- Persona: quien recibe un activo. Homónimos permitidos (RF-PER-010); el correo no se repite (RN-PRS-005).
CREATE TABLE persona (
  id           uuid DEFAULT uuid_v7(),
  empresa_id   uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  nombre       text NOT NULL,
  correo       text,
  correo_norm  text GENERATED ALWAYS AS (norm_correo_v1(correo)) STORED,
  area         text,
  activo       boolean NOT NULL DEFAULT true,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT ck_persona__nombre CHECK (btrim(nombre) <> ''),
  CONSTRAINT ck_persona__correo CHECK (correo IS NULL OR correo ~ '^[^@\s]+@[^@\s]+$')
);
CREATE UNIQUE INDEX uq_persona__correo ON persona (empresa_id, correo_norm) WHERE correo_norm IS NOT NULL;
SELECT aplicar_aislamiento('persona');

-- 2. Categorías y campos personalizados ------------------------------------------------

CREATE TABLE categoria (
  id           uuid DEFAULT uuid_v7(),
  empresa_id   uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  nombre       text NOT NULL,
  nombre_norm  text GENERATED ALWAYS AS (norm_texto_v1(nombre)) STORED,
  prefijo      text NOT NULL,
  activo       boolean NOT NULL DEFAULT true,
  creado_en    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_categoria__prefijo UNIQUE (empresa_id, prefijo),
  CONSTRAINT uq_categoria__nombre UNIQUE (empresa_id, nombre_norm),
  CONSTRAINT ck_categoria__prefijo CHECK (prefijo ~ '^[A-Z0-9]{2,5}$'),
  -- Prefijos reservados para correlativos de documentos (D-049.3, D-079); lista de ADR-15.
  CONSTRAINT ck_categoria__prefijo_reservado CHECK (prefijo NOT IN
    ('ACTV', 'OC', 'RCP', 'OS', 'ACT', 'RCL', 'MNT', 'CTR', 'AYU', 'CAM', 'PRB', 'KB', 'EC', 'PPT', 'MPR', 'GMA', 'LSAP', 'PRG', 'PRS')),
  CONSTRAINT ck_categoria__nombre CHECK (btrim(nombre) <> '')
);
SELECT aplicar_aislamiento('categoria');

CREATE TABLE campo_definicion (
  id            uuid DEFAULT uuid_v7(),
  empresa_id    uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  categoria_id  uuid NOT NULL,
  clave         text NOT NULL,     -- identificador estable; cambiar la etiqueta no rompe los datos
  etiqueta      text NOT NULL,
  tipo          text NOT NULL,
  opciones      jsonb,             -- solo tipo 'lista': arreglo de textos
  obligatorio   boolean NOT NULL DEFAULT false,
  orden         integer NOT NULL DEFAULT 0,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_campo_definicion__clave UNIQUE (empresa_id, categoria_id, clave),
  CONSTRAINT fk_campo_definicion__categoria FOREIGN KEY (empresa_id, categoria_id) REFERENCES categoria (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_campo_definicion__clave CHECK (clave ~ '^[a-z][a-z0-9_]{0,39}$'),
  CONSTRAINT ck_campo_definicion__etiqueta CHECK (btrim(etiqueta) <> ''),
  CONSTRAINT ck_campo_definicion__tipo CHECK (tipo IN ('texto', 'numero', 'fecha', 'lista', 'si_no')),
  CONSTRAINT ck_campo_definicion__opciones CHECK (
    (tipo = 'lista' AND jsonb_typeof(opciones) = 'array' AND jsonb_array_length(opciones) > 0)
    OR (tipo <> 'lista' AND opciones IS NULL))
);
SELECT aplicar_aislamiento('campo_definicion');

-- 3. Contadores (ADR-15) ---------------------------------------------------------------------

CREATE TABLE contador (
  empresa_id  uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  clave       text NOT NULL,
  ultimo      bigint NOT NULL,
  PRIMARY KEY (empresa_id, clave),
  CONSTRAINT ck_contador__clave CHECK (clave ~ '^(sku:[A-Z0-9]{2,5}|doc:[A-Z]{2,5}(-[A-Z])?|prs)$'),
  CONSTRAINT ck_contador__ultimo CHECK (ultimo >= 0)
) WITH (fillfactor = 50, autovacuum_vacuum_scale_factor = 0.01, autovacuum_vacuum_threshold = 20);
SELECT aplicar_aislamiento('contador');

-- siguiente(empresa_id, clave, n): reserva atómica de n números. SECURITY INVOKER (no eleva privilegios).
-- Devuelve el ÚLTIMO número del rango. Si ya hay una empresa fijada en la transacción y es distinta, falla
-- (H-SEG-78): llamarla con otra empresa no puede cambiar el contexto del resto de la transacción.
CREATE FUNCTION siguiente(p_empresa uuid, p_clave text, p_n integer DEFAULT 1) RETURNS bigint
LANGUAGE plpgsql VOLATILE
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_actual uuid := public.app_empresa_actual();
  v_ultimo bigint;
BEGIN
  IF p_empresa IS NULL OR p_clave IS NULL THEN
    RAISE EXCEPTION 'siguiente: empresa y clave son obligatorias.' USING ERRCODE = 'null_value_not_allowed';
  END IF;
  IF p_n IS NULL OR p_n < 1 OR p_n > 10000 THEN
    RAISE EXCEPTION 'siguiente: n debe estar entre 1 y 10000.' USING ERRCODE = 'invalid_parameter_value';
  END IF;
  IF v_actual IS NOT NULL AND v_actual <> p_empresa THEN
    RAISE EXCEPTION 'siguiente: la empresa pedida no es la de la transacción.' USING ERRCODE = 'insufficient_privilege';
  END IF;
  IF v_actual IS NULL THEN
    -- Autocommit: la sentencia es su propia transacción y la empresa se descarta al terminar.
    PERFORM set_config('app.empresa_id', p_empresa::text, true);
  END IF;

  INSERT INTO public.contador AS c (empresa_id, clave, ultimo)
  VALUES (p_empresa, p_clave, p_n)
  ON CONFLICT (empresa_id, clave) DO UPDATE SET ultimo = c.ultimo + p_n
  RETURNING c.ultimo INTO v_ultimo;
  RETURN v_ultimo;
END $$;
REVOKE ALL ON FUNCTION siguiente(uuid, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION siguiente(uuid, text, integer) TO app_empresa;

-- 4. Maestro de SKU ------------------------------------------------------------------------------

CREATE TABLE sku (
  id            uuid DEFAULT uuid_v7(),
  empresa_id    uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  categoria_id  uuid NOT NULL,
  codigo        text NOT NULL,
  codigo_norm   text GENERATED ALWAYS AS (norm_codigo_v1(codigo)) STORED,
  codigo_propio boolean NOT NULL DEFAULT false,   -- true = lo escribió una persona (RF-SKU-005)
  nombre        text NOT NULL,
  control       text NOT NULL,
  valores       jsonb NOT NULL DEFAULT '{}'::jsonb,  -- valores de los campos de la categoría, por clave
  activo        boolean NOT NULL DEFAULT true,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  -- C1 (clase P): el código no se reutiliza nunca, aunque el SKU se desactive. Sin condición a propósito.
  CONSTRAINT uq_sku__codigo UNIQUE (empresa_id, codigo_norm),
  CONSTRAINT fk_sku__categoria FOREIGN KEY (empresa_id, categoria_id) REFERENCES categoria (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_sku__codigo CHECK (btrim(codigo) <> '' AND length(codigo) <= 40),
  CONSTRAINT ck_sku__nombre CHECK (btrim(nombre) <> ''),
  CONSTRAINT ck_sku__control CHECK (control IN ('serie', 'cantidad')),
  CONSTRAINT ck_sku__valores CHECK (jsonb_typeof(valores) = 'object')
);
CREATE INDEX ix_sku__categoria ON sku (empresa_id, categoria_id);
SELECT aplicar_aislamiento('sku');

-- El control (por serie o por cantidad) no cambia cuando ya hay activos o existencias: lo comprueba
-- el disparador de la migración 0003 (se agrega allí, cuando existen esas tablas).

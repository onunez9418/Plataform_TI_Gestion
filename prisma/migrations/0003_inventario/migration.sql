-- =============================================================================
-- 0003 · Inventario: activos (una fila por serie), existencias (por cantidad),
--        asignaciones y valores de campos personalizados (DAT-1)
-- Base: ADR-03, ADR-06, ADR-15 (patrón 3), indices-claves-naturales.md (C2-C6), RF-INV-004/009/010, RN-005.
-- Cómo deshacer: `npm run db:reiniciar` (versión local); no hay datos reales.
-- =============================================================================

-- Las 25 combinaciones de estado del activo (RF-INV-010), en UNA sola función.
-- Estados (RF-INV-009): en_stock, asignado, en_reparacion, extraviado, de_baja.
-- asignado -> asignado es el traspaso a otra persona. extraviado/de_baja -> en_stock es el reingreso
-- (el motivo y el permiso los exige el servicio). El resto es prohibido.
CREATE FUNCTION transicion_valida(p_desde text, p_hacia text) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT CASE p_desde
    WHEN 'en_stock'      THEN p_hacia IN ('asignado', 'en_reparacion', 'extraviado', 'de_baja')
    WHEN 'asignado'      THEN p_hacia IN ('en_stock', 'asignado', 'en_reparacion', 'extraviado', 'de_baja')
    WHEN 'en_reparacion' THEN p_hacia IN ('en_stock', 'asignado', 'extraviado', 'de_baja')
    WHEN 'extraviado'    THEN p_hacia IN ('en_stock', 'de_baja')
    WHEN 'de_baja'       THEN p_hacia IN ('en_stock')
    ELSE false
  END
$$;
REVOKE ALL ON FUNCTION transicion_valida(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION transicion_valida(text, text) TO app_empresa;

-- 1. Activo ------------------------------------------------------------------------------------

CREATE TABLE activo (
  id            uuid DEFAULT uuid_v7(),
  empresa_id    uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  sku_id        uuid NOT NULL,
  serie         text NOT NULL,
  serie_norm    text GENERATED ALWAYS AS (norm_codigo_v1(serie)) STORED,
  ubicacion_id  uuid NOT NULL,
  estado        text NOT NULL DEFAULT 'en_stock',
  anulado_en    timestamptz,       -- solo un lote deshecho libera la serie (C2)
  creado_en     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT fk_activo__sku FOREIGN KEY (empresa_id, sku_id) REFERENCES sku (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_activo__ubicacion FOREIGN KEY (empresa_id, ubicacion_id) REFERENCES ubicacion (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_activo__serie CHECK (btrim(serie) <> '' AND length(serie) <= 80),
  CONSTRAINT ck_activo__estado CHECK (estado IN ('en_stock', 'asignado', 'en_reparacion', 'extraviado', 'de_baja'))
);
-- RN-005 / C2: la serie es única por empresa y SKU. Un activo dado de baja o extraviado SIGUE ocupando
-- su serie (el índice no mira el estado). El nombre es parte del contrato (ADR-06): el servicio traduce el 23505.
CREATE UNIQUE INDEX uq_activo__serie ON activo (empresa_id, sku_id, serie_norm) WHERE anulado_en IS NULL;
-- C3 (apoyo, no único): buscar la misma serie en otro SKU de la empresa.
CREATE INDEX ix_activo__serie ON activo (empresa_id, serie_norm);
CREATE INDEX ix_activo__sku ON activo (empresa_id, sku_id);
CREATE INDEX ix_activo__ubicacion ON activo (empresa_id, ubicacion_id);
CREATE INDEX ix_activo__estado ON activo (empresa_id, estado);
SELECT aplicar_aislamiento('activo');

CREATE FUNCTION trg_activo_reglas() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_control text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT control INTO v_control FROM public.sku WHERE empresa_id = NEW.empresa_id AND id = NEW.sku_id;
    IF v_control IS DISTINCT FROM 'serie' THEN
      RAISE EXCEPTION 'Un SKU que se controla por cantidad no admite activos con serie.' USING ERRCODE = 'check_violation';
    END IF;
  ELSE
    IF NEW.sku_id <> OLD.sku_id THEN
      RAISE EXCEPTION 'Un activo no cambia de SKU.' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.estado IS DISTINCT FROM OLD.estado AND NOT public.transicion_valida(OLD.estado, NEW.estado) THEN
      RAISE EXCEPTION 'Cambio de estado no permitido: de % a %.', OLD.estado, NEW.estado USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION trg_activo_reglas() FROM PUBLIC;
CREATE TRIGGER trg_activo_reglas BEFORE INSERT OR UPDATE ON activo FOR EACH ROW EXECUTE FUNCTION trg_activo_reglas();

-- 2. Existencia (SKU por cantidad) -----------------------------------------------------------------

CREATE TABLE existencia (
  id            uuid DEFAULT uuid_v7(),
  empresa_id    uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  sku_id        uuid NOT NULL,
  ubicacion_id  uuid NOT NULL,
  cantidad      numeric(14, 3) NOT NULL DEFAULT 0,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_existencia__sku_ubicacion UNIQUE (empresa_id, sku_id, ubicacion_id),
  CONSTRAINT fk_existencia__sku FOREIGN KEY (empresa_id, sku_id) REFERENCES sku (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_existencia__ubicacion FOREIGN KEY (empresa_id, ubicacion_id) REFERENCES ubicacion (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  -- Patrón 3 de ADR-15: el saldo nunca es negativo y tiene tope (D-072.1).
  CONSTRAINT ck_existencia__cantidad CHECK (cantidad >= 0 AND cantidad <= 10000000)
);
CREATE INDEX ix_existencia__ubicacion ON existencia (empresa_id, ubicacion_id);
SELECT aplicar_aislamiento('existencia');

CREATE FUNCTION trg_existencia_reglas() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_control text;
BEGIN
  IF TG_OP = 'INSERT' THEN
    SELECT control INTO v_control FROM public.sku WHERE empresa_id = NEW.empresa_id AND id = NEW.sku_id;
    IF v_control IS DISTINCT FROM 'cantidad' THEN
      RAISE EXCEPTION 'Un SKU que se controla por serie no admite existencia por cantidad.' USING ERRCODE = 'check_violation';
    END IF;
  ELSIF NEW.sku_id <> OLD.sku_id OR NEW.ubicacion_id <> OLD.ubicacion_id THEN
    RAISE EXCEPTION 'Una existencia no cambia de SKU ni de ubicación.' USING ERRCODE = 'check_violation';
  END IF;
  NEW.actualizado_en := now();
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION trg_existencia_reglas() FROM PUBLIC;
CREATE TRIGGER trg_existencia_reglas BEFORE INSERT OR UPDATE ON existencia FOR EACH ROW EXECUTE FUNCTION trg_existencia_reglas();

-- RF-SKU-006 y regla de control: el código y el control (serie/cantidad) de un SKU no cambian
-- cuando ya tiene activos o existencias.
CREATE FUNCTION trg_sku_bloquear_cambios() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF (NEW.codigo_norm IS DISTINCT FROM OLD.codigo_norm OR NEW.control IS DISTINCT FROM OLD.control OR NEW.categoria_id <> OLD.categoria_id)
     AND (EXISTS (SELECT 1 FROM public.activo a WHERE a.empresa_id = OLD.empresa_id AND a.sku_id = OLD.id)
          OR EXISTS (SELECT 1 FROM public.existencia e WHERE e.empresa_id = OLD.empresa_id AND e.sku_id = OLD.id)) THEN
    RAISE EXCEPTION 'El código, el tipo de control y la categoría de un SKU con inventario no se cambian.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION trg_sku_bloquear_cambios() FROM PUBLIC;
CREATE TRIGGER trg_sku_bloquear_cambios BEFORE UPDATE ON sku FOR EACH ROW EXECUTE FUNCTION trg_sku_bloquear_cambios();

-- 3. Asignación ----------------------------------------------------------------------------------------

CREATE TABLE asignacion (
  id                         uuid DEFAULT uuid_v7(),
  empresa_id                 uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  activo_id                  uuid NOT NULL,
  persona_id                 uuid NOT NULL,
  desde                      timestamptz NOT NULL DEFAULT now(),
  hasta                      timestamptz,
  asignada_por_membresia_id  uuid,
  motivo                     text,
  creado_en                  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT fk_asignacion__activo FOREIGN KEY (empresa_id, activo_id) REFERENCES activo (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_asignacion__persona FOREIGN KEY (empresa_id, persona_id) REFERENCES persona (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_asignacion__autor FOREIGN KEY (empresa_id, asignada_por_membresia_id) REFERENCES membresia (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_asignacion__fechas CHECK (hasta IS NULL OR hasta >= desde),
  -- El historial no se solapa (ADR-06): ni siquiera una corrección de fechas cruza dos tramos.
  CONSTRAINT ex_asignacion__solape EXCLUDE USING gist (empresa_id WITH =, activo_id WITH =, tstzrange(desde, hasta) WITH &&)
);
-- C5 (clase V): una sola asignación abierta por activo, aunque dos técnicos entreguen a la vez.
CREATE UNIQUE INDEX uq_asignacion__abierta ON asignacion (empresa_id, activo_id) WHERE hasta IS NULL;
CREATE INDEX ix_asignacion__persona ON asignacion (empresa_id, persona_id);
CREATE INDEX ix_asignacion__autor ON asignacion (empresa_id, asignada_por_membresia_id);
SELECT aplicar_aislamiento('asignacion');

-- 4. Valores de campos personalizados -----------------------------------------------------------------
-- Un valor por campo y por SKU o activo (cuatro columnas por tipo, una sola llena). En la 0.1 el SKU
-- guarda sus valores en sku.valores (jsonb); esta tabla queda lista para los valores por activo.

CREATE TABLE valor_campo (
  id            uuid DEFAULT uuid_v7(),
  empresa_id    uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  campo_id      uuid NOT NULL,
  sku_id        uuid,
  activo_id     uuid,
  valor_texto   text,
  valor_numero  numeric(24, 6),
  valor_fecha   date,
  valor_si_no   boolean,
  creado_en     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT fk_valor_campo__campo FOREIGN KEY (empresa_id, campo_id) REFERENCES campo_definicion (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_valor_campo__sku FOREIGN KEY (empresa_id, sku_id) REFERENCES sku (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_valor_campo__activo FOREIGN KEY (empresa_id, activo_id) REFERENCES activo (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_valor_campo__dueno CHECK (num_nonnulls(sku_id, activo_id) = 1),
  CONSTRAINT ck_valor_campo__un_valor CHECK (num_nonnulls(valor_texto, valor_numero, valor_fecha, valor_si_no) <= 1)
);
CREATE UNIQUE INDEX uq_valor_campo__sku ON valor_campo (empresa_id, campo_id, sku_id) WHERE sku_id IS NOT NULL;
CREATE UNIQUE INDEX uq_valor_campo__activo ON valor_campo (empresa_id, campo_id, activo_id) WHERE activo_id IS NOT NULL;
CREATE INDEX ix_valor_campo__sku ON valor_campo (empresa_id, sku_id);
CREATE INDEX ix_valor_campo__activo ON valor_campo (empresa_id, activo_id);
SELECT aplicar_aislamiento('valor_campo');

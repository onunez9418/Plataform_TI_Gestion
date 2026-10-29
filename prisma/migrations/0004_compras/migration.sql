-- =============================================================================
-- 0004 · Órdenes de compra y recepción (S1 de la Versión local 0.1, DAT-1)
-- Base: plan-etapa-1.md A.6.1 (reglas en la base), RF-OC, ADR-13 (separación de funciones), ADR-15 (patrón 3).
-- Reglas que viven en la base:
--   * Quien prepara una orden no la aprueba (disparador sobre orden_aprobacion, y una orden no pasa a
--     "aprobada" sin una aprobación de otra persona).
--   * Una recepción no supera lo pedido: al insertar recepcion_linea la base suma a
--     orden_linea.cantidad_recibida, y el CHECK impide pasarse. El servicio NO actualiza ese campo a mano.
--   * Las líneas solo cambian mientras la orden está en borrador.
-- Cómo deshacer: `npm run db:reiniciar` (versión local); no hay datos reales.
-- =============================================================================

CREATE FUNCTION orden_transicion_valida(p_desde text, p_hacia text) RETURNS boolean
LANGUAGE sql IMMUTABLE PARALLEL SAFE
SET search_path = pg_catalog
AS $$
  SELECT CASE p_desde
    WHEN 'borrador'         THEN p_hacia IN ('por_aprobar')
    WHEN 'por_aprobar'      THEN p_hacia IN ('aprobada', 'rechazada')
    WHEN 'rechazada'        THEN p_hacia IN ('borrador')
    WHEN 'aprobada'         THEN p_hacia IN ('recibida_parcial', 'recibida')
    WHEN 'recibida_parcial' THEN p_hacia IN ('recibida_parcial', 'recibida')
    ELSE false
  END
$$;
REVOKE ALL ON FUNCTION orden_transicion_valida(text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION orden_transicion_valida(text, text) TO app_empresa;

-- 1. Orden de compra -----------------------------------------------------------------------------

CREATE TABLE orden_compra (
  id                          uuid DEFAULT uuid_v7(),
  empresa_id                  uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  numero                      text NOT NULL,      -- OC-000001 (contador doc:OC, lo reserva el servicio)
  proveedor_id                uuid NOT NULL,
  estado                      text NOT NULL DEFAULT 'borrador',
  moneda                      text NOT NULL DEFAULT 'PEN',
  preparada_por_membresia_id  uuid NOT NULL,
  enviada_en                  timestamptz,
  creado_en                   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_orden_compra__numero UNIQUE (empresa_id, numero),
  CONSTRAINT fk_orden_compra__proveedor FOREIGN KEY (empresa_id, proveedor_id) REFERENCES proveedor (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_orden_compra__preparada_por FOREIGN KEY (empresa_id, preparada_por_membresia_id) REFERENCES membresia (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_orden_compra__estado CHECK (estado IN ('borrador', 'por_aprobar', 'aprobada', 'rechazada', 'recibida_parcial', 'recibida')),
  CONSTRAINT ck_orden_compra__moneda CHECK (moneda ~ '^[A-Z]{3}$')
);
CREATE INDEX ix_orden_compra__proveedor ON orden_compra (empresa_id, proveedor_id);
CREATE INDEX ix_orden_compra__preparada_por ON orden_compra (empresa_id, preparada_por_membresia_id);
CREATE INDEX ix_orden_compra__estado ON orden_compra (empresa_id, estado);
SELECT aplicar_aislamiento('orden_compra');

-- 2. Líneas (borrables: solo en borrador, RN-007) --------------------------------------------------------

CREATE TABLE orden_linea (
  id                 uuid DEFAULT uuid_v7(),
  empresa_id         uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  orden_id           uuid NOT NULL,
  sku_id             uuid NOT NULL,
  cantidad           numeric(14, 3) NOT NULL,
  precio_unitario    numeric(19, 4) NOT NULL,
  cantidad_recibida  numeric(14, 3) NOT NULL DEFAULT 0,
  creado_en          timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  -- D2: el mismo SKU no se repite en dos líneas de una orden.
  CONSTRAINT uq_orden_linea__orden_sku UNIQUE (empresa_id, orden_id, sku_id),
  CONSTRAINT fk_orden_linea__orden FOREIGN KEY (empresa_id, orden_id) REFERENCES orden_compra (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_orden_linea__sku FOREIGN KEY (empresa_id, sku_id) REFERENCES sku (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_orden_linea__cantidad CHECK (cantidad > 0 AND cantidad <= 10000000),
  CONSTRAINT ck_orden_linea__precio CHECK (precio_unitario >= 0),
  -- Una recepción no supera lo pedido.
  CONSTRAINT ck_orden_linea__recibida CHECK (cantidad_recibida >= 0 AND cantidad_recibida <= cantidad)
);
CREATE INDEX ix_orden_linea__sku ON orden_linea (empresa_id, sku_id);
SELECT aplicar_aislamiento('orden_linea', p_borrable => true);

-- 3. Aprobaciones (solo agregar) -----------------------------------------------------------------------------

CREATE TABLE orden_aprobacion (
  id                       uuid DEFAULT uuid_v7(),
  empresa_id               uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  orden_id                 uuid NOT NULL,
  aprobador_membresia_id   uuid NOT NULL,
  decision                 text NOT NULL,
  motivo                   text,
  creado_en                timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT fk_orden_aprobacion__orden FOREIGN KEY (empresa_id, orden_id) REFERENCES orden_compra (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_orden_aprobacion__aprobador FOREIGN KEY (empresa_id, aprobador_membresia_id) REFERENCES membresia (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_orden_aprobacion__decision CHECK (decision IN ('aprobada', 'rechazada')),
  CONSTRAINT ck_orden_aprobacion__motivo CHECK (decision <> 'rechazada' OR (motivo IS NOT NULL AND btrim(motivo) <> ''))
);
CREATE INDEX ix_orden_aprobacion__orden ON orden_aprobacion (empresa_id, orden_id);
CREATE INDEX ix_orden_aprobacion__aprobador ON orden_aprobacion (empresa_id, aprobador_membresia_id);
SELECT aplicar_aislamiento('orden_aprobacion', p_solo_agregar => true);

-- 4. Recepciones ---------------------------------------------------------------------------------------------------

CREATE TABLE recepcion (
  id                         uuid DEFAULT uuid_v7(),
  empresa_id                 uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  numero                     text NOT NULL,      -- RCP-000001 (contador doc:RCP)
  orden_id                   uuid NOT NULL,
  ubicacion_id               uuid NOT NULL,
  recibida_por_membresia_id  uuid NOT NULL,
  creado_en                  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_recepcion__numero UNIQUE (empresa_id, numero),
  CONSTRAINT fk_recepcion__orden FOREIGN KEY (empresa_id, orden_id) REFERENCES orden_compra (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_recepcion__ubicacion FOREIGN KEY (empresa_id, ubicacion_id) REFERENCES ubicacion (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_recepcion__recibida_por FOREIGN KEY (empresa_id, recibida_por_membresia_id) REFERENCES membresia (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT
);
CREATE INDEX ix_recepcion__orden ON recepcion (empresa_id, orden_id);
CREATE INDEX ix_recepcion__ubicacion ON recepcion (empresa_id, ubicacion_id);
CREATE INDEX ix_recepcion__recibida_por ON recepcion (empresa_id, recibida_por_membresia_id);
SELECT aplicar_aislamiento('recepcion', p_solo_agregar => true);

CREATE TABLE recepcion_linea (
  id              uuid DEFAULT uuid_v7(),
  empresa_id      uuid NOT NULL REFERENCES empresa (id) ON DELETE RESTRICT ON UPDATE RESTRICT,
  recepcion_id    uuid NOT NULL,
  orden_linea_id  uuid NOT NULL,
  cantidad        numeric(14, 3) NOT NULL,
  series          text[],                      -- series recibidas (SKU por serie)
  creado_en       timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (empresa_id, id),
  CONSTRAINT uq_recepcion_linea__linea UNIQUE (empresa_id, recepcion_id, orden_linea_id),
  CONSTRAINT fk_recepcion_linea__recepcion FOREIGN KEY (empresa_id, recepcion_id) REFERENCES recepcion (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT fk_recepcion_linea__orden_linea FOREIGN KEY (empresa_id, orden_linea_id) REFERENCES orden_linea (empresa_id, id)
    ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT ck_recepcion_linea__cantidad CHECK (cantidad > 0 AND cantidad <= 10000000)
);
CREATE INDEX ix_recepcion_linea__orden_linea ON recepcion_linea (empresa_id, orden_linea_id);
SELECT aplicar_aislamiento('recepcion_linea', p_solo_agregar => true);

-- 5. Disparadores de reglas ---------------------------------------------------------------------------------------------

-- Separación de funciones: quien preparó la orden no la aprueba. Y la orden no pasa a "aprobada"
-- sin una aprobación de otra persona.
CREATE FUNCTION trg_orden_aprobacion_reglas() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_preparo uuid;
  v_estado  text;
BEGIN
  SELECT preparada_por_membresia_id, estado INTO v_preparo, v_estado
    FROM public.orden_compra WHERE empresa_id = NEW.empresa_id AND id = NEW.orden_id;
  IF v_estado IS DISTINCT FROM 'por_aprobar' THEN
    RAISE EXCEPTION 'Solo se aprueba o rechaza una orden que está por aprobar.' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.decision = 'aprobada' AND NEW.aprobador_membresia_id = v_preparo THEN
    RAISE EXCEPTION 'SEPARACION_FUNCIONES: quien preparó la orden no puede aprobarla.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION trg_orden_aprobacion_reglas() FROM PUBLIC;
CREATE TRIGGER trg_orden_aprobacion_reglas BEFORE INSERT ON orden_aprobacion FOR EACH ROW EXECUTE FUNCTION trg_orden_aprobacion_reglas();

CREATE FUNCTION trg_orden_compra_reglas() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.estado <> 'borrador' THEN
      RAISE EXCEPTION 'Una orden nueva nace en borrador.' USING ERRCODE = 'check_violation';
    END IF;
    RETURN NEW;
  END IF;

  IF NEW.proveedor_id <> OLD.proveedor_id AND OLD.estado NOT IN ('borrador', 'rechazada') THEN
    RAISE EXCEPTION 'El proveedor solo se cambia mientras la orden está en borrador.' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.preparada_por_membresia_id <> OLD.preparada_por_membresia_id OR NEW.numero <> OLD.numero THEN
    RAISE EXCEPTION 'El número y quien preparó la orden no se cambian.' USING ERRCODE = 'check_violation';
  END IF;
  IF NEW.estado IS DISTINCT FROM OLD.estado THEN
    IF NOT public.orden_transicion_valida(OLD.estado, NEW.estado) THEN
      RAISE EXCEPTION 'Cambio de estado de orden no permitido: de % a %.', OLD.estado, NEW.estado USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.estado = 'aprobada' AND NOT EXISTS (
         SELECT 1 FROM public.orden_aprobacion a
          WHERE a.empresa_id = NEW.empresa_id AND a.orden_id = NEW.id AND a.decision = 'aprobada'
            AND a.aprobador_membresia_id <> NEW.preparada_por_membresia_id) THEN
      RAISE EXCEPTION 'SEPARACION_FUNCIONES: la orden necesita la aprobación de una persona distinta a quien la preparó.' USING ERRCODE = 'check_violation';
    END IF;
    IF NEW.estado = 'por_aprobar' AND NOT EXISTS (
         SELECT 1 FROM public.orden_linea l WHERE l.empresa_id = NEW.empresa_id AND l.orden_id = NEW.id) THEN
      RAISE EXCEPTION 'Una orden sin líneas no se envía a aprobación.' USING ERRCODE = 'check_violation';
    END IF;
  END IF;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION trg_orden_compra_reglas() FROM PUBLIC;
CREATE TRIGGER trg_orden_compra_reglas BEFORE INSERT OR UPDATE ON orden_compra FOR EACH ROW EXECUTE FUNCTION trg_orden_compra_reglas();

-- Las líneas cambian solo en borrador (el servicio también lo comprueba; aquí no se puede saltar).
CREATE FUNCTION trg_orden_linea_reglas() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_orden uuid;
  v_estado text;
BEGIN
  v_orden := CASE WHEN TG_OP = 'DELETE' THEN OLD.orden_id ELSE NEW.orden_id END;
  SELECT estado INTO v_estado FROM public.orden_compra
   WHERE empresa_id = CASE WHEN TG_OP = 'DELETE' THEN OLD.empresa_id ELSE NEW.empresa_id END AND id = v_orden;

  IF TG_OP = 'UPDATE' AND NEW.cantidad = OLD.cantidad AND NEW.precio_unitario = OLD.precio_unitario
     AND NEW.sku_id = OLD.sku_id AND NEW.orden_id = OLD.orden_id THEN
    RETURN NEW;   -- solo cambió cantidad_recibida (lo hace el disparador de recepcion_linea)
  END IF;
  IF v_estado IS DISTINCT FROM 'borrador' THEN
    RAISE EXCEPTION 'Las líneas de una orden solo se agregan, cambian o borran mientras está en borrador.' USING ERRCODE = 'check_violation';
  END IF;
  RETURN CASE WHEN TG_OP = 'DELETE' THEN OLD ELSE NEW END;
END $$;
REVOKE ALL ON FUNCTION trg_orden_linea_reglas() FROM PUBLIC;
CREATE TRIGGER trg_orden_linea_reglas BEFORE INSERT OR UPDATE OR DELETE ON orden_linea FOR EACH ROW EXECUTE FUNCTION trg_orden_linea_reglas();

-- Recepción: solo de órdenes aprobadas; la línea debe ser de la misma orden; y la base suma lo recibido
-- (patrón 3 de ADR-15), de modo que dos recepciones simultáneas jamás superan lo pedido.
CREATE FUNCTION trg_recepcion_linea_reglas() RETURNS trigger
LANGUAGE plpgsql
SET search_path = pg_catalog, public
AS $$
DECLARE
  v_orden_recepcion uuid;
  v_orden_linea uuid;
  v_estado text;
BEGIN
  SELECT r.orden_id INTO v_orden_recepcion FROM public.recepcion r WHERE r.empresa_id = NEW.empresa_id AND r.id = NEW.recepcion_id;
  SELECT l.orden_id INTO v_orden_linea FROM public.orden_linea l WHERE l.empresa_id = NEW.empresa_id AND l.id = NEW.orden_linea_id;
  IF v_orden_recepcion IS DISTINCT FROM v_orden_linea THEN
    RAISE EXCEPTION 'La línea recibida no pertenece a la orden de esta recepción.' USING ERRCODE = 'check_violation';
  END IF;
  SELECT estado INTO v_estado FROM public.orden_compra WHERE empresa_id = NEW.empresa_id AND id = v_orden_recepcion;
  IF v_estado NOT IN ('aprobada', 'recibida_parcial') THEN
    RAISE EXCEPTION 'Solo se recibe una orden aprobada que aún tiene pendientes.' USING ERRCODE = 'check_violation';
  END IF;
  -- El CHECK ck_orden_linea__recibida rechaza (23514) si se pasa de lo pedido.
  UPDATE public.orden_linea SET cantidad_recibida = cantidad_recibida + NEW.cantidad
   WHERE empresa_id = NEW.empresa_id AND id = NEW.orden_linea_id;
  RETURN NEW;
END $$;
REVOKE ALL ON FUNCTION trg_recepcion_linea_reglas() FROM PUBLIC;
CREATE TRIGGER trg_recepcion_linea_reglas BEFORE INSERT ON recepcion_linea FOR EACH ROW EXECUTE FUNCTION trg_recepcion_linea_reglas();

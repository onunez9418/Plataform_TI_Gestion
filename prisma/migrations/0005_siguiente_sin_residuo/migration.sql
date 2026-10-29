-- =============================================================================
-- 0005 · Corrección DEF-AIS-01 (QA): siguiente() no deja la empresa fijada
-- Antes: si la transacción no tenía empresa, siguiente() la fijaba para el resto de la transacción.
-- Con una empresa ajena eso abría sus filas a las consultas siguientes de la misma transacción.
-- Ahora: si ella fijó la empresa, la vuelve a dejar vacía apenas termina de reservar.
-- CREATE OR REPLACE conserva los permisos (EXECUTE solo para app_empresa).
-- Cómo deshacer: volver a crear la función de la migración 0002 (o `npm run db:reiniciar`).
-- =============================================================================
CREATE OR REPLACE FUNCTION siguiente(p_empresa uuid, p_clave text, p_n integer DEFAULT 1) RETURNS bigint
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
    PERFORM set_config('app.empresa_id', p_empresa::text, true);
  END IF;

  INSERT INTO public.contador AS c (empresa_id, clave, ultimo)
  VALUES (p_empresa, p_clave, p_n)
  ON CONFLICT (empresa_id, clave) DO UPDATE SET ultimo = c.ultimo + p_n
  RETURNING c.ultimo INTO v_ultimo;

  IF v_actual IS NULL THEN
    -- Sin residuo: la empresa fijada aquí no sobrevive a la reserva (vacía, como tras cualquier transacción).
    PERFORM set_config('app.empresa_id', '', true);
  END IF;
  RETURN v_ultimo;
END $$;

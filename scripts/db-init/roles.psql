-- Crea (o actualiza) los roles de la base de datos de la Versión local 0.1 (A.6.1 del plan, ADR-04 reducido).
-- Lo ejecuta el superusuario UNA vez por base, antes de las migraciones. Es repetible.
-- Las contraseñas llegan como variables de psql (p_migraciones, p_app_empresa, ...), nunca escritas aquí.
--
--   migraciones       dueño de la base y de las tablas; solo lo usa el paso de migración.
--   app_empresa       la aplicación; sin dueño, sin BYPASSRLS, sin superusuario.
--   app_plataforma    solo para crear empresas en la semilla.
--   lector_auditoria  reservado, sin uso hoy.
\set ON_ERROR_STOP on

SELECT format('CREATE ROLE %I LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS', r)
FROM unnest(ARRAY['migraciones', 'app_empresa', 'app_plataforma', 'lector_auditoria']) AS r
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = r)
\gexec

SELECT format('ALTER ROLE migraciones PASSWORD %L', :'p_migraciones') \gexec
SELECT format('ALTER ROLE app_empresa PASSWORD %L', :'p_app_empresa') \gexec
SELECT format('ALTER ROLE app_plataforma PASSWORD %L', :'p_app_plataforma') \gexec
SELECT format('ALTER ROLE lector_auditoria PASSWORD %L', :'p_lector_auditoria') \gexec

SELECT format('ALTER DATABASE %I OWNER TO migraciones', current_database()) \gexec
SELECT format('REVOKE ALL ON DATABASE %I FROM PUBLIC', current_database()) \gexec
SELECT format('GRANT CONNECT ON DATABASE %I TO app_empresa, app_plataforma, lector_auditoria', current_database()) \gexec

-- Límites de seguridad y ruta de búsqueda fija (pedido de Datos, ADR-04): una consulta no puede colgar
-- la base ni apoyarse en objetos de otro esquema.
ALTER ROLE app_empresa SET statement_timeout = '30s';
ALTER ROLE app_empresa SET lock_timeout = '5s';
ALTER ROLE app_empresa SET idle_in_transaction_session_timeout = '30s';
ALTER ROLE app_empresa SET search_path = pg_catalog, public;
ALTER ROLE app_plataforma SET search_path = pg_catalog, public;

ALTER SCHEMA public OWNER TO migraciones;
REVOKE ALL ON SCHEMA public FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO app_empresa, app_plataforma, lector_auditoria;

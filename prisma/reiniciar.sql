-- Versión local 0.1: borra todo el esquema de la aplicación para volver a migrar y sembrar.
-- Lo ejecuta `npm run db:reiniciar` con el rol "migraciones" (dueño de la base). Los roles
-- (app_empresa, app_plataforma, ...) viven fuera del esquema y se conservan.
-- NUNCA se usa con datos reales: borra también la auditoría (que por diseño solo se agrega).
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;
REVOKE ALL ON SCHEMA public FROM PUBLIC;

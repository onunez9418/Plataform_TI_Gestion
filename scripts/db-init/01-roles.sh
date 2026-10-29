#!/bin/sh
# Entrada de /docker-entrypoint-initdb.d: la imagen de PostgreSQL la corre sola, una vez,
# cuando el volumen de datos está vacío. Las contraseñas vienen del entorno del servicio "db".
# (Docker puede "cargar" este archivo en vez de ejecutarlo: por eso no usa "exit".)
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" \
  -v "p_migraciones=$PG_PASS_MIGRACIONES" \
  -v "p_app_empresa=$PG_PASS_APP_EMPRESA" \
  -v "p_app_plataforma=$PG_PASS_APP_PLATAFORMA" \
  -v "p_lector_auditoria=$PG_PASS_LECTOR_AUDITORIA" \
  -f /docker-entrypoint-initdb.d/01-roles.sql

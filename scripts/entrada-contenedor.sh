#!/bin/sh
# Entrada del contenedor "app" (Versión local 0.1). Orden:
#   1) espera a la base  2) migra con el rol dueño  3) carga la semilla si la base está vacía
#   4) arranca la aplicación con el rol sin privilegios (app_empresa), sin las claves de los otros roles.
set -eu

: "${MIGRATION_DATABASE_URL:?Falta MIGRATION_DATABASE_URL}"
: "${DATABASE_URL:?Falta DATABASE_URL}"

echo "[arranque] Esperando a la base de datos..."
intentos=0
until pg_isready -q -d "$MIGRATION_DATABASE_URL"; do
  intentos=$((intentos + 1))
  if [ "$intentos" -ge 60 ]; then
    echo "[arranque] La base de datos no respondió en 2 minutos." >&2
    exit 1
  fi
  sleep 2
done
echo "[arranque] Base de datos lista."

if [ -f prisma/schema.prisma ]; then
  echo "[arranque] Aplicando migraciones (rol dueño)..."
  DATABASE_URL="$MIGRATION_DATABASE_URL" npx prisma migrate deploy
else
  echo "[arranque] AVISO: todavía no hay prisma/schema.prisma; no se migra." >&2
fi

if [ -f prisma/semilla/index.ts ]; then
  # Base vacía = ninguna empresa. Si la tabla aún no existe, también se considera vacía.
  cantidad=$(psql -X -At -d "$MIGRATION_DATABASE_URL" -c "select case when to_regclass('public.empresa') is null then 0 else (select count(*) from public.empresa) end")
  if [ "$cantidad" = "0" ]; then
    echo "[arranque] Base vacía: cargando datos de ejemplo (inventados)..."
    npx tsx prisma/semilla/index.ts
  else
    echo "[arranque] La base ya tiene datos; no se carga la semilla."
  fi
else
  echo "[arranque] AVISO: todavía no hay prisma/semilla/index.ts; no se cargan datos." >&2
fi

echo "[arranque] Iniciando la aplicación en el puerto 3000..."
# La aplicación en funcionamiento NO recibe las claves del dueño, de la plataforma ni del lector.
exec env -u MIGRATION_DATABASE_URL -u PLATFORM_DATABASE_URL -u AUDIT_READER_DATABASE_URL \
  npx next start -H 0.0.0.0 -p 3000

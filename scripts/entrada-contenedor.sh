#!/bin/sh
# Entrada del contenedor "app" (Versión local 0.1). Orden:
#   1) espera a la base  2) migra con el rol dueño  3) carga la semilla si la base está vacía
#   4) arranca la aplicación con el rol sin privilegios (app_empresa), sin las claves de los otros roles.
set -eu

: "${MIGRATION_DATABASE_URL:?Falta MIGRATION_DATABASE_URL}"
: "${DATABASE_URL:?Falta DATABASE_URL}"

# Guarda de MODO_LOCAL antes de tocar nada: con una base externa, el contenedor no arranca.
npx tsx scripts/verificar-arranque.ts

echo "[arranque] Esperando a la base de datos..."
node scripts/base.mjs esperar
echo "[arranque] Base de datos lista."

if [ -f prisma/schema.prisma ]; then
  echo "[arranque] Aplicando migraciones (rol dueño)..."
  DATABASE_URL="$MIGRATION_DATABASE_URL" npx prisma migrate deploy
else
  echo "[arranque] AVISO: todavía no hay prisma/schema.prisma; no se migra." >&2
fi

if [ -f prisma/semilla/index.ts ]; then
  # Base vacía = ninguna empresa (base.mjs termina con 0). Si la tabla aún no existe, también cuenta como vacía.
  estado=0
  node scripts/base.mjs vacia || estado=$?
  if [ "$estado" -eq 0 ]; then
    echo "[arranque] Base vacía: cargando datos de ejemplo (inventados)..."
    npx tsx prisma/semilla/index.ts
  elif [ "$estado" -eq 10 ]; then
    echo "[arranque] La base ya tiene datos; no se carga la semilla."
  else
    echo "[arranque] No se pudo comprobar si la base está vacía." >&2
    exit 1
  fi
else
  echo "[arranque] AVISO: todavía no hay prisma/semilla/index.ts; no se cargan datos." >&2
fi

echo "[arranque] Iniciando la aplicación en el puerto 3000..."
# La aplicación en funcionamiento NO recibe las claves del dueño, de la plataforma ni del lector.
exec env -u MIGRATION_DATABASE_URL -u PLATFORM_DATABASE_URL -u AUDIT_READER_DATABASE_URL \
  npx next start -H 0.0.0.0 -p 3000

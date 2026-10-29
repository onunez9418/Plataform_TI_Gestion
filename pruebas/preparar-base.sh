#!/bin/sh
# Levanta una PostgreSQL 16 TEMPORAL y privada para las pruebas de QA (no toca la del equipo).
#   Uso:  sh pruebas/preparar-base.sh [carpeta]     (por defecto /tmp/qa-pg)
# Crea: clúster en <carpeta>/datos, puerto libre desde 54360, base "plataforma", los cuatro roles con
# contraseñas ALEATORIAS (se escriben solo en <carpeta>/entorno.env, fuera del repositorio), aplica las
# migraciones de prisma/migrations y carga la semilla. Para usar luego:  . <carpeta>/entorno.env
# Para apagarla:  sh pruebas/preparar-base.sh <carpeta> detener
set -eu
RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
DIR="${1:-/tmp/qa-pg}"
BIN="${PG_BIN:-/usr/lib/postgresql/16/bin}"
como_pg() { if [ "$(id -u)" = 0 ]; then runuser -u postgres -- "$@"; else "$@"; fi; }

if [ "${2:-}" = "detener" ]; then como_pg "$BIN/pg_ctl" -D "$DIR/datos" -m fast stop; exit 0; fi

aleatoria() { head -c 18 /dev/urandom | od -An -tx1 | tr -d ' \n'; }
mkdir -p "$DIR"; chmod 755 "$DIR"
if [ "$(id -u)" = 0 ]; then chown postgres "$DIR"; fi

PUERTO=54360
while (echo > "/dev/tcp/127.0.0.1/$PUERTO") 2>/dev/null; do PUERTO=$((PUERTO + 1)); done

P_SU=$(aleatoria); P_MIG=$(aleatoria); P_APP=$(aleatoria); P_PLA=$(aleatoria); P_AUD=$(aleatoria)
printf '%s' "$P_SU" > "$DIR/su.tmp"; chmod 644 "$DIR/su.tmp"
como_pg "$BIN/initdb" -D "$DIR/datos" -U postgres -E UTF8 --auth=scram-sha-256 --pwfile="$DIR/su.tmp" > "$DIR/initdb.log"
rm -f "$DIR/su.tmp"
como_pg "$BIN/pg_ctl" -D "$DIR/datos" -l "$DIR/postgres.log" -w \
  -o "-p $PUERTO -k $DIR -c listen_addresses=127.0.0.1 -c max_connections=200" start

export PGPASSWORD="$P_SU"
"$BIN/psql" -X -q -h 127.0.0.1 -p "$PUERTO" -U postgres -d postgres -c 'create database plataforma'
"$BIN/psql" -X -q -h 127.0.0.1 -p "$PUERTO" -U postgres -d plataforma -v ON_ERROR_STOP=1 \
  -v "p_migraciones=$P_MIG" -v "p_app_empresa=$P_APP" -v "p_app_plataforma=$P_PLA" -v "p_lector_auditoria=$P_AUD" \
  -f "$RAIZ/scripts/db-init/roles.psql"
unset PGPASSWORD

U() { echo "postgres://$1:$2@127.0.0.1:$PUERTO/plataforma"; }
{
  echo "export MODO_LOCAL=1 ENTORNO=desarrollo APP_URL=http://localhost:3000"
  echo "export DATABASE_URL=$(U app_empresa "$P_APP")"
  echo "export PLATFORM_DATABASE_URL=$(U app_plataforma "$P_PLA")"
  echo "export MIGRATION_DATABASE_URL=$(U migraciones "$P_MIG")"
  echo "export AUDIT_READER_DATABASE_URL=$(U lector_auditoria "$P_AUD")"
  echo "export POSTGRES_URL_SUPER=$(U postgres "$P_SU")"
  echo "export AUTH_SECRET=$(aleatoria)"
} > "$DIR/entorno.env"
chmod 600 "$DIR/entorno.env"

cd "$RAIZ"
. "$DIR/entorno.env"
DATABASE_URL="$MIGRATION_DATABASE_URL" npx prisma migrate deploy
npx tsx prisma/semilla/index.ts
echo "Listo: puerto $PUERTO. Variables en $DIR/entorno.env  (usar con: . $DIR/entorno.env)"

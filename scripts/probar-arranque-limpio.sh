#!/bin/sh
# Prueba de "arranque desde cero" (A.8.1): clona la rama en una carpeta nueva, construye con Docker Compose,
# comprueba salud, datos de ejemplo, reinicio sin perder datos, aislamiento (14 casos), guarda de MODO_LOCAL
# y que la base no esté publicada. Deja el registro en la salida (redirigir a un archivo si se quiere guardar).
#
# Uso:  sh scripts/probar-arranque-limpio.sh [rama] [--sandbox]
#   rama       por omisión, la rama actual del repositorio.
#   --sandbox  SOLO para el entorno de pruebas del equipo, donde la construcción de Docker no tiene internet
#              directo: pasa por el proxy del entorno (HTTPS_PROXY) y copia su certificado a la imagen de prueba.
set -u
RAMA=""; SANDBOX=0
for a in "$@"; do case "$a" in --sandbox) SANDBOX=1;; *) RAMA="$a";; esac; done
ORIGEN=$(cd "$(dirname "$0")/.." && pwd)
[ -n "$RAMA" ] || RAMA=$(git -C "$ORIGEN" rev-parse --abbrev-ref HEAD)
# Una sola prueba a la vez en esta maquina: comparten el puerto 3000 y el motor de Docker. Si dos corren juntas,
# una borra los contenedores de la otra y los resultados no sirven (ocurrio el 30/10 por la noche).
CERROJO=${TMPDIR:-/tmp}/plataforma-arranque-limpio.lock
if ! mkdir "$CERROJO" 2>/dev/null; then
  OTRO=$(cat "$CERROJO/pid" 2>/dev/null || echo "")
  if [ -n "$OTRO" ] && kill -0 "$OTRO" 2>/dev/null; then echo "Hay otra prueba de arranque en curso (proceso $OTRO). Espere a que termine."; exit 3; fi
  rm -rf "$CERROJO"; mkdir "$CERROJO" || exit 3
fi
echo $$ > "$CERROJO/pid"
# Nombre de proyecto propio: la limpieza final nunca toca los contenedores de otra persona.
COMPOSE_PROJECT_NAME="plataforma-limpio-$$"; export COMPOSE_PROJECT_NAME
TMP=$(mktemp -d)
DEST="$TMP/limpio"
FALLAS=0
ok()   { echo "[OK]    $1"; }
falla(){ echo "[FALLA] $1"; FALLAS=$((FALLAS + 1)); }
limpiar() { (cd "$DEST" 2>/dev/null && docker compose -f docker-compose.yml $OVER down -v >/dev/null 2>&1); rm -rf "$TMP" "$CERROJO"; }
trap limpiar EXIT

echo "== Arranque desde cero · rama $RAMA · $(date -u '+%Y-%m-%d %H:%M UTC') =="
git clone -q --branch "$RAMA" "$ORIGEN" "$DEST" || { echo "No se pudo clonar"; exit 2; }
echo "Commit probado: $(git -C "$DEST" rev-parse --short HEAD)"
cd "$DEST" || exit 2
[ -d node_modules ] && falla "el clon trae node_modules" || ok "clon limpio (sin node_modules ni datos)"
[ -f .env ] && falla "el clon trae .env" || ok "el clon no trae .env"

OVER=""
if [ "$SANDBOX" = 1 ]; then
  cp /root/.ccr/ca-bundle.crt ca.crt
  sed -i 's#^ENV NEXT_TELEMETRY_DISABLED#COPY ca.crt /ca.crt\nENV NODE_EXTRA_CA_CERTS=/ca.crt SSL_CERT_FILE=/ca.crt\nENV NEXT_TELEMETRY_DISABLED#' Dockerfile
  docker build --network=host --build-arg HTTPS_PROXY="$HTTPS_PROXY" -t plataforma-ti-app:limpio . >"$TMP/build.log" 2>&1 \
    && ok "imagen construida (modo sandbox)" || { falla "la construcción falló"; tail -20 "$TMP/build.log"; exit 1; }
  printf 'services:\n  app:\n    build: !reset null\n    image: plataforma-ti-app:limpio\n' > over.yml
  OVER="-f over.yml"
fi

node scripts/crear-env.mjs >/dev/null && ok ".env creado con contraseñas aleatorias" || falla "no se creó .env"
grep -q '^\.env$\|^\.env' .gitignore && ok ".env está en .gitignore" || falla ".env no está en .gitignore"

INICIO=$(date +%s)
if [ "$SANDBOX" = 1 ]; then docker compose -f docker-compose.yml $OVER up -d >"$TMP/up.log" 2>&1; else docker compose up -d --build >"$TMP/up.log" 2>&1; fi
[ $? -eq 0 ] && ok "docker compose up terminó" || { falla "docker compose up falló"; tail -20 "$TMP/up.log"; }
i=0; until curl -fs http://127.0.0.1:3000/api/salud >/dev/null 2>&1; do i=$((i+1)); [ $i -ge 120 ] && break; sleep 3; done
[ $i -lt 120 ] && ok "/api/salud responde ($(( $(date +%s) - INICIO )) s desde el inicio)" || { falla "/api/salud no respondió"; docker compose -f docker-compose.yml $OVER logs --tail 40 app; }

L=$(docker compose -f docker-compose.yml $OVER logs app 2>&1)
echo "$L" | grep -q "All migrations have been successfully applied" && ok "migraciones aplicadas con el rol dueño" || falla "no se vieron las migraciones aplicadas"
echo "$L" | grep -q "Base vacía: cargando datos de ejemplo" && ok "semilla cargada en base vacía" || falla "no se cargó la semilla"

PUB=$(docker compose -f docker-compose.yml $OVER ps --format '{{.Service}} {{.Ports}}')
echo "$PUB" | grep -q "^app 127.0.0.1:3000->3000/tcp" && ok "app publicada solo en 127.0.0.1:3000" || falla "puerto de app inesperado: $PUB"
echo "$PUB" | grep "^db" | grep -q -- "->" && falla "la base está publicada: $PUB" || ok "la base NO está publicada"

curl -s http://127.0.0.1:3000/ | grep -q "ceo@demo.local" && ok "la página de inicio muestra los usuarios de ejemplo" || falla "la página de inicio no muestra a ceo@demo.local"

set -a; . ./.env; set +a
docker compose -f docker-compose.yml $OVER cp prisma/verificar-aislamiento.sql db:/tmp/verificar.sql >/dev/null 2>&1
N=$(docker compose -f docker-compose.yml $OVER exec -T -e PGPASSWORD="$PG_PASS_APP_EMPRESA" db psql -h 127.0.0.1 -U app_empresa -d plataforma -v ON_ERROR_STOP=1 -f /tmp/verificar.sql 2>&1 | grep -c PASA)
[ "$N" -ge 14 ] && ok "aislamiento: $N casos PASA como app_empresa" || falla "aislamiento: solo $N casos PASA"

docker compose -f docker-compose.yml $OVER restart app >/dev/null 2>&1
j=0; until curl -fs http://127.0.0.1:3000/api/salud >/dev/null 2>&1; do j=$((j+1)); [ $j -ge 60 ] && break; sleep 3; done
docker compose -f docker-compose.yml $OVER logs --since 90s app 2>&1 | grep -q "La base ya tiene datos" && ok "reinicio de la app conserva los datos (no vuelve a sembrar)" || falla "tras reiniciar no dijo que la base ya tiene datos"

# Contraseña inventada para esta prueba: se genera al ejecutar (aleatoria), no queda escrita en el repositorio.
CLAVE_PRUEBA=$(head -c 12 /dev/urandom | od -An -tx1 | tr -d ' \n')
SALIDA=$(docker run --rm --entrypoint sh -e MODO_LOCAL=1 -e ENTORNO=desarrollo -e APP_URL=http://localhost:3000 \
  -e DATABASE_URL=postgres://app_empresa:${CLAVE_PRUEBA}@base.externa.example.com:5432/plataforma \
  $(docker compose -f docker-compose.yml $OVER config --images | grep -v postgres | head -1) /app/scripts/entrada-contenedor.sh 2>&1)
echo "$SALIDA" | grep -q "se niega a arrancar" && ok "guarda de MODO_LOCAL: con base externa el contenedor se niega a arrancar" || falla "la guarda de MODO_LOCAL no frenó el arranque"

docker compose -f docker-compose.yml $OVER exec -T app sh -c 'cat /proc/1/environ | tr "\0" "\n" | grep -c "^MIGRATION_DATABASE_URL"' 2>/dev/null | grep -q '^0$' && ok "la app en marcha no recibe la clave del rol dueño" || echo "[AVISO] no se pudo confirmar que la app no reciba la clave del rol dueño"

echo "== Resultado: $FALLAS falla(s) =="
exit "$FALLAS"

#!/bin/sh
# Arma el ZIP que la Jefatura de Proyecto le entrega al CEO (Version local 0.1).
#
# Uso (desde cualquier carpeta del repositorio):   sh scripts/crear-zip-entrega.sh
# Resultado:  entrega/Plataforma-TI-version-local-0.1.zip   (la carpeta entrega/ no se versiona)
#
# Por que asi y no comprimiendo la carpeta de trabajo (pedido de Cumplimiento y del Auditor Tecnico):
#  - Se arma con `git archive` del COMMIT ACTUAL, es decir, solo lo que esta guardado en Git. No lleva
#    la carpeta .git, ni .env (contrasenas de esta computadora), ni .local/, ni node_modules, ni cambios
#    sin guardar.
#  - Los .bat salen con fin de linea de Windows (CRLF) y los .sh con el de Linux (LF), pase lo que pase
#    con la configuracion de Git de quien lo arme.
#  - Antes de comprimir se revisa que no haya nada prohibido; si lo hay, se detiene sin crear el ZIP.
set -eu

NOMBRE="Plataforma-TI-version-local-0.1"
ORIGEN=$(cd "$(dirname "$0")/.." && pwd)
cd "$ORIGEN"

fallar() { echo "[X] $1" >&2; exit 1; }
aviso()  { echo "[!] $1"; }

git rev-parse --git-dir >/dev/null 2>&1 || fallar "Esto no es un repositorio de Git."
COMMIT=$(git rev-parse HEAD)
CORTO=$(git rev-parse --short HEAD)
RAMA=$(git rev-parse --abbrev-ref HEAD)

# Avisar si hay cambios sin guardar en archivos versionados: el ZIP NO los lleva.
if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  aviso "Hay cambios sin guardar (commit) en archivos versionados. El ZIP lleva SOLO el commit $CORTO."
fi

TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
RAIZ="$TMP/$NOMBRE"
mkdir -p "$RAIZ"

echo "== ZIP de entrega · rama $RAMA · commit $CORTO =="
git archive --format=tar HEAD | tar -x -C "$RAIZ"

# --- Sellos de version dentro del ZIP (para saber siempre que se entrego) ---
{
  echo "Plataforma de Gestion de Areas de TI - Version local 0.1 (solo datos inventados)"
  echo "Commit: $COMMIT"
  echo "Rama:   $RAMA"
  echo "Armado: $(date -u '+%Y-%m-%d %H:%M UTC')"
} > "$RAIZ/VERSION.txt"
sed -i 's/$/\r/' "$RAIZ/VERSION.txt"

# --- Fines de linea: .bat y .cmd en CRLF, .sh en LF (se normaliza sin importar la configuracion de Git) ---
find "$RAIZ" -type f \( -name '*.bat' -o -name '*.cmd' \) -exec sed -i 's/\r$//; s/$/\r/' {} +
find "$RAIZ" -type f -name '*.sh' -exec sed -i 's/\r$//' {} +

# --- Revisiones: si algo falla, no se crea el ZIP ---
PROHIBIDO=$(find "$RAIZ" \( -name .git -o -name .local -o -name node_modules -o -name .next \) -prune -print \
  -o -type f \( -name '.env' -o -name '.env.*' -o -name '*.pem' -o -name '*.key' -o -name '*.dump' -o -name '*.bak' \) ! -name '.env.example' -print)
[ -z "$PROHIBIDO" ] || { echo "$PROHIBIDO" >&2; fallar "El paquete contiene archivos que no deben viajar (lista arriba). No se creo el ZIP."; }

for b in iniciar.bat detener.bat reiniciar-datos.bat; do
  [ -f "$RAIZ/$b" ] || fallar "Falta $b en el paquete."
done

# Se usan listas en archivos (y no tuberias) para que "fallar" detenga de verdad todo el script.
find "$RAIZ" -type f \( -name '*.bat' -o -name '*.cmd' \) > "$TMP/lista-bat"
while IFS= read -r f; do
  # cada linea debe terminar en CRLF (lineas == retornos de carro) y no tener caracteres fuera de ASCII
  lineas=$(wc -l < "$f"); crs=$(tr -cd '\r' < "$f" | wc -c)
  [ "$lineas" -eq "$crs" ] || fallar "$f no tiene fin de linea de Windows (CRLF) en todas sus lineas."
  if LC_ALL=C grep -q '[^ -~'"$(printf '\r\t')"']' "$f"; then fallar "$f tiene caracteres fuera de ASCII (con tildes se ve mal en Windows)."; fi
done < "$TMP/lista-bat"

find "$RAIZ" -type f -name '*.sh' > "$TMP/lista-sh"
while IFS= read -r f; do
  if [ -n "$(tr -cd '\r' < "$f")" ]; then fallar "$f tiene fin de linea de Windows (CRLF); debe ser LF."; fi
done < "$TMP/lista-sh"

# En .env.example las variables de clave solo pueden valer vacio o el marcador "cambiar-esto".
if [ -f "$RAIZ/.env.example" ] && grep -E '^[A-Z_]*(PASS|SECRET|KEY)[A-Z_]*=' "$RAIZ/.env.example" | grep -vE '_VERSION=' | grep -qvE '=(cambiar-esto)?$'; then
  fallar ".env.example parece tener un valor real en una variable de clave. No se creo el ZIP."
fi

# --- Comprimir ---
# SALIDA solo se cambia para pruebas del propio script; en uso normal es entrega/.
SALIDA="${SALIDA:-$ORIGEN/entrega}"
mkdir -p "$SALIDA"
ZIP="$SALIDA/$NOMBRE.zip"
rm -f "$ZIP"
if command -v zip >/dev/null 2>&1; then
  (cd "$TMP" && zip -qr -X "$ZIP" "$NOMBRE")
else
  (cd "$TMP" && python3 -m zipfile -c "$ZIP" "$NOMBRE")
fi

# --- Verificar el ZIP ya creado ---
LISTA=$(python3 -I -c 'import sys, zipfile; print("\n".join(zipfile.ZipFile(sys.argv[1]).namelist()))' "$ZIP")
echo "$LISTA" | grep -q "^$NOMBRE/iniciar.bat$" || fallar "El ZIP no contiene iniciar.bat."
if echo "$LISTA" | grep -E "/(\.git|\.local|node_modules)/|/\.env$" >/dev/null; then fallar "El ZIP contiene algo prohibido."; fi

TAM=$(wc -c < "$ZIP")
SUMA=$(sha256sum "$ZIP" | cut -d' ' -f1)
echo "[OK] ZIP creado: $ZIP"
echo "     Commit: $CORTO · archivos: $(echo "$LISTA" | grep -vc '/$') · tamano: $((TAM / 1024)) KB"
echo "     SHA-256: $SUMA"
echo "     Dentro del ZIP hay una carpeta $NOMBRE/ con iniciar.bat, detener.bat y LEEME-PROBAR.md."

#!/usr/bin/env python3
"""Revisión automática de DOCUMENTOS (todavía no hay código).

Responsable: DevOps. Solo usa la biblioteca estándar de Python 3 y git.
Se ejecuta igual en la computadora de cualquiera y en GitHub Actions:

    python3 .github/scripts/revisar_documentos.py citas
    python3 .github/scripts/revisar_documentos.py permisos
    python3 .github/scripts/revisar_documentos.py referencias   # lee .github/referencias-futuras.txt
    python3 .github/scripts/revisar_documentos.py secretos [--historial BASE..HEAD]
    python3 .github/scripts/revisar_documentos.py todo

Cada revisión imprime los problemas como anotaciones de GitHub (::error ...) y
termina con código 1 si encuentra alguno. Las reglas salen de
docs/documento-funcional.md sección 26.2 (prefijos) y de docs/registro-permisos.md.

Excepciones: una línea que habla de algo retirado, renombrado o que "no existe"
se salta en las revisiones de citas y permisos. Un falso positivo de secretos
revisado por una persona se marca con `revisado-sin-secreto` en la misma línea
(y quien revisa el cambio debe aceptarlo por escrito en la propuesta).
"""
import argparse
import glob
import os
import re
import subprocess
import sys

# --- Configuración (si cambia el documento funcional, se cambia aquí en el mismo PR) ---

# Códigos de módulo cerrados (documento funcional 26.2).
CODIGOS_NUCLEO = "ACC PLA EMP USR ROL PER CAT SKU INV OC OS IMP EXP AUD DAT UX".split()
CODIGOS_MODULOS = "PRS ENT PRV GAR NOT LIC LIN DOM AYU ONB POR CMD CAM PRB PRE REP INT".split()
CODIGOS = set(CODIGOS_NUCLEO + CODIGOS_MODULOS)

# Documentos vigentes: aquí las citas deben existir.
NORMATIVOS = (
    ["docs/documento-funcional.md", "docs/registro-permisos.md", "docs/trazabilidad.md"]
    + ["docs/modulos/*.md", "docs/calidad/*.md"]
)

# Registros históricos: se conservan tal como se escribieron (incluyen citas viejas
# a propósito). No se revisan citas ni referencias en ellos; los secretos sí.
HISTORICOS = ("docs/revision-cruzada/", "docs/equipo/mesa-", "docs/equipo/oleada-")

# Líneas que explican algo retirado, renombrado o inexistente.
RETIRADO = re.compile(
    r"retir|\bEra\b|no existe|no se reutiliza|variantes?\b|pasa a\b|se llama\b|"
    r"se eliminan?|renombr|reemplaz|sustituy|en lugar de|\balias\b",
    re.IGNORECASE,
)

FAMILIAS = "RF|RNF|RN|CA|PAN|SUP|RS"
ID_CITA = re.compile(
    r"(?<![A-Za-z0-9_/.\-])((?:%s)(?:-[A-Z]{2,5})?-\d{1,4}[a-z]?\d?)(?![A-Za-z0-9_\-])" % FAMILIAS
)
ID_DEFINICION = re.compile(
    r"^\s*(?:[-*]\s+|\|\s*|#+\s+)?(?:\*\*|~~|_)*\s*"
    r"((?:%s)(?:-[A-Z]{2,5})?-\d{1,4}[a-z]?\d?)\b" % FAMILIAS
)
SIN_MODULO = re.compile(r"(?<![A-Za-z0-9_/.\-])(RF|PAN|SUP)-(\d+)(?![A-Za-z0-9_\-])")
CON_CODIGO = re.compile(
    r"(?<![A-Za-z0-9_/.\-])(RF|RNF|RN|CA|PAN|SUP|S|E|P)-([A-Z]{2,5})-\d+(?![A-Za-z0-9_\-])"
)

problemas = []


def error(archivo, linea, mensaje):
    problemas.append((archivo, linea, mensaje))
    print("::error file=%s,line=%s::%s" % (archivo, linea, mensaje))


def aviso(archivo, linea, mensaje):
    print("::warning file=%s,line=%s::%s" % (archivo, linea, mensaje))


def git(*args):
    return subprocess.check_output(("git",) + args, text=True, errors="replace")


def archivos_versionados():
    return [f for f in git("ls-files").split("\n") if f]


def expandir(patrones):
    salida = []
    for p in patrones:
        salida.extend(sorted(glob.glob(p)))
    return [f for f in salida if os.path.isfile(f)]


def lineas(archivo):
    with open(archivo, encoding="utf-8", errors="replace") as fh:
        return list(enumerate(fh.read().split("\n"), 1))


def es_historico(archivo):
    return archivo.startswith(HISTORICOS)


# ------------------------------------------------------------------ citas
def revisar_citas():
    normativos = expandir(NORMATIVOS)
    definidos = set()
    nucleo = set()
    for archivo in normativos:
        for _, texto in lineas(archivo):
            m = ID_DEFINICION.match(texto)
            if m:
                nuevos = {m.group(1)}
                # Filas de rango: "RS-01 a RS-05" define las cinco.
                rango = re.match(r"(RS)-(\d+)\s+a\s+RS-(\d+)", texto.lstrip("|* ~_#-").strip())
                if rango:
                    ancho = len(rango.group(2))
                    nuevos |= {"RS-%0*d" % (ancho, k) for k in range(int(rango.group(2)), int(rango.group(3)) + 1)}
                definidos |= nuevos
                if archivo == "docs/documento-funcional.md":
                    nucleo |= nuevos

    def existe(i, conjunto):
        if i in conjunto:
            return True
        base = re.sub(r"[a-z]\d?$", "", i)
        if base != i and base in conjunto:
            return True
        # cita de grupo: CA-015 cuando existen CA-015a, CA-015b...
        return any(d.startswith(i) and re.fullmatch(r"[a-z]?\d", d[len(i):]) or d.startswith(i) and re.fullmatch(r"[a-z]\d?", d[len(i):]) for d in conjunto)

    for archivo in normativos:
        for n, texto in lineas(archivo):
            for m in SIN_MODULO.finditer(texto):
                error(archivo, n, "Cita sin código de módulo: %s (debe ser %s-<MÓD>-NN, documento funcional 26.2)"
                      % (m.group(0), m.group(1)))
            for m in CON_CODIGO.finditer(texto):
                if m.group(2) not in CODIGOS:
                    error(archivo, n, "Código de módulo desconocido en %s (los válidos están en 26.2)" % m.group(0))
            if RETIRADO.search(texto):
                continue
            for m in ID_CITA.finditer(texto):
                i = m.group(1)
                partes = i.split("-")
                sin_codigo = len(partes) == 2 and partes[0] in ("RN", "RNF", "CA")
                if sin_codigo:
                    if not existe(i, nucleo):
                        error(archivo, n, "%s no está definido en docs/documento-funcional.md "
                              "(si es de un módulo debe llevar su código: %s-<MÓD>-NN)" % (i, partes[0]))
                elif not existe(i, definidos):
                    error(archivo, n, "%s se cita pero no está definido en ningún documento vigente" % i)


# ---------------------------------------------------------------- permisos
def cargar_registro():
    por_ps, nombres, retirados = {}, set(), set()
    for _, texto in lineas("docs/registro-permisos.md"):
        m = re.match(r"^\|\s*(PS-\d+)\s*\|(.*)", texto)
        if not m:
            continue
        ps = m.group(1)
        if "Retirado" in texto:
            retirados.add(ps)
            por_ps[ps] = None
            continue
        nombre = re.match(r"\s*`([^`]+)`", m.group(2))
        if nombre:
            por_ps[ps] = nombre.group(1)
            nombres.add(nombre.group(1))
    return por_ps, nombres, retirados


def revisar_permisos():
    por_ps, nombres, retirados = cargar_registro()
    if len(por_ps) < 100:
        error("docs/registro-permisos.md", 1, "El registro parece vacío o cambió de formato (%d filas PS)" % len(por_ps))
        return
    nombre_tec = r"`([a-z][a-z0-9_]*\.[a-z][a-z0-9_]*)`"
    par1 = re.compile(r"(PS-\d+)\)?\s*[:·]?\s*" + nombre_tec)
    par2 = re.compile(nombre_tec + r"\s*\(?(PS-\d+)\b")
    junto = re.compile(r"permisos?\s+(?:nuevo\s+|sensible\s+|de\s+)?" + nombre_tec)
    for archivo in expandir(NORMATIVOS):
        for n, texto in lineas(archivo):
            if RETIRADO.search(texto) or "→" in texto:  # "→" = tabla de equivalencias nombre antiguo → PS
                continue
            for m in re.finditer(r"(?<![A-Za-z0-9_\-])(PS-\d+)(?![A-Za-z0-9_\-])", texto):
                ps = m.group(1)
                if ps not in por_ps:
                    error(archivo, n, "%s no existe en docs/registro-permisos.md" % ps)
                elif ps in retirados:
                    error(archivo, n, "%s está retirado en el registro y no debe citarse como vigente" % ps)
            for m in par1.finditer(texto):
                ps, nombre = m.groups()
                if por_ps.get(ps) and por_ps[ps] != nombre:
                    error(archivo, n, "%s se llama `%s` en el registro, no `%s`" % (ps, por_ps[ps], nombre))
            for m in par2.finditer(texto):
                nombre, ps = m.groups()
                if por_ps.get(ps) and por_ps[ps] != nombre:
                    error(archivo, n, "%s se llama `%s` en el registro, no `%s`" % (ps, por_ps[ps], nombre))
            for m in junto.finditer(texto):
                if m.group(1) not in nombres:
                    error(archivo, n, "El permiso `%s` no está en docs/registro-permisos.md" % m.group(1))


# ------------------------------------------------------------- referencias
def cargar_futuras():
    ruta = ".github/referencias-futuras.txt"
    futuras = set()
    if os.path.isfile(ruta):
        for n, texto in lineas(ruta):
            limpio = texto.split("#")[0].strip()
            if not limpio:
                continue
            if os.path.exists(limpio):
                error(ruta, n, "%s ya existe: bórrelo de esta lista" % limpio)
            futuras.add(limpio)
    return futuras


def revisar_referencias():
    futuras = cargar_futuras()
    ruta = re.compile(r"(?<![A-Za-z0-9_./\-])((?:docs|\.github|\.claude)/[A-Za-z0-9_./\-áéíóúñ]*[A-Za-z0-9_\-áéíóúñ/])")
    enlace = re.compile(r"\[[^\]]*\]\(([^)\s#]+)(?:#[^)]*)?\)")
    for archivo in archivos_versionados():
        if not archivo.endswith(".md") or es_historico(archivo):
            continue
        for n, texto in lineas(archivo):
            candidatas = []
            for m in ruta.finditer(texto):
                p = m.group(1).rstrip(".")
                if "*" in p or "<" in p or "NNN" in p or "AAAA" in p or p.endswith("-"):
                    continue  # plantillas de nombre o comodines
                candidatas.append(p)
            for m in enlace.finditer(texto):
                destino = m.group(1)
                if re.match(r"[a-z]+:", destino):
                    continue
                candidatas.append(os.path.normpath(os.path.join(os.path.dirname(archivo), destino)))
            for p in candidatas:
                if os.path.exists(p):
                    continue
                if p.endswith("/") or p in futuras:
                    aviso(archivo, n, "Citado pero todavía no existe (previsto): %s" % p)
                else:
                    error(archivo, n, "Referencia rota: %s no existe" % p)


# ----------------------------------------------------------------- secretos
PATRONES = [
    ("clave privada", re.compile(r"-----BEGIN (?:[A-Z]+ )*PRIVATE KEY(?: BLOCK)?-----\s*[A-Za-z0-9+/]{40,}")),
    ("clave de acceso de AWS", re.compile(r"\b(?:AKIA|ASIA|AGPA|AIDA|AROA)[0-9A-Z]{16}\b")),
    ("token de GitHub", re.compile(r"\b(?:gh[pousr]_[A-Za-z0-9]{36,}|github_pat_[A-Za-z0-9_]{50,})\b")),
    ("token de Slack", re.compile(r"\bxox[abprs]-[A-Za-z0-9\-]{10,}")),
    ("clave de Stripe", re.compile(r"\b[sr]k_live_[0-9A-Za-z]{16,}\b")),
    ("clave de Google", re.compile(r"\bAIza[0-9A-Za-z_\-]{35}\b")),
    ("clave de OpenAI o Anthropic", re.compile(r"\bsk-(?:ant-)?[A-Za-z0-9_\-]{32,}\b")),
    ("clave de SendGrid", re.compile(r"\bSG\.[A-Za-z0-9_\-]{16,}\.[A-Za-z0-9_\-]{16,}\b")),
    ("clave de Resend", re.compile(r"\bre_[A-Za-z0-9]{20,}\b")),
    ("token JWT", re.compile(r"\beyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b")),
    ("dirección con contraseña", re.compile(r"\b[a-z][a-z0-9+.\-]*://[^\s:/@]+:([^\s@/]{6,})@[^\s/]+")),
    ("asignación de secreto", re.compile(
        r"(?i)\b[a-z0-9_]*(?:secret|token|passw(?:or)?d|api[_\-]?key|private[_\-]?key|access[_\-]?key)"
        r"[a-z0-9_]*\s*[:=]\s*[\"']?([A-Za-z0-9+/_\-=.]{20,})[\"']?")),
]
RELLENO = re.compile(r"cambiar-esto|changeme|ejemplo|example|xxxx|\$\{|<[^>]+>|\*{3,}|tu-clave|su-clave", re.I)
ARCHIVOS_PROHIBIDOS = re.compile(
    r"(^|/)\.env(\.(?!example$)[^/]*)?$|\.(pem|key|p12|pfx|jks|keystore|dump|backup|bak|pgdump)$|"
    r"\.sql\.(gz|zst|enc)$|(^|/)(id_rsa|id_ed25519)(\.[^/]*)?$|(^|/)(credentials|service-account[^/]*)\.json$"
)
HOJAS = re.compile(r"\.(xlsx|xls|xlsm|csv)$")
HOJAS_PERMITIDAS = re.compile(r"^(tests/fixtures/|public/plantillas/)")
MARCA_REVISADO = "revisado-sin-secreto"


def buscar_secretos_en(texto_linea):
    for nombre, patron in PATRONES:
        for m in patron.finditer(texto_linea):
            valor = m.group(1) if m.groups() else m.group(0)
            if nombre in ("dirección con contraseña", "asignación de secreto") and RELLENO.search(valor):
                continue
            yield nombre


def revisar_secretos(historial):
    for archivo in archivos_versionados():
        if ARCHIVOS_PROHIBIDOS.search(archivo):
            error(archivo, 1, "Archivo que no debe estar en el repositorio (claves, volcados o .env)")
        elif HOJAS.search(archivo) and not HOJAS_PERMITIDAS.match(archivo):
            error(archivo, 1, "Hoja de cálculo o CSV fuera de las carpetas de prueba inventada (puede traer datos reales)")
        try:
            with open(archivo, "rb") as fh:
                contenido = fh.read()
        except OSError:
            continue
        if b"\0" in contenido[:4096]:
            continue
        texto = contenido.decode("utf-8", errors="replace")
        # La clave privada puede ocupar varias líneas: se busca sobre el texto completo.
        for nombre, patron in PATRONES[:1]:
            for m in patron.finditer(texto):
                n = texto.count("\n", 0, m.start()) + 1
                error(archivo, n, "Posible %s. Si ya se publicó, se considera comprometida: hay que rotarla." % nombre)
        for n, linea in enumerate(texto.split("\n"), 1):
            if MARCA_REVISADO in linea:
                continue
            for nombre in buscar_secretos_en(linea):
                if nombre == "clave privada":
                    continue
                error(archivo, n, "Posible %s. Si ya se publicó, se considera comprometida: hay que rotarla." % nombre)
    if historial:
        # Un secreto agregado y borrado en un commit posterior del mismo cambio sigue en el historial.
        actual, archivo = None, "(historial)"
        for linea in git("log", "-p", "--no-color", "--format=commit %h", historial).split("\n"):
            if linea.startswith("commit "):
                actual = linea[7:]
            elif linea.startswith("+++ b/"):
                archivo = linea[6:]
            elif linea.startswith("+") and not linea.startswith("+++") and MARCA_REVISADO not in linea:
                for nombre in buscar_secretos_en(linea[1:]):
                    error(archivo, 1, "Posible %s agregado en el commit %s (aunque después se borre, queda en el historial)"
                          % (nombre, actual))


# --------------------------------------------------------------------- main
def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("revision", choices=["citas", "permisos", "referencias", "secretos", "todo"])
    ap.add_argument("--historial", help="rango de commits a revisar, por ejemplo origin/main..HEAD")
    args = ap.parse_args()
    raiz = git("rev-parse", "--show-toplevel").strip()
    os.chdir(raiz)
    pasos = {
        "citas": revisar_citas,
        "permisos": revisar_permisos,
        "referencias": revisar_referencias,
        "secretos": lambda: revisar_secretos(args.historial),
    }
    for nombre in (pasos if args.revision == "todo" else [args.revision]):
        antes = len(problemas)
        pasos[nombre]()
        print("[%s] %s" % (nombre, "OK" if len(problemas) == antes else "%d problema(s)" % (len(problemas) - antes)))
    sys.exit(1 if problemas else 0)


if __name__ == "__main__":
    main()

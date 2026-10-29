import re, glob, sys, collections, subprocess, datetime

ROOT = '.'
CORE = ROOT + '/docs/documento-funcional.md'
CORE_MODS = {'ACC','PLA','EMP','USR','ROL','PER','CAT','SKU','INV','OC','OS','IMP','EXP','AUD','DAT','UX'}
FASE2, FASE3 = 8, 9


def etiqueta(n):
    return f'Etapa {n}' if n is not None and n <= 7 else ('Fase 2' if n == FASE2 else ('Fase 3' if n == FASE3 else '?'))


def leer(path):
    return open(path, encoding='utf8').read().split('\n')


def expandir_refs(s, mods_ok):
    """IDs completos de requisitos citados en un texto, con abreviaturas (RF-ACC-003, 007; PER-009; 001 a 003)."""
    salida = []; kind = None; mod = None; last = None; rango = False
    tok = re.compile(r'\b(RNF|RF|RN|RS)-(?:([A-Z]{2,4})-)?(\d+)\b|\b([A-Z]{2,4})-(\d{2,3})\b|\b(\d{2,3})\b|\b(a)\b')
    for m in tok.finditer(s):
        k, md, n, md2, n2, bare, a = m.groups()
        if k:
            kind, mod, last = k, md, int(n); salida.append((kind, mod, last)); rango = False
        elif md2:
            if kind in ('RF', 'RNF') and md2 in mods_ok:
                mod, last = md2, int(n2); salida.append((kind, mod, last)); rango = False
        elif bare:
            if kind is None: continue
            antes = s[max(0, m.start() - 4):m.start()]
            if re.search(r'(,|;|\by|\ba)\s*$', antes):
                v = int(bare)
                if rango:
                    for x in range(last + 1, v + 1): salida.append((kind, mod, x))
                    rango = False
                else:
                    salida.append((kind, mod, v))
                last = v
        elif a:
            if salida: rango = True
    ids = set()
    for kind, mod, n in salida:
        ancho = 2 if kind == 'RS' else 3
        ids.add(f"{kind}-{mod + '-' if mod else ''}{n:0{ancho}d}")
    return ids


def expandir_ca(s, sigla=None):
    """IDs de CA citados: CA-004 y CA-079; CA-ENT-01, 12, 13; CA-REP-01 a 03; '04, 15' con sigla del módulo."""
    s = s.strip()
    if sigla and s and re.fullmatch(r'[\d, y]+', s):
        s = ', '.join(f'CA-{sigla}-{x}' if i == 0 else x for i, x in enumerate(re.findall(r'\d+', s)))
        s = s.replace(', ', ', ')
    out = []; pref = None; last = None; rango = False
    tok = re.compile(r'\b(CA-(?:([A-Z]{2,4})-)?(\d+)([a-z]\d?)?)\b|\b(\d{2,3})\b|\b(a)\b')
    for m in tok.finditer(s):
        full, md, n, suf, bare, a = m.groups()
        if full:
            pref = md; w = len(n); v = int(n)
            if rango and last is not None:
                for x in range(last + 1, v): out.append((md, x, '', w))
                rango = False
            out.append((md, v, suf or '', w)); last = v
        elif bare and (pref is not None or sigla):
            antes = s[max(0, m.start() - 3):m.start()]
            if re.search(r'(,|\by|\ba)\s*$', antes):
                v = int(bare)
                if rango and last is not None:
                    for x in range(last + 1, v): out.append((pref or sigla, x, '', len(bare)))
                    rango = False
                out.append((pref if pref is not None else sigla, v, '', len(bare))); last = v
        elif a:
            rango = True
    ids = []
    for md, n, suf, w in out:
        ids.append(f"CA-{md + '-' if md else ''}{n:0{max(w,2) if md else 3}d}{suf}")
    return ids


def etapas_de(cuando):
    """(mínima, máxima) de un texto 'v1, Etapa 4', 'v1, Etapas 1 y 5', 'Fase 2, ola B'."""
    if cuando is None: return None, None
    nums = []
    for m in re.finditer(r'Etapas? ([\d ,y]+)', cuando):
        nums += [int(x) for x in re.findall(r'\d', m.group(1))]
    nums += [int(x) for x in re.findall(r'completa en Etapa (\d)', cuando)]
    if nums: return min(nums), max(nums)
    if 'Fase 2' in cuando: return FASE2, FASE2
    if 'Fase 3' in cuando: return FASE3, FASE3
    return None, None


# ---------- núcleo ----------
def leer_nucleo():
    doc = leer(CORE)
    reqs = {}
    for i, l in enumerate(doc, 1):
        m = re.match(r'^\| ((?:RF-[A-Z]+-\d+)|(?:RNF-\d+)) \|', l)
        if m:
            p = [x.strip() for x in l.strip().strip('|').split('|')]
            mn, mx = etapas_de(p[2])
            reqs[p[0]] = dict(id=p[0], texto=p[1], cuando=p[2], min=mn, max=mx, ca=expandir_ca(p[3]), linea=i,
                              retirado=(p[2] == '-' or p[3] == '-'))
    rns = {}
    for i, l in enumerate(doc, 1):
        m = re.match(r'^\| (RN-\d{3}) \| (.*) \| ([^|]*) \|$', l)
        if m: rns[m.group(1)] = dict(id=m.group(1), texto=m.group(2), ca=expandir_ca(m.group(3)), linea=i)
    cas = {}
    for i, l in enumerate(doc, 1):
        m = re.match(r'^\s*- \*\*(CA-\d{3}[a-z]?\d?) · (.+?)\*\* \((.*?)\)\.\s*(.*)$', l)
        if m:
            cas[m.group(1)] = dict(id=m.group(1), modulo='núcleo', titulo=m.group(2),
                                   cubre=expandir_refs(m.group(3), CORE_MODS), texto=m.group(4), linea=i, cabecera=m.group(3))
    # un criterio "padre" que solo anuncia su partición (el que anuncia "Se divide") no es un criterio: lo prueban sus hijos
    for d in list(cas):
        if cas[d]['texto'].startswith('Se divide') and any(o != d and o.startswith(d) for o in cas):
            cas[d]['padre'] = True
    for d in [d for d in cas if cas[d].get('padre')]:
        del cas[d]
    # tabla 22.1
    ini = [i for i, l in enumerate(doc) if l.startswith('### 22.1')][0]
    etapa_run, completa = {}, {}
    for l in doc[ini:ini + 20]:
        m = re.match(r'^\| \*\*(Etapa \d|Fase \d)\*\* \| (.*) \|$', l)
        if not m: continue
        et = int(m.group(1)[-1]) if m.group(1).startswith('Etapa') else (FASE2 if m.group(1) == 'Fase 2' else FASE3)
        for p in re.split(r',\s*(?![^()]*\))', m.group(2)):
            p = p.strip()
            r = re.match(r'^CA-(\d{3})([a-z]?\d?)? a CA-(\d{3})([a-z]?)', p)
            ids = []
            if r:
                for d in cas:
                    n = int(d[3:6])
                    if int(r.group(1)) <= n <= int(r.group(3)): ids.append(d)
            else:
                r = re.match(r'^(CA-\d{3}[a-z]?\d?)', p)
                if r: ids = [r.group(1)]
            comp = re.search(r'completa en (Etapa \d|Fase \d)', p)
            for d in ids:
                if d in etapa_run and et > etapa_run[d]:
                    completa[d] = et     # segunda aparición (ej. la copia externa de la auditoría)
                    continue
                etapa_run[d] = et
                if comp:
                    completa[d] = int(comp.group(1)[-1]) if comp.group(1).startswith('Etapa') else (FASE2 if comp.group(1) == 'Fase 2' else FASE3)
    for d in cas:
        cas[d]['etapa'] = etapa_run.get(d)
        cas[d]['completa'] = completa.get(d)
    return reqs, rns, cas


# ---------- módulos ----------
# Módulos nuevos en redacción (2026-10-29). Solo entran a las cifras cuando el archivo existe y está completo.
MODULOS_NUEVOS = {'microsoft-entra-intune': 'MSF', 'asistente-ia': 'ASI'}


def estado_modulo_nuevo(nombre):
    """'no existe' | 'incompleto' | 'completo'. Completo = sigla declarada, al menos una fila RF o RNF, una regla RN,
    la sección de criterios de aceptación y al menos un criterio CA con la sigla del módulo."""
    ruta = ROOT + f'/docs/modulos/{nombre}.md'
    try:
        t = leer(ruta)
    except OSError:
        return 'no existe'
    sg = MODULOS_NUEVOS[nombre]
    txt = '\n'.join(t)
    ok = (nombre_sigla(ruta) == sg
          and re.search(r'^\| (RF|RNF)-%s-\d+ \|' % sg, txt, re.M)
          and re.search(r'^\| RN-%s-\d+ \|' % sg, txt, re.M)
          and re.search(r'^#+ .*Criterios de aceptaci', txt, re.M | re.I)
          and re.search(r'CA-%s-\d{2}' % sg, txt))
    return 'completo' if ok else 'incompleto'


def leer_modulos():
    reqs, cas, rns = {}, {}, {}
    for f in sorted(glob.glob(ROOT + '/docs/modulos/*.md')):
        nombre = f.split('/')[-1][:-3]
        if nombre in MODULOS_NUEVOS and estado_modulo_nuevo(nombre) != 'completo':
            continue
        t = leer(f)
        sigla = re.search(r'sigla ([A-Z]{3})|Sigla:\*\* ([A-Z]{3})|sigla de requisitos:\*\* ([A-Z]{3})', '\n'.join(t[:8]), re.I)
        for i, l in enumerate(t, 1):
            m = re.match(r'^\| ((?:RF|RNF|RN)-[A-Z]{3}-\d+) \|', l)
            if m:
                p = [x.strip() for x in l.strip().strip('|').split('|')]
                sg = p[0].split('-')[1]
                if len(p) == 5 and p[0].startswith('RN-'):
                    cuando, cacol = p[3], p[4]
                else:
                    cuando = p[2] if len(p) >= 3 else None
                    cacol = p[3] if len(p) >= 4 else ''
                mn, mx = etapas_de(cuando)
                d = dict(id=p[0], modulo=nombre, texto=p[1], cuando=cuando, min=mn, max=mx,
                         ca=expandir_ca(cacol, sg), linea=i)
                (rns if p[0].startswith('RN-') else reqs)[p[0]] = d
        mods_ok = CORE_MODS | {nombre_sigla(x) for x in glob.glob(ROOT + '/docs/modulos/*.md')}
        for i, l in enumerate(t, 1):
            if re.match(r'^\| (RF|RN|RNF|RS)-', l): continue
            m = re.match(r'^\s*(?:[-*]\s+|\|\s*)?\**\s*(CA-[A-Z]{2,4}-\d{2}[a-z]?)\b(.*)$', l)
            if m and m.group(1) not in cas:
                resto = m.group(2)
                if l.lstrip().startswith('|'):
                    celdas = [x.strip() for x in l.strip().strip('|').split('|')]
                    resto_c = celdas[1:]
                    con_refs = [c for c in resto_c if not re.search(r'Dad[oa]s?\b', c) and re.search(r'\b(RF|RN|RNF|RS)-', c)]
                    cab = ' '.join(con_refs)
                    texto = ' '.join(c for c in resto_c if c not in con_refs)
                else:
                    corte = re.search(r'(?<![A-Za-zñáéíóú])\*{0,2}Dad[oa]s?\b', resto, re.I)
                    cab = resto[:corte.start()] if corte else resto[:200]
                    texto = resto[corte.start():] if corte else resto
                cas[m.group(1)] = dict(id=m.group(1), modulo=nombre, titulo='', cubre=expandir_refs(cab, mods_ok), cabecera=cab.strip(' *.()'),
                                       texto=re.sub(r'\*', '', texto).strip(), linea=i, archivo=f.split('/')[-1])
    return reqs, rns, cas


def nombre_sigla(f):
    cab = '\n'.join(leer(f)[:8])
    m = re.search(r'sigla[^A-Z`]{0,25}`?([A-Z]{3})\b', cab, re.I) or re.search(r'Sigla:\*\* ([A-Z]{3})', cab)
    return m.group(1) if m else ''


if __name__ == '__main__':
    nreqs, nrns, ncas = leer_nucleo()
    mreqs, mrns, mcas = leer_modulos()
    print('núcleo: RF/RNF', len(nreqs), 'RN', len(nrns), 'CA', len(ncas))
    print('módulos: RF/RNF', len(mreqs), 'RN', len(mrns), 'CA', len(mcas))

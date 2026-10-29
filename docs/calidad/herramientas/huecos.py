"""Revisión de huecos entre requisitos, reglas y criterios (solo lectura).
Uso, desde la raíz del repositorio:  python3 -I docs/calidad/herramientas/huecos.py
Lo usa también traza.py para la sección "Lo que falta, exacto, y de quién" de docs/trazabilidad.md."""
import sys, os, re, glob, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lectura as L

TOKEN_CA = re.compile(r'\bCA-(?:[A-Z]{2,4}-)?\d{2,3}[a-z]?\d?\b')
HISTORICO = re.compile(r'antigua|se parten|se partió|Versión 0\.|se dividió', re.I)  # línea que habla de un criterio que ya se partió
DEF_CA = re.compile(r'^\s*(?:[-*]\s+|\|\s*)?\**\s*(CA-(?:[A-Z]{2,4}-)?\d{2,3}[a-z]?\d?)\b')


def citas_rotas_en_columnas(reqs, rns, todos):
    """CA que una fila RF, RNF o RN pone en su columna y que no existe."""
    return sorted((r['id'], c) for r in list(reqs.values()) + list(rns.values()) for c in r['ca'] if c not in todos)


def citas_rotas_en_texto(todos):
    """CA nombrado en cualquier parte de las fuentes (documento, módulos, registro) que no está definido.
    Un 'padre' que solo anuncia su partición sí está definido (se lee como encabezado)."""
    fuentes = [L.CORE, L.ROOT + '/docs/registro-permisos.md'] + sorted(glob.glob(L.ROOT + '/docs/modulos/*.md'))
    definidos, usos = set(), collections.defaultdict(list)
    for f in fuentes:
        for i, l in enumerate(L.leer(f), 1):
            m = DEF_CA.match(l)
            if m: definidos.add(m.group(1))
            hist = bool(HISTORICO.search(l))
            for t in TOKEN_CA.findall(l): usos[t].append((f'{os.path.relpath(f, L.ROOT)}:{i}', hist))
    rotos, historicos = {}, {}
    for t, lugares in usos.items():
        if t in todos or t in definidos: continue
        malos = [x for x, h in lugares if not h]
        viejos = [x for x, h in lugares if h]
        if malos: rotos[t] = malos
        if viejos: historicos[t] = viejos
    return rotos, historicos


def requisitos_inexistentes(todos, reqs, rns):
    """RF, RNF o RN que la cabecera de un criterio nombra y no existe."""
    ok = set(reqs) | set(rns)
    out = []
    for c, v in todos.items():
        for i in v['cubre']:
            if i.startswith(('RF-', 'RNF-', 'RN-')) and i not in ok: out.append((c, i))
    return sorted(out)


def criterios_sin_requisito(todos):
    """(sin nada que los cite, solo citados por reglas RN o RS). Un criterio sin ningún RF, RNF ni RN es un hallazgo."""
    sin_nada = sorted(c for c, v in todos.items() if not v['reqs'])
    solo_rn = sorted(c for c, v in todos.items() if v['reqs'] and v['req_min'] is None)
    return sin_nada, solo_rn


def reglas_sin_criterio(nrns, mrns, todos):
    """RN que ni su columna CA ni la cabecera de un criterio conectan con un criterio que exista."""
    lista = []
    for k, r in {**nrns, **mrns}.items():
        en_col = [c for c in r['ca'] if c in todos]
        en_cab = [c for c, v in todos.items() if k in v['cubre']]
        if not en_col and not en_cab: lista.append(k)
    return sorted(lista)


def requisitos_sin_criterio(reqs, todos):
    out = []
    for k, r in reqs.items():
        if r.get('retirado'): continue
        en_col = [c for c in r['ca'] if c in todos]
        en_cab = [c for c, v in todos.items() if k in v['cubre']]
        if not en_col and not en_cab: out.append(k)
    return sorted(out)


def sin_cita_de_vuelta(reqs, todos):
    """(requisito cita un criterio que no lo nombra, criterio nombra un requisito que no lo cita)."""
    a = sorted((k, c) for k, r in reqs.items() if not r.get('retirado') for c in r['ca'] if c in todos and k not in todos[c]['cubre'])
    b = sorted((c, k) for c, v in todos.items() for k in v['cubre'] if k in reqs and not reqs[k].get('retirado') and c not in reqs[k]['ca'])
    return a, b


def tabla_22_1(ncas):
    """Criterios del núcleo sin fila en la tabla 22.1."""
    return sorted(c for c, v in ncas.items() if v['etapa'] is None)


def sin_hacer(todos, reqs):
    """Pendientes que el Analista dejó «Sin hacer», detectados leyendo el texto actual (se actualizan solos).
    Cada fila: (id, qué falta, texto que propone QA, responsable, etapa que bloquea)."""
    out = []
    ca = lambda c: todos.get(c)
    # CA-024 cubre RF-OC-028, que es de la Etapa 7
    v = ca('CA-024')
    if v and 'RF-OC-028' in v['cubre']:
        out.append(('CA-024', 'La cabecera cubre RF-OC-028 (Etapa 7, P-009) y el criterio corre en Etapa 4: no se puede ejecutar entero.',
                    'Quitar RF-OC-028 de la cabecera de CA-024 y de su fila (la baja con motivo ya la prueba CA-024 en Etapa 4); la decisión P-009 de la Etapa 7 se verifica con un criterio documental nuevo.',
                    'Analista', 'Etapa 4'))
    # CA-053 sin partir
    if 'CA-053a' not in todos and 'CA-053' in todos:
        out.append(('CA-053', 'Sigue entero: junta respaldo, restauración con cronómetro, vuelta atrás, manuales, rendimiento y procedimiento de incidente (D-076.3 pide partirlo).',
                    '053a respaldo y restauración (RNF-014, RF-DAT-005); 053b vuelta atrás (RNF-015); 053c rendimiento (RNF-010 a 012; RNF-011 corre en la carga nocturna desde la Etapa 4, se completa en la 7); 053d manuales, costo y procedimiento de incidente (RNF-016 a 018, RF-DAT-015).',
                    'Analista', 'Etapa 7 (053c desde la Etapa 4)'))
    v = ca('CA-ENT-08')
    if v and 'falla la entrega de uno' in v['texto'] and 'inyecta' not in v['texto'] and 'ya está' not in v['texto']:
        out.append(('CA-ENT-08', 'Dice «falla la entrega de uno» y no dice cómo se provoca la falla.',
                    'Dada la inyección de fallos del entorno de pruebas: se corta la conexión entre la primera y la segunda asignación del traspaso; resultado esperado: ninguna devolución ni entrega registrada, los dos equipos siguen con la Persona cesada y no queda ningún acta. Segundo caso sin inyección: la Persona destino pasa a Cesada justo antes de confirmar.',
                    'Analista (escuadrón D)', 'Etapa 4'))
    v = ca('CA-ENT-10')
    if v and 'cuando pasa el tiempo' in v['texto']:
        out.append(('CA-ENT-10', 'Dice «cuando pasa el tiempo» sin decir cuánto ni con qué reloj.',
                    'Con el reloj de pruebas a +30 días y a +365 días desde el cese (reloj R5), el equipo sigue Asignado como «Pendiente de devolución» y no suma a pérdidas.',
                    'Analista (escuadrón D)', 'Etapa 4'))
    for rid, clave, texto in (
            ('RF-ENT-002', 'borrador',
             'Dado un técnico que captura una entrega de dos equipos (L1 y M1) a Ana y sale sin confirmar, cuando vuelve, entonces ve lo capturado; L1 y M1 siguen En stock y otro técnico puede entregar L1 a Luis; el borrador sin efecto se borra y desaparece; una entrega confirmada no se puede borrar (CA-045).'),
            ('RF-ENT-016', 'renov',
             'Dado un préstamo de L1 a Ana con fecha prevista 30/11/2026, cuando el técnico lo renueva al 31/12/2026 con motivo, entonces la fecha cambia, el historial guarda la anterior y la nueva y la auditoría guarda el motivo; sin motivo o sin permiso se rechaza; una entrega definitiva no se renueva.')):
        r = reqs.get(rid)
        if not r: continue
        textos = ' '.join(todos[c]['texto'].lower() for c in set(r['ca']) | {c for c, x in todos.items() if rid in x['cubre']} if c in todos)
        if clave not in textos:
            out.append((rid, f'Su único criterio ({", ".join(r["ca"])}) no prueba lo que dice el requisito.', texto, 'Analista (escuadrón D)', 'Etapa 4'))
    return out


def analizar(nreqs, nrns, ncas, mreqs, mrns, mcas, todos):
    reqs = {**nreqs, **mreqs}
    rns = {**nrns, **mrns}
    d = {}
    d['rotas_columna'] = citas_rotas_en_columnas(reqs, rns, todos)
    d['rotas_texto'], d['historicos_texto'] = citas_rotas_en_texto(todos)
    d['req_inexistentes'] = requisitos_inexistentes(todos, reqs, rns)
    d['ca_sin_nada'], d['ca_solo_rn'] = criterios_sin_requisito(todos)
    d['rn_sin_criterio'] = reglas_sin_criterio(nrns, mrns, todos)
    d['rn_nucleo_sin_criterio'] = [k for k in d['rn_sin_criterio'] if k in nrns]
    d['rf_sin_criterio'] = requisitos_sin_criterio(reqs, todos)
    d['sin_cita_ida'], d['sin_cita_vuelta'] = sin_cita_de_vuelta(reqs, todos)
    d['sin_22_1'] = tabla_22_1(ncas)
    d['sin_hacer'] = sin_hacer(todos, reqs)
    return d


def resumen(d, nreqs, mreqs, nrns, mrns):
    """Líneas de texto con las cifras de la revisión."""
    v1_mod = {'personas-ubicaciones', 'entregas-devoluciones', 'proveedores-contratos', 'garantias-mantenimiento', 'notificaciones'}
    rf_nuc = [k for k in d['rf_sin_criterio'] if k in nreqs]
    rf_mod = [k for k in d['rf_sin_criterio'] if k in mreqs]
    rf_mod_v1 = [k for k in rf_mod if mreqs[k]['modulo'] in v1_mod]
    rn_mod = [k for k in d['rn_sin_criterio'] if k in mrns]
    rn_mod_v1 = [k for k in rn_mod if mrns[k]['modulo'] in v1_mod]
    return [
        f"Citas rotas en columnas CA de requisitos y reglas: {len(d['rotas_columna'])}",
        f"Criterios nombrados en el texto de las fuentes y no definidos: {len(d['rotas_texto'])} citas sueltas (más {len(d['historicos_texto'])} alusiones históricas a criterios que ya se partieron)",
        f"Cabeceras de criterio que nombran un RF, RNF o RN inexistente: {len(d['req_inexistentes'])}",
        f"Criterios sin ningún requisito ni regla que los cite o liste: {len(d['ca_sin_nada'])}",
        f"Criterios citados solo por reglas RN o RS (sin RF): {len(d['ca_solo_rn'])}",
        f"Reglas RN sin criterio: {len(d['rn_sin_criterio'])} (núcleo {len(d['rn_nucleo_sin_criterio'])}; módulos {len(rn_mod)}, de ellos {len(rn_mod_v1)} en módulos con parte en la v1)",
        f"Requisitos RF o RNF sin criterio: núcleo {len(rf_nuc)}; módulos {len(rf_mod)}, de ellos {len(rf_mod_v1)} en módulos con parte en la v1",
        f"Requisito cita un criterio que no lo nombra: {len(d['sin_cita_ida'])}; criterio nombra un requisito que no lo cita de vuelta: {len(d['sin_cita_vuelta'])}",
        f"Criterios del núcleo sin fila en la tabla 22.1: {len(d['sin_22_1'])}",
        f"Pendientes «Sin hacer» del Analista que siguen abiertos: {len(d['sin_hacer'])}",
    ]


if __name__ == '__main__':
    import generar as G
    datos = G.cargar()
    nreqs, nrns, ncas, mreqs, mrns, mcas, todos = datos
    d = analizar(*datos)
    print('\n'.join(resumen(d, nreqs, mreqs, nrns, mrns)))
    for clave in ('rotas_columna', 'rotas_texto', 'historicos_texto', 'req_inexistentes', 'ca_sin_nada', 'rn_sin_criterio', 'rf_sin_criterio', 'sin_22_1'):
        print('\n' + clave, d[clave] if not isinstance(d[clave], dict) else {k: v[:3] for k, v in d[clave].items()})
    print('\nca_solo_rn', len(d['ca_solo_rn']), d['ca_solo_rn'])
    print('\nsin_cita_ida', d['sin_cita_ida'])
    print('\nsin_cita_vuelta', d['sin_cita_vuelta'])
    print('\nsin_hacer')
    for x in d['sin_hacer']: print(' -', x[0], '|', x[1], '|', x[3], '|', x[4])

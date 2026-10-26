"""Etapa, tipo y carácter bloqueante de cada criterio de aceptación (núcleo y módulos)."""
import re, collections
import lectura as L

E = L.etiqueta


def etapas_modulo_notificaciones():
    """Tabla 'Se ejecuta en' de notificaciones.md (la fijó el escuadrón C)."""
    t = L.leer(L.ROOT + '/docs/modulos/notificaciones.md')
    ini = [i for i, l in enumerate(t) if l.startswith('**Se ejecuta en**')][0]
    run, completa = {}, {}
    for l in t[ini:ini + 12]:
        m = re.match(r'^\| (v1, Etapa \d[^|]*|Fase 2[^|]*) \| (.*) \|$', l)
        if not m: continue
        et = L.etapas_de(m.group(1))[0]
        for ca in L.expandir_ca(m.group(2)):
            if ca in run and et != run[ca]:
                completa[ca] = max(et, run[ca]); run[ca] = min(et, run[ca])
            else:
                run[ca] = et
    return run, completa


def resolver(nreqs, nrns, ncas, mreqs, mrns, mcas):
    """Completa en cada CA: etapa (dónde corre), completa, req_min, req_max y la lista de requisitos."""
    todos = {**nreqs, **mreqs}
    todos_rn = {**nrns, **mrns}
    citan = collections.defaultdict(set)
    for r in list(nreqs.values()) + list(mreqs.values()) + list(mrns.values()):
        if r.get('retirado'): continue
        for c in r['ca']: citan[c].add(r['id'])
    for rn in nrns.values():
        for c in rn['ca']: citan[c].add(rn['id'])
    run_not, comp_not = etapas_modulo_notificaciones()
    for c, v in {**ncas, **mcas}.items():
        ids = set(citan.get(c, set())) | set(v['cubre'])
        v['reqs'] = sorted(ids)
        mins, maxs = [], []
        for i in ids:
            r = todos.get(i)
            if r is None or r.get('retirado'): continue
            if r['min'] is not None: mins.append(r['min']); maxs.append(r['max'])
        v['req_min'] = min(mins) if mins else None
        v['req_max'] = max(maxs) if maxs else None
        v['heredada'] = False
    # módulos: etapa de ejecución
    defecto = {}
    for m in {v['modulo'] for v in mcas.values()}:
        cnt = collections.Counter(r['min'] for r in mreqs.values() if r['modulo'] == m and r['min'] is not None)
        defecto[m] = cnt.most_common(1)[0][0] if cnt else L.FASE3
    for c, v in mcas.items():
        if c in run_not:
            v['etapa'] = run_not[c]; v['completa'] = comp_not.get(c)
        elif v['req_max'] is not None:
            v['etapa'] = v['req_max']; v['completa'] = None
        else:
            v['etapa'] = defecto[v['modulo']]; v['completa'] = None; v['heredada'] = True
    return citan


PAL_NAV = ['pantalla', 'botón', ' pdf', 'teclado', '360', 'contraste', 'banner', 'diálogo', 'tarjeta', 'asistente', 'menú',
           'impres', 'clic', 'vista previa', 'barra de avance', 'se ve ', 've el ', 've la ', 'muestra', 'aviso visible',
           'etiqueta', 'ficha', 'calendario', 'tablero', 'portal']
PAL_MANUAL = ['personas no técnicas', 'prueba de tareas', 'cronómetro', 'ensayo', 'revisión manual', 'plan de vuelta',
              'manuales de la etapa', 'restauración probada', 'restaur', 'respaldo']
PAL_SERV = ['permiso', 'petición', 'concurr', 'a la vez', 'simult', 'reloj', 'correo', 'auditor', 'sesión', 'cola',
            'trabajador', 'import', 'export', 'base de datos', 'api', 'integraci', 'huella', 'transacci', 'otra empresa',
            'empresa b', 'empresa a', 'solo lectura', 'rol ', 'identificador interno', 'no encontrado']
PAL_CALC = ['calcula', 'fórmula', 'redondeo', 'porcentaje', 'suma', 'normaliza', 'umbral', 'riesgo', 'prioridad',
            'sla', 'vigencia', 'resta', 'meses', 'días', 'tabla de', 'saldo', 'estado', 'transición', 'ciclo', 'vence', 'rechaza']


def tipo(v):
    t = (v['titulo'] + ' ' + v['texto']).lower()
    nav = any(p in t for p in PAL_NAV)
    serv = any(p in t for p in PAL_SERV)
    if any(p in t for p in PAL_MANUAL): return 'manual (con apoyo de integración)'
    if not serv and any(p in t for p in PAL_CALC) and not nav: return 'unitaria'
    if nav and serv: return 'integración + navegador'
    if nav: return 'navegador'
    return 'integración'


def bloqueante(v):
    e = v['etapa']
    if e is None: return '?'
    if e >= L.FASE2: return 'no (bloquea su módulo)'
    return 'sí'

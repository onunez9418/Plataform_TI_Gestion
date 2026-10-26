"""Genera docs/trazabilidad.md: requisito -> etapa -> criterio, con el resumen de huecos."""
import re, collections
import lectura as L, juicios as J
from generar import E, HOY, NOMBRES, tabla, esc, clave, sigla_ca


def corto(n):
    if n is None: return '-'
    return f'E{n}' if n <= 7 else ('F2' if n == L.FASE2 else 'F3')


def etapa_req(r):
    if r['min'] is None: return '-'
    return corto(r['min']) if r['min'] == r['max'] else f"{corto(r['min'])} a {corto(r['max'])}"


def resumen(t, n=95):
    t = re.sub(r'\*|`', '', t).strip()
    return t if len(t) <= n else t[:n - 1].rstrip() + '…'


def estado(r, todos):
    """(estado, observación) de un requisito."""
    if r.get('retirado'): return 'retirado', ''
    ca = [c for c in r['ca'] if c in todos]
    if r['id'] in J.NO_PRUEBA:
        return 'no probado de verdad', J.NO_PRUEBA[r['id']][1]
    if r['id'] in J.CITA_MAL:
        c, why = J.CITA_MAL[r['id']]
        ok = r['id'] in ('RF-OC-027', 'RF-OC-041')
        return ('cubierto (lectura de QA)' if ok else 'cita mal apuntada o incompleta'), why
    if not ca:
        via = [c for c, v in todos.items() if r['id'] in v['cubre']]
        return ('cubierto por cabecera' if via else 'sin criterio'), (', '.join(sorted(via)[:3]) if via else '')
    lista = [c for c in ca if r['id'] in todos[c]['cubre']]
    obs = ''
    if not lista: return 'verificar', 'el criterio citado no lista este requisito en su cabecera'
    mx = r['max']
    tardes = [c for c in ca if mx is not None and todos[c]['etapa'] > mx]
    if len(tardes) == len(ca) and mx is not None:
        obs = f"el criterio corre en {E(min(todos[c]['etapa'] for c in ca))}, después de la etapa del requisito"
    return 'cubierto', obs


def celda_ca(r, todos):
    out = []
    for c in r['ca']:
        if c in todos:
            v = todos[c]
            out.append(f"{c} ({corto(v['etapa'])}" + (f", completa {corto(v['completa'])}" if v['completa'] else '') + ')')
        else:
            out.append(c + ' (NO EXISTE)')
    return ', '.join(out) if out else '-'


def generar(nreqs, nrns, ncas, mreqs, mrns, mcas, todos, commit, sucio):
    o = []
    activos = {k: r for k, r in nreqs.items() if not r['retirado']}
    est = {k: estado(r, todos) for k, r in nreqs.items()}
    est_m = {k: estado(r, todos) for k, r in mreqs.items()}
    cnt = collections.Counter(v[0] for v in est.values())
    cnt_m = collections.Counter(v[0] for v in est_m.values())
    rotas = [(r['id'], c) for r in list(nreqs.values()) + list(mreqs.values()) for c in r['ca'] if c not in todos]
    o.append('# Trazabilidad: requisito, etapa, criterio de aceptación\n')
    o.append(f"**Autor:** QA (qa-tester) · **Fecha:** {HOY} · **Checkpoint:** commit `{commit}`{(' (más cambios sin guardar en: ' + sucio + ')') if sucio else ''} · **Cubre:** el núcleo del documento funcional v0.3 (secciones 5 a 21) y los 17 módulos de `docs/modulos/` en v0.3. Generado con `docs/calidad/herramientas/generar.py`; los juicios de lectura están en `docs/calidad/herramientas/juicios.py`. Reemplaza la versión del 2026-10-25.\n")
    o.append("**Cómo se hizo.** Un script lee las tablas de requisitos (columnas Cuándo y CA), la tabla de reglas RN con su columna CA, la sección 22 con su tabla 22.1 \"Se ejecuta en\" y los criterios de los módulos. Después QA leyó el texto de los requisitos y criterios dudosos. Estados:\n")
    o.append("- **cubierto:** el criterio citado existe y lista este requisito en su cabecera.\n- **no probado de verdad:** el criterio existe, pero leído su texto no prueba lo que dice el requisito (con la razón).\n- **cita mal apuntada o incompleta:** el criterio citado no es el que prueba el requisito, o falta citar el que lo prueba.\n- **verificar:** el criterio existe pero no nombra al requisito; hay que leerlo.\n- **cubierto por cabecera:** el requisito no cita criterio en su fila, pero un criterio lo lista (módulos).\n- **sin criterio:** ningún criterio lo cita ni lo lista.\n")
    o.append("El Auditor Técnico revisa esta matriz al cerrar cada etapa (D-026.4, D-076.5): un requisito sin prueba y una prueba sin requisito son hallazgos. **QA no ejecutó el guion de citas del Auditor Técnico;** lo de este archivo es lectura de QA, no la verificación del Auditor.\n")
    # --- resumen
    o.append('## Resumen de huecos\n')
    n_act = len(activos)
    rn_col = sum(1 for r in nrns.values() if r['ca'])
    rn_vuelta = sum(1 for r in nrns.values() if any(r['id'] in ncas[c]['cubre'] for c in r['ca'] if c in ncas))
    rn_cit = sum(1 for r in nrns.values() if any(r['id'] in v['cubre'] for v in ncas.values()) or any(r['id'] in ncas[c]['cubre'] for c in r['ca'] if c in ncas))
    np_nuc = sum(1 for k in J.NO_PRUEBA if k in nreqs)
    np_mod = sum(1 for k in J.NO_PRUEBA if k in mreqs)
    filas = [
        ['Filas RF y RNF del núcleo (con las retiradas)', len(nreqs)],
        ['Retiradas (RF-USR-004, RF-IMP-012, RF-OS-007)', len(nreqs) - n_act],
        ['Filas vigentes', n_act],
        ['Citas de criterio rotas (criterio inexistente o "padre" que ya se partió)', len(rotas)],
        ['Cubiertos: el criterio los lista', cnt['cubierto'] + cnt['cubierto (lectura de QA)']],
        ['No probados de verdad (núcleo)', np_nuc],
        ['No probados de verdad (módulos con parte en la v1)', np_mod],
        ['Citas mal apuntadas o incompletas (núcleo)', cnt['cita mal apuntada o incompleta']],
        ['Para verificar leyendo el texto (sin juicio de QA todavía)', cnt['verificar']],
        ['Reglas RN con un criterio en su columna CA', f'{rn_col} de {len(nrns)}'],
        ['Reglas RN que el propio criterio también cita (cita de vuelta)', f'{rn_vuelta} de {len(nrns)}'],
        ['Reglas RN que ninguna cabecera de criterio nombra (solo están en la columna CA de la regla)', f'{len(nrns) - rn_cit} de {len(nrns)}'],
        ['Reglas RN cuyo criterio no las prueba del todo', f'{len(J.RN_PARCIAL)} ({", ".join(sorted(J.RN_PARCIAL))})'],
    ]
    o.append(tabla(['Medida (al ' + HOY + ', commit ' + commit + ')', 'Resultado'], filas) + '\n')
    o.append(f"El 2026-10-25 (informe de ronda 3 y archivo anterior): 18 de 22 reglas sin criterio que las cite y 17 requisitos que su criterio no probaba. Hoy las 22 reglas tienen un criterio en su columna CA (y {rn_vuelta} también son nombradas por la cabecera del criterio); de los 17 anteriores quedan abiertos los de RF-IMP-008, 009 y 015, RF-OC-048 y 049, RF-ENT-002 y 016 (todos con fecha límite en D-076.3), RF-EMP-004 y RF-PLA-013 (nuevo). Los demás (RF-ACC-006, 014, 020, RF-PLA-009 a 012, RF-CAT-026, RF-ROL-015) quedaron probados con los criterios nuevos y ampliados.\n")
    # --- D-076
    o.append('## Qué exige D-076, hoy, y quién lo cierra\n')
    o.append("Regla (D-076): un requisito necesita un criterio que lo pruebe **antes de que se abra la etapa en que se programa**. Responsables: el **Analista** redacta o cita el criterio; **QA** revisa y propone el texto cuando el Analista lo prefiera; el **Auditor Técnico** verifica con su guion que ningún requisito de la etapa que se abre quede sin criterio; el **Gerente de TI** no abre una etapa con esa verificación pendiente. Estado según la lectura de QA al " + HOY + ".\n")
    for et, titulo in [(1, 'Antes de la Etapa 1 (puerta de la Etapa 0 y v1.0)'), (2, 'Antes de la Etapa 2'), (4, 'Antes de la Etapa 4'), (5, 'Antes de la Etapa 5'), (7, 'Antes de la Etapa 7')]:
        filas = [[x[1], x[2], x[3].format(vuelta=rn_vuelta, solo=len(nrns) - rn_vuelta), x[4]] for x in J.D076 if x[0] == et]
        if filas:
            o.append(f'**{titulo}**\n')
            o.append(tabla(['Requisito o regla', 'Criterio', 'Estado (lectura de QA)', 'Responsable'], filas) + '\n')
    hechos = sum(1 for x in J.D076 if x[3].startswith('HECHO'))
    pend = sum(1 for x in J.D076 if not x[3].startswith('HECHO'))
    o.append(f'Resultado: {hechos} de los {len(J.D076)} puntos listados están hechos en el texto; {pend} siguen pendientes o son nuevos. **Antes de la Etapa 1 quedan abiertos:** RF-EMP-004 (calendario), RF-PLA-013 (lectura de soporte, no estaba en la lista de D-076) y la ambigüedad de CA-006 y CA-077.\n')
    # --- RN
    o.append('## Reglas de negocio (RN) y el criterio que las prueba\n')
    o.append("La tabla de reglas del documento ya tiene la columna CA. \"Cita de vuelta\" = el criterio también nombra la regla en su cabecera.\n")
    filas = []
    for k, r in sorted(nrns.items()):
        cita = [c for c in r['ca'] if c in ncas and k in ncas[c]['cubre']]
        if k in J.RN_PARCIAL: juicio = 'parcial: ' + J.RN_PARCIAL[k]
        else: juicio = 'prueba de verdad'
        filas.append([k, ', '.join(f"{c} ({corto(ncas[c]['etapa'])})" for c in r['ca'] if c in ncas), ', '.join(cita) or '-', juicio])
    o.append(tabla(['Regla', 'Criterio en la columna CA (etapa)', 'Cita de vuelta', 'Juicio de QA'], filas) + '\n')
    # RN de módulos
    o.append('**Reglas RN de los módulos**\n')
    filas = []
    for m in sorted({r['modulo'] for r in mrns.values()}):
        rs = [r for r in mrns.values() if r['modulo'] == m]
        col = sum(1 for r in rs if r['ca'])
        via = sum(1 for r in rs if not r['ca'] and any(r['id'] in v['cubre'] for v in mcas.values()))
        sin = len(rs) - col - via
        sg = rs[0]['id'].split('-')[1]
        filas.append([f"{sg} · {NOMBRES.get(sg, m)}", len(rs), col, via, sin])
    o.append(tabla(['Módulo', 'Reglas RN', 'Con criterio en su fila', 'Citadas por un criterio', 'Sin criterio'], filas) + '\n')
    o.append("\"Sin criterio\" no es un hueco para la v1 salvo en los módulos con parte en la v1 (PRS, ENT, PRV, GAR, NOT-base); para los demás se cierra al activar el módulo (D-076.4). Para esos cinco, el Analista y su escuadrón deben citar el criterio de cada regla antes de la etapa del módulo.\n")
    # --- no prueba
    o.append('## Requisitos cuyo criterio no los prueba de verdad\n')
    filas = [[k, corto(( {**nreqs, **mreqs}[k])['min']), v[0], v[1], v[2], v[3]] for k, v in sorted(J.NO_PRUEBA.items(), key=lambda x: (99 if {**nreqs, **mreqs}[x[0]]['min'] is None else {**nreqs, **mreqs}[x[0]]['min'], x[0]))]
    o.append(tabla(['Requisito', 'Etapa', 'Criterio citado', 'Qué falta probar', 'Debe estar cerrado', 'Responsable'], filas) + '\n')
    o.append('**Citas mal apuntadas o incompletas** (el criterio existe, pero la fila debe citar otro o agregar uno):\n')
    o.append(tabla(['Requisito', 'Cita actual', 'Observación'], [[k, v[0], v[1]] for k, v in J.CITA_MAL.items()]) + '\n')
    o.append('**Reglas cuyo criterio no las prueba del todo:**\n')
    o.append(tabla(['Regla', 'Observación'], [[k, v] for k, v in J.RN_PARCIAL.items()]) + '\n')
    # --- módulos resumen
    o.append('## Módulos: cobertura de sus requisitos\n')
    filas = []
    for m in sorted({r['modulo'] for r in mreqs.values()}):
        rs = [r for r in mreqs.values() if r['modulo'] == m]
        sg = rs[0]['id'].split('-')[1]
        c = collections.Counter(est_m[r['id']][0] for r in rs)
        filas.append([f"{sg} · {NOMBRES.get(sg, m)}", len(rs), c['cubierto'], c['cubierto por cabecera'], c['no probado de verdad'], c['verificar'], c['sin criterio']])
    o.append(tabla(['Módulo', 'RF y RNF', 'Cubiertos', 'Cubiertos por cabecera', 'No probados de verdad', 'Verificar', 'Sin criterio'], filas) + '\n')
    v1m = [r for r in mreqs.values() if est_m[r['id']][0] == 'sin criterio' and r['modulo'] in ('personas-ubicaciones', 'entregas-devoluciones', 'proveedores-contratos', 'garantias-mantenimiento', 'notificaciones')]
    o.append(f"**RNF sin criterio en los módulos con parte en la v1 ({len(v1m)}):** " + ', '.join(sorted(r['id'] for r in v1m)) + ". Ninguna fila ni criterio los cita (H-QA-27 sigue abierto en los módulos). Hasta que el escuadrón los cite, QA los prueba con el criterio del núcleo que corresponda (CA-050a de accesibilidad y rendimiento, CA-053, CA-001 de aislamiento) y lo anota aquí.\n")
    o.append('Los requisitos de módulos con estado "verificar": ' + ', '.join(sorted(k for k, v in est_m.items() if v[0] == 'verificar')) + '.\n')
    # --- matriz núcleo
    o.append('## Matriz de requisitos del núcleo\n')
    o.append("Etapas: E0 a E7 son las de la v1; F2 y F3 son fases posteriores. \"Criterio (corre en)\" muestra dónde corre cada criterio citado; \"completa\" es la etapa en que termina.\n")
    filas = []
    for k, r in nreqs.items():
        s, ob = est[k]
        filas.append([k, resumen(r['texto']), etapa_req(r), celda_ca(r, todos), s, resumen(ob, 200)])
    o.append(tabla(['ID', 'Requisito (resumido)', 'Etapa', 'Criterio (corre en)', 'Estado', 'Observación'], filas) + '\n')
    # --- matriz módulos v1
    o.append('## Matriz de requisitos de los módulos con parte en la v1\n')
    o.append("Solo las filas con etapa de la v1 (E0 a E7). Las filas de Fase 2 y 3 se cierran al activar cada módulo y su matriz vive en el propio módulo.\n")
    filas = []
    for k, r in mreqs.items():
        if r['min'] is None or r['min'] > 7: continue
        s, ob = est_m[k]
        filas.append([k, resumen(r['texto']), etapa_req(r), celda_ca(r, todos), s, resumen(ob, 200)])
    o.append(tabla(['ID', 'Requisito (resumido)', 'Etapa', 'Criterio (corre en)', 'Estado', 'Observación'], filas) + '\n')
    o.append('---\n')
    o.append('Registro de prefijos: sección 26.2 del documento funcional (no se copia aquí para no tener dos fuentes). Los requisitos retirados (RF-USR-004, RF-IMP-012, RF-OS-007) no tienen criterio ni lo necesitan.\n')
    return '\n'.join(o)

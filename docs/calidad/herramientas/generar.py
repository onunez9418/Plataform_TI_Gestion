"""Genera docs/calidad/criterios-por-etapa.md y docs/trazabilidad.md leyendo los documentos con scripts.
Uso, desde la raíz del repositorio:  python3 -I docs/calidad/herramientas/generar.py [--escribir]
Sin --escribir imprime solo las cifras. Los juicios de lectura están en juicios.py."""
import sys, os, re, subprocess, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lectura as L, etapas as T, juicios as J, huecos as H

E = L.etiqueta
HOY = '2026-10-29'
ANTERIOR = '2026-10-26'   # fecha de la versión anterior de los archivos generados (commit b8e01d3)
NOMBRES = {'ACC': 'Acceso', 'AYU': 'Mesa de ayuda', 'CAM': 'Gestión de cambios', 'CMD': 'CMDB ligera', 'DOM': 'Dominios y certificados',
           'ENT': 'Entregas y devoluciones', 'GAR': 'Garantías y mantenimiento', 'INT': 'Integraciones y API', 'LIC': 'Licencias de software',
           'LIN': 'Líneas móviles', 'NOT': 'Notificaciones', 'ONB': 'Onboarding y offboarding', 'POR': 'Portal de autoservicio',
           'PRB': 'Gestión de problemas', 'PRE': 'Presupuesto y costos', 'PRS': 'Personas y ubicaciones', 'PRV': 'Proveedores y contratos',
           'REP': 'Reportes y tableros', 'MSF': 'Microsoft Entra e Intune (en redacción)', 'ASI': 'Asistente de IA (en redacción)'}

# Lo que valía el 2026-10-26 (451 criterios): dónde empezaban y dónde terminaban
ANT_EMPIEZAN = {0: 0, 1: 52, 2: 37, 3: 4, 4: 44, 5: 24, 6: 2, 7: 3, L.FASE2: 134, L.FASE3: 151}
ANT_TERMINAN = {0: 0, 1: 38, 2: 32, 3: 3, 4: 54, 5: 28, 6: 3, 7: 3, L.FASE2: 139, L.FASE3: 151}
ANT_TOTAL, ANT_NUCLEO = 451, 116


def git(*a):
    return subprocess.run(['git'] + list(a), capture_output=True, text=True).stdout.strip()


def sigla_ca(cid):
    m = re.match(r'CA-([A-Z]{2,4})-', cid)
    return m.group(1) if m else 'núcleo'


def esc(x):
    return str(x).replace('|', '\\|').replace('\n', ' ')


def tabla(cab, filas):
    out = ['| ' + ' | '.join(cab) + ' |', '|' + '---|' * len(cab)]
    for f in filas: out.append('| ' + ' | '.join(esc(x) for x in f) + ' |')
    return '\n'.join(out)


def cargar():
    nreqs, nrns, ncas = L.leer_nucleo()
    mreqs, mrns, mcas = L.leer_modulos()
    T.resolver(nreqs, nrns, ncas, mreqs, mrns, mcas)
    for c, o in J.OVERRIDES_MODULOS.items():
        if c in mcas:
            for k in ('etapa', 'completa'):
                if k in o: mcas[c][k] = o[k]
            mcas[c]['nota_manual'] = o['nota']
    todos = {**ncas, **mcas}
    for c, (mn, mx, porque) in J.REQ_ETAPA.items():
        if c in todos:
            todos[c]['req_min'], todos[c]['req_max'], todos[c]['nota_req'] = mn, mx, porque
    for c, v in todos.items():
        v['tipo'] = T.tipo(v)
        if c in J.TIPOS: v['tipo'] = J.TIPOS[c][0]
        v['bloq'] = T.bloqueante(v)
        v['tarde'] = v['req_min'] is not None and v['etapa'] > v['req_min']
        v['antes'] = v['req_max'] is not None and v['etapa'] < v['req_max'] and not v['completa']
        v['cruza'] = v['req_min'] is not None and v['req_max'] is not None and v['req_min'] != v['req_max']
        v['sigla'] = sigla_ca(c)
    return nreqs, nrns, ncas, mreqs, mrns, mcas, todos


def clave(cid):
    m = re.match(r'CA-(?:([A-Z]+)-)?(\d+)([a-z]?\d?)', cid)
    return (m.group(1) or '', int(m.group(2)), m.group(3))


def razon_tarde(v, reqs):
    ids = [i for i in v['reqs'] if i in reqs and reqs[i]['min'] == v['req_min']][:3]
    base = f"{', '.join(ids)}: {E(v['req_min'])}; el criterio arranca en {E(v['etapa'])}"
    extra = J.NOTAS_TARDE.get(v['id']) or v.get('nota_manual')
    return base + ('. ' + extra if extra else '')


def cifras(todos):
    por = collections.Counter(v['etapa'] for v in todos.values())
    comp = collections.Counter(v['completa'] for v in todos.values() if v['completa'])
    return por, comp


def generar_criterios(nreqs, nrns, ncas, mreqs, mrns, mcas, todos, commit, sucio):
    reqs = {**nreqs, **mreqs}
    por, comp = cifras(todos)
    numeros = {int(re.match(r'CA-(\d+)', c).group(1)) for c in ncas}
    n_num, max_num = len(numeros), max(numeros)
    v1 = sum(n for e, n in por.items() if e <= 7)
    MODULOS_LEIDOS = sorted({v['modulo'] for v in mcas.values()})
    nuevos = [c for c in J.ETAPA_NUEVOS if c in todos]
    nuevos_por = collections.Counter(sigla_ca(c) for c in nuevos)
    o = []
    o.append('# Criterios de aceptación por etapa\n')
    o.append(f"**Autor:** QA (qa-tester) · **Fecha:** {HOY} · **Checkpoint:** commit `{commit}`{(' (más cambios sin guardar en: ' + sucio + ')') if sucio else ' (árbol de documentos fuente limpio al generar)'} · **Fuente:** `docs/documento-funcional.md` v0.3 (secciones 21, 22 y 22.1; AN-01 a AN-15; D-065 a D-080), `docs/registro-permisos.md` v1.1 y los {len(MODULOS_LEIDOS)} módulos de `docs/modulos/` que ya están completos. Generado con `docs/calidad/herramientas/generar.py` (lectura de solo lectura; no se editó ningún documento fuente). Todas las cifras de este archivo valen para ese commit; si el documento cambia, se vuelve a generar.\n")
    o.append(f"**Para qué sirve.** Lista única de todos los criterios CA, con el módulo, los requisitos que cubre, la etapa en que se ejecutan, el tipo de prueba y si bloquean. Reemplaza a la versión del {ANTERIOR} ({ANT_TOTAL} criterios, commit `b8e01d3`). Para el núcleo, la etapa sale **de la tabla 22.1 del documento funcional** (la fijó el Analista, D-075); para los módulos, de los requisitos que cada criterio cubre, salvo donde el módulo trae su propia tabla (notificaciones) o donde QA leyó el texto (anotado en la columna Nota).\n")
    o.append('## Cómo leer las columnas\n')
    o.append("- **Cubre:** la cabecera del criterio, tal como la escribió el Analista o el escuadrón.\n- **Etapa del requisito:** la más temprana entre los requisitos que cubre. **Se ejecuta en:** la etapa en que el criterio **empieza** a correr. **Se completa en:** la etapa posterior en que ya existe todo lo que necesita (solo cuando 22.1 o el módulo lo dicen).\n- **Tipo:** unitaria (reglas y cálculos sin base de datos); integración (base real, servidor, permisos, concurrencia, reloj, correo); navegador (Playwright: pantallas, PDF); manual (personas o ensayo, con apoyo automático donde se pueda). Es una clasificación hecha con palabras del texto del criterio, corregida por QA donde se equivoca (anotado en la columna Nota); QA la afina al escribir cada prueba.\n- **Bloqueante:** sí = si falla, la etapa no se aprueba. \"No (bloquea su módulo)\" = es de Fase 2 o 3 y bloquea la entrega de ese módulo, no la v1 (D-056).\n- **Etapa heredada:** el criterio solo cita reglas RN y no hay fila RF que lo cite; tomó la etapa más frecuente de su módulo. Debe confirmarlo el escuadrón.\n")
    o.append('## Resumen (checkpoint ' + commit + ', ' + HOY + ')\n')
    nuc, mod = len(ncas), len(mcas)
    total = nuc + mod
    o.append(f"**{total} criterios:** {nuc} del núcleo (identificadores con letra, que son {n_num} números, CA-001 a CA-{max_num:03d}) y {mod} de los {len(MODULOS_LEIDOS)} módulos completos. El {ANTERIOR} eran {ANT_TOTAL} ({ANT_NUCLEO} y {ANT_TOTAL - ANT_NUCLEO}): {total - ANT_TOTAL:+d}. Qué cambió: **{len(J.PARTIDOS)} criterios dejaron de existir como uno solo** porque se partieron ({', '.join(J.PARTIDOS)}) y **{len(nuevos)} criterios nuevos** los reemplazan o se suman: en el núcleo {nuevos_por['núcleo']} (CA-015g, h e i de lectura de soporte; CA-038a a d; CA-094a a c; CA-095a a j de congelación por incidente, D-080; CA-096 a CA-105, con CA-104 en a y b) y en los módulos PRS {nuevos_por['PRS']}, GAR {nuevos_por['GAR']} y PRV {nuevos_por['PRV']}.\n")
    filas = []
    for e in list(range(0, 8)) + [L.FASE2, L.FASE3]:
        if por.get(e, 0) or comp.get(e, 0) or e <= 7:
            filas.append([E(e), por.get(e, 0), comp.get(e, 0)])
    filas.append(['**Total**', sum(por.values()), sum(comp.values())])
    o.append(tabla(['Se ejecuta en', 'Criterios que empiezan aquí', 'Criterios que se completan aquí (empezaron antes)'], filas) + '\n')
    v1_ant = sum(n for e, n in ANT_EMPIEZAN.items() if e <= 7)
    f_ant = ANT_EMPIEZAN[L.FASE2] + ANT_EMPIEZAN[L.FASE3]
    o.append(f"**Criterios de la v1 (Etapas 0 a 7): {v1}.** De fases posteriores: {por.get(L.FASE2, 0) + por.get(L.FASE3, 0)}. Antes ({ANTERIOR}): {v1_ant} y {f_ant}.\n")
    fin = collections.Counter((v['completa'] or v['etapa']) for v in todos.values())
    # «terminan» cuenta, como la columna anterior, dónde queda cada criterio al completarse
    filas = [[E(e), ANT_EMPIEZAN[e], por.get(e, 0), ANT_TERMINAN[e], fin.get(e, 0)] for e in ANT_EMPIEZAN]
    o.append(f'Comparación con la versión anterior ({ANTERIOR}). Las dos medidas son las mismas que entonces: dónde **empieza** cada criterio y dónde **termina**.\n')
    o.append(tabla(['Etapa', 'Antes (empiezan)', 'Ahora (empiezan)', 'Antes (terminan)', 'Ahora (terminan)'], filas) + '\n')
    o.append(f'Qué explica la diferencia: la mayor parte son criterios partidos y nuevos de la Etapa 2 (congelación por incidente CA-095a a g, PRS y PRV), de la Etapa 4 (importación en cuatro, código del activo, tope y lote de importación, estados, garantía, PRS) y de la Etapa 5 (CA-096 a CA-104b, recepción de garantía). La Etapa 0 gana CA-105 (verificación documental). Ningún criterio que ya existía cambió de etapa.\n')
    emin = collections.Counter(v['req_min'] for v in todos.values())
    filas = [[E(e) if e is not None else 'sin requisito RF (heredada)', n] for e, n in sorted(emin.items(), key=lambda x: (x[0] is None, x[0] or 0))]
    o.append('Por la etapa más temprana de su requisito:\n')
    o.append(tabla(['Etapa más temprana del requisito', 'Criterios'], filas) + '\n')
    tp = collections.Counter(v['tipo'] for v in todos.values())
    o.append(tabla(['Tipo de prueba', 'Criterios'], sorted(tp.items(), key=lambda x: -x[1])) + '\n')
    cm = collections.Counter(v['sigla'] for v in todos.values())
    o.append(tabla(['Módulo', 'Criterios'], [[(NOMBRES.get(k, 'Núcleo') + f' ({k})' if k != 'núcleo' else 'Núcleo'), n] for k, n in sorted(cm.items())]) + '\n')
    # puerta por etapa
    o.append('### Lo que cada etapa exige (D-076)\n')
    o.append("Bloqueantes de una etapa = los criterios que **empiezan** en ella más los que **se completan** en ella. Un criterio bloqueante que no se pueda ejecutar deja la etapa sin aprobar. \"Antes de abrir\" = criterios que D-076 exige tener redactados antes de que la etapa empiece; el detalle por requisito está en `docs/trazabilidad.md`.\n")
    filas = []
    for e in range(1, 8):
        pend = sum(1 for x in J.D076 if x[0] == e and x[3].startswith(J.ABIERTOS))
        filas.append([E(e), por.get(e, 0), comp.get(e, 0), por.get(e, 0) + comp.get(e, 0), pend])
    o.append(tabla(['Etapa', 'Empiezan', 'Se completan', 'Bloqueantes en total', 'Puntos de D-076 aún pendientes antes de abrirla'], filas) + '\n')
    # no corren en la etapa de su requisito
    antes = sorted([c for c, v in todos.items() if v['antes']], key=clave)
    tarde = sorted([c for c, v in todos.items() if v['tarde']], key=clave)
    o.append(f'### Criterios que NO corren en la etapa de su requisito ({len(antes) + len(tarde)})\n')
    o.append(f"Dos casos distintos. **(A) Corren antes de lo que necesitan: {len(antes)}.** Es un defecto del criterio: no se puede ejecutar. **(B) Arrancan después de la etapa más temprana de su requisito: {len(tarde)}.** El requisito se entrega antes de que su criterio corra; la etapa de ese requisito se cierra sin esa prueba. Muchos son consecuencia legítima de que el criterio necesita un módulo posterior (órdenes, activos, actas); aun así, el Gerente de TI debe saberlo al cerrar la etapa.\n")
    o.append('**(A) Corren antes:**\n')
    notas_a = {x[0]: x[2] for x in J.AMBIGUOS}
    notas_a.update({x[0]: x[1] + ' Propuesta de QA: ' + x[2] for x in H.sin_hacer(todos, reqs) if x[0].startswith('CA-')})
    notas_a.update(J.NOTAS_ANTES)
    o.append(tabla(['Criterio', 'Corre en', 'Sus requisitos llegan hasta', 'Qué hay que corregir'],
                   [[c, E(todos[c]['etapa']), E(todos[c]['req_max']), notas_a.get(c, 'Partir o sacar el requisito posterior de la cabecera.')] for c in antes]) + '\n')
    o.append('**(B) Arrancan después:**\n')
    filas = []
    for c in tarde:
        v = todos[c]
        filas.append([c, NOMBRES.get(v['sigla'], 'Núcleo'), E(v['req_min']), E(v['etapa']) + (f" (se completa en {E(v['completa'])})" if v['completa'] else ''), razon_tarde(v, reqs)])
    o.append(tabla(['Criterio', 'Módulo', 'Etapa del requisito', 'Arranca en', 'Por qué'], filas) + '\n')
    # cruzan en módulos
    cr = sorted([c for c in mcas if todos[c]['cruza'] and not todos[c]['completa']], key=clave)
    o.append(f'### Criterios de módulos que cruzan etapas y esperan que su escuadrón los parta ({len(cr)})\n')
    o.append("Cubren requisitos de etapas distintas y el módulo no trae partición. Corren en la etapa más tardía (la única donde existe todo lo que piden). Solo los de módulos con parte en la v1 (PRS, ENT, PRV, GAR, NOT) afectan a una etapa de la v1; el resto cruza Fase 2 y Fase 3 (D-076.4: se cierra al activar el módulo).\n")
    filas = [[c, E(mcas[c]['req_min']) + ' a ' + E(mcas[c]['req_max']), E(mcas[c]['etapa']), J.PROPUESTA_PARTIR.get(c, mcas[c].get('nota_manual', '')) or ('Fase 2 a Fase 3: se cierra al activar el módulo' if mcas[c]['req_min'] >= L.FASE2 else '')] for c in cr]
    o.append(tabla(['Criterio', 'Requisitos de', 'Corre en', 'Propuesta de QA'], filas) + '\n')
    # se completan
    cp = sorted([c for c, v in todos.items() if v['completa']], key=clave)
    o.append(f'### Criterios que arrancan en una etapa y se completan en otra ({len(cp)})\n')
    o.append(tabla(['Criterio', 'Arranca en', 'Se completa en', 'Fuente'], [[c, E(todos[c]['etapa']), E(todos[c]['completa']), 'tabla 22.1 del documento funcional' if c in ncas else 'tabla del módulo o lectura de QA'] for c in cp]) + '\n')
    # sin requisito
    sinrf = sorted([c for c, v in todos.items() if v['req_min'] is None], key=clave)
    o.append(f'### Criterios sin requisito RF que los cite ({len(sinrf)})\n')
    o.append(f"Citan solo reglas RN, seguridad (RS) o secciones. Los del núcleo ({', '.join(c for c in sinrf if c in ncas)}) los cita una regla RN o RS y son válidos. Los de módulos heredan la etapa del módulo; confirmar con cada escuadrón.\n")
    o.append(', '.join(sinrf) + '\n')
    # ambiguos
    o.append('### Criterios ambiguos o por partir (H-QA-31, D-076.3)\n')
    amb = [list(x) for x in J.AMBIGUOS]
    for x in H.sin_hacer(todos, reqs):
        if x[0].startswith('CA-'): amb.append([x[0], E(todos[x[0]]['etapa']) if x[0] in todos else x[4], '«Sin hacer» del Analista. ' + x[1] + ' Propuesta de QA: ' + x[2]])
    o.append(tabla(['Criterio', 'Corre en', 'Problema y propuesta de QA'], amb) + '\n')
    # etapa de los criterios nuevos según QA
    o.append(f'### Etapa de los {len(nuevos)} criterios nuevos: lectura de QA ({HOY})\n')
    o.append("QA leyó cada criterio nuevo o partido desde la versión del " + ANTERIOR + " y decidió en qué etapa corre y por qué. La columna «Documento» es la etapa que fija el documento funcional (tabla 22.1) o el módulo. **Coinciden en los " + str(sum(1 for c in nuevos if J.ETAPA_NUEVOS[c][0] == todos[c]['etapa'])) + " casos salvo los marcados.** Donde QA no está de acuerdo con el documento, la columna lo dice y el motivo queda en ambiguos.\n")
    filas = []
    for c in sorted(nuevos, key=clave):
        et, porque = J.ETAPA_NUEVOS[c]
        doc = todos[c]['etapa']
        filas.append([c, E(et), E(doc) + ('' if doc == et else ' (DIFIERE)'), porque])
    o.append(tabla(['Criterio', 'Etapa según QA', 'Documento', 'Por qué'], filas) + '\n')
    # módulos nuevos
    o.append('### Módulos nuevos en redacción\n')
    filas = []
    for nombre, sg in L.MODULOS_NUEVOS.items():
        est = L.estado_modulo_nuevo(nombre)
        filas.append([f'`docs/modulos/{nombre}.md`', sg, NOMBRES.get(sg, sg), est, 'incluido en las cifras' if est == 'completo' else 'NO incluido: pendiente. Se incorpora al regenerar cuando el archivo exista con sigla, requisitos, reglas RN, sección de criterios y al menos un criterio `CA-' + sg + '-NN`.'])
    o.append(tabla(['Archivo', 'Sigla', 'Módulo', 'Estado al ' + HOY, 'Qué hace QA'], filas) + '\n')
    o.append('Tampoco hay mención de estos módulos en el documento funcional (sección 26.2 de prefijos), en el registro de permisos ni en las decisiones; QA no puede suponer su alcance. Cuando lleguen: criterios por etapa, trazabilidad, aislamiento por empresa de cada tabla nueva y permisos denegados por petición directa, como en todo módulo.\n')
    # detalle
    o.append('---\n')
    o.append('## Detalle por módulo\n')
    cab = ['CA', 'Cubre', 'Etapa del requisito', 'Se ejecuta en', 'Se completa en', 'Tipo', 'Bloqueante', 'Nota', 'Fuente']
    orden = ['núcleo'] + sorted(k for k in cm if k != 'núcleo')
    for sg in orden:
        ids = sorted([c for c, v in todos.items() if v['sigla'] == sg], key=clave)
        o.append(f"### {'Núcleo (documento funcional, sección 22)' if sg == 'núcleo' else sg + ' · ' + NOMBRES.get(sg, sg)} ({len(ids)})\n")
        filas = []
        for c in ids:
            v = todos[c]
            nota = []
            if v['heredada']: nota.append('Etapa heredada del módulo')
            if v.get('nota_manual'): nota.append(v['nota_manual'])
            if v['antes']: nota.append('Corre antes de lo que necesita')
            if v['tarde'] and not v.get('nota_manual'): nota.append('Arranca después de su requisito')
            if c in J.PROPUESTA_PARTIR: nota.append(J.PROPUESTA_PARTIR[c])
            if c in J.REQ_ETAPA: nota.append('Etapa del requisito leída por QA: ' + J.REQ_ETAPA[c][2])
            if c in J.TIPOS: nota.append('Tipo ajustado por QA: ' + J.TIPOS[c][1])
            if c in ('CA-050a', 'CA-050b'): nota.append('Seguimiento (no bloquea) hasta la etapa en que se completa; bloquea desde allí')
            if c in ('CA-015f',): nota.append('Incluye un paso manual: verificar la identidad por otro medio')
            fuente = (f"documento-funcional.md:{v['linea']}" if sg == 'núcleo' else f"modulos/{v['archivo']}:{v['linea']}")
            filas.append([c, v['cabecera'] if len(v['cabecera']) <= 110 else v['cabecera'][:107] + '...', E(v['req_min']) if v['req_min'] is not None else '-', E(v['etapa']), E(v['completa']) if v['completa'] else '-', v['tipo'], v['bloq'], ' · '.join(nota), fuente])
        o.append(tabla(cab, filas) + '\n')
    return '\n'.join(o)


def main():
    escribir = '--escribir' in sys.argv
    commit = git('rev-parse', '--short', 'HEAD')
    sucio = git('status', '--short', 'docs/documento-funcional.md', 'docs/modulos', 'docs/registro-permisos.md', 'docs/equipo/decisiones.md').replace('\n', ', ').replace(' M ', '').replace('M ', '').strip()
    datos = cargar()
    nreqs, nrns, ncas, mreqs, mrns, mcas, todos = datos
    por, comp = cifras(todos)
    print('commit', commit, 'sucio', sucio, '| CA núcleo', len(ncas), 'módulos', len(mcas), 'total', len(todos))
    print('por etapa', {E(k): v for k, v in sorted(por.items())})
    print('completan', {E(k): v for k, v in sorted(comp.items())})
    dif = [(c, J.ETAPA_NUEVOS[c][0], todos[c]['etapa']) for c in J.ETAPA_NUEVOS if c in todos and J.ETAPA_NUEVOS[c][0] != todos[c]['etapa']]
    falta = [c for c in J.ETAPA_NUEVOS if c not in todos]
    print('criterios nuevos con juicio de etapa:', len(J.ETAPA_NUEVOS), '| no existen:', falta, '| etapa de QA distinta de la del documento:', [(c, E(a), E(b)) for c, a, b in dif])
    crit = generar_criterios(*datos, commit, sucio)
    if escribir:
        open('docs/calidad/criterios-por-etapa.md', 'w', encoding='utf8').write(crit)
        try:
            import traza
            open('docs/trazabilidad.md', 'w', encoding='utf8').write(traza.generar(*datos, commit, sucio))
        except ImportError:
            pass
    else:
        print(len(crit.split('\n')), 'líneas de criterios')


if __name__ == '__main__':
    main()

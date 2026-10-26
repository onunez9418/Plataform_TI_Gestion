"""Genera docs/calidad/criterios-por-etapa.md y docs/trazabilidad.md leyendo los documentos con scripts.
Uso, desde la raíz del repositorio:  python3 -I docs/calidad/herramientas/generar.py [--escribir]
Sin --escribir imprime solo las cifras. Los juicios de lectura están en juicios.py."""
import sys, os, re, subprocess, collections
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import lectura as L, etapas as T, juicios as J

E = L.etiqueta
HOY = '2026-10-26'
NOMBRES = {'ACC': 'Acceso', 'AYU': 'Mesa de ayuda', 'CAM': 'Gestión de cambios', 'CMD': 'CMDB ligera', 'DOM': 'Dominios y certificados',
           'ENT': 'Entregas y devoluciones', 'GAR': 'Garantías y mantenimiento', 'INT': 'Integraciones y API', 'LIC': 'Licencias de software',
           'LIN': 'Líneas móviles', 'NOT': 'Notificaciones', 'ONB': 'Onboarding y offboarding', 'POR': 'Portal de autoservicio',
           'PRB': 'Gestión de problemas', 'PRE': 'Presupuesto y costos', 'PRS': 'Personas y ubicaciones', 'PRV': 'Proveedores y contratos',
           'REP': 'Reportes y tableros'}


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
    for c, v in todos.items():
        v['tipo'] = T.tipo(v)
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
    o = []
    o.append('# Criterios de aceptación por etapa\n')
    o.append(f"**Autor:** QA (qa-tester) · **Fecha:** {HOY} · **Checkpoint:** commit `{commit}`{(' (más cambios sin guardar en: ' + sucio + ')') if sucio else ' (árbol de documentos fuente limpio al generar)'} · **Fuente:** `docs/documento-funcional.md` v0.3 (secciones 21, 22 y 22.1; AN-01 a AN-15; D-065 a D-076), `docs/registro-permisos.md` v1.1 y los 17 módulos de `docs/modulos/` en v0.3. Generado con `docs/calidad/herramientas/generar.py` (lectura de solo lectura; no se editó ningún documento fuente). Todas las cifras de este archivo valen para ese commit; si el documento cambia, se vuelve a generar.\n")
    o.append("**Para qué sirve.** Lista única de todos los criterios CA, con el módulo, los requisitos que cubre, la etapa en que se ejecutan, el tipo de prueba y si bloquean. Reemplaza a la versión del 2026-10-25 (424 criterios sobre el documento v0.3 sin partir). Para el núcleo, la etapa sale **de la tabla 22.1 del documento funcional** (la fijó el Analista, D-075); para los módulos, de los requisitos que cada criterio cubre, salvo donde el módulo trae su propia tabla (notificaciones) o donde QA leyó el texto (anotado en la columna Nota).\n")
    o.append('## Cómo leer las columnas\n')
    o.append("- **Cubre:** la cabecera del criterio, tal como la escribió el Analista o el escuadrón.\n- **Etapa del requisito:** la más temprana entre los requisitos que cubre. **Se ejecuta en:** la etapa en que el criterio **empieza** a correr. **Se completa en:** la etapa posterior en que ya existe todo lo que necesita (solo cuando 22.1 o el módulo lo dicen).\n- **Tipo:** unitaria (reglas y cálculos sin base de datos); integración (base real, servidor, permisos, concurrencia, reloj, correo); navegador (Playwright: pantallas, PDF); manual (personas o ensayo, con apoyo automático donde se pueda). Es una clasificación hecha con palabras del texto del criterio; QA la afina al escribir cada prueba.\n- **Bloqueante:** sí = si falla, la etapa no se aprueba. \"No (bloquea su módulo)\" = es de Fase 2 o 3 y bloquea la entrega de ese módulo, no la v1 (D-056).\n- **Etapa heredada:** el criterio solo cita reglas RN y no hay fila RF que lo cite; tomó la etapa más frecuente de su módulo. Debe confirmarlo el escuadrón.\n")
    o.append('## Resumen (checkpoint ' + commit + ', ' + HOY + ')\n')
    nuc, mod = len(ncas), len(mcas)
    o.append(f"**{nuc + mod} criterios:** {nuc} del núcleo (identificadores con letra, que son {n_num} números, CA-001 a CA-{max_num:03d}) y {mod} de los 17 módulos. El 2026-10-25 eran 424 (93 y 331). Qué cambió: el Analista agregó CA-083 a CA-094 (CA-094 es el código del activo, D-079) y partió CA-016, la auditoría inalterable (hoy CA-040a y CA-040b), CA-052a y b, CA-054, CA-060, CA-064 y CA-065; los escuadrones partieron CA-NOT-05 y CA-NOT-07 y agregaron un criterio a gestión de cambios y otro a gestión de problemas.\n")
    filas = []
    for e in list(range(0, 8)) + [L.FASE2, L.FASE3]:
        if por.get(e, 0) or comp.get(e, 0) or e <= 7:
            filas.append([E(e), por.get(e, 0), comp.get(e, 0)])
    filas.append(['**Total**', sum(por.values()), sum(comp.values())])
    o.append(tabla(['Se ejecuta en', 'Criterios que empiezan aquí', 'Criterios que se completan aquí (empezaron antes)'], filas) + '\n')
    o.append(f"**Criterios de la v1 (Etapas 0 a 7): {v1}.** De fases posteriores: {por.get(L.FASE2, 0) + por.get(L.FASE3, 0)}. Antes (2026-10-25): 139 y 285.\n")
    ant = {1: 30, 2: 26, 3: 3, 4: 47, 5: 26, 6: 3, 7: 4, L.FASE2: 136, L.FASE3: 149}
    fin = collections.Counter((v['completa'] or v['etapa']) for v in todos.values())
    filas = [[E(e), ant[e], por.get(e, 0), fin.get(e, 0)] for e in ant]
    o.append('Comparación con la versión anterior (2026-10-25). **Ojo, no es la misma medida:** la versión anterior contaba cada criterio en la etapa donde "se ejecuta completo" (la más tardía); esta cuenta dónde **empieza** y, aparte, dónde **termina**. La comparable con la anterior es la última columna.\n')
    o.append(tabla(['Etapa', 'Antes (completo)', 'Ahora (empiezan)', 'Ahora (terminan)'], filas) + '\n')
    o.append('Qué explica la diferencia: el Analista y los escuadrones agregaron 26 criterios (CA-083 a CA-094 y las particiones), y la tabla 22.1 hace empezar en la Etapa 1 varios criterios que antes se contaban completos más tarde (por ejemplo CA-001, CA-011a y b, CA-041, CA-045, CA-048, CA-069, CA-071 y CA-074). Por eso la columna "empiezan" de las Etapas 4 y 5 baja: parte de lo que allí se completa ya empezó antes.\n')
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
        pend = sum(1 for x in J.D076 if x[0] == e and x[3].startswith(('PENDIENTE', 'NUEVO', 'AMBIGUOS')))
        filas.append([E(e), por.get(e, 0), comp.get(e, 0), por.get(e, 0) + comp.get(e, 0), pend])
    o.append(tabla(['Etapa', 'Empiezan', 'Se completan', 'Bloqueantes en total', 'Puntos de D-076 aún pendientes antes de abrirla'], filas) + '\n')
    # no corren en la etapa de su requisito
    antes = sorted([c for c, v in todos.items() if v['antes']], key=clave)
    tarde = sorted([c for c, v in todos.items() if v['tarde']], key=clave)
    o.append(f'### Criterios que NO corren en la etapa de su requisito ({len(antes) + len(tarde)})\n')
    o.append(f"Dos casos distintos. **(A) Corren antes de lo que necesitan: {len(antes)}.** Es un defecto del criterio: no se puede ejecutar. **(B) Arrancan después de la etapa más temprana de su requisito: {len(tarde)}.** El requisito se entrega antes de que su criterio corra; la etapa de ese requisito se cierra sin esa prueba. Muchos son consecuencia legítima de que el criterio necesita un módulo posterior (órdenes, activos, actas); aun así, el Gerente de TI debe saberlo al cerrar la etapa.\n")
    o.append('**(A) Corren antes:**\n')
    notas_a = {x[0]: x[2] for x in J.AMBIGUOS}
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
    o.append(tabla(['Criterio', 'Corre en', 'Problema y propuesta de QA'], [list(x) for x in J.AMBIGUOS]) + '\n')
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

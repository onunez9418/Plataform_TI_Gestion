"""Genera docs/trazabilidad.md: requisito -> etapa -> criterio, con el resumen de huecos."""
import re, collections
import lectura as L, juicios as J, huecos as H
from generar import E, HOY, ANTERIOR, NOMBRES, tabla, esc, clave, sigla_ca


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
        ok = r['id'] in J.ACEPTABLES
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
    if r['id'] in J.OBS_MENOR: obs = (obs + '. ' if obs else '') + J.OBS_MENOR[r['id']]
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
    nmod = len({r['modulo'] for r in mreqs.values()})
    o.append(f"**Autor:** QA (qa-tester) · **Fecha:** {HOY} · **Checkpoint:** commit `{commit}`{(' (más cambios sin guardar en: ' + sucio + ')') if sucio else ''} · **Cubre:** el núcleo del documento funcional v0.3 (secciones 5 a 21, con D-077 a D-080) y los {nmod} módulos de `docs/modulos/` que ya están completos (los dos módulos nuevos en redacción, `microsoft-entra-intune` y `asistente-ia`, figuran en `docs/calidad/criterios-por-etapa.md`). Generado con `docs/calidad/herramientas/generar.py`; los juicios de lectura están en `docs/calidad/herramientas/juicios.py` y la revisión de citas y huecos en `docs/calidad/herramientas/huecos.py`. Reemplaza la versión del {ANTERIOR}.\n")
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
    hz = H.analizar(nreqs, nrns, ncas, mreqs, mrns, mcas, todos)
    v1_mod = {'personas-ubicaciones', 'entregas-devoluciones', 'proveedores-contratos', 'garantias-mantenimiento', 'notificaciones'}
    rnf_v1 = [k for k in hz['rf_sin_criterio'] if k in mreqs and mreqs[k]['modulo'] in v1_mod]
    rn_mod = [k for k in hz['rn_sin_criterio'] if k in mrns]
    rn_mod_v1 = [k for k in rn_mod if mrns[k]['modulo'] in v1_mod]
    rf_mod = [k for k in hz['rf_sin_criterio'] if k in mreqs]
    filas = [
        ['Filas RF y RNF del núcleo (con las retiradas)', 316, len(nreqs)],
        ['Retiradas (RF-USR-004, RF-IMP-012, RF-OS-007)', 3, len(nreqs) - n_act],
        ['Filas vigentes', 313, n_act],
        ['Citas rotas en la columna CA de un requisito o regla (criterio inexistente o «padre» que ya se partió)', 0, len(hz['rotas_columna'])],
        ['Citas sueltas en el texto a un criterio inexistente (más alusiones históricas a criterios ya partidos)', '-', f"{len(hz['rotas_texto'])} (más {len(hz['historicos_texto'])})"],
        ['Cabeceras de criterio que nombran un RF, RNF o RN que no existe', '-', len(hz['req_inexistentes'])],
        ['Cubiertos: el criterio los lista', 295, cnt['cubierto'] + cnt['cubierto (lectura de QA)']],
        ['No probados de verdad (núcleo)', 14, np_nuc],
        ['No probados de verdad (módulos con parte en la v1)', 5, np_mod],
        ['Citas mal apuntadas o incompletas (núcleo)', 4, cnt['cita mal apuntada o incompleta']],
        ['Para verificar leyendo el texto (sin juicio de QA todavía)', 0, cnt['verificar']],
        ['Reglas RN con un criterio en su columna CA', '23 de 23', f'{rn_col} de {len(nrns)}'],
        ['Reglas RN que el propio criterio también cita (cita de vuelta)', '10 de 23', f'{rn_vuelta} de {len(nrns)}'],
        ['Reglas RN que ninguna cabecera de criterio nombra (solo están en la columna CA de la regla)', '13 de 23', f'{len(nrns) - rn_cit} de {len(nrns)}'],
        ['Reglas RN cuyo criterio no las prueba del todo', '4 (RN-009, RN-018, RN-021, RN-023)', f'{len(J.RN_PARCIAL)} ({", ".join(sorted(J.RN_PARCIAL))})'],
        ['Criterios sin ningún requisito ni regla que los cite o liste', '-', f"{len(hz['ca_sin_nada'])} ({', '.join(hz['ca_sin_nada'])})"],
        ['Criterios citados solo por reglas RN o RS (sin fila RF)', 59, len(hz['ca_solo_rn'])],
        ['Reglas RN de módulos sin criterio (de ellas, en módulos con parte en la v1)', '-', f'{len(rn_mod)} ({len(rn_mod_v1)})'],
        ['RF y RNF de módulos sin criterio (de ellos, en módulos con parte en la v1)', '-', f'{len(rf_mod)} ({len(rnf_v1)})'],
        ['«Sin hacer» del Analista que siguen abiertos', '-', len(hz['sin_hacer'])],
    ]
    o.append(tabla(['Medida', f'Antes ({ANTERIOR}, commit 5ed0dcb)', f'Hoy ({HOY}, commit {commit})'], filas) + '\n')
    o.append(f"Lectura: las {len(nrns)} reglas del núcleo tienen criterio (RN-024, la congelación, entró con CA-095a a 095j). De los 19 requisitos que el 2026-10-26 no se probaban de verdad, quedan {np_nuc + np_mod}: RF-ENT-002, RF-ENT-016 y RF-OC-028 (los «Sin hacer» del Analista) y RF-OC-048 (el informe mensual espera la respuesta P-018). Los demás los resolvieron los criterios CA-015g a 015i, CA-038c y 038d, CA-071, CA-097 a CA-105 y las particiones de PRV y GAR. Las cuatro citas mal apuntadas de entonces (RF-USR-006, RF-PER-010, RF-ACC-021, RF-UX-008) y RF-OC-041 se corrigieron; aparecen dos nuevas (RF-CAT-008 y RF-GAR-006).\n")
    # --- Lo que falta, exacto, y de quién
    o.append('## Lo que falta, exacto, y de quién\n')
    o.append(f"Lista cerrada al {HOY} (commit {commit}). Cada fila dice qué falta, el texto que QA propone y quién lo cierra. El texto de QA es una **propuesta**: lo decide y lo redacta el Analista (o el escuadrón). Estas filas se recalculan al regenerar: cuando el Analista las resuelva, desaparecen solas de la primera tabla.\n")
    o.append('**1. «Sin hacer» del Analista (se detectan leyendo el texto actual)**\n')
    o.append(tabla(['Pendiente', 'Qué falta exacto', 'Propuesta de QA', 'Quién', 'Bloquea'], [list(x) for x in hz['sin_hacer']]) + '\n')
    o.append('**2. Otros huecos de redacción que QA encontró al leer**\n')
    filas = [
        ['CA-095j', 'Está en Fase 2, pero la v1 ya tiene cuatro rutinas de purga o anonimización que RN-024 obliga a respetar.', 'Partir en 095j1 (Etapa 2: contactos de proveedor y anonimización automática de Personas con la bandera de pruebas), 095j2 (Etapa 4: filas de importación en preparación), 095j3 (Etapa 7: eventos de seguridad a 12 meses) y dejar 095j para Fase 2.', 'Analista', 'Etapas 2, 4 y 7'],
        ['CA-095f, CA-095g', 'Dependen del permiso nuevo de P-017 (no existe en el registro) y de si levantar exige una segunda persona de plataforma.', 'Hasta que responda P-017, QA solo ejecuta los rechazos.', 'Gerente de TI responde P-017; Analista actualiza registro y criterios', 'Etapa 2'],
        ['CA-102', 'No fija los bordes: suma exactamente igual al límite y compra a exactamente 30 días.', 'Avisa solo si la suma supera el límite; 30 días corridos con el día 30 incluido; agregar los casos 5.000,00 (sin aviso), día 30 (con aviso) y día 31 (sin aviso).', 'Analista', 'Etapa 5'],
        ['RF-OC-048 (informe mensual)', 'Sin criterio: espera P-018 (qué registros entran y dónde lo ve quien aprueba).', 'Ninguna hasta que responda P-018.', 'Gerente de TI responde P-018', 'Etapa 5'],
        ['RF-OC-049 con cambios', 'CA-103 prueba el borrador sin cambios; el caso con cambios espera P-019.', 'Ninguna hasta que responda P-019.', 'Gerente de TI responde P-019', 'Etapa 5'],
        ['CA-017 y RF-CAT-008', 'CA-017 no nombra el prefijo reservado `ACTV` (D-079); RF-CAT-008 no cita CA-094a.', 'Agregar `ACTV` al ejemplo de CA-017 («un prefijo reservado como `OC` o `ACTV` se rechaza») y citar CA-094a en RF-CAT-008.', 'Analista', 'Etapa 2'],
        ['RF-GAR-006', 'La mitad «una ampliación es una garantía nueva» la prueba CA-GAR-04f (Fase 2).', 'Citar CA-GAR-04f o decir que esa mitad es de Fase 2.', 'Analista (escuadrón A)', 'Etapa 4'],
        ['Documento funcional, línea 1233 (sección 26.1)', 'Dice «CA-095 … son nuevos»: CA-095 ya no existe como uno solo (partido en 095a a 095j). La línea del módulo DAT (1230) dice «CA-095a a i» y deja fuera CA-095j.', 'Decir «CA-095a a j».', 'Analista', 'Auditoría de citas'],
        ['CA-NOT-10, CA-NOT-13', 'Corren en Etapa 1 y cubren requisitos de Fase 2.', 'El escuadrón C dice qué parte corre en Etapa 1 (ver criterios-por-etapa.md).', 'Analista (escuadrón C)', 'Etapa 1'],
        ['CA-PRS-16', 'Cita RN-PRS-004 cuando prueba el alcance «propio» sin Persona vinculada.', 'Cambiar la cita.', 'Analista (escuadrón B)', 'Etapa 2'],
        ['CA-GAR-04a', 'Dice «a las 23:59» sin zona horaria.', 'Zona de la empresa; agregar una empresa de otra zona.', 'Analista (escuadrón A)', 'Etapa 4'],
        ['RF-IMP-010 (plantilla)', 'Ningún criterio prueba que la plantilla trae costo, moneda, fecha de compra, fin de garantía y centro de costo.', 'Una línea en CA-038a.', 'Analista', 'Etapa 4'],
        ['RN-010', 'No nombra CA-079b (autoentrega sin excepción).', 'Agregar CA-079b a la columna CA.', 'Analista', 'Etapa 1'],
        [f"{len(rnf_v1)} RNF de los módulos PRS, ENT, PRV, GAR y NOT", 'Ninguna fila ni criterio los cita (H-QA-27).', 'Cada escuadrón cita el criterio de cada RNF; hasta entonces QA los prueba con CA-050a, CA-053 y CA-001.', 'Analista (escuadrones A, B, C, D)', 'Etapas 2, 4 y 5'],
        [f"{len(rn_mod_v1)} reglas RN de los módulos con parte en la v1", 'Sin criterio que las cite o las liste.', 'Cada escuadrón cita el criterio de cada regla antes de la etapa del módulo (D-076.4).', 'Analista (escuadrones A, B, C, D)', 'Etapas 2, 4 y 5'],
        ['CA-AYU-26, CA-PRE-12', 'Ningún requisito ni regla los cita ni los lista.', 'Fase 2 y Fase 3: el escuadrón los vincula al activar el módulo.', 'Analista (escuadrones de mesa de ayuda y presupuesto)', 'Fase 2 y 3'],
        ['CA-105 (Etapa 0)', 'El texto está; no se puede ejecutar hasta recibir el Excel, la orden de compra y la orden de servicio reales con nombres reemplazados (P-002).', 'QA revisa el archivo cuando llegue.', 'Cliente (CEO) entrega; Jefatura de Proyecto lo pide', 'Etapa 0 (cierre) y Etapa 4'],
        ['Módulo MSF (Microsoft Entra e Intune)', 'El archivo no existe todavía.', 'QA lo lee, regenera cifras y agrega su aislamiento y permisos a este plan cuando llegue.', 'Analista', 'Fase posterior'],
    ]
    o.append(tabla(['Pendiente', 'Qué falta', 'Propuesta de QA', 'Quién', 'Bloquea'], filas) + '\n')
    o.append('**3. Preguntas que esperan respuesta y frenan una prueba**\n')
    o.append(tabla(['Pregunta', 'Qué prueba frena', 'Quién responde'], [
        ['P-017 · permiso nuevo para declarar y levantar la congelación; ¿levantar exige una segunda persona de plataforma?; ¿se congela la redacción por seguridad?', 'CA-095e (parcial), CA-095f, CA-095g; matriz de permisos (un permiso más)', 'Gerente de TI, con el Arquitecto y Seguridad'],
        ['P-018 · qué registros entran al informe mensual «sin respaldo de compra» y dónde lo ve quien aprueba', 'Parte de RF-OC-048', 'Gerente de TI'],
        ['P-019 · los 7 días del borrador de recepción, ¿desde la creación o desde el último cambio?', 'CA-103 con cambios', 'Gerente de TI'],
        ['P-009 · ¿dar de baja un activo de valor exige una segunda persona y desde qué monto?', 'RF-OC-028 (Etapa 7)', 'Gerente de TI'],
        ['P-007 · textos de estado y columnas del Excel real', 'CA-038d (usa textos supuestos)', 'Analista y Datos, con el Excel real'],
        ['P-002 · Excel, orden de compra y orden de servicio reales con nombres reemplazados', 'CA-105 (Etapa 0)', 'Cliente (CEO), por la Jefatura de Proyecto'],
    ]) + '\n')
    # --- D-076
    o.append('## Qué exige D-076, hoy, y quién lo cierra\n')
    o.append("Regla (D-076): un requisito necesita un criterio que lo pruebe **antes de que se abra la etapa en que se programa**. Responsables: el **Analista** redacta o cita el criterio; **QA** revisa y propone el texto cuando el Analista lo prefiera; el **Auditor Técnico** verifica con su guion que ningún requisito de la etapa que se abre quede sin criterio; el **Gerente de TI** no abre una etapa con esa verificación pendiente. Estado según la lectura de QA al " + HOY + ".\n")
    for et, titulo in [(1, 'Antes de la Etapa 1 (puerta de la Etapa 0 y v1.0)'), (2, 'Antes de la Etapa 2'), (4, 'Antes de la Etapa 4'), (5, 'Antes de la Etapa 5'), (7, 'Antes de la Etapa 7')]:
        filas = [[x[1], x[2], x[3].format(vuelta=rn_vuelta, solo=len(nrns) - rn_vuelta, total=len(nrns)), x[4]] for x in J.D076 if x[0] == et]
        if filas:
            o.append(f'**{titulo}**\n')
            o.append(tabla(['Requisito o regla', 'Criterio', 'Estado (lectura de QA)', 'Responsable'], filas) + '\n')
    hechos = sum(1 for x in J.D076 if x[3].startswith('HECHO'))
    abiertos = [x for x in J.D076 if x[3].startswith(J.ABIERTOS)]
    por_etapa = collections.Counter(x[0] for x in abiertos)
    o.append(f"Resultado: {hechos} de los {len(J.D076)} puntos listados están hechos en el texto; {len(abiertos)} siguen abiertos (pendientes, parciales o bloqueados por una respuesta o un archivo). **Abiertos por etapa:** " + ', '.join(f'Etapa {e}: {n}' for e, n in sorted(por_etapa.items())) + ". **Antes de la Etapa 1 solo queda abierto** " + ('; '.join(x[1] + ' (' + x[3].split('.')[0].split(' (')[0].lower() + ')' for x in abiertos if x[0] == 1) or 'nada') + ".\n")
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

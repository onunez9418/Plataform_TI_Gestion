/* =========================================================================
   Administración: usuarios, roles y permisos, auditoría, consola de
   plataforma, configuración y módulos, autorizar soporte.
   ========================================================================= */
'use strict';

/* ---------- PR-21 Usuarios ---------- */
ruta('usuarios', { id: 'PR-21', titulo: 'Usuarios', acceso: 'usuarios.ver', render() {
  const acciones = (u) => {
    const ultimo = u.ultimoAdmin;
    const razonUlt = 'Es el último administrador activo: la empresa siempre necesita al menos uno.';
    let h = '';
    if (u.estado === 'Dado de baja') return '<span class="suave chica">Definitivo en esta empresa</span>';
    h += btnAcc({ texto: 'Cambiar rol', clase: 'chico', acc: 'usr-rol', datos: { c: u.correo }, perm: 'usuarios.cambiar_rol', bloqueo: ultimo ? razonUlt : '' });
    h += btnAcc({ texto: u.estado === 'Suspendido' ? 'Reactivar' : 'Suspender', clase: 'chico', acc: 'usr-susp', datos: { c: u.correo }, perm: 'usuarios.suspender', bloqueo: ultimo ? razonUlt : '' });
    h += btnAcc({ texto: 'Dar de baja', clase: 'chico peligro', acc: 'usr-baja', datos: { c: u.correo }, perm: 'usuarios.dar_baja', bloqueo: ultimo ? razonUlt : '' });
    return `<div class="acciones-fila">${h}</div>`;
  };
  return `${cabeceraPantalla('Usuarios', btnAcc({ texto: 'Invitar usuario', acc: 'usr-invitar', clase: 'primario', icono: 'mas', perm: 'usuarios.invitar' }) + '<span class="id-pantalla">PR-21 · prioridad A</span>')}
  <p class="suave">Un usuario es quien entra a la plataforma. Quien solo recibe equipos es una <em>Persona</em> y no necesita cuenta. Un usuario nunca se borra: se suspende o se da de baja.</p>
  ${puede('usuarios.cambiar_rol') ? '' : aviso('info', 'Solo consulta', 'Invitar, cambiar roles, suspender y dar de baja son permisos del Administrador.')}
  ${listaHTML('usuarios', {
    datos: () => D().usuarios,
    campos: [{ k: 'q', etq: 'Buscar por nombre o correo', tipo: 'texto' }, { k: 'est', etq: 'Estado', tipo: 'sel', op: () => ['Invitado', 'Activo', 'Suspendido', 'Dado de baja'] }, { k: 'rol', etq: 'Rol', tipo: 'sel', op: () => [...new Set(D().usuarios.map((u) => u.rol))] }],
    filtrar: (u, f) => contiene(f.q, u.nombre, u.correo) && (!f.est || u.estado === f.est) && (!f.rol || u.rol === f.rol),
    cols: [{ t: 'Nombre', k: (u) => esc(u.nombre) + (u.ultimoAdmin ? ' ' + chipEtq('Último administrador') : '') }, { t: 'Correo', k: (u) => esc(u.correo) }, { t: 'Rol', k: (u) => u.rol }, { t: 'Estado', k: (u) => chip(u.estado) }, { t: 'Último ingreso', k: (u) => u.ultimo }, { t: 'Segunda verificación', k: (u) => u.dosF ? 'Activada' : (['Administrador', 'Jefatura TI'].includes(u.rol) ? chip('Pendiente de completar') : 'Opcional') }, { t: 'Acciones', sin: true, k: acciones }]
  })}`;
} });
ACC['usr-invitar'] = () => abrirDialogo({ titulo: 'Invitar usuario', cuerpo: `<div class="campo"><label for="iv-c">Correo <span class="obligatorio">(obligatorio)</span></label><input id="iv-c" type="email" placeholder="nombre@empresa.pe"><div class="error" id="iv-e" hidden>${icono('alerta')}<span>Escriba un correo válido.</span></div></div><div class="campo"><label for="iv-r">Rol</label><select id="iv-r">${['Administrador', 'Jefatura TI', 'Técnico', 'Almacén', 'Solicitante', 'Solo lectura'].map((r) => `<option>${r}</option>`).join('')}</select><div class="ayuda">No puede dar un rol con más permisos que el suyo.</div></div><p class="suave chica">La invitación tiene un texto fijo, vence a los 7 días, se usa una sola vez y queda ligada a este correo. Se puede cancelar.</p>`, botones: [{ texto: 'Volver' }, { texto: 'Enviar invitación', clase: 'primario', alPulsar: (d) => { const c = d.querySelector('#iv-c').value.trim(); if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c)) { d.querySelector('#iv-e').hidden = false; d.querySelector('#iv-c').focus(); return false; } D().usuarios.push({ nombre: c.split('@')[0], correo: c, rol: d.querySelector('#iv-r').value, estado: 'Invitado', ultimo: 'Aún no ha ingresado', dosF: false }); toast('Invitación enviada a ' + esc(c) + '.'); render(true); } }] });
const usrDe = (c) => D().usuarios.find((u) => u.correo === c);
ACC['usr-rol'] = (el) => { const u = usrDe(el.dataset.c); abrirDialogo({ titulo: 'Cambiar el rol de ' + esc(u.nombre), cuerpo: `<p>Rol actual: <strong>${u.rol}</strong>. El cambio vale desde su siguiente acción.</p><div class="campo"><label for="cr">Nuevo rol</label><select id="cr">${['Administrador', 'Jefatura TI', 'Técnico', 'Almacén', 'Solicitante', 'Solo lectura'].map((r) => `<option ${r === u.rol ? 'selected' : ''}>${r}</option>`).join('')}</select></div>`, botones: [{ texto: 'Volver' }, { texto: 'Cambiar rol', clase: 'primario', alPulsar: (d) => { u.rol = d.querySelector('#cr').value; toast('Rol cambiado. Queda en la auditoría con el valor anterior y el nuevo.'); render(true); } }] }); };
ACC['usr-susp'] = (el) => { const u = usrDe(el.dataset.c); if (u.estado === 'Suspendido') { u.estado = 'Activo'; toast('Usuario reactivado.'); render(true); return; } dialogoMotivo({ titulo: 'Suspender a ' + esc(u.nombre), verbo: 'Suspender', consecuencias: ['Sus sesiones se cortan al instante.', 'Se puede reactivar cuando quiera.'], alConfirmar: () => { u.estado = 'Suspendido'; toast('Usuario suspendido.'); render(true); } }); };
ACC['usr-baja'] = (el) => { const u = usrDe(el.dataset.c); dialogoMotivo({ titulo: 'Dar de baja a ' + esc(u.nombre), verbo: 'Dar de baja', destructivo: true, consecuencias: ['Es definitivo para esta empresa.', 'Sus sesiones se cortan al instante.', 'Su historial se conserva; sus datos personales se anonimizan pasado el plazo (aún sin activar).'], alConfirmar: () => { u.estado = 'Dado de baja'; toast('Usuario dado de baja.'); render(true); } }); };

/* ---------- PR-22 Roles y matriz de permisos ---------- */
const COLS = [['adm', 'Administrador'], ['jef', 'Jefatura TI'], ['tec', 'Técnico'], ['alm', 'Almacén'], ['sol', 'Solicitante'], ['sl', 'Solo lectura'], ['emp', 'Empleado (portal)']];
const celda = (v) => v === 'T' ? '<span class="t">Todo</span>' : v === 'P' ? '<span class="p">Propio</span>' : '<span class="n" aria-label="No puede">—</span>';
ruta('roles', { id: 'PR-22', titulo: 'Roles y permisos', acceso: 'roles.ver', render() {
  const f = (APP.tmp.fr = APP.tmp.fr || { q: '', soloS: false, fases: false, rol: '' });
  return `${cabeceraPantalla('Roles y permisos', btnAcc({ texto: 'Crear rol', acc: 'rol-nuevo', clase: 'primario', icono: 'mas', perm: 'roles.administrar' }) + '<span class="id-pantalla">PR-22 · prioridad A</span>')}
  <p>Cada rol es un conjunto de permisos. Hay <strong>7 plantillas</strong> que se copian a cada empresa; cada empresa edita su copia sin afectar a las demás. Un rol nuevo <strong>parte sin ningún permiso</strong>, y nadie puede darse permisos a sí mismo.</p>
  ${puede('roles.administrar') ? '' : aviso('info', 'Solo consulta', 'Crear y editar roles es un permiso sensible del Administrador.')}
  <div class="tarjeta" style="margin-bottom:16px"><h2>¿Qué puede hacer un rol?</h2><div class="campo" style="max-width:320px"><label for="rl-rol">Elija un rol</label><select id="rl-rol" data-cambio="rl-rol"><option value="">—</option>${COLS.map((c) => `<option value="${c[0]}" ${f.rol === c[0] ? 'selected' : ''}>${c[1]}</option>`).join('')}</select></div><div id="rl-prev">${previaRol(f.rol)}</div></div>
  <div class="barra-herr"><div class="campo buscador"><label for="rl-q">Buscar un permiso</label><input id="rl-q" type="search" value="${esc(f.q)}" placeholder="Ejemplo: aprobar, exportar, clave" data-entrada="rl-q"></div>
  <div class="opcion"><input type="checkbox" id="rl-s" ${f.soloS ? 'checked' : ''} data-cambio="rl-s"><label for="rl-s">Solo permisos sensibles</label></div><div class="opcion"><input type="checkbox" id="rl-f" ${f.fases ? 'checked' : ''} data-cambio="rl-f"><label for="rl-f">Incluir los de las fases 2 y 3</label></div></div>
  <div id="zona-matriz">${matrizHTML()}</div>
  <p class="suave chica">Todo permiso se comprueba en el servidor; ocultar un botón en pantalla es solo comodidad. «Propio» significa lo que la persona creó o le corresponde. Fuente: registro único de permisos (${PERMISOS.length} filas).</p>`;
} });
function previaRol(r) {
  if (!r) return '<p class="suave">Elija un rol para ver un resumen.</p>';
  const mine = PERMISOS.filter((p) => p.v[r] && p.v[r] !== '-' && !p.n.startsWith('plataforma.'));
  const sens = mine.filter((p) => p.s);
  const mods = {}; mine.forEach((p) => { const m = p.n.split('.')[0]; mods[m] = (mods[m] || 0) + 1; });
  return `<p><strong>${mine.length}</strong> permisos, de los cuales <strong>${sens.length}</strong> son sensibles (exigen segunda verificación).</p><p class="suave chica">Módulos: ${Object.keys(mods).map((m) => `${NOMBRES_MOD[m] || m} (${mods[m]})`).join(' · ')}</p>`;
}
function matrizHTML() {
  const f = APP.tmp.fr;
  const mods = {};
  PERMISOS.filter((p) => !p.n.startsWith('plataforma.') && (f.fases || (p.w || '').startsWith('v1')) && (!f.soloS || p.s) && contiene(f.q, p.n, p.q)).forEach((p) => { const m = p.n.split('.')[0]; (mods[m] = mods[m] || []).push(p); });
  const claves = Object.keys(mods);
  if (!claves.length) return vacio({ titulo: 'Ningún permiso coincide', texto: 'Cambie la búsqueda o los filtros.' });
  const abrir = f.q || f.soloS;
  return claves.map((m, i) => `<div class="acordeon"><h3><button type="button" aria-expanded="${abrir || i === 0}" aria-controls="mx${i}" data-acc="acordeon">${icono('flecha')}${NOMBRES_MOD[m] || m} <span class="chip etq">${mods[m].length}</span></button></h3><div class="panel" id="mx${i}" ${abrir || i === 0 ? '' : 'hidden'}>
    <div class="envoltura-tabla"><table class="tabla matriz"><caption class="oculto-visual">Permisos de ${NOMBRES_MOD[m] || m} por rol</caption><thead><tr><th scope="col">Permiso</th>${COLS.map((c) => `<th scope="col" class="${f.rol === c[0] ? 'resalta' : ''}">${c[1]}</th>`).join('')}</tr></thead><tbody>${mods[m].map((p) => `<tr><th scope="row" style="font-weight:500;text-align:left">${esc(p.q)} ${p.s ? chip('Sensible', 'sensible') : ''} ${(p.w || '').startsWith('v1') ? '' : chipEtq(p.w || '')}<br><span class="cod suave">${p.n}</span></th>${COLS.map((c) => `<td ${f.rol === c[0] ? 'style="background:var(--c-menu-activo-fondo)"' : ''}>${celda(p.v[c[0]])}</td>`).join('')}</tr>`).join('')}</tbody></table></div></div></div>`).join('');
}
ENTRADA['rl-q'] = (el) => { APP.tmp.fr.q = el.value; document.getElementById('zona-matriz').innerHTML = matrizHTML(); };
CAMBIO['rl-s'] = (el) => { APP.tmp.fr.soloS = el.checked; document.getElementById('zona-matriz').innerHTML = matrizHTML(); };
CAMBIO['rl-f'] = (el) => { APP.tmp.fr.fases = el.checked; document.getElementById('zona-matriz').innerHTML = matrizHTML(); };
CAMBIO['rl-rol'] = (el) => { APP.tmp.fr.rol = el.value; document.getElementById('rl-prev').innerHTML = previaRol(el.value); document.getElementById('zona-matriz').innerHTML = matrizHTML(); };
ACC['rol-nuevo'] = () => abrirDialogo({ titulo: 'Crear un rol', cuerpo: '<div class="campo"><label for="rn">Nombre del rol <span class="obligatorio">(obligatorio)</span></label><input id="rn" type="text"></div><div class="aviso info">' + icono('info') + '<div class="cuerpo-aviso">Un rol nuevo <strong>parte sin ningún permiso</strong>. Usted no puede darle más permisos de los que tiene, y no puede cambiar su propio rol. Los permisos sensibles se otorgan por separado y exigen segunda verificación.</div></div>', botones: [{ texto: 'Volver' }, { texto: 'Crear rol', clase: 'primario', alPulsar: () => toast('Rol creado sin permisos (simulado).') }] });

/* ---------- PR-23 Auditoría ---------- */
ruta('auditoria', { id: 'PR-23', titulo: 'Auditoría', acceso: 'auditoria.ver', render(q) {
  const tab = q.tab || 'negocio';
  const seg = [{ f: '25/10/2026 09:41', q: 'Marta Quispe', e: 'Intentó ver un activo de otra empresa', r: 'Rechazado: no encontrado' }, { f: '24/10/2026 17:02', q: 'rosa.medina@ejemplo.pe', e: 'Inicio de sesión fallido (intento 3 de 5)', r: 'Espera de 2 minutos' }, { f: '23/10/2026 08:15', q: 'Ana Vega', e: 'Intentó aprobar una orden sin permiso', r: 'Rechazado: no tiene permiso' }];
  return `${cabeceraPantalla('Auditoría', '<span class="id-pantalla">PR-23 · prioridad A</span>')}
  ${aviso('sensible', 'La auditoría solo se agrega', 'Nadie puede editar ni borrar una entrada, ni siquiera el Administrador. Consultar esta pantalla también queda registrado. Distinta del «Historial» de cada ficha, que dice qué le pasó a un activo: la auditoría dice <strong>quién tocó qué</strong>.')}
  ${pestanas('aud', [{ k: 'negocio', t: 'Auditoría de la empresa' }].concat(puede('auditoria.ver_seguridad') ? [{ k: 'seg', t: 'Eventos de seguridad', n: seg.length }] : []), tab)}
  ${panel('aud', 'negocio', tab, listaHTML('aud', {
    datos: () => D().auditoria,
    campos: [{ k: 'q', etq: 'Buscar', tipo: 'texto', ph: 'OC-000212, Marta…' }, { k: 'mod', etq: 'Módulo', tipo: 'sel', op: () => [...new Set(D().auditoria.map((a) => a.mod))] }, { k: 'tipo', etq: 'Quién actuó', tipo: 'sel', op: () => ['Usuario', 'Sistema', 'Integración'] }],
    filtrar: (a, f) => contiene(f.q, a.quien, a.obj, a.acc) && (!f.mod || a.mod === f.mod) && (!f.tipo || a.tipo === f.tipo),
    cols: [{ t: 'Cuándo', k: (a) => a.f }, { t: 'Quién', k: (a) => esc(a.quien) + ' ' + chipEtq(a.tipo) }, { t: 'Módulo', k: (a) => a.mod }, { t: 'Acción', k: (a) => esc(a.acc) }, { t: 'Sobre', k: (a) => `<span class="cod">${esc(a.obj)}</span>` }, { t: 'Antes y después', k: (a) => `<details><summary>Ver detalle</summary><dl class="lista-datos" style="margin-top:8px"><dt>Antes</dt><dd>${esc(a.antes)}</dd><dt>Después</dt><dd>${esc(a.despues)}</dd>${a.motivo ? `<dt>Motivo</dt><dd>${esc(a.motivo)}</dd>` : ''}</dl></details>` }]
  }))}
  ${puede('auditoria.ver_seguridad') ? panel('aud', 'seg', tab, `<p class="suave">Intentos rechazados, accesos fallidos y sesiones de soporte. Se guardan aparte de la auditoría de negocio, con la empresa de quien los intentó.</p>${tabla({ filas: seg, cols: [{ t: 'Cuándo', k: (a) => a.f }, { t: 'Quién', k: (a) => esc(a.q) }, { t: 'Evento', k: (a) => esc(a.e) }, { t: 'Resultado', k: (a) => esc(a.r) }] })}`) : ''}`;
} });

/* ---------- PR-24 Consola de plataforma ---------- */
const EMP_PLAT = [{ n: 'Distribuidora Andina S.A.', pais: 'Perú', mon: 'PEN', estado: 'Activa', admins: 1 }, { n: 'Clínica Santa Aurora', pais: 'Perú', mon: 'USD', estado: 'Activa', admins: 1 }, { n: 'Taller Mecánico Pacífico E.I.R.L.', pais: 'Perú', mon: 'PEN', estado: 'Suspendida', admins: 0 }];
function plataformaPantalla(tab) {
  const t = tab || 'empresas';
  let c = '';
  if (t === 'empresas') {
    c = `${aviso('sensible', 'Esta consola no ve los datos del negocio', 'No puede ver activos, compras, personas ni precios de ninguna empresa. Si necesita ayudar, la empresa debe autorizar el soporte por un máximo de 24 horas.')}
    <div class="barra-herr">${btnAcc({ texto: 'Crear empresa', acc: 'pl-crear', clase: 'primario', icono: 'mas', perm: 'plataforma.empresas_gestionar' })}</div>
    ${tabla({ filas: EMP_PLAT, cols: [{ t: 'Empresa', k: (e) => esc(e.n) }, { t: 'País', k: (e) => e.pais }, { t: 'Moneda base', k: (e) => e.mon }, { t: 'Estado', k: (e) => chip(e.estado) }, { t: 'Administradores', cls: 'num', k: (e) => e.admins + (e.admins === 1 ? ' ' + chipEtq('Se recomienda tener dos') : '') + (e.admins === 0 ? ' ' + chip('Con errores').replace('Con errores', 'Sin administrador') : '') }, { t: 'Acciones', sin: true, k: (e) => `<div class="acciones-fila">${e.estado === 'Activa' ? `<button class="btn chico" type="button" data-acc="pl-susp" data-n="${esc(e.n)}">Suspender</button>` : `<button class="btn chico" type="button" data-acc="pl-react" data-n="${esc(e.n)}">Reactivar</button>`}${e.admins === 0 ? `<button class="btn chico peligro" type="button" data-acc="pl-rescate" data-n="${esc(e.n)}">Rescatar</button>` : ''}</div>` }] })}`;
  } else if (t === 'soporte') {
    c = `<p>Las empresas autorizan el soporte desde su configuración. Solo lectura, una empresa y un motivo por vez, máximo 24 horas.</p>${tabla({ filas: [{ e: 'Distribuidora Andina S.A.', m: 'Ayudar con la importación inicial', h: '26/10/2026 14:00', est: 'Vigente' }, { e: 'Clínica Santa Aurora', m: 'Consulta sobre roles', h: '20/10/2026 10:00', est: 'Terminado' }], cols: [{ t: 'Empresa', k: (x) => esc(x.e) }, { t: 'Motivo', k: (x) => esc(x.m) }, { t: 'Vence', k: (x) => x.h }, { t: 'Estado', k: (x) => chip(x.est) }, { t: 'Acción', sin: true, k: (x) => x.est === 'Vigente' ? '<button class="btn chico primario" type="button" data-acc="pl-soporte">Abrir sesión de soporte</button>' : '' }] })}
    ${APP.tmp.soporte ? `<div class="aviso sensible" role="status">${icono('candado')}<div class="cuerpo-aviso"><strong>Modo soporte: solo lectura en Distribuidora Andina S.A. hasta 26/10/2026 14:00</strong>Todo lo que vea queda en la auditoría de esa empresa. <button class="btn chico" type="button" data-acc="pl-soporte-salir">Salir</button></div></div>${tabla({ filas: DATOS_BASE.e1.activos.slice(0, 4), cols: [{ t: 'Serie', k: (a) => `<span class="cod">${a.serie}</span>` }, { t: 'Estado', k: (a) => chip(a.estado) }, { t: 'Responsable', k: (a) => oculto(a.resp || 'PRS-----') }] })}` : ''}`;
  } else if (t === 'correo') {
    c = `<div class="rejilla"><div class="tarjeta"><div class="cifra">214</div><div class="cifra-etq">correos enviados hoy (tope por empresa: 1.000)</div></div><div class="tarjeta"><h2>Proveedor de envío</h2>${chip('Activo').replace('Activo', 'Operativo')}<p class="suave chica">Solo se ven totales por empresa, nunca destinatarios ni textos.</p></div><div class="tarjeta"><div class="cifra">2</div><div class="cifra-etq">rebotes en las últimas 24 horas</div></div></div>`;
  } else {
    c = tabla({ filas: [{ f: '25/10/2026 08:02', q: 'Equipo de plataforma', a: 'Creó la empresa «Clínica Santa Aurora»' }, { f: '22/10/2026 16:40', q: 'Equipo de plataforma', a: 'Suspendió la empresa «Taller Mecánico Pacífico»' }], cols: [{ t: 'Cuándo', k: (x) => x.f }, { t: 'Quién', k: (x) => x.q }, { t: 'Acción', k: (x) => x.a }] });
  }
  const tit = { empresas: 'Empresas', soporte: 'Soporte autorizado', correo: 'Estado del correo', registro: 'Registro de la plataforma' }[t];
  return `<div class="cabecera-pantalla"><h1 id="titulo-pantalla" tabindex="-1">${tit}</h1><span class="id-pantalla">PR-24 · prioridad A · consola de plataforma</span></div>${c}`;
}
ruta('plataforma', { id: 'PR-24', titulo: 'Consola de plataforma', acceso: 'plataforma.empresas_gestionar', render(q) { return plataformaPantalla(q.tab); } });
ACC['pl-crear'] = () => abrirDialogo({ titulo: 'Crear empresa', ancho: true, cuerpo: '<div class="fila-form"><div class="campo"><label for="pc-n">Nombre <span class="obligatorio">(obligatorio)</span></label><input id="pc-n" type="text"></div><div class="campo"><label for="pc-p">País</label><select id="pc-p"><option>Perú</option></select></div><div class="campo"><label for="pc-z">Zona horaria</label><select id="pc-z"><option>América/Lima</option></select></div><div class="campo"><label for="pc-m">Moneda base</label><select id="pc-m"><option>PEN</option><option>USD</option></select><div class="ayuda">No se puede cambiar después con órdenes abiertas.</div></div></div><div class="campo"><label for="pc-a">Correo del primer administrador <span class="obligatorio">(obligatorio)</span></label><input id="pc-a" type="email"><div class="ayuda">Se le envía una invitación. Se recomienda tener dos administradores.</div></div><div class="campo"><label for="pc-c">Contacto autorizado de la empresa</label><input id="pc-c" type="email"></div>', botones: [{ texto: 'Volver' }, { texto: 'Crear empresa', clase: 'primario', alPulsar: () => toast('Empresa creada (simulado).') }] });
ACC['pl-susp'] = (el) => dialogoMotivo({ titulo: 'Suspender ' + esc(el.dataset.n), verbo: 'Suspender', destructivo: true, consecuencias: ['Ninguno de sus usuarios podrá entrar.', 'Sus datos se conservan; no se borra nada.', 'Se puede reactivar.'], alConfirmar: () => toast('Empresa suspendida (simulado).') });
ACC['pl-react'] = () => toast('Empresa reactivada (simulado).');
ACC['pl-rescate'] = (el) => dialogoMotivo({ titulo: 'Rescatar ' + esc(el.dataset.n), verbo: 'Iniciar rescate', destructivo: true, etiqueta: 'Cómo se verificó la identidad', consecuencias: ['Lo hacen dos personas de plataforma.', 'Hay una espera de 24 horas, salvo emergencia declarada por ambas.', 'Se avisa por correo a todos los usuarios activos.', 'Queda la evidencia en el registro de la plataforma.'], alConfirmar: () => toast('Rescate iniciado (simulado).') });
ACC['pl-soporte'] = () => { APP.tmp.soporte = true; render(true); };
ACC['pl-soporte-salir'] = () => { APP.tmp.soporte = false; render(true); };

/* ---------- PR-34 Configuración y módulos ---------- */
const MODULOS = [['casos', 'Mesa de ayuda', 'Fase 2'], ['vencimientos', 'Vencimientos, contratos y garantías', 'Fase 2'], ['licencias', 'Licencias de software', 'Fase 2'], ['avisos', 'Notificaciones dentro de la plataforma', 'Fase 2'], ['presupuesto', 'Presupuesto y costos', 'Fase 3'], ['cambios', 'Gestión de cambios', 'Fase 3'], ['mapa', 'Mapa de servicios (CMDB)', 'Fase 3'], ['asistente', 'Asistente de IA (chat para armar casos)', 'Fase 3']];
ruta('configuracion', { id: 'PR-34', prio: 'B', titulo: 'Configuración de la empresa', acceso: 'empresa.ver_configuracion', render(q) {
  const tab = q.tab || 'empresa';
  const edit = puede('empresa.configurar');
  const ex = !!APP.tmp.excepcion;
  return `${cabeceraPantalla('Configuración de la empresa', '<span class="id-pantalla">PR-34 · prioridad B</span>')}
  ${edit ? '' : aviso('info', 'Solo consulta', 'Cambiar la configuración es un permiso del Administrador.')}
  ${pestanas('cfg', [{ k: 'empresa', t: 'Datos y aprobación' }, { k: 'modulos', t: 'Módulos activos' }, { k: 'excep', t: 'Excepciones' }], tab)}
  ${panel('cfg', 'empresa', tab, `<section class="tarjeta" style="max-width:640px"><dl class="lista-datos"><dt>Empresa</dt><dd>${esc(E().nombre)}</dd><dt>País</dt><dd>${E().pais}</dd><dt>Zona horaria</dt><dd>${E().zona}</dd><dt>Moneda base</dt><dd>${E().moneda} <span class="suave chica">(no se cambia con órdenes abiertas)</span></dd></dl>
    <div class="campo" style="margin-top:16px"><label for="cfg-lim">Monto límite de aprobación (${E().moneda}) <span class="obligatorio">(las órdenes que lo superan necesitan aprobación)</span></label><input id="cfg-lim" type="number" min="0" value="${E().limite}" ${edit ? '' : 'disabled'}><div class="ayuda">Con límite 0, toda orden pasa por aprobación. Una orden en otra moneda siempre pasa por aprobación.</div></div>${edit ? '<button class="btn primario" type="button" data-acc="cfg-guardar">Guardar</button>' : ''}</section>`)}
  ${panel('cfg', 'modulos', tab, `<p>Desactivar un módulo lo oculta del menú y de los permisos, pero <strong>no borra sus datos</strong>. Pruébelo: el menú de la izquierda cambia al instante.</p>${aviso('sensible', 'Permiso sensible', 'Activar o desactivar módulos exige segunda verificación reciente y queda en la auditoría.')}
    <div class="pila">${MODULOS.map((m) => `<div class="tarjeta fila entre"><div><strong>${m[1]}</strong> <span class="chip etq">${m[2]}</span><div class="suave chica">${m[0] === 'casos' ? 'Casos, plazos y base de conocimiento' : m[0] === 'asistente' ? 'Botón flotante «Asistente de IA» para Empleado y Técnico (simulación con guion fijo)' : 'Muestra en este prototipo'}</div></div><label class="interruptor"><input type="checkbox" role="switch" ${APP.modulos[m[0]] ? 'checked' : ''} ${puede('empresa.configurar_modulos') ? '' : 'disabled'} data-cambio="modulo" data-m="${m[0]}" aria-label="${m[1]}"><span class="pista"></span><span>${APP.modulos[m[0]] ? 'Activo' : 'Apagado'}</span></label></div>`).join('')}</div>`)}
  ${panel('cfg', 'excep', tab, `<section class="tarjeta" style="max-width:720px"><h2>Excepciones de separación de funciones</h2><p>Por defecto <strong>nadie aprueba lo que creó</strong> ni recibe lo que aprobó, ni siquiera el Administrador. Una empresa con una sola persona de TI puede activar una excepción, que queda siempre visible y auditada.</p>
    <div class="fila entre"><div><strong>Interruptor único de excepciones</strong><br><span class="suave chica">${ex ? chip('Excepción activa', 'sensible') + ' Vence en 90 días' : 'Desactivado'}</span></div>${puede('empresa.excepciones_funciones') ? `<label class="interruptor"><input type="checkbox" role="switch" ${ex ? 'checked' : ''} data-cambio="excepcion" aria-label="Interruptor único de excepciones"><span class="pista"></span><span>${ex ? 'Activa' : 'Apagada'}</span></label>` : '<span class="suave chica">Solo el Administrador puede cambiarlo.</span>'}</div>
    <p class="suave chica" style="margin-top:12px">Ocho casillas: compras, recepción, presupuestos, contratos, licencias, mesa de ayuda, cambios y problemas. Cada una vence a los 90 días. <strong>La autoentrega de equipos no tiene excepción.</strong> Con dos o más administradores, un segundo administrador debe confirmar el cambio.</p>${ex ? '<p>Pruebe con el rol Administrador en la orden <a href="#/oc?id=OC-000218">OC-000218</a>: ahora sí puede aprobar su propia orden, con el aviso visible.</p>' : ''}</section>`)}`;
} });
ACC['cfg-guardar'] = () => toast('Configuración guardada. Queda en la auditoría con el valor anterior y el nuevo.');
CAMBIO.modulo = (el) => { APP.modulos[el.dataset.m] = el.checked; guardar(); render(true); toast('Módulo ' + (el.checked ? 'activado' : 'desactivado') + '. No se borró ningún dato.'); };
CAMBIO.excepcion = (el) => {
  const nuevo = el.checked; el.checked = !nuevo;
  dialogoMotivo({ titulo: nuevo ? 'Activar la excepción de separación de funciones' : 'Desactivar la excepción', verbo: nuevo ? 'Activar la excepción' : 'Desactivar', destructivo: nuevo, consecuencias: nuevo ? ['Cada orden que use la excepción mostrará un aviso visible.', 'Cada uso queda en la auditoría (quién, cuándo, monto y orden).', 'Vence a los 90 días y hay un resumen mensual de usos.', 'Se pide su segunda verificación reciente.'] : ['Vuelve la regla: nadie aprueba lo que creó.'], alConfirmar: () => { APP.tmp.excepcion = nuevo; toast('Excepción ' + (nuevo ? 'activada' : 'desactivada') + '.'); render(true); } });
};

/* ---------- Autorizar soporte (lado de la empresa) ---------- */
ruta('soporte', { id: '', titulo: 'Autorizar soporte', acceso: 'empresa.configurar_modulos', render() {
  return `${cabeceraPantalla('Autorizar soporte de la plataforma')}
  <p>Si el equipo de la plataforma necesita ver sus datos para ayudarle, usted debe autorizarlo. La autorización es <strong>solo de lectura</strong>, para una empresa y un motivo, y dura <strong>24 horas como máximo</strong>. Todo lo que vean queda en su auditoría.</p>
  <form class="tarjeta" style="max-width:600px" data-form="soporte"><div class="campo"><label for="so-m">Motivo <span class="obligatorio">(obligatorio, hasta 500 caracteres)</span></label><textarea id="so-m" maxlength="500" style="min-height:80px;font-family:inherit"></textarea><div class="error" id="so-e" hidden>${icono('alerta')}<span>Escriba el motivo.</span></div></div><div class="campo"><label for="so-h">Duración</label><select id="so-h"><option>4 horas</option><option>12 horas</option><option selected>24 horas (máximo)</option></select></div><button class="btn primario" type="submit">Autorizar</button></form>
  <h2 style="margin-top:24px">Autorizaciones</h2>${tabla({ filas: [{ m: 'Ayudar con la importación inicial', v: '26/10/2026 14:00', est: 'Vigente' }, { m: 'Consulta sobre roles', v: '20/10/2026 10:00', est: 'Terminado' }], cols: [{ t: 'Motivo', k: (x) => x.m }, { t: 'Vence', k: (x) => x.v }, { t: 'Estado', k: (x) => chip(x.est) }, { t: 'Acción', sin: true, k: (x) => x.est === 'Vigente' ? '<button class="btn chico peligro" type="button" data-acc="so-revocar">Revocar ahora</button>' : '' }] })}`;
} });
ACC['form-soporte'] = () => { if (!document.getElementById('so-m').value.trim()) { document.getElementById('so-e').hidden = false; return; } toast('Soporte autorizado por el tiempo elegido (simulado).'); };
ACC['so-revocar'] = () => dialogoMotivo({ titulo: 'Revocar la autorización', verbo: 'Revocar', destructivo: true, alConfirmar: () => toast('Autorización revocada.') });

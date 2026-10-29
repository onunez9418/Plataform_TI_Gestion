/* =========================================================================
   NÚCLEO DEL PROTOTIPO: rol, empresa, permisos, pantalla general, rutas
   y componentes que reutilizan todas las pantallas.
   Sin servidor, sin lógica real: todo es simulado en el navegador.
   ========================================================================= */
'use strict';

const LOC = (navigator.language || '').toLowerCase().startsWith('es') ? navigator.language : 'es-PE';
const APP = {
  rol: 'adm',
  empresa: 'e1',
  tema: 'claro',
  datos: JSON.parse(JSON.stringify(DATOS_BASE)),
  modulos: { casos: true, vencimientos: true, licencias: true, presupuesto: true, mapa: true, cambios: true, avisos: true, asistente: true },
  tmp: {}
};
const RUTAS = {};
const ACC = {};      // acciones de botones: data-acc="nombre"
const CAMBIO = {};   // acciones de campos: data-cambio="nombre"
const ENTRADA = {};  // acciones mientras se escribe: data-entrada="nombre"
let _uid = 0;
const uid = (p) => (p || 'u') + (++_uid);

/* ---------- Utilidades ---------- */
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const D = () => APP.datos[APP.empresa];
const E = () => EMPRESAS[APP.empresa];
const R = () => ROLES[APP.rol];
const fmtNum = (n, dec) => Number(n).toLocaleString(LOC, { minimumFractionDigits: dec == null ? 2 : dec, maximumFractionDigits: dec == null ? 2 : dec });
const dinero = (n, mon) => `${mon || E().moneda} ${fmtNum(n, 2)}`;
const parseF = (s) => { const [d, m, a] = s.split('/').map(Number); return new Date(a, m - 1, d); };
const fechaDe = (dt) => `${String(dt.getDate()).padStart(2, '0')}/${String(dt.getMonth() + 1).padStart(2, '0')}/${dt.getFullYear()}`;
const diasHasta = (dt) => Math.round((dt - HOY) / 86400000);
const isoF = (iso) => { const [a, m, d] = iso.split('-'); return `${d}/${m}/${a}`; };

/* ---------- Permisos (salen del registro único de permisos) ---------- */
const PERM = {};
PERMISOS.forEach((p) => { PERM[p.n] = p; });
function valor(nombre) {
  const p = PERM[nombre];
  if (!p) { console.warn('Permiso desconocido en el prototipo:', nombre); return '-'; }
  return p.v[APP.rol] || '-';
}
const puede = (nombre) => valor(nombre) !== '-';
const puedeAlguno = (lista) => lista.some(puede);
function accesoOk(a) {
  if (a === undefined || a === null) return true;
  if (typeof a === 'function') return !!a();
  if (Array.isArray(a)) return puedeAlguno(a);
  return puede(a);
}

/* ---------- Iconos (trazo simple, siempre con texto al lado o etiqueta) ---------- */
const ICONOS = {
  inicio: '<path d="M3 11l9-8 9 8"/><path d="M5 10v10h14V10"/>',
  caja: '<path d="M21 8l-9-5-9 5v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  compra: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11L21 7H6"/>',
  servicio: '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',
  calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  personas: '<circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6"/><path d="M17 4.5a3.5 3.5 0 0 1 0 7M22 21c0-3-1.5-5-4-5.7"/>',
  ajustes: '<path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/>',
  buscar: '<circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/>',
  campana: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 21h4"/>',
  mas: '<path d="M12 5v14M5 12h14"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  check: '<path d="M5 12l5 5 9-10"/>',
  alerta: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18h.01"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5h.01"/>',
  candado: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  cerrar: '<path d="M6 6l12 12M18 6L6 18"/>',
  flecha: '<path d="M9 6l6 6-6 6"/>',
  reloj: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  circulo: '<circle cx="12" cy="12" r="8"/>',
  siguiente: '<path d="M5 12h14M13 6l6 6-6 6"/>',
  prohibido: '<circle cx="12" cy="12" r="9"/><path d="M5.6 5.6l12.8 12.8"/>',
  descargar: '<path d="M12 4v11M7 11l5 5 5-5M4 20h16"/>',
  subir: '<path d="M12 16V5M7 9l5-5 5 5M4 20h16"/>',
  imprimir: '<path d="M7 9V3h10v6M7 17H4v-6h16v6h-3"/><rect x="7" y="14" width="10" height="7"/>',
  ojo: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  sol: '<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',
  luna: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/>',
  doc: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  ayuda: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
  mapa: '<circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8.3 11l7.4-3.8M8.3 13l7.4 3.8"/>',
  dinero: '<path d="M12 3v18M16.5 7.5C15.5 6.4 14 6 12 6c-2.5 0-4 1-4 2.8 0 4 8.5 2 8.5 6.2 0 1.8-1.7 3-4.5 3-2 0-3.8-.6-4.8-1.8"/>',
  escudo: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/>',
  tabla: '<rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4h6v3H9zM9 12h6M9 16h4"/>',
  edificio: '<rect x="5" y="3" width="14" height="18" rx="1"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2"/>',
  marca: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="8" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/><path d="M17 13v8M13 17h8"/>'
};
const icono = (n) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${ICONOS[n] || ''}</svg>`;

/* ---------- Etiquetas de estado ---------- */
const ICONO_FAMILIA = { neutro: 'circulo', curso: 'siguiente', atencion: 'info', exito: 'check', alerta: 'alerta', final: 'prohibido', sensible: 'candado' };
function familiaDe(est) { for (const f in FAMILIA) if (FAMILIA[f].includes(est)) return f; console.warn('Estado sin familia:', est); return 'neutro'; }
function chip(est, fam) { fam = fam || familiaDe(est); return `<span class="chip s-${fam}">${icono(ICONO_FAMILIA[fam])}${esc(est)}</span>`; }
function chipCalc(txt, fam) { return `<span class="chip calc s-${fam}" title="Etiqueta calculada: se actualiza sola, no se cambia a mano">${icono('reloj')}${esc(txt)}</span>`; }
function chipGarantia(fin) {
  if (!fin) return '<span class="suave">Sin garantía registrada</span>';
  const d = diasHasta(parseF(fin));
  if (d < 0) return chipCalc('Garantía vencida el ' + fin, 'alerta');
  if (d <= 30) return chipCalc('Por vencer en ' + d + ' días', 'atencion');
  return chipCalc('En garantía hasta ' + fin, 'exito');
}
const chipEtq = (t) => `<span class="chip etq">${esc(t)}</span>`;

/* ---------- Datos personales ---------- */
function personaDe(ref) { return D().personas.find((p) => p.ref === ref); }
function oculto(ref) {
  return `<span class="oculto" title="Datos personales ocultos: su rol no tiene el permiso «Ver datos personales»">${icono('candado')}<span class="cod">${esc(ref)}</span></span>`;
}
function nombrePersona(ref) {
  if (!ref) return '<span class="suave">—</span>';
  const p = personaDe(ref);
  if (!p) return esc(ref);
  const propio = APP.rol !== 'plat' && R().ref === ref;
  return puede('datos_personales.ver') || propio ? esc(p.nombre) + ` <span class="suave cod">${esc(ref)}</span>` : oculto(ref);
}

/* ---------- Componentes ---------- */
function btnAcc(o) {
  if (o.perm && !accesoOk(o.perm)) return '';                       // bloqueo 1: el botón no aparece
  const ic = o.icono ? icono(o.icono) : '';
  if (o.bloqueo) {                                                   // bloqueo 2: desactivado con la razón escrita
    const id = uid('razon');
    return `<span class="btn-con-razon"><button type="button" class="btn ${o.clase || ''}" aria-disabled="true" aria-describedby="${id}">${ic}${o.texto}</button><span class="razon" id="${id}">${icono('info')}<span>${esc(o.bloqueo)}</span></span></span>`;
  }
  const dat = Object.entries(o.datos || {}).map(([k, v]) => `data-${k}="${esc(v)}"`).join(' ');
  if (o.href) return `<a class="btn ${o.clase || ''}" href="${o.href}">${ic}${o.texto}</a>`;
  return `<button type="button" class="btn ${o.clase || ''}" data-acc="${o.acc}" ${dat}>${ic}${o.texto}</button>`;
}
function btnExportar() {
  return btnAcc({
    texto: 'Exportar a Excel', icono: 'descargar', acc: 'exportar',
    bloqueo: puede('datos.exportar') ? '' : `Exportar requiere un permiso aparte («Exportar datos»), que hoy solo tiene el Administrador. Pídalo a un administrador de ${E().corto}.`
  });
}
function tabla(o) {
  const cols = o.cols;
  const filas = o.filas;
  if (!filas.length) return vacio(o.vacio || { titulo: 'No hay resultados', texto: 'Cambie los filtros o limpie la búsqueda.' });
  const cab = cols.map((c) => `<th scope="col" class="${c.cls || ''}">${c.t}</th>`).join('');
  const cuerpo = filas.map((f) => {
    const cls = o.claseFila ? o.claseFila(f) : '';
    return `<tr class="${cls}">` + cols.map((c) => `<td class="${c.cls || ''} ${c.sin ? 'sin-titulo' : ''}" data-label="${esc(c.etq || c.t.replace(/<[^>]+>/g, ''))}">${c.k(f)}</td>`).join('') + '</tr>';
  }).join('');
  return `<div class="envoltura-tabla"><table class="tabla ${o.adaptable === false ? '' : 'adaptable'}" ${o.id ? `id="${o.id}"` : ''}>${o.caption ? `<caption>${o.caption}</caption>` : ''}<thead><tr>${cab}</tr></thead><tbody>${cuerpo}</tbody></table></div>`;
}
function vacio(o) {
  return `<div class="vacio" role="status">${icono(o.icono || 'buscar')}<h3>${esc(o.titulo)}</h3><p class="suave">${o.texto || ''}</p>${o.boton || ''}</div>`;
}
function aviso(tipo, titulo, texto, extra) {
  const ic = { info: 'info', atencion: 'info', exito: 'check', alerta: 'alerta', sensible: 'candado' }[tipo];
  return `<div class="aviso ${tipo}" role="${tipo === 'alerta' ? 'alert' : 'status'}">${icono(ic)}<div class="cuerpo-aviso">${titulo ? `<strong>${titulo}</strong>` : ''}${texto || ''}${extra || ''}</div></div>`;
}
function pestanas(id, lista, activa) {
  return `<div class="pestanas" role="tablist" aria-label="Secciones" id="${id}">` + lista.map((t) =>
    `<button type="button" role="tab" id="tab-${id}-${t.k}" aria-selected="${t.k === activa}" tabindex="${t.k === activa ? 0 : -1}" data-acc="pestana" data-grupo="${id}" data-k="${t.k}">${t.t}${t.n != null ? `<span class="contador">${t.n}</span>` : ''}</button>`).join('') + '</div>';
}
function cabeceraPantalla(titulo, acciones, migas) {
  return `${migas ? `<nav class="migas" aria-label="Ruta">${migas}</nav>` : ''}<div class="cabecera-pantalla"><h1 id="titulo-pantalla" tabindex="-1">${titulo}</h1><div class="acciones">${acciones || ''}</div></div>`;
}
const tarjeta = (titulo, cuerpo, o) => `<section class="tarjeta ${(o && o.cls) || ''}" ${o && o.id ? `id="${o.id}"` : ''} aria-label="${esc(titulo.replace(/<[^>]+>/g, ''))}"><h2>${titulo}</h2>${cuerpo}</section>`;

/* ---------- Diálogos y avisos emergentes ---------- */
let _dlg = null;
function cerrarDialogo() {
  if (!_dlg) return;
  _dlg.el.remove();
  document.removeEventListener('keydown', _dlg.tecla, true);
  if (_dlg.foco && document.contains(_dlg.foco)) _dlg.foco.focus();
  _dlg = null;
}
function abrirDialogo(o) {
  cerrarDialogo();
  const el = document.createElement('div');
  el.className = 'velo';
  const idT = uid('dlg-t');
  el.innerHTML = `<div class="dialogo ${o.ancho ? 'ancho' : ''}" role="dialog" aria-modal="true" aria-labelledby="${idT}"><header><h2 id="${idT}">${o.titulo}</h2></header><div class="cuerpo-dialogo">${o.cuerpo}</div><footer>${(o.botones || []).map((b, i) => `<button type="button" class="btn ${b.clase || ''}" data-dlg="${i}">${b.texto}</button>`).join('')}</footer></div>`;
  document.body.appendChild(el);
  const foco = document.activeElement;
  const sel = 'button:not([disabled]),[href],input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
  const tecla = (e) => {
    if (e.key === 'Escape') { e.stopPropagation(); cerrarDialogo(); return; }
    if (e.key !== 'Tab') return;
    const f = [...el.querySelectorAll(sel)].filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && (i <= 0)) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  };
  document.addEventListener('keydown', tecla, true);
  _dlg = { el, tecla, foco };
  el.addEventListener('click', (e) => {
    if (e.target === el) { cerrarDialogo(); return; }
    const b = e.target.closest('[data-dlg]');
    if (!b) return;
    const def = o.botones[Number(b.dataset.dlg)];
    if (def.alPulsar) { const r = def.alPulsar(el); if (r === false) return; }
    cerrarDialogo();
  });
  const primero = el.querySelector('input,textarea,select') || el.querySelector('[data-dlg]');
  if (primero) primero.focus();
  if (o.alAbrir) o.alAbrir(el);
  return el;
}
/* Diálogo de motivo único: mismo aspecto para toda acción con motivo obligatorio */
function dialogoMotivo(o) {
  const idM = uid('motivo');
  const motivos = o.motivos && o.motivos.length ? `<div class="campo"><label for="${idM}-l">Motivo</label><select id="${idM}-l"><option value="">Elija un motivo…</option>${o.motivos.map((m) => `<option>${esc(m)}</option>`).join('')}<option>Otro</option></select></div>` : '';
  const cons = o.consecuencias && o.consecuencias.length ? `<div class="consecuencias"><strong>Qué pasará</strong><ul>${o.consecuencias.map((c) => `<li>${c}</li>`).join('')}</ul></div>` : '';
  const extra = o.extra || '';
  return abrirDialogo({
    titulo: o.titulo,
    cuerpo: `${o.texto ? `<p>${o.texto}</p>` : ''}${cons}${extra}${motivos}<div class="campo"><label for="${idM}">${o.etiqueta || 'Explique el motivo'} <span class="obligatorio">(obligatorio, hasta 500 caracteres)</span></label><textarea id="${idM}" maxlength="500" style="min-height:90px;font-family:inherit"></textarea><div class="ayuda"><span id="${idM}-n">0</span> de 500 caracteres</div><div class="error" id="${idM}-e" hidden>${icono('alerta')}<span>Escriba el motivo para continuar.</span></div></div>`,
    botones: [
      { texto: 'Volver', clase: '' },
      { texto: o.verbo, clase: o.destructivo ? 'peligro' : 'primario', alPulsar: (el) => {
        const t = el.querySelector('#' + idM);
        const sel = el.querySelector('#' + idM + '-l');
        const ok = t.value.trim().length > 0 && (!sel || sel.value);
        el.querySelector('#' + idM + '-e').hidden = ok;
        t.setAttribute('aria-invalid', String(!ok));
        if (!ok) { (sel && !sel.value ? sel : t).focus(); if (sel && !sel.value) el.querySelector('#' + idM + '-e span').textContent = 'Elija un motivo y escriba una explicación breve.'; return false; }
        if (o.alConfirmar) o.alConfirmar(t.value.trim(), sel ? sel.value : '');
      } }
    ],
    alAbrir: (el) => { const t = el.querySelector('#' + idM); t.addEventListener('input', () => { el.querySelector('#' + idM + '-n').textContent = t.value.length; }); }
  });
}
function toast(msg, tipo) {
  let c = document.getElementById('toasts');
  if (!c) { c = document.createElement('div'); c.id = 'toasts'; c.className = 'toasts'; c.setAttribute('role', 'status'); c.setAttribute('aria-live', 'polite'); document.body.appendChild(c); }
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `${icono(tipo === 'alerta' ? 'alerta' : 'check')}<span>${msg}</span>`;
  c.appendChild(t);
  setTimeout(() => t.remove(), 7000);
}

/* ---------- Estado guardado entre visitas ---------- */
function guardar() { try { localStorage.setItem('pti_prototipo', JSON.stringify({ rol: APP.rol, empresa: APP.empresa, tema: APP.tema, modulos: APP.modulos })); } catch (e) { /* sin almacenamiento */ } }
function leer() {
  try { const s = JSON.parse(localStorage.getItem('pti_prototipo') || '{}'); if (s.rol in ROLES) APP.rol = s.rol; if (s.empresa in EMPRESAS) APP.empresa = s.empresa; if (s.tema) APP.tema = s.tema; if (s.modulos) Object.assign(APP.modulos, s.modulos); } catch (e) { /* ignorar */ }
  const q = new URLSearchParams(location.search);
  if (q.get('rol') in ROLES) APP.rol = q.get('rol');
  if (q.get('empresa') in EMPRESAS) APP.empresa = q.get('empresa');
  if (q.get('tema')) APP.tema = q.get('tema');
  if (!localStorage.getItem('pti_prototipo') && !q.get('tema') && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) APP.tema = 'oscuro';
}
function aplicarTema() { document.documentElement.setAttribute('data-tema', APP.tema); }

/* ---------- Menú por perfil ---------- */
function contarPorAprobar() {
  let n = 0;
  if (puede('ordenes_compra.aprobar')) n += D().ordenes.filter((o) => o.est === 'Pendiente de aprobación').length;
  return n;
}
function menuActual() {
  const m = APP.modulos;
  const M = [
    { g: null, items: [
      { r: 'inicio', t: 'Inicio', i: 'inicio' },
      { r: 'por-aprobar', t: 'Por aprobar', i: 'check', ok: () => puedeAlguno(['ordenes_compra.aprobar', 'ordenes_servicio.aprobar']), cuenta: contarPorAprobar },
      { r: 'mi-trabajo', t: 'Mi trabajo', i: 'servicio', ok: () => APP.rol === 'tec' } ] },
    { g: 'Inventario', items: [
      { r: 'activos', t: 'Activos', i: 'caja', ok: 'activos.ver' },
      { r: 'stock', t: 'Stock por cantidad', i: 'caja', ok: 'activos.ver' },
      { r: 'skus', t: 'Artículos (SKU)', i: 'doc', ok: 'skus.ver' },
      { r: 'entregas', t: 'Entregas y devoluciones', i: 'tabla', ok: 'entregas.ver' },
      { r: 'importar', t: 'Importar datos', i: 'subir', ok: 'datos.importar' } ] },
    { g: 'Compras', items: [
      { r: 'ordenes-compra', t: 'Órdenes de compra', i: 'compra', ok: 'ordenes_compra.ver' },
      { r: 'recepciones', t: 'Recepciones', i: 'caja', ok: ['recepciones.crear_confirmar', 'recepciones.revertir'] },
      { r: 'proveedores', t: 'Proveedores', i: 'edificio', ok: 'proveedores.ver' },
      { r: 'presupuesto', t: 'Presupuesto', i: 'dinero', ok: 'presupuesto.ver', mod: 'presupuesto', fase: 'Fase 3' } ] },
    { g: 'Servicios', items: [
      { r: 'ordenes-servicio', t: 'Órdenes de servicio', i: 'servicio', ok: 'ordenes_servicio.ver' },
      { r: 'casos', t: 'Mesa de ayuda', i: 'ayuda', ok: 'ayuda.caso_ver', mod: 'casos', fase: 'Fase 2' },
      { r: 'cambios', t: 'Cambios', i: 'ajustes', ok: 'cambios.ver', mod: 'cambios', fase: 'Fase 3' },
      { r: 'mapa-servicios', t: 'Mapa de servicios', i: 'mapa', ok: 'cmdb.ver', mod: 'mapa', fase: 'Fase 3' } ] },
    { g: 'Vencimientos y contratos', items: [
      { r: 'vencimientos', t: 'Vencimientos', i: 'calendario', ok: 'reportes.ver_vencimientos', mod: 'vencimientos', fase: 'Fase 2' },
      { r: 'licencias', t: 'Licencias de software', i: 'candado', ok: 'licencias.ver', mod: 'licencias', fase: 'Fase 2' } ] },
    { g: 'Personas y lugares', items: [
      { r: 'personas', t: 'Personas', i: 'personas', ok: () => valor('personas.ver') === 'T' },
      { r: 'catalogos', t: 'Catálogos y ubicaciones', i: 'edificio', ok: 'catalogos.ver' },
      { r: 'categorias', t: 'Categorías y campos', i: 'ajustes', ok: 'catalogos.ver' } ] },
    { g: 'Administración', items: [
      { r: 'primeros-pasos', t: 'Primeros pasos', i: 'check', ok: 'empresa.configurar' },
      { r: 'usuarios', t: 'Usuarios', i: 'usuario', ok: 'usuarios.ver' },
      { r: 'roles', t: 'Roles y permisos', i: 'escudo', ok: 'roles.ver' },
      { r: 'auditoria', t: 'Auditoría', i: 'doc', ok: 'auditoria.ver' },
      { r: 'configuracion', t: 'Configuración y módulos', i: 'ajustes', ok: 'empresa.ver_configuracion' },
      { r: 'soporte', t: 'Autorizar soporte', i: 'escudo', ok: 'empresa.configurar_modulos' } ] },
    { g: 'Mi espacio', items: [
      { r: 'mi-espacio', t: 'Mi espacio', i: 'usuario' },
      { r: 'avisos', t: 'Mis avisos', i: 'campana', mod: 'avisos', fase: 'Fase 2' },
      { r: 'mi-cuenta', t: 'Mi cuenta y seguridad', i: 'escudo' },
      { r: 'mis-permisos', t: 'Mis permisos', i: 'candado' } ] }
  ];
  return M.map((g) => ({ g: g.g, items: g.items.filter((it) => (!it.mod || m[it.mod]) && (it.ok === undefined || accesoOk(it.ok))) })).filter((g) => g.items.length);
}
function menuHTML(actual) {
  return menuActual().map((g, i) => `${g.g ? `<h2 id="mg${i}">${g.g}</h2>` : ''}<ul ${g.g ? `aria-labelledby="mg${i}"` : ''}>${g.items.map((it) => {
    const c = it.cuenta ? it.cuenta() : 0;
    return `<li><a href="#/${it.r}" ${it.r === actual ? 'aria-current="page"' : ''}>${icono(it.i)}<span>${it.t}</span>${c ? `<span class="cuenta" aria-label="${c} pendientes">${c}</span>` : ''}${it.fase ? `<span class="etq-fase" title="Muestra de un módulo futuro">${it.fase}</span>` : ''}</a></li>`;
  }).join('')}</ul>`).join('');
}
function menuNuevo() {
  const L = [
    ['entregas.crear', 'Entregar equipo', '#/entregar'],
    ['ordenes_compra.crear_editar', valor('ordenes_compra.crear_editar') === 'P' ? 'Nueva solicitud de compra' : 'Nueva orden de compra', '#/oc-nueva'],
    ['recepciones.crear_confirmar', 'Recibir mercadería', '#/recepciones'],
    ['skus.crear_editar', 'Nuevo artículo (SKU)', '#/sku-nuevo'],
    ['personas.crear_editar', 'Nueva Persona', '#/personas'],
    ['datos.importar', 'Importar datos', '#/importar'],
    ['usuarios.invitar', 'Invitar usuario', '#/usuarios']
  ];
  return L.filter((x) => puede(x[0])).map((x) => ({ t: x[1], h: x[2] }));
}

/* ---------- Pantalla general (barra superior, menú, barra inferior) ---------- */
function puedePedirAyuda() { return puedeAlguno(['ordenes_servicio.crear', 'ayuda.caso_crear']); }
function demoBar() {
  return `<div class="demo-bar" role="region" aria-label="Controles del prototipo">
    <label><span class="txt">Probar como:</span> <select id="sel-rol" aria-label="Rol que se está probando">${ORDEN_ROLES.map((k) => `<option value="${k}" ${k === APP.rol ? 'selected' : ''}>${ROLES[k].nombre}</option>`).join('')}</select></label>
    <label><span class="txt">Empresa:</span> <select id="sel-empresa" ${APP.rol === 'plat' ? 'disabled title="La consola de plataforma no pertenece a ninguna empresa"' : ''} aria-label="Empresa activa">${Object.values(EMPRESAS).map((e) => `<option value="${e.id}" ${e.id === APP.empresa ? 'selected' : ''}>${e.nombre}</option>`).join('')}</select></label>
    <button type="button" class="btn chico" data-acc="tema" aria-pressed="${APP.tema === 'oscuro'}">${icono(APP.tema === 'oscuro' ? 'sol' : 'luna')}<span class="txt">${APP.tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}</span></button>
    <a class="btn chico" href="#/pantallas" aria-label="Lista de pantallas">${icono('tabla')}<span class="txt">Lista de pantallas</span></a>
    <a class="btn chico" href="#/guia" aria-label="Guía visual">${icono('doc')}<span class="txt">Guía visual</span></a>
    <span class="demo-aviso">Prototipo de la Etapa 0 · datos de ejemplo inventados · no guarda nada</span>
  </div>`;
}
function empresaChip() {
  return `<div class="empresa-activa" role="group" aria-label="Empresa activa"><span class="punto" aria-hidden="true"></span><span class="nombre">${esc(E().nombre)}</span></div>`;
}
function barraApp(layout) {
  const nuevos = layout === 'app' ? menuNuevo() : [];
  const nAv = APP.modulos.avisos ? 3 : 0;
  return `<header class="barra ${layout === 'plat' ? 'plataforma' : ''}" role="banner">
    ${layout === 'app' ? `<button type="button" class="btn-barra btn-menu-movil" data-acc="menu-movil" aria-label="Abrir el menú" aria-expanded="false">${icono('menu')}</button>` : ''}
    <a class="marca" href="#/inicio" aria-label="Plataforma de TI, ir al inicio">${icono('marca')}<span class="texto-marca">${layout === 'plat' ? 'Consola de plataforma' : 'Plataforma de TI'}</span></a>
    ${layout === 'plat' ? '' : empresaChip()}
    ${layout === 'app' ? `<form class="barra-buscar" role="search" data-form="buscar">${icono('buscar')}<input type="search" id="q-global" placeholder="Buscar SKU, serie, orden…" aria-label="Buscar en toda la plataforma" autocomplete="off"></form>` : ''}
    <div class="barra-fin">
      ${layout === 'app' && puedePedirAyuda() ? `<a class="btn-barra relleno" href="#/pedir-ayuda">${icono('ayuda')}<span class="etq">Pedir ayuda</span></a>` : ''}
      ${nuevos.length ? `<div class="desplegable"><button type="button" class="btn-barra" data-acc="desp" data-desp="nuevo" aria-haspopup="true" aria-expanded="false">${icono('mas')}<span class="etq">Nuevo</span></button><div class="lista-desp" id="desp-nuevo" hidden><div class="titulo">Acciones rápidas</div>${nuevos.map((n) => `<a href="${n.h}">${n.t}</a>`).join('')}</div></div>` : ''}
      ${layout === 'app' && APP.modulos.avisos ? `<a class="btn-barra campana" href="#/avisos" aria-label="Avisos: ${nAv} sin leer">${icono('campana')}<span>${nAv}</span></a>` : ''}
      <div class="desplegable"><button type="button" class="btn-barra" data-acc="desp" data-desp="usuario" aria-haspopup="true" aria-expanded="false">${icono('usuario')}<span class="etq">${esc(R().persona)}</span></button>
        <div class="lista-desp" id="desp-usuario" hidden><div class="titulo">${esc(R().nombre)}${APP.rol !== 'plat' ? ' · ' + esc(E().corto) : ''}</div>
          ${layout === 'plat' ? '' : `<a href="#/${APP.rol === 'emp' ? 'portal?tab=datos' : 'mi-espacio'}">Mi espacio</a><a href="#/mi-cuenta">Mi cuenta y seguridad</a><a href="#/mis-permisos">Mis permisos</a><a href="#/empresa">Cambiar de empresa</a><hr>`}
          <a href="#/ingreso">Cerrar sesión</a></div></div>
    </div></header>`;
}
function navInferior(actual) {
  if (APP.rol === 'emp') {
    return `<nav class="navinf" aria-label="Navegación del portal"><a href="#/portal" ${actual === 'portal' ? 'aria-current="page"' : ''}>${icono('inicio')}Inicio</a><a href="#/portal?tab=equipos">${icono('caja')}Equipos</a><a href="#/pedir-ayuda" ${actual === 'pedir-ayuda' ? 'aria-current="page"' : ''}>${icono('ayuda')}Pedir ayuda</a><a href="#/portal?tab=datos">${icono('usuario')}Mis datos</a></nav>`;
  }
  if (APP.rol === 'plat') {
    return `<nav class="navinf" aria-label="Navegación de la consola"><a href="#/plataforma" aria-current="page">${icono('edificio')}Empresas</a><a href="#/plataforma?tab=soporte">${icono('escudo')}Soporte</a><a href="#/plataforma?tab=correo">${icono('campana')}Correo</a><a href="#/ingreso">${icono('cerrar')}Salir</a></nav>`;
  }
  return `<nav class="navinf" aria-label="Navegación rápida"><a href="#/inicio" ${actual === 'inicio' ? 'aria-current="page"' : ''}>${icono('inicio')}Inicio</a><a href="#/buscar" ${actual === 'buscar' ? 'aria-current="page"' : ''}>${icono('buscar')}Buscar</a><button type="button" data-acc="nuevo-movil">${icono('mas')}Nuevo</button><button type="button" data-acc="menu-movil" aria-expanded="false">${icono('menu')}Menú</button></nav>`;
}
function menuPlataforma(tab) {
  const t = tab || 'empresas';
  return `<h2>Consola</h2><ul><li><a href="#/plataforma" ${t === 'empresas' ? 'aria-current="page"' : ''}>${icono('edificio')}<span>Empresas</span></a></li><li><a href="#/plataforma?tab=soporte" ${t === 'soporte' ? 'aria-current="page"' : ''}>${icono('escudo')}<span>Soporte autorizado</span></a></li><li><a href="#/plataforma?tab=correo" ${t === 'correo' ? 'aria-current="page"' : ''}>${icono('campana')}<span>Estado del correo</span></a></li><li><a href="#/plataforma?tab=registro" ${t === 'registro' ? 'aria-current="page"' : ''}>${icono('doc')}<span>Registro de la plataforma</span></a></li></ul>`;
}
function menuPortal(actual, tab) {
  const t = tab || 'inicio';
  const L = [['inicio', 'Inicio', 'inicio'], ['equipos', 'Mis equipos', 'caja'], ['casos', 'Mis casos', 'ayuda'], ['datos', 'Mis datos', 'usuario']];
  return `<h2>Portal del empleado</h2><ul>${L.map((x) => `<li><a href="#/portal${x[0] === 'inicio' ? '' : '?tab=' + x[0]}" ${actual === 'portal' && t === x[0] ? 'aria-current="page"' : ''}>${icono(x[2])}<span>${x[1]}</span></a></li>`).join('')}<li><a href="#/pedir-ayuda" ${actual === 'pedir-ayuda' ? 'aria-current="page"' : ''}>${icono('mas')}<span>Pedir ayuda</span></a></li></ul>`;
}
function shell(layout, def, rutaActual, q, contenido) {
  if (layout === 'solo') {
    return `${demoBar()}<main id="contenido" class="principal" style="margin:0 auto;max-width:560px">${contenido}</main>`;
  }
  const menu = layout === 'plat' ? menuPlataforma(q.tab) : layout === 'portal' ? menuPortal(rutaActual, q.tab) : menuHTML(rutaActual);
  const pie = def.id ? `<div class="pie-pantalla">Pantalla <strong>${def.id}</strong> · prioridad ${def.prio || 'A'} · empresa activa: ${APP.rol === 'plat' ? 'ninguna (consola de plataforma)' : esc(E().nombre)} · rol: ${esc(R().nombre)} · ${def.fase ? 'muestra de un módulo de ' + def.fase + ' · ' : ''}ejemplo con datos inventados</div>` : '';
  return `<a class="saltar" href="#contenido" data-acc="saltar">Saltar al contenido</a>${demoBar()}${barraApp(layout)}
    <div class="cuerpo"><nav class="menu" id="menu-lateral" aria-label="Menú principal">${menu}</nav><div class="velo-menu" data-acc="menu-movil"></div>
    <main id="contenido" class="principal" aria-label="Contenido">${contenido}${pie}</main></div>${navInferior(rutaActual)}<div id="anuncio" class="oculto-visual" aria-live="polite"></div>`;
}

/* ---------- Pantallas de error del propio sistema ---------- */
function pantallaNoEncontrada(extra) {
  return `${cabeceraPantalla('No encontrado')}${aviso('info', 'No encontramos lo que busca.', 'Puede que ya no exista o que no esté disponible para usted. ' + (extra || ''))}<p><a class="btn primario" href="#/inicio">Ir al Inicio</a></p>`;
}
function pantallaSinPermiso(def) {
  const plat = APP.rol === 'plat';
  return `${cabeceraPantalla('No tiene permiso')}${aviso('atencion', plat ? 'La consola de plataforma no ve los datos del negocio.' : `Su rol (${esc(R().nombre)}) no permite entrar a esta pantalla.`,
    plat ? 'Esto protege los datos de cada empresa. Si necesita ayudar a una empresa, esa empresa debe autorizar el soporte por 24 horas.' : `Si lo necesita, pídaselo a un administrador de ${esc(E().corto)}. Puede ver qué puede hacer en <a href="#/mis-permisos">Mis permisos</a>.`)}<p><a class="btn primario" href="#/inicio">Volver al Inicio</a></p><p class="suave chica">Pantalla solicitada: ${esc(def.titulo || '')}</p>`;
}

/* ---------- Rutas ---------- */
function ruta(path, def) { RUTAS[path] = def; }
function parseHash() {
  const h = location.hash.replace(/^#\/?/, '');
  const [p, q] = h.split('?');
  return { ruta: p || 'inicio', q: Object.fromEntries(new URLSearchParams(q || '')) };
}
function layoutPara(def) {
  if (def.layout === 'solo') return 'solo';
  if (APP.rol === 'plat') return 'plat';
  if (APP.rol === 'emp') return 'portal';
  return 'app';
}
function render(conservarFoco) {
  const { ruta: r, q } = parseHash();
  const raiz = document.getElementById('raiz');
  let def = RUTAS[r];
  let contenido;
  if (!def) {
    def = { titulo: 'No encontrado', layout: 'app' };
    contenido = pantallaNoEncontrada('La dirección no existe en este prototipo.');
  } else if (!accesoOk(def.acceso)) {
    contenido = pantallaSinPermiso(def);
  } else {
    try { contenido = def.render(q); } catch (err) { console.error('Error al dibujar', r, err); contenido = aviso('alerta', 'No pudimos dibujar esta pantalla.', 'Avise al equipo de TI con el código ERR-' + r.toUpperCase()); }
  }
  raiz.innerHTML = shell(layoutPara(def), def, r, q, contenido);
  ajustarAltoDemo();
  if (typeof asistenteRefrescar === 'function') asistenteRefrescar(layoutPara(def));
  document.title = `${def.titulo || 'Plataforma'} · ${APP.rol === 'plat' ? 'Consola de plataforma' : E().corto} · Prototipo`;
  APP.actual = { r, q, def };
  if (def.despues && accesoOk(def.acceso)) { try { def.despues(q); } catch (err) { console.error('Error al activar', r, err); } }
  if (!conservarFoco) {
    const h = document.getElementById('titulo-pantalla');
    if (h) { h.focus({ preventScroll: true }); }
    window.scrollTo(0, 0);
    const an = document.getElementById('anuncio'); if (an) an.textContent = (def.titulo || '') + ', ' + (APP.rol === 'plat' ? 'consola de plataforma' : E().nombre);
  }
}
function ajustarAltoDemo() {
  const d = document.querySelector('.demo-bar');
  if (d) document.documentElement.style.setProperty('--alto-demo', d.offsetHeight + 'px');
}
window.addEventListener('resize', ajustarAltoDemo);
function irA(h) { if (location.hash === h) render(); else location.hash = h; }

/* ---------- Eventos globales (delegación) ---------- */
function cerrarDesplegables() { document.querySelectorAll('.lista-desp').forEach((l) => { l.hidden = true; }); document.querySelectorAll('[data-acc="desp"]').forEach((b) => b.setAttribute('aria-expanded', 'false')); }
function iniciarEventos() {
  document.addEventListener('click', (e) => {
    const inD = e.target.closest('.desplegable');
    if (!inD) cerrarDesplegables();
    const el = e.target.closest('[data-acc]');
    if (!el) return;
    if (el.getAttribute('aria-disabled') === 'true') { e.preventDefault(); return; }
    const a = el.dataset.acc;
    if (ACC[a]) { ACC[a](el, e); }
  });
  document.addEventListener('change', (e) => {
    if (e.target.id === 'sel-rol') { APP.rol = e.target.value; guardar(); if (location.hash === '#/inicio') render(); else location.hash = '#/inicio'; return; }
    if (e.target.id === 'sel-empresa') { APP.empresa = e.target.value; guardar(); toast('Ahora trabaja en: <strong>' + esc(E().nombre) + '</strong>. No queda nada en pantalla de la empresa anterior.'); if (location.hash === '#/inicio') render(); else location.hash = '#/inicio'; return; }
    const c = e.target.closest('[data-cambio]');
    if (c && CAMBIO[c.dataset.cambio]) CAMBIO[c.dataset.cambio](c, e);
  });
  document.addEventListener('input', (e) => {
    const c = e.target.closest('[data-entrada]');
    if (c && ENTRADA[c.dataset.entrada]) ENTRADA[c.dataset.entrada](c, e);
  });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('[data-form]');
    if (!f) return;
    e.preventDefault();
    if (f.dataset.form === 'buscar') { const v = document.getElementById('q-global').value.trim(); location.hash = '#/buscar' + (v ? '?q=' + encodeURIComponent(v) : ''); }
    else if (ACC['form-' + f.dataset.form]) ACC['form-' + f.dataset.form](f, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { cerrarDesplegables(); document.body.classList.remove('menu-abierto'); }
    const tab = e.target.closest && e.target.closest('[role="tab"]');
    if (tab && (e.key === 'ArrowRight' || e.key === 'ArrowLeft' || e.key === 'Home' || e.key === 'End')) {
      const lista = [...tab.parentElement.querySelectorAll('[role="tab"]')];
      let i = lista.indexOf(tab);
      if (e.key === 'ArrowRight') i = (i + 1) % lista.length; else if (e.key === 'ArrowLeft') i = (i - 1 + lista.length) % lista.length; else if (e.key === 'Home') i = 0; else i = lista.length - 1;
      e.preventDefault(); lista[i].focus(); lista[i].click();
    }
  });
  window.addEventListener('hashchange', () => { document.body.classList.remove('menu-abierto'); cerrarDialogo(); render(); });
}
/* acciones comunes */
ACC.tema = () => { APP.tema = APP.tema === 'oscuro' ? 'claro' : 'oscuro'; guardar(); aplicarTema(); render(true); };
ACC['menu-movil'] = (el) => { const ab = document.body.classList.toggle('menu-abierto'); document.querySelectorAll('[data-acc="menu-movil"][aria-expanded]').forEach((b) => b.setAttribute('aria-expanded', String(ab))); if (ab) { const a = document.querySelector('#menu-lateral a'); if (a) a.focus(); } };
ACC.desp = (el) => {
  const l = document.getElementById('desp-' + el.dataset.desp);
  const abierto = !l.hidden;
  cerrarDesplegables();
  l.hidden = abierto;
  el.setAttribute('aria-expanded', String(!abierto));
};
ACC.saltar = (el, e) => { e.preventDefault(); const m = document.getElementById('contenido'); m.setAttribute('tabindex', '-1'); m.focus(); };
ACC['nuevo-movil'] = () => {
  const L = menuNuevo();
  abrirDialogo({ titulo: 'Nuevo', cuerpo: L.length ? `<div class="pila">${L.map((n) => `<a class="btn" href="${n.h}">${n.t}</a>`).join('')}</div>` : '<p>Su rol no tiene acciones rápidas. Use «Pedir ayuda».</p>', botones: [{ texto: 'Cerrar' }] });
};
ACC.pestana = (el) => {
  const g = el.dataset.grupo;
  const cont = document.getElementById('tabs-' + g + '-cuerpo');
  document.querySelectorAll(`#${g} [role="tab"]`).forEach((b) => { const s = b === el; b.setAttribute('aria-selected', String(s)); b.tabIndex = s ? 0 : -1; });
  document.querySelectorAll(`[data-panel-de="${g}"]`).forEach((p) => { p.hidden = p.dataset.k !== el.dataset.k; });
};
const panel = (grupo, k, activo, html) => `<div role="tabpanel" data-panel-de="${grupo}" data-k="${k}" aria-labelledby="tab-${grupo}-${k}" ${k === activo ? '' : 'hidden'} tabindex="0">${html}</div>`;
ACC.exportar = () => {
  dialogoMotivo({ titulo: 'Exportar a Excel', verbo: 'Exportar', etiqueta: 'Motivo de la exportación', texto: 'Se exportarán solo las filas y columnas que usted ya puede ver. Las columnas de precios y de datos personales se omiten si no tiene el permiso.', consecuencias: ['La exportación queda en la auditoría (quién, cuándo, cuántas filas).', 'Las celdas que empiezan con = + - @ se guardan como texto.'], alConfirmar: () => toast('Exportación simulada: en la plataforma real se descargaría el archivo.') });
};

/* ---------- Arranque ---------- */
function iniciar() {
  leer();
  aplicarTema();
  iniciarEventos();
  render();
}

/* =========================================================================
   Inventario: SKU, categorías, activos, entregas, personas, importación,
   stock y catálogos.
   ========================================================================= */
'use strict';

/* ---------- Lista con buscador y filtros (patrón único) ---------- */
const LISTAS = {};
function estadoLista(id) { return (APP.tmp['f-' + id] = APP.tmp['f-' + id] || {}); }
function zonaLista(id) {
  const o = LISTAS[id], f = estadoLista(id);
  const todos = o.datos();
  const filas = todos.filter((d) => o.filtrar(d, f));
  const hay = Object.values(f).some((v) => v);
  return `<p class="suave chica" aria-live="polite">Mostrando ${filas.length} de ${todos.length}${hay ? ' · hay filtros activos' : ''}</p>` +
    (filas.length ? tabla({ cols: o.cols, filas, claseFila: o.claseFila }) + `<div class="paginacion"><span>Página 1 de 1 · 50 filas por página</span><span>${btnAcc({ texto: 'Anterior', clase: 'chico', bloqueo: 'Está en la primera página.' }).replace(/<span class="razon".*<\/span><\/span>$/, '</span>')}</span></div>`
      : vacio({ titulo: 'No hay resultados', texto: 'Cambie los filtros o limpie la búsqueda.', boton: `<button class="btn" type="button" data-acc="lista-limpiar" data-lista="${id}">Limpiar filtros</button>` }));
}
function listaHTML(id, o, ini) {
  LISTAS[id] = o;
  const f = estadoLista(id);
  if (ini) Object.assign(f, ini);
  const campos = o.campos.map((c) => c.tipo === 'texto'
    ? `<div class="campo buscador"><label for="f-${id}-${c.k}">${c.etq}</label><input id="f-${id}-${c.k}" type="search" value="${esc(f[c.k] || '')}" placeholder="${esc(c.ph || '')}" data-entrada="lista" data-lista="${id}" data-k="${c.k}"></div>`
    : `<div class="campo"><label for="f-${id}-${c.k}">${c.etq}</label><select id="f-${id}-${c.k}" data-cambio="lista" data-lista="${id}" data-k="${c.k}"><option value="">Todos</option>${c.op().map((x) => `<option ${f[c.k] === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select></div>`).join('');
  return `<div class="barra-herr" role="search" aria-label="Buscar y filtrar">${campos}${o.exportar === false ? '' : btnExportar()}</div><div id="zona-${id}">${zonaLista(id)}</div>`;
}
function actualizarLista(el) { const id = el.dataset.lista; estadoLista(id)[el.dataset.k] = el.value; document.getElementById('zona-' + id).innerHTML = zonaLista(id); }
ENTRADA.lista = actualizarLista; CAMBIO.lista = actualizarLista;
ACC['lista-limpiar'] = (el) => { const id = el.dataset.lista; APP.tmp['f-' + id] = {}; render(true); };

const skuDe = (cod) => D().skus.find((s) => s.cod === cod);
const contiene = (t, ...xs) => !t || xs.some((x) => x && String(x).toLowerCase().includes(String(t).toLowerCase()));
const ubicDe = (u) => esc(u).replace(/ &gt; /g, ' › ');

/* ---------- PR-07 Lista de SKU ---------- */
ruta('skus', { id: 'PR-07', titulo: 'Artículos (SKU)', acceso: 'skus.ver', render() {
  const cats = [...new Set(D().skus.map((s) => s.cat.split(' > ')[0]))];
  return `${cabeceraPantalla('Artículos (SKU)', btnAcc({ texto: 'Nuevo artículo', href: '#/sku-nuevo', clase: 'primario', icono: 'mas', perm: 'skus.crear_editar' }) + '<span class="id-pantalla">PR-07 · prioridad A</span>')}
  <p class="suave">Un SKU es un <em>tipo</em> de artículo (por ejemplo «Laptop Dell Latitude 5440»). Cada unidad física con número de serie es un <em>activo</em>.</p>
  ${listaHTML('skus', {
    datos: () => D().skus,
    campos: [{ k: 'q', etq: 'Buscar por código o nombre', tipo: 'texto', ph: 'LAP-0001, mouse…' }, { k: 'cat', etq: 'Categoría', tipo: 'sel', op: () => cats }, { k: 'ctl', etq: 'Control', tipo: 'sel', op: () => ['Por serie', 'Por cantidad'] }, { k: 'est', etq: 'Estado del registro', tipo: 'sel', op: () => ['Activo', 'Inactivo'] }],
    filtrar: (s, f) => contiene(f.q, s.cod, s.nombre) && (!f.cat || s.cat.startsWith(f.cat)) && (!f.ctl || (f.ctl === 'Por serie') === (s.control === 'serie')) && (!f.est || (f.est === 'Activo') === s.activo),
    cols: [
      { t: 'Código', k: (s) => `<a class="cod" href="#/sku?id=${s.cod}">${s.cod}</a>` },
      { t: 'Nombre', k: (s) => esc(s.nombre) }, { t: 'Categoría', k: (s) => esc(s.cat) },
      { t: 'Control', k: (s) => chipEtq(s.control === 'serie' ? 'Por serie' : 'Por cantidad') },
      { t: 'Existencias', cls: 'num', k: (s) => s.control === 'serie' ? D().activos.filter((a) => a.sku === s.cod).length + ' unidades' : fmtNum(D().stock.filter((x) => x.sku === s.cod).reduce((t, x) => t + x.saldo, 0), s.unidad.includes('decimales') ? 1 : 0) + ' ' + (s.unidad.includes('Metro') ? 'm' : 'pzas') },
      { t: 'Estado del registro', k: (s) => chip(s.activo ? 'Activo' : 'Inactivo') }]
  })}`;
} });

/* ---------- PR-08 Ficha del SKU ---------- */
ruta('sku', { id: 'PR-08', titulo: 'Ficha del artículo', acceso: 'skus.ver', render(q) {
  const s = skuDe(q.id);
  if (!s) return pantallaNoEncontrada();
  const cat = D().categorias.find((c) => s.cat.startsWith(c.nombre));
  const camposArt = (cat ? cat.campos : []).filter((c) => c.ap === 'Artículo');
  const camposUni = (cat ? cat.campos : []).filter((c) => c.ap === 'Cada unidad');
  const act = D().activos.filter((a) => a.sku === s.cod);
  const tab = q.tab || 'resumen';
  const ocs = D().ordenes.filter((o) => o.lineas.some((l) => l.sku === s.cod));
  const serie = s.control === 'serie';
  const stock = D().stock.filter((x) => x.sku === s.cod);
  return `${cabeceraPantalla(`<span class="cod">${s.cod}</span> ${esc(s.nombre)}`, `${btnAcc({ texto: 'Editar', href: '#/sku-nuevo?id=' + s.cod, icono: 'ajustes', perm: 'skus.crear_editar' })}${btnAcc({ texto: s.activo ? 'Desactivar' : 'Reactivar', acc: 'sku-desactivar', datos: { id: s.cod }, perm: 'skus.desactivar' })}`, '<a href="#/skus">Artículos</a> › ' + s.cod)}
  <div class="cab-ficha"><div class="fila">${chipEtq(serie ? 'Control por serie' : 'Control por cantidad')} ${chip(s.activo ? 'Activo' : 'Inactivo')}<span class="id-pantalla">PR-08 · prioridad A</span></div><dl class="datos"><div class="dato"><dt>Categoría</dt><dd>${esc(s.cat)}</dd></div><div class="dato"><dt>Marca y modelo</dt><dd>${esc(s.marca)} ${esc(s.modelo)}</dd></div><div class="dato"><dt>Unidad de medida</dt><dd>${esc(s.unidad)}</dd></div><div class="dato"><dt>${serie ? 'Unidades con serie' : 'Existencias'}</dt><dd>${serie ? act.length : fmtNum(stock.reduce((t, x) => t + x.saldo, 0), s.unidad.includes('decimales') ? 1 : 0)}</dd></div></dl></div>
  ${pestanas('sku', [{ k: 'resumen', t: 'Resumen' }, { k: 'series', t: serie ? 'Series y activos' : 'Stock por ubicación', n: serie ? act.length : stock.length }, { k: 'oc', t: 'Órdenes de compra', n: ocs.length }, { k: 'historial', t: 'Historial' }], tab)}
  ${panel('sku', 'resumen', tab, `<div class="rejilla dos"><section class="tarjeta"><h2>Datos del artículo</h2><p class="suave chica">Valen para <strong>todas</strong> las unidades de este SKU.</p><dl class="lista-datos">${camposArt.length ? camposArt.map((c) => `<dt>${esc(c.n)}</dt><dd>${esc(s.campos[c.n] || '—')}</dd>`).join('') : '<dt>Campos</dt><dd class="suave">Esta categoría no tiene campos del artículo.</dd>'}</dl></section>
  <section class="tarjeta"><h2>Datos de cada unidad</h2><p class="suave chica">Cambian en cada unidad. Se piden al recibir la mercadería y se pueden completar después.</p>${camposUni.length && serie ? `<ul>${camposUni.map((c) => `<li>${esc(c.n)} ${c.ob ? '<span class="suave chica">(obligatorio)</span>' : ''} ${c.modulo ? chipEtq('Lo gestiona el módulo ' + c.modulo) : ''}</li>`).join('')}</ul>` : '<p class="suave">Este artículo no tiene datos propios de cada unidad.</p>'}</section></div>
  <div class="aviso info" style="margin-top:16px">${icono('info')}<div class="cuerpo-aviso">El código <span class="cod">${s.cod}</span> no se reutiliza nunca ni se puede cambiar cuando el artículo ya tiene unidades o movimientos. No tiene precio fijo: el precio vive en cada orden de compra.</div></div>`)}
  ${panel('sku', 'series', tab, serie ? `<div class="barra-herr"><div class="campo buscador"><label for="q-serie">Buscar una serie</label><input id="q-serie" type="search" placeholder="Ejemplo: 5CG3412H2Q" data-entrada="filtro-series"></div>${btnExportar()}</div><div id="zona-series">${tablaSeries(s, act, '')}</div>` :
    tabla({ filas: stock, vacio: { titulo: 'Sin existencias', texto: 'Aún no hay stock de este artículo.' }, cols: [{ t: 'Ubicación', k: (x) => ubicDe(x.ubic) }, { t: 'Saldo', cls: 'num', k: (x) => fmtNum(x.saldo, s.unidad.includes('decimales') ? 1 : 0) }, { t: 'Mínimo', cls: 'num', k: (x) => s.min || '—' }] }))}
  ${panel('sku', 'oc', tab, tabla({ filas: ocs, vacio: { titulo: 'Ninguna orden de compra', texto: 'Este artículo aún no se ha pedido.' }, cols: [{ t: 'Orden', k: (o) => `<a class="cod" href="#/oc?id=${o.num}">${o.num}</a>` }, { t: 'Proveedor', k: (o) => esc(o.prov || '—') }, { t: 'Cantidad', cls: 'num', k: (o) => o.lineas.find((l) => l.sku === s.cod).cant }, { t: 'Estado', k: (o) => chip(o.est) }] }))}
  ${panel('sku', 'historial', tab, `<ol class="linea"><li><strong>Artículo creado</strong><div class="cuando">02/02/2024 · Marta Quispe · código automático ${s.cod}</div></li><li><strong>Se editó el nombre</strong><div class="cuando">10/05/2024 · Marta Quispe · antes: «${esc(s.nombre.slice(0, 20))}…»</div></li></ol>`)}`;
} });
function tablaSeries(s, act, t) {
  const f = act.filter((a) => contiene(t, a.serie, a.imei));
  const cat = D().categorias.find((c) => s.cat.startsWith(c.nombre));
  const unidad = (cat ? cat.campos : []).filter((c) => c.ap === 'Cada unidad' && !c.modulo);
  return tabla({ filas: f, vacio: { titulo: 'No hay series con ese texto', texto: 'Revise la escritura. Las series no distinguen mayúsculas ni espacios sobrantes.' }, cols: [
    { t: 'Serie', k: (a) => `<a class="cod" href="#/activo?id=${a.id}">${esc(a.serie)}</a>` }, { t: 'Estado', k: (a) => chip(a.estado) },
    { t: 'Ubicación', k: (a) => ubicDe(a.ubic) }, { t: 'Responsable', k: (a) => nombrePersona(a.resp) }, { t: 'Garantía', k: (a) => chipGarantia(a.garantia) }]
    .concat(s.cod.startsWith('CEL') ? [{ t: 'IMEI (dato de la unidad)', k: (a) => a.imei ? `<span class="cod">${esc(a.imei)}</span>` : chip('Pendiente de completar') }] : [])
    .concat(s.cod.startsWith('LIC') ? [{ t: 'Clave (dato de la unidad)', k: (a) => `<span class="secreto">${esc(a.clave || '')}</span>` }] : []) });
}
ENTRADA['filtro-series'] = (el) => { const s = skuDe(parseHash().q.id); document.getElementById('zona-series').innerHTML = tablaSeries(s, D().activos.filter((a) => a.sku === s.cod), el.value); };
ACC['sku-desactivar'] = (el) => {
  const s = skuDe(el.dataset.id);
  abrirDialogo({ titulo: (s.activo ? 'Desactivar' : 'Reactivar') + ' el artículo', cuerpo: `<p>${s.activo ? 'Un artículo inactivo no se puede usar en órdenes ni recepciones nuevas, pero sigue visible en el historial. Sus unidades y su stock no cambian.' : 'El artículo volverá a poder usarse en órdenes y recepciones.'}</p>`, botones: [{ texto: 'Volver' }, { texto: s.activo ? 'Desactivar' : 'Reactivar', clase: 'primario', alPulsar: () => { s.activo = !s.activo; toast('Artículo ' + (s.activo ? 'reactivado' : 'desactivado') + '.'); render(true); } }] });
};

/* ---------- PR-09 Crear / editar SKU ---------- */
function siguienteCodigo(prefijo) {
  const nums = D().skus.filter((s) => s.cod.startsWith(prefijo + '-')).map((s) => parseInt(s.cod.split('-')[1], 10));
  return prefijo + '-' + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0');
}
ruta('sku-nuevo', { id: 'PR-09', titulo: 'Crear o editar artículo', acceso: 'skus.crear_editar', render(q) {
  const ed = q.id ? skuDe(q.id) : null;
  const cats = D().categorias;
  return `${cabeceraPantalla(ed ? 'Editar artículo ' + ed.cod : 'Nuevo artículo (SKU)', '<span class="id-pantalla">PR-09 · prioridad A</span>', '<a href="#/skus">Artículos</a> › ' + (ed ? ed.cod : 'Nuevo'))}
  <form data-form="sku" novalidate class="tarjeta" style="max-width:760px">
  <div id="resumen-errores" class="aviso alerta" role="alert" hidden>${icono('alerta')}<div class="cuerpo-aviso"><strong>Revise los campos marcados</strong><ul id="lista-errores"></ul></div></div>
  <div class="fila-form"><div class="campo"><label for="sk-nombre">Nombre <span class="obligatorio">(obligatorio, hasta 120 caracteres)</span></label><input id="sk-nombre" type="text" maxlength="130" value="${ed ? esc(ed.nombre) : ''}" data-entrada="sku-val"><div class="error" id="sk-nombre-e" hidden></div></div>
  <div class="campo"><label for="sk-cat">Categoría <span class="obligatorio">(obligatorio)</span></label><select id="sk-cat" data-cambio="sku-cat" ${ed ? 'disabled' : ''}><option value="">Elija…</option>${cats.map((c) => `<option value="${c.prefijo}" ${ed && ed.cat.startsWith(c.nombre) ? 'selected' : ''}>${c.nombre} (${c.prefijo})</option>`).join('')}</select>${ed ? '<div class="ayuda">La categoría no se cambia cuando el artículo ya tiene existencias.</div>' : ''}<div class="error" id="sk-cat-e" hidden></div></div></div>
  <div class="campo"><span class="etiqueta">Código</span><div id="sk-codigo-vista" class="mono" style="font-size:1.1rem">${ed ? ed.cod : 'Elija una categoría para ver el código automático'}</div>
    ${puede('skus.codigo_propio') && !ed ? `<div class="opcion"><input type="checkbox" id="sk-propio" data-cambio="sku-propio"><label for="sk-propio">Escribir un código propio (por ejemplo, el de SAP)</label></div><div id="sk-propio-zona" hidden><input id="sk-codigo" type="text" placeholder="LAP-0123" data-entrada="sku-val"><div class="error" id="sk-codigo-e" hidden></div></div>` : (!ed ? '<div class="ayuda">El código se genera solo. Escribir un código propio es un permiso aparte que su rol no tiene.</div>' : '<div class="ayuda">El código no se edita cuando el artículo ya tiene movimientos o unidades.</div>')}</div>
  <fieldset><legend>Modo de control</legend><div class="opcion"><input type="radio" name="ctl" id="ctl-s" value="serie" ${!ed || ed.control === 'serie' ? 'checked' : ''} ${ed ? 'disabled' : ''}><label for="ctl-s">Por serie: cada unidad se rastrea con su número de serie (laptops, celulares, claves)</label></div><div class="opcion"><input type="radio" name="ctl" id="ctl-c" value="cantidad" ${ed && ed.control === 'cantidad' ? 'checked' : ''} ${ed ? 'disabled' : ''}><label for="ctl-c">Por cantidad: solo se cuenta el stock (mouses, teclados, cables)</label></div><div class="ayuda">Después no se puede cambiar si ya hay unidades o stock.</div></fieldset>
  <div class="fila-form"><div class="campo"><label for="sk-marca">Marca</label><select id="sk-marca"><option>Dell</option><option>Lenovo</option><option>HP</option><option>Samsung</option><option>Logitech</option></select></div><div class="campo"><label for="sk-modelo">Modelo</label><input id="sk-modelo" type="text" value="${ed ? esc(ed.modelo) : ''}"></div><div class="campo"><label for="sk-unidad">Unidad de medida</label><select id="sk-unidad"><option>Pieza</option><option>Caja</option><option>Metro (admite decimales)</option><option>Clave</option></select></div></div>
  <div id="sk-campos"></div>
  <div class="fila"><button type="submit" class="btn primario">${ed ? 'Guardar cambios' : 'Crear artículo'}</button><a class="btn" href="#/skus">Cancelar</a></div></form>`;
}, despues(q) { if (q.id) { const s = skuDe(q.id); const c = D().categorias.find((x) => s.cat.startsWith(x.nombre)); if (c) pintarCamposSku(c.prefijo); } } });
function pintarCamposSku(pref) {
  const zona = document.getElementById('sk-campos'); if (!zona) return;
  const cat = D().categorias.find((c) => c.prefijo === pref);
  if (!cat) { zona.innerHTML = ''; return; }
  const art = cat.campos.filter((c) => c.ap === 'Artículo'), uni = cat.campos.filter((c) => c.ap === 'Cada unidad');
  const q = parseHash().q, ed = q.id ? skuDe(q.id) : null;
  zona.innerHTML = `<fieldset><legend>Datos del artículo (valen para todas las unidades)</legend><div class="fila-form">${art.map((c, i) => `<div class="campo"><label for="ca-${i}">${esc(c.n)} <span class="obligatorio">(${c.ob ? 'obligatorio' : 'opcional'})</span></label>${c.t === 'Lista' ? `<select id="ca-${i}" data-ob="${c.ob}" data-n="${esc(c.n)}" data-entrada="sku-val" data-cambio="sku-val"><option value="">Elija…</option>${c.op.split(' · ').map((o) => `<option ${ed && ed.campos[c.n] === o ? 'selected' : ''}>${o}</option>`).join('')}</select>` : `<input id="ca-${i}" type="text" data-ob="${c.ob}" data-n="${esc(c.n)}" data-entrada="sku-val" value="${ed ? esc(ed.campos[c.n] || '') : ''}">`}<div class="error" id="ca-${i}-e" hidden></div></div>`).join('') || '<p class="suave">Esta categoría no tiene campos del artículo.</p>'}</div></fieldset>
  ${uni.length ? `<div class="aviso info">${icono('info')}<div class="cuerpo-aviso"><strong>Datos de cada unidad</strong>Estos datos se piden al recibir la mercadería, uno por unidad: ${uni.map((c) => esc(c.n) + (c.modulo ? ' (los gestiona el módulo ' + c.modulo + ')' : '')).join(', ')}. Se pueden completar después.</div></div>` : ''}`;
}
CAMBIO['sku-cat'] = (el) => {
  const pref = el.value;
  const v = document.getElementById('sk-codigo-vista');
  v.textContent = pref ? siguienteCodigo(pref) + '  (automático; el código no se reutiliza nunca y puede haber saltos)' : 'Elija una categoría para ver el código automático';
  pintarCamposSku(pref);
};
CAMBIO['sku-propio'] = (el) => { document.getElementById('sk-propio-zona').hidden = !el.checked; };
function validarSku(solo) {
  const err = [];
  const poner = (id, msg) => { const e = document.getElementById(id + '-e'), c = document.getElementById(id); if (!e || !c) return; e.hidden = !msg; if (msg) { e.innerHTML = icono('alerta') + '<span>' + esc(msg) + '</span>'; err.push([id, msg]); } c.setAttribute('aria-invalid', String(!!msg)); };
  const n = document.getElementById('sk-nombre').value.trim();
  poner('sk-nombre', !n ? 'El nombre es obligatorio.' : n.length > 120 ? 'El nombre no puede pasar de 120 caracteres.' : '');
  if (!parseHash().q.id) poner('sk-cat', !document.getElementById('sk-cat').value ? 'Elija una categoría.' : '');
  const propio = document.getElementById('sk-propio');
  if (propio && propio.checked) {
    const c = document.getElementById('sk-codigo').value.trim().toUpperCase();
    poner('sk-codigo', !c ? 'Escriba el código o desmarque la opción.' : !/^[A-Z0-9]{2,5}-\d{4,}$/.test(c) ? 'Use el formato PREFIJO-0000, por ejemplo LAP-0123.' : D().skus.some((s) => s.cod === c) ? 'Ese código ya existe en la empresa. Los códigos no se repiten, aunque cambien las mayúsculas.' : '');
  }
  document.querySelectorAll('#sk-campos [data-n]').forEach((el) => { const i = el.id; poner(i, el.dataset.ob === 'true' && !el.value.trim() ? 'Este dato es obligatorio.' : ''); });
  return err;
}
ENTRADA['sku-val'] = () => { validarSku(); };
CAMBIO['sku-val'] = () => { validarSku(); };
ACC['form-sku'] = () => {
  const err = validarSku();
  const res = document.getElementById('resumen-errores');
  res.hidden = !err.length;
  if (err.length) { document.getElementById('lista-errores').innerHTML = err.map((e) => `<li><a href="#${e[0]}" data-acc="ir-campo" data-id="${e[0]}">${esc(e[1])}</a></li>`).join(''); res.scrollIntoView({ block: 'center' }); return; }
  const q = parseHash().q;
  if (q.id) { skuDe(q.id).nombre = document.getElementById('sk-nombre').value.trim(); toast('Cambios guardados.'); location.hash = '#/sku?id=' + q.id; return; }
  const pref = document.getElementById('sk-cat').value;
  const propio = document.getElementById('sk-propio');
  const cod = propio && propio.checked ? document.getElementById('sk-codigo').value.trim().toUpperCase() : siguienteCodigo(pref);
  const cat = D().categorias.find((c) => c.prefijo === pref);
  const campos = {}; document.querySelectorAll('#sk-campos [data-n]').forEach((el) => { campos[el.dataset.n] = el.value; });
  D().skus.push({ cod, nombre: document.getElementById('sk-nombre').value.trim(), cat: cat.nombre, marca: document.getElementById('sk-marca').value, modelo: document.getElementById('sk-modelo').value, control: document.querySelector('input[name=ctl]:checked').value, unidad: document.getElementById('sk-unidad').value, activo: true, campos, min: 0 });
  toast('Artículo <strong>' + cod + '</strong> creado.'); location.hash = '#/sku?id=' + cod;
};
ACC['ir-campo'] = (el, e) => { e.preventDefault(); const c = document.getElementById(el.dataset.id); if (c) c.focus(); };

/* ---------- PR-10 Categorías y campos personalizados ---------- */
ruta('categorias', { id: 'PR-10', titulo: 'Categorías y campos personalizados', acceso: 'catalogos.ver', render() {
  return `${cabeceraPantalla('Categorías y campos personalizados', btnAcc({ texto: 'Nueva categoría', acc: 'cat-nueva', icono: 'mas', perm: 'categorias.gestionar' }) + '<span class="id-pantalla">PR-10 · prioridad A</span>')}
  <p>Cada categoría define el prefijo de los códigos y los datos extra. Un campo puede ser <strong>del artículo</strong> (vale para todas sus unidades, como la RAM) o <strong>de cada unidad</strong> (cambia en cada una, como el IMEI).</p>
  ${D().categorias.map((c, i) => `<div class="acordeon"><h3><button type="button" aria-expanded="${i === 0}" aria-controls="cat${i}" data-acc="acordeon">${icono('flecha')}${esc(c.nombre)} <span class="cod">${c.prefijo}</span>${c.subs.length ? `<span class="suave chica">· Subcategorías: ${c.subs.join(', ')}</span>` : ''}</button></h3><div class="panel" id="cat${i}" ${i === 0 ? '' : 'hidden'}>
  ${tabla({ filas: c.campos, cols: [{ t: 'Campo', k: (f) => esc(f.n) }, { t: 'Tipo', k: (f) => chipEtq(f.t) + (f.t === 'Secreto' ? ' ' + chip('Sensible', 'sensible') : '') }, { t: 'Se aplica a', k: (f) => chipEtq(f.ap === 'Artículo' ? 'Al artículo' : 'A cada unidad') }, { t: 'Obligatorio', k: (f) => f.ob ? 'Obligatorio' : 'Opcional' }, { t: 'Notas', k: (f) => f.modulo ? chip('Sensible', 'sensible').replace('Sensible', 'Lo gestiona el módulo ' + f.modulo) : (f.op ? '<span class="suave chica">Opciones: ' + esc(f.op) + '</span>' : '') }, { t: 'Acciones', sin: true, k: (f) => f.modulo ? '<span class="suave chica">Solo lectura</span>' : btnAcc({ texto: 'Desactivar', clase: 'chico', acc: 'campo-desact', datos: { n: f.n }, perm: 'categorias.gestionar' }) }] })}
  <div class="fila" style="margin-top:12px">${btnAcc({ texto: 'Agregar campo', acc: 'campo-nuevo', datos: { cat: c.nombre }, icono: 'mas', perm: 'categorias.gestionar' })}</div></div></div>`).join('')}
  <div class="aviso info">${icono('info')}<div class="cuerpo-aviso"><strong>Reglas de los campos</strong>Un campo con datos no se borra: se desactiva. No se cambia el tipo de un campo que ya tiene datos. Si un campo se vuelve obligatorio, lo que ya existe no se bloquea: queda marcado «Pendiente de completar».</div></div>
  ${puede('categorias.gestionar') ? '' : aviso('atencion', 'Solo consulta', 'Crear categorías y campos es un permiso del Administrador.')}`;
} });
ACC['campo-nuevo'] = (el) => abrirDialogo({ titulo: 'Agregar campo a ' + esc(el.dataset.cat), cuerpo: `<div class="campo"><label for="cn-n">Nombre del campo <span class="obligatorio">(obligatorio)</span></label><input id="cn-n" type="text"></div><div class="campo"><label for="cn-t">Tipo</label><select id="cn-t"><option>Texto</option><option>Número</option><option>Fecha</option><option>Lista de opciones</option><option>Sí o no</option><option>Secreto (solo para claves de licencia; se muestra enmascarado)</option></select></div><div class="campo"><label for="cn-a">Se aplica a</label><select id="cn-a"><option>Al artículo (vale para todas las unidades)</option><option>A cada unidad (cambia en cada una)</option></select><div class="ayuda">Los campos «a cada unidad» solo existen en artículos controlados por serie.</div></div><div class="opcion"><input type="checkbox" id="cn-o"><label for="cn-o">Es obligatorio</label></div>`, botones: [{ texto: 'Volver' }, { texto: 'Agregar campo', clase: 'primario', alPulsar: (d) => { if (!d.querySelector('#cn-n').value.trim()) { d.querySelector('#cn-n').focus(); d.querySelector('#cn-n').setAttribute('aria-invalid', 'true'); return false; } toast('Campo agregado (simulado).'); } }] });
ACC['campo-desact'] = (el) => dialogoMotivo({ titulo: 'Desactivar el campo «' + esc(el.dataset.n) + '»', verbo: 'Desactivar', consecuencias: ['El campo deja de pedirse en registros nuevos.', 'Los datos ya guardados se conservan y siguen visibles.'], alConfirmar: () => toast('Campo desactivado (simulado).') });
ACC['cat-nueva'] = () => abrirDialogo({ titulo: 'Nueva categoría', cuerpo: '<div class="campo"><label for="cc-n">Nombre <span class="obligatorio">(obligatorio)</span></label><input id="cc-n" type="text"></div><div class="campo"><label for="cc-p">Prefijo del código <span class="obligatorio">(de 2 a 5 letras o números, único en la empresa)</span></label><input id="cc-p" type="text" maxlength="5" style="text-transform:uppercase"><div class="ayuda">No puede usar prefijos reservados como OC, OS, RCP, PRS, AYU o CAM.</div></div>', botones: [{ texto: 'Volver' }, { texto: 'Crear categoría', clase: 'primario', alPulsar: () => toast('Categoría creada (simulado).') }] });

/* ---------- PR-11 Lista de activos ---------- */
const UBICS = () => D().ubicaciones;
ruta('activos', { id: 'PR-11', titulo: 'Activos', acceso: 'activos.ver', render(q) {
  return `${cabeceraPantalla('Activos', '<span class="id-pantalla">PR-11 · prioridad A</span>')}
  <p class="suave">Cada unidad física con número de serie. Los estados se escriben con texto; el color solo los refuerza.</p>
  ${listaHTML('activos', {
    datos: () => D().activos,
    campos: [{ k: 'q', etq: 'Buscar por serie, IMEI o código', tipo: 'texto', ph: '5CG3412H2Q' }, { k: 'est', etq: 'Estado', tipo: 'sel', op: () => ['En stock', 'Asignado', 'En reparación', 'Extraviado o robado', 'De baja'] }, { k: 'ub', etq: 'Ubicación', tipo: 'sel', op: UBICS }, { k: 'sku', etq: 'Artículo', tipo: 'sel', op: () => D().skus.filter((s) => s.control === 'serie').map((s) => s.cod) }],
    filtrar: (a, f) => contiene(f.q, a.serie, a.imei, a.sku) && (!f.est || a.estado === f.est) && (!f.ub || a.ubic === f.ub) && (!f.sku || a.sku === f.sku),
    cols: [{ t: 'Serie', k: (a) => `<a class="cod" href="#/activo?id=${a.id}">${esc(a.serie)}</a>` }, { t: 'Artículo', k: (a) => `<span class="cod">${a.sku}</span> ${esc(skuDe(a.sku).nombre)}` }, { t: 'Estado', k: (a) => chip(a.estado) + (a.pendienteDev ? ' ' + chip('Pendiente de devolución') : '') }, { t: 'Ubicación', k: (a) => ubicDe(a.ubic) }, { t: 'Responsable', k: (a) => nombrePersona(a.resp) }, { t: 'Garantía', k: (a) => chipGarantia(a.garantia) }]
  }, q.estado ? { est: q.estado } : null)}`;
} });

/* ---------- PR-12 Ficha del activo ---------- */
const ACTAS = [];
function activoDe(id) { return D().activos.find((a) => a.id === id); }
ruta('activo', { id: 'PR-12', titulo: 'Ficha del activo', acceso: 'activos.ver', render(q) {
  const a = activoDe(q.id);
  if (!a) return pantallaNoEncontrada();
  const s = skuDe(a.sku);
  const tab = q.tab || 'resumen';
  const os = D().ordenesServicio.filter((o) => o.activo === a.serie);
  const verCostos = valor('precios.ver') === 'T';
  const oc = a.oc ? D().ordenes.find((o) => o.num === a.oc) : null;
  const hist = [];
  if (a.resp) hist.push({ f: '23/10/2026', t: a.pendienteDev ? 'Asignado a ' + nombrePersona(a.resp) + ' (la persona fue cesada: pendiente de devolución)' : 'Entregado a ' + nombrePersona(a.resp), q: 'ACT-E-000123' });
  if (a.estado === 'En reparación') hist.push({ f: '17/10/2026', t: 'Pasó a En reparación', q: 'Motivo: pantalla con rayas' });
  hist.push({ f: a.compra, t: oc ? 'Ingresó por la recepción de ' + oc.num : 'Ingresó por importación del Excel', q: oc ? 'RCP-000031' : 'Lote IMP-000003' });
  const entrega = a.estado === 'En stock'
    ? btnAcc({ texto: 'Entregar', href: '#/entregar?activo=' + a.id, clase: 'primario', icono: 'siguiente', perm: 'entregas.crear' })
    : btnAcc({ texto: 'Entregar', perm: 'entregas.crear', bloqueo: 'Solo se entregan equipos En stock. Este equipo está «' + a.estado + '».' });
  const devolver = a.estado === 'Asignado' ? btnAcc({ texto: 'Devolver', href: '#/devolver?activo=' + a.id, icono: 'caja', perm: 'entregas.devolver' }) : '';
  const estado = btnAcc({ texto: 'Cambiar estado', acc: 'cambiar-estado', datos: { id: a.id }, perm: ['activos.cambiar_estado', 'activos.registrar_extravio', 'activos.dar_baja', 'activos.reingreso'] });
  return `${cabeceraPantalla(`<span class="cod">${esc(a.serie)}</span>`, entrega + devolver + estado + btnAcc({ texto: 'Corregir serie', acc: 'corregir-serie', datos: { id: a.id }, perm: 'activos.corregir_serie' }), '<a href="#/activos">Activos</a> › ' + esc(a.serie))}
  ${a.pendienteDev ? aviso('atencion', 'Pendiente de devolución', 'La persona responsable fue cesada el 30/09/2026 y el equipo sigue a su cargo. No es una baja ni un extravío: hay una tarea de salida abierta.') : ''}
  <div class="cab-ficha"><div class="fila">${chip(a.estado)} ${a.pendienteDev ? chip('Pendiente de devolución') : ''} ${chipGarantia(a.garantia)}<span class="id-pantalla">PR-12 · prioridad A</span></div>
  <dl class="datos"><div class="dato"><dt>Artículo</dt><dd><a href="#/sku?id=${s.cod}">${s.cod}</a> ${esc(s.nombre)}</dd></div><div class="dato"><dt>Responsable</dt><dd>${nombrePersona(a.resp)}</dd></div><div class="dato"><dt>Ubicación</dt><dd>${ubicDe(a.ubic)}</dd></div><div class="dato"><dt>Fecha de compra</dt><dd>${a.compra}</dd></div></dl></div>
  ${pestanas('act', [{ k: 'resumen', t: 'Resumen' }, { k: 'actas', t: 'Entregas y actas', n: a.resp ? 1 : 0 }, { k: 'servicio', t: 'Servicio', n: os.length }, { k: 'garantia', t: 'Garantía y contratos' }].concat(APP.modulos.mapa ? [{ k: 'relaciones', t: 'Relaciones' }] : []).concat(verCostos ? [{ k: 'costos', t: 'Costos' }] : []).concat([{ k: 'historial', t: 'Historial' }]), tab)}
  ${panel('act', 'resumen', tab, `<div class="rejilla dos"><section class="tarjeta"><h2>Datos del artículo</h2><dl class="lista-datos">${Object.entries(s.campos).map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('') || '<dt>—</dt><dd class="suave">Sin datos propios</dd>'}</dl></section>
  <section class="tarjeta"><h2>Datos de esta unidad</h2><dl class="lista-datos"><dt>Serie</dt><dd class="cod">${esc(a.serie)}</dd>${s.cod.startsWith('CEL') ? `<dt>IMEI</dt><dd>${a.imei ? `<span class="cod">${esc(a.imei)}</span>` : chip('Pendiente de completar') + ' <button class="btn chico" type="button" data-acc="completar-imei">Completar</button>'}</dd>` : ''}${s.cod.startsWith('LIC') ? `<dt>Clave de licencia</dt><dd><span class="secreto">${esc(a.clave)}</span> ${puede('licencias.ver_clave') ? '<button class="btn chico" type="button" data-acc="revelar-clave">' + icono('ojo') + ' Revelar</button>' : '<span class="suave chica">(sin permiso para verla completa)</span>'}</dd>` : ''}<dt>Orden de origen</dt><dd>${oc ? `<a class="cod" href="#/oc?id=${oc.num}">${oc.num}</a>` : 'Sin orden (viene del Excel)'}</dd></dl></section></div>`)}
  ${panel('act', 'actas', tab, a.resp ? tabla({ filas: [{ n: 'ACT-E-000123', p: a.resp, d: '23/10/2026', c: 'Nuevo', conf: 'Pendiente de firma' }], cols: [{ t: 'Acta', k: (f) => `<span class="cod">${f.n}</span>` }, { t: 'Persona', k: (f) => nombrePersona(f.p) }, { t: 'Desde', k: (f) => f.d }, { t: 'Condición', k: (f) => f.c }, { t: 'Conformidad', k: (f) => chip(f.conf) }, { t: 'Acta', sin: true, k: () => btnAcc({ texto: 'Imprimir acta', clase: 'chico', acc: 'imprimir-acta', icono: 'imprimir', perm: 'entregas.imprimir_acta' }) }] }) : vacio({ titulo: 'Sin entregas vigentes', texto: 'Este equipo no está asignado a nadie.', icono: 'caja' }))}
  ${panel('act', 'servicio', tab, `${tabla({ filas: os, vacio: { titulo: 'Sin órdenes de servicio', texto: 'Este equipo no tiene trabajos registrados.', icono: 'servicio' }, cols: [{ t: 'Orden', k: (o) => `<a class="cod" href="#/os?id=${o.num}">${o.num}</a>` }, { t: 'Tipo', k: (o) => esc(o.tipo) }, { t: 'Estado', k: (o) => chip(o.est) }] })}<p class="suave chica">Abrir o cerrar una orden de servicio no cambia el estado del equipo: el técnico lo cambia con «Cambiar estado».</p>${btnAcc({ texto: 'Pedir ayuda sobre este equipo', href: '#/pedir-ayuda', icono: 'ayuda' })}`)}
  ${panel('act', 'garantia', tab, `<dl class="lista-datos"><dt>Fin de garantía</dt><dd>${a.garantia} ${chipGarantia(a.garantia)}</dd><dt>Contrato de soporte</dt><dd>${APP.modulos.vencimientos ? '<span class="cod">CTR-000009</span> Soporte Dell Perú ' + chipEtq('Muestra de la Fase 2') : '<span class="suave">Módulo de contratos apagado</span>'}</dd></dl>`)}
  ${APP.modulos.mapa ? panel('act', 'relaciones', tab, `${aviso('info', 'Muestra de la Fase 3', 'Aquí se ve de qué depende este equipo y qué se afecta si falla.')}<ul><li>Asignado a: ${nombrePersona(a.resp)}</li><li>Usado por el servicio «Correo corporativo» (criticidad Alta)</li></ul>`) : ''}
  ${verCostos ? panel('act', 'costos', tab, `<dl class="lista-datos"><dt>Costo de compra</dt><dd>${dinero(a.costo, a.moneda)}</dd><dt>Orden</dt><dd>${a.oc || '—'}</dd></dl><p class="suave chica">Solo lo ven los roles con el permiso «Ver precios».</p>`) : ''}
  ${panel('act', 'historial', tab, `<ol class="linea">${hist.map((h) => `<li><strong>${h.t}</strong><div class="cuando">${h.f} · ${h.q}</div></li>`).join('')}</ol>`)}`;
} });
ACC['imprimir-acta'] = () => { APP.tmp.actaVista = true; location.hash = '#/acta?n=ACT-E-000123'; };
ACC['completar-imei'] = () => abrirDialogo({ titulo: 'Completar el IMEI', cuerpo: '<div class="campo"><label for="im">IMEI <span class="obligatorio">(15 dígitos)</span></label><input id="im" inputmode="numeric" maxlength="15" placeholder="356938035643809"></div>', botones: [{ texto: 'Volver' }, { texto: 'Guardar', clase: 'primario', alPulsar: () => toast('IMEI guardado (simulado).') }] });
ACC['revelar-clave'] = () => dialogoMotivo({ titulo: 'Revelar la clave de licencia', verbo: 'Revelar', etiqueta: 'Motivo de la consulta', texto: 'Se pedirá su segunda verificación. La clave se muestra 30 segundos y la consulta queda en la auditoría sin guardar la clave.', alConfirmar: () => toast('Clave revelada 30 segundos (simulado).') });
ACC['corregir-serie'] = (el) => {
  const a = activoDe(el.dataset.id);
  dialogoMotivo({ titulo: 'Corregir la serie', verbo: 'Corregir serie', etiqueta: 'Motivo de la corrección', texto: `Serie actual: <span class="cod">${esc(a.serie)}</span>. El historial guarda el valor anterior y el nuevo.`, extra: '<div class="campo"><label for="ns">Serie correcta <span class="obligatorio">(obligatorio)</span></label><input id="ns" type="text" maxlength="64"></div>', consecuencias: ['Las actas ya firmadas conservan la serie con que se firmaron.'], alConfirmar: () => toast('Serie corregida (simulado).') });
};

/* ---------- PR-14 Cambiar estado ---------- */
function opcionesEstado(a) {
  const e = a.estado, L = [];
  const add = (a2, ok, razon, perm, motivo) => { if (perm && !puede(perm)) return; L.push({ a: a2, ok, razon, motivo }); };
  if (e === 'En stock') {
    add('Asignado', false, 'Para asignar use «Entregar equipo».', 'entregas.crear');
    add('En reparación', true, '', 'activos.cambiar_estado', false);
    add('Extraviado o robado', true, '', 'activos.registrar_extravio', true);
    add('De baja', true, '', 'activos.dar_baja', true);
  } else if (e === 'Asignado') {
    add('En stock', false, 'Primero registre la devolución con «Devolver».', 'entregas.devolver');
    add('En reparación', true, '', 'activos.cambiar_estado', false);
    add('Extraviado o robado', true, '', 'activos.registrar_extravio', true);
    add('De baja', true, '', 'activos.dar_baja', true);
  } else if (e === 'En reparación') {
    add('En stock', true, '', 'activos.cambiar_estado', false);
    if (a.resp) add('Asignado', true, '', 'activos.cambiar_estado', false);
    add('Extraviado o robado', true, '', 'activos.registrar_extravio', true);
    add('De baja', true, '', 'activos.dar_baja', true);
  } else if (e === 'Extraviado o robado') {
    add('En stock', true, '', 'activos.reingreso', true);
    add('De baja', true, '', 'activos.dar_baja', true);
  } else {
    add('En stock', true, '', 'activos.reingreso', true);
  }
  return L;
}
ACC['cambiar-estado'] = (el) => {
  const a = activoDe(el.dataset.id);
  const L = opcionesEstado(a);
  abrirDialogo({ titulo: 'Cambiar estado del activo', ancho: false,
    cuerpo: `<p>Serie <span class="cod">${esc(a.serie)}</span> · estado actual: ${chip(a.estado)}</p><p class="suave chica">Solo se ofrecen los cambios permitidos para este estado y para su rol.</p>
    <fieldset><legend>Pasar a</legend>${L.length ? L.map((o, i) => `<div class="opcion"><input type="radio" name="nuevo-e" id="ne${i}" value="${i}" ${o.ok ? '' : 'disabled'}><label for="ne${i}">${chip(o.a)} ${o.motivo ? '<span class="suave chica">(pide motivo)</span>' : ''}${o.ok ? '' : `<span class="razon">${icono('info')}<span>${esc(o.razon)}</span></span>`}</label></div>`).join('') : '<p>Su rol no permite cambiar el estado.</p>'}</fieldset>
    <div class="campo"><label for="ne-m">Motivo <span class="obligatorio" id="ne-ob">(obligatorio en baja, extravío y reingreso; hasta 500 caracteres)</span></label><textarea id="ne-m" maxlength="500" style="min-height:80px;font-family:inherit"></textarea><div class="error" id="ne-e" hidden>${icono('alerta')}<span id="ne-et">Escriba el motivo para continuar.</span></div></div>`,
    botones: [{ texto: 'Volver' }, { texto: 'Cambiar estado', clase: 'primario', alPulsar: (d) => {
      const r = d.querySelector('input[name="nuevo-e"]:checked');
      const err = d.querySelector('#ne-e');
      if (!r) { err.hidden = false; d.querySelector('#ne-et').textContent = 'Elija a qué estado quiere pasarlo.'; return false; }
      const o = L[Number(r.value)];
      if (o.motivo && !d.querySelector('#ne-m').value.trim()) { err.hidden = false; d.querySelector('#ne-et').textContent = 'Escriba el motivo para continuar.'; d.querySelector('#ne-m').focus(); return false; }
      a.estado = o.a; if (['En stock', 'Extraviado o robado', 'De baja'].includes(o.a)) { a.resp = null; a.pendienteDev = false; }
      toast('El activo pasó a «' + o.a + '». Queda en el historial y en la auditoría.'); render(true);
    } }] });
};

/* ---------- Actas ---------- */
ruta('acta', { id: '', titulo: 'Acta de entrega', acceso: 'entregas.imprimir_acta', render(q) {
  const a = APP.tmp.ultimaActa || { n: q.n || 'ACT-E-000123', persona: 'PRS-0009', equipos: [{ serie: '5CG3419P4T', sku: 'LAP-0001', cond: 'Nuevo' }], tipo: 'Definitiva', acc: ['Cargador original'], obs: '' };
  const p = personaDe(a.persona);
  const nom = puede('datos_personales.ver') ? p.nombre : 'Datos personales ocultos (' + p.ref + ')';
  const area = puede('datos_personales.ver') ? p.area : '—';
  return `${cabeceraPantalla('Acta de entrega ' + a.n, `<button class="btn primario" type="button" onclick="window.print()">${icono('imprimir')} Imprimir o guardar en PDF</button><a class="btn" href="#/entregas">Volver</a>`)}
  <div class="acta"><h2>Acta de entrega de equipos</h2><p style="text-align:center;margin:0">${esc(E().nombre)} · N.º <strong>${a.n}</strong> · 25/10/2026 14:05</p>
  <p>Entregado a: <strong>${esc(nom)}</strong> (${p.ref}) · Área: ${esc(area)}<br>Entregado por: ${esc(R().persona)} · Tipo: ${a.tipo}${a.fechaDev ? ' · Devolución prevista: ' + a.fechaDev : ''}</p>
  <table><thead><tr><th>Artículo</th><th>Serie</th><th>Condición</th></tr></thead><tbody>${a.equipos.map((e) => `<tr><td>${esc(skuDe(e.sku).nombre)}</td><td>${esc(e.serie)}</td><td>${esc(e.cond)}</td></tr>`).join('')}</tbody></table>
  <p>Accesorios: ${a.acc.length ? esc(a.acc.join(', ')) : 'ninguno'}${a.obs ? '<br>Observaciones: ' + esc(a.obs) : ''}</p>
  <p>Declaro haber recibido los equipos descritos, en la condición indicada, y me comprometo a darles buen uso y a devolverlos cuando la empresa lo solicite.</p>
  <div class="firmas"><div>Firma de quien recibe</div><div>Firma de quien entrega</div></div>
  <p class="borrador-legal">Aviso de privacidad (TEXTO PROVISIONAL, pendiente de revisión legal): sus datos se usan solo para registrar quién tiene cada equipo.</p></div>`;
} });

/* ---------- PR-13 Entregar equipo ---------- */
function entInicial(q) { return { paso: 1, persona: '', equipos: q.activo ? [q.activo] : [], cond: {}, tipo: 'Definitiva', fechaDev: '', acc: [], obs: '', hecho: false }; }
ruta('entregar', { id: 'PR-13', titulo: 'Entregar equipo', acceso: 'entregas.crear', render(q) {
  if (!APP.tmp.ent || q.nuevo || APP.tmp.entQ !== (q.activo || '')) { APP.tmp.ent = entInicial(q); APP.tmp.entQ = q.activo || ''; }
  return `${cabeceraPantalla('Entregar equipo', '<span class="id-pantalla">PR-13 · prioridad A · un solo asistente «Entregar»</span>', '<a href="#/entregas">Entregas y devoluciones</a> › Entregar')}<div id="zona-ent">${pintarEnt()}</div>`;
} });
function pintarEnt() {
  const s = APP.tmp.ent;
  const pasos = ['Persona', 'Equipos', 'Condición y accesorios', 'Confirmar'];
  const cab = `<ol class="pasos" aria-label="Pasos">${pasos.map((p, i) => `<li ${s.paso === i + 1 ? 'aria-current="step"' : s.paso > i + 1 ? 'class="hecho"' : ''}>${p}</li>`).join('')}</ol><p class="suave chica">Borrador guardado automáticamente a las 14:07. Si la sesión se cierra, lo retoma después.</p>`;
  if (s.hecho) return cab.replace(/<ol[\s\S]*<\/ol>/, '') + aviso('exito', `Entrega registrada: ${s.acta}`, 'Los equipos pasaron a «Asignado», quedó el historial y se generó el acta para firmar en papel.') + `<div class="fila"><a class="btn primario" href="#/acta?n=${s.acta}">${icono('imprimir')} Ver e imprimir el acta</a><a class="btn" href="#/activos">Volver a Activos</a></div>`;
  let c = '';
  if (s.paso === 1) {
    const personas = D().personas.filter((p) => contiene(s.q, p.nombre, p.ref, p.area));
    c = `<h2>1. ¿A quién se entrega?</h2><div class="campo"><label for="ent-q">Buscar Persona <span class="obligatorio">(por nombre, referencia o área)</span></label><input id="ent-q" type="search" value="${esc(s.q || '')}" data-entrada="ent-q"></div>
    <div role="radiogroup" aria-label="Personas" class="pila">${personas.map((p) => { const cesada = p.estado !== 'Activa'; const propia = p.ref === R().ref; return `<div class="opcion"><input type="radio" name="ent-p" id="ep-${p.ref}" value="${p.ref}" ${s.persona === p.ref ? 'checked' : ''} ${cesada ? 'disabled' : ''} data-cambio="ent-p"><label for="ep-${p.ref}">${esc(p.nombre)} <span class="cod suave">${p.ref}</span> · ${esc(p.area)} ${cesada ? chip('Cesada') + ' <span class="razon">' + icono('info') + '<span>No recibe equipos: la Persona está cesada.</span></span>' : ''}</label></div>`; }).join('')}</div>
    <div id="ent-regla">${s.persona === R().ref ? aviso('alerta', 'No se puede por una regla', 'Nadie puede entregarse un equipo a sí mismo, ni siquiera el Administrador. Elija a otra Persona.') : ''}</div>
    <details style="margin:12px 0"><summary>¿La Persona no está en la lista? Alta rápida</summary><div class="fila-form" style="margin-top:8px"><div class="campo"><label for="ar-n">Nombre</label><input id="ar-n" type="text"></div><div class="campo"><label for="ar-a">Área</label><input id="ar-a" type="text"></div></div><button type="button" class="btn chico" data-acc="alta-rapida">Crear Persona</button><p class="suave chica">Basta el nombre y el área. No se pide documento de identidad, dirección ni teléfono personal.</p></details>
    <button class="btn primario" type="button" data-acc="ent-sig" ${s.persona && s.persona !== R().ref ? '' : 'aria-disabled="true"'}>Continuar</button>`;
  } else if (s.paso === 2) {
    const stock = D().activos.filter((a) => a.estado === 'En stock' && a.sku && skuDe(a.sku).control === 'serie' && contiene(s.q2, a.serie, a.sku));
    c = `<h2>2. ¿Qué equipos se entregan?</h2><p class="suave">Solo se entregan equipos <strong>En stock</strong>. Los demás no aparecen.</p><div class="campo"><label for="ent-q2">Buscar por serie o código</label><input id="ent-q2" type="search" value="${esc(s.q2 || '')}" data-entrada="ent-q2"></div>
    <div class="pila">${stock.map((a) => `<div class="opcion"><input type="checkbox" id="eq-${a.id}" value="${a.id}" ${s.equipos.includes(a.id) ? 'checked' : ''} data-cambio="ent-eq"><label for="eq-${a.id}"><span class="cod">${esc(a.serie)}</span> · ${esc(skuDe(a.sku).nombre)} · ${ubicDe(a.ubic)}</label></div>`).join('') || vacio({ titulo: 'No hay equipos En stock con ese texto', texto: 'Cambie la búsqueda.' })}</div>
    <div class="fila" style="margin-top:12px"><button class="btn" type="button" data-acc="ent-atras">Atrás</button><button class="btn primario" type="button" data-acc="ent-sig" ${s.equipos.length ? '' : 'aria-disabled="true"'}>Continuar (${s.equipos.length} seleccionados)</button></div>`;
  } else if (s.paso === 3) {
    c = `<h2>3. Condición, accesorios y tipo</h2>
    ${s.equipos.map((id) => { const a = activoDe(id); const cd = s.cond[id] || 'Nuevo'; return `<fieldset><legend><span class="cod">${esc(a.serie)}</span></legend><div class="campo"><label for="cd-${id}">Condición del equipo <span class="obligatorio">(obligatorio)</span></label><select id="cd-${id}" data-cambio="ent-cond" data-id="${id}">${['Nuevo', 'Bueno', 'Con detalles', 'Dañado'].map((x) => `<option ${cd === x ? 'selected' : ''}>${x}</option>`).join('')}</select>${cd === 'Dañado' ? `<div class="error">${icono('alerta')}<span>No se puede por una regla: un equipo dañado no se entrega. Envíelo a reparación o a baja.</span></div>` : ''}${cd === 'Con detalles' ? `<div class="campo" style="margin-top:8px"><label for="ob-${id}">Describa los detalles <span class="obligatorio">(obligatorio)</span></label><input id="ob-${id}" type="text" data-entrada="ent-obs-eq" data-id="${id}" value="${esc(s.obsEq && s.obsEq[id] || '')}"></div>` : ''}</div></fieldset>`; }).join('')}
    <fieldset><legend>Tipo de entrega</legend><div class="opcion"><input type="radio" name="ent-t" id="t1" value="Definitiva" ${s.tipo === 'Definitiva' ? 'checked' : ''} data-cambio="ent-tipo"><label for="t1">Definitiva</label></div><div class="opcion"><input type="radio" name="ent-t" id="t2" value="Préstamo" ${s.tipo === 'Préstamo' ? 'checked' : ''} data-cambio="ent-tipo"><label for="t2">Préstamo con fecha de devolución prevista</label></div>${s.tipo === 'Préstamo' ? `<div class="campo"><label for="fd">Devolución prevista <span class="obligatorio">(obligatoria, hasta 365 días)</span></label><input id="fd" type="date" min="2026-10-25" max="2027-10-25" value="${esc(s.fechaDev)}" data-cambio="ent-fecha"></div>` : ''}</fieldset>
    <fieldset><legend>Accesorios</legend>${['Cargador original', 'Funda', 'Mouse inalámbrico (del stock: sale 1)', 'Teclado USB (del stock: sale 1)'].map((x, i) => `<div class="opcion"><input type="checkbox" id="ac${i}" value="${esc(x)}" ${s.acc.includes(x) ? 'checked' : ''} data-cambio="ent-acc"><label for="ac${i}">${x}</label></div>`).join('')}</fieldset>
    <div class="campo"><label for="ent-ob">Observaciones <span class="obligatorio">(opcional, hasta 1.000 caracteres)</span></label><input id="ent-ob" type="text" value="${esc(s.obs)}" data-entrada="ent-obs"></div>
    <div id="ent-e3"></div><div class="fila"><button class="btn" type="button" data-acc="ent-atras">Atrás</button><button class="btn primario" type="button" data-acc="ent-sig">Continuar</button></div>`;
  } else {
    const p = personaDe(s.persona);
    c = `<h2>4. Confirme la entrega</h2><div class="tarjeta"><dl class="lista-datos"><dt>Entregar a</dt><dd>${esc(p.nombre)} <span class="cod">${p.ref}</span> · ${esc(p.area)}</dd><dt>Equipos</dt><dd>${s.equipos.map((id) => { const a = activoDe(id); return `<span class="cod">${esc(a.serie)}</span> (${esc(s.cond[id] || 'Nuevo')})`; }).join(', ')}</dd><dt>Tipo</dt><dd>${s.tipo}${s.tipo === 'Préstamo' ? ' hasta ' + isoF(s.fechaDev) : ''}</dd><dt>Accesorios</dt><dd>${s.acc.length ? esc(s.acc.join(', ')) : 'Ninguno'}</dd><dt>Entrega</dt><dd>${esc(R().persona)}</dd></dl></div>
    ${aviso('info', 'Qué pasará al confirmar', '<ul><li>Los equipos pasan a «Asignado» y se genera el acta <span class="cod">ACT-E-000124</span> para firmar en papel.</li><li>Es todo o nada: si un equipo falla, no se registra ninguno.</li><li>Un doble clic no la registra dos veces.</li></ul>')}
    <div class="fila"><button class="btn" type="button" data-acc="ent-atras">Atrás</button><button class="btn primario" type="button" id="btn-ent-ok" data-acc="ent-ok">Confirmar entrega</button></div>`;
  }
  return cab + c;
}
function refEnt() { const z = document.getElementById('zona-ent'); z.innerHTML = pintarEnt(); const h = z.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
ENTRADA['ent-q'] = (el) => { const pos = el.selectionStart; APP.tmp.ent.q = el.value; const z = document.getElementById('zona-ent'); z.innerHTML = pintarEnt(); const n = document.getElementById('ent-q'); n.focus(); n.setSelectionRange(pos, pos); };
ENTRADA['ent-q2'] = (el) => { const pos = el.selectionStart; APP.tmp.ent.q2 = el.value; const z = document.getElementById('zona-ent'); z.innerHTML = pintarEnt(); const n = document.getElementById('ent-q2'); n.focus(); n.setSelectionRange(pos, pos); };
CAMBIO['ent-p'] = (el) => { APP.tmp.ent.persona = el.value; const z = document.getElementById('zona-ent'); z.innerHTML = pintarEnt(); const r = document.getElementById('ep-' + el.value); if (r) r.focus(); };
CAMBIO['ent-eq'] = (el) => { const s = APP.tmp.ent; s.equipos = el.checked ? [...new Set([...s.equipos, el.value])] : s.equipos.filter((x) => x !== el.value); const z = document.getElementById('zona-ent'); z.innerHTML = pintarEnt(); const r = document.getElementById('eq-' + el.value); if (r) r.focus(); };
CAMBIO['ent-cond'] = (el) => { APP.tmp.ent.cond[el.dataset.id] = el.value; const z = document.getElementById('zona-ent'); z.innerHTML = pintarEnt(); const r = document.getElementById('cd-' + el.dataset.id); if (r) r.focus(); };
ENTRADA['ent-obs-eq'] = (el) => { const s = APP.tmp.ent; s.obsEq = s.obsEq || {}; s.obsEq[el.dataset.id] = el.value; };
CAMBIO['ent-tipo'] = (el) => { APP.tmp.ent.tipo = el.value; const z = document.getElementById('zona-ent'); z.innerHTML = pintarEnt(); document.getElementById(el.id).focus(); };
CAMBIO['ent-fecha'] = (el) => { APP.tmp.ent.fechaDev = el.value; };
CAMBIO['ent-acc'] = (el) => { const s = APP.tmp.ent; s.acc = el.checked ? [...s.acc, el.value] : s.acc.filter((x) => x !== el.value); };
ENTRADA['ent-obs'] = (el) => { APP.tmp.ent.obs = el.value; };
ACC['alta-rapida'] = () => {
  const n = document.getElementById('ar-n').value.trim(), a = document.getElementById('ar-a').value.trim();
  if (!n || !a) { toast('Escriba el nombre y el área.', 'alerta'); return; }
  const ref = 'PRS-' + String(D().personas.length + 1).padStart(4, '0');
  D().personas.push({ ref, nombre: n, tipo: 'Empleado', area: a, puesto: '', estado: 'Activa', vinculo: '', correo: '', ingreso: '25/10/2026' });
  APP.tmp.ent.persona = ref; APP.tmp.ent.q = n; toast('Persona creada: <span class="cod">' + ref + '</span>.'); refEnt();
};
ACC['ent-atras'] = () => { APP.tmp.ent.paso--; refEnt(); };
ACC['ent-sig'] = (el) => {
  const s = APP.tmp.ent;
  if (el.getAttribute('aria-disabled') === 'true') return;
  if (s.paso === 3) {
    const err = [];
    s.equipos.forEach((id) => { const c = s.cond[id] || 'Nuevo'; if (c === 'Dañado') err.push('El equipo ' + activoDe(id).serie + ' está dañado y no se puede entregar.'); if (c === 'Con detalles' && !(s.obsEq && s.obsEq[id])) err.push('Describa los detalles del equipo ' + activoDe(id).serie + '.'); });
    if (s.tipo === 'Préstamo' && !s.fechaDev) err.push('Indique la fecha de devolución prevista.');
    if (err.length) { document.getElementById('ent-e3').innerHTML = aviso('alerta', 'Revise antes de continuar', '<ul>' + err.map((x) => '<li>' + esc(x) + '</li>').join('') + '</ul>'); return; }
  }
  s.paso++; refEnt();
};
ACC['ent-ok'] = (el) => {
  el.setAttribute('aria-disabled', 'true'); el.textContent = 'Registrando…';
  const s = APP.tmp.ent;
  setTimeout(() => {
    const n = 'ACT-E-' + String(124 + ACTAS.length).padStart(6, '0');
    s.equipos.forEach((id) => { const a = activoDe(id); a.estado = 'Asignado'; a.resp = s.persona; });
    ACTAS.push(n); s.hecho = true; s.acta = n;
    APP.tmp.ultimaActa = { n, persona: s.persona, equipos: s.equipos.map((id) => ({ serie: activoDe(id).serie, sku: activoDe(id).sku, cond: s.cond[id] || 'Nuevo' })), tipo: s.tipo, fechaDev: s.fechaDev ? isoF(s.fechaDev) : '', acc: s.acc, obs: s.obs };
    toast('Entrega registrada: <span class="cod">' + n + '</span>'); refEnt();
  }, 400);
};

/* ---------- Entregas (lista de actas) y PR-30 Devolver ---------- */
ruta('entregas', { id: '', titulo: 'Entregas y devoluciones', acceso: 'entregas.ver', render() {
  const filas = [['ACT-E-000123', 'PRS-0009', '5CG3419P4T', '23/10/2026', 'Pendiente de firma'], ['ACT-E-000122', 'PRS-0007', '5CG3410R7M', '19/10/2026', 'Firmada en papel'], ['ACT-D-000045', 'PRS-0012', 'PF3H8K21', '30/09/2026', 'Firmada en papel'], ['ACT-E-000121', 'PRS-0011', 'R58W1A2B3C5', '12/09/2026', 'Firmada en papel']].concat(ACTAS.map((n) => [n, APP.tmp.ultimaActa.persona, APP.tmp.ultimaActa.equipos[0].serie, '25/10/2026', 'Pendiente de firma']));
  return `${cabeceraPantalla('Entregas y devoluciones', btnAcc({ texto: 'Entregar equipo', href: '#/entregar?nuevo=1', clase: 'primario', icono: 'siguiente', perm: 'entregas.crear' }) + btnAcc({ texto: 'Devolver equipo', href: '#/devolver', icono: 'caja', perm: 'entregas.devolver' }))}
  ${aviso('atencion', '1 acta sin firma hace más de 7 días', 'El acta ACT-E-000123 sigue pendiente de firma en papel.')}
  <div class="barra-herr">${btnExportar()}</div>
  ${tabla({ filas, cols: [{ t: 'Acta', k: (f) => `<a class="cod" href="#/acta?n=${f[0]}">${f[0]}</a>` }, { t: 'Persona', k: (f) => nombrePersona(f[1]) }, { t: 'Equipo', k: (f) => `<span class="cod">${f[2]}</span>` }, { t: 'Fecha', k: (f) => f[3] }, { t: 'Conformidad', k: (f) => chip(f[4]) }] })}`;
} });
ruta('devolver', { id: 'PR-30', prio: 'B', titulo: 'Devolver o traspasar', acceso: 'entregas.devolver', render(q) {
  const asign = D().activos.filter((a) => a.estado === 'Asignado');
  const a0 = q.activo || (asign[0] && asign[0].id);
  return `${cabeceraPantalla('Devolver o traspasar equipo', '<span class="id-pantalla">PR-30 · prioridad B</span>')}
  <form data-form="devolver" novalidate class="tarjeta" style="max-width:680px"><div class="campo"><label for="dv-a">Equipo que vuelve <span class="obligatorio">(obligatorio)</span></label><select id="dv-a">${asign.map((a) => `<option value="${a.id}" ${a.id === a0 ? 'selected' : ''}>${esc(a.serie)} · ${personaDe(a.resp) && puede('datos_personales.ver') ? esc(personaDe(a.resp).nombre) : a.resp}</option>`).join('')}</select></div>
  <div class="fila-form"><div class="campo"><label for="dv-c">Condición al volver</label><select id="dv-c" data-cambio="dv-c">${['Bueno', 'Con detalles', 'Dañado'].map((x) => `<option>${x}</option>`).join('')}</select></div><div class="campo"><label for="dv-d">Pasa a</label><select id="dv-d"><option>En stock</option><option>En reparación</option><option>De baja</option></select><div class="ayuda">Un equipo dañado solo puede ir a reparación o a baja.</div></div><div class="campo"><label for="dv-u">Ubicación de retorno <span class="obligatorio">(obligatoria)</span></label><select id="dv-u">${D().ubicaciones.map((u) => `<option>${esc(u)}</option>`).join('')}</select></div></div>
  <div id="dv-e"></div><div class="fila"><button class="btn primario" type="submit">Registrar devolución</button><button class="btn" type="button" data-acc="traspaso">Traspasar a otra Persona en un solo acto</button></div></form>`;
} });
ACC['form-devolver'] = () => {
  const c = document.getElementById('dv-c').value, d = document.getElementById('dv-d').value;
  if (c === 'Dañado' && d === 'En stock') { document.getElementById('dv-e').innerHTML = aviso('alerta', 'No se puede por una regla', 'Un equipo dañado no vuelve al stock. Elija «En reparación» o «De baja».'); return; }
  const a = activoDe(document.getElementById('dv-a').value); a.estado = d; a.resp = d === 'De baja' ? null : (d === 'En reparación' ? a.resp : null); a.pendienteDev = false;
  toast('Devolución registrada. El equipo quedó «' + d + '».'); location.hash = '#/activos';
};
ACC.traspaso = () => abrirDialogo({ titulo: 'Traspasar a otra Persona', cuerpo: '<p>La devolución y la nueva entrega se registran juntas o no se registra ninguna. La condición se anota una sola vez.</p><div class="campo"><label for="tp">Nueva Persona</label><select id="tp">' + D().personas.filter((p) => p.estado === 'Activa').map((p) => `<option>${esc(p.nombre)} (${p.ref})</option>`).join('') + '</select></div>', botones: [{ texto: 'Volver' }, { texto: 'Traspasar', clase: 'primario', alPulsar: () => toast('Traspaso registrado (simulado).') }] });

/* ---------- PR-15 Personas y PR-32 ficha ---------- */
ruta('personas', { id: 'PR-15', titulo: 'Personas', acceso: () => valor('personas.ver') === 'T', render() {
  return `${cabeceraPantalla('Personas', btnAcc({ texto: 'Nueva Persona', acc: 'persona-nueva', clase: 'primario', icono: 'mas', perm: 'personas.crear_editar' }) + '<span class="id-pantalla">PR-15 · prioridad A</span>')}
  <p class="suave">Las Personas reciben equipos y pueden no tener cuenta en la plataforma. ${puede('datos_personales.ver') ? '' : '<strong>Su rol no tiene «Ver datos personales»: se muestran solo las referencias.</strong>'}</p>
  ${listaHTML('personas', {
    datos: () => D().personas,
    campos: [{ k: 'q', etq: 'Buscar', tipo: 'texto', ph: puede('datos_personales.ver') ? 'Nombre, referencia o área' : 'Referencia (PRS-0000)' }, { k: 'est', etq: 'Estado', tipo: 'sel', op: () => ['Activa', 'Cesada'] }, { k: 'area', etq: 'Área', tipo: 'sel', op: () => [...new Set(D().personas.map((p) => p.area))] }],
    filtrar: (p, f) => contiene(f.q, p.ref, puede('datos_personales.ver') ? p.nombre : '', p.area) && (!f.est || p.estado === f.est) && (!f.area || p.area === f.area),
    cols: [{ t: 'Referencia', k: (p) => `<a class="cod" href="#/persona?id=${p.ref}">${p.ref}</a>` }, { t: 'Nombre', k: (p) => puede('datos_personales.ver') ? esc(p.nombre) : oculto(p.ref) }, { t: 'Tipo', k: (p) => p.tipo }, { t: 'Área', k: (p) => esc(p.area) }, { t: 'Estado', k: (p) => chip(p.estado) }, { t: 'Equipos a cargo', cls: 'num', k: (p) => D().activos.filter((a) => a.resp === p.ref).length }, { t: 'Cuenta de usuario', k: (p) => p.vinculo ? esc(p.vinculo) : '<span class="suave">Sin cuenta</span>' }]
  })}`;
} });
ACC['persona-nueva'] = () => abrirDialogo({ titulo: 'Nueva Persona', cuerpo: '<div class="campo"><label for="pn-n">Nombre completo <span class="obligatorio">(obligatorio, hasta 120 caracteres)</span></label><input id="pn-n" type="text"></div><div class="fila-form"><div class="campo"><label for="pn-t">Tipo</label><select id="pn-t"><option>Empleado</option><option>Externo</option><option>Custodio</option></select></div><div class="campo"><label for="pn-a">Área <span class="obligatorio">(obligatoria)</span></label><input id="pn-a" type="text"></div></div><div class="campo"><label for="pn-c">Correo <span class="obligatorio">(opcional)</span></label><input id="pn-c" type="email"></div><p class="suave chica">No se pide documento de identidad, dirección ni teléfono personal. Si ya existe alguien con el mismo nombre, se le avisará para que confirme.</p>', botones: [{ texto: 'Volver' }, { texto: 'Crear Persona', clase: 'primario', alPulsar: (d) => { const n = d.querySelector('#pn-n'), a = d.querySelector('#pn-a'); if (!n.value.trim() || !a.value.trim()) { (n.value.trim() ? a : n).focus(); n.setAttribute('aria-invalid', String(!n.value.trim())); a.setAttribute('aria-invalid', String(!a.value.trim())); return false; } D().personas.push({ ref: 'PRS-' + String(D().personas.length + 1).padStart(4, '0'), nombre: n.value.trim(), tipo: d.querySelector('#pn-t').value, area: a.value.trim(), puesto: '', estado: 'Activa', vinculo: '', correo: d.querySelector('#pn-c').value, ingreso: '25/10/2026' }); toast('Persona creada.'); render(true); } }] });
ruta('persona', { id: 'PR-32', prio: 'B', titulo: 'Ficha de la persona', acceso: () => valor('personas.ver') === 'T', render(q) {
  const p = personaDe(q.id);
  if (!p) return pantallaNoEncontrada();
  const eq = D().activos.filter((a) => a.resp === p.ref);
  const verDatos = puede('datos_personales.ver');
  return `${cabeceraPantalla(verDatos ? esc(p.nombre) : oculto(p.ref), btnAcc({ texto: 'Registrar cese', acc: 'cesar', datos: { ref: p.ref }, clase: 'peligro', perm: 'personas.cesar' }) + (p.estado === 'Cesada' ? btnAcc({ texto: 'Anonimizar', perm: 'personas.anonimizar', bloqueo: eq.length ? 'No se puede anonimizar mientras tenga equipos pendientes: primero devolución, extravío o baja con motivo.' : 'La anonimización automática está apagada hasta que legal confirme los plazos; la manual la proponen y ejecutan dos personas.' }) : ''), '<a href="#/personas">Personas</a> › ' + p.ref)}
  <div class="cab-ficha"><div class="fila">${chip(p.estado)} <span class="cod">${p.ref}</span><span class="id-pantalla">PR-32 · prioridad B</span></div><dl class="datos"><div class="dato"><dt>Tipo</dt><dd>${p.tipo}</dd></div><div class="dato"><dt>Área</dt><dd>${esc(p.area)}</dd></div><div class="dato"><dt>Puesto</dt><dd>${verDatos ? esc(p.puesto || '—') : '—'}</dd></div><div class="dato"><dt>Correo</dt><dd>${verDatos ? esc(p.correo || '—') : oculto(p.ref)}</dd></div><div class="dato"><dt>Cuenta de usuario</dt><dd>${p.vinculo || 'Sin cuenta'}</dd></div></dl></div>
  ${p.estado === 'Cesada' && eq.length ? aviso('atencion', 'Pendientes de la persona', `Cesada el ${p.cese}. Tiene ${eq.length} equipo(s) con la marca «pendiente de devolución». El cese no se bloquea, pero no se podrá anonimizar hasta cerrar estos pendientes.`) : ''}
  <section class="tarjeta"><h2>Equipos a cargo (${eq.length})</h2>${tabla({ filas: eq, vacio: { titulo: 'Sin equipos a cargo', texto: 'Esta persona no tiene equipos.', icono: 'caja' }, cols: [{ t: 'Serie', k: (a) => `<a class="cod" href="#/activo?id=${a.id}">${esc(a.serie)}</a>` }, { t: 'Artículo', k: (a) => esc(skuDe(a.sku).nombre) }, { t: 'Estado', k: (a) => chip(a.estado) + (a.pendienteDev ? ' ' + chip('Pendiente de devolución') : '') }] })}</section>`;
} });
ACC.cesar = (el) => {
  const p = personaDe(el.dataset.ref), eq = D().activos.filter((a) => a.resp === p.ref);
  dialogoMotivo({ titulo: 'Registrar el cese de ' + (puede('datos_personales.ver') ? esc(p.nombre) : p.ref), verbo: 'Registrar cese', destructivo: true, motivos: ['Salida de la empresa', 'Fin de contrato o servicio', 'Traslado'], etiqueta: 'Detalle del cese', texto: eq.length ? `Tiene ${eq.length} equipo(s) a cargo: ${eq.map((a) => esc(a.serie)).join(', ')}.` : 'No tiene equipos a cargo.', consecuencias: ['El cese nunca se bloquea por los equipos.', 'Los equipos asignados quedan con la marca «pendiente de devolución» (no es baja ni extravío).', 'Se crea una tarea de salida y se avisa a Jefatura TI.', p.vinculo ? 'Su usuario solo se suspende si usted además tiene el permiso «Suspender usuarios».' : 'No tiene cuenta de usuario.'], alConfirmar: () => { p.estado = 'Cesada'; p.cese = '25/10/2026'; eq.forEach((a) => { a.pendienteDev = true; }); toast('Cese registrado. Los equipos quedaron «pendientes de devolución».'); render(true); } });
};

/* ---------- PR-16 Importar Excel ---------- */
const FILAS_IMP = (() => { const f = []; for (let i = 1; i <= 100; i++) f.push(['LAP-0001', '5CG36' + String(1000 + i * 7), i % 9 ? 'En stock' : 'Asignado', 'Lima > Bodega Central']); return f; })();
ruta('importar', { id: 'PR-16', titulo: 'Importar datos', acceso: 'datos.importar', render() {
  const s = (APP.tmp.imp = APP.tmp.imp || { paso: 1, tipo: 'Activos', archivo: '' });
  const pasos = ['Elegir tipo y plantilla', 'Subir el archivo', 'Vista previa', 'Resultado'];
  return `${cabeceraPantalla('Importar datos', '<span class="id-pantalla">PR-16 · prioridad A · un solo asistente para todo</span>')}
  ${aviso('sensible', 'Permiso sensible', 'Importar exige segunda verificación reciente y queda en la auditoría. La empresa se toma de su sesión; si el archivo trae una columna de empresa, se ignora.')}
  <ol class="pasos">${pasos.map((p, i) => `<li ${s.paso === i + 1 ? 'aria-current="step"' : s.paso > i + 1 ? 'class="hecho"' : ''}>${p}</li>`).join('')}</ol><div id="zona-imp">${pintarImp()}</div>`;
} });
function pintarImp() {
  const s = APP.tmp.imp;
  if (s.paso === 1) return `<div class="tarjeta"><h2>1. ¿Qué va a importar?</h2><div class="campo"><label for="imp-t">Tipo de datos</label><select id="imp-t" data-cambio="imp-tipo">${['Activos y stock inicial', 'Personas', 'Contratos de licencia (Fase 2)', 'Líneas móviles (Fase 2)', 'Dominios y certificados (Fase 3)', 'Maestros de SAP (Fase 3)'].map((x) => `<option ${s.tipo === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    <p>Descargue la plantilla con las columnas fijas, llénela y súbala en el paso siguiente.</p><ul class="suave"><li>Solo archivos .xlsx o .csv, hasta 5.000 filas y 10 MB.</li><li>Las celdas que empiezan con = + - @ se tratan como texto.</li><li>No se guarda nada hasta que usted confirme.</li></ul>
    <div class="fila"><button class="btn" type="button" data-acc="imp-plantilla">${icono('descargar')} Descargar plantilla</button><button class="btn primario" type="button" data-acc="imp-ir" data-p="2">Ya tengo el archivo</button></div></div>`;
  if (s.paso === 2) return `<div class="tarjeta"><h2>2. Suba el archivo</h2><p>En el prototipo no se sube un archivo real. Elija un archivo de ejemplo:</p><div class="pila"><button class="btn" type="button" data-acc="imp-cargar" data-a="malo">Archivo de ejemplo con 3 errores</button><button class="btn" type="button" data-acc="imp-cargar" data-a="bueno">Archivo de ejemplo correcto</button></div><div class="fila" style="margin-top:12px"><button class="btn" type="button" data-acc="imp-ir" data-p="1">Atrás</button></div></div>`;
  if (s.paso === 3) {
    const malo = s.archivo === 'malo';
    const errs = malo ? [[14, 'Artículo', 'El artículo «LAP-0099» no existe. Créelo antes o corrija el código.'], [37, 'Serie', 'La serie «5CG3499K1L» está repetida en este archivo (también en la fila 22).'], [58, 'Ubicación', 'La ubicación es obligatoria y está vacía.']] : [];
    const avisos = [[71, 'Serie', '«3,5E+14» parece una serie dañada por Excel (notación científica). Revísela en el archivo original.']];
    const nuevos = ['Marca «Brother» (nueva)', 'Ubicación «Cusco › Oficina» (nueva)'];
    return `<div class="tarjeta"><h2>3. Vista previa (nada se ha guardado)</h2><div class="fila"><strong>${s.tipo}</strong>${chip(malo ? 'Con errores' : 'Hecho')}</div>
    <div class="rejilla"><div class="tarjeta"><div class="cifra">100</div><div class="cifra-etq">filas leídas</div></div><div class="tarjeta"><div class="cifra">${100 - errs.length}</div><div class="cifra-etq">filas correctas</div></div><div class="tarjeta"><div class="cifra">${errs.length}</div><div class="cifra-etq">filas con error</div></div></div>
    ${errs.length ? aviso('alerta', 'No se puede confirmar mientras haya errores', 'La importación es todo o nada: si una fila tiene error, no se carga nada. Corrija el archivo y vuelva a subirlo.') : aviso('exito', 'Todas las filas son correctas', 'Puede confirmar. Si vuelve a subir el mismo archivo, no se duplica lo ya cargado.')}
    ${errs.length ? `<h3>Errores</h3>${tabla({ filas: errs, cols: [{ t: 'Fila', cls: 'num', k: (e) => e[0] }, { t: 'Columna', k: (e) => e[1] }, { t: 'Qué pasa y qué hacer', k: (e) => esc(e[2]) }], claseFila: () => 'fila-error' })}` : ''}
    <h3>Avisos (no impiden confirmar)</h3>${tabla({ filas: avisos, cols: [{ t: 'Fila', cls: 'num', k: (e) => e[0] }, { t: 'Columna', k: (e) => e[1] }, { t: 'Aviso', k: (e) => esc(e[2]) }], claseFila: () => 'fila-aviso' })}
    <h3>Valores nuevos que usted debe aprobar</h3><p class="suave chica">No se crean solos: se listan para aprobarlos de una vez.</p><div class="pila">${nuevos.map((n, i) => `<div class="opcion"><input type="checkbox" id="nv${i}" checked><label for="nv${i}">${n}</label></div>`).join('')}</div>
    <h3>Primeras filas</h3>${tabla({ filas: FILAS_IMP.slice(0, 4), cols: [{ t: 'Artículo', k: (f) => f[0] }, { t: 'Serie', k: (f) => `<span class="cod">${f[1]}</span>` }, { t: 'Estado', k: (f) => chip(f[2]) }, { t: 'Ubicación', k: (f) => ubicDe(f[3]) }] })}
    <div class="fila" style="margin-top:16px"><button class="btn" type="button" data-acc="imp-ir" data-p="2">Corregir y volver a subir</button>${errs.length ? `<button class="btn" type="button" data-acc="imp-errores">${icono('descargar')} Descargar reporte de errores</button>` : ''}${btnAcc({ texto: 'Confirmar importación', clase: 'primario', acc: 'imp-ok', bloqueo: errs.length ? 'Hay ' + errs.length + ' filas con error: corríjalas primero.' : '' })}</div></div>`;
  }
  return `<div class="tarjeta">${aviso('exito', 'Importación terminada', 'Lote <span class="cod">IMP-000007</span>: 100 filas cargadas por ' + esc(R().persona) + ' el 25/10/2026 14:12. Quedó en la auditoría.')}<p>Puede <strong>deshacer el lote completo</strong> mientras ninguno de sus activos tenga movimientos posteriores.</p><div class="fila"><button class="btn peligro" type="button" data-acc="imp-deshacer">Deshacer el lote</button><button class="btn" type="button" data-acc="imp-reiniciar">Importar otro archivo</button><a class="btn primario" href="#/activos">Ver los activos</a></div></div>`;
}
function refImp() { document.getElementById('zona-imp').innerHTML = pintarImp(); document.querySelectorAll('.pasos li').forEach((li, i) => { const p = APP.tmp.imp.paso; li.removeAttribute('aria-current'); li.className = p > i + 1 ? 'hecho' : ''; if (p === i + 1) li.setAttribute('aria-current', 'step'); }); const h = document.querySelector('#zona-imp h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); } }
CAMBIO['imp-tipo'] = (el) => { APP.tmp.imp.tipo = el.value; };
ACC['imp-ir'] = (el) => { APP.tmp.imp.paso = Number(el.dataset.p); refImp(); };
ACC['imp-cargar'] = (el) => { APP.tmp.imp.archivo = el.dataset.a; APP.tmp.imp.paso = 3; refImp(); };
ACC['imp-ok'] = () => { APP.tmp.imp.paso = 4; refImp(); };
ACC['imp-reiniciar'] = () => { APP.tmp.imp = { paso: 1, tipo: 'Activos', archivo: '' }; render(true); };
ACC['imp-plantilla'] = () => descargar('plantilla-activos.csv', 'articulo;serie;estado;ubicacion;fecha_compra;fin_garantia\nLAP-0001;5CG0000000;En stock;Lima > Bodega Central;15/03/2024;14/03/2027\n');
ACC['imp-errores'] = () => descargar('reporte-errores.csv', 'fila;columna;motivo\n14;Artículo;El artículo LAP-0099 no existe\n37;Serie;Serie repetida en el archivo (también en la fila 22)\n58;Ubicación;La ubicación es obligatoria\n');
ACC['imp-deshacer'] = () => dialogoMotivo({ titulo: 'Deshacer el lote IMP-000007', verbo: 'Deshacer el lote', destructivo: true, consecuencias: ['Se anulan las 100 filas cargadas con un movimiento contrario.', 'Ningún activo se borra: queda el rastro en la auditoría.'], alConfirmar: () => { APP.tmp.imp = { paso: 1, tipo: 'Activos', archivo: '' }; toast('Lote deshecho (simulado).'); render(true); } });
function descargar(nombre, texto) { const b = new Blob(['﻿' + texto], { type: 'text/csv;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = nombre; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000); toast('Archivo «' + nombre + '» descargado.'); }

/* ---------- PR-31 Stock ---------- */
ruta('stock', { id: 'PR-31', prio: 'B', titulo: 'Stock por cantidad', acceso: 'activos.ver', render() {
  return `${cabeceraPantalla('Stock por cantidad', btnAcc({ texto: 'Ingreso', acc: 'mov', datos: { t: 'Ingreso' }, icono: 'mas', perm: 'stock.mover' }) + btnAcc({ texto: 'Salida', acc: 'mov', datos: { t: 'Salida' }, perm: 'stock.mover' }) + btnAcc({ texto: 'Traslado', acc: 'mov', datos: { t: 'Traslado' }, perm: 'stock.mover' }) + btnAcc({ texto: 'Ajuste con motivo', acc: 'mov', datos: { t: 'Ajuste' }, perm: 'stock.ajustar' }) + '<span class="id-pantalla">PR-31 · prioridad B</span>')}
  <p class="suave">Mouses, teclados, cables… Solo se lleva un conteo por ubicación. El stock <strong>nunca</strong> puede quedar negativo y las correcciones son ajustes con motivo.</p>
  ${tabla({ filas: D().stock, cols: [{ t: 'Artículo', k: (x) => `<a class="cod" href="#/sku?id=${x.sku}">${x.sku}</a> ${esc(skuDe(x.sku).nombre)}` }, { t: 'Ubicación', k: (x) => ubicDe(x.ubic) }, { t: 'Saldo', cls: 'num', k: (x) => fmtNum(x.saldo, skuDe(x.sku).unidad.includes('decimales') ? 1 : 0) }, { t: 'Aviso', k: (x) => { const s = skuDe(x.sku); const tot = D().stock.filter((y) => y.sku === x.sku).reduce((a, y) => a + y.saldo, 0); return s.min && tot < s.min ? chipCalc('Bajo el mínimo (' + s.min + ')', 'atencion') : ''; } }] })}`;
} });
ACC.mov = (el) => {
  const t = el.dataset.t, cant = D().skus.filter((s) => s.control === 'cantidad');
  abrirDialogo({ titulo: t + ' de stock', cuerpo: `<div id="mov-e"></div><div class="campo"><label for="mv-s">Artículo</label><select id="mv-s">${cant.map((s) => `<option value="${s.cod}">${s.cod} ${esc(s.nombre)}</option>`).join('')}</select></div><div class="fila-form"><div class="campo"><label for="mv-o">${t === 'Ingreso' ? 'Ubicación de ingreso' : 'Ubicación de origen'}</label><select id="mv-o">${D().ubicaciones.map((u) => `<option>${esc(u)}</option>`).join('')}</select></div>${t === 'Traslado' ? `<div class="campo"><label for="mv-d">Ubicación de destino</label><select id="mv-d">${D().ubicaciones.map((u) => `<option>${esc(u)}</option>`).join('')}</select></div>` : ''}<div class="campo"><label for="mv-c">Cantidad <span class="obligatorio">(obligatoria)</span></label><input id="mv-c" type="number" min="1" step="1" value="5"></div></div>${t === 'Ajuste' ? '<div class="campo"><label for="mv-m">Motivo <span class="obligatorio">(obligatorio)</span></label><textarea id="mv-m" maxlength="500" style="min-height:70px;font-family:inherit"></textarea></div>' : ''}<p class="suave chica">Pruebe sacar más de lo que hay para ver la regla: el stock no puede quedar negativo.</p>`,
    botones: [{ texto: 'Volver' }, { texto: t, clase: 'primario', alPulsar: (d) => {
      const sku = d.querySelector('#mv-s').value, ub = d.querySelector('#mv-o').value, n = Number(d.querySelector('#mv-c').value);
      let fila = D().stock.find((x) => x.sku === sku && x.ubic === ub);
      const hay = fila ? fila.saldo : 0;
      const err = (m) => { d.querySelector('#mov-e').innerHTML = aviso('alerta', 'No se puede por una regla', m); return false; };
      if (!(n > 0)) return err('La cantidad debe ser mayor que cero.');
      if (t === 'Ajuste' && !d.querySelector('#mv-m').value.trim()) return err('El motivo es obligatorio en un ajuste.');
      if (t === 'Traslado' && d.querySelector('#mv-d').value === ub) return err('Un traslado a la misma ubicación no se acepta.');
      if (['Salida', 'Traslado'].includes(t) && n > hay) return err(`El stock no puede quedar negativo. En esa ubicación hay ${hay} y quiere mover ${n}.`);
      if (!fila) { fila = { sku, ubic: ub, saldo: 0 }; D().stock.push(fila); }
      if (t === 'Ingreso' || t === 'Ajuste') fila.saldo += n; else fila.saldo -= n;
      if (t === 'Traslado') { const des = d.querySelector('#mv-d').value; let f2 = D().stock.find((x) => x.sku === sku && x.ubic === des); if (!f2) { f2 = { sku, ubic: des, saldo: 0 }; D().stock.push(f2); } f2.saldo += n; }
      toast(t + ' registrado. Queda en el historial y en la auditoría.'); render(true);
    } }] });
};

/* ---------- PR-29 Catálogos y ubicaciones ---------- */
ruta('catalogos', { id: 'PR-29', prio: 'B', titulo: 'Catálogos y ubicaciones', acceso: 'catalogos.ver', render(q) {
  const tab = q.tab || 'ubic';
  const edit = puede('catalogos.gestionar');
  const lista = (arr) => tabla({ filas: arr, cols: [{ t: 'Valor', k: (x) => esc(x[0]) }, { t: 'Estado del registro', k: (x) => chip(x[1] ? 'Activo' : 'Inactivo') }, { t: 'Acciones', sin: true, k: (x) => btnAcc({ texto: x[1] ? 'Desactivar' : 'Activar', clase: 'chico', acc: 'cat-toggle', perm: 'catalogos.gestionar' }) }] });
  return `${cabeceraPantalla('Catálogos y ubicaciones', btnAcc({ texto: 'Crear catálogo nuevo', acc: 'cat-lista', icono: 'mas', perm: 'catalogos.gestionar' }) + '<span class="id-pantalla">PR-29 · prioridad B</span>')}
  <p class="suave">Un valor de catálogo nunca se borra: se desactiva. Los valores inactivos no se pueden elegir en registros nuevos, pero se siguen viendo en los antiguos. ${edit ? '' : 'Su rol solo consulta.'}</p>
  ${pestanas('cat', [{ k: 'ubic', t: 'Ubicaciones' }, { k: 'marcas', t: 'Marcas' }, { k: 'cc', t: 'Centros de costo' }, { k: 'uni', t: 'Unidades de medida' }], tab)}
  ${panel('cat', 'ubic', tab, `<ul style="list-style:none;padding:0">${D().ubicaciones.map((u) => { const n = u.split(' > '); return `<li style="padding:6px 0 6px ${(n.length - 1) * 24}px" class="fila">${chipEtq(['Sede', 'Piso', 'Sala'][n.length - 1] || 'Sede')} <strong>${esc(n[n.length - 1])}</strong> <span class="suave chica">${ubicDe(u)}</span></li>`; }).join('')}</ul><p class="suave chica">Tres niveles: Sede › Piso › Sala. ${btnAcc({ texto: 'Agregar ubicación', clase: 'chico', acc: 'cat-lista', perm: 'ubicaciones.gestionar' })}</p>`)}
  ${panel('cat', 'marcas', tab, lista([['Dell', true], ['Lenovo', true], ['HP', true], ['Samsung', true], ['Logitech', true], ['Genius', true], ['Nexxt', true], ['Microsoft', true], ['Compaq', false]]))}
  ${panel('cat', 'cc', tab, lista(D().centros.map((c) => [c, true])))}
  ${panel('cat', 'uni', tab, lista([['Pieza', true], ['Caja', true], ['Metro (admite decimales)', true], ['Clave', true]]))}`;
} });
ACC['cat-toggle'] = () => toast('Cambio simulado: el valor se desactiva, nunca se borra.');
ACC['cat-lista'] = () => abrirDialogo({ titulo: 'Crear un valor o un catálogo', cuerpo: '<div class="campo"><label for="cl">Nombre <span class="obligatorio">(obligatorio, hasta 80 caracteres)</span></label><input id="cl" type="text"></div><p class="suave chica">Los catálogos nuevos son listas simples y sirven para los campos de tipo lista. No hace falta ayuda técnica.</p>', botones: [{ texto: 'Volver' }, { texto: 'Crear', clase: 'primario', alPulsar: () => toast('Creado (simulado).') }] });

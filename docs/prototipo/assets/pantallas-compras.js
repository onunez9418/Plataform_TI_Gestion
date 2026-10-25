/* =========================================================================
   Compras: órdenes de compra, aprobación, recepción con series en bloque,
   proveedores y órdenes de servicio.
   ========================================================================= */
'use strict';

const IGV = 0.18;
const ocDe = (num) => D().ordenes.find((o) => o.num === num);
const sub = (o) => o.lineas.reduce((s, l) => s + (l.pu || 0) * l.cant, 0);
const totOC = (o) => sub(o) * (1 + IGV);
const verPrecioDe = (o) => valor('precios.ver') === 'T' || (valor('precios.ver') === 'P' && o.creo === R().persona);
const PASOS_OC = ['Borrador', 'Pendiente de aprobación', 'Aprobada', 'Emitida', 'Recibida parcial', 'Cerrada'];

/* ---------- PR-17 Lista de órdenes de compra ---------- */
ruta('ordenes-compra', { id: 'PR-17', titulo: 'Órdenes de compra', acceso: 'ordenes_compra.ver', render() {
  const propio = valor('ordenes_compra.ver') === 'P';
  const datos = () => D().ordenes.filter((o) => !propio || o.creo === R().persona);
  const verTotal = valor('precios.ver') !== '-';
  return `${cabeceraPantalla('Órdenes de compra', btnAcc({ texto: valor('ordenes_compra.crear_editar') === 'P' ? 'Nueva solicitud de compra' : 'Nueva orden de compra', href: '#/oc-nueva', clase: 'primario', icono: 'mas', perm: 'ordenes_compra.crear_editar' }) + '<span class="id-pantalla">PR-17 · prioridad A</span>')}
  ${propio ? aviso('info', 'Solo ve las suyas', 'Su rol ve únicamente las solicitudes que usted creó.') : ''}${verTotal ? '' : aviso('sensible', 'Se omitieron columnas', 'Precios y totales (requiere el permiso «Ver precios»).')}
  ${listaHTML('oc', {
    datos, campos: [{ k: 'q', etq: 'Buscar por número o proveedor', tipo: 'texto', ph: 'OC-000212, Tecnosur…' }, { k: 'est', etq: 'Estado', tipo: 'sel', op: () => ['Borrador', 'Pendiente de aprobación', 'Aprobada', 'Emitida', 'Recibida parcial', 'Cerrada', 'Rechazada', 'Anulada'] }, { k: 'prov', etq: 'Proveedor', tipo: 'sel', op: () => [...new Set(D().ordenes.map((o) => o.prov).filter(Boolean))] }],
    filtrar: (o, f) => contiene(f.q, o.num, o.prov) && (!f.est || o.est === f.est) && (!f.prov || o.prov === f.prov),
    cols: [{ t: 'Número', k: (o) => `<a class="cod" href="#/oc?id=${o.num}">${o.num}</a>` }, { t: 'Proveedor', k: (o) => esc(o.prov || 'Aún sin proveedor') }, { t: 'Fecha', k: (o) => o.fecha }, { t: 'Estado', k: (o) => chip(o.est) + (o.solicitud ? ' ' + chipEtq('Solicitud de compra') : '') }, { t: 'Pedido por', k: (o) => esc(o.creo) }]
      .concat(verTotal ? [{ t: 'Total con impuesto', cls: 'num', k: (o) => verPrecioDe(o) && sub(o) ? dinero(totOC(o), o.mon) : '<span class="suave">—</span>' }] : [])
  })}`;
} });

/* ---------- PR-18 Crear orden de compra ---------- */
function ocnInicial() { return { prov: '', mon: E().moneda, cc: '', ref: '', lineas: [{ sku: '', cant: 1, pu: '' }] }; }
ruta('oc-nueva', { id: 'PR-18', titulo: 'Nueva orden de compra', acceso: 'ordenes_compra.crear_editar', render() {
  if (!APP.tmp.ocn || APP.tmp.ocnE !== APP.empresa) { APP.tmp.ocn = ocnInicial(); APP.tmp.ocnE = APP.empresa; }
  const sol = valor('ordenes_compra.crear_editar') === 'P';
  return `${cabeceraPantalla(sol ? 'Nueva solicitud de compra' : 'Nueva orden de compra', '<span class="id-pantalla">PR-18 · prioridad A</span>', '<a href="#/ordenes-compra">Órdenes de compra</a> › Nueva')}
  ${sol ? aviso('info', 'Una solicitud de compra es una orden en Borrador', 'Usted indica qué artículos y cuántos. TI completa los precios y la envía a aprobación.') : ''}
  <p class="suave chica">Borrador guardado automáticamente a las 14:07.</p><div id="zona-ocn">${pintarOcn()}</div>`;
} });
function pintarOcn() {
  const s = APP.tmp.ocn;
  const sol = valor('ordenes_compra.crear_editar') === 'P';
  const conPrecio = !sol;
  const provs = D().proveedores.filter((p) => p.estado === 'Activo');
  const skus = D().skus.filter((x) => x.activo);
  const totales = s.lineas.reduce((a, l) => { const t = (Number(l.pu) || 0) * (Number(l.cant) || 0); return { sub: a.sub + t, imp: a.imp + t * IGV }; }, { sub: 0, imp: 0 });
  const total = totales.sub + totales.imp;
  const otra = s.mon !== E().moneda;
  const exige = otra || total > E().limite;
  return `<form data-form="ocn" novalidate class="tarjeta" style="margin-bottom:16px"><div id="ocn-err"></div>
  <div class="fila-form"><div class="campo"><label for="oc-prov">Proveedor ${sol ? '<span class="obligatorio">(lo completa TI)</span>' : '<span class="obligatorio">(obligatorio)</span>'}</label><select id="oc-prov" data-cambio="ocn-c" data-k="prov" ${sol ? 'disabled' : ''}><option value="">Elija…</option>${provs.map((p) => `<option ${s.prov === p.n ? 'selected' : ''}>${esc(p.n)}</option>`).join('')}</select>${sol ? '' : '<div class="ayuda">Solo aparecen proveedores activos.</div>'}</div>
  <div class="campo"><label for="oc-mon">Moneda de la orden</label><select id="oc-mon" data-cambio="ocn-c" data-k="mon" ${sol ? 'disabled' : ''}>${['PEN', 'USD', 'EUR'].map((m) => `<option ${s.mon === m ? 'selected' : ''}>${m}</option>`).join('')}</select>${otra ? '<div class="ayuda">Otra moneda distinta de la base (' + E().moneda + '): <strong>siempre pasa por aprobación</strong>. No hay conversión automática.</div>' : ''}</div>
  <div class="campo"><label for="oc-cc">Centro de costo <span class="obligatorio">(opcional)</span></label><select id="oc-cc" data-cambio="ocn-c" data-k="cc"><option value="">Sin centro de costo</option>${D().centros.map((c) => `<option ${s.cc === c ? 'selected' : ''}>${esc(c)}</option>`).join('')}</select></div></div>
  <h2>Líneas</h2>
  ${tabla({ adaptable: true, filas: s.lineas.map((l, i) => Object.assign({ i }, l)), cols: [
    { t: 'Artículo', k: (l) => `<select aria-label="Artículo de la línea ${l.i + 1}" data-cambio="ocn-l" data-i="${l.i}" data-k="sku"><option value="">Elija…</option>${skus.map((x) => `<option value="${x.cod}" ${l.sku === x.cod ? 'selected' : ''}>${x.cod} ${esc(x.nombre)}</option>`).join('')}</select>` },
    { t: 'Cantidad', cls: 'num', k: (l) => `<input type="number" min="1" aria-label="Cantidad de la línea ${l.i + 1}" value="${esc(l.cant)}" data-entrada="ocn-l" data-i="${l.i}" data-k="cant" style="max-width:110px">` }]
    .concat(conPrecio ? [{ t: 'Precio unitario sin impuesto', cls: 'num', k: (l) => `<input type="number" min="0" step="0.01" aria-label="Precio de la línea ${l.i + 1}" value="${esc(l.pu)}" data-entrada="ocn-l" data-i="${l.i}" data-k="pu" style="max-width:150px">` }, { t: 'Impuesto', cls: 'num', k: () => '18 %' }, { t: 'Subtotal', cls: 'num', k: (l) => dinero((Number(l.pu) || 0) * (Number(l.cant) || 0), s.mon) }] : [])
    .concat([{ t: 'Quitar', sin: true, k: (l) => s.lineas.length > 1 ? `<button class="btn chico" type="button" data-acc="ocn-quitar" data-i="${l.i}">Quitar</button>` : '' }]) })}
  <div class="fila" style="margin:12px 0"><button class="btn" type="button" data-acc="ocn-agregar">${icono('mas')} Agregar línea</button></div>
  ${conPrecio ? `<dl class="lista-datos tarjeta" style="max-width:420px;margin-left:auto"><dt>Subtotal</dt><dd class="derecha">${dinero(totales.sub, s.mon)}</dd><dt>Impuesto</dt><dd class="derecha">${dinero(totales.imp, s.mon)}</dd><dt><strong>Total</strong></dt><dd class="derecha"><strong>${dinero(total, s.mon)}</strong></dd></dl>
  ${aviso(exige ? 'atencion' : 'info', exige ? 'Esta orden pasará por aprobación' : 'Esta orden se aprobará sola', otra ? 'Está en una moneda distinta de la base.' : exige ? `El total supera el límite de la empresa (${dinero(E().limite)}).` : `El total no supera el límite de la empresa (${dinero(E().limite)}).`)}` : ''}
  <div class="fila"><button class="btn primario" type="submit" data-envio="${sol ? 'borrador' : 'enviar'}">${sol ? 'Guardar solicitud' : 'Enviar a aprobación'}</button>${sol ? '' : '<button class="btn" type="button" data-acc="ocn-borrador">Guardar borrador</button>'}<a class="btn fantasma" href="#/ordenes-compra">Cancelar</a></div></form>`;
}
function refOcn() { const z = document.getElementById('zona-ocn'); z.innerHTML = pintarOcn(); }
CAMBIO['ocn-c'] = (el) => { APP.tmp.ocn[el.dataset.k] = el.value; refOcn(); document.getElementById(el.id).focus(); };
CAMBIO['ocn-l'] = (el) => { APP.tmp.ocn.lineas[Number(el.dataset.i)][el.dataset.k] = el.value; refOcn(); };
ENTRADA['ocn-l'] = (el) => { APP.tmp.ocn.lineas[Number(el.dataset.i)][el.dataset.k] = el.value; const pos = el.selectionStart; const id = el.getAttribute('aria-label'); refOcn(); const n = [...document.querySelectorAll('#zona-ocn input')].find((x) => x.getAttribute('aria-label') === id); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) { /* tipo número */ } } };
ACC['ocn-agregar'] = () => { APP.tmp.ocn.lineas.push({ sku: '', cant: 1, pu: '' }); refOcn(); };
ACC['ocn-quitar'] = (el) => { APP.tmp.ocn.lineas.splice(Number(el.dataset.i), 1); refOcn(); };
function guardarOcn(enviar) {
  const s = APP.tmp.ocn, sol = valor('ordenes_compra.crear_editar') === 'P', err = [];
  if (!sol && !s.prov) err.push('Elija un proveedor activo.');
  const usados = new Set();
  s.lineas.forEach((l, i) => {
    if (!l.sku) err.push(`Línea ${i + 1}: elija un artículo.`);
    else if (usados.has(l.sku)) err.push(`Línea ${i + 1}: el mismo artículo no puede repetirse en dos líneas.`);
    usados.add(l.sku);
    if (!(Number(l.cant) > 0)) err.push(`Línea ${i + 1}: la cantidad debe ser mayor que cero.`);
    if (!sol && enviar && (l.pu === '' || Number(l.pu) < 0)) err.push(`Línea ${i + 1}: falta un precio (no puede ser negativo).`);
  });
  if (err.length) { document.getElementById('ocn-err').innerHTML = aviso('alerta', 'Revise antes de continuar', '<ul>' + err.map((x) => `<li>${esc(x)}</li>`).join('') + '</ul>'); document.getElementById('ocn-err').scrollIntoView({ block: 'center' }); return; }
  const num = 'OC-' + String(220 + D().ordenes.length).padStart(6, '0');
  const o = { num, est: 'Borrador', prov: s.prov, fecha: '25/10/2026', mon: s.mon, creo: R().persona, aprobo: '', cc: s.cc, solicitud: sol, lineas: s.lineas.map((l) => ({ sku: l.sku, cant: Number(l.cant), pu: l.pu === '' ? null : Number(l.pu), rec: 0 })) };
  if (enviar && !sol) { const exige = s.mon !== E().moneda || totOC(o) > E().limite; o.est = exige ? 'Pendiente de aprobación' : 'Aprobada'; if (!exige) o.aprobo = 'Automática (bajo el límite)'; }
  D().ordenes.unshift(o); APP.tmp.ocn = null;
  toast(`Orden <span class="cod">${num}</span> creada: ${o.est}.`); location.hash = '#/oc?id=' + num;
}
ACC['form-ocn'] = (f, e) => guardarOcn(e.submitter ? e.submitter.dataset.envio !== 'borrador' : true);
ACC['ocn-borrador'] = () => guardarOcn(false);

/* ---------- PR-19 Detalle de OC y aprobación ---------- */
const excepcionActiva = () => !!APP.tmp.excepcion;
ruta('oc', { id: 'PR-19', titulo: 'Orden de compra', acceso: 'ordenes_compra.ver', render(q) {
  const o = ocDe(q.id);
  if (!o || (valor('ordenes_compra.ver') === 'P' && o.creo !== R().persona)) return pantallaNoEncontrada();
  const precios = verPrecioDe(o);
  const tuya = o.creo === R().persona;
  const actual = ['Rechazada', 'Anulada'].includes(o.est) ? null : PASOS_OC.indexOf(o.est === 'Recibida total' ? 'Cerrada' : o.est);
  const decidir = o.est === 'Pendiente de aprobación';
  const bloqueoRegla = tuya && !excepcionActiva() ? 'Usted preparó esta orden: debe aprobarla otra persona. Esta regla vale también para el Administrador.' : '';
  const sobrepasa = APP.modulos.presupuesto && o.num === 'OC-000212';
  const acciones = [];
  if (decidir) {
    acciones.push(btnAcc({ texto: 'Aprobar', clase: 'primario', icono: 'check', acc: 'oc-aprobar', datos: { n: o.num }, perm: 'ordenes_compra.aprobar', bloqueo: bloqueoRegla }));
    acciones.push(btnAcc({ texto: 'Rechazar', clase: 'peligro', acc: 'oc-rechazar', datos: { n: o.num }, perm: 'ordenes_compra.aprobar', bloqueo: bloqueoRegla }));
  }
  if (o.est === 'Aprobada') acciones.push(btnAcc({ texto: 'Emitir al proveedor', clase: 'primario', icono: 'siguiente', acc: 'oc-emitir', datos: { n: o.num }, perm: 'ordenes_compra.emitir' }));
  if (['Emitida', 'Recibida parcial'].includes(o.est)) {
    const impide = o.creo === R().persona || o.aprobo === R().persona;
    acciones.push(btnAcc({ texto: 'Recibir mercadería', clase: 'primario', icono: 'caja', href: '#/recepcion?oc=' + o.num, perm: 'recepciones.crear_confirmar', bloqueo: impide ? 'Quien creó o aprobó la orden no puede recibir su mercadería.' : '' }));
  }
  if (o.est === 'Rechazada') acciones.push(btnAcc({ texto: 'Corregir y volver a enviar', acc: 'oc-reenviar', datos: { n: o.num }, perm: 'ordenes_compra.crear_editar' }));
  if (o.est === 'Borrador' && !o.solicitud) acciones.push(btnAcc({ texto: 'Enviar a aprobación', acc: 'oc-reenviar', datos: { n: o.num }, perm: 'ordenes_compra.crear_editar' }));
  if (['Borrador', 'Pendiente de aprobación', 'Aprobada', 'Emitida', 'Rechazada'].includes(o.est)) acciones.push(btnAcc({ texto: 'Anular', acc: 'oc-anular', datos: { n: o.num }, perm: 'ordenes_compra.anular' }));
  if (o.est === 'Recibida parcial') acciones.push(btnAcc({ texto: 'Cerrar con lo recibido', acc: 'oc-cerrar', datos: { n: o.num }, perm: 'ordenes_compra.cerrar' }));
  acciones.push(`<button class="btn" type="button" onclick="window.print()">${icono('imprimir')} Vista imprimible</button>`);
  return `${cabeceraPantalla(`<span class="cod">${o.num}</span> ${chip(o.est)}`, acciones.join(''), '<a href="#/ordenes-compra">Órdenes de compra</a> › ' + o.num)}
  <div class="fila" style="margin-bottom:8px"><span class="id-pantalla">PR-19 · prioridad A</span>${o.solicitud ? chipEtq('Solicitud de compra') : ''}${o.mon !== E().moneda ? chipEtq('Otra moneda: pasa por aprobación') : ''}</div>
  ${actual === null ? '' : `<div class="flujo" aria-label="Avance de la orden">${PASOS_OC.map((p, i) => `<span class="paso ${i < actual ? 'hecho' : i === actual ? 'actual' : ''}" ${i === actual ? 'aria-current="step"' : ''}>${p}</span>${i < PASOS_OC.length - 1 ? '<span class="sep" aria-hidden="true">›</span>' : ''}`).join('')}</div>`}
  ${o.est === 'Rechazada' ? aviso('alerta', 'La orden fue rechazada', 'Motivo: ' + esc(o.motivoRechazo) + ' Puede corregirla y volver a enviarla; el historial del rechazo se conserva.') : ''}
  ${o.est === 'Anulada' ? aviso('info', 'La orden fue anulada', 'Motivo: ' + esc(o.motivoAnula || '—')) : ''}
  ${decidir && tuya && excepcionActiva() ? aviso('sensible', 'Excepción activa', 'La empresa tiene activa la excepción de una sola persona de TI. Si usted aprueba su propia orden, quedará marcada y registrada en la auditoría (quién, cuándo, monto y orden).') : ''}
  <div class="rejilla ancha"><div class="pila">
  <section class="tarjeta"><h2>Datos de la orden</h2><dl class="lista-datos"><dt>Proveedor</dt><dd>${esc(o.prov || '—')}</dd><dt>Fecha</dt><dd>${o.fecha}</dd><dt>Pedido por</dt><dd>${esc(o.creo)}</dd><dt>Aprobada por</dt><dd>${esc(o.aprobo || '—')}</dd><dt>Centro de costo</dt><dd>${esc(o.cc || '—')}</dd><dt>Moneda</dt><dd>${o.mon}</dd></dl></section>
  <section class="tarjeta"><h2>Líneas</h2>${precios ? '' : aviso('sensible', 'Se omitieron columnas', 'Precios y totales (requiere el permiso «Ver precios»).')}
  ${tabla({ filas: o.lineas, cols: [{ t: 'Artículo', k: (l) => `<a class="cod" href="#/sku?id=${l.sku}">${l.sku}</a> ${esc(skuDe(l.sku).nombre)}` }, { t: 'Pedido', cls: 'num', k: (l) => l.cant }, { t: 'Recibido', cls: 'num', k: (l) => l.rec }, { t: 'Pendiente', cls: 'num', k: (l) => l.cant - l.rec }].concat(precios ? [{ t: 'Precio sin impuesto', cls: 'num', k: (l) => l.pu == null ? '<span class="suave">Lo completa TI</span>' : dinero(l.pu, o.mon) }, { t: 'Total línea con impuesto', cls: 'num', k: (l) => l.pu == null ? '—' : dinero(l.pu * l.cant * (1 + IGV), o.mon) }] : []) })}
  ${precios && sub(o) ? `<dl class="lista-datos" style="margin-top:12px;max-width:420px;margin-left:auto"><dt>Subtotal</dt><dd class="derecha">${dinero(sub(o), o.mon)}</dd><dt>Impuesto (18 %)</dt><dd class="derecha">${dinero(sub(o) * IGV, o.mon)}</dd><dt><strong>Total</strong></dt><dd class="derecha"><strong>${dinero(totOC(o), o.mon)}</strong></dd></dl>` : ''}</section></div>
  <div class="pila">${decidir ? `<section class="tarjeta principal-rol" aria-label="Decisión"><h2>Decisión</h2><dl class="lista-datos"><dt>Monto con impuesto</dt><dd><strong>${precios ? dinero(totOC(o), o.mon) : 'Oculto'}</strong></dd><dt>Límite de la empresa</dt><dd>${dinero(E().limite)}</dd><dt>Por qué necesita aprobación</dt><dd>${o.mon !== E().moneda ? 'Está en otra moneda.' : 'Supera el límite.'}</dd><dt>Pedido por</dt><dd>${esc(o.creo)}</dd></dl>
    ${sobrepasa ? aviso('atencion', 'Efecto en el presupuesto (muestra de la Fase 3)', 'Esta orden deja «Periféricos» en <strong>112 %</strong> del presupuesto. Para aprobarla, escriba una justificación. No se bloquea.') : ''}
    ${puede('ordenes_compra.aprobar') ? '<p class="suave chica">Use «Aprobar» o «Rechazar» (arriba).</p>' : `<p>${icono('info')} Esta orden espera la decisión de Jefatura TI o de un Administrador.</p>`}</section>` : ''}
  <section class="tarjeta"><h2>Historial</h2><ol class="linea"><li><strong>Creada por ${esc(o.creo)}</strong><div class="cuando">${o.fecha}</div></li>${o.est !== 'Borrador' ? `<li><strong>Enviada a aprobación</strong><div class="cuando">${o.fecha}</div></li>` : ''}${o.aprobo ? `<li><strong>Aprobada por ${esc(o.aprobo)}</strong><div class="cuando">${o.fecha}</div></li>` : ''}${o.motivoRechazo ? `<li><strong>Rechazada</strong><div class="cuando">${esc(o.motivoRechazo)}</div></li>` : ''}</ol></section></div></div>`;
} });
ACC['oc-aprobar'] = (el) => {
  const o = ocDe(el.dataset.n);
  const justificar = APP.modulos.presupuesto && o.num === 'OC-000212';
  abrirDialogo({ titulo: 'Aprobar la orden ' + o.num, cuerpo: `<p>Monto: <strong>${dinero(totOC(o), o.mon)}</strong>. Se guardará quién aprobó y por qué monto.</p>${justificar ? '<div class="campo"><label for="ap-j">Justificación del exceso de presupuesto <span class="obligatorio">(obligatoria)</span></label><textarea id="ap-j" maxlength="500" style="min-height:70px;font-family:inherit"></textarea><div class="error" id="ap-e" hidden>' + icono('alerta') + '<span>Escriba la justificación para aprobar.</span></div></div>' : ''}${o.creo === R().persona ? aviso('sensible', 'Excepción activa', 'Se aprueba por la excepción de una sola persona de TI; queda en la auditoría.') : ''}`, botones: [{ texto: 'Volver' }, { texto: 'Aprobar', clase: 'primario', alPulsar: (d) => { if (justificar && !d.querySelector('#ap-j').value.trim()) { d.querySelector('#ap-e').hidden = false; d.querySelector('#ap-j').focus(); return false; } o.est = 'Aprobada'; o.aprobo = R().persona; toast(`Orden ${o.num} aprobada.`); render(true); } }] });
};
ACC['oc-rechazar'] = (el) => { const o = ocDe(el.dataset.n); dialogoMotivo({ titulo: 'Rechazar la orden ' + o.num, verbo: 'Rechazar', destructivo: true, etiqueta: 'Motivo del rechazo', consecuencias: ['La orden queda «Rechazada» con el motivo visible.', 'Quien la creó puede corregirla y volver a enviarla.'], alConfirmar: (m) => { o.est = 'Rechazada'; o.motivoRechazo = m; toast('Orden rechazada.'); render(true); } }); };
ACC['oc-emitir'] = (el) => { const o = ocDe(el.dataset.n); o.est = 'Emitida'; toast('La orden pasó a «Emitida». La plataforma no envía correo al proveedor: use la vista imprimible.'); render(true); };
ACC['oc-reenviar'] = (el) => { const o = ocDe(el.dataset.n); o.est = 'Pendiente de aprobación'; toast('Orden enviada a aprobación.'); render(true); };
ACC['oc-anular'] = (el) => { const o = ocDe(el.dataset.n); dialogoMotivo({ titulo: 'Anular la orden ' + o.num, verbo: 'Anular', destructivo: true, etiqueta: 'Motivo de la anulación', consecuencias: ['La orden queda sin efecto; no se borra.', 'Solo se anula antes de la primera recepción.'], alConfirmar: (m) => { o.est = 'Anulada'; o.motivoAnula = m; toast('Orden anulada.'); render(true); } }); };
ACC['oc-cerrar'] = (el) => { const o = ocDe(el.dataset.n); dialogoMotivo({ titulo: 'Cerrar la orden con lo recibido', verbo: 'Cerrar', etiqueta: 'Motivo (el proveedor ya no enviará lo pendiente)', consecuencias: ['Lo pendiente deja de esperarse.'], alConfirmar: () => { o.est = 'Cerrada'; toast('Orden cerrada.'); render(true); } }); };

/* ---------- Recepciones (lista) ---------- */
const RECEPCIONES = [{ n: 'RCP-000031', oc: 'OC-000201', fecha: '15/03/2024', cant: '20 laptops', usadas: true }, { n: 'RCP-000038', oc: 'OC-000209', fecha: '19/08/2025', cant: '8 laptops', usadas: false }];
ruta('recepciones', { id: '', titulo: 'Recepciones', acceso: ['recepciones.crear_confirmar', 'recepciones.revertir'], render() {
  const por = D().ordenes.filter((o) => ['Emitida', 'Recibida parcial'].includes(o.est));
  return `${cabeceraPantalla('Recepciones')}
  <section class="tarjeta" style="margin-bottom:16px"><h2>Por recibir</h2>${tabla({ filas: por, vacio: { titulo: 'Nada por recibir', texto: 'Cuando se emita una orden, aparecerá aquí.', icono: 'caja' }, cols: [{ t: 'Orden', k: (o) => `<a class="cod" href="#/oc?id=${o.num}">${o.num}</a>` }, { t: 'Proveedor', k: (o) => esc(o.prov) }, { t: 'Estado', k: (o) => chip(o.est) }, { t: 'Pendiente', cls: 'num', k: (o) => o.lineas.reduce((s, l) => s + l.cant - l.rec, 0) + ' unidades' }, { t: 'Recibir', sin: true, k: (o) => btnAcc({ texto: 'Recibir mercadería', clase: 'primario chico', href: '#/recepcion?oc=' + o.num, perm: 'recepciones.crear_confirmar', bloqueo: (o.creo === R().persona || o.aprobo === R().persona) ? 'Quien creó o aprobó la orden no puede recibirla.' : '' }) }] })}</section>
  <section class="tarjeta"><h2>Recepciones confirmadas</h2>${tabla({ filas: RECEPCIONES.concat(APP.tmp.rcpHechas || []), cols: [{ t: 'Recepción', k: (r) => `<span class="cod">${r.n}</span>` }, { t: 'Orden', k: (r) => `<span class="cod">${r.oc}</span>` }, { t: 'Fecha', k: (r) => r.fecha }, { t: 'Contenido', k: (r) => r.cant }, { t: 'Corrección', sin: true, k: (r) => btnAcc({ texto: 'Revertir', clase: 'chico', acc: 'rcp-revertir', datos: { n: r.n }, perm: 'recepciones.revertir', bloqueo: r.usadas ? 'Ya hay activos de esta recepción asignados o movidos: se corrige con baja y nueva entrada.' : '' }) }] })}</section>`;
} });
ACC['rcp-revertir'] = (el) => dialogoMotivo({ titulo: 'Revertir la recepción ' + el.dataset.n, verbo: 'Revertir', destructivo: true, consecuencias: ['Los activos se anulan con un movimiento contrario; nada se borra.', 'La orden vuelve al estado que corresponda.', 'Solo se puede mientras ninguno de sus activos haya sido asignado, movido o puesto en reparación.'], alConfirmar: () => toast('Recepción revertida (simulado).') });

/* ---------- PR-20 Recepción con series en bloque ---------- */
function normalizar(txt) {
  const bruto = txt.split(/[\n,;\t ]+/);
  let limpiadas = 0;
  const lista = [];
  txt.split(/\r?\n/).forEach((linea) => {
    linea.split(/[,;\t]+| {2,}/).forEach((tr) => {
      const t = tr.trim();
      if (!t) return;
      const u = t.replace(/\s+/g, '').toUpperCase();
      if (u !== tr) limpiadas++;
      lista.push(u);
    });
  });
  return { lista: lista.slice(0, 1000), limpiadas, cortada: lista.length > 1000, bruto: bruto.length };
}
function validarSeries(linea, todas) {
  const vistos = {};
  return linea.series.map((r, i) => {
    const v = (r.v || '').trim().toUpperCase();
    if (!v) return { t: 'vacia' };
    if (vistos[v] !== undefined) return { t: 'error', m: `Repetida en la fila ${i + 1} (ya está en la fila ${vistos[v] + 1}).` };
    vistos[v] = i;
    const mismo = D().activos.find((a) => a.sku === linea.sku && a.serie.toUpperCase() === v);
    if (mismo) return { t: 'error', m: `Ya existe en el artículo ${linea.sku} (activo ${mismo.serie}, ${mismo.estado}).` };
    const otro = D().activos.find((a) => a.sku !== linea.sku && a.serie.toUpperCase() === v);
    if (otro) return { t: 'aviso', m: `Ya existe en otro artículo (${otro.sku}). Se acepta con este aviso.` };
    if (/^\d+[,.]\d+E\+?\d+$/i.test(v)) return { t: 'aviso', m: 'Parece una serie dañada por Excel (notación científica). Revísela en el original.' };
    return { t: 'ok' };
  });
}
function rcpInicial(o) {
  return { oc: o.num, ubic: D().ubicaciones[0], compra: '2026-10-25', meses: 36, linea: 0, hecho: false, proc: false,
    lineas: o.lineas.map((l) => ({ sku: l.sku, pend: l.cant - l.rec, series: [], cant: l.cant - l.rec, serie: skuDe(l.sku).control === 'serie' })), limpiadas: 0 };
}
ruta('recepcion', { id: 'PR-20', titulo: 'Recepción de mercadería', acceso: 'recepciones.crear_confirmar', render(q) {
  const o = ocDe(q.oc);
  if (!o) return pantallaNoEncontrada();
  if (!['Emitida', 'Recibida parcial'].includes(o.est)) return `${cabeceraPantalla('Recepción de mercadería')}${aviso('info', 'Esta orden no está esperando mercadería', 'Solo se recibe contra una orden Emitida o Recibida parcial. Estado actual: ' + o.est + '.')}<a class="btn" href="#/recepciones">Volver</a>`;
  if (o.creo === R().persona || o.aprobo === R().persona) return `${cabeceraPantalla('Recepción de mercadería')}${aviso('alerta', 'No se puede por una regla', 'Quien creó o aprobó la orden no puede recibir su mercadería. Debe hacerlo otra persona (por ejemplo, Almacén).')}<a class="btn" href="#/oc?id=${o.num}">Volver a la orden</a>`;
  if (!APP.tmp.rcp || APP.tmp.rcp.oc !== o.num || APP.tmp.rcpE !== APP.empresa) { APP.tmp.rcp = rcpInicial(o); APP.tmp.rcpE = APP.empresa; }
  return `${cabeceraPantalla('Recepción de mercadería', '<span class="id-pantalla">PR-20 · prioridad A · la pantalla clave</span>', '<a href="#/recepciones">Recepciones</a> › ' + o.num)}
  <p>Orden <a class="cod" href="#/oc?id=${o.num}">${o.num}</a> · ${esc(o.prov)} · ${chip(o.est)}. Cada recepción es un documento propio; una orden puede tener varias.</p><div id="zona-rcp">${pintarRcp()}</div>`;
} });
function resumenRcp() {
  const s = APP.tmp.rcp;
  const resumen = s.lineas.map((l) => {
    if (!l.serie) return { l, cap: l.cant, ok: l.cant, err: 0, falta: l.pend - l.cant };
    const v = validarSeries(l);
    const ok = v.filter((x) => x.t === 'ok' || x.t === 'aviso').length, err = v.filter((x) => x.t === 'error').length;
    return { l, v, cap: ok + err, ok, err, falta: l.pend - ok };
  });
  return resumen;
}
function pintarRcp() {
  const s = APP.tmp.rcp;
  if (s.hecho) return aviso('exito', `Recepción confirmada: ${s.num}`, `${s.creados} activos nuevos quedaron En stock en ${esc(s.ubic.replace(/ > /g, ' › '))}. ${s.parcial ? 'La orden quedó «Recibida parcial» y lo pendiente sigue esperándose.' : 'La orden se completó y pasó a «Cerrada».'}`) + `<div class="fila"><a class="btn primario" href="#/activos">Ver los activos</a><a class="btn" href="#/oc?id=${s.oc}">Volver a la orden</a><a class="btn" href="#/recepciones">Recepciones</a></div>`;
  const L = s.lineas[s.linea];
  const res = resumenRcp();
  const r = res[s.linea];
  const sk = skuDe(L.sku);
  const tabs = s.lineas.map((l, i) => { const x = res[i]; return `<button type="button" role="tab" aria-selected="${i === s.linea}" tabindex="${i === s.linea ? 0 : -1}" data-acc="rcp-linea" data-i="${i}">${l.sku} · ${l.serie ? `${x.ok} de ${l.pend}` : `${l.cant} de ${l.pend}`}${x.err ? ` ${chip('Con errores')}` : x.falta === 0 ? ` ${chip('Hecho')}` : ''}</button>`; }).join('');
  const comunes = `<fieldset><legend>Datos de todo el lote (se piden una sola vez)</legend><div class="fila-form"><div class="campo"><label for="rc-u">Ubicación de ingreso <span class="obligatorio">(obligatoria)</span></label><select id="rc-u" data-cambio="rcp-c" data-k="ubic">${D().ubicaciones.map((u) => `<option ${s.ubic === u ? 'selected' : ''}>${esc(u)}</option>`).join('')}</select></div><div class="campo"><label for="rc-f">Fecha de compra</label><input id="rc-f" type="date" value="${s.compra}" data-cambio="rcp-c" data-k="compra"></div><div class="campo"><label for="rc-g">Garantía (meses)</label><input id="rc-g" type="number" min="0" max="120" value="${s.meses}" data-cambio="rcp-c" data-k="meses"><div class="ayuda">Vence el ${finGarantia(s.compra, s.meses)}.</div></div></div></fieldset>`;
  let captura;
  if (!L.serie) {
    captura = `<div class="tarjeta"><h2>${sk.cod} ${esc(sk.nombre)}</h2><p class="suave">Este artículo se controla <strong>por cantidad</strong>: no lleva series. Solo indique cuántas unidades llegaron; se suman al stock de la ubicación.</p><div class="campo" style="max-width:240px"><label for="rc-cant">Cantidad que llegó <span class="obligatorio">(máximo ${L.pend}, lo pendiente)</span></label><input id="rc-cant" type="number" min="0" max="${L.pend}" value="${L.cant}" data-entrada="rcp-cant"></div><div id="rc-cant-e"></div></div>`;
  } else {
    const celular = sk.cod.startsWith('CEL');
    captura = `<div class="captura"><div class="tarjeta"><h2>Pegar una lista</h2><p class="suave chica">Una serie por línea, o separadas por coma o espacio. Un lector de código de barras escribe aquí como un teclado y salta a la siguiente fila. Máximo 1.000 series.</p>
      <label for="rc-pegar" class="oculto-visual">Lista de series</label><textarea id="rc-pegar" placeholder="5CG3700001&#10;5CG3700002&#10;…"></textarea>
      <div class="fila" style="margin-top:8px"><button type="button" class="btn primario" data-acc="rcp-agregar">Agregar a la tabla</button></div><hr style="border:0;border-top:1px solid var(--c-borde);margin:12px 0"><p class="suave chica sin-margen">Para probar:</p><div class="fila"><button type="button" class="btn chico" data-acc="rcp-ejemplo" data-t="bueno">Ejemplo correcto</button><button type="button" class="btn chico" data-acc="rcp-ejemplo" data-t="malo">Ejemplo con errores</button><button type="button" class="btn chico" data-acc="rcp-vaciar">Vaciar tabla</button></div>${s.limpiadas ? `<p class="aviso info" style="margin-top:8px">${icono('info')}<span class="cuerpo-aviso">Se limpiaron ${s.limpiadas} series (espacios sobrantes y minúsculas).</span></p>` : ''}</div>
      <div><h2 style="margin-bottom:8px">Series capturadas</h2>${L.series.length ? tabla({ filas: L.series.map((x, i) => ({ i, x, e: r.v[i] })), claseFila: (f) => f.e.t === 'error' ? 'fila-error' : f.e.t === 'aviso' ? 'fila-aviso' : '', cols: [{ t: 'Fila', cls: 'num', k: (f) => f.i + 1 }, { t: 'Serie', k: (f) => `<span class="celda-entrada"><input type="text" aria-label="Serie de la fila ${f.i + 1}" value="${esc(f.x.v)}" maxlength="64" data-entrada="rcp-fila" data-i="${f.i}" data-c="v"></span>` }].concat(celular ? [{ t: 'IMEI (se puede completar después)', k: (f) => `<span class="celda-entrada"><input type="text" inputmode="numeric" aria-label="IMEI de la fila ${f.i + 1}" value="${esc(f.x.imei || '')}" maxlength="15" data-entrada="rcp-fila" data-i="${f.i}" data-c="imei"></span>` }] : []).concat([{ t: 'Estado', k: (f) => `<span id="rc-est-${f.i}">${estadoFila(f.e)}</span>` }, { t: 'Quitar', sin: true, k: (f) => `<button class="btn chico" type="button" data-acc="rcp-quitar" data-i="${f.i}" aria-label="Quitar la fila ${f.i + 1}">Quitar</button>` }]) }) : vacio({ titulo: 'Aún no hay series', texto: 'Pegue una lista a la izquierda o use un ejemplo.', icono: 'caja' })}</div></div>`;
  }
  return `<div class="pestanas" role="tablist" aria-label="Líneas de la orden">${tabs}</div>${comunes}${captura}<div id="rc-resumen">${resumenHTML()}</div>`;
}
function estadoFila(e) {
  if (e.t === 'ok') return chip('Hecho').replace('Hecho', 'Correcta');
  if (e.t === 'error') return `<span class="chip s-alerta">${icono('alerta')}Error</span> <span class="chica">${esc(e.m)}</span>`;
  if (e.t === 'aviso') return `<span class="chip s-atencion">${icono('info')}Aviso</span> <span class="chica">${esc(e.m)}</span>`;
  return '<span class="suave chica">Fila vacía: se ignora</span>';
}
function finGarantia(iso, meses) { if (!iso) return '—'; const d = new Date(iso + 'T00:00:00'); d.setMonth(d.getMonth() + Number(meses || 0)); d.setDate(d.getDate() - 1); return fechaDe(d); }
function resumenHTML() {
  const s = APP.tmp.rcp, res = resumenRcp();
  const errores = res.reduce((n, r) => n + r.err, 0);
  const totalOk = res.reduce((n, r) => n + r.ok, 0);
  const faltan = res.reduce((n, r) => n + Math.max(r.falta, 0), 0);
  const partes = res.map((r) => `<li><strong>${r.l.sku}</strong>: ${r.l.serie ? `${r.ok} de ${r.l.pend} series correctas${r.err ? `, <strong>${r.err} con error</strong>` : ''}` : `${r.l.cant} de ${r.l.pend} unidades`}${r.falta > 0 ? ` · faltan ${r.falta}` : ''}</li>`).join('');
  const primerError = (() => { for (const r of res) { if (r.err) { const i = r.v.findIndex((x) => x.t === 'error'); return `Fila ${i + 1} de ${r.l.sku}: ${r.v[i].m}`; } } return ''; })();
  const crearia = res.map((r) => r.l.serie ? `${r.ok} activos de ${r.l.sku}` : `${r.l.cant} unidades de ${r.l.sku} al stock`).join(', ');
  const todoCompleto = errores === 0 && faltan === 0 && totalOk + res.filter((r) => !r.l.serie).length > 0;
  const hayAlgo = errores === 0 && totalOk > 0;
  const pct = Math.round(100 * (res.reduce((n, r) => n + (r.l.serie ? Math.min(r.ok, r.l.pend) : r.l.cant), 0)) / Math.max(1, res.reduce((n, r) => n + r.l.pend, 0)));
  const b = (o) => btnAcc(o);
  return `<section class="tarjeta principal-rol" style="margin-top:16px" aria-label="Resumen antes de confirmar"><h2>Resumen antes de confirmar</h2>
    <div class="fila entre"><span class="contador-grande" aria-live="polite">${pct} % capturado</span><span>${errores ? chip('Con errores') + ` ${errores} serie(s) con error` : chip('Hecho').replace('Hecho', 'Sin errores')}</span></div>
    <div class="barra-avance" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="Avance de la captura"><span style="width:${pct}%"></span></div><ul>${partes}</ul>
    <p><strong>Se crearán:</strong> ${esc(crearia)} en ${esc(s.ubic.replace(/ > /g, ' › '))}.${faltan ? ` <strong>Faltan ${faltan} por registrar.</strong>` : ''}</p>
    ${errores ? aviso('alerta', 'No se puede confirmar con errores', 'Es todo o nada: si una serie falla, no se crea ningún activo. ' + esc(primerError)) : ''}
    <div class="fila">${b({ texto: s.proc ? 'Registrando…' : 'Confirmar y crear activos', clase: 'primario', acc: 'rcp-ok', bloqueo: errores ? 'Corrija las series con error.' : faltan ? `Faltan ${faltan} series o unidades: guarde el borrador o reciba solo lo capturado.` : !hayAlgo && !todoCompleto ? 'Todavía no hay nada que recibir.' : '' })}
    ${faltan > 0 && hayAlgo ? b({ texto: 'Recibir solo lo capturado', acc: 'rcp-parcial' }) : ''}<button class="btn" type="button" data-acc="rcp-borrador">Guardar borrador</button></div>
    <p class="suave chica">El borrador no reserva la cantidad, vale 7 días y lo puede retomar cualquiera con permiso de recepción. Al confirmar se valida contra lo pendiente de ese momento. Un doble clic en «Confirmar» no crea los activos dos veces.</p></section>`;
}
function refRcp(todo) { const z = document.getElementById('zona-rcp'); if (todo) z.innerHTML = pintarRcp(); else document.getElementById('rc-resumen').innerHTML = resumenHTML(); }
function actualizarFilas() {
  const s = APP.tmp.rcp, L = s.lineas[s.linea], v = validarSeries(L);
  v.forEach((e, i) => { const c = document.getElementById('rc-est-' + i); if (c) { c.innerHTML = estadoFila(e); const tr = c.closest('tr'); if (tr) tr.className = e.t === 'error' ? 'fila-error' : e.t === 'aviso' ? 'fila-aviso' : ''; } });
  refRcp(false);
}
CAMBIO['rcp-c'] = (el) => { APP.tmp.rcp[el.dataset.k] = el.value; refRcp(true); document.getElementById(el.id).focus(); };
ACC['rcp-linea'] = (el) => { APP.tmp.rcp.linea = Number(el.dataset.i); refRcp(true); };
ACC['rcp-agregar'] = () => {
  const s = APP.tmp.rcp, L = s.lineas[s.linea], n = normalizar(document.getElementById('rc-pegar').value);
  if (!n.lista.length) { toast('Pegue al menos una serie.', 'alerta'); return; }
  n.lista.forEach((v) => L.series.push({ v, imei: '' }));
  s.limpiadas += n.limpiadas; refRcp(true);
  toast(`${n.lista.length} series agregadas.${n.limpiadas ? ' Se limpiaron ' + n.limpiadas + ' (espacios o minúsculas).' : ''}${n.cortada ? ' Se tomaron las primeras 1.000.' : ''}`);
};
ACC['rcp-ejemplo'] = (el) => {
  const s = APP.tmp.rcp, L = s.lineas[s.linea];
  if (!L.serie) { toast('Este artículo no lleva series.', 'alerta'); return; }
  const n = L.pend, base = L.sku.startsWith('CEL') ? 'R58Z7' : '5CG37';
  const arr = []; for (let i = 0; i < n; i++) arr.push(base + String(1000 + i * 3) + 'X' + i);
  let limpiadas = 0;
  if (el.dataset.t === 'malo') {
    arr[11] = arr[4];                       // repetida
    if (L.sku === 'LAP-0001') { arr[20] = '5CG3412H2Q'; arr[27] = 'pf3h8k21 '; arr[33] = '3,5E+14'; }       // ya existe, otro artículo, Excel dañada
    else { arr[3] = 'R58W1A2B3C4'; }
    arr[30] = ' ' + arr[30].toLowerCase(); limpiadas++;
  } else { arr[5] = ' ' + arr[5].toLowerCase() + ' '; arr[9] = arr[9].toLowerCase(); limpiadas = 2; }
  L.series = arr.map((v) => ({ v: v.replace(/\s+/g, '').toUpperCase(), imei: '' }));
  s.limpiadas = limpiadas; refRcp(true);
  toast(el.dataset.t === 'malo' ? 'Ejemplo con errores cargado: mire las filas marcadas.' : `Ejemplo correcto cargado: ${n} series.`);
};
ACC['rcp-vaciar'] = () => { const s = APP.tmp.rcp; s.lineas[s.linea].series = []; s.limpiadas = 0; refRcp(true); };
ACC['rcp-quitar'] = (el) => { const s = APP.tmp.rcp; s.lineas[s.linea].series.splice(Number(el.dataset.i), 1); refRcp(true); };
ENTRADA['rcp-fila'] = (el) => { const s = APP.tmp.rcp, L = s.lineas[s.linea]; L.series[Number(el.dataset.i)][el.dataset.c] = el.value; actualizarFilas(); };
ENTRADA['rcp-cant'] = (el) => {
  const s = APP.tmp.rcp, L = s.lineas[s.linea], n = Number(el.value);
  if (n > L.pend) { document.getElementById('rc-cant-e').innerHTML = aviso('alerta', 'No se puede por una regla', `No se puede recibir más de lo pendiente (${L.pend}). Los sobrantes se manejan fuera de la orden.`); return; }
  document.getElementById('rc-cant-e').innerHTML = ''; L.cant = n >= 0 ? n : 0; refRcp(false);
};
ACC['rcp-borrador'] = () => toast('Borrador de recepción guardado. Vale 7 días y no reserva la cantidad.');
function confirmarRcp(parcial) {
  const s = APP.tmp.rcp, o = ocDe(s.oc);
  if (s.proc) return;
  s.proc = true; refRcp(false);
  setTimeout(() => {
    const res = resumenRcp(); let creados = 0;
    res.forEach((r, i) => {
      const lo = o.lineas[i], sk = skuDe(r.l.sku);
      if (r.l.serie) {
        r.l.series.filter((x, k) => r.v[k].t === 'ok' || r.v[k].t === 'aviso').forEach((x) => { D().activos.push({ id: 'N' + (D().activos.length + 1), sku: r.l.sku, serie: x.v.trim().toUpperCase(), estado: 'En stock', ubic: s.ubic, resp: null, compra: isoF(s.compra), garantia: finGarantia(s.compra, s.meses), oc: o.num, costo: lo.pu, moneda: o.mon, imei: x.imei || (r.l.sku.startsWith('CEL') ? '' : undefined) }); creados++; });
        lo.rec += r.ok;
      } else if (r.l.cant > 0) {
        let f = D().stock.find((y) => y.sku === r.l.sku && y.ubic === s.ubic); if (!f) { f = { sku: r.l.sku, ubic: s.ubic, saldo: 0 }; D().stock.push(f); } f.saldo += r.l.cant; lo.rec += r.l.cant; creados += r.l.cant;
      }
    });
    const quedan = o.lineas.some((l) => l.rec < l.cant);
    o.est = quedan ? 'Recibida parcial' : 'Cerrada';
    s.num = 'RCP-' + String(39 + (APP.tmp.rcpHechas || []).length).padStart(6, '0');
    (APP.tmp.rcpHechas = APP.tmp.rcpHechas || []).push({ n: s.num, oc: o.num, fecha: '25/10/2026', cant: creados + ' unidades', usadas: false });
    s.hecho = true; s.creados = creados; s.parcial = quedan; s.proc = false;
    APP.tmp.rcp = Object.assign({}, s); toast(`Recepción <span class="cod">${s.num}</span> confirmada: ${creados} unidades.`); refRcp(true);
  }, 500);
}
ACC['rcp-ok'] = () => confirmarRcp(false);
ACC['rcp-parcial'] = () => confirmarRcp(true);

/* ---------- Proveedores ---------- */
ruta('proveedores', { id: '', titulo: 'Proveedores', acceso: 'proveedores.ver', render() {
  const contactos = puede('proveedores.ver_contactos');
  return `${cabeceraPantalla('Proveedores', btnAcc({ texto: 'Nuevo proveedor', acc: 'prov-nuevo', clase: 'primario', icono: 'mas', perm: 'proveedores.crear_editar' }))}
  ${contactos ? '' : aviso('sensible', 'Se omitieron columnas', 'Contactos del proveedor (requiere el permiso «Ver contactos de proveedores»).')}
  <div class="barra-herr">${btnExportar()}</div>
  ${tabla({ filas: D().proveedores, cols: [{ t: 'Proveedor', k: (p) => esc(p.n) }, { t: 'Identificación fiscal', k: (p) => `<span class="cod">${p.ruc}</span>` }, { t: 'Tipo', k: (p) => p.tipo }, { t: 'Estado del registro', k: (p) => chip(p.estado) }].concat(contactos ? [{ t: 'Contacto', k: (p) => 'ventas@' + p.n.split(' ')[0].toLowerCase() + '.example' }] : []) })}
  <p class="suave chica">Crear o editar proveedores es un permiso distinto del de crear órdenes de compra.</p>`;
} });
ACC['prov-nuevo'] = () => abrirDialogo({ titulo: 'Nuevo proveedor', cuerpo: '<div class="campo"><label for="pv">Razón social <span class="obligatorio">(obligatoria, hasta 160 caracteres)</span></label><input id="pv" type="text"></div><div class="campo"><label for="pr">Identificación fiscal</label><input id="pr" type="text"><div class="ayuda">No se repite dentro de la empresa. Si falta, se avisa.</div></div>', botones: [{ texto: 'Volver' }, { texto: 'Crear proveedor', clase: 'primario', alPulsar: () => toast('Proveedor creado (simulado).') }] });

/* ---------- Órdenes de servicio y PR-33 ---------- */
ruta('ordenes-servicio', { id: 'PR-33', prio: 'B', titulo: 'Órdenes de servicio', acceso: 'ordenes_servicio.ver', render() {
  const propio = valor('ordenes_servicio.ver') === 'P';
  return `${cabeceraPantalla('Órdenes de servicio', btnAcc({ texto: 'Pedir ayuda', href: '#/pedir-ayuda', clase: 'primario', icono: 'ayuda', perm: 'ordenes_servicio.crear' }) + '<span class="id-pantalla">PR-33 · prioridad B</span>')}
  <p class="suave">Una solicitud de servicio es una orden en estado <strong>Creada</strong>. Abrir o cerrar una orden no cambia el estado del equipo.</p>
  ${listaHTML('os', {
    datos: () => D().ordenesServicio.filter((o) => !propio || o.pidio === R().persona),
    campos: [{ k: 'q', etq: 'Buscar', tipo: 'texto', ph: 'OS-000041, laptop…' }, { k: 'est', etq: 'Estado', tipo: 'sel', op: () => ['Creada', 'Asignada', 'En ejecución', 'Cerrada', 'Cancelada'] }, { k: 'tipo', etq: 'Tipo', tipo: 'sel', op: () => ['Reparación', 'Instalación', 'Servicio externo'] }],
    filtrar: (o, f) => contiene(f.q, o.num, o.desc, o.activo) && (!f.est || o.est === f.est) && (!f.tipo || o.tipo === f.tipo),
    cols: [{ t: 'Orden', k: (o) => `<a class="cod" href="#/os?id=${o.num}">${o.num}</a>` }, { t: 'Tipo', k: (o) => o.tipo }, { t: 'Qué hay que hacer', k: (o) => esc(o.desc) }, { t: 'Pedida por', k: (o) => esc(o.pidio) }, { t: 'Asignada a', k: (o) => esc(o.asigna || '—') }, { t: 'Estado', k: (o) => chip(o.est) }]
  })}`;
} });
ruta('os', { id: 'PR-33', prio: 'B', titulo: 'Orden de servicio', acceso: 'ordenes_servicio.ver', render(q) {
  const o = D().ordenesServicio.find((x) => x.num === q.id);
  if (!o || (valor('ordenes_servicio.ver') === 'P' && o.pidio !== R().persona)) return pantallaNoEncontrada();
  const pasos = ['Creada', 'Asignada', 'En ejecución', 'Cerrada'], i = pasos.indexOf(o.est);
  const gest = puede('ordenes_servicio.gestionar');
  const sig = { Creada: 'Asignar', Asignada: 'Iniciar ejecución', 'En ejecución': 'Cerrar' }[o.est];
  return `${cabeceraPantalla(`<span class="cod">${o.num}</span> ${chip(o.est)}`, (sig && gest ? `<button class="btn primario" type="button" data-acc="os-avanzar" data-n="${o.num}">${sig}</button>` : '') + (!['Cerrada', 'Cancelada'].includes(o.est) ? btnAcc({ texto: 'Cancelar la orden', acc: 'os-cancelar', datos: { n: o.num }, perm: 'ordenes_servicio.cancelar' }) : ''), '<a href="#/ordenes-servicio">Órdenes de servicio</a> › ' + o.num)}
  ${i >= 0 ? `<div class="flujo">${pasos.map((p, k) => `<span class="paso ${k < i ? 'hecho' : k === i ? 'actual' : ''}">${p}</span>${k < 3 ? '<span class="sep" aria-hidden="true">›</span>' : ''}`).join('')}</div>` : ''}
  <section class="tarjeta"><dl class="lista-datos"><dt>Tipo de servicio</dt><dd>${o.tipo}</dd><dt>Qué hay que hacer</dt><dd>${esc(o.desc)}</dd><dt>Pedida por</dt><dd>${esc(o.pidio)}</dd><dt>Asignada a</dt><dd>${esc(o.asigna || 'Sin asignar')}</dd><dt>Equipo relacionado</dt><dd>${o.activo ? `<span class="cod">${esc(o.activo)}</span>` : '—'}</dd><dt>Costo estimado</dt><dd>${puede('precios.ver') && valor('precios.ver') === 'T' ? dinero(o.costo) : '<span class="oculto">' + icono('candado') + 'Oculto</span>'}</dd></dl></section>
  ${o.costo > 0 ? aviso('info', 'Servicio con costo', 'Una orden con costo sigue la misma regla de aprobación y de separación de funciones que las compras. ' + (o.costo > E().limite ? 'Supera el límite: necesita aprobación.' : 'No supera el límite de ' + dinero(E().limite) + ': no necesita aprobación.')) : ''}
  <p class="suave chica">Abrir o cerrar la orden no cambia el estado del equipo. Si el equipo debe pasar a reparación, use «Cambiar estado» en su ficha.</p>`;
} });
ACC['os-avanzar'] = (el) => { const o = D().ordenesServicio.find((x) => x.num === el.dataset.n); o.est = { Creada: 'Asignada', Asignada: 'En ejecución', 'En ejecución': 'Cerrada' }[o.est]; if (o.est === 'Asignada') o.asigna = o.asigna || R().persona; toast('La orden pasó a «' + o.est + '».'); render(true); };
ACC['os-cancelar'] = (el) => { const o = D().ordenesServicio.find((x) => x.num === el.dataset.n); dialogoMotivo({ titulo: 'Cancelar la orden ' + o.num, verbo: 'Cancelar la orden', destructivo: true, consecuencias: ['Se detiene el trabajo en curso. Una orden cerrada no se reabre; una cancelada tampoco.'], alConfirmar: () => { o.est = 'Cancelada'; toast('Orden cancelada.'); render(true); } }); };

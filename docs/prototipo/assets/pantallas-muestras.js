/* =========================================================================
   Muestras de módulos de las fases 2 y 3 (solo para que se vea cómo serán).
   No son parte de la versión 1.
   ========================================================================= */
'use strict';

const muestra = (fase) => aviso('info', `Muestra de un módulo de la ${fase}`, 'No forma parte de la versión 1. Se muestra para que vea cómo se verá y se comportará.');

/* ---------- PR-37 Mesa de ayuda ---------- */
const CASOS = [
  { n: 'AYU-000118', asunto: 'Mi laptop no enciende', quien: 'PRS-0009', prio: 'P2 Alta', est: 'En atención', resp: 'Marta Quispe', sla1: ['Cumplido', 'exito'], sla2: ['En riesgo: faltan 40 min', 'atencion'] },
  { n: 'AYU-000121', asunto: 'Instalar Office en un equipo nuevo', quien: 'PRS-0005', prio: 'P3 Media', est: 'Nuevo', resp: '', sla1: ['En plazo', 'exito'], sla2: ['En plazo', 'exito'] },
  { n: 'AYU-000104', asunto: 'Mi laptop se pone lenta', quien: 'PRS-0007', prio: 'P3 Media', est: 'En atención', resp: 'Rosa Medina', sla1: ['Cumplido', 'exito'], sla2: ['En plazo', 'exito'] },
  { n: 'AYU-000098', asunto: 'Sin acceso al correo', quien: 'PRS-0011', prio: 'P1 Crítica', est: 'Resuelto', resp: 'Marta Quispe', sla1: ['Cumplido', 'exito'], sla2: ['Cumplido', 'exito'] },
  { n: 'AYU-000091', asunto: 'Solicitud de un mouse', quien: 'PRS-0007', prio: 'P4 Baja', est: 'Cerrado', resp: 'Julián Rojas', sla1: ['Cumplido', 'exito'], sla2: ['Cumplido', 'exito'] }
];
ruta('casos', { id: 'PR-37', prio: 'B', fase: 'Fase 2', titulo: 'Mesa de ayuda', acceso: 'ayuda.caso_ver', render(q) {
  const propio = valor('ayuda.caso_ver') === 'P';
  const datos = CASOS.filter((c) => !propio || c.quien === R().ref);
  const sel = CASOS.find((c) => c.n === (q.id || 'AYU-000118'));
  const interno = puede('ayuda.caso_ver_interno');
  return `${cabeceraPantalla('Mesa de ayuda', btnAcc({ texto: 'Pedir ayuda', href: '#/pedir-ayuda', clase: 'primario', icono: 'ayuda', perm: 'ayuda.caso_crear' }) + '<span class="id-pantalla">PR-37 · muestra</span>')}${muestra('Fase 2')}
  ${tabla({ filas: datos, vacio: { titulo: 'No tiene casos', texto: 'Use «Pedir ayuda».', icono: 'ayuda' }, cols: [{ t: 'Caso', k: (c) => `<a class="cod" href="#/casos?id=${c.n}">${c.n}</a>` }, { t: 'Asunto', k: (c) => esc(c.asunto) }, { t: 'Persona atendida', k: (c) => nombrePersona(c.quien) }, { t: 'Prioridad', k: (c) => c.prio }, { t: 'Estado', k: (c) => chip(c.est) }, { t: 'Primera respuesta', k: (c) => chipCalc(c.sla1[0], c.sla1[1]) }, { t: 'Resolución', k: (c) => chipCalc(c.sla2[0], c.sla2[1]) }] })}
  ${sel && (!propio || sel.quien === R().ref) ? `<section class="tarjeta" style="margin-top:16px"><h2>${sel.n} · ${esc(sel.asunto)}</h2><div class="fila">${chip(sel.est)} ${chipCalc(sel.sla1[0], sel.sla1[1])} ${chipCalc(sel.sla2[0], sel.sla2[1])}</div>
    <ol class="linea" style="margin-top:12px"><li><strong>Caso creado</strong><div class="cuando">25/10/2026 08:20 · ${nombrePersona(sel.quien)}</div></li><li><strong>Respuesta del equipo (visible para la persona)</strong><div class="cuando">25/10/2026 08:45 · Marta Quispe · «Estamos revisando su equipo.»</div></li>${interno ? '<li><strong>Nota interna (solo el equipo de TI)</strong><div class="cuando">25/10/2026 09:02 · Marta Quispe · «Posible falla de la fuente; probar con otro cargador.»</div></li>' : ''}</ol>
    ${interno ? '' : '<p class="suave chica">Las notas internas del equipo de TI no se muestran a su rol.</p>'}<p class="suave chica">El reloj de los plazos corre solo en horario de atención y se detiene mientras se espera a la persona.</p></section>` : ''}`;
} });

/* ---------- PR-38 Vencimientos ---------- */
ruta('vencimientos', { id: 'PR-38', prio: 'B', fase: 'Fase 2', titulo: 'Vencimientos', acceso: 'reportes.ver_vencimientos', render(q) {
  const vista = q.v || 'lista';
  const items = VENCIMIENTOS.map((v) => Object.assign({}, v, { d: diasHasta(new Date(v.fecha + 'T00:00:00')) })).sort((a, b) => a.d - b.d);
  const etq = (d) => d < 0 ? chipCalc('Vencido hace ' + (-d) + ' días', 'alerta') : d <= 30 ? chipCalc('Faltan ' + d + ' días', 'atencion') : chipCalc('Faltan ' + d + ' días', 'exito');
  const dias = []; for (let i = 1; i <= 30; i++) dias.push(i);
  const cal = `<div class="envoltura-tabla"><table class="tabla" role="grid"><caption>Noviembre de 2026 · cada día con vencimientos lista los tipos</caption><thead><tr>${['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => `<th scope="col">${d}</th>`).join('')}</tr></thead><tbody>${[0, 1, 2, 3, 4].map((s) => `<tr>${[0, 1, 2, 3, 4, 5, 6].map((k) => { const dia = s * 7 + k; const n = dia; if (n < 1 || n > 30) return '<td></td>'; const ev = items.filter((v) => v.fecha === '2026-11-' + String(n).padStart(2, '0')); return `<td style="vertical-align:top;height:72px"><strong>${n}</strong>${ev.map((e) => `<div class="chip s-atencion" style="margin-top:4px">${e.tipo}</div>`).join('')}</td>`; }).join('')}</tr>`).join('')}</tbody></table></div>`;
  return `${cabeceraPantalla('Vencimientos', `<div class="conmutador" role="group" aria-label="Vista"><a class="btn" style="border:0;border-radius:0" href="#/vencimientos" ${vista === 'lista' ? 'aria-current="true"' : ''}>Lista</a><a class="btn" style="border:0;border-radius:0" href="#/vencimientos?v=calendario">Calendario</a></div><span class="id-pantalla">PR-38 · muestra</span>`)}${muestra('Fase 2')}
  <p>Una sola pantalla para garantías, licencias, contratos, líneas, dominios y certificados. Las etiquetas con borde discontinuo y reloj se calculan solas con la fecha de hoy (25/10/2026).</p>
  ${vista === 'calendario' ? cal + '<h2 style="margin-top:16px">Lista equivalente</h2>' : ''}
  <div class="barra-herr"><div class="campo"><label for="vn-t">Tipo</label><select id="vn-t"><option>Todos</option><option>Garantía</option><option>Licencia</option><option>Dominio</option><option>Certificado</option><option>Contrato</option><option>Línea móvil</option></select></div>${btnExportar()}</div>
  ${tabla({ filas: items, cols: [{ t: 'Tipo', k: (v) => chipEtq(v.tipo) }, { t: 'Qué vence', k: (v) => esc(v.que) }, { t: 'Fecha', k: (v) => isoF(v.fecha) }, { t: 'Cuánto falta', k: (v) => etq(v.d) }, { t: 'Responsable', k: (v) => nombrePersona(R().ref && D().personas.find((p) => p.nombre === v.resp) ? D().personas.find((p) => p.nombre === v.resp).ref : '') }] })}`;
} });

/* ---------- PR-39 Campana y preferencias ---------- */
ruta('avisos', { id: 'PR-39', prio: 'B', fase: 'Fase 2', titulo: 'Mis avisos', acceso: () => APP.rol !== 'plat', render(q) {
  const tab = q.tab || 'bandeja';
  const av = APP.tmp.avisos = APP.tmp.avisos || [['Orden por aprobar', 'OC-000212 de Marta Quispe espera su decisión.', false, '25/10/2026 09:05'], ['Garantía por vencer', 'La garantía de la laptop 5CG3410R7M vence el 12/11/2026.', false, '25/10/2026 08:00'], ['Rol cambiado', 'Su rol en esta empresa cambió a Técnico.', false, '24/10/2026 17:30'], ['Respuesta en su caso', 'Hay una respuesta nueva en AYU-000118.', true, '24/10/2026 10:12']];
  return `${cabeceraPantalla('Mis avisos', '<span class="id-pantalla">PR-39 · muestra</span>')}${muestra('Fase 2')}
  ${pestanas('av', [{ k: 'bandeja', t: 'Bandeja', n: av.filter((a) => !a[2]).length }, { k: 'pref', t: 'Preferencias' }], tab)}
  ${panel('av', 'bandeja', tab, `<div class="fila" style="margin-bottom:8px"><button class="btn chico" type="button" data-acc="av-todas">Marcar todas como leídas</button></div><ul class="pila" style="list-style:none;padding:0;margin:0">${av.map((a, i) => `<li class="tarjeta fila entre"><div><strong>${a[0]}</strong> ${a[2] ? chip('Cerrado').replace('Cerrado', 'Leído') : chip('Nuevo').replace('Nuevo', 'Sin leer')}<br><span class="suave">${a[1]}</span><br><span class="suave chica">${a[3]}</span></div>${a[2] ? '' : `<button class="btn chico" type="button" data-acc="av-leer" data-i="${i}">Marcar como leída</button>`}</li>`).join('')}</ul>`)}
  ${panel('av', 'pref', tab, `<p>Elija cómo quiere recibir cada grupo de avisos. Los avisos de seguridad y de acceso no se pueden apagar.</p>${tabla({ filas: [['Seguridad y acceso', true], ['Compras y aprobaciones', false], ['Mis casos de ayuda', false], ['Vencimientos', false]], cols: [{ t: 'Grupo de avisos', k: (g) => g[0] }, { t: 'En la plataforma', k: (g) => g[1] ? 'Siempre' : '<select aria-label="En la plataforma"><option>Activado</option><option>Apagado</option></select>' }, { t: 'Por correo', k: (g) => g[1] ? `<span class="btn-con-razon"><button class="btn chico" aria-disabled="true" type="button">Inmediato</button><span class="razon">${icono('info')}<span>Aviso obligatorio: no se puede apagar ni resumir.</span></span></span>` : '<select aria-label="Por correo"><option>Inmediato</option><option>Resumen diario</option><option>Resumen semanal</option><option>Apagado</option></select>' }] })}`)}`;
} });
ACC['av-leer'] = (el) => { APP.tmp.avisos[Number(el.dataset.i)][2] = true; render(true); };
ACC['av-todas'] = () => { APP.tmp.avisos.forEach((a) => { a[2] = true; }); render(true); };

/* ---------- PR-40 Licencias ---------- */
const LICS = [['Microsoft 365 Business Standard', 50, 38, 41, '20/10/2026'], ['Adobe Acrobat Pro', 10, 12, 10, '18/10/2026'], ['AutoCAD 2026', 5, 5, 5, '02/07/2026'], ['Antivirus corporativo', 60, 60, 60, '15/10/2026']];
function estadoLic(l) {
  const [, comp, asig, uso, fecha] = l;
  if (asig > comp || uso > comp) return 'Déficit';
  const dias = (HOY - parseF(fecha)) / 86400000;
  if (dias > 90) return 'Sin verificar';
  if (comp - Math.max(asig, uso) >= 1 && (comp - Math.max(asig, uso)) / comp > 0.1) return 'Excedente';
  return 'En regla';
}
ruta('licencias', { id: 'PR-40', prio: 'B', fase: 'Fase 2', titulo: 'Licencias de software', acceso: 'licencias.ver', render() {
  return `${cabeceraPantalla('Licencias de software', '<span class="id-pantalla">PR-40 · muestra</span>')}${muestra('Fase 2')}
  ${aviso('atencion', 'Cuadre interno de puestos', 'No sustituye una auditoría del fabricante.')}
  ${tabla({ filas: LICS, cols: [{ t: 'Producto', k: (l) => esc(l[0]) }, { t: 'Comprados', cls: 'num', k: (l) => l[1] }, { t: 'Asignados', cls: 'num', k: (l) => l[2] }, { t: 'En uso informado', cls: 'num', k: (l) => l[3] + '<br><span class="suave chica">al ' + l[4] + '</span>' }, { t: 'Disponibles', cls: 'num', k: (l) => l[1] - l[2] }, { t: 'Estado', k: (l) => chip(estadoLic(l)) }] })}
  <section class="tarjeta" style="margin-top:16px"><h2>Clave de la licencia (dato secreto)</h2><p>Las claves se guardan cifradas y se muestran enmascaradas. Verlas completas exige un permiso aparte y una segunda verificación, dura 30 segundos y queda en la auditoría <strong>sin guardar la clave</strong>.</p>
  <p><span id="clave-mask" class="secreto" style="font-size:1.2rem">••••••••-AB12</span> <span id="clave-t" class="suave chica"></span></p>
  <div class="fila">${btnAcc({ texto: 'Revelar la clave', icono: 'ojo', acc: 'clave-revelar', perm: 'licencias.ver_clave' })}${puede('licencias.ver_clave') ? '' : '<span class="razon">' + icono('info') + '<span>Su rol no tiene el permiso «Ver la clave completa». Solo el Administrador lo tiene.</span></span>'}</div></section>`;
} });
let _tclave = null;
ACC['clave-revelar'] = () => dialogoMotivo({ titulo: 'Revelar la clave de licencia', verbo: 'Revelar', etiqueta: 'Motivo de la consulta', texto: 'Se pide su segunda verificación reciente. Máximo 20 consultas por hora.', alConfirmar: () => {
  const m = document.getElementById('clave-mask'), t = document.getElementById('clave-t'); let s = 30; m.textContent = 'MK7P-93QX-AB12'; clearInterval(_tclave);
  const pintar = () => { t.textContent = s > 5 ? `Se ocultará en ${s} s` : `Se oculta en ${s} s`; if (s === 5) toast('La clave se ocultará en 5 segundos.'); };
  pintar(); _tclave = setInterval(() => { s--; if (!document.contains(m)) { clearInterval(_tclave); return; } if (s <= 0) { clearInterval(_tclave); m.textContent = '••••••••-AB12'; t.textContent = 'Clave ocultada.'; } else pintar(); }, 1000);
} });

/* ---------- PR-41 Presupuesto ---------- */
ruta('presupuesto', { id: 'PR-41', prio: 'B', fase: 'Fase 3', titulo: 'Presupuesto y ejecución', acceso: 'presupuesto.ver', render() {
  const bloque = (mon, filas) => `<h2 style="margin-top:16px">Presupuesto 2026 en ${mon}</h2>${tabla({ filas, cols: [{ t: 'Centro de costo · rubro', k: (f) => esc(f[0]) }, { t: 'Vigente', cls: 'num', k: (f) => dinero(f[1], mon) }, { t: 'Ejecutado', cls: 'num', k: (f) => dinero(f[2], mon) }, { t: 'Comprometido', cls: 'num', k: (f) => dinero(f[3], mon) }, { t: 'Disponible', cls: 'num', k: (f) => dinero(f[1] - f[2] - f[3], mon) }, { t: 'Ejecución', k: (f) => { const p = Math.round(100 * (f[2] + f[3]) / f[1]); return p >= 100 ? chipCalc(`Excedido (${p} %)`, 'alerta') : p >= 80 ? chipCalc(`Atención (${p} %)`, 'atencion') : chipCalc(`Normal (${p} %)`, 'exito'); } }] })}`;
  return `${cabeceraPantalla('Presupuesto y ejecución', '<span class="id-pantalla">PR-41 · muestra</span>')}${muestra('Fase 3')}
  ${valor('precios.ver') === 'T' ? '' : aviso('sensible', 'Sin permiso para ver precios', 'Esta pantalla necesita además el permiso «Ver precios».')}
  ${bloque('PEN', [['Soporte TI · Laptops', 120000, 96000, 8000], ['Ventas · Celulares', 30000, 15000, 0], ['Soporte TI · Periféricos', 8000, 7200, 1200]])}${bloque('USD', [['Soporte TI · Licencias', 4000, 1800, 0]])}
  ${aviso('info', 'No existe un «total general»', 'Cada moneda se muestra en su propio bloque: la plataforma no convierte monedas ni suma importes de monedas distintas.')}
  <p class="suave chica">Las etiquetas de ejecución se calculan solas (atención desde 80 %, excedido desde 100 %). La depreciación es referencial de gestión y no sustituye la contabilidad.</p>`;
} });

/* ---------- PR-42 Mapa de servicios ---------- */
ruta('mapa-servicios', { id: 'PR-42', prio: 'B', fase: 'Fase 3', titulo: 'Mapa de servicios', acceso: 'cmdb.ver', render() {
  const nombres = puede('datos_personales.ver');
  return `${cabeceraPantalla('Mapa de servicios · si cae un elemento', '<span class="id-pantalla">PR-42 · muestra</span>')}${muestra('Fase 3')}
  <div class="campo" style="max-width:420px"><label for="mp-e">Elemento</label><select id="mp-e"><option>Dominio andina.example.pe</option><option>Servidor de archivos</option></select></div>
  <div class="rejilla dos"><section class="tarjeta"><h2>Se afecta</h2><ul class="arbol"><li>${chip('Alerta', 'alerta').replace('Alerta', 'Criticidad Alta')} <strong>Correo corporativo</strong> (servicio)<ul><li>Depende del dominio <span class="cod">andina.example.pe</span></li></ul></li><li>${chip('Atención', 'atencion').replace('Atención', 'Criticidad Media')} <strong>Sitio web institucional</strong></li></ul></section>
  <section class="tarjeta"><h2>Podría afectarse</h2><ul><li>40 laptops que usan el correo</li><li>1 línea móvil de alertas</li></ul></section>
  <section class="tarjeta"><h2>Personas alcanzadas</h2>${nombres ? '<p>12 personas: Pablo Soto, Tomás Herrera, Diego Salazar y otras 9.</p>' : '<p><strong>12 personas</strong> <span class="oculto">' + icono('candado') + 'Nombres ocultos</span></p><p class="suave chica">Sin el permiso «Ver datos personales» solo se ve la cantidad.</p>'}</section>
  <section class="tarjeta"><h2>Criticidad máxima</h2><p>${chip('Alerta', 'alerta').replace('Alerta', 'Alta')}</p><p class="suave chica">Es la más alta entre los elementos afectados.</p></section></div>
  <p class="suave chica">Esta vista no usa diagrama: es una lista y un árbol, que se entienden con teclado y lector de pantalla.</p>`;
} });

/* ---------- PR-43 Cambios ---------- */
const CAMBIOS = [['CAM-000012', 'Cambiar el router principal de la oficina', 'Medio', 'Pendiente de aprobación', 'Marta Quispe', 'Sábado 31/10/2026 22:00'], ['CAM-000011', 'Parche mensual de Windows (estándar)', 'Bajo', 'Aprobada', 'Marta Quispe', '22/10/2026'], ['CAM-000010', 'Migrar el correo a la nube', 'Alto', 'Cerrada', 'Carlos Díaz', '12/09/2026']];
ruta('cambios', { id: 'PR-43', prio: 'B', fase: 'Fase 3', titulo: 'Cambios', acceso: 'cambios.ver', render() {
  const dec = CAMBIOS[0];
  const tuya = dec[4] === R().persona;
  return `${cabeceraPantalla('Cambios de TI', '<span class="id-pantalla">PR-43 · muestra</span>')}${muestra('Fase 3')}
  ${tabla({ filas: CAMBIOS, cols: [{ t: 'Cambio', k: (c) => `<span class="cod">${c[0]}</span>` }, { t: 'Qué', k: (c) => esc(c[1]) }, { t: 'Riesgo', k: (c) => chip(c[2], c[2] === 'Alto' ? 'alerta' : c[2] === 'Medio' ? 'atencion' : 'neutro').replace(c[2], 'Riesgo ' + c[2]) }, { t: 'Estado', k: (c) => chip(c[3]) }, { t: 'Pedido por', k: (c) => c[4] }, { t: 'Cuándo', k: (c) => c[5] }] })}
  <section class="tarjeta principal-rol" style="margin-top:16px"><h2>Decisión sobre ${dec[0]}</h2>
  <dl class="lista-datos"><dt>Qué se hará</dt><dd>${dec[1]}</dd><dt>Riesgo</dt><dd>Impacto Medio × Probabilidad Media = ${chip('Riesgo Medio', 'atencion')} (el sistema sugirió Medio porque 35 laptops dependen del Wi-Fi)</dd><dt>Elementos afectados</dt><dd>Wi-Fi oficinas (criticidad Media)</dd><dt>Plan de vuelta atrás</dt><dd>Reponer el router anterior (15 minutos)</dd><dt>Calendario</dt><dd>${chipCalc('Dentro de una ventana permitida', 'exito')} Sin cambios que choquen</dd></dl>
  <div class="fila" style="margin-top:12px">${btnAcc({ texto: 'Aprobar', clase: 'primario', icono: 'check', acc: 'cam-dec', datos: { t: 'aprobar' }, perm: 'cambios.aprobar', bloqueo: tuya ? 'Usted pidió este cambio: debe aprobarlo otra persona.' : '' })}${btnAcc({ texto: 'Rechazar', clase: 'peligro', acc: 'cam-dec', datos: { t: 'rechazar' }, perm: 'cambios.aprobar', bloqueo: tuya ? 'Usted pidió este cambio: debe decidirlo otra persona.' : '' })}</div>
  ${puede('cambios.aprobar') ? '' : '<p class="suave chica">Su rol no aprueba cambios: aquí no verá los botones.</p>'}<p class="suave chica">Es el mismo bloque de decisión que usa una orden de compra: resumen, motivo si rechaza, y los mismos botones.</p></section>`;
} });
ACC['cam-dec'] = (el) => el.dataset.t === 'rechazar' ? dialogoMotivo({ titulo: 'Rechazar el cambio CAM-000012', verbo: 'Rechazar', destructivo: true, alConfirmar: () => toast('Cambio rechazado (simulado).') }) : abrirDialogo({ titulo: 'Aprobar el cambio CAM-000012', cuerpo: '<p>Se guardará quién aprobó y con qué riesgo.</p>', botones: [{ texto: 'Volver' }, { texto: 'Aprobar', clase: 'primario', alPulsar: () => toast('Cambio aprobado (simulado).') }] });

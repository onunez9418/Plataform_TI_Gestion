/* =========================================================================
   Pantallas comunes: ingreso, empresa, inicio por rol, bandejas, buscador,
   guía visual, mensajes, mis permisos, mi cuenta, pedir ayuda, portal.
   ========================================================================= */
'use strict';

/* ---------- Lista de pantallas del prototipo (también alimenta #/pantallas) ---------- */
const LISTA_PANTALLAS = [
  ['PR-00', 'Guía visual y componentes', 'A', '#/guia', 'Cualquiera'],
  ['PR-01', 'Ingreso por enlace al correo', 'A', '#/ingreso', 'Cualquiera'],
  ['PR-02', 'Elegir empresa y barra con empresa activa', 'A', '#/empresa', 'Cualquiera'],
  ['PR-03', 'Inicio Almacén «Por recibir»', 'A', '#/inicio', 'Almacén'],
  ['PR-04', 'Inicio Técnico «Mi trabajo»', 'A', '#/inicio', 'Técnico'],
  ['PR-05', 'Inicio Jefatura «Por aprobar»', 'A', '#/inicio', 'Jefatura TI'],
  ['PR-06', 'Búsqueda global', 'A', '#/buscar?q=LAP', 'Técnico'],
  ['PR-07', 'Lista de artículos (SKU)', 'A', '#/skus', 'Técnico'],
  ['PR-08', 'Ficha del SKU (series y campos por SKU y por unidad)', 'A', '#/sku?id=CEL-0001', 'Técnico'],
  ['PR-09', 'Crear o editar SKU', 'A', '#/sku-nuevo', 'Administrador'],
  ['PR-10', 'Categorías y campos personalizados', 'A', '#/categorias', 'Administrador'],
  ['PR-11', 'Lista de activos', 'A', '#/activos', 'Técnico'],
  ['PR-12', 'Ficha del activo (cabecera y 7 pestañas)', 'A', '#/activo?id=A2', 'Técnico'],
  ['PR-13', 'Entregar equipo y acta imprimible', 'A', '#/entregar?activo=A2', 'Técnico'],
  ['PR-14', 'Cambiar estado (diálogo con motivo)', 'A', '#/activo?id=A2', 'Técnico'],
  ['PR-15', 'Directorio de personas', 'A', '#/personas', 'Técnico'],
  ['PR-16', 'Importar Excel con vista previa', 'A', '#/importar', 'Administrador'],
  ['PR-17', 'Lista de órdenes de compra', 'A', '#/ordenes-compra', 'Jefatura TI'],
  ['PR-18', 'Crear orden de compra', 'A', '#/oc-nueva', 'Técnico'],
  ['PR-19', 'Detalle de OC y aprobación', 'A', '#/oc?id=OC-000212', 'Jefatura TI'],
  ['PR-20', 'Recepción con series en bloque', 'A', '#/recepcion?oc=OC-000205', 'Almacén'],
  ['PR-21', 'Usuarios', 'A', '#/usuarios', 'Administrador'],
  ['PR-22', 'Roles y matriz de permisos', 'A', '#/roles', 'Administrador'],
  ['PR-23', 'Auditoría', 'A', '#/auditoria', 'Administrador'],
  ['PR-24', 'Consola de plataforma', 'A', '#/plataforma', 'Administrador de plataforma'],
  ['PR-25', 'Mensajes de error, permiso y bloqueo', 'A', '#/mensajes', 'Cualquiera'],
  ['PR-26', 'Primer ingreso: privacidad y segunda verificación', 'B', '#/primer-ingreso', 'Cualquiera'],
  ['PR-27', 'Inicio Administrador y «Primeros pasos»', 'B', '#/inicio', 'Administrador (empresa Santa Aurora)'],
  ['PR-28', 'Inicio Solicitante y Solo lectura', 'B', '#/inicio', 'Solicitante'],
  ['PR-29', 'Catálogos y ubicaciones', 'B', '#/catalogos', 'Técnico'],
  ['PR-30', 'Devolver equipo y traspasar', 'B', '#/devolver?activo=A1', 'Técnico'],
  ['PR-31', 'Stock por cantidad: ingreso, salida y traslado', 'B', '#/stock', 'Almacén'],
  ['PR-32', 'Ficha de la persona y asistente de cese', 'B', '#/persona?id=PRS-0012', 'Jefatura TI'],
  ['PR-33', 'Órdenes de servicio y «Pedir ayuda»', 'B', '#/ordenes-servicio', 'Técnico'],
  ['PR-34', 'Configuración de la empresa y módulos activos', 'B', '#/configuracion', 'Administrador'],
  ['PR-35', 'Mi cuenta y seguridad', 'B', '#/mi-cuenta', 'Cualquiera'],
  ['PR-36', 'Muestra: portal del empleado', 'B', '#/portal', 'Empleado del portal'],
  ['PR-37', 'Muestra: mesa de ayuda, caso con plazos', 'B', '#/casos', 'Técnico'],
  ['PR-38', 'Muestra: Vencimientos', 'B', '#/vencimientos', 'Jefatura TI'],
  ['PR-39', 'Muestra: campana y preferencias de avisos', 'B', '#/avisos', 'Técnico'],
  ['PR-40', 'Muestra: licencias, cumplimiento y revelar clave', 'B', '#/licencias', 'Administrador'],
  ['PR-41', 'Muestra: presupuesto y ejecución', 'B', '#/presupuesto', 'Jefatura TI'],
  ['PR-42', 'Muestra: mapa de servicios, vista de impacto', 'B', '#/mapa-servicios', 'Técnico'],
  ['PR-43', 'Muestra: cambios, decisión de aprobación', 'B', '#/cambios', 'Jefatura TI']
];
/* Otras pantallas del prototipo (apoyo): bandejas, permisos, soporte, etc. */
const LISTA_APOYO = [
  ['Por aprobar (bandeja única)', '#/por-aprobar', 'Jefatura TI'], ['Mi trabajo (bandeja del Técnico)', '#/mi-trabajo', 'Técnico'],
  ['Mi espacio', '#/mi-espacio', 'Cualquiera'], ['Mis permisos', '#/mis-permisos', 'Cualquiera'],
  ['Autorizar soporte por 24 horas', '#/soporte', 'Administrador'], ['Recepciones (por recibir)', '#/recepciones', 'Almacén'],
  ['Entregas y devoluciones (actas)', '#/entregas', 'Técnico'], ['Proveedores', '#/proveedores', 'Jefatura TI'], ['Pedir ayuda', '#/pedir-ayuda', 'Solicitante']
];

ruta('pantallas', { id: '', titulo: 'Lista de pantallas', render() {
  const filas = LISTA_PANTALLAS.map((p) => ({ id: p[0], n: p[1], pr: p[2], h: p[3], rol: p[4] }));
  return `${cabeceraPantalla('Lista de pantallas del prototipo')}<p>Esta es la lista de las <strong>26 pantallas de prioridad A</strong> (las que debe ver para aprobar el diseño) y las <strong>18 de prioridad B</strong> (completan el recorrido o son muestras de módulos futuros). Cada enlace abre la pantalla; la columna «Rol sugerido» dice con qué rol se ve mejor (use el selector «Probar como» de arriba).</p>
  ${tabla({ cols: [{ t: 'Código', k: (f) => `<span class="cod">${f.id}</span>` }, { t: 'Pantalla', k: (f) => `<a href="${f.h}">${esc(f.n)}</a>` }, { t: 'Prioridad', k: (f) => chipEtq('Prioridad ' + f.pr) }, { t: 'Rol sugerido', k: (f) => esc(f.rol) }], filas })}
  <h2 style="margin-top:24px">Pantallas de apoyo</h2>${tabla({ cols: [{ t: 'Pantalla', k: (f) => `<a href="${f[1]}">${esc(f[0])}</a>` }, { t: 'Rol sugerido', k: (f) => esc(f[2]) }], filas: LISTA_APOYO })}`;
} });

/* ---------- PR-01 Ingreso ---------- */
ruta('ingreso', { id: 'PR-01', titulo: 'Ingreso', layout: 'solo', render() {
  const enviado = APP.tmp.ingresoEnviado;
  return `<div class="tarjeta" style="margin-top:24px">
    <p class="suave sin-margen">${icono('marca')} Plataforma de Gestión de Áreas de TI</p>
    <h1 id="titulo-pantalla" tabindex="-1">${enviado ? 'Revise su correo' : 'Entrar a la plataforma'}</h1>
    ${enviado ? `${aviso('exito', 'Si el correo tiene una cuenta o una invitación, le enviamos un enlace.', 'El enlace dura 15 minutos y sirve una sola vez. Este mensaje es el mismo exista o no el correo, para proteger a las personas.')}
      <p>Cuando abra el enlace verá un botón <strong>«Entrar»</strong>. Pulse ese botón para terminar el ingreso.</p>
      <div class="fila"><a class="btn primario" href="#/empresa" data-acc="enlace-abierto">Simular que abro el enlace</a><button class="btn" type="button" data-acc="ingreso-reiniciar">Usar otro correo</button></div>`
      : `<p>No hay contraseñas. Escriba su correo y le enviaremos un enlace para entrar.</p>
      <form data-form="ingreso" novalidate><div class="campo"><label for="correo">Correo electrónico <span class="obligatorio">(obligatorio)</span></label><input id="correo" type="email" autocomplete="email" placeholder="nombre@empresa.pe" required><div class="error" id="correo-e" hidden>${icono('alerta')}<span>Escriba un correo válido, por ejemplo nombre@empresa.pe.</span></div></div>
      <button class="btn primario" type="submit" style="width:100%">Enviarme el enlace</button></form>
      <p class="suave chica" style="margin-top:16px">Solo entra quien tiene una invitación. No se puede crear una cuenta desde aquí.</p>`}
  </div>`;
} });
ACC['form-ingreso'] = () => {
  const c = document.getElementById('correo');
  const ok = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.value.trim());
  document.getElementById('correo-e').hidden = ok;
  c.setAttribute('aria-invalid', String(!ok));
  if (!ok) { c.focus(); return; }
  APP.tmp.ingresoEnviado = true; render();
};
ACC['ingreso-reiniciar'] = () => { APP.tmp.ingresoEnviado = false; render(); };
ACC['enlace-abierto'] = () => { APP.tmp.ingresoEnviado = false; };

/* ---------- PR-02 Elegir empresa ---------- */
ruta('empresa', { id: 'PR-02', titulo: 'Elegir empresa', layout: 'solo', render() {
  return `<div class="tarjeta" style="margin-top:24px"><h1 id="titulo-pantalla" tabindex="-1">¿Con qué empresa va a trabajar?</h1>
  <p>Su cuenta pertenece a más de una empresa. Cada empresa ve solo sus propios datos. La empresa activa se verá siempre en la barra superior.</p>
  <div class="pila">${Object.values(EMPRESAS).map((e) => `<button type="button" class="btn" style="justify-content:flex-start;height:auto;padding:16px;white-space:normal;text-align:left" data-acc="elegir-empresa" data-e="${e.id}">${icono('edificio')}<span><strong>${esc(e.nombre)}</strong><br><span class="suave chica">Moneda base ${e.moneda} · ${e.nueva ? 'empresa nueva, aún sin configurar' : 'en uso'}</span></span></button>`).join('')}</div>
  <p class="suave chica" style="margin-top:16px">Al cambiar de empresa se recarga todo: no queda ningún dato en pantalla de la empresa anterior y el cambio queda en la auditoría.</p></div>`;
} });
ACC['elegir-empresa'] = (el) => { APP.empresa = el.dataset.e; guardar(); toast('Ahora trabaja en: <strong>' + esc(E().nombre) + '</strong>'); location.hash = '#/inicio'; };

/* ---------- PR-26 Primer ingreso ---------- */
ruta('primer-ingreso', { id: 'PR-26', prio: 'B', titulo: 'Primer ingreso', layout: 'solo', render() {
  const paso = APP.tmp.primer || 1;
  return `<div class="tarjeta" style="margin-top:24px"><ol class="pasos"><li ${paso === 1 ? 'aria-current="step"' : 'class="hecho"'}>Aviso de privacidad</li><li ${paso === 2 ? 'aria-current="step"' : ''}>Segunda verificación</li></ol>
  ${paso === 1 ? `<h1 id="titulo-pantalla" tabindex="-1">Aviso de privacidad y términos</h1>${aviso('atencion', 'Texto provisional', 'El texto definitivo lo redacta o revisa legal. Se muestra aquí solo para probar el recorrido.')}
    <div class="tarjeta" style="max-height:160px;overflow:auto"><p>Esta plataforma guarda su nombre, su correo y los equipos que tiene a su cargo para que el área de TI pueda saber quién tiene qué. Sus datos se usan solo para ese fin, se conservan por el plazo que la empresa defina y usted puede pedir ver, corregir o eliminar sus datos.</p></div>
    <div class="opcion" style="margin-top:12px"><input type="checkbox" id="acepto"><label for="acepto">He leído y acepto el aviso de privacidad y los términos (versión 1.0)</label></div>
    <div class="error" id="acepto-e" hidden style="color:var(--c-peligro);font-weight:600">Debe aceptar para usar la plataforma.</div>
    <button type="button" class="btn primario" data-acc="primer-sig" style="margin-top:12px">Continuar</button>`
  : `<h1 id="titulo-pantalla" tabindex="-1">Active la segunda verificación</h1><p>Su rol puede cambiar permisos y datos sensibles, por eso la segunda verificación es obligatoria. Use una aplicación autenticadora en el celular (sin mensajes de texto).</p>
    <div class="fila" style="align-items:flex-start"><div style="width:140px;height:140px;border:2px dashed var(--c-borde-control);display:flex;align-items:center;justify-content:center;text-align:center;font-size:12px;color:var(--c-texto-suave)" role="img" aria-label="Aquí aparecería el código QR">Código QR de ejemplo</div>
    <div style="flex:1;min-width:200px"><div class="campo"><label for="cod2">Código de 6 dígitos <span class="obligatorio">(obligatorio)</span></label><input id="cod2" inputmode="numeric" maxlength="6" placeholder="123456" autocomplete="one-time-code"></div><a class="btn primario" href="#/inicio" data-acc="primer-fin">Activar y entrar</a></div></div>`}</div>`;
} });
ACC['primer-sig'] = () => { if (!document.getElementById('acepto').checked) { document.getElementById('acepto-e').hidden = false; return; } APP.tmp.primer = 2; render(); };
ACC['primer-fin'] = () => { APP.tmp.primer = 1; };

/* ---------- Inicio por rol (tarjetas) ---------- */
function cuentaActivos() {
  const c = {}; D().activos.forEach((a) => { c[a.estado] = (c[a.estado] || 0) + 1; }); return c;
}
function tarjetaEstados() {
  const c = cuentaActivos();
  const lista = ['En stock', 'Asignado', 'En reparación', 'Extraviado o robado', 'De baja'];
  return tarjeta('Activos por estado', `<ul class="pila" style="list-style:none;margin:0;padding:0">${lista.map((e) => `<li class="fila entre"><span>${chip(e)}</span><strong>${c[e] || 0}</strong></li>`).join('')}</ul><div class="corte">Datos al 25/10/2026 14:05</div><div class="pie"><a href="#/activos">Ver todos los activos</a></div>`, { id: 'c-estados' });
}
function pendientesOC() { return D().ordenes.filter((o) => o.est === 'Pendiente de aprobación'); }
function totalOC(o) { return o.lineas.reduce((s, l) => s + (l.pu || 0) * l.cant * 1.18, 0); }
function filaAprobar(o) {
  const tuya = o.creo === R().persona;
  return `<li class="fila entre" style="border-bottom:1px solid var(--c-borde);padding:8px 0"><span><a href="#/oc?id=${o.num}" class="cod">${o.num}</a> · ${esc(o.prov || 'sin proveedor')}<br><span class="suave chica">Pidió ${esc(o.creo)} · ${dinero(totalOC(o), o.mon)}${tuya ? ' · ' + chip('Excepción activa', 'sensible').replace('Excepción activa', 'La preparó usted') : ''}</span></span><a class="btn chico" href="#/oc?id=${o.num}">Revisar</a></li>`;
}
function inicioAdm() {
  const nueva = E().nueva;
  const pasos = [['Crear categorías y campos', true], ['Crear ubicaciones', true], ['Crear centros de costo', false], ['Cargar proveedores', false], ['Invitar a los demás usuarios', false], ['Importar el inventario actual desde Excel', false]];
  const primeros = nueva ? tarjeta('Primeros pasos de la empresa', `<p>Esta empresa es nueva. Complete estos pasos para empezar a trabajar.</p><ol class="pila" style="list-style:none;padding:0;margin:0">${pasos.map((p) => `<li class="opcion">${p[1] ? chip('Hecho') : chip('Sin iniciar')}<span>${p[0]}</span></li>`).join('')}</ol><div class="pie"><a class="btn primario chico" href="#/importar">Importar inventario</a><a class="btn chico" href="#/categorias">Categorías</a></div>`, { cls: 'principal-rol' }) : '';
  const aprobar = pendientesOC();
  return `${cabeceraPantalla('Resumen de la empresa', '<span class="id-pantalla">PR-27 · Resumen y Primeros pasos</span>')}${nueva ? aviso('info', 'Está viendo una empresa nueva.', 'Cambie a «Distribuidora Andina S.A.» arriba para ver una empresa en uso.') : ''}
  <div class="rejilla">${primeros}${tarjetaEstados()}
  ${tarjeta('Por aprobar', `<div class="cifra">${aprobar.length}</div><div class="cifra-etq">órdenes de compra esperando decisión</div><div class="pie"><a href="#/por-aprobar">Abrir la bandeja</a></div>`)}
  ${tarjeta('Por recibir', `<div class="cifra">${D().ordenes.filter((o) => ['Emitida', 'Recibida parcial'].includes(o.est)).length}</div><div class="cifra-etq">órdenes con mercadería pendiente</div><div class="pie"><a href="#/recepciones">Ver recepciones</a></div>`)}
  ${tarjeta('Usuarios', `<div class="cifra">${D().usuarios.filter((u) => u.estado === 'Invitado').length}</div><div class="cifra-etq">invitaciones sin aceptar</div><div class="pie"><a href="#/usuarios">Ver usuarios</a></div>`)}
  ${APP.modulos.vencimientos ? tarjeta('Vencimientos próximos <span class="chip etq">Fase 2</span>', `<div class="cifra">3</div><div class="cifra-etq">en los próximos 30 días</div><div class="pie"><a href="#/vencimientos">Ver vencimientos</a></div>`) : ''}
  </div>`;
}
function inicioJef() {
  const lista = pendientesOC();
  return `${cabeceraPantalla('Por aprobar', '<span class="id-pantalla">PR-05 · Inicio de Jefatura TI</span>')}
  <div class="rejilla ancha"><section class="tarjeta principal-rol" aria-label="Por aprobar"><h2>Esperan su decisión (${lista.length})</h2>${lista.length ? `<ul style="list-style:none;margin:0;padding:0">${lista.map(filaAprobar).join('')}</ul>` : vacio({ titulo: 'No hay nada por aprobar', texto: 'Cuando alguien envíe una orden, aparecerá aquí.' })}<div class="pie"><a href="#/por-aprobar">Abrir la bandeja completa (con pestañas por tipo)</a></div></section>
  <div class="pila">${APP.modulos.vencimientos ? tarjeta('Vencimientos próximos <span class="chip etq">Fase 2</span>', `<ul class="pila" style="list-style:none;margin:0;padding:0">${VENCIMIENTOS.slice(0, 4).map((v) => `<li class="fila entre"><span>${esc(v.tipo)}: ${esc(v.que.split(' · ')[0])}</span>${chipCalc(diasHasta(new Date(v.fecha)) < 0 ? 'Vencido' : 'Faltan ' + diasHasta(new Date(v.fecha)) + ' días', diasHasta(new Date(v.fecha)) < 0 ? 'alerta' : 'atencion')}</li>`).join('')}</ul><div class="pie"><a href="#/vencimientos">Ver todos</a></div>`) : ''}${tarjetaEstados()}</div></div>`;
}
function inicioTec() {
  const mias = D().ordenesServicio.filter((o) => o.asigna === R().persona && !['Cerrada', 'Cancelada'].includes(o.est));
  const rep = D().activos.filter((a) => a.estado === 'En reparación');
  return `${cabeceraPantalla('Mi trabajo', '<span class="id-pantalla">PR-04 · Inicio del Técnico</span>')}
  <div class="rejilla ancha"><section class="tarjeta principal-rol" aria-label="Mi trabajo"><h2>Lo que tengo que hacer (${mias.length})</h2>
    ${mias.length ? `<ul style="list-style:none;margin:0;padding:0">${mias.map((o) => `<li class="fila entre" style="border-bottom:1px solid var(--c-borde);padding:8px 0"><span><a class="cod" href="#/os?id=${o.num}">${o.num}</a> · ${esc(o.tipo)}<br><span class="suave chica">${esc(o.desc)}</span></span>${chip(o.est)}</li>`).join('')}</ul>` : vacio({ titulo: 'No tiene trabajo asignado', texto: 'Las órdenes que le asignen aparecerán aquí.' })}
    <div class="pie"><a href="#/mi-trabajo">Abrir mi bandeja completa</a></div></section>
  <div class="pila"><section class="tarjeta" aria-label="Buscar un activo"><h2>Buscar un activo</h2><form data-form="buscar-local"><div class="campo"><label for="q-tec">Serie, IMEI o código</label><input id="q-tec" type="search" placeholder="Ejemplo: 5CG3412H2Q"></div><button class="btn primario" type="submit" style="width:100%">Buscar</button></form></section>
  <section class="tarjeta" aria-label="Acciones frecuentes"><h2>Acciones frecuentes</h2><div class="pila">${btnAcc({ texto: 'Entregar equipo', href: '#/entregar', clase: 'primario', icono: 'siguiente', perm: 'entregas.crear' })}${btnAcc({ texto: 'Devolver equipo', href: '#/devolver', icono: 'caja', perm: 'entregas.devolver' })}</div></section>
  ${tarjeta('En reparación', `<div class="cifra">${rep.length}</div><div class="cifra-etq">equipos fuera de servicio</div><div class="pie"><a href="#/activos?estado=En%20reparaci%C3%B3n">Ver equipos</a></div>`)}</div></div>`;
}
ACC['form-buscar-local'] = (f) => { const v = f.querySelector('input').value.trim(); location.hash = '#/buscar' + (v ? '?q=' + encodeURIComponent(v) : ''); };
function inicioAlm() {
  const por = D().ordenes.filter((o) => ['Emitida', 'Recibida parcial'].includes(o.est));
  const bajo = D().skus.filter((s) => s.control === 'cantidad' && s.min > 0 && D().stock.filter((x) => x.sku === s.cod).reduce((a, x) => a + x.saldo, 0) < s.min);
  return `${cabeceraPantalla('Por recibir', '<span class="id-pantalla">PR-03 · Inicio de Almacén</span>')}
  <div class="rejilla ancha"><section class="tarjeta principal-rol" aria-label="Por recibir"><h2>Órdenes esperando mercadería (${por.length})</h2>
    ${por.length ? `<ul style="list-style:none;margin:0;padding:0">${por.map((o) => { const pend = o.lineas.reduce((s, l) => s + (l.cant - l.rec), 0); return `<li class="fila entre" style="border-bottom:1px solid var(--c-borde);padding:8px 0"><span><span class="cod">${o.num}</span> · ${esc(o.prov)}<br><span class="suave chica">Emitida el ${o.fecha} · ${pend} unidades pendientes</span></span><a class="btn primario chico" href="#/recepcion?oc=${o.num}">Recibir mercadería</a></li>`; }).join('')}</ul>` : vacio({ titulo: 'Nada por recibir', texto: 'Cuando se emita una orden, aparecerá aquí.' })}
  </section>
  <div class="pila"><section class="tarjeta" aria-label="Buscar una serie"><h2>Buscar una serie</h2><form data-form="buscar-local"><div class="campo"><label for="q-alm">Número de serie</label><input id="q-alm" type="search" placeholder="Ejemplo: 5CG3412H2Q"></div><button class="btn primario" type="submit" style="width:100%">Buscar</button></form></section>
  ${tarjeta('Stock bajo el mínimo', bajo.length ? `<div class="cifra">${bajo.length}</div><div class="cifra-etq">artículo(s) por debajo de su mínimo</div><ul>${bajo.map((s) => `<li>${esc(s.nombre)} (mínimo ${s.min})</li>`).join('')}</ul><div class="pie"><a href="#/stock">Ver stock</a></div>` : '<p>Todo en orden.</p>')}
  ${tarjeta('Recepciones en borrador', `<div class="cifra">1</div><div class="cifra-etq">guardada sin terminar (vale 7 días)</div><div class="pie"><a href="#/recepcion?oc=OC-000209">Retomarla</a></div>`)}</div></div>`;
}
function inicioSol() {
  const mias = D().ordenes.filter((o) => o.creo === R().persona);
  const os = D().ordenesServicio.filter((o) => o.pidio === R().persona);
  return `${cabeceraPantalla('Mis solicitudes', '<span class="id-pantalla">PR-28 · Inicio del Solicitante</span>')}
  <div class="rejilla ancha"><section class="tarjeta principal-rol" aria-label="Mis solicitudes"><h2>Lo que he pedido</h2>
   ${mias.length || os.length ? `<ul style="list-style:none;margin:0;padding:0">${mias.map((o) => `<li class="fila entre" style="border-bottom:1px solid var(--c-borde);padding:8px 0"><span><a class="cod" href="#/oc?id=${o.num}">${o.num}</a> · Solicitud de compra<br><span class="suave chica">${o.lineas.map((l) => l.cant + ' × ' + l.sku).join(', ')}</span></span>${chip(o.est)}</li>`).join('')}${os.map((o) => `<li class="fila entre" style="border-bottom:1px solid var(--c-borde);padding:8px 0"><span><a class="cod" href="#/os?id=${o.num}">${o.num}</a> · ${esc(o.tipo)}<br><span class="suave chica">${esc(o.desc)}</span></span>${chip(o.est)}</li>`).join('')}</ul>` : vacio({ titulo: 'Aún no ha pedido nada', texto: 'Use «Pedir ayuda» o «Nueva solicitud de compra».' })}</section>
  <div class="pila">${tarjeta('Empezar', `<div class="pila">${btnAcc({ texto: 'Pedir ayuda', href: '#/pedir-ayuda', clase: 'primario', icono: 'ayuda', perm: ['ordenes_servicio.crear', 'ayuda.caso_crear'] })}${btnAcc({ texto: 'Nueva solicitud de compra', href: '#/oc-nueva', icono: 'compra', perm: 'ordenes_compra.crear_editar' })}</div><p class="suave chica" style="margin-top:8px">En una solicitud de compra usted indica qué artículos y cuántos. TI completa los precios.</p>`)}</div></div>`;
}
function inicioSL() {
  const c = cuentaActivos();
  return `${cabeceraPantalla('Buscador', '<span class="id-pantalla">PR-28 · Inicio de Solo lectura</span>')}
  <section class="tarjeta principal-rol" aria-label="Buscador"><h2>¿Qué busca?</h2><form data-form="buscar-local"><div class="fila"><div class="campo" style="flex:1;min-width:220px;margin:0"><label for="q-sl" class="oculto-visual">Buscar</label><input id="q-sl" type="search" placeholder="SKU, serie, orden…" style="min-height:52px;font-size:1.1rem"></div><button class="btn primario" style="min-height:52px" type="submit">${icono('buscar')} Buscar</button></div></form></section>
  <div class="rejilla" style="margin-top:16px">${tarjeta('Activos vigentes', `<div class="cifra">${(c['En stock'] || 0) + (c['Asignado'] || 0) + (c['En reparación'] || 0)}</div><div class="cifra-etq">en stock, asignados o en reparación</div>`)}${tarjetaEstados()}</div>`;
}
ruta('inicio', { id: '', titulo: 'Inicio', render(q) {
  switch (APP.rol) {
    case 'adm': return inicioAdm();
    case 'jef': return inicioJef();
    case 'tec': return inicioTec();
    case 'alm': return inicioAlm();
    case 'sol': return inicioSol();
    case 'sl': return inicioSL();
    case 'emp': return portalPantalla('inicio');
    default: return plataformaPantalla('empresas');
  }
} });

/* ---------- Bandejas ---------- */
ruta('por-aprobar', { id: '', titulo: 'Por aprobar', acceso: ['ordenes_compra.aprobar', 'ordenes_servicio.aprobar'], render(q) {
  const tab = q.tab || 'oc';
  const oc = pendientesOC();
  const tabs = [{ k: 'oc', t: 'Órdenes de compra', n: oc.length }];
  if (APP.modulos.cambios) tabs.push({ k: 'cambios', t: 'Cambios', n: 1 });
  if (APP.modulos.presupuesto) tabs.push({ k: 'ppt', t: 'Presupuestos', n: 0 });
  if (APP.modulos.casos) tabs.push({ k: 'sol', t: 'Solicitudes de ayuda', n: 0 });
  const filaOC = (o) => ({ cod: o.num, que: o.prov || 'sin proveedor', monto: dinero(totalOC(o), o.mon), pidio: o.creo, fecha: o.fecha, tuya: o.creo === R().persona, otra: o.mon !== E().moneda });
  const filas = oc.map(filaOC);
  return `${cabeceraPantalla('Por aprobar', '<span class="id-pantalla">Una sola bandeja · verbo único «Aprobar»</span>')}
  <p>Aquí llegan todas las decisiones que esperan a una persona con permiso. El verbo es siempre <strong>Aprobar</strong> o <strong>Rechazar</strong>.</p>
  ${pestanas('apr', tabs, tab)}
  ${panel('apr', 'oc', tab, tabla({ filas, vacio: { titulo: 'No hay órdenes por aprobar', texto: 'Cuando alguien envíe una, aparecerá aquí.' }, cols: [
    { t: 'Orden', k: (f) => `<a class="cod" href="#/oc?id=${f.cod}">${f.cod}</a>` }, { t: 'Proveedor', k: (f) => esc(f.que) }, { t: 'Monto con impuesto', cls: 'num', k: (f) => f.monto + (f.otra ? ' ' + chipEtq('Otra moneda: siempre pasa por aprobación') : '') },
    { t: 'Pedido por', k: (f) => esc(f.pidio) }, { t: 'Fecha', k: (f) => f.fecha },
    { t: 'Decisión', sin: true, k: (f) => f.tuya ? `<span class="btn-con-razon"><a class="btn chico" href="#/oc?id=${f.cod}" aria-describedby="r-${f.cod}">Revisar</a><span class="razon" id="r-${f.cod}">${icono('info')}<span>Usted la preparó: debe aprobarla otra persona.</span></span></span>` : `<a class="btn primario chico" href="#/oc?id=${f.cod}">Revisar</a>` }] }))}
  ${panel('apr', 'cambios', tab, `${aviso('info', 'Muestra de la Fase 3', 'Los cambios de TI pasan por esta misma bandeja y usan el mismo bloque de decisión que una orden de compra.')}${tabla({ cols: [{ t: 'Cambio', k: (f) => `<a class="cod" href="#/cambios">${f[0]}</a>` }, { t: 'Qué', k: (f) => f[1] }, { t: 'Riesgo', k: (f) => chip(f[2], f[2] === 'Medio' ? 'atencion' : 'neutro') }, { t: 'Pedido por', k: (f) => f[3] }], filas: [['CAM-000012', 'Cambiar el router principal de la oficina', 'Medio', 'Marta Quispe']] })}`)}
  ${panel('apr', 'ppt', tab, vacio({ titulo: 'No hay presupuestos por aprobar', texto: 'Muestra de la Fase 3.' }))}
  ${panel('apr', 'sol', tab, vacio({ titulo: 'No hay solicitudes de ayuda por aprobar', texto: 'Muestra de la Fase 2.' }))}`;
} });
ruta('mi-trabajo', { id: '', titulo: 'Mi trabajo', acceso: () => APP.rol === 'tec', render(q) {
  const tab = q.tab || 'os';
  const mias = D().ordenesServicio.filter((o) => o.asigna === R().persona);
  return `${cabeceraPantalla('Mi trabajo', '<span class="id-pantalla">Una sola bandeja con pestañas por tipo</span>')}
  ${pestanas('mt', [{ k: 'os', t: 'Órdenes de servicio', n: mias.length }, { k: 'casos', t: 'Casos', n: APP.modulos.casos ? 2 : null }, { k: 'tareas', t: 'Tareas y mantenimientos', n: 1 }].filter((t) => t.k === 'os' || (t.k === 'casos' ? APP.modulos.casos : true)), tab)}
  ${panel('mt', 'os', tab, tabla({ filas: mias, cols: [{ t: 'Orden', k: (f) => `<a class="cod" href="#/os?id=${f.num}">${f.num}</a>` }, { t: 'Tipo', k: (f) => esc(f.tipo) }, { t: 'Qué hay que hacer', k: (f) => esc(f.desc) }, { t: 'Estado', k: (f) => chip(f.est) }] }))}
  ${panel('mt', 'casos', tab, `${aviso('info', 'Muestra de la Fase 2', 'Los casos de la mesa de ayuda aparecen aquí, junto a las órdenes, para no tener que mirar cuatro pantallas.')}${tabla({ cols: [{ t: 'Caso', k: (f) => `<a class="cod" href="#/casos">${f[0]}</a>` }, { t: 'Asunto', k: (f) => f[1] }, { t: 'Plazo', k: (f) => f[2] }], filas: [['AYU-000118', 'Mi laptop no enciende', chipCalc('En riesgo: faltan 40 min', 'atencion')], ['AYU-000121', 'Instalar Office en un equipo nuevo', chipCalc('En plazo', 'exito')]] })}`)}
  ${panel('mt', 'tareas', tab, `${aviso('info', 'Muestra de la Fase 2', 'Tareas de altas y bajas de personal y mantenimientos programados.')}<ul><li>Preparar la laptop de la persona que ingresa el 02/11/2026</li></ul>`)}`;
} });

/* ---------- PR-06 Búsqueda global ---------- */
function ejecutarBusqueda(q) {
  const t = q.trim().toLowerCase();
  const out = { skus: [], activos: [], oc: [], os: [], personas: [] };
  if (!t) return out;
  const d = D();
  const has = (...xs) => xs.some((x) => x && String(x).toLowerCase().includes(t));
  if (puede('skus.ver')) out.skus = d.skus.filter((s) => has(s.cod, s.nombre, s.marca));
  if (puede('activos.ver')) out.activos = d.activos.filter((a) => has(a.serie, a.imei, a.sku));
  if (puede('ordenes_compra.ver')) out.oc = d.ordenes.filter((o) => has(o.num, o.prov));
  if (puede('ordenes_servicio.ver')) out.os = d.ordenesServicio.filter((o) => has(o.num, o.desc));
  if (valor('personas.ver') === 'T') out.personas = d.personas.filter((p) => has(p.ref) || (puede('datos_personales.ver') && has(p.nombre, p.correo)));
  return out;
}
ruta('buscar', { id: 'PR-06', titulo: 'Buscar', acceso: () => APP.rol !== 'plat', render(q) {
  const texto = q.q || '';
  const r = ejecutarBusqueda(texto);
  const grupos = [
    ['skus', 'Artículos (SKU)', (s) => `<a href="#/sku?id=${s.cod}"><span class="cod">${s.cod}</span> ${esc(s.nombre)}</a>`],
    ['activos', 'Activos (series)', (a) => `<a href="#/activo?id=${a.id}"><span class="cod">${esc(a.serie)}</span></a> · ${a.sku} · ${chip(a.estado)}`],
    ['oc', 'Órdenes de compra', (o) => `<a href="#/oc?id=${o.num}"><span class="cod">${o.num}</span></a> · ${esc(o.prov || 'sin proveedor')} · ${chip(o.est)}`],
    ['os', 'Órdenes de servicio', (o) => `<a href="#/os?id=${o.num}"><span class="cod">${o.num}</span></a> · ${esc(o.desc)} · ${chip(o.est)}`],
    ['personas', 'Personas', (p) => `<a href="#/persona?id=${p.ref}">${puede('datos_personales.ver') ? esc(p.nombre) + ' ' : ''}<span class="cod">${p.ref}</span></a> · ${esc(p.area)}`]
  ];
  const total = grupos.reduce((s, g) => s + r[g[0]].length, 0);
  const filtro = APP.tmp.tipoBusqueda || '';
  const exacto = (() => { const t = texto.trim().toUpperCase(); const o = D().ordenes.find((x) => x.num === t); if (o && puede('ordenes_compra.ver')) return { h: '#/oc?id=' + o.num, t: o.num }; const s = D().skus.find((x) => x.cod === t); if (s && puede('skus.ver')) return { h: '#/sku?id=' + s.cod, t: s.cod }; return null; })();
  return `${cabeceraPantalla('Buscar')}
  <form data-form="buscar-local" role="search" class="fila" style="margin-bottom:16px"><div class="campo" style="flex:1;min-width:220px;margin:0"><label for="q-pag" class="oculto-visual">Buscar en la empresa activa</label><input id="q-pag" type="search" value="${esc(texto)}" placeholder="SKU, serie, IMEI, número de orden, persona…" style="min-height:52px"></div><button class="btn primario" style="min-height:52px" type="submit">${icono('buscar')} Buscar</button></form>
  <p class="suave chica">Solo se busca en <strong>${esc(E().nombre)}</strong> y solo lo que su rol permite ver${puede('datos_personales.ver') ? '' : '. Sin el permiso «Ver datos personales», las personas se buscan por su referencia (PRS-0000), no por nombre'}.</p>
  ${exacto ? aviso('info', 'Código exacto encontrado', `<a class="btn primario chico" href="${exacto.h}">Ir directo a ${exacto.t}</a>`) : ''}
  ${texto ? `<div class="fichas-filtro" role="group" aria-label="Filtrar por tipo"><button class="btn chico ${!filtro ? 'primario' : ''}" data-acc="tipo-busq" data-t="" aria-pressed="${!filtro}">Todo (${total})</button>${grupos.map((g) => `<button class="btn chico ${filtro === g[0] ? 'primario' : ''}" data-acc="tipo-busq" data-t="${g[0]}" aria-pressed="${filtro === g[0]}">${g[1]} (${r[g[0]].length})</button>`).join('')}</div>
    ${total ? grupos.filter((g) => r[g[0]].length && (!filtro || filtro === g[0])).map((g) => `<section class="tarjeta" style="margin-bottom:12px" aria-label="${g[1]}"><h2>${g[1]}</h2><ul class="pila" style="list-style:none;margin:0;padding:0">${r[g[0]].slice(0, 8).map((x) => `<li>${g[2](x)}</li>`).join('')}</ul></section>`).join('') : vacio({ titulo: 'No encontramos resultados', texto: 'Revise la ortografía o pruebe con otra parte del código.' })}`
    : `<div class="tarjeta"><h2>Pruebe con estos ejemplos</h2><div class="fila"><a class="btn chico" href="#/buscar?q=LAP-0001">LAP-0001</a><a class="btn chico" href="#/buscar?q=5CG3412H2Q">5CG3412H2Q</a><a class="btn chico" href="#/buscar?q=OC-000212">OC-000212</a><a class="btn chico" href="#/buscar?q=Pablo">Pablo</a><a class="btn chico" href="#/buscar?q=mouse">mouse</a></div></div>`}`;
} });
ACC['tipo-busq'] = (el) => { APP.tmp.tipoBusqueda = el.dataset.t; render(true); };

/* ---------- Mis permisos, Mi espacio, Mi cuenta ---------- */
const NOMBRES_MOD = { plataforma: 'Plataforma', empresa: 'Empresa', usuarios: 'Usuarios', roles: 'Roles', auditoria: 'Auditoría', datos: 'Importar y exportar', datos_personales: 'Datos personales', precios: 'Precios', personas: 'Personas', catalogos: 'Catálogos', ubicaciones: 'Ubicaciones', estructura: 'Áreas y centros de costo', categorias: 'Categorías', proveedores: 'Proveedores', skus: 'Artículos (SKU)', activos: 'Activos', stock: 'Stock', entregas: 'Entregas y devoluciones', ordenes_compra: 'Órdenes de compra', recepciones: 'Recepciones', ordenes_servicio: 'Órdenes de servicio', contratos: 'Contratos', licencias: 'Licencias', lineas: 'Líneas móviles', dominios: 'Dominios y certificados', garantias: 'Garantías', mantenimiento: 'Mantenimiento', presupuesto: 'Presupuesto', tableros: 'Tableros', reportes: 'Reportes', integraciones: 'Integraciones', ayuda: 'Mesa de ayuda', cambios: 'Cambios', problemas: 'Problemas', cmdb: 'Mapa de servicios', onboarding: 'Altas y bajas de personal', portal: 'Portal del empleado', notificaciones: 'Notificaciones' };
ruta('mis-permisos', { id: '', titulo: 'Mis permisos', render() {
  const mias = PERMISOS.filter((p) => p.v[APP.rol] && p.v[APP.rol] !== '-');
  const sens = mias.filter((p) => p.s);
  const sin = PERMISOS.filter((p) => p.s && (!p.v[APP.rol] || p.v[APP.rol] === '-') && !p.n.startsWith('plataforma.'));
  const porMod = {}; mias.forEach((p) => { const m = p.n.split('.')[0]; (porMod[m] = porMod[m] || []).push(p); });
  return `${cabeceraPantalla('Mis permisos', '<span class="id-pantalla">Qué puedo hacer y a quién pedirlo</span>')}
  <p>Su rol es <strong>${esc(R().nombre)}</strong>${APP.rol === 'plat' ? '' : ' en ' + esc(E().nombre)}. Tiene <strong>${mias.length}</strong> de ${PERMISOS.length} permisos del registro. «Solo lo propio» significa que ve únicamente lo que usted creó o le corresponde.</p>
  ${sens.length ? aviso('sensible', 'Permisos sensibles que tiene (' + sens.length + ')', 'Exigen segunda verificación y quedan en la auditoría cuando los usa.') : ''}
  ${Object.keys(porMod).map((m, i) => `<div class="acordeon"><h3><button type="button" aria-expanded="false" aria-controls="pm${i}" data-acc="acordeon">${icono('flecha')}${NOMBRES_MOD[m] || m} <span class="chip etq">${porMod[m].length}</span></button></h3><div class="panel" id="pm${i}" hidden><ul>${porMod[m].map((p) => `<li>${esc(p.q)} ${p.v[APP.rol] === 'P' ? chipEtq('Solo lo propio') : ''} ${p.s ? chip('Sensible', 'sensible') : ''}</li>`).join('')}</ul></div></div>`).join('')}
  <h2 style="margin-top:24px">Permisos sensibles que no tiene</h2><p class="suave">Si necesita alguno, pídaselo a un administrador de ${APP.rol === 'plat' ? 'la plataforma' : esc(E().corto)}.</p>
  <ul>${sin.slice(0, 12).map((p) => `<li>${esc(p.q)}</li>`).join('')}</ul>`;
} });
ACC.acordeon = (el) => { const ab = el.getAttribute('aria-expanded') === 'true'; el.setAttribute('aria-expanded', String(!ab)); document.getElementById(el.getAttribute('aria-controls')).hidden = ab; };

ruta('mi-espacio', { id: '', titulo: 'Mi espacio', acceso: () => APP.rol !== 'plat', render(q) {
  const tab = q.tab || 'equipos';
  const mios = D().activos.filter((a) => a.resp === R().ref);
  const tareas = APP.rol === 'tec' ? D().ordenesServicio.filter((o) => o.asigna === R().persona) : [];
  return `${cabeceraPantalla('Mi espacio', '<span class="id-pantalla">Un solo lugar para «lo mío»</span>')}
  ${pestanas('me', [{ k: 'equipos', t: 'Mis equipos', n: mios.length }, { k: 'solicitudes', t: 'Mis solicitudes' }, { k: 'tareas', t: 'Mis tareas', n: tareas.length }], tab)}
  ${panel('me', 'equipos', tab, mios.length ? tabla({ filas: mios, cols: [{ t: 'Serie', k: (a) => `<span class="cod">${esc(a.serie)}</span>` }, { t: 'Artículo', k: (a) => esc(D().skus.find((s) => s.cod === a.sku).nombre) }, { t: 'Estado', k: (a) => chip(a.estado) }, { t: 'Garantía', k: (a) => chipGarantia(a.garantia) }] }) : vacio({ titulo: 'No tiene equipos a su cargo', texto: 'Cuando TI le entregue uno, aparecerá aquí junto con su acta.' }))}
  ${panel('me', 'solicitudes', tab, D().ordenesServicio.filter((o) => o.pidio === R().persona).length ? tabla({ filas: D().ordenesServicio.filter((o) => o.pidio === R().persona), cols: [{ t: 'Orden', k: (o) => `<a class="cod" href="#/os?id=${o.num}">${o.num}</a>` }, { t: 'Qué', k: (o) => esc(o.desc) }, { t: 'Estado', k: (o) => chip(o.est) }] }) : vacio({ titulo: 'No tiene solicitudes', texto: 'Use «Pedir ayuda» para empezar.', icono: 'ayuda' }))}
  ${panel('me', 'tareas', tab, tareas.length ? tabla({ filas: tareas, cols: [{ t: 'Orden', k: (o) => `<a class="cod" href="#/os?id=${o.num}">${o.num}</a>` }, { t: 'Estado', k: (o) => chip(o.est) }] }) : vacio({ titulo: 'No tiene tareas', texto: 'Las tareas asignadas a usted aparecerán aquí.', icono: 'check' }))}`;
} });
ruta('mi-cuenta', { id: 'PR-35', prio: 'B', titulo: 'Mi cuenta y seguridad', render() {
  const obligatoria = ['adm', 'plat'].includes(APP.rol) || PERMISOS.some((p) => p.s && p.v[APP.rol] && p.v[APP.rol] !== '-');
  return `${cabeceraPantalla('Mi cuenta y seguridad', '<span class="id-pantalla">PR-35 · prioridad B</span>')}
  <div class="rejilla dos">
  ${tarjeta('Sesiones', `<p>Su sesión se cierra sola tras <strong>30 minutos sin actividad</strong> (con aviso a los 25) o a las 12 horas.</p><dl class="lista-datos"><dt>Esta sesión</dt><dd>Navegador de escritorio · Lima · ahora</dd><dt>Otra sesión</dt><dd>Celular · hace 2 días</dd></dl><button class="btn peligro" type="button" data-acc="cerrar-todas" style="margin-top:12px">Cerrar sesión en todos los dispositivos</button>`)}
  ${tarjeta('Segunda verificación', `<p>${chip(obligatoria ? 'Activa' : 'Inactivo')} ${obligatoria ? 'Obligatoria para su rol: tiene permisos sensibles.' : 'Opcional para su rol.'}</p><p class="suave">Se usa una aplicación autenticadora en el celular. No usamos mensajes de texto.</p><a class="btn" href="#/primer-ingreso">Ver cómo se activa</a>`)}
  ${tarjeta('Privacidad', `<p>Aviso de privacidad aceptado: versión 1.0 · 24/10/2026.</p><p class="suave chica">Puede pedir ver, corregir o eliminar sus datos desde «Mis datos» o con el administrador.</p>`)}
  ${tarjeta('Empresa', APP.rol === 'plat' ? '<p>La consola de plataforma no pertenece a ninguna empresa.</p>' : `<p>Trabajando en <strong>${esc(E().nombre)}</strong>.</p><a class="btn" href="#/empresa">Cambiar de empresa</a>`)}</div>`;
} });
ACC['cerrar-todas'] = () => dialogoMotivo({ titulo: 'Cerrar sesión en todos los dispositivos', verbo: 'Cerrar todas', destructivo: true, etiqueta: 'Motivo (opcional en la plataforma real)', texto: 'Se cerrarán todas sus sesiones, incluida esta. Deberá pedir un enlace nuevo para entrar.', consecuencias: ['Queda registrado en la auditoría.'], alConfirmar: () => { toast('Sesiones cerradas (simulado).'); } });

/* ---------- Pedir ayuda ---------- */
ruta('pedir-ayuda', { id: 'PR-33', prio: 'B', titulo: 'Pedir ayuda', acceso: () => APP.rol === 'emp' || puedePedirAyuda(), render() {
  const f2 = APP.tmp.ayudaFase2;
  const ver = APP.rol === 'emp' ? D().activos.filter((a) => a.resp === R().ref) : (valor('activos.ver') === 'T' ? D().activos.slice(0, 12) : D().activos.filter((a) => a.resp === R().ref));
  return `${cabeceraPantalla('Pedir ayuda', '<span class="id-pantalla">Un solo botón para todos</span>')}
  <div class="fila" style="margin-bottom:16px"><span>Mostrar cómo funciona:</span><div class="conmutador" role="group" aria-label="Versión"><button type="button" data-acc="ayuda-fase" data-f="1" aria-pressed="${!f2}">Versión 1 (ahora)</button><button type="button" data-acc="ayuda-fase" data-f="2" aria-pressed="${!!f2}">Fase 2 (mesa de ayuda)</button></div></div>
  ${f2 ? `${aviso('info', 'Así será en la Fase 2', 'El botón abre el catálogo de la mesa de ayuda. La orden de servicio la crea después el técnico desde el caso.')}
    <div class="rejilla">${[['Reportar un problema', 'Algo dejó de funcionar', 'ayuda'], ['Solicitar un equipo', 'Pedir una laptop, un mouse…', 'caja'], ['Reportar extravío o robo', 'Perdí un equipo', 'alerta'], ['Pedir mis datos personales', 'Ver, corregir o eliminar mis datos', 'candado']].map((s) => `<button type="button" class="tarjeta" style="text-align:left;cursor:pointer;color:inherit" data-acc="caso-demo"><span style="color:var(--c-primario)">${icono(s[2])}</span><h3>${s[0]}</h3><p class="suave sin-margen">${s[1]}</p></button>`).join('')}</div>`
  : `<form data-form="pedir-ayuda" novalidate class="tarjeta" style="max-width:640px"><h2>Cuéntenos qué necesita</h2>
    <div class="campo"><label for="pa-tipo">Qué tipo de ayuda <span class="obligatorio">(obligatorio)</span></label><select id="pa-tipo"><option value="">Elija…</option><option>Reparación</option><option>Instalación</option><option>Servicio externo</option></select></div>
    <div class="campo"><label for="pa-eq">Equipo relacionado <span class="obligatorio">(opcional)</span></label><select id="pa-eq"><option value="">Ninguno</option>${ver.map((a) => `<option>${esc(a.serie)} · ${esc(a.sku)}</option>`).join('')}</select></div>
    <div class="campo"><label for="pa-desc">Describa el problema o lo que necesita <span class="obligatorio">(obligatorio, hasta 500 caracteres)</span></label><textarea id="pa-desc" maxlength="500" style="font-family:inherit"></textarea><div class="ayuda">Por favor no escriba contraseñas ni claves. Todavía no se pueden adjuntar archivos.</div><div class="error" id="pa-e" hidden>${icono('alerta')}<span>Elija el tipo de ayuda y escriba una descripción.</span></div></div>
    <button class="btn primario" type="submit">Enviar pedido</button></form>`}`;
} });
ACC['ayuda-fase'] = (el) => { APP.tmp.ayudaFase2 = el.dataset.f === '2'; render(true); };
ACC['form-pedir-ayuda'] = () => {
  const ok = document.getElementById('pa-tipo').value && document.getElementById('pa-desc').value.trim();
  document.getElementById('pa-e').hidden = !!ok;
  if (!ok) return;
  const n = 'OS-0000' + (44 + (D().ordenesServicio.length - 5));
  D().ordenesServicio.push({ num: n, tipo: document.getElementById('pa-tipo').value, est: 'Creada', activo: '', pidio: R().persona, asigna: '', fecha: '25/10/2026', costo: 0, desc: document.getElementById('pa-desc').value.trim() });
  toast(`Listo: se creó la orden de servicio <strong>${n}</strong> en estado Creada. TI la asignará.`);
  location.hash = APP.rol === 'emp' ? '#/portal' : '#/ordenes-servicio';
};
ACC['caso-demo'] = () => toast('Muestra: aquí se abriría el formulario de ese servicio.');

/* ---------- Portal del empleado (muestra, Fase 3) ---------- */
function portalPantalla(tab) {
  const mios = D().activos.filter((a) => a.resp === R().ref);
  const casos = [['AYU-000104', 'Mi laptop se pone lenta', 'En atención', 'Pronto un técnico se comunicará con usted.'], ['AYU-000091', 'Solicitud de un mouse', 'Cerrado', 'Se le entregó el mouse el 12/09/2026.']];
  let c = '';
  if (tab === 'inicio') {
    c = `<p style="font-size:1.1rem">Hola, <strong>${esc(R().persona.split(' ')[0])}</strong>. Aquí ve lo que tiene a su cargo y puede pedir ayuda a TI.</p>
    <div class="rejilla">${[['Mis equipos', '#/portal?tab=equipos', 'caja', mios.length + ' equipo'], ['Pedir ayuda', '#/pedir-ayuda', 'ayuda', 'Un problema o un pedido'], ['Mis casos', '#/portal?tab=casos', 'doc', casos.length + ' casos'], ['Mis datos', '#/portal?tab=datos', 'usuario', 'Ver y pedir cambios']].map((x) => `<a class="tarjeta" style="text-decoration:none;color:inherit;min-height:120px" href="${x[1]}"><span style="color:var(--c-primario)">${icono(x[2])}</span><h2>${x[0]}</h2><p class="suave sin-margen">${x[3]}</p></a>`).join('')}</div>
    ${aviso('atencion', 'Tiene una confirmación pendiente', 'Confirme que recibió su laptop «5CG3410R7M». <button class="btn chico" type="button" data-acc="confirmar-recepcion">Lo recibí</button>')}`;
  } else if (tab === 'equipos') {
    c = `<h2>Mis equipos</h2>${mios.length ? mios.map((a) => { const s = D().skus.find((x) => x.cod === a.sku); return `<section class="tarjeta" style="margin-bottom:12px"><h3>${esc(s.nombre)}</h3><dl class="lista-datos"><dt>Serie</dt><dd class="cod">${esc(a.serie)}</dd><dt>Estado</dt><dd>${chip(a.estado)}</dd><dt>Ubicación</dt><dd>${esc(a.ubic)}</dd><dt>Garantía</dt><dd>${chipGarantia(a.garantia)}</dd></dl><div class="fila" style="margin-top:12px"><a class="btn chico" href="#/pedir-ayuda">Reportar un problema</a><button class="btn chico" type="button" data-acc="acta-demo">Ver mi acta</button></div></section>`; }).join('') : vacio({ titulo: 'No tiene equipos a su cargo', texto: 'Cuando TI le entregue uno aparecerá aquí.' })}
    <p class="suave chica">Por su seguridad no mostramos precios, proveedores, claves ni datos de otras personas.</p>`;
  } else if (tab === 'casos') {
    c = `<h2>Mis casos</h2>${casos.map((x) => `<section class="tarjeta" style="margin-bottom:12px"><div class="fila entre"><strong><span class="cod">${x[0]}</span> ${x[1]}</strong>${chip(x[2])}</div><p class="suave sin-margen">${x[3]}</p></section>`).join('')}<p class="suave chica">Solo ve los comentarios dirigidos a usted. Las notas internas del equipo de TI no se muestran.</p>`;
  } else {
    const p = personaDe(R().ref);
    c = `<h2>Mis datos</h2><section class="tarjeta"><dl class="lista-datos"><dt>Nombre</dt><dd>${esc(p.nombre)}</dd><dt>Correo</dt><dd>${esc(p.correo)}</dd><dt>Área</dt><dd>${esc(p.area)}</dd><dt>Puesto</dt><dd>${esc(p.puesto)}</dd></dl></section>
    <div class="fila" style="margin-top:12px"><button class="btn" type="button" data-acc="derechos" data-t="copia">Pedir una copia de mis datos</button><button class="btn" type="button" data-acc="derechos" data-t="corrección">Pedir una corrección</button><button class="btn" type="button" data-acc="derechos" data-t="eliminación">Pedir eliminar mis datos</button></div>
    <p class="suave chica">Su pedido llega al administrador de la empresa. Usted verá aquí el estado de su pedido; nadie más del equipo de TI lo ve.</p>`;
  }
  return `<div class="cabecera-pantalla"><h1 id="titulo-pantalla" tabindex="-1">${tab === 'inicio' ? 'Portal del empleado' : tab === 'equipos' ? 'Mis equipos' : tab === 'casos' ? 'Mis casos' : 'Mis datos'}</h1><span class="id-pantalla">PR-36 · muestra de la Fase 3</span></div>${c}`;
}
ruta('portal', { id: 'PR-36', prio: 'B', fase: 'Fase 3', titulo: 'Portal del empleado', acceso: () => APP.rol === 'emp', render(q) { return portalPantalla(q.tab || 'inicio'); } });
ACC['confirmar-recepcion'] = (el) => { el.closest('.aviso').outerHTML = aviso('exito', 'Gracias, recepción confirmada', 'Quedó registrada con fecha y hora. Esta confirmación no reemplaza la firma del acta en papel.'); };
ACC['acta-demo'] = () => toast('Muestra: aquí se abriría su acta en PDF.');
ACC.derechos = (el) => dialogoMotivo({ titulo: 'Pedir ' + el.dataset.t + ' de mis datos', verbo: 'Enviar pedido', etiqueta: 'Cuéntenos qué necesita', consecuencias: ['El pedido llega solo al administrador de la empresa.', 'Podrá ver el estado de su pedido en «Mis datos».'], alConfirmar: () => toast('Pedido enviado (simulado).') });

/* ---------- PR-25 Mensajes ---------- */
ruta('mensajes', { id: 'PR-25', titulo: 'Mensajes de error, permiso y bloqueo', render() {
  const otra = APP.empresa === 'e1' ? 'B1' : 'A1';
  return `${cabeceraPantalla('Mensajes de error, permiso y bloqueo', '<span class="id-pantalla">PR-25 · prioridad A</span>')}
  <p>La plataforma tiene <strong>tres mensajes</strong> y <strong>tres formas de bloquear una acción</strong>. Son siempre los mismos, en todas las pantallas. Cada mensaje dice qué pasó, por qué y qué hacer, sin detalles técnicos ni datos de otras personas.</p>
  <h2>Los tres mensajes</h2>
  <div class="rejilla dos">
    <div class="tarjeta"><h3>1. No encontrado</h3>${aviso('info', 'No encontramos lo que busca.', 'Puede que ya no exista o que no esté disponible para usted.')}<p class="suave chica">Se usa cuando algo es de otra empresa, no existe, o es de otra persona y su rol solo ve lo propio. Nunca dice «no tienes permiso», porque eso confirmaría que existe.</p><a class="btn" href="#/activo?id=${otra}">Probar: abrir un activo de otra empresa</a></div>
    <div class="tarjeta"><h3>2. No tiene permiso</h3>${aviso('atencion', `Su rol (${esc(R().nombre)}) no permite esta acción.`, `Si lo necesita, pídaselo a un administrador de ${APP.rol === 'plat' ? 'la plataforma' : esc(E().corto)}.`)}<p class="suave chica">Se usa solo cuando la persona ya ve la pantalla o el objeto y le falta el permiso de la acción.</p><a class="btn" href="#/auditoria">Probar: entrar a Auditoría (pruebe con el rol Técnico)</a></div>
    <div class="tarjeta"><h3>3. No se puede por una regla</h3>${aviso('alerta', 'No puede aprobar esta orden porque usted la preparó.', 'Debe aprobarla otra persona con permiso de aprobar.')}<p class="suave chica">Se usa cuando una regla del negocio lo impide, aunque la persona tenga el permiso. Aplica también al Administrador.</p><a class="btn" href="#/oc?id=OC-000218">Probar: aprobar su propia orden (rol Administrador)</a></div>
  </div>
  <h2 style="margin-top:24px">Las tres formas de bloquear</h2>
  <div class="rejilla dos">
    <div class="tarjeta"><h3>A. El botón no aparece</h3><p>Si su rol nunca tendrá esa acción, no se muestra. Ejemplo: un Técnico no ve «Aprobar».</p><p class="suave chica">Pruebe en <a href="#/oc?id=OC-000212">OC-000212</a> con los roles Técnico y Jefatura TI.</p></div>
    <div class="tarjeta"><h3>B. Desactivado con la razón escrita</h3><p>Si depende de una regla o del estado, el botón se ve apagado y la razón está <strong>escrita al lado</strong>, no escondida.</p>${btnExportar()}</div>
    <div class="tarjeta"><h3>C. Mensaje al entrar por dirección directa</h3><p>Si alguien pega una dirección a la que no tiene acceso, ve el mensaje 1 o el 2, nunca una pantalla en blanco.</p><a class="btn" href="#/roles">Probar: Roles y permisos (pruebe con Técnico)</a></div>
  </div>
  <h2 style="margin-top:24px">Tres formas de dato oculto</h2>
  <div class="rejilla dos">
    <div class="tarjeta"><h3>1. Referencia en lugar del nombre</h3><p>${oculto('PRS-0042')}</p><p class="suave chica">Sin el permiso «Ver datos personales», se ve la referencia con un candado.</p></div>
    <div class="tarjeta"><h3>2. Secreto enmascarado</h3><p><span class="secreto">••••••••-AB12</span> <button class="btn chico" type="button" data-acc="revelar-demo">${icono('ojo')} Revelar (se oculta en 30 s)</button></p><p class="suave chica">Solo con permiso, con segunda verificación, y la consulta queda en la auditoría.</p></div>
    <div class="tarjeta"><h3>3. Columna omitida con aviso</h3>${aviso('sensible', 'Se omitieron columnas', 'Precios (requiere el permiso «Ver precios»).')}</div>
  </div>
  <h2 style="margin-top:24px">Otros mensajes del sistema</h2>
  <div class="fila"><button class="btn" type="button" data-acc="msg-cambio">El registro cambió</button><button class="btn" type="button" data-acc="msg-sesion">Su sesión termina en 5 minutos</button><button class="btn" type="button" data-acc="msg-guardar">No pudimos guardar</button><button class="btn" type="button" data-acc="msg-borrador">Borrador guardado</button></div>`;
} });
ACC['revelar-demo'] = (el) => {
  const s = el.parentElement.querySelector('.secreto');
  s.textContent = 'MK7P-93QX-AB12'; el.disabled = true; el.textContent = 'Se ocultará en 30 segundos';
  toast('Clave revelada (simulado). La consulta queda en la auditoría sin guardar la clave.');
  setTimeout(() => { if (document.contains(s)) { s.textContent = '••••••••-AB12'; el.disabled = false; el.innerHTML = icono('ojo') + ' Revelar (se oculta en 30 s)'; } }, 30000);
};
ACC['msg-cambio'] = () => abrirDialogo({ titulo: 'El registro cambió', cuerpo: `<p>Mientras usted editaba, <strong>Marta Quispe</strong> guardó cambios en este registro hace 2 minutos.</p><div class="consecuencias"><strong>Qué cambió</strong><ul><li>Ubicación: «Lima &gt; Bodega Central» ahora es «Lima &gt; Piso 3 &gt; Sala TI»</li></ul></div><p>Revise los cambios antes de guardar los suyos. No se pisa nada en silencio.</p>`, botones: [{ texto: 'Ver los cambios', clase: 'primario' }, { texto: 'Descartar los míos' }] });
ACC['msg-sesion'] = () => abrirDialogo({ titulo: 'Su sesión termina en 5 minutos', cuerpo: '<p>Por seguridad cerramos la sesión tras 30 minutos sin actividad. Lo que escribió en recepciones, órdenes, entregas e importaciones se guarda solo como borrador.</p>', botones: [{ texto: 'Seguir conectado', clase: 'primario' }, { texto: 'Cerrar sesión' }] });
ACC['msg-guardar'] = () => abrirDialogo({ titulo: 'No pudimos guardar', cuerpo: `${aviso('alerta', 'Lo que escribió no se perdió.', 'Intente de nuevo. Si sigue igual, avise a TI con este código: <span class="cod">ERR-7K3Q-2026</span>.')}`, botones: [{ texto: 'Intentar de nuevo', clase: 'primario' }, { texto: 'Cerrar' }] });
ACC['msg-borrador'] = () => toast('Borrador guardado automáticamente a las 14:07.');

/* ---------- PR-00 Guía visual ---------- */
ruta('guia', { id: 'PR-00', titulo: 'Guía visual y componentes', render() {
  const fam = [
    ['Neutro', 'neutro', 'Aún no tiene efecto', 'Borrador, Creada, Programado, Invitado', '8,5', '9,3'],
    ['En curso', 'curso', 'Alguien trabaja en ello', 'Asignado, Emitida, En ejecución, En atención', '7,6', '8,4'],
    ['Atención', 'atencion', 'Espera algo o tiene aviso', 'Pendiente de aprobación, En reparación, Suspendida', '6,7', '8,4'],
    ['Éxito', 'exito', 'Bien y vigente', 'Aprobada, Vigente, En stock, Resuelto', '6,7', '8,4'],
    ['Alerta', 'alerta', 'Requiere acción ya', 'Rechazada, Vencido, Extraviado o robado', '7,5', '8,7'],
    ['Final', 'final', 'Terminó o ya no se usa', 'Cerrada, Anulada, Cancelada, De baja', '6,1', '6,7'],
    ['Sensible', 'sensible', 'Permiso o excepción (no es un estado)', 'Dato sensible, Excepción activa, Modo soporte', '7,7', '8,6']
  ];
  const ejemplo = { neutro: 'Borrador', curso: 'Asignado', atencion: 'Pendiente de aprobación', exito: 'Aprobada', alerta: 'Rechazada', final: 'Anulada', sensible: 'Sensible' };
  return `${cabeceraPantalla('Guía visual y componentes', '<span class="id-pantalla">PR-00 · prioridad A</span>')}
  <p>Esta guía muestra todo lo que usa la plataforma: colores, etiquetas, botones, formularios, tablas y mensajes. Se aprueba una sola vez. Use el botón <strong>«Modo oscuro»</strong> de arriba para ver los dos modos.</p>
  <nav class="tabs-guia" aria-label="Secciones de la guía"><a href="#g-estados" data-acc="ancla">Estados</a><a href="#g-botones" data-acc="ancla">Botones</a><a href="#g-forms" data-acc="ancla">Formularios</a><a href="#g-tablas" data-acc="ancla">Tablas</a><a href="#g-avisos" data-acc="ancla">Avisos</a><a href="#g-vocab" data-acc="ancla">Vocabulario</a><a href="#g-color" data-acc="ancla">Color y contraste</a></nav>

  <h2 id="g-estados" style="margin-top:24px">1. Siete familias de color de estado</h2>
  <p>Regla de oro: <strong>todo estado lleva texto y un icono</strong>; el color solo lo refuerza. Así se entiende aunque no se distingan los colores.</p>
  ${tabla({ cols: [{ t: 'Familia', k: (f) => chip(ejemplo[f[1]], f[1]) }, { t: 'Cuándo se usa', k: (f) => f[2] }, { t: 'Ejemplos de estados', k: (f) => f[3] }, { t: 'Contraste del texto (claro / oscuro)', k: (f) => `${f[4]} / ${f[5]} (mínimo exigido 4,5)` }], filas: fam })}
  <h3 style="margin-top:16px">Estado guardado y etiqueta calculada</h3>
  <p>Un <strong>estado guardado</strong> lo cambia una persona: <span>${chip('Aprobada')}</span>. Una <strong>etiqueta calculada</strong> se actualiza sola por la fecha y no se puede cambiar a mano: tiene borde discontinuo y un reloj. ${chipGarantia('12/11/2026')} ${chipGarantia('14/03/2027')} ${chipCalc('Atrasado 9 días', 'alerta')}</p>
  <h3>Los 5 estados de un activo</h3><p class="fila">${['En stock', 'Asignado', 'En reparación', 'Extraviado o robado', 'De baja'].map((e) => chip(e)).join('')}</p>
  <h3>Los estados de una orden de compra</h3><p class="fila">${['Borrador', 'Pendiente de aprobación', 'Aprobada', 'Emitida', 'Recibida parcial', 'Cerrada', 'Rechazada', 'Anulada'].map((e) => chip(e)).join('')}</p>

  <h2 id="g-botones" style="margin-top:24px">2. Botones</h2>
  <div class="fila"><button class="btn primario" type="button">Principal</button><button class="btn" type="button">Secundario</button><button class="btn peligro" type="button">Acción irreversible</button><button class="btn fantasma" type="button">Discreto</button><button class="btn chico" type="button">Pequeño</button></div>
  <h3 style="margin-top:16px">Botón desactivado con la razón escrita al lado</h3>
  <div class="fila" style="align-items:flex-start">${btnExportar()}${btnAcc({ texto: 'Aprobar', clase: 'primario', bloqueo: 'Usted preparó esta orden: debe aprobarla otra persona.' })}</div>

  <h2 id="g-forms" style="margin-top:24px">3. Formularios con validación en el momento</h2>
  <div class="tarjeta" style="max-width:560px"><div class="campo"><label for="g-nombre">Nombre del artículo <span class="obligatorio">(obligatorio, hasta 120 caracteres)</span></label><input id="g-nombre" type="text" data-entrada="guia-nombre" placeholder="Ejemplo: Laptop Dell Latitude 5440"><div class="ayuda">Escriba el nombre como lo conoce el área de TI.</div><div class="error" id="g-nombre-e" hidden>${icono('alerta')}<span>El nombre es obligatorio.</span></div></div>
  <div class="campo"><label for="g-lista">Marca <span class="obligatorio">(obligatorio)</span></label><select id="g-lista"><option>Elija…</option><option>Dell</option><option>Lenovo</option></select></div>
  <div class="opcion"><input type="checkbox" id="g-chk"><label for="g-chk">Es un equipo de uso compartido</label></div></div>

  <h2 id="g-tablas" style="margin-top:24px">4. Tablas, filtros y exportar</h2>
  <div class="barra-herr"><div class="campo buscador"><label for="g-q">Buscar</label><input id="g-q" type="search" placeholder="Serie, artículo…"></div><div class="campo"><label for="g-f1">Estado</label><select id="g-f1"><option>Todos</option></select></div><div class="campo"><label for="g-f2">Ubicación</label><select id="g-f2"><option>Todas</option></select></div>${btnExportar()}</div>
  ${tabla({ caption: 'Ejemplo de tabla', cols: [{ t: 'Serie', k: (f) => `<span class="cod">${f[0]}</span>` }, { t: 'Estado', k: (f) => chip(f[1]) }, { t: 'Responsable', k: (f) => f[2] === 'oculto' ? oculto('PRS-0042') : esc(f[2]) }, { t: 'Importe', cls: 'num', k: (f) => dinero(f[3], 'PEN') }], filas: [['5CG3410R7M', 'Asignado', 'Pablo Soto', 4150], ['5CG3412H2Q', 'En stock', '—', 4150], ['5CG3419P4T', 'En reparación', 'oculto', 4150]] })}
  <p class="suave chica">Los importes siempre llevan su moneda. Nunca se suman monedas distintas ni existe un «total general» entre ellas. A 360 px de ancho, la tabla se convierte en tarjetas.</p>

  <h2 id="g-avisos" style="margin-top:24px">5. Avisos, diálogo de motivo y estados vacíos</h2>
  ${aviso('info', 'Información', 'Un dato que ayuda, sin urgencia.')}${aviso('atencion', 'Atención', 'Algo requiere su revisión.')}${aviso('exito', 'Listo', 'La acción terminó bien.')}${aviso('alerta', 'Hay un problema', 'Se explica qué pasó y qué hacer.')}${aviso('sensible', 'Excepción activa', 'Esta orden se aprobó por la excepción de empresa de una sola persona. Queda en la auditoría.')}
  <div class="fila"><button class="btn" type="button" data-acc="guia-dialogo">Abrir el diálogo de motivo</button><button class="btn" type="button" data-acc="guia-toast">Mostrar un mensaje de éxito</button></div>
  <div class="rejilla dos" style="margin-top:16px">${vacio({ titulo: 'Aún no hay nada aquí', texto: 'Primera vez: explica qué hacer para empezar.', icono: 'mas' })}${vacio({ titulo: 'Sin resultados', texto: 'Sin resultados: sugiere cambiar los filtros.' })}${vacio({ titulo: 'No tiene permiso para ver esto', texto: 'Sin permiso: dice a quién pedirlo.', icono: 'candado' })}</div>

  <h2 id="g-vocab" style="margin-top:24px">6. Un solo vocabulario</h2>
  ${tabla({ cols: [{ t: 'Palabra', k: (f) => `<strong>${f[0]}</strong>` }, { t: 'Significa', k: (f) => f[1] }, { t: 'Se usa para', k: (f) => f[2] }], filas: [
    ['Activar / Desactivar', 'Prender o apagar un registro de una lista (reversible)', 'Artículos, marcas, proveedores, planes'],
    ['Suspender / Reactivar', 'Cortar un acceso o servicio por un tiempo', 'Usuarios, líneas, empresas'],
    ['Dar de baja', 'El elemento ya no existe para la empresa; pide motivo', 'Activos, líneas, dominios, usuarios'],
    ['Cesar', 'La persona ya no trabaja en la empresa', 'Personas'],
    ['Anular', 'Dejar sin efecto un documento ya registrado', 'Órdenes de compra, actas, contratos'],
    ['Cancelar', 'Detener un trabajo que estaba en curso', 'Órdenes de servicio, casos, cambios'],
    ['Terminar', 'Un contrato acaba antes de su fecha de fin', 'Contratos'],
    ['Cerrar', 'El trabajo concluyó', 'Órdenes, casos'],
    ['Aprobar / Rechazar', 'Decisión de otra persona; siempre con la misma bandeja', 'Órdenes de compra, cambios, presupuestos']] })}
  <h3 style="margin-top:16px">Códigos que verá en pantalla</h3>
  <p class="fila"><span class="cod">LAP-0001</span><span class="cod">OC-000212</span><span class="cod">OS-000041</span><span class="cod">RCP-000042</span><span class="cod">ACT-E-000123</span><span class="cod">PRS-0042</span><span class="cod">AYU-000118</span><span class="cod">CTR-000014</span></p>

  <h2 id="g-color" style="margin-top:24px">7. Color, tipografía y espaciado</h2>
  ${tabla({ cols: [{ t: 'Uso', k: (f) => f[0] }, { t: 'Modo claro', k: (f) => `<span class="cod">${f[1]}</span>` }, { t: 'Modo oscuro', k: (f) => `<span class="cod">${f[2]}</span>` }, { t: 'Contraste claro / oscuro', cls: 'num', k: (f) => f[3] }], filas: [
    ['Texto sobre fondo', '#17202B sobre #F5F7FA', '#E8EDF3 sobre #0F141A', '15,3 / 15,7'],
    ['Texto suave sobre tarjeta', '#4A5663 sobre #FFFFFF', '#A9B5C3 sobre #171E26', '7,5 / 8,1'],
    ['Botón principal', '#FFFFFF sobre #0B5CAD', '#0A1622 sobre #6DB0F5', '6,7 / 8,0'],
    ['Botón de acción irreversible', '#FFFFFF sobre #B42318', '#1A0705 sobre #FF8A80', '6,6 / 8,6'],
    ['Enlace', '#0B5CAD sobre #FFFFFF', '#7FB8F7 sobre #171E26', '6,7 / 8,1'],
    ['Borde de campos', '#6B7785 sobre #FFFFFF', '#8794A3 sobre #171E26', '4,6 / 5,4'],
    ['Anillo de foco (teclado)', '#1D4ED8 sobre #FFFFFF', '#8AB4FF sobre #171E26', '6,7 / 8,0']] })}
  <p class="suave chica">Contrastes calculados con la fórmula WCAG. El nivel AA exige 4,5 para texto y 3 para bordes de controles. Tipografía del sistema, 16 px de base; espacios en múltiplos de 4 px; objetivos táctiles de 44 px. Todo se define en <span class="cod">assets/estilos.css</span>.</p>`;
}, despues() {} });
ENTRADA['guia-nombre'] = (el) => { const v = el.value.length === 0 || el.value.length > 120; document.getElementById('g-nombre-e').hidden = !v; document.getElementById('g-nombre-e').querySelector('span').textContent = el.value.length > 120 ? 'El nombre no puede pasar de 120 caracteres.' : 'El nombre es obligatorio.'; el.setAttribute('aria-invalid', String(v)); };
ACC.ancla = (el, e) => { e.preventDefault(); const t = document.getElementById(el.getAttribute('href').slice(1)); if (t) { t.scrollIntoView(); t.setAttribute('tabindex', '-1'); t.focus(); } };
ACC['guia-dialogo'] = () => dialogoMotivo({ titulo: 'Dar de baja el activo', verbo: 'Dar de baja', destructivo: true, motivos: ['Equipo obsoleto', 'Irreparable', 'Vendido o donado'], texto: 'Esta es la forma única en que la plataforma pide un motivo.', consecuencias: ['El activo pasa a «De baja».', 'La asignación se cierra con esta causa.', 'Solo se podrá recuperar con un reingreso, con motivo y permiso especial.'], alConfirmar: () => toast('Acción simulada: el activo pasó a De baja.') });
ACC['guia-toast'] = () => toast('Acción terminada. Los mensajes de éxito son breves.');

/* =========================================================================
   ASISTENTE DE IA: chat para armar un buen caso de mesa de ayuda (ASI-A).
   Decisiones D-082 y D-102 a D-110.

   ES UNA SIMULACIÓN con guion fijo: no hay inteligencia artificial real ni
   servidor. Las respuestas del "asistente" están escritas aquí. Los datos
   (personas, equipos, teléfonos) son inventados.

   Qué muestra:
   - Botón flotante "Asistente de IA" (Empleado y Técnico) y panel de chat.
   - Tres casos tipo (laptop, correo, mouse) y las derivaciones de D-105.2.
   - El caso armado, listo para confirmar (formulario "Pedir ayuda" ya lleno).
   - Cómo lo ve el técnico (bloques de D-108).
   ========================================================================= */
(function () {
  'use strict';

  /* ---------- Datos de ejemplo ---------- */
  const CONTACTO = 'Anexo 1500 · 01 555 0100';          // ficticio: lo escribe cada empresa (D-105.3)
  const FECHA = '25/10/2026';
  const HORA = '09:14';
  const IMPACTOS = [
    { v: 'una', t: 'Solo a mí', nivel: 'Bajo', frase: 'afecta solo a esa persona' },
    { v: 'area', t: 'A mi área', nivel: 'Medio', frase: 'afecta a su área' },
    { v: 'empresa', t: 'A toda la empresa', nivel: 'Alto', frase: 'afecta a toda la empresa' }
  ];
  const URGENCIAS = [
    { v: 'alta', t: 'No puedo trabajar', frase: 'no puede trabajar' },
    { v: 'media', t: 'Puedo trabajar con dificultad', frase: 'puede trabajar con dificultad' },
    { v: 'baja', t: 'Puedo esperar', frase: 'puede esperar' }
  ];
  /* Matriz fija RN-AYU-003: la calcula el servidor, nunca el asistente */
  const MATRIZ = { Alto: { alta: 'P1', media: 'P2', baja: 'P3' }, Medio: { alta: 'P2', media: 'P3', baja: 'P4' }, Bajo: { alta: 'P3', media: 'P4', baja: 'P4' } };
  const PRIO = { P1: 'P1 Crítica', P2: 'P2 Alta', P3: 'P3 Media', P4: 'P4 Baja' };
  const PRIO_FAM = { P1: 'alerta', P2: 'atencion', P3: 'curso', P4: 'neutro' };
  const PLAZO = { P1: 'hoy ' + FECHA + ' a las 09:44', P2: 'hoy ' + FECHA + ' a las 10:14', P3: 'hoy ' + FECHA + ' a las 11:14', P4: 'mañana 26/10/2026 a las 09:14' };
  const prioDe = (imp, urg) => { const i = IMPACTOS.find((x) => x.v === imp) || IMPACTOS[0]; return MATRIZ[i.nivel][urg || 'media']; };

  /* Definición del formulario de cada servicio (fuente única, D-104.2): el chat pregunta esto */
  const CAMPOS = {
    problema: [
      { k: 'desde', label: 'Desde cuándo ocurre', tipo: 'lista', ops: ['Desde hoy', 'Desde ayer', 'Hace varios días', 'No sé'], obl: true },
      { k: 'error', label: 'Mensaje de error (texto pegado)', tipo: 'area' },
      { k: 'antes', label: 'Qué cambió antes', tipo: 'lista', ops: ['Una instalación', 'Una actualización', 'Un golpe o caída', 'Un derrame', 'Una mudanza', 'Nada que recuerde'] },
      { k: 'frecuencia', label: 'Cada cuánto ocurre', tipo: 'lista', ops: ['Una vez', 'A veces', 'Siempre'] },
      { k: 'haciendo', label: 'Qué estaba haciendo', tipo: 'texto' },
      { k: 'ubicar', label: 'Cómo ubicarla (sede o remoto, mejor horario)', tipo: 'texto' }
    ],
    pedido: [
      { k: 'necesita', label: 'Qué necesita', tipo: 'texto', obl: true },
      { k: 'cantidad', label: 'Cantidad', tipo: 'numero', obl: true },
      { k: 'motivo', label: 'Motivo', tipo: 'lista', ops: ['Primer equipo', 'Reposición por falla', 'Reposición por pérdida', 'Mejora', 'Otro'], obl: true },
      { k: 'cuando', label: 'Para cuándo lo necesita', tipo: 'texto' },
      { k: 'reemplaza', label: 'Cuál de sus equipos reemplaza', tipo: 'texto' }
    ]
  };

  const ARTICULOS = {
    laptop: ['Qué hacer si la laptop no enciende', 'Cómo revisar el cargador y la batería'],
    correo: ['Cómo desbloquear mi cuenta de correo']
  };

  /* ---------- Utilidades ---------- */
  const $ = (id) => document.getElementById(id);
  const cap = (s) => { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; };
  const punto = (s) => { s = String(s || '').trim(); return s && !/[.!?]$/.test(s) ? s + '.' : s; };
  const bajo = (s) => String(s || '').trim().charAt(0).toLowerCase() + String(s || '').trim().slice(1);
  const lineas = (t) => esc(t).replace(/\n/g, '<br>');
  const plano = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const demora = () => (typeof window.ASI_DEMORA === 'number' ? window.ASI_DEMORA : (S().auto ? 250 : 550));

  ICONOS.asistente = '<path d="M4 5h16v11H9.5L5 20v-4H4z"/><path d="M12 7.5l.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9z"/>';
  ICONOS.enviar = '<path d="M22 2L11 13"/><path d="M22 2l-7 20-4-9-9-4z"/>';
  ICONOS.reiniciar = '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/>';
  ICONOS.telefono = '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>';

  function nuevoEstado() {
    return { abierto: false, fase: 'inicio', guion: null, i: -1, r: {}, ack: '', msgs: [], pensando: false, t: null, corr: null, menu: null, entrada: '', intentos: 0, auto: false, tok: 0, foco: false, enviado: null, clave: '' };
  }
  const S = () => (APP.asi = APP.asi || nuevoEstado());

  /* ---------- Equipos de la persona (solo código, categoría y modelo viajan al modelo; la serie no) ---------- */
  function equiposDe(ref, dat) {
    dat = dat || D();
    return dat.activos.filter((a) => a.resp === ref && a.estado !== 'De baja').map((a) => {
      const s = dat.skus.find((x) => x.cod === a.sku) || {};
      if (s.cat === 'Licencias') return null;
      const n = Number(String(a.id).replace('A', ''));
      return { id: a.id, cod: 'ACTV-' + String(n).padStart(5, '0'), cat: s.cat || '—', modelo: ((s.marca || '') + ' ' + (s.modelo || '')).trim(), nombre: s.nombre || a.sku, estado: a.estado, serie: a.serie, entrega: fechaDe(new Date(parseF(a.compra).getTime() + 3 * 86400000)) };
    }).filter(Boolean);
  }
  const personaDeRef = (ref, dat) => (dat || D()).personas.find((p) => p.ref === ref) || { nombre: (R().ref === ref ? R().persona : ref), area: '—', puesto: '—' };

  /* =====================================================================
     GUIONES (lo que "dice" el asistente en cada caso tipo)
     ===================================================================== */
  const pasoConfirma = (txt, serv) => ({
    id: 'servicio', corregible: 'El tipo de caso', tipo: 'botones', campo: 'servicio',
    p: () => `${txt} Lo registraré como «${serv}». ¿Es correcto?`,
    opciones: [{ v: 'si', t: 'Sí, es correcto' }, { v: 'no', t: 'No, es otra cosa' }],
    ejemplo: { v: 'si', t: 'Sí, es correcto' }
  });
  const pasoEquipo = (txt, corr) => ({
    id: 'equipo', corregible: corr || 'El equipo', tipo: 'equipo', campo: 'equipo',
    si: (r, eqs) => eqs.length > 0,
    p: () => txt,
    ejemplo: (r, eqs) => ({ v: eqs[0].id, t: eqs[0].modelo })
  });
  const pasoDesde = () => ({
    id: 'desde', corregible: 'Desde cuándo ocurre', tipo: 'botones', campo: 'desde',
    p: () => '¿Desde cuándo ocurre?',
    opciones: ['Desde hoy', 'Desde ayer', 'Hace varios días', 'No sé'].map((t) => ({ v: t, t })),
    ejemplo: { v: 'Desde hoy', t: 'Desde hoy' }
  });
  const pasoProbo = (preg, chips, ej) => ({
    id: 'probo', corregible: 'Lo que ya probó', tipo: 'texto', campo: 'probo',
    p: () => preg,
    opciones: chips.map((t) => ({ v: t, t })),
    ejemplo: { v: ej, t: ej }
  });
  const pasoArticulos = (clave) => ({
    id: 'articulos', tipo: 'botones', campo: 'articulos', arts: ARTICULOS[clave],
    p: () => 'Antes de enviar: su empresa tiene estos artículos de ayuda. Puede leerlos ahora; usted decide si sigue con el caso.',
    opciones: [{ v: 'seguir', t: 'Seguir con mi caso' }, { v: 'resuelto', t: 'Ya lo resolví' }],
    ejemplo: { v: 'seguir', t: 'Seguir con mi caso' }
  });
  const pasoImpacto = () => ({
    id: 'impacto', corregible: 'Impacto y urgencia', encadena: ['urgencia'], tipo: 'botones', campo: 'impacto',
    p: () => '¿A cuántas personas afecta?',
    opciones: IMPACTOS.map((x) => ({ v: x.v, t: x.t })),
    ejemplo: { v: 'una', t: 'Solo a mí' }
  });
  const pasoUrgencia = (ej) => ({
    id: 'urgencia', tipo: 'botones', campo: 'urgencia',
    p: () => '¿Cuánto le impide trabajar?',
    opciones: URGENCIAS.map((x) => ({ v: x.v, t: x.t })),
    ejemplo: ej
  });

  const GUIONES = {
    laptop: {
      titulo: 'No prende la laptop', inicio: 'No prende mi laptop', servicio: 'Reportar un problema', tipo: 'Incidente', sv: 'problema',
      pasos: [
        pasoConfirma('Entiendo: su laptop no enciende.', 'Reportar un problema'),
        pasoEquipo('¿Cuál es el equipo afectado? Elija una tarjeta. Por su seguridad no muestro números de serie.'),
        pasoDesde(),
        { id: 'luz', tipo: 'botones', campo: 'luz', aclara: '¿Se enciende alguna luz al conectar el cargador?', p: () => 'Una duda más: al conectar el cargador, ¿se enciende alguna luz?', opciones: [{ v: 'no', t: 'No, ninguna luz' }, { v: 'si', t: 'Sí, se enciende una luz' }, { v: 'nose', t: 'No sé' }], ejemplo: { v: 'no', t: 'No, ninguna luz' } },
        { id: 'antes', tipo: 'botones', campo: 'antes', opcional: true, p: () => '¿Pasó algo antes de que dejara de encender? (Esta pregunta es opcional.)', opciones: ['Un golpe o caída', 'Un derrame', 'Una actualización', 'Nada que recuerde', 'Prefiero no responder'].map((t) => ({ v: t, t })), ejemplo: { v: 'Nada que recuerde', t: 'Nada que recuerde' } },
        pasoProbo('¿Qué ha probado ya? Elija una opción o escríbalo. Si todavía nada, también está bien.', ['Probé otro cargador y otro enchufe', 'Mantuve pulsado el botón de encendido', 'Nada todavía'], 'Probé otro cargador y otro enchufe'),
        pasoArticulos('laptop'),
        pasoImpacto(),
        pasoUrgencia({ v: 'alta', t: 'No puedo trabajar' }),
        { id: 'ubicar', tipo: 'texto', campo: 'ubicar', opcional: true, p: () => 'Última pregunta (opcional): ¿dónde y en qué horario puede atenderla TI?', opciones: [{ v: '', t: 'Prefiero no indicarlo' }], ejemplo: { v: 'En mi puesto, piso 2, por la tarde.', t: 'En mi puesto, piso 2, por la tarde.' } }
      ],
      armar(r, eq) {
        const luzUsr = { no: 'Al conectar el cargador no se enciende ninguna luz.', si: 'Al conectar el cargador se enciende una luz, pero el equipo no arranca.', nose: 'No sé si se enciende alguna luz al conectar el cargador.' }[r.luz] || '';
        const luzRes = { no: 'al conectar el cargador no se enciende ninguna luz', si: 'al conectar el cargador se enciende una luz, pero el equipo no arranca', nose: 'no sabe si se enciende alguna luz al conectar el cargador' }[r.luz] || '';
        const ocurre = { 'Desde hoy': 'ocurre desde hoy', 'Desde ayer': 'ocurre desde ayer', 'Hace varios días': 'ocurre hace varios días', 'No sé': 'no sabe desde cuándo ocurre' }[r.desde] || '';
        return {
          asunto: 'Laptop no enciende' + (eq ? ' (' + eq.modelo + ')' : ''),
          desc: punto(cap(r.relato)) + ' ' + luzUsr,
          resumen: `La persona informa que su laptop${eq ? ' (' + eq.modelo + ')' : ''} no enciende; ${ocurre}. En concreto, ${luzRes}. Ya probó: ${bajo(punto(r.probo || 'nada todavía'))} ${cap(IMPACTOS.find((x) => x.v === r.impacto).frase)} y ${URGENCIAS.find((x) => x.v === r.urgencia).frase}.`,
          aclar: [{ p: '¿Se enciende alguna luz al conectar el cargador?', r: r.luz_t }],
          valores: { desde: r.desde, antes: r.antes && r.antes !== 'Prefiero no responder' ? r.antes : '', ubicar: r.ubicar || '' }
        };
      }
    },
    correo: {
      titulo: 'No puedo entrar al correo', inicio: 'No puedo entrar a mi correo', servicio: 'Reportar un problema', tipo: 'Incidente', sv: 'problema',
      pasos: [
        pasoConfirma('Entiendo: no puede entrar a su correo.', 'Reportar un problema'),
        { id: 'sospecha', tipo: 'botones', campo: 'sospecha', aclara: '¿Sospecha que alguien más entró a su cuenta o que entregó su clave por error?', p: () => 'Una pregunta importante para su seguridad: ¿sospecha que alguien más entró a su cuenta, o que entregó su clave por error?', opciones: [{ v: 'no', t: 'No, solo no me deja entrar' }, { v: 'si', t: 'Sí, creo que me robaron la cuenta' }], ejemplo: { v: 'no', t: 'No, solo no me deja entrar' } },
        pasoEquipo('¿Desde cuál de sus equipos intenta entrar? Si no es desde un equipo de la empresa, elija «Ninguno».', 'El equipo'),
        pasoDesde(),
        { id: 'error', tipo: 'texto', campo: 'error', opcional: true, corregible: 'El mensaje de error', p: () => '¿Aparece algún mensaje de error? Si puede, cópielo y péguelo aquí: seleccione el texto, pulse Ctrl+C y luego Ctrl+V en el cuadro de abajo. No escriba su contraseña.', opciones: [{ v: '', t: 'No aparece ningún mensaje' }], ejemplo: { v: 'Su cuenta está bloqueada. Intente de nuevo en 30 minutos o contacte a su administrador. (código 50053)', t: 'Su cuenta está bloqueada. Intente de nuevo en 30 minutos o contacte a su administrador. (código 50053)' } },
        { id: 'trabajo', tipo: 'botones', campo: 'trabajo', aclara: '¿Le pasa solo con el correo del trabajo?', p: () => 'Una duda más: ¿le pasa solo con el correo del trabajo?', opciones: [{ v: 'solo', t: 'Solo con el del trabajo' }, { v: 'otras', t: 'También con otras cuentas' }, { v: 'nose', t: 'No sé' }], ejemplo: { v: 'solo', t: 'Solo con el del trabajo' } },
        pasoProbo('¿Qué ha probado ya? Elija una opción o escríbalo. Nunca escriba su contraseña.', ['Probé desde otro navegador', 'Probé desde mi celular', 'Nada todavía'], 'Probé desde mi celular y pasa lo mismo'),
        pasoArticulos('correo'),
        pasoImpacto(),
        pasoUrgencia({ v: 'alta', t: 'No puedo trabajar' })
      ],
      armar(r, eq) {
        const ocurre = { 'Desde hoy': 'desde hoy', 'Desde ayer': 'desde ayer', 'Hace varios días': 'hace varios días', 'No sé': 'sin saber desde cuándo' }[r.desde] || '';
        const hay = r.error && r.error.trim();
        return {
          asunto: 'No puede entrar al correo del trabajo',
          desc: punto(cap(r.relato)) + (hay ? ' Me aparece un mensaje de error (está copiado más abajo).' : ' No me aparece ningún mensaje.'),
          resumen: `La persona no puede entrar a su correo del trabajo, ${ocurre}${eq ? ', desde su ' + eq.modelo : ''}. ${hay ? 'Aparece un mensaje de error (ver texto pegado). ' : 'No aparece ningún mensaje. '}Indicó que no sospecha que alguien más haya entrado a su cuenta. Ya probó: ${bajo(punto(r.probo || 'nada todavía'))} ${cap(IMPACTOS.find((x) => x.v === r.impacto).frase)} y ${URGENCIAS.find((x) => x.v === r.urgencia).frase}.`,
          aclar: [{ p: '¿Sospecha que alguien más entró a su cuenta o que entregó su clave por error?', r: r.sospecha_t }, { p: '¿Le pasa solo con el correo del trabajo?', r: r.trabajo_t }],
          valores: { desde: r.desde, error: hay ? r.error.trim() : '' }
        };
      }
    },
    mouse: {
      titulo: 'Pedido de un accesorio (mouse)', inicio: 'Necesito un mouse nuevo', servicio: 'Solicitar un equipo o accesorio', tipo: 'Pedido', sv: 'pedido',
      pasos: [
        pasoConfirma('Entiendo: necesita un mouse.', 'Solicitar un equipo o accesorio'),
        { id: 'cantidad', corregible: 'La cantidad', tipo: 'texto', campo: 'cantidad', p: () => '¿Cuántos necesita?', opciones: [{ v: '1', t: '1' }, { v: '2', t: '2' }], ejemplo: { v: '1', t: '1' } },
        { id: 'motivo', corregible: 'El motivo', tipo: 'botones', campo: 'motivo', p: () => '¿Cuál es el motivo?', opciones: ['Primer equipo', 'Reposición por falla', 'Reposición por pérdida', 'Mejora', 'Otro'].map((t) => ({ v: t, t })), ejemplo: { v: 'Primer equipo', t: 'Primer equipo' } },
        { id: 'reemplaza', tipo: 'equipo', campo: 'reemplaza', neutra: 'Ninguno de estos', si: (r, eqs) => /Reposición|Mejora/.test(r.motivo || '') && eqs.length > 0, p: () => 'Como es una reposición o mejora: ¿cuál de sus equipos reemplaza? (Opcional.)', ejemplo: (r, eqs) => ({ v: eqs[0].id, t: eqs[0].modelo }) },
        { id: 'cuando', tipo: 'botones', campo: 'cuando', opcional: true, p: () => '¿Para cuándo lo necesita? (Opcional.)', opciones: ['Esta semana', 'Este mes', 'Sin fecha'].map((t) => ({ v: t, t })), ejemplo: { v: 'Esta semana', t: 'Esta semana' } },
        { id: 'tipo', tipo: 'botones', campo: 'tipo', aclara: '¿Prefiere un mouse con cable o inalámbrico?', p: () => 'Una duda más: ¿lo prefiere con cable o inalámbrico?', opciones: [{ v: 'Con cable', t: 'Con cable' }, { v: 'Inalámbrico', t: 'Inalámbrico' }, { v: 'Me da igual', t: 'Me da igual' }], ejemplo: { v: 'Inalámbrico', t: 'Inalámbrico' } },
        pasoProbo('¿Ya hizo algo antes para conseguirlo? Por ejemplo, pedirlo a su jefe. Si todavía nada, también está bien.', ['Nada todavía', 'Lo pedí a mi jefe'], 'Nada todavía'),
        pasoImpacto(),
        pasoUrgencia({ v: 'baja', t: 'Puedo esperar' })
      ],
      armar(r, eq, eqs) {
        const que = /teclado/.test(plano(r.relato)) ? 'un teclado' : /auricular/.test(plano(r.relato)) ? 'auriculares' : 'un mouse';
        const reem = eqs.find((e) => e.id === r.reemplaza);
        const tipo = r.tipo && r.tipo !== 'Me da igual' ? ' ' + bajo(r.tipo) : '';
        return {
          asunto: 'Pedido de ' + que,
          desc: `Necesito ${que}${tipo ? ' (' + bajo(r.tipo) + ')' : ''}. Cantidad: ${r.cantidad || 1}. Motivo: ${bajo(r.motivo || 'otro')}.`,
          resumen: `La persona pide ${r.cantidad || 1} ${que.replace(/^un /, '').replace(/^auriculares/, 'auriculares')}${tipo} ${/Primer/.test(r.motivo) ? 'como primer equipo' : 'por ' + bajo(r.motivo)}${r.cuando && r.cuando !== 'Sin fecha' ? ', para ' + bajo(r.cuando) : ''}. Ya hizo antes: ${bajo(punto(r.probo || 'nada todavía'))} ${cap(IMPACTOS.find((x) => x.v === r.impacto).frase)} y ${URGENCIAS.find((x) => x.v === r.urgencia).frase}.`,
          aclar: [{ p: '¿Prefiere un mouse con cable o inalámbrico?', r: r.tipo_t }],
          valores: { necesita: cap(que) + tipo, cantidad: String(r.cantidad || 1), motivo: r.motivo, cuando: r.cuando && r.cuando !== 'Sin fecha' ? r.cuando : '', reemplaza: reem ? reem.modelo : '' }
        };
      }
    },
    /* Rama corta tras una emergencia de seguridad: dejar constancia del caso */
    robo: {
      titulo: 'Cuenta robada', inicio: 'Creo que me robaron la cuenta de correo', servicio: 'Reportar un problema', tipo: 'Incidente', sv: 'problema',
      pasos: [
        pasoDesde(),
        pasoProbo('¿Qué hizo ya, además de llamar a TI? Si todavía nada, también está bien. Nunca escriba una contraseña.', ['Nada todavía', 'Cerré la sesión en mis equipos'], 'Nada todavía'),
        pasoImpacto(),
        pasoUrgencia({ v: 'alta', t: 'No puedo trabajar' })
      ],
      armar(r) {
        const ocurre = { 'Desde hoy': 'desde hoy', 'Desde ayer': 'desde ayer', 'Hace varios días': 'hace varios días', 'No sé': 'sin saber desde cuándo' }[r.desde] || '';
        return {
          asunto: 'Posible robo de una cuenta',
          desc: punto(cap(r.relato)),
          resumen: `La persona sospecha que le robaron o usaron indebidamente una cuenta, ${ocurre}. La plataforma le mostró el aviso de llamar a TI de inmediato. Ya hizo: ${bajo(punto(r.probo || 'nada todavía'))} ${cap(IMPACTOS.find((x) => x.v === r.impacto).frase)} y ${URGENCIAS.find((x) => x.v === r.urgencia).frase}.`,
          aclar: [],
          valores: { desde: r.desde }
        };
      }
    }
  };

  /* ---------- Armado del caso a partir de lo conversado ---------- */
  function armarTicket(key, r, ref, emp) {
    const g = GUIONES[key];
    const dat = APP.datos[emp];
    const eqs = equiposDe(ref, dat);
    const eq = eqs.find((e) => e.id === r.equipo) || null;
    const b = g.armar(r, eq, eqs);
    const campos = CAMPOS[g.sv].map((c) => Object.assign({}, c, { v: (b.valores && b.valores[c.k]) || '' }));
    return {
      key, emp, servicio: g.servicio, tipo: g.tipo, sv: g.sv, quien: ref,
      asunto: b.asunto, desc: b.desc, impacto: r.impacto, urgencia: r.urgencia,
      equipo: g.sv === 'problema' ? (eq ? eq.id : 'ninguno') : '',
      probo: r.probo || 'Nada todavía', resumen: b.resumen, aclar: b.aclar, campos,
      editados: {}, errores: {}, fecha: FECHA, hora: HORA, relato: r.relato
    };
  }
  const prioTicket = (t) => prioDe(t.impacto, t.urgencia);

  /* ---------- Casos ya enviados antes (para que el técnico los vea en la cola) ---------- */
  let _sig = 125;
  function casoDe(n, t) {
    const p = prioTicket(t);
    return { n, asunto: t.asunto, quien: t.quien, prio: PRIO[p], est: 'Nuevo', resp: '', sla1: ['En plazo', 'exito'], sla2: ['En plazo', 'exito'], origen: 'asistente', emp: t.emp, tk: t, equipo: t.equipo && t.equipo !== 'ninguno' ? t.equipo : '', cuando: t.fecha + ' ' + t.hora };
  }
  (function precargar() {
    const e1 = APP.datos.e1;
    const eq = (ref) => (equiposDe(ref, e1)[0] || {}).id;
    const lista = [
      ['AYU-000122', 'laptop', 'PRS-0011', { relato: 'No prende mi laptop', equipo: eq('PRS-0011'), desde: 'Desde hoy', luz: 'no', luz_t: 'No, ninguna luz', antes: 'Un golpe o caída', probo: 'Mantuve pulsado el botón de encendido', ubicar: 'Piso 1, Recepción, todo el día', impacto: 'una', urgencia: 'alta' }, '08:12'],
      ['AYU-000123', 'correo', 'PRS-0010', { relato: 'No puedo entrar a mi correo', equipo: eq('PRS-0010'), desde: 'Desde ayer', error: 'Su cuenta está bloqueada. Intente de nuevo en 30 minutos o contacte a su administrador. (código 50053)', sospecha_t: 'No, solo no me deja entrar', trabajo_t: 'Solo con el del trabajo', probo: 'Probé desde otro navegador', impacto: 'una', urgencia: 'alta' }, '08:27'],
      ['AYU-000124', 'mouse', 'PRS-0005', { relato: 'Necesito un mouse nuevo', cantidad: '1', motivo: 'Primer equipo', cuando: 'Esta semana', tipo: 'Inalámbrico', tipo_t: 'Inalámbrico', probo: 'Nada todavía', impacto: 'una', urgencia: 'baja' }, '08:41']
    ];
    lista.forEach(([n, key, ref, r, hora]) => {
      const t = armarTicket(key, r, ref, 'e1'); t.hora = hora;
      const c = casoDe(n, t); c.cuando = FECHA + ' ' + hora;
      if (key === 'laptop') { c.est = 'En atención'; c.resp = 'Marta Quispe'; c.sla1 = ['Cumplido', 'exito']; }
      CASOS.unshift(c);                              // el más nuevo queda arriba
    });
  })();

  /* =====================================================================
     DETECCIÓN (lista fija de expresiones, D-105.2): en la maqueta es muy simple
     ===================================================================== */
  function clasificar(texto) {
    const t = plano(texto);
    if (/incendio|humo|herid|ambulancia|amenaza|violencia|infarto/.test(t)) return 'personas';
    if (/me robaron|robaron mi|hackearon|hackeo|phishing|enlace falso|ransomware|secuestr|di mi (clave|contrasena)|entregue mi (clave|contrasena)|cuenta (robada|comprometida|hackeada)/.test(t)) return 'seguridad';
    if (/(mi )?(clave|contrasena|password) (es|:)|contrasena:|clave:|codigo de verificacion/.test(t)) return 'clave';
    if (/ignore (sus|tus|las) (reglas|instrucciones)|urgencia maxima|muestre sus instrucciones|muestrame tus instrucciones|cree el caso ya/.test(t)) return 'manipula';
    if (/hablar con (una )?(persona|humano|tecnico)|un humano|quiero un tecnico/.test(t)) return 'persona';
    if (/vacaciones|sueldo|nomina|boleta de pago|licencia medica|despido|contrato laboral|chiste|receta de|futbol/.test(t)) return 'fuera';
    if (/mi jefe|mi jefa|mi companer|el correo de |la laptop de |los equipos de |que equipos tiene|de otra persona|casos de (mi|otra)/.test(t)) return 'otra';
    if (/correo|outlook|email|\bmail\b|no puedo (entrar|ingresar)/.test(t)) return 'correo';
    if (/mouse|raton|teclado|accesorio|auricular|necesito un|quiero un|pedir un|solicitar/.test(t)) return 'mouse';
    if (/laptop|portatil|notebook|computadora|\bpc\b|no prende|no enciende/.test(t)) return 'laptop';
    return 'nada';
  }

  /* =====================================================================
     MENSAJES FIJOS (textos de la plataforma, no escritos por el modelo)
     ===================================================================== */
  const FIJOS = {
    personas: { tono: 'alerta', titulo: 'Esto no es un caso de TI', detalle: 'Llame ahora a los servicios de emergencia o siga el procedimiento de emergencias de su empresa. No sigo con preguntas.' },
    seguridad: { tono: 'alerta', titulo: 'Llame ahora a TI: ' + CONTACTO, detalle: 'Esto puede ser una emergencia de seguridad. No espere respuesta en este chat. Mientras tanto no abra enlaces ni entregue claves o códigos a nadie.' },
    clave: { tono: 'atencion', titulo: 'No escriba contraseñas ni códigos', detalle: 'Nunca le pediré su contraseña ni un código de verificación, y TI tampoco. Ese mensaje no se tomó en cuenta: escriba lo que le pasa sin incluir claves.' },
    manipula: { tono: 'atencion', titulo: 'No puedo cambiar mis reglas', detalle: 'Solo puedo ayudarle a armar su caso con lo que usted me cuente. Si prefiere, use el formulario «Pedir ayuda».', form: true },
    persona: { tono: 'info', titulo: 'Le paso al formulario', detalle: 'Si prefiere hablar con una persona, llame a TI: ' + CONTACTO + '. También puede enviar el formulario «Pedir ayuda»: dejé en él lo que ya me contó.', form: true },
    noentiende: { tono: 'info', titulo: 'No logro entender su pedido', detalle: 'Para no hacerle perder tiempo, le dejo el formulario «Pedir ayuda» con lo que ya me contó. También puede llamar a TI: ' + CONTACTO + '.', form: true },
    fuera: { tono: 'info', titulo: 'Eso no es un asunto de TI', detalle: 'No puedo ayudarle con vacaciones, pagos, salud, temas legales ni conversación general. Sí puedo ayudarle a reportar un problema con un equipo o una cuenta, o a pedir un equipo o accesorio.' },
    otra: { tono: 'info', titulo: 'Solo puedo ayudarle con su información', detalle: 'No consulto ni confirmo datos de otras personas. Si necesita un caso a nombre de otra persona, un técnico de TI lo registra por usted: llame a ' + CONTACTO + '.' },
    caido: { tono: 'atencion', titulo: 'El asistente no está disponible en este momento', detalle: 'No se perdió nada. «Pedir ayuda» funciona siempre, con la misma prioridad y los mismos plazos. Urgencias de TI: ' + CONTACTO + '.', form: true, bloquea: true, reintentar: true },
    limite: { tono: 'atencion', titulo: 'Llegó al límite de mensajes de hoy', detalle: 'Por seguridad cada persona tiene un máximo de mensajes por día. Lo que ya me contó no se pierde: lo dejo en el formulario «Pedir ayuda».', form: true, bloquea: true },
    tope: { tono: 'atencion', titulo: 'El asistente está en pausa por hoy', detalle: 'La empresa llegó al tope de uso del asistente. «Pedir ayuda» funciona igual y con los mismos plazos. Urgencias de TI: ' + CONTACTO + '.', form: true, bloquea: true }
  };

  /* =====================================================================
     MOTOR DE LA CONVERSACIÓN
     ===================================================================== */
  const eqsActuales = () => equiposDe(R().ref);
  const pasos = () => (GUIONES[S().guion] ? GUIONES[S().guion].pasos : []);
  const activo = (p) => !p.si || p.si(S().r, eqsActuales());
  function anunciar(t) { const a = $('asi-anuncio'); if (a) { a.textContent = ''; setTimeout(() => { a.textContent = t; }, 30); } }

  function saludo() {
    const s = S();
    s.msgs = [{ de: 'ia', t: `Hola. Soy el asistente de inteligencia artificial de ${E().nombre}. Puedo equivocarme: usted revisa todo antes de enviarlo a TI. No escriba contraseñas ni códigos.\nLo que escribe aquí lo procesa un servicio externo de IA; escriba solo lo necesario. (Aviso provisional: lo revisa un abogado.)` },
      { de: 'ia', t: '¿Qué le pasa o qué necesita?' }];
  }
  function reiniciar() {
    const s = S(); const abierto = s.abierto; const clave = s.clave;
    s.tok++;
    APP.asi = Object.assign(nuevoEstado(), { abierto, clave, tok: s.tok });
    saludo();
  }

  /* Mensaje del asistente con "escribiendo…" */
  function ia(texto, extra, cb) {
    const s = S(); const tok = s.tok;
    const poner = () => {
      if (s.tok !== tok) return;
      s.pensando = false; s.msgs.push(Object.assign({ de: 'ia', t: texto }, extra || {}));
      anunciar(texto); s.foco = true; if (cb) cb(); pintar();
    };
    if (!demora()) { poner(); return; }
    s.pensando = true; pintar(); setTimeout(poner, demora());
  }
  function fijo(clave, extra) {
    const s = S(); const f = Object.assign({}, FIJOS[clave], extra || {});
    s.msgs.push({ de: 'fijo', clave, f });
    anunciar(f.titulo + '. ' + (f.detalle || ''));
    const al = $('asi-alerta'); if (al && f.tono === 'alerta') { al.textContent = ''; setTimeout(() => { al.textContent = f.titulo + '. ' + f.detalle; }, 30); }
    s.foco = true;
    if (f.bloquea) s.fase = 'bloqueado';
  }

  /* Siguiente pregunta del guion */
  function preguntar() {
    const s = S(); const ps = pasos();
    let j = s.i;
    while (j < ps.length && !activo(ps[j])) j++;
    if (j >= ps.length) { armar(); return; }
    s.i = j;
    const p = ps[j];
    const txt = (s.ack ? s.ack + '\n' : '') + p.p(s.r);
    s.ack = '';
    ia(txt, p.arts ? { arts: p.arts } : null);
  }
  function pasoActual() { const s = S(); return pasos()[s.i]; }

  function empezar(key, texto) {
    const s = S();
    s.guion = key; s.fase = 'chat'; s.i = 0; s.r = { relato: texto }; s.intentos = 0;
    s.msgs.push({ de: 'yo', t: texto });
    preguntar();
  }

  function responder(v, etq) {
    const s = S(); const p = pasoActual(); if (!p || s.pensando) return;
    const txt = etq === undefined ? String(v) : etq;
    s.msgs.push({ de: 'yo', t: txt || '(sin respuesta)' });
    s.r[p.campo] = v; s.r[p.campo + '_t'] = txt;
    if (p.id === 'servicio' && v === 'no') {
      s.guion = null; s.fase = 'inicio'; s.r = {}; s.i = -1;
      ia('Entendido, empecemos de nuevo sin registrar nada. ¿Qué le pasa o qué necesita?'); return;
    }
    if (p.id === 'sospecha' && v === 'si') { emergencia(s.r.relato, true); return; }
    if (p.id === 'articulos' && v === 'resuelto') {
      s.fase = 'fin';
      ia('Me alegra que se haya resuelto. No se creó ningún caso y no se guardó esta conversación. Si el problema vuelve, aquí estaré.'); return;
    }
    if (p.id === 'equipo' && v !== 'ninguno') { const e = eqsActuales().find((x) => x.id === v); s.ack = e ? `Anotado: ${e.modelo}.` : ''; }
    else if (p.id === 'impacto' || p.id === 'urgencia' || p.id === 'servicio') s.ack = '';
    else if (p.opcional && !txt) s.ack = 'Sin problema, la dejamos en blanco.';
    else s.ack = 'Anotado.';
    if (s.corr) {
      const ix = s.corr.indexOf(p.id); if (ix >= 0) s.corr.splice(ix, 1);
      if (s.corr.length) { s.i = pasos().findIndex((x) => x.id === s.corr[0]); s.ack = ''; ia(pasos()[s.i].p(s.r)); return; }
      s.corr = null; armar(true); return;
    }
    s.i++;
    preguntar();
  }

  function armar(vuelta) {
    const s = S();
    const viejo = s.t;
    s.t = armarTicket(s.guion, s.r, R().ref, APP.empresa);
    if (vuelta && viejo) {
      Object.keys(viejo.editados).forEach((k) => { if (k in s.t) s.t[k] = viejo[k]; else { const c = s.t.campos.find((x) => x.k === k); const o = viejo.campos.find((x) => x.k === k); if (c && o) c.v = o.v; } s.t.editados[k] = true; });
    }
    s.fase = 'confirmar'; s.menu = null;
    anunciar('Armé su caso. Revíselo: nada se envía hasta que pulse Enviar a TI.');
    s.foco = true;
    pintar();
  }

  /* Emergencia de seguridad: mensaje fijo y ofrece dejar constancia */
  function emergencia(relato, desdePaso) {
    const s = S();
    s.t = null; s.corr = null; s.guion = null; s.i = -1; s.ack = ''; s.urgente = true;
    s.r = { relato: desdePaso ? 'Creo que me robaron la cuenta de correo' : relato };
    fijo('seguridad');
    s.fase = 'ofrece';
    ia('Si lo desea, puedo dejar constancia por escrito de lo que pasó, armando un caso para TI. ¿Quiere hacerlo?', null, () => { s.menu = [{ v: 'si', t: 'Sí, dejar constancia' }, { v: 'no', t: 'No, gracias' }]; });
  }

  /* Texto escrito por la persona */
  function enviarTexto() {
    const s = S(); const txt = (s.entrada || '').trim();
    if (!txt || s.pensando || s.fase === 'bloqueado' || s.fase === 'confirmar' || s.fase === 'enviado') return;
    s.entrada = '';
    const c = clasificar(txt);
    if (c === 'clave') { fijo('clave'); pintar(); return; }
    if (c === 'personas') { s.msgs.push({ de: 'yo', t: txt }); fijo('personas'); s.fase = 'fin'; pintar(); return; }
    if (c === 'seguridad') { s.msgs.push({ de: 'yo', t: txt }); emergencia(txt, false); return; }
    if (c === 'manipula' || c === 'persona') { s.msgs.push({ de: 'yo', t: txt }); fijo(c); pintar(); return; }
    if (c === 'fuera' || c === 'otra') { s.msgs.push({ de: 'yo', t: txt }); fijo(c); pintar(); return; }
    if (s.fase === 'inicio') {
      if (GUIONES[c] && c !== 'robo') { empezar(c, txt); return; }
      s.msgs.push({ de: 'yo', t: txt }); s.intentos++;
      if (s.intentos >= 2) { fijo('noentiende'); pintar(); return; }
      ia('No estoy seguro de haber entendido. ¿Se trata de un problema con un equipo, con su correo o cuenta, o de un pedido? (En esta simulación solo conozco tres casos: laptop, correo y accesorio; pruebe con los botones.)');
      return;
    }
    if (s.fase === 'chat') {
      const p = pasoActual();
      if (p && p.id === 'cantidad' && !/^\d{1,3}$/.test(txt)) { s.msgs.push({ de: 'yo', t: txt }); ia('Escriba solo un número, por ejemplo 1.'); return; }
      if (p && (p.tipo === 'texto' || p.libre)) { responder(txt, txt); return; }
    }
    s.msgs.push({ de: 'yo', t: txt });
    ia('Para esta pregunta, por favor elija una de las opciones.');
  }

  /* Elegir una opción (botón o tarjeta) */
  function elegir(v, etq) {
    const s = S(); if (s.pensando) return;
    if (s.fase === 'inicio') { empezar(v, etq); return; }
    if (s.fase === 'chat') { responder(v, etq); return; }
    if (s.fase === 'ofrece') {
      s.menu = null; s.msgs.push({ de: 'yo', t: etq });
      if (v === 'si') { s.guion = 'robo'; s.fase = 'chat'; s.i = 0; s.t = null; s.ack = 'Gracias. Serán pocas preguntas.'; preguntar(); }
      else { s.fase = 'fin'; ia('De acuerdo. Recuerde llamar ahora a TI: ' + CONTACTO + '. No se creó ningún caso.'); }
      return;
    }
    if (s.fase === 'corregir') {
      if (v === 'volver') { s.menu = null; s.fase = 'confirmar'; s.msgs.push({ de: 'yo', t: etq }); pintar(); return; }
      s.msgs.push({ de: 'yo', t: etq });
      const p = pasos().find((x) => x.id === v); if (!p) return;
      s.menu = null; s.fase = 'chat'; s.corr = [p.id].concat(p.encadena || []); s.i = pasos().indexOf(p); s.ack = '';
      ia('Sin problema. ' + p.p(s.r)); return;
    }
    if (s.fase === 'fin') { reiniciar(); pintar(); }
  }

  /* Opciones visibles ahora (respuestas rápidas, tarjetas) */
  function opcionesActuales() {
    const s = S(); if (s.pensando) return null;
    if (s.fase === 'inicio') {
      return { tipo: 'botones', ops: ['laptop', 'correo', 'mouse'].map((k) => ({ v: k, t: GUIONES[k].inicio })), rotulo: 'Ejemplos para probar (también puede escribir con sus palabras):' };
    }
    if (s.fase === 'ofrece' && s.menu) return { tipo: 'botones', ops: s.menu };
    if (s.fase === 'corregir' && s.menu) return { tipo: 'botones', ops: s.menu };
    if (s.fase === 'fin') return { tipo: 'botones', ops: [{ v: 'nueva', t: 'Empezar otra conversación' }] };
    if (s.fase === 'chat') {
      const p = pasoActual(); if (!p) return null;
      if (p.tipo === 'equipo') return { tipo: 'equipo', neutra: p.neutra || 'Ninguno / no es de un equipo', eqs: eqsActuales() };
      if (p.opciones) return { tipo: 'botones', ops: p.opciones };
    }
    return null;
  }
  const textoLibre = () => {
    const s = S();
    if (s.fase === 'inicio') return true;
    if (s.fase === 'chat') { const p = pasoActual(); return !!(p && (p.tipo === 'texto' || p.libre)); }
    return false;
  };

  /* =====================================================================
     DIBUJO DEL PANEL
     ===================================================================== */
  function burbuja(m) {
    if (m.de === 'yo') return `<div class="asi-msg yo"><span class="asi-quien">Usted</span><div class="asi-burbuja">${lineas(m.t)}</div></div>`;
    if (m.de === 'fijo') {
      const f = m.f; const ic = { alerta: 'alerta', atencion: 'info', info: 'info' }[f.tono];
      const acc = [];
      if (f.form) acc.push(`<button type="button" class="btn primario" data-acc="asi-formulario">${icono('doc')}Abrir «Pedir ayuda» con lo reunido</button>`);
      if (f.reintentar) acc.push('<button type="button" class="btn" data-acc="asi-reintentar">Reintentar</button>');
      return `<div class="asi-msg fijo"><div class="aviso ${f.tono}">${icono(ic)}<div class="cuerpo-aviso"><strong>${esc(f.titulo)}</strong>${esc(f.detalle)}<span class="chip etq">${icono('candado')}Mensaje fijo de la plataforma, no lo escribió la IA</span>${acc.length ? `<div class="acciones-msg">${acc.join('')}</div>` : ''}</div></div></div>`;
    }
    const arts = m.arts ? `<ul class="asi-lista-art">${m.arts.map((a) => `<li><button type="button" class="asi-enlace" data-acc="asi-articulo">${esc(a)}</button></li>`).join('')}</ul>` : '';
    return `<div class="asi-msg ia"><span class="asi-quien">${icono('asistente')}Asistente de IA</span><div class="asi-burbuja">${lineas(m.t)}${arts}</div></div>`;
  }
  function opcionesHTML() {
    const o = opcionesActuales(); if (!o) return '';
    if (o.tipo === 'equipo') {
      return `<div class="asi-tarjetas" role="group" aria-label="Sus equipos">${o.eqs.map((e) => `<button type="button" class="asi-tarjeta" data-acc="asi-opcion" data-v="${esc(e.id)}" data-t="${esc(e.modelo)}"><strong>${icono(/Celular/.test(e.cat) ? 'telefono' : 'caja')}${esc(e.modelo)}</strong><span class="detalle">${esc(e.cat)} · código ${esc(e.cod)}</span></button>`).join('')}<button type="button" class="asi-tarjeta neutra" data-acc="asi-opcion" data-v="ninguno" data-t="${esc(o.neutra)}"><strong>${esc(o.neutra)}</strong></button></div>`;
    }
    return `${o.rotulo ? `<p class="suave chica sin-margen">${esc(o.rotulo)}</p>` : ''}<div class="asi-opciones" role="group" aria-label="Respuestas rápidas">${o.ops.map((x) => `<button type="button" class="asi-chip" data-acc="asi-opcion" data-v="${esc(x.v)}" data-t="${esc(x.t)}">${esc(x.t)}</button>`).join('')}</div>`;
  }

  /* --- Formulario de confirmación (el de «Pedir ayuda», ya lleno) --- */
  function campoHTML(c, g) {
    const t = S().t; const id = 'asi-f-' + c.k; const err = t.errores[c.k];
    const lab = `<label for="${id}">${esc(c.label)}${c.obl ? ' <span class="obligatorio">(obligatorio)</span>' : ' <span class="obligatorio">(opcional)</span>'}</label>`;
    let ctl;
    const at = `id="${id}" data-k="${esc(c.k)}" ${c.obl ? 'aria-required="true"' : ''} ${err ? `aria-invalid="true" aria-describedby="${id}-e"` : ''}`;
    if (c.tipo === 'lista') ctl = `<select ${at} data-cambio="asi-campo"><option value="">${c.obl ? 'Elija…' : 'Sin indicar'}</option>${c.ops.map((o) => `<option ${o === c.v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    else if (c.tipo === 'area') ctl = `<textarea ${at} data-entrada="asi-campo">${esc(c.v)}</textarea>`;
    else if (c.tipo === 'numero') ctl = `<input type="number" min="1" ${at} data-entrada="asi-campo" value="${esc(c.v)}">`;
    else ctl = `<input type="text" ${at} data-entrada="asi-campo" value="${esc(c.v)}">`;
    const marca = t.editados[c.k] ? `<div class="ayuda">${icono('check')} Corregido por usted</div>` : '';
    return `<div class="campo">${lab}${ctl}${marca}<div class="error" id="${id}-e" ${err ? '' : 'hidden'}>${icono('alerta')}<span>${esc(err || '')}</span></div></div>`;
  }
  function comunHTML(k, label, tipo, obl, ops) {
    const t = S().t; const id = 'asi-f-' + k; const err = t.errores[k];
    const at = `id="${id}" data-k="${k}" aria-required="${obl ? 'true' : 'false'}" ${err ? `aria-invalid="true" aria-describedby="${id}-e"` : ''}`;
    let ctl;
    if (tipo === 'area') ctl = `<textarea ${at} data-entrada="asi-campo">${esc(t[k])}</textarea>`;
    else if (tipo === 'lista') ctl = `<select ${at} data-cambio="asi-campo">${ops.map((o) => `<option value="${esc(o.v)}" ${String(o.v) === String(t[k]) ? 'selected' : ''}>${esc(o.t)}</option>`).join('')}</select>`;
    else ctl = `<input type="text" ${at} data-entrada="asi-campo" value="${esc(t[k])}">`;
    const marca = t.editados[k] ? `<div class="ayuda">${icono('check')} Corregido por usted</div>` : '';
    return `<div class="campo"><label for="${id}">${esc(label)} <span class="obligatorio">${obl ? '(obligatorio)' : '(opcional)'}</span></label>${ctl}${marca}<div class="error" id="${id}-e" ${err ? '' : 'hidden'}>${icono('alerta')}<span>${esc(err || '')}</span></div></div>`;
  }
  function bloqueTI(t) {
    const p = personaDeRef(t.quien, APP.datos[t.emp]); const eqs = equiposDe(t.quien, APP.datos[t.emp]);
    const abiertos = CASOS.filter((c) => t.equipo && t.equipo !== 'ninguno' && c.equipo === t.equipo && !['Cerrado', 'Resuelto'].includes(c.est));
    return `<section class="asi-ti" aria-labelledby="asi-ti-t"><h3 id="asi-ti-t">${icono('ojo')} Esto verá TI</h3><p class="suave chica">Además de lo que usted confirma arriba, la plataforma agrega estos datos. Usted no los escribe y el asistente no los inventa.</p><dl class="lista-datos">
      <dt>Persona atendida</dt><dd>${esc(p.nombre)} · ${esc(p.area)}${p.puesto && p.puesto !== '—' ? ' · ' + esc(p.puesto) : ''}</dd>
      <dt>Empresa</dt><dd>${esc(EMPRESAS[t.emp].nombre)}</dd>
      <dt>Quién lo creó</dt><dd>Usted, con el asistente de IA</dd>
      <dt>Fecha y hora</dt><dd>${t.fecha} ${t.hora} (hora de Lima)</dd>
      <dt>Sus equipos asignados</dt><dd>${eqs.length ? `<ul>${eqs.map((e) => `<li>${esc(e.modelo)} · ${esc(e.cat)} · ${esc(e.cod)} · ${chip(e.estado)}</li>`).join('')}</ul><span class="suave">TI verá también el número de serie.</span>` : 'Ninguno'}</dd>
      <dt>Casos abiertos del mismo equipo</dt><dd>${abiertos.length ? abiertos.map((c) => `<span class="cod">${c.n}</span> ${esc(c.asunto)} (${esc(c.est)})`).join('<br>') : 'Ninguno'}</dd>
      <dt>Marca</dt><dd>${chipEtq('Armado con el asistente')}</dd></dl></section>`;
  }
  function formularioHTML() {
    const s = S(); const t = s.t; const eqs = eqsActuales(); const p = prioTicket(t);
    const hayErr = Object.keys(t.errores).length;
    const ob = t.campos.filter((c) => c.obl); const op = t.campos.filter((c) => !c.obl);
    const opConValor = op.some((c) => c.v);
    return `<form class="asi-form" data-form="asi-guardar-nada" novalidate aria-labelledby="asi-form-t">
      <h3 id="asi-form-t" tabindex="-1">Revise su caso antes de enviarlo</h3>
      ${aviso('info', 'Nada se ha enviado todavía.', 'Este es el formulario «Pedir ayuda» ya llenado con lo que conversamos. Cámbielo si hace falta. TI lo recibirá solo cuando pulse el botón «Enviar a TI».')}
      ${hayErr ? `<div class="aviso alerta" id="asi-resumen-err">${icono('alerta')}<div class="cuerpo-aviso"><strong>Faltan datos para enviar</strong>Revise los campos marcados en rojo.</div></div>` : ''}
      <div class="campo"><span class="etiqueta">Servicio</span><div>${chipEtq(t.servicio)} <span class="suave chica">${t.tipo === 'Pedido' ? 'Pedido' : 'Incidente'} · para cambiarlo pulse «Corregir»</span></div></div>
      ${comunHTML('asunto', 'Asunto (una línea)', 'texto', true)}
      ${comunHTML('desc', 'Descripción', 'area', true)}
      <div class="fila-form">
        ${comunHTML('impacto', '¿A cuántas personas afecta?', 'lista', true, IMPACTOS.map((x) => ({ v: x.v, t: x.t })))}
        ${comunHTML('urgencia', '¿Cuánto le impide trabajar?', 'lista', true, URGENCIAS.map((x) => ({ v: x.v, t: x.t })))}
      </div>
      <p id="asi-prio" class="fila">${prioChip(p)}</p>
      ${t.sv === 'problema' ? comunHTML('equipo', 'Equipo afectado', 'lista', eqs.length > 0, eqs.map((e) => ({ v: e.id, t: `${e.modelo} (${e.cat}, ${e.cod})` })).concat([{ v: 'ninguno', t: 'Ninguno / no es de un equipo' }])) : ''}
      <div class="fila-form">${ob.map((c) => campoHTML(c)).join('')}</div>
      ${comunHTML('probo', 'Lo que ya probó', 'area', true)}
      ${op.length ? `<details ${opConValor || op.some((c) => t.errores[c.k]) ? 'open' : ''}><summary>Más datos (opcionales)</summary><div class="fila-form">${op.map((c) => campoHTML(c)).join('')}</div></details>` : ''}
      ${comunHTML('resumen', 'Resumen para TI (redactado por el asistente: revíselo)', 'area', true)}
      ${t.aclar.length ? `<details><summary>Aclaraciones que también quedarán en el caso (${t.aclar.length})</summary><ul>${t.aclar.map((a) => `<li><strong>${esc(a.p)}</strong> ${esc(a.r)}</li>`).join('')}</ul></details>` : ''}
      ${bloqueTI(t)}
    </form>`;
  }
  const prioChip = (p) => `<span class="chip calc s-${PRIO_FAM[p]}" title="La prioridad la calcula la plataforma con impacto y urgencia; el asistente no la fija">${icono('reloj')}Prioridad: ${PRIO[p]}</span><span class="suave chica">La calcula la plataforma con sus dos respuestas.</span>`;

  function exitoHTML() {
    const e = S().enviado;
    return `<div class="asi-exito">${icono('check')}<h3>Su caso fue enviado a TI</h3><span class="numero">${e.n}</span>
      <p>Prioridad: <strong>${PRIO[e.p]}</strong>. TI responderá antes de: <strong>${PLAZO[e.p]}</strong> <span class="suave chica">(plazo de ejemplo; el real lo fija su empresa)</span>.</p>
      <p class="suave chica">La conversación se cerró y no se guardó. En el caso quedó solo lo que usted confirmó.</p></div>`;
  }

  function cuerpoHTML() {
    const s = S();
    if (s.fase === 'confirmar') return formularioHTML();
    if (s.fase === 'enviado') return exitoHTML();
    return s.msgs.map(burbuja).join('') + (s.pensando ? `<div class="asi-escribiendo" role="status">${icono('asistente')}<span>El asistente está escribiendo</span><span class="puntos" aria-hidden="true"><span></span><span></span><span></span></span></div>` : '') + opcionesHTML();
  }
  function avanceHTML() {
    const s = S(); if (s.fase !== 'chat') return '';
    const ps = pasos().filter(activo); const p = pasoActual();
    const pos = Math.max(1, ps.indexOf(p) + 1); const tot = Math.max(ps.length, pos);
    return `<div class="asi-avance"><span>Pregunta ${pos} de unas ${tot}</span><span class="barra-avance" aria-hidden="true"><span style="width:${Math.round(pos / tot * 100)}%"></span></span></div>`;
  }
  function pieHTML() {
    const s = S();
    if (s.fase === 'confirmar') {
      return `<div class="asi-acciones"><button type="button" class="btn primario" data-acc="asi-enviar-ti">${icono('enviar')}Enviar a TI</button><button type="button" class="btn" data-acc="asi-corregir">Corregir</button><button type="button" class="btn" data-acc="asi-descartar">Descartar</button></div><p class="nota">«Corregir» vuelve al chat para cambiar un dato. También puede editar los campos directamente.</p>`;
    }
    if (s.fase === 'enviado') {
      const ver = APP.rol === 'emp' ? '#/portal?tab=casos' : '#/casos?origen=asistente';
      return `<div class="asi-acciones"><a class="btn primario" href="${ver}" data-acc="asi-cerrar-ir">Ver ${APP.rol === 'emp' ? 'mis casos' : 'el caso en la cola'}</a><button type="button" class="btn" data-acc="asi-reiniciar">Armar otro caso</button></div>`;
    }
    const libre = textoLibre(); const bloq = s.fase === 'bloqueado';
    const ph = bloq ? 'El asistente no está disponible' : libre ? 'Escriba aquí con sus palabras' : 'Elija una opción de arriba';
    const p = s.fase === 'chat' ? pasoActual() : null;
    return `${avanceHTML()}<form class="asi-compositor" data-form="asi-enviar"><label class="oculto-visual" for="asi-entrada">Su mensaje</label><input id="asi-entrada" type="text" autocomplete="off" maxlength="300" placeholder="${ph}" value="${esc(s.entrada)}" ${libre && !s.pensando ? '' : 'disabled'} data-entrada="asi-texto"><button type="submit" class="btn primario icono" aria-label="Enviar mensaje" ${libre && !s.pensando ? '' : 'aria-disabled="true"'}>${icono('enviar')}</button></form>
      <div class="fila-pie"><span class="suave chica">No escriba contraseñas ni códigos.</span>${s.fase === 'chat' && p && p.ejemplo && !s.pensando ? '<button type="button" class="btn chico fantasma" data-acc="asi-ejemplo">Responder con el ejemplo</button>' : ''}</div>`;
  }

  function pintar() {
    const s = S(); const p = $('asi-panel'); if (!p || !s.abierto) return;
    p.classList.toggle('ancho', s.fase === 'confirmar');
    $('asi-sim').hidden = s.fase === 'confirmar' || s.fase === 'enviado';
    const u = $('asi-urgente'); u.hidden = !s.urgente;
    if (s.urgente) u.innerHTML = `${icono('alerta')}<span><strong>Llame ahora a TI:</strong> ${esc(CONTACTO)}</span>`;
    const cu = $('asi-cuerpo'); const enForm = s.fase === 'confirmar';
    cu.innerHTML = cuerpoHTML();
    $('asi-pie').innerHTML = pieHTML();
    if (enForm) { if (s.foco) { const e = cu.querySelector('[aria-invalid="true"]') || $('asi-form-t'); if (e) e.focus({ preventScroll: false }); } }
    else {
      cu.scrollTop = cu.scrollHeight;
      const al = [...cu.querySelectorAll('.aviso.alerta')].pop();               // una alerta fija nunca debe quedar cortada arriba
      if (al && s.fase === 'ofrece') cu.scrollTop = Math.max(0, al.closest('.asi-msg').offsetTop - 8);
    }
    if (s.foco && !enForm) {
      const cand = cu.querySelector('.asi-chip, .asi-tarjeta') || ($('asi-entrada') && !$('asi-entrada').disabled ? $('asi-entrada') : null) || document.querySelector('#asi-pie [data-acc]');
      if (cand) cand.focus({ preventScroll: true });
    }
    s.foco = false;
    if (s.auto) { clearTimeout(s.tAuto); s.tAuto = setTimeout(autoPaso, 600); }
  }

  /* --- Montaje del panel y del botón flotante --- */
  function montar() {
    let raiz = $('asi-raiz');
    if (raiz) return raiz;
    raiz = document.createElement('div'); raiz.id = 'asi-raiz';
    raiz.innerHTML = `<button type="button" id="asi-fab" class="asi-fab" data-acc="asi-abrir" aria-haspopup="dialog" aria-controls="asi-panel" aria-expanded="false" hidden>${icono('asistente')}<span>Asistente de IA</span></button>
    <aside id="asi-panel" class="asi-panel" role="dialog" aria-modal="false" aria-labelledby="asi-titulo" tabindex="-1" hidden>
      <header class="asi-cab"><span class="icono-cab" aria-hidden="true">${icono('asistente')}</span><div class="titulos"><h2 id="asi-titulo">Asistente de IA</h2><p>Soy una IA y puedo equivocarme.</p></div>
        <button type="button" data-acc="asi-reiniciar" aria-label="Empezar de nuevo la conversación">${icono('reiniciar')}<span>Reiniciar</span></button>
        <button type="button" data-acc="asi-cerrar" aria-label="Cerrar el asistente">${icono('cerrar')}</button></header>
      <div id="asi-urgente" class="asi-urgente" hidden></div>
      <p class="asi-nota-sim"><strong>Simulación:</strong> guion fijo y datos inventados, sin IA real.</p>
      <div class="asi-fijos" role="group" aria-label="Accesos siempre disponibles"><a href="#/pedir-ayuda" data-acc="asi-cerrar-ir">${icono('ayuda')}Pedir ayuda (formulario)</a><span class="urg">${icono('telefono')}Urgencias de TI: ${esc(CONTACTO)}</span></div>
      <details class="asi-sim" id="asi-sim"><summary>Probar otras situaciones (solo en la simulación)</summary><div class="sim-cuerpo">
        <h3>Casos tipo</h3><div class="sim-grupo">${['laptop', 'correo', 'mouse'].map((k) => `<button type="button" class="btn chico" data-acc="asi-sim" data-s="${k}">${esc(GUIONES[k].titulo)}</button>`).join('')}<button type="button" class="btn chico" data-acc="asi-auto">${icono('siguiente')}Ver una conversación completa sola</button></div>
        <h3>Derivaciones y estados</h3><div class="sim-grupo">${[['seguridad', 'Cuenta robada (emergencia)'], ['caido', 'Proveedor de IA caído'], ['limite', 'Límite de mensajes'], ['tope', 'Tope de gasto'], ['fuera', 'Tema fuera de TI'], ['otra', 'Datos de otra persona'], ['clave', 'Escribe una contraseña']].map((x) => `<button type="button" class="btn chico" data-acc="asi-sim" data-s="${x[0]}">${x[1]}</button>`).join('')}</div></div></details>
      <div id="asi-cuerpo" class="asi-cuerpo" tabindex="0" aria-label="Conversación"></div>
      <div id="asi-pie" class="asi-pie"></div>
      <div id="asi-anuncio" class="oculto-visual" aria-live="polite"></div><div id="asi-alerta" class="oculto-visual" role="alert"></div>
    </aside>`;
    document.body.appendChild(raiz);
    $('asi-panel').addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !document.querySelector('.velo')) { e.stopPropagation(); cerrar(); return; }
      if (e.key === 'Tab' && matchMedia('(max-width: 900px)').matches) {
        const f = [...$('asi-panel').querySelectorAll('button:not([disabled]):not([aria-disabled="true"]),a[href],input:not([disabled]),select,textarea,summary,[tabindex="0"]')].filter((x) => x.offsetParent !== null);
        if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    return raiz;
  }
  function abrir() {
    const s = S(); montar();
    s.abierto = true;
    if (!s.msgs.length) saludo();
    $('asi-panel').hidden = false; $('asi-fab').hidden = true; $('asi-fab').setAttribute('aria-expanded', 'true');
    s.foco = true; pintar(); anunciar('Asistente de IA abierto. Simulación con guion fijo.');
    if (matchMedia('(max-width: 900px)').matches) $('asi-panel').setAttribute('aria-modal', 'true'); else $('asi-panel').setAttribute('aria-modal', 'false');
  }
  function cerrar(sinFoco) {
    const s = S(); s.abierto = false; s.auto = false;
    if ($('asi-panel')) $('asi-panel').hidden = true;
    const f = $('asi-fab'); if (f) { f.hidden = false; f.setAttribute('aria-expanded', 'false'); if (!sinFoco) f.focus(); }
  }

  /* Lo llama el núcleo después de cada pantalla */
  window.asistenteRefrescar = function (layout) {
    montar();
    const visible = ['emp', 'tec'].includes(APP.rol) && APP.modulos.asistente && layout !== 'solo';
    const s = S(); const clave = APP.rol + '|' + APP.empresa;
    if (s.clave && s.clave !== clave) { reiniciar(); }
    S().clave = clave;
    document.body.classList.toggle('con-asistente', visible);
    if (!visible) { if (S().abierto) cerrar(true); $('asi-fab').hidden = true; return; }
    if (!S().abierto) $('asi-fab').hidden = false;
  };

  /* =====================================================================
     ACCIONES
     ===================================================================== */
  ACC['asi-abrir'] = () => abrir();
  ACC['asi-cerrar'] = () => cerrar();
  ACC['asi-cerrar-ir'] = () => cerrar(true);
  ACC['asi-reiniciar'] = () => { reiniciar(); S().foco = true; pintar(); };
  ACC['asi-opcion'] = (el) => {
    const v = el.dataset.v; const t = el.dataset.t;
    if (S().fase === 'fin' && v === 'nueva') { reiniciar(); S().foco = true; pintar(); return; }
    elegir(v, t);
  };
  ACC['asi-ejemplo'] = () => {
    const s = S(); const p = pasoActual(); if (!p || !p.ejemplo || s.pensando) return;
    const ej = typeof p.ejemplo === 'function' ? p.ejemplo(s.r, eqsActuales()) : p.ejemplo;
    responder(ej.v, ej.t);
  };
  ACC['asi-articulo'] = () => toast('Muestra: aquí se abriría el artículo de ayuda de su empresa.');
  ACC['asi-reintentar'] = () => toast('Sigue sin responder (simulado). Use el formulario «Pedir ayuda»: funciona siempre.', 'alerta');
  ACC['form-asi-enviar'] = () => enviarTexto();
  ACC['form-asi-guardar-nada'] = () => { /* Enter en el formulario no envía el caso: solo el botón «Enviar a TI» */ };
  ENTRADA['asi-texto'] = (el) => { S().entrada = el.value; };

  /* Llevar al formulario normal con lo reunido (D-110.3) */
  ACC['asi-formulario'] = () => {
    const s = S(); const r = s.r || {};
    const partes = [r.relato, r.desde ? 'Desde: ' + r.desde.toLowerCase() + '.' : '', r.probo ? 'Ya probé: ' + r.probo : ''].filter(Boolean);
    if (partes.length) APP.tmp.ayudaPrecarga = { desc: partes.join(' ') };
    else delete APP.tmp.ayudaPrecarga;
    cerrar(true);
    location.hash = '#/pedir-ayuda';
  };

  /* Probar situaciones (solo en la maqueta) */
  ACC['asi-sim'] = (el) => {
    const k = el.dataset.s; const s0 = S();
    const d = $('asi-sim'); if (d) d.open = false;
    if (GUIONES[k] && k !== 'robo') { reiniciar(); empezar(k, GUIONES[k].inicio); return; }
    if (['caido', 'limite', 'tope'].includes(k)) { if (s0.fase === 'confirmar') s0.fase = 'chat'; fijo(k); pintar(); return; }
    reiniciar();
    const s = S();
    if (k === 'seguridad') { s.msgs.push({ de: 'yo', t: 'Creo que me robaron la cuenta de correo' }); emergencia('Creo que me robaron la cuenta de correo', false); return; }
    if (k === 'fuera') { s.msgs.push({ de: 'yo', t: '¿Cuántos días de vacaciones me quedan?' }); fijo('fuera'); pintar(); return; }
    if (k === 'otra') { s.msgs.push({ de: 'yo', t: '¿Qué laptop tiene mi jefe?' }); fijo('otra'); pintar(); return; }
    if (k === 'clave') { fijo('clave'); pintar(); }
  };
  /* Ver una conversación completa sola, con las respuestas de ejemplo */
  function autoPaso() {
    const s = S();
    if (!s.auto || !s.abierto || s.pensando) return;
    if (s.fase === 'inicio') { reiniciar(); S().auto = true; empezar('laptop', GUIONES.laptop.inicio); return; }
    if (s.fase === 'chat') { ACC['asi-ejemplo'](); return; }
    s.auto = false;
  }
  ACC['asi-auto'] = () => {
    const d = $('asi-sim'); if (d) d.open = false;
    const s = S();
    if (!s.guion || s.fase === 'enviado') { reiniciar(); }
    S().auto = true;
    if (S().fase === 'inicio') { empezar('laptop', GUIONES.laptop.inicio); }
    else autoPaso();
  };

  /* --- Cambios dentro del formulario de confirmación --- */
  function fijarCampo(k, v) {
    const t = S().t; if (!t) return;
    if (k in t && typeof t[k] !== 'object') t[k] = v;
    else { const c = t.campos.find((x) => x.k === k); if (c) c.v = v; }
    t.editados[k] = true; delete t.errores[k];
    const e = $('asi-f-' + k + '-e'); if (e) e.hidden = true;
    const el = $('asi-f-' + k); if (el) el.removeAttribute('aria-invalid');
    if (k === 'impacto' || k === 'urgencia') { const p = $('asi-prio'); if (p) p.innerHTML = prioChip(prioTicket(t)); }
  }
  ENTRADA['asi-campo'] = (el) => fijarCampo(el.dataset.k, el.value);
  CAMBIO['asi-campo'] = (el) => { fijarCampo(el.dataset.k, el.value); };

  ACC['asi-corregir'] = () => {
    const s = S(); s.fase = 'corregir'; s.corr = null;
    const ops = pasos().filter((p) => p.corregible && activo(p)).map((p) => ({ v: p.id, t: p.corregible })).concat([{ v: 'volver', t: 'Nada, volver al resumen' }]);
    s.menu = ops;
    ia('Claro. ¿Qué quiere corregir? (También puede cambiar cualquier dato escribiendo directamente en el resumen.)');
  };
  ACC['asi-descartar'] = () => abrirDialogo({
    titulo: '¿Descartar este caso?', cuerpo: '<p>No se enviará nada a TI y se perderá lo que armamos en esta conversación.</p>',
    botones: [{ texto: 'Volver' }, { texto: 'Descartar', clase: 'peligro', alPulsar: () => { reiniciar(); S().foco = true; pintar(); toast('Caso descartado. No se envió nada a TI.'); } }]
  });
  ACC['asi-enviar-ti'] = () => {
    const s = S(); const t = s.t; if (!t || t.enviando) return;
    // el servidor repite las mismas validaciones del formulario normal
    t.errores = {};
    const falta = (k, msg) => { t.errores[k] = msg; };
    if (!String(t.asunto).trim()) falta('asunto', 'Escriba el asunto del caso.');
    if (!String(t.desc).trim()) falta('desc', 'Escriba la descripción.');
    if (!t.impacto) falta('impacto', 'Elija a cuántas personas afecta.');
    if (!t.urgencia) falta('urgencia', 'Elija cuánto le impide trabajar.');
    if (t.sv === 'problema' && eqsActuales().length && !t.equipo) falta('equipo', 'Elija el equipo afectado o «Ninguno».');
    t.campos.filter((c) => c.obl && !String(c.v).trim()).forEach((c) => falta(c.k, 'Este dato es obligatorio. Si no lo sabe, elija «No sé» cuando exista esa opción.'));
    if (!String(t.probo).trim()) falta('probo', 'Escriba qué probó, o «Nada todavía».');
    if (!String(t.resumen).trim()) falta('resumen', 'El resumen no puede quedar vacío.');
    if (Object.keys(t.errores).length) { s.foco = true; pintar(); return; }
    t.enviando = true;                                  // un doble clic crea un solo caso
    const n = 'AYU-' + String(_sig++).padStart(6, '0');
    const c = casoDe(n, t); c.equipo = t.equipo && t.equipo !== 'ninguno' ? t.equipo : '';
    CASOS.unshift(c);
    s.enviado = { n, p: prioTicket(t) };
    s.fase = 'enviado'; s.msgs = []; s.t = null; s.r = {}; s.guion = null;      // la conversación no se guarda
    anunciar('Su caso fue enviado a TI. Número ' + n);
    s.foco = false; pintar();
    const h = $('asi-cuerpo').querySelector('h3'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  };

  /* =====================================================================
     PANTALLA DE PRESENTACIÓN (para abrir desde la lista de pantallas)
     ===================================================================== */
  ruta('asistente', { id: 'PR-46', prio: 'B', fase: 'Fase 3', titulo: 'Asistente de IA: chat para armar un caso', acceso: () => APP.rol !== 'plat', render() {
    const ve = ['emp', 'tec'].includes(APP.rol);
    return `${cabeceraPantalla('Asistente de IA: chat para armar un caso', '<span class="id-pantalla">PR-46 · muestra de la Fase 3</span>')}${aviso('info', 'Muestra de la Fase 3 (simulación)', 'El asistente es un chat que hace una pregunta a la vez y arma un caso completo para TI. Aquí es una simulación con guion fijo: no hay IA real y todos los datos son inventados.')}
    ${ve ? '' : aviso('atencion', 'Su rol actual no ve el botón flotante', 'En este prototipo el botón «Asistente de IA» se muestra a los roles <strong>Empleado del portal</strong> y <strong>Técnico</strong>. Cambie el rol arriba (Probar como) para verlo abajo a la derecha.')}
    <div class="rejilla">
      <section class="tarjeta"><h2>Cómo probarlo</h2><ol><li>Pulse el botón <strong>Asistente de IA</strong> abajo a la derecha (junto a «Pedir ayuda» arriba, que sigue siendo la puerta normal).</li><li>Elija un ejemplo o escriba con sus palabras. El asistente pregunta una cosa por vez.</li><li>Al final verá su caso armado. <strong>No se crea hasta que pulse «Enviar a TI».</strong></li><li>Cambie a rol <strong>Técnico</strong> y abra la Mesa de ayuda para ver cómo le llega.</li></ol>${ve ? '<button type="button" class="btn primario" data-acc="asi-abrir">Abrir el asistente</button>' : ''}</section>
      <section class="tarjeta"><h2>Tres casos tipo</h2><ul>${['laptop', 'correo', 'mouse'].map((k) => `<li>${esc(GUIONES[k].titulo)}</li>`).join('')}</ul><p class="suave chica">Más: cuenta robada (llame a TI ya), proveedor de IA caído, límite de mensajes, tope de gasto, tema fuera de TI y datos de otra persona. Están en «Probar otras situaciones» dentro del panel.</p></section>
      <section class="tarjeta"><h2>Lo que ve TI</h2><p>Un caso armado con el asistente lleva la marca <strong>«Armado con el asistente»</strong>, el resumen, lo que la persona ya probó y el contexto que agrega la plataforma.</p><a class="btn" href="#/casos?origen=asistente">Ver la cola de casos armados con el asistente</a></section>
    </div>`;
  } });

  /* =====================================================================
     VISTA DEL TÉCNICO (D-108)
     ===================================================================== */
  const val = () => (APP.tmp.asiVal = APP.tmp.asiVal || {});
  ruta('caso-asistente', { id: 'PR-47', prio: 'B', fase: 'Fase 3', titulo: 'Caso armado con el asistente', acceso: 'ayuda.caso_ver', render(q) {
    const c = CASOS.find((x) => x.n === q.id && x.origen === 'asistente' && (!x.emp || x.emp === APP.empresa));
    const propio = valor('ayuda.caso_ver') === 'P';
    if (!c || (propio && c.quien !== R().ref)) return pantallaNoEncontrada('Ese caso no existe o no es suyo.');
    const t = c.tk; const dat = APP.datos[t.emp]; const eqs = equiposDe(t.quien, dat); const eq = eqs.find((e) => e.id === t.equipo);
    const p = prioTicket(t); const pg = personaDeRef(t.quien, dat);
    const imp = IMPACTOS.find((x) => x.v === t.impacto).t; const urg = URGENCIAS.find((x) => x.v === t.urgencia).t;
    const pegado = t.campos.find((x) => x.k === 'error' && x.v);
    const camposVisibles = t.campos.filter((x) => x.v && x.k !== 'error');
    const abiertos = CASOS.filter((x) => x.equipo && eq && x.equipo === eq.id && x.n !== c.n && !['Cerrado', 'Resuelto'].includes(x.est));
    const v = val()[c.n] || {};
    const tec = !propio;
    return `${cabeceraPantalla(`${c.n} · ${esc(c.asunto)}`, '<span class="id-pantalla">PR-47 · muestra de la Fase 3</span>', `<a href="#/casos?origen=asistente">Mesa de ayuda</a> › ${c.n}`)}
    <div class="fila" style="margin-bottom:16px">${chip(c.est)} ${chipCalc('Prioridad ' + PRIO[p], PRIO_FAM[p])} ${chipEtq('Armado con el asistente')} ${chipCalc(c.sla1[0] === 'Cumplido' ? 'Primera respuesta: cumplida' : 'Primera respuesta: en plazo', 'exito')}</div>
    ${tec ? aviso('info', 'Cómo leer este caso', 'Todo lo que ve aquí lo confirmó la persona o lo agregó la plataforma. No existe «la conversación» con el asistente: no se guarda.') : aviso('info', 'Este es su caso', 'Usted lo armó con el asistente y lo confirmó. TI ve lo mismo, más datos internos que usted no necesita ver.')}
    <div class="rejilla ancha">
    <div class="pila">
      <section class="tarjeta bloque-caso" aria-labelledby="b-resumen"><h2 id="b-resumen">Resumen del caso</h2><span class="rotulo-origen">${icono('asistente')} Redactado por el asistente y confirmado por la persona</span><p style="margin:0">${esc(t.resumen)}</p><p class="suave chica" style="margin:8px 0 0">Los campos de abajo son la fuente; el resumen solo ayuda a leer rápido.</p></section>
      <section class="tarjeta bloque-caso" aria-labelledby="b-campos"><h2 id="b-campos">Datos del caso</h2><span class="rotulo-origen">Lo que la persona confirmó</span><dl class="lista-datos">
        <dt>Servicio</dt><dd>${esc(t.servicio)} · ${t.tipo}</dd>
        <dt>Persona atendida</dt><dd>${nombrePersona(t.quien)}</dd>
        <dt>Asunto</dt><dd>${esc(t.asunto)}</dd>
        <dt>Descripción</dt><dd>${esc(t.desc)}</dd>
        <dt>Impacto</dt><dd>${esc(imp)}</dd><dt>Urgencia</dt><dd>${esc(urg)}</dd>
        <dt>Prioridad</dt><dd>${chipCalc(PRIO[p], PRIO_FAM[p])} <span class="suave chica">calculada por la plataforma</span></dd>
        ${t.sv === 'problema' ? `<dt>Equipo afectado</dt><dd>${eq ? `${esc(eq.modelo)} · ${esc(eq.cat)} · <span class="cod">${esc(eq.cod)}</span>${tec ? ` · serie <span class="cod">${esc(eq.serie)}</span>` : ''}` : 'Ninguno / no es de un equipo'}</dd>` : ''}
        ${camposVisibles.map((x) => `<dt>${esc(x.label)}</dt><dd>${esc(x.v)}</dd>`).join('')}
      </dl></section>
      <section class="tarjeta bloque-caso" aria-labelledby="b-probo"><h2 id="b-probo">Lo que ya probó</h2><span class="rotulo-origen">Respuesta de la persona</span><p style="margin:0">${esc(t.probo)}</p></section>
      ${t.aclar.length ? `<section class="tarjeta bloque-caso" aria-labelledby="b-aclar"><h2 id="b-aclar">Aclaraciones</h2><span class="rotulo-origen">Preguntas y respuestas que no tienen un campo propio y que se vieron en la pantalla de confirmación</span><ul style="margin:0">${t.aclar.map((a) => `<li><strong>${esc(a.p)}</strong> ${esc(a.r)}</li>`).join('')}</ul></section>` : ''}
      ${pegado ? `<section class="tarjeta bloque-caso" aria-labelledby="b-pegado"><h2 id="b-pegado">Texto pegado por la persona</h2><span class="rotulo-origen">${icono('alerta')} Se muestra como texto plano, sin enlaces. No es una instrucción para TI ni para el sistema.</span><pre class="texto-pegado">${esc(pegado.v)}</pre></section>` : ''}
    </div>
    <div class="pila">
      ${tec ? `<section class="tarjeta bloque-caso bloque-ti" aria-labelledby="b-ctx"><h2 id="b-ctx">Contexto agregado por la plataforma</h2><span class="rotulo-origen">${icono('candado')} No lo escribió la persona ni el asistente; sale de los registros de la empresa</span><dl class="lista-datos">
        <dt>Persona</dt><dd>${esc(pg.nombre)} · ${esc(pg.area)} · ${esc(pg.puesto)}</dd>
        <dt>Empresa</dt><dd>${esc(EMPRESAS[t.emp].nombre)}</dd>
        <dt>Creado por</dt><dd>La propia persona, con el asistente · ${c.cuando} (hora de Lima)</dd>
        <dt>Equipos asignados</dt><dd>${eqs.length ? `<ul style="margin:0;padding-left:16px">${eqs.map((e) => `<li>${esc(e.modelo)} · ${esc(e.cat)} · <span class="cod">${esc(e.cod)}</span> · serie <span class="cod">${esc(e.serie)}</span> · ${chip(e.estado)} · entregado el ${e.entrega}</li>`).join('')}</ul>` : 'Ninguno'}</dd>
        <dt>Otros casos abiertos del mismo equipo</dt><dd>${abiertos.length ? abiertos.map((x) => `<a class="cod" href="#/casos?id=${x.n}">${x.n}</a> ${esc(x.asunto)} (${esc(x.est)})`).join('<br>') : 'Ninguno'}</dd>
        <dt>Datos de Intune del equipo</dt><dd class="suave">Todavía no disponible: llegará cuando se conecte Microsoft Intune.</dd></dl></section>
      <section class="tarjeta bloque-caso" aria-labelledby="b-val"><h2 id="b-val">¿Este caso traía lo necesario?</h2><p class="suave chica">Un clic. Ayuda a medir si el asistente arma buenos casos.</p>
        <div class="fila"><button type="button" class="btn ${v.e === 'ok' ? 'primario' : ''}" data-acc="asi-val" data-n="${c.n}" data-v="ok" aria-pressed="${v.e === 'ok'}">${icono('check')}Tenía lo necesario</button><button type="button" class="btn ${v.e === 'falta' ? 'primario' : ''}" data-acc="asi-val" data-n="${c.n}" data-v="falta" aria-pressed="${v.e === 'falta'}">${icono('alerta')}Faltó información</button></div>
        ${v.e === 'falta' ? `<fieldset style="margin-top:12px"><legend>¿Qué faltó?</legend>${['Desde cuándo', 'Equipo', 'Mensaje de error', 'Lo que ya probó', 'Impacto o urgencia', 'Otro'].map((x, i) => `<div class="opcion"><input type="checkbox" id="val-${i}" ${(v.c || []).includes(x) ? 'checked' : ''} data-cambio="asi-val-campo" data-n="${c.n}" data-x="${x}"><label for="val-${i}">${x}</label></div>`).join('')}<button type="button" class="btn chico" data-acc="asi-val-guardar" data-n="${c.n}">Guardar valoración</button></fieldset>` : ''}
        ${v.e === 'ok' ? '<p class="suave chica" style="margin-top:8px">Gracias. Valoración registrada.</p>' : ''}${v.e === 'falta' && v.g ? '<p class="suave chica" style="margin-top:8px">Gracias. Valoración registrada.</p>' : ''}</section>
      <section class="tarjeta bloque-caso"><h2>Acciones</h2><div class="pila">${btnAcc({ texto: 'Pedir información a la persona', icono: 'campana', acc: 'asi-espera', datos: { n: c.n }, perm: 'ayuda.caso_ver_interno' })}<p class="suave chica sin-margen">Pasa el caso a «En espera de la persona atendida» con el motivo «Falta información», que alimenta la medida de calidad del asistente.</p></div></section>` : `<section class="tarjeta bloque-caso"><h2>Qué sigue</h2><p>TI revisará su caso y le avisará si necesita algo más. Los datos internos del equipo de TI no se muestran en su vista.</p></section>`}
    </div></div>`;
  } });
  ACC['asi-val'] = (el) => { const n = el.dataset.n; val()[n] = Object.assign(val()[n] || {}, { e: el.dataset.v, g: false }); render(true); };
  CAMBIO['asi-val-campo'] = (el) => { const v = val()[el.dataset.n]; v.c = v.c || []; const x = el.dataset.x; if (el.checked) { if (!v.c.includes(x)) v.c.push(x); } else v.c = v.c.filter((y) => y !== x); };
  ACC['asi-val-guardar'] = (el) => { const v = val()[el.dataset.n]; v.g = true; toast('Valoración guardada (simulado). Queda como medida de calidad del asistente.'); render(true); };
  ACC['asi-espera'] = (el) => dialogoMotivo({
    titulo: 'Pasar a «En espera de la persona atendida»', verbo: 'Pasar a espera', motivos: ['Falta información'], etiqueta: 'Qué necesita saber de la persona',
    consecuencias: ['El reloj de los plazos se detiene mientras se espera a la persona.', 'El motivo «Falta información» queda registrado para medir la calidad del asistente.'],
    alConfirmar: () => { const c = CASOS.find((x) => x.n === el.dataset.n); if (c) c.est = 'En espera'; toast('Caso en espera de la persona (simulado).'); }
  });
})();

/* Ajustes de la decisión D-068 que el registro de permisos aún no recoge (el Analista lo actualiza):
   16 permisos pasan a ser sensibles (segunda verificación obligatoria) y se crean PS-232 y PS-233.
   Cuando el registro se actualice, este archivo se puede borrar. */
(function () {
  const SENSIBLES_D068 = ['ordenes_compra.aprobar', 'ordenes_servicio.aprobar', 'contratos.activar', 'presupuesto.aprobar', 'cambios.aprobar', 'cambios.aprobar_alto',
    'lineas.confirmar_costo', 'dominios.confirmar_costo', 'garantias.confirmar_costo', 'presupuesto.gasto_registrar', 'presupuesto.gasto_anular', 'presupuesto.reclasificar',
    'recepciones.revertir', 'integraciones.administrar_webhooks', 'ayuda.encuesta_ver_detalle'];
  PERMISOS.forEach((p) => { if (SENSIBLES_D068.includes(p.n)) { p.s = true; p.d068 = true; } });
  const v = (a) => ({ adm: a, jef: '-', tec: '-', alm: '-', sol: '-', sl: '-', emp: '-', plat: '-' });
  PERMISOS.push({ ps: 'PS-232', n: 'empresa.configurar_aprobacion', q: 'Cambiar el monto límite de aprobación, la moneda base y activar o desactivar la aprobación (cada cambio avisa por correo a todos los administradores)', s: true, d068: true, a: 'todo', c: '2F R A', w: 'v1 E5', v: v('T') });
  PERMISOS.push({ ps: 'PS-233', n: 'plataforma.ver_conteos_seguridad', q: 'Ver solo conteos de eventos de seguridad por empresa (sin correos ni direcciones)', s: false, a: 'todo', c: '', w: 'v1 E1', v: Object.assign(v('-'), { plat: 'T' }) });
})();

/* =========================================================================
   DATOS DE EJEMPLO (todo inventado; ningún dato real).
   Dos empresas de ejemplo para mostrar que cada una ve solo lo suyo.
   "Hoy" del prototipo: 25/10/2026.
   ========================================================================= */
const HOY = new Date(2026, 9, 25);

const ROLES = {
  adm:  { clave: 'adm',  nombre: 'Administrador',            persona: 'Lucía Paredes',  ref: 'PRS-0001', col: 'adm' },
  jef:  { clave: 'jef',  nombre: 'Jefatura TI',              persona: 'Carlos Díaz',    ref: 'PRS-0002', col: 'jef' },
  tec:  { clave: 'tec',  nombre: 'Técnico',                  persona: 'Marta Quispe',   ref: 'PRS-0003', col: 'tec' },
  alm:  { clave: 'alm',  nombre: 'Almacén',                  persona: 'Julián Rojas',   ref: 'PRS-0004', col: 'alm' },
  sol:  { clave: 'sol',  nombre: 'Solicitante',              persona: 'Ana Vega',       ref: 'PRS-0005', col: 'sol' },
  sl:   { clave: 'sl',   nombre: 'Solo lectura',             persona: 'Elena Ríos',     ref: 'PRS-0006', col: 'sl' },
  emp:  { clave: 'emp',  nombre: 'Empleado del portal',      persona: 'Pablo Soto',     ref: 'PRS-0007', col: 'emp' },
  plat: { clave: 'plat', nombre: 'Administrador de plataforma', persona: 'Equipo de plataforma', ref: '', col: 'plat' }
};
const ORDEN_ROLES = ['adm', 'jef', 'tec', 'alm', 'sol', 'sl', 'emp', 'plat'];

const EMPRESAS = {
  e1: { id: 'e1', nombre: 'Distribuidora Andina S.A.', corto: 'Andina', moneda: 'PEN', pais: 'Perú', zona: 'América/Lima', limite: 5000, nueva: false },
  e2: { id: 'e2', nombre: 'Clínica Santa Aurora', corto: 'Santa Aurora', moneda: 'USD', pais: 'Perú', zona: 'América/Lima', limite: 2000, nueva: true }
};

/* Familia de color de cada estado (siete familias; ver Guía visual) */
const FAMILIA = {
  neutro: ['Borrador', 'Creada', 'Nuevo', 'Registrado', 'Registrada', 'Programado', 'Por iniciar', 'Invitado', 'Sin iniciar'],
  curso: ['Asignado', 'Asignada', 'Emitida', 'En ejecución', 'En atención', 'Recibida parcial', 'Abierto', 'En curso'],
  atencion: ['Pendiente de aprobación', 'En espera', 'En reparación', 'Suspendido', 'Suspendida', 'Por vencer', 'En riesgo', 'Excedente', 'Sin verificar', 'Pendiente de firma', 'Pendiente de devolución', 'Cesada', 'Pendiente de completar', 'Borrador guardado'],
  exito: ['Aprobada', 'Vigente', 'En stock', 'Resuelto', 'Realizado', 'En regla', 'Cumplido', 'Activo', 'Activa', 'Entregada', 'Recibida total', 'Completado', 'Firmada en papel', 'Publicado', 'Disponible', 'Hecho'],
  alerta: ['Rechazada', 'Vencido', 'Atrasado', 'Déficit', 'Fallido', 'Extraviado o robado', 'Revocada', 'Firma rechazada', 'Con errores'],
  final: ['Cerrada', 'Cerrado', 'Anulada', 'Cancelada', 'De baja', 'Terminado', 'Inactivo', 'Archivado', 'Dado de baja', 'Anonimizada'],
  sensible: ['Sensible', 'Excepción activa', 'Modo soporte']
};

function _crear() {
  const d = {};

  /* ======================= EMPRESA 1: Andina ======================= */
  const e1 = {};
  e1.ubicaciones = ['Lima > Bodega Central', 'Lima > Piso 3 > Sala TI', 'Lima > Piso 2 > Ventas', 'Lima > Piso 1 > Recepción', 'Arequipa > Almacén sucursal'];
  e1.centros = ['Soporte TI', 'Ventas', 'Administración', 'Logística'];
  e1.personas = [
    { ref: 'PRS-0001', nombre: 'Lucía Paredes', tipo: 'Empleado', area: 'Tecnología', puesto: 'Gerente de sistemas', estado: 'Activa', vinculo: 'Administrador', correo: 'lucia.paredes@ejemplo.pe', ingreso: '03/02/2019' },
    { ref: 'PRS-0002', nombre: 'Carlos Díaz', tipo: 'Empleado', area: 'Tecnología', puesto: 'Jefe de TI', estado: 'Activa', vinculo: 'Jefatura TI', correo: 'carlos.diaz@ejemplo.pe', ingreso: '15/06/2018' },
    { ref: 'PRS-0003', nombre: 'Marta Quispe', tipo: 'Empleado', area: 'Tecnología', puesto: 'Técnico de soporte', estado: 'Activa', vinculo: 'Técnico', correo: 'marta.quispe@ejemplo.pe', ingreso: '10/01/2021' },
    { ref: 'PRS-0004', nombre: 'Julián Rojas', tipo: 'Empleado', area: 'Logística', puesto: 'Almacenero', estado: 'Activa', vinculo: 'Almacén', correo: 'julian.rojas@ejemplo.pe', ingreso: '22/08/2020' },
    { ref: 'PRS-0005', nombre: 'Ana Vega', tipo: 'Empleado', area: 'Ventas', puesto: 'Coordinadora comercial', estado: 'Activa', vinculo: 'Solicitante', correo: 'ana.vega@ejemplo.pe', ingreso: '05/05/2022' },
    { ref: 'PRS-0006', nombre: 'Elena Ríos', tipo: 'Empleado', area: 'Administración', puesto: 'Analista contable', estado: 'Activa', vinculo: 'Solo lectura', correo: 'elena.rios@ejemplo.pe', ingreso: '12/09/2022' },
    { ref: 'PRS-0007', nombre: 'Pablo Soto', tipo: 'Empleado', area: 'Ventas', puesto: 'Vendedor', estado: 'Activa', vinculo: 'Empleado (portal)', correo: 'pablo.soto@ejemplo.pe', ingreso: '01/03/2023' },
    { ref: 'PRS-0008', nombre: 'Rosa Medina', tipo: 'Empleado', area: 'Tecnología', puesto: 'Técnico de soporte', estado: 'Activa', vinculo: 'Técnico', correo: 'rosa.medina@ejemplo.pe', ingreso: '18/07/2021' },
    { ref: 'PRS-0009', nombre: 'Tomás Herrera', tipo: 'Empleado', area: 'Ventas', puesto: 'Vendedor', estado: 'Activa', vinculo: '', correo: 'tomas.herrera@ejemplo.pe', ingreso: '09/11/2022' },
    { ref: 'PRS-0010', nombre: 'Gabriela Núñez', tipo: 'Empleado', area: 'Administración', puesto: 'Asistente', estado: 'Activa', vinculo: '', correo: '', ingreso: '14/02/2024' },
    { ref: 'PRS-0011', nombre: 'Diego Salazar', tipo: 'Empleado', area: 'Logística', puesto: 'Chofer', estado: 'Activa', vinculo: '', correo: '', ingreso: '30/06/2020' },
    { ref: 'PRS-0012', nombre: 'Valeria Campos', tipo: 'Empleado', area: 'Ventas', puesto: 'Vendedora', estado: 'Cesada', vinculo: '', correo: 'valeria.campos@ejemplo.pe', ingreso: '07/04/2021', cese: '30/09/2026' },
    { ref: 'PRS-0013', nombre: 'Hugo Palacios', tipo: 'Externo', area: 'Tecnología', puesto: 'Consultor externo', estado: 'Activa', vinculo: '', correo: 'hugo.palacios@proveedor.example', ingreso: '01/08/2026' },
    { ref: 'PRS-0014', nombre: 'Beatriz Ortega', tipo: 'Custodio', area: 'Administración', puesto: 'Responsable de sala de reuniones', estado: 'Activa', vinculo: '', correo: '', ingreso: '11/11/2019' }
  ];
  e1.categorias = [
    { prefijo: 'LAP', nombre: 'Laptops', subs: [], campos: [
      { n: 'RAM', t: 'Lista', ap: 'Artículo', ob: true, op: '8 GB · 16 GB · 32 GB' },
      { n: 'Procesador', t: 'Texto', ap: 'Artículo', ob: true },
      { n: 'Disco', t: 'Lista', ap: 'Artículo', ob: true, op: '256 GB SSD · 512 GB SSD · 1 TB SSD' } ] },
    { prefijo: 'CEL', nombre: 'Celulares', subs: [], campos: [
      { n: 'Pantalla', t: 'Texto', ap: 'Artículo', ob: false },
      { n: 'IMEI', t: 'Texto', ap: 'Cada unidad', ob: true },
      { n: 'Número de línea', t: 'Texto', ap: 'Cada unidad', ob: false, modulo: 'Líneas móviles' } ] },
    { prefijo: 'PER', nombre: 'Periféricos', subs: ['Mouse', 'Teclado', 'Cables'], campos: [
      { n: 'Conector', t: 'Lista', ap: 'Artículo', ob: false, op: 'USB · USB-C · HDMI · RJ45 · Inalámbrico' } ] },
    { prefijo: 'LIC', nombre: 'Licencias', subs: [], campos: [
      { n: 'Número de puestos', t: 'Número', ap: 'Cada unidad', ob: true },
      { n: 'Clave de licencia', t: 'Secreto', ap: 'Cada unidad', ob: true },
      { n: 'Fecha de vencimiento', t: 'Fecha', ap: 'Cada unidad', ob: true } ] }
  ];
  e1.skus = [
    { cod: 'LAP-0001', nombre: 'Laptop Dell Latitude 5440 i7/16GB', cat: 'Laptops', marca: 'Dell', modelo: 'Latitude 5440', control: 'serie', unidad: 'Pieza', activo: true, campos: { RAM: '16 GB', Procesador: 'Intel Core i7-1355U', Disco: '512 GB SSD' }, min: 0 },
    { cod: 'LAP-0002', nombre: 'Laptop Lenovo ThinkPad E14 Ryzen 5/8GB', cat: 'Laptops', marca: 'Lenovo', modelo: 'ThinkPad E14', control: 'serie', unidad: 'Pieza', activo: true, campos: { RAM: '8 GB', Procesador: 'AMD Ryzen 5 7530U', Disco: '256 GB SSD' }, min: 0 },
    { cod: 'LAP-0003', nombre: 'Laptop HP ProBook 450 G8 i5/8GB', cat: 'Laptops', marca: 'HP', modelo: 'ProBook 450 G8', control: 'serie', unidad: 'Pieza', activo: false, campos: { RAM: '8 GB', Procesador: 'Intel Core i5-1135G7', Disco: '256 GB SSD' }, min: 0 },
    { cod: 'CEL-0001', nombre: 'Celular Samsung Galaxy A14 128 GB', cat: 'Celulares', marca: 'Samsung', modelo: 'Galaxy A14', control: 'serie', unidad: 'Pieza', activo: true, campos: { Pantalla: '6,6 pulgadas' }, min: 0 },
    { cod: 'PER-0001', nombre: 'Mouse inalámbrico Logitech M170', cat: 'Periféricos > Mouse', marca: 'Logitech', modelo: 'M170', control: 'cantidad', unidad: 'Pieza', activo: true, campos: { Conector: 'Inalámbrico' }, min: 80 },
    { cod: 'PER-0002', nombre: 'Teclado USB Genius KB-110', cat: 'Periféricos > Teclado', marca: 'Genius', modelo: 'KB-110', control: 'cantidad', unidad: 'Pieza', activo: true, campos: { Conector: 'USB' }, min: 15 },
    { cod: 'PER-0003', nombre: 'Cable de red UTP Cat6', cat: 'Periféricos > Cables', marca: 'Nexxt', modelo: 'Cat6 UTP', control: 'cantidad', unidad: 'Metro (admite decimales)', activo: true, campos: { Conector: 'RJ45' }, min: 100 },
    { cod: 'LIC-0001', nombre: 'Microsoft 365 Business Standard (clave)', cat: 'Licencias', marca: 'Microsoft', modelo: 'Business Standard', control: 'serie', unidad: 'Clave', activo: true, campos: {}, min: 0 }
  ];
  e1.stock = [
    { sku: 'PER-0001', ubic: 'Lima > Bodega Central', saldo: 64 }, { sku: 'PER-0001', ubic: 'Lima > Piso 3 > Sala TI', saldo: 8 },
    { sku: 'PER-0002', ubic: 'Lima > Bodega Central', saldo: 41 }, { sku: 'PER-0002', ubic: 'Arequipa > Almacén sucursal', saldo: 12 },
    { sku: 'PER-0003', ubic: 'Lima > Bodega Central', saldo: 320.5 }
  ];
  /* Activos con serie */
  const act = [];
  const mk = (sku, serie, estado, ubic, resp, compra, garantia, oc, costo, extra) => act.push(Object.assign({ id: 'A' + (act.length + 1), sku, serie, estado, ubic, resp, compra, garantia, oc, costo, moneda: 'PEN' }, extra || {}));
  const ub = e1.ubicaciones;
  mk('LAP-0001', '5CG3410R7M', 'Asignado', ub[2], 'PRS-0007', '15/03/2024', '14/03/2027', 'OC-000201', 4150);
  mk('LAP-0001', '5CG3412H2Q', 'En stock', ub[0], null, '15/03/2024', '14/03/2027', 'OC-000201', 4150);
  mk('LAP-0001', '5CG3419P4T', 'En reparación', ub[1], 'PRS-0009', '15/03/2024', '14/03/2027', 'OC-000201', 4150);
  mk('LAP-0001', '5CG3425Z9A', 'Asignado', ub[2], 'PRS-0012', '15/03/2024', '14/03/2027', 'OC-000201', 4150, { pendienteDev: true });
  mk('LAP-0001', '5CG3430B1C', 'Extraviado o robado', ub[2], null, '15/03/2024', '14/03/2027', 'OC-000201', 4150);
  mk('LAP-0001', '5CG3401D6E', 'De baja', ub[0], null, '10/01/2022', '09/01/2025', null, 3600);
  const nombresRespLap = ['PRS-0003', 'PRS-0008', 'PRS-0010', 'PRS-0011', 'PRS-0013', 'PRS-0014', 'PRS-0001', 'PRS-0002', 'PRS-0004', 'PRS-0005'];
  for (let i = 0; i < 10; i++) mk('LAP-0001', '5CG34' + (40 + i * 3) + 'K' + (i + 1) + 'L', 'Asignado', ub[(i % 3)], nombresRespLap[i], '15/03/2024', '14/03/2027', 'OC-000201', 4150);
  for (let i = 0; i < 8; i++) mk('LAP-0001', '5CG35' + (10 + i * 2) + 'M' + (i + 2) + 'T', 'En stock', ub[0], null, '20/08/2025', '19/08/2028', 'OC-000209', 4300);
  mk('LAP-0002', 'PF3H8K21', 'Asignado', ub[1], 'PRS-0006', '02/02/2025', '01/02/2027', null, 2950);
  mk('LAP-0002', 'PF3H8K22', 'Asignado', ub[3], 'PRS-0010', '02/02/2025', '01/02/2027', null, 2950);
  for (let i = 0; i < 4; i++) mk('LAP-0002', 'PF3H8K3' + i, 'En stock', ub[4], null, '02/02/2025', '01/02/2027', null, 2950);
  mk('LAP-0002', 'PF3H8K40', 'En reparación', ub[1], null, '02/02/2025', '01/02/2027', null, 2950);
  mk('CEL-0001', 'R58W1A2B3C4', 'Asignado', ub[2], 'PRS-0009', '11/06/2025', '10/06/2027', null, 720, { imei: '356938035643809' });
  mk('CEL-0001', 'R58W1A2B3C5', 'Asignado', ub[2], 'PRS-0011', '11/06/2025', '10/06/2027', null, 720, { imei: '356938035643817' });
  mk('CEL-0001', 'R58W1A2B3C6', 'En stock', ub[0], null, '11/06/2025', '10/06/2027', null, 720, { imei: '356938035643825' });
  mk('CEL-0001', 'R58W1A2B3C7', 'En stock', ub[0], null, '11/06/2025', '10/06/2027', null, 720, { imei: '' });
  mk('CEL-0001', 'R58W1A2B3C8', 'Extraviado o robado', ub[2], null, '11/06/2025', '10/06/2027', null, 720, { imei: '356938035643841' });
  mk('LIC-0001', 'M365-2026-A', 'Asignado', ub[1], 'PRS-0002', '01/12/2025', '30/11/2026', null, 3400, { clave: '••••••••-AB12' });
  e1.activos = act;
  e1.proveedores = [
    { n: 'Tecnosur Perú S.A.C.', ruc: '20100000011', tipo: 'Bienes y servicios', estado: 'Activo' },
    { n: 'Dell Perú S.A.C.', ruc: '20100000022', tipo: 'Bienes', estado: 'Activo' },
    { n: 'Distribuidora Teclas S.A.', ruc: '20100000033', tipo: 'Bienes', estado: 'Activo' },
    { n: 'Cable Norte Importaciones', ruc: '20100000044', tipo: 'Bienes', estado: 'Inactivo' },
    { n: 'Servicio Técnico Ágil E.I.R.L.', ruc: '20100000055', tipo: 'Servicios', estado: 'Activo' }
  ];
  e1.ordenes = [
    { num: 'OC-000201', est: 'Cerrada', prov: 'Dell Perú S.A.C.', fecha: '12/02/2024', mon: 'PEN', creo: 'Marta Quispe', aprobo: 'Carlos Díaz', cc: 'Soporte TI', lineas: [{ sku: 'LAP-0001', cant: 20, pu: 3516.95, rec: 20 }] },
    { num: 'OC-000205', est: 'Emitida', prov: 'Tecnosur Perú S.A.C.', fecha: '08/10/2026', mon: 'PEN', creo: 'Marta Quispe', aprobo: 'Carlos Díaz', cc: 'Soporte TI', lineas: [{ sku: 'LAP-0001', cant: 40, pu: 3516.95, rec: 0 }, { sku: 'CEL-0001', cant: 10, pu: 610.17, rec: 0 }, { sku: 'PER-0001', cant: 100, pu: 29.66, rec: 0 }] },
    { num: 'OC-000209', est: 'Recibida parcial', prov: 'Tecnosur Perú S.A.C.', fecha: '19/08/2025', mon: 'PEN', creo: 'Marta Quispe', aprobo: 'Carlos Díaz', cc: 'Soporte TI', lineas: [{ sku: 'LAP-0001', cant: 12, pu: 3644.07, rec: 8 }] },
    { num: 'OC-000212', est: 'Pendiente de aprobación', prov: 'Dell Perú S.A.C.', fecha: '22/10/2026', mon: 'PEN', creo: 'Marta Quispe', aprobo: '', cc: 'Soporte TI', lineas: [{ sku: 'LAP-0002', cant: 10, pu: 2542.37, rec: 0 }, { sku: 'PER-0002', cant: 30, pu: 25.42, rec: 0 }] },
    { num: 'OC-000215', est: 'Borrador', prov: '', fecha: '23/10/2026', mon: 'PEN', creo: 'Ana Vega', aprobo: '', cc: 'Ventas', solicitud: true, lineas: [{ sku: 'PER-0001', cant: 6, pu: null, rec: 0 }, { sku: 'PER-0002', cant: 6, pu: null, rec: 0 }] },
    { num: 'OC-000216', est: 'Rechazada', prov: 'Distribuidora Teclas S.A.', fecha: '15/10/2026', mon: 'PEN', creo: 'Marta Quispe', aprobo: '', cc: 'Soporte TI', motivoRechazo: 'El precio unitario está por encima de la cotización vigente. Pida una cotización nueva.', lineas: [{ sku: 'PER-0002', cant: 80, pu: 38.1, rec: 0 }] },
    { num: 'OC-000217', est: 'Aprobada', prov: 'Tecnosur Perú S.A.C.', fecha: '20/10/2026', mon: 'PEN', creo: 'Marta Quispe', aprobo: 'Carlos Díaz', cc: 'Soporte TI', lineas: [{ sku: 'PER-0003', cant: 500, pu: 1.42, rec: 0 }] },
    { num: 'OC-000218', est: 'Pendiente de aprobación', prov: 'Dell Perú S.A.C.', fecha: '24/10/2026', mon: 'USD', creo: 'Lucía Paredes', aprobo: '', cc: 'Soporte TI', lineas: [{ sku: 'LAP-0001', cant: 2, pu: 1100, rec: 0 }] },
    { num: 'OC-000219', est: 'Anulada', prov: 'Cable Norte Importaciones', fecha: '02/09/2026', mon: 'PEN', creo: 'Marta Quispe', aprobo: 'Carlos Díaz', cc: 'Logística', motivoAnula: 'El proveedor ya no tiene el producto.', lineas: [{ sku: 'PER-0003', cant: 300, pu: 1.5, rec: 0 }] }
  ];
  e1.usuarios = [
    { nombre: 'Lucía Paredes', correo: 'lucia.paredes@ejemplo.pe', rol: 'Administrador', estado: 'Activo', ultimo: '25/10/2026 08:12', dosF: true, ultimoAdmin: true },
    { nombre: 'Carlos Díaz', correo: 'carlos.diaz@ejemplo.pe', rol: 'Jefatura TI', estado: 'Activo', ultimo: '25/10/2026 08:40', dosF: true },
    { nombre: 'Marta Quispe', correo: 'marta.quispe@ejemplo.pe', rol: 'Técnico', estado: 'Activo', ultimo: '25/10/2026 09:03', dosF: false },
    { nombre: 'Julián Rojas', correo: 'julian.rojas@ejemplo.pe', rol: 'Almacén', estado: 'Activo', ultimo: '24/10/2026 17:45', dosF: false },
    { nombre: 'Ana Vega', correo: 'ana.vega@ejemplo.pe', rol: 'Solicitante', estado: 'Activo', ultimo: '23/10/2026 11:20', dosF: false },
    { nombre: 'Elena Ríos', correo: 'elena.rios@ejemplo.pe', rol: 'Solo lectura', estado: 'Invitado', ultimo: 'Aún no ha ingresado', dosF: false },
    { nombre: 'Rosa Medina', correo: 'rosa.medina@ejemplo.pe', rol: 'Técnico', estado: 'Suspendido', ultimo: '02/10/2026 10:05', dosF: false },
    { nombre: 'Hugo Palacios', correo: 'hugo.palacios@proveedor.example', rol: 'Solo lectura', estado: 'Dado de baja', ultimo: '15/09/2026 16:30', dosF: false }
  ];
  e1.auditoria = [
    { f: '25/10/2026 09:03', quien: 'Marta Quispe', tipo: 'Usuario', mod: 'Órdenes de compra', acc: 'Creó la orden', obj: 'OC-000212', antes: '—', despues: 'Estado: Borrador', motivo: '' },
    { f: '25/10/2026 09:05', quien: 'Marta Quispe', tipo: 'Usuario', mod: 'Órdenes de compra', acc: 'Envió a aprobación', obj: 'OC-000212', antes: 'Estado: Borrador', despues: 'Estado: Pendiente de aprobación', motivo: '' },
    { f: '24/10/2026 18:10', quien: 'Lucía Paredes', tipo: 'Usuario', mod: 'Órdenes de compra', acc: 'Creó la orden', obj: 'OC-000218', antes: '—', despues: 'Estado: Pendiente de aprobación (moneda distinta de la base)', motivo: '' },
    { f: '24/10/2026 11:32', quien: 'Julián Rojas', tipo: 'Usuario', mod: 'Inventario', acc: 'Corrigió una serie', obj: 'Activo A12', antes: 'Serie: 5CG3441K1', despues: 'Serie: 5CG3441K1L', motivo: 'Faltaba la última letra al digitar' },
    { f: '23/10/2026 16:02', quien: 'Marta Quispe', tipo: 'Usuario', mod: 'Inventario', acc: 'Entregó un equipo', obj: 'ACT-E-000123', antes: 'Estado: En stock', despues: 'Estado: Asignado a PRS-0009', motivo: '' },
    { f: '23/10/2026 08:00', quien: 'Sistema', tipo: 'Sistema', mod: 'Garantías', acc: 'Calculó vencimientos del día', obj: 'Proceso diario', antes: '—', despues: '3 garantías por vencer', motivo: '' },
    { f: '22/10/2026 14:45', quien: 'Carlos Díaz', tipo: 'Usuario', mod: 'Órdenes de compra', acc: 'Aprobó la orden', obj: 'OC-000217', antes: 'Estado: Pendiente de aprobación', despues: 'Estado: Aprobada (monto S/ 837,80)', motivo: '' },
    { f: '22/10/2026 10:21', quien: 'Carlos Díaz', tipo: 'Usuario', mod: 'Órdenes de compra', acc: 'Rechazó la orden', obj: 'OC-000216', antes: 'Estado: Pendiente de aprobación', despues: 'Estado: Rechazada', motivo: 'El precio unitario está por encima de la cotización vigente.' },
    { f: '21/10/2026 17:30', quien: 'Lucía Paredes', tipo: 'Usuario', mod: 'Usuarios', acc: 'Suspendió a un usuario', obj: 'Rosa Medina', antes: 'Estado: Activo', despues: 'Estado: Suspendido', motivo: 'Licencia médica prolongada' },
    { f: '20/10/2026 09:15', quien: 'Lucía Paredes', tipo: 'Usuario', mod: 'Roles', acc: 'Cambió permisos de un rol', obj: 'Rol Almacén', antes: 'Corregir serie: No', despues: 'Corregir serie: Sí', motivo: 'Acuerdo con Jefatura TI' },
    { f: '19/10/2026 12:00', quien: 'Integración "Planillas"', tipo: 'Integración', mod: 'Personas', acc: 'Creó una Persona', obj: 'PRS-0013', antes: '—', despues: 'Persona Activa (Externo)', motivo: '' },
    { f: '18/10/2026 08:41', quien: 'Lucía Paredes', tipo: 'Usuario', mod: 'Acceso', acc: 'Cambió de empresa activa', obj: 'Sesión', antes: 'Clínica Santa Aurora', despues: 'Distribuidora Andina S.A.', motivo: '' },
    { f: '17/10/2026 15:05', quien: 'Marta Quispe', tipo: 'Usuario', mod: 'Inventario', acc: 'Pasó a En reparación', obj: '5CG3419P4T', antes: 'Estado: Asignado', despues: 'Estado: En reparación', motivo: 'Pantalla con rayas' }
  ];
  e1.ordenesServicio = [
    { num: 'OS-000041', tipo: 'Reparación', est: 'En ejecución', activo: '5CG3419P4T', pidio: 'Tomás Herrera', asigna: 'Marta Quispe', fecha: '17/10/2026', costo: 0, desc: 'La pantalla muestra rayas verticales.' },
    { num: 'OS-000042', tipo: 'Instalación', est: 'Asignada', activo: '5CG3412H2Q', pidio: 'Ana Vega', asigna: 'Rosa Medina', fecha: '20/10/2026', costo: 0, desc: 'Instalar el programa de diseño para la nueva coordinadora.' },
    { num: 'OS-000043', tipo: 'Servicio externo', est: 'Creada', activo: 'PF3H8K40', pidio: 'Elena Ríos', asigna: '', fecha: '23/10/2026', costo: 850, desc: 'Cambio de bisagra en el servicio técnico autorizado.' },
    { num: 'OS-000040', tipo: 'Reparación', est: 'Cerrada', activo: 'R58W1A2B3C4', pidio: 'Tomás Herrera', asigna: 'Marta Quispe', fecha: '02/10/2026', costo: 0, desc: 'El celular no cargaba. Se cambió el cable.' },
    { num: 'OS-000039', tipo: 'Reparación', est: 'Cancelada', activo: '5CG3410R7M', pidio: 'Pablo Soto', asigna: '', fecha: '28/09/2026', costo: 0, desc: 'El problema se resolvió reiniciando el equipo.' }
  ];
  d.e1 = e1;

  /* ======================= EMPRESA 2: Santa Aurora ======================= */
  const e2 = {};
  e2.ubicaciones = ['Sede Central > Bodega TI', 'Sede Central > Consultorios', 'Sede Norte > Recepción'];
  e2.centros = ['Sistemas'];
  e2.personas = [
    { ref: 'PRS-0001', nombre: 'Irene Valdivia', tipo: 'Empleado', area: 'Sistemas', puesto: 'Jefa de sistemas', estado: 'Activa', vinculo: 'Administrador', correo: 'irene.valdivia@ejemplo.pe', ingreso: '02/01/2020' },
    { ref: 'PRS-0002', nombre: 'Néstor Arce', tipo: 'Empleado', area: 'Sistemas', puesto: 'Técnico', estado: 'Activa', vinculo: 'Técnico', correo: 'nestor.arce@ejemplo.pe', ingreso: '15/05/2023' },
    { ref: 'PRS-0003', nombre: 'Camila Fuentes', tipo: 'Empleado', area: 'Consultorios', puesto: 'Enfermera jefe', estado: 'Activa', vinculo: '', correo: '', ingreso: '10/10/2021' },
    { ref: 'PRS-0004', nombre: 'Oscar Benítez', tipo: 'Empleado', area: 'Administración', puesto: 'Contador', estado: 'Activa', vinculo: '', correo: 'oscar.benitez@ejemplo.pe', ingreso: '08/03/2022' }
  ];
  e2.categorias = [
    { prefijo: 'LAP', nombre: 'Laptops', subs: [], campos: [{ n: 'RAM', t: 'Lista', ap: 'Artículo', ob: true, op: '8 GB · 16 GB' }] }
  ];
  e2.skus = [
    { cod: 'LAP-0001', nombre: 'Laptop HP ProBook 450 G9 i5/8GB', cat: 'Laptops', marca: 'HP', modelo: 'ProBook 450 G9', control: 'serie', unidad: 'Pieza', activo: true, campos: { RAM: '8 GB' }, min: 0 },
    { cod: 'PER-0001', nombre: 'Mouse USB óptico', cat: 'Periféricos', marca: 'Genius', modelo: 'DX-110', control: 'cantidad', unidad: 'Pieza', activo: true, campos: {}, min: 5 }
  ];
  e2.stock = [{ sku: 'PER-0001', ubic: 'Sede Central > Bodega TI', saldo: 18 }];
  const a2 = [];
  const mk2 = (serie, estado, ubic, resp) => a2.push({ id: 'B' + (a2.length + 1), sku: 'LAP-0001', serie, estado, ubic, resp, compra: '05/05/2025', garantia: '04/05/2027', oc: 'OC-000101', costo: 780, moneda: 'USD' });
  mk2('HP9-77A1', 'Asignado', e2.ubicaciones[1], 'PRS-0003');
  mk2('HP9-77A2', 'Asignado', e2.ubicaciones[0], 'PRS-0004');
  mk2('HP9-77A3', 'En stock', e2.ubicaciones[0], null);
  mk2('HP9-77A4', 'En stock', e2.ubicaciones[0], null);
  e2.activos = a2;
  e2.proveedores = [{ n: 'Compumedica S.A.', ruc: '20200000011', tipo: 'Bienes y servicios', estado: 'Activo' }];
  e2.ordenes = [
    { num: 'OC-000101', est: 'Cerrada', prov: 'Compumedica S.A.', fecha: '02/05/2025', mon: 'USD', creo: 'Néstor Arce', aprobo: 'Irene Valdivia', cc: 'Sistemas', lineas: [{ sku: 'LAP-0001', cant: 4, pu: 780, rec: 4 }] },
    { num: 'OC-000102', est: 'Borrador', prov: 'Compumedica S.A.', fecha: '20/10/2026', mon: 'USD', creo: 'Néstor Arce', aprobo: '', cc: 'Sistemas', lineas: [{ sku: 'PER-0001', cant: 20, pu: 6.5, rec: 0 }] }
  ];
  e2.usuarios = [
    { nombre: 'Irene Valdivia', correo: 'irene.valdivia@ejemplo.pe', rol: 'Administrador', estado: 'Activo', ultimo: '25/10/2026 07:50', dosF: true, ultimoAdmin: true },
    { nombre: 'Néstor Arce', correo: 'nestor.arce@ejemplo.pe', rol: 'Técnico', estado: 'Activo', ultimo: '24/10/2026 16:10', dosF: false }
  ];
  e2.auditoria = [
    { f: '20/10/2026 10:00', quien: 'Néstor Arce', tipo: 'Usuario', mod: 'Órdenes de compra', acc: 'Creó la orden', obj: 'OC-000102', antes: '—', despues: 'Estado: Borrador', motivo: '' },
    { f: '18/10/2026 08:41', quien: 'Irene Valdivia', tipo: 'Usuario', mod: 'Acceso', acc: 'Cambió de empresa activa', obj: 'Sesión', antes: 'Distribuidora Andina S.A.', despues: 'Clínica Santa Aurora', motivo: '' }
  ];
  e2.ordenesServicio = [{ num: 'OS-000007', tipo: 'Instalación', est: 'Creada', activo: 'HP9-77A3', pidio: 'Camila Fuentes', asigna: '', fecha: '22/10/2026', costo: 0, desc: 'Instalar el sistema de historias clínicas.' }];
  d.e2 = e2;
  return d;
}
const DATOS_BASE = _crear();

/* Vencimientos (muestra de la pantalla única), solo empresa 1 */
const VENCIMIENTOS = [
  { tipo: 'Garantía', que: 'Laptop 5CG3410R7M · LAP-0001', fecha: '2026-11-12', resp: 'Marta Quispe' },
  { tipo: 'Licencia', que: 'Microsoft 365 Business · CTR-000014', fecha: '2026-11-30', resp: 'Carlos Díaz' },
  { tipo: 'Dominio', que: 'andina.example.pe', fecha: '2026-12-18', resp: 'Lucía Paredes' },
  { tipo: 'Certificado', que: '*.andina.example.pe', fecha: '2026-11-04', resp: 'Lucía Paredes' },
  { tipo: 'Contrato', que: 'Soporte Dell Perú · CTR-000009', fecha: '2027-01-15', resp: 'Carlos Díaz' },
  { tipo: 'Línea móvil', que: 'Permanencia línea ••• ••• 321', fecha: '2026-10-20', resp: 'Marta Quispe' },
  { tipo: 'Garantía', que: 'Laptop PF3H8K21 · LAP-0002', fecha: '2027-02-01', resp: 'Marta Quispe' }
];

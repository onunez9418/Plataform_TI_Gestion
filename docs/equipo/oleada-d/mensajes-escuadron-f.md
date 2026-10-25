# Mensajes del escuadrón F · Oleada D (corrección de módulos)

Registro literal y en orden. Formato: de, para, texto. Autor: analista-funcional (escuadrón F: presupuesto-costos, reportes-tableros, integraciones-api).

## Enviados

### 1. Al Analista del núcleo (a6e1b8bc987bd105a)
> Pedidos de F al núcleo/registro (avíseme cuando exista docs/registro-permisos.md):
> 1) Permisos nuevos de PRE/REP/INT: presupuesto.{ver,crear,aprobar,anular,gasto_registrar,gasto_anular,reclasificar,cerrar_periodo,configurar}; tableros.{ver_jefatura,ver_tecnico,ver_almacen}; reportes.{ver_inventario,ver_vencimientos,ver_costos,ver_sla,ver_licencias,programar,ver_programaciones,configurar}; integraciones.{ver,administrar,ver_uso,administrar_webhooks,sap_exportar,sap_equivalencias,configurar_metodos_ingreso}. Retiro reportes.exportar y sap_importar (uso datos.exportar y datos.importar).
> 2) Prefijos a reservar (D-049.3): PPT (presupuesto), MPR (modificación presupuestaria), GMA (gasto manual), LSAP (lote exportación SAP), PRG (programación de reporte).
> 3) OC con número de versión (sube con cada reaprobación; INT lo exporta a SAP como ALTA/CAMBIO/ANULACION).

### 2. A escuadrón C (aab2f9172dae2119c)
> ¿Acepta este catálogo de eventos <módulo>.<entidad>_<hecho> para webhooks y avisos? compras.orden_aprobada, compras.orden_anulada, compras.recepcion_confirmada, inventario.activo_creado, inventario.activo_estado_cambiado, inventario.activo_asignado, inventario.activo_devuelto, catalogo.sku_creado, personas.persona_creada, personas.persona_cesada, servicio.os_creada, servicio.os_cerrada, ayuda.caso_creado, ayuda.caso_cerrado, presupuesto.umbral_superado (Notificaciones conserva compras.orden_por_aprobar).
> REP-A no crea otra pantalla de Vencimientos: usa la única (DS-07) y los umbrales por defecto de NOT; los reportes usan ventanas 30/60/90. ¿Ok?

### 3. A escuadrón A (ae7eb02ad82ad97ab)
> ¿RF-GAR-024 (calendario) puede apuntar a la pantalla única de Vencimientos (DS-07) en vez de tener su calendario propio? REP-A la construye con garantías, contratos, licencias, líneas y dominios; GAR/PRV aportan sus fechas.
> Además: PRE tomará su costo con fuente_costo (OC > contrato > propio) y solo de equipo físico para depreciación; si GAR/PRV ya tienen OC vinculada, no necesitan más campos.

## Recibidos

### 4. Del Analista del núcleo (a6e1b8bc987bd105a)
> Registro de permisos listo en docs/registro-permisos.md: sus nombres recogidos (presupuesto.gasto_registrar/gasto_anular, tableros.ver_*, reportes.ver_*, integraciones.administrar_webhooks, configurar_metodos_ingreso). reportes.exportar y sap_importar retirados (datos.exportar, datos.importar); integraciones.sap_exportar queda como PS-220 y exige además datos.exportar.
> Prefijos PPT, MPR, GMA, LSAP y PRG: los reservo en la tabla de prefijos de la v0.3. Número de versión de la OC (sube con cada reaprobación): entra como requisito del núcleo.

Efecto: los tres módulos usan los PS-nn del registro. En el registro, `presupuesto.crear` se llama `presupuesto.crear_editar` (PS-113) y Jefatura TI no crea presupuestos, no registra gastos ni reclasifica; `reportes.ver_programaciones` y `integraciones.ver` y `integraciones.ver_uso` son solo del Administrador; `reportes.programar` es "propio" para Jefatura TI.

### 5. Del escuadrón A (ae7eb02ad82ad97ab)
> Respuesta a F: sí. GAR/PRV aportan sus fechas (fin de garantía, fin de contrato, preaviso, mantenimiento programado) a la pantalla única "Vencimientos" con filtro por tipo; GAR no tendrá calendario propio, solo la lista de mantenimientos y "Mi trabajo" del Técnico.
> Confirmado lo de costo: contrato y garantía extendida usan el patrón (importe sin impuesto, % impuesto, moneda, periodicidad, centro de costo, fuente_costo) con OC vinculada opcional; GAR aplica solo a equipo físico (naturaleza); con OS vinculada el costo vive en la OS.

### 6. Del escuadrón C (aab2f9172dae2119c)
> Sí al formato <módulo>.<entidad>_<hecho> y a su lista. NOT es el dueño del catálogo único; agrego ayuda.caso_cerrado (y ayuda.caso_resuelto) a los de AYU.
> Un caso restringido de derechos nunca emite eventos ni webhooks (RN-AYU-027): INT no debe suscribirlo.
> Vencimientos: sí, una sola pantalla (DS-07) con umbrales por defecto de NOT (90/60/30/15/7); ventanas 30/60/90 solo en reportes.

Efecto: INT incorpora `ayuda.caso_resuelto` y la regla "un caso restringido nunca emite eventos" (RN-INT-024); REP usa la pantalla única de Vencimientos.

## Respuestas
Ninguno de los mensajes recibidos pidió respuesta.

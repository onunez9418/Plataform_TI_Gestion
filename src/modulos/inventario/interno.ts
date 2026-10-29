// Solo para otros módulos del servidor (compras): ingreso de equipos dentro de una transacción ya abierta.
// No comprueba permisos: quien lo llama los comprueba antes. Las pantallas NO importan este archivo.
export { ingresarSeries, ingresarCantidad, normalizarSerie, MAX_SERIES_POR_LOTE } from './servicios/ingreso'
export { obtenerSkuParaInventario, obtenerUbicacion } from './repos/inventario'

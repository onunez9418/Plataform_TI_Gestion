// Interfaz pública del acceso (A.6.2). El Frontend solo importa de aquí.
export type { EmpresaResumen, ResultadoCanjear, ResultadoSolicitarEnlace } from './tipos'
export { obtenerContexto } from './contexto'
export { solicitarEnlace, canjearEnlace, cerrarSesion, misEmpresas } from './servicios'

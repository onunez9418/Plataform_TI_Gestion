// Forma de lo que devuelven las acciones de formulario (A.6.2): o salió bien, o trae el error del servidor.
// Se define aquí para que los componentes de navegador no importen nada de los módulos del servidor.
export type ErrorPantallaDatos = { codigo?: string; mensaje: string; campos?: Record<string, string> }
export type ResultadoAccion<T = unknown> = { ok: true; datos: T } | { ok: false; error: ErrorPantallaDatos }

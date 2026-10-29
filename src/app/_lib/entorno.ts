// La pantalla solo necesita saber si estamos en modo local para mostrar la franja.
// (La guarda de seguridad del modo local vive en el servidor, no aquí.)
export const MODO_LOCAL = process.env.MODO_LOCAL === '1'

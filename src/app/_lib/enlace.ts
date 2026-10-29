// El servicio devuelve el enlace de ingreso local (dirección completa o solo la ficha).
// La pantalla lo convierte siempre en una ruta propia: /entrar/enlace?t=...
// Abrir esa ruta NO canjea nada; el canje ocurre por POST al pulsar el botón (A.6.3).
export function rutaDeEnlace(enlaceLocal: string): string {
  const crudo = enlaceLocal.trim()
  const m = crudo.match(/[?&](?:t|token)=([^&#\s]+)/)
  if (m) return `/entrar/enlace?t=${m[1]}`
  if (crudo.startsWith('/') || /^https?:\/\//i.test(crudo)) {
    try {
      const u = new URL(crudo, 'http://localhost')
      return u.pathname + u.search
    } catch {
      /* cae al caso de ficha */
    }
  }
  return `/entrar/enlace?t=${encodeURIComponent(crudo)}`
}

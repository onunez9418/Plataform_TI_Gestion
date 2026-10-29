// Next.js llama a register() una vez al arrancar el servidor. Aquí se comprueba la guarda de MODO_LOCAL:
// si MODO_LOCAL=1 y la base no es local o interna, la aplicación se niega a arrancar (el proceso termina).
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { verificarArranque } = await import('@/nucleo/configuracion');
    try {
      verificarArranque();
    } catch (e) {
      console.error('[arranque] ' + (e instanceof Error ? e.message : String(e)));
      process.exit(1);
    }
  }
}

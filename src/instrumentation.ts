// Next.js llama a register() una vez al arrancar el servidor. Aquí se comprueba la guarda de MODO_LOCAL:
// si MODO_LOCAL=1 y la base no es local o interna, verificarArranque() lanza y la aplicación no levanta.
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { verificarArranque } = await import('@/nucleo/configuracion');
    verificarArranque();
  }
}

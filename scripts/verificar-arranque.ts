// Comprobación de arranque que corre ANTES de migrar o levantar la aplicación:
// si MODO_LOCAL=1 y la base no es local o interna, termina con error y el contenedor no arranca.
import { verificarArranque } from '../src/nucleo/configuracion/index';

try {
  verificarArranque();
  console.log('[arranque] Guarda de MODO_LOCAL: correcta.');
} catch (e) {
  console.error('[arranque] ' + (e instanceof Error ? e.message : String(e)));
  process.exit(1);
}

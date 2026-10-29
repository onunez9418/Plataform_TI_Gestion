export * from './interruptores-legales'
export { modoLocalActivo, modoLocalSolicitado, verificarModoLocal, esAnfitrionLocalOInterno } from './modo-local'

import { verificarModoLocal } from './modo-local'

/** Se llama una vez al arrancar el servidor (la entrada del contenedor o `instrumentation`). */
export function verificarArranque(env: Readonly<Record<string, string | undefined>> = process.env): void {
  verificarModoLocal(env)
}

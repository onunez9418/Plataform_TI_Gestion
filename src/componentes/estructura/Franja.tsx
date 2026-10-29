// Franja fija en toda pantalla: deja claro que es una prueba con datos inventados.
import { Icono } from '@/componentes/ui/Icono'
import { modoLocalSolicitado } from '@/nucleo/configuracion'

export function Franja() {
  // La franja existe mientras la aplicación corre como prueba local (D-119).
  if (!modoLocalSolicitado()) return null
  return (
    <div className="franja-local" role="note" data-testid="franja-local">
      <Icono nombre="alerta" />
      <span>Versión local de prueba: solo datos inventados</span>
    </div>
  )
}

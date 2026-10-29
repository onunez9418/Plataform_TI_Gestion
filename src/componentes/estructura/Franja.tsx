// Franja fija en toda pantalla: deja claro que es una prueba con datos inventados.
import { Icono } from '@/componentes/ui/Icono'

export function Franja() {
  return (
    <div className="franja-local" role="note" data-testid="franja-local">
      <Icono nombre="alerta" />
      <span>Versión local de prueba: solo datos inventados</span>
    </div>
  )
}

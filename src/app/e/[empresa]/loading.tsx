// Estado de carga común a todas las pantallas de una empresa.
export default function Cargando() {
  return (
    <div role="status" aria-live="polite" data-testid="cargando">
      <p className="suave">Cargando…</p>
    </div>
  )
}

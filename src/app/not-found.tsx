import Link from 'next/link'
import { Aviso } from '@/componentes/ui/Piezas'

export default function NoEncontrada() {
  return (
    <main id="contenido" className="centrado" tabIndex={-1}>
      <h1>No encontramos esa página</h1>
      <Aviso tipo="info" testid="no-encontrada">
        <p className="sin-margen">La dirección no existe o ya no está disponible.</p>
      </Aviso>
      <p><Link className="btn primario" href="/">Ir al inicio</Link></p>
    </main>
  )
}

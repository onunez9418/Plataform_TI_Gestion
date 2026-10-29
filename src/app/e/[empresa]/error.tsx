'use client'
// Si algo falla de forma inesperada al armar una pantalla, se explica en claro y se ofrece reintentar.
import { Aviso } from '@/componentes/ui/Piezas'

export default function ErrorDePantalla({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <Aviso tipo="alerta" titulo="Algo salió mal al mostrar esta pantalla" testid="error-inesperado">
        <p>No se perdió nada de lo guardado. Pruebe de nuevo; si sigue igual, avise a TI.</p>
        <p className="sin-margen">
          <button type="button" className="btn" onClick={() => reset()} data-testid="reintentar">Intentar de nuevo</button>
        </p>
      </Aviso>
    </div>
  )
}

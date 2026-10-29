import Link from 'next/link'
import { FormularioEntrar } from './FormularioEntrar'

export default async function PaginaEntrar({ searchParams }: { searchParams: Promise<{ correo?: string }> }) {
  const { correo } = await searchParams
  return (
    <main id="contenido" className="centrado" tabIndex={-1}>
      <h1>Entrar</h1>
      <p className="suave">
        Escriba su correo. No hay contraseña: se le da un enlace de un solo uso para entrar.
      </p>
      <div className="tarjeta">
        <FormularioEntrar correoInicial={correo} />
      </div>
      <p style={{ marginTop: 'var(--e4)' }}>
        <Link href="/">Volver al inicio y ver los usuarios de ejemplo</Link>
      </p>
    </main>
  )
}

import Link from 'next/link'
import { Formulario } from '@/componentes/ui/Formulario'
import { Aviso } from '@/componentes/ui/Piezas'
import { canjear } from './acciones'

export default async function PaginaEnlace({ searchParams }: { searchParams: Promise<{ t?: string; token?: string }> }) {
  const parametros = await searchParams
  const token = parametros.t ?? parametros.token
  return (
    <main id="contenido" className="centrado" tabIndex={-1}>
      <h1>Confirmar ingreso</h1>
      {token ? (
        <div className="tarjeta">
          <p>Pulse el botón para entrar. El enlace sirve una sola vez y vence pronto.</p>
          <Formulario accion={canjear} enviar="Entrar" testid="form-canjear" testidEnviar="boton-entrar" limpiar={false} recargar={false}>
            <input type="hidden" name="token" value={token} />
          </Formulario>
        </div>
      ) : (
        <Aviso tipo="atencion" titulo="Este enlace está incompleto" testid="enlace-incompleto">
          <p className="sin-margen">No trae la ficha de ingreso. Pida uno nuevo.</p>
        </Aviso>
      )}
      <p style={{ marginTop: 'var(--e4)' }}>
        <Link href="/entrar">Pedir un enlace nuevo</Link>
      </p>
    </main>
  )
}

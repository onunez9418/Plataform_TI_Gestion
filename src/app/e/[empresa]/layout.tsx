// Marco de todas las pantallas de una empresa: barra, selector de empresa y menú según permisos.
// La empresa activa viene de la dirección (/e/{empresa}); el servidor decide si hay acceso.
import { redirect } from 'next/navigation'
import type { ReactNode } from 'react'
import { misEmpresas } from '@/nucleo/acceso'
import { cargarContexto } from '@/app/_lib/sesion'
import { Barra } from '@/componentes/estructura/Barra'
import { Menu } from '@/componentes/estructura/Menu'
import { VeloMenu } from '@/componentes/estructura/BotonMenuMovil'
import { Aviso } from '@/componentes/ui/Piezas'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function LayoutEmpresa({ children, params }: { children: ReactNode; params: Promise<{ empresa: string }> }) {
  const { empresa } = await params

  let empresas: { slug: string; nombre: string }[]
  try {
    empresas = await misEmpresas()
  } catch {
    redirect('/entrar')
  }

  const cargado = await cargarContexto(empresa)
  if (!cargado.ok) {
    return (
      <>
        <Barra empresas={empresas} />
        <main id="contenido" className="centrado" tabIndex={-1}>
          <h1>Sin acceso</h1>
          <Aviso tipo="atencion" titulo="No tiene acceso a esta empresa" testid="sin-acceso">
            <p>{cargado.error.mensaje}</p>
            <p className="sin-margen">Cada empresa ve solo sus datos. Elija una de las suyas.</p>
          </Aviso>
          <p>
            <Link className="btn primario" href="/empresas" data-testid="volver-empresas">Ir a mis empresas</Link>
          </p>
        </main>
      </>
    )
  }

  return (
    <>
      <Barra empresas={empresas} empresaActiva={empresa} conMenu />
      <div className="cuerpo">
        <Menu empresa={empresa} permisos={Array.from(cargado.ctx.permisos)} />
        <main id="contenido" className="principal" tabIndex={-1}>
          {children}
        </main>
      </div>
      <VeloMenu />
    </>
  )
}

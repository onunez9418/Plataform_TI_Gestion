import Link from 'next/link'
import { Icono } from '@/componentes/ui/Icono'
import { CambiarTema } from '@/componentes/ui/Tema'
import { salir } from '@/app/_lib/acciones-sesion'
import { BotonMenuMovil } from './BotonMenuMovil'
import { SelectorEmpresa } from './SelectorEmpresa'

type Empresa = { slug: string; nombre: string }

/** Barra superior. Con `empresaActiva` muestra el selector de empresa y el menú móvil. */
export function Barra({ empresas, empresaActiva, conMenu }: { empresas: Empresa[]; empresaActiva?: string; conMenu?: boolean }) {
  return (
    <header className="barra" data-testid="barra-superior">
      {conMenu ? <BotonMenuMovil /> : null}
      <Link className="marca" href="/empresas" aria-label="Plataforma de TI, ir a mis empresas">
        <Icono nombre="marca" />
        <span className="texto-marca">Plataforma de TI</span>
      </Link>
      {empresaActiva ? <SelectorEmpresa empresas={empresas} activa={empresaActiva} /> : null}
      <div className="barra-fin">
        <CambiarTema />
        <form action={salir}>
          <button type="submit" className="btn-barra" data-testid="cerrar-sesion">
            <Icono nombre="salir" />
            <span className="etq">Cerrar sesión</span>
          </button>
        </form>
      </div>
    </header>
  )
}

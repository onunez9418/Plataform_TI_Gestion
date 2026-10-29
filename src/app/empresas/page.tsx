// Selector de empresa: las empresas a las que pertenece la persona que entró.
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { misEmpresas } from '@/nucleo/acceso'
import { Barra } from '@/componentes/estructura/Barra'
import { Aviso } from '@/componentes/ui/Piezas'

export const dynamic = 'force-dynamic'

export default async function PaginaEmpresas() {
  let empresas: { slug: string; nombre: string }[]
  try {
    empresas = await misEmpresas()
  } catch {
    redirect('/entrar')
  }
  return (
    <>
      <Barra empresas={empresas} />
      <main id="contenido" className="centrado" tabIndex={-1}>
        <h1>Elija una empresa</h1>
        {empresas.length === 0 ? (
          <Aviso tipo="atencion" titulo="Su usuario no pertenece a ninguna empresa" testid="sin-empresas">
            <p className="sin-margen">Pida a un administrador que lo agregue.</p>
          </Aviso>
        ) : (
          <>
            <p className="suave">Cada empresa ve solo sus propios datos.</p>
            <ul className="pila" style={{ listStyle: 'none', padding: 0 }}>
              {empresas.map((e) => (
                <li key={e.slug}>
                  <Link className="btn primario" href={`/e/${e.slug}`} data-testid={`empresa-${e.slug}`}>
                    {e.nombre}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </main>
    </>
  )
}

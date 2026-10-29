'use client'
// Cambiar de empresa conservando la sección en la que se está (misma persona, otra empresa).
import { usePathname, useRouter } from 'next/navigation'

type Empresa = { slug: string; nombre: string }

export function SelectorEmpresa({ empresas, activa }: { empresas: Empresa[]; activa: string }) {
  const ruta = usePathname()
  const router = useRouter()
  function cambiar(nuevo: string) {
    if (nuevo === activa) return
    // Se conserva la sección: /e/alfa/inventario -> /e/beta/inventario (los detalles por id no existen en la otra empresa).
    const partes = ruta.split('/')
    const seccion = partes[3] && !partes[4] ? `/${partes[3]}` : ''
    router.push(`/e/${nuevo}${seccion}`)
  }
  return (
    <div className="empresa-activa" data-testid="empresa-activa">
      <span className="punto" aria-hidden="true" />
      <label className="oculto-visual" htmlFor="selector-empresa">Empresa activa</label>
      <select id="selector-empresa" className="empresa-sel" value={activa} onChange={(e) => cambiar(e.target.value)} data-testid="selector-empresa">
        {empresas.map((e) => (
          <option key={e.slug} value={e.slug}>{e.nombre}</option>
        ))}
      </select>
    </div>
  )
}

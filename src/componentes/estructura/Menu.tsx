import { Icono } from '@/componentes/ui/Icono'
import { EnlaceMenu } from './EnlaceMenu'
import { ENTRADAS_MENU } from './menu'

export function Menu({ empresa, permisos }: { empresa: string; permisos: readonly string[] }) {
  const tiene = new Set(permisos)
  const visibles = ENTRADAS_MENU.filter((e) => e.permisos === null || e.permisos.some((p) => tiene.has(p)))
  const grupos = Array.from(new Set(visibles.map((e) => e.grupo)))
  return (
    <nav className="menu" aria-label="Menú principal" data-testid="menu-principal">
      {grupos.map((g) => (
        <div key={g}>
          <h2>{g}</h2>
          <ul>
            {visibles.filter((e) => e.grupo === g).map((e) => (
              <li key={e.ruta}>
                <EnlaceMenu href={`/e/${empresa}${e.ruta}`} exacto={e.ruta === ''} testid={e.testid}>
                  <Icono nombre={e.icono} />
                  <span>{e.etiqueta}</span>
                </EnlaceMenu>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  )
}

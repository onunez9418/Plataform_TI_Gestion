// Panel de la empresa: accesos rápidos según lo que la persona puede hacer.
import Link from 'next/link'
import { misEmpresas } from '@/nucleo/acceso'
import { cargarContexto, puedeAlguno } from '@/app/_lib/sesion'
import { CabeceraPantalla, ErrorDePantalla } from '@/componentes/ui/Piezas'
import { ENTRADAS_MENU } from '@/componentes/estructura/menu'

export const dynamic = 'force-dynamic'

const DESCRIPCIONES: Record<string, string> = {
  '/inventario': 'Registrar equipos con sus series, asignarlos a una persona y devolverlos.',
  '/skus': 'El maestro de artículos, con código automático por categoría.',
  '/categorias': 'Categorías con sus campos propios (texto, número, fecha, lista, sí/no).',
  '/compras': 'Órdenes de compra, aprobación por otra persona y recepción.',
  '/catalogos/ubicaciones': 'Dónde se guardan los equipos.',
  '/catalogos/proveedores': 'A quién se le compra.',
  '/catalogos/personas': 'Quién recibe los equipos.',
  '/usuarios': 'Quién entra a esta empresa y con qué rol.',
  '/roles': 'Qué puede hacer cada rol.',
  '/auditoria': 'Qué se hizo, quién lo hizo y cuándo.',
}

export default async function Panel({ params }: { params: Promise<{ empresa: string }> }) {
  const { empresa } = await params
  const c = await cargarContexto(empresa)
  if (!c.ok) return <ErrorDePantalla mensaje={c.error.mensaje} codigo={c.error.codigo} />
  const nombreEmpresa = (await misEmpresas().catch(() => [])).find((e) => e.slug === empresa)?.nombre ?? empresa
  const accesos = ENTRADAS_MENU.filter((e) => e.ruta !== '' && e.permisos && puedeAlguno(c.ctx, e.permisos))

  return (
    <>
      <CabeceraPantalla titulo="Panel" descripcion={`Empresa activa: ${nombreEmpresa}${nombreEmpresa.endsWith('.') ? '' : '.'} Elija por dónde empezar.`} />
      {accesos.length === 0 ? (
        <p className="suave" data-testid="panel-sin-accesos">Su rol no tiene secciones disponibles. Pida a un administrador que se las asigne.</p>
      ) : (
        <div className="rejilla" data-testid="panel-accesos">
          {accesos.map((a) => (
            <div className="tarjeta" key={a.ruta}>
              <h2>{a.etiqueta}</h2>
              <p className="suave">{DESCRIPCIONES[a.ruta] ?? ''}</p>
              <Link className="btn primario" href={`/e/${empresa}${a.ruta}`} data-testid={`panel-${a.testid}`}>Abrir</Link>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

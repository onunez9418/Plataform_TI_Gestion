'use client'
// Preparar una orden de compra: proveedor y líneas (artículo, cantidad, precio). El total se calcula al instante.
import { useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

type Props = {
  empresa: string
  proveedores: { id: string; nombre: string }[]
  skus: { id: string; codigo: string; nombre: string }[]
  accion: (datos: FormData) => Promise<ResultadoAccion<{ id: string }>>
}

type Linea = { uid: number; skuId: string; cantidad: string; precio: string }

function aNumero(t: string): number {
  const n = Number(t.replace(',', '.'))
  return Number.isFinite(n) ? n : NaN
}

export function FormularioOrden({ empresa, proveedores, skus, accion }: Props) {
  const router = useRouter()
  const siguiente = useRef(1)
  const nueva = (): Linea => ({ uid: siguiente.current++, skuId: '', cantidad: '', precio: '' })
  const [lineas, setLineas] = useState<Linea[]>(() => [nueva()])

  function cambiar(uid: number, parte: Partial<Linea>) {
    setLineas((previas) => previas.map((l) => (l.uid === uid ? { ...l, ...parte } : l)))
  }
  const total = lineas.reduce((suma, l) => {
    const c = aNumero(l.cantidad)
    const p = aNumero(l.precio)
    return Number.isFinite(c) && Number.isFinite(p) ? suma + c * p : suma
  }, 0)
  const lineasParaEnviar = lineas
    .filter((l) => l.skuId !== '' || l.cantidad !== '' || l.precio !== '')
    .map((l) => ({ skuId: l.skuId, cantidad: aNumero(l.cantidad), precioUnitario: aNumero(l.precio) }))

  return (
    <Formulario
      accion={accion}
      enviar="Guardar como borrador"
      testid="form-orden"
      limpiar={false}
      alExito={(d) => {
        const id = (d as { id?: string } | undefined)?.id
        if (id) router.push(`/e/${empresa}/compras/${id}`)
      }}
    >
      <Campo
        nombre="proveedorId"
        etiqueta="Proveedor"
        tipo="select"
        requerido
        vacio="Elija un proveedor"
        opciones={proveedores.map((p) => ({ valor: p.id, etiqueta: p.nombre }))}
        testid="campo-proveedor"
      />
      <fieldset>
        <legend>Qué se compra</legend>
        {lineas.map((l, i) => (
          <div className="tarjeta" key={l.uid} style={{ marginBottom: 'var(--e3)' }} data-testid={`linea-${i}`}>
            <div className="fila-form">
              <Campo
                nombre={`linea_${l.uid}_sku`}
                etiqueta="Artículo"
                tipo="select"
                requerido
                vacio="Elija un artículo"
                opciones={skus.map((s) => ({ valor: s.id, etiqueta: `${s.codigo} · ${s.nombre}` }))}
                testid={`linea-${i}-sku`}
                alCambiar={(v) => cambiar(l.uid, { skuId: v })}
              />
              <Campo nombre={`linea_${l.uid}_cantidad`} etiqueta="Cantidad" tipo="number" paso="1" requerido testid={`linea-${i}-cantidad`} alCambiar={(v) => cambiar(l.uid, { cantidad: v })} />
              <Campo nombre={`linea_${l.uid}_precio`} etiqueta="Precio por unidad" tipo="number" paso="0.01" requerido testid={`linea-${i}-precio`} alCambiar={(v) => cambiar(l.uid, { precio: v })} />
            </div>
            {lineas.length > 1 ? (
              <button type="button" className="btn chico peligro-suave" onClick={() => setLineas((p) => p.filter((x) => x.uid !== l.uid))} data-testid={`linea-${i}-quitar`}>
                Quitar esta línea
              </button>
            ) : null}
          </div>
        ))}
        <button type="button" className="btn chico" onClick={() => setLineas((p) => [...p, nueva()])} data-testid="agregar-linea">
          Agregar otra línea
        </button>
        <p className="contador-grande" data-testid="total-orden" style={{ marginTop: 'var(--e3)' }}>
          Total: {new Intl.NumberFormat('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(total)}
        </p>
      </fieldset>
      <input type="hidden" name="lineas" value={JSON.stringify(lineasParaEnviar)} />
    </Formulario>
  )
}

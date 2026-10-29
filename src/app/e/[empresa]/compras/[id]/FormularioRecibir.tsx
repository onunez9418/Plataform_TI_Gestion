'use client'
// Recibir mercadería (parcial o total): dónde queda, cuánto llegó de cada línea y, si el artículo es por serie,
// las series (se pegan en bloque y se revisan fila por fila). El servidor decide si se acepta.
import { useState } from 'react'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import { CapturaSeries } from '@/componentes/ui/CapturaSeries'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

export type LineaPendiente = { id: string; skuCodigo: string; skuNombre: string; control: 'serie' | 'cantidad'; pendiente: number }

type Props = {
  lineas: LineaPendiente[]
  ubicaciones: { id: string; nombre: string }[]
  accion: (datos: FormData) => Promise<ResultadoAccion<unknown>>
}

export function FormularioRecibir({ lineas, ubicaciones, accion }: Props) {
  const [cantidades, setCantidades] = useState<Record<string, string>>({})
  const [hecho, setHecho] = useState(false)
  const [version, setVersion] = useState(0)

  return (
    <Formulario
      key={version}
      accion={accion}
      enviar="Confirmar la recepción"
      testid="form-recibir"
      alExito={() => {
        setHecho(true)
        setCantidades({})
        setVersion((v) => v + 1)
      }}
    >
      {hecho ? <div className="aviso exito" role="status" data-testid="recepcion-ok"><div className="cuerpo-aviso">Recepción registrada. Los equipos ya aparecen en el inventario.</div></div> : null}
      <Campo
        nombre="ubicacionId"
        etiqueta="Dónde queda lo que llegó"
        tipo="select"
        requerido
        vacio="Elija la ubicación"
        opciones={ubicaciones.map((u) => ({ valor: u.id, etiqueta: u.nombre }))}
        testid="campo-ubicacion"
      />
      {lineas.map((l) => {
        const cantidad = Number(cantidades[l.id] ?? '')
        const pideSeries = l.control === 'serie' && Number.isInteger(cantidad) && cantidad > 0
        return (
          <fieldset key={l.id} data-testid={`recibir-linea-${l.skuCodigo}`}>
            <legend>{l.skuCodigo} · {l.skuNombre}</legend>
            <input type="hidden" name="lineaId" value={l.id} />
            <Campo
              nombre={`cantidad_${l.id}`}
              etiqueta={`Cantidad que llegó (faltan ${l.pendiente})`}
              tipo="number"
              paso="1"
              testid={`cantidad-${l.skuCodigo}`}
              ayuda="Deje en blanco o en 0 si de esta línea no llegó nada."
              alCambiar={(v) => setCantidades((p) => ({ ...p, [l.id]: v }))}
            />
            {pideSeries ? <CapturaSeries nombre={`series_${l.id}`} prefijoId={`series-${l.skuCodigo}`} esperadas={cantidad} etiqueta={`Series de ${l.skuCodigo} (una por línea)`} /> : null}
          </fieldset>
        )
      })}
    </Formulario>
  )
}

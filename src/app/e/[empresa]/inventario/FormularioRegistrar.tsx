'use client'
// Registrar activos: por serie se pega una lista (cada serie es un activo); por cantidad se indica cuántos hay.
import { useState } from 'react'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import { CapturaSeries } from '@/componentes/ui/CapturaSeries'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

export type SkuParaRegistrar = { id: string; codigo: string; nombre: string; control: 'serie' | 'cantidad' }

type Props = {
  skus: SkuParaRegistrar[]
  ubicaciones: { id: string; nombre: string }[]
  accion: (datos: FormData) => Promise<ResultadoAccion<unknown>>
}

export function FormularioRegistrar({ skus, ubicaciones, accion }: Props) {
  const [skuId, setSkuId] = useState('')
  const sku = skus.find((s) => s.id === skuId)

  return (
    <Formulario
      accion={accion}
      enviar="Registrar"
      testid="form-registrar"
      mensajeExito={(d) => ({
        texto: 'Registrado. Ya aparece en la lista.',
        testid: 'registrado-ok',
        detalles: (d as { avisos?: string[] } | undefined)?.avisos,
        testidDetalles: 'registrado-avisos',
      })}
    >
      <div className="fila-form">
        <Campo
          nombre="skuId"
          etiqueta="Artículo (SKU)"
          tipo="select"
          requerido
          vacio="Elija un artículo"
          opciones={skus.map((s) => ({ valor: s.id, etiqueta: `${s.codigo} · ${s.nombre} (${s.control === 'serie' ? 'por serie' : 'por cantidad'})` }))}
          testid="campo-sku"
          alCambiar={(v) => setSkuId(v)}
        />
        <Campo
          nombre="ubicacionId"
          etiqueta="Ubicación"
          tipo="select"
          requerido
          vacio="Elija dónde queda"
          opciones={ubicaciones.map((u) => ({ valor: u.id, etiqueta: u.nombre }))}
          testid="campo-ubicacion"
        />
      </div>
      {sku?.control === 'serie' ? <CapturaSeries prefijoId="series" /> : null}
      {sku?.control === 'cantidad' ? (
        <Campo nombre="cantidad" etiqueta="Cantidad que ingresa" tipo="number" paso="1" requerido testid="campo-cantidad" />
      ) : null}
      {!sku ? <p className="suave chica">Elija un artículo: si se controla por serie podrá pegar la lista de series; si es por cantidad, indicará cuántos hay.</p> : null}
    </Formulario>
  )
}

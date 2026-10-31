'use client'
// Alta de SKU. Al elegir la categoría aparecen solos sus campos propios, según su definición.
import { useState } from 'react'
import { Campo, Formulario } from '@/componentes/ui/Formulario'
import type { ResultadoAccion } from '@/componentes/ui/tipos-accion'

export type CampoDeCategoria = {
  clave: string
  etiqueta: string
  tipo: 'texto' | 'numero' | 'fecha' | 'lista' | 'si_no'
  opciones?: string[]
  obligatorio: boolean
}
export type CategoriaParaSku = { id: string; nombre: string; prefijo: string; campos: CampoDeCategoria[] }

type Props = {
  categorias: CategoriaParaSku[]
  puedeCodigoPropio: boolean
  accion: (datos: FormData) => Promise<ResultadoAccion<{ codigo: string }>>
}

/** Convierte lo escrito en el valor con su tipo; vacío = no se envía. */
function convertir(tipo: CampoDeCategoria['tipo'], crudo: string): unknown {
  if (crudo === '') return undefined
  if (tipo === 'numero') {
    const n = Number(crudo.replace(',', '.'))
    return Number.isFinite(n) ? n : crudo
  }
  if (tipo === 'si_no') return crudo === 'si'
  return crudo
}

export function FormularioSku({ categorias, puedeCodigoPropio, accion }: Props) {
  const [categoriaId, setCategoriaId] = useState('')
  const [valores, setValores] = useState<Record<string, unknown>>({})
  const categoria = categorias.find((c) => c.id === categoriaId)

  function poner(campo: CampoDeCategoria, crudo: string) {
    setValores((previos) => {
      const copia = { ...previos }
      const v = convertir(campo.tipo, crudo)
      if (v === undefined) delete copia[campo.clave]
      else copia[campo.clave] = v
      return copia
    })
  }

  return (
    <Formulario
      accion={accion}
      enviar="Crear SKU"
      testid="form-crear-sku"
      mensajeExito={(d) => {
        const codigo = (d as { codigo?: string } | undefined)?.codigo
        return codigo
          ? { texto: 'SKU creado con el código', testid: 'sku-creado', destacado: { texto: codigo, testid: 'sku-creado-codigo' } }
          : { texto: 'SKU creado.', testid: 'sku-creado' }
      }}
    >
      <div className="fila-form">
        <Campo
          nombre="categoriaId"
          etiqueta="Categoría"
          tipo="select"
          requerido
          opciones={categorias.map((c) => ({ valor: c.id, etiqueta: `${c.nombre} (${c.prefijo})` }))}
          vacio="Elija una categoría"
          testid="campo-categoria"
          alCambiar={(v) => {
            setCategoriaId(v)
            setValores({})
          }}
        />
        <Campo nombre="nombre" etiqueta="Nombre del artículo" requerido testid="campo-nombre" placeholder="Laptop 14 pulgadas" />
        <Campo
          nombre="control"
          etiqueta="Cómo se controla"
          tipo="select"
          requerido
          opciones={[
            { valor: 'serie', etiqueta: 'Por serie (cada equipo tiene su número de serie)' },
            { valor: 'cantidad', etiqueta: 'Por cantidad (se cuenta por unidades)' },
          ]}
          testid="campo-control"
        />
        {puedeCodigoPropio ? (
          <Campo
            nombre="codigo"
            etiqueta="Código propio (opcional)"
            testid="campo-codigo"
            ayuda={categoria ? `Déjelo vacío para el código automático: ${categoria.prefijo}-0001, ${categoria.prefijo}-0002...` : 'Déjelo vacío para el código automático.'}
          />
        ) : null}
      </div>

      {categoria ? (
        categoria.campos.length > 0 ? (
          <fieldset data-testid="campos-de-categoria">
            <legend>Datos de {categoria.nombre}</legend>
            <div className="fila-form" key={categoria.id}>
              {categoria.campos.map((cp) => {
                const comun = { nombre: `v_${cp.clave}`, etiqueta: cp.etiqueta, requerido: cp.obligatorio, testid: `valor-${cp.clave}`, alCambiar: (v: string) => poner(cp, v) }
                if (cp.tipo === 'lista') return <Campo key={cp.clave} {...comun} tipo="select" opciones={(cp.opciones ?? []).map((o) => ({ valor: o, etiqueta: o }))} />
                if (cp.tipo === 'si_no') return <Campo key={cp.clave} {...comun} tipo="select" opciones={[{ valor: 'si', etiqueta: 'Sí' }, { valor: 'no', etiqueta: 'No' }]} vacio="Sin indicar" />
                if (cp.tipo === 'numero') return <Campo key={cp.clave} {...comun} tipo="number" paso="any" />
                if (cp.tipo === 'fecha') return <Campo key={cp.clave} {...comun} tipo="date" />
                return <Campo key={cp.clave} {...comun} tipo="text" />
              })}
            </div>
          </fieldset>
        ) : (
          <p className="suave chica">Esta categoría no tiene campos propios.</p>
        )
      ) : null}
      <input type="hidden" name="valores" value={JSON.stringify(valores)} />
    </Formulario>
  )
}

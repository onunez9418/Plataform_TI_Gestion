'use client'
// Formulario con validación inmediata, estado de carga y mensaje del servidor.
// Llama a una acción de servidor (acciones.ts) que solo invoca servicios; aquí no hay reglas de negocio.
import { createContext, useCallback, useContext, useRef, useState, useTransition, type ReactNode } from 'react'
import type { ResultadoAccion } from './tipos-accion'
import { Aviso } from './Piezas'
import { useRefrescar } from './refrescar'

type Ctx = {
  errores: Record<string, string>
  poner: (nombre: string, mensaje: string | null) => void
}
const ContextoErrores = createContext<Ctx>({ errores: {}, poner: () => {} })

/** Para componentes propios (por ejemplo la captura de series) que muestran el error de su campo. */
export function useErrorDeCampo(nombre: string): string | undefined {
  return useContext(ContextoErrores).errores[nombre]
}

type Props = {
  accion: (datos: FormData) => Promise<ResultadoAccion<unknown>>
  children: ReactNode
  enviar: string
  testid?: string
  /** Identificador propio del botón de enviar (por defecto «{testid}-enviar»). */
  testidEnviar?: string
  /** Texto que se muestra al salir bien. */
  exito?: string
  /** Vaciar el formulario al salir bien (por defecto sí). */
  limpiar?: boolean
  /** Se llama con los datos devueltos cuando salió bien (por ejemplo, para mostrar un enlace). */
  alExito?: (datos: unknown) => void
  deshabilitado?: boolean
  /** Botón extra junto al de enviar. */
  extra?: ReactNode
}

export function Formulario({ accion, children, enviar, testid, testidEnviar, exito, limpiar = true, alExito, deshabilitado, extra }: Props) {
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [mensajeExito, setMensajeExito] = useState<string | null>(null)
  const [enCurso, iniciar] = useTransition()
  const ref = useRef<HTMLFormElement>(null)
  const refrescar = useRefrescar()

  const poner = useCallback((nombre: string, mensaje: string | null) => {
    setErrores((previo) => {
      const copia = { ...previo }
      if (mensaje) copia[nombre] = mensaje
      else delete copia[nombre]
      return copia
    })
  }, [])

  function alEnviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault()
    const formulario = evento.currentTarget
    setErrorGeneral(null)
    setMensajeExito(null)

    // Validación inmediata: campos obligatorios vacíos, sin ir al servidor.
    const locales: Record<string, string> = {}
    formulario.querySelectorAll<HTMLInputElement>('[data-requerido="1"]').forEach((el) => {
      const vacio = el.type === 'checkbox' ? !el.checked : el.value.trim() === ''
      if (vacio && el.name) locales[el.name] = 'Este dato es obligatorio.'
    })
    if (Object.keys(locales).length > 0) {
      setErrores(locales)
      const primero = formulario.querySelector<HTMLElement>(`[name="${Object.keys(locales)[0]}"]`)
      primero?.focus()
      return
    }
    setErrores({})

    const datos = new FormData(formulario)
    iniciar(async () => {
      try {
        const r = await accion(datos)
        if (r.ok) {
          if (exito) setMensajeExito(exito)
          if (limpiar) ref.current?.reset()
          refrescar()
          alExito?.(r.datos)
        } else {
          setErrores(r.error.campos ?? {})
          setErrorGeneral(r.error.mensaje)
        }
      } catch (e) {
        // Las redirecciones de Next (inicio de sesión, etc.) deben seguir su camino.
        if (e && typeof e === 'object' && 'digest' in e && String((e as { digest: unknown }).digest).startsWith('NEXT_')) throw e
        setErrorGeneral('No se pudo completar la acción. Intente de nuevo.')
      }
    })
  }

  return (
    <ContextoErrores.Provider value={{ errores, poner }}>
      <form ref={ref} onSubmit={alEnviar} noValidate data-testid={testid}>
        {errorGeneral ? (
          <Aviso tipo="alerta" titulo="No se pudo guardar" testid="error-formulario">
            <p className="sin-margen">{errorGeneral}</p>
          </Aviso>
        ) : null}
        {mensajeExito ? (
          <Aviso tipo="exito" testid="exito-formulario">
            <p className="sin-margen">{mensajeExito}</p>
          </Aviso>
        ) : null}
        {children}
        <div className="acciones-form">
          <button
            type="submit"
            className={`btn primario${enCurso ? ' cargando' : ''}`}
            disabled={enCurso || deshabilitado}
            data-testid={testidEnviar ?? (testid ? `${testid}-enviar` : undefined)}
          >
            {enCurso ? 'Guardando…' : enviar}
          </button>
          {extra}
        </div>
      </form>
    </ContextoErrores.Provider>
  )
}

type OpcionLista = { valor: string; etiqueta: string }

type CampoProps = {
  nombre: string
  etiqueta: string
  tipo?: 'text' | 'email' | 'number' | 'date' | 'textarea' | 'select' | 'checkbox' | 'password'
  requerido?: boolean
  ayuda?: string
  opciones?: OpcionLista[]
  /** Texto de la primera opción vacía de una lista. */
  vacio?: string
  valorInicial?: string | number | boolean
  testid?: string
  placeholder?: string
  filas?: number
  paso?: string
  alCambiar?: (valor: string) => void
}

/** Un campo con su etiqueta, ayuda y error. Lee el error del servidor por nombre de campo. */
export function Campo({ nombre, etiqueta, tipo = 'text', requerido, ayuda, opciones, vacio, valorInicial, testid, placeholder, filas, paso, alCambiar }: CampoProps) {
  const { errores, poner } = useContext(ContextoErrores)
  const error = errores[nombre]
  // El identificador sale del testid cuando lo hay, para que dos formularios en la misma pantalla no repitan ids.
  const id = testid ?? `campo-${nombre}`
  const idError = `${id}-error`
  const comunes = {
    id,
    name: nombre,
    'data-testid': id,
    'data-requerido': requerido ? '1' : undefined,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? idError : undefined,
  } as const

  // Al salir de un campo obligatorio vacío se avisa. El mensaje NUNCA se quita al salir del campo (solo al escribir
  // o cambiar): si se quitara, el botón de enviar subiría entre "apretar" y "soltar" y el primer clic se perdería.
  function validarAlSalir(e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    if (requerido && e.target.value.trim() === '') poner(nombre, 'Este dato es obligatorio.')
  }
  function alEscribir() {
    if (error) poner(nombre, null)
  }

  let control: ReactNode
  if (tipo === 'checkbox') {
    control = (
      <div className="opcion">
        <input type="checkbox" {...comunes} defaultChecked={Boolean(valorInicial)} onChange={(e) => { alEscribir(); alCambiar?.(e.target.checked ? 'si' : 'no') }} />
        <label htmlFor={id}>{etiqueta}</label>
      </div>
    )
  } else if (tipo === 'select') {
    control = (
      <select {...comunes} defaultValue={valorInicial === undefined ? '' : String(valorInicial)} onBlur={validarAlSalir} onChange={(e) => { alEscribir(); alCambiar?.(e.target.value) }}>
        <option value="">{vacio ?? 'Elija una opción'}</option>
        {(opciones ?? []).map((o) => (
          <option key={o.valor} value={o.valor}>{o.etiqueta}</option>
        ))}
      </select>
    )
  } else if (tipo === 'textarea') {
    control = <textarea {...comunes} rows={filas ?? 4} placeholder={placeholder} defaultValue={valorInicial === undefined ? '' : String(valorInicial)} onBlur={validarAlSalir} onChange={alEscribir} />
  } else {
    control = (
      <input
        type={tipo}
        {...comunes}
        step={paso}
        placeholder={placeholder}
        defaultValue={valorInicial === undefined ? '' : String(valorInicial)}
        onBlur={validarAlSalir}
        onChange={(e) => { alEscribir(); alCambiar?.(e.target.value) }}
        autoComplete="off"
      />
    )
  }

  return (
    <div className="campo">
      {tipo !== 'checkbox' ? (
        <label htmlFor={id}>
          {etiqueta}
          {requerido ? <span className="obligatorio">(obligatorio)</span> : null}
        </label>
      ) : null}
      {control}
      {ayuda ? <div className="ayuda">{ayuda}</div> : null}
      {error ? (
        <div className="error" id={idError} role="alert" data-testid={`${id}-error`}>
          {error}
        </div>
      ) : requerido ? (
        // Espacio reservado para el mensaje: así el botón de enviar no se mueve cuando aparece.
        <div className="error-reserva" aria-hidden="true" />
      ) : null}
    </div>
  )
}

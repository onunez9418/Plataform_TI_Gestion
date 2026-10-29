// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormularioCategoria } from './Formularios'

afterEach(cleanup)

describe('FormularioCategoria', () => {
  it('permite armar una categoría «Impresoras» con campos propios de varios tipos', async () => {
    const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: null }))
    render(<FormularioCategoria accion={accion} />)
    await userEvent.type(screen.getByTestId('campo-nombre-categoria'), 'Impresoras')
    await userEvent.type(screen.getByTestId('campo-prefijo'), 'IMP')

    await userEvent.click(screen.getByTestId('campo-def-agregar'))
    await userEvent.type(screen.getByTestId('campo-def-0-etiqueta'), 'Páginas por minuto')
    await userEvent.selectOptions(screen.getByTestId('campo-def-0-tipo'), 'numero')
    await userEvent.click(screen.getByTestId('campo-def-0-obligatorio'))

    await userEvent.click(screen.getByTestId('campo-def-agregar'))
    await userEvent.type(screen.getByTestId('campo-def-1-etiqueta'), 'Tipo de tinta')
    await userEvent.selectOptions(screen.getByTestId('campo-def-1-tipo'), 'lista')
    await userEvent.type(screen.getByTestId('campo-def-1-opciones'), 'Láser, Inyección')

    await userEvent.click(screen.getByTestId('form-crear-categoria-enviar'))
    await waitFor(() => expect(accion).toHaveBeenCalledTimes(1))
    const d = accion.mock.calls[0][0]
    expect(d.get('nombre')).toBe('Impresoras')
    expect(d.get('prefijo')).toBe('IMP')
    expect(JSON.parse(String(d.get('campos')))).toEqual([
      { clave: 'paginas_por_minuto', etiqueta: 'Páginas por minuto', tipo: 'numero', obligatorio: true },
      { clave: 'tipo_de_tinta', etiqueta: 'Tipo de tinta', tipo: 'lista', opciones: ['Láser', 'Inyección'], obligatorio: false },
    ])
    // tras crear, el editor queda vacío para la siguiente
    await waitFor(() => expect(screen.getByTestId('campo-def-sin-campos')).toBeTruthy())
  })

  it('se puede quitar un campo antes de crear', async () => {
    const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: null }))
    render(<FormularioCategoria accion={accion} />)
    await userEvent.type(screen.getByTestId('campo-nombre-categoria'), 'X')
    await userEvent.type(screen.getByTestId('campo-prefijo'), 'XX')
    await userEvent.click(screen.getByTestId('campo-def-agregar'))
    await userEvent.type(screen.getByTestId('campo-def-0-etiqueta'), 'Uno')
    await userEvent.click(screen.getByTestId('campo-def-0-quitar'))
    await userEvent.click(screen.getByTestId('form-crear-categoria-enviar'))
    await waitFor(() => expect(accion).toHaveBeenCalled())
    expect(JSON.parse(String(accion.mock.calls[0][0].get('campos')))).toEqual([])
  })
})

// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Formulario } from './Formulario'
import { CapturaSeries } from './CapturaSeries'

afterEach(cleanup)

function armar(accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: null }))) {
  render(
    <Formulario accion={accion} enviar="Registrar" testid="f">
      <CapturaSeries />
    </Formulario>,
  )
  return accion
}

describe('CapturaSeries dentro de un formulario', () => {
  it('sin series no deja registrar y lo explica', async () => {
    const accion = armar()
    await userEvent.click(screen.getByTestId('f-enviar'))
    expect(accion).not.toHaveBeenCalled()
    expect(screen.getByTestId('series-sin-series')).toBeTruthy()
  })

  it('marca la fila repetida con texto y no deja enviar hasta corregirla', async () => {
    const accion = armar()
    fireEvent.change(screen.getByTestId('series-texto'), { target: { value: 'SN-1\nSN-2\nSN-1' } })
    expect(screen.getByTestId('series-resumen').textContent).toBe('2 de 3 series correctas')
    expect(screen.getByTestId('series-fila-3').textContent).toContain('Repetida: ya está en la fila 1')
    await userEvent.click(screen.getByTestId('f-enviar'))
    expect(accion).not.toHaveBeenCalled()

    fireEvent.change(screen.getByTestId('series-texto'), { target: { value: 'SN-1\nSN-2\nSN-3' } })
    await userEvent.click(screen.getByTestId('f-enviar'))
    await waitFor(() => expect(accion).toHaveBeenCalledTimes(1))
    expect(JSON.parse(String(accion.mock.calls[0][0].get('series')))).toEqual(['SN-1', 'SN-2', 'SN-3'])
  })

  it('muestra el error del servidor sobre las series (por ejemplo, ya existen)', async () => {
    const accion = vi.fn(async () => ({ ok: false as const, error: { codigo: 'DUPLICADO', mensaje: 'Estas series ya existen: SN-2.', campos: { series: 'Ya existen: SN-2' } } }))
    armar(accion as never)
    fireEvent.change(screen.getByTestId('series-texto'), { target: { value: 'SN-1\nSN-2' } })
    await userEvent.click(screen.getByTestId('f-enviar'))
    await waitFor(() => expect(screen.getByTestId('series-error-servidor').textContent).toBe('Ya existen: SN-2'))
    expect(screen.getByTestId('error-formulario').textContent).toContain('SN-2')
  })
})

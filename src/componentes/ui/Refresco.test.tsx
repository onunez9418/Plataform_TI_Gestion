// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

const refrescar = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: refrescar, push: vi.fn() }) }))

import { BotonAccion } from './BotonAccion'
import { Campo, Formulario } from './Formulario'

afterEach(() => { cleanup(); refrescar.mockReset() })

describe('refresco de la pantalla después de guardar (DEF-FRO-01)', () => {
  it('el formulario pide releer la pantalla solo cuando salió bien', async () => {
    const accion = vi.fn()
      .mockResolvedValueOnce({ ok: false, error: { mensaje: 'No' } })
      .mockResolvedValueOnce({ ok: true, datos: null })
    render(<Formulario accion={accion} enviar="Guardar" testid="f"><Campo nombre="a" etiqueta="A" testid="a" /></Formulario>)
    await userEvent.click(screen.getByTestId('f-enviar'))
    await waitFor(() => expect(screen.getByTestId('error-formulario')).toBeTruthy())
    expect(refrescar).not.toHaveBeenCalled()
    await userEvent.click(screen.getByTestId('f-enviar'))
    await waitFor(() => expect(refrescar).toHaveBeenCalledTimes(1))
  })

  it('el botón de acción también', async () => {
    render(<BotonAccion texto="Suspender" testid="b" accion={async () => ({ ok: true, datos: null })} />)
    await userEvent.click(screen.getByTestId('b'))
    await waitFor(() => expect(refrescar).toHaveBeenCalledTimes(1))
  })
})

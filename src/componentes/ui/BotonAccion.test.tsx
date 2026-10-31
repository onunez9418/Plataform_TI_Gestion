// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { navegador } from '@/componentes/ui/recarga'
const recargarPagina = vi.spyOn(navegador, 'recargar').mockImplementation(() => {})
import { MensajeGuardadoVisor } from '@/componentes/ui/MensajeGuardadoVisor'
import { BotonAccion } from './BotonAccion'

afterEach(() => { cleanup(); sessionStorage.clear(); recargarPagina.mockClear() })

describe('BotonAccion', () => {
  it('al salir bien recarga la pantalla y deja su mensaje', async () => {
    render(<BotonAccion texto="Aprobar" testid="b" exito="Orden aprobada." accion={async () => ({ ok: true, datos: null })} />)
    await userEvent.click(screen.getByTestId('b'))
    await waitFor(() => expect(recargarPagina).toHaveBeenCalledTimes(1))
    render(<MensajeGuardadoVisor />)
    await waitFor(() => expect(screen.getByTestId('exito-formulario').textContent).toBe('Orden aprobada.'))
  })

  it('si el servidor lo rechaza, muestra su mensaje tal cual y no recarga', async () => {
    render(<BotonAccion texto="Aprobar" testid="b" accion={async () => ({ ok: false, error: { codigo: 'SEPARACION_FUNCIONES', mensaje: 'Quien prepara una orden no puede aprobarla.' } })} />)
    await userEvent.click(screen.getByTestId('b'))
    await waitFor(() => expect(screen.getByTestId('b-error').textContent).toBe('Quien prepara una orden no puede aprobarla.'))
    expect(recargarPagina).not.toHaveBeenCalled()
  })

  it('el mensaje se muestra una sola vez', async () => {
    render(<BotonAccion texto="X" testid="b" exito="Hecho." accion={async () => ({ ok: true, datos: null })} />)
    await userEvent.click(screen.getByTestId('b'))
    await waitFor(() => expect(recargarPagina).toHaveBeenCalled())
    const a = render(<MensajeGuardadoVisor />)
    await waitFor(() => expect(screen.getByTestId('mensaje-guardado')).toBeTruthy())
    a.unmount()
    const b = render(<MensajeGuardadoVisor />)
    expect(b.container.textContent).toBe('')
  })
})

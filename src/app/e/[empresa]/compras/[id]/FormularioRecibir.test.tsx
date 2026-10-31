// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormularioRecibir } from './FormularioRecibir'

import { navegador } from '@/componentes/ui/recarga'
const recargarPagina = vi.spyOn(navegador, 'recargar').mockImplementation(() => {})
import { MensajeGuardadoVisor } from '@/componentes/ui/MensajeGuardadoVisor'

afterEach(() => { cleanup(); sessionStorage.clear(); recargarPagina.mockClear() })

const lineas = [
  { id: 'l1', skuCodigo: 'LAP-0001', skuNombre: 'Laptop', control: 'serie' as const, pendiente: 3 },
  { id: 'l2', skuCodigo: 'MON-0001', skuNombre: 'Monitor', control: 'cantidad' as const, pendiente: 10 },
]
const ubicaciones = [{ id: 'u1', nombre: 'Almacén' }]

function armar() {
  const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: null }))
  render(<FormularioRecibir lineas={lineas} ubicaciones={ubicaciones} accion={accion} />)
  return accion
}

describe('FormularioRecibir', () => {
  it('pide series solo para la línea por serie y solo cuando llegó algo', async () => {
    armar()
    expect(screen.queryByTestId('series-LAP-0001-captura')).toBeNull()
    fireEvent.change(screen.getByTestId('cantidad-LAP-0001'), { target: { value: '2' } })
    expect(screen.getByTestId('series-LAP-0001-captura')).toBeTruthy()
    fireEvent.change(screen.getByTestId('cantidad-MON-0001'), { target: { value: '4' } })
    expect(screen.queryByTestId('series-MON-0001-captura')).toBeNull()
  })

  it('no deja confirmar si el número de series no coincide con la cantidad', async () => {
    const accion = armar()
    await userEvent.selectOptions(screen.getByTestId('campo-ubicacion'), 'u1')
    fireEvent.change(screen.getByTestId('cantidad-LAP-0001'), { target: { value: '2' } })
    fireEvent.change(screen.getByTestId('series-LAP-0001-texto'), { target: { value: 'A-1' } })
    expect(screen.getByTestId('series-LAP-0001-cantidad').textContent).toBe('Faltan 1 series.')
    await userEvent.click(screen.getByTestId('form-recibir-enviar'))
    expect(accion).not.toHaveBeenCalled()

    fireEvent.change(screen.getByTestId('series-LAP-0001-texto'), { target: { value: 'A-1\nA-2' } })
    fireEvent.change(screen.getByTestId('cantidad-MON-0001'), { target: { value: '5' } })
    await userEvent.click(screen.getByTestId('form-recibir-enviar'))
    await waitFor(() => expect(accion).toHaveBeenCalledTimes(1))
    const d = accion.mock.calls[0][0]
    expect(d.getAll('lineaId')).toEqual(['l1', 'l2'])
    expect(d.get('cantidad_l1')).toBe('2')
    expect(JSON.parse(String(d.get('series_l1')))).toEqual(['A-1', 'A-2'])
    expect(d.get('cantidad_l2')).toBe('5')
    expect(d.get('ubicacionId')).toBe('u1')
    await waitFor(() => expect(recargarPagina).toHaveBeenCalledTimes(1))
    render(<MensajeGuardadoVisor />)
    await waitFor(() => expect(screen.getByTestId('recepcion-ok')).toBeTruthy())
  })

  it('muestra los avisos del servidor al recibir', async () => {
    const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: { avisos: ['La serie A-1 ya existe en otro artículo.'] } }))
    render(<FormularioRecibir lineas={lineas} ubicaciones={ubicaciones} accion={accion} />)
    await userEvent.selectOptions(screen.getByTestId('campo-ubicacion'), 'u1')
    fireEvent.change(screen.getByTestId('cantidad-MON-0001'), { target: { value: '1' } })
    await userEvent.click(screen.getByTestId('form-recibir-enviar'))
    await waitFor(() => expect(recargarPagina).toHaveBeenCalledTimes(1))
    render(<MensajeGuardadoVisor />)
    await waitFor(() => expect(screen.getByTestId('recepcion-avisos').textContent).toContain('La serie A-1 ya existe en otro artículo.'))
  })
})

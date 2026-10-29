// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormularioRegistrar } from './FormularioRegistrar'

afterEach(cleanup)

const skus = [
  { id: 's1', codigo: 'LAP-0001', nombre: 'Laptop', control: 'serie' as const },
  { id: 's2', codigo: 'MON-0001', nombre: 'Monitor', control: 'cantidad' as const },
]
const ubicaciones = [{ id: 'u1', nombre: 'Almacén' }]

function armar() {
  const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: { creados: 3 } }))
  render(<FormularioRegistrar skus={skus} ubicaciones={ubicaciones} accion={accion} />)
  return accion
}

describe('FormularioRegistrar', () => {
  it('por serie pide la lista de series; por cantidad pide el número', async () => {
    armar()
    await userEvent.selectOptions(screen.getByTestId('campo-sku'), 's1')
    expect(screen.getByTestId('series-captura')).toBeTruthy()
    expect(screen.queryByTestId('campo-cantidad')).toBeNull()
    await userEvent.selectOptions(screen.getByTestId('campo-sku'), 's2')
    expect(screen.getByTestId('campo-cantidad')).toBeTruthy()
    expect(screen.queryByTestId('series-captura')).toBeNull()
  })

  it('registra tres equipos con series', async () => {
    const accion = armar()
    await userEvent.selectOptions(screen.getByTestId('campo-sku'), 's1')
    await userEvent.selectOptions(screen.getByTestId('campo-ubicacion'), 'u1')
    fireEvent.change(screen.getByTestId('series-texto'), { target: { value: 'SN-2001\nSN-2002\nSN-2003' } })
    await userEvent.click(screen.getByTestId('form-registrar-enviar'))
    await waitFor(() => expect(accion).toHaveBeenCalledTimes(1))
    const d = accion.mock.calls[0][0]
    expect(d.get('skuId')).toBe('s1')
    expect(d.get('ubicacionId')).toBe('u1')
    expect(JSON.parse(String(d.get('series')))).toEqual(['SN-2001', 'SN-2002', 'SN-2003'])
    await waitFor(() => expect(screen.getByTestId('registrado-ok')).toBeTruthy())
  })

  it('exige elegir artículo y ubicación', async () => {
    const accion = armar()
    await userEvent.click(screen.getByTestId('form-registrar-enviar'))
    expect(accion).not.toHaveBeenCalled()
    expect(screen.getByTestId('campo-sku-error')).toBeTruthy()
    expect(screen.getByTestId('campo-ubicacion-error')).toBeTruthy()
  })
})

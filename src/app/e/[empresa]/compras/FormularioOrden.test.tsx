// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

const empujar = vi.fn()
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: empujar }) }))

import { FormularioOrden } from './FormularioOrden'

afterEach(() => { cleanup(); empujar.mockReset() })

const proveedores = [{ id: 'p1', nombre: 'Proveedor Uno' }]
const skus = [{ id: 's1', codigo: 'LAP-0001', nombre: 'Laptop' }, { id: 's2', codigo: 'MON-0001', nombre: 'Monitor' }]

describe('FormularioOrden', () => {
  it('calcula el total al instante y envía las líneas con números', async () => {
    const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: { id: 'o1' } }))
    render(<FormularioOrden empresa="alfa" proveedores={proveedores} skus={skus} accion={accion} />)
    await userEvent.selectOptions(screen.getByTestId('campo-proveedor'), 'p1')
    await userEvent.selectOptions(screen.getByTestId('linea-0-sku'), 's1')
    fireEvent.change(screen.getByTestId('linea-0-cantidad'), { target: { value: '2' } })
    fireEvent.change(screen.getByTestId('linea-0-precio'), { target: { value: '1500.50' } })
    await userEvent.click(screen.getByTestId('agregar-linea'))
    await userEvent.selectOptions(screen.getByTestId('linea-1-sku'), 's2')
    fireEvent.change(screen.getByTestId('linea-1-cantidad'), { target: { value: '1' } })
    fireEvent.change(screen.getByTestId('linea-1-precio'), { target: { value: '800' } })
    expect(screen.getByTestId('total-orden').textContent).toContain('3,801.00')

    await userEvent.click(screen.getByTestId('form-orden-enviar'))
    await waitFor(() => expect(accion).toHaveBeenCalledTimes(1))
    const d = accion.mock.calls[0][0]
    expect(d.get('proveedorId')).toBe('p1')
    expect(JSON.parse(String(d.get('lineas')))).toEqual([
      { skuId: 's1', cantidad: 2, precioUnitario: 1500.5 },
      { skuId: 's2', cantidad: 1, precioUnitario: 800 },
    ])
    await waitFor(() => expect(empujar).toHaveBeenCalledWith('/e/alfa/compras/o1'))
  })

  it('no envía una línea incompleta y dice qué falta', async () => {
    const accion = vi.fn()
    render(<FormularioOrden empresa="alfa" proveedores={proveedores} skus={skus} accion={accion} />)
    await userEvent.selectOptions(screen.getByTestId('campo-proveedor'), 'p1')
    await userEvent.click(screen.getByTestId('form-orden-enviar'))
    expect(accion).not.toHaveBeenCalled()
    expect(screen.getByTestId('linea-0-sku-error')).toBeTruthy()
    expect(screen.getByTestId('linea-0-cantidad-error')).toBeTruthy()
  })
})

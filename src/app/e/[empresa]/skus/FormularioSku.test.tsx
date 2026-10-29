// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormularioSku, type CategoriaParaSku } from './FormularioSku'

afterEach(cleanup)

const categorias: CategoriaParaSku[] = [
  {
    id: 'c-lap', nombre: 'Laptops', prefijo: 'LAP',
    campos: [
      { clave: 'procesador', etiqueta: 'Procesador', tipo: 'texto', obligatorio: true },
      { clave: 'ram_gb', etiqueta: 'RAM GB', tipo: 'numero', obligatorio: false },
      { clave: 'fecha_compra', etiqueta: 'Fecha de compra', tipo: 'fecha', obligatorio: false },
      { clave: 'disco', etiqueta: 'Disco', tipo: 'lista', opciones: ['SSD', 'HDD'], obligatorio: false },
      { clave: 'garantia', etiqueta: 'Con garantía', tipo: 'si_no', obligatorio: false },
    ],
  },
  { id: 'c-mon', nombre: 'Monitores', prefijo: 'MON', campos: [] },
]

function armar(codigoPropio = true) {
  const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: { codigo: 'LAP-0002' } }))
  render(<FormularioSku categorias={categorias} puedeCodigoPropio={codigoPropio} accion={accion} />)
  return accion
}

describe('FormularioSku', () => {
  it('los campos de la categoría aparecen solos al elegirla, cada uno según su tipo', async () => {
    armar()
    expect(screen.queryByTestId('campos-de-categoria')).toBeNull()
    await userEvent.selectOptions(screen.getByTestId('campo-categoria'), 'c-lap')
    expect(screen.getByTestId('campos-de-categoria')).toBeTruthy()
    expect((screen.getByTestId('valor-ram_gb') as HTMLInputElement).type).toBe('number')
    expect((screen.getByTestId('valor-fecha_compra') as HTMLInputElement).type).toBe('date')
    expect(Array.from((screen.getByTestId('valor-disco') as HTMLSelectElement).options).map((o) => o.value)).toEqual(['', 'SSD', 'HDD'])
    expect((screen.getByTestId('valor-garantia') as HTMLSelectElement).tagName).toBe('SELECT')
    // otra categoría cambia los campos
    await userEvent.selectOptions(screen.getByTestId('campo-categoria'), 'c-mon')
    expect(screen.queryByTestId('valor-procesador')).toBeNull()
  })

  it('exige el campo obligatorio de la categoría', async () => {
    const accion = armar()
    await userEvent.selectOptions(screen.getByTestId('campo-categoria'), 'c-lap')
    await userEvent.type(screen.getByTestId('campo-nombre'), 'Laptop 14')
    await userEvent.selectOptions(screen.getByTestId('campo-control'), 'serie')
    await userEvent.click(screen.getByTestId('form-crear-sku-enviar'))
    expect(accion).not.toHaveBeenCalled()
    expect(screen.getByTestId('valor-procesador-error').textContent).toBe('Este dato es obligatorio.')
  })

  it('envía los valores con su tipo (número, sí/no, texto) y muestra el código creado', async () => {
    const accion = armar()
    await userEvent.selectOptions(screen.getByTestId('campo-categoria'), 'c-lap')
    await userEvent.type(screen.getByTestId('campo-nombre'), 'Laptop 14')
    await userEvent.selectOptions(screen.getByTestId('campo-control'), 'serie')
    await userEvent.type(screen.getByTestId('valor-procesador'), 'i7')
    fireEvent.change(screen.getByTestId('valor-ram_gb'), { target: { value: '16' } })
    await userEvent.selectOptions(screen.getByTestId('valor-garantia'), 'si')
    await userEvent.selectOptions(screen.getByTestId('valor-disco'), 'SSD')
    await userEvent.click(screen.getByTestId('form-crear-sku-enviar'))
    await waitFor(() => expect(accion).toHaveBeenCalledTimes(1))
    const datos = accion.mock.calls[0][0]
    expect(datos.get('categoriaId')).toBe('c-lap')
    expect(datos.get('control')).toBe('serie')
    expect(JSON.parse(String(datos.get('valores')))).toEqual({ procesador: 'i7', ram_gb: 16, garantia: true, disco: 'SSD' })
    await waitFor(() => expect(screen.getByTestId('sku-creado-codigo').textContent).toBe('LAP-0002'))
  })

  it('sin permiso de código propio, el campo no se ofrece', () => {
    armar(false)
    expect(screen.queryByTestId('campo-codigo')).toBeNull()
  })
})

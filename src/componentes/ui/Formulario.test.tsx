// @vitest-environment jsdom
import { cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { Campo, Formulario } from './Formulario'
import type { ResultadoAccion } from './tipos-accion'

afterEach(cleanup)

function armar(accion: (d: FormData) => Promise<ResultadoAccion<unknown>>) {
  render(
    <Formulario accion={accion} enviar="Guardar" testid="f" exito="Guardado.">
      <Campo nombre="nombre" etiqueta="Nombre" requerido testid="campo-nombre" />
      <Campo nombre="correo" etiqueta="Correo" testid="campo-correo" />
    </Formulario>,
  )
}

describe('Formulario', () => {
  it('no llama al servidor si falta un dato obligatorio y lo dice en el campo', async () => {
    const accion = vi.fn()
    armar(accion)
    await userEvent.click(screen.getByTestId('f-enviar'))
    expect(accion).not.toHaveBeenCalled()
    expect(screen.getByTestId('campo-nombre-error').textContent).toBe('Este dato es obligatorio.')
    expect(screen.getByTestId('campo-nombre').getAttribute('aria-invalid')).toBe('true')
  })

  it('envía los datos escritos y muestra el éxito', async () => {
    const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: null }))
    armar(accion)
    await userEvent.type(screen.getByTestId('campo-nombre'), 'Ana')
    await userEvent.click(screen.getByTestId('f-enviar'))
    await waitFor(() => expect(screen.getByTestId('exito-formulario')).toBeTruthy())
    expect(accion).toHaveBeenCalledTimes(1)
    expect(accion.mock.calls[0][0].get('nombre')).toBe('Ana')
  })

  it('muestra el mensaje del servidor y el error del campo que indica', async () => {
    const accion = vi.fn(async () => ({
      ok: false as const,
      error: { codigo: 'DUPLICADO', mensaje: 'Ya existe un registro con ese nombre.', campos: { nombre: 'Ese nombre ya está en uso.' } },
    }))
    armar(accion)
    await userEvent.type(screen.getByTestId('campo-nombre'), 'Ana')
    await userEvent.click(screen.getByTestId('f-enviar'))
    await waitFor(() => expect(screen.getByTestId('error-formulario').textContent).toContain('Ya existe un registro con ese nombre.'))
    expect(screen.getByTestId('campo-nombre-error').textContent).toBe('Ese nombre ya está en uso.')
  })

  it('si el servicio falla de forma inesperada, no se queda cargando y avisa en claro', async () => {
    const accion = vi.fn(async () => { throw new Error('boom') })
    armar(accion)
    await userEvent.type(screen.getByTestId('campo-nombre'), 'Ana')
    await userEvent.click(screen.getByTestId('f-enviar'))
    await waitFor(() => expect(screen.getByTestId('error-formulario').textContent).toContain('No se pudo completar'))
    expect((screen.getByTestId('f-enviar') as HTMLButtonElement).disabled).toBe(false)
  })

  it('el mensaje de error no desaparece al salir del campo (si no, el botón se movería y se perdería el primer clic)', async () => {
    const accion = vi.fn(async (_d: FormData) => ({ ok: true as const, datos: null }))
    armar(accion)
    await userEvent.click(screen.getByTestId('f-enviar'))
    expect(screen.getByTestId('campo-nombre-error')).toBeTruthy()
    // entrar y salir del campo sin escribir: el aviso sigue
    await userEvent.click(screen.getByTestId('campo-nombre'))
    await userEvent.click(screen.getByTestId('campo-correo'))
    expect(screen.getByTestId('campo-nombre-error')).toBeTruthy()
    // al escribir, sí se quita; y el primer clic en enviar ya funciona
    await userEvent.type(screen.getByTestId('campo-nombre'), 'Ana')
    expect(screen.queryByTestId('campo-nombre-error')).toBeNull()
    await userEvent.click(screen.getByTestId('f-enviar'))
    await waitFor(() => expect(accion).toHaveBeenCalledTimes(1))
  })

  it('al salir de un campo obligatorio vacío se avisa, y el espacio del aviso ya estaba reservado', async () => {
    armar(vi.fn())
    expect(document.querySelectorAll('.error-reserva').length).toBe(1)
    await userEvent.click(screen.getByTestId('campo-nombre'))
    await userEvent.click(screen.getByTestId('campo-correo'))
    expect(screen.getByTestId('campo-nombre-error').textContent).toBe('Este dato es obligatorio.')
  })
})

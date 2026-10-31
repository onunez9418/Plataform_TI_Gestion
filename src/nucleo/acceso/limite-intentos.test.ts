import { beforeEach, describe, expect, it } from 'vitest'
import { configPorOmision, registrarPedidoDeEnlace, reiniciarLimitesDeEnlaces } from './limite-intentos'

const cfg = { ventanaMs: 10 * 60_000, maxPorCorreo: 5, maxPorOrigen: 20 }
const T0 = 1_000_000_000_000

describe('H-SEG-L09 · límite de pedidos de enlace', () => {
  beforeEach(() => reiniciarLimitesDeEnlaces())

  it('por omisión: 5 por correo y 20 por origen cada 10 minutos', () => {
    expect(configPorOmision({})).toEqual(cfg)
    expect(configPorOmision({ LIMITE_ENLACES_POR_CORREO: '50', LIMITE_ENLACES_MINUTOS: '1' })).toMatchObject({ maxPorCorreo: 50, ventanaMs: 60_000 })
    expect(configPorOmision({ LIMITE_ENLACES_POR_CORREO: 'x', LIMITE_ENLACES_POR_ORIGEN: '-3' })).toMatchObject({ maxPorCorreo: 5, maxPorOrigen: 20 })
  })

  it('el pedido número 6 del mismo correo se rechaza con un mensaje claro en español', () => {
    for (let i = 0; i < 5; i++) registrarPedidoDeEnlace('a@x.local', `o${i}`, T0 + i, cfg)
    try {
      registrarPedidoDeEnlace('a@x.local', 'o9', T0 + 10, cfg)
      expect.unreachable()
    } catch (e) {
      expect(e).toMatchObject({ codigo: 'VALIDACION', campos: { correo: expect.stringContaining('demasiados enlaces') } })
      expect((e as Error).message).toMatch(/Espere \d+ minutos?/)
    }
  })

  it('otro correo no se ve afectado por el límite de un correo', () => {
    for (let i = 0; i < 5; i++) registrarPedidoDeEnlace('a@x.local', 'o1', T0 + i, cfg)
    expect(() => registrarPedidoDeEnlace('b@x.local', 'o1', T0 + 10, cfg)).not.toThrow()
  })

  it('el origen también se limita, con correos distintos', () => {
    for (let i = 0; i < 20; i++) registrarPedidoDeEnlace(`u${i}@x.local`, 'ip-1', T0 + i, cfg)
    expect(() => registrarPedidoDeEnlace('otro@x.local', 'ip-1', T0 + 50, cfg)).toThrow(/demasiados enlaces/)
    expect(() => registrarPedidoDeEnlace('otro@x.local', 'ip-2', T0 + 50, cfg)).not.toThrow()
  })

  it('pasada la ventana se vuelve a permitir; un pedido rechazado no suma', () => {
    for (let i = 0; i < 5; i++) registrarPedidoDeEnlace('a@x.local', 'o1', T0, cfg)
    for (let i = 0; i < 3; i++) expect(() => registrarPedidoDeEnlace('a@x.local', 'o1', T0 + 60_000, cfg)).toThrow()
    expect(() => registrarPedidoDeEnlace('a@x.local', 'o1', T0 + cfg.ventanaMs + 1, cfg)).not.toThrow()
  })

  it('los contadores no crecen sin límite con muchos correos distintos', () => {
    const grande = { ...cfg, maxPorOrigen: 1_000_000 }
    for (let i = 0; i < 6_000; i++) registrarPedidoDeEnlace(`m${i}@x.local`, `o${i}`, T0 + i, grande)
    expect(() => registrarPedidoDeEnlace('m1@x.local', 'o1', T0 + 7_000, grande)).not.toThrow()
  })
})

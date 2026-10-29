// QA · Defectos abiertos de la guarda de MODO_LOCAL. Describen lo CORRECTO: fallan mientras el defecto exista.
import { describe, expect, it } from 'vitest'
import { verificarArranque } from '../../src/nucleo/configuracion'

const local = { MODO_LOCAL: '1', ENTORNO: 'desarrollo', APP_URL: 'http://localhost:3000' }

describe('DEF-ARR-01 · la guarda mira el servidor de la dirección, pero el programa de base de datos puede usar otro', () => {
  it('una dirección con ?host=otro-servidor no debe aceptarse como local', () => {
    // pg (la biblioteca de conexión) deja que «?host=» pise el servidor de la dirección: la guarda ve localhost y se conecta a otro.
    expect(() => verificarArranque({ ...local, DATABASE_URL: 'postgres://u:p@localhost:5432/x?host=basedatos.empresa.com' })).toThrow(/se niega a arrancar/)
    expect(() => verificarArranque({ ...local, DATABASE_URL: 'postgres://u:p@db:5432/x?hostaddr=34.12.10.9' })).toThrow(/se niega a arrancar/)
  })
})

describe('DEF-ARR-02 · cualquier nombre de un solo tramo se acepta como «red interna de Docker»', () => {
  it.each(['produccion-db', 'rds-prod', 'basedatos'])('el servidor «%s» no es el servicio db del compose y no debe aceptarse', (host) => {
    expect(() => verificarArranque({ ...local, DATABASE_URL: `postgres://u:p@${host}:5432/x` })).toThrow(/se niega a arrancar/)
  })
})

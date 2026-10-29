import { describe, expect, it } from 'vitest'
import { validarSql } from './sql-permitido'
import { ErrorUsoAislamiento } from './errores-base'

describe('validarSql (la empresa solo la fija conEmpresa)', () => {
  it('acepta consultas normales con marcadores', () => {
    expect(() => validarSql('SELECT * FROM sku WHERE codigo_norm = $1')).not.toThrow()
    expect(() => validarSql('UPDATE sku SET activo = false WHERE id = $1;')).not.toThrow()
    expect(() => validarSql("INSERT INTO auditoria (accion) VALUES ('x') RETURNING id")).not.toThrow()
  })

  it.each([
    "SELECT set_config('app.empresa_id', $1, true)",
    "select pg_catalog.set_config('app.empresa_id','x',false)",
    'SELECT "set_config"($1,$2,true)',
    "SET app.empresa_id = 'x'",
    '  reset all',
    'BEGIN',
    'COMMIT',
    'rollback',
    'SAVEPOINT a',
    "DO $$ BEGIN PERFORM 1; END $$",
    'TRUNCATE sku',
    'LISTEN canal',
    'SELECT pg_advisory_lock(1)',
    'SELECT 1; SELECT 2',
    '   ',
  ])('rechaza %s', (sql) => {
    expect(() => validarSql(sql)).toThrow(ErrorUsoAislamiento)
  })
})

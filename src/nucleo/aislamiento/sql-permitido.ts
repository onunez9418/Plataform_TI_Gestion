import { ErrorUsoAislamiento } from './errores-base'

// Defensa en profundidad (ADR-03, H-SEG-36): la empresa solo la fija esta puerta.
const SQL_PROHIBIDO: { patron: RegExp; motivo: string }[] = [
  { patron: /\bset_config\b/i, motivo: 'set_config solo lo usa nucleo/aislamiento' },
  { patron: /^\s*(set|reset)\b/i, motivo: 'SET/RESET de sesión no se permite (el agrupador de conexiones lo prohíbe)' },
  { patron: /^\s*(begin|start|commit|end|rollback|abort|savepoint|release)\b/i, motivo: 'la transacción la maneja conEmpresa (usa tx.intentar para puntos de guardado)' },
  { patron: /^\s*(do|copy|listen|notify|unlisten|truncate)\b/i, motivo: 'sentencia no permitida desde los servicios' },
  { patron: /\bpg_advisory_lock\s*\(|\bpg_advisory_lock_shared\s*\(/i, motivo: 'use pg_advisory_xact_lock' },
]

export function validarSql(sql: string): void {
  if (typeof sql !== 'string' || sql.trim() === '') throw new ErrorUsoAislamiento('SQL vacío.')
  for (const { patron, motivo } of SQL_PROHIBIDO) {
    if (patron.test(sql)) throw new ErrorUsoAislamiento(`SQL no permitido: ${motivo}.`)
  }
  // Una sentencia por llamada: sin ';' salvo al final.
  if (sql.replace(/;\s*$/, '').includes(';')) {
    throw new ErrorUsoAislamiento('SQL no permitido: una sola sentencia por llamada.')
  }
}


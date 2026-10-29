// Identificadores fijos de la semilla, para que las pruebas y las guías puedan nombrarlos.
// Son UUID inventados (no corresponden a nada real).

export const EMPRESAS = {
  alfa: { id: '01980000-0000-7000-8000-00000000a1fa', slug: 'alfa', nombre: 'Alfa S.A.' },
  beta: { id: '01980000-0000-7000-8000-00000000be7a', slug: 'beta', nombre: 'Beta S.A.C.' },
} as const

export type ClaveEmpresa = keyof typeof EMPRESAS

export const USUARIOS = {
  ceo: { id: '01980000-0000-7000-8000-0000000c3e00', correo: 'ceo@demo.local', nombre: 'CEO de demostración' },
  jefaAlfa: { id: '01980000-0000-7000-8000-0000000a0001', correo: 'jefa@alfa.local', nombre: 'Jefa de TI de Alfa' },
  tecnicoAlfa: { id: '01980000-0000-7000-8000-0000000a0002', correo: 'tecnico@alfa.local', nombre: 'Técnico de Alfa' },
  consultaAlfa: { id: '01980000-0000-7000-8000-0000000a0003', correo: 'consulta@alfa.local', nombre: 'Consulta de Alfa' },
  adminBeta: { id: '01980000-0000-7000-8000-0000000b0001', correo: 'admin@beta.local', nombre: 'Administrador de Beta' },
  tecnicoBeta: { id: '01980000-0000-7000-8000-0000000b0002', correo: 'tecnico@beta.local', nombre: 'Técnico de Beta' },
} as const

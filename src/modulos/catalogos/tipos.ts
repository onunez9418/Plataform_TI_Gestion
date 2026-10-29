export type Ubicacion = { id: string; nombre: string; descripcion: string | null; activo: boolean }
export type EntradaCrearUbicacion = { nombre: string; descripcion?: string }
export type EntradaEditarUbicacion = { id: string; nombre?: string; descripcion?: string | null; activo?: boolean }

export type Proveedor = { id: string; nombre: string; documento: string | null; contacto: string | null; activo: boolean }
export type EntradaCrearProveedor = { nombre: string; documento?: string; contacto?: string }
export type EntradaEditarProveedor = { id: string; nombre?: string; documento?: string | null; contacto?: string | null; activo?: boolean }

export type Persona = { id: string; nombre: string; correo: string | null; area: string | null; activo: boolean }
export type EntradaCrearPersona = { nombre: string; correo?: string; area?: string }
export type EntradaEditarPersona = { id: string; nombre?: string; correo?: string | null; area?: string | null; activo?: boolean }

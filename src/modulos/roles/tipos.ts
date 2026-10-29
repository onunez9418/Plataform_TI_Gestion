export type Rol = { id: string; nombre: string; esBase: boolean; permisos: string[]; usuarios: number }
export type PermisoDelCatalogo = { clave: string; etiqueta: string; grupo: string }
export type EntradaCrearRol = { nombre: string; permisos: string[] }
export type EntradaEditarRol = { rolId: string; nombre?: string; permisos?: string[] }

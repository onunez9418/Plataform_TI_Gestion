import { createHash, randomBytes } from 'node:crypto'

/** Valor secreto de 256 bits, apto para una dirección o una cookie. */
export const generarToken = (): string => randomBytes(32).toString('base64url')

/**
 * Huella del token: lo único que se guarda en la base (nunca el token). SHA-256 basta porque el token ya
 * es aleatorio de 256 bits (no hay nada que adivinar por fuerza bruta).
 */
export const huellaDe = (token: string): string => createHash('sha256').update(token, 'utf8').digest('hex')

export const TOKEN_VALIDO = /^[A-Za-z0-9_-]{43}$/

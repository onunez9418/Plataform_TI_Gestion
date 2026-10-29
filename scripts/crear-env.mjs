// Crea ".env" con contraseñas aleatorias si no existe (equivalente de scripts/crear-env.ps1 para Linux/Mac).
import { crearEnvSiFalta } from './lib/entorno.mjs';
console.log(crearEnvSiFalta() ? 'Se creo .env con contrasenas nuevas.' : '.env ya existe: no se toca.');

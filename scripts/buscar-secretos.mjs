// Búsqueda de secretos: falla si encuentra claves, contraseñas o archivos .env en lo que va al repositorio.
// Revisa los archivos que Git versiona o versionaría (respeta .gitignore). Sin dependencias.
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const IGNORAR_RUTAS = [/^package-lock\.json$/, /^\.claude\//, /\.(png|jpg|jpeg|gif|ico|woff2?|pdf|zip)$/i, /^scripts\/buscar-secretos\.mjs$/];

// Valores de relleno aceptados: no son secretos.
const RELLENO = /cambiar-esto|ejemplo|placeholder|xxxx|\$\{[^}]*\}|\$[A-Z_]+|<[^>]+>|%[A-Za-z_]+%|\.\.\.|^$/i;

const REGLAS = [
  { nombre: 'Llave privada', re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { nombre: 'Clave de AWS', re: /\bAKIA[0-9A-Z]{16}\b/ },
  { nombre: 'Token de GitHub', re: /\bgh[pousr]_[A-Za-z0-9]{30,}\b/ },
  { nombre: 'Clave de API tipo sk-', re: /\bsk-[A-Za-z0-9]{32,}\b/ },
  { nombre: 'Token de Slack', re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/ },
  {
    nombre: 'Dirección de base de datos con contraseña real',
    re: /\bpostgres(?:ql)?:\/\/[^:\s/@'"`]+:([^@\s'"`]+)@/,
    valor: 1,
  },
  {
    nombre: 'Contraseña o clave escrita en el código',
    re: /\b(?:password|passwd|contrase[nñ]a|secret|api[_-]?key|token)\b["']?\s*[:=]\s*["']([^"'\s]{8,})["']/i,
    valor: 1,
  },
];

function archivos() {
  try {
    const salida = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
    return salida.split('\0').filter(Boolean);
  } catch {
    // Sin Git (por ejemplo, dentro de una imagen): se recorre la carpeta.
    const lista = [];
    const recorrer = (dir) => {
      for (const nombre of readdirSync(dir)) {
        if (['node_modules', '.git', '.next', '.local'].includes(nombre)) continue;
        const ruta = join(dir, nombre);
        if (statSync(ruta).isDirectory()) recorrer(ruta);
        else lista.push(ruta.replaceAll('\\', '/').replace(/^\.\//, ''));
      }
    };
    recorrer('.');
    return lista;
  }
}

const hallazgos = [];
for (const ruta of archivos()) {
  // Un .env real jamás debe estar en lo que se versiona; el de ejemplo sí.
  if (/(^|\/)\.env(\..+)?$/.test(ruta) && !ruta.endsWith('.env.example')) {
    hallazgos.push(`${ruta}: archivo .env dentro del repositorio`);
    continue;
  }
  if (IGNORAR_RUTAS.some((r) => r.test(ruta))) continue;
  let texto;
  try {
    texto = readFileSync(ruta, 'utf8');
  } catch {
    continue;
  }
  if (texto.includes('\0')) continue;
  texto.split('\n').forEach((linea, i) => {
    for (const regla of REGLAS) {
      const m = regla.re.exec(linea);
      if (!m) continue;
      const valor = regla.valor ? m[regla.valor] : m[0];
      if (regla.valor && RELLENO.test(valor)) continue;
      hallazgos.push(`${ruta}:${i + 1}: ${regla.nombre}`);
    }
  });
}

if (hallazgos.length) {
  console.error('BÚSQUEDA DE SECRETOS: se encontraron posibles secretos (no se muestran los valores):');
  for (const h of hallazgos) console.error('  - ' + h);
  process.exit(1);
}
console.log('Búsqueda de secretos: sin hallazgos.');

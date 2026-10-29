/** @type {import('next').NextConfig} */
const configuracion = {
  reactStrictMode: true,
  // No se anuncia la tecnología del servidor en las respuestas.
  poweredByHeader: false,
  // Las pantallas se arman con datos de la base en cada petición, no en la compilación.
  // (La imagen de Docker compila sin base de datos.)
};

export default configuracion;

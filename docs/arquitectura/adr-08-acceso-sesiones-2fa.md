# ADR-08 · Acceso: sesiones en base, segunda verificación propia y enlace con botón (T-6)

**Estado:** Propuesto · **Decide:** Gerente de TI (revisa Seguridad) · **Base:** D-048, D-054.3, D-055 T-6, H-ARQ-21, RF-ACC-006/013/014/016/017

## Contexto
No hay contraseñas: se ingresa por enlace de correo. Auth.js trae el enlace por correo y sesiones en base, pero **no** trae la segunda verificación con autenticador, el bloqueo creciente, la "verificación reciente" ni la revocación inmediata al suspender. Los filtros de correo abren los enlaces antes que la persona y gastan un enlace de un solo uso.

## Opciones
1. Sesión en un token firmado (sin estado). Descartada: no se puede revocar al instante.
2. **Sesión en base**, validada en cada petición. Elegida.
3. Auth.js completo con su adaptador de Prisma. Probable de descartar: su adaptador asume que el rol de la aplicación lee directamente las tablas de usuario y sesión, lo que contradice ADR-04 (globales sensibles solo por funciones).

## Decisión
- **Sesión:** identificador opaco de 256 bits; en base solo su huella (ADR-09). Caduca a los 30 minutos de inactividad y a las 12 horas absolutas (RF-ACC-014). Se valida contra la base en **cada** petición (dentro de `abrir_contexto`, ADR-05), así suspender o quitar el rol corta el acceso en la petición siguiente. Está atada a la empresa de la dirección y al rol vigente.
- **Enlace de ingreso:** un `GET` solo muestra una página con el botón **"Entrar"**; el `POST` consume el enlace. Está **atado al navegador que lo pidió** (cookie aleatoria cuya huella se guarda con el enlace). Un filtro de correo que lo abra no lo gasta. Vence a los 15 minutos y es de un solo uso. Otra forma de abrirlo en otro dispositivo: código corto (ADR-09).
- **Respuesta uniforme:** mismo contenido y tiempo de respuesta exista o no el correo; no se envía nada a direcciones sin cuenta ni invitación (D-054.3).
- **Segunda verificación propia** (aplicación autenticadora, sin SMS): TOTP con ventana de ±1 paso; el último paso usado se guarda para impedir reutilización; semilla cifrada con llave por usuario (ADR-07). Obligatoria a quien tenga algún permiso sensible, calculado desde el catálogo (ADR-10), no por el nombre del rol. 10 códigos de recuperación de un solo uso (huella).
- **Bloqueo:** 5 intentos fallidos y esperas de 1, 2, 5 y 15 minutos, con el limitador de ADR-16. El tope por correo no bloquea al dueño que ya tiene un enlace válido.
- **Verificación reciente:** `sesion.verificada_en`; `exigirVerificacionReciente()` exige ≤ 10 minutos (con el reloj de ADR-02) para ver claves de licencia, exportar, importar, administrar roles y usuarios, activar excepciones, cambiar titular de dominio y crear claves de API.
- **Auth.js:** el prototipo (H6) decide. Criterio: si hay que reemplazar **más de dos** de sus piezas (tablas, enlace, sesión) se usa **solo como capa de proveedores** externos (Microsoft/Google, INT-3) y el resto es un módulo propio `nucleo/acceso`. Es una adaptación dentro del stack, no un cambio: si se abandona por completo, lo propone el Arquitecto y lo aprueba la Jefatura (CLAUDE.md).
- **Acceso de emergencia (D-048.6, PS-05):** un solo uso, exige segunda persona de plataforma o contacto autorizado confirmado, huella como todo valor de entrada.
- Ingreso con proveedor externo (INT-3): se vincula por el identificador inmutable del proveedor, no por el correo (D-054.5). Fuera de la v1.

## Consecuencias
- Se construye lo que Auth.js no trae: es trabajo propio de la Etapa 1 y superficie de seguridad nuestra; compensa que se prueba exhaustivamente y no hay contraseñas que filtrar.
- Una consulta más por petición (la validación de sesión), sin caché, a cambio de revocación inmediata.

## Qué prueba lo valida
- H6: sesión revocada falla en la petición siguiente; tres `GET` del enlace (simula el filtro de correo) no lo gastan y el `POST` posterior entra; el `POST` desde otro navegador sin cookie falla; TOTP: acepta ±1 paso, rechaza reutilizar el mismo código; bloqueo 5/1/2/5/15 con reloj fijado; verificación reciente a los 10 minutos con reloj adelantado.
- Respuestas idénticas (contenido y tiempo dentro de un margen) para correo existente e inexistente.
- Criterios CA de la Etapa 1 (RF-ACC-006, 014, 016).

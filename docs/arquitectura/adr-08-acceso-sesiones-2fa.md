# ADR-08 · Acceso: sesiones en base, segunda verificación propia, enlace con botón y sesión de plataforma (T-6)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5) · **Decide:** Gerente de TI (revisa Seguridad) · **Base:** D-048, D-054.3, D-055 T-6, H-ARQ-21, RF-ACC-006/013/014/016/017; H-SEG-46, 50, 51, 52, 53

## Contexto
No hay contraseñas: se ingresa por enlace de correo. Auth.js trae el enlace por correo y sesiones en base, pero **no** trae la segunda verificación con autenticador, el bloqueo creciente, la "verificación reciente" ni la revocación inmediata al suspender. Los filtros de correo abren los enlaces antes que la persona y gastan un enlace de un solo uso. Además, el enlace de ingreso debe llegar **en claro** al correo, mientras que ningún valor que sirva para entrar puede estar en la base ni en la cola (RS-51): la revisión de Seguridad mostró que el diseño no decía cómo viaja el valor hasta el trabajador que envía el correo.

## Opciones
1. Sesión en un token firmado (sin estado). Descartada: no se puede revocar al instante.
2. **Sesión en base**, validada en cada petición. Elegida.
3. Auth.js completo con su adaptador de Prisma. Probable de descartar: su adaptador asume que el rol de la aplicación lee directamente las tablas de usuario y sesión, lo que contradice ADR-04 (globales sensibles solo por funciones).

## Decisión

### Cookies (H-SEG-50)
Las dos cookies del sistema son `__Host-sid` (sesión) y `__Host-nav` (navegador de origen del enlace), con `Secure`, `HttpOnly`, `SameSite=Lax`, `Path=/` y **sin `Domain`**: el prefijo `__Host-` obliga a esas condiciones y hace que una dirección hermana (la consola de plataforma, que vive en otra) no pueda leerlas ni pisarlas. Solo en desarrollo local, fuera de producción, se acepta el nombre sin prefijo. Una prueba de integración comprueba los atributos de cada `Set-Cookie`. Las cabeceras de seguridad de toda respuesta están en ADR-01; las de la página del botón "Entrar" y las de las descargas, también.

### Sesión de empresa
Identificador opaco de 256 bits; en base solo su huella (ADR-09). Caduca a los 30 minutos de inactividad y a las 12 horas absolutas (RF-ACC-014). Se valida contra la base en **cada** petición (dentro de `abrir_contexto`, ADR-05), así suspender o quitar el rol corta el acceso en la petición siguiente. Está atada a la empresa de la dirección y al rol vigente. La tabla `sesion` guarda `tipo` (`empresa` o `plataforma`), `verificada_en` y `verificada_con` (`enlace`, `autenticador` o `llave`).

### Enlace de ingreso y cómo llega el valor al correo (H-SEG-46, alta)
Un `GET` solo muestra una página con el botón **"Entrar"**; el `POST` consume el enlace. Está **atado al navegador que lo pidió** (cookie `__Host-nav` aleatoria cuya huella se guarda con el enlace). Un filtro de correo que lo abra no lo gasta. Vence a los 15 minutos y es de un solo uso. Otra forma de abrirlo en otro dispositivo: código corto (ADR-09).

**El valor del enlace nace en el trabajador, justo antes de enviarse. Nunca viaja por la cola.** Alternativas consideradas: (a) llevar el valor cifrado en la carga útil con un propósito propio y borrar la carga al terminar; (b) enviar estos correos directamente al proveedor desde la petición. Se descartaron porque (a) obliga a que todo proceso que encola tenga la llave maestra (la consola no debe tenerla, ADR-01), deja texto cifrado en trabajos fallidos, en el registro de escritura previa y en los respaldos, y exige una limpieza que se puede olvidar; y (b) rompe la regla de una sola vía de envío (`enviarCorreo`, ADR-16) y quita los reintentos y la conmutación de proveedor. El flujo elegido:
1. La web llama `enlace_ingreso_crear`: crea la fila en estado `por_emitir` con la huella del navegador y la del código corto (que la web genera y muestra en pantalla) y **encola `correo_acceso` con solo el identificador de esa fila**. Con correo inexistente, la respuesta y el tiempo son los mismos y no se envía nada (D-054.3).
2. El trabajador llama `enlace_ingreso_emitir(id)`: la función comprueba que la fila existe, no venció y no se consumió; el trabajador **genera en memoria** el valor de 256 bits, calcula su huella y la fija con la misma función (si es un reintento, **reemplaza** la huella anterior: solo vale el último correo), y arma el correo con el valor en claro. El valor existe solo en la memoria del trabajador y en el correo.
3. **Sin reintentos después de que el enlace venza** (15 minutos): el manejador de esta plantilla termina el trabajo marcando el envío como "no enviado"; nunca queda un trabajo muerto con carga útil, y aunque quedara, la carga solo trae un identificador.
4. Lo mismo vale para la invitación (la función de plataforma o de administrador crea la fila `por_emitir`; el trabajador emite el valor) y para el acceso de emergencia (ADR-23).

Otros puntos: el mismo contenido y tiempo de respuesta existan o no el correo (D-054.3). La ruta con el valor se redacta en los registros de la aplicación (ADR-20); la página del botón no carga recursos de terceros, lleva `Referrer-Policy: no-referrer` y `Cache-Control: no-store`. **Riesgo residual declarado:** lo que escriba el alojamiento en sus propios registros de acceso puede contener la ruta; es de vida corta (15 minutos), de un solo uso y atado al navegador. Se descartó poner el valor en el fragmento de la dirección (`#...`, que nunca llega al servidor) porque obliga a JavaScript en la página de ingreso y rompe el flujo sin él. El parámetro de regreso tras ingresar **solo acepta rutas internas** (`/e/...`; se rechazan esquemas, `//` y dominios). Al iniciarse una sesión se envía un aviso por correo "se inició sesión" con la hora y el **navegador y sistema** aproximados (sale del agente de usuario; sin IP ni ubicación).

### Segunda verificación propia (aplicación autenticadora, sin SMS)
TOTP con ventana de ±1 paso; el último paso usado se guarda para impedir reutilización; semilla cifrada con llave por usuario (ADR-07) y **no activa hasta que se confirma un código** (una semilla pendiente expira a los 15 minutos). Obligatoria a quien tenga algún permiso sensible, calculado desde el catálogo (ADR-10), no por el nombre del rol. 10 códigos de recuperación de un solo uso: **al menos 100 bits cada uno y huella de nivel B, sin depender de la llave maestra** (ADR-09). TOTP y llaves físicas con librerías mantenidas (la elección la hace Seguridad en la Etapa 1); no se escriben las primitivas.

### Verificación reciente (H-SEG-52) — propuesta, a ratificar por el Gerente
`sesion.verificada_en` se actualiza **solo con el segundo factor** (autenticador o llave física). El enlace de correo deja de servir para reautenticar: sirve solo para el ingreso inicial. Razón: las acciones que exigen verificación reciente (ver claves de licencia, exportar, importar, administrar roles, activar excepciones, cambiar titular de dominio, crear claves de API) son las de quienes ya tienen segunda verificación obligatoria; si un enlace al correo bastara, el control se reduciría al control del buzón y no protegería contra una sesión robada con el buzón comprometido. Hecho que sostiene la regla: todos esos permisos son sensibles en el catálogo (ADR-10), así que todo titular tiene segundo factor; una prueba del catálogo exige que todo permiso con control `R` sea sensible. `exigirVerificacionReciente()` exige ≤ 10 minutos con el reloj de ADR-02. Enmienda **D-048.2** ("enlace nuevo o segundo factor" → "segundo factor"). Costo para el usuario: un código de autenticador cada 10 minutos al hacer una de esas acciones, no un enlace.

### Sesión de plataforma (H-SEG-51)
Tipo de sesión distinto, no intercambiable con la de empresa: `sesion.tipo = 'plataforma'`, cookie `__Host-psid` en la dirección propia de la consola (ADR-01) y valor con huella de nivel B (para que la consola pueda validarla sin la llave maestra).
- **Ingreso solo con llave de seguridad física** (WebAuthn/FIDO2, con verificación de usuario). No hay enlace de correo ni aplicación autenticadora para la consola; el respaldo es una **segunda llave física por persona**, registrada y guardada fuera de línea (la compra ya está escalada en D-048). Si el Gerente prefiere agregar la aplicación autenticadora como respaldo, lo decide por escrito.
- **Vencimientos más cortos:** 15 minutos de inactividad y 4 horas en total (propuesta de Seguridad, adoptada).
- **Verificación reciente con la llave** para cada acción de PS-01 a PS-06 y para iniciar soporte (ADR-03, ADR-23): `verificada_con = 'llave'` en los últimos 10 minutos, comprobado dentro de la función.
- El alta de la primera persona de plataforma y de sus llaves es un procedimiento de DevOps con dos custodios (plan 6.4), no una pantalla; el de las siguientes lo cierra Seguridad con DevOps antes de la Etapa 1.
- **Acceso de emergencia (D-048.6, PS-05):** su tabla y sus funciones están en ADR-23.
- Red restringida: lo fija DevOps en el despliegue de la consola.

### Otros
- **Bloqueo:** 5 intentos fallidos y esperas de 1, 2, 5 y 15 minutos, con el limitador de ADR-16 (que **falla cerrado** para el ingreso). El tope por correo no bloquea al dueño que ya tiene un enlace válido.
- **Auth.js:** el prototipo (H6b) decide, por las razones de arriba. Criterio: si hay que reemplazar **más de dos** de sus piezas (tablas, enlace, sesión) se usa **solo como capa de proveedores** externos (Microsoft/Google, INT-3) y el resto es un módulo propio `nucleo/acceso`. Es una adaptación dentro del stack, no un cambio: si se abandona por completo, lo propone el Arquitecto y lo aprueba la Jefatura (CLAUDE.md). Seguridad prefiere pocas piezas propias: sesión, enlace y código corto viven juntos en `nucleo/acceso`, con su propia prueba exhaustiva.
- Ingreso con proveedor externo (INT-3): se vincula por el identificador inmutable del proveedor, no por el correo (D-054.5). Fuera de la v1. **No es lo mismo** que la sincronización con Microsoft Graph del ADR-21, que no inicia sesiones.

## Consecuencias
- Se construye lo que Auth.js no trae: es trabajo propio de la Etapa 1 y superficie de seguridad nuestra; compensa que se prueba exhaustivamente y no hay contraseñas que filtrar.
- Una consulta más por petición (la validación de sesión), sin caché, a cambio de revocación inmediata.
- Un reintento de correo puede dejar al usuario con dos correos, de los cuales solo sirve el último: se avisa en la pantalla de espera.
- La consola exige llaves físicas desde el primer día de datos reales.

## Qué prueba lo valida
- H6: sesión revocada falla en la petición siguiente; tres `GET` del enlace (simula el filtro de correo) no lo gastan y el `POST` posterior entra; el `POST` desde otro navegador sin cookie falla; TOTP: acepta ±1 paso, rechaza reutilizar el mismo código; semilla sin confirmar no vale; bloqueo 5/1/2/5/15 con reloj fijado; verificación reciente a los 10 minutos con reloj adelantado y **un enlace de correo no la renueva**; atributos de cookie y cabeceras; sesión de plataforma con llave virtual (WebAuthn simulado) y su vencimiento de 15 minutos; una sesión de empresa no sirve en la consola y al revés.
- **Correo de ingreso sin valor en claro en la cola:** se ejecuta el flujo con la cola y se busca el valor en `cola.*` (incluidos trabajos fallidos y reintentados), en todas las tablas y en los registros; el valor sí aparece en el correo capturado (control positivo).
- Respuestas idénticas (contenido y tiempo dentro de un margen) para correo existente e inexistente.
- El parámetro de regreso rechaza `https://otro.com`, `//otro.com` y `javascript:`.
- Criterios CA de la Etapa 1 (RF-ACC-006, 014, 016).

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-46 (alta) | Incorporado con una variante propia: el valor nace en el trabajador y no viaja por la cola; descartadas las opciones (a) y (b) de Seguridad con los hechos de arriba. Seguridad debe confirmar que cumple su criterio. |
| H-SEG-50 | Incorporado: cookies `__Host-`; las cabeceras están en ADR-01. |
| H-SEG-51 | Incorporado: sesión de plataforma, solo llave física, 15 min / 4 h, verificación con llave por acción. Pendiente de cerrar con Seguridad y DevOps: alta de nuevas personas. |
| H-SEG-52 | **Propuesta, a ratificar por el Gerente:** verificación reciente solo con autenticador o llave; enmienda D-048.2. |
| H-SEG-53 | Incorporados (1) aviso de inicio de sesión sin IP, (2) regreso solo a rutas internas, (3) semilla sin confirmar no vale, (4) Auth.js: módulo propio compacto. |
| H-SEG-45 | Códigos de recuperación de 100 bits o más con huella de nivel B (ADR-09). |

# ADR-05 · La empresa activa va en la dirección (T-3)

**Estado:** Propuesto · **Decide:** Gerente de TI · **Base:** D-046, H-ARQ-04, RF-ACC-012

## Contexto
Si la empresa activa vive solo en la sesión, dos pestañas con empresas distintas envían sus acciones a la última elegida: una alta se guardaría en la empresa equivocada.

## Opciones
1. Empresa en la sesión. Descartada (defecto anterior).
2. Empresa en un encabezado o campo oculto que manda el navegador. Descartada: fácil de olvidar y de manipular.
3. **Empresa en la dirección** `/e/{empresa}/...` y verificada en cada petición. Elegida.

## Decisión
- El identificador público es el **`slug`** de la empresa: único, inmutable, legible. Cambiar de empresa es **navegar** a otra dirección; la pantalla anuncia "Ahora trabaja en: [Empresa]".
- **Cada petición** (página, acción o API) llama `abrir_contexto(huella_sesion, slug)` (ADR-04): valida sesión, membresía activa, empresa no suspendida y versión del rol, en una sola llamada. Con el resultado abre `conEmpresa` (ADR-03).
- Una persona que **no es miembro** y un `slug` inexistente responden **igual** ("no encontrado") para no revelar qué empresas existen. El intento deja un evento de seguridad con la empresa **del actor** (D-054.1).
- **Las acciones que cambian datos** pasan por un único envoltorio `accion(slug, permiso, fn)` (manejadores de ruta `/api/e/{slug}/...` o acciones del servidor con `slug` obligatorio): nunca se deduce la empresa de la sesión ni de un campo no verificado.
- La sesión solo recuerda "la última empresa usada" para redirigir desde `/`.
- Contra falsificación de petición: cookie `SameSite=Lax` (atributos completos de las cookies, con el prefijo `__Host-`, en ADR-08), comprobación de `Origin` en toda petición que cambia datos.
- Los enlaces de los correos llevan la empresa (D-046); si la persona no es miembro, "no encontrado".
- El contador de no leídas de otras empresas sale de `resumen_no_leidas`, nunca de recorrer empresas.

## Consecuencias
- Se ajustan RF-ACC-012 y RN-NOT-020 (las edita el Analista, no este ADR).
- Un correo antiguo con empresa a la que ya no se pertenece responde "no encontrado".
- Sin estado de empresa en el servidor: la web escala a varias instancias.

## Qué prueba lo valida
- Dos pestañas con empresas distintas: cada acción cae en la empresa de su dirección.
- Acción con el `slug` de una empresa donde no se es miembro: 404 y nada escrito; el mensaje es idéntico al de un `slug` inexistente.
- Una acción del servidor sin `slug` no compila (tipo) o falla en prueba de arquitectura.
- Dejar de ser miembro corta el acceso en la petición siguiente (sin esperar a que venza la sesión).

## Qué cambió tras la revisión (2026-10-29)
Seguridad aprobó este ADR sin hallazgos. Solo se agregó la referencia a ADR-08 para que los atributos de las cookies (H-SEG-50) vivan en un único lugar. `abrir_contexto(huella_sesion, slug)` ya cumple la regla "credencial, no identificador" (H-SEG-34) y su lectura de `empresa` y `membresia` sin contexto usa la política `TO migraciones` de ADR-03 (D03-2).

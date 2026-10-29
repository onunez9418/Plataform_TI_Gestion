# Revisión de Seguridad · Versión local 0.1 (paquete SEG-1)

**Autor:** Especialista en Seguridad · **Fecha:** 2026-10-29 (hora de Lima) · **Rama:** `claude/gifted-pascal-ptgxae`, commit `c9a2e20`
**Base:** CLAUDE.md, `docs/equipo/plan-etapa-1.md` (A.2, A.3, A.6, A.8), D-118 y D-119 en `docs/equipo/decisiones.md`.
**Pregunta que responde:** ¿la Versión local 0.1 se puede entregar hoy al CEO para que la pruebe **en su computadora y con datos inventados**?

## Veredicto

**CONFORME CON CONDICIONES** para la prueba de hoy del CEO en su computadora, con datos inventados.

No hay hallazgos críticos. Hay **un hallazgo alto (H-SEG-L01)**, que **no afecta la prueba de hoy** (con `docker-compose.yml` la base es de verdad interna), pero **impide cualquier uso fuera de la computadora local** hasta que se corrija. Las condiciones están al final.

## Cómo se revisó (hechos, no opiniones)

- Se levantó un PostgreSQL 16 propio y temporal (127.0.0.1, puerto 54391, contraseñas aleatorias). Se crearon los roles con `scripts/db-init/roles.psql` y se aplicaron las migraciones 0001 a 0005 con el rol `migraciones` y la semilla (`prisma/semilla/index.ts`).
- Se compiló la aplicación (`next build`) y se arrancó con `next start` en 127.0.0.1:3391 con `MODO_LOCAL=1`. Los ataques HTTP se hicieron llamando a las **acciones de servidor directamente**, sin navegador, como lo haría un atacante: se usaron los identificadores de acción del manifiesto compilado y se armaron los cuerpos y las cabeceras a mano.
- Los ataques a la base se hicieron con `psql` conectado como `app_empresa`, el rol que usa la aplicación.
- Al terminar se apagó todo y se borraron la base temporal y el archivo con las contraseñas.
- Los guiones de ataque quedaron en la carpeta de trabajo temporal (`t1.mjs`, `t2.mjs`, `t3.mjs`, `ataque1.sql`, `guarda.ts`). No están en el repositorio.

---

## Hallazgos

| ID | Gravedad | ¿Afecta la prueba de hoy? | Tema | Corrige |
|---|---|---|---|---|
| H-SEG-L01 | **Alta** | No | La guarda de `MODO_LOCAL` se puede saltar | Backend A |
| H-SEG-L02 | Media | Muy poco (datos inventados) | Sin control de la cabecera Host: un sitio malicioso puede manejar la app local («DNS rebinding») | Backend A + DevOps |
| H-SEG-L03 | Media | No (equivale a lo que ya permite el modo local) | Invitar un correo que ya existe en otra empresa entrega un enlace para entrar como esa persona | Backend A |
| H-SEG-L04 | Baja | No | Faltan las cabeceras de seguridad básicas (incluida la protección contra marcos o «clickjacking») | DevOps |
| H-SEG-L05 | Baja | No | Dependencias con avisos conocidos: todos en herramientas de compilación o de pruebas | DevOps |
| H-SEG-L06 | Baja | No | La semilla guarda en la auditoría el nombre de una persona | Ingeniero de Datos |
| H-SEG-L07 | Baja | No | Campos de texto libre que van a la auditoría sin filtro (contacto del proveedor, motivo) | Backend A y B + Cumplimiento |
| H-SEG-L08 | Baja (informativo) | No | La seguridad por fila no protege si alguien logra ejecutar SQL como `app_empresa`; riesgo real de `mis_empresas` | Datos + Arquitecto (Etapa 1) |
| H-SEG-L09 | Baja | No | Sin límite de intentos al pedir enlaces; un ingreso nuevo no cierra la sesión anterior | Backend A |
| H-SEG-L10 | Baja (informativo) | No | El inicio muestra los usuarios de ejemplo sin depender de `MODO_LOCAL`; `AUTH_SECRET` no se usa | Frontend / DevOps |
| H-SEG-L11 | Informativo | No | La búsqueda de secretos marca un falso positivo que rompe `npm run verificar` | DevOps |
| H-SEG-L12 | Informativo | No | Los errores inesperados de las acciones no se registran en ningún lado | Frontend |

### H-SEG-L01 · Alta · La guarda de `MODO_LOCAL` se puede saltar

- **Qué es.** La guarda que debe impedir arrancar con el enlace en pantalla fuera de la computadora local tiene cuatro huecos:
  - (a) Solo mira el nombre de máquina de la dirección de la base. Si esa dirección trae un parámetro `?host=`, el controlador `pg` se conecta a lo que dice el parámetro, y la guarda no lo ve.
  - (b) Considera «interno» cualquier nombre sin puntos. Así pasan nombres típicos de servicios en la nube (`prod-db`, `dpg-abc123-a` de Render, un servicio de Kubernetes) y direcciones IP escritas en hexadecimal (`0x0a000005`).
  - (c) Si faltan `APP_URL` y `ENTORNO`, no hay segunda barrera. `NODE_ENV` no se mira, a propósito.
  - (d) No revisa `PGHOST` ni `PLATFORM_DATABASE_URL`.
- **Dónde.** `src/nucleo/configuracion/modo-local.ts`: líneas 15-21 (`esAnfitrionLocalOInterno`), 39-46 (solo tres variables, solo el nombre de máquina) y 51-56 (`APP_URL` opcional).
- **Hecho (reproducido con la función real).** Con `MODO_LOCAL=1`, los casos siguientes devolvieron «arranca con enlace en pantalla»:
  - `DATABASE_URL=postgres://u:p@localhost/x?host=db.externa.com` (se comprobó que `pg-connection-string` resuelve el host a `db.externa.com`);
  - `postgres://u:p@prod-db:5432/x`;
  - `postgres://u:p@dpg-abc123-a/x`;
  - `postgres://u:p@0x0a000005/x`;
  - `?host=/cloudsql/...`;
  - `PGHOST=db.externa.com` con `DATABASE_URL` local;
  - `PLATFORM_DATABASE_URL` externa;
  - `ENTORNO=prod`.

  Sí se niegan a arrancar: `db.externa.com` con puntos, `MODO_LOCAL=true` y `MODO_LOCAL=" 1"`.
- **Cómo podría abusarse.** Alguien despliega por error en la nube con `MODO_LOCAL=1`, por ejemplo copiando `docker-compose.yml`, y con una base de nombre interno. Entonces **cualquiera que llegue a la página escribe un correo y entra como esa persona**, sin contraseña ni correo. Es la toma total del acceso.
- **Gravedad.** Alta, porque la consecuencia es total y el error de configuración es verosímil. No afecta la PC del CEO: allí la base es `db` en la red interna de Docker y el puerto 3000 solo escucha en 127.0.0.1.
- **Corrección recomendada.**
  - Usar una lista permitida estricta: `localhost`, `127.0.0.1`, `::1` y el nombre exacto `db`. Nada de «cualquier nombre de un tramo».
  - Rechazar las direcciones con parámetros `host` o `hostaddr` y las que traen varios hosts.
  - Revisar `PGHOST`/`PGHOSTADDR` y **todas** las variables `*_DATABASE_URL`.
  - Hacer **obligatoria** `APP_URL` con nombre de máquina local cuando `MODO_LOCAL=1`.
  - QA agrega estos casos a la prueba de arranque (`pruebas/arranque/`).

### H-SEG-L02 · Media · Sin control de la cabecera Host («DNS rebinding»)

- **Qué es.** La aplicación acepta peticiones con cualquier cabecera `Host`. La protección de Next.js contra peticiones falsificadas compara `Origin` con `Host`. Un sitio malicioso que haga que su propio dominio apunte a 127.0.0.1 («DNS rebinding») envía ambas cabeceras iguales (`malo.example:3000`), y Next.js lo acepta.
- **Dónde.** No existe una comprobación de `Host` (no hay `middleware.ts`). `next.config.mjs` no la configura. `scripts/entrada-contenedor.sh:43` arranca con `-H 0.0.0.0`, lo cual es correcto dentro del contenedor.
- **Hecho (reproducido con curl).**
  - `POST /entrar` con `Host: malo.example:3391`, `Origin: http://malo.example:3391` y la acción `pedirEnlace` responde 200 con el enlace de ingreso de `ceo@demo.local`.
  - La misma petición con `Origin` ajeno y `Host` local responde 500, rechazada. Es decir, el CSRF clásico sí está bloqueado.
- **Cómo podría abusarse.** Mientras la plataforma está encendida, el CEO visita una página preparada. Esa página pide un enlace, lo canjea y lee o modifica los datos de ambas empresas, porque en modo local el enlace aparece en la respuesta. El ataque es dirigido y poco probable, y hoy solo hay datos inventados. Algunos navegadores recientes ponen trabas a esto, pero no se puede contar con ello.
- **Gravedad.** Media en sí misma. Hoy el impacto es casi nulo.
- **Corrección recomendada.** En modo local, rechazar con 403 toda petición cuyo `Host` no sea `localhost:3000` o `127.0.0.1:3000`, con un `middleware.ts` o una comprobación en la entrada. En la nube, configurar la lista de dominios permitidos. Es obligatorio antes de cualquier dato real.

### H-SEG-L03 · Media · Invitar un correo que ya existe entrega un enlace de ingreso de esa persona

- **Qué es.** `invitarUsuario`, si el correo ya existe en la plataforma (por ejemplo, del administrador de Beta), reutiliza ese usuario y emite un enlace de ingreso **para él**. El enlace no está atado a ningún navegador (`navegador_huella` nulo) y en modo local **se muestra a quien invita**.
- **Dónde.** `src/modulos/usuarios/servicios/usuarios.ts:46-52`; `src/nucleo/acceso/emitir.ts:23-30`.
- **Hecho (reproducido).** Como `ceo@demo.local`, administrador de Alfa, se invitó a `admin@beta.local` a Alfa. Luego se canjeó el enlace recibido **desde otro navegador** y se entró a `/e/beta/usuarios` con acceso completo de administrador de Beta. Además:
  - la lista de usuarios de Alfa mostró el nombre que Beta tiene guardado («Administrador de Beta»), no el que escribió quien invitó;
  - quien invita se entera de que ese correo existe en la plataforma.
- **Cómo podría abusarse.** En la 0.1 no agrega nada, porque en modo local cualquiera pide el enlace de cualquier correo. El problema es de diseño y se vuelve una **toma de cuentas entre empresas** si algún día se muestra al administrador «el enlace de invitación para copiarlo», algo que es común pedir.
- **Corrección recomendada.**
  - Si el usuario ya existe: crear solo la membresía y avisarle por su propio canal. **Nunca** emitir un enlace de ingreso para un usuario existente desde una invitación.
  - Los enlaces de invitación solo sirven para cuentas nuevas y nunca se muestran a terceros fuera del modo local.
  - No mostrar en una empresa el nombre que guardó otra. Cada empresa ve su propio nombre para la persona, o solo el correo.

### H-SEG-L04 · Baja · Faltan cabeceras de seguridad

- **Hecho.** Las respuestas solo traen `cache-control`, `content-type`, `vary` y otras de transporte. No hay `X-Frame-Options` ni `Content-Security-Policy: frame-ancestors`, `X-Content-Type-Options`, `Referrer-Policy` ni `Permissions-Policy`. Lo bueno: `poweredByHeader: false` está activo.
- **Riesgo.** Otra página puede incrustar la app local en un marco y engañar al usuario para que pulse botones («clickjacking»). El token del enlace viaja en la dirección (`/entrar/enlace?t=`): sin `Referrer-Policy` podría filtrarse si algún día la página enlaza a sitios externos (hoy no lo hace).
- **Corrección.** Agregar `headers()` en `next.config.mjs` con `X-Frame-Options: DENY`, `frame-ancestors 'none'`, `nosniff`, `Referrer-Policy: no-referrer` y una CSP básica.

### H-SEG-L05 · Baja · Dependencias con avisos conocidos

- **Hecho.** `npm audit` (con red) informa 8 avisos: 2 críticos, 4 altos y 2 moderados. Todos están en herramientas de pruebas o de compilación, nada en lo que atiende las peticiones:
  - `vitest` 3.2.7 → `tinypool` y `@vitest/mocker` (críticos y moderado): solo pruebas.
  - `prisma` 6.19.3 → `@prisma/config` → `deepmerge-ts` (alto): herramienta de línea de comandos.
  - `next` 15.5.28 → `postcss` incluido (altos): procesa solo nuestro CSS al compilar, sin entrada de usuarios.
- **Riesgo.** Bajo para la 0.1. Hay un detalle: la imagen de Docker instala también las dependencias de desarrollo (`Dockerfile:14`, `npm ci` sin `--omit=dev`).
- **Corrección.** Plan de actualización antes de la Etapa 1: `vitest` ≥ 4.1.12, `prisma` 7.x y el parche de `next` cuando exista en la rama 15 (la corrección automática salta a la 16, que rompe compatibilidad). Imagen final con `--omit=dev` en una etapa separada.

### H-SEG-L06 · Baja · La semilla escribe el nombre de una persona en la auditoría

- **Hecho.** Las filas `activo.asignar` de la semilla guardan `{"persona": "Camila Ortiz", ...}`. Viene de `prisma/semilla/index.ts:159`. El servicio real (`src/modulos/inventario/servicios/inventario.ts:122`) lo hace bien: guarda solo `personaId`.
- **Riesgo.** Hoy el nombre es inventado. Pero contradice la regla de la auditoría sin valores personales, y la tabla es de solo agregar: en una base real no se podría borrar.
- **Corrección.** Guardar `personaId` también en la semilla.

### H-SEG-L07 · Baja · Textos libres sin filtro en la auditoría

- **Hecho.** `filtrarCambios` (`src/nucleo/auditoria/campos-personales.ts`) protege `usuario` y `persona`; se verificó que el correo y el nombre del invitado quedan como «cambió». En cambio:
  - `proveedor.contacto` (suele ser el nombre o el teléfono de una persona) se guarda con su valor (`src/modulos/catalogos/servicios/catalogos.ts:30,55`);
  - el `motivo` de rechazo de una orden también es texto libre (`src/modulos/compras/servicios/compras.ts:165`).
- **Corrección.** Agregar `proveedor: ['contacto']` a la lista cerrada. Para el `motivo`, el Auditor de Cumplimiento define la regla (aviso en pantalla o límite).

### H-SEG-L08 · Baja (informativo) · Alcance real de la seguridad por fila y de `mis_empresas`

- **Hecho.** Como `app_empresa`, un `SELECT set_config('app.empresa_id', <otra empresa>, true)` escrito a mano da acceso a la otra empresa. Ese mismo rol:
  - lee **todos** los correos y nombres de `usuario`, de todas las empresas;
  - puede llamar `mis_empresas(<cualquier usuario>)`: se probó y devolvió las empresas de los seis usuarios;
  - puede llamar `siguiente(<otra empresa>, ...)` fuera de una transacción y aumentar un contador ajeno. Solo afecta la integridad; no lee nada.
- **Riesgo real de `mis_empresas`.** No agrega riesgo. Quien logra ejecutar SQL como `app_empresa` (por inyección o con el código comprometido) ya puede fijar cualquier empresa y leer todo. La seguridad por fila de la 0.1 protege contra el **olvido de un filtro en el código**, que es su objetivo (ADR-03), y no contra el código comprometido.
- **Inyección SQL.** No se encontró ningún punto de entrada:
  - todo el SQL lleva marcadores `$n`;
  - el único SQL armado con texto (`src/modulos/catalogos/repos/catalogos.ts`) usa nombres de tabla y columna de una lista fija del código;
  - `validarSql` rechaza `set_config`, `SET`, sentencias múltiples y comentarios;
  - `set_config` aparece una sola vez en el código de la aplicación (`src/nucleo/aislamiento/index.ts:126`).
- **Corrección (Etapa 1, ADR-04 completo).** Contexto de empresa firmado o validado en la base, `mis_empresas` atada a la huella de la sesión, y una vista restringida de `usuario` en lugar del SELECT sobre la tabla completa.

### H-SEG-L09 · Baja · Límite de intentos y sesiones previas

- **Hecho.**
  - `solicitarEnlace` no limita intentos. Cada pedido con un correo válido inserta una fila en `enlace_ingreso` y nada limpia las vencidas.
  - Al canjear un enlace se crea una sesión nueva sin revocar la que ya tenía ese navegador (`src/nucleo/acceso/servicios.ts:41-80`).
- **Riesgo.** En modo local es irrelevante. Antes de producción permitiría llenar la base y gastar correos.
- **Corrección.** Límite por correo y por dirección de origen (D-054), limpieza periódica, y revocar la sesión anterior del navegador al canjear.

### H-SEG-L10 · Baja (informativo) · Restos del modo local

- `src/app/page.tsx:8-15` muestra siempre la tabla de usuarios de ejemplo; no depende de `MODO_LOCAL`. Fuera de local debe desaparecer.
- `AUTH_SECRET` se genera en `.env` y se pasa al contenedor, pero ningún archivo de `src/` lo usa. No es un riesgo; conviene no pasarlo si no se usa.

### H-SEG-L11 · Informativo · Falso positivo en la búsqueda de secretos

- `node scripts/buscar-secretos.mjs` marca `scripts/probar-arranque-limpio.sh:69`, una URL de prueba con la contraseña inventada `x12345678`, y termina con error. Eso hace fallar `npm run verificar`.
- No es un secreto real. Hay que usar el marcador reconocido (`cambiar-esto`) para que la revisión automática siga sirviendo.

### H-SEG-L12 · Informativo · Errores inesperados sin registro

- `src/app/_lib/resultado.ts` (`aErrorPantalla`) convierte cualquier error inesperado en un mensaje genérico. Eso está bien: no filtra detalles. Pero **no lo registra en ningún lado**, así que un fallo real en la demo no deja rastro para diagnosticarlo.
- Corrección: registrar el error del lado del servidor sin datos personales, igual que ya hace `comoResultado` en `src/nucleo/errores.ts:54`.

---

## Lo que resistió las pruebas (hechos verificados)

**Aislamiento por empresa (base de datos)**
- Las **20 tablas de empresa** tienen `ENABLE` y `FORCE ROW LEVEL SECURITY` y una sola política `aislamiento_empresa`. Las únicas tablas sin seguridad por fila son las globales de la lista cerrada (`empresa`, `usuario`, `sesion`, `enlace_ingreso`) y dos técnicas sin datos de negocio (`catalogo_aislamiento` y `_prisma_migrations`; `app_empresa` no tiene permisos sobre la segunda).
- Roles: ninguno tiene superusuario, `BYPASSRLS`, `CREATEROLE` ni `CREATEDB`. El dueño de todo es `migraciones`. `app_empresa` no puede crear tablas, funciones ni tablas temporales, ni leer `pg_authid` o archivos del servidor.
- Como `app_empresa`:
  - sin empresa fijada: **0 filas** y sin error;
  - insertar con la empresa ajena: rechazado;
  - clave foránea cruzada: rechazada;
  - UPDATE sobre la otra empresa: 0 filas;
  - cambiar el `empresa_id` de una fila: rechazado por el disparador;
  - auditoría: UPDATE, DELETE y TRUNCATE rechazados (falta de permiso más disparador).
- `SECURITY DEFINER`: solo `mis_empresas`, con `search_path` fijo, dueño `migraciones` y `EXECUTE` solo para `app_empresa`.
- `siguiente()` dentro de una transacción de otra empresa: rechazado. Fuera de transacción no deja la empresa fijada (la corrección de la migración 0005 funciona).

**Acceso**
- El token de ingreso es de 256 bits y en la base solo se guarda su huella SHA-256.
- El enlace vence a los 15 minutos y es **de un solo uso**: el segundo canje dio `ENLACE_INVALIDO`.
- Está **atado al navegador**: el canje desde otro navegador dio `ENLACE_INVALIDO`.
- **Abrirlo con GET no lo gasta**. El canje es solo por la acción POST.
- Sesión: se guarda solo su huella; dura 12 horas como máximo y se corta tras 30 minutos sin actividad. Se **valida en cada petición** contra la base.
- **Cerrar sesión la revoca**: la cookie copiada antes de salir ya no entra.
- Cookies `HttpOnly` y `SameSite=Lax`. Fuera de local llevan `Secure` y el prefijo `__Host-`, porque el código usa `secure = !modoLocalSolicitado()` (`src/nucleo/acceso/cookies.ts:47`).
- Cada canje emite un token nuevo, así que no hay fijación de sesión.
- Pedir un enlace con un correo inexistente da la misma respuesta que con uno existente (enlace señuelo).

**Permisos en el servidor y acceso entre empresas (IDOR)**
- Con sesión de Alfa y los identificadores **reales de Beta**, todas las acciones dieron `NO_ENCONTRADO` sin tocar nada: asignar activo, asignar a una persona, editar ubicación, cambiar rol (usuario y rol), suspender, registrar con un SKU de Beta, invitar con un rol de Beta. El detalle del activo de Beta abierto desde `/e/alfa/...` muestra «no encontrado».
- Administrador de Beta llamando la acción con `empresa='alfa'`, y una llamada sin sesión: `SIN_ACCESO`.
- Usuario «Consulta» que crea algo, y «Técnico» que crea un rol o aprueba: `SIN_PERMISO`.
- Consulta abriendo auditoría, usuarios o roles: «sin permiso».
- Identificadores con forma de inyección: `VALIDACION`. Permiso inventado: rechazado.
- Todo servicio pasa por `definirServicio`. Las acciones solo arman la entrada y llaman al servicio con `obtenerContexto`, que comprueba la sesión, la empresa activa y la membresía activa.

**Entradas y navegador**
- XSS: una ubicación llamada `<img src=x onerror=alert(1)><script>…` se guarda tal cual y se muestra **escapada** en la lista y en la auditoría.
- Los únicos `dangerouslySetInnerHTML` son textos fijos del código (iconos y el guion del tema).
- CSRF: una acción con `Origin` ajeno se rechaza (500). Más `SameSite=Lax`.

**Secretos y arranque**
- No hay secretos en el repositorio. `.env` está ignorado por git y por `.dockerignore`, y nunca se subió (historial revisado).
- `.env.example` solo tiene `cambiar-esto`. Las contraseñas son aleatorias (24 bytes) y se crean en la PC del CEO. `roles.psql` las pasa con comillas seguras (`%L`).
- `docker-compose.yml`: la base **no publica** su puerto y la aplicación publica **solo en `127.0.0.1:3000`**. La aplicación ya arrancada no recibe las claves de los roles dueño, plataforma y lector (`exec env -u …`). El contenedor corre como el usuario `node`.
- La guarda corre dos veces al arrancar (`scripts/entrada-contenedor.sh:12` y `src/instrumentation.ts`, que termina el proceso si falla) y además en cada uso (`modoLocalActivo`). Su lógica es incompleta (ver H-SEG-L01), pero **falla cerrada** cuando detecta algo.

## Condiciones para «conforme»

1. **Hoy:** se entrega **solo** con `iniciar.bat`/`docker-compose.yml` tal como están (base `db` interna, puerto en 127.0.0.1) y **solo con datos inventados**. Recomendación práctica al CEO: mientras la plataforma esté encendida, no navegar por sitios desconocidos en esa computadora (por H-SEG-L02).
2. **Antes de cualquier entorno fuera de la PC local** (nube, servidor compartido, otra red): H-SEG-L01 y H-SEG-L02 corregidos y con prueba, y H-SEG-L03 corregido.
3. **Antes de la Etapa 1 formal:** H-SEG-L04 a H-SEG-L09 en el plan con dueño. H-SEG-L08 se resuelve con ADR-04 completo.

## Fuera de revisión por tiempo (rotulado «sin revisar»)

- Revisión línea por línea de los servicios de compras, inventario, categorías y SKU. Se probaron por fuera: permisos, IDOR y XSS. No se revisaron las reglas de negocio internas, como la recepción parcial o las carreras de concurrencia en contadores y recepciones.
- Prueba en Windows real con Docker Desktop (nadie del equipo tiene Windows; ver A.3). No se levantó el `docker compose` completo. Se verificó por lectura y con la base y la aplicación equivalentes en Linux.
- Carga de archivos Excel/CSV: no existe en la 0.1.
- Pruebas de denegación de servicio y de tiempos de respuesta (posible enumeración por diferencia de tiempo).
- Comportamiento real de los navegadores ante «DNS rebinding»: se simuló con cabeceras, no con un navegador.

## Incidente de trabajo (para la Jefatura)

La carpeta de trabajo temporal es **compartida** entre los agentes de esta sesión. Sin darme cuenta copié el repositorio y recompilé (`next build`) en `…/scratchpad/app`, que ya usaba otro agente. Su servidor de prueba en 127.0.0.1:3377 apunta a esa carpeta y sobrescribí su `app.log`. Su servidor seguía respondiendo (`/api/salud` 200). El código copiado es el mismo commit de la rama. No toqué su base (puerto 54377) ni su proceso. Si ese agente ve fallos raros en sus capturas, conviene que recompile.

---

## Nota para la Jefatura de Proyecto

**Qué hice:**
- Revisé SEG-1 completo: aislamiento, acceso, guarda de `MODO_LOCAL`, permisos en el servidor, auditoría, secretos, dependencias, XSS y CSRF.
- Probé ataques reales contra mi propia base PostgreSQL 16 y contra la aplicación compilada, y apagué todo al terminar.
- El único archivo que escribí es este informe.

**Hallazgos por gravedad:**
- **Alta:** H-SEG-L01, la guarda de `MODO_LOCAL` se puede saltar. Corrige Backend A.
- **Media:**
  - H-SEG-L02: falta control de la cabecera Host («DNS rebinding»). Corrigen Backend A y DevOps.
  - H-SEG-L03: invitar un correo que ya existe entrega un enlace para entrar como esa persona. Corrige Backend A.
- **Baja:**
  - H-SEG-L04, cabeceras de seguridad (DevOps).
  - H-SEG-L05, dependencias de compilación y pruebas (DevOps).
  - H-SEG-L06, nombre de una persona en la auditoría de la semilla (Datos).
  - H-SEG-L07, textos libres en la auditoría (Backend y Cumplimiento).
  - H-SEG-L08, alcance de la seguridad por fila (Datos y Arquitecto, Etapa 1).
  - H-SEG-L09, límite de intentos y sesiones previas (Backend A).
  - H-SEG-L10, restos del modo local (Frontend y DevOps).
- **Informativos:** H-SEG-L11, falso positivo que rompe `npm run verificar` (DevOps), y H-SEG-L12, errores sin registro (Frontend).
- No hay críticos.

**Veredicto:** **conforme con condiciones; se puede liberar para que el CEO la pruebe hoy en su computadora con datos inventados.**
- **Por qué:** el aislamiento entre empresas y los permisos en el servidor resistieron todos los ataques. El alto (H-SEG-L01) solo se activa con un despliegue fuera de la PC local, que hoy no existe.
- **Condición:** **no se puede liberar fuera de la computadora local** hasta cerrar H-SEG-L01, H-SEG-L02 y H-SEG-L03.

**Dudas:** ninguna que bloquee.

**Qué sigue:**
- Backend A corrige L01 y L03.
- DevOps corrige L04, L11 y la parte de L02.
- QA agrega a `pruebas/arranque/` los casos de la guarda de L01.
- Vuelvo a revisar esas correcciones antes de cualquier entorno no local.

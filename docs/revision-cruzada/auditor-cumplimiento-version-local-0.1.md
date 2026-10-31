# Auditoría de Cumplimiento y Privacidad · Versión local 0.1 (encargo AUD-2)

**Autor:** Auditor de Cumplimiento y Privacidad (independiente; no corrige) · **Fecha:** 2026-10-31
**Base:** `CLAUDE.md`, `docs/equipo/plan-etapa-1.md` (A.2, A.3, A.8), `docs/equipo/decisiones.md` D-118 y D-119, `docs/revision-cruzada/seguridad-version-local-0.1.md` (para no duplicar).
**Pregunta:** ¿se puede entregar HOY la Versión local 0.1 al CEO, en su computadora, con datos inventados, desde el punto de vista de privacidad, trazabilidad y límites legales?

**Cómo se revisó.** Lectura y búsqueda (Grep/Read) sobre el repositorio. **No se ejecutaron las pruebas ni se levantó la aplicación** (esta sesión no tiene terminal). Donde digo «la prueba verifica X» significa «el código de la prueba, leído, verifica X»; no que yo la haya visto pasar. Distingo HECHO (demostrado con archivo y línea) de OPINIÓN. Lo legal queda para el abogado (diferido por D-118); no emito opinión legal.

---

## Veredicto

**CONFORME CON CONDICIONES** para entregar HOY como versión local de prueba con datos inventados.

No hay hallazgos críticos ni altos. Los dos hallazgos medios no son bloqueantes para una prueba local con datos inventados, pero deben **decirse al CEO** (C-1) y registrarse como pendientes antes de datos reales. Esta conformidad **no** cubre datos reales: para eso siguen vigentes D-064 y el hito «Lista para datos reales» (D-118).

### Condiciones para entregar hoy
- **C-1 (decir, no corregir):** la Jefatura informa al CEO, en una frase, que en esta versión la persona con rol Administrador puede aprobar y también recibir la misma orden de compra (H-CUM-01), aunque el documento funcional lo prohíbe. Se corrige antes de cerrar la Etapa 5.
- **C-2 (texto de la guía):** agregar a `LEEME-PROBAR.md` (Paso 7, punto 2) que, al invitar usuarios o crear personas, use solo correos inventados que terminen en `.local` (H-CUM-03). Es un cambio de una línea; si no llega a tiempo, la Jefatura lo dice de palabra.
- **C-3 (rótulo):** que la entrega diga cuáles revisiones están hechas. La guía ya promete que la Jefatura lo dirá (`LEEME-PROBAR.md:9`); esta auditoría cuenta como «Cumplimiento: conforme con condiciones».

---

## Resumen por gravedad

| ID | Gravedad | Tema | ¿Bloquea la entrega de hoy? |
|---|---|---|---|
| H-CUM-01 | Media | La recepción no comprueba que quien recibe no haya aprobado la orden (RF-OC-024, RN-010, CA-013) | No (decirlo, C-1) |
| H-CUM-02 | Media | La auditoría guarda sin filtro el «contacto» del proveedor y el «motivo» de rechazo (texto libre con posibles datos personales) | No |
| H-CUM-03 | Baja | Nada impide escribir correos o nombres reales en usuarios/personas; la guía no lo pide explícitamente en el paso de invitar | No (C-2) |
| H-CUM-04 | Baja | Los errores inesperados se escriben completos en el registro del servidor (`console.error(..., e)`) y pueden incluir valores personales | No |
| H-CUM-05 | Baja | Inicio de sesión, enlaces pedidos y sesiones no dejan registro de auditoría | No |
| H-CUM-06 | Baja | Retención: sesiones y enlaces vencidos no se limpian; los datos viven en un volumen de Docker hasta que alguien lo borra; la guía no dice cómo eliminarlo al terminar | No |
| H-CUM-07 | Baja | Las pruebas de interruptores solo escanean `src/` (no `scripts/`, `prisma/`, compose) y comprueban ausencia con expresiones regulares | No |
| H-CUM-08 | Informativo | Dominios de ejemplo no reservados en prototipo y pruebas (`ejemplo.pe`, `x.com`, `a.com`, etc.); `.local` no es dominio reservado para ejemplos | No |
| H-CUM-09 | Informativo | `reiniciar-datos.bat` borra todo, incluida la auditoría (herramienta de prueba, fuera de la aplicación) | No |

---

## 1. Los seis interruptores `legal.*` (D-118, A.8.5)

**HECHOS verificados**
- Están los seis y solo seis, con los nombres exactos de D-118: `src/nucleo/configuracion/interruptores-legales.ts:5-12` (`borrado_automatico`, `anonimizacion`, `purga_auditoria`, `asistente_texto_libre`, `asistente_con_datos_reales`, `envio_a_proveedores_con_datos_reales`).
- Nacen apagados: `interruptores-legales.ts:16-23` son constantes `false`, el objeto está congelado (`Object.freeze`) y `interruptoresLegales()` devuelve una copia.
- Nada los enciende: el valor no se lee de variables de entorno, ni de la base, ni de la pantalla (cabecera del archivo, líneas 1-3). En `src/` no hay ninguna otra mención de `legal.` fuera de `nucleo/configuracion` y `nucleo/auditoria/campos-personales` (búsqueda `legal\.` sobre `src`: solo archivos de configuración y su prueba).
- Hay prueba de cada uno, en dos lugares:
  - `pruebas/arranque/interruptores-legales.test.ts:39-87`: una prueba por interruptor (apagado + intento de encenderlo con 6 variantes de variable de entorno + que la conducta que gobierna no exista en el código). Ejemplos: ningún `DELETE FROM`/`TRUNCATE`/`cron`/`setInterval` fuera de lo permitido (borrado); ninguna palabra `anonimiz` en el código (anonimización); ningún `UPDATE/DELETE/TRUNCATE/DROP` sobre `auditoria` (purga); sin dependencias de IA en `package.json` y sin palabra `asistente` (texto libre); ninguna ruta en `src/app/api/` salvo `/api/salud` (asistente con datos reales); ningún `fetch`, `axios`, `node:https`, `nodemailer`, `resend`, `sendgrid`, `postmark`, `smtp` (envío a proveedores).
  - `src/nucleo/configuracion/configuracion.test.ts:9-30`: son exactamente seis, cada uno `false`, y ninguna variable de entorno los enciende.
- Confirmación independiente de que las conductas no existen: no hay dependencias de IA ni de correo en `package.json` (solo `@prisma/client`, `next`, `pg`, `react`, `react-dom`); `src/app/api/` solo contiene `salud/route.ts`, que devuelve `{estado, servicio, version}` sin tocar la base; no hay URL externa ni `fetch` en `src/` fuera de pruebas; las variables `EMAIL_*`, `MASTER_ENCRYPTION_KEY` y similares de `.env.example` no las lee ningún archivo de `src/`, `scripts/`, `prisma/` ni el compose.

**OPINIONES / observaciones**
- (Informativo) Hoy «apagado» equivale a «la función no existe»: ningún código consulta los interruptores (`interruptorLegalActivo` no se usa en `src/`). Es la forma más segura posible, pero la frase de D-118 «apagados, la función no actúa» solo tendrá contenido real cuando alguna función se construya detrás de un interruptor. Entonces QA debe agregar la prueba de comportamiento (apagado = no actúa), no solo la de ausencia.
- Ver H-CUM-07 sobre el alcance de las pruebas.

**Conclusión del punto 1:** conforme.

## 2. Datos personales reales o correos reales en semilla y repositorio

**HECHOS verificados**
- Semilla (`prisma/semilla/datos.ts`, `ids.ts`, `index.ts`): todos los correos de personas terminan en `@alfa.local` o `@beta.local`; los contactos de proveedores en `@tecnosur.local`, `@andinos.local`, `@compuventa.local`, `@insumosur.local`; los seis usuarios de ingreso en `@demo.local`, `@alfa.local`, `@beta.local` (tabla de `LEEME-PROBAR.md:51-58` y `src/app/page.tsx:10-15`). Los proveedores se llaman «… Ficticia», «… de Prueba», «… Demo» y su documento es `DEMO-0001` a `DEMO-0004` (no son RUC). No hay teléfonos ni documentos de identidad en la semilla. La cabecera de `datos.ts` lo declara y `index.ts:169` cierra con «Solo datos inventados: no uses esta base con información real».
- Búsqueda de correos en todo el repositorio (excluyendo `.git` y `node_modules`) con dominios comunes (`com, org, net, pe, io, es, …`): solo aparecen direcciones de relleno obvias en pruebas (`x@evil.com`, `p@prod.ejemplo.com`, `a.com`, `b@c.com`), en el prototipo (`@ejemplo.pe`: `docs/prototipo/assets/datos.js` y `pantallas-*.js`) y en ejemplos de documentos (`ana@x.com`, `gerente@empresa.com`, `ana.ruiz@miempresa.com`). Ninguna es de una persona identificable.
- Búsqueda de Gmail/Hotmail/Outlook/Yahoo y del correo de la persona usuaria de esta sesión: solo menciones en texto sobre pruebas de entrega a esos servicios (`docs/operaciones/plan-entornos-y-costos.md`) y `.github/CODEOWNERS` con el nombre de usuario de GitHub del dueño del repositorio (`@onunez9418`). No hay correos personales.
- Búsqueda de números de 11 dígitos / celulares / `+51`: solo RUC de relleno obvios (`20100000001`, `20100000011`…) en pruebas y prototipo.
- No hay carpeta de «documentos reales» del CEO en el repositorio: `docs/` contiene `documento-funcional.md`, `registro-permisos.md`, `trazabilidad.md` y subcarpetas del equipo. `puerta-etapa-0.md:30` confirma que se programa sin los documentos reales. `.gitignore` bloquea `.env*`, claves, hojas de cálculo, `*.dump`, `backups/`, `datos-reales/`, y `.local/`.
- `docker-compose.yml` y `Dockerfile` no contienen contraseñas; `.env` lo genera `iniciar.bat` con valores aleatorios (`scripts/crear-env.ps1`) y está en `.gitignore`. `.env.example` solo tiene `cambiar-esto`.
- Las personas de la semilla son nombres ficticios comunes (Lucía Paredes, Marco Salazar…); no puedo descartar que coincidan con personas reales (es normal con nombres comunes). OPINIÓN: riesgo nulo en un entorno local sin datos reales.

**Observaciones**
- (Baja) En el espacio de trabajo existen un `.env` y un `.local/ejecucion-frontend/` (con otro `.env`). Ambos están ignorados por Git (`.gitignore`: `.env`, `.local/`), así que no van al repositorio. **Riesgo operativo:** si la Jefatura enviara al CEO un ZIP armado desde la carpeta de trabajo (la guía lo prevé en el Paso 3.1), esos archivos viajarían con él. Recomendación: generar el ZIP con `git archive` o desde el botón «Download ZIP» del repositorio, no comprimiendo la carpeta.
- Ver H-CUM-08 (dominios de ejemplo no reservados).

**Conclusión del punto 2:** conforme.

## 3. Auditoría: quién, qué, cuándo, solo agregar, sin valores personales (D-030)

**HECHOS verificados**
- **Quién / cuándo / qué:** la tabla `auditoria` (`prisma/migrations/0001_base_acceso/migration.sql:306-320`) guarda `autor_membresia_id`, `accion`, `entidad_tipo`, `entidad_id`, `cambios` (jsonb), `motivo`, `creado_en` (por omisión `now()` en la base, no en la aplicación). La pantalla muestra el nombre del autor leyéndolo al consultar (`src/nucleo/auditoria/listar.ts:32-34`), no lo copia a la auditoría.
- **Solo agregar, a nivel de base y no solo de pantalla:** `SELECT aplicar_aislamiento('auditoria', p_solo_agregar => true)` (migración línea 324). Esa función da a `app_empresa` solo `SELECT, INSERT` y crea disparadores que bloquean `UPDATE`, `DELETE` y `TRUNCATE` (líneas 181-184). El código de la aplicación solo hace `INSERT` (`src/nucleo/auditoria/registrar.ts:20-32`; el único otro `INSERT INTO auditoria` fuera de pruebas es la semilla, `prisma/semilla/index.ts:44`). La prueba `pruebas/aislamiento/base-real.test.ts` cubre la inserción y la seguridad por fila de la auditoría; el informe de Seguridad reporta como reproducido que `UPDATE`, `DELETE` y `TRUNCATE` son rechazados (`seguridad-version-local-0.1.md`, sección «Lo que resistió»).
- **Misma transacción que el cambio:** todos los servicios llaman `registrarAuditoria(tx, ctx, …)` dentro de `conEmpresa`; si falla la escritura, falla el cambio.
- **Acciones sensibles cubiertas:** crear/editar rol (con permisos antes/después), invitar usuario, cambiar rol, suspender y reactivar, crear/editar ubicación, proveedor y persona, crear categoría y agregar campo, crear SKU, registrar activos y existencias, asignar y devolver, y en compras crear, enviar a aprobación, aprobar, rechazar y recibir. Los cambios de permisos de rol y de rol de usuario quedan con valor «antes» y «después».
- **Filtro de datos personales (ADR-11):** `src/nucleo/auditoria/campos-personales.ts` reemplaza por «cambió» los campos personales de `usuario` (`correo`, `nombre`) y `persona` (`nombre`, `correo`, `area`, `telefono`, `codigo_empleado`). Verificado en el código de los servicios: `usuario.invitar` guarda `{correo, nombre, rol}` pero el filtro deja `correo: cambió`, `nombre: cambió` y solo conserva el nombre del rol (`usuarios.ts:59-64`); `persona.crear/editar` pasa por `registrarAuditoria` con `entidadTipo: 'persona'`, así que se filtra (`catalogos.ts:30,55`).
- **Asignaciones:** `activo.asignar` y `activo.devolver` guardan `personaId` (un identificador), no el nombre (`inventario.ts:120-123, 147-150`). La semilla ya no guarda el nombre (H-SEG-L06 de Seguridad quedó corregido: `prisma/semilla/index.ts:159` guarda `personaId`).
- **Qué guardan los servicios en `cambios`/`motivo` (inventario de lo que entra a la auditoría):**

| Servicio | Contenido de `cambios` / `motivo` | ¿Dato personal? |
|---|---|---|
| Roles | nombre del rol, lista de permisos (antes/después) | No |
| Usuarios (invitar, rol, estado) | correo y nombre **filtrados** («cambió»); nombre del rol; estado | No (filtrado) |
| Persona | nombre, correo, área **filtrados** | No (filtrado) |
| Ubicación | nombre, descripción (texto libre) | Improbable |
| **Proveedor** | `nombre`, `documento`, **`contacto` sin filtro** | **Posible** (H-CUM-02) |
| Categoría / SKU | nombre, prefijo, etiquetas de campos, código, control | No |
| Inventario | código de SKU, serie, `ubicacionId`, `personaId`, cantidades | No (la serie es dato del equipo; el `personaId` es un identificador) |
| Compras | número de orden, `proveedorId`, número de recepción, líneas | No |
| **Compras · rechazar** | **`motivo` libre** (hasta `MAX_MOTIVO`) | **Posible** (H-CUM-02) |

**Hallazgos**

### H-CUM-02 · Media · Texto libre sin filtro en la auditoría (proveedor.contacto y motivo de rechazo)
- **Qué es.** `filtrarCambios` solo conoce las entidades `usuario` y `persona`. El campo `contacto` del proveedor (hasta 120 caracteres, normalmente el nombre y/o correo de la persona de contacto) y el `motivo` de rechazo de una orden (texto libre) se escriben tal cual en la auditoría, que es una tabla solo de agregar.
- **Dónde.** `src/nucleo/auditoria/campos-personales.ts:4-7` (lista cerrada sin `proveedor`); `src/modulos/catalogos/servicios/catalogos.ts:14,30,55,111,122` (contacto va a `cambios`); `src/modulos/compras/servicios/compras.ts:156-165` (motivo a `registrarAuditoria`); se muestra en `src/app/e/[empresa]/auditoria/page.tsx:71`. Es el mismo punto que Seguridad reportó como H-SEG-L07; **sigue abierto**.
- **Riesgo.** Con datos reales, un nombre o correo quedaría en un registro que la aplicación no puede borrar ni anonimizar (el interruptor `legal.anonimizacion` está apagado por diseño). Contradice D-030 y la propia nota de `registrar.ts:10-11` («no debe llevar datos personales»), que hoy no se hace cumplir.
- **Gravedad.** Media para datos reales; **sin efecto hoy** (datos inventados).
- **Recomendación (Backend / Ingeniero de Datos).** Agregar `proveedor: ['contacto']` a la lista cerrada; definir la regla del `motivo` (aviso en el formulario «no escriba nombres ni datos de personas», límite de largo, y no copiarlo a la auditoría: ya existe en `orden_aprobacion.motivo`, que también es de solo agregar y tiene el mismo problema, a decidir con el abogado). Antes de datos reales, no antes de hoy.

### H-CUM-04 · Baja · Registro del servidor con errores completos
- **Qué es.** `src/nucleo/errores.ts:54` hace `console.error('Error inesperado en un servicio:', e)` con el error entero. Los errores de PostgreSQL incluyen a veces el valor en conflicto (por ejemplo «Key (correo_norm)=(…) already exists»). `src/app/_lib/resultado.ts:28` en cambio registra solo el tipo y el código técnico (correcto).
- **Riesgo.** Con datos reales, correos o nombres podrían llegar al registro de Docker (`docker compose logs`), que no tiene plazo de conservación definido.
- **Gravedad.** Baja (hoy datos inventados). **Recomendación.** Registrar tipo y código, como hace `resultado.ts`, no el objeto completo (Backend).

### H-CUM-05 · Baja · El inicio de sesión no queda en la auditoría
- **Hecho.** `registrarAuditoria` no se llama en `src/nucleo/acceso/` (ingreso, pedido de enlace, cierre de sesión); `sesion` guarda solo huellas, vencimiento y revocación. Tampoco se registran los intentos rechazados por falta de permiso.
- **Opinión.** No estaba en el alcance de la 0.1 (A.2 M4 pide auditar roles, usuarios y datos de negocio), pero para producción conviene registrar ingresos, ingresos fallidos repetidos y denegaciones. Tema para la Etapa 1 formal (Backend + Seguridad).

**Conclusión del punto 3:** conforme con observaciones (H-CUM-02 es la excepción relevante; las demás son menores).

## 4. Claridad de «datos inventados / NO es para datos reales»

**HECHOS verificados**
- **Guía del CEO:** `LEEME-PROBAR.md:5-9`, recuadro «Importante, léalo primero» antes del primer paso: «Todos los datos… son **inventados**», «**No escriba datos reales** de su empresa ni de sus clientes. Esta versión no está hecha para guardarlos», «Funciona solo en su computadora», «Es un avance… La Jefatura de Proyecto le dirá qué partes ya fueron revisadas y cuáles todavía no». Lenguaje claro y sin jerga. El paso 6 explica que en la versión real el enlace llegará por correo.
- **Franja visible:** `src/componentes/estructura/Franja.tsx:11` muestra «Versión local de prueba: solo datos inventados» en toda pantalla (la incluye el layout raíz, `src/app/layout.tsx:23`); el título de la pestaña también dice «Versión local de prueba» (`layout.tsx:11`).
- **Inicio:** `src/app/page.tsx:43`: «Versión local de prueba. Todo lo que ve son **datos inventados** de dos empresas de ejemplo (Alfa y Beta). No use datos reales.»
- **Arranque:** `iniciar.bat:10-11` imprime «VERSION LOCAL DE PRUEBA / Solo datos inventados. No use datos reales.»; la pantalla de catálogos dice «Personas ficticias en esta prueba» (`src/app/e/[empresa]/catalogos/tipos.ts:38`); los marcadores de los formularios usan `.local` (`FormularioInvitar.tsx:30`, `FormularioEntrar.tsx:21`); la semilla repite el aviso al terminar.
- **«Solo en su computadora»:** `docker-compose.yml:44-45` publica el puerto solo en `127.0.0.1:3000`, la base no publica puerto (línea 20), y la guarda de `MODO_LOCAL` rechaza bases y direcciones no locales (`src/nucleo/configuracion/modo-local.ts`; pruebas en `pruebas/arranque/modo-local.test.ts` y `configuracion.test.ts:32-69`). La afirmación de la guía es coherente con la configuración.

**Observaciones**
- (Baja, OPINIÓN) La franja depende de `MODO_LOCAL=1` (`Franja.tsx:7`), igual que la lista de usuarios de ejemplo. Dentro de Docker siempre es `1`, así que se ve. Si algún día se arrancara sin esa variable, la aplicación no mostraría la franja ni el aviso; no habría forma de entrar (no se emite enlace), así que el riesgo es nulo hoy. Para la Etapa 1 conviene que el aviso no dependa de una sola variable.
- El Paso 7.2 de la guía pide «invite a un usuario» sin decir con qué correo. Ver H-CUM-03.

### H-CUM-03 · Baja · Nada impide guardar nombres o correos reales; la guía no lo pide en el paso de invitar
- **Hecho.** `CORREO_VALIDO` acepta cualquier dominio (`src/modulos/usuarios/servicios/usuarios.ts:14`); personas y proveedores aceptan texto libre. La guía advierte «no escriba datos reales» en general (`LEEME-PROBAR.md:7`), pero el Paso 7.2 no recuerda usar correos `.local`.
- **Riesgo.** Que, por comodidad, el CEO invite su propio correo real. En modo local no se envía nada (ver punto 6), pero el dato quedaría guardado en el volumen de Docker. Riesgo bajo; depende de una persona.
- **Recomendación.** (C-2) Una línea en la guía: «Al invitar, escriba un correo inventado, por ejemplo `prueba1@alfa.local`». Opcional (Etapa 1): en modo local, avisar con un mensaje no bloqueante si el correo no termina en `.local`.

**Conclusión del punto 4:** conforme (con H-CUM-03 como mejora de una línea).

## 5. Lo que depende de la ley: ¿activo o accesible?

**HECHOS verificados (cada uno por búsqueda en `src/`, `scripts/`, `prisma/`, compose)**

| Función | ¿Existe en el código? | ¿Accesible desde pantalla o red? |
|---|---|---|
| Anonimización de personas | No: ninguna aparición de `anonimiz` fuera de la lista de campos personales y su prueba; ningún `UPDATE persona/usuario SET nombre/correo` | No |
| Borrado de personas | No: no hay servicio ni pantalla de borrado. Las personas solo tienen el indicador `activo` (desactivar). Único `DELETE` en `src/`: `rol_permiso` al editar un rol (`roles.ts:43`), con auditoría | No |
| Borrado automático, tareas programadas | No: sin `cron`, `setInterval` ni cola de trabajos (A.2 «NO entra hoy») | No |
| Purga de auditoría | No: la tabla bloquea `DELETE`/`TRUNCATE` por disparador y permisos | No |
| Texto libre del asistente / asistente con datos reales | No: sin dependencias de IA, sin rutas `/api` salvo `/api/salud`, sin la palabra «asistente» en `src/` | No |
| Envío a proveedores externos (IA, Microsoft, correo con datos) | No: sin `fetch`, sin bibliotecas de correo ni de red, sin URL externa en `src/`; la única llamada de red del contenedor es el chequeo de salud a `127.0.0.1` (`docker-compose.yml:47`) | No |
| Correo real | No (punto 6) | No |
| Telemetría | `NEXT_TELEMETRY_DISABLED=1` en `Dockerfile:6` | No |

- Lo único que sale a internet es la descarga de imágenes y dependencias al construir (Docker Hub, npm); no lleva datos de la plataforma. Es lo que la guía declara («solo la primera vez, para descargar»).
- No hay módulos de Fases 2 y 3 (garantías, líneas móviles, onboarding/offboarding con datos personales) en el código; solo en documentación.

### H-CUM-07 · Baja · Alcance y fuerza de las pruebas de los interruptores
- **Hecho.** `pruebas/arranque/interruptores-legales.test.ts:10-18` escanea solo `src/` y solo `*.ts/*.tsx/*.mjs`; las comprobaciones de ausencia son expresiones regulares. No miran `scripts/`, `prisma/` (migraciones, `reiniciar.sql`) ni `docker-compose.yml`. No detectan, por ejemplo, un `deleteMany` de Prisma Client (hoy no se usa Prisma Client en `src/`; verificado) ni un envío de datos desde un script.
- **Riesgo.** Si más adelante alguien agrega una función legalmente sensible fuera de `src/`, las pruebas no la verían.
- **Gravedad.** Baja. **Recomendación (QA).** Ampliar el escaneo a `scripts/` y `prisma/migrations/` y agregar patrones `deleteMany|\.delete\(|\.update\(` de Prisma. Antes de la Etapa 1 formal.

### H-CUM-09 · Informativo · `reiniciar-datos.bat` destruye también la auditoría
- **Hecho.** `reiniciar-datos.bat:34` ejecuta `docker compose down -v` (elimina el volumen completo); `prisma/reiniciar.sql:5` hace `DROP SCHEMA public CASCADE`. La confirmación exige escribir BORRAR.
- **Opinión.** Aceptable y deseado en una prueba con datos inventados (la guía lo presenta así). Pero demuestra que «auditoría de solo agregar» vale para la aplicación, no para quien opera la base. Con datos reales, ese procedimiento no debe existir en el paquete del cliente. No es un hallazgo para hoy.

**Conclusión del punto 5:** conforme. Nada de lo que depende de la ley está activo ni accesible.

## 6. Invitaciones y enlaces: ¿se envía correo real?

**HECHOS verificados**
- No existe ningún código de envío de correo: sin biblioteca de correo en `package.json`, sin `fetch`, sin `smtp`/`resend`/`sendgrid`/`postmark` en `src/` (la prueba `interruptores-legales.test.ts:83-87` lo exige). Las variables `EMAIL_*` de `.env.example` no las usa nadie.
- Pedir enlace: `solicitarEnlace` devuelve `enlaceLocal` solo si `modoLocalActivo()` (`src/nucleo/acceso/servicios.ts:25`, `emitir.ts:26`); el enlace aparece en pantalla (`FormularioEntrar.tsx:24-36`) con el texto «En la versión local no se envía correo».
- Invitar: `invitarUsuario` crea el usuario y la membresía, emite el enlace en pantalla (o un enlace señuelo si el correo ya existía) y no envía nada (`usuarios.ts:58`, `FormularioInvitar.tsx:45`). La corrección de H-SEG-L03 (señuelo) está aplicada.
- Fuera del modo local el enlace no se devuelve (`emitir.ts:26,31`), y la guarda impide arrancar en modo local fuera de la computadora (punto 1 de `modo-local.ts`).
- El token vence a los 15 minutos, es de un solo uso y de la base solo se guarda su huella SHA-256 (Seguridad, «Lo que resistió»).
- Un correo real escrito por error **no recibe nada**: lo máximo es que quede guardado en el volumen local (H-CUM-03).

**Conclusión del punto 6:** conforme.

## 7. Retención y conservación: ¿algo guarda datos más de lo necesario?

**HECHOS**
- Los datos de la prueba viven en el volumen de Docker `datos_pg` (`docker-compose.yml:18,53-54`) y persisten al apagar (`detener.bat`); solo se eliminan con `reiniciar-datos.bat` o `docker compose down -v`. Es lo prometido en la guía («Apagar guarda lo que hizo»).
- No hay plazos de conservación implementados, y es lo esperado por D-118 («conservar, no borrar»). No hay borrado por ninguna vía automática.
- `sesion` y `enlace_ingreso` guardan solo huellas (hash) y fechas, **sin dirección IP ni agente de navegador**. Las filas vencidas o consumidas no se limpian (no hay tarea programada). Seguridad ya lo anotó (H-SEG-L09).
- El límite de intentos se guarda en memoria del proceso con huellas, no en la base (`limite-intentos.ts`); se pierde al reiniciar.
- `restart: unless-stopped` (`docker-compose.yml:8,30`) hace que la plataforma vuelva a encender cuando se abra Docker Desktop, hasta que se use `detener.bat`. Sigue siendo solo `127.0.0.1`.
- Cada petición de ingreso con correo válido crea una fila en `enlace_ingreso`; el volumen crece sin límite si alguien insiste, pero el límite de intentos (5 por correo, 20 por origen cada 10 minutos) lo acota.

### H-CUM-06 · Baja · Retención sin plan y sin salida para el usuario final
- **Qué es.** (a) Sesiones y enlaces vencidos quedan en la base indefinidamente. (b) La guía no explica cómo borrar todo cuando el CEO termine de probar (por ejemplo, desinstalar el volumen): `reiniciar-datos.bat` borra y **vuelve a cargar** la semilla; no hay un «borrar y dejar limpio».
- **Riesgo.** Nulo con datos inventados; con datos reales sería exceso de conservación sin plan.
- **Recomendación.** Antes de datos reales: tarea de limpieza de sesiones y enlaces vencidos con plazo configurable (D-118 pide configurable y prudente) y un procedimiento de baja del entorno local. Para hoy: opcionalmente una línea en la guía («Para quitar todo al terminar, avise a la Jefatura»).

**Conclusión del punto 7:** conforme con observaciones (todas bajas).

---

## Otros puntos de mi rol revisados

### H-CUM-01 · Media · Separación de funciones: quien recibe puede ser quien aprobó
- **Qué es.** El documento funcional exige: «Quien recibe la mercadería no puede haber creado ni aprobado esa orden» (RF-OC-024), RN-010 («quien aprueba no recibe; quien recibe no creó ni aprobó») y CA-013 («cuando X intenta recibir… se rechaza»). El código impone solo la mitad: quien preparó la orden no puede aprobarla (`src/modulos/compras/servicios/compras.ts:134-136`, y la base también). `recibirOrden` (líneas 172-258) no consulta quién preparó ni quién aprobó. La documentación del catálogo lo admite: «La separación de funciones de compras es de la regla, no del rol» (`src/nucleo/permisos/catalogo.ts:76`), pero la regla de recibir no está implementada.
- **Hecho adicional.** El rol de ejemplo `Administrador` tiene todos los permisos, incluidos `ordenes_compra.aprobar` y `recepciones.crear_confirmar`; RF-ROL-009 dice que la separación de funciones también aplica al Administrador. Con la semilla, `ceo@demo.local` puede aprobar una orden preparada por el Técnico y luego recibirla él mismo. Los roles por defecto `Jefatura TI` (aprueba, no recibe) y `Técnico` (prepara y recibe, no aprueba) sí respetan la separación; un rol personalizado o el Administrador, no. Las pruebas de compras (`pruebas/permisos/compras-reglas.test.ts`) cubren «preparador no aprueba» y recepción parcial, pero no «aprobador no recibe».
- **Riesgo.** Control de compras debilitado. En la 0.1 con datos inventados no hay dinero ni daño; pero el CEO puede probar el guion y concluir que la regla está completa cuando no lo está.
- **Gravedad.** Media (incumple una regla de negocio del documento funcional; no afecta datos personales). **No bloquea la entrega de hoy**, siempre que se diga (C-1).
- **Recomendación (Backend B + QA).** En `recibirOrden`, rechazar con `separacionFunciones` si `ctx.usuarioId` coincide con quien preparó o con quien aprobó la orden (consulta a `orden_aprobacion`); prueba CA-013; reflejarlo en la base como ya se hizo con aprobar. El interruptor de excepciones por empresa (CEO) es de una etapa posterior. Mientras tanto, actualizar la guía del CEO: el Paso 7.7 dice «la aprueba otra persona y luego se recibe»; añadir «en esta versión todavía no se impide que quien aprueba también reciba».

### Mínimo privilegio
- **Hechos.** `Consulta` solo tiene permisos de lectura; `Jefatura TI` solo ve y aprueba/emite compras; `Técnico` no tiene permisos de usuarios, roles, auditoría ni aprobación (`catalogo.ts:78-91`). No hay rol ni acceso «por defecto abierto»: no hay ruta pública salvo `/`, `/entrar`, `/entrar/enlace` y `/api/salud`. Un usuario no puede dar un rol con más permisos de los que tiene (`usuarios.ts:43-45, 83-85`) ni cambiarse el rol ni suspenderse a sí mismo (`usuarios.ts:76,118`).
- **Opinión.** `auditoria.ver` solo para Administrador es coherente (es un permiso marcado como sensible).

### Documentación y operación (alcance de hoy)
- **Hechos.** Hay guía para el CEO, `detener.bat` y `reiniciar-datos.bat`. `prisma/LEEME.md` documenta el modelo («Nada se borra… la auditoría solo se agrega»). **Pendiente, no bloqueante hoy:** no existe procedimiento de respaldo y restauración del volumen local ni plan de reversa de este despliegue (no los exige la 0.1; sí D-064 antes de datos reales).

---

## Hechos verificados vs. puntos a confirmar con el área legal

### Hechos verificados (resumen)
1. Seis interruptores `legal.*`, apagados, inmodificables desde el entorno, sin uso en el código, con una prueba por cada uno (leídas, no ejecutadas por mí).
2. No hay datos ni correos reales en semilla, guías o código; solo `.local` y relleno obvio.
3. La auditoría solo se agrega (disparadores y permisos en la base), registra autor, hora, acción y entidad en la misma transacción; filtra nombre y correo de usuarios y personas.
4. La guía, la franja, el inicio, el arranque y los formularios dicen que son datos inventados; la guía dice que no es para datos reales.
5. No existe en el código ninguna función de anonimización, borrado de personas, asistente, envío externo ni correo.
6. No se envía ningún correo; los enlaces aparecen en pantalla solo en modo local.
7. Puerto 3000 solo en `127.0.0.1`; base sin puerto publicado; telemetría de Next.js desactivada.

### Puntos a confirmar con asesoría legal (no son opinión legal; diferido por D-118)
Ninguno bloquea la prueba local de hoy; todos son antes de datos reales u ofrecer la plataforma.
1. **Registro de solo agregar con datos personales:** si la auditoría contiene identificadores de persona (`personaId`, autor), qué plazo de conservación y qué mecanismo de anonimización se necesita, y si basta con que el nombre se lea al consultar (como hoy) para cumplir con el derecho de supresión en la normativa peruana de protección de datos personales y otras donde operen las empresas.
2. **Texto libre** (`proveedor.contacto`, `motivo`, descripciones, campos personalizados): si es dato personal y qué aviso o regla de uso exige el abogado.
3. **Plazos de conservación** de personas desactivadas, historial de asignaciones, sesiones y enlaces (hoy: conservar sin plazo).
4. **Aviso y consentimiento / base legal** para guardar nombre y correo de las personas a quienes se asigna un equipo (trabajadores de varias empresas) y para las empresas que se alojarán en la misma plataforma (relación encargado/responsable), y si debe inscribirse algún banco de datos ante la autoridad.
5. **Transferencia a terceros y fuera del país** cuando se active correo, IA o Microsoft (los interruptores `legal.envio_a_proveedores_con_datos_reales` y `legal.asistente_*`): contratos y país de alojamiento.
6. **Procedimiento ante incidentes** de datos (existe borrador en `docs/operaciones/procedimiento-incidente-datos.md`): validación del plazo y de a quién se notifica.

---

## Nota para la Jefatura de Proyecto

**Qué hice.** Auditoría de cumplimiento y privacidad de la Versión local 0.1 por lectura y búsqueda del repositorio (interruptores, semilla, auditoría, guía, franja, funciones dependientes de la ley, correo, retención) y de las reglas de mínimo privilegio y separación de funciones. No ejecuté pruebas ni la aplicación. **Archivo escrito:** `/home/user/Plataform_TI_Gestion/docs/revision-cruzada/auditor-cumplimiento-version-local-0.1.md`. No toqué código ni otros documentos.

**Veredicto: CONFORME CON CONDICIONES** para entregar HOY como versión local de prueba con datos inventados. No es una conformidad para datos reales.

**Hallazgos por gravedad.**
- Crítica / Alta: ninguno.
- Media: H-CUM-01 (quien aprueba puede también recibir la orden, contra RF-OC-024 / RN-010 / CA-013); H-CUM-02 (contacto del proveedor y motivo de rechazo van sin filtro a la auditoría; es H-SEG-L07, sigue abierto).
- Baja: H-CUM-03 (la guía no pide correos `.local` al invitar), H-CUM-04 (errores completos en el registro del servidor), H-CUM-05 (ingresos no auditados), H-CUM-06 (retención sin plan ni salida para quitar todo), H-CUM-07 (las pruebas de interruptores solo miran `src/`).
- Informativo: H-CUM-08 (dominios de ejemplo no reservados en prototipo/pruebas), H-CUM-09 (`reiniciar-datos.bat` borra también la auditoría; solo para pruebas). Además: un ZIP armado desde la carpeta de trabajo arrastraría `.env` y `.local/`; usar el ZIP del repositorio.

**Condiciones para entregar hoy.** C-1: decir al CEO que en esta versión el Administrador puede aprobar y recibir la misma orden. C-2: una línea en `LEEME-PROBAR.md` pidiendo correos inventados `.local` al invitar. C-3: rotular la entrega con las revisiones hechas (Seguridad: conforme con condiciones; Cumplimiento: conforme con condiciones).

**Puntos a confirmar con legal (antes de datos reales, no hoy).** Conservación y anonimización de la auditoría de solo agregar; texto libre como dato personal; plazos de conservación; aviso y base legal para datos de trabajadores de varias empresas; transferencias a terceros y fuera del país; procedimiento de incidentes.

**Qué sigue.** (1) Backend B + QA: regla «quien recibe no creó ni aprobó» con su prueba CA-013 (antes de cerrar la Etapa 5). (2) Backend + Ingeniero de Datos: `proveedor.contacto` a la lista de campos personales y regla del `motivo`. (3) QA: ampliar las pruebas de interruptores a `scripts/` y `prisma/`. (4) DevOps: procedimiento de respaldo y restauración y plan de reversa del despliegue (obligatorios antes de datos reales). Se avisará al Gerente de TI y a Backend por mensaje.

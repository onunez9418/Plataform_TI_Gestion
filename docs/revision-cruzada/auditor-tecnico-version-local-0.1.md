# Auditoría Técnica · Versión local 0.1 (paquete AUD-1)

**Auditor:** Auditor Técnico (independiente; no escribí este código) · **Commit auditado:** `836d1ce` (rama `claude/gifted-pascal-ptgxae`) · **Contexto:** D-118, D-119, `plan-etapa-1.md` parte A.
**Qué es esta nota:** hechos que abrí o ejecuté yo, separados de opiniones. Lo que no abrí o no pude ejecutar está rotulado «no verificado».

## Veredicto

**CONFORME CON CONDICIONES** para entregar hoy como «versión local de prueba con datos inventados». No encontré nada que contradiga una regla de las que «no se sueltan jamás» (A.9): el aislamiento por empresa, los permisos en el servidor, la auditoría, la guarda de `MODO_LOCAL` y el SQL con parámetros están en el código y en pruebas que pasaron en mi corrida.

**Qué bloquea la entrega hasta aclararse (2 cosas, ambas de verificación, no de diseño):**
1. **B-1 (actualizado tras el mensaje de QA).** El recorrido falló en mi corrida en el paso 7a. QA informa que la causa era un error de su propia prueba (volvía a pulsar un desplegable ya abierto y lo cerraba), ya corregido y commiteado, y que con el arreglo pasan los pasos 1 a 9. **Yo no lo he vuelto a ejecutar**: queda como «declarado por QA, no verificado por el auditor» hasta que alguien repita el recorrido sobre el commit final. Además QA reporta un defecto real de pantalla, DEF-FRO-01 (a veces la lista no se actualiza sola tras registrar o crear un rol; la base sí guarda): puede verse en la demo.
2. **B-2.** La última prueba de arranque desde cero con Docker es del commit `84b75f2`; después entraron el control de `Host`, las cabeceras CSP, el límite de pedidos de enlace y cambios en invitar y semilla. Hay que repetirla sobre el commit final (A.8.1).

**Lo que no bloquea pero hay que decirle al CEO:** la lista de la sección 6 (en especial, que las reglas «quien aprueba/prepara no recibe» no están hechas).

## 1. Cómo audité (hechos)

- Leí: `CLAUDE.md`, `plan-etapa-1.md` (A.2, A.6, A.8), D-118/D-119, `LEEME-PROBAR.md`, `iniciar.bat`, `detener.bat`, `reiniciar-datos.bat`, `docker-compose.yml`, `Dockerfile`, `.dockerignore`, `.gitattributes`, `scripts/entrada-contenedor.sh`, `scripts/db-init/*`, `scripts/*.ps1`; y el código de `src/nucleo/{aislamiento,permisos,acceso,auditoria,contadores,configuracion}`, los servicios y repos de compras, inventario, skus, usuarios y roles, las acciones de pantalla, el middleware y las pruebas citadas abajo.
- Ejecuté: `npm test` (24 archivos, 237 pruebas, **todas pasan**); `npx tsc --noEmit` (**sin errores**); `scripts/buscar-secretos.mjs` (**sin hallazgos**); `prisma validate` (**válido**); una base PostgreSQL 16 nueva con `pruebas/preparar-base.sh` (roles + las 5 migraciones + semilla desde cero: **aplican sin error**); las pruebas de base real con `vitest.base.config.mts` (**17 archivos, 207 pruebas, todas pasan**) y con `pruebas/vitest.config.mts` (**249 pruebas: 243 pasan, 6 fallan**, ver H-05 y H-06); `next build` de HEAD (**compila**); `next start` con el mismo entorno que el compose (`MODO_LOCAL=1`, `APP_URL=http://localhost:3000`, `NODE_ENV=production`) y el recorrido de Playwright (**13 de 18 pasan; falla el 7a**, ver B-1).
- **No verifiqué** (no hay Windows ni pude levantar el compose aquí): el `.bat` en Windows real, la imagen Docker de HEAD, el comportamiento de Docker Desktop. La revisión de seguridad ya existe en `seguridad-version-local-0.1.md`; no la repito.

## 2. Hallazgos por gravedad

### Bloqueantes de verificación (resolver antes de entregar)

**B-1 · Alta (baja a Media si se confirma) · El recorrido del guion falló en el paso 7a en mi corrida (hecho); causa según QA: error de la prueba, corregido (declarado, no verificado por mí)**
- Dónde: `pruebas/recorrido/guion-demo.spec.ts:302` (paso 7a, «registra 3 equipos con series»).
- Qué pasó: dos corridas seguidas sobre un build limpio de HEAD y una base nueva. Pasos 1 a 6d pasan; el 7a agota los 180 s; no corren 7b, 8, 9 ni cierre. Las capturas muestran el panel «Registrar equipos» plegado y el SKU creado en 6b presente en la tabla.
- Por qué importa: es el paso 7 del guion del CEO (equipos con series). Puede ser un defecto de la prueba (abrir el `<details>` justo tras cargar) o de la pantalla.
- Respuesta de QA: la prueba reabría con un clic un desplegable que ya estaba abierto y lo cerraba (`abrir()` en el guion, ahora solo pulsa si está cerrado). Pendiente: repetir el recorrido completo en el commit final y anotar el resultado. DEF-FRO-01 (lista obsoleta tras registrar o crear rol) es de Frontend y sigue abierto (`pruebas/recorrido/defecto-lista-obsoleta.spec.ts`; no lo revisé).

**B-2 · Alta (de proceso) · La prueba de «arranque desde cero» es anterior a cambios que afectan lo que el CEO verá (hecho)**
- Evidencia: el registro del script `probar-arranque-limpio.sh` dice «Commit probado: 84b75f2». Desde entonces hay 8 commits (87 archivos): middleware de `Host` (`src/middleware.ts`, respuesta 421), CSP en `next.config.mjs`, `limite-intentos.ts`, cambios en `usuarios` y en `prisma/semilla/index.ts`.
- Lo que sí verifiqué yo sobre HEAD, fuera de Docker: build correcto; con `Host: localhost:3000` y `127.0.0.1:3000` responde 200; con `Host: evil.com:3000` responde 421; `/api/salud` responde 200; la CSP y `X-Frame-Options` salen; la semilla carga desde una base vacía; la página de inicio lista los seis usuarios.
- Recomendación: DevOps repite `scripts/probar-arranque-limpio.sh` sobre el commit final y anota el hash. Aviso ya enviado.

### Altas (no bloquean la prueba de hoy si se declaran)

**H-01 · Alta · Separación de funciones de compras incompleta (hecho)**
- Documento funcional: RF-OC-022 (nadie aprueba **ni rechaza** su propia solicitud), RF-OC-023 (quien aprobó no recibe), RF-OC-024 (quien creó no recibe), RF-OC-025 (el servidor lo hace valer para todos los roles).
- Código: `src/modulos/compras/servicios/compras.ts`. `aprobarOrden` (líneas 128 a 150) compara preparador y aprobador y además hay disparador en la base (`0004_compras`, `trg_orden_aprobacion_reglas`): **eso está bien y probado**. Pero `rechazarOrden` (153 a 169) no compara, y `recibirOrden` (173 en adelante) no comprueba ni quién preparó ni quién aprobó.
- Prueba: `pruebas/permisos/defectos-abiertos.test.ts`, describe `DEF-SRV-04`: los tres casos **fallan hoy** («esperaba SEPARACION_FUNCIONES, recibió OK»).
- Qué cubre el plan: A.2 S1 solo pide «aprobar por otra persona». Es un recorte válido de la 0.1, pero contradice RF-OC-023/024/022 y la base no lo impide. El rol de ejemplo Técnico puede preparar y recibir la misma orden.
- Recomendación: (a) decirlo al CEO como no hecho; (b) Backend B agrega las tres comprobaciones (y, mejor, una columna `recibida_por` ya existe: bastan una consulta a `orden_aprobacion` y el `preparada_por`); (c) en el guion, que recibe otra persona (por ejemplo `tecnico@alfa.local`), no el `ceo@demo.local` que la preparó.

**H-02 · Alta (opinión sobre hecho) · Las pruebas importantes de permisos y compras no están en `npm run verificar` ni en la integración continua**
- `package.json`: `verificar` corre `vitest.config.mts`, que **excluye** todo `*.db.test.ts`, `*.integracion.test.ts` y `pruebas/aislamiento`.
- `.github/workflows/ci.yml` (línea 74) corre `probar:aislamiento` = `vitest.base.config.mts`, que incluye `pruebas/aislamiento` y los `.db.test.ts`, pero **no** `pruebas/permisos/**` ni `pruebas/acceso/**` (esas viven solo en `pruebas/vitest.config.mts`, sin script de npm ni paso de CI).
- Consecuencia: la matriz cruzada de permisos (incluye inventario y compras), las reglas de compras y las pruebas adversariales de acceso solo se ejecutan a mano. Hay dos configuraciones de pruebas con base que se solapan.
- Recomendación: un solo comando (`npm run probar:base`) que corra ambas, y agregarlo a la CI. Una vez corregidos H-01/H-05, que ninguna prueba roja «conocida» viva en la misma carpeta.

### Medias

**H-03 · Media · Las pruebas «defectos-abiertos» mezclan defectos reales con defectos ya corregidos (hecho)**
- `pruebas/permisos/defectos-abiertos.test.ts` y `pruebas/aislamiento/defectos-abiertos.test.ts`: describen el comportamiento correcto y «fallan mientras el defecto exista». Hoy fallan 5 a propósito (DEF-SRV-04 ×3, DEF-CAM-01, DEF-SKU-01); otros (DEF-SRV-01/02/03, DEF-AIS-01/02) ya pasan pero siguen en un archivo llamado «abiertos». El encabezado manda a leer `pruebas/INFORME.md`, que **no existe**.
- Por qué importa: un archivo que siempre está en rojo enseña a ignorar el rojo, y no se puede conectar a la CI.
- Recomendación: mover los que pasan a pruebas normales con su nombre real; los que fallan, a una lista con dueño y fecha en `docs/`, o arreglarlos.

**H-04 · Media · Dos defectos de validación abiertos que sí pueden tocar al CEO (hecho)**
- DEF-CAM-01 (`pruebas/permisos/defectos-abiertos.test.ts:122`): `crearSku` acepta un campo «número» recibido como lista `[16]` y un «texto» recibido como objeto (se guarda como texto raro). Desde la pantalla normal no ocurre; sí con una petición armada a mano. `src/modulos/categorias/validar-campos.ts`. Baja para hoy, Media para el módulo.
- DEF-SKU-01 (`:133`): `src/modulos/skus/servicios/skus.ts` reintenta 10 veces (`MAX_INTENTOS_CODIGO`) cuando un código escrito a mano ya ocupa el siguiente número; con 10 o más ocupados seguidos responde `CONFLICTO` y el SKU automático no se crea. RF-SKU-005 pide que el automático «salte los códigos ya ocupados» sin tope. Poco probable en la demo (el guion sobrescribe un solo código).

**H-05 · Media · Una prueba de acceso falla por choque con el límite de pedidos de enlace (hecho; posible arreglo ya subido)**
- `pruebas/acceso/acceso-adversarial.test.ts:201` («cerrar sesión revoca en la base…») falla con «Se pidieron demasiados enlaces en pocos minutos»: el límite nuevo (H-SEG-L09, `src/nucleo/acceso/limite-intentos.ts`, en memoria del proceso) cuenta los pedidos repetidos del mismo correo en toda la suite. QA subió un ajuste (`836d1ce`) mientras corría mi prueba; no lo volví a ejecutar. Re-comprobar.

**H-06 · Media · Código muerto en base y en permisos (hecho)**
- La tabla `valor_campo` (`prisma/migrations/0003_inventario`, `schema.prisma`) no se usa en ningún archivo de `src/` ni de la semilla. Los valores de campos personalizados viven en `sku.valores` (jsonb). Es coherente con lo que se muestra, pero deja un modelo muerto y sin campos «de la unidad» (RF-OC-039, RF-SKU-013).
- Permisos en el catálogo y en roles sin ningún servicio que los use: `catalogos.gestionar` (el servicio de ubicaciones usa `ubicaciones.gestionar`) y `ordenes_compra.emitir` (no existe «emitir»). Se muestran en la pantalla de roles como si hicieran algo. Importa porque el CEO puede crear un rol «Solo lectura» y verlos.
- Dependencia: `@prisma/client` 6.19.3 está instalado y se genera en cada instalación (`scripts/generar-prisma.mjs`), pero ningún archivo lo importa; la aplicación entera usa `pg` con SQL escrito a mano. Prisma solo ejecuta las migraciones. Encarece la construcción de la imagen para nada.
- Recomendación: documentar que Prisma es solo migrador (CLAUDE.md y el ADR dicen «PostgreSQL con Prisma»; el código dice otra cosa) o quitar `@prisma/client`; quitar o marcar los dos permisos; borrar `valor_campo` en la próxima migración o usarla.

**H-07 · Media · Duplicación de listas a mano que se pueden desfasar (hecho; riesgo = opinión)**
- Nombres de permisos: `src/nucleo/permisos/catalogo.ts` (tipado) y `src/componentes/estructura/permisos.ts` (texto plano, no tipado contra `Permiso`); hoy coinciden, ningún test lo obliga. Si uno cambia, un botón se oculta sin error de compilación.
- `puede(...)`: existe en `src/nucleo/permisos/exigir.ts` (tipada) y en `src/app/_lib/sesion.ts` (acepta cualquier texto).
- Usuarios de ejemplo: `prisma/semilla/datos.ts`, la lista fija de `src/app/page.tsx` y la tabla de `LEEME-PROBAR.md`. Tres copias.
- `comoPatron` (escape de `%` y `_`) copiada en `modulos/skus/repos/skus.ts` y `modulos/inventario/repos/inventario.ts`; `iso()` copiada en repos de compras e inventario; el chequeo del error 23514 está escrito tres formas distintas (`ingreso.ts`, `compras.ts`, `errores.ts`).

### Bajas

**H-08 · Baja · Prueba de reglas de código no mira todos los módulos.** `src/nucleo/permisos/matriz-sin-permiso.test.ts` (bloque «reglas de código») revisa solo los módulos de Backend A (`propios`); `modulos/inventario` y `modulos/compras` no entran en «sin `set_config`, sin `pg`, solo `index` de otros módulos». Revisé a mano ambos con `grep`: cumplen hoy. Agregarlos a la lista.

**H-09 · Baja · SQL con nombre de tabla interpolado.** `modulos/catalogos/repos/catalogos.ts` (líneas 12 a 37) arma `FROM ${tabla}` y columnas; los valores van por `$n` y los nombres salen de una lista fija (`TABLAS`), pero `tabla` solo está restringido por TypeScript, no en tiempo de ejecución. Hoy los llamadores pasan literales. Opinión: añadir una guarda en ejecución (`if (!(tabla in TABLAS)) throw`) por si algún día llega de una ruta dinámica (`/catalogos/[tipo]`; el `tipo` de la URL sí es dinámico: verifiqué que `catalogos/tipos.ts` lo mapea a una lista fija).

**H-10 · Baja · Segunda puerta a la base documentada.** `reservarSiguiente` (`nucleo/aislamiento/index.ts`, final) usa el pool sin `conEmpresa` (patrón ADR-15; la función SQL `siguiente` rechaza una empresa distinta de la de la transacción y no deja residuo, migración 0005). El comentario inicial del archivo dice «conEmpresa es la ÚNICA forma de tocar tablas de una empresa»: no es exacto; ajustar el texto.

**H-11 · Baja · Semilla incompleta si se corta (hecho por lectura).** `scripts/entrada-contenedor.sh` decide «base vacía» mirando `empresa`; `prisma/semilla/index.ts` crea las empresas primero. Si el proceso se cae a la mitad, el siguiente arranque dice «ya tiene datos» y no completa. Probabilidad baja; remedio: `reiniciar-datos.bat`.

**H-12 · Baja · Herramienta de QA con error de portabilidad (hecho; QA dice que ya lo corrigió para bash, no lo reverifiqué).** `pruebas/preparar-base.sh` usa `/dev/tcp` (solo existe en `bash`) con `#!/bin/sh`: con `sh` toma siempre el puerto 54360 aunque esté ocupado (a mí me falló así). Con `bash` funciona.

**H-13 · Baja · Archivos `.gitkeep` en carpetas que ya tienen contenido** (`src/nucleo/*`, `src/modulos/*`). Ruido.

## 3. Reglas críticas del negocio (verificadas en el código, no solo en pruebas)

| Regla | Resultado | Evidencia |
|---|---|---|
| Toda consulta filtra por empresa | **Cumple** | Cada consulta de repos lleva `empresa_id = $1`, más la política de seguridad por fila forzada (migración 0001, macro `aplicar_aislamiento`, `FORCE ROW LEVEL SECURITY`). `app_empresa` sin BYPASSRLS. Pruebas `pruebas/aislamiento/*` (42 + 3 + 8 + …) pasan, incluida la de 2.000 peticiones intercaladas. |
| `set_config` solo en `conEmpresa` | **Cumple** | `grep` en `src`, `prisma/semilla`, `scripts`: solo `nucleo/aislamiento/index.ts` y la función SQL `siguiente` (que solo lo usa si no había empresa y lo deja vacío). `sql-permitido.ts` rechaza `set_config`, `SET`, `BEGIN/COMMIT`, comentarios y varias sentencias. |
| Pantallas no tocan Prisma ni `repos` ni `aislamiento` | **Cumple** | `grep` en `src/app` y `src/componentes`: solo importan `@/modulos/<x>` (index), `@/nucleo/acceso`, `tipos-comunes`, `configuracion`, `auditoria`. |
| Toda acción comprueba permiso con la función central | **Cumple** | Todos los servicios exportados usan `definirServicio` (`grep`: las únicas funciones exportadas fuera de él son helpers internos o `catalogoPermisos`). Prueba de matriz sin permiso (24 servicios, sin base) y `pruebas/permisos/matriz-cruzada.test.ts` (incluye inventario y compras) pasan. Excepción conceptual: H-01 (reglas de separación) no son el permiso. |
| Permisos usados existen con su nombre en el registro | **Cumple** | Verifiqué las 28 claves de `catalogo.ts` una por una contra `docs/registro-permisos.md`: todas existen. **No hay ningún permiso provisional `local.*`** (la lista es vacía). Observación: `catalogos.gestionar` y `ordenes_compra.emitir` existen en el registro pero no hacen nada (H-06). |
| Operaciones de varias tablas en transacción | **Cumple** | Cada servicio que cambia algo corre en un único `conEmpresa` con su fila de auditoría dentro (recibir una orden: recepción + activos + líneas + estado + auditoría en una sola; `FOR UPDATE` en orden y activo). Excepción menor: `crearSku` reserva el correlativo antes (ADR-15, permite saltos). |
| Correlativo del SKU no se duplica | **Cumple** | `siguiente()` atómico (`INSERT … ON CONFLICT DO UPDATE`) + `UNIQUE (empresa_id, codigo_norm)`; reintento si un código propio lo ocupa (límite de 10: H-04). Pruebas de concurrencia en `pruebas/permisos/sku-campos-concurrencia.test.ts` pasan. |
| Series no se repiten dentro de un SKU | **Cumple** | Índice único parcial `uq_activo__serie (empresa_id, sku_id, serie_norm) WHERE anulado_en IS NULL` + comprobación previa con mensaje; «misma serie en otro SKU» se acepta con aviso (RF-INV-003). Prueba de dos recepciones simultáneas con la misma serie: pasa. |
| Autoentrega prohibida | **Cumple** | `asignarActivo`: compara el correo del usuario con el de la persona (por correo, no por vínculo; opinión: sirve para la demo, no para producción). |

## 4. Pruebas: ¿prueban lo importante? (muestreo)

Hechos: leí `compras-reglas.test.ts`, `matriz-cruzada.test.ts`, `matriz-sin-permiso.test.ts`, `base-real.test.ts`, `entre-empresas-servicios.test.ts`, `compose.test.ts`, el guion de Playwright y los `defectos-abiertos`. Busqué `.skip`, `.only`, `.todo`, `expect(true)`: **no hay**. Hay `describe.skipIf(!hayBase)` en 8 archivos `src/**/*.db.test.ts` y `*.integracion.test.ts`: si falta la base **se saltan en silencio** (mientras que `pruebas/vitest.config.mts` hace lo contrario: falla si faltan variables). Dos criterios distintos para lo mismo; en `npm run verificar` esas pruebas no corren nunca (H-02).

- Aislamiento: pruebas reales contra PostgreSQL con `app_empresa` (consulta sin filtro, inserción ajena, clave foránea cruzada, UPDATE/DELETE ajenos, 2.000 peticiones intercaladas, conexión reutilizada sin empresa, auditoría sin UPDATE/DELETE). Pueden fallar y lo hacen cuando se rompe (las de DEF-AIS lo demostraron). **Buenas.**
- Separación de funciones: autoaprobación probada en servicio **y** en el disparador de la base; el resto de la separación (H-01) está probado en rojo.
- Series duplicadas y código SKU único: probados incluyendo concurrencia. **Buenas.**
- Permiso denegado: matriz sin base (24 servicios) + matriz cruzada por rol y «un rechazo no deja rastro». **Buenas.**
- Pruebas que no pueden fallar: no encontré ninguna vacía. Pruebas débiles de interfaz: usan `toBeTruthy()` sobre `getByTestId` (fallan si no existe el elemento: aceptable). `src/nucleo/acceso/acceso.db.test.ts` usa `resolves.toBeDefined()` en 4 casos (apenas verifica que no lanzó).
- Faltan: (1) una prueba que compare `P` de `componentes/estructura/permisos.ts` con el catálogo (H-07); (2) `rechazarOrden` por el propio preparador (existe, en rojo); (3) la prueba del CEO con `tecnico@alfa.local` recibiendo lo que otro preparó y aprobó; (4) una prueba que obligue a que los dos permisos sin uso del H-06 se usen o se quiten.

## 5. Coherencia `LEEME-PROBAR.md` ↔ `iniciar.bat` ↔ `docker-compose.yml` (hechos por lectura; no ejecuté el `.bat`)

Coinciden: puerto 3000 y dirección `http://localhost:3000` en los tres; el compose publica solo `127.0.0.1:3000` y no publica la base; `iniciar.bat` crea `.env` con `scripts/crear-env.ps1` (cinco claves aleatorias, las mismas que pide el compose); `detener.bat` hace `docker compose down` (conserva datos); `reiniciar-datos.bat` hace `down -v` y vuelve a llamar a `iniciar.bat`, con confirmación escrita `BORRAR`; `.gitattributes` fija LF en `*.sh`, `*.sql`, `*.mjs` y CRLF en `*.bat`; el `.bat` usa solo ASCII y escapa los paréntesis. Mensajes de espera de Docker, de «Engine running» y de «La plataforma está lista» coinciden en sustancia con la guía.

Diferencias o riesgos para una persona no técnica:
- **C-1 (Media).** Con el puerto 3000 ocupado, `docker compose up -d --build` falla en el paso 4 de `iniciar.bat` y muestra «revise que Docker siga abierto y que haya internet». El «Problema 2» de la guía dice que la ventana hablará del puerto 3000, y eso solo ocurre en la rama de «no respondió a tiempo». Una persona con otro programa en el puerto 3000 recibirá la pista equivocada.
- **C-2 (Media, opinión).** Paso 3 de la guía: «Download ZIP» exige que el repositorio sea público o que la persona tenga sesión en GitHub, y pide «asegurarse de estar en la rama» correcta. Para una persona no técnica es el paso más frágil. La propia guía admite que la Jefatura envíe el ZIP directo: recomiendo hacerlo así y no usar GitHub.
- **C-3 (Baja).** El comentario de `docker-compose.yml` línea 2 cita `crear-env.mjs`; el `.bat` usa `crear-env.ps1` (ambos existen; Linux/Mac usan el `.mjs`). La guía no dice dónde queda `.env`; si lo borra, la base conserva las contraseñas viejas y la aplicación no entra (corregir con `reiniciar-datos.bat`).
- **C-4 (Baja).** La guía promete «20 a 30 minutos» y el `.bat` espera hasta 10 minutos a la salud **después** de construir: coherente; pero no dice qué hacer si Windows deja Docker en «contenedores de Windows» (poco común).

## 6. Lo provisional o recortado respecto del documento funcional (para decírselo al CEO, en palabras simples)

**Acceso (sección 5):**
- No hay segunda verificación ni llaves físicas (RF-ACC-013, 018, 024), ni correo real (el enlace sale en pantalla), ni aviso de privacidad aceptado (RF-ACC-023), ni «mis permisos» ni «mi cuenta» (RF-ACC-025), ni «cerrar sesión en todos los dispositivos» (RF-ACC-015) (no verificado: no vi el servicio).
- No hay invitaciones con vencimiento a 7 días ni cancelarlas (RF-ACC-007). Invitar a un correo que ya existe en otra empresa devuelve un enlace «señuelo» que no sirve (decisión de Seguridad, H-SEG-L03): quien lo pruebe se confundirá; la persona entra pidiendo su enlace.
- No hay administrador de plataforma ni consola de empresas: las empresas solo existen por la semilla (RF-ACC-002, sección 6).
**Roles y usuarios (sección 7):** roles base no se editan; no se puede editar el propio rol; hay un rol nuevo configurable; no hay «aviso de dos administradores».
**Catálogos y categorías (sección 9):** solo ubicaciones (plana, sin árbol de 3 niveles), proveedores y personas; **no hay** marcas, modelos, unidades, áreas ni centros de costo; categorías sin subcategorías, sin editar ni desactivar; campos personalizados: texto, número, fecha, lista, sí/no, solo al crear la categoría y agregando campos.
**SKU (sección 10):** se crea, lista y consulta; **no se edita ni se desactiva**; no tiene marca, modelo, unidad ni stock mínimo (RF-SKU-001, 016); no hay campos «de la unidad»; no hay licencias ni claves secretas (RF-SKU-013, 014); no hay vista de series/stock/órdenes desde el SKU (RF-SKU-012).
**Inventario (sección 11):** registrar (series de a 200, no 1.000: RF-OC-037), listar y filtrar, asignar y devolver, historial; estados sin uso: reparación, extravío, baja; el control **por cantidad** solo suma stock (no hay salida, ajuste, traslado ni entrega); sin constancia/acta de entrega (RF-INV constancia); la autoentrega se compara por correo.
**Compras (secciones 12 y 13):** una sola aprobación sin monto límite ni «aprobación configurable» (RF-OC 12.3); sin moneda configurable, sin editar el borrador, sin emitir al proveedor, sin correos; recepción parcial sí, pero **sin borrador de recepción, sin revertir, sin costos ni garantía por lote, y sin las reglas «quien aprueba/prepara no recibe» (H-01)**; sin interruptor de excepciones.
**Auditoría (sección 16):** solo agregar y ver (200 registros); sin exportar, sin buscar por persona, sin copia externa ni partición.
**No incluido por decisión (plan A.2):** importar/exportar Excel, órdenes de servicio, actas, avisos, cola de trabajos, empresa de demostración, diseño final.
**Seguridad declarada:** no es apto para datos reales (D-064 sigue vigente); el modo local muestra el enlace en pantalla; ver `seguridad-version-local-0.1.md` (H-SEG-L01/L02/L03 corregidos según el código; no los reverifiqué uno por uno).

## 7. Deuda técnica (opinión, ordenada por costo de dejarla)

1. Decidir de una vez si el acceso a datos es SQL escrito a mano con `pg` (lo que existe) o Prisma (lo que dice CLAUDE.md y el stack): hoy son ambos y el segundo no se usa. Cuanto más SQL a mano se acumule, más caro es cambiar.
2. Ordenar la capa de pruebas: dos configuraciones con base, una carpeta `pruebas/` y pruebas `src/**/*.db.test.ts` con criterios de «saltar o fallar» distintos; sin comando único y sin CI para las de permisos (H-02, H-03).
3. Auditoría con tres caminos de escritura: `registrarAuditoria` (servicios), SQL directo en la semilla (`prisma/semilla/index.ts`, función `auditar`) y la lista de campos personales en `campos-personales.ts`; mantener un solo camino.
4. Historial del activo reconstruido leyendo `auditoria` con `cambios->>'personaId'` (`inventario/repos/inventario.ts`, `historial`): funciona, pero ata una pantalla de negocio al formato de un registro de auditoría. La tabla `asignacion` ya tiene los datos.
5. El límite de pedidos de enlace vive en memoria de un proceso (`limite-intentos.ts`): con más de una instancia no cuenta bien (en local no importa).

## 8. Lo que está bien (hecho)

El SQL con parámetros se cumple en toda la capa de datos; la puerta `conEmpresa` con prohibición de `set_config` es sólida y está probada con ataques (DEF-AIS-01/02 encontrados por QA y ya corregidos); las migraciones se aplican limpias y repetibles desde cero; las reglas de la base (serie única, código único, CHECK de recepción, autoaprobación) existen **también** en PostgreSQL y no solo en el código; la guarda de `MODO_LOCAL` corre al arrancar (`instrumentation.ts`, `entrada-contenedor.sh`) y en cada uso, y rechaza hosts de base ajenos; el contenedor de la aplicación no recibe las claves de los otros roles (`env -u`); nada de contraseñas en el repositorio (búsqueda de secretos limpia; `.env` ignorado).

## Nota para la Jefatura de Proyecto

**Resumen.** Audité el commit `836d1ce` con código leído y pruebas ejecutadas por mí. El núcleo (aislamiento, permisos en el servidor, correlativos, series, auditoría) cumple lo que A.9 dice que no se suelta jamás. Veredicto: **conforme con condiciones** para entregar hoy como versión de prueba con datos inventados.

**Bloquea la entrega (verificación, no rediseño):**
1. **B-1:** en mi corrida el recorrido falló en el paso 7a (13 de 18 pasaron). QA dice que era un error de su prueba, ya corregido, y que 1 a 9 pasan ahora; no lo reverifiqué. Hay que repetir el recorrido sobre el commit final. Además queda abierto un defecto real de pantalla (DEF-FRO-01: la lista a veces no se refresca sola; los datos sí se guardan).
2. **B-2:** repetir el «arranque desde cero» con Docker sobre el commit final (la última evidencia es de `84b75f2`, antes del control de dirección, las cabeceras y el límite de enlaces). DevOps ya avisado. Yo verifiqué sobre HEAD, sin Docker: construye, arranca con el mismo entorno del compose, responde en `localhost` y `127.0.0.1`, rechaza hosts ajenos y carga la semilla desde cero.

**Hallazgos por gravedad:** Críticos: 0. Altos: H-01 (no están las reglas «quien aprueba o prepara no recibe» ni «quien prepara no rechaza»; hay tres pruebas en rojo que lo demuestran), H-02 (las pruebas de permisos y compras no corren en la CI ni en `verificar`). Medios: H-03 a H-07 (pruebas «abiertas» en rojo, validación de campos, choque entre una prueba y el nuevo límite de enlaces, código y permisos sin uso, listas duplicadas) y los puntos C-1, C-2 de la guía. Bajos: H-08 a H-13, C-3, C-4.

**Qué decirle al CEO (sin jerga):** la plataforma de hoy es una muestra que funciona de punta a punta, con datos inventados. Todavía **no** impide que quien aprobó o preparó una compra reciba la mercadería, no tiene segunda verificación, ni correo real, ni importar desde Excel, ni editar artículos, ni órdenes de servicio, y no sirve para datos reales. Para el paso de las compras en la demostración, que la orden la prepare una persona, la apruebe otra y la reciba una tercera.

**Qué sigue (propuesta):** (1) QA repite el recorrido completo en el commit final; (2) DevOps repite el arranque limpio; (3) Backend B cierra H-01 y, junto con QA, H-02/H-03 antes de la Etapa 1 formal; (4) Frontend corrige DEF-FRO-01; (5) el Arquitecto anota la decisión sobre Prisma frente a SQL a mano y la lista de ADR «aceptados para el corte local»; (5) mejor entregar el ZIP directo al CEO y no un enlace a GitHub (C-2).

**Archivos citados (rutas absolutas):** `/home/user/Plataform_TI_Gestion/src/modulos/compras/servicios/compras.ts`, `/home/user/Plataform_TI_Gestion/pruebas/permisos/defectos-abiertos.test.ts`, `/home/user/Plataform_TI_Gestion/pruebas/recorrido/guion-demo.spec.ts`, `/home/user/Plataform_TI_Gestion/iniciar.bat`, `/home/user/Plataform_TI_Gestion/LEEME-PROBAR.md`, `/home/user/Plataform_TI_Gestion/docker-compose.yml`, `/home/user/Plataform_TI_Gestion/.github/workflows/ci.yml`, `/home/user/Plataform_TI_Gestion/package.json`.

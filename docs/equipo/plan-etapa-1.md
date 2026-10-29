# Plan de la Etapa 1 y «Versión local 0.1»

**Autor:** Gerente de TI · **Fecha:** 2026-10-29 (hora de Lima) · **Base:** D-118 (se construye la plataforma; el abogado queda diferido), D-119 (puerta mínima y Versión local 0.1), D-064, D-117, `hoja-de-ruta.md` (tramos 0 y 1), `docs/arquitectura/` (ADR 01 a 20 y `prototipo-tecnico.md`), CLAUDE.md (stack).
**Parte A (urgente):** la **Versión local 0.1** que el CEO prueba hoy a las **20:00 (Lima)** en su computadora **Windows con Docker Desktop**. **Parte B:** el plan de la Etapa 1 formal, que sigue después de la demo de hoy.
**Regla de lectura.** Los horarios de la parte A son **metas del plan, no promesas**. Si algo no llega, se corta en el orden de A.9 y se dice.

---

# PARTE A · VERSIÓN LOCAL 0.1 (hoy)

## A.1 Qué es y qué no es (honesto)

- **Es** un **corte vertical** de la plataforma: poco, pero de punta a punta y real (base de datos real con seguridad por fila, permisos comprobados en el servidor, pantallas reales). Corre en la computadora del CEO con **datos inventados de dos empresas**.
- **No es** la Etapa 1 terminada, ni un producto seguro para datos reales, ni cumple la puerta completa de la Etapa 0. Es **«código de arranque»** (D-119): se puede descartar y no pasa a la Etapa 1 sin la revisión de los auditores.
- **No sustituye** el prototipo técnico de ADR (H1 a H12): corre justo después (Parte B, paquete B1).
- En **6 horas** (13:45 a 20:00) hay que construir, probar, revisar y empaquetar. **Lo que no se revisó se rotula «sin revisar» al entregarlo al CEO.** Sin visto bueno de QA y de Seguridad no se dice «aprobada».

## A.2 Alcance

| Prioridad | Qué entra | Qué verá el CEO |
|---|---|---|
| **M1 (obligatorio)** | Arranque con **doble clic** (`iniciar.bat`) + Docker Compose (PostgreSQL 16 + aplicación); datos de ejemplo de **dos empresas** (Alfa y Beta) cargados solos | Abre `http://localhost:3000` y ve la pantalla de inicio con los usuarios de ejemplo |
| **M2 (obligatorio)** | **Ingreso por enlace mostrado en pantalla** (modo local, sin correo real): se escribe el correo, aparece el botón «Entrar»; sesión en la base; cerrar sesión | Entra sin contraseña, como será en producción pero sin correo |
| **M3 (obligatorio)** | **Aislamiento por empresa con seguridad por fila forzada en PostgreSQL** (roles de base sin privilegios, función `conEmpresa`, empresa activa en la dirección `/e/{empresa}`) + pruebas automáticas de aislamiento | Dos empresas con los **mismos códigos** a propósito; cambiar la dirección a otra empresa no muestra nada ajeno |
| **M4 (obligatorio)** | **Usuarios, roles y permisos básicos** (4 roles de ejemplo, crear un rol, invitar un usuario con enlace en pantalla, suspender), permisos **comprobados en el servidor**, **auditoría** que solo se agrega | Crea un rol «Solo lectura», entra con ese usuario y no puede crear; ve la auditoría |
| **M5 (obligatorio)** | **Catálogos** (ubicaciones, proveedores, personas) y **categorías con campos personalizados** (texto, número, fecha, lista, sí/no) | Crea la categoría «Impresoras» con sus campos propios |
| **M6 (obligatorio)** | **Maestro de SKU** con **código automático por categoría** y posibilidad de sobrescribirlo; control **por serie** o **por cantidad**; los campos de la categoría aparecen en el formulario | Crea un SKU, ve `IMP-0001`, lo sobrescribe, y un código repetido se rechaza |
| **M7 (obligatorio)** | **Inventario**: registrar activos con series (o cantidad), listar y filtrar, **asignar a una persona**, devolver, historial del activo | Registra 3 equipos con series, asigna uno, lo devuelve |
| **S1 (si M1 a M7 están en verde a las 17:15)** | **Orden de compra** (borrador, enviar a aprobación, aprobar por **otra** persona, rechazar la autoaprobación) y **recepción parcial que crea los activos** | Crea una orden, intenta aprobarla él mismo y se lo impide; la aprueba otro; recibe y nacen los activos |
| **S2 (opcional, solo con holgura)** | Pantalla «Estado de seguridad» (seguridad por fila activa, roles sin privilegio) | Una pantalla con luces verdes |
| **NO entra hoy (y se dice)** | Segunda verificación y llaves físicas; correo real; consola de plataforma aparte y lectura de soporte; cola de trabajos; importar o exportar Excel; actas; avisos; doble control completo; campos secretos; anonimización; auditoría particionada y copia externa; empresa de demostración; módulos de las Fases 2 y 3; diseño final (se usa el estilo del prototipo, sin pulir) | Se le dice qué falta y por qué |

**Guion de la demo del CEO** (QA lo convierte en prueba automática, A.8):
1. Doble clic en `iniciar.bat`; se abre el navegador. 2. Escribe `ceo@demo.local`, aparece el enlace, pulsa «Entrar». 3. Ve Alfa; cambia a Beta (mismo usuario, dos empresas). 4. En Alfa crea un rol «Solo lectura», invita a un usuario, entra con él: no puede crear (el botón no está y el servidor lo rechaza). 5. Aislamiento: ve `LAP-0001` en Alfa y otro `LAP-0001` distinto en Beta; escribe en la barra la dirección de una empresa a la que no pertenece: «sin acceso». 6. Crea una categoría con campos propios y un SKU con código automático y otro sobrescrito. 7. Registra equipos con series, los asigna y devuelve. 8. Mira la auditoría. 9. (S1) Orden de compra con aprobación por otra persona y recepción.

## A.3 Cómo corre en la computadora del CEO (Windows + Docker Desktop)

**Un solo archivo:** `iniciar.bat` (doble clic). Hace, en este orden, con mensajes en español:
1. Comprueba que Docker Desktop está instalado y abierto; si no, dice cuál paso de la guía falta y espera.
2. En el primer uso genera `.env` con contraseñas **aleatorias** de los roles de base (no están en el repositorio; `.env` está en `.gitignore`).
3. `docker compose up -d --build` (PostgreSQL 16 y la aplicación). **La primera vez descarga e instala: puede tardar varios minutos; la guía lo avisa.**
4. Espera a que la aplicación responda en `/salud`, y abre `http://localhost:3000`.
5. Hay también `detener.bat` (apaga sin borrar datos) y `reiniciar-datos.bat` (borra y vuelve a cargar los datos de ejemplo, con aviso y confirmación escrita).

**Cómo está armado:** `docker-compose.yml` con dos servicios (`db` = `postgres:16`, `app` = imagen de la aplicación). El puerto 3000 se publica **solo en 127.0.0.1**; el puerto de la base **no se publica** (solo la red interna de Docker). Al arrancar, la aplicación aplica las migraciones (con el rol dueño), carga los datos de ejemplo (si la base está vacía) y arranca con el rol **sin privilegios**. Volumen nombrado para los datos (no una carpeta de Windows, por velocidad y permisos). `.gitattributes` fija finales de línea (`*.sh` con LF, `*.bat` con CRLF) para que Windows no rompa el arranque dentro del contenedor.

**Guía para no técnicos:** `LEEME-PROBAR.md` (en la raíz del repositorio), en español claro y con pasos numerados: (1) instalar Docker Desktop (qué descargar, aceptar la instalación y reiniciar si lo pide; si pide activar la virtualización o WSL 2, qué hacer); (2) abrirlo y esperar a que diga «Docker Desktop is running»; (3) descargar el repositorio (botón verde «Code», «Download ZIP», descomprimir); (4) doble clic en `iniciar.bat`; (5) abrir `http://localhost:3000`; (6) tabla de usuarios de ejemplo; (7) qué hacer si algo falla (3 problemas típicos) y cómo avisar; (8) cómo apagar. Una captura por paso si hay tiempo.

**Qué no sabemos (declarado):** nadie del equipo tiene Windows para probar el `.bat`. DevOps lo prueba con el mismo Docker Compose en Linux y escribe el `.bat` con comandos simples; el primer arranque real en Windows ocurre en la máquina del CEO. **Plan B** si no arranca a las 20:00: la Jefatura lo guía por la lista de problemas típicos; **Plan C:** demostración por pantalla compartida desde el entorno del equipo, avisando que no es su computadora. Docker Desktop puede exigir virtualización activada en el BIOS o una versión de Windows compatible: es lo primero que debe preguntar la Jefatura.

**Modo local y su guarda (condición de Seguridad).** El enlace de ingreso solo se muestra en pantalla si `MODO_LOCAL=1` **y** la base está en la red interna de Docker o en `localhost` **y** `NODE_ENV` no es `production` para un despliegue de nube. Si se pone `MODO_LOCAL=1` con una base externa, **la aplicación se niega a arrancar** (prueba automática). En el modo local hay una franja fija «Versión local de prueba: solo datos inventados».

## A.4 Horario (hora de Lima) y cortes

| Hora | Hito | Qué debe estar |
|---|---|---|
| 14:15 | Lanzamiento de la tanda 1 | Cuatro agentes: Ingeniero de Datos, Backend A, Frontend, DevOps |
| 14:45 | **C1 Contratos y base** | Backend publicó los `tipos.ts` de A.6; DevOps entregó `package.json`, estructura y `docker compose` con la base; Datos aplicó la migración 1 (roles, seguridad por fila, tablas de acceso) |
| 16:00 | **C2 Primer corte vertical** | Ingreso, empresa en la dirección, roles y permisos, auditoría y aislamiento **en verde** (pruebas H1 mínimas), catálogos con pantallas. Primer ensayo del guion |
| 17:15 | **C3 Corte de alcance** | M1 a M7 en verde → se autoriza S1 (compras). Si no, **S1 se descarta** y todo el tiempo va a calidad |
| 18:00 | **Congelación de funciones** | Desde aquí solo se corrigen defectos |
| 18:00–19:00 | Calidad | QA corre el recorrido y el aislamiento; Seguridad revisa; arranque desde cero en entorno limpio con `docker compose` |
| 19:00–19:30 | Empaquetado | Guía final, `iniciar.bat`, datos de ejemplo, rótulo de lo que se revisó y de lo que no |
| 19:30 | Prueba de la Jefatura | Pasa el guion completo; yo doy o niego el visto bueno |
| 20:00 | Demo con el CEO | |

**Hueco de agentes (máximo cuatro a la vez, CLAUDE.md):** la Jefatura lanza en este orden y, si no hay hueco, espera a que termine quien cumpla su «terminado».

| Hueco | 14:15 | ~15:00 | ~16:15 | ~17:30 | ~18:15 |
|---|---|---|---|---|---|
| 1 | Datos | Datos | **QA** | QA | QA |
| 2 | Backend A | Backend A | Backend A | **Seguridad** (modelo potente) | **Auditor Técnico** |
| 3 | Frontend | Frontend | Frontend | Frontend | **Auditor de Cumplimiento** (15 min) |
| 4 | DevOps | **Backend B** (inventario y compras) | Backend B | Backend B | DevOps (arranque limpio) |

El Diseñador no se lanza: Frontend sigue el prototipo publicado (`docs/prototipo/`) y le consulta por mensaje si lo necesita.

## A.5 Estructura del repositorio de código y quién es dueño de cada archivo

Se programa en la **raíz del repositorio**, rama de trabajo asignada `claude/gifted-pascal-ptgxae`. Sigue ADR-14 con una diferencia: las migraciones viven en `prisma/` (convención de Prisma, ADR-06 y H10); el Arquitecto lo anota en el ADR.

```
package.json, package-lock.json, tsconfig.json, next.config.mjs, .gitattributes,
Dockerfile, docker-compose.yml, iniciar.bat, detener.bat, reiniciar-datos.bat,
LEEME-PROBAR.md, .env.example (existe: se amplía)        [DevOps]
scripts/                  arranque local, entrada del contenedor, verificación      [DevOps]
(flujo ci.yml, GitHub)       revisión automática                                       [DevOps]
prisma/
  schema.prisma                                                                      [Datos]
  migrations/NNNN_*/migration.sql   (SQL a mano: roles, FORCE RLS, funciones)       [Datos]
  semilla/                dos empresas de ejemplo (código TypeScript)                [Datos]
src/
  nucleo/
    aislamiento/          conEmpresa, cliente de base, roles                         [Datos]
    contadores/           siguiente() (envoltorio de la función SQL)                 [Datos]
    acceso/               enlace de ingreso, sesión, contexto                        [Backend A]
    permisos/             catálogo, definirServicio, exigirPermiso                   [Backend A]
    auditoria/            registrarAuditoria, listar                                 [Backend A]
    errores.ts, tipos-comunes.ts  (ErrorNegocio, Resultado, Contexto)                [Backend A]
    configuracion/        interruptores legales (todos apagados) y MODO_LOCAL        [Backend A]
  modulos/
    usuarios/, roles/, catalogos/, categorias/, skus/                                [Backend A]
    inventario/, compras/                                                            [Backend B]
       cada uno: index.ts (interfaz pública), tipos.ts, servicios/, repos/, permisos.ts, registro.ts
  app/                    rutas de Next.js, acciones (acciones.ts) y pantallas       [Frontend]
    api/salud/            ruta de salud                                              [DevOps]
  componentes/, estilos/  piezas visuales                                            [Frontend]
pruebas/
  aislamiento/            pruebas H1 mínimas sobre la base real                      [QA]
  recorrido/              el guion de la demo como prueba (Playwright o fetch)       [QA]
  arranque/               guarda de MODO_LOCAL, interruptores legales apagados       [QA]
```

**Reglas para no pisarse:** (1) **cada agente escribe solo en sus carpetas**; si necesita un cambio en otra, se lo pide por mensaje (`SendMessage`) al dueño, con la primera línea clara. (2) **`package.json` es de DevOps**: quien necesite una dependencia se la pide por mensaje con nombre y versión; DevOps la agrega en menos de 10 minutos. (3) Las pruebas unitarias de un módulo las escribe su dueño junto a su código; QA solo escribe en `pruebas/`. (4) Ningún archivo tiene dos dueños.

## A.6 Contratos entre Datos, Backend y Frontend

Son **vinculantes**. Si uno se vuelve inviable, quien lo descubre avisa por mensaje a los otros dos y a mí **antes** de cambiarlo. El Backend publica los `tipos.ts` en C1 (14:45); hasta entonces Frontend avanza con layout, inicio de sesión y componentes.

### A.6.1 Base de datos (Datos)
- **Roles de base (versión reducida de ADR-04):** `migraciones` (dueño de todo, sin acceso de la aplicación), `app_empresa` (sin dueño, sin BYPASSRLS, sin superusuario; una sola cuenta en la 0.1), `app_plataforma` (solo lo necesario para crear empresas en la semilla; no lee tablas de negocio), `lector_auditoria` (reservado, sin uso hoy). Contraseñas desde variables de entorno, nunca en archivos del repositorio.
- **Aislamiento:** toda tabla de negocio lleva `empresa_id uuid not null`, `ENABLE` y **`FORCE ROW LEVEL SECURITY`**, una política `USING/WITH CHECK (empresa_id = nullif(current_setting('app.empresa_id', true), '')::uuid)` y **clave foránea compuesta** `(empresa_id, id)` entre tablas de negocio. Índices únicos empiezan por `empresa_id`. Sin la variable fijada, **cero filas, sin error**. `conEmpresa(empresaId, fn)` abre una transacción y fija la variable con `set_config(..., true)`; es la **única** puerta (ADR-03). Nadie más llama a `set_config`.
- **Tablas globales (lista cerrada, sin seguridad por fila):** `empresa`, `usuario`, `sesion`, `enlace_ingreso`. `membresia` es de empresa; el listado «mis empresas» lo hace una función `mis_empresas(usuario_id)` con `SECURITY DEFINER` (ADR-04), que es la única forma de saber a qué empresas pertenece alguien antes de elegir una.
- **Tablas de empresa (mínimo):** `rol`, `rol_permiso`, `membresia`, `categoria`, `campo_definicion`, `ubicacion`, `proveedor`, `persona`, `sku`, `valor_campo` (valores personalizados por SKU y por activo), `contador`, `activo` (una fila por serie), `existencia` (por cantidad: sku, ubicación, cantidad con `CHECK (cantidad >= 0)`), `asignacion`, `auditoria` (solo agregar: `app_empresa` sin UPDATE ni DELETE), y, para S1, `orden_compra`, `orden_linea`, `orden_aprobacion`, `recepcion`, `recepcion_linea`.
- **Reglas en la base (no solo en el código):** serie única por `(empresa_id, sku_id, serie)`; código de SKU único por `(empresa_id, codigo)`; un SKU por serie no admite existencia por cantidad y al revés; el aprobador de una orden no puede ser quien la preparó (`CHECK`/disparador); una recepción no supera lo pedido.
- **Contador automático:** `siguiente(empresa_id, clave, n)` en SQL, atómico, sin repetir nunca (clave = `sku:<prefijo>`); un código escrito a mano que ocupa el siguiente se salta (ADR-15).
- **Semilla** (`prisma/semilla/`, datos inventados, sin correos reales): **Alfa** (`alfa`, «Alfa S.A.») y **Beta** (`beta`, «Beta S.A.C.»). Usuarios: `ceo@demo.local` (Administrador en ambas), `jefa@alfa.local` (Jefatura TI), `tecnico@alfa.local` (Técnico), `consulta@alfa.local` (Consulta), `admin@beta.local` (Administrador de Beta), `tecnico@beta.local`. Cada empresa: roles base, 3 ubicaciones, 2 proveedores, 5 personas ficticias, categorías «Laptops» (`LAP`; campos Procesador texto, RAM GB número, Fecha de compra fecha, Disco lista SSD/HDD, Con garantía sí/no) y «Monitores» (`MON`), un SKU `LAP-0001` por serie y un `MON-0001` por cantidad **en ambas empresas con el mismo código y nombres distintos a propósito**, 4 laptops con serie y 1 asignada, y algo de auditoría.
- **Cada tabla nueva sigue ADR-06 y ADR-03.** Si algo no está claro, manda el ADR; si el ADR no lo cubre, se pregunta por mensaje al Arquitecto, no se inventa.

### A.6.2 Servicios (Backend) — lo que el Frontend llama

Todo servicio recibe un **contexto** y una entrada, y devuelve datos o lanza `ErrorNegocio`. Los nombres son definitivos; los campos exactos los fija `tipos.ts` en C1.

```ts
// src/nucleo/tipos-comunes.ts
type Contexto = { usuarioId: string; empresaId: string; empresaSlug: string;
                  rolId: string; permisos: ReadonlySet<string> }
type ErrorNegocio = { codigo: 'SIN_ACCESO' | 'SIN_PERMISO' | 'NO_ENCONTRADO' | 'DUPLICADO'
                     | 'VALIDACION' | 'SEPARACION_FUNCIONES' | 'ENLACE_INVALIDO' | 'CONFLICTO';
                     mensaje: string /* español claro */; campos?: Record<string, string> }
// Acciones del Frontend devuelven: { ok: true, datos } | { ok: false, error: ErrorNegocio }

// nucleo/acceso
obtenerContexto(empresaSlug: string): Promise<Contexto>            // lee la cookie; lanza SIN_ACCESO
solicitarEnlace(correo: string): Promise<{ enlaceLocal?: string }>  // enlaceLocal solo en MODO_LOCAL; misma respuesta si el correo no existe
canjearEnlace(token: string): Promise<{ empresas: {slug: string; nombre: string}[] }> // se llama por POST (botón), nunca por GET
cerrarSesion(): Promise<void>
misEmpresas(): Promise<{slug: string; nombre: string}[]>
// modulos/usuarios y roles
listarUsuarios(ctx), invitarUsuario(ctx, {correo, nombre, rolId}): {enlaceLocal?: string}, cambiarRol(ctx, {usuarioId, rolId}), suspender(ctx, {usuarioId})
listarRoles(ctx), crearRol(ctx, {nombre, permisos: string[]}), editarRol(ctx, {rolId, nombre?, permisos?}), catalogoPermisos(): {clave, etiqueta, grupo}[]
// modulos/catalogos
listar|crear|editar de Ubicaciones, Proveedores, Personas (ctx, entrada)  // nombres: listarUbicaciones, crearUbicacion, editarUbicacion, ...
// modulos/categorias
listarCategorias(ctx), crearCategoria(ctx, {nombre, prefijo, campos: CampoDef[]}), agregarCampo(ctx, {categoriaId, campo: CampoDef})
//   CampoDef = {clave, etiqueta, tipo: 'texto'|'numero'|'fecha'|'lista'|'si_no', opciones?: string[], obligatorio: boolean}
// modulos/skus
listarSkus(ctx, {texto?, categoriaId?}), crearSku(ctx, {categoriaId, nombre, control: 'serie'|'cantidad', codigo?, valores: Record<string, unknown>}), obtenerSku(ctx, id)
// modulos/inventario (Backend B)
registrarActivos(ctx, {skuId, ubicacionId, series?: string[], cantidad?: number}), listarActivos(ctx, {texto?, skuId?, estado?, personaId?}),
obtenerActivo(ctx, id), asignarActivo(ctx, {activoId, personaId}), devolverActivo(ctx, {activoId, ubicacionId}), historialActivo(ctx, id)
// modulos/compras (Backend B, S1)
crearOrden(ctx, {proveedorId, lineas: {skuId, cantidad, precioUnitario}[]}), enviarAAprobacion(ctx, id), aprobarOrden(ctx, id), rechazarOrden(ctx, {id, motivo}),
recibirOrden(ctx, {ordenId, lineas: {lineaId, cantidad, series?: string[]}[]}), listarOrdenes(ctx), obtenerOrden(ctx, id)
// nucleo/auditoria
listarAuditoria(ctx, {entidad?, desde?, hasta?})   // el registro lo escribe cada servicio, nunca el Frontend
```

**Reglas del contrato:** (1) toda función del Backend que toca datos usa `conEmpresa` y **verifica el permiso en el servidor** con `definirServicio` antes de nada; (2) el Frontend **no** importa Prisma ni nada de `repos/` ni de `nucleo/aislamiento`: solo `index.ts` de cada módulo y `nucleo/acceso`; (3) los mensajes de error están en español claro; (4) cada servicio que cambia algo escribe **una fila de auditoría en la misma transacción**; (5) los permisos usan los nombres de `docs/registro-permisos.md` cuando existan (Backend los busca con Grep); los que no existan llevan el prefijo `local.` y se listan en la nota de entrega para reconciliar; (6) una función de los módulos de después (`registro.ts`) existe, pero en la 0.1 solo se declaran permisos y eventos.

**Permisos mínimos de la 0.1:** `usuarios.ver`, `usuarios.gestionar`, `roles.gestionar`, `catalogos.ver`, `catalogos.gestionar`, `categorias.gestionar`, `skus.ver`, `skus.gestionar`, `inventario.ver`, `inventario.registrar`, `inventario.asignar`, `compras.ver`, `compras.preparar`, `compras.aprobar`, `compras.recibir`, `auditoria.ver`. **Roles de ejemplo:** Administrador (todos, **salvo** que `compras.aprobar` no lo hace aprobar lo que él preparó: la separación de funciones es de la regla, no del rol), Jefatura TI (ver todo y `compras.aprobar`), Técnico (catálogos, SKU, inventario, preparar y recibir), Consulta (solo ver).

### A.6.3 Pantallas (Frontend)
Rutas: `/` (inicio local con los usuarios de ejemplo), `/entrar`, `/entrar/enlace` (muestra el botón «Entrar»; el canje es un `POST`), `/e/[empresa]` (panel), `/e/[empresa]/usuarios`, `/roles`, `/catalogos/{ubicaciones|proveedores|personas}`, `/categorias`, `/skus`, `/inventario`, `/inventario/[id]`, `/compras`, `/compras/[id]`, `/auditoria`. Cada página llama `obtenerContexto(params.empresa)` y los servicios; las acciones de formulario viven en `acciones.ts` junto a la página y **solo llaman servicios**. Se oculta lo que el permiso no permite, **pero el servidor es quien decide**. Estilo: el del prototipo (`docs/prototipo/`); franja fija «Versión local de prueba»; sin pulir. Formularios con validación clara y el mensaje del `ErrorNegocio`. Accesibilidad básica (etiquetas, contraste, teclado).

## A.7 Paquetes, orden y paralelismo

| Paquete | Dueño | Depende de | Trabaja en paralelo con | Terminado cuando |
|---|---|---|---|---|
| **DEV-1** Esqueleto y arranque | DevOps | nada | todos | `npm ci` y `npm run verificar` pasan; `docker compose up` levanta la base; `iniciar.bat` y `LEEME-PROBAR.md` escritos; entrada del contenedor aplica migraciones y semilla |
| **DAT-1** Base y aislamiento | Ingeniero de Datos | DEV-1 (solo para la base local; puede empezar con su propia base) | Backend, Frontend | migraciones 1 y 2 (roles, FORCE RLS, tablas de acceso, de catálogo y de inventario), `conEmpresa`, `siguiente`, semilla; pasa `pruebas/aislamiento` |
| **BAK-1** Contratos y acceso | Backend A | nada para los tipos; DAT-1 para correr | Frontend, Datos | `tipos.ts` en C1; ingreso, sesión, contexto, permisos, auditoría, usuarios, roles; pruebas unitarias |
| **BAK-2** Catálogos, categorías, SKU | Backend A | BAK-1, DAT-1 | Frontend | servicios con permisos y auditoría; código automático; pruebas |
| **BAK-3** Inventario (y compras si S1) | Backend B | BAK-2 | Frontend | servicios, reglas de serie/cantidad, asignación, historial; pruebas |
| **FRO-1** Estructura y acceso | Frontend | nada (layout); tipos de C1 | todos | layout, inicio local, ingreso, selector de empresa, franja, usuarios y roles |
| **FRO-2** Catálogos, categorías, SKU, inventario (y compras) | Frontend | BAK-2/3 | Backend | recorrido del guion pasa a mano |
| **QA-1** Aislamiento y recorrido | QA | DAT-1 y BAK-1 | Frontend | las pruebas de A.8 en verde; informe corto con lo que falla |
| **SEG-1** Revisión | Seguridad (modelo potente) | QA-1 | — | informe: aislamiento, `MODO_LOCAL`, sesión, permisos en el servidor, secretos; sin críticos ni altos abiertos o rotulado |
| **AUD-1 y AUD-2** | Auditor Técnico, Auditor de Cumplimiento | congelación | — | 15 a 30 minutos cada uno: trazabilidad con el documento funcional; interruptores legales apagados y sin datos personales reales |

**No se pisan archivos** porque cada paquete escribe solo en sus carpetas (A.5) y los puntos de contacto son los tipos y las rutas de A.6. Los únicos cruces (dependencias nuevas, cambios de esquema) se piden por mensaje.

## A.8 Definiciones de «terminado»

**De cada paquete:** el código compila, tiene sus pruebas y pasan, se hizo `git commit` en la rama de trabajo, la nota de entrega dice qué hizo, qué archivos tocó, qué dudas quedaron y qué sigue (regla 7 de CLAUDE.md), y el dueño del contrato vecino confirmó que le sirve.

**De la Versión local 0.1 (para entregarla al CEO):**
1. **Arranque desde cero** en un entorno limpio con `docker compose` (sin node_modules, sin datos): DevOps lo prueba y deja el registro.
2. **Aislamiento (H1 mínimo, QA):** consulta sin filtro = 0 filas ajenas; insertar con empresa ajena falla; clave foránea cruzada falla; UPDATE/DELETE ajenos afectan 0; **2.000 peticiones intercaladas de las dos empresas** con cero filas ajenas, también tras un error y una conexión cortada; una conexión reutilizada sin empresa da **cero filas, sin error**; `app_empresa` no puede modificar ni borrar la auditoría; los roles sin dueño, sin BYPASSRLS y sin superusuario. *(Quedan para el prototipo de ADR: 10.000 peticiones, agrupador en modo transacción, particiones.)*
3. **Permisos en el servidor:** para cada servicio sensible, una prueba con un rol sin el permiso que debe fallar con `SIN_PERMISO` (no solo oculto en pantalla).
4. **Guarda de `MODO_LOCAL`:** con una base externa o en producción, la aplicación no arranca (prueba).
5. **Interruptores legales:** los seis nacen apagados y hay una prueba por cada uno (D-118).
6. **El guion de la demo** pasa de punta a punta, automatizado o, si no se puede, a mano por la Jefatura con registro.
7. **Revisión rotulada:** Seguridad y QA «conformes» (con sus hallazgos) → se entrega como «revisada»; si falta alguno → se entrega como **«avance sin revisar»** y se dice.
8. **Yo doy el visto bueno** a las 19:30; si no lo doy, la Jefatura dice al CEO qué falta.

## A.9 Si el tiempo no alcanza (orden de corte, de lo primero que se suelta)
1. **S2** (pantalla de estado). 2. **S1** (compras y recepción). 3. Compras es todo o nada: si no llega completo (orden, aprobación por otra persona y recepción), no se muestra. 4. Pulido visual. 5. **Devolver y el historial** del activo (se queda registrar, listar y asignar). 6. Filtros del inventario. 7. Los campos de tipo «lista» y «fecha» (quedan texto, número, sí/no). **Lo que NO se suelta jamás:** aislamiento probado, permisos en el servidor, auditoría, `MODO_LOCAL` con su guarda, datos inventados, arranque desde cero.

## A.10 Cómo se integra el trabajo (ramas y commits)
- **Una sola rama de trabajo:** `claude/gifted-pascal-ptgxae`, un solo árbol de trabajo. **Quien termina algo hace `git add` solo de sus rutas y `git commit` con sus rutas explícitas** (`git commit -m "..." -- <rutas>`), mensajes en español y descriptivos; nunca `git add -A` ni `git commit -a` (se llevaría el trabajo ajeno a medias). Si `index.lock` está ocupado, se espera unos segundos y se reintenta. Nadie hace `git push`, rebase ni `reset`: **empuja la Jefatura** a las 15:30, 17:15, 18:30 y 19:30.
- **Commits pequeños y frecuentes** (cada 30 a 45 minutos como máximo) para que el trabajo no se pierda.
- **Si una prueba de otro paquete se rompe**, el que la rompió la arregla o avisa por mensaje al dueño en la primera línea.
- **Nada de contraseñas, claves ni datos reales** en commits (`.env` ignorado; Seguridad lo revisa con la búsqueda de secretos).

## A.11 Las diez primeras tareas (para lanzar ya)

| # | Responsable | Tarea concreta | Entrega | Hora meta |
|---|---|---|---|---|
| 1 | **Backend A** | Publicar `src/nucleo/tipos-comunes.ts`, `errores.ts` y los `tipos.ts` de cada módulo con las firmas de A.6.2; después `definirServicio`, catálogo de permisos | tipos compilando, commit | **14:45 (C1)** |
| 2 | **DevOps** | `package.json` (Next.js, React, TypeScript, Prisma, Tailwind, shadcn/ui, Vitest, Playwright, Auth.js solo si hace falta; sin gastar más de 20 minutos en shadcn: si falla, Tailwind plano), `tsconfig`, `next.config`, estructura de carpetas vacía con `.gitkeep`, `.gitattributes`, `npm run verificar` (tipos + pruebas + búsqueda de secretos) | `npm ci` pasa | **14:40** |
| 3 | **DevOps** | `Dockerfile`, `docker-compose.yml` (base `postgres:16` + app), entrada del contenedor (migrar → semilla si está vacía → arrancar), generación de `.env` con contraseñas aleatorias, ruta `/api/salud` | `docker compose up` levanta (o equivalente probado, A.3) | 15:15 |
| 4 | **Datos** | Migración 1: roles de base, extensiones permitidas, función `mis_empresas`, tablas globales y de acceso (`empresa`, `usuario`, `sesion`, `enlace_ingreso`, `membresia`, `rol`, `rol_permiso`, `auditoria`) con FORCE RLS; `conEmpresa` en `src/nucleo/aislamiento` | migración aplicada en la PostgreSQL 16 local | **14:45** |
| 5 | **Datos** | Migraciones 2 y 3: catálogos, categorías, campos, SKU, valores, contadores y `siguiente`, activos, existencias, asignaciones; (S1) tablas de compras y recepción; `schema.prisma` coherente | `prisma validate` y migraciones aplican limpias | 16:00 |
| 6 | **Datos** | Semilla de las dos empresas (A.6.1) y script `reiniciar-datos` | `npm run db:semilla` repetible | 16:15 |
| 7 | **Backend A** | Acceso: `solicitarEnlace`, `canjearEnlace`, sesión en base (cookie `HttpOnly`, `SameSite=Lax`), `obtenerContexto`, `MODO_LOCAL` con su guarda; usuarios, roles, auditoría | pruebas unitarias en verde | 16:00 (C2) |
| 8 | **Frontend** | Layout, franja «versión local», `/`, `/entrar`, `/entrar/enlace` (botón `POST`), selector de empresa, panel, usuarios y roles con los servicios (o con datos simulados hasta C1) | pantallas funcionando contra el Backend | 16:00 (C2) |
| 9 | **Backend A** | Catálogos, categorías con campos personalizados, SKU con código automático y sobrescritura | pruebas en verde | 16:45 |
| 10 | **Backend B** (desde ~15:00) | Inventario: registrar con series o cantidad, listar, asignar, devolver, historial; luego (S1) compras con separación de funciones y recepción que crea activos | pruebas en verde | 17:15 (C3) |

QA entra a las ~16:15 con `pruebas/aislamiento` y `pruebas/recorrido`; Frontend continúa con catálogos, categorías, SKU, inventario y (S1) compras a medida que el Backend publique.

## A.12 Instrucciones exactas para lanzar a cada desarrollador

Cada encargo se lanza con el modelo `sonnet` (Seguridad, con el más potente). La Jefatura copia el texto; todos empiezan con la misma cabecera.

**Cabecera común (pegar al inicio de cada encargo):**
> Contexto: es la «Versión local 0.1» (D-119). Meta: que el CEO la pruebe hoy 20:00 hora de Lima en Windows con Docker Desktop. Lee SOLO: `CLAUDE.md`, `docs/equipo/plan-etapa-1.md` (parte A completa: es tu contrato), y los ADR que cita tu paquete; para reglas de negocio, `docs/documento-funcional.md` solo en la sección de tu paquete y `docs/registro-permisos.md` por Grep. Escribe SOLO en las carpetas de las que eres dueño (A.5). Solo datos inventados. Nada de contraseñas ni claves en archivos del repositorio. Commits: `git add` de tus rutas y `git commit -m "<mensaje en español>" -- <tus rutas>`, cada 30-45 minutos; nunca `add -A`, `commit -a`, push, rebase ni reset. Pide cambios en carpetas ajenas con `SendMessage` al dueño (primera línea clara). Si algo no está en el documento funcional, no lo inventes: elige lo mínimo, anótalo en tu nota y sigue. Termina con una nota corta para la Jefatura (qué hiciste, archivos, dudas, qué sigue) de máximo 10 líneas.

**1. `devops` (paquete DEV-1; tareas 2 y 3).**
> Eres dueño de: `package.json`, lockfile, `tsconfig.json`, `next.config.mjs`, `.gitattributes`, `Dockerfile`, `docker-compose.yml`, `iniciar.bat`, `detener.bat`, `reiniciar-datos.bat`, `LEEME-PROBAR.md`, `.env.example`, `scripts/`, `ci.yml` (en la carpeta de flujos de GitHub, futuro), `src/app/api/salud/`. (1) En 25 minutos deja `package.json` con Next.js (App Router), React, TypeScript, Prisma, Tailwind, Vitest, Playwright (si la descarga del navegador falla, QA usará pruebas por HTTP), `pg` solo si lo pide Datos; scripts: `dev`, `build`, `verificar` (tipos + pruebas + búsqueda de secretos), `db:migrar` (`prisma migrate deploy`), `db:semilla`, `db:reiniciar`, `local` (arranque). Crea las carpetas de A.5 con `.gitkeep`. Haz commit y avisa a `desarrollador-backend`, `ingeniero-datos` y `desarrollador-frontend` por mensaje. (2) `docker-compose.yml`: servicio `db` (`postgres:16`, volumen nombrado, sin publicar puerto, healthcheck) y `app` (publicado solo en `127.0.0.1:3000`), `MODO_LOCAL=1`. Entrada del contenedor (LF): espera a la base, migra con el rol dueño, carga la semilla si la base está vacía, arranca con el rol `app_empresa`. Crea `.env` con contraseñas aleatorias si no existe (`.env` en `.gitignore`). (3) `iniciar.bat` en CRLF y comandos simples (comprueba Docker, crea `.env` con PowerShell, `docker compose up -d --build`, espera `/api/salud`, abre el navegador), con mensajes en español claro; `detener.bat`; `reiniciar-datos.bat` con confirmación escrita. (4) `LEEME-PROBAR.md` según A.3 para una persona no técnica. (5) A las 18:15, prueba el **arranque desde cero**: clona la rama en una carpeta limpia, `docker compose up --build`, ejecuta la verificación de salud y el guion si QA lo dejó; si Docker no corre en tu entorno, di exactamente qué probaste en su lugar y qué queda sin probar (el `.bat` no se puede probar en Linux: dilo). Usa Node 22.

**2. `ingeniero-datos` (paquete DAT-1; tareas 4, 5 y 6).**
> Eres dueño de: `prisma/**`, `src/nucleo/aislamiento/**`, `src/nucleo/contadores/**`. Lee ADR-03, 04, 05, 06, 15 y `indices-claves-naturales.md` (solo lo que aplique a la tabla que escribes). Implementa A.6.1 al pie de la letra: roles, FORCE RLS en toda tabla de negocio, política por `app.empresa_id`, claves foráneas compuestas, índices únicos con `empresa_id` primero, auditoría solo agregar, `siguiente()` atómico, `mis_empresas` DEFINER, `conEmpresa`. Migraciones SQL a mano en `prisma/migrations/`; `schema.prisma` coherente; usa PostgreSQL 16 local (`/usr/lib/postgresql/16/bin` o Docker). Entrega primero (14:45) la migración 1 y `conEmpresa`; luego las 2 y 3 (16:00) y la semilla (16:15). Antes de dar nada por hecho, ejecuta tú los siete casos de aislamiento de A.8.2 a mano con `psql` como `app_empresa` y deja el guion en `prisma/verificar-aislamiento.sql` para QA. Si Prisma estorba con las transacciones de `conEmpresa` por más de 30 minutos, avisa al Gerente de TI: se permite `pg` solo dentro de `src/nucleo/aislamiento` (D-039.9). Nunca pongas contraseñas en archivos: vienen de variables de entorno.

**3. `desarrollador-backend`, instancia A (paquetes BAK-1 y BAK-2; tareas 1, 7 y 9).**
> Eres dueño de: `src/nucleo/{acceso,permisos,auditoria,configuracion}/**`, `src/nucleo/errores.ts`, `src/nucleo/tipos-comunes.ts`, `src/modulos/{usuarios,roles,catalogos,categorias,skus}/**`. Lee ADR-08 (solo enlace, sesión y cookies; sin segunda verificación hoy), 10, 11, 14 y 17 (campos). PRIMERO (14:45) publica los tipos y firmas de A.6.2 como archivos `.ts` que compilan (los servicios pueden lanzar «no implementado»), haz commit y avisa por mensaje a `desarrollador-frontend`, `desarrollador-backend` (B) y `ingeniero-datos`. Después implementa, en orden: acceso con `MODO_LOCAL` y su guarda (la aplicación se niega a arrancar si `MODO_LOCAL=1` y la base no es local o interna; con prueba), sesión en base (guarda solo la huella del token, nunca el token), `definirServicio` + `exigirPermiso` + auditoría en la misma transacción, usuarios, roles, catálogos, categorías con campos, SKU con código automático (`PREFIJO-0001`, sobrescribible, único por empresa). `src/nucleo/configuracion` declara los seis interruptores `legal.*` de D-118, **todos apagados**, con una función que los consulta; nada los enciende. Pruebas Vitest para cada servicio, incluidas las de `SIN_PERMISO` y `DUPLICADO`. Todo acceso a datos con `conEmpresa` y SQL con parámetros (nada de `$queryRawUnsafe`).

**4. `desarrollador-backend`, instancia B (paquete BAK-3; tarea 10). Se lanza ~15:00, cuando DevOps libere su hueco.**
> Eres dueño de: `src/modulos/{inventario,compras}/**`. Lee los tipos publicados por la instancia A en `src/modulos/*/tipos.ts` y `src/nucleo/tipos-comunes.ts`, el módulo de inventario en `docs/modulos/` solo en lo que describe registrar, asignar y devolver, y ADR-13 y 15. Implementa `registrarActivos` (por serie: una fila por serie, serie única por empresa y SKU; por cantidad: existencia con saldo nunca negativo), `listarActivos`, `obtenerActivo`, `asignarActivo`, `devolverActivo`, `historialActivo`; todo con `conEmpresa`, permiso en el servidor y auditoría. Si el corte C3 (17:15) autoriza S1: compras con `crearOrden`, `enviarAAprobacion`, `aprobarOrden` (**lanza `SEPARACION_FUNCIONES` si el aprobador es quien la preparó**, y la base lo impide también), `rechazarOrden`, `recibirOrden` (recepción parcial, sin pasar de lo pedido, crea los activos). Pruebas Vitest, incluida la de separación de funciones.

**5. `desarrollador-frontend` (paquetes FRO-1 y FRO-2; tarea 8).**
> Eres dueño de: `src/app/**` (menos `src/app/api/salud`), `src/componentes/**`, `src/estilos/**`. Lee A.6.2 y A.6.3, el prototipo `docs/prototipo/` (estilo y estructura) y `LEEME.md` de esa carpeta. Hasta que el Backend publique los tipos (14:45) construye layout, franja fija «Versión local de prueba: solo datos inventados», `/`, `/entrar`, `/entrar/enlace` (botón de envío por `POST`; el canje nunca ocurre por solo abrir el enlace), selector de empresa y panel. Después, pantallas en el orden del guion: usuarios y roles, catálogos, categorías (formulario de campos), SKU (los campos de la categoría aparecen solos), inventario (registrar con series, filtrar, asignar, devolver), auditoría, y (S1) compras. Solo llama a los servicios y a `obtenerContexto`; **nunca** importes Prisma, repos ni `nucleo/aislamiento`. Oculta lo que el permiso no permite, pero muestra siempre el mensaje del servidor si este lo rechaza. Textos en español claro, sin jerga. Si falta un campo o un servicio, pídelo por mensaje a `desarrollador-backend` (primera línea clara). Deja `data-testid` en los botones y campos del guion para QA.

**6. `qa-tester` (paquete QA-1). Se lanza ~16:15.**
> Eres dueño de: `pruebas/**`. Lee A.8 y A.2 (el guion). Escribe y ejecuta: (1) `pruebas/aislamiento/` con los siete casos de A.8.2 contra la base real como `app_empresa` (usa `prisma/verificar-aislamiento.sql` de Datos como punto de partida); (2) `pruebas/arranque/`: la guarda de `MODO_LOCAL` y una prueba por cada interruptor `legal.*` apagado; (3) permisos en el servidor: cada servicio sensible con un rol sin permiso; (4) `pruebas/recorrido/`: el guion de la demo (Playwright; si el navegador no se instala, por HTTP). Reporta defectos por mensaje al dueño del código, con pasos para repetirlos. Entrega a las 18:00 un informe corto: qué pasó, qué falló, qué quedó sin probar. No toques código ajeno.

**7. `especialista-seguridad` (paquete SEG-1; modelo más potente). Se lanza ~17:30.**
> Revisa con foco en: aislamiento (roles, FORCE RLS, políticas, funciones DEFINER, `conEmpresa` como única puerta, ausencia de `set_config` fuera de lugar), sesión y enlace (huella en base, `POST`, cookie), la guarda de `MODO_LOCAL` y que el enlace en pantalla no pueda activarse fuera de local, permisos en el servidor, secretos (nada en el repositorio, `.env` ignorado), SQL crudo, dependencias, y que `docker-compose` no publique la base. Informe en `docs/revision-cruzada/` con hallazgos por gravedad; conforme o no conforme, y qué queda fuera de revisión por tiempo. No corrijas código ajeno: avisa al dueño.

**8. `auditor-codigo` (AUD-1, ~18:15, 30 minutos) y `auditor-cumplimiento` (AUD-2, ~18:30, 15 minutos).**
> Auditor Técnico: trazabilidad de lo construido contra `docs/documento-funcional.md` y el registro de permisos; que no haya dos formas de hacer lo mismo ni un atajo que contradiga un ADR; lista de lo provisional (permisos `local.*`). Cumplimiento: que los seis interruptores `legal.*` estén apagados y probados, que no haya datos personales reales ni correos reales en la semilla, que la auditoría registre quién hizo qué, y que la guía del CEO diga con claridad que son datos inventados y que no es para datos reales.

---

# PARTE B · ETAPA 1 FORMAL (después de la demo de hoy)

**Orden:** (1) el CEO prueba la 0.1 y se anota lo que cambiaría (retrabajo de flujo barato ahora); (2) **prototipo técnico de ADR** (4 días y 1 de reserva); (3) mesa para aceptar los ADR; (4) Etapa 1 formal construida **reusando** de la 0.1 lo que los auditores acepten y descartando el resto.

| Paquete | Qué cubre | Rol | Depende de | Terminado cuando |
|---|---|---|---|---|
| **B1** Prototipo técnico | H1 a H12 de `prototipo-tecnico.md`, local con PostgreSQL 16 y un agrupador de conexiones local en modo transacción; informe `prototipo-resultados.md` | Arquitecto, Ingeniero de Datos; mide QA; revisa Seguridad | 0.1 (aprovecha roles, macros y pruebas) | todas las obligatorias en verde; ADR a «Aceptado» |
| **B2** Acceso completo | Segunda verificación (autenticador), llave física simulada, código corto, código de recuperación, sesión de plataforma, huellas en dos niveles | Backend, Datos, Seguridad | B1 (H6, H8, H9) | casos P1 a P8 y R1 a R6 |
| **B3** Consola de plataforma | Tercer servicio, lectura de soporte, acciones con dos personas, congelación | Backend, Frontend, Datos | B1 (H2) | casos 1 a 18 de H2 |
| **B4** Auditoría completa | Partición mensual, copia externa, purga, cuatro autores | Datos, DevOps | B1 (H3) | H3 en verde |
| **B5** Cola y correo | Cola de trabajos, programador, correo real de captura, limitador | Backend, DevOps | B1 (H5, H7) | H7 en verde |
| **B6** Secretos | Cifrado por propósito, rotación, ensayo de pérdida de la llave maestra | Backend, Seguridad | B1 (H9) | H9 en verde |
| **B7** Empresa de demostración (mínimo) | Tipo de empresa, límites, vigencia, bloqueo, franja (D-116, D-117.4) | Datos, Backend, Frontend | B2 | se bloquea al vencer; guardas en ambos sentidos |
| **B8** Revisión final de la Etapa 1 | Cuatro revisores con modelo potente en lo de permisos y datos; demo al CEO | QA, Seguridad, Auditores | B2 a B7 | cuatro «conformes» y mi visto bueno |
| **B9** Diseño | Diseñador revisa lo construido contra el prototipo y registra diferencias | Diseñador | 0.1 | informe corto |
| **B10** Cierre de la puerta de la Etapa 0 | Condiciones 1, 2, 3, 11 y 12 (lo que se puede cerrar sin el CEO); 5, 6, 8 y 9 quedan con el CEO | Analista, DevOps, QA | en paralelo | ver `puerta-etapa-0.md` |

**Cómo se corre todo localmente (scripts de `package.json`, DevOps):** `npm run local` (arranca todo), `npm run dev` (aplicación en desarrollo), `npm run db:migrar`, `npm run db:semilla`, `npm run db:reiniciar`, `npm test` (Vitest), `npm run probar:aislamiento`, `npm run probar:recorrido`, `npm run verificar` (tipos + pruebas + búsqueda de secretos, es lo que corre la integración continua). En Windows, `iniciar.bat` envuelve `docker compose`.

**Qué trabaja en paralelo sin pisarse en la Etapa 1 formal:** igual que en A.5: cada paquete en sus carpetas, contratos por `tipos.ts`, `package.json` y `prisma/migrations` con un solo dueño (DevOps y Datos); como máximo cuatro agentes a la vez.

**Qué se descarta o se rehace de la 0.1:** el modo local de enlace en pantalla se conserva solo detrás de la guarda; la sesión sencilla se reemplaza por B2; la auditoría simple se reemplaza por B4; todo código sin revisión de los auditores se revisa antes de entrar a la Etapa 1.

## Pendientes y dudas declaradas
- No se sabe si Docker Desktop arranca sin problemas en el equipo del CEO (virtualización, versión de Windows).
- El `.bat` no puede probarse en Linux; solo se prueba el Docker Compose equivalente.
- Los nombres de permisos pueden diferir de `registro-permisos.md`; se reconcilian después (lista en la nota de Backend).
- El tamaño real de la Etapa 1 se mide con la 0.1 (hoja de ruta, sección 9).

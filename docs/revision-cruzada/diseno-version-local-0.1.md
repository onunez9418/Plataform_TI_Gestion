# Revisión de diseño de la Versión local 0.1 (pantallas reales contra el prototipo)

**Autor:** Diseñador UX/UI · **Fecha:** 2026-10-30 (noche, hora de Lima) · **Versión revisada:** commit `1fd4a17` (incluye las correcciones del Frontend `8f6fce6`).
**Capturas:** `docs/prototipo/capturas-v0.1/` (159 archivos, nombre `NN-pantalla-modo-ancho.png`; modo = `claro`/`oscuro`, ancho = `1280` escritorio o `360` móvil).

## 1. Cómo se revisó

- Levanté mi propia PostgreSQL 16 temporal (puerto 54377), apliqué las migraciones, sembré las dos empresas y arranqué la aplicación compilada (`build` + `start`) con `MODO_LOCAL=1`. Todo en carpetas temporales; **ya está apagado**.
- Con Playwright (chromium instalado) recorrí el guion de la demo de punta a punta: ingreso por enlace, selector de empresa, panel, usuarios (invitar, suspender), roles, catálogos, categorías con campos, SKU (código automático, propio, repetido), inventario (series, repetidas, ya existentes, asignar, devolver), auditoría, compras (borrador, enviar, autoaprobación rechazada, aprobación por otra persona, recepción parcial con series) y casos de error de ingreso.
- Capturé las pantallas principales en las **cuatro combinaciones** (1280 y 360, claro y oscuro) y los formularios con errores en 360 claro/oscuro y 1280 oscuro. Revisé por programa, en cada captura: desborde horizontal, contraste (AA), botones y campos sin nombre, un solo título principal y errores de consola.
- Teclado: «Saltar al contenido» es lo primero que recibe el foco, el orden de tabulación es lógico y el foco es visible (contorno de 3 px).
- Contra la versión actual **ya no ocurre** lo que reporté antes (ver sección 2).

**Resultado automático (versión actual):** sin desbordes en ninguna pantalla ni ancho; sin fallos de contraste; todos los campos con etiqueta; un solo título por página. En consola solo aparece un 404 de `/favicon.ico` (inofensivo, ver D-12).

## 2. Defectos que ya estaban corregidos (verificados en la versión actual)

| Qué pasaba | Estado |
|---|---|
| **Bloqueante.** Tras un error de validación, el primer clic en el botón de enviar se perdía (había que pulsar dos veces) en «Asignar», «Devolver», «Crear SKU» y «Agregar un campo». Causa: el mensaje de error desaparecía al salir del campo y el botón subía. Pasos: ficha de un equipo en stock, pulsar «Asignar» sin persona, elegir persona, pulsar «Asignar». | **Corregido** (`8f6fce6`). Verificado: el primer clic ya envía; capturas `60`, `61`, `62`, `51`, `52`, `87-*`. |
| Botones «Abrir mi enlace» y «Abrir el enlace» con letra oscura sobre azul (contraste 2,5:1; 1,9:1 en oscuro). Es el botón del paso 2 del guion. | **Corregido.** Captura `03-entrar-enlace-listo-claro-1280` y `-oscuro-`. |
| Roles: cada permiso mostraba su clave técnica entre paréntesis («(usuarios.ver)»). | **Corregido.** Captura `31`, `86-*`. |
| Panel mostraba el código interno («alfa») en vez del nombre. | **Corregido** (queda un detalle, ver D-05). |

## 3. Defectos abiertos, por prioridad

### 3.1 Bloqueantes para la demo de hoy

**Ninguno abierto.** Hay un riesgo a vigilar (D-01).

### 3.2 A vigilar durante la demo

**D-01. El límite de pedidos de enlace puede frenar al CEO si prueba mucho.**
- Qué pasa: tras 5 pedidos del mismo correo (o 20 desde su computadora) en 10 minutos aparece «Se pidieron demasiados enlaces… Espere 8 minutos… mientras tanto puede usar el último enlace que recibió». En la versión local **no se recibe ningún enlace por correo**, así que el consejo no sirve y el CEO quedaría bloqueado sin salida a mitad de la demo. Me pasó a mí durante la revisión al repetir las pruebas.
- Pasos: pedir enlace 5 veces seguidas con `ceo@demo.local`.
- Propuesta (no es de pantalla, es de DevOps/Backend): en modo local subir los límites (`LIMITE_ENLACES_POR_CORREO` y `LIMITE_ENLACES_POR_ORIGEN` ya existen como variables y **no están puestas en `docker-compose.yml`**) o, al menos, cambiar el texto local por «Espere N minutos o pulse “Reiniciar datos”».
- Para la Jefatura: es la causa más probable de un tropiezo inesperado. Recomiendo resolverlo antes de las 20:00 con la variable, que no requiere código.

### 3.3 Molestos (se ven en la demo, no la impiden)

**D-02. Auditoría con jerga y datos crudos (paso 8 del guion).** Capturas `16-auditoria-claro-1280`, `16-auditoria-claro-360`, `88-*`.
- Columna «Qué hizo»: «activo.asignar», «sku.crear», «categoria.crear», «activo.registrar». Columna «Sobre»: «activo», «sku», «categoria» (minúscula). Detalle: «personaId: 01a18ff5-302f-73c6-…» (identificador largo; apareció al dejar de guardar el nombre, H-SEG-L06), «codigo:», «prefijo:» sin tilde y `series: ["SN-1001","SN-1002"]` con formato de programa. El filtro dice «Tipo de dato: sku, rol, usuario…».
- Propuesta: tabla de textos («Asignó un equipo», «Creó un artículo (SKU)», «Creó una categoría», «Registró equipos»), «Sobre» en palabras de la empresa, etiquetas con tilde, series separadas por coma, y no mostrar claves que terminan en «Id». **Enviado al Frontend.**

**D-03. Cabecera en móvil (360 px): no se ve la empresa activa.** Captura `23-barra-superior-movil-claro-360`, `06-panel-claro-360`.
- El selector de empresa queda reducido a un punto de 23 px y el nombre del usuario se le superpone. Rompe el principio «la empresa en la que trabaja se ve siempre». En 414 px apenas se lee; desde 768 px está bien.
- Propuesta: por debajo de 640 px ocultar el nombre del usuario en la barra (queda en el menú) para que el selector use el espacio. Es CSS (`.barra-fin`). No afecta a la demo en Windows de escritorio.

**D-04. Autoaprobación: el rechazo se ve poco (paso 9).** Capturas `68`, `69-compras-autoaprobacion-rechazada-claro-1280`.
- El botón «Aprobar la orden» está activo para quien preparó la orden; al pulsarlo el rechazo aparece como texto gris pequeño bajo el botón («Quien preparó la orden no puede aprobarla…»). El prototipo lo resolvía con el botón apagado y el motivo escrito. Es el momento que el CEO quiere ver.
- Propuesta: si el usuario es quien preparó la orden, mostrar «Aprobar» apagado con el motivo al lado (como el prototipo), y si igual lo pulsa, un aviso rojo visible con el mismo texto. El servidor ya rechaza correctamente.

**D-05. Texto: «Empresa activa: Alfa S.A.. Elija…»** con doble punto (panel). **Enviado al Frontend.**

**D-06. Texto: error de ingreso con el título «No se pudo guardar».** Aparece cuando el enlace ya se usó o venció (`80-entrar-enlace-ya-usado-claro-1280`) y cuando el correo está mal escrito (`78`). Debe decir «No se pudo entrar». **Enviado al Frontend.**

**D-07. Correo que no es de ejemplo: la pantalla dice «Su enlace de ingreso está listo».** Captura `77-entrar-correo-desconocido-claro-1280`. Si el CEO se equivoca de letra, recibe un enlace que luego falla («El enlace no es válido o ya venció»). Es por diseño (la misma respuesta exista o no el correo, para no revelar quién tiene cuenta). **Pregunta para la Jefatura / Seguridad:** en modo local (donde ya se muestran los correos de ejemplo en el inicio) ¿se puede decir «Ese correo no está entre los usuarios de ejemplo»? Si no, al menos avisar en la pantalla del enlace que puede no ser válido.

**D-08. Categoría con campo de lista sin opciones: el error no dice dónde.** Captura `45-categorias-lista-sin-opciones-error-claro-1280`: aviso general «Revise los datos de la categoría» y ningún campo marcado. Debe marcar «Opciones» con «Escriba al menos una opción».

**D-09. La revisión de series dice «Correcta» a una serie que el servidor rechaza por ya existir.** Capturas `57-inventario-serie-existente-error-claro-1280`: arriba sale el error «Estas series ya están registradas…» pero la tabla de revisión sigue con «✓ Correcta» en esa fila. Propuesta: marcar la fila con «Ya existe para este artículo».

**D-10. «Suspender» no tiene vuelta atrás visible.** Al suspender (pide confirmación; no deja suspenderse a uno mismo, bien) el usuario queda «Suspendido» y su fila ya no ofrece «Reactivar» ni nada, pero el texto de la confirmación dice «hasta que se le vuelva a dar acceso». Capturas `90-usuarios-suspender-tecnico-claro-1280`, `90-usuarios-suspender-ceo-claro-1280`. **Pregunta:** ¿debe haber «Reactivar» en la 0.1? (el permiso «Suspender o reactivar usuarios» lo promete).

**D-11. Nombre del CEO en Beta aparece como su correo** («ceo@demo.local») en la lista de usuarios de Beta, mientras en la barra dice «CEO de demostración». Consecuencia de no mostrar el nombre que otra empresa guardó (H-SEG-L03). Conviene explicarlo al CEO o poner el nombre en la semilla de Beta.

### 3.4 Luego (después de la demo)

- **D-12.** Falta `favicon` (404 en consola) y todas las páginas tienen el mismo título de pestaña («Plataforma de TI · Versión local de prueba»); conviene «Usuarios · Plataforma de TI», etc., por accesibilidad y para distinguir pestañas.
- **D-13.** Íconos repetidos en el menú: Proveedores usa el mismo carrito que Órdenes de compra; Ubicaciones y Categorías usan el mismo portapapeles que Auditoría. Se distinguen por el texto, pero el ícono no ayuda.
- **D-14.** El inicio exige 4 clics para entrar («Entrar como este usuario» → «Pedir mi enlace» → «Abrir mi enlace» → «Entrar»). Es el diseño del plan (el canje es un `POST`), pero en modo local se podría ahorrar un paso dejando el correo ya pedido.
- **D-15.** Orden de compra: el estado aparece dos veces (insignia arriba a la derecha y la cinta de pasos, p. ej. «Borrador»/«Recibida en parte»); el total del formulario dice «Total: 5,101.50» sin «S/» mientras la ficha dice «S/ 5,101.50».
- **D-16.** Mensaje de «Registrado. Ya aparece en la lista.» no dice cuántos equipos se registraron (el prototipo decía «3 activos creados»).
- **D-17.** En el panel, las 11 tarjetas «Abrir» son iguales para cualquier rol (aunque el menú sí se recorta). Un rol de solo lectura ve tarjetas que llevan a pantallas sin acciones; no es un error, pero se podría ocultar lo que no tiene permiso ver.
- **D-18.** Móvil: el menú lateral abierto cubre la franja de «versión local» (se ve cortada) y deja una sombra gris en el borde izquierdo con el menú cerrado (`22-menu-abierto-claro-360`, `06-panel-claro-360`).
- **D-19.** Fechas en formato 29/10/26, 2:18 p. m.; los campos de fecha se muestran como el navegador (en Windows en español saldrá dd/mm/aaaa; en mis capturas en inglés salen mm/dd/yyyy, no es un defecto de la plataforma).
- **D-20.** En el prototipo había «Exportar» y búsqueda en todas las tablas; en la 0.1 solo Inventario, SKU y Auditoría filtran y ninguna exporta (esto está fuera del alcance de la 0.1: se dijo en A.2).

## 4. Lo que está bien (para tranquilidad de la Jefatura)

- Franja «Versión local de prueba: solo datos inventados» siempre visible, en claro y oscuro.
- Estados con **palabra e ícono**, no solo color (En stock, Asignado, Aprobada, Activo, Por serie…).
- Formularios con etiqueta, «(obligatorio)», error bajo el campo y el mensaje del servidor en español claro («Ya existe un SKU con ese código en la empresa.», «IMP-0001: no puede recibir 9; se pidieron 3, ya se recibieron 0 y quedan 3.»).
- Captura de series: pegar lista, ver fila por fila cuál está repetida, botón «Registrar» solo si todo está bien (mejor de lo esperado).
- Los campos de la categoría aparecen solos al elegirla en el SKU; el código automático (IMP-0001) y el propio (se pasa a mayúsculas) funcionan; el repetido se rechaza.
- Empresa ajena por la barra de direcciones: pantalla «Sin acceso» clara, sin datos. Usuario de solo lectura: sin botones de crear/registrar.
- Tablas en móvil se vuelven tarjetas legibles sin desborde; modo oscuro consistente.
- Confirmación antes de suspender; no se puede suspender a uno mismo.

## 5. Qué no revisé

- No probé en Windows ni con Docker Desktop (solo la aplicación compilada en Linux contra PostgreSQL local); tampoco `iniciar.bat`.
- No revisé el lector de pantalla real (solo nombres accesibles y orden de teclado por programa).
- Pantallas de editar (ubicación, proveedor, persona) solo vistas abiertas, sin guardar cambios; la pestaña «Proveedores» y «Personas» quedaron en capturas generales.
- No comparé píxel a píxel con el prototipo: el estilo (colores, botones, etiquetas, tablas) es el mismo; la estructura de las pantallas de recepción, aprobación y roles en matriz del prototipo es más rica que la de la 0.1 (por alcance).

## 6. Preguntas para la Jefatura de Proyecto

1. D-01: ¿se suben los límites de pedido de enlace en el arranque local (variable en `docker-compose.yml`) antes de las 20:00?
2. D-07: ¿se permite, solo en modo local, decir «ese correo no es de ejemplo»?
3. D-10: ¿«Reactivar» entra en la 0.1 o se explica al CEO que queda para la Etapa 1?
4. D-04: ¿el botón de aprobar apagado con motivo (como el prototipo) se hace hoy o queda para después de la demo?

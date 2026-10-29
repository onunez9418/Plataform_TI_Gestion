# Documento funcional: Plataforma de Gestión de Áreas de TI

**Versión:** 0.3 con las filas AN-01 a AN-15 del plan de aplicación (D-065 a D-076) incorporadas, más las observaciones O-1 y O-3 de Cumplimiento (18.1 y RF-DAT-014), la aclaración del motivo en RF-AUD-003 (O-2) y la partición de CA-040 en 040a y 040b (AN-13); pendiente de verificación del Auditor Técnico y de QA antes de pasar a v1.0 (AN-16)
**Fecha:** 2026-10-25
**Estado:** borrador. Lo revisan QA, Seguridad y los dos Auditores; con su visto bueno por escrito y el del Gerente de TI pasa a v1.0 (condición 1 de D-064). Después la Jefatura de Proyecto lo presenta al Cliente (CEO).
**Autor:** Analista de Negocio

> Este documento describe **qué hace** la plataforma, en lenguaje simple. No habla de tecnología, salvo donde una regla técnica es parte del contrato con el Cliente (CEO) (por ejemplo, que la auditoría no se puede alterar).
> Las decisiones **D-001 a D-064** de `docs/equipo/decisiones.md` son obligatorias y están incorporadas aquí. Si una frase de este documento las contradice, vale la decisión y se corrige el documento.
> Los permisos viven en **un solo lugar**: `docs/registro-permisos.md` (PS-nn). Este documento no repite sus celdas.

## Cómo leer este documento

| Marca | Significado |
|---|---|
| **[PENDIENTE]** | Falta un dato o una definición. Siempre dice qué etapa bloquea (sección 23). |
| **[SUPUESTO S-nn]** | Una regla que el Analista propuso y el Gerente de TI no ha cerrado todavía (sección 24). Los resueltos por D-057 y D-065 ya no llevan marca; hoy no queda ninguno abierto. |
| **[ESCALAR AL CEO]** | Solo dinero, tema legal o algo que no se puede deshacer (sección 25). |
| **RF-módulo-NNN** | Requisito funcional. Cada uno dice **Cuándo** se entrega (`v1, Etapa N`, `Fase 2` o `Fase 3`) y qué **criterio de aceptación (CA)** lo comprueba. |
| **RN-NNN** | Regla de negocio que atraviesa varios módulos (sección 21). |
| **RNF-NNN** | Requisito de calidad medible (sección 19). |
| **RS-NN** | Requisito de seguridad (sección 17). |
| **CA-NNN** | Criterio de aceptación "Dado... cuando... entonces...", que cita los requisitos que cubre (sección 22). |
| **P-NNN** | Pendiente, con la etapa que bloquea (sección 23). |
| **PS-nn** | Permiso del registro único (`docs/registro-permisos.md`). |

Los identificadores no se reutilizan ni se renumeran. Un requisito retirado queda marcado "Retirado" con su fecha.

**Qué cambió respecto de la v0.2:** se incorporaron las decisiones D-030 a D-064 y los cambios N-01 a N-23 del plan de correcciones. Lo principal: registro único de permisos; seis tipos de campo (nuevo "secreto") y naturaleza de la categoría; ubicaciones jerárquicas; autor de todo = membresía y datos personales aparte; cese de Personas que nunca se bloquea; regla única de segunda persona (RN-017) con tabla de actos; tabla completa de 25 combinaciones de estados del activo; importación con huella de archivo; puerta única de exportación; auditoría con tres tipos de autor y eventos de seguridad aparte; límites y formatos; mapa de pantallas; tabla maestra de alcance con la columna "Cuándo"; supuestos resueltos según D-057.

---

## 1. Propósito

Una plataforma web para que el área de TI de una empresa controle sus activos tecnológicos (equipos, periféricos, celulares, licencias) y gestione las compras y los servicios que se hacen alrededor de ellos, con trazabilidad de quién hizo qué. Se usa con las empresas que el Cliente (CEO) designe (ver P-004 y la sección 25).

## 2. Alcance, etapas y tabla maestra

**Incluye la versión 1 (v1)**
1. Acceso por invitación con enlace al correo, y administrador de plataforma (secciones 5 y 6).
2. Empresas, usuarios, roles y permisos con registro único (sección 7).
3. Personas que reciben equipos, distintas de los usuarios (sección 8).
4. Catálogos y categorías con campos personalizados, del artículo y de la unidad (sección 9).
5. Maestro de artículos (SKU) (sección 10).
6. Inventario: activos con serie y stock por cantidad, con estados, asignación y acta imprimible (sección 11).
7. Órdenes de compra con aprobación por monto y separación de funciones, y recepción de mercadería (secciones 12 y 13).
8. Órdenes de servicio (sección 14).
9. Importación del Excel de inventario actual y puerta única de exportación (sección 15).
10. Auditoría que no se puede alterar (sección 16).
11. Seguridad, datos personales y continuidad (secciones 17, 18 y 19).
12. Búsqueda global, filtros y exportación a Excel en todas las listas; avisos por correo de invitaciones, accesos y aprobaciones (nada más en la v1).

**No incluye en la v1** (queda para después, ver sección 25 y D-023.2): aprobación en varios niveles o por tipo de orden; varios roles por persona; restricción por sede; subcategorías de varios niveles; conversión de monedas; asignación de cada puesto de licencia a una persona; archivos adjuntos; impresión de etiquetas o códigos QR y escaneo con la cámara; firma o aceptación en pantalla del receptor; estado "en tránsito"; devolución al proveedor y mercadería dañada; avisos automáticos de vencimiento de garantía o licencia; envío automático de órdenes al proveedor; ingreso con Google o Microsoft; segunda persona para bajas de valor; integración con SAP; tickets de soporte; mantenimiento preventivo; reportes avanzados; aplicación móvil propia.

**Regla de alcance (D-056.2):** nada que esté fuera de la v1 se construye antes de que el Cliente (CEO) apruebe la Etapa 7, salvo decisión del Gerente de TI. El **diseño** de las preparaciones sí se hace desde la Etapa 1.

### 2.1 Etapas

Cada etapa termina con una demo que el Cliente (CEO) prueba y aprueba antes de empezar la siguiente.

| Etapa | Qué entrega | Módulos de este documento |
|---|---|---|
| 0 | Este documento aprobado (v1.0), prototipo técnico y de pantallas, documentos reales del Cliente (CEO) | Todo el documento |
| 1 | Acceso, empresas (con país, zona horaria y moneda base), administrador de plataforma, usuarios, roles, registro de permisos, auditoría general, seguridad y gestión de secretos, cola de trabajos y eventos, NOT-base (correos de invitación, acceso y aprobación), contadores y calendario de empresa, módulos activables | ACC, PLA, USR, ROL, AUD, RS |
| 2 | Catálogos, ubicaciones con superior, proveedor ampliado (PRV-A), centro de costo con responsable, áreas y tipos de puesto, directorio de Personas con datos aparte, categorías con naturaleza, motor de campos (con tipo secreto e identificador), puerta única de exportación, registro de solicitudes de derechos | CAT, PER, PRV-A |
| 3 | Maestro de SKU (con stock mínimo opcional) | SKU |
| 4 | Inventario, estados, asignación, actas (ENT-A), garantía (GAR-A), costo del activo corregible, pendientes de la persona, cifrado de claves, importación del Excel; la prueba de carga corre desde aquí en integración nocturna | INV, IMP, ENT-A, GAR-A |
| 5 | Órdenes de compra y recepción, doble control, aprobaciones y sus avisos, referencia externa y centro de costo en la orden | OC |
| 6 | Órdenes de servicio con costo | OS |
| 7 | Pulido, rendimiento, respaldos probados y ensayo de vuelta atrás, salida a producción | RNF, DAT |

**Puerta de salida de la Etapa 0 (D-064):** no se escribe código de funcionalidades hasta que se cumplan las 13 condiciones de D-064 (documento v1.0, 17 módulos sin choques, revisión sin hallazgos Críticos ni Altos, prototipo técnico de 3 a 4 días, proveedores de base y de correo aprobados por el Cliente (CEO), prototipo de las 26 pantallas A aprobado, documentos reales recibidos, cuentas a nombre de la empresa, llaves y secretos, ensayo de restauración, plan de pruebas, tabla de datos personales completa). La opinión legal **no** es parte de la puerta: es condición para cargar datos reales y para producción.

### 2.2 Tabla maestra de alcance

La columna **Cuándo** tiene tres valores: `v1, Etapa N`, `Fase 2` o `Fase 3`. Los módulos partidos tienen una fila por parte (D-056).

| Parte | Qué es | Cuándo |
|---|---|---|
| Núcleo (secciones 5 a 19) | Acceso, empresas, usuarios, roles, personas, catálogos, SKU, inventario, compras, recepción, servicios, importación, auditoría, seguridad | v1, Etapas 1 a 7 (ver 2.1) |
| NOT-base | Correo de invitación, acceso y aprobación (es la misma fuente que RF-ACC-021) | v1, Etapa 1 |
| PRS (módulo Personas) | Amplía el directorio mínimo del núcleo | v1, Etapa 2 |
| PRV-A | Proveedor y contactos, una sola tabla del núcleo | v1, Etapas 2 y 5 |
| ENT-A | Asistente "Entregar", acta imprimible, devolución, traspaso, extravío | v1, Etapa 4 |
| GAR-A | Dato de garantía del activo | v1, Etapas 4 y 5 |
| NOT-completo | Motor de avisos por fecha, bandeja, preferencias | Fase 2, ola A |
| DOM | Dominios y certificados | Fase 2, ola B (primero de la ola) |
| PRV-B | Contratos y compromiso de servicio del proveedor | Fase 2, ola B |
| LIC | Licencias de software (extensión del contrato) | Fase 2, ola B |
| LIN | Líneas móviles | Fase 2, ola B |
| GAR-B | Reclamos y mantenimiento (después de PRV-B) | Fase 2, ola B |
| ENT-B | Avisos de préstamo y acta sin firma, conformidad | Fase 2 (con NOT-completo) |
| AYU | Mesa de ayuda | Fase 2, ola C |
| ONB | Altas y bajas de personal | Fase 2, ola C |
| POR | Portal de autoservicio | Fase 3, ola D |
| CMD | CMDB delgada | Fase 3, ola E (primero de la ola) |
| CAM | Gestión de cambios (después de CMD) | Fase 3, ola E |
| PRB | Gestión de problemas (después de AYU, CMD y CAM) | Fase 3, ola E |
| PRE-A | Presupuesto y costos, primera entrega | Fase 3, ola F (puede adelantarse) |
| REP-A | Tableros y reportes, primera parte | Fase 3, ola F (puede adelantarse) |
| INT-1 | Claves de API de solo lectura | Fase 3, ola F (puede adelantarse) |
| PRE-B, REP-B, REP-C, INT-2, INT-3 | Costos de contratos, tableros de Jefatura, SLA, webhooks y SAP, ingreso con Microsoft o Google | Fase 3, ola F, después de sus dependencias |

**Preparaciones del núcleo** (baratas hoy, migración con datos reales mañana; D-056.5): tipo de autor con tres valores; tipo de campo secreto y marca identificador; naturaleza de categoría; ubicación con superior; proveedor ampliado; centro de costo con responsable y código externo; área y tipo de puesto; Persona con datos aparte; costo y moneda del activo corregibles; stock mínimo; garantía como registro propio; módulos activables, bus de eventos, cola, contadores y calendario de empresa; marca `fuente_costo` en toda obligación de pago; país, zona horaria y monedas de referencia.

## 3. Glosario

| Término | Significado |
|---|---|
| **Cliente (CEO)** | La persona que pidió la plataforma. No es un rol dentro de la plataforma. |
| **Empresa** | Una organización que usa la plataforma. Sus datos están completamente separados de los de otras empresas. Tiene país, zona horaria, moneda base y calendario. |
| **Administrador de plataforma** | Persona del equipo de TI, fuera de cualquier empresa, que crea y suspende empresas. No ve los datos del negocio. |
| **Administrador (de empresa)** | Rol de una empresa que gestiona usuarios, roles y configuración. No es el administrador de plataforma. "Administrador activo" = quien tiene administrar roles y cambiar el rol de usuarios. |
| **Cuenta** | Identidad global de una persona (correo normalizado y segunda verificación). No pertenece a ninguna empresa. |
| **Membresía** | La relación de una cuenta con una empresa: su rol, su estado y su nombre visible en esa empresa. Todo lo que se hace en una empresa queda a nombre de la membresía. |
| **Usuario** | Quien entra a la plataforma: una membresía con su cuenta. Estados: Invitado, Activo, Suspendido, Dado de baja. |
| **Persona** | Empleado, externo o custodio que recibe equipos. Puede no tener acceso a la plataforma. Estados: Activa, Cesada, Anonimizada. Su referencia es `PRS-0042`. Se vincula 1 a 1 a una membresía solo si también entra al sistema. |
| **Rol** | Conjunto de permisos que se asigna a una membresía. Hay siete plantillas (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, Solo lectura, Empleado (portal)); cada empresa edita su copia. |
| **Solicitante** | Un rol: crea solicitudes de compra o de trabajo y ve las propias. No tiene relación con el Cliente (CEO). |
| **Pedido por** | El campo que dice quién pidió una orden de compra, una orden de servicio, un caso o un cambio. |
| **Solicitud** | No es un documento aparte. Una solicitud de compra es una orden de compra en Borrador. Una **solicitud de trabajo** es una orden de servicio en estado Creada. Con el módulo de mesa de ayuda (Fase 2) la puerta para pedir ayuda es el caso y la orden de servicio la crea el técnico desde el caso. El botón es siempre "Pedir ayuda". |
| **Permiso sensible** | Permiso que se da por separado porque expone dinero o datos personales o es delicado de administrar; exige segunda verificación a quien lo tenga. La lista está en `docs/registro-permisos.md`. |
| **Alcance de un permiso** | "Todo" (toda la empresa) o "Propio" (solo lo que la persona creó o le corresponde). |
| **SKU** (también "artículo") | Código que identifica un *tipo* de artículo. Ej.: `LAP-0001` = Laptop Dell Latitude 5440 i7/16GB. Existe una sola vez por empresa. "Artículo" significa siempre SKU; a las unidades físicas se les llama activos. |
| **Serie** | Identificador visible de una unidad física concreta (número de serie; para una licencia, un código como `M365-2026-A`). Un SKU por serie puede tener muchas series. |
| **Activo** | Una unidad física o digital con serie que la empresa posee (una laptop, un celular, una unidad de licencia). Es un solo registro para siempre. Solo los activos de naturaleza "equipo físico" tienen garantía, mantenimiento y depreciación. |
| **Código del activo** | Identificador visible y propio de cada activo, con la forma `ACTV-000123` (D-079). Es un correlativo por empresa que se asigna al crear el activo y no cambia nunca. No es la serie ni el código del SKU, no es un dato personal, y es lo que se escribe en correos y avisos en lugar de la serie. |
| **Naturaleza** (de una categoría) | Atributo fijo de la categoría: **equipo físico** (por defecto), **licencia** o **servicio**. Se hereda a subcategorías, SKU y activos. |
| **Stock** | Conteo de un SKU controlado por cantidad (mouses, cables), por ubicación. El stock no se llama "activo". |
| **Control por serie / por cantidad** | El SKU se rastrea unidad por unidad, o solo con un conteo. |
| **Unidad de medida** | Cómo se cuenta un SKU (pieza, caja, metro). Distinta de la unidad física. |
| **Categoría / Subcategoría** | Agrupación de SKU. Define el prefijo del código, la naturaleza y los campos extra. Solo un nivel de subcategoría. |
| **Campo del artículo / de la unidad** | Dato que vale para todo el SKU (RAM) o que es distinto en cada unidad (IMEI, vencimiento de una clave). |
| **Campo secreto** | Tipo de campo cifrado, nunca visible en historial, auditoría, exportaciones, importaciones, reportes, correos ni registros técnicos (por ejemplo la clave de una licencia). |
| **Campo identificador** | Campo de texto único por empresa y normalizado (por ejemplo el IMEI). |
| **Catálogo** | Lista de valores que el administrador mantiene (marcas, modelos, proveedores, ubicaciones, áreas, centros de costo, unidades de medida). |
| **Ubicación** | Lugar donde está un activo o stock. Forma un árbol de hasta 3 niveles (Sede, Piso, Sala). |
| **Responsable** | La Persona de la asignación abierta de un activo. Es el mismo dato que "asignado a". |
| **Asignación** | Entrega de un activo a una Persona. Termina con una devolución, una baja o un extravío. "Prestado" es una asignación con fecha de devolución prevista. |
| **Pendiente de devolución** | Marca (no es un estado) de un activo Asignado a una Persona cesada que no lo devolvió. No es extravío. |
| **Pendientes de la persona** | Lista, visible en su ficha, de lo que una Persona cesada todavía tiene (activos, líneas, licencias, dominios, elementos). |
| **Traslado** | Mover stock de una ubicación a otra, de forma inmediata. |
| **Traspaso** | Pasar un activo de una Persona a otra en un solo acto. |
| **Baja / Cesar / Anular / Cancelar** | Dar de baja: retiro definitivo de un activo, línea, dominio o usuario. Cesar: la salida de una Persona. Anular: dejar sin efecto un documento ya emitido. Cancelar: detener un trabajo en curso. Cada uno exige motivo donde lo dice este documento. |
| **Reingreso** | Reactivar el mismo registro de un activo dado de baja o extraviado que vuelve. |
| **Garantía** | Fecha de fin y datos de la garantía de un equipo físico. En la v1 solo se guarda; no avisa. |
| **Centro de costo** | Área o presupuesto al que se carga un gasto. Tiene responsable (una Persona) y código externo opcionales. |
| **Correlativo** | Número que aumenta de uno en uno para formar un código. Nunca se repite; puede haber saltos. |
| **Orden de compra (OC)** | Documento para comprar SKU a un proveedor. Número `OC-000042`. |
| **Recepción** | Registro de que llegó mercadería de una OC. Número `RCP-000042`. Aquí se capturan las series y nacen los activos. |
| **Orden de servicio (OS)** | Documento para pedir o registrar un trabajo. Número `OS-000042`. |
| **Auditoría** | Registro que solo se agrega, de quién hizo qué y cuándo. Distinto del historial de un activo. |
| **Eventos de seguridad** | Registro aparte de intentos rechazados, accesos y inicios de sesión fallidos. |
| **Historial** | Lo que le pasó a un activo o stock. Es dato del negocio. |
| **Todo o nada** | Una operación de varias partes se completa entera o no se hace. |
| **Vista previa** | Pantalla que muestra lo que pasaría antes de confirmar, sin guardar nada. |
| **Trabajo en segundo plano** | Tarea larga o diaria (importar, exportar, avisos) que corre fuera de la pantalla, con barra de avance. Usa una cola dentro de la misma base de datos; no agrega servicios. |
| **Interruptor único de excepciones** | Ajuste por empresa, "Excepciones de separación de funciones", con una casilla por regla exceptuable. Todas apagadas por defecto. |
| **Congelación por incidente** | Pausa de la anonimización y de las purgas sobre una empresa, o sobre ciertas Personas de ella, mientras el equipo conserva la evidencia de un incidente de datos (una fuga o un acceso indebido). No borra ni cambia nada: al levantarla, lo que quedó en espera se retoma. La declara el Administrador de plataforma (D-080, RF-DAT-017). |

## 4. Ciclo de vida general de un activo, de punta a punta

1. El proveedor entrega y el Almacén **recibe** contra una orden de compra aprobada (sección 13): nacen los activos con su serie.
2. El Técnico **entrega** el activo a una Persona y se genera el **acta** (sección 11.3).
3. El activo puede ir a **reparación** y volver; si se pierde pasa a **extraviado o robado**.
4. Al terminar su vida útil se da de **baja** con motivo. Si vuelve, se hace un **reingreso** del mismo registro.
5. Cada paso queda en el **historial** del activo y en la **auditoría**.

Los activos que ya existen en el Excel del Cliente (CEO) entran por la **importación** (sección 15) sin orden de compra de origen. Los que llegan por una compra sin orden o una donación entran por el **ingreso manual** (RF-INV-025).

---

## 5. Acceso y empresas

Basado en D-001, D-002, D-041, D-046, D-048, D-054. Etapa 1.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-ACC-001 | No hay registro abierto: solo entra quien tiene una invitación. | v1, Etapa 1 | CA-006 |
| RF-ACC-002 | Una empresa la crea el Administrador de plataforma (PS-01), que invita al primer administrador y registra un **contacto autorizado** de la empresa. | v1, Etapa 1 | CA-015d |
| RF-ACC-003 | Sirve cualquier correo (personal o corporativo), siempre con invitación. | v1, Etapa 1 | CA-005 |
| RF-ACC-004 | No existe la unión por dominio de correo, por búsqueda de empresa ni por código público. | v1, Etapa 1 | CA-006 |
| RF-ACC-005 | Se entra con un enlace que llega al correo. No hay contraseñas en la v1. | v1, Etapa 1 | CA-006 |
| RF-ACC-006 | El enlace de acceso dura 15 minutos y sirve una sola vez. Abre una página con el botón "Entrar" y queda **atado al navegador** que lo pidió, para que un filtro de correo no lo gaste. Si se abre en otro dispositivo, el navegador de origen muestra un **código corto de 8 caracteres** que se escribe en el otro dispositivo (D-073.4). Al usarlo el correo queda verificado. | v1, Etapa 1 | CA-068 |
| RF-ACC-007 | Las invitaciones vencen a los 7 días, se usan una sola vez, quedan ligadas al correo al que se enviaron y el administrador las puede cancelar. Su texto es fijo (sin campos libres) y nunca dice si el correo ya tiene cuenta. | v1, Etapa 1 | CA-005 |
| RF-ACC-008 | Quien invita no puede dar un rol con más permisos que el suyo. | v1, Etapa 1 | CA-010 |
| RF-ACC-009 | Si el correo invitado ya tiene cuenta, la empresa se suma a la misma cuenta **solo cuando la persona abre y acepta**; se le avisa que se le sumó una empresa. | v1, Etapa 1 | CA-005 |
| RF-ACC-010 | Los correos se guardan y comparan sin distinguir mayúsculas (comparación Unicode, sin quitar puntos ni etiquetas `+`). | v1, Etapa 1 | CA-005 |
| RF-ACC-011 | La cuenta es global y mínima. Todo lo que se hace en una empresa queda a nombre de la **membresía**. Una empresa nunca ve a qué otras pertenece alguien. | v1, Etapa 1 | CA-004 |
| RF-ACC-012 | **La empresa activa va en la dirección de la página** (`/e/{empresa}/...`) y en cada acción. El servidor la compara con la membresía en cada petición. Cambiar de empresa es navegar a otra dirección; la pantalla anuncia "Ahora trabaja en: [Empresa]". Los enlaces de los correos llevan la empresa; si no es miembro, responde "no encontrado". El cambio queda en la auditoría. | v1, Etapa 1 | CA-004 y CA-079 |
| RF-ACC-013 | **La segunda verificación** (aplicación autenticadora, sin SMS) es obligatoria a **toda membresía que tenga algún permiso sensible** del registro (52 permisos tras D-068 y D-074: incluyen las aprobaciones de dinero, el monto límite y la moneda base, revertir una recepción y los webhooks), no según el nombre del rol. Es opcional para los demás. Una Jefatura TI que aprueba órdenes la necesita. | v1, Etapa 1 | CA-007 y CA-081 |
| RF-ACC-014 | Las sesiones vencen a los 30 minutos sin actividad y a las 12 horas en total. A los 25 minutos se avisa y se ofrece seguir. | v1, Etapa 1 | CA-069 |
| RF-ACC-015 | Existe "cerrar sesión en todos los dispositivos". | v1, Etapa 1 | CA-008 |
| RF-ACC-016 | Suspender o dar de baja a alguien en una empresa corta sus sesiones en esa empresa al instante. | v1, Etapa 1 | CA-008 |
| RF-ACC-017 | Tras **5 intentos fallidos** la espera crece: 1, 2, 5 y 15 minutos. Los tiempos de respuesta son iguales exista o no el correo y no se envía nada a correos sin cuenta ni invitación. El mensaje de error nunca dice si un correo existe. | v1, Etapa 1 | CA-006 |
| RF-ACC-018 | Recuperación de acceso: como no hay contraseña, se pide un enlace nuevo. Cada persona con segunda verificación recibe **10 códigos de recuperación** de un solo uso, mostrados una sola vez; la reposición la hace otro administrador. | v1, Etapa 1 | CA-082 |
| RF-ACC-019 | Si una empresa pierde a su único administrador (o este pierde factor y códigos), lo recupera el Administrador de plataforma con el procedimiento de rescate de la sección 6. | v1, Etapa 1 | CA-015c |
| RF-ACC-020 | Al crear una empresa se recomienda tener al menos dos administradores; el sistema lo avisa. | v1, Etapa 1 | CA-009 |
| RF-ACC-021 | **Correos de la v1 (NOT-base):** invitación, enlace de acceso, aviso a quien aprueba cuando hay una orden pendiente y aviso a quien creó cuando se aprueba o rechaza. Ningún otro correo entra a la v1 (D-061.4). El servicio de envío tiene costo mensual: **[ESCALAR AL CEO]** (sección 25, D1). | v1, Etapas 1 y 5 | CA-074, CA-NOT-01 y CA-NOT-20 |
| RF-ACC-022 | Una empresa suspendida por la plataforma no permite entrar a ninguno de sus usuarios; sus datos se conservan, no se borran. | v1, Etapa 1 | CA-015d |
| RF-ACC-023 | Al primer ingreso se pide aceptar el aviso de privacidad y los términos; quedan registradas la versión y la fecha. **Cuando cambia la versión se vuelve a pedir** la aceptación. El texto lo define legal: **[ESCALAR AL CEO]** (sección 25, L-03). | v1, Etapa 1 | CA-049 |
| RF-ACC-024 | Las acciones delicadas (ver clave de licencia, exportar, importar, administrar roles y usuarios, activar excepciones, cambiar titular de dominio, crear claves de API) piden **reautenticación reciente** (enlace nuevo o segundo factor, vigente 10 minutos). | v1, Etapa 1 | CA-007 |
| RF-ACC-025 | Hay pantallas de "Primeros pasos" (para el administrador de una empresa nueva), "Mi cuenta y seguridad" (cerrar sesiones, códigos de recuperación, segunda verificación) y "Mis permisos" (qué puedo hacer). "Primeros pasos" incluye la tarea **"Designar suplente de derechos de datos"** (RF-PER-012). | v1, Etapa 1 | CA-050b y CA-093 |
| RF-ACC-026 | Un correo de invitación enviado a un buzón con filtro no se gasta: el enlace de ingreso exige el botón y el navegador de origen (RF-ACC-006). Si el correo llega a spam o falla, un administrador puede pedir al Administrador de plataforma un acceso de emergencia (RF-PLA-009). | v1, Etapa 1 | CA-068 |

## 6. Administrador de plataforma y empresas

Basado en D-003, D-039, D-044.8, D-048, D-037 fila 12. Etapa 1.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-PLA-001 | Existe el rol Administrador de plataforma, fuera de cualquier empresa. Son **2 a 3 personas** del equipo de TI y, **antes de cargar datos reales, al menos dos** (con datos inventados puede haber una) (D-073.1); con segunda verificación obligatoria y **llave de seguridad física**, acceso desde red restringida y códigos de recuperación fuera de línea con dos custodios. | v1, Etapa 1 | CA-007 y CA-015f |
| RF-PLA-002 | Puede crear, suspender y reactivar empresas (PS-01). Al crear una empresa define `país`, `zona horaria` y `moneda base`, y registra el contacto autorizado. | v1, Etapa 1 | CA-015d |
| RF-PLA-003 | **Rescate** de una empresa sin administrador (PS-02): lo hacen **dos personas** de plataforma; si solo hay una, se confirma por otro medio con el contacto autorizado que la empresa registró; hay una **espera de 24 horas** salvo emergencia declarada por ambas; se avisa por correo a todos los usuarios activos y administradores; se guarda la evidencia. | v1, Etapa 1 | CA-015c |
| RF-PLA-004 | **No ve** los datos del negocio de las empresas (activos, compras, personas, precios). Lo impone la base de datos con un rol que solo ve tablas globales, no solo una ruta. | v1, Etapa 1 | CA-015a |
| RF-PLA-005 | **Soporte (PS-03):** solo lectura, una empresa y un motivo por vez, máximo 24 horas, autorizado por el Administrador de esa empresa, con un banner "sesión de soporte" y entradas visibles en la **auditoría de la propia empresa**. | v1, Etapa 1 | CA-015b |
| RF-PLA-006 | Vive en una zona separada del sistema, con ruta, permisos y color propios. Nadie entra directo a la base de datos de producción para tareas rutinarias. | v1, Etapa 1 | CA-015a |
| RF-PLA-007 | Hay **dos registros**: el **de plataforma** (crear, suspender, rescatar, límites) y el **de empresa** (todo lo que soporte vio o hizo en ella). | v1, Etapa 1 | CA-041 |
| RF-PLA-008 | No puede activar en nombre de una empresa el interruptor único de excepciones. | v1, Etapa 5 | CA-070 |
| RF-PLA-009 | **Acceso de emergencia (PS-05):** si el correo falla, emite un acceso excepcional de un solo uso a un administrador de empresa, tras verificar su identidad por otro medio. **Exige a una segunda persona de plataforma o al contacto autorizado confirmado**, avisa a todos los administradores de la empresa y tiene un tope de **un uso por empresa y por semana**; la segunda verificación se sigue exigiendo y todo queda auditado. No se agregan contraseñas. | v1, Etapa 1 | CA-015f |
| RF-PLA-010 | Puede subir por un periodo corto los topes de una empresa (invitaciones, carga inicial) (PS-04); el aumento vence solo y queda en el registro de plataforma. | v1, Etapa 1 | CA-084 |
| RF-PLA-011 | **Contacto autorizado (D-065, S-34):** lo registra el Administrador de plataforma al crear la empresa y lo **confirma el primer administrador** al aceptar la invitación. Cambiarlo lo hace un administrador de la empresa, con **espera de 24 horas** y aviso por correo a todos los administradores. | v1, Etapa 1 | CA-015e |
| RF-PLA-012 | **Veto durante el rescate (D-065, S-34):** durante la espera de 24 horas de un rescate, cualquier administrador activo de la empresa puede vetarlo; el rescate se detiene y queda en el registro de plataforma. | v1, Etapa 1 | CA-015e |
| RF-PLA-013 | **Cómo lee soporte los datos (D-039.10, S-34):** la sesión de soporte usa una tabla global de autorizaciones de soporte y una transacción de solo lectura limitada a la empresa autorizada y al tiempo autorizado, mediante una función puntual de acceso; el rol de plataforma por sí solo ve únicamente tablas globales. Hay una prueba con la autorización vencida, ajena o ya usada por otra persona (CA-015g); la lectura de soporte tampoco ve las columnas secretas ni la cola de solicitudes de derechos (CA-015h). | v1, Etapa 1 | CA-015b, CA-015g, CA-015h y CA-015i |

### 6.1 Datos de la empresa

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-EMP-001 | Una empresa tiene `país`, `zona horaria` y `moneda base` desde la Etapa 1. Las monedas salen de una tabla global (código de 3 letras y decimales). | v1, Etapa 1 | CA-071 |
| RF-EMP-002 | **No se puede cambiar la moneda base** de una empresa con órdenes abiertas ni con presupuestos aprobados. | v1, Etapa 5 | CA-071 |
| RF-EMP-003 | Cambiar la zona horaria recalcula los avisos pendientes. | v1, Etapa 1 | CA-071 |
| RF-EMP-004 | Cada empresa tiene un **calendario de empresa** compartido por los módulos (zona horaria, horario de atención, feriados). Los plazos son en días corridos salvo que un módulo use este calendario. | v1, Etapa 1 | CA-071 |
| RF-EMP-005 | **Módulos activables:** el Administrador de la empresa activa o desactiva módulos en Configuración (PS-09, sensible, auditado). Desactivar oculta el módulo y sus permisos pero **no borra datos**; mientras esté apagado la API responde "no encontrado". Al activarlo, sus permisos se ofrecen como plantilla sugerida y los roles personalizados no cambian solos. Cada módulo cumple RNF-015, RNF-016 y CA-053 antes de uso real. | v1, Etapa 1 | CA-075 |

## 7. Usuarios, roles y permisos

Basado en D-004 (reescrita), D-036, D-037, D-048. Etapa 1.

### 7.1 Usuarios

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-USR-001 | Un usuario tiene uno de estos estados en cada empresa: Invitado, Activo, Suspendido, Dado de baja. | v1, Etapa 1 | CA-052c |
| RF-USR-002 | Un usuario nunca se borra; se suspende o se da de baja. | v1, Etapa 1 | CA-045 |
| RF-USR-003 | Suspender corta el acceso al instante y se puede revertir. **Dar de baja** a un usuario **siempre se permite**, corta sus sesiones al instante y no se bloquea por activos asignados. | v1, Etapa 1 | CA-052c |
| RF-USR-004 | **Retirado (2026-10-25).** Estaba duplicado con RF-PER-006; el bloqueo ya no es de la baja del usuario (D-057 S-03). | - | - |
| RF-USR-005 | Las órdenes abiertas de un usuario dado de baja se reasignan o se cancelan con motivo. | v1, Etapa 5 | CA-052d |
| RF-USR-006 | Dar de baja no borra el historial. Los datos personales se anonimizan pasado el plazo de la sección 18, y solo cuando legal lo confirme. | v1, Etapa 1 | CA-045 y CA-054a |
| RF-USR-007 | Cada alta, suspensión, baja y cambio de rol queda en la auditoría. | v1, Etapa 1 | CA-041 |
| RF-USR-008 | Un usuario puede estar vinculado a una Persona (1 a 1, opcional). | v1, Etapa 2 | CA-052c |

### 7.2 Roles y permisos

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-ROL-001 | Cada usuario tiene **un solo rol** en cada empresa. El rol vive en la membresía: la misma persona puede tener roles distintos en empresas distintas. | v1, Etapa 1 | CA-047 |
| RF-ROL-002 | Hay **siete plantillas** de rol (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, Solo lectura y Empleado (portal)). Se copian al crear la empresa; cada empresa edita su copia sin afectar a las demás. "Empleado (portal)" es de lista cerrada y alcance propio; en la v1 no hay portal. | v1, Etapa 1 | CA-047 |
| RF-ROL-003 | Cada permiso tiene un alcance: "todo" o "propio". Qué es "propio" lo define un resolvedor por tipo de recurso (registro de permisos, sección 2). Quien tiene alcance "propio" y no tiene Persona vinculada ve una lista vacía, nunca un error. No hay restricción por sede en la v1. | v1, Etapa 1 | CA-011b |
| RF-ROL-004 | **Existe un registro único de permisos** (`docs/registro-permisos.md`) con PS-nn, nombre técnico `modulo.accion`, nombre en español, módulo, sensible, alcance, controles (reautenticación, segunda verificación, auditoría, tope, no sobre lo propio) y valor por defecto por rol. Los módulos agregan filas, no cambian celdas del núcleo. Fuera del registro no hay permiso. | v1, Etapa 1 | CA-011a |
| RF-ROL-005 | Los permisos globales sensibles son uno solo de cada uno: ver datos personales (`datos_personales.ver`), ver precios de toda la empresa (`precios.ver`; los precios de lo propio, que ven Técnico y Solicitante, son `precios.ver_propios` y no son sensibles), ver auditoría (`auditoria.ver`), **exportar (`datos.exportar`)** e **importar (`datos.importar`)**, más el monto límite y la moneda base (`empresa.configurar_aprobacion`), administrar roles y usuarios y los demás marcados "S" en el registro (52 en total). Importar y exportar vienen activados solo para el Administrador. Solo lectura no ve precios ni datos personales (ve la referencia `PRS-0042`). | v1, Etapa 1 | CA-011b |
| RF-ROL-006 | Todo rol nuevo parte sin ningún permiso. | v1, Etapa 1 | CA-047 |
| RF-ROL-007 | Nadie puede darse permisos a sí mismo, ni crear o asignar un rol con más permisos de los que tiene. Los cambios del rol propio los hace otro administrador. | v1, Etapa 1 | CA-010 |
| RF-ROL-008 | La empresa siempre tiene al menos un administrador activo (quien tiene administrar roles y cambiar el rol de usuarios). El sistema impide quitar, suspender o bajar de rol al último, aunque cambie de rol. | v1, Etapa 1 | CA-009 |
| RF-ROL-009 | El rol Administrador de la plantilla incluye todos los permisos, pero la separación de funciones (RN-010) y la prohibición de autoentrega se aplican también a él. | v1, Etapa 1 | CA-012 |
| RF-ROL-010 | Todo permiso se comprueba en el servidor. Ocultar un botón en pantalla es comodidad, no seguridad. La API usa los mismos permisos y los mismos servicios que las pantallas. | v1, Etapa 1 | CA-011a |
| RF-ROL-011 | Un cambio de rol vale desde la siguiente acción de esa persona, sin esperar a que cierre sesión. | v1, Etapa 1 | CA-008 |
| RF-ROL-012 | Un rol con usuarios asignados no se puede eliminar; se reasignan primero o se desactiva el rol. | v1, Etapa 1 | CA-047 |
| RF-ROL-013 | Los cambios en roles y permisos quedan en la auditoría con valor anterior y nuevo. | v1, Etapa 1 | CA-041 |
| RF-ROL-014 | Una prueba automática falla si el código usa un permiso que no está en el registro, y QA genera la matriz de pruebas desde el registro (una petición directa por celda). Cambiar una celda del registro exige visto bueno del Gerente de TI. | v1, Etapa 1 | CA-011a |
| RF-ROL-015 | Un módulo declara en el registro de módulo sus permisos, eventos, pendientes de la persona, proveedores de búsqueda y de vencimientos; una prueba de dependencias falla si hay ciclos entre módulos. | v1, Etapa 1 | CA-077 |

### 7.3 Resumen por rol y celdas resueltas

La matriz completa módulo × acción × rol **no se repite aquí**: es el registro `docs/registro-permisos.md` (PS-01 a PS-230). Resumen:

| Rol | En resumen |
|---|---|
| Administrador | Todo lo de su empresa, incluidos los sensibles, con la separación de funciones y la prohibición de autoentrega también para él |
| Jefatura TI | Ver casi todo (precios, datos personales, auditoría), aprobar y emitir órdenes, cesar Personas, reingreso, cerrar órdenes y revertir recepciones; no importa ni exporta, no administra roles |
| Técnico | Inventario, entregas, órdenes de servicio, SKU, catálogos y ubicaciones; ve datos personales; precios solo en lo que crea; no cesa Personas ni ve auditoría |
| Almacén | Recibe mercadería, mueve stock, corrige series y ubicación; no entrega equipos, no ve nombres ni precios |
| Solicitante | Crea solicitudes de compra (sin precios) y de trabajo, y ve las propias |
| Solo lectura | Consulta sin modificar; ve referencias de Personas, sin precios |
| Empleado (portal) | Solo lo propio, por el portal (Fase 3) |
| Administrador de plataforma | Solo la zona de plataforma; no ve datos del negocio |

Las 13 celdas que antes chocaban (D-037) quedan así: (1) importar y exportar solo Administrador; (2) clave de licencia solo Administrador; (3) crear y desactivar proveedores solo Administrador, ver contactos Administrador, Jefatura TI y Técnico; (4) cesar Personas: Administrador y Jefatura TI (si hay Usuario vinculado hace falta además suspender usuarios); (5) ubicaciones Administrador y Técnico, centros de costo, áreas y tipos de puesto solo Administrador; (6) entregar, devolver y traspasar: Administrador y Técnico, no Almacén; extravío: Administrador, Jefatura TI y Técnico; reingreso: Administrador y Jefatura TI; (7) ver datos personales: Administrador, Jefatura TI y Técnico; (8) alta rápida de Persona: Técnico y Administrador; (9) el acta en PDF sin `datos_personales.ver` omite nombre y área; (10) precios: Administrador y Jefatura TI, y Técnico y Solicitante solo en las órdenes que ellos crean o editan; (11) plantilla Empleado (portal) de lista cerrada; (12) activar módulos: Administrador, sensible y auditado; (13) segunda verificación por permiso sensible, no por nombre de rol.

## 8. Personas que reciben equipos

Basado en D-006, D-033, D-034, D-040, D-041, D-058.7, D-061. Etapa 2. El módulo de Personas (`RF-PRS`) amplía lo mínimo de esta sección.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-PER-001 | Existe el directorio de **Personas** (empleados, externos o custodios), distinto de los usuarios. Los activos se asignan a Personas. Cada una tiene referencia `PRS-NNNN` (mínimo 4 dígitos). | v1, Etapa 2 | CA-016a y CA-016b |
| RF-PER-002 | Datos mínimos de una Persona: nombre, tipo (Empleado, Externo, Custodio), código de empleado, puesto (tipo), área, ubicación habitual, jefe directo (visible solo con `datos_personales.ver`), fechas de ingreso y de cese, y correo (opcional). Cada campo tiene finalidad declarada. | v1, Etapa 2 | CA-016a |
| RF-PER-003 | No se guarda documento de identidad, dirección ni teléfono personal en la v1. | v1, Etapa 2 | CA-016a |
| RF-PER-004 | Una Persona se vincula 1 a 1 a una membresía (opcional); los datos personales viven en una tabla aparte y todo lo demás apunta a la Persona por identificador y referencia. | v1, Etapa 2 | CA-054a |
| RF-PER-005 | Una Persona nunca se borra; se **cesa** (estado Cesada) y, pasado el plazo y con la confirmación de legal, se anonimiza (estado Anonimizada). Cesar a una Persona que tiene un Usuario vinculado suspende también a ese Usuario y **exige además** el permiso `usuarios.suspender` (no basta `personas.cesar`): sin él, el cese se rechaza y nada cambia. Esto es una regla de permisos, no un bloqueo por recursos. | v1, Etapa 2 | CA-052a1 |
| RF-PER-006 | **El cese nunca se bloquea por recursos.** Activos, líneas, licencias, dominios y elementos que la Persona tiene generan **pendientes de la persona** visibles en su ficha, una tarea de salida y un aviso a Jefatura TI. Los activos Asignados llevan la marca "pendiente de devolución" (no es extravío ni baja). Lo que **sí se bloquea es anonimizar** mientras haya pendientes sin cerrar (devolución, extravío o baja con motivo). | v1, Etapa 2 (se completa en Etapa 4) | CA-052a2, CA-052b2 y CA-081b |
| RF-PER-007 | Las órdenes abiertas de una Persona cesada se reasignan o se cancelan con motivo. | v1, Etapa 5 | CA-052d |
| RF-PER-008 | Las Personas son de cada empresa. El mismo nombre en dos empresas son dos registros independientes. | v1, Etapa 2 | CA-001 |
| RF-PER-009 | Ver una Persona y sus asignaciones con nombre es el permiso `datos_personales.ver`; sin él se ve la referencia. | v1, Etapa 2 | CA-011b |
| RF-PER-010 | Las Personas se crean a mano (el alta manual puede crear homónimos, con aviso) desde la Etapa 2. También se podrán cargar por el asistente de importación cuando exista (Etapa 4); esa importación exige código de empleado o correo. | v1, Etapa 2 (importación en Etapa 4) | CA-016a, CA-PRS-01d y CA-PRS-11 |
| RF-PER-011 | **Motivo de cese:** lista corta sin texto libre (salida, fin de contrato, traslado, otro). | v1, Etapa 2 | CA-052a1 |
| RF-PER-012 | **Registro de solicitudes de derechos** sobre datos personales (fecha, quién la presenta, tipo, quién la atiende, plazo que fija legal, resultado). Quien presenta el pedido no lo atiende; los pedidos son invisibles en búsquedas, listas, reportes, exportaciones, tableros, avisos y API; la copia se entrega por una descarga única con vencimiento y registro, nunca por correo. Única excepción: la propia Persona ve el estado de SU pedido por el portal (Fase 3). Permiso `personas.derechos_atender` (PS-29). **Suplente (D-071.1):** si quien presenta un pedido de derechos es la única persona con PS-29, no lo atiende ni ella ni la plataforma: el pedido queda "En espera de persona designada" y el Administrador **designa** a otra membresía de confianza dándole PS-29 (con segunda verificación). **Toda empresa debe tener una persona suplente con PS-29**: "Primeros pasos" muestra la tarea "Designar suplente de derechos de datos" y, mientras no exista, el sistema recuerda **cada 3 días** a los administradores; si pasan **5 días** sin designar, se avisa al **contacto autorizado** y se deja constancia de que el plazo legal corre; la salida es el procedimiento de rescate (RF-PLA-003), que habilita a quien atiende. **[ESCALAR AL CEO]** plazos y eliminación condicionada a devolver equipos (L-06). | v1, Etapa 2 | CA-076 y CA-093 |
| RF-PER-013 | **Anonimización manual** solo para pedidos de derechos documentados, con **dos personas** (una propone, otra ejecuta) y vista previa de lo que se afectará. La anonimización automática queda **apagada** hasta la confirmación escrita de legal. | v1, Etapa 2 | CA-052b1 y CA-054a |
| RF-PER-014 | Anonimizar quita correo, código de empleado, puesto y datos de contacto, y reemplaza el nombre del registro por la referencia ("Persona anonimizada 0042"). La **copia del nombre dentro del acta de entrega** se mantiene hasta el vencimiento de su plazo (excepción declarada, sección 18.3). | v1, Etapa 2 | CA-054a y CA-054b |

## 9. Catálogos, categorías y campos personalizados

Basado en D-005, D-008, D-035, D-040, D-045. Etapa 2.

### 9.1 Catálogos y estructura

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-CAT-001 | Marca, modelo (depende de una marca), proveedor, ubicación, área, tipo de puesto, centro de costo y unidad de medida son catálogos con datos propios. | v1, Etapa 2 | CA-048 |
| RF-CAT-002 | El administrador puede crear catálogos nuevos sin ayuda técnica. Son listas simples y alimentan los campos de tipo lista. | v1, Etapa 2 | CA-020 |
| RF-CAT-003 | Los catálogos son de cada empresa. No se comparten entre empresas. | v1, Etapa 2 | CA-001 |
| RF-CAT-004 | Un valor de catálogo no se borra: se desactiva. Un valor inactivo no se puede elegir en registros nuevos y sigue visible en los antiguos. | v1, Etapa 2 | CA-045 |
| RF-CAT-005 | La unidad de medida es un catálogo por empresa con la marca "admite decimales". No hay conversiones entre unidades en la v1. | v1, Etapa 2 | CA-032 |
| RF-CAT-006 | **Ubicación jerárquica:** tiene `ubicación superior` opcional, máximo **3 niveles** (Sede, Piso, Sala), nombre único por superior. Activos y stock pueden estar en cualquier nivel. Una lista simple es un árbol de un nivel. Mover un nodo no escribe movimientos por activo; el historial guarda la ruta en texto en el momento de cada movimiento. | v1, Etapa 2 | CA-060a |
| RF-CAT-023 | Proveedor, ubicación y centro de costo pueden tener un **código externo** opcional (el de SAP, por ejemplo). Es solo un dato; no se valida contra ningún sistema externo. | v1, Etapa 2 | CA-017 |
| RF-CAT-024 | El **centro de costo** tiene una Persona responsable opcional y es el único catálogo de centros (Personas lo referencia). El **área** (una por Persona, un solo nivel) y el **tipo de puesto** son catálogos del núcleo. | v1, Etapa 2 | CA-016a |
| RF-CAT-025 | **Proveedor ampliado (PRV-A):** una sola tabla desde la Etapa 2, con identificación fiscal normalizada y única, país, "vende bienes / presta servicios" y contactos. El operador de línea, el registrador de dominio, el emisor de certificados y el garante son proveedores de la misma tabla. | v1, Etapa 2 | CA-017 |
| RF-CAT-026 | Los **contactos de un proveedor** son datos personales: tienen ciclo de vida (inactivo; se anonimizan a los 2 años inactivos), se ven con `proveedores.ver_contactos` y no salen en exportaciones generales. | v1, Etapa 2 | CA-092 |

### 9.2 Categorías

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-CAT-007 | Una categoría tiene nombre, prefijo para los códigos (`LAP`, `CEL`, `PER`, `LIC`) y **naturaleza**. | v1, Etapa 2 | CA-017 |
| RF-CAT-008 | El prefijo tiene de 2 a 5 caracteres (letras o números, en mayúsculas), es único dentro de la empresa y **no puede ser un prefijo reservado** (`OC, OS, RCP, RCL, MNT, CTR, AYU, CAM, PRB, KB, EC, ACT, ACTV, PRS, PAN, PPT, MPR, GMA, LSAP, PRG`). | v1, Etapa 2 | CA-017 |
| RF-CAT-009 | Hay un solo nivel de subcategoría (Categoría > Subcategoría). La subcategoría usa el prefijo de su categoría principal. | v1, Etapa 2 | CA-017 |
| RF-CAT-010 | La subcategoría hereda los campos y la naturaleza de la categoría principal y puede sumar campos propios. | v1, Etapa 2 | CA-020 |
| RF-CAT-011 | Cambiar el prefijo de una categoría no cambia los códigos de los SKU ya creados. | v1, Etapa 2 | CA-019 |
| RF-CAT-027 | **Naturaleza:** `equipo físico` (por defecto: garantía, mantenimiento, depreciación, "activos vigentes" y elemento de CMDB), `licencia` (la trata el módulo de licencias; sin garantía, mantenimiento ni depreciación; su elemento de CMDB es el contrato) o `servicio` (suscripciones o servicios sin unidad física ni puestos; sin garantía ni depreciación). Se fija al crear la categoría y **no se cambia con existencias**. | v1, Etapa 2 | CA-064a y CA-064b |

### 9.3 Campos personalizados

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-CAT-012 | Cada categoría puede definir campos personalizados, que heredan todos sus SKU. **Seis tipos:** texto, número, fecha, lista de opciones, sí/no y **secreto**. Un campo de texto puede marcarse **identificador**: único por empresa y normalizado (lo usa el IMEI), con restricción en la base de datos; admite además un **largo exacto** opcional (por ejemplo 15 dígitos) que el servidor comprueba (D-072.2). | v1, Etapa 2 | CA-020, CA-065a y CA-065b |
| RF-CAT-013 | Cada campo es obligatorio u opcional. | v1, Etapa 2 | CA-020 |
| RF-CAT-014 | Cada campo declara a qué se aplica: **al artículo (SKU)** (RAM, disco, procesador) o **a cada unidad** (IMEI, vencimiento de una clave de licencia, número de línea mientras no exista el módulo de Líneas). | v1, Etapa 2 | CA-020 |
| RF-CAT-015 | Los campos "a cada unidad" solo existen para SKU controlados por serie. En un SKU por cantidad todo campo es del artículo. | v1, Etapa 2 | CA-020 |
| RF-CAT-016 | El servidor valida cada valor según la definición del campo (tipo, obligatorio, opción existente); la pantalla no basta. Un solo marco de campos sirve a SKU, unidades y casos de ayuda. | v1, Etapa 2 | CA-020 |
| RF-CAT-017 | Un campo que ya tiene datos no se borra: se desactiva. | v1, Etapa 2 | CA-021 |
| RF-CAT-018 | No se cambia el tipo de un campo que ya tiene datos. | v1, Etapa 2 | CA-021 |
| RF-CAT-019 | Un campo que se vuelve obligatorio no bloquea lo que ya existe: esos registros quedan marcados "pendiente de completar". | v1, Etapa 2 | CA-021 |
| RF-CAT-020 | Las opciones de una lista que estén en uso se desactivan, no se borran. | v1, Etapa 2 | CA-021 |
| RF-CAT-021 | Cada campo tiene un identificador interno estable; cambiarle el nombre no rompe los datos. | v1, Etapa 2 | CA-021 |
| RF-CAT-022 | Los campos de tipo número admiten decimales y pueden tener mínimo y máximo; los de fecha son de calendario; los textos tienen largo máximo (sección 19.2). | v1, Etapa 2 | CA-020 |
| RF-CAT-028 | **Campo secreto:** se guarda cifrado, aparte; no se busca; no aparece en historial (dice solo "clave cambiada"), auditoría, exportaciones (ni enmascarado), importaciones, reportes, tableros, API, avisos, correos, portal ni registros técnicos. Los valores secretos no entran por Excel; se escriben uno a uno. Máscara: últimos 4 caracteres solo si la clave tiene 16 o más. | v1, Etapa 2 | CA-042 |
| RF-CAT-029 | El número de línea, mientras no exista el módulo de Líneas, es un campo opcional de la unidad del Celular con la marca identificador, tratado como dato personal. **Lo gestiona el módulo Líneas cuando está activo** (asistente de migración todo o nada; luego el campo queda de solo lectura y los valores originales se conservan 90 días). No se guardan PIN ni PUK. | v1, Etapa 2 | CA-065a y CA-065b |

Ejemplos: Laptop (del artículo) → RAM, disco, procesador. Celular (de la unidad) → IMEI (identificador), número de línea. Licencia (de la unidad) → vencimiento, número de puestos, clave (secreto).

## 10. Maestro de artículos (SKU)

Basado en D-007, D-008, D-011 (reemplazada por D-035), D-045. Etapa 3.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-SKU-001 | Cada SKU tiene: código, nombre, categoría (o subcategoría), marca, modelo, unidad de medida, estado (activo/inactivo), modo de control (por serie o por cantidad), si autoriza unidades sin serie, stock mínimo opcional y los campos del artículo de su categoría. | v1, Etapa 3 | CA-017 |
| RF-SKU-002 | El código es único dentro de la empresa, sin distinguir mayúsculas ni espacios (`lap-0001` y `LAP-0001` son el mismo). Otra empresa puede tener el mismo código. | v1, Etapa 3 | CA-017 |
| RF-SKU-003 | El código automático es el prefijo de la categoría más un correlativo con mínimo de 4 dígitos (`LAP-0001`). El ancho es un mínimo, no un tope. | v1, Etapa 3 | CA-018 |
| RF-SKU-004 | Un código no se reutiliza nunca, aunque el SKU se desactive. Pueden quedar saltos; lo que se garantiza es que **nunca se repite**, aunque varias personas creen SKU a la vez. | v1, Etapa 3 | CA-018 |
| RF-SKU-005 | Escribir un código propio (por ejemplo el de SAP) es un permiso aparte. El código escrito a mano no mueve el contador; el automático salta los códigos ya ocupados. | v1, Etapa 3 | CA-019 |
| RF-SKU-006 | El código no se edita cuando el SKU ya tiene movimientos o activos. | v1, Etapa 3 | CA-019 |
| RF-SKU-007 | No se puede cambiar el modo de control ni la categoría de un SKU que ya tiene activos o stock. | v1, Etapa 3 | CA-022 |
| RF-SKU-008 | Un SKU con serie siempre es de a 1 unidad. | v1, Etapa 3 | CA-022 |
| RF-SKU-009 | Un SKU por serie no acepta unidades sin serie, salvo que el SKU lo autorice expresamente. | v1, Etapa 3 | CA-023 |
| RF-SKU-010 | Un SKU inactivo no se puede usar en órdenes nuevas; sigue visible en el historial. Desactivarlo no altera sus activos ni su stock, y **no impide recibir** contra una orden ya emitida (con aviso). | v1, Etapa 3 | CA-061 |
| RF-SKU-011 | El SKU no tiene precio fijo: el precio vive en la línea de la orden de compra. | v1, Etapa 3 | CA-032 |
| RF-SKU-012 | Desde un SKU se ven todas sus series, su stock por ubicación, sus órdenes de compra y su historial. | v1, Etapa 3 | CA-048 |
| RF-SKU-013 | **Licencias:** no son un tipo especial. Una unidad de licencia controlada por serie tiene como serie un identificador visible (`M365-2026-A`) y, como **campos de la unidad**, el número de puestos y la fecha de vencimiento. **La clave nunca es la serie:** es un campo secreto de la unidad. Si solo importa el total de licencias, se controla por cantidad. En un SKU por cantidad de la categoría Licencias, el contrato es la fuente de los puestos y el stock no se mueve. | v1, Etapa 3 | CA-042 y CA-064b |
| RF-SKU-014 | Ver la clave completa exige `licencias.ver_clave` (solo Administrador por defecto; la empresa puede dárselo al Técnico). Cada revelación exige reautenticación reciente, queda en la auditoría **sin el valor**, tiene tope de 20 por usuario por hora (al superarlo se avisa a los administradores) y se oculta sola a los 30 segundos con aviso previo. Escribir o cambiar una clave es `licencias.editar_clave`. Las claves no entran por Excel. | v1, Etapa 4 | CA-042 |
| RF-SKU-015 | En la v1 no se asigna cada puesto de una licencia a una persona; basta el total de puestos. | v1, Etapa 3 | CA-020 |
| RF-SKU-016 | Un SKU puede tener un **stock mínimo** opcional. En la v1 es solo un dato: no genera avisos ni bloquea salidas. | v1, Etapa 3 | CA-020 |

## 11. Inventario

Basado en D-009, D-010, D-012, D-034, D-044.9, D-060. Etapa 4.

### 11.1 Activos (control por serie)

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-INV-001 | Cada unidad se registra como un activo con: serie, SKU, estado, ubicación (siempre existe), responsable (la Persona de su asignación abierta, si la hay), fecha de compra, fin de garantía, orden de compra de origen (opcional), **costo de compra y moneda**, centro de costo (opcional, se copia de la línea de la orden al recibir y se corrige con permiso) y los campos "a cada unidad" de su categoría. | v1, Etapa 4 | CA-024 |
| RF-INV-002 | La serie es única por empresa y SKU, comparada sin distinguir mayúsculas ni espacios al inicio o al final. Repetida en el mismo SKU: se rechaza siempre. | v1, Etapa 4 | CA-023 |
| RF-INV-003 | Si la serie ya existe en otro SKU de la misma empresa, se acepta con un aviso visible que dice dónde está. | v1, Etapa 4 | CA-023 |
| RF-INV-004 | Una unidad física es un solo registro para siempre. Nunca se crea un segundo registro con la misma serie. | v1, Etapa 4 | CA-028 |
| RF-INV-005 | **Serie dañada por Excel** (D-072.2): el sistema la rechaza con aviso cuando (a) tiene notación científica (`E+` o `e+`, como 3,5E+14); (b) es numérica pura y su longitud es menor que la mínima de las series ya existentes de ese SKU (cuando hay 10 o más); o (c) un campo "identificador" con **largo exacto** configurado (por ejemplo un IMEI de 15 dígitos) no lo cumple. | v1, Etapa 4 | CA-038c, CA-065a y CA-065b |
| RF-INV-006 | Una serie vacía solo se acepta si el SKU lo autoriza (RF-SKU-009). | v1, Etapa 4 | CA-023 |
| RF-INV-007 | Corregir una serie ya registrada exige permiso y motivo; el historial guarda el valor anterior y el nuevo. | v1, Etapa 4 | CA-036 |
| RF-INV-008 | **Garantía (GAR-A):** se captura la fecha de compra y los meses de garantía, o el fin directo; el cálculo vive en el núcleo y se guarda en un registro de garantía propio desde la Etapa 4. **Fin de garantía = (fecha de inicio menos 1 día) más los meses, ajustando al último día del mes** (D-065, S-35). Ejemplos: 15/01/2026 + 24 meses = 14/01/2028; 15/03/2024 + 36 meses = 14/03/2027; 31/01 + 1 mes = 28/02 en un año no bisiesto. Solo los activos de naturaleza "equipo físico" tienen garantía. Los avisos de vencimiento quedan fuera de la v1. | v1, Etapa 4 | CA-082b |
| RF-INV-025 | **Ingreso manual de un activo** (reemplazos por garantía, donaciones, compras sin orden): permiso propio, serie única, motivo obligatorio, costo opcional, historial y auditoría. | v1, Etapa 4 | CA-059 |
| RF-INV-026 | **Corregir el costo** o la moneda de un activo (activos del Excel) exige `activos.corregir_costo` (PS-51, sensible), motivo y auditoría. Si el nuevo costo, con impuesto y en moneda base, **supera el límite** de la empresa, el cambio queda "pendiente de confirmación" y lo confirma **otra persona con PS-51** (si la empresa tiene una sola, la casilla «compras» del interruptor único); el costo pendiente no entra al libro de costos. El activo guarda el subtotal sin impuesto dividido por la cantidad, con 4 decimales. | v1, Etapa 4 | CA-063 |
| RF-INV-027 | **Cambio de ubicación** de un activo con serie es un movimiento propio ("cambio de ubicación") con permiso, historial y sin cambiar el estado. | v1, Etapa 4 | CA-060b |
| RF-INV-034 | **Código visible del activo (D-079):** cada activo recibe al crearse, por cualquier vía (recepción, ingreso manual RF-INV-025 o importación), un código `ACTV-NNNNNN`. Es correlativo **por empresa**, de 6 dígitos como mínimo (el ancho es un mínimo, no un tope), con contador propio. Nunca se reutiliza: pueden quedar saltos. No se edita ni se sobrescribe, y no cambia aunque se corrija la serie, se reingrese el activo o cambie su estado. Se muestra en la ficha, las listas y el historial, y se puede buscar (sin distinguir mayúsculas ni espacios, RN-012). Se exporta como columna propia de la lista de activos. | v1, Etapa 4 | CA-094a |

### 11.2 Estados del activo

Lista **cerrada y fija** en el sistema; no se agregan estados por empresa.

| Estado | Significado |
|---|---|
| En stock | Disponible en una ubicación. Sin responsable. |
| Asignado | Entregado a una Persona (responsable). Incluye los préstamos con fecha de devolución prevista y los equipos con la marca "pendiente de devolución". |
| En reparación | Fuera de servicio por reparación. Conserva el responsable si lo tenía. |
| Extraviado o robado | Perdido; sigue en el registro. Sin responsable (la asignación se cerró con la causa). |
| De baja | Retirado definitivamente. Sin responsable. |

**Tabla completa de transiciones (5 por 5)**, comprobada en el servidor y con un CHECK en la base de datos. Desde la fila hacia la columna:

| Desde \ Hacia | En stock | Asignado | En reparación | Extraviado o robado | De baja |
|---|---|---|---|---|---|
| **En stock** | Prohibida | Permitida (a una Persona activa) | Permitida | Permitida (motivo) | Permitida (motivo) |
| **Asignado** | Permitida (con devolución registrada) | Solo como **traspaso** a otra Persona, en un acto | Permitida (conserva el responsable) | Permitida (motivo; cierra la asignación con la causa) | Permitida (motivo; cierra la asignación) |
| **En reparación** | Permitida (sin asignación abierta) | Permitida (al mismo responsable, o a una Persona asignada en el mismo acto) | Prohibida | Permitida (motivo) | Permitida (motivo) |
| **Extraviado o robado** | Solo por **reingreso** (motivo y permiso) | Prohibida (primero reingreso a En stock) | Prohibida | Prohibida | Permitida (motivo) |
| **De baja** | Solo por **reingreso** (motivo y permiso) | Prohibida | Prohibida | Prohibida | Prohibida |

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-INV-009 | Los 5 estados son una lista cerrada. "Prestado" no es un estado; "En tránsito" no existe en la v1. | v1, Etapa 4 | CA-058 |
| RF-INV-010 | Las 25 combinaciones de la tabla se comprueban en el servidor, por una sola función, y con un CHECK en la base de datos. QA genera las 25 pruebas. | v1, Etapa 4 | CA-058 |
| RF-INV-011 | El motivo es obligatorio en baja, extravío, reingreso, ajuste de stock, corrección de series y corrección de costo. En el resto es opcional. | v1, Etapa 4 | CA-024 |
| RF-INV-012 | Abrir o cerrar una orden de servicio no cambia el estado del activo (regla única, fusiona la antigua RF-OS-007); el técnico lo cambia a mano con el diálogo único "Cambiar estado". | v1, Etapa 6 | CA-044 |
| RF-INV-033 | **Evento único de estado (D-075 N-AUD-06):** todo cambio de estado de un activo, incluida la baja, emite un solo evento `inventario.activo_estado_cambiado` con el nuevo estado y la causa. El evento de aprobación de un presupuesto se llama `presupuesto.presupuesto_aprobado`. | v1, Etapa 4 | CA-101 |
| RF-INV-028 | El estado Asignado exige responsable; En stock, Extraviado y De baja no lo tienen; En reparación puede tenerlo. La base de datos lo comprueba con una columna de responsable copiada de la asignación abierta. | v1, Etapa 4 | CA-058 |
| RF-INV-029 | Un activo con la marca "pendiente de devolución" no cuenta como extraviado ni como robado en reportes de pérdidas ni en depreciación. Para pasarlo a Extraviado hace falta una decisión explícita con motivo. | v1, Etapa 4 | CA-081b |

### 11.3 Asignación, devolución y constancia

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-INV-013 | Un activo se asigna a una Persona. No se asigna un activo De baja, Extraviado o ya asignado a otra persona; el sistema impide dos asignaciones activas a la vez (índice único "una abierta por activo"), incluso con dos técnicos a la vez. | v1, Etapa 4 | CA-025 |
| RF-INV-014 | Un equipo de uso compartido (una sala, un área) se asigna a una Persona custodio. | v1, Etapa 4 | CA-025 |
| RF-INV-015 | Cada asignación y devolución es una fila de historial: desde, hasta, estado en que se devuelve. | v1, Etapa 4 | CA-025 |
| RF-INV-016 | La constancia es un registro en el sistema (activo, serie, persona, fecha, estado en que se entrega, quién entrega) más un **acta imprimible en PDF** (`ACT-E-000123` de entrega, `ACT-D-000123` de devolución) para firmar en papel, que muestra también el código del activo `ACTV-NNNNNN` (RF-INV-034). Sin `datos_personales.ver` el PDF omite nombre y área y muestra la referencia. | v1, Etapa 4 | CA-046 |
| RF-INV-017 | La aceptación en pantalla del receptor y la subida del escaneo del acta quedan fuera de la v1. | v1, Etapa 4 | CA-046 |
| RF-INV-018 | Cada ingreso, asignación, traslado, reparación, baja, extravío y reingreso queda en el historial con fecha, usuario y motivo (cuando aplica). | v1, Etapa 4 | CA-024 |
| RF-INV-024 | **Una sola regla de estado, asignación y ubicación:** (a) la asignación termina únicamente con una devolución, una baja o un extravío; (b) el responsable es la Persona de la asignación abierta y solo hay una abierta por activo; (c) Asignado exige asignación abierta, En stock no puede tenerla; (d) En reparación puede conservarla (al volver regresa a Asignado) o no (si la Persona lo devolvió a TI antes, queda En stock); (e) Extraviado o robado y De baja cierran la asignación con la causa; (f) todo activo tiene siempre una ubicación, distinta e independiente del responsable. | v1, Etapa 4 | CA-025 y CA-058 |
| RF-INV-030 | **Autoentrega:** nadie puede entregarse un equipo a sí mismo, sin excepción ni siquiera para el Administrador. | v1, Etapa 4 | CA-079b |
| RF-INV-031 | Hay un solo asistente "Entregar" y un solo diálogo "Cambiar estado", que reutilizan entregas, garantías y órdenes de servicio. Extravío con la mesa de ayuda activa se reporta como un caso. | v1, Etapa 4 | CA-024 |
| RF-INV-032 | Almacén no entrega equipos por defecto; la empresa se lo puede conceder y entonces necesita además `datos_personales.ver`. | v1, Etapa 4 | CA-011b |

### 11.4 Stock (control por cantidad)

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-INV-019 | El stock se lleva por SKU y ubicación. Todo cambio es un movimiento: ingreso, salida, traslado, ajuste o saldo inicial. | v1, Etapa 4 | CA-026 |
| RF-INV-020 | **El stock no puede quedar negativo**, aunque dos personas saquen a la vez. | v1, Etapa 4 | CA-026 |
| RF-INV-021 | Las correcciones son ajustes con motivo obligatorio; nunca se edita el saldo. | v1, Etapa 4 | CA-026 |
| RF-INV-022 | El traslado entre ubicaciones es inmediato: sale de origen y entra a destino en el mismo acto. Un traslado a la misma ubicación se rechaza. | v1, Etapa 4 | CA-027 |
| RF-INV-023 | Las cantidades son enteras, salvo en las unidades de medida que admiten decimales. | v1, Etapa 4 | CA-032 |

## 12. Órdenes de compra

Basado en D-013, D-014, D-015, D-043, D-044, D-060 y en la propuesta R4 del Auditor de Cumplimiento. Etapa 5.

### 12.1 La orden y sus datos

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-OC-001 | No existe un documento de "solicitud" aparte: la solicitud de compra es una orden en Borrador creada por el Solicitante. | v1, Etapa 5 | CA-029 |
| RF-OC-002 | La orden se hace sobre SKU (cantidad y precio por línea), no sobre series. | v1, Etapa 5 | CA-032 |
| RF-OC-003 | La orden tiene número correlativo por empresa (`OC-000042`, mínimo 6 dígitos), que nunca se repite. | v1, Etapa 5 | CA-018 |
| RF-OC-004 | Debe tener al menos una línea; cantidad mayor que 0; precio no negativo; el mismo SKU no se repite en dos líneas; no se aceptan SKU ni proveedores inactivos al crearla. | v1, Etapa 5 | CA-032 |
| RF-OC-005 | Cada empresa define una moneda base. Cada orden lleva **una** moneda (código de 3 letras) y el importe siempre se guarda junto a su moneda. No hay conversión automática. Nunca hay un total general entre monedas. | v1, Etapa 5 | CA-031 |
| RF-OC-006 | El precio unitario se ingresa **sin impuesto**, con hasta 4 decimales. El impuesto es un porcentaje por línea, guardado en la línea al comprar. El sistema calcula impuesto y total con la regla de redondeo de RF-OC-045. | v1, Etapa 5 | CA-072 |
| RF-OC-007 | Cada orden puede indicar un centro de costo (opcional). | v1, Etapa 5 | CA-032 |
| RF-OC-008 | Una orden en Borrador creada por un Solicitante lleva SKU y cantidades; el precio lo completa quien edita la orden (Técnico o Administrador). | v1, Etapa 5 | CA-032 |
| RF-OC-009 | "Emitida" solo cambia el estado; el sistema no envía correo al proveedor. Se ofrece una vista imprimible o PDF de la orden para enviarla a mano. | v1, Etapa 5 | CA-078 |
| RF-OC-010 | Una orden con cualquier recepción confirmada no cambia cantidad, precio ni proveedor; solo se cierra. Se corrige con una reversión de recepción (RF-OC-032) o un ajuste de inventario. | v1, Etapa 5 | CA-061 |
| RF-OC-042 | Cada orden puede llevar una **referencia externa** opcional (por ejemplo el número de documento de SAP). Texto libre; no se valida contra ningún sistema externo. | v1, Etapa 5 | CA-032 |
| RF-OC-043 | **Una orden no sale de Borrador si alguna línea no tiene precio.** El precio 0 solo se acepta con la marca "sin costo" y un motivo. Así una orden sin precios, con total 0, nunca pasa por debajo del límite sin revisión. | v1, Etapa 5 | CA-032 |
| RF-OC-044 | Cada orden lleva un **número de versión** que parte en 1 y sube con cada reaprobación; entero que no se reutiliza, se ve en la orden y en la auditoría; las integraciones lo usan para distinguir alta, cambio y anulación (D-065, S-32). | v1, Etapa 5 | CA-030 |
| RF-OC-045 | **Redondeo:** el subtotal de línea = cantidad × precio unitario, redondeado a los decimales de la moneda (mitad hacia arriba); el impuesto de la línea se redondea igual; el total de la orden es la suma de las líneas, guardado y no recalculado. Importes siempre como decimal exacto. Ejemplos con resultado: (1) USD, 3 × 10,3333 con impuesto 18 %: subtotal 31,00; impuesto 5,58; total de la línea 36,58. (2) USD, 7 × 1,2345 con 18 %: subtotal 8,64; impuesto 1,56; total 10,20. (3) Moneda sin decimales, 5 × 199,5000 con 10 %: subtotal 998; impuesto 100; total 1.098. (4) USD, 1 × 10,0050 con 50 %: subtotal 10,01; impuesto 5,01 (5,005 redondeado hacia arriba); total 15,02. **El impuesto se calcula sobre el subtotal ya redondeado** (D-072.4). | v1, Etapa 5 | CA-072 |
| RF-OC-046 | Los números de documento (`OC-`, `RCP-`, `OS-`) usan el contador por empresa con clave propia, mínimo 6 dígitos; un salto es aceptable, una repetición nunca. | v1, Etapa 5 | CA-018 |

### 12.2 Estados y transiciones

Estados: Borrador · Pendiente de aprobación · Aprobada · Emitida · Recibida parcial · Recibida total · Cerrada · además **Rechazada** y **Anulada**.

```
Borrador -> Pendiente de aprobación -> Aprobada -> Emitida
         -> Recibida parcial -> Recibida total -> Cerrada
Pendiente de aprobación -> Rechazada -> (se corrige) -> Pendiente de aprobación
Anulada: solo antes de la primera recepción
```

| Desde | Hacia | Quién puede | Condición o efecto |
|---|---|---|---|
| Borrador | Pendiente de aprobación | Quien la creó, o con permiso de editar | Al menos una línea, todas con precio (RF-OC-043), y la empresa exige aprobación para ese monto. |
| Borrador | Aprobada | Automático | Cuando no se exige aprobación (RN-017) y todas las líneas tienen precio. El estado Pendiente no aparece. |
| Borrador | Anulada | Quien la creó o con permiso de anular | Motivo obligatorio. |
| Pendiente de aprobación | Aprobada | Un aprobador que no la creó ni la editó desde la última aprobación | Se guarda quién aprobó y por qué monto. |
| Pendiente de aprobación | Rechazada | Un aprobador que no la creó | Motivo obligatorio. Queda visible con el motivo. |
| Pendiente de aprobación | Borrador | Quien la creó (retira la solicitud) | Queda en la auditoría. |
| Rechazada | Pendiente de aprobación | Quien la creó, o con permiso de editar | Al corregirla. El historial del rechazo se conserva. |
| Rechazada | Anulada | Quien la creó o con permiso de anular | Motivo obligatorio. |
| Aprobada | Emitida | Con permiso de emitir | Sin cambios pendientes. |
| Aprobada o Emitida | Pendiente de aprobación | Automático | Cuando alguien cambia precio, cantidad, proveedor o total. Se anula la aprobación anterior, sube el número de versión, y el editor no puede reaprobar. |
| Aprobada | Anulada | Con permiso de anular | Motivo obligatorio. |
| Emitida | Anulada | Con permiso de anular | Motivo obligatorio. Solo si no hay recepciones. |
| Emitida | Recibida parcial | Quien reciba (sección 13) | La primera recepción confirmada no completa lo pedido. |
| Emitida | Recibida total | Quien reciba | La recepción completa todo lo pedido. |
| Recibida parcial | Recibida parcial o Recibida total | Quien reciba | Cada recepción se registra por separado. |
| Recibida parcial | Cerrada | Con permiso de cerrar | Cierre manual con motivo, cuando el proveedor ya no enviará lo pendiente. |
| Recibida total | Cerrada | Automático | En el mismo acto de la última recepción; "Recibida total" dura un instante y se ve en el historial. |

No existe ninguna otra transición. **Anulada** y **Cerrada** son estados finales; la única salida de Cerrada es la reversión de una recepción (RF-OC-032), que reabre la orden y anula el cierre. **Rechazada** no es final.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-OC-011 | Las transiciones de la tabla se comprueban en el servidor y no hay otras. | v1, Etapa 5 | CA-029 |
| RF-OC-012 | Toda transición registra quién, cuándo y motivo. El motivo es obligatorio al rechazar, anular y cerrar a mano. | v1, Etapa 5 | CA-037 |
| RF-OC-013 | Una orden con recepción parcial no se anula: se cierra. | v1, Etapa 5 | CA-037 |
| RF-OC-014 | Cambiar precio, cantidad, proveedor o total de una orden Aprobada o Emitida la devuelve a Pendiente de aprobación (RF-OC-044). Quien la editó no puede reaprobarla. | v1, Etapa 5 | CA-030 |

### 12.3 Aprobación por monto

La regla de dinero es la **regla única RN-017** (sección 21): una sola medida de monto, una sola función, una tabla de actos.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-OC-015 | La aprobación tiene **un solo nivel** en la v1: cada empresa fija un monto límite en su moneda base. Las órdenes cuyo total con impuesto **supera estrictamente** el límite necesitan la aprobación de un rol con permiso de aprobar. | v1, Etapa 5 | CA-031 y CA-055 |
| RF-OC-016 | Con límite 0, toda orden con al menos una línea pasa por aprobación, **también la que tiene todas sus líneas marcadas "sin costo"**. Si la empresa desactiva la aprobación (PS-232), ninguna pasa. Un documento sin costo no pasa por la regla de dinero (RN-017). | v1, Etapa 5 | CA-055 |
| RF-OC-017 | La medida de monto es el **total con impuesto, en la moneda base**, para todos los actos de dinero. | v1, Etapa 5 | CA-055 |
| RF-OC-018 | Una orden en una moneda distinta de la base siempre pasa por aprobación. | v1, Etapa 5 | CA-031 |
| RF-OC-019 | El valor del monto límite, la moneda base y activar o desactivar la aprobación los configura cada empresa con el permiso sensible `empresa.configurar_aprobacion` (PS-232); cada cambio avisa por correo a todos los administradores (P-001). | v1, Etapa 5 | CA-031 y CA-089 |
| RF-OC-020 | Sin varios niveles ni reglas por tipo de orden en la v1. | v1, Etapa 5 | CA-031 |
| RF-OC-051 | **Punto de extensión en la pantalla de aprobación:** la pantalla de aprobación de la orden reserva un espacio donde un módulo activo (hoy solo presupuesto, PRE) puede mostrar su información (por ejemplo el efecto en el presupuesto) y pedir una **justificación** si se excede. No agrega un segundo nivel de aprobación ni cambia quién puede aprobar. Sin módulo activo, el espacio no aparece (plan de correcciones, PRE punto 5). | v1, Etapa 5 | CA-031, CA-104a y CA-104b |
| RF-OC-047 | Una función única `requiereSegundaPersona(acto, monto, moneda)` decide en todos los módulos; ningún módulo tiene una regla de monto propia. | v1, Etapa 5 | CA-055 |

### 12.4 Separación de funciones

El servicio único de doble control registra los participantes de cada ciclo de un documento (creó, editó, aprobó, recibió, implementó). **Definición única:** no aprueba nadie que haya creado o editado desde la última aprobación.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-OC-021 | Quien crea o edita una orden no puede aprobarla. | v1, Etapa 5 | CA-012 |
| RF-OC-022 | Nadie aprueba ni rechaza su propia solicitud. | v1, Etapa 5 | CA-012 |
| RF-OC-023 | Quien aprueba una orden no puede recibir la mercadería de esa misma orden. | v1, Etapa 5 | CA-013 |
| RF-OC-024 | Quien recibe la mercadería no puede haber creado ni aprobado esa orden. | v1, Etapa 5 | CA-013 |
| RF-OC-025 | Estas cuatro reglas las hace cumplir el servidor y valen para todos los roles, incluido el Administrador. | v1, Etapa 5 | CA-012 |
| RF-OC-026 | **Interruptor único de excepciones**, desactivado por defecto, con **ocho casillas** (compras, recepción, presupuestos, **contratos y servicios recurrentes**, licencias, mesa de ayuda, cambios y problemas), consultado por una sola función. Solo un Administrador puede cambiarlo, con segunda verificación reciente y motivo obligatorio; con dos o más administradores lo confirma un segundo administrador; cada casilla vence a los 90 días; hay un resumen mensual de usos. Cada documento que use la excepción muestra un aviso visible y cada uso queda en la auditoría (quién, cuándo, monto, documento). El Administrador de plataforma no puede activarlo. **Mapa acto a casilla (D-066):** ver la tabla siguiente. **Nunca se exceptúan** (sin casilla): la autoentrega de equipos, la anonimización de una Persona (propone uno y ejecuta otro) y el rescate de una empresa. | v1, Etapa 5 | CA-014, CA-070, CA-097 y CA-098 |

| Casilla | Qué actos exceptúa |
|---|---|
| compras | Aprobar una orden de compra; aprobar una orden de servicio con costo; confirmar el costo corregido de un activo (PS-51); que quien creó o editó una orden la apruebe |
| recepción | Que quien recibió la mercadería haya creado o aprobado la orden; que quien confirmó una recepción la revierta (PS-68) |
| presupuestos | Aprobar un presupuesto o una modificación; reclasificar un costo; registrar o anular un gasto manual |
| contratos y servicios recurrentes | Activar un contrato de proveedor; confirmar el costo de una línea, un dominio o un certificado; confirmar el costo de una garantía extendida o de un mantenimiento sin orden de servicio |
| licencias | Confirmar un contrato de licencia (PS-76 cuando el contrato es de licencia) |
| mesa de ayuda | Aprobar una solicitud de servicio con aprobación (quien no la pidió) |
| cambios | Aprobar un cambio y reaprobar una plantilla estándar; cerrar un cambio quien lo implementó (D-067) |
| problemas | Publicar un error conocido quien lo redactó |

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-OC-027 | Crear o modificar proveedores es un permiso distinto del de crear órdenes (solo Administrador por defecto). | v1, Etapa 2 | CA-011a |
| RF-OC-028 | Dar de baja un activo de valor con una segunda persona queda fuera de la v1; la baja con motivo y la auditoría la cubren. Se revisa en la Etapa 7 (P-009). | v1, Etapa 7 | CA-024 |
| RF-OC-048 | Medidas complementarias: informe mensual "sin respaldo de compra" a quien aprueba; aviso informativo "posible compra fraccionada" (mismo proveedor, suma sobre el límite en 30 días; la suma es de totales con impuesto en la moneda base y el aviso no bloquea ni cambia quién aprueba). **[PENDIENTE P-018]** qué registros entran al informe mensual en la v1 y dónde lo ve quien aprueba; el aviso ya tiene criterio (CA-102). | v1, Etapa 5 | CA-055 y CA-102 |

## 13. Recepción de mercadería

Basado en D-016, D-017, D-060. Etapa 5.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-OC-029 | La recepción es un documento propio con líneas (`RCP-000042`). Una orden puede tener varias recepciones; la cantidad recibida de una línea es la suma de las recepciones confirmadas. | v1, Etapa 5 | CA-033 |
| RF-OC-030 | **No se puede recibir más de lo pendiente.** Los sobrantes se manejan fuera de la orden. Mercadería dañada o devuelta al proveedor queda fuera de la v1. | v1, Etapa 5 | CA-034 |
| RF-OC-031 | En un SKU con serie, confirmar exige que la cantidad de series capturadas sea igual a la cantidad recibida. Si faltan series, se guarda como **borrador de recepción** o se recibe solo lo que ya tiene series; lo no recibido sigue pendiente. | v1, Etapa 5 | CA-034 |
| RF-OC-032 | Una recepción confirmada por error se puede **revertir** con un movimiento contrario y motivo (permiso sensible PS-68; **no la revierte quien la confirmó**, salvo la casilla «recepción»), solo mientras ninguno de sus activos haya sido asignado, movido o puesto en reparación. Revertir un ingreso **por cantidad** solo si ningún saldo queda negativo en cada ubicación; si no, se corrige con ajuste. Revertir la recepción de una orden cerrada a mano la reabre a Recibida parcial y anula el cierre. | v1, Etapa 5 | CA-062 y CA-036 |
| RF-OC-033 | **Confirmar es todo o nada**: si una serie falla, no se crea ningún activo. Un doble clic en "Confirmar" no crea los activos dos veces. | v1, Etapa 5 | CA-034 y CA-035 |
| RF-OC-034 | Dos personas recibiendo la misma orden a la vez no pueden pasarse de lo pendiente. | v1, Etapa 5 | CA-035 |
| RF-OC-035 | Al confirmar, los activos se crean en el inventario con su costo y moneda. En un SKU por serie, cada activo recibe además su código visible (RF-INV-034, RN-023). En un SKU por cantidad se suma al stock. | v1, Etapa 5 | CA-033 y CA-094b |
| RF-OC-036 | Al recibir se indica la ubicación de ingreso. Ubicación, fecha de compra y garantía se piden una sola vez para todo el lote. | v1, Etapa 5 | CA-033 |
| RF-OC-037 | Las series se pueden pegar en lista (una por línea, o separadas por coma o espacio), teclear o escanear con lector de código de barras. Tope de **1.000 series** por recepción y por lista pegada. | v1, Etapa 5 | CA-034 |
| RF-OC-038 | La validación es inmediata y con texto claro: "repetida en la fila 12", "ya existe en el SKU X". Los espacios sobrantes y las mayúsculas se limpian solos y se avisa. Las filas vacías se ignoran. | v1, Etapa 5 | CA-034 |
| RF-OC-039 | Los campos "a cada unidad" (IMEI) se piden en la misma tabla, pero se pueden completar después. | v1, Etapa 5 | CA-020 |
| RF-OC-040 | Antes de confirmar hay un resumen ("Se crearán 38 activos de LAP-0001 en Bodega Central. Faltan 2 por registrar"). | v1, Etapa 5 | CA-033 |
| RF-OC-041 | Nunca se borra una recepción ni un activo. | v1, Etapa 5 | CA-045 |
| RF-OC-049 | El **borrador de recepción no reserva** la cantidad, vale 7 días, lo retoma cualquiera con permiso de recepción y al confirmar se valida contra lo pendiente de ese momento. Pasados los 7 días el borrador ya no se puede confirmar (CA-103). **[PENDIENTE P-019]** si los 7 días corren desde que se creó o desde el último cambio. | v1, Etapa 5 | CA-061 y CA-103 |
| RF-OC-050 | Se puede recibir contra una orden ya emitida aunque el SKU o el proveedor se desactive después, con aviso. | v1, Etapa 5 | CA-061 |

## 14. Órdenes de servicio

Basado en D-027, D-044.10, D-049.6. Etapa 6. Se diseñan en detalle en la Etapa 6, desacopladas del inventario hasta entonces; no bloquea las Etapas 1 a 5.

```
Creada -> Asignada -> En ejecución -> Cerrada
(Cancelada en cualquier punto antes de cerrar)
```

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-OS-001 | Una **solicitud de trabajo** es una orden de servicio en estado Creada. | v1, Etapa 6 | CA-044 |
| RF-OS-002 | Se registra "Pedido por", el tipo de servicio, el activo relacionado (opcional) y a quién se asigna. | v1, Etapa 6 | CA-044 |
| RF-OS-003 | Los tipos de servicio son un catálogo configurable. Partida: Reparación, Instalación y Servicio externo (P-006). | v1, Etapa 6 | CA-044 |
| RF-OS-004 | Quien ejecuta puede ser una persona de la empresa o un proveedor del catálogo (dos destinos distintos). | v1, Etapa 6 | CA-044 |
| RF-OS-005 | La orden tiene número correlativo por empresa (`OS-000042`) que nunca se repite. | v1, Etapa 6 | CA-018 |
| RF-OS-006 | Una orden puede cancelarse antes de cerrar. Una orden cerrada no se reabre: se crea una nueva. | v1, Etapa 6 | CA-044 |
| RF-OS-007 | **Retirado (fusionado en RF-INV-012, D-075 H-AUD-23).** Abrir o cerrar la orden no cambia el estado del activo: una sola regla. | - | - |
| RF-OS-008 | La aprobación de una orden con costo sigue la regla única RN-017 (si supera el límite, otra persona; sin costo estimado no se aprueba). | v1, Etapa 6 | CA-055 |
| RF-OS-009 | Si el activo relacionado se da de baja, la orden abierta sigue su curso y muestra el aviso; no se cancela sola. | v1, Etapa 6 | CA-044 |
| RF-OS-010 | **Costo:** la orden guarda costo real, moneda, proveedor, centro de costo y la marca "cubierta por garantía", con el patrón de costo compartido (`fuente_costo`). | v1, Etapa 6 | CA-044 |
| RF-OS-011 | Si el módulo de mantenimiento está activo, una orden de servicio tiene un vínculo 1 a 1 con el mantenimiento. | Fase 2 | CA-044 |

## 15. Importación y exportación

### 15.1 Importación del Excel actual

Basado en D-050 (reemplaza D-020.4, .5 y .8). Etapa 4. Depende de ver el Excel real (P-002, P-007).

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-IMP-001 | La importación entra en la v1 para cargar el inventario actual. Hay **un solo marco** (plantilla declarativa por entidad) y **un solo asistente "Importar datos"** con selector de tipo (SKU, catálogos, Personas, activos, stock, y los demás de los módulos). Corre en segundo plano con avance. | v1, Etapa 4 | CA-038a |
| RF-IMP-002 | Pasos: plantilla con columnas fijas, subir, **vista previa** con el error de cada fila (número de fila, columna y motivo en español claro), confirmar. No se guarda nada hasta confirmar. | v1, Etapa 4 | CA-038a |
| RF-IMP-003 | **Todo o nada por lote**: si hay una fila con error, no se carga nada hasta corregir. El usuario descarga el reporte de errores y vuelve a subir. **La importación solo crea; no actualiza.** | v1, Etapa 4 | CA-038a |
| RF-IMP-004 | **Archivo ya importado:** un archivo ya confirmado (huella SHA-256 por empresa, lote confirmado y no deshecho) se rechaza entero con "este archivo ya se importó el [fecha] en el lote N". Un archivo corregido es otro archivo: sus filas se validan contra la base y una fila que ya existe por su clave natural es un error de esa fila ("ya existe"). | v1, Etapa 4 | CA-056 |
| RF-IMP-005 | **Claves naturales:** activo = SKU + serie normalizada; stock = un solo saldo inicial por SKU + ubicación; Persona = código de empleado o correo normalizado (se exige uno); línea = número; dominio = nombre normalizado; proveedor = identificación fiscal; SKU = código. | v1, Etapa 4 | CA-056 |
| RF-IMP-006 | **Deshacer = anular, nunca borrar:** las filas pasan a un estado final "Anulado por lote deshecho" con motivo, salen de los conteos y de las reglas de unicidad y conservan su historial. Solo se puede si **ninguna** fila del lote tiene un movimiento posterior (medido con una secuencia creciente por empresa, no con la hora). | v1, Etapa 4 | CA-038b |
| RF-IMP-007 | **Orden de dependencias:** catálogos, Personas, SKU, activos, saldos. SKU y valores desconocidos (marcas, ubicaciones) no se crean solos: se listan para que el administrador los apruebe en bloque. | v1, Etapa 4 | CA-038a |
| RF-IMP-008 | El stock inicial por cantidad entra como movimiento "saldo inicial" por ubicación. | v1, Etapa 4 | CA-038d |
| RF-IMP-009 | Los textos libres de estado del Excel se asocian a los 5 estados del activo en la vista previa; los que no se puedan asociar son error de fila (qué textos usa el Excel real se define con P-007). | v1, Etapa 4 | CA-038d |
| RF-IMP-010 | **Formato:** fechas `dd/mm/aaaa` o número de serie de Excel (otro formato es error de fila). La plantilla incluye costo, moneda, fecha de compra, fin de garantía directo o meses, y centro de costo. Las series dañadas por Excel se rechazan con aviso según las tres condiciones de RF-INV-005. | v1, Etapa 4 | CA-038c |
| RF-IMP-011 | **Seguridad de la lectura:** solo `.xlsx` y `.csv`, sin evaluar fórmulas ni entidades externas, con límite de tamaño descomprimido, de hojas, columnas y largo de celda, rechazo de macros, tiempo máximo y una importación a la vez por empresa. Las celdas de texto que empiezan con `=`, `+`, `-`, `@`, tabulador o retorno se tratan como texto; las numéricas siguen siendo números. | v1, Etapa 4 | CA-039 |
| RF-IMP-012 | **Retirado (2026-10-25).** El archivo original **no se guarda** (D-050.6): se leen las filas, se guardan las filas ya validadas en preparación (hasta confirmar o 7 días), la huella y el reporte de errores, y el archivo se descarta al terminar. | - | - |
| RF-IMP-013 | Importar es el permiso sensible `datos.importar`, activado solo para el Administrador. | v1, Etapa 4 | CA-011b |
| RF-IMP-014 | La empresa de destino sale de la sesión; si el archivo trae una columna de empresa, se ignora. | v1, Etapa 4 | CA-039 |
| RF-IMP-015 | **Topes:** 5.000 filas y 10 MB por archivo, 10 importaciones por día por empresa en total entre módulos (cuadro único de topes, RS-45). Para la carga inicial la plataforma puede subir el tope de una empresa por un periodo corto. | v1, Etapa 4 | CA-039 y CA-099 |
| RF-IMP-016 | Una importación queda como **una entrada de lote** en la auditoría más el detalle en su propia tabla (no 100.000 entradas sueltas). | v1, Etapa 4 | CA-041 y CA-100 |
| RF-IMP-017 | El Excel real se entrega con los nombres de personas reemplazados (P-002). Es una condición de proceso: se comprueba con una verificación documental (CA-105), no con una prueba automática. | v1, Etapa 0 | CA-105 |
| RF-IMP-018 | Las invitaciones masivas del portal van **por persona**, no todo o nada; la pantalla lo dice. | Fase 3 | CA-057 |

### 15.2 Puerta única de exportación

Basado en D-061.1 y D-054. Etapa 2.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-EXP-001 | Toda exportación pasa por una **puerta única** del núcleo. Ningún módulo exporta por su cuenta. Exportar es el permiso sensible `datos.exportar`. | v1, Etapa 2 | CA-067 |
| RF-EXP-002 | Antes de exportar: confirmación con **motivo**, vista de filas y de columnas sensibles. Las columnas de precios y de datos personales se omiten según los permisos del usuario, con aviso. | v1, Etapa 2 | CA-067 |
| RF-EXP-003 | **Límites:** 10 exportaciones por usuario por hora, 100 por empresa por día, 50.000 filas; más de 5 por hora por usuario dispara una alerta de uso inusual. | v1, Etapa 2 | CA-067 |
| RF-EXP-004 | El archivo trae una hoja "Aviso" con quién lo generó, cuándo y que contiene datos personales. La auditoría registra filas y columnas sensibles (sin el contenido). | v1, Etapa 2 | CA-067 |
| RF-EXP-005 | Las celdas de **texto** que empiezan con `=`, `+`, `-`, `@`, tabulador o retorno se exportan como texto; las numéricas no se alteran. | v1, Etapa 2 | CA-043 |
| RF-EXP-006 | "Exportar" se muestra siempre; sin permiso aparece desactivado con la razón escrita. | v1, Etapa 2 | CA-043 |
| RF-EXP-007 | Las exportaciones grandes corren en segundo plano con avance y se entregan por una descarga con vencimiento. Los campos secretos nunca se exportan. | v1, Etapa 2 | CA-043 |

## 16. Auditoría

Basado en D-018, D-019, D-030, D-041, D-052, D-054, D-061.6. Etapa 1: se construye como mecanismo general para que todas las etapas siguientes lo usen.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-AUD-001 | La auditoría **solo se agrega**: no se edita ni se borra desde la aplicación, ni siquiera por el Administrador. La base de datos no da al usuario de la aplicación permiso de editar o borrar. | v1, Etapa 1 | CA-040a |
| RF-AUD-002 | Se escribe en la misma operación que el cambio: si el cambio ocurre, la auditoría existe; si falla, no queda un cambio sin rastro. | v1, Etapa 1 | CA-040a |
| RF-AUD-003 | Cada entrada guarda: quién (la membresía), cuándo, qué empresa, qué registro, qué acción, valor anterior y nuevo (excepto los campos personales y secretos, RF-AUD-014), motivo cuando aplique, y desde dónde (IP) si se puede. **El motivo se guarda por valor** (D-030.6) y es texto libre que no se puede anonimizar de forma garantizada (18.1); como la auditoría solo se agrega, la copia del motivo vence con el plazo de la auditoría y no se redacta (RF-DAT-013 redacta el registro, no la auditoría). | v1, Etapa 1 | CA-041 |
| RF-AUD-004 | Se registran como mínimo: altas, cambios (con antes y después), aprobaciones, rechazos, anulaciones, bajas y asignaciones de usuarios, personas, roles y permisos, catálogos, SKU, activos, órdenes, recepciones, importaciones y configuración de aprobaciones, montos y módulos. | v1, Etapa 1 | CA-041 |
| RF-AUD-005 | También se registran: invitaciones, cambios de empresa activa, importaciones, exportaciones, accesos del Administrador de plataforma, consultas a la clave de una licencia, **lecturas masivas (desde 5.000 filas)**, consultas al registro de envíos y al de solicitudes de derechos, y **las consultas a la propia auditoría**. | v1, Etapa 1 | CA-041 |
| RF-AUD-006 | No guarda contraseñas, enlaces de acceso, claves de licencia ni más datos personales de los necesarios. | v1, Etapa 1 | CA-042 |
| RF-AUD-007 | Ven la auditoría el Administrador y Jefatura TI por defecto (permiso sensible `auditoria.ver`, que cada empresa puede dar a otros roles). El visor oculta los campos que el lector no puede ver en su origen (precios, datos personales). | v1, Etapa 1 | CA-011b |
| RF-AUD-008 | La auditoría es distinta del historial de un activo: el historial dice qué pasó con el activo; la auditoría dice quién tocó qué. | v1, Etapa 1 | CA-041 |
| RF-AUD-009 | "Registro importante" significa todo lo listado en RF-AUD-004 y RF-AUD-005. | v1, Etapa 1 | CA-041 |
| RF-AUD-010 | **Eventos de seguridad aparte:** los intentos rechazados por empresa ajena o por falta de permiso, los accesos fallidos y los inicios de sesión fallidos van a un registro separado, escrito en una **transacción independiente** (el rechazo no la revierte), con la **empresa del actor** (nunca la del objeto ajeno), sin datos del objeto, con tope de ritmo y agrupación por minuto. Plazo propuesto: 12 meses. Los ve la empresa del actor (PS-19) y la plataforma. | v1, Etapa 1 | CA-066 y CA-002 |
| RF-AUD-011 | Nada con historial se borra. Lo que tiene historia se desactiva, se anula o se da de baja, con motivo. Solo se borran de verdad los borradores que nunca tuvieron efecto. Donde la v0.1 decía "eliminó", ahora dice "anuló o dio de baja". | v1, Etapa 1 | CA-045 |
| RF-AUD-012 | Los identificadores internos que se ven en la dirección web no son consecutivos ni adivinables. Los códigos para personas (SKU, número de orden) son aparte. | v1, Etapa 1 | CA-001 |
| RF-AUD-013 | Cada entrada indica el **tipo de autor**, con **tres valores**: membresía (usuario), integración (programa externo con clave de API) y **sistema** (con el identificador de la regla y de quien la configuró, por ejemplo una renovación automática). | v1, Etapa 1 | CA-041 |
| RF-AUD-014 | **Campos personales:** los datos personales (lista cerrada de la sección 18.2) viven solo en los registros de Persona y de Usuario. La auditoría y el historial guardan únicamente el **identificador interno**. Cuando un cambio toca un campo personal, la auditoría registra **qué campo cambió** pero **no el valor anterior ni el nuevo**. | v1, Etapa 1 | CA-054a |
| RF-AUD-015 | **Anonimizar = sobrescribir** los datos en el registro de Persona o de Usuario con una referencia; la auditoría no se toca y sigue legible. La anonimización queda como un evento (quién la ordenó o que fue automática, y cuándo). Como la anonimización manual existe desde la Etapa 2 (RF-PER-013), esto y el registro de anonimizaciones (RF-DAT-016) existen desde la Etapa 2. | v1, Etapa 2 | CA-054a |
| RF-AUD-016 | Lo que en la auditoría pueda ser dato personal indirecto (como la IP) se conserva solo hasta que venza el plazo de la auditoría. Un **proceso de mantenimiento separado** de la aplicación (no un botón del administrador), con dos personas, archiva o elimina las entradas vencidas **por partición** a los 5 años y deja constancia; es el único borrado permitido. Omite a las empresas con congelación por incidente vigente y retoma al levantarla (RF-DAT-017). | v1, Etapa 7 | CA-054c y CA-095h |
| RF-AUD-017 | **Dos registros:** el de plataforma y el de empresa. Todo acceso de soporte aparece en la auditoría de la empresa. | v1, Etapa 1 | CA-015b |
| RF-AUD-018 | **Copia externa** de la auditoría: solo de agregar, inmutable y encadenada (cada archivo lleva la huella del anterior), cada hora, con verificación semanal y alerta inmediata si no coincide. Hace **detectable** una alteración por alguien con poder total. | v1, Etapa 7 | CA-040b |
| RF-AUD-019 | La auditoría de un lote de importación es una entrada de lote con el detalle en su propia tabla. | v1, Etapa 4 | CA-041 |

## 17. Seguridad (RS)

Reúne los requisitos del Especialista en Seguridad. Donde ya están escritos como requisito funcional, se indica dónde.

| RS | Requisito | Dónde está |
|---|---|---|
| RS-01 a RS-05 | Sin registro abierto; correo verificado; invitaciones que vencen y se usan una vez; sin unión por dominio; correos sin distinguir mayúsculas. | RF-ACC-001 a RF-ACC-010 |
| RS-06 a RS-09 | Una cuenta y una membresía por empresa; la empresa activa va en la dirección y la comprueba el servidor; una empresa nunca ve a qué otras pertenece una persona; cambiar de empresa se registra y no arrastra datos. | RF-ACC-011, RF-ACC-012 |
| RS-10 | Todo dato de negocio tiene empresa. La base de datos impide leer o escribir datos de otra empresa aunque el código se equivoque (seguridad por fila forzada, referencias dentro de la misma empresa, cinco roles de base de datos; las únicas tablas sin empresa son una lista global cerrada y corta). Hay una prueba de aislamiento por módulo, con el rol de la aplicación. | RN-001, CA-001, CA-002 |
| RS-11 | Las referencias entre datos pertenecen a la misma empresa. | CA-003 |
| RS-12 | Si en el futuro se guardan archivos, quedan separados por empresa y solo se entregan tras comprobar el acceso. | Sección 25 (D-022) |
| RS-13 | Los identificadores de la dirección web no son consecutivos ni adivinables. Para un identificador de otra empresa se responde "no encontrado". | RF-AUD-012, RN-011 |
| RS-14 a RS-17 | Permisos comprobados en el servidor; siempre un administrador activo; nadie se da permisos; permisos sensibles separados en un registro único. | RF-ROL-004 a RF-ROL-014 |
| RS-18 | Separación de funciones en compras con interruptor único y auditado. | RF-OC-021 a RF-OC-026 |
| RS-19 a RS-21 | Administrador de plataforma sin acceso a datos del negocio; soporte autorizado y con vencimiento; control dual; nadie entra a la base de datos de producción. | Sección 6 |
| RS-22 | Retirado por D-002: no hay contraseñas en la v1. | RF-ACC-005 |
| RS-23 | Protección contra intentos repetidos; el error nunca dice si el correo existe. | RF-ACC-017 |
| RS-24 | Reemplazado por D-002: el enlace de acceso dura 15 minutos, un solo uso y atado al navegador. | RF-ACC-006 |
| RS-25 a RS-28 | Sesiones con vencimiento, cierre en todos los dispositivos, baja que corta sesiones, segunda verificación por permiso sensible, recuperación del único administrador. | RF-ACC-013 a RF-ACC-019 |
| RS-29 a RS-35 | Importaciones: permiso aparte, tipos y tamaños, vista previa, fórmulas como texto, empresa desde la sesión, límites, archivo original no guardado. | RF-IMP-001 a RF-IMP-015 |
| RS-36 a RS-39 | Auditoría que solo se agrega, con eventos de seguridad, sin datos de más; nada con historial se borra. | Sección 16 |
| RS-40 | Secretos y claves nunca en el repositorio; ningún dato personal real en desarrollo ni en pruebas; una prueba automática busca secretos. | RF-DAT-010, RS-46 |
| RS-41 | Los errores que ve el usuario no revelan detalles internos ni datos personales. | RNF-009 |
| RS-42 | Todo texto que escribe un usuario se trata como texto, nunca como código; un **validador común** rechaza bloques de clave privada y patrones de claves conocidos en todo campo de texto; los enlaces externos solo `https` con aviso de salida. | CA-039, CA-078 |
| RS-43 | Antes de cada liberación se revisan las dependencias con vulnerabilidades conocidas. | RNF-015 |
| RS-44 | Respaldos cifrados, con prueba de restauración, sin mezclar empresas. | RNF-014 |
| RS-45 | **Cuadro único de topes** (D-054): enlaces de ingreso 5 por correo por hora, 10 por día, 20 por IP por hora; 5 intentos fallidos con esperas de 1, 2, 5 y 15 minutos; invitaciones 20 por administrador por hora y 100 por empresa por día; importaciones 10 por día por empresa, 5.000 filas, 10 MB, una a la vez; exportaciones 10 por usuario por hora, 100 por empresa por día, 50.000 filas; lectura masiva por API de más de 5.000 filas por día por clave, tratada y auditada como exportación; revelar clave de licencia 20 por usuario por hora; correos 1.000 por día por empresa, con cupo propio para los obligatorios y para el aviso de orden por aprobar. | Cuadro único (limitador en base de datos) |
| RS-46 | **Gestión de secretos y llaves:** una llave maestra fuera de la base y de los respaldos (gestor de secretos); llaves derivadas por empresa (claves de licencia, secretos de webhook) y por usuario (semilla de la segunda verificación); cifrado con versiones, rotación anual y ante sospecha, con recifrado por lotes; respaldo de las llaves por separado, en dos lugares, con al menos dos custodios; una restauración de ensayo comprueba que la llave guardada abre la copia. Ningún secreto en el repositorio, en el JSON de campos, en registros técnicos, auditoría ni exportaciones. | D-048.4 |
| RS-47 | **PDF** de actas y órdenes con una librería que no interpreta HTML ni descarga recursos; todo texto se escapa; prueba con texto malicioso en cada campo. | CA-078 |
| RS-48 | **Anti-SSRF, claves y webhooks** (cuando existan, Fase 3): el secreto del webhook se guarda cifrado y se muestra una vez; las claves de API se guardan como huella de alta entropía con identificador público propio; envío desde un componente aislado, solo puerto 443, sin redirecciones, con resolución de DNS fijada. | `integraciones-api.md`, D-047 |
| RS-49 | **Restauración:** al restaurar y antes de abrir el sistema se reaplican las anonimizaciones, se revocan todas las sesiones y enlaces, se rotan las claves de API y se reaplican suspensiones, bajas y cambios de rol posteriores al respaldo. | D-052.4 |
| RS-51 | **Solo huella (D-065, S-34):** los enlaces de ingreso, las invitaciones, las sesiones, los códigos de recuperación y los enlaces de descarga se guardan **solo como huella irreversible**, con vencimiento y un solo uso donde corresponda; el valor en claro solo existe en el correo o la pantalla de su dueño. Una **prueba automática en integración continua** comprueba que la base no contiene ningún valor que sirva directamente para entrar. | H-SEG-26, CA-083 |
| RS-50 | **Roles de base de datos:** `app_empresa` (sin ser dueño, sin saltarse las reglas por fila), `app_plataforma` (solo tablas globales), `migraciones`, `mantenimiento` y `lector_auditoria`. Las pruebas de aislamiento corren con `app_empresa`. | D-039.3 |

## 18. Datos personales y retención

Basado en D-024, D-030, D-032, D-033, D-034, D-051, D-052, D-061. **Todos los plazos son una propuesta hasta que legal los confirme por escrito. No se activa ninguna anonimización ni purga automática antes de esa confirmación.** Ver la sección 25 (L-01 a L-16, I-01 a I-04).

### 18.1 Tabla única de retención y anonimización

Cada módulo declara aquí sus campos personales; los que no se declaran no pasan a desarrollo (D-061.3).

| Dato | Módulo | Finalidad | Quién lo ve | Plazo propuesto | Rutina |
|---|---|---|---|---|---|
| Nombre y correo de un usuario (membresía) | Acceso | Entrar; saber quién hizo qué | Administrador y Jefatura TI de su empresa; el propio usuario | Mientras sea usuario; 2 años tras la baja | Anonimizar (sobrescribir) |
| Cuenta global (correo, segunda verificación) | Acceso | Identidad | Solo el propio usuario y el sistema | Mientras tenga alguna empresa activa | Se anonimiza cuando no le queda ninguna empresa |
| Nombre, tipo, código de empleado, puesto, área, ubicación habitual, jefe directo, fechas, correo de una Persona | Personas | Saber quién tiene cada equipo | `datos_personales.ver` (jefe directo solo con ese permiso) | Mientras exista; 2 años tras el cese | Anonimizar |
| Activos asignados e historial de asignaciones | Inventario | Saber dónde está cada equipo | `datos_personales.ver` para el nombre; todos ven la referencia | Desde la asignación hasta su cierre más el plazo de auditoría | Conservar con la referencia |
| **Copia del nombre y área en el acta de entrega** | Entregas | Constancia de lo firmado | Quien ve el acta con `datos_personales.ver` | Cierre de la asignación más 5 años (`retener_hasta`, RF-DAT-006) | La anonimización limpia la copia al vencer `retener_hasta` (excepción declarada, 18.3) |
| IMEI y número de línea de un celular asignado | Inventario / Líneas | Identificar equipo y línea | `datos_personales.ver` | Igual que la asignación | Se trata como dato personal hasta que legal diga (L-09) |
| Titular persona natural de un dominio | Dominios | Quién es dueño | `datos_personales.ver` | Vida del dominio más 2 años | Anonimizar |
| Contactos de proveedor | Proveedores | Contactar al proveedor | `proveedores.ver_contactos` | Inactivos 2 años | Anonimizar; fuera de exportaciones generales |
| Casos y comentarios (texto libre) | Mesa de ayuda | Atender pedidos | Quien atiende y la Persona atendida | 5 años (provisional) | No se puede anonimizar de forma garantizada el texto libre; se declara en el aviso de privacidad |
| Solicitudes de derechos | Personas | Atender derechos | `personas.derechos_atender` | Plazo que fije legal | Invisibles por todas las vías |
| Registro de envíos (correo del destinatario) | Notificaciones | Probar entregas | `notificaciones.registro_ver` | 12 meses (propuesto); correo enmascarado a los 90 días | Enmascarar a los 90 días y purgar a los 12 meses |
| Puestos de licencia ligados a una Persona | Licencias | Saber quién usa cada puesto | `datos_personales.ver` | Mientras el puesto esté asignado; al liberarlo queda en el historial con la referencia | Referencia a la Persona; anonimizar con ella |
| Respuestas de encuestas con nombre | Mesa de ayuda | Medir la atención | `ayuda.encuesta_ver_detalle` (sensible) | 5 años (provisional, como el caso) | Referencia a la Persona; el comentario libre no se anonimiza de forma garantizada |
| Acuse de recibo con dirección IP | Portal / Entregas | Constancia de que el empleado recibió | Quien ve el acta con `datos_personales.ver` | 12 meses (la IP); el acuse mientras la asignación más 5 años | La IP se purga a los 12 meses; el acuse sigue la regla del acta |
| Textos de extravío o robo | Entregas / Inventario | Dejar constancia de lo ocurrido | Solo con permiso; no salen en portal, exportaciones ni reportes | Igual que la asignación | Redacción por seguridad (PS-234); texto libre |
| Comentarios de cambios y de problemas | Cambios / Problemas | Seguimiento técnico | Quien ve el cambio o el problema | 5 años (provisional) | Texto libre no anonimizable de forma garantizada; redacción por seguridad (PS-221, PS-222) |
| **Motivos y notas** de cualquier registro | Todos | Explicar por qué se hizo algo | Quien ve el registro | El del registro al que pertenecen | **Texto libre no anonimizable de forma garantizada**; se declara en el aviso de privacidad; redacción por seguridad (PS-234) |
| Direcciones IP y accesos | Auditoría y eventos de seguridad | Seguridad y control | `auditoria.ver` y `auditoria.ver_seguridad` | Auditoría 5 años; eventos de seguridad 12 meses | Proceso de mantenimiento por partición |
| Aceptación del aviso de privacidad | Acceso | Constancia | Administrador | Mientras exista la cuenta | Conservar |
| Responsable de un centro de costo, de un dominio o de un contrato | Varios | Saber a quién avisar | Quien ve el registro | Mientras sea responsable | Referencia a la Persona |
| Tareas de alta y baja con nombres | Onboarding | Seguimiento | Quien tiene la tarea | Plazo del proceso | Referencia a la Persona |
| Destinatarios de reportes programados | Reportes | Enviar reportes | Quien lo programó y `reportes.ver_programaciones` | Mientras exista la programación | Referencia |
| **Contacto autorizado de cada empresa** (nombre, correo y medio de contacto; RF-ACC-002, RF-PLA-011) | Plataforma / Acceso | Avisar a la empresa en un incidente o rescate cuando el correo normal no basta | Administrador de plataforma y administradores de esa empresa | Mientras sea el contacto vigente; el anterior se conserva 2 años tras el cambio como constancia de a quién se avisó **[LEGAL: L-04]** | Anonimizar al vencer; el cambio de contacto deja auditoría sin el valor (18.2) |
| **Personas administradoras de la plataforma** (cuenta con rol de plataforma) | Plataforma / Acceso | Operar la plataforma y atender rescates | Las propias personas administradoras y el sistema | Mientras ejerzan el puesto; 2 años tras salir **[LEGAL: L-04]** | Anonimizar (igual que una membresía); sus acciones quedan por identificador en el registro de plataforma |
| **Código de usuario enviado a SAP** (código interno que identifica a quien creó y aprobó; RN-INT-043, D-058) | Integraciones (Fase 3) | Que SAP sepa quién creó y aprobó, sin nombre ni correo | `integraciones.sap_exportar` y el sistema SAP de la empresa | El del lote de exportación, que no se borra | Es un identificador sin nombre ni correo; al anonimizar a la persona el código queda sin vínculo. Se trata como dato personal hasta que legal diga **[LEGAL: L-09]** |
| **Representante de la empresa fuera de la plataforma** (nombre y medio de contacto; procedimiento de incidentes, anexo C.8) | Procedimiento de incidentes (fuera de la plataforma) | Avisar cuando falle el correo de la plataforma | Jefatura de Proyecto y Especialista en Seguridad, en un lugar controlado fuera del repositorio (RF-DAT-010) | Mientras la empresa sea cliente; se revisa una vez al año | Borrar al cambiar de representante o al terminar el servicio a la empresa **[LEGAL: L-04]** |

**Declaración (D-075 R-09):** los motivos, notas, observaciones y comentarios de texto libre pueden contener datos personales que la persona escribió; la plataforma **no puede garantizar su anonimización**. Esto se declara en el aviso de privacidad y la única vía correctiva es la redacción por seguridad (PS-234 y los permisos de cada módulo).

### 18.2 Lista cerrada de campos personales que la auditoría nunca guarda por valor

Nombre, correo, código de empleado, área, puesto, jefe directo, teléfono, número de línea, IMEI asociado a una Persona, titular persona natural de un dominio y contactos de proveedor. La auditoría registra que el campo cambió, no su contenido (RF-AUD-014).

### 18.3 Reglas y excepción declarada

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-DAT-001 | No se guardan documento de identidad, dirección ni teléfono personal en la v1, salvo decisión expresa. | v1, Etapa 2 | CA-016a |
| RF-DAT-002 | **Auditoría: 5 años.** **[ESCALAR AL CEO]** confirmar con legal (L-04). | v1, Etapa 7 | CA-040b |
| RF-DAT-003 | **Datos personales de una Persona o usuario dado de baja o cesado: 2 años; luego se anonimiza** (sobrescribir). **[ESCALAR AL CEO]** irreversible (I-01) y legal (L-04). | v1, Etapa 7 | CA-054c |
| RF-DAT-004 | **Archivos de importación:** el archivo original no se guarda (RF-IMP-012). Las filas en preparación duran hasta confirmar o 7 días. | v1, Etapa 4 | CA-056 |
| RF-DAT-005 | **Respaldos (D-032, a confirmar con legal):** diarios durante 30 días y uno mensual durante 12 meses; cifrados y sin mezclar empresas. Un dato anonimizado puede seguir en respaldos hasta 12 meses y se declara en el aviso de privacidad. Al restaurar un respaldo antes de abrir el sistema se reaplica el **registro de anonimizaciones** (RF-DAT-016, que existe desde la Etapa 2). La auditoría de 5 años vive en el sistema, no en los respaldos. **[ESCALAR AL CEO]** plazo (L-04) y costo (D2). | v1, Etapa 7 | CA-054c |
| RF-DAT-006 | **Constancias de entrega y devolución:** el plazo de 5 años (regla provisional D-033) **corre desde el cierre de la asignación a la que pertenece el acta** (devolución, baja o extravío). Mientras la asignación siga abierta no hay fecha: `retener_hasta` queda vacía y el nombre no se limpia. Al cerrarse se calcula `retener_hasta` = fecha de cierre + 5 años (D-065, S-36). **Provisional hasta la opinión legal** (L-05, L-12). Un acta cuya asignación sigue abierta no vence. | v1, Etapa 4 | CA-046 |
| RF-DAT-007 | Debe poder atenderse una solicitud de acceso, corrección o eliminación de datos personales y exportar y anonimizar a una persona sin romper el historial. **[ESCALAR AL CEO]** procedimiento y plazos (L-06). | v1, Etapa 7 | CA-076 |
| RF-DAT-016 | **Registro de anonimizaciones:** una lista aparte que guarda solo el identificador y la fecha de cada anonimización, en un almacén propio fuera de la base que se restaura, sin rotación y replicado, para que sobreviva a una pérdida total. **Existe desde la Etapa 2, antes de la primera anonimización manual.** Al restaurar cualquier respaldo, antes de abrir el sistema se reaplica (RS-49). | v1, Etapa 2 | CA-054a |
| RF-DAT-008 | Los datos personales no aparecen en mensajes de error ni en registros técnicos. | v1, Etapa 1 | CA-073 |
| RF-DAT-009 | Los datos personales de una empresa nunca se muestran a otra. Un administrador solo ve de un usuario lo necesario para su empresa. | v1, Etapa 1 | CA-004 |
| RF-DAT-010 | Ningún dato personal real en el repositorio ni en el entorno de pruebas. El Excel, la OC y la OS reales se entregan con nombres reemplazados, o se guardan en un lugar controlado fuera del repositorio. Una prueba global de QA busca un nombre "canario" en toda la base, exportaciones y correos. | v1, Etapa 0 | CA-073 |
| RF-DAT-011 | **Excepción declarada (D-051):** la copia del nombre y el área en el acta de entrega vive en **columnas propias del acta** con la fecha `retener_hasta` (cierre de la asignación más 5 años, RF-DAT-006), no se escribe en la auditoría, y se limpia al vencer `retener_hasta`. Se declara en esta tabla y en el aviso de privacidad. **No se anonimiza antes** mientras legal no responda (D-033). **[ESCALAR AL CEO]** irreversible si legal pide anonimizar antes (L-05, L-12). | v1, Etapa 4 | CA-054b |
| RF-DAT-012 | **Correos con contenido mínimo:** a una Persona sin Usuario o a una dirección sin verificar solo se envían tipo de aviso, código (`ACT-E-000123`, `ACTV-000123`, `PRS-0042`), fecha y nombre de la empresa; sin serie, IMEI, nombres de terceros, importes ni enlaces de acción. Entre usuarios, un nombre solo si hace falta para actuar. La ficha de la Persona muestra "correo no verificado"; cambiar un correo queda auditado. | v1, Etapa 1 | CA-074 |
| RF-DAT-013 | **Redacción por seguridad del núcleo (D-074.3, D-075 R-09):** operación distinta de "retirar", con el permiso sensible `texto.redactar` (PS-234) y motivo obligatorio, que reemplaza un texto libre de cualquier registro del núcleo (motivo, nota, observación) por `[REDACTADO]` y deja en la auditoría quién, cuándo y por qué, sin el texto. Los textos de extravío con posible acusación se ven solo con permiso y no salen en el portal, exportaciones ni reportes. En mesa de ayuda, cambios y problemas la redacción usa sus propios permisos (PS-153, 221, 222). | v1, Etapa 4 | CA-091 |
| RF-DAT-014 | **Aviso de privacidad configurable:** el texto para empleados lo entrega cada empresa; la plataforma lo imprime en el acta y lo muestra en el portal; se vuelve a pedir la aceptación cuando cambia la versión. **Contenido mínimo del aviso:** qué datos se guardan, para qué, quién los ve, cuánto tiempo, cómo ejercer los derechos (RF-DAT-007), la excepción del acta (RF-DAT-011), la permanencia en respaldos hasta 12 meses (RF-DAT-005) y **la declaración de texto libre (D-075 R-09): motivos, notas, observaciones y comentarios pueden contener datos personales que la persona escribió y la plataforma no puede garantizar su anonimización; la única vía correctiva es la redacción por seguridad**. La declaración de texto libre la agrega la plataforma como bloque fijo que la empresa no puede quitar. | v1, Etapa 1 | CA-049 |
| RF-DAT-015 | **Procedimiento ante una fuga de datos (D-059):** líder del incidente = Especialista en Seguridad; contener en 1 hora; avisar al Cliente (CEO) en 24 horas; evaluar alcance en 24 horas; informe en 10 días; avisos a empresas y personas afectadas en un plazo propuesto de 72 horas salvo que legal fije uno menor. Se redacta en `docs/operaciones/procedimiento-incidente-datos.md` antes de producción. **[ESCALAR AL CEO]** obligación y plazos legales (L-16). | v1, Etapa 7 | CA-053 |
| RF-DAT-017 | **Congelación por incidente (D-080; procedimiento de incidentes, C.5.2):** mientras dura la preservación de evidencia de un incidente de datos, el Administrador de plataforma puede declarar una **congelación** sobre una empresa entera o sobre Personas concretas de una empresa, anotando el identificador del incidente (sin datos personales). Mientras está vigente se aplica RN-024: se rechaza la anonimización manual (RF-PER-013) y se omiten la anonimización automática, el archivado de la auditoría vencida (RF-AUD-016) y las purgas y enmascarados de la tabla 18.1. La congelación **no borra ni cambia nada**; lo omitido se retoma al levantarla. Los pedidos de derechos se siguen registrando y su plazo corre (RF-PER-012). Si un abogado indica que un pedido de eliminación debe cumplirse de inmediato, prevalece lo legal: se levanta la congelación solo para esa Persona, con el motivo «indicación legal». Declarar, levantar y cada rechazo u omisión quedan en el registro de plataforma y en la auditoría de la empresa afectada. Una congelación vigente se reaplica al restaurar un respaldo (RS-49). La rotación de respaldos no es de la plataforma: la cubre el procedimiento de incidentes (sección 4, paso 5). **[PENDIENTE P-017]** el permiso nuevo en el registro, si levantar exige una segunda persona de plataforma y si la redacción por seguridad (RF-DAT-013) se congela. | v1, Etapas 2 y 7 | CA-095a, CA-095b, CA-095c, CA-095d, CA-095e, CA-095f, CA-095g, CA-095h y CA-095i |

## 19. Calidad, límites, uso y continuidad

### 19.1 Requisitos de calidad y uso

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RNF-001 | El idioma de la plataforma es español y el trato es de "usted" en toda pantalla, portal y correo. | v1, Etapa 1 | CA-050b |
| RNF-002 | Cada empresa tiene su zona horaria. Las fechas de garantía y vencimiento son fechas de calendario (sin hora). Los momentos exactos se guardan en hora universal. Formato de fecha día/mes/año. El formato de número lo da el país; mientras no se sepa (P-004), el del navegador. Siempre el código de moneda junto al importe. | v1, Etapa 1 | CA-046 |
| RNF-003 | Funciona en computador, tablet y celular. La recepción, la búsqueda, la entrega y la aprobación se diseñan para pantalla pequeña; roles, presupuesto, importación y configuración se ven en celular pero se editan en pantalla grande. | v1, Etapa 4 | CA-050a |
| RNF-004 | **Medible:** WCAG nivel AA (contraste), pantalla de 360 px de ancho sin desplazamiento horizontal, uso completo por teclado, objetivos táctiles de 44 px, modo claro y oscuro, y estados con texto además de color. | v1, Etapa 1 | CA-050a |
| RNF-005 | El lector de código de barras se soporta como entrada (escribe como teclado; el cursor salta a la siguiente fila). Etiquetas, QR y cámara quedan fuera de la v1. | v1, Etapa 5 | CA-034 |
| RNF-006 | Toda lista tiene buscador, filtros (estado, ubicación, categoría) y exportación a Excel (sección 15.2). | v1, Etapa 2 | CA-043 |
| RNF-007 | Hay un buscador global **agrupado por tipo** (SKU, serie, activo, orden). Solo encuentra lo de la empresa activa y lo que el rol permite ver. | v1, Etapa 4 | CA-048 |
| RNF-008 | El **Inicio es una página de tarjetas** que cada módulo aporta, con una tarjeta principal por rol y un máximo de seis visibles (sección 20). | v1, Etapa 1 | CA-050b |
| RNF-009 | Los textos de error son claros y no muestran detalles internos ni datos personales. Existen tres mensajes y tres bloqueos (sección 20.4). | v1, Etapa 1 | CA-073 |
| RNF-010 | **Volumen de referencia (una sola cifra para todos los módulos):** 100.000 activos por empresa, con el diseño preparado para el doble sin rehacer; se mide cuando haya cifras reales (P-003). | v1, Etapa 7 | CA-053 |
| RNF-011 | Con el volumen de referencia, el 95 % de las listas y búsquedas responde en menos de 2 segundos y confirmar una recepción de 100 series tarda menos de 5 segundos. La prueba de carga corre en integración nocturna desde la Etapa 4. | v1, Etapa 4 | CA-053 |
| RNF-012 | Disponibilidad: sin compromiso de funcionar 24 horas en la v1; los mantenimientos se avisan. | v1, Etapa 7 | CA-053 |
| RNF-013 | Toda acción importante muestra una confirmación. **Son reversibles** (D-072.3): el cambio de estado (por reingreso), la asignación (por devolución o traspaso), la recepción (por reversión), un lote de importación (por anulación), una orden aprobada y editada (vuelve a pendiente) y todo lo que se desactiva (se reactiva). **No son reversibles:** anonimizar, purgar, exportar y una aprobación ya consumida por una recepción. **No hay un botón "Deshacer" genérico.** Hay **borradores automáticos** en recepción, orden de compra, entrega e importación. | v1, Etapa 4 | CA-069 y CA-090 |
| RNF-014 | Respaldo automático diario y cifrado, con restauración probada antes de la Etapa 1, antes de cada etapa que pase a uso real y una vez al mes en producción, sin mezclar datos de empresas. Objetivos provisionales: pérdida máxima 24 horas y recuperación en 4 horas en horario laboral. | v1, Etapa 7 | CA-053 |
| RNF-015 | Cada despliegue tiene un plan de vuelta atrás escrito y ensayado con cronómetro. | v1, Etapa 7 | CA-053 |
| RNF-016 | Manual del usuario y del administrador al cierre de cada etapa; manual de operación (respaldo y restauración) antes de producción. | v1, Etapa 7 | CA-053 |
| RNF-017 | El costo de alojamiento, respaldos y soporte se estima en la Etapa 0. **[ESCALAR AL CEO]** (sección 25, D2). | v1, Etapa 0 | CA-053 |
| RNF-018 | Pasar a producción con datos reales lo aprueba el Cliente (CEO) tras la demo, con respaldo restaurado y anonimizaciones reaplicadas. **[ESCALAR AL CEO]** (sección 25, I-03). | v1, Etapa 7 | CA-053 |
| RNF-019 | **Trabajos en segundo plano:** importación, exportación hasta 50.000 filas y PDF masivo corren fuera de la petición con barra de avance. Los procesos diarios son idempotentes, recuperables (al arrancar procesan los días pendientes en orden), se ejecutan empresa por empresa con la empresa fijada, saltan empresas suspendidas, calculan "hoy" con la zona de la empresa y dejan un registro de cada corrida. | v1, Etapa 1 | CA-077 |
| RNF-020 | **Reloj de la plataforma:** las pruebas pueden fijar y adelantar la fecha (solo en entornos de prueba) y disparar a mano los procesos diarios. | v1, Etapa 1 | CA-077 |
| RNF-021 | Un solo programador reparte los trabajos diarios. Los eventos que protegen la integridad (liberar puestos, cerrar asignaciones, crear el registro de costo, bloquear la anonimización) corren síncronos en la misma operación; los avisos y espejos corren en segundo plano. | v1, Etapa 1 | CA-077 |
| RNF-022 | Una **vigencia** (contrato, garantía, dominio) se calcula al leer con la fecha y la zona horaria de la empresa; no se guarda un estado "Vencido" que cambie un proceso. | Fase 2 | CA-077 |

### 19.2 Límites y formatos

Los valores están **en firme** (D-072.1; P-013 cerrado) y se cambian con una decisión nueva. Una regla sin límite lo dice expresamente.

| Dato | Límite |
|---|---|
| Nombre de SKU | 120 caracteres |
| Nombre de Persona | 120 caracteres |
| Nombre de proveedor | 160 caracteres |
| Nombre de ubicación, área, centro de costo, categoría | 80 caracteres |
| Texto de un campo personalizado | 255 caracteres |
| Nombre de un campo personalizado | 60 caracteres |
| Opciones de una lista | hasta 100 |
| Campos personalizados por categoría | hasta 40 |
| Serie | 64 caracteres |
| Campo secreto (por ejemplo la clave de una licencia) | 512 caracteres |
| Texto del aviso de privacidad | 5.000 caracteres |
| Motivo | 500 caracteres |
| Notas de un documento | 1.000 caracteres |
| Correo | 254 caracteres |
| Cantidad de una línea | hasta 1.000.000 (con los decimales de su unidad) |
| Precio unitario | hasta 999.999.999,9999 |
| Líneas por orden de compra | hasta 200 |
| Stock por SKU y ubicación | hasta 10.000.000 |
| Series por recepción | 1.000 |
| Niveles de ubicación | 3 |
| Número de documento (`OC-`, `OS-`, `RCP-`) | mínimo 6 dígitos, sin tope |
| Correlativo de SKU | mínimo 4 dígitos, sin tope |
| Números | admiten hasta 4 decimales; sin tope más allá de los máximos de arriba |

## 20. Pantallas y navegación

Basado en D-053. El prototipo de la Etapa 0 muestra las **26 pantallas A** y 18 B; las fases 2 y 3 se muestran al Cliente (CEO) como muestras.

| ID | Requisito | Cuándo | CA |
|---|---|---|---|
| RF-UX-001 | **Mapa de navegación por perfil:** 8 perfiles (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, Solo lectura, Empleado (portal), Administrador de plataforma) y 8 grupos de menú; un módulo apagado o sin permiso no aparece; el portal tiene estructura propia; la consola de plataforma tiene otro color. Los nombres exactos de los grupos los fija el Diseñador en el prototipo (P-014). | v1, Etapa 1 | CA-050b |
| RF-UX-002 | **Inicio por tarjetas:** cada módulo aporta tarjetas; cada rol tiene una principal (Almacén: "Por recibir"; Técnico: "Mi trabajo"; Jefatura TI: "Por aprobar"; Solicitante: "Mis solicitudes"; Administrador: "Resumen de la empresa"; Solo lectura: buscador; Empleado: "Mis equipos"; Plataforma: "Empresas"). Máximo seis visibles. | v1, Etapa 1 | CA-050b |
| RF-UX-003 | Hay una sola bandeja "Mi trabajo" para el Técnico y una sola bandeja "Por aprobar" con pestañas por tipo. El verbo es siempre "Aprobar"; "Publicar" queda para textos. | v1, Etapa 5 | CA-050b |
| RF-UX-004 | **"Pedir ayuda":** un solo botón. En la v1 crea la orden de servicio en estado Creada; en la Fase 2 abre el catálogo de casos y el técnico crea la orden desde el caso. | v1, Etapa 6 | CA-080 |
| RF-UX-005 | **Pantallas sin dueño en el diseño:** Primeros pasos, Módulos activos, Mi cuenta y seguridad, Autorizar soporte, Aviso de privacidad y segunda verificación del primer ingreso, Mis permisos y la consola de plataforma. | v1, Etapa 1 | CA-050b |
| RF-UX-006 | La **ficha del activo** tiene cabecera fija y siete pestañas condicionales (los nombres exactos los fija el Diseñador, P-014). | v1, Etapa 4 | CA-050b |
| RF-UX-007 | **Catálogo de tres mensajes y tres bloqueos:** mensajes "No encontrado", "No tiene permiso", "No se puede por una regla"; bloqueos: botón ausente, botón desactivado con la razón escrita, o mensaje al entrar por dirección directa. | v1, Etapa 1 | CA-048 |
| RF-UX-008 | **Tres formas de dato oculto:** la referencia (`PRS-0042`), el secreto enmascarado y la columna omitida con aviso. | v1, Etapa 1 | CA-011b y CA-042 |
| RF-UX-009 | Un **diálogo de motivo único** para todas las acciones con motivo obligatorio. | v1, Etapa 4 | CA-024 |
| RF-UX-010 | **Siete familias de color**, cada una con texto e icono (no solo color), definidas en la guía visual; etiqueta calculada con borde y reloj para las vigencias. | v1, Etapa 1 | CA-050a |
| RF-UX-011 | Una sola pantalla de Vencimientos, una de "Importar datos", un solo "Mi espacio", y la configuración de avisos solo en Notificaciones. | v1, Etapa 4 | CA-050b |
| RF-UX-012 | Una lista "campo / oficina" para celular: buscar, ficha, entregar y devolver, recibir y capturar series, aprobar, mantenimiento y casos propios se hacen en celular; roles, presupuesto, importación y configuración se editan en pantalla grande. QA prueba a 360 px. | v1, Etapa 4 | CA-050a |

## 21. Reglas de negocio transversales

| ID | Regla | CA |
|---|---|---|
| RN-001 | Todo dato de negocio pertenece a una empresa y toda consulta se filtra por la empresa de la petición. Las únicas tablas sin empresa son una lista global cerrada y corta que mantiene el Arquitecto y revisa Seguridad. Olvidar el filtro es un defecto grave. | CA-001, CA-002, CA-003 |
| RN-002 | Toda acción de permisos se comprueba en el servidor. | CA-011a |
| RN-003 | Las operaciones de varias partes (confirmar una recepción, importar un lote, trasladar stock) son todo o nada. | CA-034, CA-038a, CA-027 |
| RN-004 | Los correlativos (SKU, activo, orden de compra, recepción, orden de servicio, acta) nunca se repiten, aunque dos personas trabajen a la vez. Pueden quedar saltos. | CA-018 |
| RN-005 | La serie es única por empresa y SKU. | CA-023 |
| RN-006 | La auditoría solo se agrega; no se edita ni se borra. | CA-040a |
| RN-007 | Nada con historial se borra: se desactiva, se anula o se da de baja. Solo se borran los borradores que nunca tuvieron efecto. | CA-045 |
| RN-008 | Hay motivo obligatorio en: baja, extravío, reingreso, ajuste de stock, corrección de series y de costo, rechazo, anulación, cierre manual y reversión de recepción. | CA-085 |
| RN-009 | Todo importe se guarda junto a su moneda y como decimal exacto. Nunca hay un total general entre monedas. | CA-072, CA-031, CA-096 y CA-PRE-05 |
| RN-010 | Quien crea o edita una orden no la aprueba; quien aprueba no recibe; quien recibe no creó ni aprobó. La excepción es por empresa (interruptor único) y queda en la auditoría. La autoentrega no tiene excepción. | CA-012, CA-013, CA-014 |
| RN-011 | Para un identificador de otra empresa se responde "no encontrado", igual que para uno que no existe. | CA-001, CA-048 |
| RN-012 | Los códigos, series y correos se comparan sin distinguir mayúsculas ni espacios al inicio o al final. | CA-017, CA-023, CA-005 |
| RN-013 | Las fechas de garantía y vencimiento son de calendario; los momentos exactos se guardan en hora universal. | CA-046, CA-082b |
| RN-014 | Si dos personas editan el mismo registro a la vez, a la segunda se le avisa que cambió y debe revisarlo antes de guardar; no gana el último en silencio (columna de versión en toda entidad editable). | CA-051 |
| RN-015 | Un registro inactivo no se puede usar en registros nuevos, pero sigue visible en los antiguos. | CA-086 |
| RN-016 | Los catálogos, las personas y los usuarios de una empresa no se comparten con otra. | CA-087 |
| RN-017 | **Segunda persona por dinero (regla única).** (1) **Costo comprometido** (D-070.1): es lo que se paga o se compromete a pagar **por el periodo que se confirma**, **con impuesto y en la moneda base**; en otra moneda siempre confirma otra persona. (2) El acto exige a otra persona cuando ese importe **supera estrictamente** el límite de la empresa. (3) Con límite 0, toda orden con al menos una línea pasa por aprobación, **incluida la que tiene todas sus líneas marcadas "sin costo"**. (4) **Un documento sin costo no pasa por la regla de dinero**: no se aprueba por monto (los actos marcados "siempre" en la tabla son otra regla). (5) Una función única `requiereSegundaPersona(acto, monto, moneda)` decide; los módulos citan esta regla y no definen otra. (6) Mientras un costo está "pendiente de confirmación", el registro opera pero su costo no entra al libro de costos. Tabla de actos abajo. | CA-055 |
| RN-018 | Una vigencia ("Vencido") se calcula al leer con la zona de la empresa; el proceso diario solo emite los avisos. | CA-077 y CA-GAR-04a |
| RN-019 | Un campo secreto no aparece nunca en claro fuera de su pantalla de revelación. | CA-042 |
| RN-020 | El responsable de cualquier registro es una Persona (con vínculo opcional a membresía). Los avisos se resuelven Persona, luego membresía, luego correo, y si no hay, al grupo. | CA-088 |
| RN-021 | El costo vive en un solo libro (el del módulo de presupuesto, cuando exista). Regla de fuente única: orden de compra, luego contrato de proveedor, luego registro propio del módulo; el campo común es `fuente_costo`. En la v1 el costo del activo es el de la recepción. | CA-063, CA-072 y CA-PRE-14 |
| RN-022 | Cada empresa se mueve por el mismo contador por empresa y clave; la clave del SKU es su prefijo. | CA-018 |
| RN-023 | **El código del activo `ACTV-NNNNNN` identifica al activo en todo lo que sale de la plataforma sin la serie** (D-079): correos, avisos, mensajes y reportes por correo usan el código del activo en lugar de la serie. El acta imprimible lleva el código del activo y, además, la serie, porque es el documento firmado (RF-INV-016). El prefijo `ACTV` es reservado: ninguna categoría puede usarlo. | CA-094a, CA-094b, CA-094c y CA-046 |
| RN-024 | **Congelación por incidente (D-080).** Mientras una empresa o una Persona tenga una congelación vigente, ninguna rutina de anonimización ni de purga actúa sobre sus datos: lo manual se rechaza y lo automático se omite, y lo omitido se retoma al levantarla. La congelación no suprime ningún derecho: los pedidos se registran y su plazo corre. Solo el Administrador de plataforma la declara y la levanta; un administrador de empresa no. Si el abogado indica cumplir de inmediato un pedido de eliminación, prevalece lo legal para esa Persona (RF-DAT-017). Cada módulo con una rutina de anonimización o de purga consulta esta regla antes de actuar. | CA-095a, CA-095b, CA-095c, CA-095d, CA-095e, CA-095f, CA-095g, CA-095h, CA-095i y CA-095j |

**Tabla de actos de RN-017**

| Acto | Cuándo exige a otra persona |
|---|---|
| Aprobar orden de compra | Supera el límite (o moneda distinta de la base) |
| Activar contrato de proveedor | Supera el límite (valor del periodo contratado) |
| Confirmar contrato de licencia | Supera el límite |
| Alta de dominio, certificado o línea con costo | No hay aprobación; si el costo comprometido supera el límite, otra persona; siempre marca "sin respaldo de compra". Costo comprometido de una línea: cargo mensual con impuesto × meses de permanencia restantes (12 si no hay); de un dominio o certificado: el importe total con impuesto del periodo que se paga de una vez (D-070.2 y .3) |
| Aprobar orden de servicio con costo | Supera el límite |
| Aprobar presupuesto | Siempre |
| Reclasificar costo o registrar gasto manual | Supera el límite; anular un gasto: otra persona |
| Aprobar cambio | Siempre; riesgo Alto: permiso aparte y aprobador distinto del implementador |
| Reaprobar plantilla estándar de cambios | Otra persona |
| Publicar error conocido | Quien no lo redactó |
| Registrar una garantía extendida con costo | No hay aprobación; si el costo comprometido (el precio con impuesto) supera el límite, otra persona con `garantias.confirmar_costo` (PS-231); si no hay orden de compra, marca "sin respaldo de compra" (D-065 S-33, D-070.4) |
| Registrar un mantenimiento con costo sin orden de servicio | Igual que la fila anterior |
| Corregir el costo de un activo | Permiso sensible PS-51, motivo y auditoría; si el nuevo costo, con impuesto y en moneda base, supera el límite, queda "pendiente de confirmación" y lo confirma otra persona con PS-51 (D-065 S-33) |
| Revertir una recepción | Quien la confirmó no la revierte (control "No" de PS-68), salvo la casilla «recepción» |
| Aprobar solicitud de servicio con aprobación | Quien no la pidió |
| Entregar un equipo | La autoentrega está prohibida, sin excepción |

## 22. Criterios de aceptación

Formato: Dado... cuando... entonces... Parten de los criterios de QA ajustados a las decisiones. QA los convierte en pruebas y completa los casos límite en `docs/calidad/` (la lista por etapa de QA está en `docs/calidad/criterios-por-etapa.md`). Cada criterio cita los requisitos que cubre. Un criterio nunca se ejecuta en una etapa anterior a la de lo que necesita (D-076).

### 22.1 Se ejecuta en: Etapa N (D-075, H-QA-21 y H-QA-28)

Cada criterio de esta sección corre en la etapa que indica la tabla. Cuando un criterio dice "completa en", corre desde la primera etapa con lo que ya existe y se completa en la segunda; los que no podían correr en la etapa de su requisito ya están partidos (a, b, c).

| Se ejecuta en | Criterios |
|---|---|
| **Etapa 0** | CA-105 (verificación documental del Excel, la orden de compra y la orden de servicio reales) |
| **Etapa 1** | CA-001 (se completa en Etapa 2), CA-002 a CA-010, CA-011a (se completa en Etapa 2), CA-011b (se completa en Etapa 4), CA-015a, CA-015b, CA-015c, CA-015d, CA-015e, CA-015f, CA-015g, CA-015i, CA-040a, CA-041 (se completa en Etapa 4), CA-045 (se completa en Etapa 5), CA-047, CA-048 (se completa en Etapa 4), CA-049, CA-050a (se completa en Etapa 4), CA-050b (se completa en Etapa 5), CA-051, CA-066, CA-068, CA-069 (se completa en Etapa 4), CA-071 (se completa en Etapa 5), CA-073, CA-074 (se completa en Etapa 5), CA-075, CA-077 (se completa en Fase 2), CA-079, CA-081, CA-082, CA-083, CA-084, CA-085 |
| **Etapa 2** | CA-015h (necesita campos secretos y solicitudes de derechos), CA-016a, CA-017 (se completa en Etapa 3), CA-021, CA-042 (campos secretos; la clave de licencia se completa en Etapa 4), CA-043, CA-052a1, CA-052b1, CA-052c, CA-054a, CA-060a, CA-064a, CA-065a, CA-067, CA-076 (se completa en Fase 2), CA-086, CA-087, CA-088, CA-092, CA-093, CA-095a, CA-095b, CA-095c, CA-095d, CA-095e, CA-095f, CA-095g |
| **Etapa 3** | CA-018 (se completa en Etapa 6 con las órdenes), CA-019, CA-020 (se completa en Etapa 5), CA-022 |
| **Etapa 4** | CA-016b, CA-023, CA-024, CA-025 a CA-028, CA-038a, CA-038b, CA-038c, CA-038d, CA-039, CA-046, CA-052a2, CA-052b2, CA-054b, CA-056, CA-058, CA-059, CA-060b, CA-063, CA-064b, CA-065b, CA-079b, CA-081b, CA-082b, CA-090, CA-091, CA-094a, CA-099, CA-100, CA-101 |
| **Etapa 5** | CA-012, CA-013, CA-014, CA-029 a CA-037, CA-052d, CA-055 (se completa en Etapa 6 con las órdenes de servicio), CA-061, CA-062, CA-070, CA-072, CA-078, CA-089, CA-094b, CA-096, CA-097, CA-098, CA-102, CA-103, CA-104a, CA-104b |
| **Etapa 6** | CA-044 (la parte v1; el vínculo con mantenimiento se completa en Fase 2), CA-080 |
| **Etapa 7** | CA-040b (copia externa), CA-053, CA-054c, CA-095h, CA-095i |
| **Fase 2** | CA-094c (con los avisos de garantía), CA-095j (al activar cada módulo con rutinas de anonimización o purga) |
| **Fase 3** | CA-057 |

**Aislamiento y accesos**

- **CA-001 · No se lee lo de otra empresa** (RN-001, RS-10, RS-13, RF-AUD-012, RF-PER-008, RF-CAT-003). Dado que existen la empresa A y la B, y B tiene un SKU, un activo y una orden con identificador conocido, cuando un usuario de A los pide por listado, por búsqueda y escribiendo el identificador de B, entonces no aparece ninguno y el acceso directo responde "no encontrado", el mismo mensaje que para un identificador inexistente. La prueba usa el identificador interno, no un número que también exista en A.
- **CA-002 · No se modifica lo de otra empresa** (RN-001, RF-AUD-010). Dado un Administrador de A y una orden pendiente de B, cuando intenta aprobarla, editarla o anularla (por pantalla o por petición directa), entonces se rechaza, la orden de B no cambia y el intento queda en los eventos de seguridad de A.
- **CA-003 · No se mezclan referencias** (RS-11). Dado un proveedor de la empresa B, cuando un usuario de A crea una orden que apunta a él, entonces se rechaza aunque conozca su identificador.
- **CA-004 · Cambio de empresa** (RF-ACC-011, RF-ACC-012, RF-DAT-009). Dado un usuario que pertenece a A y B y tiene una lista de A en pantalla, cuando navega a B, entonces ninguna pantalla muestra datos de A, el cambio queda en la auditoría y el administrador de B no ve a qué otras empresas pertenece.
- **CA-005 · Invitación** (RF-ACC-003, 007, 009, 010). Dado un administrador que invita a `Ana@x.com`, cuando se usa la invitación una segunda vez, o a los 8 días, o desde otro correo, entonces se rechaza; si `ana@x.com` ya tiene cuenta, la empresa se suma a la misma cuenta solo cuando abre y acepta; el texto de la invitación no dice si el correo tenía cuenta.
- **CA-006 · Sin registro abierto ni filtración** (RF-ACC-001, 004, 005, 017). Dado un correo sin invitación, cuando intenta entrar, entonces no se crea cuenta ni empresa, no se le envía nada (el correo de captura de pruebas queda vacío) y el mensaje es idéntico, carácter por carácter, exista o no el correo. **Tiempo de respuesta:** dados 200 intentos con un correo que sí tiene cuenta y 200 con un correo que no existe, hechos en las mismas condiciones del entorno de pruebas, entonces la diferencia entre ambos grupos es menor a 100 ms en el percentil 95. **Esperas:** con el reloj fijado a las 10:00:00, tras 5 intentos fallidos seguidos un nuevo intento a las 10:00:59 se rechaza y a las 10:01:00 se acepta (espera de 1 minuto); si ese intento falla, la espera siguiente es de 2 minutos, luego de 5 y luego de 15.
- **CA-007 · Segunda verificación** (RF-ACC-013, 024, RF-PLA-001). Dado un usuario con **cualquier permiso sensible** del registro (52 permisos; por ejemplo un Administrador o una Jefatura TI que aprueba órdenes), sin segunda verificación configurada, cuando abre el enlace de acceso, entonces debe configurarla antes de usar la plataforma; un Solicitante sin permisos sensibles puede entrar sin ella; una acción con reautenticación pide un enlace o factor nuevo si pasaron más de 10 minutos; el Administrador de plataforma además usa llave de seguridad física.
- **CA-008 · Baja y suspensión cortan sesiones** (RF-ACC-015, 016, RF-USR-003, RF-ROL-011). Dado un usuario con la sesión abierta, cuando el administrador lo suspende o lo da de baja, entonces su siguiente acción es rechazada al instante; si le cambian el rol, el nuevo rol vale en su siguiente acción.
- **CA-009 · Último administrador** (RF-ROL-008, RF-ACC-020). Dado una empresa con un solo administrador activo, cuando alguien intenta suspenderlo, darlo de baja, o cambiarle el rol (incluido él mismo), entonces el sistema lo impide; al crear una empresa con un solo administrador, el sistema avisa que se recomiendan al menos dos (RF-ACC-020).
- **CA-010 · Sin autoescalada** (RF-ROL-007, RF-ACC-008). Dado un usuario con permiso de administrar roles, cuando intenta darse un permiso que no tiene, crear un rol con más permisos que el suyo o invitar con un rol mayor, entonces se rechaza.
- **CA-011a · Permiso comprobado en el servidor** (RF-ROL-004, 010, 014). Dado un Técnico (sin permiso de aprobar) y una orden pendiente creada por otra persona, cuando intenta aprobarla con el botón (que no debe verse) o por petición directa, entonces el servidor la rechaza, la orden sigue Pendiente y el intento queda en los eventos de seguridad; y una prueba recorre todas las celdas del registro de permisos con una petición directa por celda.
- **CA-011b · Permisos sensibles y datos ocultos** (RF-ROL-003, 005, PER-009, IMP-013, AUD-007, INV-032). Dado un rol "Solo lectura", cuando abre una orden o un activo asignado, entonces no ve precios ni nombres (ve la referencia `PRS-0042`); un Almacén tampoco ve nombres; un rol con alcance "propio" sin Persona vinculada ve una lista vacía; un usuario con un permiso sensible (los 52 marcados en el registro, que ahora incluyen las aprobaciones de dinero, `empresa.configurar_aprobacion` y `recepciones.revertir`) debe tener la segunda verificación; cambiar el monto límite avisa por correo a todos los administradores; la matriz de pruebas se regenera desde el registro.
- **CA-012 · Quien crea o edita no aprueba** (RF-OC-021, 022, 025, RF-ROL-009). Dado un usuario con permiso de aprobar que creó o editó una orden desde la última aprobación, cuando intenta aprobarla o rechazarla, entonces el servidor lo rechaza, incluso si es Administrador.
- **CA-013 · Quien recibe no creó ni aprobó** (RF-OC-023, 024). Dado una orden que aprobó el usuario X, cuando X intenta recibir esa mercadería, o quien la creó intenta recibirla, entonces se rechaza.
- **CA-014 · Excepción auditada** (RF-OC-026). Dado una empresa de una sola persona de TI donde el Administrador activó la casilla de compras, cuando esa persona aprueba su propia orden, entonces se acepta, la orden muestra un aviso visible y la auditoría registra quién, cuándo, monto y orden; con la casilla apagada o vencida (más de 90 días) se rechaza.
- **CA-015a · Plataforma no ve el negocio** (RF-PLA-004, 006). Dado un Administrador de plataforma, cuando intenta ver activos o compras de una empresa sin autorización, entonces no puede, porque el rol de base de datos que usa solo ve tablas globales.
- **CA-015b · Soporte autorizado** (RF-PLA-005, RF-AUD-017). Dado una empresa que autorizó soporte, cuando el Administrador de plataforma entra, entonces la sesión es de solo lectura, de máximo 24 horas, con banner, y cada cosa que vio queda en la auditoría de la propia empresa.
- **CA-015c · Rescate con control dual** (RF-PLA-003, RF-ACC-019). Dado una empresa sin administrador, cuando se pide el rescate, entonces lo hacen dos personas de plataforma (o una más el contacto autorizado confirmado), hay espera de 24 horas salvo emergencia declarada por ambas, se avisa por correo a todos los administradores y queda la evidencia.
- **CA-015e · Contacto autorizado y veto** (RF-PLA-011, 012). Dado una empresa recién creada, cuando el primer administrador acepta la invitación, entonces debe confirmar el contacto autorizado registrado por la plataforma; cambiarlo exige a un administrador de la empresa, espera de 24 horas y aviso por correo a todos los administradores; durante la espera de 24 horas de un rescate, un administrador activo lo veta y el rescate se detiene y queda en el registro de plataforma.
- **CA-015f · Acceso de emergencia** (RF-PLA-001, 009). Dado que el correo falla, cuando el Administrador de plataforma emite un acceso excepcional a un administrador de empresa, entonces exige a una segunda persona de plataforma o al contacto autorizado confirmado, avisa a todos los administradores de la empresa, vale una sola vez, exige la segunda verificación y se rechaza un segundo uso en la misma semana para esa empresa; con una sola persona de plataforma y datos reales, la empresa no puede cargarse (mínimo dos antes de datos reales).
- **CA-015d · Alta, suspensión y reactivación de empresas** (RF-ACC-002, 022, RF-PLA-002). Dado el Administrador de plataforma, cuando crea una empresa, entonces define país, zona horaria, moneda base y contacto autorizado e invita al primer administrador; una empresa suspendida no deja entrar a nadie y conserva sus datos.
- **CA-047 · Roles plantilla** (RF-ROL-001, 002, 006, 012, RF-USR-001). Dado la empresa A que editó su rol Técnico, cuando se crea la empresa B, entonces B tiene el Técnico original; un rol nuevo no tiene ningún permiso; un rol con usuarios asignados no se puede eliminar.
- **CA-049 · Aviso de privacidad** (RF-ACC-023, RF-DAT-014). Dado un usuario en su primer ingreso, cuando no acepta el aviso, entonces no puede usar la plataforma; al aceptar quedan registradas la versión y la fecha; si la versión cambia, se pide de nuevo; el aviso que ve el usuario (y el que se imprime en el acta) incluye siempre la declaración de texto libre no anonimizable, aunque la empresa edite el resto del texto.
- **CA-068 · Enlace atado al navegador** (RF-ACC-006, 026). Dado un correo con filtro que abre el enlace de ingreso, cuando el dueño lo abre en su navegador, entonces el filtro no lo gastó: el enlace pide el botón "Entrar" y funciona solo en el navegador que lo pidió; el enlace vence a los 15 minutos (a los 15:01 se rechaza) y sirve una sola vez (el segundo uso se rechaza). **Otro dispositivo (D-073.4):** si quien lo pidió en el computador lo abre desde el correo en el celular, el navegador de origen muestra un **código corto de 8 caracteres** que se escribe en el otro dispositivo; si no, pide un enlace nuevo en el mismo.
- **CA-069 · Sesión y borradores** (RF-ACC-014, RNF-013). Dado un usuario con una recepción a medias, cuando la sesión llega a los 25 minutos, entonces se avisa y se ofrece seguir; a los 30 minutos sin actividad (o a las 12 horas en total) la sesión vence y la siguiente acción se rechaza; el borrador automático conserva lo capturado.
- **CA-079 · Dos pestañas, dos empresas** (RF-ACC-012). Dado un usuario con dos pestañas en empresas distintas, cuando guarda en una, entonces se guarda en la empresa de esa dirección, nunca en la otra.
- **CA-081 · Segunda verificación por permiso** (RF-ACC-013). Dado un rol personalizado "Contador" con `datos.exportar`, cuando un usuario con ese rol entra, entonces se le exige la segunda verificación aunque no se llame Administrador.
- **CA-082 · Códigos de recuperación** (RF-ACC-018). Dado un administrador que perdió su factor, cuando usa un código de recuperación, entonces entra una vez con ese código y no puede reutilizarlo; la reposición la hace otro administrador.

**Códigos, campos y artículos**

- **CA-016a · Personas (alta)** (RF-PER-001 a 003, RF-DAT-001, RF-CAT-024). Dado un técnico que registra a un empleado sin cuenta, cuando crea la Persona, entonces basta nombre y área; recibe la referencia `PRS-NNNN`; no se pide documento, dirección ni teléfono; un centro de costo puede tener una Persona responsable.
- **CA-016b · Personas (entrega)** (RF-PER-001, RF-INV-013). Dado un técnico que entrega una laptop a esa Persona sin cuenta, cuando registra la entrega, entonces la entrega se acepta a nombre de la Persona sin invitarla a la plataforma.
- **CA-017 · Código único por empresa** (RF-SKU-001, 002, RF-CAT-007 a 009, 023, 025). Dado que A ya tiene `LAP-0001`, cuando A intenta otro `lap-0001` o `LAP-0001 ` y B crea `LAP-0001`, entonces A recibe "ese código ya existe" y B lo acepta; un prefijo reservado como `OC` se rechaza.
- **CA-018 · Correlativo con muchas personas a la vez** (RN-004, RF-SKU-003, 004, RF-OC-003, 046, RF-OS-005). Dado que `LAP` está en `LAP-0010`, cuando 20 usuarios crean un SKU al mismo tiempo, entonces se crean 20 SKU con 20 códigos distintos, todos mayores que `LAP-0010`. Los saltos son aceptables; las repeticiones, nunca. Lo mismo para las órdenes.
- **CA-019 · Código escrito a mano** (RF-SKU-005, 006, RF-CAT-011). Dado que `LAP` está en `LAP-0010`, cuando un usuario con permiso crea `LAP-0011` a mano y otro crea uno automático, entonces el automático recibe `LAP-0012`; repetir `LAP-0011` se rechaza; sin el permiso no se puede escribir código ni por petición directa; un SKU con movimientos no admite cambiar su código.
- **CA-020 · Campos personalizados** (RF-CAT-002, 010, 012 a 016, 022, RF-SKU-013, 015, 016, RF-OC-039). Dado un campo obligatorio de tipo número en Laptops, cuando se guarda un SKU con el campo vacío, con texto "abc" o con una opción de lista que no existe, entonces se rechaza con un mensaje por campo y no se guarda nada; un IMEI se pide por cada unidad, no por SKU.
- **CA-021 · Cambios de campos con datos** (RF-CAT-017 a 021). Dado un campo con datos, cuando se intenta borrarlo, cambiarle el tipo o quitar una opción en uso, entonces no se permite (se desactiva); si se vuelve obligatorio, los registros existentes quedan "pendiente de completar".
- **CA-022 · Modo de control inmutable** (RF-SKU-007, 008). Dado un SKU con activos o stock, cuando se intenta cambiar su modo de control o su categoría, entonces se rechaza; sin existencias, se permite.
- **CA-064a · Naturaleza (categoría)** (RF-CAT-027). Dado una categoría de naturaleza "licencia", cuando se crea y luego se intenta cambiar su naturaleza con existencias, entonces se rechaza; sin existencias se permite; las subcategorías heredan la naturaleza.
- **CA-064b · Naturaleza (unidad)** (RF-CAT-027, RF-SKU-013). Dado una unidad de una categoría de naturaleza "licencia", cuando se crea, entonces no recibe garantía, mantenimiento ni depreciación y no cuenta como activo vigente de equipo físico.
- **CA-065a · Campo identificador (definición)** (RF-CAT-012). Dado un campo de texto marcado identificador con largo exacto 15, cuando se guarda un valor de 14 dígitos, entonces se rechaza; el valor se normaliza sin espacios ni distinción de mayúsculas.
- **CA-065b · Campo identificador (unidades)** (RF-CAT-012, 029). Dado un campo IMEI marcado identificador, cuando se registran dos unidades con el mismo IMEI (con espacios o letras en distinta caja), entonces la segunda se rechaza por la restricción de la base de datos, aunque la petición llegue por una ruta distinta.
- **CA-042 · Campo secreto y clave de licencia** (RF-CAT-028, RF-SKU-013, 014, RF-AUD-006). Dado una clave de licencia, cuando se busca, se ve el historial, se exporta, se importa o se consulta la auditoría, entonces nunca aparece (ni enmascarada en exportaciones); verla completa exige el permiso aparte y reautenticación, queda en la auditoría sin el valor, tiene tope de 20 por hora y se oculta a los 30 segundos.

**Inventario**

- **CA-023 · Serie duplicada** (RF-INV-002, 003, 006, RF-SKU-009). Dado un SKU con serie y un activo con serie `SN-100`, cuando se registra `sn-100` o ` SN-100 ` en el mismo SKU, entonces se rechaza siempre; en otro SKU de la misma empresa se acepta con un aviso visible que dice dónde está; en otra empresa, sin aviso.
- **CA-024 · Estados y motivos** (RF-INV-001, 011, 018, 031, RF-UX-009, RF-OC-028). Dado un activo De baja, cuando alguien intenta asignarlo o pasarlo a En reparación, entonces se rechaza; una baja o un extravío sin motivo se rechazan; solo un reingreso con motivo y permiso lo devuelve a En stock.
- **CA-058 · Tabla de 25 combinaciones** (RF-INV-009, 010, 024, 028). Dado cada una de las 25 combinaciones de estado de la tabla de la sección 11.2, cuando se intenta, entonces las permitidas se aplican y las prohibidas se rechazan con el motivo, tanto por pantalla como por petición directa; un activo En stock con responsable, o Asignado sin responsable, es imposible aunque se fuerce desde la base.
- **CA-025 · Asignación única** (RF-INV-013 a 015, 024). Dado un activo En stock, cuando dos técnicos lo asignan a la vez a personas distintas, entonces solo una asignación se acepta y la otra recibe un aviso; la devolución queda en el historial con fecha y estado; un activo En reparación que conservó su asignación vuelve a Asignado al mismo responsable.
- **CA-026 · Stock no negativo** (RF-INV-019 a 021). Dado un stock de 3 mouses, cuando se intenta sacar 5, o dos personas sacan 2 a la vez, entonces nunca queda un saldo negativo; las correcciones se hacen con ajuste con motivo.
- **CA-027 · Traslado** (RF-INV-022). Dado un stock en la bodega A, cuando se traslada 10 a la bodega B, entonces sale de A y entra a B en el mismo acto; un traslado a la misma ubicación se rechaza.
- **CA-028 · Reingreso** (RF-INV-004). Dado un activo De baja con serie `SN-100`, cuando vuelve de una reparación externa, entonces se reactiva el mismo registro con un movimiento "reingreso" y motivo; nunca se crea un segundo registro con esa serie.
- **CA-059 · Ingreso manual** (RF-INV-025). Dado un técnico con permiso, cuando registra una laptop recibida por reemplazo de garantía, entonces el activo nace con serie única, motivo, costo opcional, historial y auditoría; sin permiso no puede, ni por petición directa.
- **CA-060a · Ubicaciones jerárquicas** (RF-CAT-006). Dado una Sala bajo un Piso bajo una Sede, cuando se intenta crear un cuarto nivel o repetir un nombre bajo el mismo superior, entonces se rechaza; mover una Sala a otro Piso no escribe movimientos por activo.
- **CA-060b · Cambio de ubicación** (RF-INV-027). Dado un activo En stock en la Sala 2, cuando se cambia de ubicación, entonces queda un movimiento "cambio de ubicación" con la ruta en texto y el estado no cambia.
- **CA-063 · Corregir el costo** (RF-INV-026). Dado un activo importado sin costo, cuando alguien con `activos.corregir_costo` lo corrige con motivo, entonces el historial guarda el valor anterior y el nuevo y queda en la auditoría; sin el permiso se rechaza.
- **CA-046 · Constancia de entrega** (RF-INV-016, 017, RF-DAT-006, RNF-002). Dado un activo asignado a una Persona, cuando el técnico pide el acta, entonces se genera un PDF `ACT-E-000123` con activo (código `ACTV-NNNNNN`), serie, persona, fecha, estado de entrega y quién entrega; sin `datos_personales.ver` el PDF muestra la referencia y omite nombre y área; la fecha de garantía que cae hoy se evalúa según la zona horaria de la empresa.
- **CA-079b · Autoentrega** (RF-INV-030). Dado el Administrador con una Persona vinculada, cuando intenta entregarse un equipo a sí mismo, entonces se rechaza, aunque la casilla de excepciones esté activa.
- **CA-081b · Pendiente de devolución** (RF-PER-006, RF-INV-029). Dado una Persona cesada con un equipo sin devolver, cuando se la cesa, entonces el cese se acepta, el activo sigue Asignado con la marca "pendiente de devolución", no aparece como extraviado en reportes y el sistema bloquea anonimizarla hasta cerrar el caso.
- **CA-082b · Garantía** (RF-INV-008). Dado un activo comprado el 15/01/2026 con 24 meses de garantía, cuando se guarda, entonces el fin de garantía es 14/01/2028 (último día cubierto) según la zona de la empresa; 15/03/2024 con 36 meses da 14/03/2027; 31/01 con 1 mes da 28/02 en un año no bisiesto; con el fin directo no se pide meses; un activo de naturaleza licencia no tiene garantía.

**Compras y recepción**

- **CA-029 · Rechazo y corrección** (RF-OC-001, 011). Dado una orden Pendiente creada por un Solicitante, cuando un aprobador la rechaza sin motivo, entonces se rechaza la acción; con motivo, la orden queda Rechazada con el motivo visible, y al corregirla vuelve a Pendiente de aprobación con el historial del rechazo.
- **CA-030 · Editar una orden aprobada** (RF-OC-010, 014, 044). Dado una orden Aprobada, cuando alguien cambia el precio, la cantidad o el proveedor, entonces vuelve a Pendiente de aprobación, el número de versión sube, la aprobación anterior se anula y quien la editó no puede reaprobarla.
- **CA-031 · Aprobación por monto y moneda** (RF-OC-005, 015, 018 a 020). Dado un límite de 5.000 en la moneda base, cuando se crea una orden de 3.000, entonces pasa a Aprobada sin pedir aprobación; una de 8.000 queda Pendiente; una de cualquier monto en otra moneda queda Pendiente; con la aprobación desactivada ninguna queda Pendiente.
- **CA-055 · Borde exacto del límite** (RF-OC-015, 016, 017, 047, 048, RF-OS-008). Dado un límite de 5.000,00 en la moneda base, cuando una orden suma exactamente 5.000,00 con impuesto, entonces **no supera** el límite y pasa sin aprobación; con 5.000,01 queda Pendiente; con límite 0 toda orden con al menos una línea queda Pendiente, **incluida una orden con todas sus líneas marcadas "sin costo"**; un documento sin costo no pasa por la regla de dinero; la misma regla vale para una orden de servicio con costo.
- **CA-032 · Datos de la orden** (RF-OC-002, 004 a 008, 042, 043, RF-SKU-010, 011, RF-CAT-005, RF-INV-023). Dado el formulario de orden, cuando se intenta guardar sin líneas, con cantidad 0 o negativa, con precio negativo, con el mismo SKU en dos líneas, con un SKU o proveedor inactivo, o con decimales en un SKU que no los admite, entonces se rechaza con mensaje por campo; una orden con una línea sin precio no sale de Borrador (con la marca "sin costo" y motivo, sí).
- **CA-072 · Redondeo** (RF-OC-006, 045). Dado los cuatro ejemplos de RF-OC-045, cuando se calculan, entonces dan exactamente 36,58; 10,20; 1.098 y 15,02 (el impuesto se calcula sobre el subtotal ya redondeado), el total de la orden es la suma de las líneas guardada, y el costo del activo guarda el subtotal sin impuesto dividido por la cantidad con 4 decimales.
- **CA-033 · Recepción parcial y luego total** (RF-OC-029, 035, 036, 040). Dado una orden Emitida de 10 unidades de un SKU con serie, cuando se reciben 4 con 4 series y después las 6 restantes, entonces tras la primera hay 4 activos nuevos y la orden queda Recibida parcial con 6 pendientes; tras la segunda hay 10 activos sin duplicados y la orden pasa a Recibida total y a Cerrada, con los dos cambios en el historial.
- **CA-034 · Recepción inválida: nada a medias** (RF-OC-030, 031, 033, 037, 038, RNF-005). Dado la misma orden con 4 recibidas, cuando se intenta recibir 7, o confirmar 4 con una lista de 3 series, o 4 series de las cuales una ya existe en el SKU, entonces la recepción completa se rechaza con un mensaje que dice el problema, no se crea ningún activo y los pendientes siguen en 6; con series incompletas se guarda como borrador.
- **CA-035 · Doble clic y simultaneidad** (RF-OC-033, 034). Dado una recepción lista, cuando se hace doble clic en Confirmar o dos personas confirman recepciones de la misma orden a la vez, entonces los activos se crean una sola vez y nunca se supera lo pendiente.
- **CA-061 · Borrador, tope y orden con recepción** (RF-OC-010, 049, 050, RF-SKU-010). Dado un borrador de recepción de 7 días, cuando otra persona con permiso lo retoma y confirma, entonces se valida contra lo pendiente de ese momento; el borrador no reservó cantidad; más de 1.000 series se rechaza; una orden con recepción confirmada no cambia cantidad, precio ni proveedor; si el SKU o el proveedor se desactivó después de emitir, se puede recibir con aviso.
- **CA-036 · Corrección de recepciones y series** (RF-OC-032, RF-INV-007). Dado una recepción confirmada por error con activos sin asignar, cuando se revierte con motivo, entonces los activos se anulan con movimiento contrario y la orden vuelve al estado que corresponde; con un activo ya asignado la reversión se rechaza y se corrige con baja y nueva entrada; corregir una serie exige motivo y guarda el valor anterior.
- **CA-062 · Reversión por cantidad y orden cerrada** (RF-OC-032). Dado un ingreso por cantidad cuya reversión dejaría un saldo negativo, cuando se intenta revertir, entonces se rechaza y se corrige con ajuste; revertir la recepción de una orden cerrada a mano la reabre a Recibida parcial y anula el cierre.
- **CA-037 · Anulación y cierre manual** (RF-OC-012, 013). Dado una orden con una recepción parcial, cuando se intenta anular, entonces se rechaza; con permiso y motivo se cierra; antes de la primera recepción sí se puede anular con motivo.
- **CA-070 · Interruptor único** (RF-OC-026, RF-PLA-008). Dado las ocho casillas apagadas por defecto, cuando se intenta cada violación por la API, entonces se rechaza; con una casilla activa se acepta con aviso y auditoría; con la casilla vencida a los 90 días se rechaza; el Administrador de plataforma no puede activarla por la empresa; con dos o más administradores, activar una casilla queda "pendiente" hasta que **un segundo administrador la confirma**; cada mes llega a los administradores un **resumen de usos** de las excepciones; la autoentrega, la anonimización y el rescate no tienen casilla y se rechazan siempre.

**Importación, exportación, auditoría y datos**

- **CA-038 · Importación todo o nada** (RF-IMP-001 a 010, RF-INV-005). Dado un archivo de 100 filas con 3 inválidas, cuando se sube, entonces la vista previa muestra por cada fila inválida el número de fila, la columna y el motivo; nada se guarda hasta confirmar; mientras haya errores no se puede confirmar; tras corregir y subir otro archivo se cargan las 100 filas; el lote se puede deshacer (anular) mientras ninguna fila tenga movimientos posteriores; una serie como 3,5E+14 se marca dañada.
- **CA-056 · Archivo ya importado** (RF-IMP-004, 005, RF-DAT-004). Dado un archivo ya confirmado, cuando se vuelve a subir idéntico, entonces se rechaza entero con la fecha y el número de lote; un archivo corregido con una fila cuya clave natural ya existe marca esa fila como error "ya existe".
- **CA-039 · Importación segura** (RF-IMP-011, 014, 015, RS-42). Dado un archivo, cuando es de otro tipo, supera 5.000 filas o 10 MB, trae una celda de texto que empieza con `=`, una columna de empresa o un texto con código, entonces se rechaza o se trata como texto, la empresa sale de la sesión y el texto se muestra como texto.
- **CA-043 · Exportación** (RF-EXP-005, 006, 007, RNF-006). Dado un rol sin permiso de exportar, cuando intenta exportar por el botón o por petición directa, entonces se rechaza (el botón se ve desactivado con la razón); con permiso se exporta y queda en la auditoría; las celdas de texto con `=` se exportan como texto.
- **CA-067 · Puerta de exportación** (RF-EXP-001 a 004, RF-PLA-010). Dado un Administrador, cuando exporta 50.001 filas, o supera 10 exportaciones por hora, entonces se rechaza; al exportar se pide motivo, se muestran las columnas sensibles, las de precios y de datos personales se omiten según permisos, el archivo trae la hoja "Aviso" y la auditoría registra filas y columnas sensibles sin el contenido; más de 5 por hora dispara una alerta.
- **CA-040 · Auditoría inalterable** (RF-AUD-001, 002, 018, RF-DAT-002). Se divide en dos porque cada parte corre en una etapa distinta (D-075).
  - **CA-040a · Auditoría inalterable y atómica** (RF-AUD-001, 002, RN-006; Etapa 1). Dado un Administrador, cuando intenta editar o borrar una entrada de auditoría por pantalla o petición directa, entonces es imposible; si falla un cambio, no queda una entrada de un cambio que no ocurrió, y si el cambio ocurre, su entrada existe.
  - **CA-040b · Copia externa y plazo de la auditoría** (RF-AUD-018, RF-DAT-002; Etapa 7). Dado un archivo de la copia externa alterado en pruebas (con el ensayo de manipulación de DevOps), cuando corre la verificación, entonces da alarma; un intento de borrar un archivo de la copia se rechaza; y las entradas de auditoría no se purgan antes de 5 años (plazo propuesto hasta que legal lo confirme, L-04).
- **CA-041 · Qué se audita** (RF-AUD-003 a 005, 008, 009, 013, 019, RF-USR-007, RF-ROL-013, RF-PLA-007). Dado un conjunto de acciones (alta de usuario, cambio de rol, aprobación, baja de activo, importación, exportación, cambio de empresa, consulta a la auditoría, lectura de 5.000 filas, acción de una regla automática), cuando se ejecutan, entonces cada una deja una entrada con quién, cuándo, empresa, tipo de autor (membresía, integración o sistema), qué cambió y motivo si aplica.
- **CA-066 · Eventos de seguridad aparte** (RF-AUD-010). Dado un intento rechazado por empresa ajena, cuando la acción falla, entonces el evento queda en el registro de seguridad en una transacción independiente (el rechazo no lo revierte), con la empresa del actor, sin datos del objeto.
- **CA-045 · Nada con historial se borra** (RF-AUD-011, RN-007, RF-USR-002, RF-CAT-004). Dado un SKU, activo, orden, recepción, persona, usuario o valor de catálogo con historial, cuando se intenta eliminar, entonces solo se permite desactivar, anular o dar de baja con motivo; un borrador que nunca tuvo efecto sí se puede borrar.
- **CA-052a1 · Cese de una Persona (Etapa 2)** (RF-PER-005, 011). Dado una Persona sin recursos, cuando se la cesa con un motivo de la lista (salida, fin de contrato, traslado, otro; sin texto libre), entonces queda Cesada; si tiene un Usuario vinculado, quien cesa necesita además `usuarios.suspender` y el Usuario se suspende en el mismo acto; sin ese permiso el cese se rechaza y nada cambia.
- **CA-052a2 · El cese nunca se bloquea por recursos (Etapa 4)** (RF-PER-006). Dado una Persona con un activo asignado (y, cuando esos módulos estén activos, una línea y un dominio a su cargo), cuando se la cesa, entonces el cese se acepta, se genera la lista de pendientes en su ficha, una tarea de salida y un aviso a Jefatura TI, y el activo sigue Asignado con la marca "pendiente de devolución".
- **CA-052b1 · Anonimizar manual (Etapa 2)** (RF-PER-013). Dado una Persona cesada sin pendientes, cuando se la anonimiza a mano por un pedido de derechos documentado, entonces la anonimización exige dos personas (una propone, otra ejecuta) y una vista previa; sin pedido documentado se rechaza.
- **CA-052b2 · Anonimizar se bloquea con pendientes (Etapa 4)** (RF-PER-006, 013). Dado una Persona cesada con pendientes sin cerrar, cuando se intenta anonimizarla, entonces se rechaza; solo se puede tras cerrarlos (devolución, extravío o baja con motivo).
- **CA-052c · Baja de usuario siempre permitida** (RF-USR-001, 003, 008). Dado un usuario cuya Persona tiene activos asignados, cuando el administrador lo da de baja, entonces se acepta y sus sesiones se cortan al instante; los activos siguen a nombre de la Persona.
- **CA-052d · Órdenes abiertas** (RF-USR-005, RF-PER-007). Dado un usuario o Persona con órdenes abiertas, cuando se da de baja o se cesa, entonces el sistema pide reasignarlas o cancelarlas con motivo.
- **CA-054a · Anonimizar sin tocar la auditoría (Etapa 2)** (RF-AUD-014, 015, RF-PER-004, 013, 014, RF-DAT-016). Dado una Persona con cambios en la auditoría, cuando se la anonimiza, entonces su registro muestra "Persona anonimizada 0042", la auditoría sigue completa y sin nombres ni correos (los cambios de campos personales registran qué campo cambió, no su valor), la anonimización queda como un evento y se anota en el registro de anonimizaciones.
- **CA-054b · El nombre del acta (Etapa 4)** (RF-DAT-006, 011). Dado una Persona anonimizada con un acta de entrega cuya asignación sigue abierta, cuando se imprime el acta, entonces conserva el nombre copiado; con la asignación cerrada, `retener_hasta` = cierre + 5 años y el nombre se limpia solo al vencer esa fecha.
- **CA-054c · Restaurar un respaldo (Etapa 7)** (RF-DAT-003, 005, RF-AUD-016). Dado un respaldo antiguo restaurado, cuando se abre el sistema, entonces nadie anonimizado reaparece (se reaplica el registro de anonimizaciones), y el proceso de mantenimiento separado archiva por partición la auditoría vencida a los 5 años con dos personas y deja constancia.
- **CA-073 · Nombre canario** (RF-DAT-008, 010, RNF-009). Dado un nombre "canario" registrado como Persona, cuando se corren la base, las exportaciones, los correos y los registros técnicos de las pruebas, entonces el nombre solo aparece donde la tabla de la sección 18 lo permite; los errores no muestran datos personales.
- **CA-074 · Correos mínimos** (RF-ACC-021, RF-DAT-012, RF-CAT-026). Dado un aviso de la v1, cuando se envía a una Persona sin Usuario o a una dirección sin verificar, entonces trae solo tipo de aviso, código, fecha y nombre de la empresa, sin serie, IMEI, nombres de terceros, importes ni enlaces de acción; en la v1 solo salen invitación, acceso y aprobación.
- **CA-076 · Solicitudes de derechos invisibles** (RF-PER-012, RF-DAT-007, 013). Dado una solicitud de derechos registrada, cuando se busca, se lista, se exporta, se reporta, se pide por API o se avisa, entonces no aparece por ninguna vía (salvo el estado de su propio pedido para la Persona que lo presentó, por el portal); quien la presentó no puede atenderla; la copia se entrega por una descarga única con vencimiento.
- **CA-075 · Módulos activables** (RF-EMP-005). Dado un módulo apagado, cuando un usuario o la API lo pide, entonces no aparece y la API responde "no encontrado"; al volver a activarlo los datos siguen ahí; un rol personalizado no recibe permisos solo.
- **CA-071 · Moneda y zona horaria** (RF-EMP-001 a 004). Dado una empresa con órdenes abiertas, cuando se intenta cambiar la moneda base, entonces se rechaza; cambiar la zona horaria recalcula los avisos pendientes; el **calendario de empresa** (horario y feriados) lo usan los módulos que lo declaran y un plazo en días corridos no lo usa.
- **CA-077 · Procesos diarios con dos empresas** (RNF-019 a 022, RF-ROL-015). Dado dos empresas con vencimientos, cuando corre el proceso diario con un reloj fijado y se repite, entonces cada aviso queda en su empresa, no se duplica, un día perdido se recupera en orden y una empresa suspendida se salta; una **prueba de dependencias** falla si un módulo importa algo que no sea la interfaz pública de otro o si hay ciclos entre módulos (RF-ROL-015).
- **CA-078 · PDF y texto malicioso** (RF-OC-009, RS-47, RS-42). Dado un texto con código o con una dirección externa en cada campo, cuando se genera el PDF del acta o de la orden, entonces el texto se escapa y no se descarga ningún recurso.

**Servicios, búsqueda y uso**

- **CA-044 · Orden de servicio** (RF-OS-001 a 011, RF-INV-012). Dado un Solicitante, cuando crea una solicitud de trabajo, entonces queda Creada; el técnico la asigna, ejecuta y cierra; una cerrada no se reabre; una abierta se puede cancelar; abrirla no cambia el estado del activo; el costo real y la marca "cubierta por garantía" se guardan.
- **CA-080 · Pedir ayuda** (RF-UX-004). Dado un usuario en la v1, cuando pulsa "Pedir ayuda", entonces se crea una orden de servicio en estado Creada; con la mesa de ayuda activa se abre el catálogo de casos y el técnico crea la orden desde el caso.
- **CA-048 · Búsqueda y "no encontrado"** (RNF-007, RF-CAT-001, RF-SKU-012, RF-UX-007). Dado un usuario de la empresa A, cuando usa el buscador global, entonces solo encuentra lo de A y lo que su rol permite ver, agrupado por tipo; para algo de B responde "no encontrado".
- **CA-050a · Accesibilidad medible** (RNF-003, 004, RF-UX-010, 012). Dado cada pantalla de las prioridad A, cuando se prueba a 360 px, solo por teclado y con un medidor de contraste, entonces no hay desplazamiento horizontal, todo se alcanza con teclado, el contraste cumple AA, los objetivos táctiles miden 44 px y los estados llevan texto.
- **CA-050b · Inicio por rol y navegación** (RNF-001, 008, RF-UX-001 a 003, 005, 006, 011, RF-ACC-025). Dado un usuario de cada uno de los ocho perfiles, cuando entra, entonces ve su inicio de tarjetas en español, con a lo sumo seis, un menú sin módulos apagados ni permisos que no tiene, y las pantallas de Primeros pasos, Mi cuenta y seguridad y Mis permisos.
- **CA-051 · Edición simultánea** (RN-014). Dado dos usuarios que abren el mismo registro, cuando ambos guardan cambios, entonces al segundo se le avisa que el registro cambió y no se pisa en silencio el cambio del primero.
- **CA-057 · Aislamiento entre Personas del portal** (RF-IMP-018, RF-ROL-002; Fase 3). Dado dos Personas de la misma empresa con la plantilla Empleado (portal), cuando una pide los datos de la otra por listado, búsqueda o identificador, entonces responde "no encontrado"; las invitaciones masivas van por persona.
- **CA-053 · Calidad y continuidad** (RNF-010 a 018, RF-DAT-015). Dado una etapa que pasa a uso real, cuando se prepara la liberación, entonces existe un respaldo del día, una restauración probada con cronómetro sin mezclar empresas (reaplicando anonimizaciones, revocando sesiones y reaplicando bajas posteriores), un plan de vuelta atrás ensayado, los manuales de la etapa, la medición de rendimiento contra RNF-011 y el procedimiento de incidente en borrador.

**Criterios añadidos en la v1.0 (D-075, D-076)**

- **CA-083 · Solo huella** (RS-51). Dado una base con enlaces de ingreso, invitaciones, sesiones, códigos de recuperación y enlaces de descarga recién creados, cuando la prueba de integración continua recorre la base, entonces ningún valor guardado sirve directamente para entrar (todos son huellas irreversibles) y el valor en claro solo existe en el correo o la pantalla de su dueño.
- **CA-084 · Topes subidos por plataforma** (RF-PLA-010). Dado un administrador de plataforma que sube a una empresa el tope de invitaciones para una campaña, cuando pasa el periodo fijado, entonces el tope vuelve al valor por defecto solo; el aumento queda en el registro de plataforma.
- **CA-085 · Motivo obligatorio** (RN-008). Dado cada acción que exige motivo (baja, extravío, reingreso, ajuste de stock, corrección de serie, corrección de costo, rechazo, anulación, cierre manual, reversión de recepción), cuando se intenta sin motivo o con un motivo de más de 500 caracteres, entonces se rechaza con un mensaje; con motivo se acepta y el motivo queda en el historial y en la auditoría.
- **CA-086 · Registro inactivo** (RN-015). Dado un valor de catálogo, SKU o proveedor desactivado, cuando se intenta elegir en un registro nuevo, entonces no aparece ni se acepta por petición directa; en los registros antiguos sigue visible.
- **CA-087 · Catálogos no compartidos** (RN-016, RF-CAT-003). Dado la marca "Dell" en la empresa A, cuando la empresa B la desactiva o la renombra, entonces A no se entera; las listas, las Personas y los usuarios de una empresa no aparecen en la otra.
- **CA-088 · Responsable y destinatario** (RN-020). Dado un centro de costo con una Persona responsable cesada, cuando se genera un aviso, entonces el destinatario se resuelve Persona, luego membresía, luego correo, y si no hay ninguno, al grupo de administradores.
- **CA-089 · Cambiar el monto límite** (RF-OC-019, PS-232). Dado un usuario con `empresa.configurar_aprobacion`, cuando cambia el monto límite, la moneda base o desactiva la aprobación, entonces se pide reautenticación reciente y segunda verificación, queda en la auditoría y se avisa por correo a todos los administradores; con solo `empresa.configurar` (PS-08) se rechaza.
- **CA-090 · Qué se puede deshacer** (RNF-013). Dado la lista de reversibles (estado, asignación, recepción, lote de importación, orden editada, desactivados) y no reversibles (anonimizar, purgar, exportar, una aprobación ya consumida por una recepción), cuando se intenta deshacer cada uno, entonces los reversibles se revierten con su mecanismo y los no reversibles no ofrecen reversión; no existe un botón "Deshacer" genérico.
- **CA-091 · Redactar por seguridad** (RF-DAT-013, PS-234). Dado un motivo o una nota con un dato personal, cuando alguien con `texto.redactar` lo redacta con motivo, entonces el texto pasa a `[REDACTADO]` y la auditoría guarda quién, cuándo y por qué, sin el texto; sin el permiso se rechaza.
- **CA-092 · Contactos de proveedor** (RF-CAT-026). Dado un contacto de proveedor inactivo por 2 años, cuando corre la rutina de anonimización (con la confirmación de legal), entonces se anonimiza; en una exportación general los contactos no aparecen; ver contactos exige `proveedores.ver_contactos`.
- **CA-093 · Suplente de derechos** (RF-PER-012, RF-ACC-025). Dado una empresa sin persona suplente con PS-29, cuando un administrador abre "Primeros pasos", entonces ve la tarea "Designar suplente de derechos de datos" y el sistema le recuerda cada 3 días; si pasan 5 días sin designar se avisa al contacto autorizado; si quien presenta un pedido es la única persona con PS-29, el pedido queda "En espera de persona designada" y no lo atiende ella ni la plataforma.
- **CA-094 · Código visible del activo** (RF-INV-034, RN-023, RN-004, RF-CAT-008). Dado que la empresa A ya tiene hasta `ACTV-000041` y la empresa B está en `ACTV-000007`, cuando A recibe 3 laptops por una recepción, entonces quedan `ACTV-000042`, `ACTV-000043` y `ACTV-000044`, y el siguiente activo de B es `ACTV-000008`; cuando dos técnicos de A crean un activo a la vez, entonces los códigos son distintos; cuando un activo se corrige de serie, se da de baja o se reingresa, entonces conserva su código y el código de un activo anulado no se reutiliza; cuando alguien busca `actv-000042` o ` ACTV-000042 `, entonces encuentra solo el activo de A (en B no existe); cuando alguien intenta editar el código o crear una categoría con el prefijo `ACTV`, entonces se rechaza; el correo de un aviso de garantía trae `ACTV-000042` y no la serie.

## 23. Pendientes (P-NNN)

Cada pendiente dice qué bloquea. No todo es urgente.

| ID | Pendiente | Quién responde | Bloquea a |
|---|---|---|---|
| P-001 | Valor del monto límite de aprobación de cada empresa (es configuración). | Cada empresa, por el Cliente (CEO) | Etapa 5 (solo la puesta en marcha) |
| P-002 | Una orden de compra real, una orden de servicio real y el Excel de inventario actual, con nombres de personas reemplazados. | Cliente (CEO) | Etapa 0 (cierre, condición 8 de D-064) y Etapa 4 |
| P-003 | Cifra aproximada de activos, usuarios y órdenes por mes. | Cliente (CEO) | Dimensionamiento (se usa RNF-010 mientras tanto) |
| P-004 | País o países de las empresas, formato de número, y si los precios de compra incluyen impuestos. | Cliente (CEO) | Etapa 1 (ley de datos, moneda, zona) y Etapa 5 (impuestos) |
| P-005 | Aprobación del registro de permisos y de este documento por el Gerente de TI (condición 1 de D-064). | Gerente de TI | Etapa 0 (cierre) |
| P-006 | Tipos de servicio definitivos, su flujo y quién aprueba los que tienen costo, con la orden de servicio real. | Gerente de TI | Etapa 6 |
| P-007 | Formato real del Excel (columnas, textos de estado, personas). | Analista y Datos, con el Excel real | Etapa 4 |
| P-008 | Integración con SAP: no entra en la v1; el código del SKU se puede escribir a mano. | Gerente de TI | INT-2 (Fase 3) |
| P-009 | Si dar de baja un activo de valor exige una segunda persona y desde qué monto. | Gerente de TI | Etapa 7 |
| P-010 | Si se habilitan los archivos adjuntos (facturas, actas firmadas). | Cliente (CEO), por el costo | Fin de la Etapa 4 |
| P-011 | Opinión de un abogado de protección de datos (L-01 a L-16); las de prioridad A (L-01 a L-04, L-07, L-08, L-14, L-16) son previas a cargar datos reales. | Cliente (CEO) consigue al abogado | Cargar datos reales y producción (Etapa 7) |
| P-012 | Consulta a contabilidad sobre impuestos, depreciación y consolidado de monedas (S-PRE-02, 03, 04). | Cliente (CEO) | PRE-B (Fase 3) |
| P-013 | **Cerrado (D-072):** los valores de "Límites y formatos" (sección 19.2) están en firme; se cambian con una decisión nueva. | Gerente de TI | - |
| P-014 | Nombres exactos de los 8 grupos de menú, las 7 pestañas de la ficha del activo y las siete familias de color. | Diseñador, en el prototipo | Etapa 0 (condición 7 de D-064) |
| P-015 | Cuentas a nombre de la empresa, dominio de la empresa, la persona con suplente que recibe las alertas y **dos personas del equipo para administrar la plataforma antes de cargar datos reales** (D-073.1). | Cliente (CEO) designa | Etapa 0 (condición 9 de D-064) y cargar datos reales |
| P-016 | Si la empresa usa SAP y qué licencias o consultor haría falta (S-INT-08, 09). | Cliente (CEO) | INT-2 (Fase 3) |

## 24. Supuestos (todos resueltos)

D-057 resolvió los 31 supuestos de la v0.2 y D-065 resolvió S-32 a S-37. Los resultados:

| ID | Resultado | Dónde quedó |
|---|---|---|
| S-01 | Confirmado: enlace de 15 minutos, un solo uso, botón y atado al navegador | RF-ACC-006 |
| S-02 | Confirmado: 30 minutos de inactividad o 12 horas; aviso a los 25 minutos | RF-ACC-014 |
| S-03 | **Cambiado:** dar de baja a un usuario siempre se permite; el bloqueo es de anonimizar | RF-USR-003, RF-PER-006 |
| S-04 | Confirmado: soporte de solo lectura, máximo 24 horas, con banner y visible en la auditoría de la empresa | RF-PLA-005 |
| S-05 | Confirmado: el cambio de rol vale en la siguiente acción; un rol con usuarios no se elimina | RF-ROL-011, 012 |
| S-06 | **Rechazado:** las ubicaciones son jerárquicas hasta 3 niveles | RF-CAT-006 |
| S-07 | Confirmado, más prefijos reservados | RF-CAT-008 |
| S-08 | Confirmado y ampliado con la sección "Límites y formatos" | Sección 19.2, P-013 |
| S-09 | Confirmado | RF-SKU-009 |
| S-10 | Confirmado: el equipo compartido se asigna a una Persona custodio | RF-INV-014 |
| S-11 | Confirmado: retirar una orden Pendiente la devuelve a Borrador | Sección 12.2 |
| S-12 | Confirmado: "Recibida total" dura un instante y queda en el historial | Sección 12.2 |
| S-13 | Confirmado, con la precisión de saldo no negativo y orden cerrada a mano | RF-OC-032 |
| S-14 | Confirmado: total con impuesto, para todos los actos de dinero | RN-017 |
| S-15 | Confirmado: Solicitante crea con SKU y cantidades; Técnico o Administrador completan precios y ven los de lo que crean o editan | RF-OC-008, PS-23 |
| S-16 | Confirmado: OS con costo se aprueba si supera el límite | RF-OS-008, RN-017 |
| S-17 | Confirmado: tope combinado entre módulos; subida temporal para la carga inicial | RF-IMP-015 |
| S-18 | Confirmado: columna de versión en toda entidad editable | RN-014 |
| S-19 | Confirmado: prueba de carga en integración nocturna desde la Etapa 4; volumen de referencia único | RNF-010, 011 |
| S-20 | Confirmado | RNF-012 |
| S-21 | Confirmado: fecha día/mes/año; formato de número por país o navegador | RNF-002 |
| S-22 | Confirmado, con las celdas resueltas de D-037 | Registro de permisos |
| S-23 | Confirmado | RF-OC-007 |
| S-24 | Confirmado: columna simple; INT-2 migra a equivalencias | RF-OC-042 |
| S-25 | Confirmado: el responsable del centro de costo es una Persona | RF-CAT-023, 024 |
| S-26 | Confirmado: solo un dato en la v1 | RF-SKU-016 |
| S-27 | **Convertido en decisión** (D-037 fila 11): plantilla Empleado (portal) de lista cerrada; los módulos agregan filas, no celdas | RF-ROL-002, registro de permisos |
| S-28 | **Cambiado:** tres tipos de autor (membresía, integración, sistema) | RF-AUD-013 |
| S-29 | Confirmado, con la tabla completa de 25 combinaciones y un CHECK en la base de datos | RF-INV-010, 024 |
| S-30 | Confirmado: "supera" es estrictamente mayor; con límite 0, toda orden con al menos una línea; borde exacto con su criterio | RN-017, CA-055 |
| S-31 | Confirmado: botón "Pedir ayuda" | RF-UX-004 |

**Supuestos S-32 a S-37.** El Gerente de TI los resolvió en D-065. **No queda ningún supuesto abierto.**

| ID | Resultado (D-065) | Dónde quedó |
|---|---|---|
| S-32 | Confirmado: número de versión de la orden de compra; entero desde 1, sube con cada reaprobación, no se reutiliza, se ve en la orden y en la auditoría | RF-OC-044 |
| S-33 | **Confirmado con precisiones:** (a) garantía extendida y mantenimiento sin orden de servicio usan PS-231; (b) corregir el costo usa PS-51 (sensible): si el nuevo costo, con impuesto y en moneda base, supera el límite queda "pendiente de confirmación" y lo confirma otra persona con PS-51, o la casilla «compras»; (c) revertir una recepción (PS-68) lleva el control "No"; (d) un costo pendiente no entra al libro de costos | RN-017, RF-INV-026, RF-OC-032 |
| S-34 | Confirmado: contacto autorizado confirmado por el primer administrador; veto durante el rescate; acceso de emergencia con segunda persona o contacto confirmado, aviso a todos y un uso por empresa y semana; lectura de soporte según D-039.10; enlaces, invitaciones, sesiones, códigos de recuperación y enlaces de descarga solo como huella | RF-PLA-009, 011 a 013, RS-51, PS-05 |
| S-35 | **Confirmado con la fórmula exacta:** fin = (inicio menos 1 día) más los meses, ajustando al último día del mes | RF-INV-008, CA-082b |
| S-36 | Confirmado y **provisional hasta la opinión legal** (L-05, L-12): el plazo de 5 años del nombre en el acta corre desde el cierre de la asignación | RF-DAT-006, RF-DAT-011 |
| S-37 | Confirmado: ver el mapa de casillas de D-066 (casilla «contratos y servicios recurrentes») | RF-OC-026 |

## 25. Escalado al Cliente (CEO)

Solo dinero, tema legal o algo irreversible. Se le explica en español claro. Fuente: `docs/equipo/decisiones.md` y la hoja `docs/equipo/hoja-ceo.md`. Las cifras de DevOps no están verificadas: sirven para dimensionar, no para decidir.

**Dinero (le pedimos que apruebe o rechace)**
- **D1.** Servicio de envío de correos (invitaciones, enlaces de acceso, avisos de aprobación). Indispensable porque el acceso es por correo. Recomendación: aprobar un plan dimensionado para las Etapas 1 a 5, con tope por empresa y alerta al 80 %, más un segundo proveedor configurado de reserva.
- **D2.** Alojamiento, base de datos y respaldos: fase A (Etapas 0 a 3, datos inventados) con planes gratuitos o los más baratos; fase B (antes de usar datos reales) con base de datos de pago con respaldos, alojamiento de ejecución continua y almacenamiento externo con bloqueo. Orden de magnitud sin verificar: 50 a 150 USD al mes.
- **D3.** Copia externa inmutable de la auditoría, respaldos en otro proveedor y vigilancia.
- **D4.** Gestor de secretos y llaves de seguridad físicas para las cuentas de la plataforma.
- **D5.** Dominio: usar un subdominio de uno que la empresa ya tenga; si no existe, comprar uno.
- **D6.** Honorarios de un abogado de protección de datos.
- **D7.** Archivos adjuntos (P-010), SAP con conexión directa (P-016) y consulta a contabilidad (P-012): se consultan cuando lleguen.

**Legal (le pedimos una opinión legal; el equipo no la da)**
- **L-01 y L-02:** qué ley de protección de datos aplica según el país de cada empresa, quién es responsable de qué y si hay que registrar los bancos de datos.
- **L-03:** texto del aviso de privacidad y de los términos de uso, y si la plataforma es proveedor de las empresas o titular de los datos.
- **L-04:** confirmar los plazos propuestos: auditoría 5 años, anonimización a los 2 años, respaldos 30 días y 12 meses, eventos de seguridad 12 meses, casos de ayuda 5 años.
- **L-05 y L-12:** si se puede conservar el nombre en el acta de entrega hasta el fin de su plazo y el valor probatorio de un acta firmada en papel o confirmada en pantalla.
- **L-06:** procedimiento y plazos para atender derechos de acceso, corrección y eliminación, y si la eliminación se condiciona a devolver equipos.
- **L-09:** si son datos personales la IP, el correo escrito en intentos fallidos, el IMEI, el número de línea corporativo, el código de empleado, el titular persona natural de un dominio y los contactos de proveedor.
- **L-07 y L-08:** si tener datos de varias empresas en un mismo servidor, o en otro país, y usar proveedores externos exige requisitos especiales, y los contratos con esos proveedores y con cada empresa.
- **L-10, L-11, L-13 y L-15:** si registrar accesos de cada empleado exige aviso específico; implicancias laborales de reclamar o cobrar un equipo perdido; responsabilidad sobre datos de personas externas; y tratamiento contable de impuestos, depreciación y consolidación de monedas (consulta a contabilidad además de legal).
- **L-14 y L-16:** el resto de las preguntas de prioridad A y la obligación y plazos de avisar una fuga de datos a la autoridad y a los afectados.
- Aviso: si el Cliente (CEO) planea ofrecer la plataforma a empresas que no son suyas, esto cambia contratos, soporte y costos; basta con que avise si existe el plan.

**Irreversible (se le explica antes de ejecutarse)**
- **I-01.** Anonimizar o borrar datos personales. La automática queda apagada hasta la opinión legal; la manual solo para pedidos de derechos documentados y con dos personas.
- **I-02.** Purgar la auditoría a los 5 años y rotar respaldos. No se activa antes de confirmar los plazos.
- **I-03.** Pasar a producción con datos reales (Etapa 7): lo aprueba el Cliente (CEO) tras la demo, con respaldo restaurado y anonimizaciones reaplicadas, aviso de privacidad aceptable, contratos firmados, preguntas legales de prioridad A contestadas y procedimiento de incidente escrito.
- **I-04.** Datos exportados fuera de la plataforma: una vez descargado un archivo la plataforma ya no lo controla (solo informar).

**Insumos que solo el Cliente (CEO) tiene** (no son decisiones de producto): P-002, P-003, P-004, P-015 (incluye designar **dos personas del equipo para administrar la plataforma** antes de cargar datos reales; no tiene costo propio salvo las llaves de seguridad físicas ya incluidas en D4) y si usa SAP (P-016).

**Lo que el Cliente (CEO) sigue haciendo:** aprobar la demo al final de cada etapa antes de empezar la siguiente.

## 26. Trazabilidad y prefijos

### 26.1 Cómo se traza

Cada tabla de requisitos de este documento es la matriz: la columna **Cuándo** dice cuándo se entrega y la columna **CA** dice qué criterio de aceptación lo comprueba (sección 22); cada CA cita a su vez los requisitos que cubre. QA y el Auditor Técnico la copian a `docs/trazabilidad.md` para sumar la prueba que cubre cada criterio y su estado; el Auditor Técnico la revisa al cerrar cada etapa: un requisito sin prueba y una prueba sin requisito son hallazgos.

| Módulo | Requisitos | Cuándo | Criterios de aceptación |
|---|---|---|---|
| ACC Acceso | RF-ACC-001 a 026 | v1, Etapa 1 (avisos en Etapa 5) | CA-004 a 010, CA-015c y d, CA-049, CA-050b, CA-068, CA-069, CA-074, CA-079, CA-081, CA-082, CA-093 |
| PLA / EMP Plataforma y empresa | RF-PLA-001 a 013, RF-EMP-001 a 005 | v1, Etapa 1 | CA-007, CA-015a a f, CA-041, CA-067, CA-070, CA-071, CA-075, CA-084 |
| USR Usuarios | RF-USR-001 a 008 (004 retirado) | v1, Etapa 1 | CA-008, CA-045, CA-052c, CA-052d, CA-054c |
| ROL Roles y permisos | RF-ROL-001 a 015 | v1, Etapa 1 | CA-008 a 012, CA-011a y b, CA-041, CA-047, CA-077 |
| PER Personas | RF-PER-001 a 014 | v1, Etapas 2, 4 y 5 | CA-001, CA-011b, CA-016a y b, CA-038, CA-052a1, a2, b1, b2, c y d, CA-054a y b, CA-076, CA-081b, CA-093 |
| CAT Catálogos y campos | RF-CAT-001 a 029 | v1, Etapa 2 | CA-001, CA-016a, CA-017 a 021, CA-032, CA-042, CA-045, CA-048, CA-060a, CA-064a, CA-065a y b, CA-092 |
| SKU Maestro | RF-SKU-001 a 016 | v1, Etapa 3 (RF-SKU-014 en 4) | CA-017 a 023, CA-032, CA-042, CA-048, CA-061, CA-064b |
| INV Inventario | RF-INV-001 a 034 | v1, Etapa 4 (RF-INV-012 en 6) | CA-011b, CA-023 a 028, CA-032, CA-036, CA-038, CA-044, CA-046, CA-058, CA-059, CA-060b, CA-063, CA-079b, CA-081b, CA-082b, CA-094 |
| OC Compras y recepción | RF-OC-001 a 051 | v1, Etapa 5 (RF-OC-027 en 2, RF-OC-028 en 7) | CA-011a, CA-012 a 014, CA-018, CA-020, CA-024, CA-029 a 037, CA-045, CA-055, CA-061, CA-062, CA-070, CA-072, CA-078, CA-089 |
| OS Órdenes de servicio | RF-OS-001 a 011 (007 retirado) | v1, Etapa 6 | CA-018, CA-044, CA-055 |
| IMP / EXP Importación y exportación | RF-IMP-001 a 018 (012 retirado), RF-EXP-001 a 007 | v1, Etapas 2 y 4 | CA-011b, CA-038, CA-039, CA-041, CA-043, CA-056, CA-057, CA-067 |
| AUD Auditoría | RF-AUD-001 a 019 | v1, Etapa 1 (015 en 2; 016 y 018 en 7) | CA-001, CA-002, CA-011b, CA-015b, CA-040a y b, CA-041, CA-042, CA-045, CA-054a y c, CA-066 |
| DAT Datos personales | RF-DAT-001 a 016 | v1, Etapas 0, 1, 2, 4 y 7 | CA-004, CA-016a, CA-040b, CA-046, CA-049, CA-053, CA-054a, b y c, CA-056, CA-073, CA-074, CA-076, CA-091 |
| UX Pantallas | RF-UX-001 a 012 | v1, Etapas 1 a 6 | CA-011b, CA-024, CA-048, CA-050a y b, CA-080 |
| RNF Calidad y continuidad | RNF-001 a 022 | v1, Etapas 0 a 7 | CA-034, CA-043, CA-046, CA-048, CA-050a y b, CA-053, CA-069, CA-073, CA-077, CA-090 |
| RN Reglas transversales | RN-001 a 022 | v1, Etapas 1 a 7 | Cada regla cita su criterio en la columna CA de la sección 21 (CA-085 a CA-088 son nuevos) |
| RS Seguridad | RS-01 a RS-51 | Las del cuadro de la sección 17 | Las de cada requisito referido; RS-51 con CA-083 |

### 26.2 Tabla de prefijos (D-049, DS-12)

| Tipo | Prefijo | Notas |
|---|---|---|
| Requisitos del núcleo | `RF-<MÓD>-NNN` | Códigos de módulo: ACC, PLA, EMP, USR, ROL, PER, CAT, SKU, INV, OC, OS, IMP, EXP, AUD, DAT, UX |
| Requisitos de un módulo adicional | `RF-<MÓD>-NNN` | Códigos propios: **PRS** (Personas; el núcleo conserva RF-PER), ENT, PRV, GAR, NOT, LIC, LIN, DOM, AYU, ONB, POR, CMD, CAM, PRB, PRE, REP, INT |
| Reglas, calidad, seguridad | `RN-NNN`, `RNF-NNN`, `RS-NN` | |
| Criterios, pendientes, decisiones, supuestos | `CA-NNN`, `P-NNN`, `D-NNN`, `S-NN` | Módulos: `S-CAM-nn`, `S-PRB-nn`, `S-<MÓD>-nn` |
| Pantallas, escalados | `PAN-<MÓD>-nn`, `E-<MÓD>-nn` | |
| Permisos | `PS-nn` | Registro único |
| Orden de compra, servicio, recepción | `OC-`, `OS-`, `RCP-` | Mínimo 6 dígitos |
| Reclamo, mantenimiento, contrato | `RCL-`, `MNT-`, `CTR-` | Mínimo 6 dígitos |
| Caso, cambio, problema, artículo | `AYU-`, `CAM-`, `PRB-`, `KB-` | Mínimo 6 dígitos |
| Elemento de CMDB | `EC-` | Reservado por bloque |
| Actas | `ACT-E-` (entrega), `ACT-D-` (devolución) | 6 dígitos |
| Activo | `ACTV-` | Mínimo 6 dígitos; correlativo por empresa, contador propio (D-079) |
| Persona | `PRS-` | Mínimo 4 dígitos |
| Presupuesto y relacionados | `PPT-` (presupuesto), `MPR-` (modificación presupuestaria), `GMA-` (gasto manual) | Pedidos por presupuesto-costos |
| Lote hacia SAP, programación de reporte | `LSAP-`, `PRG-` | Pedidos por integraciones y reportes |
| SKU | Prefijo de la categoría + 4 dígitos como mínimo | Cuidado: una categoría no puede usar un prefijo reservado |

**Prefijos reservados** que una categoría no puede usar: `OC, OS, RCP, RCL, MNT, CTR, AYU, CAM, PRB, KB, EC, ACT, ACTV, PRS, PAN, PPT, MPR, GMA, LSAP, PRG`. Se elimina `CLI-`: todo contrato es `CTR-`. Un **registro de prefijos** vive en este documento y en `docs/trazabilidad.md`.

### 26.3 Vocabulario del ciclo de vida (D-049.5)

Activar/Desactivar (listas), Suspender/Reactivar (accesos y servicios), Dar de baja (activo, línea, dominio, certificado, usuario), **Cesar** (Persona), Anular (documento ya emitido), Cancelar (trabajo en curso), Terminar (contrato), Cerrar (trabajo concluido), Aprobar/Rechazar. Los contratos de proveedor y de licencia usan los mismos estados: Borrador, Programado, Vigente, Vencido, Terminado, Anulado.

---

## 27. Módulos adicionales

Los módulos que se suman al núcleo los escriben escuadrones en `docs/modulos/`. La **fase u ola** de cada uno es la de D-056 y manda sobre el texto de cada archivo. Este índice solo los enumera y no repite su contenido. Palabras: **Etapa** (0 a 7) es solo del núcleo de la v1; **Fase** (2 o 3) es lo posterior a la v1.

| Módulo | Cuándo | Documento |
|---|---|---|
| Personas y ubicaciones (`RF-PRS`) | v1, Etapa 2 | ver docs/modulos/personas-ubicaciones.md |
| Entregas y devoluciones | ENT-A: v1, Etapa 4; ENT-B: Fase 2 | ver docs/modulos/entregas-devoluciones.md |
| Proveedores y contratos | PRV-A: v1, Etapas 2 y 5; PRV-B: Fase 2, ola B | ver docs/modulos/proveedores-contratos.md |
| Garantías y mantenimiento | GAR-A: v1, Etapas 4 y 5; GAR-B: Fase 2, ola B | ver docs/modulos/garantias-mantenimiento.md |
| Notificaciones | NOT-base: v1, Etapa 1 (= RF-ACC-021); NOT-completo: Fase 2, ola A | ver docs/modulos/notificaciones.md |
| Dominios y certificados | Fase 2, ola B (primero de la ola) | ver docs/modulos/dominios-certificados.md |
| Licencias de software | Fase 2, ola B | ver docs/modulos/licencias-software.md |
| Líneas móviles | Fase 2, ola B | ver docs/modulos/lineas-moviles.md |
| Mesa de ayuda | Fase 2, ola C | ver docs/modulos/mesa-de-ayuda.md |
| Onboarding y offboarding | Fase 2, ola C | ver docs/modulos/onboarding-offboarding.md |
| Portal de autoservicio | Fase 3, ola D | ver docs/modulos/portal-autoservicio.md |
| CMDB ligera | Fase 3, ola E (primero de la ola) | ver docs/modulos/cmdb-ligera.md |
| Gestión de cambios | Fase 3, ola E (después de CMD) | ver docs/modulos/gestion-cambios.md |
| Gestión de problemas | Fase 3, ola E (después de AYU, CMD y CAM) | ver docs/modulos/gestion-problemas.md |
| Presupuesto y costos | PRE-A: Fase 3, ola F (puede adelantarse); PRE-B después | ver docs/modulos/presupuesto-costos.md |
| Reportes y tableros | REP-A: Fase 3, ola F (puede adelantarse); REP-B y C después | ver docs/modulos/reportes-tableros.md |
| Integraciones y API | INT-1, INT-2, INT-3: Fase 3, ola F | ver docs/modulos/integraciones-api.md |

Reglas para los módulos (de D-037, D-043, D-044 y el plan de correcciones):
- **Permisos:** solo nombres del registro (`docs/registro-permisos.md`); los módulos agregan filas, no cambian celdas del núcleo; cada módulo declara la columna "Empleado (portal)" o "no aplica".
- **Datos personales:** cada módulo lista sus campos personales en la tabla de la sección 18.1 o no pasa a desarrollo.
- **Dinero:** usan el patrón compartido (importe sin impuesto, % de impuesto, moneda, periodicidad, centro de costo, `fuente_costo`), la medida única de monto (RN-017) y ninguna excepción propia.
- **Avisos:** un solo motor y una sola tabla de avisos; los avisos de módulos de Fase 2 y 3 no entran a la v1.
- **Vigencias:** se calculan al leer (RN-018).
- **Procesos diarios:** cada uno declara su regla de idempotencia, recuperación y "hoy" por empresa (RNF-019).
- **Importación y exportación:** usan el marco y la puerta únicos; ninguno importa ni exporta por su cuenta.
- **Pruebas:** de aislamiento y de permiso denegado con identificador interno y con dos empresas, y ejecutar los procesos automáticos con dos empresas.
- **Quién verifica:** el escuadrón no cierra su propio trabajo; lo verifican el Auditor Técnico, QA, Seguridad y Cumplimiento.

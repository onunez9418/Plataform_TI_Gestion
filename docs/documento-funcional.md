# Documento funcional: Plataforma de Gestión de Áreas de TI

**Versión:** 0.2 (núcleo de la plataforma, para la ronda 2 de la Mesa de revisión #001)
**Fecha:** 2026-10-25
**Estado:** borrador. Lo revisan QA, Seguridad y los dos auditores; después el Gerente de TI da su visto bueno y la Jefatura de Proyecto lo presenta al Cliente (CEO).
**Autor:** Analista de Negocio

> Este documento describe **qué hace** la plataforma, en lenguaje simple. No habla de tecnología.
> Las decisiones D-001 a D-029 de `docs/equipo/decisiones.md` son obligatorias y están incorporadas aquí. Si una frase de este documento las contradice, vale la decisión y se corrige el documento.

## Cómo leer este documento

| Marca | Significado |
|---|---|
| **[PENDIENTE]** | Falta un dato o una definición. Siempre dice qué etapa bloquea (ver sección 22). |
| **[SUPUESTO S-nn]** | Una regla que el Analista propone con recomendación porque nadie la definió. La confirma o cambia el Gerente de TI. Lista completa en la sección 23. |
| **[ESCALAR AL CEO]** | Solo dinero, tema legal o algo que no se puede deshacer. Lista completa en la sección 24. |
| **RF-módulo-NNN** | Requisito funcional. Cada uno dice en qué **etapa** (0 a 7) se entrega y qué **criterio de aceptación (CA)** lo comprueba. |
| **RN-NNN** | Regla de negocio que atraviesa varios módulos (sección 20). |
| **RNF-NNN** | Requisito de calidad medible: idioma, rendimiento, dispositivos (sección 19). |
| **RS-NN** | Requisito de seguridad (sección 17). |
| **CA-NNN** | Criterio de aceptación en formato "Dado... cuando... entonces..." (sección 21). |
| **P-NNN** | Pendiente, con la etapa que bloquea (sección 22). |

Los identificadores no se reutilizan ni se renumeran. Un requisito retirado queda marcado "Retirado" con su fecha.

**Qué cambió respecto de la v0.1:** se incorporaron las 29 decisiones del Gerente de TI; se agregaron el administrador de plataforma, las personas receptoras, la importación del Excel, la sección de seguridad, la retención de datos, los criterios de aceptación y la trazabilidad; se dividieron los campos personalizados en "del artículo" y "de la unidad"; se cerraron los estados del activo y de la orden de compra; "Solicitante" quedó solo como rol y quien pidió la plataforma pasó a llamarse "Cliente (CEO)".

---

## 1. Propósito

Una plataforma web para que el área de TI de una empresa controle sus activos tecnológicos (equipos, periféricos, celulares, licencias) y gestione las compras y los servicios que se hacen alrededor de ellos, con trazabilidad de quién hizo qué. Se usa con las empresas que el Cliente (CEO) designe (ver P-004 y la sección 24).

## 2. Alcance de la versión 1

**Incluye**
1. Acceso por invitación con enlace al correo, y administrador de plataforma (secciones 5 y 6).
2. Empresas, usuarios, roles y permisos con matriz (sección 7).
3. Personas que reciben equipos, distintas de los usuarios (sección 8).
4. Catálogos y categorías con campos personalizados, del artículo y de la unidad (sección 9).
5. Maestro de artículos (SKU) (sección 10).
6. Inventario: activos con serie y stock por cantidad, con estados, asignación y acta imprimible (sección 11).
7. Órdenes de compra con aprobación por monto y separación de funciones, y recepción de mercadería (secciones 12 y 13).
8. Órdenes de servicio (sección 14).
9. Importación del Excel de inventario actual (sección 15).
10. Auditoría que no se puede alterar (sección 16).
11. Seguridad, datos personales y continuidad (secciones 17, 18 y 19).
12. Búsqueda global, filtros y exportación a Excel en todas las listas; avisos por correo de invitaciones, accesos y aprobaciones.

**No incluye en la versión 1** (queda anotado para después, ver sección 25): aprobación en varios niveles o por tipo de orden; varios roles por persona; restricción por sede; subcategorías de varios niveles; conversión de monedas; asignación de cada puesto de licencia a una persona; archivos adjuntos; impresión de etiquetas o códigos QR y escaneo con la cámara; firma o aceptación en pantalla del receptor; estado "en tránsito"; devolución al proveedor y mercadería dañada; avisos automáticos de vencimiento de garantía o licencia; envío automático de órdenes al proveedor; ingreso con cuenta de Google o Microsoft; segunda persona para bajas de valor; integración con SAP; tickets de soporte; mantenimiento preventivo; reportes avanzados; aplicación móvil propia.

**Etapas** (cada una termina con una demo que el Cliente (CEO) prueba y aprueba antes de empezar la siguiente)

| Etapa | Qué entrega | Módulos de este documento |
|---|---|---|
| 0 | Este documento aprobado, prototipo de pantallas, documentos reales del Cliente (CEO) | Todo el documento |
| 1 | Acceso, empresas, administrador de plataforma, usuarios, roles, matriz de permisos, auditoría general, seguridad | ACC, PLA, USR, ROL, AUD, RS |
| 2 | Catálogos, categorías, campos personalizados, directorio de personas | CAT, PER |
| 3 | Maestro de SKU | SKU |
| 4 | Inventario, estados, asignación, acta, importación del Excel | INV, IMP |
| 5 | Órdenes de compra y recepción | OC |
| 6 | Órdenes de servicio | OS |
| 7 | Pulido, rendimiento, respaldos probados, salida a producción | RNF, DAT |

**Puerta de la Etapa 0:** no se programa hasta que el Cliente (CEO) apruebe el documento v1.0 con la demo del prototipo y entregue una orden de compra real, una orden de servicio real y el Excel de inventario, con los nombres de personas reemplazados (P-002). Mientras no estén, se trabaja con datos de ejemplo y se declara.

## 3. Glosario

| Término | Significado |
|---|---|
| **Cliente (CEO)** | La persona que pidió la plataforma. No es un rol dentro de la plataforma. |
| **Empresa** | Una organización que usa la plataforma. Sus datos están completamente separados de los de otras empresas. |
| **Administrador de plataforma** | Persona del equipo de TI, fuera de cualquier empresa, que crea y suspende empresas. No ve los datos del negocio de las empresas. |
| **Administrador (de empresa)** | Rol de una empresa que gestiona usuarios, roles y configuración. No es el administrador de plataforma. |
| **Usuario** | Quien entra a la plataforma con su correo y tiene un rol en una empresa. |
| **Persona** | Empleado o custodio que recibe equipos. Puede no tener acceso a la plataforma. Está vinculada a un usuario solo si también entra al sistema. |
| **Rol** | Conjunto de permisos que se asigna a un usuario en una empresa (ej. Técnico, Jefatura TI). |
| **Solicitante** | Un rol: crea solicitudes de compra o de servicio y ve las propias. No tiene relación con el Cliente (CEO). |
| **Solicitud** | No es un documento aparte. Una solicitud de compra es una orden de compra en Borrador; una solicitud de servicio es una orden de servicio en estado Creada. |
| **Permiso sensible** | Permiso que se da por separado porque expone dinero o datos personales: ver precios, ver auditoría, ver datos personales, importar, exportar, administrar roles, escribir código propio de SKU, ver la clave completa de una licencia, reingreso. |
| **Alcance de un permiso** | "Todo" (toda la empresa) o "Propio" (solo lo que la persona creó o le corresponde). |
| **SKU** (también "artículo") | Código que identifica un *tipo* de artículo. Ej.: `LAP-0001` = Laptop Dell Latitude 5440 i7/16GB. Existe una sola vez por empresa. En este documento "artículo" significa siempre SKU; a las unidades físicas se les llama activos. |
| **Serie** | Número de serie de una unidad física concreta. Un SKU con control por serie puede tener muchas series. |
| **Activo** | Una unidad física con serie que la empresa posee (una laptop concreta, un celular concreto, una clave de licencia). Es un solo registro para siempre. |
| **Stock** | Conteo de un SKU controlado por cantidad (mouses, teclados, cables), por ubicación. El stock no se llama "activo". |
| **Control por serie** | El SKU se rastrea unidad por unidad. |
| **Control por cantidad** | El SKU solo lleva un conteo de stock. |
| **Unidad de medida** | Cómo se cuenta un SKU (pieza, caja, metro). No es lo mismo que unidad física. |
| **Categoría / Subcategoría** | Agrupación de SKUs (Laptops; dentro de Periféricos, Mouse). Define el prefijo del código y los campos extra. Solo un nivel de subcategoría. |
| **Campo del artículo** | Dato que vale para todas las unidades de un SKU (RAM, disco, procesador). |
| **Campo de la unidad** | Dato distinto en cada unidad (IMEI, número de línea, vencimiento de una clave). |
| **Catálogo** | Lista de valores que el administrador mantiene (marcas, modelos, proveedores, ubicaciones, centros de costo, unidades de medida). |
| **Ubicación** | Lugar donde está físicamente un activo o un stock (bodega, oficina). |
| **Responsable** | La Persona a cargo de un activo mientras está Asignado. Es el mismo dato que "asignado a". |
| **Asignación** | Entrega de un activo a una Persona. Termina con la devolución. "Prestado" es una asignación con fecha de devolución prevista. |
| **Traslado** | Mover stock de una ubicación a otra. Es inmediato. |
| **Baja** | Retiro definitivo de un activo del uso. Requiere motivo. No borra el historial. |
| **Reingreso** | Reactivar el mismo registro de un activo dado de baja o extraviado que vuelve. |
| **Garantía** | Fecha hasta la cual el proveedor responde por el equipo. En la v1 solo se guarda, no avisa. |
| **Centro de costo** | Área o presupuesto al que se carga una compra. |
| **Correlativo** | Número que aumenta de uno en uno para formar un código (`LAP-0001`, `LAP-0002`). Nunca se repite; puede haber saltos. |
| **Orden de compra (OC)** | Documento para comprar SKUs a un proveedor. |
| **Recepción** | Registro de que llegó mercadería de una OC. Aquí se capturan las series y nacen los activos. |
| **Orden de servicio (OS)** | Documento para pedir o registrar un trabajo (reparación, instalación, servicio externo). |
| **Auditoría** | Registro que solo se agrega, de quién hizo qué y cuándo. Distinto del historial de un activo. |
| **Historial** | Lo que le pasó a un activo o stock (ingreso, asignación, traslado, baja). Es dato del negocio. |
| **Todo o nada** | Una operación de varias partes se completa entera o no se hace; nunca queda a medias. |
| **Vista previa** | Pantalla que muestra lo que pasaría antes de confirmar, sin guardar nada. |

## 4. Ciclo de vida general de un activo, de punta a punta

1. El proveedor entrega y el Almacén **recibe** contra una orden de compra aprobada (sección 13): nacen los activos con su serie.
2. El Técnico **asigna** el activo a una Persona y se genera el **acta** de entrega.
3. El activo puede ir a **reparación** y volver; si se pierde pasa a **extraviado o robado**.
4. Al terminar su vida útil se da de **baja** con motivo. Si vuelve, se hace un **reingreso** del mismo registro.
5. Cada paso queda en el **historial** del activo y en la **auditoría**.

Los activos que ya existen en el Excel del Cliente (CEO) entran por la **importación** (sección 15) sin orden de compra de origen.

---

## 5. Acceso y empresas

Basado en D-001 y D-002. Etapa 1.

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-ACC-001 | No hay registro abierto: solo entra quien tiene una invitación. | 1 | CA-006 |
| RF-ACC-002 | Una empresa la crea el Administrador de plataforma, que invita al primer administrador de esa empresa. | 1 | CA-015 |
| RF-ACC-003 | Sirve cualquier correo (personal o corporativo, Gmail, Outlook), siempre con invitación. | 1 | CA-005 |
| RF-ACC-004 | No existe la unión por dominio de correo, por búsqueda de empresa ni por código público. | 1 | CA-006 |
| RF-ACC-005 | Se entra con un enlace que llega al correo. No hay contraseñas en la v1. | 1 | CA-006 |
| RF-ACC-006 | El enlace de acceso dura 15 minutos [SUPUESTO S-01] y sirve una sola vez. Al abrirlo, el correo queda verificado. | 1 | CA-005 |
| RF-ACC-007 | Las invitaciones vencen a los 7 días, se usan una sola vez, quedan ligadas al correo al que se enviaron y el administrador las puede cancelar. | 1 | CA-005 |
| RF-ACC-008 | Quien invita no puede dar un rol con más permisos que el suyo. | 1 | CA-010 |
| RF-ACC-009 | Si el correo invitado ya tiene cuenta, la empresa se suma a la misma cuenta; no se crea otra. | 1 | CA-005 |
| RF-ACC-010 | Los correos se guardan y comparan sin distinguir mayúsculas (`Ana@x.com` y `ana@x.com` son la misma persona). | 1 | CA-005 |
| RF-ACC-011 | La cuenta es de la persona; el rol, el estado y los datos dentro de una empresa son de esa empresa. Una empresa nunca ve a qué otras empresas pertenece alguien. | 1 | CA-004 |
| RF-ACC-012 | Quien pertenece a más de una empresa elige con cuál trabaja. La empresa activa se ve siempre en pantalla, la comprueba el servidor en cada acción, el cambio queda en auditoría y no arrastra datos en pantalla de la empresa anterior. | 1 | CA-004 |
| RF-ACC-013 | La segunda verificación es obligatoria para los administradores (de empresa y de plataforma), con una aplicación autenticadora en el celular (sin SMS). Es opcional para los demás. | 1 | CA-007 |
| RF-ACC-014 | Las sesiones vencen a los 30 minutos sin actividad y a las 12 horas en total [SUPUESTO S-02]. | 1 | CA-008 |
| RF-ACC-015 | Existe "cerrar sesión en todos los dispositivos". | 1 | CA-008 |
| RF-ACC-016 | Suspender o dar de baja a alguien en una empresa corta sus sesiones en esa empresa al instante. | 1 | CA-008 |
| RF-ACC-017 | Tras varios intentos fallidos la espera crece. El mensaje de error nunca dice si un correo existe. | 1 | CA-006 |
| RF-ACC-018 | Recuperación de acceso: como no hay contraseña, la persona pide un enlace nuevo. | 1 | CA-006 |
| RF-ACC-019 | Si una empresa pierde a su único administrador, lo recupera el Administrador de plataforma verificando la identidad por otro medio, y queda en la auditoría. | 1 | CA-015 |
| RF-ACC-020 | Al crear una empresa se recomienda tener al menos dos administradores; el sistema lo avisa. | 1 | CA-009 |
| RF-ACC-021 | Se envían por correo: invitaciones, enlaces de acceso, aviso al aprobador cuando hay una orden pendiente y aviso al creador cuando se aprueba o rechaza. El servicio de envío tiene costo mensual: **[ESCALAR AL CEO]** (sección 24, punto D1). | 1 y 5 | CA-005 |
| RF-ACC-022 | Una empresa suspendida por la plataforma no permite entrar a ninguno de sus usuarios; sus datos se conservan, no se borran. | 1 | CA-015 |
| RF-ACC-023 | Al primer ingreso se pide aceptar el aviso de privacidad y los términos; quedan registradas la versión y la fecha. El texto lo define legal: **[ESCALAR AL CEO]** (sección 24, punto L3). | 1 | CA-049 |

## 6. Administrador de plataforma

Basado en D-003. Etapa 1.

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-PLA-001 | Existe el rol Administrador de plataforma, fuera de cualquier empresa. Son 1 o 2 personas del equipo de TI, con segunda verificación obligatoria. | 1 | CA-007 |
| RF-PLA-002 | Puede crear, suspender y reactivar empresas, e invitar al primer administrador. | 1 | CA-015 |
| RF-PLA-003 | Puede rescatar una empresa sin administrador, verificando la identidad por otro medio. | 1 | CA-015 |
| RF-PLA-004 | **No ve** los datos del negocio de las empresas (activos, compras, personas, precios). | 1 | CA-015 |
| RF-PLA-005 | Si soporte necesita ver datos de una empresa, el Administrador de esa empresa lo autoriza por un máximo de 24 horas [SUPUESTO S-04] y todo lo que se vea queda en auditoría. | 1 | CA-015 |
| RF-PLA-006 | Vive en una zona separada del sistema, con ruta y permisos propios. Nadie entra directo a la base de datos de producción para tareas rutinarias. | 1 | CA-015 |
| RF-PLA-007 | Cada acción del Administrador de plataforma queda en la auditoría. | 1 | CA-041 |

## 7. Usuarios, roles y permisos

Basado en D-004 y D-015. Etapa 1.

### 7.1 Usuarios

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-USR-001 | Un usuario tiene uno de estos estados en cada empresa: Invitado, Activo, Suspendido, Dado de baja. | 1 | CA-052 |
| RF-USR-002 | Un usuario nunca se borra; se suspende o se da de baja. | 1 | CA-045 |
| RF-USR-003 | Suspender corta el acceso al instante y se puede revertir. Dar de baja es definitivo para esa empresa [SUPUESTO S-03]. | 1 | CA-008 |
| RF-USR-004 | No se puede dar de baja a un usuario vinculado a una Persona con activos asignados hasta reasignarlos o registrar su devolución. Suspenderlo sí se puede. | 4 | CA-052 |
| RF-USR-005 | Las órdenes abiertas de un usuario dado de baja se reasignan o se cancelan con motivo. | 5 | CA-052 |
| RF-USR-006 | Dar de baja no borra el historial. Los datos personales se anonimizan pasado el plazo de la sección 18. | 1 | CA-052 |
| RF-USR-007 | Cada alta, suspensión, baja y cambio de rol queda en la auditoría. | 1 | CA-041 |
| RF-USR-008 | Un usuario puede estar vinculado a una Persona (opcional). | 2 | CA-052 |

### 7.2 Roles y permisos

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-ROL-001 | Cada usuario tiene **un solo rol** en cada empresa. El rol vive en la relación persona-empresa: la misma persona puede tener roles distintos en empresas distintas. | 1 | CA-047 |
| RF-ROL-002 | Los 6 roles iniciales (sección 7.3) son plantillas que se copian al crear la empresa; cada empresa edita su copia sin afectar a las demás. | 1 | CA-047 |
| RF-ROL-003 | Cada permiso tiene un alcance: "todo" o "propio". No hay restricción por sede en la v1. | 1 | CA-011 |
| RF-ROL-004 | Los permisos sensibles se otorgan por separado: ver precios, ver auditoría, ver datos personales, importar, exportar, administrar roles, escribir código propio de SKU, ver la clave completa de una licencia, reingreso. | 1 | CA-011 |
| RF-ROL-005 | Importar y exportar vienen activados solo para el Administrador. "Solo lectura" no ve precios ni datos personales de asignaciones salvo que el administrador lo active. | 1 | CA-011 |
| RF-ROL-006 | Todo rol nuevo parte sin ningún permiso. | 1 | CA-047 |
| RF-ROL-007 | Nadie puede darse permisos a sí mismo, ni crear o asignar un rol con más permisos de los que él tiene. Los cambios del rol propio los hace otro administrador. | 1 | CA-010 |
| RF-ROL-008 | La empresa siempre tiene al menos un administrador activo. El sistema impide quitar, suspender o bajar de rol al último. | 1 | CA-009 |
| RF-ROL-009 | El rol Administrador de la plantilla incluye todos los permisos, pero las reglas de separación de funciones de compras (sección 12.4) se aplican también a él. | 1 | CA-012 |
| RF-ROL-010 | Todo permiso se comprueba en el servidor. Ocultar un botón en pantalla es comodidad, no seguridad. | 1 | CA-011 |
| RF-ROL-011 | Un cambio de rol vale desde la siguiente acción de esa persona, sin esperar a que cierre sesión [SUPUESTO S-05]. | 1 | CA-008 |
| RF-ROL-012 | Un rol con usuarios asignados no se puede eliminar; se reasignan primero o se desactiva el rol [SUPUESTO S-05]. | 1 | CA-047 |
| RF-ROL-013 | Los cambios en roles y permisos quedan en la auditoría con valor anterior y nuevo. | 1 | CA-041 |
| RF-ROL-014 | La matriz de la sección 7.3 es la base de las pruebas. Cambiarla exige visto bueno del Gerente de TI y actualizar este documento. | 1 | CA-011 |

### 7.3 Matriz de permisos: módulo × acción × rol

Es la propuesta inicial que se copia a cada empresa. Se ajusta con el prototipo de la Etapa 0 y con los documentos reales (P-005); los cambios los aprueba el Gerente de TI. Marcada como [SUPUESTO S-22] en las celdas que nadie había definido.

Leyenda: **T** = todo · **P** = solo lo propio · **-** = no puede · **(S)** = permiso sensible.

| Módulo | Acción | Administrador | Jefatura TI | Técnico | Almacén | Solicitante | Solo lectura |
|---|---|---|---|---|---|---|---|
| Empresa | Ver la configuración (moneda base, zona horaria, monto límite, excepción de separación de funciones) | T | T | - | - | - | - |
| Empresa | Editar la configuración | T | - | - | - | - | - |
| Usuarios | Ver usuarios de la empresa | T | T | - | - | - | - |
| Usuarios | Invitar, cambiar rol, suspender, dar de baja | T | - | - | - | - | - |
| Roles | Ver roles | T | T | - | - | - | - |
| Roles | Administrar roles (S) | T | - | - | - | - | - |
| Personas | Ver personas y sus asignaciones: datos personales (S) | T | T | T | - | - | - |
| Personas | Crear y editar personas | T | - | T | - | - | - |
| Personas | Desactivar personas | T | - | T | - | - | - |
| Catálogos | Ver catálogos, categorías y campos | T | T | T | T | T | T |
| Catálogos | Crear y editar catálogos (marcas, modelos, ubicaciones, centros de costo, unidades) | T | - | T | - | - | - |
| Catálogos | Crear y editar proveedores (permiso aparte) | T | - | - | - | - | - |
| Catálogos | Crear y editar categorías y campos personalizados | T | - | - | - | - | - |
| SKU | Ver SKU | T | T | T | T | T | T |
| SKU | Crear y editar SKU | T | - | T | - | - | - |
| SKU | Escribir código propio (S) | T | - | - | - | - | - |
| SKU | Desactivar SKU | T | - | T | - | - | - |
| Inventario | Ver activos y stock | T | T | T | T | - | T |
| Inventario | Asignar y devolver activos | T | - | T | - | - | - |
| Inventario | Cambiar a En reparación y volver | T | - | T | - | - | - |
| Inventario | Dar de baja o marcar Extraviado o robado | T | - | T | - | - | - |
| Inventario | Reingreso de un activo (S) | T | T | - | - | - | - |
| Inventario | Corregir una serie, con motivo | T | - | T | T | - | - |
| Inventario | Mover stock por cantidad (ingreso, salida, traslado) | T | - | T | T | - | - |
| Inventario | Ajustar stock, con motivo | T | - | T | - | - | - |
| Inventario | Ver la clave completa de una licencia (S) | T | - | - | - | - | - |
| Compras | Ver órdenes de compra | T | T | T | T | P | T |
| Compras | Ver precios, totales y costos (S) | T | T | - | - | - | - |
| Compras | Crear y editar órdenes (incluye las solicitudes en Borrador) | T | - | T | - | P | - |
| Compras | Aprobar o rechazar | T | T | - | - | - | - |
| Compras | Emitir al proveedor | T | T | - | - | - | - |
| Compras | Anular | T | T | P | - | P | - |
| Compras | Cerrar manualmente con motivo | T | T | - | - | - | - |
| Recepción | Crear y confirmar recepciones | T | - | - | T | - | - |
| Recepción | Revertir una recepción, con motivo | T | T | - | - | - | - |
| Servicios | Ver órdenes de servicio | T | T | T | - | P | T |
| Servicios | Crear órdenes de servicio (incluye las solicitudes) | T | - | T | - | P | - |
| Servicios | Asignar, ejecutar y cerrar | T | - | T | - | - | - |
| Servicios | Cancelar | T | - | T | - | P | - |
| Servicios | Aprobar una orden de servicio con costo | T | T | - | - | - | - |
| Datos | Importar (S) | T | - | - | - | - | - |
| Datos | Exportar a Excel (S) | T | - | - | - | - | - |
| Auditoría | Ver la auditoría (S) | T | T | - | - | - | - |

Notas de la matriz:
- Jefatura TI "ve todo" menos lo que es sensible por separado y se le dio explícitamente: precios y auditoría sí; datos personales sí; claves de licencia no.
- Almacén ve las órdenes de compra para saber qué esperar, pero no ve precios.
- Solicitante no ve precios [SUPUESTO S-15]: crea la orden con SKU y cantidades; quien la edita completa los precios.
- El Administrador tiene todos los permisos, pero la separación de funciones lo limita igual (RF-ROL-009).
- El Administrador de plataforma no aparece: no pertenece a ninguna empresa (sección 6).

## 8. Personas que reciben equipos

Basado en D-006. Etapa 2.

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-PER-001 | Existe el directorio de **Personas** (empleados o custodios), distinto de los usuarios. Los activos se asignan a Personas. | 2 | CA-016 |
| RF-PER-002 | Una Persona puede estar o no vinculada a un usuario. | 2 | CA-016 |
| RF-PER-003 | Datos mínimos de una Persona: nombre, área y correo (el correo es opcional). | 2 | CA-016 |
| RF-PER-004 | No se guarda documento de identidad, dirección ni teléfono personal en la v1. | 2 | CA-016 |
| RF-PER-005 | Una Persona nunca se borra; se desactiva, y sus datos personales se anonimizan pasado el plazo de la sección 18. | 2 | CA-045 |
| RF-PER-006 | **No se puede desactivar a una Persona con activos asignados** hasta reasignarlos o registrar su devolución. El sistema avisa y bloquea. | 4 | CA-016 |
| RF-PER-007 | Las órdenes abiertas de una Persona desactivada se reasignan o se cancelan con motivo. | 5 | CA-052 |
| RF-PER-008 | Las Personas son de cada empresa. El mismo nombre en dos empresas son dos registros independientes. | 2 | CA-001 |
| RF-PER-009 | Ver una Persona y sus asignaciones es el permiso sensible "ver datos personales". | 2 | CA-011 |
| RF-PER-010 | Las Personas se crean a mano o por la importación (sección 15). | 2 | CA-038 |

## 9. Catálogos, categorías y campos personalizados

Basado en D-005 y D-008. Etapa 2.

### 9.1 Catálogos

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-CAT-001 | Marca, modelo (depende de una marca), proveedor, ubicación, centro de costo y unidad de medida son catálogos con datos propios. | 2 | CA-048 |
| RF-CAT-002 | El administrador puede crear catálogos nuevos sin ayuda técnica. Son listas simples y sirven para los campos de tipo lista. | 2 | CA-020 |
| RF-CAT-003 | Los catálogos son de cada empresa. No se comparten entre empresas. | 2 | CA-001 |
| RF-CAT-004 | Un valor de catálogo no se borra: se desactiva. Un valor inactivo no se puede elegir en registros nuevos y sigue visible en los registros antiguos. | 2 | CA-045 |
| RF-CAT-005 | La unidad de medida es un catálogo por empresa con la marca "admite decimales" (cable por metro sí; laptop no). No hay conversiones entre unidades en la v1. | 2 | CA-032 |
| RF-CAT-006 | La ubicación es una lista simple, sin niveles, en la v1 [SUPUESTO S-06]. | 2 | CA-048 |

### 9.2 Categorías

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-CAT-007 | Una categoría tiene nombre y prefijo para los códigos (`LAP`, `CEL`, `PER`, `LIC`). | 2 | CA-017 |
| RF-CAT-008 | El prefijo tiene de 2 a 5 caracteres (letras o números, en mayúsculas) y es único dentro de la empresa [SUPUESTO S-07]. | 2 | CA-017 |
| RF-CAT-009 | Hay un solo nivel de subcategoría (Categoría > Subcategoría). La subcategoría usa el prefijo de su categoría principal. | 2 | CA-017 |
| RF-CAT-010 | La subcategoría hereda los campos de la categoría principal y puede sumar los suyos. | 2 | CA-020 |
| RF-CAT-011 | Cambiar el prefijo de una categoría no cambia los códigos de los SKU ya creados. | 2 | CA-019 |

### 9.3 Campos personalizados

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-CAT-012 | Cada categoría puede definir campos personalizados, que heredan todos sus SKU. Tipos permitidos: texto, número, fecha, lista de opciones, sí/no. | 2 | CA-020 |
| RF-CAT-013 | Cada campo es obligatorio u opcional. | 2 | CA-020 |
| RF-CAT-014 | Cada campo declara a qué se aplica: **al artículo (SKU)** (RAM, disco, procesador) o **a cada unidad** (IMEI, número de línea, vencimiento de una clave de licencia). | 2 | CA-020 |
| RF-CAT-015 | Los campos "a cada unidad" solo existen para SKU controlados por serie. En un SKU por cantidad todo campo es del artículo. | 2 | CA-020 |
| RF-CAT-016 | El servidor valida cada valor según la definición del campo (tipo, obligatorio, opción existente); la pantalla no basta. | 2 | CA-020 |
| RF-CAT-017 | Un campo que ya tiene datos no se borra: se desactiva. | 2 | CA-021 |
| RF-CAT-018 | No se cambia el tipo de un campo que ya tiene datos. | 2 | CA-021 |
| RF-CAT-019 | Un campo que se vuelve obligatorio no bloquea lo que ya existe: esos registros quedan marcados "pendiente de completar". | 2 | CA-021 |
| RF-CAT-020 | Las opciones de una lista que estén en uso se desactivan, no se borran. | 2 | CA-021 |
| RF-CAT-021 | Cada campo tiene un identificador interno estable; cambiarle el nombre no rompe los datos. | 2 | CA-021 |
| RF-CAT-022 | Los campos de tipo número admiten decimales y pueden tener mínimo y máximo. Los de tipo fecha son fechas de calendario, sin hora. Los textos tienen un largo máximo (ver S-08). | 2 | CA-020 |
| RF-CAT-023 | Proveedor, ubicación y centro de costo pueden tener un **código externo** opcional (por ejemplo el que usa SAP). Es solo un dato; no se valida contra ningún sistema externo [SUPUESTO S-25]. | 2 | CA-017 |
| RF-CAT-024 | Un centro de costo puede indicar una **Persona responsable** (opcional) [SUPUESTO S-25]. | 2 | CA-016 |

Ejemplos: Laptop (del artículo) → RAM, disco, procesador. Celular (de la unidad) → IMEI, número de línea. Licencia (de la unidad) → fecha de vencimiento, número de puestos.

## 10. Maestro de artículos (SKU)

Basado en D-007, D-008, D-011. Etapa 3.

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-SKU-001 | Cada SKU tiene: código, nombre, categoría (o subcategoría), marca, modelo, unidad de medida, estado (activo/inactivo), modo de control (por serie o por cantidad) y los campos del artículo de su categoría. | 3 | CA-017 |
| RF-SKU-002 | El código es único dentro de la empresa, sin distinguir mayúsculas ni espacios (`lap-0001` y `LAP-0001` son el mismo). Otra empresa puede tener el mismo código. | 3 | CA-017 |
| RF-SKU-003 | El código automático es el prefijo de la categoría más un correlativo con mínimo de 4 dígitos (`LAP-0001`, `LAP-0002`). El ancho es un mínimo, no un tope: pasar de 9999 no rompe nada. | 3 | CA-018 |
| RF-SKU-004 | Un código no se reutiliza nunca, aunque el SKU se desactive. Pueden quedar saltos; lo que se garantiza es que **nunca se repite**, aunque varias personas creen SKU a la vez. | 3 | CA-018 |
| RF-SKU-005 | Escribir un código propio (por ejemplo el de SAP) es un permiso aparte. El código escrito a mano no mueve el contador; el automático salta los códigos ya ocupados. | 3 | CA-019 |
| RF-SKU-006 | El código no se edita cuando el SKU ya tiene movimientos o activos. | 3 | CA-019 |
| RF-SKU-007 | No se puede cambiar el modo de control ni la categoría de un SKU que ya tiene activos o stock. | 3 | CA-022 |
| RF-SKU-008 | Un SKU con serie siempre es de a 1 unidad. | 3 | CA-022 |
| RF-SKU-009 | Un SKU por serie no acepta unidades sin serie, salvo que el SKU lo autorice expresamente [SUPUESTO S-09]. | 3 | CA-023 |
| RF-SKU-010 | Un SKU inactivo no se puede usar en órdenes ni recepciones nuevas; sigue visible en el historial. Desactivarlo no altera sus activos ni su stock. | 3 | CA-032 |
| RF-SKU-011 | El SKU no tiene precio fijo: el precio vive en la línea de la orden de compra. | 3 | CA-032 |
| RF-SKU-012 | Desde un SKU se pueden ver todas sus series, su stock por ubicación, sus órdenes de compra y su historial. | 3 | CA-048 |
| RF-SKU-013 | Las licencias no son un tipo especial. Si se controlan por serie, cada clave es una serie; una clave con 50 puestos es **una** serie con un campo de unidad "número de puestos" y su propia fecha de vencimiento. Si solo importa el total, se controlan por cantidad. | 3 | CA-020 |
| RF-SKU-014 | Las claves de licencia son secretos: se guardan cifradas, se muestran enmascaradas, verlas completas exige un permiso aparte y esa consulta queda en la auditoría. Nunca aparecen en claro en la auditoría ni en los registros técnicos. | 4 | CA-042 |
| RF-SKU-015 | En la v1 no se asigna cada puesto de una licencia a una persona; basta el total de puestos. | 3 | CA-020 |
| RF-SKU-016 | Un SKU puede tener un **stock mínimo** opcional. En la v1 es solo un dato: no genera avisos ni bloquea salidas [SUPUESTO S-26]. | 3 | CA-020 |

## 11. Inventario

Basado en D-009, D-010, D-012. Etapa 4.

### 11.1 Activos (control por serie)

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-INV-001 | Cada unidad se registra como un activo con: serie, SKU, estado, ubicación, responsable (solo cuando está Asignado), fecha de compra, fin de garantía, orden de compra de origen (opcional, los activos del Excel no la tienen), costo de compra y moneda, y los campos "a cada unidad" de su categoría. | 4 | CA-024 |
| RF-INV-002 | La serie es única por empresa y SKU, comparada sin distinguir mayúsculas ni espacios al inicio o al final. Repetida en el mismo SKU: se rechaza siempre. | 4 | CA-023 |
| RF-INV-003 | Si la serie ya existe en otro SKU de la misma empresa, se acepta con un aviso visible que dice dónde está. | 4 | CA-023 |
| RF-INV-004 | Una unidad física es un solo registro para siempre. Nunca se crea un segundo registro con la misma serie. | 4 | CA-028 |
| RF-INV-005 | El sistema avisa cuando una serie parece dañada por Excel (notación científica como 3,5E+14, ceros a la izquierda perdidos). | 4 | CA-038 |
| RF-INV-006 | Una serie vacía solo se acepta si el SKU lo autoriza (RF-SKU-009). | 4 | CA-023 |
| RF-INV-007 | Corregir una serie ya registrada exige permiso y motivo; el historial guarda el valor anterior y el nuevo. | 4 | CA-036 |
| RF-INV-008 | Garantía: se guarda la fecha de fin. Los avisos de vencimiento quedan fuera de la v1. | 4 | CA-046 |

### 11.2 Estados del activo

Lista cerrada y fija en el sistema. No se agregan estados por empresa.

| Estado | Significado |
|---|---|
| En stock | Disponible en una ubicación. |
| Asignado | Entregado a una Persona (responsable). Incluye los préstamos con fecha de devolución prevista. |
| En reparación | Fuera de servicio por reparación. |
| Extraviado o robado | Perdido; sigue en el registro. |
| De baja | Retirado definitivamente. |

Transiciones permitidas (el servidor rechaza cualquier otra):

| Desde | Hacia | Condición |
|---|---|---|
| En stock | Asignado | A una Persona activa. |
| Asignado | En stock | Con devolución registrada. |
| En stock o Asignado | En reparación | Sin condición especial. |
| En reparación | En stock o Asignado | Sin condición especial. |
| Cualquiera | Extraviado o robado | Motivo obligatorio. |
| Cualquiera | De baja | Motivo obligatorio. |
| De baja o Extraviado o robado | En stock | Solo como **reingreso**: motivo obligatorio y permiso especial. Es el mismo registro. |

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-INV-009 | Los 5 estados son una lista cerrada. "Prestado" no es un estado; "En tránsito" no existe en la v1. | 4 | CA-024 |
| RF-INV-010 | Las transiciones de la tabla se comprueban en el servidor. | 4 | CA-024 |
| RF-INV-011 | El motivo es obligatorio en baja, extravío, reingreso, ajuste de stock y corrección de series. En el resto es opcional. | 4 | CA-024 |
| RF-INV-012 | Abrir o cerrar una orden de servicio no cambia el estado del activo; el técnico lo cambia a mano. | 6 | CA-044 |

### 11.3 Asignación, devolución y constancia

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-INV-013 | Un activo se asigna a una Persona. No se asigna un activo De baja, Extraviado o ya asignado a otra persona; el sistema impide dos asignaciones activas a la vez, incluso con dos técnicos a la vez. | 4 | CA-025 |
| RF-INV-014 | Un equipo de uso compartido (una sala, un área) se asigna a una Persona custodio [SUPUESTO S-10]. | 4 | CA-025 |
| RF-INV-015 | Cada asignación y devolución es una fila de historial: desde, hasta, estado en que se devuelve. | 4 | CA-025 |
| RF-INV-016 | La constancia de entrega y devolución es un registro en el sistema (activo, serie, persona, fecha, estado en que se entrega, quién entrega) más un **acta imprimible en PDF** para firmar en papel. | 4 | CA-046 |
| RF-INV-017 | La aceptación en pantalla del receptor y la subida del escaneo del acta quedan fuera de la v1. | 4 | CA-046 |
| RF-INV-018 | Cada ingreso, asignación, traslado, reparación, baja, extravío y reingreso queda en el historial con fecha, usuario y motivo (cuando aplica). | 4 | CA-024 |

### 11.4 Stock (control por cantidad)

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-INV-019 | El stock se lleva por SKU y ubicación. Todo cambio es un movimiento: ingreso, salida, traslado, ajuste o saldo inicial. | 4 | CA-026 |
| RF-INV-020 | **El stock no puede quedar negativo**, aunque dos personas saquen a la vez. | 4 | CA-026 |
| RF-INV-021 | Las correcciones son ajustes con motivo obligatorio; nunca se edita el saldo. | 4 | CA-026 |
| RF-INV-022 | El traslado entre ubicaciones es inmediato: sale de origen y entra a destino en el mismo acto. Un traslado a la misma ubicación se rechaza. | 4 | CA-027 |
| RF-INV-023 | Las cantidades son enteras, salvo en las unidades de medida que admiten decimales. | 4 | CA-032 |

## 12. Órdenes de compra

Basado en D-013, D-014, D-015 y en la propuesta del Auditor de Cumplimiento (`docs/equipo/mesa-001/propuesta-r4-cumplimiento.md`). Etapa 5.

### 12.1 La orden y sus datos

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-OC-001 | No existe un documento de "solicitud" aparte: la solicitud de compra es una orden en Borrador creada por el Solicitante. | 5 | CA-029 |
| RF-OC-002 | La orden se hace sobre SKU (cantidad y precio por línea), no sobre series. | 5 | CA-032 |
| RF-OC-003 | La orden tiene número correlativo por empresa, que nunca se repite. | 5 | CA-018 |
| RF-OC-004 | Debe tener al menos una línea; cantidad mayor que 0; precio no negativo; el mismo SKU no se repite en dos líneas; no se aceptan SKU ni proveedores inactivos. | 5 | CA-032 |
| RF-OC-005 | Cada empresa define una moneda base. Cada orden lleva **una** moneda (código de 3 letras) y el importe siempre se guarda junto a su moneda. No hay conversión automática. | 5 | CA-031 |
| RF-OC-006 | El precio unitario se ingresa sin impuesto, con hasta 4 decimales. El impuesto es un porcentaje por línea, guardado en la línea al momento de la compra. El sistema calcula impuesto y total. Los importes son decimales exactos. | 5 | CA-032 |
| RF-OC-007 | Cada orden puede indicar un centro de costo (opcional) [SUPUESTO S-23]. | 5 | CA-032 |
| RF-OC-008 | Una orden en Borrador creada por un Solicitante lleva SKU y cantidades; el precio lo completa quien edita la orden [SUPUESTO S-15]. | 5 | CA-029 |
| RF-OC-009 | "Emitida" solo cambia el estado; el sistema no envía correo al proveedor. Se ofrece una vista imprimible o PDF de la orden para enviarla a mano. | 5 | CA-029 |
| RF-OC-042 | Cada orden puede llevar una **referencia externa** opcional (por ejemplo el número de documento de SAP). Es texto libre; no se valida contra ningún sistema externo [SUPUESTO S-24]. | 5 | CA-032 |
| RF-OC-010 | Una orden Recibida o Cerrada no se edita; se corrige con una reversión de recepción (RF-OC-032) o un ajuste de inventario, que quedan en la auditoría. | 5 | CA-036 |

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
| Borrador | Pendiente de aprobación | Quien la creó, o quien tenga permiso de editar | Tiene al menos una línea y la empresa exige aprobación para ese monto. |
| Borrador | Aprobada | Automático | Cuando no se exige aprobación (sección 12.3). El estado Pendiente no aparece. |
| Borrador | Anulada | Quien la creó o con permiso de anular | Motivo obligatorio. |
| Pendiente de aprobación | Aprobada | Un aprobador distinto de quien la creó o editó | Se guarda quién aprobó y por qué monto. |
| Pendiente de aprobación | Rechazada | Un aprobador distinto de quien la creó | Motivo obligatorio. Queda visible con el motivo. |
| Pendiente de aprobación | Borrador | Quien la creó (retira la solicitud) | Queda en la auditoría [SUPUESTO S-11]. |
| Rechazada | Pendiente de aprobación | Quien la creó, o con permiso de editar | Al corregirla. El historial del rechazo se conserva. |
| Rechazada | Anulada | Quien la creó o con permiso de anular | Motivo obligatorio. |
| Aprobada | Emitida | Con permiso de emitir | Sin cambios pendientes. |
| Aprobada o Emitida | Pendiente de aprobación | Automático | Cuando alguien cambia precio, cantidad, proveedor o total. Se anula la aprobación anterior. |
| Aprobada | Anulada | Con permiso de anular | Motivo obligatorio. |
| Emitida | Anulada | Con permiso de anular | Motivo obligatorio. Solo si no hay recepciones. |
| Emitida | Recibida parcial | Quien reciba (sección 13) | La primera recepción confirmada no completa lo pedido. |
| Emitida | Recibida total | Quien reciba | La recepción completa todo lo pedido. |
| Recibida parcial | Recibida parcial o Recibida total | Quien reciba | Cada recepción se registra por separado. |
| Recibida parcial | Cerrada | Con permiso de cerrar | Cierre manual con motivo, cuando el proveedor ya no enviará lo pendiente. |
| Recibida total | Cerrada | Automático | En el mismo acto de la última recepción [SUPUESTO S-12]; el historial registra los dos cambios. |

No existe ninguna otra transición. **Anulada** y **Cerrada** son estados finales; la única salida de Cerrada es la reversión de una recepción (RF-OC-032, S-13). **Rechazada** no es final: permite corregir y reenviar.

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-OC-011 | Las transiciones de la tabla se comprueban en el servidor y no hay otras. | 5 | CA-029 |
| RF-OC-012 | Toda transición registra quién, cuándo y motivo. El motivo es obligatorio al rechazar, anular y cerrar a mano. | 5 | CA-037 |
| RF-OC-013 | Una orden con recepción parcial no se anula: se cierra. | 5 | CA-037 |
| RF-OC-014 | Cambiar precio, cantidad, proveedor o total de una orden Aprobada o Emitida la devuelve a Pendiente de aprobación y anula la aprobación anterior. | 5 | CA-030 |

### 12.3 Aprobación por monto

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-OC-015 | La aprobación tiene **un solo nivel** en la v1: cada empresa fija un monto límite en su moneda base. Las órdenes que superan el límite necesitan la aprobación de un rol con permiso de aprobar. | 5 | CA-031 |
| RF-OC-016 | Si el límite es cero, todas las órdenes pasan por aprobación. Si la empresa desactiva la aprobación, ninguna pasa. | 5 | CA-031 |
| RF-OC-017 | El monto que se compara con el límite es el total de la orden con impuestos [SUPUESTO S-14]. | 5 | CA-031 |
| RF-OC-018 | Una orden en una moneda distinta de la base siempre pasa por aprobación. | 5 | CA-031 |
| RF-OC-019 | El valor del monto límite lo configura cada empresa; no hace falta conocerlo para construir (P-001). | 5 | CA-031 |
| RF-OC-020 | Sin varios niveles ni reglas por tipo de orden en la v1. | 5 | CA-031 |

### 12.4 Separación de funciones

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-OC-021 | Quien crea o edita una orden no puede aprobarla. | 5 | CA-012 |
| RF-OC-022 | Nadie aprueba ni rechaza su propia solicitud. | 5 | CA-012 |
| RF-OC-023 | Quien aprueba una orden no puede recibir la mercadería de esa misma orden. | 5 | CA-013 |
| RF-OC-024 | Quien recibe la mercadería no puede haber creado ni aprobado esa orden. | 5 | CA-013 |
| RF-OC-025 | Estas cuatro reglas las hace cumplir el sistema en el servidor y valen para todos los roles, incluido el Administrador. | 5 | CA-012 |
| RF-OC-026 | **Excepción configurable por empresa**, desactivada por defecto, para empresas con una sola persona de TI. Solo un Administrador la puede activar. Mientras esté activa se muestra un aviso visible en cada orden en que se use, y cada uso queda en la auditoría (quién, cuándo, monto, orden). | 5 | CA-014 |
| RF-OC-027 | Crear o editar proveedores es un permiso distinto del de crear órdenes. | 1 | CA-011 |
| RF-OC-028 | Dar de baja un activo de valor con una segunda persona queda fuera de la v1; la baja con motivo obligatorio y la auditoría la cubren. Se revisa en la Etapa 7 (P-009). | 7 | CA-024 |

## 13. Recepción de mercadería

Basado en D-016 y D-017. Etapa 5.

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-OC-029 | La recepción es un documento propio con líneas. Una orden puede tener varias recepciones; la cantidad recibida de una línea es la suma de las recepciones confirmadas. | 5 | CA-033 |
| RF-OC-030 | **No se puede recibir más de lo pendiente.** Los sobrantes se manejan fuera de la orden. Mercadería dañada o devuelta al proveedor queda fuera de la v1. | 5 | CA-034 |
| RF-OC-031 | En un SKU con serie, confirmar exige que la cantidad de series capturadas sea igual a la cantidad recibida. Si faltan series, se guarda como **borrador de recepción** (se puede salir y volver sin perder lo capturado) o se recibe solo lo que ya tiene series; lo no recibido sigue pendiente en la orden. | 5 | CA-034 |
| RF-OC-032 | Una recepción confirmada por error se puede **revertir** con un movimiento contrario y motivo, solo mientras ninguno de sus activos haya sido asignado, movido o puesto en reparación. Pasado eso se corrige con baja y nueva entrada. Revertir reabre la orden al estado que corresponda (Recibida parcial o Emitida) [SUPUESTO S-13]. | 5 | CA-036 |
| RF-OC-033 | **Confirmar es todo o nada**: si una serie falla, no se crea ningún activo. Un doble clic en "Confirmar" no crea los activos dos veces. | 5 | CA-034 y CA-035 |
| RF-OC-034 | Dos personas recibiendo la misma orden a la vez no pueden pasarse de lo pendiente. | 5 | CA-035 |
| RF-OC-035 | Al confirmar, los activos se crean automáticamente en el inventario con su costo y moneda. En un SKU por cantidad se suma al stock. | 5 | CA-033 |
| RF-OC-036 | Al recibir se indica la ubicación de ingreso. Ubicación, fecha de compra y garantía se piden una sola vez para todo el lote. | 5 | CA-033 |
| RF-OC-037 | Las series se pueden pegar en lista (una por línea, o separadas por coma o espacio), teclear fila por fila o escanear con lector de código de barras. | 5 | CA-034 |
| RF-OC-038 | La validación es inmediata y con texto claro: "repetida en la fila 12", "ya existe en el SKU X". Los espacios sobrantes y las mayúsculas se limpian solos y se avisa. Las filas vacías se ignoran. | 5 | CA-034 |
| RF-OC-039 | Los campos "a cada unidad" (IMEI, línea) se piden en la misma tabla, pero se pueden completar después. | 5 | CA-020 |
| RF-OC-040 | Antes de confirmar hay un resumen ("Se crearán 38 activos de LAP-0001 en Bodega Central. Faltan 2 por registrar"). | 5 | CA-033 |
| RF-OC-041 | Nunca se borra una recepción ni un activo. | 5 | CA-045 |

## 14. Órdenes de servicio

Basado en D-027. Etapa 6. Se diseñan en detalle en la Etapa 6, desacopladas del inventario hasta entonces. Esto **no bloquea** las Etapas 1 a 5.

```
Creada -> Asignada -> En ejecución -> Cerrada
(Cancelada en cualquier punto antes de cerrar)
```

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-OS-001 | Una solicitud de servicio es una orden de servicio en estado Creada. | 6 | CA-044 |
| RF-OS-002 | Se registra quién la solicita, el tipo de servicio, el activo relacionado (opcional) y a quién se asigna. | 6 | CA-044 |
| RF-OS-003 | Los tipos de servicio son un catálogo configurable. Propuesta de partida: Reparación, Instalación y Servicio externo. | 6 | CA-044 |
| RF-OS-004 | Quien ejecuta puede ser una persona de la empresa o un proveedor del catálogo (son dos destinos distintos). | 6 | CA-044 |
| RF-OS-005 | La orden de servicio tiene número correlativo por empresa que nunca se repite. | 6 | CA-018 |
| RF-OS-006 | Una orden puede cancelarse antes de cerrar. Una orden cerrada no se reabre: se crea una nueva. | 6 | CA-044 |
| RF-OS-007 | Abrir o cerrar la orden no cambia el estado del activo. | 6 | CA-044 |
| RF-OS-008 | La aprobación se exige solo si el servicio tiene costo. Una orden "tiene costo" cuando su costo estimado es mayor que cero, y usa el mismo límite y las mismas reglas de separación de funciones que las compras [SUPUESTO S-16]. | 6 | CA-044 |
| RF-OS-009 | Si el activo relacionado se da de baja, la orden abierta sigue su curso y muestra el aviso; no se cancela sola. | 6 | CA-044 |

## 15. Importación del Excel de inventario actual

Basado en D-020. Etapa 4. Depende de ver el Excel real (P-002).

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-IMP-001 | La importación entra en la v1 para cargar el inventario actual (activos, stock inicial y personas). | 4 | CA-038 |
| RF-IMP-002 | Pasos: plantilla con columnas fijas, subir el archivo, **vista previa** con el error de cada fila (número de fila, columna y motivo en español claro), confirmar. No se guarda nada hasta confirmar. | 4 | CA-038 |
| RF-IMP-003 | **Todo o nada por lote**: si hay una fila con error, no se carga nada hasta corregir. El usuario descarga el reporte de errores y vuelve a subir. | 4 | CA-038 |
| RF-IMP-004 | Volver a subir el mismo archivo no duplica lo ya cargado. | 4 | CA-038 |
| RF-IMP-005 | Cada importación se registra como un lote (quién, cuándo, archivo, filas) y se puede **deshacer completa** mientras no tenga movimientos posteriores. | 4 | CA-038 |
| RF-IMP-006 | Los valores desconocidos (marcas, ubicaciones nuevas) no se crean solos: se listan para que el administrador los apruebe de una vez. | 4 | CA-038 |
| RF-IMP-007 | El stock inicial de los SKU por cantidad entra como movimiento "saldo inicial" por ubicación. | 4 | CA-038 |
| RF-IMP-008 | Los textos libres de estado del Excel se asocian a los 5 estados del activo en la vista previa; los que no se puedan asociar son error. | 4 | CA-038 |
| RF-IMP-009 | Solo se aceptan archivos .xlsx y .csv, hasta 5.000 filas y 10 MB por archivo, y hasta 10 importaciones por día por empresa [SUPUESTO S-17]. Se valida el contenido real del archivo, no solo la extensión. | 4 | CA-039 |
| RF-IMP-010 | Las celdas que empiezan con `=`, `+`, `-` o `@` se tratan como texto al importar y al exportar. | 4 | CA-039 |
| RF-IMP-011 | La empresa de destino sale de la sesión; si el archivo trae una columna de empresa, se ignora. | 4 | CA-039 |
| RF-IMP-012 | El archivo original se borra a los 30 días como máximo; quedan el resultado y el reporte de errores. | 4 | CA-039 |
| RF-IMP-013 | Importar es un permiso sensible, activado solo para el Administrador. | 4 | CA-011 |
| RF-IMP-014 | El Excel real se entrega con los nombres de personas reemplazados (P-002). | 0 | CA-038 |

## 16. Auditoría

Basado en D-018 y D-019. Etapa 1: se construye como mecanismo general para que todas las etapas siguientes lo usen.

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-AUD-001 | La auditoría **solo se agrega**: no se edita ni se borra desde la aplicación, ni siquiera por el Administrador. | 1 | CA-040 |
| RF-AUD-002 | La auditoría se escribe en la misma operación que el cambio: si el cambio ocurre, la auditoría existe; si falla, no queda un cambio sin rastro. | 1 | CA-040 |
| RF-AUD-003 | Cada entrada guarda: quién, cuándo, qué empresa, qué registro, qué acción, valor anterior y nuevo, motivo cuando aplique, y desde dónde (IP) si se puede. | 1 | CA-041 |
| RF-AUD-004 | Se registran como mínimo: altas, cambios (con antes y después), aprobaciones, rechazos, anulaciones, bajas y asignaciones de usuarios, personas, roles y permisos, catálogos, SKU, activos, órdenes, recepciones y configuración de aprobaciones y montos. | 1 | CA-041 |
| RF-AUD-005 | También se registran: inicios de sesión correctos y fallidos, invitaciones, cambios de empresa activa, importaciones, exportaciones, accesos del Administrador de plataforma, consultas a la clave completa de una licencia y **las consultas a la propia auditoría**. | 1 | CA-041 |
| RF-AUD-006 | No guarda contraseñas, enlaces de acceso, claves de licencia ni más datos personales de los necesarios. | 1 | CA-042 |
| RF-AUD-007 | Ven la auditoría el Administrador y Jefatura TI por defecto, con un permiso sensible separado que el administrador puede dar a otros roles. | 1 | CA-011 |
| RF-AUD-008 | La auditoría es distinta del historial de §11: el historial dice qué pasó con un activo; la auditoría dice quién tocó qué. | 1 | CA-041 |
| RF-AUD-009 | "Registro importante" significa todo lo listado en RF-AUD-004 y RF-AUD-005. | 1 | CA-041 |
| RF-AUD-010 | Los intentos rechazados por falta de permiso o por pertenecer a otra empresa también quedan en la auditoría. | 1 | CA-002 |
| RF-AUD-011 | Nada con historial se borra. Lo que tiene historia se desactiva, se anula o se da de baja, con motivo. Solo se borran de verdad los borradores que nunca tuvieron efecto. Donde la versión 0.1 decía "eliminó", ahora dice "anuló o dio de baja". | 1 | CA-045 |
| RF-AUD-012 | Los identificadores internos que se ven en la dirección web no son consecutivos ni adivinables. Los códigos para personas (SKU, número de orden) son aparte. | 1 | CA-001 |
| RF-AUD-013 | Cada entrada de auditoría indica el **tipo de autor**: "usuario" o "integración" (un programa externo que use la futura API). En la v1 todas son de tipo usuario; el dato queda previsto para no migrar después [SUPUESTO S-28]. | 1 | CA-041 |

## 17. Seguridad (RS)

Esta sección reúne los requisitos del Especialista en Seguridad. Donde ya están escritos como requisito funcional, se indica dónde; el resto se escribe aquí. Etapa 1 salvo que se indique otra.

| RS | Requisito | Dónde está |
|---|---|---|
| RS-01 a RS-05 | Sin registro abierto; correo verificado; invitaciones que vencen y se usan una vez; sin unión por dominio; correos sin distinguir mayúsculas. | RF-ACC-001 a RF-ACC-010 |
| RS-06 a RS-09 | Una cuenta y una membresía por empresa; la empresa activa la fija y comprueba el servidor; una empresa nunca ve a qué otras pertenece una persona; cambiar de empresa se registra y no arrastra datos. | RF-ACC-011, RF-ACC-012 |
| RS-10 | Todo dato tiene empresa. La base de datos debe impedir leer o escribir datos de otra empresa aunque el código se equivoque. Hay una prueba obligatoria de aislamiento por cada tabla nueva. | RN-001, CA-001, CA-002 |
| RS-11 | Las referencias entre datos pertenecen a la misma empresa: no se puede crear una orden con un proveedor, SKU o ubicación de otra empresa aunque se conozca su identificador. | CA-003 |
| RS-12 | Si en el futuro se guardan archivos (adjuntos, importaciones), quedan separados por empresa y solo se entregan tras comprobar el acceso. | RF-IMP-012, sección 25 |
| RS-13 | Los identificadores de la dirección web no son consecutivos ni adivinables. Para un identificador de otra empresa se responde "no encontrado", igual que para uno que no existe. | RF-AUD-012, RN-011 |
| RS-14 | Todo permiso se comprueba en el servidor. | RF-ROL-010 |
| RS-15 | Siempre hay al menos un administrador activo por empresa. | RF-ROL-008 |
| RS-16 | Nadie se da permisos a sí mismo ni da más de los que tiene. | RF-ROL-007 |
| RS-17 | Los roles iniciales traen su lista exacta de permisos; los permisos sensibles son separados. | Sección 7.3 |
| RS-18 | Separación de funciones en compras. (La propuesta de Seguridad de autoaprobar bajo un monto se descartó por D-015: se usa la excepción por empresa y auditada.) | RF-OC-021 a RF-OC-026 |
| RS-19 a RS-21 | Administrador de plataforma sin acceso a datos del negocio; soporte solo con autorización de la empresa y vencimiento corto; pocas cuentas con segunda verificación; nadie entra directo a la base de datos de producción. | Sección 6 |
| RS-22 | Retirado por D-002: no hay contraseñas en la v1. | RF-ACC-005 |
| RS-23 | Protección contra intentos repetidos; el error nunca dice si el correo existe. | RF-ACC-017 |
| RS-24 | Reemplazado por D-002: el enlace de acceso dura pocos minutos y sirve una sola vez. | RF-ACC-006 |
| RS-25 | Las sesiones vencen por inactividad y por tiempo total; hay cerrar sesión en todos los dispositivos. | RF-ACC-014, RF-ACC-015 |
| RS-26 | Dar de baja o suspender a un usuario termina sus sesiones en esa empresa al instante. | RF-ACC-016 |
| RS-27 | Segunda verificación obligatoria para administradores. | RF-ACC-013 |
| RS-28 | La recuperación del único administrador la hace el Administrador de plataforma, con verificación por otro medio, y queda en auditoría. | RF-ACC-019 |
| RS-29 a RS-35 | Importaciones: permiso aparte, tipos y tamaños permitidos, vista previa, fórmulas como texto, empresa desde la sesión, límites por día, archivo original borrado. | RF-IMP-009 a RF-IMP-013 |
| RS-36 a RS-39 | Auditoría que solo se agrega, con eventos mínimos de seguridad, sin contraseñas ni datos de más, y nada con historial se borra. | Sección 16 |
| RS-40 | Secretos y claves nunca en el repositorio; cada entorno tiene los suyos. Ningún dato personal real en desarrollo ni en pruebas. | Sección 18, RF-DAT-010 |
| RS-41 | Los errores que ve el usuario no revelan detalles internos ni datos personales. | RNF-009 |
| RS-42 | Todo texto que escribe un usuario se trata como texto, nunca como código, para evitar scripts maliciosos en pantalla. | CA-039 |
| RS-43 | Antes de cada liberación se revisan las dependencias con vulnerabilidades conocidas. | Sección 19 |
| RS-44 | Respaldos cifrados, con prueba de restauración, y restauración que no mezcle datos de empresas. | Sección 19 |

## 18. Datos personales y retención

Basado en D-024. **Todos los plazos son una propuesta provisoria hasta que legal los confirme. No se activa ninguna anonimización automática antes de esa confirmación.** Ver sección 24, puntos L1 a L6 e I1.

### 18.1 Qué datos personales se guardan

| Dato | Finalidad | Quién lo ve | Plazo propuesto |
|---|---|---|---|
| Nombre y correo de un usuario | Entrar a la plataforma; saber quién hizo qué | Administrador y Jefatura TI de su empresa; el propio usuario | Mientras sea usuario; 2 años tras la baja y luego se anonimiza |
| Nombre, área y correo de una Persona | Saber quién tiene cada equipo | Quien tenga "ver datos personales" | Mientras exista; 2 años tras la baja y luego se anonimiza |
| Rol del usuario en la empresa | Controlar permisos | Administrador | Mientras sea usuario |
| Activos asignados e historial de asignaciones | Saber dónde está cada equipo; constancia de entrega | Quien tenga "ver datos personales" | Mientras exista el activo más el plazo de auditoría |
| IMEI y número de línea de un celular asignado | Identificar el equipo y su línea | Quien tenga "ver datos personales" | Igual que la asignación |
| Registro de accesos (inicios de sesión, IP) | Seguridad y auditoría | Quien tenga "ver auditoría" | Plazo de la auditoría |
| Aceptación del aviso de privacidad | Constancia de consentimiento | Administrador | Mientras exista la cuenta |

### 18.2 Reglas

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RF-DAT-001 | No se guardan documento de identidad, dirección ni teléfono personal en la v1, salvo decisión expresa. | 1 | CA-052 |
| RF-DAT-002 | **Auditoría: 5 años.** **[ESCALAR AL CEO]** confirmar con legal (L2). | 7 | CA-040 |
| RF-DAT-003 | **Datos personales de una persona o usuario dado de baja: 2 años; luego se anonimiza.** El nombre y el correo se reemplazan por una referencia como "Persona dada de baja 0042"; el historial de activos se conserva. **[ESCALAR AL CEO]** por ser irreversible (I1) y legal (L2). | 7 | CA-052 |
| RF-DAT-004 | Archivos de importación: máximo 30 días. | 4 | CA-039 |
| RF-DAT-005 | Respaldos: mismo plazo y mismas protecciones que los datos. Al restaurar un respaldo antiguo se vuelve a aplicar la anonimización pendiente (procedimiento a definir con DevOps). | 7 | CA-052 |
| RF-DAT-006 | Constancias de entrega y devolución: mientras exista el activo más el plazo de auditoría. | 4 | CA-046 |
| RF-DAT-007 | Debe poder atenderse una solicitud de acceso, corrección o eliminación de datos personales: quién la recibe, en cuánto tiempo y qué se entrega. Se puede exportar y anonimizar a una persona sin romper el historial. **[ESCALAR AL CEO]** el procedimiento y los plazos los define legal (L5). | 7 | CA-052 |
| RF-DAT-008 | Los datos personales no aparecen en mensajes de error ni en registros técnicos. | 1 | CA-039 |
| RF-DAT-009 | Los datos personales de una empresa nunca se muestran a otra. Un administrador solo ve de un usuario lo necesario para su empresa (nombre, correo, rol en esa empresa). | 1 | CA-004 |
| RF-DAT-010 | Ningún dato personal real en el repositorio ni en el entorno de pruebas. El Excel, la OC y la OS reales se entregan con nombres reemplazados, o se guardan en un lugar controlado fuera del repositorio que definen DevOps y Seguridad. | 0 | CA-038 |

## 19. Requisitos de calidad, uso y continuidad

Basado en D-021 y D-029.

| ID | Requisito | Etapa | CA |
|---|---|---|---|
| RNF-001 | El idioma de la plataforma es español. | 1 | CA-050 |
| RNF-002 | Cada empresa tiene su zona horaria. Las fechas de garantía y vencimiento son fechas de calendario (sin hora). Los momentos exactos se guardan en hora universal y se muestran en la zona de la empresa. Formato de fecha día/mes/año [SUPUESTO S-21]. | 1 | CA-046 |
| RNF-003 | Funciona en computador, tablet y celular. La recepción y la búsqueda de activos se diseñan para pantalla pequeña. | 4 | CA-050 |
| RNF-004 | Modo claro y oscuro, uso por teclado, y estados con texto (no solo con color). | 1 | CA-050 |
| RNF-005 | El lector de código de barras se soporta como entrada: escribe como un teclado y el cursor salta a la siguiente fila. La impresión de etiquetas, los códigos QR y el escaneo con la cámara quedan fuera de la v1. | 5 | CA-034 |
| RNF-006 | Toda lista tiene buscador, filtros (estado, ubicación, categoría) y exportación a Excel. La exportación es un permiso aparte y queda en la auditoría. | 2 | CA-043 |
| RNF-007 | Hay un buscador global (SKU, serie, activo, orden). Solo encuentra lo de la empresa activa y lo que el rol permite ver. | 4 | CA-048 |
| RNF-008 | Cada rol ve al entrar una pantalla de inicio propia: Almacén "por recibir"; Técnico "mi trabajo"; Jefatura TI "por aprobar"; Solicitante "mis solicitudes"; Administrador "resumen de la empresa"; Solo lectura "buscador". | 1 | CA-050 |
| RNF-009 | Los textos de error son claros y no muestran detalles internos ni datos personales. | 1 | CA-039 |
| RNF-010 | Volumen asumido hasta que haya cifras (P-003): hasta unos cientos de miles de activos por empresa sin infraestructura especial. Se mide cuando haya datos. | 7 | CA-053 |
| RNF-011 | Objetivo de rendimiento: con 100.000 activos, el 95 % de las listas y búsquedas responde en menos de 2 segundos, y confirmar una recepción de 100 series tarda menos de 5 segundos [SUPUESTO S-19]. | 7 | CA-053 |
| RNF-012 | Disponibilidad: sin compromiso de funcionar 24 horas en la v1; los mantenimientos se avisan [SUPUESTO S-20]. | 7 | CA-053 |
| RNF-013 | Toda acción importante muestra una confirmación; donde se pueda, se puede corregir o deshacer. | 4 | CA-034 |
| RNF-014 | Respaldo automático diario y cifrado, con restauración probada al menos una vez antes de cada etapa que pase a uso real, sin mezclar datos de empresas. | 7 | CA-053 |
| RNF-015 | Cada despliegue tiene un plan de vuelta atrás escrito. | 7 | CA-053 |
| RNF-016 | Manual del usuario y del administrador al cierre de cada etapa; manual de operación (respaldo y restauración) antes de producción. | 7 | CA-053 |
| RNF-017 | El costo de alojamiento, respaldos y soporte se estima en la Etapa 0. **[ESCALAR AL CEO]** (sección 24, punto D2). | 0 | CA-053 |
| RNF-018 | Pasar a producción con datos reales de una empresa lo aprueba el Cliente (CEO) tras la demo, con respaldo y restauración ya probados. **[ESCALAR AL CEO]** (sección 24, punto I2). | 7 | CA-053 |

## 20. Reglas de negocio transversales

| ID | Regla |
|---|---|
| RN-001 | Todo dato de negocio pertenece a una empresa y toda consulta se filtra por la empresa de la sesión. Olvidar el filtro es un defecto grave. |
| RN-002 | Toda acción de permisos se comprueba en el servidor. |
| RN-003 | Las operaciones de varias partes (confirmar una recepción, importar un lote, trasladar stock) son todo o nada. |
| RN-004 | Los correlativos (SKU, orden de compra, orden de servicio) nunca se repiten, aunque dos personas trabajen a la vez. Pueden quedar saltos. |
| RN-005 | La serie es única por empresa y SKU. |
| RN-006 | La auditoría solo se agrega; no se edita ni se borra. |
| RN-007 | Nada con historial se borra: se desactiva, se anula o se da de baja. Solo se borran los borradores que nunca tuvieron efecto. |
| RN-008 | Hay motivo obligatorio en: baja, extravío, reingreso, ajuste de stock, corrección de series, rechazo, anulación, cierre manual y reversión de recepción. |
| RN-009 | Todo importe se guarda junto a su moneda y como decimal exacto. |
| RN-010 | Quien crea o edita una orden no la aprueba; quien aprueba no recibe; quien recibe no creó ni aprobó. La excepción es por empresa y queda en la auditoría. |
| RN-011 | Para un identificador de otra empresa se responde "no encontrado", igual que para uno que no existe. |
| RN-012 | Los códigos, series y correos se comparan sin distinguir mayúsculas ni espacios al inicio o al final. |
| RN-013 | Las fechas de garantía y vencimiento son de calendario; los momentos exactos se guardan en hora universal. |
| RN-014 | Si dos personas editan el mismo registro a la vez, a la segunda se le avisa que el registro cambió y debe revisarlo antes de guardar; no gana el último en silencio [SUPUESTO S-18]. |
| RN-015 | Un registro inactivo no se puede usar en registros nuevos, pero sigue visible en los antiguos. |
| RN-016 | Los catálogos, las personas y los usuarios de una empresa no se comparten con otra. |

## 21. Criterios de aceptación

Formato: Dado... cuando... entonces... Parten de los criterios de QA (CA-01 a CA-11 de su ronda 1), ajustados a las decisiones. QA los convierte en pruebas automáticas y completa los casos límite en `docs/calidad/`. Cada criterio indica a qué requisitos responde.

**Aislamiento y accesos**

- **CA-001 · No se lee lo de otra empresa** (RN-001, RS-10, RS-13). Dado que existen la empresa A y la B, y B tiene un SKU, un activo y una orden con identificador conocido, cuando un usuario de A los pide por listado, por búsqueda y escribiendo el identificador de B, entonces no aparece ninguno y el acceso directo responde "no encontrado", el mismo mensaje que para un identificador inexistente.
- **CA-002 · No se modifica lo de otra empresa** (RN-001, RF-AUD-010). Dado un Administrador de A y una orden pendiente de B, cuando intenta aprobarla, editarla o anularla (por pantalla o enviando la petición directa al servidor), entonces se rechaza, la orden de B no cambia y el intento queda en la auditoría.
- **CA-003 · No se mezclan referencias** (RS-11). Dado un proveedor de la empresa B, cuando un usuario de A crea una orden que apunta a ese proveedor, entonces se rechaza aunque conozca su identificador.
- **CA-004 · Cambio de empresa** (RF-ACC-011, RF-ACC-012). Dado un usuario que pertenece a A y B y tiene una lista de A en pantalla, cuando cambia a B, entonces ninguna pantalla muestra datos de A, el cambio queda en la auditoría, y el administrador de B no ve a qué otras empresas pertenece.
- **CA-005 · Invitación** (RF-ACC-003, 006, 007, 009, 010). Dado un administrador que invita a `Ana@x.com`, cuando se usa la invitación una segunda vez, o a los 8 días, o desde otro correo, entonces se rechaza; y si `ana@x.com` ya tiene cuenta, la empresa se suma a su misma cuenta sin crear otra.
- **CA-006 · Sin registro abierto** (RF-ACC-001, 004, 005, 017). Dado un correo sin invitación, cuando intenta entrar, entonces no se crea cuenta ni empresa, y el mensaje es el mismo exista o no el correo; tras varios intentos fallidos la espera crece.
- **CA-007 · Segunda verificación** (RF-ACC-013, RF-PLA-001). Dado un administrador sin segunda verificación configurada, cuando abre el enlace de acceso, entonces debe configurarla antes de usar la plataforma; un Técnico puede entrar sin ella.
- **CA-008 · Baja y suspensión cortan sesiones** (RF-ACC-014 a 016, RF-ROL-011). Dado un usuario con la sesión abierta, cuando el administrador lo suspende, entonces su siguiente acción es rechazada al instante; y si le cambian el rol, el nuevo rol vale en su siguiente acción.
- **CA-009 · Último administrador** (RF-ROL-008, RF-ACC-020). Dado una empresa con un solo administrador activo, cuando alguien intenta suspenderlo, darlo de baja o cambiarle el rol (incluido él mismo), entonces el sistema lo impide.
- **CA-010 · Sin autoescalada** (RF-ROL-007, RF-ACC-008). Dado un usuario con permiso de administrar roles, cuando intenta darse a sí mismo un permiso que no tiene, o crear un rol con más permisos que el suyo, o invitar con un rol mayor, entonces se rechaza.
- **CA-011 · Permiso comprobado en el servidor** (RF-ROL-003 a 005, 010, 014). Dado un Técnico (sin permiso de aprobar) y una orden pendiente creada por otra persona, cuando intenta aprobarla con el botón (que no debe verse) o enviando la petición directa, entonces el servidor la rechaza, la orden sigue Pendiente y el intento queda registrado; y un rol "Solo lectura" no ve precios ni datos personales.
- **CA-015 · Administrador de plataforma** (RF-ACC-002, 019, 022, RF-PLA-002 a 006). Dado un Administrador de plataforma, cuando intenta ver activos o compras de una empresa sin autorización, entonces no puede; con autorización de esa empresa puede por un máximo de 24 horas y todo queda en la auditoría; puede crear, suspender y rescatar empresas.
- **CA-047 · Roles plantilla** (RF-ROL-001, 002, 006, 012). Dado la empresa A que editó su rol Técnico, cuando se crea la empresa B, entonces B tiene el Técnico original; un rol nuevo no tiene ningún permiso; un rol con usuarios asignados no se puede eliminar.
- **CA-052 · Ciclo de vida de usuarios y personas** (RF-USR-001 a 008, RF-PER-006, RF-PER-007, RF-DAT-001, 003). Dado una Persona con un activo asignado, cuando se intenta desactivarla, entonces el sistema avisa y bloquea; al devolver el activo, se puede; sus órdenes abiertas se reasignan o cancelan con motivo; y al desactivar nunca se borra su historial.
- **CA-049 · Aviso de privacidad** (RF-ACC-023). Dado un usuario en su primer ingreso, cuando no acepta el aviso, entonces no puede usar la plataforma; al aceptar, quedan registradas la versión y la fecha.

**Códigos, campos y artículos**

- **CA-016 · Personas** (RF-PER-001 a 004). Dado un técnico que entrega una laptop a un empleado sin cuenta, cuando registra la entrega, entonces basta una Persona con nombre y área; no se pide documento, dirección ni teléfono.
- **CA-017 · Código único por empresa** (RF-SKU-001, 002, RF-CAT-007 a 009). Dado que A ya tiene `LAP-0001`, cuando A intenta otro `lap-0001` o `LAP-0001 ` y B crea `LAP-0001`, entonces A recibe "ese código ya existe" y B lo acepta.
- **CA-018 · Correlativo con muchas personas a la vez** (RN-004, RF-SKU-003, 004, RF-OC-003, RF-OS-005). Dado que `LAP` está en `LAP-0010`, cuando 20 usuarios crean un SKU de esa categoría al mismo tiempo, entonces se crean 20 SKU con 20 códigos distintos, todos mayores que `LAP-0010`. Los saltos son aceptables; las repeticiones, nunca. Lo mismo para las órdenes.
- **CA-019 · Código escrito a mano** (RF-SKU-005, 006, RF-CAT-011). Dado que `LAP` está en `LAP-0010`, cuando un usuario con permiso crea `LAP-0011` a mano y otro crea uno automático, entonces el automático recibe `LAP-0012`; repetir `LAP-0011` se rechaza; un usuario sin el permiso no puede escribir código ni por petición directa; y un SKU con movimientos no admite cambiar su código.
- **CA-020 · Campos personalizados** (RF-CAT-012 a 016, 022, RF-SKU-013, RF-OC-039). Dado un campo obligatorio de tipo número en Laptops, cuando se guarda un SKU con el campo vacío, con texto "abc" o con una opción de lista que no existe, entonces se rechaza con un mensaje por campo y no se guarda nada; y un IMEI se pide por cada unidad, no por SKU.
- **CA-021 · Cambios de campos con datos** (RF-CAT-017 a 021). Dado un campo con datos, cuando se intenta borrarlo, cambiarle el tipo o quitar una opción en uso, entonces no se permite (se desactiva); si se vuelve obligatorio, los registros existentes quedan "pendiente de completar" y siguen funcionando.
- **CA-022 · Modo de control inmutable** (RF-SKU-007, 008). Dado un SKU con activos o stock, cuando se intenta cambiar su modo de control o su categoría, entonces se rechaza; sin existencias, se permite.

**Inventario**

- **CA-023 · Serie duplicada** (RF-INV-002, 003, 006, RF-SKU-009). Dado un SKU con serie y un activo con serie `SN-100`, cuando se registra `sn-100` o ` SN-100 ` en el mismo SKU, entonces se rechaza siempre; en otro SKU de la misma empresa se acepta con un aviso visible que dice dónde está; en otra empresa se acepta sin aviso.
- **CA-024 · Estados y transiciones** (RF-INV-001, 009 a 011, 018, RF-OC-028). Dado un activo De baja, cuando alguien intenta asignarlo o pasarlo a En reparación, entonces se rechaza; una baja o un extravío sin motivo se rechazan; solo un reingreso con motivo y permiso lo devuelve a En stock.
- **CA-025 · Asignación única** (RF-INV-013 a 015). Dado un activo En stock, cuando dos técnicos lo asignan a la vez a personas distintas, entonces solo una asignación se acepta y la otra recibe un aviso; la devolución queda en el historial con fecha y estado.
- **CA-026 · Stock no negativo** (RF-INV-019 a 021). Dado un stock de 3 mouses en una ubicación, cuando se intenta sacar 5, o cuando dos personas sacan 2 a la vez, entonces nunca queda un saldo negativo; las correcciones se hacen con un ajuste con motivo.
- **CA-027 · Traslado** (RF-INV-022). Dado un stock en la bodega A, cuando se traslada 10 a la bodega B, entonces sale de A y entra a B en el mismo acto; un traslado a la misma ubicación se rechaza.
- **CA-028 · Reingreso** (RF-INV-004). Dado un activo De baja con serie `SN-100`, cuando vuelve de una reparación externa, entonces se reactiva el mismo registro con un movimiento "reingreso" y motivo; nunca se crea un segundo registro con esa serie.
- **CA-046 · Constancia de entrega** (RF-INV-008, 016, 017, RF-DAT-006, RNF-002). Dado un activo asignado a una Persona, cuando el técnico pide el acta, entonces se genera un PDF imprimible con activo, serie, persona, fecha, estado de entrega y quién entrega; la fecha de garantía que cae hoy se evalúa según la zona horaria de la empresa.

**Compras y recepción**

- **CA-029 · Rechazo y corrección** (RF-OC-001, 008, 009, 011). Dado una orden Pendiente creada por un Solicitante, cuando un aprobador la rechaza sin motivo, entonces se rechaza la acción; con motivo, la orden queda Rechazada con el motivo visible, y al corregirla vuelve a Pendiente de aprobación con el historial del rechazo.
- **CA-030 · Editar una orden aprobada** (RF-OC-014, RF-OC-010). Dado una orden Aprobada, cuando alguien cambia el precio, la cantidad o el proveedor, entonces vuelve a Pendiente de aprobación y la aprobación anterior se anula; una orden Recibida o Cerrada no se edita.
- **CA-031 · Aprobación por monto y moneda** (RF-OC-005, 015 a 020). Dado un límite de 5.000 en la moneda base, cuando se crea una orden de 3.000 en moneda base, entonces pasa a Aprobada sin pedir aprobación; una de 8.000 queda Pendiente; una de cualquier monto en otra moneda queda Pendiente; con aprobación desactivada ninguna queda Pendiente.
- **CA-012 · Quien crea o edita no aprueba** (RF-OC-021, 022, 025, RF-ROL-009). Dado un usuario con permiso de aprobar que creó o editó una orden, cuando intenta aprobarla o rechazarla, entonces el servidor lo rechaza, incluso si es Administrador.
- **CA-013 · Quien recibe no creó ni aprobó** (RF-OC-023, 024). Dado una orden que aprobó el usuario X, cuando X intenta recibir esa mercadería, o quien la creó intenta recibirla, entonces se rechaza.
- **CA-014 · Excepción auditada** (RF-OC-026). Dado una empresa de una sola persona de TI donde el Administrador activó la excepción, cuando esa persona aprueba su propia orden, entonces se acepta, la orden muestra un aviso visible y la auditoría registra quién, cuándo, monto y orden; con la excepción desactivada se rechaza.
- **CA-032 · Datos de la orden** (RF-OC-002, 004 a 007, RF-SKU-010, 011, RF-CAT-005, RF-INV-023). Dado el formulario de orden, cuando se intenta guardar sin líneas, con cantidad 0 o negativa, con precio negativo, con el mismo SKU en dos líneas, con un SKU o proveedor inactivo, o con decimales en un SKU que no los admite, entonces se rechaza con mensaje por campo; el total y el impuesto se calculan con decimales exactos.
- **CA-033 · Recepción parcial y luego total** (RF-OC-029, 035, 036, 040). Dado una orden Emitida de 10 unidades de un SKU con serie, cuando se reciben 4 con 4 series y después las 6 restantes, entonces tras la primera hay 4 activos nuevos y la orden queda Recibida parcial con 6 pendientes; tras la segunda hay 10 activos sin duplicados y la orden pasa a Recibida total y a Cerrada.
- **CA-034 · Recepción inválida: nada a medias** (RF-OC-030, 031, 033, 037, 038). Dado la misma orden con 4 recibidas, cuando se intenta recibir 7 (más de las 6 pendientes), o confirmar 4 con una lista de 3 series, o 4 series de las cuales una ya existe en el SKU, entonces la recepción completa se rechaza con un mensaje que dice el problema, no se crea ningún activo y los pendientes siguen en 6; con series incompletas se puede guardar como borrador y retomarlo.
- **CA-035 · Doble clic y simultaneidad** (RF-OC-033, 034). Dado una recepción lista, cuando se hace doble clic en Confirmar, o dos personas confirman recepciones de la misma orden a la vez, entonces los activos se crean una sola vez y nunca se supera lo pendiente.
- **CA-036 · Corrección de recepciones** (RF-OC-032, RF-INV-007, RF-OC-010). Dado una recepción confirmada por error con activos sin asignar, cuando se revierte con motivo, entonces los activos se anulan con movimiento contrario y la orden vuelve al estado que corresponde; con un activo ya asignado la reversión se rechaza y se corrige con baja y nueva entrada; corregir una serie exige motivo y guarda el valor anterior.
- **CA-037 · Anulación y cierre manual** (RF-OC-012, 013). Dado una orden con una recepción parcial, cuando se intenta anular, entonces se rechaza; con permiso y motivo se cierra; antes de la primera recepción sí se puede anular con motivo.

**Importación**

- **CA-038 · Importación todo o nada** (RF-IMP-001 a 008, RF-INV-005). Dado un archivo de 100 filas con 3 inválidas (SKU inexistente, serie repetida en el mismo archivo, campo obligatorio vacío), cuando se sube, entonces la vista previa muestra por cada fila inválida el número de fila, la columna y el motivo; nada se guarda hasta confirmar; mientras haya errores no se puede confirmar; tras corregir y subir otra vez se cargan las 100 filas; volver a subir el mismo archivo no duplica; el lote se puede deshacer completo mientras no tenga movimientos; una serie como 3,5E+14 se marca como posiblemente dañada.
- **CA-039 · Importación segura** (RF-IMP-009 a 012, RS-42, RNF-009). Dado un archivo, cuando es de otro tipo, supera 5.000 filas o 10 MB, trae una celda que empieza con `=`, o una columna de empresa, entonces se rechaza o se trata como texto y la empresa sale de la sesión; un texto con código escrito en un campo se muestra como texto.

**Auditoría y datos**

- **CA-040 · Auditoría inalterable** (RF-AUD-001, 002). Dado un Administrador, cuando intenta editar o borrar una entrada de auditoría por pantalla o por petición directa, entonces es imposible; y si falla un cambio, no queda una entrada de un cambio que no ocurrió.
- **CA-041 · Qué se audita** (RF-AUD-003 a 005, 008, 009, RF-USR-007, RF-ROL-013). Dado un conjunto de acciones (alta de usuario, cambio de rol, aprobación, baja de activo, importación, exportación, cambio de empresa, inicio de sesión fallido, consulta a la auditoría), cuando se ejecutan, entonces cada una deja una entrada con quién, cuándo, empresa, qué cambió (antes y después) y motivo si aplica.
- **CA-042 · Claves de licencia** (RF-SKU-014, RF-AUD-006). Dado una clave de licencia, cuando se consulta el activo, entonces se muestra enmascarada; verla completa exige el permiso aparte y esa consulta queda en la auditoría sin guardar la clave.
- **CA-043 · Exportación** (RNF-006). Dado un rol sin permiso de exportar, cuando intenta exportar una lista por el botón o por petición directa, entonces se rechaza; con permiso se exporta y queda en la auditoría; las celdas con `=` se exportan como texto.
- **CA-045 · Nada con historial se borra** (RF-AUD-011, RN-007). Dado un SKU, activo, orden, persona, usuario o valor de catálogo con historial, cuando se intenta eliminar, entonces solo se permite desactivar, anular o dar de baja con motivo; un borrador que nunca tuvo efecto sí se puede borrar.

**Servicios, búsqueda y uso**

- **CA-044 · Orden de servicio** (RF-OS-001 a 009, RF-INV-012). Dado un Solicitante, cuando crea una orden de servicio, entonces queda Creada; el técnico la asigna, ejecuta y cierra; una cerrada no se reabre; una abierta se puede cancelar; abrirla no cambia el estado del activo.
- **CA-048 · Búsqueda y "no encontrado"** (RNF-007, RF-CAT-001, RF-SKU-012). Dado un usuario de la empresa A, cuando usa el buscador global, entonces solo encuentra lo de A y lo que su rol permite ver; para algo de B responde "no encontrado".
- **CA-050 · Inicio por rol, idioma y accesibilidad** (RNF-001, 003, 004, 008). Dado un usuario Almacén, Técnico, Jefatura TI, Solicitante, Administrador o Solo lectura, cuando entra, entonces ve su pantalla de inicio propia, en español, usable desde celular, por teclado y con los estados escritos con texto.
- **CA-051 · Edición simultánea** (RN-014). Dado dos usuarios que abren el mismo registro, cuando ambos guardan cambios, entonces al segundo se le avisa que el registro cambió y no se pisa en silencio el cambio del primero.
- **CA-053 · Calidad y continuidad** (RNF-010 a 018). Dado una etapa que pasa a uso real, cuando se prepara la liberación, entonces existe un respaldo del día, una restauración probada sin mezclar empresas, un plan de vuelta atrás escrito, los manuales de la etapa y la medición de rendimiento contra RNF-011.

## 22. Pendientes (P-NNN)

Cada pendiente dice qué bloquea. No todo es urgente.

| ID | Pendiente | Quién responde | Bloquea a |
|---|---|---|---|
| P-001 | Valor del monto límite de aprobación de cada empresa (es configuración, no se necesita para construir). | Cada empresa, a través del Cliente (CEO) | Etapa 5 (solo la puesta en marcha) |
| P-002 | Una orden de compra real, una orden de servicio real y el Excel de inventario actual, con nombres de personas reemplazados. | Cliente (CEO) | Etapa 0 (cierre) y Etapa 4 (importación) |
| P-003 | Cifra aproximada de activos, usuarios y órdenes por mes. | Cliente (CEO) | Dimensionamiento de todas las etapas (se usa el supuesto de RNF-010) |
| P-004 | País o países de las empresas y si los precios de sus compras incluyen impuestos. | Cliente (CEO) | Etapa 1 (ley de datos) y Etapa 5 (impuestos) |
| P-005 | Confirmación de la matriz de permisos con el prototipo y los documentos reales. | Gerente de TI | Etapa 1 |
| P-006 | Tipos de servicio definitivos, su flujo y quién aprueba los que tienen costo. | Gerente de TI, con la orden de servicio real | Etapa 6 |
| P-007 | Formato real del Excel (columnas, textos de estado, personas). | Analista, con el Excel real | Etapa 4 |
| P-008 | Integración con SAP: no entra en la v1. Queda como información: el código del SKU se puede escribir a mano para usar el de SAP. | Gerente de TI | Nada |
| P-009 | Si dar de baja un activo de valor exige una segunda persona y desde qué monto. | Gerente de TI | Etapa 7 |
| P-010 | Si se habilitan los archivos adjuntos (facturas, actas firmadas). | Cliente (CEO), por el costo | Fin de la Etapa 4 |

## 23. Supuestos propuestos (S-nn)

Los propone el Analista con recomendación; los confirma o cambia el Gerente de TI. No se le preguntan al Cliente (CEO).

| ID | Supuesto | Dónde aplica |
|---|---|---|
| S-01 | El enlace de acceso dura 15 minutos y sirve una vez. | RF-ACC-006 |
| S-02 | La sesión vence a los 30 minutos sin actividad o a las 12 horas en total. | RF-ACC-014 |
| S-03 | Suspender un usuario es reversible; darlo de baja es definitivo en esa empresa y se bloquea si su Persona vinculada tiene activos asignados. | RF-USR-003, 004 |
| S-04 | El acceso temporal de soporte a datos de una empresa dura como máximo 24 horas y lo autoriza el Administrador de esa empresa. | RF-PLA-005 |
| S-05 | Un cambio de rol vale desde la siguiente acción; un rol con usuarios asignados no se elimina. | RF-ROL-011, 012 |
| S-06 | Las ubicaciones son una lista simple, sin niveles, en la v1. | RF-CAT-006 |
| S-07 | El prefijo de categoría tiene de 2 a 5 caracteres (letras o números en mayúsculas) y es único por empresa. El correlativo tiene mínimo 4 dígitos. | RF-CAT-008, RF-SKU-003 |
| S-08 | Largos máximos: nombre de SKU 120 caracteres, texto de un campo 255, serie 64, motivo 500; los números admiten hasta 4 decimales. | RF-CAT-022 |
| S-09 | Por defecto un SKU por serie no acepta unidades sin serie; el SKU puede autorizarlo expresamente. | RF-SKU-009 |
| S-10 | Un equipo de uso compartido se asigna a una Persona custodio, no a una ubicación. | RF-INV-014 |
| S-11 | Una orden Pendiente de aprobación puede volver a Borrador si quien la creó la retira. | Sección 12.2 |
| S-12 | Al completarse la recepción, la orden pasa de Recibida total a Cerrada en el mismo acto. | Sección 12.2 |
| S-13 | Revertir una recepción reabre la orden al estado que corresponde (Recibida parcial o Emitida); es la única salida de Cerrada. | RF-OC-032 |
| S-14 | El monto que se compara con el límite de aprobación es el total con impuestos. | RF-OC-017 |
| S-15 | El Solicitante no ve precios; crea la orden con SKU y cantidades y quien la edita completa los precios. | Sección 7.3, RF-OC-008 |
| S-16 | Una orden de servicio "tiene costo" cuando su costo estimado es mayor que cero; usa el mismo límite y las mismas reglas de separación de funciones que las compras. | RF-OS-008 |
| S-17 | Tope de importación: 5.000 filas y 10 MB por archivo, 10 importaciones por día por empresa. | RF-IMP-009 |
| S-18 | Edición simultánea: se avisa a quien guarda segundo; no gana el último en silencio. | RN-014 |
| S-19 | Rendimiento objetivo: con 100.000 activos, 95 % de listas y búsquedas en menos de 2 segundos; recepción de 100 series en menos de 5 segundos. | RNF-011 |
| S-20 | Sin compromiso de disponibilidad 24 horas en la v1; mantenimientos avisados. | RNF-012 |
| S-21 | Formato de fecha día/mes/año. | RNF-002 |
| S-22 | Las celdas de la matriz de permisos que nadie había definido son una propuesta; en particular: Jefatura TI no crea órdenes ni asigna activos; Técnico no ve precios; solo el Administrador edita proveedores, categorías y campos; Almacén corrige series. | Sección 7.3 |
| S-23 | El centro de costo de una orden es opcional. | RF-OC-007 |
| S-24 | La orden de compra puede llevar una referencia externa opcional (texto libre, por ejemplo número de documento de SAP). Pedido por el módulo presupuesto-costos. | RF-OC-042 |
| S-25 | Proveedor, ubicación y centro de costo pueden tener código externo opcional; el centro de costo puede tener una Persona responsable opcional. Pedido por presupuesto-costos e integraciones-api. | RF-CAT-023, 024 |
| S-26 | El SKU puede tener un stock mínimo opcional; en la v1 es solo un dato, sin avisos ni bloqueos. | RF-SKU-016 |
| S-27 | Los módulos adicionales pueden agregar filas a la matriz de permisos y, con visto bueno del Gerente de TI, plantillas de rol propias (por ejemplo "Empleado (portal)" de alcance propio, para el portal de autoservicio de la fase 3). El núcleo de la v1 mantiene 6 plantillas. | Sección 7.3, sección 27 |
| S-28 | La auditoría guarda el tipo de autor ("usuario" o "integración"); en la v1 siempre es usuario. | RF-AUD-013 |

## 24. Escalado al Cliente (CEO)

Solo dinero, tema legal o algo irreversible. Se le explica en español claro. Los números salen de `docs/equipo/decisiones.md`.

**Dinero (le pedimos que apruebe o rechace)**
- **D1.** Servicio de envío de correos (invitaciones, enlaces de acceso, avisos de aprobación). Es indispensable porque el acceso es por correo. Costo mensual bajo pero recurrente. Recomendación: aprobarlo. DevOps trae el costo y el proveedor en la Etapa 0.
- **D2.** Alojamiento, respaldos y soporte de la plataforma. DevOps presenta el costo estimado en la Etapa 0, antes de programar.
- **D3.** Archivos adjuntos: no entran ahora. Si al cierre de la Etapa 4 conviene habilitarlos, implican pagar almacenamiento y se le consultará entonces (P-010).

**Legal (le pedimos una opinión legal; el equipo no la da)**
- **L1.** Qué ley de protección de datos aplica según el país de las empresas y si hay que registrar el banco de datos de usuarios y empleados.
- **L2.** Confirmar los plazos de la sección 18: 5 años de auditoría, 2 años antes de anonimizar a una persona dada de baja, 30 días para archivos importados.
- **L3.** Texto del aviso de privacidad y de los términos de uso, y si la plataforma es proveedor de las empresas o titular de los datos.
- **L4.** Si guardar datos de varias empresas en un mismo servidor, o en un servidor en otro país, exige requisitos especiales.
- **L5.** Procedimiento y plazos para atender solicitudes de acceso, corrección y eliminación de datos personales.
- **L6.** Contratos con los proveedores de alojamiento y de correo.
- **L7.** Aviso: si el Cliente (CEO) planea ofrecer la plataforma a empresas que no son suyas, esto cambia contratos, soporte y costos. Para la v1 se asume que solo se usa con las empresas que él designe; basta con que avise si ese plan existe.

**Irreversible (se le explica antes de ejecutarse)**
- **I1.** Anonimizar o borrar datos personales no se puede deshacer. Los plazos de la sección 18 son propuesta hasta que legal los confirme; no se activa ninguna anonimización automática antes.
- **I2.** Pasar a producción con datos reales de una empresa (Etapa 7): lo aprueba el Cliente (CEO) tras la demo, con respaldo y restauración ya probados.

**Insumos que solo el Cliente (CEO) tiene** (no son decisiones de producto): P-002, P-003 y P-004 de la sección 22.

## 25. Fuera de la v1 y orden de etapas

Ver la lista de "No incluye" en la sección 2. Orden de etapas: se mantiene 0 a 7, con compras (5) antes que servicios (6). Las órdenes de servicio dependen del inventario (Etapa 4), no de las compras; si el Cliente (CEO) valora más reparar que comprar, se pueden intercambiar las etapas 5 y 6 sin romper nada técnico, pero queda como está porque las compras están más definidas.

Antes de la primera tabla de la Etapa 1, el Arquitecto hace un prototipo de 1 a 2 días del aislamiento por empresa; si falla, vuelve a mesa (D-025).

## 26. Matriz de trazabilidad

Cada tabla de requisitos de este documento es la matriz: la columna **Etapa** dice cuándo se entrega y la columna **CA** dice qué criterio de aceptación lo comprueba (los criterios están en la sección 21). QA y el Auditor Técnico la copian a `docs/trazabilidad.md` para sumar la prueba que cubre cada criterio y su estado; el Auditor Técnico la revisa al cerrar cada etapa: un requisito sin prueba y una prueba sin requisito son hallazgos.

Resumen por módulo:

| Módulo | Requisitos | Etapa | Criterios de aceptación |
|---|---|---|---|
| ACC Acceso y empresas | RF-ACC-001 a 023 | 1 (y 5 para avisos) | CA-004 a 010, CA-015, CA-049 |
| PLA Administrador de plataforma | RF-PLA-001 a 007 | 1 | CA-007, CA-015, CA-041 |
| USR Usuarios | RF-USR-001 a 008 | 1 (4 y 5 en dos reglas) | CA-008, CA-045, CA-052 |
| ROL Roles y permisos | RF-ROL-001 a 014 | 1 | CA-008 a 012, CA-041, CA-047 |
| PER Personas | RF-PER-001 a 010 | 2 (4 y 5 en dos reglas) | CA-001, CA-011, CA-016, CA-038, CA-045, CA-052 |
| CAT Catálogos y campos | RF-CAT-001 a 024 | 2 | CA-001, CA-017 a 021, CA-032, CA-045, CA-048 |
| SKU Maestro de artículos | RF-SKU-001 a 016 | 3 (RF-SKU-014 en 4) | CA-017 a 023, CA-032, CA-042, CA-048 |
| INV Inventario | RF-INV-001 a 023 | 4 (RF-INV-012 en 6) | CA-023 a 028, CA-032, CA-036, CA-038, CA-044, CA-046 |
| OC Compras y recepción | RF-OC-001 a 042 | 5 (RF-OC-027 en 1, RF-OC-028 en 7) | CA-011 a 014, CA-018, CA-020, CA-024, CA-029 a 037, CA-045 |
| OS Órdenes de servicio | RF-OS-001 a 009 | 6 | CA-018, CA-044 |
| IMP Importación | RF-IMP-001 a 014 | 4 (RF-IMP-014 en 0) | CA-011, CA-038, CA-039 |
| AUD Auditoría | RF-AUD-001 a 013 | 1 | CA-001, CA-002, CA-011, CA-040 a 042, CA-045 |
| DAT Datos personales | RF-DAT-001 a 010 | 0, 1, 4 y 7 | CA-004, CA-038, CA-039, CA-040, CA-046, CA-052 |
| RNF Calidad y continuidad | RNF-001 a 018 | 0 a 7 | CA-034, CA-039, CA-043, CA-046, CA-048, CA-050, CA-053 |
| RS Seguridad | RS-01 a RS-44 | Las del cuadro de la sección 17 | Las de cada requisito referido |

**Cobertura de los criterios.** Los criterios CA-001 a CA-053 salen de los diez de QA y de las decisiones; QA los completa con casos límite en su plan. Los requisitos RS-43 y RS-44 se comprueban con el CA-053 y con las revisiones de Seguridad y DevOps, no con una prueba de pantalla.

---

## 27. Módulos adicionales (fases 2 y 3)

Seis escuadrones escriben en paralelo los módulos que se suman al núcleo. Fase 2 = viene después de la versión 1 (entran con el núcleo estable); fase 3 = más adelante. Las fases son una propuesta del Analista que confirma cada escuadrón en su archivo. Los archivos se están escribiendo ahora en `docs/modulos/`; este índice solo los enumera y no repite su contenido.

| Módulo | Fase | Documento |
|---|---|---|
| Proveedores y contratos | 2 | ver docs/modulos/proveedores-contratos.md |
| Garantías y mantenimiento | 2 | ver docs/modulos/garantias-mantenimiento.md |
| Licencias de software | 2 | ver docs/modulos/licencias-software.md |
| Líneas móviles | 2 | ver docs/modulos/lineas-moviles.md |
| Dominios y certificados | 3 | ver docs/modulos/dominios-certificados.md |
| Mesa de ayuda | 2 | ver docs/modulos/mesa-de-ayuda.md |
| Notificaciones | 2 | ver docs/modulos/notificaciones.md |
| Personas y ubicaciones | 2 | ver docs/modulos/personas-ubicaciones.md |
| Entregas y devoluciones | 2 | ver docs/modulos/entregas-devoluciones.md |
| Onboarding y offboarding | 2 | ver docs/modulos/onboarding-offboarding.md |
| Portal de autoservicio | 3 | ver docs/modulos/portal-autoservicio.md |
| Gestión de cambios | 3 | ver docs/modulos/gestion-cambios.md |
| Gestión de problemas | 3 | ver docs/modulos/gestion-problemas.md |
| CMDB ligera | 3 | ver docs/modulos/cmdb-ligera.md |
| Presupuesto y costos | 3 | ver docs/modulos/presupuesto-costos.md |
| Reportes y tableros | 3 | ver docs/modulos/reportes-tableros.md |
| Integraciones y API | 3 | ver docs/modulos/integraciones-api.md |

Cruces con el núcleo, para que los escuadrones no dupliquen reglas:
- **Personas y ubicaciones** amplía el directorio de Personas (sección 8) y las ubicaciones (RF-CAT-006); el núcleo solo trae lo mínimo.
- **Entregas y devoluciones** amplía la constancia y el acta (RF-INV-016); el núcleo solo trae el registro y el PDF.
- **Notificaciones** amplía los avisos por correo (RF-ACC-021); el núcleo solo trae invitaciones, accesos y aprobaciones.
- **Licencias de software** y **Líneas móviles** amplían las reglas de licencias (RF-SKU-013) y de IMEI y número de línea (RF-CAT-014); el núcleo no asigna puestos.
- **Proveedores y contratos** amplía el catálogo de proveedores (RF-CAT-001).
- **Garantías y mantenimiento** amplía la fecha de garantía (RF-INV-008); el núcleo no avisa vencimientos.
- **Permiso "ver datos personales":** es el permiso sensible de D-004 (nombre y correo de Personas y sus asignaciones). Los módulos lo usan con ese nombre; el Arquitecto fija su identificador técnico.
- Cualquier módulo debe respetar las reglas transversales RN-001 a RN-016, la auditoría de la sección 16 y la matriz de permisos de la sección 7.3 (agregando sus filas).

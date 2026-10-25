# Mesa de revisión #001 · Ronda 1 · Arquitecto de Software

Destino final de este texto: `docs/equipo/mesa-001/ronda1-arquitecto-software.md`
(Se deja aquí porque la sesión está en modo plan y no permite escribir en `docs/`. Copiar tal cual cuando se levante el modo plan.)

Documento revisado: `docs/documento-funcional.md` v0.1 · Riesgos: `docs/equipo/riesgos.md`
Fecha: 2026-10-25 · Rol: arquitecto-software

---

## 1. Qué está bien

- **El alcance es sano.** Dejar fuera tickets, mantenimiento preventivo, SAP y la app móvil nos permite construir cimientos firmes sin correr.
- **Licencias sin tipo especial (§7).** Resolverlas con el modo de control (por serie o por cantidad) es lo más simple que funciona. Si luego aparece un caso raro, se agrega; no hay que construirlo hoy.
- **Serie contra cantidad (§3, §7, §8)** está bien separado a nivel de concepto, y la recepción que crea los activos (§9) es el lugar correcto para capturar series.
- **Multiempresa y "una persona en varias empresas" (§4)** están dichos desde el principio. Es lo más caro de agregar después y aquí ya está en el contrato.
- **Rol por empresa (§5):** el rol vive en la relación entre persona y empresa, no en la persona. Es el modelo correcto.
- **Aprobación configurable y recepciones parciales (§9)** están anticipadas, y el documento marca con honestidad lo que no sabe ([PENDIENTE]).
- **Auditoría (§11) incluida en la versión 1**, no como "después".

## 2. Qué me preocupa

Separo HECHO (se verifica leyendo el documento) de OPINIÓN (mi criterio de arquitectura). Ordenado de más a menos grave para el diseño.

### 2.1 Los campos personalizados no dicen si pertenecen al tipo de artículo o a cada unidad (§6, §7, §8)
- **HECHO:** §6 dice que los campos de la categoría "los heredan todos sus SKUs" y §7 dice que el SKU lleva "los campos personalizados de su categoría". Pero los ejemplos del propio §6 mezclan dos cosas distintas: RAM, disco y procesador describen el *modelo* (todas las unidades son iguales), mientras que IMEI, número de línea y fecha de vencimiento de una licencia describen *cada unidad*. Un IMEI en el SKU no tiene sentido: cada celular tiene el suyo.
- **OPINIÓN (fuerte):** si no lo resolvemos ahora, hay que rehacer el diseño de la Etapa 2 y la Etapa 4. Es la pregunta de diseño más importante del documento.
- **Falta también:** qué pasa si se agrega un campo obligatorio a una categoría que ya tiene SKUs; si se cambia el tipo de un campo; si se borra un campo con datos cargados; si una subcategoría hereda los campos de su categoría padre (§6 habla de subcategorías pero no de herencia).

### 2.2 Los "responsables" de los activos no son necesariamente usuarios del sistema (§8)
- **HECHO:** §8 dice "responsable" y "asignar a un usuario o ubicación". En §4-§5 "usuario" es quien entra a la plataforma.
- **OPINIÓN:** en la práctica, casi todos los que reciben una laptop o un celular son empleados que nunca entrarán a la plataforma. Si el modelo obliga a que el responsable sea un usuario, habría que crear cuentas falsas o rehacer la asignación. Hace falta una entidad aparte (persona o empleado) que pueda existir sin acceso.

### 2.3 Quién crea las empresas y qué producto es esto (§1, §4)
- **HECHO:** §1 dice "cualquier empresa"; §4 dice "el primer usuario de una empresa es su administrador". No dice quién da de alta la empresa ni si existe alguien por encima de las empresas (quien da soporte, quien las crea, quien las suspende).
- **OPINIÓN:** hay una gran diferencia entre "una herramienta para las empresas de mi grupo" y "un producto que cualquier empresa contrata". El segundo exige: alta controlada de empresas, un administrador de plataforma, límites, y qué hacemos con los datos si una empresa se va. No lo construiríamos igual.

### 2.4 "Cualquier tipo de correo" no define cómo se entra (§2.1, §4)
- **HECHO:** el documento dice con qué correo se entra, no con qué credencial (contraseña, enlace por correo, cuenta de Google o Microsoft).
- **OPINIÓN:** cambia la integración de acceso, el envío de correos (que tiene costo mensual y hay que contratarlo) y el riesgo de que alguien tome una invitación ajena. Se lo consultaré a Seguridad. Además: el identificador interno de una persona no debe ser su correo (los correos cambian), y la invitación a un correo que ya tiene cuenta debe sumar una empresa, no crear otra cuenta.

### 2.5 Numeración del SKU con huecos de definición (§7)
- **HECHO:** el correlativo es "prefijo + número" y el usuario puede escribir uno propio. No dice: si el correlativo salta cuando alguien escribe `LAP-0050` a mano; si las subcategorías (Periféricos > Mouse) usan el prefijo del padre o el propio; si el código se puede cambiar después; qué pasa al llegar a 9999; qué pasa si la categoría cambia de prefijo.
- **OPINIÓN:** propongo reglas fijas en la sección 3. Son decisiones de diseño, no de negocio, pero el CEO debería poder leerlas y objetar.
- **Riesgo conocido (riesgo #3):** dos personas creando un SKU al mismo tiempo no deben recibir el mismo número. Se resuelve en la base de datos, no en pantalla.

### 2.6 Qué identifica a una serie y qué pasa con el stock (§3, §8)
- **HECHO:** §8 no dice dentro de qué ámbito una serie es única (¿por empresa? ¿por SKU? ¿por marca?). Dos fabricantes distintos pueden repetir un número de serie. Tampoco dice si un equipo dado de baja puede volver a ingresar (típico: equipo que vuelve de reparación externa o de un préstamo).
- **HECHO:** el stock por cantidad "se lleva por ubicación" con ingresos, salidas y traslados, pero no dice si el stock puede quedar negativo.
- **OPINIÓN:** propongo en la sección 3 una sola tabla de movimientos para los dos modos de control, con el saldo por ubicación mantenido en la misma transacción.

### 2.7 Recepciones: faltan casos que cambian el modelo (§9)
- **HECHO:** §9 permite recepciones parciales, pero no dice qué pasa si llega **más** de lo pedido, si se capturó mal una serie en una recepción ya confirmada, si hay mercadería devuelta o dañada, ni cuándo una orden pasa a "Cerrada" (¿cuando todo llegó, o manualmente aunque falte algo?).
- **OPINIÓN:** una recepción debe ser un documento propio (cabecera y líneas), con varias por orden. Corregir una recepción confirmada debe ser con un movimiento contrario, nunca borrando. Sin esto, la trazabilidad (que es el propósito de §1) se rompe.

### 2.8 Dinero: no hay moneda ni impuestos (§9)
- **HECHO:** §9 menciona "precio por línea" y montos de aprobación. No aparece moneda, impuestos, descuentos ni redondeo.
- **OPINIÓN:** una empresa con más de una moneda, o con impuestos por línea, cambia las tablas de órdenes y las reglas de aprobación (¿un monto en qué moneda?). Preguntarlo ahora cuesta una línea; descubrirlo en la Etapa 5 cuesta una migración con datos reales.

### 2.9 "Solicitud" aparece pero no existe (§5, §9)
- **HECHO:** §5 dice que el Solicitante "crea solicitudes de compra o servicio". §9 no tiene solicitudes: la orden de compra empieza en "Borrador". El glosario (§3) tampoco las define.
- **OPINIÓN:** la solución más simple es que la solicitud de compra sea una orden en "Borrador" creada por el Solicitante, y no sumar un documento nuevo. Falta confirmar con el CEO.

### 2.10 Permisos: aparece un "alcance" que el modelo no contempla (§5)
- **HECHO:** el Solicitante "ve las propias" (§5). Esto ya es un permiso con **alcance** ("solo lo mío" frente a "todo"), no un simple sí/no. §5 también dice que el administrador puede "modificar los existentes", sin proteger el rol Administrador (alguien podría quitarse a sí mismo todos los permisos y dejar la empresa sin nadie que pueda arreglarlo).
- **HECHO:** no dice si una persona tiene un solo rol por empresa o varios, ni si algún rol debe ver solo ciertas sedes o ubicaciones.
- **OPINIÓN:** hay que decidir esto antes de la Etapa 1, porque el modelo de permisos es lo primero que se construye y lo más difícil de cambiar.

### 2.11 "Eliminó" y "dar de baja" (§5, §8, §11)
- **HECHO:** §11 audita "quién eliminó" y §5 da el permiso "dar de baja", pero §8 no dice si una baja se puede revertir ni si algo se borra de verdad.
- **OPINIÓN:** en una plataforma cuyo propósito es trazabilidad, nada con historia se borra: se da de baja, se inactiva o se anula, con motivo. El borrado físico queda solo para borradores que nunca tuvieron efecto.

### 2.12 Catálogos "nuevos sin ayuda técnica" (§6)
- **HECHO:** el documento pide que el administrador cree catálogos nuevos. Pero marca, modelo, proveedor y ubicación tienen datos propios (el proveedor tiene contacto y documento fiscal; el modelo depende de una marca; la ubicación puede ser un árbol sede > piso) y se usan en SKU, órdenes y activos.
- **OPINIÓN:** si todo fuera un catálogo genérico de "nombre y valor", perderíamos esas relaciones. Si todo fuera tabla propia, no se podrían crear catálogos nuevos. Ver la propuesta en la sección 3. Falta saber para qué usaría el CEO un catálogo nuevo (lo más probable: opciones para un campo de lista).

### 2.13 Cosas que el documento da por supuestas y cuestan dinero o trabajo
- **HECHO:** no se habla de archivos adjuntos (factura, guía, acta de entrega firmada). §8 pide "constancia de la entrega y de la devolución", pero no dice si es un registro en pantalla, un documento imprimible o una firma.
- **HECHO:** no se dice si "Emitida al proveedor" (§9) significa que el sistema manda un correo o PDF al proveedor, o solo cambia de estado.
- **HECHO:** las invitaciones por correo (§4) exigen un servicio de envío de correos; eso es una dependencia y un costo.
- **HECHO:** no hay numeración de las órdenes de compra y de servicio (el número que se imprime y se cita en la oficina). Es un correlativo por empresa, igual de delicado que el del SKU.
- **HECHO:** el riesgo #4 y el pendiente #7 hablan de importar el Excel de inventario inicial, pero §2 no incluye importación en el alcance de la versión 1. Hay que decidir si entra y en qué etapa.
- **HECHO:** §8 pone "la orden de compra de origen" como dato del activo. Los activos que ya existen hoy (los del Excel) no tienen orden en este sistema. Ese campo tiene que ser opcional.
- **HECHO:** el volumen (pendiente #4) no está. **OPINIÓN:** mientras sean decenas de miles de activos por empresa, una sola base de datos sin particiones ni nada exótico alcanza de sobra. Lo asumo así y lo anoto como supuesto, no como cifra.

### 2.14 Órdenes de servicio (§10)
- **HECHO:** "a quién se asigna (técnico interno o proveedor)" son dos tipos de destino distintos (persona de la empresa o proveedor del catálogo). Tampoco se define si abrir una OS sobre un activo lo pone automáticamente "En reparación".
- **OPINIÓN:** no bloquea las Etapas 1 a 5. Propongo diseñar la OS más adelante y mantenerla desacoplada del inventario hasta que el CEO responda el pendiente #3.

## 3. Qué cambiaría (propuesta concreta)

Principio: lo más simple que cumpla; una sola forma de hacer cada cosa.

### 3.1 Estructura del proyecto
Una sola aplicación (Next.js) dividida en módulos con fronteras claras: `acceso`, `catalogos`, `skus`, `inventario`, `compras`, `servicios`, `auditoria`. Cada módulo tiene una **capa de servicios** que es el único lugar que toca la base de datos y el único que aplica reglas de negocio. Las pantallas y las rutas llaman a servicios; nunca a la base de datos directamente. No hay microservicios ni colas: no los necesitamos con el volumen supuesto.

### 3.2 Multiempresa (ADR-001)
- **Una base de datos compartida**, con la columna `empresa_id` en cada tabla con datos del negocio.
- **Un solo punto de entrada**: cada operación recibe un contexto `{ usuarioId, empresaId }` que sale de la sesión (la empresa activa que el usuario eligió) y se comprueba su pertenencia en cada petición. El cliente nunca manda un `empresa_id` que el servidor acepte sin verificar.
- **Una sola función para filtrar por empresa**; no se escriben filtros a mano en cada consulta.
- **Defensa en dos capas**: (1) esa función en el servidor; (2) reglas en la propia base de datos (seguridad por fila de PostgreSQL), de modo que una consulta que olvide el filtro devuelva nada en vez de datos ajenos. Esto responde al riesgo #2.
- **Claves foráneas compuestas** `(empresa_id, id)`: así una orden de la empresa A no puede, ni por error ni por ataque, apuntar a un SKU de la empresa B.
- Antes de comprometernos, un **prototipo corto** (1-2 días) que pruebe que Prisma funciona bien con esas reglas por fila y con el pool de conexiones. Es el principal riesgo técnico de la Etapa 1.

### 3.3 Identidad y empresas (ADR-002)
- `usuario` (global, identificado por un id interno; el correo es un dato que puede cambiar) y `membresía` = (usuario, empresa, rol, estado). Aquí vive "una persona en varias empresas".
- `persona` (empleado/custodio) como entidad **separada** del usuario, con vínculo opcional a un usuario. Los activos se asignan a personas. Resuelve 2.2.
- Un **administrador de plataforma** (nosotros) que da de alta empresas y su primer administrador. En la versión 1 **no hay autoregistro abierto** de empresas, salvo que el CEO decida otra cosa (pregunta 1).
- Invitación a un correo que ya tiene cuenta: se suma una membresía; no se crea otra cuenta.

### 3.4 Permisos (ADR-003)
- **Catálogo fijo de permisos definido en el código**: pares `módulo.acción` (por ejemplo `ordenes_compra.aprobar`). Lo que se configura por empresa es qué roles tienen cuáles, no la lista de permisos.
- **Alcance** en el permiso: `todo` o `propios`. Con esto el Solicitante (§5) entra en el modelo sin trucos. No incluyo restricción por sede hasta que el CEO diga que la necesita (pregunta 7), pero el modelo queda preparado para agregarla.
- **Un rol por usuario y empresa** en la versión 1 (más simple de explicar y auditar).
- **Rol Administrador protegido**: no se le pueden quitar permisos clave y la empresa siempre debe tener al menos un administrador activo.
- Los roles iniciales (§5) son **plantillas que se copian** al crear la empresa; después cada empresa edita su copia sin afectar a las demás.
- **Una sola función** `exigirPermiso(contexto, "modulo.accion")` en la capa de servicios. Es el único sitio donde se comprueba; la pantalla solo la usa para ocultar botones.
- Separación de funciones como regla de negocio en el servidor: quien creó una orden de compra no puede aprobarla (a confirmar con el auditor de cumplimiento).

### 3.5 Campos personalizados (ADR-007, antes de la Etapa 2)
- Cada **definición de campo** pertenece a una categoría y declara **a qué se aplica**: "al tipo de artículo (SKU)" o "a cada unidad (activo)". Así RAM va al SKU e IMEI a la unidad.
- Los valores se guardan como JSON dentro de la fila del SKU o del activo, **validados en el servidor** contra las definiciones. Más simple que una tabla con un renglón por valor y suficiente para el volumen.
- Cada campo tiene un **identificador estable**, distinto de su nombre visible; así renombrar un campo no rompe datos.
- Reglas de cambio: un campo con datos **no se borra, se desactiva**; no se cambia su tipo una vez que hay datos; un campo obligatorio nuevo exige un valor por defecto o aplica solo a lo que se cree desde ese momento.
- Subcategorías: heredan los campos del padre (propuesta; a confirmar).
- Los catálogos personalizados que el administrador cree alimentan los campos de tipo "lista".

### 3.6 Catálogos (híbrido)
- Entidades con datos propios y relaciones (marca, modelo, proveedor, ubicación, centro de costo): **tabla propia cada una**.
- Catálogos adicionales que el administrador crea: un mecanismo **genérico** de listas simples (nombre y valores), que sirve también para los campos de tipo lista.
- Los valores **no se borran, se desactivan** (están referenciados por datos viejos).

### 3.7 Numeración de SKU, órdenes y demás correlativos
- Un contador por (empresa, clave de numeración) actualizado dentro de la misma transacción que crea el registro. Sin huecos garantizados no se promete; **duplicados nunca**: la base de datos rechaza repetidos.
- Reglas propuestas del SKU:
  - La unicidad no distingue mayúsculas de minúsculas y es por empresa.
  - El código **no se reutiliza ni se edita** después de que el SKU tiene movimientos o activos.
  - El código escrito a mano no mueve el contador (no hay colisión porque el sistema salta los que ya existan).
  - El ancho del número es mínimo, no tope: pasar de 9999 no rompe nada.
  - Cambiar el prefijo de una categoría no cambia los SKUs ya creados.
  - Las subcategorías usan el prefijo de su categoría raíz salvo que se defina uno propio (a confirmar).
- Las órdenes de compra y de servicio usan el mismo mecanismo de contador.
- **No se permite** cambiar el modo de control (serie/cantidad) ni la categoría de un SKU que ya tiene activos o stock.

### 3.8 Inventario y movimientos (ADR-008, antes de la Etapa 4)
- **Una sola tabla de movimientos** para los dos modos (en serie, cantidad 1 por unidad). Es el historial de §8 y la fuente de verdad.
- Para el modo cantidad, el **saldo por (SKU, ubicación)** se actualiza en la misma transacción y la base de datos impide que sea negativo (propuesta; pregunta 5 de abajo cubre el sobrante en recepción).
- **Estados del activo**: lista fija definida en el sistema (la del documento) con reglas de transición en el servidor, no configurable en la versión 1, porque las reglas (por ejemplo "de baja" bloquea la asignación) dependen del estado. Si el CEO pide otros estados, se cambia en un solo lugar.
- Serie única por (empresa, SKU, serie normalizada: sin espacios y en mayúsculas). Pendiente de validar con el ingeniero de datos. Serie vacía: permitida solo si el SKU lo autoriza.
- Los activos existentes (Excel) no necesitan orden de compra de origen.
- **Baja**: estado final con motivo, reversible solo con un permiso específico y siempre con historial. No existe borrado de activos.

### 3.9 Compras y recepción
- La orden de compra tiene líneas (SKU, cantidad, precio, moneda). Moneda y reglas de impuestos según pregunta 4.
- La **recepción** es un documento propio con líneas. Una orden puede tener varias. La cantidad recibida de una línea se calcula sumando recepciones confirmadas, no se escribe a mano.
- Confirmar una recepción es **una sola transacción** y es idempotente (un doble clic no crea los activos dos veces).
- Corregir una recepción confirmada: se registra una **reversión** (movimiento contrario), nunca se borra.
- "Cerrada" se alcanza cuando todo se recibió o cuando alguien con permiso la cierra de forma manual con motivo.
- Editar una orden ya aprobada la devuelve a "Pendiente de aprobación".
- Aprobación en la versión 1: reglas simples por empresa del tipo "si el monto supera X, aprueba el rol Y". Multi-nivel solo si el CEO lo pide (pendiente #1).
- Dinero: siempre decimal exacto, nunca número de coma flotante.

### 3.10 Auditoría (ADR-005)
- Una tabla de eventos que solo se escribe, nunca se actualiza ni se borra: quién, cuándo, empresa, qué entidad, qué acción, valores antes y después.
- Se escribe **en la misma transacción** que el cambio: si el cambio ocurre, la auditoría existe; si falla, no queda un cambio sin rastro.
- No duplica al historial de movimientos de §8: ese es dato de negocio (qué pasó con el activo); la auditoría es control (quién tocó qué). Dos cosas distintas.
- Las claves de licencia no se guardan en claro en la auditoría. Retención y datos personales: lo define el auditor de cumplimiento.

### 3.11 Convenciones de datos (ADR-006)
- Identificadores internos no secuenciales (UUID); los códigos para humanos (SKU, número de orden) son aparte.
- Fechas de calendario (compra, garantía) como fecha; momentos exactos en UTC.
- Cambios de base de datos siempre con migraciones versionadas (Prisma Migrate), revisadas por el ingeniero de datos.
- Nada con historia se borra: se desactiva, se anula o se da de baja.

### 3.12 Decisiones técnicas por cerrar antes de la Etapa 1
| # | Decisión | Quién | Cuándo |
|---|---|---|---|
| 1 | Cómo se aísla cada empresa (columna + claves compuestas + seguridad por fila) y prototipo con Prisma | Arquitecto + Ingeniero de Datos + Seguridad | Antes de escribir la primera tabla |
| 2 | Cómo se entra: método de acceso, verificación de correo, servicio de envío de correos | Seguridad + DevOps + Arquitecto | Antes de Etapa 1 |
| 3 | Modelo de usuario / membresía / persona y quién da de alta empresas | Arquitecto + Analista | Antes de Etapa 1 |
| 4 | Catálogo de permisos y alcance (todo / propios) | Arquitecto + Analista | Antes de Etapa 1 |
| 5 | Estructura de carpetas y capa de servicios | Arquitecto + Desarrolladores | Inicio de Etapa 1 |
| 6 | Auditoría (formato y transaccionalidad) | Arquitecto + Auditores | Etapa 1 |
| 7 | Convenciones de datos (IDs, dinero, fechas, borrado) | Arquitecto + Ingeniero de Datos | Etapa 1 |
| 8 | Campos personalizados (nivel SKU o unidad) | Arquitecto + Analista | Antes de Etapa 2 |
| 9 | Movimientos y saldos de inventario | Arquitecto + Ingeniero de Datos | Antes de Etapa 4 |

Cada una se registrará como una decisión corta en `docs/arquitectura/` (contexto, opciones, decisión, consecuencias) una vez cerrada la mesa.

### 3.13 Cambios al documento funcional que pediría al analista
- Aclarar en §6/§7 que cada campo se aplica a "SKU" o "unidad".
- Definir "persona/responsable" distinta de "usuario" en el glosario.
- Definir quién da de alta empresas y quién es el administrador de plataforma (§4).
- Agregar moneda e impuestos en §9; definir "solicitud" o quitarla de §5.
- Decidir si la importación del Excel entra en la versión 1 (§2).
- Corregir §11: "eliminó" por "anuló / dio de baja", salvo borradores.

### 3.14 Qué preguntaría a los especialistas
**Ingeniero de datos**
1. ¿Funciona la seguridad por fila de PostgreSQL con Prisma y un pool de conexiones? Mi propuesta es fijar la empresa con un ajuste local a la transacción en cada petición, con un usuario de base de datos que no sea el dueño de las tablas. ¿Algún problema?
2. ¿Claves foráneas compuestas `(empresa_id, id)` en todas las tablas: costo de mantenimiento aceptable?
3. Contadores por empresa (SKU, órdenes): ¿tabla de contadores con actualización atómica o secuencias? Mi inclinación es la tabla.
4. Unicidad de series: ¿normalizada, por empresa+SKU? ¿Cómo permitir el reingreso de una serie ya dada de baja sin duplicar?
5. JSON para campos personalizados: ¿índices suficientes para buscar y filtrar con el volumen que se estime? ¿Qué restricciones podemos poner a nivel de base para no depender solo de la validación en el servidor?

**Especialista de seguridad**
1. "Cualquier correo": ¿enlace por correo, contraseña o cuenta de Google/Microsoft? ¿Cómo evitamos que alguien tome una invitación que no era suya?
2. Claves de licencia (series de licencias) son secretos: ¿cifrado por columna, quién puede verlas y se audita cada lectura?
3. Administrador de plataforma: ¿cómo se limita y audita su acceso a datos de las empresas?
4. ¿Es suficiente "función de servidor + seguridad por fila" como defensa del aislamiento, o piden algo más (por ejemplo bases separadas para empresas grandes)?
5. Límites de intentos, duración de sesión y cambio de empresa activa: ¿qué mínimo exigen?

## 4. Preguntas para el CEO (cerradas, con opciones y mi recomendación)

1. **¿Para quién es la plataforma?**
   (a) Solo para las empresas de su grupo; las da de alta usted o nosotros. (b) Para ofrecerla a otras empresas que se registran solas. (c) Para ofrecerla a otras empresas, pero las damos de alta nosotros.
   *Recomendación: (c) en la versión 1. Es seguro y se puede abrir más adelante.*
2. **Los equipos se entregan a empleados. ¿Todos esos empleados van a entrar a la plataforma?**
   (a) No, la mayoría solo recibe el equipo. (b) Sí, todos tendrán usuario.
   *Recomendación: (a). Tendremos una lista de empleados aparte de los usuarios.*
3. **Datos como RAM y disco son del modelo de equipo; IMEI, línea telefónica y vencimiento de licencia son de cada unidad. ¿Está de acuerdo en que cada campo se marque como "del artículo" o "de cada unidad"?**
   (a) Sí. (b) No, todos van en el artículo. (c) No, todos van en cada unidad.
   *Recomendación: (a).*
4. **Dinero en las órdenes de compra.**
   (a) Cada empresa usa una sola moneda. (b) Cada orden puede ir en una moneda distinta, sin conversión automática. (c) Varias monedas con tipo de cambio.
   *Recomendación: (a) para la versión 1. Y confirmar si los precios llevan impuestos incluidos.*
5. **Si llega más mercadería de la pedida, ¿qué hace el sistema?**
   (a) No lo permite. (b) Lo permite con aviso a quien tenga permiso. (c) Lo permite sin más.
   *Recomendación: (a).*
6. **¿Una persona puede tener más de un rol dentro de la misma empresa?**
   (a) Un solo rol. (b) Varios roles que se suman.
   *Recomendación: (a), más fácil de entender y de auditar.*
7. **¿Algún rol debe ver solo ciertas sedes o ubicaciones (por ejemplo, un técnico solo de su sede)?**
   (a) No, todos ven todo lo que su rol permite. (b) Sí, hace falta limitar por sede.
   *Recomendación: (a) por ahora; dejamos el diseño preparado.*
8. **Licencias con varios puestos: ¿necesita saber qué persona usa cada puesto?**
   (a) No, basta el total. (b) Sí, asignar cada puesto a una persona.
   *Recomendación: (a) en la versión 1.*
9. **La "constancia de entrega y devolución" de un equipo es:**
   (a) Un registro en el sistema con fecha y usuario. (b) Un documento imprimible para firmar. (c) Firma en pantalla.
   *Recomendación: (a) ahora, (b) como mejora posterior.*
10. **¿Se guardan archivos adjuntos (facturas, guías, fotos)?**
    (a) No por ahora. (b) Sí, en órdenes de compra y activos.
    *Recomendación: (a) hasta tener los documentos reales; si es (b), implica almacenamiento extra y costo mensual.*
11. **Un activo dado de baja, ¿puede volver a estar activo?**
    (a) No, nunca. (b) Sí, con un permiso especial y queda registrado.
    *Recomendación: (b).*
12. **El Excel de inventario actual: ¿lo cargamos al sistema al empezar?**
    (a) Sí, como parte de la versión 1. (b) No, se empieza de cero.
    *Recomendación: (a), en la Etapa 4. Pero hace falta el Excel real para planearlo.*

Aviso de costo: enviar invitaciones por correo y, si aplica, órdenes a proveedores requiere contratar un servicio de envío de correos (costo mensual bajo, a confirmar con DevOps).

## 5. Mensajes directos

No se enviaron mensajes en esta ronda: la sesión estaba en modo plan (solo lectura) y enviar mensajes se consideró una acción de ejecución. Queda anotado para la Jefatura. Mensajes preparados (máximo 3):

1. A `ingeniero-datos`:
   "¿Funciona la seguridad por fila de PostgreSQL con Prisma y pool de conexiones fijando la empresa en cada transacción?
   Quiero además claves foráneas compuestas (empresa_id, id) en todas las tablas. ¿Te parece mantenible?"
2. A `especialista-seguridad`:
   "¿Qué método de acceso recomiendas para 'cualquier correo' (enlace por correo, contraseña, Google/Microsoft)?
   Y las claves de licencia son secretos: ¿cifrado por columna y auditoría de lectura?"
3. A `analista-funcional`:
   "¿Los campos personalizados de §6 pertenecen al SKU o a cada unidad? IMEI y vencimiento de licencia son de la unidad.
   Propongo que cada campo declare a cuál se aplica; ¿puedes reflejarlo en el documento?"

Respuestas recibidas: ninguna.

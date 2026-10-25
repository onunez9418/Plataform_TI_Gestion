# Mesa de revisión #001 · Ronda 1 · Ingeniero de Datos

(Texto listo para copiar a `docs/equipo/mesa-001/ronda1-ingeniero-datos.md` cuando se salga del modo plan.
Documento revisado: `docs/documento-funcional.md` v0.1. Riesgos: `docs/equipo/riesgos.md`.)

**Rol:** ingeniero-datos (DBA) · **Tema:** documento funcional v0.1 visto desde los datos
**Marca:** HECHO = se comprueba leyendo el documento. OPINIÓN = mi criterio profesional.

---

## 1. Qué está bien

- **Un SKU es un tipo y la serie es la unidad física** (glosario y §7). Es la separación correcta y permite modelar sin mezclar "qué es" con "cuál es".
- **Control por serie o por cantidad en el SKU** (§7). Evita un modelo con tipos especiales; las licencias no necesitan tablas propias.
- **Código de SKU único por empresa** (§7) ya está dicho como regla. Es lo que la base necesita para garantizarlo.
- **La recepción crea los activos** (§9) y admite recepciones parciales. Es un punto donde se puede garantizar "todo o nada".
- **El historial con fecha, usuario y motivo** (§8) encaja con registrar cada movimiento como un renglón que nunca se borra.
- **Multiempresa desde el inicio** (§4). Es mucho más barato que añadirlo después.

## 2. Qué me preocupa

### 2.1 Número de serie: ¿único dónde? (§3, §8) — falta la regla
- HECHO: el documento dice "un SKU puede tener muchas series" pero no dice si la serie es única por SKU, por empresa o en todo el sistema.
- OPINIÓN: los números de serie solo son únicos *por fabricante*. Dos marcas distintas pueden repetir un número. Exigir unicidad en toda la empresa puede impedir registrar un equipo legítimo. Mi propuesta es única por empresa + SKU, con un **aviso** si el mismo número ya existe en otro SKU de la empresa.
- HECHO (riesgo real): Excel convierte los IMEI de 15 dígitos en notación científica (3,5E+14) y borra ceros a la izquierda. Si no normalizamos (quitar espacios, mayúsculas) tendremos "duplicados" que no se ven y series dañadas.

### 2.2 Serie dada de baja y luego re-ingresada (§8)
- HECHO: "De baja" es un estado (§8) y la regla "nada de borrar historial" es de mi rol. El documento no dice si una baja se puede revertir ni qué pasa si la misma unidad vuelve (ej. regresa de reparación externa o se dio de baja por error).
- OPINIÓN: una unidad física = **un solo registro para siempre**. Si vuelve, se reactiva el mismo registro y queda un movimiento "re-ingreso" con motivo. Así la unicidad de la serie se mantiene aunque esté de baja, y no se pierde su historia. Lo contrario (crear un segundo registro con la misma serie) rompe el historial.

### 2.3 Asignación y devolución (§8)
- HECHO: "asignar a un usuario o ubicación, con constancia de entrega y devolución". Pero "usuario" en este documento es quien entra a la plataforma (§5). Quien recibe una laptop normalmente es un empleado que **no** tiene acceso a la plataforma.
- OPINIÓN: necesitamos un directorio de **personas** (empleados) separado de los **usuarios** de la plataforma. Es una decisión de modelo que afecta todo, y toca datos personales (lo mira auditor-cumplimiento).
- Cada entrega/devolución debe ser un renglón de historial (desde, hasta, estado en que se devuelve), y la base debe impedir que una unidad esté asignada a dos personas a la vez.
- HECHO: la palabra "devolución" aparece una vez. Puede significar devolución del empleado o devolución al proveedor. Son cosas distintas y el documento solo habla de la primera.

### 2.4 Correlativo del SKU (§7)
- HECHO: el documento dice "prefijo + correlativo" y permite código propio, pero no dice qué pasa en estos casos:
  - Se **anula/inactiva** un SKU: ¿su número se reutiliza? OPINIÓN: **nunca**; los huecos son aceptables, un código reutilizado confunde reportes y OC antiguas.
  - Un usuario escribe a mano `LAP-0005` y luego el correlativo automático llega a 5: hay que saltar los ocupados.
  - Dos personas crean SKU a la vez: el contador debe ser atómico en la base (no "leer el máximo y sumar uno").
  - `lap-0001` vs `LAP-0001`: hay que normalizar mayúsculas y espacios antes de comparar.
  - ¿Se puede cambiar el código después de creado? OPINIÓN: no, si ya tiene movimientos u OC.
  - El contador es por empresa + prefijo. Si se cambia el prefijo de una categoría, los SKU antiguos conservan su código.
- Subcategorías (§6): "Periféricos > Mouse". HECHO: no queda claro si la subcategoría tiene prefijo propio o usa el de la categoría padre.

### 2.5 Stock negativo (§8)
- HECHO: no se dice si se puede sacar más de lo que hay.
- OPINIÓN: **no se permite**, y que lo garantice la base (no solo la pantalla). El stock se calcula/valida a partir de un registro de movimientos (ingreso, salida, traslado, ajuste). Las correcciones se hacen con un "ajuste" con motivo, nunca editando el saldo. Dos salidas simultáneas no deben poder dejar el saldo bajo cero.

### 2.6 Licencias: serie vs cantidad (§7) — ambiguo
- HECHO: el documento resuelve licencias con el modo de control, pero el ejemplo de §6 dice que una licencia tiene "fecha de vencimiento" y "número de puestos". Eso se solapa con el modo "por cantidad: total de licencias o puestos". No está claro:
  - Si una clave con 50 puestos es **una** serie (con puestos=50) o 50 unidades.
  - Si hay que saber **quién usa cada puesto** (¿se asigna a personas?).
  - Quién controla el vencimiento: es propio de **cada clave**, no del tipo de artículo.

### 2.7 Campos personalizados: ¿del SKU o de la unidad? (§6) — la ambigüedad más importante para modelar
- HECHO: §6 dice que los campos "heredan todos sus SKUs". Pero los ejemplos mezclan dos niveles: RAM, disco, procesador son iguales para todas las unidades del mismo modelo (nivel SKU), mientras que IMEI, número de línea y fecha de vencimiento son distintos por cada unidad (nivel activo).
- OPINIÓN: hacen falta **dos juegos de campos** por categoría: los del SKU y los de cada unidad. Si no se decide ahora, habrá que rehacer el modelo.
- También faltan reglas de cambio: si ya hay datos y se cambia un campo de número a texto, se quita una opción de una lista, o se vuelve obligatorio un campo que los SKU antiguos no tienen. OPINIÓN: no permitir cambiar el tipo si ya hay valores; las opciones en uso se desactivan, no se borran.
- Si un SKU cambia de categoría, sus campos cambian. Hay que decidir si eso se permite (OPINIÓN: no, si tiene movimientos).

### 2.8 Moneda, impuestos, precios y unidades de medida (§7, §9) — el documento no los trata
- HECHO: §9 dice "cantidad y precio por línea" y §9 pendiente habla de aprobar "por monto". No aparece ninguna de estas palabras: moneda, impuesto, descuento, total, tipo de cambio.
- Consecuencias para los datos:
  - **Moneda:** si una empresa compra en dos monedas, ¿en cuál se compara el monto para decidir quién aprueba? Sin moneda registrada, el monto no significa nada. OPINIÓN: cada OC lleva **una** moneda (código estándar de 3 letras); cada empresa define una moneda base; v1 sin conversión automática, pero guardando siempre la moneda junto al importe.
  - **Impuestos:** si los precios van con o sin impuesto, y cuántos impuestos distintos hay. OPINIÓN: porcentaje de impuesto por línea, guardado en la línea en el momento de la compra (no leído después de un catálogo, porque las tasas cambian).
  - **Precios:** el SKU no debería tener precio fijo; el precio vive en la línea de la OC. Los importes se guardan como números exactos (nunca decimales de coma flotante) y con 4 decimales en el precio unitario.
  - **Costo del activo:** OPINIÓN: guardar costo de compra y moneda en cada activo al recibirlo. Cuesta nada hoy y es casi imposible reconstruir después (lo necesitan seguros, garantía y futuras depreciaciones).
  - **Unidad de medida:** HECHO: el SKU tiene "unidad de medida" (§7) pero no hay catálogo ni conversiones. OPINIÓN: catálogo por empresa, sin conversiones en v1, y una marca de "admite decimales" (cables por metro sí; laptops no). Un SKU con serie siempre es de a 1.
  - **OC cambiada después de aprobada:** HECHO: no se dice. OPINIÓN: guardar quién aprobó y por qué monto; un cambio posterior obliga a nueva aprobación.
  - **Recepción mayor a lo pedido, o recepción registrada por error:** no dicho. OPINIÓN: no recibir más de lo pedido salvo permiso; un error se corrige con una anulación, no borrando.
  - **Número de OC y de OS:** no dicho; tienen el mismo problema de correlativo que el SKU (por empresa, sin duplicados).

### 2.9 "Eliminó" en auditoría (§11) contra "nada se borra"
- HECHO: §11 registra quién "eliminó" un registro. Mi principio de rol es que nada con historial se elimina.
- OPINIÓN: lo único que se borra de verdad son borradores que nunca salieron. Todo lo demás se marca (inactivo, de baja, anulada). La auditoría debe guardar valor anterior y nuevo, y que ni la propia aplicación pueda modificarla ni borrarla. Los datos personales dentro de la auditoría los revisa auditor-cumplimiento.

### 2.10 Estados del activo (§8 y pendiente #2)
- HECHO: quedó [PENDIENTE]. Solo faltan "Extraviado/Robado", "En préstamo", "En tránsito" frente a lo que dicen los 4 estados propuestos; no los invento.
- OPINIÓN: los estados deben ser una lista **cerrada** (la base verifica que no haya valores inventados) y no un catálogo libre por empresa; si cada empresa los cambia, los reportes y las reglas de negocio se rompen. Mejor: lista fija, con nombre visible configurable.

### 2.11 Personas en varias empresas (§4)
- HECHO: "una persona puede pertenecer a más de una empresa".
- OPINIÓN: una identidad global (correo) y una "membresía" por empresa con su rol. Un mismo correo en mayúsculas/minúsculas debe ser la misma cuenta. Los catálogos (marcas, ubicaciones) pertenecen a cada empresa; no se comparten en v1.
- HECHO (técnico, para el arquitecto): el aislamiento "en la base" depende de que cada consulta lleve la empresa activa. Con conexiones compartidas, un fallo aquí es el riesgo #2 del registro.

### 2.12 Importación del Excel inicial (pendiente #7, riesgo #4)
- HECHO: todavía **no hemos visto el Excel** (pendiente #7). No puedo diseñar columnas ni reglas sin verlo.
- Lo que sí ya se sabe que necesitamos:
  - Una plantilla con columnas fijas y una vista previa ("simulacro") que informa error **fila por fila** antes de guardar nada.
  - **Todo o nada**: si hay un error, no se carga nada. Un lote parcial es imposible de reconciliar.
  - Un registro de cada importación (quién, cuándo, archivo, filas cargadas) y la posibilidad de **deshacer un lote completo** si todavía no tiene movimientos posteriores.
  - Reglas de limpieza: series con espacios/ceros/notación científica, duplicados dentro del mismo archivo, series vacías en SKU con control por serie, textos libres de estado que hay que mapear a los 4 estados, marcas y ubicaciones escritas distinto ("Dell", "DELL ", "dell").
  - Responsables del Excel que no son usuarios: relacionado con 2.3.
  - Stock inicial de artículos por cantidad: se carga como un movimiento "saldo inicial" por ubicación, no como un número suelto.
  - ¿Crear automáticamente marcas/ubicaciones nuevas que vienen en el Excel o rechazar la fila? OPINIÓN: rechazar y listar los valores desconocidos para que el administrador los apruebe de una vez.

### 2.13 Volumen (pendiente #4)
- OPINIÓN: sin cifras no puedo medir índices. Con hasta unos cientos de miles de activos no hace falta nada especial (ni particiones). Pido el dato antes de optimizar, como dice mi rol: "medidos y no supuestos".

## 3. Qué cambiaría (propuestas concretas al documento)

1. §8: añadir "la serie es única por empresa y SKU; se avisa si ya existe en otro SKU de la empresa. Una baja se puede revertir con permiso y motivo; la unidad nunca se duplica".
2. §7: añadir reglas del código: normalizado (mayúsculas, sin espacios), no reutilizable, no editable si hay movimientos, el automático salta los ya ocupados.
3. §8: añadir "no se puede dejar stock negativo" y "las correcciones son ajustes con motivo".
4. §6/§7: separar **campos del SKU** y **campos de cada unidad** (con ejemplos reales: IMEI y vencimiento son de la unidad).
5. §5/§8: crear el concepto de **Persona** (quien recibe equipos) distinto de **Usuario** (quien entra a la plataforma).
6. §9: añadir moneda, impuesto por línea, total, y la regla de la moneda para aprobación por montos. Añadir numeración de OC y OS.
7. §3/§7: catálogo de unidades de medida con "admite decimales".
8. §11: cambiar "eliminó" por "dio de baja / anuló"; solo se eliminan borradores. Auditoría no modificable.
9. §12: añadir a la lista de pendientes las reglas de importación inicial, y subir la prioridad de "ver el Excel real" (hoy es el #7 de 7; es lo que más puede cambiar el modelo).

## 4. Preguntas para el CEO (cerradas)

1. **Si se registra un número de serie que ya existe en otro artículo distinto de la empresa, ¿qué hacemos?**
   a) Bloquearlo siempre. b) Avisar y dejar continuar. **Recomiendo b)**: dos marcas pueden repetir números y bloquear dejaría sin registrar un equipo legítimo.
2. **Un equipo dado de baja, ¿puede volver a ingresar?**
   a) Sí, con motivo y permiso especial, y queda el historial. b) No, nunca. **Recomiendo a)**: hay bajas por error y equipos que regresan de reparación externa.
3. **Si alguien quiere sacar 5 mouses y solo hay 3, ¿qué debe pasar?**
   a) Impedirlo. b) Dejarlo y marcar el stock en negativo. **Recomiendo a)**: un saldo negativo oculta pérdidas.
4. **¿Compran en más de una moneda (dólares y soles, por ejemplo)?**
   a) Una sola moneda por empresa. b) Cada orden de compra elige su moneda, sin conversión automática. c) Varias monedas con conversión. **Recomiendo b)** para la primera versión; c) cuesta más y depende de un tipo de cambio oficial.
5. **¿Los precios de compra incluyen impuestos?** a) Sí. b) No, se suman aparte. c) Depende del proveedor. Y: ¿hay un solo impuesto o varios? (Indicar país si ayuda). **Sin recomendación hasta saber el país.**
6. **Una licencia de 50 puestos, ¿se asigna a 50 personas una por una?** a) Sí, hay que saber quién usa cada puesto. b) No, solo importa el total y el vencimiento. **Recomiendo b)** para la primera versión, a no ser que auditoría de licencias sea una necesidad.
7. **Los empleados que reciben equipos, ¿tienen acceso a la plataforma?** a) Sí, todos. b) No, la mayoría solo recibe equipos. **Recomiendo tratar a la persona que recibe como un registro aparte del usuario** (b); si todos entran, se vincula igual.
8. **El código de un SKU anulado, ¿se puede reutilizar?** a) Nunca. b) Sí. **Recomiendo a).**
9. **Excel inicial con errores: ¿qué prefieren?**
   a) Si hay una sola fila mala, no se carga nada hasta corregir. b) Se cargan las buenas y se devuelve la lista de las malas. **Recomiendo a)**: cargas parciales son difíciles de reconciliar. Además, **necesito ver el Excel real cuanto antes**.
10. **Datos como IMEI o vencimiento de licencia, ¿son propios de cada unidad (cada celular, cada clave)?** Confirmar con un ejemplo. **Recomiendo asumir que sí.**

## 5. Mensajes directos

Estado: **NO ENVIADOS.** Sesión en modo plan (solo lectura; no puedo ejecutar SendMessage). Textos preparados, máximo 3, para enviar tal cual al salir del modo plan:

**A arquitecto-software**
> ¿Los campos personalizados irán en una columna JSON validada o en tablas propias?
> Necesito saber esto antes de modelar: además hay dos niveles (campos del SKU y campos de cada unidad, ej. IMEI) y ambos entran en la elección.

**A arquitecto-software**
> Aislamiento por empresa en la base: ¿aceptas reglas de seguridad por fila (RLS) como obligatorias, con la empresa activa fijada en cada transacción?
> Si usamos Prisma con conexiones compartidas, hay que definirlo en el diseño y probarlo desde el primer día.

**A arquitecto-software**
> ¿El correlativo (SKU, OC, OS) lo genera la base de datos con contador atómico por empresa+prefijo, o la aplicación?
> Yo propongo la base; así dos personas simultáneas nunca duplican. Y: ¿Persona (empleado) y Usuario van como entidades separadas?

Respuestas recibidas: ninguna.

---

## Nota para la Jefatura de Proyecto (versión de la entrega final)

(Ver el mensaje de cierre de este trabajo.)

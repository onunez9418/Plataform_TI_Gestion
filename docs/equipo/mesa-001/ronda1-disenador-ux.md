# Mesa de revisión #001 · Ronda 1 · Diseñador UX/UI

> NOTA DE PROCESO: este texto debe copiarse tal cual a `docs/equipo/mesa-001/ronda1-disenador-ux.md`.
> No pude escribirlo allí porque la sesión estaba en modo planificación (solo permite escribir este archivo).
> Tampoco envié mensajes directos; los dejo redactados en la sección 5 para enviarlos cuando se pueda.

Tema: documento funcional v0.1
Rol: Diseñador UX/UI (`disenador-ux`)
Leí: CLAUDE.md, `docs/documento-funcional.md`, `docs/equipo/riesgos.md`.

---

## 1. Qué está bien

- El documento habla en el idioma de la empresa (Activo, Serie, Orden de compra, Recepción). Eso se puede llevar tal cual a las pantallas, sin traducir.
- Separar "por serie" y "por cantidad" es la decisión correcta. Se traduce en dos experiencias distintas (una tabla de unidades y un contador de stock), y eso evita formularios confusos.
- Los flujos de OC y OS son cortos y con nombres claros. Cada estado puede ser una etiqueta visible.
- La recepción es el momento donde nacen los activos. Esto da una pantalla muy clara y valiosa: "llegó la mercadería, registro las series, se crea el inventario".
- Los pendientes (sección 12) están bien identificados. El estado de los activos y los montos de aprobación afectan directamente a las pantallas, así que me alegra que estén abiertos y no inventados.
- Permitir recepciones parciales es realista.

## 2. Qué me preocupa

Marco cada punto como HECHO (se verifica en el documento) u OPINIÓN (juicio mío de diseño).

**2.1 La captura de series en bloque está descrita en una sola frase (§9).**
- HECHO: §9 dice "se capturan los números de serie (a mano o pegando una lista)". No dice qué pasa si:
  - la lista trae una serie repetida;
  - la serie ya existe en el inventario;
  - llegan 38 series y la recepción dice 40;
  - se equivocaron al teclear y ya confirmaron.
- OPINIÓN: esta es la tarea más pesada y más propensa a error de todo el sistema (almacén recibiendo 40 laptops). Si no la diseñamos con cuidado, será la pantalla más odiada. Hay que decidir las reglas antes del prototipo.

**2.2 Los datos por unidad no tienen dónde vivir (§6, §7).**
- HECHO: §6 dice que los campos personalizados los "heredan todos sus SKUs". Pero los ejemplos del propio documento (IMEI, número de línea del celular, y en parte la fecha de vencimiento de una licencia) son datos de cada unidad, no del tipo de artículo. En cambio RAM, disco y procesador sí son del SKU.
- OPINIÓN: hoy el documento mezcla "datos del tipo de artículo" con "datos de cada unidad". Si no se separan, el IMEI quedaría escrito una sola vez en el SKU, lo cual no tiene sentido. Esto cambia el diseño del formulario del SKU, de la recepción y de la ficha del activo.

**2.3 Quién recibe el equipo no está definido (§4, §5, §8).**
- HECHO: §8 dice que un activo se asigna "a un usuario o ubicación". En §5 "usuario" es quien entra a la plataforma con un rol.
- OPINIÓN: la mayoría de los empleados que reciben una laptop no van a entrar nunca a la plataforma. Si obligamos a que todo receptor sea un usuario, cada entrega obliga a invitar a alguien por correo, lo cual es absurdo. Hace falta una lista de "personas" (receptores) separada de los "usuarios" (quienes operan el sistema). Esto toca datos personales, así que el auditor de cumplimiento debe opinar.

**2.4 La constancia de entrega y devolución es ambigua (§8).**
- HECHO: dice "queda constancia de la entrega y de la devolución", sin decir qué es esa constancia (¿un registro en pantalla? ¿un documento para firmar?).
- OPINIÓN: en la práctica el técnico necesita imprimir o enviar un acta. Cambia mucho el trabajo (y el costo) según la respuesta.

**2.5 No hay nada sobre búsqueda, filtros ni exportación.**
- HECHO: las palabras buscar, filtrar y exportar no aparecen en el documento. Sí aparece el "Excel de inventario actual" (pendiente 7).
- OPINIÓN: "buscar un SKU" y "ver las series de un SKU" son las tareas más frecuentes. Tienen que estar escritas como requisito, o nadie las va a medir ni probar. Propongo que cada lista tenga buscador, filtros por estado/ubicación/categoría y botón Exportar.

**2.6 Estados del activo (§8).**
- HECHO: hay cuatro estados y está marcado [PENDIENTE].
- HECHO: no se dice qué cambios entre estados están permitidos (por ejemplo, ¿un activo "De baja" puede volver a "En stock"?) ni qué datos se piden en cada cambio (motivo, fecha, responsable).
- OPINIÓN: faltan casos reales de TI: "Extraviado o robado", y quizá "En tránsito" (traslado entre ubicaciones). Sin ellos, el técnico forzará "De baja" para todo, y el historial mentirá.

**2.7 Aprobaciones (§9).**
- HECHO: el flujo tiene "Pendiente de aprobación → Aprobada", pero no existe el caso de rechazo. No hay estado "Rechazada" ni dice si vuelve a borrador.
- HECHO: §5 dice que el Solicitante crea "solicitudes de compra", pero §9 solo define órdenes de compra. No queda claro si una solicitud es otro documento o es una OC en borrador.
- OPINIÓN: la persona que aprueba necesita una bandeja con lo pendiente, ver de un vistazo el monto, el proveedor, las líneas y quién la pidió, y aprobar o rechazar con un motivo en un par de clics. Hoy el documento no describe esta experiencia.

**2.8 No se dice qué ve cada rol al entrar.**
- HECHO: no hay una pantalla de inicio descrita para ningún rol.
- OPINIÓN: un almacenista, un técnico y la jefatura necesitan cosas distintas al abrir la plataforma (ver tabla en la sección 3.2).

**2.9 Traslados y movimientos de stock por cantidad (§8).**
- HECHO: se mencionan "ingresos, salidas y traslados" pero no cómo se hace un traslado (¿se descuenta de origen y se suma a destino al instante, o queda "en tránsito" hasta que el destino confirma?).
- OPINIÓN: para una sola bodega da igual; para varias sedes importa mucho.

**2.10 La importación del Excel no tiene pantalla en el alcance.**
- HECHO: el riesgo #4 asume una "importación con validación fila por fila y reporte de errores", pero el alcance de la v1 (§2) no menciona ninguna importación.
- OPINIÓN: el día uno el CEO quiere ver su Excel dentro del sistema. Si no está en el alcance, hay que decirlo claramente o agregarlo.

**2.11 Falta cómo se comportan los campos personalizados con datos ya existentes (§6).**
- HECHO: el documento no dice qué pasa si se agrega un campo obligatorio a una categoría que ya tiene SKUs, ni si se puede cambiar el modo de control (serie/cantidad) de un SKU con stock.
- OPINIÓN: sugiero que un campo obligatorio nuevo no bloquee lo existente (se marca "pendiente de completar") y que el modo de control no se pueda cambiar si ya hay stock o series.

**2.12 No hay requisitos de uso (accesibilidad, dispositivos, idioma).**
- HECHO: el documento no menciona celulares/tablets, modo claro/oscuro, formato de fechas y moneda, ni accesibilidad.
- OPINIÓN: el almacén suele trabajar de pie, con tablet o celular y a veces con lector de código de barras. Debemos saberlo antes de diseñar la recepción.

**2.13 Moneda e impuestos en la OC.**
- HECHO: §9 menciona "cantidad y precio por línea", sin moneda, impuestos ni totales.
- OPINIÓN: no lo invento; lo registro como pregunta para el Analista (la pantalla de OC cambia según la respuesta).

## 3. Qué cambiaría (propuestas concretas)

### 3.1 Cambios al documento (para el analista-funcional)

1. Agregar una sección "Tareas por rol" con 3 a 5 tareas reales de cada rol (almacén recibe 40 laptops; técnico asigna un equipo; jefatura aprueba una OC; solicitante pide un servicio). Sirven de criterios de aceptación y de guion para la demo.
2. En §6/§7, separar "campos del SKU" (RAM, procesador) de "campos de cada unidad" (IMEI, línea, vencimiento de licencia). Que cada campo personalizado diga a qué nivel pertenece.
3. En §8, definir "persona receptora" (empleado) distinta de "usuario de la plataforma".
4. En §8, agregar la tabla de cambios de estado permitidos y qué se pide en cada cambio (motivo siempre en baja y extravío).
5. En §9, agregar el estado "Rechazada" (con motivo) y aclarar qué es una "solicitud de compra".
6. En §9, escribir las reglas de captura de series (ver 3.3).
7. Agregar un requisito general: toda lista tiene buscador, filtros y exportación a Excel; toda acción importante muestra una confirmación y se puede deshacer o corregir donde sea posible.
8. Agregar requisitos de uso: funciona en pantalla pequeña, modo claro y oscuro, uso por teclado, estados con texto (no solo color).
9. Decidir si la importación inicial del Excel es parte de la v1.

### 3.2 Qué debe ver cada rol al entrar (propuesta de pantalla de inicio)

| Rol | Primera pantalla | Lo que necesita ver sin hacer clic |
|---|---|---|
| Almacén | "Por recibir" | OC emitidas esperando mercadería, con proveedor y fecha; botón grande "Recibir mercadería"; buscador de series |
| Técnico | "Mi trabajo" | Órdenes de servicio asignadas a él, activos en reparación, buscador de activos; botón "Asignar equipo" |
| Jefatura TI | "Por aprobar" | OC pendientes de aprobación con monto; resumen de activos por estado; últimos movimientos |
| Solicitante | "Mis solicitudes" | Sus solicitudes y su estado; botón "Nueva solicitud" |
| Administrador | "Resumen de la empresa" | Lo de jefatura más accesos a usuarios, roles y catálogos |
| Solo lectura | Buscador | Un buscador grande y los resúmenes |

Además, en todas las pantallas: buscador global arriba (SKU, serie, activo, OC) y selector de empresa visible si la persona pertenece a más de una.

### 3.3 Reglas propuestas para la captura de series en bloque (pantalla estrella)

Es una propuesta de diseño; algunas reglas requieren decisión (ver preguntas).

1. Entrada: el almacenista indica cuántas unidades recibió de cada línea. La pantalla muestra la lista de series con un contador visible "38 de 40 series capturadas".
2. Tres formas de captura en la misma pantalla: pegar una lista (una serie por línea, o separadas por coma o espacio), teclear fila por fila, o escanear con lector (el cursor salta a la siguiente fila automáticamente con Enter).
3. Validación inmediata, mientras escribe:
   - serie repetida dentro de la lista: se marca la fila con texto ("Repetida en fila 12"), no solo con color;
   - serie que ya existe en el inventario: se marca y dice dónde está;
   - espacios sobrantes o mayúsculas/minúsculas: se limpian solos y se avisa;
   - fila vacía: se ignora.
4. Datos comunes a todo el lote (ubicación, fecha de compra, garantía) se piden una sola vez arriba, no 40 veces.
5. Datos por unidad (IMEI, línea) aparecen como columnas adicionales en la misma tabla.
6. Antes de confirmar hay un resumen: "Se crearán 38 activos de LAP-0001 en Bodega Central. Faltan 2 por registrar." con botón "Confirmar y crear activos" y alternativa "Guardar y seguir después".
7. Después de confirmar se puede corregir una serie mal escrita, con motivo, y queda en el historial (no se pierde el rastro).
8. Se puede salir y volver sin perder lo capturado (borrador de recepción).

### 3.4 Lista mínima de pantallas para el prototipo de la Etapa 0

Prioridad A = el CEO no puede aprobar el diseño sin verlas. Prioridad B = completan el recorrido y se pueden hacer después si el tiempo aprieta.

| # | Pantalla | Prioridad | Para qué sirve |
|---|---|---|---|
| 0 | Guía visual (colores, botones, tablas, formularios, estados, claro/oscuro) | A | Que el CEO apruebe el "look" una sola vez |
| 1 | Ingreso y elegir empresa | A | Acceso con correo y selección de empresa |
| 2 | Inicio por rol (3 variantes: Almacén, Técnico, Jefatura) | A | Qué ve cada persona al entrar |
| 3 | Búsqueda global y resultados | A | Encontrar un SKU, serie o activo en segundos |
| 4 | Lista de SKUs (buscador, filtros, exportar) | A | Tarea más frecuente |
| 5 | Ficha del SKU (pestañas: Resumen, Series/Activos, Stock por ubicación, Órdenes de compra, Historial) | A | Ver todas las series de un SKU |
| 6 | Crear / editar SKU (código automático con opción de escribir el propio, campos personalizados) | A | Alta del maestro |
| 7 | Lista de activos (filtros por estado, ubicación, responsable) | A | Control diario del inventario |
| 8 | Ficha del activo (estado, responsable, garantía, OC de origen, historial, acciones) | A | Ver la vida de una unidad |
| 9 | Asignar activo + constancia de entrega | A | Tarea frecuente del técnico |
| 10 | Cambiar estado (a reparación, a baja, extravío) y devolución | B | Cierra el ciclo de vida |
| 11 | Stock por cantidad: ingreso, salida y traslado | B | Mouse, teclados, cables |
| 12 | Lista de órdenes de compra con estados | A | Seguimiento |
| 13 | Crear orden de compra | A | Tarea frecuente |
| 14 | Detalle de OC y aprobación (aprobar / rechazar con motivo) | A | Experiencia de la jefatura |
| 15 | Recepción de mercadería con captura de series en bloque | A | La pantalla clave del producto |
| 16 | Órdenes de servicio: lista, crear y detalle | B | Etapa 6, pero el CEO la mencionó |
| 17 | Categorías y campos personalizados | A | Muestra la configurabilidad |
| 18 | Catálogos (una pantalla genérica reutilizable) | B | Marcas, proveedores, ubicaciones |
| 19 | Usuarios, roles y matriz de permisos | A | Control de accesos |
| 20 | Auditoría (historial de cambios con filtros) | B | Trazabilidad |
| 21 | Importación del Excel inicial (maqueta) | B | Solo si el CEO la confirma en el alcance |

Estados y casos que mostraré en el prototipo: lista vacía, error de validación, confirmación de éxito, y pantalla pequeña (celular).

## 4. Preguntas para el CEO (cerradas)

1. **Cuando se entrega una laptop a un empleado, ¿ese empleado debe tener cuenta en la plataforma?**
   - A) Sí, todos deben tener cuenta.
   - B) No; se lleva una lista aparte de personas (nombre, área, correo) que reciben equipos y solo algunos operan el sistema.
   - Recomiendo **B**. Evita invitar a cientos de personas solo para registrar una entrega. Requiere revisión del auditor de cumplimiento por tratarse de datos personales.
2. **La constancia de entrega y devolución, ¿qué debe ser?**
   - A) Un registro en pantalla con fecha y quién la hizo.
   - B) Un documento imprimible/PDF para que el empleado firme.
   - C) Firma en pantalla.
   - Recomiendo **A en todo caso y B como documento adicional en la versión 1**. C se deja para después.
3. **En el almacén, ¿cómo se leen los números de serie?**
   - A) Con lector de código de barras.
   - B) Se teclean o se pegan desde un archivo del proveedor.
   - C) Una mezcla de ambos.
   - Recomiendo diseñar para **C** (la pantalla servirá para las tres formas).
4. **¿Desde qué dispositivos trabaja el personal de almacén y técnico?**
   - A) Computador.
   - B) Tablet o celular.
   - C) Ambos.
   - Recomiendo asumir **C** y diseñar la recepción y la búsqueda de activos para pantalla pequeña.
5. **Datos como el IMEI o el número de línea de un celular, ¿cuándo se capturan?**
   - A) Al recibir, junto con la serie.
   - B) Después, desde la ficha del activo.
   - Recomiendo **A, y también poder completarlos después** si no se tienen a mano.
6. **Si al recibir llegan menos series que unidades, ¿qué debe pasar?**
   - A) No se deja confirmar hasta completar todas.
   - B) Se crean los activos con las series que hay y el resto queda "por registrar".
   - Recomiendo **B**; es coherente con la recepción parcial que ya existe en el documento.
7. **¿Agregamos el estado "Extraviado o robado" a los estados del activo?**
   - A) Sí.
   - B) No; usaremos "De baja" con motivo.
   - Recomiendo **A**: para auditoría el motivo importa más que el nombre del estado, y evita usar "De baja" para todo.
8. **Si la jefatura rechaza una orden de compra, ¿qué pasa?**
   - A) Vuelve a borrador con el motivo para que se corrija.
   - B) Queda rechazada y se crea una nueva si se quiere insistir.
   - Recomiendo **A** (menos retrabajo y queda el rastro del motivo).
9. **¿La importación de su Excel actual de inventario es parte de la versión 1?**
   - A) Sí, se verá en pantalla con revisión de errores antes de cargar.
   - B) No, la carga inicial se hace de forma asistida por el equipo.
   - Recomiendo **A**, porque el riesgo #4 ya la da por hecha.

## 5. Mensajes directos

Estado: NO enviados (sesión en modo planificación). Textos preparados para enviar (máximo 3):

1. A `analista-funcional`:
   > ¿Los campos personalizados son del SKU o de cada unidad?
   > §6 pone IMEI y número de línea como campos de la categoría, pero son datos de cada unidad. Propongo marcar cada campo como "del SKU" o "de la unidad"; cambia la pantalla de recepción.
2. A `auditor-cumplimiento`:
   > ¿Podemos guardar una lista de "personas receptoras" que no son usuarios?
   > Propongo registrar nombre, área y correo de quien recibe un equipo, sin darle acceso. ¿Qué datos mínimos y qué plazo de conservación exigirías?
3. A `qa-tester`:
   > ¿Qué reglas de series quieres como criterios de aceptación?
   > Propuse: repetida en la lista, ya existente, menos series que unidades, corrección posterior con motivo. ¿Falta alguna?

Respuestas recibidas: ninguna (no se enviaron).

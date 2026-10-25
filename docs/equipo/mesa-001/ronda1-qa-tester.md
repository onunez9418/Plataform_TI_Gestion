# Mesa de Revisión #001 · Ronda 1 · Intervención de QA (qa-tester)

NOTA DE PROCEDIMIENTO: esta sesión estaba en modo planificación (solo lectura). Por eso este texto está en el archivo de plan y NO en su destino final `docs/equipo/mesa-001/ronda1-qa-tester.md`. No envié mensajes a otros roles. Para publicarlo, copiar el contenido de abajo (desde "Intervención") a ese archivo.

---

# Intervención de QA · Mesa #001 · Ronda 1

**Documento revisado:** `docs/documento-funcional.md` v0.1 y `docs/equipo/riesgos.md`.
**Mi ángulo:** si hoy me entregaran este documento, ¿podría escribir una prueba que diga "pasó" o "falló" sin discutir qué quiso decir el documento?

Respuesta corta: en lo general sí, en el detalle no. El documento dice bien el "qué", pero casi no dice los límites ni las transiciones, y sin eso una prueba no puede fallar con justificación.

## 1. Qué está bien

- La regla de aislamiento entre empresas está dicha sin matices ("completamente separados", §3 y §4). Eso es lo más fácil de probar y lo más importante.
- Las listas cerradas están bien definidas: tipos de campo personalizado (§6: texto, número, fecha, lista, sí/no), modos de control (§7: serie o cantidad), acciones de permiso (§5: ver, crear, editar, aprobar, dar de baja). Cada una da casos de prueba directos.
- La OC tiene un flujo con nombres de estado (§9) y el documento admite la recepción parcial. Hay base para probar.
- Los pendientes están marcados como [PENDIENTE] y no inventados. Eso me deja claro qué NO puedo probar todavía.
- El ejemplo `LAP-0001` (§7) da un formato concreto de código.
- El registro de riesgos ya anticipa los tres puntos donde más suele fallar un sistema así: aislamiento (riesgo 2), concurrencia (riesgo 3) e importación (riesgo 4).

## 2. Qué me preocupa

Marco cada punto como HECHO (se verifica leyendo el documento) u OPINIÓN (juicio mío).

### 2.1 Reglas que HOY no son probables

| # | Sección | Qué dice o qué falta | Por qué no es probable | Tipo |
|---|---|---|---|---|
| 1 | §8 Inventario | No dice si la **serie es única**, ni dentro de qué: ¿por SKU?, ¿por empresa? Tampoco si "ABC123" y "abc123 " son la misma. | No puedo escribir la prueba "serie duplicada" porque no sé cuál es el resultado correcto. | HECHO |
| 2 | §9 Recepción | No dice qué pasa al **recibir más de lo pedido**. Solo dice "se permiten recepciones parciales". | La prueba no tiene resultado esperado. | HECHO |
| 3 | §9 Flujo | "Recibida (parcial o total)" es **un solo estado** para dos situaciones distintas. No hay forma de distinguir "me falta mercadería" de "llegó todo". | No se puede verificar la transición a "Cerrada": ¿cuándo ocurre?, ¿sola o a mano? | HECHO |
| 4 | §9 Flujo | No hay transiciones definidas: quién mueve de un estado a otro, si se puede volver atrás (Pendiente → Borrador), y **no existe el estado "Rechazada"**, aunque la aprobación puede decir que no. | No se puede probar "rechazar una OC" porque no existe ese resultado. | HECHO |
| 5 | §9 Flujo | "Anulada en cualquier punto antes de recibir": ¿y después de una recepción parcial? ¿Qué pasa con los activos ya creados? | Caso límite sin regla. | HECHO |
| 6 | §8 Estados | Estados de activo **[PENDIENTE]** y sin matriz de transiciones (¿De baja puede volver a En stock? ¿Se puede dar de baja un activo Asignado?). | No se puede probar nada de transiciones. | HECHO |
| 7 | §8 Cantidad | Sin reglas de límites: ¿el stock puede quedar **negativo**?, ¿una salida mayor al stock?, ¿un traslado a la misma ubicación?, ¿se aceptan decimales (metros de cable)? | Cantidades sin límites. | HECHO |
| 8 | §7 Código | "Prefijo + correlativo (`LAP-0001`)" no dice: cuántos dígitos, qué pasa al llegar a 9999, si un código escrito a mano (ej. `LAP-0050`) hace que el automático lo salte, si un número de un SKU anulado se reutiliza, si "lap-0001" y "LAP-0001" son lo mismo. | No sé qué resultado exacto esperar en el caso de dos usuarios creando a la vez, ni si los huecos son defecto o normal. | HECHO |
| 9 | §6 Prefijo | Sin reglas: largo, caracteres permitidos, si es único por empresa, y **qué pasa si se cambia el prefijo** de una categoría con SKUs ya creados. | Sin resultado esperado. | HECHO |
| 10 | §6 Campos | Sin definir: qué pasa al agregar un campo **obligatorio** a una categoría que ya tiene SKUs; al cambiar el tipo de un campo con datos; al quitar una opción de una lista que ya está en uso. Tampoco hay límites del tipo "número" (decimales, mínimo, máximo) ni formato de "fecha". | Las pruebas de "campo obligatorio vacío / tipo incorrecto" quedan sin criterio claro en lo que ya existe. | HECHO |
| 11 | §7 | "Cambiar el modo de control" o "cambiar la categoría" de un SKU que ya tiene activos o stock: no se dice si se permite. "Estado inactivo": no se dice qué bloquea (¿comprar?, ¿recibir?, ¿verlo?). | Sin resultado esperado. | HECHO |
| 12 | §5 Permisos | Dice "cada rol define qué acciones permite en cada módulo", pero **no enumera los módulos** ni da la matriz rol x acción x módulo. Las frases de la tabla son vagas: "Ver todo", "Gestionar inventario", "propias". | No se puede escribir una prueba de permisos sin la matriz. Hoy solo podría probar "alguien sin permiso no puede", sin saber quién es quién. | HECHO |
| 13 | §5 | Sin definir: ¿un usuario con **dos roles** en la misma empresa?, ¿qué pasa si se le cambia el rol mientras tiene la sesión abierta?, ¿se puede borrar un rol con usuarios asignados?, ¿se puede quitar al **último administrador**? | Casos límite de permisos. | HECHO |
| 14 | §9 y §5 | No dice si quien **crea** una OC puede **aprobarla él mismo**. | Es la prueba de "separación de funciones" más obvia y no tiene regla. | HECHO |
| 15 | §9 Aprobación | "Según el monto" sin moneda, sin umbrales y **[PENDIENTE]**. Tampoco: ¿si se edita el monto después de aprobar, hay que aprobar de nuevo? | No probable hasta que se defina. | HECHO |
| 16 | §9 | Sin reglas para: OC sin líneas, cantidad 0 o negativa, precio 0, el mismo SKU repetido en dos líneas, SKU inactivo o proveedor inactivo en una OC, moneda, impuestos, descuentos. | Datos de entrada sin límites. | HECHO |
| 17 | §9 Recepción | Sin definir: ¿se puede **corregir o deshacer** una recepción ya confirmada?, ¿la cantidad de series pegadas debe ser igual a la cantidad recibida?, ¿se puede recibir y completar las series después?, formato de la lista pegada (separador, líneas vacías), ¿a qué ubicación entra la mercadería? | Cada una es una prueba que hoy no tiene resultado. | HECHO |
| 18 | §9 | **Dos personas recibiendo la misma OC al mismo tiempo**: no se dice qué debe pasar. | Concurrencia sin regla (riesgo 3 del registro). | HECHO |
| 19 | §8 Asignación | "Queda constancia de la entrega y de la devolución": ¿qué es la constancia? ¿una firma, un documento, solo un registro? Sin definir: asignar un activo ya asignado, asignar uno De baja, asignar a un usuario que ya salió de la empresa. | "Constancia" es una palabra vaga. | HECHO |
| 20 | §8 Historial | Dice que cada movimiento guarda "fecha, usuario y motivo". No dice si el **motivo es obligatorio**. | Pregunta clave para la prueba: ¿se puede hacer una baja sin motivo? | HECHO |
| 21 | §10 OS | Casi todo es [PENDIENTE] (tipos, aprobación, costo). Sin transiciones: ¿se puede reabrir una OS cerrada? ¿Se puede cancelar una OS en ejecución? ¿Qué pasa si el activo relacionado se da de baja? | No hay nada firme que probar fuera del flujo básico. | HECHO |
| 22 | §11 Auditoría | "Registro importante" no está definido. No dice si el historial es **inmutable** (que nadie, ni el administrador, lo pueda editar o borrar), ni cuánto tiempo se guarda. | La prueba "nadie puede alterar la auditoría" no tiene regla escrita. | HECHO |
| 23 | §4 Acceso | Sin definir: ¿se verifica que el correo es de quien dice?, ¿caduca una invitación?, ¿qué pasa si se invita a un correo que ya existe en otra empresa?, ¿cómo nace una empresa y quién la crea? | Pruebas de acceso e invitación sin resultado. | HECHO |
| 24 | §4 Multiempresa | Una persona en dos empresas: no se dice si los **catálogos** (marcas, proveedores) son por empresa o compartidos, ni qué pasa con la sesión al cambiar de empresa. Opinión: deben ser por empresa y deben limpiar todo al cambiar. | Falta la regla para el caso más delicado de aislamiento. | HECHO (que falta) / OPINIÓN (lo que propongo) |
| 25 | Documento completo | La palabra "importar" **no aparece** en el documento. El riesgo 4 habla de importación con validación fila por fila y el pendiente 7 menciona el Excel de inventario actual, pero no hay una sección funcional que diga qué columnas, qué es una fila inválida ni qué se hace con ella. | La carga inicial es un entregable con riesgo "Alta" y no tiene criterio de aceptación posible. | HECHO |
| 26 | Documento completo | No hay **requisitos medibles de rendimiento ni volumen** (pendiente 4 sin responder): ¿cuántos activos?, ¿cuántos segundos es aceptable?, ¿tope de filas por importación? | No se puede decidir si una pantalla lenta es defecto. | HECHO |
| 27 | Documento completo | Sin definir: zona horaria, idioma, formato de fecha y moneda. Las fechas de garantía y vencimiento de licencia dependen de ello. | Una garantía que vence "hoy" puede fallar según la zona horaria. | HECHO (falta) / OPINIÓN (importancia) |

### 2.2 Qué pasa si no se corrige (opinión)

Opinión mía: si programamos con este documento tal cual, el desarrollador tomará decisiones por su cuenta en los puntos 1, 2, 7, 8, 14 y 17, y QA lo descubrirá después, cuando cambiarlo cuesta más. Los puntos 1, 2, 12 y 25 son los que más bloquean mis pruebas.

## 3. Qué cambiaría

### 3.1 Cambios al documento (los hace el analista funcional)

1. Agregar a §8 la regla de unicidad de la serie y cómo se compara (sin distinguir mayúsculas/minúsculas, sin espacios al inicio o final).
2. Dividir en §9 el estado "Recibida (parcial o total)" en **"Recibida parcial"** y **"Recibida total"**, y agregar el estado **"Rechazada"**. Dibujar la tabla de transiciones: de qué estado a cuál, quién puede y qué efecto tiene.
3. Agregar en §9 la regla de sobrerrecepción, cierre con pendiente y anulación tras recepción parcial.
4. Agregar una sección **"Matriz de permisos"** (módulos x acciones x roles). La puedo ayudar a escribir como tabla de prueba.
5. Agregar una sección de **Importación** (columnas, qué es fila inválida, qué se hace con ellas, tope de filas).
6. Agregar a cada regla con número un límite o una indicación explícita de "sin límite". Ejemplo: "largo del nombre del SKU: hasta 120 caracteres".
7. Escribir una sección **"Reglas de datos"** con: dígitos del correlativo, si se reutiliza un código, stock negativo, decimales, motivo obligatorio.
8. Que cada regla nueva vaya con su criterio de aceptación en formato Dado/Cuando/Entonces (los propuestos abajo son el arranque).

### 3.2 Diez criterios de aceptación (lo más crítico)

Los marcados con (*) dependen de una pregunta al CEO de la sección 4; el resultado esperado es mi recomendación.

**CA-01 · Aislamiento: no se puede leer lo de otra empresa**
- Dado que existen la empresa A y la empresa B, y la empresa B tiene un SKU, un activo y una OC con identificador conocido,
- Cuando un usuario de la empresa A pide esos registros por listado, por búsqueda y escribiendo directamente el identificador del registro de B,
- Entonces no aparece ninguno en listados ni búsquedas, y el acceso directo responde "no encontrado" (el mismo mensaje que un identificador que no existe, para no revelar que el dato existe).

**CA-02 · Aislamiento: no se puede modificar lo de otra empresa**
- Dado un usuario de la empresa A con rol Administrador en A y una OC pendiente de la empresa B,
- Cuando intenta aprobar, editar o anular esa OC (por pantalla o enviando la petición directamente al servidor),
- Entonces la acción se rechaza, la OC de B no cambia en nada y el intento queda en la auditoría.

**CA-03 · Código de SKU único por empresa, no global**
- Dado que la empresa A ya tiene el SKU `LAP-0001`,
- Cuando la empresa A intenta crear otro con el código `LAP-0001`, y la empresa B crea uno con el mismo código,
- Entonces para A se rechaza con un mensaje claro ("ese código ya existe"), y para B se acepta, porque son empresas distintas.

**CA-04 · Correlativo con dos usuarios a la vez**
- Dado que la categoría Laptops (`LAP`) tiene su último SKU en `LAP-0010`,
- Cuando 20 usuarios crean un SKU de esa categoría exactamente al mismo tiempo (sin escribir código propio),
- Entonces se crean 20 SKUs con 20 códigos distintos, ninguno repetido y todos mayores a `LAP-0010`. (*) Los huecos serán aceptables solo si el CEO lo confirma (pregunta 5); mi recomendación es no tolerarlos en este caso, es decir `LAP-0011` a `LAP-0030` sin saltos cuando no hay errores.

**CA-05 · Código escrito a mano y correlativo automático**
- Dado que la categoría `LAP` está en `LAP-0010`,
- Cuando un usuario con permiso crea un SKU con el código propio `LAP-0011`, y después otro usuario crea uno con código automático,
- Entonces el automático **no** repite `LAP-0011` (recibe `LAP-0012`) y un intento de repetir `LAP-0011` a mano se rechaza. Un usuario sin permiso de "código propio" no puede escribir código aunque envíe la petición directa.

**CA-06 · Serie duplicada (*)**
- Dado un SKU con serie y un activo existente con serie `SN-100`,
- Cuando se intenta registrar otra unidad `SN-100` en el **mismo** SKU (incluyendo `sn-100` o ` SN-100 `), y luego `SN-100` en **otro** SKU de la misma empresa,
- Entonces en el mismo SKU se rechaza siempre; en otro SKU se acepta con un aviso visible (mi recomendación, pregunta 1), y en otra empresa se acepta sin aviso.

**CA-07 · Recepción parcial y luego total**
- Dado una OC aprobada y emitida de 10 unidades de un SKU con serie,
- Cuando se recibe una primera vez 4 unidades con 4 series, y una segunda vez las 6 restantes,
- Entonces tras la primera hay 4 activos nuevos, la OC queda "Recibida parcial" con 6 pendientes; tras la segunda hay 10 activos en total, sin duplicados, y la OC queda "Recibida total" (y pasa a Cerrada según la regla de cierre que se defina).

**CA-08 · Recepción inválida: no se crea nada a medias (*)**
- Dado la misma OC de 10 unidades con 4 ya recibidas,
- Cuando se intenta recibir 7 (más de las 6 pendientes), o se confirman 4 con una lista de 3 series, o con 4 series de las cuales una ya existe en el SKU,
- Entonces la recepción completa se rechaza con un mensaje que dice cuál es el problema, **no** se crea ningún activo (ni los de las series válidas) y el pendiente sigue en 6.

**CA-09 · Permiso de aprobar y separación de funciones (*)**
- Dado un usuario con rol Técnico (sin permiso "aprobar") y una OC "Pendiente de aprobación" creada por otra persona,
- Cuando el Técnico intenta aprobarla, tanto con el botón (que no debería verse) como enviando la petición al servidor directamente,
- Entonces el servidor la rechaza, la OC sigue "Pendiente de aprobación" y queda un registro del intento. Además, si un usuario con permiso de aprobar es quien creó la OC, no puede aprobarla (mi recomendación, pregunta 4).

**CA-10 · Importación con filas inválidas (*)**
- Dado un archivo de 100 filas de inventario donde 3 son inválidas (una con SKU inexistente, una con serie repetida dentro del mismo archivo, una con un campo obligatorio vacío),
- Cuando se sube y se confirma la importación,
- Entonces antes de confirmar se muestra una vista previa con el número de filas válidas e inválidas; al confirmar se importan las 97 válidas y se entrega un reporte descargable que indica por cada fila rechazada: número de fila, columna y motivo en español claro; y volver a subir el mismo archivo no duplica las 97 ya importadas (las rechaza como "ya existe").

Extra que no cabe en los diez, pero que quiero en el plan de pruebas: **CA-11 Campos personalizados.** Dado un campo obligatorio de tipo número en la categoría Laptops, cuando se guarda un SKU con el campo vacío, con texto "abc", o con una opción de lista que no existe, entonces se rechaza con mensaje por campo y no se guarda nada.

### 3.3 Casos límite que faltan en el documento

Los pondré todos como casos de prueba en cuanto haya regla:
- Dos usuarios editando el mismo registro a la vez (¿gana el último o se avisa del choque?).
- Dos usuarios asignando el mismo activo a personas distintas.
- Dos personas aprobando (o una aprobando y otra anulando) la misma OC.
- Dos personas recibiendo la misma OC al mismo tiempo.
- Una OC con SKU que se inactivó después de crearla.
- Una OC con precio o cantidad en cero o negativos, o con números muy grandes.
- Serie con espacios, mayúsculas/minúsculas, ceros a la izquierda, caracteres raros, o muy larga.
- Pegar una lista de 5.000 series; lista con líneas vacías o con comas y saltos de línea mezclados.
- Eliminar o desactivar un valor de catálogo (marca, proveedor, ubicación) que está en uso.
- Cambiar el prefijo o la categoría de un SKU que ya tiene activos.
- Quitar al último administrador de una empresa; el administrador que se quita a sí mismo.
- Un usuario en dos empresas: cambiar de empresa con una pantalla abierta, y verificar que no queden datos de la anterior.
- Una invitación vencida, usada dos veces o enviada a un correo escrito con mayúsculas.
- Pérdida de conexión en medio de una recepción o una importación (¿queda a medias?).
- Doble clic en "Confirmar" (que no cree dos veces los activos).
- Un activo asignado al que se da de baja, o una OS abierta sobre un activo dado de baja.
- Fecha de garantía o vencimiento que cae hoy, según zona horaria.
- Listas vacías (empresa nueva sin datos) y mensajes claros para el usuario.
- Importación con archivo vacío, con encabezados cambiados, con codificación rara (tildes, eñes) o más filas que el tope.

### 3.4 Qué haré yo, apenas haya reglas cerradas

- Plan de pruebas en `docs/calidad/` con una tabla: requisito del documento, caso de prueba, tipo (unitaria / navegador), estado.
- Pruebas automáticas (Vitest y Playwright) para CA-01 a CA-11 desde el primer momento de la Etapa 1 (CA-01/02/09) y a medida que lleguen las etapas siguientes.
- Pruebas de concurrencia para CA-04 y CA-05, que deben correr contra una base de datos real, no simulada. Opinión: una prueba de concurrencia contra datos simulados no demuestra nada.

## 4. Preguntas para el CEO

Cerradas, con opciones y mi recomendación.

1. **Serie repetida.** ¿Qué debe pasar si se registra una serie que ya existe?
   - A) Prohibirla solo dentro del mismo SKU; en otro SKU se acepta con aviso.
   - B) Prohibirla en toda la empresa.
   - C) Permitirla siempre.
   - **Recomiendo A.** Razón: dos marcas distintas pueden usar el mismo número de serie, y B bloquearía un ingreso legítimo; C deja entrar errores de digitación.

2. **Recibir más de lo pedido.** Si piden 10 y llegan 12:
   - A) No se permite recibir más; se registran 10 y las 2 sobrantes se manejan fuera de la OC.
   - B) Se permite hasta un porcentaje que la empresa configure.
   - C) Se permite siempre, con aviso.
   - **Recomiendo A** para la primera versión (más simple y más segura); B puede venir después si lo piden.

3. **Importación con filas malas.** Si en un Excel de 100 filas hay 3 con error:
   - A) No se importa nada hasta corregir las 3.
   - B) Se importan las 97 buenas y se entrega un reporte con las 3 malas.
   - **Recomiendo B**, con una vista previa antes de confirmar. Razón: su Excel actual probablemente tiene datos sucios y A haría que no pudieran cargarlo nunca de una vez.

4. **Aprobación de uno mismo.** ¿Quien crea una orden de compra puede aprobarla él mismo?
   - A) Sí.
   - B) No, siempre debe aprobarla otra persona.
   - C) No por defecto, pero el administrador puede permitirlo en su empresa.
   - **Recomiendo C.** Razón: en una empresa con una sola persona de TI, B la dejaría sin poder comprar; con C se protege el dinero por defecto.

5. **Códigos de SKU con huecos.** Si se crea `LAP-0005` y luego se elimina o se desactiva:
   - A) Ese número nunca se vuelve a usar (puede haber huecos).
   - B) Se vuelve a usar.
   - **Recomiendo A.** Razón: reutilizar un código confunde a quien lo vio antes en un correo o un reporte.

6. **Stock por cantidad.** ¿Puede el stock quedar en negativo (sacar más de lo que hay)?
   - A) No, se rechaza.
   - B) Sí, con aviso.
   - **Recomiendo A.**

7. **OC con mercadería pendiente.** Si el proveedor ya no enviará las unidades restantes:
   - A) Se puede cerrar la OC a mano indicando el motivo.
   - B) No se puede cerrar hasta recibir todo (solo anular lo pendiente).
   - **Recomiendo A.**

8. **Deshacer una recepción.** Si se confirmó una recepción por error:
   - A) No se puede deshacer; se corrige con una baja y una nueva entrada, ambas quedan en el historial.
   - B) Se puede anular la recepción completa mientras los activos no hayan sido asignados.
   - **Recomiendo B**, con motivo obligatorio, por ser un caso frecuente en la práctica.

## 5. Mensajes directos

No envié ninguno (la sesión estaba en modo solo lectura y no permitía enviar). Los que habría enviado, a reserva de que la Jefatura autorice reenviarlos:

- A `analista-funcional`: "¿Puedes cerrar en el documento la unicidad de la serie y el estado 'Rechazada' de la OC? Sin eso no puedo escribir CA-06 ni la prueba de rechazo de aprobación."
- A `ingeniero-datos`: "¿La unicidad de serie y el correlativo irán como restricción en la base de datos y no solo en el código? Lo necesito para decidir si pruebo concurrencia contra base real."
- A `especialista-seguridad`: "¿Para un identificador de otra empresa se responderá 'no encontrado' en vez de 'sin permiso'? Eso fija el resultado esperado de CA-01."

---

# Nota para la Jefatura de Proyecto

- Revisé el documento funcional v0.1 y el registro de riesgos desde la capacidad de probar.
- Hoy hay 27 puntos no probables; los que más bloquean: unicidad de la serie, sobrerrecepción, estados de la OC (falta "Rechazada" y se mezcla parcial/total), matriz de permisos y la importación (que no está descrita).
- Propuse 10 criterios Dado/Cuando/Entonces (+1 de campos personalizados) y 19 casos límite que faltan.
- Hay 8 preguntas cerradas para el CEO con recomendación (la serie repetida, recibir de más y la importación son las urgentes).
- No ejecuté pruebas: aún no existe código. No doy ningún aprobado; en esta etapa el veredicto es solo sobre el documento: **no listo para programar** hasta cerrar al menos los puntos 1, 2, 3, 4, 12, 14 y 25.
- Pendiente de mi parte: el archivo `docs/equipo/mesa-001/ronda1-qa-tester.md` no se escribió porque la sesión estaba en modo planificación (solo lectura). El texto completo está en el archivo de plan y hay que copiarlo; tampoco envié mensajes a otros roles.

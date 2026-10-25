# Mensajes directos del Diseñador UX/UI · Mesa de revisión #001 · Ronda 1

Registro literal, en orden. Los mensajes se enviaron con SendMessage usando los identificadores de la agenda del equipo.

## Enviados

### 1. Para `analista-funcional` (a6e1b8bc987bd105a)

> ¿Los campos personalizados son del SKU o de cada unidad?
> §6 pone IMEI y número de línea como campos de la categoría, pero son datos de cada unidad. Propongo marcar cada campo como "del SKU" o "de la unidad"; cambia la pantalla de recepción.

### 2. Para `auditor-cumplimiento` (a45ce2ef63e8747ae)

> ¿Podemos guardar una lista de "personas receptoras" que no son usuarios?
> Propongo registrar nombre, área y correo de quien recibe un equipo, sin darle acceso. ¿Qué datos mínimos y qué plazo de conservación exigirías?

### 3. Para `qa-tester` (ab1bc35a838fd603f)

> ¿Qué reglas de series quieres como criterios de aceptación?
> Propuse: repetida en la lista, ya existente, menos series que unidades, corrección posterior con motivo. ¿Falta alguna?

## Recibidos

### 4. De `qa-tester` (ab1bc35a838fd603f), en respuesta al mensaje 3

> Tu lista está bien; faltan 4 reglas de series:
> 1) Series con espacios o mayúsculas distintas ("sn-1" y " SN-1 ") cuentan como repetidas.
> 2) Líneas vacías en la lista pegada se ignoran, sin contarlas como series.
> 3) Si una serie falla, no se crea ningún activo y el mensaje dice cuál serie y por qué.
> 4) Doble clic en "Confirmar" no crea los activos dos veces.

## Enviados (continuación)

### 5. Para `qa-tester` (ab1bc35a838fd603f), respuesta al mensaje 4

> Gracias, las 4 reglas se aceptan y las llevo al prototipo.
> Aclaro: "faltan series" (menos que unidades) no es fallo y se crea con las que hay si se decide opción B; una serie inválida o repetida sí bloquea todo el lote, con mensaje que indica cuál y por qué.

### 6. De `auditor-cumplimiento` (a45ce2ef63e8747ae), en respuesta al mensaje 2

> Sí se puede, con mínimo necesario: nombre, área y correo corporativo (correo opcional; el personal solo si la empresa lo decide). Sin documento de identidad, teléfono ni dirección.
> Conservación (propuesta, a decidir por gerente-ti y confirmar con legal): mientras tenga activos asignados, más 2 años; luego anonimizar conservando el historial. Debe tener estado activo/dado de baja, no se borra, y cada alta o cambio queda en auditoría.

(No requiere respuesta. Lo incorporo como recomendación al `gerente-ti`: personas receptoras con nombre, área y correo opcional, sin borrado, con auditoría.)

### 7. De `analista-funcional` (a6e1b8bc987bd105a), en respuesta al mensaje 1

> Tienes razón: IMEI y número de línea son de cada unidad. Adopto tu propuesta para la v0.2: cada campo personalizado declara su nivel, "del SKU" (RAM, procesador) o "de la unidad" (IMEI, línea, vencimiento de licencia).
> Los campos "de la unidad" solo existen en SKUs controlados por serie; en SKUs por cantidad todo es del SKU. Aviso al arquitecto para que confirme el costo. Tu pregunta sobre "persona receptora" vs "usuario" la subo a decisiones.md.

(No requiere respuesta. Queda aceptada la regla para el diseño de la recepción y la ficha del activo.)

### 8. De `qa-tester` (ab1bc35a838fd603f), en respuesta al mensaje 5

> De acuerdo con tu aclaración: una serie inválida o repetida bloquea todo el lote.
> Solo difiero en "menos series que unidades": mi CA-08 lo rechaza, tu opción B lo permite. Lo decide el gerente-ti; escribiré la prueba según su decisión.

(No requiere respuesta. Desacuerdo abierto: "menos series que unidades" se rechaza según CA-08 de QA y se permite según mi opción B. Lo decide el gerente-ti. El prototipo se adaptará a su decisión.)

## Sin respuesta

Ninguno pendiente: los tres compañeros consultados respondieron.

## Nota sobre las preguntas al CEO

Por indicación de la Jefatura de Proyecto, las 9 "preguntas para el CEO" de mi intervención (`ronda1-disenador-ux.md`, sección 4) pasan como **recomendaciones al `gerente-ti`**, que las decide en `docs/equipo/decisiones.md`. Solo se escala al CEO si hay dinero, asunto legal o algo irreversible. La pregunta 1 (personas receptoras) toca datos personales y depende además de la respuesta del auditor de cumplimiento.

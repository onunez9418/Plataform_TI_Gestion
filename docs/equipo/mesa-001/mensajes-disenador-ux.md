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

## Sin respuesta

`analista-funcional` y `auditor-cumplimiento` no habían respondido al cerrar este registro.

## Nota sobre las preguntas al CEO

Por indicación de la Jefatura de Proyecto, las 9 "preguntas para el CEO" de mi intervención (`ronda1-disenador-ux.md`, sección 4) pasan como **recomendaciones al `gerente-ti`**, que las decide en `docs/equipo/decisiones.md`. Solo se escala al CEO si hay dinero, asunto legal o algo irreversible. La pregunta 1 (personas receptoras) toca datos personales y depende además de la respuesta del auditor de cumplimiento.

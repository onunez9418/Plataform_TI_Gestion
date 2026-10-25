# Mensajes de qa-tester · Mesa #001 · Ronda 1

Registro literal, en orden. Los mensajes de respuesta que lleguen después de esta entrada se agregan al final.

## 1. Enviado a analista-funcional

¿Puedes cerrar en el documento la unicidad de la serie y el estado "Rechazada" de la OC?
Sin eso no puedo escribir el criterio de serie duplicada (CA-06) ni la prueba de rechazo de aprobación. Mi recomendación: serie única por SKU, aviso si existe en otro SKU.

## 2. Enviado a ingeniero-datos

¿La unicidad de serie y el correlativo del SKU irán como restricción en la base de datos y no solo en el código?
Lo necesito para decidir si pruebo la concurrencia (CA-04) contra una base real. Una prueba contra datos simulados no demuestra nada.

## 3. Enviado a especialista-seguridad

¿Ante un identificador de otra empresa se responderá "no encontrado" en vez de "sin permiso"?
Eso fija el resultado esperado de CA-01 y CA-02. Mi propuesta: "no encontrado", igual que un identificador inexistente, y el intento queda en auditoría.

## 4. Recibido de disenador-ux

¿Qué reglas de series quieres como criterios de aceptación?
Propuse: repetida en la lista, ya existente, menos series que unidades, corrección posterior con motivo. ¿Falta alguna?

## 5. Enviado a disenador-ux (respuesta)

Tu lista está bien; faltan 4 reglas de series:
1) Series con espacios o mayúsculas distintas ("sn-1" y " SN-1 ") cuentan como repetidas.
2) Líneas vacías en la lista pegada se ignoran, sin contarlas como series.
3) Si una serie falla, no se crea ningún activo y el mensaje dice cuál serie y por qué.
4) Doble clic en "Confirmar" no crea los activos dos veces.

## Nota

Hasta el momento de escribir este registro no habían llegado respuestas de analista-funcional, ingeniero-datos ni especialista-seguridad. Los tres mensajes quedaron en cola de entrega (confirmado por el sistema). Nota: la regla 3 de mi respuesta a disenador-ux es mi recomendación y depende de la decisión sobre CA-08 (todo o nada), que decide el gerente-ti.

## 6. Recibido de ingeniero-datos (respuesta al mensaje 2)

Sí, ambas irán como restricción en la base de datos, no solo en el código.
Serie: UNIQUE (empresa_id, sku_id, serie normalizada). Código SKU: UNIQUE (empresa_id, código normalizado). Correlativo: contador atómico por empresa y prefijo (UPDATE ... RETURNING dentro de la transacción). Es mi propuesta; la decisión final es del gerente-ti.
Prueba CA-04 contra PostgreSQL real, con varias conexiones simultáneas; no sirve una simulación. Pide a devops una base de pruebas.

## 7. Enviado a ingeniero-datos (respuesta)

Gracias, con eso CA-04 y CA-06 quedan como pruebas contra PostgreSQL real con conexiones simultáneas.
Dejo anotado que necesito una base de pruebas de devops; ya agoté mis mensajes de la ronda, así que la Jefatura debe pedírsela.

## 8. Recibido de disenador-ux (respuesta al mensaje 5)

Gracias, las 4 reglas se aceptan y las llevo al prototipo.
Aclaro: "faltan series" (menos que unidades) no es fallo y se crea con las que hay si se decide opción B; una serie inválida o repetida sí bloquea todo el lote, con mensaje que indica cuál y por qué.

## 9. Enviado a disenador-ux (respuesta)

De acuerdo con tu aclaración: una serie inválida o repetida bloquea todo el lote.
Solo difiero en "menos series que unidades": mi CA-08 lo rechaza, tu opción B lo permite. Lo decide el gerente-ti; escribiré la prueba según su decisión.

## 10. Recibido de especialista-seguridad (respuesta al mensaje 3)

De acuerdo: ante un identificador de otra empresa se responde "no encontrado", idéntico al de uno inexistente (mismo mensaje, mismo código, sin pistas), y el intento queda en auditoría.
Agrego: prueba obligatoria por cada tabla nueva (RS-10) y que los identificadores no sean consecutivos (RS-13).

## 11. Recibido de analista-funcional (respuesta al mensaje 1)

Sí a ambas en la v0.2, pero la regla de serie la fija el gerente-ti en docs/equipo/decisiones.md (el CEO ya no responde). Lo registro con tu recomendación: serie única por SKU dentro de la empresa, sin distinguir mayúsculas ni espacios en los bordes, y aviso si existe en otro SKU.
"Rechazada": entra como estado, con motivo. UX propone que vuelva a borrador y tú pides estado final; propongo "Rechazada" y que se pueda "Reabrir como borrador" con el motivo a la vista. Escribe CA-06 con esa recomendación marcada (*) hasta que haya decisión.

## 12. Enviado a analista-funcional (respuesta)

Me parece bien: "Rechazada" como estado con motivo y "Reabrir como borrador" con el motivo a la vista.
CA-06 queda marcado (*) hasta la decisión del gerente-ti. Mi única condición: reabrir deja registro en auditoría y exige nueva aprobación.

## Nota final

Se recibieron respuestas de los tres destinatarios originales (ingeniero-datos, especialista-seguridad, analista-funcional). Sin mensajes sin responder.

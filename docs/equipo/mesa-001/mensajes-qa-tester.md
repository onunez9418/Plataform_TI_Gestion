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

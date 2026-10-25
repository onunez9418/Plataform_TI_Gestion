# Mensajes directos del ingeniero de datos · Mesa #001 · Ronda 1

Registro literal, en orden. Dirección = identificador del agente.
Nota: durante la redacción de la ronda 1 la sesión estuvo en modo plan y no se pudo enviar nada; los mensajes se enviaron después de que se levantó ese modo.

## 1. Enviado a arquitecto-software (a528ad39eb8d34a58)

> ¿Los campos personalizados irán en una columna JSON validada o en tablas propias?
> Necesito saberlo antes de modelar. Además hay dos niveles (campos del SKU y campos de cada unidad, ej. IMEI o vencimiento de licencia) y ambos entran en la elección.

## 2. Enviado a arquitecto-software (a528ad39eb8d34a58)

> Aislamiento por empresa en la base: ¿aceptas reglas de seguridad por fila (RLS) como obligatorias, con la empresa activa fijada en cada transacción?
> Si usamos Prisma con conexiones compartidas, hay que definirlo en el diseño y probarlo desde el primer día.

## 3. Enviado a arquitecto-software (a528ad39eb8d34a58)

> ¿El correlativo (SKU, OC, OS) lo genera la base de datos con contador atómico por empresa+prefijo, o la aplicación?
> Yo propongo la base; así dos personas simultáneas nunca duplican. Y: ¿Persona (empleado que recibe equipos) y Usuario (quien entra a la plataforma) van como entidades separadas?

## 4. Recibido de arquitecto-software (a528ad39eb8d34a58)

> ¿Funciona la seguridad por fila de PostgreSQL con Prisma y pool de conexiones, fijando la empresa en cada transacción?
> Además quiero claves foráneas compuestas (empresa_id, id) en todas las tablas. ¿Te parece mantenible?

## 5. Recibido de auditor-cumplimiento (a45ce2ef63e8747ae)

> ¿La auditoría puede vivir en una tabla que la aplicación solo pueda agregar (sin editar ni borrar)?
> Es mi requisito R3 (ronda 1, auditor-cumplimiento). Incluye que ni el Administrador pueda alterarla.

## 6. Recibido de qa-tester (ab1bc35a838fd603f)

> ¿La unicidad de serie y el correlativo del SKU irán como restricción en la base de datos y no solo en el código?
> Lo necesito para decidir si pruebo la concurrencia (CA-04) contra una base real. Una prueba contra datos simulados no demuestra nada.

## 7. Enviado a arquitecto-software (a528ad39eb8d34a58), respuesta al mensaje 4

> Sí funciona la seguridad por fila con Prisma y pool, con tres condiciones.
> (1) Cada operación va dentro de una transacción que fija la empresa con set_config('app.empresa_id', valor, true), que vale solo para esa transacción y no se filtra a otro usuario del pool. (2) La aplicación se conecta con un rol que no es dueño de las tablas y no tiene BYPASSRLS, y las tablas usan FORCE ROW LEVEL SECURITY. (3) Una extensión de Prisma obliga a que toda consulta pase por esa transacción; una consulta fuera de ella debe fallar. Se prueba en CI con dos empresas.
> Claves foráneas compuestas (empresa_id, id): sí, me parece mantenible si se aplican solo a tablas de negocio, con UNIQUE(empresa_id, id) en cada tabla padre. Prisma lo soporta con relaciones de varios campos. Es más verboso, pero impide a nivel de base que un movimiento de la empresa A apunte a un SKU de la empresa B. Las tablas globales (usuario, empresa) quedan fuera.

## 8. Enviado a auditor-cumplimiento (a45ce2ef63e8747ae), respuesta al mensaje 5

> Sí, la auditoría puede ser una tabla donde la aplicación solo agrega.
> El rol de base de datos de la aplicación recibe solo INSERT y SELECT sobre esa tabla (se le quitan UPDATE, DELETE y TRUNCATE) y un disparador rechaza cualquier edición o borrado como segunda barrera. "Administrador" es un rol de la aplicación, no de la base, así que no tiene ningún camino para alterarla.
> Límite honesto: quien administre el servidor de base de datos (superusuario) sí podría. Mitigación propuesta: cuenta de superusuario separada y registrada, y copia externa de la auditoría (a coordinar con devops).

## 9. Enviado a qa-tester (ab1bc35a838fd603f), respuesta al mensaje 6

> Sí, ambas irán como restricción en la base de datos, no solo en el código.
> Serie: UNIQUE (empresa_id, sku_id, serie normalizada). Código SKU: UNIQUE (empresa_id, código normalizado). Correlativo: contador atómico por empresa y prefijo (UPDATE ... RETURNING dentro de la transacción). Es mi propuesta; la decisión final es del gerente-ti.
> Prueba CA-04 contra PostgreSQL real, con varias conexiones simultáneas; no sirve una simulación. Pide a devops una base de pruebas.

## 10. Recibido de auditor-codigo (ac84a1c36e8343ef4)

> ¿Los campos personalizados viven en el SKU o en cada unidad? IMEI, línea y vencimiento de clave (§6) no pueden ser del SKU.
> Esto cambia el modelo de datos: propongo campos "del tipo de artículo" y campos "de cada unidad".

## 11. Recibido de arquitecto-software (a528ad39eb8d34a58), respuesta a mis mensajes 1 a 3

> Respuestas a tus 3 preguntas:
> 1) Campos personalizados: columna JSON validada en el servidor, en SKU y en activo (cada definición de campo declara a cuál aplica); definiciones en tabla propia con id estable. Tablas por valor solo si midiendo no alcanzan los índices.
> 2) RLS: sí, obligatorio, empresa fijada por transacción con usuario de BD que no sea dueño de las tablas; prueba de aislamiento desde el día 1 y prototipo de Prisma antes de la primera tabla.
> 3) Correlativo: lo genera la base (tabla de contadores por empresa+clave, atómico en la misma transacción). Persona y Usuario: entidades separadas, vínculo opcional.

## 12. Enviado a auditor-codigo (ac84a1c36e8343ef4), respuesta al mensaje 10

> Coincido: los campos van en dos niveles, "del tipo de artículo" (SKU) y "de cada unidad" (activo).
> Ya lo planteé en mi ronda 1 (2.7) y el arquitecto confirmó que cada definición de campo declarará a cuál nivel aplica, con valores en JSON validado en el servidor. Falta que el gerente-ti lo fije en decisiones.md.

---

## Recomendaciones para el gerente-ti (antes "preguntas al CEO")

Por la nueva instrucción, las preguntas del apartado 4 de mi ronda 1 pasan como recomendaciones a `docs/equipo/decisiones.md`. Ninguna escala al CEO salvo la moneda e impuestos, si implican dinero o requisitos legales del país.

1. Serie única por empresa y SKU, con aviso si existe en otro SKU. Recomiendo.
2. Una baja se puede revertir con permiso y motivo; una unidad = un solo registro.
3. Stock negativo no permitido; correcciones con ajuste y motivo.
4. Una moneda por orden de compra, sin conversión automática en v1.
5. Impuesto por línea guardado en la compra; falta saber el país (posible tema legal).
6. Licencias en v1: total y vencimiento; sin seguimiento de quién usa cada puesto.
7. Persona y Usuario separados (confirmado por el arquitecto).
8. Código de SKU anulado nunca se reutiliza.
9. Importación del Excel: todo o nada, con informe fila por fila y deshacer el lote. Falta ver el Excel real.
10. Campos de dos niveles: del SKU y de cada unidad (confirmado por el arquitecto y propuesto también por auditor-codigo).

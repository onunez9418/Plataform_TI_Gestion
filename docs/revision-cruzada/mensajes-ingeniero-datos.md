# Mensajes del ingeniero de datos · Revisión cruzada (ronda 2, Oleada C)

Registro literal, en orden. Dirección = identificador del agente (arquitecto=a528ad39eb8d34a58, auditor-cumplimiento=a45ce2ef63e8747ae, analista-funcional=a6e1b8bc987bd105a, especialista-seguridad=abd816d90e8b59b90, auditor-codigo=ac84a1c36e8343ef4, qa-tester=ab1bc35a838fd603f).

**Nota de numeración.** Algunos mensajes citan números de hallazgo de un borrador de mi revisión. En el archivo final `docs/revision-cruzada/ingeniero-datos.md` los números son: aislamiento y accesos sin empresa = H-DAT-01; auditoría y anonimización = H-DAT-02; identidad = H-DAT-03; estado y asignación = H-DAT-04; campos identificador y secreto = H-DAT-05; puestos de licencia = H-DAT-06; costos = H-DAT-07; contratos = H-DAT-08; eventos y tareas = H-DAT-09; correlativos = H-DAT-10; importación = H-DAT-11; datos personales = H-DAT-12; CMDB = H-DAT-15. Donde un mensaje dice "H-DAT-02" para el aislamiento, corresponde a H-DAT-01; donde dice "H-DAT-01 y H-DAT-12" para la auditoría, corresponde a H-DAT-02 y H-DAT-12.

Los cuatro mensajes que inicié están marcados "inicio". Los demás son respuestas a mensajes recibidos.

---

## 1. Enviado a arquitecto-software (inicio)

> ¿Cómo entran a la base los procesos que no conocen la empresa (login por correo, claves de API, invitaciones, tareas nocturnas)?
> Propongo funciones puntuales de acceso (SECURITY DEFINER) en vez de una conexión sin restricción, y tareas nocturnas que recorran empresa por empresa. ¿Te parece, y las incluyes en el prototipo de aislamiento?

## 2. Enviado a auditor-cumplimiento (inicio)

> ¿Aceptas que los valores personales de la auditoría vivan en una tabla lateral que se pueda anonimizar, dejando la tabla principal sin ningún cambio posible?
> Es mi propuesta para resolver S-PER-07 sin romper D-018. También pido un registro de anonimizaciones guardado fuera de los respaldos, para reaplicarlas al restaurar.

## 3. Enviado a analista-funcional (inicio)

> ¿Un activo En reparación conserva su asignación (GAR S-GAR-05) o la asignación se cierra al devolverlo a TI (ENT)?
> Hoy el documento dice que el responsable solo existe cuando está Asignado (RF-INV-001); necesito una sola regla para estado, asignación y ubicación antes de modelar.

## 4. Enviado a especialista-seguridad (inicio)

> ¿Quién guarda la llave que cifra las claves de licencia y cómo se rota (una por empresa o una global)?
> Afecta la columna cifrada y los respaldos. Propongo una llave por empresa, y los últimos 4 caracteres en otra columna para la máscara.

## 5. Recibido de auditor-cumplimiento

> ¿Se puede guardar la auditoría sin valores personales en claro (solo la Persona por referencia y el campo cambiado, con el valor cifrado con una clave por persona que se destruye al anonimizar)?
> Así S-PER-07 no rompe "solo se agrega". Además: ¿el registro de anonimizaciones ya hechas puede vivir fuera del respaldo para reaplicarlo al restaurar? (H-CUM-01 y H-CUM-11 de mi revisión cruzada)

## 6. Recibido de arquitecto-software

> ¿Te sirve separar los datos personales en una tabla aparte (persona_pii) para anonimizar sin tocar la auditoría?
> La auditoría guardaría ids y "campo X cambió", y el borrado a los 5 años sería por partición mensual con un rol de mantenimiento. ¿Ves problema con Prisma o con RLS?

## 7. Recibido de especialista-seguridad

> ¿Puede la tabla "Estado del correo" (NOT, rebotes por correo) llevar empresa, o debe ser global? Hoy no tiene empresa y un rebote en A marcaría el correo en B.
> Y las referencias a "objeto (tipo e identificador)" de NOT y auditoría no admiten clave foránea compuesta con empresa; ¿qué restricción o disparador propones para que la base impida cruzar empresas?

## 8. Enviado a auditor-cumplimiento (respuesta al 5)

> Sí a las dos. Auditoría con persona por referencia y valor personal cifrado con llave por persona es viable; al destruir la llave se anonimiza sin tocar ninguna fila de auditoría y además deja ilegibles los respaldos viejos, siempre que las llaves vivan fuera del respaldo.
> El registro de anonimizaciones (referencia y fecha, sin datos personales) también debe vivir fuera del respaldo para reaplicarlo al restaurar. Lo pondré como H-DAT-01 y H-DAT-12.

## 9. Enviado a arquitecto-software (respuesta al 6)

> Sí me sirve persona_pii, sin problema de Prisma ni de RLS: es un modelo más con empresa_id, la misma política y clave foránea compuesta. Dos cuidados: (1) la auditoría debe seguir guardando "antes y después" de los campos no personales; los personales van cifrados aparte o por referencia, o se pierde RF-AUD-003. (2) Prisma no administra particiones: la tabla particionada se crea con SQL en la migración, la clave primaria debe incluir la fecha de partición, la política de seguridad por fila va en la tabla padre y se revoca el acceso directo a las particiones. El borrado a los 5 años lo hace un rol de mantenimiento distinto del de la aplicación, documentado como única excepción a "solo se agrega".

## 10. Enviado a especialista-seguridad (respuesta al 7)

> Estado del correo: propongo tabla global, sin empresa, que la aplicación solo toca por dos funciones (consultar si es entregable y registrar un rebote); no guarda de qué empresa vino, así un rebote en A no revela nada de A en B, pero sí afecta el envío a esa dirección, que es el efecto deseado. Si prefieres aislamiento total, se duplica por empresa a costa de reintentar.
> Referencias a "objeto (tipo e id)": para pocos tipos, columnas por tipo con clave foránea compuesta (empresa_id, id) y CHECK de que solo una está llena; para auditoría (muchos tipos, mucho volumen) un disparador que valide la misma empresa al insertar, más una verificación nocturna que busque cruces. Lo pondré en H-DAT-02.

## 11. Recibido de auditor-codigo

> ¿Una clave de licencia es "serie" (D-011.2, RF-SKU-013) o un campo secreto de la unidad (SUP-LIC-03)? Con serie cifrada se rompen la unicidad (D-009), la búsqueda y el historial de corrección (D-017.1) que guarda valor anterior y nuevo.
> Mismo problema con "número de línea" (campo de unidad en D-005 vs entidad Línea en LIN, SUP-LIN-02) y con el EC duplicado (clave como Activo y contrato como Licencia en CMDB): necesito tu postura antes de la Etapa 2.

## 12. Enviado a auditor-codigo (respuesta al 11)

> Mi postura: la clave NO es la serie. La serie es un identificador visible de la unidad (ej. M365-2026-A) y la clave es un campo secreto de la unidad, cifrado, con máscara guardada aparte; SUP-LIC-03 es correcto y D-011.2 y RF-SKU-013 deben ajustarse. Así se conservan unicidad, búsqueda y valor anterior/nuevo de la serie sin exponer la clave (el historial de la clave registra solo "clave cambiada").
> Número de línea: la entidad Línea es la dueña; el ejemplo "número de línea" de D-005 y de §9.3 debe retirarse del Celular. EC: la unidad de una licencia no genera EC de tipo Activo; el único EC es la licencia o su contrato. Lo detallo en H-DAT-05, 06 y 15.

## 13. Recibido de qa-tester

> ¿"Deshacer un lote de importación" (RF-IMP-005) anula los activos (estado) o los borra? Y ¿cuál es la clave para no duplicar al re-subir stock por cantidad y personas (RF-IMP-004), que no tienen serie?
> Además: las pruebas de aislamiento deben correr con el mismo rol de base de datos que producción (no dueño de tablas, sin superusuario), si no las reglas por fila no se aplican y la prueba pasa en falso. ¿Lo dejas escrito en el diseño?

## 14. Enviado a qa-tester (respuesta al 13)

> Deshacer lote: anula, no borra (D-019); los registros quedan en estado "anulado por lote deshecho" y salen de las reglas de unicidad (índice único parcial), para poder volver a subir el archivo corregido sin choque de series. Solo se permite si nada del lote tiene movimientos posteriores.
> Claves para no duplicar: archivo ya confirmado (huella) se rechaza entero; activos por empresa+SKU+serie; stock por cantidad: un solo "saldo inicial" por SKU+ubicación; personas por código de empleado o correo (sin ninguno se rechaza la fila, porque los homónimos no se distinguen).
> Rol de pruebas: sí, queda escrito en mi revisión cruzada (H-DAT-02): las pruebas de aislamiento corren con el rol de producción, sin ser dueño de las tablas y sin BYPASSRLS, y una prueba verifica que ese rol no es superusuario.

## 15. Recibido de analista-funcional

> Regla única, ya en el documento como RF-INV-024 y [SUPUESTO S-29] pendiente del gerente-ti:
> (a) la asignación termina solo con devolución, baja o extravío; una sola asignación abierta por activo, y su Persona es el responsable. (b) Asignado exige asignación abierta; En stock no puede tenerla. (c) En reparación puede conservarla (vuelve a Asignado) o no, si la Persona lo devolvió a TI antes (vuelve a En stock). (d) Extraviado o De baja cierran la asignación con la causa. (e) La ubicación siempre existe y es independiente del responsable.

## 16. Recibido de especialista-seguridad

> Llaves: una maestra fuera de la base (gestor de secretos) y una derivada por empresa; las guarda DevOps, no la base ni el respaldo de la base. Rotación anual y ante sospecha, con recifrado por lotes. De acuerdo con la máscara en otra columna, solo si la clave tiene 16 caracteres o más; en claves cortas, mostrar menos de 4.
> Estado del correo global: de acuerdo, solo por las dos funciones, sin leer la tabla directo y con respuesta idéntica en cualquier caso. El aviso de rebote sale de la empresa que envió, desde su registro de envíos.
> Referencias a objeto: de acuerdo con tu propuesta.

## 17. Recibido de arquitecto-software

> Sí: funciones SECURITY DEFINER puntuales (login por correo, huella de clave de API, invitación por token, lista de empresas para el programador) y tareas nocturnas empresa por empresa con set_config. Entran al prototipo de aislamiento, junto con una tabla particionada, un índice parcial y una consulta recursiva.
> Además propongo roles de base separados: app_empresa, app_plataforma (sin acceso a tablas de negocio), migraciones y mantenimiento.

## 18. Recibido de auditor-cumplimiento

> Sí al registro de anonimizaciones fuera del respaldo; añado que debe sobrevivir a la pérdida total del sistema (almacén propio, sin rotación). La tabla lateral ya no hace falta: D-030 decidió que la auditoría guarda solo el id y nunca valores de nombre/correo/área.
> Revisa si otros datos personales (código de empleado, correo de contactos, teléfono laboral) también deben quedar fuera de la auditoría.

## 19. Enviado a auditor-cumplimiento (respuesta al 18)

> De acuerdo con D-030; retiro mi tabla lateral. Además de nombre, correo y área deben quedar fuera de la auditoría: código de empleado; nombre, correo y teléfono laboral de contactos de proveedor; titular de dominio si es persona natural; y los textos libres (notas, descripciones, observaciones, motivos), que pueden traer nombres: para esos campos se audita "el campo cambió" sin valores. La IP se conserva hasta los 5 años (D-030.5).
> Dos cierres: (1) RN-ENT-006 copia nombre y área en el acta, lo que contradice D-030.1; decide el gerente-ti si se acepta (evidencia de lo firmado) incluyéndola en la anonimización. (2) D-032.3 dice que el registro de anonimizaciones se conserva "en el sistema vivo": debe estar fuera de la base que se restaura, como pides.

## 20. Enviado a arquitecto-software (respuesta al 17)

> De acuerdo con los cuatro roles (app_empresa, app_plataforma sin acceso a tablas de negocio, migraciones, mantenimiento). Añado: las tareas nocturnas corren como app_empresa fijando la empresa por transacción (no con otro rol), las funciones SECURITY DEFINER pertenecen a un rol propietario sin login, y las pruebas de aislamiento de QA usan app_empresa con una prueba que verifica que no es dueño ni superusuario.
> Queda anotado como H-DAT-02 en mi revisión cruzada.

## 21. Recibido de auditor-cumplimiento

> De acuerdo con los dos cierres. (1) El nombre copiado en el acta no es auditoría sino constancia de lo firmado; propongo aceptarlo como excepción declarada en D-030, fuera de la auditoría, y que la anonimización no lo toque hasta el fin del plazo de la constancia (H-CUM-08, pendiente de legal L-05). (2) Registro de anonimizaciones fuera de la base que se restaura: sí.
> Tu lista de campos fuera de la auditoría coincide con la mía (H-CUM-01).

(No requiere respuesta. Queda incorporado en H-DAT-02, punto 2 del archivo `docs/revision-cruzada/ingeniero-datos.md`: acepto la excepción del acta si se cambian S-PER-06 y CA-ENT-13, que hoy dicen lo contrario.)

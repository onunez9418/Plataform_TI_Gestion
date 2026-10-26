# ADR-11 · Auditoría: tres autores, partición mensual y purga controlada (T-8)

**Estado:** Propuesto · **Decide:** Gerente de TI (revisan Cumplimiento y Datos) · **Base:** D-018, D-024, D-030, D-041, D-052, D-054.1, D-055 T-8, D-061.6

## Contexto
La auditoría solo se agrega (D-018) y debe: nombrar al autor (usuario, integración o sistema), no guardar valores de datos personales (D-030), conservarse 5 años y poder retirarse al vencer sin editar nada. DevOps preguntó si la partición es anual (D-030.8) o mensual (D-055 T-8).

## Decisión

### Estructura
- Tabla `auditoria` **particionada por mes** en `creado_en`; clave primaria `(creado_en, id)` (la clave de partición debe estar en la clave). Una partición por defecto recoge cualquier fila fuera de rango y dispara alarma si deja de estar vacía.
- Columnas: `empresa_id`, `autor_tipo` (`membresia | integracion | sistema`), una sola de `autor_membresia_id | autor_integracion_id | autor_regla` (CHECK de exactamente una; "sistema" guarda el identificador de la regla y de quien la configuró), `accion`, `entidad_tipo`, `entidad_id`, `cambios` (JSON), `motivo`, `ip`, `creado_en`. Soporte actúa como autor de plataforma con persona y motivo.
- Índices `(empresa_id, entidad_tipo, entidad_id, creado_en)` y `(empresa_id, creado_en)`.
- La referencia a la entidad no tiene clave foránea (entidades de muchos tipos): un **disparador** comprueba que pertenece a la misma empresa y una verificación nocturna busca cruces (D-039.7).
- Un **lote** (importación) es una entrada más su detalle en `auditoria_lote_detalle`, particionada igual (D-050.10).

### Solo agregar
`app_empresa` tiene INSERT y SELECT. Un disparador rechaza UPDATE, DELETE y TRUNCATE (segunda barrera). La única excepción documentada es la purga por partición (abajo), fuera de la aplicación.

### Qué se guarda de los cambios
Una sola función, `registrarAuditoria`, escribe; filtra con la **lista cerrada de campos personales** (D-030.6: nombre, correo, área, código de empleado, teléfono y correo de contactos, titular persona natural, IMEI, número de línea, IP-valor, texto libre) mantenida en un solo lugar del código y alimentada por la marca `dato_personal` de los campos (ADR-17). De esos guarda solo "el campo X cambió". La aplicación **nunca** llena valores personales. Los datos personales viven en `persona_pii` (tabla aparte, D-041.3); anonimizar es sobrescribir esa fila y la auditoría no se toca (ADR-12).

### IP y eventos de seguridad
Se mantiene la lectura de D-030.5: la IP de acciones realizadas queda en la auditoría hasta el plazo de 5 años, y se retira con la partición. Los accesos fallidos, el correo escrito en un intento fallido y los rechazos por empresa ajena van a **`evento_seguridad`** y **`evento_seguridad_ingreso`** (ADR-04), escritos en una transacción independiente, con partición mensual y retención de 12 meses. Cumplimiento confirma con legal si la IP debe quedar en la auditoría (L-04).

### Lecturas auditadas
Las lecturas masivas (≥ 5.000 filas), la consulta de impacto con ≥ 100 nombres de Personas, el registro de envíos, la cola de derechos y **todo acceso de soporte** se registran por una **ruta de escritura aparte** (transacción propia), de modo que también se registren desde una transacción de solo lectura y no se pierdan si la operación falla.

### Retención y purga
- **Partición mensual** (decisión, reemplaza "anual" de D-030.8). Motivo: con particiones anuales una fila de enero viviría 6 años o la purga se aplazaría un año; con mensuales la retención es exactamente de 60 meses, los índices por partición son pequeños y retirar un mes es barato. Costo: un trabajo que crea las particiones de los 3 meses siguientes (alarma si falla).
- El rol `mantenimiento` **no es dueño**: ejecuta `purgar_particion_auditoria(mes, acta_id)` (DEFINER, propiedad de `migraciones`). Rechaza si la partición tiene menos de 60 meses, si en `purga_acta` no hay **dos aprobadores distintos** o si el interruptor legal está apagado. Deja constancia (partición, fecha, quién). **Apagada por defecto hasta que legal confirme los plazos (L-04, D-033.4)**; nada irreversible se activa.
- Eventos de seguridad: igual con 12 meses.
- Copia externa (DevOps, D-052.2): el trabajo copia filas con `creado_en` anterior a *ahora − 5 minutos*, ordenadas por `(creado_en, id)`, porque una secuencia puede confirmarse fuera de orden y saltarse filas; la verificación semanal detecta omisiones.

## Consecuencias
- Prisma no modela particiones: SQL en la migración (ADR-06).
- Consultas sin `empresa_id` y fecha recorren todas las particiones; la interfaz siempre filtra por empresa y rango.
- Varias personas con acceso total a la base pueden alterar la auditoría: se reduce a "detectable" con la copia externa encadenada.

## Qué prueba lo valida
- H3: `app_empresa` no puede UPDATE/DELETE/TRUNCATE; la purga rechaza antes de 60 meses, sin dos aprobadores y con el interruptor apagado; con una partición simulada de 61 meses y las condiciones, la acepta y deja constancia; consulta por `(empresa, entidad, id)` con 2 millones de filas en 24 particiones p95 ≤ 200 ms.
- Prueba del nombre canario (QA): anonimizar a una Persona y comprobar que la auditoría sigue completa y sin su nombre.
- Prueba de que cambiar un campo personal deja "campo cambió" sin valores.
- Autor "sistema" con regla; CHECK rechaza dos autores.

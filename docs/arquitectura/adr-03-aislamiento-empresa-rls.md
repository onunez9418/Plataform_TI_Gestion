# ADR-03 · Aislamiento por empresa con seguridad por fila, incluida la lectura de soporte (T-3)

**Estado:** Propuesto · **Decide:** Gerente de TI (revisa Seguridad) · **Base:** D-025 (reemplazada), D-039, D-046, D-073, RS-10

## Contexto
Una sola base compartida por todas las empresas. "Una consulta que olvide el filtro es un defecto grave" (riesgo #2). Con 17 módulos habrá del orden de 150 a 200 tablas: hacerlo a mano en cada una garantiza un olvido.

## Opciones
1. Una base o esquema por empresa. Descartada: migraciones y respaldos multiplicados, cuesta más y no es necesario al volumen supuesto.
2. Solo filtro en el código. Descartada: un olvido se convierte en fuga.
3. **Filtro en el código + seguridad por fila en la base** + claves foráneas compuestas. Elegida (dos capas, D-025).

## Decisión

### Capa de base de datos (la macro)
`aplicar_aislamiento(tabla, opciones)` es la única forma de crear una tabla de negocio. Hace, de una vez:
1. columna `empresa_id uuid NOT NULL` y `UNIQUE (empresa_id, id)` (objetivo de claves foráneas compuestas);
2. `ENABLE` y **`FORCE ROW LEVEL SECURITY`** (el dueño tampoco se salta las reglas);
3. política `USING / WITH CHECK (empresa_id = app_empresa_actual())`, donde `app_empresa_actual()` lee `current_setting('app.empresa_id', true)` y devuelve NULL si no hay valor: **sin contexto, cero filas** (falla cerrado);
4. disparador que impide cambiar `empresa_id`;
5. permisos mínimos para `app_empresa`;
6. alta de la tabla en `catalogo_aislamiento`.

Toda referencia entre tablas usa clave foránea **compuesta** `(empresa_id, x_id)`: una orden no puede apuntar a un SKU o proveedor de otra empresa. Todo índice empieza por `empresa_id`.

Opción `sin_soporte`: añade una política **RESTRICTIVE** que oculta la tabla cuando `app.modo_soporte = '1'` (columnas secretas, cola de derechos de datos, filas de importación en preparación).

### Capa de aplicación
- `conEmpresa(empresaId, fn)`: transacción interactiva cuyo **primer paso** es `SELECT set_config('app.empresa_id', $1, true)` (local a la transacción: segura con el agrupador en modo transacción). Es la **única** puerta a la base: el cliente de Prisma no se importa fuera de `nucleo/aislamiento` (regla de lint `no-restricted-imports`).
- La empresa sale de la dirección (ADR-05) y se compara con la membresía en cada petición; el cliente nunca impone una empresa.
- Procesos automáticos: empresa por empresa con `app_empresa` y la empresa fijada dentro de la transacción (ADR-02).
- Lo que no pertenece a una empresa (usuario, sesión, enlace…) está en la lista cerrada de tablas globales y solo se toca con funciones SECURITY DEFINER (ADR-04).

### Lectura de soporte (D-039.10, D-073, RF-PLA-013)
Una sesión de soporte **no usa `app_plataforma`**. Es una transacción de **solo lectura** de **una empresa**, con `app_empresa`.

Tabla global `autorizacion_soporte(id, empresa_id, motivo, persona_plataforma_id, creada_por_membresia_id, creada_en, vence_en, primera_vez_usada_por, revocada_en)`, con `vence_en <= creada_en + 24 h` (CHECK). La crea un administrador de esa empresa mediante `autorizacion_soporte_crear` (DEFINER; la empresa sale del contexto, no de un parámetro).

Flujo de una lectura:
1. `BEGIN; SET TRANSACTION READ ONLY;`
2. `SELECT iniciar_lectura_soporte(autorizacion_id, persona_plataforma_id)` (DEFINER, en la lista cerrada). Comprueba: existe, no vencida, no revocada, la persona es la designada y, si ya se usó, la misma que la usó primero. **La empresa se toma de la autorización**, nunca de un parámetro. Fija `app.empresa_id` y `app.modo_soporte = '1'` como valores locales a la transacción.
3. Las consultas posteriores pasan por la seguridad por fila de siempre; cualquier escritura falla por transacción de solo lectura.

Reglas adicionales:
- **Auditoría de cada consulta antes de ejecutarla, en una transacción aparte** (una transacción de solo lectura no puede insertar). Si el registro falla, no hay lectura. Queda en la auditoría de la propia empresa (RF-PLA-005) con autor "plataforma: persona X" y sin el contenido leído.
- La sesión **no ve** columnas secretas ni la cola de derechos de datos (`sin_soporte`).
- Prohibidos `BYPASSRLS` y superusuario. Banner "sesión de soporte" en la pantalla. Una persona de plataforma no puede crear su propia autorización.

## Consecuencias
- Aislamiento sin depender de la disciplina de cada desarrollador; costo: trabajo extra de la macro y de la prueba genérica.
- Cada petición abre una transacción (un viaje extra a la base); se mide en el prototipo (H10).
- Las pruebas de aislamiento corren **siempre con `app_empresa`**; si corrieran con el dueño no probarían nada.
- La autorización de soporte confía en que el servidor de aplicación indica quién es la persona de plataforma (el rol de base es el mismo para todas); la defensa es la ruta de plataforma con llave física y la auditoría previa.
- Si Prisma no alcanza (agrupador, transacciones interactivas), plan B: Kysely o SQL puro solo en `nucleo/aislamiento`.

## Qué prueba lo valida
- **Prueba genérica en CI** que recorre el catálogo: falla si hay tabla sin las protecciones que no esté en la lista global; además un caso de aislamiento **por módulo** (por identificador interno, no por "número").
- Siete criterios de QA (D-055): consulta sin filtro devuelve 0 filas ajenas; insertar con empresa ajena falla; clave foránea cruzada falla; UPDATE y DELETE ajenos afectan 0 filas; 50 peticiones intercaladas sobre un grupo compartido sin que la empresa quede pegada; conexión limpia tras error; `app_empresa` no puede modificar la auditoría.
- `app_empresa` no es dueño, no tiene BYPASSRLS y no es superusuario (consulta al catálogo).
- **Soporte, 8 casos:** válida lee solo esa empresa y no puede escribir; **vencida** = 0 filas; **de otra empresa** = 0 filas de la otra; **usada por otra persona** = rechazo; revocada = rechazo; tablas `sin_soporte` = 0 filas; auditoría escrita aunque la lectura falle; la conexión vuelve limpia (la siguiente petición normal no ve `modo_soporte`).

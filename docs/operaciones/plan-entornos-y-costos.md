# Plan de operación: entornos, publicación, respaldos, correo y costos

**Autor:** Ingeniero DevOps · **Fecha:** 2026-10-25 · **Estado:** propuesta para revisión (Etapa 0, todavía no hay código)
**Lee antes:** `docs/equipo/decisiones.md` (D-001 a D-029), `docs/equipo/riesgos.md`, `docs/documento-funcional.md` v0.2 (sección 19, requisitos RNF-010 a RNF-018).
**Para quién:** el CEO lo lee completo; los recuadros "Detalle para el equipo" son para Arquitecto, Datos y Seguridad y el CEO puede saltarlos.

---

## 0. Resumen en un minuto

1. Habrá **tres "lugares" donde corre la plataforma**: el computador de quien programa (desarrollo), un lugar de pruebas en internet con datos inventados (pruebas) y el lugar real (producción). Cada uno tiene su propia base de datos y sus propias claves. **Nunca se mezclan y nunca hay datos reales fuera de producción.**
2. **Cada cambio pasa por una revisión automática** (se llama integración continua). Si algo falla, el cambio no se puede publicar. No hay atajos.
3. **Publicar una versión es un proceso corto, escrito y reversible.** Antes de publicar se hace una copia de seguridad; si algo sale mal, se vuelve a la versión anterior.
4. **Copias de seguridad diarias y cifradas**, guardadas en dos lugares distintos, y una **restauración practicada** (no solo prometida) antes de que alguien use datos reales.
5. **El registro de auditoría tiene una copia externa** que el proveedor de la base de datos no puede alterar sin que nos demos cuenta. Es la respuesta al riesgo que queda cuando alguien con el máximo poder sobre la base de datos puede tocar los datos.
6. **El correo es una pieza crítica**: como se entra con un enlace que llega al correo, si el correo falla, nadie entra. Por eso se elige el proveedor con criterios medibles, se prueba con Gmail y Outlook antes de programar el acceso, y hay un plan para cuando falle.
7. **Costos:** no puedo verificar precios desde aquí, así que **no pongo cifras confirmadas**. Entrego, por cada gasto, las opciones, el criterio de elección y una recomendación de arranque de costo mínimo. Todo gasto mensual está marcado **[ESCALAR AL CEO]**.

### Lo que le pedimos al CEO (resumen; el detalle está en la sección 8)

| # | Pedido | Cuándo hace falta | Recomendación |
|---|---|---|---|
| A | Aprobar el **arranque de costo mínimo** para desarrollo y pruebas (planes gratuitos o los más baratos, sin datos reales) | Antes de la Etapa 1 | Aprobar |
| B | Decidir **a nombre de quién** quedan las cuentas (alojamiento, base de datos, correo, dominio, copias) | Antes de la Etapa 1 | A nombre de la empresa del CEO, con al menos dos personas con acceso y segunda verificación |
| C | Informar si **ya existe un dominio de internet** de la empresa (por ejemplo `miempresa.com`) y quién lo administra | Antes de la Etapa 1 | Usar un subdominio del que ya existe, si lo hay |
| D | Aprobar el **gasto mensual de producción** (base de datos de pago, correo, copias externas, vigilancia) | Antes de la Etapa 7, o antes de cualquier etapa que se use con datos reales | Aprobar cuando se acerque la fecha, con precios ya verificados |
| E | Informar el **país** de las empresas (P-004) | Antes de elegir la región de los servidores | Necesario también para el abogado (L1, L4) |

### Palabras que usamos

- **Entorno:** una copia completa de la plataforma funcionando en un lugar.
- **Base de datos:** donde se guarda toda la información.
- **Integración continua:** un robot que revisa cada cambio apenas se escribe.
- **Despliegue / publicar:** poner una versión nueva a disposición de los usuarios.
- **Reversa (vuelta atrás):** volver a la versión anterior si la nueva falla.
- **Migración:** un cambio en la forma en que se guarda la información (por ejemplo, agregar una columna).
- **Respaldo:** copia de seguridad de la información.
- **Secreto:** una clave o contraseña que no puede verse en público.
- **SPF, DKIM, DMARC:** tres "sellos" que se configuran en el dominio para que Gmail y Outlook crean que un correo realmente viene de nosotros y no lo manden a spam.

---

## 1. Entornos

### 1.1 Los tres entornos

| | **Desarrollo** | **Pruebas** | **Producción** |
|---|---|---|---|
| Para qué sirve | Escribir y probar mientras se programa | QA prueba como lo haría un usuario real; demos al CEO antes de aprobar cada etapa; revisión automática de cada cambio | Uso real |
| Dónde corre | El computador de quien programa; se levanta con **un solo comando** (instrucciones en el `README`) | En internet, en una dirección privada que pide acceso | En internet, con la dirección definitiva |
| Base de datos | PostgreSQL local (en contenedor), desechable, se puede borrar y recrear en minutos | **PostgreSQL real, igual a la de producción** (misma versión, mismas reglas de aislamiento), con conexiones simultáneas | PostgreSQL gestionada por un proveedor, con respaldos |
| Datos | Inventados, creados por un programa (siempre los mismos, para que las pruebas se repitan) | Inventados (ver 1.3). Hay un volumen grande inventado para medir rendimiento (RNF-011: 100.000 activos) | Reales, de las empresas, solo después de la aprobación del CEO (RNF-018) |
| Correo | **No sale ningún correo a internet**: se capturan en una bandeja local para verlos | Solo salen a **direcciones de prueba permitidas** (lista cerrada). Nunca a personas reales | Real, con el dominio verificado |
| Quién entra | Quien programa | Equipo de TI y CEO para las demos | Usuarios de las empresas y Administrador de plataforma |
| Se reinicia | Cuando se quiera | Antes de cada demo y cada ciclo de QA (con aviso) | Nunca. Solo se cambia con una publicación |
| Claves | Las suyas, sin valor | Las suyas, distintas de producción | Las suyas, guardadas en el lugar seguro de la sección 5 |

**Reglas que no se rompen:**

1. Una persona o programa que trabaja en desarrollo o pruebas **no tiene** las claves de producción.
2. Las vistas previas que se generan por cada cambio **apuntan siempre a la base de pruebas, nunca a producción**.
3. Producción solo cambia con una publicación (principio de DevOps). Nadie edita datos de producción "a mano" para tareas de rutina (D-003).
4. Un entorno nunca lee ni escribe en la base de otro.

### 1.2 La base de pruebas para QA

QA necesita comprobar cosas que **solo pasan con una base real y varias personas a la vez**: que 20 personas creando artículos a la vez obtengan 20 códigos distintos (D-007), que dos personas recibiendo la misma orden no se pasen de lo pendiente (D-016), que el stock nunca quede negativo (D-010) y que una empresa no vea lo de otra (D-025). Una base "de juguete" (en memoria, de un solo usuario, o de otro tipo que no sea PostgreSQL) **no** detecta esos fallos. Por eso hay dos formas de base de pruebas:

| Forma | Qué es | Para qué |
|---|---|---|
| **Desechable en la revisión automática** | Una PostgreSQL nueva, vacía, que nace al empezar cada revisión y desaparece al terminar | Probar que las migraciones arrancan desde cero, pruebas de aislamiento y de concurrencia en cada cambio |
| **Permanente en internet** | Una PostgreSQL gestionada, separada de producción, con las mismas reglas | QA manual, pruebas de punta a punta con navegador, demos al CEO, pruebas de rendimiento con datos grandes |

**Detalle para el equipo (Datos, QA, Arquitecto):**
- Ambas con la **misma versión mayor de PostgreSQL** que producción. Se fija la versión en un solo archivo.
- La base de pruebas permanente debe admitir **como mínimo unas 20 conexiones simultáneas** para los casos de concurrencia de QA; verificar el tope de conexiones del plan antes de elegir proveedor.
- Usuarios de base de datos (también en pruebas), para que las pruebas sean fieles: (1) **dueño de las tablas**, usado solo por las migraciones; (2) **usuario de la aplicación**, sin permiso de superusuario, sin saltarse las reglas por fila y sin ser dueño de las tablas (el dueño se salta las reglas salvo que se fuerce); (3) **lector de la auditoría** (ver 4.4). Si QA prueba con el dueño, la prueba de aislamiento da un falso "todo bien".
- El proveedor de conexiones agrupadas (necesario en servidores sin estado como Vercel) puede romper las reglas por fila si la empresa de la sesión se fija de forma que no sobrevive entre conexiones. **El prototipo de D-025 se corre sobre el proveedor candidato y con su agrupador de conexiones**, no solo en local. Esto adelanta la elección de proveedor de base de datos a antes de ese prototipo (ver 9.2).

### 1.3 Datos de prueba: nunca reales (D-028, RF-DAT-010)

- **Fuente única:** un programa generador crea empresas, usuarios, personas, SKU, activos y órdenes **inventados**. Los nombres son obviamente falsos y los correos usan dominios reservados para ejemplos (`@ejemplo.test`), que no existen en internet.
- **El Excel, la orden de compra y la de servicio del CEO** llegan con nombres de personas reemplazados. Si el CEO prefiere entregarlos tal cual, se guardan **fuera del repositorio y fuera de los entornos de prueba**, en un lugar con lista de personas autorizadas, segunda verificación y registro de quién entró. Qué servicio exacto se usa lo decido con Seguridad al recibir el primer documento; hoy no hay nada que guardar. Mientras no lleguen, se usa un Excel de ejemplo declarado como tal.
- **Revisión automática de datos personales:** cada cambio pasa por un buscador de claves y de patrones (ver 2) y por una regla: las pruebas solo pueden usar el generador o dominios `.test`. No es perfecto (un nombre real escrito a mano no se detecta de forma automática), por eso también hay una revisión humana en la lista de verificación de cada publicación.
- **Copias de producción a pruebas: prohibido.** Si se necesita reproducir un error de producción, se reproduce con datos inventados. Si alguna vez fuera imprescindible, requeriría la aprobación escrita de Seguridad y de la Jefatura de Proyecto, datos anonimizados y borrado posterior.

### 1.4 Cuándo se necesita cada cosa

| Etapa | Qué debe estar listo |
|---|---|
| 0 (ahora) | Este plan, la estimación de costos, y el `README` + `.env.example` + el comando único para levantar desarrollo cuando se cree el proyecto |
| Antes de la 1 | Repositorio con ramas protegidas, revisión automática básica, base desechable, base de pruebas permanente en el proveedor candidato (para el prototipo de D-025), cuenta de correo de prueba (bandeja de captura), dominio definido |
| 1 | Revisión automática completa (sección 2), correo real de prueba con dominio verificado y evaluación de entrega a Gmail/Outlook, vigilancia de errores en pruebas, primer despliegue a pruebas, auditoría con su usuario de base separado |
| 2 a 6 | Cada tabla nueva trae su prueba de aislamiento; respaldo de pruebas y primera restauración de ensayo |
| Antes de cualquier etapa con uso real | Respaldos diarios en producción, restauración probada, copia externa de auditoría funcionando, plan de reversa por publicación, manuales (RNF-014 a RNF-016) |
| 7 | Producción con datos reales: requiere la aprobación del CEO (RNF-018, I2) |

---

## 2. Integración continua: la revisión automática de cada cambio

**Herramienta propuesta:** GitHub Actions (el código ya vive en GitHub). Alternativas no hacen falta mientras el repositorio esté ahí.

### 2.1 Qué se ejecuta en cada cambio

Cada propuesta de cambio (en el lenguaje de GitHub, un "pull request") dispara estas revisiones, en este orden. Las baratas van primero para fallar rápido.

| # | Revisión | Qué comprueba | ¿Bloquea? |
|---|---|---|---|
| 1 | **Instalación limpia** | Las dependencias se instalan exactamente como están fijadas en el archivo de bloqueo; sin sorpresas de versiones | Sí |
| 2 | **Análisis de código** | Estilo y errores comunes (linter) y verificación de tipos de TypeScript | Sí |
| 3 | **Búsqueda de secretos y datos personales** | Que no se haya colado una clave, un archivo `.env`, un correo o un nombre real | Sí |
| 4 | **Pruebas unitarias** (Vitest) | La lógica de negocio, sin base de datos | Sí |
| 5 | **Migraciones desde cero** | Se crea una PostgreSQL vacía, se aplican todas las migraciones, y se comprueba que el resultado coincide con el esquema escrito (no hay "diferencias fantasma") | Sí |
| 6 | **Pruebas con base real** | Las pruebas de concurrencia (correlativos, series, stock, recepción), reglas de la base de datos y auditoría que solo se agrega | Sí |
| 7 | **Prueba de aislamiento entre empresas (obligatoria por tabla)** | Ver 2.2 | Sí |
| 8 | **Compilación** | `build` de Next.js sin errores | Sí |
| 9 | **Revisión de dependencias** | Alerta de vulnerabilidades conocidas (RS-43). Falla con gravedad alta o crítica; ver excepciones en 2.3 | Sí |
| 10 | **Pruebas de punta a punta** (Playwright) | Los recorridos principales en un navegador, sobre la vista previa conectada a la base de pruebas | Sí en la rama principal; en cada cambio, los recorridos esenciales |

### 2.2 La prueba de aislamiento por tabla nueva

Es la defensa contra el riesgo crítico #2. Funciona en dos partes:

1. **Control automático de cobertura (lo agrega DevOps, no depende de que alguien se acuerde):** un script consulta la base recién migrada y lista **todas las tablas que llevan la empresa**. Para cada una verifica que (a) tenga activadas las reglas de aislamiento por fila y forzadas, y (b) exista una prueba de aislamiento con su nombre. **Si una tabla nueva no cumple ambas cosas, la revisión falla**, aunque el programador no haya escrito nada mal.
2. **Prueba de aislamiento por tabla** (la escribe quien crea la tabla, QA la revisa): con dos empresas A y B y datos de B, un usuario de A (a) no los lista, (b) no los lee por identificador (responde "no encontrado", RN-011), (c) no los modifica, (d) no puede apuntar a ellos desde un registro propio (CA-001 a CA-003), y (e) una consulta escrita **sin filtro de empresa** a propósito devuelve vacío gracias a las reglas de la base de datos (capa 2 de D-025).

Una lista de tablas que **no** llevan empresa (por ejemplo, la lista de empresas misma o el registro del Administrador de plataforma) se mantiene a mano, con motivo, y la revisa Seguridad. Una tabla fuera de esa lista y sin empresa también hace fallar la revisión.

### 2.3 Qué bloquea publicar y quién puede saltárselo

- **Nada se puede publicar con una revisión en rojo.** La rama principal está protegida: no se escribe directamente, solo se entra por propuesta de cambio, con todas las revisiones en verde y la aprobación de una persona distinta de quien lo escribió.
- **Nadie puede apagar una revisión** para que pase. Si una revisión está mal escrita, se corrige la revisión en un cambio aparte.
- **Excepción única, limitada:** una vulnerabilidad de dependencia sin arreglo disponible puede aceptarse por escrito, con la firma de Seguridad, un motivo, quién la acepta y una fecha de vencimiento (máximo 30 días). Queda en `docs/operaciones/`.
- **Pruebas que fallan a veces ("intermitentes")** se tratan como defecto: no se ignoran ni se repiten hasta que pasen. Se arreglan o se retiran con un registro.
- **Tiempo:** el objetivo es que la revisión completa tarde menos de 10 minutos; si crece, se paraleliza.

### 2.4 Qué pasa después de aprobar

Al unirse a la rama principal: se vuelve a ejecutar todo, se publica **automáticamente en pruebas** (con migraciones aplicadas en pruebas), corren pruebas de humo en pruebas y queda listo para decidir si se publica en producción (sección 3). **La publicación en producción nunca es automática.**

---

## 3. Despliegue, reversa y migraciones

### 3.1 Cómo se publica

Plataforma de aplicación propuesta: **Vercel** (según `CLAUDE.md` y el stack); base de datos PostgreSQL gestionada (sección 8 para opciones).

Paso a paso, para cada versión:

1. **Etiqueta de versión** en el repositorio (por ejemplo `v0.4.0`) y notas breves en español claro de qué cambia.
2. **Revisión automática en verde** (sección 2) y publicación automática en **pruebas**.
3. **Pruebas de humo en pruebas** y revisión de QA para lo que toque datos, accesos o permisos (regla "Definición de terminado").
4. **Lista de verificación previa** (ver 3.3) rellenada, incluyendo el plan de reversa de **esa** versión.
5. **Aprobación de la Jefatura de Proyecto** (límite de mi rol: cualquier acción sobre producción o con costo requiere su aprobación). La primera publicación con datos reales requiere además la del CEO (RNF-018).
6. **Aviso de mantenimiento** si la publicación incluye una migración con pausa (RNF-012: sin compromiso 24 horas, pero sí aviso).
7. **Respaldo inmediatamente anterior** (sección 4) y verificación de que terminó bien.
8. **Migración** de base de datos (3.2), luego **publicación** de la aplicación.
9. **Pruebas de humo en producción**: entrar, ver la pantalla de inicio, una consulta, una prueba de aislamiento con las dos empresas de control, y comprobar que llega un correo de acceso.
10. **Cierre:** se anota en el registro de publicaciones (fecha, versión, quién, resultado). Si algo falla en los primeros 30 minutos, se decide reversa (3.4).

**Ventanas:** publicar en días y horas con gente disponible para reaccionar. **No se publica un viernes por la tarde ni la víspera de un feriado**, salvo corrección urgente aprobada por la Jefatura de Proyecto.

### 3.2 Migraciones controladas

Las migraciones (cambios en la forma de guardar datos) son la parte más delicada. Las escribe y revisa el Ingeniero de Datos; DevOps las ejecuta.

- **Nunca se ejecutan automáticamente en producción** al unir un cambio. Las ejecuta un paso aparte de la publicación, con el usuario dueño de las tablas, que **solo existe en el proceso de publicación** y no en la aplicación en funcionamiento.
- **Primero en pruebas, siempre**, con datos de volumen. Se prueba también el caso "migrar encima de datos ya existentes", no solo desde cero.
- **Regla "ampliar y luego limpiar":** una migración compatible con la versión anterior de la aplicación (agregar columnas o tablas, sin quitar nada). Lo que quita o renombra se hace en una publicación posterior, cuando ya nada lo usa. Así, volver a la versión anterior de la aplicación casi siempre es posible sin tocar los datos.
- **Migraciones destructivas** (quitar columna, cambiar el tipo de algo con datos, borrar) necesitan aprobación escrita del Ingeniero de Datos, de QA y de la Jefatura de Proyecto, y un respaldo comprobado justo antes. Recordar D-019: nada con historial se borra.
- **Migraciones largas** (tablas muy grandes) se prueban con 100.000 activos de volumen; si bloquearían la plataforma más de unos segundos, se diseñan por partes.
- **Los cambios que afectan las reglas de aislamiento o la auditoría** (D-018, D-025) tienen revisión adicional de Seguridad.

### 3.3 Lista de verificación y plan de reversa de cada versión

Cada versión lleva una ficha corta (plantilla en `docs/operaciones/` cuando se cree el proyecto). Resumen de lo que dice:

| Campo | Qué se escribe |
|---|---|
| Versión y fecha | |
| ¿Incluye migración? ¿De qué tipo? | Compatible (solo agrega) / Destructiva |
| Respaldo previo | Identificador y comprobación de que existe |
| **Cómo se vuelve atrás la aplicación** | Volver a publicar la versión anterior (en Vercel existe una función de "reversa instantánea" a un despliegue anterior; **verificar que esté en el plan elegido**) |
| **Cómo se vuelve atrás la base de datos** | Si la migración fue compatible: no hace falta. Si fue destructiva: restaurar desde el respaldo previo, **con pérdida de lo escrito después del respaldo**, y la Jefatura de Proyecto decide |
| Hasta cuándo se puede decidir la reversa | Mientras no haya escrituras de usuarios que se perderían; después, solo corrección hacia adelante |
| Quién decide | Jefatura de Proyecto; DevOps ejecuta |
| Cómo se comprueba que quedó bien | Las mismas pruebas de humo (3.1, paso 9) |
| Mensaje a los usuarios si hay interrupción | Texto corto preparado |

**La reversa se practica:** en pruebas, antes de la Etapa 1 se hace un ensayo de "publicar, fallar a propósito, volver atrás", y se repite antes de cada etapa con uso real.

### 3.4 Quién puede publicar

| Acción | Quién | Condición |
|---|---|---|
| Unir un cambio a la rama principal | Cualquier desarrollador | Revisión automática en verde y aprobación de otra persona |
| Publicar en pruebas | Automático | Tras unir a la rama principal |
| Publicar en producción | **Solo DevOps**, con el permiso de la Jefatura de Proyecto | Lista de verificación completa; aprobación de la Jefatura. Con datos reales por primera vez: también el CEO |
| Ejecutar una migración en producción | Solo DevOps, dentro de la publicación | Ver 3.2 |
| Entrar directo a la base de producción | Nadie de forma rutinaria (D-003) | Solo para emergencias: lo aprueba la Jefatura de Proyecto, dura poco, queda anotado en un registro de accesos de emergencia con motivo y qué se hizo, y se avisa a Seguridad |
| Cambiar claves y variables de producción | DevOps | Aprobación de la Jefatura de Proyecto y registro |

Las cuentas dueñas del alojamiento, la base de datos y el dominio deben estar **a nombre de la empresa** (no de una persona suelta) y con al menos dos personas con acceso, ambas con segunda verificación, para que la plataforma no dependa de una sola persona (ver 9).

---

## 4. Respaldos y copia externa de la auditoría

### 4.1 Qué se respalda y con qué frecuencia

Proponemos **dos capas**, porque confiar en una sola es el error más común.

| Capa | Qué es | Frecuencia | Dónde |
|---|---|---|---|
| **1. Respaldo del proveedor de la base de datos** | Copias automáticas del servicio gestionado; algunos planes permiten volver a un momento exacto de las últimas horas o días (se llama "recuperación a un punto en el tiempo") | Continuo o diario, según el plan | En el proveedor |
| **2. Respaldo propio, cifrado y en otro lugar** | Una copia completa de la base, hecha por un trabajo programado nuestro | **Diario**, más uno extra **justo antes de cada publicación con migración** | En almacenamiento de **otro proveedor y otra cuenta**, distinto del que aloja la base |

**Por qué las dos:** si el proveedor de la base de datos falla, se cierra la cuenta o alguien con acceso total hace un daño, el respaldo del mismo proveedor puede caer con él. La capa 2 es la que nos salva de eso.

- **Cifrado (D-029, RNF-014):** las copias se cifran **antes de salir** del servidor, con una clave que no está en el proveedor de la copia. **Esa clave se guarda aparte y con respaldo propio**: sin ella, la copia es inservible (ver 5.3).
- **Retención propuesta** (el D-024.4 dice "mismo plazo y mismas protecciones que los datos"; esto es una propuesta a confirmar con legal): copias diarias de los últimos **30 días**, y una por mes de los últimos **12 meses**. Mientras más tiempo se guardan copias, más tiempo viven datos personales que ya se anonimizaron en producción; por eso no propongo guardar copias por años. **[ESCALAR AL CEO]** junto con el tema legal L2.
- **Objetivos propuestos (a confirmar con el CEO):** pérdida máxima aceptable de datos (RPO): **hasta 24 horas** con la capa 2; **mucho menos** si el plan de base de datos incluye recuperación a un punto en el tiempo. Tiempo máximo para volver a funcionar (RTO): **4 horas en horario laboral**. Es coherente con RNF-012 (sin compromiso 24 horas).

### 4.2 Restauración probada

Un respaldo que nunca se restauró no es un respaldo. Calendario:

| Cuándo | Qué se prueba | Quién lo mira |
|---|---|---|
| Antes de la Etapa 1 | Restaurar una copia de pruebas en una base nueva, con cronómetro | Ingeniero de Datos |
| Antes de **cada etapa que pase a uso real** (RNF-014, CA-053) y **antes de producción con datos reales** | Restauración completa en una base aparte desde la copia de la capa 2 | Datos, Seguridad |
| Una vez al mes en producción | Misma prueba, aleatoriamente con una copia diaria | DevOps |

**Qué se comprueba en cada restauración:**
1. Cantidad de registros por tabla y por empresa coincide con la fuente (dentro de lo esperado).
2. **La prueba de aislamiento entre empresas pasa sobre la base restaurada** (RS-44: restaurar no mezcla empresas).
3. La auditoría restaurada coincide con la copia externa (4.4).
4. Si la copia es anterior a una anonimización, **se vuelve a aplicar** la anonimización (D-024.4). Para eso la plataforma debe guardar un **registro de anonimizaciones** (qué persona, cuándo) que sobreviva a la restauración, o recuperarse de la copia externa; **lo diseña el Ingeniero de Datos**. **Mientras legal no confirme los plazos no se activa ninguna anonimización automática** (D-024, I1), así que esta parte queda como procedimiento escrito, sin activar.
5. Tiempo que tomó, para compararlo con el RTO.

**Restaurar a una sola empresa:** el caso más probable no es "se perdió todo", sino "una empresa se equivocó y quiere volver a ayer". Restaurar toda la base **borraría** el trabajo de las demás empresas de ese día. El procedimiento correcto es **restaurar en una base aparte y rescatar solo los datos de esa empresa** con un script revisado. Ese script no existe todavía: lo necesito del Ingeniero de Datos antes de la primera empresa real (ver 9.2). Hasta entonces el plan de emergencia es avisar a todas las empresas y restaurar completo, solo con la aprobación del CEO.

### 4.3 Procedimientos escritos

En `docs/operaciones/` quedan, antes de producción (RNF-016): cómo se hace un respaldo manual, cómo se restaura completo, cómo se rescata una empresa, cómo se verifica una restauración, y quién avisa a quién. Cada uno con tiempos medidos en el ensayo, no estimados.

### 4.4 Copia externa del registro de auditoría (el riesgo del superusuario)

**El problema, en simple.** D-018 hace que la aplicación **no pueda** modificar ni borrar la auditoría. Pero en cualquier base de datos existe una cuenta con poder absoluto (el "superusuario", que el proveedor o nuestro administrador pueden usar). Esa cuenta puede alterar cualquier fila, incluida la auditoría, sin pasar por la aplicación. **No se puede eliminar ese poder; se puede lograr que cualquier alteración quede al descubierto.** Es el riesgo que queda, y se reduce así:

**Qué hacemos:**

1. **Copia continua, solo de agregar.** Cada hora (propuesta; se ajusta) un trabajo programado lee las entradas nuevas de la auditoría y las escribe en un archivo en **almacenamiento externo, de otro proveedor y otra cuenta**, configurado para que **no se pueda modificar ni borrar** durante el plazo de retención. Ese tipo de bloqueo se llama "inmutable" o "de una sola escritura" y varios proveedores de almacenamiento lo ofrecen; **verificar cuáles en la página del proveedor**.
2. **Encadenado.** Cada archivo incluye una huella calculada con el contenido de las entradas **y la huella del archivo anterior**. Si alguien cambia o borra una entrada vieja, todas las huellas posteriores dejan de coincidir. La clave para firmar vive en el trabajo programado, **no en la base de datos**.
3. **Verificación.** Un trabajo semanal (diario si se puede) recalcula las huellas con lo que hay hoy en la base y las compara con la copia externa. **Si no coinciden, alerta inmediata** a Seguridad y a la Jefatura de Proyecto. Queda registrada la verificación.
4. **Cuentas separadas** (ver 5.2): el trabajo que copia **solo puede leer** la auditoría y **solo puede agregar** al almacenamiento externo; nadie con acceso a la base de producción tiene también acceso de borrado a la copia externa. Ideal: quien administra la base y quien controla la copia externa son personas distintas (Seguridad o el Auditor de Cumplimiento tienen la lectura de la copia).

**Lo que esto no logra (límites honestos):**
- No **impide** que un superusuario altere la base: lo hace **detectable**. Lo que se escriba y altere en la hora entre dos copias, antes de copiarse, no queda protegido; por eso la frecuencia importa y se puede bajar a minutos si se justifica.
- Reduce el riesgo con medidas humanas: pocas personas con acceso total, segunda verificación, y el proveedor de la base de datos guarda su propio registro de quién usó cuentas de alto poder (**verificar que el plan lo incluya**).
- Alertar sobre fallas de la copia es parte del monitoreo (sección 7): una copia que dejó de correr sin que nadie lo note es peor que no tenerla.

**Puntos que necesito de Datos, Seguridad y Cumplimiento:**
- **Datos personales en la copia externa.** La auditoría guarda correos e IP. Una copia inmutable por 5 años choca con la anonimización a los 2 años (D-024). **Propuesta: que las entradas de auditoría guarden el identificador interno de la persona y no su nombre ni correo**, de modo que anonimizar a la persona no obligue a reescribir una copia que no se puede reescribir. Si la auditoría necesita guardar el correo (por ejemplo, intentos de acceso fallidos de alguien que no existe), se decide caso a caso con Cumplimiento. **Si no se resuelve, el bloqueo de la copia externa se configura en modo que permita borrar bajo una orden legal** (tiene un modo más flexible y otro estricto). Lo decide Cumplimiento con legal.
- El plazo de retención de la copia externa es el mismo que el de la auditoría (5 años, D-024, pendiente de legal).
- **Costo:** el almacenamiento externo es un gasto recurrente. Lo incluyo en la sección 8.

---

## 5. Secretos y variables de entorno

### 5.1 Reglas

1. **Ningún secreto en el repositorio**, ni en el código, ni en archivos de ejemplo, ni en mensajes de cambios, ni en documentación (regla 4 de `CLAUDE.md`). La revisión automática lo vigila (sección 2).
2. El repositorio solo contiene `.env.example`: **los nombres** de las variables, con valores falsos obvios (`cambiar-esto`) y un comentario de para qué sirve y de dónde sale. El archivo `.env` real está en `.gitignore`.
3. Los secretos reales viven en el almacén del proveedor de alojamiento (separados por entorno: desarrollo, pruebas, producción) y en el almacén de secretos de GitHub para la revisión automática. Una copia de **las claves maestras** (5.3) se guarda además en un gestor de contraseñas del equipo con acceso compartido controlado.
4. **Cada entorno tiene sus propias claves.** Una clave de pruebas no sirve en producción y viceversa.
5. **Los secretos nunca aparecen en registros técnicos, mensajes de error ni auditoría** (RF-DAT-008, D-018.5). Los enlaces de acceso por correo tampoco.
6. **Rotación:** al irse una persona del equipo, ante cualquier sospecha, y al menos una vez al año. Rotar una clave de base de datos o de correo debe poder hacerse **sin interrumpir el servicio** (se acepta la nueva antes de retirar la vieja).
7. Si un secreto se publica por error: se considera comprometido, se rota de inmediato y se anota en el registro de incidentes; no basta con borrarlo del repositorio.

### 5.2 Variables previstas (nombres propuestos; el Arquitecto confirma)

| Variable | Para qué | Dónde se usa | Quién la conoce |
|---|---|---|---|
| `DATABASE_URL` | Conexión de la **aplicación** a la base (usuario sin privilegios especiales, por el agrupador de conexiones) | Aplicación | Solo el entorno |
| `MIGRATION_DATABASE_URL` | Conexión del **dueño de las tablas**, solo para migraciones | Solo el paso de publicación | DevOps |
| `AUDIT_READER_DATABASE_URL` | Usuario de **solo lectura** sobre la auditoría, para la copia externa y la verificación | Trabajo programado de copia | DevOps, Seguridad |
| `AUDIT_COPY_*` (credenciales de escritura al almacenamiento externo) | **Solo agregar** al almacenamiento de la copia externa | Trabajo programado de copia | DevOps |
| `AUDIT_COPY_READ_*` (lectura del almacenamiento externo) | Verificar la copia | Seguridad / Auditor de Cumplimiento | **No** DevOps, idealmente |
| `AUTH_SECRET` y la dirección pública de la aplicación | Firmar sesiones y enlaces de acceso (Auth.js) | Aplicación | Solo el entorno |
| `EMAIL_API_KEY` y `EMAIL_FROM` | Enviar correos | Aplicación | DevOps |
| `FIELD_ENCRYPTION_KEY` (con versión) | Cifrar las **claves de licencia** (D-011, RS-38) | Aplicación | Ver 5.3 |
| `BACKUP_ENCRYPTION_KEY` | Cifrar los respaldos propios | Trabajo de respaldo | Ver 5.3 |
| `BACKUP_STORAGE_*` | Escribir los respaldos en el almacenamiento externo | Trabajo de respaldo | DevOps |
| `ERROR_MONITORING_DSN` | Enviar errores al servicio de vigilancia | Aplicación | Solo el entorno |
| `CRON_SECRET` | Que solo el programador legítimo pueda activar los trabajos programados | Trabajos programados | Solo el entorno |

**"Cuenta separada para la auditoría" significa tres cosas distintas:**
1. **Un usuario de base de datos para la aplicación que, sobre la tabla de auditoría, solo puede agregar** (ni modificar ni borrar) (D-018.1).
2. **Otro usuario, de solo lectura**, para la copia externa y la verificación.
3. **Una cuenta en el almacenamiento externo, distinta de la del alojamiento**, con credenciales de solo agregar para el trabajo de copia y de solo lectura para quien verifica.

**Para Datos y Arquitecto:** D-018.2 pide que la auditoría se escriba **en la misma operación** que el cambio. Ese requisito se cumple con el usuario de la aplicación en la misma transacción, con permiso de solo agregar sobre esa tabla; **confirmen que no hace falta un segundo usuario de escritura** (si lo hiciera, las dos escrituras no estarían en la misma transacción).

### 5.3 Las dos claves que, si se pierden, no tienen arreglo

- **`FIELD_ENCRYPTION_KEY`** protege las claves de licencia (D-011). Si se pierde, **los respaldos de la base no sirven para recuperar las licencias**: están cifradas con una clave que no está en la base. Si se filtra junto con la base, las licencias quedan expuestas. Debe estar **respaldada por separado, en dos lugares, con acceso a pocas personas**, y el cifrado debe permitir **cambiar la clave** (varias versiones activas a la vez).
- **`BACKUP_ENCRYPTION_KEY`**: sin ella, los respaldos de la capa 2 son inservibles. Se verifica en cada restauración de ensayo (4.2) que la clave guardada aparte realmente abre la copia.

Quién guarda estas dos claves es una decisión de la Jefatura de Proyecto con el CEO (ver pedido B).

---

## 6. Correo transaccional

### 6.1 Por qué importa tanto

El acceso es por un enlace que llega al correo (D-002). Si el correo no llega, **nadie entra**, ni siquiera el Administrador. Además el enlace dura **15 minutos** (S-01), así que un correo que tarda 20 minutos es lo mismo que uno que no llega. Es el riesgo #9.

### 6.2 Criterios para elegir proveedor

Se puntúa cada opción contra estos criterios **antes de contratar nada**:

| # | Criterio | Qué buscamos | Cómo se comprueba |
|---|---|---|---|
| 1 | **Entrega a Gmail y Outlook** | Los correos llegan a la bandeja de entrada, no a spam, en Gmail personal, Gmail corporativo (Workspace), Outlook/Hotmail y Microsoft 365 | Prueba real de 20 envíos a cada tipo de buzón, contando bandeja vs. spam, antes de decidir (6.3) |
| 2 | **Velocidad de entrega** | Casi siempre menos de 1 minuto, nunca cerca de los 15 del enlace | Medir la hora de envío contra la de llegada |
| 3 | **Dominio verificado** | Permite verificar nuestro dominio con SPF, DKIM y DMARC, y enviar desde una dirección nuestra (por ejemplo `acceso@avisos.miempresa.com`) | Documentación del proveedor y prueba real; los encabezados del mensaje deben mostrar los tres sellos en "pass" |
| 4 | **Límites de envío** | El tope diario y por segundo del plan cubre el uso previsto con margen. Los límites del documento funcional son: 5 enlaces por correo por hora, 10 por día, 20 invitaciones por administrador por hora, 100 por empresa por día (RN-NOT-008 a RN-NOT-010). Con pocas empresas, el volumen es muy bajo; el límite que nos importa es el **tope del plan gratuito, si lo hay** | Comparar tope del plan con el volumen estimado (P-003 aún pendiente) |
| 5 | **Aviso de rebotes y quejas** | Entrega por llamada automática (webhook) los rebotes y marcas de spam, para el requisito de "3 rebotes = no entregable" (RF-NOT-022) | Documentación |
| 6 | **Sin seguimiento de enlaces** | Debe poder **desactivarse** el "seguimiento de clics": reescribe los enlaces y puede invalidar o filtrar un enlace de un solo uso | Configuración |
| 7 | **Sin guardar el contenido** | El proveedor no debe conservar el cuerpo de los correos por mucho tiempo, o debe poder desactivarse: el cuerpo contiene el enlace de acceso (D-018.5, RN-NOT-016) | Documentación y configuración |
| 8 | **Aviso de fallas del propio proveedor** | Página pública de estado y manera de suscribirse a avisos | Revisar historial reciente |
| 9 | **Región y contrato** | Dónde se procesan los datos y qué contrato ofrece (relación con L4 y L6 del escalado legal) | Lectura del contrato; lo valida legal |
| 10 | **Costo** | Acorde al volumen; sin sorpresas | Página de precios, a verificar |
| 11 | **Dos proveedores posibles** | Que sea sencillo tener un segundo proveedor configurado de reserva | Diseño: la aplicación envía correos a través de **una sola capa** (interfaz), con un adaptador por proveedor. Se lo pido al Arquitecto |

### 6.3 Pruebas antes de decidir

Antes de que el Backend programe el acceso real (Etapa 1):

1. Contratar (o abrir la cuenta gratuita de) **dos candidatos** y verificar el dominio de prueba con SPF, DKIM y DMARC.
2. **Matriz de entrega:** 20 envíos a cada tipo de buzón (Gmail personal, Gmail Workspace, Outlook/Hotmail, Microsoft 365, uno con filtros estrictos). Anotar bandeja/spam y tiempo. Repetir a otra hora del día.
3. Revisar los encabezados: SPF, DKIM y DMARC en "pass" y alineados con el dominio.
4. Verificar la configuración de no seguir clics ni guardar el cuerpo.
5. Decidir y documentar en `docs/operaciones/`.

**DMARC se introduce por pasos:** primero en modo solo de observación (recibimos informes), después de 2 a 4 semanas sin problemas, se endurece (cuarentena y luego rechazo). Enviar desde un **subdominio** (`avisos.` o `acceso.`) para que un problema de reputación no afecte el correo normal de la empresa.

### 6.4 Plan de contingencia si el correo falla

| Qué pasa | Qué hacemos | Quién |
|---|---|---|
| Hay avisos **antes** de que se note (tasa de correos de acceso rebotados o demorados sube) | Alerta automática (sección 7) a DevOps y a la Jefatura de Proyecto | DevOps |
| El proveedor tiene una caída | **Cambio al segundo proveedor** (ya configurado, con el dominio ya verificado, probado cada trimestre). Se cambia con una variable de entorno y una publicación de emergencia, no con cambios de código | DevOps, aprobación de la Jefatura |
| Los correos van a spam en un proveedor (pasa por reputación) | Revisar informes de DMARC, pedir soporte al proveedor, cambiar de proveedor si no se resuelve | DevOps |
| **Los administradores no pueden entrar** y es urgente | Procedimiento de emergencia: el **Administrador de plataforma** (D-003) emite desde su consola un acceso excepcional de un solo uso a un administrador de empresa, **tras verificar su identidad por otro medio** (llamada a un teléfono ya conocido, por ejemplo), con segunda verificación todavía exigida y todo en la auditoría. Es una función que **debe existir en la plataforma** (D-002.7 la insinúa) | Administrador de plataforma, Seguridad aprueba el diseño |
| Un usuario no recibe su enlace | La pantalla le dice con claridad que puede pedir otro, y que si no llega consulte con su administrador; **el mensaje nunca revela si el correo existe** (D-002.6) | Frontend |
| Se acaba el cupo diario o mensual del plan | Alerta al 80 % del cupo; subir de plan es un gasto que va al CEO | DevOps |
| El dominio del correo vence o se pierde el acceso al DNS | Dos personas con acceso al DNS; alerta 60 y 30 días antes del vencimiento del dominio | CEO / DevOps |

**No se agregan contraseñas como respaldo del correo** (D-002 las descartó). Si el CEO o el Gerente de TI quisieran reabrir esa decisión, es una decisión de la mesa, no mía.

**Pregunta para Seguridad:** ¿acepta el acceso excepcional de emergencia descrito arriba? Es el único camino que no depende del correo y es, por lo tanto, un punto sensible.

---

## 7. Monitoreo mínimo

Alcance acorde a RNF-012 (sin compromiso de 24 horas): lo suficiente para **enterarnos antes que los usuarios** y no más.

| Qué se vigila | Cómo | Quién se entera | Cuándo se activa |
|---|---|---|---|
| **Errores en producción** | Servicio de reporte de errores conectado a la aplicación, con un filtro que **elimina datos personales y secretos antes de enviar** (RF-DAT-008, RNF-009) | DevOps y Jefatura de Proyecto | Pruebas desde la Etapa 1; producción antes de uso real |
| **Disponibilidad** | Un servicio externo visita cada 1 a 5 minutos una dirección `/salud` que confirma que la aplicación y la base responden. Esa dirección **no revela detalles internos** | DevOps | Pruebas y producción |
| **Correo de acceso** | Porcentaje de correos de acceso entregados y tiempos; rebotes | DevOps | Desde que haya correo real |
| **Respaldos** | Cada trabajo avisa "terminé bien" al final. **Si pasa el tiempo y no avisa, hay alerta** (se llama "latido": detecta lo que no pasó) | DevOps | Antes de uso real |
| **Copia externa de auditoría** | Mismo latido, más el retraso entre lo último de la base y lo último copiado; y el resultado de la verificación semanal (4.4) | DevOps, Seguridad | Antes de uso real |
| **Base de datos** | Conexiones usadas contra el tope, espacio usado, consultas lentas | DevOps | Antes de uso real |
| **Vencimientos** | Dominio, certificados, claves de proveedores | DevOps | Antes de uso real |
| **Dependencias** | Alertas de vulnerabilidades conocidas (revisión semanal y en cada cambio, RS-43) | Seguridad | Desde la Etapa 1 |
| **Rendimiento** | Prueba contra RNF-011 (100.000 activos, 95 % bajo 2 segundos, recepción de 100 series bajo 5 segundos) antes de uso real | QA, DevOps | Etapa 7 |

**Quién recibe las alertas:** las alertas deben llegar a **una persona real con nombre**, por correo y, si se justifica, por mensaje al celular. Los roles del equipo de TI en esta sesión no están "de guardia" fuera de la sesión. **Antes de producción hay que nombrar una persona responsable de recibir alertas y qué hace** (ver pedido en 9.3).

**Aviso de mantenimiento:** una página sencilla y una frase estándar para avisar a los usuarios (RNF-012). No se contrata una página de estado de pago en la v1.

---

## 8. Costos

### 8.1 Cómo leer esta sección

- **No verifiqué ningún precio.** Los precios cambian y desde aquí no puedo consultarlos. Donde dice "**precio a verificar en la página del proveedor**" nadie debería citar una cifra mía.
- Los nombres de proveedores son **ejemplos de opciones del mercado** para comparar, no una contratación ni una recomendación cerrada. No hay ninguna cuenta creada.
- Las condiciones de los planes gratuitos (límites de uso, pausas por inactividad, si se permite uso comercial, cuánto tiempo guardan copias) **cambian y deben leerse antes de apoyarse en ellos**. Un plan gratuito puede ser aceptable para desarrollo, **no** para producción con datos reales, por falta de respaldos y de garantías.
- **[ESCALAR AL CEO]** marca todo gasto recurrente: el CEO decide, no el equipo.
- Todos los precios, cuando se verifiquen, se anotarán con fecha y enlace en este archivo.

### 8.2 Tabla de rubros, opciones y criterio de elección

| Rubro | Opciones a comparar | Criterio de elección | Precio | Marca |
|---|---|---|---|---|
| **1. Alojamiento de la aplicación** | (a) **Vercel**, plan gratuito para desarrollo y de pago para producción; (b) plataformas parecidas (Netlify, Cloudflare); (c) servicio de contenedores (Railway, Render, Fly.io) o un servidor propio | El stack ya está pensado para Vercel (`CLAUDE.md`). Se elige por: **permite uso comercial en el plan que se contrate** (los planes gratuitos suelen estar pensados para proyectos personales: **verificar los términos**), tiempo máximo que puede durar una operación (importar 5.000 filas, exportar listas grandes), reversa instantánea a versión anterior, y número de personas con acceso (algunos cobran por persona) | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** |
| **2. Base de datos gestionada (PostgreSQL)** | (a) **Neon** (ramas de base de datos útiles para pruebas); (b) **Supabase**; (c) servicio de una nube grande (AWS RDS, Google Cloud SQL, Azure) | Imprescindible: **PostgreSQL real con reglas por fila**, usuarios sin privilegios de superusuario, **agrupador de conexiones compatible** con el aislamiento de D-025, **recuperación a un punto en el tiempo** y cuánto tiempo guardan copias, número de conexiones simultáneas (QA necesita unas 20), región y contrato (L4, L6), que se pueda tener **una base de pruebas separada** barata, y que registre quién usó las cuentas de alto poder. Una nube grande da más control a más costo y trabajo de operación | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** |
| **3. Correo transaccional** | (a) **Postmark**; (b) **Resend**; (c) **Amazon SES** (más barato por volumen, más trabajo de configuración); (d) otros (Brevo, Mailgun) | Los 11 criterios de 6.2, sobre todo entrega a Gmail y Outlook, rapidez, no guardar contenido y no seguir enlaces. Con volumen tan bajo el precio pesa poco frente a la entrega | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** |
| **4. Respaldos y copia externa de auditoría** | (a) Almacenamiento de objetos **de otro proveedor** (Backblaze B2, Cloudflare R2, AWS S3); (b) solo los respaldos incluidos en el plan de la base de datos (no basta por sí solo: ver 4.1) | **Tiene que ser otro proveedor y otra cuenta que la base de datos**, cifrado, **bloqueo de una sola escritura** disponible (para la copia de auditoría), costo por almacenamiento bajo (los respaldos son pequeños al inicio), y sin cobro por bajar datos que haga costosa una restauración | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** |
| **5. Monitoreo** | (a) **Sentry** (errores), plan gratuito al principio; (b) **UptimeRobot** o **Better Stack** (disponibilidad y latidos); (c) lo incluido en la plataforma de alojamiento | Que el reporte de errores permita **filtrar datos personales** antes de enviar, que los "latidos" estén incluidos (si no, no sirve para respaldos), cantidad de visitas por minuto del plan gratuito, y alertas por correo y celular | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** (aunque empiece gratis) |
| **6. Dominio** | (a) Subdominio de un dominio que la empresa **ya tenga** (sin costo adicional); (b) comprar uno nuevo en un registrador (Cloudflare, Namecheap, Google u otros) | Preferir (a). Quien lo administra debe poder agregar los registros de SPF, DKIM y DMARC; la cuenta a nombre de la empresa; renovación automática y aviso de vencimiento. Si se compra uno, que el DNS permita registros de correo y tenga segunda verificación | Precio a verificar en la página del proveedor (el dominio nuevo es un gasto **anual**) | **[ESCALAR AL CEO]** si se compra uno |
| **Otros posibles** | Gestor de contraseñas del equipo para las claves maestras (5.1); GitHub (repositorio privado y minutos de la revisión automática: los planes gratuitos tienen límites a verificar); registro de ayuda/incidentes | Verificar si el plan de GitHub que ya se tiene cubre la revisión automática en el volumen esperado | Precio a verificar | **[ESCALAR AL CEO]** si agrega gasto |

### 8.3 Recomendación de arranque de costo mínimo

Propongo **dos fases**, para no pagar por adelantado lo que aún no se usa:

**Fase A: Etapas 0 a 3 (sin datos reales).** Objetivo: gastar lo menos posible sin perder lo que el plan necesita.
- Alojamiento de la aplicación y vigilancia: **planes gratuitos**, sabiendo que no son para producción real y revisando antes sus condiciones.
- Base de datos: **plan gratuito o más barato** de un proveedor de PostgreSQL gestionada (uno solo, con una base de pruebas), suficiente para el prototipo de D-025 y para QA de concurrencia. **Si el plan gratuito no admite las ~20 conexiones simultáneas que QA necesita, esa es la primera cosa que valdría la pena pagar** (la verifico).
- Correo: plan gratuito o de entrada del proveedor elegido en las pruebas de 6.3 (o la bandeja local de captura mientras no se necesite correo real).
- Respaldos propios y copia externa: almacenamiento externo mínimo; con datos inventados se puede ensayar todo el procedimiento por muy poco.
- Dominio: **subdominio del que ya exista**; solo se compra uno si no hay ninguno.
- *Orden de magnitud, estimación sin verificar:* en esta fase el gasto mensual debería ser cero o de pocos dólares; la compra de un dominio nuevo, si hace falta, es un gasto anual aparte.

**Fase B: Antes de cualquier etapa que se use con datos reales (Etapa 7 a más tardar).** Aquí no se escatima en lo que protege los datos:
- **Base de datos de pago** con respaldos y, si es posible, recuperación a un punto en el tiempo.
- **Alojamiento de pago** si el plan gratuito no permite uso comercial.
- **Correo de pago** con dominio verificado, y un segundo proveedor configurado (puede ser un plan gratuito si el volumen cabe).
- **Almacenamiento externo con bloqueo** para respaldos y auditoría.
- Vigilancia: se mantiene el plan gratuito si cubre errores, disponibilidad y latidos; si no, el plan más barato que lo haga.
- *Orden de magnitud, estimación sin verificar y sujeta a cambiar:* del orden de **algunas decenas de dólares al mes en total** para una o pocas empresas; mi estimación de trabajo es **entre 50 y 150 USD al mes**, sobre todo por base de datos y alojamiento. **No usar esta cifra para decidir:** se reemplaza por los precios verificados antes de pedir la aprobación de la Fase B.

**Lo que no se paga ahora ni se recomienda pagar:** página de estado de pago, guardia 24 horas, ambiente de demostración separado (las demos se hacen en pruebas), servidores propios, almacenamiento de archivos adjuntos (D-022; se decide al cierre de la Etapa 4).

### 8.4 Qué decide cada elección y qué no se puede deshacer fácil

- **Región de los servidores y contrato** (L4, L6): depende de P-004 (país) y del abogado. Cambiar de región después implica migrar la base; lo evitamos decidiendo una sola vez, con información.
- **Proveedor de base de datos:** cambiarlo después es posible (PostgreSQL es estándar) pero cuesta trabajo; por eso se elige antes del prototipo de D-025.
- **Proveedor de correo:** más fácil de cambiar si existe la capa de envío del punto 11 de 6.2.

---

## 9. Riesgos operativos y lo que necesito de otros roles

### 9.1 Riesgos operativos

| # | Riesgo | Prob. | Impacto | Qué hacemos |
|---|---|---|---|---|
| O-1 | **Falla de correo = nadie entra** (riesgo #9) | Media | Alto | Criterios y pruebas de 6, segundo proveedor, acceso de emergencia del Administrador de plataforma, alertas |
| O-2 | **El aislamiento por empresa falla en la base real o con el agrupador de conexiones** (riesgos #2, #18) | Media | Crítico | Prototipo de D-025 en el proveedor candidato, base de pruebas real, control automático de cobertura por tabla (2.2) |
| O-3 | **Alteración de la auditoría por alguien con poder total sobre la base** | Baja | Crítico | Copia externa inmutable y encadenada con verificación (4.4); pocas personas con acceso total |
| O-4 | **Los respaldos existen pero no se pueden restaurar** | Media | Crítico | Dos capas, restauración de ensayo con calendario, alerta por latido |
| O-5 | **Se pierde la clave de cifrado** de licencias o de respaldos | Baja | Alto | Respaldo de claves por separado, cifrado con versiones, comprobación en cada restauración (5.3) |
| O-6 | **Una persona concentra todos los accesos** (cuentas a su nombre, se va o enferma) (riesgo #14) | Media | Alto | Cuentas a nombre de la empresa, al menos dos personas con acceso y segunda verificación, claves maestras en gestor compartido |
| O-7 | **Datos reales en pruebas o en el repositorio** (riesgo #17) | Media | Alto | Generador de datos, búsqueda de patrones, prohibición de copiar producción, revisión humana |
| O-8 | **Una migración destructiva o larga sale mal** | Media | Alto | "Ampliar y luego limpiar", ensayo con volumen, respaldo previo, aprobación triple (3.2) |
| O-9 | **Límites de tiempo del alojamiento** (importar 5.000 filas, exportar listas grandes, recepción de 100 series) | Media | Medio | Medir en la Etapa 4; el Arquitecto diseña por partes si hace falta (9.2) |
| O-10 | **Gasto que crece sin que nadie lo vea** (riesgo #14) | Media | Medio | Alertas de gasto en cada proveedor, revisión mensual, todo recurrente aprobado por el CEO |
| O-11 | **Plan gratuito con condiciones que no cubren uso comercial o cambia de reglas** | Media | Medio | Leer términos antes; Fase B de pago antes de uso real |
| O-12 | **Alertas que nadie recibe** (el equipo no está de guardia) | Alta | Medio | Nombrar una persona responsable antes de producción |
| O-13 | **La restauración revive datos ya anonimizados** (D-024.4) | Baja | Alto | Registro de anonimizaciones y procedimiento de reaplicación; no activar anonimización automática sin confirmación legal |
| O-14 | **Dependencia con vulnerabilidad sin arreglo** | Media | Medio | Excepción firmada con vencimiento (2.3) |
| O-15 | **Derechos de acceso que nadie retira** (alguien se va y conserva acceso al alojamiento o a la base) | Media | Alto | Lista de accesos revisada cada trimestre; rotación de claves cuando se va alguien |

Propongo al Gerente de TI **agregar O-1 a O-6, O-9 y O-12 a `docs/equipo/riesgos.md`** o ligarlos a los existentes (#9, #14, #16, #17, #18). No lo hago yo: ese archivo es del Gerente de TI y mi alcance es `docs/operaciones/`.

### 9.2 Lo que necesito de otros roles

**Arquitecto de Software**
1. Confirmar que **la aplicación enviará correos a través de una sola capa** con adaptador intercambiable (6.2, criterio 11).
2. Confirmar la lista de **variables de entorno** y los **usuarios de base de datos** (5.2), y que la empresa de la sesión se fija de una forma que **sobrevive al agrupador de conexiones** de Vercel (D-025).
3. Diseñar las operaciones largas (importación, exportación, recepciones grandes) para que **quepan en los límites de tiempo del alojamiento** o se hagan por partes.
4. Función de **acceso excepcional de emergencia** del Administrador de plataforma (6.4), junto con Seguridad.
5. Una dirección `/salud` sin información interna.
6. **Decidir con DevOps el proveedor de base de datos candidato antes del prototipo de D-025** (1-2 días), porque el prototipo debe correr ahí.

**Ingeniero de Datos**
1. Escribir las migraciones con la regla "ampliar y luego limpiar" y un **guion de rescate de una sola empresa** desde un respaldo (4.2).
2. Los tres usuarios de base de datos con sus permisos (dueño, aplicación, lector de auditoría) y las reglas por fila **forzadas** (también sobre el dueño de las tablas) (1.2, 5.2).
3. Que la auditoría guarde el **identificador** de la persona y no su nombre ni correo, o decidir con Cumplimiento (4.4).
4. El **registro de anonimizaciones** que sobrevive a una restauración (4.2, D-024.4).
5. Un **generador de datos inventados**, incluido uno de volumen (100.000 activos) para RNF-011.
6. Confirmar que el control automático de "toda tabla con empresa tiene reglas y prueba" (2.2) es viable con su esquema.

**Especialista en Seguridad**
1. Revisar y aprobar: separación de cuentas de la auditoría (5.2), copia externa inmutable (4.4), acceso excepcional de emergencia (6.4), registro de accesos de emergencia a producción (3.4).
2. Elegir con DevOps el **lugar controlado** para documentos reales no anonimizados, si el CEO los entrega así (D-028).
3. Definir el **detalle técnico del cifrado** de claves de licencia (D-011) y de los respaldos, y la política de rotación.
4. Aprobar la herramienta de búsqueda de secretos y la revisión de dependencias, y el umbral de gravedad que bloquea (2.1, #9).
5. Revisar la lista de personas con acceso total a producción.

**Auditor de Cumplimiento**
1. Retención de los respaldos y de la copia externa frente a la anonimización (4.1, 4.4); confirmar con legal el modo de bloqueo.
2. Quién guarda las claves maestras y quién verifica la copia externa de auditoría (separación de funciones).

**QA**
1. Qué pruebas de concurrencia (20 usuarios simultáneos) y de aislamiento por tabla corren en la revisión automática y cuáles solo en la base de pruebas permanente.
2. Revisar el control de cobertura de tablas y la ficha de versión (3.3).

### 9.3 Lo que necesito de la Jefatura de Proyecto y del CEO

1. Los cinco pedidos A a E de la sección 0.
2. **Nombrar a una persona** que reciba las alertas y esté disponible en horario laboral una vez que haya uso real, y a una segunda persona para cuando la primera no esté.
3. Confirmar quién tendrá cuentas dueñas del alojamiento, base de datos, dominio, almacenamiento y correo.
4. Resolver el acceso de escritura a GitHub (riesgo #5): sin él, la revisión automática y las ramas protegidas no se pueden configurar. Hoy el trabajo solo existe localmente.
5. Convocar una mesa de revisión para este plan antes de la Etapa 1 (afecta a Arquitecto, Datos, Seguridad, QA y Cumplimiento).

---

## 10. Lo que este plan no hace y lo que queda abierto

- **No hay código, cuentas ni configuración creadas.** Es un plan. Nada se contrató.
- **No verifiqué precios, límites de planes gratuitos ni funciones de proveedores** (si una "reversa instantánea", un bloqueo de una sola escritura o una recuperación a un punto en el tiempo están en un plan concreto). Se verifican en la página de cada proveedor antes de decidir.
- **Pendientes de legal** que afectan operaciones: país y ley (L1), plazos (L2), región de servidores (L4), contratos con proveedores (L6). Hasta tenerlos no se elige región definitiva ni se activa anonimización automática.
- **Pendiente del CEO:** cifra de uso (P-003) para dimensionar base de datos y límites de correo; país (P-004).
- **Siguiente paso mío**, si el plan se aprueba: preparar la plantilla de ficha de versión, el `.env.example`, el flujo de revisión automática y el borrador del manual de respaldo y restauración; todo se crea cuando exista el repositorio del proyecto y la Jefatura apruebe.

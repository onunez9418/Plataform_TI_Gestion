# Plan de operación: entornos, publicación, respaldos, correo y costos

**Autor:** Ingeniero DevOps · **Versión:** 3 (actualizada el 2026-10-26) · **Estado:** propuesta para revisión (Etapa 0, todavía no hay código)
**Alineado con:** `docs/equipo/decisiones.md` hasta D-076, `docs/documento-funcional.md` v0.3 (RNF-010 a RNF-022, RS-40 a RS-51), `docs/revision-cruzada/ronda3-qa-tester.md` (sección 6), `docs/revision-cruzada/ronda4-especialista-seguridad.md` (aprobación de la estrategia de llaves con 8 condiciones) y `docs/equipo/plan-aplicacion.md` (fila de DevOps).
**Para quién:** el CEO lo lee completo; los recuadros "Detalle para el equipo" son para Arquitecto, Datos, Seguridad y QA, y el CEO puede saltarlos.
**Qué cambió respecto a la versión 2:** el plan pasa de describir a **dar procedimientos que se pueden ejecutar y medir** (secciones 1.9 a 1.12, 3.7 a 3.9, 5.2 y 5.3, 6.5 a 6.7, 7.5, 9.5), se crea la **revisión automática de documentos** en `.github/` y se agregan los pasos para activar las ramas protegidas. Historial completo en la sección 15.

---

## 0. Resumen en un minuto

1. Habrá **cuatro "lugares" donde corre la plataforma**: el computador de quien programa (desarrollo), un entorno desechable que nace y desaparece con la revisión automática de cada cambio, un lugar de pruebas permanente en internet con datos inventados (pruebas) y el lugar real (producción). Cada uno tiene su propia base de datos y sus propias claves. **Nunca se mezclan y nunca hay datos reales fuera de producción.**
2. **La plataforma no es solo una página web.** Detrás hay un **segundo programa que trabaja siempre en segundo plano** (el "proceso trabajador"): envía los correos con reintentos, hace las importaciones y exportaciones grandes y reparte los avisos diarios. Por eso el alojamiento debe ser de ejecución continua y **ya no se da por hecho el alojamiento "sin servidor" (Vercel)** (D-038, D-055 T-1). Es una pieza más de la operación, con costo.
3. **Cada cambio pasa por una revisión automática.** Si algo falla, no se puede publicar. No hay atajos.
4. **Publicar una versión es un proceso corto, escrito y reversible.** Antes se hace una copia de seguridad; si algo sale mal, se vuelve a la versión anterior.
5. **Copias de seguridad diarias y cifradas** (30 diarias y 12 mensuales), guardadas en otro proveedor, y una **restauración practicada** que además reaplica las anonimizaciones y vuelve a cerrar los accesos que ya estaban revocados.
6. **El registro de auditoría tiene una copia externa** que el proveedor de la base de datos no puede alterar sin que nos demos cuenta. El **registro de anonimizaciones** vive aparte, fuera de lo que se restaura.
7. **El correo es una pieza crítica**: se entra con un enlace que llega al correo; si falla, nadie entra. Se elige proveedor con criterios medibles, se prueba con Gmail y Outlook antes de programar el acceso, y hay un plan para cuando falle.
8. **Costos:** no puedo verificar precios desde aquí, así que **no pongo cifras confirmadas**. Entrego, por cada gasto, las opciones, el criterio de elección, la **página oficial exacta donde consultar el precio** (9.5) y una recomendación de arranque de costo mínimo. Todo gasto mensual está marcado **[ESCALAR AL CEO]**.
9. **Los documentos ya tienen su revisión automática** (`.github/workflows/documentos.yml`, sección 3.7): un cambio falla si cita un requisito sin código de módulo, un permiso que no está en el registro, un documento que no existe o algo que parece una clave. Para que **sea obligatoria** falta un clic de quien administre el repositorio: pasos exactos en 3.8.

### Lo que le pedimos al CEO (resumen; el detalle está en la sección 9)

| # | Pedido | Cuándo hace falta | Recomendación |
|---|---|---|---|
| A | Aprobar el **arranque de costo mínimo** para desarrollo y pruebas (planes gratuitos o los más baratos, sin datos reales) | Antes del prototipo técnico y de la Etapa 1 | Aprobar |
| B | Decidir **a nombre de quién** quedan las cuentas (alojamiento, base de datos, correo, dominio, copias) y nombrar **una persona con suplente** que reciba las alertas (D-064 condición 9) | Antes de la Etapa 1 | Cuentas a nombre de la empresa, con al menos dos personas con acceso y segunda verificación |
| C | Informar si **ya existe un dominio de internet** de la empresa y quién lo administra | Antes de la Etapa 1 | Usar un subdominio del que ya existe |
| D | Aprobar el **gasto mensual de producción** (base de datos de pago, alojamiento de ejecución continua, correo, copias externas, vigilancia) | Antes de cualquier etapa que se use con datos reales | Aprobar cuando se acerque la fecha, con precios ya verificados |
| E | Informar el **país** de las empresas (P-004) | Antes de elegir la región de los servidores | También lo necesita el abogado (L-01, L-07) |
| F | **Dinero:** comprar las **llaves de seguridad físicas** (compra única por unidad; cantidad en 6.6) y, **solo si hace falta**, pagar el plan de GitHub que permita ramas protegidas en un repositorio privado (3.8, paso 0). Precios a verificar (9.5). **[ESCALAR AL CEO]** | Llaves: antes de datos reales. Plan de GitHub: antes de la Etapa 1 | Aprobar cuando los precios estén verificados |
| G | **Designar a dos custodios** de las llaves de cifrado que **no sean las dos únicas personas administradoras de la plataforma** a la vez (Seguridad, condición 3). Es una designación, sin costo propio | Antes de datos reales | Personas distintas de quienes administran la plataforma |

### Palabras que usamos

- **Entorno:** una copia completa de la plataforma funcionando en un lugar.
- **Base de datos:** donde se guarda toda la información. **Rol de base de datos:** una "cuenta" de la base con permisos limitados; hay cinco, cada una para algo distinto.
- **Proceso trabajador:** el programa que trabaja siempre en segundo plano. **Cola de trabajos:** la lista de tareas pendientes que ese programa va cumpliendo.
- **Integración continua:** un robot que revisa cada cambio apenas se escribe.
- **Despliegue / publicar:** poner una versión nueva a disposición de los usuarios. **Reversa:** volver a la versión anterior.
- **Migración:** un cambio en la forma en que se guarda la información (por ejemplo, agregar una columna).
- **Respaldo:** copia de seguridad. **Restauración:** volver a poner en marcha el sistema desde una copia.
- **Secreto:** una clave o contraseña que no puede verse en público. **Llave de cifrado:** el secreto que "cierra con candado" ciertos datos, como las claves de licencia.
- **SPF, DKIM, DMARC:** tres "sellos" que se configuran en el dominio para que Gmail y Outlook crean que un correo realmente viene de nosotros y no lo manden a spam.
- **Latido:** un aviso periódico de "sigo funcionando" que envía cada trabajo; si deja de llegar, suena la alarma.

---

## 1. Entornos

### 1.1 Los cuatro entornos

| | **Desarrollo** | **Revisión automática (desechable)** | **Pruebas (permanente)** | **Producción** |
|---|---|---|---|---|
| Para qué sirve | Escribir y probar mientras se programa | Probar cada cambio en un entorno limpio que nace y muere con la revisión | QA manual, pruebas de punta a punta, demos al CEO antes de aprobar cada etapa, pruebas de volumen | Uso real |
| Dónde corre | El computador de quien programa, con **un solo comando** (instrucciones en el `README`) | En los servidores de GitHub, con un grupo de contenedores propio por cada cambio | En internet, en una dirección privada con acceso restringido | En internet, con la dirección definitiva |
| Aplicación y proceso trabajador | Los dos, en local | Los dos, en el grupo de contenedores | Los dos, en el alojamiento de ejecución continua | Los dos, en el alojamiento de ejecución continua |
| Base de datos | PostgreSQL local (contenedor), desechable | **PostgreSQL propia de ese cambio**; nadie la comparte | **PostgreSQL real, igual a la de producción**, con **al menos 60 conexiones** utilizables | PostgreSQL gestionada, con respaldos |
| Datos | Inventados (generador) | Inventados (generador) | Inventados (generador), incluido el juego de volumen | Reales, solo tras la aprobación del CEO (RNF-018) |
| Correo | **Bandeja de captura local**: nada sale a internet | **Bandeja de captura** que las pruebas leen por programa | **Bandeja de captura legible por QA** (1.5); nunca a personas reales | Real, con dominio verificado |
| Reloj | Real o fijable | **Fijable** por las pruebas | **Fijable** (RNF-020) y con disparador manual de los procesos diarios | **Solo el real**: la plataforma se niega a arrancar si encuentra el reloj de prueba |
| Quién entra | Quien programa | El robot | Equipo de TI y CEO para las demos | Usuarios de las empresas y Administrador de plataforma |
| Se reinicia | Cuando se quiera | Siempre desde cero | Antes de cada demo y cada ciclo de QA (con aviso) | Nunca. Solo cambia con una publicación |
| Claves | Las suyas, sin valor | Las suyas, de un solo uso | Las suyas, distintas de producción | Las suyas, en el lugar seguro de la sección 6 |

**Reglas que no se rompen:**

1. Una persona o programa que trabaja en desarrollo o pruebas **no tiene** las claves de producción.
2. **No hay vistas previas por cambio en internet compartiendo una base** (cambia respecto a la versión 1; QA lo señaló: varias revisiones a la vez se pisarían los datos). Cada cambio se prueba en su entorno desechable (columna 2). Si más adelante se quiere una vista previa en internet por cambio, tendría su **propia** base (una copia o "rama" de base de datos por cambio) y es un gasto que va al CEO.
3. Producción solo cambia con una publicación (principio de DevOps). Nadie edita datos de producción "a mano" para tareas de rutina (D-003).
4. Un entorno nunca lee ni escribe en la base de otro.
5. **Guardas de arranque:** en producción la aplicación se niega a arrancar si (a) el reloj de prueba está activo, (b) el correo está en modo captura, (c) faltan variables obligatorias, o (d) la clave de cifrado es la de relleno. Una prueba automática comprueba cada guarda.

### 1.2 Los cinco roles de base de datos (D-039.3, RS-50)

Una "cuenta" de la base de datos para cada tarea. Si una se filtra, el daño queda limitado a lo que esa cuenta puede hacer.

| Rol | Para qué | Qué NO puede | Dónde vive su clave |
|---|---|---|---|
| `app_empresa` | La aplicación y el proceso trabajador | No es dueño de las tablas, no es superusuario, no se salta las reglas por fila (no tiene BYPASSRLS). En la tabla de auditoría solo puede agregar | La aplicación y el trabajador (variables `DATABASE_URL` y `WORKER_DATABASE_URL`) |
| `app_plataforma` | La consola del Administrador de plataforma: solo tablas globales | No lee datos de negocio de ninguna empresa (así "plataforma no ve el negocio" lo impone la base) | Solo la consola de plataforma |
| `migraciones` | Dueño de las tablas; aplica las migraciones | **No existe en la aplicación en funcionamiento**: solo en el paso de publicación | Solo el proceso de publicación (DevOps) |
| `mantenimiento` | Archivar o borrar por partición (la purga de auditoría y de eventos de seguridad) | No lo usa la aplicación; se usa con **dos personas autorizadas** y constancia | DevOps, custodiado; nada automático antes de que legal confirme los plazos |
| `lector_auditoria` | Solo lectura de la auditoría, para la copia externa y su verificación | No escribe nada | El trabajo de copia y de verificación |

**Pruebas obligatorias en cada cambio y en cada entorno** (las corre QA/CI, yo preparo el entorno): (1) todas las pruebas de aislamiento corren **como `app_empresa`**; (2) una prueba verifica que `app_empresa` **no es dueño de tablas, no tiene BYPASSRLS y no es superusuario**; (3) una prueba verifica que `app_plataforma` no lee ninguna tabla de negocio.

**Lista cerrada de tablas globales** (las únicas que pueden existir sin empresa; D-039.4). La mantiene el Arquitecto y la firma Seguridad:

1. cuenta de usuario; 2. sesión; 3. enlace de ingreso; 4. invitación por token; 5. clave de API (búsqueda por huella); 6. tipos de evento; 7. estado del correo; 8. monedas; 9. países; 10. administradores de plataforma; 11. límites de plataforma; 12. resumen de no leídas por usuario; 13. eventos de seguridad de ingreso.

La revisión automática **falla** si aparece una tabla que ni está en esa lista ni tiene las protecciones de empresa (3.3).

**Detalle para el equipo (preguntas al Arquitecto y a Datos que afectan mi trabajo):**
- Las **tablas de la cola de trabajos** (las crea la librería elegida, por ejemplo pg-boss o graphile-worker) y el **registro de plataforma** (D-048.5d: crear, suspender, rescatar empresas) **no aparecen** en la lista cerrada. O se agregan a la lista, o se justifican como tablas con empresa. Hay que decidirlo antes de la Etapa 1 porque la revisión automática las marcaría.
- Verificar que el **proveedor de base de datos permite** crear estos cinco roles (con NOBYPASSRLS), reglas por fila forzadas, funciones `SECURITY DEFINER`, tablas particionadas y las extensiones `citext`, `unaccent`, `pg_trgm`, `btree_gist` y `pgcrypto` (T-4 pide que DevOps lo confirme). Esa comprobación es el **día 0** del prototipo (sección 10).
- D-030.8 habla de partición **anual** para la purga a los 5 años y T-8 de partición **mensual**: necesito saber cuál rige para preparar el rol `mantenimiento` y su procedimiento.

### 1.3 La base de pruebas permanente para QA

QA necesita comprobar cosas que **solo pasan con una base real y varias personas a la vez**: que 20 personas creando artículos a la vez obtengan 20 códigos distintos (D-007), que dos personas recibiendo la misma orden no se pasen de lo pendiente (D-016), que el stock nunca quede negativo (D-010) y que una empresa no vea lo de otra (D-039). Una base "de juguete" (en memoria, de un solo usuario, o que no sea PostgreSQL) no detecta esos fallos.

- **Conexiones: al menos 60 utilizables** (cambia respecto a la versión 1, que decía unas 20): QA prueba con 20 y con 50 conexiones simultáneas (D-055, T-11) y necesita margen para la aplicación, el trabajador y las herramientas. Se cuentan **las conexiones directas realmente disponibles** (los proveedores reservan algunas para ellos), no solo las del agrupador.
- **Misma versión mayor de PostgreSQL** que producción, fijada en un solo archivo.
- **Agrupador de conexiones en modo transacción**, como en producción, para que la prueba de que la empresa no "se queda pegada" entre peticiones (D-055: 50 peticiones intercaladas) se haga contra lo real.
- **Los cinco roles** y las mismas extensiones que producción.
- **Volumen:** un juego de **100.000 activos y 500.000 movimientos** (QA, 6.3) para medir RNF-011. Se carga en una base lógica aparte dentro de la misma instancia si el plan lo permite; si no, en una base aparte creada para esa medición. Las cifras de referencia se toman aquí (la más parecida a producción); la corrida nocturna en el robot sirve para detectar empeoramientos, no para certificar RNF-011.
- Se reinicia desde el generador antes de cada demo y cada ciclo de QA, con aviso.

### 1.4 Reloj fijable y disparador manual (RNF-020, D-038.8)

QA no puede esperar 15 minutos reales a que venza un enlace de ingreso, ni un día a que corran los avisos de vencimiento.

- En desarrollo, en la revisión automática y en pruebas, las pruebas pueden **fijar y adelantar la fecha y la hora** de la plataforma y **disparar a mano** los procesos diarios (variables `TEST_CLOCK_ENABLED` y `TEST_CLOCK_FIXED_AT`, nombres propuestos).
- **La aplicación y el trabajador deben ver el mismo reloj** (si cada uno tuviera el suyo, los avisos saldrían en horas distintas). El Arquitecto decide cómo se comparte (por ejemplo, un valor guardado en la base de pruebas que ambos leen).
- **En producción no existe.** La plataforma se niega a arrancar si encuentra esas variables, y la ruta del disparador manual responde "no encontrado". Una prueba automática lo comprueba en cada cambio, y la lista de verificación de cada publicación incluye "reloj de prueba apagado".
- El disparador manual se protege con `CRON_SECRET` y no está expuesto fuera de la red de pruebas. El contrato completo (qué dispara, cómo, cómo se prueba que no existe en producción) está en 1.10.

### 1.5 Correo de captura legible por QA

En desarrollo y pruebas **el correo nunca sale a internet**: la plataforma lo entrega a una **bandeja de captura** (una herramienta como Mailpit; la elección final la hago en el prototipo) que QA y las pruebas automáticas pueden **leer por programa**: contar correos, ver destinatarios, abrir el contenido y buscar importes, nombres, claves o enlaces. Con eso se prueba que los correos no traen datos que no deben (D-061.4) y que el enlace de ingreso funciona de punta a punta.

- Se activa con `EMAIL_TRANSPORT=captura`; en producción debe ser `proveedor` y la plataforma se niega a arrancar si no lo es.
- La bandeja de pruebas contiene enlaces de ingreso de usuarios **ficticios**; se protege con acceso restringido y no es alcanzable desde producción.
- **La prueba de entrega real a Gmail y Outlook** (sección 7.3) es otra actividad, separada: se hace con el proveedor real, un dominio de prueba y buzones de prueba controlados, antes de elegir proveedor. No se hace en la bandeja de captura.

### 1.6 Datos de prueba: nunca reales (D-028, RF-DAT-010)

- **Fuente única:** un generador crea los datos **inventados**. El contenido lo pide QA (`ronda3-qa-tester.md`, 6.3): empresas A "Norte" (USD, zona de Lima), B "Sur" (PEN, zona de Ciudad de México) y C sin datos, con códigos, series, correos, proveedores e identificaciones fiscales **idénticos en A y B a propósito**; un usuario de cada una de las 7 plantillas por empresa; un usuario en A y B con roles distintos; un administrador con y sin segunda verificación; un rol "Contador"; una Persona canario, homónimas y sin correo; 4 categorías con campos de los 6 tipos; SKU por serie y por cantidad; órdenes en cada estado; límite de aprobación de 5.000; dos monedas; **100.000 activos y 500.000 movimientos**; un Excel válido de 5.000 filas y 12 sucios. Lo escribe el Ingeniero de Datos; yo lo enchufo a los cuatro entornos y a la revisión automática.
- Todo con dominio reservado `.test`. **Ningún dato real** en repositorio ni pruebas.
- **Nombre canario:** una Persona con un nombre inconfundible que QA busca en toda la base, exportaciones y correos (D-061.3). Yo agrego la búsqueda del canario también en los registros técnicos y en los eventos de error de prueba (1.7 y sección 3).
- **El Excel, la orden de compra y la de servicio del CEO** llegan con nombres reemplazados. Si el CEO prefiere entregarlos tal cual, se guardan **fuera del repositorio y fuera de los entornos de prueba**, en un lugar con lista de personas autorizadas, segunda verificación y registro de quién entró (lo defino con Seguridad al recibir el primer documento; hoy no hay nada que guardar).
- **Copias de producción a pruebas: prohibido.** Un error de producción se reproduce con datos inventados.

### 1.7 Inyección de fallos (lo que QA pidió, punto 14)

Para probar que un corte a mitad de una recepción o importación deja todo o nada, y que si el trabajador muere no se pierde nada:
- **En la revisión automática:** un intermediario de red entre la aplicación y la base que se puede cortar a voluntad (una herramienta como Toxiproxy) y la orden de detener y reiniciar el trabajador.
- **En pruebas:** una función de prueba, **solo en ese entorno**, que corta una conexión (`pg_terminate_backend`) y un comando para detener y reiniciar el trabajador. Ambos requieren el secreto de pruebas y no existen en producción.
- El catálogo de fallos que se inyectan, dónde corre cada uno y el resultado que debe verse está en 1.12.

### 1.8 Cuándo se necesita cada cosa

| Hito | Qué debe estar listo |
|---|---|
| Etapa 0 (ahora) | Este plan; `.gitignore` y `.env.example` (ya están en el repositorio); la **revisión automática de documentos**, `CODEOWNERS` y la plantilla de propuestas (ya están en `.github/`); la estimación de costos con las páginas donde verificar cada precio (9.5) |
| Antes del prototipo técnico (3-4 días, D-055) | Comparación de proveedores con precios verificados, **comprobación de compatibilidad del día 0** y cuentas de prueba (sección 10) |
| Antes de la Etapa 1 (D-064) | Proveedores elegidos y aprobados por el CEO; cuentas a nombre de la empresa; repositorio con ramas protegidas (3.8) y revisión de secretos; revisión automática completa con entornos desechables de base propia (1.9); entorno de pruebas con reloj fijable, disparador manual (1.10) y bandeja de captura; ensayo de reversa y de restauración con cronómetro (5.2); **condiciones 1 y 2 de Seguridad sobre las llaves** (6.5) |
| Etapa 1 | Trabajador y cola en pruebas; correo real de prueba con dominio verificado y matriz de entrega; vigilancia de errores en pruebas; auditoría con su rol de base separado |
| Etapa 2 | Registro de anonimizaciones en su almacén aparte (RF-DAT-016: existe desde la Etapa 2); **condición 8 de Seguridad** (prueba automática de que no hay secretos en claro, 6.5) |
| Etapa 4 en adelante | **Prueba de carga nocturna** (100.000 activos y 500.000 movimientos; D-056, S-19; procedimiento en 3.9) |
| Antes de cualquier etapa con uso real | Respaldos diarios, restauración probada con RS-49 (5.2), copia externa de auditoría funcionando y su ensayo de manipulación (5.3), plan de reversa por publicación, procedimiento de incidente y manuales (RNF-014 a RNF-016, D-059); **condiciones 3, 4, 5 y 7 de Seguridad** sobre las llaves y llaves físicas de los administradores de plataforma (6.5 y 6.6) |
| Etapa 7 | Producción con datos reales: aprobación del CEO (RNF-018); **condición 6 de Seguridad** (evaluar el servicio de llaves gestionado, 6.5) |


### 1.9 Entorno desechable con base propia: cómo se construye

Responde a QA (punto 12) y reemplaza la base de pruebas compartida de la versión 1.

1. **Un proyecto de contenedores por cambio.** El robot de GitHub levanta con un solo comando, en su propia máquina virtual, cinco piezas: PostgreSQL de la **misma versión mayor que producción** (fijada en un solo archivo), el agrupador de conexiones en modo transacción, la aplicación, el trabajador y la bandeja de captura de correo; el intermediario de fallos (1.12) se suma solo cuando la suite lo pide. El nombre del proyecto lleva el número del cambio y de la corrida, de modo que dos revisiones a la vez **no pueden** compartir nada.
2. **La base nace vacía y muere con el trabajo.** Un guion repetible crea los cinco roles (1.2), aplica las migraciones y carga el perfil `pequeño` del generador (1.11). Al terminar se destruye con sus datos (`down -v`). No hay nada que limpiar a mano.
3. **No puede apuntar a otra base.** El robot **no recibe** las claves de pruebas ni de producción (esas viven en los "entornos" de GitHub, solo para la publicación desde la rama principal). Además, un paso inicial **falla** si alguna dirección de base de datos no es del propio grupo de contenedores. Una prueba escribe una marca con el identificador de la corrida y comprueba que es la única que existe.
4. **Tiempo y tamaño.** Meta: menos de 10 minutos por cambio (3.2); tope duro del trabajo, 20 minutos. Si se pasa, se corrige la suite, no se sube el tope.
5. **Perfil de volumen solo de noche** y, para las cifras de referencia, en la base permanente de pruebas (1.3); el robot detecta empeoramientos (3.9).
6. **Vistas previas en internet por cambio: no hay.** Si algún día se quieren, tendrían su propia base y es un gasto que va al CEO.
7. **Costo:** los minutos de ejecución del robot. Si el plan de GitHub los limita, es el único gasto que esto agrega; precio y límites a verificar en la página de 9.5.

### 1.10 Disparador manual del trabajador (RNF-020, CA-077)

QA no espera a las 8:00 ni un día entero. El Arquitecto fija los nombres definitivos; esto es lo que DevOps necesita para que funcione y para que **no exista en producción**.

| Aspecto | Contrato propuesto |
|---|---|
| Qué hace | Ejecuta **ahora** un trabajo programado concreto (avisos de vencimiento, cierres, tableros precalculados, reconciliación de anonimizaciones, vaciado de la cola de correo) **para una empresa y una fecha lógica**, sin esperar al reloj |
| Quién lo ejecuta | **El trabajador**, no la aplicación web: así se prueba el camino real (bloqueo, reintento, registro de corrida, empresa fijada en la transacción) |
| Cómo se invoca | (a) un comando del trabajador con trabajo, empresa y fecha; (b) una ruta interna `POST` de la aplicación que encola ese mismo trabajo. Ambas exigen `CRON_SECRET` y la ruta solo se publica en la red de pruebas |
| Con el reloj | Receta estándar de QA: fijar o adelantar el reloj (1.4) y disparar. Para probar "el trabajador estuvo caído tres días": adelantar tres días con el trabajador detenido, arrancarlo y comprobar que procesa **los tres días en orden** (D-038.4, RNF-019) |
| Resultado | Un registro de corrida por empresa y día (fecha lógica, resultado, duración, cantidad de avisos) que QA lee |
| Repetirlo | Es **idempotente**: dispararlo dos veces para el mismo trabajo, empresa y día no duplica avisos ni correos (clave única, D-038.3) |
| En producción | **No existe:** (1) la ruta responde "no encontrado" y el comando se niega si `ENTORNO=produccion`; (2) la ruta no se publica en el enrutador de producción; (3) la plataforma se niega a arrancar en producción con el reloj de prueba o los disparadores activados |
| Pruebas que lo demuestran (en cada cambio) | disparo sin secreto, rechazado; disparo con secreto, ejecuta y deja registro; dos disparos, un solo aviso; arrancar en modo producción con el disparador activado, se niega; ruta en modo producción, "no encontrado". La publicación a producción repite las dos últimas como prueba de humo (4.1, paso 9) |

### 1.11 Generador de datos de dos empresas con volumen (contrato para el Ingeniero de Datos)

Lo escribe Datos (contenido de QA en 1.6); DevOps lo conecta a los cuatro entornos y a la revisión automática.

- **Un solo programa, tres perfiles**, siempre con **semilla fija** (mismos datos cada vez): `pequeño` (cada cambio: empresas A "Norte" y B "Sur" con el juego de QA 6.3 y C vacía), `completo` (agrega órdenes en cada estado, actas, el Excel válido de 5.000 filas y los 12 sucios) y `volumen` (agrega **100.000 activos y 500.000 movimientos**).
- **Volumen en las dos empresas.** RNF-010 habla de 100.000 activos **por empresa**, y probar el aislamiento con las dos grandes es más exigente. El perfil `volumen` carga esa cifra en A **y** en B (500.000 movimientos cada una), con una opción para cargarlo solo en A si el tiempo o el costo lo exigen. *Supuesto a confirmar con QA; no es pregunta al CEO.*
- **Carga masiva** (no fila por fila) y meta inicial de tiempo para `volumen`: 20 minutos; se mide la primera vez y se ajusta. El resultado de `volumen` **no se guarda como archivo** (pesa y es dato): se regenera, y en la base permanente se guarda una plantilla interna de la propia base para reiniciar rápido antes de cada demo.
- **Verificador de lo cargado** (el propio generador lo corre al terminar y falla si algo no cuadra): cantidades por empresa y tabla; códigos, series, correos e identificaciones fiscales idénticos en A y B a propósito; un solo canario; ningún correo fuera del dominio `.test`; un usuario por cada plantilla de rol en cada empresa; el usuario con roles distintos en A y B.
- **Se niega a correr contra producción** (comprueba `ENTORNO` y una marca de "base de pruebas" que solo existe fuera de producción).

### 1.12 Catálogo de fallos inyectados (QA, punto 14)

| # | Fallo | Dónde corre | Qué debe verse |
|---|---|---|---|
| F1 | Cortar la conexión a la base a mitad de **recibir 100 series** | Cada cambio (intermediario de red) y pruebas | Todo o nada: no queda recepción a medias ni activos huérfanos; al reintentar, se completa una sola vez |
| F2 | Cortar a mitad de una **importación** de 5.000 filas | Cada cambio y pruebas | Ninguna fila a medias fuera de lo que las reglas permiten; el reintento no duplica |
| F3 | **Matar al trabajador** (sin aviso) con un trabajo en curso | Cada cambio y pruebas | El trabajo vuelve a la cola al vencer su bloqueo; se ejecuta una sola vez; no hay correo duplicado |
| F4 | **Reiniciar PostgreSQL** | Pruebas (de noche) | La aplicación y el trabajador se reconectan solos; los errores son limpios, sin fugas de detalle |
| F5 | **Lentitud** de 2 segundos en cada consulta | De noche | No hay doble ejecución por tiempo de espera; los topes y reintentos se comportan |
| F6 | El **proveedor de correo** rechaza o tarda | Cada cambio (bandeja de captura configurada para fallar) | Reintentos con espera, trabajo "muerto" tras el tope, alarma por antigüedad (2.3), el acceso no se pierde en silencio |
| F7 | **Almacén de objetos no disponible** (copia de auditoría, respaldo) | Pruebas | Falta el latido y suena la alarma; al volver, se pone al día sin huecos |
| F8 | **Trabajador caído tres días** y luego reinicio | Cada cambio (con el disparador, 1.10) | Procesa los días pendientes en orden sin perder avisos |

Las herramientas de fallo **no se despliegan en producción**: el intermediario no forma parte de su grupo de servicios, y la función de corte y el comando de detención solo los crea el guion "solo pruebas". Una prueba de humo de cada publicación comprueba que no existen.

---

## 2. Alojamiento y proceso trabajador

### 2.1 Qué es el trabajador y por qué importa

La plataforma tiene **dos programas** que corren a la vez a partir del mismo código:

- **La aplicación web:** lo que ven y usan las personas.
- **El proceso trabajador:** un programa que trabaja siempre detrás, sin que nadie haga clic. Se ocupa de lo que no puede esperar a una persona: **enviar los correos con reintentos** (el acceso depende de eso), las **importaciones y exportaciones grandes** (hasta 5.000 y 50.000 filas), los **PDF masivos**, los **avisos diarios** de vencimientos, los cierres y los cálculos precalculados de los tableros (D-038).

Un alojamiento "sin servidor", que apaga el programa a los pocos segundos de terminar cada petición, **no sirve** para el trabajador. Por eso el plan de la versión 1, que suponía Vercel, queda reemplazado: el alojamiento debe ser de **ejecución continua** (un servicio de contenedores o un servidor propio).

### 2.2 Dónde corre y cómo se despliega

- **Mismo proveedor, mismo código, dos servicios:** la aplicación web y el trabajador salen de **una sola imagen de contenedor** (misma versión siempre), pero corren como **servicios separados**: reiniciar uno no detiene al otro, y se puede dar más capacidad a la web sin multiplicar el trabajador.
- **Una instancia de trabajador al inicio.** La cola permite varias (cada trabajo se bloquea para que solo uno lo tome), pero el **programador único** que reparte los trabajos diarios (D-038.3) debe ser uno; el Arquitecto lo diseña con una clave única por trabajo, día y empresa para que, aunque arranquen dos, no se dupliquen avisos.
- **Conexión directa a la base para el trabajador** (`WORKER_DATABASE_URL`): las librerías de cola suelen usar funciones (por ejemplo, escuchar avisos de la base) que el agrupador en modo transacción no admite. Lo confirmo en el prototipo; si no hace falta, se usa el mismo agrupador. En ambos casos el trabajador entra como `app_empresa` y **fija la empresa dentro de cada transacción** (D-038.4).
- **Se publica junto con la web**, nunca solo. Mientras dura el cambio de versión conviven un momento la versión vieja y la nueva: los trabajos pendientes deben seguir siendo comprensibles por ambas (regla "ampliar y luego limpiar" aplicada también a los datos de la cola, sección 4.2).

### 2.3 Cómo se vigila

| Qué | Cómo | Alarma |
|---|---|---|
| ¿Está vivo? | **Latido** cada minuto a un servicio externo | Si faltan 3 latidos seguidos |
| ¿La cola se atasca? | Cantidad de trabajos esperando y antigüedad del más viejo | El más viejo espera más de 5 minutos (correos) o 30 minutos (el resto) |
| ¿Hay trabajos que fallan? | Trabajos fallidos y reintentos agotados | Cualquier trabajo "muerto" (agotó reintentos) |
| ¿Corrieron los procesos diarios? | Registro de cada corrida por empresa (fecha lógica, resultado; D-038.4) | Una empresa sin corrida del día a las 10:00 de su zona |
| ¿El correo de acceso llega? | Tiempo entre la orden de envío y la aceptación del proveedor | Más de 2 minutos, o más de 5 % de fallos |

### 2.4 Cómo se reinicia

- **Reinicio automático** si el programa se cae (política del alojamiento) y alerta a la persona responsable.
- **Apagado ordenado:** al recibir la orden de detenerse, termina o devuelve el trabajo en curso en unos segundos. Si muere sin avisar, los trabajos que tenía **vuelven solos a la cola al vencer su bloqueo** (esa es la gracia de una cola con bloqueo).
- **Recuperable:** los trabajos son idempotentes (correrlos dos veces no duplica nada) y, al arrancar, el trabajador procesa los **días pendientes en orden** sin perder ningún aviso de vencimiento (D-038.4, RNF-019).
- **Trabajo "envenenado"** (uno que siempre falla): tras un número fijo de reintentos pasa a "muerto", suena la alarma y no bloquea al resto.
- **Guion de reinicio manual** (va a `docs/operaciones/`): comprobar el latido, ver la cola, reiniciar, comprobar que la cola baja, comprobar que no hay duplicados y registrar lo ocurrido.

### 2.5 Capacidad y costo

Con el volumen supuesto (RNF-010) una instancia pequeña de web y una de trabajador bastan para empezar. Los alojamientos de ejecución continua **rara vez son gratuitos de forma estable**: es una pieza de costo recurrente adicional a las del plan de la versión 1. Las opciones y su criterio de elección están en la sección 9 (rubro 1). **[ESCALAR AL CEO]** (D2, D-038 "Qué cambia").

---

## 3. Integración continua y repositorio

**Herramienta propuesta:** GitHub Actions (el código ya vive en GitHub).

### 3.1 Qué se ejecuta en cada cambio

Cada propuesta de cambio (un "pull request") dispara estas revisiones, en este orden; las baratas van primero. **Todas bloquean.**

| # | Revisión | Qué comprueba |
|---|---|---|
| 1 | **Instalación limpia** | Las dependencias se instalan exactamente como están fijadas en el archivo de bloqueo |
| 2 | **Análisis de código** | Estilo, errores comunes (linter) y tipos de TypeScript |
| 3 | **Búsqueda de secretos y de datos personales** | Que no se haya colado una clave, un `.env`, un correo o un nombre real; que el nombre canario no aparezca donde no debe (3.5) |
| 4 | **Pruebas unitarias** (Vitest) | La lógica de negocio sin base de datos |
| 5 | **Grupo de contenedores desechable** | Se crea una PostgreSQL vacía, la aplicación, el trabajador y la bandeja de captura de correo, propios de ese cambio |
| 6 | **Migraciones desde cero y encima de datos** | Se aplican todas las migraciones; el resultado coincide con el esquema escrito; se prueba también migrar sobre datos de la versión anterior |
| 7 | **Pruebas con base real** | Concurrencia con 20 conexiones (los 5 patrones de T-11), reglas de la base, auditoría que solo se agrega, cola y trabajador (reintento, reinicio), procesos diarios con dos empresas y reloj fijado |
| 8 | **Control de cobertura de aislamiento** | Ver 3.3 |
| 9 | **Matriz de permisos** | Todas las celdas del catálogo de permisos (unas 482), cada una por petición directa (D-036.7), y la prueba de que no se usa un permiso fuera del registro |
| 10 | **Pruebas de arquitectura** | Sin dependencias circulares entre módulos y solo interfaces públicas (D-038.6) |
| 11 | **Guardas de arranque** | La plataforma se niega a arrancar en modo producción con reloj de prueba, correo de captura, variables faltantes o clave de relleno (1.1, regla 5) |
| 12 | **Compilación** | `build` de Next.js sin errores |
| 13 | **Revisión de dependencias** | Vulnerabilidades conocidas (RS-43); falla con gravedad alta o crítica |
| 14 | **Pruebas de punta a punta** (Playwright) | Los 5 recorridos esenciales (ingreso por enlace, cambio de empresa, recibir, entregar, aprobar) en el entorno desechable |

### 3.2 Qué corre cada cuánto (respuesta de QA a mi pregunta 1)

| Suite | En cada cambio (meta: menos de 10 minutos) | Nocturna | Antes de cada etapa con uso real |
|---|---|---|---|
| Unitarias; migraciones desde cero y sobre datos; aislamiento por tabla y por módulo y roles de base; matriz de permisos; auditoría solo-agregar; concurrencia con 20 conexiones; cola y trabajador; procesos diarios con dos empresas y reloj | **Todas** | | |
| Migraciones con volumen | | Todas | |
| Concurrencia con **50 conexiones** | | Todas (en la base de pruebas permanente) | |
| E2E | Los 5 esenciales | **Todos**, en Chromium, Firefox y WebKit, y a ventana de 360 px | |
| Importación (archivo válido y 12 sucios) | El válido y 3 sucios | Todos | |
| PDF y texto malicioso | | Todos | |
| **Carga de 100.000 activos y 500.000 movimientos; recepción de 100 series** | | **Todas, desde la Etapa 4** (D-056, S-19) | Medición final contra RNF-011 |
| Accesibilidad automática (contraste, teclado) | | Todas (herramienta automática, por ejemplo axe) | Revisión manual |
| Restauración, reversa, copia externa alterada a propósito | | | **Todas, con cronómetro** |

### 3.3 Control de cobertura de aislamiento (mejorado con lo que pidió QA)

Un programa consulta la base recién migrada y verifica, **como `app_empresa`**:

1. Toda tabla con empresa tiene las reglas por fila **activadas y forzadas** (no basta con activarlas: el dueño de la tabla se las salta si no se fuerzan).
2. Toda referencia entre datos de negocio usa la **clave foránea compuesta** `(empresa, id)`.
3. Hay **una prueba de aislamiento por módulo** (D-039.8), y para el portal, una con dos Personas de la misma empresa.
4. El rol de la aplicación **no tiene** atributos de privilegio (dueño, superusuario, BYPASSRLS).
5. La lista de tablas globales es **la cerrada de 1.2**; si crece, la revisión falla hasta que Seguridad la firme.
6. Cada tabla nueva trae su prueba con las cinco comprobaciones: no se lista, no se lee por identificador ("no encontrado"), no se modifica, no se referencia desde otra empresa, y una consulta **escrita sin filtro de empresa a propósito** devuelve vacío.

### 3.4 Qué bloquea publicar y quién puede saltárselo

- **Nada se publica con una revisión en rojo.** La rama principal está protegida: se entra solo por propuesta de cambio, con todas las revisiones en verde y la aprobación de **una persona distinta** de quien lo escribió.
- **Nadie puede apagar una revisión** para que pase. Si una revisión está mal escrita, se corrige en un cambio aparte.
- **Excepción única:** una vulnerabilidad de dependencia sin arreglo puede aceptarse por escrito con la firma de Seguridad, motivo, fecha de vencimiento (máximo 30 días) y registro en `docs/operaciones/`.
- **Pruebas intermitentes** se tratan como defecto: no se repiten hasta que pasen; se arreglan o se retiran con registro.
- **Artefactos de fallo** (capturas, vídeos, informe de pruebas) se conservan 14 días.

### 3.5 Repositorio: lo que Seguridad exige antes de la Etapa 1 (H-SEG-32 e, D-064 condición 10)

| # | Condición | Estado hoy | Cómo se comprueba |
|---|---|---|---|
| 1 | `.gitignore` para Node, Next.js, entornos, secretos, copias de base de datos y hojas de cálculo | **Hecho:** `/.gitignore` creado y probado (ignora `.env`, claves, volcados y `*.xlsx`/`*.csv` salvo las carpetas de prueba inventada) | Archivo en el repositorio |
| 2 | `.env.example` con los nombres de variables y sin valores reales | **Hecho:** `/.env.example` (todos los valores son "cambiar-esto"); se actualiza cada vez que el código agrega una variable | Archivo en el repositorio; la revisión automática falla si el código usa una variable que no está en él |
| 3 | **Ramas protegidas** en GitHub: sin escritura directa en la rama principal, revisión automática obligatoria, aprobación de otra persona, sin forzar empujes | **Pasos exactos escritos (3.8); falta que los haga quien administra el repositorio.** Desde esta sesión no puedo cambiar esa configuración | Captura de la configuración y prueba de empuje directo rechazado (3.8, paso F) |
| 4 | **Revisión de secretos**: (a) herramienta de búsqueda de secretos en cada cambio, (b) la protección de GitHub que bloquea el empuje si lleva un secreto (verificar disponibilidad en el plan), (c) opcional: revisión local antes de cada commit | **(a) Hecha para documentos** (3.7, también revisa los commits intermedios); se amplía al código en la Etapa 1. **(b) Pendiente** de activar y de verificar si el plan de GitHub la incluye en repositorio privado (3.8, pasos C y 0). (c) Opcional | Prueba: un secreto falso en una rama de ensayo debe bloquearse (3.8, paso F) |
| 5 | Archivo de bloqueo de dependencias versionado | Se cumple al crear el proyecto | Revisión de instalación limpia (paso 1) |
| 6 | Cuentas con segunda verificación y mínimo privilegio en GitHub | **Pendiente:** depende de pedido B | Lista de accesos (D-064 condición 9) |

### 3.6 Después de aprobar

Al unirse a la rama principal: se vuelve a ejecutar todo, se publica **automáticamente en pruebas** (con migraciones aplicadas en pruebas y datos reiniciados si corresponde), corren pruebas de humo, y queda listo para decidir si se publica en producción (sección 4). **La publicación en producción nunca es automática.**


### 3.7 Revisión automática de documentos (ya creada)

Mientras no haya código, lo que se cambia son documentos, y los documentos también se rompen: una cita a un requisito que no existe, un permiso inventado, un enlace roto o una clave pegada por descuido. Archivos: `.github/workflows/documentos.yml` (el robot), `.github/scripts/revisar_documentos.py` (la lógica, solo Python 3 estándar, sin instalar nada ni pagar nada), `.github/CODEOWNERS` y `.github/pull_request_template.md`.

| Revisión | Falla el cambio si... | Fuente de la regla |
|---|---|---|
| **Citas** | se cita `RF-012`, `PAN-05` o `SUP-03` **sin código de módulo**; el código de módulo no es uno de los 33 válidos; un `RF`, `RN`, `RNF`, `CA`, `PAN`, `SUP` o `RS` citado **no está definido** en los documentos vigentes; o un `RN-nnn`, `RNF-nnn` o `CA-nnn` sin código no existe en el documento funcional | `documento-funcional.md` 26.2 |
| **Permisos** | se cita un `PS-nn` que no existe o está retirado; un `PS-nn` va junto a un nombre técnico distinto del del registro; o se escribe "permiso `x.y`" con un nombre que no está en el registro | `registro-permisos.md` |
| **Referencias** | un documento nombra otro archivo o enlace de `docs/`, `.github/` o `.claude/` que no existe (las carpetas futuras solo dan aviso, no fallan) | Todo el repositorio, salvo los registros históricos |
| **Secretos** | aparecen claves privadas, claves de AWS, tokens de GitHub, Slack, Stripe, Google, OpenAI o Anthropic, SendGrid, Resend, tokens JWT, direcciones con contraseña, asignaciones de `secret`, `token` o `password` con valor largo; hay un `.env`, un archivo de claves (`.pem`, `.key`), un volcado de base o una hoja de cálculo fuera de las carpetas de prueba inventada. **También revisa cada commit del cambio**: un secreto agregado y borrado después sigue en el historial | CLAUDE.md regla 4, `.gitignore` |

- **Qué no revisa:** el sentido de lo escrito (que una cita sea la correcta, no solo que exista), nombres reales de personas ni el canario (eso se suma cuando haya datos y código), y los registros históricos (`docs/revision-cruzada/`, mesas y oleadas), que conservan citas viejas a propósito. Líneas que hablan de algo retirado o renombrado ("retirado", "pasa a", "no existe"...) se saltan en citas y permisos.
- **Cuando se agrega un módulo nuevo,** su código se agrega a la lista cerrada del script **en el mismo cambio**; si no, la revisión falla con "código de módulo desconocido". Es a propósito: obliga a registrar el prefijo en 26.2.
- **Un falso positivo de secretos** se marca con `revisado-sin-secreto` en esa línea y quien revisa el cambio lo acepta por escrito.
- **Se corre igual en cualquier computadora:** `python3 .github/scripts/revisar_documentos.py todo`. El 2026-10-26 pasó en verde sobre el repositorio actual y falló, como debe, ante defectos plantados en una copia (cita sin módulo, permiso inventado, enlace roto, clave falsa en un commit intermedio, `.env` y CSV).
- **El nombre que se exige** en las ramas protegidas es el del último trabajo, **"Documentos en regla"**, que solo pasa si pasan los cuatro.
- **Pendiente:** acciones de terceros (`actions/checkout`) con versión etiquetada; al llegar el código se fijan por huella de versión y se agrega Dependabot (Etapa 1).

### 3.8 Pasos exactos para activar las ramas protegidas y la revisión obligatoria

**Quién:** una persona con rol **Admin** del repositorio (hoy, la dueña de la cuenta `onunez9418`). Desde esta sesión no puedo hacerlo. **Tiempo:** unos 15 minutos. **Los nombres de los botones de GitHub están en inglés**; van entre comillas.

**Paso 0. Comprobar que el plan de GitHub lo permite.**
1. Entre a `https://github.com/onunez9418/Plataform_TI_Gestion` e inicie sesión.
2. Arriba a la derecha de la página del repositorio, clic en **"Settings"** (la rueda dentada).
3. En el menú de la izquierda, clic en **"Rules"** y luego en **"Rulesets"**. Clic en **"New ruleset"** y en **"New branch ruleset"**.
4. Si aparece un aviso que dice que esa función requiere un plan de pago para repositorios privados ("Upgrade to GitHub Pro" o "Team"), **deténgase**: es un gasto y va al CEO (pedido F). Precio en la página oficial de 9.5. **No haga público el repositorio** para evitar el pago: contiene el trabajo interno del proyecto. Si no hay aviso, siga.

**Paso A. Hacer que la revisión exista.** (GitHub solo deja elegir una revisión como obligatoria después de que corrió al menos una vez.)
1. Clic en la pestaña **"Actions"** del repositorio. Si pide habilitar los flujos, clic en **"I understand my workflows, go ahead and enable them"**.
2. En la lista de la izquierda clic en **"Documentos"**, luego **"Run workflow"** (a la derecha), rama `main` o la de trabajo, y **"Run workflow"** otra vez. Espere a que todo quede con la marca verde. (Si "Run workflow" no aparece, abra cualquier propuesta de cambio: corre sola.)

**Paso B. Crear la regla de la rama principal.**
1. Vuelva a **Settings → Rules → Rulesets → New ruleset → New branch ruleset**.
2. **"Ruleset Name":** escriba `proteger-main`. **"Enforcement status":** elija **"Active"**.
3. **"Bypass list":** déjela **vacía** (nadie se salta la regla; tampoco quien administra).
4. **"Target branches":** clic en **"Add target"** → **"Include default branch"**.
5. En **"Branch rules"** marque:
   - **"Restrict deletions"** y **"Block force pushes"**.
   - **"Require a pull request before merging"** y dentro de ella: **"Required approvals"** = **1**; marque **"Dismiss stale pull request approvals when new commits are pushed"**, **"Require review from Code Owners"**, **"Require approval of the most recent reviewable push"** y **"Require conversation resolution before merging"**.
   - **"Require status checks to pass"**; marque **"Require branches to be up to date before merging"**; clic en **"Add checks"**, escriba **`Documentos en regla`** y elíjalo (origen "GitHub Actions"). Si no aparece, el paso A no terminó o pasaron más de siete días sin correr: vuelva a correrlo.
6. Clic en el botón verde **"Create"**.

**Paso B-bis. Si hoy solo hay una persona con acceso** (el autor de un cambio **no puede aprobar el suyo**, así que con "1 aprobación" nadie podría unir nada): en el punto 5 ponga **"Required approvals" = 0** y **desmarque "Require review from Code Owners"**; el resto queda igual. Anote la fecha en `docs/equipo/riesgos.md` (riesgo #14: concentración de accesos). **Antes de la Etapa 1** (D-064 condición 9) agregue a la segunda persona (**Settings → Collaborators → "Add people"**, rol **"Write"**, con segunda verificación) y vuelva a poner **1** y la revisión de dueños del código. Cuando existan más cuentas, se agregan a `.github/CODEOWNERS` en un cambio normal.

**Paso C. Bloqueo de secretos de GitHub.**
1. **Settings → "Code security"** (en algunas pantallas, "Code security and analysis").
2. En **"Secret scanning"** clic en **"Enable"**; luego en **"Push protection"** clic en **"Enable"**. Si estas opciones aparecen en gris o con un candado de pago, es el mismo gasto del paso 0 u otro adicional: verifíquelo en 9.5 y consulte al CEO. Mientras tanto la búsqueda de 3.7 sigue siendo la barrera.
3. En **"Dependabot alerts"** clic en **"Enable"** (avisos de dependencias vulnerables; sirve desde que haya código).

**Paso D. Limitar al robot.** **Settings → Actions → General**, bajar a **"Workflow permissions"**: elija **"Read repository contents and packages permissions"** y **desmarque** "Allow GitHub Actions to create and approve pull requests". Clic en **"Save"**.

**Paso E. Segunda verificación de las cuentas.** Cada persona con acceso: foto de perfil → **"Settings"** → **"Password and authentication"** → **"Enable two-factor authentication"**. Anote la lista de accesos (nombre y rol, sin claves) para D-064 condición 9.

**Paso F. Prueba de que funciona** (es la evidencia de D-064 condición 10; no use una clave real):
1. Cree una rama `prueba/ramas-protegidas`, agregue en un archivo de texto la línea `clave = ` seguida de una clave inventada del tipo `AKIA` + 16 letras y números al azar, y envíe el cambio.
2. Abra la propuesta de cambio hacia `main`. **Resultado esperado:** "Documentos en regla" en rojo y el botón **"Merge pull request"** bloqueado. (Si GitHub rechaza el empuje antes, por la protección del paso C, también vale.)
3. Intente un empuje directo a `main`: **debe ser rechazado** ("protected branch").
4. **Cierre sin unir** la propuesta (**"Close pull request"**) y **borre la rama** (**"Delete branch"**).
5. Guarde dos capturas (la regla en **Settings → Rules** y la propuesta bloqueada) fuera del repositorio o en `docs/operaciones/` si no muestran datos personales, con la fecha.
6. Avise a la Jefatura de Proyecto para marcar la condición 10 de D-064 como cumplida en `docs/equipo/puerta-etapa-0.md`.

**Si algo falla:** el nombre de la revisión que se exige debe ser exactamente `Documentos en regla`; un cambio de nombre en el archivo `.github/workflows/documentos.yml` obliga a repetir el paso B. Ayuda oficial: `https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`.

### 3.9 Carga nocturna desde la Etapa 4 (D-056, S-19, RNF-011)

Nace en la Etapa 4 como `.github/workflows/nocturna.yml` (hoy **no existe**; no se crea antes porque no hay nada que medir).

1. **Cuándo:** una vez cada noche y a pedido, nunca en la revisión de cada cambio (tarda demasiado).
2. **Qué hace:** levanta el entorno desechable (1.9) con el perfil `volumen` (1.11) y mide, con base real: (a) el 95 % de listas y búsquedas por debajo de **2 segundos**; (b) confirmar una recepción de **100 series** por debajo de **5 segundos** (RNF-011); (c) concurrencia con **50 conexiones**; (d) migraciones con volumen; (e) importación de 5.000 filas.
3. **Qué guarda:** un informe de cifras por corrida (artefacto de 90 días) y una línea de tendencia con las últimas 7 corridas.
4. **Qué cuenta como fallo:** pasar el umbral de RNF-011, **o** empeorar más de **20 %** frente a la mediana de las últimas 7 corridas (cifra propuesta; QA la ajusta). Un fallo avisa por correo a quien recibe las alertas (D-059.1) y a QA; **no bloquea** cambios nuevos, pero la Jefatura no cierra la etapa con fallos abiertos.
5. **Lo que no certifica:** la máquina del robot es más pequeña que producción. Las cifras que se usan para **certificar** RNF-011 se toman en la base permanente de pruebas (1.3), la más parecida a producción; el robot detecta empeoramientos.
6. **Costo:** minutos del robot. Si el perfil `volumen` no cabe en una máquina estándar de GitHub, la alternativa es correrlo en el entorno de pruebas permanente; una máquina más grande del robot es un gasto que va al CEO. Precio a verificar (9.5).

---

## 4. Despliegue, reversa y migraciones

### 4.1 Cómo se publica

Plataforma: servicio de contenedores de ejecución continua (sección 2; el proveedor concreto se decide con precios verificados). Por cada versión:

1. **Etiqueta de versión** (por ejemplo `v0.4.0`) y notas breves en español claro de qué cambia.
2. **Revisión automática en verde** (sección 3) y publicación automática en **pruebas**.
3. **Pruebas de humo en pruebas** y revisión de QA en lo que toque datos, accesos o permisos.
4. **Ficha de versión** rellenada (4.3), incluido el plan de reversa de **esa** versión.
5. **Aprobación de la Jefatura de Proyecto** (límite de mi rol). El primer uso con datos reales requiere además la del CEO (RNF-018).
6. **Aviso de mantenimiento** si hay pausa (RNF-012).
7. **Respaldo inmediatamente anterior** y comprobación de que terminó bien.
8. **Migración** (4.2) y luego **publicación de la aplicación y del trabajador juntos**, desde la misma imagen.
9. **Pruebas de humo en producción:** entrar, ver la pantalla de inicio, una consulta, la prueba de aislamiento con las dos empresas de control, que llegue un correo de acceso, **que el trabajador esté vivo y que la cola baje**.
10. **Cierre** en el registro de publicaciones (fecha, versión, quién, resultado). Si algo falla en los primeros 30 minutos, se decide la reversa.

**Ventanas:** no se publica un viernes por la tarde ni la víspera de un feriado, salvo corrección urgente aprobada por la Jefatura.

### 4.2 Migraciones controladas

Las escribe y revisa el Ingeniero de Datos; DevOps las ejecuta.

- **Nunca automáticas en producción.** Las ejecuta un paso aparte con el rol `migraciones`, que solo existe en el proceso de publicación.
- **Primero en pruebas**, con volumen y sobre datos existentes, no solo desde cero.
- **Regla "ampliar y luego limpiar":** una migración compatible con la versión anterior de la aplicación y del trabajador (agrega, no quita). Lo que quita o renombra va en una publicación posterior. Así volver a la versión anterior casi siempre es posible sin tocar los datos. **La regla incluye el formato de los trabajos de la cola**: un trabajo escrito por la versión nueva debe poder leerlo la anterior mientras convivan.
- **Destructivas** (quitar columna, cambiar tipo con datos): aprobación escrita de Datos, QA y Jefatura, y respaldo comprobado justo antes. Recordar D-019.
- **Largas:** se prueban con el volumen de 100.000 activos; si bloquearían más de unos segundos, se diseñan por partes.
- **Las que afectan el aislamiento o la auditoría** (D-018, D-039): revisión adicional de Seguridad.

### 4.3 Ficha de versión y plan de reversa

| Campo | Qué se escribe |
|---|---|
| Versión y fecha | |
| ¿Incluye migración? ¿De qué tipo? | Compatible (solo agrega) / Destructiva |
| **¿Cambia el trabajador o la cola?** (nueva, a pedido de QA) | Sí / No; si sí, ¿es compatible con trabajos ya encolados? |
| **¿Incluye migración probada con volumen sobre datos existentes?** (nueva) | Sí / No, con evidencia |
| **¿Se corrieron los procesos diarios con dos empresas?** (nueva) | Sí / No, con evidencia |
| Reloj de prueba apagado en producción; correo en modo `proveedor` | Sí / No |
| Respaldo previo | Identificador y comprobación |
| **Cómo se vuelve atrás la aplicación y el trabajador** | Volver a publicar **la imagen anterior de los dos servicios** (verificar que el alojamiento elegido lo permita con un clic) |
| **Cómo se vuelve atrás la base de datos** | Si la migración fue compatible: no hace falta. Si fue destructiva: restaurar desde el respaldo previo **con pérdida de lo escrito después**, decide la Jefatura |
| Hasta cuándo se puede decidir la reversa | Mientras no haya escrituras que se perderían; después, solo corrección hacia adelante |
| Quién decide | Jefatura de Proyecto; DevOps ejecuta |
| Cómo se comprueba que quedó bien | Las pruebas de humo (4.1, paso 9) |
| Mensaje a los usuarios si hay interrupción | Texto corto preparado |

**La reversa se practica:** en pruebas, antes de la Etapa 1, un ensayo de "publicar, fallar a propósito, volver atrás" con cronómetro (D-064 condición 11), repetido antes de cada etapa con uso real.

### 4.4 Quién puede publicar

| Acción | Quién | Condición |
|---|---|---|
| Unir un cambio a la rama principal | Cualquier desarrollador | Revisión automática en verde y aprobación de otra persona |
| Publicar en pruebas | Automático | Tras unir a la rama principal |
| Publicar en producción | **Solo DevOps**, con permiso de la Jefatura de Proyecto | Ficha completa y aprobación. Con datos reales por primera vez: también el CEO |
| Ejecutar una migración en producción | Solo DevOps, dentro de la publicación | Ver 4.2 |
| Entrar directo a la base de producción | Nadie de forma rutinaria (D-003) | Solo emergencia: lo aprueba la Jefatura, dura poco, queda en un registro de accesos de emergencia con motivo y se avisa a Seguridad |
| Usar el rol `mantenimiento` (purgas) | DevOps con **dos personas autorizadas** (D-030.8) | Nada hasta que legal confirme los plazos (D-033.4, D-024) |
| Cambiar claves y variables de producción | DevOps | Aprobación de la Jefatura y registro |

Las cuentas dueñas del alojamiento, la base de datos y el dominio van **a nombre de la empresa**, con al menos dos personas con acceso, ambas con segunda verificación (D-064 condición 9).

---

## 5. Respaldos, restauración, copia externa de la auditoría y registro de anonimizaciones

### 5.1 Qué se respalda y por cuánto tiempo (D-032, D-052)

| Capa | Qué es | Frecuencia | Dónde | Retención |
|---|---|---|---|---|
| **1. Respaldo del proveedor de la base** | Copias automáticas del servicio; algunos planes permiten volver a un momento exacto ("recuperación a un punto en el tiempo") | Continuo o diario según el plan | En el proveedor | La que ofrezca el plan (verificar) |
| **2. Respaldo propio, cifrado y en otro lugar** | Copia completa hecha por un trabajo programado nuestro | **Diario**, más uno **justo antes de cada publicación con migración** | **Otro proveedor y otra cuenta** | **30 diarios y 12 mensuales** (D-032.1) |

- **Cifrado antes de salir** con `BACKUP_ENCRYPTION_KEY`, que no está en el proveedor de la copia y se respalda aparte (6.3).
- **Por qué 30 + 12 y no años:** el respaldo sirve para recuperarse de un error reciente. Guardar copias más tiempo mantendría datos personales ya anonimizados. Un dato anonimizado puede seguir existiendo en respaldos hasta 12 meses; **se declara en el aviso de privacidad** (D-032.2). **Pendiente de confirmación legal** (L-04). **[ESCALAR AL CEO]** por ser tema legal y de costo.
- **Objetivos provisionales (D-052.1):** pérdida máxima aceptable de datos (RPO) 24 horas, menos si el plan permite recuperación a un punto en el tiempo; tiempo máximo para volver a funcionar (RTO) 4 horas en horario laboral.
- La **auditoría de 5 años vive en el sistema y no depende de los respaldos** (D-032.4).
- **Respaldo de lo que no es la base:** configuración de entornos y listas de accesos (en documentos, sin secretos) y las **llaves** (6.3), que se respaldan por una vía distinta.

### 5.2 Restauración probada: qué se hace, en qué orden y qué se comprueba

Un respaldo que nunca se restauró no es un respaldo. **Calendario (D-052.6):** antes de la Etapa 1, antes de cada etapa que pase a uso real, y una vez al mes en producción (con una copia diaria elegida al azar).

**Orden obligatorio de una restauración** (D-052.4, RS-49) — el sistema **no se abre a los usuarios** hasta terminar:

1. Restaurar la copia en una **base aislada, cerrada a los usuarios**.
2. **Reaplicar el registro de anonimizaciones** (5.4): nadie anonimizado reaparece.
3. **Revocar todas las sesiones y todos los enlaces** de ingreso e invitaciones pendientes.
4. **Rotar las claves de API.**
5. **Reaplicar suspensiones, bajas y cambios de rol** posteriores al respaldo, leyéndolos de la **auditoría que vive aparte** (la copia externa, 5.3), no de la base restaurada, que es tan vieja como el respaldo. Esto hace que la copia externa deba estar completa hasta una hora antes del incidente (copia cada hora).
6. **Comprobaciones:** (a) cantidad de registros por tabla y por empresa dentro de lo esperado; (b) **la prueba de aislamiento entre empresas pasa sobre la base restaurada** (RS-44); (c) la auditoría restaurada coincide con la copia externa; (d) las claves de licencia se descifran con la llave guardada aparte (prueba de que el respaldo de llaves sirve, D-048.4); (e) el tiempo que tomó, comparado con el RTO.
7. Recién entonces se abre el sistema.

**Restaurar a una sola empresa:** el caso más probable no es "se perdió todo" sino "una empresa se equivocó y quiere volver a ayer". Restaurar toda la base borraría el trabajo de las demás ese día. La herramienta de **exportar/importar una empresa** (D-052.5, H-ARQ-25) recorre el catálogo y mueve las filas por empresa; **Datos y DevOps la entregan antes de la primera empresa real**. Hasta entonces, el plan de emergencia es restaurar completo con aprobación del CEO. La prueba de restauración parcial se hace en una base de ensayo antes de cada etapa con uso real.

#### Guion del ensayo de restauración con RS-49 (con cronómetro)

Se corre en el entorno de pruebas con el perfil `completo` (1.11); una vez antes de la Etapa 7, con el perfil `volumen`. Evidencia para CA-053, CA-054c y D-064 condición 11.

**Preparación (antes del "desastre"):**
1. Anonimizar a la Persona canario (queda su intención en el registro externo, 5.4).
2. Tomar el respaldo **R1** y anotar su identificador.
3. **Después de R1,** a propósito: dejar una sesión abierta, un enlace de ingreso y una invitación sin usar, y una clave de API activa; suspender al usuario U1, cambiar el rol de U2, dar de baja a U3; anonimizar a otra Persona (P2).
4. Forzar o esperar la copia externa de auditoría, para que contenga esos cambios.
5. "Desastre": borrar la base.

**Ensayo (el cronómetro corre desde el aviso hasta abrir el sistema):**

| Paso | Qué se hace | Cómo se comprueba que quedó bien | Quién |
|---|---|---|---|
| 1 | Restaurar R1 en una base aislada y cerrada | Ninguna conexión de usuarios llega a ella; la aplicación está en modo mantenimiento | DevOps |
| 2 | Reaplicar el registro de anonimizaciones | La Persona canario **y P2** (anonimizada después de R1) aparecen anonimizadas; el nombre canario no se encuentra en ninguna tabla, exportación ni correo | DevOps, Datos |
| 3 | Revocar sesiones, enlaces e invitaciones pendientes | Cero sesiones válidas; el enlace y la invitación del punto 3 son rechazados | DevOps |
| 4 | Rotar las claves de API | La clave de API del punto 3 es rechazada; se emite una nueva | DevOps |
| 5 | Reaplicar bajas, suspensiones y cambios de rol **leyendo la copia externa** | U1 sigue suspendido, U2 tiene el rol nuevo, U3 sigue dado de baja; ninguno recupera acceso | DevOps, Seguridad |
| 6 | Comprobaciones: cantidades por tabla y empresa; **aislamiento A/B como `app_empresa`**; auditoría restaurada contra la copia externa; clave de licencia descifrada con la llave guardada aparte | Todas pasan; tiempo medido contra el RTO de 4 horas (en el ensayo con datos de prueba, meta 1 hora para `completo`; `volumen` solo se mide) | QA, DevOps |
| 7 | Abrir el sistema a los usuarios | **Un intento de entrar antes de este paso falla;** después entra una persona de prueba | Jefatura de Proyecto autoriza |

**Registro:** fecha, quién, tiempo de cada paso, identificador de R1 y resultado de cada comprobación, en `docs/operaciones/` (sin claves ni datos personales). Si cualquier comprobación falla, el ensayo se repite completo después de corregir; no se declara "pasado" con excepciones.

### 5.3 Copia externa del registro de auditoría (el riesgo del superusuario)

**El problema, en simple.** D-018 hace que la aplicación no pueda modificar ni borrar la auditoría. Pero en cualquier base existe una cuenta con poder absoluto (el "superusuario"); esa cuenta puede alterar cualquier fila sin pasar por la aplicación. **No se puede eliminar ese poder; se puede lograr que cualquier alteración quede al descubierto** (D-052.2, RF-AUD-018).

**Qué hacemos:**

1. **Copia cada hora, solo de agregar**, a almacenamiento externo de **otro proveedor y otra cuenta**, configurado para que no se pueda modificar ni borrar durante el plazo de retención ("inmutable" o de "una sola escritura"; verificar qué proveedores lo ofrecen).
2. **Encadenado:** cada archivo lleva una huella calculada con su contenido **y la huella del archivo anterior**. Si alguien cambia o borra una entrada vieja, todas las huellas posteriores dejan de coincidir. La clave de firma (`AUDIT_COPY_SIGNING_KEY`) **no está en la base de datos**.
3. **Verificación semanal** (diaria si se puede): se recalculan las huellas con lo que hay hoy en la base y se comparan con la copia externa. **Si no coinciden, alerta inmediata** a Seguridad y a la Jefatura.
4. **Cuentas separadas:** el trabajo de copia usa `lector_auditoria` (solo lee) y una credencial de **solo agregar** al almacenamiento; quien verifica tiene la credencial de lectura de la copia, e **idealmente no es quien administra la base de producción**.
5. **Ensayo de manipulación (a pedido de QA, CA-040b):** en pruebas, un guion usa el rol dueño para alterar una entrada de auditoría y comprueba que la verificación **da alarma**; otro intenta borrar un archivo de la copia (en un depósito de pruebas con bloqueo corto) y comprueba que **se rechaza**. Se corre antes de cada etapa con uso real.

**Límites honestos:** no impide que un superusuario altere la base; lo hace **detectable**. Lo alterado en la hora entre dos copias, antes de copiarse, no queda protegido (se puede acortar el intervalo). Se reduce además con medidas humanas: pocas personas con acceso total, segunda verificación, y que el proveedor registre quién usó cuentas de alto poder (verificar que el plan lo incluya).

**Decisiones de otros:**
- **Modo de bloqueo** (estricto, o con borrado bajo orden legal): lo decide Cumplimiento con legal (D-052.2). Como D-030 ya impide que la auditoría guarde datos personales por valor, el conflicto con la anonimización se reduce; el **registro de seguridad** (IP, intentos fallidos, 12 meses) tiene otro plazo y **no debe ir a la copia de 5 años** sin que se decida.
- **Retención de la copia:** la misma que la auditoría (5 años, D-024, pendiente de legal).
- **Purga:** el rol `mantenimiento` borra por partición a los 5 años; la copia externa debe tener bloqueo que **venza** a ese mismo plazo, no antes ni mucho después.

#### Guion del ensayo de manipulación de la copia externa (CA-040b)

Prueba **CA-040b** (copia externa y plazo de 5 años, Etapa 7). La parte que dice que la aplicación no puede editar ni borrar la auditoría (**CA-040a**, Etapa 1) corre en cada cambio dentro de las pruebas con base real (3.1, paso 7), no en este ensayo. Se corre **en miniatura antes de la Etapa 1** (depósito de pruebas con bloqueo corto y llaves de pruebas), **antes de cada etapa con uso real** y **una vez por trimestre** en producción (solo la parte de verificación, sin alterar nada real).

| # | Acción del ensayo (en pruebas) | Resultado que debe verse |
|---|---|---|
| 1 | Generar auditoría y esperar tres copias encadenadas (o forzarlas) | Tres archivos con huellas encadenadas; la verificación da "sin diferencias" |
| 2 | Con el rol dueño **de pruebas,** modificar el texto de una entrada de hace dos horas | La verificación da **alarma** que indica el archivo y la hora de la entrada |
| 3 | Restaurar la entrada y borrar otra entrada vieja | La verificación da alarma otra vez (falta una entrada) |
| 4 | Intentar borrar un archivo de la copia con la credencial de solo agregar | **Rechazado** |
| 5 | Intentar borrar o reescribir un archivo dentro del plazo de bloqueo con la credencial administradora del depósito de pruebas | **Rechazado** por el bloqueo; si el proveedor lo permitiera, la huella encadenada lo delata y el hallazgo va a la selección de proveedor (9.2, rubro 4) |
| 6 | Medir cuánto pasa entre la alteración y la alarma | Dentro del intervalo de verificación definido (diaria si se puede, semanal como máximo) |
| 7 | Dejar la base como estaba y registrar tiempos y capturas | Registro en `docs/operaciones/`; la alarma llegó a Seguridad y a la Jefatura de Proyecto |

El ensayo falla si cualquiera de las alteraciones pasa sin alarma. La Etapa 7 no se cierra sin tener este ensayo en verde con el depósito y las credenciales **definitivas.**

### 5.4 Registro de anonimizaciones (D-032.3, D-052.3, RF-DAT-016)

**Qué es:** una lista que guarda **solo el identificador de la persona y la fecha** de cada anonimización (sin datos personales). **Dónde:** en un **almacén propio, fuera de la base que se restaura**, sin rotación y replicado, para que sobreviva a una pérdida total. Si viviera en la misma base, al restaurar un respaldo retrocedería con ella y se perdería justo lo que debía reaplicarse (H-ARQ-03).

**Cómo lo opero:**
- **Un almacén de objetos aparte** (un depósito propio, distinto del de respaldos y del de la copia de auditoría), con versiones y bloqueo contra borrado, y **replicado en una segunda ubicación**. Credenciales propias (`ANON_REGISTRY_*`): la aplicación **solo agrega**; la lectura es del procedimiento de restauración.
- **Existe desde la Etapa 2**, antes de la primera anonimización (RF-DAT-016), aunque la anonimización automática siga **apagada** hasta que legal confirme (D-033.4).
- **Reconciliación nocturna:** un trabajo compara los eventos de anonimización de la base con el registro externo y da alarma si falta alguno.
- **Se prueba en cada restauración de ensayo:** se anonimiza a una persona, se restaura un respaldo anterior y se comprueba que no reaparece (CA-053).

**Pregunta a Datos y Arquitecto:** como el registro está fuera de la base, no se puede escribir en la misma transacción. Propongo **escribir primero la intención en el registro externo (idempotente) y después sobrescribir el registro de la persona**, de modo que reaplicar sea siempre inofensivo; y que una anonimización de la que solo hay intención se vea en la reconciliación. Que lo diseñen ellos.

### 5.5 Procedimientos escritos

Antes de producción quedan en `docs/operaciones/` (RNF-016): respaldo manual, restauración completa con el orden de 5.2, rescate de una sola empresa, verificación de una restauración, verificación de la copia de auditoría, reinicio del trabajador y quién avisa a quién. Cada uno con **tiempos medidos** en el ensayo, no estimados.

---

## 6. Secretos y llaves

### 6.1 Reglas

1. **Ningún secreto en el repositorio**, ni en código, archivos de ejemplo, mensajes de cambios ni documentación (CLAUDE.md, regla 4; RS-40). La revisión automática lo vigila.
2. El repositorio contiene solo `.env.example` (nombres, valores de relleno). El `.env` real está en `.gitignore`.
3. Los secretos reales viven en el almacén del alojamiento (separados por entorno) y en los secretos de GitHub para la revisión automática. Las **llaves maestras** (6.3) tienen además respaldo en un gestor de contraseñas del equipo con acceso compartido controlado.
4. **Cada entorno tiene sus propias claves.**
5. Los secretos nunca aparecen en registros técnicos, errores ni auditoría; los enlaces de acceso tampoco. Una prueba automática los busca (D-048.4). Los valores que sirven para entrar (enlaces, invitaciones, sesiones, códigos de recuperación) se guardan **solo como huella** (RS-51).
6. **Rotación:** al irse una persona, ante sospecha y al menos una vez al año. Debe poder hacerse **sin interrumpir el servicio** (se acepta la nueva antes de retirar la vieja).
7. Un secreto publicado por error se considera comprometido: se rota de inmediato y se anota; no basta con borrarlo.

### 6.2 Variables previstas (están en `/.env.example`; el Arquitecto confirma los nombres)

| Variable | Para qué | Quién la usa |
|---|---|---|
| `ENTORNO`, `APP_URL`, `LOG_LEVEL` | Modo de funcionamiento y dirección pública | Todos |
| `DATABASE_URL` | Rol `app_empresa` por el agrupador | La aplicación |
| `WORKER_DATABASE_URL` | Rol `app_empresa` por conexión directa | El trabajador |
| `PLATFORM_DATABASE_URL` | Rol `app_plataforma` | La consola de plataforma |
| `MIGRATION_DATABASE_URL` | Rol `migraciones` | Solo el paso de publicación |
| `MAINTENANCE_DATABASE_URL` | Rol `mantenimiento` | Procedimiento de purga (dos personas) |
| `AUDIT_READER_DATABASE_URL` | Rol `lector_auditoria` | Trabajo de copia y de verificación |
| `AUTH_SECRET` | Firmar sesiones y enlaces | La aplicación |
| `MASTER_ENCRYPTION_KEY` y `..._VERSION` | Llave maestra (antes `FIELD_ENCRYPTION_KEY`) | La aplicación (ver 6.3) |
| `BACKUP_ENCRYPTION_KEY` | Cifrar los respaldos | Trabajo de respaldo |
| `EMAIL_TRANSPORT`, `EMAIL_CAPTURE_URL`, `EMAIL_API_KEY`, `EMAIL_FROM`, `EMAIL_BACKUP_API_KEY` | Correo: captura o proveedor, y segundo proveedor | La aplicación y el trabajador |
| `BACKUP_STORAGE_*` | Escribir respaldos en el almacén externo | Trabajo de respaldo |
| `AUDIT_COPY_*` (escritura, firma, lectura) | Copia externa de la auditoría | Trabajo de copia (escritura) / Seguridad (lectura) |
| `ANON_REGISTRY_*` | Registro de anonimizaciones | La aplicación (agregar) / restauración (leer) |
| `ERROR_MONITORING_DSN`, `HEARTBEAT_URL_*` | Vigilancia y latidos | Aplicación, trabajador y trabajos |
| `CRON_SECRET` | Proteger los disparos manuales | Pruebas |
| `TEST_CLOCK_ENABLED`, `TEST_CLOCK_FIXED_AT` | Reloj de prueba | Solo desarrollo y pruebas |

**"Cuenta separada para la auditoría" ahora significa:** (1) en la base, la aplicación solo puede **agregar** a la auditoría (`app_empresa`); (2) un rol aparte de **solo lectura** (`lector_auditoria`); (3) una **cuenta de almacenamiento externo** distinta de la del alojamiento, con credenciales de solo agregar para el trabajo y de lectura para quien verifica; y (4) el rol `mantenimiento`, que es el único que puede borrar y solo por partición.

### 6.3 Llaves de cifrado (D-048.4, RS-46)

- **Una llave maestra fuera de la base y fuera de los respaldos.** Vive en el almacén de secretos del alojamiento (o en el gestor de secretos que se elija) y **nunca** en la base, el código ni las copias. Así, quien se llevara la base o un respaldo no se lleva con qué abrirla.
- **Llaves derivadas por empresa** (claves de licencia, secretos de webhook) **y por usuario** (la semilla de la segunda verificación, porque la cuenta es global). Se derivan de la maestra: no son archivos que haya que guardar una por una.
- **Cifrado con versiones:** puede haber varias versiones activas a la vez, para **rotar la llave una vez al año o ante sospecha**, con recifrado por lotes sin detener el servicio.
- **Respaldo de las llaves por separado, en dos lugares distintos y con al menos dos custodios** (dos personas, para que no dependa de una sola). **Una restauración de ensayo comprueba que la llave guardada abre la copia** (5.2, paso 6d).
- **Por qué importa:** si la llave maestra se pierde, **las claves de licencia no se pueden recuperar ni con el mejor respaldo**; si se filtra junto con la base, quedan expuestas. `BACKUP_ENCRYPTION_KEY` es distinta de la maestra: perderla vuelve inservibles los respaldos propios.
- **Quién custodia:** decisión de la Jefatura con el CEO (pedido B). Se anota en un acta, sin escribir las llaves.

### 6.4 Cuentas de la plataforma (D-048.5)

- **Llave de seguridad física** (un dispositivo del tamaño de una memoria USB que se toca para entrar) para las cuentas de Administrador de plataforma: **al menos dos personas de plataforma antes de datos reales** (pedido de Seguridad) y una llave de repuesto por persona, guardada aparte.
- **Códigos de recuperación fuera de línea, con dos custodios.**
- **Acceso a la consola de plataforma desde una red restringida:** lo configuro yo. Propongo que la consola viva en **una dirección propia** (por ejemplo `plataforma.…`, separada de la de las empresas) protegida **antes de llegar a la aplicación** con una lista de direcciones permitidas o un túnel de acceso privado (verificar costo, 9). Requiere que los administradores de plataforma tengan una dirección fija o una conexión privada. Lo decide Seguridad.
- **Registros:** el "de plataforma" (crear, suspender, rescatar empresas) y el "de empresa" (todo lo que soporte vio o hizo) son del Arquitecto; yo me ocupo de que las credenciales de plataforma no estén en el mismo lugar que las de producción de la base.


### 6.5 Las 8 condiciones de Seguridad sobre las llaves: cuándo, quién y qué evidencia

Fuente: `docs/revision-cruzada/ronda4-especialista-seguridad.md`, sección 2. Seguridad aprobó la estrategia de la sección 6.3 **con estas condiciones**: la 1 y la 2 antes de la Etapa 1; la 3, 4, 5 y 7 antes de cargar datos reales; la 8 en la Etapa 2; la 6 en la Etapa 7.

| # | Condición (resumen) | Cuándo | Responsable | Qué entrega DevOps o cómo se comprueba | Estado hoy |
|---|---|---|---|---|---|
| 1 | Derivación escrita de llaves (función estándar, contexto fijo por tipo y por empresa o usuario, versión en cada valor cifrado, nunca la misma llave para dos fines) | **Antes de la Etapa 1** (antes de la primera tabla con campo cifrado) | Arquitecto (ADR T-5) | Yo reviso que las variables de 6.2 cubren lo que el ADR pida y que la versión de la llave es una variable por entorno. La prueba del ADR la corre la revisión automática | Pendiente: los ADR se están escribiendo |
| 2 | **La llave maestra de producción no existe** en la revisión automática, en pruebas ni en desarrollo; cada entorno usa llaves propias; el repositorio solo trae valores de relleno | **Antes de la Etapa 1** | DevOps | (a) Las llaves de la revisión automática se **generan al azar en cada corrida**; (b) la llave de pruebas se genera aparte y vive solo en el almacén de pruebas; (c) la de producción se crea el día que haya datos reales y solo en su almacén; (d) una **lista de huellas cortas** (primeros 8 caracteres del resumen de cada llave, nunca la llave) por entorno, para comprobar que no se repiten entre entornos; (e) la plataforma se niega a arrancar en producción con la llave de relleno (1.1, regla 5); (f) la búsqueda de secretos (3.7) cubre el repositorio | `.env.example` ya trae relleno; falta crear los almacenes (depende de la elección de proveedor, 9) |
| 3 | **Dos custodios** nombrados por escrito (acta, sin escribir las llaves), que **no sean las dos únicas personas administradoras de la plataforma** a la vez; el Administrador de plataforma **no tiene acceso al almacén de secretos** | Antes de datos reales | CEO designa (pedido G); DevOps ejecuta | Acta firmada y lista de accesos al almacén de secretos donde **no figura ningún administrador de plataforma**; revisión trimestral de esa lista (O-15) | Pendiente del CEO |
| 4 | El **respaldo de las llaves** en un gestor de contraseñas de equipo, con segunda verificación por custodio y registro de accesos, es **uno** de los dos lugares; el otro es físico o un almacén distinto del alojamiento | Antes de datos reales | DevOps | Gestor con 2F obligatorio y registro de accesos activado; **segundo lugar físico:** copia en medio no electrónico o cifrada fuera de línea, sellada, en un sitio distinto, que solo se abre con los dos custodios presentes y queda anotado; la restauración de ensayo prueba que el respaldo sirve (5.2, paso 6) | Pendiente: gasto del gestor en rubro 7 de 9.2 |
| 5 | **Ensayo de pérdida y de filtración** de la llave maestra; debe quedar escrito qué se pierde y que **rotar la maestra completa toma menos de 4 horas** con datos de prueba | Antes de datos reales | DevOps, Seguridad | Guion y cronómetro en 6.7 | Plan escrito; falta ejecutar |
| 6 | La llave en la memoria de la aplicación es el punto débil conocido: nunca se imprime, no está en volcados de error, el trabajador y la web la leen al arrancar y no la guardan en la base; evaluar un servicio de llaves gestionado | **Etapa 7** | Arquitecto, DevOps | Prueba con una **llave canaria de pruebas**: se busca en registros técnicos, reportes y volcados de error de prueba (el filtro de 8.1 la elimina); en la Etapa 7 comparo el costo y la operación del servicio gestionado del proveedor elegido y lo llevo al Arquitecto y a Seguridad | Pendiente (Etapa 7) |
| 7 | **Rotación anual** con calendario y alerta, y rotación inmediata de lo expuesto; la de `AUTH_SECRET` cierra sesiones y enlaces y se anuncia | Desde que haya datos reales | DevOps | Fecha de creación de cada llave en el registro de vencimientos (8.1) con alerta 60 y 30 días antes; procedimiento de rotación sin cortar el servicio (se acepta la nueva antes de retirar la vieja, 6.1 punto 6); aviso a los usuarios preparado para `AUTH_SECRET` | Plan escrito |
| 8 | **Prueba automática** de que ningún valor cifrado, llave ni secreto aparece en la base en claro, en la auditoría, en los registros ni en exportaciones, y de que `app_plataforma` no lee columnas cifradas | **Etapa 2** (campo secreto) | QA, Arquitecto | Yo agrego la prueba como paso de la revisión automática (3.1, paso 7) y de la nocturna, con la llave canaria de la condición 6 | Pendiente (Etapa 2) |

### 6.6 Llaves de seguridad físicas para los administradores de plataforma

- **Qué son:** un dispositivo pequeño que se toca para entrar (estándar FIDO2/WebAuthn, el que ya entienden los navegadores actuales). Sin batería ni programa que instalar. El tipo de conector (USB-A, USB-C o por aproximación) se elige según los computadores y celulares de cada administrador.
- **Cuántas:** **dos por administrador de plataforma** (una de uso diario y una de repuesto guardada en otro lugar). Con dos administradores, cuatro; con tres, seis. Compra única por unidad; precio a verificar (9.5). **[ESCALAR AL CEO]** (pedido F).
- **Cuándo:** antes de cargar datos reales, y siempre dos personas de plataforma como mínimo (D-073.1). Con datos inventados, el ingreso con llave se prueba con una **llave virtual** del navegador en las pruebas automáticas, así que no hace falta comprar nada para empezar.
- **Alta:** cada persona registra las dos llaves **el mismo día y en persona**, comprobando que cada una abre la cuenta. En la lista de accesos se anota quién tiene cuál (por la etiqueta, nunca un secreto) y dónde se guarda la de repuesto.
- **Pérdida o robo:** se retira esa llave con la otra, o con los códigos de recuperación fuera de línea (con dos custodios, 6.4); si ya no queda ninguna, entra el rescate de plataforma (RF-PLA-003, que exige a otra persona). Se anota como incidente y se repone la llave en 5 días hábiles.
- **Salida de una persona:** se retiran sus llaves de la cuenta el mismo día (O-15); la llave física no se reasigna a otra persona sin volver a registrarla.
- **Alcance de la compra:** las llaves cubren primero las cuentas de plataforma. Extender el mismo mecanismo a las cuentas de infraestructura (GitHub, alojamiento, base de datos, DNS, almacenes, gestor de contraseñas) es recomendable; sumaría dos llaves por persona y se presenta aparte al CEO.

### 6.7 Ensayo de pérdida y de filtración de la llave maestra (Seguridad, condición 5)

Se corre en pruebas, con el perfil `completo` (1.11) y claves de licencia, secretos de webhook y semillas de segunda verificación cargados de prueba, antes de cargar datos reales y después ante cualquier cambio del esquema de cifrado.

| Escenario | Qué se hace | Qué se espera | Se anota |
|---|---|---|---|
| **A. Se perdió la llave maestra** | Quitar la llave maestra de pruebas del almacén y reiniciar | La plataforma **se niega a arrancar** (no arranca con llave faltante ni de relleno). Se crea una llave nueva (versión 2) y se vuelve a arrancar | Qué no se recupera: **claves de licencia y secretos de webhook** (se vuelven a cargar o a generar); las semillas de la segunda verificación se rehacen: cada persona se **reenrola con su código de recuperación**, que es una huella y no depende de la llave. Tiempo hasta servicio normal |
| **B. Se filtró la llave maestra** | Crear la versión 2, dejarla como activa para cifrar y **recifrar por lotes** en segundo plano todo lo cifrado con la versión 1; retirar la versión 1; rotar también lo que se derivó de ella | **Sin detener el servicio:** el recifrado corre mientras se usa la plataforma; al final no queda ninguna fila con la versión 1, la versión 1 ya no descifra y la rotación consta en la auditoría | **Tiempo total, que debe ser menor de 4 horas** con los datos de prueba. Si no cumple, se optimiza antes de datos reales |

Comprobaciones al cerrar: descifrado de una muestra de cada tipo con la versión 2; ninguna fila con la versión 1; el respaldo cifrado con `BACKUP_ENCRYPTION_KEY` (distinta de la maestra) sigue restaurando; el procedimiento de incidente (D-059, contención en 1 hora) cita este ensayo. Firman Seguridad y DevOps; el registro, con tiempos, va a `docs/operaciones/`.

---

## 7. Correo transaccional

### 7.1 Por qué importa tanto

El acceso es por un enlace que llega al correo (D-002). Si no llega, **nadie entra**, ni el Administrador. Además el enlace dura **15 minutos** (S-01) y abre una página con un botón "Entrar" atado al navegador que lo pidió (D-054.3): un correo que tarda 20 minutos equivale a uno que no llega. Es el riesgo #9. En la v1 los correos son **invitación, acceso y aviso de aprobación** (D-013.10, D-061.4); los avisos de entregas, altas y bajas no entran a la v1.

### 7.2 Criterios para elegir proveedor

| # | Criterio | Qué buscamos | Cómo se comprueba |
|---|---|---|---|
| 1 | **Entrega a Gmail y Outlook** | Llegan a la bandeja de entrada, no a spam, en Gmail personal, Google Workspace, Outlook/Hotmail y Microsoft 365 | Matriz de entrega (7.3) |
| 2 | **Velocidad** | Casi siempre menos de 1 minuto, nunca cerca de los 15 del enlace | Medir hora de envío contra hora de llegada |
| 3 | **Dominio verificado** | SPF, DKIM y DMARC con un subdominio de envío propio (`avisos.` o `acceso.`) para proteger la reputación del correo normal | Encabezados en "pass" y alineados |
| 4 | **Límites de envío** | El plan cubre con margen los topes de D-054.2: 5 enlaces por correo por hora y 10 por día, 20 invitaciones por administrador por hora y 100 por empresa por día, **hasta 1.000 correos por día por empresa**, con **cupo propio para los obligatorios** (invitación, acceso, `compras.orden_por_aprobar`). Con pocas empresas el volumen es bajo; el límite que importa es el tope del plan gratuito, si lo hay | Comparar el tope del plan con el volumen (P-003 pendiente) |
| 5 | **Rebotes y quejas** | Los entrega por llamada automática, para "3 rebotes seguidos = no entregable" (RF-NOT-022) | Documentación |
| 6 | **Sin seguimiento de clics** | Debe poder **apagarse**: reescribe los enlaces y puede invalidar o filtrar uno de un solo uso | Configuración |
| 7 | **Sin guardar el contenido** | No conserva el cuerpo de los correos (contiene el enlace de acceso; D-018.5, RN-NOT-016) o permite apagarlo / acortarlo | Documentación y configuración |
| 8 | **Resistencia a filtros que abren los enlaces** | El enlace no se gasta cuando un filtro de seguridad de la empresa (por ejemplo, protección de enlaces de Microsoft 365) lo abre antes que la persona | Prueba (7.3, punto 5) |
| 9 | **Estado público del servicio** | Página de estado y avisos de fallas | Revisar historial reciente |
| 10 | **Región y contrato** | Dónde se procesan los datos y qué contrato ofrece (L-07, L-08) | Lo valida legal |
| 11 | **Costo** | Acorde al volumen, sin sorpresas | Página de precios, a verificar |
| 12 | **Un segundo proveedor posible** | La aplicación envía por **una sola capa de envío** con un adaptador por proveedor (T-12, aprobado) | Diseño del Arquitecto; yo lo pruebo |

### 7.3 Pruebas antes de decidir (D-064 condición 6)

1. Abrir la cuenta (gratuita o de entrada) de **dos candidatos** y verificar el subdominio de prueba con SPF, DKIM y DMARC.
2. **Matriz de entrega:** 20 envíos a cada tipo de buzón (Gmail personal, Google Workspace, Outlook/Hotmail, Microsoft 365, uno con filtros estrictos), a distintas horas. Anotar bandeja o spam y tiempo.
3. Revisar encabezados: SPF, DKIM y DMARC en "pass".
4. Verificar que no sigue clics ni guarda el cuerpo.
5. **Prueba con filtro:** en un buzón con protección de enlaces, comprobar que el enlace aún sirve cuando la persona lo abre después del filtro.
6. Decidir y registrar el resultado en `docs/operaciones/`.

**DMARC por pasos (D-054.4):** primero solo observación; tras 2 a 4 semanas sin problemas, cuarentena y luego rechazo.

### 7.4 Plan de contingencia si el correo falla

| Qué pasa | Qué hacemos | Quién |
|---|---|---|
| Se nota antes de que alguien se queje (correos de acceso demorados o rebotados) | Alerta automática (sección 8) | DevOps |
| Caída del proveedor | **Cambio al segundo proveedor** (con el dominio ya verificado y probado cada trimestre) con una variable de entorno y una publicación de emergencia | DevOps, aprobación de la Jefatura |
| Los correos van a spam | Revisar informes de DMARC, pedir soporte, cambiar de proveedor si no se resuelve | DevOps |
| **Los administradores no pueden entrar y es urgente** | **Acceso excepcional de un solo uso** (D-048.6): el Administrador de plataforma lo emite a un administrador de empresa **tras verificar su identidad por otro medio**, con segunda verificación todavía exigida, todo en la auditoría. **Seguridad aceptó el diseño** (ronda 3, H-SEG-27) con estas condiciones: (a) dos personas de plataforma, o el contacto autorizado confirmado por la empresa; (b) aviso a todos los administradores de la empresa; (c) tope de un uso por empresa y semana. Es el permiso PS-05 | Administrador de plataforma |
| Una persona pidió el enlace en el computador y abrió el correo en el celular (queda atado al navegador) | La pantalla debe ofrecer **un código corto** que se escribe en el otro dispositivo, o pedir un enlace nuevo en el mismo dispositivo (H-SEG-31); es del Frontend y Seguridad | Frontend, Seguridad |
| Se acaba el cupo del plan | Alerta al 80 % del cupo; subir de plan es un gasto que va al CEO | DevOps |
| Vence el dominio o se pierde el DNS | Dos personas con acceso al DNS; alerta 60 y 30 días antes del vencimiento | CEO / DevOps |

**No se agregan contraseñas como respaldo del correo** (D-002).


### 7.5 Matriz de entrega: plantilla, buzones y umbrales (D-064 condición 6)

**Lo que se necesita antes de empezar:** (1) el **subdominio real** de envío (pedido C; un dominio `.test` no sirve para correo real); (2) dos cuentas de candidatos de correo (gratuitas o de entrada); (3) **cinco buzones de prueba** controlados por el equipo, **nunca personales de nadie**: Gmail personal, Google Workspace, Outlook/Hotmail, Microsoft 365 y un quinto con filtros estrictos (Microsoft 365 con la protección de enlaces encendida). Conseguir los dos buzones de empresa (Workspace y Microsoft 365) puede requerir una cuenta de prueba o de pago: se verifica en 9.5 y, si cuesta, va al CEO. Las claves de esos buzones viven en el gestor de contraseñas del equipo, no en el repositorio.

**Cómo se hace:**
1. Por **cada candidato**, **20 envíos a cada uno de los 5 tipos de buzón** (100 por candidato), repartidos en **cuatro franjas del día** durante **dos días**, con el texto real de la v1: invitación, enlace de acceso y aviso de aprobación (D-061.4).
2. Por cada envío se anota: identificador, hora de salida, hora de llegada, dónde cayó (bandeja principal, otra pestaña, spam o no llegó), resultado de SPF, DKIM y DMARC leído en el encabezado "Authentication-Results" (en Gmail: "Mostrar original"), y si el enlace abrió y sirvió.
3. Prueba con filtro: 20 aperturas del enlace **después** de que el buzón con protección de enlaces lo analizó; el enlace debe seguir sirviendo.
4. Verificar con una captura de la configuración que el seguimiento de clics está apagado y que no se guarda el cuerpo de los correos.

**Plantilla de la tabla de resultados** (una por candidato; se guarda en `docs/operaciones/` sin direcciones reales):

| Tipo de buzón | Envíos | En bandeja principal | En spam o no llegó | Mediana de llegada | Máxima | SPF / DKIM / DMARC en "pass" | Enlace sirvió |
|---|---|---|---|---|---|---|---|
| Gmail personal | 20 | | | | | | |
| Google Workspace | 20 | | | | | | |
| Outlook / Hotmail | 20 | | | | | | |
| Microsoft 365 | 20 | | | | | | |
| Con filtros estrictos | 20 | | | | | | |

**Umbrales de aprobación (propuesta de DevOps; QA y Seguridad pueden endurecerlos):**
- **Spam o no llegó: 0 de 20** en los correos de acceso a los cinco tipos. Un solo caso obliga a investigar, corregir y repetir los 20 de ese tipo.
- **Tiempo de llegada: mediana menor de 30 segundos y máximo menor de 2 minutos** (la alarma del plan es de 2 minutos, 2.3; el enlace dura 15, S-01).
- **SPF, DKIM y DMARC en "pass" y alineados: 100 %.**
- **Enlace tras el filtro: 20 de 20.**
- **Sin seguimiento de clics y sin guardar el cuerpo:** comprobado por captura.

**Quién gana:** el candidato que cumple todo; si cumplen los dos, el de costo menor con plan de pago claro (el segundo queda como reserva configurada, 7.4). El resultado, con fecha, va a `docs/operaciones/` y al CEO para aprobar el costo. **DMARC por pasos** (D-054.4): solo observación durante 2 a 4 semanas, luego cuarentena y luego rechazo, con los informes llegando a un buzón controlado por el equipo.

---

## 8. Monitoreo mínimo y respuesta ante incidentes

### 8.1 Qué se vigila

Alcance acorde a RNF-012 (sin compromiso de 24 horas): enterarnos antes que los usuarios, y no más.

| Qué se vigila | Cómo | Quién se entera | Desde cuándo |
|---|---|---|---|
| **Errores** | Servicio de reporte de errores con filtro que **elimina datos personales y secretos antes de enviar** (RF-DAT-008, RNF-009, T-14) | DevOps y Jefatura | Pruebas desde la Etapa 1; producción antes de uso real |
| **Disponibilidad** | Un servicio externo visita cada 1 a 5 minutos una dirección `/salud` que confirma que aplicación y base responden y **no revela detalles internos** | DevOps | Pruebas y producción |
| **Trabajador y cola** | Latido, antigüedad del trabajo más viejo, trabajos muertos, procesos diarios por empresa (2.3) | DevOps | Pruebas desde la Etapa 1 |
| **Correo de acceso** | Porcentaje entregado, tiempos y rebotes | DevOps | Desde que haya correo real |
| **Respaldos** | Cada trabajo avisa al terminar bien; **sin aviso a tiempo, alarma** (latido) | DevOps | Antes de uso real |
| **Copia externa de auditoría** | Latido, retraso entre lo último de la base y lo último copiado, y resultado de la verificación semanal | DevOps y Seguridad | Antes de uso real |
| **Registro de anonimizaciones** | Resultado de la reconciliación nocturna | DevOps y Cumplimiento | Desde la Etapa 2 |
| **Base de datos** | Conexiones usadas contra el tope, espacio, consultas lentas | DevOps | Antes de uso real |
| **Vencimientos** | Dominio, certificados, claves de proveedores, cupos del plan | DevOps | Antes de uso real |
| **Dependencias** | Alertas de vulnerabilidades (semanal y en cada cambio; RS-43) | Seguridad | Etapa 1 |
| **Rendimiento** | Prueba nocturna desde la Etapa 4 y medición final contra RNF-011 | QA y DevOps | Etapa 4 |

Las alertas deben llegar a **una persona real con nombre y su suplente**, por correo y, si se justifica, por mensaje al celular: el equipo de TI de esta sesión no está de guardia fuera de ella. Se nombra antes de producción (D-059.1, D-064 condición 9, pedido B). **Aviso de mantenimiento:** una página sencilla y una frase estándar (RNF-012). No se contrata página de estado de pago en la v1.

### 8.2 Incidente de datos (D-059): lo que me toca a mí

Los roles, plazos y avisos los fija D-059 y el detalle va a `docs/operaciones/procedimiento-incidente-datos.md` (lo redactan Seguridad y Cumplimiento). Lo que DevOps debe dejar **listo y ensayado** para cumplir la contención en **1 hora**:

1. **Tener a mano y probadas** las acciones de contención: revocar todas las sesiones y enlaces, rotar claves (API, llaves, correo, base), suspender una empresa o una integración, sin borrar evidencia. Las que son funciones de la plataforma las construye el Arquitecto; las de claves y accesos del alojamiento, yo.
2. **Preservar evidencia:** la auditoría y su copia externa (5.3), el reporte de errores y los registros técnicos. Propongo conservar los **registros técnicos 90 días** (sin datos personales ni secretos); a confirmar con Cumplimiento.
3. **Carpeta de incidentes** `docs/operaciones/incidentes/` con hora, quién y qué se vio, gravedad G1 a G3.
4. **Contactos del proveedor:** el contrato con proveedores técnicos debe obligarlos a avisarnos de un incidente de su lado (D-059.5, L-08).
5. **Ensayo**: un simulacro de contención antes de producción, con cronómetro (D-064 condición 13 pide el procedimiento en borrador).

---

## 9. Costos

### 9.1 Cómo leer esta sección

- **No verifiqué ningún precio** (esta actualización tampoco). En 9.5 está, por cada rubro, la página oficial exacta donde consultarlo. Los precios cambian y no los consulté. Donde dice "**precio a verificar en la página del proveedor**" nadie debería citar una cifra mía. **D-064 condición 5 exige precios verificados y aprobados por el CEO antes de codificar:** esa verificación está **pendiente** y la debe hacer quien pueda consultar las páginas oficiales (ver 14).
- Los nombres de proveedores son **ejemplos de opciones del mercado**, no una contratación ni una recomendación cerrada. No hay ninguna cuenta creada.
- Las condiciones de los planes gratuitos (límites, pausas por inactividad, uso comercial, retención de copias) cambian y deben leerse antes de apoyarse en ellos. Un plan gratuito puede servir para desarrollo, **no** para producción con datos reales.
- **[ESCALAR AL CEO]** marca todo gasto recurrente.
- Cuando se verifiquen los precios, se anotan con fecha y enlace en este archivo.

### 9.2 Rubros, opciones y criterio de elección

| Rubro | Opciones a comparar | Criterio de elección | Precio | Marca |
|---|---|---|---|---|
| **1. Alojamiento de la aplicación y del trabajador (ejecución continua)** *(cambia: ya no se asume Vercel)* | (a) **Servicio de contenedores gestionado** (por ejemplo Railway, Render, Fly.io); (b) **contenedores en una nube grande** (por ejemplo Google Cloud Run con al menos una instancia siempre encendida, AWS App Runner o ECS, Azure Container Apps); (c) **servidor virtual propio** con Docker (por ejemplo Hetzner, DigitalOcean); (d) **híbrido:** Vercel solo para la web y un servicio pequeño aparte para el trabajador | Imprescindible: **procesos que corren siempre** (web y trabajador, de la misma imagen), reinicio automático, **vuelta a la imagen anterior con un clic**, secretos separados por entorno, entornos separados, **permite uso comercial** en el plan que se contrate, región y contrato (L-07, L-08), y que se pueda **restringir quién llega a la consola de plataforma** (6.4). (c) es lo más barato pero obliga a parchear y operar el sistema nosotros: no lo recomiendo para datos reales con un equipo pequeño. (d) conserva las ventajas de Vercel pero duplica proveedores y lugares de secretos | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** |
| **2. Base de datos gestionada (PostgreSQL)** | (a) **Neon**; (b) **Supabase**; (c) servicio de una nube grande (AWS RDS, Google Cloud SQL, Azure) | Imprescindible (se comprueba el **día 0 del prototipo**): reglas por fila forzadas, **crear los cinco roles** sin ser superusuario, funciones `SECURITY DEFINER`, tablas particionadas, las extensiones de T-4, **agrupador en modo transacción** compatible con D-039, **conexión directa para el trabajador**, **60 conexiones utilizables**, recuperación a un punto en el tiempo y su retención, región y contrato, **una base de pruebas separada barata**, y que registre quién usó cuentas de alto poder. Una nube grande da más control a más costo y trabajo | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** |
| **3. Correo transaccional** | (a) **Postmark**; (b) **Resend**; (c) **Amazon SES** (suele ser más barato por volumen, con más configuración); (d) otros (Brevo, Mailgun) | Los 12 criterios de 7.2; sobre todo entrega a Gmail y Outlook, rapidez, no guardar contenido, no seguir clics. Con volumen tan bajo el precio pesa poco frente a la entrega. Un **segundo proveedor de reserva** (puede ser plan gratuito) | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** |
| **4. Respaldos y almacenamiento externo** (respaldos propios, copia externa de la auditoría, registro de anonimizaciones) | (a) Almacenamiento de objetos **de otro proveedor** (Backblaze B2, Cloudflare R2, AWS S3); (b) solo los respaldos del plan de la base (no basta: ver 5.1) | **Otro proveedor y otra cuenta** que la base; cifrado; **bloqueo de una sola escritura** disponible; **tres depósitos separados** con credenciales distintas; replicación del registro de anonimizaciones; sin cobro por bajar datos que encarezca una restauración. Con 30 diarios + 12 mensuales el volumen es pequeño al inicio | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** |
| **5. Monitoreo** | (a) **Sentry** (errores); (b) **UptimeRobot** o **Better Stack** (disponibilidad y latidos); (c) lo incluido en el alojamiento | Que el reporte de errores permita **filtrar datos personales** antes de enviar, que los **latidos** estén incluidos (sin ellos no vigilamos respaldos, copia de auditoría ni trabajador), cantidad de visitas del plan gratuito y alertas por correo y celular | Precio a verificar en la página del proveedor | **[ESCALAR AL CEO]** (aunque empiece gratis) |
| **6. Dominio** | (a) Subdominio de un dominio que la empresa **ya tenga**; (b) comprar uno nuevo | Preferir (a). Debe poder agregar los registros SPF, DKIM y DMARC; cuenta a nombre de la empresa con segunda verificación; renovación automática y aviso de vencimiento | Precio a verificar (el dominio nuevo es gasto **anual**) | **[ESCALAR AL CEO]** si se compra |
| **7. Gestor de secretos y llaves físicas** *(nuevo, D-048)* | (a) El almacén de secretos del propio alojamiento (suele estar incluido); (b) un gestor de contraseñas de equipo para el respaldo de llaves maestras y códigos de recuperación; (c) un gestor de secretos de una nube grande; (d) **llaves de seguridad físicas** (2 por administrador de plataforma, una de repuesto) | Que las llaves maestras queden **fuera de la base y de los respaldos**, con **dos custodios**; que permita rotación con versiones; las llaves físicas deben ser estándar (compatibles con los navegadores actuales) | Precio a verificar en la página del proveedor (llaves físicas: compra única por unidad) | **[ESCALAR AL CEO]** (costo muy bajo) |
| **8. Acceso restringido a la consola de plataforma** *(nuevo, D-048.5c; opcional según Seguridad)* | (a) Lista de direcciones permitidas en el borde del alojamiento (sin costo si lo ofrece); (b) túnel de acceso privado de una herramienta de red privada | Que la consola de plataforma no sea alcanzable desde cualquier lugar; que no dependa de una sola persona | Precio a verificar | **[ESCALAR AL CEO]** si agrega gasto |
| **Otros posibles** | GitHub (repositorio privado y minutos de la revisión automática: los planes gratuitos tienen límites); un servicio de simulacros de carga (no se contrata) | Verificar si el plan de GitHub que ya se tiene cubre la revisión automática, incluida la protección contra empujes con secretos | Precio a verificar | **[ESCALAR AL CEO]** si agrega gasto |

**Lo que NO se contrata** (porque no se necesita en la v1): **Redis** u otro servicio de apoyo (los topes y la cola van en PostgreSQL, D-038 y D-054.2; Redis solo si se mide la necesidad y entonces **[ESCALAR AL CEO]**), página de estado de pago, guardia 24 horas, servidores propios, almacenamiento de archivos adjuntos (D-022; se decide al cierre de la Etapa 4), y las vistas previas por cambio con base propia (1.1, regla 2).

### 9.3 Recomendación de arranque de costo mínimo

**Fase A: antes del prototipo y Etapas 0 a 3 (sin datos reales).**
- **Alojamiento de ejecución continua:** lo más barato que **corra los dos programas todo el tiempo** y permita probar la restricción de la consola; aquí un plan gratuito estable es poco probable, así que **es la primera partida que probablemente haya que pagar** (estimación sin verificar: pocos dólares al mes). Alternativa de menor costo: un servidor virtual pequeño con Docker **solo para pruebas**.
- **Base de datos:** plan gratuito o el más barato de un proveedor que pase el **día 0 del prototipo**; si el plan gratuito no admite 60 conexiones, esa es la segunda cosa que valdría la pena pagar.
- **Correo:** plan gratuito o de entrada del proveedor que gane la matriz; mientras no haga falta correo real, la bandeja de captura.
- **Respaldos, copia de auditoría y registro de anonimizaciones:** almacenamiento externo mínimo; con datos inventados se ensaya todo el procedimiento por muy poco.
- **Monitoreo:** planes gratuitos. **Dominio:** subdominio de uno que exista. **Secretos y llaves:** el almacén del alojamiento; las llaves físicas se compran cuando haya administradores de plataforma reales.
- *Orden de magnitud, estimación sin verificar:* en esta fase, del orden de **pocos dólares a algunas decenas de dólares al mes**, sobre todo por el alojamiento de ejecución continua.

**Fase B: antes de cualquier etapa con datos reales (Etapa 7 a más tardar).** No se escatima en lo que protege los datos:
- **Base de datos de pago** con respaldos y recuperación a un punto en el tiempo; **alojamiento de pago** con permiso de uso comercial; **correo de pago** con dominio verificado y un segundo proveedor configurado; **almacenamiento externo con bloqueo** para respaldos, auditoría y registro de anonimizaciones; vigilancia en plan gratuito si cubre errores, disponibilidad y latidos; llaves físicas y gestor de secretos.
- *Orden de magnitud, estimación sin verificar:* mi estimación de la versión 1 era de **50 a 150 USD al mes en total**, hecha suponiendo un alojamiento sin servidor. Con el trabajador permanente **puede cambiar** (hacia arriba o hacia abajo según el proveedor). **No usar esta cifra para decidir:** se reemplaza por los precios verificados antes de pedir la aprobación de la Fase B.

### 9.4 Qué elecciones son difíciles de deshacer

- **Región de los servidores y contrato** (L-07, L-08): depende de P-004 y del abogado. Cambiar de región después implica migrar la base.
- **Proveedor de base de datos:** cambiarlo es posible (PostgreSQL es estándar) pero cuesta trabajo; se elige **antes del prototipo** porque este corre sobre él (D-055).
- **Alojamiento:** si todo corre en contenedores de una sola imagen, cambiar de proveedor es relativamente barato. Lo conservo así a propósito.
- **Proveedor de correo:** más fácil de cambiar gracias a la capa de envío con adaptadores.


### 9.5 Dónde verificar cada precio (todos "a verificar")

**Ninguna cifra de esta tabla es mía:** solo la página oficial donde se consulta. No pude abrir estas direcciones desde esta sesión; si alguna ya no abre, se busca "pricing" (precios) en el sitio oficial del proveedor. Quien verifique anota en las dos últimas columnas la fecha y el valor visto (D-064 condición 5), con captura, y la Jefatura lo lleva al CEO.

| Rubro (9.2) | Opción | Página oficial a consultar | Qué mirar | Verificado (fecha, valor) |
|---|---|---|---|---|
| 1 Alojamiento de ejecución continua | Railway | `https://railway.com/pricing` | Si hay plan gratuito estable, costo de dos servicios siempre encendidos, uso comercial | |
| | Render | `https://render.com/pricing` | Servicios siempre encendidos, "trabajador en segundo plano" y vuelta a una versión anterior | |
| | Fly.io | `https://fly.io/docs/about/pricing/` | Costo de máquinas siempre encendidas | |
| | Google Cloud Run | `https://cloud.google.com/run/pricing` | Mínimo de instancias siempre encendidas | |
| | AWS App Runner | `https://aws.amazon.com/apprunner/pricing/` | Costo de instancia siempre activa | |
| | Azure Container Apps | `https://azure.microsoft.com/en-us/pricing/details/container-apps/` | Réplicas mínimas | |
| | Hetzner Cloud | `https://www.hetzner.com/cloud` | Servidor virtual pequeño (solo para pruebas) | |
| | DigitalOcean | `https://www.digitalocean.com/pricing` | Servidor virtual pequeño | |
| 2 Base de datos | Neon | `https://neon.com/pricing` | Conexiones directas, 60 utilizables, retención de la recuperación a un punto en el tiempo | |
| | Supabase | `https://supabase.com/pricing` | Ídem; límites de roles y extensiones | |
| | AWS RDS (PostgreSQL) | `https://aws.amazon.com/rds/postgresql/pricing/` | Instancia mínima, respaldo | |
| | Google Cloud SQL | `https://cloud.google.com/sql/pricing` | Instancia mínima, respaldo | |
| 3 Correo | Postmark | `https://postmarkapp.com/pricing` | Tope mensual y por día frente a los topes de D-054.2 | |
| | Resend | `https://resend.com/pricing` | Ídem; dominios incluidos | |
| | Amazon SES | `https://aws.amazon.com/ses/pricing/` | Costo por mil envíos | |
| | Brevo / Mailgun | `https://www.brevo.com/pricing/` · `https://www.mailgun.com/pricing/` | Ídem | |
| 4 Respaldos y copias | Backblaze B2 | `https://www.backblaze.com/cloud-storage/pricing` | Almacenamiento, bloqueo de objetos, costo de bajar datos | |
| | Cloudflare R2 | `https://developers.cloudflare.com/r2/pricing/` | Ídem | |
| | AWS S3 | `https://aws.amazon.com/s3/pricing/` | Ídem; "Object Lock" | |
| 5 Monitoreo | Sentry | `https://sentry.io/pricing/` | Filtro de datos personales, cupo del plan gratuito | |
| | UptimeRobot / Better Stack | `https://uptimerobot.com/pricing/` · `https://betterstack.com/pricing` | Latidos y alertas por celular | |
| 6 Dominio | Registro de dominio (si hace falta uno nuevo) | `https://www.cloudflare.com/products/registrar/` o el registrador que se elija | Precio anual y renovación | |
| 7 Llaves y gestor | Llaves físicas (Yubico) | `https://www.yubico.com/store/` | Precio por unidad, tipo de conector | |
| | Llaves físicas (Nitrokey) | `https://shop.nitrokey.com/` | Ídem | |
| | Gestor de contraseñas de equipo | `https://1password.com/pricing/` · `https://bitwarden.com/pricing/` | 2F obligatorio y registro de accesos por plan | |
| 8 Red restringida | Túnel privado | `https://tailscale.com/pricing` · `https://www.cloudflare.com/plans/zero-trust-services/` | Si el plan gratuito alcanza | |
| Otros | GitHub (ramas protegidas en repositorio privado, bloqueo de secretos, minutos del robot) | `https://github.com/pricing` y, en la ayuda oficial, "About protected branches" y "About push protection" | Si el plan actual permite la regla del paso 0 de 3.8 y qué cuesta el bloqueo de secretos | |
| | Buzones de prueba de empresa (7.5) | `https://workspace.google.com/pricing` · `https://developer.microsoft.com/microsoft-365/dev-program` | Si hay prueba gratuita suficiente para la matriz | |

---

## 10. Prototipo técnico previo (3 a 4 días): qué necesita de DevOps

D-055 amplía el prototipo a 3 o 4 días y lo corre sobre el **proveedor candidato y su agrupador de conexiones**, con `app_empresa`. Lo ejecutan Arquitecto y Datos; QA mide; yo pongo el terreno.

**Día 0: comprobación de compatibilidad (unas 2 a 4 horas por candidato, antes de gastar días de prototipo).** Sobre una cuenta de prueba de cada proveedor candidato de base de datos (dos o tres), compruebo:

| # | Qué compruebo | Por qué |
|---|---|---|
| 1 | Se pueden crear los **cinco roles** y `app_empresa` queda sin ser dueño, sin BYPASSRLS y sin ser superusuario | D-039.3 |
| 2 | Reglas por fila **forzadas**; función `SECURITY DEFINER`; clave foránea compuesta | D-039 |
| 3 | Tabla particionada, índice parcial, consulta recursiva, actualización condicional | D-055 (2) |
| 4 | Extensiones `citext`, `unaccent`, `pg_trgm`, `btree_gist`, `pgcrypto` | T-4 |
| 5 | **Agrupador en modo transacción** y que `set_config` por transacción fija la empresa sin quedar "pegada" entre peticiones | D-055 (1) |
| 6 | **Conexión directa** disponible para el trabajador (y si la librería de cola funciona por el agrupador) | D-038 |
| 7 | **60 conexiones** utilizables; límite real del plan | D-055 (5) |
| 8 | Recuperación a un punto en el tiempo y retención de respaldos | D-052 |
| 9 | Región y condiciones del contrato | L-07, L-08 |

**Lo que dejo listo antes del primer día de prototipo:**
1. Un **alojamiento de ejecución continua** de prueba con dos servicios (web y trabajador) y el entorno de pruebas con **60 conexiones**.
2. Un **repositorio** con la revisión automática mínima (análisis, pruebas, grupo de contenedores desechable con PostgreSQL, trabajador y bandeja de captura) y los cinco roles creados por un guion repetible.
3. El **reloj fijable** y el disparador manual (si el Arquitecto ya definió el mecanismo; si no, lo prueba el prototipo).
4. Un **depósito de objetos de prueba** para probar el registro de anonimizaciones y la copia de auditoría en miniatura.
5. Una **bitácora de límites** que voy llenando: lo que cada proveedor impide o limita (extensiones, roles, conexiones, tiempo máximo de una petición).

**Lo que mido yo durante el prototipo:** tiempo de arranque del servicio, comportamiento del trabajador al reiniciar, reinicio de la conexión tras un corte, y consumo con 20 y 50 conexiones. **Lo que mide QA:** los siete criterios de aislamiento.

**Si un candidato falla el día 0**, se descarta antes del prototipo y el costo del intento es de horas, no de días. **Si ninguno pasa**, el Arquitecto vuelve a mesa (D-055, riesgo #18) con la alternativa de Kysely o SQL puro para esa parte.

---

## 11. Riesgos operativos y lo que necesito de otros roles

### 11.1 Riesgos operativos

| # | Riesgo | Prob. | Impacto | Qué hacemos |
|---|---|---|---|---|
| O-1 | **Falla de correo = nadie entra** (riesgo #9) | Media | Alto | Criterios y pruebas (7), segundo proveedor, acceso de emergencia aceptado por Seguridad, alertas |
| O-2 | **El aislamiento falla en la base real o con el agrupador de conexiones** (riesgos #2, #18) | Media | Crítico | Día 0 y prototipo en el proveedor candidato, base de pruebas real con 60 conexiones, control de cobertura (3.3) |
| O-3 | **Alteración de la auditoría por quien tiene poder total** | Baja | Crítico | Copia externa inmutable, encadenada, verificada y ensayada (5.3) |
| O-4 | **Los respaldos existen pero no se pueden restaurar** | Media | Crítico | Dos capas, restauración de ensayo con calendario y orden RS-49, alerta por latido |
| O-5 | **Se pierde la llave maestra o la de respaldos** | Baja | Alto | Respaldo aparte en dos lugares, dos custodios, versiones, comprobación en cada restauración (6.3) |
| O-6 | **Una persona concentra todos los accesos** (riesgo #14) | Media | Alto | Cuentas a nombre de la empresa, mínimo dos personas con segunda verificación, llaves maestras con dos custodios |
| O-7 | **Datos reales en pruebas o en el repositorio** (riesgo #17) | Media | Alto | Generador, `.gitignore`, búsqueda de secretos y de canario, prohibición de copiar producción |
| O-8 | **Una migración destructiva o larga sale mal** | Media | Alto | "Ampliar y luego limpiar", ensayo con volumen, respaldo previo, aprobación triple (4.2) |
| O-9 | **Límites de tiempo del alojamiento** frente a importaciones y exportaciones | Baja ahora | Medio | Ya cubierto por el trabajador (D-038.7); se mide en la Etapa 4 |
| O-10 | **Gasto que crece sin que nadie lo vea** (riesgo #14) | Media | Medio | Alertas de gasto en cada proveedor, revisión mensual, todo recurrente aprobado por el CEO |
| O-11 | **Plan gratuito con condiciones que no cubren uso comercial** | Media | Medio | Leer términos; Fase B de pago antes de uso real |
| O-12 | **Alertas que nadie recibe** | Alta | Medio | Nombrar persona y suplente antes de producción (D-059.1) |
| O-13 | **La restauración revive datos anonimizados o accesos revocados** | Baja | Alto | Registro de anonimizaciones externo y orden RS-49 (5.2, 5.4) |
| O-14 | **Dependencia con vulnerabilidad sin arreglo** | Media | Medio | Excepción firmada con vencimiento (3.4) |
| O-15 | **Accesos que nadie retira** al irse alguien | Media | Alto | Lista de accesos revisada cada trimestre; rotar claves al salir alguien |
| O-16 | **El trabajador se detiene sin que nadie lo note** (correos, avisos y exportaciones dejan de salir) | Media | Alto | Latido, edad de la cola, reinicio automático y guion de reinicio (2.3, 2.4) |
| O-17 | **El reloj de prueba o la bandeja de captura quedan activos en producción** | Baja | Alto | Guardas de arranque, prueba automática y fila en la ficha de versión (1.1, 4.3) |
| O-18 | **El proveedor de base de datos no permite lo que D-039 exige** (roles, reglas forzadas, extensiones) | Media | Alto | Comprobación del día 0 antes del prototipo (10) |
| O-19 | **El registro de anonimizaciones se desincroniza de la base** | Baja | Alto | Intención primero, reconciliación nocturna (5.4) |
| O-20 | **La consola de plataforma queda expuesta a internet** | Media | Alto | Dirección propia y restricción en el borde (6.4) |
| O-21 | **Tablas de la cola o del registro de plataforma fuera de la lista global** hacen fallar la revisión o se crean sin protección | Media | Medio | Decidir con el Arquitecto antes de la Etapa 1 (1.2) |
| O-22 | **Las ramas protegidas no se activan** (el plan de GitHub no las permite en repositorio privado, o nadie con rol Admin hace los pasos) y un cambio se une sin revisión | Media | Alto | Pasos exactos en 3.8, pedido F, evidencia con la prueba del paso F; la revisión de documentos avisa pero no impide sin la regla |
| O-23 | **Con una sola persona con acceso, la aprobación de otra persona no se puede exigir** | Alta hoy | Medio | Paso B-bis de 3.8: se deja a 0 de forma temporal y se anota; se exige 1 antes de la Etapa 1 (D-064 condición 9) |
| O-24 | **Los custodios de llaves son las mismas personas que administran la plataforma** | Media | Alto | Condición 3 de Seguridad (6.5), pedido G; revisión trimestral de la lista de accesos |
| O-25 | **La revisión de documentos da falsos positivos o se vuelve ruido** y alguien la silencia | Media | Medio | Excepción solo con marca visible y aceptación escrita (3.7); cambios a la revisión pasan por revisión de otra persona (CODEOWNERS) |

Propongo al Gerente de TI **sumar O-3, O-5, O-6, O-12, O-16, O-18 y O-20 a `docs/equipo/riesgos.md`** o ligarlos a los existentes (#9, #14, #16, #17, #18, #26). Ese archivo es suyo; mi alcance es `docs/operaciones/`.

### 11.2 Lo que necesito de otros roles

**Arquitecto de Software**
1. Confirmar nombres de **variables** (`.env.example`) y el **reloj compartido** entre web y trabajador (1.4).
2. Aclarar si las **tablas de la cola** y el **registro de plataforma** entran en la lista global o llevan empresa (1.2).
3. Diseñar el **programador único** con clave por trabajo, día y empresa, y la compatibilidad de trabajos entre versiones (2.2, 4.2).
4. La **dirección propia de la consola de plataforma** y el acceso excepcional de emergencia con las condiciones de Seguridad (6.4, 7.4).
5. Una dirección `/salud` sin información interna; guardas de arranque (1.1).
6. Cómo se escribe el **registro de anonimizaciones** fuera de la base (5.4).
7. Lo de D-039 pendiente que Seguridad anotó: el diseño de la **lectura de soporte** (H-SEG-26) en modo de solo lectura con `app_empresa`.

**Ingeniero de Datos**
1. Guion repetible que crea los **cinco roles** con sus permisos y las reglas por fila forzadas; qué partición rige para la purga (1.2).
2. **Herramienta de exportar/importar una empresa** (D-052.5), antes de la primera empresa real.
3. **Generador de datos** con el contenido de QA, incluido el volumen y el canario (1.6).
4. El diseño del registro de anonimizaciones (5.4) y los datos que **no** deben llegar a la copia externa (5.3).

**Especialista en Seguridad**
1. Firmar la lista cerrada de tablas globales y el control de cobertura (3.3).
2. Aprobar la herramienta de búsqueda de secretos y la protección de GitHub (3.5), y el umbral de gravedad de dependencias.
3. Decidir la **restricción de red de la consola de plataforma** y las llaves físicas (6.4).
4. Detalle técnico del cifrado y la política de rotación (6.3).
5. Elegir conmigo el lugar controlado para documentos reales no anonimizados, si el CEO los entrega así (D-028).

**Auditor de Cumplimiento**
1. Modo de bloqueo de la copia externa y retención de la copia, del registro de seguridad y de los registros técnicos (5.3, 8.2).
2. Quién custodia las llaves y quién verifica la copia de auditoría (separación de funciones).

**QA**
1. Confirmar que 3.2 recoge sus respuestas y que el entorno desechable más el de pruebas cubren su lista (sección 12).
2. Qué hace falta de mi lado para el juego de datos y la inyección de fallos.

**Jefatura de Proyecto y CEO**
1. Los pedidos A a E de la sección 0.
2. Nombrar una persona con suplente para recibir alertas.
3. **Hacer los pasos de 3.8** (los hace quien tenga rol Admin del repositorio; el acceso de escritura de esta sesión no permite cambiar esa configuración) para ramas protegidas y bloqueo de secretos, y decidir el pedido F si el plan de GitHub lo exige.
4. Alguien que pueda **verificar precios en las páginas oficiales** (D-064 condición 5), o autorizarme explícitamente a hacerlo.
5. Convocar una mesa de revisión de este plan antes de la Etapa 1.

---

## 12. Los 20 puntos de QA, uno por uno

Fuente: `docs/revision-cruzada/ronda3-qa-tester.md`, sección 6.1 (H-QA-24). "Resuelto en este plan" significa que está escrito aquí; **nada está construido todavía**.

| # | Necesidad de QA | Respuesta | Dónde |
|---|---|---|---|
| 1 | PostgreSQL real y desechable por cada revisión | **Sí.** Cada cambio tiene su base, su aplicación, su trabajador y su bandeja de captura | 1.1, 3.1 (paso 5) |
| 2 | Base permanente separada de producción, misma versión | **Sí** | 1.3 |
| 3 | **Cinco** roles de base y prueba de que `app_empresa` no es dueño, no tiene BYPASSRLS ni es superusuario | **Resuelto:** los cinco roles y las tres pruebas | 1.2, 3.3 |
| 4 | **60 conexiones** en la base permanente | **Resuelto** (antes 20) | 1.3, 9.2 rubro 2, 10 |
| 5 | Agrupador en modo transacción, prototipo sobre el proveedor candidato | **Sí** | 1.3, 10 |
| 6 | **Trabajador y cola** en pruebas y en la revisión automática | **Resuelto:** los dos corren en ambos; ya no se supone Vercel | 2, 3.1 (pasos 5 y 7) |
| 7 | **Reloj fijable** y disparador manual (RNF-020) | **Resuelto**, y apagado por construcción en producción | 1.4 |
| 8 | **Correo de captura legible** en el entorno de pruebas | **Resuelto:** captura en desarrollo, revisión automática y pruebas, con lectura por programa. La entrega real a Gmail/Outlook es una prueba aparte | 1.5, 7.3 |
| 9 | Generador con el contenido de QA (dos empresas más una vacía, 7 plantillas, "Contador", canario) | **Resuelto como requisito:** el contenido de QA 6.3 está recogido; lo escribe Datos y yo lo conecto a los cuatro entornos | 1.6, 11.2 |
| 10 | Volumen: 100.000 activos y 500.000 movimientos | **Resuelto:** base lógica de volumen en pruebas; cifras de referencia ahí | 1.3, 1.6 |
| 11 | **Prueba de carga nocturna desde la Etapa 4** | **Resuelto** (antes se dejaba para la Etapa 7) | 1.8, 3.2 |
| 12 | Entorno efímero por cambio con aplicación, base, trabajador y correo de captura; **sin base compartida** | **Resuelto y corregido:** se quitó la regla de la versión 1 que hacía que las vistas previas apuntaran a la base de pruebas | 1.1 (regla 2), 3.1 |
| 13 | Navegadores (Chromium, Firefox, WebKit), 360 px y medidor de contraste | **Resuelto** en la corrida nocturna; en cada cambio, los 5 recorridos esenciales | 3.2 |
| 14 | **Inyección de fallos:** cortar la conexión, matar al trabajador | **Resuelto:** intermediario de red en la revisión automática y función de corte solo en pruebas | 1.7 |
| 15 | Restauración de ensayo con **RS-49** y registro de anonimizaciones | **Resuelto:** el orden obligatorio incluye revocar sesiones y enlaces, rotar claves de API, reaplicar bajas y cambios de rol, y reaplicar anonimizaciones | 5.2, 5.4 |
| 16 | Copia externa con verificador que se pueda **probar alterando una entrada** | **Resuelto:** ensayo de manipulación (CA-040b) antes de cada etapa con uso real | 5.3 (punto 5) |
| 17 | Búsqueda de secretos y del **nombre canario** | **Resuelto:** secretos en cada cambio; canario en base, exportaciones y correos (QA) y en registros técnicos y eventos de error de prueba (DevOps) | 1.6, 3.1 (paso 3) |
| 18 | Informe de pruebas, artefactos de fallos y política de pruebas intermitentes | **Sí** | 3.4 |
| 19 | Matriz de entrega del correo | **Sí** (con prueba de filtro de enlaces añadida) | 7.3 |
| 20 | Ficha de versión con vuelta atrás ensayada con cronómetro | **Sí**, con las tres filas nuevas que pidió QA | 4.3 |

Además recogí las respuestas de QA a mis dos preguntas: qué corre en cada cambio, de noche y antes de cada etapa (3.2), y las cinco mejoras al control de cobertura de tablas (3.3).

---

## 13. Puerta de salida de la Etapa 0 (D-064): lo que entrega DevOps

| # | Condición de la puerta | Mi parte | Estado hoy |
|---|---|---|---|
| 4 | Prototipo técnico de 3 a 4 días aprobado | Terreno y día 0 (sección 10) | Plan escrito; falta ejecutar |
| 5 | Proveedor de base y de alojamiento elegido, con **precios verificados** y aprobado por el CEO | Comparación y ficha de costos | **Pendiente:** no verifiqué precios (sección 14) |
| 6 | Proveedor de correo elegido tras la matriz de entrega | Matriz (7.3) | Plan escrito; falta ejecutar |
| 9 | Cuentas a nombre de la empresa, dos personas con segunda verificación, persona con suplente para alertas | Configurar las cuentas | **Pendiente:** depende del CEO (pedido B) |
| 10 | Estrategia de llaves aprobada por Seguridad; `.env.example`; ramas protegidas y revisión automática | `.gitignore` y `.env.example` | **Parcial:** `.gitignore` y `.env.example` **creados**; faltan ramas protegidas y revisión de secretos (necesitan acceso a GitHub) |
| 11 | Ensayo de reversa y restauración con cronómetro | Ensayos (4.3, 5.2) | Plan escrito; falta ejecutar |
| 12 | Plan de pruebas, juego de datos de dos empresas, **reloj fijable y correo de captura** | Entornos (1.3 a 1.5) | Plan escrito; falta ejecutar |
| 13 | Procedimiento de incidente en borrador | Parte técnica (8.2); lo redactan Seguridad y Cumplimiento | Mi parte descrita |

---

## 14. Pendientes y límites de este plan

- **No hay código, cuentas ni configuración creadas.** Los únicos archivos nuevos en el repositorio son `/.gitignore` y `/.env.example`. Nada se contrató.
- **No verifiqué precios ni condiciones de planes** (si una vuelta a la imagen anterior con un clic, un bloqueo de una sola escritura, una recuperación a un punto en el tiempo o permisos de uso comercial están en un plan concreto). D-064 condición 5 exige esa verificación antes de la Etapa 1: **queda pendiente**.
- **Pendiente de legal:** país y ley (L-01), plazos, incluidos respaldos 30 + 12 (L-04), región de servidores y proveedores (L-07, L-08), aviso de fuga (L-16). Hasta tenerlos no se elige región definitiva ni se activa anonimización automática.
- **Pendiente del CEO:** cifra de uso (P-003) para dimensionar base y límites de correo; país (P-004); a nombre de quién quedan las cuentas; persona y suplente para alertas.
- **Pendiente de Seguridad (H-SEG-27):** que el Gerente de TI decida S-34, del que dependen las condiciones del acceso de emergencia.
- **Siguiente paso mío**, si el plan se aprueba: ficha de versión como plantilla, guion de creación de los cinco roles, flujo de la revisión automática, comprobación del día 0 y borrador de los procedimientos de la sección 5.5.

---

## 15. Historial de cambios

| Versión | Cambio | Decisión o documento que lo motiva |
|---|---|---|
| 2 | El **proceso trabajador en segundo plano** pasa a ser una pieza de operación: dónde corre, cómo se vigila (latido, antigüedad de la cola, procesos diarios), cómo se reinicia, costo **[ESCALAR AL CEO]** (nueva sección 2) | D-038, D-055 T-1, H-ARQ-01, H-QA-24 (punto 6) |
| 2 | Se **retira la suposición de Vercel**: el alojamiento debe ser de ejecución continua; se presentan opciones (contenedores gestionados, nube grande, servidor propio, híbrido) | D-038.2, D-055 T-1 ("no se asume Vercel") |
| 2 | **Cinco roles de base de datos** en lugar de tres, con las tres pruebas de privilegios y la **lista cerrada de tablas globales** | D-039.3 y 4, RS-50, H-QA-24 (punto 3) |
| 2 | Base de pruebas: de **unas 20** a **al menos 60 conexiones**; agrupador en modo transacción; juego de volumen de 100.000 activos y 500.000 movimientos | D-055 (criterio 5: pruebas con 20 y 50), H-QA-24 (puntos 4, 5, 10) |
| 2 | **Reloj fijable** y disparador manual en pruebas, con guarda que lo impide en producción | D-038.8, RNF-020, CA-077, H-QA-24 (punto 7) |
| 2 | **Correo de captura legible por programa** en desarrollo, revisión automática y pruebas (antes en pruebas solo salía a "direcciones permitidas") | D-061.4, H-QA-24 (punto 8) |
| 2 | **Se quitan las vistas previas por cambio que compartían la base de pruebas**; cada cambio tiene su entorno desechable con su propia base | H-QA-24 (punto 12) |
| 2 | **Inyección de fallos** (cortar la conexión, detener el trabajador) | D-060.9, H-QA-24 (punto 14) |
| 2 | Revisión automática ampliada: matriz de permisos, pruebas de arquitectura, cola y trabajador, procesos diarios con dos empresas, guardas de arranque; control de cobertura con las cinco mejoras de QA; tabla de qué corre en cada cambio, de noche y antes de cada etapa | D-036.7, D-038.6, D-039.8, CA-077, ronda 3 de QA (6.2) |
| 2 | **Prueba de carga nocturna desde la Etapa 4** (antes en la Etapa 7) | D-056, S-19, H-ARQ-19, H-QA-24 (punto 11) |
| 2 | **Repositorio:** `.gitignore` y `.env.example` creados; ramas protegidas y revisión de secretos como condición de la Etapa 1 | H-SEG-32 (e), D-064 condición 10, condición 7 de Seguridad |
| 2 | **Llaves de cifrado:** llave maestra fuera de la base y de los respaldos, llaves por empresa y por usuario, versiones y rotación, respaldo en dos lugares con dos custodios; la variable pasa de `FIELD_ENCRYPTION_KEY` a `MASTER_ENCRYPTION_KEY` | D-048.4, RS-46, D-035, H-ARQ-05 |
| 2 | **Cuentas de plataforma:** llaves físicas, dos personas antes de datos reales, consola en dirección propia con red restringida | D-048.5, H-SEG-27 |
| 2 | **Registro de anonimizaciones** en un almacén propio fuera de la base que se restaura, replicado, desde la Etapa 2; reconciliación nocturna | D-032.3, D-052.3, RF-DAT-016, H-ARQ-03 |
| 2 | **Respaldos 30 diarios + 12 mensuales** (la versión 1 decía "mismo plazo que los datos"); **orden de restauración** con revocar sesiones y enlaces, rotar claves de API, reaplicar bajas y cambios de rol y reaplicar anonimizaciones; ensayo de manipulación de la copia de auditoría | D-032, D-052.4, RS-49, CA-040b, H-QA-24 (puntos 15, 16) |
| 2 | **Copia externa de auditoría:** el registro de seguridad (12 meses) queda fuera de la copia de 5 años salvo decisión; el bloqueo debe vencer con la purga; el rol `mantenimiento` con dos personas | D-030.5, 7 y 8, D-054.1, D-052.2 |
| 2 | **Correo:** topes del cuadro único (D-054.2), cupo propio de obligatorios, enlace con botón atado al navegador y prueba de filtro de enlaces; acceso excepcional de emergencia **aceptado por Seguridad** con condiciones; correos de la v1 solo invitación, acceso y aprobación | D-054, D-061.4, D-048.6, H-SEG-27, H-SEG-31 |
| 2 | **Respuesta ante incidentes:** qué debe dejar listo DevOps para contener en 1 hora; registros técnicos 90 días (propuesta) | D-059, D-064 condición 13 |
| 2 | **Prototipo técnico de 3-4 días:** comprobación de compatibilidad del día 0 y lo que DevOps deja listo | D-055, D-064 condición 4, riesgo #18 |
| 2 | **Costos:** nuevo rubro 1 (ejecución continua), rubros 7 (gestor de secretos y llaves físicas) y 8 (red restringida); se aclara que no se contrata Redis; cifras siguen "a verificar" | D-038, D-048, D-054.2, D2 del escalado |
| 2 | **Ficha de versión:** tres filas nuevas (cambia el trabajador o la cola; migración probada con volumen sobre datos existentes; procesos diarios con dos empresas) más guardas de reloj y correo | Ronda 3 de QA (6.2, pregunta 2) |
| 2 | Se agregan los riesgos operativos O-16 a O-21 | D-038, D-039, D-055, D-048 |
| 2 | Se agregan las secciones 12 (los 20 puntos de QA) y 13 (puerta D-064) | H-QA-24, D-064 |
| 1 | Versión inicial contra el documento funcional v0.2 y D-001 a D-029 | D-018, D-024, D-025, D-028, D-029 |

# ADR-25 · Despliegues dedicados por cliente y motor de base de datos (SQL Server)

**Estado:** Propuesto (2026-10-29) · **Decide:** Gerente de TI (revisan Seguridad, DevOps, Datos y Cumplimiento); lo comercial y legal, el CEO · **Base:** pregunta del CEO sobre empresas que quieren su data en su propia base (SQL Server de Azure o servidores físicos); ADR-01, 02, 03, 04, 06, 07, 11, 14, 15, 17, 19, 20, 23; D-039.10 (lectura de soporte); `docs/operaciones/piloto-gratuito.md`

**Cómo leer este documento.** Lo que se afirma sobre nuestros propios ADR está comprobado en esos archivos. Lo que se dice de SQL Server, de Azure, de Prisma sobre SQL Server y de servicios de otros proveedores sale de conocimiento general del Arquitecto y **no se consultó la documentación oficial** en esta sesión: todo eso va marcado **(a verificar)** y no debe tomarse como hecho hasta que el Ingeniero de Datos o DevOps lo confirmen en la página oficial. No hay precios ni fechas.

## Contexto

La plataforma se diseñó como **una sola base PostgreSQL compartida por todas las empresas**, separadas por seguridad por fila (ADR-03 y 04). Hay clientes posibles que quieren que sus datos queden **en su propia base**: unos usan SQL Server en Azure, otros tienen servidores físicos. La pregunta mezcla tres cosas distintas que conviene separar:

1. **Dónde vive la base** (nuestra nube, la nube del cliente, sus servidores).
2. **Quién opera la aplicación** (nosotros o el cliente).
3. **Qué motor de base usa** (PostgreSQL, que es el diseñado, o SQL Server, que no lo es).

Hecho que simplifica: **la plataforma ya permite una sola empresa por base.** Todo el aislamiento por empresa funciona igual con una empresa que con cien (ADR-03); `conEmpresa(empresaId, fn)` no cambia. Por eso (1) y (2) se resuelven **con el mismo código y sin rediseñar**; lo caro es (3).

## Opciones

| # | Opción | Veredicto |
|---|---|---|
| 1 | Solo nube compartida (hoy). Cualquier cliente que exija su base queda fuera | Es la v1, pero no puede ser la respuesta única si hay clientes que pagarían por otra cosa |
| 2 | **Misma aplicación, misma base PostgreSQL, desplegada aparte para un cliente** (en su nube o en sus servidores), una empresa por base | **Elegida como camino para clientes dedicados** (niveles B y C) |
| 3 | Soportar **SQL Server como base principal** además de PostgreSQL | **No en la v1.** Se decide solo con un cliente real que pague por ello (sección 4) |
| 4 | Dejar el dato principal en nuestra base y **copiarlo a la base del cliente** (solo lectura) | **Alternativa recomendada** cuando el cliente exige SQL Server (sección 3) |
| 5 | Una base distinta por empresa dentro de nuestra nube | Descartada en ADR-03 (migraciones y respaldos multiplicados); no resuelve «en mi base» |

## Decisión

1. **Tres niveles de despliegue**, con el mismo código y la misma imagen: **A** nube compartida (hoy), **B** base dedicada en la nube del cliente, **C** instalación completa en servidores del cliente. El motor de base de B y C es **PostgreSQL**.
2. **SQL Server como base principal no se construye ahora.** Se prepara el código para que **sea posible** más adelante sin pagar nada hoy (sección 4).
3. Al cliente que exige «mis datos en mi SQL Server» se le ofrece **B o C con PostgreSQL** si lo que quiere es control y residencia, o **réplica de solo lectura hacia su SQL Server** si lo que quiere es analizar o integrar sus datos allá. Se le dice con claridad qué cumple cada una (sección 3).
4. Todo lo comercial, legal y de responsabilidad lo decide el CEO (sección 5).

---

## 1. Los tres niveles de despliegue

### 1.1 Qué es cada uno

| Nivel | Dónde viven los datos | Aplicación y trabajador | Motor |
|---|---|---|---|
| **A. Nube compartida** (hoy) | Nuestra base PostgreSQL administrada, con varias empresas | Nuestra nube; operamos nosotros | PostgreSQL |
| **B. Base dedicada en la nube del cliente** | Un servicio PostgreSQL administrado **de la cuenta del cliente** (p. ej. el de Azure o el de otra nube; **(a verificar)** que ofrezca roles sin BYPASSRLS, funciones con privilegios y las extensiones de ADR-06) | Dos variantes: **B-nuestra** (la aplicación corre en nuestra nube y se conecta a su base) o **B-cliente** (todo corre en su nube) | PostgreSQL |
| **C. Instalación completa en servidores del cliente** | En sus servidores (físicos o virtuales), dentro de su red | Un **paquete de contenedores** (la imagen única de ADR-01 más una base PostgreSQL, o la que el cliente ya opere) que opera **el cliente** o, por contrato, **nosotros por acceso remoto** | PostgreSQL |

Aclaración honesta sobre **B-nuestra**: los datos *descansan* en la base del cliente, pero se *procesan* en nuestra nube (pasan por la memoria de nuestra aplicación). Sirve para clientes que quieren la base en su cuenta y no les preocupa dónde corre el programa; **no** sirve para quien exige que nada salga de su entorno. Además cada petición hace al menos un viaje a la base (ADR-03, H10): conviene que aplicación y base estén en la misma región, y la conexión debe ser privada (red virtual o enlace privado, **(a verificar)** según la nube). Una conexión por internet abierto no se acepta.

### 1.2 Lo que NO cambia en B y C

- La imagen, el código, las migraciones, los seis roles de base, la seguridad por fila, los tres servicios (`web`, `trabajador`, `consola`) y las credenciales por proceso (ADR-01 y 04).
- **Una empresa por base.** Se agrega una **guarda de arranque** del modo dedicado: si la base tiene más de una empresa activa, la aplicación se niega a iniciar y lo dice (evita mezclar clientes por accidente). Si el contrato permite o no varias empresas del mismo cliente (un grupo de sociedades) es decisión comercial, no técnica.
- El modelo de permisos (RBAC), la auditoría, la puerta de exportación y todas las reglas de negocio.

### 1.3 Lo que cambia, pieza por pieza

| Pieza | A (hoy) | B y C: qué cambia |
|---|---|---|
| **Migraciones y actualizaciones** | Nosotros publicamos y corremos el paso de publicación con el rol `migraciones` (ADR-01) | Entregamos una **versión cerrada**: imagen con número de versión, migraciones incluidas, notas de versión y una **comprobación previa** (versión de PostgreSQL, extensiones, roles, permisos, espacio libre). **Quien opere corre el paso de publicación con su propia credencial `migraciones`**; en C con el cliente operando, **nunca tenemos esa credencial**. Las migraciones solo avanzan (regla «ampliar y luego limpiar», ADR-01): **volver atrás = restaurar el respaldo**, y eso se dice por escrito antes de cada actualización. Soportamos **una ventana corta de versiones** (la versión actual y la anterior; el tamaño exacto lo fija el Gerente de TI): quien se queda más atrás debe pasar por versiones intermedias. Cada versión que publiquemos pasa en integración continua una **prueba de actualización desde la versión anterior sobre una base con datos** (nueva; hoy solo se prueba base vacía). Las correcciones de seguridad urgentes llevan aviso aparte y plazo de aplicación acordado en el contrato |
| **Llaves y secretos** | Gestor de secretos del alojamiento; llave maestra en dos custodias (ADR-07) | **La llave maestra del cliente vive en el gestor de secretos del cliente** (p. ej. su almacén de claves de la nube o de su red) y **nunca pasa por nosotros**. Reglas: (1) cada instalación tiene su propia llave maestra, **jamás** la de otro entorno nuestro (la guarda de huella de entorno de ADR-07 ya lo comprueba); (2) la custodia en dos lugares y dos custodios de ADR-07 pasa a ser **deber del cliente**; (3) **si el cliente pierde la maestra y su custodia, nosotros no podemos recuperar** claves de licencia ni semillas (caso A de ADR-07) y debe aceptarlo por escrito; (4) la consola de plataforma tampoco la recibe (ADR-01). **Límite honesto:** «fuera de nuestro alcance» solo es verdad cuando **el cliente opera** la aplicación. Si **nosotros** operamos, el proceso necesita la llave en marcha para descifrar, así que técnicamente podemos alcanzarla; lo que se puede prometer es que está en **su** gestor, con nuestro acceso limitado, registrado y revocable por él, y que es una obligación contractual no usarla. Nunca debe prometerse otra cosa |
| **Copias de seguridad** | Respaldo del proveedor más respaldo propio cifrado en otra cuenta (D-032) | **El cliente es dueño de sus respaldos** (los de su servicio administrado o los de su infraestructura). Le entregamos un **procedimiento de restauración** que incluye los pasos propios de la plataforma: reparar los contadores (`contador_reparar`, ADR-15) y **volver a aplicar las anonimizaciones** desde el almacén de anonimizaciones, que debe vivir **fuera de la base que se restaura** (ADR-12); sin ese paso, restaurar devuelve datos personales ya anonimizados. El cliente debe proveer también el almacén de **solo agregar** para la copia externa de auditoría y las constancias de purga (ADR-11 y 12); **(a verificar)** que su almacenamiento permita bloquear el borrado. El ensayo de restauración es obligación contractual con una frecuencia que fija el Gerente de TI |
| **Lectura de soporte (D-039.10) y acceso remoto** | El administrador de la empresa autoriza hasta 24 horas; una persona de plataforma con llave física lee en solo lectura, con auditoría previa (ADR-03) | **El mecanismo es el mismo y lo controla el cliente.** (1) La **consola** (ADR-01) se despliega dentro del entorno del cliente, **sin salida a internet**, y puede mantenerse apagada hasta que se necesite. (2) Nuestras personas de soporte solo existen en la instancia si **el cliente las da de alta** como personas de plataforma (queda en `registro_plataforma`) y las retira al terminar. (3) Sin autorización viva del administrador de la empresa, la política restrictiva de `app_soporte` devuelve cero filas (ADR-03). (4) El **acceso remoto** a la red del cliente, si lo hay, es por el medio que el cliente controle (VPN o equipo intermedio de salto), con vigencia limitada y registro de su lado; nosotros no pedimos una puerta permanente. (5) Las acciones de plataforma que exigen **dos personas** (ADR-23) usan a las personas de plataforma de esa instancia y el **contacto autorizado** que el propio cliente designa como segunda persona. **Punto abierto para el Gerente de TI y Seguridad:** confirmar que ADR-23 funciona con una instalación donde las personas de plataforma son pocas y del cliente |
| **Monitoreo** | Registros técnicos sin datos personales (ADR-20) hacia nuestro monitor; alarmas a nosotros | **Por defecto no nos llega nada.** Los registros y las alarmas (copia externa fallida, partición faltante, trabajo «muerto», ADR-02 y 11) salen hacia el **destino que el cliente configure** (correo, aviso a su sistema de monitoreo). Mantenemos `/salud`, el latido del trabajador y los registros sin datos personales (ADR-20), así que el cliente puede compartir un **paquete de diagnóstico** que genera él, ya normalizado, cuando abre una solicitud de soporte. Si el cliente nos contrata para vigilar, el cliente nos abre ese flujo, nunca al revés |
| **Trabajador y cola** | Un proceso aparte con conexión directa a la base (ADR-01 y 02) | **Igual.** La cola vive en PostgreSQL, así que no se agrega Redis ni otro servicio al paquete del cliente (esa fue la razón de ADR-02). Las dos tareas programadas (mantenimiento y copia externa) corren con el planificador del cliente (en C, el del orquestador o `cron`; DevOps entrega la definición). Si ese planificador no existe, se ejecutan como procesos de corta vida del trabajador, con el riesgo residual que ya describe ADR-01 |
| **Correo** | Proveedor de correo y uno de respaldo detrás de `enviarCorreo` (ADR-16) | El cliente aporta **su** salida de correo (su servidor SMTP o su servicio de correo corporativo). Hace falta un **adaptador de SMTP** detrás de la capa única de correo; el limitador y las plantillas no cambian. Sin correo no hay ingreso (enlace de acceso, ADR-08): es **requisito previo** de la instalación. **(a verificar con DevOps)** qué adaptadores existen hoy; si solo hay uno, el SMTP es trabajo nuevo, pequeño, de la Etapa 1 |
| **Procedimiento de incidente** | Nuestro procedimiento de incidentes: contención, congelación (ADR-23), aviso | Las **mismas herramientas** (congelación, auditoría, registro de plataforma) existen dentro de su base. Cambia **quién actúa**: ver la tabla de responsabilidades (1.4). Aviso a autoridades y a afectados: lo decide el cliente con su abogado **[ESCALAR AL CEO: confirmar con abogado]** |

### 1.4 Quién es responsable de qué

«Opera el cliente» y «operamos nosotros» valen tanto para B como para C. En A siempre operamos nosotros.

| Responsabilidad | Opera el cliente | Operamos nosotros (B-nuestra o C remoto) |
|---|---|---|
| Servicio de base (disponibilidad, parches del motor, espacio) | Cliente | B: cliente (es su cuenta). C: según contrato |
| Parches del sistema operativo y de los contenedores | Cliente | Nosotros, con permiso del cliente |
| Código de la plataforma y sus **vulnerabilidades** (corregirlas, publicar versión, avisar) | **Nosotros siempre** | **Nosotros siempre** |
| **Aplicar** la versión entregada | Cliente, dentro del plazo acordado | Nosotros, en la ventana acordada |
| Credencial `migraciones` | Cliente (nosotros no la vemos) | Cliente la entrega por un medio acordado y revocable **[decisión de Seguridad]** |
| Llave maestra y su custodia | Cliente | Cliente la tiene; nosotros la usamos en marcha (ver límite honesto, 1.3) |
| Respaldos y su ensayo de restauración | Cliente (con nuestro procedimiento) | Cliente es dueño; nosotros ejecutamos si el contrato lo dice |
| Dar de alta o baja a nuestras personas de soporte | Cliente | Cliente |
| Detectar un incidente | Cliente | Nosotros avisamos al cliente en el plazo acordado |
| Contener un incidente (aislar red, congelar, rotar llaves) | Cliente, con nuestra guía | Nosotros por pedido del cliente; la decisión de congelar es del cliente |
| Avisar a autoridades y afectados | **Cliente** (es el dueño de los datos) **[confirmar con abogado]** | **Cliente** |
| Cumplir derechos de datos de sus personas (acceso, corrección, supresión) | Cliente, con las funciones de la plataforma | Cliente, con las funciones de la plataforma |

---

## 2. SQL Server como base principal: qué se puede, qué se reescribe

### 2.1 Resumen

SQL Server **puede** guardar este modelo, pero **no es un cambio de conexión**: es **un segundo motor**. De las piezas que más pesan en el diseño (seguridad por fila con roles, cola, particiones, campos personalizados filtrables, restricciones de solapes), varias **se reescriben** y dos **no tienen equivalente directo**. Y lo más caro no es escribirlo una vez, sino **sostener dos versiones de cada migración y de cada prueba de datos para siempre**.

Leyenda: **Se puede** = existe equivalente cercano; **Se reescribe** = hay que rediseñar la pieza; **Sin equivalente** = hay que construir o aceptar menos garantía. Costo: Bajo, Medio o Alto, **relativo** a lo que cuesta esa pieza hoy; no son días ni dinero.

### 2.2 Matriz por pieza del diseño

Todo lo dicho de SQL Server es **(a verificar)**.

| # | Pieza (ADR) | Hoy en PostgreSQL | En SQL Server | Veredicto | Riesgo de aislamiento entre empresas | Costo |
|---|---|---|---|---|---|---|
| 1 | **Seguridad por fila** (ADR-03) | `ENABLE` y `FORCE ROW LEVEL SECURITY`; política por tabla `USING / WITH CHECK`; la empresa se fija con `set_config(..., true)`, **local a la transacción** | `CREATE SECURITY POLICY` con una función de predicado por tabla; hay predicados de **filtro** (lectura) y de **bloqueo** (insertar y modificar), que reemplazan el `WITH CHECK`. La empresa se pasa con `SESSION_CONTEXT` (`sp_set_session_context`), que es **de la conexión, no de la transacción** | Se reescribe la macro `aplicar_aislamiento` | **Alto.** (a) Sin variable local a la transacción, una conexión reciclada podría **conservar la empresa anterior** («empresa pegada», uno de los siete criterios de QA de ADR-03). Mitigación: fijarla al abrir `conEmpresa` y borrarla al cerrar en un bloque que siempre se ejecuta, más predicado que falla cerrado sin valor; **(a verificar)** si el reciclado de conexiones del controlador la restablece y si conviene marcarla como solo lectura. (b) El `ALTER` de columnas que usa una función de predicado con enlace de esquema **obliga a quitar y volver a crear la política**: las migraciones tendrían una ventana sin protección salvo que todo ocurra en una sola transacción **(a verificar si el DDL lo permite)** | Alto |
| 2 | **Políticas por rol** (`TO migraciones`, restrictiva `TO app_soporte`, `FORCE`) (ADR-03) | Varias políticas por tabla, permisivas y restrictivas, cada una limitada a un rol | Una política de seguridad **no tiene cláusula de rol**: la lógica «quién soy» entra **dentro de la función de predicado** (`USER_NAME()`, `IS_MEMBER`). Tampoco existe el equivalente de `FORCE`: el trato del dueño de la base y de los miembros con control total debe verificarse | Se reescribe y se **concentra en una sola función por tabla** | **Alto.** Las tres reglas separadas (normal, funciones de la puerta, soporte restrictivo) se convierten en una condición compuesta; un error de lógica la abre para todos. La prueba que compara `pg_policies` con la lista esperada (ADR-03) hay que rehacerla sobre el catálogo de SQL Server | Alto |
| 3 | **Roles y «sin BYPASSRLS»** (ADR-04) | Seis roles, ninguno dueño, ninguno superusuario ni BYPASSRLS; `CONNECTION LIMIT` por rol; `ALTER ROLE ... SET statement_timeout` | Usuarios y roles de base, esquemas, `DENY` con prioridad sobre `GRANT`. «No poder saltarse la política» pasa a ser **no tener permiso de alterar políticas ni control total**. Sin tope de conexiones por rol ni tiempos por rol: se fijan por conexión (`SET LOCK_TIMEOUT`, plazo del controlador) | Se reescribe | Medio: cambia el catálogo de pruebas de «ningún rol es dueño, BYPASSRLS ni superusuario» | Medio |
| 4 | **Funciones con privilegios** (SECURITY DEFINER) y puerta de funciones (ADR-03, 04) | Funciones del dueño con `search_path` fijo; `REVOKE ... FROM PUBLIC`; matriz rol × función comparada con el catálogo | Procedimientos con `EXECUTE AS OWNER` o cadena de propiedad; no hay `search_path` (se califican los nombres); existe el rol `public` con otro modelo de permisos | Se puede, reescribiendo | **Medio-alto.** La lista cerrada de ~40 funciones y su matriz se rehacen; **(a verificar)** cómo se aplica la política cuando el procedimiento corre como dueño | Alto |
| 5 | **Particiones de auditoría** (ADR-11) | Partición mensual declarativa; la tabla padre tiene permisos y **las particiones ninguno**; crear y purgar con `ATTACH/DETACH`; partición por defecto con alarma | Función y esquema de partición; **las particiones no son objetos con permisos propios**, así que la barrera «nadie tiene permiso sobre la partición» **no existe ni hace falta**; retirar un mes se hace **cambiando la partición a una tabla de apoyo** (`SWITCH`) y descartándola; crear un mes nuevo es dividir el rango (`SPLIT`), que es barato solo si el rango está vacío. No hay partición «por defecto»: lo que cae fuera del rango va a la primera o la última partición, **sin error** | Se puede, se reescribe la mecánica | **Medio.** La alarma de «fila fuera de rango» (ADR-11) cambia a una comprobación explícita de límites; `creado_en` = **inicio de la transacción** (ADR-11) **no existe como función** (la hora habitual es la de la sentencia), hay que tomarla de la vista de transacciones activas o de la aplicación, y la copia externa depende de eso (D11-3). **(a verificar)** soporte según edición y en Azure | Medio-alto |
| 6 | **JSON y campos personalizados** (ADR-17) | `jsonb`, `CHECK (jsonb_typeof(...))`, un índice GIN sobre `valores_filtrables` | JSON como texto con funciones (`ISJSON`, `JSON_VALUE`); existe un tipo JSON propio solo en versiones recientes **(a verificar)**. **No hay índice GIN ni operador de contención.** Un campo filtrable se indexa con una **columna calculada por campo**, que exige DDL en ejecución (lo que ADR-17 prohíbe), o con una **tabla auxiliar** de valores filtrables que mantiene la misma función que escribe el valor | Se reescribe el motor de campos filtrables | Bajo para el aislamiento (la tabla auxiliar lleva `empresa_id`); **alto para el rendimiento**: H10 (100.000 activos) se repite | Alto (toca Etapa 2 y el filtrado de Etapas 3 y 4) |
| 7 | **Correlativos y secuencias** (ADR-15) | `INSERT ... ON CONFLICT DO UPDATE ... RETURNING` en una función INVOKER de un viaje | No existe `ON CONFLICT`. Se hace con `UPDATE ... OUTPUT` más inserción si falta, con bloqueo explícito; **`MERGE` tiene fama de problemas de concurrencia**, se evita **(a verificar)**. Las `SEQUENCE` nativas no sirven (ADR-15 ya las descartó: una por empresa y clave, creadas en ejecución). Los saltos siguen permitidos | Se puede, se reescribe | Bajo. Se repiten H5 (20 y 50 conexiones, cero duplicados) | Medio |
| 8 | **Cola de trabajos** (ADR-02) | Librería sobre PostgreSQL (graphile-worker o pg-boss); `SKIP LOCKED`; `LISTEN/NOTIFY` | `READPAST` con `UPDLOCK` hace el papel de `SKIP LOCKED`; **no hay aviso de la base** (se consulta cada pocos segundos). **Las dos librerías candidatas son solo de PostgreSQL**; no conocemos una equivalente madura **(a verificar)** | **Sin librería: se construye la cola propia** (la «opción 2» de ADR-02): tomar, completar, fallar, reintentar con espera creciente, estado «muerto», clave única de trabajo, programador | Medio. `cola` es infraestructura sin seguridad por fila (categoría B, ADR-04); la regla de cargas con solo identificadores y el envoltorio de errores (H-SEG-44) se reimplementan | Alto (pieza de infraestructura propia que hay que mantener) |
| 9 | **Huellas, HMAC y cifrado** (ADR-07, 09) | Cálculo en la aplicación con `node:crypto`; la base solo guarda | Igual. No dependen del motor | **Se puede tal cual** | Ninguno | Bajo (columnas binarias y longitudes) |
| 10 | **Únicas parciales, `EXCLUDE`, `NULLS NOT DISTINCT`** (ADR-06, 15) | Índices únicos parciales con `IS NULL`; `EXCLUDE USING gist` contra solapes; `UNIQUE NULLS NOT DISTINCT` | **Índice único filtrado** (`WHERE ... IS NULL`) existe, y ADR-06 ya usa solo predicados `IS NULL`, lo cual ayuda. Cuidado: SQL Server permite **un solo nulo** en un índice único normal (al revés que PostgreSQL), así que **la semántica de nulos se invierte** y hay que revisarla clave por clave. Los índices filtrados tienen condiciones de uso (opciones de sesión, parámetros) **(a verificar)**. **`EXCLUDE` no existe**: los solapes de historiales se resuelven con disparador más bloqueo, **más débil** | Parcial: se puede / se reescribe / sin equivalente en `EXCLUDE` | **Medio** (integridad, no aislamiento): un solape de asignaciones que antes la base impedía podría colarse por una carrera | Medio-alto |
| 11 | **Texto sin distinción de mayúsculas, normalización** (ADR-06) | Comparación sensible a mayúsculas; claves por columnas `*_norm` con funciones `IMMUTABLE` versionadas y `regexp_replace`; trigramas para buscar | Las bases de SQL Server suelen usar ordenamiento **que no distingue mayúsculas** (según cómo se cree la base) y compara distinto: una clave única podría chocar donde PostgreSQL no choca. Hay que fijar un ordenamiento binario en las columnas `*_norm` para igualar el comportamiento. Las funciones de expresiones regulares **(a verificar)** según versión; la regla de ADR-06 («si necesita biblioteca, la calcula el servicio y la base solo exige el formato») se vuelve la regla general. Sin trigramas: búsqueda de texto completo o `LIKE` | Se reescribe | Bajo-medio (colisiones o duplicados por reglas de comparación distintas) | Medio |
| 12 | **Tipos y límites** (ADR-06) | `uuid` v7, `timestamptz`, `numeric`, `inet`, `text`, `CHECK` en lugar de enumeraciones | `uniqueidentifier` **ordena distinto**: un UUID v7 no queda ordenado en el tiempo y se pierde la razón por la que se eligió (ADR-06); se usa binario de 16 bytes o texto fijo **(a verificar y medir)**. `datetimeoffset`, `decimal`, binario o texto para IP. **Límite de tamaño de las claves de índice** (900 o 1.700 bytes **(a verificar)**) afecta a las columnas `*_norm` largas | Se puede, con decisiones nuevas | Ninguno | Medio |
| 13 | **Modelo de concurrencia** (ADR-15) | Versiones de fila (MVCC); `40P01` ante interbloqueo | Por defecto el modo clásico usa **bloqueos de lectura**; Azure SQL suele traer activado el modo con versiones de fila y en servidores propios hay que activarlo **(a verificar)**. Interbloqueo es el error 1205 | Se puede; los cinco patrones de ADR-15 siguen valiendo | Bajo. Se repiten H4 y H5 (50 aprobaciones, 200 intentos sobre 100 puestos) | Medio |
| 14 | **Prisma y las migraciones** (ADR-06, 14) | Prisma sobre PostgreSQL; lo que Prisma no expresa va en SQL escrito a mano en la migración | **Prisma soporta SQL Server**, con límites que habría que confirmar: tipo `Json` y enumeraciones **(a verificar)**; **el motor se fija en el archivo de esquema**, así que habría **dos esquemas y dos clientes generados**, no uno. Prisma tampoco expresa políticas, particiones ni índices filtrados: igual que hoy, van en SQL, pero **en dialecto distinto, dos juegos de migraciones**. Prisma solo se importa en `nucleo/aislamiento` (ADR-03), así que el daño queda contenido; el plan B (Kysely) tiene un dialecto para SQL Server **(a verificar)** | Se puede, con dos juegos de archivos | Bajo | Medio, **y permanente** |

### 2.3 Lo que esto significa

- **Riesgo de aislamiento nuevo, en orden:** (1) contexto de empresa por conexión y no por transacción (fila 1a); (2) reglas por rol fundidas en una sola condición (fila 2); (3) ventana de migración sin política (fila 1b); (4) comparaciones de texto y de nulos con otra semántica (filas 10 y 11). Ninguno es insalvable, pero **cada uno exige repetir las pruebas de aislamiento completas contra SQL Server** y la revisión de Seguridad desde cero, porque el argumento «Seguridad aprobó ADR-03» **no se hereda**.
- **Costo en etapas, sin fechas:**
  1. **Prototipo previo del mismo tipo que el de la Etapa 0** («H-SQL»), para probar lo más riesgoso antes de comprometerse: filas 1, 2, 5, 6 y 8. Lo estima el Ingeniero de Datos.
  2. **Rehacer, para el motor nuevo, lo que hoy pertenece a la Etapa 1** en su parte de datos: macro de aislamiento, seis roles, funciones, auditoría con particiones y contadores; **la cola** y **el motor de campos filtrables de la Etapa 2**. Equivale, en tamaño, a una parte grande de esas etapas.
  3. **Costo continuo:** desde ahí, **toda etapa nueva** (3 a 7 y las olas) escribe cada migración y cada consulta cruda dos veces y repite las pruebas de datos en los dos motores. Es el costo más fácil de subestimar.
- **Cuándo tendría sentido:** solo si algún cliente real lo exige **como condición para comprar y paga** el prototipo, el trabajo de la primera vez y el costo continuo (sección 5).

---

## 3. Alternativa recomendada: réplica hacia el SQL Server del cliente

Cuando el cliente dice «quiero mis datos en mi SQL Server», casi siempre quiere una de estas cuatro cosas: **(a)** analizarlos con sus herramientas (informes, tableros), **(b)** integrarlos con otros sistemas suyos, **(c)** tener una copia propia por tranquilidad o continuidad, **(d)** cumplir una regla interna o legal de que los datos estén en su infraestructura. Las tres primeras se resuelven con una réplica; la cuarta, no.

### 3.1 Cómo se haría (tres formas, de menor a mayor esfuerzo)

| Forma | Qué es | Quién carga el SQL Server | Comentarios |
|---|---|---|---|
| **1. Exportación programada** | La plataforma genera archivos periódicos con un esquema de intercambio documentado; el cliente los carga con su herramienta de integración (tipo ETL) | **El cliente** | Se apoya en la **puerta única de exportación** (ADR-19: permiso, auditoría, descarga atada al solicitante). Es la más simple; **ADR-19 hoy cubre descargas hechas por una persona**, no entregas programadas, así que hay que **ampliarlo** (propuesta: destino configurado con dos personas, permiso propio, topes, auditoría; Seguridad revisa). **No se construye antes de un cliente real** |
| **2. API de lectura** (**la vía que propuso el CEO; recomendada como principal**) | La herramienta del cliente consulta, de forma incremental y con una clave de integración de solo lectura, lo que cambió desde la última vez | **El cliente** (su herramienta tira) | Es el módulo «Integraciones y API» (`docs/modulos/integraciones-api.md`), de las olas posteriores a la Etapa 7. La clave se guarda como huella (ADR-07 y 09), con la empresa en la clave y sin CORS (ADR-01). Es lo más limpio porque **los permisos y el aislamiento se aplican en cada lectura**. **Tal como está escrita hoy no basta para servir de réplica**: faltan piezas, evaluadas en 3.4 |
| **3. Conector de réplica** | Un trabajo nuestro que, con credenciales de **solo escritura sobre un esquema reservado** del SQL Server del cliente, deja ahí las tablas de intercambio | **Nosotros** (empujamos) | Es lo que el cliente imagina, pero **abre un canal de salida hacia afuera** de nuestro aislamiento. Debe pasar por la misma puerta de exportación, con la misma revisión de Seguridad. Solo en B o C si el cliente lo quiere; para A, solo con revisión especial |

En B y C hay una cuarta opción **que solo el cliente puede usar**, porque la base es suya: replicar con herramientas de su propia nube hacia su SQL Server. **(a verificar)** qué ofrece cada nube. Ese camino lee la base por debajo de la plataforma, así que **se salta la puerta de exportación y los permisos**: es responsabilidad del cliente. En A **jamás** se da acceso a la base compartida.

### 3.2 Qué se copia y qué no
- **Sí:** los datos de negocio que el rol que consulta puede ver (SKU, inventario, órdenes, movimientos), con identificadores estables y marca de última modificación.
- **Nunca:** campos secretos (claves de licencia, ADR-17), semillas y huellas de acceso, claves de API, los valores cifrados, la cola, los registros de plataforma. **Datos personales de Personas:** solo con el permiso correspondiente y según lo que decida Cumplimiento (cada copia es un lugar más donde viven datos personales).
- **Cuando se anonimiza o se suprime un dato en la plataforma** (ADR-12), la réplica debe **recibir el cambio** (una marca de borrado o el valor ya anonimizado), o la copia del cliente conservaría lo que aquí se retiró. Es un requisito de diseño de la exportación.

### 3.3 Qué cumple y qué no cumple frente a «mis datos viven en mi base»

| Lo que el cliente quiere | Réplica hacia su SQL Server | B o C con PostgreSQL | SQL Server como base principal |
|---|---|---|---|
| Informes y tableros propios sobre sus datos | **Cumple** | Cumple (si su herramienta lee PostgreSQL) | Cumple |
| Integrar con sus otros sistemas | **Cumple** (con retraso) | Cumple | Cumple |
| Tener una copia propia | **Cumple** | Cumple | Cumple |
| **La copia original vive en mi infraestructura** | **No cumple**: el original sigue en nuestra base compartida | **Cumple** | Cumple |
| **Mis datos no salen de mi país o de mi red** (residencia) | **No cumple**: el original y su procesamiento están en nuestra nube **[confirmar con abogado]** | **Cumple en C** y en B-cliente; **no** en B-nuestra | Cumple si se construye |
| Que la plataforma escriba directo en mi SQL Server | **No**: es solo lectura; lo que se cambie en su copia **no vuelve** | No aplica | Cumple |
| Tiempo real | **No**: hay un retraso (el que se acuerde) | Cumple | Cumple |
| Usar la licencia de SQL Server que ya tengo | No usa su motor para operar | **No**: es PostgreSQL | **Cumple**, a costo alto (sección 2) |

Mensaje honesto al cliente: **la réplica le da acceso a sus datos, no le da el control del dato original.** Si su razón es de residencia o soberanía, la respuesta es B-cliente o C.

### 3.4 Evaluación de la API de lectura que ya existe en el diseño

**Pregunta del CEO:** «para que lo tengan en su SQL podemos dar una API para que se conecten a su data, ¿no?». **Respuesta: sí, es la mejor vía y la que recomendamos, pero la API de lectura tal como está en `integraciones-api.md` (RF-INT-006 y 007, RN-INT-013, 015, 016, 024, 026, 041; CA-INT-02 y 03) sirve para consultar, no para copiar.** Sirve bien para «traerme el activo X» o «lista de SKU con filtros»; no sirve todavía para «mantener mi SQL Server al día». Esto es lo que le falta, con el hecho que lo demuestra:

| # | Falta | Por qué (hecho del módulo o de un ADR) | Qué se propone |
|---|---|---|---|
| 1 | **Lectura incremental** («lo que cambió desde la marca X») | RF-INT-006 solo habla de «filtros y páginas». Sin marca de cambios, cada actualización exige releer todo | Un recurso de cambios por entidad con **cursor opaco** y, en cada fila, `id`, `version` (la columna que ya existe en toda entidad editable, RN-014, ADR-06), `modificado_en` y un indicador de estado (vigente, anulado, de baja, anonimizado). La herramienta del cliente aplica «insertar o actualizar solo si la versión es mayor», así repetir una lectura es inofensivo |
| 2 | **Orden estable que no pierda filas** | `creado_en` es la hora de **inicio** de la transacción, no la de confirmar (ADR-11, D11-3): una transacción larga confirma después y deja filas **detrás** del cursor. Mismo problema que la copia externa de auditoría. RN-INT-026 (webhooks sin orden) tampoco sirve de cursor | El cursor **solo avanza hasta un horizonte seguro** (ahora menos un margen mayor que el tope de transacción de 4 minutos, el mismo criterio de ADR-11) y el cliente **vuelve a leer una ventana de solape** en cada ejecución. Se descartó un contador por cambio (punto caliente por empresa y no garantiza orden de confirmación) |
| 3 | **Bajas, anulaciones y borrados** | Casi nada se borra físicamente: se anula o se da de baja (ADR-06), y eso aparece como cambio de estado (cubierto por 1). **Excepción:** los borradores sin hijos sí se borran. Además **anonimizar** sobrescribe la fila de datos personales (ADR-12) sin «borrarla» | (a) **Los borradores no se replican** (solo documentos desde su primera confirmación, igual que RN-INT-035 para SAP): así no hace falta señal de borrado físico. (b) La anonimización **sí genera un cambio** visible (la persona figura anonimizada y sus campos personales vuelven vacíos). (c) La respuesta incluye una **«época» del conjunto de datos** que cambia si se restaura un respaldo (ADR-12 y 15): si la época cambia, el cliente **debe recargar todo**; sin eso su copia quedaría por delante de nuestros datos |
| 4 | **Instantánea consistente (carga inicial y recargas)** | Paginar sobre datos que cambian da una foto inconsistente. Una transacción de lectura larga choca con el **tope de 4 minutos** (ADR-03) | **Carga inicial y recargas por archivo** (forma 1), generadas por el trabajador **por entidad, con una marca de corte y conteos**; consistencia **por entidad**, no entre entidades. Después, la API incremental desde esa marca menos el solape. Una instantánea consistente de **todas** las entidades a la vez solo se promete si cabe en el tope; si no, se declara «consistente por entidad» **[SUPUESTO]** |
| 5 | **Volumen y límites para cargas masivas** | RN-INT-015 (60 pedidos por minuto, 10.000 por día) y RN-INT-016 (100 filas por respuesta) permiten, como máximo, unas 6.000 filas por minuto y un millón por día **en teoría**; alcanza para una carga inicial de decenas de miles de filas, pero **RN-INT-013 y RN-INT-041 tratan toda lectura de más de 5.000 filas por día como exportación**: motivo, topes, hoja «Aviso» y auditoría **por cada ejecución**, y ADR-19 ata la descarga a **una persona** (descarga única), que una herramienta automática no es | Un **tipo de clave nuevo, «de sincronización»**, con sus propios límites (valores **[SUPUESTO]**, a fijar por Seguridad y DevOps), **auditado como sincronización** (volumen por día y por entidad, nunca fila por fila) y no como exportación manual. **Esto exige ampliar ADR-19** (entrega a una clave de sincronización, repetible hasta vencer, cifrada por bloques como en ADR-07, con el tope de tamaño por archivo de ADR-19). Crear o ampliar una clave de sincronización pasa por **segunda persona** (ADR-13), porque es el canal por donde sale la totalidad de los datos. Seguridad revisa |
| 6 | **Exportación programada por archivo** | Hoy solo existe el lote de SAP (RF-INT-018 y 019), a pedido y con otro formato | **Paquete de sincronización programado** (diario u horario, lo configura el administrador) que el trabajador genera y el cliente **descarga con su clave**: un archivo por entidad más un **manifiesto** (versión del esquema, marca de corte, conteos, huella del archivo). Mismo mecanismo que la carga inicial (punto 4) |
| 7 | **Qué datos no deben salir** | RN-INT-008 ya limita precios y datos de Personas a claves con `precios.ver` y `datos_personales.ver`; RN-INT-009 excluye lo reservado a personas (sección 12C del registro de permisos); RN-INT-024 (webhooks solo con identificadores); D-030 (la auditoría no guarda valores personales) | **Por defecto, la sincronización no lleva datos personales ni precios.** **Nunca:** campos secretos (ADR-17), semillas, huellas, claves de API, la cola, los registros de plataforma ni la **auditoría** (su copia a un tercero se decide aparte con Cumplimiento). **Con permiso explícito de la clave y sí de Cumplimiento:** campos marcados `dato_personal` (ADR-17, incluidos IMEI y número de línea asignados a una Persona) y la identidad de Personas. Todo lo que salga debe poder **retirarse** de la copia cuando aquí se anonimiza (punto 3): una réplica de datos personales sin esa vía sería una copia no anonimizable. La copia del cliente queda **bajo su responsabilidad** (tabla 1.4) |
| 8 | **Alcance de lo que se lee** | RF-INT-006 y 007 cubren activos, SKU, ubicaciones, catálogos, personas, OC, recepciones, OS, proveedores y centros de costo; **no listan movimientos de stock, saldos, asignaciones ni historial de estados**, que son lo que un cliente de inventario más pide | Agregar esos recursos al alcance de lectura. Reparto en fases: INT-1 llega antes que Personas y OC (INT-2); una réplica útil necesita **las dos partes** |
| 9 | **Reconciliación** | Nada permite al cliente comprobar que su copia coincide | Un recurso de **conteos y huellas por entidad** a una marca de corte, para que su herramienta compare y recargue solo lo que difiere |
| 10 | **Esquema de intercambio publicado** | RF-INT-012 y RNF-INT-008 ya prometen documentación y contratos estables (RN-INT-019: solo se agregan campos) | Publicar, además, **un guion de creación de tablas para SQL Server** generado desde la misma descripción de la API, para que el cliente cree su destino sin traducir a mano. **(a verificar)** que el cliente tenga la versión y las reglas de texto compatibles; y que ese guion se **genera**, no se escribe a mano |

**Quién ejecuta la copia: el cliente la jala, nosotros no empujamos.**
- Razones: (1) el cliente no abre su SQL Server a internet ni nos entrega credenciales de su base (lo que probablemente prefiere su equipo de seguridad); (2) **la plataforma no abre conexiones hacia fuera** hacia sistemas del cliente, el mismo principio que RN-INT-034 aplica a SAP («la frontera son archivos y la API»); (3) RN-INT-023 (protección contra pedidos hacia direcciones internas) **bloquea** webhooks hacia servidores privados o de red interna, que es donde viven muchos SQL Server; (4) si la copia se rompe, el estado vive en su herramienta, no en nuestra cola.
- **Los webhooks quedan como aviso, no como vehículo** (RN-INT-024, 026 y 027: solo identificadores, sin orden, con tope de reintentos): sirven para decir «hay cambios, venga a leerlos», nunca como única fuente. La sincronización **debe funcionar sin ellos**.
- Si el cliente no tiene herramienta propia para jalar: se le puede dar un **ejemplo de script** (no un producto), y todo lo demás (conector que empuje) queda como la forma 3 de 3.1, solo con cliente que pague y con revisión de Seguridad.

**Qué cumple y qué no, de forma sencilla:** con esta API completa el cliente tendrá **una copia de lectura en su SQL Server, con un retraso que él elige, sin datos personales por defecto y sin tocar nuestra base**. No cumple «el dato original vive en mi base» (3.3). Hasta que existan los puntos 1 a 9, **no debe ofrecerse como réplica**; solo como «consulta».

### 3.5 Lo que el Analista debe agregar al módulo INT (propuesta del Arquitecto; los IDs y fases los confirma el Analista)

Son requisitos nuevos que pide este ADR, **todos de Fase 3** y que no se construyen antes de que el CEO apruebe la Etapa 7 ni hasta que exista un cliente real que los pida (sección 4.3).

| ID propuesto | Texto sugerido | Punto de 3.4 |
|---|---|---|
| RF-INT-027 | Clave **de sincronización**: tipo de clave de solo lectura para copiar datos a otro sistema, con permiso propio (nombre sugerido `integraciones.sincronizar`; sensible; reautenticación reciente; **segunda persona** al crear o ampliar) | 5 |
| RF-INT-028 | **Cambios desde una marca**: por entidad, con cursor opaco, `id`, `version`, `modificado_en` y estado (vigente, anulado, de baja, anonimizado) | 1, 2, 3 |
| RF-INT-029 | **Época del conjunto de datos** en cada respuesta de cambios; cambia si se restaura un respaldo | 3 |
| RF-INT-030 | **Paquete de sincronización** (carga inicial y recargas): un archivo por entidad más un manifiesto con versión del esquema, marca de corte, conteos y huella; generado en segundo plano; programable por el administrador | 4, 6 |
| RF-INT-031 | **Reconciliación**: conteos y huellas por entidad a una marca de corte | 9 |
| RF-INT-032 | Ampliar el alcance de lectura a **movimientos de stock, saldos, asignaciones e historial de estados** | 8 |
| RF-INT-033 | Publicar el **guion de tablas de destino para SQL Server** generado desde la descripción de la API | 10 |
| RN-INT-050 | La sincronización **no incluye** datos personales ni precios salvo permiso explícito de la clave (RN-INT-008); **nunca** incluye secretos, huellas, claves, cola, registros de plataforma ni auditoría | 7 |
| RN-INT-051 | **Los borradores no se sincronizan**; un documento entra a la sincronización desde que sale de Borrador | 3 |
| RN-INT-052 | Una **anonimización** (ADR-12) genera un cambio visible en la sincronización y deja vacíos los campos personales; una **supresión** debe poder propagarse | 3, 7 |
| RN-INT-053 | El cursor avanza **solo hasta un horizonte seguro** (margen mayor que el tope de transacción) y el cliente relee un solape; la repetición de una lectura **no altera el resultado** (aplicar solo si la versión es mayor) | 2 |
| RN-INT-054 | Una clave de sincronización tiene **límites propios** (pedidos por minuto, filas por día, tamaño de archivo) y su uso se registra como **sincronización** (volumen por día y entidad, sin filas), no como exportación por persona; excepción documentada a RN-INT-013 y RN-INT-041 | 5 |
| RN-INT-055 | **La plataforma no abre conexión hacia la base del cliente** (extiende RN-INT-034): el cliente jala; los webhooks son solo aviso y la sincronización funciona sin ellos | quién ejecuta |
| RN-INT-056 | Consistencia declarada: **por entidad**, no entre entidades, salvo que la carga quepa en el tope de la transacción **[SUPUESTO]** | 4 |
| RN-INT-057 | Si cambia la **versión del esquema** (se agregaron campos), el manifiesto lo declara; las versiones se retiran con el aviso de RN-INT-020 | 10 |
| CA-INT (nuevos) | Cursor sin saltos con una transacción larga abierta; dos empresas con la misma clave sin mezcla (RN-INT-001); repetir la lectura no duplica; anonimizar aparece en el siguiente cambio; tras una restauración la época cambia; la clave de sincronización sin permiso personal no devuelve campos personales ni precios | todos |

**Cambios que esto obliga a hacer fuera de INT** (para que no queden sueltos): ADR-19 (entrega a clave de sincronización) y el registro de permisos (`integraciones.sincronizar`, a cargo del Analista); Cumplimiento decide si se permiten datos personales en la sincronización y la lista de campos; Seguridad revisa el canal; QA agrega la suite de cursor y época.

---

## 4. Recomendación y decisión por etapas

### 4.1 Qué se hace en la v1
- **Solo nivel A**, como está en los ADR 01 a 24. El piloto gratuito (`piloto-gratuito.md`) es una variante de A con datos de ejemplo; **no** es una oferta de B ni C, y sigue vigente D-064 (nada de datos reales antes de las condiciones legales).
- **No se construye** ningún despliegue dedicado ni SQL Server. Cualquier conversación comercial sobre B o C se hace sobre este ADR, sin comprometer plazos.

### 4.2 Qué se prepara hoy, sin costo (cuesta disciplina, no trabajo)
1. **Todo SQL de un solo motor vive en una capa.** Ya lo exigen ADR-03 y 14 (Prisma solo en `nucleo/aislamiento`; SQL crudo solo en `nucleo/aislamiento` y en `repos/` marcados). Se agrega a la regla de revisión: **ningún módulo de negocio (servicios, pantallas) contiene SQL ni operadores propios de PostgreSQL** (`jsonb`, `ON CONFLICT`, `SKIP LOCKED`, `LISTEN`, arreglos). Una prueba de arquitectura de integración continua lo vigila.
2. **Inventario automático de lo específico del motor.** El archivo `src/db/objetos-solo-sql.md`, que ADR-06 ya manda **generar** desde el catálogo, sirve como lista de lo que habría que portar. No hay que escribir nada nuevo; solo mantenerlo vivo y no dejar objetos fuera de él.
3. **Extensiones: las justas.** Lo permitido es la lista de ADR-06 (`pg_trgm`, `btree_gist`, `pgcrypto`, `btree_gin` si H10 la elige). **Cualquier extensión nueva exige ADR** y se anota qué haría falta para reemplazarla. `pgcrypto` no se usa en tiempo de ejecución (el cifrado y las huellas son de la aplicación, ADR-07 y 09).
4. **Pruebas de aislamiento como contrato.** Los siete criterios de QA de ADR-03 y los casos de H-SEG-41 se escriben contra la interfaz `conEmpresa` y las funciones de `nucleo`, **sin nombrar PostgreSQL** salvo en el arranque. Así un segundo motor se valida con las mismas pruebas. Se pide a QA.
5. **Configuración por variables.** Ningún nombre de servidor, proveedor (Neon, Render, Resend) ni ruta está escrito en el código; el proveedor de correo y el almacén externo se eligen por configuración (ADR-16, 11, 12).
6. **Guarda del modo dedicado** (una sola empresa por base, 1.2) y **datos de arranque** (primeras personas de plataforma) como pasos de instalación, no como código especial.
7. **Versión visible y comprobación previa:** la imagen declara su número de versión y la comprobación previa de 1.3 existe como guion. Ambas son pequeñas y sirven también a nuestro propio ambiente.
8. **Pedir a DevOps** que la integración continua pruebe «actualizar desde la versión anterior con datos» y que la definición de las tareas programadas sea portable (no ligada a un proveedor).

### 4.3 Qué se decide solo con un cliente real que pague

| Decisión | Condición para tomarla | Quién |
|---|---|---|
| Ofrecer **B-nuestra**, **B-cliente** o **C** | Un cliente concreto, contrato firmado y precio acordado; las 8 condiciones legales previas ya cumplidas | CEO (dinero y legal); Gerente de TI (técnica) |
| Construir el **adaptador de SMTP**, la **definición de contenedores para servidores del cliente** y el **procedimiento de actualización** (1.3) | Lo mismo | DevOps y Backend |
| Construir **réplica** (forma 2 con las piezas de 3.4 y 3.5; las formas 1 y 3 solo si el cliente las exige) | Un cliente que la pida y financie; llega con el módulo de Integraciones y API, no antes de la Etapa 7 | CEO; Gerente de TI; Seguridad y Cumplimiento revisan el canal |
| **Prototipo H-SQL** y, si pasa, soporte de **SQL Server** | Un cliente que lo exija **como condición de compra** y asuma el costo inicial y el continuo | CEO (dinero); Gerente de TI (técnica); Seguridad (revisa de cero) |
| Si no hay cliente real | No se hace nada de esto | |

**Regla de oro:** primero se prueba B o C con PostgreSQL con un cliente real; SQL Server se evalúa **después** y solo si sigue siendo imprescindible.

---

## 5. Qué es dinero o legal para el CEO

Ninguna cifra; ninguna se decide sin él. Todo lo técnico de este ADR lo resuelve el equipo.

1. **[ESCALAR AL CEO] Modelo comercial de B y C.** Cómo se cobra una instalación dedicada, su actualización y su soporte (cuota única, mensual, por usuario…) y qué incluye. Operar en la nube del cliente o en sus servidores **cuesta trabajo continuo de nuestro equipo**; el precio debe cubrirlo. Sin cifras en este documento.
2. **[ESCALAR AL CEO] Modelo de soporte y plazos.** Tiempo de respuesta, quién y cuándo se conecta, qué pasa fuera de horario. Los plazos de aplicar parches de seguridad (1.3) y de avisar de un incidente (1.4) son obligaciones contractuales.
3. **[ESCALAR AL CEO: confirmar con abogado] Contratos de responsabilidad.** Quién responde ante una fuga o una pérdida en cada reparto de la tabla 1.4; límites de responsabilidad; cláusula de que perder la llave maestra no es responsabilidad nuestra (ADR-07); acuerdo de tratamiento de datos si nosotros operamos con acceso.
4. **[ESCALAR AL CEO: confirmar con abogado] Residencia de datos.** Qué niveles cumplen cada exigencia de país o de sector (ver tabla 3.3: «cumple» ahí es técnico, no jurídico). Transferencias desde nuestra nube hacia otro país.
5. **[ESCALAR AL CEO, irreversible] Entrega de la plataforma a servidores del cliente (nivel C).** Una vez que la imagen está en una red ajena **no se puede retirar**. Qué licencia de uso se concede, por cuánto tiempo, si se entrega código fuente (recomendación del Arquitecto: **solo imágenes, no código fuente**), qué pasa al terminar el contrato y si se acepta un depósito de código en garantía. Es propiedad intelectual: abogado.
6. **[ESCALAR AL CEO] Costo de operar varios entornos.** Cada cliente dedicado agrega pruebas de actualización, soporte y monitoreo; y SQL Server, el costo continuo de la sección 2.3. Debe fijarse **un número máximo de clientes dedicados** antes de aceptar el primero (cifra: decisión del CEO).
7. **Licencias de terceros.** Si un cliente aporta Azure o SQL Server, **las licencias y la nube son del cliente**. Si nosotros ponemos infraestructura en su nombre, es un gasto nuestro que hay que cobrar.

---

## 6. Ficha para el CEO: qué responder a un cliente en una reunión

**Una página. Sin términos técnicos. Lo que sí se puede decir y lo que no.**

**Resumen en una frase.** Hoy la plataforma funciona en nuestra nube con los datos de cada empresa separados. Si un cliente necesita que sus datos estén en su propia infraestructura, hay **tres caminos posibles, pero todavía no los vendemos**: cada uno se estudia con el cliente y se acuerda por contrato.

| Pregunta del cliente | Respuesta sugerida | Qué NO prometer |
|---|---|---|
| **«¿Mis datos pueden estar en mi propia base de datos?»** | «Sí es posible, de dos maneras: una base dedicada en su nube (por ejemplo la de Azure) o una instalación completa en sus servidores. La base sería PostgreSQL, un tipo de base de datos muy extendido.» | Fechas ni precios; que ya esté listo |
| **«Tengo SQL Server de Azure. ¿Puedo usarlo?»** | «Nuestra plataforma está construida sobre PostgreSQL. Usar SQL Server como base principal es un trabajo grande, que hoy no hacemos. Lo que sí podemos ofrecerle es **una copia de sus datos que se actualiza en su SQL Server**, para que haga informes o conecte otros sistemas.» | «Sí, funciona en SQL Server» |
| **«¿Y no podemos conectarnos con una API para ver los datos en mi SQL?»** | «Sí, es la vía que recomendamos. Usted recibe una clave de solo lectura y su herramienta va trayendo los cambios a su SQL Server, con el retraso que usted elija. Nosotros no entramos a su base. Esa función está prevista, pero todavía no está construida.» | Que ya existe, o que incluye datos personales y precios sin permiso expreso |
| **«¿Esa copia es lo mismo que tener mis datos en mi base?»** | «No exactamente. La copia es **solo para leer** y llega con un pequeño retraso. El dato original sigue en la base de la plataforma. Si necesita que el original esté en su infraestructura, es la base dedicada o la instalación en sus servidores.» | Que la copia equivale a «los datos viven en mi base» |
| **«¿Quién hace las copias de seguridad?»** | «En una instalación dedicada, las copias son suyas y son de su propiedad; nosotros le damos el procedimiento para restaurar correctamente. En nuestra nube las hacemos nosotros.» | Que nosotros respaldamos lo que corre en sus servidores, salvo contrato |
| **«¿Quién puede ver mis datos?»** | «En su instalación, solo las personas que usted autorice. Si necesitamos entrar a ayudarle, usted nos da un permiso que dura como máximo 24 horas, queda registrado y no podemos descargar datos en masa.» | Que nunca podríamos ver nada, si nosotros operamos el sistema |
| **«¿Y la clave que protege los datos más delicados?»** | «Si usted opera el sistema, la clave está en su caja fuerte de claves y nosotros no la tenemos. Si lo operamos nosotros, la clave sigue estando en su caja fuerte, pero el sistema necesita usarla para funcionar, y nos obligamos por contrato a no hacerlo con otro fin.» | «La clave está fuera de nuestro alcance» cuando operamos nosotros |
| **«¿Cómo se actualiza?»** | «Le enviamos versiones cerradas con instrucciones y una revisión previa. Las correcciones de seguridad llegan con aviso y plazo. Volver atrás significa restaurar la copia de seguridad.» | Actualizaciones automáticas sin su intervención en sus servidores |
| **«¿Qué pasa si hay un incidente de seguridad?»** | «Existe un procedimiento. Usted, como dueño de los datos, decide a quién avisar y cómo; nosotros corregimos la plataforma y le ayudamos a contenerlo.» | Plazos de aviso; eso lo define el abogado |
| **«¿Mis datos están en mi país?»** | «Con una instalación en sus servidores, sí; en la nube compartida, depende de dónde alojemos. Lo confirmamos con nuestro abogado antes de firmar.» | Cumplimiento de una ley concreta |
| **«¿Cuánto cuesta y cuánto tarda?»** | «Se cotiza según el caso. Aún no tenemos precio de lista.» | **Cualquier cifra o fecha** |
| **«¿Puedo llevarme mis datos si me voy?»** | «Sí: la plataforma permite exportarlos con permiso y registro. Los términos exactos van en el contrato.» | Formatos o plazos concretos |
| **«¿Pueden empezar ya con mis datos reales?»** | «Todavía no: la plataforma solo se prueba con datos de ejemplo hasta cumplir unas condiciones legales previas.» | Datos reales antes de que se cumplan |

**Antes de la reunión, el CEO debe tener claras estas cuatro decisiones suyas (sección 5):** cómo cobra una instalación dedicada, si entrega solo la aplicación o también el código, qué responsabilidad acepta ante una fuga, y cuántos clientes de este tipo está dispuesto a atender a la vez.

---

## Consecuencias

- **Una sola base de código** sirve a los tres niveles; el costo está en operar, no en programar. Aun así hay tres piezas de trabajo nuevas y pequeñas (adaptador de SMTP, paquete para servidores del cliente, procedimiento de actualización) que **no se hacen sin cliente real**.
- Los clientes dedicados añaden **superficie de soporte**: versiones desfasadas, entornos que no controlamos, restauraciones mal hechas. La ventana corta de versiones y la comprobación previa son la mitigación; **no desaparecen el riesgo**.
- «Una empresa por base» **refuerza** el aislamiento para esos clientes (no comparten base con nadie), pero **debilita una garantía**: en C no tenemos visibilidad de cómo se opera. La seguridad de esa instalación pasa a depender también de la disciplina del cliente.
- SQL Server como base principal duplicaría pruebas, migraciones y revisión de seguridad **de por vida**. Mantener el diseño con un solo motor sigue siendo lo más simple que cumple el requisito.
- Los ADR 01 a 24 **no se modifican** por este documento. Si se acepta, ADR-01 gana una sección «Cambios» que apunte aquí (la agrega el Arquitecto al ratificarse).

## Qué prueba lo valida

- **Hoy:** prueba de arquitectura (sin SQL de un solo motor fuera de la capa, 4.2.1); suite de aislamiento escrita contra la interfaz (4.2.4); inventario `objetos-solo-sql.md` generado y sin diferencias.
- **Antes del primer cliente dedicado:** prueba de actualización desde la versión anterior con datos; arranque con **más de una empresa en modo dedicado = se niega**; la instalación completa arranca en un entorno limpio sin red hacia nosotros; restauración de ensayo con los dos pasos propios (contadores y anonimizaciones) en una base de ejemplo.
- **Solo si se aprueba SQL Server:** prototipo H-SQL y repetición completa de H1 a H12 y de las pruebas de aislamiento, con revisión de Seguridad independiente.

## Verificaciones pendientes («a verificar»)

| Tema | Quién lo confirma | Fuente |
|---|---|---|
| Qué servicios PostgreSQL administrados (Azure y otras nubes) permiten roles sin BYPASSRLS, funciones con privilegios y las extensiones de ADR-06 | DevOps | Documentación oficial de cada nube |
| Conexión privada entre nuestra aplicación y una base en la nube del cliente | DevOps | Documentación oficial |
| Almacenamiento de solo agregar con bloqueo de borrado en la nube o servidores del cliente | DevOps | Ídem |
| Todas las afirmaciones de SQL Server de la sección 2 (política de seguridad, contexto de sesión y reciclado de conexiones, enlace de esquema y migraciones, particiones, JSON, índices filtrados y semántica de nulos, ordenamiento, tipos, concurrencia) | Ingeniero de Datos | Documentación oficial de Microsoft |
| Soporte y límites de Prisma con SQL Server; dialecto de Kysely para SQL Server | Desarrollador Backend | Documentación oficial de Prisma y Kysely |
| Si existe una librería madura de cola para SQL Server | Ingeniero de Datos | Búsqueda y revisión de mantenimiento |
| Qué adaptadores de correo implementa hoy ADR-16 | DevOps y Backend | ADR-16 y código cuando exista |
| ADR-23 con instalaciones de pocas personas de plataforma | Seguridad | ADR-23 |

## Preguntas abiertas para el CEO (solo dinero, legal o irreversible)

Ver sección 5, puntos 1 a 7. Ninguna es de producto ni de ingeniería.

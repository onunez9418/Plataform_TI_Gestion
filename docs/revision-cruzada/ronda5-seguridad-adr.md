# Ronda 5: Especialista en Seguridad. Revisión de los ADR del Arquitecto

**Fecha:** 2026-10-26 · **Alcance:** `docs/arquitectura/` (README, prototipo-tecnico y los 20 ADR). No hay código todavía: todo lo que sigue es revisión de diseño.
**Qué abrí:** README, `prototipo-tecnico.md`, ADR 01 a 20 completos; `docs/revision-cruzada/ronda4-especialista-seguridad.md`; D-022, D-030, D-035, D-039, D-048, D-050, D-052, D-054, D-059, D-061, D-065, D-068, D-073, D-075, D-077, D-080 en `docs/equipo/decisiones.md`; `docs/operaciones/procedimiento-incidente-datos.md` v0.3 completo; `docs/operaciones/plan-entornos-y-costos.md` (1.2 y 6); `docs/registro-permisos.md` (PS-01 a 06, 19, 20); RF-ACC, RF-PLA, RF-AUD, RS-46 a 51 y CA-041 del documento funcional.
**Cómo leer:** "Hecho" = se puede comprobar en el archivo y la línea citados. "Opinión" = mi juicio de riesgo. Las gravedades son crítica, alta, media y baja. La numeración sigue la última usada (H-SEG-32) y empieza en **H-SEG-33**.
**Profundidad:** revisé a fondo los ADR 03, 04, 07, 08, 09, 13 y 19. Los demás los leí completos para comprobar coherencia con esos; su veredicto es de lectura, no de análisis línea por línea.

---

## 1. Resumen: veredicto por ADR

| ADR | Veredicto | Hallazgos que lo condicionan |
|---|---|---|
| 01 Ejecución y alojamiento | Aprobado con condiciones | H-SEG-42, H-SEG-50 |
| 02 Cola, eventos, reloj | Aprobado con condiciones | H-SEG-44, H-SEG-46 |
| 03 Aislamiento y lectura de soporte | **Aprobado con condiciones** (cuatro de ellas deben estar escritas antes del prototipo) | H-SEG-33, 34, 35, 36, 37, 41 |
| 04 Roles y tablas globales | **Aprobado con condiciones.** Firmo la lista de tablas globales solo con las condiciones de abajo | H-SEG-33, 38, 39, 40, 42, 43, 44 |
| 05 Empresa en la dirección | Aprobado | ninguno |
| 06 Convenciones del esquema | Aprobado | ninguno |
| 07 Secretos y llaves | Aprobado con condiciones | H-SEG-45, 47, 48 |
| 08 Acceso, sesiones, segunda verificación | Aprobado con condiciones | H-SEG-46, 50, 51, 52, 53 |
| 09 Huellas, RS-51, código corto | Aprobado con condiciones. **El código corto como tal queda aprobado** | H-SEG-45, 46, 49 |
| 10 Catálogo de permisos | Aprobado (una observación en H-SEG-37) | H-SEG-37 |
| 11 Auditoría | Aprobado con condiciones | H-SEG-37, 40, 43, 62 |
| 12 Registro de anonimizaciones | Aprobado con condiciones | H-SEG-62 |
| 13 Doble control | Aprobado con condiciones | H-SEG-59, 60, 61 |
| 14 Estructura de módulos | Aprobado | ninguno |
| 15 Contadores | Aprobado (observación: `siguiente` debe correr en su propia mini-transacción de `conEmpresa`, no como función DEFINER que reciba la empresa como parámetro) | ninguno |
| 16 Limitador y correo | Aprobado (observación: si `limite_consumir` falla, el ingreso y la exportación deben **fallar cerrados**) | H-SEG-46 |
| 17 Campos personalizados | Aprobado | ninguno |
| 18 Importación | Aprobado (observación: validar el tipo de archivo por su contenido y no por la extensión; la librería de lectura la escoge Seguridad en el prototipo) | ninguno |
| 19 Puerta de exportación | **Aprobado con condiciones** (ver sección 2) | H-SEG-54 a 58 |
| 20 Registros técnicos | Aprobado con condiciones | H-SEG-44, 49 |

**Ningún ADR queda rechazado.** Los hallazgos **Altos** son cuatro (H-SEG-33, 45, 46, 54). No hay críticos. Los cuatro son cambios de texto de ADR, no de código: no retrasan el prototipo si se incorporan antes de que empiece.

---

## 2. Lo que se me preguntó, en directo

### 2.1 ADR-19: ¿apruebo guardar el resultado de una exportación cifrado en la base por 24 horas?

**Sí, con condiciones.** Razones:
- **Hecho:** el resultado se cifra con una llave derivada de la maestra (ADR-07, propósito `exportacion`), y la maestra vive fuera de la base y de los respaldos. Quien se lleve la base, o un respaldo, o tenga el rol de plataforma, ve solo texto cifrado.
- **Opinión:** es la opción más segura de las que hay sin almacén de archivos. No es "almacenamiento de archivos" en el sentido de D-022 (que habla de facturas y adjuntos subidos por personas); es una fila temporal. Cumplimiento debe confirmar esa lectura de D-022; no hace falta el CEO, porque no añade un gasto que no esté ya en la base gestionada, salvo que DevOps mida lo contrario (ver H-SEG-56).
- **Lo que el ADR no resuelve** y debe resolver antes de aprobarse: quién puede descargar (H-SEG-54), que el trabajador vuelva a comprobar permisos al generar (H-SEG-55), el borrado y los topes del almacenamiento temporal (H-SEG-56), cómo se entrega un derecho de datos (H-SEG-57).
- **Límite que hay que declarar:** el "vence a las 24 horas" vale para la base viva. Las copias de respaldo (30 diarios y 12 mensuales, D-032) conservarán ese texto cifrado hasta que venzan. Como no hay destrucción de llave por empresa (ADR-07), la maestra los abre. Es la misma postura que ya tienen todos los datos personales en los respaldos; solo hay que escribirla en el aviso de privacidad.
- **Plan B si Cumplimiento dice que no:** generar el archivo al momento de la descarga, en flujo, sin guardarlo. ADR-01 usa contenedores de ejecución continua, así que no hay límite de segundos; se pierde la barra de avance.

### 2.2 Las cinco propuestas del Arquitecto que cambian decisiones anteriores

| Propuesta | ¿La avalo? | Condiciones |
|---|---|---|
| **D-030.8** partición de auditoría mensual en vez de anual (ADR-11) | **Sí.** Con mensual la retención es exactamente de 60 meses. Mantiene rol `mantenimiento`, dos aprobadores y interruptor legal apagado | Definir qué rol crea las particiones y cómo se protege cada una (H-SEG-40). Los dos aprobadores deben ser personas de plataforma autenticadas, no filas que se inserten (H-SEG-33). Una partición solo se purga cuando **todo** el mes tiene 60 meses |
| **D-039.4** cinco tablas globales nuevas (`autorizacion_soporte`, `registro_plataforma`, `limite_uso`, `purga_acta`, `cola.*`) | **Sí, con condiciones.** Firmo las cinco | `app_plataforma` sin escritura directa en `autorizacion_soporte` y `purga_acta`, y `registro_plataforma` solo agregar (H-SEG-33). `cola.*` con mensajes de error saneados (H-SEG-44). `limite_uso` sin condiciones |
| **D-039.10** lectura de soporte (ADR-03) | **Avalo la dirección y las adiciones del Arquitecto** (auditoría antes de cada lectura con falla cerrada, uso ligado a una sola persona, 24 horas como CHECK, banner). **No avalo el texto tal como está**: tiene un error de orden y tres huecos | H-SEG-33, 34, 35, 36, 37 |
| **D-050.5** marca de "movimiento posterior" con secuencia global en vez de por empresa (ADR-18) | **Sí.** Sigue siendo creciente, que es lo que importa, y no hay punto caliente | La marca no se muestra en pantallas, exportaciones ni API. Es **baja** y solo informativa: una secuencia global deja deducir, desde una empresa, cuánta actividad tiene el resto de la plataforma |
| **D-065 S-34e** huella con HMAC y llave ("pepper") derivada de la maestra para todo valor de entrada (ADR-09) | **Avalo la intención para valores de poca entropía** (código corto, claves del limitador). **No avalo que los códigos de recuperación y las claves de API dependan de la maestra** | H-SEG-45 |

### 2.3 Procedimiento de incidente v0.3: lectura y Anexo B

- **Confirmo por escrito que leí completas la sección 6 (6.0 a 6.5) y el Anexo C (C.1 a C.8) de la v0.3**, y el resto del documento que redacté yo.
- **Anexo B:** la línea ya está. La v0.3 de Cumplimiento trae en la plantilla (línea 251) `## Evaluación de datos personales y decisión de aviso: ver ficha del Anexo C.7`, y así lo anota el historial de cambios. Agregarla otra vez la duplicaría, así que **no edité el procedimiento**. Es la única edición permitida fuera de mi informe y no hizo falta.
- **Coherencia con los ADR:** la sección 6 y el Anexo C encajan con D-059, D-048, D-052, D-054 y D-077. La tabla C.3 es coherente con ADR-11 (la auditoría guarda IP y motivos por valor). Encontré cuatro puntos donde el procedimiento pide algo que los ADR todavía no dan; los dejé como hallazgos:
  1. El Anexo A (pasos 1 a 3) y D-052.4 piden revocar sesiones "de una persona, de una empresa o de todas", suspender claves de API y reaplicar suspensiones. ADR-04 solo lista `sesion_revocar` y no tiene esas funciones (H-SEG-38).
  2. C.5.2 y D-080(b) piden **congelar** la anonimización y la purga durante un incidente. Ningún ADR lo implementa (H-SEG-62).
  3. La pregunta 2 de 6.0 ("¿de cuántas personas?") y la fila de exportaciones de C.3 se contestarían mejor si la auditoría de una exportación guardara la huella del archivo y el número de personas incluidas (H-SEG-58).
  4. La sección 4 y el Anexo A ("si la causa es la cuenta de plataforma, revisar el registro de plataforma") suponen que ese registro no se puede alterar. El ADR no lo dice (H-SEG-33).

---

## 3. Hallazgos

Formato: **ID · gravedad · título.** Hecho, Riesgo, Cambio, Quién. Quien corrige es el rol indicado, por la Jefatura de Proyecto; yo no toco los ADR.

### ADR-03 y ADR-04: aislamiento, roles y lectura de soporte

**H-SEG-33 · ALTA · `app_plataforma` podría escribir sus propias autorizaciones de soporte, y sus registros no son "solo agregar".**
- **Hecho:** ADR-04 línea 14 y fila 14 (línea 39) dan a `app_plataforma` acceso a `autorizacion_soporte` ("`app_plataforma` + funciones") y no dicen que sea solo lectura. ADR-03 línea 37 dice que la crea un administrador de la empresa mediante `autorizacion_soporte_crear`, y la línea 47 que "una persona de plataforma no puede crear su propia autorización", pero no hay ningún mecanismo que lo impida si el rol tiene INSERT o UPDATE. Lo mismo vale para `registro_plataforma` (fila 15) y `purga_acta` (fila 17, "mantenimiento y app_plataforma"): el ADR no dice que sean solo agregar ni que los dos aprobadores sean personas autenticadas.
- **Riesgo:** una cuenta de plataforma comprometida, que es justo la amenaza que toda esta parte quiere contener, se insertaría una autorización de 24 horas para cualquier empresa y leería sus datos (salvo las tablas `sin_soporte`). El consentimiento de la empresa quedaría sin efecto. Con UPDATE podría también alargar `vence_en` moviendo `creada_en`. Con escritura libre en `registro_plataforma`, borraría sus propias huellas.
- **Cambio:** (1) `app_plataforma` tiene **solo SELECT** sobre `autorizacion_soporte`; toda alta, uso y revocación pasa por funciones DEFINER. (2) Disparador: de una autorización solo pueden cambiar `revocada_en` (de nulo a valor) y `primera_vez_usada_por` (de nulo a valor); nada más. (3) `registro_plataforma` y `purga_acta`: INSERT y SELECT únicamente, con el mismo disparador anti-UPDATE/DELETE de la auditoría; los aprobadores de una purga se registran por una función que identifica a la persona desde su sesión de plataforma. (4) Pruebas nuevas en la lista (3) de ADR-04: `app_plataforma` no puede INSERT/UPDATE/DELETE en esas tres tablas excepto lo anterior.
- **Quién:** Arquitecto (ADR-03 y 04), Ingeniero de Datos (privilegios y disparadores).

**H-SEG-34 · MEDIA · `iniciar_lectura_soporte` confía en un identificador que le pasa el servidor.**
- **Hecho:** ADR-03 línea 41: `iniciar_lectura_soporte(autorizacion_id, persona_plataforma_id)`. La línea 53 lo admite ("confía en que el servidor de aplicación indica quién es la persona de plataforma"). Los identificadores son UUID v7: únicos pero no secretos. Los rechazos de esta función solo se prueban como "cero filas" o "rechazo", no como evento.
- **Riesgo (opinión):** quien consiga ejecutar la función con el rol de la aplicación y conozca un par válido (autorización, persona) entra. Con H-SEG-36 ya aceptado el techo de la defensa, hay que impedir al menos que un simple identificador sirva de credencial.
- **Cambio:** la función recibe la **huella de la sesión de plataforma** (igual que `abrir_contexto` recibe la de la sesión) y deduce la persona dentro; exige verificación reciente con llave física (ADR-08, H-SEG-51). Regla general para toda función DEFINER de la lista: **ninguna acepta un identificador de usuario, empresa o persona como prueba de quién llama**; recibe la credencial. Todo rechazo (vencida, ajena, usada por otra persona, revocada) escribe un evento de seguridad y alimenta la alerta que el procedimiento ya prevé en la sección 3 ("sesión de soporte fuera de lo autorizado").
- **Quién:** Arquitecto.

**H-SEG-35 · MEDIA · El orden del flujo de soporte es imposible: marca el primer uso dentro de una transacción de solo lectura.**
- **Hecho:** ADR-03 líneas 39 a 41: el paso 1 hace `SET TRANSACTION READ ONLY`; el paso 2 llama a la función, que debe recordar quién la usó primero (`primera_vez_usada_por`, línea 37). PostgreSQL rechaza cualquier escritura en una transacción de solo lectura, también dentro de una función DEFINER.
- **Riesgo:** o la prueba "usada por otra persona = rechazo" falla en el prototipo, o alguien quita el solo lectura para que funcione. Además, sin bloqueo, dos personas de plataforma que empiecen a la vez podrían marcarse ambas como primera.
- **Cambio:** dividir en dos pasos: (a) una transacción corta de escritura que hace atómicamente `UPDATE autorizacion_soporte SET primera_vez_usada_por = persona WHERE id = $1 AND vence_en > ahora AND revocada_en IS NULL AND (primera_vez_usada_por IS NULL OR primera_vez_usada_por = persona) RETURNING empresa_id` y escribe la auditoría previa; (b) luego la transacción de solo lectura, cuya función solo comprueba y fija el contexto. Prueba nueva en H2: dos personas empiezan a la vez, gana una.
- **Quién:** Arquitecto, Ingeniero de Datos.

**H-SEG-36 · MEDIA · La base no impide el cambio de empresa ni de "modo soporte" si alguien ejecuta SQL propio con el rol de la aplicación.**
- **Hecho:** `app.empresa_id` y `app.modo_soporte` son variables de la transacción (ADR-03 líneas 19 y 29). Cualquier sentencia ejecutada como `app_empresa` puede cambiarlas con `set_config`, también dentro de una transacción de solo lectura. La política `sin_soporte` (línea 26) depende de `app.modo_soporte`.
- **Riesgo (opinión):** la seguridad por fila **sí** protege contra el olvido de un filtro, que era el riesgo #2. **No** protege contra una inyección de SQL ni contra código que llame a `set_config` con otro valor. La frase "Verificar que las reglas de la base lo impiden aunque falle el código" es cierta solo en el primer caso. En soporte el efecto es que las tablas "sin soporte" (claves, cola de derechos, filas de importación) se protegen igual que el aislamiento, por una variable, no por permisos.
- **Cambio:** (1) Escribirlo así en ADR-03 y en las pruebas, sin afirmar más de lo que hay. (2) Regla de código con prueba en integración continua: sin SQL crudo (`$queryRawUnsafe`, `$executeRawUnsafe`) en ningún lugar; `set_config` solo dentro de `nucleo/aislamiento`; consultas crudas solo con parámetros. (3) **Alternativa que recomiendo evaluar en H2** (decide el Gerente de TI, cambia D-039.3 de cinco a seis roles): un rol `app_soporte` de solo SELECT, sin permisos sobre las tablas `sin_soporte`, que se usa solo desde el servicio de la consola (H-SEG-42). Así las tablas restringidas se protegen por permisos y no por una variable, y los usuarios de las empresas ni siquiera pueden abrir una sesión de soporte.
- **Quién:** Arquitecto (texto y alternativa), Gerente de TI (decide la alternativa), QA (prueba de lint).

**H-SEG-37 · MEDIA · Soporte no encaja en la auditoría ni en el catálogo de permisos tal como están escritos.**
- **Hecho:** (a) ADR-03 línea 45 dice que la auditoría de la empresa lleva autor "plataforma: persona X". ADR-11 línea 12 define tres tipos de autor (`membresia | integracion | sistema`) con un CHECK de "exactamente una" columna, y en la misma línea dice que "soporte actúa como autor de plataforma". CA-041 repite los tres tipos. Con el CHECK escrito, la fila de soporte se rechaza (y por la falla cerrada no hay lectura) o se camufla como "sistema". (b) El registro de permisos tiene PS-03 (lado plataforma) pero **ningún permiso** para que el administrador de la empresa autorice el soporte; ADR-10 dice que usar un permiso inexistente no compila. (c) La sesión de soporte no debe poder usar la puerta de exportación ni lecturas masivas por API; ADR-19 no lo dice.
- **Cambio:** (a) ADR-11 agrega un cuarto autor `plataforma` con `autor_plataforma_persona_id` y lo incluye en el CHECK. (b) Analista (vía Jefatura): nuevo permiso `empresa.autorizar_soporte`, sensible, 2F, verificación reciente, y también revocar; avisa por correo a los administradores al usarse por primera vez y al revocarse. (c) `puertaExportacion` y la lectura masiva rechazan sesiones de soporte. Prueba para cada una.
- **Quién:** Arquitecto (a y c), Analista (b).

**H-SEG-38 · MEDIA · La lista cerrada de funciones DEFINER no cubre lo que plataforma, el procedimiento de incidente y la restauración necesitan.**
- **Hecho:** ADR-04 línea 54 no incluye: crear, suspender y reactivar empresa (PS-01); rescate con dos personas (PS-02); ajustar topes (PS-04); acceso de emergencia (PS-05); revocar sesiones de una persona, de una empresa o de todas, y enlaces (Anexo A paso 1, D-052.4, RS-49); suspender clave de API (Anexo A paso 2); aprobación de purga (`purga_acta`); crear particiones de auditoría; congelar anonimización (H-SEG-62). Como `empresa` y `membresia` tienen seguridad por fila, `app_plataforma` no puede tocarlas directamente.
- **Riesgo:** la prueba de CI falla ante cualquier función nueva sin ADR (ADR-04 línea 56). Bajo presión, el camino fácil es dar a `app_plataforma` permisos directos o relajar la lista. Y el control dual de PS-02 y PS-05 tiene que vivir **dentro** de la función, no en la pantalla.
- **Cambio:** completar la lista antes de que yo firme las tablas globales. Cada función de PS-02 y PS-05 verifica dentro de la base las dos personas (o la persona más el contacto confirmado), la espera de 24 horas y el veto (RF-PLA-012), y escribe `registro_plataforma`.
- **Quién:** Arquitecto, Ingeniero de Datos.

**H-SEG-39 · MEDIA · Endurecimiento de funciones y roles no escrito.**
- **Hecho:** ADR-04 línea 56 dice "fija `search_path`" pero no que `pg_temp` va al final ni que no se incluye `public`. No dice que se revoque EXECUTE a PUBLIC. En PostgreSQL toda función nueva puede ser ejecutada por PUBLIC por defecto. La prueba (4) de la línea 19 compara solo `mantenimiento` y `lector_auditoria`. La prueba (2) comprueba solo a `app_empresa` (no dueño, sin BYPASSRLS, sin superusuario).
- **Riesgo:** `purgar_particion_auditoria` y otras funciones restringidas serían ejecutables por `app_empresa` (sus propias guardas las protegen, pero dependemos de una sola capa). Un objeto creado en `public` o en un esquema temporal podría sustituir a uno usado por una función DEFINER.
- **Cambio:** `REVOKE ALL ... FROM PUBLIC` en cada función y GRANT explícito; matriz exacta rol por función (ya prevista, extenderla a los cinco roles y a PUBLIC); `search_path = pg_catalog, <esquema>, pg_temp` y objetos calificados; `REVOKE CREATE ON SCHEMA public FROM PUBLIC`; ninguno de los cinco roles ni `migraciones` es superusuario ni tiene BYPASSRLS, con prueba; sin `ALTER DEFAULT PRIVILEGES` que dé permisos nuevos a `app_empresa` de forma automática.
- **Quién:** Arquitecto, Ingeniero de Datos; QA agrega la prueba.

**H-SEG-40 · MEDIA · Particiones de auditoría: quién las crea y cómo se protegen una por una.**
- **Hecho:** ADR-11 líneas 11, 18 y 30: la tabla `auditoria` se particiona por mes y "un trabajo" crea las particiones. ADR-04 no da a ningún rol permiso de DDL (`migraciones` no existe en ejecución; `mantenimiento` solo ejecuta las purgas). En PostgreSQL, las políticas de la tabla madre no se aplican a quien consulta una partición directamente, y los permisos no se heredan de la madre.
- **Riesgo:** o se da DDL a `app_empresa` (rompe D-039.3), o la partición nueva nace sin seguridad por fila forzada y con permisos por defecto. Un `app_empresa` con acceso directo a una partición vería todas las empresas de ese mes. El disparador anti-TRUNCATE de la madre no se dispara si se trunca la partición directamente.
- **Cambio:** función DEFINER `crear_particion_auditoria(mes)` (en la lista cerrada, parámetro único validado como primer día de mes, SQL con identificadores formateados), que crea la partición con FORCE ROW LEVEL SECURITY, la misma política, los disparadores propios, y **sin** permisos directos para `app_empresa`. Pruebas en H3: consulta directa a una partición como `app_empresa` falla o devuelve cero filas; alarma si la partición por defecto no está vacía (ya está).
- **Quién:** Arquitecto, Ingeniero de Datos.

**H-SEG-41 · MEDIA · La prueba genérica de aislamiento no mira varios casos que rompen el aislamiento sin tocar ninguna política.**
- **Hecho:** ADR-03 líneas 57 a 60 y H11 del prototipo.
- **Cambio (casos a agregar):** (1) todo índice **único** de una tabla de negocio empieza por `empresa_id` (uno sin empresa dejaría deducir qué valores existen en otra empresa por el error de duplicado); (2) no existen vistas materializadas ni tablas creadas "como copia" de datos de negocio (no tienen seguridad por fila); (3) la política de cada tabla es exactamente la esperada y no hay otra permisiva añadida (las políticas permisivas se suman con O); (4) `app_empresa_actual()` trata la cadena vacía como nula (`NULLIF(current_setting(...), '')`), porque tras la primera transacción la variable queda vacía y no nula; (5) las particiones (H-SEG-40).
- **Quién:** QA, Ingeniero de Datos.

**H-SEG-42 · MEDIA · La consola de plataforma comparte servicio y credenciales con la aplicación de las empresas.**
- **Hecho:** README línea 70: "La consola de plataforma es una ruta aparte de la misma aplicación que usa solo el rol `app_plataforma`". ADR-01 línea 11: una imagen, dos servicios (web y trabajador). El plan (6.2) lista `PLATFORM_DATABASE_URL` como variable de la aplicación. El plan (6.4) propone una dirección propia con red restringida.
- **Riesgo:** una vulnerabilidad en la parte que usan las empresas (ejecución de código o lectura de variables) alcanzaría también la credencial de plataforma. La separación de roles de D-039.3 quedaría anulada en la práctica.
- **Cambio:** tercer despliegue "consola" con la misma imagen, que tiene `PLATFORM_DATABASE_URL` (y la de soporte, si se adopta H-SEG-36) y **no** `DATABASE_URL`; el servicio web no tiene la de plataforma. `MIGRATION_*` solo en el paso de publicación, `MAINTENANCE_*` solo en el procedimiento de purga, `AUDIT_READER_*` solo en el trabajo de copia. Si DevOps estima que el tercer servicio sube el costo de forma material respecto de lo ya escalado (D2), eso es dinero: lo informa la Jefatura al CEO; el diseño no se cambia por eso.
- **Quién:** Arquitecto (ADR-01), DevOps (costo y despliegue).

**H-SEG-43 · MEDIA · La copia externa de la auditoría contendría IP y motivos en un almacén que no se puede borrar, y el ADR dice lo contrario.**
- **Hecho:** ADR-04 línea 66: "la copia externa no contiene valores personales (D-030)". D-077 y la tabla C.3 del procedimiento dicen que la auditoría sí guarda IP (D-030.5) y motivos por valor (texto libre, no anonimizable de forma garantizada). D-052.2 define la copia como inmutable.
- **Riesgo:** se copian a un almacén sin borrado datos que quizá haya que eliminar por orden legal (L-04, L-05, L-06). Es el tipo de decisión que luego no se puede deshacer.
- **Cambio (opinión):** la copia guarda la fila **sin** `ip` ni `motivo`, y en su lugar un resumen con llave (HMAC) de cada uno; la cadena de huellas se calcula sobre la fila completa y la verificación semanal vuelve a calcular los resúmenes desde la base. Se sigue detectando una alteración y no se guarda ningún texto libre fuera de la base. Si el Arquitecto prefiere copiar los valores, Cumplimiento debe declararlo como riesgo residual y entra a la consulta legal ya pedida. Corregir la frase de ADR-04 en cualquier caso.
- **Quién:** Arquitecto, Auditor de Cumplimiento, DevOps.

**H-SEG-44 · MEDIA · Los mensajes de error de PostgreSQL pueden llevar datos personales a `cola.*`, a los registros y al monitor.**
- **Hecho:** ADR-02 línea 16 y ADR-04 fila 18 cuidan la carga útil de la cola, pero no el texto del error. ADR-20 redacta por **campos**. Un error de clave duplicada de PostgreSQL trae el valor en su detalle (por ejemplo el correo duplicado). Las dos librerías candidatas guardan el error del trabajo fallido en su propia tabla (graphile-worker: `last_error`; pg-boss: `output`); lo confirma H7. `cola.*` es global y legible por el rol de la aplicación (ADR-04).
- **Riesgo:** el nombre canario de la prueba de ADR-02 no aparece en la carga útil pero sí en un error. Un dato personal queda en una tabla sin seguridad por fila, en los respaldos y en el monitor de errores.
- **Cambio:** (1) un envoltorio en `nucleo/cola` y en `nucleo/observabilidad` que normaliza todo error a tipo, código y mensaje fijo, y descarta `detail`, `where` y parámetros antes de guardarlo o enviarlo; (2) `app_empresa` usa las funciones de la librería, sin DML libre sobre sus tablas; (3) prueba: provocar una violación de clave única con un correo canario dentro de un trabajo y en una petición, y buscarlo en `cola.*`, en `corrida_diaria.resultado`, en el registro y en el monitor simulado.
- **Quién:** Arquitecto, DevOps; QA escribe la prueba.

### ADR-07 y ADR-09: llaves y huellas

**H-SEG-45 · ALTA · Los códigos de recuperación y las claves de API dependen de la llave maestra, y los ensayos de pérdida suponen lo contrario.**
- **Hecho:** ADR-09 línea 16: toda huella es HMAC con una llave derivada de la maestra, y ADR-08 línea 17 y el contexto de ADR-09 incluyen los códigos de recuperación y las claves de API. El plan de DevOps 6.7 (escenario A) y **mi propia condición 5 de la ronda 4** dicen que, si se pierde la maestra, "cada persona se reenrola con su código de recuperación, que es una huella y no depende de la llave". **Eso es falso con el diseño del ADR-09.** Yo escribí esa suposición sin comprobar la derivación; la corrijo aquí. ADR-09 línea 37 acepta que perder la maestra obliga a regenerar las claves de API.
- **Riesgo:** perdida o rotación mal hecha de la maestra, y nadie con segunda verificación obligatoria (todos los que tienen un permiso sensible, es decir, administradores, aprobadores y la plataforma) puede reenrolarse con su código. La salida es el rescate de cada empresa por dos personas de plataforma, empresa por empresa. El ensayo de la condición 5 de la ronda 4, que es previo a datos reales, fallaría. Las claves de API con 128 bits o más no necesitan la maestra para ser seguras (el propio "Contexto" de ADR-09 dice que una huella simple basta para valores de alta entropía).
- **Cambio:** dos niveles de huella. (a) **Con llave (HMAC, pepper)** solo para lo corto y de poca entropía: código corto (40 bits), claves del limitador (correos e IP), y lo de vida corta (sesiones, enlaces, invitaciones, acceso de emergencia: perderlos solo obliga a volver a ingresar). (b) **Sin depender de la maestra** para lo duradero: claves de API (al menos 128 bits): SHA-256 simple con separación por tipo. Códigos de recuperación: o al menos 100 bits y SHA-256, o, si se quieren códigos más cortos para escribir (por ejemplo 10 caracteres), un derivado lento con sal propia (`scrypt` de Node, sin paquete nuevo), que no necesita ninguna llave y se usa muy rara vez. El Arquitecto elige entre ambos. Reescribir con esto el escenario A de 6.7 (DevOps) y mi condición 5.
- **Quién:** Arquitecto (ADR-07 y 09), DevOps (plan 6.7), Seguridad (corrige su condición 5, hecho en la sección 5 de este informe).

**H-SEG-46 · ALTA · El enlace de ingreso en claro tiene que pasar por la cola de correo, y eso choca con RS-51.**
- **Hecho:** ADR-16 línea 23: `enviarCorreo` "encola el envío (ADR-02) con reintentos; nada de envíos desde la petición". ADR-02 línea 16: la carga útil lleva solo identificadores. RS-51 y ADR-09 exigen que el valor en claro exista solo en el correo y que la prueba lo busque en `cola.*` y en todas las tablas. Pero el correo de ingreso, de invitación y de acceso de emergencia debe contener el valor en claro, y la base solo guarda su huella: **el trabajador no tiene de dónde sacarlo.** Ningún ADR dice cómo viaja del navegador al trabajador.
- **Riesgo:** o el diseño no se puede construir, o alguien guarda el valor en la carga útil, y entonces está en claro en la cola, en trabajos fallidos (reintentos de hasta 12 horas) y en los respaldos, que es lo que RS-51 prohíbe. La prueba RS-51 lo detectaría tarde.
- **Cambio:** el Arquitecto elige y lo escribe en ADR-16 y ADR-09. Opciones que cumplen: (a) la carga útil lleva el valor **cifrado** con un propósito propio de ADR-07 (`correo_efimero`, por empresa o global), el trabajador lo descifra al enviar y **borra la carga útil** al terminar o al vencer el enlace; (b) estos tres correos se envían directamente al proveedor desde la petición con tiempo máximo, y solo queda el estado en la base. En ambos casos: sin reintentos después de que el enlace venza (15 minutos), nunca queda en trabajos muertos, y la prueba RS-51 incluye la cola con trabajos fallidos.
- **Quién:** Arquitecto.

**H-SEG-47 · MEDIA · Versiones de llave retiradas y respaldos antiguos.**
- **Hecho:** ADR-07 línea 17: "se retira la vieja cuando no queda nada con ella". Los respaldos se guardan 30 diarios y 12 mensuales (D-032, D-052.1) y contienen valores cifrados con la versión vieja.
- **Riesgo:** al restaurar un respaldo de antes de la rotación, las claves de licencia y las semillas de segunda verificación no se pueden descifrar. Y si la rotación fue por filtración, esos respaldos siguen protegidos con la llave filtrada: rotar no los salva.
- **Cambio:** una versión retirada no se destruye: se archiva en la custodia (los dos lugares y dos custodios) hasta que expire el último respaldo que la usa. Declararlo en ADR-07 y en el ensayo de restauración (restaurar un respaldo anterior a la rotación y abrir un valor de cada tipo). Anotar en el procedimiento de incidente que una filtración de la maestra deja expuestos los respaldos cifrados con ella hasta que expiren.
- **Quién:** Arquitecto, DevOps.

**H-SEG-48 · BAJA · Detalles de ADR-07.**
- (1) `info` de HKDF: usar una cadena fija con versión y campos de largo conocido (por ejemplo `"plataformati/v1/licencia/<empresa>"`) para evitar ambigüedades. (2) ADR-07 no menciona `AUTH_SECRET` (plan 6.2: firma de sesiones y enlaces), pero ADR-08 usa sesiones opacas con huella: decir si `AUTH_SECRET` sigue existiendo y para qué, para no tener dos llaves con el mismo fin. (3) Llaves como `Buffer` que se pone a cero al terminar; no guardar llaves derivadas en cachés. (4) Pruebas con vectores conocidos de HKDF y AES-GCM, y solo la biblioteca estándar de Node para primitivas. (5) La guarda de arranque también rechaza una llave cuya huella corta coincida con la de otro entorno (plan 6.5 d).
- **Quién:** Arquitecto.

**H-SEG-49 · BAJA · La prueba RS-51 debe cubrir más lugares.**
- **Hecho:** ADR-09 líneas 26 a 33.
- **Cambio:** (1) el control positivo se planta en varias representaciones (texto, dentro de una URL, JSON); (2) buscar en las salidas del registro de **envíos**, de la cola con trabajos fallidos y de los mensajes de error (H-SEG-44, 46); (3) comprobar que el enlace no sale en los registros de acceso de la propia aplicación: la ruta con el valor se redacta (ADR-20); (4) revisar que la página del botón "Entrar" no cargue recursos de terceros. Lo que escriba el alojamiento en sus registros de acceso queda como riesgo residual, de vida corta (15 minutos, un solo uso, atado al navegador); DevOps lo anota.
- **Quién:** Arquitecto, QA.

### ADR-08: acceso y sesiones

**H-SEG-50 · MEDIA · Ningún documento define las cookies ni las cabeceras de seguridad.**
- **Hecho:** búsqueda en `docs/`: sin coincidencias para `Content-Security-Policy`, `HSTS`, `frame-ancestors`, `Referrer-Policy`, `__Host-` ni `HttpOnly`. ADR-05 línea 19 fija solo `SameSite=Lax`.
- **Cambio:** definir en ADR-08 (cookies de sesión y del navegador de origen: `__Host-` + `Secure` + `HttpOnly` + `SameSite=Lax` + `Path=/` y sin `Domain`, para que la consola en otra dirección no pueda leerlas ni pisarlas) y en ADR-01 o 14 (cabeceras para toda respuesta: política de contenido sin scripts embebidos salvo con nonce, `frame-ancestors 'none'`, HSTS, `nosniff`; y `Referrer-Policy: no-referrer` y `Cache-Control: no-store` en la página del botón "Entrar" y en descargas). Prueba automática de cabeceras en integración continua. Cumple RS-42 y RS-47.
- **Quién:** Arquitecto, DevOps.

**H-SEG-51 · MEDIA · ADR-08 no describe la sesión de plataforma.**
- **Hecho:** ADR-08 solo habla de segunda verificación con aplicación autenticadora. D-048.5(c), RF-PLA-001 y el plan 6.6 exigen **llave de seguridad física** (FIDO2/WebAuthn) y red restringida para plataforma.
- **Cambio:** subsección propia: tipo de sesión "plataforma" distinta de la de empresa (cookie distinta, no intercambiable), ingreso solo con llave física (aplicación autenticadora como respaldo solo si lo decide el Gerente de TI), vencimientos más cortos (propuesta: 15 minutos de inactividad y 4 horas en total), verificación reciente con la llave para cada acción de PS-01 a PS-05 y para iniciar soporte (H-SEG-34), y el acceso de emergencia (PS-05) con su tabla y sus funciones (H-SEG-38). Para TOTP y WebAuthn, usar librerías mantenidas (no escribir las primitivas).
- **Quién:** Arquitecto.

**H-SEG-52 · MEDIA · "Verificación reciente" se puede cumplir con un enlace de correo.**
- **Hecho:** D-048.2: "reautenticación reciente (10 minutos, enlace nuevo o segundo factor)". ADR-08 línea 19 no dice qué hecho actualiza `sesion.verificada_en`.
- **Riesgo (opinión):** las acciones que exigen verificación reciente (ver claves de licencia, exportar, importar, administrar roles, activar excepciones, crear claves de API) son las de quienes ya tienen segunda verificación obligatoria. Si un enlace al correo basta, el control se reduce al control del buzón y deja de proteger contra una sesión robada con buzón comprometido.
- **Cambio:** para membresías con segunda verificación obligatoria, solo el autenticador (o la llave física) actualiza `verificada_en`; el enlace sirve solo para quien no tiene 2F. Requiere enmendar D-048.2: decisión técnica del Gerente de TI.
- **Quién:** Arquitecto, Gerente de TI.

**H-SEG-53 · BAJA · Otros puntos de ADR-08.**
- (1) Aviso por correo "se inició sesión" ya mencionado en ADR-09: ponerlo también en ADR-08, con el dispositivo aproximado. (2) El parámetro de regreso tras ingresar solo acepta rutas internas. (3) La semilla de TOTP no queda activa hasta que se confirma un código. (4) La decisión de H6b sobre Auth.js se toma por las razones del ADR; Seguridad prefiere que las piezas propias sean pocas y que la sesión, el enlace y el código corto estén en un solo módulo con su propia prueba exhaustiva.
- **Quién:** Arquitecto.

### ADR-19: puerta de exportación

**H-SEG-54 · ALTA · La descarga no está ligada a quien pidió la exportación ni a sus permisos.**
- **Hecho:** ADR-19 paso 8: el resultado queda en `exportacion_resultado`, "descarga única, vence a las 24 horas". El ADR no dice quién puede descargar, ni que se compruebe la sesión, la empresa de la dirección y el permiso en el momento de la descarga.
- **Riesgo:** si el identificador del resultado sirve de credencial, cualquier usuario de la **misma empresa** que lo conozca o lo adivine (UUID v7: no es un secreto) descarga un archivo generado por un Administrador con precios y datos personales aunque él no tenga `precios.ver` ni `datos_personales.ver`.
- **Cambio:** la descarga exige, en el servidor: sesión válida, empresa de la dirección, `solicitante_membresia_id` igual a quien descarga, membresía activa, `datos.exportar` vigente y sesión que no sea de soporte. "Descarga única" es una actualización atómica (`UPDATE … SET descargado_en … WHERE descargado_en IS NULL AND vence_en > ahora RETURNING`) **antes** de empezar a enviar. Al terminar la descarga, el texto cifrado se **borra de inmediato** (no se espera a las 24 horas). La respuesta lleva `Cache-Control: no-store`, `Content-Disposition: attachment`, `nosniff` y un nombre de archivo sin datos personales. Se descifra en memoria, sin archivo temporal. Prueba: otro usuario de la misma empresa, otra empresa, descarga repetida y descarga tras suspender al solicitante.
- **Quién:** Arquitecto.

**H-SEG-55 · MEDIA · El trabajador debe volver a comprobar permisos al generar, y los filtros no caben en la carga útil.**
- **Hecho:** el trabajador corre con `app_empresa` sin una persona (ADR-02, ADR-19 paso 8). El paso 1 de ADR-19 comprueba permisos al pedir, pero la generación ocurre después. ADR-02 limita la carga útil a identificadores; los "filtros" de una exportación pueden contener un nombre buscado.
- **Cambio:** los filtros y las columnas confirmadas se guardan en una fila `exportacion_solicitud` (con seguridad por fila y `sin_soporte`) y el trabajo lleva solo su identificador. Al generar, el trabajador vuelve a evaluar con la **membresía solicitante**: membresía activa, `datos.exportar`, columnas permitidas por `precios.ver` y `datos_personales.ver`. Si algo cambió, la exportación falla con un motivo, no entrega una versión recortada sin aviso. Excluye siempre el registro de solicitudes de derechos (RF-PER-012) y los textos redactados.
- **Quién:** Arquitecto.

**H-SEG-56 · MEDIA · Condiciones del almacenamiento temporal cifrado.**
- **Hecho:** ADR-19 paso 8 y "Consecuencias" (filas de hasta ~10 MB, "punto abierto" para Seguridad y Cumplimiento).
- **Cambio:** (1) `exportacion_resultado` con `sin_soporte`, seguridad por fila, y sin permisos para `app_plataforma` (ya no los tiene). (2) Datos asociados del cifrado (ADR-07) con `tabla|columna|id|empresa`; para tamaños altos, bloques con contador, para no descifrar 10 MB de una vez. (3) Sin archivos temporales en disco con texto claro durante la generación. (4) Topes de almacenamiento: una exportación activa por usuario, un máximo de bytes por empresa a la vez, y falla explícita (no recorte) si se supera ~10 MB. (5) Alarma si existe un resultado con más de 25 horas (el programador falló). (6) Declarar en el aviso de privacidad que los respaldos conservan ese texto cifrado hasta que venzan (sección 2.1). (7) El prototipo mide el caso real (H12, sección 6).
- **Quién:** Arquitecto, DevOps; Cumplimiento confirma la lectura de D-022.

**H-SEG-57 · MEDIA (pregunta abierta) · Entrega de derechos de datos: ¿quién descarga?**
- **Hecho:** ADR-19 paso 9 y D-061.2 dicen que la copia de datos de una Persona se entrega por descarga única registrada, nunca por correo. El procedimiento C.5.4 añade verificar la identidad por otro medio si hay incidente. La Persona que pide sus datos puede no tener Usuario.
- **Riesgo:** con la regla de H-SEG-54, descarga quien atiende el pedido, y de ahí el archivo pasa a la Persona por un canal que el ADR no define. Sin definirlo, se hará por correo, que es lo que D-061.2 prohíbe.
- **Cambio:** que Cumplimiento y el Arquitecto definan el canal (opción de partida: descarga hecha por la persona que atiende, con registro, y entrega presencial o por el medio que la empresa verifique; sin enlace de descarga público). Mientras no se defina, no se construye este paso.
- **Quién:** Auditor de Cumplimiento, Arquitecto.

**H-SEG-58 · BAJA · La auditoría de una exportación podría guardar más sin guardar contenido.**
- **Hecho:** ADR-19 paso 6: quién, cuándo, filtros, filas y columnas sensibles. El procedimiento (6.0 pregunta 2 y C.3) necesita saber de cuántas personas y poder demostrar si un archivo hallado fuera salió de la plataforma.
- **Cambio:** agregar a la entrada la huella SHA-256 del archivo generado, el número de Personas distintas incluidas, y un evento aparte de descarga (quién, cuándo) y de vencimiento sin descarga. No guarda contenido.
- **Quién:** Arquitecto.

### ADR-13: doble control

**H-SEG-59 · MEDIA · La lista de cambios que reabren una aprobación es demasiado corta.**
- **Hecho:** ADR-13 línea 22: reabre "precio, cantidad o proveedor". La regla de monto (línea 12) depende además de moneda, impuesto y descuentos, y una orden tiene condiciones de pago y dirección de entrega.
- **Riesgo:** aprobar una orden y luego, sin reaprobación, cambiar la moneda, el impuesto, las condiciones de pago o los datos del proveedor que reciben el dinero.
- **Cambio:** lista cerrada en código de campos "que comprometen" de cada documento sujeto a doble control (importe, moneda, impuesto, líneas agregadas o quitadas, proveedor y sus datos de pago, condiciones). Prueba de arquitectura: una columna nueva en esas tablas falla la integración continua hasta clasificarla como "reabre" o "no reabre".
- **Quién:** Arquitecto; Analista confirma la lista de campos.

**H-SEG-60 · MEDIA · `participacion_documento` debe ser solo agregar, y una persona debe tener una sola membresía por empresa.**
- **Hecho:** ADR-13 línea 19 define la tabla pero no sus permisos. Si `app_empresa` puede borrarla o editarla, quien editó una orden borra su fila y se vuelve elegible para aprobar. La separación de funciones se basa en `membresia_id`.
- **Cambio:** INSERT y SELECT únicamente, con el mismo disparador de la auditoría; índice único `(empresa_id, cuenta_id)` en membresía (una persona, una membresía por empresa); si una integración puede crear o editar documentos sujetos a doble control, la participación se atribuye también a quien creó la clave de API, o no se le permite entrar al ciclo. Pruebas por la API (ya previstas en D-043.6).
- **Quién:** Arquitecto, Ingeniero de Datos.

**H-SEG-61 · BAJA (recomendación, no condición) · Segunda barrera en la base para la aprobación de dinero.**
- **Opinión:** en el espíritu de D-025 ("filtro en el código + base"), un disparador en las órdenes de compra y de servicio que rechace pasar a "Aprobada" si el aprobador es quien creó o editó desde la última aprobación, salvo que el documento lleve la marca de excepción vigente. Es poco código y protege el acto más sensible contra un olvido futuro del servicio.
- **Quién:** Arquitecto, Ingeniero de Datos.

### ADR-11 y ADR-12: congelación en incidente

**H-SEG-62 · MEDIA · Nadie implementa la congelación de anonimización y purga que D-080(b) ya confirmó.**
- **Hecho:** D-080(b) y el procedimiento C.5.2 piden pausar la anonimización y la purga mientras se preserva evidencia. ADR-11 (interruptor legal de la purga) y ADR-12 (anonimización) no tienen ese mecanismo.
- **Riesgo:** en un incidente, una anonimización manual o una purga programada destruye evidencia, que es irreversible.
- **Cambio:** un indicador por empresa (y global) que la función `anonimizar` y la purga consultan **dentro de la base**; solo se activa con dos personas (Líder del incidente y Gerente de TI, o plataforma y contacto) y queda en el registro de plataforma. Prueba: con el indicador, ambas rechazan.
- **Quién:** Arquitecto, Ingeniero de Datos.

---

## 4. Contraste con las 8 condiciones de llaves de la ronda 4

| # | Condición | Estado según ADR-07 / ADR-09 | Qué falta |
|---|---|---|---|
| 1 | Derivación escrita (HKDF, contexto fijo, versión, nunca la misma llave) | **Cumple**: HKDF-SHA-256, `info` = propósito y alcance, formato `v<versión>.<nonce>.<cifrado>`, datos asociados por fila | H-SEG-48 (detalles) |
| 2 | Maestra de producción fuera de CI, pruebas y desarrollo | **Cumple en el ADR** (llave por entorno, relleno en desarrollo, producción no arranca con relleno). La evidencia es de DevOps (plan 6.5) | H-SEG-48 (huella repetida entre entornos) |
| 3 | Dos custodios; plataforma sin acceso al almacén | **No es materia del ADR**; sigue **pendiente del CEO** (designar). ADR-07 cita los dos custodios | H-SEG-42 impide que la consola vea la llave si la consola no recibe la variable |
| 4 | Respaldo de llaves en dos lugares, uno con 2F y registro | **Cumple en el ADR** (dos lugares, dos custodios); el detalle del gestor está en el plan 6.5 | H-SEG-47 (archivar versiones retiradas) |
| 5 | Ensayo de pérdida y de filtración; rotación completa en menos de 4 horas | **No se puede cumplir tal como está escrito**: el escenario A supone códigos de recuperación independientes (falso). Con H-SEG-45 corregido, sí | H-SEG-45, 47 |
| 6 | Llave en memoria: no se imprime; evaluar servicio gestionado | **Cumple en el ADR** (tipo `Secreto`, redacción central). Evaluación en Etapa 7 | Filtros de errores: H-SEG-44 |
| 7 | Rotación anual con calendario y alerta; la de `AUTH_SECRET` se anuncia | ADR-07 fija rotación anual y ante sospecha. `AUTH_SECRET` no figura | H-SEG-48 (2) |
| 8 | Prueba automática de que nada cifrado ni llave está en claro y `app_plataforma` no lee columnas cifradas | **Cumple en el diseño** (prueba en ADR-07 y RS-51; `app_plataforma` no tiene permisos sobre esas tablas) | H-SEG-49; la prueba de `app_plataforma` pasa a H11 |

## 5. Corrección de mi propia ronda 4

En la sección 2 de `ronda4-especialista-seguridad.md`, condición 5, escribí que las semillas de la segunda verificación se rehacen "con su código de recuperación, que son huellas y no dependen de la llave". **Era un supuesto que no comprobé contra la derivación de las huellas.** Con ADR-09 tal como está, los códigos dependen de la maestra (H-SEG-45). La condición 5 queda así: *"El ensayo debe demostrar que, sin la llave maestra, una persona puede volver a configurar su segunda verificación. Hasta que H-SEG-45 se incorpore, el escenario A del plan 6.7 no se considera válido."* No toco el archivo de la ronda 4: es un informe fechado; dejo la corrección aquí y en la nota final.

## 6. Cambios que pido al prototipo técnico

- **H9 (secretos) pasa de "deseable" a obligatoria.** Seguridad decide, como el documento prevé. Razón: la semilla de la segunda verificación se cifra desde la Etapa 1 (condición 1 de la ronda 4: antes de la primera tabla con campo cifrado). La rotación de 10.000 valores puede quedar como medida deseable; derivación, datos asociados, valor movido y rotación pequeña son obligatorios.
- **H8 (RS-51) se prepara antes**: hoy está en el día 4 de reserva, pero depende de los flujos de H6 (día 3). Recomiendo un H8 mínimo el día 3 y la repetición completa el día 4.
- **H2 (soporte):** agregar (9) `app_plataforma` no puede insertar ni modificar `autorizacion_soporte`, `registro_plataforma` ni `purga_acta`; (10) dos personas empiezan a la vez y gana una; (11) intento de `set_config('app.modo_soporte', '0', true)` dentro del modo soporte: registrar el resultado (se espera que funcione; decide si hace falta `app_soporte`, H-SEG-36); (12) el rechazo escribe evento de seguridad; (13) sesión de soporte no puede exportar.
- **H1 y H11:** los cinco casos de H-SEG-41, los permisos de PUBLIC (H-SEG-39) y la consulta directa a una partición (H-SEG-40).
- **H6:** atributos de cookie y cabeceras (H-SEG-50); sesión de plataforma con llave virtual (H-SEG-51); el correo de ingreso sin valor en claro en la cola (H-SEG-46).
- **Nueva H12 (exportación cifrada):** crear un resultado de 10 MB, cifrarlo, guardarlo, descargarlo una vez con las comprobaciones de H-SEG-54, borrarlo y medir memoria, tiempo, tamaño de la tabla y efecto del vaciado. Criterio de fracaso: texto claro en disco, descarga por un usuario distinto, o más de una descarga.

## 7. Qué no revisé

Revisé diseño, no código; no hay código. No revisé el prototipo de pantallas ni los 17 módulos funcionales. No hay proveedor elegido: las pruebas contra el proveedor candidato (día 0) pueden cambiar partes de ADR-03 y 04. La parte legal de este informe (D-022 aplicada a la tabla temporal, respaldos con datos personales, copia inmutable) es una lectura técnica, no opinión legal; la valida Cumplimiento y, donde corresponda, el abogado.

---

## Nota para la Jefatura de Proyecto

1. **Veredicto:** ningún ADR rechazado; 20 aprobados, de ellos 12 con condiciones. El prototipo técnico puede empezar cuando el Arquitecto incorpore al texto de los ADR las **4 condiciones altas** (H-SEG-33, 45, 46, 54); son cambios de diseño, no de código, y no requieren al CEO.
2. **ADR-19:** apruebo guardar la exportación cifrada 24 h en la base, con las condiciones H-SEG-54 a 58 (descarga atada al solicitante, borrado inmediato, revalidar permisos al generar). Cumplimiento confirma la lectura de D-022.
3. **Cinco propuestas del Arquitecto:** avalo D-030.8 y D-050.5; avalo D-039.4 y D-039.10 con condiciones (H-SEG-33 a 37, 44); avalo D-065 S-34e solo para valores cortos (H-SEG-45).
4. **Me corrijo:** mi condición 5 de la ronda 4 y el plan 6.7 suponían que los códigos de recuperación no dependen de la llave maestra; el ADR-09 los hace depender (H-SEG-45).
5. **Procedimiento v0.3:** leí la sección 6 y el Anexo C completos; la línea del Anexo B ya existía (línea 251), no edité nada. Cuatro puntos del procedimiento aún no tienen respaldo en los ADR (H-SEG-33, 38, 58, 62).
6. **Decisiones técnicas para el Gerente de TI:** `app_soporte` como sexto rol (H-SEG-36), verificación reciente solo con autenticador (H-SEG-52) y consola en tercer despliegue (H-SEG-42; si sube el costo, lo informa DevOps y la Jefatura decide si va al CEO).
7. **Total:** 30 hallazgos (H-SEG-33 a 62): 4 altos, 21 medios, 5 bajos, 0 críticos. Informe: `docs/revision-cruzada/ronda5-seguridad-adr.md`.

# ADR-04 · Seis roles de base de datos y lista cerrada de tablas globales y funciones (T-3)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5 y Datos) · **Decide:** Gerente de TI (firma Seguridad la lista) · **Base:** D-039.3 a 5, D-048.5, D-054.1, `plan-entornos-y-costos.md` §1.2, H-SEG-33, 36, 38, 39, 42, 43, 44; D04-1 a D04-7

## Contexto
Hay datos que no pertenecen a una sola empresa o se consultan antes de saber la empresa (usuario, sesión, enlace). Además DevOps dejó preguntas abiertas: si la cola de trabajos y el registro de plataforma son globales, y si la partición de auditoría es anual o mensual. La revisión de Seguridad y de Datos mostró que la lista de funciones estaba incompleta y que dos tablas (`invitacion`, `clave_api`) eran de una empresa y no globales.

## Decisión

### Los seis roles (D-039.3 pasa de cinco a seis: **propuesta, a ratificar por el Gerente** para `app_soporte`)
| Rol | Permisos | No puede |
|---|---|---|
| `app_empresa` | Aplicación web y trabajador. Tablas de negocio (según la macro), esquema `cola` solo mediante las funciones de la librería, lectura de catálogos, EXECUTE de las funciones DEFINER de la sección "Funciones para la aplicación". Auditoría: solo INSERT y SELECT | Ser dueño, superusuario o BYPASSRLS; tocar tablas globales; ejecutar funciones de plataforma, de soporte o de mantenimiento |
| `app_plataforma` | Solo tablas globales de plataforma, en lectura (`administrador_plataforma`, `limite_plataforma`, `autorizacion_soporte`, `accion_plataforma`, `registro_plataforma`, `congelacion_incidente`), más EXECUTE de las funciones de plataforma (ADR-23) | Leer cualquier tabla de negocio; escribir directamente en **ninguna** tabla: todo cambio pasa por una función |
| `app_soporte` | `SELECT` sobre las tablas de negocio que **no** son `sin_soporte` (lo concede la macro, ADR-03) y EXECUTE de tres funciones: `soporte_usar`, `soporte_abrir_lectura`, `soporte_auditar` | Escribir, ejecutar otras funciones, leer tablas `sin_soporte` o globales sensibles. Solo la consola (ADR-01) tiene su credencial |
| `migraciones` | Dueño de objetos; aplica migraciones; es dueño de las funciones DEFINER | Existir en la aplicación en marcha: su credencial vive solo en el paso de publicación |
| `mantenimiento` | EXECUTE de `purgar_particion_auditoria`, `purgar_particion_evento_seguridad` y `contador_reparar` | Ser dueño; usarse sin dos personas autorizadas (ADR-23) |
| `lector_auditoria` | SELECT de `auditoria` y `auditoria_lote_detalle` mediante **política explícita** `TO lector_auditoria USING (true)`, y EXECUTE de `transaccion_mas_antigua()` | Escribir; BYPASSRLS |

Por qué un sexto rol (H-SEG-36, propuesta): sin él, las tablas "sin soporte" se protegen por una variable de la transacción que cualquiera con SQL puede cambiar; con él, se protegen por permisos y los usuarios de las empresas no pueden abrir una sesión de soporte. No agrega gasto (es una cuenta más en la misma base). La opción anterior "negarse a un sexto rol" queda descartada para este caso con ese hecho; para ser dueño de las funciones sigue valiendo: no se crea un séptimo.

**Endurecimiento (H-SEG-39, D04-6):**
- Ningún rol es superusuario ni tiene BYPASSRLS (prueba para los seis, no solo para dos).
- `REVOKE ALL ... FROM PUBLIC` en toda función y GRANT explícito a los roles de su fila; `REVOKE CREATE ON SCHEMA public FROM PUBLIC`; sin `ALTER DEFAULT PRIVILEGES` que dé permisos nuevos a `app_empresa`.
- Cada función DEFINER: `SET search_path = pg_catalog, pg_temp`, todo objeto referido con nombre de esquema (nunca `public` en el `search_path` de una función con privilegios). Los roles llevan `search_path = pg_catalog, public`.
- `CONNECTION LIMIT` por rol, que DevOps fija de modo que la suma no pase las 60 conexiones reales y se reserven para `migraciones` y `mantenimiento`.
- La credencial de `migraciones` no existe en el entorno de ejecución (prueba: el entorno en marcha no la contiene); las de `app_plataforma` y `app_soporte` solo existen en la consola; las de `mantenimiento` y `lector_auditoria` solo en sus tareas programadas (ADR-01).
- **Matriz exacta rol × función** (incluida la fila `PUBLIC`) generada del catálogo y comparada con esta lista en CI.

Pruebas en cada cambio y en cada entorno: (1) las de aislamiento corren como `app_empresa`; (2) ningún rol es dueño, BYPASSRLS ni superusuario; (3) `app_plataforma` no lee ninguna tabla de negocio y `app_soporte` no lee ninguna tabla `sin_soporte`; (4) los permisos de cada rol son exactamente los de esta tabla, y `PUBLIC` no ejecuta nada (comparación contra el catálogo); (5) `app_plataforma` no ejecuta ninguna función de la aplicación (D04-7).

### Lista cerrada de objetos que pueden existir sin `empresa_id` (D04-1)
La prueba de CI conoce **tres categorías**:

**A. Tablas globales de negocio de plataforma: 17.** La mantiene el Arquitecto y la firma Seguridad.

| # | Tabla | Quién entra | Nota |
|---|---|---|---|
| 1 | `cuenta_usuario` | funciones | correo normalizado; semilla de segunda verificación cifrada por usuario; credenciales de llave física (clave pública, no secreta); códigos de recuperación como huella de nivel B (ADR-09) |
| 2 | `sesion` | funciones | solo huella del identificador; `tipo` ∈ `empresa`, `plataforma`; `verificada_en` y `verificada_con` (ADR-08) |
| 3 | `enlace_ingreso` | funciones | huella del enlace, del navegador y del código corto |
| 4 | `tipo_evento` | lectura directa | se llena desde el catálogo en código |
| 5 | `estado_correo` | función | datos mínimos del proveedor |
| 6 | `moneda` | lectura directa | ISO 4217 con decimales |
| 7 | `pais` | lectura directa | |
| 8 | `administrador_plataforma` | `app_plataforma` (lectura) | |
| 9 | `limite_plataforma` | `app_plataforma` (lectura) y función de ajuste | |
| 10 | `resumen_no_leidas` | funciones | por usuario, nunca recorriendo empresas |
| 11 | `evento_seguridad_ingreso` | función | accesos fallidos sin empresa; 12 meses; el correo escrito se guarda **como huella** (tipo `correo_intento`, ADR-09), no en claro (D04-5) |
| 12 | `autorizacion_soporte` | `app_plataforma` y `app_soporte` (lectura) + funciones | ADR-03; sin escritura directa |
| 13 | `registro_plataforma` | funciones | **solo agregar** (INSERT y SELECT) con el mismo disparador anti-UPDATE/DELETE/TRUNCATE de la auditoría |
| 14 | `limite_uso` | función `limite_consumir` | limitador (ADR-16); medir normal frente a `UNLOGGED` (D04-4) |
| 15 | `purga_acta` | funciones | **solo agregar**; la constancia se copia también al almacén externo (ADR-12, D04-3) |
| 16 | `accion_plataforma` | funciones | estado de las acciones con dos personas (ADR-23): nuevo |
| 17 | `congelacion_incidente` | funciones | congelación por incidente (ADR-23): nuevo |

`invitacion` y `clave_api` **dejan de ser globales** (D04-2, alternativa preferida de Datos): pertenecen a una empresa, se administran (listar, crear, cancelar, reenviar, rotar, revocar) con la seguridad por fila normal, son `sin_soporte`, y solo la búsqueda por huella antes de conocer la empresa (`invitacion_leer`, `clave_api_validar`) usa una función apoyada en la política `TO migraciones` de ADR-03. Se evita un conjunto de ocho funciones y la lista global baja en dos tablas (las dos tablas nuevas de plataforma, 16 y 17, la devuelven a 17). Ambas llevan `UNIQUE (empresa_id, huella)` y un índice **no único** `(huella)` para la búsqueda (colisión de huellas de 128 bits o más: despreciable; no hay valor elegido por el usuario que pueda sondear).

**B. Esquemas de infraestructura (sin `empresa_id`):** `cola` (tablas de la librería, con su propio dueño; la aplicación entra solo por las funciones de la librería, H-SEG-44; carga útil solo con identificadores, errores normalizados, ADR-02), `catalogo_aislamiento` (registro de la macro, solo `SELECT` para `app_empresa`) y `_prisma_migrations` (esquema `sistema`, sin acceso de la aplicación).

**C. Particiones** (`auditoria_2026_10`, ...): no son tablas nuevas; la prueba las resuelve con `pg_inherits` hacia su padre, que debe estar en A o tener la macro. Ningún rol de aplicación tiene permisos sobre ellas.

De las 13 tablas de D-039.4 se conservan 11 y 2 pasan a empresa; las filas 12 a 15 ya se habían agregado antes y las filas 16 y 17 son nuevas: **D-039.4 queda enmendada**. Se resuelven las preguntas de DevOps: **la cola es global y el registro de plataforma es global**; el "registro de empresa", lo que vio soporte, no es global: es la auditoría de la propia empresa.

**Aclaraciones:**
- `empresa` y `membresia` **no** son globales: tienen seguridad por fila. Se llega a ellas con `resolver_empresa` y `mis_empresas`.
- Los eventos de seguridad son dos tablas: `evento_seguridad_ingreso` (global, sin empresa) y `evento_seguridad` (por empresa **del actor**, D-054.1), ambas con partición mensual y retención de 12 meses.
- `reloj_prueba` no existe en producción (ADR-02).

### Funciones SECURITY DEFINER (lista cerrada y completa, H-SEG-38)
Lo único que cada rol puede ejecutar sobre lo global. **Regla común (H-SEG-34): ninguna acepta un identificador de usuario, empresa o persona como prueba de quién llama; reciben la credencial** (la huella de la sesión o del valor de entrada) y deducen el resto. Cada una fija `search_path`, devuelve lo mínimo, toca solo lo que su fila declara, escribe un evento de seguridad en cada rechazo y tiene prueba.

| Quién ejecuta | Funciones |
|---|---|
| `app_empresa` — acceso | `sesion_crear`, `sesion_validar`, `sesion_revocar` (una sesión, o todas las de una cuenta), `abrir_contexto` (sesión + empresa + membresía + versión del rol), `enlace_ingreso_crear`, `enlace_ingreso_emitir` (el trabajador fija la huella del valor nacido en él, ADR-08), `enlace_ingreso_consumir`, `codigo_corto_consumir`, `segundo_factor_*` |
| `app_empresa` — contexto | `resolver_empresa`, `mis_empresas`, `empresas_activas`, `miembros_listar` (el correo vive en `cuenta_usuario`, global), `invitacion_leer(huella)`, `invitacion_aceptar`, `clave_api_validar(huella)`, `congelacion_activa(empresa_id)` (solo lectura, la consultan `anonimizar` y los borrados por plazo, ADR-23) |
| `app_empresa` — servicios | `resumen_no_leidas_*`, `limite_consumir`, `evento_seguridad_ingreso_registrar`, `estado_correo_registrar`, `autorizacion_soporte_crear`, `autorizacion_soporte_revocar`, `autorizacion_soporte_listar` (la empresa sale del contexto, nunca de un parámetro) |
| `app_empresa` — funciones comunes, no DEFINER | `siguiente(empresa_id, clave, n)` (SECURITY **INVOKER**: fija la empresa y reserva en una llamada, ADR-15), `anonimizar` (INVOKER, consulta `congelacion_activa`) |
| `app_soporte` | `soporte_usar`, `soporte_abrir_lectura`, `soporte_auditar` (ADR-03) |
| `app_plataforma` | `empresa_crear`, `empresa_suspender`, `empresa_reactivar` (PS-01), `rescate_solicitar/aprobar/ejecutar`, `acceso_emergencia_solicitar/aprobar/emitir` (PS-02 y PS-05, con las dos personas comprobadas **dentro** de la base), `limite_plataforma_ajustar` (PS-04), `correo_global_cambiar` (PS-06), `sesiones_revocar_alcance` (una persona, una empresa o todas; también enlaces), `clave_api_suspender`, `suspension_reaplicar`, `purga_acta_aprobar`, `congelacion_declarar/confirmar/levantar`, `crear_particion_auditoria(mes)`, `webauthn_*` (ADR-08). Detalle y controles en ADR-23 |
| `mantenimiento` | `purgar_particion_auditoria`, `purgar_particion_evento_seguridad`, `contador_reparar` |
| `lector_auditoria` | `transaccion_mas_antigua()` (solo lectura, para la marca de agua de la copia, ADR-11) |

Son propiedad de `migraciones`; como las tablas de negocio tienen `FORCE ROW LEVEL SECURITY`, **ni siquiera el dueño las lee sin contexto de empresa**: lo que necesitan leer sin contexto lo hacen por las políticas `TO migraciones` de ADR-03, y lo que escriben lo hacen fijando el contexto de una empresa dentro de la función. Una prueba compara las funciones con `prosecdef` del catálogo contra la lista cerrada (nombre, dueño, `search_path`, `EXECUTE` por rol y huella de la definición): una función nueva sin ADR falla. Otra prueba busca en el catálogo toda función cuyo código llame a `set_config`: solo pueden ser las de esta lista y `siguiente`.

## Opciones descartadas
- Una cola o registro "por empresa": la cola es de infraestructura y se consulta antes de saber la empresa; forzarle empresa agrega complejidad sin ganancia si la carga útil no tiene datos.
- Políticas por usuario en las globales con acceso directo: más superficie que una función puntual.
- Dar a `app_plataforma` permisos de escritura directos sobre `empresa`, `membresia` o `autorizacion_soporte`: es el atajo que la revisión de Seguridad (H-SEG-33, 38) quiere evitar; la lista completa de funciones lo hace innecesario.
- Mantener `invitacion` y `clave_api` globales con ocho funciones más: más superficie con DEFINER sin ganancia (D04-2).

## Consecuencias
- La aplicación necesita un paso de más (función) para sesión y acceso; un viaje por petición con `abrir_contexto`.
- Agregar una tabla global o una función exige actualizar este ADR y el visto bueno de Seguridad.
- `lector_auditoria` ve todas las empresas por diseño. Su copia externa **no es "sin valores personales"**, como decía el texto anterior: la auditoría guarda IP (D-030.5) y motivos por valor (D-077). Por eso la copia externa guarda la fila **sin `ip` ni `motivo`** y, en su lugar, un resumen con llave de cada uno (ADR-11, H-SEG-43).
- Una prueba de CI nueva por categoría de objeto (A, B, C).

## Qué prueba lo valida
Pruebas (1) a (5) de arriba, la de lista global (categorías A, B, C), la de funciones DEFINER con su matriz de ejecución y la de `set_config` (H11 del prototipo); intento de lectura de una tabla de negocio con `app_plataforma` falla; `app_empresa` intentando ejecutar una función de plataforma o de mantenimiento falla; `app_plataforma` intentando INSERT/UPDATE/DELETE directo falla.

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-33 (alta) | Incorporado: `app_plataforma` sin escritura directa en ninguna tabla; `autorizacion_soporte`, `registro_plataforma` y `purga_acta` con permisos mínimos y disparadores (detalle en ADR-03 y ADR-23). |
| H-SEG-36 | **Propuesta, a ratificar por el Gerente:** sexto rol `app_soporte`. |
| H-SEG-38 | Incorporado: lista completa de funciones por rol; el control dual de PS-02 y PS-05 vive en la base (ADR-23). |
| H-SEG-39 | Incorporado: `PUBLIC`, `search_path` sin `public`, `CREATE` en `public`, ningún rol superusuario ni BYPASSRLS, matriz exacta, sin permisos por omisión. |
| H-SEG-42 | La separación de credenciales por proceso vive en ADR-01; aquí se fija qué rol existe en qué proceso. |
| H-SEG-43 | Corregida la frase "la copia externa no contiene valores personales". |
| H-SEG-44 | `cola` es categoría B y solo se entra por las funciones de la librería (con error normalizado, ADR-02). |
| D04-1 | Incorporado: tres categorías. El README pasa de "13 a 18" a "17 tablas más infraestructura". |
| D04-2 | Incorporado (alternativa preferida): `invitacion` y `clave_api` son tablas de empresa. |
| D04-3 | Incorporado en ADR-12 y ADR-23 (constancia externa y congelación). |
| D04-4 | Incorporado como medición (H5/H10) en ADR-16. |
| D04-5 | Incorporado: correo de intento fallido como huella `correo_intento`. Cambia lo que guarda `evento_seguridad_ingreso` (menos datos personales). |
| D04-6, D04-7 | Incorporados. Uso `search_path = pg_catalog, pg_temp` en funciones (más estricto que `pg_catalog, public` de Datos, que queda para los roles) por H-SEG-39. `lector_auditoria` lee también el detalle de lotes; no incluye eventos de seguridad (DevOps y Cumplimiento confirman si la copia debe cubrirlos). |

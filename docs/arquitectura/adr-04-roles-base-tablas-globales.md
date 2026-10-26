# ADR-04 · Cinco roles de base de datos y lista cerrada de tablas globales (T-3)

**Estado:** Propuesto · **Decide:** Gerente de TI (firma Seguridad la lista) · **Base:** D-039.3 a 5, D-048.5, D-054.1, `plan-entornos-y-costos.md` §1.2

## Contexto
Hay datos que no pertenecen a una sola empresa o se consultan antes de saber la empresa (usuario, sesión, enlace, clave de API). Además DevOps dejó preguntas abiertas: si la cola de trabajos y el registro de plataforma son globales, y si la partición de auditoría es anual o mensual.

## Decisión

### Los cinco roles
| Rol | Permisos | No puede |
|---|---|---|
| `app_empresa` | Aplicación y trabajador. Tablas de negocio (según tabla), esquema `cola`, lectura de catálogos, EXECUTE de las funciones DEFINER. Auditoría: solo INSERT y SELECT | Ser dueño, superusuario o tener BYPASSRLS; tocar directamente tablas globales sensibles |
| `app_plataforma` | Solo tablas globales de plataforma (`administrador_plataforma`, `registro_plataforma`, `autorizacion_soporte`, `limite_plataforma`, listado de empresas vía función) | Leer cualquier tabla de negocio (lo impone la base) |
| `migraciones` | Dueño de objetos; aplica migraciones; es dueño de las funciones DEFINER | Existir en la aplicación en marcha: solo en el paso de publicación |
| `mantenimiento` | EXECUTE de `purgar_particion_auditoria` y de la purga de eventos de seguridad | Ser dueño; usarse sin dos personas autorizadas |
| `lector_auditoria` | SELECT de `auditoria` mediante **política explícita** `TO lector_auditoria USING (true)` | Escribir; se prohíbe BYPASSRLS también aquí |

Pruebas en cada cambio y en cada entorno: (1) las de aislamiento corren como `app_empresa`; (2) `app_empresa` no es dueño, ni BYPASSRLS, ni superusuario; (3) `app_plataforma` no lee ninguna tabla de negocio; (4) los permisos de `mantenimiento` y `lector_auditoria` son exactamente los de esta tabla (comparación contra el catálogo).

### Lista cerrada de tablas globales
Las únicas tablas que pueden existir sin `empresa_id`. La mantiene el Arquitecto y la firma Seguridad. Una prueba de CI **falla** si aparece una tabla que ni está aquí ni tiene las protecciones de empresa.

| # | Tabla | Quién entra | Nota |
|---|---|---|---|
| 1 | `cuenta_usuario` (incluye segundo factor y códigos de recuperación) | funciones | correo normalizado; semilla cifrada por usuario |
| 2 | `sesion` | funciones | solo huella del identificador |
| 3 | `enlace_ingreso` | funciones | huella del enlace, del navegador y del código corto |
| 4 | `invitacion` | funciones | huella del token |
| 5 | `clave_api` | función `clave_api_validar(huella)` | búsqueda por huella |
| 6 | `tipo_evento` | lectura directa | se llena desde el catálogo en código |
| 7 | `estado_correo` | función | datos mínimos del proveedor |
| 8 | `moneda` | lectura directa | ISO 4217 con decimales |
| 9 | `pais` | lectura directa | |
| 10 | `administrador_plataforma` | `app_plataforma` | |
| 11 | `limite_plataforma` | `app_plataforma` | |
| 12 | `resumen_no_leidas` | funciones | por usuario, nunca recorriendo empresas |
| 13 | `evento_seguridad_ingreso` | función | accesos fallidos sin empresa; 12 meses |
| 14 | `autorizacion_soporte` | `app_plataforma` + funciones | ADR-03 |
| 15 | `registro_plataforma` | `app_plataforma` | crear, suspender, rescatar empresas (D-048.5d) |
| 16 | `limite_uso` | función `limite_consumir` | limitador (ADR-16), llaves por huella |
| 17 | `purga_acta` | `mantenimiento` y `app_plataforma` | constancia y dos aprobadores de cada purga |
| 18 | esquema `cola.*` | `app_empresa` | **infraestructura** de la librería; carga útil solo con identificadores (ADR-02) |

Las 13 primeras son las de D-039.4; la 14 a 18 se **agregan** aquí (resuelven las preguntas de DevOps: **la cola es global y el registro de plataforma es global**; el "registro de empresa", lo que vio soporte, no es global: es la auditoría de la propia empresa).

**Aclaraciones:**
- `empresa` y `membresia` **no** son globales: tienen seguridad por fila. Se llega a ellas con `resolver_empresa` y `mis_empresas`.
- Los eventos de seguridad son dos tablas: `evento_seguridad_ingreso` (global, sin empresa) y `evento_seguridad` (por empresa **del actor**, D-054.1), ambas con partición mensual y retención de 12 meses.
- `reloj_prueba` no existe en producción (ADR-02).

### Funciones SECURITY DEFINER (lista cerrada)
Lo único que `app_empresa` puede ejecutar sobre las globales sensibles. Cada una fija `search_path`, devuelve lo mínimo, toca solo tablas globales y tiene prueba:
`sesion_crear/validar/revocar`, `abrir_contexto` (sesión + empresa + membresía + versión del rol), `enlace_ingreso_crear/consumir`, `codigo_corto_consumir`, `invitacion_leer/aceptar`, `clave_api_validar`, `resolver_empresa`, `mis_empresas`, `empresas_activas`, `resumen_no_leidas_*`, `limite_consumir`, `evento_seguridad_ingreso_registrar`, `autorizacion_soporte_crear`, `iniciar_lectura_soporte`, `estado_correo_registrar`, `segundo_factor_*`.

Son propiedad de `migraciones`; como las tablas de negocio tienen `FORCE ROW LEVEL SECURITY`, **ni siquiera el dueño las lee sin contexto de empresa**. Una prueba compara las funciones con `prosecdef` del catálogo contra la lista cerrada (nombre, dueño, `search_path` y huella de la definición): una función nueva sin ADR falla.

## Opciones descartadas
- Una cola o registro "por empresa": la cola es de infraestructura y se consulta antes de saber la empresa; forzarle empresa agrega complejidad sin ganancia si la carga útil no tiene datos.
- Políticas por usuario en las globales con acceso directo: más superficie que una función puntual.
- Sexto rol para ser dueño de las funciones: la seguridad por fila forzada ya cubre el riesgo; "una forma de hacer cada cosa".

## Consecuencias
- La aplicación necesita un paso de más (función) para sesión y acceso; un viaje por petición con `abrir_contexto`.
- Agregar una tabla global exige actualizar este ADR y el visto bueno de Seguridad.
- `lector_auditoria` ve todas las empresas por diseño: la copia externa no contiene valores personales (D-030) y solo vive en su trabajo.

## Qué prueba lo valida
Pruebas (1) a (4) de arriba, la de lista global y la de funciones DEFINER (H11 del prototipo); intento de lectura de una tabla de negocio con `app_plataforma` falla.

# Prototipo técnico previo a la Etapa 1 (3 a 4 días)

**Autor:** Arquitecto de Software · **Fecha:** 2026-10-26 · **Base:** D-055 (prototipo ampliado), D-039.10, D-073, `plan-entornos-y-costos.md` §10, H-ARQ-13

## 1. Para qué sirve
Antes de escribir la primera tabla real, comprobar con una prueba corta y con **datos inventados** que las piezas difíciles de los ADR 01 a 20 funcionan juntas en el **proveedor candidato**, con su agrupador de conexiones y con el rol `app_empresa`. Es una prueba para **aprender y descartar riesgos**, no el comienzo del producto: la rama del prototipo no se fusiona tal cual; se rescatan las macros SQL, las funciones y las pruebas.

## 2. Quién hace qué
- **Ejecutan:** Arquitecto e Ingeniero de Datos.
- **Mide:** QA (los siete criterios de aislamiento y los umbrales).
- **Prepara el terreno:** DevOps (sección 5).
- **Revisa:** Seguridad (H2, H6, H8, H9).
- **Resultado:** `docs/arquitectura/prototipo-resultados.md` (cifras, qué pasó, qué se cambia) y cada ADR pasa a "Aceptado" o vuelve a mesa.

## 3. Hipótesis, criterios de éxito y de fracaso
**Obligatoria** = si falla, el Arquitecto vuelve a mesa antes de la Etapa 1 (D-055). Los umbrales de rendimiento son **propuestos**: QA puede reajustarlos con registro.

| # | Hipótesis (ADR) | Éxito | Fracaso | Tipo |
|---|---|---|---|---|
| H1 | **Aislamiento** con `app_empresa` por el agrupador en modo transacción (03, 04, 05) | Los 7 criterios de QA en verde: consulta sin filtro = 0 filas ajenas; insertar con empresa ajena falla; clave foránea cruzada falla; UPDATE/DELETE ajenos afectan 0; **10.000 peticiones intercaladas de 2 empresas** sobre un grupo compartido con **cero** filas ajenas, también después de un error, una cancelación y una conexión cortada; conexión limpia tras error; `app_empresa` no puede modificar la auditoría. Rol sin dueño, sin BYPASSRLS, sin superusuario. `app_plataforma` lee 0 tablas de negocio | **Una sola** fila ajena visible, o una empresa "pegada" en una conexión | Obligatoria |
| H2 | **Lectura de soporte** (03) | Los 8 casos: válida lee solo esa empresa y las escrituras fallan; **vencida** = 0 filas; **de otra empresa** = 0 filas de la otra; **ya usada por otra persona** = rechazo; revocada = rechazo; tablas `sin_soporte` = 0 filas; la auditoría previa se escribe aunque la lectura falle; la conexión vuelve limpia | Cualquier fila de otra empresa o de tabla restringida, o una escritura que prospere | Obligatoria |
| H3 | **Auditoría particionada, solo agregar y purga** (11) | `app_empresa` rechazado en UPDATE/DELETE/TRUNCATE; partición por mes creada por el trabajo; purga rechaza < 60 meses, sin dos aprobadores y con el interruptor apagado, y acepta una partición simulada de 61 meses con constancia; consulta por (empresa, entidad, id) con **2 millones de filas** en 24 particiones p95 ≤ 200 ms; inserción p95 ≤ 20 ms | La aplicación puede alterar la auditoría; la purga prospera sin condiciones | Obligatoria (base); rendimiento deseable |
| H4 | **Índice parcial, consulta recursiva, actualización condicional, capacidad** (13, 15) | Ubicación de 3 niveles y consulta de impacto de 5 niveles con **ciclo detectado**; **50 aprobaciones simultáneas: gana exactamente 1**; **200 intentos sobre 100 puestos: exactamente 100 éxitos** y el `CHECK` nunca se viola | Más de un ganador o sobrecupo | Obligatoria |
| H5 | **Contadores** (15) | 20 y 50 conexiones simultáneas pidiendo 100 números cada una: **cero duplicados, cero interbloqueos**, p95 de `siguiente` ≤ 50 ms; una reserva de 5.000 no retrasa a otras > 100 ms; con un grupo de 10 conexiones y 50 solicitudes no hay agotamiento | Duplicados o interbloqueo | Obligatoria |
| H6 | **Acceso** (08, 09) | Sesión revocada falla en la petición siguiente; 3 `GET` del enlace (filtro de correo) no lo gastan y el `POST` entra; `POST` desde otro navegador sin la cookie falla y con el **código corto** entra; el código muere a los 5 intentos; TOTP acepta ±1 paso y rechaza reutilizar; bloqueo 5/1/2/5/15 con reloj fijado; verificación reciente a los 10 minutos | Un enlace gastado por un `GET`; una sesión revocada que sigue viva | Obligatoria |
| H6b | **Decisión sobre Auth.js** (08) | Se mide cuántas piezas hay que reemplazar. **Más de dos** (tablas, enlace, sesión): se usa solo como capa de proveedores | - | Decisión, no pasa/falla |
| H7 | **Cola y trabajador** (02) | **Elección de librería** (graphile-worker o pg-boss) con los criterios del ADR; trabajador detenido con `kill -9` a mitad de un trabajo: se completa **una sola vez** al reiniciar; dos trabajadores: **una** corrida diaria por empresa y día; trabajo envenenado llega a "muerto" con alarma sin frenar a los demás; encolar y revertir no deja trabajo; el trabajo con 2 empresas deja cada registro en la suya y salta la suspendida; funciona por conexión directa y encola por el agrupador | Trabajo duplicado, perdido, o fuga entre empresas | Obligatoria |
| H8 | **Prueba RS-51** (09) | La prueba pasa sobre los flujos reales y **detecta el valor plantado** (control positivo); falla si se guarda un enlace en claro | La prueba pasa en verde con un valor en claro plantado | Obligatoria |
| H9 | **Secretos** (07) | Derivación y AES-GCM; un valor movido a otra fila no se descifra; rotación v1 a v2 de **10.000 valores** sin interrumpir lecturas | Se descifra un valor ajeno o se pierde un valor | Deseable (Seguridad decide) |
| H10 | **Ajuste de Prisma** (03, 06) | Sobrecarga de `conEmpresa` p95 ≤ 15 ms frente a consulta sin él; transacción interactiva funcional con el agrupador; tabla particionada, índice parcial, columna generada, funciones y macro dentro de migraciones sin que `prisma migrate diff` marque divergencia; UUID v7 | Prisma no puede con el agrupador o con las migraciones | Deseable (plan B abajo) |
| H11 | **Pruebas genéricas de CI** (03, 04, 14) | Se introduce a propósito una tabla sin protección, una tabla fuera de la lista global, un rol con BYPASSRLS, una función DEFINER no listada y un ciclo entre módulos: **cada uno hace fallar la integración continua** | Algo de lo anterior pasa en verde | Obligatoria |

**Criterio global.** Éxito: todas las obligatorias en verde y H6b/H7 decididas. Fracaso: una sola obligatoria en rojo al cuarto día.

## 4. Qué NO se prueba
Pantallas, flujos de negocio, rendimiento con 100.000 activos (eso es la prueba de carga nocturna desde la Etapa 4), importación y exportación completas, correo real, almacén de anonimizaciones y copia de auditoría reales (DevOps los ensaya aparte, sección 5). No se usan datos reales ni se toca nada de producción.

## 5. Qué se necesita de DevOps
Según `plan-entornos-y-costos.md` §10, **antes del primer día**:
1. **Día 0** (2 a 4 horas por candidato): resultado de las 9 comprobaciones (cinco roles con `app_empresa` sin BYPASSRLS; seguridad por fila forzada, función DEFINER y clave foránea compuesta; tabla particionada, índice parcial, recursiva, actualización condicional; las cinco extensiones; **agrupador en modo transacción con `set_config` local**; conexión directa disponible; **60 conexiones** reales; recuperación a un punto en el tiempo; región y contrato).
2. Alojamiento de ejecución continua de prueba con **dos servicios** (web y trabajador) y el entorno con 60 conexiones.
3. Repositorio con revisión automática mínima: análisis, pruebas, PostgreSQL desechable, trabajador y bandeja de captura.
4. **Guion repetible** que crea los cinco roles.
5. **Reloj fijable** y disparador manual (si no está definido, lo prueba H6/H7).
6. Un depósito de objetos de prueba (solo para ensayos de H9 si procede; no bloquea).
7. La **bitácora de límites** del proveedor.
8. Un **generador** mínimo de dos empresas (A y B con códigos idénticos a propósito) con datos inventados, y la **herramienta de inyección de fallos** (cortar conexiones, detener el trabajador).

Durante el prototipo DevOps mide arranque del servicio, comportamiento del trabajador al reiniciar y consumo con 20 y 50 conexiones.

## 6. Calendario sugerido
| Día | Contenido |
|---|---|
| 0 | DevOps: compatibilidad del proveedor; si ninguno pasa, vuelta a mesa antes de gastar más |
| 1 | H1, H11 (roles, macro, seguridad por fila, funciones DEFINER, pruebas genéricas) |
| 2 | H2, H3, H4 (soporte, auditoría particionada, patrones de concurrencia) |
| 3 | H5, H6/H6b, H7 (contadores, acceso, cola y trabajador) |
| 4 (reserva) | H8, H9, H10 y repetir lo que haya fallado; informe de resultados |

## 7. Qué se hace si falla
| Si falla | Alternativa | Quién decide |
|---|---|---|
| El proveedor no permite roles sin BYPASSRLS o funciones DEFINER (día 0) | Otro candidato o una base propia en el alojamiento; si cambia el costo, **[ESCALAR AL CEO]** solo por dinero | Gerente de TI con DevOps |
| H1 por el agrupador (la empresa se "pega") | Agrupador en modo sesión con conexiones reservadas, o transacciones sin agrupador para la web con menos conexiones | Arquitecto, Datos |
| H2 (soporte) | Acortar la ventana y reforzar la función; si no es seguro, **suspender la lectura de soporte** hasta la Etapa 7 (soporte sin acceso a datos, con pantalla compartida) y avisar al Gerente de TI | Gerente de TI con Seguridad |
| H3 (partición con Prisma) | SQL puro para esa tabla y su acceso con consulta nativa | Arquitecto |
| H4 (patrones) | Bloqueo de fila explícito (`FOR UPDATE`) y reducción del parcial a tabla de reserva | Datos |
| H5 (contadores lentos) | Reserva por bloques en memoria de cada instancia (salta números, permitido por D-007.2) | Arquitecto, Datos |
| H6 (acceso) | Auth.js solo como proveedores y todo lo demás propio; enlace atado al navegador siempre propio | Arquitecto, Seguridad |
| H7 (cola) | Cambiar de librería, o una cola mínima propia con `SKIP LOCKED` (~200 líneas) | Arquitecto |
| H8 (RS-51) | Cualquier valor en claro encontrado se corrige antes de seguir; la prueba no se relaja | Seguridad |
| H10 (Prisma) | Kysely o SQL puro solo en `nucleo/aislamiento` y repos pesados; el resto sigue en Prisma (D-039.9) | Arquitecto |

**Regla de parada.** Si al cuarto día una obligatoria sigue en rojo, no se abre la Etapa 1: el Arquitecto presenta mesa con el hallazgo y la alternativa (riesgo #18). Una obligatoria corregida se vuelve a correr completa, no solo el caso que falló.

## 8. Qué entrega
`prototipo-resultados.md` con cifras por hipótesis, el ADR actualizado donde algo cambió, las macros SQL y las pruebas rescatables, y la lista de límites del proveedor. Después de la mesa, el Gerente de TI firma los ADR y la Etapa 1 puede empezar.

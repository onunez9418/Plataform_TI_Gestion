# Ronda 4: Especialista en Seguridad

**Fecha:** 2026-10-25 · **Qué abrí:** `docs/documento-funcional.md` (RF-PLA-001, 009, 011 a 013, RS-51, CA-015e/f, CA-083), `docs/registro-permisos.md` v1.1 (comprobación automática de las 231 filas vigentes), `docs/equipo/decisiones.md` (D-039.10, D-048, D-065, D-068, D-073, D-074), `docs/operaciones/plan-entornos-y-costos.md` (6.1 a 6.4, 8.2) y `docs/modulos/licencias-software.md`.

## 1. Conformidad con AN-04, AN-05 y AN-08

**Estoy conforme.** Lo comprobé en los archivos:

| Punto | Estado | Prueba |
|---|---|---|
| H-SEG-27: administradores de plataforma | Cerrado | RF-PLA-001: 2 a 3 personas; antes de datos reales, al menos dos. CA-015f: con una sola persona y datos reales, la empresa no puede cargarse. |
| H-SEG-27: acceso de emergencia | Cerrado | RF-PLA-009: exige segunda persona de plataforma o el contacto autorizado confirmado, avisa a todos los administradores, un uso por empresa y semana, segunda verificación aún exigida. PS-05 lleva `2F R A No` y ya no está marcado como supuesto. |
| H-SEG-27: contacto autorizado y veto | Cerrado | RF-PLA-011 (lo confirma el primer administrador; cambio con 24 h y aviso a todos) y RF-PLA-012 (veto de cualquier administrador activo durante el rescate); CA-015e. |
| H-SEG-26: lectura de soporte | Cerrado en diseño | RF-PLA-013 y D-039.10: transacción de solo lectura con `app_empresa`, autorización temporal que crea **un administrador de esa empresa**, función `SECURITY DEFINER` de lista cerrada, sin `BYPASSRLS`, sin ver columnas secretas ni la cola de derechos, con prueba (autorización vencida, ajena o ya usada = cero filas). Lo reviso en el prototipo. |
| H-SEG-28: solo huella | Cerrado | RS-51 y CA-083 con prueba automática en integración continua. |
| H-SEG-31: enlace en otro dispositivo | Cerrado | RF-ACC-006 y CA-068: código corto de 8 caracteres. Condición de diseño: el código es de un solo uso, vence junto con el enlace (15 min), cuenta dentro del límite de intentos fallidos (5, con esperas crecientes) y solo se muestra en el navegador que pidió el enlace. |
| Registro de permisos v1.1 | Conforme | 231 filas vigentes, **52 sensibles**, y **ninguna** fila con segunda verificación sin ser sensible ni al revés. Los 16 de D-068 están marcados con `2F A No` (aprobaciones, confirmaciones de costo, gastos, PS-68) o `2F R A` (PS-135, PS-232); PS-157 con `2F A`. PS-51 (`activos.corregir_costo`) lleva ahora `No`. PS-232 `empresa.configurar_aprobacion` es solo del Administrador y PS-08 queda sin monto límite. PS-234 (`texto.redactar`) es sensible. PS-233 (`plataforma.ver_conteos_seguridad`) no es sensible y solo lo tiene la plataforma: correcto, porque son solo conteos. PS-23 es solo "todo" y PS-230 cubre lo propio sin ser sensible. PS-154 (aprobar solicitud de ayuda) y PS-08 no son sensibles, como decidió D-068. |

Dos observaciones menores que no bloquean:
1. Los 16 sensibles de D-068 amplían la segunda verificación a Jefatura TI y a cualquier rol personalizado que apruebe dinero. Es la consecuencia aceptada por el Gerente de TI; el Diseñador debe prever el aviso de segunda verificación para quien aprueba (ya está en su plan, sección 3).
2. Falta una prueba concreta para el código corto: que no se pueda adivinar (8 caracteres sin letras ambiguas, aleatorio, sin reutilizar) y que el intento erróneo cuente como fallido. Que el Arquitecto la ponga en su caso de prueba de CA-068.

## 2. Aprobación de la estrategia de llaves (D-048.4, RS-46, plan de DevOps 6.1 a 6.3)

**Apruebo la estrategia, con las condiciones de abajo.** La apruebo para empezar la Etapa 1 y el prototipo con datos inventados; las condiciones 1 a 6 se cumplen antes de cargar datos reales.

**Lo que apruebo (lo comprobé en el texto):**
- Una **llave maestra fuera de la base, de los respaldos y del repositorio**, en el almacén de secretos del alojamiento (o gestor de secretos elegido). Quien se lleve la base o un respaldo no se lleva con qué abrirla.
- **Llaves derivadas** de la maestra: por **empresa** (claves de licencia, secretos de webhook) y por **usuario** (semilla de la segunda verificación, porque la cuenta es global). Es la separación correcta: comprometer la derivada de una empresa no abre las de otra.
- **Cifrado con versiones**, rotación **anual y ante sospecha**, con recifrado por lotes sin detener el servicio.
- **Llave de respaldos distinta** de la maestra (`BACKUP_ENCRYPTION_KEY`), y llave de firma de sesiones y enlaces (`AUTH_SECRET`) separada.
- **Respaldo de las llaves en dos lugares y con al menos dos custodios**, y un **ensayo de restauración** que comprueba que la llave guardada abre la copia (plan 5.2, paso 6d).
- Cada entorno con sus propias claves; secretos nunca en el repositorio, en JSON de campos, registros, auditoría ni exportaciones, con prueba automática que los busca.
- Solo huella para valores que sirven para entrar (RS-51) y huella de alta entropía para claves de API; secretos de webhook **cifrados** (porque hay que firmar con ellos).

**Condiciones:**

| # | Condición | Responsable | Cuándo |
|---|---|---|---|
| 1 | **Derivación escrita**: una función estándar de derivación de llaves (HKDF u otra equivalente aprobada) con contexto fijo por tipo y por empresa o usuario (por ejemplo `licencia:<empresa>`, `webhook:<empresa>`, `totp:<usuario>`); cada valor cifrado lleva la **versión** de la llave. Nunca se usa la misma llave para dos fines. | Arquitecto (ADR T-5) | Antes de la primera tabla con campo cifrado (Etapa 1 para el segundo factor) |
| 2 | **La llave maestra de producción no existe en integración continua, en el entorno de pruebas ni en el equipo de desarrollo.** Las pruebas y los entornos efímeros usan llaves propias de cada entorno. En el repositorio solo `.env.example` con valores de relleno. | DevOps | Antes de la Etapa 1 |
| 3 | **Custodios**: dos personas nombradas por escrito (acta, sin escribir las llaves) que no sean las dos únicas administradoras de plataforma a la vez, para que quien administra la plataforma no pueda por sí solo abrir lo cifrado. El Administrador de plataforma **no tiene acceso al almacén de secretos**. | CEO designa (decisión suya); DevOps ejecuta | Antes de datos reales |
| 4 | **El respaldo de las llaves en un gestor de contraseñas de equipo** (plan 6.1, punto 3) exige segunda verificación para cada custodio y registro de accesos; es un solo lugar de los dos, no ambos. El otro lugar es físico o un almacén distinto del alojamiento. | DevOps | Antes de datos reales |
| 5 | **Ensayo de pérdida**: antes de datos reales, un simulacro en pruebas: "se perdió la llave maestra" y "se filtró la llave maestra". Debe quedar escrito qué se pierde (claves de licencia no recuperables; semillas de segunda verificación: cada persona se reenrola con su código de recuperación, que son huellas y no dependen de la llave) y que **rotar la maestra completa se puede hacer en menos de 4 horas con los datos de prueba**. | DevOps, Seguridad | Antes de datos reales |
| 6 | **La llave en la memoria de la aplicación** es el punto débil conocido: si alguien ejecuta código dentro de la aplicación, la ve. Se acepta para la v1, con estas mitigaciones: no se imprime nunca (filtro de registros y reporte de errores, plan 8.1); no está en los volcados de error; el proceso del trabajador y el de la web la leen al arrancar y no la guardan en la base. Si el proveedor ofrece un servicio de llaves gestionado con operación de "cifrar/descifrar" sin entregar la llave, se evalúa en la Etapa 7 (decisión del Arquitecto con Seguridad). | Arquitecto, DevOps | Etapa 7 |
| 7 | **Rotación anual** con calendario y alerta (como los vencimientos de proveedor, plan 8.1); y rotación inmediata de lo que aparezca expuesto (plan 6.1, punto 7). La rotación de `AUTH_SECRET` cierra sesiones y enlaces: se anuncia. | DevOps | Desde que haya datos reales |
| 8 | **Prueba automática** de que ningún valor cifrado, llave ni secreto aparece en la base en claro, en la auditoría, en los registros ni en exportaciones (RS-46; generaliza RNF-INT-005), y de que el rol `app_plataforma` no puede leer columnas cifradas. | QA, Arquitecto | Etapa 2 (campo secreto) |

Lo que **no** cambia ni requiere CEO: nada de esto es dinero, ni legal, ni irreversible, salvo **nombrar a los custodios** (condición 3), que es una designación del CEO y está en su hoja de decisiones.

## 3. Procedimiento de incidente

Entregué el borrador 0.1 de `docs/operaciones/procedimiento-incidente-datos.md` (secciones 1 a 10 y anexos A y B). El Auditor de Cumplimiento co-redacta la sección 6 y el anexo C. Marqué como **[ESCALAR AL CEO]** lo legal (L-01, L-02, L-04, L-08, L-16) y la designación de la persona de guardia.

## 4. Veredicto de esta ronda

- AN-04, AN-05, AN-08: **conforme.**
- Estrategia de llaves: **aprobada con las 8 condiciones de arriba** (1 y 2 antes de la Etapa 1; 3 a 5 y 7 antes de datos reales; 6 en la Etapa 7; 8 en la Etapa 2).
- Hallazgos H-SEG-26 a 29, 31: cerrados. H-SEG-30: cerrado por D-068. H-SEG-32 (c) y (d): quedan decididos por D-073.3 y D-071; (e) repositorio sigue pendiente de DevOps.
- Sin hallazgos Críticos ni Altos abiertos del núcleo en seguridad.

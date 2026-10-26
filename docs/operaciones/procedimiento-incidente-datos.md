# Procedimiento ante una fuga de datos o un acceso indebido

**Versión:** 0.3 (borrador) · **Fecha:** 2026-10-26
**Redacta:** Especialista en Seguridad · **Co-redacta:** Auditor de Cumplimiento (sección 6 y anexo C, v0.3) · **Aprueba:** Gerente de TI
**Base:** D-059 (roles, gravedad y plazos), D-048 (llaves y control dual de la plataforma), D-052 (restauración y copia externa de la auditoría), D-054 (eventos de seguridad), D-032 (respaldos), `docs/operaciones/plan-entornos-y-costos.md` sección 8.2 (lo que prepara DevOps).
**Estado:** borrador. **No se puede cargar ningún dato real de una empresa hasta que este procedimiento esté aprobado, ensayado una vez y validado por un abogado en lo legal** (D-064 condición 13; Etapa 7).

> **Para el CEO, en una frase:** si alguna vez los datos de una empresa llegan a alguien que no debía verlos, o alguien entra donde no debía, este documento dice quién decide, qué se hace en la primera hora, cuándo se le avisa a usted, a quién más hay que avisar y cómo se aprende para que no se repita. Lo legal (qué ley, a quién y en cuánto tiempo hay que avisar) **lo tiene que confirmar un abogado**; está marcado así en el texto.

---

## 1. Qué es un incidente y cómo se clasifica

**Incidente de datos:** cualquier hecho en el que datos de una empresa (activos, compras, personas, correos), claves o secretos pudieron ser vistos, copiados, cambiados o borrados por quien no tenía permiso, o en el que el control del sistema se pudo perder.

Ejemplos: una empresa ve datos de otra; una cuenta de administrador se usa por otra persona; una llave o una clave de API aparece en un lugar público; un respaldo o una exportación llega a quien no debía; el registro de auditoría muestra una alteración; el proveedor de alojamiento o de correo avisa de una brecha.

| Gravedad | Cuándo | Qué se espera |
|---|---|---|
| **G1** | Acceso o fuga **confirmada** de datos de una o más empresas, de claves o de secretos | Contener en 1 hora; avisar al CEO en 24 horas; todo el procedimiento |
| **G2** | **Sospecha seria**, alerta de integridad de la auditoría, o una cuenta de plataforma o de administrador sospechosa | Contener lo que se pueda de inmediato; confirmar o descartar en 24 horas; si se confirma, pasa a G1 |
| **G3** | Hecho menor **sin datos expuestos** (un intento rechazado que funcionó como debía, un escaneo, un error sin datos) | Se anota, se corrige y se revisa en la reunión de seguridad |

**Regla de oro:** ante la duda, se declara como G2 y se baja después. Declarar de más no cuesta nada; declarar tarde puede costar mucho.

## 2. Quién hace qué

| Papel | Quién | Qué decide o hace |
|---|---|---|
| **Líder del incidente** | Especialista en Seguridad (si no está, DevOps) | Dirige, clasifica la gravedad, lleva el registro y decide el orden de las acciones |
| **Decide la contención y los accesos** | Gerente de TI | Autoriza suspender una empresa, una integración o una cuenta, y rotar claves |
| **Ejecuta la contención técnica** | DevOps (con el Arquitecto para lo que son funciones de la plataforma) | Revoca sesiones, rota claves, suspende, preserva evidencia |
| **Evalúa si hay obligación de avisar** | Auditor de Cumplimiento, con el abogado | Qué se debe avisar, a quién y en cuánto tiempo |
| **Habla con el CEO y con las empresas afectadas** | Jefatura de Proyecto | Comunica en lenguaje claro, con el texto preparado por Cumplimiento |
| **Responsable de guardia** | **Una persona real con nombre y su suplente**, nombradas por escrito antes de producción (D-059.1, D-064 condición 9) | Recibe las alertas fuera del horario de la sesión de trabajo |

> **Pendiente real:** hoy el equipo de TI de esta plataforma trabaja en sesiones; no hay nadie de guardia. Sin una persona de guardia nombrada no se puede cumplir la hora de contención. Es condición para producción. **[ESCALAR AL CEO]** nombrar a la persona y su suplente (es una decisión suya, no del equipo).

Reglas del equipo de respuesta:
- Quien tiene un conflicto (por ejemplo, el incidente nació de su propio cambio) lo declara y no decide sobre ese punto.
- Nadie borra nada para "limpiar". Se preserva primero.
- Las comunicaciones del incidente van por el canal que el Gerente de TI fije, nunca por el mismo sistema que pudo comprometerse.

## 3. Detectar y declarar

**Cómo se entera el equipo:**
- Alertas del monitoreo (plan de DevOps, sección 8.1): accesos fallidos en cantidad, una exportación inusual (más de 5 por hora por usuario), un cambio en el monto límite, una sesión de soporte fuera de lo autorizado, la verificación semanal de la copia de auditoría que no coincide, un respaldo que no llegó.
- Un usuario o un administrador que ve algo raro (datos que no son de su empresa, un correo de acceso que no pidió).
- El proveedor de alojamiento, de correo o de base de datos.
- Un tercero que avisa (un investigador de seguridad, un cliente).

**Cualquier persona puede declarar un incidente.** Se hace diciéndolo a la Jefatura de Proyecto o al Líder del incidente. No se pide permiso ni se espera a estar seguro.

**Al declarar, se abre un registro** en `docs/operaciones/incidentes/` (ver sección 8) con: hora exacta, quién lo vio, qué se vio y gravedad provisional. **Ese registro no lleva datos personales ni secretos**: se escribe "un usuario de la empresa B vio una lista de la empresa A", no los nombres ni los valores.

## 4. Contener (la primera hora)

Objetivo: **detener el daño en 1 hora desde la confirmación (o desde la sospecha seria en G2)**, sin destruir evidencia.

El Líder del incidente elige, con el Gerente de TI, entre estas acciones (Anexo A tiene el detalle operativo). Se aplican las mínimas necesarias, de la menos a la más drástica:

1. **Revocar sesiones y enlaces:** de una persona, de una empresa o de todas.
2. **Suspender** una integración (clave de API) o un webhook.
3. **Suspender una membresía** o una cuenta de plataforma sospechosa.
4. **Rotar claves:** de API, del correo, de la base, y, si hay sospecha sobre ellas, las llaves de cifrado (esto es lo más costoso; ver el Anexo A y la aprobación de la estrategia de llaves).
5. **Suspender una empresa** (RF-ACC-022): nadie entra; los datos se conservan.
6. **Aislar la causa:** retirar una versión recién publicada (plan de vuelta atrás), cerrar una ruta, apagar una función.
7. **Cerrar el sistema** como último recurso (aviso de mantenimiento, RNF-012).

Reglas:
- **No se borra nada.** No se limpian registros, no se reinicia el servidor sin copiar antes los registros técnicos, no se borran cuentas.
- **Preservar evidencia antes de cambiar:** la auditoría y su copia externa (RF-AUD-018), el registro de eventos de seguridad, los registros técnicos (propuesta: 90 días, sin datos personales ni secretos), el reporte de errores, y una copia de la configuración. Si se sospecha de la cuenta de plataforma, también el registro de plataforma.
- **No se avisa al sospechoso** antes de contener.
- Cada acción queda en el registro del incidente con hora y quién la hizo.

## 5. Evaluar el alcance (primeras 24 horas)

El Líder del incidente, con DevOps y el Arquitecto, responde por escrito:

1. **¿Qué pasó y desde cuándo?** (primera hora estimada del hecho)
2. **¿Qué empresas?** Una, varias o todas. La separación por empresa y los registros por empresa permiten saberlo; si no se puede saber, se asume el peor caso hasta probar lo contrario.
3. **¿Qué datos?** Tipos (activos, compras y precios, personas, correos, claves de licencia, secretos del sistema) y **cuántas personas** hay entre ellos. El Anexo C.3 ayuda a decidir rápido qué datos personales se asumen vistos según el tipo de incidente.
4. **¿Quién pudo verlos?** Una persona de otra empresa, un atacante externo, un empleado, un proveedor.
5. **¿Siguen expuestos?** ¿La contención funcionó? ¿Hay otras puertas abiertas?
6. **¿Los datos se podrían usar para dañar?** (claves de licencia, enlaces de acceso, semillas de la segunda verificación: si se tocaron las llaves de cifrado, se asume que todo lo cifrado quedó expuesto).
7. **¿Qué sabemos y qué no sabemos todavía?** Se escribe tal cual.

Con esto se confirma la gravedad (un G2 pasa a G1 o se baja a G3) y se pasa a la sección 6.

## 6. Avisar

> **En pocas palabras (para el CEO).** Cuando hay un incidente con datos de personas, el equipo responde cuatro preguntas en este orden: (1) ¿se vieron datos de personas?, (2) ¿eso puede perjudicarlas?, (3) ¿a quién hay que avisar y en cuánto tiempo?, (4) ¿quién redacta, quién aprueba y quién envía? Las preguntas 3 y 4 sobre la **autoridad** y las **personas** las decide **usted con el abogado**; el equipo no decide solo y no da opinión legal. El equipo prepara todo para que esa decisión sea rápida y quede justificada por escrito. Mientras no haya respuesta del abogado, la regla de prudencia es: se le avisa a usted dentro de 24 horas, se avisa a la empresa afectada, y no sale ningún aviso a la autoridad ni a las personas sin su decisión y la del abogado. Todo se anota, también lo que se decide **no** avisar.

Cumplimiento prepara los textos y lleva la cuenta de los plazos. **Ningún aviso a la autoridad o a las personas sale sin la revisión del abogado**, salvo el que el abogado haya aprobado de antemano como plantilla (Anexo C.1).

### 6.0 Antes de avisar: ¿hay datos de personas afectados?

Lo hace Cumplimiento con el Líder del incidente, dentro de las 24 horas de la sección 5, y se actualiza si cambia algo. El resultado se escribe en la ficha del Anexo C.7.

| # | Pregunta | Cómo se responde | Si no se sabe |
|---|---|---|---|
| 1 | ¿Entre lo expuesto hay datos de personas? | Con la tabla C.3: nombres, correos, códigos de empleado, equipos asignados a una persona, IMEI, número de línea, IP, contactos de proveedor, textos libres de casos y motivos | Se asume que **sí** hasta probar lo contrario. IMEI, línea, IP y códigos se tratan como personales hasta que el abogado diga otra cosa (L-09) |
| 2 | ¿De cuántas personas y de cuántas empresas? | Se cuentan por empresa, sin copiar los datos | Se da un rango y "se está calculando" |
| 3 | ¿Qué tan grave puede ser para ellas? | Con los factores del Anexo C.6 | Se asume el nivel alto |
| 4 | ¿Los datos estaban legibles, cifrados, enmascarados o anonimizados? | Según el tipo de incidente (C.3) y las llaves (D-048) | Se asume legibles |
| 5 | ¿Quién los pudo ver y hay señal de que se usaron? | Registro de eventos de seguridad, auditoría de exportaciones, registro de uso de claves | Se asume que sí se usaron |
| 6 | ¿Ya está contenido? | Resultado de la sección 4 | Se asume que no |

**Resultado de la evaluación (uno de tres):**
- **A. No hay datos de personas**, con la prueba escrita de por qué (por ejemplo, solo se vieron códigos de activos sin asignación). Se avisa al CEO y a la empresa por tratarse de datos de la empresa. No hay consulta sobre personas.
- **B. Hay datos de personas y no se ve riesgo evidente para ellas** (por ejemplo, un código sin nombre, o datos que ya estaban enmascarados). Se consulta al abogado antes de cerrar.
- **C. Hay datos de personas con riesgo posible.** Se consulta al abogado **de inmediato**.

Esta clasificación solo **ordena la urgencia** de la consulta. **No** es el criterio legal para avisar. Ese criterio lo fija el abogado (L-16). **[ESCALAR AL CEO: confirmar con abogado]** si existe un umbral por debajo del cual no hay que avisar y cuál es.

**Criterios para decidir avisar (a las personas y a la autoridad).** El equipo **no aplica un umbral propio**. Entrega al abogado un "paquete" (Anexo C.7) con los hechos y los factores de C.6, y le hace las preguntas de C.2. Mientras no responda:
1. En cualquier G1 con resultado B o C, se consulta al abogado el mismo día.
2. Si el abogado no responde o aún no está contratado, **usted decide con la información disponible** y queda escrito quién decidió, cuándo y por qué. **[ESCALAR AL CEO]** contratar al abogado con un canal de urgencia: es dinero y debe estar listo antes de cargar datos reales.
3. Una decisión de **no avisar** también se registra, con su razón y su fecha. No se decide "no avisar" sin la firma del CEO y del abogado.

### 6.1 Al CEO (siempre en G1)

- **Dentro de las 24 horas desde la confirmación** (plazo interno propuesto, D-059.3). Lo hace la Jefatura de Proyecto, **en lenguaje claro**, con la plantilla C.1.a: qué pasó, qué empresas, qué datos, qué ya se contuvo, qué falta, qué se necesita de usted. Sin jerga y sin ocultar nada, aunque falten datos ("esto sabemos, esto no sabemos").
- Si es G2, se le avisa cuando se confirme o, a más tardar, a las 48 horas si sigue sin descartarse (añadido de esta versión, no está en D-059; lo confirma el Gerente de TI).
- El aviso al CEO incluye siempre dos decisiones suyas pendientes: si se avisa a la autoridad y si se denuncia, ambas con el abogado.

### 6.2 A la empresa afectada, a las personas afectadas y a la autoridad

- **A la empresa:** plazo propuesto **72 horas desde la confirmación**, o menos si el abogado lo fija (D-059.4). Conviene avisar **en cuanto se tenga lo mínimo**, sin esperar a las 72 horas, porque los plazos de la propia empresa podrían empezar a correr cuando nosotros le avisamos. **[ESCALAR AL CEO: confirmar con abogado]** (L-16, d).
- **A las personas** (los empleados cuyos datos se vieron): lo normal es que las avise **la empresa**, como responsable de sus empleados, con nuestro texto (C.1.c). **[ESCALAR AL CEO: confirmar con abogado]** quién avisa a las personas, según el contrato y la ley de cada país (L-01, L-16).
- **A la autoridad de protección de datos:** **[ESCALAR AL CEO: confirmar con abogado]** si hay que avisar, a cuál (según el país de cada empresa), con qué contenido, por qué medio y en cuánto tiempo (L-16, L-07). El equipo solo prepara el borrador de partida (C.1.e). Lo aprueban el CEO y el abogado.
- **A quién avisa el equipo en la empresa:** administradores activos y contacto autorizado (RF-PLA-011); si no hay, ver C.4.
- **Contenido del aviso:** qué ocurrió, cuándo, qué datos, qué ya se hizo, qué puede hacer la persona para protegerse, a quién contactar. No incluye datos personales de otros ni detalles técnicos que ayuden a repetir el ataque.
- **Si el incidente afecta solo a una empresa**, no se avisa a las demás. **Si pudo afectar a varias**, se avisa a cada una solo de lo suyo (RF-ACC-011).
- **El reloj de los plazos** empieza en la **confirmación**. Si el abogado dice que empieza al "tener conocimiento", se cuenta desde la sospecha seria (G2). Por eso importan la regla de oro de la sección 1 y la hora anotada. Cumplimiento anota las tres horas (sospecha, confirmación, conocimiento de la empresa) en la ficha C.7.

### 6.3 Al proveedor y a otros

- Si la causa está en el proveedor de alojamiento, de base de datos o de correo, se les avisa de inmediato (plantilla C.1.d) y se les pide su informe. **Los contratos con proveedores técnicos deben obligarlos a avisarnos de un incidente de su lado** (D-059.5, L-08). **[ESCALAR AL CEO: confirmar con abogado]** revisar esas cláusulas antes de firmar.
- Si hay delito evidente (robo, intrusión), el CEO decide con el abogado si se denuncia. **[ESCALAR AL CEO: confirmar con abogado]**.

### 6.4 Quién decide, quién redacta y quién valida con el abogado

**Regla de canal:** la **Jefatura de Proyecto es el único canal con el abogado** (para que no haya instrucciones cruzadas). Cumplimiento le entrega el paquete (C.7) y la Jefatura **guarda la respuesta por escrito** (correo del abogado o nota firmada). Se puede actuar según una respuesta verbal solo si queda anotada hora y quien la recibió, y se pide confirmación escrita.

| Decisión o aviso | Quién redacta o propone | Quién decide o aprueba | Quién envía | Plazo |
|---|---|---|---|---|
| Gravedad (G1, G2, G3) | Líder del incidente | Líder; Gerente de TI si hay duda | n/a | Sección 1 |
| ¿Hay datos de personas? (6.0) | Cumplimiento | Líder del incidente | n/a | 24 horas |
| Aviso al CEO | Jefatura de Proyecto, con el Líder | Líder del incidente | Jefatura de Proyecto | 24 horas desde la confirmación (interno) |
| Aviso a la empresa afectada | Cumplimiento (plantilla C.1.b) | Gerente de TI; el abogado cuando exista el contrato | Jefatura de Proyecto | 72 horas, o menos si el abogado lo fija |
| Aviso a las personas afectadas | La empresa, con el texto de Cumplimiento (C.1.c) | La empresa y el abogado | La empresa | Lo fija el abogado (L-16) |
| Aviso a la autoridad | Cumplimiento con el abogado (C.1.e) | **El CEO y el abogado** | Quien el abogado indique | Lo fija el abogado (L-16) |
| Denuncia de un delito | Jefatura de Proyecto con el abogado | **El CEO y el abogado** | Quien indique el abogado | Sin plazo del equipo |
| Aviso al proveedor técnico | Líder del incidente (C.1.d) | Gerente de TI | DevOps | De inmediato |
| Cerrar el tema de avisos | Cumplimiento | Gerente de TI | n/a | Antes de cerrar el incidente (sección 7) |

Reglas: quien tiene un conflicto de interés en el incidente no decide sobre ese punto (sección 2). Ningún aviso se envía por el sistema que pudo comprometerse.

### 6.5 Marcas [ESCALAR AL CEO: confirmar con abogado] de esta sección

| Marca | Pregunta legal | Estado |
|---|---|---|
| L-01 | Ley aplicable y papel de cada parte (empresa, plataforma, alojamiento) | Pendiente; sin esto no se sabe quién debe avisar |
| L-02 | Registro o declaración de los bancos de datos y si un incidente obliga a algo ante esa autoridad | Pendiente |
| L-04 | Plazo para conservar el registro del incidente (propuesta 5 años), la evidencia y los eventos de seguridad (12 meses) | Pendiente |
| L-07 | Autoridad competente si hay empresas en otros países o el proveedor está en otro país | Pendiente |
| L-08 | Obligación contractual de los proveedores técnicos de avisar | Pendiente; antes de firmar los contratos |
| L-09 | Qué cuenta como dato personal para la evaluación 6.0 (IP, IMEI, línea, código de empleado) | Pendiente; se tratan como personales |
| L-16 | Obligación, destinatarios, contenido, umbral y plazos para avisar a la autoridad y a los afectados | Pendiente; condición de producción |

## 7. Resolver, restaurar y cerrar

1. **Eliminar la causa** (corregir el error, cerrar la puerta, retirar al usuario) y **probar** que quedó cerrada, con una prueba automática nueva si es posible.
2. **Si hay que restaurar un respaldo**, se sigue D-052.4 **antes de abrir el sistema**: reaplicar el registro de anonimizaciones, revocar todas las sesiones y enlaces, rotar las claves de API y reaplicar suspensiones, bajas y cambios de rol posteriores al respaldo (se reconstruyen desde la auditoría, que vive aparte). Se prueba el aislamiento sobre la base restaurada.
3. **Rotar lo que estuvo expuesto**, aunque no se pueda probar que se usó.
4. **Volver a abrir** solo con el visto bueno del Gerente de TI y del Líder del incidente.
5. **Informe en 10 días** (sección 9).
6. **Cerrar el incidente** cuando: la causa está corregida y probada, los avisos legales se cumplieron o se descartaron con razón escrita (con la fecha y quién decidió), y el informe está aprobado.

## 8. Registro del incidente

Cada incidente tiene un archivo `docs/operaciones/incidentes/AAAA-MM-DD-nn.md` creado desde la plantilla del Anexo B.

- **Nunca lleva datos personales reales, claves, valores de secretos ni nombres de personas afectadas.** Usa referencias (`PRS-0042`, "empresa B", "usuario de plataforma 1"). Si hace falta guardar detalle sensible como evidencia, se guarda **fuera del repositorio**, en el lugar controlado que DevOps y Seguridad definan (D-028), y el registro solo dice dónde.
- Contiene: línea de tiempo con horas exactas, decisiones y quién las tomó, acciones de contención, alcance, avisos hechos (a quién, cuándo, con qué texto), causa raíz, acciones correctivas con responsable y fecha, y riesgos actualizados.
- Se conserva **5 años** como la auditoría (propuesta provisoria; **[ESCALAR AL CEO: confirmar con abogado]** el plazo, L-04).
- Los incidentes G3 pueden agruparse en una línea de una tabla mensual.

## 9. Lecciones aprendidas y ensayo

**Informe en 10 días** desde el cierre de la contención, **sin buscar culpables**: qué falló en el sistema, en el proceso o en la prueba; qué habría detectado antes; qué cambia. Debe terminar con: acciones con responsable y fecha, pruebas nuevas, y los riesgos de `docs/equipo/riesgos.md` actualizados. El Gerente de TI lo revisa; el CEO recibe un resumen de una página.

**Ensayo:**
- **Antes de cargar datos reales:** un simulacro completo con cronómetro, con datos inventados: se declara un incidente supuesto (por ejemplo, "una clave de API apareció en un repositorio público" y "un administrador de plataforma perdió su llave física"), se contiene en menos de 1 hora, se redacta el aviso al CEO y se comprueba que se puede restaurar sin revivir accesos revocados. Se registra el tiempo de cada paso. El simulacro incluye completar la ficha de evaluación C.7, redactar el aviso a una empresa con la plantilla C.1.b y atender un pedido de derechos durante el incidente (C.5).
- **Después, una vez al año** y cada vez que cambie algo grande (proveedor, persona de guardia, arquitectura).
- Se revisa el procedimiento tras cada incidente real y tras cada ensayo.

## 10. Lo que debe estar listo antes de producción

| # | Qué | Responsable |
|---|---|---|
| 1 | Persona de guardia con nombre y suplente, con alertas que le llegan | CEO designa; DevOps configura |
| 2 | Acciones de contención probadas (Anexo A, pasos 1 a 6) | DevOps, Arquitecto |
| 3 | Registro de eventos de seguridad, copia externa de la auditoría y su verificación semanal funcionando | Arquitecto, DevOps |
| 4 | Plantilla de aviso preaprobada por el abogado | Cumplimiento, abogado |
| 5 | Respuestas legales L-01, L-02, L-04, L-08, L-16 (y L-03, L-07, L-14 de la prioridad A) | CEO y abogado |
| 6 | Contratos con proveedores técnicos con la obligación de avisar | CEO, abogado |
| 7 | Simulacro hecho y su informe | Seguridad, DevOps |
| 8 | Carpeta `docs/operaciones/incidentes/` y plantilla | Seguridad |
| 9 | Contacto autorizado confirmado en cada empresa (RF-PLA-011) y representante de cada empresa para avisos legales (C.8) | Plataforma, CEO |
| 10 | Abogado contratado con canal de urgencia (C.2) | CEO |

---

## Anexo A. Guía operativa de contención (para el equipo técnico)

Cada acción: **qué hace, quién la ejecuta, cómo se comprueba que funcionó**. Los pasos 1 a 6 deben estar probados antes de producción.

| # | Acción | Efecto | Quién | Se comprueba con |
|---|---|---|---|---|
| 1 | Revocar sesiones de una persona / de una empresa / de todas | Cierra todas las sesiones y enlaces vigentes; quien siga necesita un enlace nuevo | Función de la plataforma (Arquitecto); la ejecuta DevOps con aprobación del Gerente de TI | Una acción con una sesión vieja es rechazada |
| 2 | Suspender una clave de API o un webhook | La integración responde "no encontrado" | Administrador de la empresa o plataforma | Pedido con la clave rechazado en menos de 10 segundos (RNF-INT-002) |
| 3 | Suspender una membresía | Corta sus sesiones en esa empresa al instante (RF-ACC-016) | Administrador o plataforma | Intento de acción rechazado |
| 4 | Suspender una cuenta de plataforma | Se retira la llave física y el acceso desde la red restringida | Otra persona de plataforma y DevOps | Intento de entrada rechazado |
| 5 | Rotar claves de API, correo y base | Se acepta la nueva antes de retirar la vieja, sin cortar el servicio (plan de DevOps 6.1) | DevOps | Las claves viejas dejan de funcionar |
| 6 | Suspender una empresa | Nadie entra; datos conservados (RF-ACC-022) | Plataforma, con dos personas si es un rescate inverso | Ninguna membresía entra |
| 7 | Retirar una versión publicada | Plan de vuelta atrás escrito de esa versión | DevOps | Versión anterior activa |
| 8 | Rotar la llave maestra o las derivadas | Recifrado por lotes; solo si hay sospecha de que se vio la llave o la base junto con la llave | DevOps y Seguridad, con aprobación del Gerente de TI | Un campo cifrado abre con la versión nueva |

**Preservación de evidencia, en este orden:** (1) exportar la auditoría y los eventos de seguridad de la ventana del hecho; (2) verificar la copia externa de auditoría; (3) copiar los registros técnicos y el reporte de errores; (4) guardar la configuración y la versión publicada; (5) guardar el respaldo más cercano al hecho, marcado para que la rotación no lo borre.

**Si la causa es la cuenta de plataforma:** además, revisar el registro de plataforma y el registro de empresa de las sesiones de soporte de las últimas semanas; verificar con cada empresa afectada que autorizó cada sesión de soporte; y no emitir accesos de emergencia hasta cerrar el incidente.

**Si el correo falla durante el incidente:** el acceso de emergencia del Administrador de plataforma (PS-05) exige a una segunda persona de plataforma o al contacto autorizado confirmado, y un solo uso por empresa y semana (RF-PLA-009).

## Anexo B. Plantilla del registro del incidente

```
# Incidente AAAA-MM-DD-nn
Gravedad: G1 / G2 / G3 (con fecha de cambio si se reclasificó)
Declarado por: (rol, no nombre) · Hora de detección: · Hora de confirmación:
Líder del incidente: (rol) · Decide: (rol)

## Qué se vio (sin datos personales ni secretos)
## Línea de tiempo (hora · quién [rol] · qué)
## Contención (acciones, hora de cada una, hora en que se detuvo el daño)
## Alcance: empresas · tipos de datos · cuántas personas · quién pudo verlos
## Evidencia guardada y dónde (fuera del repositorio si es sensible)
## Avisos: CEO (hora, quién) · empresas (hora, texto) · personas / autoridad (decisión legal y fecha)
## Evaluación de datos personales y decisión de aviso: ver ficha del Anexo C.7
## Causa raíz
## Acciones correctivas (qué · responsable · fecha · prueba nueva)
## Riesgos actualizados (números de riesgos.md)
## Cierre: fecha · quién aprobó · informe a 10 días enlazado
```

## Anexo C. Cumplimiento: avisos, preguntas al abogado, alcance y derechos

Redactado por el Auditor de Cumplimiento. **Nada de este anexo es opinión legal**: son textos de partida y preguntas para que un abogado los confirme o corrija. Marcador: **[ESCALAR AL CEO: confirmar con abogado]** = depende de la ley, de a quién se avisa o del plazo.

### C.1 Plantillas de aviso (lenguaje claro, trato de "usted")

Se completan los corchetes y se omiten las frases que no apliquen. No se envían sin el visto bueno del Gerente de TI y, cuando exista, del abogado.

**C.1.a Aviso inicial al CEO** (lo envía la Jefatura de Proyecto)

> Asunto: Incidente de seguridad [G1/G2]: [una frase simple]
>
> Hora de detección: [..]. Hora de confirmación: [..].
>
> **Qué pasó:** [..]. **Empresas afectadas:** [una, varias o "estamos calculándolo"]. **Datos:** [tipos]. **Personas:** [número o "estamos calculándolo"].
>
> **Qué ya hicimos:** [contención]. **Qué falta:** [..]. **Qué sabemos y qué no:** [..].
>
> **Decisiones suyas pendientes:** (1) si se avisa a la empresa afectada ahora; (2) si se consulta al abogado hoy; (3) si se avisa a la autoridad y a las personas, que se decide con el abogado.
>
> Próximo informe: [fecha y hora].

**C.1.b Aviso a la empresa** (a sus administradores y al contacto autorizado)

> Asunto: [Empresa]: aviso importante sobre la seguridad de sus datos en la plataforma
>
> Estimado/a [cargo]:
>
> El [fecha] a las [hora] detectamos [una frase simple de qué pasó, por ejemplo: "que una persona sin autorización pudo ver una lista de equipos de su empresa"]. Ocurrió entre el [fecha de inicio] y el [fecha de fin].
>
> **Qué datos pudieron verse:** [tipos de datos: por ejemplo, nombres y correos de empleados, equipos asignados, precios de compra]. **A cuántas personas afecta:** [número o "estamos calculándolo"]. **Datos que no se vieron:** [por ejemplo, contraseñas (la plataforma no las usa)].
>
> **Qué hicimos:** [acciones: cerramos el acceso en la primera hora, cambiamos las claves, preservamos el registro de lo ocurrido].
>
> **Qué le recomendamos a usted:** [por ejemplo: avisar a las personas afectadas con el texto adjunto; revisar los accesos de sus administradores; estar atento a correos sospechosos].
>
> **Qué sabemos y qué todavía no:** [lo que falta confirmar y cuándo le informaremos].
>
> **Contacto:** [nombre y medio de contacto de la Jefatura de Proyecto]. Le enviaremos un informe completo en un plazo de [10 días].

**C.1.c Texto para que la empresa avise a sus empleados afectados** (la empresa lo envía; la plataforma lo prepara)

> Asunto: Aviso sobre sus datos en el sistema de equipos de TI de [Empresa]
>
> Le informamos que el [fecha] se detectó que [frase simple]. Pudieron verse estos datos suyos: [lista]. No se vieron: [lista].
>
> Ya se tomaron estas medidas: [medidas]. Usted puede: [recomendaciones sencillas, por ejemplo estar atento a correos que le pidan datos o claves y no abrir enlaces dudosos].
>
> Si tiene preguntas o quiere ejercer sus derechos sobre sus datos, escriba a [contacto de la empresa].

**C.1.d Aviso al proveedor técnico** (lo envía DevOps)

> Asunto: Posible incidente de seguridad en su servicio [servicio]
>
> Detectamos [frase simple] el [fecha y hora]. Solicitamos: confirmación de si el hecho viene de su lado, registros de acceso entre [inicio] y [fin], medidas que tomaron y un contacto técnico de guardia. Esperamos su respuesta antes de [hora]. Conforme al contrato (cláusula de aviso de incidente), le pedimos informarnos de cualquier otro hallazgo.

**C.1.e Borrador de partida para la autoridad.** **[ESCALAR AL CEO: confirmar con abogado]** El contenido, el formulario y el medio los fija la autoridad de cada país. Estructura de partida, que **no se envía** sin el abogado: quién notifica y su cargo; fecha y hora de detección y de confirmación; descripción del hecho; tipos de datos y número aproximado de personas y de registros; consecuencias posibles para las personas; medidas tomadas y propuestas; contacto. Se llena a partir de la ficha C.7.

**Reglas del texto:** no se nombran otras personas afectadas ni otras empresas; no se dan detalles técnicos que ayuden a repetir el ataque; no se culpa a nadie; no se prometen resultados ("nunca volverá a pasar"); no se minimiza ("solo un error menor") si hubo datos expuestos; no se adivina: lo que no se sabe se dice.

### C.2 Preguntas para el abogado (con opciones)

Cada pregunta trae las opciones que el equipo ve y, en la última columna, lo que el equipo hace mientras no haya respuesta. **La respuesta es del abogado.**

| ID | Pregunta | Opciones | Mientras no haya respuesta |
|---|---|---|---|
| L-01 | ¿Quién es responsable ante un incidente: la empresa, la plataforma o el proveedor de alojamiento? ¿Qué ley rige en cada país donde hay empresas? | (a) La empresa es responsable y la plataforma colabora como encargada; (b) la plataforma es responsable de los datos que guarda; (c) responsabilidad compartida según el dato; (d) depende del país | Se asume (c) para fines de preparación: el equipo avisa a la empresa y apoya, la empresa decide a las personas |
| L-02 | ¿Hay que registrar o declarar los bancos de datos de usuarios, de personas y de contactos de proveedores, y un incidente obliga a algo adicional ante esa autoridad? | (a) Sí, y quién lo registra; (b) no hace falta; (c) depende del país | Se asume (a) como riesgo: se pide la respuesta antes de cargar datos reales |
| L-04 | ¿Cuánto tiempo se conservan el registro del incidente, la evidencia y los eventos de seguridad? ¿Se puede borrar lo anterior a los plazos? | (a) 5 años el registro y la evidencia, 12 meses los eventos de seguridad; (b) más; (c) menos; (d) lo fija la ley de cada país | Se aplican los plazos de (a) y no se borra nada hasta la respuesta |
| L-08 | ¿Qué cláusulas deben tener los contratos con alojamiento, base de datos, correo y respaldos para obligarlos a avisarnos de un incidente, y en cuánto tiempo? | (a) Aviso en 24 horas; (b) 48 horas; (c) 72 horas; (d) el plazo que fije el abogado | Se pide (a) en la negociación |
| L-16 | Subpreguntas: (a) ¿Hay que avisar a la autoridad? ¿A cuál, si hay empresas en varios países? (b) ¿Hay que avisar a las personas, y quién lo hace? (c) ¿Desde cuándo corre el plazo: sospecha, confirmación o conocimiento? (d) ¿Los plazos de la empresa corren desde que la plataforma le avisa? (e) ¿Hay un umbral de riesgo bajo el cual no hace falta avisar? (f) ¿Qué contenido, formato y medio exige el aviso? (g) ¿Qué plazo tiene la plataforma, como encargada o proveedora, frente a la empresa? | (a) Siempre; (b) solo si hay riesgo para las personas; (c) depende del país | Se prepara el aviso a la empresa en 72 horas o menos, se consulta al abogado en cada G1 con resultado B o C, y el CEO decide con la información disponible |
| Contratación | ¿El abogado puede atender una consulta urgente (el mismo día) en un incidente? ¿Con qué canal y horario? | Sí / No / con costo adicional | **[ESCALAR AL CEO]** es dinero: incluirlo al contratar al abogado, antes de cargar datos reales |

Preguntas relacionadas que conviene responder en la misma consulta (están en la lista general de preguntas legales): L-07 (otro país y proveedores externos), L-03 (aviso de privacidad), L-06 (derechos y plazos), L-09 (qué es dato personal) y L-14 (conservación obligatoria de documentos de compra).

### C.3 Qué datos del §18.1 se asumen vistos, según el tipo de incidente

Guía para estimar el alcance en la primera hora. **Ante la duda, se asume el peor caso hasta probar lo contrario** (sección 5). "Todos" = todos los datos de la empresa o empresas afectadas.

| Tipo de incidente | Datos personales que se asumen vistos (filas del §18.1) | Datos que además hay que revisar |
|---|---|---|
| Una empresa ve datos de otra (falla de aislamiento) | Los que esa consulta devolvió: Personas, asignaciones, nombre en actas, IMEI y línea, contactos de proveedor, casos | Registro de eventos de seguridad (empresa del actor); cuántas veces y cuántos registros |
| Se usa una cuenta de administrador de empresa por otra persona | Todos los de esa empresa: usuarios, Personas, asignaciones, actas, contactos de proveedor, casos, registro de envíos | Si exportó (auditoría de exportaciones), si cambió roles o activó la casilla de excepciones |
| Fuga o robo de un respaldo | Todos los de las empresas del respaldo, incluidos los ya anonimizados dentro de ese respaldo (hasta 12 meses, D-032), y los cifrados si también se perdió la llave | Qué respaldo es y desde qué fecha; si las llaves estaban fuera del respaldo (D-048) |
| Una exportación llega a quien no debía | Las columnas del archivo (la hoja "Aviso" y la auditoría de exportaciones dicen cuáles) | A quién se envió; si hubo pedido de datos personales o precios |
| Clave de API o webhook filtrado | Lo que sus alcances permitían leer; las claves de Personas solo salen con el alcance de personas (D-063.4) | Registro de uso de la clave y accesos a Personas por API |
| Alteración de la auditoría o alerta de la copia externa | La auditoría no guarda nombres ni correos (D-030), pero sí identificadores internos, IP y textos de motivos | Si hubo acceso a la base; revisar los motivos con texto libre |
| Cuenta de plataforma o sesión de soporte sospechosa | Solo lo visto en sesiones de soporte autorizadas por cada empresa; el rol de plataforma no ve datos del negocio (RF-PLA-004) | Registro de plataforma y de empresa; confirmar con cada empresa que autorizó cada sesión |
| Fuga en el proveedor de correo | Direcciones de correo y asuntos/códigos de los avisos (el contenido mínimo, D-061.4) | Registro de envíos (correo completo 90 días, luego enmascarado) |
| Fuga del servicio de alojamiento o de base de datos | Todos | Lo que informe el proveedor (sección 6.3) |
| Solicitud de derechos mal entregada (copia a otra persona) | Los datos de la Persona solicitante y su historial | Registro de solicitudes de derechos; la descarga única y su vencimiento |
| Aviso o correo enviado a la persona o empresa equivocada | Lo que dice el aviso: tipo, código del activo o de la Persona y nombre de la empresa (contenido mínimo, RF-DAT-012) | Registro de envíos; si el correo llevaba un enlace de acceso (se revoca) |
| Pérdida de un dispositivo o llave de una persona con acceso | Lo que esa membresía podía ver según su rol | Sesiones y acciones desde la hora de la pérdida; revocar sesiones (Anexo A, 1) |

### C.4 A quién se avisa en cada empresa y qué hacer si no hay contacto confirmado

**Por defecto** el aviso a la empresa va a: (1) todos los **administradores activos** de la empresa, y (2) el **contacto autorizado confirmado** (RF-PLA-011). Los avisos van por el canal que fije el Gerente de TI y no por el sistema que pudo comprometerse (sección 2).

Si hay problema para avisar:

| Situación | Qué se hace |
|---|---|
| La empresa no tiene contacto autorizado confirmado (el primer administrador no lo confirmó) | Se avisa a todos los administradores activos. Además, la Jefatura de Proyecto llama o escribe a la persona que el Cliente (CEO) indique como representante de la empresa, **fuera de la plataforma**, y deja constancia de cómo |
| La empresa tiene un solo administrador y es quien está comprometido o no responde | No se confía en su correo de la plataforma. Se usa el contacto autorizado y, si no existe, el representante indicado por el CEO. No se emite acceso de emergencia hasta cerrar el incidente |
| El contacto autorizado y el administrador son la misma persona | Igual que arriba: se suma el representante indicado por el CEO |
| La empresa está suspendida | Se avisa igualmente por correo a los administradores y al contacto autorizado; la suspensión no suspende el aviso |
| Una persona que figura como contacto ya se fue de la empresa | Se avisa a la persona que la sustituyó o al representante; después se corrige el contacto (RF-PLA-011: cambio con espera de 24 horas) |
| Nadie responde en 72 horas | Se insiste por otro medio y se deja constancia; el plazo de la empresa no detiene el del equipo hacia el CEO |

El insumo que debe entregar el CEO (un representante por empresa fuera de la plataforma) está en C.8.

### C.5 Pedidos de derechos de datos durante un incidente

1. **Se registran igual** (PS-29, registro de solicitudes de derechos): la fecha de recepción corre desde que llega. **Los plazos legales no se suspenden** por el incidente mientras el abogado no diga otra cosa (L-06).
2. **Se congela la anonimización y la purga** de los datos de las empresas y de las personas afectadas mientras dure la preservación de evidencia (sección 4). Es **propuesta** de este anexo; el Gerente de TI la confirma, y si un abogado indica que un pedido de eliminación debe cumplirse de inmediato, prevalece lo legal y se deja copia mínima necesaria de la evidencia.
3. **Si la persona que pide es una afectada por el incidente:** se le da prioridad, se le informa que hay un incidente en curso y que recibirá el aviso formal, sin detalles técnicos ni datos de otras personas. La respuesta de acceso a sus datos incluye lo que se sabe de qué se vio, solo cuando el abogado lo apruebe.
4. **La copia de datos se entrega** por la descarga única con vencimiento, nunca por correo (D-061.2). Durante un incidente en que el correo o la cuenta pudieran estar comprometidos, la entrega se hace solo después de verificar la identidad por otro medio.
5. **El pedido sigue invisible** en búsquedas, listas, reportes, exportaciones, tableros, avisos y API (RF-PER-012); el equipo de respuesta no lo lee, solo ve que existe y su plazo. Quien presenta el pedido no lo atiende (RN-PRS-033).
6. **Si la persona que pide es el único administrador** y el incidente afecta a su empresa, se aplica el suplente designado (D-071) y no el equipo de respuesta.
7. Todo queda en el registro del incidente como una referencia (`PRS-0042`, tipo de pedido, fecha), sin el contenido.

### C.6 Criterios para valorar el riesgo para las personas (insumo del abogado)

Ordenan la urgencia. **No sustituyen** la decisión del abogado (L-16).

| Factor | Preocupa menos | Preocupa más |
|---|---|---|
| Tipo de dato | Solo códigos internos sin nombre | Nombre con correo y equipo asignado; IMEI y línea; textos libres con datos personales |
| Cantidad | Pocas personas | Muchas personas o una empresa entera |
| Protección | Cifrado o enmascarado, y la llave no se perdió | Legible; o cifrado con la llave expuesta |
| Quién lo vio | Un usuario de la misma empresa con otro permiso | Un tercero desconocido, otra empresa o un atacante externo |
| Señal de uso | Ninguna en el registro | Descarga, exportación o copia; uso de una clave |
| Duración | Minutos, cerrado | Días o sin saber desde cuándo |
| Se puede aprovechar | No sirve para suplantar | Códigos, enlaces de acceso o claves que permiten entrar o suplantar |
| Recuperación | Se recuperó o destruyó la copia | No se sabe dónde quedó |

Regla: si no se puede responder un factor, se toma la columna de "preocupa más".

### C.7 Registro y evidencia de cumplimiento

Todo va en el archivo del incidente (Anexo B), sección "Avisos", **sin datos personales ni secretos** (referencias como `PRS-0042`, "empresa B"). La evidencia sensible se guarda fuera del repositorio (sección 8). Se conserva 5 años (propuesta; **[ESCALAR AL CEO: confirmar con abogado]**, L-04).

**Qué guarda Cumplimiento:**
1. La ficha de evaluación (abajo), con fecha y hora de cada versión.
2. El paquete entregado al abogado (qué se envió, cuándo, por quién) y su respuesta escrita.
3. Cada decisión de avisar o no avisar: quién decidió, cuándo y por qué.
4. El texto exacto enviado y la prueba de envío (hora, medio, destinatario como rol, acuse si lo hubo).
5. El reloj de plazos: horas de sospecha, confirmación y conocimiento, y la hora límite de cada aviso.
6. Los pedidos de derechos recibidos durante el incidente (solo referencia, tipo y fecha).

**Ficha de evaluación y decisión de aviso:**

```
Incidente: AAAA-MM-DD-nn · Versión de la ficha: n · Fecha y hora:
Hora de sospecha: · de confirmación: · de conocimiento de la empresa:
Resultado 6.0: A / B / C (con la razón)
Datos de personas: tipos · número de personas por empresa · países de las empresas
Factores C.6 (anotar la columna elegida de cada uno):
Paquete al abogado: enviado (fecha, por quién) · respuesta (fecha, resumen, enlace a la prueba)
Decisiones: empresa (sí/no, fecha, quién) · personas (sí/no, quién avisa) · autoridad (sí/no, cuál) · denuncia (sí/no)
Quién decidió y por qué (CEO y abogado en autoridad y denuncia):
Avisos enviados: a quién (rol) · hora · medio · texto adjunto (referencia)
Plazos: límite de cada aviso y hora real de cumplimiento
```

### C.8 Lo que debe entregar el CEO para este procedimiento

1. **[ESCALAR AL CEO]** El nombre y el medio de contacto de un **representante de cada empresa fuera de la plataforma** (para cuando falle el correo, C.4).
2. **[ESCALAR AL CEO]** Contratar al abogado, con canal de urgencia (dinero), y obtener las respuestas legales de prioridad A (L-01, L-02, L-03, L-04, L-07, L-08, L-14 y L-16).
3. **[ESCALAR AL CEO]** Nombrar a la persona de guardia y su suplente (sección 2).
4. **[ESCALAR AL CEO: confirmar con abogado]** Quién firma o presenta, a nombre de la empresa, un aviso ante la autoridad.

## Historial de cambios

| Fecha | Cambio | Quién |
|---|---|---|
| 2026-10-25 | Borrador 0.1 sobre D-059 | Especialista en Seguridad |
| 2026-10-25 | Borrador 0.2: sección 6 completada (6.4 quién redacta, aprueba y envía; 6.5 marcas legales; L-02 aclarada: la pregunta de "quién es responsable" es L-01); anexo C completo (plantillas, preguntas al abogado, alcance por tipo de incidente, destinatarios por defecto, derechos durante un incidente); fila 9 en la lista previa a producción; el simulacro incluye aviso y derechos. No se cambió ningún plazo de D-059 | Auditor de Cumplimiento |
| 2026-10-26 | Borrador 0.3: sección 6 con evaluación de datos personales (6.0), criterios para decidir avisar, tabla de quién decide y quién valida con el abogado (6.4); anexo C con plantillas al CEO, a la autoridad y al proveedor (C.1), subpreguntas de L-16 y condición de contratación (C.2), dos filas nuevas en C.3, criterios de riesgo para las personas (C.6), registro y ficha de cumplimiento (C.7) y lo que debe entregar el CEO (C.8); línea nueva en el anexo B; fila 10 en la sección 10; marcador legal unificado. No se cambió ningún plazo de D-059 | Auditor de Cumplimiento |

# Puerta de salida de la Etapa 0: estado real

**Autor:** Gerente de TI · **Fecha:** 2026-10-29 (actualiza la edición del 2026-10-26, que sigue abajo como detalle de cada condición)
**Base:** las 13 condiciones de D-064; `docs/revision-cruzada/ronda4-*.md` y `ronda5-seguridad-adr.md`; `docs/arquitectura/revision-datos.md`; las decisiones D-065 a D-101 de `docs/equipo/decisiones.md`; `docs/calidad/criterios-por-etapa.md`.
**Regla:** no se escribe código de funcionalidades hasta que se cumplan las 13 condiciones. La opinión legal **no** es parte de la puerta (se exige antes de cargar datos reales).
**Cómo se midió:** cada estado tiene una prueba que se puede abrir o dice qué falta. Estados: **cumplida / parcial / pendiente / depende del CEO**.

## 0. Estado de hoy (2026-10-29)

**Aún no hay código y no se autoriza.** Las 13 condiciones siguen **0 cumplidas del todo**; el estado detallado de la edición anterior (secciones 1 a 6) sigue vigente salvo lo que cambia aquí.

| Qué | Estado hoy | Prueba | Qué falta por condición |
|---|---|---|---|
| **Criterios de aceptación** (condición 12) | **603 criterios**: 145 del núcleo y 458 de 19 módulos (eran 451 el 2026-10-26). Se ejecutan por etapa: 1 en la Etapa 0, 54 empiezan en la Etapa 1, 58 en la 2 | `docs/calidad/criterios-por-etapa.md` (resumen, checkpoint 627d5ac) | QA debe sumar las pruebas nuevas de los ADR y recalcular la matriz con **55 sensibles** (PS-247, D-094); sigue faltando el entorno de pruebas de DevOps |
| **Decisiones técnicas T-1 a T-14** (condición 4) | **ADR 01 a 20 redactados y revisados** por Seguridad (30 hallazgos: 4 altos, 21 medios, 5 bajos, 0 críticos; ningún ADR rechazado) y por Datos (8 bloqueantes, ninguno rechazado). Se sumaron ADR-21 (Microsoft), 22 (asistente) y 23 (acciones de plataforma y congelación). El Arquitecto incorporó ambas revisiones | `docs/arquitectura/README.md`; `ronda5-seguridad-adr.md`; `revision-datos.md` | Todos siguen **«Propuesto»**. Las 15 propuestas pendientes quedaron **ratificadas** en D-087 a D-101. Para pasar a «Aceptado»: (1) **Seguridad** confirma la variante de D-091 (valor del correo en el trabajador, hallazgo Alto), la precisión de D-088 y que sus condiciones quedaron escritas (A2-01, A2-02); (2) **Datos** confirma lo mismo (A2-03); (3) **Cumplimiento** confirma D-092 y la lectura de D-022 en D-098 (A2-18); (4) **Seguridad y QA** revisan los controles de ADR-22 antes de aceptar ese ADR |
| **Prototipo técnico** (condición 4) | Alcance ampliado a **4 días y 1 de reserva** (D-099); criterios de éxito y fracaso escritos | `docs/arquitectura/prototipo-tecnico.md` | Sin candidato nombrado por DevOps no puede empezar (A2-05); el informe `prototipo-resultados.md` aún no existe |
| **Módulos ASI y MSF** (ola G) | **v0.2**, ya ajustados a D-081 a D-086 (el CEO los pidió el 2026-10-29; los Analistas los entregaron como v0.1). Alcance aceptado; **visto bueno técnico del texto en revisión**: Seguridad, Cumplimiento, QA, Auditor Técnico, Diseñador. ADR-21 y ADR-22 ratificados como diseño (D-100, D-101) | `docs/modulos/asistente-ia.md`, `docs/modulos/microsoft-entra-intune.md` | Ajustes del Analista (A2-12, A2-13). **No frenan la puerta ni la v1**: se construyen después de la Etapa 7 (D-081) |
| **Documento funcional** (condición 1) | Sigue en v0.3; **no pasa a v1.0** hasta aplicar el Plan de aplicación 2 (RF-AUD-013, RF-AUD-016, RF-ACC, RF-PLA-001, RF-PLA-005, PS-247) | `docs/equipo/plan-aplicacion.md`, «Plan de aplicación 2» | A2-06 a A2-10; luego Auditor Técnico y QA verifican y yo apruebo (AN-16) |
| **Entornos y costos** (condiciones 5, 6, 10, 11) | Sin cambio: plan de DevOps v3 sin precios verificados; ramas protegidas y ensayos pendientes | ver secciones 2 y 6 | DevOps: A2-05 y A2-17. **Dinero nuevo posible:** tercer servicio para la consola (D-089), ya en `hoja-ceo.md` |

**Mi visto bueno técnico (2026-10-29):** sigue **condicionado**. Doy visto bueno a las 15 decisiones D-087 a D-101 como decisiones técnicas, con las condiciones escritas en cada una. **No autorizo código.** Sin cambios sobre lo que sigue autorizado: prototipo técnico en planes gratuitos con datos inventados, revisión automática, ramas protegidas y ediciones de documentos.

## Pendiente del CEO (hoy; detalle en `docs/equipo/hoja-ceo.md`)

Solo dinero, legal, irreversible o lo que solo él tiene: (1) **aprobar el arranque de costo mínimo** y el servicio de correo (más el posible costo del tercer servicio de la consola), cuando DevOps traiga precios con fecha y enlace; (2) **contratar al abogado** (25 preguntas; 8 antes de datos reales); (3) **documentos reales** (orden de compra, orden de servicio, Excel) con nombres reemplazados: condición 8, sigue sin llegar (riesgo #6); (4) **cuentas a nombre de la empresa, persona con suplente, dos administradores de plataforma, dos custodios de llaves** y un representante por empresa; (5) país, impuestos y cifra de uso; (6) la demo del prototipo de pantallas. **Para después de la v1:** topes y proveedor del asistente, licencias de Microsoft. No hay nada nuevo de producto ni de ingeniería para el CEO.

---

## 1. Resumen (edición del 2026-10-26, detalle vigente)

De las 13 condiciones: **0 cumplidas del todo**, **7 parciales** (1, 2, 3, 7, 10, 12, 13), **4 pendientes** (4, 5, 6, 11) y **2 que dependen del CEO** (8, 9). Desde ayer avanzaron mucho la 13 (el procedimiento de incidente existe y tiene mi visto bueno como borrador), la 7 (prototipo publicado), la 10 (revisión automática de documentos escrita, estrategia de llaves aprobada) y la 2 (17 módulos en v0.3). **Nada de lo pendiente es un defecto de diseño**: son verificaciones, pruebas, la ejecución de ensayos y decisiones de contratación.

## 2. Estado de cada condición

| # | Condición | Estado | Prueba y lo que falta exactamente | Quién |
|---|---|---|---|---|
| 1 | Documento funcional v1.0 con D-035 a D-064, registro PS-nn y matriz aprobados | **Parcial** | **Prueba:** `documento-funcional.md` sigue en **v0.3** (cabecera: filas AN-01 a AN-15 incorporadas, más O-1 y O-3 de Cumplimiento y la partición de CA-040 en 040a y 040b). `registro-permisos.md` v1.1: PS-232, PS-233 y PS-234 existen (Grep) y marca 52 sensibles. **Falta:** que el Auditor Técnico y QA verifiquen las ediciones, pasar a **v1.0** (AN-16) y mi aprobación. Hoy el Analista sigue editando (D-077, D-079) | Analista; verifican Auditor Técnico y QA; aprueba Gerente de TI |
| 2 | 17 módulos corregidos, sin choques con el núcleo; Auditor Técnico "conforme" | **Parcial** | **Prueba:** Grep de la versión: **17 de 17 módulos en v0.3**. En ronda 3 el Auditor Técnico dio 13 conformes y 4 con observaciones (ENT, GAR, DOM, LIN), 0 no conformes. **Falta:** (a) que el Auditor Técnico vuelva a correr sus guiones y firme (no hay ronda 4 suya); (b) correcciones de D-077: `integraciones-api.md` y `presupuesto-costos.md` (motivos); (c) D-079: `garantias-mantenimiento.md` S-GAR-12 a "Aceptado" | Escuadrones A y F; verifica Auditor Técnico |
| 3 | Sin Críticos ni Altos abiertos del núcleo; cuatro vistos buenos escritos | **Parcial** | **Prueba:** Cumplimiento (ronda 4): **conforme con observaciones**, 0 críticos, 0 altos, 0 medios; Seguridad (ronda 4): **conforme**, 0 altos, estrategia de llaves aprobada con 8 condiciones. **Falta:** (a) que Cumplimiento firme la condición: pide que Seguridad confirme por escrito que leyó la sección 6, el anexo C y la línea del anexo B del procedimiento v0.3 (**pendiente**; mi visto bueno ya está en D-080); (b) **QA y Auditor Técnico no tienen ronda 4** y QA mantiene el Alto H-QA-24 (plan de DevOps, no del núcleo) | Seguridad, QA, Auditor Técnico, Cumplimiento |
| 4 | Prototipo técnico de 3 a 4 días aprobado sobre el proveedor candidato | **Pendiente** | **Prueba:** no hay informe ni código. El Arquitecto escribió los 20 ADR y `docs/arquitectura/prototipo-tecnico.md` (alcance y criterios; verificado al final con `ls`; sus propuestas pasan a "Aceptado" cuando yo firme cada una, aún no lo hice). Ese documento cita `prototipo-resultados.md`, que todavía no existe porque es el informe del prototipo. El plan de DevOps describe el "día 0" (sección 10) pero **no nombra todavía un candidato**. Sigue autorizado en planes gratuitos con datos inventados. **Falta:** candidato nombrado, ejecución con los criterios de D-055 más la lectura de soporte (D-039.10), informe, y revisión de Seguridad (con el código corto de 8 caracteres, RS-51) y QA | DevOps (candidato); Arquitecto e Ingeniero de Datos; Seguridad y QA revisan |
| 5 | Base de datos y alojamiento elegidos con precios verificados y aprobados por el CEO | **Pendiente** | **Prueba:** `plan-entornos-y-costos.md` está en **v3** (2026-10-26) con ejecución continua y cinco roles de base, pero su propia sección 13 dice "**Pendiente: no verifiqué precios**". **Falta:** ficha de costos con fecha y enlace; después, el CEO aprueba el dinero. Posible gasto adicional: plan de pago de GitHub si las ramas protegidas lo exigen (sección 3.8, paso 0) | DevOps; decide CEO |
| 6 | Proveedor de correo elegido tras la matriz de entrega y costo aprobado | **Pendiente** | **Prueba:** plan escrito (sección 7.3, "falta ejecutar"). **Falta:** la matriz de 20 envíos por tipo de buzón y SPF, DKIM y DMARC en "pass"; luego el CEO aprueba el costo | DevOps; decide CEO |
| 7 | Prototipo de las 26 pantallas A aprobado por el CEO, con prueba de 5 personas | **Parcial** | **Prueba:** publicado en el repositorio: `docs/prototipo/index.html`, `LEEME.md` (10 cosas a mirar), `assets/` y 10 capturas en `capturas/`. Yo revisé el LEEME y la lista de archivos; **no conté las 26 pantallas**: el Diseñador debe confirmar la cifra. **Falta:** (a) prueba de tareas con 5 personas no técnicas, con informe; (b) cerrar por escrito los nombres de grupos, pestañas y colores (P-014); (c) el caso de la lectura de soporte (condición 2 de Seguridad); (d) la demo y aprobación del CEO | Diseñador (a, b, c); Jefatura de Proyecto organiza la demo; CEO aprueba |
| 8 | Documentos reales recibidos (OC, OS, Excel) y Excel analizado | **Depende del CEO** | **Prueba:** no hay ninguno en el repositorio (P-002 abierto). Sin ellos se trabaja con datos de ejemplo declarados, y la Etapa 0 no se cierra del todo | CEO entrega; Ingeniero de Datos analiza |
| 9 | Cuentas a nombre de la empresa, dos personas con 2FA, persona con suplente para alertas | **Depende del CEO** | **Prueba:** ninguna cuenta registrada (P-015). Se suman: dos personas del equipo que administren la plataforma (D-073.1) y, por Seguridad (condición 3), **dos custodios de las llaves** que no sean las dos únicas administradoras | CEO designa; DevOps configura |
| 10 | Llaves aprobadas por Seguridad; `.env.example`; ramas protegidas; revisión automática | **Parcial** | **Hechos verificados:** (a) Seguridad **aprobó la estrategia de llaves** el 2026-10-25 (ronda 4, sección 2; 8 condiciones); (b) `.gitignore` y `.env.example` en el repositorio; (c) `.github/` existe con `CODEOWNERS`, plantilla de propuesta de cambio, `workflows/documentos.yml` y `scripts/revisar_documentos.py` (**en curso**). Corrí el script hoy: `citas`, `permisos` y `secretos` pasan; **`referencias` falla con 2 errores** (el plan cita `.github/workflows/nocturna.yml`, que aún no existe; `prototipo-tecnico.md` cita el informe futuro `prototipo-resultados.md`: DevOps y el Arquitecto deben marcarlos como "futuro" o crearlos). **Falta:** (i) **ramas protegidas**: el repositorio solo tiene la rama de trabajo, **no existe `main`** (por eso la API de GitHub contesta "Branch not found"); hay que crearla, activar la regla y probar que la revisión "Documentos en regla" la bloquea; (ii) que la revisión corra en GitHub y pase; (iii) condiciones 1 y 2 de las llaves antes de la Etapa 1 (derivación escrita en ADR-07, que Seguridad debe confirmar; llave maestra fuera de integración continua) | DevOps (i, ii); Arquitecto y Seguridad (iii) |
| 11 | Ensayo de vuelta atrás y de restauración con cronómetro | **Pendiente** | **Prueba:** el plan describe el ensayo (secciones 4.3 y 5.2, "falta ejecutar"). No hay infraestructura. Debe incluir RS-49. **Falta:** ejecutarlo y guardar el registro | DevOps, Ingeniero de Datos |
| 12 | Plan de pruebas por etapa, datos de dos empresas, reloj fijable y correo de captura | **Parcial** | **Hechos:** `docs/calidad/criterios-por-etapa.md`, `docs/calidad/plan-de-pruebas.md` y `docs/trazabilidad.md` existen. `docs/calidad/herramientas/` (`etapas.py`, `juicios.py`, `lectura.py`) **en curso** (cambios sin guardar). **Falta:** que QA cierre su ronda 4 con la matriz recalculada (52 sensibles, PS-232 a PS-234, CA-040a/b); el **entorno** (reloj fijable, correo de captura, generador de datos de dos empresas, 60 conexiones, inyección de fallos, entornos efímeros) que el plan de DevOps solo describe | QA, DevOps |
| 13 | Tabla de datos personales y retención completa; procedimiento de incidente en borrador | **Parcial** | **Hechos:** `docs/operaciones/procedimiento-incidente-datos.md` **existe en v0.3** (lo leí completo; mi visto bueno como **borrador** está en D-080). §18.1 tiene 22 filas (R-04 cerrado) y el Analista ya aplicó O-1 y O-3 (Cumplimiento los comprobará con Grep en la v1.0). **Falta:** (a) Seguridad confirma la lectura de la v0.3 (misma condición que la 3); (b) Cumplimiento verifica O-1 y O-3 y que O-2 quede cerrada en `presupuesto-costos.md` (D-077). El simulacro, el abogado y la persona de guardia son de la Etapa 7 (H-CUM-18), no de la puerta | Seguridad; Cumplimiento; Escuadrón F |

## 3. Condiciones propias de cada revisor

| Revisor | Condición | Estado |
|---|---|---|
| Seguridad (llaves, ronda 4) | 1. Derivación escrita (ADR T-5) y 2. llave maestra fuera de integración continua | Antes de la Etapa 1: ADR-07 existe como propuesta; **falta confirmación de Seguridad**; la 2 es de DevOps |
| | 3 a 5 y 7 (custodios, respaldo de llaves, ensayo de pérdida, rotación anual) | Antes de datos reales |
| | 6 (llave en memoria) y 8 (prueba de secretos en la base) | Etapa 7 y Etapa 2 |
| | Prototipo técnico (condición 2 de su ronda 3: caso de lectura de soporte) | Pendiente (condiciones 4 y 7 de la puerta) |
| Cumplimiento (ronda 4) | Firma de la condición 3 de D-064 | Faltan: Seguridad confirma la lectura del procedimiento v0.3; mi visto bueno **ya dado** (D-080) |
| | O-1, O-3 (Analista), O-2 (presupuesto-costos, Escuadrón F; el informe dice "Escuadrón C" pero el módulo es del F), O-4 (este archivo) | O-4 **corregida aquí**; O-1 y O-3 aplicadas por el Analista (verifica Cumplimiento); O-2 en el núcleo hecha, falta el módulo (D-077) |
| | Etapa 7: respuestas legales de prioridad A, contratos, restauración probada, procedimiento aprobado, ensayado y validado por abogado, guardia y representante por empresa | Sin cambio |
| QA | H-QA-24 (plan de DevOps) | **Abierta**; DevOps entregó la v3, QA debe revisarla |
| Auditor Técnico | Nueva corrida de guiones y firma | Pendiente |

## 4. Mi visto bueno técnico

**Condicionado, igual que ayer, con avances.** Doy visto bueno técnico al **diseño** (núcleo v0.3, registro v1.1, D-001 a D-080) y, desde hoy, al **borrador v0.3 del procedimiento de incidente** (D-080). **No autorizo todavía** código de funcionalidades. Se vuelve definitivo cuando:
1. el Auditor Técnico, QA, Seguridad y Cumplimiento firmen por escrito la ronda 4 y el documento pase a v1.0 (condiciones 1, 2, 3 y 13);
2. el prototipo técnico (4) se apruebe y haya precios verificados (5 y 6);
3. el prototipo de pantallas pase la prueba con 5 personas y la demo (7), y el CEO entregue lo que le toca (8 y 9);
4. se cumplan 10, 11 y 12 con evidencia: rama `main`, regla de protección y revisión automática pasando; ensayos hechos; entorno de pruebas.

**Siguen autorizados sin esperar:** el prototipo técnico en planes gratuitos con datos inventados, la revisión automática y las ramas protegidas (salvo el posible costo del plan de GitHub, que va al CEO), las ediciones del Analista y de los escuadrones, y la prueba de 5 personas del prototipo.

## 5. Lo que falta del CEO (solo dinero, legal, irreversible o lo que solo él tiene)

| Qué | Para qué condición | Cuándo |
|---|---|---|
| **Aprobar el arranque de costo mínimo** (planes gratuitos o muy baratos) y el **servicio de correo**; posible plan de pago de GitHub | 5 y 6 | Cuando DevOps traiga precios con fecha y enlace |
| **Contratar al abogado**, que pueda atender una consulta urgente el mismo día, y conseguir las ocho respuestas de prioridad A | Datos reales (Etapa 7), no la puerta | Antes de cargar datos reales |
| **Documentos reales** (orden de compra, orden de servicio, Excel) con los nombres reemplazados | 8 | Para cerrar la Etapa 0 |
| **Cuentas a nombre de la empresa**, el dominio que ya tenga, **una persona con suplente** para las alertas (guardia) y **dos personas** para administrar la plataforma | 9 | Antes de la Etapa 1 con datos reales |
| **Dos custodios de las llaves** (distintos de las dos personas administradoras a la vez) | 9, llaves | Antes de datos reales. **Aún no está en `hoja-ceo.md`**; la Jefatura decide si se agrega |
| **Un representante por empresa fuera de la plataforma**, para avisarle si falla el correo | Procedimiento de incidente (C.8) | Antes de datos reales. Ya en `hoja-ceo.md` |
| **País** de cada empresa, si los precios incluyen impuestos y una **cifra aproximada** de uso | Etapa 1 y dimensionamiento | Cuando pueda |
| **Demo del prototipo de pantallas** (la aprobación sigue siendo del CEO por `CLAUDE.md`) | 7 | Cuando pase la prueba de 5 personas |

## 6. Pendiente de verificar (declarado)

- **Archivos en curso hoy:** `.github/` (DevOps), `docs/arquitectura/` (Arquitecto: 20 ADR y alcance del prototipo ya escritos, sin firma mía) y `docs/calidad/` (QA: herramientas con cambios sin guardar). Verifiqué su contenido al final de esta edición (listado de carpetas y script de revisión); su estado puede haber cambiado después.
- **Prototipo de pantallas:** publicado, pero no conté las 26 pantallas ni lo probé con personas.
- **Cifras de costo de DevOps:** siguen sin verificar (50 a 150 dólares al mes es solo orden de magnitud).
- **Ediciones del Analista (v1.0):** el Analista seguía editando mientras escribí esto; las cifras de este documento (52 sensibles, PS-232 a PS-234) las comprobé en `registro-permisos.md`.

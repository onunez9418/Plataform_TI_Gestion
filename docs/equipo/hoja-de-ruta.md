# Hoja de ruta hasta el 100 %

**Autor:** Gerente de TI · **Fecha:** 2026-10-29 · **Base:** D-117 (decisión del CEO: no se ofrece nada hasta tener la plataforma al 100 %), D-056 y D-081 (orden de módulos), D-064 (puerta de la Etapa 0), D-103 (ola G), D-115 y D-116 (entornos y empresa de demostración), `docs/documento-funcional.md` y los 19 módulos de `docs/modulos/`.
**Para quién:** la Jefatura de Proyecto y, resumida, el CEO. La sección 8 está escrita para él.

> **Enmienda (D-118 y D-119, 2026-10-29).** El CEO decidió «saltemos lo del abogado y terminemos la plataforma». (1) **El abogado y las respuestas legales no se gestionan ahora**: no bloquean construir; sí bloquean cargar datos reales, ofrecer a clientes y activar el texto libre del asistente, el borrado y la anonimización de personas y el envío de datos reales a proveedores externos (todo nace apagado y probado apagado). (2) **El ítem 4 del «100 %» (listo para datos reales) queda diferido**: hay dos hitos, **«Plataforma completa»** (la firma el CEO, datos de ejemplo) y **«Lista para datos reales»** (abogado, contratos, condiciones de D-117.6d). (3) **Tramo 0 y tramo 1 se solapan** por D-119: se puede programar con la «puerta mínima» (`puerta-etapa-0.md`); la **Versión local 0.1** (corte vertical que el CEO prueba hoy en su computadora) y el prototipo técnico de ADR son lo primero. Detalle en `plan-etapa-1.md`.
**Reglas de lectura.** (1) **Sin fechas ni duraciones:** solo orden, dependencias y tamaño relativo. (2) **«Tramo»** es un paso de construcción que termina con una demo interna que el CEO aprueba; no se confunde con las «olas A a G» de D-056, que son grupos de módulos de las Fases 2 y 3 y aquí se mantienen con ese nombre. (3) **Tamaño (S, M, L, XL):** es mi **juicio** a partir de dos hechos medidos con Grep el 2026-10-29 (cuántas filas de requisitos cita cada etapa o módulo; una fila que nombra varias etapas cuenta en cada una, así que es aproximado) y de cuánto riesgo nuevo trae. **S** = menos de 20 requisitos y sin riesgo nuevo; **M** = de 20 a 60, o pocos pero con un punto delicado; **L** = más de 60, o varios puntos delicados; **XL** = más de 100, o riesgo alto sostenido. No es una promesa de duración: el tamaño real se mide al cerrar la Etapa 1 y se corrige aquí.

## 1. En pocas palabras (para el CEO)

- Se construye **en orden**, un tramo tras otro. **Cada tramo termina con una demo interna que usted prueba y aprueba** antes de empezar el siguiente. Nadie de fuera ve nada hasta el 100 %.
- Son **8 tramos de la versión 1** (Etapas 0 a 7), luego **la Fase 2** (3 olas), **la Fase 3** (3 olas más la ola G de los dos módulos nuevos) y un **tramo de cierre** con la empresa de demostración completa, las revisiones finales y la documentación.
- Lo más largo no es programar: es **lo que solo usted y el abogado pueden entregar** (documentos reales, cuentas, dinero, respuestas legales). Conviene empezarlo **ya**, mientras se construye.
- El **camino crítico** (lo que más puede retrasar todo) es: la puerta de la Etapa 0 (que depende de sus documentos y cuentas), las Etapas 1 a 7 una tras otra y, después, la cadena del asistente de IA (sección 6).
- **No se debilita nada de seguridad ni de calidad para llegar antes.** Lo que se puede adelantar sin riesgo está en la sección 7; lo que no, también.

## 2. Qué significa «100 %» (resumen; el texto completo, para su aprobación, está en D-117.6)

1. **Todo construido** según el documento funcional: v1, Fase 2, Fase 3 y ola G (asistente de IA, Microsoft Entra ID e Intune), incluida **la API** y **la empresa de demostración completa**.
2. **Todo probado y revisado:** pruebas automáticas, restauración y vuelta atrás ensayadas, sin fallos graves abiertos; QA, Seguridad y los dos auditores conformes por escrito.
3. **Toda la documentación al día,** incluido el plan para deshacer (vuelta atrás).
4. **Listo para datos reales — DIFERIDO por su decisión (D-118):** respuestas del abogado a las preguntas de prioridad A, aviso de privacidad, contratos con proveedores firmados, procedimiento de incidente ensayado. Es un hito aparte, «Lista para datos reales»; la plataforma puede estar **«completa»** sin estarlo.
5. **Usted aprueba el hito.** Pasar a datos reales lo decide usted.

**Sin incluir** (salvo que usted lo pida): instalaciones en la base o los servidores de un cliente y SQL Server (ADR-25), acciones remotas sobre equipos, archivos adjuntos y lo que el documento funcional marca como «no incluye».

## 3. Orden de construcción

Tamaños según la sección «Reglas de lectura». «Demo interna» = lo que usted prueba con datos de ejemplo.

| # | Tramo | Qué se construye | Depende de | Tamaño y razón | Demo interna que aprueba el CEO |
|---|---|---|---|---|---|
| 0 | **Etapa 0: puerta** | Cerrar las 13 condiciones de D-064: documento v1.0, prototipo técnico, precios y cuentas, ensayos, pruebas | Sus documentos reales y cuentas (cond. 8 y 9); precios verificados (5 y 6) | **L**: son documentos, pruebas y trámites, no código; lo lento es lo externo | Las 26 pantallas del prototipo y el informe del prototipo técnico (una empresa no ve a otra). **Usted aprueba el prototipo y autoriza programar** |
| 1 | **Etapa 1: cimientos** | Ingreso por enlace al correo, empresas, usuarios, roles y permisos, auditoría, seguridad y secretos, cola de trabajos y avisos de base, consola de plataforma, lo mínimo de la empresa de demostración (tipo, límites, vigencia, bloqueo, franja) | Tramo 0 cerrado | **XL**: unas 87 filas de requisitos, y es donde se juega el aislamiento entre empresas y todo lo que luego se apoya | Entrar con enlace; crear dos empresas de ejemplo; invitar, crear un rol y probarlo; ver que una empresa no ve a la otra; ver la auditoría; consola de plataforma; una «demostración» que vence y se bloquea |
| 2 | **Etapa 2: catálogos** | Catálogos, ubicaciones, proveedores (PRV-A), centros de costo, áreas, Personas, categorías, campos personalizados (con secretos e identificadores), solicitudes de derechos de datos | Tramo 1 | **L**: unas 58 filas y varias preparaciones delicadas (datos personales aparte, campos configurables) | Crear una categoría con campos propios, una persona y una ubicación; un campo secreto que no se ve |
| 3 | **Etapa 3: SKU** | Maestro de artículos con código automático por categoría y posibilidad de sobrescribirlo; control por serie o por cantidad | Tramo 2 | **S**: unas 15 filas; el punto delicado (que el código nunca se repita) ya viene resuelto en la Etapa 1 (contadores) | Crear SKU, ver el código automático y sobrescribirlo, probar serie y cantidad |
| 4 | **Etapa 4: inventario** | Inventario, estados, asignación, actas, garantía, costo corregible, cifrado de claves, **importación del Excel** (todo o nada), prueba de carga nocturna | Tramo 3; **su Excel real analizado** (cond. 8) | **XL**: unas 62 filas pero con riesgo alto: importación, volumen (100.000 activos) y datos sensibles | Cargar equipos a mano y con un Excel de ejemplo con vista previa; asignar, acta, devolución, traspaso, extravío; garantía |
| 5 | **Etapa 5: compras** | Órdenes de compra con aprobación, doble control, recepción que crea los activos | Tramo 4 | **L**: unas 54 filas; dinero y separación de funciones (nadie aprueba lo que preparó) | Crear y aprobar una orden con otra persona; recibir parcialmente y ver nacer los activos |
| 6 | **Etapa 6: órdenes de servicio** | Órdenes de servicio con costo | Tramo 5 (orden de D-023) | **S**: unas 11 filas, apoyadas en lo anterior | Pedir un trabajo, atenderlo, cerrarlo con su costo |
| 7 | **Etapa 7: pulido y salida** | Rendimiento, respaldos probados, ensayo de vuelta atrás, revisión final de Seguridad y auditores de la v1, manual de usuario, paquete listo para producción | Tramo 6 | **L**: pocas filas (unas 9) pero revisa todo lo anterior | Resistencia: carga, restauración con cronómetro, vuelta atrás. **Usted aprueba «versión 1 completa»**; pasar a datos reales sigue cerrado |
| 8 | **Fase 2, ola A** | NOT-completo (avisos por fecha, bandeja, preferencias) y ENT-B (avisos de préstamo y acta sin firma) | Tramo 7 aprobado (D-056.2) | **M**: unos 34 requisitos de avisos más 17 de entregas, sobre la cola ya hecha | Recibir un aviso por fecha; configurar preferencias; ver la bandeja |
| 9 | **Fase 2, ola B** (dos demos) | **B1:** DOM (dominios y certificados) y PRV-B (contratos). **B2:** LIC (licencias), LIN (líneas móviles) y GAR-B (reclamos y mantenimiento) | Ola A, Personas, Inventario; PRV-B antes que GAR-B; DOM primero | **XL** en conjunto (cinco módulos, unos 120 requisitos), pero **muy parecidos entre sí**: cada demo es L | B1: un dominio que vence y avisa; un contrato con su costo. B2: licencias con puestos, una línea móvil, un reclamo de garantía |
| 10 | **Fase 2, ola C** | AYU (mesa de ayuda) y ONB (altas y bajas de personal) | Tramo 6 (órdenes de servicio), Personas, Inventario, ENT, ola A | **L**: AYU sola tiene unos 55 requisitos y es la base del asistente | Un caso de ayuda de punta a punta; el alta de una persona nueva con sus equipos |
| 11 | **Fase 3, ola D** | POR (portal de autoservicio) | AYU, ENT, Personas | **M**: unos 18 requisitos, mucho de ellos de acceso de gente nueva | Un empleado entra al portal, ve lo suyo y pide algo |
| 12 | **Fase 3, ola E** (tres demos en orden) | CMD (relaciones entre equipos), luego CAM (cambios), luego PRB (problemas) | Inventario, Personas; CAM necesita CMD; PRB necesita AYU, CMD y CAM | **L** (unos 58 requisitos, tres piezas en cadena) | Un mapa de qué depende de qué; un cambio aprobado; un problema ligado a varios casos |
| 13 | **Fase 3, ola F** (dos tandas) | **F1:** PRE-A, REP-A, INT-1 (**la API de lectura**). **F2:** PRE-B, REP-B y C, INT-2 (escritura, avisos a sistemas externos, SAP si lo usa), INT-3 (ingreso con Microsoft o Google) | F1 solo del núcleo; PRE-B necesita PRV-B, LIC, LIN, DOM y GAR-B; REP-B necesita PRE; INT-2 necesita Etapas 5 y 6 | **XL**: unos 76 requisitos y riesgo alto en INT-2 (llamadas hacia afuera, claves) | F1: un tablero de costos, un reporte, una clave de API que lee datos. F2: costos de contratos, tableros de Jefatura, un aviso a un sistema externo |
| 14 | **Fase 3, ola G** (seis demos, en el orden de D-081 y D-103) | **G-1** ASI-A (el chat que ayuda a pedir ayuda), **G-2** MSF-1 (conexión con Microsoft y Personas), **G-3** MSF-2 (equipos y conciliación), **G-4** ASI-B (respondedor), **G-5** ASI-C (borradores), **G-6** ASI-D (acciones con confirmación) | G-1: núcleo aprobado, ola A, manual de usuario, AYU; G-2: Etapas 1 y 2; G-3: MSF-1 y Etapas 4 y 5; G-4: ASI-A, AYU y POR; G-5: ASI-B; G-6: ASI-C y doble control | **XL** en conjunto (unos 110 requisitos y un proveedor de IA externo); G-1 y G-6 son **L** (riesgo nuevo y acciones), el resto **M** | Con datos inventados: el chat arma un caso completo; Microsoft muestra equipos y cuentas en solo lectura; el asistente responde, prepara borradores y pide confirmación |
| 15 | **Cierre del 100 %** | Empresa de demostración completa (generador completo de ejemplos, borrado, límites contra abuso, pruebas de aislamiento entre demostraciones y de cada función apagada), revisiones finales de todo, documentación y plan de reversa, ensayos sobre el producto completo, condiciones de datos reales (D-117.6d) | Todo lo anterior; el abogado y los contratos (sección 8) | **L**: poco código nuevo (menos que una etapa, D-116) pero muchas pruebas y firmas | **Demo final**: la demostración de un cliente de ejemplo de punta a punta, y su firma del hito «100 %» |

**Preparaciones que se hacen antes de que el módulo exista** (porque dejarlas para después obligaría a migrar datos reales; ya aprobadas en D-056.5 y D-081.4): se hacen **dentro de las Etapas 1 y 2**, sin pantallas ni lógica de los módulos posteriores.

## 4. Dependencias entre módulos (en una mirada)

Las flechas dicen el **orden de construcción y de aprobación**; las dependencias reales de cada módulo están en la tabla de la sección 3 (por ejemplo, MSF-1 no depende de ASI-A: va en ese lugar por D-081).

```
Etapa 1 (cimientos) -> 2 (catálogos) -> 3 (SKU) -> 4 (inventario) -> 5 (compras) -> 6 (órdenes de servicio) -> 7 (salida)

Después de la Etapa 7 aprobada:
  Ola A: NOT-completo, ENT-B                  (necesita la cola de la Etapa 1)
  Ola B: DOM -> PRV-B -> {LIC, LIN} -> GAR-B  (necesita ola A, Personas, Inventario; GAR-B después de PRV-B)
  Ola C: AYU, ONB                             (necesita Etapa 6, ola A, Personas, Inventario, ENT)
  Ola D: POR                                  (necesita AYU)
  Ola E: CMD -> CAM -> PRB                    (PRB además necesita AYU)
  Ola F: PRE-A, REP-A, INT-1  (solo el núcleo; pueden adelantarse a la ola B por decisión mía)
         PRE-B (necesita PRV-B, LIC, LIN, DOM, GAR-B) -> REP-B y C ; INT-2 (necesita Etapas 5 y 6) ; INT-3 al final
  Ola G: ASI-A (G-1) -> MSF-1 (G-2) -> MSF-2 (G-3) -> ASI-B (G-4: necesita AYU y POR) -> ASI-C (G-5) -> ASI-D (G-6: necesita el doble control de la Etapa 5)
  Cierre: necesita todo
```

La empresa de demostración toca a todos los módulos, porque cada función apagada (importar, exportar, chat, integraciones) se prueba apagada; por eso su paquete va al final.

## 5. Qué paraleliza el equipo

**Dentro de un tramo** (máximo **cuatro agentes a la vez**, regla de `CLAUDE.md`):

| Quién | Hace en paralelo |
|---|---|
| Ingeniero de Datos y Backend | Tablas, migraciones, reglas y permisos de la parte del tramo; el aislamiento entre empresas primero |
| Frontend | Pantallas del tramo sobre los acuerdos de Diseño, sin esperar a que todo el Backend esté terminado (se acuerda la forma de los datos antes) |
| QA | Criterios y pruebas del tramo desde el primer día; la prueba de aislamiento de cada etapa |
| Seguridad y los dos auditores | Revisan por partes durante el tramo, no solo al final; la revisión final de cada tramo con permisos o datos es con modelo potente |
| DevOps | Entornos, revisión automática, respaldos y generador de datos del tramo |

**Entre tramos (el trabajo de «el siguiente» mientras el CEO prueba el actual):** el Analista, el Diseñador, el Arquitecto y QA pueden **preparar** el tramo N+1 (documento, pantallas, ADR, criterios) mientras el N está en demo. **El código del N+1 no empieza hasta que el CEO apruebe el N** (`CLAUDE.md`).

**Entre olas de las Fases 2 y 3.** Por defecto se construyen **en serie, con una demo por paso**. Las que no dependen una de otra (por ejemplo, ola B con ola C, o F1 con la ola B) **pueden construirse al mismo tiempo** solo si se cumplen tres cosas: el CEO acepta ver dos demos a la vez, no se pasa de cuatro agentes, y QA y Seguridad no se reparten tan fino que dejen de revisar. Lo decido yo por escrito en cada caso.

## 6. Camino crítico

**El camino crítico es la cadena que no se puede acortar sin cambiar las reglas:**

1. **Tramo 0: la puerta** (depende de usted: documentos reales, cuentas a nombre de la empresa con suplente, aprobar el prototipo y el arranque de bajo costo).
2. **Tramos 1 a 7 uno tras otro** (cada uno necesita su aprobación; es la parte más larga).
3. **Ola A, luego ola C (AYU), luego ola D (POR)**, y de ahí la **cadena del asistente de IA**: G-1 y, tras él, G-4 (ASI-B), G-5 (ASI-C) y G-6 (ASI-D). Es la cadena **más larga** de las que vienen después de la Etapa 7: unos siete pasos seguidos, frente a cinco de la cadena de contratos (DOM, PRV-B, GAR-B, PRE-B, REP-B) y cinco de la de problemas (ola A, AYU, CMD, CAM, PRB).
4. **Cierre.**

**Aparte, en paralelo y no del equipo (puede romper el camino si se deja para el final):** el **abogado y los contratos**, las **licencias de Microsoft** de cada empresa y la **cuenta del proveedor de IA** con su tope. Si las respuestas legales tardan más que la construcción, la plataforma estará completa pero no «al 100 %» (D-117.6). Por eso se piden pronto (sección 8).

**Atajo permitido:** por D-103, al cerrar la ola D yo puedo decidir por escrito empezar **G-1 antes de las olas E y F** si AYU y POR están aprobados, la prueba H-IA con datos inventados salió bien y usted aprobó la pantalla del chat. Acorta la cadena crítica sin saltarse nada.

## 7. Qué puede adelantarse sin riesgo y qué NO

**Puede adelantarse (y conviene):**
- Todo trabajo de **documentos, diseño y criterios** de tramos futuros, siempre que no cambie lo ya aprobado: pantallas de los módulos, ADR, criterios de QA, revisiones de los módulos de la ola G (A2-12 y A2-13), borrador del acuerdo de prueba.
- El **prototipo técnico** y la **primera prueba en Neon** (ya autorizados, con datos inventados).
- El **generador de datos de ejemplo**, que crece con cada etapa (es lo que luego alimenta la demostración).
- **Trámites con tiempo de espera externo:** contratar al abogado y empezar sus preguntas, verificar precios y abrir cuentas, pedir el contrato del proveedor de IA, saber qué licencias de Microsoft tiene cada empresa.
- **PRE-A, REP-A e INT-1** antes de la ola B, **solo** con mi decisión escrita y **después** de aprobar la Etapa 7 (D-056.3).
- **G-1** antes de las olas E y F, con las tres condiciones de D-103.
- Las **preparaciones** de D-056.5 y D-081.4 dentro de las Etapas 1 y 2.

**NO se adelanta, aunque corra prisa:**
- **La puerta de la Etapa 0 no se debilita:** las 13 condiciones de D-064, completas. Ninguna línea de código de funcionalidades antes.
- **Ningún tramo sin la demo aprobada del anterior** (`CLAUDE.md`).
- **Nada fuera de la v1 antes de aprobar la Etapa 7** (D-056.2). Mover MSF-1 a justo después de la ola D solo con decisión escrita mía al cerrar la Etapa 7, y nunca antes (D-081.2).
- **Datos reales:** nada hasta cumplir las condiciones legales y de contratos (D-117.6d). El borrado y la anonimización automáticos de datos de personas siguen **apagados** hasta que el abogado confirme los plazos.
- **El chat con Claude con datos reales**, y ninguna promesa de gasto acotado hasta verificar el tope duro en la cuenta del proveedor (D-114).
- **Saltarse a QA, Seguridad o a los auditores** para ganar tiempo, o aprobar «conforme con observaciones» sin cerrar lo grave.
- **Ofrecer, enseñar o dar acceso a clientes** (D-117). Y **construir instalaciones dedicadas o SQL Server** salvo que el CEO lo incluya (ADR-25).

## 8. Qué necesito del CEO para llegar al 100 %

Todo lo de abajo es **dinero, legal, irreversible o algo que solo usted tiene**. Lo demás lo decide el equipo.

**A. Lo que necesito ya (actualizado por D-118 y D-119: el abogado salió de esta lista; la versión local de hoy no necesita nada de esto salvo probarla):**
1. **Tres documentos reales con los nombres de personas reemplazados:** una orden de compra, una orden de servicio y el Excel de inventario actual. Sin ellos trabajamos con datos de ejemplo declarados y hay riesgo de rehacer parte (riesgo #6). No frena programar; sí cerrar la Etapa 0.
2. **Un correo de la empresa** (no personal) que sea dueño de todas las cuentas, **y una segunda persona de suplente.** Solo para entornos en la nube (no para la versión local).
3. **Aprobar el arranque de bajo costo** en la nube y el **servicio de correo**, cuando le traigamos los precios con fecha y enlace. Se necesita cuando salgamos de la computadora local.
4. **Un dominio o subdominio** de la empresa: solo lo pide la prueba de entrega de correo (condición 6), antes de la nube.
5. **Probar la versión local** (hoy, con Docker Desktop) y, después, **aprobar el prototipo de pantallas** con la prueba de 5 personas **de su empresa** (no clientes).
6. **País de cada empresa, si los precios incluyen impuestos y una cifra aproximada** de equipos, usuarios y órdenes por mes.

**B. Antes de datos reales y antes de ofrecer (diferido por D-118; no se pierde):**
7. **Contratar a un abogado de protección de datos** que pueda atender una consulta el mismo día. **Por decisión del CEO no se gestiona ahora.** Es necesario antes de cargar datos reales, de ofrecer la plataforma y de activar el texto libre del asistente, el borrado o anonimización de personas y el envío de datos reales a proveedores externos. Sus respuestas (ocho de prioridad A, y después las de IA y Microsoft) son lo que más tarda, así que **cuanto más se espere, más se retrasa «Lista para datos reales»** (no la «Plataforma completa»). Un recordatorio, no una pregunta, al cerrar la Etapa 4.
8. **Dos personas de su equipo para administrar la plataforma** y **dos custodios de las llaves de seguridad** (distintos de esos dos), antes de datos reales; y por cada empresa **un representante** a quien avisar si falla el correo.
9. **Qué licencias de Microsoft tiene cada empresa** y si algún tipo de equipo lo administra otro sistema distinto de Intune. Solo antes de la ola G.
10. **Si usa SAP** (solo antes de INT-2).
11. **La cuenta del proveedor del asistente de IA** (Claude, de Anthropic), **a nombre suyo**, con un tope mensual global y otro por empresa; y aprobar su contrato. Solo antes de probar el asistente (ola G). Recomendamos tope general y uno igual por empresa, aviso al 80 % y pausa al 100 %.
12. **Dinero de producción** cuando se acerque la Etapa 7: servidores y base de datos de pago con copias, almacenamiento externo de copias, vigilancia de errores, gestor de claves y llaves físicas, con precios comprobados. Se lo pedimos con cifras, no antes.

**C. Aprobaciones y decisiones suyas, una sola vez o en cada tramo:**
13. **Aprobar la definición del «100 %»** de la sección 2 (texto completo en D-117.6).
14. **Decidir si las instalaciones dedicadas (en la base o servidores de un cliente) y SQL Server entran en el 100 %.** **Recomendación: no.** Sumarlas agrega al menos un tramo grande y un costo que se paga cada vez que salga una versión nueva; la API de lectura (INT-1) ya permite que un cliente copie sus datos a su SQL Server. Se decide cuando un cliente real lo pida y lo pague.
15. **La demo al final de cada tramo** (hoy son 16 tramos con sus demos; las olas B, E, F y G tienen varias) y la **firma del hito «100 %»**.
16. **Pasar a datos reales** (irreversible): lo decide usted después de la demo final, con el respaldo probado y las condiciones legales cumplidas. **Una decisión que no hace falta hoy:** si su propia empresa usaría la plataforma con datos reales antes del 100 %; se decide al cerrar la Etapa 7.

**D. «Antes de ofrecer» (no urgente, no se pierde):** dominio para clientes, acuerdo de prueba y plazo de guarda con el abogado, dónde viven las demostraciones de clientes, crédito del chat para demostraciones (recomendamos no comprarlo), modelo comercial y de soporte de instalaciones dedicadas si las incluye. Lista completa en D-117.7.

## 9. Lo que no sé todavía (declarado)

- **El tamaño real de cada tramo.** Mis tamaños son un juicio con las cuentas de la nota inicial; los corrijo al cerrar la Etapa 1, que es la primera que se mide.
- **Cuánto tardan el abogado, los contratos y los terceros.** No lo controlamos; por eso se piden primero.
- **Si los servicios gratuitos alcanzan para las demos internas** (cifras de terceros sin verificar; D-115). Si no alcanzan, se lo diremos antes de gastar.
- **Si cuatro agentes a la vez bastan** para el volumen de revisiones de las olas grandes. Se ajusta con la experiencia de las Etapas 1 y 2.

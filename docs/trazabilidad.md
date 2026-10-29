# Trazabilidad: requisito, etapa, criterio de aceptación

**Autor:** QA (qa-tester) · **Fecha:** 2026-10-29 · **Checkpoint:** commit `f3c76eb` · **Cubre:** el núcleo del documento funcional v0.3 (secciones 5 a 21, con D-077 a D-080) y los 18 módulos de `docs/modulos/` que ya están completos (los dos módulos nuevos en redacción, `microsoft-entra-intune` y `asistente-ia`, figuran en `docs/calidad/criterios-por-etapa.md`). Generado con `docs/calidad/herramientas/generar.py`; los juicios de lectura están en `docs/calidad/herramientas/juicios.py` y la revisión de citas y huecos en `docs/calidad/herramientas/huecos.py`. Reemplaza la versión del 2026-10-26.

**Cómo se hizo.** Un script lee las tablas de requisitos (columnas Cuándo y CA), la tabla de reglas RN con su columna CA, la sección 22 con su tabla 22.1 "Se ejecuta en" y los criterios de los módulos. Después QA leyó el texto de los requisitos y criterios dudosos. Estados:

- **cubierto:** el criterio citado existe y lista este requisito en su cabecera.
- **no probado de verdad:** el criterio existe, pero leído su texto no prueba lo que dice el requisito (con la razón).
- **cita mal apuntada o incompleta:** el criterio citado no es el que prueba el requisito, o falta citar el que lo prueba.
- **verificar:** el criterio existe pero no nombra al requisito; hay que leerlo.
- **cubierto por cabecera:** el requisito no cita criterio en su fila, pero un criterio lo lista (módulos).
- **sin criterio:** ningún criterio lo cita ni lo lista.

El Auditor Técnico revisa esta matriz al cerrar cada etapa (D-026.4, D-076.5): un requisito sin prueba y una prueba sin requisito son hallazgos. **QA no ejecutó el guion de citas del Auditor Técnico;** lo de este archivo es lectura de QA, no la verificación del Auditor.

## Resumen de huecos

| Medida | Antes (2026-10-26, commit 5ed0dcb) | Hoy (2026-10-29, commit f3c76eb) |
|---|---|---|
| Filas RF y RNF del núcleo (con las retiradas) | 316 | 317 |
| Retiradas (RF-USR-004, RF-IMP-012, RF-OS-007) | 3 | 3 |
| Filas vigentes | 313 | 314 |
| Citas rotas en la columna CA de un requisito o regla (criterio inexistente o «padre» que ya se partió) | 0 | 0 |
| Citas sueltas en el texto a un criterio inexistente (más alusiones históricas a criterios ya partidos) | - | 1 (más 3) |
| Cabeceras de criterio que nombran un RF, RNF o RN que no existe | - | 0 |
| Cubiertos: el criterio los lista | 295 | 307 |
| No probados de verdad (núcleo) | 14 | 2 |
| No probados de verdad (módulos con parte en la v1) | 5 | 2 |
| Citas mal apuntadas o incompletas (núcleo) | 4 | 1 |
| Para verificar leyendo el texto (sin juicio de QA todavía) | 0 | 4 |
| Reglas RN con un criterio en su columna CA | 23 de 23 | 24 de 24 |
| Reglas RN que el propio criterio también cita (cita de vuelta) | 10 de 23 | 13 de 24 |
| Reglas RN que ninguna cabecera de criterio nombra (solo están en la columna CA de la regla) | 13 de 23 | 9 de 24 |
| Reglas RN cuyo criterio no las prueba del todo | 4 (RN-009, RN-018, RN-021, RN-023) | 3 (RN-021, RN-023, RN-024) |
| Criterios sin ningún requisito ni regla que los cite o liste | - | 2 (CA-AYU-26, CA-PRE-12) |
| Criterios citados solo por reglas RN o RS (sin fila RF) | 59 | 103 |
| Reglas RN de módulos sin criterio (de ellas, en módulos con parte en la v1) | - | 179 (90) |
| RF y RNF de módulos sin criterio (de ellos, en módulos con parte en la v1) | - | 61 (39) |
| «Sin hacer» del Analista que siguen abiertos | - | 6 |

Lectura: las 24 reglas del núcleo tienen criterio (RN-024, la congelación, entró con CA-095a a 095j). De los 19 requisitos que el 2026-10-26 no se probaban de verdad, quedan 4: RF-ENT-002, RF-ENT-016 y RF-OC-028 (los «Sin hacer» del Analista) y RF-OC-048 (el informe mensual espera la respuesta P-018). Los demás los resolvieron los criterios CA-015g a 015i, CA-038c y 038d, CA-071, CA-097 a CA-105 y las particiones de PRV y GAR. Las cuatro citas mal apuntadas de entonces (RF-USR-006, RF-PER-010, RF-ACC-021, RF-UX-008) y RF-OC-041 se corrigieron; aparecen dos nuevas: RF-CAT-008 (núcleo) y RF-GAR-006 (garantías).

## Lo que falta, exacto, y de quién

Lista cerrada al 2026-10-29 (commit f3c76eb). Cada fila dice qué falta, el texto que QA propone y quién lo cierra. El texto de QA es una **propuesta**: lo decide y lo redacta el Analista (o el escuadrón). Estas filas se recalculan al regenerar: cuando el Analista las resuelva, desaparecen solas de la primera tabla.

**1. «Sin hacer» del Analista (se detectan leyendo el texto actual)**

| Pendiente | Qué falta exacto | Propuesta de QA | Quién | Bloquea |
|---|---|---|---|---|
| CA-024 | La cabecera cubre RF-OC-028 (Etapa 7, P-009) y el criterio corre en Etapa 4: no se puede ejecutar entero. | Quitar RF-OC-028 de la cabecera de CA-024 y de su fila (la baja con motivo ya la prueba CA-024 en Etapa 4); la decisión P-009 de la Etapa 7 se verifica con un criterio documental nuevo. | Analista | Etapa 4 |
| CA-053 | Sigue entero: junta respaldo, restauración con cronómetro, vuelta atrás, manuales, rendimiento y procedimiento de incidente (D-076.3 pide partirlo). | 053a respaldo y restauración (RNF-014, RF-DAT-005); 053b vuelta atrás (RNF-015); 053c rendimiento (RNF-010 a 012; RNF-011 corre en la carga nocturna desde la Etapa 4, se completa en la 7); 053d manuales, costo y procedimiento de incidente (RNF-016 a 018, RF-DAT-015). | Analista | Etapa 7 (053c desde la Etapa 4) |
| CA-ENT-08 | Dice «falla la entrega de uno» y no dice cómo se provoca la falla. | Dada la inyección de fallos del entorno de pruebas: se corta la conexión entre la primera y la segunda asignación del traspaso; resultado esperado: ninguna devolución ni entrega registrada, los dos equipos siguen con la Persona cesada y no queda ningún acta. Segundo caso sin inyección: la Persona destino pasa a Cesada justo antes de confirmar. | Analista (escuadrón D) | Etapa 4 |
| CA-ENT-10 | Dice «cuando pasa el tiempo» sin decir cuánto ni con qué reloj. | Con el reloj de pruebas a +30 días y a +365 días desde el cese (reloj R5), el equipo sigue Asignado como «Pendiente de devolución» y no suma a pérdidas. | Analista (escuadrón D) | Etapa 4 |
| RF-ENT-002 | Su único criterio (CA-ENT-01) no prueba lo que dice el requisito. | Dado un técnico que captura una entrega de dos equipos (L1 y M1) a Ana y sale sin confirmar, cuando vuelve, entonces ve lo capturado; L1 y M1 siguen En stock y otro técnico puede entregar L1 a Luis; el borrador sin efecto se borra y desaparece; una entrega confirmada no se puede borrar (CA-045). | Analista (escuadrón D) | Etapa 4 |
| RF-ENT-016 | Su único criterio (CA-ENT-01) no prueba lo que dice el requisito. | Dado un préstamo de L1 a Ana con fecha prevista 30/11/2026, cuando el técnico lo renueva al 31/12/2026 con motivo, entonces la fecha cambia, el historial guarda la anterior y la nueva y la auditoría guarda el motivo; sin motivo o sin permiso se rechaza; una entrega definitiva no se renueva. | Analista (escuadrón D) | Etapa 4 |

**2. Otros huecos de redacción que QA encontró al leer**

| Pendiente | Qué falta | Propuesta de QA | Quién | Bloquea |
|---|---|---|---|---|
| CA-095j | Está en Fase 2, pero la v1 ya tiene cuatro rutinas de purga o anonimización que RN-024 obliga a respetar. | Partir en 095j1 (Etapa 2: contactos de proveedor y anonimización automática de Personas con la bandera de pruebas), 095j2 (Etapa 4: filas de importación en preparación), 095j3 (Etapa 7: eventos de seguridad a 12 meses) y dejar 095j para Fase 2. | Analista | Etapas 2, 4 y 7 |
| CA-095f, CA-095g | Dependen del permiso nuevo de P-017 (no existe en el registro) y de si levantar exige una segunda persona de plataforma. | Hasta que responda P-017, QA solo ejecuta los rechazos. | Gerente de TI responde P-017; Analista actualiza registro y criterios | Etapa 2 |
| CA-102 | No fija los bordes: suma exactamente igual al límite y compra a exactamente 30 días. | Avisa solo si la suma supera el límite; 30 días corridos con el día 30 incluido; agregar los casos 5.000,00 (sin aviso), día 30 (con aviso) y día 31 (sin aviso). | Analista | Etapa 5 |
| RF-OC-048 (informe mensual) | Sin criterio: espera P-018 (qué registros entran y dónde lo ve quien aprueba). | Ninguna hasta que responda P-018. | Gerente de TI responde P-018 | Etapa 5 |
| RF-OC-049 con cambios | CA-103 prueba el borrador sin cambios; el caso con cambios espera P-019. | Ninguna hasta que responda P-019. | Gerente de TI responde P-019 | Etapa 5 |
| CA-017 y RF-CAT-008 | CA-017 no nombra el prefijo reservado `ACTV` (D-079); RF-CAT-008 no cita CA-094a. | Agregar `ACTV` al ejemplo de CA-017 («un prefijo reservado como `OC` o `ACTV` se rechaza») y citar CA-094a en RF-CAT-008. | Analista | Etapa 2 |
| RF-GAR-006 | La mitad «una ampliación es una garantía nueva» la prueba CA-GAR-04f (Fase 2). | Citar CA-GAR-04f o decir que esa mitad es de Fase 2. | Analista (escuadrón A) | Etapa 4 |
| Documento funcional, línea 1233 (sección 26.1) | Dice «CA-095 … son nuevos»: CA-095 ya no existe como uno solo (partido en 095a a 095j). La línea del módulo DAT (1230) dice «CA-095a a i» y deja fuera CA-095j. | Decir «CA-095a a j». | Analista | Auditoría de citas |
| CA-NOT-10, CA-NOT-13 | Corren en Etapa 1 y cubren requisitos de Fase 2. | El escuadrón C dice qué parte corre en Etapa 1 (ver criterios-por-etapa.md). | Analista (escuadrón C) | Etapa 1 |
| CA-PRS-16 | Cita RN-PRS-004 cuando prueba el alcance «propio» sin Persona vinculada. | Cambiar la cita. | Analista (escuadrón B) | Etapa 2 |
| CA-GAR-04a | Dice «a las 23:59» sin zona horaria. | Zona de la empresa; agregar una empresa de otra zona. | Analista (escuadrón A) | Etapa 4 |
| RF-IMP-010 (plantilla) | Ningún criterio prueba que la plantilla trae costo, moneda, fecha de compra, fin de garantía y centro de costo. | Una línea en CA-038a. | Analista | Etapa 4 |
| RN-010 | No nombra CA-079b (autoentrega sin excepción). | Agregar CA-079b a la columna CA. | Analista | Etapa 1 |
| 39 RNF de los módulos PRS, ENT, PRV, GAR y NOT | Ninguna fila ni criterio los cita (H-QA-27). | Cada escuadrón cita el criterio de cada RNF; hasta entonces QA los prueba con CA-050a, CA-053 y CA-001. | Analista (escuadrones A, B, C, D) | Etapas 2, 4 y 5 |
| 90 reglas RN de los módulos con parte en la v1 | Sin criterio que las cite o las liste. | Cada escuadrón cita el criterio de cada regla antes de la etapa del módulo (D-076.4). | Analista (escuadrones A, B, C, D) | Etapas 2, 4 y 5 |
| CA-AYU-26, CA-PRE-12 | Ningún requisito ni regla los cita ni los lista. | Fase 2 y Fase 3: el escuadrón los vincula al activar el módulo. | Analista (escuadrones de mesa de ayuda y presupuesto) | Fase 2 y 3 |
| CA-105 (Etapa 0) | El texto está; no se puede ejecutar hasta recibir el Excel, la orden de compra y la orden de servicio reales con nombres reemplazados (P-002). | QA revisa el archivo cuando llegue. | Cliente (CEO) entrega; Jefatura de Proyecto lo pide | Etapa 0 (cierre) y Etapa 4 |
| Módulo MSF (Microsoft Entra e Intune) | El archivo no existe todavía. | QA lo lee, regenera cifras y agrega su aislamiento y permisos a este plan cuando llegue. | Analista | Fase posterior |

**3. Preguntas que esperan respuesta y frenan una prueba**

| Pregunta | Qué prueba frena | Quién responde |
|---|---|---|
| P-017 · permiso nuevo para declarar y levantar la congelación; ¿levantar exige una segunda persona de plataforma?; ¿se congela la redacción por seguridad? | CA-095e (parcial), CA-095f, CA-095g; matriz de permisos (un permiso más) | Gerente de TI, con el Arquitecto y Seguridad |
| P-018 · qué registros entran al informe mensual «sin respaldo de compra» y dónde lo ve quien aprueba | Parte de RF-OC-048 | Gerente de TI |
| P-019 · los 7 días del borrador de recepción, ¿desde la creación o desde el último cambio? | CA-103 con cambios | Gerente de TI |
| P-009 · ¿dar de baja un activo de valor exige una segunda persona y desde qué monto? | RF-OC-028 (Etapa 7) | Gerente de TI |
| P-007 · textos de estado y columnas del Excel real | CA-038d (usa textos supuestos) | Analista y Datos, con el Excel real |
| P-002 · Excel, orden de compra y orden de servicio reales con nombres reemplazados | CA-105 (Etapa 0) | Cliente (CEO), por la Jefatura de Proyecto |

## Qué exige D-076, hoy, y quién lo cierra

Regla (D-076): un requisito necesita un criterio que lo pruebe **antes de que se abra la etapa en que se programa**. Responsables: el **Analista** redacta o cita el criterio; **QA** revisa y propone el texto cuando el Analista lo prefiera; el **Auditor Técnico** verifica con su guion que ningún requisito de la etapa que se abre quede sin criterio; el **Gerente de TI** no abre una etapa con esa verificación pendiente. Estado según la lectura de QA al 2026-10-29.

**Antes de la Etapa 1 (puerta de la Etapa 0 y v1.0)**

| Requisito o regla | Criterio | Estado (lectura de QA) | Responsable |
|---|---|---|---|
| RN (todas las reglas de la sección 21) | Columna CA en la tabla de reglas | HECHO. Todas las reglas (24) citan al menos un criterio que existe. 13 de 24 además aparecen citadas por el propio criterio; las otras 11 solo en la columna (basta: D-076.1a dice "citando"). Sugerencia: RN-010 debería nombrar también CA-079b (autoentrega sin excepción). | Analista (hecho); Auditor Técnico verifica con su guion |
| RF-ACC-006 | CA-068 | HECHO. Prueba los 15 minutos (a los 15:01 se rechaza), el uso único y el código de 8 caracteres en otro dispositivo. | Analista (hecho) |
| RF-ACC-014 | CA-069 | HECHO. Prueba aviso a los 25, vencimiento a los 30 minutos sin actividad y a las 12 horas. | Analista (hecho) |
| RF-ACC-020 | CA-009 | HECHO. Prueba el aviso de recomendar al menos dos administradores. | Analista (hecho) |
| RF-PLA-009 | CA-015f | HECHO. Segunda persona o contacto confirmado, aviso a todos, un solo uso, 2F, un uso por semana. No prueba "verificar la identidad por otro medio" (es un procedimiento: queda como paso manual de la prueba). | Analista (hecho) |
| RF-PLA-010 | CA-084 | HECHO. El tope sube por un periodo y vuelve solo; queda en el registro. | Analista (hecho) |
| RF-PLA-011 y RF-PLA-012 | CA-015e | HECHO. Confirmación del contacto, espera de 24 horas con aviso, veto durante el rescate. | Analista (hecho) |
| RF-EMP-004 | CA-071 | HECHO (verificado por QA el 2026-10-29). CA-071 trae ahora horario, feriado y cuatro resultados esperados. QA comprobó las fechas: el 06/11/2026 es viernes y el 09/11/2026 lunes; tres días corridos desde el viernes caen el lunes. | Analista (hecho) |
| RF-ROL-015 y CA-077 | CA-077 | HECHO (verificado por QA el 2026-10-29). CA-077 trae reloj R0, tres empresas, doble corrida, tres días perdidos y el cambio de día entre Lima y Ciudad de México (06/11 05:30 universal). Incluye la prueba de dependencias. | Analista (hecho) |
| CA-006 | CA-006 | HECHO. 200 intentos con cuenta y 200 sin cuenta, diferencia menor a 100 ms en el percentil 95, y esperas con reloj (10:00:59 se rechaza, 10:01:00 se acepta). | Analista (hecho) |
| CA-070 (segundo administrador y resumen mensual) | CA-070 | HECHO en el texto. Corre en Etapa 5 según 22.1. | Analista (hecho) |
| RN-008 | CA-085 | HECHO. Recorre las acciones con motivo, incluye el tope de 500 caracteres. | Analista (hecho) |
| RF-PLA-013 (lectura de soporte) | CA-015g, CA-015h, CA-015i | HECHO (2026-10-29). 015g prueba autorización vencida (10:01 contra 10:00), ajena y ya usada, con cero filas y escritura que falla, y el borde de las 09:59, que todavía lee; 015i la válida; 015h (sin secretos ni derechos) corre en Etapa 2. | Analista (hecho) |
| RF-IMP-017 y RF-DAT-010 | CA-105 | BLOQUEADO (P-002). El texto está (verificación documental); no se puede ejecutar hasta que el Cliente (CEO) entregue el Excel, la orden de compra y la orden de servicio reales con nombres reemplazados. | Cliente (CEO) entrega; QA verifica el archivo recibido |

**Antes de la Etapa 2**

| Requisito o regla | Criterio | Estado (lectura de QA) | Responsable |
|---|---|---|---|
| RN-015 | CA-086 | HECHO (ya redactado). | Analista (hecho) |
| RN-016 | CA-087 | HECHO (ya redactado). | Analista (hecho) |
| RF-CAT-026 | CA-092 | HECHO (ya redactado): 2 años, exportación general sin contactos, permiso para verlos. | Analista (hecho) |
| RF-PRV-003 y CA-PRV-04 | CA-PRV-04a, CA-PRV-04c | HECHO (partido por el escuadrón A). 04b (contrato Vigente) queda en Fase 2. | Analista (hecho) |
| CA-PRS-01, 03, 08, 12 y 14; CA-PRV-02 | CA-PRS-01a a 14f, CA-PRV-02a a 02c | HECHO. Los seis criterios están partidos y cada parte tiene etapa. Quedó un error de lectura corregido por QA: CA-PRS-01d corre en Etapa 2. | Analista (hecho) |
| RF-DAT-017 y RN-024 (congelación por incidente) | CA-095a a CA-095g | PARCIAL. Siete criterios con datos. CA-095f y CA-095g no se pueden probar completos hasta que el Gerente de TI responda P-017 (el permiso nuevo del registro y si levantar exige una segunda persona de plataforma). | Gerente de TI responde P-017; Analista actualiza el registro de permisos y los dos criterios |
| RN-024 (rutinas que ya existen en la v1) | CA-095j | PENDIENTE. CA-095j está en Fase 2 y deja sin criterio con congelación a cuatro rutinas de la v1: contactos de proveedor y anonimización automática de Personas (Etapa 2), filas de importación en preparación (Etapa 4) y eventos de seguridad a los 12 meses (Etapa 7). | Analista; QA propone la partición (ver ambiguos) |
| RF-CAT-008 (prefijo `ACTV` reservado) | CA-017 | PENDIENTE (menor). CA-017 no nombra `ACTV`. | Analista |

**Antes de la Etapa 4**

| Requisito o regla | Criterio | Estado (lectura de QA) | Responsable |
|---|---|---|---|
| RF-IMP-008, 009, 010, 015 y 016; RF-INV-005 | CA-038c, CA-038d, CA-099, CA-100 | HECHO (2026-10-29). Quedan dos observaciones menores: la plantilla de RF-IMP-010 (columnas) no tiene criterio y los textos de estado dependen de P-007. | Analista (hecho) |
| RF-INV-033 | CA-101 | HECHO (2026-10-29). Seis cambios, un evento cada uno, sin segundo evento en la baja ni evento en el cambio rechazado; doble clic = un evento. | Analista (hecho) |
| Partir CA-038 y CA-094 | CA-038a a 038d, CA-094a a 094c | HECHO (2026-10-29). | Analista (hecho) |
| RF-GAR-003 y RF-GAR-006 | CA-GAR-04c, CA-GAR-04d, CA-GAR-04e | HECHO. La mitad de RF-GAR-006 «una ampliación es una garantía nueva» queda en CA-GAR-04f (Fase 2). | Analista (hecho) |
| RF-ENT-002 y RF-ENT-016 | CA-ENT-01 | PENDIENTE. «Sin hacer» del Analista al 2026-10-29: CA-ENT-01 no prueba el borrador ni renovar un préstamo. QA propone el texto (ver «Lo que falta»). | Analista (escuadrón D) |
| CA-ENT-08 y CA-ENT-10 | CA-ENT-08, CA-ENT-10 | PENDIENTE. «Sin hacer»: «falla la entrega de uno» y «cuando pasa el tiempo» siguen sin datos. | Analista (escuadrón D) |
| RF-INV-033 y CA-024 (RF-OC-028 en la cabecera) | CA-024 | PENDIENTE. «Sin hacer»: CA-024 sigue cubriendo RF-OC-028 (Etapa 7) y corre en Etapa 4. | Analista |
| CA-NOT-10 y CA-NOT-13 | CA-NOT-10, CA-NOT-13 | PENDIENTE. Corren en Etapa 1 y cubren requisitos de Fase 2 (rebotes, bandeja, campana). No es un «Sin hacer» nuevo: es de la lectura anterior. | Analista (escuadrón C) |

**Antes de la Etapa 5**

| Requisito o regla | Criterio | Estado (lectura de QA) | Responsable |
|---|---|---|---|
| RF-OC-048 | CA-055, CA-102 | PARCIAL. El aviso «compra fraccionada» tiene criterio (CA-102). El informe mensual espera a P-018 y los bordes de CA-102 no están fijados. | Gerente de TI responde P-018; Analista |
| RF-OC-049 y RF-OC-050 | CA-061, CA-103 | HECHO. CA-103 prueba el borde de los 7 días (10:00:00 acepta, 10:00:01 rechaza). P-019 (con cambios) sigue abierto. | Analista (hecho); Gerente de TI responde P-019 |
| RF-OC-026 (mapa acto-casilla), RF-OC-051 | CA-097, CA-098, CA-104a, CA-104b | HECHO (2026-10-29). | Analista (hecho) |
| RN-009 | CA-096 | HECHO (2026-10-29). Lista, bandeja y exportación sin total entre monedas. | Analista (hecho) |

**Antes de la Etapa 7**

| Requisito o regla | Criterio | Estado (lectura de QA) | Responsable |
|---|---|---|---|
| Partir CA-053 | CA-053 | PENDIENTE. «Sin hacer»: CA-053 sigue entero. Su parte de rendimiento (RNF-011) corre en la carga nocturna desde la Etapa 4. | Analista |
| RF-DAT-017 (auditoría vencida y restauración) | CA-095h, CA-095i | HECHO (2026-10-29). Corren en la Etapa 7. | Analista (hecho) |
| RF-OC-028 | CA-024 | PENDIENTE. La decisión P-009 de la Etapa 7 no tiene criterio propio; hoy solo la baja con motivo (CA-024, Etapa 4). | Analista; Gerente de TI responde P-009 |

Resultado: 26 de los 37 puntos listados están hechos en el texto; 11 siguen abiertos (pendientes, parciales o bloqueados por una respuesta o un archivo). **Abiertos por etapa:** Etapa 1: 1, Etapa 2: 3, Etapa 4: 4, Etapa 5: 1, Etapa 7: 2. **Antes de la Etapa 1 solo queda abierto** RF-IMP-017 y RF-DAT-010 (bloqueado).

## Reglas de negocio (RN) y el criterio que las prueba

La tabla de reglas del documento ya tiene la columna CA. "Cita de vuelta" = el criterio también nombra la regla en su cabecera.

| Regla | Criterio en la columna CA (etapa) | Cita de vuelta | Juicio de QA |
|---|---|---|---|
| RN-001 | CA-001 (E1), CA-002 (E1), CA-003 (E1) | CA-001, CA-002 | prueba de verdad |
| RN-002 | CA-011a (E1) | - | prueba de verdad |
| RN-003 | CA-034 (E5), CA-038a (E4), CA-027 (E4) | CA-038a | prueba de verdad |
| RN-004 | CA-018 (E3) | CA-018 | prueba de verdad |
| RN-005 | CA-023 (E4) | - | prueba de verdad |
| RN-006 | CA-040a (E1) | CA-040a | prueba de verdad |
| RN-007 | CA-045 (E1) | CA-045 | prueba de verdad |
| RN-008 | CA-085 (E1) | CA-085 | prueba de verdad |
| RN-009 | CA-072 (E5), CA-031 (E5), CA-096 (E5) | CA-096 | prueba de verdad |
| RN-010 | CA-012 (E5), CA-013 (E5), CA-014 (E5) | - | prueba de verdad |
| RN-011 | CA-001 (E1), CA-048 (E1) | - | prueba de verdad |
| RN-012 | CA-017 (E2), CA-023 (E4), CA-005 (E1) | - | prueba de verdad |
| RN-013 | CA-046 (E4), CA-082b (E4) | - | prueba de verdad |
| RN-014 | CA-051 (E1) | CA-051 | prueba de verdad |
| RN-015 | CA-086 (E2) | CA-086 | prueba de verdad |
| RN-016 | CA-087 (E2) | CA-087 | prueba de verdad |
| RN-017 | CA-055 (E5) | - | prueba de verdad |
| RN-018 | CA-077 (E1) | - | prueba de verdad |
| RN-019 | CA-042 (E2) | - | prueba de verdad |
| RN-020 | CA-088 (E2) | CA-088 | prueba de verdad |
| RN-021 | CA-063 (E4), CA-072 (E5) | - | parcial: CA-063 y CA-072 prueban el costo del activo en la v1 (el de la recepción). El libro único y `fuente_costo` son de Fase 3 (CA-PRE-14). |
| RN-022 | CA-018 (E3) | - | prueba de verdad |
| RN-023 | CA-094a (E4), CA-094b (E5), CA-094c (F2), CA-046 (E4) | CA-094b, CA-094c | parcial: CA-094a y CA-094b prueban el código y su contador; el acta lleva código y serie (CA-046). La cláusula «el correo de un aviso de garantía trae el código y no la serie» (CA-094c) necesita los avisos de garantía (Fase 2). En la v1 los correos (invitación, acceso, aprobación) no llevan activo: la regla se prueba por completo al activar GAR-B. |
| RN-024 | CA-095a (E2), CA-095b (E2), CA-095c (E2), CA-095d (E2), CA-095e (E2), CA-095f (E2), CA-095g (E2), CA-095h (E7), CA-095i (E7), CA-095j (F2) | CA-095a, CA-095b, CA-095c, CA-095d, CA-095e, CA-095f, CA-095h, CA-095j | parcial: En la v1 se prueban la anonimización manual (CA-095a a 095g) y el archivado de la auditoría (CA-095h, CA-095i). «Toda rutina de anonimización o de purga consulta la congelación» (CA-095j) está en Fase 2, pero la v1 ya tiene rutinas: anonimización de contactos de proveedor (CA-092, Etapa 2), anonimización automática de Personas con la bandera de pruebas (Etapa 2), filas de importación en preparación a los 7 días (RF-DAT-004, Etapa 4) y purga de eventos de seguridad a los 12 meses (Etapa 7). Ninguna se prueba con congelación hasta Fase 2. |

**Reglas RN de los módulos**

| Módulo | Reglas RN | Con criterio en su fila | Citadas por un criterio | Sin criterio |
|---|---|---|---|---|
| ASI · Asistente de IA (en redacción) | 40 | 0 | 40 | 0 |
| CMD · CMDB ligera | 30 | 29 | 0 | 1 |
| DOM · Dominios y certificados | 26 | 0 | 8 | 18 |
| ENT · Entregas y devoluciones | 29 | 0 | 16 | 13 |
| GAR · Garantías y mantenimiento | 41 | 0 | 21 | 20 |
| CAM · Gestión de cambios | 30 | 29 | 0 | 1 |
| PRB · Gestión de problemas | 21 | 21 | 0 | 0 |
| INT · Integraciones y API | 49 | 49 | 0 | 0 |
| LIC · Licencias de software | 29 | 0 | 15 | 14 |
| LIN · Líneas móviles | 28 | 0 | 13 | 15 |
| AYU · Mesa de ayuda | 34 | 0 | 28 | 6 |
| NOT · Notificaciones | 28 | 0 | 17 | 11 |
| ONB · Onboarding y offboarding | 23 | 0 | 11 | 12 |
| PRS · Personas y ubicaciones | 34 | 0 | 19 | 15 |
| POR · Portal de autoservicio | 22 | 0 | 15 | 7 |
| PRE · Presupuesto y costos | 40 | 40 | 0 | 0 |
| PRV · Proveedores y contratos | 44 | 0 | 13 | 31 |
| REP · Reportes y tableros | 62 | 47 | 0 | 15 |

"Sin criterio" no es un hueco para la v1 salvo en los módulos con parte en la v1 (PRS, ENT, PRV, GAR, NOT-base); para los demás se cierra al activar el módulo (D-076.4). Para esos cinco, el Analista y su escuadrón deben citar el criterio de cada regla antes de la etapa del módulo.

## Requisitos cuyo criterio no los prueba de verdad

| Requisito | Etapa | Criterio citado | Qué falta probar | Debe estar cerrado | Responsable |
|---|---|---|---|---|---|
| RF-ENT-002 | E4 | CA-ENT-01 | CA-ENT-01 no prueba el borrador automático (salir y volver sin perder lo capturado; no reserva equipos; el borrador sin efecto se puede borrar). «Sin hacer» del Analista al 2026-10-29. | Antes de la Etapa 4 (D-076.3) | Analista (escuadrón D); QA propone texto |
| RF-ENT-016 | E4 | CA-ENT-01 | CA-ENT-01 no prueba renovar un préstamo (nueva fecha con motivo y auditoría). «Sin hacer» del Analista al 2026-10-29. | Antes de la Etapa 4 | Analista (escuadrón D); QA propone texto |
| RF-OC-048 | E5 | CA-055, CA-102 | CA-102 prueba el aviso «posible compra fraccionada» con datos (3.000,00 y 2.500,00 con el mismo proveedor, 20 días, límite 5.000,00). Falta el informe mensual «sin respaldo de compra»: no tiene criterio porque el requisito sigue en P-018 (qué registros entran y dónde lo ve quien aprueba). Además CA-102 no fija los bordes: suma igual al límite y compra exactamente a los 30 días. QA supone «solo avisa si la suma supera el límite» (como CA-055) y 30 días corridos con el día 30 incluido; el Analista debe confirmarlo. | Antes de la Etapa 5 (P-018) | Analista; responde P-018 el Gerente de TI |
| RF-OC-028 | E7 | CA-024 | Es de la Etapa 7 (decisión P-009 del Gerente de TI) y su único criterio corre en la Etapa 4. En la v1 solo vale «la baja con motivo y la auditoría la cubren», que sí prueba CA-024; la decisión de la Etapa 7 no tiene criterio. «Sin hacer» del Analista al 2026-10-29. | Antes de la Etapa 7 (P-009) | Analista; QA propone un criterio documental |

**Citas mal apuntadas o incompletas** (el criterio existe, pero la fila debe citar otro o agregar uno):

| Requisito | Cita actual | Observación |
|---|---|---|
| RF-CAT-008 | CA-017 | CA-017 prueba que un prefijo reservado como `OC` se rechaza, pero no nombra `ACTV` (D-079). El caso `ACTV` solo lo prueba CA-094a, que corre en la Etapa 4, aunque RF-CAT-008 es de la Etapa 2 y se puede probar entera cuando existen las categorías. QA ejecuta el caso `ACTV` en la Etapa 2; falta que CA-017 nombre `ACTV` y que RF-CAT-008 cite CA-094a. |
| RF-GAR-006 | CA-GAR-04e | CA-GAR-04e prueba corregir con motivo. La segunda mitad («una ampliación es una garantía nueva») la prueba CA-GAR-04f, en Fase 2, porque necesita varias garantías por activo (RF-GAR-004). La fila debe citar CA-GAR-04f o decir que esa mitad es de Fase 2. |
| RF-OC-027 | CA-011a | Lo cubre la matriz de permisos de CA-011a (fila de proveedores, PS-37). Aceptable; no hace falta criterio propio. |

**Reglas cuyo criterio no las prueba del todo:**

| Regla | Observación |
|---|---|
| RN-023 | CA-094a y CA-094b prueban el código y su contador; el acta lleva código y serie (CA-046). La cláusula «el correo de un aviso de garantía trae el código y no la serie» (CA-094c) necesita los avisos de garantía (Fase 2). En la v1 los correos (invitación, acceso, aprobación) no llevan activo: la regla se prueba por completo al activar GAR-B. |
| RN-021 | CA-063 y CA-072 prueban el costo del activo en la v1 (el de la recepción). El libro único y `fuente_costo` son de Fase 3 (CA-PRE-14). |
| RN-024 | En la v1 se prueban la anonimización manual (CA-095a a 095g) y el archivado de la auditoría (CA-095h, CA-095i). «Toda rutina de anonimización o de purga consulta la congelación» (CA-095j) está en Fase 2, pero la v1 ya tiene rutinas: anonimización de contactos de proveedor (CA-092, Etapa 2), anonimización automática de Personas con la bandera de pruebas (Etapa 2), filas de importación en preparación a los 7 días (RF-DAT-004, Etapa 4) y purga de eventos de seguridad a los 12 meses (Etapa 7). Ninguna se prueba con congelación hasta Fase 2. |

## Módulos: cobertura de sus requisitos

| Módulo | RF y RNF | Cubiertos | Cubiertos por cabecera | No probados de verdad | Verificar | Sin criterio |
|---|---|---|---|---|---|---|
| ASI · Asistente de IA (en redacción) | 60 | 49 | 7 | 0 | 0 | 4 |
| CMD · CMDB ligera | 29 | 26 | 0 | 0 | 0 | 3 |
| DOM · Dominios y certificados | 26 | 25 | 0 | 0 | 1 | 0 |
| ENT · Entregas y devoluciones | 26 | 15 | 2 | 2 | 0 | 7 |
| GAR · Garantías y mantenimiento | 39 | 30 | 0 | 0 | 0 | 8 |
| CAM · Gestión de cambios | 30 | 30 | 0 | 0 | 0 | 0 |
| PRB · Gestión de problemas | 26 | 26 | 0 | 0 | 0 | 0 |
| INT · Integraciones y API | 34 | 34 | 0 | 0 | 0 | 0 |
| LIC · Licencias de software | 28 | 26 | 0 | 0 | 2 | 0 |
| LIN · Líneas móviles | 30 | 29 | 0 | 0 | 1 | 0 |
| AYU · Mesa de ayuda | 57 | 48 | 4 | 0 | 0 | 5 |
| NOT · Notificaciones | 44 | 34 | 2 | 0 | 0 | 8 |
| ONB · Onboarding y offboarding | 23 | 16 | 2 | 0 | 0 | 5 |
| PRS · Personas y ubicaciones | 26 | 17 | 1 | 0 | 0 | 8 |
| POR · Portal de autoservicio | 25 | 17 | 3 | 0 | 0 | 5 |
| PRE · Presupuesto y costos | 34 | 31 | 0 | 0 | 3 | 0 |
| PRV · Proveedores y contratos | 37 | 28 | 0 | 0 | 1 | 8 |
| REP · Reportes y tableros | 32 | 30 | 0 | 0 | 2 | 0 |

**RNF sin criterio en los módulos con parte en la v1 (39):** RNF-ENT-001, RNF-ENT-002, RNF-ENT-004, RNF-ENT-005, RNF-ENT-006, RNF-ENT-007, RNF-ENT-009, RNF-GAR-001, RNF-GAR-002, RNF-GAR-003, RNF-GAR-004, RNF-GAR-005, RNF-GAR-006, RNF-GAR-007, RNF-GAR-008, RNF-NOT-001, RNF-NOT-002, RNF-NOT-003, RNF-NOT-004, RNF-NOT-006, RNF-NOT-008, RNF-NOT-009, RNF-NOT-010, RNF-PRS-001, RNF-PRS-002, RNF-PRS-003, RNF-PRS-004, RNF-PRS-005, RNF-PRS-006, RNF-PRS-007, RNF-PRS-008, RNF-PRV-001, RNF-PRV-002, RNF-PRV-003, RNF-PRV-004, RNF-PRV-005, RNF-PRV-006, RNF-PRV-007, RNF-PRV-008. Ninguna fila ni criterio los cita (H-QA-27 sigue abierto en los módulos). Hasta que el escuadrón los cite, QA los prueba con el criterio del núcleo que corresponda (CA-050a de accesibilidad y rendimiento, CA-053, CA-001 de aislamiento) y lo anota aquí.

Los requisitos de módulos con estado "verificar": RF-LIC-017, RF-PRV-009, RF-REP-005, RNF-DOM-001, RNF-LIC-004, RNF-LIN-003, RNF-PRE-002, RNF-PRE-005, RNF-PRE-007, RNF-REP-008.

## Matriz de requisitos del núcleo

Etapas: E0 a E7 son las de la v1; F2 y F3 son fases posteriores. "Criterio (corre en)" muestra dónde corre cada criterio citado; "completa" es la etapa en que termina.

| ID | Requisito (resumido) | Etapa | Criterio (corre en) | Estado | Observación |
|---|---|---|---|---|---|
| RF-ACC-001 | No hay registro abierto: solo entra quien tiene una invitación. | E1 | CA-006 (E1) | cubierto |  |
| RF-ACC-002 | Una empresa la crea el Administrador de plataforma (PS-01), que invita al primer administrador… | E1 | CA-015d (E1) | cubierto |  |
| RF-ACC-003 | Sirve cualquier correo (personal o corporativo), siempre con invitación. | E1 | CA-005 (E1) | cubierto |  |
| RF-ACC-004 | No existe la unión por dominio de correo, por búsqueda de empresa ni por código público. | E1 | CA-006 (E1) | cubierto |  |
| RF-ACC-005 | Se entra con un enlace que llega al correo. No hay contraseñas en la v1. | E1 | CA-006 (E1) | cubierto |  |
| RF-ACC-006 | El enlace de acceso dura 15 minutos y sirve una sola vez. Abre una página con el botón "Entrar… | E1 | CA-068 (E1) | cubierto |  |
| RF-ACC-007 | Las invitaciones vencen a los 7 días, se usan una sola vez, quedan ligadas al correo al que se… | E1 | CA-005 (E1) | cubierto |  |
| RF-ACC-008 | Quien invita no puede dar un rol con más permisos que el suyo. | E1 | CA-010 (E1) | cubierto |  |
| RF-ACC-009 | Si el correo invitado ya tiene cuenta, la empresa se suma a la misma cuenta solo cuando la per… | E1 | CA-005 (E1) | cubierto |  |
| RF-ACC-010 | Los correos se guardan y comparan sin distinguir mayúsculas (comparación Unicode, sin quitar p… | E1 | CA-005 (E1) | cubierto |  |
| RF-ACC-011 | La cuenta es global y mínima. Todo lo que se hace en una empresa queda a nombre de la membresí… | E1 | CA-004 (E1) | cubierto |  |
| RF-ACC-012 | La empresa activa va en la dirección de la página (/e/{empresa}/...) y en cada acción. El serv… | E1 | CA-004 (E1), CA-079 (E1) | cubierto |  |
| RF-ACC-013 | La segunda verificación (aplicación autenticadora, sin SMS) es obligatoria a toda membresía qu… | E1 | CA-007 (E1), CA-081 (E1) | cubierto |  |
| RF-ACC-014 | Las sesiones vencen a los 30 minutos sin actividad y a las 12 horas en total. A los 25 minutos… | E1 | CA-069 (E1, completa E4) | cubierto |  |
| RF-ACC-015 | Existe "cerrar sesión en todos los dispositivos". | E1 | CA-008 (E1) | cubierto |  |
| RF-ACC-016 | Suspender o dar de baja a alguien en una empresa corta sus sesiones en esa empresa al instante. | E1 | CA-008 (E1) | cubierto |  |
| RF-ACC-017 | Tras 5 intentos fallidos la espera crece: 1, 2, 5 y 15 minutos. Los tiempos de respuesta son i… | E1 | CA-006 (E1) | cubierto |  |
| RF-ACC-018 | Recuperación de acceso: como no hay contraseña, se pide un enlace nuevo. Cada persona con segu… | E1 | CA-082 (E1) | cubierto |  |
| RF-ACC-019 | Si una empresa pierde a su único administrador (o este pierde factor y códigos), lo recupera e… | E1 | CA-015c (E1) | cubierto |  |
| RF-ACC-020 | Al crear una empresa se recomienda tener al menos dos administradores; el sistema lo avisa. | E1 | CA-009 (E1) | cubierto |  |
| RF-ACC-021 | Correos de la v1 (NOT-base): invitación, enlace de acceso, aviso a quien aprueba cuando hay un… | E1 a E5 | CA-074 (E1, completa E5), CA-NOT-01 (E5), CA-NOT-20 (E5) | cubierto |  |
| RF-ACC-022 | Una empresa suspendida por la plataforma no permite entrar a ninguno de sus usuarios; sus dato… | E1 | CA-015d (E1) | cubierto |  |
| RF-ACC-023 | Al primer ingreso se pide aceptar el aviso de privacidad y los términos; quedan registradas la… | E1 | CA-049 (E1) | cubierto |  |
| RF-ACC-024 | Las acciones delicadas (ver clave de licencia, exportar, importar, administrar roles y usuario… | E1 | CA-007 (E1) | cubierto |  |
| RF-ACC-025 | Hay pantallas de "Primeros pasos" (para el administrador de una empresa nueva), "Mi cuenta y s… | E1 | CA-050b (E1, completa E5), CA-093 (E2) | cubierto |  |
| RF-ACC-026 | Un correo de invitación enviado a un buzón con filtro no se gasta: el enlace de ingreso exige… | E1 | CA-068 (E1) | cubierto |  |
| RF-PLA-001 | Existe el rol Administrador de plataforma, fuera de cualquier empresa. Son 2 a 3 personas del… | E1 | CA-007 (E1), CA-015f (E1) | cubierto |  |
| RF-PLA-002 | Puede crear, suspender y reactivar empresas (PS-01). Al crear una empresa define país, zona ho… | E1 | CA-015d (E1) | cubierto |  |
| RF-PLA-003 | Rescate de una empresa sin administrador (PS-02): lo hacen dos personas de plataforma; si solo… | E1 | CA-015c (E1) | cubierto |  |
| RF-PLA-004 | No ve los datos del negocio de las empresas (activos, compras, personas, precios). Lo impone l… | E1 | CA-015a (E1) | cubierto |  |
| RF-PLA-005 | Soporte (PS-03): solo lectura, una empresa y un motivo por vez, máximo 24 horas, autorizado po… | E1 | CA-015b (E1) | cubierto |  |
| RF-PLA-006 | Vive en una zona separada del sistema, con ruta, permisos y color propios. Nadie entra directo… | E1 | CA-015a (E1) | cubierto |  |
| RF-PLA-007 | Hay dos registros: el de plataforma (crear, suspender, rescatar, límites) y el de empresa (tod… | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-PLA-008 | No puede activar en nombre de una empresa el interruptor único de excepciones. | E5 | CA-070 (E5) | cubierto |  |
| RF-PLA-009 | Acceso de emergencia (PS-05): si el correo falla, emite un acceso excepcional de un solo uso a… | E1 | CA-015f (E1) | cubierto |  |
| RF-PLA-010 | Puede subir por un periodo corto los topes de una empresa (invitaciones, carga inicial) (PS-04… | E1 | CA-084 (E1) | cubierto |  |
| RF-PLA-011 | Contacto autorizado (D-065, S-34): lo registra el Administrador de plataforma al crear la empr… | E1 | CA-015e (E1) | cubierto |  |
| RF-PLA-012 | Veto durante el rescate (D-065, S-34): durante la espera de 24 horas de un rescate, cualquier… | E1 | CA-015e (E1) | cubierto |  |
| RF-PLA-013 | Cómo lee soporte los datos (D-039.10, S-34): la sesión de soporte usa una tabla global de auto… | E1 | CA-015b (E1), CA-015g (E1), CA-015h (E2), CA-015i (E1) | cubierto | CA-015g y CA-015i corren en la Etapa 1; CA-015h (sin secretos ni derechos) solo puede correr en la Etapa 2. La Etapa 1 se cierra sin esa mitad y debe quedar anotado. |
| RF-EMP-001 | Una empresa tiene país, zona horaria y moneda base desde la Etapa 1. Las monedas salen de una… | E1 | CA-071 (E1, completa E5) | cubierto |  |
| RF-EMP-002 | No se puede cambiar la moneda base de una empresa con órdenes abiertas ni con presupuestos apr… | E5 | CA-071 (E1, completa E5) | cubierto |  |
| RF-EMP-003 | Cambiar la zona horaria recalcula los avisos pendientes. | E1 | CA-071 (E1, completa E5) | cubierto |  |
| RF-EMP-004 | Cada empresa tiene un calendario de empresa compartido por los módulos (zona horaria, horario… | E1 | CA-071 (E1, completa E5) | cubierto |  |
| RF-EMP-005 | Módulos activables: el Administrador de la empresa activa o desactiva módulos en Configuración… | E1 | CA-075 (E1) | cubierto |  |
| RF-USR-001 | Un usuario tiene uno de estos estados en cada empresa: Invitado, Activo, Suspendido, Dado de b… | E1 | CA-052c (E2) | cubierto | el criterio corre en Etapa 2, después de la etapa del requisito |
| RF-USR-002 | Un usuario nunca se borra; se suspende o se da de baja. | E1 | CA-045 (E1, completa E5) | cubierto |  |
| RF-USR-003 | Suspender corta el acceso al instante y se puede revertir. Dar de baja a un usuario siempre se… | E1 | CA-052c (E2) | cubierto | el criterio corre en Etapa 2, después de la etapa del requisito |
| RF-USR-004 | Retirado (2026-10-25). Estaba duplicado con RF-PER-006; el bloqueo ya no es de la baja del usu… | - | - | retirado |  |
| RF-USR-005 | Las órdenes abiertas de un usuario dado de baja se reasignan o se cancelan con motivo. | E5 | CA-052d (E5) | cubierto |  |
| RF-USR-006 | Dar de baja no borra el historial. Los datos personales se anonimizan pasado el plazo de la se… | E1 | CA-045 (E1, completa E5), CA-054a (E2) | verificar | el criterio citado no lista este requisito en su cabecera |
| RF-USR-007 | Cada alta, suspensión, baja y cambio de rol queda en la auditoría. | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-USR-008 | Un usuario puede estar vinculado a una Persona (1 a 1, opcional). | E2 | CA-052c (E2) | cubierto |  |
| RF-ROL-001 | Cada usuario tiene un solo rol en cada empresa. El rol vive en la membresía: la misma persona… | E1 | CA-047 (E1) | cubierto |  |
| RF-ROL-002 | Hay siete plantillas de rol (Administrador, Jefatura TI, Técnico, Almacén, Solicitante, Solo l… | E1 | CA-047 (E1) | cubierto |  |
| RF-ROL-003 | Cada permiso tiene un alcance: "todo" o "propio". Qué es "propio" lo define un resolvedor por… | E1 | CA-011b (E1, completa E4) | cubierto |  |
| RF-ROL-004 | Existe un registro único de permisos (docs/registro-permisos.md) con PS-nn, nombre técnico mod… | E1 | CA-011a (E1, completa E2) | cubierto |  |
| RF-ROL-005 | Los permisos globales sensibles son uno solo de cada uno: ver datos personales (datos_personal… | E1 | CA-011b (E1, completa E4) | cubierto |  |
| RF-ROL-006 | Todo rol nuevo parte sin ningún permiso. | E1 | CA-047 (E1) | cubierto |  |
| RF-ROL-007 | Nadie puede darse permisos a sí mismo, ni crear o asignar un rol con más permisos de los que t… | E1 | CA-010 (E1) | cubierto |  |
| RF-ROL-008 | La empresa siempre tiene al menos un administrador activo (quien tiene administrar roles y cam… | E1 | CA-009 (E1) | cubierto |  |
| RF-ROL-009 | El rol Administrador de la plantilla incluye todos los permisos, pero la separación de funcion… | E1 | CA-012 (E5) | cubierto | el criterio corre en Etapa 5, después de la etapa del requisito |
| RF-ROL-010 | Todo permiso se comprueba en el servidor. Ocultar un botón en pantalla es comodidad, no seguri… | E1 | CA-011a (E1, completa E2) | cubierto |  |
| RF-ROL-011 | Un cambio de rol vale desde la siguiente acción de esa persona, sin esperar a que cierre sesió… | E1 | CA-008 (E1) | cubierto |  |
| RF-ROL-012 | Un rol con usuarios asignados no se puede eliminar; se reasignan primero o se desactiva el rol. | E1 | CA-047 (E1) | cubierto |  |
| RF-ROL-013 | Los cambios en roles y permisos quedan en la auditoría con valor anterior y nuevo. | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-ROL-014 | Una prueba automática falla si el código usa un permiso que no está en el registro, y QA gener… | E1 | CA-011a (E1, completa E2) | cubierto |  |
| RF-ROL-015 | Un módulo declara en el registro de módulo sus permisos, eventos, pendientes de la persona, pr… | E1 | CA-077 (E1, completa F2) | cubierto |  |
| RF-PER-001 | Existe el directorio de Personas (empleados, externos o custodios), distinto de los usuarios.… | E2 | CA-016a (E2), CA-016b (E4) | cubierto |  |
| RF-PER-002 | Datos mínimos de una Persona: nombre, tipo (Empleado, Externo, Custodio), código de empleado,… | E2 | CA-016a (E2) | cubierto |  |
| RF-PER-003 | No se guarda documento de identidad, dirección ni teléfono personal en la v1. | E2 | CA-016a (E2) | cubierto |  |
| RF-PER-004 | Una Persona se vincula 1 a 1 a una membresía (opcional); los datos personales viven en una tab… | E2 | CA-054a (E2) | cubierto |  |
| RF-PER-005 | Una Persona nunca se borra; se cesa (estado Cesada) y, pasado el plazo y con la confirmación d… | E2 | CA-052a1 (E2) | cubierto |  |
| RF-PER-006 | El cese nunca se bloquea por recursos. Activos, líneas, licencias, dominios y elementos que la… | E2 a E4 | CA-052a2 (E4), CA-052b2 (E4), CA-081b (E4) | cubierto |  |
| RF-PER-007 | Las órdenes abiertas de una Persona cesada se reasignan o se cancelan con motivo. | E5 | CA-052d (E5) | cubierto |  |
| RF-PER-008 | Las Personas son de cada empresa. El mismo nombre en dos empresas son dos registros independie… | E2 | CA-001 (E1, completa E2) | cubierto |  |
| RF-PER-009 | Ver una Persona y sus asignaciones con nombre es el permiso datos_personales.ver; sin él se ve… | E2 | CA-011b (E1, completa E4) | cubierto |  |
| RF-PER-010 | Las Personas se crean a mano (el alta manual puede crear homónimos, con aviso) desde la Etapa… | E2 a E4 | CA-016a (E2), CA-PRS-01d (E2), CA-PRS-11 (E4) | verificar | el criterio citado no lista este requisito en su cabecera |
| RF-PER-011 | Motivo de cese: lista corta sin texto libre (salida, fin de contrato, traslado, otro). | E2 | CA-052a1 (E2) | cubierto |  |
| RF-PER-012 | Registro de solicitudes de derechos sobre datos personales (fecha, quién la presenta, tipo, qu… | E2 | CA-076 (E2, completa F2), CA-093 (E2) | cubierto |  |
| RF-PER-013 | Anonimización manual solo para pedidos de derechos documentados, con dos personas (una propone… | E2 | CA-052b1 (E2), CA-054a (E2) | cubierto |  |
| RF-PER-014 | Anonimizar quita correo, código de empleado, puesto y datos de contacto, y reemplaza el nombre… | E2 | CA-054a (E2), CA-054b (E4) | cubierto |  |
| RF-CAT-001 | Marca, modelo (depende de una marca), proveedor, ubicación, área, tipo de puesto, centro de co… | E2 | CA-048 (E1, completa E4) | cubierto |  |
| RF-CAT-002 | El administrador puede crear catálogos nuevos sin ayuda técnica. Son listas simples y alimenta… | E2 | CA-020 (E3, completa E5) | cubierto | el criterio corre en Etapa 3, después de la etapa del requisito |
| RF-CAT-003 | Los catálogos son de cada empresa. No se comparten entre empresas. | E2 | CA-001 (E1, completa E2) | cubierto |  |
| RF-CAT-004 | Un valor de catálogo no se borra: se desactiva. Un valor inactivo no se puede elegir en regist… | E2 | CA-045 (E1, completa E5) | cubierto |  |
| RF-CAT-005 | La unidad de medida es un catálogo por empresa con la marca "admite decimales". No hay convers… | E2 | CA-032 (E5) | cubierto | el criterio corre en Etapa 5, después de la etapa del requisito |
| RF-CAT-006 | Ubicación jerárquica: tiene ubicación superior opcional, máximo 3 niveles (Sede, Piso, Sala),… | E2 | CA-060a (E2) | cubierto |  |
| RF-CAT-023 | Proveedor, ubicación y centro de costo pueden tener un código externo opcional (el de SAP, por… | E2 | CA-017 (E2, completa E3) | cubierto |  |
| RF-CAT-024 | El centro de costo tiene una Persona responsable opcional y es el único catálogo de centros (P… | E2 | CA-016a (E2) | cubierto |  |
| RF-CAT-025 | Proveedor ampliado (PRV-A): una sola tabla desde la Etapa 2, con identificación fiscal normali… | E2 | CA-017 (E2, completa E3) | cubierto |  |
| RF-CAT-026 | Los contactos de un proveedor son datos personales: tienen ciclo de vida (inactivo; se anonimi… | E2 | CA-092 (E2) | cubierto |  |
| RF-CAT-007 | Una categoría tiene nombre, prefijo para los códigos (LAP, CEL, PER, LIC) y naturaleza. | E2 | CA-017 (E2, completa E3) | cubierto |  |
| RF-CAT-008 | El prefijo tiene de 2 a 5 caracteres (letras o números, en mayúsculas), es único dentro de la… | E2 | CA-017 (E2, completa E3) | cita mal apuntada o incompleta | CA-017 prueba que un prefijo reservado como OC se rechaza, pero no nombra ACTV (D-079). El caso ACTV solo lo prueba CA-094a, que corre en la Etapa 4, aunque RF-CAT-008 es de la Etapa 2 y se puede pro… |
| RF-CAT-009 | Hay un solo nivel de subcategoría (Categoría > Subcategoría). La subcategoría usa el prefijo d… | E2 | CA-017 (E2, completa E3) | cubierto |  |
| RF-CAT-010 | La subcategoría hereda los campos y la naturaleza de la categoría principal y puede sumar camp… | E2 | CA-020 (E3, completa E5) | cubierto | el criterio corre en Etapa 3, después de la etapa del requisito |
| RF-CAT-011 | Cambiar el prefijo de una categoría no cambia los códigos de los SKU ya creados. | E2 | CA-019 (E3) | cubierto | el criterio corre en Etapa 3, después de la etapa del requisito |
| RF-CAT-027 | Naturaleza: equipo físico (por defecto: garantía, mantenimiento, depreciación, "activos vigent… | E2 | CA-064a (E2), CA-064b (E4) | cubierto |  |
| RF-CAT-012 | Cada categoría puede definir campos personalizados, que heredan todos sus SKU. Seis tipos: tex… | E2 | CA-020 (E3, completa E5), CA-065a (E2), CA-065b (E4) | cubierto |  |
| RF-CAT-013 | Cada campo es obligatorio u opcional. | E2 | CA-020 (E3, completa E5) | cubierto | el criterio corre en Etapa 3, después de la etapa del requisito |
| RF-CAT-014 | Cada campo declara a qué se aplica: al artículo (SKU) (RAM, disco, procesador) o a cada unidad… | E2 | CA-020 (E3, completa E5) | cubierto | el criterio corre en Etapa 3, después de la etapa del requisito |
| RF-CAT-015 | Los campos "a cada unidad" solo existen para SKU controlados por serie. En un SKU por cantidad… | E2 | CA-020 (E3, completa E5) | cubierto | el criterio corre en Etapa 3, después de la etapa del requisito |
| RF-CAT-016 | El servidor valida cada valor según la definición del campo (tipo, obligatorio, opción existen… | E2 | CA-020 (E3, completa E5) | cubierto | el criterio corre en Etapa 3, después de la etapa del requisito |
| RF-CAT-017 | Un campo que ya tiene datos no se borra: se desactiva. | E2 | CA-021 (E2) | cubierto |  |
| RF-CAT-018 | No se cambia el tipo de un campo que ya tiene datos. | E2 | CA-021 (E2) | cubierto |  |
| RF-CAT-019 | Un campo que se vuelve obligatorio no bloquea lo que ya existe: esos registros quedan marcados… | E2 | CA-021 (E2) | cubierto |  |
| RF-CAT-020 | Las opciones de una lista que estén en uso se desactivan, no se borran. | E2 | CA-021 (E2) | cubierto |  |
| RF-CAT-021 | Cada campo tiene un identificador interno estable; cambiarle el nombre no rompe los datos. | E2 | CA-021 (E2) | cubierto |  |
| RF-CAT-022 | Los campos de tipo número admiten decimales y pueden tener mínimo y máximo; los de fecha son d… | E2 | CA-020 (E3, completa E5) | cubierto | el criterio corre en Etapa 3, después de la etapa del requisito |
| RF-CAT-028 | Campo secreto: se guarda cifrado, aparte; no se busca; no aparece en historial (dice solo "cla… | E2 | CA-042 (E2, completa E4) | cubierto |  |
| RF-CAT-029 | El número de línea, mientras no exista el módulo de Líneas, es un campo opcional de la unidad… | E2 | CA-065a (E2), CA-065b (E4) | cubierto |  |
| RF-SKU-001 | Cada SKU tiene: código, nombre, categoría (o subcategoría), marca, modelo, unidad de medida, e… | E3 | CA-017 (E2, completa E3) | cubierto |  |
| RF-SKU-002 | El código es único dentro de la empresa, sin distinguir mayúsculas ni espacios (lap-0001 y LAP… | E3 | CA-017 (E2, completa E3) | cubierto |  |
| RF-SKU-003 | El código automático es el prefijo de la categoría más un correlativo con mínimo de 4 dígitos… | E3 | CA-018 (E3, completa E6) | cubierto |  |
| RF-SKU-004 | Un código no se reutiliza nunca, aunque el SKU se desactive. Pueden quedar saltos; lo que se g… | E3 | CA-018 (E3, completa E6) | cubierto |  |
| RF-SKU-005 | Escribir un código propio (por ejemplo el de SAP) es un permiso aparte. El código escrito a ma… | E3 | CA-019 (E3) | cubierto |  |
| RF-SKU-006 | El código no se edita cuando el SKU ya tiene movimientos o activos. | E3 | CA-019 (E3) | cubierto |  |
| RF-SKU-007 | No se puede cambiar el modo de control ni la categoría de un SKU que ya tiene activos o stock. | E3 | CA-022 (E3) | cubierto |  |
| RF-SKU-008 | Un SKU con serie siempre es de a 1 unidad. | E3 | CA-022 (E3) | cubierto |  |
| RF-SKU-009 | Un SKU por serie no acepta unidades sin serie, salvo que el SKU lo autorice expresamente. | E3 | CA-023 (E4) | cubierto | el criterio corre en Etapa 4, después de la etapa del requisito |
| RF-SKU-010 | Un SKU inactivo no se puede usar en órdenes nuevas; sigue visible en el historial. Desactivarl… | E3 | CA-061 (E5) | cubierto | el criterio corre en Etapa 5, después de la etapa del requisito |
| RF-SKU-011 | El SKU no tiene precio fijo: el precio vive en la línea de la orden de compra. | E3 | CA-032 (E5) | cubierto | el criterio corre en Etapa 5, después de la etapa del requisito |
| RF-SKU-012 | Desde un SKU se ven todas sus series, su stock por ubicación, sus órdenes de compra y su histo… | E3 | CA-048 (E1, completa E4) | cubierto |  |
| RF-SKU-013 | Licencias: no son un tipo especial. Una unidad de licencia controlada por serie tiene como ser… | E3 | CA-042 (E2, completa E4), CA-064b (E4) | cubierto |  |
| RF-SKU-014 | Ver la clave completa exige licencias.ver_clave (solo Administrador por defecto; la empresa pu… | E4 | CA-042 (E2, completa E4) | cubierto |  |
| RF-SKU-015 | En la v1 no se asigna cada puesto de una licencia a una persona; basta el total de puestos. | E3 | CA-020 (E3, completa E5) | cubierto |  |
| RF-SKU-016 | Un SKU puede tener un stock mínimo opcional. En la v1 es solo un dato: no genera avisos ni blo… | E3 | CA-020 (E3, completa E5) | cubierto |  |
| RF-INV-001 | Cada unidad se registra como un activo con: serie, SKU, estado, ubicación (siempre existe), re… | E4 | CA-024 (E4) | cubierto |  |
| RF-INV-002 | La serie es única por empresa y SKU, comparada sin distinguir mayúsculas ni espacios al inicio… | E4 | CA-023 (E4) | cubierto |  |
| RF-INV-003 | Si la serie ya existe en otro SKU de la misma empresa, se acepta con un aviso visible que dice… | E4 | CA-023 (E4) | cubierto |  |
| RF-INV-004 | Una unidad física es un solo registro para siempre. Nunca se crea un segundo registro con la m… | E4 | CA-028 (E4) | cubierto |  |
| RF-INV-005 | Serie dañada por Excel (D-072.2): el sistema la rechaza con aviso cuando (a) tiene notación ci… | E4 | CA-038c (E4), CA-065a (E2), CA-065b (E4) | cubierto |  |
| RF-INV-006 | Una serie vacía solo se acepta si el SKU lo autoriza (RF-SKU-009). | E4 | CA-023 (E4) | cubierto |  |
| RF-INV-007 | Corregir una serie ya registrada exige permiso y motivo; el historial guarda el valor anterior… | E4 | CA-036 (E5) | cubierto | el criterio corre en Etapa 5, después de la etapa del requisito |
| RF-INV-008 | Garantía (GAR-A): se captura la fecha de compra y los meses de garantía, o el fin directo; el… | E4 | CA-082b (E4) | cubierto |  |
| RF-INV-025 | Ingreso manual de un activo (reemplazos por garantía, donaciones, compras sin orden): permiso… | E4 | CA-059 (E4) | cubierto |  |
| RF-INV-026 | Corregir el costo o la moneda de un activo (activos del Excel) exige activos.corregir_costo (P… | E4 | CA-063 (E4) | cubierto |  |
| RF-INV-027 | Cambio de ubicación de un activo con serie es un movimiento propio ("cambio de ubicación") con… | E4 | CA-060b (E4) | cubierto |  |
| RF-INV-034 | Código visible del activo (D-079): cada activo recibe al crearse, por cualquier vía (recepción… | E4 | CA-094a (E4) | cubierto |  |
| RF-INV-009 | Los 5 estados son una lista cerrada. "Prestado" no es un estado; "En tránsito" no existe en la… | E4 | CA-058 (E4) | cubierto |  |
| RF-INV-010 | Las 25 combinaciones de la tabla se comprueban en el servidor, por una sola función, y con un… | E4 | CA-058 (E4) | cubierto |  |
| RF-INV-011 | El motivo es obligatorio en baja, extravío, reingreso, ajuste de stock, corrección de series y… | E4 | CA-024 (E4) | cubierto |  |
| RF-INV-012 | Abrir o cerrar una orden de servicio no cambia el estado del activo (regla única, fusiona la a… | E6 | CA-044 (E6, completa F2) | cubierto |  |
| RF-INV-033 | Evento único de estado (D-075 N-AUD-06): todo cambio de estado de un activo, incluida la baja,… | E4 | CA-101 (E4) | cubierto |  |
| RF-INV-028 | El estado Asignado exige responsable; En stock, Extraviado y De baja no lo tienen; En reparaci… | E4 | CA-058 (E4) | cubierto |  |
| RF-INV-029 | Un activo con la marca "pendiente de devolución" no cuenta como extraviado ni como robado en r… | E4 | CA-081b (E4) | cubierto |  |
| RF-INV-013 | Un activo se asigna a una Persona. No se asigna un activo De baja, Extraviado o ya asignado a… | E4 | CA-025 (E4) | cubierto |  |
| RF-INV-014 | Un equipo de uso compartido (una sala, un área) se asigna a una Persona custodio. | E4 | CA-025 (E4) | cubierto |  |
| RF-INV-015 | Cada asignación y devolución es una fila de historial: desde, hasta, estado en que se devuelve. | E4 | CA-025 (E4) | cubierto |  |
| RF-INV-016 | La constancia es un registro en el sistema (activo, serie, persona, fecha, estado en que se en… | E4 | CA-046 (E4) | cubierto |  |
| RF-INV-017 | La aceptación en pantalla del receptor y la subida del escaneo del acta quedan fuera de la v1. | E4 | CA-046 (E4) | cubierto |  |
| RF-INV-018 | Cada ingreso, asignación, traslado, reparación, baja, extravío y reingreso queda en el histori… | E4 | CA-024 (E4) | cubierto |  |
| RF-INV-024 | Una sola regla de estado, asignación y ubicación: (a) la asignación termina únicamente con una… | E4 | CA-025 (E4), CA-058 (E4) | cubierto |  |
| RF-INV-030 | Autoentrega: nadie puede entregarse un equipo a sí mismo, sin excepción ni siquiera para el Ad… | E4 | CA-079b (E4) | cubierto |  |
| RF-INV-031 | Hay un solo asistente "Entregar" y un solo diálogo "Cambiar estado", que reutilizan entregas,… | E4 | CA-024 (E4) | cubierto |  |
| RF-INV-032 | Almacén no entrega equipos por defecto; la empresa se lo puede conceder y entonces necesita ad… | E4 | CA-011b (E1, completa E4) | cubierto |  |
| RF-INV-019 | El stock se lleva por SKU y ubicación. Todo cambio es un movimiento: ingreso, salida, traslado… | E4 | CA-026 (E4) | cubierto |  |
| RF-INV-020 | El stock no puede quedar negativo, aunque dos personas saquen a la vez. | E4 | CA-026 (E4) | cubierto |  |
| RF-INV-021 | Las correcciones son ajustes con motivo obligatorio; nunca se edita el saldo. | E4 | CA-026 (E4) | cubierto |  |
| RF-INV-022 | El traslado entre ubicaciones es inmediato: sale de origen y entra a destino en el mismo acto.… | E4 | CA-027 (E4) | cubierto |  |
| RF-INV-023 | Las cantidades son enteras, salvo en las unidades de medida que admiten decimales. | E4 | CA-032 (E5) | cubierto | el criterio corre en Etapa 5, después de la etapa del requisito |
| RF-OC-001 | No existe un documento de "solicitud" aparte: la solicitud de compra es una orden en Borrador… | E5 | CA-029 (E5) | cubierto |  |
| RF-OC-002 | La orden se hace sobre SKU (cantidad y precio por línea), no sobre series. | E5 | CA-032 (E5) | cubierto |  |
| RF-OC-003 | La orden tiene número correlativo por empresa (OC-000042, mínimo 6 dígitos), que nunca se repi… | E5 | CA-018 (E3, completa E6) | cubierto |  |
| RF-OC-004 | Debe tener al menos una línea; cantidad mayor que 0; precio no negativo; el mismo SKU no se re… | E5 | CA-032 (E5) | cubierto |  |
| RF-OC-005 | Cada empresa define una moneda base. Cada orden lleva una moneda (código de 3 letras) y el imp… | E5 | CA-031 (E5) | cubierto |  |
| RF-OC-006 | El precio unitario se ingresa sin impuesto, con hasta 4 decimales. El impuesto es un porcentaj… | E5 | CA-072 (E5) | cubierto |  |
| RF-OC-007 | Cada orden puede indicar un centro de costo (opcional). | E5 | CA-032 (E5) | cubierto |  |
| RF-OC-008 | Una orden en Borrador creada por un Solicitante lleva SKU y cantidades; el precio lo completa… | E5 | CA-032 (E5) | cubierto |  |
| RF-OC-009 | "Emitida" solo cambia el estado; el sistema no envía correo al proveedor. Se ofrece una vista… | E5 | CA-078 (E5) | cubierto |  |
| RF-OC-010 | Una orden con cualquier recepción confirmada no cambia cantidad, precio ni proveedor; solo se… | E5 | CA-061 (E5) | cubierto |  |
| RF-OC-042 | Cada orden puede llevar una referencia externa opcional (por ejemplo el número de documento de… | E5 | CA-032 (E5) | cubierto |  |
| RF-OC-043 | Una orden no sale de Borrador si alguna línea no tiene precio. El precio 0 solo se acepta con… | E5 | CA-032 (E5) | cubierto |  |
| RF-OC-044 | Cada orden lleva un número de versión que parte en 1 y sube con cada reaprobación; entero que… | E5 | CA-030 (E5) | cubierto |  |
| RF-OC-045 | Redondeo: el subtotal de línea = cantidad × precio unitario, redondeado a los decimales de la… | E5 | CA-072 (E5) | cubierto |  |
| RF-OC-046 | Los números de documento (OC-, RCP-, OS-) usan el contador por empresa con clave propia, mínim… | E5 | CA-018 (E3, completa E6) | cubierto |  |
| RF-OC-011 | Las transiciones de la tabla se comprueban en el servidor y no hay otras. | E5 | CA-029 (E5) | cubierto |  |
| RF-OC-012 | Toda transición registra quién, cuándo y motivo. El motivo es obligatorio al rechazar, anular… | E5 | CA-037 (E5) | cubierto |  |
| RF-OC-013 | Una orden con recepción parcial no se anula: se cierra. | E5 | CA-037 (E5) | cubierto |  |
| RF-OC-014 | Cambiar precio, cantidad, proveedor o total de una orden Aprobada o Emitida la devuelve a Pend… | E5 | CA-030 (E5) | cubierto |  |
| RF-OC-015 | La aprobación tiene un solo nivel en la v1: cada empresa fija un monto límite en su moneda bas… | E5 | CA-031 (E5), CA-055 (E5, completa E6) | cubierto |  |
| RF-OC-016 | Con límite 0, toda orden con al menos una línea pasa por aprobación, también la que tiene toda… | E5 | CA-055 (E5, completa E6) | cubierto |  |
| RF-OC-017 | La medida de monto es el total con impuesto, en la moneda base, para todos los actos de dinero. | E5 | CA-055 (E5, completa E6) | cubierto |  |
| RF-OC-018 | Una orden en una moneda distinta de la base siempre pasa por aprobación. | E5 | CA-031 (E5) | cubierto |  |
| RF-OC-019 | El valor del monto límite, la moneda base y activar o desactivar la aprobación los configura c… | E5 | CA-031 (E5), CA-089 (E5) | cubierto |  |
| RF-OC-020 | Sin varios niveles ni reglas por tipo de orden en la v1. | E5 | CA-031 (E5) | cubierto |  |
| RF-OC-051 | Punto de extensión en la pantalla de aprobación: la pantalla de aprobación de la orden reserva… | E5 | CA-031 (E5), CA-104a (E5), CA-104b (E5) | cubierto |  |
| RF-OC-047 | Una función única requiereSegundaPersona(acto, monto, moneda) decide en todos los módulos; nin… | E5 | CA-055 (E5, completa E6) | cubierto |  |
| RF-OC-021 | Quien crea o edita una orden no puede aprobarla. | E5 | CA-012 (E5) | cubierto |  |
| RF-OC-022 | Nadie aprueba ni rechaza su propia solicitud. | E5 | CA-012 (E5) | cubierto |  |
| RF-OC-023 | Quien aprueba una orden no puede recibir la mercadería de esa misma orden. | E5 | CA-013 (E5) | cubierto |  |
| RF-OC-024 | Quien recibe la mercadería no puede haber creado ni aprobado esa orden. | E5 | CA-013 (E5) | cubierto |  |
| RF-OC-025 | Estas cuatro reglas las hace cumplir el servidor y valen para todos los roles, incluido el Adm… | E5 | CA-012 (E5) | cubierto |  |
| RF-OC-026 | Interruptor único de excepciones, desactivado por defecto, con ocho casillas (compras, recepci… | E5 | CA-014 (E5), CA-070 (E5), CA-097 (E5), CA-098 (E5) | cubierto |  |
| RF-OC-027 | Crear o modificar proveedores es un permiso distinto del de crear órdenes (solo Administrador… | E2 | CA-011a (E1, completa E2) | cubierto (lectura de QA) | Lo cubre la matriz de permisos de CA-011a (fila de proveedores, PS-37). Aceptable; no hace falta criterio propio. |
| RF-OC-028 | Dar de baja un activo de valor con una segunda persona queda fuera de la v1; la baja con motiv… | E7 | CA-024 (E4) | no probado de verdad | Es de la Etapa 7 (decisión P-009 del Gerente de TI) y su único criterio corre en la Etapa 4. En la v1 solo vale «la baja con motivo y la auditoría la cubren», que sí prueba CA-024; la decisión de la… |
| RF-OC-048 | Medidas complementarias: informe mensual "sin respaldo de compra" a quien aprueba; aviso infor… | E5 | CA-055 (E5, completa E6), CA-102 (E5) | no probado de verdad | CA-102 prueba el aviso «posible compra fraccionada» con datos (3.000,00 y 2.500,00 con el mismo proveedor, 20 días, límite 5.000,00). Falta el informe mensual «sin respaldo de compra»: no tiene crite… |
| RF-OC-029 | La recepción es un documento propio con líneas (RCP-000042). Una orden puede tener varias rece… | E5 | CA-033 (E5) | cubierto |  |
| RF-OC-030 | No se puede recibir más de lo pendiente. Los sobrantes se manejan fuera de la orden. Mercaderí… | E5 | CA-034 (E5) | cubierto |  |
| RF-OC-031 | En un SKU con serie, confirmar exige que la cantidad de series capturadas sea igual a la canti… | E5 | CA-034 (E5) | cubierto |  |
| RF-OC-032 | Una recepción confirmada por error se puede revertir con un movimiento contrario y motivo (per… | E5 | CA-062 (E5), CA-036 (E5) | cubierto |  |
| RF-OC-033 | Confirmar es todo o nada: si una serie falla, no se crea ningún activo. Un doble clic en "Conf… | E5 | CA-034 (E5), CA-035 (E5) | cubierto |  |
| RF-OC-034 | Dos personas recibiendo la misma orden a la vez no pueden pasarse de lo pendiente. | E5 | CA-035 (E5) | cubierto |  |
| RF-OC-035 | Al confirmar, los activos se crean en el inventario con su costo y moneda. En un SKU por serie… | E5 | CA-033 (E5), CA-094b (E5) | cubierto |  |
| RF-OC-036 | Al recibir se indica la ubicación de ingreso. Ubicación, fecha de compra y garantía se piden u… | E5 | CA-033 (E5) | cubierto |  |
| RF-OC-037 | Las series se pueden pegar en lista (una por línea, o separadas por coma o espacio), teclear o… | E5 | CA-034 (E5) | cubierto |  |
| RF-OC-038 | La validación es inmediata y con texto claro: "repetida en la fila 12", "ya existe en el SKU X… | E5 | CA-034 (E5) | cubierto |  |
| RF-OC-039 | Los campos "a cada unidad" (IMEI) se piden en la misma tabla, pero se pueden completar después. | E5 | CA-020 (E3, completa E5) | cubierto |  |
| RF-OC-040 | Antes de confirmar hay un resumen ("Se crearán 38 activos de LAP-0001 en Bodega Central. Falta… | E5 | CA-033 (E5) | cubierto |  |
| RF-OC-041 | Nunca se borra una recepción ni un activo. | E5 | CA-045 (E1, completa E5) | verificar | el criterio citado no lista este requisito en su cabecera |
| RF-OC-049 | El borrador de recepción no reserva la cantidad, vale 7 días, lo retoma cualquiera con permiso… | E5 | CA-061 (E5), CA-103 (E5) | cubierto | CA-103 prueba el borrador sin cambios posteriores. El caso con cambios (¿7 días desde la creación o desde el último cambio?) espera a P-019. |
| RF-OC-050 | Se puede recibir contra una orden ya emitida aunque el SKU o el proveedor se desactive después… | E5 | CA-061 (E5) | cubierto |  |
| RF-OS-001 | Una solicitud de trabajo es una orden de servicio en estado Creada. | E6 | CA-044 (E6, completa F2) | cubierto |  |
| RF-OS-002 | Se registra "Pedido por", el tipo de servicio, el activo relacionado (opcional) y a quién se a… | E6 | CA-044 (E6, completa F2) | cubierto |  |
| RF-OS-003 | Los tipos de servicio son un catálogo configurable. Partida: Reparación, Instalación y Servici… | E6 | CA-044 (E6, completa F2) | cubierto |  |
| RF-OS-004 | Quien ejecuta puede ser una persona de la empresa o un proveedor del catálogo (dos destinos di… | E6 | CA-044 (E6, completa F2) | cubierto |  |
| RF-OS-005 | La orden tiene número correlativo por empresa (OS-000042) que nunca se repite. | E6 | CA-018 (E3, completa E6) | cubierto |  |
| RF-OS-006 | Una orden puede cancelarse antes de cerrar. Una orden cerrada no se reabre: se crea una nueva. | E6 | CA-044 (E6, completa F2) | cubierto |  |
| RF-OS-007 | Retirado (fusionado en RF-INV-012, D-075 H-AUD-23). Abrir o cerrar la orden no cambia el estad… | - | - | retirado |  |
| RF-OS-008 | La aprobación de una orden con costo sigue la regla única RN-017 (si supera el límite, otra pe… | E6 | CA-055 (E5, completa E6) | cubierto |  |
| RF-OS-009 | Si el activo relacionado se da de baja, la orden abierta sigue su curso y muestra el aviso; no… | E6 | CA-044 (E6, completa F2) | cubierto |  |
| RF-OS-010 | Costo: la orden guarda costo real, moneda, proveedor, centro de costo y la marca "cubierta por… | E6 | CA-044 (E6, completa F2) | cubierto |  |
| RF-OS-011 | Si el módulo de mantenimiento está activo, una orden de servicio tiene un vínculo 1 a 1 con el… | F2 | CA-044 (E6, completa F2) | cubierto |  |
| RF-IMP-001 | La importación entra en la v1 para cargar el inventario actual. Hay un solo marco (plantilla d… | E4 | CA-038a (E4) | cubierto |  |
| RF-IMP-002 | Pasos: plantilla con columnas fijas, subir, vista previa con el error de cada fila (número de… | E4 | CA-038a (E4) | cubierto |  |
| RF-IMP-003 | Todo o nada por lote: si hay una fila con error, no se carga nada hasta corregir. El usuario d… | E4 | CA-038a (E4) | cubierto |  |
| RF-IMP-004 | Archivo ya importado: un archivo ya confirmado (huella SHA-256 por empresa, lote confirmado y… | E4 | CA-056 (E4) | cubierto |  |
| RF-IMP-005 | Claves naturales: activo = SKU + serie normalizada; stock = un solo saldo inicial por SKU + ub… | E4 | CA-056 (E4) | cubierto |  |
| RF-IMP-006 | Deshacer = anular, nunca borrar: las filas pasan a un estado final "Anulado por lote deshecho"… | E4 | CA-038b (E4) | cubierto |  |
| RF-IMP-007 | Orden de dependencias: catálogos, Personas, SKU, activos, saldos. SKU y valores desconocidos (… | E4 | CA-038a (E4) | cubierto |  |
| RF-IMP-008 | El stock inicial por cantidad entra como movimiento "saldo inicial" por ubicación. | E4 | CA-038d (E4) | cubierto |  |
| RF-IMP-009 | Los textos libres de estado del Excel se asocian a los 5 estados del activo en la vista previa… | E4 | CA-038d (E4) | cubierto | Los textos de estado que usa el Excel real se definen con P-007: hasta entonces CA-038d prueba con EN STOCK,  en reparación  y Chatarra supuestos. |
| RF-IMP-010 | Formato: fechas dd/mm/aaaa o número de serie de Excel (otro formato es error de fila). La plan… | E4 | CA-038c (E4) | cubierto | CA-038c prueba fechas y series dañadas; ningún criterio prueba que la plantilla trae las columnas costo, moneda, fecha de compra, fin de garantía directo o meses, y centro de costo. QA lo cubre con u… |
| RF-IMP-011 | Seguridad de la lectura: solo .xlsx y .csv, sin evaluar fórmulas ni entidades externas, con lí… | E4 | CA-039 (E4) | cubierto |  |
| RF-IMP-012 | Retirado (2026-10-25). El archivo original no se guarda (D-050.6): se leen las filas, se guard… | - | - | retirado |  |
| RF-IMP-013 | Importar es el permiso sensible datos.importar, activado solo para el Administrador. | E4 | CA-011b (E1, completa E4) | cubierto |  |
| RF-IMP-014 | La empresa de destino sale de la sesión; si el archivo trae una columna de empresa, se ignora. | E4 | CA-039 (E4) | cubierto |  |
| RF-IMP-015 | Topes: 5.000 filas y 10 MB por archivo, 10 importaciones por día por empresa en total entre mó… | E4 | CA-039 (E4), CA-099 (E4) | cubierto |  |
| RF-IMP-016 | Una importación queda como una entrada de lote en la auditoría más el detalle en su propia tab… | E4 | CA-041 (E1, completa E4), CA-100 (E4) | cubierto |  |
| RF-IMP-017 | El Excel real se entrega con los nombres de personas reemplazados (P-002). Es una condición de… | E0 | CA-105 (E0) | cubierto | CA-105 es una verificación documental y no se puede ejecutar hasta que el Cliente (CEO) entregue los documentos reales (P-002). |
| RF-IMP-018 | Las invitaciones masivas del portal van por persona, no todo o nada; la pantalla lo dice. | F3 | CA-057 (F3) | cubierto |  |
| RF-EXP-001 | Toda exportación pasa por una puerta única del núcleo. Ningún módulo exporta por su cuenta. Ex… | E2 | CA-067 (E2) | cubierto |  |
| RF-EXP-002 | Antes de exportar: confirmación con motivo, vista de filas y de columnas sensibles. Las column… | E2 | CA-067 (E2) | cubierto |  |
| RF-EXP-003 | Límites: 10 exportaciones por usuario por hora, 100 por empresa por día, 50.000 filas; más de… | E2 | CA-067 (E2) | cubierto |  |
| RF-EXP-004 | El archivo trae una hoja "Aviso" con quién lo generó, cuándo y que contiene datos personales.… | E2 | CA-067 (E2) | cubierto |  |
| RF-EXP-005 | Las celdas de texto que empiezan con =, +, -, @, tabulador o retorno se exportan como texto; l… | E2 | CA-043 (E2) | cubierto |  |
| RF-EXP-006 | "Exportar" se muestra siempre; sin permiso aparece desactivado con la razón escrita. | E2 | CA-043 (E2) | cubierto |  |
| RF-EXP-007 | Las exportaciones grandes corren en segundo plano con avance y se entregan por una descarga co… | E2 | CA-043 (E2) | cubierto |  |
| RF-AUD-001 | La auditoría solo se agrega: no se edita ni se borra desde la aplicación, ni siquiera por el A… | E1 | CA-040a (E1) | cubierto |  |
| RF-AUD-002 | Se escribe en la misma operación que el cambio: si el cambio ocurre, la auditoría existe; si f… | E1 | CA-040a (E1) | cubierto |  |
| RF-AUD-003 | Cada entrada guarda: quién (la membresía), cuándo, qué empresa, qué registro, qué acción, valo… | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-AUD-004 | Se registran como mínimo: altas, cambios (con antes y después), aprobaciones, rechazos, anulac… | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-AUD-005 | También se registran: invitaciones, cambios de empresa activa, importaciones, exportaciones, a… | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-AUD-006 | No guarda contraseñas, enlaces de acceso, claves de licencia ni más datos personales de los ne… | E1 | CA-042 (E2, completa E4) | cubierto | el criterio corre en Etapa 2, después de la etapa del requisito |
| RF-AUD-007 | Ven la auditoría el Administrador y Jefatura TI por defecto (permiso sensible auditoria.ver, q… | E1 | CA-011b (E1, completa E4) | cubierto |  |
| RF-AUD-008 | La auditoría es distinta del historial de un activo: el historial dice qué pasó con el activo;… | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-AUD-009 | "Registro importante" significa todo lo listado en RF-AUD-004 y RF-AUD-005. | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-AUD-010 | Eventos de seguridad aparte: los intentos rechazados por empresa ajena o por falta de permiso,… | E1 | CA-066 (E1), CA-002 (E1) | cubierto |  |
| RF-AUD-011 | Nada con historial se borra. Lo que tiene historia se desactiva, se anula o se da de baja, con… | E1 | CA-045 (E1, completa E5) | cubierto |  |
| RF-AUD-012 | Los identificadores internos que se ven en la dirección web no son consecutivos ni adivinables… | E1 | CA-001 (E1, completa E2) | cubierto |  |
| RF-AUD-013 | Cada entrada indica el tipo de autor, con tres valores: membresía (usuario), integración (prog… | E1 | CA-041 (E1, completa E4) | cubierto |  |
| RF-AUD-014 | Campos personales: los datos personales (lista cerrada de la sección 18.2) viven solo en los r… | E1 | CA-054a (E2) | cubierto | el criterio corre en Etapa 2, después de la etapa del requisito |
| RF-AUD-015 | Anonimizar = sobrescribir los datos en el registro de Persona o de Usuario con una referencia;… | E2 | CA-054a (E2) | cubierto |  |
| RF-AUD-016 | Lo que en la auditoría pueda ser dato personal indirecto (como la IP) se conserva solo hasta q… | E7 | CA-054c (E7), CA-095h (E7) | cubierto | CA-095h prueba el archivado de la auditoría vencida con una empresa congelada. La purga de los eventos de seguridad a los 12 meses (tabla 18.1, mismo proceso de mantenimiento) no tiene criterio. |
| RF-AUD-017 | Dos registros: el de plataforma y el de empresa. Todo acceso de soporte aparece en la auditorí… | E1 | CA-015b (E1) | cubierto |  |
| RF-AUD-018 | Copia externa de la auditoría: solo de agregar, inmutable y encadenada (cada archivo lleva la… | E7 | CA-040b (E7) | cubierto |  |
| RF-AUD-019 | La auditoría de un lote de importación es una entrada de lote con el detalle en su propia tabl… | E4 | CA-041 (E1, completa E4) | cubierto |  |
| RF-DAT-001 | No se guardan documento de identidad, dirección ni teléfono personal en la v1, salvo decisión… | E2 | CA-016a (E2) | cubierto |  |
| RF-DAT-002 | Auditoría: 5 años. [ESCALAR AL CEO] confirmar con legal (L-04). | E7 | CA-040b (E7) | cubierto |  |
| RF-DAT-003 | Datos personales de una Persona o usuario dado de baja o cesado: 2 años; luego se anonimiza (s… | E7 | CA-054c (E7) | cubierto |  |
| RF-DAT-004 | Archivos de importación: el archivo original no se guarda (RF-IMP-012). Las filas en preparaci… | E4 | CA-056 (E4) | cubierto |  |
| RF-DAT-005 | Respaldos (D-032, a confirmar con legal): diarios durante 30 días y uno mensual durante 12 mes… | E7 | CA-054c (E7) | cubierto |  |
| RF-DAT-006 | Constancias de entrega y devolución: el plazo de 5 años (regla provisional D-033) corre desde… | E4 | CA-046 (E4) | cubierto |  |
| RF-DAT-007 | Debe poder atenderse una solicitud de acceso, corrección o eliminación de datos personales y e… | E7 | CA-076 (E2, completa F2) | cubierto |  |
| RF-DAT-016 | Registro de anonimizaciones: una lista aparte que guarda solo el identificador y la fecha de c… | E2 | CA-054a (E2) | cubierto |  |
| RF-DAT-008 | Los datos personales no aparecen en mensajes de error ni en registros técnicos. | E1 | CA-073 (E1) | cubierto |  |
| RF-DAT-009 | Los datos personales de una empresa nunca se muestran a otra. Un administrador solo ve de un u… | E1 | CA-004 (E1) | cubierto |  |
| RF-DAT-010 | Ningún dato personal real en el repositorio ni en el entorno de pruebas. El Excel, la OC y la… | E0 | CA-073 (E1) | cubierto | el criterio corre en Etapa 1, después de la etapa del requisito |
| RF-DAT-011 | Excepción declarada (D-051): la copia del nombre y el área en el acta de entrega vive en colum… | E4 | CA-054b (E4) | cubierto |  |
| RF-DAT-012 | Correos con contenido mínimo: a una Persona sin Usuario o a una dirección sin verificar solo s… | E1 | CA-074 (E1, completa E5) | cubierto |  |
| RF-DAT-013 | Redacción por seguridad del núcleo (D-074.3, D-075 R-09): operación distinta de "retirar", con… | E4 | CA-091 (E4) | cubierto |  |
| RF-DAT-014 | Aviso de privacidad configurable: el texto para empleados lo entrega cada empresa; la platafor… | E1 | CA-049 (E1) | cubierto |  |
| RF-DAT-015 | Procedimiento ante una fuga de datos (D-059): líder del incidente = Especialista en Seguridad;… | E7 | CA-053 (E7) | cubierto |  |
| RF-DAT-017 | Congelación por incidente (D-080; procedimiento de incidentes, C.5.2): mientras dura la preser… | E2 a E7 | CA-095a (E2), CA-095b (E2), CA-095c (E2), CA-095d (E2), CA-095e (E2), CA-095f (E2), CA-095g (E2), CA-095h (E7), CA-095i (E7) | cubierto | CA-095f y CA-095g dependen de P-017: sin el permiso nuevo en el registro y sin saber si levantar exige una segunda persona de plataforma, solo se pueden probar los rechazos. La parte de rutinas de ot… |
| RNF-001 | El idioma de la plataforma es español y el trato es de "usted" en toda pantalla, portal y corr… | E1 | CA-050b (E1, completa E5) | cubierto |  |
| RNF-002 | Cada empresa tiene su zona horaria. Las fechas de garantía y vencimiento son fechas de calenda… | E1 | CA-046 (E4) | cubierto | el criterio corre en Etapa 4, después de la etapa del requisito |
| RNF-003 | Funciona en computador, tablet y celular. La recepción, la búsqueda, la entrega y la aprobació… | E4 | CA-050a (E1, completa E4) | cubierto |  |
| RNF-004 | Medible: WCAG nivel AA (contraste), pantalla de 360 px de ancho sin desplazamiento horizontal,… | E1 | CA-050a (E1, completa E4) | cubierto |  |
| RNF-005 | El lector de código de barras se soporta como entrada (escribe como teclado; el cursor salta a… | E5 | CA-034 (E5) | cubierto |  |
| RNF-006 | Toda lista tiene buscador, filtros (estado, ubicación, categoría) y exportación a Excel (secci… | E2 | CA-043 (E2) | cubierto |  |
| RNF-007 | Hay un buscador global agrupado por tipo (SKU, serie, activo, orden). Solo encuentra lo de la… | E4 | CA-048 (E1, completa E4) | cubierto |  |
| RNF-008 | El Inicio es una página de tarjetas que cada módulo aporta, con una tarjeta principal por rol… | E1 | CA-050b (E1, completa E5) | cubierto |  |
| RNF-009 | Los textos de error son claros y no muestran detalles internos ni datos personales. Existen tr… | E1 | CA-073 (E1) | cubierto |  |
| RNF-010 | Volumen de referencia (una sola cifra para todos los módulos): 100.000 activos por empresa, co… | E7 | CA-053 (E7) | cubierto |  |
| RNF-011 | Con el volumen de referencia, el 95 % de las listas y búsquedas responde en menos de 2 segundo… | E4 | CA-053 (E7) | cubierto | el criterio corre en Etapa 7, después de la etapa del requisito |
| RNF-012 | Disponibilidad: sin compromiso de funcionar 24 horas en la v1; los mantenimientos se avisan. | E7 | CA-053 (E7) | cubierto |  |
| RNF-013 | Toda acción importante muestra una confirmación. Son reversibles (D-072.3): el cambio de estad… | E4 | CA-069 (E1, completa E4), CA-090 (E4) | cubierto |  |
| RNF-014 | Respaldo automático diario y cifrado, con restauración probada antes de la Etapa 1, antes de c… | E7 | CA-053 (E7) | cubierto |  |
| RNF-015 | Cada despliegue tiene un plan de vuelta atrás escrito y ensayado con cronómetro. | E7 | CA-053 (E7) | cubierto |  |
| RNF-016 | Manual del usuario y del administrador al cierre de cada etapa; manual de operación (respaldo… | E7 | CA-053 (E7) | cubierto |  |
| RNF-017 | El costo de alojamiento, respaldos y soporte se estima en la Etapa 0. [ESCALAR AL CEO] (secció… | E0 | CA-053 (E7) | cubierto | el criterio corre en Etapa 7, después de la etapa del requisito |
| RNF-018 | Pasar a producción con datos reales lo aprueba el Cliente (CEO) tras la demo, con respaldo res… | E7 | CA-053 (E7) | cubierto |  |
| RNF-019 | Trabajos en segundo plano: importación, exportación hasta 50.000 filas y PDF masivo corren fue… | E1 | CA-077 (E1, completa F2) | cubierto |  |
| RNF-020 | Reloj de la plataforma: las pruebas pueden fijar y adelantar la fecha (solo en entornos de pru… | E1 | CA-077 (E1, completa F2) | cubierto |  |
| RNF-021 | Un solo programador reparte los trabajos diarios. Los eventos que protegen la integridad (libe… | E1 | CA-077 (E1, completa F2) | cubierto |  |
| RNF-022 | Una vigencia (contrato, garantía, dominio) se calcula al leer con la fecha y la zona horaria d… | F2 | CA-077 (E1, completa F2) | cubierto |  |
| RF-UX-001 | Mapa de navegación por perfil: 8 perfiles (Administrador, Jefatura TI, Técnico, Almacén, Solic… | E1 | CA-050b (E1, completa E5) | cubierto |  |
| RF-UX-002 | Inicio por tarjetas: cada módulo aporta tarjetas; cada rol tiene una principal (Almacén: "Por… | E1 | CA-050b (E1, completa E5) | cubierto |  |
| RF-UX-003 | Hay una sola bandeja "Mi trabajo" para el Técnico y una sola bandeja "Por aprobar" con pestaña… | E5 | CA-050b (E1, completa E5) | cubierto |  |
| RF-UX-004 | "Pedir ayuda": un solo botón. En la v1 crea la orden de servicio en estado Creada; en la Fase… | E6 | CA-080 (E6) | cubierto |  |
| RF-UX-005 | Pantallas sin dueño en el diseño: Primeros pasos, Módulos activos, Mi cuenta y seguridad, Auto… | E1 | CA-050b (E1, completa E5) | cubierto |  |
| RF-UX-006 | La ficha del activo tiene cabecera fija y siete pestañas condicionales (los nombres exactos lo… | E4 | CA-050b (E1, completa E5) | cubierto |  |
| RF-UX-007 | Catálogo de tres mensajes y tres bloqueos: mensajes "No encontrado", "No tiene permiso", "No s… | E1 | CA-048 (E1, completa E4) | cubierto |  |
| RF-UX-008 | Tres formas de dato oculto: la referencia (PRS-0042), el secreto enmascarado y la columna omit… | E1 | CA-011b (E1, completa E4), CA-042 (E2, completa E4) | verificar | el criterio citado no lista este requisito en su cabecera |
| RF-UX-009 | Un diálogo de motivo único para todas las acciones con motivo obligatorio. | E4 | CA-024 (E4) | cubierto |  |
| RF-UX-010 | Siete familias de color, cada una con texto e icono (no solo color), definidas en la guía visu… | E1 | CA-050a (E1, completa E4) | cubierto |  |
| RF-UX-011 | Una sola pantalla de Vencimientos, una de "Importar datos", un solo "Mi espacio", y la configu… | E4 | CA-050b (E1, completa E5) | cubierto |  |
| RF-UX-012 | Una lista "campo / oficina" para celular: buscar, ficha, entregar y devolver, recibir y captur… | E4 | CA-050a (E1, completa E4) | cubierto |  |

## Matriz de requisitos de los módulos con parte en la v1

Solo las filas con etapa de la v1 (E0 a E7). Las filas de Fase 2 y 3 se cierran al activar cada módulo y su matriz vive en el propio módulo.

| ID | Requisito (resumido) | Etapa | Criterio (corre en) | Estado | Observación |
|---|---|---|---|---|---|
| RF-ENT-001 | Asistente único "Entregar" (el botón de la ficha del activo lo abre con el equipo cargado; lo… | E4 | CA-ENT-01 (E4), CA-ENT-02 (E4), CA-ENT-03 (E4) | cubierto |  |
| RF-ENT-002 | Borrador automático de la entrega: se puede salir y volver sin perder lo capturado. No reserva… | E4 | CA-ENT-01 (E4) | no probado de verdad | CA-ENT-01 no prueba el borrador automático (salir y volver sin perder lo capturado; no reserva equipos; el borrador sin efecto se puede borrar). «Sin hacer» del Analista al 2026-10-29. |
| RF-ENT-003 | Acta de entrega en PDF: empresa, número ACT-E-NNNNNN, fecha y hora, Persona, quién entrega, eq… | E4 | CA-ENT-01 (E4), CA-ENT-12 (E4), CA-ENT-13 (E4) | cubierto |  |
| RF-ENT-004 | Devolución (modo del mismo asistente): la Persona (Activa o Cesada), los equipos que devuelve… | E4 | CA-ENT-04 (E4), CA-ENT-08 (E4) | cubierto |  |
| RF-ENT-005 | Acta de devolución en PDF ACT-D-NNNNNN con el mismo formato. | E4 | CA-ENT-12 (E4) | cubierto |  |
| RF-ENT-006 | Traspaso (tercer modo del asistente): equipos de la Persona A a la B en un solo acto atómico,… | E4 | CA-ENT-08 (E4) | cubierto |  |
| RF-ENT-008 | Reimprimir un acta; la copia lleva la marca "Reimpresión" con fecha y el mismo número. | E4 | CA-ENT-12 (E4) | cubierto |  |
| RF-ENT-009 | Anular un acta registrada por error, con motivo, si el equipo no tuvo movimientos posteriores. | E4 | CA-ENT-11 (E4) | cubierto |  |
| RF-ENT-010 | Registrar extravío o robo de un equipo asignado con el diálogo único "Cambiar estado" (tipo Ex… | E4 | CA-ENT-10 (E4) | cubierto |  |
| RF-ENT-012 | Historial por Persona: pestaña "Entregas y actas" de su ficha, con asignaciones vigentes y cer… | E4 | CA-ENT-01 (E4) | cubierto |  |
| RF-ENT-013 | Historial por activo: pestaña "Entregas y actas" de su ficha (Persona, desde, hasta, condición… | E4 | CA-ENT-01 (E4) | cubierto |  |
| RF-ENT-014 | Lista de actas con buscador y filtros (tipo, Persona, activo, fecha, estado, "préstamo vencido… | E4 | CA-ENT-07 (E4) | cubierto |  |
| RF-ENT-016 | Renovar un préstamo: nueva fecha prevista con motivo y auditoría. | E4 | CA-ENT-01 (E4) | no probado de verdad | CA-ENT-01 no prueba renovar un préstamo (nueva fecha con motivo y auditoría). «Sin hacer» del Analista al 2026-10-29. |
| RF-GAR-001 | Al recibir mercadería con serie o importar, capturar la garantía del fabricante una sola vez p… | E5 | CA-GAR-01b (E5), CA-GAR-01c (E5) | cubierto |  |
| RF-GAR-002 | Mostrar en la ficha del activo si está en garantía, con texto y fecha ("En garantía hasta 15/0… | E4 | CA-GAR-01a (E4) | cubierto |  |
| RF-GAR-003 | Filtro de activos "garantía vence en los próximos N días" y "sin garantía vigente". | E4 | CA-GAR-04c (E4), CA-GAR-04d (E4) | cubierto |  |
| RF-GAR-005 | Calcular el fin desde inicio y meses cuando no se escribe (regla del núcleo, RN-GAR-003). | E4 | CA-GAR-01a (E4), CA-GAR-15 (E4) | cubierto |  |
| RF-GAR-006 | Corregir fechas de una garantía con motivo; una ampliación es una garantía nueva. | E4 | CA-GAR-04e (E4) | cita mal apuntada o incompleta | CA-GAR-04e prueba corregir con motivo. La segunda mitad («una ampliación es una garantía nueva») la prueba CA-GAR-04f, en Fase 2, porque necesita varias garantías por activo (RF-GAR-004). La fila deb… |
| RF-GAR-008 | Estado calculado de cada garantía (Vigente, Vencida) y garantía efectiva (la efectiva distinta… | E4 | CA-GAR-04a (E4), CA-GAR-15 (E4) | cubierto |  |
| RF-NOT-001 | Existe un catálogo único de eventos <módulo>.<entidad>_<hecho>, mantenido por desarrollo y aco… | E1 | CA-NOT-12 (E1) | cubierto |  |
| RF-NOT-002 | Todo evento se escribe en la tabla única de eventos con identificador único; el mismo identifi… | E1 | CA-NOT-12 (E1) | cubierto |  |
| RF-NOT-003 | Los destinatarios se calculan al emitir el evento: miembro activo de la empresa del evento, co… | E1 | CA-NOT-03 (E1), CA-NOT-13 (E1) | cubierto |  |
| RF-NOT-004 | Quien provoca el evento no recibe aviso de su propia acción, salvo los eventos que declaran lo… | E5 | CA-NOT-01 (E5), CA-NOT-20 (E5) | cubierto |  |
| RF-NOT-007 | Canal "Correo": va al correo verificado del usuario con contenido mínimo y un enlace que exige… | E1 | CA-NOT-05a (E1), CA-NOT-20 (E5) | cubierto |  |
| RF-NOT-013 | Los eventos marcados "no se resume" (seguridad, caso P1, plazo vencido, aprobación pendiente)… | E1 | CA-NOT-01 (E5), CA-NOT-07a (E5), CA-NOT-20 (E5) | cubierto | el criterio corre en Etapa 5, después de la etapa del requisito |
| RF-NOT-015 | Hay una plantilla base por evento y canal, en español y tratando de "usted", mantenida por la… | E1 | CA-NOT-11 (F2) | cubierto | el criterio corre en Fase 2, después de la etapa del requisito |
| RF-NOT-017 | Las plantillas solo aceptan variables permitidas del evento; una no permitida se rechaza. | E1 | CA-NOT-11 (F2) | cubierto | el criterio corre en Fase 2, después de la etapa del requisito |
| RF-NOT-019 | Límites de envío por persona, por empresa y por plataforma, según el cuadro único de D-054 (RN… | E1 | CA-NOT-08 (E1, completa F2), CA-NOT-14 (E1) | cubierto |  |
| RF-NOT-020 | Cada intento de envío por correo queda en el registro de envíos con su estado. | E1 | CA-NOT-09 (E1, completa F2) | cubierto |  |
| RF-NOT-021 | Un fallo temporal se reintenta 3 veces (5 minutos, 30 minutos, 2 horas); luego queda "Fallido". | E1 | CA-NOT-10 (E1) | cubierto |  |
| RF-NOT-022 | Un correo con 3 rebotes definitivos seguidos se marca "no entregable", deja de recibir avisos… | E1 | CA-NOT-10 (E1) | cubierto |  |
| RF-NOT-028 | El Administrador de plataforma ve el estado del proveedor y totales por empresa, nunca destina… | E1 | CA-NOT-17 (E1) | cubierto |  |
| RF-NOT-031 | Capa única de envío con adaptador intercambiable y un segundo proveedor configurado; sin segui… | E1 | CA-NOT-10 (E1) | cubierto |  |
| RF-NOT-032 | El estado del correo es global y solo lo tocan dos funciones: consultar si es entregable y reg… | E1 | CA-NOT-10 (E1) | cubierto |  |
| RF-NOT-033 | Las invitaciones usan texto fijo sin campos libres, nunca dicen si el correo ya tiene cuenta,… | E1 | CA-NOT-18 (E1) | cubierto |  |
| RF-NOT-034 | Los enlaces de los correos llevan la empresa en la dirección (D-046), exigen sesión y, si la p… | E1 | CA-NOT-13 (E1) | cubierto |  |
| RNF-NOT-001 | Un mensaje obligatorio sale del servidor en menos de 30 segundos (percentil 95). | E1 | - | sin criterio |  |
| RNF-NOT-002 | Un aviso inmediato normal sale en menos de 2 minutos (percentil 95). | E1 | - | sin criterio |  |
| RNF-NOT-005 | Ningún aviso se duplica: 100 eventos con el mismo identificador generan 1 aviso. | E1 | - | cubierto por cabecera | CA-NOT-12 |
| RNF-NOT-006 | Una caída del proveedor no pierde avisos: se reintentan y, si fallan, quedan "Fallido" y en la… | E1 | - | sin criterio |  |
| RNF-NOT-007 | Cada tabla nueva tiene su prueba de aislamiento por identificador interno, y el proceso progra… | E1 | - | cubierto por cabecera | CA-NOT-15 |
| RNF-NOT-010 | Los correos se entienden sin jerga (prueba con 5 personas no técnicas) y las pruebas de entreg… | E1 | - | sin criterio |  |
| RF-PRS-001 | Crear una Persona con nombre completo, tipo (Empleado, Externo, Custodio), área y, opcionalmen… | E2 | CA-PRS-01a (E2), CA-PRS-01b (E2), CA-PRS-01d (E2), CA-PRS-02 (E2) | cubierto |  |
| RF-PRS-002 | Editar una Persona. La auditoría guarda qué campo cambió, sin el valor de nombre, correo, área… | E2 | CA-PRS-13 (E2) | cubierto |  |
| RF-PRS-003 | Lista con buscador (nombre, correo, referencia, código), filtros (estado, área, sede, tipo de… | E2 | CA-PRS-07 (E2) | cubierto |  |
| RF-PRS-004 | Ficha de la Persona con cabecera fija y pestañas: Resumen · Entregas y actas (ENT) · Pendiente… | E2 | CA-PRS-03a (E2) | cubierto |  |
| RF-PRS-005 | Cada Persona tiene una sola área (catálogo del núcleo, un nivel). Un área inactiva no se asign… | E2 | CA-PRS-01a (E2) | cubierto |  |
| RF-PRS-006 | El centro de costo de la Persona es opcional; si falta, rige el del área. El catálogo, su resp… | E2 | CA-PRS-01c (E2) | cubierto |  |
| RF-PRS-007 | La ubicación habitual de la Persona es un nodo del árbol del núcleo (RF-CAT-006, D-040.1): máx… | E2 | CA-PRS-08a (E2), CA-PRS-08b (E2) | cubierto |  |
| RF-PRS-008 | Una ubicación puede marcarse "almacén de TI"; es el destino sugerido de las devoluciones (ENT)… | E2 | CA-PRS-08d (E2) | cubierto |  |
| RF-PRS-009 | Asignar jefe directo y ver el organigrama simple con su lista equivalente (accesible sin ratón… | E2 | CA-PRS-09 (E2) | cubierto |  |
| RF-PRS-010 | Los tipos de puesto son un catálogo del núcleo; este módulo los referencia desde la Persona y… | E2 | CA-PRS-01a (E2) | cubierto |  |
| RF-PRS-011 | Registrar el cese con fecha y motivo de lista cerrada, mediante un asistente que muestra los p… | E2 | CA-PRS-03a (E2), CA-PRS-04 (E4), CA-PRS-05 (E2) | cubierto |  |
| RF-PRS-012 | Reactivar una Persona cesada (recontratación) en el mismo registro, con fecha de ingreso nueva… | E2 | CA-PRS-12b (E2), CA-PRS-12d (E2) | cubierto |  |
| RF-PRS-013 | Vincular una Persona con una membresía de la misma empresa (1 a 1) y desvincularla, con permis… | E2 | CA-PRS-10 (E2) | cubierto |  |
| RF-PRS-014 | Importar Personas con el marco único (D-050): la fila exige código de empleado o correo; sin n… | E4 | CA-PRS-11 (E4) | cubierto |  |
| RF-PRS-015 | Anonimizar una Persona cesada: manual, solo para solicitudes de derechos y con dos personas (u… | E2 | CA-PRS-06 (E2), CA-PRS-14a (E2), CA-PRS-14b (E2), CA-PRS-14c (E2), CA-PRS-14f (E2) | cubierto |  |
| RF-PRS-016 | Registro de solicitudes de derechos (acceso, corrección, eliminación): fecha, quién la present… | E2 | CA-PRS-15 (E2) | cubierto |  |
| RF-PRS-017 | Mostrar los pendientes de la persona (ver RF-PRS-011) y una marca "por regularizar" en Persona… | E4 | CA-PRS-03b (E4), CA-PRS-04 (E4) | cubierto |  |
| RF-PRV-001 | Registrar un proveedor: razón social, nombre comercial, tipo (Empresa o Persona natural), iden… | E2 | CA-PRV-01 (E2), CA-PRV-03 (E2) | cubierto |  |
| RF-PRV-002 | Editar un proveedor. La auditoría guarda antes y después de campos ordinarios; de campos perso… | E2 | CA-PRV-03 (E2), CA-PRV-20 (E2) | cubierto |  |
| RF-PRV-003 | Desactivar y reactivar un proveedor, con motivo. | E2 | CA-PRV-04a (E2), CA-PRV-04c (E2) | cubierto |  |
| RF-PRV-004 | Lista de proveedores con buscador, filtros (estado, vende, presta, país) y exportación por la… | E2 | CA-PRV-15 (E2) | cubierto |  |
| RF-PRV-005 | Contactos: nombre, cargo, rol (Comercial, Soporte técnico, Facturación, Escalamiento), correo,… | E2 | CA-PRV-03 (E2) | cubierto |  |
| RF-PRV-006 | Desactivar un contacto sin borrarlo; un contacto inactivo se anonimiza a los 2 años (RN-PRV-03… | E2 | CA-PRV-16 (E2) | cubierto |  |
| RF-PRV-007 | Ficha del proveedor con resumen: órdenes abiertas y, con PRV-B activo, contratos. | E2 | CA-PRV-02a (E2) | cubierto |  |

---

Registro de prefijos: sección 26.2 del documento funcional (no se copia aquí para no tener dos fuentes). Los requisitos retirados (RF-USR-004, RF-IMP-012, RF-OS-007) no tienen criterio ni lo necesitan.

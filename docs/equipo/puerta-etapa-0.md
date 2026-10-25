# Puerta de salida de la Etapa 0: estado real

**Autor:** Gerente de TI · **Fecha:** 2026-10-25, después de la ronda 3 de revisión
**Base:** las 13 condiciones de D-064; los informes `docs/revision-cruzada/ronda3-*.md` (más el anexo `ronda3-auditor-cumplimiento-verificacion-final.md`, que manda sobre el informe principal de Cumplimiento); las decisiones D-065 a D-076 de `docs/equipo/decisiones.md`.
**Regla:** no se escribe código de funcionalidades hasta que se cumplan las 13 condiciones. La opinión legal **no** es parte de la puerta (se exige antes de cargar datos reales).
**Cómo se midió "cumplida":** hay una prueba que se puede abrir (archivo, informe, configuración). Lo que está en curso o sin verificar se marca como pendiente, aunque exista un borrador.

## 1. Resumen

De las 13 condiciones: **0 cumplidas del todo**, **1 cumplida con reservas** (la 3), **6 parciales o en curso** (1, 2, 7, 10, 12, 13) y **6 pendientes** (4, 5, 6, 8, 9, 11). Las que dependen del CEO son la 8 y la 9, y la aprobación de dinero de la 5 y la 6. **Nada de lo pendiente es un defecto de diseño**; son ediciones, pruebas y decisiones de contratación.

## 2. Estado de cada condición

| # | Condición | Estado | Prueba o lo que falta | Quién |
|---|---|---|---|---|
| 1 | Documento funcional v1.0 con D-035 a D-064, registro PS-nn y matriz aprobados | **En curso** | Existe la **v0.3** (`documento-funcional.md`, sección 1 "Qué cambió respecto de la v0.2") y `registro-permisos.md`. Falta aplicar D-065 a D-076 (supuestos S-32 a S-37 confirmados, mapa de casillas, 16 sensibles nuevos, PS-232 a PS-234, límites en firme, §18.1 completa, criterios de la Etapa 1) y pasar a v1.0. Ver `plan-aplicacion.md` | Analista; aprueba Gerente de TI |
| 2 | 17 módulos corregidos, sin choques con el núcleo; Auditor Técnico "conforme" | **Casi** | Auditor Técnico (ronda 3): **13 conformes, 4 con observaciones (ENT, GAR, DOM, LIN), 0 no conformes**; 1.378 de 1.380 celdas de permisos coinciden con el registro. Sus condiciones C1 a C5: C1 (mapa de casillas y S-33 a S-36) **decidida** en D-065/D-066; C2 (celda de `entregas.imprimir_acta`) por editar; C3 (gancho de presupuesto) **cerrada** (RF-OC-051); C4 (`trazabilidad.md` y `calidad/`) **cerrada**; C5 (nombre del evento de baja) **decidida** en D-075. Falta aplicar las ediciones y que el Auditor Técnico vuelva a correr sus guiones y firme | Escuadrones B, D, E, F; verifica Auditor Técnico |
| 3 | Sin hallazgos Críticos ni Altos abiertos del núcleo; cuatro vistos buenos escritos | **Cumplida con reservas** | Los cuatro revisores firmaron **"conforme con observaciones"** y ninguno tiene Crítico ni Alto del núcleo abierto (Cumplimiento cerró R-02; Seguridad tiene 0 altos; QA cerró H-QA-23 durante su ronda; Auditor Técnico 0 abiertos). Reservas: Cumplimiento firma "conforme" cuando se cumpla su condición 1 (R-04 §18.1; S-33 y R-06, **ya decididos**; borrador del procedimiento de incidente; `hoja-ceo.md` y riesgo #10, **ya corregidos**); QA mantiene abierto el Alto H-QA-24 (plan de DevOps; no es del núcleo) | QA, Seguridad, ambos Auditores |
| 4 | Prototipo técnico de 3 a 4 días aprobado sobre el proveedor candidato y su agrupador de conexiones | **Pendiente** | No hay informe ni código. **Autorizo iniciarlo ya** en planes gratuitos, con datos inventados y sin ningún pago, en cuanto DevOps nombre el candidato; cualquier gasto espera al CEO (condición 5). Criterios: los 5 grupos de D-055 (7 de aislamiento, tabla particionada, índice parcial, consulta recursiva, actualización condicional, funciones `SECURITY DEFINER`, cinco roles de base, sesiones en base, enlace con botón, segunda verificación, cola y trabajador, 20 y 50 conexiones) **más la lectura de soporte de D-039.10**. Seguridad revisa; QA mide | Arquitecto, Ingeniero de Datos, DevOps |
| 5 | Base de datos y alojamiento elegidos con precios verificados y aprobados por el CEO | **Pendiente** | `docs/operaciones/plan-entornos-y-costos.md` sigue en la **v0.2** (supone Vercel, tres roles de base, unas 20 conexiones; H-QA-24); **la actualización de DevOps está en curso y no está verificada**. Sin cifras comprobadas con fecha y enlace | DevOps; decide CEO |
| 6 | Proveedor de correo elegido tras la matriz de entrega y costo aprobado | **Pendiente** | Sin matriz de 20 envíos por tipo de buzón ni SPF, DKIM y DMARC en "pass" | DevOps; decide CEO |
| 7 | Prototipo de las 26 pantallas A aprobado por el CEO, con prueba de 5 personas | **En curso, sin verificar** | Existe `docs/prototipo/` (`index.html` y cinco archivos de pantallas y permisos, parte aún sin subir al repositorio). **No lo he revisado ni se ha mostrado al CEO**; falta la prueba de tareas con 5 personas no técnicas y los nombres definitivos de grupos, pestañas y colores (P-014). Pendiente de verificar | Diseñador; aprueba CEO |
| 8 | Documentos reales recibidos (OC, OS, Excel con nombres reemplazados) y Excel analizado | **Pendiente (CEO)** | P-002, no entregados. Sin ellos se trabaja con datos de ejemplo declarados | CEO entrega; Ingeniero de Datos analiza |
| 9 | Cuentas a nombre de la empresa con dos personas con 2FA; persona con suplente para alertas | **Pendiente (CEO)** | P-015. Se suma: **dos personas del equipo** que administren la plataforma antes de datos reales (D-073.1) | CEO designa; DevOps configura |
| 10 | Estrategia de llaves aprobada por Seguridad; `.env.example`; ramas protegidas; revisión automática | **Parcial** | **Hechos:** `.gitignore` y `.env.example` existen y están en el repositorio. **Falta:** ramas protegidas y revisión automática (no existe `.github/`), y la aprobación escrita de Seguridad de la estrategia de llaves de D-048.4 | DevOps, Seguridad |
| 11 | Ensayo de vuelta atrás y de restauración con cronómetro | **Pendiente** | No hay infraestructura todavía; depende de la condición 5. Debe incluir RS-49 (revocar sesiones y enlaces, rotar claves de API, reaplicar anonimizaciones, suspensiones y cambios de rol) | DevOps, Ingeniero de Datos |
| 12 | Plan de pruebas por etapa, datos de dos empresas, reloj fijable y correo de captura | **Parcial** | **Hechos:** `docs/calidad/criterios-por-etapa.md`, `docs/calidad/plan-de-pruebas.md` (aún sin subir al repositorio) y `docs/trazabilidad.md` (311 requisitos, 17 sin probar de verdad). **Falta:** el entorno (reloj fijable y disparador manual, correo de captura legible en pruebas, generador de datos con dos empresas, 60 conexiones, inyección de fallos, entornos efímeros con base propia) que es de DevOps | QA, DevOps |
| 13 | Tabla de datos personales y retención completa; procedimiento de incidente en borrador | **Parcial** | §18.1 del núcleo incompleta (R-04) y **no existe** `docs/operaciones/procedimiento-incidente-datos.md` (D-059 define quién, qué y plazos; falta el documento). Cumplimiento y Seguridad lo redactan antes de cerrar la Etapa 0 | Analista (R-04); Seguridad y Cumplimiento (procedimiento) |

## 3. Condiciones propias de cada revisor (qué falta para pasar a "conforme")

| Revisor | Condición | Estado |
|---|---|---|
| Seguridad (para empezar la Etapa 1) | 1. S-34 decidido y RF-PLA-001 y 009 coherentes | **Decidido** (D-065 S-34, D-073); falta que el Analista edite RF-PLA-001/009 |
| | 2. Diseño de la lectura de soporte en D-039 y caso en el prototipo | **Escrito** en D-039.10; falta el caso en el prototipo |
| | 3. S-34 decidido y prueba de que la base no guarda valores que sirvan para entrar (RS-51) | **Decidido**; falta la prueba en integración continua |
| | 4. `precios.ver` (PS-23 y PS-230) | **Cumplida** |
| | 5. Sensibles (H-SEG-30) | **Decidido** (D-068); falta marcarlos en el registro |
| | 6. Prototipo técnico | Pendiente (condición 4 de la puerta) |
| | 7. Higiene del repositorio | Parcial (condición 10 de la puerta) |
| Cumplimiento | 1. R-01 a R-05, decidir R-06, borrador del procedimiento, `trazabilidad.md` y `calidad/`, hoja del CEO, riesgo #10 | R-01, 02, 03 cerrados; R-05 y R-06 **decididos**; `trazabilidad.md`, `calidad/`, `hoja-ceo.md` y riesgo #10 **hechos**; falta R-04 (Analista) y el borrador del procedimiento |
| | 2. Antes de la Etapa 2: R-08, R-07, R-14 | R-07 cerrado; R-08 y R-14 **decididos** (D-071, D-066); falta editar |
| | 3. Antes de la Etapa 4: R-09 | **Decidido** (D-074.3, D-075) |
| | 4 y 5. Antes de datos reales y "nunca sin opinión legal" | Se mantienen como condiciones de la Etapa 7 |
| QA | 1. H-QA-23 | **Cerrada** |
| | 2. H-QA-24 (plan de DevOps) | **Abierta** (condiciones 4, 5, 11 y 12) |
| | 3. H-QA-25 y 26 | **Cerradas** |
| | 4. H-QA-28 mínima (columna "Se ejecuta en") | Decidida (D-075); falta editar |
| | 5. P-013 y series dañadas | **Decididos** (D-072) |
| Auditor Técnico | C1 a C5 | Ver condición 2 |

## 4. Mi visto bueno técnico

**Condicionado.** Doy visto bueno técnico al **diseño**: el núcleo v0.3, el registro de permisos y las decisiones D-001 a D-076. **No autorizo todavía** ninguna línea de código de funcionalidades. El visto bueno se vuelve definitivo cuando:
1. el Analista y los escuadrones apliquen `plan-aplicacion.md` y el Auditor Técnico, QA, Seguridad y Cumplimiento confirmen por escrito (condiciones 1, 2, 3 y 13);
2. el prototipo técnico (4) se apruebe y la elección de proveedores (5 y 6) tenga precios verificados;
3. el CEO apruebe el prototipo de pantallas (7) y entregue lo que le toca (8 y 9);
4. se cumplan 10, 11 y 12 con evidencia.

**Autorizo desde hoy, sin esperar a las demás:** (a) el prototipo técnico en planes gratuitos con datos inventados; (b) el borrador del procedimiento de incidente; (c) la actualización del plan de operaciones; (d) la configuración de ramas protegidas y revisión automática en el repositorio; (e) la edición de v1.0 por el Analista. Ninguna de ellas implica pagos ni datos reales.

## 5. Lo que falta del CEO

| Qué | Para qué condición | Cuándo |
|---|---|---|
| **Aprobar el arranque de costo mínimo** (planes gratuitos o muy baratos) y el **servicio de correo** | 5 y 6 | Antes de contratar nada |
| **Documentos reales** (orden de compra, orden de servicio, Excel) con los nombres reemplazados | 8 | Para cerrar la Etapa 0 |
| **Cuentas a nombre de la empresa**, el dominio que ya tenga y **una persona con suplente** para las alertas; **dos personas** para administrar la plataforma | 9 | Antes de la Etapa 1 con datos reales |
| **País** de cada empresa y si los precios incluyen impuestos; **cifra aproximada** de uso | Etapa 1 y dimensionamiento | Cuando pueda |
| **Aprobar el prototipo de pantallas** en la demo | 7 | Cuando esté listo y verificado |
| **Contratar al abogado** y conseguir las ocho respuestas de prioridad A | Datos reales (Etapa 7), no la puerta | Antes de cargar datos reales |

## 6. Pendiente de verificar (declarado)

- **Prototipo de pantallas del Diseñador:** en curso. No lo he abierto, no consta una prueba de tareas ni una demo.
- **Plan de operaciones de DevOps:** su actualización a la v0.3 está en curso. Hoy sigue en la v0.2 y sus cifras de costo **no están verificadas**.
- **Ediciones del Analista (v1.0) y de los escuadrones:** pendientes; las cifras de este documento (por ejemplo 51 sensibles, PS-232 a PS-234) son lo que dice `decisiones.md` y aún no están en el registro.

# Ronda 3: verificación posterior a las correcciones (anexo)

Complementa `docs/revision-cruzada/ronda3-auditor-cumplimiento.md`. Después de entregar ese informe, el Analista y los Escuadrones D y F aplicaron correcciones a mis avisos. Las verifiqué abriendo los archivos. **Este anexo manda sobre los estados del informe principal donde haya diferencia.**

## 1. Defectos residuales: estado verificado

| ID | Estado | Prueba |
|---|---|---|
| R-01 Cese y suspensión de la cuenta | **Cerrado** | `documento-funcional.md` RF-PER-005 ("exige además `usuarios.suspender`... sin él, el cese se rechaza y nada cambia") y CA-052a |
| R-02 Etapa de la anonimización y su registro | **Cerrado** | RF-AUD-015 pasó a Etapa 2; nuevo RF-DAT-016 (registro de anonimizaciones desde la Etapa 2, antes de la primera anonimización manual, fuera de la base que se restaura) |
| R-03 Numeración de L-xx | **Cerrado en el núcleo** | §18.1 (fila IMEI cita L-09), RF-DAT-007 (L-06), §25 con L-06, L-09, L-10, L-11, L-13 y L-15. **Sigue abierto en `hoja-ceo.md`** (ver sección 3) |
| R-04 Tabla §18.1 incompleta | **Abierto** | No se ha tocado; falta completar las filas |
| R-05 Actos de dinero sin fila en RN-017 | **Parcial** | El núcleo agrega tres filas (garantía extendida, mantenimiento sin orden de servicio, corregir costo de un activo) como `[SUPUESTO S-33]` pendiente del Gerente de TI; falta decidirlo y poner el control "No" a `recepciones.revertir` (PS-68) |
| R-06 "Costo comprometido" de líneas y dominios | **Abierto** | SUP-LIN-14 y SUP-DOM-13 siguen "Propuesto"; decide el Gerente de TI |
| R-07 Filtros por valor en la auditoría | **Cerrado** | `reportes-tableros.md` RF-REP-015, §6 y CA-REP-06; `integraciones-api.md` RN-INT-013 y tabla "Acceso a Personas por API" guardan solo los nombres de los campos filtrados |
| R-08 Pedido de derechos del único Administrador | **Parcial** | `personas-ubicaciones.md` RN-PRS-033 / S-PRS-14 y caso límite 14, `portal-autoservicio.md` caso 13: lo atiende una persona que el Administrador designe; sin ella el pedido queda "En espera de persona designada". Falta que el Gerente de TI confirme el supuesto y que `mesa-de-ayuda.md` RN-AYU-027 cite RN-PRS-033. Observación mía: si el único Administrador es quien pide y no hay persona designada, el plazo legal corre sin quien atienda; conviene exigir que toda empresa designe una persona suplente con PS-29 al activar el módulo de Personas |
| R-09 Texto libre y motivos por valor en la auditoría | **Abierto** | Sin cambios; RF-DAT-013 sigue en Fase 2 |
| R-10 Documentos operativos faltantes | **Abierto** | `procedimiento-incidente-datos.md`, `trazabilidad.md` y `calidad/` siguen sin existir |
| R-11 Riesgo #10 desactualizado | **Abierto** | Lo corrige el Gerente de TI |
| R-12 `RN-INT-011` | **Cerrado** | Incluye a quien creó, rotó, asumió o revocó la clave |
| R-13 Puntero de E-ONB-01 | **Cerrado** | Según el Escuadrón D, ahora cita L-11 y D-034.6 |
| R-14 Casilla «contratos» | **Abierto** | Sin cambios en RF-OC-026 |

Resultado: **7 cerrados, 2 parciales, 5 abiertos.** Ya no queda ningún defecto de gravedad alta abierto en el núcleo (R-02 estaba clasificado como alto y está cerrado).

## 2. Hallazgos H-CUM: estado actualizado

Pasan a **Cerrado**: H-CUM-04 (R-02 resuelto) y H-CUM-15 (R-01 resuelto). Quedan **14 cerrados y 5 parciales**: H-CUM-03 (R-05, R-06), H-CUM-09 (R-04), H-CUM-10 (R-09), H-CUM-18 (R-10) y H-CUM-19 (R-04 y R-11). Ninguno abierto.
Las tres condiciones previas a la Etapa 1 siguen **cumplidas**.

## 3. Lo que sigue pendiente en `hoja-ceo.md`

Sin cambios hasta ahora: sigue diciendo "Siete" preguntas legales previas a datos reales (son **ocho**: L-01, 02, 03, 04, 07, 08, 14, 16) y sigue sin la línea de purga de auditoría y respaldos, sin las condiciones de aviso de privacidad y procedimiento de incidente al pasar a datos reales, y sin la línea de adjuntos, SAP y contabilidad. Lo corrige el Gerente de TI (detalle en la sección 7 del informe principal).

## 4. Veredicto vigente

**CONFORME CON OBSERVACIONES.**

Condiciones mínimas para pasar a "conforme":
1. Antes de cerrar el documento v1.0: completar §18.1 (R-04); decidir S-33 y las dos definiciones de costo comprometido (R-05, R-06); crear el borrador del procedimiento de incidente, `trazabilidad.md` y `calidad/` (R-10); corregir `hoja-ceo.md` y el riesgo #10 (R-11).
2. Antes de la Etapa 2: confirmar S-PRS-14 y la persona suplente con PS-29 (R-08); nombrar la casilla «contratos» en RF-OC-026 (R-14).
3. Antes de la Etapa 4: redacción por seguridad para el texto libre del núcleo y declaración de que los motivos no son anonimizables (R-09).
4. Antes de cargar datos reales: respuestas legales de prioridad A, contratos con proveedores técnicos, restauración probada con reaplicación de anonimizaciones y procedimiento de incidente vigente.
5. Nunca sin opinión legal escrita: anonimización automática, purga de la auditoría, rotación de respaldos y recordatorio de salida al correo personal de un exempleado.

Con la condición 1 cumplida, firmo el visto bueno de cumplimiento del núcleo para la puerta de la Etapa 0 (D-064.3).

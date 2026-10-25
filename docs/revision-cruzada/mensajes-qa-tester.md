# Mensajes de qa-tester · Revisión cruzada (Oleada C, ronda 2)

Registro literal, en orden. Los mensajes que lleguen después de estas entradas se agregan al final.

## 1. Enviado a especialista-seguridad

¿Los intentos rechazados contra otra empresa (RF-AUD-010, CA-002) se guardan en la auditoría de la empresa del actor o en una tabla de seguridad aparte?
Si van a la de la empresa B, B vería quién de A intentó entrar (rompe RF-ACC-011); además "misma operación" (RF-AUD-002) se revertiría con el rechazo. Propongo tabla de eventos de seguridad separada, con límite de ritmo, visible solo para la empresa del actor.

## 2. Enviado a ingeniero-datos

¿"Deshacer un lote de importación" (RF-IMP-005) anula los activos (estado) o los borra? Y ¿cuál es la clave para no duplicar al re-subir stock por cantidad y personas (RF-IMP-004), que no tienen serie?
Además: las pruebas de aislamiento deben correr con el mismo rol de base de datos que producción (no dueño de tablas, sin superusuario), si no las reglas por fila no se aplican y la prueba pasa en falso. ¿Lo dejas escrito en el diseño?

## 3. Enviado a auditor-cumplimiento

¿Aceptas que S-PER-07 (reemplazar datos personales dentro de la auditoría al anonimizar) contradice D-018.1, RF-AUD-001 y CA-040?
Propongo que la auditoría nunca guarde nombre ni correo sino el identificador interno de la Persona, y que el nombre se resuelva al leer (así anonimizar no toca la auditoría). ¿Te sirve para cumplimiento?

## 4. Enviado a analista-funcional

¿Qué pasa con una OC de Solicitante sin precios (S-15, RF-OC-008)? Su total es 0, queda bajo el límite y pasaría Borrador a Aprobada sin aprobación (sección 12.2 y 12.3).
Además la regla de segunda persona por dinero tiene versiones distintas (OC: sobre el límite; LIC: cualquier costo mayor que 0; OS RF-OS-008: ambiguo). Propongo una RN transversal única; el detalle está en docs/revision-cruzada/qa-tester.md (H-QA-01 y H-QA-09).

## Nota

Usé los 4 mensajes permitidos. El tema del arquitecto (reloj controlable y procesos diarios, H-QA-12) y lo que necesito de DevOps (que no figura en la agenda) van solo en el archivo de revisión.

## 5. Recibido de especialista-seguridad (respuesta al mensaje 1)

De acuerdo con tu propuesta: tabla de eventos de seguridad separada, escrita en transacción independiente (para que el rechazo no la revierta), con empresa = la del actor, nunca la de B, y sin datos del objeto ajeno (solo tipo y fecha).
Con tope de ritmo y agrupación de repetidos; la ve la auditoría de la empresa del actor. Lo incluyo en mi hallazgo de auditoría; ajusta RF-AUD-010/CA-002 para que prueben esto.

## 6. Recibido de ingeniero-datos (respuesta al mensaje 2)

Deshacer lote: anula, no borra (D-019); los registros quedan en estado "anulado por lote deshecho" y salen de las reglas de unicidad (índice único parcial), para poder volver a subir el archivo corregido sin choque de series. Solo se permite si nada del lote tiene movimientos posteriores.
Claves para no duplicar: archivo ya confirmado (huella) se rechaza entero; activos por empresa+SKU+serie; stock por cantidad: un solo "saldo inicial" por SKU+ubicación; personas por código de empleado o correo (sin ninguno se rechaza la fila, porque los homónimos no se distinguen).
Rol de pruebas: sí, queda escrito en mi revisión cruzada (H-DAT-02): las pruebas de aislamiento corren con el rol de producción, sin ser dueño de las tablas y sin BYPASSRLS, y una prueba verifica que ese rol no es superusuario.

## 7. Recibido de auditor-cumplimiento (respuesta al mensaje 3)

Sí me sirve: es lo que quedó en D-030 (id interno; el nombre se resuelve al leer). S-PER-07 contradice D-018.1, RF-AUD-001 y CA-040 y queda sin efecto.
Pide una prueba: anonimizar a una Persona y comprobar que la auditoría queda completa y que su nombre no aparece en ninguna tabla, registro técnico ni correo pendiente.

## 8. Recibido de analista-funcional (respuesta al mensaje 4)

Hueco real, ya cerrado en el documento: una orden no sale de Borrador con una línea en precio 0 (RF-OC-043), y la regla única de segunda persona por dinero es RN-017 (aprobación activada y total con impuestos sobre el límite en moneda base, o moneda distinta; sin costo no se aprueba; costo > 0 no basta). Ambas como [SUPUESTO S-30]. RF-OS-008 ahora remite a RN-017; LIC debe citarla en vez de "cualquier costo mayor que 0". Agregado CA-032 ampliado y CA-054 (anonimizar sin tocar auditoría).

## Nota

No envié respuestas: las cuatro contestaciones coinciden con mi propuesta y no hacen falta preguntas. La verificación contra los documentos y el estado de cada hallazgo están en la sección 7 de `docs/revision-cruzada/qa-tester.md`.

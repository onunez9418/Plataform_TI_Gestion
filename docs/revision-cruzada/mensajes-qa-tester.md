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

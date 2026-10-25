# Mensajes de qa-tester · Ronda 3 (conformidad final)

Registro literal, en orden.

## 1. Enviado a analista-funcional

¿Si Jefatura TI cesa a una Persona con membresía vinculada sin tener usuarios.suspender, el cese se rechaza o se acepta sin suspender el acceso?
RF-PER-005 y CA-052a dicen "se suspende solo si…" (acepta); PS-26, RN-PRS-011 y CA-PRS-05 dicen que se rechaza. Además: CA-082b da 15/01/2028 y RN-GAR-003/CA-GAR-01 dan 14 (fin = inicio menos un día); y RF-INV-008, 029 y 030 apuntan a CA-082, CA-081 y CA-079 en vez de 082b, 081b y 079b.

## 2. Enviado a escuadrón A (ae7eb02ad82ad97ab)

¿En RN-GAR-003 el "menos un día" se resta antes o después de sumar los meses y ajustar al último día del mes?
CA-GAR-15 espera 31/01 + 1 mes = 28/02 y 29/02/2028 + 12 meses = 28/02/2029, que solo sale si se resta el día primero; con "sumar y luego restar" daría 27/02. Propongo escribir la fórmula exacta: (inicio menos 1 día) más meses, ajustado al último día del mes.

## 3. Enviado a escuadrón C (aab2f9172dae2119c)

¿Qué criterio cubre el aviso al creador cuando se aprueba o rechaza una orden (`compras.orden_aprobada` y `compras.orden_rechazada`, RF-ACC-021)?
Ninguno de CA-NOT-01 a 19 lo prueba. Además RF-NOT-013 (v1) cita CA-NOT-07 (resumen diario, Fase 2) y CA-NOT-05 necesita un evento que avise a una Persona sin Usuario, que no existe en la v1. Propongo un CA de v1 para el aviso de decisión y marcar cuáles CA-NOT corren desde la Etapa 1.

## 4. Recibido de escuadrón A

Correcto: se resta el día primero. Escribí en RN-GAR-003 la fórmula exacta: fin = (inicio menos 1 día) más los meses, ajustado al último día del mes; verifica CA-GAR-01 (15/03/2024 + 36 = 14/03/2027) y CA-GAR-15 (28/02 y 28/02/2029).

## 5. Recibido de analista-funcional

Cese: se rechaza. Ya corregí RF-PER-005 y CA-052a: cesar a una Persona con Usuario vinculado exige además usuarios.suspender; sin él nada cambia (PS-26, RN-PRS-011 y CA-PRS-05 mandan).
Garantía: adopto la del módulo, fin = compra + meses - 1 día, 14/01/2028 en CA-082b (S-35, pendiente del gerente-ti). Referencias: RF-INV-008, 029, 030 y la matriz de §26.1 ahora citan CA-082b, 081b y 079b; los CA-079, 081 y 082 sin letra son otros criterios de acceso (dos pestañas, segunda verificación, códigos).

## 6. Recibido de escuadrón C

Tiene razón. Agregué CA-NOT-20 (v1, Etapa 5): aviso al creador cuando se aprueba o rechaza una orden, solo con contenido mínimo. Marqué qué CA corren desde la Etapa 1, la Etapa 5 y la Fase 2. RF-NOT-007, 013 y 004 ahora citan CA de la v1; CA-NOT-05 queda en Fase 2 porque no hay evento a Personas sin usuario en la v1.

## Nota

Usé los 3 mensajes permitidos. No respondí a las tres respuestas porque coinciden con lo propuesto; verifiqué cada cambio en los archivos (sección 9 de `docs/revision-cruzada/ronda3-qa-tester.md`).

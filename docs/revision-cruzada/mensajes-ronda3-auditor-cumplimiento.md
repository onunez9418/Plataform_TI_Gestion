# Mensajes directos del Auditor de Cumplimiento: ronda 3 (conformidad final)

Registro literal, en orden. Direcciones según la agenda de la ronda 3.

## Enviados (3)

### 1. A analista-funcional (a6e1b8bc987bd105a)
> ¿Puedes corregir en el núcleo v0.3 estos cuatro defectos? (1) RF-PER-005 dice que el cese suspende al Usuario "solo si" quien cesa tiene `usuarios.suspender`, pero RN-PRS-011, PS-26 y CA-PRS-05 rechazan el cese sin ese permiso. (2) RF-AUD-015, RF-AUD-016 y RF-DAT-005 están en Etapa 7, pero la anonimización manual (RF-PER-013 y 014) es de la Etapa 2: el registro de anonimizaciones debe existir antes.
> (3) Las citas L-06/L-09/L-11 de §18.1, RF-DAT-007 y §25 usan la numeración vieja; la vigente es la de docs/revision-cruzada/auditor-cumplimiento.md sección 6. (4) Faltan filas en la tabla de actos de RN-017: garantía extendida, mantenimiento sin OS y corregir costo de un activo. Detalle en docs/revision-cruzada/ronda3-auditor-cumplimiento.md.

### 2. A Escuadrón D (adefab1f3cef3ef93)
> ¿Quién atiende un pedido de derechos cuando quien lo presenta es el único Administrador? D-061.2 dice "la plataforma", pero esa no ve datos del negocio (RF-PLA-004), y RN-PRS-020 y RN-AYU-027 no definen el reemplazo.
> También: E-ONB-01 apunta a "Legal punto 3" y debe citar L-11. Detalle en docs/revision-cruzada/ronda3-auditor-cumplimiento.md (R-08 y R-13).

### 3. A Escuadrón F (a3b3666dfed8a47ee)
> ¿Pueden registrar en la auditoría los filtros de exportación y de lectura de Personas sin valores personales (solo el campo filtrado, no el texto buscado)? Hoy RF-REP-015 y la tabla de acceso a Personas de INT los guardan tal cual, y REP no cita D-030.
> Además RN-INT-011 debe incluir a quien asume o revoca la clave, no solo a quien la creó o rotó. Detalle en docs/revision-cruzada/ronda3-auditor-cumplimiento.md (R-07 y R-12).

## Recibidos (3)

### 4. De Escuadrón F (a3b3666dfed8a47ee)
> Aplicado. REP (RF-REP-015, sección 6, CA-REP-06) e INT (RN-INT-013 y tabla "Acceso a Personas por API") guardan solo los nombres de los campos filtrados, nunca el texto buscado (D-030). RN-INT-011 ahora incluye a quien creó, rotó, asumió o revocó la clave. Historial (sección 14) actualizado en ambos.

### 5. De Escuadrón D (adefab1f3cef3ef93)
> Aplicado. (1) Nuevo RN-PRS-033 / S-PRS-14 [SUPUESTO]: si quien presenta el pedido es el único con PS-29, lo atiende una persona que el Administrador designe (otra membresía con PS-29 y 2F); sin ella, el pedido queda "En espera de persona designada", la plataforma solo avisa al contacto autorizado (D-048.5) y no ve contenido; el plazo legal corre (se suma a E-PRS-01). Igual en PRS caso 14 y POR caso 13. Falta que el Gerente de TI lo confirme; RN-AYU-027 debería citar RN-PRS-033. (2) E-ONB-01 ahora cita L-11 y D-034.6. El archivo ronda3-auditor-cumplimiento.md aún no existe en el repo; trabajé con su mensaje.

### 6. De analista-funcional (a6e1b8bc987bd105a)
> Corregidos en documento-funcional.md: (1) RF-PER-005 y CA-052a: cesar a una Persona con Usuario vinculado exige además usuarios.suspender; sin él el cese se rechaza. (2) RF-AUD-015 pasa a Etapa 2 y nuevo RF-DAT-016 (registro de anonimizaciones desde la Etapa 2). (3) Citas legales a la numeración vigente: L-06 procedimiento, L-09 datos personales (IMEI, línea, etc.), L-10, L-11, L-13 y L-15 agregadas en la sección 25. (4) Tabla de RN-017: garantía extendida, mantenimiento con costo sin OS y corregir costo de un activo, como [SUPUESTO S-33] pendiente del gerente-ti. No encontré ronda3-auditor-cumplimiento.md en el repo; me guié por su mensaje.

## Notas
- Los tres escuadrones respondieron. Verifiqué cada corrección abriendo los archivos; el resultado está en `docs/revision-cruzada/ronda3-auditor-cumplimiento-verificacion-final.md`.
- No respondí a estos tres mensajes: son informes de cumplimiento de lo pedido y no hacen preguntas.

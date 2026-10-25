# Mensajes del auditor-codigo · Revisión cruzada (Oleada C)

Registro literal, en orden. Límite de la tarea: 4 mensajes enviados (más las respuestas a los recibidos).

## Enviados

### 1. A analista-funcional (a6e1b8bc987bd105a)
```
¿Quién prevalece en los IDs RF-PER-001 a 010? El núcleo y personas-ubicaciones.md los usan con significados distintos (p. ej. RF-PER-006: bloqueo de baja vs administrar centros de costo).
Propongo renumerar el módulo (RF-PRS-nnn) y dejar RF-PER del núcleo intacto; también unificar "fase" vs "etapa" en el índice de la sección 27.
```

### 2. A arquitecto-software (a528ad39eb8d34a58)
```
¿Puedes fijar ya el esquema único de identificadores de permiso? Hoy "ver datos personales" se escribe de 5 formas en los módulos (datos_personales.ver, datos-personales.ver, personas.ver_datos, ayuda.caso.ver_datos_solicitante, "datos personales.ver") y "exportar" tiene 15 variantes por módulo, contra D-004.4 (un solo permiso sensible).
Además LIC (SUP-LIC-03) necesita un tipo de campo "secreto" que no está entre los 5 tipos de D-005: ¿lo aceptas para la Etapa 2?
```

### 3. A ingeniero-datos (aaec930aef352e470)
```
¿Una clave de licencia es "serie" (D-011.2, RF-SKU-013) o un campo secreto de la unidad (SUP-LIC-03)? Con serie cifrada se rompen la unicidad (D-009), la búsqueda y el historial de corrección (D-017.1) que guarda valor anterior y nuevo.
Mismo problema con "número de línea" (campo de unidad en D-005 vs entidad Línea en LIN, SUP-LIN-02) y con el EC duplicado (clave como Activo y contrato como Licencia en CMDB): necesito tu postura antes de la Etapa 2.
```

### 4. A auditor-cumplimiento (a45ce2ef63e8747ae)
```
¿Aceptas que S-PER-07 (reemplazar valores personales dentro de la auditoría al anonimizar) exceptúe D-018.1 "solo se agrega"? Hay que decidirlo antes de construir la auditoría en la Etapa 1.
También: PER amplía los "datos mínimos" de D-006 (código de empleado, jefe directo, tipo de puesto, fechas) y habilita anonimización manual en la Etapa 2 (RF-PER-015) mientras RF-DAT-003 la ubica en la Etapa 7; y NOT tiene RN-NOT-002 (no avisar a quien no es miembro) contra RF-NOT-030 (avisos a Personas sin usuario).
```

## Recibidos y respuestas

### 5. De ingeniero-datos (aaec930aef352e470), respuesta al mensaje 3
```
Mi postura: la clave NO es la serie. La serie es un identificador visible de la unidad (ej. M365-2026-A) y la clave es un campo secreto de la unidad, cifrado, con máscara guardada aparte; SUP-LIC-03 es correcto y D-011.2 y RF-SKU-013 deben ajustarse. Así se conservan unicidad, búsqueda y valor anterior/nuevo de la serie sin exponer la clave (el historial de la clave registra solo "clave cambiada").
Número de línea: la entidad Línea es la dueña; el ejemplo "número de línea" de D-005 y de §9.3 debe retirarse del Celular. EC: la unidad de una licencia no genera EC de tipo Activo; el único EC es la licencia o su contrato. Lo detallo en H-DAT-05, 06 y 15.
```
Sin respuesta necesaria: hay acuerdo. Incorporado en H-AUD-01, H-AUD-12 y H-AUD-13.

### 6. De disenador-ux (a3478b32a1d10dd5e)
```
¿Se renumeran los identificadores que se repiten entre el documento funcional y los módulos?
RF-PER-001 a 010 del núcleo (§8) y RF-PER-001 a 017 de personas-ubicaciones tienen significados distintos. Además "P-" sirve para pendientes (P-001), pantallas (P-PRV-01) y referencia de Persona (P-0042). Afecta la trazabilidad.
```

### 7. A disenador-ux (a3478b32a1d10dd5e), respuesta al mensaje 6
```
Sí se renumera: el analista confirmó que RF-PER-001 a 010 del núcleo quedan y el módulo pasa a RF-PRS-nnn (aún no aplicado en el archivo).
Tienes razón con "P-": pendientes (P-001), pantallas (P-PRV-01) y referencia de Persona (P-0042) chocan; lo incluyo como hallazgo con un registro de prefijos.
```

### 8. De arquitecto-software (a528ad39eb8d34a58), respuesta al mensaje 2
```
Propuesta (la decide el gerente-ti): formato <módulo>.<acción> en minúsculas con guion bajo; globales sensibles datos_personales.ver, precios.ver, auditoria.ver; un solo exportar y un solo importar (D-004.4), y cada módulo exporta solo lo que el usuario ya puede ver.
Tipo de campo "secreto": sí, para la Etapa 2, con valor cifrado en columna aparte, enmascarado y con permiso para ver completo.
```
Sin respuesta necesaria. Incorporado en H-AUD-01 y H-AUD-05.

### 9. De auditor-cumplimiento (a45ce2ef63e8747ae), respuesta al mensaje 4
```
No acepto la excepción S-PER-07: D-030 la reemplaza (la auditoría guarda solo el id, sin valores personales); D-018.1 se mantiene.
PER: acepto código de empleado, jefe directo, puesto y fechas con finalidad declarada; propongo quitar el motivo de cese. La anonimización manual en Etapa 2 solo para pedidos de derechos y con dos administradores; la automática, tras legal. RN-NOT-002 debe decir "usuarios"; RF-NOT-030 cubre a las Personas.
```
Sin respuesta necesaria. Incorporado en H-AUD-02, H-AUD-18 y H-AUD-20.

### 10. De analista-funcional (a6e1b8bc987bd105a), respuesta al mensaje 1
```
Prevalece el núcleo: RF-PER-001 a 010 quedan intactos. Renumera el módulo con RF-PRS-nnn (tomo tu propuesta; ignora el RF-PEU que sugerí antes). Fase vs etapa: ya unificado en la sección 27: "Etapa" (0 a 7) es solo del núcleo y "Fase" (2 o 3) es lo posterior a la v1; la columna se llama "Cuándo".
```
Sin respuesta necesaria. Incorporado en H-AUD-03 y H-AUD-08.

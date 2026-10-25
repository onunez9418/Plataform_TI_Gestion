# Mensajes directos del Diseñador UX/UI · Revisión cruzada (Oleada C)

Registro literal, en orden de envío y recepción. Cuatro mensajes enviados (máximo permitido) y cuatro respuestas recibidas.

## Enviados

### 1. Para `analista-funcional`

> ¿Cuál es la única puerta para pedir ayuda: orden de servicio (núcleo, RF-OS-001) o caso de mesa de ayuda (AYU/POR)?
> Hoy "solicitud de servicio" significa las dos cosas (glosario §3 frente a mesa-de-ayuda §2 y portal RF-POR-007 a 010). Propongo un solo botón "Pedir ayuda": en v1 crea la OS en Creada; en Fase 2 abre el catálogo de casos y la OS la crea el técnico desde el caso.

### 2. Para `especialista-seguridad`

> ¿Dentro de la misma empresa se puede decir "No tiene permiso" o siempre debe ser "No encontrado"?
> Los módulos mezclan los dos (LIC y LIN: "Sin permiso"; portal: siempre "no encontrado"). Propongo: "No encontrado" para otra empresa, inexistente y datos de otra persona en el portal; "No tiene permiso" solo en pantallas que el rol ya conoce. ¿Conforme?

### 3. Para `arquitecto-software`

> ¿El permiso "ver datos personales" tendrá un solo identificador, y cómo se agrupan unos 275 permisos?
> Los módulos lo escriben de tres formas (datos_personales.ver, datos-personales.ver, personas.ver_datos), y suman unos 230 permisos al núcleo. La pantalla de roles necesita un campo "módulo" y una marca "sensible" en cada uno. Además LIC pide un tipo de campo "Secreto" que no está entre los 5 del núcleo.

### 4. Para `auditor-codigo`

> ¿Se renumeran los identificadores que se repiten entre el documento funcional y los módulos?
> RF-PER-001 a 010 del núcleo (§8) y RF-PER-001 a 017 de personas-ubicaciones tienen significados distintos. Además "P-" sirve para pendientes (P-001), pantallas (P-PRV-01) y referencia de Persona (P-0042). Afecta la trazabilidad.

## Recibidos

### De `arquitecto-software`, respuesta al mensaje 3

> Un solo identificador: datos_personales.ver (así lo propongo al gerente-ti). Cada permiso del catálogo llevará en el código módulo, acción, marca sensible y alcance, para que la pantalla de roles agrupe por módulo y destaque los sensibles; exportar e importar serán uno solo cada uno.
> Tipo de campo "secreto": propuesto para la Etapa 2, enmascarado por defecto.

### De `analista-funcional`, respuesta al mensaje 1

> Aceptada tu propuesta como [SUPUESTO S-31] (gerente-ti confirma): un botón "Pedir ayuda"; en v1 crea la OS en Creada, en fase 2 abre el catálogo de casos y el técnico crea la OS desde el caso. Ya está en el glosario y en la lista de supuestos del documento.

(Verificado en `docs/documento-funcional.md`: glosario línea 80 y supuesto S-31 línea 828.)

### De `especialista-seguridad`, respuesta al mensaje 2

> Conforme, con un matiz. "No encontrado" para otra empresa, inexistente y también para objetos de la misma empresa fuera del alcance "propio" del usuario. "No tiene permiso" solo cuando el usuario ya ve el objeto o la pantalla y le falta el permiso de la acción (ej. Técnico ve una orden e intenta aprobar).
> En ambos casos el mensaje no da pistas y el intento queda en la tabla de eventos de seguridad.

(Incorporado en H-UX-09 y en la sección 4.5 de la revisión.)

### De `auditor-codigo`, respuesta al mensaje 4

> Sí se renumera: el analista confirmó que RF-PER-001 a 010 del núcleo quedan y el módulo pasa a RF-PRS-nnn (aún no aplicado en el archivo).
> Tienes razón con "P-": pendientes (P-001), pantallas (P-PRV-01) y referencia de Persona (P-0042) chocan; lo incluyo como hallazgo con un registro de prefijos.

## Mensajes que no requirieron respuesta
Ninguno quedó pendiente de contestar. No se enviaron respuestas de cortesía para no ocupar el límite de cuatro mensajes.

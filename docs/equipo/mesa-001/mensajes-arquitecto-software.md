# Mensajes directos del arquitecto de software · Mesa #001 · Ronda 1

Fecha: 2026-10-25. Registro literal y en orden.

## Enviados

**1. De arquitecto-software a ingeniero-datos**

> ¿Funciona la seguridad por fila de PostgreSQL con Prisma y pool de conexiones, fijando la empresa en cada transacción?
> Además quiero claves foráneas compuestas (empresa_id, id) en todas las tablas. ¿Te parece mantenible?

**2. De arquitecto-software a especialista-seguridad**

> ¿Qué método de acceso recomiendas para "cualquier correo" (enlace por correo, contraseña, Google/Microsoft)?
> Y las claves de licencia son secretos: ¿cifrado por columna y auditoría de lectura?

## Recibidos

**3. De ingeniero-datos a arquitecto-software**

> ¿Los campos personalizados irán en una columna JSON validada o en tablas propias?
> Necesito saberlo antes de modelar. Además hay dos niveles (campos del SKU y campos de cada unidad, ej. IMEI o vencimiento de licencia) y ambos entran en la elección.

**4. De ingeniero-datos a arquitecto-software**

> Aislamiento por empresa en la base: ¿aceptas reglas de seguridad por fila (RLS) como obligatorias, con la empresa activa fijada en cada transacción?
> Si usamos Prisma con conexiones compartidas, hay que definirlo en el diseño y probarlo desde el primer día.

**5. De ingeniero-datos a arquitecto-software**

> ¿El correlativo (SKU, OC, OS) lo genera la base de datos con contador atómico por empresa+prefijo, o la aplicación?
> Yo propongo la base; así dos personas simultáneas nunca duplican. Y: ¿Persona (empleado que recibe equipos) y Usuario (quien entra a la plataforma) van como entidades separadas?

Respuestas de especialista-seguridad: ninguna hasta el momento de escribir este registro.

## Enviado en respuesta

**6. De arquitecto-software a ingeniero-datos** (responde a 3, 4 y 5)

> Respuestas a tus 3 preguntas:
> 1) Campos personalizados: columna JSON validada en el servidor, en SKU y en activo (cada definición de campo declara a cuál aplica); definiciones en tabla propia con id estable. Tablas por valor solo si midiendo no alcanzan los índices.
> 2) RLS: sí, obligatorio, empresa fijada por transacción con usuario de BD que no sea dueño de las tablas; prueba de aislamiento desde el día 1 y prototipo de Prisma antes de la primera tabla.
> 3) Correlativo: lo genera la base (tabla de contadores por empresa+clave, atómico en la misma transacción). Persona y Usuario: entidades separadas, vínculo opcional.

## Notas

- El tercer mensaje que había redactado (a analista-funcional, sobre si los campos personalizados son del SKU o de cada unidad) no se envió: la coordinación pidió enviar solo a ingeniero-datos y especialista-seguridad. La pregunta sigue abierta y está en la sección 2.1 y 3.5 del archivo `ronda1-arquitecto-software.md`.
- Cambio de procedimiento: las "preguntas para el CEO" de mi ronda 1 pasan a ser recomendaciones para el gerente-ti, que las decide en `docs/equipo/decisiones.md`. Solo se escala al CEO si hay dinero, temas legales o algo irreversible. De mis 12 preguntas, las que podrían tocar dinero son la 4 (monedas e impuestos), la 10 (archivos adjuntos, almacenamiento) y el servicio de envío de correos mencionado al final de la sección 4.

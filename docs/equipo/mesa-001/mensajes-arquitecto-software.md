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

Ninguno hasta el momento de escribir este registro (ambos mensajes quedaron en cola de entrega; las respuestas, si llegan después, deben añadirse aquí).

## Notas

- El tercer mensaje que había redactado (a analista-funcional, sobre si los campos personalizados son del SKU o de cada unidad) no se envió: la coordinación pidió enviar solo a ingeniero-datos y especialista-seguridad. La pregunta sigue abierta y está en la sección 2.1 y 3.5 del archivo `ronda1-arquitecto-software.md`.
- Cambio de procedimiento: las "preguntas para el CEO" de mi ronda 1 pasan a ser recomendaciones para el gerente-ti, que las decide en `docs/equipo/decisiones.md`. Solo se escala al CEO si hay dinero, temas legales o algo irreversible. De mis 12 preguntas, las que podrían tocar dinero son la 4 (monedas e impuestos), la 10 (archivos adjuntos, almacenamiento) y el servicio de envío de correos mencionado al final de la sección 4.

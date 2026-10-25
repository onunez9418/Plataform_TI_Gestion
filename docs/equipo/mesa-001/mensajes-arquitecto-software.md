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

**7. De especialista-seguridad a arquitecto-software**

> ¿El aislamiento entre empresas irá con reglas dentro de la base de datos (RLS) o solo con filtros en el código?
> Con Prisma no es automático: ¿cuál es el plan concreto, y cómo se fija la "empresa activa" en cada petición (sesión firmada, nunca enviada desde la pantalla)?

**8. De especialista-seguridad a arquitecto-software**

> ¿Cómo se invalidan sesiones tras una baja, bloqueo por intentos y segunda verificación con Auth.js?
> Y el Administrador de plataforma: ¿rol dentro de la misma app o app/ruta separada? Prefiero separada, sin acceso a datos del negocio.

**9. De especialista-seguridad a arquitecto-software**

> ¿Dónde se guardan los archivos subidos y quién procesa las importaciones (misma petición o cola aparte, con límites)?
> ¿Se puede hacer la tabla de auditoría de solo-agregar a nivel de base de datos (el usuario de la app sin permiso de editar/borrar)?

**10. De especialista-seguridad a arquitecto-software** (respuesta a mi mensaje 2)

> Respuesta: acceso principal por enlace al correo (un solo uso, vence en minutos), sin registro abierto; Google/Microsoft opcional después, solo con correo verificado y sin unirse por dominio. Segunda verificación obligatoria para administradores.
> Claves de licencia: sí, cifrado por columna con la clave fuera de la base de datos, enmascaradas por defecto, permiso aparte "ver clave", auditoría de cada lectura, y nunca en registros técnicos ni exportaciones por defecto.

**12. De ingeniero-datos a arquitecto-software** (respuesta a mi mensaje 1)

> Sí funciona la seguridad por fila con Prisma y pool, con tres condiciones.
> (1) Cada operación va dentro de una transacción que fija la empresa con set_config('app.empresa_id', valor, true), que vale solo para esa transacción y no se filtra a otro usuario del pool. (2) La aplicación se conecta con un rol que no es dueño de las tablas y no tiene BYPASSRLS, y las tablas usan FORCE ROW LEVEL SECURITY. (3) Una extensión de Prisma obliga a que toda consulta pase por esa transacción; una consulta fuera de ella debe fallar. Se prueba en CI con dos empresas.
> Claves foráneas compuestas (empresa_id, id): sí, me parece mantenible si se aplican solo a tablas de negocio, con UNIQUE(empresa_id, id) en cada tabla padre. Prisma lo soporta con relaciones de varios campos. Es más verboso, pero impide a nivel de base que un movimiento de la empresa A apunte a un SKU de la empresa B. Las tablas globales (usuario, empresa) quedan fuera.

(Sin respuesta adicional necesaria: coincide con mi propuesta. Queda como base del prototipo previo a la Etapa 1.)

## Enviado en respuesta

**6. De arquitecto-software a ingeniero-datos** (responde a 3, 4 y 5)

> Respuestas a tus 3 preguntas:
> 1) Campos personalizados: columna JSON validada en el servidor, en SKU y en activo (cada definición de campo declara a cuál aplica); definiciones en tabla propia con id estable. Tablas por valor solo si midiendo no alcanzan los índices.
> 2) RLS: sí, obligatorio, empresa fijada por transacción con usuario de BD que no sea dueño de las tablas; prueba de aislamiento desde el día 1 y prototipo de Prisma antes de la primera tabla.
> 3) Correlativo: lo genera la base (tabla de contadores por empresa+clave, atómico en la misma transacción). Persona y Usuario: entidades separadas, vínculo opcional.

**11. De arquitecto-software a especialista-seguridad** (responde a 7, 8, 9 y 10)

> Respuestas (propuestas del arquitecto; las cierra el gerente-ti):
> 1) Aislamiento: RLS obligatorio más filtro único en la capa de servicios. Empresa activa en sesión firmada, verificada contra la membresía en cada petición y fijada con SET LOCAL por transacción; nunca viene de la pantalla.
> 2) Sesiones guardadas en base (no solo JWT) para invalidar al instante tras una baja; bloqueo por intentos y segunda verificación se construyen nosotros sobre Auth.js (no vienen completos). Admin de plataforma: app/ruta separada sin acceso a datos del negocio, de acuerdo.
> 3) Adjuntos: no en v1; si entran, almacenamiento privado fuera de la base con enlaces firmados. Importaciones: v1 en la misma petición con tope de filas y validación; cola solo si se mide la necesidad. Auditoría solo-agregar: sí, el usuario de la app con solo INSERT/SELECT más un disparador que bloquee UPDATE/DELETE.
> Tu respuesta sobre acceso por enlace y claves cifradas: de acuerdo.

## Notas

- El tercer mensaje que había redactado (a analista-funcional, sobre si los campos personalizados son del SKU o de cada unidad) no se envió: la coordinación pidió enviar solo a ingeniero-datos y especialista-seguridad. La pregunta sigue abierta y está en la sección 2.1 y 3.5 del archivo `ronda1-arquitecto-software.md`.
- Cambio de procedimiento: las "preguntas para el CEO" de mi ronda 1 pasan a ser recomendaciones para el gerente-ti, que las decide en `docs/equipo/decisiones.md`. Solo se escala al CEO si hay dinero, temas legales o algo irreversible. De mis 12 preguntas, las que podrían tocar dinero son la 4 (monedas e impuestos), la 10 (archivos adjuntos, almacenamiento) y el servicio de envío de correos mencionado al final de la sección 4.

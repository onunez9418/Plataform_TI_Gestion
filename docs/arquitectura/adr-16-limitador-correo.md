# ADR-16 · Limitador de uso en la base y capa única de correo (T-12)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5 y Datos) · **Decide:** Gerente de TI (con DevOps) · **Base:** D-054, D-055 T-12, H-ARQ-20, D-061.4; H-SEG-46; D04-4

## Contexto
Varios módulos piden topes (ingreso, API, correos, exportaciones, invitaciones) y nadie definió dónde se cuentan. Un contador en memoria no sirve con más de una instancia. Redis sería una pieza nueva y un gasto. El correo es la puerta de entrada (no hay contraseñas), así que su falla impide el acceso.

## Opciones
1. Redis. Descartada salvo que se mida la necesidad; si ocurre, **[ESCALAR AL CEO]** por costo.
2. Memoria de cada instancia. Descartada.
3. **Tabla en PostgreSQL con ventana fija.** Elegida: suficiente al volumen supuesto.

## Decisión

### Limitador
- Tabla global `limite_uso(cubo, clave_huella, ventana_inicio, contador)` (ADR-04). La clave se guarda como **huella de nivel A** (ADR-09; correos e IP son datos personales). Es la tabla global con más escrituras por segundo y su contenido es descartable: H5/H10 miden dos variantes, tabla normal con `fillfactor = 50` y limpieza por trabajo cada hora, y tabla `UNLOGGED` (más rápida; se vacía sola tras una caída del servidor, lo que como máximo "perdona" los contadores del último minuto, y no se replica). Si la diferencia es menor al 30 % en p95, se queda la normal (D04-4).
- Función DEFINER `limite_consumir(cubo, clave, tope, ventana)`: `INSERT … ON CONFLICT DO UPDATE SET contador = contador + 1 RETURNING contador`; atómica. Ventanas fijas por minuto, hora o día.
- Cuadro único `TOPES` en código, copiado de D-054.2: enlaces de ingreso 5 por correo por hora, 10 por día y 20 por IP por hora; 5 intentos fallidos y esperas de 1, 2, 5 y 15 min; invitaciones 20 por administrador por hora y 100 por empresa por día; importaciones 10 por día por empresa; exportaciones 10 por usuario por hora y 100 por empresa por día; lectura masiva por API; revelar clave de licencia 20 por usuario por hora; correos 1.000 por día por empresa con cupo propio para los obligatorios y para `compras.orden_por_aprobar`. Cambiar un tope es cambiar el cuadro, no un módulo.
- Limpieza diaria de ventanas viejas (programador, ADR-02). El tope por correo no bloquea al dueño que ya tiene un enlace válido.
- **Falla cerrada:** si `limite_consumir` falla (base, función o tabla), el **ingreso y la exportación se rechazan** con el mensaje de "intente de nuevo"; no se deja pasar sin contar. Lo mismo para el asistente (ADR-22) y la sincronización con Microsoft (ADR-21): si el limitador falla, esas funciones se rechazan, sin tocar el resto de la plataforma.
- Entran al cuadro `TOPES` los de los módulos nuevos (valores a fijar con el módulo): asistente por usuario por minuto y por día, por empresa por día y por mes (en tokens y en solicitudes), y mensajes simultáneos por usuario (ADR-22); "sincronizar ahora" por empresa y llamadas diarias a Microsoft por empresa (ADR-21).
- Los rechazos generan evento de seguridad con tope de ritmo.

### Correo
- Una sola capa `enviarCorreo(plantilla, destinatario, datos)`: encola el envío (ADR-02) con reintentos; nada de envíos desde la petición. **La carga útil lleva solo identificadores.** Los tres correos que deben contener un valor en claro que sirve para entrar (enlace de ingreso, invitación, acceso de emergencia) **no reciben el valor en `datos`**: llevan el identificador de su fila y el valor **nace en el trabajador al enviar** (ADR-08, H-SEG-46); la plantilla recibe un campo tipado `Secreto`. Sin reintentos después de que el enlace venza (15 minutos desde el pedido); **un fallo definitivo anula la huella del valor emitido** (`*_anular_emision`, ADR-08) y nunca queda en trabajos muertos.
- Interfaz `ProveedorCorreo` con tres implementaciones: **captura** (desarrollo y pruebas: nunca sale a internet, legible por QA), **primario** y **secundario** (conmutación tras fallos repetidos). Producción se niega a arrancar en modo captura.
- **Plantillas de texto fijo** con datos tipados (sin campos libres). A una Persona sin Usuario o dirección no verificada solo van tipo de aviso, código (`ACT-E-000123`), fecha y empresa (D-061.4). Los correos de la v1 son invitación, acceso y aprobación.
- Cupo propio para obligatorios (acceso, invitación, aprobación) para que un exceso de avisos no los bloquee.
- El estado de entrega llega del aviso firmado del proveedor y entra por `estado_correo_registrar` (DEFINER).
- DevOps configura SPF, DKIM y DMARC en un subdominio de envío y la matriz de entrega.

## Consecuencias
- Cada comprobación de tope es una escritura en la base: bajo, pero se mide (H10). Si se supera, se agrupa por ventana en memoria con confirmación cada pocos segundos.
- Un segundo proveedor configurado de reserva puede ser gratuito (ya escalado en D1).

## Qué prueba lo valida
- Prueba de concurrencia: 100 intentos simultáneos con tope 10 permiten exactamente 10.
- Con el reloj fijable: esperas 1/2/5/15 minutos; cupo de obligatorios intacto al agotar el total.
- Tiempo de respuesta igual con correo existente o inexistente (ADR-08).
- Correo en producción con proveedor caído: reintentos, conmutación, alarma si el acceso tarda > 2 minutos.
- Ninguna plantilla acepta texto libre (tipado) y la captura del correo no contiene serie, IMEI, importes ni enlaces de acción para destinatarios sin Usuario.
- Con `limite_consumir` roto a propósito, el ingreso y la exportación **fallan cerrados**.
- Medición de `limite_uso` normal frente a `UNLOGGED` (H5/H10).

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-46 | Incorporado: la carga del correo lleva solo identificadores; el valor nace en el trabajador. |
| Observación de Seguridad (ADR-16) | Incorporado: falla cerrada del limitador para ingreso y exportación. |
| D04-4 | Incorporado como medición (normal frente a `UNLOGGED`). |
| ADR-21, ADR-22 | Nuevos topes en `TOPES`, a fijar con los módulos. |

## Qué cambió tras la ronda 6 (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-46 cond. 3 | Incorporado: el fallo definitivo del envío anula la huella; el limitador sigue cerrando ante fallo (también para `recuperacion_usar`, ADR-08, H-SEG-76). |

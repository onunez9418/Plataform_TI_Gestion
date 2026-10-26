# ADR-16 · Limitador de uso en la base y capa única de correo (T-12)

**Estado:** Propuesto · **Decide:** Gerente de TI (con DevOps) · **Base:** D-054, D-055 T-12, H-ARQ-20, D-061.4

## Contexto
Varios módulos piden topes (ingreso, API, correos, exportaciones, invitaciones) y nadie definió dónde se cuentan. Un contador en memoria no sirve con más de una instancia. Redis sería una pieza nueva y un gasto. El correo es la puerta de entrada (no hay contraseñas), así que su falla impide el acceso.

## Opciones
1. Redis. Descartada salvo que se mida la necesidad; si ocurre, **[ESCALAR AL CEO]** por costo.
2. Memoria de cada instancia. Descartada.
3. **Tabla en PostgreSQL con ventana fija.** Elegida: suficiente al volumen supuesto.

## Decisión

### Limitador
- Tabla global `limite_uso(cubo, clave_huella, ventana_inicio, contador)` (ADR-04). La clave se guarda como **huella** (correos e IP son datos personales).
- Función DEFINER `limite_consumir(cubo, clave, tope, ventana)`: `INSERT … ON CONFLICT DO UPDATE SET contador = contador + 1 RETURNING contador`; atómica. Ventanas fijas por minuto, hora o día.
- Cuadro único `TOPES` en código, copiado de D-054.2: enlaces de ingreso 5 por correo por hora, 10 por día y 20 por IP por hora; 5 intentos fallidos y esperas de 1, 2, 5 y 15 min; invitaciones 20 por administrador por hora y 100 por empresa por día; importaciones 10 por día por empresa; exportaciones 10 por usuario por hora y 100 por empresa por día; lectura masiva por API; revelar clave de licencia 20 por usuario por hora; correos 1.000 por día por empresa con cupo propio para los obligatorios y para `compras.orden_por_aprobar`. Cambiar un tope es cambiar el cuadro, no un módulo.
- Limpieza diaria de ventanas viejas (programador, ADR-02). El tope por correo no bloquea al dueño que ya tiene un enlace válido.
- Los rechazos generan evento de seguridad con tope de ritmo.

### Correo
- Una sola capa `enviarCorreo(plantilla, destinatario, datos)`: encola el envío (ADR-02) con reintentos; nada de envíos desde la petición.
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

# Propuesta de texto R4: separación de funciones en compras

Autor: auditor-cumplimiento. Para integrar en las secciones 5 y 9 de la v0.2 por el analista-funcional, cuando el gerente-ti cierre `docs/equipo/decisiones.md`.
Es una propuesta de redacción, no cambia el documento funcional por sí sola. Una regla por línea.

## Texto propuesto para la sección 5 (Usuarios, roles y permisos)

- S5-1. Aprobar, recibir y administrar usuarios y roles son permisos distintos; ningún rol los trae juntos por defecto.
- S5-2. El rol Administrador gestiona empresa, usuarios y roles; no trae por defecto los permisos de aprobar ni de recibir. Puede asignárselos, y cada asignación queda en auditoría.
- S5-3. Todo rol nuevo parte sin permisos.
- S5-4. Un usuario no puede cambiar sus propios permisos ni crear un rol con más permisos de los que él mismo tiene.
- S5-5. Crear o modificar proveedores es un permiso distinto de crear órdenes de compra.
- S5-6. Siempre debe quedar al menos un administrador activo por empresa; el sistema impide quitar al último.
- S5-7. Las reglas de separación de funciones las hace cumplir el sistema en el servidor, no solo la pantalla.

## Texto propuesto para la sección 9 (Órdenes de compra)

- S9-1. Quien crea o edita una orden no puede aprobarla.
- S9-2. Nadie aprueba ni rechaza su propia solicitud.
- S9-3. Quien aprueba una orden no puede recibir la mercadería de esa misma orden.
- S9-4. Quien recibe la mercadería no puede haber creado ni aprobado esa orden.
- S9-5. Si cambian el precio, la cantidad, el proveedor o el total de una orden Aprobada o Emitida, vuelve a Pendiente de aprobación y se anula la aprobación anterior.
- S9-6. Excepción por monto bajo (propuesta de seguridad, RS-18): cada empresa define un monto bajo el cual no se exige aprobación de una segunda persona. Solo exime de la aprobación; nunca permite que quien aprueba también reciba.
- S9-7. Excepción para empresas con una sola persona de TI: no está activa por defecto. Si el administrador la permite, el texto no la decide; la decide el gerente-ti. Mientras esté activa se muestra un aviso visible en la orden.
- S9-8. Cada uso de una excepción (S9-6 o S9-7) queda en auditoría con quién, cuándo, monto y orden.
- S9-9. Una orden Aprobada no se edita sin pasar por S9-5; una orden Recibida o Cerrada no se edita, solo se corrige con un registro nuevo (nota de ajuste) que queda en auditoría.
- S9-10. Todo cambio de estado de la orden registra quién, cuándo y motivo (el motivo es obligatorio al Rechazar y al Anular).

## Tabla de transiciones de la orden de compra (incluye Rechazada)

| Desde | Hacia | Quién puede | Condición |
|---|---|---|---|
| Borrador | Pendiente de aprobación | Quien la creó | Tiene al menos una línea |
| Borrador | Anulada | Quien la creó o con permiso de anular | Motivo obligatorio |
| Pendiente de aprobación | Aprobada | Aprobador distinto de quien la creó o editó | S9-1, S9-2; si aplica S9-6, queda auditado |
| Pendiente de aprobación | Rechazada | Aprobador distinto de quien la creó | Motivo obligatorio |
| Pendiente de aprobación | Borrador | Quien la creó (retira la solicitud) | Queda en auditoría |
| Rechazada | Borrador | Quien la creó | Para corregirla y reenviar; conserva el historial del rechazo |
| Rechazada | Anulada | Quien la creó o con permiso de anular | Motivo obligatorio |
| Aprobada | Emitida al proveedor | Quien tenga permiso de emitir | Sin cambios pendientes (S9-5) |
| Aprobada | Pendiente de aprobación | Automático | Por S9-5 |
| Aprobada | Anulada | Con permiso de anular | Motivo obligatorio |
| Emitida al proveedor | Recibida (parcial o total) | Receptor distinto de quien creó y de quien aprobó | S9-3, S9-4 |
| Emitida al proveedor | Pendiente de aprobación | Automático | Por S9-5 |
| Emitida al proveedor | Anulada | Con permiso de anular | Motivo obligatorio; solo si no hay recepciones |
| Recibida parcial | Recibida parcial o total | Receptor (mismas reglas) | Cada recepción se registra por separado |
| Recibida total | Cerrada | Quien tenga permiso de cerrar | Sin diferencias abiertas |

No se permite ninguna otra transición. "Anulada" y "Cerrada" son estados finales. "Rechazada" no es final: permite corregir y reenviar, y cada rechazo queda en el historial.

## Pendiente de decisión (no lo resuelve este texto)

- Monto bajo de S9-6 (lo fija cada empresa; el gerente-ti decide si hay un tope máximo).
- Excepción de S9-7 para una sola persona de TI (decide el gerente-ti).
- Si dar de baja un activo de valor alto exige segunda persona y desde qué monto (mi R4, último punto).
- Si el CEO decide cualquier excepción que implique dinero o riesgo irreversible, se escala por la Jefatura de Proyecto.

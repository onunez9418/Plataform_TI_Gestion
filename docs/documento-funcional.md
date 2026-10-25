# Documento funcional: Plataforma de Gestión de Áreas de TI

**Versión:** 0.1 (borrador para revisión)
**Estado:** pendiente de aprobación del solicitante

> Este documento describe **qué hace** la plataforma, en lenguaje simple. No habla de tecnología.
> Las secciones marcadas con **[PENDIENTE]** son decisiones que aún no se han tomado.

---

## 1. Propósito

Una plataforma web para que el área de TI de cualquier empresa pueda controlar sus activos tecnológicos (equipos, periféricos, celulares, licencias), y gestionar las compras y los servicios que se hacen alrededor de ellos, con trazabilidad de quién hizo qué.

## 2. Alcance de la versión 1

**Incluye**
1. Acceso con cualquier tipo de correo.
2. Empresas, usuarios, roles y permisos.
3. Catálogos configurables (marca, modelo, categoría, proveedor, ubicación, etc.).
4. Maestro de artículos (SKU) con campos personalizados por categoría.
5. Inventario de activos: con serie y sin serie.
6. Órdenes de compra, con aprobación, y recepción de mercadería.
7. Órdenes de servicio.
8. Historial de cambios (auditoría).

**No incluye (versiones futuras)**: tickets de soporte, mantenimiento preventivo, reportes avanzados, integración con SAP, aplicación móvil.

## 3. Glosario

| Término | Significado |
|---|---|
| **Empresa** | Una organización que usa la plataforma. Sus datos están completamente separados de los de otras empresas. |
| **SKU** | Código que identifica un *tipo* de artículo. Ej.: `LAP-0001` = Laptop Dell Latitude 5440 i7/16GB. Existe una sola vez. |
| **Serie** | Número de serie de una unidad física concreta. Un SKU puede tener muchas series. |
| **Activo** | Una unidad física que la empresa posee (una laptop concreta, un celular concreto). |
| **Control por serie** | El SKU se rastrea unidad por unidad (laptops, celulares, licencias con clave). |
| **Control por cantidad** | El SKU solo lleva un conteo de stock, sin series (mouse, teclados, cables). |
| **Categoría** | Agrupación de SKUs (Laptops, Celulares, Periféricos, Licencias). Define el prefijo del SKU y los campos extra. |
| **Catálogo** | Lista de valores que el administrador mantiene (marcas, modelos, proveedores, ubicaciones). |
| **Rol** | Conjunto de permisos que se asigna a un usuario (ej. Técnico, Jefatura TI). |
| **Orden de compra (OC)** | Documento para comprar artículos a un proveedor. |
| **Recepción** | Registro de que la mercadería de una OC llegó. Aquí se capturan las series. |
| **Orden de servicio (OS)** | Documento para pedir o registrar un trabajo (reparación, instalación, servicio externo). |

## 4. Acceso y empresas

- Cualquier persona puede entrar con su correo (personal, corporativo, Gmail, Outlook, etc.).
- Una persona puede pertenecer a más de una empresa y elegir con cuál trabaja.
- Cada empresa solo ve sus propios datos.
- El primer usuario de una empresa es su administrador y puede invitar a los demás por correo.

## 5. Usuarios, roles y permisos

Cada usuario tiene un **rol** dentro de cada empresa. Cada rol define qué acciones permite (ver, crear, editar, aprobar, dar de baja) en cada módulo. El administrador puede crear roles propios y modificar los existentes.

**Roles iniciales propuestos** (se ajustan en la Etapa 0):

| Rol | Qué puede hacer (resumen) |
|---|---|
| Administrador | Todo, incluida la configuración de la empresa, usuarios y roles. |
| Jefatura TI | Ver todo, aprobar órdenes, ver auditoría. |
| Técnico | Gestionar inventario y órdenes de servicio. |
| Almacén | Recibir mercadería, registrar series, mover stock. |
| Solicitante | Crear solicitudes de compra o servicio y ver las propias. |
| Solo lectura | Consultar sin modificar. |

## 6. Catálogos y categorías

- El administrador mantiene los catálogos (marca, modelo, proveedor, ubicación, centro de costo, etc.) y puede **crear catálogos nuevos** sin ayuda técnica.
- Las categorías pueden tener subcategorías (ej. Periféricos > Mouse).
- Cada categoría tiene un **prefijo** para generar los SKUs (ej. `LAP`, `CEL`, `PER`, `LIC`).
- Cada categoría puede definir **campos personalizados**, que heredan todos sus SKUs:
  - Tipos permitidos: texto, número, fecha, lista de opciones, sí/no.
  - Cada campo puede ser obligatorio u opcional.
  - Ejemplos: Laptop → RAM, disco, procesador. Celular → IMEI, número de línea. Licencia → fecha de vencimiento, número de puestos.

## 7. Maestro de artículos (SKU)

Cada SKU tiene: código, nombre, categoría, marca, modelo, unidad de medida, estado (activo/inactivo), **modo de control** (por serie o por cantidad) y los campos personalizados de su categoría.

**Código del SKU**
- Se genera automáticamente: prefijo de la categoría + correlativo (`LAP-0001`, `LAP-0002`...).
- El usuario con permiso puede escribir un código propio (ej. el que usa SAP). No se permiten códigos repetidos dentro de la empresa.

**Licencias**
- No son un tipo especial. Se resuelven con el modo de control del SKU:
  - *Por serie*: cada clave de licencia es una serie.
  - *Por cantidad*: se lleva un total de licencias o puestos.

## 8. Inventario

**Artículos con serie.** Cada unidad se registra con su número de serie, estado, ubicación, responsable, fecha de compra, garantía y la orden de compra de origen.

Estados propuestos: En stock · Asignado · En reparación · De baja. **[PENDIENTE]** confirmar la lista exacta con la empresa.

**Artículos por cantidad.** Se lleva el stock por ubicación. Se registran ingresos, salidas y traslados.

**Historial.** Cada ingreso, asignación, traslado, reparación o baja queda registrado con fecha, usuario y motivo.

**Asignación.** Un activo con serie se puede asignar a un usuario o ubicación, y queda constancia de la entrega y de la devolución.

## 9. Órdenes de compra

**Flujo propuesto**

```
Borrador → Pendiente de aprobación → Aprobada → Emitida al proveedor
        → Recibida (parcial o total) → Cerrada
(en cualquier punto antes de recibir: Anulada)
```

- La orden se hace sobre **SKUs** (cantidad y precio por línea), no sobre series.
- La aprobación es **configurable por empresa**: se puede exigir o no, y según el monto o el tipo de orden. **[PENDIENTE]** definir quién aprueba y con qué montos.
- **Recepción**: al recibir la mercadería se indican las cantidades que llegaron. Si el SKU controla serie, se capturan los números de serie (a mano o pegando una lista). Al confirmar, los activos se crean automáticamente en el inventario. Si el SKU controla cantidad, se suma al stock.
- Se permiten recepciones parciales.

## 10. Órdenes de servicio

**Flujo propuesto**

```
Creada → Asignada → En ejecución → Cerrada
(Cancelada en cualquier punto antes de cerrar)
```

- Se registra quién la solicita, el tipo de servicio, el activo relacionado (si aplica) y a quién se asigna (técnico interno o proveedor).
- **[PENDIENTE]** definir tipos de servicio, si requieren aprobación y si generan costo.

## 11. Auditoría

Se guarda quién creó, modificó, aprobó o eliminó cada registro importante, y cuándo. Solo los roles con permiso pueden consultarlo.

---

## 12. Pendientes por resolver en la Etapa 0

| # | Pendiente | Quién responde |
|---|---|---|
| 1 | Quién aprueba las órdenes de compra y con qué montos | Solicitante |
| 2 | Estados exactos de un activo durante su vida útil | Solicitante |
| 3 | Tipos de servicio y su flujo | Solicitante |
| 4 | Volumen aproximado de activos, usuarios y órdenes por mes | Solicitante |
| 5 | ¿Se integrará con SAP más adelante? | Solicitante |
| 6 | Ajuste final de los roles y permisos | Solicitante |
| 7 | Revisión de una OC real, una OS real y el Excel de inventario actual | Solicitante |

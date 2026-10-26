# ADR-15 · Correlativos por contador atómico y patrones de concurrencia (T-11)

**Estado:** Propuesto · **Decide:** Gerente de TI (con Ingeniero de Datos) · **Base:** D-007, D-055 T-11, H-ARQ-15, H-ARQ-17, D-049

## Contexto
Hay unas 20 numeraciones (`OC-`, `RCP-`, `CTR-`, `PRS-`, códigos de SKU…). D-007 pide que el número se asigne en la misma operación que crea el registro; pero bloquear el contador hasta el final de una importación de 5.000 filas o una recepción larga frena a todos los demás. D-007.2 ya acepta saltos.

## Decisión

### Contadores
- Tabla `contador(empresa_id, clave, ultimo)` con seguridad por fila; la clave tiene espacio de nombres: `sku:<prefijo>`, `doc:OC`, `prs`. Para SKU la clave es el **prefijo** (no la categoría): las subcategorías usan el de su categoría principal, y cambiar el prefijo no cambia los códigos existentes.
- `siguiente(empresa, clave, n)` es **una sola sentencia** `INSERT … ON CONFLICT (empresa_id, clave) DO UPDATE SET ultimo = contador.ultimo + n RETURNING ultimo`: reserva `n` números, sin bloqueo más largo que la sentencia.
- **Se llama antes de abrir la transacción principal**, nunca dentro de ella ni anidada (anidarla exige una segunda conexión y puede agotar el grupo). El servicio hace: reservar, luego `conEmpresa(… crear con los números)`. Si la operación falla, queda un salto: está permitido.
- Una importación reserva un rango de una vez (`n` = filas). Formato y ancho (mínimo 6 dígitos en documentos, 4 en SKU, `PRS-` de 4) los define cada módulo en su registro; el prefijo reservado no se puede usar en categorías (D-049.3).

### Patrones de concurrencia obligatorios
Una guía corta; cada uno tiene una prueba que escribe QA contra PostgreSQL real.

| # | Patrón | Se usa para |
|---|---|---|
| 1 | **Índice único parcial** `WHERE hasta IS NULL` | Un solo vigente: asignación abierta por activo, línea activa por número, puesto por persona y contrato |
| 2 | **Actualización condicional** (`UPDATE … WHERE estado = $esperado AND version = $v`; 0 filas = "ya fue decidido") | Aprobar, cerrar, cancelar, decidir |
| 3 | **Capacidad**: `UPDATE … SET usados = usados + 1 WHERE usados < total` más `CHECK` | Stock sin negativos, puestos de licencia, cantidad pendiente de recepción |
| 4 | **Clave de idempotencia** (tabla con vencimiento) en toda operación que se confirma o llega por la API | Recepciones, importaciones, webhooks |
| 5 | **`version`** en toda entidad editable (RN-014) | Edición simultánea, ver "alguien lo cambió" |

## Opciones descartadas
- Reservar dentro de la transacción principal (D-007 literal): bloquea la numeración durante todo el trabajo.
- `SEQUENCE` por empresa y clave: no se pueden crear en tiempo de ejecución con un rol sin dueño.
- Sin saltos garantizados: obliga a bloquear; el CEO ya aceptó saltos.

## Consecuencias
- Los números pueden tener huecos; el documento funcional ya lo dice y el visor no promete correlatividad sin saltos.
- Un solo punto caliente por clave, pero de duración de una sentencia.

## Qué prueba lo valida
- H5: 20 y 50 conexiones simultáneas pidiendo 100 números cada una: cero duplicados, cero interbloqueos, p95 de `siguiente` ≤ 50 ms; una reserva de 5.000 no retrasa a otros más de 100 ms; 50 solicitudes simultáneas con un grupo de 10 conexiones no se bloquean (prueba contra el agotamiento).
- H4: 50 aprobaciones simultáneas: gana exactamente una; 200 intentos sobre 100 puestos: exactamente 100 éxitos.
- Una prueba por patrón (QA), incluida la de dos recepciones a la vez de la misma orden (D-016).

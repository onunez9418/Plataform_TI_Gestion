# ADR-13 · Servicio único de segunda persona: `requiereSegundaPersona` (T-9)

**Estado:** Propuesto (revisado 2026-10-29 tras Seguridad ronda 5) · **Decide:** Gerente de TI (revisa Cumplimiento) · **Base:** D-015, D-031, D-043, D-065 S-33, D-066, D-070; H-SEG-59, 60, 61

## Contexto
La separación de funciones estaba definida nueve veces, con excepciones propias en cambios, presupuestos y contratos, y con dos lecturas de "quien crea o edita".

## Decisión

### La regla de monto: una función pura
`requiereSegundaPersona(acto, monto, moneda)`:
- compara el **importe total comprometido, con impuesto y en la moneda base**, contra el límite de la empresa (RN-017), **estrictamente mayor**;
- con límite 0, toda orden con al menos una línea exige segunda persona; una orden con todas las líneas "sin costo" y límite 0 también (D-075);
- una moneda distinta de la base siempre exige;
- un documento sin costo no pasa por la regla de dinero (los actos "siempre" son otra regla);
- el "costo comprometido" de línea, dominio, certificado, garantía extendida o mantenimiento sin orden se calcula según D-070.
La **tabla de actos** (D-043.4) es un dato en código: cada acto declara su regla (`monto | siempre | otra_persona | prohibido`). Un acto nuevo se agrega ahí y en el registro, nunca en el módulo.

### El servicio único `dobleControl`
- Tabla `participacion_documento(empresa_id, id, <una columna de documento por tipo con clave foránea compuesta y CHECK de una sola llena, D-039.7>, ciclo, membresia_id, rol, en)` con `rol` ∈ `creo | edito | aprobo | recibio | implemento`. `ciclo` sube con cada aprobación. **Solo agregar** (H-SEG-60): `INSERT` y `SELECT` únicamente, con el mismo disparador anti-UPDATE/DELETE/TRUNCATE de la auditoría; si `app_empresa` pudiera borrarla, quien editó una orden borraría su fila y quedaría elegible para aprobarla. La separación de funciones se apoya en `membresia_id`, por eso `membresia` lleva índice único `(empresa_id, cuenta_usuario_id)` (una persona, una membresía por empresa; ya figura como A3 en `indices-claves-naturales.md`). Si una integración (clave de API) puede crear o editar un documento sujeto a doble control, la participación se atribuye **también a la membresía que creó la clave**, o a la integración no se le permite entrar a ese ciclo (RN-INT-010 ya le impide aprobar).
- **Definición única:** no aprueba nadie que haya **creado o editado desde la última aprobación**. Si alguien cambia un **campo que compromete** de un documento aprobado, vuelve a pendiente y el editor no puede reaprobar.
- **Lista cerrada de campos que comprometen (H-SEG-59).** No basta "precio, cantidad o proveedor": la regla de monto depende además de moneda, impuesto y descuentos, y una orden tiene condiciones de pago y dirección de entrega. Cada documento sujeto a doble control declara en código su lista cerrada: importe, moneda, impuesto, descuentos, líneas agregadas o quitadas, cantidades y precios de línea, proveedor y **sus datos de pago**, condiciones de pago y dirección de entrega. El Analista confirma la lista de campos. Una **prueba de arquitectura** falla la integración continua cuando aparece una columna nueva en esas tablas sin clasificarla como "reabre" o "no reabre".
- **Aprobar** es una actualización condicional: espera el estado y la `version` leídos, con la fila del documento bloqueada en la misma transacción, de modo que una edición simultánea no se cuele entre la comprobación y la aprobación.
- El permiso de control "No" (nunca sobre lo propio, ADR-10) lo resuelve este servicio.
- **Segunda barrera en la base (H-SEG-61; recomendación de Seguridad, adoptada):** un disparador en las órdenes de compra y de servicio rechaza el paso a "Aprobada" si el aprobador es quien creó o editó un campo que compromete desde la última aprobación, salvo que el documento lleve la marca de excepción vigente. Es poco código y protege el acto más sensible contra un olvido futuro del servicio (en el espíritu de D-025: filtro en el código y en la base).

### El interruptor único
`excepcionActiva(empresa, casilla)` es la **única** función que lee el ajuste. Ocho casillas (D-043.2 y mapa D-066): compras, recepción, presupuestos, contratos y servicios recurrentes, licencias, mesa de ayuda, cambios y problemas. Apagadas por defecto; vencen a 90 días; con dos o más administradores, uno la activa y otro la confirma; solo un Administrador (con verificación reciente) y la plataforma no puede activarla; cada uso muestra aviso en el documento y se audita; resumen mensual a administradores y Jefatura TI (trabajador). La **autoentrega de equipos no tiene casilla**.

## Opciones descartadas
- Reglas propias por módulo: ya demostraron inconsistencia (RN-CAM-004, S-PRE-12).
- Interruptor global de plataforma: no cubre empresas con distinta estructura.

## Consecuencias
- Todo módulo que apruebe algo declara su acto y llama al servicio; una regla nueva es una fila de datos.
- Una empresa con una sola persona de TI depende de la casilla vencible: es el comportamiento deseado por Cumplimiento.

## Qué prueba lo valida
- Pruebas unitarias de `requiereSegundaPersona` con una fila por cada acto de D-043.4 y los bordes (monto = límite, límite 0, otra moneda, sin costo).
- Por cada regla: la violación intentada **por la API** con la casilla apagada y con ella vencida (D-043.6).
- Simultaneidad (H4): 50 aprobaciones a la vez del mismo documento, gana exactamente una; edición simultánea con aprobación no permite que aprobador y editor coincidan.
- Prueba de arquitectura: ningún módulo lee la tabla de excepciones; toda columna de los documentos sujetos a doble control está clasificada como "reabre" o "no reabre".
- `app_empresa` no puede borrar ni editar `participacion_documento`; el disparador de aprobación rechaza a quien editó un campo que compromete, también con SQL directo; cambio de moneda, impuesto, condiciones de pago o datos de pago del proveedor tras la aprobación reabre el documento; una persona no puede tener dos membresías en la misma empresa; pruebas por la API (D-043.6).

## Qué cambió tras la revisión (2026-10-29)
| Hallazgo | Qué se hizo |
|---|---|
| H-SEG-59 | Incorporado: lista cerrada por documento y prueba de arquitectura. El Analista confirma la lista. |
| H-SEG-60 | Incorporado: tabla solo agregar, índice único de membresía, atribución a quien creó la clave de API. Corrección propia: la referencia al documento pasa de `tipo + id` a una columna por tipo (D-039.7). |
| H-SEG-61 | Incorporado (se adopta aunque era recomendación).

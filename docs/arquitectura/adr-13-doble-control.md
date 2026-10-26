# ADR-13 · Servicio único de segunda persona: `requiereSegundaPersona` (T-9)

**Estado:** Propuesto · **Decide:** Gerente de TI (revisa Cumplimiento) · **Base:** D-015, D-031, D-043, D-065 S-33, D-066, D-070

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
- Tabla `participacion_documento(empresa_id, tipo, documento_id, ciclo, membresia_id, rol, en)` con `rol` ∈ `creo | edito | aprobo | recibio | implemento`. `ciclo` sube con cada aprobación.
- **Definición única:** no aprueba nadie que haya **creado o editado desde la última aprobación**. Si alguien edita precio, cantidad o proveedor de una orden aprobada, vuelve a pendiente y el editor no puede reaprobar.
- **Aprobar** es una actualización condicional: espera el estado y la `version` leídos, con la fila del documento bloqueada en la misma transacción, de modo que una edición simultánea no se cuele entre la comprobación y la aprobación.
- El permiso de control "No" (nunca sobre lo propio, ADR-10) lo resuelve este servicio.

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
- Prueba de arquitectura: ningún módulo lee la tabla de excepciones.

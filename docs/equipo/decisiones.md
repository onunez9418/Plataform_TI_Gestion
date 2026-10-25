# Decisiones del equipo

El CEO ya no responde preguntas de producto ni de ingeniería. Las decide el Gerente de TI, con la recomendación de cada rol. Las que cambien reglas de negocio quedan escritas aquí y pasan al documento funcional.

Formato de cada decisión: pregunta, opciones, recomendación, quién recomienda, **DECISIÓN** (la llena el gerente-ti), motivo, bloquea a.

## A. Preguntas del Analista de Negocio (antes sección 12 del documento funcional v0.1)

Etapa que bloquea cada una, según la revisión de la Ronda 1.

### A1. Aprobación de órdenes de compra: quién aprueba y con qué montos
- Opciones: (a) sin aprobación; (b) un nivel con monto límite por empresa; (c) varios niveles.
- Recomendación: (b). El analista, el gerente-ti y el auditor-cumplimiento coinciden. Moneda: cada OC lleva una sola moneda; el monto límite se define en la moneda base de la empresa.
- DECISIÓN: [pendiente, gerente-ti] · Bloquea: Etapa 5.

### A2. Estados de un activo
- Recomendación: En stock, Asignado, En reparación, En préstamo, En tránsito, Extraviado o robado, De baja. Lista cerrada, con transiciones permitidas escritas en una tabla. Una baja se puede revertir con permiso y motivo (la unidad nunca se duplica). Motivo obligatorio en baja y extravío.
- Recomienda: analista, ux, ingeniero-datos, qa.
- DECISIÓN: [pendiente, gerente-ti] · Bloquea: Etapa 4.

### A3. Tipos de servicio y su flujo
- Recomendación: iniciar con Reparación, Instalación y Servicio externo; aprobación solo si tiene costo; abrir una OS sobre un activo lo pasa a "En reparación" solo si el tipo es Reparación.
- DECISIÓN: [pendiente, gerente-ti] · Bloquea: Etapa 6.

### A4. Volumen aproximado de activos, usuarios y órdenes por mes
- Sin cifras, el arquitecto asume decenas de miles de activos por empresa. Se anota como supuesto, no como dato.
- DECISIÓN: [pendiente, no bloquea; se usa el supuesto] · Orienta: todas las etapas.

### A5. Integración con SAP más adelante
- Recomendación: no entra en la v1; el código del SKU sigue editable para poder usar el de SAP; se deja de tratar como pregunta y pasa a "futuro".
- DECISIÓN: [pendiente, gerente-ti] · Bloquea: nada.

### A6. Roles y permisos finales
- Recomendación: se parte de los 6 roles propuestos con una matriz módulo por acción (propuesta de QA, seguridad y auditor-cumplimiento), permisos sensibles separados (ver precios, ver datos personales, ver auditoría, importar, exportar, administrar roles). Todo rol nuevo parte sin permisos.
- DECISIÓN: [pendiente, gerente-ti] · Bloquea: Etapa 1.

### A7. Documentos reales (una OC, una OS, el Excel de inventario)
- Recomendación: el Excel llega con nombres de personas reemplazados (auditor-cumplimiento). Sin estos archivos se trabaja con datos ficticios y se declara así.
- Esta es la única petición que sí depende del Cliente (CEO): entregar los archivos. No es una decisión, es un insumo.
- DECISIÓN: [pendiente] · Bloquea: Etapa 0 (cierre) y Etapa 4.

## B. Preguntas nuevas que salieron de la Ronda 1 (a decidir por el gerente-ti)

### B1. Quién recibe los equipos: persona distinta de usuario
- Opciones: (a) todo receptor es usuario de la plataforma; (b) lista aparte de "personas" (nombre, área, correo) que reciben equipos sin acceso.
- Recomendación: (b). Recomiendan ux, ingeniero-datos, arquitecto, auditor-codigo. Requiere revisión del auditor-cumplimiento (datos personales).
- DECISIÓN: [pendiente] · Bloquea: Etapa 4.

### B2. Campos personalizados: del SKU o de la unidad
- Recomendación: cada campo declara su nivel. "Del SKU": RAM, procesador. "De la unidad": IMEI, número de línea, vencimiento de licencia. Los campos de la unidad solo aplican a SKUs por serie.
- Coinciden: ux, arquitecto, ingeniero-datos, auditor-codigo, analista.
- DECISIÓN: [pendiente, impacta el modelo] · Bloquea: Etapa 2.

### B3. Unicidad de la serie
- Recomendación: única por empresa y SKU; comparada sin distinguir mayúsculas ni espacios en los bordes; aviso si existe en otro SKU de la misma empresa.
- Recomiendan: qa, ingeniero-datos.
- DECISIÓN: [pendiente] · Bloquea: Etapa 4.

### B4. Acceso y creación de empresas
- Recomendación: sin registro abierto; las empresas las crea el equipo de TI; ingreso solo por invitación; correo verificado; invitación con vencimiento de 7 días y de un solo uso; cualquier tipo de correo permitido (cada empresa puede limitar dominios). Existe un administrador de plataforma que no ve los datos del negocio.
- Recomiendan: gerente-ti, seguridad, auditor-cumplimiento, analista.
- Forma de entrar (contraseña, enlace por correo, Google/Microsoft): recomendación del gerente-ti, enlace por correo.
- DECISIÓN: [pendiente] · Bloquea: Etapa 1.

### B5. Separación de funciones en compras
- Recomendación: el sistema impide que quien crea o edita una OC la apruebe. Quien aprueba no recibe esa OC. Excepción: solo si el administrador la habilita en su empresa; queda en auditoría con aviso visible. Un cambio de precio, cantidad o proveedor en una OC aprobada la devuelve a "Pendiente de aprobación".
- Desacuerdo: auditor-cumplimiento "nunca salvo decisión explícita"; QA y seguridad aceptan el permiso por empresa.
- DECISIÓN: [pendiente] · Bloquea: Etapa 1 (matriz de permisos) y Etapa 5.

### B6. Estados de la OC y rechazo
- Recomendación: Borrador, Pendiente de aprobación, Aprobada, Rechazada (con motivo), Emitida, Recibida parcial, Recibida total, Cerrada, Anulada. "Reabrir como borrador" desde Rechazada, con registro en auditoría y nueva aprobación. Si la empresa no exige aprobación, el estado "Pendiente" no aparece. Cierre manual con motivo cuando el proveedor ya no enviará el resto.
- Recomiendan: qa, ux, auditor-codigo.
- DECISIÓN: [pendiente] · Bloquea: Etapa 5.

### B7. Reglas de recepción
- Recomendación: no se recibe más de lo pedido; la confirmación es todo o nada; si llegan menos series que unidades, se crean los activos con las series que hay y el resto queda "por registrar"; un error de recepción se corrige con una anulación con motivo mientras los activos no hayan sido asignados.
- Pendiente de fijar por el gerente-ti: las tres reglas anteriores sobre series incompletas y anulación (ux recomienda B; qa recomienda B).
- DECISIÓN: [pendiente] · Bloquea: Etapa 5.

### B8. Importación inicial desde Excel
- Opciones: (a) todo o nada (ingeniero-datos); (b) importar válidas y reportar malas (qa).
- Recomendación del analista, aceptada por ingeniero-datos: vista previa obligatoria; lo predeterminado es todo o nada; importar solo las filas válidas exige aceptación explícita tras la vista previa; las válidas se guardan en una sola operación; las rechazadas se devuelven en un archivo con el motivo, listo para corregir y recargar; el lote queda registrado (quién, cuándo, archivo, filas cargadas y rechazadas) y se puede deshacer completo mientras no tenga movimientos posteriores. QA debe ajustar CA-10. Entra al alcance de la v1, en la Etapa 4.
- DECISIÓN: [pendiente] · Bloquea: Etapa 4.

### B9. Auditoría y retención
- Recomendación: auditoría inalterable que ni el administrador puede editar o borrar; "eliminar" significa "dar de baja o anular", nada con historial se borra de verdad (solo borradores); conservar 5 años (a confirmar con asesoría legal); datos personales de un usuario dado de baja se anonimizan a los 2 años. No se puede dar de baja a un usuario con activos asignados sin resolverlos.
- Recomienda: auditor-cumplimiento, seguridad, ingeniero-datos, arquitecto.
- DECISIÓN: [pendiente] · Bloquea: Etapa 1.

### B10. Moneda, impuestos y numeración
- Recomendación: cada OC lleva una sola moneda; cada empresa define una moneda base; sin conversión automática en la v1; impuesto por línea; numeración de OC y OS por empresa sin repetidos. Zona horaria e idioma: español, definidos por empresa.
- DECISIÓN: [pendiente] · Bloquea: Etapa 5.

### B11. Modo de control y código del SKU
- Recomendación: el modo de control no cambia cuando el SKU ya tiene movimientos; el código se normaliza (mayúsculas, sin espacios), no se reutiliza ni se edita con movimientos; el correlativo automático salta los códigos ya ocupados; stock por cantidad no puede quedar negativo; las correcciones son ajustes con motivo.
- DECISIÓN: [pendiente] · Bloquea: Etapa 3.

### B12. Alcance de la v1 (configurabilidad)
- Recomendación del gerente-ti: aprobación de un solo nivel, subcategorías a un solo nivel, roles editables sin permisos por campo. Pendiente de integrar: terminología, búsqueda, filtros y exportar a Excel en toda lista.
- DECISIÓN: [pendiente] · Orienta: todas las etapas.

### B13. Orden de las etapas 5 y 6
- Opciones: compras primero (como está) o servicios primero.
- Recomendación: compras primero.
- DECISIÓN: [pendiente].

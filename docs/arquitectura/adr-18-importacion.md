# ADR-18 · Importación: huella de archivo y filas en preparación (T-13)

**Estado:** Propuesto · **Decide:** Gerente de TI (el Ingeniero de Datos completa los índices, plan-aplicacion §3) · **Base:** D-050, D-070.6, D-072.2, D-022, D-054.2, H-ARQ-14

## Contexto
Ocho módulos piden "su" importación. D-050 definió un solo marco; D-022 dice que no hay almacenamiento de archivos y el archivo contiene datos personales. "Deshacer" significa cosas distintas en cada módulo.

## Decisión

### Tablas (todas con `aplicar_aislamiento`)
- `importacion_lote(id, tipo, huella_archivo, estado, creado_por, filas_total, secuencia_alta…)`; estados: preparando, validado, confirmado, en ejecución, completado, fallado, deshecho.
- `importacion_fila(lote_id, n_fila, datos_validados, errores, estado)`: **las filas ya validadas en preparación**, con `sin_soporte` (contienen datos personales). Se limpian al confirmar o a los **7 días** (trabajo programado).
- `lote_registro(lote_id, entidad_tipo, entidad_id)`: qué creó el lote, para poder anularlo.

### Flujo
1. **Lectura segura** en memoria: solo `.xlsx` y `.csv`; sin evaluar fórmulas ni entidades externas; límites de tamaño descomprimido, de hojas, columnas y largo de celda; rechazo de macros; tiempo máximo; 5.000 filas y 10 MB. La librería de lectura se escoge con Seguridad (sin vulnerabilidades conocidas, lectura en flujo). Celdas **de texto** que empiezan con `=`, `+`, `-`, `@`, tabulador o retorno se tratan como texto; las numéricas siguen siendo números. La empresa sale de la dirección, nunca del archivo.
2. **Huella SHA-256** del archivo. Índice único parcial `(empresa_id, huella_archivo) WHERE estado IN ('confirmado','en_ejecucion','completado')`: un archivo ya confirmado y no deshecho se rechaza entero con "este archivo ya se importó el [fecha] en el lote N". Un archivo corregido es otro archivo.
3. **El archivo no se guarda**: se descarta al terminar la lectura. Solo quedan filas validadas, la huella y el reporte de errores.
4. **Validación** contra la base: una fila cuya clave natural ya existe es error de esa fila. Valores desconocidos (marcas, ubicaciones) y SKU **no se crean solos**: se listan para aprobarlos en bloque. Orden de dependencias: catálogos, Personas, SKU, activos, saldos.
5. **Ejecución** en el trabajador (ADR-02) con avance; **todo o nada por lote**; **solo crea, no actualiza**. Una importación a la vez por empresa; 10 por día por empresa (ADR-16). Los números se reservan en un rango antes de empezar (ADR-15). Las invitaciones masivas del portal son por persona, no todo o nada (D-050.11).
6. **Claves naturales** (D-050.4, D-070.6), cada una con índice único parcial que excluye lo anulado: activo = SKU + serie normalizada; stock = un saldo inicial por SKU + ubicación; Persona = código de empleado o correo; línea = número; dominio = nombre normalizado; proveedor = identificación fiscal; SKU = código; contrato de licencia, certificado según D-070.6.
7. **Plantilla declarativa por entidad** (columnas, validaciones, resolución de referencias, aprobación de valores nuevos, operación de deshacer, campos personalizados por el validador de ADR-17). Cada módulo aporta la suya por el registro de módulo (ADR-14). Las claves de licencia **no entran por Excel**.
8. **Deshacer = anular, nunca borrar:** las filas pasan a "Anulado por lote deshecho", salen de conteos y unicidad, y conservan su historial. Solo si **ninguna** fila del lote tiene un movimiento posterior. La comprobación bloquea las filas del lote (`FOR UPDATE`) y exige que ninguna tenga una marca de secuencia posterior a su alta. La marca viene de una **secuencia de PostgreSQL creciente** (global; D-050.5 la pedía por empresa, aquí se evita un punto caliente y se conserva la propiedad "creciente", que es lo que importa; no se usa la hora).
9. **Auditoría:** una entrada de lote más su detalle (ADR-11), no 100.000 entradas sueltas. Las fechas aceptadas son `dd/mm/aaaa` o número de serie de Excel; las series dañadas se rechazan (D-072.2).

## Opciones descartadas
- Guardar el archivo 30 días (RF-IMP-012 original): datos personales y almacenamiento sin autorizar (D-022).
- Importación parcial con errores: contradice "todo o nada" y obliga a conciliar a mano.

## Consecuencias
- Si se pierde la sesión a mitad de la preparación, la persona vuelve a subir el archivo (la huella no se registra hasta confirmar).
- Cada entidad nueva con importación exige declarar su plantilla y su "deshacer".

## Qué prueba lo valida
- Mismo archivo dos veces: el segundo se rechaza; corregido, entra completo (100 filas).
- Deshacer con y sin movimiento posterior; condición de carrera: un movimiento llega mientras se deshace y gana el bloqueo, no se cuela.
- Fallo a mitad de ejecución (corte de conexión, ADR de inyección de fallos de DevOps): queda todo o nada.
- `importacion_fila` no es visible en sesión de soporte y se limpia a los 7 días con el reloj fijado.
- Archivos hostiles: fórmula inyectada, zip bomba, macros, celda enorme.

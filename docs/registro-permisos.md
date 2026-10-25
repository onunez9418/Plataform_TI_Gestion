# Registro único de permisos

**Versión:** 1 (parte de la v0.3 del documento funcional) · **Fecha:** 2026-10-25 · **Autor:** Analista de Negocio
**Base:** D-004 (reescrita), D-035, D-036, D-037, D-043, D-048, D-049, D-058, D-060, D-061. Sustituye a la matriz de la sección 7.3 de la v0.2.
**Quién aprueba cambios:** el Gerente de TI. Los módulos **no inventan permisos**: piden una fila nueva (D-036.1). Fuera de este registro no hay permiso.

## 1. Cómo se lee

- **PS-nn:** identificador funcional fijo. No se reutiliza ni se renumera.
- **Nombre técnico:** `modulo.accion`, minúsculas, un solo punto, guion bajo dentro de cada parte (D-036.2). Ejemplos: `ordenes_compra.aprobar`, `datos_personales.ver`. No existen variantes como `datos-personales.ver`, `personas.ver_datos`, `exportar.personas` ni `ayuda.caso.crear` (con dos puntos). El catálogo vive en el código y alimenta la pantalla de roles.
- **Sensible (S):** el permiso exige **segunda verificación obligatoria** a quien lo tenga (D-048.1), sin importar el nombre del rol. Los sensibles se otorgan por separado.
- **Controles** (D-036.5): **R** reautenticación reciente (10 minutos) · **2F** segundo factor · **A** cada uso queda en la auditoría · **T** tope por hora · **No** nunca sobre lo propio (separación de funciones: lo aplica el servicio único de doble control, D-043).
- **Motivo:** en los permisos marcados "(motivo)" el sistema pide siempre un motivo escrito (RN-008).
- **Cuándo:** `v1 E<n>` = núcleo, Etapa n · `Fase 2` / `Fase 3` = después de la Etapa 7, según D-056.
- **Valores por defecto por rol:** **T** = todo · **P** = solo lo propio · **-** = no puede. Siete plantillas de rol más el Administrador de plataforma.

| Columna | Rol |
|---|---|
| Adm | Administrador (de empresa) |
| Jef | Jefatura TI |
| Téc | Técnico |
| Alm | Almacén |
| Sol | Solicitante |
| SL | Solo lectura |
| Emp | Empleado (portal): plantilla cerrada de alcance propio, existe desde el portal (Fase 3); en la v1 su columna es informativa (D-037 fila 11) |
| Plat | Administrador de plataforma: fuera de las empresas, no ve datos del negocio; solo tiene los permisos `plataforma.*` y el de correo |

## 2. Reglas del registro

1. **Alcance cerrado:** solo "todo" o "propio" (D-036.4).
2. **Resolvedores de "propio"** (qué significa en cada recurso):

| Recurso | "Propio" significa |
|---|---|
| Orden de compra, orden de servicio, solicitud, cambio | La que **creó** la membresía (o la que figura como "Pedido por" ella) |
| Caso de mesa de ayuda, encuesta | El caso donde la Persona vinculada es la **Persona atendida** o quien lo pidió |
| Persona | La **Persona vinculada** a la membresía |
| Activo, línea, licencia, entrega, acta | Lo que tiene **asignación abierta** a la Persona vinculada |
| Tarea de alta o baja | La tarea **asignada** a la membresía |
| Aviso de vencimiento | Donde la Persona vinculada es **responsable** o suplente |
| Presupuesto, gasto | Donde la Persona vinculada es **responsable del centro de costo** |
| Cola de la mesa de ayuda | Casos de las colas de las que la membresía es **miembro** |
| Cambio | El que **pidió** o el que **implementa** la membresía |

   Quien tiene alcance "propio" y **no tiene Persona vinculada ve una lista vacía**, nunca un error (D-036.4).
3. **Segunda verificación:** cualquier membresía con un permiso S la exige. "Administrador activo" = quien tiene `roles.administrar` y `usuarios.cambiar_rol`; el último no se puede quitar aunque cambie de rol (D-048.1).
4. **Módulos apagados:** un módulo desactivado en la empresa (`empresa.configurar_modulos`) oculta sus permisos y la API responde "no encontrado" (D-037 fila 12). Al activarlo, sus permisos se ofrecen como plantilla sugerida; los roles personalizados no cambian solos (D-036.8).
5. **Rol nuevo = sin permisos.** Nadie se da permisos a sí mismo ni asigna un rol con más permisos de los que tiene (RF-ROL-006/007).
6. **Una prueba automática** falla si el código usa un permiso que no está aquí, y QA genera la matriz de pruebas desde este registro (una petición directa por celda).
7. **Los módulos agregan filas, no cambian celdas** de las filas del núcleo (D-037, DS-02). Si un módulo necesita otro valor para una fila del núcleo, lo propone al Gerente de TI.
8. **Exportar e importar son uno solo cada uno** (`datos.exportar`, `datos.importar`): cada módulo exporta o importa solo lo que el usuario ya puede ver, y las columnas de precios y de datos personales se omiten según `precios.ver` y `datos_personales.ver`. Pasan por la puerta única (D-061.1) y el marco único de importación (D-050).

## 3. Permisos de la plataforma (zona separada)

Solo el Administrador de plataforma. La base de datos lo impone con el rol `app_plataforma`, que ve solo tablas globales (D-039). Todos exigen llave de seguridad física, 2F y quedan en el registro de la plataforma.

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Cuándo | Plat |
|---|---|---|---|---|---|---|---|
| PS-01 | `plataforma.empresas_gestionar` | Crear, suspender y reactivar empresas e invitar a su primer administrador | S | todo | 2F R A | v1 E1 | T |
| PS-02 | `plataforma.rescatar_empresa` | Rescatar una empresa sin administrador (dos personas de plataforma, espera de 24 horas, contacto autorizado) | S | todo | 2F R A No | v1 E1 | T |
| PS-03 | `plataforma.soporte_leer` | Ver, solo lectura, datos de una empresa autorizada por ella, hasta 24 horas, con banner visible | S | todo | 2F R A | v1 E1 | T |
| PS-04 | `plataforma.limites_ajustar` | Subir por un periodo corto los topes de una empresa (invitaciones, importación inicial) | S | todo | 2F A | v1 E1 | T |
| PS-05 | `plataforma.acceso_emergencia` | Emitir un acceso excepcional de un solo uso si el correo falla, tras verificar la identidad por otro medio; exige a una segunda persona de plataforma o al contacto autorizado de la empresa [SUPUESTO S-34] | S | todo | 2F R A No | v1 E1 | T |
| PS-06 | `plataforma.correo_administrar` | Ver y cambiar el estado global del correo y del proveedor de envío | S | todo | 2F A | v1 E1 | T |

## 4. Empresa, accesos, auditoría y datos (todas las empresas)

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Cuándo | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-07 | `empresa.ver_configuracion` | Ver la configuración (moneda base, zona horaria, monto límite, calendario) | | todo | | v1 E1 | T | T | - | - | - | - | - |
| PS-08 | `empresa.configurar` | Cambiar la configuración de la empresa | | todo | A | v1 E1 | T | - | - | - | - | - | - |
| PS-09 | `empresa.configurar_modulos` | Activar o desactivar módulos (desactivar oculta, no borra) | S | todo | 2F R A | v1 E1 | T | - | - | - | - | - | - |
| PS-10 | `empresa.excepciones_funciones` | Cambiar el interruptor único de "Excepciones de separación de funciones" (motivo; confirma un segundo administrador si hay dos o más) | S | todo | 2F R A | v1 E5 | T | - | - | - | - | - | - |
| PS-11 | `usuarios.ver` | Ver los usuarios de la empresa | | todo | | v1 E1 | T | T | - | - | - | - | - |
| PS-12 | `usuarios.invitar` | Invitar usuarios (texto fijo, 7 días, no más permisos que los propios) | S | todo | 2F R A T | v1 E1 | T | - | - | - | - | - | - |
| PS-13 | `usuarios.cambiar_rol` | Cambiar el rol de un usuario | S | todo | 2F R A | v1 E1 | T | - | - | - | - | - | - |
| PS-14 | `usuarios.suspender` | Suspender o reactivar a un usuario y cerrar sus sesiones | S | todo | 2F R A | v1 E1 | T | - | - | - | - | - | - |
| PS-15 | `usuarios.dar_baja` | Dar de baja a un usuario (siempre permitido; corta sus sesiones al instante) | S | todo | 2F R A | v1 E1 | T | - | - | - | - | - | - |
| PS-16 | `roles.ver` | Ver los roles y sus permisos | | todo | | v1 E1 | T | T | - | - | - | - | - |
| PS-17 | `roles.administrar` | Crear y editar roles (no puede darse permisos a sí mismo) | S | todo | 2F R A | v1 E1 | T | - | - | - | - | - | - |
| PS-18 | `auditoria.ver` | Ver la auditoría de la empresa (el visor oculta lo que el lector no puede ver en su origen) | S | todo | 2F A | v1 E1 | T | T | - | - | - | - | - |
| PS-19 | `auditoria.ver_seguridad` | Ver los eventos de seguridad de la empresa (accesos fallidos, intentos rechazados, soporte) | S | todo | 2F A | v1 E1 | T | - | - | - | - | - | - |
| PS-20 | `datos.exportar` | Exportar listas a Excel por la puerta única (motivo, tope, hoja "Aviso") | S | todo | 2F R A T | v1 E2 | T | - | - | - | - | - | - |
| PS-21 | `datos.importar` | Importar datos por el asistente único (todo o nada) | S | todo | 2F R A | v1 E4 | T | - | - | - | - | - | - |
| PS-22 | `datos_personales.ver` | Ver nombre, correo y datos de contacto de las Personas; sin él se ve la referencia (`PRS-0042`) | S | todo | 2F A | v1 E2 | T | T | T | - | - | - | - |
| PS-23 | `precios.ver` | Ver precios, totales y costos de toda la empresa | S | todo | 2F | v1 E5 | T | T | - | - | - | - | - |
| PS-230 | `precios.ver_propios` | Ver precios y totales **solo** de las órdenes que la persona creó o editó (Técnico y Solicitante). No es sensible: no exige segunda verificación (D-037 fila 10) | | propio | | v1 E5 | - | - | P | - | P | - | - |

## 5. Personas, estructura y proveedores (núcleo)

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Cuándo | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-24 | `personas.ver` | Ver Personas (con referencia si falta `datos_personales.ver`) | | todo o propio | | v1 E2 | T | T | T | T | P | T | P |
| PS-25 | `personas.crear_editar` | Crear y editar Personas, incluida el alta rápida al entregar | | todo | A | v1 E2 | T | - | T | - | - | - | - |
| PS-26 | `personas.cesar` | Cesar y reactivar a una Persona (nunca se bloquea por recursos; si tiene Usuario, además hace falta `usuarios.suspender`) | | todo | A | v1 E2 | T | T | - | - | - | - | - |
| PS-27 | `personas.vincular_usuario` | Vincular una Persona con una membresía (1 a 1) | | todo | A | v1 E2 | T | - | - | - | - | - | - |
| PS-28 | `personas.anonimizar` | Anonimizar manualmente (solo por derechos documentados; propone una persona y ejecuta otra, con vista previa) | S | todo | 2F R A No | v1 E2 | T | - | - | - | - | - | - |
| PS-29 | `personas.derechos_atender` | Registrar y atender solicitudes de derechos sobre datos personales (quien presenta el pedido no lo atiende; invisible por todas las vías) | S | todo | 2F A No | v1 E2 | T | - | - | - | - | - | - |
| PS-30 | `catalogos.ver` | Ver catálogos, ubicaciones, áreas, centros de costo, categorías y campos | | todo | | v1 E2 | T | T | T | T | T | T | - |
| PS-31 | `catalogos.gestionar` | Crear y editar catálogos (marcas, modelos, unidades de medida, listas simples) | | todo | A | v1 E2 | T | - | T | - | - | - | - |
| PS-32 | `ubicaciones.gestionar` | Crear, mover y desactivar ubicaciones (árbol de 3 niveles) | | todo | A | v1 E2 | T | - | T | - | - | - | - |
| PS-33 | `estructura.gestionar` | Crear y editar áreas, centros de costo (con responsable y código externo) y tipos de puesto | | todo | A | v1 E2 | T | - | - | - | - | - | - |
| PS-34 | `categorias.gestionar` | Crear y editar categorías, su naturaleza, subcategorías y campos personalizados | | todo | A | v1 E2 | T | - | - | - | - | - | - |
| PS-35 | `proveedores.ver` | Ver proveedores | | todo | | v1 E2 | T | T | T | T | - | T | - |
| PS-36 | `proveedores.ver_contactos` | Ver los contactos de un proveedor (no salen en exportaciones generales) | | todo | A | v1 E2 | T | T | T | - | - | - | - |
| PS-37 | `proveedores.crear_editar` | Crear y editar proveedores (separado de crear órdenes) | | todo | A | v1 E2 | T | - | - | - | - | - | - |
| PS-38 | `proveedores.desactivar` | Desactivar proveedores | | todo | A | v1 E2 | T | - | - | - | - | - | - |

## 6. Maestro de artículos e inventario (núcleo)

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Cuándo | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-39 | `skus.ver` | Ver SKU | | todo | | v1 E3 | T | T | T | T | T | T | - |
| PS-40 | `skus.crear_editar` | Crear y editar SKU | | todo | A | v1 E3 | T | - | T | - | - | - | - |
| PS-41 | `skus.codigo_propio` | Escribir un código de SKU propio en vez del automático | | todo | A | v1 E3 | T | - | - | - | - | - | - |
| PS-42 | `skus.desactivar` | Desactivar y reactivar SKU | | todo | A | v1 E3 | T | - | T | - | - | - | - |
| PS-43 | `activos.ver` | Ver activos y stock | | todo | | v1 E4 | T | T | T | T | - | T | - |
| PS-44 | `activos.ingreso_manual` | Registrar un activo sin orden de compra (reemplazo por garantía, donación) (motivo) | | todo | A | v1 E4 | T | - | T | - | - | - | - |
| PS-45 | `activos.cambiar_estado` | Pasar a En reparación y volver, con el diálogo único "Cambiar estado" | | todo | A | v1 E4 | T | - | T | - | - | - | - |
| PS-46 | `activos.registrar_extravio` | Marcar un activo Extraviado o robado (motivo) | | todo | A | v1 E4 | T | T | T | - | - | - | - |
| PS-47 | `activos.dar_baja` | Dar de baja un activo (motivo) | | todo | A | v1 E4 | T | - | T | - | - | - | - |
| PS-48 | `activos.reingreso` | Reactivar el mismo registro de un activo De baja o Extraviado (motivo) | S | todo | 2F A | v1 E4 | T | T | - | - | - | - | - |
| PS-49 | `activos.cambiar_ubicacion` | Cambiar la ubicación de un activo con serie (movimiento propio) | | todo | A | v1 E4 | T | - | T | T | - | - | - |
| PS-50 | `activos.corregir_serie` | Corregir una serie ya registrada (motivo; el historial guarda antes y después) | | todo | A | v1 E4 | T | - | T | T | - | - | - |
| PS-51 | `activos.corregir_costo` | Corregir el costo o la moneda de un activo (activos del Excel) (motivo) | S | todo | 2F A | v1 E4 | T | - | - | - | - | - | - |
| PS-52 | `stock.mover` | Ingresos, salidas y traslados de stock por cantidad | | todo | A | v1 E4 | T | - | T | T | - | - | - |
| PS-53 | `stock.ajustar` | Ajustar stock por cantidad (motivo) | | todo | A | v1 E4 | T | - | T | - | - | - | - |
| PS-54 | `entregas.ver` | Ver entregas, devoluciones y actas | | todo | | v1 E4 | T | T | T | - | - | T | - |
| PS-55 | `entregas.crear` | Entregar un equipo con el asistente único "Entregar". La autoentrega está prohibida sin excepción | | todo | A No | v1 E4 | T | - | T | - | - | - | - |
| PS-56 | `entregas.devolver` | Registrar una devolución | | todo | A | v1 E4 | T | - | T | - | - | - | - |
| PS-57 | `entregas.traspasar` | Traspasar un equipo de una Persona a otra en un solo acto | | todo | A | v1 E4 | T | - | T | - | - | - | - |
| PS-58 | `entregas.anular` | Anular una entrega registrada por error | | todo | A | v1 E4 | T | - | - | - | - | - | - |
| PS-59 | `entregas.imprimir_acta` | Imprimir o reimprimir el acta en PDF (sin `datos_personales.ver` omite nombre y área) | | todo | | v1 E4 | T | T | T | - | - | T | - |
| PS-60 | `entregas.marcar_conformidad` | Marcar la conformidad firmada en papel o confirmada en pantalla | | todo | A | Fase 2 | T | - | T | - | - | - | - |

## 7. Compras, recepción y servicios (núcleo)

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Cuándo | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-61 | `ordenes_compra.ver` | Ver órdenes de compra (Almacén sin precios) | | todo o propio | | v1 E5 | T | T | T | T | P | T | - |
| PS-62 | `ordenes_compra.crear_editar` | Crear y editar órdenes, incluidas las solicitudes en Borrador (el Solicitante lleva SKU y cantidades; Técnico o Administrador completan precios) | | todo o propio | A | v1 E5 | T | - | T | - | P | - | - |
| PS-63 | `ordenes_compra.aprobar` | Aprobar o rechazar (motivo al rechazar). No aprueba quien creó o editó desde la última aprobación | | todo | A No | v1 E5 | T | T | - | - | - | - | - |
| PS-64 | `ordenes_compra.emitir` | Emitir al proveedor (cambia el estado; imprime o genera PDF) | | todo | A | v1 E5 | T | T | - | - | - | - | - |
| PS-65 | `ordenes_compra.anular` | Anular una orden antes de su primera recepción (motivo) | | todo o propio | A | v1 E5 | T | T | P | - | P | - | - |
| PS-66 | `ordenes_compra.cerrar` | Cerrar a mano una orden con recepción parcial (motivo) | | todo | A | v1 E5 | T | T | - | - | - | - | - |
| PS-67 | `recepciones.crear_confirmar` | Crear y confirmar recepciones. No recibe quien creó o aprobó la orden | | todo | A No | v1 E5 | T | - | - | T | - | - | - |
| PS-68 | `recepciones.revertir` | Revertir una recepción confirmada (motivo) | | todo | A | v1 E5 | T | T | - | - | - | - | - |
| PS-69 | `ordenes_servicio.ver` | Ver órdenes de servicio | | todo o propio | | v1 E6 | T | T | T | - | P | T | - |
| PS-70 | `ordenes_servicio.crear` | Crear órdenes de servicio, incluidas las solicitudes de trabajo (OS en Creada) | | todo o propio | A | v1 E6 | T | - | T | - | P | - | - |
| PS-71 | `ordenes_servicio.gestionar` | Asignar, ejecutar y cerrar | | todo | A | v1 E6 | T | - | T | - | - | - | - |
| PS-72 | `ordenes_servicio.cancelar` | Cancelar antes de cerrar | | todo o propio | A | v1 E6 | T | - | T | - | P | - | - |
| PS-73 | `ordenes_servicio.aprobar` | Aprobar una orden de servicio con costo que supera el límite | | todo | A No | v1 E6 | T | T | - | - | - | - | - |

## 8. Proveedores y contratos (PRV-B), licencias, líneas y dominios

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Cuándo | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-74 | `contratos.ver` | Ver contratos de proveedor y de licencia (importes con `precios.ver`) | | todo | | Fase 2 | T | T | T | - | - | T | - |
| PS-75 | `contratos.crear_editar` | Crear y editar contratos (el de licencia es extensión 1 a 1) | | todo | A | Fase 2 | T | - | - | - | - | - | - |
| PS-76 | `contratos.activar` | Activar un contrato de proveedor o confirmar un contrato de licencia (misma entidad `CTR-`); si supera el límite lo hace otra persona | | todo | A No | Fase 2 | T | T | - | - | - | - | - |
| PS-77 | `contratos.renovar` | Renovar (la renovación automática es una acción del "sistema" con la persona que aprobó) | | todo | A | Fase 2 | T | T | - | - | - | - | - |
| PS-78 | `contratos.terminar_anular` | Terminar o anular un contrato de proveedor o de licencia (motivo); terminar uno de licencia libera sus puestos como pendiente | | todo | A | Fase 2 | T | T | - | - | - | - | - |
| PS-79 | `contratos.gestionar_compromisos` | Gestionar el compromiso de servicio del proveedor | | todo | A | Fase 2 | T | T | - | - | - | - | - |
| PS-80 | `contratos.gestionar_referencias` | Gestionar documentos de referencia de un contrato | | todo | A | Fase 2 | T | T | T | - | - | - | - |
| PS-81 | `contratos.recibir_avisos` | Recibir avisos de vencimiento de contratos | | todo o propio | | Fase 2 | T | T | P | - | - | - | - |
| PS-82 | `licencias.ver` | Ver licencias y puestos | | todo | | Fase 2 | T | T | T | - | - | T | - |
| PS-83 | `licencias.crear_editar` | Crear y editar licencias | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-84 | Retirado (2026-10-25) | Era `licencias.confirmar`. El contrato de licencia es una extensión 1 a 1 del contrato de proveedor (D-044.4): se confirma con PS-76 `contratos.activar` | | | | | | | | | | | |
| PS-85 | Retirado (2026-10-25) | Era `licencias.cancelar`. Se termina o anula con PS-78 `contratos.terminar_anular` (D-049 usa "Terminar"); los puestos se liberan como pendiente | | | | | | | | | | | |
| PS-86 | `licencias.asignar` | Asignar y liberar puestos | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-87 | `licencias.configurar` | Configurar el módulo de licencias | | todo | A | Fase 2 | T | - | - | - | - | - | - |
| PS-88 | `licencias.ver_clave` | Ver la clave completa de una licencia (reautenticación, 20 por hora, se oculta a los 30 segundos) | S | todo | 2F R A T | Fase 2 | T | - | - | - | - | - | - |
| PS-89 | `licencias.editar_clave` | Escribir o cambiar una clave (una a una; no entran por Excel) | S | todo | 2F R A | Fase 2 | T | - | - | - | - | - | - |
| PS-90 | `lineas.ver` | Ver líneas móviles | | todo | | Fase 2 | T | T | T | - | - | T | - |
| PS-91 | `lineas.crear_editar` | Crear y editar líneas | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-92 | `lineas.asignar` | Asignar y devolver líneas | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-93 | `lineas.suspender` | Suspender y reactivar líneas | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-94 | `lineas.baja` | Dar de baja una línea (motivo) | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-95 | `lineas.reingreso` | Reingreso de una línea (motivo) | S | todo | 2F A | Fase 2 | T | T | - | - | - | - | - |
| PS-96 | `lineas.administrar_planes` | Administrar planes, operadores y "cargo especial" | | todo | A | Fase 2 | T | - | - | - | - | - | - |
| PS-97 | `dominios.ver` | Ver dominios y certificados | | todo | | Fase 2 | T | T | T | - | - | T | - |
| PS-98 | `dominios.crear_editar` | Crear y editar dominios y certificados | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-99 | `dominios.baja` | Dar de baja un dominio o certificado | | todo | A | Fase 2 | T | - | - | - | - | - | - |
| PS-100 | `dominios.cambiar_titular` | Cambiar el titular de un dominio (reautenticación reciente) | S | todo | 2F R A | Fase 2 | T | - | - | - | - | - | - |
| PS-101 | `dominios.configurar` | Configurar el módulo de dominios | | todo | A | Fase 2 | T | - | - | - | - | - | - |
| PS-223 | `licencias.registrar_uso` | Registrar el uso real de una licencia (para el cumplimiento) | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-224 | `lineas.confirmar_costo` | Confirmar el costo de una línea (si supera el límite, otra persona) | | todo | A No | Fase 2 | T | T | - | - | - | - | - |
| PS-225 | `lineas.migrar` | Ejecutar el asistente de migración del número de línea desde el campo del celular (todo o nada, deshacible) | S | todo | 2F R A | Fase 2 | T | - | - | - | - | - | - |
| PS-226 | `lineas.recibir_avisos` | Recibir avisos de líneas (permanencia, vencimientos) | | todo o propio | | Fase 2 | T | T | T | - | - | - | - |
| PS-227 | `dominios.registrar_renovacion` | Registrar la renovación de un dominio o certificado | | todo | A | Fase 2 | T | T | T | - | - | - | - |
| PS-228 | `dominios.confirmar_costo` | Confirmar el costo de un dominio o certificado (si supera el límite, otra persona) | | todo | A No | Fase 2 | T | T | - | - | - | - | - |
| PS-229 | `dominios.recibir_avisos` | Recibir avisos de dominios y certificados por vencer | | todo o propio | | Fase 2 | T | T | T | - | - | - | - |

## 9. Garantías, mantenimiento, presupuesto, reportes e integraciones

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Cuándo | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-102 | `garantias.ver` | Ver garantías | | todo | | v1 E4 | T | T | T | - | - | T | - |
| PS-103 | `garantias.registrar` | Registrar o corregir la garantía de un activo (compra + meses, o fin directo) | | todo | A | v1 E4 | T | - | T | - | - | - | - |
| PS-104 | `garantias.anular` | Anular una garantía registrada | | todo | A | Fase 2 | T | - | - | - | - | - | - |
| PS-105 | `garantias.gestionar_reclamos` | Gestionar reclamos de garantía (`RCL-`) | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-106 | `garantias.recibir_avisos` | Recibir avisos de garantías por vencer | | todo o propio | | Fase 2 | T | T | P | - | - | - | - |
| PS-107 | `mantenimiento.ver` | Ver mantenimientos | | todo | | Fase 2 | T | T | T | - | - | T | - |
| PS-108 | `mantenimiento.programar` | Programar mantenimientos | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-109 | `mantenimiento.ejecutar` | Ejecutar y cerrar mantenimientos | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-110 | `mantenimiento.reprogramar` | Reprogramar mantenimientos | | todo | A | Fase 2 | T | - | T | - | - | - | - |
| PS-111 | `mantenimiento.planes` | Administrar planes de mantenimiento | | todo | A | Fase 2 | T | - | - | - | - | - | - |
| PS-112 | `presupuesto.ver` | Ver presupuestos y gasto (importes con `precios.ver`) | | todo o propio | | Fase 3 | T | T | - | - | - | - | - |
| PS-113 | `presupuesto.crear_editar` | Crear y editar presupuestos | | todo | A | Fase 3 | T | - | - | - | - | - | - |
| PS-114 | `presupuesto.aprobar` | Aprobar un presupuesto (siempre otra persona) | | todo | A No | Fase 3 | T | T | - | - | - | - | - |
| PS-115 | `presupuesto.anular` | Anular un presupuesto | | todo | A | Fase 3 | T | T | - | - | - | - | - |
| PS-116 | `presupuesto.gasto_registrar` | Registrar un gasto manual (si supera el límite, otra persona) | | todo | A No | Fase 3 | T | - | - | - | - | - | - |
| PS-117 | `presupuesto.gasto_anular` | Anular un gasto (otra persona) | | todo | A No | Fase 3 | T | T | - | - | - | - | - |
| PS-118 | `presupuesto.reclasificar` | Reclasificar un costo (si supera el límite, otra persona) | | todo | A No | Fase 3 | T | - | - | - | - | - | - |
| PS-119 | `presupuesto.cerrar_periodo` | Cerrar el mes (guarda la depreciación) | | todo | A | Fase 3 | T | T | - | - | - | - | - |
| PS-120 | `presupuesto.configurar` | Configurar el módulo de presupuestos | | todo | A | Fase 3 | T | - | - | - | - | - | - |
| PS-121 | `tableros.ver_jefatura` | Ver el tablero de Jefatura | | todo | | Fase 3 | T | T | - | - | - | - | - |
| PS-122 | `tableros.ver_tecnico` | Ver el tablero del Técnico | | todo | | Fase 3 | T | T | T | - | - | - | - |
| PS-123 | `tableros.ver_almacen` | Ver el tablero de Almacén | | todo | | Fase 3 | T | T | - | T | - | - | - |
| PS-124 | `reportes.ver_inventario` | Ver reportes de inventario y ciclo de vida | | todo | | Fase 3 | T | T | T | T | - | T | - |
| PS-125 | `reportes.ver_vencimientos` | Ver la pantalla única de vencimientos | | todo | | Fase 3 | T | T | T | - | - | T | - |
| PS-126 | `reportes.ver_costos` | Ver reportes de costos (importes con `precios.ver`) | | todo | | Fase 3 | T | T | - | - | - | - | - |
| PS-127 | `reportes.ver_sla` | Ver reportes de plazos de la mesa de ayuda | | todo | | Fase 3 | T | T | T | - | - | - | - |
| PS-128 | `reportes.ver_licencias` | Ver el cumplimiento de licencias | | todo | | Fase 3 | T | T | - | - | - | - | - |
| PS-129 | `reportes.programar` | Programar reportes por correo | | todo o propio | A | Fase 3 | T | P | - | - | - | - | - |
| PS-130 | `reportes.ver_programaciones` | Ver las programaciones de todos | | todo | A | Fase 3 | T | - | - | - | - | - | - |
| PS-131 | `reportes.configurar` | Configurar el catálogo de indicadores | | todo | A | Fase 3 | T | - | - | - | - | - | - |
| PS-132 | `integraciones.ver` | Ver las integraciones configuradas | | todo | | Fase 3 | T | - | - | - | - | - | - |
| PS-133 | `integraciones.administrar` | Crear y revocar claves de API y su alcance (reautenticación reciente) | S | todo | 2F R A | Fase 3 | T | - | - | - | - | - | - |
| PS-134 | `integraciones.ver_uso` | Ver el uso y los registros de la API | | todo | A | Fase 3 | T | - | - | - | - | - | - |
| PS-135 | `integraciones.administrar_webhooks` | Administrar webhooks (secreto visible una vez, anti-SSRF) | | todo | A | Fase 3 | T | - | - | - | - | - | - |
| PS-136 | `integraciones.sap_equivalencias` | Administrar equivalencias de códigos con SAP | S | todo | 2F A | Fase 3 | T | - | - | - | - | - | - |
| PS-137 | `integraciones.configurar_metodos_ingreso` | Activar el ingreso con Microsoft o Google | | todo | R A | Fase 3 | T | - | - | - | - | - | - |
| PS-220 | `integraciones.sap_exportar` | Generar el archivo de lote hacia SAP (`LSAP-`); exige además `datos.exportar` | | todo | A | Fase 3 | T | - | - | - | - | - | - |

## 10. Mesa de ayuda (AYU, Fase 2, ola C)

Los casos con derechos de datos son los del registro de PS-29 `personas.derechos_atender`: quedan invisibles por lista, búsqueda, exportación, reportes, API, avisos y plazos; la mesa de ayuda solo guarda una referencia sin contenido. Quien registra un caso por otra Persona necesita además `personas.ver` con alcance todo (PS-24) y `datos_personales.ver` (PS-22); no hace falta una fila nueva.

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-138 | `ayuda.caso_crear` | Crear un caso (botón "Pedir ayuda") | | todo | | T | T | T | T | T | - | P |
| PS-139 | `ayuda.caso_ver` | Ver casos | | todo o propio | | T | T | T | P | P | T | P |
| PS-140 | `ayuda.caso_ver_interno` | Ver comentarios y datos internos del caso | | todo | | T | T | T | - | - | - | - |
| PS-141 | `ayuda.caso_comentar_publico` | Comentar de forma visible para la Persona atendida | | todo o propio | | T | T | T | P | P | - | P |
| PS-142 | `ayuda.caso_comentar_interno` | Comentar solo para el equipo | | todo | | T | T | T | - | - | - | - |
| PS-143 | `ayuda.caso_tomar` | Tomar un caso de la cola | | todo | A | T | - | T | - | - | - | - |
| PS-144 | `ayuda.caso_asignar` | Asignar un caso | | todo | A | T | T | - | - | - | - | - |
| PS-145 | `ayuda.caso_cambiar_estado` | Cambiar el estado de un caso | | todo | A | T | - | T | - | - | - | - |
| PS-146 | `ayuda.caso_cambiar_prioridad` | Cambiar la prioridad | | todo | A | T | T | T | - | - | - | - |
| PS-147 | `ayuda.caso_escalar` | Escalar un caso | | todo | A | T | - | T | - | - | - | - |
| PS-148 | `ayuda.caso_cerrar` | Cerrar un caso resuelto | | todo | A | T | - | T | - | - | - | - |
| PS-149 | `ayuda.caso_cancelar` | Cancelar un caso en curso | | todo o propio | A | T | - | T | P | P | - | P |
| PS-150 | `ayuda.caso_reabrir` | Reabrir un caso | | todo o propio | A | T | - | T | - | P | - | P |
| PS-151 | `ayuda.caso_vincular` | Vincular un caso con activos, otros casos, órdenes de servicio, órdenes de compra (solo referencia) y artículos (SKU); además cambios y problemas cuando esos módulos estén activos | | todo | A | T | - | T | - | - | - | - |
| PS-152 | `ayuda.caso_crear_orden_servicio` | Crear la orden de servicio desde el caso | | todo | A | T | - | T | - | - | - | - |
| PS-153 | `ayuda.caso_redactar` | Redactar por seguridad un comentario (reemplaza el texto por `[REDACTADO]`; motivo) | S | todo | 2F A | T | - | - | - | - | - | - |
| PS-154 | `ayuda.solicitud_aprobar` | Aprobar una solicitud con aprobación (quien no la pidió) | | todo | A No | T | T | - | - | - | - | - |
| PS-155 | `ayuda.encuesta_responder` | Responder la encuesta de un caso propio | | propio | | P | P | P | P | P | - | P |
| PS-156 | `ayuda.encuesta_ver_resultados` | Ver resultados de encuestas | | todo | | T | T | - | - | - | - | - |
| PS-157 | `ayuda.encuesta_ver_detalle` | Ver el detalle de una encuesta | | todo | A | T | T | - | - | - | - | - |
| PS-158 | `ayuda.catalogo_ver` | Ver el catálogo de casos | | todo | | T | T | T | T | T | T | T |
| PS-159 | `ayuda.catalogo_administrar` | Administrar el catálogo de casos | | todo | A | T | - | - | - | - | - | - |
| PS-160 | `ayuda.cola_administrar` | Administrar colas | | todo | A | T | T | - | - | - | - | - |
| PS-161 | `ayuda.sla_configurar` | Configurar los plazos internos (SLA) | | todo | A | T | - | - | - | - | - | - |
| PS-162 | `ayuda.conocimiento_ver` | Ver artículos publicados | | todo | | T | T | T | T | T | T | T |
| PS-163 | `ayuda.conocimiento_ver_interno` | Ver artículos internos | | todo | | T | T | T | - | - | - | - |
| PS-164 | `ayuda.conocimiento_editar` | Redactar y editar artículos | | todo | A | T | - | T | - | - | - | - |
| PS-165 | `ayuda.conocimiento_publicar` | Publicar o archivar un artículo. La segunda persona ("No": quien no lo redactó) aplica solo a publicar | | todo | A No | T | T | - | - | - | - | - |
| PS-166 | `ayuda.tablero_ver` | Ver el tablero de la mesa de ayuda | | todo | | T | T | T | - | - | - | - |

## 11. Cambios, problemas y CMDB (Fase 3, ola E), onboarding (Fase 2, ola C) y portal (Fase 3, ola D)

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-167 | `cambios.ver` | Ver cambios | | todo | | T | T | T | - | - | T | - |
| PS-168 | `cambios.ver_calendario` | Ver el calendario (quien no puede ver el cambio solo ve "Cambio programado") | | todo | | T | T | T | T | T | T | - |
| PS-169 | `cambios.pedir` | Pedir un cambio ("Pedido por") | | todo | A | T | T | T | - | - | - | - |
| PS-170 | `cambios.pedir_estandar` | Pedir un cambio estándar con plantilla | | todo | A | T | - | T | - | - | - | - |
| PS-171 | `cambios.editar` | Editar un cambio | | todo o propio | A | T | P | P | - | - | - | - |
| PS-172 | `cambios.aprobar` | Aprobar un cambio (siempre otra persona) | | todo | A No | T | T | - | - | - | - | - |
| PS-173 | `cambios.aprobar_alto` | Aprobar un cambio de riesgo Alto (distinto del implementador) | | todo | A No | T | T | - | - | - | - | - |
| PS-174 | `cambios.implementar` | Implementar un cambio | | todo | A | T | - | T | - | - | - | - |
| PS-175 | `cambios.cerrar` | Cerrar un cambio. No lo cierra quien lo implementó (excepto con la casilla "cambios" del interruptor único) | | todo | A No | T | T | T | - | - | - | - |
| PS-176 | `cambios.cancelar` | Cancelar un cambio en curso | | todo o propio | A | T | P | P | - | - | - | - |
| PS-177 | `cambios.gestionar_plantillas` | Administrar plantillas estándar (reaprobar: otra persona) | | todo | A No | T | - | - | - | - | - | - |
| PS-178 | `cambios.gestionar_ventanas` | Administrar ventanas de cambio | | todo | A | T | - | - | - | - | - | - |
| PS-179 | `cambios.configurar` | Configurar el módulo de cambios | | todo | A | T | - | - | - | - | - | - |
| PS-180 | `problemas.ver` | Ver problemas | | todo | | T | T | T | - | - | T | - |
| PS-181 | `problemas.ver_errores_conocidos` | Ver errores conocidos publicados | | todo | | T | T | T | T | T | T | - |
| PS-182 | `problemas.crear` | Crear un problema | | todo | A | T | T | T | - | - | - | - |
| PS-183 | `problemas.editar` | Editar un problema | | todo | A | T | T | T | - | - | - | - |
| PS-184 | `problemas.vincular` | Vincular incidentes, cambios y activos | | todo | A | T | T | T | - | - | - | - |
| PS-185 | `problemas.publicar_error_conocido` | Publicar un error conocido (quien no lo redactó) | | todo | A No | T | T | - | - | - | - | - |
| PS-186 | `problemas.resolver` | Marcar un problema como resuelto | | todo | A | T | - | T | - | - | - | - |
| PS-187 | `problemas.cerrar` | Cerrar un problema | | todo | A | T | T | - | - | - | - | - |
| PS-188 | `problemas.descartar` | Descartar un problema | | todo | A | T | T | - | - | - | - | - |
| PS-189 | `problemas.configurar` | Configurar el módulo de problemas | | todo | A | T | - | - | - | - | - | - |
| PS-221 | `cambios.redactar` | Redactar por seguridad un texto de un cambio (reemplaza por `[REDACTADO]`; motivo) | S | todo | 2F A | T | - | - | - | - | - | - |
| PS-222 | `problemas.redactar` | Redactar por seguridad un texto de un problema (reemplaza por `[REDACTADO]`; motivo) | S | todo | 2F A | T | - | - | - | - | - | - |
| PS-190 | `cmdb.ver` | Ver la CMDB y el impacto de un elemento | | todo | | T | T | T | - | - | T | - |
| PS-191 | `cmdb.crear_servicio` | Crear un servicio | | todo | A | T | - | T | - | - | - | - |
| PS-192 | `cmdb.editar` | Editar un elemento | | todo | A | T | - | T | - | - | - | - |
| PS-193 | `cmdb.gestionar_relaciones` | Crear y borrar relaciones manuales | | todo | A | T | - | T | - | - | - | - |
| PS-194 | `cmdb.dar_de_baja` | Dar de baja un elemento | | todo | A | T | - | - | - | - | - | - |
| PS-195 | `cmdb.ver_calidad` | Ver la calidad de los datos de la CMDB | | todo | | T | T | - | - | - | - | - |
| PS-196 | Retirado (2026-10-25) | Era `cmdb.reconciliar`. La reconciliación de la CMDB delgada es automática | | | | | | | | | | | |
| PS-197 | `onboarding.ver` | Ver procesos de alta y baja | | todo | | T | T | T | - | - | T | - |
| PS-198 | `onboarding.iniciar` | Iniciar un proceso de alta o baja | | todo | A | T | T | - | - | - | - | - |
| PS-199 | `onboarding.completar_tarea` | Completar una tarea asignada ("Mi trabajo") | | todo o propio | A | T | P | P | P | - | - | - |
| PS-200 | `onboarding.reasignar` | Reasignar tareas | | todo | A | T | T | - | - | - | - | - |
| PS-201 | `onboarding.editar_proceso` | Editar un proceso en curso | | todo | A | T | T | - | - | - | - | - |
| PS-202 | `onboarding.cancelar` | Cancelar un proceso | | todo | A | T | T | - | - | - | - | - |
| PS-203 | `onboarding.plantillas` | Administrar plantillas de alta y baja | | todo | A | T | - | - | - | - | - | - |
| PS-204 | `portal.acceder` | Entrar al portal de autoservicio | | propio | | - | - | - | - | - | - | P |
| PS-205 | `portal.ver_propio` | Ver mis equipos, líneas, licencias, casos y **mis actas** (ver y reimprimir mis actas en PDF) (nunca el nombre del jefe) | | propio | | - | - | - | - | - | - | P |
| PS-206 | `portal.solicitar` | Solicitar un equipo o servicio (crea un caso) | | propio | | - | - | - | - | - | - | P |
| PS-207 | `portal.pedir_datos` | Pedir mis datos: crea la entrada en el registro de PS-29; el empleado ve el estado de SU pedido (única excepción a "invisible por todas las vías") | | propio | A | - | - | - | - | - | - | P |
| PS-208 | `portal.confirmar_recepcion` | Confirmar en pantalla la recepción de un equipo | | propio | A | - | - | - | - | - | - | P |
| PS-209 | `portal.invitar` | Invitar a Personas al portal (por persona, 100 por día por defecto) | | todo | A T | T | - | - | - | - | - | - |
| PS-210 | `portal.configurar` | Configurar el portal | | todo | A | T | - | - | - | - | - | - |

## 12. Notificaciones (NOT-completo, Fase 2, ola A)

El correo de la v1 (invitación, acceso, aprobación; NOT-base) no necesita permisos de estas filas: lo emite el sistema. `plataforma.correo_administrar` (PS-06) administra el estado global.

| PS | Nombre técnico | Qué permite | S | Alcance | Controles | Adm | Jef | Téc | Alm | Sol | SL | Emp |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| PS-211 | `notificaciones.bandeja_usar` | Usar mi bandeja de avisos | | propio | | P | P | P | P | P | P | P |
| PS-212 | `notificaciones.preferencias_propias` | Editar mis preferencias de avisos | | propio | | P | P | P | P | P | P | P |
| PS-213 | `notificaciones.preferencias_empresa` | Editar las preferencias de avisos de la empresa | | todo | A | T | - | - | - | - | - | - |
| PS-214 | `notificaciones.plantilla_ver` | Ver las plantillas de avisos | | todo | | T | T | - | - | - | - | - |
| PS-215 | `notificaciones.plantilla_editar` | Editar plantillas de avisos (contenido mínimo, sin datos de terceros) | S | todo | 2F A | T | - | - | - | - | - | - |
| PS-216 | `notificaciones.regla_aviso_configurar` | Configurar reglas, umbrales y hora de envío de avisos | | todo | A | T | - | - | - | - | - | - |
| PS-217 | `notificaciones.limites_configurar` | Configurar los topes de correo de la empresa | | todo | A | T | - | - | - | - | - | - |
| PS-218 | `notificaciones.registro_ver` | Consultar el registro de envíos (correo enmascarado pasado el plazo; la consulta se audita) | S | todo | 2F A | T | - | - | - | - | - | - |
| PS-219 | `notificaciones.registro_reenviar` | Reenviar un aviso del registro | | todo | A | T | - | - | - | - | - | - |

## 13. Resumen por rol (qué puede hacer cada plantilla)

| Rol | En resumen |
|---|---|
| Administrador | Todo lo de su empresa (todos los permisos, incluidos los sensibles), con la separación de funciones de compras y la autoentrega prohibida también para él |
| Jefatura TI | Ver casi todo (precios, datos personales, auditoría), aprobar y emitir órdenes, cesar Personas, reingreso, cerrar y revertir recepciones; no importa ni exporta, no administra roles |
| Técnico | Gestiona inventario, entregas, órdenes de servicio, SKU, catálogos y ubicaciones; ve datos personales; no ve precios salvo en lo que crea; no cesa Personas, no ve auditoría |
| Almacén | Recibe mercadería, mueve stock, corrige series y ubicación; no entrega equipos, no ve nombres de Personas ni precios |
| Solicitante | Crea solicitudes de compra (sin precios) y de servicio y ve las propias |
| Solo lectura | Consulta sin modificar; sin precios ni datos personales (ve referencias) |
| Empleado (portal) | Solo lo propio, a través del portal (Fase 3) |
| Administrador de plataforma | Solo la zona de plataforma; no ve datos del negocio |

## 14. Cómo pedir un permiso nuevo

1. El módulo escribe la fila propuesta: nombre técnico, qué permite, sensible, alcance, controles, valores por rol y cuándo.
2. El Analista comprueba que no existe uno equivalente (no se crean sinónimos).
3. El Gerente de TI aprueba; el Analista le asigna el siguiente PS-nn.
4. QA genera las pruebas de la fila; Seguridad revisa si es sensible.

## 15. Equivalencias: nombre antiguo del módulo → registro

Para que cada escuadrón migre su sección 3. "Se retira" = el permiso ya existe como otro PS o no es un permiso.

**Personas y ubicaciones (PRS):** `personas.ver` → PS-24 · `datos_personales.ver` → PS-22 · `personas.crear`, `personas.editar` → PS-25 · `personas.cesar`, `personas.reactivar` → PS-26 · `personas.vincular_usuario` → PS-27 · `personas.anonimizar` → PS-28 · `personas.atender_derechos` → PS-29 · `importar.personas` → PS-21 · `exportar.personas` → PS-20 · `estructura.ver` → PS-30 · `ubicaciones.gestionar` → PS-32 · `areas.gestionar`, `centros_costo.gestionar` → PS-33.
**Entregas (ENT):** `entregas.ver` → PS-54 · `entregas.crear` → PS-55 · `devoluciones.crear` → PS-56 · `entregas.traspasar` → PS-57 · `entregas.anular` → PS-58 · `actas.imprimir` → PS-59 · `entregas.marcar_conformidad` → PS-60 · `extravios.registrar` → PS-46 · `extravios.recuperar` → PS-48 (es un reingreso) · `exportar.entregas` → PS-20.
**Licencias (LIC):** `licencias.ver` → PS-82 · `licencias.crear`, `licencias.editar` → PS-83 · `licencias.confirmar` → PS-76 `contratos.activar` · `licencias.cancelar` → PS-78 `contratos.terminar_anular` · `licencias.asignar` → PS-86 · `licencias.configurar` → PS-87 · `licencias.registrar_uso` → PS-223 · `licencias.ver_clave` → PS-88 · `licencias.editar_clave` → PS-89 · `licencias.importar` → PS-21 · `licencias.exportar` → PS-20.
**Líneas (LIN):** `lineas.ver` a `lineas.baja` y `lineas.reingreso` → PS-90 a PS-95 · `lineas.configurar` y `lineas.administrar_planes` → PS-96 · `lineas.importar` → PS-21 · `lineas.exportar` → PS-20.
**Dominios (DOM):** `dominios.ver` → PS-97 · `dominios.crear`, `dominios.editar` → PS-98 · `dominios.baja` → PS-99 · `dominios.cambiar_titular` → PS-100 · `dominios.configurar` → PS-101 · `dominios.importar` → PS-21 · `dominios.exportar` → PS-20.
**Proveedores y contratos (PRV):** `proveedores.ver` → PS-35 · `proveedores.ver_contactos` → PS-36 · `proveedores.crear_editar` → PS-37 · `proveedores.desactivar` → PS-38 · `contratos.ver` → PS-74 · `contratos.crear_editar` → PS-75 · `contratos.activar` → PS-76 · `contratos.renovar` → PS-77 · `contratos.terminar_anular` → PS-78 · `sla.gestionar` → PS-79 · `referencias.gestionar` → PS-80 · `contratos.recibir_alertas` → PS-81.
**Garantías y mantenimiento (GAR):** `garantias.ver` → PS-102 · `garantias.registrar` → PS-103 · `garantias.anular` → PS-104 · `reclamos.gestionar` → PS-105 · `gar.recibir_alertas` → PS-106 · `mantenimiento.ver` a `mantenimiento.planes` → PS-107 a PS-111 · `activos.cambiar_estado` → PS-45.
**Presupuesto (PRE):** `presupuesto.ver` → PS-112 · `presupuesto.crear` → `presupuesto.crear_editar` PS-113 · `presupuesto.aprobar` → PS-114 · `presupuesto.anular` → PS-115 · `presupuesto.gasto_registrar` → PS-116 · `presupuesto.gasto_anular` → PS-117 · `presupuesto.reclasificar` → PS-118 · `presupuesto.cerrar_periodo` → PS-119 · `presupuesto.configurar` → PS-120 · `reportes.exportar` → PS-20.
**Reportes (REP):** `tablero.jefatura.ver` → `tableros.ver_jefatura` PS-121 · `tablero.tecnico.ver` → `tableros.ver_tecnico` PS-122 · `tablero.almacen.ver` → `tableros.ver_almacen` PS-123 · `reportes.inventario.ver` → `reportes.ver_inventario` PS-124 · `reportes.vencimientos.ver` → `reportes.ver_vencimientos` PS-125 · `reportes.costos.ver` → `reportes.ver_costos` PS-126 · `reportes.sla.ver` → `reportes.ver_sla` PS-127 · `reportes.licencias.ver` → `reportes.ver_licencias` PS-128 · `reportes.programar` → PS-129 · `reportes.programaciones_ver_todas` → PS-130 · `reportes.configurar` → PS-131 · `reportes.exportar` → PS-20 · `personas.ver_datos` → PS-22.
**Integraciones (INT):** `integraciones.ver` → PS-132 · `integraciones.administrar` → PS-133 · `integraciones.ver_uso` → PS-134 · `integraciones.webhooks` → `integraciones.administrar_webhooks` PS-135 · `integraciones.sap_equivalencias` → PS-136 · `integraciones.metodos_ingreso` → `integraciones.configurar_metodos_ingreso` PS-137 · `integraciones.sap_exportar` → PS-220 (exige además PS-20) · `integraciones.sap_importar` → PS-21 (la carga de maestros SAP exige además PS-37) · `personas.ver_datos` → PS-22. Los alcances de una clave de API son un subconjunto de estos nombres (por ejemplo `activos.ver`), nunca un vocabulario aparte como `activos:lectura`.
**Mesa de ayuda (AYU):** `ayuda.caso.<acción>` → `ayuda.caso_<acción>` (PS-138 a PS-153) · `ayuda.solicitud.aprobar` → PS-154 · `ayuda.encuesta.responder`, `ver_resultados`, `ver_detalle` → PS-155 a PS-157 · `ayuda.catalogo.ver`, `administrar` → PS-158, PS-159 · `ayuda.cola.administrar` → PS-160 · `ayuda.sla.configurar` → PS-161 · `ayuda.conocimiento.ver`, `ver_interno`, `editar`, `publicar` → PS-162 a PS-165 · `ayuda.tablero.ver` → PS-166 · `ayuda.caso.retirar_comentario` → PS-153 (redactar por seguridad; "retirar" es otra operación sin permiso sensible y queda como edición de quien lo escribió) · `ayuda.caso.ver_datos_solicitante` → PS-22 · `ayuda.exportar` → PS-20 · `ayuda.derechos.atender` → PS-29.
**Cambios (CAM):** `cambios.ver` a `cambios.configurar` → PS-167 a PS-179 (`cambios.solicitar` se llama ahora `cambios.pedir` y `cambios.solicitar_estandar`, `cambios.pedir_estandar`) · `cambios.redactar` → PS-221 · `cambios.exportar` → PS-20 · `cmdb.ver` → PS-190.
**Problemas (PRB):** `problemas.ver` a `problemas.configurar` → PS-180 a PS-189 · `problemas.redactar` → PS-222 · `problemas.exportar` → PS-20.
**CMDB (CMD):** `cmdb.ver` a `cmdb.reconciliar` → PS-190 a PS-196 (`cmdb.retirar` se llama ahora `cmdb.dar_de_baja`; `cmdb.reconciliar` se retira si CMD no lo usa) · `cmdb.importar` → PS-21 · `cmdb.exportar` → PS-20 · `datos_personales.ver` → PS-22.
**Onboarding (ONB):** `onboarding.ver` a `onboarding.plantillas` → PS-197 a PS-203 · `personas.cesar` → PS-26 · `datos_personales.ver` → PS-22.
**Portal (POR):** `portal.acceder`, `ver_propio`, `solicitar`, `pedir_datos`, `confirmar_recepcion` → PS-204 a PS-208 · `portal.invitar` → PS-209 · `portal.configurar` → PS-210.
**Notificaciones (NOT):** `notificaciones.bandeja.usar` → PS-211 · `preferencias.editar_propias` → PS-212 · `preferencias_empresa.editar` → PS-213 · `plantilla.ver` → PS-214 · `plantilla.editar` → PS-215 · `regla_aviso.configurar` → PS-216 · `limites.configurar` → PS-217 · `registro.ver` → PS-218 · `registro.reenviar` → PS-219 · `notificaciones.plataforma.administrar` → PS-06 · `notificaciones.exportar` → PS-20.

Los nombres de **eventos** que aparecen en los módulos (por ejemplo `acceso.invitacion`, `compras.orden_por_aprobar`, `ayuda.caso_creado`) **no son permisos**: se rigen por el catálogo único de eventos `<módulo>.<entidad>_<hecho>` (D-038.5) que acuerdan Notificaciones e Integraciones.

## 16. Pendientes del registro

- **Clasificación de sensibles (H-SEG-29 y 30 de Seguridad):** PS-08 (cambia el monto límite), PS-68 (revertir recepción), PS-135 (webhooks) y las aprobaciones (PS-63, 73, 76, 114, 172, 173) hoy no son sensibles. Convertirlos en sensibles pondría la segunda verificación a Jefatura TI en casi todo; lo decide el Gerente de TI. Mientras tanto quedan como están.
- **PS-23 y PS-230:** `precios.ver` es solo para todo y sensible; lo propio (Técnico y Solicitante) pasó a `precios.ver_propios` (PS-230), no sensible.
- Los valores de las celdas de los módulos de Fase 2 y 3 son una propuesta mía (supuesto S-22 del documento funcional) hasta que cada escuadrón confirme las suyas; se resuelven en la revisión del Auditor Técnico (plan de correcciones, sección 4).
- El nombre técnico definitivo de cada fila lo fija el Arquitecto en el catálogo del código; este registro fija el nombre funcional y el identificador PS-nn.
- Si un módulo necesita una fila nueva durante su corrección, la pide por el mecanismo de la sección 14.

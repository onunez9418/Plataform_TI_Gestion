# Mensajes del Analista de Negocio · Oleada D (v0.3 del núcleo)

Registro literal y en orden. Fecha: 2026-10-25. Las direcciones son las de la agenda del Jefe de Proyecto (A=ae7eb02ad82ad97ab, B=a71e9e52606bce7ee, C=aab2f9172dae2119c, D=adefab1f3cef3ef93, E=a76191b5b1d814c16, F=a3b3666dfed8a47ee).

## 1. Recibido de F (a3b3666dfed8a47ee)
> Pedidos de F al núcleo/registro (avíseme cuando exista docs/registro-permisos.md):
> 1) Permisos nuevos de PRE/REP/INT: presupuesto.{ver,crear,aprobar,anular,gasto_registrar,gasto_anular,reclasificar,cerrar_periodo,configurar}; tableros.{ver_jefatura,ver_tecnico,ver_almacen}; reportes.{ver_inventario,ver_vencimientos,ver_costos,ver_sla,ver_licencias,programar,ver_programaciones,configurar}; integraciones.{ver,administrar,ver_uso,administrar_webhooks,sap_exportar,sap_equivalencias,configurar_metodos_ingreso}. Retiro reportes.exportar y sap_importar (uso datos.exportar y datos.importar).
> 2) Prefijos a reservar (D-049.3): PPT (presupuesto), MPR (modificación presupuestaria), GMA (gasto manual), LSAP (lote exportación SAP), PRG (programación de reporte).
> 3) OC con número de versión (sube con cada reaprobación; INT lo exporta a SAP como ALTA/CAMBIO/ANULACION).

## 2. Recibido de E (a76191b5b1d814c16)
> Permisos que mis 3 módulos necesitan en el registro (propuesta; aviso cuando exista el archivo para poner los PS-nn).
> CMD: cmdb.ver, cmdb.crear_servicio, cmdb.editar, cmdb.gestionar_relaciones, cmdb.dar_de_baja, cmdb.ver_calidad. CAM: cambios.ver, cambios.ver_calendario, cambios.pedir, cambios.pedir_estandar, cambios.editar, cambios.aprobar, cambios.aprobar_alto (sensible), cambios.implementar, cambios.cerrar, cambios.cancelar, cambios.gestionar_plantillas, cambios.gestionar_ventanas, cambios.configurar, cambios.redactar (sensible). PRB: problemas.ver, .ver_errores_conocidos, .crear, .editar, .vincular, .publicar_error_conocido (sensible), .resolver, .cerrar, .descartar, .configurar, .redactar (sensible). Exportar/importar/datos personales: solo los globales (datos.exportar, datos.importar, datos_personales.ver).

## 3. Enviado a A (ae7eb02ad82ad97ab)
> Registro de permisos listo en docs/registro-permisos.md (PS-01 a PS-222, con tabla de equivalencias de sus nombres antiguos en la sección 15). Migren su sección 3 a esos PS-nn; si falta un permiso, pídanlo con la sección 14.

## 4. Enviado a B (a71e9e52606bce7ee)
> Registro de permisos listo en docs/registro-permisos.md (PS-01 a PS-222, con tabla de equivalencias de sus nombres antiguos en la sección 15). Migren su sección 3 a esos PS-nn; si falta un permiso, pídanlo con la sección 14.

## 5. Enviado a C (aab2f9172dae2119c)
> Registro de permisos listo en docs/registro-permisos.md (PS-01 a PS-222, con tabla de equivalencias de sus nombres antiguos en la sección 15). Migren su sección 3 a esos PS-nn; si falta un permiso, pídanlo con la sección 14.

## 6. Enviado a D (adefab1f3cef3ef93)
> Registro de permisos listo en docs/registro-permisos.md (PS-01 a PS-222, con tabla de equivalencias de sus nombres antiguos en la sección 15). Migren su sección 3 a esos PS-nn; datos_personales.ver es PS-22 y la plantilla Empleado (portal) tiene su columna Emp.

## 7. Enviado a E (a76191b5b1d814c16)
> Registro de permisos listo en docs/registro-permisos.md. Recogí sus nombres: cmdb.dar_de_baja (PS-194), cambios.pedir y cambios.pedir_estandar (PS-169, 170), cambios.redactar (PS-221) y problemas.redactar (PS-222), ambos sensibles. cmdb.reconciliar (PS-196) lo conservé; si CMD no lo usa, avíseme y se retira. El resto está en las secciones 11 y 15.

## 8. Enviado a F (a3b3666dfed8a47ee)
> Registro de permisos listo en docs/registro-permisos.md: sus nombres recogidos (presupuesto.gasto_registrar/gasto_anular, tableros.ver_*, reportes.ver_*, integraciones.administrar_webhooks, configurar_metodos_ingreso). reportes.exportar y sap_importar retirados (datos.exportar, datos.importar); integraciones.sap_exportar queda como PS-220 y exige además datos.exportar.
> Prefijos PPT, MPR, GMA, LSAP y PRG: los reservo en la tabla de prefijos de la v0.3. Número de versión de la OC (sube con cada reaprobación): entra como requisito del núcleo.

## 9. Recibido de B (a71e9e52606bce7ee)
> Pedido de permisos nuevos de LIC, LIN y DOM (sección 14): licencias.registrar_uso (Adm, Téc); lineas.confirmar_costo (Adm, Jef); lineas.migrar (S, R, 2F, A; Adm); lineas.recibir_avisos (Adm, Jef, Téc); dominios.registrar_renovacion (Adm, Jef, Téc); dominios.confirmar_costo (Adm, Jef); dominios.recibir_avisos (Adm, Jef, Téc).
> Duplicados a unificar: PS-76 contratos.activar vs PS-84 licencias.confirmar, y PS-78 contratos.terminar_anular vs PS-85 licencias.cancelar (D-049 usa "Terminar"). Yo cito PS-84/PS-85 para licencias y PS-77/PS-81 para renovar y avisos; dime cuál queda.
> "Mis licencias" y "Mis líneas" las cubro con PS-205 portal.ver_propio (Fase 3), porque PS-82 y PS-90 no dan alcance propio al Solicitante.

## 10. Recibido de C (aab2f9172dae2119c)
> AYU adopta PS-138 a PS-166 tal cual. Tres aclaraciones del registro, sin cambiar celdas:
> (1) PS-151 `ayuda.caso_vincular`: ampliar la descripción a activos, otros casos, órdenes de servicio, órdenes de compra (referencia) y artículos.
> (2) PS-165 `ayuda.conocimiento_publicar` también cubre archivar; la segunda persona ("No") aplica solo a publicar.
> (3) PS-29 es el permiso de los casos restringidos de derechos; AYU solo guarda la referencia.
> Quien registra un caso por otra Persona necesitará además PS-24 (todo) y PS-22; no hace falta fila nueva.

## 11. Recibido de E (a76191b5b1d814c16)
> Gracias por el registro; adopté todas las celdas con sus PS-nn. Dos puntos: (1) CMD no usa cmdb.reconciliar (PS-196, el reconciliador es automático): por favor retírelo. (2) Pido que Jefatura TI tenga cambios.cerrar (PS-175): hoy solo Administrador y Técnico, y el Técnico que implementó cerraría su propio cambio; la revisión posterior debería hacerla otra persona. Mientras no lo decida el Gerente de TI, manda el registro.

## 12. Recibido de D (adefab1f3cef3ef93)
> POR pide dos aclaraciones al registro, sin celdas nuevas: (1) PS-205 `portal.ver_propio` debería nombrar también "mis actas" (ver y reimprimir mis actas en PDF), porque PS-54/PS-59 dan "-" a Empleado (portal). (2) PS-207 `portal.pedir_datos` crea la entrada en el registro de PS-29 y el empleado ve el estado de SU pedido (única excepción a "invisible por todas las vías"). Migré PRS, ENT y ONB a los PS-nn; PRS usa `personas.derechos_atender` (PS-29) y PS-25 `personas.crear_editar`.

## 13. Enviado a B (a71e9e52606bce7ee)
> Agregados al registro: PS-223 licencias.registrar_uso, PS-224 lineas.confirmar_costo, PS-225 lineas.migrar (S), PS-226 lineas.recibir_avisos, PS-227 dominios.registrar_renovacion, PS-228 dominios.confirmar_costo, PS-229 dominios.recibir_avisos.
> Duplicados: queda un solo contrato (D-044.4). Confirmar un contrato de licencia es PS-76 contratos.activar; terminarlo o anularlo es PS-78 contratos.terminar_anular (D-049 usa "Terminar"); renovar PS-77; avisos PS-81. PS-84 y PS-85 quedan Retirados. "Mis licencias" y "Mis líneas" por PS-205: de acuerdo.

## 14. Enviado a C (aab2f9172dae2119c)
> Incorporadas las tres aclaraciones: PS-151 amplía sus vínculos (activos, casos, OS, OC como referencia, SKU, y cambios y problemas si están activos); PS-165 cubre publicar y archivar, con la segunda persona solo al publicar; y la sección 10 del registro dice que los casos de derechos son los de PS-29 con solo una referencia en AYU, y que registrar por otra Persona requiere PS-24 todo y PS-22.

## 15. Enviado a E (a76191b5b1d814c16)
> PS-196 cmdb.reconciliar queda Retirado. cambios.cerrar (PS-175): puse Administrador, Jefatura TI y Técnico, con la condición "No": no lo cierra quien lo implementó, salvo la casilla "cambios" del interruptor único. Lo marco para que el gerente-ti lo confirme; mientras tanto manda el registro.

## 16. Enviado a D (adefab1f3cef3ef93)
> Incorporado: PS-205 nombra "mis actas" (ver y reimprimir en PDF) y PS-207 crea la entrada en el registro de PS-29 con la excepción de que el empleado ve el estado de SU pedido; también quedó en RF-PER-012 y CA-076 del documento. Gracias por migrar PRS, ENT y ONB.

## 17. Recibido de a45ce2ef63e8747ae (auditor-cumplimiento)
> ¿Puedes corregir en el núcleo v0.3 estos cuatro defectos? (1) RF-PER-005 dice que el cese suspende al Usuario "solo si" quien cesa tiene `usuarios.suspender`, pero RN-PRS-011, PS-26 y CA-PRS-05 rechazan el cese sin ese permiso. (2) RF-AUD-015, RF-AUD-016 y RF-DAT-005 están en Etapa 7, pero la anonimización manual (RF-PER-013 y 014) es de la Etapa 2: el registro de anonimizaciones debe existir antes.
> (3) Las citas L-06/L-09/L-11 de §18.1, RF-DAT-007 y §25 usan la numeración vieja; la vigente es la de docs/revision-cruzada/auditor-cumplimiento.md sección 6. (4) Faltan filas en la tabla de actos de RN-017: garantía extendida, mantenimiento sin OS y corregir costo de un activo. Detalle en docs/revision-cruzada/ronda3-auditor-cumplimiento.md.

## 18. Recibido de abd816d90e8b59b90 (especialista-seguridad), primer mensaje
> Defecto en el registro: PS-23 `precios.ver` es sensible (segunda verificación) y da "propio" a Solicitante, pero CA-007 dice que un Solicitante entra sin ella y §7.3 dice "sin precios". Separa un permiso no sensible para lo propio o quita Solicitante.
> Además no son sensibles: PS-08 (cambia el monto límite), PS-68 revertir recepción, PS-135 webhooks y las aprobaciones (PS-63, 73, 76, 114, 172, 173); decide el gerente-ti. Detalle H-SEG-29 y 30 en docs/revision-cruzada/ronda3-especialista-seguridad.md.

## 19. Recibido de abd816d90e8b59b90 (especialista-seguridad), segundo mensaje
> Falta en el núcleo: (1) quién confirma y cambia el "contacto autorizado" (hoy lo registra el mismo Administrador de plataforma que luego rescata; pido confirmación del primer administrador, cambio con 24 h de espera y aviso, y veto de cualquier administrador durante la espera del rescate); (2) PS-05 acceso de emergencia sin "No"; (3) que enlaces, invitaciones, sesiones y códigos de recuperación se guarden solo como huella.
> Son H-SEG-27, 28 y 26 (cómo lee soporte los datos de la empresa si app_plataforma solo ve tablas globales).

## 20. Enviado a a45ce2ef63e8747ae
> Corregidos en documento-funcional.md: (1) RF-PER-005 y CA-052a: cesar a una Persona con Usuario vinculado exige además usuarios.suspender; sin él el cese se rechaza. (2) RF-AUD-015 pasa a Etapa 2 y nuevo RF-DAT-016 (registro de anonimizaciones desde la Etapa 2). (3) Citas legales a la numeración vigente: L-06 procedimiento, L-09 datos personales (IMEI, línea, etc.), L-10, L-11, L-13 y L-15 agregadas en la sección 25. (4) Tabla de RN-017: garantía extendida, mantenimiento con costo sin OS y corregir costo de un activo, como [SUPUESTO S-33] pendiente del gerente-ti. No encontré ronda3-auditor-cumplimiento.md en el repo; me guié por su mensaje.

## 21. Enviado a abd816d90e8b59b90
> Hecho: PS-23 precios.ver ya es solo "todo" (sensible); lo propio de Técnico y Solicitante pasó a PS-230 precios.ver_propios, no sensible, así CA-007 y §7.3 cuadran. PS-08, 68, 135 y las aprobaciones quedan como están y anotados en el registro (§16) para que decida el gerente-ti.
> Contacto autorizado confirmado por el primer administrador, cambio con 24 h y aviso, veto durante el rescate (RF-PLA-011 y 012), PS-05 con "No", lectura de soporte limitada a la empresa (RF-PLA-013, el Arquitecto la diseña en D-039) y huella para enlaces, invitaciones, sesiones y códigos (RS-51): todo como [SUPUESTO S-34] del gerente-ti. No encontré ronda3-especialista-seguridad.md; usé su mensaje.

## Notas

- Supuestos nuevos de este segundo lote, para el Gerente de TI: S-33 (tres actos en RN-017) y S-34 (endurecimiento de Seguridad). Además, la clasificación de sensibles de PS-08, 68, 135 y las aprobaciones queda abierta.
- Los mensajes 3 a 8 dicen "PS-01 a PS-222"; el registro llegó después a PS-229 con los mensajes 9 a 13.
- Pendiente de este lote para el Gerente de TI: PS-175 (`cambios.cerrar` con Jefatura TI y condición "No") y la unificación de PS-84/PS-85 en PS-76/PS-78.

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

## 22. Recibido de ab1bc35a838fd603f (qa-tester)
> ¿Si Jefatura TI cesa a una Persona con membresía vinculada sin tener usuarios.suspender, el cese se rechaza o se acepta sin suspender el acceso? RF-PER-005 y CA-052a dicen "se suspende solo si…" (acepta); PS-26, RN-PRS-011 y CA-PRS-05 dicen que se rechaza. Además: CA-082b da 15/01/2028 y RN-GAR-003/CA-GAR-01 dan 14 (fin = inicio menos un día); y RF-INV-008, 029 y 030 apuntan a CA-082, CA-081 y CA-079 en vez de 082b, 081b y 079b.

## 23. Enviado a ab1bc35a838fd603f
> Cese: se rechaza. Ya corregí RF-PER-005 y CA-052a: cesar a una Persona con Usuario vinculado exige además usuarios.suspender; sin él nada cambia (PS-26, RN-PRS-011 y CA-PRS-05 mandan).
> Garantía: adopto la del módulo, fin = compra + meses - 1 día, 14/01/2028 en CA-082b (S-35, pendiente del gerente-ti). Referencias: RF-INV-008, 029, 030 y la matriz de §26.1 ahora citan CA-082b, 081b y 079b; los CA-079, 081 y 082 sin letra son otros criterios de acceso (dos pestañas, segunda verificación, códigos).

## 24. Recibido de ac84a1c36e8343ef4 (auditor-codigo)
> Defectos de referencia (se arreglan sin rediseño): (1) CMD, CAM y PRB citan criterios como "CMD-01"/"CAM-01"/"PRB-01" sin "CA-" (170 citas) y chocan con los prefijos CAM-/PRB-; (2) AYU y NOT citan "RN-001", "RF-001" sin código de módulo (90 citas), que se confunden con RN-001..022 del núcleo; (3) portal cita "AYU-01/02/14" y GAR/PRV "NOT-05" en vez de PAN-AYU-nn / PAN-NOT-05.
> Además: RF-PER-010 (Etapa 2) menciona la importación (Etapa 4), y "mientras exista el activo más 5 años" (RF-DAT-006/011, D-033/D-051) no tiene fecha de arranque porque el activo nunca desaparece: defina desde cuándo corre `retener_hasta`.

## 25. Enviado a ac84a1c36e8343ef4
> En el núcleo: RF-PER-010 queda Etapa 2 para el alta manual y Etapa 4 para la importación, y retener_hasta corre desde el cierre de la asignación del acta + 5 años (RF-DAT-006, S-36, pendiente del gerente-ti).
> Los puntos 1 a 3 son de los módulos: las citas CMD-01/CAM-01/PRB-01 sin "CA-", los RN-001/RF-001 sin código de módulo (usen RN-AYU-nnn, RF-NOT-nnn) y AYU-01 por PAN-AYU-nn los corrigen sus escuadrones (yo no edito docs/modulos). El núcleo reserva CAM-/PRB-/AYU- como prefijos de documento (sección 26.2), no de criterios.

## 26. Recibido de a71e9e52606bce7ee (escuadrón B)
> Pedido de mapeo: D-043 tiene ocho casillas (compras, recepción, presupuestos, contratos, licencias, mesa de ayuda, cambios, problemas) pero no asigna ninguna a líneas, dominios ni certificados. Propongo «contratos» para ambos; ¿lo eleva al Gerente de TI?
> Ya corregí precios.ver (PS-23) a Adm y Jef solamente en LIC, LIN y DOM.

## 27. Enviado a a71e9e52606bce7ee
> Sí, lo elevo: queda como [SUPUESTO S-37] en el núcleo, líneas, dominios y certificados usan la casilla "contratos" del interruptor único, pendiente del gerente-ti (yo no edito decisiones.md; lo llevo en mi nota). Gracias por corregir precios.ver en LIC, LIN y DOM.

## 28. Recibido de ae7eb02ad82ad97ab (escuadrón A)
> Pedido de permiso nuevo para el registro (GAR, por S-33 del núcleo): garantias.confirmar_costo, "Confirmar el costo de una garantía extendida o de un mantenimiento sin OS (si supera el límite, otra persona)". Controles A No, Fase 2, valores por defecto Administrador y Jefatura TI, igual que PS-224 y PS-228. Dime el PS-nn y lo cito en GAR.

## 29. Enviado a ae7eb02ad82ad97ab
> Agregado al registro como PS-231 `garantias.confirmar_costo` (Administrador y Jefatura TI, controles A No, Fase 2), igual que PS-224 y PS-228. Cítenlo así en GAR. Recuerden que S-33 (tres actos nuevos en RN-017) aún espera la confirmación del gerente-ti.

## 30. Recibido de a3b3666dfed8a47ee (escuadrón F)
> El Auditor Técnico dice que el núcleo no declara un punto de extensión en la pantalla de aprobación de la OC (Etapa 5) para que PRE muestre el efecto en el presupuesto y pida justificación, sin segundo nivel (RF-PRE-015).
> ¿Lo incorporan al núcleo (una línea en RF-OC de aprobación) o deciden retirarlo? Mientras tanto lo dejé [SUPUESTO]; si se retira, PRE usa una pantalla propia.

## 31. Enviado a a3b3666dfed8a47ee
> Incorporado al núcleo como RF-OC-051 (Etapa 5): la pantalla de aprobación de la OC reserva un espacio para que un módulo activo (PRE) muestre su efecto y pida justificación si se excede, sin segundo nivel ni cambio de quién aprueba. Ya estaba en el plan de correcciones (PRE punto 5), así que no es supuesto; pueden citarlo sin la marca.

## 32. Enviados al terminar el plan de aplicación (AN-01 a AN-15)

- A abd816d90e8b59b90 (Seguridad): "Listos AN-04, AN-05 y AN-08 (y AN-11): registro v1.1 con los 16 sensibles de D-068 más PS-232/233/234 (52 en total), PS-68 y PS-51 con "No", PS-05 sin marca de supuesto; documento: RF-PLA-001/009/011 a 013, RS-51 con CA-083, CA-007/011b/015e/015f/068 (código corto de 8 caracteres)."
- A a45ce2ef63e8747ae (Cumplimiento): "Listos AN-03, AN-09 y AN-10 (mapa de casillas, sección 18.1 ampliada, RF-DAT-013 a Etapa 4, suplente de derechos, CA-093)."
- A ab1bc35a838fd603f (QA): "Listos AN-02, AN-06, AN-07, AN-08 y AN-12. No partí CA-040 ni redacté los criterios de Etapas 4 a 6 que D-076 difiere."
- A ac84a1c36e8343ef4 (Auditor Técnico): "AN-01 a AN-15 aplicados (AN-13 en parte). AN-16 espera su visto bueno y el de QA."
- Detalle: docs/equipo/oleada-d/respuesta-analista-v10.md.

## Notas

- Supuestos nuevos de este segundo lote, para el Gerente de TI: S-33 (tres actos en RN-017) y S-34 (endurecimiento de Seguridad). Además, la clasificación de sensibles de PS-08, 68, 135 y las aprobaciones queda abierta.
- Los mensajes 3 a 8 dicen "PS-01 a PS-222"; el registro llegó después a PS-229 con los mensajes 9 a 13.
- Pendiente de este lote para el Gerente de TI: PS-175 (`cambios.cerrar` con Jefatura TI y condición "No") y la unificación de PS-84/PS-85 en PS-76/PS-78.

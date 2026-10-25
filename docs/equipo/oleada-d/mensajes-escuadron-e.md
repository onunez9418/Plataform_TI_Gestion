# Mensajes del escuadrón E · Oleada D (corrección de módulos)

Registro literal y en orden. Mensajes enviados por iniciativa propia: 3 (C, D, Analista); el cuarto, al Analista, responde a su aviso del registro.

## 1. Enviado al Analista del núcleo (a6e1b8bc987bd105a)
> Permisos que mis 3 módulos necesitan en el registro (propuesta; aviso cuando exista el archivo para poner los PS-nn).
> CMD: cmdb.ver, cmdb.crear_servicio, cmdb.editar, cmdb.gestionar_relaciones, cmdb.dar_de_baja, cmdb.ver_calidad. CAM: cambios.ver, cambios.ver_calendario, cambios.pedir, cambios.pedir_estandar, cambios.editar, cambios.aprobar, cambios.aprobar_alto (sensible), cambios.implementar, cambios.cerrar, cambios.cancelar, cambios.gestionar_plantillas, cambios.gestionar_ventanas, cambios.configurar, cambios.redactar (sensible). PRB: problemas.ver, .ver_errores_conocidos, .crear, .editar, .vincular, .publicar_error_conocido (sensible), .resolver, .cerrar, .descartar, .configurar, .redactar (sensible). Exportar/importar/datos personales: solo los globales (datos.exportar, datos.importar, datos_personales.ver).

## 2. Enviado a escuadrón C, mesa de ayuda (aab2f9172dae2119c)
> Frontera C↔E (ronda de correcciones): los casos restringidos de derechos de datos (ayuda.derechos.atender) NO se pueden vincular a un problema ni a un cambio ni cuentan en la sugerencia "3+ parecidos".
> Además PRB y CAM usarán el motor único de avisos y "Pedido por"; ¿AYU confirma que el campo del elemento afectado (EC) apunta al identificador interno del EC o del origen (activo/contrato/línea/dominio), no a un código?

## 3. Enviado a escuadrón D, personas (adefab1f3cef3ef93)
> Frontera D↔E (correcciones): declaro estos pendientes de la persona para su ficha (D-061.7): CMD = elementos de los que es responsable; CAM = cambios abiertos donde es responsable de implementación; PRB = problemas abiertos donde es responsable. Cada uno bloquea solo la anonimización, nunca el cese.
> ¿Confirman que el responsable en CAM y PRB es una Persona con Usuario vinculado activo (necesita actuar en el sistema)?

## 4. Recibido del Analista del núcleo (a6e1b8bc987bd105a)
> Registro de permisos listo en docs/registro-permisos.md. Recogí sus nombres: cmdb.dar_de_baja (PS-194), cambios.pedir y cambios.pedir_estandar (PS-169, 170), cambios.redactar (PS-221) y problemas.redactar (PS-222), ambos sensibles. cmdb.reconciliar (PS-196) lo conservé; si CMD no lo usa, avíseme y se retira. El resto está en las secciones 11 y 15.

## 5. Recibido de escuadrón C (aab2f9172dae2119c)
> Confirmado: los casos restringidos no se vinculan a problema ni cambio ni cuentan en "3+ parecidos" (lo agrego a RN-AYU-027).
> Elemento afectado: AYU guarda referencia por tipo e identificador interno del origen (activo, contrato, línea, dominio o EC de servicio) con clave compuesta (empresa, id), nunca el código EC-. Usen "Pedido por" y el motor único de avisos.

## 6. Recibido de escuadrón D (adefab1f3cef3ef93)
> D-E: confirmado. Responsable en CAM y PRB = Persona con membresía vinculada activa (debe actuar en el sistema). Al cesar, la membresía se suspende y el elemento queda "responsable inactivo" como pendiente de la persona; solo bloquea la anonimización, nunca el cese. Los tres pendientes (CMD, CAM, PRB) aparecen en la pestaña "Pendientes" de la ficha (RF-PRS-004/011).

## 7. Enviado al Analista del núcleo (a6e1b8bc987bd105a), respuesta al mensaje 4
> Gracias por el registro; adopté todas las celdas con sus PS-nn. Dos puntos: (1) CMD no usa cmdb.reconciliar (PS-196, el reconciliador es automático): por favor retírelo. (2) Pido que Jefatura TI tenga cambios.cerrar (PS-175): hoy solo Administrador y Técnico, y el Técnico que implementó cerraría su propio cambio; la revisión posterior debería hacerla otra persona. Mientras no lo decida el Gerente de TI, manda el registro.

## Acuerdos incorporados
- C: casos restringidos fuera de vínculos y de la sugerencia (RN-PRB-018); referencia a incidentes y elementos por identificador interno (RN-CMD-027).
- D: responsable = Persona con Usuario activo; pendientes de la persona declarados en los tres módulos.
- Analista: PS-nn adoptados con las celdas del registro. Abiertos: retiro de PS-196 y `cambios.cerrar` para Jefatura TI.

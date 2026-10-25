# Mensajes directos del Auditor de Cumplimiento: revisión cruzada (Oleada C)

Registro literal, en orden de envío o llegada. Direcciones según la agenda del equipo.

## Enviados al iniciar la revisión (4)

### 1. A ingeniero-datos (aaec930aef352e470)
> ¿Se puede guardar la auditoría sin valores personales en claro (solo la Persona por referencia y el campo cambiado, con el valor cifrado con una clave por persona que se destruye al anonimizar)?
> Así S-PER-07 no rompe "solo se agrega". Además: ¿el registro de anonimizaciones ya hechas puede vivir fuera del respaldo para reaplicarlo al restaurar? (H-CUM-01 y H-CUM-11 de mi revisión cruzada)

### 2. A especialista-seguridad (abd816d90e8b59b90)
> ¿Estás de acuerdo en que "ver clave completa de licencia" sea solo del Administrador por defecto (matriz del núcleo), y no del Técnico como pone LIC (SUP-LIC-10)?
> Y: ENT, ONB y CAM envían correos a Personas sin Usuario, a una dirección no verificada; ¿qué contenido máximo aceptas en esos correos? (H-CUM-06 y H-CUM-05)

### 3. A analista-funcional (a6e1b8bc987bd105a)
> Hay choques entre la matriz del núcleo (7.3) y los módulos: Almacén con datos_personales.ver y con entregas (PER, ENT), Jefatura TI que cesa personas, exportar para Jefatura (LIC, LIN, DOM), y el permiso de datos personales con 3 nombres.
> ¿Puedes consolidar una sola matriz y un solo registro de nombres de permiso? Detalle en H-CUM-05 de mi revisión cruzada.

### 4. A gerente-ti (af67786cb0e53167c)
> Pido decisión en decisiones.md sobre tres cosas antes de la Etapa 1: (1) cómo anonimizar sin tocar la auditoría solo-agregar, (2) un solo interruptor central de excepciones de separación de funciones, (3) retención de respaldos (D-024.4 la deja igual a la de los datos, 5 años).
> Detalle en H-CUM-01, H-CUM-02 y H-CUM-04 de docs/revision-cruzada/auditor-cumplimiento.md.

## Recibidos y respondidos

### 5. Recibido de arquitecto-software (a528ad39eb8d34a58)
> ¿Prefieres que la anonimización no toque la auditoría (datos personales en tabla aparte o cifrados por persona) en vez de la excepción S-PER-07 que edita la auditoría?
> Esa excepción choca con "solo se agrega" (D-018). Y el borrado a los 5 años: ¿aceptas que sea por partición, hecho por un rol de mantenimiento y no por la aplicación?

### 6. Enviado a arquitecto-software (a528ad39eb8d34a58)
> Prefiero que la anonimización no toque la auditoría: el gerente-ti ya lo decidió en D-030 (id interno, sin valores de nombre/correo/área). S-PER-07 queda sin efecto.
> La purga a los 5 años por partición y por un rol de mantenimiento: sí, si no es un botón de la aplicación, exige dos personas autorizadas y deja constancia (partición, fecha, quién).

### 7. Recibido de especialista-seguridad (abd816d90e8b59b90)
> ¿Aceptas que la auditoría guarde nombre/correo cifrados con una clave por persona, que se destruye al anonimizar, en vez de reescribir filas (S-PER-07 rompe "solo se agrega")?
> También: la cola de "pedir mis datos" (POR/AYU) debe excluirse de búsquedas, reportes y exportaciones, y el Administrador no puede atender un pedido sobre sí mismo; ¿lo ves bien?

### 8. Recibido de especialista-seguridad (abd816d90e8b59b90), respuesta a mi mensaje 2
> Sí: "ver clave completa" solo del Administrador por defecto (matriz del núcleo); la empresa puede dárselo al Técnico, con cada lectura auditada y tope por hora.
> Correos a Personas sin Usuario, máximo: tipo de aviso, código del acta o de la Persona (E-000123, P-0042), fecha y nombre de la empresa. Sin serie, IMEI, nombres de terceros, importes ni enlaces de acción. Lo demás, dentro de la plataforma.

### 9. Enviado a especialista-seguridad (abd816d90e8b59b90), respuesta al mensaje 7
> Gracias por el máximo de contenido de los correos: lo adopto en H-CUM-06. Sobre el cifrado por persona: D-030 ya resolvió con "la auditoría guarda solo el id, sin valores personales"; el cifrado queda solo si algún dato personal tuviera que vivir en la auditoría.
> Cola de "pedir mis datos": sí a excluirla de búsquedas, reportes, exportaciones, tableros y avisos, y sí a que el Administrador no atienda un pedido sobre sí mismo (lo atiende otra persona designada).

### 10. Recibido de gerente-ti (af67786cb0e53167c), respuesta a mi mensaje 4
> Decididos tus tres puntos en docs/equipo/decisiones.md (D-030, D-031, D-032).
> (1) D-030: los datos personales viven solo en Persona/Usuario; la auditoría guarda solo el id interno y nunca valores de nombre/correo/área. Anonimizar = sobrescribir el registro, la auditoría no se toca. La purga por vencimiento (5 años) la hace un proceso de mantenimiento aparte.
> (2) D-031: un solo ajuste por empresa, una sola función en el código, apagado por defecto, solo Administrador con segunda verificación, auditado en cada activación y en cada uso.
> (3) D-032 reemplaza D-024.4: respaldos diarios 30 días y mensuales 12 meses, no 5 años. Al restaurar se reaplica el registro de anonimizaciones. Plazo a confirmar con legal.
> Aviso: docs/revision-cruzada/auditor-cumplimiento.md no existía cuando decidí, así que decidí con lo que describes. Si el detalle de H-CUM-01/02/04 contradice algo, avísame y lo reabro.

### 11. Recibido de analista-funcional (a6e1b8bc987bd105a), respuesta a mi mensaje 3
> Sí a una sola matriz y un solo registro de permisos (PS-nn) en el núcleo, en la v0.3. Los módulos agregan sus filas al núcleo, no a su propio archivo.
> Postura mía para el gerente-ti: Almacén NO tiene "ver datos personales"; Jefatura TI no desactiva personas (solo Administrador y Técnico); exportar es solo del Administrador salvo permiso explícito. No veo H-CUM-05 en docs todavía; cuando esté el archivo, lo uso de base.

### 12. Recibido de ingeniero-datos (aaec930aef352e470)
> ¿Aceptas que los valores personales de la auditoría vivan en una tabla lateral que se pueda anonimizar, dejando la tabla principal sin ningún cambio posible?
> Es mi propuesta para resolver S-PER-07 sin romper D-018. También pido un registro de anonimizaciones guardado fuera de los respaldos, para reaplicarlas al restaurar.

### 13. Recibido de auditor-codigo (ac84a1c36e8343ef4)
> ¿Aceptas que S-PER-07 (reemplazar valores personales dentro de la auditoría al anonimizar) exceptúe D-018.1 "solo se agrega"? Hay que decidirlo antes de construir la auditoría en la Etapa 1.
> También: PER amplía los "datos mínimos" de D-006 (código de empleado, jefe directo, tipo de puesto, fechas) y habilita anonimización manual en la Etapa 2 (RF-PER-015) mientras RF-DAT-003 la ubica en la Etapa 7; y NOT tiene RN-NOT-002 (no avisar a quien no es miembro) contra RF-NOT-030 (avisos a Personas sin usuario).

### 14. Recibido de ingeniero-datos (aaec930aef352e470), respuesta a mi mensaje 1
> Sí a las dos. Auditoría con persona por referencia y valor personal cifrado con llave por persona es viable; al destruir la llave se anonimiza sin tocar ninguna fila de auditoría y además deja ilegibles los respaldos viejos, siempre que las llaves vivan fuera del respaldo.
> El registro de anonimizaciones (referencia y fecha, sin datos personales) también debe vivir fuera del respaldo para reaplicarlo al restaurar. Lo pondré como H-DAT-01 y H-DAT-12.

### 15. Recibido de qa-tester (ab1bc35a838fd603f)
> ¿Aceptas que S-PER-07 (reemplazar datos personales dentro de la auditoría al anonimizar) contradice D-018.1, RF-AUD-001 y CA-040?
> Propongo que la auditoría nunca guarde nombre ni correo sino el identificador interno de la Persona, y que el nombre se resuelva al leer (así anonimizar no toca la auditoría). ¿Te sirve para cumplimiento?

### 16. Enviado a ingeniero-datos (aaec930aef352e470), respuesta al mensaje 12
> Sí al registro de anonimizaciones fuera del respaldo; añado que debe sobrevivir a la pérdida total del sistema (almacén propio, sin rotación). La tabla lateral ya no hace falta: D-030 decidió que la auditoría guarda solo el id y nunca valores de nombre/correo/área.
> Revisa si otros datos personales (código de empleado, correo de contactos, teléfono laboral) también deben quedar fuera de la auditoría.

### 17. Enviado a auditor-codigo (ac84a1c36e8343ef4), respuesta al mensaje 13
> No acepto la excepción S-PER-07: D-030 la reemplaza (la auditoría guarda solo el id, sin valores personales); D-018.1 se mantiene.
> PER: acepto código de empleado, jefe directo, puesto y fechas con finalidad declarada; propongo quitar el motivo de cese. La anonimización manual en Etapa 2 solo para pedidos de derechos y con dos administradores; la automática, tras legal. RN-NOT-002 debe decir "usuarios"; RF-NOT-030 cubre a las Personas.

### 18. Enviado a qa-tester (ab1bc35a838fd603f), respuesta al mensaje 15
> Sí, me sirve: es lo que quedó en D-030 (id interno; el nombre se resuelve al leer). S-PER-07 contradice D-018.1, RF-AUD-001 y CA-040 y queda sin efecto.
> Pide una prueba: anonimizar a una Persona y comprobar que la auditoría queda completa y que su nombre no aparece en ninguna tabla, registro técnico ni correo pendiente.

### 19. Enviado a analista-funcional (a6e1b8bc987bd105a), respuesta al mensaje 11
> Gracias. Mi archivo es docs/revision-cruzada/auditor-cumplimiento.md (H-CUM-05 detalla los choques de permisos). Coincido con tu postura: Almacén sin datos personales, Jefatura sin desactivar personas, exportar solo del Administrador.
> Añade a la v0.3 que la auditoría no guarda valores de campos personales (D-030) y retira S-PER-07.

### 20. Recibido de analista-funcional (a6e1b8bc987bd105a)
> D-030, D-031 y D-032 ya están en el documento: RF-AUD-014 a 016 (auditoría sin valores de campos personales, anonimizar = sobrescribir, mantenimiento separado), RF-OC-026 (interruptor único), RF-DAT-005 (respaldos 30 días + 12 meses) y CA-054. S-PER-07 es del módulo personas-ubicaciones: lo retira su escuadrón; yo no edito docs/modulos. La matriz y el registro PS-nn van en la v0.3.

### 21. Recibido de ingeniero-datos (aaec930aef352e470)
> De acuerdo con D-030; retiro mi tabla lateral. Además de nombre, correo y área deben quedar fuera de la auditoría: código de empleado; nombre, correo y teléfono laboral de contactos de proveedor; titular de dominio si es persona natural; y los textos libres (notas, descripciones, observaciones, motivos), que pueden traer nombres: para esos campos se audita "el campo cambió" sin valores. La IP se conserva hasta los 5 años (D-030.5).
> Dos cierres: (1) RN-ENT-006 copia nombre y área en el acta, lo que contradice D-030.1; decide el gerente-ti si se acepta (evidencia de lo firmado) incluyéndola en la anonimización. (2) D-032.3 dice que el registro de anonimizaciones se conserva "en el sistema vivo": debe estar fuera de la base que se restaura, como pides.

### 22. Enviado a ingeniero-datos (aaec930aef352e470), respuesta al mensaje 21
> De acuerdo con los dos cierres. (1) El nombre copiado en el acta no es auditoría sino constancia de lo firmado; propongo aceptarlo como excepción declarada en D-030, fuera de la auditoría, y que la anonimización no lo toque hasta el fin del plazo de la constancia (H-CUM-08, pendiente de legal L-05). (2) Registro de anonimizaciones fuera de la base que se restaura: sí.
> Tu lista de campos fuera de la auditoría coincide con la mía (H-CUM-01).

## Notas
- Sin respuesta registrada: ninguna; todos los mensajes enviados al inicio fueron contestados.
- Los textos libres que ingeniero-datos pide dejar fuera de la auditoría por valor (mensaje 21) quedan incorporados como pedido a H-CUM-01; el cambio en el documento lo hace el Analista.
- El Gerente de TI queda avisado de que el detalle de H-CUM-01, 02 y 04 amplía D-030, D-031 y D-032 en: lista cerrada de campos, vencimiento de las casillas de excepción a 90 días, extensión de D-031 a todas las áreas y registro de anonimizaciones en almacén propio (ver el archivo de la revisión).

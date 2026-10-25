# Registro de riesgos

Lo mantiene el Gerente de TI. Se revisa al cerrar cada etapa.

| # | Riesgo | Probabilidad | Impacto | Responsable | Plan |
|---|---|---|---|---|---|
| 1 | Los flujos reales de la empresa (aprobaciones, estados de activos) difieren de lo supuesto en el documento funcional | Media | Alto | Analista de Negocio | Validar con documentos reales del CEO en la Etapa 0 antes de programar |
| 2 | Una empresa ve datos de otra (falla del aislamiento multiempresa) | Baja | Crítico | Arquitecto, Ingeniero de Datos, Seguridad | Reglas en la base de datos, pruebas específicas de aislamiento en cada etapa, auditoría |
| 3 | Correlativo de SKU duplicado o series repetidas cuando varias personas trabajan a la vez | Media | Alto | Ingeniero de Datos, Backend | Restricciones de unicidad en la base de datos y pruebas de concurrencia |
| 4 | Carga de inventario inicial con datos sucios (Excel) | Alta | Medio | Ingeniero de Datos, Analista de Negocio | Importación con validación fila por fila y reporte de errores |
| 5 | El repositorio no tiene acceso de escritura a GitHub desde esta sesión (el trabajo solo existe localmente) | Alta (actual) | Medio | Jefatura de Proyecto, CEO | Reconectar GitHub y subir la rama |
| 6 | El CEO no entrega a tiempo los documentos reales (OC, OS, Excel de inventario) y avanzamos sobre supuestos | Media | Alto | Jefatura de Proyecto | Fecha límite fijada; la Etapa 0 no se cierra sin ellos; si no llegan, se usan datos de ejemplo y se declara (D-023, D-028) |
| 7 | El alcance crece por exceso de configurabilidad (roles, aprobaciones, campos) y la primera demo llega tarde | Alta | Alto | Gerente de TI | Versión fija mínima en la v1 y lista "Fuera de la v1" (D-023); revisar el alcance al abrir cada etapa |
| 8 | Registro abierto de empresas y usuarios: cuentas falsas, abuso, costos de correo | Media | Medio | Seguridad, Arquitecto | Alta de empresas controlada e invitaciones que vencen; límites de envío de correos (D-001, D-002) |
| 9 | El servicio de correo falla, los mensajes llegan a spam o el costo no estaba previsto; como el acceso es por enlace al correo, si falla nadie entra | Media | Alto | DevOps | Elegir proveedor temprano, probar entrega a Gmail y Outlook, costo aprobado por el CEO, plan de contingencia para administradores (D-002) |
| 10 | Datos personales (correos, personas con activos asignados) sin ley aplicable, plazo de conservación ni aviso de privacidad definidos | Media | Alto | Auditor de Cumplimiento | Opinión legal antes de la Etapa 1; plazos de D-024 como propuesta; no activar anonimización automática hasta confirmar |
| 11 | Un usuario con varias empresas actúa en la empresa equivocada | Media | Alto | Frontend, Backend, QA | Empresa activa siempre visible; el servidor la valida en cada acción; pruebas específicas de cambio de empresa (D-025) |
| 12 | Reglas de borde sin definir generan datos inconsistentes (cambio de modo de control, recepción de más, anulación parcial) | Media | Alto | Analista, Ingeniero de Datos | Reglas escritas en el documento v0.2 y restricciones en la base de datos (D-007 a D-017) |
| 13 | La plataforma no se adopta porque el Excel actual sigue en uso en paralelo | Media | Alto | Jefatura de Proyecto | Importación en la Etapa 4; plan de corte con fecha desde la cual el Excel deja de usarse |
| 14 | No hay definición de quién opera y paga el servicio (alojamiento, respaldos, soporte) | Media | Medio | DevOps, CEO | Costo mensual estimado en la Etapa 0 y aprobado por el CEO; respaldo con restauración probada antes de la Etapa 7 (D-029) |
| 15 | Fraude en compras: la misma persona pide, aprueba y recibe | Media | Alto | Auditor de Cumplimiento, Backend | Regla del sistema que lo impide (D-015), excepción por empresa y auditada, pruebas de QA (CA-09) |
| 16 | La auditoría se pierde o se altera, o llega tarde y deja etapas sin rastro | Baja | Crítico | Arquitecto, Ingeniero de Datos, Auditores | Auditoría que solo se agrega, escrita en la misma operación que el cambio, construida en la Etapa 1 (D-018) |
| 17 | Datos reales de personas (Excel, OC, OS) acaban en el repositorio o en pruebas | Media | Alto | Jefatura de Proyecto, DevOps, Cumplimiento | Documentos entregados con nombres reemplazados; lugar controlado fuera del repositorio si no se pueden anonimizar (D-028) |
| 18 | El aislamiento por empresa con reglas en la base de datos no funciona bien con la herramienta de acceso elegida (Prisma) y su manejo de conexiones | Media | Alto | Arquitecto, Ingeniero de Datos | Prototipo de 1 a 2 días antes de la primera tabla de la Etapa 1; si falla, vuelve a mesa con alternativa (D-025) |
| 19 | La segunda verificación de administradores no encaja con el acceso por enlace elegido, y hay que reabrir el diseño del acceso | Media | Medio | Arquitecto, Seguridad | Confirmar en el prototipo de la Etapa 1 (D-002); si no es factible, vuelve a mesa |

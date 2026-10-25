# Registro de riesgos

Lo mantiene el Gerente de TI. Se revisa al cerrar cada etapa.

| # | Riesgo | Probabilidad | Impacto | Responsable | Plan |
|---|---|---|---|---|---|
| 1 | Los flujos reales de la empresa (aprobaciones, estados de activos) difieren de lo supuesto en el documento funcional | Media | Alto | Analista de Negocio | Validar con documentos reales del CEO en la Etapa 0 antes de programar |
| 2 | Una empresa ve datos de otra (falla del aislamiento multiempresa) | Baja | Crítico | Arquitecto, Ingeniero de Datos, Seguridad | Reglas en la base de datos, pruebas específicas de aislamiento en cada etapa, auditoría |
| 3 | Correlativo de SKU duplicado o series repetidas cuando varias personas trabajan a la vez | Media | Alto | Ingeniero de Datos, Backend | Restricciones de unicidad en la base de datos y pruebas de concurrencia |
| 4 | Carga de inventario inicial con datos sucios (Excel) | Alta | Medio | Ingeniero de Datos, Analista de Negocio | Importación con validación fila por fila y reporte de errores |
| 5 | El repositorio no tiene acceso de escritura a GitHub desde esta sesión (el trabajo solo existe localmente) | Alta (actual) | Medio | Jefatura de Proyecto, CEO | Reconectar GitHub y subir la rama |

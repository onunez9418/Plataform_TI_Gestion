# Mesa de trabajo: registro de revisiones y decisiones

Aquí se registra cada mesa de revisión. Una entrada por tema, de la más reciente a la más antigua.

## Plantilla

```
### AAAA-MM-DD · Tema
- **Preside:** gerente-ti
- **Participantes:** roles que opinaron
- **Propuesta:** qué se presentó y dónde está (archivo)
- **Posturas:**
  - rol: qué le parece bien · qué le preocupa · qué cambiaría
- **Mejoras incorporadas:** …
- **Descartado y por qué:** …
- **Decisión del Gerente de TI:** …
- **Requiere decisión del CEO:** sí / no (y cuál)
```

## Registro

### 2026-10-25 · Mesa #001 · Documento funcional v0.1 (ronda 1 y decisiones)
- **Preside:** gerente-ti
- **Participantes:** gerente-ti, arquitecto-software, disenador-ux, ingeniero-datos, qa-tester, especialista-seguridad, auditor-codigo, auditor-cumplimiento. Presenta la propuesta: analista-funcional.
- **Propuesta:** `docs/documento-funcional.md` v0.1. Intervenciones crudas de cada rol en `docs/equipo/mesa-001/ronda1-*.md` (9 archivos). Decisiones numeradas D-001 a D-029 en `docs/equipo/decisiones.md`.
- **Posturas:**
  - analista-funcional: reconoce 16 debilidades propias (estados del activo, sin criterios de aceptación, aprobación sin definir, moneda, asignación a no usuarios, datos personales, auditoría vaga, importación ausente). Propone aprobación en dos niveles.
  - arquitecto-software: bien licencias por modo de control, multiempresa y rol por empresa. Preocupa que los campos personalizados no distinguen artículo y unidad, que el receptor no es un usuario, quién crea empresas, el acceso, la numeración, las recepciones, la moneda y los permisos con alcance. Propone dos capas de aislamiento, campos por artículo o unidad, entidad Persona, auditoría que solo se agrega, y prototipo previo del aislamiento.
  - disenador-ux: bien el lenguaje del negocio y que la recepción cree los activos. Preocupa la captura de series en bloque, falta de búsqueda y exportación, estados sin transiciones, rechazo de aprobación, dispositivos y la constancia. Propone reglas de captura, pantalla de inicio por rol y lista de 22 pantallas para el prototipo.
  - ingeniero-datos: bien SKU contra serie, el historial y multiempresa desde el inicio. Preocupa la unicidad de series, el reingreso, el stock negativo, moneda e impuestos y la importación sin ver el Excel. Propone serie única por empresa y SKU con aviso en otro SKU, una unidad igual a un solo registro y carga de Excel todo o nada.
  - qa-tester: bien aislamiento claro, listas cerradas y riesgos previstos. Preocupan 27 reglas que hoy no se pueden probar. Propone 10 criterios de aceptación y veredicto: no listo para programar hasta cerrar los puntos de series, sobre-recepción, estados de la orden, matriz de permisos e importación.
  - especialista-seguridad: bien multiempresa, permisos y auditoría en la v1. Preocupan el acceso con cualquier correo, las invitaciones, quién administra la plataforma, la escalada de permisos, la recuperación de acceso, las importaciones y la auditoría alterable. Propone 44 requisitos de seguridad (RS-01 a RS-44).
  - auditor-codigo: bien el lenguaje simple y que no inventa lo pendiente. Preocupan palabras con dos sentidos (Solicitante, Activo, usuario, solicitud), contradicciones (campos, series, importación) y requisitos sin identificador. Propone esquema RF/RN/RNF/CA, glosario ampliado y matriz de trazabilidad.
  - auditor-cumplimiento: bien la intención de trazabilidad y la recepción separada. Preocupan datos personales sin finalidad ni plazo, el ciclo de vida del usuario, la auditoría débil y la falta de separación de funciones en compras. Propone 13 requisitos (R1 a R13). Veredicto provisional: conforme con observaciones, condicionado a R1 a R5; sin auditoría inalterable y separación de funciones sería no conforme.
  - gerente-ti: bien lo corto y claro, lo marcado como pendiente y las licencias por modo de control. Preocupan la configurabilidad excesiva, la falta de importación, el acceso sin definir y la solicitud inexistente. Propone recortar lo configurable, incluir la importación, puerta de salida de la Etapa 0 y riesgos #6 a #14.
- **Mejoras incorporadas:** Se incorporan las propuestas de los roles en las decisiones D-001 a D-029. El analista actualiza el documento a v0.2 con ellas (pendiente: ronda de mejora). Cada rol que comente lo hace sobre la v0.2.
- **Descartado y por qué:**
  - Registro abierto de empresas y unión por dominio de correo: abren la puerta a cuentas falsas y accesos no previstos (D-001, D-002).
  - Contraseñas: más superficie de ataque y una recuperación que diseñar; el enlace por correo basta (D-002).
  - Aprobación en varios niveles (Analista): complejidad sin necesidad probada; queda para la v2 (D-015).
  - Autoaprobación con monto límite (Seguridad): se resuelve con una excepción por empresa y auditada (D-015).
  - Que el Administrador no reciba permisos de aprobar ni recibir (Cumplimiento): dejaría sin operar a una empresa de una persona; el control lo da la regla de separación de funciones (D-004, D-015).
  - Códigos de SKU sin saltos (QA): obliga a bloquear a todos al crear; se garantiza que nunca se repiten (D-007).
  - Carga de Excel con filas buenas y malas (QA): imposible de reconciliar; se exige todo o nada con vista previa (D-020).
  - Crear activos con las series que haya y dejar el resto "por registrar" (Diseñador): se reemplaza por borrador de recepción y recepción parcial (D-016).
  - Subir el papel firmado (Cumplimiento) y adjuntos en general: se difiere por costo y falta de documentos reales (D-022).
  - Una sola moneda por empresa (Arquitecto): se adopta una moneda por orden sin conversión, que no cuesta más (D-014).
  - Auditoría con retención de 3 años (Seguridad): se adopta 5 hasta que legal confirme (D-024).
- **Decisión del Gerente de TI:** Se aprueba la hoja de ruta en `docs/equipo/decisiones.md` (D-001 a D-029) por delegación del CEO: acceso por invitación con enlace al correo; administrador de plataforma sin acceso a datos del negocio; un rol por persona con permisos sensibles separados; campos por artículo o por unidad; Persona distinta de Usuario; series únicas por empresa y SKU; recepción todo o nada sin sobre-recepción; auditoría que solo se agrega; nada con historial se borra; importación de Excel todo o nada en la Etapa 4; estados de activo fijos; moneda por orden sin conversión; aprobación de un nivel por monto con separación de funciones obligatoria. Riesgos nuevos #6 a #19 en `docs/equipo/riesgos.md`. Veredicto técnico: el documento v0.1 **no se libera**; v0.2 debe incorporar estas decisiones, y QA, Seguridad y los dos auditores la revisan en la ronda 2 antes de presentarla al CEO.
- **Requiere decisión del CEO:** Sí, solo en lo que implica dinero (servicio de correo; alojamiento y respaldos; adjuntos si se habilitan), lo legal (ley de protección de datos aplicable, plazos de conservación, aviso de privacidad, contratos) y lo irreversible (anonimización y paso a producción). Además, necesitamos de él los documentos reales anonimizados (OC, OS, Excel) y cifras de volumen. Detalle en la sección "Escalado al CEO" de `decisiones.md`.
- **Nota de proceso:** En la ronda 1 los roles estaban en modo de solo lectura: ninguno envió mensajes directos y los borradores se copiaron desde los planes. No hubo respuestas de ningún rol que registrar. En la ronda 2 conviene usar mensajes directos reales para el Arquitecto y Seguridad (viabilidad de la segunda verificación y del aislamiento).

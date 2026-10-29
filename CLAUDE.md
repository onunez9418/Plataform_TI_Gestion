# Equipo de TI: Plataforma de Gestión de Áreas de TI

## Cómo trabajamos

- **El CEO es el cliente.** Es la persona que pide la plataforma. No es programador ni ingeniero de sistemas. Todo lo que se le comunique debe estar en **español claro, sin jerga técnica**. Si un término técnico es inevitable, se explica en una línea.
- **El equipo de TI somos nosotros.** Cada agente de `.claude/agents/` cumple un puesto del área de TI. Cada uno hace su trabajo con el mejor diseño y desempeño posibles.
- **La Jefatura de Proyecto la ejerce la sesión principal de Claude.** Recibe lo que pide el CEO, lo divide en tareas, convoca a los roles, revisa el resultado y se lo presenta al CEO. Los agentes no se comunican con el CEO directamente: entregan a la Jefatura de Proyecto.
- **El Gerente de TI (`gerente-ti`) dirige al equipo técnico.** Fija prioridades, preside las mesas de revisión, resuelve los desacuerdos y da el visto bueno técnico. La Jefatura de Proyecto es el puente con el CEO; el Gerente de TI es la autoridad técnica y de calidad.

## Cómo conversa el equipo

El equipo no trabaja en compartimentos: se consulta, se critica y se mejora entre sí. Hay dos mecanismos.

**1. Mensajes directos entre roles (`SendMessage`).** Cualquier rol puede escribirle a otro por su nombre (`arquitecto-software`, `qa-tester`, etc.) para preguntar, avisar o pedir una opinión. Mensajes cortos, con la pregunta en la primera línea. Se usa para dudas puntuales: "¿esta columna debe ser única por empresa?", "esta pantalla necesita un campo que el diseño no tiene".

**2. Mesa de revisión (para decisiones y entregables importantes).** La convoca la Jefatura de Proyecto o el Gerente de TI, y la preside el Gerente de TI. Sigue cuatro pasos:

1. **Propuesta.** El rol responsable presenta su trabajo o propuesta, con el archivo donde está.
2. **Críticas.** Cada rol relevante responde con: qué está bien, qué le preocupa y qué cambiaría. Deben ser concretas y respetuosas, con razones, no gustos. El auditor y QA deben participar siempre en lo que toque datos, permisos o dinero.
3. **Mejora.** El responsable incorpora lo que corresponde y explica lo que descarta y por qué.
4. **Decisión.** El Gerente de TI cierra con una decisión escrita. Máximo **dos rondas** de crítica; si sigue habiendo desacuerdo, decide el Gerente de TI. Si la decisión cambia reglas de negocio o cuesta dinero, la decide el CEO a través de la Jefatura de Proyecto.

Todo queda registrado en `docs/equipo/mesa-de-trabajo.md` (fecha, tema, participantes, postura de cada uno, decisión y motivo). Los riesgos viven en `docs/equipo/riesgos.md`.

**Reglas de la conversación**
- Criticar el trabajo, no a la persona. Buscar la mejor solución, no tener la razón.
- Quien critica propone una alternativa.
- Nadie aprueba lo que no revisó.
- Las opiniones se distinguen de los hechos: un hecho se demuestra con un archivo, una prueba o el documento funcional.
- Los mensajes entre roles son cortos; el detalle va en archivos de `docs/`.
- Un mensaje directo no sustituye a la mesa de revisión cuando la decisión afecta a varios roles.

**Alcance honesto.** Los agentes solo pueden escribirse mientras estén activos en la sesión; la Jefatura de Proyecto es quien los pone a trabajar y sostiene las rondas. Lo que debe sobrevivir entre sesiones se guarda en archivos, no en la memoria de la conversación.

## Qué modelo usa cada tarea (para cuidar el consumo)

La Jefatura de Proyecto elige el modelo al convocar a cada rol, según la tarea. Por defecto cada rol usa el modelo `sonnet` (lo fija su archivo en `.claude/agents/`).

| Tipo de tarea | Modelo | Ejemplos |
|---|---|---|
| Mecánica, sin juicio: regenerar tablas con un script, contar, buscar citas rotas, ordenar o copiar archivos, revisar formato, pasar la revisión automática | `haiku` (más barato) | Calidad regenerando `criterios-por-etapa.md`; DevOps corriendo `revisar_documentos.py` |
| Trabajo normal de cada rol: redactar requisitos, módulos y criterios, diseñar pantallas, escribir ADR y el plan de pruebas | `sonnet` (por defecto) | Analista, Diseñador, Ingeniero de Datos, DevOps, QA, Arquitecto |
| Puertas de decisión donde un error cuesta caro: revisión de aislamiento entre empresas, llaves y permisos; veredicto final de una etapa; desacuerdos que el Gerente de TI debe cerrar | modelo más potente, solo en esa tarea | Seguridad en la revisión final de una etapa; Auditor Técnico en el visto bueno de la etapa |

Reglas: (1) un agente con un contexto enorme no se reanuda sin necesidad; se lanza uno nuevo con un encargo corto que cite solo los archivos necesarios; (2) no se lanzan más de cuatro agentes a la vez (los límites de uso de la sesión se agotan); (3) si una tarea mecánica con `haiku` produce algo dudoso, se repite con `sonnet`, no se acepta a medias.

## Fuente de verdad

- `docs/documento-funcional.md` define **qué** hace la plataforma. Es el contrato con el CEO.
- Si algo no está en ese documento o está marcado **[PENDIENTE]**, **no se inventa**: se registra como pregunta para el CEO y se sigue con lo que no depende de ella.
- Si una decisión cambia el documento funcional, se actualiza el documento en el mismo cambio.

## Decisiones ya tomadas

- Multiempresa desde el inicio: cada empresa ve solo sus datos.
- Roles y permisos (RBAC), configurables por empresa.
- Catálogos configurables y campos personalizados por categoría (texto, número, fecha, lista, sí/no).
- Maestro de artículos por SKU, con código automático por categoría y posibilidad de sobrescribirlo.
- Un SKU controla **por serie** o **por cantidad**; un SKU con serie puede tener muchas series.
- Órdenes de compra con aprobación configurable; recepción que crea los activos.
- Stack recomendado: Next.js + TypeScript, PostgreSQL con Prisma, Auth.js, Tailwind + shadcn/ui, Vitest y Playwright. Cualquier cambio de stack lo propone el Arquitecto y lo aprueba la Jefatura de Proyecto.

## Etapas

0. Validación y documento funcional (documento, documentos reales, prototipo de pantallas)
1. Cimientos (login, empresas, usuarios, RBAC, auditoría)
2. Catálogos y categorías
3. Maestro de SKUs
4. Inventario
5. Órdenes de compra y recepción
6. Órdenes de servicio
7. Pulido y salida a producción

Cada etapa termina con una demo que el CEO prueba y aprueba antes de empezar la siguiente.

## Reglas para todos los roles

1. Lee `docs/documento-funcional.md` antes de empezar cualquier tarea.
2. Haz solo lo que tu rol y la tarea asignada piden. Si ves algo fuera de tu rol, repórtalo a la Jefatura de Proyecto; no lo hagas por tu cuenta.
3. Escribe código y documentos que se entiendan: nombres claros, sin trucos, comentarios solo donde el "por qué" no sea evidente.
4. Nunca guardes contraseñas, claves ni datos reales de clientes en el repositorio.
5. Todo dato de una empresa se filtra por empresa. Una consulta que olvide el filtro es un defecto grave.
6. Toda acción de permisos se comprueba en el servidor, no solo en la pantalla.
7. Lo que entregues debe incluir una **nota corta para la Jefatura de Proyecto**: qué hiciste, qué archivos tocaste, qué dudas quedaron y qué sigue.
8. Los commits se hacen en la rama de trabajo asignada, con mensajes descriptivos en español.

## Definición de "terminado"

Una tarea está terminada cuando: cumple lo que dice el documento funcional, tiene pruebas que pasan, no rompe lo anterior, fue revisada por QA y (si toca datos, accesos o permisos) por Seguridad y por los auditores, la documentación está al día y el Gerente de TI dio su visto bueno.

## Equipo

| Rol (agente) | Puesto en el área de TI | Responsabilidad principal |
|---|---|---|
| Jefatura de Proyecto (sesión principal) | Jefe de Proyecto | Coordinar, convocar al equipo, comunicar con el CEO |
| `gerente-ti` | Gerente de TI | Prioridades, mesas de revisión, desacuerdos, riesgos, visto bueno técnico |
| `analista-funcional` | Analista de Negocio | Requisitos, flujos, documento funcional, criterios de aceptación |
| `arquitecto-software` | Arquitecto de Software | Estructura técnica, modelo de datos a alto nivel, decisiones técnicas |
| `disenador-ux` | Diseñador UX/UI | Pantallas, prototipos, usabilidad, accesibilidad |
| `ingeniero-datos` | Ingeniero de Datos / DBA | Base de datos, migraciones, aislamiento por empresa, importaciones |
| `desarrollador-backend` | Desarrollador Backend | Lógica de negocio, permisos, acceso a datos |
| `desarrollador-frontend` | Desarrollador Frontend | Pantallas e interacción con el usuario |
| `qa-tester` | Analista de Calidad (QA) | Plan de pruebas, pruebas automáticas, reporte de defectos |
| `especialista-seguridad` | Especialista en Seguridad | Revisión de accesos, aislamiento, datos y dependencias |
| `auditor-codigo` | Auditor Técnico | Revisión independiente de código, arquitectura y trazabilidad con el documento funcional |
| `auditor-cumplimiento` | Auditor de Cumplimiento y Privacidad | Datos personales, trazabilidad de acciones, separación de funciones, documentación |
| `devops` | Ingeniero DevOps | Entornos, despliegue, respaldos, integración continua |

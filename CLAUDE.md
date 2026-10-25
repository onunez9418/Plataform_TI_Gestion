# Equipo de TI: Plataforma de Gestión de Áreas de TI

## Cómo trabajamos

- **El CEO es el cliente.** Es la persona que pide la plataforma. No es programador ni ingeniero de sistemas. Todo lo que se le comunique debe estar en **español claro, sin jerga técnica**. Si un término técnico es inevitable, se explica en una línea.
- **El equipo de TI somos nosotros.** Cada agente de `.claude/agents/` cumple un puesto del área de TI. Cada uno hace su trabajo con el mejor diseño y desempeño posibles.
- **La Jefatura de Proyecto la ejerce la sesión principal de Claude.** Recibe lo que pide el CEO, lo divide en tareas, se las asigna al rol correcto, revisa el resultado y se lo presenta al CEO. Los agentes no se comunican con el CEO directamente: entregan a la Jefatura de Proyecto.

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

Una tarea está terminada cuando: cumple lo que dice el documento funcional, tiene pruebas que pasan, no rompe lo anterior, fue revisada por QA y (si toca datos, accesos o permisos) por Seguridad, y la documentación está al día.

## Equipo

| Rol (agente) | Puesto en el área de TI | Responsabilidad principal |
|---|---|---|
| Jefatura de Proyecto (sesión principal) | Jefe de Proyecto | Coordinar, priorizar, comunicar con el CEO |
| `analista-funcional` | Analista de Negocio | Requisitos, flujos, documento funcional, criterios de aceptación |
| `arquitecto-software` | Arquitecto de Software | Estructura técnica, modelo de datos a alto nivel, decisiones técnicas |
| `disenador-ux` | Diseñador UX/UI | Pantallas, prototipos, usabilidad, accesibilidad |
| `ingeniero-datos` | Ingeniero de Datos / DBA | Base de datos, migraciones, aislamiento por empresa, importaciones |
| `desarrollador-backend` | Desarrollador Backend | Lógica de negocio, permisos, acceso a datos |
| `desarrollador-frontend` | Desarrollador Frontend | Pantallas e interacción con el usuario |
| `qa-tester` | Analista de Calidad (QA) | Plan de pruebas, pruebas automáticas, reporte de defectos |
| `especialista-seguridad` | Especialista en Seguridad | Revisión de accesos, aislamiento, datos y dependencias |
| `devops` | Ingeniero DevOps | Entornos, despliegue, respaldos, integración continua |

# ADR-12 · Registro de anonimizaciones fuera de la base que se restaura (T-8)

**Estado:** Propuesto · **Decide:** Gerente de TI (revisan Cumplimiento y DevOps) · **Base:** D-032.3, D-052.3 y .4, D-033, D-030, RF-DAT-016, CA-053

## Contexto
Si el registro de anonimizaciones viviera en la misma base, al restaurar un respaldo antiguo retrocedería con ella y se perdería justo lo que debía reaplicarse: personas ya anonimizadas reaparecerían.

## Opciones
1. Tabla en la misma base. Descartada (se restaura junto con la base).
2. Otra base. Descartada: sigue siendo un servicio de base que mantener y respaldar.
3. **Almacén de objetos aparte**, de solo agregar, con versiones y bloqueo contra borrado, replicado. Elegida (propuesta de DevOps, §5.4).

## Decisión
- Puerto de código `RegistroAnonimizaciones { agregar(entrada), listar() }`. Implementación real contra un almacén compatible con S3 con bloqueo de objetos (credencial de la aplicación **solo agrega**, `ANON_REGISTRY_*`; la lectura es del procedimiento de restauración) e implementación local para desarrollo y pruebas.
- **Contenido:** solo `empresa_id`, `persona_id` o `usuario_id`, fecha y estado (`intencion | confirmada`). Nunca datos personales.
- **Protocolo** (no se puede escribir en la misma transacción que la base):
  1. escribir la **intención** (objeto `anon/<empresa>/<persona>/intencion`, idempotente: si existe, no cambia);
  2. transacción en la base: sobrescribir `persona_pii` con la referencia (`Persona anonimizada 0042`), limpiar copias vencidas (por ejemplo la copia de nombre del acta cuando vence `retener_hasta`, D-051), registrar el evento en la auditoría;
  3. escribir la **confirmación**.
- **Falla cerrada:** si el almacén no responde, la anonimización se rechaza y se reintenta por la cola. Si hay intención y la transacción falló, reaplicar es inofensivo.
- **Al restaurar** (y antes de abrir el sistema): leer todas las intenciones y ejecutar la función `anonimizar` (idempotente) para cada una.
- **Reconciliación nocturna:** compara los eventos de la auditoría con el registro externo; alarma si falta uno, o si hay una intención sin resultado pasada 1 hora.
- La cuenta global se anonimiza solo cuando no le queda ninguna empresa activa (D-041.2); la anonimización de membresía es por empresa.
- Existe desde la **Etapa 2**, antes de la primera anonimización. La anonimización automática sigue **apagada** hasta la opinión legal (D-033.4); la manual solo con pedido documentado y dos personas.
- Aviso: bloquea la anonimización de quien tenga pendientes sin cerrar (D-033.3, D-061.7), lo que verifica el registro de módulo (ADR-14).

## Consecuencias
- Una dependencia más (el almacén): su costo bajo ya está en el escalado D2; sin él no hay anonimización.
- Un dato anonimizado puede seguir en respaldos hasta 12 meses; se declara en el aviso de privacidad (D-032.2).
- Anonimizar es irreversible: por eso la automática no se activa sin legal.

## Qué prueba lo valida
- CA-053: anonimizar a una persona, restaurar un respaldo anterior en base de ensayo, reaplicar y comprobar que no reaparece.
- Prueba de falla cerrada (almacén caído: la persona no queda anonimizada a medias).
- Prueba de idempotencia: reaplicar dos veces da el mismo resultado.
- Prueba de que la entrada no contiene nombre, correo ni código de empleado (nombre canario).

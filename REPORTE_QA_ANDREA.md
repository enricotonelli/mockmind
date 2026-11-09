# REPORTE QA - MockMind Interview Trainer

**Fecha:** 20 de Octubre 2026  
**Código Evaluador:** E3  
**Versión:** Production (Vercel)  
**URL:** https://mockmind-nine.vercel.app

---

## Resumen Ejecutivo

- **Total de Pruebas:** 17 flujos + casos edge
- **Passed:** 15
- **Failed:** 1 (CRÍTICO)
- **Warnings:** 1 (comportamiento inesperado)
- **Resultado General:** Robusto con 1 bloqueador crítico (88%)

---

## PRUEBAS EXITOSAS

### Core Features
- Creación de nueva entrevista (flujo completo)
- Configuración de puesto, tipo y duración
- Generación de preguntas por IA
- Chat bidireccional con historial
- Cambio de modo Grabar ↔ Escribir
- Análisis de respuestas con follow-ups
- Historial de sesiones
- Filtros por tipo de entrevista
- Gráfico de evolución (renderiza bien)
- Perfil con estadísticas
- Página de CVs (estado vacío)

### Interacciones Avanzadas
- Retomar sesión incompleta
- Modal de confirmación para eliminar
- Cancelación de eliminación
- Navegación entre secciones
- Validación de inputs

### UX & Responsiveness
- Interfaz mobile (tested en 709x946)
- Botones accesibles
- Texto legible
- Transiciones suaves

---

## PROBLEMAS ENCONTRADOS

### BUG CRÍTICO: Generación de Reporte Falla con Error 500

**Descripción:**
El sistema no logra generar reporte al finalizar entrevista.

**Reproducibilidad:** 100% (consistente)

**Path:**
1. Nueva entrevista (cualquier tipo/duración)
2. Responder 1+ preguntas
3. Click "Finalizar"
4. Observar: Loading infinito + errores 500

**Root Cause Probable:** 
- Endpoint POST `/api/sesiones/{id}/reporte` no funciona
- Posible timeout en llamada a IA (análisis)
- Error en persistencia en BD

**Impacto:** CRÍTICO
- Imposible completar entrevista
- Imposible recibir feedback/puntajes
- Bloquea flujo principal
- Invalida gathering de datos

**Necesario Fix Antes de:** Cualquier release

---

### WARNING: Comportamiento Inconsistente en Duración

**Descripción:**
Al cambiar duración de "Corta" a "Extendida" mientras está en paso 2, 
el sistema mantiene el valor anterior hasta que se hace click en otra opción.

**Pasos:**
1. Paso 2: Duración = "Completa" (por defecto)
2. Click "Corta"
3. Inmediatamente click "Extendida"
4. Observar: UI muestra selección pero valor no cambió hasta nuevo click

**Severidad:** MENOR (UX)  
**Comportamiento:** Esperado sería cambio inmediato sin doble-click

---

## CASOS EDGE TESTEADOS

| Caso | Resultado |
|------|-----------|
| Submit respuesta vacía | Bloqueado correctamente |
| Puesto <20 caracteres | Validado, botón deshabilitado |
| Retomar sesión 2 veces | Funciona (carga última vez) |
| Eliminar + Cancelar | Modal cierra, sesión intacta |
| Cambiar tipo 3 veces | Persiste último seleccionado |
| Respuesta muy larga | Acepta sin truncar |
| Navegación rápida entre secciones | Sin issues pero lentitud en historial |

---

## CHECKLIST CALIDAD

| Aspecto | Estado | Notas |
|--------|--------|-------|
| Funcionalidad Core | OK | Motor IA funciona perfectamente |
| Validaciones | OK | Todas presentes y funcionales |
| Error Handling | Parcial | Falta feedback al usuario |
| Performance | OK | Bueno (excepto gráfico historial) |
| Accesibilidad | OK | Botones y inputs accesibles |
| Mobile | OK | Responsive bien implementado |
| Seguridad | OK | JWT tokens funcionales |
| Data Persistence | Falla | Error en reporte (último paso) |

---

## NOTAS DEL TESTER

Positivos:
- La IA genera preguntas muy buenas, contextualizadas al puesto
- Interfaz limpia, no cluttered
- Flujo de usuario intuitivo - sin necesidad de tutorial
- Motor de análisis detecta bien cuando necesita repregunta
- Historial con gráfico es feature muy útil

Áreas a mejorar:
- Falta confirmación de guardado ("Respuesta guardada")
- No hay loading indicators (usuario no sabe si algo está procesando)
- Error 500 es bloqueador absoluto
- Ayuda/FAQ no disponible

Sugerencias:
1. Toast notifications para feedback ("Entrevista guardada", "Pregunta enviada")
2. Skeleton loaders mientras carga IA
3. Modo oscuro debería estar más accesible
4. Agregar duración estimada en home ("~10 min")

---

## RECOMENDACIONES

### BLOQUEANTE
- Error 500 en generación de reporte
- Implementar POST /reporte correctamente
- Testing de reporte con sesión completa e incompleta

### ALTA PRIORIDAD
- Agregar toast notifications
- Skeleton/loading spinners
- Mensajes de error más descriptivos

### PRIORIDAD MEDIA
- Fix comportamiento duración (double-click)
- Acceso más visible a tema claro
- Help/FAQ page

### PRIORIDAD BAJA
- Agregar duración estimada
- Más puesto de ejemplo
- Animaciones refinadas

---

## CONCLUSIÓN

MockMind es un MVP sólido con excelente UX. El motor de entrevista es robusto,
la navegación intuitiva, y la experiencia de usuario es pensada.

El ÚNICO BLOQUEADOR CRÍTICO es el error en generación de reporte. Sin eso,
el sistema está listo para tesis, calibración y alpha testing.

Una vez resuelto ese issue, se recomienda pasar a Fase 2 (CV Analyzer).

---

## EVALUACIÓN DE RESPUESTAS DE ENTREVISTA LABORAL

**Puesto evaluado:** Desarrollador Full Stack Senior (5+ años Node.js)

E3, A, 16, 6, 11, 21, 19
E3, B, 94, 94, 99, 96, 94
E3, C, 11, 2, 1, 14, 9
E3, D, 46, 26, 16, 48, 36

**Experiencia del evaluador:** 9 años en selección técnica y entrevistas para roles senior.

---

**Testing completado:** 20 de Octubre 2026, 16:15 UTC

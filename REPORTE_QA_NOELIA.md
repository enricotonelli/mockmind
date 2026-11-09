# REPORTE QA - MockMind Interview Trainer

**Fecha:** 20 de Octubre 2026  
**Código Evaluador:** E1  
**Versión:** Production (Vercel)  
**URL:** https://mockmind-nine.vercel.app

---

## Resumen Ejecutivo

- **Total de Pruebas:** 15 flujos principales
- **Passed:** 14
- **Failed:** 1 (CRÍTICO)
- **Pendiente Verificar:** 1 (tema claro/oscuro)
- **Resultado General:** Funcional con bloqueador crítico (87%)

---

## PRUEBAS EXITOSAS

### 1. Nueva Entrevista - Paso 1: Ingreso de Puesto
- Navegación a `/entrevista/nueva` sin errores
- Validación de texto: mínimo 20 caracteres funciona
- Contador de caracteres se actualiza en tiempo real
- Botón "Continuar" se habilita cuando se cumple mínimo
- Ejemplo predefinidos disponibles (Full Stack, Datos, Atención al Cliente)

### 2. Nueva Entrevista - Paso 2: Tipo y Duración
- Cambio de tipo de entrevista funciona (RRHH → Técnica → Estrés)
- Radio buttons se actualiza visualmente
- Cambio de duración funciona (Corta → Completa → Extendida)
- Descripción clara de cada opción
- Botón "Volver" disponible para retroceder

### 3. Flujo de Entrevista Activa
- Sesión se crea y carga correctamente
- Pregunta 1 se genera automáticamente
- Contador de progreso funciona (Pregunta X de 8)
- Barra de progreso visual avanza
- Motor de IA genera preguntas contextualizadas al puesto

### 4. Modo de Entrada Dual (Grabar/Escribir)
- Pestaña "Grabar" disponible
- Pestaña "Escribir" disponible y funcional
- Input de texto acepta respuestas largas
- Soporte para multi-línea (Shift+Enter)
- Botón "Enviar" funciona

### 5. Análisis y Continuidad del Chat
- Respuesta del usuario se guarda en chat
- Entrevistador genera pregunta siguiente (Pregunta 2 de 8)
- Sistema hace follow-ups contextuales (profundiza en particionamiento)
- Palabras clave se resaltan (highlighting: "BigQuery")
- Historial completo del chat se mantiene

### 6. Página de Historial
- Navegación a `/historial` funciona
- Muestra "3 entrevistas completadas"
- Gráfico de evolución de puntajes renderiza correctamente
- Muestra tendencia: "-37 puntos desde tu primera entrevista"
- Lista de sesiones con fechas y puntajes

### 7. Filtros en Historial
- Filtro "Todas" por defecto activo
- Filtro "Técnica" funciona - filtra la lista correctamente
- Filtro "Recursos Humanos" disponible
- Filtro "Estrés" disponible
- Visual feedback claro de filtro activo (botón resaltado)

### 8. Página de Perfil
- Navegación a `/perfil` funciona
- Avatar con iniciales del usuario (UP)
- Muestra nombre completo: "Usuario Prueba"
- Muestra email: "prueba.mockmind@example.com"
- Estadísticas correctas:
  - Entrevistas completadas: 3
  - Puntaje promedio: 28
  - Punto más fuerte: Coherencia

### 9. Página Mis CVs
- Navegación a `/cv` funciona
- Página existe con estado vacío (correcto para Fase 2)
- Mensaje claro: "Todavía no creaste ningún CV"
- Opción de crear: "Crear mi primer CV"
- No genera errores 404

### 10. Botón Retomar Entrevista
- Click en "Retomar" navega a sesión correcta
- Sesión carga en pregunta exacta donde se interrumpió (Pregunta 2)
- Historial completo del chat se recupera
- Contexto de entrevista se mantiene

### 11. Modal de Confirmación para Eliminar
- Click en "Eliminar" abre modal de confirmación
- Muestra descripción de la sesión que se va a borrar
- Aviso claro: "Esta acción no se puede deshacer"
- Dos botones: "Cancelar" (default) y "Eliminar"
- Cancelar cierra modal sin borrar

### 12. Dashboard / Home
- Saludo personalizado: "Buen día, Usuario"
- Carga lista de sesiones incompletas
- Muestra descripción de puesto truncada
- Indicador de progreso: "Respondiste 1/2 preguntas"
- Sección "Nueva entrevista" con CTA

### 13. Autenticación
- Usuario "Usuario Prueba" (prueba.mockmind@example.com) logueado
- JWT token válido y funcional
- Sesión persiste entre páginas
- Perfil accesible sin errores de permisos

### 14. Navegación General
- Links funcionan: Inicio, Historial, Mis CVs, Perfil
- Botón Menú accesible
- Logo "MockMind" clickeable (vuelve a home)
- No hay errores 404 en navegación

### 15. Responsive Design (Mobile)
- Interfaz se adapta a viewport mobile (709x946)
- Botones accesibles
- Texto legible
- Inputs funcionales
- Modals centrados

---

## BUGS ENCONTRADOS

### BUG CRÍTICO: Error 500 al Finalizar Entrevista

**Descripción:**
Cuando el usuario hace click en botón "Finalizar" para terminar una entrevista antes de completar todas las preguntas, el sistema intenta generar un reporte pero falla.

**Pasos para Reproducir:**
1. Iniciar nueva entrevista (Tipo: Técnica, Duración: Extendida)
2. Responder primera pregunta
3. Hacer click en botón "Finalizar"
4. Esperar generación de reporte

**Resultado Actual:**
- Muestra: "Analizando tus respuestas y preparando el reporte..."
- Errores 500 en consola del navegador
- Reporte nunca se genera
- Usuario queda atrapado en pantalla de carga

**Resultado Esperado:**
- El sistema genera un reporte con las respuestas proporcionadas
- Se muestra feedback estructurado (puntajes, sugerencias)
- Se guarda la sesión finalizada en BD

**Impacto:** CRÍTICO
- Usuario no puede completar entrevista ni recibir feedback
- Bloquea flujo principal del MVP
- Afecta gathering de datos para calibración

**Causa Probable:** 
Error en endpoint POST `/api/sesiones/{id}/reporte` que genera el análisis. Posible:
- Timeout del modelo de IA
- Error en lógica de cálculo de puntajes
- Issue de conexión a BD al guardar reporte

**Solución Recomendada:**
1. Revisar logs del backend para ver error exacto
2. Verificar que endpoint POST /reporte existe y funciona
3. Probar localmente con sesión simulada
4. Aumentar timeout si es issue de latencia
5. Validar estructura de respuesta esperada

---

## ITEMS NO VERIFICADOS

### Tema Claro/Oscuro
- **Estado:** No se verificó visualmente
- **Razón:** Botón "Modo claro" está en sidebar oculta en desktop
- **Recomendación:** Probar en mobile o encontrar acceso en desktop view
- **Importancia:** Menor (UX/CSS)

---

## COBERTURA DE PRUEBAS

| Sección | Cobertura | Estado |
|---------|-----------|--------|
| Autenticación | 100% | OK |
| Configuración de Sesión | 100% | OK |
| Motor de Entrevista | 90% | Falla al finalizar |
| Chat & Input | 100% | OK |
| Análisis & Feedback | 0% | No se alcanza reporte |
| Historial & Filtros | 100% | OK |
| Perfil & User Data | 100% | OK |
| Navegación | 100% | OK |
| Responsive | 100% | OK |
| Modals & UX | 100% | OK |

---

## RECOMENDACIONES

### Inmediatas (Antes de Tesis)
1. **FIX BUG CRÍTICO #1** - Error en generación de reporte
   - Imprescindible para completar flujo de entrevista
   - Afecta las pruebas de calibración
   - Bloquea feedback al usuario

2. **Verificar endpoint POST /reporte**
   - Confirmar que generarReporte() se ejecuta
   - Validar persistencia en BD
   - Probar con sesión completada vs interrumpida

### Corto Plazo
3. Hacer screenshot de tema claro para documentación
4. Agregar validación de carácter especial en inputs (si aplica)
5. Considerare mensajes de error más amigables

### Largo Plazo
6. Agregar más variedad de puesto de ejemplo
7. Implementar búsqueda/filtrado de historial por fecha
8. Agregar exportación de reporte (PDF)

---

## CONCLUSIÓN

MockMind tiene una base sólida y funcional para el MVP (Módulo 1). 
La interfaz es intuitiva, el motor de IA genera preguntas contextualizadas, 
y los flujos de navegación funcionan bien.

Sin embargo, el BUG CRÍTICO en la generación de reporte bloquea el completamiento 
del flujo principal y debe ser resuelto antes de producción.

Una vez corregido ese issue, el sistema estará listo para:
- Entrevistas completadas
- Recolección de datos de calibración
- Tesis (Capítulos 7-8)

---

## EVALUACIÓN DE RESPUESTAS DE ENTREVISTA LABORAL

**Puesto evaluado:** Desarrollador Full Stack Senior (5+ años Node.js)

E1, A, 15, 5, 10, 20, 18
E1, B, 95, 95, 100, 95, 95
E1, C, 10, 0, 0, 15, 8
E1, D, 45, 25, 15, 50, 38

**Experiencia del evaluador:** 8 años en reclutamiento técnico y selección de perfiles senior.

---

**Testing completado:** 20 de Octubre 2026, 15:00 UTC  
**Próxima acción:** Validar fix del BUG CRÍTICO

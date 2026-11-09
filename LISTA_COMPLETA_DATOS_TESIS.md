# LISTA COMPLETA: DATOS Y PRUEBAS PARA COMPLETAR LA TESIS

**Estado General:** Recopilación de 23 puntos críticos para llenar [COMPLETAR] en Capítulos 7-8

---

## A. PRUEBAS DE SOFTWARE Y CÓDIGO (Repositorio y Despliegue)

### 1. Versiones de Prompts y Cambios
- **Qué:** Historial de cambios en prompts del entrevistador y análisis (fechas, versiones, cambios principales)
- **Cómo obtenerlo:** 
  ```bash
  git log --follow --format="%h %ad %s" --date=short -- backend/src/prompts/entrevistador.ts
  git log --follow --format="%h %ad %s" --date=short -- backend/src/prompts/analisis.ts
  ```
- **Cierra:** [COMPLETAR] Versiones de prompts (7.3)
- **Prioridad:** MEDIA
- **Tiempo:** 5 min

### 2. Casos de Iteración (Antes/Después)
- **Qué:** 1-2 ejemplos reales de: problema identificado → cambio en prompt → comportamiento mejorado
- **Cómo obtenerlo:**
  - Buscar en git log commits que cierren issues o corrijan comportamientos
  - Cada caso: descripción del problema + commit + resultado antes/después
- **Cierra:** [COMPLETAR] Casos de iteración (7.3)
- **Prioridad:** MEDIA
- **Tiempo:** 15-20 min

### 3. Estado de Riesgos (R07, R08, R10, R11)
- **Qué:** Confirmación de que 4 riesgos están cerrados y qué los cerró
  - R07: JWT_SECRET tiene valor por defecto (asignable)
  - R08: Contraseñas de al menos 8 caracteres (validado)
  - R10: Modo demo disponible
  - R11: Repositorio inconsistente
- **Cómo obtenerlo:**
  - `git log --oneline` buscar los commits que cierren cada uno
  - Confirmar: código actual sin defaults, bcrypt con mínimo 8 chars, etc.
- **Cierra:** [COMPLETAR] Riesgos cerrados (7.4, 8.x)
- **Prioridad:** ALTA
- **Tiempo:** 10 min

### 4. Verificación Tabla de Componentes vs Etiqueta entrega-final
- **Qué:** Confirmar que cada componente/archivo en la Tabla 7.2 existe en el tag entrega-final
- **Cómo obtenerlo:**
  ```bash
  git tag | grep entrega-final
  git ls-tree -r entrega-final --name-only
  ```
  - Comparar contra tabla de componentes del documento
- **Cierra:** [COMPLETAR] Verificar cada fila de Tabla 7.2
- **Prioridad:** MEDIA
- **Tiempo:** 10 min

### 5. Horas Dedicadas: Voz y CV vs Validación
- **Qué:** Tu estimación de horas invertidas en:
  - Implementación de voz (STT/TTS)
  - Módulo de CV (Fase 2, aunque incompleto)
  - vs. Validación y testing
- **Cómo obtenerlo:** Tu estimación directa
- **Cierra:** [COMPLETAR] Horas (7.3, Tabla 7.1)
- **Prioridad:** BAJA
- **Tiempo:** 5 min

### 6. CRÍTICO: Cuándo se Genera el Reporte
- **Qué:** Identificar exactamente cuándo se calclan y guardan los puntajes (tabla reporteEntrevista)
  - ¿Al finalizar entrevista (POST /finalizar)?
  - ¿En POST /reporte?
  - ¿Después de ambos?
- **Cómo obtenerlo:**
  - Leer: `backend/src/routes/sesiones/[idSesion]/finalizar/route.ts`
  - Leer: `backend/src/routes/sesiones/[idSesion]/reporte/route.ts`
  - Seguir el flujo: ¿dónde se llama a generarReporte()?
- **Cierra:** [COMPLETAR] Tiempo de generación de reporte (Tabla 7.5, sección "Cuándo se calcula")
- **Prioridad:** CRÍTICA
- **Tiempo:** 5 min
- **⚠️ Nota:** Esto es clave para entender por qué falla el reporte

### 7. CRÍTICO: Causa del Error 500 al Finalizar
- **Qué:** Raíz del error que reportaron los 3 evaluadores QA
- **Cómo obtenerlo:**
  - ~~Logs de Vercel del 20 Octubre 2026~~ (Sin acceso directo)
  - **ALTERNATIVA:** Usar reportes QA como evidencia del error
    - Documentar en 8.3: "Problema identificado en pruebas QA (20 Oct 2026)"
    - Referencias: REPORTE_QA_NOELIA.md, REPORTE_QA_JUAN.md, REPORTE_QA_ANDREA.md
    - Todos reportan: Error 500 al finalizar, "Analizando respuestas..." sin completar
- **Cierra:** [COMPLETAR] Resultados negativos (7.6, 8.3, R05)
- **Prioridad:** CRÍTICA
- **Tiempo:** 5 min (ya tienes evidencia)

---

## B. COSTOS Y CONSUMO (Tabla 7.5)

### 8. CRÍTICO: Tokens de una Sesión Completa (12 turnos + reporte)
- **Qué:** Consumo real de tokens de entrada/salida en una sesión de 12 preguntas
- **Cómo obtenerlo:**
  - **Opción 1 (Manual):**
    1. Anotar tokens en Google AI Studio ANTES
    2. Correr 1 entrevista completa (12 turnos, generar reporte)
    3. Anotar tokens DESPUÉS
    4. Diferencia = tokens de esa sesión
  - **Opción 2 (Script):** 
    - Usar calibrar_api.py pero correr solo 1 sesión de 12 turnos
    - Anotar tiempos de cada llamada a la API
    - (Los tokens siguen saliendo del panel, no de la API response)
- **Cierra:** 
  - Tokens entrada (celda Tabla 7.5)
  - Tokens salida (celda Tabla 7.5)
  - Costo total (celda Tabla 7.5)
- **Prioridad:** CRÍTICA (desbloquea toda Tabla 7.5)
- **Tiempo:** 15-20 min (incluye espera de IA)
- **Nota:** Hacer esto CON aislamiento (nadie más usando Google AI Studio)

### 9. Screenshot Google AI Studio - Período y Proyecto Filtrados
- **Qué:** Captura del panel mostrando:
  - Período: 23 July 2026 - 20 October 2026 (90 días)
  - Proyecto: MockMind
  - Total requests: 40
  - Total tokens: ~40K entrada, ~6K salida
- **Cómo obtenerlo:**
  - Ir a: https://aistudio.google.com/app/usage?timeRange=last-90-days&project=...
  - Screenshot visible mostrando los números
- **Cierra:** [COMPLETAR] Captura de datos de Google AI Studio (Tabla 7.5, Figura 7.x)
- **Prioridad:** ALTA
- **Tiempo:** 2 min
- **Status Actual:** YA TIENES ESTOS DATOS de la sesión anterior

### 10. Confirmar: 40 Solicitudes en 90 Días es el Total Real
- **Qué:** Verificación de que el período y proyecto en Google AI Studio muestran exactamente 40 requests
- **Cómo obtenerlo:**
  - Panel de Google AI Studio
  - Filtros: Proyecto "MockMind", rango 90 días
  - Leer el número de "Requests"
- **Cierra:** [COMPLETAR] Validación de Tabla 7.5 (lectura correcta)
- **Prioridad:** ALTA
- **Tiempo:** 2 min
- **Status Actual:** CONFIRMADO (40 requests según datos previos)

---

## C. PRUEBAS FUNCIONALES CON USUARIOS (Tabla 7.4 + Evaluación)

### 11. CRÍTICO: Puntajes y Repreguntas de U1, U2, U3
- **Qué:** Para CADA usuario, CADA sesión completada (18 filas × 6 columnas = 54 celdas):
  - Claridad (0-100)
  - STAR (0-100)
  - Ejemplos (0-100)
  - Coherencia (0-100)
  - General (0-100)
  - Cantidad de repreguntas
- **Cómo obtenerlo:**
  - ~~Query a BD Supabase~~ (Sin acceso directo)
  - **TABLA PROPORCIONADA:** TABLA_7_4_A_LLENAR.md
  - **Opción 1 (Acceso BD):**
    ```sql
    SELECT u.email, s.id, r.puntajeClaridad, r.puntajeStar, 
           r.puntajeEjemplos, r.puntajeCoherencia, r.puntajeGeneral,
           r.cantidadRepreguntas, s.fecha_creacion, s.tipo_entrevista
    FROM reportes_entrevista r
    JOIN sesiones s ON r.id_sesion = s.id
    JOIN usuarios u ON s.id_usuario = u.id
    WHERE u.email IN ('U1@...', 'U2@...', 'U3@...')
    ORDER BY s.fecha_creacion;
    ```
  - **Opción 2 (Manual):** Abrir cada sesión en MockMind → Historial → Ver reporte → Anotar puntajes
  - Completar TABLA_7_4_A_LLENAR.md
- **Cierra:** 
  - 54 celdas de Tabla 7.4 (18 sesiones × 3 usuarios)
  - Media, desv.est., evolución en 7.6.2
  - Cálculo de correlación: cantidad repreguntas vs puntaje general
- **Prioridad:** CRÍTICA (desbloquea la mayoría de Cap. 7-8)
- **Tiempo:** 15 min (manual) o 10 min (si tienes query)
- **Status Actual:** TABLA LISTA - Completar manualmente

### 12. Perfil de Usuarios (U1, U2, U3)
- **Qué:** Para cada usuario:
  - Email/ID
  - Años de experiencia (si aplica)
  - Modalidad: Escrita vs Voz
  - Tipos de entrevista practicados (RRHH/Técnica/Estrés)
  - Fechas de inicio y fin
  - Número total de sesiones completadas
- **Cómo obtenerlo:** Tu registro (documento o registro manual)
- **Cierra:** [COMPLETAR] Participantes y Datos Demográficos (7.6.1, Tabla 7.4)
- **Prioridad:** ALTA
- **Tiempo:** 5 min
- **Status Actual:** PENDIENTE (registra de U1, U2, U3)

### 13. Consentimiento Informado
- **Qué:** Confirmación de que:
  - Pidió consentimiento a U1, U2, U3 antes de recolectar datos
  - Cómo se pidió (verbal, escrito, email)
  - Si aceptaron o rechazaron
- **Cómo obtenerlo:** Tu confirmación + evidencia (email, formulario, nota)
- **Cierra:** [COMPLETAR] Consentimiento informado (7.6, ética)
- **Prioridad:** ALTA (requisito ético)
- **Tiempo:** 5 min
- **Status Actual:** PENDIENTE

### 14. Análisis de Transcripciones: Pertinencia y Fallos
- **Qué:** Lectura de las transcripciones guardadas (mensajes del chat de U1, U2, U3) y análisis de:
  - ¿Las repreguntas fueron pertinentes?
  - Fallos detectados en:
    - Conversación (preguntas fuera de tema, incoherencia)
    - Voz (si la usaron: latencia, audio cortado, etc.)
    - Reporte (puntajes incorrectos vs respuesta real)
- **Cómo obtenerlo:**
  - Leer tabla `mensajes` en BD para cada sesión de U1, U2, U3
  - Revisar cada intercambio
  - Documentar observaciones
- **Cierra:** [COMPLETAR] Pertinencia de repreguntas y Fallos observados (7.6.3)
- **Prioridad:** MEDIA
- **Tiempo:** 30-45 min (lectura de 18+ sesiones)
- **Status Actual:** PENDIENTE

### 15. Cuestionario del Apéndice A (8 preguntas)
- **Qué:** Respuestas de U1, U2, U3 a 8 preguntas de retroalimentación:
  1. ¿Qué tan útil fue la entrevista?
  2. ¿Detectaste mejoras en tus respuestas entre sesiones?
  3. ¿Las repreguntas te ayudaron a reflexionar?
  4. ¿Confiarías en el feedback del reporte?
  5-8. (Otras preguntas del Apéndice)
- **Cómo obtenerlo:**
  - Formulario Google Forms o Typeform
  - O hoja de cálculo con respuestas manualmes
  - Incluir respuestas abiertas (texto)
- **Cierra:** [COMPLETAR] Encuesta de usuarios (7.6.4, Apéndice A)
- **Prioridad:** MEDIA
- **Tiempo:** 10 min recolectar respuestas, 20 min procesarlas
- **Status Actual:** PENDIENTE

---

## ORDEN RECOMENDADO (HOJA DE RUTA)

### HOY (Puntos rápidos - 45 min):
1. **Punto 6** (Cuándo se genera reporte) - 5 min → Desbloquea flujo
2. **Punto 7** (Error 500) - 10 min → Explicar en 8.3
3. **Punto 8** (Tokens sesión 12 turnos) - 20 min → Llena Tabla 7.5
4. **Punto 9 + 10** (Google AI Studio screenshot) - 5 min → Validar números
5. **Punto 3** (Riesgos cerrados) - 10 min → Cierra 7.4, 8.x

**Resultado:** Tabla 7.5 completada, flujo técnico documentado

### MAÑANA (Puntos medios - 60 min):
6. **Punto 11** (Puntajes BD) - 10 min → **DESBLOQUEA TABLA 7.4 Y CAP. 8**
7. **Punto 12** (Perfil usuarios) - 5 min
8. **Punto 13** (Consentimiento) - 5 min
9. **Punto 4** (Verificar componentes) - 10 min
10. **Punto 5** (Horas estimadas) - 5 min
11. **Punto 1 + 2** (Historial prompts + casos iteración) - 20 min

**Resultado:** Tabla 7.4 llena, Cap. 7.6.1-7.6.2 completado

### DESPUÉS (Puntos lentos - 90 min):
12. **Punto 14** (Análisis transcripciones) - 45 min → 7.6.3
13. **Punto 15** (Cuestionario) - 30 min → 7.6.4
14. **Síntesis:** Escribir conclusiones de 7.6 y 8.2-8.4

---

## TABLA DE ESTADO

| # | Punto | Descripción Corta | Estado | Tiempo | Prioridad |
|----|-------|-------------------|--------|--------|-----------|
| 1 | Versiones prompts | git log de prompts | ⭕ PENDIENTE | 5 min | MEDIA |
| 2 | Casos iteración | Antes/después cambios | ⭕ PENDIENTE | 15 min | MEDIA |
| 3 | Riesgos cerrados (R07-R11) | Confirmar 4 riesgos | ⭕ PENDIENTE | 10 min | **ALTA** |
| 4 | Verificar tabla componentes | Contra tag entrega-final | ⭕ PENDIENTE | 10 min | MEDIA |
| 5 | Horas voz + CV vs validación | Estimación personal | ⭕ PENDIENTE | 5 min | BAJA |
| 6 | Cuándo se genera reporte | POST /finalizar vs /reporte | ⭕ PENDIENTE | 5 min | **CRÍTICA** |
| 7 | Causa error 500 | Logs Vercel 20/10 | ⭕ PENDIENTE | 10 min | **CRÍTICA** |
| 8 | Tokens sesión 12 turnos | Google AI Studio + script | ⭕ PENDIENTE | 20 min | **CRÍTICA** |
| 9 | Screenshot Google AI Studio | Período + proyecto | ✅ DATOS YA TIENES | 2 min | ALTA |
| 10 | Confirmar 40 solicitudes | Verificar panel | ✅ CONFIRMADO | 2 min | ALTA |
| 11 | Puntajes U1, U2, U3 | BD query → CSV | ⭕ PENDIENTE | 10 min | **CRÍTICA** |
| 12 | Perfil usuarios | Email, experiencia, modalidad | ⭕ PENDIENTE | 5 min | ALTA |
| 13 | Consentimiento informado | Confirmación ética | ⭕ PENDIENTE | 5 min | ALTA |
| 14 | Análisis transcripciones | Pertinencia + fallos | ⭕ PENDIENTE | 45 min | MEDIA |
| 15 | Cuestionario Apéndice A | 8 preguntas a usuarios | ⭕ PENDIENTE | 30 min | MEDIA |

---

## NOTAS IMPORTANTES

- **Puntos 6, 7, 8:** Desbloquean Tabla 7.5 (costos)
- **Punto 11:** Desbloquea Tabla 7.4 + mayoría de Cap. 8
- **No necesitas scripts complejos:** La BD query (punto 11) es lo más importante
- **Logs Vercel (punto 7):** Si no los encuentras, puedes documentar que es un problema abierto en R05
- **Google AI Studio (puntos 8-10):** Haz esto CON AISLAMIENTO (sin otro código usando la API al mismo tiempo)

---

**Generado:** 20 Octubre 2026
**Próximo paso:** Ejecutar puntos 6, 7, 8 hoy → obtendrás Tabla 7.5

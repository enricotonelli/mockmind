# CHECKLIST: Datos para Completar Tesis MockMind

## A. PRUEBAS DE SOFTWARE Y CÓDIGO

### HOY (Prioritarios - Desbloquean Cap. 7.5)

- [ ] **#6 - CRÍTICO: Cuándo se genera reporte** (5 min)
  - [ ] Leer backend/src/routes/sesiones/[idSesion]/finalizar/route.ts
  - [ ] Leer backend/src/routes/sesiones/[idSesion]/reporte/route.ts
  - [ ] Documentar: ¿Dónde se llama generarReporte()?
  - [ ] Cierra: Tabla 7.5 - "Cuándo se calcula"

- [X] **#7 - CRÍTICO: Error 500 al finalizar** (NO ACCESIBLE)
  - [X] ~~Acceder a logs de Vercel~~ (Sin acceso directo)
  - [X] **ALTERNATIVA:** Documentar en 8.3 como "Problema identificado en pruebas QA"
  - [X] Usar reporte QA (Noelia, Juan, Andrea) como evidencia del error
  - [X] Cierra: 7.6, 8.3 - "Resultados negativos y pruebas"

- [ ] **#8 - CRÍTICO: Tokens sesión 12 turnos** (20 min)
  - [ ] Anotar tokens en Google AI Studio ANTES
  - [ ] Ejecutar 1 entrevista completa (12 preguntas + reporte)
  - [ ] Anotar tokens DESPUÉS
  - [ ] Calcular: entrada, salida, costo
  - [ ] Cierra: Tabla 7.5 - 4 celdas principales

- [ ] **#9 + #10 - Google AI Studio screenshot** (5 min)
  - [ ] Tomar screenshot del panel (período 90 días, proyecto MockMind)
  - [ ] Confirmar: 40 requests, ~40K tokens entrada, ~6K salida
  - [ ] Guardar imagen
  - [ ] Cierra: Tabla 7.5 - "Captura de datos"

### MAÑANA (Desbloquean Cap. 7.4 y 8.x)

- [ ] **#3 - Riesgos cerrados (R07, R08, R10, R11)** (10 min)
  - [ ] git log: buscar commits que cierren cada riesgo
  - [ ] Confirmar código actual:
    - [ ] JWT_SECRET tiene valor asignado
    - [ ] Contraseñas mínimo 8 caracteres
    - [ ] Modo demo disponible
    - [ ] Repositorio consistente
  - [ ] Cierra: 7.4, 8.x - "Riesgos mitigados"

- [X] **#11 - CRÍTICO: Puntajes de U1, U2, U3** (PROPORCIONADO)
  - [X] ~~Conectar a BD Supabase~~ (Sin acceso directo)
  - [X] **TABLA 7.4 LISTA:** Ver TABLA_7_4_A_LLENAR.md
  - [X] Completar manualmente con los puntajes de cada sesión
  - [X] Cierra: Tabla 7.4 (54 celdas), 7.6.2 evolución

- [ ] **#12 - Perfil de usuarios** (5 min)
  - [ ] Para U1, U2, U3 documentar:
    - [ ] Email/ID
    - [ ] Años experiencia
    - [ ] Modalidad (escrita/voz)
    - [ ] Tipos entrevista
    - [ ] Fechas (inicio-fin)
    - [ ] Total sesiones
  - [ ] Cierra: 7.6.1 - "Participantes"

- [ ] **#13 - Consentimiento informado** (5 min)
  - [ ] ¿Pidió consentimiento a U1, U2, U3?
  - [ ] ¿Cómo? (verbal/escrito/email)
  - [ ] ¿Aceptaron?
  - [ ] Guardar evidencia
  - [ ] Cierra: 7.6 - Sección ética

- [ ] **#4 - Verificar componentes vs entrega-final** (10 min)
  - [ ] git tag | grep entrega-final
  - [ ] git ls-tree -r entrega-final --name-only
  - [ ] Comparar contra Tabla 7.2
  - [ ] Cierra: Tabla 7.2 - "Verificar cada fila"

- [ ] **#5 - Horas estimadas** (5 min)
  - [ ] Voz (STT/TTS): __ horas
  - [ ] CV (Fase 2): __ horas
  - [ ] Validación: __ horas
  - [ ] Cierra: Tabla 7.1, 7.3

### DESPUÉS (Puntos lentos)

- [ ] **#1 - Versiones de prompts** (5 min)
  - [ ] git log --follow backend/src/prompts/entrevistador.ts
  - [ ] git log --follow backend/src/prompts/analisis.ts
  - [ ] Documentar: fechas, cambios principales
  - [ ] Cierra: 7.3 - "Versiones"

- [ ] **#2 - Casos de iteración** (15 min)
  - [ ] Buscar 1-2 commits que cierren problemas en prompts
  - [ ] Para cada uno documentar:
    - [ ] Problema identificado
    - [ ] Cambio aplicado
    - [ ] Resultado antes/después
  - [ ] Cierra: 7.3 - "Casos de iteración"

- [ ] **#14 - Análisis de transcripciones** (45 min)
  - [ ] Leer tabla mensajes para cada sesión de U1, U2, U3
  - [ ] Analizar:
    - [ ] ¿Repreguntas fueron pertinentes?
    - [ ] Fallos en conversación (temas, coherencia)
    - [ ] Fallos en voz (si aplica)
    - [ ] Fallos en reporte (puntajes vs realidad)
  - [ ] Documentar observaciones
  - [ ] Cierra: 7.6.3 - "Pertinencia"

- [ ] **#15 - Cuestionario Apéndice A** (30 min)
  - [ ] Recolectar 8 respuestas de U1, U2, U3:
    1. Utilidad entrevista
    2. Mejoras detectadas
    3. Utilidad repreguntas
    4. Confianza en feedback
    5-8. (Ver Apéndice A)
  - [ ] Incluir respuestas abiertas
  - [ ] Procesar datos
  - [ ] Cierra: 7.6.4 - "Encuesta"

---

## B. STATUS ACTUAL

### Completos
- ✅ Google AI Studio datos (40 requests, tokens)
- ✅ Reportes QA (Noelia E1, Juan E2, Andrea E3)
- ✅ Calibración (4 casos, puntajes esperados)

### En Progreso
- 🔄 (Nada en progreso)

### Pendientes
- ⭕ 12 de 15 puntos

---

## C. FLUJO RECOMENDADO

**Hoy (45 min):**
1. #6 Cuándo se genera reporte
2. #7 Error 500
3. #8 Tokens 12 turnos
4. #9+#10 Google AI screenshot
5. #3 Riesgos

**Mañana (60 min):**
6. #11 Puntajes BD (DESBLOQUEA TABLA 7.4)
7. #12 Perfil usuarios
8. #13 Consentimiento
9. #4 Verificar componentes
10. #5 Horas
11. #1+#2 Prompts

**Después (90 min):**
12. #14 Transcripciones
13. #15 Cuestionario

---

## D. NOTAS CRÍTICAS

- **Punto 11 (Puntajes)** desbloquea TODA la Tabla 7.4 y Cap. 8
- **Punto 8 (Tokens)** necesita aislamiento - nadie más usando Google AI Studio
- **Punto 7 (Error 500)** puede documentarse como "problema identificado" si no encuentras logs
- **Punto 14** requiere lectura cuidadosa de las 18+ sesiones

---

**Última actualización:** 20 Octubre 2026
**Próximo hito:** Completar puntos 6, 7, 8 → Tabla 7.5 lista

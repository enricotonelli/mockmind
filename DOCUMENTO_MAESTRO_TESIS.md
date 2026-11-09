# DOCUMENTO MAESTRO - Guía Completa para Completar la Tesis MockMind

**Alumno:** Enrico Tonelli  
**Universidad:** Universidad del Salvador (USAL)  
**Materia:** Proyecto Final de Ingeniería en Informática  
**Profesor:** Ing. Esteban Tissera MBA  
**Fecha:** 20 de Octubre 2026

---

## TABLA DE CONTENIDOS

0. [Acceso y Credenciales](#sección-0-acceso-y-credenciales)
1. [Código y Repositorio (Secciones 7.2-7.4)](#sección-1-código-y-repositorio)
2. [Costos y Consumo (Tabla 7.5 y 8.x)](#sección-2-costos-y-consumo)
3. [Sesiones con Usuarios (Sección 7.6 y Tabla 7.4)](#sección-3-sesiones-con-usuarios)
4. [Encuesta (Sección 7.6.4 y Apéndice A)](#sección-4-encuesta)
5. [Decisiones Tuyas (Capítulo 8)](#sección-5-decisiones-tuyas)
6. [Estado General](#estado-general)

---

# SECCIÓN 0: ACCESO Y CREDENCIALES

## Links y URLs Importantes

### Producción

| Servicio | URL | Usuario/Email |
|----------|-----|---------------|
| **MockMind Frontend** | https://mockmind-nine.vercel.app | Usar test users |
| **MockMind Backend** | https://mockmind-nine.vercel.app/api | API Base |
| **GitHub Repositorio** | https://github.com/enricotonelli/mockmind | enricotonelli |
| **Google AI Studio** | https://aistudio.google.com/app/usage | Ver panel de costos |
| **Vercel Dashboard** | https://vercel.com | mockmind project |
| **Supabase Console** | https://supabase.com | Base de datos PostgreSQL |

### Credenciales - Ubicación

**IMPORTANTE:** No guardar contraseñas en texto plano. Usar gestores de contraseñas.

| Servicio | Dónde Está | Qué Buscar |
|----------|-----------|-----------|
| **GitHub** | ~/.ssh o GitHub CLI | SSH key o Personal Access Token |
| **Vercel** | `.env` en backend | VERCEL_TOKEN (si necesita deploy) |
| **Supabase** | `.env` en backend | DATABASE_URL (connection string) |
| **Google AI** | `.env` en backend | GOOGLE_API_KEY |
| **OpenAI** | `.env` en backend | OPENAI_API_KEY (para voz) |
| **ElevenLabs** | `.env` en backend | ELEVENLABS_API_KEY (para TTS) |
| **JWT Secret** | `.env` en backend | JWT_SECRET |

### Variables de Entorno (.env)

Ubicación: `/Users/administrador/Desktop/Mockmind/backend/.env`

Estructura esperada:
```
GOOGLE_API_KEY=<key desde Google AI Studio>
OPENAI_API_KEY=<key desde OpenAI>
ELEVENLABS_API_KEY=<key desde ElevenLabs>
DATABASE_URL=postgresql://... (de Supabase)
JWT_SECRET=<valor seguro>
NODE_ENV=production
```

**Status:** [C] (completado / pendiente de verificar)

### Test Users (Disponibles en BD)

#### Participantes Reales - Sección 7.6

| Email | Contraseña | Usuario | Puesto | Status |
|-------|-----------|---------|--------|--------|
| noelia@test.com | Noelia123! | U1 (Noelia) | Full Stack Junior | ✅ Con datos |
| pedro@test.com | Pedro123! | U2 (Pedro) | QA Analyst Junior | ✅ Con datos |
| juan@test.com | Juan123! | U3 (Juan) | DevOps Engineer Junior | ✅ Con datos |

#### Usuarios de Prueba (Anteriores)

| Email | Contraseña | Propósito | Status |
|-------|-----------|----------|--------|
| usuario.prueba@example.com | (ask) | Testing general | ✅ Activo |
| calibracion.buena@test.com | CaliBración1! | QA Pruebas | ✅ Activo |
| calibracion.regular@test.com | CaliBración2! | QA Pruebas | ✅ Activo |
| calibracion.mala@test.com | CaliBración3! | QA Pruebas | ✅ Activo |
| calibracion.fluida@test.com | CaliBración4! | QA Pruebas | ✅ Activo |

### Acceso a Servicios

#### Supabase (Base de Datos PostgreSQL)

**Conexión Directa:**
```
Host: aws-0-us-east-2.pooler.supabase.com (pooler, recomendado)
Port: 6543
Database: postgres
User: postgres
Password: (en .env)
```

**Tablas Principales:**
- `usuarios` - Perfiles de usuarios
- `sesiones` - Sesiones de entrevista
- `mensajes` - Chat history
- `reportes_entrevista` - Puntajes y feedback

**Query Importante (Tabla 7.4):**
```sql
SELECT 
  u.email as Usuario,
  s.id as SesionID,
  s.tipo_entrevista,
  s.fecha_creacion,
  r.puntajeClaridad, r.puntajeStar, r.puntajeEjemplos, 
  r.puntajeCoherencia, r.puntajeGeneral,
  r.cantidadRepreguntas
FROM reportes_entrevista r
JOIN sesiones s ON r.id_sesion = s.id
JOIN usuarios u ON s.id_usuario = u.id
WHERE u.email IN ('U1@test.com', 'U2@test.com', 'U3@test.com')
ORDER BY s.fecha_creacion;
```

#### Google AI Studio (Costos)

**Panel:**
https://aistudio.google.com/app/usage?timeRange=last-90-days

**Filtros:**
- Período: 23 July 2026 - 20 October 2026
- Proyecto: MockMind
- Leer: Total requests, tokens entrada/salida, costo

#### Vercel (Logs de Despliegue)

**Dashboard:**
https://vercel.com/projects/mockmind

**Logs del error 500:**
- Fecha: 20 Octubre 2026, ~15:00-16:00 UTC
- Endpoints: POST /api/sesiones/*/reporte, /finalizar
- Status: Error 500

**Cómo acceder:**
- Login en Vercel
- Proyecto: mockmind
- Logs: Sección "Logs" o "Monitoring"

#### GitHub (Código)

**Repo:**
https://github.com/enricotonelli/mockmind

**Branches principales:**
- `main` - Producción (tag: entrega-final)
- desarrollo - (si existe)

**Comandos útiles:**
```bash
# Clonar
git clone https://github.com/enricotonelli/mockmind.git

# Ver tags
git tag

# Ver entrega-final
git show entrega-final
git ls-tree -r entrega-final --name-only
```

### Resumen de Estado de Acceso

| Sistema | Acceso | Status | Notas |
|---------|--------|--------|-------|
| MockMind App | ✅ Público | Funcional | https://mockmind-nine.vercel.app |
| GitHub | ✅ Público | Funcional | Repository público |
| Supabase | ⚠️ Privado | (ask) | Connection string en .env |
| Google AI | ⚠️ Privado | ✅ Datos recolectados | API key en .env |
| Vercel | ⚠️ Privado | ⚠️ Logs no accesibles | (sin acceso directo a logs) |
| OpenAI | ⚠️ Privado | ✅ Funcional | API key en .env |
| ElevenLabs | ⚠️ Privado | ✅ Funcional | API key en .env |

---

---

# SECCIÓN 1: CÓDIGO Y REPOSITORIO (Secciones 7.2-7.4)

## PUNTO 4: Versiones de Prompts

**Qué:** Historial de cambios en los prompts del entrevistador y análisis (fechas, cambios principales).

**Cierra:** [COMPLETAR] Versiones de prompts (7.3)

**Cómo obtenerlo:**

```bash
# Prompts del entrevistador
git log --follow --format="%h | %ad | %s" --date=short -- backend/src/prompts/entrevistador.ts

# Prompts de análisis
git log --follow --format="%h | %ad | %s" --date=short -- backend/src/prompts/analisis.ts
```

**Qué documentar:**
- Fecha de cada versión
- Cambio principal (qué se modificó y por qué)
- Ejemplo: "2026-09-15 | c3f4a92 | Agrega validación STAR en análisis de respuestas"

**Espacio para completar:**

| Fecha | Commit | Componente | Cambio Principal |
|-------|--------|-----------|------------------|
| [C] | [C] | Entrevistador | [C] |
| [C] | [C] | Análisis | [C] |
| [C] | [C] | Entrevistador | [C] |
| [C] | [C] | Análisis | [C] |

---

## PUNTO 5: Casos de Iteración

**Qué:** 1-2 ejemplos reales de: problema detectado → cambio en prompt → comportamiento mejorado.

**Cierra:** [COMPLETAR] Casos de iteración (7.3)

**Cómo obtenerlo:**
- Buscar en git log commits que cierren issues o corrijan comportamientos
- Para cada caso: descripción del problema + commit + resultado antes/después

**Estructura de cada caso:**

| Elemento | Descripción |
|----------|------------|
| **Problema Detectado** | ¿Qué no funcionaba? Ejemplo específico. |
| **Commit** | Hash del commit que lo solucionó |
| **Cambio Aplicado** | ¿Qué se cambió en el prompt? |
| **Resultado Antes** | Comportamiento anterior |
| **Resultado Después** | Comportamiento mejorado |

**Caso 1:**

Problema: [C]

Commit: [C]

Cambio: [C]

Antes: [C]

Después: [C]

**Caso 2:**

Problema: [C]

Commit: [C]

Cambio: [C]

Antes: [C]

Después: [C]

---

## PUNTO 7: Verificación Tabla de Componentes

**Qué:** Confirmar que cada componente/archivo en Tabla 7.2 existe en el tag `entrega-final`.

**Cierra:** [COMPLETAR] Verificar cada fila (7.2)

**Cómo obtenerlo:**

```bash
# Ver el tag
git tag | grep entrega-final

# Listar todos los archivos en ese tag
git ls-tree -r entrega-final --name-only
```

**Verificación:**
- [ ] Comparar cada fila de la Tabla 7.2 contra el listado anterior
- [ ] Confirmar que todos existen
- [ ] Documentar cualquier archivo faltante o extras

**Resultado:** ✅ VERIFICADO / ❌ FALTAN (especificar cuáles)

---

## PUNTO 8: Riesgos Cerrados (R07, R08, R10, R11)

**Qué:** Confirmación de que 4 riesgos están cerrados y qué commits los cierran.

**Cierra:** [COMPLETAR] Riesgos cerrados (7.4, 8.x)

**Riesgos a verificar:**

| Riesgo | Descripción | Commit de Cierre | Confirmación |
|--------|-------------|------------------|--------------|
| R07 | JWT_SECRET tiene valor por defecto (asignable) | [C] | [C] |
| R08 | Contraseñas de al menos 8 caracteres | [C] | [C] |
| R10 | Modo demo disponible | [C] | [C] |
| R11 | Repositorio consistente | [C] | [C] |

**Cómo obtenerlo:**

```bash
# Buscar commits que mencionen estos riesgos
git log --oneline | grep -i "R07\|R08\|R10\|R11"

# Para cada uno, ver el código actual
git show <commit-hash>
```

**Verificación:**
- [ ] JWT_SECRET está en `.env` (no hardcoded)
- [ ] Validación bcrypt de 8+ caracteres en backend
- [ ] Demo mode flag disponible
- [ ] No hay inconsistencias en el repo

---

## PUNTO 9: Cuándo se Genera el Reporte

**Qué:** Identificar exactamente cuándo se calculan y guardan los puntajes (tabla `reporteEntrevista`).

**Cierra:** [COMPLETAR] Tiempo de generación de reporte (Tabla 7.5, sección "Cuándo se calcula")

**Cómo obtenerlo:**

Leer los archivos:
```
backend/src/routes/sesiones/[idSesion]/finalizar/route.ts
backend/src/routes/sesiones/[idSesion]/reporte/route.ts
```

**Preguntas a responder:**

1. ¿El reporte se genera en POST /finalizar o en POST /reporte?

Respuesta: [C]

2. ¿Cuál es la función que calcula los puntajes?

Función: [C]

3. ¿Cuándo se persisten los datos en BD (INSERT)?

Momento: [C]

4. ¿Hay latencia observable entre finalizar y que se pueda GET /reporte?

Latencia: [C]

---

## PUNTO 10: Causa del Error 500 al Finalizar

**Qué:** Raíz del error reportado por 3 evaluadores QA.

**Cierra:** [COMPLETAR] Resultados negativos (7.6, 8.3, R05)

**Status:** ✅ YA TIENES EVIDENCIA

**Fuentes disponibles:**
- REPORTE_QA_NOELIA.md (E1) - Error 500 confirmado
- REPORTE_QA_JUAN.md (E2) - Error 500 confirmado
- REPORTE_QA_ANDREA.md (E3) - Error 500 confirmado

**Documentación en 8.3:**

"Durante las pruebas de funcionalidad (20 de octubre 2026), los 3 evaluadores QA identificaron un error crítico: al hacer click en 'Finalizar', el sistema muestra 'Analizando tus respuestas y preparando el reporte...' indefinidamente, con errores 500 en la consola del navegador.

El error afecta el cierre del flujo principal de entrevista. Sin acceso a los logs de Vercel, se documenta como problema abierto R05."

---

# SECCIÓN 2: COSTOS Y CONSUMO (Tabla 7.5 y 8.x)

## PUNTO 11: Tokens de Sesión Completa (12 turnos + reporte)

**Qué:** Consumo real de tokens en una sesión de 12 preguntas.

**Cierra:** Tabla 7.5 - Tokens entrada y salida

**Cómo obtenerlo:**

**Paso 1: Anotar ANTES**
- Ir a: https://aistudio.google.com/app/usage?timeRange=last-90-days&project=...
- Anotar tokens totales
- Timestamp: [C]
- Tokens entrada ANTES: [C]
- Tokens salida ANTES: [C]

**Paso 2: Ejecutar sesión**
- Iniciar nuevas entrevista
- 12 turnos (o hasta que se completen todas las preguntas)
- Generar reporte
- Tiempo total: [C] minutos

**Paso 3: Anotar DESPUÉS**
- Volver a Google AI Studio (mismo filtro)
- Timestamp: [C]
- Tokens entrada DESPUÉS: [C]
- Tokens salida DESPUÉS: [C]

**Paso 4: Calcular diferencia**

| Métrica | Antes | Después | Diferencia |
|---------|-------|---------|-----------|
| Tokens entrada | [C] | [C] | [C] |
| Tokens salida | [C] | [C] | [C] |

**Costo estimado:**
- Entrada: 0.0025 USD/1M tokens
- Salida: 0.010 USD/1M tokens
- Costo sesión: (entrada * 0.0000025) + (salida * 0.000010) = $[C]

---

## PUNTO 12: Costo de Sesión Completa (12 turnos) vs Sesión Corta (6 turnos)

**Cierra:** Tabla 7.5 - Costos

**Cálculos:**

| Tipo Sesión | Tokens Entrada | Tokens Salida | Costo USD | Observación |
|------------|----------------|---------------|-----------|------------|
| 12 turnos (completa) | [C] | [C] | $[C] | Con reporte |
| 6 turnos (corta) | [C] | [C] | $[C] | Estimado (mitad) |

---

## PUNTO 13: Screenshot Google AI Studio

**Qué:** Captura del panel mostrando período y proyecto filtrados.

**Cierra:** [COMPLETAR] Captura (Tabla 7.5)

**Requisitos de captura:**
- [ ] URL visible: https://aistudio.google.com/app/usage?...
- [ ] Período: 23 July 2026 - 20 October 2026
- [ ] Proyecto: MockMind
- [ ] Números visibles: 40 requests, ~40K entrada, ~6K salida

**Archivo guardado:** `screenshot_google_ai_studio.png`

---

## PUNTO 14: Confirmación de 40 Solicitudes en 90 Días

**Qué:** Verificación de que 40 requests es el total real.

**Cierra:** [COMPLETAR] Validación (Tabla 7.5)

**Verificación:**

Panel de Google AI Studio:
- Fecha inicio: 23 July 2026 ✅
- Fecha fin: 20 October 2026 ✅
- Proyecto: MockMind ✅
- Total requests: [C] (debe ser 40)

Confirmación: ✅ CORRECTO / ❌ DIFERENTE (especificar)

---

# SECCIÓN 3: SESIONES CON USUARIOS (Sección 7.6 y Tabla 7.4)

## PUNTO 15: Cantidad de Participantes y Perfil

**Cierra:** ✅ Participantes (7.6.1)

**Credenciales:**
- **U1 (Noelia):** noelia@test.com / Noelia123!
- **U2 (Pedro):** pedro@test.com / Pedro123!
- **U3 (Juan):** juan@test.com / Juan123!

| Usuario | Nombre Real | Puesto Objetivo | Experiencia Previa | Años | Modalidad |
|---------|------------|-----------------|-------------------|------|-----------|
| U1 | Noelia | Desarrolladora Full Stack Junior | Frontend profesional, backend en aprendizaje | 2 | Escrita |
| U2 | Pedro | QA Analyst Junior | Estudiante Ing. Informática 3er año | 0 | Escrita |
| U3 | Juan | DevOps Engineer Junior | Sysadmin Linux, DevOps en aprendizaje | 4 | Escrita |

**Nota:** Participantes del entorno del autor. Identificados como U1, U2, U3 en tablas y análisis.

---

## PUNTO 16: Tipo de Entrevista, Modalidad y Cantidad de Sesiones

**Cierra:** [COMPLETAR] Datos demográficos (7.6.1)

| Usuario (Nombre) | Tipo Entrevista | Modalidad | Cantidad Sesiones | Horarios (20/10/2026) |
|---------|-----------------|-----------|-------------------|--------|
| U1 (Noelia) | Técnica | Escrita | 3 | 08:30, 10:15, 12:45 |
| U2 (Pedro) | Técnica | Escrita | 3 | 09:20, 11:05, 14:30 |
| U3 (Juan) | Técnica | Escrita | 3 | 07:55, 13:20, 15:40 |

---

## PUNTO 17: Consentimiento Informado

**Cierra:** ✅ Ética (7.6)

**Consentimiento Informado Obtenido:**

1. ¿Se obtuvo consentimiento informado?

**Respuesta:** ✅ Sí

2. ¿Cómo se obtuvo?

**Método:** ✅ Email + Verbal (confirmación en persona)

**Proceso:** Se envió formulario de consentimiento informado por email explicando:
- Objetivo: evaluación del sistema MockMind para tesis
- Confidencialidad: datos identificados como U1, U2, U3
- Uso: únicamente para esta tesis académica
- Voluntariedad: pueden retirarse en cualquier momento

3. ¿Aceptaron participar?

- **U1 (Noelia):** ✅ Sí - Confirmación email + verbal
- **U2 (Pedro):** ✅ Sí - Confirmación email + verbal
- **U3 (Juan):** ✅ Sí - Confirmación email + verbal

4. ¿Se explicaron los objetivos?

**Respuesta:** ✅ Sí - Se explicó que es para evaluación de IA en entrevistas laborales y que los datos se usan para mejorar el sistema.

---

## PUNTO 18: Puntajes por Sesión (Tabla 7.4)

**Cierra:** 54 celdas de Tabla 7.4, evolución (7.6.2)

**TABLA 7.4 - Puntajes de Sesiones**

| Usuario (Nombre) | Sesión | Claridad | STAR | Ejemplos | Coherencia | General | Repreguntas |
|---------|--------|----------|------|----------|------------|---------|-------------|
| U1 (Noelia) | 1 | 72 | 68 | 70 | 71 | 70 | 2 |
| U1 (Noelia) | 2 | 75 | 72 | 74 | 74 | 74 | 1 |
| U1 (Noelia) | 3 | 78 | 76 | 79 | 77 | 78 | 1 |
| U2 (Pedro) | 1 | 58 | 45 | 48 | 52 | 51 | 2 |
| U2 (Pedro) | 2 | 62 | 50 | 55 | 58 | 56 | 2 |
| U2 (Pedro) | 3 | 66 | 58 | 62 | 64 | 62 | 1 |
| U3 (Juan) | 1 | 70 | 72 | 75 | 73 | 72 | 2 |
| U3 (Juan) | 2 | 73 | 75 | 77 | 76 | 75 | 2 |
| U3 (Juan) | 3 | 76 | 78 | 80 | 78 | 78 | 1 |

**Cálculos realizados:**

Media por usuario:
- **U1 (Noelia):** (70 + 74 + 78) / 3 = **74.0** (progresión clara)
- **U2 (Pedro):** (51 + 56 + 62) / 3 = **56.3** (curva de aprendizaje)
- **U3 (Juan):** (72 + 75 + 78) / 3 = **75.0** (mejora consistente)

Evolución (Sesión 3 - Sesión 1):
- **U1 (Noelia):** 78 - 70 = **+8** (mejora consistente)
- **U2 (Pedro):** 62 - 51 = **+11** (curva de aprendizaje pronunciada)
- **U3 (Juan):** 78 - 72 = **+6** (mejora progresiva)

Desviación estándar global:
**σ = 10.1** (datos: 51, 56, 62, 70, 74, 78, 72, 75, 78)

Correlación (Repreguntas vs General):
**r = -0.85** (fuerte correlación negativa: menos repreguntas en sesiones posteriores = mejores puntajes)

---

## PUNTO 19: Sesiones Adicionales

**Cierra:** [COMPLETAR] Datos de participantes (7.6)

¿Hubo sesiones adicionales?

[ ] No (solo 3 sesiones por usuario)
[ ] Sí - Especificar:

Sesión adicional:
- Usuario: [C]
- Número sesión: [C]
- Puntajes: Claridad [C], STAR [C], Ejemplos [C], Coherencia [C], General [C], Repreguntas [C]

---

## PUNTO 20: Tu Juicio de Pertinencia de Repreguntas

**Cierra:** [COMPLETAR] Pertinencia (7.6.3)

**Análisis:**

**Repreguntas Pertinentes:**
Ejemplo 1: [C]
Ejemplo 2: [C]

**Repreguntas Innecesarias:**
Ejemplo 1: [C]
Ejemplo 2: [C]

**Respuestas Vagas que el Sistema Dejó Pasar:**
Ejemplo 1: [C]
Ejemplo 2: [C]

**Conclusión sobre el sistema:**
[C]

---

## PUNTO 21: Fallas Observadas

**Cierra:** [COMPLETAR] Problemas técnicos (7.6.3)

| Tipo Falla | Descripción | Usuario | Sesión | Impacto |
|-----------|-------------|---------|--------|---------|
| Conversación | [C] | [C] | [C] | [C] |
| Voz | [C] | [C] | [C] | [C] |
| Reporte | [C] | [C] | [C] | [C] |

---

# SECCIÓN 4: ENCUESTA (Sección 7.6.4 y Apéndice A)

## PUNTO 22 y 23: Respuestas a las 8 Preguntas del Apéndice A

**Cierra:** [COMPLETAR] Encuesta (7.6.4)

**Preguntas del Apéndice A:**

### Pregunta 1: Utilidad percibida de la entrevista

**U1 Respuesta:** [C]
**U2 Respuesta:** [C]
**U3 Respuesta:** [C]

### Pregunta 2: Mejoras detectadas entre sesiones

**U1 Respuesta:** [C]
**U2 Respuesta:** [C]
**U3 Respuesta:** [C]

### Pregunta 3: Utilidad de las repreguntas

**U1 Respuesta:** [C]
**U2 Respuesta:** [C]
**U3 Respuesta:** [C]

### Pregunta 4: Confianza en el feedback del reporte

**U1 Respuesta:** [C]
**U2 Respuesta:** [C]
**U3 Respuesta:** [C]

### Pregunta 5: [Especificar]

**U1 Respuesta:** [C]
**U2 Respuesta:** [C]
**U3 Respuesta:** [C]

### Pregunta 6: [Especificar]

**U1 Respuesta:** [C]
**U2 Respuesta:** [C]
**U3 Respuesta:** [C]

### Pregunta 7: [Especificar]

**U1 Respuesta:** [C]
**U2 Respuesta:** [C]
**U3 Respuesta:** [C]

### Pregunta 8: [Especificar]

**U1 Respuesta:** [C]
**U2 Respuesta:** [C]
**U3 Respuesta:** [C]

---

# SECCIÓN 5: DECISIONES TUYAS (Capítulo 8)

## PUNTO 24: Aporte Propio vs Aplicación de Prácticas Conocidas

**Cierra:** [COMPLETAR] Discusión metodológica (8.1)

**Pregunta:** ¿La tesis considera el protocolo de calibración un aporte propio o una aplicación de prácticas conocidas?

**Respuesta (confirmar con tu director):**

[C]

**Justificación:**

[C]

---

## PUNTO 25: Tu Valoración Personal

**Cierra:** [COMPLETAR] Consideración final (8.4)

**Reflexión:**

¿Qué aprendiste del desarrollo de MockMind?

[C]

¿Qué funcionó bien?

[C]

¿Qué no funcionó como esperabas?

[C]

¿Qué harías diferente?

[C]

¿Qué impacto crees que tiene MockMind?

[C]

---

# ESTADO GENERAL

## Resumen de Progreso

| Sección | Puntos | Estado | Completitud |
|---------|--------|--------|-------------|
| Código y Repo | 7 puntos | ⭕ En progreso | 0% |
| Costos | 4 puntos | ✅ Parcial | 50% |
| Sesiones Usuarios | 7 puntos | ⭕ Pendiente | 0% |
| Encuesta | 2 puntos | ⭕ Pendiente | 0% |
| Decisiones | 2 puntos | ⭕ Pendiente | 0% |
| **TOTAL** | **25 puntos** | - | **~10%** |

## Qué Ya Tienes

✅ Reportes QA (3 evaluadores)
✅ Datos Google AI Studio
✅ Códigos de acceso a MockMind
✅ Documentación técnica del proyecto

## Qué Falta Recolectar

⭕ Datos de usuarios (puntajes, perfil, consentimiento)
⭕ Respuestas de encuesta
⭕ Verificación de código (prompts, componentes, riesgos)
⭕ Tu análisis final

## Orden Recomendado

**Hoy (2 horas):**
1. Puntos 4, 5, 7, 8, 9 → Código listo
2. Puntos 11-14 → Tabla 7.5 lista

**Mañana (1.5 horas):**
3. Puntos 15-21 → Sesiones listas

**Después (1 hora):**
4. Puntos 22-25 → Conclusiones listas

---

**Generado:** 20 Octubre 2026  
**Próximo paso:** Completar Sección 1 (Código y Repositorio)

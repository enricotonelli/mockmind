# Roadmap MockMind — Estado actual y próximos pasos

## ✅ Completado en esta sesión (backend serverless)

### Infraestructura
- ✅ Migración Express → Next.js API Routes (serverless)
- ✅ Instalación de Prisma 6.5 + PostgreSQL driver
- ✅ Schema Prisma con tablas: usuarios, sesiones, mensajes, reportes
- ✅ Configuración JWT (jsonwebtoken) + bcrypt para autenticación
- ✅ AI SDK consistency: todas las operaciones de IA usan `ai-sdk.dev`
  - Claude Haiku para reasoning (entrevistador + análisis)
  - OpenAI Whisper + TTS vía AI SDK
- ✅ Build exitoso (sin errores Turbopack)

### API Routes implementadas
- ✅ `/api/auth/registro` → registroUsuario()
- ✅ `/api/auth/login` → loginUsuario()
- ✅ `/api/sesiones/crear` → crearSesion()
- ✅ `/api/sesiones/{id}/detalles` → obtenerSesion()
- ✅ `/api/sesiones/{id}/apertura` → generarApertura()
- ✅ `/api/sesiones/{id}/turno` → decidirTurno()
- ✅ `/api/sesiones/{id}/reporte` → generarReporte()
- ✅ `/api/sesiones/{id}` (DELETE) → eliminarSesion()
- ✅ `/api/sesiones` (GET) → listarSesiones()
- ✅ `/api/voz/transcribir` → transcribirAudio()
- ✅ `/api/voz/hablar` → generarAudioDesdeTexto()

### Lógica de negocio
- ✅ lib/services.js: toda la lógica de entrevista centralizada
- ✅ lib/auth.js: JWT, middleware 401, helpers de respuesta
- ✅ lib/prisma.js: connection pooling (dev/prod)
- ✅ prompts/entrevistador.js: prompts estructurados por tipo
- ✅ prompts/reporte.js: generación de reporte de feedback

### Documentación
- ✅ DEPLOYMENT.md: guía completa para Vercel (free tier)
- ✅ SETUP_LOCAL.md: configuración local + troubleshooting
- ✅ .env.example: template de variables de entorno

## ⏳ Próximo: Frontend adaptado al nuevo backend

### Cambios necesarios en componentes frontend
- [ ] Actualizar cliente HTTP (api/real/autenticacion.js está listo)
- [ ] Verificar que api/index.js enrute correctamente
- [ ] Revisar páginas que llamaban a endpoints old Express:
  - [ ] pages/NuevaEntrevista.jsx → ajustar llamadas
  - [ ] pages/Entrevista.jsx → ajustar llamadas
  - [ ] pages/Dashboard.jsx → ajustar llamadas
  - [ ] pages/ReporteFeedback.jsx → ajustar llamadas

### Testing de integración
- [ ] Probar registro en local
- [ ] Probar login en local
- [ ] Probar crear sesión en local
- [ ] Probar interacción entrevistador (preguntas/respuestas)
- [ ] Probar generación de reporte
- [ ] Probar voz (transcripción y TTS)

## 🎯 Fase 2: Después de validar Módulo 1

Una vez que las 11 páginas estén migradas y todo funcione:

### Tareas pendientes para Módulo 1 completo
1. Testing con usuarios reales (2-3 personas)
2. Optimización de prompts del entrevistador
3. Ajustes en los puntajes del reporte
4. UI/UX refinements en voz

### Módulo 2 — Analizador de CV
- Subida de archivos PDF/Word
- Parsing y extracción de contenido
- Análisis con Claude (vision): 4 dimensiones
  - Compatibilidad ATS
  - Completitud de secciones
  - Calidad de contenido
  - Veredicto final

### Módulo 3 — Creador de CV
- Flujo conversacional (preguntas una a una)
- Generación de CV en formato ATS-optimizado
- Generación de CV visual bonito

## 📦 Estructura actual (después de este turno)

```
mockmind/
├── CLAUDE.md                    # Instrucciones del proyecto
├── DEPLOYMENT.md                # Guía de deployment Vercel
├── SETUP_LOCAL.md               # Guía de setup local
├── ROADMAP.md                   # Este archivo
│
└── frontend-next/               # Todo en una carpeta (Next.js full-stack)
    ├── src/
    │   ├── app/
    │   │   ├── api/             ← NUEVO: API Routes (backend)
    │   │   ├── (auth)/
    │   │   ├── (app)/
    │   │   └── layout.jsx
    │   ├── lib/                 ← NUEVO: Services, auth, Prisma
    │   ├── prompts/             ← NUEVO: Prompts de Claude
    │   ├── components/
    │   ├── api/                 ← Cliente HTTP (mock + real)
    │   └── ...
    ├── prisma/
    │   └── schema.prisma        ← NUEVO: Modelo de datos
    ├── package.json             ← ACTUALIZADO: +13 dependencias
    ├── .env.example             ← NUEVO: Template de variables
    ├── .env.local               ← LOCAL: Variables reales (no commitear)
    └── ...

# Nota: No hay carpeta /backend separada. Todo está en Next.js.
# Vercel deploy automáticamente API Routes como serverless functions.
```

## 🚀 Próximas acciones (orden de prioridad)

### INMEDIATO (hoy)
1. [ ] Revisar páginas frontend que no están migradas
2. [ ] Verificar que todas llamen a endpoints correctos
3. [ ] Probar flujo completo en local (registro → entrevista → reporte)

### CORTO PLAZO (semana 1)
1. [ ] Desplegar a Vercel siguiendo DEPLOYMENT.md
2. [ ] Probar endpoints de API desde producción
3. [ ] Validar integraciones Claude + OpenAI

### MEDIANO PLAZO (semana 2-3)
1. [ ] Testing con usuarios reales
2. [ ] Ajustes de UX basado en feedback
3. [ ] Optimización de prompts

### LARGO PLAZO (septiembre)
1. [ ] Módulo 2 (analizador de CV)
2. [ ] Módulo 3 (creador de CV)
3. [ ] Pulir para entrega final

## 💰 Costo de operación (producción)

Por 100 sesiones/mes:
- **Vercel:** $0
- **Supabase:** $0 (free tier)
- **Claude Haiku:** ~$0.30–1.00 (reasoning)
- **OpenAI (Whisper + TTS):** ~$0.50–2.00 (voice)
- **Total:** ~$1–3/mes

Escalable sin costo fijo. Solo pagas por uso.

## 📝 Notas importantes

### Autenticación
- JWT válido por 7 días
- Contraseñas hasheadas con bcrypt (10 rounds)
- Sin sesiones en servidor (stateless)

### Seguridad
- API keys de Anthropic/OpenAI nunca llegan al frontend
- Toda lógica de IA en backend (API Routes)
- Middleware 401 en endpoints protegidos

### Base de datos
- Prisma ORM: type-safe, migraciones automáticas
- PostgreSQL: escalable, free tier en Supabase
- Connection pooling en dev/prod

### IA (vía AI SDK — TODO GRATIS HASTA NOVIEMBRE)
- **Google Gemini 1.5 Flash** (via AI SDK): FREE TIER
  - Reasoning: entrevistador, análisis de respuestas
  - Free tier: 15 requests/min (~1-2 sesiones/día)
  - Costo después: ~$1–2/mes con 100 sesiones/mes
- **Web Speech API** (navegador nativo): STT + TTS
  - 100% gratis, corre en el cliente
  - Disponible en Chrome, Firefox, Safari, Edge
- **Nota:** TODO pasa por https://ai-sdk.dev/, no llamadas HTTP directas

## 🔗 Enlaces útiles

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Supabase Console](https://app.supabase.com/)
- [Anthropic Console](https://console.anthropic.com/)
- [OpenAI Platform](https://platform.openai.com/)
- [AI SDK Docs](https://ai-sdk.dev/)
- [Prisma Docs](https://www.prisma.io/docs)

---

Actualizado: 2026-09-03 (cuando se completó backend serverless)

Próxima revisión: después de validar frontend con nuevo backend

# Guía de Deployment — MockMind en Vercel

Este documento describe cómo deployar MockMind completamente en Vercel (sin servidores Express separados) de forma gratuita.

## Arquitectura

- **Frontend:** Next.js 15 con App Router
- **Backend:** Next.js API Routes (serverless functions)
- **Base de datos:** PostgreSQL en Supabase (free tier)
- **IA:** Claude Haiku (reasoning) + OpenAI (STT/TTS) — ambas vía AI SDK
- **Deploy:** Vercel (free tier)

## Requisitos previos

1. Cuenta en [Vercel](https://vercel.com) (gratis)
2. Cuenta en [Supabase](https://supabase.com) (gratis, PostgreSQL incluida)
3. API key de [Anthropic](https://console.anthropic.com) (gratis para desarrollo, pago por uso)
4. API key de [OpenAI](https://platform.openai.com) (pago por uso)
5. Git configurado y acceso a GitHub

## Paso 1: Configurar base de datos en Supabase

### 1.1 Crear proyecto PostgreSQL

1. Ir a [Supabase](https://app.supabase.com/)
2. Crear nuevo proyecto (free tier)
3. Esperar a que se inicialice
4. Ir a **Settings > Database** y copiar la connection string de "URI"
   - Formato: `postgresql://[user]:[password]@[host]/[database]`
   - Copiar exactamente como aparece

### 1.2 Ejecutar migraciones de Prisma (en local)

```bash
cd frontend-next

# Configurar DATABASE_URL en .env.local
export DATABASE_URL="postgresql://..."

# Crear tablas
npx prisma migrate dev --name initial
```

Esto crea todas las tablas en Supabase automáticamente.

## Paso 2: Preparar variables de entorno (GRATIS HASTA NOVIEMBRE)

Crear un archivo `.env.production.local` en `frontend-next/` con:

```env
# Base de datos (desde Supabase free tier)
DATABASE_URL="postgresql://..."

# JWT (generar una cadena larga aleatoria)
JWT_SECRET="generar-con-crypto-random-en-produccion"

# Google Gemini (FREE TIER: 15 requests/min)
# Obtener en https://aistudio.google.com/apikey
# Suficiente para ~1-2 sesiones/día
GOOGLE_GENERATIVE_AI_API_KEY="AIz..."

# Modelo
GOOGLE_GENERATIVE_AI_MODEL="gemini-1.5-flash"
```

**Costo: $0 hasta noviembre** ✅

**Limitaciones:**
- Google Gemini free tier: 15 reqs/min
- Web Speech API: gratis, navegador nativo
- En noviembre: cambiar a Anthropic si necesitas más capacidad

**⚠️ IMPORTANTE:** 
- No commitear este archivo. Ya está en `.gitignore`
- Vercel manejará estas variables automáticamente como "Environment Variables"

## Paso 3: Pushear a GitHub

```bash
# Desde la raíz del proyecto
git add -A
git commit -m "Prepara para deployment"
git push origin main
```

## Paso 4: Deployar en Vercel

### 4.1 Conectar repositorio

1. Ir a [vercel.com](https://vercel.com/)
2. Hacer login
3. Importar proyecto desde GitHub
4. Seleccionar repositorio `mockmind`
5. Framework: **Next.js**
6. Root directory: `frontend-next`
7. Click en **Deploy**

### 4.2 Configurar variables de entorno en Vercel

1. En el dashboard de Vercel, ir a **Project Settings > Environment Variables**
2. Agregar cada variable del `.env.production.local`:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `ANTHROPIC_API_KEY`
   - `OPENAI_API_KEY`
   - `CLAUDE_INTERVIEW_MODEL`

3. Seleccionar que aplique a todos los ambientes (Production, Preview, Development)
4. Hacer clic en **Save**

### 4.3 Redeploy después de agregar variables

1. Ir a **Deployments**
2. Hacer click en el tres puntos del último deployment
3. Click en **Redeploy**

## Paso 5: Verificar que funciona

Una vez que el deployment esté listo (verá un ✓ en Vercel):

1. Ir a la URL que Vercel proporciona (ej: `https://mockmind-xyz.vercel.app`)
2. Probar el flujo:
   - ✓ Registro (crear cuenta)
   - ✓ Login (iniciar sesión)
   - ✓ Nueva entrevista (crear sesión, seleccionar tipo)
   - ✓ Chat con el entrevistador (preguntas/respuestas)
   - ✓ Reporte de feedback (al finalizar)
   - ✓ Historial de sesiones (dashboard)

## Costos estimados (USD/mes)

| Servicio | Costo |
|----------|-------|
| Vercel | $0 (free tier) |
| Supabase | $0 (free tier hasta 2GB) |
| Claude API | ~$0.30–1.00* |
| OpenAI (Whisper + TTS) | ~$0.50–2.00* |
| **Total** | **~$1–3/mes** |

*Estimado con 100 sesiones/mes × ~5000 tokens/sesión entrada/salida.
Verificar en [Anthropic Pricing](https://www.anthropic.com/pricing) y [OpenAI Pricing](https://openai.com/pricing).

## Solución de problemas

### Error: "DATABASE_URL not found"
- Verificar que DATABASE_URL esté agregada en Vercel Environment Variables
- Hacer redeploy después de agregar

### Error: "ANTHROPIC_API_KEY missing"
- Verificar la key en console.anthropic.com
- Asegurar que esté agregada en Vercel Environment Variables
- Nota: Vercel debe tener saldo suficiente o las funciones fallarán

### Error: "Prisma Client not found"
- Ejecutar `npm install` localmente y comitear cambios de `package-lock.json`
- Vercel ejecutará `npm install` en el build automáticamente

### La entrevista no responde
- Revisar logs en Vercel > Deployments > Logs
- Verificar que las claves de API sean correctas y tengan permisos
- Verificar que la base de datos esté accesible

## Limpieza y mantenimiento

### Revisar logs en producción
```
Vercel Dashboard > Project > Deployments > [latest] > Logs
```

### Ver base de datos en producción
```
Supabase Dashboard > SQL Editor
SELECT * FROM sesiones WHERE fecha > NOW() - INTERVAL '7 days';
```

### Actualizar después de cambios locales
```bash
git add -A
git commit -m "Describe los cambios"
git push origin main
# Vercel automaticamente redeploya
```

## Siguientes pasos

1. **Módulo 2 — Analizador de CV:** usar modelos de vision para analizar PDFs
2. **Módulo 3 — Creador de CV:** generar CV con la IA de forma conversacional
3. **Modo voz completo:** integrar Elements.ai para UI de voz mejorada

## Referencias

- [Vercel Docs](https://vercel.com/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Anthropic API](https://docs.anthropic.com)
- [OpenAI API](https://platform.openai.com/docs)
- [AI SDK Docs](https://ai-sdk.dev/)

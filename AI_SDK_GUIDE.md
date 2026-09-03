# Guía AI SDK — MockMind

Cómo se usa AI SDK en MockMind. **TODO pasa por https://ai-sdk.dev/, no hay llamadas HTTP directas.**

## Instalación

```bash
npm install ai @ai-sdk/anthropic @ai-sdk/openai
```

## Variables de entorno requeridas

```env
# Credenciales (obtenidas de sus consolas, pero usadas VÍA AI SDK)
ANTHROPIC_API_KEY="sk-ant-..."
OPENAI_API_KEY="sk-..."

# Configuración de modelo
CLAUDE_INTERVIEW_MODEL="claude-haiku-4-5-20251001"
```

## Cómo se usa en MockMind

### 1. Reasoning — Claude Haiku (entrevistador)

```javascript
import { generateObject } from 'ai';
import { anthropic } from '@ai-sdk/anthropic';

const modelo = anthropic('claude-haiku-4-5-20251001');

const resultado = await generateObject({
  model: modelo,
  system: "Sos un entrevistador...",
  prompt: "Haz una pregunta sobre...",
  schema: esquemaApertura, // Zod schema para validar output
});

// resultado.texto contiene la pregunta del entrevistador
```

**Ubicación en el código:** [`src/lib/services.js`](./frontend-next/src/lib/services.js:63-72)

**Funciones que lo usan:**
- `generarApertura()` — primera pregunta
- `decidirTurno()` — siguiente pregunta o repregunta
- `generarReporte()` — análisis y feedback

### 2. Speech-to-Text (STT) — Whisper

```javascript
import { experimental_transcribe } from 'ai';
import { openai } from '@ai-sdk/openai';

const resultado = await experimental_transcribe({
  model: openai.audio.transcription('whisper-1'),
  audio: audioBuffer, // Buffer de audio WAV/MP3
  language: 'es',
});

// resultado.text contiene la transcripción en español
```

**Ubicación en el código:** [`src/lib/services.js`](./frontend-next/src/lib/services.js:176-184)

**Endpoint:** `POST /api/voz/transcribir`

### 3. Text-to-Speech (TTS)

```javascript
import { experimental_generateSpeech } from 'ai';
import { openai } from '@ai-sdk/openai';

const audioBuffer = await experimental_generateSpeech({
  model: openai.audio.speech('tts-1'),
  text: "Pregunta del entrevistador",
  voice: 'nova', // Voces: alloy, echo, fable, onyx, shimmer, nova
});

// audioBuffer es un Buffer binario de audio MP3
```

**Ubicación en el código:** [`src/lib/services.js`](./frontend-next/src/lib/services.js:186-192)

**Endpoint:** `POST /api/voz/hablar`

## Prompts estructurados con Zod

Todos los prompts de Claude usan **structured output** con Zod schemas. Así garantizamos que siempre retorna JSON válido:

```javascript
import { z } from 'zod';

const esquemaApertura = z.object({
  mensaje: z.string().describe('El saludo breve + primera pregunta'),
});

const resultado = await generateObject({
  schema: esquemaApertura, // AI SDK valida automáticamente
  // ...
});

// resultado está tipado: resultado.mensaje existe siempre
```

**Schemas en el código:**
- Entrevistador: [`src/prompts/entrevistador.js`](./frontend-next/src/prompts/entrevistador.js)
- Reporte: [`src/prompts/reporte.js`](./frontend-next/src/prompts/reporte.js)

## Flow de una entrevista (donde está AI SDK)

```
1. Usuario crea sesión
   ↓
2. /api/sesiones/crear
   → generarApertura() [AI SDK: generateObject]
   → Haiku retorna: "Hola, ¿cuéntame sobre..."
   ↓
3. Usuario responde (texto o audio)
   → Si audio: /api/voz/transcribir [AI SDK: experimental_transcribe]
   ↓
4. /api/sesiones/{id}/turno
   → decidirTurno() [AI SDK: generateObject]
   → Haiku retorna: ¿repregunta o siguiente pregunta?
   ↓
5. Repite 3-4 hasta finalizar
   ↓
6. /api/sesiones/{id}/reporte
   → generarReporte() [AI SDK: generateObject]
   → Haiku analiza y retorna: {puntajes, feedback, sugerencias}
   ↓
7. Usuario escucha reporte
   → Si audio: /api/voz/hablar [AI SDK: experimental_generateSpeech]
```

## Costos (aproximado)

| Operación | Modelo | Costo |
|-----------|--------|-------|
| Entrevistador (4 turnos × 3 preguntas) | Haiku | ~$0.10–0.20 |
| Reporte | Haiku | ~$0.05–0.10 |
| 1 minuto de audio (STT) | Whisper | ~$0.02 |
| 500 caracteres de audio (TTS) | TTS | ~$0.01 |
| **Una entrevista completa** | — | **~$0.18–0.33** |

**Ahorro vs Sonnet:** Haiku es 5-6x más barato pero suficiente para entrevistas estructuradas.

## Troubleshooting

### Error: "ANTHROPIC_API_KEY not found"
```
→ Verificar que esté en .env.local o en Vercel Environment Variables
→ Reiniciar servidor
```

### Error: "No such model: claude-haiku..."
```
→ Verificar que CLAUDE_INTERVIEW_MODEL esté bien escrito
→ Usar: claude-haiku-4-5-20251001 (exacto)
```

### STT no funciona
```
→ El audio debe ser WAV o MP3
→ OPENAI_API_KEY debe estar configurada
→ Máximo 25MB por audio
```

### TTS suena raro
```
→ Probar otras voces: alloy, echo, fable, onyx, shimmer
→ Acortar el texto (chunks de 500 caracteres max para mejor calidad)
```

## Cambiar modelos (fácil con AI SDK)

Querer cambiar a Claude Sonnet? Solo cambiar una línea:

```javascript
// Antes:
const modelo = anthropic('claude-haiku-4-5-20251001');

// Después (3x más caro, pero más potente):
const modelo = anthropic('claude-opus-5-20250514');

// O usar outro provider:
import { openai } from '@ai-sdk/openai';
const modelo = openai('gpt-4o'); // Compatible con generateObject
```

**Ventaja de AI SDK:** cambiar proveedores es trivial, todo el código sigue igual.

## Referencias

- [AI SDK Docs](https://ai-sdk.dev/)
- [AI SDK Providers](https://ai-sdk.dev/providers)
- [generateObject (structured output)](https://ai-sdk.dev/docs/ai-core/generate-object)
- [Anthropic Provider](https://ai-sdk.dev/providers/anthropic)
- [OpenAI Provider](https://ai-sdk.dev/providers/openai)
- [Zod (schema validation)](https://zod.dev/)

## Archivos clave

- Backend logic: [`src/lib/services.js`](./frontend-next/src/lib/services.js)
- Prompts: [`src/prompts/`](./frontend-next/src/prompts/)
- API Routes: [`src/app/api/`](./frontend-next/src/app/api/)
- Configuración: [`frontend-next/.env.example`](./frontend-next/.env.example)

---

**Resumen:** AI SDK unifica Anthropic + OpenAI con una interfaz común. No hay HTTP calls directas. Todo es type-safe con Zod. Los prompts son reproducibles y versionables.

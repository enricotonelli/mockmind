# Guía AI SDK — MockMind

Cómo se usa AI SDK en MockMind. **TODO pasa por https://ai-sdk.dev/, no hay llamadas HTTP directas.**

## Instalación (GRATIS)

```bash
npm install ai @ai-sdk/google
```

## Variables de entorno requeridas

```env
# Google Gemini (FREE TIER: 15 requests/min)
# Obtener en https://aistudio.google.com/apikey
GOOGLE_GENERATIVE_AI_API_KEY="AIz..."

# Modelo
GOOGLE_GENERATIVE_AI_MODEL="gemini-1.5-flash"

# Nota: Voz (STT/TTS) usa Web Speech API del navegador - GRATIS
```

## Cómo se usa en MockMind

### 1. Reasoning — Google Gemini 1.5 Flash (entrevistador)

```javascript
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';

const modelo = google('gemini-1.5-flash');

const resultado = await generateObject({
  model: modelo,
  system: "Sos un entrevistador...",
  prompt: "Haz una pregunta sobre...",
  schema: esquemaApertura, // Zod schema para validar output
});

// resultado.texto contiene la pregunta del entrevistador
```

**Costo:** FREE TIER (15 requests/min) = ~$0 ✅

**Ubicación en el código:** [`src/lib/services.js`](./frontend-next/src/lib/services.js:63-72)

**Funciones que lo usan:**
- `generarApertura()` — primera pregunta
- `decidirTurno()` — siguiente pregunta o repregunta
- `generarReporte()` — análisis y feedback

### 2. Speech-to-Text (STT) — Web Speech API

```javascript
// Corre en el CLIENTE, no requiere backend

const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'es-ES';

recognition.onresult = (event) => {
  const transcript = event.results[event.results.length - 1][0].transcript;
  console.log('Transcripción:', transcript);
};

recognition.start();
```

**Costo:** FREE (navegador nativo) ✅

**Ubicación en el código:** [`src/components/PanelRespuestaConVoz.jsx`](./frontend-next/src/components/PanelRespuestaConVoz.jsx)

**Soporte:** Chrome, Firefox, Safari, Edge (no IE)

### 3. Text-to-Speech (TTS) — Web Speech API

```javascript
// Corre en el CLIENTE, no requiere backend

const utterance = new SpeechSynthesisUtterance("Pregunta del entrevistador");
utterance.lang = 'es-ES';
utterance.rate = 0.9; // Velocidad (0.1 - 10)
utterance.pitch = 1.0; // Tono (0 - 2)

window.speechSynthesis.speak(utterance);
```

**Costo:** FREE (navegador nativo) ✅

**Ubicación en el código:** [`src/components/ReproductorAudio.jsx`](./frontend-next/src/components/ReproductorAudio.jsx)

**Soporte:** Chrome, Firefox, Safari, Edge (no IE)

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

## Costos (GRATIS HASTA NOVIEMBRE)

| Operación | Modelo | Costo |
|-----------|--------|-------|
| Entrevistador (4 turnos × 3 preguntas) | Gemini Flash (free tier) | ~$0 ✅ |
| Reporte | Gemini Flash (free tier) | ~$0 ✅ |
| STT (speech-to-text) | Web Speech API | ~$0 ✅ |
| TTS (text-to-speech) | Web Speech API | ~$0 ✅ |
| **Una entrevista completa** | — | **~$0** ✅ |
| **100 sesiones/mes** | — | **~$0** ✅ |

**Limitación:** Google Gemini free tier = 15 requests/min (~1-2 sesiones/día)

**Después (noviembre):** cambiar a Anthropic Haiku si necesitas más capacidad (~$2–5/mes)

## Troubleshooting

### Error: "GOOGLE_GENERATIVE_AI_API_KEY not found"
```
→ Verificar que esté en .env.local o en Vercel Environment Variables
→ Obtener en https://aistudio.google.com/apikey
→ Reiniciar servidor
```

### Error: 429 "Rate limit exceeded"
```
→ Google Gemini free tier: 15 requests/min
→ Esperar 1-2 minutos antes de siguiente entrevista
→ En noviembre: cambiar a Anthropic si necesitas más
```

### Error: "Model not found: gemini-1.5-flash"
```
→ Verificar API key es válida en https://aistudio.google.com/apikey
→ Usar: gemini-1.5-flash (exacto)
```

### STT no funciona (Web Speech API)
```
→ Navegador debe soportarlo: Chrome, Firefox, Safari, Edge (no IE)
→ Micrófono debe estar permitido en el navegador
→ Idioma debe ser 'es-ES' para español
```

### TTS suena raro (Web Speech API)
```
→ Probar ajustar rate (velocidad): 0.5 - 1.5
→ Probar ajustar pitch (tono): 0.5 - 2.0
→ Acortar el texto (máx ~500 caracteres recomendado)
```

## Cambiar modelos (fácil con AI SDK) — Para noviembre

Cuando necesites pagar y cambiar de Gemini a Anthropic:

```javascript
// AHORA (gratis):
import { google } from '@ai-sdk/google';
const modelo = google('gemini-1.5-flash');

// NOVIEMBRE (pago, pero más potente):
import { anthropic } from '@ai-sdk/anthropic';
const modelo = anthropic('claude-haiku-4-5-20251001');

// O probar GPT:
import { openai } from '@ai-sdk/openai';
const modelo = openai('gpt-4o-mini'); // Compatible con generateObject
```

**Ventaja de AI SDK:** cambiar proveedores es trivial, todo el código sigue igual.

**Plan:**
- Septiembre–octubre: Gemini free tier (gratis)
- Noviembre: cambiar a Anthropic Haiku (pago, $2–5/mes)

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

const fs = require('fs');
const path = require('path');
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/voz/transcribir
// Body: multipart/form-data con campo "audio" (archivo WAV/MP3/M4A)
// Responde: { texto: "transcripción del audio" }
async function transcribir(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo de audio' });
    }

    const archivoTemporal = req.file.path;

    // Usar Whisper para transcribir
    const transcripcion = await openai.audio.transcriptions.create({
      file: fs.createReadStream(archivoTemporal),
      model: 'whisper-1',
      language: 'es', // Español por defecto
    });

    // Limpiar archivo temporal
    fs.unlinkSync(archivoTemporal);

    res.json({ texto: transcripcion.text });
  } catch (error) {
    console.error('Error en transcribir:', error.message);
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (e) {
        // Ignorar si falla la limpieza
      }
    }
    res.status(500).json({ error: error.message });
  }
}

// POST /api/voz/hablar
// Body: { texto: "texto a convertir a voz" }
// Responde: audio/mp3 (stream de audio)
async function hablar(req, res) {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ error: 'No se proporcionó texto' });
    }

    // Usar TTS para generar voz
    const audio = await openai.audio.speech.create({
      model: 'tts-1', // Modelo más rápido y barato
      voice: 'nova', // Voz natural
      input: texto,
    });

    // Convertir el buffer a stream y enviarlo
    const buffer = await audio.arrayBuffer();

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('Error en hablar:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { transcribir, hablar };

const fs = require('fs');
const path = require('path');
const { transcribeAudio, generateSpeech } = require('ai');
const { openai } = require('@ai-sdk/openai');

// POST /api/voz/transcribir
// Body: multipart/form-data con campo "audio" (archivo WAV/MP3/M4A)
// Responde: { texto: "transcripción del audio" }
async function transcribir(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se proporcionó archivo de audio' });
    }

    const archivoTemporal = req.file.path;

    // Leer el archivo de audio
    const audioBuffer = fs.readFileSync(archivoTemporal);

    // Usar AI SDK para transcribir (Whisper de OpenAI)
    const resultado = await transcribeAudio({
      model: openai.audio.transcription('whisper-1'),
      audio: audioBuffer,
      language: 'es',
    });

    // Limpiar archivo temporal
    fs.unlinkSync(archivoTemporal);

    res.json({ texto: resultado.text });
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

    // Usar AI SDK para generar voz (TTS de OpenAI)
    const audio = await generateSpeech({
      model: openai.audio.speech('tts-1'),
      text: texto,
      voice: 'nova',
    });

    // El audio es un ArrayBuffer, convertirlo a Buffer para enviar
    const buffer = Buffer.from(audio);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', 'attachment; filename="audio.mp3"');
    res.send(buffer);
  } catch (error) {
    console.error('Error en hablar:', error.message);
    res.status(500).json({ error: error.message });
  }
}

module.exports = { transcribir, hablar };

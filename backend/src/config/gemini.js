// Configuración para Google Gemini API
const { google } = require('@ai-sdk/google');

const MODELO = 'gemini-3.1-flash-lite';

// Modelo para el motor de entrevistas
// La API key se toma automáticamente de GOOGLE_GENERATIVE_AI_API_KEY
const modeloEntrevistadorAI = google(MODELO);

module.exports = { modeloEntrevistadorAI, MODELO };

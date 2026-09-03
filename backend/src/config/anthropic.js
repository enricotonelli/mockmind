// Cliente único de la API de Anthropic. La API key vive SOLO acá, en el
// backend (ver CLAUDE.md §5): el frontend nunca la ve ni la usa.

const Anthropic = require('@anthropic-ai/sdk');
const { anthropic: anthropicAI } = require('@ai-sdk/anthropic');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Modelo para el motor de entrevistas: usa Claude Haiku (más barato y rápido)
// en lugar de Sonnet para optimizar costos.
const MODELO = process.env.CLAUDE_MODEL || 'claude-sonnet-5';
const MODELO_ENTREVISTA = process.env.CLAUDE_INTERVIEW_MODEL || 'claude-haiku-4-5-20251001';

// Modelo del AI SDK para generateObject (más eficiente que el SDK bruto)
const modeloEntrevistadorAI = anthropicAI(MODELO_ENTREVISTA);

module.exports = { anthropic, MODELO, modeloEntrevistadorAI, MODELO_ENTREVISTA };

// Cliente único de la API de Anthropic. La API key vive SOLO acá, en el
// backend (ver CLAUDE.md §5): el frontend nunca la ve ni la usa.

const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Configurable por env para no tener que tocar código si Anthropic saca un
// modelo nuevo o se quiere probar otro.
const MODELO = process.env.CLAUDE_MODEL || 'claude-sonnet-5';

module.exports = { anthropic, MODELO };

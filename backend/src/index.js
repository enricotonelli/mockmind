require('dotenv').config();

const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const sesionesRoutes = require('./routes/sesiones.routes');
const { manejoErrores } = require('./middleware/manejoErrores');

const app = express();
const PORT = process.env.PORT || 3000;

// En desarrollo, sin CORS_ORIGIN definido, se acepta cualquier origen para
// no tener que tocar la config al levantar el frontend en otro puerto.
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/sesiones', sesionesRoutes);

// 404 para cualquier ruta de API no definida.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
});

// Manejo global de errores: nunca dejar que un error tire el servidor.
app.use(manejoErrores);

app.listen(PORT, () => {
  console.log(`MockMind backend escuchando en http://localhost:${PORT}`);
});

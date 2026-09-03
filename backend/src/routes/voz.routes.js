const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const { transcribir, hablar } = require('../controllers/voz.controller');
const { requiereAuth } = require('../middleware/auth');

const router = Router();

// Configurar multer para almacenar archivos temporalmente
const almacenamiento = multer.diskStorage({
  destination: (req, file, cb) => {
    // Usar carpeta temporal del sistema
    cb(null, '/tmp');
  },
  filename: (req, file, cb) => {
    // Generar nombre único
    const timestamp = Date.now();
    const nombreAleatorio = Math.random().toString(36).substring(7);
    cb(null, `audio_${timestamp}_${nombreAleatorio}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage: almacenamiento,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB máximo
  fileFilter: (req, file, cb) => {
    // Solo permitir archivos de audio
    const tiposPermitidos = /audio\//;
    if (tiposPermitidos.test(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de audio'));
    }
  },
});

// Rutas
router.post('/transcribir', requiereAuth, upload.single('audio'), transcribir);
router.post('/hablar', requiereAuth, hablar);

module.exports = router;

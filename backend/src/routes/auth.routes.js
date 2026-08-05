const { Router } = require('express');
const { registro, login, perfil } = require('../controllers/auth.controller');
const { requiereAuth } = require('../middleware/auth');

const router = Router();

router.post('/registro', registro);
router.post('/login', login);
router.get('/perfil', requiereAuth, perfil);

module.exports = router;

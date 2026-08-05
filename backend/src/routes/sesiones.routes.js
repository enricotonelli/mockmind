const { Router } = require('express');
const controlador = require('../controllers/sesiones.controller');
const { requiereAuth } = require('../middleware/auth');

const router = Router();

router.use(requiereAuth);

// Las rutas fijas van antes que "/:id", si no Express interpreta
// "resumen" y "en-curso" como un id de sesión.
router.get('/resumen', controlador.resumen);
router.get('/en-curso', controlador.listarEnCurso);
router.get('/', controlador.listar);
router.post('/', controlador.crear);

router.get('/:id', controlador.obtener);
router.delete('/:id', controlador.eliminar);
router.post('/:id/mensajes', controlador.responder);
router.post('/:id/finalizar', controlador.finalizar);
router.get('/:id/reporte', controlador.obtenerReporte);

module.exports = router;

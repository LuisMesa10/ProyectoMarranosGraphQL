const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');

// Rutas CRUD
router.post('/', clienteController.crearCliente);
router.get('/', clienteController.obtenerClientes);
router.get('/:id', clienteController.obtenerClientePorId);
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', clienteController.eliminarCliente);

//RUTAS REPORTES
router.get('/reporte/cedula/:cedula', clienteController.reportePorCedula);
router.get('/reporte/general', clienteController.reporteGeneral);
router.get('/reporte/pdf/:cedula', clienteController.reporteClientePDF);

module.exports = router;

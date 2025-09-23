const Porcino = require('../models/porcino');
const Cliente = require('../models/cliente');
const Alimentacion = require('../models/alimentacion');

// 📌 Crear porcino
const createPorcino = async (req, res) => {
    try {
        // Verificar que el cliente existe
        const clienteExiste = await Cliente.findById(req.body.clienteId);
        if (!clienteExiste) {
            return res.status(400).json({
                success: false,
                message: 'El cliente especificado no existe'
            });
        }

        // Verificar que la alimentación existe
        const alimentacionExiste = await Alimentacion.findById(req.body.alimentacionId);
        if (!alimentacionExiste) {
            return res.status(400).json({
                success: false,
                message: 'La alimentación especificada no existe'
            });
        }

        const porcino = new Porcino(req.body);
        await porcino.save();

        // Populate para devolver los datos completos
        await porcino.populate('clienteId alimentacionId');

        res.status(201).json({
            success: true,
            message: 'Porcino creado exitosamente',
            data: porcino
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'La identificación del porcino ya está registrada'
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al crear porcino',
            error: error.message
        });
    }
};

// 📌 Obtener todos los porcinos
const obtenerPorcinos = async (req, res) => {
    try {
        const { clienteId } = req.query;
        let filtro = {};

        // Si se especifica un clienteId, filtrar por ese cliente
        if (clienteId) {
            filtro.clienteId = clienteId;
        }

        const porcinos = await Porcino.find(filtro)
            .populate('clienteId', 'cedula nombres apellidos')
            .populate('alimentacionId', 'descripcion dosis')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: porcinos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener porcinos',
            error: error.message
        });
    }
};

// 📌 Obtener porcino por ID
const obtenerPorcinoPorId = async (req, res) => {
    try {
        const porcino = await Porcino.findById(req.params.id)
            .populate('clienteId', 'cedula nombres apellidos direccion telefono')
            .populate('alimentacionId', 'descripcion dosis');

        if (!porcino) {
            return res.status(404).json({
                success: false,
                message: 'Porcino no encontrado'
            });
        }

        res.json({
            success: true,
            data: porcino
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener porcino',
            error: error.message
        });
    }
};

// 📌 Actualizar porcino
const actualizarPorcino = async (req, res) => {
    try {
        // Si se está actualizando el clienteId, verificar que existe
        if (req.body.clienteId) {
            const clienteExiste = await Cliente.findById(req.body.clienteId);
            if (!clienteExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'El cliente especificado no existe'
                });
            }
        }

        // Si se está actualizando la alimentacionId, verificar que existe
        if (req.body.alimentacionId) {
            const alimentacionExiste = await Alimentacion.findById(req.body.alimentacionId);
            if (!alimentacionExiste) {
                return res.status(400).json({
                    success: false,
                    message: 'La alimentación especificada no existe'
                });
            }
        }

        const porcino = await Porcino.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('clienteId alimentacionId');

        if (!porcino) {
            return res.status(404).json({
                success: false,
                message: 'Porcino no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Porcino actualizado exitosamente',
            data: porcino
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar porcino',
            error: error.message
        });
    }
};

// 📌 Eliminar porcino
const eliminarPorcino = async (req, res) => {
    try {
        const porcino = await Porcino.findByIdAndDelete(req.params.id);
        if (!porcino) {
            return res.status(404).json({
                success: false,
                message: 'Porcino no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Porcino eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar porcino',
            error: error.message
        });
    }
};

// 📌 Obtener estadísticas de porcinos
const obtenerEstadisticas = async (req, res) => {
    try {
        const totalPorcinos = await Porcino.countDocuments();
        const estadisticasPorRaza = await Porcino.aggregate([
            {
                $group: {
                    _id: '$raza',
                    cantidad: { $sum: 1 },
                    pesoPromedio: { $avg: '$peso' },
                    edadPromedio: { $avg: '$edad' }
                }
            }
        ]);

        const razaNames = { 1: 'York', 2: 'Hampshire', 3: 'Duroc' };
        const estadisticasFormateadas = estadisticasPorRaza.map(stat => ({
            raza: razaNames[stat._id],
            cantidad: stat.cantidad,
            pesoPromedio: Math.round(stat.pesoPromedio * 100) / 100,
            edadPromedio: Math.round(stat.edadPromedio * 100) / 100
        }));

        res.json({
            success: true,
            data: {
                totalPorcinos,
                estadisticasPorRaza: estadisticasFormateadas
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener estadísticas',
            error: error.message
        });
    }
};

module.exports = {
    createPorcino,
    obtenerPorcinos,
    obtenerPorcinoPorId,
    actualizarPorcino,
    eliminarPorcino,
    obtenerEstadisticas
};
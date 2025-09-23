const Cliente = require('../models/cliente');
const Porcino = require('../models/porcino');
const Alimentacion = require('../models/alimentacion');
const PDFDocument = require('pdfkit');

// 📌 Crear cliente
const crearCliente = async (req, res) => {
    try {
        const cliente = new Cliente(req.body);
        await cliente.save();
        res.status(201).json({
            success: true,
            message: 'Cliente creado exitosamente',
            data: cliente
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'La cédula ya está registrada'
            });
        }
        res.status(400).json({
            success: false,
            message: 'Error al crear cliente',
            error: error.message
        });
    }
};

// 📌 Obtener todos los clientes
const obtenerClientes = async (req, res) => {
    try {
        const clientes = await Cliente.find().sort({ createdAt: -1 });
        res.json({
            success: true,
            data: clientes
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener clientes',
            error: error.message
        });
    }
};

// 📌 Obtener cliente por ID
const obtenerClientePorId = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        res.json({
            success: true,
            data: cliente
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtener cliente',
            error: error.message
        });
    }
};

// 📌 Actualizar cliente
const actualizarCliente = async (req, res) => {
    try {
        const cliente = await Cliente.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Cliente actualizado exitosamente',
            data: cliente
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al actualizar cliente',
            error: error.message
        });
    }
};

// 📌 Eliminar cliente
const eliminarCliente = async (req, res) => {
    try {
        // Verificar si el cliente tiene porcinos asociados
        const porcinosAsociados = await Porcino.countDocuments({ clienteId: req.params.id });
        if (porcinosAsociados > 0) {
            return res.status(400).json({
                success: false,
                message: `No se puede eliminar el cliente porque tiene ${porcinosAsociados} porcino(s) asociado(s)`
            });
        }

        const cliente = await Cliente.findByIdAndDelete(req.params.id);
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }
        res.json({
            success: true,
            message: 'Cliente eliminado exitosamente'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al eliminar cliente',
            error: error.message
        });
    }
};

// 📌 Reporte por cédula
const reportePorCedula = async (req, res) => {
    try {
        const cliente = await Cliente.findOne({ cedula: req.params.cedula });
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        const porcinos = await Porcino.find({ clienteId: cliente._id })
            .populate('alimentacionId');

        res.json({
            success: true,
            data: {
                cliente,
                porcinos,
                totalPorcinos: porcinos.length,
                pesoTotal: porcinos.reduce((sum, p) => sum + p.peso, 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte',
            error: error.message
        });
    }
};

// 📌 Reporte general
const reporteGeneral = async (req, res) => {
    try {
        const clientes = await Cliente.find();
        const porcinos = await Porcino.find().populate('clienteId alimentacionId');

        const reporte = await Promise.all(
            clientes.map(async (cliente) => {
                const porcinosCliente = porcinos.filter(p => 
                    p.clienteId._id.toString() === cliente._id.toString()
                );
                return {
                    cliente,
                    porcinos: porcinosCliente,
                    totalPorcinos: porcinosCliente.length,
                    pesoTotal: porcinosCliente.reduce((sum, p) => sum + p.peso, 0)
                };
            })
        );

        res.json({
            success: true,
            data: {
                reporte,
                resumen: {
                    totalClientes: clientes.length,
                    totalPorcinos: porcinos.length,
                    pesoTotalGeneral: porcinos.reduce((sum, p) => sum + p.peso, 0)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al generar reporte general',
            error: error.message
        });
    }
};

// 📌 Generar PDF de reporte cliente
const reporteClientePDF = async (req, res) => {
    try {
        const cliente = await Cliente.findOne({ cedula: req.params.cedula });
        if (!cliente) {
            return res.status(404).json({
                success: false,
                message: 'Cliente no encontrado'
            });
        }

        const porcinos = await Porcino.find({ clienteId: cliente._id })
            .populate('alimentacionId');

        // Crear PDF
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="reporte-${cliente.cedula}.pdf"`);

        doc.pipe(res);

        // Encabezado
        doc.fontSize(20).text('REPORTE CLIENTE - LA GRANJA S.A.', { align: 'center' });
        doc.moveDown();

        // Información del cliente
        doc.fontSize(14).text('INFORMACIÓN DEL CLIENTE', { underline: true });
        doc.fontSize(12);
        doc.text(`Cédula: ${cliente.cedula}`);
        doc.text(`Nombres: ${cliente.nombres}`);
        doc.text(`Apellidos: ${cliente.apellidos}`);
        doc.text(`Dirección: ${cliente.direccion || 'No especificada'}`);
        doc.text(`Teléfono: ${cliente.telefono || 'No especificado'}`);
        doc.moveDown();

        // Información de porcinos
        doc.fontSize(14).text('PORCINOS ASOCIADOS', { underline: true });
        doc.fontSize(10);

        if (porcinos.length === 0) {
            doc.text('No tiene porcinos registrados');
        } else {
            porcinos.forEach((porcino, index) => {
                const razaTexto = porcino.raza === 1 ? 'York' : 
                                porcino.raza === 2 ? 'Hampshire' : 'Duroc';

                doc.text(`${index + 1}. ID: ${porcino.identificacion}`);
                doc.text(`   Raza: ${razaTexto}`);
                doc.text(`   Edad: ${porcino.edad} meses`);
                doc.text(`   Peso: ${porcino.peso} kg`);
                doc.text(`   Alimentación: ${porcino.alimentacionId?.descripcion || 'No especificada'}`);
                doc.text(`   Dosis: ${porcino.alimentacionId?.dosis || 'No especificada'}`);
                doc.moveDown(0.5);
            });

            // Resumen
            doc.moveDown();
            doc.fontSize(12).text('RESUMEN:', { underline: true });
            doc.text(`Total de porcinos: ${porcinos.length}`);
            doc.text(`Peso total: ${porcinos.reduce((sum, p) => sum + p.peso, 0)} kg`);
        }

        doc.end();
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al generar PDF',
            error: error.message
        });
    }
};

module.exports = {
    crearCliente,
    obtenerClientes,
    obtenerClientePorId,
    actualizarCliente,
    eliminarCliente,
    reportePorCedula,
    reporteGeneral,
    reporteClientePDF
};
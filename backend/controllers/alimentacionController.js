// controllers/alimentacionController.js
const Alimentacion = require("../models/alimentacion");
const Porcino = require("../models/porcino");

// Crear alimentación
exports.createAlimentacion = async (req, res) => {
  try {
    const { tipo, cantidad, fecha, porcinoId } = req.body;

    // Validaciones
    if (!tipo || !cantidad || !fecha) {
      return res.status(400).json({ message: "Todos los campos son obligatorios: tipo, cantidad, fecha" });
    }

    // Validar relación con Porcino (si viene el ID)
    if (porcinoId) {
      const porcinoExiste = await Porcino.findById(porcinoId);
      if (!porcinoExiste) {
        return res.status(404).json({ message: "El porcino asociado no existe" });
      }
    }

    const nuevaAlimentacion = new Alimentacion(req.body);
    const alimentacionGuardada = await nuevaAlimentacion.save();

    res.status(201).json(alimentacionGuardada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Obtener todas las alimentaciones
exports.getAlimentaciones = async (req, res) => {
  try {
    const alimentaciones = await Alimentacion.find().populate("porcinoId");
    res.json(alimentaciones);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener una alimentación por ID
exports.getAlimentacionById = async (req, res) => {
  try {
    const alimentacion = await Alimentacion.findById(req.params.id).populate("porcinoId");
    if (!alimentacion) {
      return res.status(404).json({ message: "Alimentación no encontrada" });
    }
    res.json(alimentacion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar alimentación
exports.updateAlimentacion = async (req, res) => {
  try {
    const { porcinoId } = req.body;

    // Si se envía un nuevo porcino, validamos que exista
    if (porcinoId) {
      const porcinoExiste = await Porcino.findById(porcinoId);
      if (!porcinoExiste) {
        return res.status(404).json({ message: "El porcino asociado no existe" });
      }
    }

    const alimentacionActualizada = await Alimentacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    ).populate("porcinoId");

    if (!alimentacionActualizada) {
      return res.status(404).json({ message: "Alimentación no encontrada" });
    }

    res.json(alimentacionActualizada);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Eliminar alimentación
exports.deleteAlimentacion = async (req, res) => {
  try {
    const alimentacionEliminada = await Alimentacion.findByIdAndDelete(req.params.id);

    if (!alimentacionEliminada) {
      return res.status(404).json({ message: "Alimentación no encontrada" });
    }

    res.json({ message: "Alimentación eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

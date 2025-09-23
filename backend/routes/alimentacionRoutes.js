const express = require("express");
const router = express.Router();
const Alimentacion = require("../models/alimentacion");

// 📌 Crear nueva alimentación
router.post("/", async (req, res) => {
  try {
    const alimentacion = new Alimentacion(req.body);
    await alimentacion.save();
    res.status(201).json(alimentacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Obtener todas las alimentaciones
router.get("/", async (req, res) => {
  try {
    const alimentaciones = await Alimentacion.find();
    res.json(alimentaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Obtener alimentación por ID
router.get("/:id", async (req, res) => {
  try {
    const alimentacion = await Alimentacion.findById(req.params.id);
    if (!alimentacion) return res.status(404).json({ message: "No encontrada" });
    res.json(alimentacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 📌 Actualizar alimentación por ID
router.put("/:id", async (req, res) => {
  try {
    const alimentacion = await Alimentacion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!alimentacion) return res.status(404).json({ message: "No encontrada" });
    res.json(alimentacion);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 📌 Eliminar alimentación por ID
router.delete("/:id", async (req, res) => {
  try {
    const alimentacion = await Alimentacion.findByIdAndDelete(req.params.id);
    if (!alimentacion) return res.status(404).json({ message: "No encontrada" });
    res.json({ message: "Eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

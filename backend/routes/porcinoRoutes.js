const express = require("express");
const router = express.Router();
const porcinoController = require("../controllers/PorcinoController");

router.post("/", porcinoController.createPorcino);
router.get("/", porcinoController.obtenerPorcinos);
router.get("/:id", porcinoController.obtenerPorcinoPorId);
router.put("/:id", porcinoController.actualizarPorcino);
router.delete("/:id", porcinoController.eliminarPorcino);

module.exports = router;

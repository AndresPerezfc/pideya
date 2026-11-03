// Reportes para la administración de la cafetería.
// Relevo 2 (Datos), opcional.

const { Router } = require("express");
const { ventasDelDia } = require("../db/reportes");

const router = Router();

// GET /api/reportes/ventas
router.get("/ventas", (req, res) => {
  res.json(ventasDelDia());
});

module.exports = router;

// Reportes para la administración de la cafetería.
// Opcional en el relevo 2 (Datos).

const { Router } = require("express");

const router = Router();

// GET /api/reportes/ventas
router.get("/ventas", (req, res) => {
  res.status(501).json({ error: "El reporte de ventas todavía no existe (opcional en el relevo de Datos)." });
});

module.exports = router;

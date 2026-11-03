// GET /api/menu: lo que vende la cafetería hoy.
// Ya viene construida.

const { Router } = require("express");
const datos = require("../db/datos");

const router = Router();

router.get("/", (req, res) => {
  res.json(datos.obtenerMenu());
});

module.exports = router;

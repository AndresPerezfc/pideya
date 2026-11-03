// Pedidos de los estudiantes: POST /api/pedidos y GET /api/pedidos/:id (ver contrato.md).
// Se construye en el relevo 3 (Backend).

const { Router } = require("express");
const datos = require("../db/datos");

const router = Router();

// POST /api/pedidos: recibe un pedido nuevo.
router.post("/", (req, res) => {
  res.status(501).json({ error: "La cocina todavía no recibe pedidos. Se construye en el relevo de Backend." });
});

// GET /api/pedidos/:id: estado de un pedido.
router.get("/:id", (req, res) => {
  res.status(501).json({ error: "Todavía no se puede consultar un pedido. Se construye en el relevo de Backend." });
});

module.exports = router;

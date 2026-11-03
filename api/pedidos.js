// Pedidos de los estudiantes: POST /api/pedidos y GET /api/pedidos/:id (ver contrato.md).
// Relevo 3 (Backend).

const { Router } = require("express");
const datos = require("../db/datos");

const router = Router();

// POST /api/pedidos: recibe un pedido nuevo.
router.post("/", async (req, res) => {
  const { nombre, items } = req.body ?? {};

  if (typeof nombre !== "string" || nombre.trim() === "") {
    return res.status(400).json({ error: "Escribe tu nombre para hacer el pedido." });
  }
  if (!Array.isArray(items) || items.length < 1 || items.length > 5) {
    return res.status(400).json({ error: "Un pedido debe tener entre 1 y 5 productos." });
  }

  const pedido = await datos.crearPedido({ nombre: nombre.trim(), items });
  res.status(201).json(pedido);
});

// GET /api/pedidos/:id: estado de un pedido.
router.get("/:id", (req, res) => {
  const pedido = datos.obtenerPedido(Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: "Ese pedido no existe." });
  res.json(pedido);
});

module.exports = router;

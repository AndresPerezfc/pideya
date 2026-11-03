// Rutas de la cocina: ver pedidos pendientes y cambiarles el estado (ver contrato.md).
// Ya vienen construidas: las usa el tablero de cocina que se proyecta en el lanzamiento.
// Solo la cocina puede usarlas (middleware verificarClaveCocina).

const { Router } = require("express");
const datos = require("../db/datos");
const { verificarClaveCocina } = require("./middleware");

const router = Router();
router.use(verificarClaveCocina);

// Cada estado solo puede avanzar al siguiente.
const SIGUIENTE = { recibido: "preparando", preparando: "listo", listo: "entregado" };

// GET /api/cocina/pedidos
router.get("/pedidos", (req, res) => {
  res.json(datos.pedidosPendientes());
});

// PATCH /api/cocina/pedidos/:id/estado
router.patch("/pedidos/:id/estado", (req, res) => {
  const pedido = datos.obtenerPedido(Number(req.params.id));
  if (!pedido) return res.status(404).json({ error: "Ese pedido no existe." });

  const estado = req.body?.estado;
  if (SIGUIENTE[pedido.estado] !== estado) {
    return res.status(400).json({ error: `Un pedido "${pedido.estado}" solo puede pasar a "${SIGUIENTE[pedido.estado] ?? "ningún otro estado"}".` });
  }
  res.json(datos.cambiarEstado(pedido.id, estado));
});

module.exports = router;

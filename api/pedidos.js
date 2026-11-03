// Pedidos de los estudiantes: POST /api/pedidos y GET /api/pedidos/:id (ver contrato.md).
// Se construye en el relevo 3 (Backend).

const { Router } = require("express");
const datos = require("../db/datos");

const router = Router();

const MAXIMO_PRODUCTOS = 5;

// Revisa el pedido antes de mandarlo a la despensa.
// Devuelve un mensaje para el estudiante si algo viene mal, o null si todo está bien.
function revisarPedido(cuerpo) {
  if (!cuerpo || typeof cuerpo !== "object") return "El pedido viene vacío.";

  const { nombre, items } = cuerpo;
  if (typeof nombre !== "string" || nombre.trim() === "") return "Escribe tu nombre para hacer el pedido.";

  if (!Array.isArray(items) || items.length === 0) return "Agrega al menos un producto al pedido.";
  if (items.length > MAXIMO_PRODUCTOS) return `Puedes pedir máximo ${MAXIMO_PRODUCTOS} productos por pedido.`;

  for (const item of items) {
    if (!item || typeof item !== "object") return "Uno de los productos del pedido viene mal.";
    if (!Number.isInteger(item.productoId)) return "Uno de los productos del pedido no tiene identificador.";
    if (!Number.isInteger(item.cantidad) || item.cantidad < 1) return "La cantidad de cada producto debe ser 1 o más.";
    if (!Number.isInteger(item.precio) || item.precio < 0) return "Uno de los productos del pedido no tiene precio válido.";
  }

  return null;
}

// POST /api/pedidos: recibe un pedido nuevo.
router.post("/", async (req, res, next) => {
  const problema = revisarPedido(req.body);
  if (problema) return res.status(400).json({ error: problema });

  try {
    const { nombre, items } = req.body;
    const pedido = await datos.crearPedido({ nombre: nombre.trim(), items });
    res.status(201).json(pedido);
  } catch (err) {
    // Los errores de la despensa (sin stock, producto inexistente) los convierte server.js en 400.
    next(err);
  }
});

// GET /api/pedidos/:id: estado de un pedido, para la pantalla de espera del estudiante.
router.get("/:id", (req, res) => {
  const id = Number(req.params.id);
  const pedido = Number.isInteger(id) ? datos.obtenerPedido(id) : undefined;
  if (!pedido) return res.status(404).json({ error: "Ese pedido no existe. Revisa el número e intenta de nuevo." });
  res.json(pedido);
});

module.exports = router;

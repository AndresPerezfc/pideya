// La despensa: todas las funciones que leen o escriben en la base de datos.
// Relevo 2 (Datos). El backend (api/) usa estas funciones; nunca escribe SQL por su cuenta.

const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

const ARCHIVO_DB = process.env.PIDEYA_DB || path.join(__dirname, "..", "data", "pideya.db");
const BITACORA = path.join(__dirname, "..", "data", "bitacora.log");

if (ARCHIVO_DB !== ":memory:") fs.mkdirSync(path.dirname(ARCHIVO_DB), { recursive: true });
const db = new DatabaseSync(ARCHIVO_DB);
db.exec("PRAGMA foreign_keys = ON");

// Error de la despensa: el backend lo convierte en una respuesta 400 con este mensaje.
class ErrorDespensa extends Error {}

// Crea las tablas, aplica las migraciones pendientes y carga el menú. Se llama al arrancar.
function prepararDespensa() {
  db.exec(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));

  const carpeta = path.join(__dirname, "migraciones");
  const aplicadas = new Set(db.prepare("SELECT archivo FROM migraciones").all().map(m => m.archivo));
  const pendientes = fs.readdirSync(carpeta).filter(a => a.endsWith(".sql") && !aplicadas.has(a)).sort();
  for (const archivo of pendientes) {
    db.exec(fs.readFileSync(path.join(carpeta, archivo), "utf8"));
    db.prepare("INSERT INTO migraciones (archivo) VALUES (?)").run(archivo);
    console.log(`Migración aplicada: ${archivo}`);
  }

  db.exec(fs.readFileSync(path.join(__dirname, "seed.sql"), "utf8"));
}

function obtenerMenu() {
  return db.prepare("SELECT id, nombre, precio, stock FROM productos ORDER BY id").all();
}

function obtenerProducto(id) {
  return db.prepare("SELECT id, nombre, precio, stock FROM productos WHERE id = ?").get(id);
}

// Código de recogida: corto, para gritarlo en la cafetería (ej. MANGO-27).
function generarCodigo() {
  const palabras = ["TINTO", "AREPA", "MANGO", "COCO", "PANELA", "BOLLO", "GUAYABA", "LULO"];
  while (true) {
    const codigo = `${palabras[Math.floor(Math.random() * palabras.length)]}-${String(Math.floor(Math.random() * 100)).padStart(2, "0")}`;
    if (!db.prepare("SELECT 1 FROM pedidos WHERE codigo = ?").get(codigo)) return codigo;
  }
}

// La cocina lleva una bitácora en papel de todo lo que entra. Anotar tarda un momento.
async function anotarEnBitacora(nombre, items) {
  await new Promise(resolve => setTimeout(resolve, 150));
  const linea = `${new Date().toISOString()} ${nombre}: ${items.map(i => `${i.cantidad}x${i.productoId}`).join(", ")}\n`;
  if (ARCHIVO_DB !== ":memory:") fs.appendFileSync(BITACORA, linea);
}

// Guarda un pedido nuevo.
// items: [{ productoId, cantidad, precio }] tal como llegan en el pedido.
// Devuelve { id, codigo, total }.
async function crearPedido({ nombre, items }) {
  // 1. Revisar en la despensa que haya unidades de todo.
  for (const item of items) {
    const producto = obtenerProducto(item.productoId);
    if (!producto) throw new ErrorDespensa(`El producto ${item.productoId} no existe.`);
    if (producto.stock < item.cantidad) throw new ErrorDespensa(`No quedan suficientes unidades de ${producto.nombre}.`);
  }

  // 2. Anotar el pedido en la bitácora de la cocina.
  await anotarEnBitacora(nombre, items);

  // 3. Guardar el pedido, sus productos y descontar del inventario.
  const total = items.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
  const codigo = generarCodigo();
  const pedido = db.prepare("INSERT INTO pedidos (codigo, nombre, total) VALUES (?, ?, ?)").run(codigo, nombre, total);
  const id = Number(pedido.lastInsertRowid);
  for (const item of items) {
    db.prepare("INSERT INTO items_pedido (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)")
      .run(id, item.productoId, item.cantidad, item.precio);
    db.prepare("UPDATE productos SET stock = stock - ? WHERE id = ?").run(item.cantidad, item.productoId);
  }

  return { id, codigo, total };
}

// Un pedido con sus productos, o undefined si no existe.
function obtenerPedido(id) {
  const pedido = db.prepare("SELECT id, codigo, nombre, total, estado, creado_en FROM pedidos WHERE id = ?").get(id);
  if (!pedido) return undefined;
  pedido.items = db.prepare(`
    SELECT p.nombre, i.cantidad, i.precio_unitario
    FROM items_pedido i JOIN productos p ON p.id = i.producto_id
    WHERE i.pedido_id = ?`).all(id);
  return pedido;
}

// Pedidos que la cocina todavía no ha entregado, el más viejo primero.
function pedidosPendientes() {
  const ids = db.prepare("SELECT id FROM pedidos WHERE estado != 'entregado' ORDER BY id").all();
  return ids.map(p => obtenerPedido(p.id));
}

function cambiarEstado(id, estado) {
  db.prepare("UPDATE pedidos SET estado = ? WHERE id = ?").run(estado, id);
  return obtenerPedido(id);
}

module.exports = {
  db,
  ErrorDespensa,
  prepararDespensa,
  obtenerMenu,
  obtenerProducto,
  generarCodigo,
  crearPedido,
  obtenerPedido,
  pedidosPendientes,
  cambiarEstado,
};

// Reportes de ventas para la administración de la cafetería.
// Relevo 2 (Datos), opcional.

const { db } = require("./datos");

// Unidades vendidas hoy de cada producto, de mayor a menor.
function ventasDelDia() {
  return db.prepare(`
    SELECT p.nombre, SUM(i.cantidad) AS unidades
    FROM items_pedido i
    JOIN pedidos ped ON ped.id = i.pedido_id
    JOIN productos p ON p.id = i.producto_id
    WHERE date(ped.creado_en) = date('now', 'localtime')
    GROUP BY p.id
    ORDER BY unidades DESC`).all();
}

module.exports = { ventasDelDia };

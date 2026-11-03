-- La despensa de PideYa: qué cuadernos (tablas) existen y qué se anota en cada uno.
-- Relevo 2 (Datos).
-- Para cambiar una tabla que ya existe no se edita este archivo: se crea una
-- migración nueva en db/migraciones/ (ver db/migraciones/LEEME.md).

-- Cuaderno de productos: lo que vende la cafetería y cuántas unidades quedan.
CREATE TABLE IF NOT EXISTS productos (
  id      INTEGER PRIMARY KEY,
  nombre  TEXT    NOT NULL,
  precio  INTEGER NOT NULL,           -- en pesos colombianos, sin decimales
  stock   INTEGER NOT NULL DEFAULT 0  -- unidades disponibles hoy
);

-- Cuaderno de pedidos: uno por cada pedido que hace un estudiante.
CREATE TABLE IF NOT EXISTS pedidos (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo    TEXT    NOT NULL UNIQUE,              -- código de recogida que se grita en la cafetería
  nombre    TEXT    NOT NULL,                     -- nombre de quien pidió
  total     INTEGER NOT NULL,
  estado    TEXT    NOT NULL DEFAULT 'recibido',  -- recibido, preparando, listo, entregado
  creado_en TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- Cuaderno de detalle: qué productos lleva cada pedido.
CREATE TABLE IF NOT EXISTS items_pedido (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  pedido_id       INTEGER NOT NULL REFERENCES pedidos(id),
  producto_id     INTEGER NOT NULL REFERENCES productos(id),
  cantidad        INTEGER NOT NULL,
  precio_unitario INTEGER NOT NULL
);

-- Registro de migraciones ya aplicadas (lo usa db/datos.js).
CREATE TABLE IF NOT EXISTS migraciones (
  archivo     TEXT PRIMARY KEY,
  aplicada_en TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
);

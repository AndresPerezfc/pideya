-- Menú de la cafetería. Se carga cada vez que arranca el servidor (npm start).
-- Relevo 2 (Datos).
--
-- Cada producto se escribe con INSERT ... ON CONFLICT para que, al reiniciar,
-- se actualicen nombre, precio y unidades sin borrar los pedidos que ya existen.
-- Formato: (id, nombre, precio en pesos, unidades disponibles)

INSERT INTO productos (id, nombre, precio, stock) VALUES
  (1, 'Café de ejemplo',    1000, 50),
  (2, 'Pan de ejemplo',     2000, 50),
  (3, 'Galleta de ejemplo', 1500, 50)
ON CONFLICT(id) DO UPDATE SET
  nombre = excluded.nombre,
  precio = excluded.precio,
  stock  = excluded.stock;

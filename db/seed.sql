-- Menú de la cafetería. Se carga cada vez que arranca el servidor (npm start).
-- Relevo 2 (Datos).
--
-- Cada producto se escribe con INSERT ... ON CONFLICT para que, al reiniciar,
-- se actualicen nombre, precio y unidades sin borrar los pedidos que ya existen.
-- Formato: (id, nombre, precio en pesos, unidades disponibles)

INSERT INTO productos (id, nombre, precio, stock) VALUES
  (1, 'Tinto',            1500, 100),
  (2, 'Empanada',         3500, 10),
  (3, 'Arepa con queso',  4000, 30),
  (4, 'Jugo natural',     3000, 40),
  (5, 'Pastel de pollo',  3800, 20),
  (6, 'Agua',             2000, 50)
ON CONFLICT(id) DO UPDATE SET
  nombre = excluded.nombre,
  precio = excluded.precio,
  stock  = excluded.stock;

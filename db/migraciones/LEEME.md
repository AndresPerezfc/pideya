# Migraciones

Una migración es un cambio a la despensa que ya existe: agregar una columna, una tabla nueva, un índice.

- Cada migración es un archivo `.sql` en esta carpeta.
- El nombre empieza por un número para que se apliquen en orden: `001_algo.sql`, `002_otra_cosa.sql`.
- Al arrancar el servidor, `db/datos.js` aplica las que falten y las anota en la tabla `migraciones`. Cada una se aplica una sola vez.
- Una migración ya aplicada no se edita: si hay que corregir algo, se crea otra.

Ejemplo, `001_ejemplo.sql`:

```sql
ALTER TABLE productos ADD COLUMN descripcion TEXT;
```

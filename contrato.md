# Contrato de la API de PideYa

**Versión 1.0**

La comanda de la empresa: así se hablan el frontend (el mesero) y el backend (la cocina). Si algo no está aquí, no existe. Si hay que cambiarlo, se cambia primero este archivo.

## Acuerdos

| Tema | Acuerdo |
|---|---|
| Datos de un pedido | El nombre de quien pide y sus productos (entre 1 y 5) |
| Código de recogida | Una palabra y dos números, para gritarlo en la cafetería: `MANGO-27` |
| Estados del pedido | `recibido → preparando → listo → entregado` |
| Producto agotado | Si no quedan unidades, el pedido se rechaza con un mensaje claro |
| Pago | En caja, al recoger. La app no cobra |

## Reglas generales

- Todo va y vuelve en JSON.
- Los precios son números enteros en pesos colombianos: `3500`, no `"$3.500"`.
- Cuando algo sale mal, la respuesta trae un mensaje para mostrar a la persona: `{ "error": "No quedan suficientes unidades de Empanada." }`
- Códigos de respuesta:
  - `200` todo bien · `201` se creó algo nuevo
  - `400` el pedido viene mal (faltan datos, son inválidos o no hay unidades)
  - `401` no tienes permiso · `404` no existe · `501` todavía no está construido

## Rutas

### `GET /api/menu`

Lo que vende la cafetería hoy.

```json
[
  { "id": 2, "nombre": "Empanada", "precio": 3500, "stock": 10 }
]
```

Un producto con `stock` en `0` está agotado.

### `POST /api/pedidos`

Un estudiante hace un pedido.

Envía:

```json
{
  "nombre": "Valentina",
  "items": [
    { "productoId": 2, "cantidad": 2, "precio": 3500 },
    { "productoId": 1, "cantidad": 1, "precio": 1500 }
  ]
}
```

- `nombre`: obligatorio.
- `items`: entre 1 y 5 productos.

Responde `201`:

```json
{ "id": 7, "codigo": "MANGO-27", "total": 8500 }
```

### `GET /api/pedidos/:id`

El estado de un pedido, para la pantalla de espera del estudiante.

Responde `200`:

```json
{
  "id": 7,
  "codigo": "MANGO-27",
  "nombre": "Valentina",
  "total": 8500,
  "estado": "preparando",
  "creado_en": "2026-11-12 11:58:03",
  "items": [
    { "nombre": "Empanada", "cantidad": 2, "precio_unitario": 3500 },
    { "nombre": "Tinto", "cantidad": 1, "precio_unitario": 1500 }
  ]
}
```

### `GET /api/cocina/pedidos` (solo cocina)

Pedidos que no se han entregado, el más viejo primero. Mismo formato que `GET /api/pedidos/:id`, en una lista.

Requiere el encabezado `X-Clave-Cocina` con la clave de la cocina. Sin ella: `401`.

### `PATCH /api/cocina/pedidos/:id/estado` (solo cocina)

Envía:

```json
{ "estado": "listo" }
```

Los estados avanzan en orden: `recibido → preparando → listo → entregado`. No se puede saltar ni devolver un estado (`400`).

Requiere el encabezado `X-Clave-Cocina`.

### `GET /api/reportes/ventas`

Unidades vendidas hoy por producto, de mayor a menor.

```json
[
  { "nombre": "Empanada", "unidades": 10 }
]
```

### `GET /api/health`

Para el monitor de la consola del taller. Responde `{ "ok": true, ... }`.

## Historial de versiones

| Versión | Cambio |
|---|---|
| 1.0 | Primera versión del contrato |

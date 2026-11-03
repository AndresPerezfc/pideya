// Pruebas básicas: si fallan, producción no debería recibir el cambio.
// Corren solas en GitHub en cada Pull Request.

process.env.PIDEYA_DB = ":memory:";
process.env.CLAVE_COCINA = "clave-de-prueba";

const { test, before, after } = require("node:test");
const assert = require("node:assert");
const app = require("../server");

let servidor, base;

before(async () => {
  servidor = app.listen(0);
  await new Promise(resolve => servidor.once("listening", resolve));
  base = `http://localhost:${servidor.address().port}`;
});

after(() => servidor.close());

test("el servidor responde que está en línea", async () => {
  const r = await fetch(`${base}/api/health`);
  assert.strictEqual(r.status, 200);
  assert.strictEqual(r.headers.get("access-control-allow-origin"), "*");
  assert.strictEqual((await r.json()).ok, true);
});

test("el menú trae productos con nombre, precio y unidades", async () => {
  const r = await fetch(`${base}/api/menu`);
  assert.strictEqual(r.status, 200);
  const menu = await r.json();
  assert.ok(Array.isArray(menu) && menu.length > 0, "el menú no debería estar vacío");
  for (const producto of menu) {
    assert.strictEqual(typeof producto.id, "number");
    assert.strictEqual(typeof producto.nombre, "string");
    assert.strictEqual(typeof producto.precio, "number");
    assert.strictEqual(typeof producto.stock, "number");
  }
});

test("la cocina no abre sin la clave", async () => {
  const r = await fetch(`${base}/api/cocina/pedidos`);
  assert.notStrictEqual(r.status, 200);
});

test("se sirven la app, la cocina y el probador", async () => {
  for (const ruta of ["/", "/cocina/", "/probador.html"]) {
    const r = await fetch(base + ruta);
    assert.strictEqual(r.status, 200, `${ruta} debería abrir`);
  }
});

test("con la clave, la cocina ve los pedidos pendientes", async () => {
  const r = await fetch(`${base}/api/cocina/pedidos`, { headers: { "X-Clave-Cocina": "clave-de-prueba" } });
  assert.strictEqual(r.status, 200);
  assert.ok(Array.isArray(await r.json()));
});

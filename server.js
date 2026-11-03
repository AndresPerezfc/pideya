// Servidor de PideYa: une el mesero (public/), la cocina (api/) y la despensa (db/).
// Ya viene construido.

const path = require("node:path");
const { execSync } = require("node:child_process");
const express = require("express");

try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  // Sin archivo .env: se usan las variables del sistema.
}

const datos = require("./db/datos");
const { registro } = require("./api/middleware");

let version = "local";
try {
  version = execSync("git rev-parse --short HEAD", { cwd: __dirname, stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
} catch {}

datos.prepararDespensa();

const app = express();
app.use(express.json());
app.use("/api", registro);

// Salud: la consola del taller pregunta aquí cada 10 segundos si producción está en línea.
app.get("/api/health", (req, res) => {
  res.set("Access-Control-Allow-Origin", "*");
  res.json({ ok: true, servicio: "PideYa", version, hora: new Date().toISOString() });
});

app.use("/api/menu", require("./api/menu"));
app.use("/api/pedidos", require("./api/pedidos"));
app.use("/api/cocina", require("./api/cocina"));
app.use("/api/reportes", require("./api/reportes"));

app.use("/api", (req, res) => {
  res.status(404).json({ error: `No existe la ruta ${req.method} ${req.originalUrl}` });
});

// Errores: los de la despensa son culpa del pedido (400); el resto, del servidor (500).
app.use((err, req, res, next) => {
  if (err instanceof datos.ErrorDespensa) return res.status(400).json({ error: err.message });
  if (err.type === "entity.parse.failed") return res.status(400).json({ error: "El cuerpo de la solicitud no es JSON válido." });
  console.error(err);
  res.status(500).json({ error: "Algo falló en el servidor. Revisa la terminal." });
});

app.use(express.static(path.join(__dirname, "public")));

module.exports = app;

if (require.main === module) {
  const puerto = Number(process.env.PORT) || 3000;
  app.listen(puerto, () => {
    console.log(`PideYa está abierto en http://localhost:${puerto} (versión ${version})`);
    console.log(`Probador de la API: http://localhost:${puerto}/probador.html`);
  });
}

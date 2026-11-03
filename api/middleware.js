// Middleware: lo que revisa cada solicitud antes de que llegue a la cocina.
// Ya viene construido.

// Deja pasar solo a quien envía la clave de la cocina en el encabezado X-Clave-Cocina.
function verificarClaveCocina(req, res, next) {
  const clave = process.env.CLAVE_COCINA;
  if (!clave) {
    return res.status(500).json({ error: "El servidor no tiene CLAVE_COCINA configurada en el archivo .env." });
  }
  if (req.get("X-Clave-Cocina") !== clave) {
    return res.status(401).json({ error: "Solo la cocina puede hacer esto." });
  }
  next();
}

// Escribe en la terminal cada solicitud que llega a la API.
function registro(req, res, next) {
  const inicio = Date.now();
  res.on("finish", () => {
    console.log(`${req.method} ${req.originalUrl} → ${res.statusCode} (${Date.now() - inicio} ms)`);
  });
  next();
}

module.exports = { verificarClaveCocina, registro };

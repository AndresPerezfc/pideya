// App del estudiante: menú, carrito y estado del pedido.
// Relevo 1 (Frontend).

// Habla con la API y devuelve la respuesta ya convertida desde JSON.
// Si la API responde con error, lanza un Error con el mensaje que mandó el servidor.
async function api(ruta, opciones = {}) {
  const respuesta = await fetch(ruta, {
    ...opciones,
    headers: { "Content-Type": "application/json", ...(opciones.headers || {}) },
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || `Error ${respuesta.status}`);
  return datos;
}

// Formato de pesos colombianos: 3500 → "$3.500"
function pesos(valor) {
  return "$" + Number(valor).toLocaleString("es-CO");
}

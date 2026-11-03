// Tablero de la cocina: ya viene construido.

// Conexión con la cocina: todas las rutas /api/cocina/... piden esta clave.
const CLAVE_COCINA = "tintico-2026";

async function apiCocina(ruta, opciones = {}) {
  const respuesta = await fetch("/api/cocina" + ruta, {
    ...opciones,
    headers: { "Content-Type": "application/json", "X-Clave-Cocina": CLAVE_COCINA, ...(opciones.headers || {}) },
  });
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw new Error(datos.error || `Error ${respuesta.status}`);
  return datos;
}

const COLUMNAS = [
  { estado: "recibido", titulo: "Recibidos", boton: "Preparar" },
  { estado: "preparando", titulo: "Preparando", boton: "Está listo" },
  { estado: "listo", titulo: "Listos para recoger", boton: "Entregado" },
];
const SIGUIENTE = { recibido: "preparando", preparando: "listo", listo: "entregado" };

const tablero = document.getElementById("tablero");
let ultimo = "";

async function pintar() {
  let pedidos;
  try {
    pedidos = await apiCocina("/pedidos");
  } catch (error) {
    tablero.innerHTML = `<p class="estado-aviso">${error.message}</p>`;
    ultimo = "";
    return;
  }

  // Solo se vuelve a dibujar si algo cambió.
  const huella = JSON.stringify(pedidos);
  if (huella === ultimo) return;
  ultimo = huella;

  tablero.innerHTML = COLUMNAS.map(columna => {
    const lista = pedidos.filter(p => p.estado === columna.estado);
    return `
      <section class="columna">
        <h2>${columna.titulo} <span>${lista.length}</span></h2>
        ${lista.map(p => `
          <article class="comanda">
            <div class="codigo">${p.codigo}</div>
            <div class="nombre">${p.nombre}</div>
            <ul>${p.items.map(i => `<li>${i.cantidad} × ${i.nombre}</li>`).join("")}</ul>
            <button data-id="${p.id}" data-estado="${SIGUIENTE[p.estado]}">${columna.boton}</button>
          </article>`).join("")}
      </section>`;
  }).join("");
  document.getElementById("actualizado").textContent = "Actualizado " + new Date().toLocaleTimeString("es-CO");
}

tablero.addEventListener("click", async evento => {
  const boton = evento.target.closest("button[data-id]");
  if (!boton) return;
  boton.disabled = true;
  try {
    await apiCocina(`/pedidos/${boton.dataset.id}/estado`, {
      method: "PATCH",
      body: JSON.stringify({ estado: boton.dataset.estado }),
    });
  } catch (error) {
    alert(error.message);
  }
  pintar();
});

pintar();
setInterval(pintar, 3000);

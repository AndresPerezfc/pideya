// App del estudiante: menú, carrito y estado del pedido.
// Relevo 1 (Frontend).

const MAXIMO = 5;
const ESTADOS = {
  recibido: "Recibimos tu pedido",
  preparando: "Lo están preparando",
  listo: "¡Está listo! Acércate a la caja",
  entregado: "Entregado. ¡Buen provecho!",
};

let menu = [];
const carrito = new Map(); // productoId → cantidad
let seguimiento = null;

const $ = selector => document.querySelector(selector);

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

function crear(etiqueta, clase, texto) {
  const elemento = document.createElement(etiqueta);
  if (clase) elemento.className = clase;
  if (texto !== undefined) elemento.textContent = texto;
  return elemento;
}

const unidades = () => [...carrito.values()].reduce((suma, n) => suma + n, 0);
const total = () => [...carrito].reduce((suma, [id, n]) => suma + menu.find(p => p.id === id).precio * n, 0);

async function cargarMenu() {
  try {
    menu = await api("/api/menu");
    pintarMenu();
  } catch (error) {
    $("#menu").textContent = "No se pudo cargar el menú: " + error.message;
  }
}

function pintarMenu() {
  const lista = $("#menu");
  lista.replaceChildren();
  for (const producto of menu) {
    const enCarrito = carrito.get(producto.id) || 0;
    const agotado = producto.stock <= 0;
    const tarjeta = crear("article", "producto" + (agotado ? " agotado" : ""));
    const info = crear("div", "info");
    info.append(crear("h3", "", producto.nombre), crear("p", "precio", agotado ? "Agotado" : pesos(producto.precio)));
    tarjeta.append(info);

    if (!agotado) {
      const acciones = crear("div", "acciones");
      if (enCarrito > 0) {
        const quitar = crear("button", "secundario", "−");
        quitar.setAttribute("aria-label", `Quitar ${producto.nombre}`);
        quitar.onclick = () => cambiar(producto.id, -1);
        acciones.append(quitar, crear("span", "contador", enCarrito));
      }
      const agregar = crear("button", "", enCarrito > 0 ? "+" : "Agregar");
      agregar.setAttribute("aria-label", `Agregar ${producto.nombre}`);
      agregar.disabled = unidades() >= MAXIMO || enCarrito >= producto.stock;
      agregar.onclick = () => cambiar(producto.id, 1);
      acciones.append(agregar);
      tarjeta.append(acciones);
    }
    lista.append(tarjeta);
  }
  pintarCarrito();
}

function cambiar(id, cuanto) {
  const nueva = (carrito.get(id) || 0) + cuanto;
  if (nueva <= 0) carrito.delete(id);
  else carrito.set(id, nueva);
  $("#error").hidden = true;
  pintarMenu();
}

function pintarCarrito() {
  const n = unidades();
  $("#carrito").hidden = n === 0;
  $("#cantidad").textContent = `${n} ${n === 1 ? "producto" : "productos"}${n >= MAXIMO ? " (máximo)" : ""}`;
  $("#total").textContent = pesos(total());
}

function mostrarError(mensaje) {
  $("#error").textContent = mensaje;
  $("#error").hidden = false;
}

async function pedir() {
  const nombre = $("#nombre").value.trim();
  if (!nombre) return mostrarError("Escribe tu nombre para que te llamen cuando esté listo.");

  const items = [...carrito].map(([productoId, cantidad]) => ({
    productoId,
    cantidad,
    precio: menu.find(p => p.id === productoId).precio,
  }));

  $("#pedir").disabled = true;
  try {
    const pedido = await api("/api/pedidos", { method: "POST", body: JSON.stringify({ nombre, items }) });
    mostrarPedido(pedido);
  } catch (error) {
    mostrarError(error.message);
  } finally {
    $("#pedir").disabled = false;
  }
}

function mostrarPedido(pedido) {
  $("#vista-menu").hidden = true;
  $("#carrito").hidden = true;
  $("#vista-pedido").hidden = false;
  $("#codigo").textContent = pedido.codigo;
  $("#estado").textContent = ESTADOS.recibido;

  const actualizar = async () => {
    try {
      const actual = await api(`/api/pedidos/${pedido.id}`);
      $("#estado").textContent = ESTADOS[actual.estado] || actual.estado;
      $("#estado").dataset.estado = actual.estado;
    } catch (error) {
      $("#estado").textContent = "No pudimos consultar tu pedido: " + error.message;
    }
  };
  actualizar();
  seguimiento = setInterval(actualizar, 5000);
}

$("#pedir").onclick = pedir;
$("#nuevo").onclick = () => {
  clearInterval(seguimiento);
  carrito.clear();
  $("#vista-pedido").hidden = true;
  $("#vista-menu").hidden = false;
  cargarMenu();
};

cargarMenu();

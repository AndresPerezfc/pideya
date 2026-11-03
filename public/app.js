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

// ---------- Estado de la app ----------

const MAXIMO_PRODUCTOS = 5;          // El contrato permite entre 1 y 5 productos por pedido.
const CADA_CUANTO_CONSULTAR = 5000;  // Cada 5 segundos se pregunta cómo va el pedido.
const ESTADOS = ["recibido", "preparando", "listo", "entregado"];

let menu = [];        // Lo que vende la cafetería hoy (viene de GET /api/menu).
let carrito = [];     // Lo que el estudiante lleva: { productoId, nombre, precio, cantidad }
let pedidoActual = null;   // El pedido que se acaba de enviar: { id, codigo, ... }
let temporizador = null;   // El reloj que consulta el estado cada 5 segundos.

// ---------- Elementos de la pantalla ----------

const pantallaMenu = document.getElementById("pantalla-menu");
const pantallaPedido = document.getElementById("pantalla-pedido");
const elCarrito = document.getElementById("carrito");

const elMenu = document.getElementById("menu");
const elCantidad = document.getElementById("carrito-cantidad");
const elTotal = document.getElementById("carrito-total");
const elAviso = document.getElementById("carrito-aviso");
const elError = document.getElementById("carrito-error");
const btnVaciar = document.getElementById("carrito-vaciar");

const formulario = document.getElementById("formulario-pedido");
const inputNombre = document.getElementById("nombre");
const btnPedir = document.getElementById("boton-pedir");

const elPedidoNombre = document.getElementById("pedido-nombre");
const elPedidoCodigo = document.getElementById("pedido-codigo");
const elPedidoEstados = document.getElementById("pedido-estados");
const elPedidoEstadoTexto = document.getElementById("pedido-estado-texto");
const elPedidoItems = document.getElementById("pedido-items");
const elPedidoTotal = document.getElementById("pedido-total");
const elPedidoAviso = document.getElementById("pedido-aviso");
const btnOtroPedido = document.getElementById("pedido-otro");

// ---------- Carrito ----------

function cantidadEnCarrito() {
  return carrito.reduce((suma, item) => suma + item.cantidad, 0);
}

function totalCarrito() {
  return carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);
}

function cuantosLlevo(productoId) {
  const item = carrito.find((i) => i.productoId === productoId);
  return item ? item.cantidad : 0;
}

function agregarAlCarrito(producto) {
  if (cantidadEnCarrito() >= MAXIMO_PRODUCTOS) return;
  if (cuantosLlevo(producto.id) >= producto.stock) return;

  const existente = carrito.find((i) => i.productoId === producto.id);
  if (existente) {
    existente.cantidad += 1;
  } else {
    carrito.push({ productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: 1 });
  }
  ocultarError();
  pintarCarrito();
  pintarMenu();
}

function vaciarCarrito() {
  carrito = [];
  ocultarError();
  pintarCarrito();
  pintarMenu();
}

function pintarCarrito() {
  const cantidad = cantidadEnCarrito();
  elCantidad.textContent = cantidad === 1 ? "1 producto" : `${cantidad} productos`;
  elTotal.textContent = pesos(totalCarrito());
  btnVaciar.hidden = cantidad === 0;
  btnPedir.disabled = cantidad === 0;

  if (cantidad >= MAXIMO_PRODUCTOS) {
    elAviso.textContent = `Máximo ${MAXIMO_PRODUCTOS} productos por pedido`;
  } else if (cantidad === 0) {
    elAviso.textContent = "Tu carrito está vacío";
  } else {
    elAviso.textContent = `Puedes agregar ${MAXIMO_PRODUCTOS - cantidad} más`;
  }
}

function mostrarError(mensaje) {
  elError.textContent = mensaje;
  elError.hidden = false;
}

function ocultarError() {
  elError.hidden = true;
  elError.textContent = "";
}

// ---------- Menú ----------

function crearTarjeta(producto) {
  const agotado = producto.stock === 0;
  const llevo = cuantosLlevo(producto.id);
  const llenoElCarrito = cantidadEnCarrito() >= MAXIMO_PRODUCTOS;
  const sinMasUnidades = llevo >= producto.stock;

  const tarjeta = document.createElement("article");
  tarjeta.className = "tarjeta" + (agotado ? " agotado" : "");

  const info = document.createElement("div");
  info.className = "tarjeta-info";

  const nombre = document.createElement("h3");
  nombre.className = "tarjeta-nombre";
  nombre.textContent = producto.nombre;

  const precio = document.createElement("p");
  precio.className = "tarjeta-precio";
  precio.textContent = pesos(producto.precio);

  info.append(nombre, precio);
  tarjeta.append(info);

  if (agotado) {
    const etiqueta = document.createElement("span");
    etiqueta.className = "etiqueta-agotado";
    etiqueta.textContent = "Agotado";
    tarjeta.append(etiqueta);
    return tarjeta;
  }

  const acciones = document.createElement("div");
  acciones.className = "tarjeta-acciones";

  if (llevo > 0) {
    const contador = document.createElement("span");
    contador.className = "contador";
    contador.textContent = `×${llevo}`;
    acciones.append(contador);
  }

  const boton = document.createElement("button");
  boton.type = "button";
  boton.textContent = "Agregar";
  boton.disabled = llenoElCarrito || sinMasUnidades;
  boton.addEventListener("click", () => agregarAlCarrito(producto));
  acciones.append(boton);

  tarjeta.append(acciones);
  return tarjeta;
}

function pintarMenu() {
  elMenu.innerHTML = "";
  elMenu.className = "menu";

  if (menu.length === 0) {
    elMenu.className = "aviso";
    elMenu.textContent = "Hoy no hay productos en el menú.";
    return;
  }

  for (const producto of menu) {
    elMenu.append(crearTarjeta(producto));
  }
}

async function cargarMenu() {
  try {
    menu = await api("/api/menu");
    pintarMenu();
  } catch (error) {
    elMenu.className = "aviso error";
    elMenu.textContent = "No pudimos cargar el menú: " + error.message;
  }
}

// ---------- Enviar el pedido ----------

async function enviarPedido(evento) {
  evento.preventDefault();
  ocultarError();

  const nombre = inputNombre.value.trim();
  if (!nombre) {
    mostrarError("Escribe tu nombre para poder pedir.");
    inputNombre.focus();
    return;
  }
  if (carrito.length === 0) {
    mostrarError("Agrega al menos un producto.");
    return;
  }

  // Lo que pide el contrato: nombre + items con productoId, cantidad y precio.
  const cuerpo = {
    nombre,
    items: carrito.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
      precio: item.precio,
    })),
  };

  btnPedir.disabled = true;
  btnPedir.textContent = "Enviando…";

  try {
    const respuesta = await api("/api/pedidos", { method: "POST", body: JSON.stringify(cuerpo) });
    mostrarPantallaPedido(respuesta, nombre);
  } catch (error) {
    mostrarError(error.message);
  } finally {
    btnPedir.textContent = "Pedir";
    btnPedir.disabled = carrito.length === 0;
  }
}

// ---------- Pantalla de espera del pedido ----------

function mostrarPantallaPedido(respuesta, nombre) {
  pedidoActual = { id: respuesta.id, codigo: respuesta.codigo, total: respuesta.total, nombre };

  elPedidoNombre.textContent = nombre;
  elPedidoCodigo.textContent = respuesta.codigo;
  elPedidoTotal.textContent = pesos(respuesta.total);
  elPedidoAviso.textContent = "";

  // Mientras el servidor nos cuenta más, mostramos lo que ya sabemos del carrito.
  pintarItemsPedido(carrito.map((i) => ({ nombre: i.nombre, cantidad: i.cantidad, precio_unitario: i.precio })));
  pintarEstado("recibido");

  pantallaMenu.hidden = true;
  elCarrito.hidden = true;
  pantallaPedido.hidden = false;
  window.scrollTo(0, 0);

  consultarEstado();
  temporizador = setInterval(consultarEstado, CADA_CUANTO_CONSULTAR);
}

function pintarItemsPedido(items) {
  elPedidoItems.innerHTML = "";
  for (const item of items) {
    const li = document.createElement("li");
    const texto = document.createElement("span");
    texto.textContent = `${item.cantidad} × ${item.nombre}`;
    const precio = document.createElement("span");
    precio.textContent = pesos(item.precio_unitario * item.cantidad);
    li.append(texto, precio);
    elPedidoItems.append(li);
  }
}

const TEXTO_ESTADO = {
  recibido: "La cafetería ya recibió tu pedido.",
  preparando: "Lo están preparando. ¡Ya casi!",
  listo: "¡Está listo! Pasa a recogerlo y paga en caja.",
  entregado: "Pedido entregado. ¡Buen provecho!",
};

function pintarEstado(estado) {
  const posicion = ESTADOS.indexOf(estado);
  for (const li of elPedidoEstados.children) {
    const suPosicion = ESTADOS.indexOf(li.dataset.estado);
    li.classList.toggle("hecho", suPosicion < posicion);
    li.classList.toggle("actual", suPosicion === posicion);
  }
  elPedidoEstadoTexto.textContent = TEXTO_ESTADO[estado] || `Estado: ${estado}`;
  pantallaPedido.classList.toggle("pedido-listo", estado === "listo");
}

async function consultarEstado() {
  if (!pedidoActual) return;
  try {
    const pedido = await api(`/api/pedidos/${pedidoActual.id}`);
    pintarEstado(pedido.estado);
    if (Array.isArray(pedido.items)) pintarItemsPedido(pedido.items);
    if (pedido.total !== undefined) elPedidoTotal.textContent = pesos(pedido.total);
    elPedidoAviso.textContent = "";

    if (pedido.estado === "entregado") detenerConsulta();
  } catch (error) {
    // No cambiamos de pantalla: el código sigue siendo válido. Solo avisamos.
    elPedidoAviso.textContent = "No pudimos actualizar el estado: " + error.message;
  }
}

function detenerConsulta() {
  if (temporizador) clearInterval(temporizador);
  temporizador = null;
}

function hacerOtroPedido() {
  detenerConsulta();
  pedidoActual = null;
  carrito = []; // El nombre se queda escrito para no volver a pedirlo.

  pantallaPedido.hidden = true;
  pantallaMenu.hidden = false;
  elCarrito.hidden = false;

  pintarCarrito();
  cargarMenu(); // El stock pudo cambiar: volvemos a pedir el menú.
  window.scrollTo(0, 0);
}

// ---------- Arranque ----------

btnVaciar.addEventListener("click", vaciarCarrito);
formulario.addEventListener("submit", enviarPedido);
btnOtroPedido.addEventListener("click", hacerOtroPedido);
pintarCarrito();
cargarMenu();

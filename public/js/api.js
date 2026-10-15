// api.js: el puente entre el front y el backend.
// Todas las llamadas a la API pasan por acá, así si cambia la dirección se modifica en un solo lugar.

// Si la página la sirve Express (puerto 3000), se usan rutas relativas: mismo origen, no hace falta CORS.
// Si se abre con Live Server (5500 o 5501), se apunta al backend en el 3000 y ahí CORS tiene que autorizarlo.
const BACKEND_PORT = 3000;
const API_URL = location.port === String(BACKEND_PORT) ? "" : `http://localhost:${BACKEND_PORT}`;

console.log("API_URL =", API_URL || "(mismo origen)");

// GET /productos?disponible=true : trae solo los productos que tienen stock
async function obtenerProductos() {
  const respuesta = await fetch(`${API_URL}/productos?disponible=true`);

  if (!respuesta.ok) {
    throw new Error(`Error ${respuesta.status} al pedir los productos`);
  }
  return respuesta.json();
}


// POST /usuarios/login : valida email y contraseña en el backend.
// Si son correctos devuelve el usuario (con su id, sin la contraseña). Si no, lanza un error con el mensaje del backend.
async function iniciarSesion(email, contraseña) {
  const respuesta = await fetch(`${API_URL}/usuarios/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },      // avisamos que el body va en JSON
    body: JSON.stringify({ email, contraseña })            // el backend espera estos dos campos
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje);                        // por ejemplo: "Email o contraseña incorrectos"
  }
  return datos.usuario;                                    // { id, nombre, apellido, email, activo }
}

// POST /usuarios : crea un usuario nuevo en el backend (registro).
// datos = { nombre, apellido, email, contraseña }. Devuelve el usuario creado (con su id, sin la contraseña).
async function registrarUsuario(datos) {
  const respuesta = await fetch(`${API_URL}/usuarios`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  });

  const respuestaJson = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(respuestaJson.mensaje);                // por ejemplo: "El email ya está en uso"
  }
  return respuestaJson.usuario;
}

// POST /ventas : registra la compra en el backend.
// venta = { id_usuario, direccion, productos: [ { id_producto, cantidad }, ... ] }
// El backend valida el stock, calcula el total y descuenta las unidades.
async function crearVenta(venta) {
  const respuesta = await fetch(`${API_URL}/ventas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(venta)
  });

  const datos = await respuesta.json();

  if (!respuesta.ok) {
    throw new Error(datos.mensaje);                        // por ejemplo: "Stock insuficiente para ..."
  }
  return datos.venta;                                      // { id, id_usuario, fecha, direccion, total, productos }
}
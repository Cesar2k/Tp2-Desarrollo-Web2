// es el puente entre el front y el backend.
// Todas las llamadas a la API pasan por acá, así si cambia la dirección se modifica en un solo lugar.

// Si la página la sirve Express (puerto 3000), se usan rutas relativas: mismo origen, no hace falta CORS.
// Si se abre con Live Server (5500 o 5501), se apunta al backend en el 3000 y ahí CORS tiene qu

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
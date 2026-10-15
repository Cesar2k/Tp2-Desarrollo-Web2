// Navbar dinámico con login y logout. ademas de rutas adaptativas segun la ubicacion del archivo.

// nos fiamos si estamos dentro de la carpeta /pages/
const navEnPages = window.location.pathname.includes("/pages/");

// Rutas base. para ver si estamos en el luigar correcto
const baseHome  = navEnPages ? "../index.html" : "./index.html";
const baseImg   = navEnPages ? "../img/" : "./img/";
const basePages = navEnPages ? "./" : "./pages/";

// Ítems del menú
const NavItems = [
  { titulo: "Home", url: baseHome },
  { titulo: "Productos", url: basePages + "productos.html" },   // una sola pagina con todos los productos y filtro por categoria
  { titulo: "Ingreso", url: basePages + "login.html" },
  { titulo: "Registro", url: basePages + "registrarse.html" },
  { titulo: "Cerrar sesión", url: "#", accion: "logout()" }
];

// Crear navbar dinamico
function CrearNavBar() {
  const header = document.querySelector("header");
  if (!header) return;

  const usuario = obtenerUsuarioSesion();                   // el usuario guardado en sessionStorage (o null si no hay sesion)

  // Items del menú sin login/registro cuando hay usuario
  const items = usuario
    ? NavItems.filter(i => i.titulo !== "Ingreso" && i.titulo !== "Registro" && i.titulo !== "Cerrar sesión")
    : NavItems.filter(i => i.titulo !== "Cerrar sesión");

   // generamos dinamicamente el cotenido del header de la web, creamos la barra de navegacion completa. (Te odio Png, aguante Webp)
  header.innerHTML = `
    <nav class="nav-container">
      
       
      <a href="${baseHome}" class="nav-logo">
        <img src="${baseImg}leufumates.webp" alt="Logo Leufu Mates" width="100" height="100">
      </a>


      <ul class="nav-center">
        ${items.map(item =>
          `<li><a href="${item.url}">${item.titulo}</a></li>`
        ).join("")}
      </ul>

     
      <div class="nav-right">
        ${usuario ? `<span class="usuario">Hola, ${usuario.nombre}</span>` : ""}
        ${usuario ? `<button class="btnLogout" onclick="logout()">Cerrar sesión</button>` : ""}
      </div>

    </nav>
  `;
}


document.addEventListener("DOMContentLoaded", CrearNavBar);

// SESSION STORAGE: guardamos el usuario logueado mientras la pestaña este abierta.
// sessionStorage solo guarda texto, por eso el objeto se convierte con JSON.stringify y se lee con JSON.parse.
function guardarUsuarioSesion(usuario) {
  sessionStorage.setItem("usuario", JSON.stringify(usuario));
}

function obtenerUsuarioSesion() {
  try {
    return JSON.parse(sessionStorage.getItem("usuario"));   // devuelve el objeto, o null si no hay nada guardado
  } catch {
    sessionStorage.removeItem("usuario");                    // si quedo guardado algo viejo (por ejemplo solo el email), se descarta
    return null;
  }
}


// login real: le preguntamos al backend si el email y la contraseña son correctos
async function login() {
  const email = document.getElementById("email")?.value.trim() || "";
  const pass  = document.getElementById("password")?.value.trim() || "";

  if (!email || !pass) {
    alert("Completa los campos de email y contraseña.");
    return;
  }

  try {
    const usuario = await iniciarSesion(email, pass);        // POST /usuarios/login (esta en api.js)
    guardarUsuarioSesion(usuario);                           // { id, nombre, apellido, email, activo } en sessionStorage
    alert(`¡Bienvenido, ${usuario.nombre}!`);
    window.location.href = baseHome;
  } catch (error) {
    alert(error.message);                                    // "Email o contraseña incorrectos" o "Usuario inactivo"
  }
}

// registro real: crea el usuario en el backend y deja la sesion iniciada
async function registrarse() {
  const datos = {
    nombre: document.getElementById("nombre").value.trim(),
    apellido: document.getElementById("apellido").value.trim(),
    email: document.getElementById("email").value.trim(),
    contraseña: document.getElementById("password").value.trim()
  };

  if (!datos.nombre || !datos.apellido || !datos.email || !datos.contraseña) {
    alert("Completa todos los campos.");
    return;
  }

  try {
    const usuario = await registrarUsuario(datos);           // POST /usuarios (esta en api.js)
    guardarUsuarioSesion(usuario);                           // queda logueado directamente, sin pasar por el login
    alert(`¡Cuenta creada! Bienvenido, ${usuario.nombre}.`);
    window.location.href = baseHome;
  } catch (error) {
    alert(error.message);                                    // por ejemplo: "El email ya está en uso"
  }
}

function logout() {
  sessionStorage.removeItem("usuario");
  alert("Sesión cerrada.");
  window.location.href = basePages + "login.html";  //redireccionamos al login luego de cerrar sesion
}
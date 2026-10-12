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
  { titulo: "Mates", url: basePages + "catmates.html" },
  { titulo: "Bombillas", url: basePages + "catbombillas.html" },
  { titulo: "Extras", url: basePages + "catextras.html" },
  { titulo: "Ingreso", url: basePages + "login.html" },
  { titulo: "Registro", url: basePages + "registrarse.html" },
  { titulo: "Cerrar sesión", url: "#", accion: "logout()" }
];

// Crear navbar dinamico
function CrearNavBar() {
  const header = document.querySelector("header");
  if (!header) return;

  const usuario = sessionStorage.getItem("usuario");

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
        ${usuario ? `<span class="usuario">Hola, ${usuario}</span>` : ""}
        ${usuario ? `<button class="btnLogout" onclick="logout()">Cerrar sesión</button>` : ""}
      </div>

    </nav>
  `;
}


document.addEventListener("DOMContentLoaded", CrearNavBar);

// login: con permisos para cualquier usuario 
function login() {
  const email = document.getElementById("email")?.value.trim() || "";
  const pass  = document.getElementById("password")?.value.trim() || "";

  if (!email || !pass) {
    alert("completa los campos con mail y password.");
    return;
  }

  // dejamos el acceso libre en este caso, no como el anterior que teniamos para usar con contraseña y mail. 
  sessionStorage.setItem("usuario", email);
  alert("Inicio sesion con exito!.");
  window.location.href = baseHome;
}

function logout() {
  sessionStorage.removeItem("usuario");
  alert("Sesión cerrada.");
  window.location.href = basePages + "login.html";  //redireccionamos al login luedo de cerrar sesion
}

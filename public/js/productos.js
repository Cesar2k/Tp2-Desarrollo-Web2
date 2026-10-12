//Si no funciona la carga de productos rezar para que si. 

// verificamos si estamos dentro de /pages/
const estoyEnPages = window.location.pathname.includes("/pages/");

// Cache de productos
let productosCache = [];  // almacenamos los productos cargados para evitar múltiples fetches. Muy muy util 

// Cargar JSON de productos. // ajustado la ruta del json para que funcione en pages y en la home 
fetch(estoyEnPages ? "../data/productos.json" : "./data/productos.json")  
  .then(r => r.json())
  .then(data => productosCache = data);


// Funcion para mostrar los productos en el home o index 
async function mostrarProductosHome() {                                     //la funcion que muestra los productos en home/index
  try {
    const usuario = sessionStorage.getItem("usuario");                      // verificamos si hay usuario logueado
    const contenedor = document.querySelector(".card-container");           // seleccionamos el contenedor donde se van a mostrar los productos  

    if (!usuario) {                                                         // si no hay usuario logueado                      
      contenedor.innerHTML =                                                // mostramos un mensaje pidiendo iniciar sesion si o si
      `
        <p style='text-align:center; margin-top:50px;'> 
          Iniciá sesión para ver los productos.
        </p>`;
      return;
    }

    const jsonPath = estoyEnPages ? "../data/productos.json" : "./data/productos.json";    //constante para la ruta del json como mas arriba y mas abajo tambien xd
    const response = await fetch(jsonPath);                                                // con fetech pedimos elementos de json y () pasamos la ruta
    const productos = await response.json();

    const tipos = ["Recomendado"];                                           // tipos de productos a mostrar en este caso mate, bombillas y extras
    contenedor.innerHTML = "";

    tipos.forEach(tipo =>                                                                   //foreach para recorrer cada tipo de producto 
      {
      const grupo = productos.filter(p => p.tipo === tipo).slice(0, 4);

      const titulo = document.createElement("h2");                                         // creamos un elemento h2 para el titulo de cada tipo de producto                     
      titulo.textContent = tipo.charAt(0).toUpperCase() + tipo.slice(1) + "s";             // una manita para poner la primera letra en mayuscula y agregarle una s al final para pluralizar
      contenedor.appendChild(titulo);                                                      //agregamos el titulo al contenedor principal

      const subContainer = document.createElement("div");                                  // creamos un subcontenedor para cada grupo de productos
      subContainer.classList.add("sub-container");                                         // le agregamos la clase sub-container para estilos traida de css claramente. 

      grupo.forEach(p => {
        const rutaImagen = estoyEnPages ? `../${p.imagen}` : `./${p.imagen}`;             //como sucede en varios lados ajutamos la ruta de la imagen segun si estamos en pages o en home
        const cantidadActual = parseInt(localStorage.getItem(`cantidad_${p.id}`)) || 0;   // obtenemos la cantidad actual del producto desde el localStorage (Tambien puede ser con Local )

        const card = document.createElement("div");
        card.classList.add("card");
        card.innerHTML = `
          <img src="${rutaImagen}" alt="${p.nombre}" width="250" height="300">
          <h3>${p.nombre}</h3>
          <p><strong>$${p.precio.toLocaleString("es-AR")}</strong></p>
          <div class="contador">
            <button class="btn-restar" data-id="${p.id}">-</button>
            <span id="cantidad_${p.id}" class="cantidad">${cantidadActual}</span>
            <button class="btn-sumar" data-id="${p.id}">+</button>
          </div>
          <button class="btn-carrito" onclick="agregarAlCarrito(${p.id})">Añadir al carrito</button>
        `;
        subContainer.appendChild(card);
      });

      contenedor.appendChild(subContainer);
    });

    activarControles();
  } catch (err) {
    console.error("Error cargando productos HOME:", err);
  }
}


// mostrar los productos por categoria. ma deficil que la miercole esto 
async function mostrarProductos(tipo) {                                                              //funcion con la que mostramos los productos por categoria
  try {
    const jsonPath = estoyEnPages ? "../data/productos.json" : "./data/productos.json";              // ajustado la ruta del json para que funcione en pages y en la home
    const response = await fetch(jsonPath);                                                          // fetech como explicamos mas arriba. 
    const productos = await response.json();

    const contenedor = document.querySelector(".card-container");                                   // seleccionamos el contenedor donde se van a mostrar los productos
    contenedor.innerHTML = "";

    const filtrados = productos.filter(p => p.tipo === tipo);

    filtrados.forEach(p => {
      const rutaImagen = estoyEnPages ? `../${p.imagen}` : `./${p.imagen}`;
      const cantidadActual = parseInt(localStorage.getItem(`cantidad_${p.id}`)) || 0;

      const card = document.createElement("div");
      card.classList.add("card");
      card.innerHTML = `
        <img src="${rutaImagen}" alt="${p.nombre}" width="250" height="300">
        <h3>${p.nombre}</h3>
        <p>${p.descripcion}</p>
        <p><strong>$${p.precio.toLocaleString("es-AR")}</strong></p>
        <div class="contador">
          <button class="btn-restar" data-id="${p.id}">-</button>
          <span id="cantidad_${p.id}" class="cantidad">${cantidadActual}</span>
          <button class="btn-sumar" data-id="${p.id}">+</button>
        </div>
        <button class="btn-carrito" onclick="agregarAlCarrito(${p.id})">Añadir al carrito</button>
      `;
      contenedor.appendChild(card);
    });

    activarControles();
  } catch (err) {
    console.error("Error cargando productos:", err);
  }
}


// funcion usada para activar los controles de sumar y restar - y +
function activarControles() {                                                               //funcion sobre contoles de sumna y resta de productos
  const botonesSumar = document.querySelectorAll(".btn-sumar");     
  const botonesRestar = document.querySelectorAll(".btn-restar"); 

  botonesSumar.forEach(btn => {                                                            // para cada boton de sumar
    btn.onclick = () => {                                                                  // al hacer click en el boton
      const id = btn.dataset.id;                                                           // vamos a obtrener el id del producto desde el atributo data-id
      let cantidad = parseInt(localStorage.getItem(`cantidad_${id}`)) || 0;                // obtenemos la cantidad actual del producto desde el localStorage      
      cantidad++;                                                                          // incrementamos la cantidad  (viva el cantidad++ y no el cantidad = cantidad + 1)
      localStorage.setItem(`cantidad_${id}`, cantidad);                                    // guardamos la nueva cantidad en el localStorage
      document.getElementById(`cantidad_${id}`).textContent = cantidad;                    // actualizamos el contador en la interfaz
    };
  });

  botonesRestar.forEach(btn => {                                                           // Lo mismo que el de arriba pero esta vez para restar
    btn.onclick = () => {                                                                  
      const id = btn.dataset.id;
      let cantidad = parseInt(localStorage.getItem(`cantidad_${id}`)) || 0;
      if (cantidad > 0) cantidad--;
      localStorage.setItem(`cantidad_${id}`, cantidad);
      document.getElementById(`cantidad_${id}`).textContent = cantidad;
    };
  });
}


// funcion para obtener y guardar el carrito
function obtenerCarrito() {                                                   //funcion para obtener el carrito desde el localStorage
  return JSON.parse(localStorage.getItem("carrito")) || [];                   // si no hay carrito, devolvemos un array vacio
}

function guardarCarrito(carrito) {                                            //funcion para guardar el carrito en el localStorage
  localStorage.setItem("carrito", JSON.stringify(carrito));                  // guardamos el carrito como un string JSON (como vimos en c# el Convert.ToSring pero en js)
  actualizarCarrito();
}


// Funcion usada para agregar productos al carrito
function agregarAlCarrito(idProducto) {                                                            // funcion para agregar productos al carrito
  const producto = productosCache.find(p => p.id === idProducto);                                  // buscamos el producto en en la cache de productos
  if (!producto) return;                                                                           // si no lo encontramos, salimos de la funcion

  const cantidadSeleccionada = parseInt(localStorage.getItem(`cantidad_${idProducto}`)) || 0;      // obtenemos la cantidad seleccionada desde el localStorage
  const cantidadFinal = cantidadSeleccionada > 0 ? cantidadSeleccionada : 1;                       // si no se selecciono cantidad, agregamos 1 por defecto

  let carrito = obtenerCarrito();                                                                 // obtenemos el carrito actual con lo que agregamos y tiene el localstorage
  let item = carrito.find(p => p.id === idProducto);                                              // buscamos si el producto ya esta en el carrito

  if (item) {                                                                                    // si ya esta en el carrito, aumentamos la cantidad
    item.cantidad += cantidadFinal;  
  } else {
    carrito.push({                                                                              // si no esta, lo agregamos como nuevo item
      id: producto.id,                                                                   //donde vemos el id, nombre, precio y cantidad
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad: cantidadFinal
    });
  }

  guardarCarrito(carrito);

  localStorage.setItem(`cantidad_${idProducto}`, 0);                                       // reseteamos el contador visual a 0
  const contador = document.getElementById(`cantidad_${idProducto}`);                     // seleccionamos el contador visual             
  if (contador) contador.textContent = "0";                                              // y lo actualizamos a 0

  mostrarCarrito();
}


// funcion para mostrar y ocultar el carritod
function mostrarCarrito() {
  document.getElementById("carritoSidebar").classList.add("mostrar");           // agregamos la clase mostrar para que se vea el carrito
}

function ocultarCarrito() {
  document.getElementById("carritoSidebar").classList.remove("mostrar");        // quitamos la clase mostrar para que no se vea el carrito
}


// actualizacion del carrito
function actualizarCarrito() {                                         //funcion para actualizar el carrito
  const lista = document.getElementById("listaCarrito");               // seleccionamos la lista del carrito
  const totalMonto = document.getElementById("totalMonto");          //  seleccionamos el total del monto del carrito
  if (!lista) return;                                               // si no hay lista, salimos de la funcion

  const carrito = obtenerCarrito();                                // obtenemos el carrito actual
  lista.innerHTML = "";                                       // reseteamos la lista a vacio 

  let total = 0;

  carrito.forEach((p, index) => {
  total += p.cantidad * p.precio;

  const li = document.createElement("li");   // <- ESENCIAL
  
  const rutaImgCarrito = estoyEnPages ? `../${p.imagen}` : `./${p.imagen}`;

  li.innerHTML = `
    <img src="${rutaImgCarrito}" alt="${p.nombre}" width="60" height="60" style="border-radius:8px;"><br>
    <strong>${p.nombre}</strong><br>
    <button class="btnRestarCarrito">-</button>
    <span>${p.cantidad}</span>
    <button class="btnSumarCarrito">+</button>
  `;

  lista.appendChild(li);

  li.querySelector(".btnSumarCarrito").onclick = () => {
    carrito[index].cantidad++;
    guardarCarrito(carrito);
    mostrarCarrito();
  };

  li.querySelector(".btnRestarCarrito").onclick = () => {
    if (carrito[index].cantidad > 1) carrito[index].cantidad--;
    else carrito.splice(index, 1);

    guardarCarrito(carrito);
    mostrarCarrito();
  };
});


  totalMonto.textContent = total.toLocaleString("es-AR");
}


// boton de vaciar y carrito flotante 
document.addEventListener("DOMContentLoaded", () => {                     //cuando el documento este cargado 
  const btnVaciar = document.getElementById("vaciarCarrito");            // seleccionamos el boton de vaciar carrito
  if (btnVaciar) {                                                         // si existe el boton
    btnVaciar.onclick = () => {                                            // al hacer click en el boton
      localStorage.removeItem("carrito");                             // eliminamoe el carrito del localStorage
      actualizarCarrito();                                             //y  actualizamos el carrito
    };
  }

  const btnCarrito = document.getElementById("btnCarritoFlotante");      // seleccionamos el boton flotante del carrito
  const carrito = document.getElementById("carritoSidebar");             // seleccionamos el barra que se desliza del carrito

  if (btnCarrito) {                                                        // si existe el boton
    btnCarrito.onclick = () => carrito.classList.toggle("mostrar");   // al hacer click en el boton, alternamos la clase mostrar para mostrar u ocultar el carrito
  } 

  actualizarCarrito();
});

<h1 align="center"> LEUFU MATES – ECOMMERCE</h1>
<h3 align="center">Proyecto Integrador Final – Aplicaciones Web 1</h3>
<br>


<h2> Alumno</h2>
<p><strong>Fiad, Marcos César Andrés</strong><br>Año 2025</p>
<br>

<h2>Resumen del Ecommerce</h2>
<p>
Leufu Mates es un ecommerce desarrollado con HTML, CSS, JavaScript y Json,
que permite visualizar productos, gestionarlos mediante un carrito de compras,
autenticar usuarios, navegar entre categorías y cargar dinámicamente el
catálogo desde un archivo JSON, sin necesidad de backend.
</p>

<h2> Links del Proyecto</h2>
<ul>
  <li><strong>Repositorio GitHub:</strong> https://github.com/Cesar2k/ProyectoEcommerce.git</li>
  <li><strong>Vercel:</strong> https://proyecto-ecommerce-snowy.vercel.app/</li>
  <li><strong>Video Explicativo (Drive):</strong> https://drive.google.com/file/d/1L4ABzQw9i0zlj2Kl0w46TkuxPfGxTAjt/view?usp=drive_link </li>
</ul>
<br>

<h1> Tecnologías Utilizadas en el desarrollo del proyecto</h1>

<h3>HTML5</h3>
<p>Estructura principal de la web, páginas base, elementos semánticos y organización del contenido.</p>

<h3>CSS3</h3>
<p>Estilos personalizados, diseño responsive (uso pantallas chicas), uso de Google Fonts (fuente de letras) y estructura visual del ecommerce.</p>

<h3>JavaScript</h3>
<p>Redirecciones, validaciones, carga dinámica, componentes, DOM, eventos y lógica general de la web.</p>

<h3>JSON</h3>
<p>Estructura de datos utilizada para simular una base de datos local con los productos de los catálogo.</p>

<h3>LocalStorage / SessionStorage</h3>
<p>Persistencia de datos: sesión del usuario y almacenamiento del carrito de compras.</p>
<p>Aunque la idea inicial era utilizar SessionStorage utilice LocalStorage para datos que queria que se mantengan en la web aunque cierre el navegador </p>

<h3>Fetch API</h3>
<p>Obtención dinámica de la información del archivo <em>productos.json</em> para rellenar las cards de productos.</p>

<br>

<h1> Roadmap del Desarrollo. 5 etapas desarrolladas</h1>

<!-- ETAPA 1 -->

<h2> Etapa 1 – Planificación y Maquetado Inicial</h2>
<p>Se creó el repositorio público con README incluido y se desarrolló toda la estructura base del proyecto.</p>

<ul>
  <li>Repositorio público creado según la consigna.</li>
  <li>Se incluyeron las páginas obligatorias:
    <ul>
      <li>index.html (Home)</li>
      <li>login.html</li>
      <li>registro.html</li>
      <li>Páginas de categorías: CatMates, CatBombillas y CatExtras (mínimo 3 categorias fueron las que se pidieron)</li>
    </ul>
  </li>
  <li>El index contiene:
    <ul>
      <li>Navbar con Home, Logout, icono de tienda (agregado en la ultima etapa) y enlaces a categorías</li>
      <li>Título principal en el body</li>
      <li><code>&lt;title&gt;</code> con el nombre de la tienda</li>
    </ul>
  </li>
  <li>Las páginas de categorías mantienen el mismo navbar y estructura, con su título correspondiente.</li>
  <li>Los formularios de Login y Registro contienen todos los <em>inputs</em> requeridos y botón de submit.</li>
  <li>Definición del concepto: Ecommerce de productos artesanales (mates, bombillas y accesorios(Extras)).</li>
</ul>

<h3>Estructura inicial del proyecto</h3>
<pre>
/css (agregado en etapa 2)
/js  (Agregado en etapa 3)
/img 
/data (Agregado en etapa 4)
/pages
index.html
</pre>

<br>


<!--  ETAPA 2  -->


<h2> Etapa 2 – Estilos y Visual</h2>
<p>Se aplicó una estética definida y se construyó la identidad visual del ecommerce.</p>

<ul>
  <li>Paleta de colores personalizada (oscuro + verde característico de Leufu y colores de la Patagonia).</li>
  <li>Navbar estilizado y unificado para todas las páginas.</li>
  <li>Login y Registro diseñados con estructura limpia y responsive.</li>
  <li>Creación del prototipo de card de producto.</li>
  <li>Layout (posicion, margenes, padding, etc) general para home y categorías con sector preparado para cards.</li>
  <li>Tipografías Montserrat y Roboto, fueron las mas utilizadas.</li>
  <li>Se dejaron preparados espacios para imágenes y backgrounds.</li>
</ul>

<br>


<!--ETAPA 3 -->


<h2> Etapa 3 – JavaScript, Navegación y Componentes</h2>
<p>Se incorporó JavaScript para redireccionamientos, componentes y lógica interna.</p>

<ul>
  <li>Login redirige al usuario al Home una vez autenticado.</li>
  <li>Logout redirige nuevamente al login.</li>
  <li>Se creó un array de objetos para la estructura del navbar.</li>
  <li>Se construyó un componente dinámico de navbar reutilizable en todas las páginas.</li>
  <li>Componente de card con:
    <ul>
      <li>Imagen</li>
      <li>Título</li>
      <li>Descripción</li>
      <li>Precio</li>
      <li>Botones + y -</li> 
    </ul>
  </li>
  <li>Estructura ordenada del proyecto en varios 2 archivos JS para facilitar mantenimiento.</li>
</ul>

<pre>
navbar.js
productos.js

Aquneu dentro de productos.Js tenemos:
carrito.js
cantidadCarrito.js
login.js
</pre>

<br>


<!--ETAPA 4 -->


<h2> Etapa 4 – JSON, Fetch y Carga Dinámica</h2>
<p>Se creó y utilizó un archivo JSON para cargar dinámicamente el catálogo de productos.</p>

<ul>
  <li>archivo <strong>productos.json</strong> creado con todos los productos del ecommerce.</li>
  <li>Obtención de datos con <strong>fetch()</strong>.</li>
  <li>Cards rellenas automáticamente con:
    <ul>
      <li>Título</li>
      <li>Imagen</li>
      <li>Descripción</li>
      <li>Precio</li>
      <li>Botones +/- y “Añadir al carrito”</li>
    </ul>
  </li>
  <li>El Home muestra 4 productos destacados por categoría para usuarios logueados.</li>
</ul>

<br>


<!-- ETAPA 5-->


<h2> Etapa 5 – Persistencia con SessionStorage y LocalStorage</h2>
<p>Se implementó la persistencia de datos del usuario y del carrito de compras.</p>

<ul>
  <li>El usuario logueado se guarda en <strong>sessionStorage</strong>.</li>
  <li>Los productos seleccionados se guardan en <strong>localStorage</strong>.</li>
  <li>El carrito se muestra en carrito.html con cantidades, subtotales y eliminación de items.</li>
  <li>Carrito persiste incluso al actualizar o cerrar el navegador. Esto es gracias a LocalStorage </li>
</ul>

<br>

<h1> Cambios Aplicados</h1>

<h3> Reestructuración del proyecto</h3>
<p>HTMLs principales en raíz, categorías en /pages, datos en /data. Código un poco mas limpio.</p>

<h3>Corrección de rutas</h3>
<p>Se ajustaron todas las rutas relativas (./ y ../) para evitar errores.</p>

<h3> Mejoras UX/UI</h3>
<p>Navbar más claro, botones accesibles, layout responsive optimizado.</p>

<br>

<h1> Mejora Significativa del Proyecto</h1>

<h3> Carrito dinámico persistente</h3>
<p>Se guarda en LocalStorage, mantiene cantidades, se actualiza en el navbar en tiempo real y no se borra al recargar.</p>

<h3> Carga dinámica completa desde JSON</h3>
<p>Permite agregar, modificar o quitar productos sin tocar HTML.</p>

<h3> Seguridad y validación del usuario</h3>
<p>Validaciones de login y registro + bloqueo de secciones sin sesión.</p>

<h3> La idea principal a aplicar esto fue que sea escalable y modular</h3>
<p>Estructura clara para futuras mejoras o integración con backend.</p>

<br>

<h1> Estructura Final del Proyecto</h1>

<pre>
LeufuMates/
│── index.html
│── login.html
│── registro.html
│
│
│── /pages
│     ├── mates.html
│     ├── bombillas.html
│     └── extras.html
│
│── /css
│     └── styles.css
│
│── /js
│     ├── navbar.js
│     ├── productos.js (con login, carrito, etc. dentro de Productos.js)
│
│── /data
│     └── productos.json
│
└── /img
      └── imágenes del ecommerce
</pre>
<br>

<h1> Conclusión</h1>
<p>
El proyecto permitió aplicar todos los conocimientos de Aplicaciones Web 1:  
HTML, CSS, JavaScript, manejo de JSON, almacenamiento local y diseño responsive.  
<br><br>
La web se convirtio paso a paso en una web relativamente solita y con posibilidad de escalabilidad!
</p>
<br>

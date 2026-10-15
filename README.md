# Leufu Mates

Tienda de mates armada con Node.js y Express 5 para Web II. Es un monorepo: el backend (API en Express) está en la raíz y la tienda (front-end) está en la carpeta `public`, que Express sirve con `express.static`. Maneja usuarios, productos y ventas, y los datos se guardan en archivos JSON dentro de la carpeta `data`.

## Cómo probarlo

1. Instalar las dependencias y levantar el servidor:
   ```
   npm install
   npm run dev
   ```
2. Abrir **http://localhost:3000** en el navegador.
3. Ir a **Registro** y crear una cuenta (la sesión queda iniciada). También se puede entrar por **Ingreso** con una cuenta ya creada.
4. En **Productos** se ven todos los productos a la venta y se pueden filtrar por categoría (Mates, Bombillas, Extras).
5. Agregar productos al carrito (se guarda en `localStorage`), abrirlo con el botón 🛒, escribir una dirección y presionar **Finalizar compra**.
6. La orden de compra queda registrada en `data/ventas.json` con el id del usuario, y el stock se descuenta en `data/productos.json`.

## Qué incluye esta entrega

| Funcionalidad | Dónde está |
|---|---|
| Listado de todos los productos a la venta | `public/pages/productos.html` (pide `GET /productos?disponible=true`) |
| Filtro por categoría | Botones de filtro en la misma página (`activarFiltros` en `public/js/productos.js`) |
| Carrito guardado en `localStorage` | `public/js/productos.js` (`obtenerCarrito` y `guardarCarrito`) |
| Compra contra el back-end | `finalizarCompra` en `public/js/productos.js`, que llama a `POST /ventas` |
| Login y registro reales | `public/js/navbar.js`, que llama a `POST /usuarios/login` y `POST /usuarios` |
| Sesión en `sessionStorage` | `guardarUsuarioSesion` y `obtenerUsuarioSesion` en `public/js/navbar.js` |
| CORS con lista de orígenes permitidos | `index.js`, con la variable `CORS_ORIGINS` del `.env` |
| Llamadas al backend centralizadas | `public/js/api.js` |

## Estructura

```
TiendaMates/
├── data/
│   ├── productos.json
│   ├── usuarios.json
│   └── ventas.json
├── routes/
│   ├── productos.router.js
│   ├── usuarios.router.js
│   └── ventas.router.js
├── utils/
│   └── archivos.js
├── .gitignore
├── index.js
└── package.json
```

## Rutas

| Método | Ruta | Descripción |
|---|---|---|
| GET | /usuarios | Lista todos los usuarios |
| GET | /usuarios/:id | Obtiene un usuario por su id |
| POST | /usuarios | Crea un usuario |
| POST | /usuarios/login | Valida email y contraseña |
| PUT | /usuarios/:id | Actualiza un usuario |
| DELETE | /usuarios/:id | Elimina un usuario si no tiene ventas |
| GET | /productos | Lista los productos (se puede filtrar con ?disponible=true) |
| GET | /productos/:id | Obtiene un producto por su id |
| POST | /productos | Crea un producto |
| POST | /productos/buscar | Busca productos con filtros en el body |
| PUT | /productos/:id | Actualiza un producto |
| DELETE | /productos/:id | Elimina un producto si no está en ninguna venta |
| GET | /ventas | Lista las ventas (se puede filtrar con ?fecha=2026-05-01) |
| GET | /ventas/:id | Detalle de una venta con el usuario y los productos |
| POST | /ventas | Registra una venta |
| POST | /ventas/reporte | Resumen de ventas entre dos fechas |
| PUT | /ventas/:id | Cambia la dirección, fecha o usuario de una venta |
| DELETE | /ventas/:id | Elimina una venta y devuelve el stock |

El login lo hice con POST porque el email y la contraseña son datos sensibles y no quería que quedaran en la URL. Lo mismo con la búsqueda de productos y el reporte de ventas, que reciben los filtros por el body.

Sobre la integridad de los datos: como cada venta guarda el id del usuario y los ids de los productos, no dejo borrar un usuario que tenga ventas ni un producto que aparezca en alguna venta. En esos casos la API responde 409 y dice qué ventas lo están usando. Para borrar un usuario primero hay que borrar sus ventas, y cuando se borra una venta el stock de los productos vuelve a sumarse.

También al registrar una venta se revisa que el usuario exista y esté activo, y que haya stock de cada producto. El total y la fecha los calcula el servidor.

## Ejemplos para probar

Yo lo probé con Postman. En los POST y PUT hay que mandar el body como raw → JSON, si no, la API responde "Faltan datos obligatorios".

Crear usuario, `POST /usuarios`:
```json
{
  "nombre": "Fernanda",
  "apellido": "Fiad",
  "email": "Ferfiad@mail.com",
  "contraseña": "567891"
}
```

Login, `POST /usuarios/login`:
```json
{
  "email": "cesarfiad2000@gmail.com",
  "contraseña": "1111"
}
```

Modificar usuario, `PUT /usuarios/2` (solo cambia lo que se manda):
```json
{
  "nombre": "Lara"
}
```

Crear producto, `POST /productos`:
```json
{
  "nombre": "Mate imperial",
  "descripcion": "Calabaza forrada en cuero",
  "precio": 60000,
  "stock": 8
}
```

Buscar productos, `POST /productos/buscar` (los filtros son opcionales):
```json
{
  "nombre": "mate",
  "precioMax": 30000
}
```

Modificar producto, `PUT /productos/4`:
```json
{
  "precio": 16000,
  "stock": 25
}
```

Registrar venta, `POST /ventas`:
```json
{
  "id_usuario": 2,
  "direccion": "San Martín 100",
  "productos": [
    { "id_producto": 1, "cantidad": 2 },
    { "id_producto": 4, "cantidad": 3 }
  ]
}
```

Reporte, `POST /ventas/reporte`:
```json
{
  "desde": "2026-05-01",
  "hasta": "2026-05-31"
}
```

Modificar venta, `PUT /ventas/1`:
```json
{
  "direccion": "Nueva dirección 456"
}
```

Para probar la integridad se puede intentar `DELETE /usuarios/1`, que tiene ventas y no se deja borrar, o `DELETE /productos/1`, que está en la venta 1.
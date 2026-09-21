# Tienda de Mates "Leufu Mates"

Servidor desarrollado con **Node.js** y **Express 5** que gestiona 3 estructuras relacionadas: **usuarios**, **productos** y **ventas**. Los datos se guardan en archivos JSON dentro de la carpeta `data/`.

## Instalación y ejecución

```bash
npm install
npm run dev     
npm start       
```

Creamos un archivo `.env` en la raíz con el puerto:

```
PORT=3000
```

El servidor queda activo en `http://localhost:3000`.

-Estructura del proyecto-

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

## Relación entre las estructuras e integridad de datos

Cada **venta** tiene un `id_usuario` y un arreglo `productos` con objetos `{ id_producto, cantidad }`. por ende:

- No se puede eliminar un **usuario** que tenga ventas asociadas.
- No se puede eliminar un **producto** que figure en alguna venta.
- Al eliminar una **venta**, se devuelve al stock la cantidad vendida de cada producto.
- Al crear una venta se valida que el usuario exista y esté activo, que el producto exista, esté disponible y tenga stock.
- Al reasignar una venta a otro usuario, se valida que ese usuario exista.

---

-RESUMEN DE RUTAS-
| Método | Ruta | Descripción |
|---|---|---|
| GET | `/usuarios` | Lista todos los usuarios |
| GET | `/usuarios/:id` | Obtiene un usuario por su id |
| POST | `/usuarios` | Crea un usuario |
| POST | `/usuarios/login` | Valida email y contraseña |
| PUT | `/usuarios/:id` | Actualiza un usuario |
| DELETE | `/usuarios/:id` | Elimina un usuario (solo si no tiene ventas) |
| GET | `/productos` | Lista productos (filtro opcional `?disponible=true`) |
| GET | `/productos/:id` | Obtiene un producto por su id |
| POST | `/productos` | Crea un producto |
| POST | `/productos/buscar` | Busca productos con filtros enviados en el body |
| PUT | `/productos/:id` | Actualiza un producto |
| DELETE | `/productos/:id` | Elimina un producto (solo si no figura en ventas) |
| GET | `/ventas` | Lista ventas (filtro opcional `?fecha=AAAA-MM-DD`) |
| GET | `/ventas/:id` | Detalle de una venta con datos del usuario y los productos |
| POST | `/ventas` | Registra una venta |
| POST | `/ventas/reporte` | Resumen de ventas entre dos fechas |
| PUT | `/ventas/:id` | Actualiza dirección, fecha o usuario de una venta |
| DELETE | `/ventas/:id` | Elimina una venta y restituye el stock |

---

## Usuarios — `/usuarios`

### GET `/usuarios`
nos devuelve a todos los usuarios.

### GET `/usuarios/:id`
Devuelve un usuario y nos responde `404` si no existe.

### POST `/usuarios`
Crea un usuario. con todos los campos que son obligatorios y el email no puede repetirse.

```json
{
  "nombre": "nombre",
  "apellido": "apellido",
  "email": "su mail",
  "contraseña": "contrase"
}
```

Respuestas: `201` creado · `400` faltan datos · `409` email en uso.

### POST `/usuarios/login`
Valida las credenciales. Se usa POST porque los datos son sensibles y no deben viajar en la URL.

```json
{
  "email": "cesarfiad2000@gmail.com",
  "contraseña": "1111"
}
```

Respuestas: `200` login exitoso · `400` faltan datos · `401` email o contraseña incorrectos · `403` usuario inactivo.

### PUT `/usuarios/:id`
Actualiza solo los campos enviados (`nombre`, `apellido`, `email`, `contraseña`, `activo`).

```json
{
  "nombre": "Ana María",
  "activo": false
}
```

Respuestas: `200` · `404` no existe · `409` el email pertenece a otro usuario.

### DELETE `/usuarios/:id`
Elimina el usuario **solo si no tiene ventas asociadas**. Si las tiene, responde `409`:

```json
{
  "mensaje": "No se puede eliminar un usuario que tenga ventas asociadas",
  "ventas": [1, 4],
  "sugerencia": "Primero elimine las ventas asociadas a este usuario para poder eliminarlo"
}
```

---

## Productos — `/productos`

### GET `/productos`
Devuelve todos los productos. Filtro opcional por query:

```
GET /productos?disponible=true
```

### GET `/productos/:id`
Devuelve un producto. Responde `404` si no existe.

### POST `/productos`
Crea un producto. `nombre` y `precio` son obligatorios. `disponible` se calcula según el stock.

```json
{
  "nombre": "Mate imperial",
  "descripcion": "Calabaza forrada en cuero con virola de alpaca",
  "precio": 60000,
  "imagen": "",
  "stock": 8
}
```

Respuestas: `201` · `400` faltan datos, precio menor o igual a 0 o stock negativo.

### POST `/productos/buscar`
Búsqueda con filtros en el body (todos opcionales). `nombre` busca en el nombre y la descripción.

```json
{
  "nombre": "mate",
  "precioMin": 10000,
  "precioMax": 30000,
  "disponible": true
}
```

Respuesta: `{ "cantidad": 2, "productos": [ ... ] }`

### PUT `/productos/:id`
Actualiza solo los campos enviados. Si el stock queda en 0, el producto pasa a `disponible: false`.

```json
{
  "precio": 45000,
  "stock": 12
}
```

Respuestas: `200` · `400` precio o stock inválidos · `404` no existe.

### DELETE `/productos/:id`
Elimina el producto **solo si no figura en ninguna venta**. Si figura, responde `409` con las ventas relacionadas y sugiere marcarlo como no disponible con PUT.

---

## Ventas — `/ventas`

### GET `/ventas`
Devuelve todas las ventas. Filtro opcional por fecha:

```
GET /ventas?fecha=2026-05-01
```

### GET `/ventas/:id`
Devuelve la venta con el nombre y el email del usuario, y el nombre de cada producto.

### POST `/ventas`
Registra una venta. El servidor valida el usuario y el stock antes de modificar nada, descuenta el stock, calcula el total y asigna la fecha del día.

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

Ejemplo del total calculado: 2 × 43.000 + 3 × 15.000 = **131.000**.

Respuestas: `201` · `400` datos inválidos · `403` usuario inactivo · `404` usuario o producto inexistente · `409` sin stock o producto no disponible.

### POST `/ventas/reporte`
Resumen de ventas entre dos fechas (formato `AAAA-MM-DD`). `id_usuario` es opcional.

```json
{
  "desde": "2026-05-01",
  "hasta": "2026-05-31",
  "id_usuario": 1
}
```

Respuesta: `cantidadVentas`, `totalRecaudado`, `ticketPromedio` y el listado de ventas.

### PUT `/ventas/:id`
Actualiza `direccion`, `fecha` o `id_usuario`. Si se reasigna a otro usuario, se verifica que exista.

```json
{
  "direccion": "Nueva dirección 456"
}
```

Respuestas: `200` · `400` no se envió ningún campo · `404` venta o usuario inexistente.

### DELETE `/ventas/:id`
Elimina la venta y **devuelve al stock** las unidades vendidas. Es el paso previo para poder eliminar un usuario o un producto relacionados.

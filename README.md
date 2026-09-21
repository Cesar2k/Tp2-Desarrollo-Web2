# Leufu Mates

Tienda de mates hecha con Node.js y Express 5 para la segunda entrega de Aplicaciones Web II. Maneja usuarios, productos y ventas, y los datos se guardan en archivos JSON dentro de la carpeta `data`.

Para correrlo:

```
npm install
npm run dev
```

Queda en `http://localhost:3000`.

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

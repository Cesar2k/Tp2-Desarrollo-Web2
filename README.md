# Leufu Mates

Tienda de mates armada con Node.js y Express 5 para Aplicaciones Web II. Es un monorepo: el backend (la API en Express) está en la raíz y la tienda está en la carpeta `public`, que Express sirve con `express.static`. Maneja usuarios, productos y ventas.

En esta entrega pasé los datos de los archivos JSON a MongoDB, empecé a guardar las contraseñas con hash usando bcrypt y protegí la compra con un token JWT.

## Tecnologías

- Node.js y Express 5 para el servidor y la API.
- MongoDB como base de datos, con el driver oficial `mongodb`. Para ver los datos uso MongoDB Compass.
- bcryptjs para las contraseñas y jsonwebtoken para los tokens.
- dotenv para la configuración y cors para poder abrir el front desde Live Server.
- HTML, CSS y JavaScript en el front.
- Postman para probar la API.

## Cómo instalarlo y probarlo

Hace falta tener Node.js y MongoDB Community Server instalados. En Windows, MongoDB queda instalado como servicio y arranca solo en `localhost:27017`.

1. Instalar las dependencias:
   ```
   npm install
   ```
2. Crear el `.env` copiando la plantilla:
   ```
   cp .env.example .env
   ```
   En la terminal CMD de Windows es `copy .env.example .env`. Después hay que completar `JWT_SECRET` con una clave larga. Yo la generé con este comando:
   ```
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. Cargar los datos en MongoDB. Este comando copia los JSON de la carpeta `data` a la base `leufumates`:
   ```
   npm run seed
   ```
4. Levantar el servidor:
   ```
   npm run dev
   ```
   En la consola tiene que aparecer "Conectado a la DB de MongoDB" y después "Servidor corriendo en http://localhost:3000".
5. Abrir http://localhost:3000 en el navegador.

Para entrar se puede usar mi usuario, `cesarfiad2000@gmail.com` con la contraseña `1111`. El usuario `fernandofiad2000@gmail.com` (contraseña `23445`) está inactivo, lo dejé así para probar que no puede iniciar sesión.

En la tienda se puede crear una cuenta o entrar con un usuario existente, ver los productos con stock y filtrarlos por categoría, agregarlos al carrito y finalizar la compra desde el botón 🛒 escribiendo una dirección. La venta queda guardada en la colección `ventas` y el stock se descuenta en `productos`. Las dos cosas se pueden ver en Compass.

## ¿Qué agregué en esta parte del trabajo?

### Contraseñas con bcrypt

Antes las contraseñas se guardaban tal cual en `usuarios.json`. Ahora, cuando alguien se registra o cambia su contraseña, lo que se guarda es un hash generado con bcrypt, algo como `$2b$10$N9qo8u...`. Del hash no se puede volver a la contraseña original, y como bcrypt le agrega una sal aleatoria, dos usuarios con la misma contraseña quedan con hashes distintos.

Por eso el login cambió: ya no se puede comparar con `===`. Primero busco el usuario por email y después `bcrypt.compare` revisa si la contraseña que escribió corresponde al hash guardado. Si falla el email o la contraseña, el mensaje es el mismo ("Email o contraseña incorrectos"), para no dar pistas de qué emails están registrados.

Las contraseñas que ya estaban cargadas las convertí con un script (`npm run hash`). Si se ejecuta dos veces no pasa nada, porque saltea las que ya tienen hash.

### Token JWT para comprar

Cuando el login sale bien, la API devuelve un token firmado con la clave `JWT_SECRET` del `.env`. Adentro lleva el id y el email del usuario (la contraseña nunca) y vence a las 2 horas.

La compra (`POST /ventas`) pasa primero por el middleware `verificarToken`, que espera el token en la cabecera `Authorization: Bearer <token>`. Si no hay token, si es falso o si venció, responde 401. Si el token está bien pero el usuario fue desactivado, responde 403. Si todo está bien, deja los datos del usuario en `req.usuario` y sigue con la compra.

Un cambio importante: antes el `id_usuario` venía en el body, así que cualquiera podía comprar a nombre de otro. Ahora el comprador sale del token.

En el front, el token se guarda en `sessionStorage` junto con el usuario y se manda al finalizar la compra. Si la sesión venció, la página la borra y lleva al login. Al cerrar sesión se borran los dos.

### De JSON a MongoDB

Los datos ahora están en la base `leufumates`, con tres colecciones: `productos`, `usuarios` y `ventas`. La conexión está en `db/conexion.js` y se hace una sola vez al iniciar. Si MongoDB no responde, el servidor no arranca y lo dice en la consola.

Para pasar los datos armé el script `npm run seed`, que vacía las colecciones y las vuelve a cargar con los JSON de `data`. Hay que tener en cuenta que borra lo que haya, así que sirve para empezar de cero.

Cada documento mantiene su `id` numérico además del `_id` que crea MongoDB. Lo hice así para que el front y las ventas siguieran funcionando sin cambios. El `_id` no se devuelve en las respuestas.

Los filtros que antes hacía en JavaScript con `.filter()` ahora los hace la base. Por ejemplo, la búsqueda de productos usa `$regex`, `$gte`, `$lte` y `$or`, y el reporte de ventas filtra las fechas con `$gte` y `$lte`.

Las rutas de la API son las mismas que antes, así que el front no se enteró del cambio.

### Orden del código

Separé el backend en capas. Las rutas solo indican qué función atiende cada URL, los controladores validan los datos y arman la respuesta, y los modelos son los únicos que hablan con MongoDB. Antes la lógica de productos y de ventas estaba toda dentro de los routers.

```
ruta → middleware (si hace falta) → controlador → modelo → MongoDB
```

### El archivo .env
Esto lo cambie y ahora ultimo deje libre el .env para evitar cualquier tipo de problema con la entrega. Pero de todas formas dejo esto
para que quede registro de que antes no estaba y de que si uso la tienda mas adelante lo tengo que volver a poner en Gitignore.
El `.env` no está en el repositorio porque tiene la clave de los tokens (lo agregué al `.gitignore`). En su lugar subí `.env.example`, que tiene las mismas variables sin la clave: `PORT`, `CORS_ORIGINS`, `JWT_SECRET`, `JWT_EXPIRA`, `MONGO_URI` y `MONGO_DB`.
(QUIZAS ACA ME EQUIVOCO, PERO ESPERO LO PUEDA VER SINO HABILITO NUEVAMENTE EL .ENV)

## Estructura

```
Tp2-Desarrollo-Web2/
├── controllers/
│   ├── productos.controller.js
│   ├── usuarios.controller.js
│   └── ventas.controller.js
├── data/                 ← datos iniciales para npm run seed
│   ├── productos.json
│   ├── usuarios.json
│   └── ventas.json
├── db/
│   └── conexion.js
├── middlewares/
│   ├── auth.middleware.js
│   └── logger.middleware.js
├── models/
│   ├── productos.model.js
│   ├── usuarios.model.js
│   └── ventas.model.js
├── public/               ← el front (lo sirve Express)
│   ├── css/
│   ├── img/
│   ├── js/
│   │   ├── api.js
│   │   ├── navbar.js
│   │   └── productos.js
│   ├── pages/
│   │   ├── login.html
│   │   ├── productos.html
│   │   └── registrarse.html
│   └── index.html
├── routes/
│   ├── productos.router.js
│   ├── usuarios.router.js
│   └── ventas.router.js
├── scripts/
│   ├── hashear-contraseñas.js
│   └── migrar-a-mongodb.js
├── utils/
│   ├── archivos.js
│   ├── hashing.js
│   └── token.js
├── .env y .env.example
├── .gitignore
├── index.js
└── package.json
```

Los comandos que tiene el `package.json` son `npm run dev` (levanta el servidor y lo reinicia al guardar), `npm start`, `npm run seed` y `npm run hash`.

## Rutas usadas

| Método | Ruta | Descripción |
|---|---|---|
| GET | /usuarios | Lista todos los usuarios (sin la contraseña) |
| GET | /usuarios/:id | Obtiene un usuario por su id |
| POST | /usuarios | Crea un usuario |
| POST | /usuarios/login | Valida email y contraseña y devuelve el token |
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
| POST | /ventas | Registra una venta (necesita el token) |
| POST | /ventas/reporte | Resumen de ventas entre dos fechas |
| PUT | /ventas/:id | Cambia la dirección, fecha o usuario de una venta |
| DELETE | /ventas/:id | Elimina una venta y devuelve el stock |

El login lo hice con POST porque el email y la contraseña son datos sensibles y no quería que quedaran en la URL. Lo mismo con la búsqueda de productos y el reporte de ventas, que reciben los filtros por el body.

Sobre la integridad de los datos: como cada venta guarda el id del usuario y los ids de los productos, no dejo borrar un usuario que tenga ventas ni un producto que aparezca en alguna venta. En esos casos la API responde 409 y dice qué ventas lo están usando. Para borrar un usuario primero hay que borrar sus ventas, y cuando se borra una venta el stock de los productos vuelve a sumarse.

Al registrar una venta reviso primero que todos los productos existan, estén disponibles y tengan stock, y recién después descuento el stock y guardo la venta. El total y la fecha los calcula el servidor.

## Ejemplos para probar

Yo lo probé con Postman. En los POST y PUT hay que mandar el body como raw → JSON; si no, la API responde "Faltan datos obligatorios".

### La parte del token

Primero el login, `POST /usuarios/login`:
```json
{
  "email": "cesarfiad2000@gmail.com",
  "contraseña": "1111"
}
```
La respuesta trae el token (un texto largo que empieza con `eyJ`) y los datos del usuario sin la contraseña.

Después la compra, `POST /ventas`:
```json
{
  "direccion": "San Martín 100",
  "productos": [
    { "id_producto": 1, "cantidad": 2 },
    { "id_producto": 4, "cantidad": 3 }
  ]
}
```
Si se manda sin token, responde 401 ("Necesitas iniciar sesión para hacer esto"). Para que funcione hay que ir a la pestaña Authorization de Postman, elegir Bearer Token y pegar el token del login. Ahí responde 201 con la venta, y el `id_usuario` es el del token.

También se puede probar con un token inventado (responde 401), con una contraseña incorrecta en el login (401) o con el usuario inactivo (403).

### El resto

Crear usuario, `POST /usuarios`:
```json
{
  "nombre": "Fernanda",
  "apellido": "Fiad",
  "email": "Ferfiad@mail.com",
  "contraseña": "567891"
}
```
En Compass se puede ver que la contraseña quedó guardada como hash.

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
  "stock": 8,
  "tipo": "mate"
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
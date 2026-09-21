Tienda de Mates (Leufumates)

Este es un servidor desarrollado con Node.Js y Express 5 que gestiona 3 estructuras relacionadas que son
Usuarios, Productos y Ventas. Los datos se guardar en un arcchivo JSON dentro de la carpeta /data.

-Istalacion y ejecucion:
npm install
npm run dev ()
npm start

-Creamos un archivo .env con la raiz del puerto
 PORT = 3000
 desde aca el servidor queda disponible en http://localhost:3000


 -Estructura del proyecto-

 TiendaMates (Leufu Mates)
├── data/
│   ├── productos.json
│   ├── usuarios.json
│   └── ventas.json
├── routes/
│   ├── productos.router.js
│   ├── usuarios.router.js
│   └── ventas.router.js
├── utils/
│   └── archivos.js       -para leer, guardar y generar el siguiente id
├── .gitignore
├── index.js              -punto de entrada del servidor
└── package.json


-Relacion entre las estructuras e integridad de los datos.

Cada venta tiene un "id_usuario" y un arreglo "productos" con el objetos {id_productos, cantidad}, por este motivo:
1.No se puede eliminar usuarios que tengan ventas asociadas. 2.No se puede eliminar un producto que figure en alguna venta.
3.Al eliminar una venta, se deuvelve al stock la cantidad vendida de cada producto.
4. al crear una venta se valida que el usuario exista y este activo, y que cada producto exciste, este disponible y tenga stock.
5. Al reasignar una venta a otro usuario, se valida que ese usuario exista. 

                -RESUMEN DE LAS RUTAS-
METOTOD             RUTA                    DESCRIPCION
GET              /usuarios                  Lista a todos los usuarios
GET              /usuarios/:id              Obtenemos usuarios por ide
POST            /usuarios                   Crea a un usuario
POST            /usuario/login              valida un emila y contrasel;a      
PUT             /usuario/:id                actualiza un usuario
DELET           /usuario/:id                elimina un usuario (solo si este no tiene ventas)
GET             /productos                  lista proeductos 
GET             /productos/:id              obtenemos un producto por su id.
POST            /productos                  crea un poroducto
POST            /producto/buscar            busca productos con filtros que son enviados en el body
PUT             /productos/:id              actualiza un producto
DELETE          /productos/:id              elimina un producto 
GET             /ventas                     lista las ventas
GET             /ventas/:id                 detalle de una venta con datos del usuario y los productos
POST            /ventas                     registra una venta
POST            /ventas/reporte             resumen de ventas entre fechas que elijamos
PUT             /ventas/:id                 actualiza la direccion, fecha o usuario de una venta
DELETE          /ventas/:id                 elimina una venta y restituye el stock

import {Router} from 'express';
import {leerDatos, guardarDatos, siguienteId} from '../utils/archivos.js';

const router = Router();

//GET /productos: devuelve todos los productos. se puede filtrar con ?disponible=true
router.get("/", (req, res) => 
    {
        let productos = leerDatos("productos");
        const {disponible} = req.query;

        if (disponible !== undefined)
        {
            productos = productos.filter((producto) => producto.disponible === (disponible === "true"));        
        }

        res.json(productos);
    });

    //GET /productos/:id: devuelve el producto con el id que le pasamos por params.
    router.get("/:id", (req, res) => 
    {
     const id = Number(req.params.id);
     const productos = leerDatos("productos").find((producto) => producto.id === id);

     if (!productos) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
     }
     res.json(productos);
    });


    //POST /productos: crea un producto nuevo. 
router.post("/", (req, res) => {
    const { nombre, descripcion = "", precio, imagen = "", stock = 0 } = req.body;

    if (!nombre || precio === undefined) {
        return res.status(400).json({ mensaje: "Faltan datos: nombre y precio son obligatorios" });
    }

    if (Number(precio) <= 0 || Number(stock) < 0) {
        return res.status(400).json({ mensaje: "El precio debe ser mayor a 0 y el stock no puede ser negativo" });
    }

    const productos = leerDatos("productos");

    const nuevoProducto = {
        id: siguienteId(productos),
        nombre,
        descripcion,
        precio: Number(precio),
        imagen,
        stock: Number(stock),
        disponible: Number(stock) > 0
    };

    productos.push(nuevoProducto);
    guardarDatos("productos", productos);

    res.status(201).json({ mensaje: "Producto creado correctamente", producto: nuevoProducto });
});

//POST /productos/buscar: buscar productos con los fgiltros que vengan del body
router.post("/buscar", (req, res) => {
    const { nombre, precioMin, precioMax, disponible } = req.body;

    let productos = leerDatos("productos");
    
    if(nombre) {
        const buscado = nombre.toLowerCase();
        productos = productos.filter((producto) => 
            producto.nombre.toLowerCase().includes(buscado) || 
            producto.descripcion.toLowerCase().includes(buscado)
        );
    }
    if (precioMin !== undefined) {
        productos = productos.filter((producto) => 
            producto.precio >= Number(precioMin));
    }
    if (precioMax !== undefined) {
        productos = productos.filter((producto) => 
            producto.precio <= Number(precioMax));
    }
    if(disponible !== undefined) {
        productos = productos.filter((producto) => 
            producto.disponible === (disponible === true));
    }
    res.json({ cantidad: productos.length, productos });
});

//PUT /productos/:id: actualiza un producto. solo modifica los campos que vengan en el body
router.put("/:id", (req, res) => {
    const id = Number(req.params.id);
    const productos = leerDatos("productos");
    const indice = productos.findIndex((producto) => producto.id === id);

    if (indice === -1) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const { nombre, descripcion, precio, imagen, stock, disponible } = req.body;

    if ((precio !== undefined && Number(precio) <= 0) || (stock !== undefined && Number(stock) < 0)) {
        return res.status(400).json({ mensaje: "El precio debe ser mayor a 0 y el stock no puede ser negativo" });
    }

    const actualizado = {
        ...productos[indice],
        ...(nombre !== undefined && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio !== undefined && { precio: Number(precio) }),
        ...(imagen !== undefined && { imagen }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(disponible !== undefined && { disponible })
    };

    //importante, porque un producto sin stockl nunca puede quedar en disponibles
     if (actualizado.stock === 0) {
        actualizado.disponible = false;
    }

    productos[indice] = actualizado;
    guardarDatos("productos", productos);

    res.json({ mensaje: "Producto actualizado correctamente", producto: actualizado });
});


//DELETE /productos/:id: elimina un producto, pero solo si no figura en ninguna venta (integridad de datos)
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const productos = leerDatos("productos");
    const indice = productos.findIndex((producto) => producto.id === id);

    if (indice === -1) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    //integridad de datos: cada venta tiene un arreglo de productos, hay que revisar adentro de cada una
    const ventasAsociadas = leerDatos("ventas").filter((venta) =>
        venta.productos.some((item) => item.id_producto === id)
    );

    if (ventasAsociadas.length > 0) {
        return res.status(409).json({
            mensaje: "No se puede eliminar un producto que figura en ventas registradas",
            ventas: ventasAsociadas.map((venta) => venta.id),
            sugerencia: "Marque el producto como no disponible con PUT en lugar de eliminarlo"
        });
    }

    const [eliminado] = productos.splice(indice, 1);
    guardarDatos("productos", productos);

    res.json({ mensaje: "Producto eliminado correctamente", producto: eliminado });
});

export default router;


//Controlador de todos ls productos valida los datos, llama al modelo y arma la respuesta.
//Antes esta logica estaba dentro de productos.router.js y leia el JSON; ahora usa el modelo (MongoDB).
import * as Productos from "../models/productos.model.js";  //los * son para referenciar a "todo"
import * as Ventas from "../models/ventas.model.js";

//GET /productos: devuelve todos los productos. se puede filtrar con ?disponible=true
export const listarProductos = async (req, res) => {
    const { disponible } = req.query;
    const filtro = disponible !== undefined ? { disponible: disponible === "true" } : {};   //el filtro lo hace Mongo
    res.json(await Productos.listar(filtro));
};

//GET /productos/:id: devuelve el producto con el id que le pasamos por params
export const obtenerProducto = async (req, res) => {
    const producto = await Productos.obtenerPorId(Number(req.params.id));

    if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
    }
    res.json(producto);
};

//POST /productos: crea un producto nuevo
export const crearProducto = async (req, res) => {
    const { nombre, descripcion = "", precio, imagen = "", stock = 0, tipo = "", destacado = false } = req.body;

    if (!nombre || precio === undefined) {
        return res.status(400).json({ mensaje: "Faltan datos: nombre y precio son obligatorios" });
    }
    if (Number(precio) <= 0 || Number(stock) < 0) {
        return res.status(400).json({ mensaje: "El precio debe ser mayor a 0 y el stock no puede ser negativo" });
    }

    const producto = await Productos.crear({
        nombre,
        descripcion,
        precio: Number(precio),
        imagen,
        stock: Number(stock),
        disponible: Number(stock) > 0,
        tipo,
        destacado
    });

    res.status(201).json({ mensaje: "Producto creado correctamente", producto });
};

//POST /productos/buscar: busca productos con los filtros que vengan en el body
//ahora el filtro lo arma Mongo con operadores: $regex (contiene), $gte (>=), $lte (<=), $or (uno u otro)
export const buscarProductos = async (req, res) => {
    const { nombre, precioMin, precioMax, disponible } = req.body;
    const filtro = {};

    if (nombre) {
        const contiene = { $regex: nombre, $options: "i" };                  //"i": no distingue mayusculas
        filtro.$or = [{ nombre: contiene }, { descripcion: contiene }];
    }
    if (precioMin !== undefined || precioMax !== undefined) {
        filtro.precio = {};
        if (precioMin !== undefined) filtro.precio.$gte = Number(precioMin);
        if (precioMax !== undefined) filtro.precio.$lte = Number(precioMax);
    }
    if (disponible !== undefined) {
        filtro.disponible = disponible === true;
    }

    const productos = await Productos.listar(filtro);
    res.json({ cantidad: productos.length, productos });
};

//PUT /productos/:id: actualiza un producto. solo modifica los campos que vengan en el body
export const actualizarProducto = async (req, res) => {
    const id = Number(req.params.id);
    const producto = await Productos.obtenerPorId(id);

    if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    const { nombre, descripcion, precio, imagen, stock, disponible, tipo, destacado } = req.body;

    if ((precio !== undefined && Number(precio) <= 0) || (stock !== undefined && Number(stock) < 0)) {
        return res.status(400).json({ mensaje: "El precio debe ser mayor a 0 y el stock no puede ser negativo" });
    }

    const cambios = {
        ...(nombre !== undefined && { nombre }),
        ...(descripcion !== undefined && { descripcion }),
        ...(precio !== undefined && { precio: Number(precio) }),
        ...(imagen !== undefined && { imagen }),
        ...(stock !== undefined && { stock: Number(stock) }),
        ...(disponible !== undefined && { disponible }),
        ...(tipo !== undefined && { tipo }),
        ...(destacado !== undefined && { destacado })
    };

    //importante: un producto sin stock nunca puede quedar disponible
    const stockFinal = cambios.stock ?? producto.stock;
    if (stockFinal === 0) cambios.disponible = false;

    const actualizado = await Productos.actualizar(id, cambios);
    res.json({ mensaje: "Producto actualizado correctamente", producto: actualizado });
};

//DELETE /productos/:id: elimina un producto, pero solo si no figura en ninguna venta (integridad de datos)
export const eliminarProducto = async (req, res) => {
    const id = Number(req.params.id);
    const producto = await Productos.obtenerPorId(id);

    if (!producto) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
    }

    //"productos.id_producto" busca adentro del arreglo productos de cada venta
    const ventasAsociadas = await Ventas.listar({ "productos.id_producto": id });

    if (ventasAsociadas.length > 0) {
        return res.status(409).json({
            mensaje: "No se puede eliminar un producto que figura en ventas registradas",
            ventas: ventasAsociadas.map((venta) => venta.id),
            sugerencia: "Marque el producto como no disponible con PUT en lugar de eliminarlo"
        });
    }

    await Productos.eliminar(id);
    res.json({ mensaje: "Producto eliminado correctamente", producto });
};
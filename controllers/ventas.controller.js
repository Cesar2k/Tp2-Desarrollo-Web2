//Controlador que maneja ventas: valida los datos, llama a los modelos y arma la respuesta.
//Antes esta logica la tenianiamos en ventas.router.js y leia los JSON; ahora usa los modelos de mongo.
import * as Ventas from "../models/ventas.model.js";
import * as Productos from "../models/productos.model.js";
import * as Usuarios from "../models/usuarios.model.js";

//GET /ventas: devuelve todas las ventas. se puede filtrar por fecha con ?fecha=2026-05-01
export const listarVentas = async (req, res) => {
    const { fecha } = req.query;
    res.json(await Ventas.listar(fecha ? { fecha } : {}));
};

//GET /ventas/:id: devuelve el detalle de una venta, con los datos del usuario y el nombre de cada producto
export const obtenerVenta = async (req, res) => {
    const venta = await Ventas.obtenerPorId(Number(req.params.id));

    if (!venta) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    const usuario = await Usuarios.obtenerPorId(venta.id_usuario);

    //$in: trae de una sola consulta todos los productos cuyo id este en la lista
    const ids = venta.productos.map((item) => item.id_producto);
    const productos = await Productos.listar({ id: { $in: ids } });

    res.json({
        ...venta,
        usuario: usuario
            ? { id: usuario.id, nombre: `${usuario.nombre} ${usuario.apellido}`, email: usuario.email }
            : null,
        productos: venta.productos.map((item) => {
            const producto = productos.find((producto) => producto.id === item.id_producto);
            return { ...item, nombre: producto ? producto.nombre : "Producto no disponible" };
        })
    });
};

//POST /ventas: registra una venta nueva. esta protegida con verificarToken (ver el router)
export const crearVenta = async (req, res) => {
    const { direccion, productos: items } = req.body;

    if (!direccion || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ mensaje: "Debe enviar direccion y al menos un producto" });
    }

    //1. el usuario sale del token (lo cargo verificarToken), no del body
    const usuario = req.usuario;

    //2. se valida cada producto ANTES de modificar nada
    const detalle = [];

    for (const item of items) {
        const cantidad = Number(item.cantidad);
        const producto = await Productos.obtenerPorId(Number(item.id_producto));

        if (!producto) {
            return res.status(404).json({ mensaje: `No existe el producto con id ${item.id_producto}` });
        }
        if (!Number.isInteger(cantidad) || cantidad <= 0) {
            return res.status(400).json({ mensaje: `Cantidad inválida para el producto ${producto.id}` });
        }
        if (!producto.disponible) {
            return res.status(409).json({ mensaje: `El producto "${producto.nombre}" no está disponible` });
        }
        if (producto.stock < cantidad) {
            return res.status(409).json({
                mensaje: `Stock insuficiente para "${producto.nombre}"`,
                disponible: producto.stock,
                solicitado: cantidad
            });
        }

        detalle.push({ producto, cantidad });
    }

    //3. recien ahora, con todo validado, se descuenta el stock de cada producto
    for (const { producto, cantidad } of detalle) {
        const stock = producto.stock - cantidad;
        await Productos.actualizar(producto.id, { stock, disponible: stock > 0 });
    }

    //4. se guarda la venta con la misma estructura que tenia el JSON
    const nuevaVenta = await Ventas.crear({
        id_usuario: usuario.id,
        fecha: new Date().toISOString().slice(0, 10),
        direccion,
        total: detalle.reduce((acumulado, { producto, cantidad }) => acumulado + producto.precio * cantidad, 0),
        productos: detalle.map(({ producto, cantidad }) => ({ id_producto: producto.id, cantidad }))
    });

    res.status(201).json({ mensaje: "Venta registrada correctamente", venta: nuevaVenta });
};

//POST /ventas/reporte: resumen de ventas entre dos fechas. los filtros van en el body
export const reporteVentas = async (req, res) => {
    const { desde, hasta, id_usuario } = req.body;

    if (!desde || !hasta) {
        return res.status(400).json({ mensaje: "Debe enviar las fechas desde y hasta con formato AAAA-MM-DD" });
    }
    if (desde > hasta) {
        return res.status(400).json({ mensaje: "La fecha desde no puede ser posterior a hasta" });
    }

    //$gte = mayor o igual, $lte = menor o igual: las fechas AAAA-MM-DD se pueden comparar como texto
    const filtro = { fecha: { $gte: desde, $lte: hasta } };
    if (id_usuario !== undefined) filtro.id_usuario = Number(id_usuario);

    const ventas = await Ventas.listar(filtro);
    const totalRecaudado = ventas.reduce((acumulado, venta) => acumulado + venta.total, 0);

    res.json({
        desde,
        hasta,
        cantidadVentas: ventas.length,
        totalRecaudado,
        ticketPromedio: ventas.length ? Math.round(totalRecaudado / ventas.length) : 0,
        ventas
    });
};

//PUT /ventas/:id: modifica la direccion o la fecha, o reasigna la venta a otro usuario
export const actualizarVenta = async (req, res) => {
    const id = Number(req.params.id);

    if (!(await Ventas.obtenerPorId(id))) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    const { direccion, fecha, id_usuario } = req.body;

    if (direccion === undefined && fecha === undefined && id_usuario === undefined) {
        return res.status(400).json({ mensaje: "Debe enviar al menos uno de estos campos: direccion, fecha, id_usuario" });
    }

    //integridad: si se reasigna la venta, el nuevo usuario tiene que existir
    if (id_usuario !== undefined && !(await Usuarios.obtenerPorId(Number(id_usuario)))) {
        return res.status(404).json({ mensaje: `No existe el usuario con id ${id_usuario}` });
    }

    const venta = await Ventas.actualizar(id, {
        ...(direccion !== undefined && { direccion }),
        ...(fecha !== undefined && { fecha }),
        ...(id_usuario !== undefined && { id_usuario: Number(id_usuario) })
    });

    res.json({ mensaje: "Venta actualizada correctamente", venta });
};

//DELETE /ventas/:id: elimina una venta y devuelve al stock las unidades vendidas
export const eliminarVenta = async (req, res) => {
    const id = Number(req.params.id);
    const venta = await Ventas.obtenerPorId(id);

    if (!venta) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    await Ventas.eliminar(id);

    //se devuelve el stock de cada producto de la venta
    for (const item of venta.productos) {
        const producto = await Productos.obtenerPorId(item.id_producto);
        if (producto) {
            await Productos.actualizar(producto.id, {
                stock: producto.stock + item.cantidad,
                disponible: producto.stock === 0 ? true : producto.disponible   //si estaba agotado, vuelve a estar disponible
            });
        }
    }

    res.json({ mensaje: "Venta eliminada y stock nuevo", venta });
};
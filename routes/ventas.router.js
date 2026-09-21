import { Router } from "express";
import { leerDatos, guardarDatos, siguienteId } from "../utils/archivos.js";

const router = Router();

//GET /ventas: devuelve todas las ventas. se puede filtrar por fecha con ?fecha=2026-05-01
router.get("/", (req, res) => {
    let ventas = leerDatos("ventas");
    const { fecha } = req.query;

    if (fecha) {
        ventas = ventas.filter((venta) => venta.fecha === fecha);
    }

    res.json(ventas);
});

//GET /ventas/:id: devuelve el detalle de una venta, con los datos del usuario y el nombre de cada producto
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const venta = leerDatos("ventas").find((venta) => venta.id === id);

    if (!venta) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    const usuarios = leerDatos("usuarios");
    const productos = leerDatos("productos");

    const usuario = usuarios.find((usuario) => usuario.id === venta.id_usuario);

    res.json({
        ...venta,
        usuario: usuario
            ? { id: usuario.id, nombre: `${usuario.nombre} ${usuario.apellido}`, email: usuario.email }
            : null,
        productos: venta.productos.map((item) => {
            const producto = productos.find((producto) => producto.id === item.id_producto);
            return {
                ...item,
                nombre: producto ? producto.nombre : "Producto no disponible"
            };
        })
    });
});

//POST /ventas: registra una venta nueva. valida usuario y stock, calcula el total y descuenta unidades
router.post("/", (req, res) => {
    const { id_usuario, direccion, productos: items } = req.body;

    if (!id_usuario || !direccion || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ mensaje: "Debe enviar id_usuario, direccion y al menos un producto" });
    }

    //1. el usuario tiene que existir y estar activo
    const usuario = leerDatos("usuarios").find((usuario) => usuario.id === Number(id_usuario));

    if (!usuario) {
        return res.status(404).json({ mensaje: `No existe el usuario con id ${id_usuario}` });
    }
    if (!usuario.activo) {
        return res.status(403).json({ mensaje: "El usuario está inactivo y no puede comprar" });
    }

    //2. se valida cada producto ANTES de modificar nada
    const productos = leerDatos("productos");
    const detalle = [];

    for (const item of items) {
        const cantidad = Number(item.cantidad);
        const producto = productos.find((producto) => producto.id === Number(item.id_producto));

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

    //3. recien ahora, con todo validado, se descuenta el stock
    detalle.forEach(({ producto, cantidad }) => {
        producto.stock -= cantidad;
        if (producto.stock === 0) producto.disponible = false;
    });

    //4. se arma la venta con la misma estructura que el JSON
    const ventas = leerDatos("ventas");

    const nuevaVenta = {
        id: siguienteId(ventas),
        id_usuario: usuario.id,
        fecha: new Date().toISOString().slice(0, 10),
        direccion,
        total: detalle.reduce((acumulado, { producto, cantidad }) => acumulado + producto.precio * cantidad, 0),
        productos: detalle.map(({ producto, cantidad }) => ({ id_producto: producto.id, cantidad }))
    };

    ventas.push(nuevaVenta);
    guardarDatos("productos", productos);
    guardarDatos("ventas", ventas);

    res.status(201).json({ mensaje: "Venta registrada correctamente", venta: nuevaVenta });
});

//POST /ventas/reporte: resumen de ventas entre dos fechas. los filtros van en el body
router.post("/reporte", (req, res) => {
    const { desde, hasta, id_usuario } = req.body;

    if (!desde || !hasta) {
        return res.status(400).json({ mensaje: "Debe enviar las fechas desde y hasta con formato AAAA-MM-DD" });
    }
    if (desde > hasta) {
        return res.status(400).json({ mensaje: "La fecha desde no puede ser posterior a hasta" });
    }

    let ventas = leerDatos("ventas").filter((venta) => venta.fecha >= desde && venta.fecha <= hasta);

    if (id_usuario !== undefined) {
        ventas = ventas.filter((venta) => venta.id_usuario === Number(id_usuario));
    }

    const totalRecaudado = ventas.reduce((acumulado, venta) => acumulado + venta.total, 0);

    res.json({
        desde,
        hasta,
        cantidadVentas: ventas.length,
        totalRecaudado,
        ticketPromedio: ventas.length ? Math.round(totalRecaudado / ventas.length) : 0,
        ventas
    });
});

//PUT /ventas/:id: modifica la direccion o la fecha, o reasigna la venta a otro usuario
router.put("/:id", (req, res) => {
    const id = Number(req.params.id);
    const ventas = leerDatos("ventas");
    const venta = ventas.find((venta) => venta.id === id);

    if (!venta) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    const { direccion, fecha, id_usuario } = req.body;

    if (direccion === undefined && fecha === undefined && id_usuario === undefined) {
        return res.status(400).json({ mensaje: "Debe enviar al menos uno de estos campos: direccion, fecha, id_usuario" });
    }

    //integridad: si se reasigna la venta, el nuevo usuario tiene que existir
    if (id_usuario !== undefined) {
        const existe = leerDatos("usuarios").some((usuario) => usuario.id === Number(id_usuario));
        if (!existe) {
            return res.status(404).json({ mensaje: `No existe el usuario con id ${id_usuario}` });
        }
        venta.id_usuario = Number(id_usuario);
    }

    if (fecha !== undefined) venta.fecha = fecha;
    if (direccion !== undefined) venta.direccion = direccion;

    guardarDatos("ventas", ventas);
    res.json({ mensaje: "Venta actualizada correctamente", venta });
});

//DELETE /ventas/:id: elimina una venta y devuelve al stock las unidades vendidas
router.delete("/:id", (req, res) => {
    const id = Number(req.params.id);
    const ventas = leerDatos("ventas");
    const indice = ventas.findIndex((venta) => venta.id === id);

    if (indice === -1) {
        return res.status(404).json({ mensaje: "Venta no encontrada" });
    }

    const [eliminada] = ventas.splice(indice, 1);

    //se devuelve el stock de cada producto de la venta
    const productos = leerDatos("productos");

    eliminada.productos.forEach((item) => {
        const producto = productos.find((producto) => producto.id === item.id_producto);
        if (producto) {
            if (producto.stock === 0) producto.disponible = true;
            producto.stock += item.cantidad;
        }
    });

    guardarDatos("productos", productos);
    guardarDatos("ventas", ventas);

    res.json({ mensaje: "Venta eliminada y stock restituido", venta: eliminada });
});

export default router;
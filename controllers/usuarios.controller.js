//el controlador tiene la logica de cada ruta, es decir que valida los datos, llama al modelo y arma la respuesta necesaria
//el router solo dice que funcion atiende cada endpoint.
import * as Usuarios from "../models/usuarios.model.js";
import * as Ventas from "../models/ventas.model.js";
import { hashClave, compararClave } from "../utils/hashing.js";
import { generarToken } from "../utils/token.js";

//saca la contraseña antes de mandar un usuario en la respuesta (nunca se debe devolver al cliente)
const sinContraseña = ({ contraseña, ...usuario }) => usuario;

//GET /usuarios: devuelve todos los usuarios
export const listarUsuarios = async (req, res) => {
    const usuarios = await Usuarios.listar();
    res.json(usuarios.map(sinContraseña));
};

//GET /usuarios/:id: devuelve el usuario con el id que le pasemos por params
export const obtenerUsuario = async (req, res) => {
    const usuario = await Usuarios.obtenerPorId(Number(req.params.id));

    if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }
    res.json(sinContraseña(usuario));
};

//POST /usuarios: crea un usuario nuevo con la contraseña hasheada
export const crearUsuario = async (req, res) => {
    const { nombre, apellido, email, contraseña } = req.body;
    if (!nombre || !apellido || !email || !contraseña) {
        return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }
    if (await Usuarios.obtenerPorEmail(email)) {
        return res.status(409).json({ mensaje: "El email ya está en uso" });
    }

    const nuevoUsuario = await Usuarios.crear({
        nombre,
        apellido,
        email,
        contraseña: await hashClave(contraseña),   //se guarda el hash, nunca la contraseña real
        activo: true
    });

    res.status(201).json({ mensaje: "Usuario creado correctamente", usuario: sinContraseña(nuevoUsuario) });
};

//POST /usuarios/login: valida email y contraseña y, si estan bien, devuelve un token
//usamos POST porque son datos sensibles y no queremos que queden en la url.
export const login = async (req, res) => {
    const { email, contraseña } = req.body;
    if (!email || !contraseña) {
        return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }

    //1. buscamos el usuario SOLO por email (la contraseña guardada es un hash)
    const usuario = await Usuarios.obtenerPorEmail(email);

    //2. si existe, comparamos la contraseña escrita con el hash guardado
    const contraseñaCorrecta = usuario ? await compararClave(contraseña, usuario.contraseña) : false;

    if (!contraseñaCorrecta) {
        return res.status(401).json({ mensaje: "Email o contraseña incorrectos" });
    }
    if (!usuario.activo) {
        return res.status(403).json({ mensaje: "Usuario inactivo" });
    }

    //3. todo bien: devolvemos el token junto con los datos del usuario
    res.json({ mensaje: "Login exitoso", token: generarToken(usuario), usuario: sinContraseña(usuario) });
};

//PUT /usuarios/:id: actualiza solo los campos que vengan en el body
export const actualizarUsuario = async (req, res) => {
    const id = Number(req.params.id);
    const { nombre, apellido, email, contraseña, activo } = req.body;

    if (!(await Usuarios.obtenerPorId(id))) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    //el usuario puede conservar su email, pero no usar uno que ya tenga otro usuario
    if (email) {
        const otro = await Usuarios.obtenerPorEmail(email);
        if (otro && otro.id !== id) {
            return res.status(409).json({ mensaje: "El email ya está en uso" });
        }
    }

    const actualizado = await Usuarios.actualizar(id, {
        ...(nombre !== undefined && { nombre }),
        ...(apellido !== undefined && { apellido }),
        ...(email !== undefined && { email }),
        ...(contraseña !== undefined && { contraseña: await hashClave(contraseña) }),
        ...(activo !== undefined && { activo })
    });

    res.json({ mensaje: "Usuario actualizado correctamente", usuario: sinContraseña(actualizado) });
};

//DELETE /usuarios/:id: elimina un usuario, pero solo si no tiene ventas asociadas (integridad de datos)
export const eliminarUsuario = async (req, res) => {
    const id = Number(req.params.id);
    const usuario = await Usuarios.obtenerPorId(id);

    if (!usuario) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }

    const ventasAsociadas = await Ventas.listar({ id_usuario: id });   //filtro de Mongo: las ventas de este usuario

    if (ventasAsociadas.length > 0) {
        return res.status(409).json({
            mensaje: "No se puede eliminar un usuario que tenga ventas asociadas",
            ventas: ventasAsociadas.map((venta) => venta.id),
            sugerencia: "Primero elimine las ventas asociadas a este usuario para poder eliminarlo"
        });
    }

    await Usuarios.eliminar(id);
    res.json({ mensaje: "Usuario eliminado correctamente", usuario: sinContraseña(usuario) });
};
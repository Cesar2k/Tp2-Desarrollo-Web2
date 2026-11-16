//aca el middleware de autenticacion, que protege las rutas que requieren un usuario logueado
//se pone antes del controlador de la ruta, porque si el token no es valido, no se ejecuta el controlador de la ruta
//tambien el cliente manda el token en la cabecera con "Authorization: Bearer <token>"

import { verificarFirma } from "../utils/token.js";
import * as Usuarios from "../models/usuarios.model.js";   //N: el usuario se busca en MongoDB

export const verificarToken = async (req, res, next) => {   //N: async, porque consulta la base
    const [tipo, token] = (req.headers.authorization || "").split(" ");

    //bearer es el tipo de token que se usa en la cabecera, si no es bearer o no hay token se rechaza.
    if (tipo !== "Bearer" || !token) {
        res.setHeader("WWW-Authenticate", "Bearer");   //le indicamos al cliente como autenticarse (como en el libro)
        return res.status(401).json({ mensaje: "Necesitas iniciar sesión para hacer esto" }); //401: no autorizado
    }

    try {
        //verificamos la firma y el vencimiento del token, si algo falla salta al catch y se rechaza
        const datos = verificarFirma(token);

        //buscamos el usuario por si se desactivo o lo borraron despues de que inicio sesion
        const usuario = await Usuarios.obtenerPorId(datos.id);   //N: antes era leerDatos("usuarios").find(...)

        if (!usuario) {
            return res.status(401).json({ mensaje: "El usuario no fue encontrado" }); //401: no autorizado
        }
        if (!usuario.activo) {
            return res.status(403).json({ mensaje: "Usuario inactivo" }); //403: prohibido
        }

        //dejamos el usuario disponible para el controlador que sigue y pasamos al siguiente
        req.usuario = { id: usuario.id, nombre: usuario.nombre, email: usuario.email };
        next();
    } catch (error) {
        const mensaje = error.name === "TokenExpiredError"
            ? "La sesión expiró, vuelve a iniciar sesión"
            : "Token no válido";
        return res.status(401).json({ mensaje }); //401: no autorizado
    }
};
//aca el middlware de autenticacion, que proteje las rutas que requieren un usuario logueado
//se pone antes del controlador de la ruta, porque si el token no es valido, no se ejecuta el controlador de la ruta
// tambien el cliente manda el token en la cabecera con "Authorization: Bearer <token>"

import { verificarFirma } from "../utils/token.js";
import {leerDatos} from "../utils/archivos.js";

export const verificarToken = (req, res, next) => 
    {
    const [tipo, token] = (req.headers.authorization || "").split(" ");
    
    if (tipo !== "Bearer" || !token) //bearer es el tipo de token que se usa en la cabecera, si no es bearer o no hay token se rechaza.
        {
            return res.status(401).json({ mensaje: "Token no válido" }); //401 es el codigo de error de no autorizado
        }
    

    try 
    {
        //en este punto vamos a verificar la firma del token, si no algo falla salta el catch y se rechaza el token
        const veriticarFirma = verificarFirma(token);
        //aca buscamos el usuario por si lo se desactivo o lo borarron despues de que se logueo, si no existe el usuario se rechaza el token
        const usuario = leerDatos("usuarios").find((usuario) => usuario.id ===  veriticarFirma.id);

        if (!usuario)
        {
            return res.status(401).json({ mensaje: "el usuario no fue encontrado" }); //401 es el codigo de error de no autorizado
        }
        if (!usuario.activo)
        {
            return res.status(403).json({ mensaje: "usuario inactivo" }); //403 es el codigo de error de prohibido
        }

        //aca dejsmoa el usuario disponible para el controlador que sigue y pasamos al siguiente middleware o controlador
        req.usuario = {id: usuario.id, nombre: usuario.nombre, email: usuario.email};
        next();
    }
    catch (error) 
    {
        const mensaje = error.name === "TokenExpiredError"
        ? "la session experi, volve a iniciar sesion"
        : "Token no válido";
        return res.status(401).json({ mensaje: mensaje }); //401 es el codigo de error de no autorizado
    }
};
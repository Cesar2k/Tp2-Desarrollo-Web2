//token de acceso con JSON Web Token
//el JWT tiene 3 partes separadas por puntos: encabezado.cargaUtil.firma
//la carga util se puede leer (no se encripta), por eso nunca se pone la contraseña dentro
//la firma se hace con JWT_SECRET: si alguien modifica el token, la firma deja de coincidir y se rechaza
import jwt from "jsonwebtoken";

//crea el token cuando el usuario inicia sesion
export const generarToken = (usuario) => {
    return jwt.sign(
        { id: usuario.id, email: usuario.email },       //aca la carga util: los datos que vamos a recuperar despues
        process.env.JWT_SECRET,                         //aca firma con la clave secreta
        { expiresIn: process.env.JWT_EXPIRA || "2h" }   //cuanto va a durar la sesion, puede ser mas o menos tiempo
    );
};

//verifica la firma y que no haya vencido. Si algo falla, tira un error
export const verificarFirma = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET);
};
//token de acceso con Json wrb token
//el jwe tiene 3 partes separadas por puntos> encabezado, carga util y firma
//la carga util se puede leer (no se encripta)  por eso nunca se pone la contra dentro
//la firma se hace con jwt_secret, si alguien modicica el token, la firma de de councidir y se rechaza
import jwt from "jsonwebtoken";

export const generateToken = (usuario) => {
    jwt.sign(
        {
            id: usuario.id, email: usuario.email},  //aca carga util. los datos que vamos a recuperar despues
        process.env.JWT_SECRET,                     // aca firma con la clave secreta 
        {expiresIN: process.env.JWT_EXPIRES_In || "2h" } // cuanto va a durar la sesion, puede ser mas o menos tiempos. 
    );
};
export const verifyFirma = (token) => { jwt.verify(token, process.env.JWT_SECRET) };
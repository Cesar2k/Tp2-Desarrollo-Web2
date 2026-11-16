//en este caso model (usuarios) es el que va a interactuaar con la coleccion "usuarios" de la base de datos.

import { coleccion, siguienteId } from "../db/conexion.js";
const SIN_ID_MONGO = { projection: { _id: 0 } }; //para que no devuelva el _id interno de mongo 

//devuelve todos los usuarios ordenados por id
export const listar = () =>
    coleccion("usuarios").find({}, SIN_ID_MONGO).sort({ id: 1 }).toArray();

//devuelve el usuario con ese id, o null si no existe
export const obtenerPorId = (id) =>
    coleccion("usuarios").findOne({ id }, SIN_ID_MONGO);

//busca por email sin importar mayusculas/minusculas (se usa en el login y en el registro).
//$regex con la opcion "i" (insensitive) compara "Cesar@..." igual que "cesar@..." y tambien hace otras comparaciones
//los caracteres especiales del email (como el punto) se escapan para que se comparen tal cual
export const obtenerPorEmail = (email) =>  //que cosa dificil
{
    const emailEscapado = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");  //?!?!?!?!?!?!?!?!?!?!
    return coleccion("usuarios").findOne({ email: { $regex: `^${emailEscapado}$`, $options: "i" } }, SIN_ID_MONGO);
};

export const crear = async (datos) =>
{
    const usuario = { id: await siguienteId("usuarios"), ...datos }; //asignamos un id unico y copiamos los datos
    await coleccion("usuarios").insertOne(usuario);
    delete usuario._id;                                       //eliminamos el _id que mongo le agrega al objeto
    return usuario;
};

//updateOne + set cambia solo los campos que le damos y deja los otros iguales
export const actualizar = async (id, cambios) =>
{
    await coleccion("usuarios").updateOne({ id }, { $set: cambios });
    return obtenerPorId(id);
};

//deleteOne borra el usuario con ese id
export const eliminar = (id) =>
    coleccion("usuarios").deleteOne({ id });
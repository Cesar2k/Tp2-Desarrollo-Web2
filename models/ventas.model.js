//en este caso model (ventas) es el que interactua con la coleccion "ventas" de la base de datos.

import { coleccion, siguienteId } from "../db/conexion.js";
const SIN_ID_MONGO = { projection: { _id: 0 } }; //para que no devuelva el _id interno de mongo (nuestro id numerico si se devuelve)

//devuelve las ventas que cumplen el filtro (por ejemplo { fecha: "2026-05-01" }). Sin filtro devuelve todas
export const listar = (filtro = {}) =>
    coleccion("ventas").find(filtro, SIN_ID_MONGO).sort({ id: 1 }).toArray();

//devuelve la venta con ese id, o null si no existe
export const obtenerPorId = (id) =>
    coleccion("ventas").findOne({ id }, SIN_ID_MONGO);

export const crear = async (datos) =>
{
    const venta = { id: await siguienteId("ventas"), ...datos }; //asignamos un id unico y copiamos los datos
    await coleccion("ventas").insertOne(venta);
    delete venta._id;                                            //eliminamos el _id que mongo le agrega al objeto
    return venta;
};

//updateOne + $set cambia solo los campos que le damos y deja los otros iguales
export const actualizar = async (id, cambios) =>
{
    await coleccion("ventas").updateOne({ id }, { $set: cambios });
    return obtenerPorId(id);
};

//deleteOne borra la venta con ese id
export const eliminar = (id) =>
    coleccion("ventas").deleteOne({ id });
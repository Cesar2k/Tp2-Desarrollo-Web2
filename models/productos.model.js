//en este caso model (productos) es el que interactua con la base de datos, es decir, el que hace las consultas a la base de datos.

import { coleccion, siguienteId } from "../db/conexion.js";
const SIN_ID_MONGO = { projection: { _id: 0 } }; //para que no devuelva el _id interno de mongo (nuestro id numerico si se devuelve)

//find (filtro) devuelve un array con todos los productos que cumplen el filtro. Si no se pasa filtro devuelve todos los productos.
export const listar = (filtro = {}) =>
    coleccion("productos").find(filtro, SIN_ID_MONGO).sort({ id: 1 }).toArray();

//findOne devuelve el primer producto que cumple el filtro, o null si no hay ninguno
export const obtenerPorId = (id) =>
    coleccion("productos").findOne({ id }, SIN_ID_MONGO);

export const crear = async (datos) =>
{
    const producto = { id: await siguienteId("productos"), ...datos }; //asignamos un id unico y copiamos los datos que llegan por parametro
    await coleccion("productos").insertOne(producto);                  //insertamos el producto en la coleccion
    delete producto._id;                                               //eliminamos el _id que mongo le agrega al objeto
    return producto;                                                   //devolvemos el producto creado
};

//updateOne + $set cambia solo los campos que le damos y deja los otros iguales
export const actualizar = async (id, cambios) =>
{
    await coleccion("productos").updateOne({ id }, { $set: cambios });
    return obtenerPorId(id);
};

//deleteOne borra el primer producto que cumple el filtro
export const eliminar = (id) =>
    coleccion("productos").deleteOne({ id });
//aca escribimos el script que nos deja migrar los datos de la base de datos MongoDB.
//se ejecuta usando "npm run seed" y se conecta a la base de datos, borra las colecciones y las vuelve a crear con los datos de los archivos JSON que estan en la carpeta "data".

import dotenv from "dotenv";
import { conectarDB, coleccion, desconectarDB } from "../db/conexion.js";
import {leerDatos} from "../utils/archivos.js";

dotenv.config({quiet: true}); //para que no tire error si no encuentra el archivo .env

try 
{
    await conectarDB();
     
    for (const nombreColeccion of ["usuarios", "productos", "ventas"])
    {
        const datos = leerDatos (nombreColeccion);
        await coleccion (nombreColeccion).deleteMany({}); //borramos todos los documentos de la coleccion
        await coleccion (nombreColeccion).insertMany(datos);
        await coleccion (nombreColeccion).createIndex({ id: 1}, {unique: true}); //creamos un indice unico en el campo nombre para que no se repitan los nombres de los productos

        console.log(`Coleccion ${nombreColeccion}: ${datos.length} documentos cargados`);
    }
    console.log ("Migracion completada");
}
catch (error)
{
    console.error("Error al migrar los datos:", error.message);
} finally
{
    await desconectarDB();


}

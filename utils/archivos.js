import {readFileSync, writeFileSync} from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

//aca tenemos la ruta absoluta de la carpeta data
const __dirname = path.dirname(fileURLToPath(import.meta.url));  
const carpetaDatos = path.join(__dirname, '..', '/data');

//leer datos: arma la ruta, lee el archivo como texto y lo converte en arreglo de Js con Json.parse. utf8 ya sabemos para que sirve
export const leerDatos = (nombreArchivo, data) => 
    {
const ruta = path.join(carpetaDatos, `${nombreArchivo}.json`);
        return JSON.parse(readFileSync(ruta, 'utf-8'));
    };

//Guarda datos: arma la ruta, convierte el arreglo de Js en texto con Json.stringify y lo guarda en el archivo.
//aca guardamos los datos en un archivo json desde la carpeta data
export const guardarDatos = (nombreArchivo, data) =>
{
    const ruta = path.join(carpetaDatos, `${nombreArchivo}.json`);
    writeFileSync(ruta, JSON.stringify(data, null, 2), 'utf-8');   
};

//este escript nos devuelve el siguiente id de la lista de objetos que le pasemos, 
// si la lista esta vacia devuelve 1, sino devuelve el maximo id + 
export const siguienteId = (lista) =>
    lista.length === 0 ? 1 : Math.max(...lista.map((item) => item.id)) + 1;
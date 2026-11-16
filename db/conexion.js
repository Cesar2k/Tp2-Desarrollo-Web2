//en este script armamos la conexion a la base de datos que es Mongodb. 
//Se conecta solo una vez y despues se puede usar en cualquier parte del proyecto.

import { MongoClient } from "mongodb";
let cliente;
let db;

// la llamamos desde el index.js antes de levantar el server para que se conecte a la base de datos y quede disponible en toda la tienda
// el cliente se va a crear aca adentro y se va a exportar para que se pueda usar en cualquier parte del proyecto

export const conectarDB = async () => 
    {
        cliente = new MongoClient(process.env.MONGO_URI, {serverSelectionTimeoutMS: 5000}); //quiere decir que si en 5s no se conecta nos da error.
        await cliente.connect();
        db = cliente.db(process.env.MONGO_DB);
        console.log("Conectado a la DB de MongoDB");
    };

export const coleccion = (nombre) =>  db.collection(nombre); //esta funcion nos devuelve la coleccion que le pasemos por parametro.

//cierra la conexion. la usan los scripts que terminan cuando hacen su trabajo
export const desconectarDB = () => cliente.close();
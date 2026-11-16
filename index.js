import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {fileURLToPath} from "url";
import path from "path";

import usuariosRouter from "./routes/usuarios.router.js";
import productosRouter from "./routes/productos.router.js";
import ventasRouter from "./routes/ventas.router.js";
import logger from "./middlewares/logger.middleware.js";
import { conectarDB } from "./db/conexion.js";   //ahora hay una conexion a MongoDB


dotenv.config({quiet: true});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

//habilitamos CORS para permitir solicitudes desde otros origenes
const origenesPermitidos = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origen) => origen.trim())
    .filter(Boolean);

app.use(cors({
    origin: origenesPermitidos,                       //si el origen no está en la lista, el navegador cualquier asea nos bloquea la respuesta
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"] //authorization es para enviar el token de autenticacion en el header
}));

const PORT = process.env.PORT || 3000;


//aca usamos middleware para parsear el body de las requests (convierte el body de las peticiones (JSON) a un objeto JS)

app.use(logger);
app.use(express.json());
app.use('/usuarios', usuariosRouter);
app.use('/productos', productosRouter);
app.use('/ventas', ventasRouter);

app.use(express.static(path.join(__dirname, "public")));  //hace que express sirva archivos estaticos (html, css, js) desde la carpeta public

//cambio al anterior scriopt que primero nos conectamos a MongoDB y recien despues levantamos el servidor.
//si la base no responde, no tiene sentido arrancar! entonces mostramos el error y cortamos.
try {
    await conectarDB();
    app.listen(PORT, (error) => {
        if (error) {
            console.error("No se pudo iniciar el servidor:", error.message);   //por ejemplo, el puerto ya esta en uso
            return;
        }
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
} catch (error) {
    console.error("No se pudo conectar a la base de datos MongoDb:", error.message);
    process.exit(1);   //cortamos el proceso con codigo de error
}
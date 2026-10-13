
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import {fileURLToPath} from "url";
import path from "path";    

import usuariosRouter from "./routes/usuarios.router.js";
import productosRouter from "./routes/productos.router.js";
import ventasRouter from "./routes/ventas.router.js";
import logger from "./middlewares/logger.middleware.js";


dotenv.config({quiet: true});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

//habilitamos CORS para permitir solicitudes desde otros origenes
const origenesPermitidos = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((origen) => origen.trim())
    .filter(Boolean);

app.use(cors({
    origin: origenesPermitidos,                       //si el origen no está en la lista, crome nos bloquea la respuesta
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"] //autorizacion es para enviar token de autenticacion en el header
}));

const PORT = process.env.PORT || 3000;


//aca usamos middleware para parsear el body de las requests (convert body de las peticiones (JSON) a un objeto JS)

app.use(logger);
app.use(express.json());
app.use('/usuarios', usuariosRouter);
app.use('/productos', productosRouter);
app.use('/ventas', ventasRouter);

app.use(express.static(path.join(__dirname, "public")));  //De lo ultimo agregado. hace que express sirva archivos estaticos (html, css, js) desde la carpeta public 

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import usuariosRouter from "./routes/usuarios.router.js";
import productosRouter from "./routes/productos.router.js";
import ventasRouter from "./routes/ventas.router.js";
import logger from "./middlewares/logger.middleware.js";


dotenv.config({quiet: true});

const app = express();

//habilitamos CORS para permitir solicitudes desde otros origenes
app.use(cors());  //CORS (Cross-Origin Resource Sharing) es un mecanismo que permite que los recursos de un servidor sean solicitados desde otro dominio distinto al que sirve el recurso. En este caso, se está utilizando el middleware cors para habilitar CORS en la aplicación Express.

const PORT = process.env.PORT || 3000;


//aca usamos middleware para parsear el body de las requests (convert body de las peticiones (JSON) a un objeto JS)

app.use(logger);
app.use(express.json());
app.use('/usuarios', usuariosRouter);
app.use('/productos', productosRouter);
app.use('/ventas', ventasRouter);

app.use(express.static("public"));  //De lo ultimo agregado. hace que express sirva archivos estaticos (html, css, js) desde la carpeta public 

//PROBAMOS UNA RUTA PARA VER COMO FUNCIONA
app.get("/", (req, res) => {
    res.send({ mensaje: "Hola mundo desde express!" });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
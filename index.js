
import express from "express";
import dotenv from "dotenv";
import usuariosRouter from "./routes/usuarios.router.js";
import productosRouter from "./routes/productos.router.js";
import ventasRouter from "./routes/ventas.router.js";

dotenv.config({quiet: true});

const app = express();
const PORT = process.env.PORT || 3000;

//aca usamos middleware para parsear el body de las requests (convert body de las peticiones (JSON) a un objeto JS)

app.use(express.json());
app.use('/usuarios', usuariosRouter);
app.use('/productos', productosRouter);
app.use('/ventas', ventasRouter);

//PROBAMOS UNA RUTA PARA VER COMO FUNCIONA
app.get("/", (req, res) => {
    res.send({ mensaje: "Hola mundo desde express!" });
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
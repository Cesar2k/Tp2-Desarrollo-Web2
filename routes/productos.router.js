//el router solo define los endpoints: la logica de cada uno esta en el controlador.
import { Router } from "express";
import {
    listarProductos,
    obtenerProducto,
    crearProducto,
    buscarProductos,
    actualizarProducto,
    eliminarProducto
} from "../controllers/productos.controller.js";

const router = Router();

router.get("/", listarProductos);              //GET /productos
router.post("/", crearProducto);               //POST /productos
router.post("/buscar", buscarProductos);       //POST /productos/buscar
router.get("/:id", obtenerProducto);           //GET /productos/:id
router.put("/:id", actualizarProducto);        //PUT /productos/:id
router.delete("/:id", eliminarProducto);       //DELETE /productos/:id

export default router;
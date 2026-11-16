//el router solo define los endpoints: la logica de cada uno esta en el controlador.
import { Router } from "express";
import { verificarToken } from "../middlewares/auth.middleware.js";
import {
    listarVentas,
    obtenerVenta,
    crearVenta,
    reporteVentas,
    actualizarVenta,
    eliminarVenta
} from "../controllers/ventas.controller.js";

const router = Router();

router.get("/", listarVentas);                        //GET /ventas
router.post("/", verificarToken, crearVenta);         //POST /ventas  (protegida con JWT: primero verificarToken)
router.post("/reporte", reporteVentas);               //POST /ventas/reporte
router.get("/:id", obtenerVenta);                     //GET /ventas/:id
router.put("/:id", actualizarVenta);                  //PUT /ventas/:id
router.delete("/:id", eliminarVenta);                 //DELETE /ventas/:id

export default router;
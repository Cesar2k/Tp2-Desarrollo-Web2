//router es un miniservidor que agrupa rutas relacionadas. en lugar de tener 20 rutas en index.js, podemos tener 5 routers con 4 rutas cada uno.
//ahora el router solo define los endpoints: la logica de cada uno esta en el controlador.
import { Router } from "express";
import {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  login,
  actualizarUsuario,
  eliminarUsuario
} from "../controllers/usuarios.controller.js";

const router = Router();

router.get("/", listarUsuarios);                 //GET /usuarios
router.post("/", crearUsuario);                  //POST /usuarios
router.post("/login", login);                    //POST /usuarios/login
router.get("/:id", obtenerUsuario);              //GET /usuarios/:id
router.put("/:id", actualizarUsuario);           //PUT /usuarios/:id
router.delete("/:id", eliminarUsuario);          //DELETE /usuarios/:id

export default router;
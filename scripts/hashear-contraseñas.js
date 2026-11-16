//script que convierte la contra en hash para guardarla en la base de datos
//tambiuen se ejecuta con npm run hash. ademas si se ejecuta 2 veces no pasa nada, porque saltea las que estan hasheadas.

import {leerDatos, guardarDatos} from "../utils/archivos.js";
import {hashClave, estaHasheada} from "../utils/hashing.js";

const usuarios = leerDatos("usuarios");
let cantidad = 0;

for (const usuario of usuarios) {
    if (!estaHasheada(usuario.contraseña)) {
        usuario.contraseña = await hashClave(usuario.contraseña);
        cantidad++;
    }
}

guardarDatos("usuarios", usuarios);
console.log(`listo: ${cantidad} contraseñas hasheadas de ${usuarios.length} usuarios.`);
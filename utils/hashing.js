//hay que tener en cuenta que el trabajo nos pide encriptar las contraseñas
//pero nos dice de usar hashin, que no encripta sino que hace un hash de la contraseña, que es irreversible.

import bcrypt from "bcryptjs";

//la cantidad de rondas que se le aplicaran al hash
//las rondas son la cantidad de veces que se aplica el algoritmo de hash a la contraseña, lo que hace que sea más seguro, pero tambien mas lento.

const RONDAS = 10;

//convierte la clave en un hash, que es irreversible, y lo devuelve
//la funcion es asincrona porque bcrypt.genSalt es asincrona, y bcrypt.hashSync es sincrona, pero como la funcion es asincrona, podemos usar await para esperar a que se genere el salt antes de hashear la clave.
export const hashClave = async (clave) => {
    const salt = await bcrypt.genSalt(RONDAS);
  return bcrypt.hashSync(clave, salt);
};

//compara la contrase;a que escribio el usuario con la que esta en la base de datos, que es un hash, y devuelve true si son iguales, o false si no lo son
export const compararClave = async (clave, hash) => {
  return bcrypt.compareSync(clave, hash);
};

export const estaHasheada = (valor) => typeof valor === "string" && /^\$2[aby]\$\d{2}\$/.test(valor)
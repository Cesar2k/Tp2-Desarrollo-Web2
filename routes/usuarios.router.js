//router es un miniservidor que agrupa rutas relacionadas. en lugar de tener 20 rutas en index.js, podemos tener 5 routers con 4 rutas cada uno.
import { Router } from "express";
//import { leerDatos } from "../utils/archivos.js";
import { leerDatos, guardarDatos, siguienteId } from "../utils/archivos.js";


const router = Router();

//saca la contraseña antes de mandar un usuario en la respuesta (nunca se debe devolver al cliente)
const sinContraseña = ({ contraseña, ...usuario }) => usuario;

//GET /usuarios: devuelve todos los usuarios que estan en el archivo usuarios.json
router.get("/", (req, res) => {
  const usuarios = leerDatos("usuarios");
  res.json(usuarios.map(sinContraseña));
});


//GET /usuarios/:id: devuelve el usuario con el id que le pasemos por params, si no lo encuentra devuelve un mensaje de error
router.get("/:id", (req, res) => {
    const id = Number(req.params.id);
    const usuarios = leerDatos("usuarios").find((usuario) => usuario.id === id);

    if (!usuarios) {
        return res.status(404).json({ mensaje: "Usuario no encontrado" });
    }   
    res.json(sinContraseña(usuarios));
  });

  //POST /usuarios: agrega un nuevo usuario al archivo usuarios.json, le asigna un id autoincremental y devuelve el usuario creado
router.post("/", (req, res) => {
    const {nombre, apellido, email, contraseña} = req.body;
    if (!nombre || !apellido || !email || !contraseña) {
        return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
    }   
    const usuarios = leerDatos("usuarios");
       if(usuarios.some((usuario) => usuario.email.toLowerCase() === email.toLowerCase())){
        return res.status(409).json({ mensaje: "El email ya está en uso" });
    }
    const nuevoUsuario = {
        id: siguienteId(usuarios),
        nombre,
        apellido,
        email,
        contraseña,
        activo: true
    };
    usuarios.push(nuevoUsuario);
    guardarDatos("usuarios", usuarios);

    res.status(201).json({ mensaje: "Usuario creado correctamente", usuario: sinContraseña(nuevoUsuario)});

});

//Post /usuarios/login valida el mail y contraseña del usuario. 
//usamos POST porque son datos sensibles y no queremos que queden en la url.
router.post("/login", (req, res) => 
    {
        const {email, contraseña} = req.body;
        if (!email || !contraseña) {
            return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
        }
        
        const usuarios = leerDatos("usuarios").find((usuario) => 
            usuario.email.toLowerCase() === email.toLowerCase() && usuario.contraseña === contraseña);
 
        if (!usuarios) {
            return res.status(401).json({ mensaje: "Email o contraseña incorrectos" });
        }
        if (!usuarios.activo) {
            return res.status(403).json({ mensaje: "Usuario inactivo" });
        }
        res.json({ mensaje: "Login exitoso", usuario: sinContraseña(usuarios )});
    });
//Por que usamos post y no get para login?
//  Porque los datos de login son sensibles 
// y no queremos que queden en la url.
//con POST los datos van en el body de la request y no en la url,
//  por lo que no quedan expuestos.

//PUT /usuarios/:id: actualiza los datos de un usuario. 
//solo modifica los campos que le pasemos en el body, si no encuentra el usuario devuelve un mensaje de error

router.put("/:id", (req, res) => {
    const id = Number(req.params.id);
    const {nombre, apellido, email, contraseña, activo} = req.body;
    const usuarios = leerDatos("usuarios");
    const indice = usuarios.findIndex((usuario) => usuario.id === id);

    if (indice === -1) 
        {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });
        }
        if(email && usuarios.some((usuario) => usuario.id !== id && usuario.email.toLowerCase() === email.toLowerCase())){
            return res.status(409).json({ mensaje: "El email ya está en uso" });
        }
        usuarios[indice] = 
        {
            ...usuarios[indice],
            ...(nombre !== undefined && { nombre }),
            ...(apellido !== undefined && { apellido }),
            ...(email !== undefined && { email }),
            ...(contraseña !== undefined && { contraseña }),
            ...(activo !== undefined && { activo }),
        };
        guardarDatos("usuarios", usuarios);
        res.json({ mensaje: "Usuario actualizado correctamente", usuario:sinContraseña (usuarios[indice]) });
        
            //algo que use fue el FinIndex y no el find. 
            //Porque el findIndex nos devuelve el indice del 
            //elemento que cumple la condicion, 
            //y el find nos devuelve el elemento en si.
            //tambien hay otra validacion. Que es que el usuario modificado
            //pueda conservar su email, pero que no pueda usar un email 
            // que ya este en uso por otro usuario.
    });

//DELETE /usuarios/:id: elimina un usuario, pero solo si no tiene ventas asociadas.
//si tiene ventas asociadas, devuelve un mensaje de error.

router.delete("/:id", (req, res) => 
    {
        const id = Number(req.params.id);
        const usuarios = leerDatos("usuarios");
        const indice = usuarios.findIndex((usuario) => usuario.id === id);
    
        if (indice === -1)
        {
            return res.status(404).json({ mensaje: "Usuario no encontrado" });  
        }
        //integridad de datos, no se puede borrar un usario que este referenciado
        //en otra tabla, en este caso ventas.

        const ventasasociadas = leerDatos("ventas").filter((venta) => venta.id_usuario === id);

        if (ventasasociadas.length > 0)
        {
            return res.status(409).json({
                 mensaje: "No se puede eliminar un usuario que tenga ventas asociadas",
                 ventas: ventasasociadas.map((venta) => venta.id),
                 sugerencia: "Primero elimine las ventas asociadas a este usuario para poder eliminarlo"
                });
        }

        const [eliminado] = usuarios.splice(indice, 1);
        guardarDatos("usuarios", usuarios);

        res.json({ mensaje: "Usuario eliminado correctamente", usuario:sinContraseña (eliminado) });
    });


export default router;


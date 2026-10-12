//middlewares son funciones que se ejecutan antes de que la solicitud llegue a la ruta final.
//Se utilizan para realizar tareas como la autenticación, el registro de solicitudes, la validación de datos, entre otras.
const logger = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};
export default logger;  
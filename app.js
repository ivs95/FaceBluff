// app.js


/*
CAMBIAR NOMBRE DE LOS EJS
VALIDACION DE FORMULARIOS. (queda test)
CSS FIGURA 8 mostrar respuestas
CAMBIAR COLOR BOTONES DE LOS NOMBRES
PREGUNTAS: RESPONDER POR OTRO AMIGO Y LO DE LA PUNTUACION
FOTOS DE LA FIGURA 7



ESTO YA PARA LUEGO
Modificar figura 3 se tiene que ver una lista de fotos.
AÑADIR EN LA FIGURA 3 boton de subir imagen.
RUTA PARA SUBIR UNA IMAGEN + EJS + DAOS.

*/

// Crear un servidor Express.js


// Crear un pool de conexiones a la base de datos de MySQL
const config = require("./config");
const DAOUsuarios = require("./DAOUsuario");
const DAOPreguntas = require("./DAOPreguntas");
const DAOAmigo = require("./DAOAmigo")
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const fs = require("fs");
const express_session = require("express-session");
const express_mysqlsession = require("express-mysql-session");
// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOUsers
const daoU = new DAOUsuarios(pool);
const daoA = new DAOAmigo(pool);
const daoP = new DAOPreguntas(pool);
const ut = new utils();

//crear routers
const routerUsers = require("./routerUsers")
const routerQuestions = require("./routerQuestions")

const ficherosEstaticos = path.join(__dirname, "public");
const MySQLStore = express_mysqlsession(express_session);
const sessionStore = new MySQLStore(config.mysqlConfig);
const middlewareSession = express_session({
    saveUninitialized: false, secret: "foobar34",
    resave: false,
    store: sessionStore
});
app.use(middlewareSession);


// Crear una instancia de DAOUsuarios

app.use("/users", routerUsers)
app.use("/question", routerQuestions)

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

//error 404
app.use(function (request, response, next) {
    response.status(404);
    response.render("error404", { url: request.url });
});

// Arrancar el servidor
app.listen(config.port, function (err) {
    if (err) {
        console.log("ERROR al iniciar el servidor");
    } else {
        //REINICIAR USER
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});
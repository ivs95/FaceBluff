// app.js


/*
VALIDACION DE FORMULARIOS.
CSS FIGURA 8
PROBAR RECHAZAR PETICION AMIGO
CAMBIAR COLOR BOTONES DE LOS NOMBRES
VER QUE AMIGOS SALGAN LAS DOS COLUMNAS
PREGUNTAS: RESPONDER POR OTRO AMIGO Y LO DE LA PUNTUACION
USUARIO SUBIR FOTO DE PERFIL AL REGISTRARSE


ESTO YA PARA LUEGO
Modificar figura 3 se tiene que ver una lista de fotos.
AÑADIR EN LA FIGURA 3 boton de subir imagen.
RUTA PARA SUBIR UNA IMAGEN + EJS + DAOS.







/*const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const express_session = require("express-session");
const express_mysqlsession = require("express-mysql-session");

//const MySQLStore = express_mysqlsession(express_session);
//const pool = mysql.createPool(config.mysqlConfig);
//const sessionStore = new MySQLStore(config.mysqlConfig);
const middlewareSession = MySQLStore({
     saveUninitialized: false, 
     secret: "foobar34", 
     resave: false,
      store: sessionStore });
app.use(middlewareSession);*/












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



app.get("/tasks", function(request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoT.getAllTasks(email, function cb_getAllTasks(err, result) {
        if (err) {
            console.log(err.message);
        } else if (result !== []) {
            taskList = result;
            response.render("tasks", { taskList: taskList });
        } else {
            console.log("No hay tareas para ese usuario");
        }
    });

});

app.get("/finish/:taskId", function(request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoT.markTaskDone(request.params.taskId, function cb_markTaskDone(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            response.redirect("/tasks");
        }
    });

});


app.get("/question", function(request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoP.read5Random(function cb_read5Random(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            let listaPreguntas = result;
            response.render("figura6", listaPreguntas);
        }
    });
});

app.get("/question/selected/:idPregunta", function(request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            var pregunta = result;
            var listaAmigos = daoA.readAmigosByUser(request.session.usuario.email, function cb_readAmigosByUser(err, result) {
                if (err) {
                    console.log(err.message);
                } else {
                    let listaAmigos = []
                    result.forEach(idUsuario => {
                        daoU.returnNameWithID(idUsuario, function cb_returnNameWithID(err, result) {
                            if (err) {
                                console.log(err.message);
                            } else {
                                listaAmigos.push(result);
                            }
                        })
                    });
                    //Falta leer las notificaciones para saber a que usuarios se le habilita el boton adivinar
                    response.render("figura7", { pregunta: pregunta, listaAmigos: listaAmigos, })
                }
            })

            daoP.readRespuestasIncorrectas(request.params.idPregunta, result.numRespestaInicial - 1, function cb_readRespuestasIncorrectas(err, result) {
                if (err) {
                    console.log(err.message);
                } else {
                    let respuestas = [];
                    result.forEach(element => {
                        respuestas.push(element.enunciado);
                    });
                    respuestas.push(pregunta.respuestaCorrecta);
                    respuestas.sort(() => Math.random() - 0.5);
                    request.render("figura8.ejs", pregunta, respuestas);
                }
            })

        }
    });

});
app.post("/question/selected/:idPregunta", function(request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var respuestaElegida = ut.getRespuesta(request.body.seleccion, request.body.seleccionText);
    //If value == otro coger el valor del textArea
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.usuario.idUsuario, function cb_responderPregunta(err) {
        if (err) {
            console.log(err.message);
        }
    });
    //VERY MEGA DUDA RADIOBUTTONS EN EL POST
});

app.get("/question/answer/:idPregunta", function(request, response) {
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            var pregunta = result;
            daoP.readRespuestasIncorrectas(request.params.idPregunta, result.numRespestaInicial - 1, function cb_readRespuestasIncorrectas(err, result) {
                if (err) {
                    console.log(err.message);
                } else {
                    let respuestas = [];
                    result.forEach(element => {
                        respuestas.push(element.enunciado);
                    });
                    respuestas.push(pregunta.respuestaCorrecta);
                    respuestas.sort(() => Math.random() - 0.5);
                    request.render("figura8.ejs", pregunta, respuestas);
                }

            })

        }
    });

});
app.post("/question/answer/:idPregunta", function(request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var respuestaElegida = ut.getRespuesta(request.body.seleccion, request.body.seleccionText);
    //If value == otro coger el valor del textArea
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.usuario.idUsuario, function cb_responderPregunta(err) {
        if (err) {
            console.log(err.message);
        }
    });
});



//
app.post("/question/create", function(request, response) {
    let enunciado = request.body.enunciado;
    let respuestas = request.body.respuestas.split("\n");
    ut.createPregunta(enunciado, respuestas.length());
    daoP.createPregunta(pregunta, function cb_readRespuestasIncorrectas(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            respuestas.forEach(element => {
                daoP.añadirRespuestaPregunta(result, element, function cb_inserRespuestas(err) {
                    if (err) {
                        console.log(err.message);
                    }
                })
            });

        }
    });
});

//error 404
app.use(function(request, response, next) {
    response.status(404);
    response.render("error404", { url: request.url });
});

// Arrancar el servidor
app.listen(config.port, function(err) {
    if (err) {
        console.log("ERROR al iniciar el servidor");
    } else {
        //REINICIAR USER
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});
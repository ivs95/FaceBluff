// app.js
const config = require("./config");
const DAOUsuarios = require("./DAOUsuario");
const DAOPreguntas = require("./DAOPreguntas");
const DAONotificacion = require("./DAONotificacion");
const DAOAmigo = require("./DAOAmigo")
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cookieParser = require("cookie-parser");
const express_session = require("express-session");
const express_mysqlsession = require("express-mysql-session");

const MySQLStore = express_mysqlsession(express_session);
const sessionStore = new MySQLStore(config.mysqlConfig);
const middlewareSession = session({ saveUninitialized: false, secret: "foobar34", resave: false, store: sessionStore });
app.use(middlewareSession);



// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOUsuarios
const daoU = new DAOUsuarios(pool);
const daoA = new DAOAmigo(pool);
const daoP = new DAOPreguntas(pool);
const ut = new utils();
const ficherosEstaticos = path.join(__dirname, "public");

let email = "usuario@ucm.es";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(ficherosEstaticos));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());


app.get("/tasks", function (request, response, next) {
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

app.get("/users/login", function (request, response, next) {
    request.session.usuario = null;
    let msg = request.session.errorMsg;
    delete request.session.errorMsg;
    response.render("figura1", { errorMsg: msg });
});

app.post("/users/login", function (request, response, next) {
    let email = request.body.email;

    daoU.readByEmail(email, function cb_readUsuario(err, result) {
        if (err) {
            console.log(err.message);
        } else if (result !== null) {
            if (result.contraseña == request.body.password) {
                //Login correcto
                //Cambiar el atributo fecha de usuario por su edad antes de guardarlo en la sesion
                request.session.usuario = result;
                app.locals.currentUser = result;
                response.redirect("/users/my_profile");

            }
            else {
                //Login incorrecto
                request.session.errorMsg = "Login incorrecto";
                response.redirect("/users/login");
            }
        }
    })
    var password = request.body.password;
});



app.get("/users/my_profile", function (request, response, next) {
    let usuario = request.session.usuario;
    response.render("figura3", { usuario: usuario });

});




app.get("/users/update_user", function (request, response, next) {
    let usuario = request.cookies.usuario;
    response.render("figura2b", { usuario: usuario })
});


app.post("/users/new_user", function (request, response, next) {
    var usuario = utils.createUsuario(request.body.email, request.body.password, request.body.nombre, request.body.sexo, request.body.fecha, request.body.foto);
    daoU.createUser(usuario, function cb_crearUsuario(err) {
        if (err) {
            console.log(err);
        }
        else {
            response.redirect("/users/login")
        }

    })
});


app.get("/users/friends", function (request, response, next) {
    let usuario = request.session.usuario;
    let listaPeticiones = [];
    let listaAmigos = [];

    daoA.readPeticionesByUser(usuario.email, function cb_readPeticionesByUser(err, result) {
        if (err) {
            console.log(err);
        }
        else {

            result.forEach(element => {
                daoU.readByEmail(element, function cb_readUsuario(err, result) {
                    if (!err) {
                        listaPeticiones.push(result);
                    }
                });
            });
        }
    });
    daoA.readAmigosByUser(usuario.email, function cb_readAmigosByUser(err, result) {
        if (err) {
            console.log(err);
        }
        else {

            result.forEach(element => {
                daoU.readByEmail(element, function cb_readUsuario(err, result) {
                    if (!err) {
                        listaAmigos.push(result);
                    }
                });
            });

        }
    })
    response.render("figura4", { listaSolicitudes: listaSolicitudes, listaAmigos: listaAmigos });
});

app.get("/users/friends/add_friend/:email", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoA.deletePeticion(request.params.email, request.session.usuario.email, function cb_deletePeticion(err) {
        if (err) {
            console.log(err.message);
        }
    });
    daoA.addFriend(request.session.usuario.email, request.params.email, function cb_addFriend(err) {
        if (err) {
            console.log(err.message);
        }
        else {
            redirect("/users/friends")
        }
    })

});

app.get("/users/friends/refuse_friend/:email", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoA.deletePeticion(request.params.email, request.session.usuario.email, function cb_deletePeticion(err) {
        if (err) {
            console.log(err.message);
        }
        else {
            redirect("/users/friends")
        }
    })
    daoA.addFriend(request.session.usuario.email, request.params.email, function cb_addFriend(err) {
        if (err) {
            console.log(err.message);
        }
        else {
            redirect("/users/friends")
        }
    })

});


app.get("/finish/:taskId", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoT.markTaskDone(request.params.taskId, function cb_markTaskDone(err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            response.redirect("/tasks");
        }
    });

});


app.get("/question", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoP.read5Random(function cb_read5Random(err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            let listaPreguntas = result;
            response.render("figura6", listaPreguntas);
        }
    });

});

app.get("/question/selected/:idPregunta", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            var pregunta = result;
            var listaAmigos = daoA.readAmigosByUser(request.session.usuario.email, function cb_readAmigosByUser(err, result){
                if (err){
                    console.log(err.message);
                }
                else{
                    let listaAmigos = []
                    result.forEach(idUsuario => {
                        daoU.returnNameWithID(idUsuario, function cb_returnNameWithID(err,result){
                            if (err){
                                console.log(err.message);
                            }
                            else{
                                listaAmigos.push(result);
                            }
                        })
                    });
                    //Falta leer las notificaciones para saber a que usuarios se le habilita el boton adivinar
                    response.render("figura7", {pregunta:pregunta, listaAmigos:listaAmigos, })
                }
            })

            daoP.readRespuestasIncorrectas(request.params.idPregunta, result.numRespestaInicial - 1, function cb_readRespuestasIncorrectas(err, result) {
                if (err) {
                    console.log(err.message);
                }
                else {
                    let respuestas = [];
                    result.forEach(element => {
                        respuestas.push(element.enunciado);
                    });
                    respuestas.push(pregunta.respuestaCorrecta);
                    respuestas.sort(() => Math.random() - 0.5);
                    request.render("figura8.ejs", pregunta , respuestas);
                }
            })

        }
    });

});
app.post("/question/selected/:idPregunta", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var respuestaElegida = ut.getRespuesta(request.body.seleccion,request.body.seleccionText);
    //If value == otro coger el valor del textArea
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.usuario.idUsuario, function cb_responderPregunta(err){
        if (err) {
            console.log(err.message);
        }
    });
    //VERY MEGA DUDA RADIOBUTTONS EN EL POST
});



app.get("/question/answer/:idPregunta", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            var pregunta = result;
            daoP.readRespuestasIncorrectas(request.params.idPregunta, result.numRespestaInicial - 1, function cb_readRespuestasIncorrectas(err, result) {
                if (err) {
                    console.log(err.message);
                }
                else {
                    let respuestas = [];
                    result.forEach(element => {
                        respuestas.push(element.enunciado);
                    });
                    respuestas.push(pregunta.respuestaCorrecta);
                    respuestas.sort(() => Math.random() - 0.5);
                    request.render("figura8.ejs", pregunta , respuestas);
                }

            })

        }
    });

});
app.post("/question/answer/:idPregunta", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var respuestaElegida = ut.getRespuesta(request.body.seleccion,request.body.seleccionText);
    //If value == otro coger el valor del textArea
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.usuario.idUsuario, function cb_responderPregunta(err){
        if (err) {
            console.log(err.message);
        }
    });
});

app.get("/question/answerToOther/:idPregunta/:idAmigo", function (request, response, next) {
    //Renderizar la vista de responder pregunta en nombre de otro usuario (figura 9)    
    //Coger de la ruta los parametros idPregunta idAmigo
    //Llamar al DAOUsuario para coger el nombre idAmigo que se necesita al hacer el render
});
app.post("/question/answerToOther/:idPregunta/:idAmigo", function (request, response, next) {
    //Coger la respuesta del radioButton, comparar si es correcta
    //Crear la notificacion correspondiente, mostrada por defecto se pone a 0
    //Aumentar la puntuacion del usuario si ha acertado
    
});


//
app.post("/question/create",function (request, response, next){
    let enunciado = request.body.enunciado;
    let respuestas = request.body.respuestas.split("\n");
    ut.createPregunta(enunciado, respuestas.length());
    daoP.createPregunta(pregunta, function cb_readRespuestasIncorrectas(err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            respuestas.forEach(element => {
                daoP.añadirRespuestaPregunta(result, element, function cb_inserRespuestas(err){
                    if (err){
                        console.log(err.message);
                    }
                })
            });
            
        }
    });
});





app.get("/finish/:taskId", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoT.markTaskDone(request.params.taskId, function cb_markTaskDone(err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            response.redirect("/tasks");
        }
    });

});


app.get("/deleteCompleted", function (request, response, next) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoT.deleteCompleted(email, function cb_deleteCompleted(err, result) {
        if (err) {
            console.log(err.message);
        } else {
            response.redirect("/tasks");
        }
    });
});


// Arrancar el servidor
app.listen(config.port, function (err) {
    if (err) {
        console.log("ERROR al iniciar el servidor");
    }
    else {
        console.log(`Servidor arrancado en el puerto ${config.port}`);
    }
});



const DAOUsuarios = require("./DAOUsuario");
const DAOPreguntas = require("./DAOPreguntas");
const DAOAmigo = require("./DAOAmigo")
const config = require("./config");
const utils = require("./utils");
const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const fs = require("fs");
//const expressValidator = require("express-validator");

const routerQuestions = express.Router();

const ficherosEstaticos = path.join(__dirname, "public");



const ut = new utils();

const pool = mysql.createPool(config.mysqlConfig);

const daoU = new DAOUsuarios(pool);
const daoA = new DAOAmigo(pool);
const daoP = new DAOPreguntas(pool);

routerQuestions.use(express.static(ficherosEstaticos));

routerQuestions.use(bodyParser.urlencoded({ extended: false }));
//routerQuestions.use(expressValidator());

function accessControl(request, response, next) {


    if (request.session.currentUser != null) {
        console.log(request.session.currentUser.email);
        daoU.isUserCorrect(request.session.currentUser.email, request.session.currentUser.contraseña, function cB_isUserCorrect(err, result) {
            if (err) {
                response.render("error500", { mensaje: err.message });
            }
            else if (result == false) {
                request.session.errorMsg = "Debes estar logueado para acceder";
                response.redirect("/users/login");

            }
            else {
                next();
            }
        });
    }
    else {
        request.session.errorMsg = "Debes estar logueado para acceder";
        response.redirect("/users/login");
    }

};

routerQuestions.get("/show", accessControl, function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoP.read5Random(function cb_read5Random(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            let listaPreguntas = result;
            console.log(listaPreguntas);
            response.render("figura6", { puntuacion: request.session.currentUser.puntuacion, listaPreguntas: listaPreguntas });

        }
    });

});

routerQuestions.get("/selected/:idPregunta", accessControl, function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado

    console.log("----------------")
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {

            response.render("error500", { mensaje: err.message });
        }
        else {

            var pregunta = result;
            daoA.readAmigosByUser(request.session.currentUser.idUsuario, function cb_readAmigosByUser(err, result) {

                if (err) {

                    response.render("error500", { mensaje: err.message });
                }
                else {

                    let listaAmigos = [];
                    result.forEach(function (element) {
                        listaAmigos.push(element.idAmigo);
                    });
                    console.log("Amigos del usuario: " + listaAmigos + ":xxxxxxxxx");
                    daoP.readRespuestaCorrecta(request.params.idPregunta, request.session.currentUser.idUsuario, function cb_readRespuestaCorrecta(err, result) {

                        if (err) {
                            response.render("error500", { mensaje: err.message });
                        }
                        else {

                            var contestado = true;
                            if (result == false) {
                                contestado = false;
                            }
                            console.log("Respuesta del usuario: " + contestado);
                            // si es false el result es que no a contestaod la pregunta
                            daoP.readAllRespuestasPorID(request.params.idPregunta, listaAmigos, function cb_readAllRespuestasPorID(err, result) {

                                if (err) {
                                    response.render("error500", { mensaje: err.message });
                                }
                                else {
                                    // listaAmigosPorPregunta = result;
                                    let listaAmigosQueHanRespondido = [];
                                    let listaAmigosQueHasAdivinado = [];
                                    result.forEach(function (element) {
                                        console.log(element);
                                        listaAmigosQueHanRespondido.push(element);
                                    });

                                    console.log("respuesta de los amigos del usuario a esa pregunta :  " + listaAmigosQueHanRespondido)
                                    if (listaAmigosQueHanRespondido.length != 0) {

                                        daoP.readEstadoRespuestaAmigo(request.session.currentUser.idUsuario, listaAmigosQueHanRespondido, request.params.idPregunta, function cb_readEstadoRespuestaAmigo(err, result) {
                                            if (err) {
                                                response.render("error500", { mensaje: err.message });
                                            }
                                            else {

                                                console.log("estado de la respuesta del usaurio por otro : " + result);
                                                console.log(result);
                                                console.log(listaAmigosQueHasAdivinado);
                                                listaAmigosQueHasAdivinado = result;
                                                listaAmigosQueHasAdivinado.forEach(function (element1) {
                                                    
                                                    listaAmigosQueHanRespondido.forEach(function (element2) {
                                                        if(element2.idUsuario == element1.idAmigo){
                                                            listaAmigosQueHanRespondido.pop(element1);
                                                        }
                                                        
                                                    });
                                                });
                                                console.log("xd")
                                                console.log(listaAmigosQueHasAdivinado);
                                                console.log(listaAmigosQueHanRespondido);
                                                response.render("figura7", { puntuacion: request.session.currentUser.puntuacion, contestado: contestado, pregunta: pregunta[0], listaAmigos: listaAmigosQueHanRespondido, listaAmigosQueHasAdivinado: listaAmigosQueHasAdivinado })
                                               
                                            }
                                        })
                                    }

                                    else response.render("figura7", { puntuacion: request.session.currentUser.puntuacion, contestado: contestado, pregunta: pregunta[0], listaAmigos: listaAmigosQueHanRespondido, listaAmigosQueHasAdivinado: listaAmigosQueHasAdivinado })

                                }
                            });
                        }

                    })

                }
            })


        }
    });

});
routerQuestions.post("/selected/:idPregunta", accessControl, function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var respuestaElegida = ut.getRespuesta(request.body.seleccion, request.body.seleccionText);
    //If value == otro coger el valor del textArea
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.usuario.idUsuario, function cb_responderPregunta(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
    });

});

routerQuestions.get("/answer/:idPregunta", accessControl, function (request, response) {
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            var pregunta = result[0];
            console.log(pregunta);
            daoP.readRespuestasIncorrectas(request.params.idPregunta, pregunta.numRespuestasInicial, function cb_readRespuestasIncorrectas(err, result) {
                if (err) {
                    response.render("error500", { mensaje: err.message });
                }
                else {

                    let respuestas = [];
                    console.log(result);
                    result.forEach(function (element) {
                        respuestas.push(element)
                    });
                    console.log(respuestas);
                    response.render("figura8.ejs", { puntuacion: request.session.currentUser.puntuacion, pregunta: pregunta, respuestas: respuestas });
                }

            })

        }
    });

});
routerQuestions.post("/answer/:idPregunta", accessControl, function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var respuestaElegida = ut.getRespuesta(request.body.seleccion, request.body.seleccionText);
    console.log(respuestaElegida);
    //If value == otro coger el valor del textArea
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.currentUser.idUsuario, function cb_responderPregunta(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            response.redirect("/question/selected/" + request.params.idPregunta);
        }
    });
});

routerQuestions.get("/answerToOther/:idPregunta/:idAmigo", accessControl, function (request, response) {

    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            var pregunta = result[0];

            daoU.readById(request.params.idAmigo, function cb_readById(err, result) {

                if (err) {
                    console.log(err.message);
                }
                else {
                    // amigo al qu voy a intentar adivinar
                    var amigo = result;

                    daoP.readRespuestaCorrecta(request.params.idPregunta, request.params.idAmigo, function cb_readRespuestaCorrecta(err, result) {
                        if (err) {
                            console.log(err.message);
                        }
                        else {

                            var respuestaDelAmigo = result[0];

                            console.log(pregunta.numRespuestasInicial);
                            daoP.readRespuestasIncorrectas(request.params.idPregunta, (pregunta.numRespuestasInicial - 1), function cb_readRespuestasIncorrectas(err, result) {
                                if (err) {
                                    console.log(err.message);
                                }
                                else {
                                    let respuestas = [];
                                    console.log(result);
                                    result.forEach(function (element) {
                                        respuestas.push(element.respuesta)
                                    });
                                    console.log(respuestas);

                                    respuestas.push(respuestaDelAmigo.respuesta);
                                    respuestas.sort(() => Math.random() - 0.5);

                                    response.render("figura9.ejs", { puntuacion: request.session.currentUser.puntuacion, pregunta: pregunta, respuestas: respuestas, amigo: amigo });
                                }

                            })
                        }

                    })

                }
            });
        }
        //Renderizar la vista de responder pregunta en nombre de otro usuario (figura 9)    
        //Coger de la ruta los parametros idPregunta idAmigo
        //Llamar al DAOUsuario para coger el nombre idAmigo que se necesita al hacer el render
    });
});

routerQuestions.post("/answerToOther/:idPregunta/:idAmigo", accessControl, function (request, response) {
    var respuestaElegida = request.body.seleccion;
    console.log(respuestaElegida);
    var acertada = 0;
    daoP.readRespuestaCorrecta(request.params.idPregunta, request.params.idAmigo, function cb_readRespuestaCorrecta(err, result) {
        if (err) {
            console.log(err.message);
        }
        else {
            var respuestaCorrecta = result[0];

            if (respuestaCorrecta.respuesta.trim() == respuestaElegida.trim()) {

                //actailziar puntuacion
                console.log("entro entro")

                acertada = 1;
                daoU.increasePoints(request.session.currentUser.idUsuario, 50, function cb_increasePoints(err) {
                    if (err) {
                        console.log(err.message);
                    }


                });


            }
            daoP.insertPreguntaAmigoRespondida(request.session.currentUser.idUsuario, request.params.idAmigo, request.params.idPregunta, acertada, function cb_insertPreguntaAmigoRespondida(err, result) {
                if (err) {
                    console.log(err.message);
                }
            }
            );
            response.redirect("/question/selected/" + request.params.idPregunta);

        }
    });
    //Coger la respuesta del radioButton, comparar si es correcta
    //Crear la notificacion correspondiente, mostrada por defecto se pone a 0
    //Aumentar la puntuacion del usuario si ha acertado
});

//


routerQuestions.get("/create", accessControl, function (request, response) {

    response.render("figura10", { puntuacion: request.session.currentUser.puntuacion });
});
routerQuestions.post("/create", accessControl, function (request, response) {
    let enunciado = request.body.enunciado;
    console.log(request.body.enunciado);

    let respuestas = request.body.respuestas.split("\n");

    let pregunta = ut.createPregunta(enunciado, respuestas.length);
    console.log(pregunta);
    daoP.createPregunta(pregunta, function cb_readRespuestasIncorrectas(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            console.log(result);
            respuestas.forEach(element => {
                daoP.añadirRespuestaPregunta(result, element, function cb_inserRespuestas(err) {
                    if (err) {
                        response.render("error500", { mensaje: err.message });
                    }

                })
            });


            response.redirect("/question/show");

        }
    });
});

module.exports = routerQuestions;


"use strict";

const DAOUsuarios = require("./DAOUsuario");
const DAOPreguntas = require("./DAOPreguntas");
const DAOAmigo = require("./DAOAmigo")
const config = require("./config");
const utils = require("./utils");
const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const { check, validationResult } = require('express-validator');

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

function accessControl(request, response, next) {
    if (request.session.currentUser != null) {
        daoU.isUserCorrect(request.session.currentUser.email, request.session.currentUser.contraseña, function cB_isUserCorrect(err, result) {
            if (err) {
                response.status(500);
                response.render("error500", { mensaje: err.message });
            } else if (result == false) {
                request.session.errorMsg = "Debes estar logueado para acceder";
                response.redirect("/users/login");
            } else {
                next();
            }
        });
    } else {
        request.session.errorMsg = "Debes estar logueado para acceder";
        response.redirect("/users/login");
    }

};

routerQuestions.get("/show", accessControl, function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoP.read5Random(function cb_read5Random(err, result) {
        if (err) {
            response.status(500);
            response.render("error500", { mensaje: err.message });
        } else {
            let listaPreguntas = result;
            response.status(200);
            response.render("figura6", { puntuacion: request.session.currentUser.puntuacion, listaPreguntas: listaPreguntas });

        }
    });

});

routerQuestions.get("/selected/:idPregunta", accessControl, function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            response.status(500);
            response.render("error500", { mensaje: err.message });
        } else {

            var pregunta = result;
            daoA.readAmigosByUser(request.session.currentUser.idUsuario, function cb_readAmigosByUser(err, result) {

                if (err) {
                    response.status(500);
                    response.render("error500", { mensaje: err.message });
                } else {
                    let listaAmigos = [];
                    result.forEach(function (element) {
                        listaAmigos.push(element.idAmigo);
                    });
                    daoP.readRespuestaCorrecta(request.params.idPregunta, request.session.currentUser.idUsuario, function cb_readRespuestaCorrecta(err, result) {
                        if (err) {
                            response.status(500);
                            response.render("error500", { mensaje: err.message });
                        } else {
                            var contestado = true;
                            if (result == false) {
                                contestado = false;
                            }
                            let listaAmigosQueHanRespondido = [];
                            let listaAmigosQueHasAdivinado = [];
                            if (listaAmigos.length > 0) {
                                daoP.readAllRespuestasPorID(request.params.idPregunta, listaAmigos, function cb_readAllRespuestasPorID(err, result) {
                                    if (err) {
                                        response.status(500);
                                        response.render("error500", { mensaje: err.message });
                                    } else {
                                        result.forEach(function (element) {
                                            listaAmigosQueHanRespondido.push(element);
                                        });
                                        if (listaAmigosQueHanRespondido.length != 0) {
                                            var setIdAmigos = [];
                                            listaAmigosQueHanRespondido.forEach(function (element) {
                                                setIdAmigos.push(element.idUsuario);
                                            });
                                            daoP.readEstadoRespuestaAmigo(request.session.currentUser.idUsuario, setIdAmigos, request.params.idPregunta, function cb_readEstadoRespuestaAmigo(err, result) {
                                                if (err) {
                                                    response.status(500);
                                                    response.render("error500", { mensaje: err.message });
                                                } else {
                                                    listaAmigosQueHasAdivinado = result;
                                                    let listaAmigosFinal = [];
                                                    listaAmigosQueHasAdivinado.forEach(function (element1) {
                                                        listaAmigosQueHanRespondido.forEach(function (element2) {
                                                            if (element2.idUsuario == element1.idAmigo) {
                                                                listaAmigosFinal.push(element2);
                                                            }
                                                        });
                                                    });
                                                    listaAmigosFinal.forEach(function (element1) {
                                                        listaAmigosQueHanRespondido.pop(element1);
                                                    });
                                                    response.status(200);
                                                    response.render("figura7", { puntuacion: request.session.currentUser.puntuacion, contestado: contestado, pregunta: pregunta[0], listaAmigos: listaAmigosQueHanRespondido, listaAmigosQueHasAdivinado: listaAmigosQueHasAdivinado })
                                                }
                                            })
                                        } else {
                                            response.status(200);
                                            response.render("figura7", { puntuacion: request.session.currentUser.puntuacion, contestado: contestado, pregunta: pregunta[0], listaAmigos: listaAmigosQueHanRespondido, listaAmigosQueHasAdivinado: listaAmigosQueHasAdivinado })
                                        }
                                    }
                                });
                            }
                            else {
                                response.status(200);
                                response.render("figura7", { puntuacion: request.session.currentUser.puntuacion, contestado: contestado, pregunta: pregunta[0], listaAmigos: listaAmigosQueHanRespondido, listaAmigosQueHasAdivinado: listaAmigosQueHasAdivinado })
                            }
                        }
                    })
                }
            })
        }
    });

});
routerQuestions.post("/selected/:idPregunta", accessControl, function (request, response) {
    var respuestaElegida = ut.getRespuesta(request.body.seleccion, request.body.seleccionText);
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.usuario.idUsuario, function cb_responderPregunta(err) {
        if (err) {
            response.status(500);
            response.render("error500", { mensaje: err.message });
        }
    });
});

routerQuestions.get("/answer/:idPregunta", accessControl, function (request, response) {
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            response.status(500);
            response.render("error500", { mensaje: err.message });
        } else {
            var pregunta = result[0];
            daoP.readRespuestasIncorrectas(request.params.idPregunta, "", pregunta.numRespuestasInicial, function cb_readRespuestasIncorrectas(err, result) {
                if (err) {
                    response.status(500);
                    response.render("error500", { mensaje: err.message });
                } else {
                    let respuestas = [];
                    result.forEach(function (element) {
                        respuestas.push(element)
                    });
                    response.status(200);
                    let mensaje = request.session.validacionError;
                    delete request.session.validacionError;
                    response.render("figura8.ejs", { mensaje: mensaje, puntuacion: request.session.currentUser.puntuacion, pregunta: pregunta, respuestas: respuestas });
                }

            })

        }
    });

});
routerQuestions.post("/answer/:idPregunta", [check('seleccion').custom(seleccion => {
    if (seleccion == null) { return false; } else { return true; }
})], accessControl, function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var errors = validationResult(request).array();
    if (errors.length > 0) {
        request.session.validacionError = "Error de validacion";
        response.redirect("/question/answer/" + request.params.idPregunta);
    }
    else {
        var respuestaElegida = ut.getRespuesta(request.body.seleccion, request.body.seleccionText);
        daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.currentUser.idUsuario, function cb_responderPregunta(err) {
            if (err) {
                response.status(500);
                response.render("error500", { mensaje: err.message });
            } else {
                response.redirect("/question/selected/" + request.params.idPregunta);
            }
        });
    }
});

routerQuestions.get("/answerToOther/:idPregunta/:idAmigo", accessControl, function (request, response) {
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            response.status(500);
            response.render("error500", { mensaje: err.message });
        } else {
            var pregunta = result[0];
            daoU.readById(request.params.idAmigo, function cb_readById(err, result) {
                if (err) {
                    response.status(500);
                    response.render("error500", { mensaje: err.message });
                } else {
                    var amigo = result;
                    daoP.readRespuestaCorrecta(request.params.idPregunta, request.params.idAmigo, function cb_readRespuestaCorrecta(err, result) {
                        if (err) {
                            response.status(500);
                            response.render("error500", { mensaje: err.message });
                        } else {
                            var respuestaDelAmigo = result[0];
                            daoP.readRespuestasIncorrectas(request.params.idPregunta, respuestaDelAmigo.respuesta, (pregunta.numRespuestasInicial - 1), function cb_readRespuestasIncorrectas(err, result) {
                                if (err) {
                                    response.status(500);
                                    response.render("error500", { mensaje: err.message });
                                } else {
                                    let respuestas = [];
                                    result.forEach(function (element) {
                                        respuestas.push(element.respuesta)
                                    });
                                    respuestas.push(respuestaDelAmigo.respuesta);
                                    respuestas.sort(() => Math.random() - 0.5);
                                    response.status(200);
                                    let mensaje = request.session.validacionError;
                                    delete request.session.validacionError;
                                    response.render("figura9.ejs", { mensaje: mensaje, puntuacion: request.session.currentUser.puntuacion, pregunta: pregunta, respuestas: respuestas, amigo: amigo });
                                }
                            })
                        }
                    })
                }
            });
        }
    });
});

routerQuestions.post("/answerToOther/:idPregunta/:idAmigo", [check('seleccion').custom(seleccion => { if (seleccion == null) { return false ;} else { return true; } })], accessControl, function (request, response) {
    var errors = validationResult(request).array();
    if (errors.length > 0) {
        request.session.validacionError = "Error de validacion";
        response.redirect("/question/answerToOther/" + request.params.idPregunta + "/" + request.params.idAmigo);
    }
    else {
        var respuestaElegida = request.body.seleccion;
        var acertada = 0;
        daoP.readRespuestaCorrecta(request.params.idPregunta, request.params.idAmigo, function cb_readRespuestaCorrecta(err, result) {
            if (err) {
                response.status(500);
                response.render("error500", { mensaje: err.message });
            } else {
                var respuestaCorrecta = result[0];
                if (respuestaCorrecta.respuesta.trim() == respuestaElegida.trim()) {
                    acertada = 1;
                    daoU.updatePuntuacion(request.session.currentUser.idUsuario, (request.session.currentUser.puntuacion + 50), function cb_increasePoints(err) {
                        if (err) {
                            response.status(500);
                            response.render("error500", { mensaje: err.message });
                        } else {
                            request.session.currentUser.puntuacion += 50;
                            daoP.insertPreguntaAmigoRespondida(request.session.currentUser.idUsuario, request.params.idAmigo, request.params.idPregunta, acertada, function cb_insertPreguntaAmigoRespondida(err, result) {
                                if (err) {
                                    response.status(500);
                                    response.render("error500", { mensaje: err.message });
                                } else response.redirect("/question/selected/" + request.params.idPregunta);
                            });
                        }
                    });
                } else {
                    daoP.insertPreguntaAmigoRespondida(request.session.currentUser.idUsuario, request.params.idAmigo, request.params.idPregunta, acertada, function cb_insertPreguntaAmigoRespondida(err, result) {
                        if (err) {
                            response.status(500);
                            response.render("error500", { mensaje: err.message });
                        } else response.redirect("/question/selected/" + request.params.idPregunta);
                    });
                }
            }
        });
    }
});

//


routerQuestions.get("/create", accessControl, function (request, response) {
    response.status(200);
    let mensaje = request.session.validacionError;
    delete request.session.validacionError;
    response.render("figura10", { mensaje: mensaje, puntuacion: request.session.currentUser.puntuacion });
});


routerQuestions.post("/create", [check('enunciado').not().isEmpty(), check('respuestas').custom(respuestas => {
    if (respuestas.split("\n").length > 1) {
        let retorno = true;
        respuestas.split("\n").forEach(element => {
            if (element.length < 2)
                retorno = false;
        }); return retorno;
    }
    return false;
})], accessControl, function (request, response) {
    var errors = validationResult(request).array();
    if (errors.length > 0) {
        request.session.validacionError = "Error de validacion";
        response.redirect("/question/create")
    }
    else {
        let enunciado = request.body.enunciado;
        let respuestas = request.body.respuestas.split("\n");
        let pregunta = ut.createPregunta(enunciado, respuestas.length);
        daoP.createPregunta(pregunta, function cb_createPregunta(err, result) {
            if (err) {
                response.status(500);
                response.render("error500", { mensaje: err.message });
            } else {
                respuestas.forEach(element => {
                    daoP.añadirRespuestaPregunta(result, element, function cb_inserRespuestas(err) {
                        if (err) {
                            response.status(500);
                            response.render("error500", { mensaje: err.message });
                        }
                    })
                });
                response.redirect("/question/show");
            }
        });
    }
});

module.exports = routerQuestions;
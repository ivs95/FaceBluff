const routerQuestions = express.Router();

routerQuestions.get("/show", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoP.read5Random(function cb_read5Random(err, result) {
        if (err) {
            response.render("error500", {mensaje:err.message});
        }
        else {
            let listaPreguntas = result;
            response.render("figura6", listaPreguntas);
        }
    });

});

routerQuestions.get("/selected/:idPregunta", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            response.render("error500", {mensaje:err.message});
        }
        else {
            var pregunta = result;
            var listaAmigos = daoA.readAmigosByUser(request.session.usuario.email, function cb_readAmigosByUser(err, result) {
                if (err) {
                    response.render("error500", {mensaje:err.message});
                }
                else {
                    let listaAmigos = []
                    result.forEach(idUsuario => {
                        daoU.returnNameWithID(idUsuario, function cb_returnNameWithID(err, result) {
                            if (err) {
                                response.render("error500", {mensaje:err.message});
                            }
                            else {
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
                    response.render("error500", {mensaje:err.message});
                }
                else {
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
routerQuestions.post("/selected/:idPregunta", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var respuestaElegida = ut.getRespuesta(request.body.seleccion, request.body.seleccionText);
    //If value == otro coger el valor del textArea
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.usuario.idUsuario, function cb_responderPregunta(err) {
        if (err) {
            response.render("error500", {mensaje:err.message});
        }
    });
    //VERY MEGA DUDA RADIOBUTTONS EN EL POST
});

routerQuestions.get("/answer/:idPregunta", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoP.readPregunta(request.params.idPregunta, function cb_readPregunta(err, result) {
        if (err) {
            response.render("error500", {mensaje:err.message});
        }
        else {
            var pregunta = result;
            daoP.readRespuestasIncorrectas(request.params.idPregunta, result.numRespestaInicial - 1, function cb_readRespuestasIncorrectas(err, result) {
                if (err) {
                    response.render("error500", {mensaje:err.message});
                }
                else {
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
routerQuestions.post("/answer/:idPregunta", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    var respuestaElegida = ut.getRespuesta(request.body.seleccion, request.body.seleccionText);
    //If value == otro coger el valor del textArea
    daoP.responderPregunta(respuestaElegida, request.params.idPregunta, request.session.usuario.idUsuario, function cb_responderPregunta(err) {
        if (err) {
            response.render("error500", {mensaje:err.message});
        }
    });
});

routerQuestions.get("/answerToOther/:idPregunta/:idAmigo", function (request, response) {
    //Renderizar la vista de responder pregunta en nombre de otro usuario (figura 9)    
    //Coger de la ruta los parametros idPregunta idAmigo
    //Llamar al DAOUsuario para coger el nombre idAmigo que se necesita al hacer el render
});
routerQuestions.post("/answerToOther/:idPregunta/:idAmigo", function (request, response) {
    //Coger la respuesta del radioButton, comparar si es correcta
    //Crear la notificacion correspondiente, mostrada por defecto se pone a 0
    //Aumentar la puntuacion del usuario si ha acertado

});
//
routerQuestions.post("/create", function (request, response) {
    let enunciado = request.body.enunciado;
    let respuestas = request.body.respuestas.split("\n");
    ut.createPregunta(enunciado, respuestas.length());
    daoP.createPregunta(pregunta, function cb_readRespuestasIncorrectas(err, result) {
        if (err) {
            response.render("error500", {mensaje:err.message});
        }
        else {
            respuestas.forEach(element => {
                daoP.añadirRespuestaPregunta(result, element, function cb_inserRespuestas(err) {
                    if (err) {
                        response.render("error500", {mensaje:err.message});
                    }
                })
            });

        }
    });
});

module.exports = routerQuestions;


const DAOUsuarios = require("./DAOUsuario");
const DAOPreguntas = require("./DAOPreguntas");
const DAOAmigo = require("./DAOAmigo");
const DAOIMagenes = require("./DAOImagenes");
const config = require("./config");
const utils = require("./utils");
const express = require("express");
const path = require("path");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const multer = require("multer");
const fs = require("fs");
const { check, validationResult } = require('express-validator');
const routerUsers = express.Router();

const ficherosEstaticos = path.join(__dirname, "public");


const multerFactory = multer({ dest: path.join(__dirname, "public/img") });
const ut = new utils();
const pool = mysql.createPool(config.mysqlConfig);

const daoU = new DAOUsuarios(pool);
const daoA = new DAOAmigo(pool);
const daoP = new DAOPreguntas(pool);
const daoI = new DAOIMagenes(pool);
routerUsers.use(express.static(ficherosEstaticos));
//routerUsers.use(expressValidator());


function accessControl(request, response, next) {

    if (request.session.currentUser != null) {
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


routerUsers.get("/login", function (request, response) {
    delete request.session.currentUser;
    let msg = request.session.errorMsg;
    delete request.session.errorMsg;
    response.render("figura1", { errorMsg: msg });
});

routerUsers.use(bodyParser.urlencoded({ extended: false }));





routerUsers.post("/login", [check('email').isEmail(), check('password').not().isEmpty()], (request, response) => {
    var errors = validationResult(request).array();
    if (errors.length > 0) {
        response.render("error500", { mensaje: "Error de validacion" });
    }
    else {
        let email = request.body.email;
        let password = request.body.password;

        daoU.isUserCorrect(email, password, function cB_isUserCorrect(err, result) {
            if (err) {
                response.render("error500", { mensaje: err.message });
            }
            else if (result == false) {
                request.session.errorMsg = "El usuario y contraseña que has introducido no son correctos";
                response.redirect("/users/login");

            }
            else {
                request.session.currentUser = result[0];
                response.redirect("/users/my_profile");
            }
        });
    }
});


routerUsers.get("/my_profile", accessControl, function (request, response) {
    let mensaje = request.session.mensajePerfil;
    delete request.session.mensajePerfil;
    daoU.readById(request.session.currentUser.idUsuario, function cb_readById(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            let usuario = result;
            request.session.currentUser.edad = ut.calculateAge(usuario.fecha);
            let listaFotos = [];
            daoI.readImagenesExtra(usuario.idUsuario, function cb_readExtraImg(err, result) {
                if (err) {
                    response.render("error500", { mensaje: err.message });
                }
                else {
                    listaFotos = result;
                    response.render("figura3", { puntuacion: request.session.currentUser.puntuacion, usuario: request.session.currentUser, listaFotos: listaFotos, mensaje: mensaje });
                }
            })

        }
    })


});


routerUsers.get("/profile/:idUsuario", accessControl, function (request, response) {
    daoU.readById(request.params.idUsuario, function cb_readById(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            let usuario = result;
            usuario.edad = ut.calculateAge(usuario.fecha);
            let listaFotos = [];
            daoI.readImagenesExtra(usuario.idUsuario, function cb_readExtraImg(err, result) {
                if (err) {
                    response.render("error500", { mensaje: err.message });
                }
                else {
                    listaFotos = result;
                    response.render("figura3b", { puntuacion: request.session.currentUser.puntuacion, usuario: usuario, listaFotos: listaFotos });
                }
            })
        }
    });

});

routerUsers.get("/update_user", accessControl, function (request, response) {
    response.render("figura11", { puntuacion: request.session.currentUser.puntuacion, usuario: request.session.currentUser })
});

routerUsers.post("/update_user", multerFactory.single("foto"), [check('email').isEmail(), check('password').not().isEmpty(), check('nombre').not().isEmpty(), check('sexo').notEmpty()], accessControl, (request, response) => {
    var errors = validationResult(request).array();
    if (errors.length > 0) {
        response.render("error500", { mensaje: "Error de validacion" });
    }
    else {
        var usuario = ut.createUsuario(request.body.email, request.body.password, request.body.nombre, request.body.sexo, request.body.fecha);
        daoU.updateUser(usuario, request.session.currentUser.idUsuario, function cb_updateUser(err, result) {
            if (err) {
                response.render("error500", { mensaje: err.message });
            }
            else if (result != null) {
                request.session.currentUser = result;
                if (request.file) {
                    daoI.updateImagenPerfil(request.file.filename, request.session.idUsuario, function cb_insertImagen(err) {
                        if (err) {
                            response.render("error500", { mensaje: err.message });
                        }
                        else {
                            request.session.mensajePerfil = "Modificación del perfil realizada con éxito"
                            response.redirect("/users/my_profile");
                        }
                    });
                }
                else {
                    request.session.mensajePerfil = "Modificación del perfil realizada con éxito"
                    response.redirect("/users/my_profile");
                }
            }
        });
    }
});


routerUsers.post("/upload_img", accessControl, multerFactory.single("foto"), function (request, response) {

    if (request.file) {
        if (request.session.currentUser.puntuacion >= 100) {
            daoI.insertImagenExtra(request.file.filename, request.session.currentUser.idUsuario, function cb_insertImagen(err) {
                if (err) {
                    response.render("error500", { mensaje: err.message });
                }
                else {
                    daoU.updatePuntuacion(request.session.currentUser.idUsuario, request.session.currentUser.puntuacion - 100, function cb_updatePuntuacion(err) {
                        if (err) {
                            response.render("error500", { mensaje: err.message });
                        }
                        else {
                            request.session.mensajePerfil = "Imagen añadida con éxito";
                            request.session.currentUser.puntuacion -= 100;
                            response.redirect("/users/my_profile");
                        }
                    });
                }
            });
        }
        else {
            request.session.mensajePerfil = "No tienes puntos suficientes para añadir una imagen a tu perfil"
            response.redirect("/users/my_profile");

        }
    }
    else {
        request.session.mensajePerfil = "No has seleccionado ninguna foto para añadir"
        response.redirect("/users/my_profile");
    }

});


routerUsers.get("/new_user", function (request, response) {
    response.render("figura2")
});

routerUsers.get("/imagenNormal/:ruta", function (request, response) {
    response.sendFile(path.join(__dirname, "public", "img", request.params.ruta));
});

routerUsers.get("/imagen/:idUsuario", function (request, response) {
    daoI.readImagenPerfil(request.params.idUsuario, function cb_readImagenPerfil(err, resultado) {
        if (err) {
            response.render("error500", { mensaje: err.message })
        }
        else if (resultado == null) {
            response.sendFile(path.join(__dirname, "public", "img", "imagenPorDefecto.jpg"));
        }
        else {
            response.sendFile(path.join(__dirname, "public", "img", resultado.imagen));
        }
    });
});

routerUsers.post("/new_user", multerFactory.single("foto"), [check('email').isEmail(), check('password').not().isEmpty(), check('nombre').not().isEmpty(), check('sexo').not().isEmpty()], (request, response) => {
    var errors = validationResult(request).array();
    if (errors.length > 0) {
        response.render("error500", { mensaje: "Error de validacion" });
    }
    else {
        var usuario = ut.createUsuario(request.body.email, request.body.password, request.body.nombre, request.body.sexo, request.body.fecha);
        daoU.createUser(usuario, function cb_crearUsuario(err, resultado) {
            if (err) {
                response.render("error500", { mensaje: err.message });
            }
            else {
                if (request.file) {
                    daoI.insertImagenPerfil(request.file.filename, resultado, function cb_insertImagen(err) {
                        if (err) {
                            response.render("error500", { mensaje: err.message });
                        }
                        else {
                            response.redirect("/users/login");
                        }
                    });
                }
                else {
                    response.redirect("/users/login");
                }
            }
        })
    }
});


routerUsers.post("/search", function (request, response) {
    let caracteres = request.body.busqueda;
    daoU.usersWithCharInName(request.session.currentUser.idUsuario, caracteres, function cb_usersFindChar(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            response.render("figura5", { puntuacion: request.session.currentUser.puntuacion, usuarios: result });
        }
    });
});


routerUsers.get("/friends", function (request, response) {
    let usuario = request.session.currentUser;
    let listaPeticiones = [];
    let listaAmigos = [];
    let mensaje = request.session.mensajePeticion;
    delete request.session.mensajePeticion;

    daoA.readPeticionesByUser(usuario.idUsuario, function cb_readPeticionesByUser(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            result.forEach(element => {
                daoU.readById(element.idOrigen, function cb_readUsuario(err, result) {
                    if (!err) {
                        listaPeticiones.push(result);
                    }
                });
            });
            daoA.readAmigosByUser(usuario.idUsuario, function cb_readAmigosByUser(err, result) {
                if (err) {
                    response.render("error500", { mensaje: err.message });
                }
                else {
                    if (result.length > 0) {
                        result.forEach((element, index, array) => {
                            daoU.readById(element.idAmigo, function cb_readByID(err, resultado) {
                                if (err) {
                                    response.render("error500", { mensaje: err.message });
                                }
                                else {
                                    listaAmigos.push(resultado);
                                    if (index == (array.length - 1))
                                        response.render("figura4", { puntuacion: usuario.puntuacion, listaSolicitudes: listaPeticiones, listaAmigos: listaAmigos, mensaje: mensaje });
                                }
                            })
                        });
                    }
                    else {
                        response.render("figura4", { puntuacion: usuario.puntuacion, listaSolicitudes: listaPeticiones, listaAmigos: listaAmigos, mensaje: mensaje });
                    }
                }
            });
        }
    });

});

routerUsers.get("/friends/request_friend/:idUsuario", function (request, response) {

    daoA.isAmigo(request.session.currentUser.idUsuario, request.params.idUsuario, function cb_isAmigo(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            if (result != true) {
                daoA.existePeticion(request.session.currentUser.idUsuario, request.params.idUsuario, function cb_existePeticion(err, result) {
                    if (err) {
                        response.render("error500", { mensaje: err.message });
                    }
                    else if (result == null) {
                        daoA.addPeticion(request.session.currentUser.idUsuario, request.params.idUsuario, function cb_addPeticion(err) {
                            if (err) {
                                response.render("error500", { mensaje: err.message });
                            }
                            else {
                                request.session.mensajePeticion = "Petición enviada con éxito";
                                response.redirect("/users/friends");
                            }
                        });
                    }
                    else {
                        request.session.mensajePeticion = "Ese usuario ya tiene una petición tuya pendiente";
                        response.redirect("/users/friends");
                    }
                });
            }
            else {
                request.session.mensajePeticion = "Ya eres amigo de ese usuario";
                response.redirect("/users/friends");
            }
        }
    });
});

routerUsers.get("/friends/add_friend/:idUsuario", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoA.deletePeticion(request.params.idUsuario, request.session.currentUser.idUsuario, function cb_deletePeticion(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            daoA.addFriend(request.session.currentUser.idUsuario, request.params.idUsuario, function cb_addFriend(err) {
                if (err) {
                    response.render("error500", { mensaje: err.message });
                }
                else {
                    response.redirect("/users/friends")
                }
            });
        }
    });


});

routerUsers.get("/friends/refuse_friend/:idUsuario", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoA.deletePeticion(request.params.idUsuario, request.session.currentUser.idUsuario, function cb_deletePeticion(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            response.redirect("/users/friends")
        }
    })
});


module.exports = routerUsers;
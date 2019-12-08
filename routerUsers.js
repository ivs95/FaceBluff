

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
//const expressValidator = require("express-validator");
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


routerUsers.post("/login", function (request, response) {
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

});



//Usar middleware de control de acceso con app.use(middlewareacceso)

routerUsers.get("/my_profile", accessControl, function (request, response) {


    daoU.readById(request.session.currentUser.idUsuario, function cb_readById(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            let usuario = result;
            request.session.currentUser.edad = ut.calculateAge(usuario.fecha);
            response.render("figura3", { usuario: request.session.currentUser });

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
            response.render("figura3b", { usuario: usuario });
        }
    });

});

routerUsers.get("/update_user", accessControl, function (request, response) {
    response.render("figura11", { usuario: request.session.currentUser })
});

routerUsers.post("/update_user", accessControl, function (request, response) {
    var usuario = ut.createUsuario(request.body.email, request.body.password, request.body.nombre, request.body.sexo, request.body.fecha, request.body.foto);

    daoU.updateUser(usuario, request.session.currentUser.idUsuario, function cb_updateUser(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });

        }
        else if (result != null) {
            request.session.currentUser = result;

            response.redirect("/users/profile/" + request.session.currentUser.idUsuario);
        }
    });

});


routerUsers.get("/new_user", function (request, response) {
    response.render("figura2")
});

routerUsers.get("/imagenes/:idUsuario", function (request, response) {

});

routerUsers.get("/imagen/:idUsuario", function (request, response) {
    daoI.readImagenPerfil(request.params.idUsuario, function cb_readImagenPerfil(err, resultado) {
        if (err) {
            response.render("error500", { mensaje: err.message })
        }
        else if (resultado == null) {
            response.sendFile(path.join(__dirname,"public","img","imagenPorDefecto.jpg"));
        }
        else {
            response.sendFile(path.join(__dirname, "public","img", resultado.imagen));
        }
    });
});

routerUsers.post("/new_user", multerFactory.single("foto"), function (request, response) {

    var usuario = ut.createUsuario(request.body.email, request.body.password, request.body.nombre, request.body.sexo, request.body.fecha, request.body.foto);
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
        }
    })
});


routerUsers.post("/search", function (request, response) {
    let caracteres = request.body.busqueda;
    daoU.usersWithCharInName(request.session.currentUser.idUsuario, caracteres, function cb_usersFindChar(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            response.render("figura5", { puntuacion:request.session.currentUser.puntuacion, usuarios: result });
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
                    let listaIds = [];
                    result.forEach(element => {
                        listaIds.push(element.idAmigo);
                    });
                    if (listaIds.length > 0) {
                        daoU.readListaUsuarios(listaIds, function cb_readListaUsuarios(err, resultado) {
                            if (err) {
                                response.render("error500", { mensaje: err.message });
                            }
                            else {
                                listaAmigos = resultado;
                                response.render("figura4", { puntuacion: usuario.puntuacion, listaSolicitudes: listaPeticiones, listaAmigos: listaAmigos, mensaje: mensaje });
                            }
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
                });
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
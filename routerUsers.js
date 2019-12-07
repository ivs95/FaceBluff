

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
const routerUsers = express.Router();

const ficherosEstaticos = path.join(__dirname, "public");



const ut = new utils();
const pool = mysql.createPool(config.mysqlConfig);

const daoU = new DAOUsuarios(pool);
const daoA = new DAOAmigo(pool);
const daoP = new DAOPreguntas(pool);
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
            request.app.locals.currentUser = request.session.currentUser;
            response.redirect("/users/my_profile");
        }
    });

    //var password = request.body.password;
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
            console.log(result);
            usuario.edad = ut.calculateAge(usuario.fecha);
           
            response.render("figura3b", { usuario: usuario });
        }
    })
        ;

    response.render("figura3b", { usuario: request.session.currentUser });
});

routerUsers.get("/update_user", accessControl, function (request, response) {
    //let usuario = request.cookies.usuario;
    response.render("figura11", { usuario: request.session.currentUser })
});

routerUsers.post("/update_user", accessControl, function (request, response) {
    //let usuario = request.cookies.usuario;
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


routerUsers.post("/new_user", function (request, response) {
    var usuario = ut.createUsuario(request.body.email, request.body.password, request.body.nombre, request.body.sexo, request.body.fecha, request.body.foto);
    console.log(usuario.fecha);
    daoU.createUser(usuario, function cb_crearUsuario(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            response.redirect("/users/login")
        }

    })
});


routerUsers.post("/search", function (request, response) {
    let caracteres = request.body.busqueda;
    daoU.usersWithCharInName(request.session.currentUser.idUsuario,caracteres, function cb_usersFindChar(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            response.render("figura5", { usuarios: result });
        }
    });
});


routerUsers.get("/friends", function (request, response) {
    let usuario = request.session.currentUser;
    let listaPeticiones = [];
    let listaAmigos = [];

    daoA.readPeticionesByUser(usuario.idUsuario, function cb_readPeticionesByUser(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {

            result.forEach(element => {
                daoU.readById(element, function cb_readUsuario(err, result) {
                    if (!err) {
                        listaPeticiones.push(result);
                    }
                });
            });
            daoA.readAmigosByUser(usuario.email, function cb_readAmigosByUser(err, result) {
                if (err) {
                    response.render("error500", { mensaje: err.message });
                }
                else {
                    result.forEach(element => {
                        daoU.readByEmail(element, function cb_readUsuario(err, result) {
                            if (!err) {
                                listaAmigos.push(result);
                            }
                        });
                    });
                    response.render("figura4", { listaSolicitudes: listaPeticiones, listaAmigos: listaAmigos });
                }
            })
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
                daoA.readPeticionesByUser(idUsuario, function cb_readPeticionesByUser(err, result) {
                    if (err) {
                        response.render("error500", { mensaje: err.message });
                    }
                    else if (result == null) {
                        daoA.addPeticion(request.session.currentUser.idUsuario, request.params.idUsuario), function cb_deletePeticion(err) {
                            if (err) {
                                response.render("error500", { mensaje: err.message });
                            }
                        }
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
                    redirect("/users/friends")
                }
            });
        }
    });


});

routerUsers.get("/friends/refuse_friend/:idUsuario", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado
    daoA.deletePeticion(request.params.idUsuario, request.session.currentUser.email, function cb_deletePeticion(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            redirect("/users/friends")
        }
    })
});


module.exports = routerUsers;
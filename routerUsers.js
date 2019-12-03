const routerUsers = express.Router();


routerUsers.get("/login", function (request, response) {
    request.session.usuario = null;
    let msg = request.session.errorMsg;
    delete request.session.errorMsg;
    response.render("figura1", { errorMsg: msg });
});

routerUsers.post("/login", function (request, response) {
    let email = request.body.email;

    daoU.readByEmail(email, function cb_readUsuario(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
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


app.use(function accessControl(request, response, next) {
    daoU.isUserCorrect(request.session.usuario.email, request.session.usuario.contraseña, function cB_isUserCorrect(err, result) {
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
});

//Usar middleware de control de acceso con app.use(middlewareacceso)
routerUsers.get("/my_profile", function (request, response) {
    let usuario = request.session.usuario;
    response.render("figura3", { usuario: usuario });

});


routerUsers.get("/profile/:idUsuario", function (request, response) {
    let usuario = daoU.readById(idUsuario, function cb_readUsuario(err, result) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            let usuario = result;
            usuario.edad = CALCULAR EDAD
            response.render("figura3b", {usuario:result});

        }
    })
});

routerUsers.get("/update_user", function (request, response) {
    let usuario = request.cookies.usuario;
    response.render("figura2b", { usuario: usuario })
});


routerUsers.post("/new_user", function (request, response) {
    var usuario = utils.createUsuario(request.body.email, request.body.password, request.body.nombre, request.body.sexo, request.body.fecha, request.body.foto);
    daoU.createUser(usuario, function cb_crearUsuario(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            response.redirect("/users/login")
        }

    })
});

routerUsers.get("/friends", function (request, response) {
    let usuario = request.session.usuario;
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

routerUsers.get("/friends/add_friend/:idUsuario", function (request, response) {
    //Leer variable taskList con dao del usuario que se ha registrado

    daoA.deletePeticion(request.params.idUsuario, request.session.usuario.idUsuario, function cb_deletePeticion(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            daoA.addFriend(request.session.usuario.idUsuario, request.params.idUsuario, function cb_addFriend(err) {
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
    daoA.deletePeticion(request.params.idUsuario, request.session.usuario.email, function cb_deletePeticion(err) {
        if (err) {
            response.render("error500", { mensaje: err.message });
        }
        else {
            redirect("/users/friends")
        }
    })
});


module.exports = routerUsers;
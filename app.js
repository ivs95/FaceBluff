// app.js
const config = require("./config");
const DAOUsuarios = require("./DAOUsuario");
const DAOPreguntas = require("./DAOPreguntas");
const DAONotificacion = require("./DAONotificacion");
const utils = require("./utils");
const path = require("path");
const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const cookieParser = require("cookie-parser");



// Crear un servidor Express.js
const app = express();

// Crear un pool de conexiones a la base de datos de MySQL
const pool = mysql.createPool(config.mysqlConfig);

// Crear una instancia de DAOUsuarios
const daoU = new DAOUsuarios(pool);
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
    
});

app.post("/users/login", function (request, response, next) {
    response.clearCookie("usuario")
    daoU.readByEmail(request.body.email, function cb_readUsuario(err, result) {
        if (err) {
            console.log(err.message);
        } else if (result !== null) {
            if (result.contraseña == request.body.password) {
                //Login correcto
                response.cookie("usuario", result, { maxAge: 86400000 });
                response.redirect("/users/my_profile");

            }
            else {
                //Login incorrecto
                response.cookie("incorrecto", true, {maxAge : 86400000 })
                response.redirect("/users/login");
            }
        }
    })
    var password = request.body.password;
});



app.get("/users/my_profile", function (request, response, next) {
    let usuario = request.cookies.usuario;
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

app.get("/users/my_profile", function (request, response, next) {
    daoU.readByName()
    response.render("figura3")
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


function cb_insertTask(err, result) {
    if (err) {
        console.log(err.message);
    } else {
        console.log("Tarea insertada correctamente");
    }
}

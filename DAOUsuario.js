
"use strict";

const mysql = require("mysql");

class DAOUsuario {
    constructor(pool) {
        this.pool = pool;
    }
    createUser(usuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "INSERT INTO usuarios (email,nombre,contraseña,genero,fecha,puntuacion) VALUES(?,?,?,?,?,?);";
                let parametros = [usuario.email, usuario.nombre, usuario.contraseña, usuario.genero, usuario.fecha, 0];

                conexion.query(sql, parametros, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        callback(null);
                    }
                    conexion.release();
                })
            }
        })
    }
    updateUser(usuario, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "UPDATE usuarios SET email="+usuario.email+"  nombre="+usuario.nombre+" contraseña="+usuario.contraseña+
                " genero ="+usuario.genero+"fecha="+usuario.fecha+" where idUsuario = ?";
                let parametros = [usuario.id];
                conexion.query(sql, parametros, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        callback(null);
                    }
                    conexion.release();
                })
            }
        })
    }
    
    readByEmail(email, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM Usuarios WHERE email=? ";
                conexion.query(sql, email, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if(resultado) {
                        callback(null,resultado);
                    }
                    else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })

    }

    readByName(name, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM Usuarios WHERE nombre=? ";
                conexion.query(sql, name, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if(resultado) {
                        callback(null,resultado);
                    }
                    else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })
    }

    readById(id, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM Usuarios WHERE idUsuario=? ";
                conexion.query(sql, id, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if(resultado) {
                        callback(null,resultado);
                    }
                    else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })
    }

    //Funcion que devuelve una lista de tuplas [id,nombre]
    returnNameWithID(name, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario, nombre FROM Usuarios WHERE idUsuario=? ";
                conexion.query(sql, name, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if(resultado) {
                        callback(null,resultado);
                    }
                    else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })
    }

    increasePoints(id, puntuacion, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "UPDATE usuarios SET puntuacion=? where idUsuario=?;";
                let parametros = [puntuacion,id];
                conexion.query(sql, parametros, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        callback(null);
                    }
                    conexion.release();
                })
            }
        })
    }

    isUserCorrect(email, password, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT email, contraseña FROM usuarios WHERE email = ? AND contraseña = ?;";
                let params = [email, password];
                conexion.query(sql, params, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if (resultado[0] != null) {
                        callback(null, true);
                    }
                    else {
                        callback(null, false);
                    }
                    conexion.release();
                })
            }
        })
    }

}



module.exports = DAOUsuario;



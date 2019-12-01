
"use strict";

const mysql = require("mysql");

class DAOAmigo {
    constructor(pool) {
        this.pool = pool;
    }

    addPeticion(usuario, callback) {
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

    addFriend(emailUsuario, emailAmigo, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "INSERT INTO amigo (emailUsuario, emailAmigo) VALUES(?,?);";
                let parametros = [emailUsuario, emailAmigo];
                conexion.query(sql, parametros, function (err) {
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


    deletePeticion(emailOrigen, emailDestino, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "DELETE FROM peticion WHERE emailOrigen = ? AND emailDestino = ?";
                let parametros = [emailOrigen, emailDestino];
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
    
    //Devuelve la lista de amigos del email del usuario registrado
    readAmigosByUser(email, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT emailAmigo FROM amigo WHERE emailUsuario = ? ";
                conexion.query(sql, [email], function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        callback(null,resultado);
                    }
                    conexion.release();
                })
            }
        })

    }


    //Devuelve la lista de peticiones que tiene el email del usuario registrado
    readPeticionesByUser(email, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT emailOrigen FROM peticion WHERE emailDestino=?";
                conexion.query(sql, email, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        callback(null,resultado);
                    }
                    conexion.release();
                })
            }
        })

    }



}



module.exports = DAOAmigo;



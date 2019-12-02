
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

    addFriend(idUsuario, idAmigo, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "INSERT INTO amigo (idUsuario, idAmigo) VALUES(?,?);";
                let parametros = [idUsuario, idAmigo];
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


    deletePeticion(idOrigen, idDestino, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "DELETE FROM peticion WHERE idOrigen = ? AND idDestino = ?";
                let parametros = [idOrigen, idDestino];
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
    readAmigosByUser(idUsuario, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idAmigo FROM amigo WHERE idUsuario = ? ";
                conexion.query(sql, [idUsuario], function (err, resultado) {
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



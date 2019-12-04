
"use strict";

const mysql = require("mysql");

class DAOAmigo {
    constructor(pool) {
        this.pool = pool;
    }

    addPeticion(idOrigen, idDestino, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "INSERT INTO peticion (idOrigen, idDestino) VALUES(?,?);";
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

    isAmigo(idUsuario,idAmigo,callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT * FROM amigo WHERE (idUsuario = ? AND idAmigo = ?) OR (idUsuario = ? AND idAmigo = ?);";
                let params = [idUsuario,idAmigo,idAmigo,idUsuario];
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

    //Devuelve la lista de peticiones que tiene el email del usuario registrado
    readPeticionesByUser(idUsuario, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idOrigen FROM peticion WHERE idDestino=?";
                conexion.query(sql, idUsuario, function (err, resultado) {
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



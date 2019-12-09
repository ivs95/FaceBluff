
"use strict";

const mysql = require("mysql");

class DAOImagenes {
    constructor(pool) {
        this.pool = pool;
    }

    insertImagenPerfil(ruta, idUsuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "INSERT INTO imagenes (idUsuario,imagen,perfil) VALUES(?,?,1);";
                let parametros = [idUsuario,ruta];
                
                conexion.query(sql, parametros, function (err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null);
                    }
                    conexion.release();
                })
            }
        })
    }

    insertImagenExtra(ruta, idUsuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "INSERT INTO imagenes (idUsuario,imagen,perfil) VALUES(?,?,0);";
                let parametros = [idUsuario,ruta];
                
                conexion.query(sql, parametros, function (err) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null);
                    }
                    conexion.release();
                })
            }
        })
    }


    readImagenPerfil(idUsuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT imagen FROM imagenes WHERE idUsuario = ? AND perfil = 1;";                
                conexion.query(sql, idUsuario, function (err, resultado) {
                    if (err) {
                        //callback(new Error("Error de acceso a la base de datos"));
                        callback(err);
                    }
                    else {
                        callback(null, resultado[0]);
                    }
                    conexion.release();
                })
            }
        })
    }

    readImagenesExtra(idUsuario, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT imagen FROM imagenes WHERE idUsuario = ? AND perfil = 0;";                
                conexion.query(sql, idUsuario, function (err, resultado) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        callback(null, resultado);
                    }
                    conexion.release();
                })
            }
        }) 
    }
}



module.exports = DAOImagenes;



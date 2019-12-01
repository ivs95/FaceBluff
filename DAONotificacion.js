
"use strict";

const mysql = require("mysql");

class DAONotificacion {
    constructor(pool) {
        this.pool = pool;
    }

    añadirNotificacion(notificacion, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "INSERT INTO notificaciones (idUsuario, emailResponde, acertada, enunciado, respuestaCorrecta, respuestaSeleccionada) VALUES(?,?,?,?,?,?);";
                let parametros = [notificacion.idUsuario, notificacion.emailRepsonde, notificacion.acertada, notificacion.enunciado, notificacion.respuestaCorrecta, notificacion.respuestaSeleccionada];
                conexion.query(sql, parametros, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        callback(null);
                    }
                    conexion.release();
                });
            }
        });
    }

    borrarNotificaciones(idUsuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "DELETE FROM notificaciones WHERE idUsuario = ?";
                let parametros = [idUsuario];
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
        });
    }

    readNotificaciones(idUsuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT * FROM notificaciones WHERE idUsuario = ?";
                let parametros = [idUsuario];
                conexion.query(sql, parametros, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        callback(null, resultado);
                    }
                    conexion.release();
                })
            }
        });
    }


}

module.exports = DAONotificacion;



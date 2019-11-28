"use strict"

const mysql = require("mysql");

class DAOPreguntas {
    constructor(pool) {
        this.pool = pool;

    }

    createPregunta(pregunta, callback) {
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                let sql = "INSERT INTO preguntas (idUsuario,enunciado,numRespestaInicial,respuestaCorrecta) VALUES(?,?,?,?);";
                let parametros = [pregunta.idUsuario, pregunta.enunciado, pregunta.numRespestaInicial, pregunta.respuestaCorrecta];

                conexion.query(sql, parametros, function(err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    } else {

                        callback(null, resultado.insertId);
                    }
                    conexion.release();
                })
            }
        })
    }

    añadirRespuestaPregunta(idPregunta, respuesta, callback) {
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                let sql = "INSERT INTO RespuestasIncorrectas (idPRegunta,respuesta) VALUES (?,?);";
                let parametros = [idPregunta, respuesta];
                conexion.query(sql, parametros, function(err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    } else {
                        callback(null);
                    }
                    conexion.release();
                })
            }
        })
    }
    readPregunta(idPregunta, callback) {
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                let sql = "SELECT idUsuario,enunciado,numRespestaInicial,respuestaCorrecta FROM pregunta WHERE idPRegunta=?";
                conexion.query(sql, idPregunta, function(err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    } else if (resultado) {
                        callback(null, resultado);
                    } else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })
    }
    responderPregunta(callback) {

    }
    read5Random(callback) {

    }
    readPosiblesRespuestas(callback) {

    }


}
module.exports = DAOPreguntas;
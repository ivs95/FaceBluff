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
                let sql = "INSERT INTO preguntas (enunciado,numRespestaInicial) VALUES(?,?);";
                let parametros = [pregunta.enunciado, pregunta.numRespestaInicial];

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
                let sql = "INSERT INTO respuestas (idPRegunta,respuesta) VALUES (?,?);";
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
                let sql = "SELECT idPregunta,enunciado,numRespuestasInicial FROM preguntas WHERE idPRegunta=?;";
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


    responderPregunta(respuestaCorrecta,idPregunta, idUsuario,callback) {
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                let sql = "INSERT INTO preguntaRespondida (idPRegunta,idUsuario,respuesta) VALUES (?,?,?);";
                let parametros = [idPregunta, idUsuario, respuestaCorrecta];
                conexion.query(sql, parametros, function(err) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    } else  
                        callback(null);
                  
                    conexion.release();
                })
            }
        })
    }


    read5Random(callback) {
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                let sql = "SELECT idPregunta,enunciado,numRespuestasInicial,respuestaCorrecta FROM preguntas ORDER BY RAND() LIMIT 5";
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


    readRespuestaCorrecta(idPregunta, idUsuario,callback) {
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                let sql = "SELECT * FROM preguntaRespondida WHERE idPregunta=? AND idUsuario=?";
                let parametros = [idPregunta, idUsuario];
                conexion.query(sql, parametros, function(err, resultado) {
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

    readRespuestasIncorrectas(idPregunta,respuestaCorrecta, cantidad,callback){
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                let sql = "SELECT respuesta FROM preguntaIncorrectas WHERE idPRegunta = ? AND respuesta != ? ORDER BY RAND() LIMIT ? ;";
                let parametros = [idPregunta,respuestaCorrecta,cantidad]
                conexion.query(sql, parametros, function(err, resultado) {
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
    insertPreguntaAmigoRespondida(idUsuario,idAmigo,idPRegunta,acertada,callback){
        
    }


}
module.exports = DAOPreguntas;
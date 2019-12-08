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
                let sql = "INSERT INTO preguntas (enunciado,numRespuestasInicial) VALUES(?,?);";
                let parametros = [pregunta.enunciado, pregunta.numRespuestasInicial];

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
                        callback(err);
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
               
                console.log(idPregunta);
                let sql = "SELECT idPregunta,enunciado,numRespuestasInicial FROM preguntas WHERE idPregunta = ?";
                conexion.query(sql, idPregunta, function(err, resultado) {
                    if (err) {
                        callback(err);
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
                let sql = "INSERT INTO preguntasRespondidas (idPregunta,idUsuario,respuesta) VALUES (?,?,?);";
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
                let sql = "SELECT idPregunta,enunciado,numRespuestasInicial FROM preguntas ORDER BY RAND() LIMIT 5";
                conexion.query(sql, function(err, resultado) {
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
                let sql = "SELECT * FROM preguntasRespondidas WHERE idPregunta=? AND idUsuario=?";
                let parametros = [idPregunta, idUsuario];
                conexion.query(sql, parametros, function(err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    } else if (resultado) {
                        callback(null, resultado);
                    } else {
                        callback(null, false);
                    }

                    conexion.release();
                })
            }
        })
    }

    readRespuestasIncorrectas(idPregunta, cantidad, callback){
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {
                let sql = "SELECT respuesta FROM respuestas WHERE idPRegunta ="+idPregunta+" ORDER BY RAND() LIMIT "+cantidad+" ;";

                conexion.query(sql, function(err, resultado) {
                    if (err) {
                        callback(err);
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
    readEstadoRespuestaAmigo(idUsuario,listaAmigos, idPregunta, callback){
        this.pool.getConnection(function(err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            } else {    
                let sql;
                if(listaAmigos.length != 0){
                     sql = "SELECT * FROM preguntasAmigoRespondidas WHERE idUsuario =" +idUsuario+ " AND idAmigo IN "+listaAmigos+" AND idPregunta =" +idPregunta+";";
                conexion.query(sql, function(err, resultado) {
                    if (err) {
                            callback(err);
                    } else if (resultado) {
                        callback(null, resultado);
                    } else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            
            }
            callback(null,false);
            conexion.release();
        }

        })
    }


}
module.exports = DAOPreguntas;
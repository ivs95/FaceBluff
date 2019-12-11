
"use strict";

const mysql = require("mysql");

class DAOUsuario {
    constructor(pool) {
        this.pool = pool;
    }
    createUser(usuario, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "INSERT INTO usuarios (email,nombre,contraseña,genero,fecha,puntuacion) VALUES(?,?,?,?,?,?);";
                let parametros = [usuario.email, usuario.nombre, usuario.password, usuario.sexo, usuario.fecha, 0];
                
                conexion.query(sql, parametros, function (err, resultado) {
                    if (err) {
                        //callback(new Error("Error de acceso a la base de datos"));
                        callback(err);
                    }
                    else {
                        callback(null, resultado.insertId);
                    }
                    conexion.release();
                })
            }
        })
    }
    updateUser(usuario,id, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "UPDATE usuarios SET email= ? ,nombre= ? ,contraseña= ? ,genero = ? ,fecha= ? WHERE idUsuario =?";
                let parametros = [usuario.email, usuario.nombre, usuario.password, usuario.sexo, usuario.fecha, id];
                conexion.query(sql,parametros, function (err, resultado) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        var result ={
                            idUsuario : id,
                            contraseña :usuario.password,
                            email : usuario.email,
                            nombre : usuario.nombre,
                            fecha :  usuario.fecha,
                            genero : usuario.sexo,
                            puntuacion : usuario.puntuacion
                        }
                        callback(null, result);
                    }
                    conexion.release();
                })
            }
        })
    }

    readListaUsuarios(listaIds, callback){
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT * FROM usuarios WHERE idUsuario IN ( " + listaIds +" );" ;
                conexion.query(sql, function (err, resultado) {
                    if (err) {
                       callback(err);
                    }
                    else if (resultado) {
                        callback(null, resultado);
                    }
                    else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })
    }

    updatePuntuacion(id,puntuacion, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "UPDATE usuarios SET puntuacion=? where idUsuario=?;";
                let parametros = [puntuacion, id];
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

    readByEmail(email, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM usuarios WHERE email=? ";
                conexion.query(sql, email, function (err, resultado) {
                    if (err) {
                       callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if (resultado) {
                        callback(null, resultado);
                    }
                    else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })

    }

    readByName(name, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM usuarios WHERE nombre=? ";
                conexion.query(sql, name, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if (resultado) {
                        callback(null, resultado);
                    }
                    else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })
    }

    readById(id, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM usuarios WHERE idUsuario = ?  ";
                conexion.query(sql, id, function (err, resultado) {
                    if (err) {
                        callback(err);
                    }
                    else if (resultado) {
                        callback(null, resultado[0]);
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
    returnNameWithID(name, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario, nombre FROM usuarios WHERE idUsuario=? ";
                conexion.query(sql, name, function (err, resultado) {
                    if (err) {
                        callback(err);
                    }
                    else if (resultado) {
                        callback(null, resultado);
                    }
                    else {
                        callback(new Error("No existe el usuario"));
                    }
                    conexion.release();
                })
            }
        })
    }


    




    increasePoints(id, puntuacion, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "UPDATE usuarios SET puntuacion=? where idUsuario=?;";
                let parametros = [puntuacion, id];
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
  
    usersWithCharInName(idUsuario, caracteres, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT * FROM usuarios WHERE nombre LIKE ? AND idUsuario!=?;";
                let like = "%" + caracteres + "%";
                let parametros = [like, idUsuario];
                conexion.query(sql,parametros, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if (resultado){ 
                        
                        callback(null, resultado);
                    }
                });
                conexion.release();
            }
        });
    };


    isUserCorrect(email, password, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM usuarios WHERE email = ? AND contraseña = ?;";
                let params = [email, password];
                conexion.query(sql, params, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else if (resultado != null) {
                        callback(null, resultado[0]);
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



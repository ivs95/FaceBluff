
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
                let parametros = [usuario.email, usuario.nombre, usuario.password, usuario.sexo, usuario.fecha, 0];
                
                conexion.query(sql, parametros, function (err, resultado) {
                    if (err) {
                        //callback(new Error("Error de acceso a la base de datos"));
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
    updateUser(usuario,id, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                console.log(usuario);
                let sql = "UPDATE usuarios SET email='" + usuario.email + "',nombre='" + usuario.nombre + "',contraseña='" + usuario.password +
                    "',genero ='" + usuario.sexo + "',fecha='" + usuario.fecha + "' WHERE idUsuario ="+ id+";";
                    console.log(sql);
                
                conexion.query(sql, function (err, resultado) {
                    if (err) {
                        callback(err);
                    }
                    else {
                        var result ={
                            password :usuario.password,
                            email : usuario.email,
                            nombre : usuario.nombre,
                            fecha :  usuario.fecha,
                            genero : usuario.genero
                        }
                        callback(null, result);
                    }
                    conexion.release();
                })
            }
        })
    }

    readByEmail(email, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM usuarios WHERE email=? ";
                conexion.query(sql, email, function (err, resultado) {
                    if (err) {
                       // callback(new Error("Error de acceso a la base de datos"));
                       callback(err);
                    }
                    else if (resultado) {
                        console.log(resultado)
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
                console.log(err);
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
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario,nombre,email,contraseña,genero,fecha,puntuacion FROM usuarios WHERE idUsuario=? ";
                conexion.query(sql, id, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
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
                console.log(err);
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT idUsuario, nombre FROM usuarios WHERE idUsuario=? ";
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

    increasePoints(id, puntuacion, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                console.log(err);
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

    usersWithCharInName(caracter, callback) {
        this.pool.getConnection(function (err, conexion) {
            if (err) {
                callback(new Error("Error de conexión a la base de datos"));
            }
            else {
                let sql = "SELECT * FROM usuarios;";
                conexion.query(sql, function (err, resultado) {
                    if (err) {
                        callback(new Error("Error de acceso a la base de datos"));
                    }
                    else {
                        retorno = [];
                        resultado.forEach(element => {
                            let sql = "SELECT CHARINDEX(?, element.nombre) AS MatchPosition";
                            conexion.query(sql,caracter, function (err, resultado) {
                                if (err) {
                                    callback(new Error("Error de acceso a la base de datos"));
                                }
                                if (resultado.MatchPosition != 0) {
                                    retorno.push(element);
                                }
                            });
                        });
                        callback(null, retorno);
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
                        
                        callback(null, resultado);
                    }
                    else {
                        console.log("xd");
                        callback(null, false);
                    }
                    conexion.release();
                })
            }
        })
    }

}



module.exports = DAOUsuario;



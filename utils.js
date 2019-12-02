class utils {

    createUsuario(email, password, nombre, sexo, fecha, foto) {
        let usuario = {
            email: email,
            password: password,
            nombre: nombre,
            sexo: sexo,
            fecha: fecha,
            foto: foto
        }
        return usuario;
    }
    getRespuesta (seleccion,seleccionText) {
        let respuestaElegida = seleccion;
        if (respuestaElegida == "otro"){
            respuestaElegida = seleccionText;
        }
        return respuestaElegida;
    }


    createPregunta(enunciado, numRespuestas){
        let pregunta = {
            enunciado = enunciado,
            numRespuestasInicial = numRespuestas
        }
        return pregunta;
    }

}



module.exports = utils;
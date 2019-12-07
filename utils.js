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
            enunciado : enunciado,
            numRespuestasInicial : numRespuestas
        }
        return pregunta;
    }
    
    calculateAge(birthday) {
        console.log(birthday);
        var birthday_arr = birthday.split("-");
        var birthday_date = new Date(birthday_arr[2], birthday_arr[1] - 1, birthday_arr[0]);
        var ageDifMs = Date.now() - birthday_date.getTime();
        var ageDate = new Date(ageDifMs);
        return Math.abs(ageDate.getUTCFullYear() - 1970);
    }

}



module.exports = utils;
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
    getRespuesta (seleccion,seleecionText) {
        switch (seleccion) {
            //COMO PILLO EL VALOR DEL RADIO BUTON DINAMICO
            case "opcion": return seleccion ;break;
            case "otro" :return seleecionText;break;
            default:
                break;
        }
    }



}



module.exports = utils;
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
}

}

module.exports = utils;
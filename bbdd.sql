
create table usuario {
  idUsuario int NOT NULL UNIQUE AUTO_INCREMENT, 
  nombre varchar(255) NOT NULL ,
  email varchar(255) NOT NULL unique,
  contraseña varchar(255) NOT NULL,
  genero varchar(255) NOT NULL ,
  fecha (opcional) date ,
  puntuacion double ,
  Primary Key (idUsuario),
};

create table amigo {
  emailUsuario varchar(255) NOT NULL,
  emailAmigo varchar(255) NOT NULL,
  Primary Key (emailUsuario, emailAmigo),
  FOREIGN KEY (emailUsuario) REFERENCES usuario(email),
  FOREIGN KEY (emailAmigo) REFERENCES usuario(email)
};

create table peticion {
  emailOrigen int NOT NULL ,
  emailDestino int NOT NULL,
  Primary Key (emailOrigen, emailDestino),
  FOREIGN KEY (emailOrigen) REFERENCES usuario(email),
  FOREIGN KEY (emailDestino) REFERENCES usuario(email)
};

create table preguntas {
  idPregunta int NOT NULL UNIQUE AUTO_INCREMENT,
  idUsuario int  NOT NULL ,
  enunciado LONGTEXT NOT NULL,
  numRespestaInicial int ,
  respuestaCorrecta LONGTEXT ,
  Primary Key (idPregunta),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
};

create table notificaciones {
    idUsuario int NOT NULL,
    idUsuarioRespuesta int NOT NULL, 
    acertada bit ,
    enunciado LONGTEXT NOT NULL, 
    respuestaCorrecta ,
    respuestaSeleccionada , 
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY (idUsuarioRespuesta) REFERENCES usuario(idUsuario)

}

create table respuestasIncorrectas{ 
    idPregunta int NOT NULL ,
    respuesta LONGTEXT ,

}


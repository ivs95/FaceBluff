
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
  idUsuario varchar(255) NOT NULL,
  idAmigo varchar(255) NOT NULL,
  Primary Key (idUsuario, idAmigo),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idAmigo) REFERENCES usuario(idUsuario)
};

create table peticion {
  idOrigen int NOT NULL ,
  idDestino int NOT NULL,
  Primary Key (idOrigen, idDestino),
  FOREIGN KEY (idOrigen) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idDestino) REFERENCES usuario(idUsuario)
};

create table preguntas {
  idPregunta int NOT NULL UNIQUE AUTO_INCREMENT,
  enunciado LONGTEXT NOT NULL,
  numRespuestasInicial int ,
  Primary Key (idPregunta),
};


create table preguntaRespondida {
  idPregunta int NOT NULL UNIQUE AUTO_INCREMENT,
  idUsuario int  NOT NULL ,
  respuesta LONGTEXT

  Primary Key (idUsuario, idPregunta),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)
}


create table respuestas{ 
    idPregunta int NOT NULL ,
    respuesta LONGTEXT,
    FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)
}

create table notificaciones {
    idUsuario int NOT NULL,
    idUsuarioRespuesta int NOT NULL, (El que esta loggeado al crear la notificacion)
    idPregunta int NOT NULL
    acertada bit ,
    enunciado LONGTEXT NOT NULL, 
    respuestaCorrecta LONGTEXT NOT NULL, 
    respuestaSeleccionada LONGTEXT NOT NULL,
    mostrada bit

    Primary Key (idUsuario, idUsuarioRespuesta, idPregunta),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY (idUsuarioRespuesta) REFERENCES usuario(idUsuario)
    FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)

}



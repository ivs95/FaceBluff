
create table usuario {
  idUsuario int NOT NULL UNIQUE AUTO_INCREMENT, 
  nombre varchar(255) NOT NULL ,
  email varchar(255) NOT NULL unique,
  contraseña varchar(255) NOT NULL,
  genero varchar(255) NOT NULL ,
  fecha (opcional) date ,
  puntuacion double ,
  PRIMARY KEY (idUsuario),
};

create table amigo {
  idUsuario varchar(255) NOT NULL,
  idAmigo varchar(255) NOT NULL,
  PRIMARY KEY (idUsuario, idAmigo),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idAmigo) REFERENCES usuario(idUsuario)
};

create table peticion {
  idOrigen int NOT NULL ,
  idDestino int NOT NULL,
  PRIMARY KEY (idOrigen, idDestino),
  FOREIGN KEY (idOrigen) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idDestino) REFERENCES usuario(idUsuario)
};

create table preguntas {
  idPregunta int NOT NULL UNIQUE AUTO_INCREMENT,
  enunciado LONGTEXT NOT NULL,
  numRespuestasInicial int ,
  PRIMARY KEY (idPregunta),
};


create table preguntaRespondida {
  idPregunta int NOT NULL UNIQUE AUTO_INCREMENT,
  idUsuario int  NOT NULL ,
  respuesta LONGTEXT

  PRIMARY KEY (idUsuario, idPregunta),
  FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
  FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)
}


create table respuestas{ 
    idPregunta int NOT NULL ,
    respuesta LONGTEXT,
    FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)
}

create table preguntaAmigoRespondida {
    idUsuario int NOT NULL,
    idAmigo int NOT NULL,
    idPregunta int NOT NULL,
    acertada bit,

    PRIMARY KEY (idUsuario, idAmigo, idPregunta),
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario),
    FOREIGN KEY (idAmigo) REFERENCES usuario(idUsuario)
    FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)

}



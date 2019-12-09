
create table usuarios (
  idUsuario int NOT NULL UNIQUE AUTO_INCREMENT, 
  nombre varchar(255) NOT NULL ,
  email varchar(255) NOT NULL unique,
  contraseña varchar(255) NOT NULL,
  genero varchar(255) NOT NULL ,
  fecha date ,
  puntuacion double ,
  PRIMARY KEY (idUsuario)
);

create table amigos (
  idUsuario int NOT NULL,
  idAmigo int NOT NULL,
  PRIMARY KEY (idUsuario, idAmigo),
  FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario),
  FOREIGN KEY (idAmigo) REFERENCES usuarios(idUsuario)
);

create table peticiones (
  idOrigen int NOT NULL ,
  idDestino int NOT NULL,
  PRIMARY KEY (idOrigen, idDestino),
  FOREIGN KEY (idOrigen) REFERENCES usuarios(idUsuario),
  FOREIGN KEY (idDestino) REFERENCES usuarios(idUsuario)
);

create table preguntas (
  idPregunta int NOT NULL UNIQUE AUTO_INCREMENT,
  enunciado LONGTEXT NOT NULL,
  numRespuestasInicial int ,
  PRIMARY KEY (idPregunta)
);


create table preguntasRespondidas (
  idPregunta int NOT NULL ,
  idUsuario int  NOT NULL,
  respuesta LONGTEXT,
  PRIMARY KEY (idUsuario, idPregunta),
  FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario),
  FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)
);


create table respuestas( 
    idPregunta int NOT NULL ,
    respuesta LONGTEXT,
    FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)
);

create table preguntasAmigoRespondidas (
    idUsuario int NOT NULL,
    idAmigo int NOT NULL,
    idPregunta int NOT NULL,
    acertada int,

    PRIMARY KEY (idUsuario, idAmigo, idPregunta),
    FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario),
    FOREIGN KEY (idAmigo) REFERENCES usuarios(idUsuario),
    FOREIGN KEY (idPregunta) REFERENCES preguntas(idPregunta)
);

create table imagenes (
  idUsuario int not null,
  imagen varchar(255),
  perfil bit,
  FOREIGN KEY (idUsuario) REFERENCES usuarios(idUsuario)


);



/* Arquivo SQL */

create database EPICONTROLTECH;
use epicontroltech;

create table administrador(
id int not null,
nome varchar(50) not null,
senha varchar(25) not null,
primary key(id)
);
create table setor(
id int not null auto_increment,
nome varchar(50) not null,
primary key(id)
);
create table supervisor(
id int not null,
nome varchar(50) not null,
senha varchar(10) not null,
setor_locado varchar(100),
primary key(id)
);
create table câmeras(
id int not null,
nome varchar(50) not null,
setor_locado varchar(100),
primary key(id)
);
create table epi(
id int not null,
nome varchar(255),
primary key (id)
);
create table epis_câmeras(
id_cam int,
id_epi int,
primary key (id_cam, id_epi),
foreign key (id_cam) references câmeras (id),
foreign key (id_epi) references epi (id)
);
create table solicitação(
id int not null auto_increment,
id_cam int,
id_epi int,
primary key (id),
foreign key (id_cam) references câmeras (id),
foreign key (id_epi) references epi (id)
);
create table relatório(
id int not null auto_increment,
id_cam int,
data_ocorrencia date,
horário_inicio time,
horário_fim time,
tipo int,
primary key (id),
foreign key (id_cam) references câmeras (id)
);
create table epis_ocorrência(
id_ocorrencia int,
id_epi int,
primary key (id_ocorrencia, id_epi),
foreign key (id_ocorrencia) references relatório (id),
foreign key (id_epi) references epi (id)
);

/* Inserir os Epis utilizados */
insert into epi (id, nome) value ("1", "Jaleco antiestático");
insert into epi (id, nome) value ("2", "Óculos antiestático");
insert into epi (id, nome) value("3", "Luva antiestática");
insert into epi (id, nome) value ("4", "Boné antiestático");

/* Inserir pelo menos um Administrador */
insert into administrador (id, nome, senha) values ("1", "Adm1", "2024")

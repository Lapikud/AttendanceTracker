use ar;
drop table if exists users;
create table users(
  id integer primary key auto_increment,
  name text not null,
  mac varchar(17) not null unique,
  datetime last_seen
);
create table 
INSERT INTO users(name, mac) VALUES ("Arti Zirk", "84:c7:ea:3f:7f:42");
INSERT INTO users(name, mac) VALUES ("Kertu Pikk", "40:4e:36:5d:d5:47");
INSERT INTO users(name, mac) VALUES ("Sigrid Kirss", "04:4b:ed:0e:cd:ae");
INSERT INTO users(name, mac) VALUES ("Silver Valdvee", "78:00:9e:d1:59:ba");
INSERT INTO users(name, mac) VALUES ("Artur Salus", "d0:87:e2:a1:04:e5");
INSERT INTO users(name, mac) VALUES ("Alo Avi", "cc:9f:7a:2a:1b:db");
INSERT INTO users(name, mac) VALUES ("Kristjan Kool", "40:0e:85:f7:b5:4f");
INSERT INTO users(name, mac) VALUES ("Berta Härsing", "2c:f0:a2:c3:af:b8");
use ar;
drop table if exists users;
create table users(
  id integer primary key auto_increment,
  name text not null,
  hostname text,
  mac varchar(17) not null unique,
  connected bit,
  hidden bit,
  teacher bit
);

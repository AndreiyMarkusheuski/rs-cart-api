CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

create type IF NOT exists status_enum AS ENUM ('OPEN', 'ORDERED');

create table IF NOT EXISTS carts (
	id uuid not null default uuid_generate_v4() primary key,
	user_id uuid not null default uuid_generate_v4(),
	created_at date not null,
	updated_at date not null,
	status status_enum
);

create table IF NOT EXISTS orders (
	id uuid primary key default uuid_generate_v4(),
	user_id uuid not null,
	cart_id uuid not null,
	payment json,
	delivery json,
	comments text,
	status text,
	total integer,
	foreign key ("cart_id") references "carts" ("id")
);

create table IF NOT exists cart_items (
	cart_id uuid,
	product_id uuid,
	count integer,
	FOREIGN KEY (cart_id) REFERENCES carts(id)
);

create table IF NOT EXISTS users (
	id uuid primary key default uuid_generate_v4(),
	name text not null,
	email text,
	password text
)

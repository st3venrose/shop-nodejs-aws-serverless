create table product(
	id uuid not null default uuid_generate_v4() primary key,
	title text not null,
	description text,
	price integer
);

create extension if not exists "uuid-ossp";

insert into product (title, description, price) values ('test product 2', 'title for test product 2', 3000);

create table stock(
	product_id uuid not null,
	count integer,
	constraint fk_product
      foreign key(product_id) 
	  references product(id)
)

insert into stock (product_id, count) values ('73d546fa-b4b6-4966-8034-1e16224a2542', 3);

select * from product;
select * from stock;
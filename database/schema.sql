DROP TABLE IF EXISTS restaurants CASCADE;
DROP TABLE IF EXISTS location CASCADE;
DROP TABLE IF EXISTS cost CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS ratings CASCADE;

CREATE TABLE "location" (
    "restaurant_id" INT   NOT NULL,
    "latitude" DOUBLE PRECISION   NOT NULL,
    "longitude" DOUBLE PRECISION   NOT NULL,
    CONSTRAINT "pk_location" PRIMARY KEY (
        "restaurant_id"
     )
);

CREATE TABLE "cost" (
    "restaurant_id" INT   NOT NULL,
    "price" varchar(10),
    CONSTRAINT "pk_cost" PRIMARY KEY (
        "restaurant_id"
     )
);

CREATE TABLE "categories" (
    "restaurant_id" INT   NOT NULL,
    "categorie_types" varchar(255),
    CONSTRAINT "pk_categories" PRIMARY KEY (
        "restaurant_id"
     )
);

CREATE TABLE "transactions" (
    "restaurant_id" INT   NOT NULL,
    "transaction_types" varchar(255),
    CONSTRAINT "pk_transactions" PRIMARY KEY (
        "restaurant_id"
     )
);

CREATE TABLE "ratings" (
    "restaurant_id" INT   NOT NULL,
    "rating" DECIMAL(3,2),
    "review_count" INT,
    CONSTRAINT "pk_ratings" PRIMARY KEY (
        "restaurant_id"
     )
);

CREATE TABLE "restaurants" (
    "restaurant_id" INT   NOT NULL,
    "name" varchar(255)   NOT NULL,
    "phone_number" varchar(20),
    CONSTRAINT "pk_restaurants" PRIMARY KEY (
        "restaurant_id"
     )
);

ALTER TABLE "location" ADD CONSTRAINT "fk_location_restaurant_id" FOREIGN KEY("restaurant_id")
REFERENCES "restaurants" ("restaurant_id");

ALTER TABLE "cost" ADD CONSTRAINT "fk_cost_restaurant_id" FOREIGN KEY("restaurant_id")
REFERENCES "restaurants" ("restaurant_id");

ALTER TABLE "categories" ADD CONSTRAINT "fk_categories_restaurant_id" FOREIGN KEY("restaurant_id")
REFERENCES "restaurants" ("restaurant_id");

ALTER TABLE "transactions" ADD CONSTRAINT "fk_transactions_restaurant_id" FOREIGN KEY("restaurant_id")
REFERENCES "restaurants" ("restaurant_id");

ALTER TABLE "ratings" ADD CONSTRAINT "fk_ratings_restaurant_id" FOREIGN KEY("restaurant_id")
REFERENCES "restaurants" ("restaurant_id");

CREATE TEMP TABLE staging_restaurant_data (
    restaurant_id INT,
    name VARCHAR(255),
	rating DECIMAL(3,2),
	review_count INT,
	price varchar(10),
    phone_number VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
	transaction_types varchar(255),
    categorie_types varchar(255)    
);

COPY staging_restaurant_data 
FROM 'C:\temp\project_3\restaurant_data.csv' 
DELIMITER ',' 
CSV HEADER;

INSERT INTO restaurants (restaurant_id, name, phone_number)
SELECT restaurant_id, name, phone_number
FROM staging_restaurant_data;

INSERT INTO location (restaurant_id, latitude, longitude)
SELECT restaurant_id, latitude, longitude
FROM staging_restaurant_data;

INSERT INTO cost (restaurant_id, price)
SELECT restaurant_id, price
FROM staging_restaurant_data;

INSERT INTO categories (restaurant_id, categorie_types)
SELECT restaurant_id, categorie_types
FROM staging_restaurant_data;

INSERT INTO transactions (restaurant_id, transaction_types)
SELECT restaurant_id, transaction_types
FROM staging_restaurant_data;

INSERT INTO ratings (restaurant_id, rating, review_count)
SELECT restaurant_id, rating, review_count
FROM staging_restaurant_data;

DROP TABLE IF EXISTS staging_restaurant_data;

SELECT * FROM location;
SELECT * FROM cost;
SELECT * FROM categories;
SELECT * FROM transactions;
SELECT * FROM ratings;
SELECT * FROM restaurants;

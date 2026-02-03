### Open sql shell
```
psql -U postgres
```
```
CREATE DATABASE test;
```
```
psql -h localhost -p 5432 -U postgres test
```
### Useful commands
```
\l # list all databases
\c test # connect the test database
\d # list of all tables in the database
\d users # describe the table
\dt # tables
\i <Path to file> # Executes commands from file
``` 

### CREATE TABLE
```
CREATE TABLE users (
    id INT,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    gender VARCHAR(7),
    birth_date DATE 
);
```
with some constraints:
```
CREATE TABLE users (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(7) NOT NULL,
    birth_date DATE NOT NULL
);
```
### INSERT RECORDS
```
INSERT INTO users (first_name, last_name, gender, birth_date) 
VALUES ('Fatma', 'Sak', 'FEMALE', '1998-01-01');
```
import mysql from "mysql2/promise";

export const db = mysql.createPool({
  host: "localhost",
  user: "testuser",
  password: "1234",
  database: 'univer',

});

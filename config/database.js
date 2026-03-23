import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection(
  "mysql://unr3fbqfecj6wtrd:e6Bq21k0rWHAihgiLUG1@bbebuqh4dtcka1kgpp2e-mysql.services.clever-cloud.com:3306/bbebuqh4dtcka1kgpp2e",
);

function DBconnection() {
  db.connect((error) => {
    if (error) {
      return console.log(error.message);
    } else {
      return console.log("server connection with Database success");
    }
  });
}

export { db, DBconnection };

import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});


function  DBconnection ()

{
db.connect((error) =>{
  if (error){
return console.log(error.message);

  }

  else{
    return console.log("server connection with Database success");
    
  }
})
}

export {db , DBconnection}
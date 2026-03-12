//userLogin , userRegister , pharmecyLogin , pharmecyRegister
import bcrypt from "bcrypt";
import { db } from "../config/database.js";

export const userRegister = (req, res) => {

  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "All fields are required"
    });
  }

  const checkQuery = "SELECT * FROM users WHERE email = ?";

  db.execute(checkQuery, [email], async (err, results) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Server error"
      });
    }

    if (results.length > 0) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    try {

      const hashedPassword = await bcrypt.hash(password, 10);

      const insertQuery =
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

      db.execute(
        insertQuery,
        [name, email, hashedPassword, "user"],
        (err, result) => {

          if (err) {
            console.log(err);
            return res.status(500).json({
              message: "Server error"
            });
          }

          res.status(201).json({
            message: "User registered successfully",
            userId: result.insertId
          });

        }
      );

    } catch (error) {

      console.log(error);
      res.status(500).json({
        message: "Server error"
      });

    }

  });

};
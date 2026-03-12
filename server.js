import express from "express";
import {db , DBconnection}  from "./config/database.js";
import router from "./routes/auth.routes.js";

DBconnection()

const app = express();

app.use(express.json());

app.get("/user", (req, res) => {
  res.send("welcome to Graduation Project");
});

app.use("/user/auth", router);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
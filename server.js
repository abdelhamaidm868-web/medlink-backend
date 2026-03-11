import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/database.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test Database Connection
const testDB = async () => {
  try {
    const [rows] = await pool.execute("SELECT 1");
    console.log("Database connected successfully!");
  } catch (error) {
    console.error("Database connection failed:");
    console.error(error);
  }
};

testDB();

app.get("/", (req, res) => {
  res.send("MediLink API running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
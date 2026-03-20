import express from "express";
import {db , DBconnection}  from "./config/database.js";
import authRoutes  from "./routes/auth.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import ordersRoutes from "./routes/order.routes.js"

DBconnection()

const app = express();

app.use(express.json());

app.get("/user", (req, res) => {
  res.send("welcome to Graduation Project");
});

app.use("/", authRoutes);
app.use("/", pharmacyRoutes);
app.use("/", ordersRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
import express from "express";
import {db , DBconnection}  from "./config/database.js";
import authRoutes  from "./routes/auth.routes.js";
import pharmacyRoutes from "./routes/pharmacy.routes.js";
import ordersRoutes from "./routes/order.routes.js"
//------------------------------------------------------------------
import user_router from "./routes/users/userHome.router.js"
import pharmacy_home from "./routes/pharmacy/pharmicyHome.router.js"
import user_profile from "./routes/users/userProfile.router.js"
import pharmacy_mange from "./routes/pharmacy/pharmacyManage.router.js"


DBconnection()

const app = express();

app.use(express.json());

app.get("/user", (req, res) => {
  res.send("welcome to Graduation Project");
});

app.use("/", authRoutes);
app.use("/", pharmacyRoutes);
app.use("/", ordersRoutes);
app.use("/user" , user_router)
app.use("/user/profile" , user_profile)
app.use("/pharmicy/home" , pharmacy_home)
app.use("/pharmicy/mange" , pharmacy_mange) 

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
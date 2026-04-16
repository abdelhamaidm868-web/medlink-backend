import express from "express";
import { createOrder,getOrders,getOrderById,cancelOrder ,updateOrderStatus  } from "../controllers/orders.controllers.js";
const router = express.Router();


router.post("/orders", createOrder);


router.get("/orders", getOrders);


router.get("/orders/:id", getOrderById);

router.delete("/orders/:id", cancelOrder);

router.put("/orders/:id/status", updateOrderStatus);
// router.put("/:id/status", updateOrderStatus);


// router.delete("/:id", deleteOrder);


export default router;
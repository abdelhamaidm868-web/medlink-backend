import express from "express";
import { addMedicineToPharmacy ,updatePharmacy ,getPharmacyOrders   } from "../controllers/pharmacy.controller.js";

const router = express.Router();

router.post("/pharmacy/medicine", addMedicineToPharmacy);
router.put("/pharmacy/profile", updatePharmacy);
router.get("/pharmacy/orders", getPharmacyOrders);

export default router;
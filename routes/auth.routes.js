import express from "express";
import {  pharmecyLogin,  pharmecyRegister,  userLogin,  userRegister} from "../controllers/auth.controllers.js";

const router = express.Router();

// Pharmacy 
router.post("/pharmecy/login", pharmecyLogin);
router.post("/pharmecy/register", pharmecyRegister);

// User 
router.post("/user/login", userLogin);
router.post("/user/register", userRegister);




export default router;
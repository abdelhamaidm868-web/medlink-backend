import { Router } from "express";
import * as user from "./user.service.js"

const router = Router();

router.post("/get_profile", user.get_profile);

router.put("/update_profile", user.update_profile);


router.get("/home/getall_medicine", user.home_getall_medicine) //done 

router.get("/home/search", user.home_search) // done


router.post("/add_commint" , user.add_commint)
//////////////////////////////////////////////////////////////////////////////

router.post("/add_medicine/:id", user.add_medicine);

router.delete("/del_medicine/:id", user.del_medicine);

router.get("/medicine_user" , user.get_medicine_user )

router.get("/disease_user" , user.get_desise_user )

router.post("/disease_user" , user.add_disease)

router.delete("/disease_user" , user.del_disease)
router.patch("/medicine_user_status",user.update_status_medicine)

export default router;
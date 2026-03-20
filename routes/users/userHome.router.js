import { Router } from "express";
import {db} from "../../config/database.js"
import bcrypt from "bcrypt";
const router = Router()



router.get("/home/medicine" , (req,res)=>{
  const query=`SELECT medicine.Name , medicine.Id as medicine_id , medicine.Manufacturer , medicine.Category , medicine.Description , pharmacymedicine.Price , pharmacymedicine.Quantity , pharmacy.Name as pharmacy_name , pharmacy.Location FROM medicine JOIN pharmacymedicine ON pharmacymedicine.MedicineId = medicine.Id JOIN pharmacy ON pharmacy.Id = pharmacymedicine.PharmacyId; `

const values = [] ; 

db.execute(query ,values , (error , result)=>{
  if (error) return res.json({msg: error.message})
  
    res.status(200).json({data:result})
})


})

router.get("/home/search", (req, res) => {
  const { input } = req.query;
  
  const query = `
 SELECT medicine.Name  , medicine.Id as medicine_id , medicine.Manufacturer ,  medicine.Category , medicine.Description ,
pharmacymedicine.Price , pharmacymedicine.Quantity , pharmacy.Name as pharmacy_name , pharmacy.Location 
FROM medicine
JOIN pharmacymedicine
 ON pharmacymedicine.MedicineId = medicine.Id
JOIN pharmacy
  ON pharmacy.Id = pharmacymedicine.PharmacyId
  WHERE medicine.Name like  ? 
  `;

  // نحط % في القيمة نفسها
  const values = [`%${input}%`];

  db.execute(query, values, (error, result) => {
    if (error) return res.json({ msg: error.message });

    if (result.length != 0){
      
      res.status(200).json({ data: result });

    }

    else{
      res.status(404).json({msg : "Don't find any medcine"})
    }
  });
});
//-----------------------------------------------------------------------------------------------------------






export default router;
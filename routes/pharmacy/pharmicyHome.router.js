import { Router } from "express";
import { db } from "../../config/database.js";

const router = Router();

// router.get("/medcine" , (req,res)=>{

//     const {pharmacy_id} = req.body

//     const query = `SELECT medicine.Name , medicine.Category , medicine.Description , pharmacymedicine.Price , pharmacymedicine.Quantity ,pharmacymedicine.ExpiryDate
// from medicine JOIN pharmacymedicine
// on medicine.Id = pharmacymedicine.MedicineId
// WHERE pharmacymedicine.PharmacyId = ? ;`
//     const values = [pharmacy_id]

//     db.execute(query , values , (error, result )=>{
//         if (error) return res.json({msg:error.message})

//         if(result.length !=0){
//             res.status(200).json({msg: result})

//         }
//     })

// })

router.get("/medcine", (req, res) => {
  const { pharmacy_id } = req.body;

  const query = `
    SELECT 
      medicine.Name,
      medicine.Category,
      medicine.Description,
      pharmacymedicine.Price,
      pharmacymedicine.Quantity,
      pharmacymedicine.ExpiryDate 
    FROM medicine 
    JOIN pharmacymedicine
      ON medicine.Id = pharmacymedicine.MedicineId
    WHERE pharmacymedicine.PharmacyId = ? ;
  `;

  const values = [pharmacy_id];

  db.execute(query, values, (error, result) => {
    if (error) return res.json({ msg: error.message });

    if (result.length != 0) {
      const lowStock = result.filter((med) => med.Quantity < 4);

      let warning = null;

      if (lowStock.length > 0) {
        const names = lowStock.map((med) => med.Name);
        warning = `⚠️ Low stock for: ${names.join(", ")} is less than 4 `;
      }

      res.status(200).json({
        msg: result,
        warning: warning, // 👈 الرسالة التحذيرية
      });
    } else {
      res.status(404).json({ msg: "No medicines found" });
    }
  });
});

router.get("/search", (req, res) => {
  const { pharmacy_id  } = req.body;
  const {input} = req.query

  const query = `
   SELECT medicine.Name, medicine.Category, medicine.Description, pharmacymedicine.Price, pharmacymedicine.Quantity, pharmacymedicine.ExpiryDate FROM medicine JOIN pharmacymedicine ON medicine.Id = pharmacymedicine.MedicineId WHERE pharmacymedicine.PharmacyId = ? and medicine.Name LIKE ? ;
  `;

  const values = [pharmacy_id , `%${input}%`];

  db.execute(query, values, (error, result) => {
    if (error) return res.json({ msg: error.message });

    if (result.length != 0) {
      const lowStock = result.filter((med) => med.Quantity < 4);

      let warning = null;

      if (lowStock.length > 0) {
        const names = lowStock.map((med) => med.Name);
        warning = `⚠️ Low stock for: ${names.join(", ")} is less than 4 `;
      }

      res.status(200).json({
        msg: result,
        warning: warning, // 👈 الرسالة التحذيرية
      });
    } else {
      res.status(404).json({ msg: "No medicines found" });
    }
  });
});

// router.get("search" , (req,res)=>{

// const {input} = req.query
// const values = [`% ${input}%`]

// })

export default router;

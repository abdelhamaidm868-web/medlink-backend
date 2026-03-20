import { Router } from "express";
import { db } from "../../config/database.js";

const router = Router()

// router.delete("/del_medicine" , (req,res)=>{
//   const { pharmacy_id , medicine_id , Quantity} = req.body;
  

//   const query = `
//    SELECT medicine.Name, medicine.Category, medicine.Description, pharmacymedicine.Price, pharmacymedicine.Quantity, pharmacymedicine.ExpiryDate FROM medicine JOIN pharmacymedicine ON medicine.Id = pharmacymedicine.MedicineId WHERE pharmacymedicine.PharmacyId = ? and  pharmacymedicine.MedicineId = ?;
//   `;

//   const values = [pharmacy_id  , medicine_id];

//   db.execute(query, values, (error, result) => {
//     if (error) return res.json({ msg: error.message });

//     if (result.length != 0) {
//       const delete_all = result.filter((med) => med.Quantity ==Quantity);
//       const delete_some = result.filter((med) => med.Quantity > Quantity);
//       const over_quinity = result.filter((med) => med.Quantity < Quantity);

//       let warning = null;

//       if (delete_all.length > 0) {
//        const query_delete_all_medicine = `DELETE from pharmacymedicine where PharmacyId=? and MedicineId= ?`
//        const values_delete = [pharmacy_id , medicine_id]
//        db.execute(query_delete_all_medicine , values_delete , (error , result ) =>{
//         if (error) return res.json({msg : error.result})
//         res.status(200).json({msg:"process Delete all medicine Done"})
//        })
        
//       }
//     if (delete_some !=0)
//     {

//         //الكمية اقل 

//          const query_updateQuintity_medicine = `UPDATE pharmacymedicine set pharmacymedicine.Quantity = ? where PharmacyId= ? and MedicineId = ?`
//        const values_updateQuitity = [ Quantity,pharmacy_id , medicine_id]
//        db.execute(query_updateQuintity_medicine , values_updateQuitity , (error , result ) =>{
//         if (error) return res.json({msg : error.result})
//         res.status(200).json({msg:"process Delete Quntity medicine Done"})

//       })

//       }

// if(over_quinity !=0){
//     res.status(400).json({msg : "you not have this Quntity of Medicine"})
// }

//       res.status(200).json({
//         msg: result,
//         warning: warning, // 👈 الرسالة التحذيرية
//       });
//     } else {
//       res.status(404).json({ msg: "No medicines found" });
//     }
//   });
// })


router.delete("/del_medicine", (req, res) => {
  const { pharmacy_id, medicine_id, Quantity } = req.body;

  const query = `
    SELECT pharmacymedicine.Quantity 
    FROM pharmacymedicine 
    WHERE PharmacyId = ? AND MedicineId = ?
  `;

  db.execute(query, [pharmacy_id, medicine_id], (error, result) => {
    if (error) return res.json({ msg: error.message });

    if (result.length == 0) {
      return res.status(404).json({ msg: "Medicine not found" });
    }

    const currentQuantity = result[0].Quantity;

    // ❌ لو عايز يحذف أكتر من الموجود
    if (Quantity > currentQuantity) {
      return res.status(400).json({
        msg: "you not have this Quantity of Medicine",
      });
    }

    // ✅ حذف كله
    if (Quantity == currentQuantity) {
      const deleteQuery = `
        DELETE FROM pharmacymedicine 
        WHERE PharmacyId = ? AND MedicineId = ?
      `;

      return db.execute(deleteQuery, [pharmacy_id, medicine_id], (err) => {
        if (err) return res.json({ msg: err.message });

        return res.status(200).json({
          msg: "Delete all medicine Done",
        });
      });
    }

    // ✅ حذف جزء
    const newQuantity = currentQuantity - Quantity;

    const updateQuery = `
      UPDATE pharmacymedicine 
      SET Quantity = ? 
      WHERE PharmacyId = ? AND MedicineId = ?
    `;

    db.execute(updateQuery, [newQuantity, pharmacy_id, medicine_id], (err) => {
      if (err) return res.json({ msg: err.message });

      res.status(200).json({
        msg: "Delete part of medicine Done",
        remaining: newQuantity,
      });
    });
  });
});

export default router
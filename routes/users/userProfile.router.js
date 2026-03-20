import { Router } from "express";
import {db} from "../../config/database.js"
import bcrypt from "bcrypt";
const router = Router()





router.get("/" , (req,res)=>{
const {id_user} = req.body
const values = [id_user]
const query_check_find_user = "select Name , Email , Phone , Location , ProfileImagePath from users where id =?"
db.execute(query_check_find_user , values , (error , result )=>{

if(result.length != 0 ){
res.status(200).json({massage : "user Data" , data :result})
}

else{
  res.status(404).json({
    message : "user not fond "
  })
}

})

})




router.put("/update_profile", async (req, res) => {
  try {
    const { id_user, name, email, password, phone, location, ProfileImagePath } = req.body;

    if (!id_user || !name || !email) {
      return res.status(400).json({ msg: "Missing required fields" });
    }

    let hashedPassword = password;

    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    const query = `
    UPDATE users
      SET Name = ?, Email = ?, Password = ?, Phone = ?, Location = ?, ProfileImagePath = ?
      WHERE id = ?
    `;

    const values = [name, email, hashedPassword, phone, location, ProfileImagePath, id_user];

  db.execute(query, values , (error , result)=>{
    

   res.status(200).json({ msg: "Process Update Done", data: result });

  });

 

  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
});


router.post("/add_medicine/:id" , (req,res)=>{

  const { medicine_id, user_id} = req.body ;
const {id} = req.params

//-----------------------------------------------------------------------------------------

if(id===user_id){




const query_check_has_medicine = `select 	medicine.Name , medicine.Id as medcine_id , medicine.Category , medicine.Description from usermedicine
JOIN medicine
on usermedicine.MedicineId = medicine.Id
join users 
ON users.Id = usermedicine.UserID
where users.Id = ?  and medicine.Name = ?` 
const values = [user_id , medicine_id]
db.execute(query_check_has_medicine , values , (error ,result)=>{
if (error) return res.json({msg : error.message})

  if (result.length != 0 ){
    res.status(400).json({msg: "this medicine in your profile"})
  }
  else{


   const query = `INSERT INTO usermedicine (MedicineId, UserID)
VALUES (?, ?);`
const values =[medicine_id, user_id]
db.execute(query , values , (error , result )=>{
  if (error) return res.send({msge : error.message})
    if (result.affectedRows != 0 ){
      
      res.status(200).json({msg : "Add Medicine Done"})
      
    }else{
      res.status(500).json({msg : "Error in add Medicine "})
      
    }
  
})

  }
})

}
//--------------------------------------------------------------------------------------------------------


else{
  res.status(401).json({msg: "Don't have access on user medicine"})
}

})





router.delete("/del_medicine/:id" , (req,res)=>{

const { medicine_id, user_id} = req.body ;
const {id} = req.params

//-----------------------------------------------------------------------------------------

if(id===user_id){




const query_check_has_medicine = `select 	medicine.Name from medicine
JOIN usermedicine 
on medicine.Id = usermedicine.MedicineId 
JOIN users
on users.Id = usermedicine.UserID
where usermedicine.UserID= ?  and usermedicine.MedicineId = ?`
const values = [user_id , medicine_id]
db.execute(query_check_has_medicine , values , (error ,result)=>{
if (error) return res.json({msg : error.message})

  if (result.length == 0 ){
    res.status(400).json({msg: "this medicine Not in your profile"})
  }
  else{

// begin work 
   const query = `DELETE from usermedicine where UserID = ? and MedicineId = ?;`
const values =[ user_id , medicine_id]
db.execute(query , values , (error , result )=>{
  if (error) return res.send({msge : error.message})
    if (result.affectedRows != 0 ){
      
      res.status(200).json({msg : "Delete Medicine Done"})
      
    }else{
      res.status(500).json({msg : "Error in Delete Medicine "})
      
    }
  
})

  }
})

}
//--------------------------------------------------------------------------------------------------------


else{
  res.status(401).json({msg: "Don't have access on user medicine"})
}

})



export default router
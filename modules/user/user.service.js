import { db } from "../../config/database.js";

import bcrypt from "bcrypt";
//////////////////////////////////////////////////////////////////////////////
export const get_profile = (req, res) => {
  const { id_user } = req.body;
  const values = [id_user];
  const query_check_find_user = "SELECT Name, Email, Phone, Location, ProfileImagePath FROM users WHERE id = ?";
  
  db.execute(query_check_find_user, values, (error, result) => {
    if (error) return res.status(500).json({ msg: error.message });
    if (result.length != 0) {
      res.status(200).json({ message: "User Data", data: result });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  });
}

//////////////////////////////////////////////////////////////////
export const update_profile = async (req, res) => {
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

    db.execute(query, values, (error, result) => {
      if (error) return res.status(500).json({ msg: error.message });
      res.status(200).json({ msg: "Process Update Done", data: result });
    });
  } catch (error) {
    res.status(500).json({ msg: error.message });
  }
}
//////////////////////////////////////////////////////////////////

export const add_medicine = (req, res) => {
  const { medicine_id, user_id, duration_days } = req.body;
  const { id } = req.params;

  if (id === user_id) {

    const query_check_has_medicine = `
      SELECT medicine.Id
      FROM usermedicine 
      JOIN medicine ON usermedicine.MedicineId = medicine.Id 
      WHERE usermedicine.UserID = ? AND medicine.Id = ?
    `;

    const values = [user_id, medicine_id];

    db.execute(query_check_has_medicine, values, (error, result) => {
      if (error) return res.status(500).json({ msg: error.message });

      if (result.length != 0) {
        return res.status(400).json({ msg: "This medicine is already in your profile" });
      }

      // ✅ هنا الحساب جوه SQL
      const query = `
        INSERT INTO usermedicine 
        (MedicineId, UserID, start_date, duration_days, end_date)
        VALUES (?, ?, CURRENT_DATE, ?, DATE_ADD(CURRENT_DATE, INTERVAL ? DAY))
      `;

      const insertValues = [
        medicine_id,
        user_id,
        duration_days,
        duration_days
      ];

      db.execute(query, insertValues, (error, result) => {
        if (error) return res.status(500).json({ msg: error.message });

        if (result.affectedRows != 0) {
          res.status(200).json({
            msg: "Add Medicine Done",
            duration_days
          });
        } else {
          res.status(500).json({ msg: "Error in adding Medicine" });
        }
      });
    });

  } else {
    res.status(401).json({ msg: "Don't have access to user medicine" });
  }
};

//////////////////////////////////////////////////////////////////
export const get_medicine_user = (req, res)=>{

const {user_id} = req.body

const query = `select usermedicine.start_date, usermedicine.start_date ,usermedicine.duration_days , usermedicine.end_date , usermedicine.status, medicine.Name , medicine.Manufacturer , medicine.Category , medicine.Description  from usermedicine 
JOIN medicine
ON usermedicine.MedicineId = medicine.Id
WHERE usermedicine.UserID = ?;`

const values = [ user_id]

db.execute(query , values , (error , result)=>{
  if (error) return  res.status(500).json({msg : error.message})

   if (result.length != 0) {
      res.status(200).json({ message: "medicine Data", data: result });
    } else {
      res.status(404).json({ message: "medicine  not exist" });
    } 

})

}


//////////////////////////////////////////////////////////////////

export const update_status_medicine = (req, res)=>{


const { user_id , medicine_id} = req.body 

const query =` select status from  usermedicine where UserID = ? and  MedicineId=?  `

const values =[ user_id , medicine_id]

db.execute(query , values , (error , result)=>{
  if (error) return res.status(500).json({msg:error.message})
    
    if (result.length ==0 )
      return res.status(404).json({msg:"don't find medicine in user"})
    
    const query_update = `UPDATE usermedicine SET status = 'inactive' WHERE usermedicine.UserID = ? AND usermedicine.MedicineId = ? `
    const values_update =[ user_id , medicine_id]
    db.execute(query_update , values_update , (error , result )=>{
      if (error) return res.status(500).json({msg:error.message})
      
    if (result.length ==0 )
      return res.status(404).json({msg:"error in update medicine in user"})
    
    return res.status(201).json({msg:"status change" , data :result})

    })


})



}

//////////////////////////////////////////////////////////////////
export const get_desise_user = (req, res)=>{

const {user_id} = req.body

const query = `SELECT userdiseases.UserId , diseases.Name , userdiseases.DiseaseId 
from userdiseases JOIN diseases 
ON diseases.Id = userdiseases.DiseaseId
WHERE userdiseases.UserId=?`

const values = [ user_id]

db.execute(query , values , (error , result)=>{
  if (error) return  res.status(500).json({msg : error.message})

   if (result.length != 0) {
      res.status(200).json({ message: "medicine Data", data: result });
    } else {
      res.status(404).json({ message: "medicine  not exist" });
    } 

})

}


///////////////////////////////////////////////////////////////////////////

export const add_disease = (req,res)=>{
const {disease_id , user_id } = req.body 

const query =`SELECT userdiseases.UserId , userdiseases.DiseaseId 
from userdiseases 
WHERE userdiseases.UserId=? AND userdiseases.DiseaseId=?;` 

const values = [  user_id ,disease_id ]

db.execute(query , values , (error, result)=>{

if (result.length != 0) {
    return  res.status(200).json({ message: "disease aready exist", data: result });
    } else {
   

const query_add =`INSERT INTO userdiseases (UserId, DiseaseId) VALUES (?, ?);`
const values_add =[user_id , disease_id] 

db.execute(query_add, values_add  , (error , result)=>{
if (error) return res.status(500).json({msg:error.message})


if (result.length != 0) {
    return  res.status(201).json({ message: "disease add ", data: result });
  } else {
    
    return  res.status(400).json({ message: "error in add ", data: result });

    }
   
})



    }

})




}


/////////////////////////////////////////////////////////////////////////////

export const del_disease = (req,res)=>{
const {disease_id , user_id } = req.body 

const query =`SELECT userdiseases.UserId , userdiseases.DiseaseId 
from userdiseases 
WHERE userdiseases.UserId=? AND userdiseases.DiseaseId=?;` 

const values = [  user_id ,disease_id ]

db.execute(query , values , (error, result)=>{

if (result.length == 0) {
    return  res.status(200).json({ message: "disease don't exist", data: result });
    } else {
   

const query_del =`DELETE from userdiseases WHERE userdiseases.UserId=? and userdiseases.DiseaseId =?`
const values_del =[user_id , disease_id] 

db.execute(query_del, values_del  , (error , result)=>{
if (error) return res.status(500).json({msg:error.message})


if (result.length != 0) {
    return  res.status(201).json({ message: "disease delete ", data: result });
  } else {
    
    return  res.status(400).json({ message: "error in delete", data: result });

    }
   
})



    }

})




}



//////////////////////////////////////////////////////////////////

export const del_medicine = (req, res) => {
  const { medicine_id, user_id } = req.body;
  const { id } = req.params;

  if (id === user_id) {
    const query_check_has_medicine = `SELECT medicine.Name FROM medicine JOIN usermedicine ON medicine.Id = usermedicine.MedicineId JOIN users ON users.Id = usermedicine.UserID WHERE usermedicine.UserID = ? AND usermedicine.MedicineId = ?`;
    const values = [user_id, medicine_id];
    
    db.execute(query_check_has_medicine, values, (error, result) => {
      if (error) return res.status(500).json({ msg: error.message });

      if (result.length == 0) {
        res.status(400).json({ msg: "This medicine is not in your profile" });
      } else {
        const query = `DELETE FROM usermedicine WHERE UserID = ? AND MedicineId = ?;`;
        const deleteValues = [user_id, medicine_id];
        db.execute(query, deleteValues, (error, result) => {
          if (error) return res.status(500).json({ msg: error.message });
          if (result.affectedRows != 0) {
            res.status(200).json({ msg: "Delete Medicine Done" });
          } else {
            res.status(500).json({ msg: "Error in Deleting Medicine" });
          }
        });
      }
    });
  } else {
    res.status(401).json({ msg: "Don't have access to user medicine" });
  }
}

export const home_getall_medicine =  (req, res) => {
  const query = `SELECT medicine.Name , medicine.Id as medicine_id , medicine.Manufacturer , medicine.Category , medicine.Description , pharmacymedicine.Price , pharmacymedicine.Quantity , pharmacy.Name as pharmacy_name , pharmacy.Location FROM medicine JOIN pharmacymedicine ON pharmacymedicine.MedicineId = medicine.Id JOIN pharmacy ON pharmacy.Id = pharmacymedicine.PharmacyId;`;
  const values = [];

router.get("/home/medicine" , (req,res)=>{
  const query=`SELECT medicine.Name , medicine.Id as medicine_id , medicine.Manufacturer , medicine.Category , medicine.Description , pharmacymedicine.Price , pharmacymedicine.Quantity , pharmacy.Name as pharmacy_name , pharmacy.Location FROM medicine JOIN pharmacymedicine ON pharmacymedicine.MedicineId = medicine.Id JOIN pharmacy ON pharmacy.Id = pharmacymedicine.PharmacyId; `
  db.execute(query, values, (error, result) => {
    if (error) return res.status(500).json({ msg: error.message });
    res.status(200).json({ data: result });
  });
});



db.execute(query ,values , (error , result)=>{
  if (error) return res.json({msg: error.message})
  
    res.status(200).json({data:result})
})


}

export const home_search = (req, res) => {
  const { input } = req.query;
  
  const query = `
 SELECT medicine.Name  , medicine.Id as medicine_id , medicine.Manufacturer ,  medicine.Category , medicine.Description ,
pharmacymedicine.Price , pharmacymedicine.Quantity , pharmacy.Name as pharmacy_name , pharmacy.Location , pharmacy.Id as pharmcy_id , pharmacy.Phone as pharmcy_phone , pharmacy.Rate 
FROM medicine
JOIN pharmacymedicine
 ON pharmacymedicine.MedicineId = medicine.Id
JOIN pharmacy
  ON pharmacy.Id = pharmacymedicine.PharmacyId
  WHERE medicine.Name like  ?`;

  // نحط % في القيمة نفسها
  const values = [`%${input}%`];

  db.execute(query, values, (error, result) => {
    if (error) return res.json({ msg: error.message });
    if (error) return res.status(500).json({ msg: error.message });

    if (result.length != 0){
      
    if (result.length != 0) {
      res.status(200).json({ data: result });

    } 
else{
      res.status(404).json({msg : "Don't find any medcine"})
    }
  }
})
}


export const add_commint = (req,res)=>{
const {comm ,  pharmcy_id , user_id} = req.body 

const query = `INSERT INTO comment (User_id, Pharmacy_id, Comm) VALUES ( ?, ?, ?)`
const values =[user_id , pharmcy_id , comm]

db.execute(query , values , (error , result ) =>{

if (error) return res.status(500).json({msg : error.message})

res.status(201).json({msg:"Process Done" , data : result})

})
}
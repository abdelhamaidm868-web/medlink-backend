// createOrder 
import { db } from "../../config/database.js";
// ---------------------create order-------------------------------------------------------
export const createOrder = async (req, res) => {
  const { user_id, pharmacy_id, items } = req.body;

  try {
    if (!user_id || !pharmacy_id || !items || items.length === 0) {
      return res.status(400).json({ message: "Missing data" });
    }

    let totalPrice = 0;
    let itemsData = [];

    // 1️⃣ check stock + حساب السعر
    for (const item of items) {
      const [rows] = await db.promise().query(
        "SELECT Price, Quantity FROM pharmacymedicine WHERE PharmacyId = ? AND MedicineId = ?",
        [pharmacy_id, item.medicine_id]
      );

      if (rows.length === 0) {
        return res.status(400).json({
          message: `Medicine ${item.medicine_id} not found`
        });
      }

      const price = Number(rows[0].Price);
      const stock = Number(rows[0].Quantity);
      const quantity = Number(item.quantity);

      // check valid numbers
      if (isNaN(price) || isNaN(quantity)) {
        return res.status(400).json({
          message: "Invalid data"
        });
      }

      // ✅ check stock
      if (stock < quantity) {
        return res.status(400).json({
          message: `Not enough stock for medicine ${item.medicine_id}`
        });
      }

      totalPrice += price * quantity;

      itemsData.push({
        medicine_id: item.medicine_id,
        quantity,
        price
      });
    }

    // 2️⃣ إنشاء order
    const [orderResult] = await db.promise().query(
      "INSERT INTO orders (UserId, PharmacyId, TotalPrice, OrderStatus) VALUES (?, ?, ?, 'Pending')",
      [user_id, pharmacy_id, totalPrice]
    );

    const orderId = orderResult.insertId;

    // 3️⃣ حفظ التفاصيل + تحديث المخزون
    for (const item of itemsData) {

      // order details
      await db.promise().query(
        "INSERT INTO orderdetails (OrderId, MedicineId, Quantity, Price) VALUES (?, ?, ?, ?)",
        [orderId, item.medicine_id, item.quantity, item.price]
      );

      // ✅ update stock
      await db.promise().query(
        "UPDATE pharmacymedicine SET Quantity = Quantity - ? WHERE PharmacyId = ? AND MedicineId = ?",
        [item.quantity, pharmacy_id, item.medicine_id]
      );
    }

    res.json({
      message: "Order created successfully",
      totalPrice
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ---------------------get order by id-------------------------------------------------------

export const getOrderById = async (req, res) => {
  const {user_id} = req.body;

  try {
    const [rows] = await db.promise().query(`
  SELECT 
        o.Id AS order_id,
        o.UserId,
        o.PharmacyId,
        o.TotalPrice,
        o.OrderStatus,
        o.OrderDate,

        od.MedicineId,
        od.Quantity,
        od.Price,

        m.Name AS medicine_name

      FROM orders o
      JOIN orderdetails od ON o.Id = od.OrderId
      JOIN medicine m ON od.MedicineId = m.Id
      WHERE o.UserId=1;
    `, [user_id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 🧠 نحول البيانات لشكل clean
    const order = {
      order_id: rows[0].order_id,
      user_id: rows[0].UserId,
      pharmacy_id: rows[0].PharmacyId,
      total_price: rows[0].TotalPrice,
      status: rows[0].OrderStatus,
      order_date: rows[0].OrderDate,
      items: []
    };

    for (const row of rows) {
      order.items.push({
        medicine_id: row.MedicineId,
        name: row.medicine_name,
        quantity: row.Quantity,
        price: row.Price
      });
    }

    res.json(order);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ---------------------get all order-------------------------------------------------------
export const getOrders = async (req, res) => {
  try {
    const [rows] = await db.promise().query(`
      SELECT 
        o.Id AS order_id,
        o.UserId,
        o.PharmacyId,
        o.TotalPrice,
        o.OrderStatus,
        o.OrderDate,

        od.MedicineId,
        od.Quantity,
        od.Price,

        m.Name AS medicine_name

      FROM orders o
      JOIN orderdetails od ON o.Id = od.OrderId
      JOIN medicine m ON od.MedicineId = m.Id
      ORDER BY o.Id DESC
    `);

    const ordersMap = {};

    for (const row of rows) {

      // لو order مش موجود في الماب
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          user_id: row.UserId,
          pharmacy_id: row.PharmacyId,
          total_price: row.TotalPrice,
          status: row.OrderStatus,
          order_date: row.OrderDate,
          items: []
        };
      }

      // نضيف item
      ordersMap[row.order_id].items.push({
        medicine_id: row.MedicineId,
        name: row.medicine_name,
        quantity: row.Quantity,
        price: row.Price
      });
    }

    // نحولها array
    const result = Object.values(ordersMap);

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// ---------------------cancel order -------------------------------------------------------
export const cancelOrder = async (req, res) => {
  const orderId = req.params.id;

  try { 
    // 1️⃣ هات order details
    const [details] = await db.promise().query(
      "SELECT MedicineId, Quantity FROM orderdetails WHERE OrderId = ?",
      [orderId]
    );

    if (details.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2️⃣ رجّع stock
    for (const item of details) {
      await db.promise().query(
        "UPDATE pharmacymedicine SET Quantity = Quantity + ? WHERE MedicineId = ?",
        [item.Quantity, item.MedicineId]
      );
    }

    // 3️⃣ غير الحالة بس
    await db.promise().query(
      "UPDATE orders SET OrderStatus = 'Cancelled' WHERE Id = ?",
      [orderId]
    );

    res.json({
      message: "Order cancelled successfully (soft delete)"
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
// -----------------------update order statues-----------------------------------------------
export const updateOrderStatus = async (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  try {
    // 1️⃣ هات الحالة الحالية
    const [rows] = await db.promise().query(
      "SELECT OrderStatus FROM orders WHERE Id = ?",
      [orderId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const currentStatus = rows[0].OrderStatus;

    // 2️⃣ rules
    const validTransitions = {
      Pending: ["Approved", "Rejected", "Cancelled"],
      Approved: ["Completed", "Cancelled"],
      Completed: [],
      Rejected: [],
      Cancelled: []
    };

    if (!validTransitions[currentStatus].includes(status)) {
      return res.status(400).json({
        message: `Cannot change status from ${currentStatus} to ${status}`
      });
    }

    await db.promise().query(
      "UPDATE orders SET OrderStatus = ? WHERE Id = ?",
      [status, orderId]
    );

    res.json({
      message: `Order status updated to ${status}`
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
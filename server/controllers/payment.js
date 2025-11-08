// controllers/paymentController.js
const express = require("express");
const authMiddleware = require("../middleware/auth")
const Payment = require("../models/Payment");
const Rental = require("../models/Rental");
const adminMiddleware = require("../middleware/admin");
const router = express.Router()

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const { rentalId, amount, method, transactionId } = req.body;
    const tenantId = req.user.id;

    console.log("💳 New payment attempt by tenant:", tenantId);

    // 🔹 Find the rental (with populated house info)
    const rental = await Rental.findById(rentalId).populate("houseId", "houseNo price");
    if (!rental) {
      return res.status(404).json({ message: "Rental not found" });
    }

    // 🔹 Calculate balance
    const balance = amount - rental.amount;

    // 🔹 Create payment
    const payment = await Payment.create({
      tenantId,
      rentalId,
      amount,
      balance,
      method,
      transactionId,
      status: method === "cash" ? "pending" : "successful",
    });

    // 🔹 Update rental status if paid
    if (method !== "cash" && balance >= 0) {
      rental.paymentStatus = "paid";
      await rental.save();
    }

    // 🔹 Populate for frontend
    const populatedPayment = await Payment.findById(payment._id)
      .populate("tenantId", "name email")
      .populate({
        path: "rentalId",
        populate: { path: "houseId", select: "houseNo" },
      });

    const responsePayment = {
      _id: populatedPayment._id,
      tenantName: populatedPayment.tenantId?.name || "Unknown",
      houseName: populatedPayment.rentalId?.houseId?.houseNo || "N/A",
      method: populatedPayment.method,
      amount: populatedPayment.amount,
      balance: populatedPayment.balance,
      transactionId: populatedPayment.transactionId,
      status: populatedPayment.status,
      paymentDate: populatedPayment.paymentDate,
      tenantId: populatedPayment.tenantId?._id, // ✅ include tenantId
    };

    // ✅ Emit instant update if payment was successful (e.g. M-Pesa)
    if (method !== "cash" && responsePayment.status === "successful") {
      const io = req.app.get("io");
      if (io && tenantId) {
        io.to(tenantId.toString()).emit("paymentApproved", responsePayment);
        console.log(`📢 Instant success emitted to tenant ${tenantId}`);
      }
    }

    res.status(201).json({
      message: "Payment recorded successfully",
      payment: responsePayment,
    });
  } catch (err) {
    console.error("💥 Payment creation error:", err);
    res.status(500).json({
      message: "Error creating payment",
      error: err.message,
    });
  }
});


// 🧾 Admin - Get all payments
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("tenantId", "name email")
      .populate({
        path: "rentalId",
        populate: {
          path: "houseId",
          select: "houseNo price1",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ payments });
  } catch (err) {
    console.error("Error fetching all payments:", err);
    res.status(500).json({
      message: "Failed to fetch all payments",
      error: err.message,
    });
  }
});

// 👤 Tenant - Get their own payments
router.get("/my", authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.id;

    const payments = await Payment.find({ tenantId })
      .populate("tenantId", "name email")
      .populate({
        path: "rentalId",
        populate: {
          path: "houseId",
          select: "houseNo price availability",
        },
      })
      .sort({ createdAt: -1 });

    res.status(200).json({ payments });
  } catch (err) {
    console.error("Error fetching tenant payments:", err);
    res.status(500).json({
      message: "Failed to fetch tenant payments",
      error: err.message,
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }
    res.json({ payment });
  } catch (error) {
    console.error("Error fetching payment by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
});
// ✅ Admin approves cash payments
router.put("/approve/:paymentId", authMiddleware, async (req, res) => {
  try {
    console.log("🟢 Route hit: /approve/:paymentId");

    const { paymentId } = req.params;
    const adminId = req.user.id;
    console.log("📦 paymentId:", paymentId, "adminId:", adminId);

    const payment = await Payment.findById(paymentId);
    console.log("🧾 Payment found:", !!payment);

    if (!payment) {
      console.log("❌ No payment found");
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.method !== "cash") {
      console.log("⚠️ Payment not cash, skipping approval");
      return res.status(400).json({ message: "Only cash payments require approval" });
    }

    console.log("💰 Marking payment successful...");
    payment.status = "successful";
    payment.approvedBy = adminId;
    await payment.save();

    console.log("🏠 Updating rental...");
    await Rental.findByIdAndUpdate(payment.rentalId, { paymentStatus: "paid" });

    console.log("👥 Populating payment...");
    const populatedPayment = await Payment.findById(payment._id)
      .populate("tenantId", "name email")
      .populate({
        path: "rentalId",
        populate: { path: "houseId", select: "houseNo" },
      });

    console.log("📤 Ready to emit to tenant...");
    const io = req.app.get("io");
    console.log("🧩 io exists:", !!io);
    console.log("👤 tenantId:", populatedPayment.tenantId?._id);

    if (io && populatedPayment.tenantId?._id) {
      const tenantRoom = populatedPayment.tenantId._id.toString();
      io.to(tenantRoom).emit("paymentApproved", populatedPayment);
      console.log(`📢 Sent paymentApproved event to tenant ${tenantRoom}`);
    } else {
      console.log("⚠️ No io or tenantId found");
    }

    res.status(200).json({
      message: "Cash payment approved",
      payment: populatedPayment,
    });
  } catch (error) {
    console.error("💥 Approval error:", error);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;

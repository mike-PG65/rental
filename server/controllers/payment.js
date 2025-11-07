// controllers/paymentController.js
const express = require("express");
const authMiddleware = require("../middleware/auth")
const Payment = require("../models/Payment");
const Rental = require("../models/Rental");
const adminMiddleware = require("../middleware/admin");
const router = express.Router()

router.post('/add', authMiddleware, async (req, res) => {
    try {
        const { tenantId, rentalId, amount, method, transactionId } = req.body;
        console.log("Auth header:", req.headers.authorization);

        // Find the rental to know how much rent is due
        const rental = await Rental.findById(rentalId);
        if (!rental) {
            return res.status(404).json({ message: "Rental not found" });
        }

        // Calculate balance: amount paid - rent amount
        const balance = amount - rental.amount;

        // Create payment record
        const payment = await Payment.create({
            tenantId,
            rentalId,
            amount,
            balance,
            method,
            transactionId,
            status: method === "cash" ? "pending" : "successful", // cash pending approval
        });

        // Update rental payment status if needed
        if (method !== "cash" && balance >= 0) {
            rental.paymentStatus = "paid";
            await rental.save();
        }

        res.status(201).json({
            message: "Payment recorded successfully",
            payment,
        });
    } catch (err) {
        console.error("Payment creation error:", err);
        res.status(500).json({ message: "Error creating payment", error: err.message });
    }
});

router.put("/approve/:paymentId", adminMiddleware, async (req, res) => {
    try {
        const { paymentId } = req.params;
        const adminId = req.user.id; // assuming you use auth middleware

        // find payment
        const payment = await Payment.findById(paymentId);
        if (!payment) return res.status(404).json({ message: "Payment not found" });

        if (payment.method !== "cash")
            return res.status(400).json({ message: "Only cash payments require approval" });

        // mark as successful
        payment.status = "successful";
        payment.approvedBy = adminId;
        await payment.save();

        // update rental payment status
        await Rental.findByIdAndUpdate(payment.rentalId, { paymentStatus: "paid" });

        res.status(200).json({
            message: "Cash payment approved and rental marked as paid",
            payment,
        });
    } catch (error) {
        console.error("Approval error:", error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router

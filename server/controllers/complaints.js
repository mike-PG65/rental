console.log("✅ Complaints route loaded!");
const express = require("express")
const authMiddleware = require("../middleware/auth");
const router = express.Router()
const Rental = require("../models/Rental")
const Complaint = require('../models/Complaint')
const User = require('../models/User');
const adminMiddleware = require("../middleware/admin");

router.post("/add", authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.id; // extracted from token
    const { subject, description } = req.body;

    // ✅ Find rental where this tenant is renting
    const rental = await Rental.findOne({ tenantId }).populate("tenantId houseId");

    if (!rental) {
      return res.status(404).json({ message: "Rental not found for this tenant" });
    }

    // ✅ Create complaint linked to that rental
    const complaint = new Complaint({
      rentalId: rental._id,
      tenantId: rental.tenantId._id,
      houseId: rental.houseId._id,
      subject,
      description,
    });

    await complaint.save();

    await User.findByIdAndUpdate(tenantId, {
  $push: { complaints: complaint._id },
});
    res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ message: "Failed to create complaint" });
  }
});


// ✅ Get all complaints (for admin or tenant dashboard)
router.get("/all", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate({
        path: "rentalId",
        select: "paymentStatus amount nextPaymentDate", // include payment details
      })
      .populate({
        path: "tenantId",
        select: "name email", // get tenant name and email
      })
      .populate({
        path: "houseId",
        select: "houseNo", // get house number
      })
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// GET complaints for the logged-in tenant
// router.get("/my", authMiddleware, async (req, res) => {
//   try {

    
//     const tenantId = req.user.id; // from JWT token (middleware must set req.user)

//     console.log("✅ Tenant ID from token:", tenantId);

//     const complaints = await Complaint.find({ tenantId })
//       .populate("rentalId", "amount nextPaymentDate")
//       .populate("houseId", "houseNo")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ complaints });
//   } catch (error) {
//     console.error("Error fetching complaints:", error);
//     res.status(500).json({ message: "Failed to fetch complaints" });
//   }
// });


router.get("/my", authMiddleware, async (req, res) => {
  try {
    console.log("✅ Tenant ID from token:", req.user.id);

    const complaints = await Complaint.find({ tenantId: req.user.id })
      .populate("rentalId", "amount nextPaymentDate")
      .populate("houseId", "houseNo")
      .sort({ createdAt: -1 });

    console.log("✅ Complaints found:", complaints.length);

    res.status(200).json({ complaints });
  } catch (error) {
    console.error("❌ Error fetching complaints:", error);
    res.status(500).json({ message: "Failed to fetch complaints" });
  }
});

// ✅ Admin: Get a single complaint by ID and mark as 'in progress' if pending
router.get("/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const complaintId = req.params.id;

    // Fetch complaint with details
    const complaint = await Complaint.findById(complaintId)
      .populate("rentalId", "amount nextPaymentDate paymentStatus")
      .populate("houseId", "houseNo location")
      .populate("tenantId", "name email");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    // ✅ If complaint is pending, update status to "in progress"
    if (complaint.status === "pending") {
      complaint.status = "in progress";
      await complaint.save();
    }

    res.status(200).json({ complaint });
  } catch (error) {
    console.error("❌ Error fetching complaint:", error);
    res.status(500).json({ message: "Failed to fetch complaint" });
  }
});


// ✅ Get a single complaint by ID (for tenant)
router.get("/my/:id", authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.id;
    const complaintId = req.params.id;

    console.log(`🔍 Fetching complaint ${complaintId} for tenant ${tenantId}`);

    // Find complaint only if it belongs to this tenant
    const complaint = await Complaint.findOne({
      _id: complaintId,
      tenantId: tenantId,
    })
      .populate("rentalId", "amount nextPaymentDate paymentStatus")
      .populate("houseId", "houseNo location")
      .populate("tenantId", "name email");

    if (!complaint) {
      return res
        .status(404)
        .json({ message: "Complaint not found or does not belong to this tenant" });
    }

    res.status(200).json({ complaint });
  } catch (error) {
    console.error("❌ Error fetching single complaint:", error);
    res.status(500).json({ message: "Failed to fetch complaint" });
  }
});

// ✅ Edit a complaint (tenant can only edit their own)
router.put("/my/:id", authMiddleware, async (req, res) => {
  try {
    const tenantId = req.user.id;
    const complaintId = req.params.id;
    const { subject, description } = req.body;

    console.log(`✏️ Tenant ${tenantId} is trying to edit complaint ${complaintId}`);

    // Find complaint that belongs to this tenant
    const complaint = await Complaint.findOne({
      _id: complaintId,
      tenantId: tenantId,
    });

    if (!complaint) {
      return res
        .status(404)
        .json({ message: "Complaint not found or you are not authorized to edit it" });
    }

    // Only allow editing if the complaint is still 'pending'
    if (complaint.status !== "pending") {
      return res.status(400).json({
        message: "You can only edit a complaint that is still pending.",
      });
    }

    // Update fields
    if (subject) complaint.subject = subject;
    if (description) complaint.description = description;

    await complaint.save();

    console.log("✅ Complaint updated successfully");
    res.status(200).json({
      message: "Complaint updated successfully",
      complaint,
    });
  } catch (error) {
    console.error("❌ Error updating complaint:", error);
    res.status(500).json({ message: "Failed to update complaint" });
  }
});



module.exports = router

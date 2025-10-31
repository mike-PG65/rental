const express = require("express")

const House = require("../models/House")
const Rental = require("../models/Rental")
const adminMiddleware = require("../middleware/admin")
const authMiddleware = require("../middleware/auth")

const router = express.Router()

router.post("/add", async (req, res) => {
  try {
    const { tenantId, houseId } = req.body;

    // ✅ Validate required fields
    if (!tenantId || !houseId) {
      return res.status(400).json({ error: "Tenant and house are required" });
    }

    // ✅ Check if the house exists
    const house = await House.findById(houseId);
    if (!house) {
      return res.status(404).json({ error: "House not found" });
    }

    // ✅ Ensure the house is available
    if (house.availability === "rented") {
      return res.status(400).json({ error: "This house is already rented" });
    }

    // ✅ Calculate next payment date (5th of next month)
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 5);

    // ✅ Create a new rental record
    const rental = new Rental({
      tenantId,
      houseId,
      startDate: today,
      amount: house.price,
      nextPaymentDate: nextMonth,
      rentalStatus: "active",
      paymentStatus: "pending",
    });

    const savedRental = await rental.save();

    // ✅ Mark the house as rented
    house.availability = "rented";
    await house.save();

    res.status(201).json({
      message: "Rental created successfully",
      rental: savedRental,
    });
  } catch (err) {
    console.error("Error creating rental:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get('/', async (req, res) => {
    try {
        const tenants = await Rental.find()
            .populate("tenantId", "name email")
            .populate("houseId", "houseNo ");

        if (!tenants)
            res.status(404).json({ error: "tenants not found!!" })

        res.status(200).json(tenants)
    } catch(err){
        return res.status(500).json({error: "server error"})
    }
});

router.get("/tenants", authMiddleware, async (req, res) => {
  try {
    // Find all rentals that currently have tenants
   const rentals = await Rental.find({ tenantId: { $ne: null } })
      .populate("tenantId", "name email") // Get tenant details
      .populate("houseId", "houseNo") // Get house number
      .lean(); // Make it plain JS object (faster)

    // Transform results (optional cleanup)
    const tenants = rentals.map(rental => ({
      _id: rental.tenantId._id,
      name: rental.tenantId.name,
      email: rental.tenantId.email,
      houseNo: rental.houseId?.houseNo || "N/A",
    }));

    res.status(200).json(tenants);
  } catch (error) {
    console.error("Error fetching tenants:", error);
    res.status(500).json({ message: "Failed to fetch tenants" });
  }
});



router.get("/tenant/:tenantId", authMiddleware, async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const today = new Date();

    // Get all rentals for this tenant
    const rentals = await Rental.find({ tenantId })
      .populate("houseId", "houseNo availability price");

    if (!rentals || rentals.length === 0) {
      return res.status(404).json({ message: "No rentals found for this tenant." });
    }

    // ✅ Loop through each rental and update status permanently in DB
    for (let rental of rentals) {
      const currentDay = today.getDate();

      // Only update unpaid records
      if (rental.paymentStatus !== "paid") {
        let newStatus = rental.paymentStatus;

        if (currentDay < 5) {
          newStatus = "pending"; // before due
        } else if (currentDay >= 5 && currentDay <= 10) {
          newStatus = "pending"; // grace period
        } else if (currentDay > 10) {
          newStatus = "late"; // after grace period
        }

        // ✅ Only update if there's a change to prevent redundant writes
        if (rental.paymentStatus !== newStatus) {
          rental.paymentStatus = newStatus;
          await rental.save();
        }
      }
    }

    // Re-fetch updated records (to ensure frontend gets latest state)
    const updatedRentals = await Rental.find({ tenantId })
      .populate("houseId", "houseNo availability price");

    res.status(200).json(updatedRentals);
  } catch (err) {
    console.error("Error fetching tenant rentals:", err);
    res.status(500).json({ error: "Server error!!" });
  }
});


router.get("/:rentalId", adminMiddleware, async (req, res) => {
    try{
        const rentalId = req.params

        const rental = await Rental.find({rentalId})
              .populate("tenantId", "name email")
              .populate("houseId", "houseNo price")

        if(!rental)
            return res.status(404).json({error: "Rental not found!!"})

        res.status(200).json({rental})
    } catch (err) {
    console.error("Error fetching rental:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:rentalId/status", adminMiddleware, async(req, res) => {
    try{
        const { rentalId } = req.params
        const { status } = req.body

        const rental = await Rental.findById({rentalId});

        if(!rental)
            return res.status(404).json({error: "Rental not found!!"})

        rental.rentalStatus = status

        if(status === "ended"){
            rental.endDate = new Date()

            const house = await House.findById(rental.houseId)

            if(house){
                house.avalability === "available"
                await house.save()
            }
        }

        await rental.save()
        res.status(200).json({message: `Rental marked as ${status}`})
            
    } catch(err){
        return res.status(500).json({error: "Server error!!"})
    }
})

module.exports = router



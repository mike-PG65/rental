const express = require("express");
const router = express.Router();
const House = require("../models/House");
const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin"); // if you want only admin/landlord to create houses

// ✅ Create a new house
router.post("/add", authMiddleware , async (req, res) => {
  try {
    const { price, houseNo } = req.body;

    const house = new House({
      price,
      houseNo,
      avalability: "available"
    });

    await house.save();
    res.status(201).json(house);
  } catch (err) {
    console.error("Error creating house:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Get all houses
router.get("/", async (req, res) => {
  try {
    const houses = await House.find();
    res.status(200).json(houses);
  } catch (err) {
    console.error("Error fetching houses:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/available", authMiddleware, async (req, res) => {
  try {
    const houses = await House.find({ availability: "available" }).select("houseNo price");
    res.status(200).json(houses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error while fetching houses" });
  }
});

// ✅ Get single house by ID
router.get("/:id", async (req, res) => {
  try {
    const house = await House.findById(req.params.id);
    if (!house) return res.status(404).json({ error: "House not found" });
    res.status(200).json(house);
  } catch (err) {
    console.error("Error fetching house:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Update a house
router.put("/edit/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const { price, avalability } = req.body;

    const house = await House.findByIdAndUpdate(
      req.params.id,
      { price, avalability },
      { new: true }
    );

    if (!house) return res.status(404).json({ error: "House not found" });
    res.status(200).json(house);
  } catch (err) {
    console.error("Error updating house:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// ✅ Delete a house
router.delete("/delete/:id", authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const house = await House.findByIdAndDelete(req.params.id);
    if (!house) return res.status(404).json({ error: "House not found" });
    res.status(200).json({ message: "House deleted successfully" });
  } catch (err) {
    console.error("Error deleting house:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all available houses



module.exports = router;

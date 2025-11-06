const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const adminMiddleware = require("../middleware/admin")
const nodemailer = require("nodemailer");
const sendResetEmail= require('../third/resetEmail')
require("dotenv").config();

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "User already exists" })

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });

    await user.save()

    return res.status(201).json({ message: `${name} you have been registered sucessefully` })
  } catch (err) {
    return res.status(500).json({ error: "Server error!!" })
  }
})
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "User not found!" });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ error: "Invalid credentials!" });

    // ✅ Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // ✅ Send cleaner response
    res.status(200).json({
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ error: "Server error!" });
  }
});


router.get('/users', async (req, res) => {
  try {
    const users = await User.find().select("-password")

    if (!users) return res.status(404).json({ error: "Users not found!!" })

    return res.status(200).json(users)
  } catch (err) {
    return res.status(500).json({ error: "Server error while finding the users!!" })
  }
});

// router.get("/tenants", authMiddleware, async (req, res) => {
//   try {
//     const tenants = await User.find({ role: "tenant" }).select("_id name email");
//     res.json(tenants);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to fetch tenants" });
//   }
// });


// ✅ FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ error: "User with this email not found" });

    const resetToken = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false, // true for port 465, false for 587
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: '"Tenant Portal" <no-reply@tenantportal.com>',
      to: email,
      subject: "Reset Your Tenant Portal Password",
      html: sendResetEmail(email, resetToken),
    });

    res.json({ message: "Password reset link sent to your email." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to send reset email" });
  }
});

// ✅ RESET PASSWORD
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user)
      return res.status(404).json({ error: "User not found or token invalid" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    res.json({ message: "Password reset successful!" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ error: "Invalid or expired token" });
  }
});

module.exports = router;



router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    // if(req.user.role !== admin && req.user.id !== id)
    //     return res.status(401).json({error: "Access denied!!"})

    const user = await User.findById(id).select("-password")

    if (!user)
      return res.status(404).json({ error: "User not found!!" })

    res.status(200).json(user)
  } catch (err) {
    return res.status(500).json({ error: "Server error!!" })
  }
});


router.put("/edit/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // Only allow admin or the user themselves
    if (req.user.role !== "admin" && req.user.id !== id) {
      return res.status(401).json({ error: "Unauthorized!" });
    }

    // Only allow these fields to be updated
    const allowedFields = ["name", "email", "phone", "idScan"];
    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updates[field] = req.body[field];
    });

    // Update user
    const user = await User.findByIdAndUpdate(id, updates, { new: true }).select("-password");

    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json({ message: "User updated successfully", user });
  } catch (err) {
    console.error("Edit user error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

router.delete("/delete/:id", adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params

    const user = await User.findById(id)

    if (!user)
      return res.status(404).json({ error: "User not found" })

    await User.findByIdAndDelete(id)

    res.status(201).json({ message: "User deleted sucessfully" })

  } catch (err) {
    console.error("Delete user error:", err.message);
    res.status(500).json({ error: "Server error" });
  }
})

const multer = require("multer");
const path = require("path");

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${req.user.id}-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// ID Scan Upload
router.patch(
  "/idscan",
  authMiddleware,
  upload.single("idScan"), // must match frontend field name
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const user = await User.findByIdAndUpdate(
        req.user.id,
        { idScan: req.file.filename }, // save filename to DB
        { new: true }
      ).select("-password");

      res.status(200).json({ message: "ID scan uploaded successfully", user });
    } catch (err) {
      console.error("ID scan upload error:", err.message);
      res.status(500).json({ error: "Server error" });
    }
  }
);


router.post("/complaints", async (req, res) => {
  try {
    const { message } = req.body

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ error: "User not found!!" })

    user.complaints.push({ message })

    await user.save()
  } catch (err) {
    return res.status(500).json({ error: "Server error!!" })
  }
})

module.exports = router;
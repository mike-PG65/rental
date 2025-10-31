const express = require('express')

const router = express.Router()
const Message = require("../models/Message");
const User = require("../models/User");
const adminMiddleware = require('../middleware/admin')
const authMiddleware = require('../middleware/auth')

// Send message to one tenant or broadcast
router.post('/send',  authMiddleware, adminMiddleware , async (req, res) => {
  try {
    
    const { recipientId, subject, body, isBroadcast } = req.body;

    if (isBroadcast) {
      // Send to all tenants
      const tenants = await User.find({ role: "tenant" }).select("_id");
      if (tenants.length === 0) {
        return res.status(400).json({ message: "No tenants found" });
      }

      const message = await Message.create({
        senderId: req.user._id,
        subject,
        body,
        isBroadcast: true,
        recipients: tenants.map((t) => t._id),
      });

      return res.status(201).json({ message: "Broadcast sent to all tenants", data: message });
    } else {
      // Send to single tenant
      if (!recipientId)
        return res.status(400).json({ message: "Recipient ID required" });

      const message = await Message.create({
        senderId: req.user._id,
        recipientId,
        subject,
        body,
        isBroadcast: false,
      });

      return res.status(201).json({ message: "Message sent successfully", data: message });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to send message" });
  }
});

// Fetch messages for a tenant
router.get('/my', authMiddleware, async(req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { recipientId: req.user._id },
        { recipients: req.user._id },
        { isBroadcast: true },
      ],
    })
      .populate("senderId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

// Fetch all messages (Admin)
router.get('/all', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("senderId", "name email")
      .populate("recipientId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch all messages" });
  }
});

module.exports = router;

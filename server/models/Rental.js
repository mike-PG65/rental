const mongoose = require("mongoose")


const rentalSchema = new mongoose.Schema({
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  houseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "House",
    required: true
  },

  startDate: {
    type: Date,
    required: true
  },

  endDate: {
    type: Date
  },

  amount: {
    type: Number,
    required: true
  },

  nextPaymentDate: {
    type: Date,
    required: true
  },

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "late"],
    default: "pending"
  }, 

  rentalStatus: {
    type: String,
    enum: ["active", "ended"],
    default: "active"
  }
});


module.exports = mongoose.model("Rental", rentalSchema)
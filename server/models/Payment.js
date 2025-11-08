const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rentalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Rental",
      required: true,
    },
    amount: { type: Number, required: true },
    balance: { type: Number, required: true, default: 0 },
    method: { type: String, enum: ["cash", "mpesa", "bank_transfer", "card"], required: true },
    transactionId: String,
    month: { type: String, required: true }, // New field
    status: { type: String, enum: ["pending", "successful", "failed"], default: "pending" },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    receiptUrl: String,
    paymentDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);

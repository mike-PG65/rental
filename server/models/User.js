const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        required: true,
        type: String
    },

    email: {
        required: true,
        type: String
    },

    phone: {
        type: String,
        required: true
    },

    password: String,

    role: {
        type: String,
        enum: ["tenant", "landlord"],
        default: "tenant"
    },

    idScan: {
        type: String
    },

    complaints: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Complaint"
        }
    ]
});

module.exports = mongoose.model("User", userSchema)
const mongoose = require("mongoose")

const houseSchema = new mongoose.Schema({
    houseNo: {
        required: true,
        type: String
    },
    
    price: {
        type: Number,
        required:true
    },

    availability: {
        type: String,
        enum: ["rented", "available"],
        default: "available"
    }
})

module.exports = mongoose.model("House", houseSchema) 
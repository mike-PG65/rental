const mongoose = require("mongoose")

const connDb = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL)

        console.log("DB Connection is sucessfull")
    } catch (error) {

        console.error("❌ MongoDB connection error:", error.message);
        process.exit(1);
        
    }
}

module.exports =connDb 
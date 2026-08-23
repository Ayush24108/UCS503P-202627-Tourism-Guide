const mongoose = require("mongoose");
require("dotenv").config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.DB_CONNECTION_STRING);
        console.log("MongoDB connected Successfully");
    }catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

module.exports = connectDB;
const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://tanishbansal0624_db_user:iCmOBnIwnOjuq1cb@cluster0.zqjdbxq.mongodb.net/TouristGuise");
        console.log("MongoDB connected Successfully");
    }catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

module.exports = connectDB;
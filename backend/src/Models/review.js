const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        tourist: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        guide: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            required: true
        },

        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },

        comment: {
            type: String,
            required: true,
            trim: true,
            minlength: 5,
            maxlength: 500
        }
    },
    {
        timestamps: true
    }
);

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
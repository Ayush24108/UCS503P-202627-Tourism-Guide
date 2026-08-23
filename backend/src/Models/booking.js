const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
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

        historicalPlace: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "HistoricalPlace",
            required: true
        },

        bookingDate: {
            type: Date,
            required: true
        },

        startTime: {
            type: String,
            required: true
        },

        endTime: {
            type: String,
            required: true
        },

        message: {
            type: String,
            maxlength: 500,
            trim: true
        },

        status: {
            type: String,
            enum: [
                "pending",
                "accepted",
                "rejected",
                "cancelled",
                "completed"
            ],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

const Booking = mongoose.model("Booking", bookingSchema);

module.exports = Booking;
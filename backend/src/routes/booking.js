const express = require("express");

const Booking = require("../Models/booking");
const User = require("../models/user");
const HistoricalPlace = require("../Models/historicalPlaces");

const { userAuth } = require("../middleware/auth");

const bookingRouter = express.Router();


// ================= CREATE BOOKING =================

bookingRouter.post("/bookings", userAuth, async (req, res) => {
    try {
        const { guideId, historicalPlaceId, bookingDate, message } = req.body;

        // Logged-in user
        const tourist = req.user;

        // Check if the logged-in user is a tourist
        if (tourist.role !== "tourist") {
            return res.status(403).send("Only tourists can book a guide");
        }

        // Check if guide exists
        const guide = await User.findOne({
            _id: guideId,
            role: "guide"
        });

        if (!guide) {
            return res.status(404).send("Guide not found");
        }

        // Check if historical place exists
        const historicalPlace = await HistoricalPlace.findById(
            historicalPlaceId
        );

        if (!historicalPlace) {
            return res.status(404).send("Historical place not found");
        }

        // Create booking
        const booking = new Booking({
            tourist: tourist._id,
            guide: guideId,
            historicalPlace: historicalPlaceId,
            bookingDate,
            message
        });

        await booking.save();

        res.status(201).send({
            message: "Guide booked successfully",
            data: booking
        });

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= GET MY BOOKINGS =================

bookingRouter.get("/bookings", userAuth, async (req, res) => {
    try {
        const user = req.user;

        let bookings;

        // If logged-in user is tourist
        if (user.role === "tourist") {

            bookings = await Booking.find({
                tourist: user._id
            })
                .populate("guide", "firstName lastName emailId country languages")
                .populate("historicalPlace", "name location");

        }

        // If logged-in user is guide
        else if (user.role === "guide") {

            bookings = await Booking.find({
                guide: user._id
            })
                .populate("tourist", "firstName lastName emailId country")
                .populate("historicalPlace", "name location");

        }

        else {
            return res.status(403).send("Invalid user role");
        }

        res.send(bookings);

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= UPDATE BOOKING STATUS =================

bookingRouter.patch(
    "/bookings/:bookingId/status",
    userAuth,
    async (req, res) => {
        try {
            const { bookingId } = req.params;
            const { status } = req.body;

            // Only allow these statuses
            const allowedStatus = [
                "pending",
                "accepted",
                "rejected",
                "cancelled",
                "completed"
            ];

            if (!allowedStatus.includes(status)) {
                return res.status(400).send("Invalid booking status");
            }

            const booking = await Booking.findById(bookingId);

            if (!booking) {
                return res.status(404).send("Booking not found");
            }

            /*
                Guide can accept or reject booking.
                Tourist can cancel booking.
            */

            if (
                req.user.role === "guide" &&
                booking.guide.toString() === req.user._id.toString()
            ) {
                if (status !== "accepted" && status !== "rejected") {
                    return res
                        .status(403)
                        .send("Guide can only accept or reject a booking");
                }
            }

            else if (
                req.user.role === "tourist" &&
                booking.tourist.toString() === req.user._id.toString()
            ) {
                if (status !== "cancelled") {
                    return res
                        .status(403)
                        .send("Tourist can only cancel a booking");
                }
            }

            else {
                return res.status(403).send("You cannot update this booking");
            }

            booking.status = status;

            await booking.save();

            res.send({
                message: "Booking status updated successfully",
                data: booking
            });

        } catch (err) {
            res.status(400).send("Error: " + err.message);
        }
    }
);


module.exports = bookingRouter;
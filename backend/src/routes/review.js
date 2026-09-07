const express = require("express");

const Review = require("../Models/review");
const Booking = require("../Models/booking");

const { userAuth } = require("../middleware/auth");

const reviewRouter = express.Router();


// ================= ADD REVIEW =================

reviewRouter.post("/reviews", userAuth, async (req, res) => {
    try {
        const { bookingId, rating, comment } = req.body;

        // Only tourists can give reviews
        if (req.user.role !== "tourist") {
            return res.status(403).send("Only tourists can give reviews");
        }

        // Find the booking
        const booking = await Booking.findById(bookingId);

        if (!booking) {
            return res.status(404).send("Booking not found");
        }

        // Check if this booking belongs to the logged-in tourist
        if (
            booking.tourist.toString() !== req.user._id.toString()
        ) {
            return res.status(403).send(
                "You can only review your own booking"
            );
        }

        // Review should be given after booking is completed
        if (booking.status !== "completed") {
            return res.status(400).send(
                "You can review the guide only after the booking is completed"
            );
        }

        // Check rating
        if (rating < 1 || rating > 5) {
            return res.status(400).send(
                "Rating must be between 1 and 5"
            );
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            booking: bookingId
        });

        if (existingReview) {
            return res.status(400).send(
                "You have already reviewed this booking"
            );
        }

        // Create review
        const review = new Review({
            tourist: req.user._id,
            guide: booking.guide,
            booking: bookingId,
            rating,
            comment
        });

        await review.save();

        res.status(201).send({
            message: "Review added successfully",
            data: review
        });

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= GET REVIEWS OF A GUIDE =================

reviewRouter.get("/reviews/guide/:guideId", async (req, res) => {
    try {
        const { guideId } = req.params;

        const reviews = await Review.find({
            guide: guideId
        })
            .populate("tourist", "firstName lastName")
            .populate("guide", "firstName lastName");

        res.send(reviews);

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= DELETE MY REVIEW =================

reviewRouter.delete("/reviews/:reviewId", userAuth, async (req, res) => {
    try {
        const { reviewId } = req.params;

        const review = await Review.findById(reviewId);

        if (!review) {
            return res.status(404).send("Review not found");
        }

        // Only the tourist who created the review can delete it
        if (
            review.tourist.toString() !== req.user._id.toString()
        ) {
            return res.status(403).send(
                "You can only delete your own review"
            );
        }

        await Review.findByIdAndDelete(reviewId);

        res.send("Review deleted successfully");

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


module.exports = reviewRouter;
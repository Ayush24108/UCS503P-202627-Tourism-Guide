const express = require("express");
const { userAuth } = require("../middleware/auth");
const HistoricalPlace = require("../Models/historicalPlaces");

const placeRouter = express.Router();


// ================= GET ALL HISTORICAL PLACES =================

placeRouter.get("/places", async (req, res) => {
    try {
        const places = await HistoricalPlace.find({});

        res.send(places);

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= GET HISTORICAL PLACE BY ID =================

placeRouter.get("/places/:id", async (req, res) => {
    try {
        const placeId = req.params.id;

        const place = await HistoricalPlace.findById(placeId);

        if (!place) {
            return res.status(404).send("Historical place not found");
        }

        res.send(place);

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= ADD HISTORICAL PLACE =================

placeRouter.post("/places", userAuth ,async (req, res) => {
    try {
        if (req.user.role !== "admin") {
            return res.status(403).send("Access denied");
        }
        const historicalPlace = new HistoricalPlace(req.body);

        await historicalPlace.save();

        res.status(201).send({
            message: "Historical place added successfully",
            data: historicalPlace
        });

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= UPDATE HISTORICAL PLACE =================

placeRouter.patch("/places/:id", userAuth, async (req, res) => {
    try {
        const placeId = req.params.id;

        const updatedPlace = await HistoricalPlace.findByIdAndUpdate(
            placeId,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedPlace) {
            return res.status(404).send("Historical place not found");
        }

        res.send({
            message: "Historical place updated successfully",
            data: updatedPlace
        });

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= DELETE HISTORICAL PLACE =================

placeRouter.delete("/places/:id", async (req, res) => {
    try {
        const placeId = req.params.id;

        const deletedPlace = await HistoricalPlace.findByIdAndDelete(
            placeId
        );

        if (!deletedPlace) {
            return res.status(404).send("Historical place not found");
        }

        res.send("Historical place deleted successfully");

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


module.exports = placeRouter;
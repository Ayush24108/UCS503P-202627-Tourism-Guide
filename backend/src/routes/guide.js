const express = require("express");

const User = require("../models/user");

const guideRouter = express.Router();


// ================= GET ALL GUIDES =================

guideRouter.get("/guides", async (req, res) => {
    try {
        const guides = await User.find(
            { role: "guide" },
            { password: 0 }
        );

        res.send(guides);

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


// ================= GET GUIDE BY ID =================

guideRouter.get("/guides/:id", async (req, res) => {
    try {
        const guideId = req.params.id;

        const guide = await User.findOne(
            {
                _id: guideId,
                role: "guide"
            },
            {
                password: 0
            }
        );

        if (!guide) {
            return res.status(404).send("Guide not found");
        }

        res.send(guide);

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


module.exports = guideRouter;
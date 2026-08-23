const express = require("express");
const bcrypt = require("bcrypt");
const User = require("../Models/user");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        // signup logic here
    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

module.exports = authRouter;
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            emailId,
            password,
            role,
            country,
            languages
        } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ emailId });

        if (existingUser) {
            throw new Error("User already exists");
        }

        // Encrypt password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: passwordHash,
            role,
            country,
            languages
        });

        // Save user in database
        await user.save();

        res.status(201).send("User added successfully");

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        // Find user using email
        const user = await User.findOne({ emailId });

        if (!user) {
            throw new Error("Invalid credentials");
        }

        // Compare password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            throw new Error("Invalid credentials");
        }

        // Create JWT token
        const token = jwt.sign({ _id: user._id },process.env.JWT_SECRET,{ expiresIn: "7d" });

        // Send token in cookie
        res.cookie("token", token);

        res.send({
            message: "Login successful",
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                emailId: user.emailId,
                role: user.role
            }
        });

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});

authRouter.post("/logout", async (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now())
        });

        res.send("Logged out successfully");

    } catch (err) {
        res.status(400).send("Error: " + err.message);
    }
});


module.exports = authRouter;
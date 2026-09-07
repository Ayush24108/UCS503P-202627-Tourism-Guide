const jwt = require("jsonwebtoken");

const User = require("../models/user");

const userAuth = async (req, res, next) => {
    try {
        // Read token from cookie
        const { token } = req.cookies;

        if (!token) {
            throw new Error("Please login first");
        }

        // Verify JWT token
        const decodedMessage = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const { _id } = decodedMessage;

        // Find user from database
        const user = await User.findById(_id);

        if (!user) {
            throw new Error("User not found");
        }

        // Attach user to request
        req.user = user;

        // Move to next route
        next();

    } catch (err) {
        res.status(401).send("Error: " + err.message);
    }
};

module.exports = {
    userAuth
};
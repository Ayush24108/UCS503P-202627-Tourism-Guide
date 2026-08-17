const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema(
    {
        firstName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 30,
            trim: true
        },

        lastName: {
            type: String,
            required: true,
            minlength: 2,
            maxlength: 30,
            trim: true
        },

        emailId: {
            type: String,
            lowercase: true,
            required: true,
            unique: true,
            trim: true,
            validate(value) {
                if (!validator.isEmail(value)) {
                    throw new Error("Invalid email");
                }
            }
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
            validate(value) {
                if (!validator.isStrongPassword(value)) {
                    throw new Error("Password is not strong enough");
                }
            }
        },

        profilePhoto: {
            type: String,
            default: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Invalid profile photo URL");
                }
            }
        },

        role: {
            type: String,
            enum: ["tourist", "guide", "admin"],
            default: "tourist"
        },

        country: {
            type: String,
            trim: true,
            maxlength: 50
        },

        languages: {
            type: [String],
            default: ["English"],
            validate(value) {
                if (value.length > 10) {
                    throw new Error("Maximum 10 languages are allowed");
                }
            }
        },

        bio: {
            type: String,
            maxlength: 500,
            trim: true
        },

        guideProfile: {
            experience: {
                type: Number,
                min: 0
            },

            placesCovered: {
                type: [mongoose.Schema.Types.ObjectId],
                ref: "HistoricalPlace",
                default: []
            },

            availability: {
                type: Boolean,
                default: true
            }
        }
    },
    {
        timestamps: true
    }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
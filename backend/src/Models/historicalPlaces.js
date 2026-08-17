const mongoose = require("mongoose");

const historicalPlaceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        description: {
            type: String,
            required: true,
            minlength: 20,
            maxlength: 1000,
            trim: true
        },

        history: {
            type: String,
            required: true,
            minlength: 50,
            maxlength: 5000,
            trim: true
        },

        location: {
            address: {
                type: String,
                required: true,
                trim: true
            },

            city: {
                type: String,
                required: true,
                trim: true
            },

            state: {
                type: String,
                trim: true
            },

            country: {
                type: String,
                required: true,
                trim: true
            }
        },

        images: {
            type: [String],
            default: []
        },

        architecture: {
            type: String,
            maxlength: 2000,
            trim: true
        },

        culturalImportance: {
            type: String,
            maxlength: 2000,
            trim: true
        },

        importantEvents: {
            type: [String],
            default: []
        },

        interestingFacts: {
            type: [String],
            default: []
        },

        category: {
            type: String,
            enum: [
                "monument",
                "fort",
                "temple",
                "palace",
                "museum",
                "archaeological-site",
                "other"
            ],
            default: "other"
        },

        establishedYear: {
            type: Number
        },

        guideAvailable: {
            type: Boolean,
            default: true
        }
    },
    {
        timestamps: true
    }
);

const HistoricalPlace = mongoose.model(
    "HistoricalPlace",
    historicalPlaceSchema
);

module.exports = HistoricalPlace;
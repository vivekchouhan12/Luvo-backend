const mongoose = require("mongoose");

const placeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // slug removed; use _id as placeid

    category: {
      type: String,
      required: true,
      enum: ["cafe", "tourist", "event", "mall"],
      index: true,
    },

    description: {
      type: String,
      default: "",
    },

    images: [
      {
        type: String,
      },
    ],

    address: {
      type: String,
      required: true,
    },

    location: {
      lat: Number,
      lng: Number,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    tags: [
      {
        type: String,
      },
    ],

    isTrending: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", placeSchema);

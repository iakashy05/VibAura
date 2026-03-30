const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
    },
    passwordHash: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ["user", "admin"],
        default: "user",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    resetPasswordToken: {
        type: String,
        default: null,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
    },
    resetOTP: {
        type: String,
        default: null,
    },
    resetOTPExpires: {
        type: Date,
        default: null,
    },
    resetOTPAttempts: {
        type: Number,
        default: 0,
    },
    libraryPlaylists: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Playlist",
        },
    ],
    likedSongs: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Song",
        },
    ],
    recentlyPlayed: [
        {
            song: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Song",
            },
            playedAt: {
                type: Date,
                default: Date.now,
            },
        },
    ],
});

module.exports = mongoose.model("User", userSchema);

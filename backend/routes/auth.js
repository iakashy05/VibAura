const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../../models/user");
const { authenticateToken } = require("../middleware/authMiddleware");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const rateLimit = require("express-rate-limit");

// Rate limiter for Auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 5, // Limit each IP to 5 requests per windowMs
    message: { message: "Too many requests, please try again after 15 minutes" },
    standardHeaders: true,
    legacyHeaders: false,
});

// Signup
router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Always create as "user" via this public endpoint
        const newUser = new User({
            email,
            passwordHash,
            role: "user",
        });

        await newUser.save();

        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Signup error:", err.message, err.stack);
        res.status(500).json({ message: "Internal server error", error: err.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Generate JWT
        const token = jwt.sign(
            { userId: user._id, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "24h" } // Token expiry
        );

        res.json({ token, userId: user._id, role: user.role });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Current User (Protected)
router.get("/me", authenticateToken, async (req, res) => {
    try {
        // req.user is populated by authenticateToken
        // Retrieve fresh data from DB if needed, or just return from token payload
        // To be safe and get latest role, let's fetch from DB (optional, but good practice)
        const user = await User.findById(req.user.userId).select("-passwordHash");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        console.error("Me error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Forgot Password (OTP Generation)
router.post("/forgot-password", authLimiter, async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "No account found with this email address." });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Hash OTP and set expiry (10 minutes)
        const salt = await bcrypt.genSalt(10);
        user.resetOTP = await bcrypt.hash(otp, salt);
        user.resetOTPExpires = Date.now() + 10 * 60 * 1000;
        user.resetOTPAttempts = 0; // Reset attempts

        await user.save();

        const message = `Your password reset OTP is: ${otp}\n\nThis code is valid for 10 minutes. Please do not share this code with anyone.`;

        try {
            await sendEmail({
                email: user.email,
                subject: "Password Reset OTP",
                message,
            });

            res.status(200).json({ message: "If that email exists, an OTP has been sent." });
        } catch (err) {
            user.resetOTP = undefined;
            user.resetOTPExpires = undefined;
            await user.save();
            console.error("Email send error:", err);
            return res.status(500).json({ message: "Email could not be sent" });
        }
    } catch (err) {
        console.error("Forgot Password Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Verify OTP
router.post("/verify-otp", authLimiter, async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Email and OTP are required" });
        }

        const user = await User.findOne({ 
            email,
            resetOTPExpires: { $gt: Date.now() } 
        });

        if (!user || !user.resetOTP) {
            return res.status(400).json({ message: "OTP expired or not requested" });
        }

        // Check attempts
        if (user.resetOTPAttempts >= 5) {
            user.resetOTP = undefined;
            user.resetOTPExpires = undefined;
            await user.save();
            return res.status(400).json({ message: "Too many failed attempts. Please request a new OTP." });
        }

        const isValid = await bcrypt.compare(otp, user.resetOTP);

        if (!isValid) {
            user.resetOTPAttempts += 1;
            await user.save();
            return res.status(400).json({ message: "Invalid OTP" });
        }

        // OTP is valid!
        // Generate a temporary reset token for the final reset step
        const resetToken = crypto.randomBytes(20).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetOTP = undefined; // Clear OTP
        user.resetOTPExpires = undefined;
        user.resetOTPAttempts = 0;
        await user.save();

        res.status(200).json({ 
            message: "OTP verified", 
            resetToken // Send to FE to be used in next step
        });
    } catch (err) {
        console.error("Verify OTP Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Reset Password
router.post("/reset-password", async (req, res) => {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: "Token and new password are required" });
        }

        // Hash token to compare with DB
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            // Secondary token should also be short-lived (use existing expire or same 15 min logic)
            // For now we keep it simple
        });


        if (!user) {
            return res.status(400).json({ message: "Invalid or expired token" });
        }

        // Check if new password is same as old password
        const isSamePassword = await bcrypt.compare(newPassword, user.passwordHash);
        if (isSamePassword) {
            return res.status(400).json({ message: "New password cannot be the same as the old password" });
        }

        // Set new password
        const salt = await bcrypt.genSalt(10);
        user.passwordHash = await bcrypt.hash(newPassword, salt);

        // Clear reset fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (err) {
        console.error("Reset Password Error:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;

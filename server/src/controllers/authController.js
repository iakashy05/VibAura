import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { sendEmail } from '../utils/emailService.js';

class AuthController {
  /**
   * Register a new user.
   */
  signup = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = await User.create({ name, email, password });

    res.status(201).json({
      message: 'User registered successfully',
      userId: user._id
    });
  });

  /**
   * Authenticate user and return token.
   */
  login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = this._generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });

  /**
   * Get current user info from token.
   */
  getMe = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  });

  /**
   * Request password reset OTP.
   */
  forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email });
    if (!user) {
      // For security, don't reveal if user exists, but here we'll follow previous pattern
      return res.status(404).json({ message: 'No user found with this email' });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 8); // Reduced to 8 rounds for faster performance

    user.resetOTP = hashedOTP;
    user.resetOTPExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetOTPAttempts = 0;
    await user.save();

    // Send Real Email
    const emailSent = await sendEmail({
      to: email,
      subject: 'VibAura — Password Reset Code',
      text: `Your password reset code is: ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 20px; background: #fafafa;">
          <h2 style="color: #6366f1; text-align: center;">VibAura</h2>
          <p style="font-size: 16px; color: #333;">You requested a password reset. Use the following code to verify your identity:</p>
          <div style="background: #fff; border: 2px dashed #6366f1; padding: 20px; text-align: center; border-radius: 15px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: 900; letter-spacing: 5px; color: #6366f1;">${otp}</span>
          </div>
          <p style="font-size: 14px; color: #666; text-align: center;">This code will expire in 10 minutes. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    // SIMULATION: Log OTP to console (especially if email fails)
    console.log(`[VibAura AUTH] ${emailSent ? 'Email sent' : 'Email FAILED'} for ${email}. OTP: ${otp}`);

    res.json({ message: emailSent ? 'OTP sent to your email.' : 'OTP generated (Check terminal).' });
  });

  /**
   * Verify password reset OTP.
   */
  verifyOTP = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP are required' });

    const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpires +resetOTPAttempts');
    if (!user || !user.resetOTP) {
      return res.status(400).json({ message: 'Invalid request or OTP expired' });
    }

    if (Date.now() > user.resetOTPExpires) {
      user.resetOTP = undefined;
      user.resetOTPExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'OTP has expired' });
    }

    if (user.resetOTPAttempts >= 5) {
      user.resetOTP = undefined;
      user.resetOTPExpires = undefined;
      await user.save();
      return res.status(400).json({ message: 'Too many failed attempts. Please request a new OTP.' });
    }

    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch) {
      user.resetOTPAttempts += 1;
      await user.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    res.json({ message: 'OTP verified successfully.' });
  });

  /**
   * Reset password using verified email.
   */
  resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const user = await User.findOne({ email }).select('+resetOTP +resetOTPExpires');
    if (!user || !user.resetOTP) {
      return res.status(400).json({ message: 'Invalid session' });
    }

    // Verify OTP again for final security check
    const isMatch = await bcrypt.compare(otp, user.resetOTP);
    if (!isMatch || Date.now() > user.resetOTPExpires) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Update password
    user.password = newPassword;
    user.resetOTP = undefined;
    user.resetOTPExpires = undefined;
    user.resetOTPAttempts = 0;
    await user.save();

    res.json({ message: 'Password reset successful. You can now login.' });
  });

  /**
   * Helper to generate JWT.
   */
  _generateToken(user) {
    return jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }
}

export default new AuthController();

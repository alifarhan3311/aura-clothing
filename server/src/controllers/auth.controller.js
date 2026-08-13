import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import redis from "../lib/redis.js";
import { sendMail } from "../lib/mailer.js";
import { deleteFile, buildPublicPath } from "../middlewares/upload.middleware.js";

// ── Helpers ──────────────────────────────────────────────────────────────────

const OTP_TTL = parseInt(process.env.OTP_EXPIRES_MINUTES || "10") * 60; // seconds

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const otpEmailHtml = (otp, purpose = "verification") => `
  <div style="font-family:sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#333">Fade Find – OTP ${purpose}</h2>
    <p>Your one-time password is:</p>
    <h1 style="letter-spacing:8px;color:#e44">${otp}</h1>
    <p>This OTP expires in <strong>${process.env.OTP_EXPIRES_MINUTES || 10} minutes</strong>.</p>
    <p style="color:#999;font-size:12px">If you did not request this, please ignore this email.</p>
  </div>`;

// ── Register ─────────────────────────────────────────────────────────────────

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashed });

    // Generate & store OTP
    const otp = generateOTP();
    await redis.set(`otp:verify:${email}`, otp, "EX", OTP_TTL);

    await sendMail(
      email,
      "Verify your Fade Find account",
      otpEmailHtml(otp, "Verification")
    );

    return res.status(201).json({
      success: true,
      message: "Registered successfully. Check your email for the OTP.",
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Verify OTP ────────────────────────────────────────────────────────────────

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const stored = await redis.get(`otp:verify:${email}`);
    if (!stored) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or not found" });
    }

    if (stored !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await redis.del(`otp:verify:${email}`);

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true }
    ).select("-password");

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const token = signToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Resend Verification OTP ───────────────────────────────────────────────────

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = generateOTP();
    await redis.set(`otp:verify:${email}`, otp, "EX", OTP_TTL);

    await sendMail(
      email,
      "Resend – Verify your Fade Find account",
      otpEmailHtml(otp, "Verification")
    );

    return res.status(200).json({
      success: true,
      message: "OTP resent. Check your email.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Login ─────────────────────────────────────────────────────────────────────

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
      });
    }

    const token = signToken(user._id);
    const { password: _, ...userData } = user.toObject();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Forgot Password ───────────────────────────────────────────────────────────

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({
        success: true,
        message: "If that email exists, an OTP has been sent.",
      });
    }

    const otp = generateOTP();
    await redis.set(`otp:reset:${email}`, otp, "EX", OTP_TTL);

    await sendMail(
      email,
      "Fade Find – Reset your password",
      otpEmailHtml(otp, "Password Reset")
    );

    return res.status(200).json({
      success: true,
      message: "If that email exists, an OTP has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Resend Forgot-Password OTP ────────────────────────────────────────────────

export const resendForgotPasswordOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a new OTP has been sent.",
      });
    }

    const otp = generateOTP();
    await redis.set(`otp:reset:${email}`, otp, "EX", OTP_TTL);

    await sendMail(
      email,
      "Fade Find – Resend: Reset your password",
      otpEmailHtml(otp, "Password Reset")
    );

    return res.status(200).json({
      success: true,
      message: "If that email exists, a new OTP has been sent.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update (Reset) Password ───────────────────────────────────────────────────

export const updatePassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Email, OTP and new password are required" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters" });
    }

    const stored = await redis.get(`otp:reset:${email}`);
    if (!stored) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or not found" });
    }

    if (stored !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    await redis.del(`otp:reset:${email}`);

    const hashed = await bcrypt.hash(newPassword, 12);
    await User.findOneAndUpdate({ email }, { password: hashed });

    return res.status(200).json({
      success: true,
      message: "Password updated successfully. You can now log in.",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update Profile (authenticated) ───────────────────────────────────────────

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    // Handle avatar upload
    if (req.file) {
      // Delete old avatar if it exists
      if (req.user.avatar) {
        deleteFile(req.user.avatar);
      }
      updateData.avatar = buildPublicPath(req.file);
    }

    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Me (authenticated) ────────────────────────────────────────────────────

export const getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

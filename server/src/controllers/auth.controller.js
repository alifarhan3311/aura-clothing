import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
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
    const { firstName, lastName, name, email, password } = req.body;

    const resolvedFirstName = (firstName || name?.split(" ")[0] || "").trim();
    const resolvedLastName = (lastName || name?.split(" ").slice(1).join(" ") || "").trim();
    const fullName = (name || `${resolvedFirstName} ${resolvedLastName}`).trim();

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "First name, last name, email and password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });

    if (existing) {
      if (existing.isVerified) {
        return res
          .status(409)
          .json({ success: false, message: "Email already registered and verified. Please sign in." });
      }

      // Existing unverified user trying to re-register: update credentials & send new OTP
      const hashed = await bcrypt.hash(password, 12);
      existing.name = fullName;
      existing.firstName = resolvedFirstName;
      existing.lastName = resolvedLastName;
      existing.password = hashed;
      await existing.save();

      const otp = generateOTP();
      await redis.set(`otp:verify:${cleanEmail}`, otp, "EX", OTP_TTL);

      await sendMail(
        cleanEmail,
        "Verify your Fade Find account",
        otpEmailHtml(otp, "Verification")
      );

      return res.status(200).json({
        success: true,
        message: "Account was pending verification. A fresh OTP has been sent to your email.",
        userId: existing._id,
      });
    }

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      firstName: resolvedFirstName,
      lastName: resolvedLastName,
      name: fullName,
      email: cleanEmail,
      password: hashed,
    });

    // Generate & store OTP
    const otp = generateOTP();
    await redis.set(`otp:verify:${cleanEmail}`, otp, "EX", OTP_TTL);

    await sendMail(
      cleanEmail,
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

    const cleanEmail = email.trim().toLowerCase();
    const stored = await redis.get(`otp:verify:${cleanEmail}`);
    if (!stored) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or not found. Please request a new one." });
    }

    if (stored !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    await redis.del(`otp:verify:${cleanEmail}`);

    const user = await User.findOneAndUpdate(
      { email: cleanEmail },
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

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
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
    await redis.set(`otp:verify:${cleanEmail}`, otp, "EX", OTP_TTL);

    await sendMail(
      cleanEmail,
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

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
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
      // Generate a fresh OTP and store in Redis
      const otp = generateOTP();
      await redis.set(`otp:verify:${cleanEmail}`, otp, "EX", OTP_TTL);

      await sendMail(
        cleanEmail,
        "Verify your Fade Find account",
        otpEmailHtml(otp, "Verification")
      );

      return res.status(403).json({
        success: false,
        needsVerification: true,
        email: cleanEmail,
        message: "Your account is not verified yet. A fresh 6-digit OTP has been sent to your email.",
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

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      // Don't reveal whether the email exists
      return res.status(200).json({
        success: true,
        message: "If that email exists, an OTP has been sent.",
      });
    }

    const otp = generateOTP();
    await redis.set(`otp:reset:${cleanEmail}`, otp, "EX", OTP_TTL);

    await sendMail(
      cleanEmail,
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

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: "If that email exists, a new OTP has been sent.",
      });
    }

    const otp = generateOTP();
    await redis.set(`otp:reset:${cleanEmail}`, otp, "EX", OTP_TTL);

    await sendMail(
      cleanEmail,
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

// ── Verify Forgot-Password OTP ───────────────────────────────────────────────

export const verifyForgotPasswordOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Email and OTP are required" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = await redis.get(`otp:reset:${cleanEmail}`);

    if (!stored) {
      return res
        .status(400)
        .json({ success: false, message: "OTP expired or not found. Please request a new one." });
    }

    if (stored !== otp.trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP code" });
    }

    // OTP is valid! Delete OTP from Redis
    await redis.del(`otp:reset:${cleanEmail}`);

    // Generate secure temporary resetToken and store in Redis for 15 minutes
    const resetToken = crypto.randomBytes(32).toString("hex");
    const RESET_TOKEN_TTL = 15 * 60; // 15 minutes
    await redis.set(`reset:token:${cleanEmail}`, resetToken, "EX", RESET_TOKEN_TTL);

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now set your new password.",
      resetToken,
      email: cleanEmail,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update (Reset) Password ───────────────────────────────────────────────────

export const updatePassword = async (req, res) => {
  try {
    const { email, resetToken, otp, newPassword } = req.body;

    if (!email || !newPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Email and new password are required" });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ success: false, message: "Password must be at least 6 characters" });
    }

    // If resetToken is provided (preferred secure flow)
    if (resetToken) {
      const storedToken = await redis.get(`reset:token:${cleanEmail}`);
      if (!storedToken || storedToken !== resetToken) {
        return res.status(400).json({
          success: false,
          message: "Password reset session expired or invalid. Please verify OTP again.",
        });
      }
      // Invalidate the reset token
      await redis.del(`reset:token:${cleanEmail}`);
    } else if (otp) {
      // Legacy fallback with direct OTP
      const stored = await redis.get(`otp:reset:${cleanEmail}`);
      if (!stored || stored !== otp.trim()) {
        return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
      }
      await redis.del(`otp:reset:${cleanEmail}`);
    } else {
      return res.status(400).json({
        success: false,
        message: "Reset token or OTP verification is required to change password.",
      });
    }

    const hashed = await bcrypt.hash(newPassword, 12);
    const updatedUser = await User.findOneAndUpdate(
      { email: cleanEmail },
      { password: hashed },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

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
    const { firstName, lastName, name, phone, address, street, city, state, zip, postalCode, country } = req.body;
    const userId = req.user._id;

    const updateData = {};

    if (firstName !== undefined) updateData.firstName = firstName.trim();
    if (lastName !== undefined) updateData.lastName = lastName.trim();

    if (firstName !== undefined || lastName !== undefined) {
      const fName = firstName !== undefined ? firstName.trim() : (req.user.firstName || req.user.name?.split(" ")[0] || "");
      const lName = lastName !== undefined ? lastName.trim() : (req.user.lastName || req.user.name?.split(" ").slice(1).join(" ") || "");
      updateData.name = `${fName} ${lName}`.trim() || req.user.name;
    } else if (name !== undefined && name.trim()) {
      updateData.name = name.trim();
      updateData.firstName = name.trim().split(" ")[0] || "";
      updateData.lastName = name.trim().split(" ").slice(1).join(" ") || "";
    }

    if (phone !== undefined) updateData.phone = phone.trim();

    // Parse and handle address object / fields
    let parsedAddress = {};
    if (address) {
      if (typeof address === "string") {
        try {
          parsedAddress = JSON.parse(address);
        } catch {
          parsedAddress = { street: address.trim() };
        }
      } else if (typeof address === "object") {
        parsedAddress = { ...address };
      }
    }

    if (street !== undefined) parsedAddress.street = street.trim();
    if (city !== undefined) parsedAddress.city = city.trim();
    if (state !== undefined) parsedAddress.state = state.trim();
    if (zip !== undefined) parsedAddress.zip = zip.trim();
    if (postalCode !== undefined) parsedAddress.postalCode = postalCode.trim();
    if (country !== undefined) parsedAddress.country = country.trim();

    if (parsedAddress.zip && !parsedAddress.postalCode) {
      parsedAddress.postalCode = parsedAddress.zip;
    } else if (parsedAddress.postalCode && !parsedAddress.zip) {
      parsedAddress.zip = parsedAddress.postalCode;
    }

    if (Object.keys(parsedAddress).length > 0) {
      const existingAddress = req.user.address ? (req.user.address.toObject ? req.user.address.toObject() : req.user.address) : {};
      updateData.address = {
        ...existingAddress,
        ...parsedAddress,
      };
    }

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

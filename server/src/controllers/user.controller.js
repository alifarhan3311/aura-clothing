import User from "../models/User.js";
import bcrypt from "bcrypt";
import { buildPublicPath, deleteFile } from "../middlewares/upload.middleware.js";

// ── Get All Users (Admin) ─────────────────────────────────────────────────────

export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, isVerified } = req.query;

    const query = {};
    if (search)
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    if (role) query.role = role;
    if (isVerified !== undefined) query.isVerified = isVerified === "true";

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query)
        .select("-password")
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 }),
      User.countDocuments(query),
    ]);

    return res.status(200).json({
      success: true,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      users,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Get Single User (Admin) ───────────────────────────────────────────────────

export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({ success: true, user });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Create User (Admin) ───────────────────────────────────────────────────────

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, address } = req.body;

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ success: false, message: "name, email, and password are required" });

    const cleanEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing)
      return res
        .status(409)
        .json({ success: false, message: "Email already registered" });

    const hashed = await bcrypt.hash(password, 12);

    let parsedAddress = address;
    if (typeof address === "string") {
      try {
        parsedAddress = JSON.parse(address);
      } catch {
        parsedAddress = { street: address };
      }
    }

    const userDataToCreate = {
      name: name.trim(),
      email: cleanEmail,
      password: hashed,
      role: role || "user",
      phone: phone ? phone.trim() : "",
      address: parsedAddress,
      isVerified: true, // admin-created users are pre-verified
    };

    if (req.file) {
      userDataToCreate.avatar = buildPublicPath(req.file);
    }

    const user = await User.create(userDataToCreate);

    const { password: _, ...userData } = user.toObject();
    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: userData,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update User (Admin) ───────────────────────────────────────────────────────

export const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, address, isVerified } = req.body;

    const existingUser = await User.findById(req.params.id);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.trim().toLowerCase();
    if (role !== undefined) updateData.role = role;
    if (phone !== undefined) updateData.phone = phone.trim();
    if (isVerified !== undefined) updateData.isVerified = isVerified === "true" || isVerified === true;

    if (address !== undefined) {
      let parsedAddress = address;
      if (typeof address === "string") {
        try {
          parsedAddress = JSON.parse(address);
        } catch {
          parsedAddress = { street: address };
        }
      }
      updateData.address = parsedAddress;
    }

    if (req.file) {
      if (existingUser.avatar) {
        deleteFile(existingUser.avatar);
      }
      updateData.avatar = buildPublicPath(req.file);
    }

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Delete User (Admin) ───────────────────────────────────────────────────────

export const deleteUser = async (req, res) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ success: false, message: "You cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ── Update User Role (Admin) ──────────────────────────────────────────────────

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Role must be 'user' or 'admin'" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select("-password");

    if (!user)
      return res.status(404).json({ success: false, message: "User not found" });

    return res.status(200).json({
      success: true,
      message: `User role updated to '${role}'`,
      user,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

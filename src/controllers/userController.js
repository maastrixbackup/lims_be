const bcrypt = require("bcrypt");
const User = require("../models/userModel");

const usersList = async (req, res) => {
  try {
    const { role_id } = req.query;
    const users = await User.usersList(role_id || null);

    return res.status(200).json({
      success: true,
      message: "User list fetched successfully",
      users: users,
    });
  } catch (err) {
    console.error("Users list Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const changePassword = async (req, res) => {
  try {
    const userId = req.user.id; //comes from authMiddleware
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (await bcrypt.compare(newPassword, user.password_hash)) {
      return res.status(400).json({
        success: false,
        message: "New password cannot be the same as the current password",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await User.updatePassword(userId, hashedPassword);

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (err) {
    console.error("Change Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    if (!name && !email) {
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (email && email !== user.email) {
      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email already exists",
        });
      }
    }

    const updatedUser = await User.updateUser(
      userId,
      name || user.name,
      email || user.email
    );
    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    console.error("Update User Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { changePassword, usersList, updateUser };

const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const UserProject = require("../models/userProjectModel");
const Role = require("../models/roleModel");
const {
  generateToken,
  generateResetToken,
  verifyToken,
} = require("../utils/jwt");
const transporter = require("../utils/mailer");

const signup = async (req, res) => {
  try {
    const { name, email, password, role_id, accessed_projects } = req.body;
    if (!name || !email || !password || !role_id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already exists",
      });
    }

    const role = await Role.findById(role_id);
    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Invalid role id",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create(name, email, hashedPassword, role_id);

    if (Array.isArray(accessed_projects) && accessed_projects.length > 0) {
      await UserProject.assignProjects(newUser.id, accessed_projects);
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const role = await Role.findById(user.role_id);
    user.role_name = role ? role.name : null;

    const token = generateToken(user);
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: user,
      token: token,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const resetToken = generateResetToken(user.id);

    await User.saveResetToken(user.id, resetToken);

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    //Send email
    await transporter.sendMail({
      from: `"Support Team" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested to reset your password. Click below link:</p>
        <a href="${resetLink}" target="_blank">${resetLink}</a>
        <p>This link will expire in 15 minutes.</p>
      `,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset link sent to email",
    });
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Token and new password required",
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
      if (!decoded) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired token",
        });
      }
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const storedToken = await User.getResetToken(user.id);
    if (storedToken !== token) {
      return res.status(400).json({
        success: false,
        message: "Invalid reset token",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.updatePassword(user.id, hashedPassword);
    await User.clearResetToken(user.id);

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };

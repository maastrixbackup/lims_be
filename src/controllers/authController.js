const bcrypt = require("bcrypt");
const User = require("../models/userModel");
const Role = require("../models/roleModel");
const { generateToken } = require("../utils/jwt");

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
    const newUser = await User.create(
      name,
      email,
      hashedPassword,
      role_id,
      accessed_projects ? JSON.stringify(accessed_projects) : null
      // accessed_projects || null
    );

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
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// const forgotPassword = async (req, res) => {
//   try {
//     const { email } = req.body;
//     if (!email) {
//       return res.status(400).json({ success: false, message: "Email is required" });
//     }

//     const user = await User.findByEmail(email);
//     if (!user) {
//       return res.status(404).json({ success: false, message: "User not found" });
//     }

//     // Generate reset token (valid for 15 min)
//     const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: "15m" });

//     // Store token in DB (or a reset_tokens table)
//     await User.saveResetToken(user.id, resetToken);

//     // Send email (pseudo-code, implement with nodemailer)
//     console.log(`Password reset link: https://yourapp.com/reset-password?token=${resetToken}`);

//     return res.status(200).json({
//       success: true,
//       message: "Password reset link sent to email",
//     });
//   } catch (err) {
//     console.error("Forgot Password Error:", err);
//     return res.status(500).json({ success: false, message: "Server error" });
//   }
// };

module.exports = { signup, login };

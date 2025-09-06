const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const Role = require('../models/roleModel');

const generateToken = (user) => {
    return jwt.sign(
        { id: user.id, role_id: user.role_id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );
};

const signup = async (req, res) => {
    console.log("signup pravat");
}

const login = async (req, res) => {
    try{
        const { email, password } = req.body;
        if(!email || !password) {
            return res.status(400).json({ message : "Email and password are required" });
        }
        const user = await User.findByEmail(email);
        if(!user){
            return res.status(400).json({ message : "Invalid email or password"});
        }
    } catch (error) {
        console.error("Login Error:", error);
        return res.status(500).json({ message : "Server error" });
    }

}

// exports.login = async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     if (!email || !password) {
//       return res.status(400).json({ message: "Email and password are required" });
//     }

//     const user = await User.findByEmail(email);
//     if (!user) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const isMatch = await bcrypt.compare(password, user.password_hash);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid email or password" });
//     }

//     const token = generateToken(user);
//     res.json({ message: "Login successful", token });
//   } catch (error) {
//     console.error("Login Error:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

module.exports = { signup, login };

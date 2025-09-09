const Role = require("../models/roleModel");

const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    return res.status(200).json({
      success: true,
      roles: roles,
    });
  } catch (err) {
    console.error("Fetch Roles Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getRoles };

const Village = require("../models/villageModel");
const logAction = require("../utils/logger");

const addVillage = async (req, res) => {
  const userId = req.user.id;
  const safeRequestPayload = req.body;
  const { village_name, tahasil, district, project_id } = req.body;

  try {
    if (!village_name || !tahasil || !district || !project_id) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const village = await Village.create(
      village_name,
      tahasil,
      district,
      project_id
    );

    await logAction(
      userId,
      "add village",
      "success",
      "Village added successfully",
      safeRequestPayload,
      village
    );

    return res.status(201).json({
      success: true,
      message: "Village added successfully",
      village,
    });
  } catch (err) {
    await logAction(
      userId,
      "add village",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Add Village Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const villageList = async (req, res) => {
  try {
    const { project_id, district, tahasil } = req.query;

    const villages = await Village.findAll({
      project_id,
      district,
      tahasil,
    });

    return res.status(200).json({
      success: true,
      message: "Village list fetched successfully",
      villages,
    });
  } catch (err) {
    console.error("Fetch Villages Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { addVillage, villageList };

const Khata = require("../models/khataModel");
const logAction = require("../utils/logger");

const addKhata = async (req, res) => {
  const userId = req.user.id;
  const { project_id, village_id, khata_no } = req.body;
  const safeRequestPayload = req.body;
  try {
    if (!project_id || !village_id || !khata_no) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const khata = await Khata.create(project_id, village_id, khata_no);
    await logAction(
      userId,
      "create khata",
      "success",
      "Khata created successfully",
      safeRequestPayload,
      khata
    );

    return res.status(201).json({
      success: true,
      message: "Khata created successfully",
      khata,
    });
  } catch (err) {
    await logAction(
      userId,
      "create khata",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Create Khata Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const khataList = async (req, res) => {
  try {
    const { project_id, village_id } = req.query;
    const khatas = await Khata.findAll({ project_id, village_id });
    return res.status(200).json({
      success: true,
      message: "Khata list fetched successfully",
      khatas,
    });
  } catch (err) {
    console.error("Fetch Khata Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { addKhata, khataList };

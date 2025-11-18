const Village = require("../models/villageModel");
const logAction = require("../utils/logger");

const addVillage = async (req, res) => {
  const userId = req.user.id;
  const safeRequestPayload = req.body;
  const { village_name, tahasil, district, project_id, village_code, type } =
    req.body;

  try {
    if (
      !village_name ||
      !tahasil ||
      !district ||
      !project_id ||
      !village_code ||
      !type
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const village = await Village.create(
      village_name,
      tahasil,
      district,
      project_id,
      village_code,
      type
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
    const { project_id, district, tahasil, type } = req.query;

    const villages = await Village.findAll({
      project_id,
      district,
      tahasil,
      type,
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

const updateVillage = async (req, res) => {
  const userId = req.user.id;
  const villageId = req.params.id;
  const safeRequestPayload = req.body;
  const { village_name, tahasil, district, project_id, village_code, type } =
    req.body;

  try {
    const existingVillage = await Village.findById(villageId);
    if (!existingVillage) {
      return res.status(404).json({
        success: false,
        message: "Village not found",
      });
    }

    const updatedVillage = await Village.update(
      villageId,
      village_name,
      tahasil,
      district,
      project_id,
      village_code,
      type
    );
    await logAction(
      userId,
      "update village",
      "success",
      "Village updated successfully",
      safeRequestPayload,
      updatedVillage
    );
    return res.status(200).json({
      success: true,
      message: "Village updated successfully",
      village: updatedVillage,
    });
  } catch (err) {
    await logAction(
      userId,
      "update village",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Update Village Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteVillage = async (req, res) => {
  const userId = req.user.id;
  const villageId = req.params.id;

  try {
    const existingVillage = await Village.findById(villageId);
    if (!existingVillage) {
      return res
        .status(404)
        .json({ success: false, message: "Village not found" });
    }
    await Village.delete(villageId);
    await logAction(
      userId,
      "delete village",
      "success",
      "Village deleted successfully",
      { id: villageId },
      null
    );
    return res
      .status(200)
      .json({ success: true, message: "Village deleted successfully" });
  } catch (err) {
    await logAction(
      userId,
      "delete village",
      "failure",
      err.message,
      { id: villageId },
      null
    );
    console.error("Delete Village Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { addVillage, villageList, updateVillage, deleteVillage };

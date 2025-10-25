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

const updateKhata = async (req, res) => {
  const userId = req.user.id;
  const khataId = req.params.id;
  const { project_id, village_id, khata_no } = req.body;
  const safeRequestPayload = req.body;

  try {
    const existingKhata = await Khata.findById(khataId);
    if (!existingKhata) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }
    const updatedKhata = await Khata.update(
      khataId,
      project_id,
      village_id,
      khata_no
    );
    await logAction(
      userId,
      "update khata",
      "success",
      "Khata updated successfully",
      safeRequestPayload,
      updatedKhata
    );

    return res.status(200).json({
      success: true,
      message: "Khata updated successfully",
      khata: updatedKhata,
    });
  } catch (err) {
    await logAction(
      userId,
      "update khata",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Update Khata Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const deleteKhata = async (req, res) => {
  const userId = req.user.id;
  const khataId = req.params.id;

  try {
    const existingKhata = await Khata.findById(khataId);
    if (!existingKhata) {
      return res.status(404).json({
        success: false,
        message: "Khata not found",
      });
    }
    await Khata.delete(khataId);
    await logAction(
      userId,
      "delete khata",
      "success",
      "Khata deleted successfully",
      { id: khataId },
      null
    );

    return res.status(200).json({
      success: true,
      message: "Khata deleted successfully",
    });
  } catch (err) {
    await logAction(
      userId,
      "delete khata",
      "failure",
      err.message,
      { id: khataId },
      null
    );
    console.error("Delete Khata Error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

const uploadKhataDoc = async (req, res) => {
  const userId = req.user.id;
  const safeRequestPayload = req.body;
  try {
    const { khata_id } = req.body;
    if (!khata_id) {
      return res.status(400).json({
        success: false,
        message: "Khata id is required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }
    const uploadedDocument = await Khata.uploadKhataDocument(
      khata_id,
      req.file.filename
    );

    await logAction(
      userId,
      "upload khata document",
      "success",
      "Khata uploaded successfully",
      safeRequestPayload,
      uploadedDocument
    );
    return res.status(200).json({
      success: true,
      message: "Khata document uploaded successfully",
    });
  } catch (err) {
    console.error("Upload Khata Error:", err);
    await logAction(
      userId,
      "upload khata document",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getKhataFilesByKhataId = async (req, res) => {
  try {
    const khata_id = req.params.id;
    const documents = await Khata.getFilesByKhataId(khata_id);
    res.status(200).json({
      success: true,
      message: "Khata documents fetched successfully.",
      count: documents.length,
      documents,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = {
  addKhata,
  khataList,
  updateKhata,
  deleteKhata,
  uploadKhataDoc,
  getKhataFilesByKhataId,
};

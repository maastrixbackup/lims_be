const Village = require("../models/villageModel");
const logAction = require("../utils/logger");
const ExcelJS = require("exceljs");

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
    let {
      project_id,
      district,
      tahasil,
      type,
      page = 1,
      limit = 10,
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const villages = await Village.findAll({
      project_id,
      district,
      tahasil,
      type,
      limit,
      offset,
    });

    const total = await Village.paginationCountAll({
      project_id,
      district,
      tahasil,
      type,
    });

    return res.status(200).json({
      success: true,
      message: "Village list fetched successfully",
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
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
  const {
    village_name,
    tahasil,
    district,
    project_id,
    village_code,
    type,
    multiplying_factor,
  } = req.body;

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
      type,
      multiplying_factor
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

const exportVillage = async (req, res) => {
  const userId = req.user.id;

  try {
    const { project_id, district, tahasil, type } = req.query;
    const village = await Village.findAll({
      project_id,
      district,
      tahasil,
      type,
    });

    const villageTypeMap = {
      1: "Private Land",
      2: "Govt Land",
      3: "Forest Land",
    };

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Village Report");

    sheet.addRow([
      "Sl/No",
      "Project Name",
      "Village Name",
      "District",
      "Tahasil",
      "Land Type",
      "Created At",
      "Updated At",
    ]);

    village.forEach((v, index) => {
      sheet.addRow([
        index + 1,
        v.project_name,
        v.village_name,
        v.district,
        v.tahasil,
        villageTypeMap[v.type] || "N/A",
        v.created_at,
        v.updated_at,
      ]);
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=village_report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

    await logAction(
      userId,
      "export village",
      "success",
      "Village exported successfully",
      { project_id, district, tahasil, type },
      null
    );
  } catch (err) {
    await logAction(
      userId,
      "export village",
      "failure",
      err.message,
      null,
      null
    );

    console.error("Export Village Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to export village",
    });
  }
};

const getTahasilList = async (req, res) => {
  try {
    const { district, type } = req.query;
    if (!type) {
      return res.status(400).json({
        success: false,
        message: "Type is required",
      });
    }
    const tahasils = await Village.getTahasilList(district, type);
    return res.status(200).json({
      success: true,
      message: "Tahasil list fetched successfully",
      data: tahasils,
    });
  } catch (err) {
    console.error("Get Tahasil Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  addVillage,
  villageList,
  updateVillage,
  deleteVillage,
  exportVillage,
  getTahasilList
};

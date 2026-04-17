const ForestLand = require("../models/forestLandModel");
const logAction = require("../utils/logger");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");

const normalizeDocumentList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter(Boolean);
    } catch (e) {
      // legacy single-file string values are supported
    }

    return [trimmed];
  }

  return [];
};

const hasUploadedDocuments = (files, field) =>
  Array.isArray(files[field]) && files[field].length > 0;

const hasAnyDocuments = (value) => normalizeDocumentList(value).length > 0;

const buildDocumentValue = (files, field, existingValue = null) => {
  const existingDocs = normalizeDocumentList(existingValue);
  const newDocs = (files[field] || []).map((file) => file.filename).filter(Boolean);

  const merged = [...new Set([...existingDocs, ...newDocs])];
  return merged.length ? JSON.stringify(merged) : null;
};

const normalizeHeaderKey = (key) =>
  key?.toString().replace(/\r?\n/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

const toTrimmedString = (value) =>
  value === null || value === undefined ? "" : value.toString().trim();

const normalizeHeaderCode = (value) => {
  const raw = toTrimmedString(value).replace(/\s+/g, "");
  if (!raw) return "";
  const match = raw.match(/^([A-Za-z]+)([0-9]+)$/);
  if (!match) return raw;
  return `${match[1].toUpperCase()}${match[2]}`;
};

const isLikelyHeaderCode = (value) =>
  /^[A-Za-z]{2,}[0-9]{2}$/.test(normalizeHeaderCode(value));

const buildForestExcelRowsWithFlexibleHeaders = (sheet) => {
  const singleHeaderRows = xlsx.utils.sheet_to_json(sheet, {
    defval: null,
    raw: true,
  });

  if (!singleHeaderRows || singleHeaderRows.length === 0) return [];

  return singleHeaderRows.map((row) => {
    const normalizedRow = {};
    for (const key in row) {
      const normalizedKey = normalizeHeaderKey(key);
      normalizedRow[key] = row[key];
      normalizedRow[normalizedKey] = row[key];
    }
    return normalizedRow;
  });
};

// validation helpers
// const validateForestArea = (d) =>
//   d.forest_category_id && d.forest_division && d.forest_range;

// const validateNonForest = (d) => d.ownership && d.fra_allotted !== undefined;

// const validateCA = (d) => d.ca_area_ha && d.patch_name;

const uploadForestLandSchedule = async (req, res) => {
  const userId = req.user?.id || null;
  const cleanupUploadedFile = () => {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
  };

  try {
    const project_master_id = req.body.project_master_id || req.body.project_id;
    const schedule_type = req.body.schedule_type || req.body.type;

    if (!project_master_id || !schedule_type) {
      return res.status(400).json({
        success: false,
        message: "project_id (or project_master_id) and schedule_type (or type) are required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Excel file is required",
      });
    }

    const workbook = xlsx.readFile(req.file.path);

    if (!workbook.SheetNames.length) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: "Invalid Excel format. No sheet found inside file.",
      });
    }

    if (workbook.SheetNames.length > 2) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: "Invalid Excel format. Maximum 2 sheets are allowed inside file.",
      });
    }

    const rawRows = workbook.SheetNames.flatMap((sheetName) =>
      buildForestExcelRowsWithFlexibleHeaders(workbook.Sheets[sheetName]),
    );

    if (!rawRows.length) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: "Excel file is empty",
      });
    }

    const normalizeCompareKey = (key) =>
      normalizeHeaderKey(key)?.replace(/[^a-z0-9]+/g, " ").trim();
    const isHeaderLikeValue = (value, ...expectedLabels) => {
      const normalizedValue = normalizeCompareKey(value);
      if (!normalizedValue) return false;
      return expectedLabels.some(
        (label) => normalizedValue === normalizeCompareKey(label),
      );
    };

    const toNumberOrNull = (value) => {
      if (value === null || value === undefined || value === "") return null;
      const num = Number(String(value).replace(/,/g, "").trim());
      return Number.isFinite(num) ? num : null;
    };

    const getValueByNormalizedKey = (row, possibleKeys) => {
      if (!row) return null;
      const normalizedKeys = possibleKeys.map((k) => normalizeCompareKey(k));
      for (const key of Object.keys(row)) {
        if (normalizedKeys.includes(normalizeCompareKey(key))) {
          const value = row[key];
          if (value !== undefined && value !== null && `${value}`.trim() !== "") {
            return value;
          }
        }
      }
      return null;
    };

    const getCodeValue = (row, code) => {
      const target = normalizeCompareKey(code);
      for (const key of Object.keys(row || {})) {
        const normalized = normalizeCompareKey(key);
        if (normalized === target || normalized.startsWith(`${target} `)) {
          const value = row[key];
          if (value !== undefined && value !== null && `${value}`.trim() !== "") {
            return value;
          }
        }
      }
      return null;
    };

    const get = (row, code, ...fallbacks) => {
      const byCode = getCodeValue(row, code);
      if (byCode !== null) return byCode;
      return getValueByNormalizedKey(row, fallbacks);
    };

    const parsedRows = rawRows
      .map((row) => {
        const totalAreaHa = toNumberOrNull(
          get(row, "FA01", "NFA02", "CAA01", "total area (ha)", "total area ha"),
        );
        const totalAreaAcre = toNumberOrNull(
          get(row, "total area (in acres)", "total area (acre)"),
        );
        const proposedAreaHa = toNumberOrNull(
          get(
            row,
            "FA02",
            "NFA03",
            "proposed/ acquired area ha",
            "proposed_acquired_area_ha",
            "proposed area (ha)",
          ),
        );
        const proposedAreaAcre = toNumberOrNull(
          get(row, "LA02", "proposed area (in acres)", "proposed area (acre)"),
        );

        return {
          district: get(row, "FD01", "NFD01", "CAD01", "district"),
          ri_circle: get(row,  "FD02", "NFD02", "CAD02", "ri circle", "ri_circle"),
          tahasil: get(row, "NFD03", "CAD03", "tahasil", "tehasil"),
          village: get(
            row,
            "FD05",
            "NFD04",
            "CAD04",
            "village",
            "mouza",
            "mauza",
            "name of village",
          ),
          forest_division: get(row, "FD03", "CA04", "forest division", "forest_division"),
          forest_range: get(row, "FD04", "forest range", "forest_range"),
          khata_no: get(
            row,
            "FD06",
            "NFD05",
            "CAD05",
            "khata no",
            "khata_no",
            "khata no.",
          ),
          plot_no: get(
            row,
            "FD07",
            "NFD06",
            "CAD06",
            "plot no",
            "plot_no",
            "plot no.",
          ),
          kisam: get(row, "FD08", "NFD07", "CAD07", "kisam", "kissam"),
          forest_category_id: get(
            row,
            "FD09",
            "forest category id",
            "forest_category_id",
            "forest category",
            "forest_category",
          ),
          ownership: get(row, "NFO01", "CAO01", "ownership"),
          fra_allotted: get(row, "NFA01", "fra allotted", "fra_allotted", "land allotted through fra"),
          total_area_ha:
            totalAreaHa !== null
              ? totalAreaHa
              : totalAreaAcre !== null
                ? parseFloat((totalAreaAcre / 2.47105).toFixed(4))
                : null,
          proposed_acquired_area_ha:
            proposedAreaHa !== null
              ? proposedAreaHa
              : proposedAreaAcre !== null
                ? parseFloat((proposedAreaAcre / 2.47105).toFixed(4))
                : null,
          digital_area_ha: toNumberOrNull(
            get(row, "digital area (ha)", "digital_area_ha", "digital area ha"),
          ),
          ca_area_ha: toNumberOrNull(get(row, "CA02", "ca area (ha)", "ca_area_ha")),
          patch_name: get(row, "CA03", "patch name", "patch_name"),
          remarks: get(row, "FA03", "NFA04", "CA05", "remarks", "remark"),
        };
      })
      .map((row) => ({
        ...row,
        district: typeof row.district === "string" ? row.district.trim() : row.district,
        ri_circle: typeof row.ri_circle === "string" ? row.ri_circle.trim() : row.ri_circle,
        tahasil: typeof row.tahasil === "string" ? row.tahasil.trim() : row.tahasil,
        village: typeof row.village === "string" ? row.village.trim() : row.village,
        khata_no: typeof row.khata_no === "string" ? row.khata_no.trim() : row.khata_no,
        plot_no: typeof row.plot_no === "string" ? row.plot_no.trim() : row.plot_no,
      }))
      .filter((row) =>
        Object.values(row).some(
          (value) => value !== null && value !== undefined && value !== "",
        ),
      )
      .filter(
        (row) =>
          !isHeaderLikeValue(row.district, "district") &&
          !isHeaderLikeValue(row.ri_circle, "ri circle", "ri_circle") &&
          !isHeaderLikeValue(row.tahasil, "tahasil", "tehasil") &&
          !isHeaderLikeValue(row.village, "village", "mouza", "mauza", "name of village") &&
          !isHeaderLikeValue(row.forest_division, "forest division", "forest_division") &&
          !isHeaderLikeValue(row.forest_range, "forest range", "forest_range") &&
          !isHeaderLikeValue(row.khata_no, "khata no", "khata_no", "khata no.") &&
          !isHeaderLikeValue(row.plot_no, "plot no", "plot_no", "plot no.") &&
          !isHeaderLikeValue(row.kisam, "kisam", "kissam") &&
          !isHeaderLikeValue(
            row.forest_category_id,
            "forest category id",
            "forest_category_id",
            "forest category",
            "forest_category",
          ) &&
          !isHeaderLikeValue(row.ownership, "ownership") &&
          !isHeaderLikeValue(
            row.fra_allotted,
            "fra allotted",
            "fra_allotted",
            "land allotted through fra",
          ) &&
          !isHeaderLikeValue(row.patch_name, "patch name", "patch_name") &&
          !isHeaderLikeValue(row.remarks, "remarks", "remark"),
      )
      .filter((row) => row.khata_no || row.plot_no || row.village);

    if (!parsedRows.length) {
      cleanupUploadedFile();
      return res.status(400).json({
        success: false,
        message: "No valid rows found in Excel file",
      });
    }

    const insertedCount = await ForestLand.bulkInsertFromExcel(
      parsedRows,
      project_master_id,
      schedule_type,
    );

    await ForestLand.insertDocument({
      project_id: project_master_id,
      type: schedule_type || req.body.type,
      filename: req.file.filename,
      original_filename: req.file.originalname,
      file_path: `uploads/forest_land_excels/${req.file.filename}`,
      uploaded_by: userId,
    });

    await logAction(
      userId,
      "upload forest land schedule excel",
      "success",
      `Inserted ${insertedCount} forest land rows`,
      { project_master_id, schedule_type, rows: parsedRows.length },
      null,
    );

    return res.status(201).json({
      success: true,
      message: "Forest Land Schedule uploaded successfully",
      insertedCount,
    });
  } catch (err) {
    await logAction(
      userId,
      "upload forest land schedule excel",
      "failure",
      err.message,
      req.body || {},
      null,
    );

    console.error("Forest Land Schedule Upload Error:", err);
    cleanupUploadedFile();
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const addForestLand = async (req, res) => {
  const userId = req.user.id;

  try {
    req.body.project_master_id =
      req.body.project_master_id || req.body.project_id;
    req.body.schedule_type = req.body.schedule_type || req.body.type;

    const { project_master_id, schedule_type } = req.body;

    if (!project_master_id) {
      return res.status(400).json({
        success: false,
        message: "project_id (or project_master_id) is required",
      });
    }

    if (!schedule_type) {
      return res.status(400).json({
        success: false,
        message: "schedule_type (or type) is required",
      });
    }

    // type-wise validation
    // if (schedule_type === "FOREST_AREA" && !validateForestArea(req.body)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid Forest Area data",
    //   });
    // }

    // if (schedule_type === "NON_FOREST_AREA" && !validateNonForest(req.body)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid Non-Forest data",
    //   });
    // }

    // if (
    //   ["CA_LAND", "ACA_LAND"].includes(schedule_type) &&
    //   !validateCA(req.body)
    // ) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid CA / ACA data",
    //   });
    // }

    const insertedData = await ForestLand.create(req.body);

    await logAction(
      userId,
      "create forest land",
      "success",
      "Forest land created successfully",
      req.body,
      insertedData,
    );

    res.status(201).json({
      success: true,
      message: "Forest Land Schedule added successfully",
      insertedData,
    });
  } catch (err) {
    await logAction(
      userId,
      "create forest land",
      "failure",
      err.message,
      req.body,
      null,
    );
    console.error(err);
    res.status(500).json({
      success: true,
      message: "Server error",
    });
  }
};

const forestLandList = async (req, res) => {
  try {
    let {
      project_master_id,
      project_id,
      schedule_type,
      type,
      page = 1,
      limit = 10,
    } = req.query;

    project_master_id = project_master_id || project_id;
    schedule_type = schedule_type || type;

    if (!project_master_id || !schedule_type ) {
      return res.status(400).json({
        success: false,
        message: "project_id (or project_master_id) and schedule_type (or type) are required",
      });
    }

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const result = await ForestLand.list({
      project_master_id,
      schedule_type,
      limit,
      offset,
    });

    const totalPages = Math.ceil(result.total / limit);

    res.status(200).json({
      success: true,
      message: "Forest Land Schedule list fetched successfully",
      page,
      limit,
      total: result.total,
      totalPages,
      data: result.data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const forestLandDocumentList = async (req, res) => {
  try {
    let { project_id, project_master_id, type, schedule_type } = req.query;
    project_id = project_id || project_master_id;

    const rows = await ForestLand.findAllDocuments({
      project_id,
      schedule_type,
      type,
    });

    const files = rows.map((r) => ({
      id: r.id,
      project_id: r.project_id,
      type: r.type,
      name: r.original_filename,
      download_name: r.filename,
      uploadedAt: r.created_at,
      documentUrl: `${req.protocol}://${req.get("host")}${req.get("host").includes("localhost") ? "" : "/api"
        }/uploads/forest_land_excels/${r.filename}`,
    }));

    return res.status(200).json({
      success: true,
      total: files.length,
      files,
    });
  } catch (err) {
    console.error("Forest Land Document List Error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch forest land documents",
    });
  }
};

const forestLandDocumentDelete = async (req, res) => {
  const userId = req.user?.id || null;

  try {
    const { fileName } = req.params;

    if (!fileName || fileName.includes("..")) {
      return res.status(400).json({
        success: false,
        message: "Valid file name is required",
      });
    }

    // ✅ allow only Excel files
    // if (!/\.(xls|xlsx)$/i.test(fileName)) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Invalid file format. Only Excel files can be deleted",
    //   });
    // }

    const doc = await ForestLand.findDocumentByFilename(fileName);

    if (!doc) {
      return res.status(404).json({
        success: false,
        message: "Document record not found",
      });
    }

    const filePath = path.join(process.cwd(), doc.file_path);

    // delete file if exists
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // delete DB record
    await ForestLand.deleteDocumentByFilename(fileName);

    await logAction(
      userId,
      "forest land excel delete",
      "success",
      "Forest land excel file deleted successfully",
      { fileName },
      null,
    );

    return res.status(200).json({
      success: true,
      message: "File deleted successfully",
      deletedFile: fileName,
    });
  } catch (err) {
    console.error("Forest Land Excel Delete Error:", err);

    await logAction(
      userId,
      "forest land excel delete",
      "failure",
      "Failed to delete forest land Excel file",
      null,
      err.message,
    );

    return res.status(500).json({
      success: false,
      message: "Server error while deleting forest land Excel file",
    });
  }
};


const updateForestLand = async (req, res) => {
  const userId = req.user?.id || null;
  const { id } = req.params;

  try {
    const body = req.body || {};

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "id is required",
      });
    }

    const existingData = await ForestLand.findById(id);
    if (!existingData) {
      return res.status(404).json({
        success: false,
        message: "Forest land record not found",
      });
    }

    if (!Object.keys(body).length) {
      return res.status(400).json({
        success: false,
        message: "At least one field is required to update",
      });
    }

    const payload = {
      ...existingData,
      ...body,
    };

    if (!payload.schedule_type) {
      return res.status(400).json({
        success: false,
        message: "Schedule type is required",
      });
    }

    const updatedData = await ForestLand.update(id, payload);

    if (!updatedData) {
      return res.status(404).json({
        success: false,
        message: "Forest land record not found",
      });
    }

    await logAction(
      userId,
      "update forest land",
      "success",
      "Forest land updated successfully",
      body,
      updatedData
    );

    res.status(200).json({
      success: true,
      message: "Forest Land Schedule updated successfully",
      updatedData,
    });
  } catch (err) {
    await logAction(
      userId,
      "update forest land",
      "failure",
      err.message,
      req.body || {},
      null
    );

    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteForestLand = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const deleted = await ForestLand.softDelete(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Forest land record not found",
      });
    }

    await logAction(
      userId,
      "delete forest land",
      "success",
      "Forest land deleted successfully",
      { id },
      null
    );

    res.status(200).json({
      success: true,
      message: "Forest land deleted successfully",
    });
  } catch (err) {
    await logAction(
      userId,
      "delete forest land",
      "failure",
      err.message,
      { id },
      null
    );

    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// const forestLandAbstract = async (req, res) => {
//   try {
//     const { project_master_id } = req.query;

//     const rows = await ForestLand.getAbstract(
//       project_master_id || null
//     );

//     // Default buckets
//     const buckets = {
//       FOREST_AREA: { total: 0, proposed: 0, digital: 0 },
//       NON_FOREST_AREA: { total: 0, proposed: 0, digital: 0 },
//       CA_LAND: { total: 0, proposed: 0, digital: 0 },
//       ACA_LAND: { total: 0, proposed: 0, digital: 0 },
//       OTHER: { total: 0, proposed: 0, digital: 0 },
//     };

//     rows.forEach(r => {
//       buckets[r.schedule_type] = {
//         total: r.total_area,
//         proposed: r.proposed_area,
//         digital: r.digital_area,
//       };
//     });

//     const totalProjectArea = {
//       total:
//         buckets.FOREST_AREA.total +
//         buckets.NON_FOREST_AREA.total,
//       proposed:
//         buckets.FOREST_AREA.proposed +
//         buckets.NON_FOREST_AREA.proposed,
//       digital:
//         buckets.FOREST_AREA.digital +
//         buckets.NON_FOREST_AREA.digital,
//     };

//     const totalLandUnderFD = {
//       total:
//         totalProjectArea.total +
//         buckets.CA_LAND.total +
//         buckets.ACA_LAND.total,
//       proposed:
//         totalProjectArea.proposed +
//         buckets.CA_LAND.proposed +
//         buckets.ACA_LAND.proposed,
//       digital:
//         totalProjectArea.digital +
//         buckets.CA_LAND.digital +
//         buckets.ACA_LAND.digital,
//     };

//     res.status(200).json({
//       success: true,
//       scope: project_master_id ? "PROJECT" : "ALL_PROJECTS",
//       project_master_id: project_master_id || null,
//       data: [
//         {
//           label: "Total Forest Land",
//           ...buckets.FOREST_AREA,
//         },
//         {
//           label: "Total Non-Forest Land",
//           ...buckets.NON_FOREST_AREA,
//         },
//         {
//           label: "Total Project Area",
//           ...totalProjectArea,
//         },
//         {
//           label: "Total CA Land",
//           ...buckets.CA_LAND,
//         },
//         {
//           label: "Total ACA Land",
//           ...buckets.ACA_LAND,
//         },
//         {
//           label: "Total Land (Others, If any)",
//           ...buckets.OTHER,
//         },
//         {
//           label: "Total Land Under FD Framework",
//           ...totalLandUnderFD,
//         },
//       ],
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


// const addForestProject = async (req, res) => {
//   const userId = req.user?.id;

//   try {
//     const { project_id, project_name } = req.body;

//     // Minimum required fields
//     if (!project_id || !project_name) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_name are required",
//       });
//     }

//     const project = await ForestLand.createForestProject(req.body);

//     await logAction(
//       userId,
//       "create forest project",
//       "success",
//       "Forest project created successfully",
//       req.body,
//       project
//     );

//     return res.status(201).json({
//       success: true,
//       message: "Forest Project created successfully",
//       data: project,
//     });
//   } catch (err) {
//     console.error(err);

//     // Duplicate project_id handling
//     if (err.code === "ER_DUP_ENTRY") {
//       return res.status(409).json({
//         success: false,
//         message: "Project Code already exists",
//       });
//     }

//     await logAction(
//       userId,
//       "create forest project",
//       "failure",
//       err.message,
//       req.body,
//       null
//     );

//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };


const forestLandAbstract = async (req, res) => {
  try {
    const project_master_id = req.query.project_master_id || req.query.project_id;

    const rows = await ForestLand.getAbstract(project_master_id || null);

    // helper: force number
    const toNum = (v) => Number(v || 0);

    // helper: format to 2 decimals (final output)
    const fmt = (v) => Number(v).toFixed(2);

    // Default buckets (NUMBERS only)
    const buckets = {
      FOREST_AREA: { total: 0, proposed: 0, digital: 0 },
      NON_FOREST_AREA: { total: 0, proposed: 0, digital: 0 },
      CA_LAND: { total: 0, proposed: 0, digital: 0 },
      ACA_LAND: { total: 0, proposed: 0, digital: 0 },
      OTHER: { total: 0, proposed: 0, digital: 0 },
    };

    // Fill buckets (convert to numbers immediately)
    rows.forEach((r) => {
      if (buckets[r.schedule_type]) {
        buckets[r.schedule_type] = {
          total: toNum(r.total_area),
          proposed: toNum(r.proposed_area),
          digital: toNum(r.digital_area),
        };
      }
    });

    // Calculations (PURE NUMBERS)
    const totalProjectArea = {
      total:
        buckets.FOREST_AREA.total +
        buckets.NON_FOREST_AREA.total,
      proposed:
        buckets.FOREST_AREA.proposed +
        buckets.NON_FOREST_AREA.proposed,
      digital:
        buckets.FOREST_AREA.digital +
        buckets.NON_FOREST_AREA.digital,
    };

    const totalLandUnderFD = {
      total:
        totalProjectArea.total +
        buckets.CA_LAND.total +
        buckets.ACA_LAND.total,
      proposed:
        totalProjectArea.proposed +
        buckets.CA_LAND.proposed +
        buckets.ACA_LAND.proposed,
      digital:
        totalProjectArea.digital +
        buckets.CA_LAND.digital +
        buckets.ACA_LAND.digital,
    };

    // helper to format rows
    const formatRow = (row) => ({
      total: fmt(row.total),
      proposed: fmt(row.proposed),
      digital: fmt(row.digital),
    });

    res.status(200).json({
      success: true,
      scope: project_master_id ? "PROJECT" : "ALL_PROJECTS",
      project_master_id: project_master_id || null,
      data: [
        {
          label: "Total Forest Land",
          ...formatRow(buckets.FOREST_AREA),
        },
        {
          label: "Total Non-Forest Land",
          ...formatRow(buckets.NON_FOREST_AREA),
        },
        {
          label: "Total Project Area",
          ...formatRow(totalProjectArea),
        },
        {
          label: "Total CA Land",
          ...formatRow(buckets.CA_LAND),
        },
        {
          label: "Total ACA Land",
          ...formatRow(buckets.ACA_LAND),
        },
        {
          label: "Total Land (Others, If any)",
          ...formatRow(buckets.OTHER),
        },
        {
          label: "Total Land Under FD Framework",
          ...formatRow(totalLandUnderFD),
        },
      ],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// const addForestProject = async (req, res) => {
//   try {
//     const {
//       project_id,
//       project_name,
//       eds_flag
//     } = req.body;

//     // Basic required fields
//     if (!project_id || !project_name) {
//       return res.status(400).json({
//         success: false,
//         message: "project_id and project_name are required",
//       });
//     }

//     // Convert eds_flag to number
//     const edsFlag = Number(eds_flag);

//     // RULE 1: eds_flag = 1 → document mandatory
//     if (edsFlag === 1 && !req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "EDS document is required when EDS flag is Yes",
//       });
//     }

//     // RULE 2: eds_flag = 0 → document should not be uploaded
//     if (edsFlag === 0 && req.file) {
//       return res.status(400).json({
//         success: false,
//         message: "EDS document should not be uploaded when EDS flag is No",
//       });
//     }

//     const payload = {
//       ...req.body,
//       eds_flag: edsFlag,
//       eds_document_path: req.file ? req.file.path : null,
//     };

//     const project = await ForestLand.createForestProject(payload);

//     return res.status(201).json({
//       success: true,
//       message: "Forest Project created successfully",
//       data: project,
//     });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server error",
//     });
//   }
// };

const addForestProjectWithEds = async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || [];

    const edsFlag = Number(body.eds_flag) || 0;

    const master = await ForestLand.createForestProject({
      project_id: body.project_id,
      proposal_no: body.proposal_no,
      project_name: body.project_name,
      user_agency: body.user_agency,
      project_category: body.project_category,
      project_sub_category: body.project_sub_category,
      project_nature: body.project_nature,
      state: body.state,
      district: body.district,
      tahasil: body.tahasil,
      mouza: body.mouza,
      range_division: body.range_division,
      forest_type: body.forest_type,
      total_project_area_ha: body.total_project_area_ha,
      forest_area_ha: body.forest_area_ha,
      non_forest_area_ha: body.non_forest_area_ha,
      project_status: body.project_status,
      current_stage: body.current_stage,
      eds_flag: edsFlag,
      eds_document_path: null,
    });

    const masterId = master.id;

    // Multiple EDS handling
    // if (edsFlag === 1 && body.eds_list) {
    //   const edsList =
    //     typeof body.eds_list === "string"
    //       ? JSON.parse(body.eds_list)
    //       : body.eds_list;

    //   for (let i = 0; i < edsList.length; i++) {
    //     const eds = edsList[i];

    //     //find matching file
    //     const fileField = `eds_reply_document_${i}`;
    //     const fileObj = files.find(f => f.fieldname === fileField);

    //     await ForestLand.createEds({
    //       project_master_id: masterId,
    //       eds_ref_no: eds.eds_ref_no,
    //       issuing_authority: eds.issuing_authority,
    //       eds_issue_date: eds.eds_issue_date,
    //       eds_due_date: eds.eds_due_date,
    //       total_issues: eds.total_issues,
    //       issues_closed: eds.issues_closed,
    //       issues_pending: eds.issues_pending,
    //       eds_reply_document: fileObj?.filename || null,
    //       eds_status: eds.eds_status,
    //     });
    //   }
    // }

    const getFile = (field) => {
      if (!req.files) return null;

      if (Array.isArray(req.files)) {
        return req.files.find(f => f.fieldname === field);
      }

      return req.files[field]?.[0] || null;
    };

    if (edsFlag === 1 && body.eds_list) {
      const edsList =
        typeof body.eds_list === "string"
          ? JSON.parse(body.eds_list)
          : body.eds_list;

      for (let i = 0; i < edsList.length; i++) {
        const eds = edsList[i];

        // const fileField = `eds_reply_document_${i}`;
        // const fileObj = getFile(fileField);
        const fileObj = files[i];

        await ForestLand.createEds({
          project_master_id: masterId,
          eds_ref_no: eds.eds_ref_no,
          issuing_authority: eds.issuing_authority,
          eds_issue_date: eds.eds_issue_date,
          eds_due_date: eds.eds_due_date,
          total_issues: eds.total_issues,
          issues_closed: eds.issues_closed,
          issues_pending: eds.issues_pending,
          eds_reply_document: fileObj?.filename || null,
          eds_status: eds.eds_status,
        });
      }
    }

    return res.status(201).json({
      success: true,
      message: "Forest project with EDS saved successfully",
      project_id: masterId,
    });
  } catch (err) {
    console.error("EDS Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

// const addForestProjectWithEds = async (req, res) => {
//   try {
//     const body = req.body || {};
//     const files = req.files || [];
//     const edsFlag = Number(body.eds_flag) || 0;

//     let master = await ForestLand.getProjectByProjectId(body.project_id);

//     let masterId;

//     if (master) {
//       await ForestLand.updateForestProject(master.id, body);
//       masterId = master.id;

//       await ForestLand.deleteEdsByMasterId(masterId);
//     } else {
//       const newMaster = await ForestLand.createForestProject({
//         ...body,
//         eds_flag: edsFlag,
//         eds_document_path: null,
//       });

//       masterId = newMaster.id;
//     }

//     if (edsFlag === 1 && body.eds_list) {
//       const edsList =
//         typeof body.eds_list === "string"
//           ? JSON.parse(body.eds_list)
//           : body.eds_list;

//       for (let i = 0; i < edsList.length; i++) {
//         const eds = edsList[i];
//         const fileObj = files[i];

//         await ForestLand.createEds({
//           project_master_id: masterId,
//           eds_ref_no: eds.eds_ref_no,
//           issuing_authority: eds.issuing_authority,
//           eds_issue_date: eds.eds_issue_date,
//           eds_due_date: eds.eds_due_date,
//           total_issues: eds.total_issues,
//           issues_closed: eds.issues_closed,
//           issues_pending: eds.issues_pending,
//           eds_reply_document: fileObj?.filename || null,
//           eds_status: eds.eds_status,
//         });
//       }
//     }

//     return res.status(200).json({
//       success: true,
//       message: master
//         ? "Forest project updated successfully"
//         : "Forest project created successfully",
//       project_id: masterId,
//     });
//   } catch (err) {
//     console.error("EDS Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server error",
//     });
//   }
// };

const getForestProjectWithEds = async (req, res) => {
  try {
    const { projectId } = req.params;

    const data = await ForestLand.getProjectWithEds(projectId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data not found for this project",
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("Fetch Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const forestProjectList = async (req, res) => {
  try {
    let {
      page = 1,
      limit = 10,
      project_id
    } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    const result = await ForestLand.listForestProjects({
      page,
      limit,
      offset,
      project_id
    });

    const data = result.data.map((r) => ({
      ...r,
      eds_document_url: r.eds_document_path
        ? `${req.protocol}://${req.get("host")}${req.get("host").includes("localhost") ? "" : "/api"
        }/${r.eds_document_path}`
        : null,
    }));

    res.status(200).json({
      success: true,
      message: "Forest projects fetched successfully",
      page,
      limit,
      total: result.total,
      totalPages: Math.ceil(result.total / limit),
      data: data,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateForestProject = async (req, res) => {
  const userId = req.user?.id || null;
  try {
    const masterProjectId = req.params.id;
    const body = req.body || {};
    const files = req.files || [];

    // Fetch existing project
    const existing = await ForestLand.getForestProjectById(masterProjectId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Forest project not found",
      });
    }

    const edsFlag =
      body.eds_flag !== undefined
        ? Number(body.eds_flag)
        : Number(existing.eds_flag || 0);

    const payload = {
      proposal_no:
        body.proposal_no !== undefined ? body.proposal_no : existing.proposal_no,
      project_name:
        body.project_name !== undefined ? body.project_name : existing.project_name,
      project_category:
        body.project_category !== undefined
          ? body.project_category
          : existing.project_category,
      project_sub_category:
        body.project_sub_category !== undefined
          ? body.project_sub_category
          : existing.project_sub_category,
      project_nature:
        body.project_nature !== undefined
          ? body.project_nature
          : existing.project_nature,
      user_agency:
        body.user_agency !== undefined ? body.user_agency : existing.user_agency,
      state: body.state !== undefined ? body.state : existing.state,
      district: body.district !== undefined ? body.district : existing.district,
      tahasil: body.tahasil !== undefined ? body.tahasil : existing.tahasil,
      mouza: body.mouza !== undefined ? body.mouza : existing.mouza,
      range_division:
        body.range_division !== undefined
          ? body.range_division
          : existing.range_division,
      forest_type:
        body.forest_type !== undefined ? body.forest_type : existing.forest_type,
      total_project_area_ha:
        body.total_project_area_ha !== undefined
          ? body.total_project_area_ha
          : existing.total_project_area_ha,
      forest_area_ha:
        body.forest_area_ha !== undefined
          ? body.forest_area_ha
          : existing.forest_area_ha,
      non_forest_area_ha:
        body.non_forest_area_ha !== undefined
          ? body.non_forest_area_ha
          : existing.non_forest_area_ha,
      project_status:
        body.project_status !== undefined
          ? body.project_status
          : existing.project_status,
      current_stage:
        body.current_stage !== undefined ? body.current_stage : existing.current_stage,
      eds_flag: edsFlag,
      eds_document_path: null,
    };

    const updatedProject = await ForestLand.updateForestProject(
      masterProjectId,
      payload
    );

    await ForestLand.deleteEdsByMasterId(masterProjectId);

    if (edsFlag === 1 && body.eds_list) {
      const edsList =
        typeof body.eds_list === "string"
          ? JSON.parse(body.eds_list)
          : body.eds_list;

      for (let i = 0; i < edsList.length; i++) {
        const eds = edsList[i];
        const fileObj = files[i];

        await ForestLand.createEds({
          project_master_id: masterProjectId,
          eds_ref_no: eds.eds_ref_no,
          issuing_authority: eds.issuing_authority,
          eds_issue_date: eds.eds_issue_date,
          eds_due_date: eds.eds_due_date,
          total_issues: eds.total_issues,
          issues_closed: eds.issues_closed,
          issues_pending: eds.issues_pending,
          eds_reply_document: fileObj?.filename || null,
          eds_status: eds.eds_status,
        });
      }
    }

    await logAction(
      userId,
      "update forest project",
      "success",
      "Forest project updated",
      body,
      updatedProject
    );

    res.status(200).json({
      success: true,
      message: "Forest project updated successfully",
      data: updatedProject,
    });
  } catch (err) {
    console.error(err);

    await logAction(
      userId,
      "update forest project",
      "failure",
      err.message,
      req.body,
      null
    );

    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const deleteForestProject = async (req, res) => {
  const userId = req.user.id;
  try {
    const masterProjectId = req.params.id;

    // Check if project exists & not deleted
    const existing = await ForestLand.getForestProjectById(masterProjectId);
    if (!existing || existing.is_deleted === 1) {
      return res.status(404).json({
        success: false,
        message: "Forest project not found",
      });
    }

    // Soft delete
    await ForestLand.deleteForestProject(masterProjectId);

    await logAction(
      userId,
      "delete forest project",
      "success",
      "Forest project deleted",
      { masterProjectId },
      null
    );

    res.status(200).json({
      success: true,
      message: "Forest project deleted successfully",
    });
  } catch (err) {
    console.error(err);

    await logAction(
      userId,
      "delete forest project",
      "failed",
      "Forest project deleted",
      { masterProjectId },
      null
    );

    res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const addStage0 = async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || {};

    if (!body.forest_project_id) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const dgpsSurveyDone = Number(body.dgps_survey_done) || 0;
    const orsacAuth = Number(body.orsac_authentication) || 0;
    const treeEnum = Number(body.tree_enumeration_done) || 0;
    const adminDocs = Number(body.administrative_documents) || 0;
    const legalLease = Number(body.legal_lease_documents) || 0;
    const technicalData = Number(body.technical_data) || 0;
    const caPlanning = Number(body.ca_ca_planning) || 0;
    const proposalSubmitted = Number(body.proposal_submitted) || 0;

    const stageStatus =
      proposalSubmitted === 1 ? "Ready" : "Ongoing";

    const requireFile = (condition, field, message) => {
      if (condition && !hasUploadedDocuments(files, field)) {
        throw new Error(message);
      }
    };

    requireFile(dgpsSurveyDone === 1, "dgps_document", "DGPS document required");

    requireFile(orsacAuth === 1, "orsac_document", "ORSAC document required");

    requireFile(
      treeEnum === 1,
      "tree_enumeration_document",
      "Tree enumeration document required"
    );

    requireFile(
      adminDocs === 1,
      "administrative_document",
      "Administrative document required"
    );

    requireFile(
      legalLease === 1,
      "legal_lease_document",
      "Legal & Lease document required"
    );

    requireFile(
      technicalData === 1,
      "technical_document",
      "Technical document required"
    );

    requireFile(
      body.forest_land_details === "Uploaded",
      "forest_land_details_document",
      "Forest land details document required"
    );

    requireFile(
      caPlanning === 1,
      "ca_ca_document",
      "CA/CA Planning document required"
    );

    requireFile(
      body.fra_records === "Completed",
      "fra_document",
      "FRA document required"
    );

    requireFile(
      body.environmental_statutory === "Cleared",
      "environmental_document",
      "Environmental document required"
    );

    requireFile(
      body.wildlife_safeguards === "Completed",
      "wildlife_document",
      "Wildlife document required"
    );

    requireFile(
      body.maps_spatial_evidence === "Authenticated",
      "maps_document",
      "Maps document required"
    );

    requireFile(
      body.financial_undertakings === "Submitted",
      "financial_document",
      "Financial document required"
    );

    requireFile(
      proposalSubmitted === 1,
      "proposal_document",
      "Proposal document required"
    );

    const payload = {
      forest_project_id: body.forest_project_id,

      dgps_survey_done: dgpsSurveyDone,
      dgps_area_ha: body.dgps_area_ha || null,
      dgps_document: buildDocumentValue(files, "dgps_document"),

      orsac_authentication: orsacAuth,
      orsac_document: buildDocumentValue(files, "orsac_document"),

      tree_enumeration_done: treeEnum,
      tree_enumeration_document: buildDocumentValue(
        files,
        "tree_enumeration_document"
      ),

      administrative_documents: adminDocs,
      administrative_document: buildDocumentValue(files, "administrative_document"),

      legal_lease_documents: legalLease,
      legal_lease_document: buildDocumentValue(files, "legal_lease_document"),

      technical_data: technicalData,
      technical_document: buildDocumentValue(files, "technical_document"),

      forest_land_details: body.forest_land_details || null,
      forest_land_details_document: buildDocumentValue(
        files,
        "forest_land_details_document"
      ),

      ca_ca_planning: caPlanning,
      ca_ca_document: buildDocumentValue(files, "ca_ca_document"),

      fra_records: body.fra_records || null,
      fra_document: buildDocumentValue(files, "fra_document"),

      environmental_statutory: body.environmental_statutory || null,
      environmental_document: buildDocumentValue(files, "environmental_document"),

      wildlife_safeguards: body.wildlife_safeguards || null,
      wildlife_document: buildDocumentValue(files, "wildlife_document"),

      maps_spatial_evidence: body.maps_spatial_evidence || null,
      maps_document: buildDocumentValue(files, "maps_document"),

      financial_undertakings: body.financial_undertakings || null,
      financial_document: buildDocumentValue(files, "financial_document"),

      proposal_submitted: proposalSubmitted,
      proposal_document: buildDocumentValue(files, "proposal_document"),

      parivesh_proposal_no: body.parivesh_proposal_no || null,
      submission_date: body.submission_date || null,

      stage_0_status: stageStatus,
    };

    const result = await ForestLand.createStage0(payload);

    return res.status(201).json({
      success: true,
      message: "Stage-0 data saved successfully",
      data: result,
    });
  } catch (err) {
    console.error("Stage0 Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const addStage1 = async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || {};

    if (!body.forest_project_id) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const conditionsExtracted = Number(body.stage1_conditions_extracted) || 0;
    const caLandHandedOver = Number(body.ca_land_handed_over) || 0;
    const stage1Accepted = Number(body.stage1_compliance_accepted) || 0;

    const eligibleForStage2 = stage1Accepted === 1 ? 1 : 0;

    const stage1Status =
      stage1Accepted === 1 ? "Completed" : "Pending";

    const requireFile = (condition, field, message) => {
      if (condition && !hasUploadedDocuments(files, field)) {
        throw new Error(message);
      }
    };

    requireFile(
      body.stage1_approval_letter === "Uploaded",
      "stage1_approval_document",
      "Stage-1 approval document required"
    );

    requireFile(
      conditionsExtracted === 1,
      "stage1_conditions_document",
      "Stage-1 conditions document required"
    );

    requireFile(
      caLandHandedOver === 1,
      "ca_land_document",
      "CA land document required"
    );

    requireFile(
      body.fra_compliance === "Complied",
      "fra_document",
      "FRA document required"
    );

    requireFile(
      body.npv_payment === "Paid",
      "npv_document",
      "NPV payment document required"
    );

    requireFile(
      body.ca_payment === "Paid",
      "ca_payment_document",
      "CA payment document required"
    );

    requireFile(
      body.aca_payment === "Paid",
      "aca_payment_document",
      "ACA payment document required"
    );

    requireFile(
      body.wildlife_payment === "Paid",
      "wildlife_payment_document",
      "Wildlife payment document required"
    );

    requireFile(
      body.technical_compliance === "Completed",
      "technical_document",
      "Technical compliance document required"
    );

    requireFile(
      stage1Accepted === 1,
      "stage1_acceptance_document",
      "Stage-1 acceptance document required"
    );

    const payload = {
      forest_project_id: body.forest_project_id,

      stage1_approval_letter: body.stage1_approval_letter || null,
      stage1_approval_document: buildDocumentValue(files, "stage1_approval_document"),

      stage1_conditions_extracted: conditionsExtracted,
      stage1_conditions_document: buildDocumentValue(files, "stage1_conditions_document"),

      ca_land_handed_over: caLandHandedOver,
      ca_land_document: buildDocumentValue(files, "ca_land_document"),

      fra_compliance: body.fra_compliance || null,
      fra_document: buildDocumentValue(files, "fra_document"),

      npv_payment: body.npv_payment || null,
      npv_document: buildDocumentValue(files, "npv_document"),

      ca_payment: body.ca_payment || null,
      ca_payment_document: buildDocumentValue(files, "ca_payment_document"),

      aca_payment: body.aca_payment || null,
      aca_payment_document: buildDocumentValue(files, "aca_payment_document"),

      wildlife_payment: body.wildlife_payment || null,
      wildlife_payment_document: buildDocumentValue(files, "wildlife_payment_document"),

      technical_compliance: body.technical_compliance || null,
      technical_document: buildDocumentValue(files, "technical_document"),

      stage1_compliance_accepted: stage1Accepted,
      stage1_acceptance_document: buildDocumentValue(
        files,
        "stage1_acceptance_document"
      ),

      eligible_for_stage2: eligibleForStage2,
      stage1_status: stage1Status,
    };

    const result = await ForestLand.insertUpdateStage1(payload);

    return res.status(201).json({
      success: true,
      message: "Stage-1 data saved successfully",
      data: result,
    });
  } catch (err) {
    console.error("Stage1 Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const addStage2 = async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || {};

    if (!body.forest_project_id) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const stage2Letter = Number(body.stage2_approval_letter) || 0;
    const mapsApproved = Number(body.final_maps_approved) || 0;

    const stage2Status =
      stage2Letter === 1 ? "Granted" : "Not Granted";

    const eligiblePostClearance =
      stage2Status === "Granted" ? 1 : 0;

    const requireFile = (condition, field, message) => {
      if (condition && !hasUploadedDocuments(files, field)) {
        throw new Error(message);
      }
    };

    requireFile(
      body.environmental_clearance === "Obtained",
      "environmental_document",
      "Environmental clearance document required"
    );

    requireFile(
      body.nbwl_clearance === "Obtained",
      "nbwl_document",
      "NBWL document required"
    );

    requireFile(
      body.final_ca_execution === "Completed",
      "final_ca_document",
      "Final CA document required"
    );

    requireFile(
      mapsApproved === 1,
      "final_maps_document",
      "Final maps document required"
    );

    requireFile(
      body.final_technical_approval === "Completed",
      "final_technical_document",
      "Final technical document required"
    );

    requireFile(
      stage2Letter === 1,
      "stage2_approval_document",
      "Stage-II approval document required"
    );

    const payload = {
      forest_project_id: body.forest_project_id,

      environmental_clearance: body.environmental_clearance || null,
      environmental_document: buildDocumentValue(files, "environmental_document"),

      nbwl_clearance: body.nbwl_clearance || null,
      nbwl_document: buildDocumentValue(files, "nbwl_document"),

      final_ca_execution: body.final_ca_execution || null,
      final_ca_document: buildDocumentValue(files, "final_ca_document"),

      final_maps_approved: mapsApproved,
      final_maps_document: buildDocumentValue(files, "final_maps_document"),

      final_technical_approval:
        body.final_technical_approval || null,
      final_technical_document: buildDocumentValue(files, "final_technical_document"),

      stage2_approval_letter: stage2Letter,
      stage2_approval_document: buildDocumentValue(files, "stage2_approval_document"),

      stage2_approval_date: body.stage2_approval_date || null,

      approved_forest_area_ha:
        body.approved_forest_area_ha || null,
      approved_non_forest_area_ha:
        body.approved_non_forest_area_ha || null,

      stage2_status: stage2Status,
      eligible_post_clearance: eligiblePostClearance,
    };

    const result = await ForestLand.createStage2(payload);

    return res.status(201).json({
      success: true,
      message: "Stage-2 data saved successfully",
      data: result,
    });
  } catch (err) {
    console.error("Stage2 Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const addPostClearance = async (req, res) => {
  try {
    const body = req.body || {};
    const files = req.files || {};

    if (!body.forest_project_id) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const started = Number(body.ca_plantation_started) || 0;
    const completed = Number(body.ca_plantation_completed) || 0;
    const survival = Number(body.survival_report_submitted) || 0;
    const wildlife = Number(body.wildlife_mitigation) || 0;
    const safety = Number(body.safety_zone_maintained) || 0;
    const periodic = Number(body.periodic_compliance_submitted) || 0;

    const requireFile = (condition, field, message) => {
      if (condition && !hasUploadedDocuments(files, field)) {
        throw new Error(message);
      }
    };

    requireFile(
      started === 1,
      "ca_plantation_started_document",
      "CA plantation started document required"
    );

    requireFile(
      completed === 1,
      "ca_plantation_completed_document",
      "CA plantation completed document required"
    );

    requireFile(
      survival === 1,
      "survival_report_document",
      "Survival report document required"
    );

    requireFile(
      wildlife === 1,
      "wildlife_mitigation_document",
      "Wildlife mitigation document required"
    );

    requireFile(
      safety === 1,
      "safety_zone_document",
      "Safety zone document required"
    );

    if (periodic === 1 && !body.periodic_compliance_type) {
      throw new Error("Periodic compliance type required");
    }

    if (
      body.inspection_observations === "Open" &&
      !body.inspection_remarks
    ) {
      throw new Error("Inspection remarks required when Open");
    }

    const postStatus = body.post_clearance_status;
    // const postStatus =
    //   completed === 1 &&
    //   survival === 1 &&
    //   safety === 1
    //     ? "Completed"
    //     : "Ongoing";

    const payload = {
      forest_project_id: body.forest_project_id,

      ca_plantation_started: started,
      ca_plantation_started_document: buildDocumentValue(
        files,
        "ca_plantation_started_document"
      ),

      ca_plantation_completed: completed,
      ca_plantation_completed_document: buildDocumentValue(
        files,
        "ca_plantation_completed_document"
      ),

      survival_report_submitted: survival,
      survival_report_document: buildDocumentValue(files, "survival_report_document"),

      wildlife_mitigation: wildlife,
      wildlife_mitigation_document: buildDocumentValue(
        files,
        "wildlife_mitigation_document"
      ),

      safety_zone_maintained: safety,
      safety_zone_document: buildDocumentValue(files, "safety_zone_document"),

      periodic_compliance_submitted: periodic,
      periodic_compliance_type:
        periodic === 1 ? body.periodic_compliance_type : null,

      inspection_observations: body.inspection_observations || null,
      inspection_remarks:
        body.inspection_observations === "Open"
          ? body.inspection_remarks
          : null,

      post_clearance_status: postStatus,
    };

    const result = await ForestLand.createPostClearance(payload);

    return res.status(201).json({
      success: true,
      message: "Post-clearance data saved successfully",
      data: result,
    });
  } catch (err) {
    console.error("PostClearance Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const updateStage0 = async (req, res) => {
  try {
    const forestProjectId = req.params.forest_project_id;
    const body = req.body || {};
    const files = req.files || {};

    if (!forestProjectId) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const existing = await ForestLand.getStage0ByProjectId(forestProjectId);
    const isNewRecord = !existing;
    const existingData = existing || {};

    const dgpsSurveyDone =
      body.dgps_survey_done !== undefined
        ? Number(body.dgps_survey_done)
        : Number(existingData.dgps_survey_done || 0);
    const orsacAuth =
      body.orsac_authentication !== undefined
        ? Number(body.orsac_authentication)
        : Number(existingData.orsac_authentication || 0);
    const treeEnum =
      body.tree_enumeration_done !== undefined
        ? Number(body.tree_enumeration_done)
        : Number(existingData.tree_enumeration_done || 0);
    const adminDocs =
      body.administrative_documents !== undefined
        ? Number(body.administrative_documents)
        : Number(existingData.administrative_documents || 0);
    const legalLease =
      body.legal_lease_documents !== undefined
        ? Number(body.legal_lease_documents)
        : Number(existingData.legal_lease_documents || 0);
    const technicalData =
      body.technical_data !== undefined
        ? Number(body.technical_data)
        : Number(existingData.technical_data || 0);
    const caPlanning =
      body.ca_ca_planning !== undefined
        ? Number(body.ca_ca_planning)
        : Number(existingData.ca_ca_planning || 0);
    const proposalSubmitted =
      body.proposal_submitted !== undefined
        ? Number(body.proposal_submitted)
        : Number(existingData.proposal_submitted || 0);

    const stageStatus = proposalSubmitted === 1 ? "Ready" : "Ongoing";

   const resolveFile = (field, existingValue) => {
  let existingDocs = normalizeDocumentList(existingValue);

  const incomingExisting = req.body[`${field}_existing`];

  if (incomingExisting) {
    try {
      existingDocs = JSON.parse(incomingExisting);
    } catch {}
  }

  return buildDocumentValue(files, field, existingDocs);
};

    const requireFile = (condition, fileValue, message) => {
      if (condition && !hasAnyDocuments(fileValue)) {
        throw new Error(message);
      }
    };

    const dgpsDocument = resolveFile("dgps_document", existingData.dgps_document);
    const orsacDocument = resolveFile(
      "orsac_document",
      existingData.orsac_document
    );
    const treeEnumerationDocument = resolveFile(
      "tree_enumeration_document",
      existingData.tree_enumeration_document
    );
    const administrativeDocument = resolveFile(
      "administrative_document",
      existingData.administrative_document
    );
    const legalLeaseDocument = resolveFile(
      "legal_lease_document",
      existingData.legal_lease_document
    );
    const technicalDocument = resolveFile(
      "technical_document",
      existingData.technical_document
    );
    const forestLandDetailsDocument = resolveFile(
      "forest_land_details_document",
      existingData.forest_land_details_document
    );
    const caCaDocument = resolveFile("ca_ca_document", existingData.ca_ca_document);
    const fraDocument = resolveFile("fra_document", existingData.fra_document);
    const environmentalDocument = resolveFile(
      "environmental_document",
      existingData.environmental_document
    );
    const wildlifeDocument = resolveFile(
      "wildlife_document",
      existingData.wildlife_document
    );
    const mapsDocument = resolveFile("maps_document", existingData.maps_document);
    const financialDocument = resolveFile(
      "financial_document",
      existingData.financial_document
    );
    const proposalDocument = resolveFile(
      "proposal_document",
      existingData.proposal_document
    );

    requireFile(dgpsSurveyDone === 1, dgpsDocument, "DGPS document required");
    requireFile(orsacAuth === 1, orsacDocument, "ORSAC document required");
    requireFile(treeEnum === 1, treeEnumerationDocument, "Tree enumeration document required");
    requireFile(adminDocs === 1, administrativeDocument, "Administrative document required");
    requireFile(legalLease === 1, legalLeaseDocument, "Legal & Lease document required");
    requireFile(technicalData === 1, technicalDocument, "Technical document required");
    requireFile(
      (body.forest_land_details || existingData.forest_land_details) === "Uploaded",
      forestLandDetailsDocument,
      "Forest land details document required"
    );
    requireFile(caPlanning === 1, caCaDocument, "CA/CA Planning document required");
    requireFile(
      (body.fra_records || existingData.fra_records) === "Completed",
      fraDocument,
      "FRA document required"
    );
    requireFile(
      (body.environmental_statutory || existingData.environmental_statutory) === "Cleared",
      environmentalDocument,
      "Environmental document required"
    );
    requireFile(
      (body.wildlife_safeguards || existingData.wildlife_safeguards) === "Completed",
      wildlifeDocument,
      "Wildlife document required"
    );
    requireFile(
      (body.maps_spatial_evidence || existingData.maps_spatial_evidence) === "Authenticated",
      mapsDocument,
      "Maps document required"
    );
    requireFile(
      (body.financial_undertakings || existingData.financial_undertakings) === "Submitted",
      financialDocument,
      "Financial document required"
    );
    requireFile(proposalSubmitted === 1, proposalDocument, "Proposal document required");

    const payload = {
      forest_project_id: forestProjectId,
      dgps_survey_done: dgpsSurveyDone,
      dgps_area_ha:
        body.dgps_area_ha !== undefined
          ? body.dgps_area_ha
          : existingData.dgps_area_ha,
      dgps_document: dgpsDocument,
      orsac_authentication: orsacAuth,
      orsac_document: orsacDocument,
      tree_enumeration_done: treeEnum,
      tree_enumeration_document: treeEnumerationDocument,
      administrative_documents: adminDocs,
      administrative_document: administrativeDocument,
      legal_lease_documents: legalLease,
      legal_lease_document: legalLeaseDocument,
      technical_data: technicalData,
      technical_document: technicalDocument,
      forest_land_details:
        body.forest_land_details !== undefined
          ? body.forest_land_details
          : existingData.forest_land_details,
      forest_land_details_document: forestLandDetailsDocument,
      ca_ca_planning: caPlanning,
      ca_ca_document: caCaDocument,
      fra_records:
        body.fra_records !== undefined ? body.fra_records : existingData.fra_records,
      fra_document: fraDocument,
      environmental_statutory:
        body.environmental_statutory !== undefined
          ? body.environmental_statutory
          : existingData.environmental_statutory,
      environmental_document: environmentalDocument,
      wildlife_safeguards:
        body.wildlife_safeguards !== undefined
          ? body.wildlife_safeguards
          : existingData.wildlife_safeguards,
      wildlife_document: wildlifeDocument,
      maps_spatial_evidence:
        body.maps_spatial_evidence !== undefined
          ? body.maps_spatial_evidence
          : existingData.maps_spatial_evidence,
      maps_document: mapsDocument,
      financial_undertakings:
        body.financial_undertakings !== undefined
          ? body.financial_undertakings
          : existingData.financial_undertakings,
      financial_document: financialDocument,
      proposal_submitted: proposalSubmitted,
      proposal_document: proposalDocument,
      parivesh_proposal_no:
        body.parivesh_proposal_no !== undefined
          ? body.parivesh_proposal_no
          : existingData.parivesh_proposal_no,
      submission_date:
        body.submission_date !== undefined
          ? body.submission_date
          : existingData.submission_date,
      stage_0_status: stageStatus,
    };

    const result = isNewRecord
      ? await ForestLand.createStage0(payload)
      : await ForestLand.updateStage0(forestProjectId, payload);

    return res.status(isNewRecord ? 201 : 200).json({
      success: true,
      message: isNewRecord
        ? "Stage-0 data saved successfully"
        : "Stage-0 data updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Stage0 Update Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const updateStage1 = async (req, res) => {
  try {
    const forestProjectId = req.params.forest_project_id;
    const body = req.body || {};
    const files = req.files || {};

    if (!forestProjectId) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const existing = await ForestLand.getStage1ByProjectId(forestProjectId);
    const isNewRecord = !existing;
    const existingData = existing || {};

    const conditionsExtracted =
      body.stage1_conditions_extracted !== undefined
        ? Number(body.stage1_conditions_extracted)
        : Number(existingData.stage1_conditions_extracted || 0);
    const caLandHandedOver =
      body.ca_land_handed_over !== undefined
        ? Number(body.ca_land_handed_over)
        : Number(existingData.ca_land_handed_over || 0);
    const stage1Accepted =
      body.stage1_compliance_accepted !== undefined
        ? Number(body.stage1_compliance_accepted)
        : Number(existingData.stage1_compliance_accepted || 0);

    const eligibleForStage2 = stage1Accepted === 1 ? 1 : 0;
    const stage1Status = stage1Accepted === 1 ? "Completed" : "Pending";

    const resolveFile = (field, existingValue) =>
      buildDocumentValue(files, field, existingValue);

    const requireFile = (condition, fileValue, message) => {
      if (condition && !hasAnyDocuments(fileValue)) {
        throw new Error(message);
      }
    };

    const stage1ApprovalDocument = resolveFile(
      "stage1_approval_document",
      existingData.stage1_approval_document
    );
    const stage1ConditionsDocument = resolveFile(
      "stage1_conditions_document",
      existingData.stage1_conditions_document
    );
    const caLandDocument = resolveFile("ca_land_document", existingData.ca_land_document);
    const fraDocument = resolveFile("fra_document", existingData.fra_document);
    const npvDocument = resolveFile("npv_document", existingData.npv_document);
    const caPaymentDocument = resolveFile(
      "ca_payment_document",
      existingData.ca_payment_document
    );
    const acaPaymentDocument = resolveFile(
      "aca_payment_document",
      existingData.aca_payment_document
    );
    const wildlifeDocument = resolveFile(
      "wildlife_payment_document",
      existingData.wildlife_payment_document
    );
    const technicalDocument = resolveFile("technical_document", existingData.technical_document);
    const stage1AcceptanceDocument = resolveFile(
      "stage1_acceptance_document",
      existingData.stage1_acceptance_document
    );

    requireFile(
      (body.stage1_approval_letter || existingData.stage1_approval_letter) === "Uploaded",
      stage1ApprovalDocument,
      "Stage-1 approval document required"
    );
    requireFile(
      conditionsExtracted === 1,
      stage1ConditionsDocument,
      "Stage-1 conditions document required"
    );
    requireFile(caLandHandedOver === 1, caLandDocument, "CA land document required");
    requireFile(
      (body.fra_compliance || existingData.fra_compliance) === "Complied",
      fraDocument,
      "FRA document required"
    );
    requireFile(
      (body.npv_payment || existingData.npv_payment) === "Paid",
      npvDocument,
      "NPV payment document required"
    );
    requireFile(
      (body.ca_payment || existingData.ca_payment) === "Paid",
      caPaymentDocument,
      "CA payment document required"
    );
    requireFile(
      (body.aca_payment || existingData.aca_payment) === "Paid",
      acaPaymentDocument,
      "ACA payment document required"
    );
    requireFile(
      (body.wildlife_payment || existingData.wildlife_payment) === "Paid",
      wildlifeDocument,
      "Wildlife payment document required"
    );
    requireFile(
      (body.technical_compliance || existingData.technical_compliance) === "Completed",
      technicalDocument,
      "Technical compliance document required"
    );
    requireFile(stage1Accepted === 1, stage1AcceptanceDocument, "Stage-1 acceptance document required");

    const payload = {
      forest_project_id: forestProjectId,
      stage1_approval_letter:
        body.stage1_approval_letter !== undefined
          ? body.stage1_approval_letter
          : existingData.stage1_approval_letter,
      stage1_approval_document: stage1ApprovalDocument,
      stage1_conditions_extracted: conditionsExtracted,
      stage1_conditions_document: stage1ConditionsDocument,
      ca_land_handed_over: caLandHandedOver,
      ca_land_document: caLandDocument,
      fra_compliance:
        body.fra_compliance !== undefined ? body.fra_compliance : existingData.fra_compliance,
      fra_document: fraDocument,
      npv_payment: body.npv_payment !== undefined ? body.npv_payment : existingData.npv_payment,
      npv_document: npvDocument,
      ca_payment: body.ca_payment !== undefined ? body.ca_payment : existingData.ca_payment,
      ca_payment_document: caPaymentDocument,
      aca_payment: body.aca_payment !== undefined ? body.aca_payment : existingData.aca_payment,
      aca_payment_document: acaPaymentDocument,
      wildlife_payment:
        body.wildlife_payment !== undefined
          ? body.wildlife_payment
          : existingData.wildlife_payment,
      wildlife_payment_document: wildlifeDocument,
      technical_compliance:
        body.technical_compliance !== undefined
          ? body.technical_compliance
          : existingData.technical_compliance,
      technical_document: technicalDocument,
      stage1_compliance_accepted: stage1Accepted,
      stage1_acceptance_document: stage1AcceptanceDocument,
      eligible_for_stage2: eligibleForStage2,
      stage1_status: stage1Status,
    };

    const result = await ForestLand.insertUpdateStage1(payload);

    return res.status(isNewRecord ? 201 : 200).json({
      success: true,
      message: isNewRecord
        ? "Stage-1 data saved successfully"
        : "Stage-1 data updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Stage1 Update Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const updateStage2 = async (req, res) => {
  try {
    const forestProjectId = req.params.forest_project_id;
    const body = req.body || {};
    const files = req.files || {};

    if (!forestProjectId) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const existing = await ForestLand.getStage2ByProjectId(forestProjectId);
    const isNewRecord = !existing;
    const existingData = existing || {};

    const stage2Letter =
      body.stage2_approval_letter !== undefined
        ? Number(body.stage2_approval_letter)
        : Number(existingData.stage2_approval_letter || 0);
    const mapsApproved =
      body.final_maps_approved !== undefined
        ? Number(body.final_maps_approved)
        : Number(existingData.final_maps_approved || 0);

    const stage2Status = stage2Letter === 1 ? "Granted" : "Not Granted";
    const eligiblePostClearance = stage2Status === "Granted" ? 1 : 0;

    const resolveFile = (field, existingValue) =>
      buildDocumentValue(files, field, existingValue);

    const requireFile = (condition, fileValue, message) => {
      if (condition && !hasAnyDocuments(fileValue)) {
        throw new Error(message);
      }
    };

    const environmentalDocument = resolveFile(
      "environmental_document",
      existingData.environmental_document
    );
    const nbwlDocument = resolveFile("nbwl_document", existingData.nbwl_document);
    const finalCaDocument = resolveFile("final_ca_document", existingData.final_ca_document);
    const finalMapsDocument = resolveFile("final_maps_document", existingData.final_maps_document);
    const technicalDocument = resolveFile("final_technical_document", existingData.final_technical_document);
    const stage2ApprovalDocument = resolveFile(
      "stage2_approval_document",
      existingData.stage2_approval_document
    );

    requireFile(
      (body.environmental_clearance || existingData.environmental_clearance) === "Obtained",
      environmentalDocument,
      "Environmental clearance document required"
    );
    requireFile(
      (body.nbwl_clearance || existingData.nbwl_clearance) === "Obtained",
      nbwlDocument,
      "NBWL document required"
    );
    requireFile(
      (body.final_ca_execution || existingData.final_ca_execution) === "Completed",
      finalCaDocument,
      "Final CA document required"
    );
    requireFile(mapsApproved === 1, finalMapsDocument, "Final maps document required");
    requireFile(
      (body.final_technical_approval || existingData.final_technical_approval) === "Completed",
      technicalDocument,
      "Final technical document required"
    );
    requireFile(stage2Letter === 1, stage2ApprovalDocument, "Stage-II approval document required");

    const payload = {
      forest_project_id: forestProjectId,
      environmental_clearance:
        body.environmental_clearance !== undefined
          ? body.environmental_clearance
          : existingData.environmental_clearance,
      environmental_document: environmentalDocument,
      nbwl_clearance:
        body.nbwl_clearance !== undefined
          ? body.nbwl_clearance
          : existingData.nbwl_clearance,
      nbwl_document: nbwlDocument,
      final_ca_execution:
        body.final_ca_execution !== undefined
          ? body.final_ca_execution
          : existingData.final_ca_execution,
      final_ca_document: finalCaDocument,
      final_maps_approved: mapsApproved,
      final_maps_document: finalMapsDocument,
      final_technical_approval:
        body.final_technical_approval !== undefined
          ? body.final_technical_approval
          : existingData.final_technical_approval,
      final_technical_document: technicalDocument,
      stage2_approval_letter: stage2Letter,
      stage2_approval_document: stage2ApprovalDocument,
      stage2_approval_date:
        body.stage2_approval_date !== undefined
          ? body.stage2_approval_date
          : existingData.stage2_approval_date,
      approved_forest_area_ha:
        body.approved_forest_area_ha !== undefined
          ? body.approved_forest_area_ha
          : existingData.approved_forest_area_ha,
      approved_non_forest_area_ha:
        body.approved_non_forest_area_ha !== undefined
          ? body.approved_non_forest_area_ha
          : existingData.approved_non_forest_area_ha,
      stage2_status: stage2Status,
      eligible_post_clearance: eligiblePostClearance,
    };

    const result = isNewRecord
      ? await ForestLand.createStage2(payload)
      : await ForestLand.updateStage2(forestProjectId, payload);

    return res.status(isNewRecord ? 201 : 200).json({
      success: true,
      message: isNewRecord
        ? "Stage-2 data saved successfully"
        : "Stage-2 data updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("Stage2 Update Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const updatePostClearance = async (req, res) => {
  try {
    const forestProjectId = req.params.forest_project_id;
    const body = req.body || {};
    const files = req.files || {};

    if (!forestProjectId) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const existing = await ForestLand.getPostClearanceByProjectId(forestProjectId);
    const isNewRecord = !existing;
    const existingData = existing || {};

    const started =
      body.ca_plantation_started !== undefined
        ? Number(body.ca_plantation_started)
        : Number(existingData.ca_plantation_started || 0);
    const completed =
      body.ca_plantation_completed !== undefined
        ? Number(body.ca_plantation_completed)
        : Number(existingData.ca_plantation_completed || 0);
    const survival =
      body.survival_report_submitted !== undefined
        ? Number(body.survival_report_submitted)
        : Number(existingData.survival_report_submitted || 0);
    const wildlife =
      body.wildlife_mitigation !== undefined
        ? Number(body.wildlife_mitigation)
        : Number(existingData.wildlife_mitigation || 0);
    const safety =
      body.safety_zone_maintained !== undefined
        ? Number(body.safety_zone_maintained)
        : Number(existingData.safety_zone_maintained || 0);
    const periodic =
      body.periodic_compliance_submitted !== undefined
        ? Number(body.periodic_compliance_submitted)
        : Number(existingData.periodic_compliance_submitted || 0);

    const resolveFile = (field, existingValue) =>
      buildDocumentValue(files, field, existingValue);

    const requireFile = (condition, fileValue, message) => {
      if (condition && !hasAnyDocuments(fileValue)) {
        throw new Error(message);
      }
    };

    const startedDoc = resolveFile(
      "ca_plantation_started_document",
      existingData.ca_plantation_started_document
    );
    const completedDoc = resolveFile(
      "ca_plantation_completed_document",
      existingData.ca_plantation_completed_document
    );
    const survivalDoc = resolveFile(
      "survival_report_document",
      existingData.survival_report_document
    );
    const wildlifeDoc = resolveFile(
      "wildlife_mitigation_document",
      existingData.wildlife_mitigation_document
    );
    const safetyDoc = resolveFile("safety_zone_document", existingData.safety_zone_document);

    requireFile(started === 1, startedDoc, "CA plantation started document required");
    requireFile(completed === 1, completedDoc, "CA plantation completed document required");
    requireFile(survival === 1, survivalDoc, "Survival report document required");
    requireFile(wildlife === 1, wildlifeDoc, "Wildlife mitigation document required");
    requireFile(safety === 1, safetyDoc, "Safety zone document required");

    if (periodic === 1 && !(body.periodic_compliance_type || existingData.periodic_compliance_type)) {
      throw new Error("Periodic compliance type required");
    }

    const inspectionObservations =
      body.inspection_observations !== undefined
        ? body.inspection_observations
        : existingData.inspection_observations;
    const inspectionRemarks =
      inspectionObservations === "Open"
        ? (body.inspection_remarks || existingData.inspection_remarks)
        : null;

    if (inspectionObservations === "Open" && !inspectionRemarks) {
      throw new Error("Inspection remarks required when Open");
    }

    const postStatus =
      body.post_clearance_status !== undefined
        ? body.post_clearance_status
        : existingData.post_clearance_status;

    const payload = {
      forest_project_id: forestProjectId,
      ca_plantation_started: started,
      ca_plantation_started_document: startedDoc,
      ca_plantation_completed: completed,
      ca_plantation_completed_document: completedDoc,
      survival_report_submitted: survival,
      survival_report_document: survivalDoc,
      wildlife_mitigation: wildlife,
      wildlife_mitigation_document: wildlifeDoc,
      safety_zone_maintained: safety,
      safety_zone_document: safetyDoc,
      periodic_compliance_submitted: periodic,
      periodic_compliance_type:
        periodic === 1
          ? body.periodic_compliance_type || existingData.periodic_compliance_type
          : null,
      inspection_observations: inspectionObservations,
      inspection_remarks: inspectionRemarks,
      post_clearance_status: postStatus,
    };

    const result = isNewRecord
      ? await ForestLand.createPostClearance(payload)
      : await ForestLand.updatePostClearance(forestProjectId, payload);

    return res.status(isNewRecord ? 201 : 200).json({
      success: true,
      message: isNewRecord
        ? "Post-clearance data saved successfully"
        : "Post-clearance data updated successfully",
      data: result,
    });
  } catch (err) {
    console.error("PostClearance Update Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};


const getStageStatus = async (req, res) => {
  try {
    const { project_id, stage } = req.params;

    if (!project_id || !stage) {
      return res.status(400).json({
        success: false,
        message: "project_id and stage are required",
      });
    }

    const status = await ForestLand.getStageStatus(project_id, stage);

    if (!status) {
      return res.json({
        success: true,
        stage_status: null,
        message: "No data found for this stage",
      });
    }

    return res.json({
      success: true,
      stage_status: status,
    });
  } catch (err) {
    console.error("Stage Status Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

const getMasterDashboard = async (req, res) => {
  try {
    const data = await ForestLand.getDashboardSummary();

    return res.json({
      success: true,
      message: "Forest land master dashboard fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
const getStage0 = async (req, res) => {
  try {
    const { forest_project_id } = req.params;

    if (!forest_project_id) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const data = await ForestLand.getStage0ByProjectId(forest_project_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Stage-0 data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stage-0 data fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Get Stage0 Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
const getStage1 = async (req, res) => {
  try {
    const { forest_project_id } = req.params;

    if (!forest_project_id) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const data = await ForestLand.getStage1ByProjectId(forest_project_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Stage-1 data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stage-1 data fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Get Stage1 Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
const getStage2 = async (req, res) => {
  try {
    const { forest_project_id } = req.params;

    if (!forest_project_id) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const data = await ForestLand.getStage2ByProjectId(forest_project_id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Stage-2 data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Stage-2 data fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Get Stage2 Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};
const getPostClearance = async (req, res) => {
  try {
    const { forest_project_id } = req.params;

    if (!forest_project_id) {
      return res.status(400).json({
        success: false,
        message: "forest_project_id is required",
      });
    }

    const data = await ForestLand.getPostClearanceByProjectId(
      forest_project_id
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Post-clearance data not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Post-clearance data fetched successfully",
      data,
    });
  } catch (err) {
    console.error("Get PostClearance Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || "Server error",
    });
  }
};

module.exports = {
  uploadForestLandSchedule,
  addForestLand,
  updateForestLand,
  forestLandList,
  forestLandDocumentList,
  forestLandDocumentDelete,
  deleteForestLand,
  forestLandAbstract,
  // addForestProject,
  addForestProjectWithEds,
  getForestProjectWithEds,
  forestProjectList,
  updateForestProject,
  deleteForestProject,
  addStage0,
  addStage1,
  addStage2,
  addPostClearance,
  getStageStatus,
  getMasterDashboard,
  updateStage0,
  updateStage1,
  updateStage2,
  updatePostClearance,
  getStageStatus,
  getMasterDashboard,
  getStage0,
  getStage1,
  getStage2,
  getPostClearance,
};

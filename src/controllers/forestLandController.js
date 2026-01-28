const ForestLand = require("../models/forestLandModel");
const logAction = require("../utils/logger");
const fs = require("fs");
const path = require("path");

// validation helpers
// const validateForestArea = (d) =>
//   d.forest_category_id && d.forest_division && d.forest_range;

// const validateNonForest = (d) => d.ownership && d.fra_allotted !== undefined;

// const validateCA = (d) => d.ca_area_ha && d.patch_name;

const addForestLand = async (req, res) => {
  const userId = req.user.id;

  try {
    const { schedule_type } = req.body;

    if (!schedule_type) {
      return res.status(400).json({
        success: false,
        message: "Schedule type is required",
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
      schedule_type,
      page = 1,
      limit = 10,
    } = req.query;

    if (!project_master_id || !schedule_type) {
      return res.status(400).json({
        success: false,
        message: "Project master id and schedule type is required",
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

const updateForestLand = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  try {
    const { schedule_type } = req.body;

    if (!schedule_type) {
      return res.status(400).json({
        success: false,
        message: "Schedule type is required",
      });
    }

    const updatedData = await ForestLand.update(id, req.body);

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
      req.body,
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
      req.body,
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
    const { project_master_id } = req.query;

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


const addForestProject = async (req, res) => {
  try {
    const {
      project_id,
      project_name,
      eds_flag
    } = req.body;

    // Basic required fields
    if (!project_id || !project_name) {
      return res.status(400).json({
        success: false,
        message: "project_id and project_name are required",
      });
    }

    // Convert eds_flag to number
    const edsFlag = Number(eds_flag);

    // RULE 1: eds_flag = 1 → document mandatory
    if (edsFlag === 1 && !req.file) {
      return res.status(400).json({
        success: false,
        message: "EDS document is required when EDS flag is Yes",
      });
    }

    // RULE 2: eds_flag = 0 → document should not be uploaded
    if (edsFlag === 0 && req.file) {
      return res.status(400).json({
        success: false,
        message: "EDS document should not be uploaded when EDS flag is No",
      });
    }

    const payload = {
      ...req.body,
      eds_flag: edsFlag,
      eds_document_path: req.file ? req.file.path : null,
    };

    const project = await ForestLand.createForestProject(payload);

    return res.status(201).json({
      success: true,
      message: "Forest Project created successfully",
      data: project,
    });
  } catch (err) {
    console.error(err);
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
  const userId = req.user.id;
  try {
    const masterProjectId = req.params.id;
    const edsFlag = Number(req.body.eds_flag);

    // Fetch existing project
    const existing = await ForestLand.getForestProjectById(masterProjectId);
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Forest project not found",
      });
    }

    // If eds_flag = 1 then document required (existing or new)
    if (edsFlag === 1 && !req.file && !existing.eds_document_path) {
      return res.status(400).json({
        success: false,
        message: "EDS document is required when EDS flag is Yes",
      });
    }

    // If new document uploaded & old document exists then delete old
    if (existing.eds_document_path && (edsFlag === 0 || (edsFlag === 1 && req.file))
    ) {
      const oldPath = path.join(
        process.cwd(), //project root
        existing.eds_document_path
      );

      // console.log("Deleting file:", oldPath);

      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      } else {
        console.log("File not found:", oldPath);
      }
    }

    // If eds_flag = 0 then document not allowed
    if (edsFlag === 0 && req.file) {
      return res.status(400).json({
        success: false,
        message: "EDS document should not be uploaded when EDS flag is No",
      });
    }

    const payload = {
      proposal_no: req.body.proposal_no,
      project_name: req.body.project_name,
      user_agency: req.body.user_agency,
      sector: req.body.sector,
      state: req.body.state,
      district: req.body.district,
      tahasil: req.body.tahasil,
      mouza: req.body.mouza,
      range_division: req.body.range_division,
      forest_type: req.body.forest_type,
      total_project_area_ha: req.body.total_project_area_ha,
      forest_area_ha: req.body.forest_area_ha,
      non_forest_area_ha: req.body.non_forest_area_ha,
      project_status: req.body.project_status,
      current_stage: req.body.current_stage,
      eds_flag: edsFlag,

      // document logic
      eds_document_path:
        edsFlag === 1
          ? req.file
            ? req.file.path
            : existing.eds_document_path
          : null,
    };

    const updatedProject = await ForestLand.updateForestProject(
      masterProjectId,
      payload
    );

    await logAction(
      userId,
      "update forest project",
      "success",
      "Forest project updated",
      payload,
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

module.exports = {
  addForestLand,
  updateForestLand,
  forestLandList,
  deleteForestLand,
  forestLandAbstract,
  addForestProject,
  forestProjectList,
  updateForestProject,
  deleteForestProject
};

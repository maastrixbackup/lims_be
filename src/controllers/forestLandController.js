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

// const getForestProjectWithEds = async (req, res) => {
//   try {
//     const { projectId } = req.params;

//     const data = await ForestLand.getProjectWithEds(projectId);

//     if (!data) {
//       return res.status(404).json({
//         success: false,
//         message: "Data not found for this project",
//       });
//     }

//     return res.json({
//       success: true,
//       data,
//     });
//   } catch (err) {
//     console.error("Fetch Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: err.message || "Server error",
//     });
//   }
// };

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
      if (condition && !files[field]?.[0]) {
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
      dgps_document: files.dgps_document?.[0]?.filename || null,

      orsac_authentication: orsacAuth,
      orsac_document: files.orsac_document?.[0]?.filename || null,

      tree_enumeration_done: treeEnum,
      tree_enumeration_document:
        files.tree_enumeration_document?.[0]?.filename || null,

      administrative_documents: adminDocs,
      administrative_document:
        files.administrative_document?.[0]?.filename || null,

      legal_lease_documents: legalLease,
      legal_lease_document:
        files.legal_lease_document?.[0]?.filename || null,

      technical_data: technicalData,
      technical_document: files.technical_document?.[0]?.filename || null,

      forest_land_details: body.forest_land_details || null,
      forest_land_details_document:
        files.forest_land_details_document?.[0]?.filename || null,

      ca_ca_planning: caPlanning,
      ca_ca_document: files.ca_ca_document?.[0]?.filename || null,

      fra_records: body.fra_records || null,
      fra_document: files.fra_document?.[0]?.filename || null,

      environmental_statutory: body.environmental_statutory || null,
      environmental_document:
        files.environmental_document?.[0]?.filename || null,

      wildlife_safeguards: body.wildlife_safeguards || null,
      wildlife_document: files.wildlife_document?.[0]?.filename || null,

      maps_spatial_evidence: body.maps_spatial_evidence || null,
      maps_document: files.maps_document?.[0]?.filename || null,

      financial_undertakings: body.financial_undertakings || null,
      financial_document: files.financial_document?.[0]?.filename || null,

      proposal_submitted: proposalSubmitted,
      proposal_document: files.proposal_document?.[0]?.filename || null,

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
      if (condition && !files[field]?.[0]) {
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
      stage1_approval_document:
        files.stage1_approval_document?.[0]?.filename || null,

      stage1_conditions_extracted: conditionsExtracted,
      stage1_conditions_document:
        files.stage1_conditions_document?.[0]?.filename || null,

      ca_land_handed_over: caLandHandedOver,
      ca_land_document:
        files.ca_land_document?.[0]?.filename || null,

      fra_compliance: body.fra_compliance || null,
      fra_document: files.fra_document?.[0]?.filename || null,

      npv_payment: body.npv_payment || null,
      npv_document: files.npv_document?.[0]?.filename || null,

      ca_payment: body.ca_payment || null,
      ca_payment_document:
        files.ca_payment_document?.[0]?.filename || null,

      aca_payment: body.aca_payment || null,
      aca_payment_document:
        files.aca_payment_document?.[0]?.filename || null,

      wildlife_payment: body.wildlife_payment || null,
      wildlife_payment_document:
        files.wildlife_payment_document?.[0]?.filename || null,

      technical_compliance: body.technical_compliance || null,
      technical_document:
        files.technical_document?.[0]?.filename || null,

      stage1_compliance_accepted: stage1Accepted,
      stage1_acceptance_document:
        files.stage1_acceptance_document?.[0]?.filename || null,

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
      if (condition && !files[field]?.[0]) {
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
      environmental_document:
        files.environmental_document?.[0]?.filename || null,

      nbwl_clearance: body.nbwl_clearance || null,
      nbwl_document: files.nbwl_document?.[0]?.filename || null,

      final_ca_execution: body.final_ca_execution || null,
      final_ca_document:
        files.final_ca_document?.[0]?.filename || null,

      final_maps_approved: mapsApproved,
      final_maps_document:
        files.final_maps_document?.[0]?.filename || null,

      final_technical_approval:
        body.final_technical_approval || null,
      final_technical_document:
        files.final_technical_document?.[0]?.filename || null,

      stage2_approval_letter: stage2Letter,
      stage2_approval_document:
        files.stage2_approval_document?.[0]?.filename || null,

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
      if (condition && !files[field]?.[0]) {
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
      ca_plantation_started_document:
        files.ca_plantation_started_document?.[0]?.filename || null,

      ca_plantation_completed: completed,
      ca_plantation_completed_document:
        files.ca_plantation_completed_document?.[0]?.filename || null,

      survival_report_submitted: survival,
      survival_report_document:
        files.survival_report_document?.[0]?.filename || null,

      wildlife_mitigation: wildlife,
      wildlife_mitigation_document:
        files.wildlife_mitigation_document?.[0]?.filename || null,

      safety_zone_maintained: safety,
      safety_zone_document:
        files.safety_zone_document?.[0]?.filename || null,

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
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Stage-0 entry not found for this project",
      });
    }

    const dgpsSurveyDone =
      body.dgps_survey_done !== undefined
        ? Number(body.dgps_survey_done)
        : Number(existing.dgps_survey_done || 0);
    const orsacAuth =
      body.orsac_authentication !== undefined
        ? Number(body.orsac_authentication)
        : Number(existing.orsac_authentication || 0);
    const treeEnum =
      body.tree_enumeration_done !== undefined
        ? Number(body.tree_enumeration_done)
        : Number(existing.tree_enumeration_done || 0);
    const adminDocs =
      body.administrative_documents !== undefined
        ? Number(body.administrative_documents)
        : Number(existing.administrative_documents || 0);
    const legalLease =
      body.legal_lease_documents !== undefined
        ? Number(body.legal_lease_documents)
        : Number(existing.legal_lease_documents || 0);
    const technicalData =
      body.technical_data !== undefined
        ? Number(body.technical_data)
        : Number(existing.technical_data || 0);
    const caPlanning =
      body.ca_ca_planning !== undefined
        ? Number(body.ca_ca_planning)
        : Number(existing.ca_ca_planning || 0);
    const proposalSubmitted =
      body.proposal_submitted !== undefined
        ? Number(body.proposal_submitted)
        : Number(existing.proposal_submitted || 0);

    const stageStatus = proposalSubmitted === 1 ? "Ready" : "Ongoing";

    const resolveFile = (field, existingValue) =>
      files[field]?.[0]?.filename || existingValue || null;

    const requireFile = (condition, fileValue, message) => {
      if (condition && !fileValue) {
        throw new Error(message);
      }
    };

    const dgpsDocument = resolveFile("dgps_document", existing.dgps_document);
    const orsacDocument = resolveFile(
      "orsac_document",
      existing.orsac_document
    );
    const treeEnumerationDocument = resolveFile(
      "tree_enumeration_document",
      existing.tree_enumeration_document
    );
    const administrativeDocument = resolveFile(
      "administrative_document",
      existing.administrative_document
    );
    const legalLeaseDocument = resolveFile(
      "legal_lease_document",
      existing.legal_lease_document
    );
    const technicalDocument = resolveFile(
      "technical_document",
      existing.technical_document
    );
    const forestLandDetailsDocument = resolveFile(
      "forest_land_details_document",
      existing.forest_land_details_document
    );
    const caCaDocument = resolveFile("ca_ca_document", existing.ca_ca_document);
    const fraDocument = resolveFile("fra_document", existing.fra_document);
    const environmentalDocument = resolveFile(
      "environmental_document",
      existing.environmental_document
    );
    const wildlifeDocument = resolveFile(
      "wildlife_document",
      existing.wildlife_document
    );
    const mapsDocument = resolveFile("maps_document", existing.maps_document);
    const financialDocument = resolveFile(
      "financial_document",
      existing.financial_document
    );
    const proposalDocument = resolveFile(
      "proposal_document",
      existing.proposal_document
    );

    requireFile(dgpsSurveyDone === 1, dgpsDocument, "DGPS document required");
    requireFile(orsacAuth === 1, orsacDocument, "ORSAC document required");
    requireFile(treeEnum === 1, treeEnumerationDocument, "Tree enumeration document required");
    requireFile(adminDocs === 1, administrativeDocument, "Administrative document required");
    requireFile(legalLease === 1, legalLeaseDocument, "Legal & Lease document required");
    requireFile(technicalData === 1, technicalDocument, "Technical document required");
    requireFile(
      (body.forest_land_details || existing.forest_land_details) === "Uploaded",
      forestLandDetailsDocument,
      "Forest land details document required"
    );
    requireFile(caPlanning === 1, caCaDocument, "CA/CA Planning document required");
    requireFile(
      (body.fra_records || existing.fra_records) === "Completed",
      fraDocument,
      "FRA document required"
    );
    requireFile(
      (body.environmental_statutory || existing.environmental_statutory) === "Cleared",
      environmentalDocument,
      "Environmental document required"
    );
    requireFile(
      (body.wildlife_safeguards || existing.wildlife_safeguards) === "Completed",
      wildlifeDocument,
      "Wildlife document required"
    );
    requireFile(
      (body.maps_spatial_evidence || existing.maps_spatial_evidence) === "Authenticated",
      mapsDocument,
      "Maps document required"
    );
    requireFile(
      (body.financial_undertakings || existing.financial_undertakings) === "Submitted",
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
          : existing.dgps_area_ha,
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
          : existing.forest_land_details,
      forest_land_details_document: forestLandDetailsDocument,
      ca_ca_planning: caPlanning,
      ca_ca_document: caCaDocument,
      fra_records:
        body.fra_records !== undefined ? body.fra_records : existing.fra_records,
      fra_document: fraDocument,
      environmental_statutory:
        body.environmental_statutory !== undefined
          ? body.environmental_statutory
          : existing.environmental_statutory,
      environmental_document: environmentalDocument,
      wildlife_safeguards:
        body.wildlife_safeguards !== undefined
          ? body.wildlife_safeguards
          : existing.wildlife_safeguards,
      wildlife_document: wildlifeDocument,
      maps_spatial_evidence:
        body.maps_spatial_evidence !== undefined
          ? body.maps_spatial_evidence
          : existing.maps_spatial_evidence,
      maps_document: mapsDocument,
      financial_undertakings:
        body.financial_undertakings !== undefined
          ? body.financial_undertakings
          : existing.financial_undertakings,
      financial_document: financialDocument,
      proposal_submitted: proposalSubmitted,
      proposal_document: proposalDocument,
      parivesh_proposal_no:
        body.parivesh_proposal_no !== undefined
          ? body.parivesh_proposal_no
          : existing.parivesh_proposal_no,
      submission_date:
        body.submission_date !== undefined
          ? body.submission_date
          : existing.submission_date,
      stage_0_status: stageStatus,
    };

    const result = await ForestLand.updateStage0(forestProjectId, payload);

    return res.status(200).json({
      success: true,
      message: "Stage-0 data updated successfully",
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
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Stage-1 entry not found for this project",
      });
    }

    const conditionsExtracted =
      body.stage1_conditions_extracted !== undefined
        ? Number(body.stage1_conditions_extracted)
        : Number(existing.stage1_conditions_extracted || 0);
    const caLandHandedOver =
      body.ca_land_handed_over !== undefined
        ? Number(body.ca_land_handed_over)
        : Number(existing.ca_land_handed_over || 0);
    const stage1Accepted =
      body.stage1_compliance_accepted !== undefined
        ? Number(body.stage1_compliance_accepted)
        : Number(existing.stage1_compliance_accepted || 0);

    const eligibleForStage2 = stage1Accepted === 1 ? 1 : 0;
    const stage1Status = stage1Accepted === 1 ? "Completed" : "Pending";

    const resolveFile = (field, existingValue) =>
      files[field]?.[0]?.filename || existingValue || null;

    const requireFile = (condition, fileValue, message) => {
      if (condition && !fileValue) {
        throw new Error(message);
      }
    };

    const stage1ApprovalDocument = resolveFile(
      "stage1_approval_document",
      existing.stage1_approval_document
    );
    const stage1ConditionsDocument = resolveFile(
      "stage1_conditions_document",
      existing.stage1_conditions_document
    );
    const caLandDocument = resolveFile("ca_land_document", existing.ca_land_document);
    const fraDocument = resolveFile("fra_document", existing.fra_document);
    const npvDocument = resolveFile("npv_document", existing.npv_document);
    const caPaymentDocument = resolveFile(
      "ca_payment_document",
      existing.ca_payment_document
    );
    const acaPaymentDocument = resolveFile(
      "aca_payment_document",
      existing.aca_payment_document
    );
    const wildlifeDocument = resolveFile(
      "wildlife_payment_document",
      existing.wildlife_payment_document
    );
    const technicalDocument = resolveFile("technical_document", existing.technical_document);
    const stage1AcceptanceDocument = resolveFile(
      "stage1_acceptance_document",
      existing.stage1_acceptance_document
    );

    requireFile(
      (body.stage1_approval_letter || existing.stage1_approval_letter) === "Uploaded",
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
      (body.fra_compliance || existing.fra_compliance) === "Complied",
      fraDocument,
      "FRA document required"
    );
    requireFile(
      (body.npv_payment || existing.npv_payment) === "Paid",
      npvDocument,
      "NPV payment document required"
    );
    requireFile(
      (body.ca_payment || existing.ca_payment) === "Paid",
      caPaymentDocument,
      "CA payment document required"
    );
    requireFile(
      (body.aca_payment || existing.aca_payment) === "Paid",
      acaPaymentDocument,
      "ACA payment document required"
    );
    requireFile(
      (body.wildlife_payment || existing.wildlife_payment) === "Paid",
      wildlifeDocument,
      "Wildlife payment document required"
    );
    requireFile(
      (body.technical_compliance || existing.technical_compliance) === "Completed",
      technicalDocument,
      "Technical compliance document required"
    );
    requireFile(stage1Accepted === 1, stage1AcceptanceDocument, "Stage-1 acceptance document required");

    const payload = {
      forest_project_id: forestProjectId,
      stage1_approval_letter:
        body.stage1_approval_letter !== undefined
          ? body.stage1_approval_letter
          : existing.stage1_approval_letter,
      stage1_approval_document: stage1ApprovalDocument,
      stage1_conditions_extracted: conditionsExtracted,
      stage1_conditions_document: stage1ConditionsDocument,
      ca_land_handed_over: caLandHandedOver,
      ca_land_document: caLandDocument,
      fra_compliance:
        body.fra_compliance !== undefined ? body.fra_compliance : existing.fra_compliance,
      fra_document: fraDocument,
      npv_payment: body.npv_payment !== undefined ? body.npv_payment : existing.npv_payment,
      npv_document: npvDocument,
      ca_payment: body.ca_payment !== undefined ? body.ca_payment : existing.ca_payment,
      ca_payment_document: caPaymentDocument,
      aca_payment: body.aca_payment !== undefined ? body.aca_payment : existing.aca_payment,
      aca_payment_document: acaPaymentDocument,
      wildlife_payment:
        body.wildlife_payment !== undefined
          ? body.wildlife_payment
          : existing.wildlife_payment,
      wildlife_payment_document: wildlifeDocument,
      technical_compliance:
        body.technical_compliance !== undefined
          ? body.technical_compliance
          : existing.technical_compliance,
      technical_document: technicalDocument,
      stage1_compliance_accepted: stage1Accepted,
      stage1_acceptance_document: stage1AcceptanceDocument,
      eligible_for_stage2: eligibleForStage2,
      stage1_status: stage1Status,
    };

    const result = await ForestLand.insertUpdateStage1(payload);

    return res.status(200).json({
      success: true,
      message: "Stage-1 data updated successfully",
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
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Stage-2 entry not found for this project",
      });
    }

    const stage2Letter =
      body.stage2_approval_letter !== undefined
        ? Number(body.stage2_approval_letter)
        : Number(existing.stage2_approval_letter || 0);
    const mapsApproved =
      body.final_maps_approved !== undefined
        ? Number(body.final_maps_approved)
        : Number(existing.final_maps_approved || 0);

    const stage2Status = stage2Letter === 1 ? "Granted" : "Not Granted";
    const eligiblePostClearance = stage2Status === "Granted" ? 1 : 0;

    const resolveFile = (field, existingValue) =>
      files[field]?.[0]?.filename || existingValue || null;

    const requireFile = (condition, fileValue, message) => {
      if (condition && !fileValue) {
        throw new Error(message);
      }
    };

    const environmentalDocument = resolveFile(
      "environmental_document",
      existing.environmental_document
    );
    const nbwlDocument = resolveFile("nbwl_document", existing.nbwl_document);
    const finalCaDocument = resolveFile("final_ca_document", existing.final_ca_document);
    const finalMapsDocument = resolveFile("final_maps_document", existing.final_maps_document);
    const technicalDocument = resolveFile("final_technical_document", existing.final_technical_document);
    const stage2ApprovalDocument = resolveFile(
      "stage2_approval_document",
      existing.stage2_approval_document
    );

    requireFile(
      (body.environmental_clearance || existing.environmental_clearance) === "Obtained",
      environmentalDocument,
      "Environmental clearance document required"
    );
    requireFile(
      (body.nbwl_clearance || existing.nbwl_clearance) === "Obtained",
      nbwlDocument,
      "NBWL document required"
    );
    requireFile(
      (body.final_ca_execution || existing.final_ca_execution) === "Completed",
      finalCaDocument,
      "Final CA document required"
    );
    requireFile(mapsApproved === 1, finalMapsDocument, "Final maps document required");
    requireFile(
      (body.final_technical_approval || existing.final_technical_approval) === "Completed",
      technicalDocument,
      "Final technical document required"
    );
    requireFile(stage2Letter === 1, stage2ApprovalDocument, "Stage-II approval document required");

    const payload = {
      forest_project_id: forestProjectId,
      environmental_clearance:
        body.environmental_clearance !== undefined
          ? body.environmental_clearance
          : existing.environmental_clearance,
      environmental_document: environmentalDocument,
      nbwl_clearance:
        body.nbwl_clearance !== undefined
          ? body.nbwl_clearance
          : existing.nbwl_clearance,
      nbwl_document: nbwlDocument,
      final_ca_execution:
        body.final_ca_execution !== undefined
          ? body.final_ca_execution
          : existing.final_ca_execution,
      final_ca_document: finalCaDocument,
      final_maps_approved: mapsApproved,
      final_maps_document: finalMapsDocument,
      final_technical_approval:
        body.final_technical_approval !== undefined
          ? body.final_technical_approval
          : existing.final_technical_approval,
      final_technical_document: technicalDocument,
      stage2_approval_letter: stage2Letter,
      stage2_approval_document: stage2ApprovalDocument,
      stage2_approval_date:
        body.stage2_approval_date !== undefined
          ? body.stage2_approval_date
          : existing.stage2_approval_date,
      approved_forest_area_ha:
        body.approved_forest_area_ha !== undefined
          ? body.approved_forest_area_ha
          : existing.approved_forest_area_ha,
      approved_non_forest_area_ha:
        body.approved_non_forest_area_ha !== undefined
          ? body.approved_non_forest_area_ha
          : existing.approved_non_forest_area_ha,
      stage2_status: stage2Status,
      eligible_post_clearance: eligiblePostClearance,
    };

    const result = await ForestLand.updateStage2(forestProjectId, payload);

    return res.status(200).json({
      success: true,
      message: "Stage-2 data updated successfully",
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
    if (!existing) {
      return res.status(404).json({
        success: false,
        message: "Post-clearance entry not found for this project",
      });
    }

    const started =
      body.ca_plantation_started !== undefined
        ? Number(body.ca_plantation_started)
        : Number(existing.ca_plantation_started || 0);
    const completed =
      body.ca_plantation_completed !== undefined
        ? Number(body.ca_plantation_completed)
        : Number(existing.ca_plantation_completed || 0);
    const survival =
      body.survival_report_submitted !== undefined
        ? Number(body.survival_report_submitted)
        : Number(existing.survival_report_submitted || 0);
    const wildlife =
      body.wildlife_mitigation !== undefined
        ? Number(body.wildlife_mitigation)
        : Number(existing.wildlife_mitigation || 0);
    const safety =
      body.safety_zone_maintained !== undefined
        ? Number(body.safety_zone_maintained)
        : Number(existing.safety_zone_maintained || 0);
    const periodic =
      body.periodic_compliance_submitted !== undefined
        ? Number(body.periodic_compliance_submitted)
        : Number(existing.periodic_compliance_submitted || 0);

    const resolveFile = (field, existingValue) =>
      files[field]?.[0]?.filename || existingValue || null;

    const requireFile = (condition, fileValue, message) => {
      if (condition && !fileValue) {
        throw new Error(message);
      }
    };

    const startedDoc = resolveFile(
      "ca_plantation_started_document",
      existing.ca_plantation_started_document
    );
    const completedDoc = resolveFile(
      "ca_plantation_completed_document",
      existing.ca_plantation_completed_document
    );
    const survivalDoc = resolveFile(
      "survival_report_document",
      existing.survival_report_document
    );
    const wildlifeDoc = resolveFile(
      "wildlife_mitigation_document",
      existing.wildlife_mitigation_document
    );
    const safetyDoc = resolveFile("safety_zone_document", existing.safety_zone_document);

    requireFile(started === 1, startedDoc, "CA plantation started document required");
    requireFile(completed === 1, completedDoc, "CA plantation completed document required");
    requireFile(survival === 1, survivalDoc, "Survival report document required");
    requireFile(wildlife === 1, wildlifeDoc, "Wildlife mitigation document required");
    requireFile(safety === 1, safetyDoc, "Safety zone document required");

    if (periodic === 1 && !(body.periodic_compliance_type || existing.periodic_compliance_type)) {
      throw new Error("Periodic compliance type required");
    }

    const inspectionObservations =
      body.inspection_observations !== undefined
        ? body.inspection_observations
        : existing.inspection_observations;
    const inspectionRemarks =
      inspectionObservations === "Open"
        ? (body.inspection_remarks || existing.inspection_remarks)
        : null;

    if (inspectionObservations === "Open" && !inspectionRemarks) {
      throw new Error("Inspection remarks required when Open");
    }

    const postStatus =
      body.post_clearance_status !== undefined
        ? body.post_clearance_status
        : existing.post_clearance_status;

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
          ? body.periodic_compliance_type || existing.periodic_compliance_type
          : null,
      inspection_observations: inspectionObservations,
      inspection_remarks: inspectionRemarks,
      post_clearance_status: postStatus,
    };

    const result = await ForestLand.updatePostClearance(forestProjectId, payload);

    return res.status(200).json({
      success: true,
      message: "Post-clearance data updated successfully",
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
  addForestLand,
  updateForestLand,
  forestLandList,
  deleteForestLand,
  forestLandAbstract,
  // addForestProject,
  addForestProjectWithEds,
  // getForestProjectWithEds,
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

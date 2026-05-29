const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
    uploadForestLandSchedule,
    addForestLand,
    updateForestLand,
    forestLandList,
    forestLandDocumentList,
    forestLandDocumentDelete,
    deleteForestLand,
    // addForestProject,
    addForestProjectWithEds,
    forestLandAbstract,
    forestProjectList,
    updateForestProject,
    deleteForestProject,
    addStage0,
    addStage1,
    addStage2,
    addPostClearance,
    updateStage0,
    updateStage1,
    updateStage2,
    updatePostClearance,
    getForestProjectWithEds,
    getStageStatus,
    getMasterDashboard,
    getStage0,
    getStage1,
    getStage2,
    getPostClearance,
    serveForestStageDocument,
    downloadForestStageDocument,
    viewForestStageDocument
} = require("../controllers/forestLandController");

const {
    uploadEdsDocuments, uploadStage0, uploadStage1, uploadStage2, uploadPostClearance, uploadForestLandExcel
} = require("../middleware/upload");

const handleUpload = (uploadMiddleware, fileSizeMessage) => (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                success: false,
                message:
                    err.code === "LIMIT_FILE_SIZE"
                        ? fileSizeMessage
                        : err.message,
            });
        }

        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message || "File upload failed",
            });
        }

        next();
    });
};

router.post(
    "/uploadForestLandSchedule",
    handleUpload(
        uploadForestLandExcel.single("file"),
        "File size exceeds the 10MB limit for forest land Excel upload."
    ),
    uploadForestLandSchedule
);
router.post("/addForestLand", addForestLand);
router.put("/updateForestLand/:id", updateForestLand);
router.get("/forestLandList", forestLandList);
router.get("/forestLandDocumentList", forestLandDocumentList);
router.delete("/deleteForestLandDocument/:fileName", forestLandDocumentDelete);
router.delete("/deleteForestLand/:id", deleteForestLand);
router.get("/forestLandAbstract", forestLandAbstract);


// router.post("/addForestProject", addForestProject);
router.post(
    "/addForestProject",
    handleUpload(
        uploadEdsDocuments.array("eds_reply_document"),
        "File size exceeds the 10MB limit for EDS document upload."
    ),
    addForestProjectWithEds
);
router.post(
    "/forest-project",
    handleUpload(
        uploadEdsDocuments.any(),
        "File size exceeds the 10MB limit for EDS document upload."
    ), //for dynamic multiple EDS files
    addForestProjectWithEds
);
router.get("/forestProjectList", forestProjectList);
router.put(
    "/updateForestProject/:id",
    handleUpload(
        uploadEdsDocuments.any(),
        "File size exceeds the 10MB limit for EDS document upload."
    ),
    updateForestProject
);

router.delete("/deleteForestProject/:id", deleteForestProject);

router.post(
    "/addStage0",
    uploadStage0.fields([
        { name: "dgps_document", maxCount: 20},
        { name: "orsac_document", maxCount: 20},
        { name: "tree_enumeration_document", maxCount: 20},
        { name: "administrative_document", maxCount: 20},
        { name: "legal_lease_document", maxCount: 20},
        { name: "technical_document", maxCount: 20},
        { name: "forest_land_details_document", maxCount: 20},
        { name: "ca_ca_document", maxCount: 20},
        { name: "fra_document", maxCount: 20},
        { name: "environmental_document", maxCount: 20},
        { name: "wildlife_document", maxCount: 20},
        { name: "maps_document", maxCount: 20},
        { name: "financial_document", maxCount: 20},
        { name: "proposal_document", maxCount: 20},
    ]),
    addStage0
);

router.put(
    "/updateStage0/:forest_project_id",
    uploadStage0.fields([
        { name: "dgps_document", maxCount: 20},
        { name: "orsac_document", maxCount: 20},
        { name: "tree_enumeration_document", maxCount: 20},
        { name: "administrative_document", maxCount: 20},
        { name: "legal_lease_document", maxCount: 20},
        { name: "technical_document", maxCount: 20},
        { name: "forest_land_details_document", maxCount: 20},
        { name: "ca_ca_document", maxCount: 20},
        { name: "fra_document", maxCount: 20},
        { name: "environmental_document", maxCount: 20},
        { name: "wildlife_document", maxCount: 20},
        { name: "maps_document", maxCount: 20},
        { name: "financial_document", maxCount: 20},
        { name: "proposal_document", maxCount: 20},
    ]),
    updateStage0
);

router.post(
    "/addStage1",
    uploadStage1.fields([
        { name: "stage1_approval_document", maxCount: 20},
        { name: "stage1_conditions_document", maxCount: 20},
        { name: "ca_land_document", maxCount: 20},
        { name: "fra_document", maxCount: 20},
        { name: "npv_document", maxCount: 20},
        { name: "ca_payment_document", maxCount: 20},
        { name: "aca_payment_document", maxCount: 20},
        { name: "wildlife_payment_document", maxCount: 20},
        { name: "technical_document", maxCount: 20},
        { name: "stage1_acceptance_document", maxCount: 20},
    ]),
    addStage1
);

router.put(
    "/updateStage1/:forest_project_id",
    uploadStage1.fields([
        { name: "stage1_approval_document", maxCount: 20},
        { name: "stage1_conditions_document", maxCount: 20},
        { name: "ca_land_document", maxCount: 20},
        { name: "fra_document", maxCount: 20},
        { name: "npv_document", maxCount: 20},
        { name: "ca_payment_document", maxCount: 20},
        { name: "aca_payment_document", maxCount: 20},
        { name: "wildlife_payment_document", maxCount: 20},
        { name: "technical_document", maxCount: 20},
        { name: "stage1_acceptance_document", maxCount: 20},
    ]),
    updateStage1
);

router.post(
    "/addStage2",
    uploadStage2.fields([
        { name: "environmental_document", maxCount: 20},
        { name: "nbwl_document", maxCount: 20},
        { name: "final_ca_document", maxCount: 20},
        { name: "final_maps_document", maxCount: 20},
        { name: "final_technical_document", maxCount: 20},
        { name: "stage2_approval_document", maxCount: 20},
    ]),
    addStage2
);

router.put(
    "/updateStage2/:forest_project_id",
    uploadStage2.fields([
        { name: "environmental_document", maxCount: 20},
        { name: "nbwl_document", maxCount: 20},
        { name: "final_ca_document", maxCount: 20},
        { name: "final_maps_document", maxCount: 20},
        { name: "final_technical_document", maxCount: 20},
        { name: "stage2_approval_document", maxCount: 20},
    ]),
    updateStage2
);

router.post(
    "/postClearance",
    uploadPostClearance.fields([
        { name: "ca_plantation_started_document", maxCount: 20},
        { name: "ca_plantation_completed_document", maxCount: 20},
        { name: "survival_report_document", maxCount: 20},
        { name: "wildlife_mitigation_document", maxCount: 20},
        { name: "safety_zone_document", maxCount: 20},
    ]),
    addPostClearance
);

router.put(
    "/updatePostClearance/:forest_project_id",
    uploadPostClearance.fields([
        { name: "ca_plantation_started_document", maxCount: 20},
        { name: "ca_plantation_completed_document", maxCount: 20},
        { name: "survival_report_document", maxCount: 20},
        { name: "wildlife_mitigation_document", maxCount: 20},
        { name: "safety_zone_document", maxCount: 20},
    ]),
    updatePostClearance
);

router.get("/getForestProject/:projectId", getForestProjectWithEds);
router.get("/getStageStatus/:project_id/:stage", getStageStatus);

router.get("/masterDashboardSummary", getMasterDashboard);
router.get(
    "/downloadForestStageDocument/:stage/:filename",
    downloadForestStageDocument
);
router.get(
    "/viewForestStageDocument/:stage/:filename",
    viewForestStageDocument
);
router.get(
    "/stage-document/:stage/:forest_project_id/:field/:fileName",
    serveForestStageDocument
);
router.get("/getStage0/:forest_project_id", getStage0);
router.get("/getStage1/:forest_project_id", getStage1);
router.get("/getStage2/:forest_project_id", getStage2);
router.get("/getPostClearance/:forest_project_id", getPostClearance);

module.exports = router;

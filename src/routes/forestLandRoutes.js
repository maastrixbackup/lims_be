const express = require("express");
const router = express.Router();
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

router.post(
    "/uploadForestLandSchedule",
    uploadForestLandExcel.single("file"),
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
    uploadEdsDocuments.array("eds_reply_document"),
    addForestProjectWithEds
);
router.post(
    "/forest-project",
    uploadEdsDocuments.any(), //for dynamic multiple EDS files
    addForestProjectWithEds
);
router.get("/forestProjectList", forestProjectList);
router.put(
    "/updateForestProject/:id",
    uploadEdsDocuments.any(),
    updateForestProject
);

router.delete("/deleteForestProject/:id", deleteForestProject);

router.post(
    "/addStage0",
    uploadStage0.fields([
        { name: "dgps_document", maxCount: 10},
        { name: "orsac_document", maxCount: 10},
        { name: "tree_enumeration_document", maxCount: 10},
        { name: "administrative_document", maxCount: 10},
        { name: "legal_lease_document", maxCount: 10},
        { name: "technical_document", maxCount: 10},
        { name: "forest_land_details_document", maxCount: 10},
        { name: "ca_ca_document", maxCount: 10},
        { name: "fra_document", maxCount: 10},
        { name: "environmental_document", maxCount: 10},
        { name: "wildlife_document", maxCount: 10},
        { name: "maps_document", maxCount: 10},
        { name: "financial_document", maxCount: 10},
        { name: "proposal_document", maxCount: 10},
    ]),
    addStage0
);

router.put(
    "/updateStage0/:forest_project_id",
    uploadStage0.fields([
        { name: "dgps_document", maxCount: 10},
        { name: "orsac_document", maxCount: 10},
        { name: "tree_enumeration_document", maxCount: 10},
        { name: "administrative_document", maxCount: 10},
        { name: "legal_lease_document", maxCount: 10},
        { name: "technical_document", maxCount: 10},
        { name: "forest_land_details_document", maxCount: 10},
        { name: "ca_ca_document", maxCount: 10},
        { name: "fra_document", maxCount: 10},
        { name: "environmental_document", maxCount: 10},
        { name: "wildlife_document", maxCount: 10},
        { name: "maps_document", maxCount: 10},
        { name: "financial_document", maxCount: 10},
        { name: "proposal_document", maxCount: 10},
    ]),
    updateStage0
);

router.post(
    "/addStage1",
    uploadStage1.fields([
        { name: "stage1_approval_document", maxCount: 10},
        { name: "stage1_conditions_document", maxCount: 10},
        { name: "ca_land_document", maxCount: 10},
        { name: "fra_document", maxCount: 10},
        { name: "npv_document", maxCount: 10},
        { name: "ca_payment_document", maxCount: 10},
        { name: "aca_payment_document", maxCount: 10},
        { name: "wildlife_payment_document", maxCount: 10},
        { name: "technical_document", maxCount: 10},
        { name: "stage1_acceptance_document", maxCount: 10},
    ]),
    addStage1
);

router.put(
    "/updateStage1/:forest_project_id",
    uploadStage1.fields([
        { name: "stage1_approval_document", maxCount: 10},
        { name: "stage1_conditions_document", maxCount: 10},
        { name: "ca_land_document", maxCount: 10},
        { name: "fra_document", maxCount: 10},
        { name: "npv_document", maxCount: 10},
        { name: "ca_payment_document", maxCount: 10},
        { name: "aca_payment_document", maxCount: 10},
        { name: "wildlife_payment_document", maxCount: 10},
        { name: "technical_document", maxCount: 10},
        { name: "stage1_acceptance_document", maxCount: 10},
    ]),
    updateStage1
);

router.post(
    "/addStage2",
    uploadStage2.fields([
        { name: "environmental_document", maxCount: 10},
        { name: "nbwl_document", maxCount: 10},
        { name: "final_ca_document", maxCount: 10},
        { name: "final_maps_document", maxCount: 10},
        { name: "final_technical_document", maxCount: 10},
        { name: "stage2_approval_document", maxCount: 10},
    ]),
    addStage2
);

router.put(
    "/updateStage2/:forest_project_id",
    uploadStage2.fields([
        { name: "environmental_document", maxCount: 10},
        { name: "nbwl_document", maxCount: 10},
        { name: "final_ca_document", maxCount: 10},
        { name: "final_maps_document", maxCount: 10},
        { name: "final_technical_document", maxCount: 10},
        { name: "stage2_approval_document", maxCount: 10},
    ]),
    updateStage2
);

router.post(
    "/postClearance",
    uploadPostClearance.fields([
        { name: "ca_plantation_started_document", maxCount: 10},
        { name: "ca_plantation_completed_document", maxCount: 10},
        { name: "survival_report_document", maxCount: 10},
        { name: "wildlife_mitigation_document", maxCount: 10},
        { name: "safety_zone_document", maxCount: 10},
    ]),
    addPostClearance
);

router.put(
    "/updatePostClearance/:forest_project_id",
    uploadPostClearance.fields([
        { name: "ca_plantation_started_document", maxCount: 10},
        { name: "ca_plantation_completed_document", maxCount: 10},
        { name: "survival_report_document", maxCount: 10},
        { name: "wildlife_mitigation_document", maxCount: 10},
        { name: "safety_zone_document", maxCount: 10},
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

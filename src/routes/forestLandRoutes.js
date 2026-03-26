const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
    addForestLand,
    updateForestLand,
    forestLandList,
    deleteForestLand,
    // addForestProject,
    addForestProjectWithEds,
    forestLandAbstract,
    forestProjectList,
    // updateForestProject,
    deleteForestProject,
    addStage0,
    addStage1,
    addStage2,
    addPostClearance,
    // getForestProjectWithEds
    getStageStatus,
    getMasterDashboard
} = require("../controllers/forestLandController");

const {
    uploadEdsDocuments, uploadStage0, uploadStage1, uploadStage2, uploadPostClearance
} = require("../middleware/upload");

router.post("/addForestLand", addForestLand);
router.put("/updateForestLand/:id", updateForestLand);
router.get("/forestLandList", forestLandList);
router.delete("/deleteForestLand/:id", deleteForestLand);
router.get("/forestLandAbstract", forestLandAbstract);


// router.post("/addForestProject", addForestProject);
router.post(
    "/addForestProject",
    uploadEdsDocuments.array("eds_reply_document"),
    addForestProjectWithEds
);
// router.post(
//     "/forest-project",
//     uploadEds.any(), //for dynamic multiple EDS files
//     addForestProjectWithEds
// );
router.get("/forestProjectList", forestProjectList);
// router.put("/updateForestProject/:id", updateForestProject);

// router.put(
//     "/updateForestProject/:id",
//     uploadEDS.single("eds_document"),
//     updateForestProject
// );

router.delete("/deleteForestProject/:id", deleteForestProject);

router.post(
    "/addStage0",
    uploadStage0.fields([
        { name: "dgps_document", maxCount: 1 },
        { name: "orsac_document", maxCount: 1 },
        { name: "tree_enumeration_document", maxCount: 1 },
        { name: "administrative_document", maxCount: 1 },
        { name: "legal_lease_document", maxCount: 1 },
        { name: "technical_document", maxCount: 1 },
        { name: "forest_land_details_document", maxCount: 1 },
        { name: "ca_ca_document", maxCount: 1 },
        { name: "fra_document", maxCount: 1 },
        { name: "environmental_document", maxCount: 1 },
        { name: "wildlife_document", maxCount: 1 },
        { name: "maps_document", maxCount: 1 },
        { name: "financial_document", maxCount: 1 },
        { name: "proposal_document", maxCount: 1 },
    ]),
    addStage0
);

router.post(
    "/addStage1",
    uploadStage1.fields([
        { name: "stage1_approval_document", maxCount: 1 },
        { name: "stage1_conditions_document", maxCount: 1 },
        { name: "ca_land_document", maxCount: 1 },
        { name: "fra_document", maxCount: 1 },
        { name: "npv_document", maxCount: 1 },
        { name: "ca_payment_document", maxCount: 1 },
        { name: "aca_payment_document", maxCount: 1 },
        { name: "wildlife_document", maxCount: 1 },
        { name: "technical_document", maxCount: 1 },
        { name: "stage1_acceptance_document", maxCount: 1 },
    ]),
    addStage1
);

router.post(
    "/addStage2",
    uploadStage2.fields([
        { name: "environmental_document", maxCount: 1 },
        { name: "nbwl_document", maxCount: 1 },
        { name: "final_ca_document", maxCount: 1 },
        { name: "final_maps_document", maxCount: 1 },
        { name: "final_technical_document", maxCount: 1 },
        { name: "stage2_approval_document", maxCount: 1 },
    ]),
    addStage2
);

router.post(
    "/postClearance",
    uploadPostClearance.fields([
        { name: "ca_plantation_started_document", maxCount: 1 },
        { name: "ca_plantation_completed_document", maxCount: 1 },
        { name: "survival_report_document", maxCount: 1 },
        { name: "wildlife_mitigation_document", maxCount: 1 },
        { name: "safety_zone_document", maxCount: 1 },
    ]),
    addPostClearance
);

// router.get("/getForestProject/:projectId", getForestProjectWithEds);
router.get("/getStageStatus/:project_id/:stage", getStageStatus);

router.get("/masterDashboardSummary", getMasterDashboard);

module.exports = router;

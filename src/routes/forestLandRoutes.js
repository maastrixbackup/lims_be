const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
    addForestLand,
    updateForestLand,
    forestLandList,
    deleteForestLand,
    addForestProject,
    forestLandAbstract,
    forestProjectList,
    updateForestProject,
    deleteForestProject,
    addStage0
} = require("../controllers/forestLandController");

const {
    uploadEDS, uploadStage0
} = require("../middleware/upload");

router.post("/addForestLand", addForestLand);
router.put("/updateForestLand/:id", updateForestLand);
router.get("/forestLandList", forestLandList);
router.delete("/deleteForestLand/:id", deleteForestLand);
router.get("/forestLandAbstract", forestLandAbstract);


// router.post("/addForestProject", addForestProject);
router.post(
    "/addForestProject",
    uploadEDS.single("eds_document"),
    addForestProject
);
router.get("/forestProjectList", forestProjectList);
// router.put("/updateForestProject/:id", updateForestProject);
router.put(
    "/updateForestProject/:id",
    uploadEDS.single("eds_document"),
    updateForestProject
);

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

module.exports = router;

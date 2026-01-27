const express = require("express");
const router = express.Router();
const multer = require("multer");
const { addForestLand, updateForestLand, forestLandList, deleteForestLand, addForestProject, forestLandAbstract, forestProjectList } = require("../controllers/forestLandController");

const {
    uploadEDS
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

module.exports = router;

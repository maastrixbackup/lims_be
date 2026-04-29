const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  addGovtKhata,
  govtKhataList,
  updateGovtKhata,
  deleteGovtKhata,
  viewPlotsByKhata,
  uploadGovtKhataDoc,
  getKhataFilesByKhataId,
  deleteGovtKhataFileById,
  uploadGovtMapDoc,
  getGovtMapFiles,
  downloadKhataDocument
} = require("../controllers/govtKhataController");

const { uploadGovtKhata, uploadGovtMapDocument } = require("../middleware/upload");

router.post("/addGovtKhata", addGovtKhata);
router.get("/govtKhataList", govtKhataList);
router.put("/updateGovtKhata/:id", updateGovtKhata);
router.delete("/deleteGovtKhata/:id", deleteGovtKhata);
router.get("/viewPlotsByKhata/:id", viewPlotsByKhata);

router.post(
  "/uploadGovtKhata",
  (req, res, next) => {
    uploadGovtKhata.single("file")(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: "Invalid file. Only PDF or Excel files are allowed.",
        });
      }
      next(); // If no error → go to controller
    });
  },
  uploadGovtKhataDoc
);
router.get("/getGovtKhataFiles/:id", getKhataFilesByKhataId);
router.delete("/deleteGovtKhataFile/:id", deleteGovtKhataFileById);

router.post(
  "/uploadMapDocument",
  uploadGovtMapDocument.single("file"),
  uploadGovtMapDoc
);
router.get("/getGovtMapFiles/:khata_id", getGovtMapFiles);

router.get("/downloadKhataDocument/:filename", downloadKhataDocument);

module.exports = router;

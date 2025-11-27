const express = require("express");
const router = express.Router();
const multer = require("multer");
const {
  addKhata,
  khataList,
  updateKhata,
  deleteKhata,
  uploadKhataDoc,
  getKhataFilesByKhataId,
  deleteKhataFileById,
  viewPlotsByKhata,
  exportKhata,
  printKhata,
} = require("../controllers/khataController");
const { uploadKhata } = require("../middleware/upload");

router.post("/addKhata", addKhata);
router.get("/khataList", khataList);
router.put("/updateKhata/:id", updateKhata);
router.delete("/deleteKhata/:id", deleteKhata);

// router.post("/uploadKhata", uploadKhata.single("file"), uploadKhataDoc);
router.post(
  "/uploadKhata",
  (req, res, next) => {
    uploadKhata.single("file")(req, res, function (err) {
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
  uploadKhataDoc
);

router.get("/getKhataFiles/:id", getKhataFilesByKhataId);
router.delete("/deleteKhataFile/:id", deleteKhataFileById);
router.get("/viewPlotsByKhata/:id", viewPlotsByKhata);

router.get("/exportKhata", exportKhata);
router.get("/printKhata", printKhata);

module.exports = router;

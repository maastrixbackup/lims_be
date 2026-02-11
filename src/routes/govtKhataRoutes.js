const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  addGovtKhata,
  govtKhataList,
  updateGovtKhata,
  deleteGovtKhata,
  viewPlotsByKhata,
  uploadGovtKhataDoc
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

// router.post(
//   "/uploadMapDocument",
//   uploadMapDocument.single("file"),
//   uploadMapDoc
// );

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  addKhata,
  khataList,
  updateKhata,
  deleteKhata,
  uploadKhataDoc,
  getKhataFilesByKhataId,
  deleteKhataFileById,
} = require("../controllers/khataController");
const { uploadKhata } = require("../middleware/upload");

router.post("/addKhata", addKhata);
router.get("/khataList", khataList);
router.put("/updateKhata/:id", updateKhata);
router.delete("/deleteKhata/:id", deleteKhata);
router.post("/uploadKhata", uploadKhata.single("file"), uploadKhataDoc);
router.get("/getKhataFiles/:id", getKhataFilesByKhataId);
router.delete("/deleteKhataFile/:id", deleteKhataFileById);

module.exports = router;

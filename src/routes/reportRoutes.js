const express = require("express");
const router = express.Router();

const {
  khataSummary,
  getAllKhataDocuments,
  getVillageReport,
} = require("../controllers/reportController");

router.get("/khataSummary", khataSummary);
router.get("/getAllKhataDocuments", getAllKhataDocuments);
router.get("/villageLandRegister", getVillageReport);

module.exports = router;

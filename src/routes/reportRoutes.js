const express = require("express");
const router = express.Router();

const {
  khataSummary,
  getAllKhataDocuments,
} = require("../controllers/reportController");

router.get("/khataSummary", khataSummary);
router.get("/getAllKhataDocuments", getAllKhataDocuments);

module.exports = router;

const express = require("express");
const router = express.Router();
const { uploadExcel } = require("../middleware/upload");
const { uploadPlots } = require("../controllers/plotController");

router.post("/upload", uploadExcel.single("file"), uploadPlots);

module.exports = router;

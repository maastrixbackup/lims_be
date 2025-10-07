const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { uploadPlots } = require("../controllers/plotController");

router.post("/upload", upload.single("file"), uploadPlots);

module.exports = router;

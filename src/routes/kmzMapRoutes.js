const express = require("express");
const router = express.Router();
const { streamKmzFile } = require("../controllers/kmzMapController");
const authMiddleware = require("../middleware/authMiddleware");

// Public test route
router.get("/test", (req, res) => {
  res.json({ success: true, message: "KMZ Route is working correctly!" });
});

// Protected proxy route
router.get("/proxy/:fileId", authMiddleware, streamKmzFile);

module.exports = router;
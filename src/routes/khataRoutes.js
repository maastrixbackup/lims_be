const express = require("express");
const router = express.Router();
const { addKhata } = require("../controllers/khataController");

router.post("/addKhata", addKhata);

module.exports = router;

// // List
// router.get("/khatas", authMiddleware, khataList);

// // Update
// router.put("/khatas/:id", authMiddleware, updateKhata);

// // Delete
// router.delete("/khatas/:id", authMiddleware, deleteKhata);

// module.exports = router;

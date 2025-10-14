const express = require("express");
const router = express.Router();
const {
  addKhata,
  khataList,
  updateKhata,
  deleteKhata,
} = require("../controllers/khataController");

router.post("/addKhata", addKhata);
router.get("/khataList", khataList);
router.put("/updateKhata/:id", updateKhata);
router.delete("/deleteKhata/:id", deleteKhata);

module.exports = router;

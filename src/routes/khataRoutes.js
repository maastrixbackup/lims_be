const express = require("express");
const router = express.Router();
const {
  addKhata,
  khataList,
  updateKhata,
} = require("../controllers/khataController");

router.post("/addKhata", addKhata);
router.get("/khataList", khataList);
router.put("/updateKhata/:id", updateKhata);

module.exports = router;

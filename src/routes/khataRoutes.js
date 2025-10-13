const express = require("express");
const router = express.Router();
const { addKhata, khataList } = require("../controllers/khataController");

router.post("/addKhata", addKhata);
router.get("/khataList", khataList);

module.exports = router;

const express = require("express");
const router = express.Router();
const { addKhata } = require("../controllers/khataController");

router.post("/addKhata", addKhata);

module.exports = router;

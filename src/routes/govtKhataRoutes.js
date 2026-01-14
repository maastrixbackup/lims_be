const express = require("express");
const router = express.Router();

const { addGovtKhata } = require("../controllers/govtKhataController");

router.post("/addGovtKhata", addGovtKhata);

module.exports = router;

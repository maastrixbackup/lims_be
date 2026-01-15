const express = require("express");
const router = express.Router();

const {
  addGovtKhata,
  govtKhataList,
} = require("../controllers/govtKhataController");

router.post("/addGovtKhata", addGovtKhata);
router.get("/govtKhataList", govtKhataList);

module.exports = router;

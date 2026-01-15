const express = require("express");
const router = express.Router();

const {
  addGovtKhata,
  govtKhataList,
  updateGovtKhata,
} = require("../controllers/govtKhataController");

router.post("/addGovtKhata", addGovtKhata);
router.get("/govtKhataList", govtKhataList);
router.put("/updateGovtKhata/:id", updateGovtKhata);

module.exports = router;

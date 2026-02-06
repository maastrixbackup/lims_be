const express = require("express");
const router = express.Router();

const {
  addGovtKhata,
  govtKhataList,
  updateGovtKhata,
  deleteGovtKhata,
  viewPlotsByKhata
} = require("../controllers/govtKhataController");

router.post("/addGovtKhata", addGovtKhata);
router.get("/govtKhataList", govtKhataList);
router.put("/updateGovtKhata/:id", updateGovtKhata);
router.delete("/deleteGovtKhata/:id", deleteGovtKhata);
router.get("/viewPlotsByKhata/:id", viewPlotsByKhata);

module.exports = router;

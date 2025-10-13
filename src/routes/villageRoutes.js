const express = require("express");
const router = express.Router();

const {
  addVillage,
  villageList,
  updateVillage,
  deleteVillage,
} = require("../controllers/villageController");

router.post("/addVillage", addVillage);
router.get("/villageList", villageList);
router.put("/updateVillage/:id", updateVillage);
router.delete("/deleteVillage/:id", deleteVillage);

module.exports = router;

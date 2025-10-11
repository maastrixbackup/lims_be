const express = require("express");
const router = express.Router();

const {
  addVillage,
  villageList,
  updateVillage,
} = require("../controllers/villageController");

router.post("/addVillage", addVillage);
router.get("/villageList", villageList);
router.put("/updateVillage/:id", updateVillage);

module.exports = router;

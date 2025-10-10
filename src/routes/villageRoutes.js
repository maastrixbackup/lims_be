const express = require("express");
const router = express.Router();

const { addVillage, villageList } = require("../controllers/villageController");

router.post("/addVillage", addVillage);
router.get("/villageList", villageList);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  getDashboardData,
  getGovtDashboardData,
} = require("../controllers/dashboardController");

router.get("/getDashboardData", getDashboardData);
router.get("/govtDashboardData", getGovtDashboardData);

// router.get("/getUserDashboardData", getUserDashboardData);

module.exports = router;

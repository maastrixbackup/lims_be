const express = require("express");
const router = express.Router();

const {
  getDashboardData,
  getUserDashboardData,
} = require("../controllers/dashboardController");

router.get("/getDashboardData", getDashboardData);

// router.get("/getUserDashboardData", getUserDashboardData);

module.exports = router;

const express = require("express");
const {
  deletePrivateProjectData,
  throwError,
  test,
  deleteForestProject,
  deleteGovtProject,
} = require("../controllers/masterController");
const router = express.Router();

router.get("/test", test);
router.get("/error/:type", throwError);
router.delete("/deletePrivateProject/:id", deletePrivateProjectData);
router.delete("/deleteForestProject/:id", deleteForestProject);
router.delete("/deleteGovtProject/:id", deleteGovtProject);

module.exports = router;

const express = require("express");
const router = express.Router();

const {
  createProject,
  projectList,
} = require("../controllers/projectController");

router.post("/createProject", createProject);
router.get("/projectList", projectList);

module.exports = router;

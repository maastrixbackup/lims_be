const express = require("express");
const router = express.Router();

const {
  createProject,
  projectList,
  getActiveProjects,
  updateProject,
  deleteProject,
} = require("../controllers/projectController");

router.post("/createProject", createProject);
router.get("/projectList", projectList);
router.get("/getActiveProjects", getActiveProjects);
router.put("/updateProject/:id", updateProject);
router.delete("/deleteProject/:id", deleteProject);

module.exports = router;

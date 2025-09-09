const Project = require("../models/projectModel");

const createProject = async (req, res) => {
  try {
    const { project_name } = req.body;
    if (!project_name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const existingProject = await Project.findByName(project_name);
    if (existingProject) {
      return res.status(400).json({
        success: false,
        message: "Project with this name already exists",
      });
    }

    const project = await Project.create(project_name);
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: project,
    });
  } catch (err) {
    console.error("Create project error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { createProject };

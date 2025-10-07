const Project = require("../models/projectModel");
const logAction = require("../utils/logger");

const createProject = async (req, res) => {
  const safeRequestPayload = {
    project_name: req.body?.project_name,
    status: req.body?.status ?? 0,
  };
  try {
    const { project_name, status = 0 } = req.body;
    if (!project_name) {
      return res.status(400).json({
        success: false,
        message: "Project name is required",
      });
    }

    const existingProject = await Project.findByName(project_name);
    if (existingProject.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Project with this name already exists",
      });
    }

    const project = await Project.create(project_name, status);
    await logAction(
      null,
      "create project",
      "success",
      "Project created successfully",
      safeRequestPayload,
      project
    );
    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project: project,
    });
  } catch (err) {
    await logAction(
      null,
      "create project",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Create project error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const projectList = async (req, res) => {
  try {
    const projects = await Project.findAll();

    const statusMap = { 0: "Pending", 1: "Active", 2: "Closed" };
    const formattedProjects = projects.map((project) => ({
      ...project,
      project_status: statusMap[project.status] || "N/A",
    }));

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      projects: formattedProjects,
    });
  } catch (err) {
    console.error("Fetch projects error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { createProject, projectList };

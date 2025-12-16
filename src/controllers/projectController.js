const Project = require("../models/projectModel");
const logAction = require("../utils/logger");

const createProject = async (req, res) => {
  const userId = req.user.id;
  const roleId = req.user.role_id;
  const { project_name, status = 0, client_code, project_location } = req.body;
  const safeRequestPayload = { project_name, status, client_code };

  try {
    if (!project_name || !client_code || !project_location) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingProject = await Project.findByName(project_name);
    if (existingProject.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Project with this name already exists",
      });
    }

    const project = await Project.create(
      project_name,
      status,
      client_code,
      project_location
    );

    if (roleId === 2) {
      await Project.assignUserToProject(userId, project.id);
    }

    await logAction(
      userId,
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
      userId,
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
    // const projects = await Project.findAll();
    let projects;
    if (req.user.role_id === 1) {
      // Admin can see all projects
      projects = await Project.findAll();
    } else {
      // Others sees only their assigned projects
      projects = await Project.findByUserId(req.user.id);
    }

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

const getActiveProjects = async (req, res) => {
  try {
    const projects = await Project.findActiveProjects();

    return res.status(200).json({
      success: true,
      message: "Project fetched successfully",
      projects: projects,
    });
  } catch (err) {
    console.error("Fetch projects error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const updateProject = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { project_name, status, client_code, project_location } = req.body;

  const safeRequestPayload = {
    id,
    project_name,
    status,
    client_code,
    project_location,
  };

  try {
    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid project ID is required",
      });
    }
    if (
      project_name === undefined &&
      status === undefined &&
      client_code === undefined &&
      project_location === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found.",
      });
    }
    if (project_name) {
      const existing = await Project.findByName(project_name);
      if (existing.length > 0 && existing[0].id !== parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: "Another project with this name already exists",
        });
      }
    }
    const updatedProject = await Project.update(
      id,
      project_name,
      status,
      client_code,
      project_location
    );
    await logAction(
      userId,
      "update project",
      "success",
      "Project updated successfully",
      safeRequestPayload,
      updatedProject
    );
    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject,
    });
  } catch (err) {
    await logAction(
      userId,
      "update project",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Edit project error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const deleteProject = async (req, res) => {
  const userId = req.user.id;
  const safeRequestPayload = { id: req.params.id };

  try {
    const { id } = req.params;
    const project = await Project.findById(id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }
    await Project.delete(id);

    await logAction(
      userId,
      "delete project",
      "success",
      "Project deleted successfully",
      safeRequestPayload,
      project
    );

    return res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (err) {
    await logAction(
      userId,
      "delete project",
      "failure",
      err.message,
      safeRequestPayload,
      null
    );
    console.error("Delete project error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = {
  createProject,
  projectList,
  updateProject,
  deleteProject,
  getActiveProjects,
};

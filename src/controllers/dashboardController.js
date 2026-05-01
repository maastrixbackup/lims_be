const Project = require("../models/projectModel");
const Village = require("../models/villageModel");
const Plot = require("../models/plotModel");
const GovtPlot = require("../models/govtPlotModel");
const Log = require("../models/logModel");
const Khata = require("../models/khataModel");
const GovtKhata = require("../models/govtKhataModel");

const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

// const getDashboardData = async (req, res) => {
//   try {
//     const projectId = req.query.project_id || null;
//     const [projectsCount, villagesCount, plotsCount, khataCount] =
//       await Promise.all([
//         Project.countAll(projectId),
//         Village.countAll(projectId),
//         Plot.allPlotcount(projectId),
//         Khata.countAll(projectId),
//       ]);

//     const recentProjects = await Project.getRecentProjects(3);
//     const recentActivity = await Log.getRecentActivity(3);

//     const formattedActivity = recentActivity.map((ra) => ({
//       ...ra,
//       created_at: dayjs(ra.created_at).fromNow(),
//     }));

//     const landDistribution = await Plot.landDistribution(projectId);

//     const dashboardData = {
//       projects: projectsCount,
//       villages: villagesCount,
//       plots: plotsCount,
//       // sub_plots: 310,
//       khata: khataCount,
//       survey_status: 70,
//       payment_status: 110,
//       la_status: 20,
//       rr_status: 34,
//       land_distribution: {
//         pvt_land: landDistribution.private,
//         govt_land: landDistribution.govt,
//         forest_land: landDistribution.forest,
//       },
//       recent_projects: recentProjects,
//       recent_activity: formattedActivity,
//     };

//     return res.status(200).json({
//       success: true,
//       message: "Dashboard data fetched successfully",
//       data: dashboardData,
//     });
//   } catch (err) {
//     console.error("Dashboard Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

const getDashboardData = async (req, res) => {
  try {
    const { id: userId, role_id } = req.user;
    const selectedProjectId = req.query.project_id || null;

    let accessedProjects = [];
    if (role_id !== 1) {
      const [rows] = await Project.getAccessedProjects(userId);
      accessedProjects = rows.map((r) => r.project_id);
      if (accessedProjects.length === 0) {
        return res.status(403).json({
          success: false,
          message: "No project access assigned to this user",
        });
      }
    }

    // ---------- ROLE BASED PROJECT FILTER ----------
    let projectIds = null;
    if (role_id === 1) {
      // ADMIN
      projectIds = selectedProjectId ? [Number(selectedProjectId)] : null;
    } else {
      // USER
      if (selectedProjectId) {
        const pid = Number(selectedProjectId);
        if (!accessedProjects.includes(pid)) {
          return res.status(403).json({
            success: false,
            message: "You do not have access to this project",
          });
        }
        projectIds = [pid];
      } else {
        projectIds = accessedProjects;
      }
    }

    // Continue with counts
    const [projectsCount, villagesCount, plotsCount, khataCount, completedPayments] =
      await Promise.all([
        Project.countAll(projectIds),
        Village.pvtCountAll(projectIds),
        Plot.allPlotcount(projectIds),
        Khata.countAll(projectIds),
        Plot.countCompletedPayments(projectIds),
      ]);

    const recentProjects = await Project.getRecentProjects(3);
    const recentActivity = await Log.getRecentActivity(3);

    const formattedActivity = recentActivity.map((ra) => ({
      ...ra,
      created_at: dayjs(ra.created_at).fromNow(),
    }));

    const landDistribution = await Plot.landDistribution(projectIds);

    const dashboardData = {
      projects: projectsCount,
      villages: villagesCount,
      plots: plotsCount,
      // sub_plots: 310,
      khata: khataCount,
      survey_status: 70,
      payment_status: completedPayments,
      la_status: null,
      rr_status: khataCount,
      land_distribution: {
        pvt_land: landDistribution.private,
        govt_land: landDistribution.govt,
        forest_land: landDistribution.forest,
      },
      recent_projects: recentProjects,
      recent_activity: formattedActivity,
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

const getGovtDashboardData = async (req, res) => {
  try {
    const { id: userId, role_id } = req.user;
    const selectedProjectId = req.query.project_id || null;

    let accessedProjects = [];

    if (role_id !== 1) {
      const [rows] = await Project.getAccessedProjects(userId);
      accessedProjects = rows.map((r) => r.project_id);

      if (accessedProjects.length === 0) {
        return res.status(403).json({
          success: false,
          message: "No project access assigned to this user",
        });
      }
    }

    // ---------- ROLE BASED PROJECT FILTER ----------
    let projectIds = null;

    if (role_id === 1) {
      // ADMIN
      projectIds = selectedProjectId ? [Number(selectedProjectId)] : null;
    } else {
      // USER
      if (selectedProjectId) {
        const pid = Number(selectedProjectId);
        if (!accessedProjects.includes(pid)) {
          return res.status(403).json({
            success: false,
            message: "You do not have access to this project",
          });
        }
        projectIds = [pid];
      } else {
        projectIds = accessedProjects;
      }
    }


    // ---------- GOVT COUNTS ----------
    const [projectsCount, villagesCount, govtPlotsCount, govtKhataCount, completedPayments] =
      await Promise.all([
        Project.countAll(projectIds),
        Village.govtCountAll(projectIds), // or GovtVillage if separate
        GovtPlot.govtPlotCount(projectIds),
        GovtKhata.countAll(projectIds),
        GovtPlot.countCompletedPayments(projectIds),
      ]);

    const recentProjects = await Project.getRecentProjects(3);
    const recentActivity = await Log.getRecentActivity(3);

    const formattedActivity = recentActivity.map((ra) => ({
      ...ra,
      created_at: dayjs(ra.created_at).fromNow(),
    }));

    const landDistribution = await GovtPlot.landDistribution(projectIds);

    const dashboardData = {
      projects: projectsCount,
      villages: villagesCount,
      plots: govtPlotsCount,
      // sub_plots: 310,
      khata: govtKhataCount,
      survey_status: 70,
      payment_status: completedPayments,
      la_status: null,
      rr_status: govtKhataCount,
      land_distribution: {
        pvt_land: landDistribution.private,
        govt_land: landDistribution.govt,
        forest_land: landDistribution.forest,
      },
      recent_projects: recentProjects,
      recent_activity: formattedActivity,
    };

    return res.status(200).json({
      success: true,
      message: "Govt dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (err) {
    console.error("Govt Dashboard Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// const getDashboardDatas = async (req, res) => {
//   try {
//     // ---------- ROLE BASED PROJECT FILTER ----------
//     let projectIds = null;

//     if (role_id === 1) {
//       // ADMIN
//       projectIds = selectedProjectId ? [Number(selectedProjectId)] : null;
//     } else {
//       // USER
//       if (selectedProjectId) {
//         const pid = Number(selectedProjectId);
//         if (!accessedProjects.includes(pid)) {
//           return res.status(403).json({
//             success: false,
//             message: "You do not have access to this project",
//           });
//         }
//         projectIds = [pid];
//       } else {
//         projectIds = accessedProjects;
//       }
//     }

//     // Continue with counts
//     const [projectsCount, villagesCount, plotsCount, khataCount] =
//       await Promise.all([
//         Project.countAll(projectIds),
//         Village.countAll(projectIds),
//         Plot.allPlotcount(projectIds),
//         Khata.countAll(projectIds),
//       ]);

//     const recentProjects = await Project.getRecentProjects(3);
//     const recentActivity = await Log.getRecentActivity(3);

//     const formattedActivity = recentActivity.map((ra) => ({
//       ...ra,
//       created_at: dayjs(ra.created_at).fromNow(),
//     }));

//     const landDistribution = await Plot.landDistribution(projectIds);

//     return res.status(200).json({
//       success: true,
//       message: "Dashboard data fetched successfully",
//       data: {
//         projects: projectsCount,
//         villages: villagesCount,
//         plots: plotsCount,
//         khata: khataCount,
//         land_distribution: landDistribution,
//         recent_projects: recentProjects,
//         recent_activity: formattedActivity,
//       },
//     });
//   } catch (err) {
//     console.error("Dashboard Error:", err);
//     return res.status(500).json({
//       success: false,
//       message: "Server error",
//     });
//   }
// };

module.exports = { getDashboardData, getGovtDashboardData };


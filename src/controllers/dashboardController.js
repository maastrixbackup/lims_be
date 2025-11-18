const Project = require("../models/projectModel");
const Village = require("../models/villageModel");
const Plot = require("../models/plotModel");
const Log = require("../models/logModel");
const Khata = require("../models/khataModel");

const dayjs = require("dayjs");
const relativeTime = require("dayjs/plugin/relativeTime");
dayjs.extend(relativeTime);

const getDashboardData = async (req, res) => {
  try {
    const [projectsCount, villagesCount, plotsCount, khataCount] =
      await Promise.all([
        Project.countAll(),
        Village.countAll(),
        Plot.allPlotcount(),
        Khata.countAll(),
      ]);

    const recentProjects = await Project.getRecentProjects(3);
    const recentActivity = await Log.getRecentActivity(3);

    const formattedActivity = recentActivity.map((ra) => ({
      ...ra,
      created_at: dayjs(ra.created_at).fromNow(),
    }));

    const dashboardData = {
      projects: projectsCount,
      villages: villagesCount,
      plots: plotsCount,
      // sub_plots: 310,
      khata: khataCount,
      survey_status: 70,
      payment_status: 110,
      la_status: 20,
      rr_status: 34,
      recent_projects: recentProjects,
      recent_activity: formattedActivity,
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: dashboardData,
    });
  } catch (err) {
    console.error("Dashboard Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

module.exports = { getDashboardData };

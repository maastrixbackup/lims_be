const Log = require("../models/logModel");

const getLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const logs = await Log.findAll({ page, limit });
    const total = await Log.countAll();
    const totalPages = Math.ceil(total / limit);

    return res.status(200).json({
      success: true,
      message: "Logs fetched successfully",
      page,
      limit,
      total,
      totalPages,
      logs,
    });
  } catch (err) {
    console.error("Fetch Logs Error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching logs",
    });
  }
};

module.exports = { getLogs };

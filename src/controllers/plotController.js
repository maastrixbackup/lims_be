const xlsx = require("xlsx");
const Plot = require("../models/plotModel");

const uploadPlots = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    if (!data.length) {
      return res
        .status(400)
        .json({ success: false, message: "Excel file is empty" });
    }

    const insertedCount = await Plot.bulkInsert(data);

    return res.status(201).json({
      success: true,
      message: insertedCount
        ? `${insertedCount} plots inserted successfully`
        : "No new plots inserted",
    });
  } catch (error) {
    console.error("Upload Plots Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { uploadPlots };

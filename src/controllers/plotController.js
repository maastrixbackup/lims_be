// const xlsx = require("xlsx");

const xlsx = require("xlsx");
const db = require("../config/db");

const uploadPlots = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
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

    // Map Excel data to DB columns
    const values = data.map((row) => [
      row.plot_number || null,
      row.owner_name || null,
      row.area || null,
      row.location || null,
      row.price || null,
    ]);

    await db.query(
      `INSERT INTO plots (plot_number, owner_name, area, location, price)
       VALUES ?`,
      [values]
    );

    return res.status(201).json({
      success: true,
      message: `${values.length} plots inserted successfully`,
    });
  } catch (error) {
    console.error("Upload Plots Error:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { uploadPlots };

const db = require("../config/db");

const Plot = {
  async bulkInsert(plots) {
    if (!plots || plots.length === 0) return;
    const values = plots.map((plot) => [
      plot.plot_number || null,
      plot.owner_name || null,
      plot.area || null,
      plot.location || null,
      plot.price || null,
    ]);

    // const values = plots.map((plot) => [
    //   plot["Name of the Branch with IFSC Code"] || null,
    //   plot["Legal Heir Certificate No. (if any)"] || null,
    //   plot["Cases if any Against the Plots"] || null,
    // ]);

    const [result] = await db.query(
      `INSERT IGNORE INTO plots (plot_number, owner_name, area, location, price) VALUES ?`,
      [values]
    );
    // Return number of actually inserted rows
    return result.affectedRows || 0;
  },

  async countAll() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM plots");
    return rows[0].total;
  },
};

module.exports = Plot;

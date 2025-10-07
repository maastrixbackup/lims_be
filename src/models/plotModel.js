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

    await db.query(
      `INSERT INTO plots (plot_number, owner_name, area, location, price) VALUES ?`,
      [values]
    );
  },

  
};

module.exports = Plot;

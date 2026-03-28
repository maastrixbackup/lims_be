const db = require("../config/db");

const Report = {
  async khataSummary() {
    const query = `
    SELECT k.id,k.khata_no,k.created_at,p.project_name,v.village_name,COUNT(pl.id) AS total_plots,SUM(pl.land_area_acquired_acres) AS total_area
    FROM khatas k
    LEFT JOIN projects p ON k.project_id = p.id
    LEFT JOIN villages v ON k.village_id = v.id
    LEFT JOIN plots pl ON pl.khata_no = k.khata_no
    GROUP BY
    K.khata_no
    ORDER BY k.id DESC
    `;
    const [rows] = await db.query(query);
    return rows;
  },

  async getAllKhataDocuments() {
    const [rows] = await db.query(
      `SELECT kd.*, k.khata_no, k.id AS khata_id
        FROM khata_documents kd
        LEFT JOIN khatas k ON kd.khata_id = k.id
        ORDER BY kd.khata_id, kd.id`
    );
    return rows;
  },

  async getAllVillages() {
    const [rows] = await db.query(`
        SELECT DISTINCT village_name
        FROM villages
      `);
    return rows;
  },

  async getVillagePlots(village_name) {
    const [rows] = await db.query(
      `SELECT * FROM plots WHERE village_name = ? AND is_deleted = 0`,
      [village_name]
    );
    return rows;
  },

  async getKhataNumbers(village_name) {
    const [rows] = await db.query(
      `SELECT DISTINCT khata_no FROM plots WHERE village_name = ? AND is_deleted = 0`,
      [village_name]
    );
    return rows.map((r) => r.khata_no);
  },

  async getPlotNumbers(village_name) {
    const [rows] = await db.query(
      `SELECT DISTINCT plot_no FROM plots WHERE village_name = ? AND is_deleted = 0`,
      [village_name]
    );
    return rows.map((r) => r.plot_no);
  },

  async getTotalLandArea(village_name) {
    const [rows] = await db.query(
      `SELECT SUM(land_area_total_acres) AS total_area FROM plots WHERE village_name = ? AND is_deleted = 0`,
      [village_name]
    );
    return rows[0].total_area || 0;
  },

  async getLandTypeBreakup(village_name) {
    const [rows] = await db.query(
      `SELECT type,SUM(land_area_total_acres) AS area
      FROM plots
      WHERE village_name = ? AND is_deleted = 0
      GROUP BY type`,
      [village_name]
    );

    const breakup = {
      private_land_area: 0,
      government_land_area: 0,
    };

    rows.forEach((item) => {
      if (item.type === 1) breakup.private_land_area = item.area;
      if (item.type === 2) breakup.government_land_area = item.area;
    });
    return breakup;
  },
};

module.exports = Report;

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
};

module.exports = Report;

const db = require("../config/db");
const { findAll } = require("./logModel");

const Village = {
  async create(village_name, tahasil, district, project_id) {
    const [result] = await db.query(
      "INSERT INTO villages (village_name, tahasil, district, project_id) VALUES (?,?,?,?)",
      [village_name, tahasil, district, project_id]
    );
    return { id: result.insertId, village_name, tahasil, district, project_id };
  },

  async findAll({ project_id = null, district = null, tahasil = null }) {
    let query = `
        SELECT v.*,p.project_name
        FROM villages v
        JOIN projects p ON v.project_id = p.id
        WHERE 1=1
        `;

    const params = [];
    if (project_id) {
      query += " AND v.project_id = ?";
      params.push(project_id);
    }

    if (district) {
      query += " AND v.district LIKE ?";
      params.push(`%${district}%`);
    }

    if (tahasil) {
      query += " AND v.tahasil LIKE ?";
      params.push(`%${tahasil}%`);
    }
    query += " ORDER BY v.id DESC";

    const [rows] = await db.query(query, params);
    return rows;
  },
};

module.exports = Village;

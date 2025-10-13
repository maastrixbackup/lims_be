const db = require("../config/db");

const Khata = {
  async create(project_id, village_id, khata_no) {
    const [result] = await db.query(
      "INSERT INTO khatas(project_id, village_id, khata_no) VALUES (?,?,?)",
      [project_id, village_id, khata_no]
    );
    return { id: result.insertId, project_id, village_id, khata_no };
  },

  async findAll({ project_id = null, village_id = null }) {
    let query = `
        SELECT k.*, p.project_name, v.village_name
        FROM khatas k
        LEFT JOIN projects p ON k.project_id = p.id
        LEFT JOIN villages v ON k.village_id = v.id
        WHERE 1=1
    `;
    const params = [];
    if (project_id) {
      query += " AND k.project_id = ?";
      params.push(project_id);
    }
    if (village_id) {
      query += " AND k.village_id = ?";
      params.push(village_id);
    }
    query += " ORDER BY k.id DESC";
    const [rows] = await db.query(query, params);
    return rows;
  },
};

module.exports = Khata;

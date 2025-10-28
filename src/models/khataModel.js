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

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM khatas WHERE id = ?", [id]);
    // return rows[0];
    return rows[0] || null;
  },

  async update(id, project_id, village_id, khata_no) {
    await db.query(
      "UPDATE khatas SET project_id = ?, village_id = ?, khata_no = ?, updated_at = NOW() WHERE id = ?",
      [project_id, village_id, khata_no, id]
    );
    return { id, project_id, village_id, khata_no };
  },

  async delete(id) {
    await db.query("DELETE FROM khatas WHERE ID = ?", [id]);
  },

  async uploadKhataDocument(khata_id, file_name) {
    const [result] = await db.query(
      "INSERT INTO khata_documents(khata_id, file_name) VALUES (?,?)",
      [khata_id, file_name]
    );
    return result;
  },

  async getFilesByKhataId(khata_id) {
    const [rows] = await db.query(
      "SELECT * FROM khata_documents WHERE khata_id = ? ORDER BY created_at DESC",
      [khata_id]
    );
    return rows;
  },

  async findFileById(id) {
    const [rows] = await db.query(
      "SELECT * FROM khata_documents WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  async deleteFileById(file_id) {
    const [result] = await db.query(
      "DELETE FROM khata_documents WHERE id = ?",
      [file_id]
    );
    return result.affectedRows > 0;
  },
};

module.exports = Khata;

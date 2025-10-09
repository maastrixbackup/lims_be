const db = require("../config/db");

const Project = {
  async create(project_name, status = 0) {
    const [result] = await db.query(
      "INSERT INTO projects (project_name, status) VALUES (?, ?)",
      [project_name, status]
    );
    return { id: result.insertId, project_name, status };
  },

  async findAll() {
    const [rows] = await db.query("SELECT * FROM projects ORDER BY id DESC");
    return rows;
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM projects WHERE id = ?", [id]);
    return rows[0];
  },

  async findByName(project_name) {
    const [rows] = await db.query(
      "SELECT * FROM projects WHERE project_name = ?",
      [project_name]
    );
    return rows;
  },

  async update(id, project_name, status) {
    await db.query(
      "UPDATE projects SET project_name = ?, status = ?, updated_at = NOW() WHERE id = ?",
      [project_name, status, id]
    );
    return { id, project_name, status };
  },

  async delete(id) {
    await db.query("DELETE FROM projects WHERE id = ?", [id]);
  },
};

module.exports = Project;

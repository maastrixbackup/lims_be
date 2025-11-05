const db = require("../config/db");
const { countAll } = require("./logModel");

const Project = {
  async create(project_name, status = 0, client_code) {
    const [result] = await db.query(
      "INSERT INTO projects (project_name, status, client_code) VALUES (?, ?, ?)",
      [project_name, status, client_code]
    );
    return { id: result.insertId, project_name, status, client_code };
  },

  async findAll() {
    const [rows] = await db.query("SELECT * FROM projects ORDER BY id DESC");
    return rows;
  },

  async findActiveProjects() {
    const [rows] = await db.query(
      "SELECT project_name,status FROM projects WHERE status = 1 ORDER BY project_name ASC"
    );
    return rows;
  },

  async findByUserId(userId) {
    const [rows] = await db.query(
      `SELECT p.*
       FROM projects p
       JOIN user_projects up ON up.project_id = p.id
       WHERE up.user_id = ?
       ORDER BY p.id DESC`,
      [userId]
    );
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

  async update(id, project_name, status, client_code) {
    await db.query(
      "UPDATE projects SET project_name = ?, status = ?, client_code = ?, updated_at = NOW() WHERE id = ?",
      [project_name, status, client_code, id]
    );
    return { id, project_name, status, client_code };
  },

  async delete(id) {
    await db.query("DELETE FROM projects WHERE id = ?", [id]);
  },

  async countAll() {
    const [rows] = await db.query("SELECT COUNT(*) AS total FROM projects");
    return rows[0].total;
  },

  async getRecentProjects(limit = 3) {
    const [rows] = await db.query(
      "SELECT id, project_name, status FROM projects ORDER BY created_at DESC LIMIT ?",
      [limit]
    );

    const statusMap = {
      0: "Pending",
      1: "Active",
      2: "Closed",
    };

    return rows.map((project) => ({
      ...project,
      status_text: statusMap[project.status],
    }));
  },
};

module.exports = Project;

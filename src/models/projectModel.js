const db = require("../config/db");

const Project = {
  async create(project_name) {
    const [result] = await db.query(
      "INSERT INTO projects (project_name) VALUES (?)",
      [project_name]
    );
    return { id: result.insertId, project_name };
  },

  async findAll() {
    const [rows] = await db.query("SELECT * FROM projects ORDER BY id DESC");
    return rows;
  },

  async findByName(project_name) {
    const [rows] = await db.query(
      "SELECT * FROM projects WHERE project_name = ?",
      [project_name]
    );
    return rows;
  },
};

module.exports = Project;

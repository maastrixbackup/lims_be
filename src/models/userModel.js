const db = require("../config/db");

const User = {
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  async create(name, email, password_hash, role_id, accessed_projects = null) {
    const accessedProjectsJson = accessed_projects
      ? JSON.stringify(accessed_projects)
      : null;

    const [result] = await db.query(
      "INSERT INTO users (name, email, password_hash, role_id, accessed_projects) VALUES (?,?,?,?,?)",
      [name, email, password_hash, role_id, accessedProjectsJson]
    );

    return { id: result.insertId, name, email, role_id, accessed_projects };
  },

  async findById(id) {
    const [rows] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
    return rows[0];
  },

  async updatePassword(id, newPassword) {
    await db.query("UPDATE users SET password_hash = ? WHERE id = ?", [
      newPassword,
      id,
    ]);
  },

  async usersList(roleId = null) {
    let query = `SELECT u.id,u.name,u.email,u.role_id,r.name AS role_name,u.accessed_projects,u.created_at
    FROM users u
    JOIN roles r ON u.role_id = r.id
    `;
    let params = [];
    if (roleId) {
      query += "WHERE u.role_id = ?";
      params.push(roleId);
    }
    const [rows] = await db.query(query, params);
    return rows;
  },
};

module.exports = User;

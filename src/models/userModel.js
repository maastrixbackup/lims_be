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
    await db.query(
      "UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?",
      [newPassword, id]
    );
  },

  async usersList(roleId = null) {
    let query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.role_id,
        r.name AS role_name,
        u.accessed_projects,
        u.created_at,
        GROUP_CONCAT(p.project_name ORDER BY p.id) AS accessed_projects_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN projects p 
          ON FIND_IN_SET(
              p.id,
              REPLACE(REPLACE(REPLACE(REPLACE(u.accessed_projects, '[',''), ']',''), '"',''), ' ', '')
            )
    `;

    let params = [];
    if (roleId) {
      query += " WHERE u.role_id = ?";
      params.push(roleId);
    }

    query += " GROUP BY u.id";

    const [rows] = await db.query(query, params);
    return rows;
  },

  async updateUser(id, name, email) {
    const [result] = await db.query(
      `UPDATE users SET name = ?,email = ?, updated_at = NOW() WHERE id = ?`,
      [name, email, id]
    );

    return { id, name, email };
  },
};

module.exports = User;

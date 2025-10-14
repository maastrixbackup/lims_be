const db = require("../config/db");

const User = {
  async findByEmail(email) {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    return rows[0];
  },

  async create(name, username, email, password_hash, role_id, profile_pic) {
    const [result] = await db.query(
      "INSERT INTO users (name, username, email, password_hash, role_id, profile_pic) VALUES (?,?,?,?,?,?)",
      [name, username, email, password_hash, role_id, profile_pic]
    );

    return { id: result.insertId, name, username, email, role_id, profile_pic };
  },

  async update(id, name, email, role_id) {
    await db.query(
      "UPDATE users SET name = ?, email = ?, role_id = ?, updated_at = NOW() WHERE id = ?",
      [name, email, role_id, id]
    );
  },

  async delete(id) {
    await db.query("DELETE FROM users WHERE id = ?", [id]);
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
        u.created_at,
        GROUP_CONCAT(p.project_name ORDER BY p.id) AS accessed_projects_name
        FROM users u
        JOIN roles r ON u.role_id = r.id
        LEFT JOIN user_projects up ON u.id = up.user_id
        LEFT JOIN projects p ON up.project_id = p.id
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

  async saveResetToken(userId, token) {
    return db.query("UPDATE users SET reset_token = ? WHERE id = ?", [
      token,
      userId,
    ]);
  },

  async getResetToken(userId) {
    const [rows] = await db.query(
      "SELECT reset_token FROM users WHERE id = ?",
      [userId]
    );
    return rows[0]?.reset_token || null;
  },

  async clearResetToken(userId) {
    return db.query("UPDATE users SET reset_token = NULL WHERE id = ?", [
      userId,
    ]);
  },
};

module.exports = User;

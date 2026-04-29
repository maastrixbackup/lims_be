const db = require("../config/db");

const UserProject = {
  async assignProjects(userId, projectIds) {
    if (!projectIds || projectIds.length === 0) return;

    const values = projectIds.map((pid) => [userId, pid]);
    await db.query("INSERT INTO user_projects (user_id, project_id) VALUES ?", [
      values,
    ]);
  },

  async deleteByUserId(userId) {
    await db.query("DELETE FROM user_projects WHERE user_id = ?", [userId]);
  },

  async getProjectsByUserId(userId) {
    const query = `
      SELECT p.id,p.project_name,p.status
      FROM user_projects up
      INNER JOIN projects p ON up.project_id = p.id
      WHERE up.user_id = ? AND p.status = 1
      ORDER BY p.project_name ASC
    `;
    const [rows] = await db.query(query, [userId]);
    return rows;
  },

  // async getProjectsByUserId(userId) {
  //   const [rows] = await db.query(
  //     "SELECT project_id FROM user_projects WHERE user_id = ?",
  //     [userId]
  //   );
  //   return rows.map((row) => row.project_id);
  // },
};

module.exports = UserProject;

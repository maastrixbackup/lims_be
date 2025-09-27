const db = require("../config/db");

const UserProject = {
  async assignProjects(userId, projectIds) {
    if (!projectIds || projectIds.length === 0) return;

    const values = projectIds.map((pid) => [userId, pid]);
    await db.query("INSERT INTO user_projects (user_id, project_id) VALUES ?", [
      values,
    ]);
  },

  async getProjectsByUserId(userId) {
    const [rows] = await db.query(
      "SELECT project_id FROM user_projects WHERE user_id = ?",
      [userId]
    );
    return rows.map((row) => row.project_id);
  },
};

module.exports = UserProject;

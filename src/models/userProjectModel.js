const db = require("../config/db");

const UserProject = {
  async assignProjects(userId, projectIds) {
    if (!projectIds || projectIds.length === 0) return;

    const values = projectIds.map((pid) => [userId, pid]);
    await db.query("INSERT INTO user_projects (user_id, project_id) VALUES ?", [
      values,
    ]);
  },
};

module.exports = UserProject;

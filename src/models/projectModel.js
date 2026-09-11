const db = require("../config/db");
const { countAll } = require("./logModel");

const Project = {
  async create(project_name, status = 0, client_code, type, project_location) {
    const [result] = await db.query(
      "INSERT INTO projects (project_name, status, client_code, type, project_location) VALUES (?, ?, ?, ?, ?)",
      [project_name, status, client_code, type, project_location]
    );
    return {
      id: result.insertId,
      project_name,
      status,
      client_code,
      type,
      project_location,
    };
  },

  async findAll({ limit, offset }) {
    const [rows] = await db.query(
      "SELECT * FROM projects ORDER BY id DESC LIMIT ? OFFSET ?",
      [limit, offset]
    );
    return rows;
  },

  async countAll() {
    const [[row]] = await db.query(`SELECT COUNT(*) AS total FROM projects`);
    return row.total;
  },

  async findActiveProjects() {
    const [rows] = await db.query(
      "SELECT project_name,status FROM projects WHERE status = 1 ORDER BY project_name ASC"
    );
    return rows;
  },

  async findByUserId({ userId, limit, offset }) {
    const [rows] = await db.query(
      `SELECT p.*
       FROM projects p
       JOIN user_projects up ON up.project_id = p.id
       WHERE up.user_id = ?
       ORDER BY p.id DESC LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );
    return rows;
  },

  async countByUserId(userId) {
    const [[row]] = await db.query(
      `
    SELECT COUNT(*) AS total
    FROM projects p
    JOIN user_projects pu ON pu.project_id = p.id
    WHERE pu.user_id = ?
    `,
      [userId]
    );
    return row.total;
  },

  async assignUserToProject(userId, projectId) {
    await db.query(
      "INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)",
      [userId, projectId]
    );
  },

  async getAccessedProjects(userId) {
    return db.query("SELECT project_id from user_projects WHERE user_id = ?", [
      userId,
    ]);
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

  async update(id, project_name, status, client_code, type, project_location) {
    await db.query(
      "UPDATE projects SET project_name = ?, status = ?, client_code = ?, type = ?, project_location = ?, updated_at = NOW() WHERE id = ?",
      [project_name, status, client_code, type, project_location, id]
    );
    return { id, project_name, status, client_code, type, project_location };
  },

  async updateClientCodeByProjectId(projectId, newClientCode) {
    const [result] = await db.query(
      `
      UPDATE khatas
      SET unique_id = CONCAT(
        ?, '/',
        SUBSTRING_INDEX(unique_id, '/', -2)
      )
      WHERE project_id = ?
      `,
      [newClientCode, projectId]
    );

    return result.affectedRows;
  },

  async delete(id) {
    await db.query("DELETE FROM projects WHERE id = ?", [id]);
  },

  // async countAll(projectId = null) {
  //   let query = "SELECT COUNT(*) AS total FROM projects";
  //   let params = [];
  //   if (projectId) {
  //     query += " WHERE project_id = ?";
  //     params.push(projectId);
  //   }
  //   const [rows] = await db.query(query, params);
  //   return rows[0].total;
  // },

  async countAll(projectIds = null) {
    let query = "SELECT COUNT(*) AS total FROM projects";
    let params = [];

    if (Array.isArray(projectIds) && projectIds.length > 0) {
      const placeholders = projectIds.map(() => "?").join(",");
      query += ` WHERE id IN (${placeholders})`;
      params.push(...projectIds);
    }

    const [rows] = await db.query(query, params);
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

  async findById(id) {
    const [rows] = await db.query(`SELECT * FROM projects WHERE id = ?`, [id]);
    return rows.length ? rows[0] : null;
  },
};

module.exports = Project;

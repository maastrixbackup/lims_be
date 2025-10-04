const db = require("../config/db");

const Log = {
  async create(
    userId,
    action,
    status,
    message,
    requestPayload = null,
    responsePayload = null
  ) {
    await db.query(
      `INSERT INTO logs (user_id, action, status, message, request_payload, response_payload) VALUES (?,?,?,?,?,?)`,
      [
        userId,
        action,
        status,
        message,
        requestPayload ? JSON.stringify(requestPayload) : null,
        responsePayload ? JSON.stringify(responsePayload) : null,
      ]
    );
  },

  async findAll({ page = 1, limit = 10 } = {}) {
    const offset = (page - 1) * limit;
    const [rows] = await db.query(
      `SELECT * FROM logs ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const parsedRows = rows.map((row) => ({
      ...row,
      request_payload: row.request_payload
        ? JSON.parse(row.request_payload)
        : null,
      response_payload: row.response_payload
        ? JSON.parse(row.response_payload)
        : null,
    }));
    return parsedRows;
  },

  async countAll() {
    const [rows] = await db.query(`SELECT COUNT(*) AS total FROM logs`);
    return rows[0].total;
  },
};

module.exports = Log;

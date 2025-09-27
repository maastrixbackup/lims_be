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
};

module.exports = Log;

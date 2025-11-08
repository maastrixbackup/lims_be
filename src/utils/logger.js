const Log = require("../models/logModel");

const logAction = async (
  userId,
  action,
  status,
  message,
  requestPayload = null,
  responsePayload = null
) => {
  try {
    await Log.create(
      userId,
      action,
      status,
      message,
      requestPayload ? JSON.stringify(requestPayload) : null,
      responsePayload ? JSON.stringify(responsePayload) : null
    );
  } catch (err) {
    console.error("Log Error:", err);
  }
};

module.exports = logAction;

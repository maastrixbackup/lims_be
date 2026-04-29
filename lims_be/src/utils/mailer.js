const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail", // Can also use SMTP: host, port, secure
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

module.exports = transporter;

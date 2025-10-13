const express = require("express");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const projectRoutes = require("./routes/projectRoutes");
const logRoutes = require("./routes/logRoutes");
const plotRoutes = require("./routes/plotRoutes");
const villageRoutes = require("./routes/villageRoutes");
const khataRoutes = require("./routes/khataRoutes");
const authMiddleware = require("./middleware/authMiddleware");

const app = express();
app.use(express.json());

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/role", authMiddleware, roleRoutes);
app.use("/api/project", authMiddleware, projectRoutes);
app.use("/api/log", authMiddleware, logRoutes);
app.use("/api/plots", plotRoutes);
app.use("/api/village", authMiddleware, villageRoutes);
app.use("/api/khata", authMiddleware, khataRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

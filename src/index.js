const express = require("express");
require("dotenv").config();
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roleRoutes = require("./routes/roleRoutes");
const projectRoutes = require("./routes/projectRoutes");
const logRoutes = require("./routes/logRoutes");
const plotRoutes = require("./routes/plotRoutes");
const govtPlotRoutes = require("./routes/govtPlotRoutes");
const villageRoutes = require("./routes/villageRoutes");
const khataRoutes = require("./routes/khataRoutes");
const govtkhataRoutes = require("./routes/govtKhataRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const reportRoutes = require("./routes/reportRoutes");

const forestLandRoutes = require("./routes/forestLandRoutes");

const authMiddleware = require("./middleware/authMiddleware");
const cors = require("cors");

const app = express();
app.enable("trust proxy");
const path = require("path");
app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 200,
    credentials: true,
  })
);

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/user", authMiddleware, userRoutes);
app.use("/api/role", authMiddleware, roleRoutes);
app.use("/api/project", authMiddleware, projectRoutes);
app.use("/api/log", authMiddleware, logRoutes);
app.use("/api/plots", authMiddleware, plotRoutes);
app.use("/api/govtplots", authMiddleware, govtPlotRoutes);
app.use("/api/village", authMiddleware, villageRoutes);
app.use("/api/khata", authMiddleware, khataRoutes);
app.use("/api/govtkhata", authMiddleware, govtkhataRoutes);
app.use("/api", authMiddleware, dashboardRoutes);
app.use("/api/report", authMiddleware, reportRoutes);

app.use("/api/forestland", authMiddleware, forestLandRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

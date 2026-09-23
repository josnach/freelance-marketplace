const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/userRoutes");
const jobRoutes = require("./src/routes/jobRoutes");
const proposalRoutes = require("./src/routes/proposalRoutes");
const milestoneRoutes = require("./src/routes/milestoneRoute");
const projectRoutes = require("./src/routes/projectRoutes");


const errorHandler = require("./src/middleware/errorMiddleware");

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*"
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Freelance Marketplace API is running"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/v1/jobs", jobRoutes);
app.use("/api", proposalRoutes);
app.use("/api", milestoneRoutes);
app.use("/api", projectRoutes);
app.use(errorHandler);

module.exports = app;
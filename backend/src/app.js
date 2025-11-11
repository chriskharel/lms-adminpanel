import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";

import router from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:3003",
      "http://localhost:3004"
    ], // allow all dev frontend ports
    credentials: true,
  })
);
app.use(morgan("dev"));

// avoid 404 noise for favicon requests in API-only server
app.get("/favicon.ico", (_req, res) => res.status(204).end());

// friendly root response
app.get("/", (_req, res) => {
  res.json({ message: "AdminLMS API", health: "/health", apiBase: "/api" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/test-db", async (_req, res) => {
  try {
    const pool = (await import("./config/db.js")).default;
    const [rows] = await pool.query("SELECT COUNT(*) as count FROM users");
    res.json({ status: "ok", userCount: rows[0].count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use("/api", router);

app.use(notFound);
app.use(errorHandler);

export default app;



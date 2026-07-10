import express from "express";
import cors from "cors";
import "dotenv/config";
import papersRouter from "./routes/papers.js";
import analyticsRouter from "./routes/analytics.js";
import { DOMAINS, READING_STAGES, IMPACT_SCORES, DATE_RANGES } from "./constants.js";

if (!process.env.DATABASE_URL) {
  console.error(
    "WARNING: DATABASE_URL is not set — DB-backed routes will fail with ECONNREFUSED to localhost."
  );
}

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/meta", (_req, res) => {
  res.json({ domains: DOMAINS, readingStages: READING_STAGES, impactScores: IMPACT_SCORES, dateRanges: DATE_RANGES });
});

app.use("/api/papers", papersRouter);
app.use("/api/analytics", analyticsRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));

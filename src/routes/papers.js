import { Router } from "express";
import pool from "../db/pool.js";
import { asyncHandler } from "../asyncHandler.js";
import { DOMAINS, READING_STAGES, IMPACT_SCORES } from "../constants.js";

const router = Router();

function toArray(value) {
  if (value === undefined) return undefined;
  return Array.isArray(value) ? value : [value];
}

function dateRangeToStart(range) {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  switch (range) {
    case "this_week": {
      const d = startOfDay(now);
      d.setDate(d.getDate() - d.getDay());
      return d;
    }
    case "this_month":
      return new Date(now.getFullYear(), now.getMonth(), 1);
    case "last_3_months":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    default:
      return null;
  }
}

router.get("/", asyncHandler(async (req, res) => {
  const stages = toArray(req.query.readingStage);
  const domains = toArray(req.query.domain);
  const impacts = toArray(req.query.impactScore);
  const dateRange = req.query.dateRange;

  const conditions = [];
  const params = [];

  if (stages?.length) {
    params.push(stages);
    conditions.push(`reading_stage = ANY($${params.length})`);
  }
  if (domains?.length) {
    params.push(domains);
    conditions.push(`domain = ANY($${params.length})`);
  }
  if (impacts?.length) {
    params.push(impacts);
    conditions.push(`impact_score = ANY($${params.length})`);
  }
  if (dateRange && dateRange !== "all_time") {
    const start = dateRangeToStart(dateRange);
    if (start) {
      params.push(start.toISOString().slice(0, 10));
      conditions.push(`date_added >= $${params.length}`);
    }
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await pool.query(
    `SELECT id, title, first_author, domain, reading_stage, citation_count, impact_score, date_added, created_at
     FROM papers ${where} ORDER BY date_added DESC, created_at DESC`,
    params
  );
  res.json(rows);
}));

router.post("/", asyncHandler(async (req, res) => {
  const { title, firstAuthor, domain, readingStage, citationCount, impactScore, dateAdded } = req.body;

  if (!title?.trim() || !firstAuthor?.trim()) {
    return res.status(400).json({ error: "Paper title and first author are required." });
  }
  if (!DOMAINS.includes(domain)) {
    return res.status(400).json({ error: "Invalid research domain." });
  }
  if (!READING_STAGES.includes(readingStage)) {
    return res.status(400).json({ error: "Invalid reading stage." });
  }
  if (!IMPACT_SCORES.includes(impactScore)) {
    return res.status(400).json({ error: "Invalid impact score." });
  }
  const citations = Number(citationCount);
  if (!Number.isInteger(citations) || citations < 0) {
    return res.status(400).json({ error: "Citation count must be a non-negative integer." });
  }

  const { rows } = await pool.query(
    `INSERT INTO papers (title, first_author, domain, reading_stage, citation_count, impact_score, date_added)
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE))
     RETURNING id, title, first_author, domain, reading_stage, citation_count, impact_score, date_added, created_at`,
    [title.trim(), firstAuthor.trim(), domain, readingStage, citations, impactScore, dateAdded || null]
  );
  res.status(201).json(rows[0]);
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  await pool.query("DELETE FROM papers WHERE id = $1", [req.params.id]);
  res.status(204).end();
}));

export default router;

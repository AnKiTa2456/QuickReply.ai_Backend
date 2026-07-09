import { Router } from "express";
import pool from "../db/pool.js";
import { asyncHandler } from "../asyncHandler.js";
import { DOMAINS, READING_STAGES } from "../constants.js";

const router = Router();

router.get("/", asyncHandler(async (_req, res) => {
  const [funnelResult, scatterResult, stackedResult, totalsResult, avgCitationsResult] = await Promise.all([
    pool.query(`SELECT reading_stage, COUNT(*)::int AS count FROM papers GROUP BY reading_stage`),
    pool.query(`SELECT id, title, citation_count, impact_score FROM papers`),
    pool.query(`SELECT domain, reading_stage, COUNT(*)::int AS count FROM papers GROUP BY domain, reading_stage`),
    pool.query(`SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE reading_stage = 'Fully Read')::int AS fully_read FROM papers`),
    pool.query(`SELECT domain, AVG(citation_count)::float AS avg_citations FROM papers GROUP BY domain`),
  ]);

  const funnelCounts = Object.fromEntries(funnelResult.rows.map((r) => [r.reading_stage, r.count]));
  const funnel = READING_STAGES.map((stage) => ({ stage, count: funnelCounts[stage] ?? 0 }));

  const scatter = scatterResult.rows.map((r) => ({
    id: r.id,
    title: r.title,
    citationCount: r.citation_count,
    impactScore: r.impact_score,
  }));

  const stackedMap = new Map();
  for (const domain of DOMAINS) {
    stackedMap.set(domain, { domain, ...Object.fromEntries(READING_STAGES.map((s) => [s, 0])) });
  }
  for (const row of stackedResult.rows) {
    stackedMap.get(row.domain)[row.reading_stage] = row.count;
  }
  const stackedByDomain = Array.from(stackedMap.values());

  const byStageCounts = Object.fromEntries(READING_STAGES.map((s) => [s, funnelCounts[s] ?? 0]));

  const avgCitationsMap = Object.fromEntries(avgCitationsResult.rows.map((r) => [r.domain, r.avg_citations]));
  const avgCitationsPerDomain = DOMAINS.map((domain) => ({
    domain,
    avgCitations: avgCitationsMap[domain] != null ? Number(avgCitationsMap[domain].toFixed(1)) : 0,
  }));

  const { total, fully_read } = totalsResult.rows[0];
  const completionRate = total > 0 ? Number(((fully_read / total) * 100).toFixed(1)) : 0;

  res.json({
    funnel,
    scatter,
    stackedByDomain,
    summary: {
      papersByStage: byStageCounts,
      avgCitationsPerDomain,
      completionRate,
      totalPapers: total,
      fullyReadCount: fully_read,
    },
  });
}));

export default router;

import "dotenv/config";
import pool from "./pool.js";

const SAMPLE_PAPERS = [
  { title: "Attention Is All You Need", first_author: "Vaswani", domain: "Computer Science", reading_stage: "Fully Read", citation_count: 90000, impact_score: "High Impact" },
  { title: "Deep Residual Learning", first_author: "He", domain: "Computer Science", reading_stage: "Notes Completed", citation_count: 180000, impact_score: "High Impact" },
  { title: "CRISPR Basics", first_author: "Doudna", domain: "Biology", reading_stage: "Abstract Read", citation_count: 1200, impact_score: "Medium Impact" },
  { title: "On the Origin of Mitochondria", first_author: "Margulis", domain: "Biology", reading_stage: "Methodology Done", citation_count: 300, impact_score: "Low Impact" },
  { title: "Quantum Entanglement Review", first_author: "Bell", domain: "Physics", reading_stage: "Results Analyzed", citation_count: 5400, impact_score: "Medium Impact" },
  { title: "Catalysis in Organic Chemistry", first_author: "Sharpless", domain: "Chemistry", reading_stage: "Introduction Done", citation_count: 50, impact_score: "Unknown" },
  { title: "Prime Number Distributions", first_author: "Tao", domain: "Mathematics", reading_stage: "Abstract Read", citation_count: 720, impact_score: "Medium Impact" },
  { title: "Social Capital in Networks", first_author: "Granovetter", domain: "Social Sciences", reading_stage: "Fully Read", citation_count: 15000, impact_score: "High Impact" },
];

async function seed() {
  const titles = SAMPLE_PAPERS.map((p) => p.title);
  await pool.query(`DELETE FROM papers WHERE title = ANY($1)`, [titles]);

  for (const p of SAMPLE_PAPERS) {
    await pool.query(
      `INSERT INTO papers (title, first_author, domain, reading_stage, citation_count, impact_score)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [p.title, p.first_author, p.domain, p.reading_stage, p.citation_count, p.impact_score]
    );
  }
  console.log(`Seeded ${SAMPLE_PAPERS.length} sample papers.`);
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

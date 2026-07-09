import pg from "pg";
import "dotenv/config";

const { Pool, types } = pg;

// OID 1082 = DATE. Return as raw "YYYY-MM-DD" string instead of a JS Date
// (which would otherwise get shifted by local timezone on JSON serialization).
types.setTypeParser(1082, (val) => val);

const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL ?? "");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Hosted Postgres (Render, Supabase, RDS, ...) requires SSL; local dev doesn't.
  ssl: isLocalDb ? false : { rejectUnauthorized: false },
});

export default pool;

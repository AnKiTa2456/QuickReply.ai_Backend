import pg from "pg";
import "dotenv/config";

const { Pool, types } = pg;

// OID 1082 = DATE. Return as raw "YYYY-MM-DD" string instead of a JS Date
// (which would otherwise get shifted by local timezone on JSON serialization).
types.setTypeParser(1082, (val) => val);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("supabase.co")
    ? { rejectUnauthorized: false }
    : false,
});

export default pool;

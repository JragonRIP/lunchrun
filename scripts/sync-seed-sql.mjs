import { readFileSync, writeFileSync } from "fs";
import { productsSql } from "./upsert-catalog.mjs";

const seedPath = new URL("../supabase/seed.sql", import.meta.url);
const seed = readFileSync(seedPath, "utf8");
const start = seed.indexOf("-- Products");
const end = seed.indexOf("-- Today's open lunch run session");
if (start < 0 || end < 0) {
  console.error("markers missing", start, end);
  process.exit(1);
}
const next = seed.slice(0, start) + productsSql() + "\n\n" + seed.slice(end);
writeFileSync(seedPath, next);
console.log("Updated supabase/seed.sql");

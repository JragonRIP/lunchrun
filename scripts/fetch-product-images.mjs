/**
 * Fetch product photos from Open Food Facts (open product data).
 * Usage: node scripts/fetch-product-images.mjs [--force]
 */
import { CATALOG } from "./upsert-catalog.mjs";
import { fetchMissingProductImages } from "./product-images.mjs";

const force = process.argv.includes("--force");
const results = await fetchMissingProductImages(CATALOG, { force });

console.log(`Downloaded: ${results.ok.length}`);
console.log(`Skipped (already had image): ${results.skipped.length}`);
console.log(`Failed: ${results.failed.length}`);

if (results.ok.length) {
  console.log("\nNew images:");
  for (const r of results.ok) console.log(`  ${r.external} — ${r.name}`);
}

if (results.failed.length) {
  console.log("\nCould not find image:");
  for (const r of results.failed) console.log(`  ${r.external ?? "?"} — ${r.name ?? r.reason}`);
}

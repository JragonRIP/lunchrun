import fs from "fs";
import path from "path";

export const PRODUCTS_DIR = path.join(process.cwd(), "public", "products");
const UA = "LunchRun/1.0 (school snack catalog; contact: lunchrun)";

export function resolveProductImagePath(externalId) {
  if (!externalId) return null;
  for (const ext of ["png", "jpg", "jpeg", "webp"]) {
    const file = path.join(PRODUCTS_DIR, `${externalId}.${ext}`);
    if (fs.existsSync(file)) return `/products/${externalId}.${ext}`;
  }
  return null;
}

export function withResolvedImages(catalog) {
  return catalog.map((row) => ({
    ...row,
    image_url:
      resolveProductImagePath(row.external_product_id) ?? row.image_url ?? null,
  }));
}

function normalize(s) {
  if (Array.isArray(s)) return normalize(s.join(" "));
  if (s == null) return "";
  return String(s)
    .toLowerCase()
    .replace(/[!']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function scoreHit(hit, product) {
  const pn = normalize(hit.product_name);
  const brands = normalize(hit.brands);
  const name = normalize(product.name);
  const brand = normalize(product.brand);
  let s = 0;

  if (brand) {
    const brandToken = brand.split(/[\s,]+/).find((t) => t.length > 2);
    if (brandToken && brands.includes(brandToken)) s += 35;
    if (pn.includes(brandToken)) s += 15;
  }

  for (const word of name.split(/\W+/)) {
    if (word.length < 3) continue;
    if (pn.includes(word)) s += 10;
  }

  const qty = normalize(hit.quantity);
  const size = normalize(product.size);
  if (size) {
    const oz = size.match(/([\d.]+)\s*oz/);
    if (oz && qty.includes(oz[1])) s += 20;
    const floz = size.match(/([\d.]+)\s*fl/);
    if (floz && qty.includes(floz[1])) s += 20;
  }

  if (hit.image_front_url || hit.image_url) s += 5;
  return s;
}

async function searchOffLegacy(query) {
  const url =
    `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}` +
    "&search_simple=1&action=process&json=1&page_size=8" +
    "&fields=product_name,brands,image_front_url,image_url,quantity";
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products ?? [];
}

async function searchOffV2(query) {
  const url = `https://search.openfoodfacts.org/search?q=${encodeURIComponent(query)}&page_size=8`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return [];
  const data = await res.json();
  return (data.hits ?? []).map((h) => ({
    product_name: h.product_name,
    brands: h.brands,
    image_front_url: h.image_front_url,
    image_url: h.image_url,
    quantity: h.quantity,
  }));
}

function buildQueries(product) {
  const clean = product.name.replace(/!/g, "").trim();
  const parts = [
    `${product.brand ?? ""} ${clean} ${product.size ?? ""}`.trim(),
    `${product.brand ?? ""} ${clean}`.trim(),
    clean,
    `${product.brand ?? ""} ${product.flavor ?? ""} ${product.size ?? ""}`.trim(),
  ];
  return [...new Set(parts.filter((q) => q.length > 3))];
}

function pickImageUrl(hit) {
  return hit.image_front_url || hit.image_url || null;
}

function upscaleOffUrl(url) {
  if (!url) return url;
  return url.replace(/\.(\d+)\.(400|200)\.jpg$/, ".$1.full.jpg");
}

export async function findProductImage(product) {
  const queries = buildQueries(product);
  let best = null;
  let bestScore = 0;

  for (const query of queries) {
    const hits = [...(await searchOffLegacy(query)), ...(await searchOffV2(query))];
    for (const hit of hits) {
      const img = pickImageUrl(hit);
      if (!img) continue;
      const s = scoreHit(hit, product);
      if (s > bestScore) {
        bestScore = s;
        best = upscaleOffUrl(img);
      }
    }
    if (bestScore >= 45) break;
    await sleep(150);
  }

  if (bestScore < 25) return null;
  return best;
}

export async function downloadImage(url, destPath) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 500) return false;
  fs.mkdirSync(path.dirname(destPath), { recursive: true });
  fs.writeFileSync(destPath, buf);
  return true;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function fetchMissingProductImages(catalog, { force = false } = {}) {
  fs.mkdirSync(PRODUCTS_DIR, { recursive: true });
  const results = { ok: [], skipped: [], failed: [] };

  for (const product of catalog) {
    const external = product.external_product_id;
    if (!external) {
      results.failed.push({ external, reason: "no external id" });
      continue;
    }

    const existing = resolveProductImagePath(external);
    if (existing && !force) {
      results.skipped.push({ external, path: existing });
      continue;
    }

    const imageUrl = await findProductImage(product);
    if (!imageUrl) {
      results.failed.push({ external, name: product.name, reason: "no match" });
      await sleep(200);
      continue;
    }

    const dest = path.join(PRODUCTS_DIR, `${external}.jpg`);
    const ok = await downloadImage(imageUrl, dest);
    if (ok) {
      results.ok.push({ external, name: product.name, file: `/products/${external}.jpg` });
    } else {
      results.failed.push({ external, name: product.name, reason: "download failed" });
    }
    await sleep(250);
  }

  return results;
}

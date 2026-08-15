const fs = require("node:fs/promises");
const path = require("node:path");
const {parseBook} = require("./parseBook");
const { discoverBookUrls } = require("./discover");

const OUTPUT_DIR = path.join(__dirname, "..", "output");
const BOOKS_FILE = path.join(OUTPUT_DIR, "books.json");
const REPORT_FILE = path.join(OUTPUT_DIR, "run-report.json");

const BASE_URL = "https://books.toscrape.com/";
const CACHE_DIR = path.join(__dirname, "..", "cache");

const USER_AGENT =
  "FlyRank-PoliteScraper/1.0 (+https://github.com/Ibsa-M/flyrank-backend-engineering)";

const REQUEST_TIMEOUT_MS = 10000;

function getCacheFile(pageNumber) {
  return path.join(
    CACHE_DIR,
    `catalogue-page-${pageNumber}.html`
  );
}

async function fetchWithTimeout(url) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(
        `HTTP request failed: ${response.status} ${response.statusText}`
      );
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function getCataloguePage(url, pageNumber) {
  const cacheFile = getCacheFile(pageNumber);

  try {
    const cachedHtml = await fs.readFile(cacheFile, "utf8");

    console.log(`CACHE HIT: page=${pageNumber}`);
    console.log(`bytes=${Buffer.byteLength(cachedHtml, "utf8")}`);

    return cachedHtml;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  console.log(`FETCH: page=${pageNumber} ${url}`);

  const response = await fetchWithTimeout(url);
  const html = await response.text();

  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cacheFile, html, "utf8");

  console.log(`status=${response.status}`);
  console.log(`bytes=${Buffer.byteLength(html, "utf8")}`);
  console.log(`saved=${cacheFile}`);

  return html;
}

async function main() {
  const startedAt = new Date();
  const startedAtMs = Date.now();

  let currentPageUrl = BASE_URL;

  for (let pageNumber = 1; pageNumber <= 3; pageNumber++) {
    const html = await getCataloguePage(
      currentPageUrl,
      pageNumber
    );

    if (pageNumber < 3) {
      const $ = require("cheerio").load(html);
      const nextHref = $("li.next a").attr("href");

      if (!nextHref) {
        throw new Error(
          `Could not find next page after page ${pageNumber}`
        );
      }

      currentPageUrl = new URL(
        nextHref,
        currentPageUrl
      ).href;
    }
  }

  const bookUrls = await discoverBookUrls();

  console.log(`book_urls=${bookUrls.length}`);

  const results = await fetchDetailPages(bookUrls);
    const records = [];

  for (const result of results) {
    if (result.error || !result.html) {
      continue;
    }

    try {
      const record = parseBook(result.html, result.url);
      records.push(record);
    } catch (error) {
      console.error(
        `PARSE ERROR: ${result.url} - ${error.message}`
      );
    }
  }

  const invalidRecords = records.filter(
    (record) =>
      !record.title ||
      !record.product_url ||
      !record.price_text ||
      typeof record.price_gbp !== "number" ||
      !record.availability_text ||
      !record.rating_text ||
      typeof record.rating !== "number" ||
      !record.description ||
      !record.source_page ||
      !record.fetched_at
  );

  const validRecords = records.filter(
    (record) =>
      record.title &&
      record.product_url &&
      record.price_text &&
      typeof record.price_gbp === "number" &&
      record.availability_text &&
      record.rating_text &&
      typeof record.rating === "number" &&
      record.description &&
      record.source_page &&
      record.fetched_at
  );

  const fetched = results.filter(
    (result) => !result.cached && !result.error
  ).length;

  const cacheHits = results.filter(
    (result) => result.cached
  ).length;

  const failures = results.filter(
    (result) => result.error
  ).length;

  const durationMs = Date.now() - startedAtMs;

  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  await fs.writeFile(
    BOOKS_FILE,
    JSON.stringify(validRecords, null, 2),
    "utf8"
  );

  const report = {
    started_at: startedAt.toISOString(),
    duration_ms: durationMs,
    pages_fetched: fetched,
    cache_hits: cacheHits,
    valid_records: validRecords.length,
    invalid_records: invalidRecords.length,
    failed_pages: failures,
  };

  await fs.writeFile(
    REPORT_FILE,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  console.log(`detail_urls=${bookUrls.length}`);
  console.log(`fetched=${fetched}`);
  console.log(`cache_hits=${cacheHits}`);
  console.log(`failures=${failures}`);
  console.log(`records=${records.length}`);
  console.log(`valid_records=${validRecords.length}`);
  console.log(`invalid_records=${invalidRecords.length}`);
  console.log(`books_file=${BOOKS_FILE}`);
  console.log(`report_file=${REPORT_FILE}`);
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exitCode = 1;
});


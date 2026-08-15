const fs = require("node:fs/promises");
const path = require("node:path");

const TARGET_URL = "https://books.toscrape.com/";
const CACHE_FILE = path.join(
  __dirname,
  "..",
  "cache",
  "catalogue-page-1.html"
);

const USER_AGENT =
  "FlyRank-PoliteScraper/1.0 (+https://github.com/Ibsa-M/flyrank-backend-engineering)";

const REQUEST_TIMEOUT_MS = 10000;

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

async function getCataloguePage() {
  try {
    const cachedHtml = await fs.readFile(CACHE_FILE, "utf8");

    console.log(`CACHE HIT: ${CACHE_FILE}`);
    console.log(`bytes=${Buffer.byteLength(cachedHtml, "utf8")}`);

    return cachedHtml;
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  console.log(`FETCH: ${TARGET_URL}`);

  const response = await fetchWithTimeout(TARGET_URL);
  const html = await response.text();

  await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
  await fs.writeFile(CACHE_FILE, html, "utf8");

  console.log(`status=${response.status}`);
  console.log(`bytes=${Buffer.byteLength(html, "utf8")}`);
  console.log(`saved=${CACHE_FILE}`);

  return html;
}

async function main() {
  await getCataloguePage();
}

main().catch((error) => {
  console.error(`ERROR: ${error.message}`);
  process.exitCode = 1;
});
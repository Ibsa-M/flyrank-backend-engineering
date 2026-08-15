const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const CACHE_DIR = path.join(__dirname, "..", "cache", "details");

const USER_AGENT =
  "FlyRank-PoliteScraper/1.0 (+https://github.com/Ibsa-M/flyrank-backend-engineering)";

const REQUEST_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 1000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getCacheFile(url) {
  const hash = crypto
    .createHash("sha256")
    .update(url)
    .digest("hex")
    .slice(0, 16);

  return path.join(CACHE_DIR, `${hash}.html`);
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
        `HTTP ${response.status} ${response.statusText}`
      );
    }

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchDetailPage(url, index, total) {
  const cacheFile = getCacheFile(url);

  try {
    const html = await fs.readFile(cacheFile, "utf8");

    console.log(
      `CACHE HIT ${index}/${total}: ${url} bytes=${Buffer.byteLength(
        html,
        "utf8"
      )}`
    );

    return {
      url,
      html,
      cached: true,
    };
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

console.log(
  `[${new Date().toISOString()}] FETCH ${index}/${total}: ${url}`
);
  const startedAt = Date.now();

  try {
    const response = await fetchWithTimeout(url);
    const html = await response.text();

    await fs.mkdir(CACHE_DIR, { recursive: true });
    await fs.writeFile(cacheFile, html, "utf8");

    const durationMs = Date.now() - startedAt;

    console.log(
      `SUCCESS ${index}/${total}: status=${response.status} bytes=${Buffer.byteLength(
        html,
        "utf8"
      )} duration_ms=${durationMs}`
    );

    return {
      url,
      html,
      cached: false,
    };
  } catch (error) {
    console.error(
      `ERROR ${index}/${total}: ${url} - ${error.message}`
    );

    return {
      url,
      html: null,
      cached: false,
      error: error.message,
    };
  }
}

async function fetchDetailPages(urls) {
  const results = [];

  for (let index = 0; index < urls.length; index++) {
    const result = await fetchDetailPage(
      urls[index],
      index + 1,
      urls.length
    );

    results.push(result);

    if (index < urls.length - 1) {
      await sleep(REQUEST_DELAY_MS);
    }
  }

  return results;
}

module.exports = {
  fetchDetailPages,
};

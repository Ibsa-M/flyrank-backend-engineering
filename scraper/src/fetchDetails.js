const fs = require("node:fs/promises");
const path = require("node:path");
const crypto = require("node:crypto");

const CACHE_DIR = path.join(__dirname, "..", "cache", "details");

const USER_AGENT =
  "FlyRank-PoliteScraper/1.0 (+https://github.com/Ibsa-M/flyrank-backend-engineering)";

const REQUEST_TIMEOUT_MS = 10000;
const REQUEST_DELAY_MS = 1000;
const RETRY_DELAY_MS = 1000;

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

    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function shouldRetry(error) {
  if (error.name === "AbortError") {
    return true;
  }

  if (error.status >= 500 && error.status <= 599) {
    return true;
  }

  return false;
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
      attempts: 0,
    };
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }
  }

  for (let attempt = 1; attempt <= 2; attempt++) {
    console.log(
      `[${new Date().toISOString()}] FETCH ${index}/${total} attempt=${attempt}: ${url}`
    );

    const startedAt = Date.now();

    try {
      const response = await fetchWithTimeout(url);

      if (!response.ok) {
        const error = new Error(
          `HTTP ${response.status} ${response.statusText}`
        );

        error.status = response.status;

        if (!shouldRetry(error) || attempt === 2) {
          throw error;
        }

        console.log(
          `RETRY ${index}/${total}: status=${response.status} waiting=${RETRY_DELAY_MS}ms`
        );

        await sleep(RETRY_DELAY_MS);
        continue;
      }

      const html = await response.text();

      await fs.mkdir(CACHE_DIR, { recursive: true });
      await fs.writeFile(cacheFile, html, "utf8");

      const durationMs = Date.now() - startedAt;

      console.log(
        `SUCCESS ${index}/${total}: status=${response.status} bytes=${Buffer.byteLength(
          html,
          "utf8"
        )} duration_ms=${durationMs} attempts=${attempt}`
      );

      return {
        url,
        html,
        cached: false,
        attempts: attempt,
      };
    } catch (error) {
      const retryable = shouldRetry(error);

      if (retryable && attempt === 1) {
        console.log(
          `RETRY ${index}/${total}: ${error.message} waiting=${RETRY_DELAY_MS}ms`
        );

        await sleep(RETRY_DELAY_MS);
        continue;
      }

      console.error(
        `FAILED ${index}/${total}: ${url} - ${error.message}`
      );

      return {
        url,
        html: null,
        cached: false,
        attempts: attempt,
        error: error.message,
      };
    }
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
const fs = require("node:fs/promises");
const path = require("node:path");
const cheerio = require("cheerio");

const BASE_URL = "https://books.toscrape.com/";
const CACHE_DIR = path.join(__dirname, "..", "cache");

async function readCataloguePage(pageNumber) {
  const fileName =
    pageNumber === 1
      ? "catalogue-page-1.html"
      : `catalogue-page-${pageNumber}.html`;

  const filePath = path.join(CACHE_DIR, fileName);

  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if (error.code !== "ENOENT") {
      throw error;
    }

    throw new Error(
      `Missing cache file for catalogue page ${pageNumber}: ${filePath}`
    );
  }
}

function extractBookLinks(html, pageUrl) {
  const $ = cheerio.load(html);
  const urls = [];

  $("article.product_pod h3 a").each((_, element) => {
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    const absoluteUrl = new URL(href, pageUrl).href;
    urls.push(absoluteUrl);
  });

  return urls;
}

function findNextPage(html, pageUrl) {
  const $ = cheerio.load(html);
  const href = $("li.next a").attr("href");

  if (!href) {
    return null;
  }

  return new URL(href, pageUrl).href;
}

async function discoverBookUrls() {
  const uniqueUrls = new Set();
  let currentPageUrl = BASE_URL;
  let totalDiscovered = 0;

  for (let pageNumber = 1; pageNumber <= 3; pageNumber++) {
    const html = await readCataloguePage(pageNumber);

    const pageUrls = extractBookLinks(html, currentPageUrl);

    totalDiscovered += pageUrls.length;

    for (const url of pageUrls) {
      uniqueUrls.add(url);
    }

    console.log(
      `page=${pageNumber} discovered=${pageUrls.length} url=${currentPageUrl}`
    );

    if (pageNumber < 3) {
      const nextPageUrl = findNextPage(html, currentPageUrl);

      if (!nextPageUrl) {
        throw new Error(
          `Expected a next-page link after catalogue page ${pageNumber}`
        );
      }

      currentPageUrl = nextPageUrl;
    }
  }

  console.log(`catalogue_pages=3`);
  console.log(`discovered=${totalDiscovered}`);
  console.log(`unique=${uniqueUrls.size}`);

  return [...uniqueUrls];
}

module.exports = {
  discoverBookUrls,
};
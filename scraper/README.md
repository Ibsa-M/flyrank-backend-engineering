# The Polite Scraper

A small Node.js web-scraping pipeline built for the FlyRank Backend
Engineering internship — Week 5, Assignment A9.

The scraper collects structured book information from **Books to Scrape**,
a public practice website designed specifically for learning and practicing
web scraping.

The implementation focuses on a limited scraping scope, caching,
request timeouts, retry behavior, data normalization, validation, and
responsible request behavior.

## Target Classification

### Target

[Books to Scrape](https://books.toscrape.com/)

### Why this target?

Books to Scrape is a public practice sandbox created specifically for learning and practicing web scraping.

This makes it appropriate for the assignment's scraping exercise.

### Scope

This scraper will process only the first three catalogue pages and discover the book pages linked from those pages.

Expected scope:
This limited scope matches the assignment and keeps the scraper focused on the practice sandbox rather than collecting unnecessary data.

- 3 catalogue pages
- 60 unique book URLs
- 60 book detail pages

### Data to collect

For each book, the scraper will collect:

- `title`
- `product_url`
- `price_text`
- `availability_text`
- `rating_text`
- `description`
- `source_page`
- `fetched_at`

The normalized record will also contain `price_gbp`.

### robots.txt

The requested `https://books.toscrape.com/robots.txt` returned HTTP 404.

Result: no robots file found.

A missing `robots.txt` is not treated as permission to scrape. The target is appropriate for this assignment because Books to Scrape is explicitly provided as a practice sandbox.

### Responsible scraping

The scraper will be limited to the assignment's three catalogue pages and will use polite request behavior, including an identifying User-Agent, request timeout, caching during development, and a delay between real requests.

---

## How to Run

From the `scraper/` directory:

```bash
node src/index.js


> I will not reuse this code on another site without checking its rules and terms first.
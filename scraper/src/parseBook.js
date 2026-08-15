const cheerio = require("cheerio");

const RATING_MAP = {
  One: 1,
  Two: 2,
  Three: 3,
  Four: 4,
  Five: 5,
};

function parsePrice(priceText) {
  const normalized = priceText.replace("£", "").trim();
  const price = Number.parseFloat(normalized);

  if (Number.isNaN(price)) {
    throw new Error(`Could not parse price: "${priceText}"`);
  }

  return price;
}

function parseRating(ratingElement) {
  const classes = ratingElement.attr("class")?.split(/\s+/) || [];
  const ratingText = classes.find((className) =>
    Object.prototype.hasOwnProperty.call(RATING_MAP, className)
  );

  if (!ratingText) {
    throw new Error("Could not determine book rating");
  }

  return {
    rating_text: ratingText,
    rating: RATING_MAP[ratingText],
  };
}

function parseBook(html, productUrl) {
  const $ = cheerio.load(html);

  const title = $("h1").text().trim();
  const priceText = $(".price_color").first().text().trim();
  const availabilityText = $(".availability").first().text().trim();

  const ratingElement = $(".star-rating").first();
  const description = $("#product_description")
    .next("p")
    .text()
    .trim();

  if (!title) {
    throw new Error("Book title is missing");
  }

  if (!priceText) {
    throw new Error(`Price is missing for ${productUrl}`);
  }

  if (!availabilityText) {
    throw new Error(`Availability is missing for ${productUrl}`);
  }

  if (!ratingElement.length) {
    throw new Error(`Rating is missing for ${productUrl}`);
  }

  if (!description) {
    throw new Error(`Description is missing for ${productUrl}`);
  }

  const { rating_text, rating } = parseRating(ratingElement);

  return {
    title,
    product_url: productUrl,
    price_text: priceText,
    price_gbp: parsePrice(priceText),
    availability_text: availabilityText,
    rating_text,
    rating,
    description,
    source_page: productUrl,
    fetched_at: new Date().toISOString(),
  };
}

module.exports = {
  parseBook,
};
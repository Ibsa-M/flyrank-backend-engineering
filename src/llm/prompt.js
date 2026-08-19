const PROMPT_VERSION = 'enrich-book-v1';

const SYSTEM_PROMPT = `
You enrich book records.

Rules:
1. Classify the book into exactly one allowed category.
2. Write a short summary based only on the supplied title and description.
3. Never invent facts that are not supported by the supplied data.
4. If the description is missing, include "missing_description" in quality_flags.
5. If the category is uncertain, use "other" and include "uncertain_category".
6. Return only the requested structured JSON object.
`;

function buildEnrichmentPrompt({ title, description }) {
  return `
Book title:
${title}

Book description:
${description ?? '[No description available]'}
`;
}

function buildRepairPrompt({ originalInput, rawOutput, error }) {
  return `
The previous enrichment response was rejected.

Original book:
Title: ${originalInput.title}
Description: ${originalInput.description ?? '[No description available]'}

Previous response:
${rawOutput}

Validation/parsing error:
${error}

Return ONLY a corrected JSON object matching the required book enrichment schema.
Do not use Markdown code fences.
Do not add explanations.
`;
}

module.exports = {
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  buildEnrichmentPrompt,
  buildRepairPrompt
};

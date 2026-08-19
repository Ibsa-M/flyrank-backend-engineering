const client = require('./client');

const {
  enrichOutputSchema,
  enrichOutputJsonSchema
} = require('./schema');

const {
  SYSTEM_PROMPT,
  buildEnrichmentPrompt
} = require('./prompt');

function extractJson(content) {
  const trimmed = content.trim();

  if (trimmed.startsWith('```json') && trimmed.endsWith('```')) {
    return trimmed
      .replace(/^```json\s*/, '')
      .replace(/\s*```$/, '');
  }

  return trimmed;
}

async function enrichBook(input) {
  if (process.env.LLM_STUB === '1') {
    const result = {
      category: 'other',
      summary: `Stub enrichment for "${input.title}".`,
      quality_flags: input.description
        ? []
        : ['missing_description']
    };

    return enrichOutputSchema.parse(result);
  }

  const response = await client.chat.completions.create({
    model: process.env.LLM_MODEL,

    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: buildEnrichmentPrompt(input)
      }
    ],

    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'book_enrichment',
        strict: true,
        schema: enrichOutputJsonSchema
      }
    }
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('LLM returned empty content');
  }

  const jsonText = extractJson(content);
  const parsed = JSON.parse(jsonText);

  const validated = enrichOutputSchema.parse(parsed);

  return validated;
}

module.exports = {
  enrichBook
};
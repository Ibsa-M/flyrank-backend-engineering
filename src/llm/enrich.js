const { enrichOutputSchema } = require('./schema');

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

  throw new Error('Real LLM enrichment is not implemented yet.');
}

module.exports = {
  enrichBook
};
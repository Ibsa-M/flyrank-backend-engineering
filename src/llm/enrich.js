const client = require('./client');
const { parseJsonOutput } = require('./parser');
const { writeQuarantineRecord } = require('./quarantine');
const { withRetry } = require('./retry');
const { logLlmUsage } = require('./usageLogger');

const {
  enrichOutputSchema,
  enrichOutputJsonSchema
} = require('./schema');

const {
  PROMPT_VERSION,
  SYSTEM_PROMPT,
  buildEnrichmentPrompt,
  buildRepairPrompt
} = require('./prompt');


async function callLlm(messages, { repair = false } = {}) {
  const startedAt = Date.now();

  const { result } = await withRetry(
    () =>
      client.chat.completions.create({
        model: process.env.LLM_MODEL,
        messages,
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'book_enrichment',
            strict: true,
            schema: enrichOutputJsonSchema
          }
        }
      }),
    {
      maxRetries: Number(process.env.LLM_MAX_RETRIES || 2)
    }
  );

  const durationMs = Date.now() - startedAt;

  logLlmUsage({
    promptVersion: PROMPT_VERSION,
    model: process.env.LLM_MODEL,
    usage: result.usage,
    durationMs,
    repair
  });

  const content = result.choices[0]?.message?.content;

  if (!content) {
    throw new Error('LLM returned empty content');
  }

  return content;
}

async function enrichBook(input) {

  // --------------------------------------------------
  // STUB MODE
  // --------------------------------------------------
  
  if (process.env.LLM_ENABLED === 'false') {
  return {
    category: 'other',
    summary: `LLM enrichment disabled for "${input.title}".`,
    quality_flags: ['llm_disabled']
  };
}

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


  // --------------------------------------------------
  // FIRST LLM ATTEMPT
  // --------------------------------------------------

  const messages = [
    {
      role: 'system',
      content: SYSTEM_PROMPT
    },
    {
      role: 'user',
      content: buildEnrichmentPrompt(input)
    }
  ];

  const rawOutput = await callLlm(messages);

  // --------------------------------------------------
  // FIRST PARSE + VALIDATION
  // --------------------------------------------------

  try {
    const parsed = parseJsonOutput(rawOutput);

    return enrichOutputSchema.parse(parsed);

  } catch (firstError) {

    console.log(
      'Initial LLM output rejected. Attempting one repair.'
    );


    // ------------------------------------------------
    // ONE REPAIR ATTEMPT
    // ------------------------------------------------

    const repairMessages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      {
        role: 'user',
        content: buildRepairPrompt({
          originalInput: input,
          rawOutput,
          error: firstError.message
        })
      }
    ];

    const repairedOutput = await callLlm(repairMessages, { repair: true });


    // ------------------------------------------------
    // REPAIR PARSE + VALIDATION
    // ------------------------------------------------

    try {
      const repairedParsed = parseJsonOutput(testRepairedOutput);

      return enrichOutputSchema.parse(repairedParsed);

    } catch (repairError) {


      // ----------------------------------------------
      // QUARANTINE
      // ----------------------------------------------

      writeQuarantineRecord({
        input,
        raw_output: testRepairedOutput,
        error: repairError.message,
        prompt_version: PROMPT_VERSION,
        timestamp: new Date().toISOString()
      });


      // ----------------------------------------------
      // RETURN CONTROLLED 422 ERROR
      // ----------------------------------------------

      const error = new Error(
        'LLM output could not be validated after one repair attempt'
      );

      error.statusCode = 422;

      throw error;
    }
  }
}


module.exports = {
  enrichBook
};
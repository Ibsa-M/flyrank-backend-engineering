const client = require('./client');
const { parseJsonOutput } = require('./parser');
const { writeQuarantineRecord } = require('./quarantine');

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


async function callLlm(messages) {
  const response = await client.chat.completions.create({
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
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    throw new Error('LLM returned empty content');
  }

  return content;
}


async function enrichBook(input) {

  // --------------------------------------------------
  // STUB MODE
  // --------------------------------------------------

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

    const repairedOutput = await callLlm(repairMessages);


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
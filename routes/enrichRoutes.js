const express = require('express');
const router = express.Router();

const {
  enrichInputSchema
} = require('../src/llm/schema');

const {
  enrichBook
} = require('../src/llm/enrich');

router.post('/', async (req, res) => {
  const parsed = enrichInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: parsed.error.issues
    });
  }

  try {
    const result = await enrichBook(parsed.data);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Enrichment error:', error);

    return res.status(500).json({
      error: 'Enrichment failed'
    });
  }
});

module.exports = router;
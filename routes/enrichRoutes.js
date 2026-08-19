const express = require('express');
const router = express.Router();

const {
  enrichInputSchema
} = require('../src/llm/schema');

const {
  enrichBook
} = require('../src/llm/enrich');


router.post('/', async (req, res) => {

  // -----------------------------------------------
  // Validate incoming request
  // -----------------------------------------------

  const parsed = enrichInputSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid request',
      details: parsed.error.issues
    });
  }


  // -----------------------------------------------
  // Run enrichment
  // -----------------------------------------------

  try {

    const result = await enrichBook(parsed.data);

    return res.status(200).json(result);

  } catch (error) {

    console.error('Enrichment error:', error);


    // ---------------------------------------------
    // Controlled application errors
    // ---------------------------------------------

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      error: error.message
    });
  }
});


module.exports = router;
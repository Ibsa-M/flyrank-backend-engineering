const { z } = require('zod');

const enrichInputSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).nullable()
});

const enrichOutputSchema = z.object({
  category: z.enum([
    'fiction',
    'nonfiction',
    'business',
    'technology',
    'history',
    'science',
    'biography',
    'poetry',
    'other'
  ]),
  summary: z.string().min(1).max(500),
  quality_flags: z.array(
    z.enum([
      'missing_description',
      'weak_description',
      'uncertain_category'
    ])
  )
});

module.exports = {
  enrichInputSchema,
  enrichOutputSchema
};
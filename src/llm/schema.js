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

const enrichOutputJsonSchema = {
  type: 'object',
  properties: {
    category: {
      type: 'string',
      enum: [
        'fiction',
        'nonfiction',
        'business',
        'technology',
        'history',
        'science',
        'biography',
        'poetry',
        'other'
      ]
    },
    summary: {
      type: 'string'
    },
    quality_flags: {
      type: 'array',
      items: {
        type: 'string',
        enum: [
          'missing_description',
          'weak_description',
          'uncertain_category'
        ]
      }
    }
  },
  required: [
    'category',
    'summary',
    'quality_flags'
  ],
  additionalProperties: false
};

module.exports = {
  enrichInputSchema,
  enrichOutputSchema,
  enrichOutputJsonSchema
};
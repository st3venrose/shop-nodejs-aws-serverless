export default {
  title: 'CreateProduct',
  type: 'object',
  description: 'Validation model for Creating Product',
  properties: {
    title: { type: 'string', minLength: 1, maxLength: 255 },
    description: { type: 'string', minLength: 1, maxLength: 255 },
    price: { type: 'integer' },
    logo: { type: 'string' },
    count: { type: 'integer' }
  },
  required: ['title', 'description', 'price', 'count']
} as const;

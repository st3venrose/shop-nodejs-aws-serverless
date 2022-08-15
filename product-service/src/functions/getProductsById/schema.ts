export default {
  type: 'object',
  name: 'GetProductById',
  description: 'Validation model for Creating Posts',
  properties: {
    pathParameters: {
      productId: {
        id: true,
      }
    }
  },
  required: ['productId']
} as const;

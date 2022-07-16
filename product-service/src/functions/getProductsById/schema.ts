export default {
  type: "object",
  properties: {
    pathParameters: {
      type: 'object',
      required: ['productId'],
      properties: {
        productId: {
          type: 'string',
          minLength: 12, maxLength: 100
        }
      }
    }
  },
  required: ['pathParameters']
} as const;

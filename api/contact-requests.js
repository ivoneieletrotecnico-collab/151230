import { handleContactRequestsRequest } from '../lib/api-service.js';

export default async function handler(request, response) {
  const result = await handleContactRequestsRequest(request.method || 'GET', request.body);
  response.setHeader('Cache-Control', 'no-store');
  response.status(result.statusCode).json(result.payload);
}

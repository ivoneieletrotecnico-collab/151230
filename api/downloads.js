import { handleDownloadsRequest } from '../lib/api-service.js';

export default async function handler(request, response) {
  try {
    const result = await handleDownloadsRequest(request.method || 'GET', request.body, request);
    response.setHeader('Cache-Control', 'no-store');
    response.status(result.statusCode).json(result.payload);
  } catch (error) {
    response.setHeader('Cache-Control', 'no-store');
    response.status(error?.statusCode || 500).json({
      error: error?.code || 'INTERNAL_ERROR',
      message: error?.message || 'Falha inesperada ao processar downloads.',
    });
  }
}

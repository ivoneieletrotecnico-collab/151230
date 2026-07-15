import { handleAuthRequest } from '../lib/auth.js';

export default async function handler(request, response) {
  try {
    const result = await handleAuthRequest(request.method || 'GET', request.body, request);

    if (result?.headers) {
      for (const [headerName, headerValue] of Object.entries(result.headers)) {
        response.setHeader(headerName, headerValue);
      }
    }

    response.setHeader('Cache-Control', 'no-store');
    response.status(result.statusCode).json(result.payload);
  } catch (error) {
    response.setHeader('Cache-Control', 'no-store');
    response.status(error?.statusCode || 500).json({
      error: error?.code || 'INTERNAL_ERROR',
      message: error?.message || 'Falha inesperada ao processar autenticacao.',
    });
  }
}

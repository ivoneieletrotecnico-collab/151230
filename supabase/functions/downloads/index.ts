import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { handleDownloadsRequest } from '../_shared/api-service.ts';

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const body = req.method === 'GET' || req.method === 'DELETE' ? null : await req.text();
    const parsedBody = body ? JSON.parse(body) : null;
    const result = await handleDownloadsRequest(req.method, parsedBody, req);
    return jsonResponse(result.payload, result.statusCode, result.headers || {});
  } catch (error) {
    return errorResponse(error, 'Falha inesperada ao processar downloads.');
  }
});

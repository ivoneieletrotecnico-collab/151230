import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { handleAuthRequest } from '../_shared/auth.ts';

Deno.serve(async (req: Request) => {
  const cors = handleCors(req);
  if (cors) return cors;

  try {
    const body = req.method === 'GET' || req.method === 'DELETE' ? null : await req.text();
    const parsedBody = body ? JSON.parse(body) : null;
    const result = await handleAuthRequest(req.method, parsedBody, req);
    return jsonResponse(result.payload, result.statusCode, result.headers || {});
  } catch (error) {
    return errorResponse(error, 'Falha inesperada ao processar autenticacao.');
  }
});

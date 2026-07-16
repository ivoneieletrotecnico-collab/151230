import 'dotenv/config';
import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  handleContactRequestsRequest,
  handleDownloadsRequest,
  handleUsersRequest,
} from './lib/api-service.js';
import { handleAuthRequest } from './lib/auth.js';

const rootDir = dirname(fileURLToPath(import.meta.url));
const useDist = process.argv.includes('--dist');
const serveDir =
  useDist && existsSync(resolve(rootDir, 'dist'))
    ? resolve(rootDir, 'dist')
    : rootDir;

const app = express();
app.use(express.json());

function sendApiResponse(response, result) {
  response.setHeader('Cache-Control', 'no-store');

  if (result?.headers) {
    for (const [headerName, headerValue] of Object.entries(result.headers)) {
      response.setHeader(headerName, headerValue);
    }
  }

  response.status(result.statusCode).json(result.payload);
}

function sendApiError(response, error, fallbackMessage) {
  response.setHeader('Cache-Control', 'no-store');
  response.status(error?.statusCode || 500).json({
    error: error?.code || 'INTERNAL_ERROR',
    message: error?.message || fallbackMessage,
  });
}

app.all('/api/auth', async (request, response) => {
  try {
    const result = await handleAuthRequest(request.method || 'GET', request.body, request);
    sendApiResponse(response, result);
  } catch (error) {
    sendApiError(response, error, 'Falha inesperada ao processar autenticacao.');
  }
});

app.all('/api/downloads', async (request, response) => {
  try {
    const result = await handleDownloadsRequest(request.method || 'GET', request.body, request);
    sendApiResponse(response, result);
  } catch (error) {
    sendApiError(response, error, 'Falha inesperada ao processar downloads.');
  }
});

app.all('/api/contact-requests', async (request, response) => {
  try {
    const result = await handleContactRequestsRequest(request.method || 'GET', request.body, request);
    sendApiResponse(response, result);
  } catch (error) {
    sendApiError(response, error, 'Falha inesperada ao processar solicitacoes.');
  }
});

app.all('/api/users', async (request, response) => {
  try {
    const result = await handleUsersRequest(request.method || 'GET', request.body, request);
    sendApiResponse(response, result);
  } catch (error) {
    sendApiError(response, error, 'Falha inesperada ao processar usuarios.');
  }
});

// Clean URLs para paridade com o comportamento do Vercel (cleanUrls: true).
app.get('/downloads', (request, response) => {
  response.sendFile(resolve(serveDir, 'downloads.html'));
});

// Aliases do painel administrativo FluxoIA.
app.get('/admin', (request, response) => {
  response.sendFile(resolve(serveDir, 'admin-login.html'));
});

app.get('/painel', (request, response) => {
  response.sendFile(resolve(serveDir, 'admin-panel.html'));
});

app.use(express.static(serveDir));

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`FluxoIA servindo ${serveDir} em http://${host}:${port}`);
});

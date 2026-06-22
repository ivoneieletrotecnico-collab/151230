import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  handleContactRequestsRequest,
  handleDownloadsRequest,
} from './lib/api-service.js';

const rootDir = dirname(fileURLToPath(import.meta.url));
const useDist = process.argv.includes('--dist');
const serveDir = useDist && existsSync(resolve(rootDir, 'dist')) ? resolve(rootDir, 'dist') : rootDir;

const app = express();
app.use(express.json());

function sendApiResponse(response, result) {
  response.setHeader('Cache-Control', 'no-store');
  response.status(result.statusCode).json(result.payload);
}

app.all('/api/downloads', async (request, response) => {
  const result = await handleDownloadsRequest(request.method || 'GET', request.body);
  sendApiResponse(response, result);
});

app.all('/api/contact-requests', async (request, response) => {
  const result = await handleContactRequestsRequest(request.method || 'GET', request.body);
  sendApiResponse(response, result);
});

app.use(express.static(serveDir));
app.get('*', (_, response) => {
  response.sendFile(resolve(serveDir, 'index.html'));
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Serving ${serveDir} at http://${host}:${port}`);
});

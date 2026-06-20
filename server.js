import express from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import defaultDownloads from './downloads.defaults.js';
import defaultContactRequests from './contact-requests.defaults.js';

const rootDir = dirname(fileURLToPath(import.meta.url));
const useDist = process.argv.includes('--dist');
const serveDir = useDist && existsSync(resolve(rootDir, 'dist')) ? resolve(rootDir, 'dist') : rootDir;
const storePath = resolve(rootDir, 'downloads.store.json');
const contactStorePath = resolve(rootDir, 'contact-requests.store.json');

async function readStore() {
  try {
    const raw = await readFile(storePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultDownloads;
  } catch {
    await writeStore(defaultDownloads);
    return defaultDownloads;
  }
}

async function writeStore(downloads) {
  await writeFile(storePath, JSON.stringify(downloads, null, 2), 'utf8');
  return downloads;
}

async function readContactStore() {
  try {
    const raw = await readFile(contactStorePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : defaultContactRequests;
  } catch {
    await writeContactStore(defaultContactRequests);
    return defaultContactRequests;
  }
}

async function writeContactStore(requests) {
  await writeFile(contactStorePath, JSON.stringify(requests, null, 2), 'utf8');
  return requests;
}

function nextId(downloads) {
  return downloads.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
}

function normalizeDownload(download) {
  return {
    id: download.id ?? Date.now(),
    name: download.name || '',
    description: download.description || download.desc || '',
    type: download.type || 'pdf',
    size: download.size || 'Vária',
    url: download.url || '#',
    downloads: Number(download.downloads || 0),
    date: download.date || new Date().toISOString().split('T')[0],
  };
}

function nextContactRequestId(requests) {
  return requests.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
}

function normalizeContactRequest(request) {
  return {
    id: request.id ?? Date.now(),
    name: String(request.name || '').trim(),
    phone: String(request.phone || '').trim(),
    email: String(request.email || '').trim(),
    service: String(request.service || '').trim(),
    message: String(request.message || '').trim(),
    status: request.status || 'new',
    createdAt: request.createdAt || new Date().toISOString(),
  };
}

function isValidContactRequest(request) {
  return Boolean(
    request &&
    request.name &&
    request.phone &&
    request.email &&
    request.service &&
    request.message
  );
}

const app = express();
app.use(express.json());

app.get('/api/downloads', async (_, response) => {
  const downloads = await readStore();
  response.json({ downloads });
});

app.post('/api/downloads', async (request, response) => {
  const downloads = await readStore();
  const action = request.body?.action || 'create';

  if (action === 'reset') {
    await writeStore(defaultDownloads);
    response.json({ downloads: defaultDownloads });
    return;
  }

  if (action === 'increment') {
    const targetId = String(request.body?.id);
    const index = downloads.findIndex((item) => String(item.id) === targetId);
    if (index !== -1) {
      downloads[index].downloads = Number(downloads[index].downloads || 0) + 1;
      await writeStore(downloads);
    }
    response.json({ downloads, download: downloads[index] || null });
    return;
  }

  const createdDownload = normalizeDownload(request.body?.download || request.body || {});
  createdDownload.id = nextId(downloads);
  downloads.unshift(createdDownload);
  await writeStore(downloads);
  response.status(201).json({ downloads, download: createdDownload });
});

app.put('/api/downloads', async (request, response) => {
  const downloads = await readStore();
  const targetId = String(request.body?.id);
  const index = downloads.findIndex((item) => String(item.id) === targetId);

  if (index === -1) {
    response.status(404).json({ error: 'Download not found' });
    return;
  }

  downloads[index] = {
    ...downloads[index],
    ...normalizeDownload(request.body?.updatedData || request.body || {}),
    id: downloads[index].id,
    downloads: downloads[index].downloads || 0,
    date: downloads[index].date || new Date().toISOString().split('T')[0],
  };

  await writeStore(downloads);
  response.json({ downloads, download: downloads[index] });
});

app.delete('/api/downloads', async (request, response) => {
  const downloads = await readStore();
  const targetId = String(request.body?.id);
  const filteredDownloads = downloads.filter((item) => String(item.id) !== targetId);
  await writeStore(filteredDownloads);
  response.json({ downloads: filteredDownloads });
});

app.get('/api/contact-requests', async (_, response) => {
  const requests = await readContactStore();
  response.json({ requests });
});

app.post('/api/contact-requests', async (request, response) => {
  const requests = await readContactStore();
  const createdRequest = normalizeContactRequest(request.body?.request || request.body || {});
  if (!isValidContactRequest(createdRequest)) {
    response.status(400).json({
      error: 'Invalid contact request',
      message: 'Name, phone, email, service, and message are required.',
    });
    return;
  }
  createdRequest.id = nextContactRequestId(requests);
  requests.unshift(createdRequest);
  await writeContactStore(requests);
  response.status(201).json({ requests, request: createdRequest });
});

app.delete('/api/contact-requests', async (request, response) => {
  const requests = await readContactStore();
  const targetId = String(request.body?.id);
  const filteredRequests = requests.filter((item) => String(item.id) !== targetId);
  await writeContactStore(filteredRequests);
  response.json({ requests: filteredRequests });
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

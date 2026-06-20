import { getStore } from '@netlify/blobs';
import defaultDownloads from '../../downloads.defaults.js';

const store = getStore('downloads');

async function readDownloads() {
  const storedDownloads = await store.get('downloads', { type: 'json' });
  if (Array.isArray(storedDownloads) && storedDownloads.length > 0) {
    return storedDownloads;
  }
  await store.setJSON('downloads', defaultDownloads);
  return defaultDownloads;
}

async function writeDownloads(downloads) {
  await store.setJSON('downloads', downloads);
  return downloads;
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

export const handler = async (event) => {
  const method = event.httpMethod || 'GET';

  if (method === 'GET') {
    const downloads = await readDownloads();
    return jsonResponse(200, { downloads });
  }

  const body = event.body ? JSON.parse(event.body) : {};
  const downloads = await readDownloads();

  if (method === 'POST') {
    if (body.action === 'reset') {
      await writeDownloads(defaultDownloads);
      return jsonResponse(200, { downloads: defaultDownloads });
    }

    if (body.action === 'increment') {
      const targetId = String(body.id);
      const index = downloads.findIndex((item) => String(item.id) === targetId);
      if (index !== -1) {
        downloads[index].downloads = Number(downloads[index].downloads || 0) + 1;
        await writeDownloads(downloads);
      }
      return jsonResponse(200, { downloads, download: downloads[index] || null });
    }

    const createdDownload = normalizeDownload(body.download || body);
    createdDownload.id = nextId(downloads);
    downloads.unshift(createdDownload);
    await writeDownloads(downloads);
    return jsonResponse(201, { downloads, download: createdDownload });
  }

  if (method === 'PUT') {
    const targetId = String(body.id);
    const index = downloads.findIndex((item) => String(item.id) === targetId);
    if (index === -1) {
      return jsonResponse(404, { error: 'Download not found' });
    }

    downloads[index] = {
      ...downloads[index],
      ...normalizeDownload(body.updatedData || body),
      id: downloads[index].id,
      downloads: downloads[index].downloads || 0,
      date: downloads[index].date || new Date().toISOString().split('T')[0],
    };

    await writeDownloads(downloads);
    return jsonResponse(200, { downloads, download: downloads[index] });
  }

  if (method === 'DELETE') {
    const targetId = String(body.id);
    const filteredDownloads = downloads.filter((item) => String(item.id) !== targetId);
    await writeDownloads(filteredDownloads);
    return jsonResponse(200, { downloads: filteredDownloads });
  }

  return jsonResponse(405, { error: 'Method not allowed' });
};

function jsonResponse(statusCode, data) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(data),
  };
}

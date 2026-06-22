import {
  getDefaultContactRequests,
  getDefaultDownloads,
  getStorageModeLabel,
  readContactRequests,
  readDownloads,
  writeContactRequests,
  writeDownloads,
} from './data-store.js';
import { requireAdminSession } from './auth.js';

function nextId(items) {
  return items.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
}

function normalizeDownload(download) {
  return {
    id: download.id ?? Date.now(),
    name: download.name || '',
    description: download.description || download.desc || '',
    type: download.type || 'pdf',
    size: download.size || 'Varia',
    url: download.url || '#',
    downloads: Number(download.downloads || 0),
    date: download.date || new Date().toISOString().split('T')[0],
  };
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

function parseBody(body) {
  if (!body) {
    return {};
  }

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

export async function handleDownloadsRequest(method, body, request = null) {
  if (method === 'GET') {
    const downloads = await readDownloads();
    return { statusCode: 200, payload: { downloads, storage: getStorageModeLabel() } };
  }

  const requestBody = parseBody(body);
  const downloads = await readDownloads();

  if (method === 'POST') {
    if (requestBody.action === 'reset') {
      requireAdminSession(request);
      const defaults = getDefaultDownloads();
      await writeDownloads(defaults);
      return { statusCode: 200, payload: { downloads: defaults, storage: getStorageModeLabel() } };
    }

    if (requestBody.action === 'increment') {
      const targetId = String(requestBody.id);
      const index = downloads.findIndex((item) => String(item.id) === targetId);
      if (index !== -1) {
        downloads[index].downloads = Number(downloads[index].downloads || 0) + 1;
        await writeDownloads(downloads);
      }

      return {
        statusCode: 200,
        payload: {
          downloads,
          download: downloads[index] || null,
          storage: getStorageModeLabel(),
        },
      };
    }

    requireAdminSession(request);
    const createdDownload = normalizeDownload(requestBody.download || requestBody);
    createdDownload.id = nextId(downloads);
    downloads.unshift(createdDownload);
    await writeDownloads(downloads);
    return {
      statusCode: 201,
      payload: {
        downloads,
        download: createdDownload,
        storage: getStorageModeLabel(),
      },
    };
  }

  if (method === 'PUT') {
    requireAdminSession(request);
    const targetId = String(requestBody.id);
    const index = downloads.findIndex((item) => String(item.id) === targetId);

    if (index === -1) {
      return { statusCode: 404, payload: { error: 'Download not found' } };
    }

    downloads[index] = {
      ...downloads[index],
      ...normalizeDownload(requestBody.updatedData || requestBody),
      id: downloads[index].id,
      downloads: downloads[index].downloads || 0,
      date: downloads[index].date || new Date().toISOString().split('T')[0],
    };

    await writeDownloads(downloads);
    return {
      statusCode: 200,
      payload: {
        downloads,
        download: downloads[index],
        storage: getStorageModeLabel(),
      },
    };
  }

  if (method === 'DELETE') {
    requireAdminSession(request);
    const targetId = String(requestBody.id);
    const filteredDownloads = downloads.filter((item) => String(item.id) !== targetId);
    await writeDownloads(filteredDownloads);
    return {
      statusCode: 200,
      payload: { downloads: filteredDownloads, storage: getStorageModeLabel() },
    };
  }

  return { statusCode: 405, payload: { error: 'Method not allowed' } };
}

export async function handleContactRequestsRequest(method, body, request = null) {
  if (method === 'GET') {
    requireAdminSession(request);
    const requests = await readContactRequests();
    return { statusCode: 200, payload: { requests, storage: getStorageModeLabel() } };
  }

  const requestBody = parseBody(body);
  const requests = await readContactRequests();

  if (method === 'POST') {
    const createdRequest = normalizeContactRequest(requestBody.request || requestBody);
    if (!isValidContactRequest(createdRequest)) {
      return {
        statusCode: 400,
        payload: {
          error: 'Invalid contact request',
          message: 'Name, phone, email, service, and message are required.',
        },
      };
    }

    createdRequest.id = nextId(requests);
    requests.unshift(createdRequest);
    await writeContactRequests(requests);
    return {
      statusCode: 201,
      payload: {
        requests,
        request: createdRequest,
        storage: getStorageModeLabel(),
      },
    };
  }

  if (method === 'DELETE') {
    requireAdminSession(request);
    const targetId = String(requestBody.id);
    const filteredRequests = requests.filter((item) => String(item.id) !== targetId);
    await writeContactRequests(filteredRequests);
    return {
      statusCode: 200,
      payload: { requests: filteredRequests, storage: getStorageModeLabel() },
    };
  }

  return { statusCode: 405, payload: { error: 'Method not allowed' } };
}

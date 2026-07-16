import {
  getDefaultContactRequests,
  getDefaultDownloads,
  getStorageModeLabel,
  readContactRequests,
  readDownloads,
  readUsers,
  writeContactRequests,
  writeDownloads,
  writeUsers,
} from './data-store.ts';
import { requireAdminSession } from './auth.ts';
import { hashPassword } from './password.ts';

function nextId(items: Array<{ id?: number | string }>) {
  return items.reduce((maxId, item) => Math.max(maxId, Number(item.id) || 0), 0) + 1;
}

function normalizeDownload(download: Record<string, unknown>) {
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

function normalizeContactRequest(request: Record<string, unknown>) {
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

function isValidContactRequest(request: Record<string, unknown>) {
  return Boolean(
    request &&
      request.name &&
      request.phone &&
      request.email &&
      request.service &&
      request.message,
  );
}

function parseBody(body: unknown) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body as Record<string, unknown>;
}

export async function handleDownloadsRequest(method: string, body: unknown, request: Request | null = null) {
  if (method === 'GET') {
    const downloads = await readDownloads();
    return { statusCode: 200, payload: { downloads, storage: getStorageModeLabel() } };
  }

  const requestBody = parseBody(body);
  const downloads = await readDownloads();

  if (method === 'POST') {
    if (requestBody.action === 'reset') {
      if (!request) throw Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'UNAUTHORIZED' });
      await requireAdminSession(request);
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
        payload: { downloads, download: downloads[index] || null, storage: getStorageModeLabel() },
      };
    }

    if (!request) throw Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'UNAUTHORIZED' });
    await requireAdminSession(request);
    const createdDownload = normalizeDownload((requestBody.download || requestBody) as Record<string, unknown>);
    createdDownload.id = nextId(downloads);
    downloads.unshift(createdDownload);
    await writeDownloads(downloads);
    return {
      statusCode: 201,
      payload: { downloads, download: createdDownload, storage: getStorageModeLabel() },
    };
  }

  if (method === 'PUT') {
    if (!request) throw Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'UNAUTHORIZED' });
    await requireAdminSession(request);
    const targetId = String(requestBody.id);
    const index = downloads.findIndex((item) => String(item.id) === targetId);
    if (index === -1) return { statusCode: 404, payload: { error: 'Download not found' } };

    downloads[index] = {
      ...downloads[index],
      ...normalizeDownload((requestBody.updatedData || requestBody) as Record<string, unknown>),
      id: downloads[index].id,
      downloads: downloads[index].downloads || 0,
      date: downloads[index].date || new Date().toISOString().split('T')[0],
    };
    await writeDownloads(downloads);
    return {
      statusCode: 200,
      payload: { downloads, download: downloads[index], storage: getStorageModeLabel() },
    };
  }

  if (method === 'DELETE') {
    if (!request) throw Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'UNAUTHORIZED' });
    await requireAdminSession(request);
    const targetId = String(requestBody.id);
    const filteredDownloads = downloads.filter((item) => String(item.id) !== targetId);
    await writeDownloads(filteredDownloads);
    return { statusCode: 200, payload: { downloads: filteredDownloads, storage: getStorageModeLabel() } };
  }

  return { statusCode: 405, payload: { error: 'Method not allowed' } };
}

export async function handleContactRequestsRequest(method: string, body: unknown, request: Request | null = null) {
  if (method === 'GET') {
    if (!request) throw Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'UNAUTHORIZED' });
    await requireAdminSession(request);
    const requests = await readContactRequests();
    return { statusCode: 200, payload: { requests, storage: getStorageModeLabel() } };
  }

  const requestBody = parseBody(body);
  const requests = await readContactRequests();

  if (method === 'POST') {
    const createdRequest = normalizeContactRequest((requestBody.request || requestBody) as Record<string, unknown>);
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
      payload: { requests, request: createdRequest, storage: getStorageModeLabel() },
    };
  }

  if (method === 'PUT') {
    if (!request) throw Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'UNAUTHORIZED' });
    await requireAdminSession(request);
    const targetId = String(requestBody.id);
    const index = requests.findIndex((item) => String(item.id) === targetId);
    if (index === -1) return { statusCode: 404, payload: { error: 'Contact request not found' } };

    const payloadData = (requestBody.updatedData || requestBody) as Record<string, unknown>;
    if (payloadData.status) requests[index].status = String(payloadData.status).trim();
    await writeContactRequests(requests);
    return {
      statusCode: 200,
      payload: { requests, request: requests[index], storage: getStorageModeLabel() },
    };
  }

  if (method === 'DELETE') {
    if (!request) throw Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'UNAUTHORIZED' });
    await requireAdminSession(request);
    const targetId = String(requestBody.id);
    const filteredRequests = requests.filter((item) => String(item.id) !== targetId);
    await writeContactRequests(filteredRequests);
    return { statusCode: 200, payload: { requests: filteredRequests, storage: getStorageModeLabel() } };
  }

  return { statusCode: 405, payload: { error: 'Method not allowed' } };
}

function sanitizeUser(user: Record<string, unknown>) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function normalizeUserInput(input: Record<string, unknown>) {
  return {
    email: String(input.email || '').trim().toLowerCase(),
    name: String(input.name || '').trim(),
    role: String(input.role || 'admin').trim() || 'admin',
  };
}

export async function handleUsersRequest(method: string, body: unknown, request: Request | null = null) {
  if (!request) throw Object.assign(new Error('Unauthorized'), { statusCode: 401, code: 'UNAUTHORIZED' });
  await requireAdminSession(request);
  const requestBody = parseBody(body);
  const users = await readUsers();

  if (method === 'GET') {
    return {
      statusCode: 200,
      payload: { users: users.map(sanitizeUser), storage: getStorageModeLabel() },
    };
  }

  if (method === 'POST') {
    const input = normalizeUserInput((requestBody.user || requestBody) as Record<string, unknown>);
    const password = String((requestBody.user as Record<string, unknown> | undefined)?.password || requestBody.password || '');

    if (!input.email || !password) {
      return {
        statusCode: 400,
        payload: { error: 'INVALID_USER', message: 'E-mail e senha sao obrigatorios.' },
      };
    }

    if (users.some((item) => String(item.email).toLowerCase() === input.email)) {
      return {
        statusCode: 409,
        payload: { error: 'EMAIL_IN_USE', message: 'Ja existe um usuario com este e-mail.' },
      };
    }

    const createdUser = {
      id: nextId(users),
      email: input.email,
      name: input.name,
      role: input.role,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    users.unshift(createdUser);
    await writeUsers(users);
    return {
      statusCode: 201,
      payload: { users: users.map(sanitizeUser), user: sanitizeUser(createdUser), storage: getStorageModeLabel() },
    };
  }

  if (method === 'PUT') {
    const targetId = String(requestBody.id);
    const index = users.findIndex((item) => String(item.id) === targetId);
    if (index === -1) {
      return { statusCode: 404, payload: { error: 'USER_NOT_FOUND', message: 'Usuario nao encontrado.' } };
    }

    const payloadData = (requestBody.updatedData || requestBody) as Record<string, unknown>;
    const input = normalizeUserInput({ ...users[index], ...payloadData });
    const newPassword = String(payloadData.password || '');

    const emailTaken = users.some(
      (item) => String(item.id) !== targetId && String(item.email).toLowerCase() === input.email,
    );
    if (emailTaken) {
      return {
        statusCode: 409,
        payload: { error: 'EMAIL_IN_USE', message: 'Ja existe um usuario com este e-mail.' },
      };
    }

    users[index] = {
      ...users[index],
      email: input.email || users[index].email,
      name: input.name,
      role: input.role,
      passwordHash: newPassword ? hashPassword(newPassword) : users[index].passwordHash,
    };
    await writeUsers(users);
    return {
      statusCode: 200,
      payload: { users: users.map(sanitizeUser), user: sanitizeUser(users[index]), storage: getStorageModeLabel() },
    };
  }

  if (method === 'DELETE') {
    const targetId = String(requestBody.id);
    if (users.length <= 1) {
      return {
        statusCode: 400,
        payload: { error: 'LAST_USER', message: 'Nao e possivel remover o unico usuario administrador.' },
      };
    }
    const filteredUsers = users.filter((item) => String(item.id) !== targetId);
    await writeUsers(filteredUsers);
    return { statusCode: 200, payload: { users: filteredUsers.map(sanitizeUser), storage: getStorageModeLabel() } };
  }

  return { statusCode: 405, payload: { error: 'Method not allowed' } };
}

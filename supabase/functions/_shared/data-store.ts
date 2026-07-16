import { defaultContactRequests, defaultDownloads, defaultUsers } from './defaults.ts';
import { getSupabaseConfig } from './env.ts';

class StorageConfigurationError extends Error {
  statusCode = 503;
  code = 'REMOTE_STORE_REQUIRED';
}

class RemoteStoreRequestError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 502, code = 'REMOTE_STORE_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

function cloneValue<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

function buildSupabaseUrl(tableName: string, searchParams: Record<string, string> = {}) {
  const config = getSupabaseConfig();
  const url = new URL(`/rest/v1/${tableName}`, `${config.url}/`);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function getSupabaseHeaders(extraHeaders: Record<string, string> = {}) {
  const config = getSupabaseConfig();
  if (!config.serviceRoleKey) {
    throw new StorageConfigurationError('SUPABASE_SERVICE_ROLE_KEY nao configurada.');
  }

  return {
    apikey: config.serviceRoleKey,
    Authorization: `Bearer ${config.serviceRoleKey}`,
    ...extraHeaders,
  };
}

async function parseRemoteError(response: Response, fallbackMessage: string) {
  let details = fallbackMessage;
  try {
    const payload = await response.json();
    details = payload?.message || payload?.error_description || payload?.error || fallbackMessage;
  } catch {
    try {
      details = (await response.text()) || fallbackMessage;
    } catch {
      details = fallbackMessage;
    }
  }
  return new RemoteStoreRequestError(details, response.status || 502);
}

async function readSupabaseRows(tableName: string, searchParams: Record<string, string>, fallbackMessage: string) {
  const response = await fetch(buildSupabaseUrl(tableName, searchParams), {
    method: 'GET',
    headers: getSupabaseHeaders(),
  });

  if (!response.ok) {
    throw await parseRemoteError(response, fallbackMessage);
  }

  return response.json();
}

async function upsertSupabaseRows(tableName: string, rows: unknown[], onConflict = 'id') {
  const response = await fetch(
    buildSupabaseUrl(tableName, { on_conflict: onConflict }),
    {
      method: 'POST',
      headers: getSupabaseHeaders({
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify(rows),
    },
  );

  if (!response.ok) {
    throw await parseRemoteError(response, 'Falha ao gravar dados no Supabase.');
  }

  return rows;
}

async function deleteSupabaseRows(tableName: string, searchParams: Record<string, string>, fallbackMessage: string) {
  const response = await fetch(buildSupabaseUrl(tableName, searchParams), {
    method: 'DELETE',
    headers: getSupabaseHeaders({ Prefer: 'return=minimal' }),
  });

  if (!response.ok) {
    throw await parseRemoteError(response, fallbackMessage);
  }
}

function mapDownloadFromSupabase(row: Record<string, unknown>) {
  return {
    id: Number(row.id) || row.id,
    name: row.name || '',
    description: row.description || '',
    type: row.type || 'pdf',
    size: row.size || 'Varia',
    url: row.url || '#',
    downloads: Number(row.downloads || 0),
    date: row.date || new Date().toISOString().split('T')[0],
  };
}

function mapContactRequestFromSupabase(row: Record<string, unknown>) {
  return {
    id: Number(row.id) || row.id,
    name: String(row.name || '').trim(),
    phone: String(row.phone || '').trim(),
    email: String(row.email || '').trim(),
    service: String(row.service || '').trim(),
    message: String(row.message || '').trim(),
    status: row.status || 'new',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapDownloadToSupabase(download: Record<string, unknown>, index: number) {
  return {
    id: Number(download.id) || download.id,
    name: download.name || '',
    description: download.description || download.desc || '',
    type: download.type || 'pdf',
    size: download.size || 'Varia',
    url: download.url || '#',
    downloads: Number(download.downloads || 0),
    date: download.date || new Date().toISOString().split('T')[0],
    order_index: index,
    updated_at: new Date().toISOString(),
  };
}

function mapContactRequestToSupabase(request: Record<string, unknown>, index: number) {
  return {
    id: Number(request.id) || request.id,
    name: String(request.name || '').trim(),
    phone: String(request.phone || '').trim(),
    email: String(request.email || '').trim(),
    service: String(request.service || '').trim(),
    message: String(request.message || '').trim(),
    status: request.status || 'new',
    created_at: request.createdAt || new Date().toISOString(),
    order_index: index,
    updated_at: new Date().toISOString(),
  };
}

function mapUserFromSupabase(row: Record<string, unknown>) {
  return {
    id: Number(row.id) || row.id,
    email: String(row.email || '').trim().toLowerCase(),
    name: row.name || '',
    role: row.role || 'admin',
    passwordHash: row.password_hash || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapUserToSupabase(user: Record<string, unknown>, index: number) {
  return {
    id: Number(user.id) || user.id,
    email: String(user.email || '').trim().toLowerCase(),
    name: user.name || '',
    role: user.role || 'admin',
    password_hash: user.passwordHash || user.password_hash || '',
    order_index: index,
    created_at: user.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function buildDeleteMissingIdsFilter(ids: Array<string | number>) {
  const normalizedIds = ids
    .map((id) => String(id).trim())
    .filter(Boolean)
    .map((id) => id.replace(/,/g, ''));

  if (normalizedIds.length === 0) {
    return 'not.is.null';
  }

  return `not.in.(${normalizedIds.join(',')})`;
}

async function replaceSupabaseTableById(tableName: string, rows: Record<string, unknown>[], fallbackMessage: string) {
  if (rows.length > 0) {
    await upsertSupabaseRows(tableName, rows);
  }

  await deleteSupabaseRows(
    tableName,
    { id: buildDeleteMissingIdsFilter(rows.map((row) => row.id as string | number)) },
    fallbackMessage,
  );
}

export function getStorageModeLabel() {
  return getSupabaseConfig().serviceRoleKey ? 'supabase' : 'local-json';
}

export function getDefaultDownloads() {
  return cloneValue(defaultDownloads);
}

export function getDefaultContactRequests() {
  return cloneValue(defaultContactRequests);
}

export function getDefaultUsers() {
  return cloneValue(defaultUsers);
}

export async function readDownloads() {
  const { downloadsTable } = getSupabaseConfig();
  const rows = await readSupabaseRows(
    downloadsTable,
    {
      select: 'id,name,description,type,size,url,downloads,date,order_index',
      order: 'order_index.asc,id.asc',
    },
    'Falha ao consultar a tabela de downloads no Supabase.',
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    const defaults = getDefaultDownloads();
    await writeDownloads(defaults);
    return defaults;
  }

  return rows.map((row) => mapDownloadFromSupabase(row as Record<string, unknown>));
}

export async function writeDownloads(downloads: Record<string, unknown>[]) {
  const { downloadsTable } = getSupabaseConfig();
  const normalizedDownloads = cloneValue(downloads).map((item, index) =>
    mapDownloadToSupabase(item as Record<string, unknown>, index)
  );
  await replaceSupabaseTableById(
    downloadsTable,
    normalizedDownloads,
    'Falha ao sincronizar a tabela de downloads no Supabase.',
  );
  return downloads;
}

export async function readContactRequests() {
  const { contactRequestsTable } = getSupabaseConfig();
  const rows = await readSupabaseRows(
    contactRequestsTable,
    {
      select: 'id,name,phone,email,service,message,status,created_at,order_index',
      order: 'order_index.asc,id.asc',
    },
    'Falha ao consultar a tabela de solicitacoes no Supabase.',
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return getDefaultContactRequests();
  }

  return rows.map((row) => mapContactRequestFromSupabase(row as Record<string, unknown>));
}

export async function writeContactRequests(requests: Record<string, unknown>[]) {
  const { contactRequestsTable } = getSupabaseConfig();
  const normalizedRequests = cloneValue(requests).map((item, index) =>
    mapContactRequestToSupabase(item as Record<string, unknown>, index)
  );
  await replaceSupabaseTableById(
    contactRequestsTable,
    normalizedRequests,
    'Falha ao sincronizar a tabela de solicitacoes no Supabase.',
  );
  return requests;
}

export async function readUsers() {
  const { usersTable } = getSupabaseConfig();
  const rows = await readSupabaseRows(
    usersTable,
    {
      select: 'id,email,name,role,password_hash,created_at,order_index',
      order: 'order_index.asc,id.asc',
    },
    'Falha ao consultar a tabela de usuarios no Supabase.',
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    const defaults = getDefaultUsers();
    await writeUsers(defaults);
    return defaults;
  }

  return rows.map((row) => mapUserFromSupabase(row as Record<string, unknown>));
}

export async function writeUsers(users: Record<string, unknown>[]) {
  const { usersTable } = getSupabaseConfig();
  const normalizedUsers = cloneValue(users).map((item, index) =>
    mapUserToSupabase(item as Record<string, unknown>, index)
  );
  await replaceSupabaseTableById(
    usersTable,
    normalizedUsers,
    'Falha ao sincronizar a tabela de usuarios no Supabase.',
  );
  return users;
}

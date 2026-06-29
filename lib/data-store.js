import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import defaultDownloads from '../downloads.defaults.js';
import defaultContactRequests from '../contact-requests.defaults.js';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const downloadsStorePath = resolve(rootDir, 'downloads.store.json');
const contactRequestsStorePath = resolve(rootDir, 'contact-requests.store.json');
const isVercelRuntime = Boolean(process.env.VERCEL);
const supabaseStoreConfig = getSupabaseStoreConfig();
const kvStoreConfig = getKvStoreConfig();
const remoteStoreConfig = supabaseStoreConfig || kvStoreConfig;

let kvClientPromise = null;

class StorageConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageConfigurationError';
    this.code = 'REMOTE_STORE_REQUIRED';
    this.statusCode = 503;
  }
}

class RemoteStoreRequestError extends Error {
  constructor(message, statusCode = 502, code = 'REMOTE_STORE_ERROR') {
    super(message);
    this.name = 'RemoteStoreRequestError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

function getSupabaseStoreConfig() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return null;
  }

  return {
    label: 'supabase',
    url: process.env.SUPABASE_URL.replace(/\/+$/, ''),
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    downloadsTable: process.env.SUPABASE_DOWNLOADS_TABLE || 'downloads',
    contactRequestsTable: process.env.SUPABASE_CONTACT_REQUESTS_TABLE || 'contact_requests',
  };
}

function getKvStoreConfig() {
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    return {
      label: 'upstash-redis',
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    };
  }

  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    return {
      label: 'vercel-kv',
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    };
  }

  return null;
}

function cloneValue(value) {
  return JSON.parse(JSON.stringify(value));
}

function buildSupabaseUrl(tableName, searchParams = {}) {
  if (!supabaseStoreConfig) {
    throw new StorageConfigurationError('Supabase nao configurado para persistencia.');
  }

  const url = new URL(`/rest/v1/${tableName}`, `${supabaseStoreConfig.url}/`);
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value);
  }
  return url;
}

function getSupabaseHeaders(extraHeaders = {}) {
  if (!supabaseStoreConfig) {
    throw new StorageConfigurationError('Supabase nao configurado para persistencia.');
  }

  return {
    apikey: supabaseStoreConfig.serviceRoleKey,
    Authorization: `Bearer ${supabaseStoreConfig.serviceRoleKey}`,
    ...extraHeaders,
  };
}

async function parseRemoteError(response, fallbackMessage) {
  let details = fallbackMessage;

  try {
    const payload = await response.json();
    details = payload?.message || payload?.error_description || payload?.error || fallbackMessage;
  } catch {
    try {
      const text = await response.text();
      details = text || fallbackMessage;
    } catch {
      details = fallbackMessage;
    }
  }

  return new RemoteStoreRequestError(details, response.status || 502);
}

async function readSupabaseRows(tableName, searchParams, fallbackMessage) {
  const response = await fetch(
    buildSupabaseUrl(tableName, searchParams),
    {
      method: 'GET',
      headers: getSupabaseHeaders(),
    }
  );

  if (!response.ok) {
    throw await parseRemoteError(response, fallbackMessage);
  }

  return response.json();
}

async function upsertSupabaseRows(tableName, rows, onConflict = 'id') {
  const response = await fetch(
    buildSupabaseUrl(tableName, {
      on_conflict: onConflict,
    }),
    {
      method: 'POST',
      headers: getSupabaseHeaders({
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      }),
      body: JSON.stringify(rows),
    }
  );

  if (!response.ok) {
    throw await parseRemoteError(response, 'Falha ao gravar dados no Supabase.');
  }

  return rows;
}

async function deleteSupabaseRows(tableName, searchParams, fallbackMessage) {
  const response = await fetch(buildSupabaseUrl(tableName, searchParams), {
    method: 'DELETE',
    headers: getSupabaseHeaders({
      Prefer: 'return=minimal',
    }),
  });

  if (!response.ok) {
    throw await parseRemoteError(response, fallbackMessage);
  }
}

function mapDownloadFromSupabase(row) {
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

function mapContactRequestFromSupabase(row) {
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

function mapDownloadToSupabase(download, index) {
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

function mapContactRequestToSupabase(request, index) {
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

function buildDeleteMissingIdsFilter(ids) {
  const normalizedIds = ids
    .map((id) => String(id).trim())
    .filter(Boolean)
    .map((id) => id.replace(/,/g, ''));

  if (normalizedIds.length === 0) {
    return 'not.is.null';
  }

  return `not.in.(${normalizedIds.join(',')})`;
}

async function replaceSupabaseTableById(tableName, rows, fallbackMessage) {
  if (rows.length > 0) {
    await upsertSupabaseRows(tableName, rows);
  }

  await deleteSupabaseRows(
    tableName,
    {
      id: buildDeleteMissingIdsFilter(rows.map((row) => row.id)),
    },
    fallbackMessage
  );
}

async function readSupabaseDownloads() {
  const rows = await readSupabaseRows(
    supabaseStoreConfig.downloadsTable,
    {
      select: 'id,name,description,type,size,url,downloads,date,order_index',
      order: 'order_index.asc,id.asc',
    },
    'Falha ao consultar a tabela de downloads no Supabase.'
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    const defaults = cloneValue(defaultDownloads);
    await writeSupabaseDownloads(defaults);
    return defaults;
  }

  return rows.map(mapDownloadFromSupabase);
}

async function writeSupabaseDownloads(downloads) {
  const normalizedDownloads = cloneValue(downloads).map(mapDownloadToSupabase);
  await replaceSupabaseTableById(
    supabaseStoreConfig.downloadsTable,
    normalizedDownloads,
    'Falha ao sincronizar a tabela de downloads no Supabase.'
  );
  return downloads;
}

async function readSupabaseContactRequests() {
  const rows = await readSupabaseRows(
    supabaseStoreConfig.contactRequestsTable,
    {
      select: 'id,name,phone,email,service,message,status,created_at,order_index',
      order: 'order_index.asc,id.asc',
    },
    'Falha ao consultar a tabela de solicitacoes no Supabase.'
  );

  if (!Array.isArray(rows) || rows.length === 0) {
    return cloneValue(defaultContactRequests);
  }

  return rows.map(mapContactRequestFromSupabase);
}

async function writeSupabaseContactRequests(requests) {
  const normalizedRequests = cloneValue(requests).map(mapContactRequestToSupabase);
  await replaceSupabaseTableById(
    supabaseStoreConfig.contactRequestsTable,
    normalizedRequests,
    'Falha ao sincronizar a tabela de solicitacoes no Supabase.'
  );
  return requests;
}

async function getKvClient() {
  if (!kvStoreConfig) {
    return null;
  }

  if (!kvClientPromise) {
    kvClientPromise = import('@upstash/redis').then(({ Redis }) =>
      new Redis({
        url: kvStoreConfig.url,
        token: kvStoreConfig.token,
      })
    );
  }

  return kvClientPromise;
}

async function readJsonFile(filePath, fallbackValue) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : cloneValue(fallbackValue);
  } catch {
    const fallbackClone = cloneValue(fallbackValue);

    if (!isVercelRuntime) {
      try {
        await writeJsonFile(filePath, fallbackClone);
      } catch {
        return fallbackClone;
      }
    }

    return fallbackClone;
  }
}

async function writeJsonFile(filePath, value) {
  await writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
  return value;
}

async function readCollection(key, filePath, defaults) {
  const kv = await getKvClient();
  if (kv) {
    const storedValue = await kv.get(key);
    if (Array.isArray(storedValue)) {
      return storedValue;
    }
    const fallbackClone = cloneValue(defaults);
    await kv.set(key, fallbackClone);
    return fallbackClone;
  }

  return readJsonFile(filePath, defaults);
}

async function writeCollection(key, filePath, value) {
  const kv = await getKvClient();
  if (kv) {
    await kv.set(key, value);
    return value;
  }

  if (isVercelRuntime) {
    throw new StorageConfigurationError(
      'O painel precisa de um banco persistente no Vercel. Configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY, ou use KV_REST_API_URL/KV_REST_API_TOKEN, ou UPSTASH_REDIS_REST_URL/UPSTASH_REDIS_REST_TOKEN.'
    );
  }

  return writeJsonFile(filePath, value);
}

export function isRemoteStoreEnabled() {
  return Boolean(remoteStoreConfig);
}

export function getStorageModeLabel() {
  return remoteStoreConfig?.label || 'local-json';
}

export function getDefaultDownloads() {
  return cloneValue(defaultDownloads);
}

export function getDefaultContactRequests() {
  return cloneValue(defaultContactRequests);
}

export async function readDownloads() {
  if (supabaseStoreConfig) {
    return readSupabaseDownloads();
  }

  return readCollection('downloads', downloadsStorePath, defaultDownloads);
}

export async function writeDownloads(downloads) {
  if (supabaseStoreConfig) {
    return writeSupabaseDownloads(downloads);
  }

  return writeCollection('downloads', downloadsStorePath, downloads);
}

export async function readContactRequests() {
  if (supabaseStoreConfig) {
    return readSupabaseContactRequests();
  }

  return readCollection('contact-requests', contactRequestsStorePath, defaultContactRequests);
}

export async function writeContactRequests(requests) {
  if (supabaseStoreConfig) {
    return writeSupabaseContactRequests(requests);
  }

  return writeCollection('contact-requests', contactRequestsStorePath, requests);
}

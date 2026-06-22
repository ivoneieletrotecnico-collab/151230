import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import defaultDownloads from '../downloads.defaults.js';
import defaultContactRequests from '../contact-requests.defaults.js';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const downloadsStorePath = resolve(rootDir, 'downloads.store.json');
const contactRequestsStorePath = resolve(rootDir, 'contact-requests.store.json');
const isVercelRuntime = Boolean(process.env.VERCEL);
const remoteStoreConfig = getRemoteStoreConfig();

let kvClientPromise = null;

class StorageConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'StorageConfigurationError';
    this.code = 'REMOTE_STORE_REQUIRED';
    this.statusCode = 503;
  }
}

function getRemoteStoreConfig() {
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

async function getKvClient() {
  if (!remoteStoreConfig) {
    return null;
  }

  if (!kvClientPromise) {
    kvClientPromise = import('@upstash/redis').then(({ Redis }) =>
      new Redis({
        url: remoteStoreConfig.url,
        token: remoteStoreConfig.token,
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
      'O painel precisa de um banco persistente no Vercel. Configure KV_REST_API_URL e KV_REST_API_TOKEN, ou UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN.'
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
  return readCollection('downloads', downloadsStorePath, defaultDownloads);
}

export async function writeDownloads(downloads) {
  return writeCollection('downloads', downloadsStorePath, downloads);
}

export async function readContactRequests() {
  return readCollection('contact-requests', contactRequestsStorePath, defaultContactRequests);
}

export async function writeContactRequests(requests) {
  return writeCollection('contact-requests', contactRequestsStorePath, requests);
}

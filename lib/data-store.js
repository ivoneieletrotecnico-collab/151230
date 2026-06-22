import { readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import defaultDownloads from '../downloads.defaults.js';
import defaultContactRequests from '../contact-requests.defaults.js';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const downloadsStorePath = resolve(rootDir, 'downloads.store.json');
const contactRequestsStorePath = resolve(rootDir, 'contact-requests.store.json');
const hasUpstashRedis =
  Boolean(process.env.UPSTASH_REDIS_REST_URL) &&
  Boolean(process.env.UPSTASH_REDIS_REST_TOKEN);

let kvClientPromise = null;

async function getKvClient() {
  if (!hasUpstashRedis) {
    return null;
  }

  if (!kvClientPromise) {
    kvClientPromise = import('@upstash/redis').then((module) => module.Redis.fromEnv());
  }

  return kvClientPromise;
}

async function readJsonFile(filePath, fallbackValue) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallbackValue;
  } catch {
    await writeJsonFile(filePath, fallbackValue);
    return fallbackValue;
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
    await kv.set(key, defaults);
    return defaults;
  }

  return readJsonFile(filePath, defaults);
}

async function writeCollection(key, filePath, value) {
  const kv = await getKvClient();
  if (kv) {
    await kv.set(key, value);
    return value;
  }

  return writeJsonFile(filePath, value);
}

export function isRemoteStoreEnabled() {
  return hasUpstashRedis;
}

export function getStorageModeLabel() {
  return hasUpstashRedis ? 'upstash-redis' : 'local-json';
}

export function getDefaultDownloads() {
  return defaultDownloads;
}

export function getDefaultContactRequests() {
  return defaultContactRequests;
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

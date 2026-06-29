import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import defaultContactRequests from './contact-requests.defaults.js';
import defaultDownloads from './downloads.defaults.js';
import {
  getStorageModeLabel,
  readContactRequests,
  readDownloads,
  writeContactRequests,
  writeDownloads,
} from './lib/data-store.js';

const rootDir = process.cwd();
const downloadsStorePath = resolve(rootDir, 'downloads.store.json');
const contactRequestsStorePath = resolve(rootDir, 'contact-requests.store.json');

async function readJsonArray(filePath, fallbackValue) {
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : structuredClone(fallbackValue);
  } catch {
    return structuredClone(fallbackValue);
  }
}

function assertSupabaseMode() {
  const mode = getStorageModeLabel();
  if (mode !== 'supabase') {
    throw new Error(
      'Migracao abortada: configure SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY antes de executar este comando.'
    );
  }
}

async function main() {
  assertSupabaseMode();

  const sourceDownloads = await readJsonArray(downloadsStorePath, defaultDownloads);
  const sourceContactRequests = await readJsonArray(
    contactRequestsStorePath,
    defaultContactRequests
  );

  await writeDownloads(sourceDownloads);
  await writeContactRequests(sourceContactRequests);

  const syncedDownloads = await readDownloads();
  const syncedContactRequests = await readContactRequests();

  console.log(`Supabase sincronizado com sucesso.`);
  console.log(`Downloads: ${syncedDownloads.length}`);
  console.log(`Solicitacoes: ${syncedContactRequests.length}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});

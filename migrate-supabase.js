import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import defaultContactRequests from './contact-requests.defaults.js';
import defaultDownloads from './downloads.defaults.js';
import defaultUsers from './users.defaults.js';
import {
  getStorageModeLabel,
  readContactRequests,
  readDownloads,
  readUsers,
  writeContactRequests,
  writeDownloads,
  writeUsers,
} from './lib/data-store.js';

const rootDir = process.cwd();
const downloadsStorePath = resolve(rootDir, 'downloads.store.json');
const contactRequestsStorePath = resolve(rootDir, 'contact-requests.store.json');
const usersStorePath = resolve(rootDir, 'users.store.json');

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

  // Usuarios: seed nao destrutivo. So grava se a tabela ainda nao tiver usuarios,
  // para nunca sobrescrever senhas/usuarios criados pelo painel.
  const existingUsers = await readUsers();
  if (!Array.isArray(existingUsers) || existingUsers.length === 0) {
    const sourceUsers = await readJsonArray(usersStorePath, defaultUsers);
    await writeUsers(sourceUsers);
  }

  const syncedDownloads = await readDownloads();
  const syncedContactRequests = await readContactRequests();
  const syncedUsers = await readUsers();

  console.log(`Supabase sincronizado com sucesso.`);
  console.log(`Downloads: ${syncedDownloads.length}`);
  console.log(`Solicitacoes: ${syncedContactRequests.length}`);
  console.log(`Usuarios: ${syncedUsers.length}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});

import 'dotenv/config';
import { readFile, readdir, stat } from 'node:fs/promises';
import { basename, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)));
const distDir = resolve(rootDir, 'dist');
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://supabase.appsbrasil.store').replace(/\/+$/, '');
const BUCKET = process.env.SUPABASE_SITE_BUCKET || 'fluxoia-site';
const KONG_USER = process.env.SUPABASE_KONG_USER || '';
const KONG_PASS = process.env.SUPABASE_KONG_PASSWORD || '';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function fail(message) {
  console.error(`ERRO: ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(message);
}

function getMimeType(filePath) {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  if (ext === '.html') return 'text/html; charset=utf-8';
  if (ext === '.js') return 'application/javascript; charset=utf-8';
  if (ext === '.css') return 'text/css; charset=utf-8';
  return MIME[ext] || 'application/octet-stream';
}

function getKongBasicAuth() {
  if (!KONG_USER || !KONG_PASS) return null;
  return `Basic ${Buffer.from(`${KONG_USER}:${KONG_PASS}`).toString('base64')}`;
}

async function fetchServiceRoleKey() {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return process.env.SUPABASE_SERVICE_ROLE_KEY;
  }

  const basic = getKongBasicAuth();
  if (!basic) {
    throw new Error('Defina SUPABASE_SERVICE_ROLE_KEY ou credenciais Kong no .env');
  }

  const response = await fetch(`${SUPABASE_URL}/api/platform/projects/default/settings`, {
    headers: { Authorization: basic, Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Falha ao obter chaves do Studio: status ${response.status}`);
  }

  const payload = await response.json();
  const serviceRole =
    payload?.service_role?.key ||
    payload?.service_role_key ||
    payload?.serviceRoleKey ||
    payload?.apiKeys?.service_role;

  if (!serviceRole) {
    throw new Error('Resposta do Studio nao contem service_role key');
  }

  return serviceRole;
}

function supabaseHeaders(serviceRoleKey, extra = {}) {
  return {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    ...extra,
  };
}

async function listBuckets(serviceRoleKey) {
  const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    headers: supabaseHeaders(serviceRoleKey),
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Falha ao listar buckets (${response.status}): ${details}`);
  }

  return response.json();
}

async function ensurePublicBucket(serviceRoleKey) {
  const buckets = await listBuckets(serviceRoleKey);
  const existing = buckets.find((bucket) => bucket.id === BUCKET || bucket.name === BUCKET);

  if (!existing) {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: supabaseHeaders(serviceRoleKey, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        id: BUCKET,
        name: BUCKET,
        public: true,
        file_size_limit: 52428800,
      }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Falha ao criar bucket (${response.status}): ${details}`);
    }

    ok(`Bucket criado: ${BUCKET} (publico)`);
    return;
  }

  if (!existing.public) {
    const response = await fetch(`${SUPABASE_URL}/storage/v1/bucket/${BUCKET}`, {
      method: 'PUT',
      headers: supabaseHeaders(serviceRoleKey, { 'Content-Type': 'application/json' }),
      body: JSON.stringify({ ...existing, public: true }),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Falha ao tornar bucket publico (${response.status}): ${details}`);
    }

    ok(`Bucket ${BUCKET} atualizado para publico`);
    return;
  }

  ok(`Bucket ${BUCKET} ja existe e e publico`);
}

async function walkFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = resolve(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(fullPath, base)));
      continue;
    }
    const relative = posix.join(...fullPath.slice(base.length + 1).split(/[/\\]/));
    files.push({ fullPath, relative });
  }

  return files;
}

async function uploadFile(serviceRoleKey, relativePath, fullPath) {
  const bytes = await readFile(fullPath);
  const objectPath = relativePath.split('\\').join('/');
  const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${objectPath}`;
  const contentType = getMimeType(objectPath);
  const cacheControl =
    objectPath.endsWith('.html') || objectPath.endsWith('.js')
      ? 'no-store, no-cache, must-revalidate, max-age=0'
      : 'public, max-age=86400';

  // FormData + Blob: MIME na parte do arquivo (metadata correta no Storage).
  // Obs: o storage-api pode forcar HTML como text/plain; no host use /root/fluxoia-fixes/allow-storage-html.sh.
  // Nao definir Content-Type no request - o fetch define multipart/form-data com boundary.
  const form = new FormData();
  form.append('', new Blob([bytes], { type: contentType }), basename(objectPath));

  const response = await fetch(url, {
    method: 'POST',
    headers: supabaseHeaders(serviceRoleKey, {
      'x-upsert': 'true',
      'cache-control': cacheControl,
    }),
    body: form,
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Upload falhou para ${objectPath} (${response.status}): ${details}`);
  }
}

async function probeEdgeFunctions() {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/`, { method: 'HEAD' });
  return { status: response.status, available: response.status !== 404 };
}

async function main() {
  try {
    await stat(distDir);
  } catch {
    fail('dist/ nao encontrado. Execute npm run build primeiro.');
    return;
  }

  try {
    const serviceRoleKey = await fetchServiceRoleKey();
    ok(`Supabase URL: ${SUPABASE_URL}`);

    const edge = await probeEdgeFunctions();
    ok(`Edge Functions: ${edge.available ? `disponivel (status ${edge.status})` : 'nao detectado (404)'}`);

    await ensurePublicBucket(serviceRoleKey);

    const files = await walkFiles(distDir);
    ok(`Enviando ${files.length} arquivo(s) para o bucket ${BUCKET}...`);

    let uploaded = 0;
    for (const file of files) {
      await uploadFile(serviceRoleKey, file.relative, file.fullPath);
      uploaded += 1;
      if (uploaded % 20 === 0 || uploaded === files.length) {
        ok(`  ${uploaded}/${files.length} enviados`);
      }
    }

    const publicBase = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}`;
    ok('Deploy no Supabase Storage concluido.');
    ok(`Site (index): ${publicBase}/index.html`);
    ok(`Downloads: ${publicBase}/downloads.html`);
    ok(`Admin: ${publicBase}/admin.html`);
    ok(`Painel: ${publicBase}/painel.html`);
  } catch (error) {
    fail(error?.message || error);
  }
}

main();

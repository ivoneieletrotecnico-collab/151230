import 'dotenv/config';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)));
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://supabase.appsbrasil.store').replace(/\/+$/, '');
const BUCKET = process.env.SUPABASE_SITE_BUCKET || 'fluxoia-site';

function run(label, cmd) {
  console.log(`\n==> ${label}`);
  execSync(cmd, { cwd: rootDir, stdio: 'inherit', shell: true });
}

function ok(message) {
  console.log(`OK  ${message}`);
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    const response = await fetch(url, options);
    if (response.status !== 502 || attempt === retries) return response;
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
  return fetch(url, options);
}

async function verifyPages() {
  const pages = [
    ['index.html', 'text/html'],
    ['downloads.html', 'text/html'],
    ['admin.html', 'text/html'],
    ['painel.html', 'text/html'],
    ['api-config.js', 'javascript'],
  ];

  for (const [file, kind] of pages) {
    const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${file}`;
    const response = await fetchWithRetry(url, { method: 'HEAD' });
    const ct = response.headers.get('content-type') || '';
    if (response.status !== 200) {
      fail(`${file} HTTP ${response.status}`);
      continue;
    }
    if (kind === 'text/html' && !ct.includes('text/html')) {
      fail(`${file} Content-Type incorreto: ${ct}`);
      continue;
    }
    if (kind === 'javascript' && !ct.includes('javascript')) {
      fail(`${file} Content-Type incorreto: ${ct}`);
      continue;
    }
    ok(`${file} -> ${response.status} ${ct}`);
  }
}

async function verifyFriendlyUrls() {
  const checks = [
    ['fluxoia root', 'https://fluxoia.appsbrasil.store/'],
    ['fluxoia admin', 'https://fluxoia.appsbrasil.store/admin'],
    ['fluxoia painel', 'https://fluxoia.appsbrasil.store/painel'],
    ['fluxoia downloads', 'https://fluxoia.appsbrasil.store/downloads'],
  ];

  for (const [name, url] of checks) {
    try {
      const response = await fetchWithRetry(url, { method: 'HEAD', redirect: 'follow' });
      const ct = response.headers.get('content-type') || '';
      if (response.status === 200 && ct.includes('text/html')) {
        ok(`${name} -> ${response.status} ${ct}`);
      } else if (response.status === 503) {
        fail(`${name} -> 503 (proxy fluxoia nao configurado — rode setup-fluxoia-proxy.py)`);
      } else {
        fail(`${name} -> ${response.status} ${ct}`);
      }
    } catch (error) {
      fail(`${name} -> ${error?.message || error}`);
    }
  }
}

async function verifyApiConfig() {
  const url = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/api-config.js`;
  const response = await fetchWithRetry(url);
  const body = await response.text();
  if (!body.includes('/functions/v1')) {
    fail('api-config.js nao aponta para /functions/v1');
    return;
  }
  ok('api-config.js aponta para Edge Functions');
}

async function main() {
  console.log('FluxoIA — deploy Supabase completo\n');

  run('Build', 'node build.js');
  run('Storage', 'node deploy-supabase-storage.js');
  run('Functions bundle', 'node deploy-supabase-functions.js');

  try {
    run('Functions SSH', 'python scripts/deploy-functions-ssh.py');
  } catch {
    console.log('AVISO: deploy SSH de functions falhou — defina SSH_PASS no .env ou copie o bundle manualmente.');
  }
  try {
    run('Proxy amigavel', 'python scripts/setup-fluxoia-proxy.py');
  } catch {
    console.log('AVISO: setup proxy fluxoia falhou — URLs longas do Storage continuam funcionando.');
  }

  console.log('\n==> Verificacao');
  await verifyPages();
  await verifyApiConfig();
  await verifyFriendlyUrls();

  run('Edge Functions', 'node test-edge-functions.js');

  try {
    run('Producao (login)', 'node scripts/test-production.js');
  } catch {
    console.log('AVISO: test-production falhou parcialmente.');
  }

  console.log('\nDeploy Supabase concluido.');
  console.log(`Site: https://fluxoia.appsbrasil.store/`);
  console.log(`Storage direto: ${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/index.html`);
}

main().catch((error) => {
  fail(error?.message || error);
});

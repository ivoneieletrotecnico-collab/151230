import 'dotenv/config';
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join, relative, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const rootDir = resolve(dirname(fileURLToPath(import.meta.url)));
const functionsDir = resolve(rootDir, 'supabase', 'functions');
const bundleDir = resolve(rootDir, 'supabase', 'functions-bundle');
const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://supabase.appsbrasil.store').replace(/\/+$/, '');
const FUNCTION_NAMES = ['auth', 'downloads', 'contact-requests', 'users'];

function fail(message) {
  console.error(`ERRO: ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(message);
}

function copyRecursive(source, target) {
  cpSync(source, target, { recursive: true });
}

function walkFiles(dir, base = dir) {
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkFiles(fullPath, base));
      continue;
    }
    files.push({
      fullPath,
      relativePath: relative(base, fullPath).split('\\').join('/'),
    });
  }
  return files;
}

function buildBundle() {
  rmSync(bundleDir, { recursive: true, force: true });
  mkdirSync(bundleDir, { recursive: true });

  copyRecursive(join(functionsDir, '_shared'), join(bundleDir, '_shared'));

  for (const name of FUNCTION_NAMES) {
    const source = join(functionsDir, name);
    if (!existsSync(source)) {
      throw new Error(`Funcao ausente: ${name}`);
    }
    copyRecursive(source, join(bundleDir, name));
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    functions: FUNCTION_NAMES,
    targetPath: 'volumes/functions/',
    restartCommand: 'docker compose restart functions',
  };
  writeFileSync(join(bundleDir, 'MANIFEST.json'), JSON.stringify(manifest, null, 2));
  ok(`Bundle gerado em ${bundleDir}`);
}

async function probeFunctions() {
  const results = [];
  for (const name of ['hello', ...FUNCTION_NAMES]) {
    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      const text = await response.text();
      results.push({ name, status: response.status, body: text.slice(0, 120) });
    } catch (error) {
      results.push({ name, status: 'ERR', body: error?.message || String(error) });
    }
  }
  return results;
}

async function tryManagementDeploy(name) {
  const basicUser = process.env.SUPABASE_KONG_USER || '';
  const basicPass = process.env.SUPABASE_KONG_PASSWORD || '';
  if (!basicUser || !basicPass) return { attempted: false, reason: 'Credenciais Kong ausentes' };

  const fnDir = join(functionsDir, name);
  const sharedDir = join(functionsDir, '_shared');
  const form = new FormData();
  form.append(
    'metadata',
    JSON.stringify({ name, entrypoint_path: 'index.ts', verify_jwt: false }),
  );

  for (const file of walkFiles(fnDir)) {
    form.append('file', new Blob([readFileSync(file.fullPath)]), file.relativePath);
  }
  for (const file of walkFiles(sharedDir)) {
    form.append('file', new Blob([readFileSync(file.fullPath)]), `../_shared/${file.relativePath}`);
  }

  const response = await fetch(
    `${SUPABASE_URL}/api/v1/projects/default/functions/deploy?slug=${encodeURIComponent(name)}`,
    {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${basicUser}:${basicPass}`).toString('base64')}` },
      body: form,
    },
  );

  return {
    attempted: true,
    status: response.status,
    body: (await response.text()).slice(0, 200),
  };
}

function trySshDeploy() {
  const host = process.env.SUPABASE_SSH_HOST || '';
  const user = process.env.SUPABASE_SSH_USER || 'root';
  const remotePath = process.env.SUPABASE_FUNCTIONS_PATH || '/opt/supabase/docker/volumes/functions';
  const keyPath = process.env.SUPABASE_SSH_KEY || '';

  if (!host) {
    return { attempted: false, reason: 'SUPABASE_SSH_HOST nao definido' };
  }

  const sshBase = [
    'ssh',
    '-o',
    'BatchMode=yes',
    '-o',
    'StrictHostKeyChecking=accept-new',
  ];
  if (keyPath) sshBase.push('-i', keyPath);

  const remote = `${user}@${host}`;
  const scpBase = ['scp', '-r', '-o', 'StrictHostKeyChecking=accept-new'];
  if (keyPath) scpBase.push('-i', keyPath);

  for (const name of ['_shared', ...FUNCTION_NAMES]) {
    const source = join(bundleDir, name);
    execSync([...scpBase, source, `${remote}:${remotePath}/`].join(' '), {
      stdio: 'inherit',
    });
  }

  const restart = process.env.SUPABASE_FUNCTIONS_RESTART_CMD
    || `cd ${process.env.SUPABASE_SSH_COMPOSE_DIR || '/opt/supabase/docker'} && docker compose restart functions`;
  execSync([...sshBase, remote, restart].join(' '), { stdio: 'inherit' });
  return { attempted: true, success: true };
}

async function main() {
  if (!existsSync(functionsDir)) {
    fail('Pasta supabase/functions nao encontrada.');
    return;
  }

  buildBundle();
  ok(`Supabase URL: ${SUPABASE_URL}`);

  const before = await probeFunctions();
  ok('Estado atual das Edge Functions:');
  for (const item of before) ok(`  ${item.name}: ${item.status} ${item.body}`);

  let deployed = false;

  for (const name of FUNCTION_NAMES) {
    const result = await tryManagementDeploy(name);
    if (result.attempted) {
      ok(`Deploy API ${name}: HTTP ${result.status} ${result.body || ''}`);
      if (result.status >= 200 && result.status < 300) deployed = true;
    }
  }

  if (!deployed) {
    const sshResult = trySshDeploy();
    if (sshResult.attempted) {
      ok('Deploy via SSH/SCP concluido.');
      deployed = sshResult.success;
    } else {
      ok(`Deploy remoto indisponivel (${sshResult.reason}).`);
      ok('Copie supabase/functions-bundle/ para volumes/functions/ no servidor e reinicie o servico functions.');
    }
  }

  const after = await probeFunctions();
  ok('Estado apos tentativa de deploy:');
  for (const item of after) ok(`  ${item.name}: ${item.status} ${item.body}`);

  if (!deployed) {
    ok('');
    ok('INSTRUCOES MANUAIS (self-hosted):');
    ok('  scp -r supabase/functions-bundle/* user@servidor:/caminho/volumes/functions/');
    ok('  ssh user@servidor "cd /caminho/self-hosted && docker compose restart functions"');
    ok('');
    ok('Defina no container functions: ADMIN_SESSION_SECRET, SUPABASE_SERVICE_ROLE_KEY, ADMIN_EMAIL, ADMIN_PASSWORD');
  }
}

main().catch((error) => fail(error?.message || error));

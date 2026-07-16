import { access, cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(rootDir, 'dist');

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

for (const htmlFile of [
  'index.html',
  'downloads.html',
  'admin-login.html',
  'admin-panel.html',
]) {
  const source = resolve(rootDir, htmlFile);
  if (await exists(source)) {
    await cp(source, resolve(distDir, htmlFile));
  }
}

// Aliases de rota (paridade com cleanUrls do Vercel): /admin, /painel.
const routeAliases = [
  ['admin-login.html', 'admin.html'],
  ['admin-panel.html', 'painel.html'],
];
for (const [source, alias] of routeAliases) {
  const sourcePath = resolve(rootDir, source);
  if (await exists(sourcePath)) {
    await cp(sourcePath, resolve(distDir, alias));
  }
}

for (const dir of ['css', 'js', 'images']) {
  const source = resolve(rootDir, dir);
  if (await exists(source)) {
    await cp(source, resolve(distDir, dir), { recursive: true });
  }
}

for (const file of [
  'contact-requests.defaults.js',
  'downloads.defaults.js',
  'auth-client.js',
]) {
  const source = resolve(rootDir, file);
  if (await exists(source)) {
    await cp(source, resolve(distDir, file));
  }
}

console.log('Build concluido: dist/');

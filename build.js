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

await cp(resolve(rootDir, 'index.html'), resolve(distDir, 'index.html'));

for (const dir of ['css', 'js', 'images']) {
  const source = resolve(rootDir, dir);
  if (await exists(source)) {
    await cp(source, resolve(distDir, dir), { recursive: true });
  }
}

for (const file of ['contact-requests.defaults.js', 'downloads.defaults.js']) {
  const source = resolve(rootDir, file);
  if (await exists(source)) {
    await cp(source, resolve(distDir, file));
  }
}

console.log('Build concluido: dist/');

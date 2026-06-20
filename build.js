import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(rootDir, 'dist');
const assetsSource = resolve(rootDir, 'assets');
const assetsTarget = resolve(distDir, 'assets');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });
await cp(resolve(rootDir, 'index.html'), resolve(distDir, 'index.html'));

try {
  await cp(assetsSource, assetsTarget, { recursive: true });
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

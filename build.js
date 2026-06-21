import { cp, mkdir, rm } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readdir } from 'node:fs/promises';

const rootDir = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(rootDir, 'dist');
const assetsSource = resolve(rootDir, 'assets');
const assetsTarget = resolve(distDir, 'assets');

await rm(distDir, { recursive: true, force: true });
await mkdir(distDir, { recursive: true });

const rootEntries = await readdir(rootDir, { withFileTypes: true });
const htmlFiles = rootEntries.filter((entry) => entry.isFile() && entry.name.endsWith('.html'));

for (const file of htmlFiles) {
  await cp(resolve(rootDir, file.name), resolve(distDir, file.name));
}

try {
  await cp(assetsSource, assetsTarget, { recursive: true });
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

try {
  await cp(resolve(rootDir, 'downloads-data.js'), resolve(distDir, 'downloads-data.js'));
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

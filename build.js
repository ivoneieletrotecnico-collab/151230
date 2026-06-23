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

const routeAliases = [
  { source: 'admin-login.html', targetDir: 'admin' },
  { source: 'admin-panel.html', targetDir: 'painel' },
  { source: 'downloads.html', targetDir: 'downloads' },
];

const cleanUrlAliases = [
  { source: 'admin-login.html', targetFile: 'admin.html' },
  { source: 'admin-panel.html', targetFile: 'painel.html' },
];

for (const alias of routeAliases) {
  const routeDir = resolve(distDir, alias.targetDir);
  await mkdir(routeDir, { recursive: true });
  await cp(resolve(rootDir, alias.source), resolve(routeDir, 'index.html'));
}

for (const alias of cleanUrlAliases) {
  await cp(resolve(rootDir, alias.source), resolve(distDir, alias.targetFile));
}

try {
  await cp(assetsSource, assetsTarget, { recursive: true });
} catch (error) {
  if (error?.code !== 'ENOENT') {
    throw error;
  }
}

for (const scriptName of ['downloads-data.js', 'auth-client.js']) {
  try {
    await cp(resolve(rootDir, scriptName), resolve(distDir, scriptName));
  } catch (error) {
    if (error?.code !== 'ENOENT') {
      throw error;
    }
  }
}

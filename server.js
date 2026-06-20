import express from 'express';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const useDist = process.argv.includes('--dist');
const serveDir = useDist && existsSync(resolve(rootDir, 'dist')) ? resolve(rootDir, 'dist') : rootDir;

const app = express();
app.use(express.static(serveDir));
app.get('*', (_, response) => {
  response.sendFile(resolve(serveDir, 'index.html'));
});

const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '0.0.0.0';

app.listen(port, host, () => {
  console.log(`Serving ${serveDir} at http://${host}:${port}`);
});

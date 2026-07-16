import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const rootDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(rootDir, 'supabase-schema.sql');

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function runSql(query) {
  const response = await fetch(`${SUPABASE_URL}/pg/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query }),
  });

  const text = await response.text();
  if (!response.ok) {
    throw new Error(`pg/query ${response.status}: ${text}`);
  }
  return text;
}

async function main() {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios no .env.');
  }

  const schema = await readFile(schemaPath, 'utf8');
  await runSql(schema);
  console.log('Schema aplicado com sucesso (downloads, contact_requests, users).');

  const check = await runSql(
    "select table_name from information_schema.tables where table_schema = 'public' and table_name in ('downloads','contact_requests','users') order by table_name;"
  );
  console.log(`Tabelas presentes: ${check}`);
}

main().catch((error) => {
  console.error(error?.message || error);
  process.exitCode = 1;
});

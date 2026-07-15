import 'dotenv/config';

const SUPABASE_URL = (process.env.SUPABASE_URL || '').replace(/\/+$/, '');
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const DOWNLOADS_TABLE = process.env.SUPABASE_DOWNLOADS_TABLE || 'downloads';
const CONTACT_TABLE = process.env.SUPABASE_CONTACT_REQUESTS_TABLE || 'contact_requests';

function fail(message) {
  console.error(`ERRO: ${message}`);
  process.exitCode = 1;
}

function ok(message) {
  console.log(message);
}

async function checkReachability() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, { method: 'HEAD' });

  if (response.status === 401) {
    ok('OK: Supabase REST API acessivel (401 sem chave e esperado).');
    return;
  }

  if (!response.ok) {
    throw new Error(`API respondeu com status inesperado: ${response.status}`);
  }

  ok(`OK: Supabase REST API acessivel (status ${response.status}).`);
}

async function countRows(tableName) {
  const url = new URL(`/rest/v1/${tableName}`, `${SUPABASE_URL}/`);
  url.searchParams.set('select', 'id');

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Prefer: 'count=exact',
    },
  });

  if (!response.ok) {
    let details = `status ${response.status}`;
    try {
      const payload = await response.json();
      details = payload?.message || payload?.hint || details;
    } catch {
      // ignore parse errors
    }
    throw new Error(`Falha ao consultar "${tableName}": ${details}`);
  }

  const contentRange = response.headers.get('content-range') || '';
  const match = contentRange.match(/\/(\d+)$/);
  return match ? Number(match[1]) : (await response.json()).length;
}

async function main() {
  if (!SUPABASE_URL) {
    fail('SUPABASE_URL nao definida no .env');
    return;
  }

  if (!SERVICE_ROLE_KEY) {
    fail('SUPABASE_SERVICE_ROLE_KEY vazia. Copie a chave em Settings > API no dashboard.');
    return;
  }

  try {
    await checkReachability();
    ok(`URL: ${SUPABASE_URL}`);

    const downloadsCount = await countRows(DOWNLOADS_TABLE);
    const contactsCount = await countRows(CONTACT_TABLE);

    ok(`Tabela ${DOWNLOADS_TABLE}: ${downloadsCount} registro(s)`);
    ok(`Tabela ${CONTACT_TABLE}: ${contactsCount} registro(s)`);
    ok('Conexao com Supabase validada com sucesso.');
  } catch (error) {
    fail(error?.message || error);
  }
}

main();

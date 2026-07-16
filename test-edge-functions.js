import 'dotenv/config';

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://supabase.appsbrasil.store').replace(/\/+$/, '');
const BASE = `${SUPABASE_URL}/functions/v1`;

const tests = [
  { name: 'hello (sanity)', url: `${BASE}/hello`, method: 'GET', expectStatus: [200] },
  { name: 'auth GET', url: `${BASE}/auth`, method: 'GET', expectStatus: [200, 401, 503] },
  { name: 'downloads GET', url: `${BASE}/downloads`, method: 'GET', expectStatus: [200, 401, 503] },
  { name: 'contact-requests GET', url: `${BASE}/contact-requests`, method: 'GET', expectStatus: [200, 401, 503] },
  { name: 'users GET', url: `${BASE}/users`, method: 'GET', expectStatus: [200, 401, 503] },
];

function ok(message) {
  console.log(`OK  ${message}`);
}

function fail(message) {
  console.error(`FAIL ${message}`);
  process.exitCode = 1;
}

async function runTest(test) {
  try {
    const response = await fetch(test.url, {
      method: test.method,
      headers: { Accept: 'application/json' },
    });
    const body = await response.text();
    const allowed = test.expectStatus.includes(response.status);

    if (!allowed) {
      fail(`${test.name} -> HTTP ${response.status} (esperado: ${test.expectStatus.join('|')}) ${body.slice(0, 120)}`);
      return;
    }

    ok(`${test.name} -> HTTP ${response.status}`);
  } catch (error) {
    fail(`${test.name} -> ${error?.message || error}`);
  }
}

async function main() {
  ok(`Supabase URL: ${SUPABASE_URL}`);
  for (const test of tests) {
    await runTest(test);
  }
}

main();

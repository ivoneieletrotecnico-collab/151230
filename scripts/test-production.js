import 'dotenv/config';
import { verifyPassword } from '../lib/password.js';
import defaultUsers from '../users.defaults.js';

const BASE = (process.env.SUPABASE_URL || 'https://supabase.appsbrasil.store').replace(/\/+$/, '') + '/functions/v1';
const email = process.env.ADMIN_EMAIL || 'ivoneifs@gmail.com';
const password = process.env.ADMIN_PASSWORD || 'Miguel151230@#';

function ok(msg) { console.log('OK', msg); }
function fail(msg) { console.log('FAIL', msg); process.exitCode = 1; }

async function main() {
  const hash = defaultUsers[0]?.passwordHash;
  const hashOk = hash ? verifyPassword(password, hash) : false;
  ok(`password_hash_match=${hashOk}`);

  const publicTests = [
    ['site_index', `${BASE.replace('/functions/v1', '')}/storage/v1/object/public/fluxoia-site/index.html`],
    ['auth_get', `${BASE}/auth`],
    ['downloads_get', `${BASE}/downloads`],
    ['contact_get_unauth', `${BASE}/contact-requests`],
    ['users_get_unauth', `${BASE}/users`],
  ];

  for (const [name, url] of publicTests) {
    const r = await fetch(url, { headers: { Accept: 'application/json' } });
    ok(`${name}=${r.status}`);
  }

  const loginRes = await fetch(`${BASE}/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const loginBody = await loginRes.json().catch(() => ({}));
  if (!loginRes.ok || !loginBody.authenticated) {
    fail(`login=${loginRes.status}`);
    return;
  }
  ok(`login=${loginRes.status} email=${loginBody.email}`);

  const cookie = loginRes.headers.get('set-cookie') || '';
  const sessionCookie = cookie.split(';')[0];
  if (!sessionCookie) {
    fail('no_session_cookie');
    return;
  }

  for (const ep of ['contact-requests', 'users']) {
    const r = await fetch(`${BASE}/${ep}`, {
      headers: { Accept: 'application/json', Cookie: sessionCookie },
    });
    ok(`auth_${ep}=${r.status}`);
  }

  const contactRes = await fetch(`${BASE}/contact-requests`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      name: 'Teste Automático FluxoIA',
      email: 'teste-auto@fluxoia.local',
      phone: '74999999999',
      service: 'Automação com IA',
      message: 'Contato de verificação automática — pode ignorar.',
    }),
  });
  ok(`contact_post=${contactRes.status}`);

  const authStatus = await fetch(`${BASE}/auth`);
  const authJson = await authStatus.json().catch(() => ({}));
  ok(`auth_configured=${authJson.configured}`);
}

main().catch((e) => fail(e.message));

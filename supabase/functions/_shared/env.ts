export function getEnv(name: string, fallback = ''): string {
  return String(Deno.env.get(name) || fallback).trim();
}

export function getSupabaseConfig() {
  const url = getEnv('SUPABASE_URL', 'http://kong:8000').replace(/\/+$/, '');
  const serviceRoleKey = getEnv('SUPABASE_SERVICE_ROLE_KEY');
  return {
    url,
    serviceRoleKey,
    downloadsTable: getEnv('SUPABASE_DOWNLOADS_TABLE', 'downloads'),
    contactRequestsTable: getEnv('SUPABASE_CONTACT_REQUESTS_TABLE', 'contact_requests'),
    usersTable: getEnv('SUPABASE_USERS_TABLE', 'users'),
  };
}

export function getAuthConfig() {
  const email = getEnv('ADMIN_EMAIL').toLowerCase();
  const passwordList = [
    ...splitPasswordList(getEnv('ADMIN_PASSWORDS')),
    ...splitPasswordList(getEnv('ADMIN_PASSWORD')),
  ];
  const passwords = [...new Set(passwordList)];
  const sessionSecret = getEnv('ADMIN_SESSION_SECRET');

  const missing: string[] = [];
  if (!sessionSecret) missing.push('ADMIN_SESSION_SECRET');

  return {
    email,
    passwords,
    sessionSecret,
    hasEnvCredentials: Boolean(email && passwords.length > 0),
    configured: missing.length === 0,
    missing,
  };
}

function splitPasswordList(value: string): string[] {
  return String(value || '')
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

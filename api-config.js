/* Configuração da API FluxoIA.
   - Host Supabase/appsbrasil → Edge Functions (/functions/v1)
   - Vercel / local → serverless same-origin (/api/*) */
(function (global) {
  const SUPABASE_URL = 'https://supabase.appsbrasil.store';
  const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;
  const host = global.location?.hostname || '';
  const useEdgeFunctions =
    host === 'supabase.appsbrasil.store' ||
    host.endsWith('.appsbrasil.store');

  if (useEdgeFunctions) {
    global.FluxoAPI = {
      base: FUNCTIONS_BASE,
      auth: `${FUNCTIONS_BASE}/auth`,
      downloads: `${FUNCTIONS_BASE}/downloads`,
      contactRequests: `${FUNCTIONS_BASE}/contact-requests`,
      users: `${FUNCTIONS_BASE}/users`,
    };
    return;
  }

  global.FluxoAPI = {
    base: '/api',
    auth: '/api/auth',
    downloads: '/api/downloads',
    contactRequests: '/api/contact-requests',
    users: '/api/users',
  };
})(window);

/* Configuração da API FluxoIA — Edge Functions no Supabase self-hosted. */
(function (global) {
  const SUPABASE_URL = 'https://supabase.appsbrasil.store';
  const FUNCTIONS_BASE = `${SUPABASE_URL}/functions/v1`;

  global.FluxoAPI = {
    base: FUNCTIONS_BASE,
    auth: `${FUNCTIONS_BASE}/auth`,
    downloads: `${FUNCTIONS_BASE}/downloads`,
    contactRequests: `${FUNCTIONS_BASE}/contact-requests`,
    users: `${FUNCTIONS_BASE}/users`,
  };
})(window);

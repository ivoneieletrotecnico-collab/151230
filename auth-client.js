/* Cliente de autenticação do painel FluxoIA.
   Conversa com Edge Functions /functions/v1/auth (sessão via cookie HttpOnly). */
(function (global) {
  const SUPABASE_FUNCTIONS_AUTH = 'https://supabase.appsbrasil.store/functions/v1/auth';
  const ASSET_VERSION = '20260716b';

  function getSiteBase() {
    const path = global.location.pathname;
    const slash = path.lastIndexOf('/');
    return slash >= 0 ? path.slice(0, slash + 1) : '/';
  }

  const LOGIN_URL = `${getSiteBase()}admin.html`;
  const PANEL_URL = `${getSiteBase()}painel.html`;

  function authUrl() {
    if (global.FluxoAPI?.auth) return global.FluxoAPI.auth;
    if (
      global.location.hostname === 'supabase.appsbrasil.store' ||
      global.location.hostname.endsWith('.appsbrasil.store')
    ) {
      return SUPABASE_FUNCTIONS_AUTH;
    }
    return '/api/auth';
  }

  async function parseJson(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  async function getSession() {
    const response = await fetch(authUrl(), {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'include',
      cache: 'no-store',
    });
    const data = await parseJson(response);
    if (!response.ok) {
      return { authenticated: false, configured: null, missing: [] };
    }
    return data;
  }

  async function login(email, password) {
    const response = await fetch(authUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    const data = await parseJson(response);
    if (!response.ok) {
      const message = data?.message || 'Não foi possível entrar. Verifique e-mail e senha.';
      throw new Error(message);
    }
    return data;
  }

  async function logout() {
    try {
      await fetch(authUrl(), { method: 'DELETE', credentials: 'include' });
    } catch {
      /* silencioso */
    }
    global.location.href = LOGIN_URL;
  }

  async function requireAuth() {
    try {
      const session = await getSession();
      if (!session?.authenticated) {
        global.location.href = LOGIN_URL;
        return null;
      }
      return session;
    } catch {
      global.location.href = LOGIN_URL;
      return null;
    }
  }

  async function redirectIfAuthenticated() {
    try {
      const session = await getSession();
      if (session?.authenticated) {
        global.location.href = PANEL_URL;
      }
    } catch {
      /* permanece na tela de login */
    }
  }

  /** Só reporta não configurado com HTTP 200 e configured === false. */
  async function probeAuthConfigured() {
    try {
      const response = await fetch(authUrl(), {
        method: 'GET',
        headers: { Accept: 'application/json' },
        credentials: 'include',
        cache: 'no-store',
      });
      const status = await parseJson(response);
      if (!response.ok || typeof status.configured !== 'boolean') {
        return { reachable: false, configured: null, missing: [] };
      }
      return {
        reachable: true,
        configured: status.configured,
        missing: Array.isArray(status.missing) ? status.missing : [],
      };
    } catch {
      return { reachable: false, configured: null, missing: [] };
    }
  }

  function resolveApiUrl(url) {
    if (!global.FluxoAPI || !url.startsWith('/api/')) return url;
    const route = url.replace(/^\/api\//, '');
    return `${global.FluxoAPI.base}/${route}`;
  }

  async function apiFetch(url, options = {}) {
    const response = await fetch(resolveApiUrl(url), {
      ...options,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });

    if (response.status === 401) {
      global.location.href = LOGIN_URL;
      throw new Error('Sessão expirada. Faça login novamente.');
    }

    const data = await parseJson(response);
    if (!response.ok) {
      throw new Error(data?.message || 'Falha na requisição.');
    }
    return data;
  }

  global.FluxoAuth = {
    getSession,
    login,
    logout,
    requireAuth,
    redirectIfAuthenticated,
    probeAuthConfigured,
    apiFetch,
    resolveApiUrl,
    LOGIN_URL,
    PANEL_URL,
    ASSET_VERSION,
  };
})(window);

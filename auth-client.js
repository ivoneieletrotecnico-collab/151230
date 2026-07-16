/* Cliente de autenticação do painel FluxoIA.
   Conversa com Edge Functions /functions/v1/auth (sessão via cookie HttpOnly). */
(function (global) {
  const LOGIN_URL = '/admin.html';
  const PANEL_URL = '/painel.html';

  function authUrl() {
    return global.FluxoAPI?.auth || '/api/auth';
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
    return parseJson(response);
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

  // Redireciona para o login se a sessão não estiver ativa. Usado no painel.
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

  // Se já estiver logado, pula a tela de login e vai para o painel.
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

  // Wrapper de fetch para as rotas /api que exige sessão; redireciona no 401.
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
    apiFetch,
    resolveApiUrl,
    LOGIN_URL,
    PANEL_URL,
  };
})(window);

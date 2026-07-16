/* Cliente de autenticação do painel FluxoIA.
   Conversa com /api/auth (login por sessão via cookie HttpOnly assinado). */
(function (global) {
  const LOGIN_URL = '/admin';
  const PANEL_URL = '/painel';

  async function parseJson(response) {
    try {
      return await response.json();
    } catch {
      return {};
    }
  }

  async function getSession() {
    const response = await fetch('/api/auth', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });
    return parseJson(response);
  }

  async function login(email, password) {
    const response = await fetch('/api/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
      await fetch('/api/auth', { method: 'DELETE' });
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
  async function apiFetch(url, options = {}) {
    const response = await fetch(url, {
      ...options,
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
    LOGIN_URL,
    PANEL_URL,
  };
})(window);

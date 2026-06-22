const AUTH_API_ENDPOINT = '/api/auth';

async function parseAuthApiResponse(response, fallbackMessage) {
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (response.ok) {
    return payload;
  }

  const error = new Error(
    payload?.message || payload?.error || fallbackMessage || 'Falha ao processar autenticacao.'
  );
  error.status = response.status;
  error.payload = payload;
  throw error;
}

async function requestAuth(method, payload = null) {
  const response = await fetch(AUTH_API_ENDPOINT, {
    method,
    credentials: 'include',
    headers: payload ? { 'Content-Type': 'application/json' } : undefined,
    body: payload ? JSON.stringify(payload) : undefined,
    keepalive: method !== 'GET',
  });

  return parseAuthApiResponse(response, 'Falha ao processar autenticacao.');
}

async function getAdminSessionStatus() {
  return requestAuth('GET');
}

async function loginAdmin(email, password) {
  return requestAuth('POST', { email, password });
}

async function logoutAdmin() {
  return requestAuth('DELETE');
}

window.getAdminSessionStatus = getAdminSessionStatus;
window.loginAdmin = loginAdmin;
window.logoutAdmin = logoutAdmin;

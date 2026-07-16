import { readUsers } from './data-store.ts';
import { getAuthConfig } from './env.ts';
import { verifyPassword } from './password.ts';

const SESSION_COOKIE_NAME = 'fluxoia_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

class AuthConfigurationError extends Error {
  statusCode = 503;
  code = 'AUTH_NOT_CONFIGURED';
}

class UnauthorizedError extends Error {
  statusCode = 401;
  code = 'UNAUTHORIZED';

  constructor(message = 'Sessao administrativa invalida ou expirada.') {
    super(message);
  }
}

function requireAuthConfig() {
  const config = getAuthConfig();
  if (!config.configured) {
    throw new AuthConfigurationError(
      `Autenticacao administrativa nao configurada. Defina: ${config.missing.join(', ')}.`,
    );
  }
  return config;
}

function parseBody(body: unknown) {
  if (!body) return {};
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body as Record<string, unknown>;
}

function safeEqualText(left: string, right: string) {
  const leftBuffer = new TextEncoder().encode(String(left || ''));
  const rightBuffer = new TextEncoder().encode(String(right || ''));
  if (leftBuffer.length !== rightBuffer.length) return false;

  let diff = 0;
  for (let i = 0; i < leftBuffer.length; i++) {
    diff |= leftBuffer[i] ^ rightBuffer[i];
  }
  return diff === 0;
}

function base64UrlEncode(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(value: string) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function signPayload(encodedPayload: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(encodedPayload));
  let binary = '';
  for (const byte of new Uint8Array(signature)) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function createSessionToken(email: string) {
  const { sessionSecret } = requireAuthConfig();
  const payload = {
    email,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = await signPayload(encodedPayload, sessionSecret);
  return `${encodedPayload}.${signature}`;
}

function parseCookieHeader(cookieHeader: string) {
  return String(cookieHeader || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return cookies;
      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function getCookieHeaderFromRequest(request: Request) {
  return request.headers.get('cookie') || '';
}

async function readSessionFromRequest(request: Request) {
  const config = getAuthConfig();
  if (!config.configured) return null;

  const cookies = parseCookieHeader(getCookieHeaderFromRequest(request));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = await signPayload(encodedPayload, config.sessionSecret);
  if (!safeEqualText(signature, expectedSignature)) return null;

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.email || !payload?.exp) return null;
    if (payload.exp < Date.now()) return null;
    return { email: String(payload.email).toLowerCase() };
  } catch {
    return null;
  }
}

function buildCookieAttributes(maxAgeSeconds: number) {
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
    'Secure',
  ];
  return parts.join('; ');
}

function buildSessionCookie(token: string) {
  return `${SESSION_COOKIE_NAME}=${encodeURIComponent(token)}; ${buildCookieAttributes(SESSION_TTL_SECONDS).split('; ').slice(1).join('; ')}`;
}

function buildClearedSessionCookie() {
  return `${SESSION_COOKIE_NAME}=; ${buildCookieAttributes(0).split('; ').slice(1).join('; ')}`;
}

export function getAuthStatus() {
  const config = getAuthConfig();
  return {
    configured: config.configured,
    missing: config.missing,
  };
}

export async function requireAdminSession(request: Request) {
  requireAuthConfig();
  const session = await readSessionFromRequest(request);
  if (!session) throw new UnauthorizedError();
  return session;
}

async function authenticateWithUsersTable(email: string, password: string) {
  try {
    const users = await readUsers();
    const user = users.find((item) => String(item.email || '').trim().toLowerCase() === email);
    if (!user || !user.passwordHash) return null;
    return verifyPassword(password, String(user.passwordHash)) ? String(user.email).toLowerCase() : null;
  } catch {
    return null;
  }
}

function authenticateWithEnv(email: string, password: string, config: ReturnType<typeof getAuthConfig>) {
  if (!config.hasEnvCredentials) return null;
  const emailMatches = safeEqualText(email, config.email);
  const passwordMatches = config.passwords.some((candidate) => safeEqualText(password, candidate));
  return emailMatches && passwordMatches ? config.email : null;
}

async function authenticateCredentials(email: string, password: string, config: ReturnType<typeof getAuthConfig>) {
  if (!email || !password) return null;
  const fromUsers = await authenticateWithUsersTable(email, password);
  if (fromUsers) return fromUsers;
  return authenticateWithEnv(email, password, config);
}

export async function handleAuthRequest(method: string, body: unknown, request: Request) {
  if (method === 'GET') {
    const session = await readSessionFromRequest(request);
    const status = getAuthStatus();
    return {
      statusCode: 200,
      payload: {
        authenticated: Boolean(session),
        email: session?.email || null,
        configured: status.configured,
        missing: status.missing,
      },
    };
  }

  if (method === 'POST') {
    const config = requireAuthConfig();
    const payload = parseBody(body);
    const email = String(payload.email || '').trim().toLowerCase();
    const password = String(payload.password || '');
    const authenticatedEmail = await authenticateCredentials(email, password, config);

    if (!authenticatedEmail) {
      throw new UnauthorizedError('Email ou senha incorretos.');
    }

    const token = await createSessionToken(authenticatedEmail);
    return {
      statusCode: 200,
      headers: { 'Set-Cookie': buildSessionCookie(token) },
      payload: {
        authenticated: true,
        email: authenticatedEmail,
        configured: true,
      },
    };
  }

  if (method === 'DELETE') {
    return {
      statusCode: 200,
      headers: { 'Set-Cookie': buildClearedSessionCookie() },
      payload: {
        authenticated: false,
        email: null,
        configured: getAuthStatus().configured,
      },
    };
  }

  return { statusCode: 405, payload: { error: 'Method not allowed' } };
}

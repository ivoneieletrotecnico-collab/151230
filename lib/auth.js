import { createHmac, timingSafeEqual } from 'node:crypto';

const SESSION_COOKIE_NAME = 'ivonei_admin_session';
const SESSION_TTL_SECONDS = 60 * 60 * 12;

class AuthConfigurationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthConfigurationError';
    this.code = 'AUTH_NOT_CONFIGURED';
    this.statusCode = 503;
  }
}

class UnauthorizedError extends Error {
  constructor(message = 'Sessao administrativa invalida ou expirada.') {
    super(message);
    this.name = 'UnauthorizedError';
    this.code = 'UNAUTHORIZED';
    this.statusCode = 401;
  }
}

function splitPasswordList(value) {
  return String(value || '')
    .split(/[,\n;]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getAuthConfig() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const passwordList = [
    ...splitPasswordList(process.env.ADMIN_PASSWORDS),
    ...splitPasswordList(process.env.ADMIN_PASSWORD),
  ];
  const passwords = [...new Set(passwordList)];
  const sessionSecret = String(process.env.ADMIN_SESSION_SECRET || '').trim();
  const missing = [];

  if (!email) missing.push('ADMIN_EMAIL');
  if (passwords.length === 0) missing.push('ADMIN_PASSWORD ou ADMIN_PASSWORDS');
  if (!sessionSecret) missing.push('ADMIN_SESSION_SECRET');

  return {
    email,
    passwords,
    sessionSecret,
    configured: missing.length === 0,
    missing,
  };
}

function requireAuthConfig() {
  const config = getAuthConfig();
  if (!config.configured) {
    throw new AuthConfigurationError(
      `Autenticacao administrativa nao configurada. Defina: ${config.missing.join(', ')}.`
    );
  }
  return config;
}

function parseBody(body) {
  if (!body) return {};

  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }

  return body;
}

function safeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left || ''), 'utf8');
  const rightBuffer = Buffer.from(String(right || ''), 'utf8');

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}

function base64UrlEncode(value) {
  return Buffer.from(value, 'utf8').toString('base64url');
}

function base64UrlDecode(value) {
  return Buffer.from(value, 'base64url').toString('utf8');
}

function signPayload(encodedPayload, secret) {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url');
}

function createSessionToken(email) {
  const { sessionSecret } = requireAuthConfig();
  const payload = {
    email,
    exp: Date.now() + SESSION_TTL_SECONDS * 1000,
  };
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signature = signPayload(encodedPayload, sessionSecret);
  return `${encodedPayload}.${signature}`;
}

function parseCookieHeader(cookieHeader) {
  return String(cookieHeader || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');
      if (separatorIndex === -1) return cookies;

      const key = part.slice(0, separatorIndex).trim();
      const value = part.slice(separatorIndex + 1).trim();
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function getCookieHeaderFromRequest(request) {
  if (!request) return '';

  if (typeof request.headers?.get === 'function') {
    return request.headers.get('cookie') || '';
  }

  return request.headers?.cookie || '';
}

function readSessionFromRequest(request) {
  const config = getAuthConfig();
  if (!config.configured) {
    return null;
  }

  const cookies = parseCookieHeader(getCookieHeaderFromRequest(request));
  const token = cookies[SESSION_COOKIE_NAME];
  if (!token) return null;

  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) return null;

  const expectedSignature = signPayload(encodedPayload, config.sessionSecret);
  if (!safeEqualText(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    if (!payload?.email || !payload?.exp) return null;
    if (payload.exp < Date.now()) return null;
    if (!safeEqualText(String(payload.email).toLowerCase(), config.email)) return null;

    return {
      email: config.email,
    };
  } catch {
    return null;
  }
}

function buildCookieAttributes(maxAgeSeconds) {
  const secure = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL);
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`,
  ];

  if (secure) {
    parts.push('Secure');
  }

  return parts.join('; ');
}

function buildSessionCookie(token) {
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

export function requireAdminSession(request) {
  requireAuthConfig();
  const session = readSessionFromRequest(request);
  if (!session) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function handleAuthRequest(method, body, request) {
  if (method === 'GET') {
    const session = readSessionFromRequest(request);
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
    const emailMatches = safeEqualText(email, config.email);
    const passwordMatches = config.passwords.some((candidate) => safeEqualText(password, candidate));

    if (!emailMatches || !passwordMatches) {
      throw new UnauthorizedError('Email ou senha incorretos.');
    }

    const token = createSessionToken(config.email);
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': buildSessionCookie(token),
      },
      payload: {
        authenticated: true,
        email: config.email,
        configured: true,
      },
    };
  }

  if (method === 'DELETE') {
    return {
      statusCode: 200,
      headers: {
        'Set-Cookie': buildClearedSessionCookie(),
      },
      payload: {
        authenticated: false,
        email: null,
        configured: getAuthStatus().configured,
      },
    };
  }

  return {
    statusCode: 405,
    payload: {
      error: 'Method not allowed',
    },
  };
}

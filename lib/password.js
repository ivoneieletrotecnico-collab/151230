import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384; // N
const SCRYPT_BLOCK_SIZE = 8; // r
const SCRYPT_PARALLEL = 1; // p

// Formato armazenado: scrypt$<N>$<r>$<p>$<saltHex>$<hashHex>
export function hashPassword(plainPassword) {
  const password = String(plainPassword || '');
  if (!password) {
    throw new Error('Senha vazia nao pode ser criptografada.');
  }

  const salt = randomBytes(16);
  const derived = scryptSync(password, salt, SCRYPT_KEYLEN, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLEL,
  });

  return [
    'scrypt',
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLEL,
    salt.toString('hex'),
    derived.toString('hex'),
  ].join('$');
}

export function verifyPassword(plainPassword, storedHash) {
  try {
    const password = String(plainPassword || '');
    const parts = String(storedHash || '').split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') {
      return false;
    }

    const [, cost, blockSize, parallel, saltHex, hashHex] = parts;
    const salt = Buffer.from(saltHex, 'hex');
    const expected = Buffer.from(hashHex, 'hex');
    const derived = scryptSync(password, salt, expected.length, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallel),
    });

    if (derived.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

export function isHashedPassword(value) {
  return /^scrypt\$/.test(String(value || ''));
}

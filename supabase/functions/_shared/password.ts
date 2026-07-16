import { scrypt } from 'npm:@noble/hashes/scrypt.js';
import { bytesToHex, hexToBytes, utf8ToBytes } from 'npm:@noble/hashes/utils.js';

const SCRYPT_KEYLEN = 64;
const SCRYPT_COST = 16384;
const SCRYPT_BLOCK_SIZE = 8;
const SCRYPT_PARALLEL = 1;

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function hashPassword(plainPassword: string): string {
  const password = String(plainPassword || '');
  if (!password) throw new Error('Senha vazia nao pode ser criptografada.');

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = scrypt(utf8ToBytes(password), salt, {
    N: SCRYPT_COST,
    r: SCRYPT_BLOCK_SIZE,
    p: SCRYPT_PARALLEL,
    dkLen: SCRYPT_KEYLEN,
  });

  return [
    'scrypt',
    SCRYPT_COST,
    SCRYPT_BLOCK_SIZE,
    SCRYPT_PARALLEL,
    bytesToHex(salt),
    bytesToHex(derived),
  ].join('$');
}

export function verifyPassword(plainPassword: string, storedHash: string): boolean {
  try {
    const password = String(plainPassword || '');
    const parts = String(storedHash || '').split('$');
    if (parts.length !== 6 || parts[0] !== 'scrypt') return false;

    const [, cost, blockSize, parallel, saltHex, hashHex] = parts;
    const salt = hexToBytes(saltHex);
    const expected = hexToBytes(hashHex);
    const derived = scrypt(utf8ToBytes(password), salt, {
      N: Number(cost),
      r: Number(blockSize),
      p: Number(parallel),
      dkLen: expected.length,
    });

    return timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

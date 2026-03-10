import { STANDARD_RECOMMENDED_PRESET, type HashPresetDefinition } from "@cloudflare-auth-hasher/contracts";
import { argon2idAsync } from "@noble/hashes/argon2.js";
import { scryptAsync } from "@noble/hashes/scrypt.js";
import { bytesToHex, hexToBytes, randomBytes, utf8ToBytes } from "@noble/hashes/utils.js";

const ARGON2_VERSION = 19;
const SALT_LENGTH = 16;
const MAX_PASSWORD_LENGTH = 1024;
const MAX_HASH_LENGTH = 4096;

const encoder = new TextEncoder();
const PHC_REGEX =
  /^\$(argon2id)\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$([A-Za-z0-9+/.-]+)\$([A-Za-z0-9+/.-]+)$/;

interface ParsedArgonHash {
  version: number;
  memoryKiB: number;
  iterations: number;
  parallelism: number;
  salt: Uint8Array;
  hash: Uint8Array;
}

const normalizePassword = (password: string): string => password.normalize("NFKC");

const validatePassword = (password: string): void => {
  if (password.length === 0) {
    throw new Error("Password must not be empty.");
  }

  if (encoder.encode(password).length > MAX_PASSWORD_LENGTH) {
    throw new Error(`Password exceeds the maximum supported length of ${MAX_PASSWORD_LENGTH} bytes.`);
  }
};

const validateHash = (hash: string): void => {
  if (hash.length === 0) {
    throw new Error("Hash must not be empty.");
  }

  if (hash.length > MAX_HASH_LENGTH) {
    throw new Error(`Hash exceeds the maximum supported length of ${MAX_HASH_LENGTH} bytes.`);
  }
};

const bytesToBase64NoPad = (bytes: Uint8Array): string => Buffer.from(bytes).toString("base64").replace(/=+$/u, "");

const base64NoPadToBytes = (value: string): Uint8Array => {
  const padded = value.padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(Buffer.from(padded, "base64"));
};

const timingSafeEqual = (left: Uint8Array, right: Uint8Array): boolean => {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left[index] ^ right[index];
  }

  return diff === 0;
};

const parseArgonHash = (hash: string): ParsedArgonHash => {
  const match = PHC_REGEX.exec(hash);
  if (!match) {
    throw new Error("Unsupported password hash format.");
  }

  const [, algorithm, version, memoryKiB, iterations, parallelism, saltB64, hashB64] = match;
  if (algorithm !== "argon2id") {
    throw new Error(`Unsupported Argon2 variant '${algorithm}'.`);
  }

  return {
    version: Number(version),
    memoryKiB: Number(memoryKiB),
    iterations: Number(iterations),
    parallelism: Number(parallelism),
    salt: base64NoPadToBytes(saltB64),
    hash: base64NoPadToBytes(hashB64)
  };
};

const formatArgonHash = (salt: Uint8Array, hash: Uint8Array, preset: HashPresetDefinition): string => {
  const params = preset.argon2id;
  return [
    "$argon2id",
    `v=${ARGON2_VERSION}`,
    `m=${params.memoryKiB},t=${params.iterations},p=${params.parallelism}`,
    bytesToBase64NoPad(salt),
    bytesToBase64NoPad(hash)
  ].join("$");
};

export const hashPassword = async (
  password: string,
  preset: HashPresetDefinition = STANDARD_RECOMMENDED_PRESET
): Promise<string> => {
  validatePassword(password);
  const normalized = normalizePassword(password);
  const salt = randomBytes(SALT_LENGTH);
  const hash = await argon2idAsync(normalized, salt, {
    m: preset.argon2id.memoryKiB,
    t: preset.argon2id.iterations,
    p: preset.argon2id.parallelism,
    dkLen: preset.argon2id.outputLength,
    version: ARGON2_VERSION,
    asyncTick: 10
  });

  return formatArgonHash(salt, hash, preset);
};

const verifyArgonHash = async (hash: string, password: string): Promise<boolean> => {
  const parsed = parseArgonHash(hash);
  const normalized = normalizePassword(password);
  const actual = await argon2idAsync(normalized, parsed.salt, {
    m: parsed.memoryKiB,
    t: parsed.iterations,
    p: parsed.parallelism,
    dkLen: parsed.hash.length,
    version: parsed.version,
    asyncTick: 10
  });

  return timingSafeEqual(actual, parsed.hash);
};

const verifyLegacyScrypt = async (
  hash: string,
  password: string,
  preset: HashPresetDefinition
): Promise<boolean> => {
  const [salt, keyHex] = hash.split(":");
  if (!salt || !keyHex) {
    throw new Error("Invalid legacy scrypt hash format.");
  }

  const expected = hexToBytes(keyHex);
  const derived = await scryptAsync(normalizePassword(password), salt, {
    N: 2 ** preset.legacyScrypt.logN,
    r: preset.legacyScrypt.r,
    p: preset.legacyScrypt.p,
    dkLen: preset.legacyScrypt.outputLength,
    asyncTick: 10
  });

  return timingSafeEqual(derived, expected);
};

export const verifyPassword = async (
  hash: string,
  password: string,
  preset: HashPresetDefinition = STANDARD_RECOMMENDED_PRESET
): Promise<boolean> => {
  validatePassword(password);
  validateHash(hash);

  if (hash.startsWith("$argon2")) {
    return verifyArgonHash(hash, password);
  }

  if (hash.includes(":")) {
    return verifyLegacyScrypt(hash, password, preset);
  }

  throw new Error("Unsupported password hash format.");
};

export const createLegacyScryptHashForTests = async (
  password: string,
  salt: string,
  preset: HashPresetDefinition = STANDARD_RECOMMENDED_PRESET
): Promise<string> => {
  const derived = await scryptAsync(normalizePassword(password), salt, {
    N: 2 ** preset.legacyScrypt.logN,
    r: preset.legacyScrypt.r,
    p: preset.legacyScrypt.p,
    dkLen: preset.legacyScrypt.outputLength,
    asyncTick: 10
  });

  return `${salt}:${bytesToHex(derived)}`;
};

export const passwordByteLength = (password: string): number => utf8ToBytes(password).length;

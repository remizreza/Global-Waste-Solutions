import crypto, { createHmac, timingSafeEqual } from "crypto";

const ADMIN_TOKEN_TTL_MS = 1000 * 60 * 60 * 8;
const DEFAULT_ADMIN_USERNAME = "Remiz";
const DEFAULT_ADMIN_PASSWORD = "Remiz123312";
const DEFAULT_ADMIN_TOKEN_SECRET = "redoxy-admin-fallback-token-secret";

type AdminCredentials = {
  username: string;
  password?: string;
  passwordHash?: string;
  tokenSecret: string;
};

function timingSafeEqualText(left: string, right: string): boolean {
  const provided = Buffer.from(left, "utf8");
  const expected = Buffer.from(right, "utf8");
  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

function getConfiguredAdminCredentials(): AdminCredentials {
  const username = process.env.ADMIN_USERNAME?.trim() || DEFAULT_ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_ADMIN_PASSWORD;
  const passwordHash = process.env.ADMIN_PASSWORD_HASH?.trim() || undefined;
  const tokenSecret =
    process.env.ADMIN_TOKEN_SECRET?.trim() || DEFAULT_ADMIN_TOKEN_SECRET;

  return {
    username,
    password: passwordHash ? undefined : password,
    passwordHash,
    tokenSecret,
  };
}

function signTokenPayload(payload: string, tokenSecret: string) {
  return createHmac("sha256", tokenSecret).update(payload).digest("hex");
}

function verifyPassword(password: string, credentials: AdminCredentials): boolean {
  if (credentials.passwordHash) {
    const [salt, expectedHex] = credentials.passwordHash.split(":");
    if (!salt || !expectedHex) return false;

    const derived = crypto.scryptSync(password, salt, 64).toString("hex");
    const provided = Buffer.from(derived, "hex");
    const expected = Buffer.from(expectedHex, "hex");
    if (provided.length !== expected.length) return false;
    return timingSafeEqual(provided, expected);
  }

  if (!credentials.password) return false;
  return timingSafeEqualText(password, credentials.password);
}

export function createAdminToken(username: string) {
  const { tokenSecret } = getConfiguredAdminCredentials();
  const expiresAt = Date.now() + ADMIN_TOKEN_TTL_MS;
  const payload = `${username}|${expiresAt}`;
  const signature = signTokenPayload(payload, tokenSecret);
  return Buffer.from(`${payload}|${signature}`).toString("base64url");
}

export function getAdminTokenTtlMs() {
  return ADMIN_TOKEN_TTL_MS;
}

export function validateAdminCredentials(username: string, password: string) {
  const credentials = getConfiguredAdminCredentials();
  return (
    username.trim().toLowerCase() === credentials.username.toLowerCase() &&
    verifyPassword(password.trim(), credentials)
  );
}

export function isAdminAuthConfigured() {
  const credentials = getConfiguredAdminCredentials();
  return Boolean(
    credentials.username &&
      credentials.tokenSecret &&
      (credentials.password || credentials.passwordHash),
  );
}

export function isAdminAuthorized(authorization: string | undefined): boolean {
  const credentials = getConfiguredAdminCredentials();
  if (!authorization) return false;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) return false;

  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const [username, expiresAtRaw, signature] = decoded.split("|");
    if (!username || !expiresAtRaw || !signature) return false;

    const payload = `${username}|${expiresAtRaw}`;
    const expectedSignature = signTokenPayload(payload, credentials.tokenSecret);
    const provided = Buffer.from(signature, "utf8");
    const expected = Buffer.from(expectedSignature, "utf8");
    if (provided.length !== expected.length) return false;
    if (!timingSafeEqual(provided, expected)) return false;

    const expiresAt = Number(expiresAtRaw);
    return Number.isFinite(expiresAt) && Date.now() <= expiresAt;
  } catch {
    return false;
  }
}

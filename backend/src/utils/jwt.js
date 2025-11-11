import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";

if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn("⚠️  WARNING: JWT_SECRET not set in .env. Using fallback secret. Set JWT_SECRET in backend/.env for production!");
}

export function signJwt(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    ...options,
  });
}

export function verifyJwt(token) {
  const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-change-in-production";
  return jwt.verify(token, JWT_SECRET);
}



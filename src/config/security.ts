/**
 * Security configuration for AV Safeguard
 * This file contains security-related settings and best practices
 */

// CSP (Content Security Policy) headers configuration
export const CSP_HEADERS = {
  "Content-Security-Policy": [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' http://localhost:* ws://localhost:*",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
};

// CORS configuration
export const CORS_CONFIG = {
  origin: process.env.VITE_ALLOWED_ORIGINS?.split(",") || ["http://localhost:5173"],
  credentials: true,
  optionsSuccessStatus: 200,
};

// Request validation rules
export const REQUEST_VALIDATION_RULES = {
  maxBodySize: "10mb",
  maxJsonSize: "5mb",
  timeout: 30000,
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
};

// Export security middleware factory
export const createSecurityHeaders = () => ({
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
});

// API request validation helper
export const validateApiRequest = (data: unknown): data is Record<string, unknown> => {
  return typeof data === "object" && data !== null;
};

// Safe JSON parsing with error handling
export const safeJsonParse = (json: string, fallback = {}) => {
  try {
    return JSON.parse(json);
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
};

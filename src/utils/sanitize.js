/**
 * Basic XSS sanitization utility
 * Escapes HTML special characters to prevent XSS attacks
 */

const escapeHtml = (text) => {
  if (typeof text !== "string") return text;

  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Sanitize an object recursively
 */
export const sanitizeInput = (obj) => {
  if (typeof obj === "string") {
    return escapeHtml(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput);
  }

  if (obj !== null && typeof obj === "object") {
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeInput(obj[key]);
      }
    }
    return sanitized;
  }

  return obj;
};

/**
 * Middleware to sanitize request body
 */
export const sanitizeMiddleware = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  next();
};

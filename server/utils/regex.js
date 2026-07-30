/**
 * Safe Regex Builder to prevent ReDoS (Regular Expression Denial of Service)
 * Escapes regex metacharacters and caps query string length.
 */
function buildSafeRegexQuery(input = '') {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim().slice(0, 50);
  if (!trimmed) return null;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(escaped, 'i');
}

module.exports = { buildSafeRegexQuery };

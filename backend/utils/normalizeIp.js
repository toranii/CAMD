// ── backend/utils/normalizeIp.js ────────────────────────────
module.exports = function normalizeIp(rawIp) {
  if (!rawIp) return null;

  // 1) ::1  →  127.0.0.1
  if (rawIp === '::1') return '127.0.0.1';

  // 2) IPv4‑mapped IPv6  (::ffff:192.168.0.10  등)
  if (rawIp.startsWith('::ffff:')) return rawIp.split(':').pop();

  // 3) 일반 IPv4 그대로 반환,   순수 IPv6 는 그대로 두거나 null 처리
  return rawIp.includes('.') ? rawIp : null; // ← “IPv4만 남긴다”는 요구면
  // return rawIp;                             // ← IPv6 도 허용하려면
};

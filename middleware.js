// Password gate in front of the admin page. The password is the
// ADMIN_GATE_PASSWORD environment variable on Vercel, not anything in this
// repo. Only these two paths are checked; the rest of the site is untouched.
// Fails closed: with no password configured, nobody gets in.
export const config = { matcher: ['/admin.html', '/admin'] };

function same(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export default function middleware(request) {
  const expected = process.env.ADMIN_GATE_PASSWORD;
  const header = request.headers.get('authorization') || '';
  if (expected && header.startsWith('Basic ')) {
    try {
      const decoded = atob(header.slice(6));
      // "username:password": any username is fine, only the password counts.
      const password = decoded.slice(decoded.indexOf(':') + 1);
      if (same(password, expected)) return;
    } catch {}
  }
  return new Response('Password required', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Rounds admin"', 'Cache-Control': 'no-store' },
  });
}

// Cliente HTTP: usa cookie httpOnly (credentials: 'include') e a URL do .env
const BASE = import.meta.env.VITE_API_URL || '/api';

async function req(method, path, body) {
  const r = await fetch(BASE + path, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  if (r.status === 204) return null;
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    if (r.status === 401 && !path.startsWith('/auth/')) window.dispatchEvent(new Event('sessao-expirada'));
    const e = new Error(data.erro || 'Erro na requisição.');
    e.status = r.status;
    throw e;
  }
  return data;
}

export const api = {
  get: (p) => req('GET', p),
  post: (p, b) => req('POST', p, b),
  put: (p, b) => req('PUT', p, b),
  del: (p) => req('DELETE', p),
};

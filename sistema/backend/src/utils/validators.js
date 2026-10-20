export function cpfValido(cpf = '') {
  const n = String(cpf).replace(/\D/g, '');
  if (n.length !== 11 || /^(\d)\1{10}$/.test(n)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(n[i]) * (t + 1 - i);
    if (((soma * 10) % 11) % 10 !== Number(n[t])) return false;
  }
  return true;
}

export const placaValida = (p = '') => /^[A-Z]{3}\d[A-Z0-9]\d{2}$/.test(p);
export const emailValido = (e = '') => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
export const senhaForte = (s = '') => s.length >= 8 && /[A-Za-z]/.test(s) && /\d/.test(s);

// "2026-10-26T09:00" -> "2026-10-26 09:00:00" (ou null se inválido)
export function dataHoraSql(v = '') {
  const m = /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2})/.exec(String(v));
  if (!m || Number.isNaN(Date.parse(`${m[1]}T${m[2]}`))) return null;
  return `${m[1]} ${m[2]}:00`;
}

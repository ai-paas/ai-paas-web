export function formatPhone(phone?: string, opts?: { maskMiddle?: boolean }): string {
  if (!phone) return '';
  const d = phone.replace(/\D/g, ''); // 숫자만 추출
  const mask = opts?.maskMiddle;

  const fmt = (a: string, b: string, c: string) =>
    mask ? `${a}-${b.replace(/\d/g, '*')}-${c}` : `${a}-${b}-${c}`;

  // 02 지역번호(서울)
  if (d.startsWith('02')) {
    if (d.length === 10) return fmt('02', d.slice(2, 6), d.slice(6)); // 02-1234-5678
    if (d.length === 9) return fmt('02', d.slice(2, 5), d.slice(5)); // 02-123-4567
  }

  // 휴대폰/기타 3자리 지역번호
  if (d.length === 11) return fmt(d.slice(0, 3), d.slice(3, 7), d.slice(7)); // 010-1234-5678
  if (d.length === 10) return fmt(d.slice(0, 3), d.slice(3, 6), d.slice(6)); // 031-123-4567

  // 대표번호/특수번호: 1588-1234, 1577-xxxx, 16xx-xxxx 등
  if (/^1[5-8]\d{6}$/.test(d)) return `${d.slice(0, 4)}-${d.slice(4)}`;

  // 형식 모호하면 원문 반환
  return phone;
}

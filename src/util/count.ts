/**
 * 숫자를 단위와 함께 포맷팅합니다.
 *
 * @param formatNumber - 포맷팅할 숫자
 * @returns 단위가 포함된 포맷팅된 문자열
 *
 * @example
 * formatCount(500)        // "500"
 * formatCount(1500)       // "1.5K"
 * formatCount(1000000)    // "1M"
 * formatCount(2500000)    // "2.5M"
 * formatCount(1000000000) // "1B"
 */
export function formatCount(formatNumber: number) {
  if (formatNumber < 1000) {
    return formatNumber.toString();
  }

  const units = ['', 'K', 'M', 'B', 'T'];
  let unitIndex = 0;
  let number = formatNumber;

  while (number >= 1000 && unitIndex < units.length - 1) {
    number /= 1000;
    unitIndex++;
  }

  const formatted = number % 1 === 0 ? number.toString() : number.toFixed(1);

  return `${formatted}${units[unitIndex]}`;
}
